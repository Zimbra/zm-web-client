// @copyright@

/**
 * Login script for the Login.jsp page.
 * This should handle initial authentication. If auth succeeds, it redirects
 * to liquid/mail. If auth fails it displays the appropriate message.
 *
 * It handles if the session has timed out and the user hits the back button.
 * To do this, it sends a noop request just to see if the server chokes
 * on the auth token.
 *
 * TODO:
 *  - mke sure all strings are drawn from LmMsg.js

 *  - parse the query string, look for whether the page is standalone, or
 *    if the app has opened a window to it.
 *
 *  - handle 3 different modes - HTTP, HTTP->Login via HTTPS->HTTP, HTTPS
 */
ZmLogin = function () {}

ZmLogin.lastGoodUserNameCookie   = "ls_last_username"; // <-- DO NOT EVER CHANGE THIS (or grep b4 u do)
ZmLogin.lastGoodMailServerCookie = "ls_last_server";

// -----------------------------------------------------------------
// positioning methods
// -----------------------------------------------------------------
ZmLogin.setPanelText = 
function() {
	// fill in the text fields we're using
	var lb = document.getElementById('logonText');
	lb.innerHTML = LmMsg.login;
	var pc = document.getElementById('pcText');
	pc.innerHTML = LmMsg.publicComputer;
	var u = document.getElementById('ut');
	u.innerHTML = LmMsg.username + ":";
	var p = document.getElementById('pt');
	p.innerHTML = LmMsg.password + ":";
};

ZmLogin.centerElement = 
function(element) {
	var el = element;
	var top = (document.body.clientHeight - parseInt(el.offsetHeight))/2;
	var left = (document.body.clientWidth - parseInt(el.offsetWidth))/2;
	el.style.top = top;
	el.style.left = left;
};

ZmLogin.positionPanel = 
function() {
	var el = document.getElementById('loginPanel');
	ZmLogin.centerElement(el);
	var event = null;
	if (AjxEnv.isIE) {
		event = "onkeydown";
		document.getElementById("loginPanel")[event] = ZmLogin.handleKeyPress;
	} else {
		event = "onkeypress";
		window[event] = ZmLogin.handleKeyPress;
	}
	el.style.visibility="visible";

};

ZmLogin.setUserNameAndFocus = 
function () {
	var lastUser = AjxCookie.getCookie(document, ZmLogin.lastGoodUserNameCookie);
	var focusEl = null;
	// if we have a username, fill out the username field, and focus on the 
	// password field. Otherwise focus on the username field. 
	if (lastUser != null && lastUser != ""){
		document.getElementById("uname").value = lastUser;
		focusEl = document.getElementById("pass");
	} else {
		focusEl = document.getElementById("uname");
	}
    focusEl.focus();
};

ZmLogin.setErrorMessage = 
function (msg, msgOffsetFromCurrent) {
	var errCell = document.getElementById("errorMessage");
	errCell.innerHTML = msg;
	document.getElementById("errorMessageContainer").style.display = "block";

	if (msgOffsetFromCurrent) {
		var currTop = null;
		if (errCell._origTop) {
			currTop = errCell._origTop;
		} else {
			currTop = parseInt(errCell.style.top);
			errCell._origTop = currTop;
		}
	    errCell.style.top =  currTop + msgOffsetFromCurrent + "px";
	} else if (errCell._origTop) {
	    errCell.style.top = errCell._origTop;
	}

	document.getElementById("loginPanel").style.height = "332px";
	document.getElementById("ut").style.top = "3px";
	document.getElementById("ui").style.top = "0px";
	document.getElementById("pt").style.top = "39px";
	document.getElementById("pi").style.top = "36px";
	document.getElementById("bi").style.top = "68px";
	document.getElementById("pc").style.top = "68px";
	ZmLogin.positionPanel();
	document.getElementById("uname").focus();
	// hide the error panel very briefly ... make it flicker a bit
	// this makes it look like something happened if the user has
	// successive errors
	window.setTimeout(ZmLogin._flickerErrorMessagePanel, 0);
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

// -----------------------------------------------------------------
// onload handler method
// -----------------------------------------------------------------
ZmLogin.isSupportedBrowser = 
function() {
	return (AjxEnv.isIE6up || AjxEnv.isMozilla1_4up || AjxEnv.isFirefox);
};

ZmLogin.handleOnload = 
function(ev, checkedBrowser) {
	if (!checkedBrowser && !ZmLogin.isSupportedBrowser()) {
		var u = document.getElementById('unsupportedBrowserMessage');
		u.style.display = 'block';
		ZmLogin.centerElement(u);
		return;
	} else {
		var u = document.getElementById('unsupportedBrowserMessage');
		u.style.display = 'none';
	}
	ZmLogin.setServerUri();
	var authToken = LsCsfeCommand.getAuthToken();
	if (authToken != null) {
		// check the server we're using
		var mailServer = AjxCookie.getCookie(document, 
											ZmLogin.lastGoodMailServerCookie);
		// if we have info, we just need to check that the token hasn't expired
		// let's send a no op request
		try {
			ZmLogin.submitNoOpRequest();
			//window.location = ZmLogin.getMailUrl(mailServer);
			ZmLogin.handleSuccess(authToken, null, mailServer);
			return;
		} catch (ex) {
			// if we're here, it means we got an error sending the no op
			// request ... presumably because the auth credentials were invalid.
			// do nothing, but fall through to showing the login panel
		}

	}
	if (!AjxEnv.isIE) {
		var input = document.createElement('input');
		input.type='button';
		input.style.display="none";
		input.id ="hiddenButton";
		var loginButton = document.getElementById('loginButton');
		loginButton.appendChild(input);
	}
	ZmLogin.setPanelText();
	ZmLogin.positionPanel();
	ZmLogin.setUserNameAndFocus();

	// try and source some of the scripts we will need for the app
	//ZmLogin.preLoadScripts();
};

ZmLogin.CSFE_SERVER_URI = location.port == "80" ? "/service/soap/" : ":" + location.port + "/service/soap/";
ZmLogin.LIQUID_APP_URI  = location.port == "80" ? "/liquid/mail" : ":" + location.port + "/liquid/mail";

ZmLogin.setServerUri = 
function() {
	var value = location.protocol + "//" + location.hostname + ZmLogin.CSFE_SERVER_URI;
	if (location.search && location.search.indexOf("host=") != -1)
		value += location.search;
    LsCsfeCommand.setServerUri(value);
};

// -----------------------------------------------------------------
// Future use methods? -- preloading images and scripts
// -----------------------------------------------------------------
ZmLogin.getFullUrl = 
function(uri) {
    return location.protocol + "//" + location.hostname + ((location.port == "80") 
    	? "" 
    	: (":" + location.port)) + uri;
};

ZmLogin.preLoadScripts = 
function() {
    var s = document.createElement('script');
    s.src = ZmLogin.getFullUrl(mailBall);
    document.body.appendChild(s);
	
	if (window.devIframeSrc) {
		var iframe = document.createElement('iframe');
		iframe.src = window.devIframeSrc;
		iframe.style.display="none";
		document.body.appendChild(iframe);
	}
}


// -----------------------------------------------------------------
// event handler methods
// -----------------------------------------------------------------

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
    
    switch (keyCode) {
	    case 0x0D: // ENTER
			if (target.id == "uname"){
				document.getElementById("pass").focus();
			} else if (target.id == "publicComputer"){
				target.checked = true;
			} else {
				ZmLogin.submitAuthRequest();
			}
			
			ZmLogin.cancelEvent(ev);
			return false;
	    case 0x09: // TAB
			if (target.id == "uname"){
				if (!shiftKey){
					document.getElementById("pass").focus();
				} else {
					ZmLogin._focusLoginButton(target);
				}
			} else if (target.id == "pass"){
				if (!shiftKey){
					document.getElementById("publicComputer").focus();
				} else {
					document.getElementById("uname").focus();
				}
			} else if (target.id == "publicComputer"){
				if (!shiftKey){			
					ZmLogin._focusLoginButton(target);
				} else {
					document.getElementById("pass").focus();
				}
			} else {
				if (!shiftKey){
					document.getElementById("uname").focus();
					if (!AjxEnv.isIE) {
						ZmLogin.loginButtonBlur(button.parentNode.parentNode);
					}
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
		ZmLogin.loginButtonFocus(button.parentNode.parentNode);
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
	border.className = "whiteBorder";	
};

// -----------------------------------------------------------------
// server communication methods
// -----------------------------------------------------------------


ZmLogin.submitNoOpRequest = 
function() {
    var soapDoc = AjxSoapDoc.create("NoOpRequest", "urn:zimbraMail");
	LsCsfeCommand.invoke(soapDoc, false, null, null, true);
};

//changing for default domain support
//ZmLogin.mailboxPat =/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
ZmLogin.mailboxPat =/^([a-zA-Z0-9_\.\-])+(\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+)?$/;

ZmLogin.isValidUsername = 
function(uname) {
	return uname.match(ZmLogin.mailboxPat);
};

ZmLogin.submitAuthRequest = 
function() {
    var uname = document.getElementById("uname").value;
    var pword = document.getElementById("pass").value;
    
    // check uname and pword first
    if (!ZmLogin.isValidUsername(uname)){
		ZmLogin.setErrorMessage(LmMsg.badUsername);
		return;
    }

    if (uname == null || pword == null || uname=="" || pword == ""){
		ZmLogin.setErrorMessage(LmMsg.enterUsername);
		return;
    }
	
    var soapDoc = AjxSoapDoc.create("AuthRequest", "urn:liquidAccount");
	var header = soapDoc.createHeaderElement();
	var context = soapDoc.set("context", null, header);
	context.setAttribute("xmlns", "urn:liquid");
	soapDoc.set("nosession", null, context);
	var js = soapDoc.set("format", null, context);
	js.setAttribute("type", "js");

    var el = soapDoc.set("account", uname);
    el.setAttribute("by", "name");
    soapDoc.set("password", pword);
    try {
		var resp = LsCsfeCommand.invoke(soapDoc, true).Body.AuthResponse;
		ZmLogin._authToken = resp.authToken;
		ZmLogin._authTokenLifetime = resp.lifetime;
	    //LsCsfeCommand.setAuthToken(authToken, lifetime, sessionId);
		var mailServer = resp.refer;
		
		ZmLogin.handleSuccess(ZmLogin._authToken, ZmLogin._authTokenLifetime, mailServer, uname, pword);
		ZmLogin._authToken = ZmLogin._authTokenLifetime = null;
    } catch (ex) {
		DBG.dumpObj(ex);
		if (ex.code == LsCsfeException.ACCT_AUTH_FAILED || 
			ex.code == LsCsfeException.NO_SUCH_ACCOUNT) 
		{
			ZmLogin.setErrorMessage(LmMsg.loginError, -20);
		} 
		else if (ex.code == LsCsfeException.SOAP_ERROR || 
				 ex.code == LsCsfeException.NETWORK_ERROR) 
		{
			var msg = LmMsg.errorNetwork + "\n\n" + LmMsg.errorTryAgain + " " + LmMsg.errorContact;
			ZmLogin.setErrorMessage(msg, -15);
		} 
		else 
		{
			var msg = LmMsg.errorApplication + "\n\n" + LmMsg.errorTryAgain + " " + LmMsg.errorContact;
			ZmLogin.setErrorMessage(msg + " (" + ex.code + ")", -15);
		}
    }
};

ZmLogin.handleSuccess = 
function(authToken, tokenLifetime, mailServer, uname, password) {
	var uri = ZmLogin.getMailUrl(mailServer);
	// save the username for later use
	if (uname)
		AjxCookie.setCookie(document, ZmLogin.lastGoodUserNameCookie, uname, null, "/");

	if (mailServer != null)
		AjxCookie.setCookie(document, ZmLogin.lastGoodMailServerCookie, mailServer, null, "/");

	if (window.initMode != "" && (window.initMode != location.protocol))
		AjxDebug.deleteWindowCookie();

	var pcChecked = document.getElementById("publicComputer").checked;
	// make sure we add the query string to the new page
	//window.location = uri;
	ZmLogin.postAuthToServer(mailServer, authToken, tokenLifetime, !pcChecked);
};

ZmLogin.postAuthToServer = function (mailServer, authToken, tokenLifetime, pubComputer){
	var form = document.createElement('form');
	form.style.display = 'none';
	document.body.appendChild(form);
	var html = new Array();
	var i = 0;
	html[i++] = "<input type='hidden' name='authToken' value='" + authToken + "'>";
	if (pubComputer) {
		html[i++] = "<input type='hidden' name='publicComputer' value='" + pubComputer + "'>";
	}

	if (tokenLifetime) {
		html[i++] = "<input type='hidden' name='atl' value='" + tokenLifetime + "'>";
	}

	form.innerHTML = html.join('');
	form.action = ZmLogin.getAuthUrl(mailServer);
	form.method = 'post';
	form.submit();
};

ZmLogin.getMailUrl = 
function (mailServer) {
	var ms = mailServer || location.hostname;
	return (location.protocol + "//" + ms + ZmLogin.LIQUID_APP_URI + window.location.search);
};

ZmLogin.getAuthUrl = 
function (mailServer) {
	var ms = mailServer? mailServer: location.hostname;
	return (location.protocol + "//" + ms + ((location.port == 80) 
		? "" 
		: ":" + location.port) +"/liquid/auth/" + window.location.search);
};
