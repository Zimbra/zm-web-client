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

/**
* Creates an empty list of items of the given type.
* @constructor
* @class
* This class represents a list of items (ZmItem objects). Any SOAP method that can be
* applied to a list of item IDs is represented here, so that we can perform an action
* on multiple items with just one CSFE call. For the sake of convenience, a hash 
* matching item IDs to items is maintained. Items are assumed to have an 'id'
* property.
*
* @author Conrad Damon
* @param type			item type
* @param appCtxt		the app context
*/
function ZmList(type, appCtxt) {

	if (arguments.length == 0) return;
	ZmModel.call(this, true);

	this.type = type;
	this._appCtxt = appCtxt;
	this.searchResults = null; // search results that generated this list
	
	this._vector = new AjxVector();
	this._hasMore = false;
	this._idHash = new Object();
	this._evt = new ZmEvent(type);

	var tagList = appCtxt.getTagList();
	if (tagList) {
		this._tagChangeListener = new AjxListener(this, this._tagTreeChangeListener);
		tagList.addChangeListener(this._tagChangeListener);
	}
}

ZmList.prototype = new ZmModel;
ZmList.prototype.constructor = ZmList;

// for item creation
ZmList.ITEM_CLASS = new Object();
ZmList.ITEM_CLASS[ZmItem.CONV] = ZmConv; 
ZmList.ITEM_CLASS[ZmItem.MSG] = ZmMailMsg;
ZmList.ITEM_CLASS[ZmItem.ATT] = ZmMimePart;
ZmList.ITEM_CLASS[ZmItem.CONTACT] = ZmContact;
ZmList.ITEM_CLASS[ZmItem.APPT] = ZmAppt;

// node names for item types
ZmList.NODE = new Object();
ZmList.NODE[ZmItem.CONV] = "c";
ZmList.NODE[ZmItem.MSG] = "m";
ZmList.NODE[ZmItem.ATT] = "mp";
ZmList.NODE[ZmItem.CONTACT] = "cn";

// item types based on node name
ZmList.ITEM_TYPE = new Object();
ZmList.ITEM_TYPE["c"] = ZmItem.CONV;
ZmList.ITEM_TYPE["m"] = ZmItem.MSG;
ZmList.ITEM_TYPE["mp"] = ZmItem.ATT;
ZmList.ITEM_TYPE["cn"] = ZmItem.CONTACT;

ZmList.TYPES = [ZmItem.CONTACT, ZmItem.CONV, ZmItem.MSG, ZmItem.ATT, ZmItem.APPT];
ZmList.MIXED = -1; // special type for heterogeneous list

ZmList.prototype.toString = 
function() {
	return "ZmList";
}

ZmList.prototype.addChangeListener = 
function(listener) {
	if (ZmModel.prototype.addChangeListener.call(this, listener))
		this._appCtxt.getAppController().addModel(this);	
}

ZmList.prototype.removeChangeListener = 
function(listener) {
	if (ZmModel.prototype.removeChangeListener.call(this, listener))
		if (!this._evtMgr.isListenerRegistered(ZmEvent.L_MODIFY))
			this._appCtxt.getAppController().removeModel(this);
}

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
}

/**
* Removes an item from the list.
*
* @param item	the item to remove
*/
ZmList.prototype.remove = 
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
ZmList.prototype.create =
function(args) {
	var item = new ZmList.ITEM_CLASS[this.type](this._appCtxt, this);
	item.create(args);

	return item;
}

/**
* Returns the number of items in the list.
*/
ZmList.prototype.size = 
function() {
	return this._vector.size();
}

/**
* Returns true if there are more items for this search.
*/
ZmList.prototype.hasMore = 
function() {
	return this._hasMore;
}

/**
* Sets the "more" flag for this list.
*
* @param bHasMore	whether there are more items
*/
ZmList.prototype.setHasMore = 
function(bHasMore) {
	this._hasMore = bHasMore;
}

/**
* Returns the list as an array.
*/
ZmList.prototype.getArray =
function() {
	return this._vector.getArray();
}

/**
* Returns the list as a AjxVector.
*/
ZmList.prototype.getVector =
function() {
	return this._vector;
}

/**
* Returns the item with the given ID.
*
* @param id		an item ID
*/
ZmList.prototype.getById =
function(id) {
	return this._idHash[id];
}

/**
* Clears the list, including its ID hash.
*/
ZmList.prototype.clear =
function() {
	// First, let each item run its clear() method
	var a = this.getArray();
	for (var i = 0; i < a.length; i++)
		a[i].clear();

	if (this._evtMgr.isListenerRegistered(ZmEvent.L_MODIFY))
		this._appCtxt.getAppController().removeModel(this);
	this._evtMgr.removeAll(ZmEvent.L_MODIFY);
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
ZmList.prototype.set = 
function(respNode) {
	this.clear();
	var nodes = respNode.childNodes;
	var args = {appCtxt: this._appCtxt, list: this, addressHash: new Object()};
	for (var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		if (node.nodeName == ZmList.NODE[this.type]) {
			/// TODO: take this out, let view decide whether to show items in Trash
			if (parseInt(node.getAttribute("l")) == ZmFolder.ID_TRASH && (this.type != ZmItem.CONTACT))
				continue;
			this.add(ZmList.ITEM_CLASS[this.type].createFromDom(node, args));
		}
	}
}

/**
* Adds an item to the list from the given XML node.
*
* @param node	an XML node
* @param args	an optional list of arguments to pass to the item's creation function
*/
ZmList.prototype.addFromDom = 
function(node, args) {
	if (!args) args = new Object();
	args.appCtxt = this._appCtxt;
	args.list = this;
	this.add(ZmList.ITEM_CLASS[this.type].createFromDom(node, args));
}

/**
* Sets/unsets a flag for each of a list of items.
*
* @param items		a list of items to set/unset a flag for
* @param flagOp		the name of the flag operation ("flag" or "read")
* @param on			whether to set the flag
*/
ZmList.prototype.flagItems =
function(items, flagOp, on) {
	var itemMode = false;
	if (items instanceof ZmItem) {
		items = [items];
		itemMode = true;
	}
	
	var action = on ? flagOp : "!" + flagOp;
	var flaggedItems = this._itemAction(items, action);
	if (flaggedItems.length) {
		var flag = ZmItem.FLAG_FLAGGED;
		if (flagOp == "read") {
			flag = ZmItem.FLAG_UNREAD;
			on = !on;
		}
		this.flagLocal(flaggedItems, flag, on);
		for (var i = 0; i < flaggedItems.length; i++)
			flaggedItems[i].flagLocal(flag, on);
		this._eventNotify(ZmEvent.E_FLAGS, flaggedItems, {flags: [flag]}, itemMode);
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
ZmList.prototype.tagItems =
function(items, tagId, doTag) {
	var itemMode = false;
	if (items instanceof ZmItem) {
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
			this._eventNotify(ZmEvent.E_TAGS, taggedItems, {tag: tagId, add: doTag}, itemMode);
		}
	}
}

ZmList.prototype.removeAllTags = 
function(items) {
	
	var itemMode = false;
	if (items instanceof ZmItem) {
		items = [items];
		itemMode = true;
	}

	var removedItems = this._itemAction(items, "update", {t: ""});
	if (removedItems.length) {
		this.removeAllTagsLocal(removedItems);
		for (var i = 0; i < removedItems.length; i++) {
			removedItems[i].removeAllTagsLocal();
		}
		this._eventNotify(ZmEvent.E_REMOVE_ALL, removedItems, null, itemMode);
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
* @param attrs		additional attrs for SOAP command
*/
ZmList.prototype.moveItems =
function(items, folder, attrs) {
	var itemMode = false;
	if (items instanceof ZmItem) {
		items = [items];
		itemMode = true;
	}
	
	var items1 = new Array();
	for (var i = 0; i < items.length; i++)
		if (!items[i].folderId || (items[i].folderId != folder.id))
			items1.push(items[i]);

	attrs = attrs ? attrs : new Object();
	attrs.l = folder.id;
	
	var movedItems = this._itemAction(items1, "move", attrs);
	if (movedItems.length) {
		this.moveLocal(movedItems, folder.id);
		for (var i = 0; i < movedItems.length; i++)
			movedItems[i].moveLocal(folder.id);
		this._eventNotify(ZmEvent.E_MOVE, movedItems, null, itemMode);
	}
}

/**
* Deletes one or more items from the list. Normally, deleting an item just
* moves it to the Trash (soft delete). However, if it's already in the Trash,
* it will be removed from the data store (hard delete).
*
* @param items			list of items to delete
* @param hardDelete		whether to force physical removal of items
* @param attrs			additional attrs for SOAP command
*/
ZmList.prototype.deleteItems =
function(items, hardDelete, attrs) {
	var itemMode = false;
	if (items instanceof ZmItem) {
		items = [items];
		itemMode = true;
	}
	
	// figure out which items should be moved to Trash, and which should actually be deleted
	var toMove = new Array();
	var toDelete = new Array();	
	for (var i = 0; i < items.length; i++) {
		var folderId = items[i].getFolderId();
		var folder = this._appCtxt.getFolderTree().getById(folderId);
		if (hardDelete || (folder && folder.isInTrash()))
			toDelete.push(items[i]);
		else
			toMove.push(items[i]);
	}

	// move (soft delete)
	if (toMove.length)
		this.moveItems(toMove, this._appCtxt.getFolderTree().getById(ZmFolder.ID_TRASH), attrs);

	// hard delete - items actually deleted from data store
	if (toDelete.length) {
		var deletedItems = this._itemAction(toDelete, "delete", attrs);
		if (deletedItems.length) {
			this.deleteLocal(deletedItems);
			for (var i = 0; i < deletedItems.length; i++)
				deletedItems[i].deleteLocal();
			this._eventNotify(ZmEvent.E_DELETE, deletedItems, null, itemMode);
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
ZmList.prototype.modifyItems =
function(items, mods) {
	var itemMode = false;
	if (items instanceof ZmItem) {
		items = [items];
		itemMode = true;
	}
	
	for (var i = 0; i < items.length; i++) {
		var details = items[i].modify(mods);
		if (details) {
			this._eventNotify(ZmEvent.E_MODIFY, items, details, itemMode);
			this.modifyLocal(items[i], details);
		}
	}
}

// returns a vector containing a subset of items of this list
ZmList.prototype.getSubList = 
function(offset, limit) {
	var subVector = null;
	var end = (offset + limit > this.size()) ? this.size() : offset + limit;
	var subList = this.getArray();
	if (offset < end)
		subVector = AjxVector.fromArray(subList.slice(offset, end));
	return subVector;
}

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
}

ZmList.prototype._itemAction =
function(items, action, attrs) {
	if (this.type == ZmList.MIXED)
		return this._mixedItemAction(items, action, attrs);
	else
		return this._singleItemAction(items, action, attrs);
}


ZmList.prototype._singleItemAction =
function(items, action, attrs, type) {
	if (!type) type = this.type;

	var actionedItems = new Array();
	var idHash = this._getIds(items);
	var idStr = idHash.list.join(",");;
	if (!(idStr && idStr.length))
		return actionedItems;

	var soapCmd = ZmItem.SOAP_CMD[type] + "Request";
	var soapDoc = AjxSoapDoc.create(soapCmd, "urn:zimbraMail");
	var actionNode = soapDoc.set("action");
	actionNode.setAttribute("id", idStr);
	actionNode.setAttribute("op", action);
	for (var attr in attrs)
		actionNode.setAttribute(attr, attrs[attr]);
	var appCtlr = this._appCtxt.getAppController();
	appCtlr.setActionedIds(idHash.list.concat(idHash.extra));
	var resp = appCtlr.sendRequest(soapDoc)[ZmItem.SOAP_CMD[type] + "Response"];
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

ZmList.prototype._mixedItemAction =
function(items, action, attrs) {
	var lists = new Object();
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		var type = item.type;
		if (!lists[type]) lists[type] = new ZmList(type, this._appCtxt);
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

ZmList.prototype.notifyCreate =
function(node) {
	var item = ZmList.ITEM_CLASS[this.type].createFromDom(node, {appCtxt: this._appCtxt, list: this});
	this.add(item, this._sortIndex(item));
	this.createLocal(item);
	this._eventNotify(ZmEvent.E_CREATE, [item]);
}

ZmList.prototype.notifyDelete =
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
		this._eventNotify(ZmEvent.E_DELETE, deleted);
}

// These generic methods allow a derived class to perform the appropriate internal changes
ZmList.prototype.flagLocal 			= function(items, flag, state) {}
ZmList.prototype.tagLocal 			= function(items, tag, state) {}
ZmList.prototype.removeAllTagsLocal = function(items) {}
ZmList.prototype.modifyLocal 		= function(items, mods) {}
ZmList.prototype.createLocal 		= function(item) {}

// default action is to remove each deleted item from this list
ZmList.prototype.deleteLocal =
function(items) {
	for (var i = 0; i < items.length; i++)
		this.remove(items[i]);
}

// default action is to remove each moved item from this list
ZmList.prototype.moveLocal = 
function(items, folder) {
	for (var i = 0; i < items.length; i++)
		this.remove(items[i]);
}

// Notify listeners on this list of a model change.
ZmList.prototype._eventNotify =
function(event, items, details, itemMode) {
	if (itemMode)
		items[0]._eventNotify(event, details);

	if (items.length && this._evtMgr.isListenerRegistered(ZmEvent.L_MODIFY)) {
		this._evt.set(event, this);
		this._evt.setDetails(details);
		this._evt.setDetail("items", items);
		this._evtMgr.notifyListeners(ZmEvent.L_MODIFY, this._evt);
	}
}

// Grab the IDs out of a list of items, and return them as both a string and a hash.
ZmList.prototype._getIds =
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
		if ((item.type == ZmItem.MSG) && item.cid && (item.cid > 0))
			extra.push(item.cid);
	}
	idHash.list = ids;
	idHash.extra = extra;

	return idHash;
}

// Returns the index at which the given item should be inserted into this list.
// Subclasses should override to return a meaningful value.
ZmList.prototype._sortIndex = 
function(item) {
	return 0;
}

ZmList.prototype._tagTreeChangeListener = 
function(ev) {
	if (ev.type != ZmEvent.S_TAG) return;

	if (ev.event == ZmEvent.E_DELETE) {
		// Remove tag from any items that have it
		var tag = ev.source;
		var a = this.getArray();
		var taggedItems = new Array();
		for (var i = 0; i < a.length; i++) {
			var item = a[i];
			if (item && item.hasTag(tag.id)) {
				item.tagLocal(tag.id, false);
				taggedItems.push(item);
			}
		}
		// Send listeners a tag event so they'll notice it's gone
		if (taggedItems.length && this._evtMgr.isListenerRegistered(ZmEvent.L_MODIFY)) {
			this._eventNotify(ZmEvent.E_TAGS, taggedItems);
		}
	}
}
