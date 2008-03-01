/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
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
function(params, data) 
{
	var key = this._getCacheKey(params);
	this._miniCalData[key] = data;	
};

ZmMiniCalCache._sortFolderId =
function (a,b) {
	return a-b;
};

ZmMiniCalCache.prototype._getCacheKey =
function(params) {
	var sortedFolderIds = [];
	sortedFolderIds = sortedFolderIds.concat(params.folderIds);
	sortedFolderIds.sort(ZmApptCache._sortFolderId);
	return (params.start + ":" + params.end + ":" + sortedFolderIds.join(":"));
};

ZmMiniCalCache.prototype._getMiniCalData =
function(params) {
	
	var cacheKey = this._getCacheKey(params);
	var cachedData = this._miniCalData[cacheKey];
	if(cachedData) {
		this.highlightMiniCal(params, cachedData);
		if(params.callback) {
			params.callback.run(cachedData);
			return;
		}
		return cachedData;
	}	
	
	
	var soapDoc = AjxSoapDoc.create("GetMiniCalRequest", "urn:zimbraMail");

	var method = soapDoc.getMethod();
	
	this._setSoapParams(soapDoc, method, params);

	if (params.callback) {
		var respCallback = new AjxCallback(this, this._getMiniCalResponse, [params]);
		appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true, callback:respCallback, noBusyOverlay:params.noBusyOverlay});
	} else {
		var response = appCtxt.getAppController().sendRequest({soapDoc: soapDoc});
		var result = new ZmCsfeResult(response, false);
		return this._getMiniCalResponse(params, result);
	}
};

ZmMiniCalCache.prototype._setSoapParams = 
function(soapDoc, method, params) {
	
	method.setAttribute("s", params.start);
	method.setAttribute("e", params.end);

	var folderNode = null;
	for(var i=0; i < params.folderIds.length; i++) {		
		folderNode = soapDoc.set("folder", null, method);
		folderNode.setAttribute("id", params.folderIds[i]);
	}
};	

ZmMiniCalCache.prototype._getMiniCalResponse =
function(params, result) {

	var data = [];
	if (!result) { return data; }

	var callback = params.callback;
	var resp;
	try {
		resp = result.getResponse();
	} catch (ex) {
		if (callback)
			callback.run(data);
		return;
	}
	
	var miniCalResponse = resp.GetMiniCalResponse;
	
	if(miniCalResponse && miniCalResponse.date) {
		var dates = miniCalResponse.date;
		if(dates) {
			for(var i=0; i< dates.length; i++){
				if(dates[i]._content) {
					data.push(dates[i]._content);
				}
			}
		}	
		this.highlightMiniCal(params, data);
	}
	
	this.updateCache(params, data);	
	
	if(params.callback) {
		params.callback.run(data);
		return;
	}
	
	return data;
};

ZmMiniCalCache.prototype.processBatchResponse =
function(miniCalResponse, data) {
	
	if(!miniCalResponse){ return; }
	
	for (var i = 0; i < miniCalResponse.length; i++) {
		if(miniCalResponse[i] && miniCalResponse[i].date) {
			var dates = miniCalResponse[i].date;
			if(dates) {
				for(var i=0; i< dates.length; i++){
					if(dates[i]._content) {
						data.push(dates[i]._content);
					}
				}
			}				
		}
	}	
};

ZmMiniCalCache.prototype.highlightMiniCal =
function(params, dateArr) {
	var highlight = [];
	for(var i=0; i< dateArr.length; i++){
		if(dateArr[i]) {
			highlight[dateArr[i]] = AjxDateFormat.parse("yyyyMMdd", dateArr[i]);
		}
	}
	if(this._calViewController && this._calViewController._miniCalendar) {
		this._calViewController._miniCalendar.setHilite(highlight, true, true);	
	}
	return;
};