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
LmLogin = function () {}

LmLogin.lastGoodUserNameCookie   = "ls_last_username"; // <-- DO NOT EVER CHANGE THIS (or grep b4 u do)
LmLogin.lastGoodMailServerCookie = "ls_last_server";

// -----------------------------------------------------------------
// positioning methods
// -----------------------------------------------------------------
LmLogin.setPanelText = 
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

LmLogin.centerElement = 
function(element) {
	var el = element;
	var top = (document.body.clientHeight - parseInt(el.offsetHeight))/2;
	var left = (document.body.clientWidth - parseInt(el.offsetWidth))/2;
	el.style.top = top;
	el.style.left = left;
};

LmLogin.positionPanel = 
function() {
	var el = document.getElementById('loginPanel');
	LmLogin.centerElement(el);
	var event = null;
	if (LsEnv.isIE) {
		event = "onkeydown";
		document.getElementById("loginPanel")[event] = LmLogin.handleKeyPress;
	} else {
		event = "onkeypress";
		window[event] = LmLogin.handleKeyPress;
	}
	el.style.visibility="visible";

};

LmLogin.setUserNameAndFocus = 
function () {
	var lastUser = LsCookie.getCookie(document, LmLogin.lastGoodUserNameCookie);
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

LmLogin.setErrorMessage = 
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
	LmLogin.positionPanel();
	document.getElementById("uname").focus();
	// hide the error panel very briefly ... make it flicker a bit
	// this makes it look like something happened if the user has
	// successive errors
	window.setTimeout(LmLogin._flickerErrorMessagePanel, 0);
};

LmLogin._flickerErrorMessagePanel = 
function() {
	document.getElementById("errorMessageContainer").style.visibility = "hidden";
	window.setTimeout(LmLogin._showErrorMessagePanel, 5);
};

LmLogin._showErrorMessagePanel = 
function() {
	document.getElementById("errorMessageContainer").style.visibility = "visible";
};

// -----------------------------------------------------------------
// onload handler method
// -----------------------------------------------------------------
LmLogin.isSupportedBrowser = 
function() {
	return (LsEnv.isIE6up || LsEnv.isMozilla1_4up || LsEnv.isFirefox);
};

LmLogin.handleOnload = 
function(ev, checkedBrowser) {
	if (!checkedBrowser && !LmLogin.isSupportedBrowser()) {
		var u = document.getElementById('unsupportedBrowserMessage');
		u.style.display = 'block';
		LmLogin.centerElement(u);
		return;
	} else {
		var u = document.getElementById('unsupportedBrowserMessage');
		u.style.display = 'none';
	}
	LmLogin.setServerUri();
	var authToken = LsCsfeCommand.getAuthToken();
	if (authToken != null) {
		// check the server we're using
		var mailServer = LsCookie.getCookie(document, 
											LmLogin.lastGoodMailServerCookie);
		// if we have info, we just need to check that the token hasn't expired
		// let's send a no op request
		try {
			LmLogin.submitNoOpRequest();
			//window.location = LmLogin.getMailUrl(mailServer);
			LmLogin.handleSuccess(authToken, null, mailServer);
			return;
		} catch (ex) {
			// if we're here, it means we got an error sending the no op
			// request ... presumably because the auth credentials were invalid.
			// do nothing, but fall through to showing the login panel
		}

	}
	if (!LsEnv.isIE) {
		var input = document.createElement('input');
		input.type='button';
		input.style.display="none";
		input.id ="hiddenButton";
		var loginButton = document.getElementById('loginButton');
		loginButton.appendChild(input);
	}
	LmLogin.setPanelText();
	LmLogin.positionPanel();
	LmLogin.setUserNameAndFocus();

	// try and source some of the scripts we will need for the app
	//LmLogin.preLoadScripts();
};

LmLogin.CSFE_SERVER_URI = location.port == "80" ? "/service/soap/" : ":" + location.port + "/service/soap/";
LmLogin.LIQUID_APP_URI  = location.port == "80" ? "/liquid/mail" : ":" + location.port + "/liquid/mail";

LmLogin.setServerUri = 
function() {
	var value = location.protocol + "//" + location.hostname + LmLogin.CSFE_SERVER_URI;
	if (location.search && location.search.indexOf("host=") != -1)
		value += location.search;
    LsCsfeCommand.setServerUri(value);
};

// -----------------------------------------------------------------
// Future use methods? -- preloading images and scripts
// -----------------------------------------------------------------
LmLogin.getFullUrl = 
function(uri) {
    return location.protocol + "//" + location.hostname + ((location.port == "80") 
    	? "" 
    	: (":" + location.port)) + uri;
};

LmLogin.preLoadScripts = 
function() {
    var s = document.createElement('script');
    s.src = LmLogin.getFullUrl(mailBall);
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

LmLogin.cancelEvent = 
function(ev) {
	if (ev.stopPropagation)
		ev.stopPropagation();
		
	if (ev.preventDefault)
		ev.preventDefault();

	ev.cancelBubble = true;
	ev.returnValue = false;
}

LmLogin.handleKeyPress = 
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
				LmLogin.submitAuthRequest();
			}
			
			LmLogin.cancelEvent(ev);
			return false;
	    case 0x09: // TAB
			if (target.id == "uname"){
				if (!shiftKey){
					document.getElementById("pass").focus();
				} else {
					LmLogin._focusLoginButton(target);
				}
			} else if (target.id == "pass"){
				if (!shiftKey){
					document.getElementById("publicComputer").focus();
				} else {
					document.getElementById("uname").focus();
				}
			} else if (target.id == "publicComputer"){
				if (!shiftKey){			
					LmLogin._focusLoginButton(target);
				} else {
					document.getElementById("pass").focus();
				}
			} else {
				if (!shiftKey){
					document.getElementById("uname").focus();
					if (!LsEnv.isIE) {
						LmLogin.loginButtonBlur(button.parentNode.parentNode);
					}
				} else {
					document.getElementById("publicComputer").focus();
				}
			}
			LmLogin.cancelEvent(ev);
			return false;
    }
    return true;
};

LmLogin._focusLoginButton = 
function(target) {
	var button = document.getElementById("loginButton");
	if (LsEnv.isIE) {
		button.focus();
	} else {
		LmLogin.loginButtonFocus(button.parentNode.parentNode);
		target.blur();
		document.getElementById('hiddenButton').focus();
	}
};

LmLogin.loginButtonFocus = 
function(border) {
	border.className = "focusBorder";
};

LmLogin.loginButtonBlur = 
function(border) {
	border.className = "whiteBorder";	
};

// -----------------------------------------------------------------
// server communication methods
// -----------------------------------------------------------------


LmLogin.submitNoOpRequest = 
function() {
    var soapDoc = LsSoapDoc.create("NoOpRequest", "urn:liquidMail");
	LsCsfeCommand.invoke(soapDoc, false, null, null, true);
};

//changing for default domain support
//LmLogin.mailboxPat =/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
LmLogin.mailboxPat =/^([a-zA-Z0-9_\.\-])+(\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+)?$/;

LmLogin.isValidUsername = 
function(uname) {
	return uname.match(LmLogin.mailboxPat);
};

LmLogin.submitAuthRequest = 
function() {
    var uname = document.getElementById("uname").value;
    var pword = document.getElementById("pass").value;
    
    // check uname and pword first
    if (!LmLogin.isValidUsername(uname)){
		LmLogin.setErrorMessage(LmMsg.badUsername);
		return;
    }

    if (uname == null || pword == null || uname=="" || pword == ""){
		LmLogin.setErrorMessage(LmMsg.enterUsername);
		return;
    }
	
    var soapDoc = LsSoapDoc.create("AuthRequest", "urn:liquidAccount");
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
		LmLogin._authToken = resp.authToken;
		LmLogin._authTokenLifetime = resp.lifetime;
	    //LsCsfeCommand.setAuthToken(authToken, lifetime, sessionId);
		var mailServer = resp.refer;
		
		LmLogin.handleSuccess(LmLogin._authToken, LmLogin._authTokenLifetime, mailServer, uname, pword);
		LmLogin._authToken = LmLogin._authTokenLifetime = null;
    } catch (ex) {
		DBG.dumpObj(ex);
		if (ex.code == LsCsfeException.ACCT_AUTH_FAILED || 
			ex.code == LsCsfeException.NO_SUCH_ACCOUNT) 
		{
			LmLogin.setErrorMessage(LmMsg.loginError, -20);
		} 
		else if (ex.code == LsCsfeException.SOAP_ERROR || 
				 ex.code == LsCsfeException.NETWORK_ERROR) 
		{
			var msg = LmMsg.errorNetwork + "\n\n" + LmMsg.errorTryAgain + " " + LmMsg.errorContact;
			LmLogin.setErrorMessage(msg, -15);
		} 
		else 
		{
			var msg = LmMsg.errorApplication + "\n\n" + LmMsg.errorTryAgain + " " + LmMsg.errorContact;
			LmLogin.setErrorMessage(msg + " (" + ex.code + ")", -15);
		}
    }
};

LmLogin.handleSuccess = 
function(authToken, tokenLifetime, mailServer, uname, password) {
	var uri = LmLogin.getMailUrl(mailServer);
	// save the username for later use
	if (uname)
		LsCookie.setCookie(document, LmLogin.lastGoodUserNameCookie, uname, null, "/");

	if (mailServer != null)
		LsCookie.setCookie(document, LmLogin.lastGoodMailServerCookie, mailServer, null, "/");

	if (window.initMode != "" && (window.initMode != location.protocol))
		LsDebug.deleteWindowCookie();

	var pcChecked = document.getElementById("publicComputer").checked;
	// make sure we add the query string to the new page
	//window.location = uri;
	LmLogin.postAuthToServer(mailServer, authToken, tokenLifetime, !pcChecked);
};

LmLogin.postAuthToServer = function (mailServer, authToken, tokenLifetime, pubComputer){
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
	form.action = LmLogin.getAuthUrl(mailServer);
	form.method = 'post';
	form.submit();
};

LmLogin.getMailUrl = 
function (mailServer) {
	var ms = mailServer || location.hostname;
	return (location.protocol + "//" + ms + LmLogin.LIQUID_APP_URI + window.location.search);
};

LmLogin.getAuthUrl = 
function (mailServer) {
	var ms = mailServer? mailServer: location.hostname;
	return (location.protocol + "//" + ms + ((location.port == 80) 
		? "" 
		: ":" + location.port) +"/liquid/auth/" + window.location.search);
};
