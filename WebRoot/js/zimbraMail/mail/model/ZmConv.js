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

/**
* Creates a conversation.
* @constructor
* @class
* This class represents a conversation, which is a collection of mail messages
* which have the same subject.
*
* @param appCtxt	[ZmAppCtxt]		the app context
* @param id			[int]			unique ID
* @param list		[ZmMailList]	list that contains this conversation
*/
function ZmConv(appCtxt, id, list) {

	ZmMailItem.call(this, appCtxt, ZmItem.CONV, id, list);
	
	// conversations are always sorted by date desc initially
	this._sortBy = ZmSearch.DATE_DESC;
	this._listChangeListener = new AjxListener(this, this._msgListChangeListener);
};

ZmConv.prototype = new ZmMailItem;
ZmConv.prototype.constructor = ZmConv;

ZmConv.prototype.toString = 
function() {
	return "ZmConv";
};

// Public methods

ZmConv.createFromDom =
function(node, args) {
	var conv = new ZmConv(args.appCtxt, node.id, args.list);
	conv._loadFromDom(node);
	return conv;
};

/**
 * Ensures that the requested range of msgs is loaded, getting them from the server if needed.
 * Because the list of msgs returned by the server contains info about which msgs matched the
 * search, we need to be careful about caching those msgs.
 *
 * @param query				[string]		query used to retrieve this conv
 * @param sortBy			[constant]*		sort constraint
 * @param offset			[int]*			position of first msg to return
 * @param limit				[int]*			how many msgs to return
 * @param callback			[AjxCallback[*	callback to run with results
 * @param getFirstMsg		[boolean]*		if true, retrieve the content of the first msg
 *											in the conv as a side effect of the search
 */
ZmConv.prototype.load =
function(params) {

	var sortBy = params.sortBy ? params.sortBy : ZmSearch.DATE_DESC;
	var offset = params.offset ? params.offset : 0;
	var limit = params.limit ? params.limit : this.list._appCtxt.get(ZmSetting.PAGE_SIZE);
	
	if (this.msgs) {
		if (this._sortBy != sortBy) {
			// user is sorting; clear the list
			this.msgs.clear();
			this._sortBy = sortBy;
		} else {
			var size = this.msgs.size();
			if (size != this.numMsgs && !offset) {
				// msgs list is out of sync
				this.msgs.clear();
			} else {
				// XXX: if we dont want to cache, remove this "else" (dont forget to call clear on msgs)
				// i.e. new msgs that are in the hit list wont be marked hot this way!
				// dont bother searching for more msgs if all have been loaded	
				if (!this.msgs.hasMore() || offset + limit <= size)
					if (callback) callback.run(new ZmCsfeResult(this.msgs));
			}
		}
	}
	
	var types = AjxVector.fromArray([ZmItem.MSG]);
	var searchParams = {query:params.query, types:types, sortBy:sortBy, offset:offset, limit:limit};
	var search = new ZmSearch(this.list._appCtxt, searchParams);
	var respCallback = new AjxCallback(this, this._handleResponseLoad, params);
	search.getConv(this.id, respCallback, params.getFirstMsg);
};

ZmConv.prototype._handleResponseLoad =
function(params, result) {
	var results = result.getResponse();
	if (!params.offset) {
		this.msgs = results.getResults(ZmItem.MSG);
		this.msgs.convId = this.id;
		this.msgs.addChangeListener(this._listChangeListener);
		this.msgs.setHasMore(results.getAttribute("more"));
		this._loaded = true;
		
		// nuke the cached msg if exist since its useless now
		if (this.tempMsg) {
			this.tempMsg.clear();
			this.tempMsg = null;
		}
		
		if (params.callback) {
			result.set(this.msgs);
		}
	}
	if (params.callback) {
		params.callback.run(result);
	}
};

ZmConv.prototype.loadMsgIds =
function(callback) {
	var soapDoc = AjxSoapDoc.create("GetConvRequest", "urn:zimbraMail");
	var msgNode = soapDoc.set("c");
	msgNode.setAttribute("id", conv.id);
	var respCallback = new AjxCallback(this, this._handleResponseLoadMsgIds, callback);
	this._appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode: true, callback: respCallback});
};

ZmConv.prototype._handleResponseLoadMsgIds =
function(callback, result) {
	var response = result.getResponse();
	var resp = response.GetConvResponse.c[0];
	var msgIds = new Array();
	var len = resp.m.length;
	for (var i = 0; i < len; i++) {
		msgIds.push(resp.m[i].id);
	}
	this.msgIds = msgIds;
	
	if (callback) callback.run(result);
};

ZmConv.prototype.clear =
function() {
	if (this.msgs) {
		this.msgs.clear();
		this.msgs.removeChangeListener(this._listChangeListener);
		this.msgs = null;
	}
	
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
	var fields = new Object();
	// a conv's ID can change if it's a virtual conv becoming real
	if (obj._newId != null) {
		this._oldId = this.id;
		this.id = obj._newId;
		this._appCtxt.cacheSet(this.id, this);	// make sure we can get it from cache via new ID
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
		fields[ZmItem.F_COUNT] = true;
		this._notify(ZmEvent.E_MODIFY, {fields : fields});
	}

	ZmMailItem.prototype.notifyModify.call(this, obj);
};

ZmConv.prototype.getPrintHtml =
function(preferHtml, callback) {
	ZmConvListView.getPrintHtml(this, preferHtml, callback, this._appCtxt);
};

ZmConv.prototype._checkFlags = 
function(flags) {
	var msgs = this.msgs.getArray();
	var convOn = new Object();
	var msgsOn = new Object();
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
	newTags = new Object();
	allTags = new Object();
	
	for (var tagId in this.tagHash)
		allTags[tagId] = true;

	var msgs = this.msgs.getArray();
	for (var i = 0; i < msgs.length; i++) {
		for (var tagId in msgs[i].tagHash) {
			newTags[tagId] = true;
			allTags[tagId] = true;
		}
	}

	var notify = false;
	for (var tagId in allTags) {
		if (!this.tagHash[tagId] && newTags[tagId]) {
			if (this.tagLocal(tagId, true))
				notify = true;
		} else if (this.tagHash[tagId] && !newTags[tagId]) {
			if (this.tagLocal(tagId, false))
				notify = true;
		}
	}

	if (notify)
		this._notify(ZmEvent.E_TAGS);
};

ZmConv.prototype.checkMoved = 
function(folderId) {
	var msgs = this.msgs.getArray();
	var bNotify = true;
	for (var i = 0; i < msgs.length; i++) {
		if (msgs[i].folderId == folderId) {
			bNotify = false;
			break;
		}
	}
	if (bNotify)
		this._notify(ZmEvent.E_MOVE);
	
	return bNotify;
};

ZmConv.prototype.moveLocal =
function(folderId) {
	if (this.folders)
		delete this.folders;
	this.folders = new Object();
	this.folders[folderId] = true;
};

/* First see if there are any hot messages which will always be the case in a 
 * search scenario; however if this is not a search (i.e. we are playing 
 * primary mailbox), then pick the newest message in the conversation
 */
ZmConv.prototype.getHotMsg = 
function(offset, limit) {
	
	var numMsgs = this.msgs.size();

	// normalize offset/limit if necessary
	if (offset >= numMsgs || offset < 0)
		return;
	
	var end = offset + limit > numMsgs ? numMsgs : offset+limit;
	var list = this.msgs.getArray();
	
	var msg;
	for (var i = offset; i < end; i++) {
		if (list[i].isInHitList()) {
			if (msg == null || msg.date < list[i].date)
				msg = list[i];
		}
	}

	// no hot messages, find the most recent message
	if (msg == null) {
		for (var i = offset; i < end; i++) {
			if (msg == null || msg.date < list[i].date)
				msg = list[i];
		}
	}
	
	return msg;
};

ZmConv.prototype.getFirstMsg = 
function() {
	// has this conv been loaded yet?
	var msg;
	if (this.msgs) {
		// then always return the first msg in the list
		msg = this.msgs.getVector().get(0);
	} else if (this.tempMsg) {
		msg = this.tempMsg;
	} else {
		// otherwise, create a temp msg w/ the msg op Id
		msg = new ZmMailMsg(this._appCtxt, this.msgOpId);
		// bug fix #7016 - only cache if not draft otherwise reopening cached 
		// draft will not have new changes
		if (!this.isDraft)
			this.tempMsg = msg;
	}
	
	msg.list = this.msgs || new ZmMailList(ZmItem.MSG, this._appCtxt);
	
	return msg;
};


ZmConv.prototype.getSubject = 
function (){
	return this.subject;
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

	// this is the ID of the msg that will be used if user tries to 
	// reply/forward w/o having loaded the conv.
	if (convNode.m)
		this.msgOpId = convNode.m[0].id;
};

ZmConv.prototype._loadMsgs = 
function(convNode) {
	// for all messages in this conversation,
	var childNodes = convNode.childNodes;
	var len = childNodes.length;
	for (var i = 0; i < len; i++) {
		if (childNodes[i].nodeName == "m")
			this.msgs.addFromDom(childNodes[i]);
	}	
};

ZmConv.prototype._msgListChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_MSG)
		return;
	if (ev.event == ZmEvent.E_TAGS || ev.event == ZmEvent.E_REMOVE_ALL) {
		this._checkTags();
	} else if (ev.event == ZmEvent.E_FLAGS) {
		this._checkFlags(ev.getDetail("flags"));
	}
};
