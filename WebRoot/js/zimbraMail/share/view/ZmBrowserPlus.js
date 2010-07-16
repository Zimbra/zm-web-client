/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Singleton wrapper of BrowserPlus.
 * @class
 * @private
 */
ZmBrowserPlus = function() {
};

ZmBrowserPlus.prototype.toString =
function() {
	return "ZmBrowserPlus";
};

ZmBrowserPlus.getInstance =
function() {
	return ZmBrowserPlus.INSTANCE = ZmBrowserPlus.INSTANCE || new ZmBrowserPlus();
};

/**
 * Loads a browser plus service.
 * @param serviceObj    [Object]		Description of service object.
 * @param callback 		[AjxCallback] 	Called when service is available.
 * @param errorCallback [AjxCallback] 	Called if service does not load.
 */
ZmBrowserPlus.prototype.require =
function(serviceObj, callback, errorCallback) {
	if (!errorCallback) {
		this._defaultErrorCallbackObj = this._defaultErrorCallbackObj || new AjxCallback(this, this._defaultErrorCallback);
		errorCallback = this._defaultErrorCallbackObj; 
	}

	if (YAHOO.bp.isInitialized()) {
		this._require(serviceObj, callback, errorCallback);
	} else {
		var self = this;
		function onInit(result) {
			self._onInit(result, serviceObj, callback, errorCallback);
		}
		YAHOO.bp.init({ locale: appCtxt.get(ZmSetting.LOCALE_NAME) }, onInit);
	}
};

ZmBrowserPlus.prototype._onInit =
function(result, serviceObj, callback, errorCallback) {
	if (result.success) {
		this._require(serviceObj, callback, errorCallback);
		var requireArgs = {
			services: [serviceObj],
			progressCallback: function() {}
		};
		var self = this;
		function requireCallback(result) {
			self._onRequire(result, serviceObj, callback, errorCallback);
		}
		YAHOO.bp.require(requireArgs, requireCallback);
	} else if (errorCallback) {
		errorCallback.run(result);
	}
};

ZmBrowserPlus.prototype._require =
function(serviceObj, callback, errorCallback) {
	var requireArgs = {
		services: [serviceObj],
		progressCallback: function() {}
	};
	var self = this;
	function requireCallback(result) {
		self._onRequire(result, serviceObj, callback, errorCallback);
	}
	YAHOO.bp.require(requireArgs, requireCallback);
};

ZmBrowserPlus.prototype._onRequire =
function(result, serviceObj, callback, errorCallback) {
	if (result.success) {
		callback.run(YAHOO.bp[serviceObj.service]);
	} else if (errorCallback) {
		errorCallback.run(result);
	}
};

ZmBrowserPlus.prototype._defaultErrorCallback =
function(result) {
	DBG.println(AjxDebug.DBG1, "BrowserPlus error: " + (result ? (result.error + " - " + result.verboseError) : result));
	switch (result.error) {
		case "bpPlugin.platformDisabled": // BrowserPlus is disabled.
			appCtxt.setStatusMsg({ msg: ZmMsg.browserPlusDisabled, level: ZmStatusView.LEVEL_WARNING });
			break;
		case "core.permissionError": // User denied permission to use the service. 
			break;
		case "bp.notInstalled": // BrowserPlus isn't installed.
			var dialog = appCtxt.getMsgDialog();
			dialog.setMessage(ZmMsg.browserPlusMissing, DwtMessageDialog.CRITICAL_STYLE);
			dialog.popup();
			break;
	}
};

