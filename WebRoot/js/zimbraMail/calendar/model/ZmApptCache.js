/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
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

ZmApptCache.prototype = new ZmApptCache();
ZmApptCache.prototype.constructor = ZmApptCache;

ZmApptCache.prototype.toString =
function() {
	return "ZmApptCache";
}

ZmApptCache.prototype.clearCache =
function() {
	this._cachedApptSummaries = {};
	this._cachedApptVectors = {};	
	this._cachedIds = {};		
}


ZmApptCache.prototype._getCachedVector =
function(startTime, endTime, fanoutAllDay) {
	var cacheKey = startTime + ":" + endTime + ":" + fanoutAllDay;
	var result  = this._cachedApptVectors[cacheKey];
	return result ? result.clone() : null;
}

ZmApptCache.prototype._findCachedApptSummaries =
function(start,end) {
	var found = false;
	var entry = this._cachedApptSummaries[start+":"+end];
	if (entry != null) return entry.list;

	for (var key in this._cachedApptSummaries) {
		entry = this._cachedApptSummaries[key];
		if (start >= entry.start &&
			end <= entry.end) {
			found = true;
			break;
		}
	}
	if (!found)
		return null;

	if (entry.start == start && entry.end == end)
		return entry.list;

	var apptList = entry.list.getSubset(start,end);
	this._cachedApptSummaries[start+":"+end] = {start: start, end:end, list: apptList};	
	return apptList;
}

ZmApptCache.prototype._updateCachedIds =
function(apptList) {
	var list = apptList.getVector();
	var size = list.size();
	for (var i=0; i < size; i++) {
		var ao = list.get(i);
		this._cachedIds[ao.id] = 1;
		this._cachedIds[ao.invId] = 1;		
	}	
}

/**
* caller is responsible for exception handling. caller should also not modify appts in this list directly.
*/
ZmApptCache.prototype.getApptSummaries =
function(start,end, fanoutAllDay, callback, nowait) {
	var list;
	
	var checked = this._calViewController._getCheckedCalendars();
		
	list = this._getCachedVector(start, end, fanoutAllDay);
	if (list != null) {
		if (callback) callback.run(list);
		return list; // already cloned
	}
	var apptList = this._findCachedApptSummaries(start,end);
	if (apptList != null) {
		list = ZmApptList.toVector(apptList, start, end, fanoutAllDay);
		this._cachedApptVectors[start+":"+end+":"+fanoutAllDay] = list;
		var newList = list.clone();
		if (callback) callback.run(newList);
		return newList;
	}

	if (nowait) return null;

	var soapDoc = AjxSoapDoc.create("GetApptSummariesRequest", "urn:zimbraMail");
	var method = soapDoc.getMethod();
	method.setAttribute("s", start);
	method.setAttribute("e", end);
	//method.setAttribute("l", "550");

	if (callback) {
		var respCallback = new AjxCallback(this, this._getApptSummariesResponse, [callback, start, end, fanoutAllDay]);
		this._appCtxt.getAppController().sendRequest(soapDoc, true, respCallback);	
	} else {
		var response = this._appCtxt.getAppController().sendRequest(soapDoc);
		var csfeResult = new ZmCsfeResult(response, false);
		return this._getApptSummariesResponse([null, start, end, fanoutAllDay, csfeResult]);
	}
}

ZmApptCache.prototype._getApptSummariesResponse =	
function(args) {
	var callback = args[0];
	var start = args[1];
	var end = args[2];
	var fanoutAllDay = args[3];
	var result = args[4];

	if (!result) return; // TODO: mark both as needing refresh?
	var response;
	try {
		response = result.getResponse();
	} catch (ex) {
		if (callback) callback.run(response);
		return;
	}
	
	var apptList = new ZmApptList(this._appCtxt);
	apptList.loadFromSummaryJs(response.GetApptSummariesResponse);

	this._updateCachedIds(apptList);
	
	// cache it 
	this._cachedApptSummaries[start+":"+end] = {start: start, end:end, list: apptList};	
	list = ZmApptList.toVector(apptList, start, end, fanoutAllDay);	
	this._cachedApptVectors[start+":"+end+":"+fanoutAllDay] = list;

	var newList = list.clone();
	if (callback) callback.run(newList);	
	return newList;
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
