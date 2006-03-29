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

function ZmNewNotebookDialog(appCtxt, parent, className) {
	var title = ZmMsg.createNewNotebook;
	var buttons = [ DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON ];
	DwtDialog.call(this, parent, className, title, buttons);
	
	this._appCtxt = appCtxt;
	
	var contentEl = this._createContentEl();
	var contentDiv = this._getContentDiv();
	contentDiv.appendChild(contentEl);
	
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._handleOkButton));
}

ZmNewNotebookDialog.prototype = new DwtDialog;
ZmNewNotebookDialog.prototype.constructor = ZmNewNotebookDialog;

ZmNewNotebookDialog.prototype.toString = 
function() {
	return "ZmNewNotebookDialog";
}

// Data

ZmNewNotebookDialog.prototype._nameFieldId;
ZmNewNotebookDialog.prototype._parentFolder;

// Public methods

ZmNewNotebookDialog.prototype.setParentFolder =
function(folder) {
	this._parentFolder = folder;
};

ZmNewNotebookDialog.prototype.popup =
function(loc) {
	// reset input fields
	this._nameInputEl.value = "";
	
	// show dialog
	ZmDialog.prototype.popup.call(this, loc);
}

// Protected methods

ZmNewNotebookDialog.prototype._handleOkButton = 
function(event) {
	// check name for presence and validity
	var name = AjxStringUtil.trim(this._nameInputEl.value);
	var msg = ZmFolder.checkName(name);
	
	// create folder
	var ex = null;
	var notebookId = null;
	if (!msg) {
		try {
			var parentFolderId = this._parentFolder ? this._parentFolder.id : null;
			var results = ZmNotebook.create(this._appCtxt, name, parentFolderId);
			notebookId = results.CreateFolderResponse.folder[0].id;
		}
		catch (ex) {
			msg = ZmMsg.unknownError;
			switch (ex.code) {
				case "mail.ALREADY_EXISTS": {
					msg = ZmMsg.folderNameExists;
					ex = null;
					break;
				}
				default: {
					msg = ex.getErrorMsg() || msg;
				}
			}
		}
	}
	
	// display error message
	if (msg) {
		var appController = this._appCtxt.getAppController();
		var errorDialog = appController.popupErrorDialog(msg, ex, null, true);
		return;
	}
	
	// default processing
	this.popdown();
};

ZmNewNotebookDialog.prototype._createContentEl = 
function() {
	// create controls
	this._nameInputEl = document.createElement("INPUT");
	//this._nameInputEl.autocomplete = "OFF";
	this._nameInputEl.type = "text";
	this._nameInputEl.className = "Field";
	
	// create HTML
	var table = document.createElement("TABLE");
	table.border = 0;
	table.cellSpacing = 3;
	table.cellPadding = 0;

	var nameRow = table.insertRow(table.rows.length);
	var nameLabelCell = nameRow.insertCell(nameRow.cells.length);
	nameLabelCell.className = "Label";
	nameLabelCell.innerHTML = ZmMsg.nameLabel;
	var nameInputCell = nameRow.insertCell(nameRow.cells.length);
	nameInputCell.appendChild(this._nameInputEl);

	return table;
};

ZmNewNotebookDialog.prototype._getSeparatorTemplate = function() {
	return "";
};
