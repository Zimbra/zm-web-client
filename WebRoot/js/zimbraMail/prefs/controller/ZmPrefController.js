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

/**
 * Creates a new, empty preferences controller.
 * @constructor
 * @class
 * Manages the options pages.
 *
 * @author Conrad Damon
 *
 * @param container		the shell
 * @param prefsApp		the preferences app
 */
ZmPrefController = function(container, prefsApp) {

	ZmController.call(this, container, prefsApp);

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

/** Returns the account test dialog. */
ZmPrefController.prototype.getTestDialog = function() {
	if (!this._testDialog) {
		this._testDialog = new ZmAccountTestDialog(this._container);
	}
	return this._testDialog;
};

/**
* Returns the filter rules controller.
*/
ZmPrefController.prototype.getFilterRulesController =
function() {
	if (!this._filterRulesController)
		this._filterRulesController = new ZmFilterRulesController(this._container, this._app, this._prefsView);
	return this._filterRulesController;
};

/**
 * Checks for a precondition on the given object. If one is found, it is
 * evaluated based on its type. Note that the precondition must be contained
 * within the object in a property named "precondition".
 *
 * @param obj			[object]	an object, possibly with a "precondition" property.
 * @param precondition	[object]*	explicit precondition to check
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
	parent.enable(ZmOperation.CANCEL, appCtxt.getAppViewMgr()._hidden.length > 0);
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
		callbacks[ZmAppViewMgr.CB_PRE_UNLOAD] = new AjxCallback(this, this._preUnloadCallback);
		callbacks[ZmAppViewMgr.CB_PRE_SHOW] = new AjxCallback(this, this._preShowCallback);
		callbacks[ZmAppViewMgr.CB_POST_SHOW] = new AjxCallback(this, this._postShowCallback);
		this._prefsView = new ZmPrefView(this._container, Dwt.ABSOLUTE_STYLE, this);
		var elements = {};
		elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar;
		elements[ZmAppViewMgr.C_APP_CONTENT_FULL] = this._prefsView;
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
	var rootTg = appCtxt.getRootTabGroup();
	tg.newParent(rootTg);
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
 */
ZmPrefController.prototype._saveListener = 
function(ev, callback, noPop) {
	// is there anything to do?
	var dirty = this._prefsView.getChangedPrefs(true, true);
	if (!dirty) {
		appCtxt.getAppViewMgr().popView(true);
		return;
	}

	// perform pre-save ops, if needed
	var preSaveCallbacks = this._prefsView.getPreSaveCallbacks();
	if (preSaveCallbacks && preSaveCallbacks.length > 0) {
		var continueCallback = new AjxCallback(this, this._doPreSave);
		continueCallback.args = [continueCallback, preSaveCallbacks, callback, noPop];
		this._doPreSave.apply(this, continueCallback.args);
	}

	// do basic save
	else {
		this._doSave(callback, noPop);
	}

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

	// save any extra commands that may have been added
	if (batchCommand.size()) {
		var respCallback = new AjxCallback(this, this._handleResponseSaveListener, [true, callback, noPop]);
		var errorCallback = new AjxCallback(this, this._handleResponseSaveError);
		batchCommand.run(respCallback, errorCallback);
	}
	else {
		this._handleResponseSaveListener(list.length > 0, callback, noPop);
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
		appCtxt.setStatusMsg(message, ZmStatusView.LEVEL_CRITICAL);
	}
};

ZmPrefController.prototype._handleResponseSaveListener =
function(optionsSaved, callback, noPop, result) {
	if (optionsSaved) {
		appCtxt.setStatusMsg(ZmMsg.optionsSaved);
	}

	var hasFault = result && result._data && result._data.BatchResponse
		? result._data.BatchResponse.Fault : null;

	if (!noPop && (!result || !hasFault)) {
		// pass force flag - we just saved, so we know view isn't dirty
		appCtxt.getAppViewMgr().popView(true);
	}
	
	if (callback) callback.run(result);
};

ZmPrefController.prototype._backListener = 
function() {
	appCtxt.getAppViewMgr().popView();
};

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
		var tabKey = this._prefsView.getCurrentTab();
		var viewPage = this._prefsView.getTabView(tabKey);
		if (viewPage) {
			viewPage.showMe();
		}
	}
	// *always* return true!
	return true;
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
	appCtxt.getAppViewMgr().showPendingView(true);
};

ZmPrefController.prototype._popShieldCancelCallback =
function() {
	this._popShield.popdown();
	appCtxt.getAppViewMgr().showPendingView(false);
};

ZmPrefController.prototype._getDefaultFocusItem = 
function() {
	return this._toolbar;
};
