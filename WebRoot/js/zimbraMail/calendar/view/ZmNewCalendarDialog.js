/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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
