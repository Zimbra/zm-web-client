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

/**
* Creates an address book tree controller.
* @constructor
* @class
* This class is a controller for the tree view used by the address book 
* application. This class uses the support provided by ZmOperation. 
*
* @author Parag Shah
* @param appCtxt	[ZmAppCtxt]		main (singleton) app context
* @param type		[constant]		type of organizer we are displaying/controlling
* @param dropTgt	[DwtDropTgt]	drop target for this type
*/
function ZmAddrBookTreeController(appCtxt, type, dropTgt) {
	if (arguments.length === 0) return;

	type = type || ZmOrganizer.ADDRBOOK;
	dropTgt = dropTgt || (new DwtDropTarget(ZmContact));

	ZmTreeController.call(this, appCtxt, type, dropTgt);

	this._listeners[ZmOperation.NEW_ADDRBOOK] = new AjxListener(this, this._newAddrBookListener);
	this._listeners[ZmOperation.RENAME_FOLDER] = new AjxListener(this, this._renameListener);
	this._listeners[ZmOperation.EDIT_PROPS] = new AjxListener(this, this._editPropsListener);
};

ZmAddrBookTreeController.prototype = new ZmTreeController();
ZmAddrBookTreeController.prototype.constructor = ZmAddrBookTreeController;


// Public methods

ZmAddrBookTreeController.prototype.toString = 
function() {
	return "ZmAddrBookTreeController";
};

// Enables/disables operations based on the given organizer ID
ZmAddrBookTreeController.prototype.resetOperations = 
function(parent, type, id) {
	parent.enableAll(true);

	var addrBook = this._dataTree.getById(id);
	if (addrBook && addrBook.isSystem()) {
		parent.enable([ZmOperation.DELETE, ZmOperation.MOVE, ZmOperation.RENAME_FOLDER], false);
	}
};


// Protected methods

// Returns a list of desired header action menu operations
ZmAddrBookTreeController.prototype._getHeaderActionMenuOps =
function() {
	return [ZmOperation.NEW_ADDRBOOK];
};

// Returns a list of desired action menu operations
ZmAddrBookTreeController.prototype._getActionMenuOps =
function() {
	var ops = [];
	/* TODO:
	if (this._appCtxt.get(ZmSetting.SHARING_ENABLED)) {
		ops.push(ZmOperation.SHARE_ADDRBOOK);
	}*/
	ops.push(ZmOperation.DELETE, ZmOperation.MOVE, ZmOperation.RENAME_FOLDER, ZmOperation.EDIT_PROPS);
	return ops;
};

/*
* Returns a "Rename Folder" dialog.
*/
ZmAddrBookTreeController.prototype._getRenameDialog =
function() {
	return this._appCtxt.getRenameFolderDialog();
};

/*
* Returns a title for moving a folder.
*/
ZmAddrBookTreeController.prototype._getMoveDialogTitle =
function() {
	return AjxMessageFormat.format(ZmMsg.moveAddrBook, this._pendingActionData.name);
};


// Listeners

ZmAddrBookTreeController.prototype._newAddrBookListener = 
function(ev) {
	if (!this._newAddrBookDlg) {
		this._newAddrBookDlg = new ZmNewAddrBookDialog(this._appCtxt.getShell());
	}
	this._pendingActionData = this._getActionedOrganizer(ev);
	this._showDialog(this._newAddrBookDlg, this._newFolderCallback, this._pendingActionData);
};

ZmAddrBookTreeController.prototype._editPropsListener = 
function(ev) {
	// TODO
	DBG.println("TODO: editPropsListener");
};


// Callbacks

ZmAddrBookTreeController.prototype._newFolderCallback =
function(parent, name) {
	this._newAddrBookDlg.popdown();
	var ftc = this._appCtxt.getOverviewController().getTreeController(ZmOrganizer.ADDRBOOK);
	ftc._doCreate(parent, name);
};
