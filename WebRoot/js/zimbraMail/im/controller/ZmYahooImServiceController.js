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

ZmYahooImServiceController.prototype.getMyPresenceTooltip =
function(showText) {
	if (ZmImService.INSTANCE.isLoggedIn()) {
		this._presenceTooltipFormat = this._presenceTooltipFormat || new AjxMessageFormat(ZmMsg.presenceTooltipYahoo);
		return this._presenceTooltipFormat.format([ZmImService.INSTANCE.getMyAddress(), showText]);
	} else {
		return ZmMsg.presenceTooltipYahooLoggedOut;
	}
};

ZmYahooImServiceController.prototype.login =
function(loginParams) {
	AjxDispatcher.require(["IM"]);
	var id = appCtxt.get(ZmSetting.IM_YAHOO_ID);
	if (id) {
		this._loginById(callback, id, true);
	} else {
		this._showLoginDialog(loginParams);
	}
};

ZmYahooImServiceController.prototype.logout =
function() {
	ZmImService.INSTANCE.logout();
	this._saveYahooId("");
};

ZmYahooImServiceController.prototype.createPresenceMenu =
function(parent) {
	var statuses = [
		ZmOperation.IM_PRESENCE_OFFLINE,
		ZmOperation.IM_PRESENCE_CHAT,
		ZmOperation.IM_PRESENCE_AWAY,
		ZmOperation.IM_PRESENCE_XA,
		ZmOperation.IM_PRESENCE_DND
	];
	var result = new ZmPresenceMenu(parent, statuses);
	result.addOperation(ZmOperation.SEP);
	var logoutItem = result.addOperation(ZmOperation.IM_LOGOUT_YAHOO, new AjxListener(this, this.logout));
	result.addPopupListener(new AjxListener(this, this._presencePopupListener, [logoutItem]));
	return result;
};

ZmYahooImServiceController.prototype.getSupportsAccounts =
function() {
	return false;
};

ZmYahooImServiceController.prototype._showLoginDialog =
function(loginParams, id, remember, message) {
	var args = {
		callback: new AjxCallback(this, this._loginDialogCallback, [loginParams]),
		id: id,
		remember: remember,
		message: message
	};
	ZmYahooLoginDialog.getInstance().popup(args);
};

ZmYahooImServiceController.prototype._loginDialogCallback =
function(loginParams, data) {
	this._loginByPassword(loginParams, data.id, data.password, data.remember, data.dialog);
};

ZmYahooImServiceController.prototype._loginById =
function(loginParams, id, remember, dialog) {
	var soapDoc = AjxSoapDoc.create("GetYahooCookieRequest", "urn:zimbraMail");
	soapDoc.setMethodAttribute("user", id);
	var params = {
		asyncMode: true,
		soapDoc: soapDoc,
		callback: new AjxCallback(this, this._handleResponseGetYahooCookie, [loginParams, id, remember, dialog])
	};
	appCtxt.getAppController().sendRequest(params);
};

ZmYahooImServiceController.prototype._handleResponseGetYahooCookie =
function(loginParams, id, remember, dialog, response) {
	var responseData = response.getResponse().GetYahooCookieResponse;
	if (responseData.error) {
		this._showLoginDialog(loginParams, id, remember, ZmMsg.imPasswordExpired);
	} else {
		if (dialog) {
			dialog.popdown();
		}
		function trim(str) {
			return str.substring(0, str.indexOf(';'));
		}
		var cookie = ["Y=", trim(responseData.Y), "; T=", trim(responseData.T)].join("");
		ZmImService.INSTANCE.login(cookie, loginParams);
		if (remember) {
			this._saveYahooId(id);
		}
	}
};

ZmYahooImServiceController.prototype._loginByPassword =
function(loginParams, id, password, remember, dialog) {
	var soapDoc = AjxSoapDoc.create("GetYahooAuthTokenRequest", "urn:zimbraMail");
	soapDoc.setMethodAttribute("user", id);
	soapDoc.setMethodAttribute("password", password);
	var params = {
		asyncMode: true,
		soapDoc: soapDoc,
		callback: new AjxCallback(this, this._handleResponseGetYahooAuthToken, [loginParams, id, remember, dialog])
	};
	appCtxt.getAppController().sendRequest(params);
};

ZmYahooImServiceController.prototype._handleResponseGetYahooAuthToken =
function(loginParams, id, remember, dialog, response) {
	var responseData = response.getResponse().GetYahooAuthTokenResponse;
	if (responseData.failed) {
		this._showLoginDialog(loginParams, id, remember, ZmMsg.imPasswordFailed);
	} else {
		this._loginById(loginParams, id, remember, dialog);
	}
};

ZmYahooImServiceController.prototype._saveYahooId =
function(id) {
	var settings = appCtxt.getSettings(),
		setting = settings.getSetting(ZmSetting.IM_YAHOO_ID);
	if (setting.getValue() != id) {
		setting.setValue(id);
		settings.save([setting]);
	}
};

ZmYahooImServiceController.prototype._presencePopupListener =
function(logoutItem) {
	logoutItem.setEnabled(ZmImService.INSTANCE.isLoggedIn());
};

