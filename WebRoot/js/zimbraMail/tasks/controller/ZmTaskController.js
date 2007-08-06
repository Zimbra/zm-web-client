/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is: Zimbra Collaboration Suite Web Client
 *
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
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
	return (new ZmTaskEditView(this._container, appCtxt, this));
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
	return ZmController.TASKEDIT_VIEW;
};
