/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
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

ZmNewTaskFolderDialog = function(parent, className) {
	ZmNewOrganizerDialog.call(this, parent, className, ZmMsg.createNewTaskFolder, ZmOrganizer.TASKS);
};

ZmNewTaskFolderDialog.prototype = new ZmNewOrganizerDialog;
ZmNewTaskFolderDialog.prototype.constructor = ZmNewTaskFolderDialog;


// Public methods

ZmNewTaskFolderDialog.prototype.toString =
function() {
	return "ZmNewTaskFolderDialog";
};


// Protected methods

// overload since we always want to init the color to grey
ZmNewTaskFolderDialog.prototype._initColorSelect =
function() {
	var option = this._colorSelect.getOptionWithValue(ZmOrganizer.C_ORANGE);
	this._colorSelect.setSelectedOption(option);
};

// overload so we dont show this
ZmNewTaskFolderDialog.prototype._createRemoteContentHtml =
function(html, idx) {
	return idx;
};

// overload so we dont show this
ZmNewTaskFolderDialog.prototype._createFolderContentHtml =
function(html, idx) {
	return idx;
};
