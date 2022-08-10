/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 */

/**
 * @class
 * Represents an undoable action (e.g. move an item)
 * This class is a generic superclass that does very little on its own; the real work is being done in subclasses
 * 
 * @extends		ZmModel
 */

ZmAction = function() {
	ZmModel.call(this, ZmEvent.S_ACTION);
	this._complete = false;
};

ZmAction.prototype = new ZmModel;
ZmAction.prototype.constructor = ZmAction;

ZmAction.ACTION_ZMACTION = "ZmAction";
ZmAction.ACTION_ZMITEMACTION = "ZmItemAction";
ZmAction.ACTION_ZMITEMMOVEACTION = "ZmItemMoveAction";
ZmAction.ACTION_ZMITEMTRASHACTION = "ZmItemTrashAction";
ZmAction.ACTION_ZMORGANIZERACTION = "ZmOrganizerAction";
ZmAction.ACTION_ZMORGANIZERMOVEACTION = "ZmOrganizerMoveAction";
ZmAction.ACTION_ZMCOMPOSITEACTION = "ZmCompositeAction";

ZmAction.prototype.type = ZmAction.ACTION_ZMITEMACTION;

ZmAction.prototype.toString = function() {
	return "ZmAction";
};

ZmAction.prototype.undo = function() {
	//override me
};

ZmAction.prototype.redo = function() {
	//override me
};

ZmAction.prototype.setComplete = function() {
	if (!this._complete) {
		this._complete = true;
		this._notify(ZmEvent.E_COMPLETE);
	}
};

ZmAction.prototype.getComplete = function() {
	return this._complete;
};

ZmAction.prototype.onComplete = function(callback) {
	if (this._complete) {
		callback.run(this);
	} else {
		this.addChangeListener(new AjxListener(this, this._handleComplete, [callback]));
	}
};

ZmAction.prototype._handleComplete = function(callback, event) {
	if (event.event===ZmEvent.E_COMPLETE) {
		callback.run(this);
	}
};

/**
 * @class
 * Represents an undoable action on an item
 * This class is a generic superclass that does very little on its own; the real work is being done in subclasses
 * 
 * @extends		ZmAction
 *
 * @param {ZmItem}	item	The item to perform the action on
 * @param {String}	op		The operation to perform (e.g. "move" or "trash")	
 */

ZmItemAction = function(item, op) {
	if (!arguments.length) return;
	ZmAction.call(this);
	this._item = item;
	this._op = op;
};

ZmItemAction.prototype = new ZmAction;
ZmItemAction.prototype.constructor = ZmItemAction;
ZmItemAction.prototype.type = ZmAction.ACTION_ZMITEMACTION;

ZmItemAction.prototype.toString = function() {
	return "ZmItemAction";
};

ZmItemAction.prototype.getItem = function() {
	return this._item;
};

ZmItemAction.prototype.getOp = function() {
	return this._op;
};

/**
 * @class
 * Represents an undoable action on an organizer
 * This class is a generic superclass that does very little on its own; the real work is being done in subclasses
 * 
 * @extends		ZmAction
 *
 * @param {ZmOrganizer}		organizer	The organizer to perform the action on
 * @param {String}			op			The operation to perform (e.g. "move")
 */

ZmOrganizerAction = function(organizer, op) {
	if (!arguments.length) return;
	ZmAction.call(this);
	this._organizer = organizer;
	this._op = op;
};

ZmOrganizerAction.prototype = new ZmAction;
ZmOrganizerAction.prototype.constructor = ZmOrganizerAction;
ZmOrganizerAction.prototype.type = ZmAction.ACTION_ZMORGANIZERACTION;

ZmOrganizerAction.prototype.toString = function() {
	return "ZmOrganizerAction";
};

ZmOrganizerAction.prototype.getOrganizer = function() {
	return this._organizer;
};

ZmOrganizerAction.prototype.getOp = function() {
	return this._op;
};

/**
 * @class
 * Represents an undoable move action on an item
 * 
 * @extends		ZmItemAction
 *
 * @param {ZmItem}	item			Item to perform the move on
 * @param {int}		fromFolderId	Original folder id of the item
 * @param {int}		toFolderId		Destination folder id of the item
 * @param {String}	op				The operation to perform (e.g. "move")
 */

ZmItemMoveAction = function(item, fromFolderId, toFolderId, op) {
	ZmItemAction.call(this, item, op);
	this._fromFolderId = fromFolderId;
	this._toFolderId = toFolderId;
};

ZmItemMoveAction.prototype = new ZmItemAction;
ZmItemMoveAction.prototype.constructor = ZmItemMoveAction;

ZmItemMoveAction.prototype.type = ZmAction.ACTION_ZMITEMMOVEACTION;

ZmItemMoveAction.prototype.toString = function() {
	return "ZmItemMoveAction";
};

ZmItemMoveAction.UNDO_MSG = {
	"move" : ZmMsg.actionUndoMove,
	"trash": ZmMsg.actionUndoTrash,
	"spam": ZmMsg.actionUndoMarkAsJunk,
	"!spam": ZmMsg.actionUndoMarkAsNotJunk
};

ZmItemMoveAction.prototype.getFromFolderId = function() {
	return this._fromFolderId;
};

ZmItemMoveAction.prototype.getToFolderId = function() {
	return this._toFolderId;
};

ZmItemMoveAction.prototype._doMove = function(callback, errorCallback, folderId) {

	var items = ZmItemMoveAction._realizeItems(this._item), // probably unnecessary since conv forces multipleUndo
		list = items[0] && items[0].list;

	list.moveItems({
		items:			items,
		folder:			appCtxt.getById(folderId),
		noUndo:			true,
		finalCallback:	this._handleDoMove.bind(this, this._item.folderId, folderId),
		fromFolderId:   this._toFolderId
	});
};

ZmItemMoveAction.prototype._handleDoMove = function(oldFolderId, newFolderId, params) {
	var lists = [];
	for (var id in params.idHash) {
		var item = params.idHash[id];
		if (item instanceof ZmConv)
			item.folderId = newFolderId;
		var list = item && item.list;
		if (AjxUtil.indexOf(lists, list)==-1)
			lists.push(list);
	}
	for (var i=0; i<lists.length; i++) {
		lists[i]._notify(ZmEvent.E_MOVE, {oldFolderId:oldFolderId});
	}
	ZmListController.handleProgress({state:ZmListController.PROGRESS_DIALOG_CLOSE});
	ZmBaseController.showSummary(params.actionSummary);
};

ZmItemMoveAction.prototype.undo = function(callback, errorCallback) {
	this._doMove(callback, errorCallback, this._fromFolderId);
};

ZmItemMoveAction.prototype.redo = function(callback, errorCallback) {
	this._doMove(callback, errorCallback, this._toFolderId);
};

ZmItemMoveAction.multipleUndo = function(actions, redo, fromFolderId) {

	var sortingTable = {};
	for (var i = 0; i < actions.length; i++) {
		var action = actions[i];
		if (action instanceof ZmItemMoveAction) {
			var from = action.getFromFolderId();
			var to = action.getToFolderId();
			var item = action.getItem();
			var type = (item && item.list && item.list.type) || 0;
			if (!sortingTable[from]) sortingTable[from] = {};
			if (!sortingTable[from][to]) sortingTable[from][to] = {};
			if (!sortingTable[from][to][type]) sortingTable[from][to][type] = [];
			sortingTable[from][to][type].push(action);
		}
	}

	for (var from in sortingTable) {
		for (var to in sortingTable[from]) {
			for (var type in sortingTable[from][to]) {
				var subset = sortingTable[from][to][type];
				var items = [];
				var list = null;
				for (var i = 0; i < subset.length; i++) {
					var action = subset[i];
					var item = action.getItem();
					items.push(item);
				}
				items = ZmItemMoveAction._realizeItems(items);
				list = items[0] && items[0].list;
				if (list) {
					list.moveItems({
						items:          items,
						folder:         appCtxt.getById(redo ? to : from),
						noUndo:         true,
						fromFolderId:   fromFolderId
					});
				}
			}
		}
	}
};

ZmItemMoveAction.multipleRedo = function(actions) {
	ZmItemMoveAction.multipleUndo(actions, true);
};

// Creates ZmMailMsg out of anonymous msg-like objects
ZmItemMoveAction._realizeItems = function(items) {

	var list, msg;
	return AjxUtil.map(AjxUtil.toArray(items), function(item) {
		if (item.isConvMsg) {
			list = list || new ZmMailList(ZmItem.MSG);
			msg = new ZmMailMsg(item.id, list, true);
			msg.folderId = item.folderId;
			return msg;
		}
		else {
			return item;
		}
	});
};

/**
 * @class
 * Represents an undoable move action on an organizer
 * 
 * @extends		ZmOrganizerAction
 *
 * @param {ZmOrganizer}	organizer		Organizer to perform the move on
 * @param {int}			fromFolderId	Original parent folder id of the organizer
 * @param {int}			toFolderId		Destination parent folder id of the organizer
 * @param {String}		op				The operation to perform (e.g. "move")
 */

ZmOrganizerMoveAction = function(organizer, fromFolderId, toFolderId, op) {
	ZmOrganizerAction.call(this, organizer, op);
	this._fromFolderId = fromFolderId;
	this._toFolderId = toFolderId;
};

ZmOrganizerMoveAction.prototype = new ZmOrganizerAction;
ZmOrganizerMoveAction.prototype.constructor = ZmOrganizerMoveAction;

ZmOrganizerMoveAction.prototype.type = ZmAction.ACTION_ZMORGANIZERMOVEACTION;

ZmOrganizerMoveAction.prototype.toString = function() {
	return "ZmOrganizerMoveAction";
};

ZmOrganizerMoveAction.prototype.getFromFolderId = function() {
	return this._fromFolderId;
};

ZmOrganizerMoveAction.prototype.getToFolderId = function() {
	return this._toFolderId;
};

ZmOrganizerMoveAction.prototype._doMove = function(callback, errorCallback, folderId) {
	var folder = appCtxt.getById(folderId);
	if (folder) {
		this._organizer.move(folder, true);
	}
};

ZmOrganizerMoveAction.prototype.undo = function(callback, errorCallback) {
	this._doMove(callback, errorCallback, this._fromFolderId);
};

ZmOrganizerMoveAction.prototype.redo = function(callback, errorCallback) {
	this._doMove(callback, errorCallback, this._toFolderId);
};

ZmOrganizerMoveAction.multipleUndo = function(actions, redo) {
	for (var i=0; i<actions.length; i++) {
		var action = actions[i];
		if (action instanceof ZmOrganizerMoveAction) {
			action._doMove(null, null, redo ? this._toFolderId : this._fromFolderId);
		}
	}
};

ZmOrganizerMoveAction.multipleRedo = function(actions) {
	ZmItemMoveAction.multipleUndo(actions, true);
};

/**
 * @class
 * Represents a collection of undoable actions that will be performed as a whole
 * 
 * @extends		ZmAction
 *
 */

ZmCompositeAction = function(toFolderId) {
	ZmAction.call(this);
	this._actions = {};
	this._toFolderId = toFolderId;
};

ZmCompositeAction.prototype = new ZmAction;
ZmCompositeAction.prototype.constructor = ZmCompositeAction;
ZmCompositeAction.prototype.type = ZmAction.ACTION_ZMCOMPOSITEACTION;

ZmCompositeAction.prototype.toString = function() {
	return "ZmCompositeAction";
};

/**
 * Add an action the the collection
 *
 * @param	{ZmAction}	action	An action to add
 */
ZmCompositeAction.prototype.addAction = function(action) {
	if (action && action!=this && action instanceof ZmAction) {
		var type = action.type;
		if (!this._actions[type])
			this._actions[type] = [];
		this._actions[type].push(action);
	}
};

ZmCompositeAction.prototype.getActions = function(type) {
	return this._actions[type] || [];
};

ZmCompositeAction.prototype.hasActions = function(type) {
	return this._actions[type] && this._actions[type].length>0;
};

ZmCompositeAction.prototype.undo = function(callback, errorCallback) {

	if (this.hasActions(ZmAction.ACTION_ZMITEMMOVEACTION)) {
		ZmItemMoveAction.multipleUndo(this.getActions(ZmAction.ACTION_ZMITEMMOVEACTION), null, this._toFolderId);
	}

	if (this.hasActions(ZmAction.ACTION_ZMORGANIZERMOVEACTION)) {
		ZmOrganizerMoveAction.multipleUndo(this.getActions(ZmAction.ACTION_ZMORGANIZERMOVEACTION));
	}

	if (this.hasActions(ZmAction.ACTION_ZMCOMPOSITEACTION) || this.hasActions(ZmAction.ACTION_ZMITEMACTION)) {
		var actions = this.getActions(ZmAction.ACTION_ZMCOMPOSITEACTION).concat(this.getActions(ZmAction.ACTION_ZMITEMACTION));
		for (var i=0; i<actions.length; i++) {
			actions[i].undo();
		}
	}
};

ZmCompositeAction.prototype.redo = function(callback, errorCallback) {

	if (this.hasActions(ZmAction.ACTION_ZMITEMMOVEACTION)) {
		ZmItemMoveAction.multipleRedo(this.getActions(ZmAction.ACTION_ZMITEMMOVEACTION));
	}

	if (this.hasActions(ZmAction.ACTION_ZMORGANIZERMOVEACTION)) {
		ZmOrganizerMoveAction.multipleRedo(this.getActions(ZmAction.ACTION_ZMORGANIZERMOVEACTION));
	}

	if (this.hasActions(ZmAction.ACTION_ZMCOMPOSITEACTION) || this.hasActions(ZmAction.ACTION_ZMITEMACTION) || this.hasActions(ZmAction.ACTION_ZMORGANIZERACTION)) {
		var actions = this.getActions(ZmAction.ACTION_ZMCOMPOSITEACTION).concat(this.getActions(ZmAction.ACTION_ZMITEMACTION)).concat(this.getActions(ZmAction.ACTION_ZMORGANIZERACTION));
		for (var i=0; i<actions.length; i++) {
			actions[i].redo();
		}
	}
};
