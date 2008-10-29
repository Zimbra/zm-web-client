/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008 Zimbra, Inc.
 *
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 *
 * ***** END LICENSE BLOCK *****
 */

ZmYahooImServiceController = function() {
	ZmImServiceController.call(this, true);

	// Create the service model object.
	new ZmYahooImService();
}

ZmYahooImServiceController.prototype = new ZmImServiceController;
ZmYahooImServiceController.prototype.constructor = ZmYahooImServiceController;


// Public methods

ZmYahooImServiceController.prototype.toString =
function() {
	return "ZmYahooImServiceController";
};

ZmYahooImServiceController.prototype.login =
function(callback) {
	//TODO: bad fake ui...
	AjxDispatcher.require(["IM"]);
	var dialogArgs = {
		title: "[What's your Yahoo! ID?]",
		label: "[ID]",
		callback: new AjxCallback(this, this._yahooIdOkCallback, [callback])
	};
	ZmPromptDialog.getInstance().popup(dialogArgs);
};

ZmYahooImServiceController.prototype._yahooIdOkCallback =
function(callback, data) {
	if (data.value) {
		data.dialog.popdown();
		this._loginById(callback, data.value);
	}
};

ZmYahooImServiceController.prototype._loginById =
function(callback, id) {
	var soapDoc = AjxSoapDoc.create("GetYahooCookieRequest", "urn:zimbraMail");
	soapDoc.setMethodAttribute("user", id);
	var params = {
		asyncMode: true,
		soapDoc: soapDoc,
		callback: new AjxCallback(this, this._handleResponseGetYahooCookie, [callback, id])
	};
	appCtxt.getAppController().sendRequest(params);
};

ZmYahooImServiceController.prototype._handleResponseGetYahooCookie =
function(callback, id, response) {
	var responseData = response.getResponse().GetYahooCookieResponse;
	if (responseData.error) {
/////////////TODO: bad fake ui junk..........		
		AjxDispatcher.require(["IM"]);
		var dialogArgs = {
			title: "[What's the password for " + id + "@yahoo.com?]",
			label: "[Password]",
			callback: new AjxCallback(this, this._passwordOkCallback, [callback, id])
		};
		ZmPromptDialog.getInstance().popup(dialogArgs);
	} else {
		function trim(str) {
			return str.substring(0, str.indexOf(';'));
		}
		var cookie = ["Y=", trim(responseData.Y), "; T=", trim(responseData.T)].join("");
		ZmImService.INSTANCE.login(cookie, callback);
	}
};

ZmYahooImServiceController.prototype._passwordOkCallback =
function(callback, id, data) {
	data.dialog.popdown();
	var soapDoc = AjxSoapDoc.create("GetYahooAuthTokenRequest", "urn:zimbraMail");
	soapDoc.setMethodAttribute("user", id);
	soapDoc.setMethodAttribute("password", data.value);
	var params = {
		asyncMode: true,
		soapDoc: soapDoc,
		callback: new AjxCallback(this, this._handleResponseGetYahooAuthToken, [callback, id])
	};
	appCtxt.getAppController().sendRequest(params);
};

ZmYahooImServiceController.prototype._handleResponseGetYahooAuthToken =
function(callback, id, response) {
	var responseData = response.getResponse().GetYahooAuthTokenResponse;
	if (responseData.failed) {
		alert('bad password, dude.')
	} else {
		this._loginById(callback, id);
	}
};

ZmYahooImServiceController.prototype.getPresenceOperations =
function() {
	return [
		ZmOperation.IM_PRESENCE_OFFLINE,
		ZmOperation.IM_PRESENCE_ONLINE,
		ZmOperation.IM_PRESENCE_DND
	];
};
