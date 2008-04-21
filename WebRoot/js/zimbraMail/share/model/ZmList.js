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
}

ZmList.prototype = new ZmModel;
ZmList.prototype.constructor = ZmList;

// for item creation
ZmList.ITEM_CLASS = {};

// node names for item types
ZmList.NODE = {};

// item types based on node name (reverse map of above)
ZmList.ITEM_TYPE = {};

ZmList.prototype.toString = 
function() {
	return "ZmList";
};

// abstract methods
ZmList.prototype.getPrintHtml = function(preferHtml, callback) {};

/**
 * Adds an item to the list.
 *
 * @param item	the item to add
 * @param index	the index at which to add the item (defaults to end of list)
 */
ZmList.prototype.add = 
function(item, index) {
	this._vector.add(item, index);
	if (item.id)
		this._idHash[item.id] = item;
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
	for (var i = 0; i < a.length; i++)
		a[i].clear();

	this._evtMgr.removeAll(ZmEvent.L_MODIFY);
	this._vector.removeAll();
	for (var id in this._idHash)
		this._idHash[id] = null;
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
			if (parseInt(node.getAttribute("l")) == ZmFolder.ID_TRASH && (this.type != ZmItem.CONTACT))
				continue;
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
	if (offset < end)
		subVector = AjxVector.fromArray(subList.slice(offset, end));
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
		if (item.id)
			this._idHash[item.id] = item;
	}
};

// Actions

/**
 * Sets/unsets a flag for each of a list of items.
 *
 * @param items		a list of items to set/unset a flag for
 * @param flagOp		the name of the flag operation ("flag" or "read")
 * @param on			whether to set the flag
 */
ZmList.prototype.flagItems =
function(items, flagOp, on) {
	if (this.type == ZmItem.MIXED && !this._mixedType) {
		this._mixedAction("flagItems", [items, flagOp, on]);
		return;
	}

	var action = on ? flagOp : "!" + flagOp;
	this._itemAction({items: items, action: action});
};

/**
 * Tags or untags a list of items. A sanity check is done first, so that items
 * aren't tagged redundantly, and so we don't try to remove a nonexistent tag.
 *
 * @param items		a list of items to tag/untag
 * @param tagId		the tag to add/remove from each item
 * @param doTag		true if adding the tag, false if removing it
 */
ZmList.prototype.tagItems =
function(items, tagId, doTag) {
	// for multi-account mbox, normalize tagId
	if (appCtxt.multiAccounts && !appCtxt.getActiveAccount().isMain) {
		tagId = ZmOrganizer.normalizeId(tagId);
	}

	if (this.type == ZmItem.MIXED && !this._mixedType) {
		this._mixedAction("tagItems", [items, tagId, doTag]);
		return;
	}
	if (!(items instanceof Array)) items = [items];

	// only tag items that don't have the tag, and untag ones that do
	// always tag a conv, because we don't know if all items in the conv have the tag yet
	var items1 = [];
	for (var i = 0; i < items.length; i++) {
		if ((doTag && (!items[i].hasTag(tagId) || items[i].type == ZmItem.CONV)) || (!doTag && items[i].hasTag(tagId)))
			items1.push(items[i]);
	}
	
	if (items1.length) {
		var action = doTag ? "tag" : "!tag";
		this._itemAction({items: items1, action: action, attrs: {tag: tagId}});
	}
};

ZmList.prototype.removeAllTags = 
function(items) {
	if (this.type == ZmItem.MIXED && !this._mixedType) {
		this._mixedAction("removeAllTags", [items]);
		return;
	}

	this._itemAction({items: items, action: "update", attrs: {t: ""}});
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
 * @param items		[Array]			a list of items to move
 * @param folder		[ZmFolder]		destination folder
 * @param attrs		[Object]		additional attrs for SOAP command
 */
ZmList.prototype.moveItems =
function(items, folder, attrs) {
	if (this.type == ZmItem.MIXED && !this._mixedType) {
		this._mixedAction("moveItems", [items, folder, attrs]);
		return;
	}
	if (!(items instanceof Array)) items = [items];

	attrs = attrs || (new Object());
	attrs.l = folder.id;
	
	var respCallback = null;
	if (this.type == ZmItem.MIXED)
		respCallback = new AjxCallback(this, this._handleResponseMoveItems, folder);
	this._itemAction({items: items, action: "move", attrs: attrs, callback: respCallback});
};

ZmList.prototype._handleResponseMoveItems =
function(folder, result) {
	var movedItems = result.getResponse();	
	if (movedItems && movedItems.length) {
		this.moveLocal(movedItems, folder.id);
		for (var i = 0; i < movedItems.length; i++)
			movedItems[i].moveLocal(folder.id);
		this._notify(ZmEvent.E_MOVE, {items: movedItems});
	}
};

/**
 * Copies a list of items to the given folder.
 *
 * @param items		[Array]			a list of items to move
 * @param folder		[ZmFolder]		destination folder
 * @param attrs		[Object]		additional attrs for SOAP command
 */
ZmList.prototype.copyItems =
function(items, folder, attrs) {
	if (!(items instanceof Array)) items = [items];

	attrs = attrs || {};
	attrs.l = folder.id;

	var respCallback = new AjxCallback(this, this._handleResponseCopyItems);
	this._itemAction({items: items, action: "copy", attrs: attrs, callback: respCallback});
};

ZmList.prototype._handleResponseCopyItems =
function(result) {
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
 * @param items			[Array]			list of items to delete
 * @param hardDelete		[boolean]		whether to force physical removal of items
 * @param attrs			[Object]		additional attrs for SOAP command
 */
ZmList.prototype.deleteItems =
function(items, hardDelete, attrs) {
	if (this.type == ZmItem.MIXED && !this._mixedType) {
		this._mixedAction("deleteItems", [items, hardDelete, attrs]);
		return;
	}
	if (!(items instanceof Array)) items = [items];

	// figure out which items should be moved to Trash, and which should actually be deleted
	var toMove = new Array();
	var toDelete = new Array();	
	for (var i = 0; i < items.length; i++) {
		var folderId = items[i].getFolderId();
		var folder = appCtxt.getById(folderId);
		if (hardDelete || (folder && folder.isHardDelete()))
			toDelete.push(items[i]);
		else
			toMove.push(items[i]);
	}

	// soft delete - items moved to Trash
	if (toMove.length)
		this.moveItems(toMove, appCtxt.getById(ZmFolder.ID_TRASH), attrs);

	// hard delete - items actually deleted from data store
	if (toDelete.length)
		this._itemAction({items: toDelete, action: "delete", attrs: attrs});
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
ZmList.prototype.modifyLocal 		= function(items, mods) {}
ZmList.prototype.createLocal 		= function(item) {}

// These are not currently used; will need support in ZmItem if they are.
ZmList.prototype.flagLocal 			= function(items, flag, state) {}
ZmList.prototype.tagLocal 			= function(items, tag, state) {}
ZmList.prototype.removeAllTagsLocal = function(items) {}

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
 * @param items		[Array]			list of items to act upon
 * @param action		[string]		SOAP operation
 * @param attrs		[Object]		hash of additional attrs for SOAP request
 * @param callback	[AjxCallback]	async callback
 */
ZmList.prototype._itemAction =
function(params, batchCmd) {
	var actionedItems = new Array();
	var idHash = this._getIds(params.items);
	var idStr = idHash.list.join(",");
	if (!(idStr && idStr.length)) {
		if (params.callback)
			params.callback.run(new ZmCsfeResult(actionedItems));
		else
			return actionedItems;
	}

	var type = (this.type == ZmItem.MIXED) ? this._mixedType : this.type;
	if (!type) return;
	var soapCmd = ZmItem.SOAP_CMD[type] + "Request";
    var useJson = batchCmd ? batchCmd._useJson : true ;
    var itemActionRequest = null;
    if (useJson) {
        itemActionRequest = {};
        var urn = this._getActionNamespace();
        itemActionRequest[soapCmd] = {_jsns:urn};
        var request = itemActionRequest[soapCmd];
        var action = request.action = {};
        action.id = idStr;
        action.op = params.action;
        for (var attr in params.attrs) {
            action[attr] = params.attrs[attr];
		}
    } else {
        itemActionRequest = AjxSoapDoc.create(soapCmd, this._getActionNamespace());
        var actionNode = itemActionRequest.set("action");
        actionNode.setAttribute("id", idStr);
        actionNode.setAttribute("op", params.action);
        for (var attr in params.attrs) {
            actionNode.setAttribute(attr, params.attrs[attr]);
        }
    }

    var respCallback = params.callback ? new AjxCallback(this, this._handleResponseItemAction, [type, idHash, params.callback]) : null;

	if (batchCmd) {
		batchCmd.addRequestParams(itemActionRequest, respCallback);
	} else {
        var params = { asyncMode: true, callback: respCallback };
        useJson ? params.jsonObj = itemActionRequest : params.soapDoc = itemActionRequest;
        appCtxt.getAppController().sendRequest(params);
	}
};

ZmList.prototype._handleResponseItemAction =
function(type, idHash, callback, result) {
	if (callback) {
		var response = result.getResponse();
		var resp = response[ZmItem.SOAP_CMD[type] + "Response"]
		var actionedItems = new Array();
		if (resp && resp.action) {
			var ids = resp.action.id.split(",");
			if (ids) {
				for (var i = 0; i < ids.length; i++) {
					var item = idHash[ids[i]];
					if (item)
						actionedItems.push(item);
				}
			}
		}
		result.set(actionedItems);
		callback.run(result);
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
function(method, args) {
	var typedItems = this._getTypedItems(args[0]);
	for (var type in typedItems) {
		this._mixedType = type; // marker that we've been here already
		if (type == ZmItem.CONTACT) {
			var items = typedItems[type];
			for (var i = 0; i < items.length; i++) {
				items[i].list[method](items[i], args[1], args[2]);
			}
		} else {
			ZmMailList.prototype[method].call(this, typedItems[type], args[1], args[2]);
		}
		this._mixedType = null;
	}
};

ZmList.prototype._getTypedItems =
function(items) {
	var typedItems = new Object();
	for (var i = 0; i < items.length; i++) {
		var type = items[i].type;
		if (!typedItems[type])
			typedItems[type] = new Array();
		typedItems[type].push(items[i]);
	}
	return typedItems;
};

// Grab the IDs out of a list of items, and return them as both a string and a hash.
ZmList.prototype._getIds =
function(list) {
	var idHash = new Object();
	if (list instanceof ZmItem) list = [list];
	
	if (!(list && list.length))	return idHash;
	
	var ids = new Array();
	var extra = new Array();
	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = item.id;
		if (id) {
			ids.push(id);
			idHash[id] = item;
		}
		// so we ignore related conv notifs (except virtual convs)
		if ((item.type == ZmItem.MSG) && item.cid && (item.cid > 0))
			extra.push(item.cid);
	}
	idHash.list = ids;
	idHash.extra = extra;

	return idHash;
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
	if (!ctlr || (appCtxt.getCurrentList() != this)) {
		return;
	}
	
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
			if (view && view.enableSorting)
				view.enableSorting(false);
			if (viewId == ZmId.VIEW_CONVLIST)
				ctlr._currentSearch.query = "is:read is:unread";
			ctlr._currentSearch.tagId = null;
			appCtxt.getSearchController().setSearchField("");
		}
	}
};
