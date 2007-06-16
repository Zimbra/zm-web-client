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
* Creates a new, empty preferences controller.
* @constructor
* @class
* Manages the options pages.
*
* @author Conrad Damon
*
* @param appCtxt		the app context
* @param container		the shell
* @param prefsApp		the preferences app
*/
ZmPrefController = function(appCtxt, container, prefsApp) {

	ZmController.call(this, appCtxt, container, prefsApp);

	this._listeners = {};
	this._listeners[ZmOperation.SAVE] = new AjxListener(this, this._saveListener);
	this._listeners[ZmOperation.CANCEL] = new AjxListener(this, this._backListener);

	this._filtersEnabled = appCtxt.get(ZmSetting.FILTERS_ENABLED);
	this._dirty = {};
};

ZmPrefController.prototype = new ZmController();
ZmPrefController.prototype.constructor = ZmPrefController;

ZmPrefController.prototype.toString = 
function() {
	return "ZmPrefController";
};

/**
* Displays the tabbed options pages.
*/
ZmPrefController.prototype.show = 
function() {
	this._setView();
	this._prefsView.show();
	this._app.pushView(ZmController.PREF_VIEW);
};

/**
* Returns the prefs view (a view with tabs).
*/
ZmPrefController.prototype.getPrefsView =
function() {
	return this._prefsView;
};

/**
* Returns the filter rules controller.
*/
ZmPrefController.prototype.getFilterRulesController =
function() {
	if (!this._filterRulesController)
		this._filterRulesController = new ZmFilterRulesController(this._appCtxt, this._container, this._app, this._prefsView);
	return this._filterRulesController;
};

/**
* Returns the identity controller.
*/
ZmPrefController.prototype.getIdentityController =
function() {
	if (!this._identityController)
		this._identityController = new ZmIdentityController(this._appCtxt, this._container, this._app, this._prefsView);
	return this._identityController;
};

ZmPrefController.prototype.getKeyMapName =
function() {
	return "ZmPrefController";
};

ZmPrefController.prototype.handleKeyAction =
function(actionCode) {
	DBG.println("ZmPrefController.handleKeyAction");
	switch (actionCode) {
		case ZmKeyMap.CANCEL:
			this._backListener();
			break;
			
		default:
			return ZmController.prototype.handleKeyAction.call(this, actionCode);
			break;
	}
	return true;
};

ZmPrefController.prototype.getTabView =
function() {
	return this.getPrefsView();
};

ZmPrefController.prototype.setDirty =
function(view, dirty) {
	this._dirty[view] = dirty;
};

ZmPrefController.prototype.isDirty =
function(view) {
	return this._dirty[view];
};

/*
* Enables/disables toolbar buttons.
*
* @param parent		[ZmButtonToolBar]	the toolbar
* @param view		[constant]			current view (tab)
*/
ZmPrefController.prototype._resetOperations =
function(parent, view) {
    var section = ZmPref.getPrefSectionMap()[view];
    var manageChanges = section && section.manageChanges; 
    parent.enable(ZmOperation.SAVE, !manageChanges);
	parent.enable(ZmOperation.CANCEL, true);
};

/*
* Creates the prefs view, with a tab for each preferences page.
*/
ZmPrefController.prototype._setView = 
function() {
	if (!this._prefsView) {
		this._initializeToolBar();
		var callbacks = new Object();
		callbacks[ZmAppViewMgr.CB_PRE_HIDE] = new AjxCallback(this, this._preHideCallback);
		callbacks[ZmAppViewMgr.CB_POST_SHOW] = new AjxCallback(this, this._postShowCallback);
		this._prefsView = new ZmPrefView(this._container, this._appCtxt, Dwt.ABSOLUTE_STYLE, this);
		var elements = new Object();
		elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar;
		elements[ZmAppViewMgr.C_APP_CONTENT] = this._prefsView;
		this._app.createView(ZmController.PREF_VIEW, elements, callbacks, true);
		this._initializeTabGroup();
	}
};

/*
* Initializes the toolbar and sets up the listeners.
*/
ZmPrefController.prototype._initializeToolBar = 
function () {
	if (this._toolbar) return;
	
	var buttons = [ZmOperation.SAVE, ZmOperation.CANCEL];
	this._toolbar = new ZmButtonToolBar({parent:this._container, buttons:buttons});
	buttons = this._toolbar.opList;
	for (var i = 0; i < buttons.length; i++) {
		var button = buttons[i];
		if (this._listeners[button]) {
			this._toolbar.addSelectionListener(button, this._listeners[button]);
		}
	}
	this._toolbar.getButton(ZmOperation.SAVE).setToolTipContent(ZmMsg.savePrefs);
};

ZmPrefController.prototype._initializeTabGroup = 
function () {
	var tg = this._createTabGroup();
	var rootTg = this._appCtxt.getRootTabGroup();
	tg.newParent(rootTg);
	tg.addMember(this._toolbar);
};

/*
* Saves any options that have been changed. This method first sees if any of the
* preference pages need to perform any logic prior to the actual save. See the
* <code>ZmPrefView#getPreSaveCallbacks</code> documentation for further details.
*
* @param ev			[DwtEvent]		click event
* @param callback	[AjxCallback]	async callback
* @param noPop		[boolean]		if true, don't pop view after save
*/
ZmPrefController.prototype._saveListener = 
function(ev, callback, noPop) {
    //  try to validate first
    var list;
	var batchCommand = new ZmBatchCommand(this._appCtxt);
	try {
		list = this._prefsView.getChangedPrefs(false, false, batchCommand);
	} catch (e) {
		// getChangedPrefs throws an AjxException if any of the values have not passed validation.
		if (e instanceof AjxException) {
			this._appCtxt.setStatusMsg(e.msg, ZmStatusView.LEVEL_CRITICAL);
		} else {
			throw e;
		}
		return;
	}

    // now handle pre-save ops, if needed
    var preSaveCallbacks = this._prefsView.getPreSaveCallbacks();
    if (preSaveCallbacks && preSaveCallbacks.length > 0) {
        var continueCallback = new AjxCallback(this, this._doPreSave);
        continueCallback.args = [continueCallback, preSaveCallbacks, list, batchCommand, callback, noPop];
        this._doPreSave.apply(this, continueCallback.args);
    }
    else {
        this._doSave(list, batchCommand, callback, noPop);
    }
};

ZmPrefController.prototype._doPreSave =
function(continueCallback, preSaveCallbacks, list, batchCommand, callback, noPop, success) {
    // cancel save
    if (success != null && !success) {
        return;
    }
    // perform save
    if (preSaveCallbacks.length == 0) {
        this._doSave(list, batchCommand, callback, noPop);
        return;
    }
    // continue pre-save operations
    var preSaveCallback = preSaveCallbacks.shift();
    preSaveCallback.run(continueCallback, batchCommand);
};

ZmPrefController.prototype._doSave = function(list, batchCommand, callback, noPop) {
	if (list && list.length) {
		this._appCtxt.getSettings().save(list, null, batchCommand);
	} 
	if (batchCommand.size()) {
		var respCallback = new AjxCallback(this, this._handleResponseSaveListener, [list, callback, noPop]);
		batchCommand.run(respCallback);
	}
	else {
		this._handleResponseSaveListener(list, callback, noPop);
	}
};

ZmPrefController.prototype._handleResponseSaveListener = 
function(list, callback, noPop, result) {
	if (list.length) {
		this._appCtxt.setStatusMsg(ZmMsg.optionsSaved);
	}

	var hasFault = result && result._data && result._data.BatchResponse
		? result._data.BatchResponse.Fault : null;

	if (!noPop && (!result || !hasFault)) {
		// pass force flag - we just saved, so we know view isn't dirty
		this._appCtxt.getAppViewMgr().popView(true);
	}
	
	if (callback) callback.run(result);
};

ZmPrefController.prototype._backListener = 
function() {
	this._appCtxt.getAppViewMgr().popView();
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
	this._appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode: true,
												  callback: respCallback, errorCallback: errorCallback});
};

ZmPrefController.prototype._handleResponseChangePassword =
function(result) {
	this._appCtxt.getChangePasswordDialog().popdown();
	this._appCtxt.setStatusMsg(ZmMsg.passwordChangeSucceeded);
};

ZmPrefController.prototype._handleErrorChangePassword =
function(ex) {
	if (ex.code == ZmCsfeException.ACCT_AUTH_FAILED) {
		this._appCtxt.getChangePasswordDialog().showMessageDialog(ZmMsg.oldPasswordIsIncorrect);
		return true;
	} else {
		return false;
	}
};

ZmPrefController.prototype._preHideCallback =
function(view, force) {
	ZmController.prototype._preHideCallback.call(this);
	return force ? true : this.popShield();
};

ZmPrefController.prototype._postShowCallback = 
function() {
	ZmController.prototype._postShowCallback.call(this);
	var tabKey = this._prefsView.getCurrentTab();
	var viewPage = this._prefsView.getTabView(tabKey);
	if (this.isDirty(viewPage._view)) {
		viewPage.showMe();
	}
};

ZmPrefController.prototype.popShield =
function() {
	if (!this._prefsView.isDirty()) return true;

	var ps = this._popShield = this._appCtxt.getYesNoCancelMsgDialog();
	ps.reset();
	ps.setMessage(ZmMsg.confirmExitPreferences, DwtMessageDialog.WARNING_STYLE);
	ps.registerCallback(DwtDialog.YES_BUTTON, this._popShieldYesCallback, this);
	ps.registerCallback(DwtDialog.NO_BUTTON, this._popShieldNoCallback, this);
	ps.registerCallback(DwtDialog.CANCEL_BUTTON, this._popShieldCancelCallback, this);
	ps.popup();

	return false;
};

ZmPrefController.prototype._popShieldYesCallback =
function() {
	var respCallback = new AjxCallback(this, this._handleResponsePopShieldYesCallback);
	this._saveListener(null, respCallback, true);
	this._popShield.popdown();
};

ZmPrefController.prototype._handleResponsePopShieldYesCallback =
function() {
	this._app.popView(true);
	this._appCtxt.getAppViewMgr().showPendingView(true);
};

ZmPrefController.prototype._popShieldNoCallback =
function() {
	this._prefsView.reset();
	this._popShield.popdown();
	this._app.popView(true);
	this._appCtxt.getAppViewMgr().showPendingView(true);
};

ZmPrefController.prototype._popShieldCancelCallback =
function() {
	this._popShield.popdown();
	this._appCtxt.getAppViewMgr().showPendingView(false);
};

ZmPrefController.prototype._getDefaultFocusItem = 
function() {
	return this._toolbar;
};
