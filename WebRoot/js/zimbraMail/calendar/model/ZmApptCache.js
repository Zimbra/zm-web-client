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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmApptCache(calViewController, appCtxt) {
	if (arguments.length == 0) return;
	this._calViewController = calViewController;
	this._appCtxt = appCtxt;
	this.clearCache();
}

ZmApptCache.prototype.toString =
function() {
	return "ZmApptCache";
}

ZmApptCache.prototype.clearCache =
function() {
	this._cachedApptSummaries = {};
	this._cachedApptVectors = {};	
	this._cachedMergedApptVectors = {};
	this._cachedIds = {};		
}

ZmApptCache._sortFolderId =
function(a,b) {
	return a-b;
}

ZmApptCache.prototype._getCachedMergedKey =
function(startTime, endTime, fanoutAllDay, folderIds) {
	var sortedFolderIds = new Array();
	sortedFolderIds = sortedFolderIds.concat(folderIds);
	sortedFolderIds.sort(ZmApptCache._sortFolderId);
	return cacheKey = startTime + ":" + endTime + ":" + fanoutAllDay + ":" + sortedFolderIds.join(":");
}

ZmApptCache.prototype._getCachedMergedVector =
function(cacheKey) {
	var vec = this._cachedMergedApptVectors[cacheKey];
	//DBG.println("_getCachedMergedVector: cacheKey: ", cacheKey, " found:", (vec != null));
	return vec;
}

ZmApptCache.prototype._cacheMergedVector =
function(vector, cacheKey) {
	//DBG.println("_cacheMergedBector cacheKey: "+cacheKey);	
	this._cachedMergedApptVectors[cacheKey] = vector.clone();
}

ZmApptCache.prototype._getCachedVector =
function(startTime, endTime, fanoutAllDay, folderId) {
	var folderCache = this._cachedApptVectors[folderId];
	if (folderCache == null) 	folderCache = this._cachedApptVectors[folderId] = {};
	
	var cacheKey = startTime + ":" + endTime + ":" + fanoutAllDay;

	var vec = folderCache[cacheKey];
	if (vec == null) {
		// try to find it in the appt summaries results
		var apptList = this._getCachedApptSummaries(startTime, endTime, folderId);
		if (apptList != null) {
			vec = folderCache[cacheKey] = ZmApptList.toVector(apptList, startTime, endTime, fanoutAllDay);
		}
	}
	return vec;	
}

ZmApptCache.prototype._cacheVector =
function(vector, startTime, endTime, fanoutAllDay, folderId) {
	var folderCache = this._cachedApptVectors[folderId];
	if (folderCache == null) 	folderCache = this._cachedApptVectors[folderId] = {};
	
	var cacheKey = startTime + ":" + endTime + ":" + fanoutAllDay;
	folderCache[cacheKey] = vector;
}




ZmApptCache.prototype._cacheApptSummaries =
function(apptList, startTime, endTime, folderId) {
	var folderCache = this._cachedApptSummaries[folderId];
	if (folderCache == null) 	folderCache = this._cachedApptSummaries[folderId] = {};
	var cacheKey = startTime+":"+	endTime;	
	folderCache[cacheKey] = {start: startTime, end:endTime, list: apptList};
}
			
ZmApptCache.prototype._getCachedApptSummaries =
function(start,end, folderId) {
	var found = false;
	
	var folderCache = this._cachedApptSummaries[folderId];
	if (folderCache == null) 	folderCache = this._cachedApptSummaries[folderId] = {};

	var cacheKey = start+":"+	end;

	// see if this particular range is cached	
	var entry = this._cachedApptSummaries[cacheKey];
	if (entry != null) return entry.list;

	// look through all cache results. typically if we are asking for a week/day, the
	// month range will already be in the cache
	for (var key in folderCache) {
		entry = folderCache[key];
		if (start >= entry.start && end <= entry.end) {
			found = true;
			break;
		}
	}
	if (!found)
		return null;

	// hum. should this ever happen?
	if (entry.start == start && entry.end == end) {
		return entry.list;
	}
	
	// get subset, and cache it for future use (mainly if someone pages back and forth)
	var apptList = entry.list.getSubset(start,end);
	folderCache[cacheKey] = {start: start, end:end, list: apptList};	
	return apptList;
}

ZmApptCache.prototype._updateCachedIds =
function(apptList) {
	var list = apptList.getVector();
	var size = list.size();
	for (var i=0; i < size; i++) {
		var ao = list.get(i);
		this._cachedIds[ao.id] = 1;
	}	
}

/**
* returns a vector of appt summaries for the specified time range across the specified folders.
*/
ZmApptCache.prototype.getApptSummaries =
function(start,end, fanoutAllDay, folderIds, callback) {
	var list;
	if (!(folderIds instanceof Array)) {
		folderIds = [ folderIds ];
	} else if (folderIds.length == 0) {
		var newVec = new AjxVector();
		if (callback) callback.run(newVec);
		return newVec;
	}
	
	var mergeKey = this._getCachedMergedKey(start, end, fanoutAllDay, folderIds);
	list = this._getCachedMergedVector(mergeKey);
	if (list != null) {
		if (callback) callback.run(list.clone());
		return list.clone();
	}

	var context = {
		start: start,
		end: end,
		fanoutAllDay: fanoutAllDay,
		folderIds: folderIds,
		callback: callback,
		mergeKey: mergeKey,
		needToFetch: [],
		resultList: [] // array of vectors
	};

	for (var i=0; i < folderIds.length; i++) {
		// check vector cache first
		list = this._getCachedVector(start, end, fanoutAllDay, folderIds[i]);
		if (list != null) {
			context.resultList.push(list);
		} else {
			context.needToFetch.push(folderIds[i]); // need to make soap call
		}
	}

	// do we have them all our not?
	if (context.needToFetch.length == 0) {
		var newList = ZmApptList.mergeVectors(context.resultList);
		this._cacheMergedVector(newList, mergeKey);
		if (callback) callback.run(newList);
		return newList;
	}	

	//if (nowait) return null;

	// fetch away...
	// set up batch request call
	var soapDoc = AjxSoapDoc.create("BatchRequest", "urn:zimbra");
	soapDoc.setMethodAttribute("onerror", "continue");

	for (var i=0; i < context.needToFetch.length; i++) {
		var req = soapDoc.set("GetApptSummariesRequest", null, null, "urn:zimbraMail");
		req.setAttribute("s", start);
		req.setAttribute("e", end);
		req.setAttribute("l", context.needToFetch[i]);
		req.setAttribute("id", i);
	}
	
	//var soapDoc = AjxSoapDoc.create("GetApptSummariesRequest", "urn:zimbraMail");
	//var method = soapDoc.getMethod();
	//method.setAttribute("s", start);
	//method.setAttribute("e", end);
	//	if ((folderIds instanceof Array) && folderIds[0] != null) {
	//		method.setAttribute("l", folderIds[0]);
	//	}

	if (callback) {
		var respCallback = new AjxCallback(this, this._getApptSummariesResponse, [context]);
		this._appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode: true, callback: respCallback});
	} else {
		var response = this._appCtxt.getAppController().sendRequest({soapDoc: soapDoc});
		var csfeResult = new ZmCsfeResult(response, false);
		return this._getApptSummariesResponse(context, csfeResult);
	}
}

ZmApptCache.prototype._getApptSummariesResponse =
function(context, result) {
	var callback = context.callback;
	var start = context.start;
	var end = context.end;
	var fanoutAllDay = context.fanoutAllDay;

	if (!result) return; // TODO: mark both as needing refresh?
	var response = null;
	try {
		response = result.getResponse();
	} catch (ex) {
		if (callback) callback.run(response);
		return;
	}

	if (!response.BatchResponse) {
		// error	
	}

	if (response.BatchResponse.Fault instanceof Array) {
		// TODO: log something in console for calendars we couldn't fetch?
		// send errors back via callback?
	}

	if (response.BatchResponse.GetApptSummariesResponse && response.BatchResponse.GetApptSummariesResponse instanceof Array) {
		var summaries = response.BatchResponse.GetApptSummariesResponse;
		
		for (var i=0; i < summaries.length; i++) {
			var apptList = new ZmApptList(this._appCtxt);
			apptList.loadFromSummaryJs(summaries[i]);

			var folderId = context.needToFetch[summaries[i].id];// id in response tied back to folder id

			// TODO: no need to cache remote ids for now?
			var cal = this._calViewController.getCalendar(folderId);
			var isLink = cal ? (cal.link ? true : false) : false;
			if (!isLink) this._updateCachedIds(apptList);

			// cache it 
			this._cacheApptSummaries(apptList, start, end, folderId);

			// convert to sorted vector
			var list = ZmApptList.toVector(apptList, start, end, fanoutAllDay);	
			this._cacheVector(list, start, end, fanoutAllDay, folderId); // id in response tied back to folder id

			context.resultList.push(list);
		}
	}

	// merge all the data and return
	var newList = ZmApptList.mergeVectors(context.resultList);

	this._cacheMergedVector(newList, context.mergeKey);
		
	if (callback) {
		callback.run(newList);
	} else {
		return newList;
	}
}

// return true if the cache contains the specified id(s)
// id can be an array or a single id.
ZmApptCache.prototype.containsAnyId =
function(ids) {
	if (!ids) return false;
	if (ids instanceof Array) {
		for (var i=0; i < ids.length; i++) {
			if (this._cachedIds[ids[i]]) return true;
		}
	} else {
		if (this._cachedIds[ids]) return true;
	}
	return false;
}

// similar to  containsAnyId, though deals with an object
// (or array of objects) that have the id property
ZmApptCache.prototype.containsAnyItem =
function(items) {
	if (!items) return false;
	if (items instanceof Array) {
		for (var i=0; i < items.length; i++) {
			if (items[i].id && this._cachedIds[items[i].id]) {
				return true;
			}
		}
	} else {
		if (items.id && this._cachedIds[items.id]) return true;
	}
	return false;
}
