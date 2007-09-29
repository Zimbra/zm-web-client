/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

function ZmNewFolderDialog(parent, msgDialog, className) {
	var title = ZmMsg.createNewFolder;
	var type = ZmOrganizer.FOLDER;
	ZmNewOrganizerDialog.call(this, parent, msgDialog, className, title, type);
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
