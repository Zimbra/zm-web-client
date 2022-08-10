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
 * This file defines a search folder class.
 */

/**
 * Creates the search folder.
 * @class
 * This class represents a search folder.
 * 
 * @param	{Hash}	params		a hash of parameters
 * 
 * @extends	ZmFolder
 */
ZmSearchFolder = function(params) {
	params.type = ZmOrganizer.SEARCH;
	ZmFolder.call(this, params);
	
	if (params.query) {
		var searchParams = {
			query:			params.query,
			types:			params.types,
			checkTypes:		true,
			sortBy:			params.sortBy,
			searchId:		params.id,
			accountName:	(params.account && params.account.name)
		};
		this.search = new ZmSearch(searchParams);
	}
};

ZmSearchFolder.prototype = new ZmFolder;
ZmSearchFolder.prototype.constructor = ZmSearchFolder;

/**
 * Returns a string representation of the object.
 *
 * @return		{String}		a string representation of the object
 */
ZmSearchFolder.prototype.toString =	function() {
	return "ZmSearchFolder";
};

ZmSearchFolder.ID_ROOT = ZmOrganizer.ID_ROOT;

/**
 * Creates a search folder.
 * 
 * @param	{Hash}	params		a hash of parameters
 */
ZmSearchFolder.create = function(params) {

	params = params || {};

	var search = params.search,
		jsonObj = { CreateSearchFolderRequest: { _jsns:"urn:zimbraMail" } },
		searchNode = jsonObj.CreateSearchFolderRequest.search = {};

	searchNode.name = params.name;
	searchNode.query = search.query;
	searchNode.l = params.l;
	if (params.sortBy) {
		searchNode.sortBy = params.sortBy;
	}

	searchNode.types = ZmSearchFolder._getSearchTypes(search);

	if (params.rgb) {
		searchNode.rgb = params.rgb;
	}
	else if (params.color) {
		var color = ZmOrganizer.getColorValue(params.color, params.type);
		if (color) {
			searchNode.color = color;
		}
	}

	var accountName;
	if (params.isGlobal) {
		searchNode.f = 'g';
		accountName = appCtxt.accountList.mainAccount.name;
	}

	return appCtxt.getAppController().sendRequest({
		jsonObj:        jsonObj,
		asyncMode:      params.asyncMode !== false,
		accountName:    accountName,
		callback:       ZmSearchFolder._handleCreate,
		errorCallback:  params.errorCallback || ZmOrganizer._handleErrorCreate.bind(null)
	});
};

// converts a vector of types to a string the server can understand
ZmSearchFolder._getSearchTypes = function(search) {

	var typeStr = "";
	if (search && search.types) {
		var a = search.types.getArray();
		if (a.length) {
			var typeStr = [];
			for (var i = 0; i < a.length; i++) {
				typeStr.push(ZmSearch.TYPE[a[i]]);
			}
			typeStr = typeStr.join(",");
		}
	}
	return typeStr;
};

ZmSearchFolder._handleCreate =
function(params) {
	appCtxt.setStatusMsg(ZmMsg.searchSaved);
};

/**
 * Sets the underlying search query.
 *
 * @param	{String}	    query		    search query
 * @param	{AjxCallback}	callback		the callback
 * @param	{AjxCallback}	errorCallback		the error callback
 * @param	{ZmBatchCommand}	batchCmd		the batch command
 */
ZmSearchFolder.prototype.setQuery = function(query, callback, errorCallback, batchCmd) {

	if (query === this.search.query) {
		return;
	}

	var params = {
		callback:       callback,
		errorCallback:  errorCallback,
		batchCmd:       batchCmd
	};

	var cmd = "ModifySearchFolderRequest";
	var request = {
		_jsns: "urn:zimbraMail",
		search: {
			query:  query,
			id:     params.id || this.id,
			types:  ZmSearchFolder._getSearchTypes(this.search)
		}
	};
	var jsonObj = {};
	jsonObj[cmd] = request;

	var respCallback = this._handleResponseOrganizerAction.bind(this, params);
	if (params.batchCmd) {
		params.batchCmd.addRequestParams(jsonObj, respCallback, params.errorCallback);
	}
	else {
		var accountName;
		if (appCtxt.multiAccounts) {
			accountName = this.account ? this.account.name : appCtxt.accountList.mainAccount.name;
		}
		appCtxt.getAppController().sendRequest({
			jsonObj:        jsonObj,
			asyncMode:      true,
			accountName:    accountName,
			callback:       respCallback,
			errorCallback:  params.errorCallback
		});
	}
};

/**
 * Gets the icon.
 * 
 * @return	{String}	the icon
 */
ZmSearchFolder.prototype.getIcon = 
function() {
	return (this.nId == ZmOrganizer.ID_ROOT)
		? null
		: (this.isOfflineGlobalSearch ? "GlobalSearchFolder" : "SearchFolder");
};

/**
 * Gets the tool tip.
 * 
 */
ZmSearchFolder.prototype.getToolTip = function() {};

/**
 * Returns the organizer with the given ID. Looks in this organizer's tree first.
 * Since a search folder may have either a regular folder or another search folder
 * as its parent, we may need to get the parent folder from another type of tree.
 *
 * @param {int}	parentId	the ID of the organizer to find
 * 
 * @private
 */
ZmSearchFolder.prototype._getNewParent =
function(parentId) {
	var parent = appCtxt.getById(parentId);
	if (parent) {
		return parent;
	}
	
	return appCtxt.getById(parentId);
};

// Handle a change to the underlying search query
ZmSearchFolder.prototype.notifyModify =	function(obj) {

	if (obj.query && obj.query !== this.search.query && obj.id === this.id) {
		this.search.query = obj.query;
		var fields = {};
		fields[ZmOrganizer.F_QUERY] = true;
		this._notify(ZmEvent.E_MODIFY, {
			fields: fields
		});
		obj.query = null;
	}
	ZmFolder.prototype.notifyModify.apply(this, [obj]);
};
