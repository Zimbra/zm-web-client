/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
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

/**
 * Creates a conversation.
 * @constructor
 * @class
 * This class represents a conversation, which is a collection of mail messages
 * which have the same subject.
 *
 * @param id		[int]			unique ID
 * @param list		[ZmMailList]	list that contains this conversation
 */
ZmConv = function(id, list) {

	ZmMailItem.call(this, ZmItem.CONV, id, list);
	
	// conversations are always sorted by date desc initially
	this._sortBy = ZmSearch.DATE_DESC;
	this._listChangeListener = new AjxListener(this, this._msgListChangeListener);
	this.folders = {};
};

ZmConv.prototype = new ZmMailItem;
ZmConv.prototype.constructor = ZmConv;

ZmConv.prototype.toString = 
function() {
	return "ZmConv";
};

// Public methods

/**
 * Creates a conv from its JSON representation.
 */
ZmConv.createFromDom =
function(node, args) {
	var conv = new ZmConv(node.id, args.list);
	conv._loadFromDom(node);
	return conv;
};

/**
 * Creates a conv from msg data.
 */
ZmConv.createFromMsg =
function(msg, args) {
	var conv = new ZmConv(msg.cid, args.list);
	conv._loadFromMsg(msg);
	return conv;
};

/**
 * Ensures that the requested range of msgs is loaded, getting them from the server if needed.
 * Because the list of msgs returned by the server contains info about which msgs matched the
 * search, we need to be careful about caching those msgs within the conv. This load function
 * should be used when in a search context, for example when expanding a conv that is the result
 * of a search.
 *
 * @param params			[hash]			hash of params:
 *        query				[string]*		query used to retrieve this conv
 *        sortBy			[constant]*		sort constraint
 *        offset			[int]*			position of first msg to return
 *        limit				[int]*			how many msgs to return
 *        getHtml			[boolean]*		if true, return HTML part for inlined msg
 *        getFirstMsg		[boolean]*		if true, retrieve the content of the first matching msg
 *											in the conv as a side effect of the search
 * @param callback			[AjxCallback]*	callback to run with results
 */
ZmConv.prototype.load =
function(params, callback) {

	params = params || {};
	var query = params.query;
	if (!query) {
		var ctlr = appCtxt.getCurrentController();
		query = (ctlr && ctlr.getSearchString) ? ctlr.getSearchString() :
				appCtxt.get(ZmSetting.INITIAL_SEARCH);
	}
	var sortBy = params.sortBy || ZmSearch.DATE_DESC;
	var offset = params.offset || 0;
	var limit = params.limit || appCtxt.get(ZmSetting.PAGE_SIZE);
	var getHtml = params.getHtml || appCtxt.get(ZmSetting.VIEW_AS_HTML);
	this._getFirstMsg = params.getFirstMsg;

	var doSearch = true;
	if (this._loaded && this.msgs && this.msgs.size()) {
		var size = this.msgs.size();
		if (this._sortBy != sortBy || this._query != query || (size != this.numMsgs && !offset)) {
			this.msgs.clear();
		} else if (!this.msgs.hasMore() || offset + limit <= size) {
			doSearch = false;	// we can use cached msg list
		}
	}
	if (!doSearch) {
		if (callback) {
			callback.run(this._createResult());
		}
	} else {
		this._sortBy = sortBy;
		this._query = query;
		this._offset = offset;
		this._limit = limit;
		var fetchId = (params.getFirstMsg && this.msgIds) ? this.msgIds[0] : null;
		var types = AjxVector.fromArray([ZmItem.MSG]);
		var searchParams = {query:query, types:types, sortBy:sortBy, offset:offset, limit:limit, getHtml:getHtml};
		var search = this.search = new ZmSearch(searchParams);
		var respCallback = new AjxCallback(this, this._handleResponseLoad, [params, callback]);
		search.getConv(this.id, respCallback, fetchId);
	}
};

ZmConv.prototype._handleResponseLoad =
function(params, callback, result) {
	var results = result.getResponse();
	if (!params.offset) {
		this.msgs = results.getResults(ZmItem.MSG);
		this.msgs.convId = this.id;
		this.msgs.addChangeListener(this._listChangeListener);
		this.msgs.setHasMore(results.getAttribute("more"));
		this._loaded = true;
	}
	if (callback) {
		callback.run(result);
	}
};

/**
 * This method supports ZmZimletBase::getMsgsForConv. It loads all of this conv's
 * messages, including their content. Note that it is not search-based, and uses
 * GetConvRequest rather than SearchConvRequest.
 * 
 * @param params		[hash]				hash of params:
 *        fetchAll		[boolean]*			if true, fetch content of all msgs
 * @param callback		[AjxCallback]		callback
 * @param batchCmd		[ZmBatchCommand]*	batch cmd that contains this request
 */
ZmConv.prototype.loadMsgs =
function(params, callback, batchCmd) {
	var soapDoc = AjxSoapDoc.create("GetConvRequest", "urn:zimbraMail");
	var convNode = soapDoc.set("c");
	convNode.setAttribute("id", this.id);
	params = params || {};
	if (params.fetchAll) {
		convNode.setAttribute("fetch", "all");
	}

	// Request additional headers
	for (var hdr in ZmMailMsg.getAdditionalHeaders()) {
		var headerNode = soapDoc.set('header', null, convNode);
		headerNode.setAttribute('n', hdr);
	}

	// never pass "undefined" as arg to a callback!
	var respCallback = new AjxCallback(this, this._handleResponseLoadMsgs, callback || null);
	if (batchCmd) {
		batchCmd.addRequestParams(soapDoc, respCallback);
	} else {
		appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true, callback:respCallback});
	}
};

ZmConv.prototype._handleResponseLoadMsgs =
function(callback, result) {
	var resp = result.getResponse().GetConvResponse.c[0];
	this.msgIds = [];
	
	// create new msg list
	this.msgs = new ZmMailList(ZmItem.MSG, this.search);
	this.msgs.convId = this.id;
	this.msgs.addChangeListener(this._listChangeListener);
	this.msgs.setHasMore(false);
	this._loaded = true;

	var len = resp.m.length;
	for (var i = 0; i < len; i++) {
		var msgNode = resp.m[i];
		this.msgIds.push(msgNode.id);
		msgNode.su = resp.su;
		// construct ZmMailMsg's so they get cached
		var msg = ZmMailMsg.createFromDom(msgNode, this.list);
		this.msgs.add(msg);
	}

	if (callback) { callback.run(result); }
};

ZmConv.prototype.removeMsg =
function(msg) {
	if (this.msgs) {
		this.msgs.remove(msg, true);
		this.numMsgs = this.msgs.size();
	}
	if (this.msgIds && this.msgIds.length) {
		var tmpMsgIds = [];
		for (var i = 0, count = this.msgIds.length; i < count; i++) {
			if (this.msgIds[i] != msg.id) {
				tmpMsgIds.push(this.msgIds[i]);
			}
		}
		this.msgIds = tmpMsgIds;
	}
};

ZmConv.prototype.clear =
function() {
	if (this.msgs) {
		this.msgs.clear();
		this.msgs.removeChangeListener(this._listChangeListener);
		this.msgs = null;
	}
	this.msgIds = [];
	
	ZmMailItem.prototype.clear.call(this);
};

/**
* Handles a modification notification.
* TODO: Bundle MODIFY notifs (should bubble up to parent handlers as well)
*
* @param obj		item with the changed attributes/content
*/
ZmConv.prototype.notifyModify =
function(obj) {
	var fields = {};
	// a conv's ID can change if it's a virtual conv becoming real
	if (obj._newId != null) {
		this._oldId = this.id;
		this.id = obj._newId;
		appCtxt.cacheSet(this.id, this);	// make sure we can get it from cache via new ID
		if (this.msgs) {
			this.msgs.convId = this.id;
			var a = this.msgs.getArray();
			for (var i = 0; i < a.length; i++) {
				a[i].cid = this.id;
			}
		}
		if (this.list && this._oldId) {
			this.list._idHash[this.id] = this.list._idHash[this._oldId];
		}
		fields[ZmItem.F_ID] = true;
		this._notify(ZmEvent.E_MODIFY, {fields : fields});
	}
	if (obj.n != null) {
		this.numMsgs = obj.n;
		fields[ZmItem.F_SIZE] = true;
		this._notify(ZmEvent.E_MODIFY, {fields : fields});
	}

	ZmMailItem.prototype.notifyModify.apply(this, arguments);
};

ZmConv.prototype.getPrintHtml =
function(preferHtml, callback) {
	ZmConvListView.getPrintHtml(this, preferHtml, callback);
};

ZmConv.prototype._checkFlags = 
function(flags) {
	var msgs = this.msgs.getArray();
	var convOn = {};
	var msgsOn = {};
	for (var i = 0; i < flags.length; i++) {
		var flag = flags[i];
		if (!(flag == ZmItem.FLAG_FLAGGED || flag == ZmItem.FLAG_UNREAD 
			|| flag == ZmItem.FLAG_ATTACH)) continue;
		convOn[flag] = this[ZmItem.FLAG_PROP[flag]];
		msgsOn[flag] = false;
		for (var j = 0; j < msgs.length; j++) {
			var msg = msgs[j];
			if (msg[ZmItem.FLAG_PROP[flag]]) {
				msgsOn[flag] = true;
				break;
			}
		}
	}			
	var doNotify = false;
	var flags = new Array();
	for (var flag in convOn) {
		if (convOn[flag] != msgsOn[flag]) {
			this[ZmItem.FLAG_PROP[flag]] = msgsOn[flag];
			flags.push(flag);
			doNotify = true;
		}
	}

	if (doNotify)
		this._notify(ZmEvent.E_FLAGS, {flags: flags});
};

/**
* Figure out if any tags have been added or removed by comparing what we have now with what
* our messages have.
*/
ZmConv.prototype._checkTags = 
function() {
	var newTags = {};
	var allTags = {};
	
	for (var tagId in this.tagHash) {
		allTags[tagId] = true;
	}

	var msgs = this.msgs.getArray();
	if (!(msgs && msgs.length)) { return; }
	for (var i = 0; i < msgs.length; i++) {
		for (var tagId in msgs[i].tagHash) {
			newTags[tagId] = true;
			allTags[tagId] = true;
		}
	}

	var notify = false;
	for (var tagId in allTags) {
		if (!this.tagHash[tagId] && newTags[tagId]) {
			if (this.tagLocal(tagId, true)) {
				notify = true;
			}
		} else if (this.tagHash[tagId] && !newTags[tagId]) {
			if (this.tagLocal(tagId, false)) {
				notify = true;
			}
		}
	}

	if (notify) {
		this._notify(ZmEvent.E_TAGS);
	}
};

ZmConv.prototype.checkMoved = 
function(folderId) {
	if (!folderId) { return; }
	var msgs = this.msgs.getArray();
	var doNotify = true;
	for (var i = 0; i < msgs.length; i++) {
		if (msgs[i].folderId == folderId) {
			doNotify = false;
			break;
		}
	}
	if (doNotify) {
		this._notify(ZmEvent.E_MOVE);
	}
	
	return doNotify;
};

ZmConv.prototype.moveLocal =
function(folderId) {
	if (this.folders) {
		delete this.folders;
	}
	this.folders = {};
	this.folders[folderId] = true;
};

/**
 * Returns the first matching msg of this conv, loading the conv msg list if necessary. If the
 * msg itself hasn't been loaded we also load the conv. The conv load is a SearchConvRequest
 * which fetches the content of the first matching msg and returns it via a callback. If no
 * callback is provided, the conv will not be loaded - if it already has a msg list, the msg
 * will come from there; otherwise, a skeletal msg with an ID is returned. Note that a conv
 * always has at least one msg.
 * 
 * @param params	[hash]	hash of params:
 *        query				[string]*		query used to retrieve this conv
 *        sortBy			[constant]*		sort constraint
 *        offset			[int]*			position of first msg to return
 *        limit				[int]*			how many msgs to return
 * @param callback			[AjxCallback]*	callback to run with results
 */
ZmConv.prototype.getFirstHotMsg =
function(params, callback) {
	
	var msg;
	params = params || {};

	if (this.msgs && this.msgs.size()) {
		msg = this.msgs.getFirstHit(params.offset, params.limit);
	}

	if (callback) {
		if (msg && msg._loaded) {
			callback.run(msg);
		} else {
			var respCallback = new AjxCallback(this, this._handleResponseGetFirstHotMsg, [params, callback]);
			params.getFirstMsg = true;
			this.load(params, respCallback);
		}
	} else {
		return msg ? msg : new ZmMailMsg(this.msgIds[0]);
	}		
};

ZmConv.prototype._handleResponseGetFirstHotMsg =
function(params, callback) {
	var msg = this.msgs.getFirstHit(params.offset, params.limit);
	// should have a loaded msg
	if (msg && msg._loaded) {
		if (callback) {
			callback.run(msg);
		}
	} else {
		// desperate measures - get msg content from server
		msg = msg || new ZmMailMsg(this.msgIds[0]);
		var respCallback = new AjxCallback(this, this._handleResponseLoadMsg, [msg, callback]);
		var getHtml = params.getHtml || appCtxt.get(ZmSetting.VIEW_AS_HTML);
		msg.load(getHtml, false, respCallback);
	}
};

ZmConv.prototype._handleResponseLoadMsg =
function(msg, callback) {
	if (msg && callback) {
		callback.run(msg);
	}
};

ZmConv.prototype._loadFromDom =
function(convNode) {
	this.numMsgs = convNode.n;
	this.date = convNode.d;
	this._parseFlags(convNode.f);
	this._parseTags(convNode.t);	
	if (convNode.e) {
		for (var i = 0; i < convNode.e.length; i++) {
			this._parseParticipantNode(convNode.e[i]);
		}
	}
	this.participantsElided = convNode.elided;
	this.subject = convNode.su;
	this.fragment = convNode.fr;

	// should always be an <m> element; note that the list of msg IDs in a
	// search result is partial - only msgs that matched are included
	if (convNode.m) {
		this.msgIds = [];
		for (var i = 0, count = convNode.m.length; i < count; i++) {
			this.msgIds.push(convNode.m[i].id);
		}
	}
	if (convNode._folders) {
		var folders = convNode._folders.split(",");
		for (var i = 0; i < folders.length; i++) {
			this.folders[folders[i]] = true;
		}
	}
};

ZmConv.prototype._loadFromMsg =
function(msg) {
	this.date = msg.date;
	this.isFlagged = msg.isFlagged;
	this.isUnread = msg.isUnread;
	for (var i = 0; i < msg.tags.length; i++) {
		this.tags.push(msg.tags[i]);
	}
	var a = msg.participants ? msg.participants.getArray() : null;
	this.participants = new AjxVector();
	if (a && a.length) {
		for (var i = 0; i < a.length; i++) {
			var p = a[i];
			if ((msg.isDraft && p.type == AjxEmailAddress.TO) ||
				(!msg.isDraft && p.type == AjxEmailAddress.FROM)) {
				this.participants.add(p);
			}
		}
	}
	this.subject = msg.subject;
	this.fragment = msg.fragment;
	this.msgIds = [msg.id];
};

ZmConv.prototype._msgListChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_MSG) {	return; }
	if (ev.event == ZmEvent.E_TAGS || ev.event == ZmEvent.E_REMOVE_ALL) {
		this._checkTags();
	} else if (ev.event == ZmEvent.E_FLAGS) {
		this._checkFlags(ev.getDetail("flags"));
	} else 	if (ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.E_MOVE) {
		// a msg was moved or deleted, see if this conv's row should remain
		this.checkMoved(this.getFolderId());
	}
};

/**
 * Returns a result created from this conv's data that looks as if it were the result
 * of an actual SOAP request.
 */
ZmConv.prototype._createResult =
function() {
	var searchResult = new ZmSearchResult(this.search);
	searchResult.type = ZmItem.MSG;
	searchResult._results[ZmItem.MSG] = this.msgs;
	return new ZmCsfeResult(searchResult);
};
