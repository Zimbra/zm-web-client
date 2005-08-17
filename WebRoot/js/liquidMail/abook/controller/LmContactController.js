function LmContactController(appCtxt, container, abApp) {

	LmListController.call(this, appCtxt, container, abApp);
	
	this._listeners[LmOperation.SAVE] = new LsListener(this, this._saveListener);
}

LmContactController.prototype = new LmListController();
LmContactController.prototype.constructor = LmContactController;

LmContactController.prototype.toString =
function() {
	return "LmContactController";
}

LmContactController.prototype.show = 
function(contact) {
	this._currentView = this._getViewType();
	this._contact = contact;
	this._list = contact.list;
	// re-enable input fields if list view exists
	if (this._listView[this._currentView])
		this._listView[this._currentView].enableInputs(true);
	this._setup(this._currentView);
	this._resetOperations(this._toolbar[this._currentView], 1); // enable all buttons
	var elements = new Object();
	elements[LmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[this._currentView];
	elements[LmAppViewMgr.C_APP_CONTENT] = this._listView[this._currentView];
	this._setView(this._currentView, elements);
}

// Private methods (mostly overrides of LmListController protected methods)

LmContactController.prototype._getToolBarOps = 
function() {
	var list = [LmOperation.SAVE];
	list.push(LmOperation.SEP);
	if (this._appCtxt.get(LmSetting.TAGGING_ENABLED))
		list.push(LmOperation.TAG_MENU);
	if (this._appCtxt.get(LmSetting.PRINT_ENABLED))
		list.push(LmOperation.PRINT);
	list.push(LmOperation.DELETE);
	list.push(LmOperation.SEP);
	list.push(LmOperation.CLOSE);
	return list;
}

LmContactController.prototype._getActionMenuOps =
function() {
	return null;
}

LmContactController.prototype._getViewType = 
function() {
	return LmController.CONTACT_VIEW;
}

LmContactController.prototype._initializeListView = 
function(view) {
	if (!this._listView[view])
		this._listView[view] = new LmContactView(this._container);
}

LmContactController.prototype._getTagMenuMsg = 
function() {
	return LmMsg.tagContact;
}

LmContactController.prototype._setViewContents =
function(view) {
	this._listView[view].set(this._contact);
}

LmContactController.prototype._paginate = 
function(view, bPageForward) {
	// TODO
	DBG.println("TODO - page to next/previous contact");
}

LmContactController.prototype._resetOperations = 
function(parent, num) {
	if (!parent) return;
	if (this._contact.id == undefined || this._contact.isGal) {
		// disble all buttons except SAVE and CLOSE
		parent.enableAll(false);
		parent.enable([LmOperation.SAVE, LmOperation.CLOSE], true);
	} else {
		LmListController.prototype._resetOperations.call(this, parent, num);
	}
}

LmContactController.prototype._saveListener =
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
				this._schedule(this._doCreate, {list: list, args: mods});
			} else {
				this._schedule(this._doModify, {items: contact, mods: mods});
			}
		} else {
			// print error message in toaster
			this._appCtxt.getAppController().setStatusMsg(LmMsg.emptyContact);
		}
	} catch (ex) {
		this._handleException(ex, this._saveListener, ev, false);
	}
}

LmContactController.prototype._doDelete = 
function(params) {
	LmListController.prototype._doDelete.call(this, params);
	// disable input fields (to prevent blinking cursor from bleeding through)
	this._listView[this._currentView].enableInputs(false);
	this._app.popView();
}

LmContactController.prototype._preHideCallback =
function() {
	var view = this._listView[this._currentView];
	if (!view.isDirty())
		return true;

	if (!this._popShield) {
		this._popShield = new DwtMessageDialog(this._shell, null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON, DwtDialog.CANCEL_BUTTON]);
		this._popShield.setMessage(LmMsg.askSaveContact, null, DwtMessageDialog.WARNING_STYLE);
		this._popShield.registerCallback(DwtDialog.YES_BUTTON, this._popShieldYesCallback, this);
		this._popShield.registerCallback(DwtDialog.NO_BUTTON, this._popShieldNoCallback, this);
		this._popShield.registerCallback(DwtDialog.CANCEL_BUTTON, this._popShieldCancelCallback, this);
	}

    this._popShield.popup(view._getDialogXY());
	return false;
}

LmContactController.prototype._popShieldYesCallback =
function() {
	this._saveListener(null, true);
	this._popShield.popdown();
	this._app.getAppViewMgr().showPendingView(true);
}

LmContactController.prototype._popShieldNoCallback =
function() {
	this._popShield.popdown();
	this._app.getAppViewMgr().showPendingView(true);
}

LmContactController.prototype._popShieldCancelCallback =
function() {
	this._popShield.popdown();
	this._app.getAppViewMgr().showPendingView(false);
}
