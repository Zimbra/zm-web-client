/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * Creates a conversation.
 * @constructor
 * @class
 * This class represents a conversation, which is a collection of mail messages
 * which have the same subject.
 *
 * @param {int}	id		a unique ID
 * @param {ZmMailList}		list		a list that contains this conversation
 * 
 * @extends		ZmMailItem
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
 * 
 * @param	{Object}	node		the node
 * @param	{Hash}		args		a hash of arguments
 * @return	{ZmConv}		the conversation
 */
ZmConv.createFromDom =
function(node, args) {
	var conv = new ZmConv(node.id, args.list);
	conv._loadFromDom(node);
	return conv;
};

/**
 * Creates a conv from msg data.
 * 
 * @param	{ZmMailMsg}		msg		the message
 * @param	{Hash}		args		a hash of arguments
 * @return	{ZmConv}		the conversation
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
 * @param {Hash}	params			a hash of parameters
 * @param {String}      params.query				the query used to retrieve this conv
 * @param {constant}      params.sortBy			the sort constraint
 * @param {int}      params.offset			the position of first msg to return
 * @param {int}      params.limit				the number of msgs to return
 * @param {Boolean}      params.getHtml			if <code>true</code>, return HTML part for inlined msg
 * @param {Boolean}      params.getFirstMsg		if <code>true</code>, retrieve the content of the first matching msg in the conv as a side effect of the search
 * @param  {Boolean}     params.markRead			if <code>true</code>, mark that msg read
 * @param {AjxCallback} callback			the callback to run with results
 */
ZmConv.prototype.load =
function(params, callback) {

	params = params || {};
	var ctlr = appCtxt.getCurrentController();
	var query = params.query;
	if (!query) {
		query = (ctlr && ctlr.getSearchString) 
			? ctlr.getSearchString()
			: appCtxt.get(ZmSetting.INITIAL_SEARCH);
	}
	var queryHint = params.queryHint;
	if (!queryHint) {
		queryHint = (ctlr && ctlr.getSearchStringHint)
			? ctlr.getSearchStringHint() : "";
	}
	var sortBy = params.sortBy || ZmSearch.DATE_DESC;
	var offset = params.offset || 0;
	var limit = params.limit || appCtxt.get(ZmSetting.CONVERSATION_PAGE_SIZE);

	var doSearch = true;
	if (this._loaded && this.msgs && this.msgs.size() && !params.forceLoad) {
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

		var searchParams = {
			query: query,
			queryHint: queryHint,
			types: (AjxVector.fromArray([ZmItem.MSG])),
			sortBy: sortBy,
			offset: offset,
			limit: limit,
			getHtml: (params.getHtml || this.isDraft || appCtxt.get(ZmSetting.VIEW_AS_HTML)),
			accountName: (appCtxt.multiAccounts && this.getAccount().name)
		};
		var search = this.search = new ZmSearch(searchParams);

		var convParams = {
			cid: this.id,
			callback: (new AjxCallback(this, this._handleResponseLoad, [params, callback])), 
			fetchId: ((params.getFirstMsg && this.msgIds && this.msgIds.length) ? this.msgIds[0] : null),
			markRead: params.markRead,
			noTruncate: params.noTruncate
		};
		search.getConv(convParams);
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
 * @param {Hash}	params		a hash of parameters
 * @param {Boolean}      params.fetchAll		if <code>true</code>, fetch content of all msgs
 * @param {AjxCallback}	callback		the callback
 * @param {ZmBatchCommand}	batchCmd		the batch cmd that contains this request
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
	for (var hdr in ZmMailMsg.requestHeaders) {
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

/**
 * Adds the message at the given index.
 *
 * @param	{ZmMailMsg}		msg		the message to add
 * @param	{int}			index	where to add it
 */
ZmConv.prototype.addMsg =
function(msg, index) {

	if (!this.msgs) {
		this.msgs = new ZmMailList(ZmItem.MSG, this.search);
		this.msgs.convId = this.id;
		this.msgs.addChangeListener(this._listChangeListener);
		this.msgs.setHasMore(false);
	}
	this.msgs.add(msg, index);
	this.msgIds = [];
	var a = this.msgs.getArray();
	for (var i = 0, len = a.length; i < len; i++) {
		this.msgIds.push(a[i].id);
	}
};

/**
 * Removes the message.
 * 
 * @param	{ZmMailMsg}		msg		the message to remove
 */
ZmConv.prototype.removeMsg =
function(msg) {
	if (this.msgs) {
		this.msgs.remove(msg, true);
	}
	if (this.msgIds && this.msgIds.length) {
		AjxUtil.arrayRemove(this.msgIds, msg.id);
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
 * Checks if the conversation is read only.
 * 
 * @return	{Boolean}	<code>true</code> if the conversation is read only
 */
ZmConv.prototype.isReadOnly =
function() {
	var folderId = this.getFolderId();
	var folder = appCtxt.getById(folderId);
	// NOTE: if no folder, we're in a search so we dont know whether this conv
	// is read-only or not. That means we should load the whole conv and iterate
	// thru its messages to see if they all belong w/in read-only folders.
	return (folder ? folder.isReadOnly() : false);
};

/**
 * Checks if this conversation has a message that matches the given search.
 * If the search is not present or not matchable, the provided default value is
 * returned.
 *
 * @param {ZmSearch}	search			the search to match against
 * @param {Object}	defaultValue		the value to return if search is not matchable
 * @return	{Boolean|Object}	<code>true</code> if this conversation has the message
 */
ZmConv.prototype.hasMatchingMsg =
function(search, defaultValue) {
	if (search && search.matches && this.msgs) {
		var msgs = this.msgs.getArray();
		for (var i = 0; i < msgs.length; i++) {
			var msg = msgs[i];
			if (search.matches(msg) && !msg.ignoreJunkTrash()) {
				return true;
			}
		}
	} else {
		return defaultValue;
	}
	return false;
};

ZmConv.prototype.ignoreJunkTrash =
function() {
	return Boolean((this.numMsgs == 1) && this.folders &&
				   ((this.folders[ZmFolder.ID_SPAM] && !appCtxt.get(ZmSetting.SEARCH_INCLUDES_SPAM)) ||
			 	    (this.folders[ZmFolder.ID_TRASH] && !appCtxt.get(ZmSetting.SEARCH_INCLUDES_TRASH))));
};

ZmConv.prototype.getAccount =
function() {
	if (!this.account) {
		var folderId;
		for (var i in this.folders) {
			folderId = i;
			break;
		}
		
		if (!folderId &&
			appCtxt.multiAccounts &&
			appCtxt.getCurrentApp() &&
			appCtxt.getCurrentSearch() &&
			!appCtxt.getCurrentSearch().isMultiAccount())
		{
			folderId = this.getFolderId();
		}

		if (folderId) {
			this.account = appCtxt.getById(folderId).getAccount();
		} else {
			var parsed = ZmOrganizer.parseId(this.id);
			this.account = parsed && parsed.account;
		}
	}
	return this.account;
};

/**
* Handles a modification notification.
* TODO: Bundle MODIFY notifs (should bubble up to parent handlers as well)
*
* @param obj		item with the changed attributes/content
* 
* @private
*/
ZmConv.prototype.notifyModify =
function(obj, batchMode) {
	var fields = {};
	// a conv's ID can change if it's a virtual conv becoming real; 'this' will be
	// the old conv; if we can, we switch to using the new conv, which will be more
	// up to date; the new conv will be available if it was received via search results
	if (obj._newId != null) {
		var conv = appCtxt.getById(obj._newId) || this;
		conv._oldId = this.id;
		conv.id = obj._newId;
		appCtxt.cacheSet(conv._oldId);
		appCtxt.cacheSet(conv.id, conv);
		conv.msgs = conv.msgs || this.msgs;
		if (conv.msgs) {
			conv.msgs.convId = conv.id;
			var a = conv.msgs.getArray();
			for (var i = 0; i < a.length; i++) {
				a[i].cid = conv.id;
			}
		}
		conv.folders = AjxUtil.hashCopy(this.folders);
		if (conv.list && conv._oldId && conv.list._idHash[conv._oldId]) {
			delete conv.list._idHash[conv._oldId];
			conv.list._idHash[conv.id] = conv;
		}
		fields[ZmItem.F_ID] = true;
		conv._notify(ZmEvent.E_MODIFY, {fields : fields});
	}
	if (obj.n != null) {
		this.numMsgs = obj.n;
		fields[ZmItem.F_SIZE] = true;
		this._notify(ZmEvent.E_MODIFY, {fields : fields});
	}

	return ZmMailItem.prototype.notifyModify.apply(this, arguments);
};

/**
 * Checks if any of the msgs within this conversation has the given value for
 * the given flag. If the conv hasn't been loaded, looks at the conv-level flag.
 *
 * @param {constant}	flag		the flag (see <code>ZmItem.FLAG_</code> constants)
 * @param {Boolean}	value		the test value
 * @return	{Boolean}	<code>true</code> if the flag exists
 */
ZmConv.prototype.hasFlag =
function(flag, value) {
	if (!this.msgs) {
		return (this[ZmItem.FLAG_PROP[flag]] == value);
	}
	var msgs = this.msgs.getArray();
	for (var j = 0; j < msgs.length; j++) {
		var msg = msgs[j];
		if (msg[ZmItem.FLAG_PROP[flag]] == value) {
			return true;
		}
	}
	return false;
};

ZmConv.prototype._checkFlags = 
function(flags) {
	var msgs = this.msgs.getArray();
	var convOn = {};
	var msgsOn = {};
	for (var i = 0; i < flags.length; i++) {
		var flag = flags[i];
		if (!(flag == ZmItem.FLAG_FLAGGED || flag == ZmItem.FLAG_UNREAD || flag == ZmItem.FLAG_ATTACH)) { continue; }
		convOn[flag] = this[ZmItem.FLAG_PROP[flag]];
		msgsOn[flag] = this.hasFlag(flag, true);
	}			
	var doNotify = false;
	var flags = [];
	for (var flag in convOn) {
		if (convOn[flag] != msgsOn[flag]) {
			this[ZmItem.FLAG_PROP[flag]] = msgsOn[flag];
			flags.push(flag);
			doNotify = true;
		}
	}

	if (doNotify) {
		this._notify(ZmEvent.E_FLAGS, {flags: flags});
	}
};

/**
 * Figure out if any tags have been added or removed by comparing what we have now with what
 * our messages have.
 * 
 * @private
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

ZmConv.prototype.moveLocal =
function(folderId) {
	if (this.folders) {
		delete this.folders;
	}
	this.folders = {};
	this.folders[folderId] = true;
};

ZmConv.prototype.getMsgList =
function(offset, ascending) {
	var a = this.msgs.getArray().slice(offset || 0);
	if (ascending) {
		a.reverse();
	}
	return a;
};

ZmConv.prototype.getFolderId =
function() {
	return this.folderId || (this.list && this.list.search && this.list.search.folderId);
};

/**
 * Gets the first matching msg of this conv, loading the conv msg list if necessary. If the
 * msg itself hasn't been loaded we also load the conv. The conv load is a SearchConvRequest
 * which fetches the content of the first matching msg and returns it via a callback. If no
 * callback is provided, the conv will not be loaded - if it already has a msg list, the msg
 * will come from there; otherwise, a skeletal msg with an ID is returned. Note that a conv
 * always has at least one msg.
 * 
 * @param {Hash}	params	a hash of parameters
 * @param {String}      params.query				the query used to retrieve this conv
 * @param {constant}      params.sortBy			the sort constraint
 * @param {int}	      params.offset			the position of first msg to return
 * @param {int}	params.limit				the number of msgs to return
 * @param {AjxCallback}	callback			the callback to run with results
 * 
 * @return	{ZmMailMsg}	the message
 */
ZmConv.prototype.getFirstHotMsg =
function(params, callback) {
	
	var msg;
	params = params || {};

	if (this.msgs && this.msgs.size()) {
		msg = this.msgs.getFirstHit(params.offset, params.limit);
	}

	if (callback) {
		if (msg && msg._loaded && !params.forceLoad) {
			callback.run(msg);
		} else {
			var respCallback = new AjxCallback(this, this._handleResponseGetFirstHotMsg, [params, callback]);
			params.getFirstMsg = true;
			this.load(params, respCallback);
		}
	} else {
		// do our best to return a "realized" message by checking cache
		if (!msg && this.msgIds && this.msgIds.length) {
			var id = this.msgIds[0];
			msg = appCtxt.getById(id) || new ZmMailMsg(id);
		}
		return msg;
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
		if (!msg && this.msgIds && this.msgIds.length) {
			msg = new ZmMailMsg(this.msgIds[0]);
		}
		var respCallback = new AjxCallback(this, this._handleResponseLoadMsg, [msg, callback]);
		msg.load({getHtml:params.getHtml, callback:respCallback});
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
	this.sf = convNode.sf;

	// note that the list of msg IDs in a search result is partial - only msgs that matched are included
	if (convNode.m) {
		this.msgIds = [];
		for (var i = 0, count = convNode.m.length; i < count; i++) {
			this.msgIds.push(convNode.m[i].id);
		}
		if (count == 1) {
			var msgNode = convNode.m[0];
			if (msgNode.l) {
				this.folderId = msgNode.l;
				this.folders[msgNode.l] = true;
			}
			if (msgNode.s) {
				this.size = msgNode.s;
			}
		}
	}

	// Grab the metadata, keyed off the section name
	if (convNode.meta) {
		this.meta = {};
		for (var i = 0; i < convNode.meta.length; i++) {
			var section = convNode.meta[i].section;
			this.meta[section] = {};
			this.meta[section]._attrs = {};
			for (a in convNode.meta[i]._attrs) {
				this.meta[section]._attrs[a] = convNode.meta[i]._attrs[a];
			}
		}
	}
};

ZmConv.prototype._loadFromMsg =
function(msg) {
	this.date = msg.date;
	this.isFlagged = msg.isFlagged;
	this.isUnread = msg.isUnread;
	for (var i = 0; i < msg.tags.length; i++) {
		this.tagLocal(msg.tags[i], true);
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
	this.sf = msg.sf;
	this.msgIds = [msg.id];
};

ZmConv.prototype._msgListChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_MSG) {	return; }
	if (ev.event == ZmEvent.E_TAGS || ev.event == ZmEvent.E_REMOVE_ALL) {
		this._checkTags();
	} else if (ev.event == ZmEvent.E_FLAGS) {
		this._checkFlags(ev.getDetail("flags"));
	} else if (ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.E_MOVE) {
		// a msg was moved or deleted, see if this conv's row should remain
		if (this.list && this.list.search && !this.hasMatchingMsg(this.list.search, true)) {
			this._notify(ZmEvent.E_MOVE);
		}
	}
};

/**
 * Returns a result created from this conv's data that looks as if it were the result
 * of an actual SOAP request.
 * 
 * @private
 */
ZmConv.prototype._createResult =
function() {
	var searchResult = new ZmSearchResult(this.search);
	searchResult.type = ZmItem.MSG;
	searchResult._results[ZmItem.MSG] = this.msgs;
	return new ZmCsfeResult(searchResult);
};

// Updates the conversation fragment based on the newest message in the conversation, optionally ignoring an array of messages
ZmConv.prototype.updateFragment =
function(ignore) {
	var best;
	for (var j = this.msgs.size()-1; j >= 0; j--) {
		var candidate = this.msgs.get(j);
		if (ignore && AjxUtil.indexOf(ignore,candidate)!=-1) continue;
		if (candidate.fragment && (!best || candidate.date > best.date))
			best = candidate;
	}
	if (best)
		this.fragment = best.fragment;
};

/**
 * Gets a vector of addresses of the given type.
 *
 * @param {constant}	type			an email address type
 *
 * @return	{AjxVector}	a vector of email addresses
 */
ZmConv.prototype.getAddresses =
function(type) {

	var p = this.participants ? this.participants.getArray() : [];
	var list = [];
	for (var i = 0, len = p.length; i < len; i++) {
		var addr = p[i];
		if (addr.type == type) {
			list.push(addr);
		}
	}
	return AjxVector.fromArray(list);
};
