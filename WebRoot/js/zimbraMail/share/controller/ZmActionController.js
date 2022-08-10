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
 * Manages an undo stack (ZmActionStack) and the "Undo" toast messages
 * Optimally there should only be one object of this class, globally reachable
 */
ZmActionController = function() {

	this._actionStack = new ZmActionStack(1);
	this._statusTransitions = ZmActionController._substituteTransitions(appCtxt.getSkinHint("toast", "transitions") || ZmToast.DEFAULT_TRANSITIONS);
	this._outsideListener = new AjxListener(this, ZmActionController.prototype._outsideMouseDownListener);
	appCtxt.getKeyboardMgr().addListener(DwtEvent.ONKEYDOWN, this._outsideListener);
};

ZmActionController.prototype.toString =
function() {
	return "ZmActionController";
};

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
	var logElement = this._actionStack.logAction(params);
	if (logElement) {
		this.dismiss();
		logElement.onComplete(new AjxCallback(this, this._handleActionComplete));
	}
	return logElement;
};

ZmActionController.prototype._handleActionComplete = function(action) {
	this._active = true;
};

/**
 * Returns the HTML code for a link that will undo the specified action
 * @param	{ZmAction}	actionElement	undoable action to be called when the link is pressed
 * @param	{String}	[text]			optional custom text for the link body. Defaults to ZmMsg.undo
 */
ZmActionController.prototype.getUndoLink = function(actionElement, text) {
	if (actionElement instanceof ZmAction) {
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
	if (this._actionStack.canUndo()) {
		if (this._actionStack.actionIsComplete()) {
			if (this._active) {
				this.dismiss();
			}
			this._actionStack.undo();
		} else {
			this._actionStack.onComplete(new AjxCallback(this,function(action) {
				// We must call this.undo on a timeout to allow the status message to transition in before dismissing
				setTimeout(AjxCallback.simpleClosure(this.undo, this, action), 0);
			}));
		}
	}
};

ZmActionController.prototype.onPopup = function() {
	var omem = appCtxt.getOutsideMouseEventMgr();
	var omemParams = {
		id:					"ZmActionController",
		obj:				this,
		elementId:			ZmId.TOAST,
		outsideListener:	this._outsideListener
	}
	omem.startListening(omemParams);
};

/**
 * Dismisses the popped up toast
 */
ZmActionController.prototype.dismiss = function() {
	appCtxt.dismissStatusMsg(true);
	var omem = appCtxt.getOutsideMouseEventMgr();
	omem.stopListening("ZmActionController");
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
		if (callback instanceof AjxCallback) {
			callback.run();
		}
		else if (AjxUtil.isFunction(callback)) {
			callback();
		}
	}
};

ZmActionController.prototype._outsideMouseDownListener =
function(ev) {
	this.dismiss();
};
