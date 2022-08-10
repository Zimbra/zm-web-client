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

ZmApptCache = function(calViewController) {
	this._calViewController = calViewController;
	this.clearCache();
};

ZmApptCache.prototype.toString =
function() {
	return "ZmApptCache";
};

ZmApptCache.prototype.clearCache =
function(folderId) {
	if (!folderId) {
		this._cachedApptSummaries = {};
		this._cachedApptVectors = {};
		this._cachedIds = {};
	} else {
		var cacheEntries = this._cachedApptVectors[folderId];
		if (cacheEntries) {
			for (var j in cacheEntries) {
				var cachedVec = cacheEntries[j];
				var len = cachedVec.size();
				for (var i = 0; i < len; i++) {
					var appt = cachedVec.get(i);
					if (appt.folderId == folderId) {
						delete this._cachedIds[appt.id];
					}
				}
			}
			
		}
		delete this._cachedApptSummaries[folderId];
		delete this._cachedApptVectors[folderId];
		
	}
	
	this._cachedMergedApptVectors = {};
	var miniCalCache = this._calViewController.getMiniCalCache();
	miniCalCache.clearCache();
};

ZmApptCache._sortFolderId =
function (a,b) {
	return a-b;
};

ZmApptCache.prototype._getCachedMergedKey =
function(params) {
	var sortedFolderIds = [];
	sortedFolderIds = sortedFolderIds.concat(params.folderIds);
	sortedFolderIds.sort();

	// add query to cache key since user searches should not be cached
	var query = params.query && params.query.length > 0
		? (params.query + ":") : "";

	return (params.start + ":" + params.end + ":" + params.fanoutAllDay + ":" + query + sortedFolderIds.join(":"));
};

ZmApptCache.prototype._getCachedVector =
function(start, end, fanoutAllDay, folderId, query) {
	var folderCache = this._cachedApptVectors[folderId];
	if (folderCache == null)
		folderCache = this._cachedApptVectors[folderId] = {};

	var q = query ? (":" + query) : "";
	var cacheKey = start + ":" + end + ":" + fanoutAllDay + q;

	var vec = folderCache[cacheKey];
	if (vec == null) {
		// try to find it in the appt summaries results
		var apptList = this._getCachedApptSummaries(start, end, folderId, query);
		if (apptList != null) {
			vec = folderCache[cacheKey] = ZmApptList.toVector(apptList, start, end, fanoutAllDay);
		}
	}
	return vec;
};

ZmApptCache.prototype._cacheVector =
function(vector, start, end, fanoutAllDay, folderId, query) {
	var folderCache = this._cachedApptVectors[folderId];
	if (folderCache == null)
		folderCache = this._cachedApptVectors[folderId] = {};

	var q = query ? (":" + query) : "";
	var cacheKey = start + ":" + end + ":" + fanoutAllDay + q;
	folderCache[cacheKey] = vector;
};

ZmApptCache.prototype._cacheApptSummaries =
function(apptList, start, end, folderId, query) {
	var folderCache = this._cachedApptSummaries[folderId];
	if (folderCache == null)
		folderCache = this._cachedApptSummaries[folderId] = {};

	var q = query ? (":" + query) : "";
	var cacheKey = start + ":" + end + q;
	folderCache[cacheKey] = {start:start, end:end, list:apptList};
};

ZmApptCache.prototype._getCachedApptSummaries =
function(start, end, folderId, query) {
	var found = false;

	var folderCache = this._cachedApptSummaries[folderId];
	if (folderCache == null)
		folderCache = this._cachedApptSummaries[folderId] = {};

	var q = query ? (":" + query) : "";
	var cacheKey = start + ":" + end + q;

	// see if this particular range is cached
	var entry = this._cachedApptSummaries[cacheKey];
	if (entry != null) { return entry.list; }

	// look through all cache results. typically if we are asking for a week/day,
	// the month range will already be in the cache
	for (var key in folderCache) {
		entry = folderCache[key];
		if (start >= entry.start && end <= entry.end) {
			found = true;
			break;
		}
	}
	if (!found) { return null; }

	// hum. should this ever happen?
	if (entry.start == start && entry.end == end) {
		return entry.list;
	}

	// get subset, and cache it for future use (mainly if someone pages back and forth)
	var apptList = entry.list.getSubset(start, end);
	folderCache[cacheKey] = {start:start, end:end, list:apptList};
	return apptList;
};

ZmApptCache.prototype._updateCachedIds =
function(apptList) {
	var list = apptList.getVector();
	var size = list.size();
	for (var i=0; i < size; i++) {
		var ao = list.get(i);
		this._cachedIds[ao.id] = 1;
	}
};

/**
* Returns a vector of appt summaries for the specified time range across the
* specified folders.
* @param start 				[long]				start time in MS
* @param end				[long]				end time in MS
* @param fanoutAllDay		[Boolean]*
* @param folderIds			[Array]*			list of calendar folder Id's (null means use checked calendars in overview)
* @param callback			[AjxCallback]*		callback to call once search results are returned
* @param noBusyOverlay		[Boolean]*			don't show veil during search
*/
ZmApptCache.prototype.getApptSummaries =
function(params) {

	var apptVec = this.setSearchParams(params);

	if (apptVec) {
		if (params.callback) {
			params.callback.run(apptVec);
		}
		return apptVec;
	}

	// this array will hold a list of appts as we collect them from the server
	this._rawAppts = [];

	if (params.callback) {
		this._search(params);
	} else {
		return this._search(params);
	}
};

ZmApptCache.prototype.setSearchParams =
function(params) {
	if (params.folderIds && (!(params.folderIds instanceof Array))) {
		params.folderIds = [params.folderIds];
	}
	else if (!params.folderIds || (params.folderIds && params.folderIds.length == 0)) {
		return (new AjxVector());
	}

	params.mergeKey = this._getCachedMergedKey(params);
	var list = this._cachedMergedApptVectors[params.mergeKey];
	if (list != null) {
		return list.clone();
	}

	params.needToFetch = [];
	params.resultList = [];

	for (var i = 0; i < params.folderIds.length; i++) {
		var fid = params.folderIds[i];

		// bug #46296/#47041 - skip shared folders if account is offline
		var calFolder = appCtxt.isOffline && appCtxt.getById(fid);
		if (calFolder && calFolder.isRemote() && calFolder.getAccount().status == ZmZimbraAccount.STATUS_OFFLINE) {
			continue;
		}

		// check vector cache first
		list = this._getCachedVector(params.start, params.end, params.fanoutAllDay, fid);
		if (list != null) {
			params.resultList.push(list);
		} else {
			params.needToFetch.push(fid); // need to make soap call
		}
	}

	// if already cached, return from cache
	if (params.needToFetch.length == 0) {
		var newList = ZmApptList.mergeVectors(params.resultList);
		this._cachedMergedApptVectors[params.mergeKey] = newList.clone();
		return newList;
	}

    this.setFolderSearchParams(params.needToFetch, params);
    params.offset = 0;

    return null;
};

ZmApptCache.prototype.setFolderSearchParams =
function (foldersToFetch, params) {
    var folderIdMapper = {};
    var query = "";
    for (var i = 0; i < foldersToFetch.length; i++) {
        var fid = foldersToFetch[i];

        // map remote folder ids into local ones while processing search since
        // server wont do it for us (see bug 7083)
        var folder = appCtxt.getById(fid);
        var rid = folder ? folder.getRemoteId() : fid;
        folderIdMapper[rid] = fid;

        if (query.length) {
            query += " OR ";
        }
        query += "inid:" + ['"', fid, '"'].join("");

    }
    params.queryHint = query;
    params.folderIdMapper = folderIdMapper;
}

ZmApptCache.prototype._search =
function(params) {
	var jsonObj = {SearchRequest:{_jsns:"urn:zimbraMail"}};
	var request = jsonObj.SearchRequest;

	this._setSoapParams(request, params);

	var accountName = params.accountName || (appCtxt.multiAccounts ? appCtxt.accountList.mainAccount.name : null);
	if (params.callback) {
		appCtxt.getAppController().sendRequest({
			jsonObj: jsonObj,
			asyncMode: true,
			callback: (new AjxCallback(this, this._getApptSummariesResponse, [params])),
			errorCallback: (new AjxCallback(this, this._getApptSummariesError, [params])),
            offlineCallback: this.offlineSearchAppts.bind(this, null, null, params),
			noBusyOverlay: params.noBusyOverlay,
			accountName: accountName
		});
	}
	else {
		var response = appCtxt.getAppController().sendRequest({jsonObj: jsonObj, accountName: accountName, ignoreErrs: ["mail.NO_SUCH_MOUNTPOINT"]});
		var result = new ZmCsfeResult(response, false);
		return this._getApptSummariesResponse(params, result);
	}
};

ZmApptCache.prototype._initAccountLists =
function(){
    if(!this._accountsSearchList){
        this._accountsSearchList = new AjxVector();
        this._accountsMiniCalList = [];
    }
};

ZmApptCache.prototype.batchRequest =
function(searchParams, miniCalParams, reminderSearchParams) {
	// *always* recreate the accounts list, otherwise we dispose its contents
	// before the view has a chance to remove the corresponding elements
	this._accountsSearchList = new AjxVector();
	this._accountsMiniCalList = [];

	this._doBatchRequest(searchParams, miniCalParams, reminderSearchParams);
};

ZmApptCache.prototype._doBatchRequest =
function(searchParams, miniCalParams, reminderSearchParams) {
    this._cachedVec = null;
	var caledarIds = searchParams.accountFolderIds.shift();
	if (searchParams) {
		searchParams.folderIds = caledarIds;
	}
	if (miniCalParams) {
		miniCalParams.folderIds = caledarIds;
	}

	var apptVec;
	var jsonObj = {BatchRequest:{_jsns:"urn:zimbra", onerror:"continue"}};
	var request = jsonObj.BatchRequest;

	if (searchParams) {
		if (!searchParams.folderIds && !appCtxt.multiAccounts) {
			searchParams.folderIds = this._calViewController.getCheckedCalendarFolderIds();
		}
		searchParams.query = this._calViewController._userQuery;
		apptVec = this.setSearchParams(searchParams);
        DBG.println(AjxDebug.DBG1, "_doBatchRequest searchParams key: " + searchParams.mergeKey + " , size = " + (apptVec ? apptVec.size().toString() : "null"));

		// search data in cache
		if (apptVec) {
			this._cachedVec = apptVec;
			this._accountsSearchList.addList(apptVec);
		} else {
			var searchRequest = request.SearchRequest = {_jsns:"urn:zimbraMail"};
			this._setSoapParams(searchRequest, searchParams);
		}
	}

	if (reminderSearchParams) {
		if (!reminderSearchParams.folderIds) {
			reminderSearchParams.folderIds = this._calViewController.getCheckedCalendarFolderIds(true);
		}

		// reminder search params is only for grouping reminder related srch
		apptVec = this.setSearchParams(reminderSearchParams);

		if (!apptVec) {
			var searchRequest ={_jsns:"urn:zimbraMail"};
			request.SearchRequest = request.SearchRequest ? [request.SearchRequest, searchRequest] : searchRequest;
			this._setSoapParams(searchRequest, reminderSearchParams);
		}
		else if (reminderSearchParams.callback) {
			reminderSearchParams.callback.run(apptVec);
		}
	}

	if (miniCalParams) {
		var miniCalCache = this._calViewController.getMiniCalCache();
		var cacheData = miniCalCache.getCacheData(miniCalParams);
        //DBG.println(AjxDebug.DBG1, "_doBatchRequest minical key: " + miniCalCache._getCacheKey(miniCalParams) + " , size = " + (cacheData ? cacheData.length.toString() : "null"));

		// mini cal data in cache
		if (cacheData && cacheData.length > 0) {
			miniCalCache.highlightMiniCal(cacheData);
			if (miniCalParams.callback) {
				miniCalParams.callback.run(cacheData);
			}
		} else {
			var miniCalRequest = request.GetMiniCalRequest = {_jsns:"urn:zimbraMail"};
			miniCalCache._setSoapParams(miniCalRequest, miniCalParams);
		}
	}

	// both mini cal and search data is in cache, no need to send request
	if (searchParams && !request.SearchRequest && !request.GetMiniCalRequest) {

		// process the next account
		if (searchParams.accountFolderIds.length > 0) {
			this._doBatchRequest(searchParams, miniCalParams);
		}
		else if (searchParams.callback) {
			searchParams.callback.run(this._accountsSearchList);
		}
		DBG.println(AjxDebug.DBG1, "ZmApptCache._doBatchCommand, Search and Minical data cached, EXIT");
		return;
	}

	if ((searchParams && searchParams.callback) || miniCalParams.callback) {
        //re-init the account search list to avoid the duplication
        if (searchParams && request.SearchRequest) {
            this._accountsSearchList = new AjxVector();
        }
		var accountName = (appCtxt.multiAccounts && searchParams.folderIds && (searchParams.folderIds.length > 0))
			? appCtxt.getById(searchParams.folderIds[0]).getAccount().name : null;

		var params = {
			jsonObj: jsonObj,
			asyncMode: true,
			callback: (new AjxCallback(this, this.handleBatchResponse, [searchParams, miniCalParams, reminderSearchParams])),
			errorCallback: (new AjxCallback(this, this.handleBatchResponseError, [searchParams, miniCalParams, reminderSearchParams])),
            offlineCallback: this.offlineSearchAppts.bind(this, searchParams, miniCalParams, reminderSearchParams),
            noBusyOverlay: true,
			accountName: accountName
		};
		DBG.println(AjxDebug.DBG1, "ZmApptCache._doBatchCommand, Send Async Request");
		appCtxt.getAppController().sendRequest(params);
	} else {
		DBG.println(AjxDebug.DBG1, "ZmApptCache._doBatchCommand, Send Sync Request");
		var response = appCtxt.getAppController().sendRequest({jsonObj:jsonObj});
		var batchResp = (response && response.BatchResponse) ? response.BatchResponse : null;
		return this.processBatchResponse(batchResp, searchParams, miniCalParams);
	}
};

ZmApptCache.prototype.processBatchResponse =
function(batchResp, searchParams, miniCalParams, reminderSearchParams) {

    //loading the client with app=calendar will directly process the inline batch response
    if(!this._accountsSearchList) this._initAccountLists();

    var accountList = this._accountsSearchList.clone();
	var miniCalCache = this._calViewController.getMiniCalCache();
	var miniCalResp = batchResp && batchResp.GetMiniCalResponse;
	var searchResp = batchResp && batchResp.SearchResponse;

	if (batchResp && batchResp.Fault) {
		if (this._processErrorCode(batchResp)) {
			if (searchParams.accountFolderIds.length > 0) {
				this._doBatchRequest(searchParams, miniCalParams);
			}
			return;
		}
	}

	if (miniCalResp) {
		var data = [];
		miniCalCache.processBatchResponse(miniCalResp, data);
		if (!appCtxt.multiAccounts) {
			miniCalCache.highlightMiniCal(data);
			miniCalCache.updateCache(miniCalParams, data);

			if (miniCalParams.callback) {
				miniCalParams.callback.run(data);
			}
		} else {
			this._accountsMiniCalList = this._accountsMiniCalList.concat(data);
		}
	}

	if (!searchResp || !searchParams) {
		if (searchParams) {
			if (searchParams.accountFolderIds && searchParams.accountFolderIds.length > 0) {
				this._doBatchRequest(searchParams, miniCalParams);
			} else if (searchParams.callback) {
				searchParams.callback.run(accountList);
			}
		}

		if (appCtxt.multiAccounts && miniCalParams) {
			this._highliteMiniCal(miniCalCache, miniCalParams);
		}
		return;
	}

	// currently we send only one search request in batch
	if (!(searchResp instanceof Array)) {
		searchResp = [searchResp];
	}

	if (searchResp.length > 1) {
		// process reminder list
		this.processSearchResponse(searchResp[1], reminderSearchParams);
	}

	var list = this.processSearchResponse(searchResp[0], searchParams);
	accountList.addList(list);
    this._accountsSearchList = accountList.clone();

	if (searchParams.accountFolderIds && searchParams.accountFolderIds.length > 0) {
		this._doBatchRequest(searchParams, miniCalParams);
	}
    else {
		if (appCtxt.multiAccounts && miniCalParams) {
			this._highliteMiniCal(miniCalCache, miniCalParams);
		}

		if (searchParams.callback) {
			searchParams.callback.run(accountList, null, searchParams.query);
		} else {
            return accountList;
		}
	}
};

ZmApptCache.prototype._highliteMiniCal =
function(miniCalCache, miniCalParams) {
	miniCalCache.highlightMiniCal(this._accountsMiniCalList);
	miniCalCache.updateCache(miniCalParams, this._accountsMiniCalList);

	if (miniCalParams.callback) {
		miniCalParams.callback.run(this._accountsMiniCalList);
	}
};

ZmApptCache.prototype.handleBatchResponseError =
function(searchParams, miniCalParams, reminderSearchParams, response) {
	var resp = response && response._data && response._data.BatchResponse;
    this._calViewController.resetSearchFlags();
	this._processErrorCode(resp);
};

ZmApptCache.prototype._processErrorCode =
function(resp) {
	if (resp && resp.Fault && (resp.Fault.length > 0)) {

		if (this._calViewController) {
			this._calViewController.searchInProgress = false;
		}

		var errors = [];
		var ids = {};
		var invalidAccountMarker = {};
		for (var i = 0; i < resp.Fault.length; i++) {
			var fault = resp.Fault[i];
			var error = (fault && fault.Detail) ? fault.Detail.Error : null;
			var code = error ? error.Code : null;
			var attrs = error ? error.a : null;
			if (code == ZmCsfeException.ACCT_NO_SUCH_ACCOUNT || code == ZmCsfeException.MAIL_NO_SUCH_MOUNTPOINT) {
				for (var j in attrs) {
					var attr = attrs[j];
					if (attr && (attr.t == "IID") && (attr.n == "itemId")) {
						var id = attr._content;
						ids[id] = true;
						if (code == ZmCsfeException.ACCT_NO_SUCH_ACCOUNT) {
							invalidAccountMarker[id] = true;
						}
					}
				}
				
			} else {
				DBG.println("Unknown error occurred: "+code);
				errors[fault.requestId] = fault;
			}
		}

		var deleteHandled = false;
		var zidsMap = {};
		for (var id in ids) {
			if (id && appCtxt.getById(id)) {
				var folder = appCtxt.getById(id);
				folder.noSuchFolder = true;
				this.handleDeleteMountpoint(folder);
				deleteHandled = true;
				if (invalidAccountMarker[id] && folder.zid) {
					zidsMap[folder.zid] = true;
				}
			}
		}

		// no such mount point error - mark all folders owned by same account as invalid
		this.markAllInvalidAccounts(zidsMap);

		if (deleteHandled) {
			this.runErrorRecovery();
		}

		return deleteHandled;
	}

	return false;
};


//remove this after server sends fault for all removed accounts instead of no such mount point
ZmApptCache.prototype.markAllInvalidAccounts =
function(zidsMap) {
	if (this._calViewController) {
		var folderIds = this._calViewController.getCheckedCalendarFolderIds();
		for (var i = 0; i < folderIds.length; i++) {
			var folder = appCtxt.getById(folderIds[i]);
			if (folder) {
				if (folder.zid && zidsMap[folder.zid]) {
					folder.noSuchFolder = true;
					this.handleDeleteMountpoint(folder);
				}
			}
		}
        this._calViewController._updateCheckedCalendars();
	}
};

ZmApptCache.prototype.handleDeleteMountpoint =
function(organizer) {
	// Change its appearance in the tree.
	var tc = appCtxt.getOverviewController().getTreeController(ZmOrganizer.CALENDAR);
	var treeView = tc.getTreeView(appCtxt.getCurrentApp().getOverviewId());
	var node = treeView && treeView.getTreeItemById(organizer.id);
	if (organizer && node) {
		node.setText(organizer.getName(true));
	}
};

ZmApptCache.prototype.runErrorRecovery =
function() {
	if (this._calViewController) {
		this._calViewController.searchInProgress = false;
		this._calViewController._updateCheckedCalendars();
		if (this._calViewController.onErrorRecovery) {
			this._calViewController.onErrorRecovery.run();
		}
	}
};

ZmApptCache.prototype.handleBatchResponse =
function(searchParams, miniCalParams, reminderSearchParams, response) {
	var batchResp = response && response._data && response._data.BatchResponse;
	return this.processBatchResponse(batchResp, searchParams, miniCalParams, reminderSearchParams);
};

ZmApptCache.prototype._setSoapParams =
function(request, params) {
	request.sortBy = "none";
	request.limit = "500";
	// AjxEnv.DEFAULT_LOCALE is set to the browser's locale setting in the case

	// when the user's (or their COS) locale is not set.
	request.locale = { _content: AjxEnv.DEFAULT_LOCALE };
	request.calExpandInstStart = params.start;
	request.calExpandInstEnd = params.end;
	request.types = ZmSearch.TYPE[ZmItem.APPT];
	request.offset = params.offset;

	var query = params.query;

    if((query && query.indexOf("date:")!=-1)){
        var dtArray = query.split(":");
        query = null;
        var curDate = new Date(parseInt(dtArray[1]));
        curDate.setHours(0,0,0,0);
        var endDate = new Date(curDate.getTime());
        AjxDateUtil.rollToNextDay(endDate);
        request.calExpandInstStart = curDate.getTime();
	    request.calExpandInstEnd = endDate.getTime();
    }


	if (params.queryHint) {
		query = (query != null)
			? (query + " (" + params.queryHint + ")")
			: params.queryHint;
	}
	request.query = {_content:query};
};

ZmApptCache.prototype._getApptSummariesResponse =
function(params, result) {
	// TODO: mark both as needing refresh?
	if (!result) { return; }

	var callback = params.callback;
	var resp;
	try {
		resp = result.getResponse();
	} catch (ex) {
		if (callback) {
			callback.run(result);
		}
		return;
	}

	var newList = this.processSearchResponse(resp.SearchResponse, params);

	if (callback && newList) {
		callback.run(newList, params.query, result);
	} else {
		return newList;
	}
};

ZmApptCache.prototype._getApptSummariesError =
function(params, ex) {
    var code = ex ? ex.code : null;
	if (params.errorCallback) {
		//if there is a error callback handler then call it else do default handling
		params.errorCallback.run(ex);
		if (code !== ZmCsfeException.ACCT_NO_SUCH_ACCOUNT && code !== ZmCsfeException.MAIL_NO_SUCH_MOUNTPOINT) {
			//additional processing is needed for these codes so do not return yet.
			return true;
		}
	} else {
		if (code == ZmCsfeException.MAIL_QUERY_PARSE_ERROR) {
			var d = appCtxt.getMsgDialog();
			d.setMessage(ZmMsg.errorCalendarParse);
			d.popup();
			return true;
		}

		if (code == ZmCsfeException.MAIL_NO_SUCH_TAG) {
			var msg = ex.getErrorMsg();
			appCtxt.setStatusMsg(msg, ZmStatusView.LEVEL_WARNING);
			return true;
		}
	}

	var ids = {};
	var invalidAccountMarker = {};

	// check for deleted remote mount point or account
	var itemIds = (ex.data && ex.data.itemId && ex.data.itemId.length) ? ex.data.itemId : [];
	if (code == ZmCsfeException.ACCT_NO_SUCH_ACCOUNT || code == ZmCsfeException.MAIL_NO_SUCH_MOUNTPOINT) {
		for(var j = 0; j < itemIds.length; j++) {
			var id = itemIds[j];
			ids[id] = true;
			if (code == ZmCsfeException.ACCT_NO_SUCH_ACCOUNT) {
				invalidAccountMarker[id] = true;
			}
		}
	}

	var deleteHandled = this.handleDeletedFolderIds(ids, invalidAccountMarker);

	if (deleteHandled) {
		var newFolderIds = [];

		// filter out invalid folder ids
		for (var i = 0; i < params.folderIds.length; i++) {
			var folderId = params.folderIds[i];
			var isDeleted = (folderId && ids[folderId]);
			if (!isDeleted) {
				newFolderIds.push(folderId);
			}
		}

		// search again if some of the folders are marked for deletion
		if (params.folderIds.length != newFolderIds.length) {
			params.folderIds = newFolderIds;
			// handle the case where all checked folders are invalid
			if (params.folderIds.length == 0) {
				params.callback.run(new AjxVector(), "");
				return true;
			}
			DBG.println('Appt Summaries Search Failed - Error Recovery Search');
			this.getApptSummaries(params);
		}
	}

	return deleteHandled;
};

ZmApptCache.prototype.handleDeletedFolderIds =
function(ids, invalidAccountMarker) {
	var deleteHandled = false;
	var zidsMap = {};
	for (var id in ids) {
		if (id && appCtxt.getById(id)) {
			var folder = appCtxt.getById(id);
			folder.noSuchFolder = true;
			this.handleDeleteMountpoint(folder);
			deleteHandled = true;
			if (invalidAccountMarker[id] && folder.zid) {
				zidsMap[folder.zid] = true;
			}
		}
	}

	//no such mount point error - mark all folders owned by same account as invalid
	this.markAllInvalidAccounts(zidsMap);
	return deleteHandled;
};

ZmApptCache.prototype.processSearchResponse = 
function(searchResp, params) {
	if (!searchResp) {
		if (this._cachedVec) {
			var resultList = this._cachedVec.clone();
			this._cachedVec = null;
			return resultList;
		}
		return;
	}

	if (searchResp && searchResp.appt && searchResp.appt.length) {
		this._rawAppts = this._rawAppts != null 
			? this._rawAppts.concat(searchResp.appt)
			: searchResp.appt;

		// if "more" flag set, keep requesting more appts
		if (searchResp.more) {
			var lastAppt = searchResp.appt[searchResp.appt.length-1];
			if (lastAppt) {
				params.offset += 500;
				this._search(params);
				return;
			}
		}
	}

	if (this._rawAppts && this._rawAppts.length) {
		var fanoutAllDay = params.fanoutAllDay;
		var folderIds = params.needToFetch;
		var start = params.start;
		var end = params.end;
		var query = params.query;

		// create a list of appts for each folder returned
        var folder2List = this.createFolder2ListMap(this._rawAppts, "l", params.folderIdMapper);

		if (folderIds && folderIds.length) {
			for (var i = 0; i < folderIds.length; i++) {
				var folderId = folderIds[i];
				var apptList = new ZmApptList();
				apptList.loadFromSummaryJs(folder2List[folderId]);
                list = this.createCaches(apptList, params, folderId);
                params.resultList.push(list);
			}
		}
	}
	// merge all the data and return
	var newList = ZmApptList.mergeVectors(params.resultList);
	this._cachedMergedApptVectors[params.mergeKey] = newList.clone();

	this._rawAppts = null;
	return newList;
};


ZmApptCache.prototype.createFolder2ListMap =
function(items, folderFieldName, folderIdMapper) {
    var folder2List = {};
    var item;
    for (var j = 0; j < items.length; j++) {
        item = items[j];
        var fid = folderIdMapper && folderIdMapper[item[folderFieldName]];
        if (!folder2List[fid]) {
            folder2List[fid] = [];
        }
        folder2List[fid].push(item);
    }
    return folder2List;
}

ZmApptCache.prototype.createCaches =
function(apptList, params, folderId)  {
    this._updateCachedIds(apptList);
    this._cacheApptSummaries(apptList, params.start, params.end, folderId, params.query);

    // convert to sorted vector
    var list = ZmApptList.toVector(apptList, params.start, params.end, params.fanoutAllDay, params.includeReminders);
    this._cacheVector(list, params.start, params.end, params.fanoutAllDay, folderId, params.query);

    return list;
}

// return true if the cache contains the specified id(s)
// id can be an array or a single id.
ZmApptCache.prototype.containsAnyId =
function(ids) {
	if (!ids) { return false; }
	if (ids instanceof Array) {
		for (var i=0; i < ids.length; i++) {
			if (this._cachedIds[ids[i]])
				return true;
		}
	} else {
		if (this._cachedIds[ids])
			return true;
	}
	return false;
};

// similar to  containsAnyId, though deals with an object
// (or array of objects) that have the id property
ZmApptCache.prototype.containsAnyItem =
function(items) {
	if (!items) { return false; }
	if (items instanceof Array) {
		for (var i=0; i < items.length; i++) {
			if (items[i].id && this._cachedIds[items[i].id]) {
				return true;
			}
		}
	} else {
		if (items.id && this._cachedIds[items.id]) {
			return true;
		}
	}
	return false;
};

// This will be invoked from ZmApptCache.getApptSummaries (via _search)
//  and _doBatchCommand, and the ZmMiniCalCache offline callback.
// Search and Reminder Params (if both are passed) will use the
// same date range.
ZmApptCache.prototype.offlineSearchAppts =
function(searchParams, miniCalParams, reminderParams) {
    // MiniCal search called with searchParams set
    var params = null;
    if (searchParams) {
        params = searchParams;
    } else {
        params = reminderParams;

     }
    if (!params || !params.start || !params.end) {
        if (params && params.errorCallback) {
            params.errorCallback.run();
        }
        return;
    }

    var search = [params.start, params.end];
    var offlineSearchAppts2 = this._offlineSearchAppts2.bind(
        this, searchParams, miniCalParams, reminderParams, params.errorCallback, search);
    // Find the appointments whose startDate falls within the specified range
    ZmOfflineDB.doIndexSearch(
        search, ZmApp.CALENDAR, null, offlineSearchAppts2, params.errorCallback, "startDate");
}

ZmApptCache.prototype._offlineSearchAppts2 =
function(searchParams, miniCalParams, reminderParams, errorCallback, search, apptContainers) {
    var apptContainer;
    var apptSet = {};
    for (var i = 0; i < apptContainers.length; i++) {
        apptContainer = apptContainers[i];
        apptSet[apptContainer.instanceId] = apptContainer.appt;
    }

    var offlineSearchAppts3 = this._offlineSearchAppts3.bind(
        this, searchParams, miniCalParams, reminderParams, apptSet);
    // Find the appointments whose endDate falls within the specified range
    ZmOfflineDB.doIndexSearch(
        search, ZmApp.CALENDAR, null, offlineSearchAppts3, errorCallback, "endDate");
}

ZmApptCache.prototype._offlineSearchAppts3 =
function(searchParams, miniCalParams, reminderParams, apptSet, apptContainers) {
    var apptContainer;
    var reminderList;
    var calendarList;

    for (var i = 0; i < apptContainers.length; i++) {
        apptContainer = apptContainers[i];
        // Just drop them in - new entries are added, duplicate entries just written again
        apptSet[apptContainer.instanceId] = apptContainer.appt;
    }
    // For the moment, just create an array
    var appts = [];
    var appt;
    for (var instanceId in apptSet) {
        appt = apptSet[instanceId];
        appts.push(appt);
    }
    var cachedVec = this._cachedVec;
    this._cachedVec = null;

    if (reminderParams) {
        reminderList = this._cacheOfflineSearch(reminderParams, appts);

        // For getApptSummaries, searchParams == null, so its OK to invoke the reminder
        // callback, and return with the reminderList.
        if (!searchParams) {
            if (reminderParams.callback && reminderList) {
                // Last param == raw SOAP result.  The only usage seems to be from:
                // ZmSearchController.doSearch -> ZmCalViewController._handleUserSearch ...-> ZmApptCache.getApptSummaries
                // The callbacks return this to ZmSearchController._handleResponseDoSearch.
                // In order to support that param, we would need to have the rawAppts also
                // stored in a separate ObjectStore, and apply the search params to it
                // *** NOT DONE, But not supporting Calendar search right now ***
                reminderParams.callback.run(reminderList, reminderParams.query, null);
            } else {
                // Seems like the only way to get here is from
                // ZmFreeBusySchedulerView.popupFreeBusyToolTop ->
                // ZmCalViewController.getUserStatusToolTipText ...-> ZmApptCache.getApptSummaries,
                // where getUserStatusToolTipText does not provide a callback (it may be expecting
                // the appt to be cached). For offline, we are not providing FreeBusy, so should never hit here
                DBG.println(AjxDebug.DBG1, "ZmApptCache._offlineSearchAppts3 called with no reminderParam.callback");
                return reminderList;
            }
        }
    }

    if (searchParams) {
        if (cachedVec) {
            // Cache hit in _doBatchResponse for a calendar search.  Access and use in-memory cache
            calendarList = cachedVec.clone();
        } else {
            // _doBatchCommand: Search params provided - whether or not there are reminder results, the
            // search callback is executed, not the reminder.
            calendarList = this._cacheOfflineSearch(searchParams, appts);
        }
        if (searchParams.callback) {
            searchParams.callback.run(calendarList, null, searchParams.query);
        }  else {
            // This should never occur offline
        }
    }


    if (miniCalParams && calendarList) {
        // Base the miniCal off of the checked calendar appt data
        this.processOfflineMiniCal(miniCalParams, calendarList);
    }

}

ZmApptCache.prototype.processOfflineMiniCal =
function(miniCalParams, apptList) {
    // Base the minical off of the checked calendar appt data
    var dates = {};
    var dateList = [];
    var date;
    var appt;
    for (var i = 0; i < apptList.size(); i++) {
        appt = apptList.get(i);
        date = this._formatMiniCalEntry(appt.startDate);
        dates[date] = true;
    }
    for (date in dates) {
        dateList.push(date);
    }
    var miniCalCache = this._calViewController.getMiniCalCache();
    miniCalCache.highlightMiniCal(dateList);
    miniCalCache.updateCache(miniCalParams, dateList);
    //DBG.println(AjxDebug.DBG1, "Cache miniCal key: " + miniCalCache._getCacheKey(miniCalParams) + " , size = " + dateList.length);
    if (miniCalParams.callback) {
        miniCalParams.callback.run(dateList);
    }
}

ZmApptCache.prototype._formatMiniCalEntry =
function(date) {
    return date.getFullYear().toString() + AjxDateUtil._getMonth(date, true).toString() +
           AjxDateUtil._getDate(date,true).toString();
}

ZmApptCache.prototype._cacheOfflineSearch =
function(params, appts) {
    var resultList = params.resultList || [];
    var apptList;
    var appt;
    var folderList;
    var list;
    var folderId;

    var folder2List = this.createFolder2ListMap(appts, "folderId", params.folderIdMapper);

    // The offline db returns all entries within the specified date range.
    // Prune the entries by folder id here - Only process those in the params.needToFetch list
    var folderIds = params.needToFetch;
    if (folderIds && folderIds.length) {
        for (var i = 0; i < folderIds.length; i++) {
            folderId = folderIds[i];
            folderList = folder2List[folderId];
            if (folderList) {
                apptList = new ZmApptList();
                for (var j = 0; j < folderList.length; j++) {
                    // Assuming appts are a new instance, i.e. changes (like list) are not persisted
                    // SO, just set this appts list
                    appt = ZmAppt.loadOfflineData(folderList[j], apptList);
                    apptList.add(appt);
                }
                list = this.createCaches(apptList, params, folderId);
                resultList.push(list);
            }
        }
    }
    //}
    // merge all the data and return
    var newList = ZmApptList.mergeVectors(resultList);
    this._cachedMergedApptVectors[params.mergeKey] = newList.clone();
    //DBG.println(AjxDebug.DBG1, "Cache appts: " + params.mergeKey + " , size = " + newList.size());
    return newList;
}

// Update a field in a ZmAppt.  This will also trigger a clearCache call, since
// the cache entries will have an out-of-date field.  This is essentially what the online
// mode does - on a notification that modified or deletes an appt, it clears the in-memory cache.
ZmApptCache.prototype.updateOfflineAppt =
function(id, field, value, nullData, callback) {

    var search = [id];
    var errorCallback = this.updateErrorCallback.bind(this, field, value);
    var updateOfflineAppt2 = this._updateOfflineAppt2.bind(this, field, value, nullData, errorCallback, callback);
    // Find the appointments that match the specified id, update appt[field] = value,
    // and write it back into the db
    ZmOfflineDB.doIndexSearch([id], ZmApp.CALENDAR, null, updateOfflineAppt2, errorCallback, "invId");
}

ZmApptCache.prototype.updateErrorCallback =
function(field, value, e) {
    DBG.println(AjxDebug.DBG1, "Error while updating appt['" + field + "'] = '" + value + "' in indexedDB.  Error = " + e);
}

ZmApptCache.prototype._updateOfflineAppt2 =
function(fieldName, value, nullData, errorCallback, callback, apptContainers) {
    if (apptContainers.length > 0) {
        //this.clearCache();
        var appt;
        var fieldNames    = fieldName.split(".");
        var firstFieldName = fieldNames[0];
        var lastFieldName  = fieldNames[fieldNames.length-1];
        var field;
        for (var i = 0; i < apptContainers.length; i++) {
            appt = apptContainers[i].appt;
            field = appt;
            if (!appt[firstFieldName]) {
                appt[firstFieldName] = nullData;
            } else {
                for (var j = 0; j < fieldNames.length-1; j++) {
                    field = field[fieldNames[j]];
                    if (!field) break;
                }
                field[lastFieldName] = value;
            }
        }
        var errorCallback = this.updateErrorCallback.bind(this, field, value);
        var updateOfflineAppt3 = this._updateOfflineAppt3.bind(this, field, value, callback);
        ZmOfflineDB.setItem(apptContainers, ZmApp.CALENDAR, updateOfflineAppt3, errorCallback);
    }
}

ZmApptCache.prototype._updateOfflineAppt3 =
function(field, value, callback) {
    // Final step - Do a grand refresh.  We've modified the indexedDB entry, but appts
    // are used in the various caches, and in the display lists.
    this.clearCache();
    this._calViewController.refreshCurrentView();

    if (callback) {
        callback.run(field, value);
    }
}
