/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * Creates a rename folder dialog.
 * @class
 * This class represents a rename folder dialog.
 * 
 * @param	{DwtComposite}	parent		the parent
 * @param	{String}	className		the class name
 *  
 * @extends		ZmDialog
 */
ZmRenameFolderDialog = function(parent, className) {

	ZmDialog.call(this, {parent:parent, className:className, title:ZmMsg.renameFolder, id:"RenameFolderDialog"});

	this._setNameField(this._nameFieldId);
};

ZmRenameFolderDialog.prototype = new ZmDialog;
ZmRenameFolderDialog.prototype.constructor = ZmRenameFolderDialog;

ZmRenameFolderDialog.prototype.toString = 
function() {
	return "ZmRenameFolderDialog";
};

/**
 * Pops-up the dialog.
 * 
 * @param	{ZmFolder}		folder		the folder
 * @param	{Object}		[source]	(not used)
 */
ZmRenameFolderDialog.prototype.popup =
function(folder, source) {
	ZmDialog.prototype.popup.call(this);
	var title = (folder.type == ZmOrganizer.SEARCH) ? ZmMsg.renameSearch : ZmMsg.renameFolder;
	this.setTitle(title + ': ' + folder.getName(false, ZmOrganizer.MAX_DISPLAY_NAME_LENGTH));
	this._nameField.value = folder.getName(false, null, true);
	this._folder = folder;
};

ZmRenameFolderDialog.prototype._contentHtml = 
function() {
	this._nameFieldId = this._htmlElId + "_name";
	var subs = {id:this._htmlElId, newLabel:ZmMsg.newName};
	return AjxTemplate.expand("share.Dialogs#ZmRenameDialog", subs);
};

ZmRenameFolderDialog.prototype._okButtonListener =
function(ev) {
	var results = this._getFolderData();
	if (results) {
		DwtDialog.prototype._buttonListener.call(this, ev, results);
	}
};

ZmRenameFolderDialog.prototype._getFolderData =
function() {
	// check name for presence and validity
	var name = AjxStringUtil.trim(this._nameField.value);
	var msg = ZmFolder.checkName(name, this._folder.parent);

	// make sure another folder with this name doesn't already exist at this level
	if (!msg) {
		var folder = this._folder.parent.getByName(name);
        var folderType = appCtxt.getFolderTree(appCtxt.getActiveAccount()).getFolderTypeByName(name);
        if (folder && (folder.id != this._folder.id)) {
			msg = AjxMessageFormat.format(ZmMsg.errorAlreadyExists, [name,folderType.toLowerCase()]);
		}
	}

	return (msg ? this._showError(msg) : [this._folder, name]);
};

ZmRenameFolderDialog.prototype._enterListener =
function(ev) {
	var results = this._getFolderData();
	if (results) {
		this._runEnterCallback(results);
	}
};
