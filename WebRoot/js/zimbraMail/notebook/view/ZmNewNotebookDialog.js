/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
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

ZmNewNotebookDialog = function(parent, className) {
	var title = ZmMsg.createNewNotebook;
	var type = ZmOrganizer.NOTEBOOK;
	ZmNewOrganizerDialog.call(this, parent, className, title, type);
}

ZmNewNotebookDialog.prototype = new ZmNewOrganizerDialog;
ZmNewNotebookDialog.prototype.constructor = ZmNewNotebookDialog;

ZmNewNotebookDialog.prototype.toString = 
function() {
	return "ZmNewNotebookDialog";
}

// Protected methods

// NOTE: don't show remote checkbox
ZmNewNotebookDialog.prototype._createRemoteContentHtml =
function(html, idx) {
	return idx;
};
