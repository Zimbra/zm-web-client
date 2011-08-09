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


// Overridden properties
ZmNewCalendarDialog.prototype._folderLocationLabel = ZmMsg.newCalendarParent;
ZmNewCalendarDialog.prototype._folderNameAlreadyExistsMsg = ZmMsg.errorCalendarAlreadyExists;


ZmNewCalendarDialog.prototype.toString = 
function() {
	return "ZmNewCalendarDialog";
};

// Public methods


ZmNewCalendarDialog.prototype.popup =
function(params, account) {
    // Suppress checkboxes
    params = params || {};
    this._treeStyle = params.treeStyle || DwtTree.SINGLE_STYLE;
    ZmNewOrganizerDialog.prototype.popup.call(this, params, account);
}

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

ZmNewCalendarDialog.prototype._setupFolderControl =
function() {
    ZmNewOrganizerDialog.prototype._setupFolderControl.call(this);

    var folderTree = appCtxt.getFolderTree();
    if (!folderTree) return;

    var folders = folderTree.getByType(ZmOrganizer.CALENDAR);
    for (var i = 0; i < folders.length; i++) {
        var folder = folders[i];
        if (folder.link && folder.isReadOnly()) {
            this._omit[folder.id] = true;
        }
    }
}

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
