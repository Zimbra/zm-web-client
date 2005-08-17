/**
* Creates a new, empty preferences controller.
* @constructor
* @class
* Manages the options pages.
*
* @author Enrique Del Campo
* @author Conrad Damon
* @param appCtxt		the app context
* @param container		the shell
* @param prefsApp		the preferences app
*/
function LmPrefController(appCtxt, container, prefsApp) {

	LmController.call(this, appCtxt, container, prefsApp);

	this._listeners = new Object();
	this._listeners[LmOperation.SAVE] = new LsListener(this, this._saveListener);
	this._listeners[LmOperation.CLOSE] = new LsListener(this, this._backListener);
	this._filtersEnabled = appCtxt.get(LmSetting.FILTERS_ENABLED);
}

LmPrefController.prototype = new LmController();
LmPrefController.prototype.constructor = LmPrefController;

/**
* Displays the tabbed options pages.
*/
LmPrefController.prototype.show = 
function() {
	this._setView();
	this._prefsView.show();
	this._app.pushView(LmController.PREF_VIEW);
}

// Creates the prefs view, with a tab for each preferences page.
LmPrefController.prototype._setView = 
function() {
	if (!this._passwordDialog) {
		this._passwordDialog = new LmChangePasswordDialog(this._shell, this._appCtxt.getMsgDialog());
		this._passwordDialog.registerCallback(DwtDialog.OK_BUTTON, this._changePassword, this);
	}

	if (!this._prefsView) {
		this._initializeToolBar();
		if (this._filtersEnabled) {
			LmFilterRules.setRequestSender(this._appCtxt.getAppController());
			try {
				LmFilterRules.getRules();
			} catch (ex) {
				// TODO: let the user know that the preferences were not saved
				this._handleException(ex, LmPrefController.prototype._setView, null, false);
			}
		}
		var callbacks = new Object();
		callbacks[LmAppViewMgr.CB_PRE_HIDE] = new LsCallback(this, this.popShield);
		this._prefsView = new LmPrefView(this._container, this._app, Dwt.ABSOLUTE_STYLE, this._passwordDialog);
		var elements = new Object();
		elements[LmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar;
		elements[LmAppViewMgr.C_APP_CONTENT] = this._prefsView;
		this._app.createView(LmController.PREF_VIEW, elements, callbacks, true);
	}
}

// Initializes the toolbar and sets up the listeners
LmPrefController.prototype._initializeToolBar = 
function () {
	if (this._toolbar) return;
	
	var buttons = [LmOperation.SAVE, LmOperation.CLOSE];
	this._toolbar = new LmButtonToolBar(this._container, buttons, null, Dwt.ABSOLUTE_STYLE, "LmAppToolBar");
	for (var i = 0; i < buttons.length; i++) {
		if (buttons[i] > 0 && this._listeners[buttons[i]])
			this._toolbar.addSelectionListener(buttons[i], this._listeners[buttons[i]]);
	}
	this._toolbar.getButton(LmOperation.SAVE).setToolTipContent(LmMsg.savePrefs);
}

// Saves any options that have been changed.
LmPrefController.prototype._saveListener = 
function() {
	try {
		var list = this._prefsView.getChangedPrefs();
		try {
			if (list.length)
				this._appCtxt.getSettings().save(list);

			var rulesToSave = false;
			if (this._filtersEnabled) {
				rulesToSave = LmFilterRules.shouldSave();
				if (rulesToSave)
					LmFilterRules.saveRules();
			}
			if (list.length || rulesToSave)
				this._appCtxt.getAppController().setStatusMsg(LmMsg.optionsSaved);
			return true;
		} catch (ex) {
			// TODO: let the user know that the preferences were not saved
			this._handleException(ex, LmPrefController.prototype._saveListener, null, false);
		}
	} catch (e) {
		// getChangedPrefs throws an LsException if any of the values have not passed validation.
		if (e instanceof LsException) {
			this._appCtxt.getAppController().setStatusMsg(e.msg);
		}
	}
	return false;
}

LmPrefController.prototype._backListener = 
function() {
	this._app.popView();
}

LmPrefController.prototype._changePassword =
function(args) {
	var soapDoc = LsSoapDoc.create("ChangePasswordRequest", "urn:liquidAccount");
	soapDoc.set("oldPassword", args[0]);
	soapDoc.set("password", args[1]);
	var accountNode = soapDoc.set("account", this._appCtxt.get(LmSetting.USERNAME));
	accountNode.setAttribute("by", "name");
	try { 
		var resp = this._appCtxt.getAppController().sendRequest(soapDoc);
		this._passwordDialog.popdown();
		if (resp.ChangePasswordResponse) {
			this._appCtxt.getAppController().setStatusMsg(LmMsg.passwordChangeSucceeded);
		} else {
			throw new LsException(LmMsg.passwordChangeFailed + " " + LmMsg.errorContact, LsCsfeException.CSFE_SVC_ERROR, "changePassword");
		}
	} catch (ex) {
		if (ex.code == LsCsfeException.ACCT_AUTH_FAILED) {
			this._appCtxt.getAppController().setStatusMsg(LmMsg.oldPasswordIsIncorrect);
		} else {
			this._handleException(ex, this._passwordChangeListener, args, false);
		}
	}
}

LmPrefController.prototype.popShield =
function() {
	if (!this._prefsView.isDirty()) {
		return true;
	}

	if (!this._popShield) {
		this._popShield = new DwtMessageDialog(this._shell, null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON, DwtDialog.CANCEL_BUTTON]);
		this._popShield.setMessage(LmMsg.confirmExitPreferences, null, DwtMessageDialog.WARNING_STYLE);
		this._popShield.registerCallback(DwtDialog.YES_BUTTON, this._popShieldYesCallback, this);
		this._popShield.registerCallback(DwtDialog.NO_BUTTON, this._popShieldNoCallback, this);
		this._popShield.registerCallback(DwtDialog.CANCEL_BUTTON, this._popShieldCancelCallback, this);
	}
	var loc = Dwt.toWindow(this._prefsView.getHtmlElement(), 0, 0);
	var point = new DwtPoint(loc.x + 50, loc.y + 100);
    this._popShield.popup(point);
	return false;
}

LmPrefController.prototype._popShieldYesCallback =
function() {
	var saved = this._saveListener();
	this._popShield.popdown();
	this._app.getAppViewMgr().showPendingView(saved);
}

LmPrefController.prototype._popShieldNoCallback =
function() {
	this._popShield.popdown();
	this._app.getAppViewMgr().showPendingView(true);
}

LmPrefController.prototype._popShieldCancelCallback =
function() {
	this._popShield.popdown();
	this._app.getAppViewMgr().showPendingView(false);
};
