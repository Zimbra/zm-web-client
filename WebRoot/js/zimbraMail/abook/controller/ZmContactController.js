/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
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
 * @param {DwtShell}	container	the containing shell
 * @param {ZmApp}		abApp		the containing app
 * @param {constant}	type		controller type
 * @param {string}		sessionId	the session id
 *
 * @extends		ZmListController
 */
ZmContactController = function(container, abApp, type, sessionId) {

	ZmListController.apply(this, arguments);

	this._listeners[ZmOperation.SAVE]	= this._saveListener.bind(this);
	this._listeners[ZmOperation.CANCEL]	= this._cancelListener.bind(this);

	this._tabGroupDone = {};
	this._elementsToHide = ZmAppViewMgr.LEFT_NAV;
};

ZmContactController.prototype = new ZmListController();
ZmContactController.prototype.constructor = ZmContactController;

ZmContactController.prototype.isZmContactController = true;
ZmContactController.prototype.toString = function() { return "ZmContactController"; };


ZmContactController.getDefaultViewType =
function() {
	return ZmId.VIEW_CONTACT;
};
ZmContactController.prototype.getDefaultViewType = ZmContactController.getDefaultViewType;

/**
 * Shows the contact.
 *
 * @param	{ZmContact}	contact		the contact
 * @param	{Boolean}	isDirty		<code>true</code> to mark the contact as dirty
 * @param	{Boolean}	isBack		<code>true</code> in case of DL, we load (or reload) all the DL info, so we have to call back here. isBack indicates this is after the reload so we can continue.
 */
ZmContactController.prototype.show =
function(contact, isDirty, isBack) {
	if (contact.id && contact.isDistributionList() && !isBack) {
		//load the full DL info available for the owner, for edit.
		var callback = this.show.bind(this, contact, isDirty, true); //callback HERE
		contact.clearDlInfo();
		contact.gatherExtraDlStuff(callback);
		return;
	}

	this._contact = contact;
	if (isDirty) {
		this._contactDirty = true;
	}
	this.setList(contact.list);

	if (!this.getCurrentToolbar()) {
		this._initializeToolBar(this._currentViewId);
	}
	this._resetOperations(this.getCurrentToolbar(), 1); // enable all buttons

	this._createView(this._currentViewId);

	this._setViewContents();
	this._initializeTabGroup(this._currentViewId);
	this._app.pushView(this._currentViewId);
	this.updateTabTitle();
};

ZmContactController.prototype._createView =
function(viewId) {
	if (this._contactView) {
		return;
	}
	var view = this._contactView = this._createContactView();
	//Note - I store this in this._view just to be consistent with certain calls such as for ZmBaseController.prototype._initializeTabGroup. Even though there's no real reason to keep an array of views per type since each controller would only have one view and therefor one type
	this._view[viewId] = view;

	var callbacks = {};
		callbacks[ZmAppViewMgr.CB_PRE_HIDE] = this._preHideCallback.bind(this);
		callbacks[ZmAppViewMgr.CB_PRE_UNLOAD] = this._preUnloadCallback.bind(this);
		callbacks[ZmAppViewMgr.CB_POST_SHOW] = this._postShowCallback.bind(this);
	var elements = this.getViewElements(null, view, this._toolbar[viewId]);

	this._app.createView({	viewId:		viewId,
							viewType:	this._currentViewType,
							elements:	elements, 
							hide:		this._elementsToHide,
							controller:	this,
							callbacks:	callbacks,
							tabParams:	this._getTabParams()});
};

ZmContactController.prototype._postShowCallback =
function() {
	//have to call it since it's overridden in ZmBaseController to do nothing.
	ZmController.prototype._postShowCallback.call(this);
	if (this._contactView.postShow) {
		this._contactView.postShow();
	}
};

ZmContactController.prototype._getDefaultTabText=
function() {
	return this._contact.isDistributionList()
			? ZmMsg.distributionList
				: this._isGroup()
			? ZmMsg.group
				: ZmMsg.contact;
};

ZmContactController.prototype._getTabParams =
function() {
	var text = this._isGroup() ? ZmMsg.group : ZmMsg.contact;
	return {id:this.tabId,
			image:"CloseGray",
            hoverImage:"Close",
			text: null, //we update it using updateTabTitle since before calling _setViewContents _getFullName does not return the name
			textPrecedence:77,
			tooltip: text,
            style: DwtLabel.IMAGE_RIGHT};
};

ZmContactController.prototype.updateTabTitle =
function() {
	var	tabTitle = this._contactView._getFullName(true);
	if (!tabTitle) {
		tabTitle = this._getDefaultTabText();
	}
	tabTitle = 	tabTitle.substr(0, ZmAppViewMgr.TAB_BUTTON_MAX_TEXT);

	appCtxt.getAppViewMgr().setTabTitle(this._currentViewId, tabTitle);
};



ZmContactController.prototype.getKeyMapName =
function() {
	return ZmKeyMap.MAP_EDIT_CONTACT;
};

ZmContactController.prototype.handleKeyAction =
function(actionCode) {
	DBG.println("ZmContactController.handleKeyAction");
	switch (actionCode) {

		case ZmKeyMap.SAVE:
			var tb = this.getCurrentToolbar();
			var saveButton = tb.getButton(ZmOperation.SAVE);
			if (!saveButton.getEnabled()) {
				break;
			}
			this._saveListener();
			break;

		case ZmKeyMap.CANCEL:
			this._cancelListener();
			break;
	}
	return true;
};

/**
 * Enables the toolbar.
 *
 * @param	{Boolean}	enable	<code>true</code> to enable
 */
ZmContactController.prototype.enableToolbar =
function(enable) {
	if (enable) {
		this._resetOperations(this.getCurrentToolbar(), 1);
	} else {
		this.getCurrentToolbar().enableAll(enable);
	}
};

// Private methods (mostly overrides of ZmListController protected methods)

/**
 * @private
 */
ZmContactController.prototype._getToolBarOps =
function() {
	return [ZmOperation.SAVE, ZmOperation.DELETE, ZmOperation.CANCEL];
};

/**
 * @private
 */
ZmContactController.prototype._getActionMenuOps =
function() {
	return null;
};

ZmContactController.prototype._getSecondaryToolBarOps =
function() {
	var list = [];
	list.push(ZmOperation.PRINT);
	list.push(ZmOperation.TAG_MENU);
	return list;
};

/**
 * @private
 */
ZmContactController.prototype._isGroup =
function() {
	return this._contact.isGroup();
};


ZmContactController.prototype._createContactView =
function() {
	return this._isGroup()
			? new ZmGroupView(this._container, this)
			: new ZmEditContactView(this._container, this);
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
	if (this._contact.id == undefined || (this._contact.isGal && !this._contact.isDistributionList())) {
		cancelButton.setText(ZmMsg.cancel);
	} else {
		cancelButton.setText(ZmMsg.close);
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
function() {
	var cv = this._contactView;
	cv.set(this._contact, this._contactDirty);
	if (this._contactDirty) {
		delete this._contactDirty;
	}

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
	if (!this._contact.id) {
		// disble all buttons except SAVE and CANCEL
		parent.enableAll(false);
		parent.enable([ZmOperation.SAVE, ZmOperation.CANCEL], true);
	}
	else if (this._contact.isGal) {
		//GAL item or DL.
		parent.enableAll(false);
		parent.enable([ZmOperation.SAVE, ZmOperation.CANCEL], true);
		//for editing a GAL contact - need to check special case for DLs that are owned by current user and if current user has permission to delete on this domain.
		var deleteAllowed = ZmContactList.deleteGalItemsAllowed([this._contact]);
		parent.enable(ZmOperation.DELETE, deleteAllowed);
	} else if (this._contact.isReadOnly()) {
		parent.enableAll(true);
		parent.enable(ZmOperation.TAG_MENU, false);
	} else {
		ZmListController.prototype._resetOperations.call(this, parent, num);
	}
};

/**
 * @private
 */
ZmContactController.prototype._saveListener = function(ev, bIsPopCallback) {

	var fileAsChanged = false;
	var view = this._contactView;
	if (view instanceof DwtForm) {
		view.validate();
    }

	if (!view.isValid()) {
		var invalidItems = view.getInvalidItems();
		// This flag will be set to false when the view.validate() detects some invalid fields (other than EMAIL) which does not have an error message.  If the EMAIL field is the only invalid one, ignore the error and move on.
		var onlyEmailInvalid = true;
		for (var i = 0; i < invalidItems.length; i++) {
			msg = view.getErrorMessage(invalidItems[i]);
			var isInvalidEmailAddr = (invalidItems[i].indexOf("EMAIL") != -1);
			if (AjxUtil.isString(msg) && !isInvalidEmailAddr) {
				msg = msg ? AjxMessageFormat.format(ZmMsg.errorSavingWithMessage, msg) : ZmMsg.errorSaving;
				var msgDlg = appCtxt.getMsgDialog();
				msgDlg.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
				msgDlg.popup();
				return;
			}
			onlyEmailInvalid = onlyEmailInvalid && isInvalidEmailAddr;
		}
		if (!onlyEmailInvalid) {
			return;
		}
	}

	var mods = view.getModifiedAttrs();
	view.enableInputs(false);

	var contact = view.getContact();
	if (mods && AjxUtil.arraySize(mods) > 0) {

		// bug fix #22041 - when moving betw. shared/local folders, dont modify
		// the contact since it will be created/deleted into the new folder
		var newFolderId = mods[ZmContact.F_folderId];
		var newFolder = newFolderId ? appCtxt.getById(newFolderId) : null;
		if (contact.id != null && newFolderId && (contact.isShared() || (newFolder && newFolder.link)) && !contact.isGal) {
			// update existing contact with new attrs
			for (var a in mods) {
				if (a != ZmContact.F_folderId && a != ZmContact.F_groups) {
					contact.attr[a] = mods[a];
				}
			}
			// set folder will do the right thing for this shared contact
			contact._setFolder(newFolderId);
		}
		else {
			if (contact.id && (!contact.isGal || contact.isDistributionList())) {
				if (view.isEmpty()) { //If contact empty, alert the user
					var ed = appCtxt.getMsgDialog();
					ed.setMessage(ZmMsg.emptyContactSave, DwtMessageDialog.CRITICAL_STYLE);
					ed.popup();
					view.enableInputs(true);
					bIsPopCallback = true;
				}
                else {
					var contactFileAsBefore = ZmContact.computeFileAs(contact),
					    contactFileAsAfter = ZmContact.computeFileAs(AjxUtil.hashUpdate(AjxUtil.hashCopy(contact.getAttrs()), mods, true)),
                        fileAsBefore = contactFileAsBefore ? contactFileAsBefore.toLowerCase()[0] : null,
                        fileAsAfter = contactFileAsAfter ? contactFileAsAfter.toLowerCase()[0] : null;
					this._doModify(contact, mods);
					if (fileAsBefore !== fileAsAfter) {
						fileAsChanged = true;
					}
				}
			}
            else {
				var isEmpty = true;
				for (var a in mods) {
					if (mods[a]) {
						isEmpty = false;
						break;
					}
				}
				if (isEmpty) {
					var msg = this._isGroup() ? ZmMsg.emptyGroup : ZmMsg.emptyContact;
					appCtxt.setStatusMsg(msg, ZmStatusView.LEVEL_WARNING);
				}
				else {
					if (contact.isDistributionList()) {
						contact.create(mods);
					}
					else {
						var clc = AjxDispatcher.run("GetContactListController");
						var list = (clc && clc.getList()) || new ZmContactList(null);
						fileAsChanged = true;
						this._doCreate(list, mods);
					}
				}
			}
		}
	}
    else {
		if (contact.isDistributionList()) {
			//in this case, we need to pop the view since we did not call the server to modify the DL.
			this.popView();
		}
		// bug fix #5829 - differentiate betw. an empty contact and saving
		//                 an existing contact w/o editing
		if (view.isEmpty()) {
			var msg = this._isGroup()
				? ZmMsg.emptyGroup
				: ZmMsg.emptyContact;
			appCtxt.setStatusMsg(msg, ZmStatusView.LEVEL_WARNING);
		}
        else {
			var msg = contact.isDistributionList()
				? ZmMsg.dlSaved
				: this._isGroup()
				? ZmMsg.groupSaved
				: ZmMsg.contactSaved;
			appCtxt.setStatusMsg(msg, ZmStatusView.LEVEL_INFO);
		}
	}

	if (!bIsPopCallback && !contact.isDistributionList()) {
		//in the DL case it might fail so wait to pop the view when we receive success from server.
		this.popView();
	}
	else {
		view.enableInputs(true);
	}
	if (fileAsChanged) // bug fix #45069 - if the contact is new, change the search to "all" instead of displaying contacts beginning with a specific letter
		ZmContactAlphabetBar.alphabetClicked(null);

    return true;
};

ZmContactController.prototype.popView =
function() {
	this._app.popView(true);
	if (this._contactView) { //not sure why _contactView is undefined sometimes. Maybe it's a different instance of ZmContactController.
		this._contactView.cleanup();
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
    if (appCtxt.isOffline) {
        var acctName = this._contact.getAccount().name;
        url+="&acct=" + acctName ;
    }
	window.open(appContextPath+url, "_blank");
};

/**
 * @private
 */
ZmContactController.prototype._doDelete =
function(items, hardDelete, attrs, skipPostProcessing) {
	ZmListController.prototype._doDelete.call(this, items, hardDelete, attrs);
	if (items.isDistributionList()) { //items === this._contact here
		//do not pop the view as we are not sure the user will confirm the hard delete
		return;
	}
	appCtxt.getApp(ZmApp.CONTACTS).updateIdHash(items, true);

	if (!skipPostProcessing) {
		// disable input fields (to prevent blinking cursor from bleeding through)
		this._contactView.enableInputs(false);
		this._app.popView(true);
	}
};

/**
 * @private
 */
ZmContactController.prototype._preHideCallback =
function(view, force) {
	ZmController.prototype._preHideCallback.call(this);

	if (force) return true;

	var view = this._contactView;
	if (!view.isDirty()) {
		view.cleanup();
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
	return this._contactView.clean || !this._contactView.isDirty();
};

/**
 * @private
 */
ZmContactController.prototype._popShieldYesCallback =
function() {
    this._popShield.popdown();
	if (this._saveListener(null, true)) {
        this._popShieldCallback();
    }
};

/**
 * @private
 */
ZmContactController.prototype._popShieldNoCallback =
function() {
    this._popShield.popdown();
    this._popShieldCallback();
};

/**
 * @private
 */
ZmContactController.prototype._popShieldCallback = function() {
    appCtxt.getAppViewMgr().showPendingView(true);
    this._contactView.cleanup();
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
	return this._contactView._getDefaultFocusItem();
};
