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
 * Manages an undo stack (ZmActionStack) and the "Undo" toast messages
 * Optimally there should only be one object of this class, globally reachable
 */
ZmActionController = function() {
	this._actionStack = new ZmActionStack(1);
	this._statusTransitions = ZmActionController._substituteTransitions(appCtxt.getSkinHint("toast", "transitions") || ZmToast.DEFAULT_TRANSITIONS);
};

ZmActionController.prototype.toString =
function() {
	return "ZmActionController";
}

/**
 * Logs a raw action, dismissing any current undo message, interpreting the params and creates a ZmAction object that is pushed onto the stack and returned
 * See also @link ZmActionStack.prototype.logAction
 * 
 * @param {String}	op			operation to perform. Currently supported are "move", "trash", "spam" and "!spam"
 * @param {Hash}	[attrs] 	attributes for the operation. Pretty much the same as what the backend expects, e.g. "l" for the destination folderId of a move

 * @param {String}	[items] 	array of items to perform the action for. Valid types are specified in ZmActionStack.validTypes. Only one of [items],[item],[ids] or [id] should be specified; the first one found is used, ignoring the rest.
 * @param {String}	[item] 		item to perform the action for, if there is only one item. Accomplishes the same as putting the item in an array and giving it as [items]
 * @param {String}	[ids] 		array of ids of items to perform the action for.
 * @param {String}	[id] 		id of item to perform the action for, if there is only one. Accomplishes the same as putting the id in an array and giving it as [ids].
 */
ZmActionController.prototype.actionPerformed = function(params) {
	this.dismiss();
	var logElement = this._actionStack.logAction(params);
	if (logElement) {
		this._active = true;
	}
	return logElement;
};

/**
 * Returns the HTML code for a link that will undo the specified action
 * @param	{ZmAction}	actionElement	undoable action to be called when the link is pressed
 * @param	{String}	[text]			optional custom text for the link body. Defaults to ZmMsg.undo
 */
ZmActionController.prototype.getUndoLink = function(actionElement, text) {
	if (actionElement instanceof ZmAction) {
		//var undoId = ZmActionController._registerCallback(new AjxCallback(this, this.undo, actionElement));
		var undoId = ZmActionController._registerCallback(new AjxCallback(this, this.undoCurrent));
		return ["<a onclick='ZmActionController.callRegisteredCallback(",undoId,")' href='javascript:;' class='undo'>", text || ZmMsg.undo, "</a>"].join("");
	} else return ""; // We can't risk displaying "null" or "undefined" wherever this function is called from, and an empty string is just as falsy
};

ZmActionController.prototype.getStatusTransitions = function() {
	return this._statusTransitions;
};

/**
 * Undoes the specified action
 * @param	{ZmAction}	action	the action to undo
 */
ZmActionController.prototype.undo = function(action) {
	if (this._active) {
		this.dismiss();
		action.undo();
	}
};

ZmActionController.prototype.undoCurrent = function() {
	if (this._active) {
		this.dismiss();
	}
	this._actionStack.undo();
};

/**
 * Dismisses the popped up toast
 */
ZmActionController.prototype.dismiss = function() {
	if (this._active) {
		appCtxt.dismissStatusMsg(); // If we're active (an undoable action has been performed and we're showing the toast), clear one holding off the toast
	}
	this._active = false;
};

/**
 * Substitute "pause" for "hold" and make sure there's only one of them
 * @param	{Array}		transitions		Array of ZmToast transitions to copy from. Values are copied to the returned array
 */
ZmActionController._substituteTransitions = function(transitions) {
	var newTransitions = [];
	var seenOne = false;
	for (var i=0; i<transitions.length; i++) {
		var transition = transitions[i];
		if (transition) {
			if (transition.type == ZmToast.PAUSE.type) {
				if (!seenOne) {
					seenOne = true;
					newTransitions.push(ZmToast.HOLD);
				}
			} else {
				newTransitions.push(transition);
			}
		}
	}
	return newTransitions;
};



ZmActionController._registeredCallbacks = [];

ZmActionController._registerCallback = function(callback) {
	var id = ZmActionController._registeredCallbacks.length;
	ZmActionController._registeredCallbacks[id] = callback;
	return id;
};

ZmActionController.callRegisteredCallback = function(id) {
	var callback = ZmActionController._registeredCallbacks[id];
	if (callback) {
		if (callback instanceof AjxCallback)
			callback.run();
		else if (AjxUtil.isFunction(callback))
			callback();
	}
};
