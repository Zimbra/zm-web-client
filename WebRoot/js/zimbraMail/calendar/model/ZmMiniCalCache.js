/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

ZmMiniCalCache = function(calViewController) {
	this._calViewController = calViewController;
	this.clearCache();
};

ZmMiniCalCache.prototype.toString =
function() {
	return "ZmMiniCalCache";
};

ZmMiniCalCache.prototype.clearCache =
function() {
	this._miniCalData = {};
};

ZmMiniCalCache.prototype.updateCache =
function(params, data) {
	var key = this._getCacheKey(params);
	this._miniCalData[key] = data;	
};

ZmMiniCalCache.prototype._getCacheKey =
function(params) {
	var sortedFolderIds = [];
	sortedFolderIds = sortedFolderIds.concat(params.folderIds);
	sortedFolderIds.sort();
	return (params.start + ":" + params.end + ":" + sortedFolderIds.join(":"));
};

ZmMiniCalCache.prototype._getMiniCalData =
function(params) {
	var cacheKey = this._getCacheKey(params);
	var cachedData = this._miniCalData[cacheKey];
	if (cachedData) {
		this.highlightMiniCal(cachedData);
		if (params.callback) {
			params.callback.run(cachedData);
			return;
		}
		return cachedData;
	}	

	var jsonObj = {GetMiniCalRequest:{_jsns:"urn:zimbraMail"}};
	var request = jsonObj.GetMiniCalRequest;

	this._setSoapParams(request, params);

	appCtxt.getAppController().sendRequest({
		jsonObj: jsonObj,
		asyncMode: true,
        offlineCache: true,
		callback: (new AjxCallback(this, this._getMiniCalResponse, [params])),
		errorCallback: (new AjxCallback(this, this._handleMiniCalResponseError, [params])),
        offlineCallback: this._getMiniCalOfflineResponse.bind(this, params),
		noBusyOverlay: params.noBusyOverlay,
		accountName: (appCtxt.multiAccounts ? appCtxt.accountList.mainAccount.name : null)
	});
};

ZmMiniCalCache.prototype.getCacheData =
function(params) {
	var cacheKey = this._getCacheKey(params);
	var cachedData = this._miniCalData[cacheKey];
	if (cachedData) {
		return cachedData;
	}
};

ZmMiniCalCache.prototype._handleMiniCalResponseError =
function(params, result) {
	var code = result ? result.code : null;
	if (code == ZmCsfeException.ACCT_NO_SUCH_ACCOUNT ||
		code == ZmCsfeException.MAIL_NO_SUCH_MOUNTPOINT)
	{
		var data = (result && result.data) ? result.data : null;
		var id = (data && data.itemId && (data.itemId.length>0)) ? data.itemId[0] : null;
		if (id && appCtxt.getById(id) && this._faultHandler) {
			var folder = appCtxt.getById(id);
			folder.noSuchFolder = true;
			this._faultHandler.run(folder);
			return true;
		}
	}

	//continue with callback operation
	if(params.callback) {
		params.callback.run([]);
	}

	return true;
};

ZmMiniCalCache.prototype._setSoapParams = 
function(request, params) {
	request.s = params.start;
	request.e = params.end;
    request.tz = params.tz;

	var folderNode = null;
	if (params.folderIds && params.folderIds.length) {
		request.folder = [];
		for (var i = 0; i < params.folderIds.length; i++) {
			request.folder.push({id:params.folderIds[i]});
		}
	}
    if(params.tz){
        request.tz = [];
        var timezone = AjxTimezone.getRule(params.tz);
        request.tz.push({id:params.tz,stdoff: timezone ? timezone.standard.offset : 0});
    }

};

ZmMiniCalCache.prototype.setFaultHandler =
function(faultHandler) {
	this._faultHandler = faultHandler;
};

ZmMiniCalCache.prototype._getMiniCalResponse =
function(params, result) {
	var data = [];
	if (!result) { return data; }

	var callback = params.callback;
	var resp = result && result._data && result._data;
	var miniCalResponse = resp.GetMiniCalResponse;

	if (miniCalResponse && miniCalResponse.date) {
		var dates = miniCalResponse.date;
		if (dates) {
			for (var i = 0; i < dates.length; i++) {
				if (dates[i]._content) {
					data.push(dates[i]._content);
				}
			}
		}	
		this.highlightMiniCal(data);
	} else {
		// always reset hiliting if empty response returned
		this.highlightMiniCal([]);
	}

    var errors = (miniCalResponse && miniCalResponse.error);
    this.handleError(errors);

	this.updateCache(params, data);

	if (params.callback) {
		params.callback.run(data);
		return;
	}

	return data;
};

ZmMiniCalCache.prototype._getMiniCalOfflineResponse =
function(params) {

    var calMgr = appCtxt.getCalManager();
    var calViewController = calMgr && calMgr.getCalViewController();
    if (calViewController) {
        var apptCache = calViewController.getApptCache();
        if (apptCache) {
            var folderIds = calViewController.getMainAccountCheckedCalendarIds();
            var searchParams = { folderIds: folderIds,
                                 start: params.start,
                                 end: params.end
                               };
            var apptList = apptCache.setSearchParams(searchParams);
            if (apptList) {
                apptCache.processOfflineMiniCal(params, apptList);
            } else {
                apptCache.offlineSearchAppts(searchParams, params, null);
            }
        }
    }
}

ZmMiniCalCache.prototype.processBatchResponse =
function(miniCalResponse, data) {
	if (!miniCalResponse) { return; }

	for (var i = 0; i < miniCalResponse.length; i++) {
		var dates = (miniCalResponse[i] && miniCalResponse[i].date);
		if (dates) {
			for (var j = 0; j < dates.length; j++) {
				if (dates[j]._content) {
					data.push(dates[j]._content);
				}
			}
		}

        var errors = (miniCalResponse[i] && miniCalResponse[i].error);
        this.handleError(errors);
	}
};

ZmMiniCalCache.prototype.handleError =
function(errors) {
    if (errors && errors.length) {
        for (var i = 0; i < errors.length; i++) {
            if (errors[i].code == ZmCsfeException.MAIL_NO_SUCH_FOLDER || errors[i].code == ZmCsfeException.MAIL_NO_SUCH_MOUNTPOINT || errors[i].code == ZmCsfeException.ACCT_NO_SUCH_ACCOUNT || errors[i].code == ZmCsfeException.SVC_PERM_DENIED) {
                var id = errors[i].id;
                if (id && appCtxt.getById(id)) {
                    var folder = appCtxt.getById(id);
                    folder.noSuchFolder = true;
                }
            }
        }
    }
};

ZmMiniCalCache.prototype.highlightMiniCal =
function(dateArr) {
	var highlight = {};
	for (var i = 0; i < dateArr.length; i++) {
		if (dateArr[i]) {
			highlight[dateArr[i]] = AjxDateFormat.parse("yyyyMMdd", dateArr[i]);
		}
	}
	if (this._calViewController && this._calViewController._miniCalendar) {
		this._calViewController._miniCalendar.setHilite(highlight, true, true);
	}
};
