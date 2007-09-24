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
 * Portions created by Zimbra are Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

ZmNewSearchDialog = function(parent, className) {

	ZmDialog.call(this, {parent:parent, className:className, title:ZmMsg.saveSearch});

	this._omit = {};
	this._omit[ZmFolder.ID_SPAM] = true;
	this._omit[ZmFolder.ID_DRAFTS] = true;
	this._setNameField(this._nameFieldId);
	this._folderTree = appCtxt.getFolderTree();
};

ZmNewSearchDialog.prototype = new ZmDialog;
ZmNewSearchDialog.prototype.constructor = ZmNewSearchDialog;

ZmNewSearchDialog.prototype.toString = 
function() {
	return "ZmNewSearchDialog";
};

ZmNewSearchDialog.prototype.popup =
function(params) {
	this._setOverview({treeIds:[ZmOrganizer.FOLDER, ZmOrganizer.SEARCH], fieldId:this._folderTreeCellId, omit:this._omit});
	this._folderTreeView = this._getOverview().getTreeView(ZmOrganizer.FOLDER);
	this._searchTreeView = this._getOverview().getTreeView(ZmOrganizer.SEARCH);
	this._search = params.search;
	this._searchTreeView.setSelected(this._folderTree.root, true);

	var overviewDiv = document.getElementById(this._overviewDivId);
	if (overviewDiv) {
		Dwt.setVisible(overviewDiv, params.showOverview)
	}

	ZmDialog.prototype.popup.call(this);
};

ZmNewSearchDialog.prototype._contentHtml = 
function() {
	this._nameFieldId = this._htmlElId + "_nameField";
	this._folderTreeCellId = this._htmlElId + "_folderTreeCell";
	this._overviewDivId = this._htmlElId + "_overviewDiv";

	return (AjxTemplate.expand("share.Dialogs#NewSearch", {id: this._htmlElId}));
};

ZmNewSearchDialog.prototype._okButtonListener =
function(ev) {
	var results = this._getSearchData();
	if (results)
		DwtDialog.prototype._buttonListener.call(this, ev, results);
};

ZmNewSearchDialog.prototype._getSearchData =
function() {
	// check name for presence and validity
	var name = AjxStringUtil.trim(this._nameField.value);
	var msg = ZmFolder.checkName(name);

	// make sure a parent was selected
	var parentFolder = this._getOverview().getSelected();
	if (!msg && !parentFolder) {
		msg = ZmMsg.searchNameNoLocation;
	}

	// make sure parent doesn't already have a child by this name
	if (!msg && parentFolder.hasChild(name)) {
		msg = ZmMsg.folderOrSearchNameExists;
	}
		
	// if we're creating a top-level search, check for conflict with top-level folder
	if (!msg && (parentFolder.id == ZmOrganizer.ID_ROOT) && this._folderTree.root.hasChild(name))
		msg = ZmMsg.folderOrSearchNameExists;

	return (msg ? this._showError(msg) : {parent:parentFolder, name:name, search:this._search});
};

ZmNewSearchDialog.prototype._enterListener =
function(ev) {
	var results = this._getSearchData();
	if (results) {
		this._runEnterCallback(results);
	}
};
