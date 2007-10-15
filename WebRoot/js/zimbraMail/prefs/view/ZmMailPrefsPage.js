/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
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

ZmMailPrefsPage = function(parent, section, controller) {
	ZmPreferencesPage.apply(this, arguments);
};
ZmMailPrefsPage.prototype = new ZmPreferencesPage;
ZmMailPrefsPage.prototype.constructor = ZmMailPrefsPage;

ZmMailPrefsPage.prototype.toString = function() {
	return "ZmMailPrefsPage";
};

//
// ZmPreferencesPage methods
//

ZmMailPrefsPage.prototype.reset = function(useDefaults) {
	ZmPreferencesPage.prototype.reset.apply(this, arguments);
	var cbox = this.getFormObject(ZmSetting.VACATION_MSG_ENABLED);
	if (cbox) {
		this._handleEnableVacationMsg(cbox);
	}
};

ZmMailPrefsPage.prototype._createControls = function() {
	ZmPreferencesPage.prototype._createControls.apply(this, arguments);
	var cbox = this.getFormObject(ZmSetting.VACATION_MSG_ENABLED);
	if (cbox) {
		this._handleEnableVacationMsg(cbox);
	}
};

ZmMailPrefsPage.prototype._setupCheckbox = function(id, setup, value) {
	var cbox = ZmPreferencesPage.prototype._setupCheckbox.apply(this, arguments);
	if (id == ZmSetting.VACATION_MSG_ENABLED) {
		cbox.addSelectionListener(new AjxListener(this, this._handleEnableVacationMsg, [cbox]));
	}
	return cbox;
};

//
// Protected methods
//

ZmMailPrefsPage.prototype._handleEnableVacationMsg = function(cbox, evt) {
	var textarea = this.getFormObject(ZmSetting.VACATION_MSG);
	if (textarea) {
		textarea.setEnabled(cbox.isSelected());
	}
};