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
 * Creates a stack of undoable actions (ZmAction objects)
 *
 * @param	{int}	[maxLength]		The maximum size of the stack. Defaults to 0, meaning no limit
 *
 * Adding actions to a full stack will pop the oldest actions off
 */
ZmActionStack = function(maxLength) {
	this._stack = [];
	this._pointer = -1;
	this._maxLength = maxLength || 0; // 0 means no limit
};

ZmEvent.S_ACTION			= "ACTION";

ZmActionStack.validTypes	= [ZmId.ITEM_MSG, ZmId.ITEM_CONV, ZmId.ITEM_CONTACT, ZmId.ITEM_GROUP, ZmId.ORG_FOLDER]; // Set ZmActionStack.validTypes to false to allow all item types

ZmActionStack.prototype.toString = function() {
	return "ZmActionStack";
};

/**
 * Logs a raw action, interpreting the params and creates a ZmAction object that is pushed onto the stack and returned
 * 
 * @param {String}	op			operation to perform. Currently supported are "move", "trash", "spam" and "!spam"
 * @param {Hash}	[attrs] 	attributes for the operation. Pretty much the same as what the backend expects, e.g. "l" for the destination folderId of a move

 * @param {String}	[items] 	array of items to perform the action for. Valid types are specified in ZmActionStack.validTypes. Only one of [items],[item],[ids] or [id] should be specified; the first one found is used, ignoring the rest.
 * @param {String}	[item] 		item to perform the action for, if there is only one item. Accomplishes the same as putting the item in an array and giving it as [items]
 * @param {String}	[ids] 		array of ids of items to perform the action for.
 * @param {String}	[id] 		id of item to perform the action for, if there is only one. Accomplishes the same as putting the id in an array and giving it as [ids].
 */
ZmActionStack.prototype.logAction = function(params) {
	var op = params.op;
	var items = [];
	if (params.items) {
		for (var i=0; i<params.items.length; i++) {
			var item = params.items[i];
			if (item && (!ZmActionStack.validTypes || AjxUtil.indexOf(ZmActionStack.validTypes, item.type)!=-1)) {
				items.push(item);
			}
		}
	} else if (params.item) {
		if (params.item && (!ZmActionStack.validTypes || AjxUtil.indexOf(ZmActionStack.validTypes, params.item.type)!=-1)) {
			items.push(params.item);
		}
	} else if (params.ids) {
		for (var i=0; i<params.ids.length; i++) {
			var item = appCtxt.getById(params.ids[i]);
			if (item && (!ZmActionStack.validTypes || AjxUtil.indexOf(ZmActionStack.validTypes, item.type)!=-1)) {
				items.push(item);
			}
		}
	} else if (params.id) {
		var item = appCtxt.getById(params.id);
		if (item && (!ZmActionStack.validTypes || AjxUtil.indexOf(ZmActionStack.validTypes, item.type)!=-1)) {
			items.push(item);
		}
	}
	var attrs = params.attrs;
	var multi = items.length>1;

	var action = null;
	var folder;
	switch (op) {
		case "trash":
			folder = ZmFolder.ID_TRASH;
			break;
		case "spam":
			folder = ZmFolder.ID_SPAM;
			break;
		case "move":
		case "!spam":
			folder = attrs.l;
			break;
	}

	switch (op) {
		case "trash":
		case "move":
		case "spam":
		case "!spam":
			for (var i=0; i<items.length; i++) {
				var item = items[i];
				var moveAction;
				if (item instanceof ZmItem) {
					moveAction = new ZmItemMoveAction(item, item.getFolderId(), folder, op);
				} else if (item instanceof ZmOrganizer) {
					moveAction = new ZmOrganizerMoveAction(item, item.parent.id, folder, op);
				}
				if (moveAction) {
					if (multi) {
						if (!action) action = new ZmCompositeAction();
						action.addAction(moveAction);
					} else {
						action = moveAction;
					}
				}
			}
			break;
	}
	if (action) {
		this._push(action);
	}

	return action;
};

/**
 * Returns whether there are actions that can be undone
 */
ZmActionStack.prototype.canUndo = function() {
	return this._pointer >= 0;
};

/**
 * Returns whether there are actions that can be redone
 */
ZmActionStack.prototype.canRedo = function() {
	return this._pointer < this._stack.length - 1;
};

/**
 * Undoes the current action (if applicable) and moves the internal pointer
 */
ZmActionStack.prototype.undo = function() {
	if (this.canUndo()) {
		var action = this._pop();
		action.undo();
	}
};

/**
 * Redoes the current action (if applicable) and moves the internal pointer
 */
ZmActionStack.prototype.redo = function() {
	if (this.canRedo()) {
		var action = this._stack[++this._pointer];
		action.redo();
	}
};

/**
 * Puts an action into the stack at the current position
 * If we're not at the top of the stack (ie. undoes have been performed), we kill all later actions (so redoing the undone actions is no longer possible)
 */
ZmActionStack.prototype._push = function(action) {
	if (action && action instanceof ZmAction) {
		var next = this._pointer + 1;
		while (this._maxLength && next>=this._maxLength) {
			// Stack size is reached, shift off actions until we're under the limit
			this._stack.shift();
			next--;
		}
		this._stack[next] = action;
		this._stack.length = next+1; // Kill all actions after pointer
		this._pointer = next;
	}
};

/**
 * Returns the action at the current position and moves the pointer
 */
ZmActionStack.prototype._pop = function() {
	return this.canUndo() ? this._stack[this._pointer--] : null;
};
