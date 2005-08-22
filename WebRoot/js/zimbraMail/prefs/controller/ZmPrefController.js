/*
***** BEGIN LICENSE BLOCK *****
Version: ZPL 1.1

The contents of this file are subject to the Zimbra Public License Version 1.1 ("License");
You may not use this file except in compliance with the License. You may obtain a copy of
the License at http://www.zimbra.com/license

Software distributed under the License is distributed on an "AS IS" basis, WITHOUT WARRANTY
OF ANY KIND, either express or implied. See the License for the specific language governing
rights and limitations under the License.

The Original Code is: Zimbra Collaboration Suite.

The Initial Developer of the Original Code is Zimbra, Inc.
Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
All Rights Reserved.
Contributor(s): ______________________________________.

***** END LICENSE BLOCK *****
*/

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
function ZmPrefController(appCtxt, container, prefsApp) {

	ZmController.call(this, appCtxt, container, prefsApp);

	this._listeners = new Object();
	this._listeners[ZmOperation.SAVE] = new AjxListener(this, this._saveListener);
	this._listeners[ZmOperation.CLOSE] = new AjxListener(this, this._backListener);
	this._filtersEnabled = appCtxt.get(ZmSetting.FILTERS_ENABLED);
}

ZmPrefController.prototype = new ZmController();
ZmPrefController.prototype.constructor = ZmPrefController;

/**
* Displays the tabbed options pages.
*/
ZmPrefController.prototype.show = 
function() {
	this._setView();
	this._prefsView.show();
	this._app.pushView(ZmController.PREF_VIEW);
}

// Creates the prefs view, with a tab for each preferences page.
ZmPrefController.prototype._setView = 
function() {
	if (!this._passwordDialog) {
		this._passwordDialog = new ZmChangePasswordDialog(this._shell, this._appCtxt.getMsgDialog());
		this._passwordDialog.registerCallback(DwtDialog.OK_BUTTON, this._changePassword, this);
	}

	if (!this._prefsView) {
		this._initializeToolBar();
		if (this._filtersEnabled) {
			ZmFilterRules.setRequestSender(this._appCtxt.getAppController());
			try {
				ZmFilterRules.getRules();
			} catch (ex) {
				// TODO: let the user know that the preferences were not saved
				this._handleException(ex, ZmPrefController.prototype._setView, null, false);
			}
		}
		var callbacks = new Object();
		callbacks[ZmAppViewMgr.CB_PRE_HIDE] = new AjxCallback(this, this.popShield);
		this._prefsView = new ZmPrefView(this._container, this._app, Dwt.ABSOLUTE_STYLE, this._passwordDialog);
		var elements = new Object();
		elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar;
		elements[ZmAppViewMgr.C_APP_CONTENT] = this._prefsView;
		this._app.createView(ZmController.PREF_VIEW, elements, callbacks, true);
	}
}

// Initializes the toolbar and sets up the listeners
ZmPrefController.prototype._initializeToolBar = 
function () {
	if (this._toolbar) return;
	
	var buttons = [ZmOperation.SAVE, ZmOperation.CLOSE];
	this._toolbar = new ZmButtonToolBar(this._container, buttons, null, Dwt.ABSOLUTE_STYLE, "ZmAppToolBar");
	for (var i = 0; i < buttons.length; i++) {
		if (buttons[i] > 0 && this._listeners[buttons[i]])
			this._toolbar.addSelectionListener(buttons[i], this._listeners[buttons[i]]);
	}
	this._toolbar.getButton(ZmOperation.SAVE).setToolTipContent(ZmMsg.savePrefs);
}

// Saves any options that have been changed.
ZmPrefController.prototype._saveListener = 
function() {
	try {
		var list = this._prefsView.getChangedPrefs();
		try {
			if (list.length)
				this._appCtxt.getSettings().save(list);

			var rulesToSave = false;
			if (this._filtersEnabled) {
				rulesToSave = ZmFilterRules.shouldSave();
				if (rulesToSave)
					ZmFilterRules.saveRules();
			}
			if (list.length || rulesToSave)
				this._appCtxt.getAppController().setStatusMsg(ZmMsg.optionsSaved);
			return true;
		} catch (ex) {
			// TODO: let the user know that the preferences were not saved
			this._handleException(ex, ZmPrefController.prototype._saveListener, null, false);
		}
	} catch (e) {
		// getChangedPrefs throws an AjxException if any of the values have not passed validation.
		if (e instanceof AjxException) {
			this._appCtxt.getAppController().setStatusMsg(e.msg);
		}
	}
	return false;
}

ZmPrefController.prototype._backListener = 
function() {
	this._app.popView();
}

ZmPrefController.prototype._changePassword =
function(args) {
	var soapDoc = AjxSoapDoc.create("ChangePasswordRequest", "urn:zimbraAccount");
	soapDoc.set("oldPassword", args[0]);
	soapDoc.set("password", args[1]);
	var accountNode = soapDoc.set("account", this._appCtxt.get(ZmSetting.USERNAME));
	accountNode.setAttribute("by", "name");
	try { 
		var resp = this._appCtxt.getAppController().sendRequest(soapDoc);
		this._passwordDialog.popdown();
		if (resp.ChangePasswordResponse) {
			this._appCtxt.getAppController().setStatusMsg(ZmMsg.passwordChangeSucceeded);
		} else {
			throw new AjxException(ZmMsg.passwordChangeFailed + " " + ZmMsg.errorContact, ZmCsfeException.CSFE_SVC_ERROR, "changePassword");
		}
	} catch (ex) {
		if (ex.code == ZmCsfeException.ACCT_AUTH_FAILED) {
			this._appCtxt.getAppController().setStatusMsg(ZmMsg.oldPasswordIsIncorrect);
		} else {
			this._handleException(ex, this._passwordChangeListener, args, false);
		}
	}
}

ZmPrefController.prototype.popShield =
function() {
	if (!this._prefsView.isDirty()) {
		return true;
	}

	if (!this._popShield) {
		this._popShield = new DwtMessageDialog(this._shell, null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON, DwtDialog.CANCEL_BUTTON]);
		this._popShield.setMessage(ZmMsg.confirmExitPreferences, null, DwtMessageDialog.WARNING_STYLE);
		this._popShield.registerCallback(DwtDialog.YES_BUTTON, this._popShieldYesCallback, this);
		this._popShield.registerCallback(DwtDialog.NO_BUTTON, this._popShieldNoCallback, this);
		this._popShield.registerCallback(DwtDialog.CANCEL_BUTTON, this._popShieldCancelCallback, this);
	}
	var loc = Dwt.toWindow(this._prefsView.getHtmlElement(), 0, 0);
	var point = new DwtPoint(loc.x + 50, loc.y + 100);
    this._popShield.popup(point);
	return false;
}

ZmPrefController.prototype._popShieldYesCallback =
function() {
	var saved = this._saveListener();
	this._popShield.popdown();
	this._app.getAppViewMgr().showPendingView(saved);
}

ZmPrefController.prototype._popShieldNoCallback =
function() {
	this._popShield.popdown();
	this._app.getAppViewMgr().showPendingView(true);
}

ZmPrefController.prototype._popShieldCancelCallback =
function() {
	this._popShield.popdown();
	this._app.getAppViewMgr().showPendingView(false);
};
