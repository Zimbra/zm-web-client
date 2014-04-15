/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
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
        ZmOfflineSettingsDialog._modifySetting(true);
    }
    else if (disableRadioBtn && disableRadioBtn.checked) {
        ZmOfflineSettingsDialog._modifySetting(false);
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
    var enableRadioBtn,
        disableRadioBtn;

    if (appCtxt.get(ZmSetting.WEBCLIENT_OFFLINE_ENABLED)) {
        enableRadioBtn = document.getElementById(this._enableRadioBtnId);
        enableRadioBtn && (enableRadioBtn.checked = true);
    }
    else {
        disableRadioBtn = document.getElementById(this._disableRadioBtnId);
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
    dialog.registerCallback(DwtDialog.YES_BUTTON, ZmOfflineSettingsDialog._modifySetting.bind(null, false, true, dialog));
    dialog.setMessage(ZmMsg.offlineSignOutWarning, DwtMessageDialog.WARNING_STYLE);
    dialog.popup();
};

ZmOfflineSettingsDialog._modifySetting =
function(offlineEnable, logOff, dialog) {
    if (logOff) {
        dialog.popdown();
        var setting = appCtxt.getSettings().getSetting(ZmSetting.WEBCLIENT_OFFLINE_BROWSER_KEY);
        if (setting) {
            setting.addChangeListener(ZmOfflineSettingsDialog._handleLogOff);
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
        appCtxt.set(ZmSetting.WEBCLIENT_OFFLINE_ENABLED, true);
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
        appCtxt.set(ZmSetting.WEBCLIENT_OFFLINE_ENABLED, false);
        if (existingBrowserKey) {
            AjxUtil.arrayRemove(existingBrowserKey, localStorage.getItem(ZmSetting.WEBCLIENT_OFFLINE_BROWSER_KEY));
        }
        localStorage.removeItem(ZmSetting.WEBCLIENT_OFFLINE_BROWSER_KEY);
    }
    if (existingBrowserKey) {
        appCtxt.set(ZmSetting.WEBCLIENT_OFFLINE_BROWSER_KEY, existingBrowserKey.join());
    }
};

ZmOfflineSettingsDialog._handleLogOff =
function() {
    appCtxt.isWebClientOfflineSupported = false;
	ZmOffline.deleteOfflineData();
    setTimeout(ZmZimbraMail.logOff, 2500);//Give some time for deleting indexeddb data and application cache data
};