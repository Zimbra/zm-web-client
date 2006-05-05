/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
* Does nothing.
* @constructor
* @class
* Static class that provides initial login support. The user will typically
* get here from Login.jsp calling the onload handler. If auth succeeds, redirects
* to zimbra/mail. If auth fails, displays the appropriate message.
* <p>
* Also handles if session has timed out and the user hits the back button.
* To do this, it sends a noop request just to see if the server chokes
* on the auth token.</p>
* <p>
* TODO:
*  - parse the query string, look for whether the page is standalone, or
*    if the app has opened a window to it.
*  - handle 3 different modes - HTTP, HTTP->Login via HTTPS->HTTP, HTTPS
* </p>
*/
 
ZmLogin = function() {}

ZmLogin.lastGoodUserNameCookie   = "ls_last_username";
ZmLogin.lastGoodMailServerCookie = "ls_last_server";
ZmLogin.CSFE_SERVER_URI = location.port == "80" ? "/service/soap/" : ":" + location.port + "/service/soap/";
ZmLogin.ZIMBRA_APP_URI  = location.port == "80" ? appContextPath+"/mail" : ":" + location.port + appContextPath+"/mail";
ZmLogin.MAILBOX_REGEX =/^([a-zA-Z0-9_\.\-])+(\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+)?$/;

/**
* Puts up the auth screen, first checking to see if the browser is one we support.
*
* @param ev					[Event]		onload event
* @param skipBrowserCheck	[boolean]	if true, don't check browser version
*/
ZmLogin.handleOnload = 
function(ev, skipBrowserCheck) {
	if (!skipBrowserCheck && !ZmLogin.isSupportedBrowser()) {
		ZmLogin.showUnsupported();
	} else {
		if (ZmLogin.shouldReAuth())
			ZmLogin.showPanel();
	}
};

/**
* Returns true if user agent is supported.
*/
ZmLogin.isSupportedBrowser = 
function() {
	return AjxEnv.isIE6up || AjxEnv.isMozilla1_4up || AjxEnv.isFirefox || AjxEnv.isSafari;
};

/**
* Returns true if user agent is partially supported.
*/
ZmLogin.isAlmostSupportedBrowser = 
function() {
	return AjxEnv.isOpera;
};

/**
* Displays error message for an unsupported or partially supported browser.
*/
ZmLogin.showUnsupported = 
function() {
	var errorStr = AjxMessageFormat.format(ZmMsg.errorBrowserUnsupported, [navigator.appName, navigator.appVersion]);

	var tip;
	if (ZmLogin.isAlmostSupportedBrowser()) {
		tip = AjxMessageFormat.format(ZmMsg.almostSupportedBrowserTip, ["ZmLogin.handleOnload(null, true);"]);
	} else {
		tip = ZmMsg.unsupportedBrowserTip;
	}
	
	var html = [];
	idx = 0;
	
	html[idx++] = "<table border=0 cellspacing=0 cellpadding=0 style='width:100%; height:100%'><tr><td>";
	html[idx++] = "<table width=450 align=center border=0 cellspacing=0 cellpadding=0 style='border: 2px solid; border-color: #C7C7C7 #3E3E3E #3E3E3E #C7C7C7;'>";
	html[idx++] = "<tr><td bgcolor='#FFFFFF'><div class='banner'></div></td></tr>";
	html[idx++] = "<tr><td class='LoginMainPanel' align=center><div class='error'>";
	html[idx++] = "<table border=0 cellpadding=2 cellspacing=2><tr>";
	html[idx++] = "<td valign=top width=40><img src='";
	html[idx++] = appContextPath;
	html[idx++] = "/img/loRes/dwt/Critical_32.gif' width=32 height=32></td>";
	html[idx++] = "<td>";
	html[idx++] = errorStr;
	html[idx++] = "</td></tr></table>";
	html[idx++] = "</div><p>";
	html[idx++] = "<div style='text-align:left; width:85%'>";
	html[idx++] = tip;
	html[idx++] = "</div><br>";
	html[idx++] = "<div class='LoginPanelLicense'>";
	html[idx++] = ZmMsg.splashScreenCopyright;
	html[idx++] = "</div>";
	html[idx++] = "</td></tr>";
	html[idx++] = "</table>";
	html[idx++] = "</td></tr></table>";

	document.body.innerHTML = html.join("");
};

/**
* Performs a test poll to see if the user has a valid auth token. Returns true
* if that is not the case. If the user has a valid auth token, redirects to the
* mail app.
*/
ZmLogin.shouldReAuth = 
function() {
	ZmLogin.setServerUri();
	var authToken = ZmCsfeCommand.getAuthToken();
	if (authToken) {
		DBG.println(AjxDebug.DBG1, "ZmLogin: user already has auth token");
		// check the server we're using
		var mailServer = AjxCookie.getCookie(document, ZmLogin.lastGoodMailServerCookie);
		try {
			// if we have info, just check token hasn't expired w/ no op request
			ZmLogin.submitNoOpRequest();
			ZmLogin.handleSuccess(authToken, null, mailServer);
			return false;
		} catch (ex) {
			DBG.dumpObj(ex);
			// auth token was invalid - show login screen
		}
	}
	return true;
};

/**
* Displays the login screen.
*/
ZmLogin.showPanel = 
function() {

	var html = [];
	var idx = 0;
	
	html[idx++] = "<table border=0 cellspacing=0 cellpadding=0 style='width:100%; height:100%'><tr><td>";
	html[idx++] = "<table align=center border=0 cellspacing=0 cellpadding=0 class='LoginPanel'>";
//MOW: Make AppName and ShortVersion dynamic!!!!
	html[idx++] = "<tr><td align=center style='position:relative'><div class='LoginPanelBanner'><div class='LoginPanelAppName'>Collaboration Suite</div><div class='LoginPanelShortVersion'></div></div></td></tr>";
	html[idx++] = "<tr><td id='loginPanel' class='LoginMainPanel'>";
	// error message div
	html[idx++] = "<center><div class='error' style='display:none' id='errorMessageContainer'>";
	html[idx++] = "<table border=0 cellpadding=2 cellspacing=2><tr>";
	html[idx++] = "<td valign=top width=40><img src='";
	html[idx++] = appContextPath;
	html[idx++] = "/img/loRes/dwt/Critical_32.gif' id='errorIcon' width=32 height=32></td>";
	html[idx++] = "<td id='errorMessage'>";
	html[idx++] = "</td></tr></table>";
	html[idx++] = "</div></center>";
	// real content
	html[idx++] = "<table id='passTable' class='LoginPanelTable' border=0>";
	html[idx++] = "<tr height=40>";
	html[idx++] = "<td width=100 align=right>";
	html[idx++] = ZmMsg.username;
	html[idx++] = ":</td>";
	html[idx++] = "<td><input style='width:100%' autocomplete=OFF type=text tabIndex=1 id='uname'></td>";
	html[idx++] = "<td><div class='LoginPanelFormSpacer'></div></td>";
	html[idx++] = "</tr><tr height=30>";
	html[idx++] = "<td align=right width=100>";
	html[idx++] = ZmMsg.password;
	html[idx++] = ":</td>";
	html[idx++] = "<td><input style='width:100%' type=password tabIndex=2 id='pass'></td>";
	html[idx++] = "</tr><tr><td></td>";
	html[idx++] = "<td><table border=0 width=100%><tr height=28><td width=1><input style='width:13px' id='rememberMe' type='checkbox'></td>";
	html[idx++] = "<td style='width:1px' width=1><nobr>";
	html[idx++] = ZmMsg.rememberMe;
	html[idx++] = "</td>";
	html[idx++] = "<td width=100%></td>";
	html[idx++] = "<td>";
	// logon button starts here
	html[idx++] = "<div id='loginButton' class='DwtButton' style='text-align:center; cursor:default' ";
	html[idx++] = "onclick='javascript:ZmLogin.handleLogin(); return false;' ";
	html[idx++] = "onmouseover='javascript:this.className=\"DwtButton-activated\";' ";
	html[idx++] = "onmouseout='javascript:this.className=\"DwtButton\";' ";
	html[idx++] = "onmousedown='javascript:this.className=\"DwtButton-triggered\"; return false;' ";
	html[idx++] = "onmouseup='javascript:this.className=\"DwtButton\";' ";
	html[idx++] = "onmousemove='javascript:return false;' ";
	html[idx++] = "onselectstart='javascript: return false;' ";
	html[idx++] = "onfocus='javascript:ZmLogin.loginButtonFocus(this.parentNode);return false;' ";
	html[idx++] = "onblur='javascript:ZmLogin.loginButtonBlur(this.parentNode);return false;'";
	html[idx++] = "><table style='width:100%;height:100%'><tr><td class='Text' align=center>";
	html[idx++] = ZmMsg.login;
	// non-IE browsers dont allow focus for non-INPUT elements so we have to 
	// create a hidden input to fake focus for our DIV which acts as an input button
	if (!AjxEnv.isIE)
		html[idx++] = "<input type='button' style='display:none' id='hiddenButton'>";
	html[idx++] = "</td></tr></table></div></td>";
	
	html[idx++] = "</tr></table>";
	html[idx++] = "</td></tr></table>";
	html[idx++] = "</td></tr>";
	html[idx++] = "<tr><td class='LoginPanelLicense'>";
	html[idx++] = ZmMsg.splashScreenCopyright;
	html[idx++] = "</td></tr>";
	html[idx++] = "</table>";
	html[idx++] = "</td></tr></table>";
	document.body.innerHTML = html.join("");

	ZmLogin._registerKeyPress();
	ZmLogin._setUserNameAndFocus();
};

/*
* Sets up a key press handler.
*/
ZmLogin._registerKeyPress = 
function() {
	if (AjxEnv.isIE) {
		var el = document.getElementById("loginPanel");
		el["onkeydown"] = ZmLogin.handleKeyPress;
	} else {
		window["onkeypress"] = ZmLogin.handleKeyPress;
	}
};

/*
* Sets the focus to the password field if the username field has been
* pre-filled, and to the username field otherwise.
*/
ZmLogin._setUserNameAndFocus = 
function() {
	var lastUser = AjxCookie.getCookie(document, ZmLogin.lastGoodUserNameCookie);
	var focusEl = null;
	// if we have a username, fill out the username field, and focus on the 
	// password field. Otherwise focus on the username field. 
	if (lastUser && lastUser != "") {
		document.getElementById("uname").value = lastUser;
		focusEl = document.getElementById("pass");
	} else {
		focusEl = document.getElementById("uname");
	}
    focusEl.focus();
};

/*
* Fills in the error message panel with some text.
*
* @param msg		[string]	error text
* @param skipFocus	[boolean]	if true, don't set focus to username field
*/
ZmLogin._setErrorMessage = 
function(msg, skipFocus) {
	var errCell = document.getElementById("errorMessage");
	errCell.innerHTML = msg;
	document.getElementById("errorMessageContainer").style.display = "block";

	if (!skipFocus)
		document.getElementById("uname").focus();
	
	ZmLogin._flickerErrorMessagePanel();
};

/*
* Hide error panel very briefly, making it look like something happened if 
* user has successive errors.
*/
ZmLogin._flickerErrorMessagePanel = 
function() {
	document.getElementById("errorMessageContainer").style.visibility = "hidden";
	window.setTimeout(ZmLogin._showErrorMessagePanel, 5);
};

ZmLogin._showErrorMessagePanel = 
function() {
	document.getElementById("errorMessageContainer").style.visibility = "visible";
};

ZmLogin.setServerUri = 
function() {
	var value = location.protocol + "//" + location.hostname + ZmLogin.CSFE_SERVER_URI;
	if (location.search && location.search.indexOf("host=") != -1)
		value += location.search;
    ZmCsfeCommand.setServerUri(value);
};

ZmLogin.cancelEvent = 
function(ev) {
	if (ev.stopPropagation)
		ev.stopPropagation();
		
	if (ev.preventDefault)
		ev.preventDefault();

	ev.cancelBubble = true;
	ev.returnValue = false;
}

ZmLogin.handleKeyPress = 
function(ev) {
    ev = ev || window.event;
    if (ev == null) return true;
    
    var target = ev.target ? ev.target: ev.srcElement;
    if (!target) return true;
    
    var keyCode = ev.keyCode;
    if (keyCode == 13) { // Enter
		if (target.id == "uname") {
			document.getElementById("pass").focus();
		} else if (target.id == "rememberMe") {
			target.checked = !target.checked;
		} else if (target.id == "passNew") {
			document.getElementById("passConfirm").focus();
		} else {
			ZmLogin.handleLogin();
		}
		ZmLogin.cancelEvent(ev);
		return false;
	} else if (keyCode == 9) { // Tab
		var shiftKey = ev.shiftKey;
		if (target.id == "uname") {
			if (!shiftKey) {
				document.getElementById("pass").focus();
			} else {
				ZmLogin._focusLoginButton(target);
			}
		} else if (target.id == "pass") {
			var obj = !shiftKey 
				? document.getElementById("rememberMe")
				: document.getElementById("uname");
			obj.focus();
		} else if (target.id == "rememberMe") {
			if (!shiftKey) {			
				ZmLogin._focusLoginButton(target);
			} else {
				var obj = document.getElementById("pass");
				if (obj.disabled)
					obj = document.getElementById("passConfirm");
				obj.focus();
			}
		} else if (target.id == "passNew") {
			if (!shiftKey) {
				document.getElementById("passConfirm").focus();
			} else {
				ZmLogin._focusLoginButton(target);
			}
		} else if (target.id == "passConfirm") {
			var obj = !shiftKey
				 ? document.getElementById("rememberMe")
				 : document.getElementById("passNew");
			obj.focus();
		} else {
			if (!shiftKey) {
				var obj = document.getElementById("uname");
				if (obj.disabled) {
					obj = document.getElementById("passNew");
				} else {
					if (!AjxEnv.isIE) {
						var button = document.getElementById("loginButton");
						ZmLogin.loginButtonBlur(button.parentNode);
					}
				}
				obj.focus();
			} else {
				document.getElementById("rememberMe").focus();
			}
		}
		ZmLogin.cancelEvent(ev);
		return false;
    }
    return true;
};

ZmLogin._focusLoginButton = 
function(target) {
	var button = document.getElementById("loginButton");
	if (AjxEnv.isIE) {
		button.focus();
	} else {
		ZmLogin.loginButtonFocus(button.parentNode);
		target.blur();
		document.getElementById('hiddenButton').focus();
	}
};

ZmLogin.loginButtonFocus = 
function(border) {
	border.className = "focusBorder";
};

ZmLogin.loginButtonBlur = 
function(border) {
	border.className = "";	
};

ZmLogin.submitNoOpRequest = 
function() {
    var soapDoc = AjxSoapDoc.create("NoOpRequest", "urn:zimbraMail");
	var command = new ZmCsfeCommand();
	command.invoke({soapDoc: soapDoc, asyncMode: true});
};

ZmLogin.submitAuthRequest = 
function(uname, pword) {
	try {
	    var soapDoc = AjxSoapDoc.create("AuthRequest", "urn:zimbraAccount");
	} catch (ex) {
		if (AjxEnv.isIE && (ex.code == AjxException.INTERNAL_ERROR))
			ZmLogin._setErrorMessage(ZmMsg.errorNoActiveX);
		return;
	}

    var el = soapDoc.set("account", uname);
    el.setAttribute("by", "name");
    soapDoc.set("password", pword);
    soapDoc.set("virtualHost", location.hostname);

	var command = new ZmCsfeCommand();
	var respCallback = new AjxCallback(null, ZmLogin._handleResponseSubmitAuthRequest, [uname, pword]);
	command.invoke({soapDoc: soapDoc, noAuthToken: true, noSession: true, asyncMode: true, callback: respCallback});
}

ZmLogin._handleResponseSubmitAuthRequest =
function(uname, pword, result) {
	var response;
	try {
		response = result.getResponse();
	} catch (ex) {
		DBG.dumpObj(ex);
		if (ex.code == ZmCsfeException.ACCT_AUTH_FAILED || ex.code == ZmCsfeException.NO_SUCH_ACCOUNT) {
			ZmLogin._setErrorMessage(ZmMsg.loginError);
		} else if (ex.code == ZmCsfeException.SOAP_ERROR || ex.code == ZmCsfeException.NETWORK_ERROR) {
			var msg = ZmMsg.errorNetwork + " " + ZmMsg.errorTryAgain + " " + ZmMsg.errorContact;
			ZmLogin._setErrorMessage(msg);
		} else if (ex.code == ZmCsfeException.ACCT_CHANGE_PASSWORD)	{
			var unameField = document.getElementById("uname");
			var pwordField = document.getElementById("pass");

			// disable username and password fields
			unameField.disabled = pwordField.disabled = true;
			ZmLogin.showChangePass(ex);
		} else if (ex.code == ZmCsfeException.ACCT_MAINTENANCE_MODE) {
			var msg = ZmMsg.errorMaintenanceMode + " " + ZmMsg.errorContact;
			ZmLogin._setErrorMessage(msg);
		} else {
			var msg = ZmMsg.errorApplication + " " + ZmMsg.errorTryAgain + " " + ZmMsg.errorContact;
			ZmLogin._setErrorMessage(msg + " (" + ex.code + ")");
		}
		return;
	}
	var resp = response.Body.AuthResponse;
	ZmLogin._authToken = resp.authToken;
	ZmLogin._authTokenLifetime = resp.lifetime;
	var mailServer = resp.refer;

	var match = location.search ? location.search.match(/\bredirect=([01])/) : null;
	var redirect = match ? match[1] : null;
	if (redirect == '0' || (location.hostname == "localhost") || (location.hostname && location.hostname.match(/^\d+\.\d+\.\d+\.\d+$/))) {
		if (redirect != '1') mailServer = location.hostname;
	}

	var rmChecked = document.getElementById("rememberMe").checked;
	ZmLogin.handleSuccess(ZmLogin._authToken, ZmLogin._authTokenLifetime, mailServer, uname, pword, rmChecked);
	ZmLogin._authToken = ZmLogin._authTokenLifetime = null;
};

ZmLogin.isValidUsername = 
function(uname) {
	return uname.match(ZmLogin.MAILBOX_REGEX);
};

ZmLogin.handleLogin = 
function() {
	var unameField = document.getElementById("uname");
	var pwordField = document.getElementById("pass");
    var uname = unameField.value;
    var pword = pwordField.value;
	

	// check if we're trying to change the password
	if (unameField.disabled && pwordField.disabled) {
		ZmLogin.handleChangePass(uname, pword);
		return;
	}

    // check uname and pword first
    if (!ZmLogin.isValidUsername(uname)) {
		ZmLogin._setErrorMessage(ZmMsg.badUsername);
		return;
    }

    if (!uname || !pword) {
		ZmLogin._setErrorMessage(ZmMsg.enterUsername);
		return;
    }

	ZmLogin.submitAuthRequest(uname, pword);
};

ZmLogin.handleSuccess = 
function(authToken, tokenLifetime, mailServer, uname, password, rememberMe) {
	var uri = ZmLogin.getMailUrl(mailServer);
	// save the username for later use
	if (uname)
		AjxCookie.setCookie(document, ZmLogin.lastGoodUserNameCookie, uname, null, "/");

	if (mailServer)
		AjxCookie.setCookie(document, ZmLogin.lastGoodMailServerCookie, mailServer, null, "/");

	if (window.initMode != "" && (window.initMode != location.protocol))
		AjxDebug.deleteWindowCookie();

	// make sure we add the query string to the new page
	ZmLogin._postAuthToServer(mailServer, authToken, tokenLifetime, rememberMe);
};

ZmLogin.handleChangePass = 
function(uname, oldPass) {
	// error check new and confirmation password
	var newPassField = document.getElementById("passNew");
	var conPassField = document.getElementById("passConfirm");
	var newPass = AjxStringUtil.trim(newPassField.value);
	var conPass = AjxStringUtil.trim(conPassField.value);
	
	if (!newPass || !conPass) {
		ZmLogin._setErrorMessage(ZmMsg.enterNewPassword, true);
		return;
	}
	
	if (newPass != conPass) {
		ZmLogin._setErrorMessage(ZmMsg.bothNewPasswordsMustMatch, true);
		return;
	}

    var soapDoc = AjxSoapDoc.create("ChangePasswordRequest", "urn:zimbraAccount");
    var el = soapDoc.set("account", uname);
    el.setAttribute("by", "name");
    soapDoc.set("oldPassword", oldPass);
    soapDoc.set("password", newPass);
    var resp = null;
    try {
		var command = new ZmCsfeCommand();
		resp = command.invoke({soapDoc: soapDoc, noAuthToken: true, noSession: true}).Body.ChangePasswordResponse;
    } catch (ex) {
		DBG.dumpObj(ex);
		// XXX: for some reason, ZmCsfeException consts are fubar
		if (ex.code == "account.PASSWORD_RECENTLY_USED" ||
			ex.code == "account.PASSWORD_CHANGE_TOO_SOON")
		{
			var msg = ex.code == ZmCsfeException.ACCT_PASS_RECENTLY_USED
				? ZmMsg.errorPassRecentlyUsed
				: (ZmMsg.errorPassChangeTooSoon + " " + errorContact);
			ZmLogin._setErrorMessage(msg);
			newPassField.value = conPassField.value = "";
			newPassField.focus();
		}
		else if (ex.code == "account.PASSWORD_LOCKED")
		{
			// remove the new password and confirmation fields
			var passTable = document.getElementById("passTable");
			passTable.deleteRow(2);
			passTable.deleteRow(2);

			// re-enable username and password fields
			var unameField = document.getElementById("uname");
			var pwordField = document.getElementById("pass");
			unameField.disabled = pwordField.disabled = false;
			pwordField.value = "";
			pwordField.focus();
			
			ZmLogin._setErrorMessage(ZmMsg.errorPassLocked);
		}
		else if (ex.code == "account.INVALID_PASSWORD")
		{
			ZmLogin._setErrorMessage(ZmMsg.errorInvalidPass);
			newPassField.focus();
		}
	}
	
	if (resp) {
		ZmLogin.submitAuthRequest(uname, newPass);
	}
};

ZmLogin.showChangePass = 
function(ex) {
	ZmLogin._setErrorMessage(ZmMsg.errorPassChange, true);

	// add new password fields
	var passTable = document.getElementById("passTable");
	var newPassRow = passTable.insertRow(2);
	var newPassMsg = newPassRow.insertCell(-1);
	var newPassFld = newPassRow.insertCell(-1);
	newPassRow.style.height = "30";
	newPassMsg.align = "right";
	newPassMsg.innerHTML = ZmMsg.newPassword + ":";
	newPassFld.innerHTML = "<input tabindex=10 style='width:100%' type=password id='passNew'>";
	
	// add confirm password fields
	var conPassRow = passTable.insertRow(3);
	var conPassMsg = conPassRow.insertCell(-1);
	var conPassFld = conPassRow.insertCell(-1);
	conPassRow.style.height = "30";
	conPassMsg.align = "right";
	conPassMsg.innerHTML = ZmMsg.confirm + ":";
	conPassFld.innerHTML = "<input tabindex=10 style='width:100%' type=password id='passConfirm'>";
	
	// set focus to the new password field
	var newPassInput = document.getElementById("passNew");
	newPassInput.focus();
};

/*
* Posts a small form to the server, where a servlet receives it and sets
* the appropriate cookies, then redirects to the mail app.
*
* @param mailServer			[string]		hostname of mail server
* @param authToken			[string]		auth token
* @param tokenLifetime		[int]			token lifetime
* @param rememberMe			[boolean]		if true, preserve auth token in cookie
*/
ZmLogin._postAuthToServer = 
function(mailServer, authToken, tokenLifetime, rememberMe) {
	var form = document.createElement('form');
	document.body.appendChild(form);

	var html = new Array();
	var i = 0;

	html[i++] = "<input type='hidden' name='authToken' value='" + authToken + "'>";

	if (rememberMe)
		html[i++] = "<input type='hidden' name='rememberMe' value='" + rememberMe + "'>";

	if (tokenLifetime)
		html[i++] = "<input type='hidden' name='atl' value='" + tokenLifetime + "'>";

	form.innerHTML = html.join('');
	form.action = ZmLogin.getAuthUrl(mailServer);
	form.method = "post";
	form.submit();
};

ZmLogin.getMailUrl = 
function (mailServer) {
	var ms = mailServer || location.hostname;
	return (location.protocol + "//" + ms + ZmLogin.ZIMBRA_APP_URI + window.location.search);
};

ZmLogin.getAuthUrl = 
function (mailServer) {
	var ms = mailServer ? mailServer : location.hostname;
	return (location.protocol + "//" + ms + ((location.port == 80) 
		? "" 
		: ":" + location.port) + appContextPath + "/auth/" + window.location.search);
};
