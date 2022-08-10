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
 * Creates a new, empty preferences controller.
 * @constructor
 * @class
 * This class represents the preferences controller. This controller manages
 * the options pages.
 *
 * @author Conrad Damon
 *
 * @param {DwtShell}			container		the shell
 * @param {ZmPreferencesApp}	prefsApp		the preferences application
 * 
 * @extends		ZmController
 */
ZmPrefController = function(container, prefsApp) {

	if (arguments.length == 0) { return; }
	
	ZmController.call(this, container, prefsApp);

	this._listeners = {};
	this._listeners[ZmOperation.SAVE] = this._saveListener.bind(this);
	this._listeners[ZmOperation.CANCEL] = this._backListener.bind(this);
	this._listeners[ZmOperation.REVERT_PAGE] =
		this._resetPageListener.bind(this);

	this._filtersEnabled = appCtxt.get(ZmSetting.FILTERS_ENABLED);
	this._dirty = {};
};

ZmPrefController.prototype = new ZmController;
ZmPrefController.prototype.constructor = ZmPrefController;

ZmPrefController.prototype.isZmPrefController = true;
ZmPrefController.prototype.toString = function() { return "ZmPrefController"; };


ZmPrefController.getDefaultViewType =
function() {
	return ZmId.VIEW_PREF;
};
ZmPrefController.prototype.getDefaultViewType = ZmPrefController.getDefaultViewType;

/**
 * Shows the tab options pages.
 */
ZmPrefController.prototype.show = 
function() {
	this._setView();
	this._prefsView.show();
	this._app.pushView(this._currentViewId);
};

/**
 * Gets the preferences view (a view with tabs).
 * 
 * @return	{ZmPrefView}		the preferences view
 */
ZmPrefController.prototype.getPrefsView =
function() {
	return this._prefsView;
};

/**
 * Gets the current preferences page
 *
 * @return	{ZmPreferencesPage}		the current page
 */
ZmPrefController.prototype.getCurrentPage =
function() {
	var tabKey = this._prefsView.getCurrentTab();
	return this._prefsView.getTabView(tabKey);
};

/**
 * Gets the account test dialog.
 * 
 * @return	{ZmAccountTestDialog}	the account test dialog
 */
ZmPrefController.prototype.getTestDialog =
function() {
	if (!this._testDialog) {
		this._testDialog = new ZmAccountTestDialog(this._container);
	}
	return this._testDialog;
};

/**
 * Gets the filter controller.
 * 
 * @return	{ZmFilterController}	the filter controller
 */
ZmPrefController.prototype.getFilterController =
function(section) {
	if (!this._filterController) {
		this._filterController = new ZmFilterController(this._container, this._app, this._prefsView, section || ZmPref.getPrefSectionWithPref(ZmSetting.FILTERS), this);
	}
	return this._filterController;
};

/**
 * Gets the mobile devices controller.
 * 
 * @return	{ZmMobileDevicesController}	the mobile devices controller
 */
ZmPrefController.prototype.getMobileDevicesController =
function() {
	if (!this._mobileDevicesController) {
		this._mobileDevicesController = new ZmMobileDevicesController(this._container, this._app, this._prefsView);
	}
	return this._mobileDevicesController;
};

/**
 * Checks for a precondition on the given object. If one is found, it is
 * evaluated based on its type. Note that the precondition must be contained
 * within the object in a property named "precondition".
 *
 * @param obj			[object]	an object, possibly with a "precondition" property.
 * @param precondition	[object]*	explicit precondition to check
 * 
 * @private
 */
ZmPrefController.prototype.checkPreCondition =
function(obj, precondition) {
	// No object, nothing to check
	if (!obj && !ZmSetting[precondition]) {
		return true;
	}
	// Object lacks "precondition" property, nothing to check
	if (obj && !("precondition" in obj)) {
		return true;
	}
	var p = (obj && obj.precondition) || precondition;
	// Object has a precondition that didn't get defined, probably because its
	// app is not enabled. That equates to failure for the precondition.
	if (p == null) {
		return false;
	}
	// Precondition is set to true or false
	if (AjxUtil.isBoolean(p)) {
		return p;
	}
	// Precondition is a function, look at its result
	if (AjxUtil.isFunction(p)) {
		return p();
	}
	// A list of preconditions is ORed together via a recursive call
	if (AjxUtil.isArray(p)) {
		for (var i = 0, count = p.length; i < count; i++) {
			if (this.checkPreCondition(null, p[i])) {
				return true;
			}
		}
		return false;
	}
	// Assume that the precondition is a setting, and return its value
	return Boolean(appCtxt.get(p));
};

ZmPrefController.prototype.getKeyMapName =
function() {
	return ZmKeyMap.MAP_OPTIONS;
};

ZmPrefController.prototype.handleKeyAction =
function(actionCode) {
	DBG.println("ZmPrefController.handleKeyAction");
	switch (actionCode) {

		case ZmKeyMap.CANCEL:
			this._backListener();
			break;

		case ZmKeyMap.SAVE:
			this._saveListener();
			break;

		default:
			return ZmController.prototype.handleKeyAction.call(this, actionCode);
			break;
	}
	return true;
};

ZmPrefController.prototype.mapSupported =
function(map) {
	return (map == "tabView");
};

/**
 * Gets the tab view.
 * 
 * @return	{ZmPrefView}		the preferences view
 * 
 * @see		#getPrefsView
 */
ZmPrefController.prototype.getTabView =
function() {
	return this.getPrefsView();
};

ZmPrefController.prototype.resetDirty =
function(view, dirty) {
	this._dirty = {};
};

ZmPrefController.prototype.setDirty =
function(view, dirty) {
	this._dirty[view] = dirty;
};

ZmPrefController.prototype.isDirty =
function(view) {
	return this._dirty[view];
};

/**
 * Public method called to save prefs - does not check for dirty flag.
 *
 * @param {AjxCallback}	callback	the async callback
 * @param {Boolean}	noPop		if <code>true</code>, do not pop view after save
 *
 * TODO: shouldn't have to call getChangedPrefs() twice
 * 
 * @private
 */
ZmPrefController.prototype.save =
function(callback, noPop) {
	// perform pre-save ops, if needed
	var preSaveCallbacks = this._prefsView.getPreSaveCallbacks();
	if (preSaveCallbacks && preSaveCallbacks.length > 0) {
		var continueCallback = new AjxCallback(this, this._doPreSave);
		continueCallback.args = [continueCallback, preSaveCallbacks, callback, noPop];
		this._doPreSave.apply(this, continueCallback.args);
	}
	else { // do basic save
		this._doSave(callback, noPop);
	}
};

/**
 * Enables/disables toolbar buttons.
 *
 * @param {ZmButtonToolBar}	parent		the toolbar
 * @param {constant}	view		the current view (tab)
 * 
 * @private
 */
ZmPrefController.prototype._resetOperations =
function(parent, view) {
	var section = ZmPref.getPrefSectionMap()[view];
	var manageChanges = section && section.manageChanges;
	parent.enable(ZmOperation.SAVE, !manageChanges);
	parent.enable(ZmOperation.CANCEL, true);
};

/**
 * Creates the prefs view, with a tab for each preferences page.
 * 
 * @private
 */
ZmPrefController.prototype._setView = 
function() {
	if (!this._prefsView) {
		this._initializeToolBar();
		this._initializeLeftToolBar();
		var callbacks = new Object();
		callbacks[ZmAppViewMgr.CB_PRE_HIDE]		= this._preHideCallback.bind(this);
		callbacks[ZmAppViewMgr.CB_PRE_UNLOAD]	= this._preUnloadCallback.bind(this);
		callbacks[ZmAppViewMgr.CB_PRE_SHOW]		= this._preShowCallback.bind(this);
		callbacks[ZmAppViewMgr.CB_POST_SHOW]	= this._postShowCallback.bind(this);

		this._prefsView = new ZmPrefView({parent:this._container, posStyle:Dwt.ABSOLUTE_STYLE, controller:this});
		var elements = {};
		elements[ZmAppViewMgr.C_NEW_BUTTON] = this._lefttoolbar;
		elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar;
		elements[ZmAppViewMgr.C_APP_CONTENT] = this._prefsView;

		this._app.createView({	viewId:		this._currentViewId,
								elements:	elements,
								controller:	this,
								callbacks:	callbacks,
								isAppView:	true});
		this._initializeTabGroup();
	}
};

/**
 * Initializes the left toolbar and sets up the listeners.
 *
 * @private
 */
ZmPrefController.prototype._initializeLeftToolBar =
function () {
	if (this._lefttoolbar) return;

	var buttons = [ZmOperation.SAVE, ZmOperation.CANCEL];
	this._lefttoolbar = new ZmButtonToolBar({parent:this._container, buttons:buttons, context:this._currentViewId});
	buttons = this._lefttoolbar.opList;
	for (var i = 0; i < buttons.length; i++) {
		var button = buttons[i];
		if (this._listeners[button]) {
			this._lefttoolbar.addSelectionListener(button, this._listeners[button]);
		}
	}
	this._lefttoolbar.getButton(ZmOperation.SAVE).setToolTipContent(ZmMsg.savePrefs);
};

/**
 * Initializes the toolbar and sets up the listeners.
 * 
 * @private
 */
ZmPrefController.prototype._initializeToolBar = 
function () {
	if (this._toolbar) return;
	
	var buttons = this._getToolBarOps();
	this._toolbar = new ZmButtonToolBar({parent:this._container, buttons:buttons, context:this._currentViewId});
	buttons = this._toolbar.opList;
	for (var i = 0; i < buttons.length; i++) {
		var button = buttons[i];
		if (this._listeners[button]) {
			this._toolbar.addSelectionListener(button, this._listeners[button]);
		}
	}

	appCtxt.notifyZimlets("initializeToolbar", [this._app, this._toolbar, this, this._currentViewId], {waitUntilLoaded:true});

};

/**
 * Returns the current tool bar (the one on the left with Save/Cancel).
 *
 * @return	{ZmButtonToolbar}		the toolbar
 */
ZmPrefController.prototype.getCurrentToolbar = function() {
    return this._lefttoolbar;
};

ZmPrefController.prototype._getToolBarOps =
function () {
	return [ZmOperation.REVERT_PAGE];
};

ZmPrefController.prototype._initializeTabGroup = 
function () {
	var tg = this._createTabGroup();
	var rootTg = appCtxt.getRootTabGroup();
	tg.newParent(rootTg);
	tg.addMember(this._lefttoolbar.getTabGroupMember());
	tg.addMember(this._toolbar.getTabGroupMember());
	tg.addMember(this._prefsView.getTabGroupMember());
};

/**
 * Saves any options that have been changed. This method first sees if any of the
 * preference pages need to perform any logic prior to the actual save. See the
 * <code>ZmPrefView#getPreSaveCallbacks</code> documentation for further details.
 *
 * @param ev		[DwtEvent]		click event
 * @param callback	[AjxCallback]	async callback
 * @param noPop		[boolean]		if true, don't pop view after save
 * 
 * TODO: shouldn't have to call getChangedPrefs() twice
 * 
 * @private
 */
ZmPrefController.prototype._saveListener = 
function(ev, callback, noPop) {
	// is there anything to do?
	var dirty = this._prefsView.getChangedPrefs(true, true);
	if (!dirty) {
		appCtxt.getAppViewMgr().popView(true);
		return;
	}

	this.save(callback, noPop);
};

ZmPrefController.prototype._doPreSave =
function(continueCallback, preSaveCallbacks, callback, noPop, success) {
	// cancel save
	if (success != null && !success) { return; }

	// perform save
	if (preSaveCallbacks.length == 0) {
		this._doSave(callback, noPop);
	}

	// continue pre-save operations
	else {
		var preSaveCallback = preSaveCallbacks.shift();
		preSaveCallback.run(continueCallback);
	}
};

ZmPrefController.prototype._doSave =
function(callback, noPop) {
	var batchCommand = new ZmBatchCommand(false);

	//  get changed prefs
	var list;
	try {
		list = this._prefsView.getChangedPrefs(false, false, batchCommand);
	}
	catch (e) {
		// getChangedPrefs throws an AjxException if any of the values have not passed validation.
		if (e instanceof AjxException) {
			appCtxt.setStatusMsg(e.msg, ZmStatusView.LEVEL_CRITICAL);
		} else {
			throw e;
		}
		return;
	}

	// save generic settings
	appCtxt.getSettings().save(list, null, batchCommand);
    this.resetDirty();

	// save any extra commands that may have been added
	if (batchCommand.size()) {
		var respCallback = this._handleResponseSaveListener.bind(this, true, callback, noPop, list);
		var errorCallback = this._handleResponseSaveError.bind(this);
		batchCommand.run(respCallback, errorCallback);
	}
	else {
		this._handleResponseSaveListener(list.length > 0, callback, noPop, list);
	}
};

ZmPrefController.prototype._handleResponseSaveError =
function(exception1/*, ..., exceptionN*/) {
	for (var i = 0; i < arguments.length; i++) {
		var exception = arguments[i];
		var message = exception instanceof AjxException ?
					  (exception.msg || exception.code) : String(exception);
		if (exception.code == ZmCsfeException.ACCT_INVALID_ATTR_VALUE ||
			exception.code == ZmCsfeException.INVALID_REQUEST) {
			// above faults come with technical/cryptic LDAP error msg; input validation
			// should keep us from getting here
			message = ZmMsg.invalidPrefValue;
		}
        else if(exception.code == ZmCsfeException.TOO_MANY_IDENTITIES) {
            //Bug fix # 80409 - Show a custom/localized message and not the server error
            message = ZmMsg.errorTooManyIdentities;
        }
        else if(exception.code == ZmCsfeException.IDENTITY_EXISTS) {
           //Displaying custom message in case of identity already exists
           message = AjxMessageFormat.format(ZmMsg.errorIdentityAlreadyExists, message.substring(message.length, message.lastIndexOf(':') + 2));
        }
		appCtxt.setStatusMsg(message, ZmStatusView.LEVEL_CRITICAL);
	}
};

ZmPrefController.prototype._handleResponseSaveListener =
function(optionsSaved, callback, noPop, list, result) {
	if (optionsSaved) {
		appCtxt.setStatusMsg(ZmMsg.optionsSaved);
	}

	var hasFault = result && result._data && result._data.BatchResponse
		? result._data.BatchResponse.Fault : null;

	if (!noPop && (!result || !hasFault)) {
		try {
			// pass force flag - we just saved, so we know view isn't dirty
			appCtxt.getAppViewMgr().popView(true);
		} catch (ex) {
			// do nothing - sometimes popView throws an exception ala history mgr
		}
	}
	
	if (callback) {
		callback.run(result);
	}

	var changed = {};
	for (var i = 0; i < list.length; i++) {
		changed[list[i].id] = true;
	}
	var postSaveCallbacks = this._prefsView.getPostSaveCallbacks();
	if (postSaveCallbacks && postSaveCallbacks.length) {
		for (var i = 0; i < postSaveCallbacks.length; i++) {
			postSaveCallbacks[i].run(changed);
		}
	}
	//Once preference is saved, reload the application cache to get the latest changes
	appCtxt.reloadAppCache();
};

ZmPrefController.prototype._backListener = 
function() {
	appCtxt.getAppViewMgr().popView();
};

ZmPrefController.prototype._resetPageListener =
function() {
	var viewPage = this.getCurrentPage();

	viewPage.reset(false);
	appCtxt.setStatusMsg(ZmMsg.defaultsPageRestore);
};

ZmPrefController.prototype._stateChangeListener =
function (ev) {
	var resetbutton = this._toolbar.getButton(ZmOperation.REVERT_PAGE);
	resetbutton.setEnabled(this.getCurrentPage().hasResetButton());
}

ZmPrefController.prototype._preHideCallback =
function(view, force) {
	ZmController.prototype._preHideCallback.call(this);
	return force ? true : this.popShield();
};

ZmPrefController.prototype._preUnloadCallback =
function(view) {
	return !this._prefsView.isDirty();
};

ZmPrefController.prototype._preShowCallback =
function() {
	if (appCtxt.multiAccounts) {
		var viewPage = this.getCurrentPage();
		if (viewPage) {
			// bug: 42399 - the active account may not be "owned" by what is
			// initially shown in prefs
			var active = appCtxt.accountList.activeAccount;
			if (!this._activeAccount) {
				this._activeAccount = active;
			}
			else if (this._activeAccount != active) {
				appCtxt.accountList.setActiveAccount(this._activeAccount);
			}

			viewPage.showMe();
		}
	}
	return true; // *always* return true!
};

ZmPrefController.prototype._postShowCallback =
function() {
	ZmController.prototype._postShowCallback.call(this);
	// NOTE: Some pages need to know when they are being shown again in order to
	//       display the state correctly.
	this._prefsView.reset();
};

ZmPrefController.prototype.popShield =
function() {
	if (!this._prefsView.isDirty()) { return true; }

	var ps = this._popShield = appCtxt.getYesNoCancelMsgDialog();
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
	appCtxt.getAppViewMgr().showPendingView(true);
};

ZmPrefController.prototype._popShieldNoCallback =
function() {
	this._prefsView.reset();
	this._popShield.popdown();
    this.resetDirty();
	appCtxt.getAppViewMgr().showPendingView(true);
};

ZmPrefController.prototype._popShieldCancelCallback =
function() {
	this._popShield.popdown();
	appCtxt.getAppViewMgr().showPendingView(false);
};

ZmPrefController.prototype._getDefaultFocusItem = 
function() {
	return this._prefsView.getTabGroupMember() || this._lefttoolbar || this._toolbar || null;
};
