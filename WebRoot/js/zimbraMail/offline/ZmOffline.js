/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */
ZmOffline = function() {
	ZmOffline.SUPPORTED_APPS = [ZmApp.MAIL, ZmApp.CONTACTS, ZmApp.CALENDAR];
	ZmOffline.SUPPORTED_MAIL_TREE_VIEWS = [ZmOrganizer.FOLDER, ZmOrganizer.SEARCH, ZmOrganizer.TAG];
    ZmOfflineDB.init();
    this._addListeners();
};

ZmOffline.appCacheDone = false;
ZmOffline.messageNotShowed = true;
ZmOffline.cacheProgress = [];
ZmOffline.syncStarted = false;
ZmOffline.isServerReachable = true;

ZmOffline.folders = {};
ZmOffline.calendars = {};

// The number of days we read into the future to get calendar entries
ZmOffline.CALENDAR_LOOK_BEHIND_DAYS = 7;
ZmOffline.CALENDAR_READ_AHEAD_DAYS  = 21;

ZmOffline.ATTACHMENT = "Attachment";
ZmOffline.REQUESTQUEUE = "RequestQueue";
ZmOffline.META_DATA = "MetaData";

ZmOffline.MAIL_PROGRESS = "Mail";
ZmOffline.CONTACTS_PROGRESS = "Contacts";
ZmOffline.CALENDAR_PROGRESS = "Calendar Appointments";

ZmOffline.MAX_REQUEST_IN_BATCH_REQUEST = 50;
ZmOffline.SYNC_REQUEST_DELAY = 10000;

ZmOffline._checkCacheDone =
function (){
    if (appCtxt.isWebClientOfflineSupported && ZmOffline.appCacheDone && ZmOffline.cacheProgress.length === 0 && ZmOffline.syncStarted && ZmOffline.messageNotShowed){
        appCtxt.setStatusMsg(ZmMsg.offlineCachingDone, ZmStatusView.LEVEL_INFO);
        ZmOffline.messageNotShowed = false;
    }
};

ZmOffline.prototype._addListeners =
function() {
    $(window).on("online offline", ZmOffline.checkServerStatus);
    $(document).on("ZWCOffline", this._onZWCOffline.bind(this));
    $(document).on("ZWCOnline", this._onZWCOnline.bind(this));
	ZmZimbraMail.addListener(ZmAppEvent.POST_STARTUP, this._onPostStartup.bind(this));
    setInterval(ZmOffline.checkServerStatus, 10000);
};

ZmOffline.prototype._onZWCOffline =
function() {
	ZmOffline.refreshStatusIcon();
    this._disableApps();
	var zimbraMail = appCtxt.getZimbraMail();
	if (zimbraMail) {
		zimbraMail.setupHelpMenu();
	}
	this._setSearchOfflineState(true);
};

ZmOffline.prototype._onZWCOnline =
function() {
	ZmOffline.refreshStatusIcon();
    this._enableApps();
    this._replayOfflineRequest();
	var zimbraMail = appCtxt.getZimbraMail();
	if (zimbraMail) {
		zimbraMail.setupHelpMenu();
	}
	this._setSearchOfflineState(false);
};

ZmOffline.prototype._setSearchOfflineState = function(offline) {
	var searchController = appCtxt.getSearchController();
	if (searchController) {
		var searchToolbar = searchController.getSearchToolbar();
		if (searchToolbar) {
			searchToolbar.setOfflineState(offline);
		}
	}
}

ZmOffline.prototype._onPostStartup =
function() {
	this._initOfflineFolders();
	if (appCtxt.isWebClientOffline()) {
		this._onZWCOffline();
	}
	else {
		// Always replay offline request on post startup event so that the offline related changes are applied.
		this._replayOfflineRequest();
		this._initStaticResources();
	}
	ZmOffline.updateFolderCount();
};

ZmOffline.prototype._enableApps =
function() {
    // Configure the tabs
    var appChooser = appCtxt.getAppChooser();
    for (var i in ZmApp.ENABLED_APPS) {
        var appButton = appChooser.getButton(i);
        if (appButton) {
            appButton.setEnabled(true);
        }
    }

    // Enable features for the current app
    var app = appCtxt.getCurrentApp();
	app.resetWebClientOfflineOperations();
 };

ZmOffline.prototype._disableApps =
function() {
    // Configure the tabs
    var appChooser = appCtxt.getAppChooser();
    var enabledApps = AjxUtil.keys(ZmApp.ENABLED_APPS);
    var disabledApps = AjxUtil.arraySubstract(enabledApps, ZmOffline.SUPPORTED_APPS);
    for (var j = 0; j < disabledApps.length; j++) {
        var appButton = appChooser.getButton(disabledApps[j]);
        if (appButton) {
            appButton.setEnabled();
        }
    }

    // Disable features for the current app
    var app = appCtxt.getCurrentApp();
	app.resetWebClientOfflineOperations();
};

ZmOffline.prototype._initOfflineFolders =
function() {
	var folderTree = appCtxt.getFolderTree();
	if (folderTree) {
		var folders = folderTree.getByType("FOLDER");
		folders.forEach(function(folder) {
			if (folder.webOfflineSyncDays !== 0) {
				ZmOffline.folders[folder.id] = folder;
			}
		});

		var addrBooks = folderTree.getByType("ADDRBOOK");
		addrBooks.forEach(function(folder) {
			if (folder.id != ZmFolder.ID_DLS) {//Do not add distribution lists
				ZmOffline.folders[folder.id] = folder;
			}
		});

		//Check for deferredFolders for contacts
		var contactApp = appCtxt.getApp("Contacts");
		if (contactApp) {
			contactApp._deferredFolders.forEach(function(folder) {
				if (folder.obj.id != ZmFolder.ID_DLS) {
					ZmOffline.folders[folder.obj.id] = folder.obj;
				}
			});
		}
	}

	// Get the possible set of calendars.  Used to insure getFolder allows access to the invite messages
	var calMgr = appCtxt.getCalManager();
	var calViewController = calMgr && calMgr.getCalViewController();
	var calendarIds = calViewController.getOfflineSearchCalendarIds();
	for (var i = 0; i < calendarIds.length; i++) {
		// Store for use in processing mail messages - allow invites
		ZmOffline.calendars[calendarIds[i]] = calendarIds[i];
	}
};

ZmOffline.prototype._initStaticResources =
function() {
	ZmOffline.refreshStatusIcon(true);
	var staticURLs = [];
	var cssUrl = ["/css/msgview.css?v=", cacheKillerVersion, "&locale=", window.appRequestLocaleId, "&skin=", window.appCurrentSkin].join("");
	staticURLs.push({url : cssUrl, storeInLocalStorage : true, appendCacheKillerVersion : false});
	staticURLs.push({url : "/img/large.png"});
	staticURLs.push({url : "/img/large/ImgPerson_48.png"});
	staticURLs.push({url : "/img/arrows/ImgSashArrowsUp.png"});
	staticURLs.push({url : "/img/arrows.png"});
	staticURLs.push({url : "/img/calendar/ImgCalendarDayGrid.repeat.gif"});
	staticURLs.push({url : "/css/tinymce-content.css"});
	staticURLs.push({url : "/js/ajax/3rdparty/tinymce/skins/lightgray/fonts/tinymce-small.woff", appendCacheKillerVersion : false});
	staticURLs.push({url : "/js/ajax/3rdparty/tinymce/skins/lightgray/content.min.css", appendCacheKillerVersion : false});
	staticURLs.push({url : "/js/ajax/3rdparty/tinymce/skins/lightgray/skin.min.css", appendCacheKillerVersion : false});
	this._cacheStaticResources(staticURLs);
};

ZmOffline.prototype._cacheStaticResources =
function(staticURLs, cachedURL, response) {
	if (response && response.success && cachedURL && cachedURL.storeInLocalStorage) {
		localStorage.setItem(cachedURL.url, response.text);
	}
	if (staticURLs && staticURLs.length > 0) {
		var staticURL = staticURLs.shift();
		var url = appContextPath + staticURL.url;
		if (staticURL.appendCacheKillerVersion !== false) {
			staticURL.url = url = url + "?v=" + cacheKillerVersion;
		}
		var callback = this._cacheStaticResources.bind(this, staticURLs, staticURL);
		AjxRpc.invoke(null, url, null, callback, true);
	}
	else {
		var callback = this._cacheStaticResourcesContinue.bind(this);
		AjxDispatcher.require(["Contacts", "TinyMCE", "Extras"], true, callback);
	}
};

ZmOffline.prototype._cacheStaticResourcesContinue =
function() {
	var callback = this.sendSyncRequest.bind(this, appCtxt.reloadAppCache.bind(appCtxt));
	var cacheSignatureImages = this._cacheSignatureImages.bind(this, callback);
	var tinyMCELocale = tinyMCE.getlanguage(appCtxt.get(ZmSetting.LOCALE_NAME));
	if (tinyMCELocale === "en") {
		cacheSignatureImages();
	}
	else {
		var url = appContextPath + "/js/ajax/3rdparty/tinymce/langs/" + tinyMCELocale + ".js";
		AjxRpc.invoke(null, url, null, cacheSignatureImages, true);
	}
};

ZmOffline.prototype._cacheSignatureImages =
function(callback) {
	var signatures = appCtxt.getSignatureCollection().getSignatures();
	if (!signatures || signatures.length === 0) {
		return callback && callback();
	}
	var template = document.createElement("template");
	var imgSrcArray = [];
	signatures.forEach(function(signature) {
		template.innerHTML = signature.getValue(ZmMimeTable.TEXT_HTML);
		var imgNodeList = template.content.querySelectorAll("img[src]");
		for (var i = 0; i < imgNodeList.length; i++) {
			imgSrcArray.push(imgNodeList[i].getAttribute("src"));
		}
	});
	this._storeSignatureImages(imgSrcArray, callback);
};

ZmOffline.prototype._storeSignatureImages =
function(imgSrcArray, callback) {
	if (!imgSrcArray || imgSrcArray.length === 0) {
		return callback && callback();
	}
	var imgSrc = imgSrcArray.shift();
	var request = $.ajax({
		url: imgSrc,
		dataType: "text",
		headers: {'X-Zimbra-Encoding':'x-base64'}
	});
	request.done(function(imgSrc, response) {
		var imgType = imgSrc.substr(imgSrc.lastIndexOf(".") + 1);
		localStorage.setItem(imgSrc, "data:image/" + imgType + ";base64," + response);
	}.bind(window, imgSrc));
	request.always(this._storeSignatureImages.bind(this, imgSrcArray, callback));
};

ZmOffline.modifySignature =
function(value) {
	var template = document.createElement("template");
	template.innerHTML = value;
	var imgNodeList = template.content.querySelectorAll("img[src]");
	for (var i = 0; i < imgNodeList.length; i++) {
		var img = imgNodeList[i];
		var dataURI = localStorage.getItem(img.getAttribute("src"));
		if (dataURI) {
			img.setAttribute("src", dataURI);
			img.removeAttribute("dfsrc");
			img.removeAttribute("data-mce-src");
		}
	}
	return template.innerHTML;
};

ZmOffline.prototype._downloadCalendar =
function(startTime, endTime, calendarIds, callback, getMessages, previousMessageIds) {
    // Bundle it together in a batch request
    var jsonObj = {BatchRequest:{_jsns:"urn:zimbra", onerror:"continue"}};
    var request = jsonObj.BatchRequest;

    // Get the Cal Manager and CalViewController
    var calMgr = appCtxt.getCalManager();
    var calViewController = calMgr && calMgr.getCalViewController();
    var apptCache = calViewController.getApptCache();

    if (!startTime) {
        var endDate = new Date();
        endDate.setHours(23,59,59,999);
        //grab a week's appt backwards for reminders
        var startDate = new Date(endDate.getTime());
        startDate.setDate(startDate.getDate()-ZmOffline.CALENDAR_LOOK_BEHIND_DAYS);
        startDate.setHours(0,0,0, 0);
        endDate.setDate(endDate.getDate()+ ZmOffline.CALENDAR_READ_AHEAD_DAYS);
        startTime = startDate.getTime();
        endTime   = endDate.getTime();
    }

    if (!calendarIds) {
        // Get the calendars ids stored checked calendars for the first (main) account
        calendarIds = [];
        for (var calendarId in  ZmOffline.calendars) {
            calendarIds.push(calendarId);
        }
    }
    // Store the marker containing the end of the current display time window.
    localStorage.setItem("calendarSyncTime", endTime);

    // Appt Search Request.  This request will provide data for the calendar view displays, the reminders, and
    // the minical display.  Entries will be stored as ZmAppt data,
    var searchParams = {
        start:            startTime,
        end:              endTime,
        accountFolderIds: calendarIds,
        folderIds:        calendarIds,
        offset:           0
    }
    apptCache.setFolderSearchParams(searchParams.folderIds, searchParams);
    request.SearchRequest = {_jsns:"urn:zimbraMail"};
    apptCache._setSoapParams(request.SearchRequest, searchParams);

    var respCallback = this._handleCalendarResponse.bind(this, startTime, endTime, callback, getMessages, previousMessageIds, null);
    appCtxt.getRequestMgr().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:respCallback});
};

ZmOffline.prototype._downloadByApptId =
function(apptIds, itemQueryClause, startTime, endTime, callback) {
    // Place the search in a batchRequest, so handleCalendarResponse can unpack it in the same way
    var jsonObj = {BatchRequest:{_jsns:"urn:zimbra", onerror:"continue"}};
    jsonObj.BatchRequest.SearchRequest = {_jsns:"urn:zimbraMail"};
    var request = jsonObj.BatchRequest.SearchRequest;
    request.sortBy = "none";
    request.limit  = "500";
    request.offset = 0;
    request.locale = { _content: AjxEnv.DEFAULT_LOCALE };
    request.types  = ZmSearch.TYPE[ZmItem.APPT];
    var query      = itemQueryClause.join(" OR ");
    request.query  = {_content:query};
    request.calExpandInstStart = startTime;
    request.calExpandInstEnd   = endTime;

    // Call with getMessages == false, so callback will continue the downloading, and do the combined getMsgRequest call
    var respCallback = this._handleCalendarResponse.bind(this, startTime, endTime, callback, callback == null, null, apptIds);
    appCtxt.getRequestMgr().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:respCallback});
}

ZmOffline.prototype._handleCalendarResponse =
function(startTime, endTime, callback, getMessages, previousMessageIds, apptIds, response) {

    var batchResp   = response && response._data && response._data.BatchResponse;
    var searchResp  = batchResp && batchResp.SearchResponse && batchResp.SearchResponse[0];

    try{
        var rawAppt;
        var appt;
        var apptList = new ZmApptList();
        // Convert the raw appts into ZmAppt objects.  Each rawAppt may represent several actual appointments (if the
        // appt is a recurring one), with differing start and end dates.  So break a raw appt into its component appts
        // and store them individually, with start and end time index info.
        apptList.loadFromSummaryJs(searchResp.appt, true);
        var numAppt = apptList.size();
        var apptContainers = [];
        var apptContainer;
        var apptStartTime;
        var apptEndTime;
        var msgIds = previousMessageIds ? previousMessageIds : [];
        var uniqueMsgIds = {};
        for (var i = 0; i < numAppt; i++) {
            appt       = apptList.get(i);
            apptStartTime  = appt.startDate.getTime();
            apptEndTime    = appt.endDate.getTime();
            // If this was called via _downloadByApptId (Sync items), prune if a synced item is outside
            // of the display window.  This may not be needed, since it looks like we can use calExpandInstStart and
            // End in the Search, but leave it for the moment.
            if (((apptStartTime >= startTime) && (apptStartTime <= endTime)) ||
                ((apptEndTime   >= startTime) && (apptEndTime   <= endTime)) ) {
                // The appts do not contain a unique id for each instance.  Generate one (used as the primary key),
                // for each appt/instance and store the appt with a container that has the index fields

                this._cleanApptForStorage(appt);
                apptContainer = {appt: appt,
                                 instanceId: this._createApptPrimaryKey(appt),
                                 id:         appt.id,
                                 invId:      appt.invId,
                                 startDate:  apptStartTime,
                                 endDate:    apptEndTime
                                };
                apptContainers.push(apptContainer);

                // Accumulate the msgIds for reading the appt invites.  Do that here to pick up any series exceptions
                // Note:  ZmCalItem.getDetails does:
                //   var id = seriesMode ? (this.seriesInvId || this.invId || this.id) : this.invId;
                // seriesInvId is the invId or null, constructed on dom load.  We want the actual invIds
                var msgId = appt.invId || appt.id;
                uniqueMsgIds[msgId] = true;
            }
        }
        for (var uniqueId in uniqueMsgIds) {
            msgIds.push(uniqueId);
        }

        // Unfortunately, periodic appts have a cancel mode ('Delete this instance and any future
        // ones') that removes a portion of the appts associated with an apptId.  In order to
        // assure that we have the correct appts and instances, delete all appts mentioned in
        // the apptIds (provided when syncing) and then write the newly acquired appts (i.e. an
        // update will be a delete then rewrite).
        if (apptIds) {
            var search;
            var offlineUpdateAppts = this._offlineUpdateAppts.bind(this, apptContainers);
            for (var apptId in apptIds) {
                search = [apptId];
                // If its a recurring appt, several ZmAppts may share the same id.  Find them and delete them all
                ZmOfflineDB.doIndexSearch(search, ZmApp.CALENDAR, null, offlineUpdateAppts,
                    this.calendarDeleteErrorCallback.bind(this), "id");
            }
        }  else {
			// Store the new/modified entries.
			ZmOfflineDB.setItem(apptContainers, ZmApp.CALENDAR, null, this.calendarDownloadErrorCallback.bind(this));
		}

        // Now make a server read to get the detailed appt invites, for edit view and tooltips
        if (getMessages) {
            if (msgIds.length > 0) {
                var updateProgress = this._updateCacheProgress.bind(this, ZmOffline.CALENDAR_PROGRESS);
                this._loadMessages(msgIds, updateProgress);
            } else {
                this._updateCacheProgress(ZmOffline.CALENDAR_PROGRESS);
            }
        }

        var calMgr = appCtxt.getCalManager();
        var calViewController = calMgr && calMgr.getCalViewController();
        var apptCache = calViewController.getApptCache();
        apptCache.clearCache();
    }catch(ex){
        DBG.println(AjxDebug.DBG1, ex);
        if (!callback) {
            this._updateCacheProgress(ZmOffline.CALENDAR_PROGRESS);
        }
    }

    if (callback) {
        callback.run(msgIds);
    }

};
ZmOffline.prototype.calendarDownloadErrorCallback =
function(e) {
    DBG.println(AjxDebug.DBG1, "Error while adding appts to indexedDB.  Error = " + e);
}
ZmOffline.prototype.calendarDeleteErrorCallback =
function(e) {
    DBG.println(AjxDebug.DBG1, "Error while deleting appts from indexedDB.  Error = " + e);
}

ZmOffline.prototype._createApptPrimaryKey =
function(appt) {
    return appt.id + ":" + appt.startDate.getTime();
}

ZmOffline.prototype._cleanApptForStorage =
function(appt) {
    delete appt.list;
    delete appt._list;
    delete appt._evt;
    delete appt._evtMgr;
}

ZmOffline.prototype._updateCacheProgress =
function(folderName){

    var index = $.inArray(folderName, ZmOffline.cacheProgress);
    if(index != -1){
        ZmOffline.cacheProgress.splice(index, 1);
    }
    if (ZmOffline.cacheProgress.length === 0){
        //this.sendSyncRequest();
        ZmOffline._checkCacheDone();
    }
    DBG.println(AjxDebug.DBG1, "_updateCacheProgress folder: " + folderName + " ZmOffline.cacheProgress " + ZmOffline.cacheProgress.join());


};

ZmOffline.prototype.scheduleSyncRequest =
function(notify, methodName) {
	if (methodName === "SyncRequest") {
		return;
	}
	var keys = Object.keys(notify.created || {});
	keys = keys.concat(Object.keys(notify.modified || {}));
	keys = keys.concat(Object.keys(notify.deleted || {}));
	if (keys.length === 0) {
		return;
	}
	if (this._syncRequestActionId) {
		AjxTimedAction.cancelAction(this._syncRequestActionId);
	}
	this._syncRequestActionId = AjxTimedAction.scheduleAction(new AjxTimedAction(this, this.sendSyncRequest), ZmOffline.SYNC_REQUEST_DELAY);
};

ZmOffline.prototype.sendSyncRequest =
function(callback) {
	ZmOffline.refreshStatusIcon(true);
	var syncToken = localStorage.getItem("SyncToken");
	if (syncToken) {
		AjxDebug.println(AjxDebug.OFFLINE, "syncToken :: "+syncToken);
		this._sendDeltaSyncRequest(callback, syncToken);
	}
	else {
		this._sendInitialSyncRequest(callback);
	}
};

ZmOffline.prototype._sendInitialSyncRequest =
function(callback) {
	var syncRequestArray = [];
	var keys = AjxUtil.keys(ZmOffline.folders);
	for (var i = 0, length = keys.length; i < length; i++) {
		var folder = ZmOffline.folders[keys[i]];
		if (folder && folder.id != ZmFolder.ID_OUTBOX) {
			var params = {l:folder.id, _jsns:"urn:zimbraMail"};
			if (folder.type === "FOLDER") {
				//specify the start date for the mail to be synched
				var startDate = AjxDateUtil.roll(new Date(), AjxDateUtil.DAY, -parseInt(folder.webOfflineSyncDays));
				params.msgCutoff = Math.round(startDate.getTime() / 1000);
			}
			syncRequestArray.push(params);
		}
	}
	if (syncRequestArray.length > 0) {
		var params = {
			jsonObj : {BatchRequest:{_jsns:"urn:zimbra", onerror:"continue", SyncRequest:syncRequestArray}},
			asyncMode : true,
			callback : this._handleInitialSyncResponse.bind(this, true, callback),
			errorCallback : this._handleInitialSyncError.bind(this)
		};
		appCtxt.getRequestMgr().sendRequest(params);
	}
};

ZmOffline.prototype._handleInitialSyncResponse =
function(downloadCalendar, callback, result) {
	var response = result && result.getResponse();
	var batchResponse = response && response.BatchResponse;
	var syncResponse = batchResponse && batchResponse.SyncResponse;
	if (!syncResponse) {
		return;
	}
	var msgParamsArray = [];
	var contactIdsArray = [];
	var syncToken;
	var more;
	syncResponse.forEach(function(response) {
		var folderInfo = response.folder && response.folder[0];
		if (folderInfo) {
			if (folderInfo.m) {
				var msgIds = folderInfo.m[0].ids;
				if (msgIds) {
					// Check for a shared-mailbox folder.  If so, the msgIds must be specified as mountpoint:msgId
					var idParts = folderInfo.id.split(":");
					var prefix = (idParts.length > 1) ? idParts[0] + ":" : "";
					msgIds.split(",").forEach(function(id) {
						var params = {
							m : {id: prefix + id, html:1, needExp:1},
							_jsns : "urn:zimbraMail"
						};
						msgParamsArray.push(params);
					});
				}
			}
			else if (folderInfo.cn) {
				var contactIds = folderInfo.cn[0].ids;
				if (contactIds) {
					contactIdsArray = contactIdsArray.concat(contactIds.split(","));
				}
			}
		}
		syncToken = response.token;
		more = response.more;
	});
	var params = {
		msgs : msgParamsArray,
		contactIds : contactIdsArray
	};
	// if more="1" is specified on the sync response, the response does *not* bring the client completely up to date. more changes are still queued, and another SyncRequest (using the new returned token) is necessary.
	if (more == 1) {
		params.callback = this.sendSyncRequest.bind(this, callback);
	}
	else {
		params.callback = callback;
	}
	this._sendGetRequest(params);
	if (downloadCalendar) {
		this._downloadCalendar(null, null, null, null, true, null);
	}
	this._storeSyncToken(syncToken);
};

ZmOffline.prototype._handleInitialSyncError =
function() {
	ZmOffline.refreshStatusIcon();
};

ZmOffline.prototype._sendGetRequest =
function(params) {
	var msgs = params.msgs || [];
	var contactIds = params.contactIds || [];
	var msgsLength = msgs.length;
	var contactIdsLength = contactIds.length;
	if (msgsLength === 0 && contactIdsLength === 0) {
		if (params.callback && !params.isCallbackExecuted) {
			params.isCallbackExecuted = true;
			params.callback();
		}
		ZmOffline.refreshStatusIcon();
	}
	else {
		var getCallback = this._sendGetRequest.bind(this, params);
		var newParams = {
			jsonObj : {BatchRequest:{_jsns:"urn:zimbra", onerror:"continue"}},
			asyncMode : true,
			callback : this._handleGetResponse.bind(this, getCallback),
			errorCallback : this._handleGetError.bind(this, getCallback)
		};
		var batchRequest = newParams.jsonObj.BatchRequest;
		//Limit maximum number of request in batch request to ZmOffline.MAX_REQUEST_IN_BATCH_REQUEST property
		var getMsgRequest = msgs.splice(0, ZmOffline.MAX_REQUEST_IN_BATCH_REQUEST);
		if (getMsgRequest.length > 0) {
			batchRequest.GetMsgRequest = getMsgRequest;
		}
		if (contactIdsLength > 0 && getMsgRequest.length < ZmOffline.MAX_REQUEST_IN_BATCH_REQUEST) {
			batchRequest.GetContactsRequest = {_jsns:"urn:zimbraMail", derefGroupMember:1, cn:{id:contactIds.join()}};
			contactIds.splice(0, contactIdsLength);
		}
		appCtxt.getRequestMgr().sendRequest(newParams);
	}
};

ZmOffline.prototype._sendDeltaSyncRequest =
function(callback, syncToken) {
	var params = {
		jsonObj : {SyncRequest:{_jsns:"urn:zimbraMail", token:syncToken, typed:1}},
		asyncMode : true,
		callback : this._handleDeltaSyncResponse.bind(this, callback, syncToken),
		errorCallback : this._handleDeltaSyncError.bind(this)
	};
	appCtxt.getRequestMgr().sendRequest(params);
};

ZmOffline.prototype._handleDeltaSyncResponse =
function(callback, syncToken, result) {
	ZmOffline.refreshStatusIcon();
	var syncResponse = result && result.getResponse().SyncResponse;
	if (!syncResponse || syncResponse.token === syncToken) {
		if (callback) {
			callback();
		}
		return;
	}
	this._storeSyncToken(syncResponse.token);
	if (syncResponse.deleted) {
		this._handleSyncDeletes(syncResponse.deleted);
	}
	if (syncResponse.m || syncResponse.cn) {
		this._handleSyncUpdate(syncResponse);
	}
	if (syncResponse.appt) {
		this._handleUpdateAppts(syncResponse.appt);
	}
	if (syncResponse.folder) {
		this._handleUpdateFolders(syncResponse.folder);
	}
    if (syncResponse.folder || syncResponse.search) {
        appCtxt.reloadAppCache();
    }
	if (callback) {
		callback();
	}
};

ZmOffline.prototype._handleDeltaSyncError =
function(ex) {
	ZmOffline.refreshStatusIcon();
	if (ex && ex.code === ZmCsfeException.MAIL_MUST_RESYNC) {
		//if the response is a mail.MUST_RESYNC fault, client has fallen too far out of date and must re-initial sync
		localStorage.removeItem("SyncToken");
		this.sendSyncRequest();
		return true;
	}
};

ZmOffline.prototype._handleSyncDeletes =
function(deletes) {
	var deletedInfo = deletes[0];
	if (!deletedInfo) {
		return;
	}
	if (deletedInfo.m) {
		var deletedMsgIds = deletedInfo.m[0] && deletedInfo.m[0].ids;
		if (deletedMsgIds) {
			var deletedMsgIdArray = [].concat(deletedMsgIds.split(","));
		}
	}
	if (deletedInfo.cn) {
		var deletedContactIds = deletedInfo.cn[0] && deletedInfo.cn[0].ids;
		if (deletedContactIds) {
			var deletedContactsIdArray = [].concat(deletedContactIds.split(","));
		}
	}
	if (deletedMsgIdArray && deletedMsgIdArray.length > 0) {
		ZmOfflineDB.deleteItem(deletedMsgIdArray, ZmApp.MAIL);
	}
	if (deletedContactsIdArray && deletedContactsIdArray.length > 0) {
		ZmOfflineDB.deleteItem(deletedContactsIdArray, ZmApp.CONTACTS);
	}
};

ZmOffline.prototype._handleSyncUpdate =
function(syncResponse) {
	var msgs = syncResponse.m;
	var contacts = syncResponse.cn;
	var msgParamsArray = [];
	var contactIdsArray = [];
	if (msgs) {
		var offlineFolderIds = Object.keys(ZmOffline.folders);
		var nonOfflineMsgIds = [];
		msgs.forEach(function(msg) {
			//Get messages only if it belongs to offline folder
			if (msg.l && offlineFolderIds.indexOf(msg.l) !== -1) {
				var params = {m:{id:msg.id, html:1, needExp:1}, _jsns:"urn:zimbraMail"};
				msgParamsArray.push(params);
			} else {
				nonOfflineMsgIds.push(msg.id);
			}
		});
		if (nonOfflineMsgIds.length > 0) {
			// Fix for Bug 95758.  Try and delete the messages from the mail store, in case some were stored offline.
			// This happens when a message is moved from a folder that stores offline messages to one that does not.
			ZmOfflineDB.deleteItem(nonOfflineMsgIds, ZmApp.MAIL);
		}
	}
	if (contacts) {
		contacts.forEach(function(contact) {
			contactIdsArray.push(contact.id);
		});
	}
	ZmOffline.refreshStatusIcon(true);
	this._sendGetRequest({msgs : msgParamsArray, contactIds : contactIdsArray});
};

ZmOffline.prototype._handleUpdateFolders =
function(folders) {
	var syncRequestArray = [];
	folders.forEach(function(folder) {
		var folderId = folder.id;
		var params = {l:folderId, _jsns:"urn:zimbraMail"};
		if (folder.view === "message") {
			var isExistingOfflineFolder = ZmOffline.folders.hasOwnProperty(folderId);
			if (isExistingOfflineFolder && folder.webOfflineSyncDays == 0) {
				var callback = function(result) {
					ZmOfflineDB.deleteItem(result, ZmApp.MAIL);
				};
				ZmOfflineDB.doIndexSearch([folderId.toString()], ZmApp.MAIL, null, callback, null, "folder", true);
				delete ZmOffline.folders[folderId];
			}
			else if ( (isExistingOfflineFolder && folder.webOfflineSyncDays != ZmOffline.folders[folderId].webOfflineSyncDays)
					  || (!isExistingOfflineFolder && folder.webOfflineSyncDays != 0) ) {
				//If existing offline folder’s webOfflineSyncDays property is modified or new folder’s webOfflineSyncDays property is set
				//specify the start date for the mail to be synched
				var startDate = AjxDateUtil.roll(new Date(), AjxDateUtil.DAY, -parseInt(folder.webOfflineSyncDays));
				params.msgCutoff = Math.round(startDate.getTime() / 1000);
				syncRequestArray.push(params);
				ZmOffline.folders[folderId] = folder;
			}
		}
		else if (folder.view === "contact") {
			syncRequestArray.push(params);
			ZmOffline.folders[folderId] = folder;
		}
	});
	if (syncRequestArray.length > 0) {
		var params = {
			jsonObj : {BatchRequest:{_jsns:"urn:zimbra", onerror:"continue", SyncRequest:syncRequestArray}},
			asyncMode : true,
			callback : this._handleInitialSyncResponse.bind(this, false, false)
		};
		ZmOffline.refreshStatusIcon(true);
		appCtxt.getRequestMgr().sendRequest(params);
	}
};

ZmOffline.prototype._storeSyncToken =
function(syncToken) {
	AjxDebug.println(AjxDebug.OFFLINE, "New syncToken :: " + syncToken);
	localStorage.setItem("SyncToken", syncToken);
};

ZmOffline.prototype._handleGetResponse =
function(callback, result) {
	var response = result && result.getResponse();
	var batchResponse = response && response.BatchResponse;
	if (!batchResponse) {
		return;
	}
	var getMsgResponse = batchResponse.GetMsgResponse;
	if (getMsgResponse) {
		var msgs = [];
		for (var i = 0; i < getMsgResponse.length; i++) {
			msgs.push(getMsgResponse[i].m[0]);
		}
		var setItemCallback = this._handleSetItemCallback.bind(this, msgs, ZmApp.MAIL, callback);
		ZmOfflineDB.setItem(msgs, ZmApp.MAIL, setItemCallback);
	}
	var getContactsResponse = batchResponse.GetContactsResponse;
	if (getContactsResponse) {
		var contacts = [];
		for (var i = 0; i < getContactsResponse.length; i++) {
			contacts = contacts.concat(getContactsResponse[i].cn);
		}
		var setItemCallback = this._handleSetItemCallback.bind(this, contacts, ZmApp.CONTACTS, callback);
		ZmOfflineDB.setItem(contacts, ZmApp.CONTACTS, setItemCallback);
	}
};

ZmOffline.prototype._handleSetItemCallback =
function(item, type, callback) {
	if (callback) {
		callback();
	}
	if (type === ZmApp.MAIL) {
		this._fetchMsgAttachments(item);
	}
};

ZmOffline.prototype._handleGetError =
function(folder, index, result) {
	localStorage.removeItem("SyncToken");
};

// Different enough from mail to warrent its own function
ZmOffline.prototype._handleUpdateAppts =
function(items, type){

    if (!items) items = [];

    var item = null;
    var folders = {};
    var startOfDayDate = new Date();
    var currentTime    = startOfDayDate.getTime();
    var endOfDayDate   = new Date(currentTime);

    // We only care about changes within our display window.
    startOfDayDate.setHours(0,0,0,0);
    var newStartTime = startOfDayDate.getTime() - (AjxDateUtil.MSEC_PER_DAY * ZmOffline.CALENDAR_LOOK_BEHIND_DAYS);
    endOfDayDate.setHours(23,59,59,999)
    var newEndTime   = endOfDayDate.getTime()   + (AjxDateUtil.MSEC_PER_DAY * ZmOffline.CALENDAR_READ_AHEAD_DAYS);

    var previousEndTime = newEndTime;
    var lastSyncTime = localStorage.getItem("calendarSyncTime");
    if (lastSyncTime) {
        previousEndTime = parseInt(lastSyncTime) + (AjxDateUtil.MSEC_PER_DAY * ZmOffline.CALENDAR_READ_AHEAD_DAYS);
    }
    localStorage.setItem("calendarSyncTime", endOfDayDate.getTime());

    // Accumulate the ids of the altered appts
    var itemQueryClause = [];
    var apptIds  = {};
    var sId;
    for (var i = 0, length = items.length; i < length; i++){
        item = items[i];
        sId = item.id.toString();
        apptIds[sId] = true;
        itemQueryClause.push("item:\"" + sId + "\"");
    }

    // If this is not the first download, we need to extend the visible range beyond the last update which read
    // calendar items from current-1week to current+3weeks.  So if 2 days has passed since the previous
    // read, read from the previousEnd to previousEnd+2days;  We also update previousEnd (by setting
    // calendarSyncTime in localstore).
    var doEndRangeDownloadCallback = (newEndTime > previousEndTime) ?
        this._downloadCalendar.bind(this, previousEndTime, newEndTime, null, null, true) : null;

    if (itemQueryClause.length > 0) {
        this._downloadByApptId(apptIds, itemQueryClause, newStartTime, newEndTime, doEndRangeDownloadCallback);
    } else if (doEndRangeDownloadCallback) {
        doEndRangeDownloadCallback.run();
    }

    // Delete items < newStartTime, in order to prune old entries and prevent monotonic accumulation
    // Search for items whose endTime is from 0 to newStartTime
    var search = [0, newStartTime];
    var errorCallback = this._expiredErrorCallback.bind(this);
    var offlineSearchExpiredAppts = this._offlineUpdateAppts.bind(this, null);
    ZmOfflineDB.doIndexSearch(search, ZmApp.CALENDAR, null, offlineSearchExpiredAppts, errorCallback, "endDate");
};

ZmOffline.prototype._offlineUpdateAppts =
function(apptContainersToAdd, apptContainersToDelete) {
    var appt;
	if (apptContainersToDelete) {
		for (var i = 0; i < apptContainersToDelete.length; i++) {
			appt = apptContainersToDelete[i].appt;
			ZmOfflineDB.deleteItem(this._createApptPrimaryKey(appt), ZmApp.CALENDAR, this.calendarDeleteErrorCallback.bind(this));
		}
	}

	// Store the new/modified entries.
	if (apptContainersToAdd) {
		ZmOfflineDB.setItem(apptContainersToAdd, ZmApp.CALENDAR, null, this.calendarDownloadErrorCallback.bind(this));
	}
}

ZmOffline.prototype._expiredErrorCallback =
function(e) {
    DBG.println(AjxDebug.DBG1, "Error while trying to search for expired appts in indexedDB.  Error = " + e);
}

ZmOffline.prototype._loadMessages =
function(msgIds, callback){
    if (!msgIds || msgIds.length === 0){
        return;
    }
    var soapDoc = AjxSoapDoc.create("BatchRequest", "urn:zimbra");
    soapDoc.setMethodAttribute("onerror", "continue");
    for (var i=0, length = msgIds.length;i<length;i++){
        var requestNode = soapDoc.set("GetMsgRequest",null,null,"urn:zimbraMail");
        var msg = soapDoc.set("m", null, requestNode);
        msg.setAttribute("id", msgIds[i]);
        msg.setAttribute("read", 0);
        msg.setAttribute("html", 1);
        msg.setAttribute("needExp", 1);
     }
    var respCallback = this._handleGetResponse.bind(this, callback);
    appCtxt.getRequestMgr().sendRequest({
        soapDoc: soapDoc,
        asyncMode: true,
        callback: respCallback
    });

};


ZmOffline.prototype._replayOfflineRequest =
function() {
    var callback = this._sendOfflineRequest.bind(this);
    ZmOfflineDB.getItemInRequestQueue(false, callback);
};

ZmOffline.prototype._sendOfflineRequest =
function(result, skipOfflineAttachmentUpload) {

    if (!result || result.length === 0) {
        return;
    }

	if (skipOfflineAttachmentUpload) {
		var idArray = [];
		var oidArray = [];
		// Bundle it together in a batch request
		var params = {
			jsonObj : {BatchRequest:{_jsns:"urn:zimbra", onerror:"continue"}},
			asyncMode : true
		};
		params.errorCallback = params.callback = this._handleResponseSendOfflineRequest.bind(this, idArray, oidArray);
		var batchRequest = params.jsonObj.BatchRequest;
		result.forEach(function(obj) {
			var methodName = obj.methodName;
			if (methodName === "BatchRequest") {
				$.extend(true, batchRequest, obj[methodName]);
			}
			else {
				if (!batchRequest[methodName]) {
					batchRequest[methodName] = [];
				}
				batchRequest[methodName].push(obj[methodName]);
			}
			idArray.push(obj.id);
			oidArray.push(obj.oid);
		});
		appCtxt.getRequestMgr().sendRequest(params);
	}
	else {
		var offlineAttachments = [];
		result.forEach(function(obj) {
			var methodName = obj.methodName;
			if (methodName === "SendMsgRequest" || methodName === "SaveDraftRequest") {
				var msg = obj[methodName].m;
				var attach = msg && msg.attach;
				if (attach) {
					for (var j in attach) {
						var attachmentObj = attach[j];
						if (attachmentObj && attachmentObj.isOfflineUploaded) {
							offlineAttachments.push(attachmentObj);
						}
					}
				}
				var flags = msg && msg.f;
				if (flags && flags.indexOf(ZmItem.FLAG_OFFLINE_CREATED) !== -1) {
					msg.f = flags.replace(ZmItem.FLAG_OFFLINE_CREATED, "");//Removing the offline created flag
					if (!msg.f) {
						delete msg.f;
					}
					delete msg.id;//Removing the temporary id
					delete msg.did;//Removing the temporary draft id
				}
			}
		});
		this._uploadOfflineAttachments(offlineAttachments, result);
	}
};

ZmOffline.prototype._handleResponseSendOfflineRequest =
function(idArray, oidArray) {
	if (idArray.length > 0) {
		var callback = ZmOffline.updateFolderCountCallback.bind(window, ZmFolder.ID_OUTBOX, 0);
		ZmOfflineDB.deleteItem(idArray, ZmApp.MAIL, callback);
	}
	if (oidArray.length > 0) {
		ZmOfflineDB.deleteItemInRequestQueue(oidArray);
	}
};

ZmOffline.prototype._getFolder =
function(index){
    for (var i=0, length = ZmOffline.folders.length; i< length; i++){
        if (ZmOffline.folders[i].id == index){
            return ZmOffline.folders[i].name;
        }
    }
    if (ZmOffline.calendars[index]) {
        return ZmOffline.calendars[index];
    } else {
        return null;
    }
};

/**
 * Deletes conversations or messages from the offline database.
 * @param {deletedIds}	array of message/convesation id's to be deleted from offline database.
 * @param {type}    type of the mail item ("message" or "conversation").
 */

ZmOffline.prototype.deleteItem =
function(deletedIds, type, folder){
    if (!deletedIds || deletedIds.length === 0){
        return;
    }
    var store = folder + type;
    for (var i=0, length = deletedIds.length;i < length; i++){
        ZmOfflineDB.deleteItem(deletedIds[i], store);
    }

};

ZmOffline.deleteOfflineData =
function() {
    DBG.println(AjxDebug.DBG1, "ZmOffline.deleteOfflineData");
    ZmOfflineDB.deleteDB();
    localStorage.clear();
};

ZmOffline.generateMsgResponse =
function(result) {
    var resp = [],
        obj,
        msgNode,
        generatedMsg,
        messagePart,
        i,
        length;

    result = [].concat(result);
    for (i = 0, length = result.length; i < length; i++) {
        obj = result[i];
        if (obj) {
            msgNode = obj[obj.methodName] && obj[obj.methodName]["m"];
            if (msgNode) {
                generatedMsg = {
                    id : msgNode.id,
                    f : msgNode.f || "",
                    mid : msgNode.mid,
                    cid : msgNode.cid,
                    idnt : msgNode.idnt,
                    e : msgNode.e,
                    l : "",
                    fr : "",
                    su : msgNode.su._content,
                    mp : [],
                    d : msgNode.d
                };
                //Flags
                if (obj.methodName === "SendMsgRequest") {
                    generatedMsg.f = generatedMsg.f.replace(ZmItem.FLAG_ISSENT, "").concat(ZmItem.FLAG_ISSENT);
                }
                else if (obj.methodName === "SaveDraftRequest") {
                    generatedMsg.f = generatedMsg.f.replace(ZmItem.FLAG_ISDRAFT, "").concat(ZmItem.FLAG_ISDRAFT);
                }
                if (msgNode.attach) {//attachment is there
                    generatedMsg.f = generatedMsg.f.replace(ZmItem.FLAG_ATTACH, "").concat(ZmItem.FLAG_ATTACH);
                }
                //Folder id
                if (obj.methodName === "SendMsgRequest") {
                    generatedMsg.l = ZmFolder.ID_OUTBOX.toString();
                }
                else if (obj.methodName === "SaveDraftRequest") {
                    generatedMsg.l = ZmFolder.ID_DRAFTS.toString();
                }
                //Message part
                messagePart = msgNode.mp[0];
                if (messagePart) {
                    var attach = msgNode.attach;
                    if (attach && attach.aid) { //attachment is there

                        generatedMsg.mp.push({
                            ct : ZmMimeTable.MULTI_MIXED,
                            part: ZmMimeTable.TEXT,
                            mp : []
                        });

                        if (messagePart.ct === ZmMimeTable.TEXT_PLAIN) {

                            generatedMsg.mp[0].mp.push({
                                body : true,
                                part : "1",
                                ct : ZmMimeTable.TEXT_PLAIN,
                                content : messagePart.content._content
                            });
                            generatedMsg.fr = generatedMsg.mp[0].mp[0].content;

                        } else if (messagePart.ct === ZmMimeTable.MULTI_ALT) {

                            generatedMsg.mp[0].mp.push({
                                ct : ZmMimeTable.MULTI_ALT,
                                part : "1",
                                mp : [{
                                        ct : ZmMimeTable.TEXT_PLAIN,
                                        part : "1.1",
                                        content : (messagePart.mp[0].content) ? messagePart.mp[0].content._content : ""
                                       },
                                       {
                                        ct : ZmMimeTable.TEXT_HTML,
                                        part : "1.2",
                                        body : true,
                                        content : (messagePart.mp[1].content) ? messagePart.mp[1].content._content : ""
                                       }
                                ]
                            });
                            generatedMsg.fr = generatedMsg.mp[0].mp[0].mp[0].content;

                        }

                        var attachIds = attach.aid.split(",");
                        for (var j = 0; j < attachIds.length; j++) {
                            var attachment = attach[attachIds[j]];
                            if (attachment) {
                                generatedMsg.mp[0].mp.push({
                                    cd : "attachment",
                                    ct : attachment.ct,
                                    filename : attachment.filename,
                                    aid : attachment.aid,
                                    s : attachment.s,
                                    data : attachment.data,
                                    isOfflineUploaded : attachment.isOfflineUploaded,
                                    part : (j + 2).toString()
                                });
                            }
                        }

                    } else {

                        if (messagePart.ct === ZmMimeTable.TEXT_PLAIN) {

                            generatedMsg.mp.push({
                                ct : ZmMimeTable.TEXT_PLAIN,
                                body : true,
                                part : "1",
                                content : messagePart.content._content
                            });
                            generatedMsg.fr = generatedMsg.mp[0].content;

                        } else if (messagePart.ct === ZmMimeTable.MULTI_ALT) {

                            generatedMsg.mp.push({
                                ct : ZmMimeTable.MULTI_ALT,
                                part: ZmMimeTable.TEXT,
                                mp : [{
                                        ct : ZmMimeTable.TEXT_PLAIN,
                                        part : "1",
                                        content : (messagePart.mp[0].content) ? messagePart.mp[0].content._content : ""
                                    },
                                    {
                                        ct : ZmMimeTable.TEXT_HTML,
                                        part : "2",
                                        body : true,
                                        content : (messagePart.mp[1].content) ? messagePart.mp[1].content._content : ""
                                    }
                                ]
                            });
                            generatedMsg.fr = generatedMsg.mp[0].mp[0].content;

                        }
                    }
                }
            }
            resp.push(generatedMsg);
        }
    }
    return resp;
};

/**
 * For ZWC offline, adds outbox folder
 */
ZmOffline.addOutboxFolder =
function() {
    if (!appCtxt.isWebClientOfflineSupported) {
        return;
    }
    var folderTree = appCtxt.getFolderTree(),
        root = folderTree.root,
        folderObj = {
            id: ZmFolder.ID_OUTBOX,
            absFolderPath: "/Outbox",
            activesyncdisabled: false,
            name: "Outbox"
        };
    var folder = ZmFolderTree.createFolder(ZmOrganizer.FOLDER, root, folderObj, folderTree, null, "folder");
    root.children.add(folder);
};

ZmOffline.updateFolderCount =
function() {
	var folders = [ZmFolder.ID_DRAFTS, ZmFolder.ID_OUTBOX];
	for (var i = 0, length = folders.length; i < length; i++) {
		var callback = ZmOffline.updateFolderCountCallback.bind(window, folders[i]);
		ZmOfflineDB.doIndexSearch([folders[i].toString()], ZmApp.MAIL, null, callback, null, "folder", true);
	}
};

ZmOffline.updateFolderCountCallback =
function(folderId, count) {
	if (AjxUtil.isArray(count)) {
		count = count.length;
	}
	var folder = appCtxt.getById(folderId);
	if (folder) {
		folder.notifyModify({n : count});
	}
};

ZmOffline.prototype._uploadOfflineAttachments =
function (attachments, result) {
	var attachment = attachments.shift();
	if (attachment) {
		var blob = AjxUtil.dataURItoBlob(attachment.data);
		if (blob) {
			blob.name = attachment.filename;
			var callback = this._uploadOfflineAttachmentsCallback.bind(this, attachments, result, attachment.aid);
			var errorCallback = this._uploadOfflineAttachmentsErrorCallback.bind(this, attachments, result, attachment.aid);
			ZmComposeController.prototype._uploadImage(blob, callback, errorCallback);
		}
	}
	else {
		this._sendOfflineRequest(result, true);
	}
};

ZmOffline.prototype._uploadOfflineAttachmentsCallback =
function(attachments, result, attachmentAid, uploadResponse) {
	for (var i = 0; i < result.length; i++) {
		var obj = result[i];
		if (!obj) {
			continue;
		}
		var methodName = obj.methodName;
		if (methodName === "SendMsgRequest" || methodName === "SaveDraftRequest") {
			var msg = obj[methodName].m;
			var attach = msg && msg.attach;
			var aid = attach && attach.aid;
			if (aid && aid.indexOf(attachmentAid) !== -1) {
				attach.aid = aid.replace(attachmentAid, uploadResponse[0].aid);
				delete attach[attachmentAid];
				break;
			}
		}
	}
	this._uploadOfflineAttachments(attachments, result);
};

ZmOffline.prototype._uploadOfflineAttachmentsErrorCallback =
function(attachments, result, attachmentAid) {
	for (var i = 0; i < result.length; i++) {
		var obj = result[i];
		if (!obj) {
			continue;
		}
		var methodName = obj.methodName;
		if (methodName === "SendMsgRequest" || methodName === "SaveDraftRequest") {
			var msg = obj[methodName].m;
			var attach = msg && msg.attach;
			var aid = attach && attach.aid;
			if (aid && aid.indexOf(attachmentAid) !== -1) {
				var aidArray = aid.split(",");
				AjxUtil.arrayRemove(aidArray, attachmentAid);
				if (aidArray.length > 0) {
					delete attach.aid;
				}
				else {
					attach.aid = aidArray.join();
				}
				delete attach[attachmentAid];//deleting the offline created attachment in the message node
				break;
			}
		}
	}
	this._uploadOfflineAttachments(attachments, result);
};

ZmOffline.prototype._uploadOfflineInlineAttachments =
function (obj, msg) {
    var template = document.createElement("template");
    template.innerHTML = msg.mp[0].mp[1].content._content;
    var dataURIImageNodeList = template.content.querySelectorAll("img[src^='data:']");
    for (var i = 0; i < dataURIImageNodeList.length; i++) {
        var blob = AjxUtil.dataURItoBlob(dataURIImageNodeList[i].src);
        if (blob) {
            var callback = this._uploadOfflineInlineAttachmentsCallback.bind(this, dataURIImageNodeList[i], obj, msg, template);
            ZmComposeController.prototype._uploadImage(blob, callback);
        }
    }

};

ZmOffline.prototype._uploadOfflineInlineAttachmentsCallback =
function(img, obj, msg, template, uploadResponse) {
    //img.src =
    var dataURIImageNodeList = template.content.querySelectorAll("img[src^='data:']");
    if (dataURIImageNodeList.length === 0) {
        delete msg.isInlineAttachment;
        this._sendOfflineRequest([].concat(obj));
    }
};

/**
 * Fires a head request to find whether server is reachable or not
 * @param {Boolean} [doStop] will not fire a second head request to confirm the server reachability
 * @param {Boolean} [doNotTrigger] Do not trigger online/offline events
 * @param {Function} [callback] Callback function to be called when the request finishes
 */
ZmOffline.checkServerStatus =
function(doStop, doNotTrigger, callback) {
    $.ajax({
        type: "HEAD",
        url: "/public/blank.html",
		cache: false,
        statusCode: {
            0: function() {
                if (ZmOffline.isServerReachable === true) {
                    if (doStop) {
                        // Reset here - state must be correct for functions triggered by ZWCOffline
                        ZmOffline.isServerReachable = false;
						if (!doNotTrigger) {
							$.event.trigger({
								type: "ZWCOffline"
							});
						}
					}
                    else {
                        return ZmOffline.checkServerStatus(true);
                    }
                }
                ZmOffline.isServerReachable = false;
            },
            200: function() {
                if (ZmOffline.isServerReachable === false) {
                    if (doStop) {
                        // Reset here - state must be correct for functions triggered by ZWCOnline
                        ZmOffline.isServerReachable = true;
						if (!doNotTrigger) {
							$.event.trigger({
								type: "ZWCOnline"
							});
						}
					}
                    else {
                        return ZmOffline.checkServerStatus(true);
                    }
                }
                ZmOffline.isServerReachable = true;
			}
		},
		complete: callback
    });
};
ZmOffline.checkServerStatus(true, true);

ZmOffline.isOnlineMode =
function() {
    return appCtxt.isWebClientOfflineSupported && !appCtxt.isWebClientOffline();
};

ZmOffline.prototype._fetchMsgAttachments =
function(messages) {
    var attachments = [];
    messages = ZmOffline.recreateMsg(messages);
    messages.forEach(function(msg) {
        var mailMsg = ZmMailMsg.createFromDom(msg, {}, true);
        var attachInfo = mailMsg.getAttachmentInfo();
        attachInfo.forEach(function(attachment) {
            attachments.push(attachment);
        });
    });
    this._saveAttachments(attachments);
};

ZmOffline.prototype._saveAttachments =
function(attachments) {
    if (!attachments || attachments.length === 0) {
	    ZmOffline.refreshStatusIcon();
        return;
    }
	ZmOffline.refreshStatusIcon(true);
    var attachment = attachments.shift();
    var callback = this._isAttachmentSavedinIndexedDBCallback.bind(this, attachment, attachments);
    ZmOffline.isAttachmentSavedinIndexedDB(attachment, callback);
};

ZmOffline.isAttachmentSavedinIndexedDB =
function(attachment, callback, errorCallback) {
    var key = ZmOffline.createAttachmentKey(attachment);
    ZmOfflineDB.getItemCount(key, ZmOffline.ATTACHMENT, callback, errorCallback);
};

ZmOffline.createAttachmentKey = function(attachment) {
	return "id=" + attachment.mid + "&part=" + attachment.part;
}

ZmOffline.prototype._isAttachmentSavedinIndexedDBCallback =
function(attachment, attachments, count) {
    var callback = this._saveAttachments.bind(this, attachments);
    if (count === 0) {
        var request = $.ajax({
            url: attachment.url,
	        dataType: "text",
            headers: {'X-Zimbra-Encoding':'x-base64'}
        });

        request.done(function(response) {
            var key = ZmOffline.createAttachmentKey(attachment);
            var item = {
                id   : key,
                mid  : attachment.mid,
                url  : attachment.url,
                type : attachment.ct,
                name : attachment.label,
                size : attachment.sizeInBytes,
				part : attachment.part,
                content : response
            };
            ZmOfflineDB.setItem(item, ZmOffline.ATTACHMENT, callback, callback);
        }.bind(this));

        request.fail(callback);
    }
    else {
        callback();
    }
};

ZmOffline.prototype._handleAttachmentsForOfflineMode = function(attachments, getLinkIdCallback, linkIds) {
	if (appCtxt.isWebClientOffline()) {
		var keyArray = [];
		if (attachments) {
			attachments.forEach(function(attachment) {
				var key = ZmOffline.createAttachmentKey(attachment);
				keyArray.push(key);
			});
			if (keyArray.length > 0) {
				var callback = this._handleAttachmentsForOfflineModeCallback.bind(this, attachments, getLinkIdCallback, linkIds);
				ZmOfflineDB.getItem(keyArray, ZmOffline.ATTACHMENT, callback);
			}
		}
	}
};

ZmOffline.prototype._handleAttachmentsForOfflineModeCallback = function(attachments, getLinkIdCallback, linkIds, resultArray) {
	if (!resultArray || !linkIds) {
		return;
	}
	var self = this;
	resultArray.forEach(function(result) {
		if (result.type && result.content) {
			var url = "data:" + result.type + ";base64," + result.content;
			for (var i = 0; i < linkIds.length; i++) {
				//Attachment main link
				var id = getLinkIdCallback(result.part, linkIds[i]);
				var link = document.getElementById(id);
				if (link) {
					link.href     = url;
					link.onclick  = null;
					link.download = result.name;
				}
			}
		}
	});
};


ZmOffline.modifyMsg =
function(msg) {

    var result = [].concat(msg).map(function(item) {
        if (item.f) {
            item.f = item.f.split("");
        }
        if (item.su) {
            item.su = item.su.split(" ");
        }
        if (item.fr) {
            item.fr = item.fr.split(" ");
        }
        if (item.tn) {
            item.tn = item.tn.split(",");
        }
        if (item.l) {
            item.l = item.l.toString();
        }
        if (item.e) {
            var from = [];
            var to = [];
            var cc = [];
            item.e.forEach(function(element){
                if (element.t === "f") {
                    if (element.a) {
                        from.push(element.a.toLowerCase());
                    }
                    if (element.p) {
                        from = from.concat(element.p.toLowerCase().split(" "));
                    }
                }
                else if (element.t === "t") {
                    if (element.a) {
                        to.push(element.a.toLowerCase());
                    }
                    if (element.p) {
                        to = to.concat(element.p.toLowerCase().split(" "));
                    }
                }
                else if (element.t === "c") {
                    if (element.a) {
                        cc.push(element.a.toLowerCase());
                    }
                    if (element.p) {
                        cc = cc.concat(element.p.toLowerCase().split(" "));
                    }
                }
            });
            if (from.length) {
                item.e.from = from;
            }
            if (to.length) {
                item.e.to = to;
            }
            if (cc.length) {
                item.e.cc = cc;
            }
        }
        return item;
    });

    return result;
};

ZmOffline.recreateMsg =
function(msg) {

    var result = [].concat(msg).map(function(item) {
        if (Array.isArray(item.f)) {
            item.f = item.f.join();
        }
        if (Array.isArray(item.su)) {
            item.su = item.su.join(" ");
        }
        if (Array.isArray(item.fr)) {
            item.fr = item.fr.join(" ");
        }
        if (Array.isArray(item.tn)) {
            item.tn = item.tn.join();
        }
        if (item.e) {
            delete item.e.from;
            delete item.e.to;
            delete item.e.cc;
        }
        return item;
    });

    return result;
};

ZmOffline.modifyContact =
function(contact) {

    var result = [].concat(contact).map(function(item) {
        if (item.tn) {
            item.tn = item.tn.split(",");
        }
        if (item._attrs) {
            if (item._attrs.jobTitle) {
                item._attrs.jobTitle = item._attrs.jobTitle.split(" ");
            }
        }
        return item;
    });

    return result;
};

ZmOffline.recreateContact =
function(contact) {

    var result = [].concat(contact).map(function(item) {
        if (Array.isArray(item.tn)) {
            item.tn = item.tn.join();
        }
        if (item._attrs) {
            if (Array.isArray(item._attrs.jobTitle)) {
                item._attrs.jobTitle = item._attrs.jobTitle.join(" ");
            }
        }
		ZmOffline._cacheContactMember(item);
        return item;
    });

    return result;
};

/*
** cache contact group members
*/
ZmOffline._cacheContactMember =
function(contact) {
	var contactMember = contact.m;
	if (!contactMember || !Array.isArray(contactMember) || appCtxt.cacheGet(contact.id)) {
		return;
	}
	var contactObj = ZmContact.createFromDom(contact, {});
	var result = new ZmCsfeResult({GetContactsResponse : {cn : [contact]}});
	//This method will do the caching of contact group member and update the cache
	ZmContact.prototype._handleLoadResponse.call(contactObj, null, result);
};

ZmOffline.refreshStatusIcon =
function(isSyncing) {
	if (appCtxt.isWebClientOffline()) {
		$("#" + ZmId.SKIN_OFFLINE_STATUS).addClass("ImgDisconnect")
			.removeClass("ImgOfflineSync")
			.attr("title", ZmMsg.OfflineServerNotReachable);
	}
	else {
		if (isSyncing) {
			$("#" + ZmId.SKIN_OFFLINE_STATUS).addClass("ImgOfflineSync")
				.removeClass("ImgDisconnect")
				.attr("title", ZmMsg.offlineCachingSync);
		}
		else {
			$("#" + ZmId.SKIN_OFFLINE_STATUS).removeClass("ImgOfflineSync ImgDisconnect")
				.attr("title", ZmMsg.offlineCachingDone);
		}
	}
};

ZmOffline.handleLogOff =
function(ev, relogin) {
	if (ev) {
		ZmOfflineSettingsDialog.showConfirmSignOutDialog();
	}
	else if (relogin) {
		appCtxt.reloadAppCache();
		setTimeout(ZmZimbraMail.logOff, 1000);
	}
};