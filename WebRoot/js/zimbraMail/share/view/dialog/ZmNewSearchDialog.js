/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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
 *
 */
ZmNewSearchDialog.prototype.popup =
function(params) {
	ZmNewOrganizerDialog.prototype.popup.call(this, params);

	var account = appCtxt.multiAccounts ? appCtxt.getActiveAccount() : null;

	var ov = this._getOverviewOrOverviewContainer();
	
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
		Dwt.setVisible(overviewDiv, !this._isGlobalSearch);
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
	this._treeIds = [ ZmOrganizer.SEARCH ];
};

// NOTE: don't show remote checkbox
ZmNewSearchDialog.prototype._createRemoteContentHtml =
function(html, idx) {
	return idx;
};
