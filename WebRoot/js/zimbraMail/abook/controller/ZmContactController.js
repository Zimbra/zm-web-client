/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
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
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmContactController(appCtxt, container, abApp) {

	ZmListController.call(this, appCtxt, container, abApp);
	
	this._listeners[ZmOperation.SAVE] = new AjxListener(this, this._saveListener);
	this._listeners[ZmOperation.CANCEL] = new AjxListener(this, this._cancelListener);
};

ZmContactController.prototype = new ZmListController();
ZmContactController.prototype.constructor = ZmContactController;

ZmContactController.prototype.toString =
function() {
	return "ZmContactController";
};

ZmContactController.prototype.show = 
function(contact, isDirty) {
	this._currentView = this._getViewType();
	this._contact = contact;
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
	this._setView(this._currentView, elements);
};

// Private methods (mostly overrides of ZmListController protected methods)

ZmContactController.prototype._getToolBarOps = 
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

ZmContactController.prototype._getActionMenuOps =
function() {
	return null;
};

ZmContactController.prototype._getViewType = 
function() {
	return ZmController.CONTACT_VIEW;
};

ZmContactController.prototype._initializeListView = 
function(view) {
	if (!this._listView[view])
		this._listView[view] = new ZmContactView(this._container, this._appCtxt, this);
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
	return ZmMsg.tagContact;
};

ZmContactController.prototype._setViewContents =
function(view) {
	this._listView[view].set(this._contact, this._contactDirty);
	if (this._contactDirty) delete this._contactDirty;
};

ZmContactController.prototype._paginate = 
function(view, bPageForward) {
	// TODO
	DBG.println("TODO - page to next/previous contact");
};

ZmContactController.prototype._resetOperations = 
function(parent, num) {
	if (!parent) return;
	if (this._contact.id == undefined || this._contact.isGal) {
		// disble all buttons except SAVE and CANCEL
		parent.enableAll(false);
		parent.enable([ZmOperation.SAVE, ZmOperation.CANCEL], true);
	} else {
		ZmListController.prototype._resetOperations.call(this, parent, num);
	}
};

ZmContactController.prototype._saveListener =
function(ev, bIsPopCallback) {
	try {
		var view = this._currentView;
		var mods = this._listView[view].getModifiedAttrs();
		this._listView[view].enableInputs(false);
		if (!bIsPopCallback)
			this._app.popView(true);
		if (mods) {
			var contact = this._listView[view].getContact();
			if (contact.id == undefined || contact.isGal) {
				var list = this._app.getContactList();
				this._doCreate(list, mods);
			} else {
				this._doModify(contact, mods);
			}
		} else {
			// print error message in toaster
			this._appCtxt.setStatusMsg(ZmMsg.emptyContact, ZmStatusView.LEVEL_WARNING);
		}
	} catch (ex) {
		this._handleException(ex, this._saveListener, ev, false);
	}
};

ZmContactController.prototype._cancelListener = 
function(ev) {
	this._app.popView();
};

ZmContactController.prototype._doDelete = 
function(items, hardDelete, attrs) {
	ZmListController.prototype._doDelete.call(this, items, hardDelete, attrs);
	// XXX: async
	// disable input fields (to prevent blinking cursor from bleeding through)
	this._listView[this._currentView].enableInputs(false);
	this._app.popView();
};

ZmContactController.prototype._preHideCallback =
function() {
	var view = this._listView[this._currentView];
	if (!view.isDirty())
		return true;

	if (!this._popShield) {
		this._popShield = new DwtMessageDialog(this._shell, null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON, DwtDialog.CANCEL_BUTTON]);
		this._popShield.setMessage(ZmMsg.askToSave, DwtMessageDialog.WARNING_STYLE);
		this._popShield.registerCallback(DwtDialog.YES_BUTTON, this._popShieldYesCallback, this);
		this._popShield.registerCallback(DwtDialog.NO_BUTTON, this._popShieldNoCallback, this);
	}

    this._popShield.popup(view._getDialogXY());
	return false;
};

ZmContactController.prototype._popShieldYesCallback =
function() {
	this._saveListener(null, true);
	this._popShield.popdown();
	this._app.getAppViewMgr().showPendingView(true);
};

ZmContactController.prototype._popShieldNoCallback =
function() {
	this._popShield.popdown();
	this._app.getAppViewMgr().showPendingView(true);
};

ZmContactController.prototype._popdownActionListener = 
function(ev) {
	// bug fix #3719 - do nothing
};
