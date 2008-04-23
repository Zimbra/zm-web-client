/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
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
 * Creates a new appointment controller to manage appointment creation/editing.
 * @constructor
 * @class
 * This class manages appointment creation/editing.
 *
 * @author Parag Shah
 *
 * @param container	[DwtComposite]	the containing element
 * @param calApp	[ZmApp]			a handle to the [calendar|task] application
 */
ZmTaskController = function(container, app) {
	if (arguments.length == 0) { return; }
	ZmCalItemComposeController.call(this, container, app);
};

ZmTaskController.prototype = new ZmCalItemComposeController;
ZmTaskController.prototype.constructor = ZmTaskController;

ZmTaskController.prototype.toString =
function() {
	return "ZmTaskController";
};

// Public methods

ZmTaskController.prototype.saveCalItem =
function(attId) {
	var calItem = this._composeView.getCalItem(attId);
	if (calItem) {
		this._saveCalItemFoRealz(calItem, attId);
	}
	return true;
};

ZmTaskController.prototype._handleResponseSave =
function(calItem) {
	ZmCalItemComposeController.prototype._handleResponseSave.call(this, calItem);

	// XXX: null out message so we re-fetch task next time its opened
	// To optimize, we should save the modified contents into cache'd task item
	if (calItem && calItem._orig)
		calItem._orig.message = null;

	appCtxt.setStatusMsg(ZmMsg.taskSaved);
};

ZmTaskController.prototype._createComposeView =
function() {
	return (new ZmTaskEditView(this._container, this));
};

ZmTaskController.prototype._setComposeTabGroup =
function(setFocus) {
	var tg = this._createTabGroup();
	var rootTg = appCtxt.getRootTabGroup();
	tg.newParent(rootTg);
	tg.addMember(this._toolbar);
	this._composeView._addTabGroupMembers(tg);

	var focusItem = this._composeView || this._composeView._getDefaultFocusItem() || tg.getFirstMember(true);
	var ta = new AjxTimedAction(this, this._setFocus, [focusItem, !setFocus]);
	AjxTimedAction.scheduleAction(ta, 10);
};

ZmTaskController.prototype.getKeyMapName =
function() {
	return "ZmTaskController";
};


// Private / Protected methods


ZmTaskController.prototype._getViewType =
function() {
	return ZmId.VIEW_TASKEDIT;
};
