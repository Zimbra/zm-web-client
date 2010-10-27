/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * This file contains the task controller class.
 * 
 */

/**
 * Creates a new appointment controller to manage appointment creation/editing.
 * @class
 * This class manages appointment creation/editing.
 *
 * @author Parag Shah
 *
 * @param {DwtComposite}	container	the containing element
 * @param {ZmApp}	app	a handle to the [{@link ZmCalendarApp}|{@link ZmTasksApp}] application
 * 
 * @extends		ZmCalItemComposeController
 */
ZmTaskController = function(container, app) {
	if (arguments.length == 0) { return; }
	ZmCalItemComposeController.call(this, container, app);
};

ZmTaskController.prototype = new ZmCalItemComposeController;
ZmTaskController.prototype.constructor = ZmTaskController;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
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

    //Cache the item for further processing
    calItem.cache();

	appCtxt.setStatusMsg(ZmMsg.taskSaved);
};

ZmTaskController.prototype._createComposeView =
function() {
	return (new ZmTaskEditView(this._container, this));
};

ZmTaskController.prototype._getDefaultFocusItem =
function() {
    return this._composeView._getDefaultFocusItem();	
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

/**
 * Checks if the tasks is moving from local to remote folder (or vice versa).
 * 
 * @param	{ZmTask}	task			the task
 * @param	{String}	newFolderId		the folder id
 * @return	{Boolean}	<code>true</code> if moving from local to remote folder
 */
ZmTaskController.prototype.isMovingBetwAccounts =
function(task, newFolderId) {
	var isMovingBetw = false;
	if (task._orig) {
		var origFolder = task._orig.getFolder();
		var newFolder = appCtxt.getById(newFolderId);
		if (origFolder && newFolder) {
			if ((origFolder.id != newFolderId) &&
				((origFolder.link && !newFolder.link) || (!origFolder.link && newFolder.link)))
			{
				isMovingBetw = true;
			}
		}
	}
	return isMovingBetw;
};

// Private / Protected methods

ZmTaskController.prototype._getViewType =
function() {
	return ZmId.VIEW_TASKEDIT;
};

// Callbacks

ZmTaskController.prototype._printListener =
function() {
	var url = ("/h/printtasks?id=" + this._composeView._calItem.invId);
	window.open(appContextPath+url, "_blank");
};

ZmTaskController.prototype._closeView = function() {
    appCtxt.getAppViewMgr().showPendingView(true);
	this._composeView.cleanup();
};

ZmTaskController.prototype.closeView = function() {
   this._closeView();
};
