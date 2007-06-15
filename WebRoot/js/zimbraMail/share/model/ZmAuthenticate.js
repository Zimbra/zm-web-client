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

ZmAuthenticate = function(appCtxt) {
	if (arguments.length == 0) return;
	this._appCtxt = appCtxt;
};

ZmAuthenticate._isAdmin = false;

ZmAuthenticate.setAdmin =
function(isAdmin) {
	ZmAuthenticate._isAdmin = isAdmin;
};

ZmAuthenticate.prototype.toString = 
function() {
	return "ZmAuthenticate";
};

ZmAuthenticate.prototype.execute =
function(uname, pword, callback) {
	var command = new ZmCsfeCommand();
	var soapDoc;
	if (!ZmAuthenticate._isAdmin) {
		soapDoc = AjxSoapDoc.create("AuthRequest", "urn:zimbraAccount");
		var el = soapDoc.set("account", uname);
		el.setAttribute("by", "name");
	} else {
		soapDoc = AjxSoapDoc.create("AuthRequest", "urn:zimbraAdmin", null);
		soapDoc.set("name", uname);
	}
	soapDoc.set("virtualHost", location.hostname);	
	soapDoc.set("password", pword);
	var respCallback = new AjxCallback(this, this._handleResponseExecute, callback);
	command.invoke({soapDoc: soapDoc, noAuthToken: true, noSession: true, asyncMode: true, callback: respCallback})
};

ZmAuthenticate.prototype._handleResponseExecute =
function(callback, result) {
	if (!result.isException()) {
		var resp = result.getResponse().Body.AuthResponse;
		this._setAuthToken(resp);
	}

	if (callback) callback.run(result);
};

ZmAuthenticate.prototype._setAuthToken =
function(resp) {
	var lifetime = this._appCtxt.rememberMe() ? resp.lifetime : 0;
	// ignore sessionId so we get a <refresh> block
	ZmCsfeCommand.setAuthToken(resp.authToken, lifetime);
};
