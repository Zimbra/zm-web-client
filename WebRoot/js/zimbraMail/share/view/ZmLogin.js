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
 * The Original Code is: Zimbra Collaboration Suite.
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
 * Login script for the Login.jsp page.
 * This should handle initial authentication. If auth succeeds, it redirects
 * to zimbra/mail. If auth fails it displays the appropriate message.
 *
 * Also handles if session has timed out and the user hits the back button.
 * To do this, it sends a noop request just to see if the server chokes
 * on the auth token.
 *
 * TODO:
 *  - make sure all strings are drawn from ZmMsg.js
 *
 *  - parse the query string, look for whether the page is standalone, or
 *    if the app has opened a window to it.
 *
 *  - handle 3 different modes - HTTP, HTTP->Login via HTTPS->HTTP, HTTPS
 */
 
ZmLogin = function() {}

ZmLogin.lastGoodUserNameCookie   = "ls_last_username"; // <-- DO NOT EVER CHANGE THIS (or grep b4 u do)
ZmLogin.lastGoodMailServerCookie = "ls_last_server";
ZmLogin.CSFE_SERVER_URI = location.port == "80" ? "/service/soap/" : ":" + location.port + "/service/soap/";
ZmLogin.ZIMBRA_APP_URI  = location.port == "80" ? "/zimbra/mail" : ":" + location.port + "/zimbra/mail";
ZmLogin.MAILBOX_REGEX =/^([a-zA-Z0-9_\.\-])+(\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+)?$/;

ZmLogin.handleOnload = 
function(ev, checkBrowser) {
	if (!ZmLogin.isSupportedBrowser() && !checkBrowser) {
		ZmLogin.showUnsupported();
	} else {
		if (ZmLogin.shouldReAuth())
			ZmLogin.showPanel();
	}
};

// returns true if user agent is supported
ZmLogin.isSupportedBrowser = 
function() {
	return AjxEnv.isIE6up || AjxEnv.isMozilla1_4up || AjxEnv.isFirefox;
};

// returns true if user agent is not really supported but user can try anyway
ZmLogin.isAlmostSupportedBrowser = 
function() {
	return AjxEnv.isSafari || AjxEnv.isOpera;
};

ZmLogin.showUnsupported = 
function() {
	// TODO - move to ZmMsg for localization!
	var errorMsg = new Array()
	var idx = 0;
	errorMsg[idx++] = "We have detected that you are running <b>";
	errorMsg[idx++] = navigator.appName + " " + navigator.appVersion + "</b>";
	errorMsg[idx++] = ", which is an unsupported browser for the Zimbra Collaboration Suite. ";
	errorMsg[idx++] = "The Zimbra Collaboration Suite is supported on:<br>";
	errorMsg[idx++] = "<li>Microsoft Internet Explorer v6.x,";
	errorMsg[idx++] = "<li>Netscape v7.x,";
	errorMsg[idx++] = "<li>or Firefox v1.x.";
	var errorStr = errorMsg.join("");

	var tip = "";
	if (ZmLogin.isAlmostSupportedBrowser()) {
		tip = "Please note that because you are running an unsupported browser, your user experience may be affected, and all functionality may not be available.<p>" + 
			  "<a href='javascript:;' onclick='ZmLogin.handleOnload(null, true);'>Click here to continue.</a>";
	} else {
		tip = "To learn more about Zimbra and the Zimbra Collaboration Suite, visit <a href='http://www.zimbra.com'>www.zimbra.com</a> or send an email to <a href='mailto:info@zimbra.com'>info@zimbra.com</a>.";
	}
	
	var html = new Array();
	idx = 0;
	
	html[idx++] = "<table border=0 cellspacing=0 cellpadding=0 style='width:100%; height:100%'><tr><td>";
	html[idx++] = "<table width=450 align=center border=0 cellspacing=0 cellpadding=0 style='border: 2px solid; border-color: #C7C7C7 #3E3E3E #3E3E3E #C7C7C7;'>";
	html[idx++] = "<tr><td bgcolor='#FFFFFF'><div class='banner'></div></td></tr>";
	html[idx++] = "<tr><td class='mainPanel' align=center><div class='error'>";
	html[idx++] = "<table border=0 cellpadding=2 cellspacing=2><tr>";
	html[idx++] = "<td valign=top width=40><img src='/zimbra/img/hiRes/dwt/Critical_32.gif' width=32 height=32></td>";
	html[idx++] = "<td>";
	html[idx++] = errorStr;
	html[idx++] = "</td></tr></table>";
	html[idx++] = "</div><p>";
	html[idx++] = "<div style='text-align:left; width:85%'>" + tip + "</div><br>";
	html[idx++] = "</td></tr>";
	html[idx++] = "</table>";
	html[idx++] = "</td></tr></table>";

	document.body.innerHTML = html.join("");
};

ZmLogin.shouldReAuth = 
function() {
	ZmLogin.setServerUri();
	var authToken = ZmCsfeCommand.getAuthToken();
	if (authToken) {
		// check the server we're using
		var mailServer = AjxCookie.getCookie(document, ZmLogin.lastGoodMailServerCookie);
		try {
			// if we have info, just check token hasn't expired w/ no op request
			ZmLogin.submitNoOpRequest();
			ZmLogin.handleSuccess(authToken, null, mailServer);
			return false;
		} catch (ex) {
			DBG.dumpObj(ex);
			// if we're here, it means we got an error sending the no op
			// request ... presumably b/c auth credentials were invalid.
			// just show login panel
		}
	}
	return true;
};

ZmLogin.showPanel = 
function() {

	var html = new Array()
	var idx = 0;
	
	html[idx++] = "<table border=0 cellspacing=0 cellpadding=0 style='width:100%; height:100%'><tr><td>";
	html[idx++] = "<table width=450 align=center border=0 cellspacing=0 cellpadding=0 style='border: 2px solid; border-color: #C7C7C7 #3E3E3E #3E3E3E #C7C7C7;'>";
	html[idx++] = "<tr><td bgcolor='#FFFFFF'><div class='banner'></div></td></tr>";
	html[idx++] = "<tr><td id='loginPanel' class='mainPanel'>";
	// error message div
	html[idx++] = "<center><div class='error' style='display:none' id='errorMessageContainer'>";
	html[idx++] = "<table border=0 cellpadding=2 cellspacing=2><tr>";
	html[idx++] = "<td valign=top width=40><img src='/zimbra/img/hiRes/dwt/Critical_32.gif' id='errorIcon' width=32 height=32></td>";
	html[idx++] = "<td id='errorMessage'>";
	html[idx++] = "</td></tr></table>";
	html[idx++] = "</div></center>";
	// real content
	html[idx++] = "<table id='passTable' border=0 width=425>";
	html[idx++] = "<tr height=40>";
	html[idx++] = "<td width=100 align=right>" + ZmMsg.username + ":</td>";
	html[idx++] = "<td><input style='width:100%' autocomplete=OFF type=text tabIndex=1 id='uname'></td>";
	html[idx++] = "</tr><tr height=30>";
	html[idx++] = "<td align=right width=100>" + ZmMsg.password + ":</td>";
	html[idx++] = "<td><input style='width:100%' type=password tabIndex=2 id='pass'></td>";
	html[idx++] = "</tr><tr><td></td>";
	html[idx++] = "<td><table border=0 width=100%><tr height=28><td width=1><input style='width:13px' id='publicComputer' type='checkbox'></td>";
	html[idx++] = "<td style='width:1px' width=1><nobr>" + ZmMsg.publicComputer + "</td>";
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
	html[idx++] = ">";
	html[idx++] = ZmMsg.login;
	// non-IE browsers dont allow focus for non-INPUT elements so we have to 
	// create a hidden input to fake focus for our DIV which acts asa input btn.
	if (!AjxEnv.isIE)
		html[idx++] = "<input type='button' style='display:none' id='hiddenButton'>";
	html[idx++] = "</div></td>";
	
	html[idx++] = "</tr></table>";
	html[idx++] = "</td></tr></table><br><br>";
	html[idx++] = "</td></tr>";
	html[idx++] = "</table>";
	html[idx++] = "</td></tr></table>";
	document.body.innerHTML = html.join("");

	ZmLogin.registerKeyPress();
	ZmLogin.setUserNameAndFocus();
};

ZmLogin.registerKeyPress = 
function() {
	if (AjxEnv.isIE) {
		var el = document.getElementById("loginPanel");
		el["onkeydown"] = ZmLogin.handleKeyPress;
	} else {
		window["onkeypress"] = ZmLogin.handleKeyPress;
	}
};

ZmLogin.setUserNameAndFocus = 
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

ZmLogin.setErrorMessage = 
function(msg, skipFocus) {
	var errCell = document.getElementById("errorMessage");
	errCell.innerHTML = msg;
	document.getElementById("errorMessageContainer").style.display = "block";

	if (!skipFocus)
		document.getElementById("uname").focus();
	
	// hide error panel very briefly.. making it look like something happened if 
	// user has successive errors
	ZmLogin._flickerErrorMessagePanel();
};

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
    
    var target = ev.target? ev.target: ev.srcElement;
	var button = document.getElementById("loginButton");
    if (target == null) return true;
    
    var keyCode = ev.keyCode;
	var shiftKey = ev.shiftKey;

	// ENTER    
    if (keyCode == 0x0D) 
    {
		if (target.id == "uname") {
			document.getElementById("pass").focus();
		} else if (target.id == "publicComputer") {
			target.checked = true;
		} else {
			ZmLogin.handleLogin();
		}
		ZmLogin.cancelEvent(ev);
		return false;
	} 
	// TAB
	else if (keyCode == 0x09) 
	{
		if (target.id == "uname") {
			if (!shiftKey) {
				document.getElementById("pass").focus();
			} else {
				ZmLogin._focusLoginButton(target);
			}
		} else if (target.id == "pass") {
			var obj = !shiftKey 
				? document.getElementById("publicComputer")
				: document.getElementById("uname");
			obj.focus();
		} else if (target.id == "publicComputer") {
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
				 ? document.getElementById("publicComputer")
				 : document.getElementById("passNew");
			obj.focus();
		} else {
			if (!shiftKey) {
				var obj = document.getElementById("uname");
				if (obj.disabled) {
					obj = document.getElementById("passNew");
				} else {
					if (!AjxEnv.isIE)
						ZmLogin.loginButtonBlur(button.parentNode);
				}
				obj.focus();
			} else {
				document.getElementById("publicComputer").focus();
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
	command.invoke({soapDoc: soapDoc, useXml: true, asyncMode: true});
};

ZmLogin.submitAuthRequest = 
function(uname, pword) {
	try {
	    var soapDoc = AjxSoapDoc.create("AuthRequest", "urn:zimbraAccount");
	} catch (ex) {
		if (AjxEnv.isIE && (ex.code == AjxException.INTERNAL_ERROR))
			ZmLogin.setErrorMessage(ZmMsg.errorNoActiveX);
		return;
	}

	var unameField = document.getElementById("uname");
	var pwordField = document.getElementById("pass");
	
    var el = soapDoc.set("account", uname);
    el.setAttribute("by", "name");
    soapDoc.set("password", pword);

	var command = new ZmCsfeCommand();
	var respCallback = new AjxCallback(null, ZmLogin._handleResponseSubmitAuthRequest, [uname, pword]);
	command.invoke({soapDoc: soapDoc, noAuthToken: true, noSession: true, asyncMode: true, callback: respCallback});
}

ZmLogin._handleResponseSubmitAuthRequest =
function(args) {
	var uname	= args[0];
	var pword	= args[1];
	var result	= args[2];
	
	var response;
	try {
		response = result.getResponse();
	} catch (ex) {
		DBG.dumpObj(ex);
		if (ex.code == ZmCsfeException.ACCT_AUTH_FAILED || ex.code == ZmCsfeException.NO_SUCH_ACCOUNT) {
			ZmLogin.setErrorMessage(ZmMsg.loginError);
		} else if (ex.code == ZmCsfeException.SOAP_ERROR || ex.code == ZmCsfeException.NETWORK_ERROR) {
			var msg = ZmMsg.errorNetwork + "\n\n" + ZmMsg.errorTryAgain + " " + ZmMsg.errorContact;
			ZmLogin.setErrorMessage(msg);
		} else if (ex.code == ZmCsfeException.ACCT_CHANGE_PASSWORD)	{
			// disable username and password fields
			unameField.disabled = pwordField.disabled = true;
			ZmLogin.showChangePass(ex);
		} else {
			var msg = ZmMsg.errorApplication + "\n\n" + ZmMsg.errorTryAgain + " " + ZmMsg.errorContact;
			ZmLogin.setErrorMessage(msg + " (" + ex.code + ")");
		}
		return;
	}
	var resp = response.Body.AuthResponse;
	ZmLogin._authToken = resp.authToken;
	ZmLogin._authTokenLifetime = resp.lifetime;
	var mailServer = resp.refer;
	var pcChecked = document.getElementById("publicComputer").checked;
	ZmLogin.handleSuccess(ZmLogin._authToken, ZmLogin._authTokenLifetime, mailServer, uname, pword, !pcChecked);
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
		ZmLogin.setErrorMessage(ZmMsg.badUsername);
		return;
    }

    if (uname == null || pword == null || uname=="" || pword == "") {
		ZmLogin.setErrorMessage(ZmMsg.enterUsername);
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
	ZmLogin.postAuthToServer(mailServer, authToken, tokenLifetime, rememberMe);
};

ZmLogin.handleChangePass = 
function(uname, oldPass) {
	// error check new and confirmation password
	var newPassField = document.getElementById("passNew");
	var conPassField = document.getElementById("passConfirm");
	var newPass = AjxStringUtil.trim(newPassField.value);
	var conPass = AjxStringUtil.trim(conPassField.value);
	
	if (newPass == null || newPass == "" || conPass == null || conPass == "") {
		ZmLogin.setErrorMessage(ZmMsg.enterNewPassword, true);
		return;
	}
	
	if (newPass != conPass) {
		ZmLogin.setErrorMessage(ZmMsg.bothNewPasswordsMustMatch, true);
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
			ZmLogin.setErrorMessage(msg);
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
			
			ZmLogin.setErrorMessage(ZmMsg.errorPassLocked);
		}
	}
	
	if (resp) {
		ZmLogin.submitAuthRequest(uname, newPass);
	}
};

ZmLogin.showChangePass = 
function(ex) {
	ZmLogin.setErrorMessage(ZmMsg.errorPassChange, true);

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

ZmLogin.postAuthToServer = 
function(mailServer, authToken, tokenLifetime, pubComputer) {
	var form = document.createElement('form');
	document.body.appendChild(form);

	var html = new Array();
	var i = 0;

	html[i++] = "<input type='hidden' name='authToken' value='" + authToken + "'>";

	if (pubComputer)
		html[i++] = "<input type='hidden' name='publicComputer' value='" + pubComputer + "'>";

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
	var ms = mailServer? mailServer: location.hostname;
	return (location.protocol + "//" + ms + ((location.port == 80) 
		? "" 
		: ":" + location.port) +"/zimbra/auth/" + window.location.search);
};
