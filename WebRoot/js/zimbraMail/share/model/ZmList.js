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
 * @overview
 * This file defines a list of items.
 */

/**
 * Creates an empty list of items of the given type.
 * @class
 * This class represents a list of items ({@link ZmItem} objects). Any SOAP method that can be
 * applied to a list of item IDs is represented here, so that we can perform an action
 * on multiple items with just one CSFE call. For the sake of convenience, a hash 
 * matching item IDs to items is maintained. Items are assumed to have an 'id'
 * property.
 * <br/>
 * <br/>
 * The calls are made asynchronously. We are assuming that any action taken will result
 * in a notification, so the action methods generally do not have an async callback 
 * chain and thus are leaf nodes. An exception is moving conversations. We don't
 * know enough from the ensuing notifications (which only indicate that messages have
 * moved), we need to update the UI based on the response.
 *
 * @author Conrad Damon
 * 
 * @param {constant}	type		the item type
 * @param {ZmSearch}	search	the search that generated this list
 * 
 * @extends	ZmModel
 */
ZmList = function(type, search) {

	if (arguments.length == 0) return;
	ZmModel.call(this, type);

	this.type = type;
	this.search = search;
	
	this._vector = new AjxVector();
	this._hasMore = false;
	this._idHash = {};

	var tagList = appCtxt.getTagTree();
	if (tagList) {
		this._tagChangeListener = new AjxListener(this, this._tagTreeChangeListener);
		tagList.addChangeListener(this._tagChangeListener);
	}
	
	this.id = "LIST" + ZmList.NEXT++;
	appCtxt.cacheSet(this.id, this);
};

ZmList.prototype = new ZmModel;
ZmList.prototype.constructor = ZmList;

ZmList.prototype.isZmList = true;
ZmList.prototype.toString = function() { return "ZmList"; };


ZmList.NEXT = 1;

// for item creation
ZmList.ITEM_CLASS = {};

// node names for item types
ZmList.NODE = {};

// item types based on node name (reverse map of above)
ZmList.ITEM_TYPE = {};

ZmList.CHUNK_SIZE	= 100;	// how many items to act on at a time via a server request
ZmList.CHUNK_PAUSE	= 500;	// how long to pause to allow UI to catch up


/**
 * Gets the item.
 * 
 * @param	{int}	index		the index
 * @return	{ZmItem}	the index
 */
ZmList.prototype.get =
function(index) {
	return this._vector.get(index);
};

/**
 * Adds an item to the list.
 *
 * @param {ZmItem}	item	the item to add
 * @param {int}	index	the index at which to add the item (defaults to end of list)
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
 * @param {ZmItem}	item	the item to remove
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
 * <code>sortIndex()</code> to add it to a particular point in the list. By default, it
 * will be added at the end.
 *
 * <p>
 * The item will invoke a SOAP call, which generates a create notification from the
 * server. That will be handled by notifyCreate(), which will call _notify()
 * so that views can be updated.
 * </p>
 *
 * @param {Hash}	args	a hash of arugments to pass along to the item constructor
 * @return	{ZmItem}	the newly created item
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
 * 
 * @return	{int}	the number of items
 */
ZmList.prototype.size = 
function() {
	return this._vector.size();
};

/**
 * Returns the index of the given item in the list.
 * 
 * @param	{ZmItem}	item		the item
 * @return	{int}	the index
 */
ZmList.prototype.indexOf = 
function(item) {
	return this._vector.indexOf(item);
};

/**
 * Gets if there are more items for this search.
 * 
 * @return	{Boolean}	<code>true</code> if there are more items
 */
ZmList.prototype.hasMore = 
function() {
	return this._hasMore;
};

/**
 * Sets the "more" flag for this list.
 *
 * @param {Boolean}	bHasMore	<code>true</code> if there are more items
 */
ZmList.prototype.setHasMore = 
function(bHasMore) {
	this._hasMore = bHasMore;
};

/**
 * Returns the list as an array.
 * 
 * @return	{Array}	an array of {ZmItem} objects
 */
ZmList.prototype.getArray =
function() {
	return this._vector.getArray();
};

/**
 * Returns the list as a vector.
 * 
 * @return	{AjxVector}	a vector of {ZmItem} objects
 */
ZmList.prototype.getVector =
function() {
	return this._vector;
};

/**
 * Gets the item with the given id.
 *
 * @param {String}	id		an item id
 * 
 * @return	{ZmItem}	the item
 */
ZmList.prototype.getById =
function(id) {
	return this._idHash[id];
};

/**
 * Clears the list, including the id hash.
 * 
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
	this._idHash = {};
};

/**
 * Populates the list with elements created from the response to a SOAP command. Each
 * node in the response should represent an item of the list's type. Items are added
 * in the order they are received; no sorting is done.
 *
 * @param {Object}	respNode	an XML node whose children are item nodes
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
 * @param {Object}	node	an XML node
 * @param {Hash}	args	an optional list of arguments to pass to the item contructor
 */
ZmList.prototype.addFromDom = 
function(node, args) {
	args = args || {};
	args.list = this;
	var obj = eval(ZmList.ITEM_CLASS[this.type]);
	if (obj) {
		this.add(obj.createFromDom(node, args));
	}
};

/**
 * Gets a vector containing a subset of items of this list.
 *
 * @param {int}		offset		the starting index
 * @param {int}		limit		the size of sublist
 * @return	{AjxVector}	the vector
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

/**
 * Caches the list.
 * 
 * @param	{int}	offset	the index
 * @param	{AjxVector}	newList		the new list
 */
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
 * Sets and unsets a flag for each of a list of items.
 *
 * @param 	{Hash}				params					a hash of parameters
 * @param	{Array}     		params.items			a list of items to set/unset a flag for
 * @param	{String}			params.op				the name of the flag operation ("flag" or "read")
 * @param	{Boolean|String}	params.value			whether to set the flag, or for "update" the flags string
 * @param	{AjxCallback}		params.callback			the callback to run after each sub-request
 * @param	{closure}			params.finalCallback	the callback to run after all items have been processed
 * @param	{int}				params.count			the starting count for number of items processed
 * @param   {String}    		params.actionText   	pattern for generating action summary
 */
ZmList.prototype.flagItems =
function(params) {

	params = Dwt.getParams(arguments, ["items", "op", "value", "callback"]);

	params.items = AjxUtil.toArray(params.items);

	if (params.op == "update") {
		params.action = params.op;
		params.attrs = {f:params.value};
	} else {
		params.action = params.value ? params.op : "!" + params.op;
	}

    if (appCtxt.multiAccounts) {
		// check if we're flagging item from remote folder, in which case, always send
		// request on-behalf-of the account the item originally belongs to.
        var folderId = this.search.folderId;
        var fromFolder = folderId && appCtxt.getById(folderId);
        if (fromFolder && fromFolder.isRemote()) {
                params.accountName = params.items[0].getAccount().name;
        }
	}

	this._itemAction(params);
};

/**
 * Tags or untags a list of items. A sanity check is done first, so that items
 * aren't tagged redundantly, and so we don't try to remove a nonexistent tag.
 *
 * @param {Hash}		params					a hash of parameters
 * @param {Array}		params.items			a list of items to tag/untag
 * @param {String}  	params.tagId            ID of tag to add/remove
 * @param {String}		params.tag  			the tag to add/remove from each item (optional)
 * @param {Boolean}		params.doTag			<code>true</code> if adding the tag, <code>false</code> if removing it
 * @param {AjxCallback}	params.callback			the callback to run after each sub-request
 * @param {closure}		params.finalCallback	the callback to run after all items have been processed
 * @param {int}			params.count			the starting count for number of items processed
 */
ZmList.prototype.tagItems =
function(params) {

	params = Dwt.getParams(arguments, ["items", "tagId", "doTag"]);

    var tagId = params.tagId || (params.tag && params.tag.id);

	// for multi-account mbox, normalize tagId
	if (appCtxt.multiAccounts && !appCtxt.getActiveAccount().isMain) {
		tagId = ZmOrganizer.normalizeId(tagId);
	}

	// only tag items that don't have the tag, and untag ones that do
	// always tag a conv, because we don't know if all items in the conv have the tag yet
	var items = AjxUtil.toArray(params.items);
	var items1 = [], doTag = params.doTag;
	if (items[0] && items[0] instanceof ZmItem) {
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			if ((doTag && (!item.hasTag(tagId) || item.type == ZmItem.CONV)) ||	(!doTag && item.hasTag(tagId))) {
				items1.push(item);
			}
		}
	} else {
		items1 = items;
	}
	params.items = items1;
	params.attrs = {tag:tagId};
	params.action = doTag ? "tag" : "!tag";
    params.actionText = doTag ? ZmMsg.actionTag : ZmMsg.actionUntag;
	if (params.tag && params.tag.name) {
		params.actionArg = AjxStringUtil.htmlEncode(params.tag.name);
	}
    

	this._itemAction(params);
};

/**
 * Removes all tags from a list of items.
 *
 * @param	{Hash}			params					a hash of parameters
 * @param	{Array}			params.items			a list of items to tag/untag
 * @param	{AjxCallback}	params.callback			the callback to run after each sub-request
 * @param	{closure}		params.finalCallback	the callback to run after all items have been processed
 * @param	{int}			params.count			the starting count for number of items processed
 */
ZmList.prototype.removeAllTags = 
function(params) {

	params = (params && params.items) ? params : {items:params};

	var items = AjxUtil.toArray(params.items);
	var items1 = [];
	if (items[0] && items[0] instanceof ZmItem) {
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			if (item.tags && item.tags.length) {
				items1.push(item);
			}
		}
	} else {
		items1 = items;
	}

	params.items = items1;
	params.action = "update";
	params.attrs = {t: ""};
    params.actionText = ZmMsg.actionRemoveTags;

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
 * @param	{Hash}			params					a hash of parameters
 * @param	{Array}			params.items			a list of items to move
 * @param	{ZmFolder}		params.folder			the destination folder
 * @param	{Hash}			params.attrs			the additional attrs for SOAP command
 * @param	{AjxCallback}	params.callback			the callback to run after each sub-request
 * @param	{closure}		params.finalCallback	the callback to run after all items have been processed
 * @param	{int}			params.count			the starting count for number of items processed
 * @param	{boolean}		params.noUndo			true if the action is not undoable (e.g. performed as an undo)
 * @param	{String}		params.actionText		optional text to display in the confirmation toast instead of the default summary. May be set explicitly to null to disable the confirmation toast entirely
 */
ZmList.prototype.moveItems =
function(params) {
	
	params = Dwt.getParams(arguments, ["items", "folder", "attrs", "callback", "errorCallback" ,"finalCallback", "noUndo", "actionText"]);

	var params1 = AjxUtil.hashCopy(params);
	params1.items = AjxUtil.toArray(params.items);
	params1.attrs = params.attrs || {};
	params1.childWin = params.childWin;
	params1.closeChildWin = params.closeChildWin;
	
	if (params1.folder.id == ZmFolder.ID_TRASH) {
		params1.actionText = (params.actionText !== null) ? (params.actionText || ZmMsg.actionTrash) : null;
		params1.action = "trash";
	} else {
		params1.actionText = (params.actionText !== null) ? (params.actionText || ZmMsg.actionMove) : null;
		params1.actionArg = params.folder.getName(false, false, true);
		params1.action = "move";
		params1.attrs.l = params.folder.id;
	}
	params1.callback = new AjxCallback(this, this._handleResponseMoveItems, [params]);

    if (appCtxt.multiAccounts) {
		// Reset accountName for multi-account to be the respective account if we're
		// moving a draft out of Trash.
		// OR,
		// check if we're moving to or from a shared folder, in which case, always send
		// request on-behalf-of the account the item originally belongs to.

        var folderId = params.items[0].getFolderId && params.items[0].getFolderId();

        // on bulk delete, when the second chunk loads try to get folderId from the item id.
        if (!folderId) {
            var itemId = params.items[0] && params.items[0].id;
            folderId = itemId && appCtxt.getById(itemId) && appCtxt.getById(itemId).folderId;
        }
        var fromFolder = appCtxt.getById(folderId);
		if ((params.items[0].isDraft && params.folder.id == ZmFolder.ID_DRAFTS) ||
			(params.folder.isRemote()) || (fromFolder && fromFolder.isRemote()))
		{
			params1.accountName = params.items[0].getAccount().name;
		}
	}
	//Error Callback
	params1.errorCallback = params.errorCallback;

	if (params.folder.id == ZmFolder.ID_TRASH) { // Bug 26103: when deleting an item in a folder shared to us, save a copy in our own trash
		var toCopy = [];
		for (var i=0; i<params.items.length; i++) {
			var item = params.items[i];
			var index = item.id.indexOf(":");
			if (index != -1) { //might be shared
				var acctId = item.id.substring(0, index);
				if (!appCtxt.accountList.getAccount(acctId)) {
					toCopy.push(item);
				}
			}
		}
		if (toCopy.length) {
			var params2 = {
				items:			toCopy,
				folder:			params.folder, // Should refer to our own trash folder
				finalCallback:	this._itemAction.bind(this, params1),
				actionText:		null
			};
			this.copyItems(params2);
			return;
		}
	}
    
	this._itemAction(params1);
};

/**
 * @private
 */
ZmList.prototype._handleResponseMoveItems =
function(params, result) {

	var movedItems = result.getResponse();
	if (movedItems && movedItems.length && (movedItems[0] instanceof ZmItem)) {
		this.moveLocal(movedItems, params.folder.id);
		for (var i = 0; i < movedItems.length; i++) {
			var item = movedItems[i];
			var details = {oldFolderId:item.folderId};
			item.moveLocal(params.folder.id);
			//ZmModel.prototype._notify.call(item, ZmEvent.E_MOVE, details);
		}
		// batched change notification
		var item = movedItems[0];
		var list = item.list;
        if (list) {
            list._evt.batchMode = true;
            list._evt.item = item;	// placeholder
            list._evt.items = movedItems;
            list._notify(ZmEvent.E_MOVE, details);
        }
	}

	if (params.callback) {
		params.callback.run(result);
	}
};

/**
 * Copies a list of items to the given folder.
 *
 * @param {Hash}		params					the hash of parameters
 * @param {Array}		params.items			a list of items to move
 * @param {ZmFolder}	params.folder			the destination folder
 * @param {Hash}		params.attrs			the additional attrs for SOAP command
 * @param {closure}		params.finalCallback	the callback to run after all items have been processed
 * @param {int}			params.count			the starting count for number of items processed
 * @param {String}		params.actionText		optional text to display in the confirmation toast instead of the default summary. May be set explicitly to null to disable the confirmation toast
 */
ZmList.prototype.copyItems =
function(params) {

	params = Dwt.getParams(arguments, ["items", "folder", "attrs", "actionText"]);

	params.items = AjxUtil.toArray(params.items);
	params.attrs = params.attrs || {};
	params.attrs.l = params.folder.id;
	params.action = "copy";
	params.actionText = (params.actionText !== null) ? (params.actionText || ZmMsg.itemCopied) : null;
	params.actionArg = params.folder.getName(false, false, true);
	params.callback = new AjxCallback(this, this._handleResponseCopyItems, params);

	if (appCtxt.multiAccounts && params.folder.isRemote()) {
		params.accountName = params.items[0].getAccount().name;
	}

	this._itemAction(params);
};

/**
 * @private
 */
ZmList.prototype._handleResponseCopyItems =
function(params, result) {
	var resp = result.getResponse();
	if (resp.length > 0) {
		if (params.actionText) {
			var msg = AjxMessageFormat.format(params.actionText, resp.length);
			appCtxt.getAppController().setStatusMsg(msg);
		}
	}
};

/**
 * Deletes one or more items from the list. Normally, deleting an item just
 * moves it to the Trash (soft delete). However, if it's already in the Trash,
 * it will be removed from the data store (hard delete).
 *
 * @param {Hash}	params		a hash of parameters
 * @param	{Array}		params.items			list of items to delete
 * @param	{Boolean}	params.hardDelete		<code>true</code> to force physical removal of items
 * @param	{Object}	params.attrs			additional attrs for SOAP command
 * @param	{window}	params.childWin			the child window this action is happening in
 * @param	{closure}	params.finalCallback	the callback to run after all items have been processed
 * @param	{int}		params.count			the starting count for number of items processed
 * @param	{Boolean}	params.confirmDelete		the user confirmed hard delete
 */
ZmList.prototype.deleteItems =
function(params) {

	params = Dwt.getParams(arguments, ["items", "hardDelete", "attrs", "childWin"]);

	var items = params.items = AjxUtil.toArray(params.items);

	// figure out which items should be moved to Trash, and which should actually be deleted
	var toMove = [];
	var toDelete = [];
	if (items[0] && items[0] instanceof ZmItem) {
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
	} else {
		toMove = items;
	}

	if (toDelete.length && !params.confirmDelete) {
		params.confirmDelete = true;
		var callback = ZmList.prototype.deleteItems.bind(this, params);
		this._popupDeleteWarningDialog(callback, toMove.length, toDelete.length);
		return;
	}

	params.callback = params.childWin && new AjxCallback(this._handleDeleteNewWindowResponse, params.childWin);

	// soft delete - items moved to Trash
	if (toMove.length) {
		if (appCtxt.multiAccounts) {
			var accounts = this._filterItemsByAccount(toMove);
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
        params.actionText = ZmMsg.actionDelete;
		this._itemAction(params);
	}
};


ZmList.prototype._popupDeleteWarningDialog =
function(callback, onlySome, count) {
	var dialog = appCtxt.getOkCancelMsgDialog();
	dialog.reset();
	dialog.setMessage(AjxMessageFormat.format(ZmMsg[onlySome ? "confirmDeleteSomeForever" : "confirmDeleteForever"], [count]), DwtMessageDialog.WARNING_STYLE); 
	dialog.registerCallback(DwtDialog.OK_BUTTON, this._deleteWarningDialogListener.bind(this, callback, dialog));
	dialog.associateEnterWithButton(DwtDialog.OK_BUTTON);
	dialog.popup(null, DwtDialog.OK_BUTTON);
};

ZmList.prototype._deleteWarningDialogListener =
function(callback, dialog) {
	dialog.popdown();
	callback();
};


/**
 * @private
 */
ZmList.prototype._deleteAccountItems =
function(accounts, params) {
	var items;
	for (var i in accounts) {
		items = accounts[i];
		break;
	}

	if (items) {
		delete accounts[i];

        var ac = window.parentAppCtxt || window.appCtxt;
        params.accountName = ac.accountList.getAccount(i).name;
		params.items = items;
		params.folder = appCtxt.getById(ZmFolder.ID_TRASH);

		this.moveItems(params);
	}
};

/**
 * @private
 */
ZmList.prototype._filterItemsByAccount =
function(items) {
	// separate out the items based on which account they belong to
	var accounts = {};
	if (items[0] && items[0] instanceof ZmItem) {
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			var acctId = item.getAccount().id;
			if (!accounts[acctId]) {
				accounts[acctId] = [];
			}
			accounts[acctId].push(item);
		}
	} else {
		var id = appCtxt.accountList.mainAccount.id;
		accounts[id] = items;
	}

	return accounts;
};

/**
 * @private
 */
ZmList.prototype._handleDeleteNewWindowResponse =
function(childWin, result) {
	if (childWin) {
		childWin.close();
	}
};

/**
 * Applies the given list of modifications to the item.
 *
 * @param {ZmItem}	item			the item to modify
 * @param {Hash}	mods			hash of new properties
 * @param	{AjxCallback}	callback	the callback
 */
ZmList.prototype.modifyItem =
function(item, mods, callback) {
	item.modify(mods, callback);
};

// Notification handling

/**
 * Create notification.
 * 
 * @param	{Object}	node		not used
 */
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

/**
 * Modifies the items (local).
 * 
 * @param	{Array}	items		an array of items
 * @param	{Object}	mods	a hash of properties to modify
 */
ZmList.prototype.modifyLocal 		= function(items, mods) {};

/**
 * Creates the item (local).
 * 
 * @param	{ZmItem}	item	the item to create
 */
ZmList.prototype.createLocal 		= function(item) {};

// These are not currently used; will need support in ZmItem if they are.
ZmList.prototype.flagLocal 			= function(items, flag, state) {};
ZmList.prototype.tagLocal 			= function(items, tag, state) {};
ZmList.prototype.removeAllTagsLocal = function(items) {};

// default action is to remove each deleted item from this list
/**
 * Deletes the items (local).
 * 
 * @param	{Array}	items		an array of items
 */
ZmList.prototype.deleteLocal =
function(items) {
	for (var i = 0; i < items.length; i++) {
		this.remove(items[i]);
	}
};

// default action is to remove each moved item from this list
/**
 * Moves the items (local).
 * 
 * @param	{Array}	items		an array of items
 * @param	{String}	folderId	the folder id
 */
ZmList.prototype.moveLocal = 
function(items, folderId) {
	for (var i = 0; i < items.length; i++) {
		this.remove(items[i]);
	}
};

/**
 * Performs an action on items via a SOAP request.
 *
 * @param {Hash}				params				a hash of parameters
 * @param	{Array}				params.items			a list of items to act upon
 * @param	{String}			params.action			the SOAP operation
 * @param	{Object}			params.attrs			a hash of additional attrs for SOAP request
 * @param	{AjxCallback}		params.callback			the async callback
 * @param	{closure}			params.finalCallback	the callback to run after all items have been processed
 * @param	{AjxCallback}		params.errorCallback	the async error callback
 * @param	{String}			params.accountName		the account to send request on behalf of
 * @param	{int}				params.count			the starting count for number of items processed
 * @param	{ZmBatchCommand}	batchCmd				if set, request data is added to batch request
 * @param	{boolean}			params.noUndo			true if the action is performed as an undo (not undoable)
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
			params.finalCallback(params);
		}
		return;
	}

	DBG.println("sa", "ITEM ACTION: " + idList.length + " items");
	var type;
	if (params.items.length == 1 && params.items[0] && params.items[0].type) {
		type = params.items[0].type;
	} else {
		type = this.type;
	}
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

	var actionController = appCtxt.getActionController();
	var actionLogItem = (!params.noUndo && actionController && actionController.actionPerformed({op: params.action, ids: idList, attrs: params.attrs})) || null;
	var respCallback = new AjxCallback(this, this._handleResponseItemAction, [params.callback, actionLogItem]);

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
		numItems:		params.count || 0,
		actionText:		params.actionText,
		actionArg:		params.actionArg,
		actionLogItem:	actionLogItem,
		childWin:		params.childWin,
		closeChildWin: 	params.closeChildWin
	};

	if (idList.length >= ZmList.CHUNK_SIZE) {
		var pdParams = {
			state:		ZmListController.PROGRESS_DIALOG_INIT,
			callback:	new AjxCallback(this, this._cancelAction, [params1])
		}
		ZmListController.handleProgress(pdParams);
	}
	
	this._doAction(params1);
};

/**
 * @private
 */
ZmList.prototype._handleResponseItemAction =
function(callback, actionLogItem, items, result) {
	if (actionLogItem) {
		actionLogItem.setComplete();
	}
	
	if (callback) {
		result.set(items);
		callback.run(result);
	}
};

/**
 * @private
 */
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
	var more = Boolean(params.ids.length && !params.cancelled);

	var respCallback = new AjxCallback(this, this._handleResponseDoAction, [params]);

	if (params.batchCmd) {
		params.batchCmd.addRequestParams(params.request, respCallback, params.errorCallback);
	} else {
		var reqParams = {asyncMode:true, callback:respCallback, errorCallback: params.errorCallback, accountName:params.accountName, more:more};
		if (useJson) {
			reqParams.jsonObj = params.request;
		} else {
			reqParams.soapDoc = params.request;
		}
		DBG.println("sa", "*** do action: " + list.length + " items");
		params.reqId = appCtxt.getAppController().sendRequest(reqParams);
	}
};

/**
 * @private
 */
ZmList.prototype._handleResponseDoAction =
function(params, result) {

	var summary;
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

			if (params.actionText) {
				summary = ZmList.getActionSummary(params.actionText, params.numItems, params.type, params.actionArg);
				var pdParams = {
					state:		ZmListController.PROGRESS_DIALOG_UPDATE,
					summary:	summary
				}
				ZmListController.handleProgress(pdParams);
			}
		}
	}

	if (params.ids.length && !params.cancelled) {
		DBG.println("sa", "item action setting up next chunk, remaining: " + params.ids.length);
		AjxTimedAction.scheduleAction(new AjxTimedAction(this, this._doAction, [params]), ZmItem.CHUNK_PAUSE);
	} else {
		params.reqId = null;
		params.actionSummary = summary;
		if (params.finalCallback) {
			// finalCallback is responsible for showing status or clearing dialog
			DBG.println("sa", "item action running finalCallback");
			params.finalCallback(params);
		} else {
			DBG.println("sa", "no final callback");
			ZmListController.handleProgress({state:ZmListController.PROGRESS_DIALOG_CLOSE});
			ZmBaseController.showSummary(params.actionSummary, params.actionLogItem, params.closeChildWin);
		}
	}
};

ZmList.getActionSummary =
function(text, num, type, arg) {
	var typeTextAuto = AjxMessageFormat.format(ZmMsg[ZmItem.COUNT_KEY[type]], num);
	var typeTextSingular = AjxMessageFormat.format(ZmMsg[ZmItem.COUNT_KEY[type]], 1);
	return AjxMessageFormat.format(text, [num, typeTextAuto, arg, typeTextSingular]);
};

/**
 * Cancel current server request if there is one, and set flag to
 * stop cascade of requests.
 *
 * @param {Hash}	params	a hash of parameters
 * 
 * @private
 */
ZmList.prototype._cancelAction =
function(params) {
	params.cancelled = true;
	if (params.reqId) {
		appCtxt.getRequestMgr().cancelRequest(params.reqId);
	}
	if (params.finalCallback) {
		params.finalCallback(params);
	}
	ZmListController.handleProgress({state:ZmListController.PROGRESS_DIALOG_CLOSE});
};

/**
 * @private
 */
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

/**
 * Grab the IDs out of a list of items, and return them as both a string and a hash.
 * 
 * @private
 */
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

/**
 * Returns the index at which the given item should be inserted into this list.
 * Subclasses should override to return a meaningful value.
 * 
 * @private
 */
ZmList.prototype._sortIndex = 
function(item) {
	return 0;
};

/**
 * @private
 */
ZmList.prototype._redoSearch = 
function(ctlr) {
	var sc = appCtxt.getSearchController();
	sc.redoSearch(ctlr._currentSearch);
};

/**
 * @private
 */
ZmList.prototype._getActionNamespace =
function() {
	return "urn:zimbraMail";
};

/**
 * @private
 */
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
		var curView = ctlr.getListView && ctlr.getListView();
		if (curView) {
			curView.offset = 0;
		}
		ctlr._resetNavToolBarButtons(view);
	}
	else if (isCurrentList && ctlr && ctlr._currentSearch &&
			 (ev.event == ZmEvent.E_MOVE || (ev.event == ZmEvent.E_MODIFY) && fields && fields[ZmOrganizer.F_NAME]))
	{
		// on folder rename or move, update current query if folder is part of query
		if (ctlr._currentSearch.replaceFolderTerm(ev.getDetail("oldPath"), folder.getPath())) {
			appCtxt.getSearchController().setSearchField(ctlr._currentSearch.query);
		}
	}
};

/**
 * @private
 */
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
			var viewType = appCtxt.getCurrentViewType();
			ctlr.enablePagination(false, viewId);
			var view = ctlr.getListView && ctlr.getListView();
			if (view && view.sortingEnabled) {
				view.sortingEnabled = false;
			}
			if (viewType == appCtxt.get(ZmSetting.CONV_MODE)) {
				ctlr._currentSearch.query = "is:read is:unread";
			}
			ctlr._currentSearch.tagId = null;
			appCtxt.getSearchController().setSearchField("");
		}
	}
};
