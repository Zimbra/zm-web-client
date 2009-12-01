/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates an empty list of items of the given type.
 * @constructor
 * @class
 * This class represents a list of items (ZmItem objects). Any SOAP method that can be
 * applied to a list of item IDs is represented here, so that we can perform an action
 * on multiple items with just one CSFE call. For the sake of convenience, a hash 
 * matching item IDs to items is maintained. Items are assumed to have an 'id'
 * property.
 * <p>
 * The calls are made asynchronously. We are assuming that any action taken will result
 * in a notification, so the action methods generally do not have an async callback 
 * chain and thus are leaf nodes. An exception is moving conversations. We don't
 * know enough from the ensuing notifications (which only indicate that messages have
 * moved), we need to update the UI based on the response.</p>
 *
 * @author Conrad Damon
 * 
 * @param type		[constant]		item type
 * @param search	[ZmSearch]*		search that generated this list
 */
ZmList = function(type, search) {

	if (arguments.length == 0) return;
	ZmModel.call(this, type);

	this.type = type;
	this.search = search;
	
	this._vector = new AjxVector();
	this._hasMore = false;
	this._idHash = new Object();

	var tagList = appCtxt.getTagTree();
	if (tagList) {
		this._tagChangeListener = new AjxListener(this, this._tagTreeChangeListener);
		tagList.addChangeListener(this._tagChangeListener);
	}
};

ZmList.prototype = new ZmModel;
ZmList.prototype.constructor = ZmList;

// for item creation
ZmList.ITEM_CLASS = {};

// node names for item types
ZmList.NODE = {};

// item types based on node name (reverse map of above)
ZmList.ITEM_TYPE = {};

// how many items to act on at a time via a server request
ZmList.CHUNK_SIZE = 100;

ZmList.prototype.toString = 
function() {
	return "ZmList";
};

ZmList.prototype.get =
function(index) {
	return this._vector.get(index);
};

/**
 * Adds an item to the list.
 *
 * @param item	the item to add
 * @param index	the index at which to add the item (defaults to end of list)
 */
ZmList.prototype.add = 
function(item, index) {
	this._vector.add(item, index);
	if (item.id) {
		this._idHash[item.id] = item;
	}
};

/**
 * Removes an item from the list.
 *
 * @param item	the item to remove
 */
ZmList.prototype.remove = 
function(item) {
	this._vector.remove(item);
	if (item.id) {
		delete this._idHash[item.id];
	}
};

/**
 * Creates an item from the given arguments. A subclass may override
 * sortIndex() to add it to a particular point in the list. By default, it
 * will be added at the end.
 *
 * The item will invoke a SOAP call, which generates a create notification from the
 * server. That will be handled by notifyCreate(), which will call _notify()
 * so that views can be updated.
 *
 * @param args	arbitrary hash of args to pass along
 */
ZmList.prototype.create =
function(args) {
	var item;
	var obj = eval(ZmList.ITEM_CLASS[this.type]);
	if (obj) {
		item = new obj(this);
		item.create(args);
	}

	return item;
};

/**
 * Returns the number of items in the list.
 */
ZmList.prototype.size = 
function() {
	return this._vector.size();
};

/**
 * Returns the index of the given item in the list.
 */
ZmList.prototype.indexOf = 
function(item) {
	return this._vector.indexOf(item);
};

/**
 * Returns true if there are more items for this search.
 */
ZmList.prototype.hasMore = 
function() {
	return this._hasMore;
};

/**
 * Sets the "more" flag for this list.
 *
 * @param bHasMore	whether there are more items
 */
ZmList.prototype.setHasMore = 
function(bHasMore) {
	this._hasMore = bHasMore;
};

/**
 * Returns the list as an array.
 */
ZmList.prototype.getArray =
function() {
	return this._vector.getArray();
};

/**
 * Returns the list as a AjxVector.
 */
ZmList.prototype.getVector =
function() {
	return this._vector;
};

/**
 * Returns the item with the given ID.
 *
 * @param id		an item ID
 */
ZmList.prototype.getById =
function(id) {
	return this._idHash[id];
};

/**
 * Clears the list, including its ID hash.
 */
ZmList.prototype.clear =
function() {
	// First, let each item run its clear() method
	var a = this.getArray();
	for (var i = 0; i < a.length; i++) {
		a[i].clear();
	}

	this._evtMgr.removeAll(ZmEvent.L_MODIFY);
	this._vector.removeAll();
	for (var id in this._idHash) {
		this._idHash[id] = null;
	}
	this._idHash = new Object();
};

/**
 * Populates the list with elements created from the response to a SOAP command. Each
 * node in the response should represent an item of the list's type. Items are added
 * in the order they are received; no sorting is done.
 *
 * @param respNode	an XML node whose children are item nodes
 */
ZmList.prototype.set = 
function(respNode) {
	this.clear();
	var nodes = respNode.childNodes;
	var args = {list:this};
	for (var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		if (node.nodeName == ZmList.NODE[this.type]) {
			/// TODO: take this out, let view decide whether to show items in Trash
			if (parseInt(node.getAttribute("l")) == ZmFolder.ID_TRASH && (this.type != ZmItem.CONTACT))	{ continue; }
			var obj = eval(ZmList.ITEM_CLASS[this.type]);
			if (obj) {
				this.add(obj.createFromDom(node, args));
			}
		}
	}
};

/**
 * Adds an item to the list from the given XML node.
 *
 * @param node	an XML node
 * @param args	an optional list of arguments to pass to the item's creation function
 */
ZmList.prototype.addFromDom = 
function(node, args) {
	if (!args) {
		args = {};
	}
	args.list = this;
	var obj = eval(ZmList.ITEM_CLASS[this.type]);
	if (obj) {
		this.add(obj.createFromDom(node, args));
	}
};

/**
 * Returns a vector containing a subset of items of this list.
 *
 * @param offset		[int]		starting index
 * @param limit		[int]		size of sublist
 */
ZmList.prototype.getSubList = 
function(offset, limit) {
	var subVector = null;
	var end = (offset + limit > this.size()) ? this.size() : offset + limit;
	var subList = this.getArray();
	if (offset < end) {
		subVector = AjxVector.fromArray(subList.slice(offset, end));
	}
	return subVector;
};

ZmList.prototype.cache = 
function(offset, newList) {
	this.getVector().merge(offset, newList);
	// reparent each item within new list, and add it to ID hash
	var list = newList.getArray();
	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		item.list = this;
		if (item.id) {
			this._idHash[item.id] = item;
		}
	}
};

// Actions

/**
 * Sets/unsets a flag for each of a list of items.
 *
 * @param params		[hash]				hash of params:
 *        items			[array]				a list of items to set/unset a flag for
 *        op			[string]			the name of the flag operation ("flag" or "read")
 *        value			[boolean|string]*	whether to set the flag, or for "update" the flags string
 *        callback		[AjxCallback]*		callback to run after each sub-request
 *        finalCallback	[AjxCallback]*		callback to run after all items have been processed
 *        count			[int]*				starting count for number of items processed
 */
ZmList.prototype.flagItems =
function(params) {

	params = Dwt.getParams(arguments, ["items", "op", "value", "callback"]);

	if (this.type == ZmItem.MIXED && !this._mixedType) {
		return this._mixedAction("flagItems", params);
	}

	params.items = AjxUtil.toArray(params.items);

	if (params.action == "update") {
		params.attrs = {f:params.value};
	} else {
		params.action = params.value ? params.op : "!" + params.op;
	}

	this._itemAction(params);
};

/**
 * Tags or untags a list of items. A sanity check is done first, so that items
 * aren't tagged redundantly, and so we don't try to remove a nonexistent tag.
 *
 * @param params		[hash]			hash of params:
 *        items			[array]			a list of items to tag/untag
 *        tagId			[string]		the tag to add/remove from each item
 *        doTag			[boolean]		true if adding the tag, false if removing it
 *        callback		[AjxCallback]*	callback to run after each sub-request
 *        finalCallback	[AjxCallback]*	callback to run after all items have been processed
 *        count			[int]*			starting count for number of items processed
 */
ZmList.prototype.tagItems =
function(params) {

	params = Dwt.getParams(arguments, ["items", "tagId", "doTag"]);

	// for multi-account mbox, normalize tagId
	if (appCtxt.multiAccounts && !appCtxt.getActiveAccount().isMain) {
		params.tagId = ZmOrganizer.normalizeId(params.tagId);
	}

	if (this.type == ZmItem.MIXED && !this._mixedType) {
		return this._mixedAction("tagItems", params);
	}

	// only tag items that don't have the tag, and untag ones that do
	// always tag a conv, because we don't know if all items in the conv have the tag yet
	var items = AjxUtil.toArray(params.items);
	var items1 = [], doTag = params.doTag, tagId = params.tagId;
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		if ((doTag && (!item.hasTag(tagId) || item.type == ZmItem.CONV)) ||	(!doTag && item.hasTag(tagId))) {
			items1.push(item);
		}
	}
	params.items = items1;
	params.attrs = {tag:tagId};
	params.action = doTag ? "tag" : "!tag";

	this._itemAction(params);
};

/**
 * Removes all tags from a list of items.
 *
 * @param params		[hash]			hash of params:
 *        items			[array]			a list of items to tag/untag
 *        callback		[AjxCallback]*	callback to run after each sub-request
 *        finalCallback	[AjxCallback]*	callback to run after all items have been processed
 *        count			[int]*			starting count for number of items processed
 */

ZmList.prototype.removeAllTags = 
function(params) {

	params = (params && params.items) ? params : {items:params};

	if (this.type == ZmItem.MIXED && !this._mixedType) {
		this._mixedAction("removeAllTags", params);
		return;
	}

	var items = AjxUtil.toArray(params.items);
	var items1 = [];
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		if (item.tags && item.tags.length) {
			items1.push(item);
		}
	}

	params.items = items1;
	params.action = "update";
	params.attrs = {t: ""};

	this._itemAction(params);
};

/**
 * Moves a list of items to the given folder.
 * <p>
 * Search results are treated as though they're in a temporary folder, so that they behave as
 * they would if they were in any other folder such as Inbox. When items that are part of search
 * results are moved, they will disappear from the view, even though they may still satisfy the
 * search.
 * </p>
 *
 * @param params		[hash]			hash of params:
 *        items			[array]			a list of items to move
 *        folder		[ZmFolder]		destination folder
 *        attrs			[hash]			additional attrs for SOAP command
 *        callback		[AjxCallback]*	callback to run after each sub-request
 *        finalCallback	[AjxCallback]*	callback to run after all items have been processed
 *        count			[int]*			starting count for number of items processed
 */
ZmList.prototype.moveItems =
function(params) {

	params = Dwt.getParams(arguments, ["items", "folder", "attrs", "callback"]);

	if (this.type == ZmItem.MIXED && !this._mixedType) {
		return this._mixedAction("moveItems", params);
	}

	params.items = AjxUtil.toArray(params.items);
	params.attrs = params.attrs || {};
	params.attrs.l = params.folder.id;
	params.action = "move";

	// bug: 42865 - make a copy of params
	var proxyParams = {};
	for (var key in params) {
		proxyParams[key] = params[key];
	}

	if (this.type == ZmItem.MIXED) {
		params.callback = new AjxCallback(this, this._handleResponseMoveItems, proxyParams);
	}

	this._itemAction(params);
};

ZmList.prototype._handleResponseMoveItems =
function(params, result) {

	var movedItems = result.getResponse();
	if (movedItems && movedItems.length) {
		this.moveLocal(movedItems, params.folder.id);
		for (var i = 0; i < movedItems.length; i++) {
			movedItems[i].moveLocal(params.folder.id);
		}
		ZmModel.notifyEach(movedItems, ZmEvent.E_MOVE);
	}

	if (params.callback) {
		params.callback.run(result);
	}
};

/**
 * Copies a list of items to the given folder.
 *
 * @param params		[hash]			hash of params:
 *        items			[array]			a list of items to move
 *        folder		[ZmFolder]		destination folder
 *        attrs			[hash]			additional attrs for SOAP command
 *        finalCallback	[AjxCallback]*	callback to run after all items have been processed
 *        count			[int]*			starting count for number of items processed
 */
ZmList.prototype.copyItems =
function(params) {

	params = Dwt.getParams(arguments, ["items", "folder", "attrs"]);

	params.items = AjxUtil.toArray(params.items);
	params.attrs = params.attrs || {};
	params.attrs.l = params.folder.id;
	params.action = "copy";
	params.callback = new AjxCallback(this, this._handleResponseCopyItems, params);

	this._itemAction(params);
};

ZmList.prototype._handleResponseCopyItems =
function(params, result) {
	var resp = result.getResponse();
	if (resp.length > 0) {
		var msg = AjxMessageFormat.format(ZmMsg.itemCopied, resp.length);
		appCtxt.getAppController().setStatusMsg(msg);
	}
};

/**
 * Deletes one or more items from the list. Normally, deleting an item just
 * moves it to the Trash (soft delete). However, if it's already in the Trash,
 * it will be removed from the data store (hard delete).
 *
 * @param params		[hash]			hash of params:
 *        items			[Array]			list of items to delete
 *        hardDelete	[boolean]		whether to force physical removal of items
 *        attrs			[Object]		additional attrs for SOAP command
 *        childWin		[window]*		the child window this action is happening in
 *        finalCallback	[AjxCallback]*	callback to run after all items have been processed
 *        count			[int]*			starting count for number of items processed
 */
ZmList.prototype.deleteItems =
function(params) {

	params = Dwt.getParams(arguments, ["items", "hardDelete", "attrs", "childWin"]);

	if (this.type == ZmItem.MIXED && !this._mixedType) {
		return this._mixedAction("deleteItems", params);
	}

	var items = params.items = AjxUtil.toArray(params.items);

	// figure out which items should be moved to Trash, and which should actually be deleted
	var toMove = [];
	var toDelete = [];
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		var folderId = item.getFolderId();
		var folder = appCtxt.getById(folderId);
		if (params.hardDelete || (folder && folder.isHardDelete())) {
			toDelete.push(item);
		} else {
			toMove.push(item);
		}
	}

	params.callback = params.childWin && new AjxCallback(this._handleDeleteNewWindowResponse, params.childWin);

	// soft delete - items moved to Trash
	if (toMove.length) {
		if (appCtxt.multiAccounts) {
			// separate out the items based on which account they belong to
			var accounts = {};
			for (var i = 0; i < toMove.length; i++) {
				var item = toMove[i];
				var acctId = item.account.id;
				if (!accounts[acctId]) {
					accounts[acctId] = [];
				}
				accounts[acctId].push(item);
			}
			if (!params.callback) {
				params.callback = new AjxCallback(this, this._deleteAccountItems, [accounts, params]);
			}
			this._deleteAccountItems(accounts, params);
		}
		else {
			params.items = toMove;
			params.folder = appCtxt.getById(ZmFolder.ID_TRASH);
			this.moveItems(params);
		}
	}

	// hard delete - items actually deleted from data store
	if (toDelete.length) {
		params.items = toDelete;
		params.action = "delete";
		this._itemAction(params);
	}
};

ZmList.prototype._deleteAccountItems =
function(accounts, params) {
	var items;
	for (var i in accounts) {
		items = accounts[i];
		break;
	}

	if (items) {
		delete accounts[i];

		var account = appCtxt.accountList.getAccount(i);

		params.accountName = account.name;
		params.items = items;
		params.folder = appCtxt.getById(ZmFolder.ID_TRASH);

		this.moveItems(params);
	}
};

ZmList.prototype._handleDeleteNewWindowResponse =
function(childWin, result) {
	if (childWin) {
		childWin.close();
	}
};

/**
 * Applies the given list of modifications to the item.
 *
 * @param item			item to modify
 * @param mods			hash of new properties
 */
ZmList.prototype.modifyItem =
function(item, mods, callback) {
	item.modify(mods, callback);
};

// Notification handling

ZmList.prototype.notifyCreate =
function(node) {
	var obj = eval(ZmList.ITEM_CLASS[this.type]);
	if (obj) {
		var item = obj.createFromDom(node, {list:this});
		this.add(item, this._sortIndex(item));
		this.createLocal(item);
		this._notify(ZmEvent.E_CREATE, {items: [item]});
	}
};

// Local change handling

// These generic methods allow a derived class to perform the appropriate internal changes
ZmList.prototype.modifyLocal 		= function(items, mods) {};
ZmList.prototype.createLocal 		= function(item) {};

// These are not currently used; will need support in ZmItem if they are.
ZmList.prototype.flagLocal 			= function(items, flag, state) {};
ZmList.prototype.tagLocal 			= function(items, tag, state) {};
ZmList.prototype.removeAllTagsLocal = function(items) {};

// default action is to remove each deleted item from this list
ZmList.prototype.deleteLocal =
function(items) {
	for (var i = 0; i < items.length; i++) {
		this.remove(items[i]);
	}
};

// default action is to remove each moved item from this list
ZmList.prototype.moveLocal = 
function(items, folderId) {
	for (var i = 0; i < items.length; i++) {
		this.remove(items[i]);
	}
};

/**
 * Performs an action on items via a SOAP request.
 *
 * @param params			[Object]			list of parameters
 *        items				[Array]				list of items to act upon
 *        action			[string]			SOAP operation
 *        attrs				[Object]*			hash of additional attrs for SOAP request
 *        callback			[AjxCallback]*		async callback
 *        finalCallback		[AjxCallback]*		callback to run after all items have been processed
 *        errorCallback		[AjxCallback]*		async error callback
 *        accountName		[String]*			account to send request on behalf of
 *        count				[int]*				starting count for number of items processed
 * @param batchCmd			[ZmBatchCommand]*	If set, request data is added to batch request
 */
ZmList.prototype._itemAction =
function(params, batchCmd) {

	var result = this._getIds(params.items);
	var idHash = result.hash;
	var idList = result.list;
	if (!(idList && idList.length)) {
		if (params.callback) {
			params.callback.run(new ZmCsfeResult([]));
		}
		if (params.finalCallback) {
			params.finalCallback.run(params);
		}
		return;
	}

	var type;
	if (this.type == ZmItem.MIXED)			{ type = this._mixedType; }
	else if (params.items.length == 1)		{ type = params.items[0].type; }
	else 									{ type = this.type; }
	if (!type) { return; }

	// set accountName for multi-account to be the main "local" account since we
	// assume actioned ID's will always be fully qualified
	if (!params.accountName && appCtxt.multiAccounts) {
		params.accountName = appCtxt.accountList.mainAccount.name;
	}

	var soapCmd = ZmItem.SOAP_CMD[type] + "Request";
	var useJson = batchCmd ? batchCmd._useJson : true ;
	var request, action;
	if (useJson) {
		request = {};
		var urn = this._getActionNamespace();
		request[soapCmd] = {_jsns:urn};
		var action = request[soapCmd].action = {};
		action.op = params.action;
		for (var attr in params.attrs) {
			action[attr] = params.attrs[attr];
		}
	} else {
		request = AjxSoapDoc.create(soapCmd, this._getActionNamespace());
		action = request.set("action");
		action.setAttribute("op", params.action);
		for (var attr in params.attrs) {
			action.setAttribute(attr, params.attrs[attr]);
		}
	}

	var respCallback = params.callback && (new AjxCallback(this, this._handleResponseItemAction, [params.callback]));

	var params1 = {
		ids:			idList,
		idHash:			idHash,
		accountName:	params.accountName,
		request:		request,
		action:			action,
		type:			type,
		callback:		respCallback,
		finalCallback:	params.finalCallback,
		errorCallback:	params.errorCallback,
		batchCmd:		batchCmd,
		numItems:		params.count || 0
	};

	var dialog = ZmList.progressDialog;
	if (idList.length > ZmList.CHUNK_SIZE) {
		if (!dialog) {
			dialog = ZmList.progressDialog = appCtxt.getCancelMsgDialog();
			dialog.registerCallback(DwtDialog.CANCEL_BUTTON, new AjxCallback(this, this._cancelAction, [params1]));
		}
	} else if (dialog) {
		dialog.unregisterCallback(DwtDialog.CANCEL_BUTTON);
		ZmList.progressDialog = null;
	}

	this._doAction(params1);
};

ZmList.prototype._handleResponseItemAction =
function(callback, items, result) {
	if (callback) {
		result.set(items);
		callback.run(result);
	}
};

ZmList.prototype._doAction =
function(params) {

	var list = params.ids.splice(0, ZmList.CHUNK_SIZE);
	var idStr = list.join(",");
	var useJson = true;
	if (params.action.setAttribute) {
		params.action.setAttribute("id", idStr);
		useJson = false;
	} else {
		params.action.id = idStr;
	}

	var respCallback = new AjxCallback(this, this._handleResponseDoAction, [params]);

	if (params.batchCmd) {
		params.batchCmd.addRequestParams(params.request, respCallback, params.errorCallback);
	} else {
		var reqParams = {asyncMode:true, callback:respCallback, accountName:params.accountName};
		if (useJson) {
			reqParams.jsonObj = params.request;
		} else {
			reqParams.soapDoc = params.request;
		}
		DBG.println("sa", "* item action: " + list.length);
		params.reqId = appCtxt.getAppController().sendRequest(reqParams);
	}
};

ZmList.prototype._handleResponseDoAction =
function(params, result) {

	var dialog = ZmList.progressDialog;
	var response = result.getResponse();
	var resp = response[ZmItem.SOAP_CMD[params.type] + "Response"];
	if (resp && resp.action) {
		var ids = resp.action.id.split(",");
		if (ids) {
			var items = [];
			for (var i = 0; i < ids.length; i++) {
				var item = params.idHash[ids[i]];
				if (item) {
					items.push(item);
				}
			}
			params.numItems += items.length;
			if (params.callback) {
				params.callback.run(items, result);
			}
			if (dialog) {
				var msgKey = ZmItem.PLURAL_MSG_KEY[params.type] || "items";
				var text = AjxMessageFormat.format(ZmMsg.itemsProcessed, [params.numItems, ZmMsg[msgKey]]);
				dialog.setContent(text.toLowerCase());
				if (!dialog.isPoppedUp()) {
					dialog.popup();
				}
			}
		}
	}

	if (params.ids.length && !params.cancelled) {
		AjxTimedAction.scheduleAction(new AjxTimedAction(this, this._doAction, [params]), 100);
	} else {
		params.reqId = null;
		if (params.finalCallback) {
			// finalCallback is responsible for clearing dialog
			DBG.println("sa", "ZmItem running finalCallback");
			params.finalCallback.run(params);
		} else {
			if (dialog) {
				dialog.popdown();
				ZmList.progressDialog = null;
			}
		}
	}
};

/**
 * Cancel current server request if there is one, and set flag to
 * stop cascade of requests.
 *
 * @param params
 */
ZmList.prototype._cancelAction =
function(params) {
	params.cancelled = true;
	if (params.reqId) {
		appCtxt.getRequestMgr().cancelRequest(params.reqId);
	}
	if (params.finalCallback) {
		params.finalCallback.run(params);
	}
};

/**
 * Hack to support actions on a list of items of more than one type. Since some
 * specialized lists (ZmMailList or ZmContactList, for example) override action
 * methods (such as deleteItems), we need to be able to call the proper method
 * for each item type.
 *
 * XXX: We could optimize this a bit by either using a batch request, or by
 * using ItemActionRequest. But we still want to call the appropriate method for
 * each item type, so that any overridden methods get called. So for now, it's
 * easier to do the requests separately.
 */
ZmList.prototype._mixedAction =
function(method, params) {

	var typedItems = this._getTypedItems(params.items);
	var params1 = AjxUtil.hashCopy(params);
	for (var type in typedItems) {
		this._mixedType = type; // marker that we've been here already
		if (type == ZmItem.CONTACT) {
			var items = typedItems[type];
			for (var i = 0; i < items.length; i++) {
				params1.items = [items[i]];
				items[i].list[method](params);
			}
		} else {
			params1.items = typedItems[type];
			ZmMailList.prototype[method].call(this, params);
		}
		this._mixedType = null;
	}
};

ZmList.prototype._getTypedItems =
function(items) {
	var typedItems = {};
	for (var i = 0; i < items.length; i++) {
		var type = items[i].type;
		if (!typedItems[type]) {
			typedItems[type] = [];
		}
		typedItems[type].push(items[i]);
	}
	return typedItems;
};

// Grab the IDs out of a list of items, and return them as both a string and a hash.
ZmList.prototype._getIds =
function(list) {

	var idHash = {};
	if (list instanceof ZmItem) {
		list = [list];
	}
	
	var ids = [];
	if ((list && list.length)) {
		for (var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item.id;
			if (id) {
				ids.push(id);
				idHash[id] = item;
			}
		}
	}

	return {hash:idHash, list:ids};
};

// Returns the index at which the given item should be inserted into this list.
// Subclasses should override to return a meaningful value.
ZmList.prototype._sortIndex = 
function(item) {
	return 0;
};

ZmList.prototype._redoSearch = 
function(ctlr) {
	var sc = appCtxt.getSearchController();
	sc.redoSearch(ctlr._currentSearch);
};

ZmList.prototype._getActionNamespace =
function() {
	return "urn:zimbraMail";
};

ZmList.prototype._folderTreeChangeListener = 
function(ev) {
	if (ev.type != ZmEvent.S_FOLDER) return;

	var folder = ev.getDetail("organizers")[0];
	var fields = ev.getDetail("fields");
	var ctlr = appCtxt.getCurrentController();
	var isCurrentList = (appCtxt.getCurrentList() == this);

	if (ev.event == ZmEvent.E_DELETE &&
		(ev.source instanceof ZmFolder) &&
		ev.source.id == ZmFolder.ID_TRASH)
	{
		// user emptied trash - reset a bunch of stuff w/o having to redo the search
		var curView = ctlr.getCurrentView();
		if (curView) { curView.offset = 0; }
		ctlr._resetNavToolBarButtons(view);
	}
	else if (isCurrentList && ctlr && ctlr._currentSearch &&
			 (ev.event == ZmEvent.E_MOVE || (ev.event == ZmEvent.E_MODIFY) && fields && fields[ZmOrganizer.F_NAME]))
	{
		// on folder rename or move, update current query if folder is part of query
		var oldPath = ev.getDetail("oldPath");
		if (ctlr._currentSearch.hasFolderTerm(oldPath)) {
			ctlr._currentSearch.replaceFolderTerm(oldPath, folder.getPath());
			appCtxt.getSearchController().setSearchField(ctlr._currentSearch.query);
		}
	}
};

ZmList.prototype._tagTreeChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_TAG) { return; }

	var tag = ev.getDetail("organizers")[0];
	var fields = ev.getDetail("fields");
	var ctlr = appCtxt.getCurrentController();
	if (!ctlr || (appCtxt.getCurrentList() != this)) { return; }

	if ((ev.event == ZmEvent.E_MODIFY) && fields && fields[ZmOrganizer.F_NAME]) {
		// on tag rename, update current query if tag is part of query
		var oldName = ev.getDetail("oldName");
		if (ctlr._currentSearch && ctlr._currentSearch.hasTagTerm(oldName)) {
			ctlr._currentSearch.replaceTagTerm(oldName, tag.getName());
			appCtxt.getSearchController().setSearchField(ctlr._currentSearch.query);
		}
	} else if (ev.event == ZmEvent.E_DELETE) {
		// Remove tag from any items that have it
		var a = this.getArray();
		var hasTagListener = this._evtMgr.isListenerRegistered(ZmEvent.L_MODIFY);
		for (var i = 0; i < a.length; i++) {
			var item = this.getById(a[i].id);	// make sure item is realized (contact may not be)
			if (item && item.hasTag(tag.id)) {
				item.tagLocal(tag.id, false);
				if (hasTagListener) {
					this._notify(ZmEvent.E_TAGS, {items:[item]});
				}
			}
		}

		// If search results are based on this tag, keep them around so that user can still
		// view msgs or open convs, but disable pagination and sorting since they're based
		// on the current query.
		if (ctlr._currentSearch && ctlr._currentSearch.hasTagTerm(tag.getName())) {
			var viewId = appCtxt.getCurrentViewId();
			ctlr.enablePagination(false, viewId);
			var view = ctlr.getCurrentView();
			if (view && view.sortingEnabled) {
				view.sortingEnabled = false;
			}
			if (viewId == ZmId.VIEW_CONVLIST) {
				ctlr._currentSearch.query = "is:read is:unread";
			}
			ctlr._currentSearch.tagId = null;
			appCtxt.getSearchController().setSearchField("");
		}
	}
};
