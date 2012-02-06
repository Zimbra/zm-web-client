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
    if (arguments.length == 0) { return; }
	var title = ZmMsg.createNewCalendar;
	var type = ZmOrganizer.CALENDAR;
    var back = new DwtDialog_ButtonDescriptor(ZmNewCalendarDialog.BACK_BUTTON, ZmMsg.back , DwtDialog.ALIGN_LEFT);
	ZmNewOrganizerDialog.call(this, parent, className, title, type, [back]);
    this.setButtonListener(ZmNewCalendarDialog.BACK_BUTTON, this._backButtonListener.bind(this));
    this.getButton(ZmNewCalendarDialog.BACK_BUTTON).setVisibility(false);
};

ZmNewCalendarDialog.prototype = new ZmNewOrganizerDialog;
ZmNewCalendarDialog.prototype.constructor = ZmNewCalendarDialog;




ZmNewCalendarDialog.BACK_BUTTON = ++DwtDialog.LAST_BUTTON;

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

/*
*   Overwritten the parent class method to include application specific params.
*/
ZmNewCalendarDialog.prototype._setupColorControl =
function() {
    var el = document.getElementById(this._colorSelectId);
	this._colorSelect = new ZmColorButton({parent:this,parentElement:el,hideNone:true});
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
        var url =  this._iCalData ? this._iCalData.url : "";
        if(url) {
            data.url = url;
            this._iCalData = null;
            delete this._iCalData;
        }
	}
	return data;
};

ZmNewCalendarDialog.prototype._createRemoteContentHtml =
function(html, idx) {
	return idx;
};

ZmNewCalendarDialog.prototype.setICalData =
function(iCalData) {
	this._iCalData = iCalData;
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

ZmNewCalendarDialog.prototype._backButtonListener =
function() {
    this.popdown();
};
