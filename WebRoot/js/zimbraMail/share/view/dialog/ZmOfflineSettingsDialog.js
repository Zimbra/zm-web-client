/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a dialog for offline settings which can be enabled or disabled.
 * @constructor
 * @class
 * @author  Hem Aravind
 *
 * @extends	DwtDialog
 */
ZmOfflineSettingsDialog = function() {

    var params = {
        parent : appCtxt.getShell(),
        className : "ZmOfflineSettingDialog",
        id : "ZmOfflineSettingDialog",
        title : ZmMsg.offlineSettings
    };
    DwtDialog.call(this, params);

    // set content
    this.setContent(this._contentHtml());

    this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okButtonListener));
};

ZmOfflineSettingsDialog.prototype = new DwtDialog;
ZmOfflineSettingsDialog.prototype.constructor = ZmOfflineSettingsDialog;

ZmOfflineSettingsDialog.prototype.toString =
function() {
    return "ZmOfflineSettingDialog";
};

/**
 * Gets the HTML that forms the basic framework of the dialog.
 *
 * @private
 */
ZmOfflineSettingsDialog.prototype._contentHtml =
function() {
    // identifiers
    var id = this._htmlElId;
    this._enableRadioBtnId = id + "_ENABLE_OFFLINE_RADIO";
    this._disableRadioBtnId = id + "_DISABLE_OFFLINE_RADIO";
    // content html
    return AjxTemplate.expand("prefs.Pages#OfflineSettings", {id : id, isWebClientOfflineSupported : appCtxt.isWebClientOfflineSupported});
};

ZmOfflineSettingsDialog.prototype._okButtonListener =
function(ev) {
    var enableRadioBtn = document.getElementById(this._enableRadioBtnId),
        disableRadioBtn = document.getElementById(this._disableRadioBtnId);

    if (enableRadioBtn && enableRadioBtn.checked) {
		ZmOfflineSettingsDialog.modifySetting(true);
    }
    else if (disableRadioBtn && disableRadioBtn.checked) {
		ZmOfflineSettingsDialog.modifySetting(false);
    }
    DwtDialog.prototype._buttonListener.call(this, ev);
};

/**
 * Pops-down the ZmOfflineSettingsDialog dialog.
 *
 * Radio button state restored based on the current setting.
 */
ZmOfflineSettingsDialog.prototype.popdown =
function() {
	var offlineBrowserKey = appCtxt.get(ZmSetting.WEBCLIENT_OFFLINE_BROWSER_KEY);
	var localOfflineBrowserKey = localStorage.getItem(ZmSetting.WEBCLIENT_OFFLINE_BROWSER_KEY);
	if (offlineBrowserKey && offlineBrowserKey.indexOf(localOfflineBrowserKey) !== -1) {
        var enableRadioBtn = document.getElementById(this._enableRadioBtnId);
        enableRadioBtn && (enableRadioBtn.checked = true);
    }
    else {
        var disableRadioBtn = document.getElementById(this._disableRadioBtnId);
        disableRadioBtn && (disableRadioBtn.checked = true);
    }
    DwtDialog.prototype.popdown.call(this);
};

/**
 * Gets the sign out confirmation dialog if webclient offline is enabled
 *
 * @return	{dialog}
 */
ZmOfflineSettingsDialog.showConfirmSignOutDialog =
function() {
    var dialog = appCtxt.getYesNoMsgDialog();
    dialog.reset();
	dialog.registerCallback(DwtDialog.YES_BUTTON, ZmOfflineSettingsDialog.modifySetting.bind(null, false, true, dialog));
    dialog.setMessage(ZmMsg.offlineSignOutWarning, DwtMessageDialog.WARNING_STYLE);
    dialog.popup();
};

ZmOfflineSettingsDialog.modifySetting =
function(offlineEnable, logOff, dialog) {
    if (logOff) {
        dialog.popdown();
        var setting = appCtxt.getSettings().getSetting(ZmSetting.WEBCLIENT_OFFLINE_BROWSER_KEY);
        if (setting) {
			setting.addChangeListener(ZmOfflineSettingsDialog._handleLogOff.bind(window));
        }
        else {
			ZmOfflineSettingsDialog._handleLogOff();
        }
    }
    var existingBrowserKey = appCtxt.get(ZmSetting.WEBCLIENT_OFFLINE_BROWSER_KEY);
    if (existingBrowserKey) {
        existingBrowserKey = existingBrowserKey.split(",");
    }
    if (offlineEnable) {
        var browserKey = new Date().getTime().toString();
        localStorage.setItem(ZmSetting.WEBCLIENT_OFFLINE_BROWSER_KEY, browserKey);
        if (existingBrowserKey) {
            AjxUtil.arrayAdd(existingBrowserKey, browserKey);
        }
        else {
            existingBrowserKey = [].concat(browserKey);
        }
    }
    else {
        if (existingBrowserKey) {
            AjxUtil.arrayRemove(existingBrowserKey, localStorage.getItem(ZmSetting.WEBCLIENT_OFFLINE_BROWSER_KEY));
        }
        localStorage.removeItem(ZmSetting.WEBCLIENT_OFFLINE_BROWSER_KEY);
		AjxCookie.deleteCookie(document, "ZM_OFFLINE_KEY", "/");
    }
    if (existingBrowserKey) {
        appCtxt.set(ZmSetting.WEBCLIENT_OFFLINE_BROWSER_KEY, existingBrowserKey.join());
    }
};

ZmOfflineSettingsDialog._handleLogOff =
function() {
	ZmOffline.deleteOfflineData();
	setTimeout(ZmZimbraMail.logOff, 2500);//Give some time for deleting indexeddb data and application cache data
};