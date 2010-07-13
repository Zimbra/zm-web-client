/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2009, 2010 Zimbra, Inc.
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

ZmNewCalendarDialog = function(parent, className) {
	var title = ZmMsg.createNewCalendar;
	var type = ZmOrganizer.CALENDAR;
	ZmNewOrganizerDialog.call(this, parent, className, title, type);
};

ZmNewCalendarDialog.prototype = new ZmNewOrganizerDialog;
ZmNewCalendarDialog.prototype.constructor = ZmNewCalendarDialog;

ZmNewCalendarDialog.prototype.toString = 
function() {
	return "ZmNewCalendarDialog";
};

// Public methods

ZmNewCalendarDialog.prototype.reset =
function(account) {
	ZmNewOrganizerDialog.prototype.reset.apply(this, arguments);
	this._excludeFbCheckbox.checked = false;
};

// Protected methods

ZmNewCalendarDialog.prototype._initColorSelect =
function(account) {
	var defaultColor = account && account.getDefaultColor();
	if (!defaultColor) {
		// call base class if no default color for this account type
		ZmNewOrganizerDialog.prototype._initColorSelect.apply(this, arguments);
	} else {
		var option = this._colorSelect.getOptionWithValue(defaultColor);
		this._colorSelect.setSelectedOption(option);
	}
};

ZmNewCalendarDialog.prototype._setupColorControl =
function() {
	this._colorSelect = new DwtSelect({parent:this});
	for (var i = 0; i < ZmOrganizer.COLOR_CHOICES.length; i++) {
        if(i == ZmOrganizer.C_NONE) continue;
		var choice = ZmOrganizer.COLOR_CHOICES[i];
		this._colorSelect.addOption(choice.label, i == 1, choice.value);
	}
	var colorTd = document.getElementById(this._colorSelectId);
	if (colorTd) {
		colorTd.appendChild(this._colorSelect.getHtmlElement());
	}
};

ZmNewCalendarDialog.prototype._getRemoteLabel =
function() {
	return ZmMsg.addRemoteAppts;
};

ZmNewCalendarDialog.prototype._createExtraContentHtml =
function(html, idx) {
	idx = this._createFreeBusyContentHtml(html, idx);
	return ZmNewOrganizerDialog.prototype._createExtraContentHtml.call(this, html, idx);
};

ZmNewCalendarDialog.prototype._createFreeBusyContentHtml =
function(html, idx) {
	this._excludeFbCheckboxId = this._htmlElId + "_excludeFbCheckbox";
	html[idx++] = AjxTemplate.expand("share.Dialogs#ZmNewCalDialogFreeBusy", {id:this._htmlElId});
	return idx;
};

// NOTE: new calendar dialog doesn't show overview
ZmNewCalendarDialog.prototype._createFolderContentHtml = 
function(html, idx) {
	return idx;
};

ZmNewCalendarDialog.prototype._setupExtraControls =
function() {
	ZmNewOrganizerDialog.prototype._setupExtraControls.call(this);
	this._setupFreeBusyControl();
};

ZmNewCalendarDialog.prototype._setupFreeBusyControl =
function() {
	this._excludeFbCheckbox = document.getElementById(this._excludeFbCheckboxId);
};

/** 
 * Checks the input for validity and returns the following array of values:
 * <ul>
 * <li> parentFolder
 * <li> name
 * <li> color
 * <li> URL
 * <li> excludeFB
 * </ul>
 * 
 * @private
 */
ZmNewCalendarDialog.prototype._getFolderData =
function() {
	var data = ZmNewOrganizerDialog.prototype._getFolderData.call(this);
	if (data) {
		data.f = this._excludeFbCheckbox.checked ? "b#" : "#";
	}
	return data;
};

/**
 * @Override Added for tabindexing checkboxes.
 * 
 * @private
 */
//For bug 21985
ZmNewCalendarDialog.prototype._getTabGroupMembers =
function() {
	var list = ZmNewOrganizerDialog.prototype._getTabGroupMembers.call(this);
    if (this._excludeFbCheckbox) {
		list.push(this._excludeFbCheckbox);
	}
    if (this._remoteCheckboxField) {
		list.push(this._remoteCheckboxField);
	}
    return list;
};
