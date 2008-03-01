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
 * Creates a new app object.
 * @constructor
 * @class
 * This class is a base class for app classes. "App" is a useful abstraction for a set of related
 * functionality, such as mail, address book, or calendar. Looked at another way, an app is a 
 * collection of one or more controllers.
 *
 * @param name				[string]		the name of the app
 * @param container			[DwtControl]	control that contains components
 * @param parentController	[ZmController]*	parent window controller (set by the child window)
 */
ZmApp = function(name, container, parentController) {

	if (arguments.length == 0) return;
	
	this._name = name;
	this._appViewMgr = appCtxt.getAppViewMgr();
	this._container = container;
	this._parentController = parentController;
	this._active = false;
	this.currentSearch = null;

	this._deferredFolders = [];
	this._deferredFolderHash = {};
	this._deferredNotifications = [];
	
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
		this._setupCurrentAppToolbar();
	}
	this._registerApp();

	if (!appCtxt.isChildWindow) {
		this._opc = appCtxt.getOverviewController();
	}
}

// app information ("_R" means "reverse map")

// these are needed statically (before we get user settings)
ZmApp.CLASS					= {};	// constructor for app class
ZmApp.SETTING				= {};	// ID of setting that's true when app is enabled
ZmApp.UPSELL_SETTING		= {};	// ID of setting that's true when app upsell is enabled
ZmApp.LOAD_SORT				= {};	// controls order in which apps are instantiated

// these are set via registerApp() in app constructor
ZmApp.MAIN_PKG				= {};	// main package that composes the app
ZmApp.NAME					= {};	// msg key for app name
ZmApp.ICON					= {};	// name of app icon class
ZmApp.QS_ARG				= {};	// arg for 'app' var in QS to jump to app
ZmApp.QS_ARG_R				= {};
ZmApp.CHOOSER_TOOLTIP		= {};	// msg key for app view menu tooltip
ZmApp.VIEW_TOOLTIP			= {};	// msg key for app tooltip
ZmApp.DEFAULT_SEARCH		= {};	// type of item to search for in the app
ZmApp.ORGANIZER				= {};	// main organizer for this app
ZmApp.OVERVIEW_TREES		= {};	// list of tree IDs to show in overview
ZmApp.SHOW_ZIMLETS			= {};	// whether to show Zimlet tree in overview
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
ZmApp.SUPPORTS_MULTI_MBOX	= {};	// whether this app supports multiple mailboxes
ZmApp.DROP_TARGETS			= {};	// drop targets (organizers) by item/organizer type

// assistants for each app; each value is a hash where key is the name of the
// assistant class and value is the required package
ZmApp.ASSISTANTS			= {};

// indexes to control order of appearance/action
ZmApp.CHOOSER_SORT			= {};	// controls order of apps in app chooser toolbar
ZmApp.DEFAULT_SORT			= {};	// controls order in which app is chosen as default start app

// ordered lists of apps
ZmApp.APPS					= [];	// ordered list
ZmApp.DEFAULT_APPS			= [];	// ordered list

ZmApp.initialize =
function() {
	if (appCtxt.get(ZmSetting.USE_KEYBOARD_SHORTCUTS)) {
		ZmApp.ACTION_CODES[ZmKeyMap.NEW_FOLDER]	= ZmOperation.NEW_FOLDER;
		ZmApp.ACTION_CODES[ZmKeyMap.NEW_TAG]	= ZmOperation.NEW_TAG;
	}
};

/**
 * Stores information about an app. Note: Setting a value that evaluates to
 * false (such as 0 or an empty string) will not do anything.
 * 
 * @param app				[constant]	app ID
 * @param mainPkg			[string]	main package that contains the app
 * @param nameKey			[string]	msg key for app name
 * @param icon				[string]	name of app icon class
 * @param chooserTooltipKey	[string]	msg key for app tooltip
 * @param viewTooltipKey	[string]	msg key for app view menu tooltip
 * @param defaultSearch		[constant]	type of item to search for in the app
 * @param organizer			[constant]	main organizer for this app
 * @param overviewTrees		[array]		list of tree IDs to show in overview
 * @param showZimlets		[boolean]	if true, show Zimlet tree in overview
 * @param assistants		[hash]		hash of assistant class names and required packages
 * @param searchTypes		[array]		list of types of saved searches to show in overview
 * @param gotoActionCode	[constant]	key action for jumping to this app
 * @param newActionCode		[constant]	default "new" action code
 * @param actionCodes		[hash]		keyboard actions mapped to operations
 * @param newItemOps		[hash]		IDs of operations that create a new item, and their text keys
 * @param newOrgOps			[hash]		IDs of operations that create a new organizer, and their text keys
 * @param qsViews			[array]		list of views to handle in query string
 * @param chooserSort		[int]		controls order of apps in app chooser toolbar
 * @param defaultSort		[int]		controls order in which app is chosen as default start app
 * @param trashViewOp		[constant]	menu choice for "Show Only ..." in Trash view
 * @param upsellUrl			[string]	URL for content of upsell
 */
ZmApp.registerApp =
function(app, params) {

	if (params.mainPkg)				{ ZmApp.MAIN_PKG[app]			= params.mainPkg; }
	if (params.nameKey)				{ ZmApp.NAME[app]				= params.nameKey; }
	if (params.icon)				{ ZmApp.ICON[app]				= params.icon; }
	if (params.chooserTooltipKey)	{ ZmApp.CHOOSER_TOOLTIP[app]	= params.chooserTooltipKey; }
	if (params.viewTooltipKey)		{ ZmApp.VIEW_TOOLTIP[app]		= params.viewTooltipKey; }
	if (params.defaultSearch)		{ ZmApp.DEFAULT_SEARCH[app]		= params.defaultSearch; }
	if (params.organizer)			{ ZmApp.ORGANIZER[app]			= params.organizer; }
	if (params.overviewTrees)		{ ZmApp.OVERVIEW_TREES[app]		= params.overviewTrees; }
	if (params.showZimlets)			{ ZmApp.SHOW_ZIMLETS[app]		= params.showZimlets; }
	if (params.assistants)			{ ZmApp.ASSISTANTS[app]			= params.assistants; }
	if (params.searchTypes) 		{ ZmApp.SEARCH_TYPES[app]		= params.searchTypes; }
	if (params.gotoActionCode)		{ ZmApp.GOTO_ACTION_CODE[app]	= params.gotoActionCode; }
	if (params.newActionCode)		{ ZmApp.NEW_ACTION_CODE[app]	= params.newActionCode; }
	if (params.qsViews)				{ ZmApp.QS_VIEWS[app]			= params.qsViews; }
	if (params.chooserSort)			{ ZmApp.CHOOSER_SORT[app]		= params.chooserSort; }
	if (params.defaultSort)			{ ZmApp.DEFAULT_SORT[app]		= params.defaultSort; }
	if (params.trashViewOp)			{ ZmApp.TRASH_VIEW_OP[app]		= params.trashViewOp; }
	if (params.upsellUrl)			{ ZmApp.UPSELL_URL[app]			= params.upsellUrl; }
	if (params.supportsMultiMbox)	{ ZmApp.SUPPORTS_MULTI_MBOX[app]= params.supportsMultiMbox; }

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
	
	if (params.newItemOps) {
		for (var op in params.newItemOps) {
			if (!op) { continue; }
			ZmApp.OPS_R[op] = app;
			ZmOperation.NEW_ITEM_OPS.push(op);
			ZmOperation.NEW_ITEM_KEY[op] = params.newItemOps[op];
		}
	}
	if (params.newOrgOps) {
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
};

// Public instance methods

ZmApp.prototype.toString = 
function() {
	return "ZmApp";
}

// Functions called during construction
ZmApp.prototype._defineAPI				= function() {};
ZmApp.prototype._registerSettings		= function() {};
ZmApp.prototype._registerOperations		= function() {};
ZmApp.prototype._registerItems			= function() {};
ZmApp.prototype._registerOrganizers		= function() {};
ZmApp.prototype._setupSearchToolbar		= function() {};
ZmApp.prototype._setupCurrentAppToolbar = function() {};
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
* Returns the app's name.
*/
ZmApp.prototype.getName =
function() {
	return this._name;
}

ZmApp.prototype.getDisplayName = function() {
	return ZmMsg[ZmApp.NAME[this._name]];
};

// Convenience functions that call through to app view manager. See ZmAppViewMgr for details.

ZmApp.prototype.setAppView =
function(view) {
	this._appViewMgr.setAppView(this._name, view);
}

ZmApp.prototype.createView =
function(viewName, elements, callbacks, isAppView, isTransient) {
	return this._appViewMgr.createView(viewName, this._name, elements, callbacks, isAppView, isTransient);
}

ZmApp.prototype.pushView =
function(name, force) {
	return this._appViewMgr.pushView(name, force);
}

ZmApp.prototype.popView =
function(force) {
	return this._appViewMgr.popView(force);
}

ZmApp.prototype.setView =
function(name, force) {
	return this._appViewMgr.setView(name, force);
}

ZmApp.prototype.stageView =
function(name) {
	return this._appViewMgr.setView(name);
}

ZmApp.prototype.addDeferredFolder =
function(type, obj, tree, path) {
	if (obj.id && !this._deferredFolderHash[obj.id]) {
		var params = {type:type, obj:obj, tree:tree, path:path};
		this._deferredFolders.push(params);
		this._deferredFolderHash[obj.id] = true;
	}
};

ZmApp.prototype.getRemoteFolderIds =
function() {
	// XXX: optimize by caching this list? It would have to be cleared anytime
	// folder structure changes
	var list = [];
	if (this._opc) {
		var type = ZmApp.ORGANIZER[this.getName()];

		// first, make sure there aren't any deferred folders that need to be created
		if (this._deferredFolders.length) {
			this._createDeferredFolders(type);
		}

		var tree = this._opc.getTreeController(type).getDataTree();
		var folders = tree ? tree.getByType(type) : [];
		for (var i = 0; i < folders.length; i++) {
			if (folders[i].isRemote())
				list.push(folders[i].id);
		}
	}
	return list;
};

/**
 * Creates the overview content for this app. The default implementation creates a ZmOverview
 * with standard options. Other apps may want to use different options, or create a DwtAccordion
 * or DwtComposite instead.
 * 
 * @param id	[string]*	unique identifier for overview object
 */
ZmApp.prototype.getOverviewPanelContent =
function() {
	if (this._overviewPanelContent) {
		return this._overviewPanelContent;
	}

	if (appCtxt.multiAccounts && ZmApp.SUPPORTS_MULTI_MBOX[this._name]) {
		// create accordion
		var accordionId = this.getOverviewPanelContentId();
		var accordion = this._overviewPanelContent = this._opc.createAccordion({accordionId:accordionId});
		accordion.addListener(DwtEvent.SELECTION, new AjxListener(this, this._accordionSelectionListener));
		// for now, we only care to show tooltip for offline client
		if (appCtxt.get(ZmSetting.OFFLINE)) {
			accordion.addListener(DwtEvent.ONMOUSEOVER, new AjxListener(this, this._accordionMouseoverListener));
		}

		// add an accordion item for each account, and create overview for main account
		var accts = appCtxt.getZimbraAccounts();
		this._overview = {};
		for (var i in accts) {
			var data = {};
			var acct = data.account = accts[i];
			if (acct.visible) {
				var params = {
					title: acct.getDisplayName(),
					data: data,
					icon:acct.getStatusIcon()
				};
				var item = accordion.addAccordionItem(params);
				acct.itemId = item.id;
				if (appCtxt.getActiveAccount() == acct) {
					this._activateAccordionItem(item);
				}
			}
		}
	} else {
		var params = this._getOverviewParams();
		var overview = this._overviewPanelContent = this._opc.createOverview(params);
		overview.set(this._getOverviewTrees());
	}

	return this._overviewPanelContent;
};

/**
 * Sets the overview tree to display this app's particular overview content.
 * 
 * @param reset		[boolean]*		if true, clear the content first
 */
ZmApp.prototype.setOverviewPanelContent =
function(reset) {
	if (reset) {
		this._overviewPanelContent = null;
	}

	// only set overview panel content if not in full screen mode
	var avm = appCtxt.getAppViewMgr();
	if (!avm.isFullScreen()) {
		var opc = this.getOverviewPanelContent();
		// if we're in mult-mbox mode, check if accordion is in-sync when changing apps
		if (appCtxt.multiAccounts && ZmApp.SUPPORTS_MULTI_MBOX[this._name]) {
			var activeItemId = appCtxt.getActiveAccount().itemId;
			if (this.accordionItem.id != activeItemId) {
				this.getOverviewPanelContent().getItem(appCtxt.getActiveAccount().itemId)
				var accordionItem = opc.getItem(activeItemId);
				if (accordionItem) {
					this._handleSetActiveAccount(accordionItem);
				}
			}
		}
		avm.setComponent(ZmAppViewMgr.C_TREE, opc);
	}
};

/**
 * Returns the ID of the top-level overview object.
 */
ZmApp.prototype.getOverviewPanelContentId =
function() {
	return this._name;
};

/**
 * Returns the current ZmOverview, if any. Subclasses should ensure that a ZmOverview is returned.
 */
ZmApp.prototype.getOverview =
function() {
	return this._opc.getOverview(this.getOverviewId());
};

/**
 * Resets the current ZmOverview, if any.
 * 
 * @param overviewId	[string]*		ID of overview to reset
 */
ZmApp.prototype.resetOverview =
function(overviewId) {
	var overview = overviewId ? this._opc.getOverview(overviewId) : this.getOverview();
	if (overview) {
		overview.clear();
		overview.set(this._getOverviewTrees());
	}
};

/**
 * Returns the ID of the current ZmOverview, if any.
 */
ZmApp.prototype.getOverviewId =
function(account) {
	if (appCtxt.multiAccounts && ZmApp.SUPPORTS_MULTI_MBOX[this._name]) {
		if (!account) {
			// bug #20310 - default to main account if all else fails
			account = this.accordionItem
				? this.accordionItem.data.account
				: appCtxt.getMainAccount(true);
		}
		return ([this.getOverviewPanelContentId(), account.name].join(":"));
	}

	return this.getOverviewPanelContentId();
};

/**
 * Returns a hash of params with the standard overview options.
 */
ZmApp.prototype._getOverviewParams =
function() {
	return {
		overviewId:this.getOverviewPanelContentId(),
		posStyle:Dwt.ABSOLUTE_STYLE,
		selectionSupported:true,
		actionSupported:true,
		dndSupported:true,
		showUnread:true,
		hideEmpty:this._getHideEmpty()
	};
};

/**
 * Returns the list of trees to show in the overview for this app. Don't show
 * Folders unless mail is enabled. Other organizer types won't be created unless
 * their apps are enabled, so we don't need to check for them.
 */
ZmApp.prototype._getOverviewTrees =
function() {
	var list = ZmApp.OVERVIEW_TREES[this._name];
	var newList = [];
	for (var i = 0, count = list.length; i < count; i++) {
		if ((list[i] == ZmOrganizer.FOLDER && !appCtxt.get(ZmSetting.MAIL_ENABLED))) {
			continue;
		}
		newList.push(list[i]);
	}
	return newList;
};

/**
 * Returns a hash detailing which tree views to not show if they are empty.
 */
ZmApp.prototype._getHideEmpty =
function() {
	var hideEmpty = {};
	hideEmpty[ZmOrganizer.SEARCH] = true;
	hideEmpty[ZmOrganizer.ZIMLET] = true;

	return hideEmpty;
};

/**
 * Handles a click on on accordion item.
 * 
 * @param ev	[DwtUiEvent]	the click event
 */
ZmApp.prototype._accordionSelectionListener =
function(ev) {
	this._expandAccordionItem(ev.detail);
	return true;
};

ZmApp.prototype._accordionMouseoverListener =
function(ev) {
	if (ev.detail && ev.item) {
		var account = ev.detail.data.account;
		ev.item.setToolTipContent(account.getToolTip());
	}
	return true;
};

ZmApp.prototype._expandAccordionItem =
function(accordionItem) {
	if (accordionItem == this.accordionItem) { return; }

	this.accordionItem = accordionItem;
	DBG.println(AjxDebug.DBG1, "Accordion switching to item: " + accordionItem.title);

	// hide and clear advanced search since it may have overviews for previous account
	if (appCtxt.get(ZmSetting.BROWSE_ENABLED)) {
		var searchCtlr = appCtxt.getSearchController();
		var bvc = searchCtlr._browseViewController;
		if (bvc) {
			bvc.removeAllPickers();
			bvc.setBrowseViewVisible(false);
		}
	}

	var activeAcct = this.accordionItem.data.account;

	// enable/disable app tabs based on whether app supports multi-mbox
	var appChooser = appCtxt.getAppController().getAppChooser();
	for (var i = 0; i < ZmApp.APPS.length; i++) {
		var app = ZmApp.APPS[i];
		var b = appChooser.getButton(app);
		if (!b) { continue; }

		if (activeAcct.isMain) {
			b.setEnabled(true);
		} else {
			b.setEnabled(ZmApp.SUPPORTS_MULTI_MBOX[app]);
		}
	}

	var callback = new AjxCallback(this, this._handleSetActiveAccount, this.accordionItem);
	appCtxt.setActiveAccount(activeAcct, callback);
};

ZmApp.prototype._handleSetActiveAccount =
function(accordionItem) {
	var ac = appCtxt.getAppController();
	ac._setUserInfo();
	this._activateAccordionItem(accordionItem);
	this._setMiniCalForActiveAccount();

	// reset instant notify every time account changes
	if (appCtxt.get(ZmSetting.OFFLINE)) {
		var interval = (AjxEnv.isFirefox2_0up && !AjxEnv.isFirefox3up) ? 10000 : 100;
		AjxTimedAction.scheduleAction(new AjxTimedAction(ac, ac.setInstantNotify, true), interval);
	}
};

// NOTE: calendar overloads this method since it handles minical independently
ZmApp.prototype._setMiniCalForActiveAccount =
function() {
	// show/hide mini cal based on active account's pref
	// XXX: forces calendar core to load even if no accounts have minical enabled!
	var showMiniCal = appCtxt.get(ZmSetting.CAL_ALWAYS_SHOW_MINI_CAL);
	AjxDispatcher.run("ShowMiniCalendar", showMiniCal);
};

/**
 * Expands an accordion item by adding an overview to it and then populating the overview.
 * 
 * @param item		[DwtAccordionItem]		item to expand
 */
ZmApp.prototype._activateAccordionItem =
function(item) {
	this.accordionItem = item;
	var accordion = item.accordion;
	accordion.expandItem(item.id);
	var overviewId = this.getOverviewId();
	if (!this._opc.getOverview(overviewId)) {
		var params = this._getOverviewParams();
		params.overviewId = overviewId;
		var overview = this._opc.createOverview(params);
		overview.set(this._getOverviewTrees(), null, item.data.account);
		accordion.setItemContent(item.id, overview);
	}
};

/**
 * UGH: in offline mode, the main account is really the first non-main account
 * so reset the active account to it (spurs a GetInfoRequest and sets accordion)
 */
ZmApp.prototype._setActiveAcctForOffline =
function() {
	var activeAcct = appCtxt.getMainAccount(true);
	var accordionItem = activeAcct
		? this.getOverviewPanelContent().getItem(activeAcct.itemId) : null;

	if (accordionItem) {
		this._expandAccordionItem(accordionItem);
	}
};

/**
 * Provides a mechanism for an app to add to search params.
 * 
 * @param params	[hash]*		a hash of arguments for the search (see ZmSearchController::search)
 */
ZmApp.prototype.getSearchParams =
function(params) {
	return (params || {});
};

/**
 * Default function to run after an app's core package has been loaded. It assumes that the
 * classes that define items and organizers for this app are in the core package.
 */
ZmApp.prototype._postLoadCore =
function() {
	if (!appCtxt.isChildWindow) {
		this._setupDropTargets();
	}
};

/**
 * Default function to run after an app's main package has been loaded.
 */
ZmApp.prototype._postLoad =
function(type) {
	if (type) {
		this._createDeferredFolders(type);
	}
	this._handleDeferredNotifications();
};

/**
 * Standard method for handling arrival of <refresh> block by resetting
 * the overview content.
 * 
 * @param refresh	[object]	refresh object (JSON)
 */
ZmApp.prototype._handleRefresh =
function(refresh) {
	if (this._overviewPanelContent) {
		this.resetOverview();
	}
};

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
 * Lazily create folders received in the initial <refresh> block.
 */
ZmApp.prototype._createDeferredFolders =
function(type) {
	for (var i = 0; i < this._deferredFolders.length; i++) {
		var params = this._deferredFolders[i];
		var nId = ZmOrganizer.normalizeId(params.obj.l);
		var parent = params.tree.getById(nId);
		var folder = ZmFolderTree.createFolder(params.type, parent, params.obj, params.tree, params.path);
		parent.children.add(folder); // necessary?
		folder.parent = parent;
		ZmFolderTree._traverse(folder, params.obj, params.tree, params.path || []);
	}
	this._clearDeferredFolders();

	// XXX: this may no longer be necessary per fixes to bug 6082 and 4434
	var folderTree = appCtxt.getFolderTree();
	if (folderTree) {
		folderTree.getPermissions(type);
	}
};

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

// depending on "Always in New Window" option and whether Shift key is pressed,
// determine whether action should be in new window or not
ZmApp.prototype._inNewWindow =
function(ev) {
	var setting = appCtxt.get(ZmSetting.NEW_WINDOW_COMPOSE);
	return !ev ? setting : ((!setting && ev && ev.shiftKey) || (setting && ev && !ev.shiftKey));
};

ZmApp.prototype._handleCreateFolder =
function(create, org) {
	var parent = appCtxt.getById(create.l);
	if (parent && (create.view == ZmOrganizer.VIEWS[org][0])) {
		parent.notifyCreate(create);
		create._handled = true;
	}
};

ZmApp.prototype._handleCreateLink =
function(create, org) {
	var parent = appCtxt.getById(create.l);
	if (parent && (create.view == ZmOrganizer.VIEWS[org][0])) {
		parent.notifyCreate(create);
		// XXX: once bug #4434 is fixed, check if this call is still needed
		var folderTree = appCtxt.getFolderTree();
		if (folderTree) {
			folderTree.getPermissions(org);
		}
		create._handled = true;
	}
};

// Abstract/protected methods

/**
* Launches an app, which creates a view and shows it.
*/
ZmApp.prototype.launch =
function(params, callback) {
    if (callback) {
        callback.run();
    }
}

/**
* Run when the activation state of an app changes.
*/
ZmApp.prototype.activate =
function(active) {
	this._active = active;
	if (active) {
		// during startup, if in offline mode and in multi-mbox scenario, set
		// active the first non-main account
		if (appCtxt.inStartup &&
			appCtxt.multiAccounts &&
			appCtxt.get(ZmSetting.OFFLINE))
		{
			this._setActiveAcctForOffline();
		}
		this.setOverviewPanelContent();
	}
};

/**
* Clears an app's state.
*/
ZmApp.prototype.reset =
function(active) {
};
