/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * Creates a new search dialog.
 * @class
 * This class represents a new search dialog.
 * 
 * @param	{DwtControl}	parent		the parent
 * @param	{String}	className		the class name
 * 
 * @extends		ZmDialog
 */
ZmNewSearchDialog = function(parent, className) {

	ZmDialog.call(this, {parent:parent, className:className, title:ZmMsg.saveSearch, id:"SaveSearch"});

	this._omit = {};
	this._omit[ZmFolder.ID_SPAM] = true;
	this._omit[ZmFolder.ID_DRAFTS] = true;
	this._setNameField(this._nameFieldId);
};

ZmNewSearchDialog.prototype = new ZmDialog;
ZmNewSearchDialog.prototype.constructor = ZmNewSearchDialog;

ZmNewSearchDialog.prototype.toString = 
function() {
	return "ZmNewSearchDialog";
};

/**
 * Pops-up the dialog.
 * 
 * @param	{Hash}	params		a hash of parameters
 * @param	{String}	params.search		the search
 * @param	{Boolean}	params.showOverview	if <code>true</code>, make the overview visible
 * 
 */
ZmNewSearchDialog.prototype.popup =
function(params) {
	var account = appCtxt.multiAccounts ? appCtxt.getActiveAccount() : null;
	var overviewId = this._curOverviewId = (account ? ([this.toString(),account.name].join("-")) : this.toString());
	var overviewParams = {
		account: account,
		treeIds: [ZmOrganizer.FOLDER, ZmOrganizer.SEARCH],
		fieldId: this._folderTreeCellId,
		omit: this._omit,
		overviewId: overviewId
	};
	var ov = this._setOverview(overviewParams, true);
	this._folderTreeView = ov.getTreeView(ZmOrganizer.FOLDER);
	this._searchTreeView = ov.getTreeView(ZmOrganizer.SEARCH);
	this._search = params.search;
	this._searchTreeView.setSelected(appCtxt.getFolderTree(account).root, true);
	this._isGlobalSearch = appCtxt.multiAccounts && appCtxt.getSearchController().searchAllAccounts;

	if (appCtxt.multiAccounts) {
		this._searchTreeView.setVisible(true);
		this._makeOverviewVisible(overviewId);
	}

	var overviewDiv = document.getElementById(this._overviewDivId);
	if (overviewDiv) {
		Dwt.setVisible(overviewDiv, (params.showOverview && !this._isGlobalSearch));
	}

	ZmDialog.prototype.popup.call(this);
};

ZmNewSearchDialog.prototype._contentHtml = 
function() {
	this._nameFieldId 		= this._htmlElId + "_nameField";
	this._folderTreeCellId 	= this._htmlElId + "_folderTreeCell";
	this._overviewDivId 	= this._htmlElId + "_overviewDiv";

	return (AjxTemplate.expand("share.Dialogs#NewSearch", {id: this._htmlElId}));
};

ZmNewSearchDialog.prototype._okButtonListener =
function(ev) {
	var results = this._getSearchData();
	if (results) {
		DwtDialog.prototype._buttonListener.call(this, ev, results);
	}
};

ZmNewSearchDialog.prototype._getSearchData =
function() {

	// make sure a parent was selected
	var parentFolder = this._isGlobalSearch
		? appCtxt.getById(ZmOrganizer.ID_ROOT)
		: this._overview[this._curOverviewId].getSelected();

	// check name for presence and validity
	var name = AjxStringUtil.trim(this._nameField.value);
	var msg = ZmFolder.checkName(name, parentFolder);

	// make sure parent doesn't already have a child by this name
	if (!msg && parentFolder.hasChild(name)) {
		msg = ZmMsg.folderOrSearchNameExists;
	}
		
	// if we're creating a top-level search, check for conflict with top-level folder
	if (!msg && (parentFolder.id == ZmOrganizer.ID_ROOT) && appCtxt.getFolderTree().root.hasChild(name)) {
		msg = ZmMsg.folderOrSearchNameExists;
	}

	if (msg) {
		return this._showError(msg);
	} else {
		return {
			parent: parentFolder,
			isGlobal: this._isGlobalSearch,
			name: name,
			search: this._search
		};
	}
};

ZmNewSearchDialog.prototype._enterListener =
function(ev) {
	var results = this._getSearchData();
	if (results) {
		this._runEnterCallback(results);
	}
};

ZmNewSearchDialog.prototype._getTabGroupMembers =
function() {
	var list = [this._nameField];
	if (this._overview[this._curOverviewId]) {
		list.push(this._overview[this._curOverviewId]);
	}
	return list;
};
