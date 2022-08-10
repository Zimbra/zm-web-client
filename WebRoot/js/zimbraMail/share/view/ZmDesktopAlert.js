/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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
	} else if (window.Notification) {
		this.useNotification = true;
    } else if (appCtxt.isOffline && window.platform && (AjxEnv.isWindows || AjxEnv.isMac)) {
        this.usePrism = true;
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
    if (this.useWebkit || this.useNotification) {
       return ZmMsg.showPopup;
    } else if (this.usePrism) {
		return AjxEnv.isMac ? ZmMsg.showPopupMac : ZmMsg.showPopup;
	}
};

ZmDesktopAlert.prototype.start =
function(title, message, sticky) {
    if (this.useWebkit) {
        var allowedCallback = this._showWebkitNotification.bind(this, title, message, sticky);
        this._checkWebkitPermission(allowedCallback);
	} else if (this.useNotification) {
		var notificationCallback = this._showNotification.bind(this, title, message, sticky);
		this._checkNotificationPermission(notificationCallback);
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
function(title, message, sticky) {
	sticky = sticky || false;
    // Icon: I chose to use the favIcon because it's already overridable by skins.
    // It's a little ugly though.
    // change for bug#67359: Broken notification image in chrome browser
    // //var icon = window.favIconUrl;
	var icon = skin.hints.notificationBanner;
    var popup = window.webkitNotifications.createNotification(icon, title, message);
    popup.show();
	popup.onclick = function() {popup.cancel();};
    if (sticky) {
        if (!ZmDesktopAlert.notificationArray) {
            ZmDesktopAlert.notificationArray = [];
        }
        ZmDesktopAlert.notificationArray.push(popup);
    }
    else {
        // Close the popup after 5 seconds.
        setTimeout(popup.cancel.bind(popup), 5000);
    }
};

/* Checks if we have permission to use the notification api. If so, or when the user
 * grants permission, allowedCallback is called.
 */
ZmDesktopAlert.prototype._checkNotificationPermission = function(allowedCallback) {
	var allowed = window.Notification.permission === 'granted';
	if (allowed) {
		allowedCallback();
	} else if (!ZmDesktopAlert.requestedPermission) {
		ZmDesktopAlert.requestedPermission = true; // Prevents multiple permission requests in one session.
		// Currently, cannot directly call requestPermission.  Re-test when Chrome 37 is released
		//window.Notification.requestPermission(this._checkNotificationPermission.bind(this, allowedCallback));
		var requestCallback = this._checkNotificationPermission.bind(this, allowedCallback);
		this.requestRequestPermission(requestCallback);
	}
};

// Chrome Notification only allows requesting permission in response to a user action, not a programmatic call.
// The issue may be fixed in Chrome 37, whenever that comes out.  See:
//   https://code.google.com/p/chromium/issues/detail?id=274284
ZmDesktopAlert.prototype.requestRequestPermission = function(requestCallback) {
	var msgDialog = appCtxt.getYesNoMsgDialog();
	var callback = 	this._doRequestPermission.bind(this, msgDialog, requestCallback);
	msgDialog.registerCallback(DwtDialog.YES_BUTTON, callback);
	msgDialog.setMessage(ZmMsg.notificationPermission, DwtMessageDialog.INFO_STYLE);
	msgDialog.popup();
};

ZmDesktopAlert.prototype._doRequestPermission = function(msgDialog, requestCallback) {
	msgDialog.popdown();
	window.Notification.requestPermission(requestCallback);
}

ZmDesktopAlert.prototype._showNotification = function(title, message, sticky) {
	var icon = skin.hints.notificationBanner;

	var popup = new Notification(title, { body: message, icon: icon});
	//popup.show();
	popup.onclick = function() {popup.close();};
	if (sticky) {
		if (!ZmDesktopAlert.notificationArray) {
			ZmDesktopAlert.notificationArray = [];
		}
		ZmDesktopAlert.notificationArray.push(popup);
	}
	else {
		// Close the popup after 5 seconds.
		setTimeout(popup.close.bind(popup), 5000);
	}
};

ZmDesktopAlert.prototype._notifyServiceCallback =
function(title, message, service) {
	try {
		service.show({ title: title, message: message }, function(){});
	} catch (err) {}
};

/**
 * Closes desktop notification if any during onbeforeunload event
 */
ZmDesktopAlert.closeNotification =
function() {
    var notificationArray = ZmDesktopAlert.notificationArray,
        popup;

    if (notificationArray) {
        while (popup = notificationArray.pop()) {
            //notifications may be already closed by the user go for try catch
            try {
                popup.cancel();
            }
            catch (e) {
            }
        }
    }
};
