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
* Creates a new app object.
* @constructor
* @class
* This class is a base class for app classes. "App" is a useful abstraction for a set of related
* functionality, such as mail, address book, or calendar. Looked at another way, an app is a 
* collection of one or more controllers.
*
* @param name				the name of the app
* @param appCtxt			global app context
* @param container			the element that contains everything but the banner (aka _composite)
* @param parentController	this is an optional parent window controller set by the child window
*/
function ZmApp(name, appCtxt, container, parentController) {

	if (arguments.length == 0) return;
	
	this._name = name;
	this._appCtxt = appCtxt;
	this._appViewMgr = appCtxt.getAppViewMgr();
	this._container = container;
	this._parentController = parentController;

	this._deferredFolders = [];
	this._deferredFolderHash = {};
	this._deferredNotifications = [];
}

// app information ("_R" means "reverse map")

// these are needed statically (before we get user settings)
ZmApp.CLASS				= {};	// constructor for app class
ZmApp.SETTING			= {};	// ID of setting that's true when app is enabled
ZmApp.LOAD_SORT			= {};	// controls order in which apps are instantiated

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

// map of key action to op
ZmApp.ACTION_CODES[ZmKeyMap.NEW_FOLDER]	= ZmOperation.NEW_FOLDER;
ZmApp.ACTION_CODES[ZmKeyMap.NEW_TAG]	= ZmOperation.NEW_TAG;

// assistants for each app; each valu is a hash where the key is the name of the
// assistant class and the value is the required package
ZmApp.ASSISTANTS		= {};

// indexes to control order of appearance/action
ZmApp.CHOOSER_SORT		= {};	// controls order of apps in app chooser toolbar
ZmApp.DEFAULT_SORT		= {};	// controls order in which app is chosen as default start app

// ordered lists of apps
ZmApp.APPS				= [];	// ordered list
ZmApp.DEFAULT_APPS		= [];	// ordered list

/**
 * Stores information about an app. Note: Setting a value that evaluates to
 * false (such as 0 or an empty string) will not do anything.
 * 
 * @param mainPkg			[string]	main package that composes the app
 * @param app				[constant]	app ID
 * @param nameKey			[string]	msg key for app name
 * @param icon				[string]	name of app icon class
 * @param chooserTooltipKey	[string]	msg key for app tooltip
 * @param viewTooltipKey	[string]	msg key for app view menu tooltip
 * @param defaultSearch		[constant]	type of item to search for in the app
 * @param organizer			[constant]	main organizer for this app
 * @param overviewTrees		[array]		list of tree IDs to show in overview
 * @param showZimlets		[boolean]	if true, show Zimlet tree in overview
 * @param assistants		[array]		hash of assistant class names and required packages
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
			ZmApp.ACTION_CODES_R[ac] = app;
			ZmApp.ACTION_CODES[ac] = params.actionCodes[ac];
		}
	}
	
	if (params.newItemOps) {
		for (var op in params.newItemOps) {
			ZmApp.OPS_R[op] = app;
			ZmOperation.NEW_ITEM_OPS.push(op);
			ZmOperation.NEW_ITEM_KEY[op] = params.newItemOps[op];
		}
	}
	if (params.newOrgOps) {
		for (var op in params.newOrgOps) {
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

// Public instance methodss

ZmApp.prototype.toString = 
function() {
	return "ZmApp";
}

// App API: Abstract methods for apps to override in response to certain events
ZmApp.prototype.startup			= function(result) {};		// run during startup
ZmApp.prototype.refresh			= function(refresh) {};		// run when a <refresh> block arrives
ZmApp.prototype.preNotify		= function(notify) {};		// run before handling notifications
ZmApp.prototype.deleteNotify	= function(ids) {};			// run on delete notifications
ZmApp.prototype.createNotify	= function(list) {};		// run on create notifications
ZmApp.prototype.modifyNotify	= function(list) {};		// run on modify notifications
ZmApp.prototype.postNotify		= function(notify) {};		// run after handling notifications
ZmApp.prototype.handleOp		= function(op, params) {};	// handle an operation

/**
* Returns the app's name.
*/
ZmApp.prototype.getName =
function() {
	return this._name;
}

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

ZmApp.prototype.addDeferredFolder =
function(type, obj, tree, path) {
	if (obj.id && !this._deferredFolderHash[obj.id]) {
		var params = {type:type, obj:obj, tree:tree, path:path};
		this._deferredFolders.push(params);
		this._deferredFolderHash[obj.id] = true;
	}
};

/**
 * Default function to run after an app's main package has been loaded.
 */
ZmApp.prototype._postLoad =
function(type) {
	this._createDeferredFolders(type);
	this._handleDeferredNotifications();
};

/**
 * Lazily create folders received in the initial <refresh> block.
 */
ZmApp.prototype._createDeferredFolders =
function(type) {
	for (var i = 0; i < this._deferredFolders.length; i++) {
		var params = this._deferredFolders[i];
		var parent = this._appCtxt.getById(params.obj.l);
		var folder = ZmFolderTree.createFolder(params.type, parent, params.obj, params.tree, params.path);
		parent.children.add(folder);
		folder.parent = parent;
	}
	this._deferredFolders = [];
	this._deferredFolderHash = {};

	this._appCtxt.getFolderTree().getPermissions(type);
};

/**
 * Defer notifications if this app's main package has not been loaded.
 * Returns true if notifications were deferred.
 * 
 * @param type	[string]	type of notification (delete, create, or modify)
 * @param data	[array]		list of notifications
 */
ZmApp.prototype._deferNotifications =
function(type, data) {
	var pkg = ZmApp.MAIN_PKG[this._name];
	if (pkg && !AjxDispatcher.loaded(pkg)) {
		this._deferredNotifications.push({type:type, data:data});
		return true;
	} else {
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
	var setting = this._appCtxt.get(ZmSetting.NEW_WINDOW_COMPOSE);
	return !ev ? setting : ((!setting && ev && ev.shiftKey) || (setting && ev && !ev.shiftKey));
};

ZmApp.prototype._handleCreateFolder =
function(create, org) {
	var parent = this._appCtxt.getById(create.l);
	if (parent && (create.view == ZmOrganizer.VIEWS[org][0])) {
		parent.notifyCreate(create);
		create._handled = true;
	}
};

ZmApp.prototype._handleCreateLink =
function(create, org) {
	var parent = this._appCtxt.getById(create.l);
	if (parent && (create.view == ZmOrganizer.VIEWS[org][0])) {
		parent.notifyCreate(create);
		// XXX: once bug #4434 is fixed, check if this call is still needed
		this._appCtxt.getFolderTree().getPermissions(org);
		create._handled = true;
	}
};

// Abstract methods

/**
* Launches an app, which creates a view and shows it.
*/
ZmApp.prototype.launch =
function(callback) {
    if (callback) {
        callback.run();
    }
}

/**
* Run when the activation state of an app changes.
*/
ZmApp.prototype.activate =
function(active) {
}

/**
* Clears an app's state.
*/
ZmApp.prototype.reset =
function(active) {
}
