function LaAuthenticate(appCtxt) {
	if (arguments.length == 0) return;
	this._appCtxt = appCtxt;
}

LaAuthenticate._isAdmin = true;

LaAuthenticate.prototype.toString = 
function() {
	return "LaAuthenticate";
}

LaAuthenticate.prototype.execute =
function (uname, pword, isPublic) {
	var soapDoc = LsSoapDoc.create("AuthRequest", "urn:liquidAdmin", null);
	
//	var header = soapDoc.createHeaderElement();
//	var context = soapDoc.set("context", null, header);
//	context.setAttribute("xmlns", "urn:liquidAdmin");
//	soapDoc.set("nosession", null, context);
		
	soapDoc.set("name", uname);
	soapDoc.set("password", pword);
	var resp = LsCsfeCommand.invoke(soapDoc, true, null, null, true).firstChild;
	this._setAuthToken(resp);	
}

LaAuthenticate.prototype._setAuthToken =
function(resp) {
	var els = resp.childNodes;
	var len = els.length;
	var el, authToken, lifetime, sessionId;
	for (var i = 0; i < len; i++) {
		el = els[i];
		if (el.nodeName == "authToken")
			authToken = el.firstChild.nodeValue;
		else if (el.nodeName == "lifetime")
			lifetime = el.firstChild.nodeValue;
		else if (el.nodeName=="sessionId")
			sessionId = el.firstChild.nodeValue;
	}
	LsCsfeCommand.setAuthToken(authToken, lifetime, sessionId);
}
