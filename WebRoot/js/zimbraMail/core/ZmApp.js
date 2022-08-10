/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 *
 * This file defines a Zimbra Application class.
 *
 */

/**
 * Creates the application.
 * @class
 * This object represents a Zimbra Application. This class is a base class for application classes.
 * "App" is a useful abstraction for a set of related functionality, such as mail,
 * address book, or calendar. Looked at another way, an app is a collection of one or more controllers.
 * 
 * @param	{String}	name		the application name
 * @param	{DwtControl}	container	the control that contains components
 * @param	{ZmController}	parentController	the parent window controller (set by the child window)
 *
 */
ZmApp = function(name, container, parentController) {

	if (arguments.length == 0) return;
	
	this._name = name;
	this._container = container;
	this._parentController = parentController;
	this._active = false;
	this.currentSearch = null;
    this._defaultFolderId = null;   //reqd in case of external user

	this._deferredFolders = [];
	this._deferredFolderHash = {};
	this._deferredNotifications = [];

	this._sessionController		= {};
	this._nextSessionId			= {};
	this._curSessionId			= {};

	ZmApp.DROP_TARGETS[name] = {};

	this._defineAPI();
	if (!parentController) {
		this._registerSettings();
	}
	this._registerOperations();
	this._registerItems();
	this._registerOrganizers();
	if (!parentController) {
		this._setupSearchToolbar();
	}
	this._registerApp();

};

// app information ("_R" means "reverse map")

// these are needed statically (before we get user settings)
ZmApp.CLASS					= {};	// constructor for app class
ZmApp.SETTING				= {};	// ID of setting that's true when app is enabled
ZmApp.UPSELL_SETTING		= {};	// ID of setting that's true when app upsell is enabled
ZmApp.LOAD_SORT				= {};	// controls order in which apps are instantiated
ZmApp.BUTTON_ID				= {};	// ID for app button on app chooser toolbar

// these are set via registerApp() in app constructor
ZmApp.MAIN_PKG				= {};	// main package that composes the app
ZmApp.NAME					= {};	// msg key for app name
ZmApp.ICON					= {};	// name of app icon class
ZmApp.TEXT_PRECEDENCE		= {};	// order for removing button text
ZmApp.IMAGE_PRECEDENCE		= {};	// order for removing button image
ZmApp.QS_ARG				= {};	// arg for 'app' var in QS to jump to app
ZmApp.QS_ARG_R				= {};
ZmApp.CHOOSER_TOOLTIP		= {};	// msg key for app view menu tooltip
ZmApp.VIEW_TOOLTIP			= {};	// msg key for app tooltip
ZmApp.DEFAULT_SEARCH		= {};	// type of item to search for in the app
ZmApp.ORGANIZER				= {};	// main organizer for this app
ZmApp.OVERVIEW_TREES		= {};	// list of tree IDs to show in overview
ZmApp.HIDE_ZIMLETS			= {};	// whether to show Zimlet tree in overview
ZmApp.SEARCH_TYPES			= {};	// list of types of saved searches to show in overview
ZmApp.SEARCH_TYPES_R		= {};
ZmApp.GOTO_ACTION_CODE		= {};	// key action for jumping to this app
ZmApp.GOTO_ACTION_CODE_R	= {};
ZmApp.NEW_ACTION_CODE		= {};	// default "new" key action
ZmApp.ACTION_CODES			= {};	// key actions that map to ops
ZmApp.ACTION_CODES_R		= {};
ZmApp.OPS					= {};	// IDs of operations for the app
ZmApp.OPS_R					= {};	// map of operation ID to app
ZmApp.QS_VIEWS				= {};	// list of views to handle in query string
ZmApp.TRASH_VIEW_OP			= {};	// menu choice for "Show Only ..." in Trash view
ZmApp.UPSELL_URL			= {};	// URL for content of upsell
//ZmApp.QUICK_COMMAND_TYPE	= {};
ZmApp.DROP_TARGETS			= {};	// drop targets (organizers) by item/organizer type
ZmApp.SEARCH_RESULTS_TAB	= {};	// whether to show search results in a tab

// indexes to control order of appearance/action
ZmApp.CHOOSER_SORT			= {};	// controls order of apps in app chooser toolbar
ZmApp.DEFAULT_SORT			= {};	// controls order in which app is chosen as default start app

ZmApp.ENABLED_APPS			= {};	// hash for quick detection if app is enabled

// ordered lists of apps
ZmApp.APPS					= [];	// ordered list
ZmApp.DEFAULT_APPS			= [];	// ordered list

ZmApp.OVERVIEW_ID			= "main";	// ID for main overview

ZmApp.BATCH_NOTIF_LIMIT = 25;	// threshold for doing batched change notifications

ZmApp.MAIN_SESSION			= "main";
ZmApp.HIDDEN_SESSION		= "hidden";

/**
 * Initializes the application.
 *
 * @private
 */
ZmApp.initialize =
function() {
	if (appCtxt.get(ZmSetting.USE_KEYBOARD_SHORTCUTS)) {
		ZmApp.ACTION_CODES[ZmKeyMap.NEW_FOLDER]	= ZmOperation.NEW_FOLDER;
		ZmApp.ACTION_CODES[ZmKeyMap.NEW_TAG]	= ZmOperation.NEW_TAG;
	}
};

/**
 * Registers and stores information about an app. Note: Setting a value that evaluates to
 * false (such as 0 or an empty string) will not do anything.
 *
 * @param {constant}	app				the app ID
 * @param {Hash}	params			a hash of parameters
 * @param params.mainPkg			[string]	main package that contains the app
 * @param params.nameKey			[string]	msg key for app name
 * @param params.icon				[string]	name of app icon class
 * @param params.textPrecedence		[int]		order for removing button text
 * @param params.imagePrecedence	[int]		order for removing button image
 * @param params.chooserTooltipKey	[string]	msg key for app tooltip
 * @param params.viewTooltipKey		[string]	msg key for app view menu tooltip
 * @param params.defaultSearch		[constant]	type of item to search for in the app
 * @param params.organizer			[constant]	main organizer for this app
 * @param params.overviewTrees		[array]		list of tree IDs to show in overview
 * @param params.hideZimlets		[boolean]	if true, hide Zimlet tree in overview
 * @param params.searchTypes		[array]		list of types of saved searches to show in overview
 * @param params.gotoActionCode		[constant]	key action for jumping to this app
 * @param params.newActionCode		[constant]	default "new" action code
 * @param params.actionCodes		[hash]		keyboard actions mapped to operations
 * @param params.newItemOps			[hash]		IDs of operations that create a new item, and their text keys
 * @param params.newOrgOps			[hash]		IDs of operations that create a new organizer, and their text keys
 * @param params.qsViews			[array]		list of views to handle in query string
 * @param params.chooserSort		[int]		controls order of apps in app chooser toolbar
 * @param params.defaultSort		[int]		controls order in which app is chosen as default start app
 * @param params.trashViewOp		[constant]	menu choice for "Show Only ..." in Trash view
 * @param params.upsellUrl			[string]	URL for content of upsell
 * @param params.searchResultsTab	[string]	if true, show search results in a tab
 *
 * @private
 */
ZmApp.registerApp =
function(app, params) {

	// TODO: why the ifs? this should only be called once per app
	if (params.mainPkg)				{ ZmApp.MAIN_PKG[app]			= params.mainPkg; }
	if (params.nameKey)				{ ZmApp.NAME[app]				= params.nameKey; }
	if (params.icon)				{ ZmApp.ICON[app]				= params.icon; }
	if (params.textPrecedence)		{ ZmApp.TEXT_PRECEDENCE[app]	= params.textPrecedence; }
	if (params.imagePrecedence)		{ ZmApp.IMAGE_PRECEDENCE[app]	= params.imagePrecedence; }
	if (params.chooserTooltipKey)	{ ZmApp.CHOOSER_TOOLTIP[app]	= params.chooserTooltipKey; }
	if (params.viewTooltipKey)		{ ZmApp.VIEW_TOOLTIP[app]		= params.viewTooltipKey; }
	if (params.defaultSearch)		{ ZmApp.DEFAULT_SEARCH[app]		= params.defaultSearch; }
	if (params.organizer)			{ ZmApp.ORGANIZER[app]			= params.organizer; }
	if (params.overviewTrees)		{ ZmApp.OVERVIEW_TREES[app]		= params.overviewTrees; }
	if (params.hideZimlets)			{ ZmApp.HIDE_ZIMLETS[app]		= params.hideZimlets; }
	if (params.searchTypes) 		{ ZmApp.SEARCH_TYPES[app]		= params.searchTypes; }
	if (params.gotoActionCode)		{ ZmApp.GOTO_ACTION_CODE[app]	= params.gotoActionCode; }
	if (params.newActionCode)		{ ZmApp.NEW_ACTION_CODE[app]	= params.newActionCode; }
	if (params.qsViews)				{ ZmApp.QS_VIEWS[app]			= params.qsViews; }
	if (params.chooserSort)			{ ZmApp.CHOOSER_SORT[app]		= params.chooserSort; }
	if (params.defaultSort)			{ ZmApp.DEFAULT_SORT[app]		= params.defaultSort; }
	if (params.trashViewOp)			{ ZmApp.TRASH_VIEW_OP[app]		= params.trashViewOp; }
	if (params.upsellUrl)			{ ZmApp.UPSELL_URL[app]			= params.upsellUrl; }
	//if (params.quickCommandType)	{ ZmApp.QUICK_COMMAND_TYPE[app]	= params.quickCommandType; }
	if (params.searchResultsTab)	{ ZmApp.SEARCH_RESULTS_TAB[app]	= params.searchResultsTab; }

	if (params.searchTypes) {
		ZmApp.SEARCH_TYPES_R[app] = {};
		for (var i = 0; i < params.searchTypes.length; i++) {
			ZmApp.SEARCH_TYPES_R[app][params.searchTypes[i]] = true;
		}
	}

	if (params.gotoActionCode) {
		ZmApp.GOTO_ACTION_CODE_R[params.gotoActionCode] = app;
	}

	if (params.actionCodes) {
		for (var ac in params.actionCodes) {
			if (!ac) { continue; }
			ZmApp.ACTION_CODES_R[ac] = app;
			ZmApp.ACTION_CODES[ac] = params.actionCodes[ac];
		}
	}

    var appEnabled = appCtxt.get(ZmApp.SETTING[app]);
	if (params.newItemOps && appEnabled) {
		for (var op in params.newItemOps) {
			if (!op) { continue; }
			ZmApp.OPS_R[op] = app;
			ZmOperation.NEW_ITEM_OPS.push(op);
			ZmOperation.NEW_ITEM_KEY[op] = params.newItemOps[op];
		}
	}
	if (params.newOrgOps && appEnabled) {
		for (var op in params.newOrgOps) {
			if (!op) { continue; }
			ZmApp.OPS_R[op] = app;
			ZmOperation.NEW_ORG_OPS.push(op);
			ZmOperation.NEW_ORG_KEY[op] = params.newOrgOps[op];
		}
	}

	if (params.qsViews) {
		for (var i = 0; i < params.qsViews.length; i++) {
			ZmApp.QS_VIEWS[params.qsViews[i]] = app;
		}
	}

    /* if (params.quickCommandType) {
        ZmQuickCommand.itemTypes.push(params.quickCommandType);
    } */
};


/**
 * Runs the given function for all known (e.g. part of ZmApp.CLASS)
 * app classes, passing args.
 * NOTE: This runs class functions only, not instance (prototype) functions.
 * @static
 * @param funcName {String} The name of the function we will run on each
 * application.
 * @param mixed {mixed} 0 to n additional arguments are passed to funcName
 * via apply.
 */
ZmApp.runAppFunction =
function(funcName) {
    var args;

    for (var appName in ZmApp.CLASS) {
        var app = window[ZmApp.CLASS[appName]];
        var func = app && app[funcName];
        if (func && (typeof(func) == "function")) {
            args = args || Array.prototype.slice.call(arguments, 1);
            func.apply(app, args);
        }
    }
};


// Public instance methods

/**
 * Returns a string representation of the object.
 *
 * @return		{String}		a string representation of the object
 */
ZmApp.prototype.toString =
function() {
	return "ZmApp";
};

// Functions called during construction
ZmApp.prototype._defineAPI				= function() {};
ZmApp.prototype._registerSettings		= function() {};
ZmApp.prototype._registerOperations		= function() {};
ZmApp.prototype._registerItems			= function() {};
ZmApp.prototype._registerOrganizers		= function() {};
ZmApp.prototype._setupSearchToolbar		= function() {};
ZmApp.prototype._registerApp			= function() {};
ZmApp.prototype._registerPrefs			= function() {};						// called when Preferences pkg is loaded

// Functions that apps can override in response to certain events
ZmApp.prototype.startup					= function(result) {};					// run during startup
ZmApp.prototype.preNotify				= function(notify) {};					// run before handling notifications
ZmApp.prototype.deleteNotify			= function(ids) {};						// run on delete notifications
ZmApp.prototype.createNotify			= function(list) {};					// run on create notifications
ZmApp.prototype.modifyNotify			= function(list) {};					// run on modify notifications
ZmApp.prototype.postNotify				= function(notify) {};					// run after handling notifications
ZmApp.prototype.refresh					= function(refresh) {};					// run when a <refresh> block arrives
ZmApp.prototype.handleOp				= function(op, params) {};				// handle an operation

/**
 * Gets the application name.
 *
 * @return	{String}	the name
 */
ZmApp.prototype.getName =
function() {
	return this._name;
};

/**
 * Gets the application display name.
 *
 * @return	{String}	the display name
 */
ZmApp.prototype.getDisplayName =
function() {
	return ZmMsg[ZmApp.NAME[this._name]] || ZmApp.NAME[this._name];
};

/**
 * Gets the initial search type.
 *
 * @return	{Object}	<code>null</code> since only set if different from the default
 */
ZmApp.prototype.getInitialSearchType =
function() {
	return null;
};

/**
 * Gets the limit for the search triggered by the application launch or an overview click.
 *
 * @return	{int}	the limit
 */
ZmApp.prototype.getLimit =
function(offset) {
	return appCtxt.get(ZmSetting.PAGE_SIZE);
};

/**
 * Sets the application view.
 *
 * @param		{String}	view		the view
 * @see		ZmAppViewMgr
 */
ZmApp.prototype.setAppView =
function(view) {
	appCtxt.getAppViewMgr().setAppView(this._name, view);
};

/**
 * Creates the application view.
 *
 * @param		{Hash}	params		a hash of parameters
 * @see		ZmAppViewMgr
 * @see		ZmAppViewMgr#createView
 */
ZmApp.prototype.createView =
function(params) {
	params.appName = this._name;
	return appCtxt.getAppViewMgr().createView(params);
};

/**
 * Pushes the application view.
 *
 * @param	{String}	name	the view name
 * @param	{Boolean}	force	<code>true</code> to force the view onto the stack
 * @see		ZmAppViewMgr#pushView
 */
ZmApp.prototype.pushView =
function(name, force) {
	return appCtxt.getAppViewMgr().pushView(name, force);
};

/**
 * Pops the application view.
 *
 * @param	{Boolean}	force	<code>true</code> to force the view off the stack
 * @see		ZmAppViewMgr#popView
 */
ZmApp.prototype.popView =
function(force, viewId, skipHistory) {
	return appCtxt.getAppViewMgr().popView(force, viewId, skipHistory);
};

/**
 * Sets the application view.
 *
 * @param	{String}	name	the view name
 * @param	{Boolean}	force	<code>true</code> to force the view
 * @see		ZmAppViewMgr#setView
 */
ZmApp.prototype.setView =
function(name, force) {
	return appCtxt.getAppViewMgr().setView(name, force);
};

/**
 * Stages the application view.
 *
 * @param	{String}	name	the view name
 * @see		ZmAppViewMgr#stageView
 */
ZmApp.prototype.stageView =
function(name) {
	return appCtxt.getAppViewMgr().stageView(name);
};

/**
 * Adds a deferred folder.
 *
 * @param	{Hash}	params		a hash of parameters
 */
ZmApp.prototype.addDeferredFolder =
function(params) {
	var id = params.obj && params.obj.id;
	if (id && !this._deferredFolderHash[id]) {
		this._deferredFolders.push(params);
		this._deferredFolderHash[id] = true;
		appCtxt.cacheSetDeferred(id, this._name);
	}
};

/**
 * Gets the remote folder ids.
 *
 * @param	{Object}	account		the account
 * @return	{Array}		an array of {String} ids
 */
ZmApp.prototype.getRemoteFolderIds =
function(account) {
	// XXX: optimize by caching this list? It would have to be cleared anytime
	// folder structure changes
	var list = [];
	if (appCtxt.getOverviewController(true)) {
		var type = ZmApp.ORGANIZER[this.getName()];

		// first, make sure there aren't any deferred folders that need to be created
		if (this._deferredFolders.length) {
			this._createDeferredFolders(type);
		}

		var tree = appCtxt.getFolderTree(account);
		var folders = tree ? tree.getByType(type) : [];
		for (var i = 0; i < folders.length; i++) {
			var folder = folders[i];
			if (folder.isRemote()) {
				list.push(folder.id);
			}
		}
	}
	return list;
};

/**
 * Creates the overview content for this app. The default implementation creates
 * a {@link ZmOverview} with standard options. Other apps may want to use different
 * options, or create a {@link DwtComposite} instead.
 *
 * @return	{String}	the content
 */
ZmApp.prototype.getOverviewPanelContent =
function() {
	if (!this._overviewPanelContent) {
		var params = this._getOverviewParams();
		params.overviewId = this.getOverviewId();
		var ov = this._overviewPanelContent = appCtxt.getOverviewController().createOverview(params);
		ov.set(this._getOverviewTrees());
	}

	return this._overviewPanelContent;
};



/**
 * Gets the overview container.
 *
 * @return	{ZmOverview}		the overview container
 */
ZmApp.prototype.getOverviewContainer =
function(dontCreate) {
	if (!this._overviewContainer && !dontCreate) {
		var containerParams = {
			appName: this._name,
			containerId: ([ZmApp.OVERVIEW_ID, this._name].join("_")),
			posStyle: Dwt.ABSOLUTE_STYLE
		};
		var overviewParams = this._getOverviewParams();
		overviewParams.overviewTrees = this._getOverviewTrees();

		this._overviewContainer = appCtxt.getOverviewController().createOverviewContainer(containerParams, overviewParams);
	}

	return this._overviewContainer;
};

/**
 * Sets the overview tree to display overview content for this application.
 *
 * @param {Boolean}	reset		if <code>true</code>, clear the content first
 */
ZmApp.prototype.setOverviewPanelContent =
function(reset) {
	if (reset) {
		this._overviewPanelContent = null;
		this._overviewContainer = null;
	}

	// only set overview panel content if not in full screen mode
	var avm = appCtxt.getAppViewMgr();
	if (!avm.isFullScreen()) {
		Dwt.setLoadingTime(this.toString() + "-overviewPanel");
		var ov = ((appCtxt.multiAccounts && appCtxt.accountList.size() > 1) || this.getName() == ZmApp.VOICE)
			? this.getOverviewContainer()
			: this.getOverviewPanelContent();
		var components = {};
		components[ZmAppViewMgr.C_TREE] = ov;
		avm.setViewComponents(ZmAppViewMgr.APP, components, true, this.getName());
		Dwt.setLoadedTime(this.toString() + "-overviewPanel");
	}
};

/**
 * Gets the current overview, if any. Subclasses should ensure that a {@link ZmOverview} is returned.
 *
 * @return	{ZmOverview}	the overview
 */
ZmApp.prototype.getOverview =
function() {
	var opc = appCtxt.getOverviewController();
	return opc && opc.getOverview(this.getOverviewId());
};

/**
 * Resets the current overview, preserving expansion.
 *
 * @param {String}		overviewId	the id of overview to reset
 */
ZmApp.prototype.resetOverview =
function(overviewId) {
	var overview = overviewId ? appCtxt.getOverviewController().getOverview(overviewId) : this.getOverview();
	if (overview) {
		var expIds = [];
		var treeIds = overview.getTreeViews(), len = treeIds.length;
		for (var i = 0; i < len; i++) {
			var treeId = treeIds[i];
			var treeView = overview.getTreeView(treeId);
			if (treeView) {
				var items = treeView.getTreeItemList();
				var len1 = items.length;
				for (var j = 0; j < len1; j++) {
					var treeItem = items[j];
					if (treeItem._expanded) {
						expIds.push(treeItem._htmlElId);
					}
				}
			}
		}
		overview.clear();
		overview.set(this._getOverviewTrees());
		len = expIds.length;
		for (var i = 0; i < len; i++) {
			var treeItem = DwtControl.fromElementId(expIds[i]);
			if (treeItem && !treeItem._expanded) {
				treeItem.setExpanded(true);
			}
		}
	}
};

/**
 * Gets the overview id of the current {@link ZmOverview}, if any.
 *
 * @param	{ZmZimbraAccount}	account		the account
 * @return	{String}	the id
 */
ZmApp.prototype.getOverviewId =
function(account) {
	return appCtxt.getOverviewId([ZmApp.OVERVIEW_ID, this._name], account);
};

/**
 * Returns a hash of params with the standard overview options.
 *
 * @private
 */
ZmApp.prototype._getOverviewParams =
function() {
	// Get the sorted list of overview trees.
	var treeIds = [];
	for (var id in ZmOverviewController.CONTROLLER) {
		treeIds.push(id);
	}
	var sortFunc = function(a, b) {
		return (ZmOrganizer.DISPLAY_ORDER[a] || 9999) - (ZmOrganizer.DISPLAY_ORDER[b] || 9999);
	};
	treeIds.sort(sortFunc);

	return {
		posStyle:			Dwt.ABSOLUTE_STYLE,
		selectionSupported:	true,
		actionSupported:	true,
		dndSupported:		true,
		showUnread:			true,
		showNewButtons:		true,
		isAppOverview:		true,
		treeIds:			treeIds,
		appName:			this._name,
		account:			appCtxt.getActiveAccount()
	};
};

/**
 * Returns the list of trees to show in the overview for this app. Don't show
 * Folders unless mail is enabled. Other organizer types won't be created unless
 * their apps are enabled, so we don't need to check for them.
 *
 * @private
 */
ZmApp.prototype._getOverviewTrees =
function() {
	var list = ZmApp.OVERVIEW_TREES[this._name] || [];
	var newList = [];
	for (var i = 0, count = list.length; i < count; i++) {
		if ((list[i] == ZmOrganizer.FOLDER && !appCtxt.get(ZmSetting.MAIL_ENABLED))) {
			continue;
		}
		newList.push(list[i]);
	}

	if (!appCtxt.multiAccounts &&
		window[ZmOverviewController.CONTROLLER[ZmOrganizer.ZIMLET]] &&
		!ZmApp.HIDE_ZIMLETS[this._name])
	{
		newList.push(ZmOrganizer.ZIMLET);
	}
	return newList;
};

/**
 * Gets the number of active session controllers
 *
 * @return	{number} the number of active session controllers
 */
ZmApp.prototype.getNumSessionControllers =
function(type) {
    var controllers = this._sessionController[type] || [];
    var activeCount = 0;
    for (var id in controllers) {
        if (!controllers[id].inactive) {
            activeCount++;
        }
    }
    return activeCount;
};

/**
 * Evaluates the controller class and returns the default view type from that controller.
 *
 * @param	{hash}							params						hash of params:
 * @param	{string}						controllerClass				string name of controller class
 * @param	{string}						sessionId					unique identifier for this controller
 * @param 	{ZmSearchResultsController}		searchResultsController		containing controller
 *
 * @returns	{string}													default view type
 */
ZmApp.prototype.getTypeFromController =
function(controllerClass) {
	var controller = eval(controllerClass);
	if (!controller.getDefaultViewType) {
		throw new AjxException("Session controller " + controllerClass + " must implement getDefaultViewType()");
	}
	return controller.getDefaultViewType();
};

/**
 * Returns a controller of the given type and class. If no sessionId is provided, then
 * the controller's session ID will be an incremental number. If a sessionId is given,
 * then a check is made for an existing controller with that session ID. If none is
 * found, one is created and given that session ID.
 * 
 * @param	{hash}							params						hash of params:
 * @param	{string}						controllerClass				string name of controller class
 * @param	{string}						sessionId					unique identifier for this controller
 * @param 	{ZmSearchResultsController}		searchResultsController		containing controller
 */
ZmApp.prototype.getSessionController =
function(params) {

	var type = this.getTypeFromController(params.controllerClass);

	// track controllers of this type
	if (!this._sessionController[type]) {
		this._sessionController[type] = {};
		this._nextSessionId[type] = 1;
	}

	// check if we've already created a session controller with the given ID
	var sessionId = params.sessionId;
	if (sessionId && this._sessionController[type][sessionId]) {
		return this._sessionController[type][sessionId];
	}

	// re-use an inactive controller if possible
	var controller;
	if (!sessionId) {
		var controllers = this._sessionController[type];
		for (var id in controllers) {
			if (controllers[id].inactive && !controllers[id].isPinned && !controllers[id].isHidden) {
				controller = controllers[id];
				break;
			}
		}
	}

	sessionId = (controller && controller.getSessionId()) || sessionId || String(this._nextSessionId[type]++);

	if (!controller) {
		var ctlrClass = eval(params.controllerClass);
		controller = this._sessionController[type][sessionId] =
			new ctlrClass(this._container, this, type, sessionId, params.searchResultsController);
	}
	this._curSessionId[type] = sessionId;
	controller.inactive = false;

	return controller;
};

/**
 * Deletes a controller of the given type, class, and sessionId.
 *
 * @param	{hash}							params						hash of params:
 * @param	{string}						controllerClass				string name of controller class
 * @param	{string}						sessionId					unique identifier for this controller
 * @param 	{ZmSearchResultsController}		searchResultsController		containing controller
 */
ZmApp.prototype.deleteSessionController =
function(params) {
	var type		= this.getTypeFromController(params.controllerClass);
	var sessionId	= params.sessionId;

	if (!this._sessionController[type]) {
		return;
	}
	delete this._sessionController[type][sessionId];
};

// returns the session ID of the most recently retrieved controller of the given type
ZmApp.prototype.getCurrentSessionId =
function(type) {
	return this._curSessionId[type];
};

// returns a list of this app's controllers
ZmApp.prototype.getAllControllers =
function() {

	var controllers = [];
	for (var viewType in this._sessionController) {
		var viewHash = this._sessionController[viewType];
		if (viewHash) {
			for (var viewId in viewHash) {
				var ctlr = viewHash[viewId];
				if (ctlr) {
					controllers.push(ctlr);
				}
			}
		}
	}
	
	return controllers;
};

/**
 * @private
 */
ZmApp.prototype._addSettingsChangeListeners =
function() {
	if (!this._settingListener) {
		this._settingListener = new AjxListener(this, this._settingChangeListener);
	}
};

/**
 * @private
 */
ZmApp.prototype._settingChangeListener =
function(ev) {

};

// Returns a hash of properties for the New Button
ZmApp.prototype.getNewButtonProps =
function() {
	return {};
};

/**
 * Gets the search parameters.
 *
 * @param {Hash}	params	a hash of arguments for the search
 * @see		ZmSearchController
 */
ZmApp.prototype.getSearchParams =
function(params) {
	return (params || {});
};

/**
 * Default function to run after an app's core package has been loaded. It assumes that the
 * classes that define items and organizers for this app are in the core package.
 *
 * @private
 */
ZmApp.prototype._postLoadCore =
function() {
	if (!appCtxt.isChildWindow) {
		this._setupDropTargets();
	}
};

/**
 * Default function to run after an app's main package has been loaded.
 *
 * @private
 */
ZmApp.prototype._postLoad =
function(type) {
	if (type) {
		this._createDeferredFolders(type);
	}
	this._handleDeferredNotifications();
    if(appCtxt.isExternalAccount()) {
        this._handleExternalAccountSettings(type);
    }
};


ZmApp.prototype.containsWritableFolder =
function() {
    return appCtxt.isExternalAccount() ? (this._containsWritableFolder ? true : false) : true;
};

ZmApp.prototype.getDefaultFolderId =
function() {
    return this._defaultFolderId;
};

/**
 * @private
 */
ZmApp.prototype._handleExternalAccountSettings =
function(type) {
    //Handle the external account settings
    var dataTree = appCtxt.getTree(type, appCtxt.getActiveAccount()),
        folders = dataTree ? dataTree.getByType(type) : [],
        len = folders.length,
        folder,
        i;
    this._containsWritableFolder = false;
    for (i=0; i<len; i++) {
        folder = folders[i];
        if(!this._defaultFolderId) { this._defaultFolderId = folder.id; }
        if (folder.isPermAllowed(ZmOrganizer.PERM_WRITE)) {
            this._containsWritableFolder = true;
        }
    }
};

/**
 * @private
 */
ZmApp.prototype._setupDropTargets =
function() {
	var appTargets = ZmApp.DROP_TARGETS[this._name];
	for (var type in appTargets) {
		var targets = appTargets[type];
		for (var i = 0; i < targets.length; i++) {
			var orgType = targets[i];
			var ctlr = appCtxt.getOverviewController().getTreeController(orgType, true);
			var className = ZmList.ITEM_CLASS[type] || ZmOrganizer.ORG_CLASS[type];
			if (ctlr) {
				ctlr._dropTgt.addTransferType(className);
			} else {
				if (!ZmTreeController.DROP_SOURCES[orgType]) {
					ZmTreeController.DROP_SOURCES[orgType] = [];
				}
				ZmTreeController.DROP_SOURCES[orgType].push(className);
			}
		}
	}
};

/**
 * Disposes of the tree controllers (right now mainly gets rid of change listeners.
 */
ZmApp.prototype.disposeTreeControllers =
function() {

	var overviewController = appCtxt.getOverviewController(true); //see if overview controller was created (false param means it won't create it if not created)
	//this is created lazily in case of child window. There's nothing to do if it was not created.
	if (!overviewController) {
		return;
	}

	var appTargets = ZmApp.DROP_TARGETS[this._name];
	for (var type in appTargets) {
		var targets = appTargets[type];
		for (var i = 0; i < targets.length; i++) {
			var orgType = targets[i];
			var treeController = overviewController.getTreeController(orgType, true);
			if (!treeController) {
				continue;
			}
			treeController.dispose();
		}
	}
};


/**
 * @private
 */
ZmApp.prototype.createDeferred = function() {
	var types = ZmOrganizer.APP2ORGANIZER[this._name] || [];
	for (var i = 0; i < types.length; i++) {
		var type = types[i];
		var packageName = ZmOrganizer.ORG_PACKAGE[type];
		AjxDispatcher.require(packageName);
		this._createDeferredFolders(type);
	}
};

/**
 * Lazily create folders received in the initial <refresh> block.
 *
 * @private
 */
ZmApp.prototype._createDeferredFolders =
function(type) {
	for (var i = 0; i < this._deferredFolders.length; i++) {
		var params = this._deferredFolders[i];
		var folder = ZmFolderTree.createFolder(params.type, params.parent, params.obj, params.tree, params.path, params.elementType);
        if (appCtxt.isExternalAccount() && folder.isSystem()) {
            continue;
        }
		params.parent.children.add(folder); // necessary?
		folder.parent = params.parent;
		ZmFolderTree._traverse(folder, params.obj, params.tree, params.path || []);
	}
	this._clearDeferredFolders();
};

/**
 * @private
 */
ZmApp.prototype._clearDeferredFolders =
function() {
	this._deferredFolders = [];
	this._deferredFolderHash = {};
};

/**
 * Defer notifications if this app's main package has not been loaded.
 * Returns true if notifications were deferred.
 *
 * @param type	[string]	type of notification (delete, create, or modify)
 * @param data	[array]		list of notifications
 *
 * TODO: revisit use of MAIN_PKG, it's hokey
 *
 * @private
 */
ZmApp.prototype._deferNotifications =
function(type, data) {
	var pkg = ZmApp.MAIN_PKG[this._name];
	if (pkg && !AjxDispatcher.loaded(pkg)) {
		this._deferredNotifications.push({type:type, data:data});
		return true;
	} else {
		this._noDefer = true;
		return false;
	}
};

/**
 * @private
 */
ZmApp.prototype._handleDeferredNotifications =
function() {
	var dns = this._deferredNotifications;
	for (var i = 0; i < dns.length; i++) {
		var dn = dns[i];
		if (dn.type == "delete") {
			this.deleteNotify(dn.data, true);
		} else if (dn.type == "create") {
			this.createNotify(dn.data, true);
		} else if (dn.type == "modify") {
			this.modifyNotify(dn.data, true);
		}
	}
};

/**
 * Notify change listeners with a list of notifications, rather than a single
 * item, so that they can optimize. For example, a list view can wait to
 * fix its alternation of dark and light rows until after all the moved ones
 * have been taken out, rather than after the removal of each row.
 *
 * @param mods	{Array}		list of notification objects
 */
ZmApp.prototype._batchNotify =
function(mods) {

	if (!(mods && mods.length >= ZmApp.BATCH_NOTIF_LIMIT)) { return; }

	var notifs = {}, item, gotOne = false;
	for (var i = 0, len = mods.length; i < len; i++) {
		var mod = mods[i];
		item = appCtxt.cacheGet(mod.id);
		if (item) {
			var ev = item.notifyModify(mod, true);
			if (ev) {
				if (!notifs[ev]) {
					notifs[ev] = [];
				}
				mod.item = item;
				notifs[ev].push(mod);
				gotOne = true;
			}
		}
	}

	if (!gotOne || !item) { return; }

	var list = item.list;
	if (!list) { return; }
	list._evt.batchMode = true;
	list._evt.item = item;	// placeholder - change listeners like it to be there
	list._evt.items = null;
	for (var ev in notifs) {
		var details = {notifs:notifs[ev]};
		list._notify(ev, details);
	}
};

/**
 * Depending on "Always in New Window" option and whether Shift key is pressed,
 * determine whether action should be in new window or not.
 *
 * @private
 */
ZmApp.prototype._inNewWindow =
function(ev) {
	if (appCtxt.isWebClientOffline()) {
		return false;
	}  else {
		var setting = appCtxt.get(ZmSetting.NEW_WINDOW_COMPOSE);
		return !ev ? setting : ((!setting && ev && ev.shiftKey) || (setting && ev && !ev.shiftKey));
	}
};

/**
 * @private
 */
ZmApp.prototype._handleCreateFolder =
function(create, org) {
	var parent = appCtxt.getById(create.l);
	if (parent && (ZmOrganizer.VIEW_HASH[org][create.view])) {
		parent.notifyCreate(create, "folder");
		create._handled = true;
	}
};

/**
 * @private
 */
ZmApp.prototype._handleCreateLink =
function(create, org) {
	var parent = appCtxt.getById(create.l);
	var view = create.view || "message";
	if (parent && parent.supportsSharing() && (ZmOrganizer.VIEW_HASH[org][view])) {
		parent.notifyCreate(create, "link");
		create._handled = true;
	}
};

// Abstract/protected methods

/**
 * Launches the application.
 *
 * @param	{Hash}	params		a hash of parameters
 * @param	{AjxCallback}	callback		the callback
 */
ZmApp.prototype.launch =
function(params, callback) {
	this.createDeferred();
    if (callback) {
        callback.run();
    }
};

/**
 * Activates the application.
 *
 * @param	{Boolean}	active	<code>true</code> if the application is active
 * @param	{string}	viewId	ID of view becoming active
 */
ZmApp.prototype.activate =
function(active, viewId) {
	this._active = active;
	if (active) {
		appCtxt.getAppController().setNewButtonProps(this.getNewButtonProps());
		this.setOverviewPanelContent();
		this.stopAlert();
		if (appCtxt.isWebClientOfflineSupported) {
			this.resetWebClientOfflineOperations();
		}
		this._setRefreshButtonTooltip();
	}
};

/**
 * Handle the common aspects of a transition from online to offline and offline to online, and also do so
 * when an app is activated
 */
ZmApp.prototype.resetWebClientOfflineOperations =
function() {
	var isWebClientOnline = !appCtxt.isWebClientOffline();
	var overview = this.getOverview();
	if (overview) {
		var zimletTreeView = overview.getTreeView(ZmOrganizer.ZIMLET);
		if (zimletTreeView) {
			zimletTreeView.setVisible(isWebClientOnline);
		}
		// enable/disable right click
		overview.actionSupported = isWebClientOnline;
		// enable/disable drag and drop
		overview.dndSupported = isWebClientOnline;
	}
	// new button enable/disable
	var newButton = appCtxt.getAppController().getNewButton();
	if (newButton) {
		if (ZmController._defaultNewId === ZmOperation.NEW_MESSAGE) {
			newButton._setDropDownCellMouseHandlers(isWebClientOnline);
		}
		else {
			newButton.setEnabled(isWebClientOnline);
		}
	}
};

/**
 * Checks if the application is active.
 *
 * @return	{Boolean}	<code>true</code> if the application is active
 */
ZmApp.prototype.isActive =
function() {
	return this._active;
};

/**
 * Resets the application state.
 *
 * @return	{Boolean}	<code>true</code> if the application is active
 */
ZmApp.prototype.reset =
function(active) {
};

/**
 * Starts an alert on the application tab.
 * 
 */
ZmApp.prototype.startAlert =
function() {
	AjxDispatcher.require("Alert");
	this._alert = this._alert || new ZmAppAlert(this);
	this._alert.start();
};

/**
 * Stops an alert on the application tab.
 */
ZmApp.prototype.stopAlert =
function() {
	if (this._alert) {
		this._alert.stop();
	}
};

ZmApp.prototype._setRefreshButtonTooltip =
function() {
	if (appCtxt.refreshButton) {
		appCtxt.refreshButton.setToolTipContent(this._getRefreshButtonTooltip());
	}
};

/**
 * this is the default refresh button tooltip. overridden in Calendar. (see bug 85965)
 * @private
 */
ZmApp.prototype._getRefreshButtonTooltip =
function() {
	 return ZmMsg.checkMailPrefUpdate;
};

/**
 * @private
 */
ZmApp.prototype._notifyRendered =
function() {
	if (!this._hasRendered) {
		appCtxt.getAppController().appRendered(this._name);
		this._hasRendered = true;
	}
	this.stopAlert();
};

/**
 * @private
 */
ZmApp.prototype._getExternalAccount =
function() {

	// bug #43464 - get the first non-local account that supports this app
	var defaultAcct;
	if (appCtxt.multiAccounts) {
		var accounts = appCtxt.accountList.visibleAccounts;
		for (var i = 0; i < accounts.length; i++) {
			var acct = accounts[i];
			if (acct.isMain) { continue; }

			if (appCtxt.get(ZmApp.SETTING[this.name], null, acct)) {
				defaultAcct = acct;
				break;
			}
		}
	}
	return defaultAcct;
};

/**
 * Sets a hidden div for performance metrics.  Marks the time an app has been launched
 * @param appName {String}
 * @param date {Date}
 * @private
 */
ZmApp.prototype._setLaunchTime = 
function(appName, date) {
	if (!window.isPerfMetric) {
		return;
	}
	var id = appName + "_launched";
	if (!date) {
		date = new Date();
	}
	if (!document.getElementById(id)) {
		var div = document.createElement("DIV");
		div.id = id;
		div.innerHTML = date.getTime();
		div.style.display = "none";
		document.body.appendChild(div);
	}
	if (window.appDevMode) {
		console.profile(id);
	}
};

/**
 * Sets a hidden div for performance metrics.  Marks the time an app has completed loading
 * @param appName {String}
 * @param date {Date}
 * @private
 */
ZmApp.prototype._setLoadedTime = 
function(appName, date) {
	if (!window.isPerfMetric) {
		return;
	}
	var id = appName + "_loaded";
	if (!date) {
		date = new Date();
	}
	if (!document.getElementById(id)) {
		var div = document.createElement("DIV");
		div.id = id;
		div.innerHTML = date.getTime();
		div.style.display = "none";
		document.body.appendChild(div);
	}
	if (window.appDevMode) {
		console.profileEnd();
	}
};
