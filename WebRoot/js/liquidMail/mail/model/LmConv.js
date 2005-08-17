function LmConv(appCtxt, list) {

	LmMailItem.call(this, appCtxt, LmItem.CONV, list);
	// conversations are always sorted by date desc initially
	this._sortBy = LmSearch.DATE_DESC; 
	this._listChangeListener = new LsListener(this, this._msgListChangeListener);
}

LmConv.prototype = new LmMailItem;
LmConv.prototype.constructor = LmConv;

LmConv.prototype.toString = 
function() {
	return "LmConv";
}

// Public methods

LmConv.createFromDom =
function(node, args) {
	var conv = new LmConv(args.appCtxt, args.list);
	conv._participantHash = args.addressHash ? args.addressHash : new Object();
	conv._loadFromDom(node);
	return conv;
}

LmConv.prototype.load =
function(searchString, sortBy, offset, limit, callback) {

	var sortBy = sortBy || LmSearch.DATE_DESC;
	var offset = offset || 0;
	var limit = limit || this.list._appCtxt.get(LmSetting.PAGE_SIZE);
	
	if (this.msgs) {
		if (this._sortBy != sortBy) {
			// user is sorting; clear the list
			this.msgs.clear();
			this._sortBy = sortBy;
		} else {
			var size = this.msgs.size();
			if (size != this.numMsgs && callback == null) {
				// msgs list is out of sync
				this.msgs.clear();
			} else {
				// XXX: if we dont want to cache, remove this "else" (dont forget to call clear on msgs)
				// i.e. new msgs that are in the hit list wont be marked hot this way!
				// dont bother searching for more msgs if all have been loaded	
				if (!this.msgs.hasMore() || offset + limit <= size)
					return this.msgs;
			}
		}
	}
	
	var types = LsVector.fromArray([LmItem.MSG]);
	var search = new LmSearch(this.list._appCtxt, searchString, types, sortBy, offset, limit);
	var results = search.forConv(this.id);
	
	if (callback) {
		callback.run(results);	// user is paging...
	} else {
		this.msgs = results.getResults(LmItem.MSG);
		this.msgs.convId = this.id;
		this.msgs.addChangeListener(this._listChangeListener);
		this.msgs.setHasMore(results.getAttribute("more"));
		
		// nuke the cached msg if exist since its useless now
		if (this.tempMsg) {
			this.tempMsg.clear();
			this.tempMsg = null;
		}
		
		return this.msgs; 		// so that controller has a list
	}
}

LmConv.prototype.clear =
function() {
	if (this.msgs) {
		this.msgs.clear();
		this.msgs = null;
	}
	
	LmMailItem.prototype.clear.call(this);
}

/**
* Handles a modification notification.
* TODO: Bundle MODIFY notifs (should bubble up to parent handlers as well)
*
* @param obj		item with the changed attributes/content
*/
LmConv.prototype.notifyModify =
function(obj) {
	var fields = new Object();
	// a conv's ID can change if it's a virtual conv becoming real
	if (obj._newId != null) {
		this._oldId = this.id;
		this.id = obj._newId;
		this.msgs.convId = this.id;
		var a = this.msgs.getArray();
		for (var i = 0; i < a.length; i++)
			a[i].cid = this.id;
		fields[LmItem.F_ID] = true;
		this._notify(LmEvent.E_MODIFY, {fields : fields});
	}
	if (obj.n != null) {
		this.numMsgs = obj.n;
		fields[LmItem.F_COUNT] = true;
		this._notify(LmEvent.E_MODIFY, {fields : fields});
	}

	LmMailItem.prototype.notifyModify.call(this, obj);
}

LmConv.prototype._checkFlags = 
function(flags) {
	var msgs = this.msgs.getArray();
	var convOn = new Object();
	var msgsOn = new Object();
	for (var i = 0; i < flags.length; i++) {
		var flag = flags[i];
		if (!(flag == LmItem.FLAG_FLAGGED || flag == LmItem.FLAG_UNREAD 
			|| flag == LmItem.FLAG_ATTACH)) continue;
		convOn[flag] = this[LmItem.FLAG_PROP[flag]];
		msgsOn[flag] = false;
		for (var j = 0; j < msgs.length; j++) {
			var msg = msgs[j];
			if (msg[LmItem.FLAG_PROP[flag]]) {
				msgsOn[flag] = true;
				break;
			}
		}
	}			
	var doNotify = false;
	var flags = new Array();
	for (var flag in convOn) {
		if (convOn[flag] != msgsOn[flag]) {
			this[LmItem.FLAG_PROP[flag]] = msgsOn[flag];
			flags.push(flag);
			doNotify = true;
		}
	}

	if (doNotify)
		this._notify(LmEvent.E_FLAGS, {flags: flags});
}

/**
* Figure out if any tags have been added or removed by comparing what we have now with what
* our messages have.
*/
LmConv.prototype._checkTags = 
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
		this._notify(LmEvent.E_TAGS);
}

LmConv.prototype.checkMoved = 
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
		this._notify(LmEvent.E_MOVE);
	
	return bNotify;
}

LmConv.prototype.moveLocal =
function(folderId) {
	if (this.folders)
		delete this.folders;
	this.folders = new Object();
	this.folders[folderId] = true;
}

/* First see if there are any hot messages which will always be the case in a 
 * search scenario; however if this is not a search (i.e. we are playing 
 * primary mailbox), then pick the newest message in the conversation
 */
LmConv.prototype.getHotMsg = 
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
}

LmConv.prototype.getSubject = 
function (){
	return this.subject;
};

LmConv.prototype._loadFromDom =
function(convNode) {
	this.id = convNode.id;
	this.numMsgs = convNode.n;
	this.date = convNode.d;
	this._parseFlags(convNode.f);
	this._parseTags(convNode.t);	
	if (convNode.e) {
		for (var i = 0; i < convNode.e.length; i++)
			this._parseParticipantNode(convNode.e[i]);
	}
	this.subject = convNode.su;
	this.fragment = convNode.fr;

	// this is the ID of the msg that will be used if user tries to 
	// reply/forward w/o having loaded the conv.
	if (convNode.m)
		this.msgOpId = convNode.m[0].id;
}

LmConv.prototype._loadMsgs = 
function(convNode) {
	// for all messages in this conversation,
	var childNodes = convNode.childNodes;
	for (var i = 0; i < childNodes.length; i++) {
		if (childNodes[i].nodeName == "m")
			this.msgs.addFromDom(childNodes[i], {addressHash: this._participantHash});
	}	
}

LmConv.prototype._msgListChangeListener =
function(ev) {
	if (ev.type != LmEvent.S_MSG)
		return;
	if (ev.event == LmEvent.E_TAGS || ev.event == LmEvent.E_REMOVE_ALL) {
		this._checkTags();
	} else if (ev.event == LmEvent.E_FLAGS) {
		this._checkFlags(ev.getDetail("flags"));
	}
}
