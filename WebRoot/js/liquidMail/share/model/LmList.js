/**
* Creates an empty list of items of the given type.
* @constructor
* @class
* This class represents a list of items (LmItem objects). Any SOAP method that can be
* applied to a list of item IDs is represented here, so that we can perform an action
* on multiple items with just one CSFE call. For the sake of convenience, a hash 
* matching item IDs to items is maintained. Items are assumed to have an 'id'
* property.
*
* @author Conrad Damon
* @param type			item type
* @param appCtxt		the app context
*/
function LmList(type, appCtxt) {

	if (arguments.length == 0) return;
	LmModel.call(this, true);

	this.type = type;
	this._appCtxt = appCtxt;
	this.searchResults = null; // search results that generated this list
	
	this._vector = new LsVector();
	this._hasMore = false;
	this._idHash = new Object();
	this._evt = new LmEvent(type);
}

LmList.prototype = new LmModel;
LmList.prototype.constructor = LmList;

// for item creation
LmList.ITEM_CLASS = new Object();
LmList.ITEM_CLASS[LmItem.CONV] = LmConv; 
LmList.ITEM_CLASS[LmItem.MSG] = LmMailMsg;
LmList.ITEM_CLASS[LmItem.ATT] = LmMimePart;
LmList.ITEM_CLASS[LmItem.CONTACT] = LmContact;
LmList.ITEM_CLASS[LmItem.APPT] = LmAppt;

// node names for item types
LmList.NODE = new Object();
LmList.NODE[LmItem.CONV] = "c";
LmList.NODE[LmItem.MSG] = "m";
LmList.NODE[LmItem.ATT] = "mp";
LmList.NODE[LmItem.CONTACT] = "cn";

// item types based on node name
LmList.ITEM_TYPE = new Object();
LmList.ITEM_TYPE["c"] = LmItem.CONV;
LmList.ITEM_TYPE["m"] = LmItem.MSG;
LmList.ITEM_TYPE["mp"] = LmItem.ATT;
LmList.ITEM_TYPE["cn"] = LmItem.CONTACT;

LmList.TYPES = [LmItem.CONTACT, LmItem.CONV, LmItem.MSG, LmItem.ATT, LmItem.APPT];
LmList.MIXED = -1; // special type for heterogeneous list

LmList.prototype.toString = 
function() {
	return "LmList";
}

LmList.prototype.addChangeListener = 
function(listener) {
	if (LmModel.prototype.addChangeListener.call(this, listener))
		this._appCtxt.getAppController().addModel(this);	
}

LmList.prototype.removeChangeListener = 
function(listener) {
	if (LmModel.prototype.removeChangeListener.call(this, listener))
		if (!this._evtMgr.isListenerRegistered(LmEvent.L_MODIFY))
			this._appCtxt.getAppController().removeModel(this);
}

/**
* Adds an item to the list.
*
* @param item	the item to add
* @param index	the index at which to add the item (defaults to end of list)
*/
LmList.prototype.add = 
function(item, index) {
	this._vector.add(item, index);
	if (item.id)
		this._idHash[item.id] = item;
}

/**
* Removes an item from the list.
*
* @param item	the item to remove
*/
LmList.prototype.remove = 
function(item) {
	this._vector.remove(item);
	if (item.id)
		delete this._idHash[item.id];
}

/**
* Creates an item from the given arguments. A subclass may override
* sortIndex() to add it to a particular point in the list. By default, it
* will be added at the end.
*
* The item will invoke a SOAP call, which generates a create notification from the
* server. That will be handled by notifyCreate(), which will call eventNotify()
* so that views can be updated.
*
* @param args	arbitrary hash of args to pass along
*/
LmList.prototype.create =
function(args) {
	var item = new LmList.ITEM_CLASS[this.type](this._appCtxt, this);
	item.create(args);

	return item;
}

/**
* Returns the number of items in the list.
*/
LmList.prototype.size = 
function() {
	return this._vector.size();
}

/**
* Returns true if there are more items for this search.
*/
LmList.prototype.hasMore = 
function() {
	return this._hasMore;
}

/**
* Sets the "more" flag for this list.
*
* @param bHasMore	whether there are more items
*/
LmList.prototype.setHasMore = 
function(bHasMore) {
	this._hasMore = bHasMore;
}

/**
* Returns the list as an array.
*/
LmList.prototype.getArray =
function() {
	return this._vector.getArray();
}

/**
* Returns the list as a LsVector.
*/
LmList.prototype.getVector =
function() {
	return this._vector;
}

/**
* Returns the item with the given ID.
*
* @param id		an item ID
*/
LmList.prototype.getById =
function(id) {
	return this._idHash[id];
}

/**
* Clears the list, including its ID hash.
*/
LmList.prototype.clear =
function() {
	// First, let each item run its clear() method
	var a = this.getArray();
	for (var i = 0; i < a.length; i++)
		a[i].clear();

	if (this._evtMgr.isListenerRegistered(LmEvent.L_MODIFY))
		this._appCtxt.getAppController().removeModel(this);
	this._evtMgr.removeAll(LmEvent.L_MODIFY);
	this._vector.removeAll();
	for (var id in this._idHash)
		this._idHash[id] = null;
	this._idHash = new Object();
}

/**
* Populates the list with elements created from the response to a SOAP command. Each
* node in the response should represent an item of the list's type. Items are added
* in the order they are received; no sorting is done.
*
* @param respNode	an XML node whose children are item nodes
*/
LmList.prototype.set = 
function(respNode) {
	this.clear();
	var nodes = respNode.childNodes;
	var args = {appCtxt: this._appCtxt, list: this, addressHash: new Object()};
	for (var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		if (node.nodeName == LmList.NODE[this.type]) {
			/// TODO: take this out, let view decide whether to show items in Trash
			if (parseInt(node.getAttribute("l")) == LmFolder.ID_TRASH && (this.type != LmItem.CONTACT))
				continue;
			this.add(LmList.ITEM_CLASS[this.type].createFromDom(node, args));
		}
	}
}

/**
* Adds an item to the list from the given XML node.
*
* @param node	an XML node
* @param args	an optional list of arguments to pass to the item's creation function
*/
LmList.prototype.addFromDom = 
function(node, args) {
	if (!args) args = new Object();
	args.appCtxt = this._appCtxt;
	args.list = this;
	this.add(LmList.ITEM_CLASS[this.type].createFromDom(node, args));
}

/**
* Sets/unsets a flag for each of a list of items.
*
* @param items		a list of items to set/unset a flag for
* @param flagOp		the name of the flag operation ("flag" or "read")
* @param on			whether to set the flag
*/
LmList.prototype.flagItems =
function(items, flagOp, on) {
	var itemMode = false;
	if (items instanceof LmItem) {
		items = [items];
		itemMode = true;
	}
	
	var action = on ? flagOp : "!" + flagOp;
	var flaggedItems = this._itemAction(items, action);
	if (flaggedItems.length) {
		var flag = LmItem.FLAG_FLAGGED;
		if (flagOp == "read") {
			flag = LmItem.FLAG_UNREAD;
			on = !on;
		}
		this.flagLocal(flaggedItems, flag, on);
		for (var i = 0; i < flaggedItems.length; i++)
			flaggedItems[i].flagLocal(flag, on);
		this._eventNotify(LmEvent.E_FLAGS, flaggedItems, {flags: [flag]}, itemMode);
	}
}

/**
* Tags or untags a list of items. A sanity check is done first, so that items
* aren't tagged redundantly, and so we don't try to remove a nonexistent tag.
*
* @param items		a list of items to tag/untag
* @param tagId		the tag to add/remove from each item
* @param doTag		true if adding the tag, false if removing it
*/
LmList.prototype.tagItems =
function(items, tagId, doTag) {
	var itemMode = false;
	if (items instanceof LmItem) {
		items = [items];
		itemMode = true;
	}
	
	// only tag items that don't have the tag, and untag ones that do
	var items1 = new Array();
	for (var i = 0; i < items.length; i++)
		if ((doTag && !items[i].hasTag(tagId)) || (!doTag && items[i].hasTag(tagId)))
			items1.push(items[i]);
	
	if (items1.length) {
		var action = doTag ? "tag" : "!tag";
		var taggedItems = this._itemAction(items1, action, {tag: tagId});
		if (taggedItems.length) {
			this.tagLocal(taggedItems, tagId, doTag);
			for (var i = 0; i < taggedItems.length; i++)
				taggedItems[i].tagLocal(tagId, doTag);
			this._eventNotify(LmEvent.E_TAGS, taggedItems, {tag: tagId, add: doTag}, itemMode);
		}
	}
}

LmList.prototype.removeAllTags = 
function(items) {
	
	var itemMode = false;
	if (items instanceof LmItem) {
		items = [items];
		itemMode = true;
	}

	var removedItems = this._itemAction(items, "update", {t: ""});
	if (removedItems.length) {
		this.removeAllTagsLocal(removedItems);
		for (var i = 0; i < removedItems.length; i++) {
			removedItems[i].removeAllTagsLocal();
		}
		this._eventNotify(LmEvent.E_REMOVE_ALL, removedItems, null, itemMode);
	}
}

/**
* Moves a list of items to the given folder. Any item already in that folder is excluded.
* <p>
* Search results are treated as though they're in a temporary folder, so that they behave as
* they would if they were in any other folder such as Inbox. When items that are part of search
* results are moved, they will disappear from the view, even though they may still satisfy the
* search.</p>
*
* @param items		a list of items to move
* @param folder		destination folder
*/
LmList.prototype.moveItems =
function(items, folder) {
	var itemMode = false;
	if (items instanceof LmItem) {
		items = [items];
		itemMode = true;
	}
	
	var items1 = new Array();
	for (var i = 0; i < items.length; i++)
		if (!items[i].folderId || (items[i].folderId != folder.id))
			items1.push(items[i]);

	var movedItems = this._itemAction(items1, "move", {l: folder.id});
	if (movedItems.length) {
		this.moveLocal(movedItems, folder.id);
		for (var i = 0; i < movedItems.length; i++)
			movedItems[i].moveLocal(folder.id);
		this._eventNotify(LmEvent.E_MOVE, movedItems, null, itemMode);
	}
}

/**
* Deletes one or more items from the list. Normally, deleting an item just
* moves it to the Trash (soft delete). However, if it's already in the Trash,
* it will be removed from the data store (hard delete).
*
* @param items			list of items to delete
* @param hardDelete		whether to force physical removal of items
*/
LmList.prototype.deleteItems =
function(items, hardDelete) {
	var itemMode = false;
	if (items instanceof LmItem) {
		items = [items];
		itemMode = true;
	}
	
	// figure out which items should be moved to Trash, and which should actually be deleted
	var toMove = new Array();
	var toDelete = new Array();	
	for (var i = 0; i < items.length; i++) {
		if (hardDelete || items[i].folderId == LmFolder.ID_TRASH)
			toDelete.push(items[i]);
		else
			toMove.push(items[i]);
	}

	// move (soft delete)
	if (toMove.length)
		this.moveItems(toMove, this._appCtxt.getFolderTree().getById(LmFolder.ID_TRASH));

	// hard delete - items actually deleted from data store
	if (toDelete.length) {
		var deletedItems = this._itemAction(toDelete, "delete");
		if (deletedItems.length) {
			this.deleteLocal(deletedItems);
			for (var i = 0; i < deletedItems.length; i++)
				deletedItems[i].deleteLocal();
			this._eventNotify(LmEvent.E_DELETE, deletedItems, null, itemMode);
		}
	}
}

/**
* Applies the given list of modifications to the items. Currently, we can only
* modify one item at a time.
*
* @param items			list of items to delete
* @param mods			whether to force physical removal of items
*/
LmList.prototype.modifyItems =
function(items, mods) {
	var itemMode = false;
	if (items instanceof LmItem) {
		items = [items];
		itemMode = true;
	}
	
	for (var i = 0; i < items.length; i++) {
		var details = items[i].modify(mods);
		if (details) {
			this._eventNotify(LmEvent.E_MODIFY, items, details, itemMode);
			this.modifyLocal(items[i], details);
		}
	}
}

// returns a vector containing a subset of items of this list
LmList.prototype.getSubList = 
function(offset, limit) {
	var subVector = null;
	var end = (offset + limit > this.size()) ? this.size() : offset + limit;
	var subList = this.getArray();
	if (offset < end)
		subVector = LsVector.fromArray(subList.slice(offset, end));
	return subVector;
}

LmList.prototype.cache = 
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
}

LmList.prototype._itemAction =
function(items, action, attrs) {
	if (this.type == LmList.MIXED)
		return this._mixedItemAction(items, action, attrs);
	else
		return this._singleItemAction(items, action, attrs);
}


LmList.prototype._singleItemAction =
function(items, action, attrs, type) {
	if (!type) type = this.type;

	var actionedItems = new Array();
	var idHash = this._getIds(items);
	var idStr = idHash.list.join(",");;
	if (!(idStr && idStr.length))
		return actionedItems;

	var soapCmd = LmItem.SOAP_CMD[type] + "Request";
	var soapDoc = LsSoapDoc.create(soapCmd, "urn:liquidMail");
	var actionNode = soapDoc.set("action");
	actionNode.setAttribute("id", idStr);
	actionNode.setAttribute("op", action);
	for (var attr in attrs)
		actionNode.setAttribute(attr, attrs[attr]);
	var appCtlr = this._appCtxt.getAppController();
	appCtlr.setActionedIds(idHash.list.concat(idHash.extra));
	var resp = appCtlr.sendRequest(soapDoc)[LmItem.SOAP_CMD[type] + "Response"];
	var ids = resp.action.id.split(",");
	if (ids) {
		for (var i = 0; i < ids.length; i++) {
			var item = idHash[ids[i]];
			if (item) {
				actionedItems.push(item);
			}
		}
	}

	return actionedItems;
}

LmList.prototype._mixedItemAction =
function(items, action, attrs) {
	var lists = new Object();
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		var type = item.type;
		if (!lists[type]) lists[type] = new LmList(type, this._appCtxt);
		lists[type].add(item);
	}
	
	var allActionedItems = new Array();
	for (var type in lists) {
		var list = lists[type];
		if (list.size()) {
			var actionedItems = this._singleItemAction(lists[type].getArray(), action, attrs, type);
			allActionedItems = allActionedItems.concat(actionedItems);
		}
	}
	return allActionedItems;
}

LmList.prototype.notifyCreate =
function(node) {
	var item = LmList.ITEM_CLASS[this.type].createFromDom(node, {appCtxt: this._appCtxt, list: this});
	this.add(item, this._sortIndex(item));
	this.createLocal(item);
	this._eventNotify(LmEvent.E_CREATE, [item]);
}

LmList.prototype.notifyDelete =
function(ids) {
	var deleted = new Array();
	for (var i = 0; i < ids.length; i++) {
		var item = this.getById(ids[i]);
		if (item) {
			item.deleteLocal();
			this.remove(item);
			deleted.push(item);
		}
	}
	if (deleted.length)
		this._eventNotify(LmEvent.E_DELETE, deleted);
}

// These generic methods allow a derived class to perform the appropriate internal changes
LmList.prototype.flagLocal 			= function(items, flag, state) {}
LmList.prototype.tagLocal 			= function(items, tag, state) {}
LmList.prototype.removeAllTagsLocal = function(items) {}
LmList.prototype.modifyLocal 		= function(items, mods) {}
LmList.prototype.createLocal 		= function(item) {}

// default action is to remove each deleted item from this list
LmList.prototype.deleteLocal =
function(items) {
	for (var i = 0; i < items.length; i++)
		this.remove(items[i]);
}

// default action is to remove each moved item from this list
LmList.prototype.moveLocal = 
function(items, folder) {
	for (var i = 0; i < items.length; i++)
		this.remove(items[i]);
}

// Notify listeners on this list of a model change.
LmList.prototype._eventNotify =
function(event, items, details, itemMode) {
	if (itemMode)
		items[0]._eventNotify(event, details);

	if (items.length && this._evtMgr.isListenerRegistered(LmEvent.L_MODIFY)) {
		this._evt.set(event, this);
		this._evt.setDetails(details);
		this._evt.setDetail("items", items);
		this._evtMgr.notifyListeners(LmEvent.L_MODIFY, this._evt);
	}
}

// Grab the IDs out of a list of items, and return them as both a string and a hash.
LmList.prototype._getIds =
function(list) {
	var idHash = new Object();
	if (!(list && list.length))
		return idHash;
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
		if ((item.type == LmItem.MSG) && item.cid && (item.cid > 0))
			extra.push(item.cid);
	}
	idHash.list = ids;
	idHash.extra = extra;

	return idHash;
}

// Returns the index at which the given item should be inserted into this list.
// Subclasses should override to return a meaningful value.
LmList.prototype._sortIndex = 
function(item) {
	return 0;
}
