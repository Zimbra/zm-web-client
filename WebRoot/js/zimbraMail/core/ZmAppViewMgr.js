/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file contains the application view manager class.
 * 
 */
/**
 * Creates a layout manager from the given components.
 * @class
 * This class performs view and layout management. It expects there to be an HTML "skin" with
 * containers for various components. A container is an empty DIV with a known ID, so that we
 * can use it to place the corresponding component's content. A component is a widget; it is
 * the widget's HTML element that is positioned and sized based on the container's location and
 * size. The containers are part of the flow (they are positioned relatively), so their location
 * and size should be adjusted when necessary by the browser. The components are not children of
 * their containers within the DOM tree; they are children of the shell, and are positioned
 * absolutely. There appears to be a performance gain in keeping our HTML elements closer to the
 * top of the DOM tree, possibly because events do not propagate as far.
 * 
 * A handful of components are positioned statically. Those are generally the ones that appear
 * in the top row: banner, user info, etc. The positioning style is set through skin hints.
 * <br/>
 * <br/>
 * The following containers/components are supported:
 *
 * <ul>
 *  <li>banner: displays logo</li>
 *  <li>user info: user name</li>
 *  <li>quota: quota bar</li>
 *  <li>search bar: a text input and a few buttons</li>
 *  <li>search results toolbar: search tab only</li>
 *  <li>app chooser: a toolbar with buttons for changing apps</li>
 *  <li>new button: button for creating something new (email, contact, etc)</li>
 *  <li>tree: area on left that usually shows overview (folders, calendars, etc)</li>
 *  <li>tree footer: optionally displays mini-calendar</li>
 *  <li>top toolbar: a view-specific toolbar</li>
 *  <li>app content: used to present data to the user</li>
 *  <li>sash: a thin moveable vertical bar for resizing tree width</li>
 *  <li>taskbar: mainly for IM app</li>
 * </ul>
 *
 * <br/>
 * <br/>
 * In general, the app view manager responds to changes in the skin by having each of the
 * affected components adapt to its container's new location and/or size. That means that
 * we are dependent on the browser to relocate and resize the containers within the skin
 * properly.
 * <br/>
 * <br/>
 * The top and bottom toolbars and the app content are treated somewhat differently: they
 * come under the purview of "app view management". In general, an application represents a
 * view with a toolbar and a content area (which is often a list view). App view management
 * allows these views to be pushed and popped as if they were in a stack. That way, the views
 * only need be constructed once each.
 * <br/>
 * <br/>
 * The app view components are hidden and shown using two methods: z-index and relocation. 
 * Since every component hangs off the shell, it must have a z-index of at least Z_VIEW
 * (300) to be visible. It can be hidden by setting its z-index to Z_HIDDEN (100). Since
 * both IE and Firefox have display bugs related to the use of z-index, we use relocation as
 * well: a hidden component is positioned way off the screen. (In IE, SELECT fields don't
 * obey z-index, and in Firefox, the cursor bleeds through.) Note: the above was true in 2005,
 * and we haven't rewritten the app view manager substantially since then. Some day we may just
 * append the elements to their parent containers within the DOM, but until then we'll do
 * absolute positioning.
 * <br/>
 * <br/>
 * A view can open in a tab (in the row of app buttons) rather than replacing the current view. Those
 * are handled in essentially the same way (view push and pop), but they also manage the app button.
 * We currently manage only a single view in a tab.
 *
 * @author Conrad Damon
 * 
 * @param {DwtShell}		shell			the outermost containing element
 * @param {ZmController}	controller		the app controller
 * @param {Boolean}			isNewWindow		if <code>true</code>, we are a child window of the main app
 * @param {Boolean}			hasSkin			if <code>true</code>, the app has provided containing HTML
 */
ZmAppViewMgr = function(shell, controller, isNewWindow, hasSkin) {

	ZmAppViewMgr._setContainerIds();

	this._shell = shell;
	this._controller = controller;
	this._isNewWindow = isNewWindow;
	this._hasSkin = hasSkin;

	this._shellSz = this._shell.getSize();
	this._shell.addControlListener(this._shellControlListener.bind(this));
	this._sashSupported = (window.skin && typeof window.skin.setTreeWidth == "function");

	// history support
	if (appCtxt.get(ZmSetting.HISTORY_SUPPORT_ENABLED) && (!AjxEnv.isChrome && (!AjxEnv.isSafari || AjxEnv.isSafari5up)) && !isNewWindow && !AjxEnv.isPrism) {
		this._historyMgr = appCtxt.getHistoryMgr();
		this._historyMgr.addListener(this._historyChangeListener.bind(this));
	}
	this._hashViewId			= {};		// matches numeric hash to its view
	this._nextHashIndex			= 0;		// index for adding to browser history stack
	this._curHashIndex			= 0;		// index of current location in browser history stack
	this._noHistory				= false;	// flag to prevent history ops as result of programmatic push/pop view
	this._ignoreHistoryChange	= false;	// don't push/pop view as result of history.back() or history.forward()

	this._lastViewId	= null;	// ID of previously visible view
	this._currentViewId	= null;	// ID of currently visible view
	this._hidden		= [];	// stack of views that aren't visible
	this._toRemove		= [];	// views to remove from hidden on next view push

	this._view		= {};	// information about each view (components, controller, callbacks, app, etc)
	this._component	= {};	// component data (container, bounds, current control)
	this._app		= {};	// app info (current view)
	
	// reduce need for null checks
	this._emptyView = {component:{}, callback:{}, hide:{}};
	
	// Hashes keyed by tab ID
	this._viewByTabId = {};	// view for the given tab
	
	// view pre-emption
	this._pushCallback = this.pushView.bind(this);
	this._popCallback = this.popView.bind(this);
	
	// placeholder view
	this._createLoadingView();
};

ZmAppViewMgr.prototype.isZmAppViewMgr = true;
ZmAppViewMgr.prototype.toString = function() { return "ZmAppViewMgr"; };

// Components. A component must be a DwtControl. These component names must match the ones
// used in ZmSkin.

// components that are visible by default
ZmAppViewMgr.C_BANNER					= "banner";
ZmAppViewMgr.C_USER_INFO				= "userInfo";
ZmAppViewMgr.C_QUOTA_INFO				= "quota";
ZmAppViewMgr.C_SEARCH					= "search";
ZmAppViewMgr.C_APP_CHOOSER				= "appChooser";
ZmAppViewMgr.C_TREE						= "tree";
ZmAppViewMgr.C_TOOLBAR_TOP				= "topToolbar";
ZmAppViewMgr.C_NEW_BUTTON				= "newButton";
ZmAppViewMgr.C_APP_CONTENT				= "main";
ZmAppViewMgr.C_SASH						= "sash";

// components that are hidden by default
ZmAppViewMgr.C_TREE_FOOTER				= "treeFooter";
ZmAppViewMgr.C_SEARCH_RESULTS_TOOLBAR	= "searchResultsToolbar";
ZmAppViewMgr.C_TASKBAR					= "taskbar";

// deprecated, unused, and obsolete components

//ZmAppViewMgr.C_TOOLBAR_BOTTOM			= "bottomToolbar";
//ZmAppViewMgr.C_APP_CONTENT_FULL		= "fullScreen";
//ZmAppViewMgr.C_AD						= "adsrvc";
//ZmAppViewMgr.C_FOOTER					= "footer";
//ZmAppViewMgr.C_UNITTEST				= "unittest";
//ZmAppViewMgr.C_SEARCH_BUILDER			= "searchBuilder";
//ZmAppViewMgr.C_SEARCH_BUILDER_TOOLBAR	= "searchBuilderToolbar";
//ZmAppViewMgr.C_STATUS					= "status";

// Constants used to control component mappings and visibility
ZmAppViewMgr.GLOBAL	= "Global";
ZmAppViewMgr.APP	= "App";

// keys for getting container IDs
ZmAppViewMgr.CONT_ID_KEY = {};

// callbacks
ZmAppViewMgr.CB_PRE_HIDE	= "PRE_HIDE";
ZmAppViewMgr.CB_POST_HIDE	= "POST_HIDE";
ZmAppViewMgr.CB_PRE_SHOW	= "PRE_SHOW";
ZmAppViewMgr.CB_POST_SHOW	= "POST_SHOW";
ZmAppViewMgr.CB_PRE_UNLOAD	= "PRE_UNLOAD";

// used to continue when returning from callbacks
ZmAppViewMgr.PENDING_VIEW = "ZmAppViewMgr.PENDING_VIEW";

// history support
ZmAppViewMgr.BROWSER_BACK		= "BACK";
ZmAppViewMgr.BROWSER_FORWARD	= "FORWARD";

ZmAppViewMgr.TAB_BUTTON_MAX_TEXT = 15;

ZmAppViewMgr._setContainerIds =
function() {
	ZmAppViewMgr.CONT_ID_KEY[ZmAppViewMgr.C_BANNER]					= ZmId.SKIN_LOGO;
	ZmAppViewMgr.CONT_ID_KEY[ZmAppViewMgr.C_USER_INFO]				= ZmId.SKIN_USER_INFO;
	ZmAppViewMgr.CONT_ID_KEY[ZmAppViewMgr.C_QUOTA_INFO]				= ZmId.SKIN_QUOTA_INFO;
	ZmAppViewMgr.CONT_ID_KEY[ZmAppViewMgr.C_SEARCH]					= ZmId.SKIN_SEARCH;
	ZmAppViewMgr.CONT_ID_KEY[ZmAppViewMgr.C_SEARCH_RESULTS_TOOLBAR]	= ZmId.SKIN_SEARCH_RESULTS_TOOLBAR;
	ZmAppViewMgr.CONT_ID_KEY[ZmAppViewMgr.C_APP_CHOOSER]			= ZmId.SKIN_APP_CHOOSER;
	ZmAppViewMgr.CONT_ID_KEY[ZmAppViewMgr.C_TREE]					= ZmId.SKIN_TREE;
	ZmAppViewMgr.CONT_ID_KEY[ZmAppViewMgr.C_TREE_FOOTER]			= ZmId.SKIN_TREE_FOOTER;
	ZmAppViewMgr.CONT_ID_KEY[ZmAppViewMgr.C_TOOLBAR_TOP]			= ZmId.SKIN_APP_TOP_TOOLBAR;
	ZmAppViewMgr.CONT_ID_KEY[ZmAppViewMgr.C_NEW_BUTTON]				= ZmId.SKIN_APP_NEW_BUTTON;
	ZmAppViewMgr.CONT_ID_KEY[ZmAppViewMgr.C_APP_CONTENT]			= ZmId.SKIN_APP_MAIN;
	ZmAppViewMgr.CONT_ID_KEY[ZmAppViewMgr.C_SASH]					= ZmId.SKIN_SASH;
	ZmAppViewMgr.CONT_ID_KEY[ZmAppViewMgr.C_TASKBAR]				= ZmId.SKIN_TASKBAR;

	ZmAppViewMgr.ALL_COMPONENTS = AjxUtil.keys(ZmAppViewMgr.CONT_ID_KEY);
};


// Public methods

/**
 * Returns the requested component (widget) for the given view. The search is done
 * in the following order:
 * 		1. A component particular to that view
 * 		2. A component associated with the view's app
 * 		3. A global component	
 * 
 * @param {constant}	cid			component ID
 * @param {constant}	viewId		view ID
 */
ZmAppViewMgr.prototype.getViewComponent =
function(cid, viewId) {
	var view = this._view[viewId || this._currentViewId] || this._emptyView;
	var app = view.app || appCtxt.getCurrentAppName();
	var appView = this._view[app];
	var globalView = this._view[ZmAppViewMgr.GLOBAL];
	return ((view && view.component[cid]) ||
			(appView && appView.component[cid]) ||
			(globalView && globalView.component[cid]));
};
ZmAppViewMgr.prototype.getCurrentViewComponent = ZmAppViewMgr.prototype.getViewComponent;

// Returns the view based on the ID, handling global and app views
ZmAppViewMgr.prototype._getView =
function(viewId, app) {
	var view;
	if (viewId == ZmAppViewMgr.GLOBAL) {
		view = this._view[viewId] || this.createView({ viewId:viewId }); 
	}
	else if (viewId == ZmAppViewMgr.APP) {
		viewId = app || appCtxt.getCurrentAppName();
		view = this._view[viewId] || this.createView({ viewId:viewId }); 
	}
	else {
		view = this._view[viewId || this._currentViewId] || this.createView({ viewId:viewId }); 
	}
	return view;
};

/**
 * Registers the given components with the app view manager, and optionally displays them.
 *
 * @param	{constant}	viewId		the view id
 * @param	{hash}		components	a hash of component IDs and matching objects
 * @param	{boolean}	show		if <code>true</code>, show the components
 * @param	{constant}	app			name of app (for view ZmAppViewMgr.APP)
 */
ZmAppViewMgr.prototype.setViewComponents =
function(viewId, components, show, app) {

	DBG.println("avm", "-------------- SET components: " + AjxUtil.keys(components));
		
	// set up to add component to the appropriate map: global, app, or local
	var view = this._getView(viewId, app);
	if (!view) { return; }

	var list = [];
	for (var cid in components) {
		var comp = components[cid];
		if (!comp) { continue; }
		
		if (show) {
			// if we're replacing a visible component, hide the old one
			var oldComp = this._component[cid] && this._component[cid].control;
			if (oldComp && (oldComp != comp)) {
				this.showComponent(cid, false, oldComp);
			}
		}
		
		view.component[cid] = comp;
		
		if (this._hasSkin) {
			this.getContainer(cid, comp);
			list.push(cid);
		}

		if (show) {
			this.displayComponent(cid, true);
		}

		// TODO: move this code
		if (cid == ZmAppViewMgr.C_SASH) {
			if (this._sashSupported){
				comp.registerCallback(this._appTreeSashCallback, this);
				if (appCtxt.get(ZmSetting.FOLDER_TREE_SASH_WIDTH)) {
					var newWidth =  appCtxt.get(ZmSetting.FOLDER_TREE_SASH_WIDTH);
					var oldWidth = skin.getTreeWidth();
					this._appTreeSashCallback(newWidth - oldWidth);
				}
			}
			comp.setCursor("default");
		}
	}
	if (show) {
		this._fitToContainer(list);
	}
	this._checkTree(viewId);
};
ZmAppViewMgr.prototype.addComponents = ZmAppViewMgr.prototype.setViewComponents;

/**
 * Returns true if the given component should be hidden. Checks local, app, and then
 * global levels. At any level, the presence of a component trumps whether it is supposed
 * to be hidden.
 * 
 * @param {constant}	cid			component ID
 * @param {constant}	viewId		view ID
 */
ZmAppViewMgr.prototype.isHidden =
function(cid, viewId) {

	var view = this._view[viewId || this._currentViewId] || this._emptyView;
	var app = view.app || appCtxt.getCurrentAppName();
	var appView = this._view[app];
	var globalView = this._view[ZmAppViewMgr.GLOBAL];
	
	if		(view && view.component[cid])				{ return false; }	// view has comp
	else if (view && view.hide[cid])					{ return true; }	// view says hide
	else if (appView && appView.component[cid])			{ return false; }	// app has comp
	else if (appView && appView.hide[cid])				{ return true; }	// app says hide
	else if (globalView &&globalView.component[cid])	{ return false; }	// global comp
	else												{ return globalView && globalView.hide[cid]; }	// global hide
};

/**
 * Sets whether the given components should be hidden. That setting can appear at any
 * of three levels: global, app, or local.
 * 
 * @param	{constant}	viewId		the view id
 * @param	{array}		cidList		list of component IDs
 * @param	{boolean}	hide		if <code>true</code>, hide the components
 * @param	{constant}	app			name of app (for view ZmAppViewMgr.APP)
 */
ZmAppViewMgr.prototype.setHiddenComponents =
function(viewId, cidList, hide, app) {

	cidList = AjxUtil.toArray(cidList);

	// set up to add component to the appropriate map: global, app, or local
	var view = this._getView(viewId, app);
	if (!view) { return; }

	for (var i = 0; i < cidList.length; i++) {
		view.hide[cidList[i]] = hide;
	}
};

/**
 * Shows or hides the skin element (not always the same as the container) for a given
 * component.
 * 
 * @param {constant}	cid			the component ID
 * @param {boolean}		show		if true, show the skin element; otherwise hide it
 * @param {boolean}		noReflow	if true, tell skin to not refit all components
 */
ZmAppViewMgr.prototype.showSkinElement =
function(cid, show, noReflow) {
	if (this._hasSkin) {
		DBG.println("avm", (show ? "SHOW " : "HIDE ") + "SKIN element for: " + cid);
		skin.show(cid, show, noReflow);
	}
};

/**
 * Shows or hides the given component. It may still need to be positioned.
 * 
 * @param {constant}	cid		the component ID
 * @param {boolean}		show	if true, show the component; otherwise hide it
 * @param {DwtControl}	comp	component (optional)
 */
ZmAppViewMgr.prototype.showComponent =
function(cid, show, comp) {
	
	comp = comp || this.getViewComponent(cid);
	
	if (comp) {
		DBG.println("avm", (show ? "SHOW " : "HIDE ") + cid + " / " + comp.toString() + " / " + comp._htmlElId);
		if (show) {
			comp.zShow(true);
		}
		else {
			if (comp.getPosition() == Dwt.ABSOLUTE_STYLE) {
				comp.setLocation(Dwt.LOC_NOWHERE, Dwt.LOC_NOWHERE);
			}
			comp.zShow(false);
		}
	}
};

/**
 * Handles several tasks needed to make sure a component is actually visible.
 * 
 * @param {constant}	cid		the component ID
 * @param {boolean}		show	if true, show the component; otherwise hide it
 * @param {boolean}		doFit	if true, fit component to container
 */
ZmAppViewMgr.prototype.displayComponent =
function(cid, show, doFit) {
	this.showSkinElement(cid, show);
	this.showComponent(cid, show);
	if (doFit) {
		this._fitToContainer(cid);
	}
};

/**
 * Returns the requested container.
 * 
 * @param cid
 * @param comp
 */
ZmAppViewMgr.prototype.getContainer =
function(cid, comp) {

	var component = this._component[cid] = this._component[cid] || {};
	
	if (!component.container) {
		var contId = ZmAppViewMgr.CONT_ID_KEY[cid];
		var contEl = document.getElementById(contId);
		if (!contEl) {
			// skin may want to omit certain containers
			DBG.println(AjxDebug.DBG2, "Skin container '" + contId + "' not found.");
			return null;
		}
		component.container = contEl;
		if (comp) {
			contEl.innerHTML = "";

			// if the container has bounds, fit the component to it now to prevent resize flash
			var bounds = this._getContainerBounds(cid);
			var toolbarExists = Boolean(this.getViewComponent(ZmAppViewMgr.C_TOOLBAR_TOP));
			if (bounds) {
				DBG.println("avm", "SET BOUNDS " + cid + ": " + [bounds.x, bounds.y, bounds.width, bounds.height].join("/"));
				comp.setBounds(bounds.x, bounds.y, bounds.width, bounds.height, toolbarExists);
			}
		}
	}
	
	return component.container;
};

/**
 * Gets the ID of the view currently being displayed.
 * 
 * @return	{string}	the view id
 */
ZmAppViewMgr.prototype.getCurrentViewId =
function() {
	return this._currentViewId;
};

/**
 * Gets the type of the view currently being displayed.
 * 
 * @return	{string}	the view type
 */
ZmAppViewMgr.prototype.getCurrentViewType =
function() {
	var view = this._view[this._currentViewId];
	return view ? view.type : "";
};

/**
 * Gets the ID of the app view last displayed.
 * 
 * @return	{Object}	the last view
 */
ZmAppViewMgr.prototype.getLastViewId =
function() {
	return this._lastViewId;
};

/**
 * Gets the main content object of the given view.
 * 
 * @return	{Object}	the current main content view object
 */
ZmAppViewMgr.prototype.getCurrentView =
function(view) {
	return this.getViewComponent(ZmAppViewMgr.C_APP_CONTENT, view || this._currentViewId);
};

/**
 * Gets the current top-level view for the given app.
 *
 * @param {String}	app		the name of an app
 * 
 * @return	{string}	ID of the app's current view
 */
ZmAppViewMgr.prototype.getAppView =
function(app) {
	return this._app[app] && this._app[app].viewId;
};

/**
 * Sets the current top-level view for the given app. Should be called by an app (or controller) that
 * changes the top-level view of the app.
 *
 * @param {String}	app			the name of an app
 * @param {string}	viewId		the view ID
 */
ZmAppViewMgr.prototype.setAppView =
function(app, viewId) {
	if (!app || !viewId) { return; }
	var app = this._app[app];
	if (!app) {
		app = this._app[app] = {};
	}
	app.viewId = viewId;
};

/**
 * Returns a list of views of the given type. The views are the anonymous view objects used by the app view mgr.
 * 
 * @param {string}	type	a view type
 */
ZmAppViewMgr.prototype.getViewsByType =
function(type) {
	var list = [];
	for (var viewId in this._view) {
		var view = this._view[viewId];
		if (view.type == type) {
			list.push(view);
		}
	}
	return list;
};

/**
 * Registers a set of elements comprising an app view.
 *
 * @param	{Hash}			params				a hash of parameters
 * @param	{string}		params.viewId		the view ID
 * @param	{string}		params.viewType		the view type
 * @param	{String}		params.appName		the name of the owning app
 * @param	{Hash}			params.elements		a hash of elements
 * @param	{ZmController}	params.controller	controller responsible for this view
 * @param	{Hash}			params.callbacks 	a hash of functions to call before/after this view is shown/hidden
 * @param	{Boolean}		params.isAppView 	if <code>true</code>, this view is an app-level view
 * @param	{Boolean}		params.isTransient	if <code>true</code>, this view does not go on the hidden stack
 * @param	{Hash}			params.tabParams	the tab button params; view is opened in app tab instead of being stacked
 * @param	{Hash}			params.hide			components that aren't displayed in this view
 */
ZmAppViewMgr.prototype.createView =
function(params) {

	params = params || {};
	var viewId = params.viewId;
	if (!viewId) { return null; }
	DBG.println(AjxDebug.DBG1, "createView: " + viewId);
	
	var view = this._view[viewId] = {
		id:				viewId,
		type:			params.viewType || viewId,
		component:		params.elements || {},
		controller:		params.controller,
		callback:		params.callbacks || {},
		app:			params.appName,
		isAppView:		params.isAppView,
		isTransient:	params.isTransient,
		isFullScreen:	params.isFullScreen,
		hide:			AjxUtil.arrayAsHash(params.hide || [])
	}

	if (params.appName && !this._app[params.appName]) {
		this._app[params.appName] = {};
	}

	if (params.hide && this.isHidden(ZmAppViewMgr.C_NEW_BUTTON, viewId) && this.isHidden(ZmAppViewMgr.C_TREE_FOOTER, viewId) &&
		!this.isHidden(ZmAppViewMgr.C_TREE, viewId)) {
		
		view.needTreeHack = true;
		this.setHiddenComponents(viewId, ZmAppViewMgr.C_NEW_BUTTON, false);
	}
	
	if (!this._isNewWindow && params.tabParams) {
		view.tabParams	= params.tabParams;
		view.isTabView = true;
		this._viewByTabId[params.tabParams.id] = viewId;
	}
	
	return view;
};

/**
 * Makes the given view visible, pushing the previously visible one to the top of the
 * hidden stack.
 *
 * @param {int}		viewId		the ID of the app view to push
 * @param {Boolean}	force		if <code>true</code>, do not run callbacks
 *
 * @returns	{Boolean}	<code>true</code> if the view was pushed (is now visible)
 */
ZmAppViewMgr.prototype.pushView =
function(viewId, force) {

	if (!viewId) { return false; }
	DBG.println("avm", "-------------- PUSH view: " + viewId);
	
	viewId = this._viewByTabId[viewId] || viewId;
	var view = this._view[viewId] || this._emptyView;
	
	var isPendingView = (viewId == ZmAppViewMgr.PENDING_VIEW);
	if (!isPendingView && !view) {
		// view has not been created, bail
		return false;
	}

	if (isPendingView) {
		viewId = this._pendingView;
	}
	DBG.println(AjxDebug.DBG1, "pushView: " + viewId);

	var viewController = view.controller;

	// if same view, no need to hide previous view or check for callbacks
	if (viewId == this._currentViewId) {
		this._setViewVisible(viewId, true);
		// make sure the new content has focus
		if (viewController) {
			viewController._restoreFocus();
		}
		return true;
	}

	DBG.println(AjxDebug.DBG2, "hidden (before): " + this._hidden);

	if (view.isTabView) {
		var tp = view.tabParams;
		var handled = tp && tp.tabCallback && tp.tabCallback.run(this._currentViewId, viewId);
		if (tp && !handled) {
			var ac = appCtxt.getAppChooser();
			var button = ac.getButton(tp.id);
			if (!button) {
				button = ac.addButton(tp.id, tp);
				button.setHoverImage("Close");
			}
		}
	}

	if (isPendingView) {
		DBG.println(AjxDebug.DBG1, "push of pending view: " + this._pendingView);
		force = true;
	}

	var curView = this._view[this._currentViewId] || this._emptyView;
	if (!this._hideView(this._currentViewId, force || curView.isTabView)) {
		this._pendingAction = this._pushCallback;
		this._pendingView = viewId;
		return false;
	}
	this.setViewComponents(viewId, view.component);

	var curViewController = curView.controller;
	var isTransient = curView.isTransient || (curViewController && curViewController.isTransient(this._currentViewId, viewId));
	if (this._currentViewId && (this._currentViewId != viewId) && !isTransient) {
		this._hidden.push(this._currentViewId);
	}

	this._removeFromHidden(viewId);
	var temp = this._lastViewId;
	this._lastViewId = this._currentViewId;
	this._currentViewId = viewId;
	DBG.println(AjxDebug.DBG2, "app view mgr: current view is now " + this._currentViewId);

	if (!this._showView(viewId, force, (viewId != this._currentViewId))) {
		this._currentViewId = this._lastViewId;
		this._lastViewId = temp;
		this._pendingAction = this._pushCallback;
		this._pendingView = viewId;
		return false;
	}
	DBG.println(AjxDebug.DBG2, "hidden (after): " + this._hidden);

	// a view is being pushed - add it to browser history stack unless we're
	// calling this function as a result of browser Back or Forward
	if (this._noHistory) {
		DBG.println(AjxDebug.DBG2, "noHistory: push " + viewId);
		this._noHistory = false;
	} else {
		if (viewId != ZmId.VIEW_LOADING) {
			this._nextHashIndex++;
			this._curHashIndex = this._nextHashIndex;
			this._hashViewId[this._curHashIndex] = viewId;
			DBG.println(AjxDebug.DBG2, "adding to browser history: " + this._curHashIndex + "(" + viewId + ")");
			if (this._historyMgr) {
				this._historyMgr.add(this._curHashIndex);
			}
		}
	}

	this._layout(this._currentViewId);

	if (viewController && viewController.setCurrentViewId) {
		viewController.setCurrentViewId(viewId);
	}
	if (view.isAppView) {
		this.setAppView(view.app, viewId);
	}
	
	if (this._toRemove.length) {
		for (var i = 0; i < this._toRemove.length; i++) {
			this._removeFromHidden(this._toRemove[i]);
		}
		this._toRemove = [];
	}

	return true;
};

/**
 * Hides the currently visible view, and makes the view on top of the hidden stack visible.
 *
 * @param	{Boolean}	force	if <code>true</code>, do not run callbacks (which check if popping is OK)
 * @param	{int}	viewId	the view ID. Only pop if this is current view
 * @returns	{Boolean}		<code>true</code> if the view was popped
 */
ZmAppViewMgr.prototype.popView =
function(force, viewId, skipHistory) {

	DBG.println("avm", "-------------- POP view: " + viewId);
	
	viewId = this._viewByTabId[viewId] || viewId;
	var view = this._view[viewId] || this._emptyView;

	if (!this._currentViewId) {
		DBG.println(AjxDebug.DBG1, "ERROR: no view to pop");
		return false;
	}

	var isPendingView = (force == ZmAppViewMgr.PENDING_VIEW);
	if (isPendingView) {
		viewId = force;
		force = true;
	}

	// a tab view is the only type of non-current view we can pop; if it is not the
	// current view, push it first so that callbacks etc work as expected
	if (viewId && !isPendingView && (this._currentViewId != viewId)) {
		if (view.isTabView && (this._currentViewId != viewId)) {
			this.pushView(viewId);
		}
		else {
			return false;
		}
	}

	// handle cases where there are no views in the hidden stack (entry via deep link)
	var noHide = false, noShow = false;
	var goToApp = null;
	var curView = this._view[this._currentViewId] || this._emptyView;
	if (!this._hidden.length && !this._isNewWindow) {
		noHide = !curView.isTabView;
		noShow = true;
		var qsParams = AjxStringUtil.parseQueryString();
		if (qsParams && ((qsParams.view && qsParams.view == "compose") || qsParams.id)) {
			// if ZCS opened into compose or msg tab, take user to Mail
			goToApp = ZmApp.MAIL;
		}
	}

	DBG.println(AjxDebug.DBG1, "popView: " + this._currentViewId);
	DBG.println(AjxDebug.DBG2, "hidden (before): " + this._hidden);
	if (!this._hideView(this._currentViewId, force, noHide)) {
		this._pendingAction = this._popCallback;
		this._pendingView = null;
		return false;
	}

	this._deactivateView(this._currentViewId);

	if (curView.isTabView) {
		appCtxt.getAppChooser().removeButton(curView.tabParams.id);
	}
	
	if (noShow) {
		if (goToApp) {
			this._controller.activateApp(ZmApp.MAIL);
		}
		return !noHide;
	}

	this._lastViewId = this._currentViewId;
	this._currentViewId = this._hidden.pop();

	// close this window if no more views exist and it's a child window
	if (!this._currentViewId && this._isNewWindow) {
		window.close();
		return false;
	}

	DBG.println(AjxDebug.DBG2, "app view mgr: current view is now " + this._currentViewId);
	if (!this._showView(this._currentViewId, this._popCallback, null, force, true)) {
		DBG.println(AjxDebug.DBG1, "ERROR: pop with no view to show");
		return false;
	}
	this._removeFromHidden(this._currentViewId);
	DBG.println(AjxDebug.DBG2, "hidden (after): " + this._hidden);
	DBG.println(AjxDebug.DBG2, "hidden (" + this._hidden.length + " after pop): " + this._hidden);

	// Move one back in the browser history stack so that we stay in sync, unless
	// we're calling this function as a result of browser Back
	if (this._historyMgr && !skipHistory) {
		if (this._noHistory) {
			DBG.println(AjxDebug.DBG2, "noHistory (pop)");
			this._noHistory = false;
		} else {
			this._ignoreHistoryChange = true;
			history.back();
		}
	}

	this._layout(this._currentViewId);

	return true;
};

/**
 * Makes the given view visible, and clears the hidden stack.
 *
 * @param 	{int}	viewId		the ID of the view
 * @param 	{Boolean}	force		if <code>true</code>, ignore pre-emption callbacks
 * @returns	{Boolean}	<code>true</code> if the view was set
 */
ZmAppViewMgr.prototype.setView =
function(viewId, force) {
	DBG.println(AjxDebug.DBG1, "setView: " + viewId);
	var result = this.pushView(viewId, force);
	if (result) {
		for (var i = 0; i < this._hidden.length; i++) {
			this._deactivateView(this._hidden[i]);
		}
		this._hidden = [];
	}
	return result;
};

/**
 * Moves the given view to the top of the hidden stack, so that it will
 * appear when the current view is popped.
 * 
 * @param {int}	viewId		the ID of the view
 */
ZmAppViewMgr.prototype.stageView =
function(viewId) {
	DBG.println(AjxDebug.DBG1, "stageView: " + viewId);
	this._removeFromHidden(viewId);
	this._hidden.push(viewId);
};

/**
 * Checks if the view is the app view.
 * 
 * @param	{int}	viewId	the view id
 * @return	{Boolean}	<code>true</code> if the view is the app view
 */
ZmAppViewMgr.prototype.isAppView =
function(viewId) {
	var view = this._view[viewId || this._currentViewId] || this._emptyView;
	return view.isAppView;
};

/**
 * Returns true if the view is full screen.
 * 
 * @param	{constant}	viewId		the view id
 * @return	{boolean}	<code>true</code> if full screen
 */
ZmAppViewMgr.prototype.isFullScreen =
function(viewId) {
	var view = this._view[viewId || this._currentViewId] || this._emptyView;
	return view.isFullScreen;
};

/**
* Shows the view that was waiting for return from a popped view's callback. Typically, the
* popped view's callback will have put up some sort of dialog, and this function would be
* called by a listener on a dialog button.
*
* @param {Boolean}	show		if <code>true</code>, show the pending view
*/
ZmAppViewMgr.prototype.showPendingView =
function(show) {
	if (show && this._pendingAction) {
		this._pendingAction.run(ZmAppViewMgr.PENDING_VIEW);
	}

	// If a pop shield has been dismissed and we're not going to show the
	// pending view, and we got here via press of browser Back/Forward button,
	// then undo that button press so that the browser history is correct.
	if (!show) {
		if (this._browserAction == ZmAppViewMgr.BROWSER_BACK) {
			this._ignoreHistoryChange = true;
			history.forward();
		} else if (this._browserAction == ZmAppViewMgr.BROWSER_FORWARD) {
			this._ignoreHistoryChange = true;
			history.back();
		}
		this._browserAction = null;
	}
	this._pendingAction = this._pendingView = null;
};

/**
 * Fits all components to the container.
 */
ZmAppViewMgr.prototype.fitAll =
function() {
	this._fitToContainer(ZmAppViewMgr.ALL_COMPONENTS);
};

/**
 * Gets the currently pending view waiting to get pushed.
 * 
 * @return	{Object}	the pending view id
 */
ZmAppViewMgr.prototype.getPendingViewId = 
function() {
	return this._pendingView;
};

/**
 * Updates and shows the current view title in the title bar.
 */
ZmAppViewMgr.prototype.updateTitle = 
function() {
	this._setTitle(this._currentViewId);
};

/**
 * Sets the tab title.
 * 
 * @param	{int}	viewId	the view id
 * @param	{String}	text	the title
 */
ZmAppViewMgr.prototype.setTabTitle =
function(viewId, text) {
	var view = this._view[viewId || this._currentViewId] || this._emptyView;
	var tp = view.tabParams;
	var button = !appCtxt.isChildWindow && tp && appCtxt.getAppChooser().getButton(tp.id);
	if (button) {
		button.setText(AjxStringUtil.htmlEncode(text));
	}
};

/**
 * Checks if it is OK to unload the app (for example, user logs out, navigates away, closes browser).
 * 
 * @return	{Boolean}	<code>true</code> if OK to unload the app
 */
ZmAppViewMgr.prototype.isOkToUnload =
function() {
	for (var viewId in this._view) {
		var view = this._view[viewId];
		var callback = view && view.callback && view.callback[ZmAppViewMgr.CB_PRE_UNLOAD];
		if (callback) {
			DBG.println(AjxDebug.DBG2, "checking if ok to unload " + viewId);
			var okToContinue = callback.run(viewId);
			if (!okToContinue) { return false; }
		}
	}
	return true;
};

// Private methods

/**
 * @private
 */
ZmAppViewMgr.prototype._createLoadingView =
function() {
	this.loadingView = new DwtControl({parent:this._shell, className:"DwtListView",
									   posStyle:Dwt.ABSOLUTE_STYLE, id:ZmId.LOADING_VIEW});
	var el = this.loadingView.getHtmlElement();
	el.innerHTML = AjxTemplate.expand("share.App#Loading", this._htmlElId);
	var elements = {};
	elements[ZmAppViewMgr.C_APP_CONTENT] = this.loadingView;
	this.createView({viewId:ZmId.VIEW_LOADING, elements:elements});
};

/**
 * Locates and sizes the given list of components to fit within their containers.
 * 
 * @private
 */
ZmAppViewMgr.prototype._fitToContainer =
function(cidList, isIeTimerHack) {
	
	var cidList = AjxUtil.toArray(cidList);

	for (var i = 0; i < cidList.length; i++) {
		var cid = cidList[i];
		if (!isIeTimerHack && AjxEnv.isIE && (cid == ZmAppViewMgr.C_TASKBAR)) {
			// Hack for bug 36924: ie bar is in the middle of the screen when resizing ie.
			if (!this._ieHackAction) {
				this._ieHackAction = new AjxTimedAction(this, this._fitToContainer, [[ZmAppViewMgr.C_TASKBAR], true]);
			}
			AjxTimedAction.scheduleAction(this._ieHackAction, 1);
		}

		DBG.println(AjxDebug.DBG3, "fitting to container: " + cid);
		var cont = this.getContainer(cid);
		if (cont) {
			var comp = this.getViewComponent(cid);
			if (comp && (comp.getZIndex() != Dwt.Z_HIDDEN)) {
				var position = this._getComponentPosition(cid);
				var isStatic = (position == Dwt.STATIC_STYLE);
				
				// reset position if skin overrides default of absolute
				var compEl = comp.getHtmlElement();
				if (position) {
					compEl.style.position = position;
				}

				var component = this._component[cid];
				if (isStatic) {
					if (compEl.parentNode != cont) {
						DBG.println("avm", "APPEND " + cid);
						cont.appendChild(compEl);
					}
					if (comp.adjustSize) {
						comp.adjustSize();
					}
				} else {
					var contBds = Dwt.getBounds(cont);
					// take insets (border + padding) into account
					var insets = Dwt.getInsets(cont);
					Dwt.insetBounds(contBds, insets);
					
					// save bounds
					component.bounds = contBds;
					var toolbarExists = Boolean(this._component[ZmAppViewMgr.C_TOOLBAR_TOP].control);
					DBG.println("avm", "FIT " + cid + ": " + [contBds.x, contBds.y, contBds.width, contBds.height].join("/"));
					comp.setBounds(contBds.x, contBds.y, contBds.width, contBds.height, toolbarExists);
				}
				component.control = comp;
			}
		}
	}

	if (window.DBG && DBG.getDebugLevel() >= AjxDebug.DBG2) {
		this._debugShowMetrics(cidList);
	}
};

/**
 * @private
 */
ZmAppViewMgr.prototype._getComponentPosition =
function(cid) {
	return appCtxt.getSkinHint(cid, "position");
};

/**
 * @private
 */
ZmAppViewMgr.prototype._getContainerBounds =
function(cid) {
	// ignore bounds for statically laid-out components
	var position = this._getComponentPosition(cid);
	if (position == Dwt.STATIC_STYLE) { return null; }

	var container = this.getContainer(cid);
	if (container) {
		var bounds = Dwt.getBounds(container);
		// take insets (border + padding) into account
		var insets = Dwt.getInsets(container);
		Dwt.insetBounds(bounds, insets);
		return bounds;
	}
	return null;
};

/**
 * Performs manual layout of the components, absent a containing skin. Currently assumes
 * that there will be a top toolbar and app content.
 * 
 * @private
 */
ZmAppViewMgr.prototype._layout =
function(view) {
	// if skin, elements already laid out by being placed in their containers
	if (this._hasSkin) { return; }
	
	var topToolbar = this.getViewComponent(ZmAppViewMgr.C_TOOLBAR_TOP);
	if (topToolbar) {
		var sz = topToolbar.getSize();
		var height = sz.y ? sz.y : topToolbar.getHtmlElement().clientHeight;
		topToolbar.setBounds(0, 0, this._shellSz.x, height);
	}
	var appContent = this.getCurrentView();
	if (appContent) {
		appContent.setBounds(0, height, this._shellSz.x, this._shellSz.y - height, Boolean(topToolbar));
	}
};

/**
 * Tries to hide the given view. First checks to see if the view has a callback
 * for when it is hidden. The callback must return true for the view to be hidden.
 * 
 * @private
 */
ZmAppViewMgr.prototype._hideView =
function(viewId, force, noHide) {

	if (!viewId) { return true; }

	var view = this._view[viewId] || this._emptyView;
	var okToContinue = true;
	var callback = view.callback[ZmAppViewMgr.CB_PRE_HIDE];
	if (callback) {
		DBG.println(AjxDebug.DBG2, "hiding " + viewId);
		okToContinue = callback.run(viewId, force);
	}
	if (okToContinue) {
		if (!noHide) {
			this._setViewVisible(viewId, false);
		}
        if (appCtxt.get(ZmSetting.USE_KEYBOARD_SHORTCUTS)) {
		    appCtxt.getKeyboardMgr().clearKeySeq();
        }
		DBG.println(AjxDebug.DBG2, viewId + " hidden");
		callback = view.callback[ZmAppViewMgr.CB_POST_HIDE];
		if (callback) {
			callback.run(viewId);
		}
	}

	return okToContinue;
};

/**
 * Makes the given view visible.
 * 
 * @private
 */
ZmAppViewMgr.prototype._showView =
function(viewId, force, isNewView) {

	if (!viewId) { return true; }
	
	var view = this._view[viewId] || this._emptyView;
	var okToContinue = true;
	var callback = view.callback[ZmAppViewMgr.CB_PRE_SHOW];
	if (callback) {
		DBG.println(AjxDebug.DBG2, "showing " + viewId);
		okToContinue = callback.run(viewId, isNewView, force);
	}
	if (okToContinue) {
		this._setViewVisible(viewId, true);
		DBG.println(AjxDebug.DBG2, viewId + " shown");
		callback = view.callback[ZmAppViewMgr.CB_POST_SHOW];
		if (callback) {
			callback.run(viewId, isNewView);
		}
	}
	appCtxt.notifyZimlets("onShowView", [viewId, isNewView]);

	return okToContinue;
};

/**
 * Shows or hides the components of a view.
 * 
 * @private
 */
ZmAppViewMgr.prototype._setViewVisible =
function(viewId, show) {

	DBG.println("avm", "-------------- " + (show ? "SHOW " : "HIDE ") + viewId);

	var view = this._view[viewId] || this._emptyView;
	
	var toFit = [];
	if (show) {

		// first, handle the differences between what this view hides and what the last view hides
		if (this._lastViewId) {
			for (var i = 0; i < ZmAppViewMgr.ALL_COMPONENTS.length; i++) {
				var cid = ZmAppViewMgr.ALL_COMPONENTS[i];
				var hidden = this.isHidden(cid, viewId);
				if (hidden != this.isHidden(cid, this._lastViewId)) {
					this.displayComponent(cid, !hidden);
				}
			}
		}

		// then display the components for this view 
		for (var i = 0; i < ZmAppViewMgr.ALL_COMPONENTS.length; i++) {
			var cid = ZmAppViewMgr.ALL_COMPONENTS[i];
			var oldComp = this.getViewComponent(cid, this._lastViewId);
			var comp = this.getViewComponent(cid, viewId);
			// bug 67499 - make sure any components left over from previous views are hidden
			if (oldComp && comp && oldComp != comp) {
				this.showComponent(cid, false, oldComp);
			}
			if (comp && !this.isHidden(cid, viewId)) {
				this.displayComponent(cid, true);
				toFit.push(cid);
			}
		}
	
		// fit the components now that we're done messing with the skin
		if (this._hasSkin) {
			this._fitToContainer(toFit);
		}
		
		this._setTitle(viewId);
		
		if (view.isTabView) {
			var tabId = view.tabParams.id;
			this._controller.setActiveTabId(tabId);
		}
		
		if (view.app) {
			this._controller.setActiveApp(view.app, viewId, view.isTabView);
		}
		
		this._checkTree(viewId);
	}
	else {
		// hiding a view is lightweight - just hide the component widgets
		for (var cid in view.component) {
			this.showComponent(cid, false);
		}
		// hide the app components too - if we're not changing apps, they will reappear
		// when the new view is shown. Done this way since this._lastViewId is not yet set.
		var appView = this._view[view.app];
		if (appView) {
			for (var cid in appView.component) {
				this.showComponent(cid, false);
			}
		}
	}
};

/**
 * Removes a view from the hidden stack.
 * 
 * @private
 */
ZmAppViewMgr.prototype._removeFromHidden =
function(view) {
	AjxUtil.arrayRemove(this._hidden, view);
};

/**
 * Tells a view's components that it has been hidden.
 * 
 * @private
 */
ZmAppViewMgr.prototype._deactivateView =
function(viewId) {
	viewId = viewId || this._currentViewId;
	var view = this._view[viewId] || this._emptyView;
	for (var cid in view.component) {
		var comp = this.getViewComponent(cid, viewId);
		if (comp && comp.deactivate) {
			comp.deactivate();
		}
	}
};

/**
 * Sets the browser title based on the view's APP_CONTENT component
 * @private
 */
ZmAppViewMgr.prototype._setTitle =
function(view) {
	var content = this.getCurrentView();
	if (content && content.getTitle) {
		var title = content.getTitle();
		Dwt.setTitle(title ? title : ZmMsg.zimbraTitle);
	}
};

// Listeners

/**
 * Handles shell resizing event.
 * 
 * @private
 */
ZmAppViewMgr.prototype._shellControlListener =
function(ev) {

	if (ev.oldWidth != ev.newWidth || ev.oldHeight != ev.newHeight) {
		this._shellSz.x = ev.newWidth;
		this._shellSz.y = ev.newHeight;
		var deltaWidth = ev.newWidth - ev.oldWidth;
		var deltaHeight = ev.newHeight - ev.oldHeight;
		DBG.println(AjxDebug.DBG1, "shell control event: dW = " + deltaWidth + ", dH = " + deltaHeight);
		if (this._isNewWindow) {
			var view = this._view[this._currentViewId] || this._emptyView
			if (view.component) {
				// reset width of top toolbar
				var topToolbar = view.component[ZmAppViewMgr.C_TOOLBAR_TOP]; //todo - something similar for new button here?
				if (topToolbar) {
					topToolbar.setSize(ev.newWidth, Dwt.DEFAULT);
				}
				// make sure to remove height of top toolbar for height of app content
				var appContent = this.getCurrentView();
				if (appContent) {
					appContent.setSize(ev.newWidth, ev.newHeight - topToolbar.getH());
				}
			}
		} else {
			this.fitAll();
		}
	}
};

/**
 * @private
 */
ZmAppViewMgr.prototype._debugShowMetrics =
function(components) {
	for (var i = 0; i < components.length; i++) {
		var cid = components[i];
		var cont = this.getContainer(cid);
		if (cont) {
			var contBds = Dwt.getBounds(cont);
			DBG.println("Container bounds for " + cid + ": " + contBds.x + ", " + contBds.y + " | " + contBds.width + " x " + contBds.height);
		}
	}
};

/**
 * Handles browser Back/Forward. We compare the new index to our current one
 * to see if the user has gone back or forward. If back, we pop the view,
 * otherwise we push the appropriate view.
 * 
 * @param {AjxEvent}	ev	the history event
 * 
 * @private
 */
ZmAppViewMgr.prototype._historyChangeListener =
function(ev) {
	if (appCtxt.inStartup) { return; }
	if (!(ev && ev.data)) { return; }
	if (this._ignoreHistoryChange) {
		this._ignoreHistoryChange = false;
		return;
	}

	var dlg = DwtBaseDialog.getActiveDialog();
	if (dlg && dlg.isPoppedUp()) {
		dlg.popdown();
	}

	var hashIndex = parseInt(ev.data);
	this._noHistory = true;
	var viewId = this._hashViewId[hashIndex];
	if (hashIndex == (this._curHashIndex - 1)) {
		// Back button has been pressed
		this._browserAction = ZmAppViewMgr.BROWSER_BACK;
		this.popView();
	} else if (hashIndex == (this._curHashIndex + 1)) {
		// Forward button has been pressed
		this._browserAction = ZmAppViewMgr.BROWSER_FORWARD;
		this.pushView(viewId);
	} else {
		// Not sure where we are - just push the correct view
		this._browserAction = null;
		this.pushView(viewId);
	}
	this._curHashIndex = hashIndex;

	DBG.println(AjxDebug.DBG2, "History change to " + hashIndex + ", new view: " + viewId);
};

/**
 * Handles app/tree movement. If you move the sash beyond the max or min width, pins to the respective width.
 * 
 * @private
 */
ZmAppViewMgr.prototype._appTreeSashCallback =
function(delta) {
	if (!window.skin) { return; }

	// ask skin for width of tree, rather than hard-coding name of tree div here
	var currentWidth = skin.getTreeWidth();
	if (!currentWidth) { return 0; }

	DBG.println(AjxDebug.DBG3, "************ sash callback **************");
	DBG.println(AjxDebug.DBG3, "delta = " + delta);
	DBG.println(AjxDebug.DBG3, "shell width = " + this._shellSz.x);
	DBG.println(AjxDebug.DBG3, "current width = " + currentWidth);

	// MOW: get the min/max sizes from the skin.hints
	if (!this.treeMinSize) {
		this.treeMinSize = window.skin.hints.tree.minWidth || 150;
		this.treeMaxSize = window.skin.hints.tree.maxWidth || 300;
	}

	// pin the resize to the minimum and maximum allowable
	if (currentWidth + delta > this.treeMaxSize) {
		delta = Math.max(0, this.treeMaxSize - currentWidth);
	}
	if (currentWidth + delta < this.treeMinSize) {
		delta = Math.min(0, this.treeMinSize - currentWidth);
	}

	// tell skin to resize the tree to keep the separation of tree/skin clean
	var newTreeWidth = currentWidth + delta;

	skin.setTreeWidth(newTreeWidth);

	// call fitAll() on timeout, so we dont get into a problem w/ sash movement code
	var me = this;
	setTimeout(function(){me.fitAll()},0);
	return delta;
};

// If we're trying to show just the tree (and not the new button above or the tree footer below), we
// need to deal with the fact that the browser won't hide the new button TD. Take the tree component
// and fit it to a space that includes the new button TD.
ZmAppViewMgr.prototype._checkTree =
function(viewId) {
	
	var comp = this.getViewComponent(ZmAppViewMgr.C_TREE);
	if (!comp) { return; }
	
	var view = this._view[viewId] || this._emptyView;
	if (view.needTreeHack) {
		var cont = this.getContainer(ZmAppViewMgr.C_NEW_BUTTON);
		var newButtonBds = cont && Dwt.getBounds(cont);
		cont = this.getContainer(ZmAppViewMgr.C_TREE);
		var treeSize = cont && Dwt.getSize(cont);
		if (newButtonBds && treeSize && comp) {
			comp.setBounds(newButtonBds.x, newButtonBds.y, newButtonBds.width - 1, newButtonBds.height + treeSize.y - 2);
			comp.addClassName("panelTopBorder");	// need a top border with new button gone
			this._treeHackActive = true;
		}
	}
	else if (this._treeHackActive) {
		comp.delClassName("panelTopBorder");
		this._treeHackActive = false;
	}
};
