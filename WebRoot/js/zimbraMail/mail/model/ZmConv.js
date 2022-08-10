/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
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
	this.msgFolder = {};
};

ZmConv.prototype = new ZmMailItem;
ZmConv.prototype.constructor = ZmConv;

ZmConv.prototype.isZmConv = true;
ZmConv.prototype.toString = function() { return "ZmConv"; };

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
 * @param {Hash}		params						a hash of parameters:
 * @param {String}		params.query				the query used to retrieve this conv
 * @param {constant}	params.sortBy				the sort constraint
 * @param {int}			params.offset				the position of first msg to return
 * @param {int}			params.limit				the number of msgs to return
 * @param {Boolean}		params.getHtml				if <code>true</code>, return HTML part for inlined msg
 * @param {String}		params.fetch				which msg bodies to fetch (see soap.txt under SearchConvRequest)
 * @param {Boolean}		params.markRead				if <code>true</code>, mark that msg read
 * @param {boolean}		params.needExp				if not <code>false</code>, have server check if addresses are DLs
 * @param {AjxCallback}	callback					the callback to run with results
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
	if (this._loaded && this._expanded && this.msgs && this.msgs.size() && !params.forceLoad) {
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

		var search = this.search = new ZmSearch(searchParams),
			fetch = (params.fetch === true) ? ZmSetting.CONV_FETCH_UNREAD_OR_FIRST : params.fetch || ZmSetting.CONV_FETCH_NONE;

		var needExp = fetch !== ZmSetting.CONV_FETCH_NONE;
		var	convParams = {
			cid:		this.id,
			callback:	(new AjxCallback(this, this._handleResponseLoad, [params, callback, needExp])),
			fetch:      fetch,
			markRead:	params.markRead,
			noTruncate:	params.noTruncate,
			needExp:	needExp
		};
		search.getConv(convParams);
	}
};

ZmConv.prototype._handleResponseLoad =
function(params, callback, expanded, result) {
	var results = result.getResponse();
	if (!params.offset) {
		this.msgs = results.getResults(ZmItem.MSG);
		this.msgs.convId = this.id;
		this.msgs.addChangeListener(this._listChangeListener);
		this.msgs.setHasMore(results.getAttribute("more"));
		this._loaded = true;
		this._expanded = expanded;
	}
	if (callback) {
		callback.run(result);
	}
};

/**
 * This method supports ZmZimletBase::getMsgsForConv. It loads *all* of this conv's
 * messages, including their content. Note that it is not search-based, and uses
 * GetConvRequest rather than SearchConvRequest.
 * 
 * @param {Hash}			params				a hash of parameters
 * @param {Boolean}			params.fetchAll		if <code>true</code>, fetch content of all msgs
 * @param {AjxCallback}		callback			the callback
 * @param {ZmBatchCommand}	batchCmd			the batch cmd that contains this request
 */
ZmConv.prototype.loadMsgs =
function(params, callback, batchCmd) {

	params = params || {};
	var jsonObj = {GetConvRequest:{_jsns:"urn:zimbraMail"}};
	var request = jsonObj.GetConvRequest;
	var c = request.c = {
		id:		this.id,
		needExp:	true,
		html:	(params.getHtml || this.isDraft || appCtxt.get(ZmSetting.VIEW_AS_HTML))
	};
	if (params.fetchAll) {
		c.fetch = "all";
	}
	ZmMailMsg.addRequestHeaders(c);

	// never pass "undefined" as arg to a callback!
	var respCallback = this._handleResponseLoadMsgs.bind(this, callback || null);
	if (batchCmd) {
		batchCmd.addRequestParams(jsonObj, respCallback);
	} else {
		appCtxt.getAppController().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:respCallback});
	}
};

ZmConv.prototype._handleResponseLoadMsgs =
function(callback, result) {

	var resp = result.getResponse().GetConvResponse.c[0];
	this.msgIds = [];

	if (!this.msgs) {
		// create new msg list
		this.msgs = new ZmMailList(ZmItem.MSG, this.search);
		this.msgs.convId = this.id;
		this.msgs.addChangeListener(this._listChangeListener);
	}
	else {
		//don't recreate if it already exists, so we don't lose listeners.. (see ZmConvView2.prototype.set)
		this.msgs.removeAllItems();
	}
	if (this.search && !this.msgs.search) {
		this.msgs.search = this.search;
	}
	this.msgs.setHasMore(false);
	this._loaded = true;

	var len = resp.m.length;
	//going from last to first since GetConvRequest returns the msgs in order of creation (older first) but we keep things newer first.
	for (var i = len - 1; i >= 0; i--) {
		var msgNode = resp.m[i];
		this.msgIds.push(msgNode.id);
		this.msgFolder[msgNode.id] = msgNode.l;
		msgNode.su = resp.su;
		// construct ZmMailMsg's so they get cached
		var msg = ZmMailMsg.createFromDom(msgNode, {list: this.msgs});
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
	if (this.search && !this.msgs.search) {
		this.msgs.search = this.search;
	}
	this.msgs.add(msg, index);
	this.msgIds = [];
	var a = this.msgs.getArray();
	for (var i = 0, len = a.length; i < len; i++) {
		this.msgIds.push(a[i].id);
	}
	this.msgFolder[msg.id] = msg.folderId;
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
	delete this.msgFolder[msg.id];
};

ZmConv.prototype.canAddTag =
function(tagName) {
	if (!this.msgs) {
		return ZmItem.prototype.canAddTag.call(this, tagName);
	}
	var msgs = this.msgs.getArray();
	for (var i = 0; i < msgs.length; i++) {
		var msg = msgs[i];
		if (msg.canAddTag(tagName)) {
			return true;
		}
	}
	return false;
};

ZmConv.prototype.mute =
function() {
    this.isMute = true;
    if(this.msgs) {
        var msgs = this.msgs.getArray();
		for (var i = 0; i < msgs.length; i++) {
			var msg = msgs[i];
			msg.mute();
		}
    }
};

ZmConv.prototype.unmute =
function() {
    this.isMute = false;
    if(this.msgs) {
        var msgs = this.msgs.getArray();
		for (var i = 0; i < msgs.length; i++) {
			var msg = msgs[i];
			msg.unmute();
		}
    }
};

/**
 * Gets the mute/unmute icon.
 *
 * @return	{String}	the icon
 */
ZmConv.prototype.getMuteIcon =
function() {
	return this.isMute ? "Mute" : "Unmute";
};


ZmConv.prototype.clear =
function() {
	if (this.isInUse) {
		return;
	}
	if (this.msgs) {
		this.msgs.clear();
		this.msgs.removeChangeListener(this._listChangeListener);
		this.msgs = null;
	}
	this.msgIds = [];
	this.folders = {};
	this.msgFolder = {};
	
	ZmMailItem.prototype.clear.call(this);
};

/**
 * Checks if the conversation is read only. Returns false if it cannot be determined.
 * 
 * @return	{Boolean}	<code>true</code> if the conversation is read only
 */
ZmConv.prototype.isReadOnly =
function() {
	
	if (this._loaded && this.msgs && this.msgs.size()) {
		// conv has been loaded, check each msg
		var msgs = this.msgs.getArray();
		for (var i = 0; i < msgs.length; i++) {
			if (msgs[i].isReadOnly()) {
				return true;
			}
		}
	}
	else {
		// conv has not been loaded, see if it's constrained to a folder
		var folderId = this.getFolderId();
		var folder = folderId && appCtxt.getById(folderId);
		return !!(folder && folder.isReadOnly());
	}
	return false;
};

/**
 * Checks if this conversation has a message that matches the given search.
 * If we're not able to tell whether a msg matches, we return the given default value.
 *
 * @param {ZmSearch}	search			the search to match against
 * @param {Object}	    defaultValue	the value to return if search is not matchable or conv not loaded
 * @return	{Boolean}	<code>true</code> if this conversation has a matching message
 */
ZmConv.prototype.hasMatchingMsg =
function(search, defaultValue) {

	var msgs = this.msgs && this.msgs.getArray(),
		hasUnknown = false;

	if (msgs && msgs.length > 0) {
		for (var i = 0; i < msgs.length; i++) {
			var msg = msgs[i],
				msgMatches = search.matches(msg);

			if (msgMatches && !msg.ignoreJunkTrash() && this.folders[msg.folderId]) {
				return true;
			}
			else if (msgMatches === null) {
				hasUnknown = true;
			}
		}
	}

	return hasUnknown ? !!defaultValue : false;
};

ZmConv.prototype.containsMsg =
function(msg) {
	return this.msgIds && AjxUtil.arrayContains(this.msgIds, msg.id);
};

ZmConv.prototype.ignoreJunkTrash =
function() {
	return Boolean((this.numMsgs == 1) && this.folders &&
				   ((this.folders[ZmFolder.ID_SPAM] && !appCtxt.get(ZmSetting.SEARCH_INCLUDES_SPAM)) ||
			 	    (this.folders[ZmFolder.ID_TRASH] && !appCtxt.get(ZmSetting.SEARCH_INCLUDES_TRASH))));
};

ZmConv.prototype.getAccount =
function() {
    // pull out the account from the fully-qualified ID
	if (!this.account) {
        var folderId = this.getFolderId();
        var folder = folderId && appCtxt.getById(folderId);
        // make sure current folder is not remote folder
        // in that case getting account from parseID will fail if
        // the shared account is also configured in ZD
        if (!(folder && folder._isRemote)) {
            this.account = ZmOrganizer.parseId(this.id).account;
        }
    }

    // fallback on the active account if account not found from parsed ID (most
    // likely means this is a conv inside a shared folder of the active acct)
    if (!this.account) {
        this.account = appCtxt.getActiveAccount();
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

/**
 * Checks to see if a change in the value of a msg flag changes the value of the conv's flag. That will happen
 * for the first msg to get an off flag turned on, or when the last msg to have an on flag turns it off.
 */
ZmConv.prototype._checkFlags = 
function(flags) {

	var convOn = {};
	var msgsOn = {};
	for (var i = 0; i < flags.length; i++) {
		var flag = flags[i];
		if (!(flag == ZmItem.FLAG_FLAGGED || flag == ZmItem.FLAG_UNREAD || flag == ZmItem.FLAG_MUTE || flag == ZmItem.FLAG_ATTACH || flag == ZmItem.FLAG_PRIORITY)) { continue; }
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

	if (this.msgs) {
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
function(offset, ascending, omit) {
	// this.msgs will not be set if the conv has not yet been loaded
	var list = this.msgs && this.msgs.getArray();
	var a = list ? (list.slice(offset || 0)) : [];
	if (omit) {
		var a1 = [];
		for (var i = 0; i < a.length; i++) {
			var msg = a[i];
			if (!(msg && msg.folderId && omit[msg.folderId])) {
				a1.push(msg);
			}
		}
		a = a1;
	}
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
 * Gets the first relevant msg of this conv, loading the conv msg list if necessary. If the
 * msg itself hasn't been loaded we also load the conv. The conv load is a SearchConvRequest
 * which fetches the content of the first msg and returns it via a callback. If no
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
		msg = this.msgs.getFirstHit(params.offset, params.limit, params.foldersToOmit);
	}

	if (callback) {
		if (msg && msg._loaded && !params.forceLoad) {
			callback.run(msg);
		}
		else {
			var respCallback = this._handleResponseGetFirstHotMsg.bind(this, params, callback);
			params.fetch = ZmSetting.CONV_FETCH_FIRST;
			this.load(params, respCallback);
		}
	}
	else {
		// do our best to return a "realized" message by checking cache
		if (!msg && this.msgIds && this.msgIds.length) {
			var id = this.msgIds[0];
			msg = appCtxt.getById(id);
			if (!msg) {
				if (!this.msgs) {
					this.msgs = new ZmMailList(ZmItem.MSG);
					this.msgs.convId = this.id;
					this.msgs.addChangeListener(this._listChangeListener);
				}
				msg = new ZmMailMsg(id, this.msgs);
			}
		}
		return msg;
	}
};

ZmConv.prototype._handleResponseGetFirstHotMsg = function(params, callback) {

	var msg = this.msgs.getFirstHit(params.offset, params.limit, params.foldersToOmit);
	// should have a loaded msg
	if (msg && msg._loaded) {
		if (callback) {
			callback.run(msg);
		}
	}
	else {
		// desperate measures - get msg content from server
		if (!msg && this.msgIds && this.msgIds.length) {
			msg = new ZmMailMsg(this.msgIds[0]);
		}
		var respCallback = this._handleResponseLoadMsg.bind(this, msg, callback);
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
	this._parseFlagsOfMsgs(convNode.m);   // parse flags based on msgs
	this._parseTagNames(convNode.tn);
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
		this.msgFolder = {};
		for (var i = 0, count = convNode.m.length; i < count; i++) {
			var msgNode = convNode.m[i];
			this.msgIds.push(msgNode.id);
			this.msgFolder[msgNode.id] = msgNode.l;
			this.folders[msgNode.l] = true;
		}
		if (count == 1) {
			var msgNode = convNode.m[0];

			// bug 49067 - SearchConvResponse does not return the folder ID w/in
			// the msgNode as fully qualified so reset if this 1-msg conv was
			// returned by a simple folder search
			// TODO: if 85358 is fixed, we can remove this section
			var searchFolderId = this.list && this.list.search && this.list.search.folderId;
			if (searchFolderId) {
				this.folderId = searchFolderId;
				this.folders[searchFolderId] = true;
			} else if (msgNode.l) {
				this.folderId = msgNode.l;
				this.folders[msgNode.l] = true;
			}
			else {
				AjxDebug.println(AjxDebug.NOTIFY, "no folder added for conv");
			}
			if (msgNode.s) {
				this.size = msgNode.s;
			}

			if (msgNode.autoSendTime) {
				var timestamp = parseInt(msgNode.autoSendTime);
				if (timestamp) {
					this.setAutoSendTime(new Date(timestamp));
				}
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
	this.msgFolder[msg.id] = msg.folderId;
	//add a flag to redraw this conversation when additional information is available
	this.redrawConvRow = true;
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
            this.moveLocal(ev.item && ev.item.folderId);
			this._notify(ev.event);
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
	var size = this.msgs && this.msgs.size();
	if (size) {
		for (var j = size - 1; j >= 0; j--) {
			var candidate = this.msgs.get(j);
			if (ignore && AjxUtil.indexOf(ignore, candidate) != -1) { continue; }
			if (candidate.fragment && (!best || candidate.date > best.date)) {
				best = candidate;
			}
		}
	}
	if (best) {
		this.fragment = best.fragment;
	}
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

/**
 * Gets the status tool tip.
 * 
 * @return	{String}	the tool tip
 */
ZmConv.prototype.getStatusTooltip =
function() {
	if (this.numMsgs === 1 && this.msgIds && this.msgIds.length > 0) {
		var msg = appCtxt.getById(this.msgIds[0]);
		if (msg) {
			return msg.getStatusTooltip();
		}
	}

	var status = [];

	// keep in sync with ZmMailMsg.prototype.getStatusTooltip
	if (this.isScheduled) {
		status.push(ZmMsg.scheduled);
	}
	if (this.isUnread) {
		status.push(ZmMsg.unread);
	}
	if (this.isReplied) {
		status.push(ZmMsg.replied);
	}
	if (this.isForwarded) {
		status.push(ZmMsg.forwarded);
	}
	if (this.isDraft) {
		status.push(ZmMsg.draft);
	} else if (this.isSent) {
		//sentAt is for some reason "sent", which is what we need.
		status.push(ZmMsg.sentAt);
	}

	return status.join(", ");
};

/**
 * Returns the number of unread messages in this conversation.
 */
ZmConv.prototype.getNumUnreadMsgs =
function() {
	var numUnread = 0;
	var msgs = this.getMsgList();
	if (msgs) {
		for (var i = 0, len = msgs.length; i < len; i++) {
			if (msgs[i].isUnread) {
				numUnread++;
			}
		}
		return numUnread;
	}
	return null;
};

/**
 * Parse flags based on which flags are in the messages we will display (which normally
 * excludes messages in Trash or Junk).
 *
 * @param   [array]     msgs        msg nodes from search result
 *
 * @private
 */
ZmConv.prototype._parseFlagsOfMsgs = function(msgs) {

	// use search from list since it's not yet set in controller
	var ignore = ZmMailApp.getFoldersToOmit(this.list && this.list.search),
		msg, len = msgs ? msgs.length : 0, i,
		flags = {};

	for (i = 0; i < len; i++) {
		msg = msgs[i];
		if (!ignore[msg.l]) {
			var msgFlags = msg.f && msg.f.split(''),
				len1 = msgFlags ? msgFlags.length : 0, j;

			for (j = 0; j < len1; j++) {
				flags[msgFlags[j]] = true;
			}
		}
	}

	this.flags = AjxUtil.keys(flags).join('');
	ZmItem.prototype._parseFlags.call(this, this.flags);
};
