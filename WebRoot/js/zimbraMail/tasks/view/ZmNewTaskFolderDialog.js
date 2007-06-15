/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is: Zimbra Collaboration Suite Web Client
 *
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
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
