/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file contains the task controller class.
 * 
 */

/**
 * Creates a new task controller to manage task creation/editing.
 * @class
 * This class manages task creation/editing.
 *
 * @author Parag Shah
 *
 * @param {DwtShell}	container	the containing shell
 * @param {ZmApp}		app			the containing app
 * @param {constant}	type		controller type
 * @param {string}		sessionId	the session id
 * 
 * @extends		ZmCalItemComposeController
 */
ZmTaskController = function(container, app, type, sessionId) {
	if (arguments.length == 0) { return; }
	ZmCalItemComposeController.apply(this, arguments);
};

ZmTaskController.prototype = new ZmCalItemComposeController;
ZmTaskController.prototype.constructor = ZmTaskController;

ZmTaskController.prototype.isZmTaskController = true;
ZmTaskController.prototype.toString = function() { return "ZmTaskController"; };

ZmTaskController.DEFAULT_TAB_TEXT = ZmMsg.task;


// Public methods

ZmTaskController.getDefaultViewType =
function() {
	return ZmId.VIEW_TASKEDIT;
};
ZmTaskController.prototype.getDefaultViewType = ZmTaskController.getDefaultViewType;

ZmTaskController.prototype.saveCalItem =
function(attId) {
	var calItem = this._composeView.getCalItem(attId);
	if (calItem) {
		this._saveCalItemFoRealz(calItem, attId);
		return true;
	}
	return false;
};

ZmTaskController.prototype.isCloseAction =
function() {
    return this._action == ZmCalItemComposeController.SAVE;
};

ZmTaskController.prototype._handleResponseSave =
function(calItem, result) {
	ZmCalItemComposeController.prototype._handleResponseSave.call(this, calItem);
	if(this._action == ZmCalItemComposeController.SAVE) {
		this.closeView();	
	}
	// XXX: null out message so we re-fetch task next time its opened
	// To optimize, we should save the modified contents into cache'd task item
	if (calItem && calItem._orig)
		calItem._orig.message = null;

    //Cache the item for further processing
    calItem.cache();
    //need to set rev,ms for next soap request
    calItem.setFromSavedResponse(result);
    
	appCtxt.setStatusMsg(ZmMsg.taskSaved);
    if(calItem.alarm == true || calItem.isAlarmModified()) {
        this._app.getReminderController().refresh();
    }    
};

ZmTaskController.prototype._createComposeView =
function() {
	return (new ZmTaskEditView(this._container, this));
};

ZmTaskController.prototype._getDefaultFocusItem =
function() {
    return this._composeView._getDefaultFocusItem();	
};

ZmTaskController.prototype._getButtonOverrides =
function(buttons) {

	if (!(buttons && buttons.length)) { return; }

	var overrides = {};
	var idParams = {
		skinComponent:  ZmId.SKIN_APP_TOP_TOOLBAR,
		componentType:  ZmId.WIDGET_BUTTON,
		app:            ZmId.APP_TASKS,
		containingView: ZmId.VIEW_TASKEDIT
	};
	for (var i = 0; i < buttons.length; i++) {
		var buttonId = buttons[i];
		overrides[buttonId] = {};
		idParams.componentName = buttonId;
		var item = (buttonId === ZmOperation.SEP) ? "Separator" : buttonId + " button";
		var description = item + " on top toolbar for task edit view";
		overrides[buttonId].domId = ZmId.create(idParams, description);
	}
	return overrides;
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
	return ZmKeyMap.MAP_EDIT_TASK;
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

ZmTaskController.prototype._getTabParams =
function() {
	return {id:this.tabId, image:"CloseGray", hoverImage:"Close", text:ZmTaskController.DEFAULT_TAB_TEXT, textPrecedence:77,
			tooltip:ZmTaskController.DEFAULT_TAB_TEXT, style: DwtLabel.IMAGE_RIGHT};
};

// Callbacks

ZmTaskController.prototype._printListener =
function() {
	var url = ["/h/printtasks?id=", this._composeView._calItem.invId];
    
    if (appCtxt.isOffline) {
        var acctName = this._composeView._calItem.getAccount().name;
        url.push("&acct=", acctName);
    }
	window.open([window.appContextPath, url.join(""), "&tz=", AjxTimezone.getServerId(AjxTimezone.DEFAULT)].join(""), "_blank");
};

ZmTaskController.prototype.closeView = function() {
   this._closeView();
};

