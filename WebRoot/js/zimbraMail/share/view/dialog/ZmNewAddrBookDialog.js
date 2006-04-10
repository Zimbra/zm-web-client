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
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmNewAddrBookDialog(parent, msgDialog, className) {
	ZmDialog.call(this, parent, msgDialog, className, ZmMsg.createNewAddrBook);

	this.setContent(this._contentHtml());
	this._setNameField(this._nameFieldId);

	this._setOverview(ZmNewAddrBookDialog._OVERVIEW_ID, this._folderTreeCellId, [ZmOrganizer.ADDRBOOK]);
	this._folderTreeView = this._treeView[ZmOrganizer.ADDRBOOK];
	this._folderTree = this._appCtxt.getTree(ZmOrganizer.ADDRBOOK);
};

ZmNewAddrBookDialog._OVERVIEW_ID = "ZmNewAddrBookDialog";

ZmNewAddrBookDialog.prototype = new ZmDialog;
ZmNewAddrBookDialog.prototype.constructor = ZmNewAddrBookDialog;


// Public methods

ZmNewAddrBookDialog.prototype.toString = 
function() {
	return "ZmNewAddrBookDialog";
};

ZmNewAddrBookDialog.prototype.popup =
function(folder, loc) {
	folder = folder ? folder : this._folderTree.root;

	this._folderTreeView.setSelected(folder);
	if (folder.id == ZmOrganizer.ID_ROOT) {
		var ti = this._folderTreeView.getTreeItemById(folder.id);
		ti.setExpanded(true);
	}
	
	ZmDialog.prototype.popup.call(this, loc);
};


// Private / protected methods

ZmNewAddrBookDialog.prototype._contentHtml = 
function() {
	this._nameFieldId = Dwt.getNextId();
	this._folderTreeCellId = Dwt.getNextId();	

	var html = new Array();
	var idx = 0;
	html[idx++] = "<table cellpadding=0 cellspacing=5 border=0>";
	html[idx++] = "<tr valign='center'><td class='Label'>";
	html[idx++] = ZmMsg.nameLabel;
	html[idx++] = "</td>";
	html[idx++] = "<td><input autocomplete='off' type='text' class='Field' id='";
	html[idx++] = this._nameFieldId;
	html[idx++] = "' /></td></tr>";
	
	html[idx++] = "<tr><td class='Label' colspan=2>";
	html[idx++] = ZmMsg.newFolderParent;
	html[idx++] = ":</td></tr>";
	html[idx++] = "<tr><td colspan=2 id='";
	html[idx++] = this._folderTreeCellId;
	html[idx++] = "'/></tr>";
	html[idx++] = "</table>";
	
	return html.join("");
};

ZmNewAddrBookDialog.prototype._getFolderData =
function() {
	// check name for presence and validity
	var name = AjxStringUtil.trim(this._nameField.value);
	var msg = ZmFolder.checkName(name);

	// make sure a parent was selected
	var parentFolder = this._folderTreeView.getSelected();
	if (!msg && !parentFolder)
		msg = ZmMsg.folderNameNoLocation;

	// make sure parent doesn't already have a child by this name
	if (!msg && parentFolder.hasChild(name))
		msg = ZmMsg.folderOrSearchNameExists;

	// if we're creating a top-level folder, check for conflict with top-level search
	if (!msg && (parentFolder.id == ZmOrganizer.ID_ROOT)) {
		var searchTree = this._appCtxt.getTree(ZmOrganizer.SEARCH);
		if (searchTree && searchTree.root.hasChild(name))
			msg = ZmMsg.folderOrSearchNameExists;
	}

	return (msg ? this._showError(msg) : [parentFolder, name]);
};


// Listeners

ZmNewAddrBookDialog.prototype._okButtonListener =
function(ev) {
	var results = this._getFolderData();
	if (results) {
		DwtDialog.prototype._buttonListener.call(this, ev, results);
	}
};

ZmNewAddrBookDialog.prototype._enterListener =
function(ev) {
	var results = this._getFolderData();
	if (results) {
		this._runEnterCallback(results);
	}
};
