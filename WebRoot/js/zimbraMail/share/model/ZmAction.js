/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
	//override me"
};

ZmAction.prototype.setComplete = function() {
	this._complete = true;
	this._notify(ZmEvent.E_COMPLETE);
};

ZmAction.prototype.getComplete = function() {
	return this._complete;
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
	this._item.list.moveItems({
		items: [this._item],
		folder: appCtxt.getById(folderId),
		undoing: true,
		finalCallback: new AjxCallback(this, this._handleDoMove, this._item.folderId),
		actionText: ZmItemMoveAction.UNDO_MSG[this._op]
	});
};

ZmItemMoveAction.prototype._handleDoMove = function(oldFolderId, params) {
	var lists = [];
	for (var id in params.idHash) {
		var item = params.idHash[id];
		var list = item && item.list;
		if (AjxUtil.indexOf(lists, list)==-1)
			lists.push(list);
	}
	for (var i=0; i<lists.length; i++) {
		lists[i]._notify(ZmEvent.E_MOVE, {oldFolderId:oldFolderId});
	}
	ZmList.killProgressDialog(params.actionSummary);
};

ZmItemMoveAction.prototype.undo = function(callback, errorCallback) {
	this._doMove(callback, errorCallback, this._fromFolderId);
};

ZmItemMoveAction.prototype.redo = function(callback, errorCallback) {
	this._doMove(callback, errorCallback, this._toFolderId);
};

ZmItemMoveAction.multipleUndo = function(actions, redo) {
	var ftTable = {};
	for (var i=0; i<actions.length; i++) {
		var action = actions[i];
		if (action instanceof ZmItemMoveAction) {
			var from = action.getFromFolderId();
			var to = action.getToFolderId();
			if (!ftTable[from]) ftTable[from] = {};
			if (!ftTable[from][to]) ftTable[from][to] = [];
			ftTable[from][to].push(action);
		}
	}
	for (var from in ftTable) {
		for (var to in ftTable[from]) {
			var subset = ftTable[from][to];
			var items = [];
			var list;
			var commonop;
			for (var i=0; i<subset.length; i++) {
				var action = subset[i];
				var item = action.getItem();
				items.push(item);
				if (!list && item.list) list = item.list;
				var op = action.getOp && action.getOp();
				if (!commonop)
					commonop = op;
				else if (commonop != op)
					commonop = "move";
			}
			if (list) {
				list.moveItems({
					items: items,
					folder: appCtxt.getById(redo ? to : from),
					undoing: true,
					actionText: commonop && ZmItemMoveAction.UNDO_MSG[commonop]
				});
			}
		}
	}
};

ZmItemMoveAction.multipleRedo = function(actions) {
	ZmItemMoveAction.multipleUndo(actions, true);
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
	if (folder)
		this._organizer.move(folder, true);
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

ZmCompositeAction = function() {
	ZmAction.call(this);
	this._actions = {};
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
		ZmItemMoveAction.multipleUndo(this.getActions(ZmAction.ACTION_ZMITEMMOVEACTION));
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
