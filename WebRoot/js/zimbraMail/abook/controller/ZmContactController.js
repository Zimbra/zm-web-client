/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
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

ZmContactController = function(container, abApp) {

	ZmListController.call(this, container, abApp);

	this._listeners[ZmOperation.SAVE] = new AjxListener(this, this._saveListener);
	this._listeners[ZmOperation.CANCEL] = new AjxListener(this, this._cancelListener);

	this._tabGroupDone = {};
};

ZmContactController.prototype = new ZmListController();
ZmContactController.prototype.constructor = ZmContactController;

ZmContactController.prototype.toString =
function() {
	return "ZmContactController";
};

ZmContactController.prototype.show =
function(contact, isDirty) {
	this._contact = contact;
	this._currentView = this._getViewType();
	if (isDirty) this._contactDirty = true;
	this._list = contact.list;
	// re-enable input fields if list view exists
	if (this._listView[this._currentView])
		this._listView[this._currentView].enableInputs(true);
	this._setup(this._currentView);
	this._resetOperations(this._toolbar[this._currentView], 1); // enable all buttons
	var elements = new Object();
	elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[this._currentView];
	elements[ZmAppViewMgr.C_APP_CONTENT] = this._listView[this._currentView];
	this._setView(this._currentView, elements, false, false, false, true);
};

ZmContactController.prototype.getKeyMapName =
function() {
	return "ZmContactController";
};

ZmContactController.prototype.handleKeyAction =
function(actionCode) {
	DBG.println("ZmContactController.handleKeyAction");
	switch (actionCode) {

		case ZmKeyMap.SAVE:
			this._saveListener();
			break;

		case ZmKeyMap.CANCEL:
			this._cancelListener();
			break;
	}
	return true;
};

ZmContactController.prototype.changeTabGroup =
function(tabIdx, prevTabIdx) {
	var tg = this._tabGroups[this._currentView][tabIdx];
	if (!tg) {
		tg = this._createTabGroup(tabIdx);
	}

	this._setTabGroup(tg);

	var rootTg = appCtxt.getRootTabGroup();
	var prevTg = this._tabGroups[this._currentView][prevTabIdx];
	rootTg.replaceMember(prevTg, tg);
};

ZmContactController.prototype.enableToolbar =
function(enable) {
	if (enable) {
		this._resetOperations(this._toolbar[this._currentView], 1);
	} else {
		this._toolbar[this._currentView].enableAll(enable);
	}
};

// Private methods (mostly overrides of ZmListController protected methods)

ZmContactController.prototype._getToolBarOps =
function() {
	return [ZmOperation.SAVE, ZmOperation.CANCEL,
			ZmOperation.SEP,
			ZmOperation.PRINT, ZmOperation.DELETE,
			ZmOperation.SEP,
			ZmOperation.TAG_MENU];
};

ZmContactController.prototype._getActionMenuOps =
function() {
	return null;
};

ZmContactController.prototype._getViewType =
function() {
	if (this._contact.isGroup()) {
		return ZmController.GROUP_VIEW; 
	} else if (this._contact.isMyCard && this._contact.isMyCard()) {
		return ZmController.MY_CARD_VIEW;
	} else {
		return ZmController.CONTACT_VIEW;
	}
};

ZmContactController.prototype._initializeListView =
function(view) {
	if (!this._listView[view]) {
		switch (view) {
			case ZmController.CONTACT_VIEW:
		    	this._listView[view] = new ZmContactView(this._container, this, false);
				break;
			case ZmController.GROUP_VIEW:
		    	this._listView[view] = new ZmGroupView(this._container, this);
				break;
			case ZmController.MY_CARD_VIEW:
		    	this._listView[view] = new ZmContactView(this._container, this, true);
				break;
		}
	}
};

ZmContactController.prototype._initializeToolBar =
function(view) {
	ZmListController.prototype._initializeToolBar.call(this, view);

	// change the cancel button to "close" if editing existing contact
	var cancelButton = this._toolbar[view].getButton(ZmOperation.CANCEL);
	if (this._contact.id == undefined || this._contact.isGal) {
		cancelButton.setText(ZmMsg.cancel);
		cancelButton.setImage("Cancel");
	} else {
		cancelButton.setText(ZmMsg.close);
		cancelButton.setImage("Close");
	}
};

ZmContactController.prototype._getTagMenuMsg =
function() {
	return ZmMsg.AB_TAG_CONTACT;
};

ZmContactController.prototype._setViewContents =
function(view) {
	var cv = this._listView[view];
	cv.set(this._contact, this._contactDirty);
	if (this._contactDirty) {
		delete this._contactDirty;
	}

	if (cv._contactTabView) {
		// create a tab group for the first tab
		var tabIdx = cv._contactTabView.getCurrentTab();
		if (!this._tabGroups[view][tabIdx]) {
			this._tabGroup = this._createTabGroup(tabIdx);
		}
	}
};

ZmContactController.prototype._createTabGroup =
function(tabIdx) {
	var tgName = this.toString() + "_" + tabIdx;
	var tg = this._tabGroups[this._currentView][tabIdx] = new DwtTabGroup(tgName);
	tg.newParent(appCtxt.getRootTabGroup());
	tg.addMember(this._toolbar[this._currentView]);

	var list = this._listView[this._currentView]._getTabGroupMembers(tabIdx);
	for (var i = 0; i < list.length; i++) {
		tg.addMember(list[i]);
	}

	return tg;
};

ZmContactController.prototype._initializeTabGroup =
function(view) {
	if (this._tabGroups[view]) { return; }

	// this view has multiple tab groups (since there are multiple tabs)
	this._tabGroups[view] = {};
};

ZmContactController.prototype._paginate =
function(view, bPageForward) {
	// TODO? - page to next/previous contact
};

ZmContactController.prototype._resetOperations =
function(parent, num) {
	if (!parent) return;
	if (this._contact.id == undefined || this._contact.isGal) {
		// disble all buttons except SAVE and CANCEL
		parent.enableAll(false);
		parent.enable([ZmOperation.SAVE, ZmOperation.CANCEL], true);
	} else if (this._contact.isShared()) {
		parent.enableAll(true);
		parent.enable(ZmOperation.TAG_MENU, false);
	} else {
		ZmListController.prototype._resetOperations.call(this, parent, num);
	}

	if (this._contact.isMyCard()) {
		parent.enable([ZmOperation.DELETE], false);
	}
};

ZmContactController.prototype._saveListener =
function(ev, bIsPopCallback) {

	var view = this._listView[this._currentView];

	// isValid() may throw a String containing error message
	try {
		view.isValid();
	} catch (ex) {
		if (AjxUtil.isString(ex)) {
			var ed = appCtxt.getMsgDialog();
			var msg = ZmMsg.errorSaving + (ex ? (":<p>" + ex) : ".");
			ed.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
			ed.popup();
		}
		return;
	}

	var mods = view.getModifiedAttrs();
	view.enableInputs(false);

	if (mods) {
		var contact = view.getContact();

		if (contact.id && !contact.isGal) {
			if (view.isEmpty()) {
				this._doDelete([contact], null, null, true);
			} else {
				this._doModify(contact, mods);
			}
			if (appCtxt.zimletsPresent()) {
				appCtxt.getZimletMgr().notifyZimlets("onContactModified",
					ZmZimletContext._translateZMObject(contact), mods);
			}
		} else {
			this._doCreate(AjxDispatcher.run("GetContacts"), mods);
		}
	} else {
		// bug fix #5829 - differentiate betw. an empty contact and saving
		//                 an existing contact w/o editing
		if (this._contact.isEmpty()) {
			var msg = this._currentView == ZmController.GROUP_VIEW
				? ZmMsg.emptyGroup
				: ZmMsg.emptyContact;
			appCtxt.setStatusMsg(msg, ZmStatusView.LEVEL_WARNING);
		} else {
			var msg = this._currentView == ZmController.GROUP_VIEW
				? ZmMsg.groupSaved
				: ZmMsg.contactSaved;
			appCtxt.setStatusMsg(msg, ZmStatusView.LEVEL_INFO);
		}
	}

	if (!bIsPopCallback) {
		this._app.popView(true);
		view.cleanup();
	}
};

ZmContactController.prototype._cancelListener = 
function(ev) {
	this._app.popView();
};

ZmContactController.prototype._doDelete = 
function(items, hardDelete, attrs, skipPostProcessing) {
	ZmListController.prototype._doDelete.call(this, items, hardDelete, attrs);

	if (!skipPostProcessing) {
		// disable input fields (to prevent blinking cursor from bleeding through)
		this._listView[this._currentView].enableInputs(false);
		this._app.popView(true);
	}
};

ZmContactController.prototype._preHideCallback =
function(view, force) {
	if (force) return true;
	
	var view = this._listView[this._currentView];
	if (!view.isDirty()) {
		this._listView[this._currentView].cleanup();
		return true;
	}

	var ps = this._popShield = appCtxt.getYesNoCancelMsgDialog();
	ps.reset();
	ps.setMessage(ZmMsg.askToSave, DwtMessageDialog.WARNING_STYLE);
	ps.registerCallback(DwtDialog.YES_BUTTON, this._popShieldYesCallback, this);
	ps.registerCallback(DwtDialog.NO_BUTTON, this._popShieldNoCallback, this);
	ps.popup(view._getDialogXY());
	
	return false;
};

ZmContactController.prototype._preUnloadCallback =
function(view) {
	return !this._listView[this._currentView].isDirty();
};

ZmContactController.prototype._popShieldYesCallback =
function() {
	this._saveListener(null, true);
	this._popShield.popdown();

	this._app.popView(true);
	appCtxt.getAppViewMgr().showPendingView(true);

	this._listView[this._currentView].cleanup();
};

ZmContactController.prototype._popShieldNoCallback =
function() {
	this._popShield.popdown();

	this._app.popView(true);
	appCtxt.getAppViewMgr().showPendingView(true);

	this._listView[this._currentView].cleanup();
};

ZmContactController.prototype._menuPopdownActionListener = 
function(ev) {
	// bug fix #3719 - do nothing
};

ZmContactController.prototype._getDefaultFocusItem = 
function() {
	return this._listView[this._currentView]._getDefaultFocusItem();
};
