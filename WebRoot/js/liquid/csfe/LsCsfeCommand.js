function LsCsfeCommand() {
}

LsCsfeCommand._COOKIE_NAME = "LS_AUTH_TOKEN";

// All the cache and context stuff is to support async calls in the future
LsCsfeCommand.serverUri = null;
LsCsfeCommand._authToken = null;
LsCsfeCommand._sessionId = null;

LsCsfeCommand.getAuthToken =
function() {
	// See if the auth token is cached. If not try and get it from the cookie
	if (LsCsfeCommand._authToken != null)
		return LsCsfeCommand._authToken;
	var authToken = LsCookie.getCookie(document, LsCsfeCommand._COOKIE_NAME)
	LsCsfeCommand._authToken = authToken;
	return authToken;
}

LsCsfeCommand.setCookieName =
function(cookieName) {
	LsCsfeCommand._COOKIE_NAME = cookieName;
}

LsCsfeCommand.setAuthToken =
function(authToken, lifetimeMs, sessionId) {
	LsCsfeCommand._authToken = authToken;
	if (lifetimeMs != null) {
		var exp = new Date();
		var lifetime = parseInt(lifetimeMs);
		exp.setTime(exp.getTime() + lifetime);
		LsCookie.setCookie(document, LsCsfeCommand._COOKIE_NAME, authToken, exp, "/");
	} else {
		LsCookie.deleteCookie(document, LsCsfeCommand._COOKIE_NAME, "/");
	}
	if (sessionId)
		LsCsfeCommand.setSessionId(sessionId);
}

LsCsfeCommand.clearAuthToken =
function() {
	LsCsfeCommand._authToken = null;
	LsCookie.deleteCookie(document, LsCsfeCommand._COOKIE_NAME, "/");
}

LsCsfeCommand.getSessionId =
function() {
	return LsCsfeCommand._sessionId;
}

LsCsfeCommand.setSessionId =
function(id) {
	LsCsfeCommand._sessionId = id;
}

LsCsfeCommand.invoke =
function(soapDoc, noAuthTokenRequired, serverUri, targetServer, useXml) {
	// See if we have an auth token, if not, then mock up and need to authenticate or just have no auth cookie
	if (!noAuthTokenRequired) {
		var authToken = LsCsfeCommand.getAuthToken();
		if (!authToken)
			throw new LsCsfeException("AuthToken required", LsCsfeException.NO_AUTH_TOKEN, "LsCsfeCommand.invoke");
		var sessionId = LsCsfeCommand.getSessionId();
		var hdr = soapDoc.createHeaderElement();
		var ctxt = soapDoc.set("context", null, hdr);
		ctxt.setAttribute("xmlns", "urn:liquid");
		soapDoc.set("authToken", authToken, ctxt);
		if (sessionId)
			soapDoc.set("sessionId", sessionId, ctxt);
		if (targetServer)
			soapDoc.set("targetServer", targetServer, ctxt);
	}
	
	if (!useXml) {
		var js = soapDoc.set("format", null, ctxt);
		js.setAttribute("type", "js");
	}

	DBG.println(LsDebug.DBG1, "<H4>REQUEST</H4>");
	DBG.printXML(LsDebug.DBG1, soapDoc.getXml());

	var xmlResponse = false;
	try {
		var uri = serverUri || LsCsfeCommand.serverUri;
		var requestStr = !LsEnv.isSafari 
			? soapDoc.getXml() 
			: soapDoc.getXml().replace("soap=", "xmlns:soap=");
			
		var _st = new Date();
		var response = LsRpc.invoke(requestStr, uri, {"Content-Type": "application/soap+xml; charset=utf-8"});
		var _en = new Date();
		DBG.println(LsDebug.DBG1, "ROUND TRIP TIME: " + (_en.getTime() - _st.getTime()));

		var respDoc = null;
		if (typeof(response.text) == "string" && response.text.indexOf("{") == 0) {
			respDoc = response.text;
		} else {
			xmlResponse = true;
			// responseXML is empty under IE
			respDoc = (LsEnv.isIE || response.xml == null)
				? LsSoapDoc.createFromXml(response.text) 
				: LsSoapDoc.createFromDom(response.xml);
		}
	} catch (ex) {
		if (ex instanceof LsSoapException) {
			throw ex;
		} else if (ex instanceof LsException) {
			throw ex; 
		}  else {
			var newEx = new LsCsfeException();
			newEx.method = "LsCsfeCommand.invoke";
			newEx.detail = ex.toString();
			newEx.code = LsCsfeException.UNKNOWN_ERROR;
			newEx.msg = "Unknown Error";
			throw newEx;
		}
	}
	
	DBG.println(LsDebug.DBG1, "<H4>RESPONSE</H4>");

	var resp;
	if (xmlResponse) {
		DBG.printXML(LsDebug.DBG1, respDoc.getXml());
		var body = respDoc.getBody();
		var fault = LsSoapDoc.element2FaultObj(body);
		if (fault) {
			throw new LsCsfeException("Csfe service error", fault.errorCode, "LsCsfeCommand.invoke", fault.reason);
		}
		if (useXml)
			return body;

		resp = "{";
		var hdr = respDoc.getHeader();
		if (hdr)
			resp += LsUtil.xmlToJs(hdr) + ",";
		resp += LsUtil.xmlToJs(body);
		resp += "}";
	} else {
		resp = respDoc;	
	}

	var data = new Object();
	eval("data=" + resp);
	DBG.dumpObj(data, -1);

	var fault = data.Body.Fault;
	if (fault)
		throw new LsCsfeException(fault.Reason.Text, fault.Detail.Error.Code, "LsCsfeCommand.invoke", fault.Code.Value);
	if (data.Header && data.Header.context && data.Header.context.sessionId)
		LsCsfeCommand.setSessionId(data.Header.context.sessionId);

	return data;
}

LsCsfeCommand.setServerUri =
function(uri) {
	LsCsfeCommand.serverUri = uri;
}
