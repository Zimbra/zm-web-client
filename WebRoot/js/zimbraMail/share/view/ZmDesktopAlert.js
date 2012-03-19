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
 * Singleton alert class that alerts the user by popping up a message on the desktop.
 * @class
 * @private
 */
ZmDesktopAlert = function() {
    if (window.webkitNotifications) {
        this.useWebkit = true;
    } else if (appCtxt.isOffline && window.platform && (AjxEnv.isWindows || AjxEnv.isMac)) {
        this.usePrism = true;
    } else {
        this.useBrowserPlus = true;
    }
};

ZmDesktopAlert.prototype = new ZmAlert;
ZmDesktopAlert.prototype.constructor = ZmDesktopAlert;

ZmDesktopAlert.prototype.toString =
function() {
	return "ZmDesktopAlert";
};

ZmDesktopAlert.getInstance =
function() {
	return ZmDesktopAlert.INSTANCE = ZmDesktopAlert.INSTANCE || new ZmDesktopAlert();
};

/**
 * Returns text to show in a prefs page next to the checkbox to enable this type of alert.
 */
ZmDesktopAlert.prototype.getDisplayText =
function() {
    if (this.useWebkit) {
       return ZmMsg.showPopup;
    } else if (this.usePrism) {
		return AjxEnv.isMac ? ZmMsg.showPopupMac : ZmMsg.showPopup;
	} else {
		return ZmMsg.showPopupBrowserPlus;
	}
};

/**
 * Returns any link text to show in a prefs page, for example a link to install browser plus if necessary.
 */
ZmDesktopAlert.prototype.getLinkText =
function() {
	return this.useBrowserPlus ? ZmMsg.showPopupBrowserPlusLink : "";
};

ZmDesktopAlert.prototype.start =
function(title, message) {
    if (this.useWebkit) {
        var allowedCallback = this._showWebkitNotification.bind(this, title, message);
        this._checkWebkitPermission(allowedCallback);
    } else if (this.usePrism) {
		if (AjxEnv.isMac) {
			try {
				window.platform.showNotification(title, message, "resource://webapp/icons/default/launcher.icns");
			} catch (err) {}
		}
		else if (AjxEnv.isWindows) {
			try {
				window.platform.icon().showNotification(title, message, 5);
			} catch (err) {}
		}
	} else {
		AjxDispatcher.require([ "BrowserPlus" ]);
		var serviceObj = { service: "Notify", version: "2", minversion: "2.0.9" };
		var callback = new AjxCallback(this, this._notityServiceCallback, [title, message]);
		var errorCallback = new AjxCallback(this, this._notityServiceErrorCallback);
		ZmBrowserPlus.getInstance().require(serviceObj, callback, errorCallback);
	}
};

/* Checks if we have permission to use webkit notifications. If so, or when the user
 * grants permission, allowedCallback is called.
 */
ZmDesktopAlert.prototype._checkWebkitPermission =
function(allowedCallback) {
    var allowed = window.webkitNotifications.checkPermission() == 0;
    if (allowed) {
        allowedCallback();
    } else if (!ZmDesktopAlert.requestedPermission) {
        ZmDesktopAlert.requestedPermission = true; // Prevents multiple permission requests in one session.
        window.webkitNotifications.requestPermission(this._checkWebkitPermission.bind(this, allowedCallback));
    }
};

ZmDesktopAlert.prototype._showWebkitNotification =
function(title, message) {
    // Icon: I chose to use the favIcon because it's already overridable by skins.
    // It's a little ugly though.
    // change for bug#67359: Broken notification image in chrome browser
    // //var icon = window.favIconUrl;
    var icon = [appContextPath, "/img/logo/ImgZimbraLogo_48.gif"].join("");
    var popup = window.webkitNotifications.createNotification(icon, title, message);
    popup.show();

    // Close the popup after 5 seconds.
    setTimeout(popup.cancel.bind(popup), 5000);
};

ZmDesktopAlert.prototype._notityServiceCallback =
function(title, message, service) {
	try {
		service.show({ title: title, message: message }, function(){});
	} catch (err) {}
};

ZmDesktopAlert.prototype._notityServiceErrorCallback =
function(result) {
	DBG.println(AjxDebug.DBG1, "BrowserPlus error: " + (result ? (result.error + " - " + result.verboseError) : result));
};

