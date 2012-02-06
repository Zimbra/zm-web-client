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
 * @extends		ZmNewOrganizerDialog
 */
ZmNewSearchDialog = function(parent, className) {

	ZmNewOrganizerDialog.call(this, parent, className, ZmMsg.saveSearch, ZmOrganizer.SEARCH);

};

ZmNewSearchDialog.prototype = new ZmNewOrganizerDialog;
ZmNewSearchDialog.prototype.constructor = ZmNewSearchDialog;

ZmNewSearchDialog.prototype.toString = 
function() {
	return "ZmNewSearchDialog";
};

//overriden properties

ZmNewSearchDialog.prototype._folderLocationLabel = ZmMsg.newSearchParent;


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
	ZmNewOrganizerDialog.prototype.popup.call(this, params);

	var account = appCtxt.multiAccounts ? appCtxt.getActiveAccount() : null;

	var ov = this._getOverviewOrOverviewContainer();
	
	this._folderTreeView = ov.getTreeView(ZmOrganizer.FOLDER);
	this._searchTreeView = ov.getTreeView(ZmOrganizer.SEARCH);
	this._search = params.search;
	this._searchTreeView.setSelected(appCtxt.getFolderTree(account).root, true);
	this._isGlobalSearch = appCtxt.multiAccounts && appCtxt.getSearchController().searchAllAccounts;

	if (appCtxt.multiAccounts) {
		this._searchTreeView.setVisible(true);
		this._makeOverviewVisible(this._curOverviewId);
	}

	var overviewDiv = document.getElementById(this._folderTreeCellId);
	if (overviewDiv) {
		Dwt.setVisible(overviewDiv, (params.showOverview && !this._isGlobalSearch));
	}

};


ZmNewSearchDialog.prototype._getFolderData =
function() {

	var ret = ZmNewOrganizerDialog.prototype._getFolderData.call(this);
	if (!ret) {
		return;
	}

	ret.isGlobal = this._isGlobalSearch;
	ret.search = this._search;

	return ret;
};


/**
 * @private
 */
ZmNewSearchDialog.prototype._setupFolderControl =
function(){
    ZmNewOrganizerDialog.prototype._setupFolderControl.call(this);
	this._treeIds = [ZmOrganizer.FOLDER, ZmOrganizer.SEARCH];
};

// NOTE: don't show remote checkbox
ZmNewSearchDialog.prototype._createRemoteContentHtml =
function(html, idx) {
	return idx;
};
