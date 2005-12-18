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
	this._listeners[ZmOperation.CANCEL] = new AjxListener(this, this._backListener);
	this._filtersEnabled = appCtxt.get(ZmSetting.FILTERS_ENABLED);
};

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
};

ZmPrefController.prototype.getFilterRulesController =
function() {
	if (!this._filterRulesController)
		this._filterRulesController = new ZmFilterRulesController(this._appCtxt, this._container, this._app, this._prefsView);
	return this._filterRulesController;
};

// Creates the prefs view, with a tab for each preferences page.
ZmPrefController.prototype._setView = 
function() {
	if (!this._passwordDialog) {
		this._passwordDialog = new ZmChangePasswordDialog(this._shell, this._appCtxt.getMsgDialog());
		this._passwordDialog.registerCallback(DwtDialog.OK_BUTTON, this._changePassword, this);
	}

	if (!this._prefsView) {
		this._initializeToolBar();
		var callbacks = new Object();
		callbacks[ZmAppViewMgr.CB_PRE_HIDE] = new AjxCallback(this, this.popShield);
		this._prefsView = new ZmPrefView(this._container, this._app, Dwt.ABSOLUTE_STYLE, this, this._passwordDialog);
		var elements = new Object();
		elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar;
		elements[ZmAppViewMgr.C_APP_CONTENT] = this._prefsView;
		this._app.createView(ZmController.PREF_VIEW, elements, callbacks, true);
	}
};

// Initializes the toolbar and sets up the listeners
ZmPrefController.prototype._initializeToolBar = 
function () {
	if (this._toolbar) return;
	
	var buttons = [ZmOperation.SAVE, ZmOperation.CANCEL];
	this._toolbar = new ZmButtonToolBar(this._container, buttons, null, Dwt.ABSOLUTE_STYLE, "ZmAppToolBar");
	for (var i = 0; i < buttons.length; i++) {
		if (buttons[i] > 0 && this._listeners[buttons[i]])
			this._toolbar.addSelectionListener(buttons[i], this._listeners[buttons[i]]);
	}
	this._toolbar.getButton(ZmOperation.SAVE).setToolTipContent(ZmMsg.savePrefs);
};

/*
* Saves any options that have been changed.
*
* @param ev
* @param callback	[AjxCallback]	async callback
* @param noPop		[boolean]		if true, don't pop view after save
*/
ZmPrefController.prototype._saveListener = 
function(ev, callback, noPop) {
	var list;
	try {
		list = this._prefsView.getChangedPrefs();
	} catch (e) {
		// getChangedPrefs throws an AjxException if any of the values have not passed validation.
		if (e instanceof AjxException)
			this._appCtxt.setStatusMsg(e.msg, ZmStatusView.LEVEL_CRITICAL);
		return;
	}
	if (list && list.length) {
		var respCallback = new AjxCallback(this, this._handleResponseSaveListener, [list, callback, noPop]);
		this._appCtxt.getSettings().save(list, respCallback);
	} else {
		this._handleResponseSaveListener(list, callback, noPop);
	}
};

ZmPrefController.prototype._handleResponseSaveListener = 
function(list, callback, noPop, result) {
	if (list.length)
		this._appCtxt.setStatusMsg(ZmMsg.optionsSaved);
	if (!noPop)
		this._backListener();
	
	if (callback) callback.run(result);
};

ZmPrefController.prototype._backListener = 
function() {
	this._reallyWantToExitWithoutDialog = true;
	this._app.getAppViewMgr().popView();
};

ZmPrefController.prototype._changePassword =
function(oldPassword, newPassword) {
	var soapDoc = AjxSoapDoc.create("ChangePasswordRequest", "urn:zimbraAccount");
	soapDoc.set("oldPassword", oldPassword);
	soapDoc.set("password", newPassword);
	var accountNode = soapDoc.set("account", this._appCtxt.get(ZmSetting.USERNAME));
	accountNode.setAttribute("by", "name");

	var respCallback = new AjxCallback(this, this._handleResponseChangePassword);
	var errorCallback = new AjxCallback(this, this._handleErrorChangePassword);
	this._appCtxt.getAppController().sendRequest(soapDoc, true, respCallback, errorCallback);
};

ZmPrefController.prototype._handleResponseChangePassword =
function(result) {
	this._passwordDialog.popdown();
	this._appCtxt.setStatusMsg(ZmMsg.passwordChangeSucceeded);
};

ZmPrefController.prototype._handleErrorChangePassword =
function(ex) {
	if (ex.code == ZmCsfeException.ACCT_AUTH_FAILED) {
        	this._passwordDialog.showMessageDialog(ZmMsg.oldPasswordIsIncorrect);
		return true;
	} else {
		return false;
	}
};

ZmPrefController.prototype.popShield =
function() {
	if (this._reallyWantToExitWithoutDialog || !this._prefsView.isDirty()) {
		delete this._reallyWantToExitWithoutDialog;
		return true;
	}

	if (!this._popShield) {
		this._popShield = new DwtMessageDialog(this._shell, null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON, DwtDialog.CANCEL_BUTTON]);
		this._popShield.setMessage(ZmMsg.confirmExitPreferences, DwtMessageDialog.WARNING_STYLE);
		this._popShield.registerCallback(DwtDialog.YES_BUTTON, this._popShieldYesCallback, this);
		this._popShield.registerCallback(DwtDialog.NO_BUTTON, this._popShieldNoCallback, this);
		this._popShield.registerCallback(DwtDialog.CANCEL_BUTTON, this._popShieldCancelCallback, this);
	}
	var loc = Dwt.toWindow(this._prefsView.getHtmlElement(), 0, 0);
	var point = new DwtPoint(loc.x + 50, loc.y + 100);
    this._popShield.popup(point);
	return false;
};

ZmPrefController.prototype._popShieldYesCallback =
function() {
	var respCallback = new AjxCallback(this, this._handleResponsePopShieldYesCallback);
	this._saveListener(null, respCallback, true);
};

ZmPrefController.prototype._handleResponsePopShieldYesCallback =
function() {
	this._popShield.popdown();
	this._app.getAppViewMgr().showPendingView(true);
};

ZmPrefController.prototype._popShieldNoCallback =
function() {
	this._popShield.popdown();
	this._app.getAppViewMgr().showPendingView(true);
};

ZmPrefController.prototype._popShieldCancelCallback =
function() {
	this._popShield.popdown();
	this._app.getAppViewMgr().showPendingView(false);
};
