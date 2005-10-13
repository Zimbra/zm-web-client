/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmCalendarTreeController(appCtxt, type, dropTgt) {
	if (arguments.length == 0) return;
	
	type = type ? type : ZmOrganizer.CALENDAR;
	dropTgt = dropTgt ? dropTgt : new DwtDropTarget(ZmAppt);
	
	ZmTreeController.call(this, appCtxt, type, dropTgt);

	this._listeners[ZmOperation.EDIT_PROPS] = new AjxListener(this, this._editPropsListener);
}

ZmCalendarTreeController.prototype = new ZmTreeController;
ZmCalendarTreeController.prototype.constructor = ZmCalendarTreeController;

// Protected methods

// Returns a list of desired header action menu operations
ZmCalendarTreeController.prototype._getHeaderActionMenuOps = function() {
	return null;
}

// Returns a list of desired action menu operations
ZmCalendarTreeController.prototype._getActionMenuOps = function() {
	return [ ZmOperation.EDIT_PROPS ];
}

// Returns the dialog for organizer creation
ZmCalendarTreeController.prototype._getNewDialog = function() {
	alert("TODO: get new dialog");
}

// Returns the dialog for renaming an organizer
ZmCalendarTreeController.prototype._getRenameDialog = function() {
	alert("TODO: get rename dialog");
}

// Method that is run when a tree item is left-clicked
ZmCalendarTreeController.prototype._itemClicked = function() {
	alert("TODO: item clicked");
}

// Handles a drop event
ZmCalendarTreeController.prototype._dropListener = function() {
	alert("TODO: drop listener");
}

// Returns an appropriate title for the "Move To" dialog
ZmCalendarTreeController.prototype._getMoveDialogTitle = function() {
	alert("TODO: get move dialog title");
}

// Listener callbacks

ZmCalendarTreeController.prototype._editPropsListener = function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);

	var folderPropsDialog = this._appCtxt.getFolderPropsDialog();
	var folder = this._pendingActionData;
	folderPropsDialog.setFolder(folder);
	folderPropsDialog.popup();
}

// Other methods

ZmCalendarTreeController.prototype.toString = function() {
	return "ZmCalendarTreeController";
}