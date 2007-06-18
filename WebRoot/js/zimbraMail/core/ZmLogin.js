/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
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

ZmLogin.USER_NAME_COOKIE  	= "zm_last_username";
ZmLogin.MAIL_SERVER_COOKIE	= "zm_last_server";
ZmLogin.SKIN_COOKIE			= "ZM_SKIN";
ZmLogin.APPS_COOKIE			= "ZM_APPS";
ZmLogin.COOKIE_LIFETIME		= 63072000000; // two years

ZmLogin.CSFE_SERVER_URI = location.port == "80" ? "/service/soap/" : ":" + location.port + "/service/soap/";

ZmLogin.DEFAULT_SKIN = "sand";

ZmLogin.APP_LETTER = {};
ZmLogin.APP_LETTER[ZmSetting.PORTAL_ENABLED]		= "p";
ZmLogin.APP_LETTER[ZmSetting.MAIL_ENABLED]			= "m";
ZmLogin.APP_LETTER[ZmSetting.CALENDAR_ENABLED]		= "c";
ZmLogin.APP_LETTER[ZmSetting.CONTACTS_ENABLED]		= "a";
ZmLogin.APP_LETTER[ZmSetting.OPTIONS_ENABLED]		= "o";
ZmLogin.APP_LETTER[ZmSetting.IM_ENABLED]			= "i";
ZmLogin.APP_LETTER[ZmSetting.NOTEBOOK_ENABLED]		= "n";
ZmLogin.APP_LETTER[ZmSetting.BRIEFCASE_ENABLED]		= "b";
ZmLogin.APP_LETTER[ZmSetting.TASKS_ENABLED]			= "t";
ZmLogin.APP_LETTER[ZmSetting.MIXED_VIEW_ENABLED]	= "x";
ZmLogin.APP_LETTER[ZmSetting.VOICE_ENABLED]			= "v";

ZmLogin.APP_SETTINGS = [];
(function() {
	for (var setting in ZmLogin.APP_LETTER) {
		ZmLogin.APP_SETTINGS.push(setting);
	}
})();

// prefs to fetch on login
ZmLogin.FETCH = ZmLogin.APP_SETTINGS.concat(ZmSetting.SKIN_NAME);

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
		if (ZmLogin.shouldReAuth()) {
			var errorMessage = null;
			if (!AjxCookie.areCookiesEnabled(document)) {
				errorMessage = ZmMsg.errorCookiesDisabled;
			}
			ZmLogin.showPanel(errorMessage);
		} 
	}
};

/**
* Returns true if user agent is supported.
*/
ZmLogin.isSupportedBrowser =
function() {
	return AjxEnv.isIE6up || AjxEnv.isMozilla1_4up || AjxEnv.isFirefox1up || AjxEnv.isSafari;
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
	var params = ZLoginFactory.copyDefaultParams(ZmMsg);
	params.showError = true;
	params.errorMsg = AjxMessageFormat.format(ZmMsg.errorBrowserUnsupported, [navigator.appName, navigator.appVersion]);
	params.showAbout = true;

	if (ZmLogin.isAlmostSupportedBrowser()) {
		params.aboutMsg = AjxMessageFormat.format(ZmMsg.almostSupportedBrowserTip, ["ZmLogin.handleOnload(null, true);"]);
	} else {
		params.aboutMsg = ZmMsg.unsupportedBrowserTip;
	}
	params.clientLevelNotice = AjxMessageFormat.format(ZmMsg.clientLoginNotice, [appContextPath+"/h/"]);

	var html = [];
	var idx = 0;
	html[idx++] = "<table border=0 cellspacing=0 cellpadding=0 style='width:100%; height:100%'><tr><td align='center' valign='center'>";
	html[idx++] = ZLoginFactory.getLoginDialogHTML(params);
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
		var mailServer = AjxCookie.getCookie(document, ZmLogin.MAIL_SERVER_COOKIE);
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
function(errorMessage) {
	var html = [];
	var idx = 0;
	html[idx++] = "<table border=0 cellspacing=0 cellpadding=0 style='width:100%; height:100%'><tr><td align='center' valign='center'>";

	var params = ZLoginFactory.copyDefaultParams(ZmMsg);
	params.showForm = true;
	params.showUserField = true;
	params.showPasswordField = true;
	params.showLicenseMsg = true;
	params.showRememberMeCheckbox = true;
	params.showButton = true;
	if (errorMessage) {
		params.errorMsg = errorMessage;
		params.showError = true;
	}
	params.clientLevelNotice = AjxMessageFormat.format(ZmMsg.clientLoginNotice, [appContextPath+"/h/"]);
	html[idx++] = ZLoginFactory.getLoginDialogHTML(params);

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
		var el = ZLoginFactory.getLoginPanel();
		el["onkeydown"] = ZLoginFactory.handleKeyPress;
	} else {
		window["onkeypress"] = ZLoginFactory.handleKeyPress;
	}
};

/*
* Sets the focus to the password field if the username field has been
* pre-filled, and to the username field otherwise.
*/
ZmLogin._setUserNameAndFocus =
function() {
	var lastUser = AjxCookie.getCookie(document, ZmLogin.USER_NAME_COOKIE);
	var focusEl = null;
	// if we have a username, fill out the username field, and focus on the
	// password field. Otherwise focus on the username field.
	if (lastUser && lastUser != "") {
		ZLoginFactory.showUserField(lastUser);
		focusEl = ZLoginFactory.getPasswordField();
	} else {
		focusEl = ZLoginFactory.getUserField();
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
	ZLoginFactory.showErrorMsg(msg);

	if (!skipFocus)
		ZLoginFactory.getUserField().focus();
};

ZmLogin.setServerUri =
function() {
	var value = location.protocol + "//" + location.hostname + ZmLogin.CSFE_SERVER_URI;
	if (location.search && location.search.indexOf("host=") != -1)
		value += location.search;
    ZmCsfeCommand.setServerUri(value);
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
    var prefs = [], attrs = [];
    if (ZmLogin.FETCH.length) {
    	if (!ZmLogin._settings) {
    		ZmLogin._settings = new ZmSettings(null, true);
			ZmLogin._settings._initializeLoginSettings();
    	}
		for (var i = 0; i < ZmLogin.FETCH.length; i++) {
			var id = ZmLogin.FETCH[i];
			var setting = ZmLogin._settings.getSetting(id);
			if (setting && setting.name) {
				(setting.type == ZmSetting.T_PREF) ? prefs.push(setting.name) : attrs.push(setting.name);
			}
		}
		if (prefs.length) {
			var prefsEl = soapDoc.set("prefs");
			for (var i = 0; i < prefs.length; i++) {
				var prefEl = soapDoc.set("pref", null, prefsEl);
				prefEl.setAttribute("name", prefs[i]);
			}
		}
		if (attrs.length) {
			var attrsEl = soapDoc.set("attrs");
			for (var i = 0; i < attrs.length; i++) {
				var attrEl = soapDoc.set("attr", null, attrsEl);
				attrEl.setAttribute("name", attrs[i]);
			}
		}
    }

	var command = new ZmCsfeCommand();
	var respCallback = new AjxCallback(null, ZmLogin._handleResponseSubmitAuthRequest, [uname, pword]);
	command.invoke({soapDoc: soapDoc, noAuthToken: true,noSession: true, asyncMode: true, callback: respCallback});
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
			var unameField = document.getElementById(ZLoginFactory.USER_ID);
			var pwordField = document.getElementById(ZLoginFactory.PASSWORD_ID);

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

	var settings = ZmLogin._settings;
	var prefs = resp.prefs ? resp.prefs._attrs : null;
	if (prefs) {
		settings.createFromJs(prefs);
	}
	var attrs = resp.attrs ? resp.attrs._attrs : null;
	if (attrs) {
		settings.createFromJs(attrs);
	}

    var match = location.search ? location.search.match(/\bredirect=([01])/) : null;
	var redirect = match ? match[1] : null;
	if (redirect == '0' ||
		(location.hostname == "localhost") ||
		(location.hostname && location.hostname.match(/^\d+\.\d+\.\d+\.\d+$/)))
	{
		if (redirect != '1')
			mailServer = location.hostname;
	}

	var rmChecked = document.getElementById(ZLoginFactory.REMEMBER_ME_ID).checked;
	ZmLogin.handleSuccess(ZmLogin._authToken, ZmLogin._authTokenLifetime, mailServer, uname, pword, rmChecked, settings);
	ZmLogin._authToken = ZmLogin._authTokenLifetime = null;
};

ZmLogin.isValidUsername =
function(uname) {
	return uname.match(AjxEmailAddress.accountPat) || AjxEmailAddress.isValid(uname);
};

ZmLogin.handleLogin =
function() {
	var unameField = document.getElementById(ZLoginFactory.USER_ID);
	var pwordField = document.getElementById(ZLoginFactory.PASSWORD_ID);
    var uname = unameField.value;
    var pword = pwordField.value;


	// check if we're trying to change the password
	if (unameField.disabled && pwordField.disabled) {
		ZmLogin.handleChangePass(uname, pword);
		return;
	}

    // check uname and pword first
	if (!uname || !pword) {
		ZmLogin._setErrorMessage(ZmMsg.enterUsername);
		return;
	}

    if (!ZmLogin.isValidUsername(uname)) {
		ZmLogin._setErrorMessage(ZmMsg.badUsername);
		return;
    }

	ZmLogin.submitAuthRequest(uname, pword);
};

ZmLogin.handleSuccess =
function(authToken, tokenLifetime, mailServer, uname, password, rememberMe, settings) {
	// save the username for later use
	if (uname) {
		AjxCookie.setCookie(document, ZmLogin.USER_NAME_COOKIE, uname, null, "/");
	}
	if (mailServer) {
		AjxCookie.setCookie(document, ZmLogin.MAIL_SERVER_COOKIE, mailServer, null, "/");
	}
	if (window.initMode != "" && (window.initMode != location.protocol)) {
		AjxDebug.deleteWindowCookie();
	}
	if (settings) {
		var value = settings.get(ZmSetting.SKIN_NAME) || ZmLogin.DEFAULT_SKIN;
		ZmLogin.setCookie(ZmLogin.SKIN_COOKIE, value, ZmLogin.COOKIE_LIFETIME);
		var apps = [];
		for (var setting in ZmLogin.APP_LETTER) {
			if (settings.get(setting)) {
				apps.push(ZmLogin.APP_LETTER[setting]);
			}
		}
		if (apps.length) {
			value = apps.join("");
			ZmLogin.setCookie(ZmLogin.APPS_COOKIE, value, ZmLogin.COOKIE_LIFETIME);
		}
	}

	// make sure we add the query string to the new page
	ZmLogin._postAuthToServer(mailServer, authToken, tokenLifetime, rememberMe);
};

ZmLogin.handleChangePass =
function(uname, oldPass) {
	// error check new and confirmation password
	var newPassField = ZLoginFactory.getNewPasswordField();
	var conPassField = ZLoginFactory.getPasswordConfirmField();
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
	soapDoc.set("virtualHost", location.hostname);
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
				: (ZmMsg.errorPassChangeTooSoon + " " + ZmMsg.errorContact);
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
			var unameField = document.getElementById(ZLoginFactory.USER_ID);
			var pwordField = document.getElementById(ZLoginFactory.PASSWORD_ID);
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
	ZLoginFactory.showNewPasswordFields();
	ZLoginFactory.getNewPasswordField().focus();
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

	var html = [];
	var i = 0;

	html[i++] = "<input type='hidden' name='authToken' value='" + authToken + "'>";

	if (rememberMe) {
		html[i++] = "<input type='hidden' name='rememberMe' value='" + rememberMe + "'>";
	}
	if (tokenLifetime) {
		html[i++] = "<input type='hidden' name='atl' value='" + tokenLifetime + "'>";
	}

	form.innerHTML = html.join('');
	form.action = ZmLogin.getAuthUrl(mailServer);
	form.method = "post";
	form.submit();
};

ZmLogin.getAuthUrl =
function (mailServer) {
	var ms = mailServer ? mailServer : location.hostname;
	return (location.protocol + "//" + ms + ((location.port == 80) 
		? "" 
		: ":" + location.port) + appContextPath + "/auth/" + window.location.search);
};

ZmLogin.setCookie =
function(cookieName, value, lifetime) {
	var exp = new Date();
	exp.setTime(exp.getTime() + lifetime);
	AjxCookie.setCookie(document, cookieName, value, exp, "/");
};
