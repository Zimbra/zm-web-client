/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2009, 2010 Zimbra, Inc.
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
 * @overview
 */

/**
 * Creates a new folder dialog.
 * @class
 * This class represents a new folder dialog.
 * 
 * @param	{DwtControl}	parent		the parent
 * @param	{String}	className		the class name
 * 
 * @extends		ZmNewOrganizerDialog
 */
ZmNewFolderDialog = function(parent, className) {
	var title = ZmMsg.createNewFolder;
	var type = ZmOrganizer.FOLDER;
	ZmNewOrganizerDialog.call(this, parent, className, title, type);
};

ZmNewFolderDialog.prototype = new ZmNewOrganizerDialog;
ZmNewFolderDialog.prototype.constructor = ZmNewFolderDialog;

ZmNewFolderDialog.prototype.toString = 
function() {
	return "ZmNewFolderDialog";
};

// Protected methods

// NOTE: new folder dialog doesn't show color
ZmNewFolderDialog.prototype._createColorContentHtml =
function(html, idx) {
	return idx;
};

ZmNewFolderDialog.prototype._setupColorControl =
function() {
};
