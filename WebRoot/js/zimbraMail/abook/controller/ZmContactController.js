/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * This file contains the contact controller class.
 * 
 */

/**
 * Creates the contact controller.
 * @class
 * This class represents the contact controller.
 * 
 * @param	{DwtControl}	container		the container
 * @param	{ZmContactsApp}	abApp	the contacts application
 * 
 * @extends		ZmListController
 */
ZmContactController = function(container, abApp) {

	ZmListController.call(this, container, abApp);

	this._listeners[ZmOperation.SAVE] = new AjxListener(this, this._saveListener);
	this._listeners[ZmOperation.CANCEL] = new AjxListener(this, this._cancelListener);

	this._tabGroupDone = {};
};

ZmContactController.prototype = new ZmListController();
ZmContactController.prototype.constructor = ZmContactController;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmContactController.prototype.toString =
function() {
	return "ZmContactController";
};

/**
 * Shows the contact.
 * 
 * @param	{ZmContact}	contact		the contact
 * @param	{Boolean}	isDirty		<code>true</code> to mark the contact as dirty	
 */
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
	this._setView({view:this._currentView, elements:elements, isTransient:true});
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

/**
 * Changes the tab group.
 * 
 * @param	{int}	tabIdx		the tab index
 * @param	{int}	prevTabIdx	the previous tab index
 * 
 * @see		DwtTabGroup
 */
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

/**
 * Enables the toolbar.
 * 
 * @param	{Boolean}	enable	<code>true</code> to enable
 */
ZmContactController.prototype.enableToolbar =
function(enable) {
	if (enable) {
		this._resetOperations(this._toolbar[this._currentView], 1);
	} else {
		this._toolbar[this._currentView].enableAll(enable);
	}
};

// Private methods (mostly overrides of ZmListController protected methods)

/**
 * @private
 */
ZmContactController.prototype._getToolBarOps =
function() {
	return [ZmOperation.SAVE, ZmOperation.CANCEL,
			ZmOperation.SEP,
			ZmOperation.PRINT, ZmOperation.DELETE,
			ZmOperation.SEP,
			ZmOperation.TAG_MENU];
};

/**
 * @private
 */
ZmContactController.prototype._getActionMenuOps =
function() {
	return null;
};

/**
 * @private
 */
ZmContactController.prototype._getViewType =
function() {
	if (this._contact.isGroup()) {
		return ZmId.VIEW_GROUP; 
	} else {
		return ZmId.VIEW_CONTACT;
	}
};

/**
 * @private
 */
ZmContactController.prototype._initializeListView =
function(view) {
	if (!this._listView[view]) {
		switch (view) {
			case ZmId.VIEW_CONTACT:
		    	this._listView[view] = new ZmEditContactView(this._container, this);
				break;
			case ZmId.VIEW_GROUP:
		    	this._listView[view] = new ZmGroupView(this._container, this);
				break;
		}
	}
};

/**
 * @private
 */
ZmContactController.prototype._initializeToolBar =
function(view) {
	ZmListController.prototype._initializeToolBar.call(this, view);

	var tb = this._toolbar[view];

	// change the cancel button to "close" if editing existing contact
	var cancelButton = tb.getButton(ZmOperation.CANCEL);
	if (this._contact.id == undefined || this._contact.isGal) {
		cancelButton.setText(ZmMsg.cancel);
		cancelButton.setImage("Cancel");
	} else {
		cancelButton.setText(ZmMsg.close);
		cancelButton.setImage("Close");
	}

	var printButton = tb.getButton(ZmOperation.PRINT);
	if (printButton) {
		printButton.setText(ZmMsg.print);
	}

    var saveButton = tb.getButton(ZmOperation.SAVE);
    if (saveButton) {
        saveButton.setToolTipContent(ZmMsg.saveContactTooltip);
    }

	appCtxt.notifyZimlets("initializeToolbar", [this._app, tb, this, view], {waitUntilLoaded:true});
};

/**
 * @private
 */
ZmContactController.prototype._getTagMenuMsg =
function() {
	return ZmMsg.AB_TAG_CONTACT;
};

/**
 * @private
 */
ZmContactController.prototype._setViewContents =
function(view) {
	var cv = this._listView[view];
	cv.set(this._contact, this._contactDirty);
	if (this._contactDirty) {
		delete this._contactDirty;
	}

	this._tabGroup = cv.getTabGroupMember();
};

/**
 * @private
 */
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

/**
 * @private
 */
ZmContactController.prototype._initializeTabGroup =
function(view) {
	if (this._tabGroups[view]) { return; }

	// this view has multiple tab groups (since there are multiple tabs)
	this._tabGroups[view] = {};
};

/**
 * @private
 */
ZmContactController.prototype._paginate =
function(view, bPageForward) {
	// TODO? - page to next/previous contact
};

/**
 * @private
 */
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
};

/**
 * @private
 */
ZmContactController.prototype._saveListener =
function(ev, bIsPopCallback) {

	var view = this._listView[this._currentView];

	// isValid() may throw a String containing error message
	try {
		view.isValid();
	} catch (ex) {
		if (AjxUtil.isString(ex)) {
			var ed = appCtxt.getMsgDialog();
			//var msg = ZmMsg.errorSaving + (ex ? (":<p>" + ex) : ".");
			var msg = ex ? AjxMessageFormat.format(ZmMsg.errorSavingWithMessage, ex) : ZmMsg.errorSaving;
			ed.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
			ed.popup();
		}
		return;
	}

	var mods = view.getModifiedAttrs();
	view.enableInputs(false);

	if (mods) {
		var contact = view.getContact();

		// bug fix #22041 - when moving betw. shared/local folders, dont modify
		// the contact since it will be created/deleted into the new folder
		var newFolderId = mods[ZmContact.F_folderId];
		var newFolder = newFolderId ? appCtxt.getById(newFolderId) : null;
		if (contact.id != null && newFolderId &&
			(contact.isShared() || (newFolder && newFolder.link)))
		{
			// update existing contact with new attrs
			for (var a in mods) {
				if (a != ZmContact.F_folderId) {
					contact.attr[a] = mods[a];
				}
			}
			// set folder will do the right thing for this shared contact
			contact._setFolder(newFolderId);
		}
		else
		{
			if (contact.id && !contact.isGal) {
				if (view.isEmpty()) { //If contact empty, alert the user
                    var ed = appCtxt.getMsgDialog();
                    ed.setMessage(ZmMsg.emptyContactSave, DwtMessageDialog.CRITICAL_STYLE);
                    ed.popup();
                    view.enableInputs(true);
                    bIsPopCallback = true;
                } else {
					this._doModify(contact, mods);
                }
			} else {
				var clc = AjxDispatcher.run("GetContactListController");
				var list = (clc && clc.getList()) || new ZmContactList(null);
				this._doCreate(list, mods);
			}
		}
	} else {
		// bug fix #5829 - differentiate betw. an empty contact and saving
		//                 an existing contact w/o editing
		if (view.isEmpty()) {
			var msg = this._currentView == ZmId.VIEW_GROUP
				? ZmMsg.emptyGroup
				: ZmMsg.emptyContact;
			appCtxt.setStatusMsg(msg, ZmStatusView.LEVEL_WARNING);
		} else {
			var msg = this._currentView == ZmId.VIEW_GROUP
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

/**
 * @private
 */
ZmContactController.prototype._cancelListener = 
function(ev) {
	this._app.popView();
};

/**
 * @private
 */
ZmContactController.prototype._printListener =
function(ev) {
	var url = "/h/printcontacts?id=" + this._contact.id;
	window.open(appContextPath+url, "_blank");
};

/**
 * @private
 */
ZmContactController.prototype._doDelete = 
function(items, hardDelete, attrs, skipPostProcessing) {
	ZmListController.prototype._doDelete.call(this, items, hardDelete, attrs);

	if (!skipPostProcessing) {
		// disable input fields (to prevent blinking cursor from bleeding through)
		this._listView[this._currentView].enableInputs(false);
		this._app.popView(true);
	}
};

/**
 * @private
 */
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

/**
 * @private
 */
ZmContactController.prototype._preUnloadCallback =
function(view) {
	return !this._listView[this._currentView].isDirty();
};

/**
 * @private
 */
ZmContactController.prototype._popShieldYesCallback =
function() {
	this._saveListener(null, true);
	this._popShield.popdown();
	appCtxt.getAppViewMgr().showPendingView(true);
	this._listView[this._currentView].cleanup();
};

/**
 * @private
 */
ZmContactController.prototype._popShieldNoCallback =
function() {
	this._popShield.popdown();
	appCtxt.getAppViewMgr().showPendingView(true);
	this._listView[this._currentView].cleanup();
};

/**
 * @private
 */
ZmContactController.prototype._menuPopdownActionListener = 
function(ev) {
	// bug fix #3719 - do nothing
};

/**
 * @private
 */
ZmContactController.prototype._getDefaultFocusItem = 
function() {
	return this._listView[this._currentView]._getDefaultFocusItem();
};
