/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2010, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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

ZmActionStack.validTypes	= [ZmId.ORG_FOLDER, ZmId.ITEM_MSG, ZmId.ITEM_CONV,
                               ZmId.ITEM_CONTACT, ZmId.ITEM_GROUP,
                               ZmId.ITEM_BRIEFCASE, ZmId.ORG_BRIEFCASE,
                               ZmId.ITEM_TASK, ZmId.ORG_TASKS
                              ]; // Set ZmActionStack.validTypes to false to allow all item types

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

	var op = params.op,
	    items = [];

	if (params.items) {
		for (var i = 0; i < params.items.length; i++) {
			var item = params.items[i];
			if (item && this._isValidType(item.type)) {
				items.push(item);
			}
		}
	}
	else if (params.item) {
		if (params.item && this._isValidType(params.item.type)) {
			items.push(params.item);
		}
	}
	else if (params.ids) {
		for (var i = 0; i < params.ids.length; i++) {
			var item = appCtxt.getById(params.ids[i]);
			if (item && this._isValidType(item.type)) {
				items.push(item);
			}
		}
	}
	else if (params.id) {
		var item = appCtxt.getById(params.id);
		if (item && this._isValidType(item.type)) {
			items.push(item);
		}
	}

	var attrs = params.attrs;

	// for a conv, create a list of undoable msg moves so msgs can be restored to their disparate original folders
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		if (item.type === ZmItem.CONV) {
			var tcon = attrs && attrs.tcon;
			for (var msgId in item.msgFolder) {
				var folderId = item.msgFolder[msgId],
					tconCode = ZmFolder.TCON_CODE[folderId];

				// if tcon kept us from moving a msg, no need to undo it
				if (!tcon || tcon.indexOf(tconCode) === -1) {
					items.push({
						isConvMsg:  true,
						id:         msgId,
						type:       ZmItem.MSG,
						folderId:   folderId,
						list:       { type: ZmItem.MSG }    // hack to expose item.list.type
					});
				}
			}
		}
	}

	var multi = items.length > 1;

	var action = null;
	var folderId;
	switch (op) {
		case "trash":
			folderId = ZmFolder.ID_TRASH;
			break;
		case "spam":
			folderId = ZmFolder.ID_SPAM;
			break;
		case "move":
		case "!spam":
			folderId = attrs.l;
			break;
	}

	var folder = appCtxt.getById(folderId);
	if (folder && !folder.isRemote()) { // Enable undo only when destination folder exists (it should!!) and is not remote (bug #51656)
		switch (op) {
			case "trash":
			case "move":
			case "spam":
			case "!spam":
				for (var i = 0; i < items.length; i++) {
					var item = items[i];
					var moveAction;
				
					if (item instanceof ZmItem) {
						if (!item.isShared()) { // Moving shared items is not undoable
							moveAction = new ZmItemMoveAction(item, item.getFolderId(), folderId, op);
						}
					}
					else if (item instanceof ZmOrganizer) {
						if (!item.isRemote()) { // Moving remote organizers is not undoable
							moveAction = new ZmOrganizerMoveAction(item, item.parent.id, folderId, op);
						}
					}
					else if (item.isConvMsg) {
						if (!appCtxt.isRemoteId(item.id)) {
							moveAction = new ZmItemMoveAction(item, item.folderId, folderId, op);
						}
					}
					if (moveAction) {
						if (multi) {
							if (!action) action = new ZmCompositeAction(folderId);
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
 * Returns whether the next undo action has completed
 */
ZmActionStack.prototype.actionIsComplete = function() {
	return this.canUndo() && this._current().getComplete();
};

/**
 * Attaches a completion callback to the current action
 */
ZmActionStack.prototype.onComplete = function(callback) {
	var action = this._current();
	if (action) {
		action.onComplete(callback);
	}
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

/**
 * Returns the action at the current position, does not move the pointer
 */
ZmActionStack.prototype._current = function() {
	return this.canUndo() ? this._stack[this._pointer] : null;
};

/**
 * Returns true if the given type is valid.
 */
ZmActionStack.prototype._isValidType = function(type) {
	return !ZmActionStack.validTypes || AjxUtil.indexOf(ZmActionStack.validTypes, type) !== -1;
};
