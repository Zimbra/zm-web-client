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
 * Portions created by Zimbra are Copyright (C) 2004, 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

function ZmTaskController(appCtxt, container, app) {

	ZmListController.call(this, appCtxt, container, app);

	this._listeners[ZmOperation.SAVE] = new AjxListener(this, this._saveListener);
	this._listeners[ZmOperation.CANCEL] = new AjxListener(this, this._cancelListener);

	this._tabGroupDone = {};
};

ZmTaskController.prototype = new ZmListController;
ZmTaskController.prototype.constructor = ZmTaskController;

ZmTaskController.prototype.toString =
function() {
	return "ZmTaskController";
};

ZmTaskController.prototype.show =
function(task) {
	this._task = task || (new ZmTask(this._appCtxt));
	this._currentView = this._getViewType();
	this._list = this._task.list;

	// re-enable input fields if list view exists
	if (this._listView[this._currentView])
		this._listView[this._currentView].enableInputs(true);
	this._setup(this._currentView);
	this._resetOperations(this._toolbar[this._currentView], 1); // enable all buttons

	var elements = {};
	elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[this._currentView];
	elements[ZmAppViewMgr.C_APP_CONTENT] = this._listView[this._currentView];

	this._setView(this._currentView, elements, false, false, false, true);
};

ZmTaskController.prototype.getKeyMapName =
function() {
	return "ZmTaskController";
};

ZmTaskController.prototype.handleKeyAction =
function(actionCode) {
	switch (actionCode) {
		case ZmKeyMap.SAVE:		this._saveListener(); break;
		case ZmKeyMap.CANCEL:	this._cancelListener(); break;
	}
	return true;
};


// Private methods (mostly overrides of ZmListController protected methods)

ZmTaskController.prototype._getToolBarOps =
function() {
	var list = [ZmOperation.SAVE];
	list.push(ZmOperation.CANCEL);
	list.push(ZmOperation.SEP);
	if (this._appCtxt.get(ZmSetting.TAGGING_ENABLED))
		list.push(ZmOperation.TAG_MENU);
	if (this._appCtxt.get(ZmSetting.PRINT_ENABLED))
		list.push(ZmOperation.PRINT);
	list.push(ZmOperation.DELETE);
	return list;
};

ZmTaskController.prototype._getActionMenuOps =
function() {
	return null;
};

ZmTaskController.prototype._getViewType =
function() {
	return ZmController.TASKEDIT_VIEW;
};

ZmTaskController.prototype._initializeListView =
function(view) {
	if (!this._listView[view]) {
		this._listView[view] = new ZmTaskEditView(this._container, this._appCtxt, this);
	}
};

ZmTaskController.prototype._initializeToolBar =
function(view) {
	ZmListController.prototype._initializeToolBar.call(this, view);

	// change the cancel button to "close" if editing existing contact
	var cancelButton = this._toolbar[view].getButton(ZmOperation.CANCEL);
	if (this._task.id == -1) {
		cancelButton.setText(ZmMsg.cancel);
		cancelButton.setImage("Cancel");
	} else {
		cancelButton.setText(ZmMsg.close);
		cancelButton.setImage("Close");
	}
};

ZmTaskController.prototype._getTagMenuMsg =
function() {
	return ZmMsg.tagTask;
};

ZmTaskController.prototype._setViewContents =
function(view) {
	this._listView[view].set(this._task);
/*
	// can't add all the fields until the view has been created
	if (!this._tabGroupDone[view]) {
		var list = this._listView[view]._getTabGroupMembers();
		for (var i = 0; i < list.length; i++) {
			this._tabGroups[view].addMember(list[i]);
		}
		this._tabGroupDone[view] = true;
	} else {
		this._setTabGroup(this._tabGroups[view]);
	}
*/
};

ZmTaskController.prototype._initializeTabGroup =
function(view) {
	if (this._tabGroups[view]) return;

	this._tabGroups[view] = this._createTabGroup();
	var rootTg = this._appCtxt.getRootTabGroup();
	this._tabGroups[view].newParent(rootTg);
	this._tabGroups[view].addMember(this._toolbar[view]);
};

ZmTaskController.prototype._paginate =
function(view, bPageForward) {
	// do nothing
};

ZmTaskController.prototype._resetOperations =
function(parent, num) {
	if (!parent) return;
	if (this._task.id == -1) {
		// disble all buttons except SAVE and CANCEL
		parent.enableAll(false);
		parent.enable([ZmOperation.SAVE, ZmOperation.CANCEL], true);
	} else if (this._task.isShared()) {
		parent.enableAll(true);
		parent.enable(ZmOperation.TAG_MENU, false);
	} else {
		ZmListController.prototype._resetOperations.call(this, parent, num);
	}
};

ZmTaskController.prototype._saveListener =
function(ev, bIsPopCallback) {
	try {
		var view = this._listView[this._currentView];

		// isValid should throw an String containing error message, otherwise returns true
		if (!view.isValid())
			return;

		// TODO

		if (!bIsPopCallback) {
			this._app.popView(true);
			view.cleanup();
		}
	} catch (ex) {
		if (AjxUtil.isString(ex)) {
			var ed = this._appCtxt.getMsgDialog();
			var msg = ZmMsg.errorSaving + (ex ? (":<p>" + ex) : ".");
			ed.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
			ed.popup();
		} else {
			this._handleException(ex, this._saveListener, ev, false);
		}
	}
};

ZmTaskController.prototype._cancelListener =
function(ev) {
	this._app.popView();
};

/*
ZmTaskController.prototype._doDelete =
function(items, hardDelete, attrs, skipPostProcessing) {
	ZmListController.prototype._doDelete.call(this, items, hardDelete, attrs);

	if (!skipPostProcessing) {
		// disable input fields (to prevent blinking cursor from bleeding through)
		this._listView[this._currentView].enableInputs(false);
		this._app.popView(true);
	}
};

ZmTaskController.prototype._preHideCallback =
function(view, force) {
	if (force) return true;

	var view = this._listView[this._currentView];
	if (!view.isDirty()) {
		this._listView[this._currentView].cleanup();
		return true;
	}

	var ps = this._popShield = this._appCtxt.getYesNoCancelMsgDialog();
	ps.reset();
	ps.setMessage(ZmMsg.askToSave, DwtMessageDialog.WARNING_STYLE);
	ps.registerCallback(DwtDialog.YES_BUTTON, this._popShieldYesCallback, this);
	ps.registerCallback(DwtDialog.NO_BUTTON, this._popShieldNoCallback, this);
	ps.popup(view._getDialogXY());

	return false;
};
*/

ZmTaskController.prototype._popShieldYesCallback =
function() {
	this._saveListener(null, true);
	this._popShield.popdown();
	this._app.popView(true);
	this._app.getAppViewMgr().showPendingView(true);
	this._listView[this._currentView].cleanup();
};

ZmTaskController.prototype._popShieldNoCallback =
function() {
	this._popShield.popdown();
	this._app.popView(true);
	this._app.getAppViewMgr().showPendingView(true);
	this._listView[this._currentView].cleanup();
};

ZmTaskController.prototype._popdownActionListener =
function(ev) {
	// bug fix #3719 - do nothing
};

ZmTaskController.prototype._getDefaultFocusItem =
function() {
	return this._listView[this._currentView]._getDefaultFocusItem();
};
