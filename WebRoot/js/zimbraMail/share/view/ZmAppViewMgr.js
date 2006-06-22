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
* Creates a layout manager from the given components.
* @constructor
* @class
* <p>This class performs view and layout management. It expects there to be an HTML "skin" with
* containers for various components. A container is an empty DIV with a known ID, so that we
* can use it to place the corresponding component's content. A component is a widget; it is
* the widget's HTML element that is positioned and sized based on the container's location and
* size. The containers are part of the flow (they are positioned relatively), so their location
* and size should be adjusted when necessary by the browser. The components are not children of
* their containers within the DOM tree; they are children of the shell, and are positioned 
* absolutely. There appears to be a performance gain in keeping our HTML elements closer to the
* top of the DOM tree, possibly because events do not propagate as far.
</p>
* 
* <p>The following containers/components are supported:</p>
*
* <p><ul>
*  <li>banner: displays logo</li>
*  <li>user info: shows user name and quota info</li>
*  <li>search bar: a text input and a few buttons</li>
*  <li>search builder: a tool that helps the user construct a search query (initially hidden)</li>
*  <li>search builder toolbar: toolbar for the search builder (initially hidden)</li>
*  <li>current app: displays the name of the current app and its custom View menu (if any)</li>
*  <li>app chooser: a vertical toolbar with buttons for changing apps, as well as Help etc.</li>
*  <li>tree: displays folders, saved searches, and tags</li>
*  <li>tree footer: displays mini-calendar (initially hidden)</li>
*  <li>status: displays status messages</li>
*  <li>sash: a thin moveable vertical bar for resizing the surrounding elements; it sits
*            between the tree and the app content</li>
*  <li>top toolbar: a view-specific toolbar</li>
*  <li>app content: used to present data to the user</li>
*  <li>bottom toolbar: not currently used</li>
* </ul></p>
*
* <p>In general, the app view manager responds to changes in the skin by having each of the
* affected components adapt to its container's new location and/or size. That means that
* we are dependent on the browser to relocate and resize the containers within the skin
* appropriately.</p>
*
* <p>The top and bottom toolbars and the app content are treated somewhat differently: they
* come under the purview of "app view management". In general, an application represents a
* view with a toolbar and a content area (which is often a list view). App view management
* allows these views to be pushed and popped as if they were in a stack. That way, the views
* only need be constructed once each.</p>
*
* <p>The app view components are hidden and shown using two methods: z-index and 
* relocation. Since every component hangs off the shell, it must have a z-index of at least Z_VIEW
* (300) to be visible. It can be hidden by setting its z-index to Z_HIDDEN (100). Since
* both IE and Firefox have display bugs related to the use of z-index, we use relocation as
* well: a hidden component is positioned way off the screen. (In IE, SELECT fields don't 
* obey z-index, and in Firefox, the cursor bleeds through.)</p>
*
* <p>In the current model of view management, each type of view (see ZmController) has only one
* instance at a given time. For example, we only ever track a single conv view. If we decide to do
* view caching, the model would have to change so that we can have multiple instances of views.</p>
*
* @author Conrad Damon
* @param shell			the outermost containing element
* @param controller		the app controller
* @param isNewWindow	true if we are a child window of the main app
* @param hasSkin		true if the app has provided containing HTML
*/
function ZmAppViewMgr(shell, controller, isNewWindow, hasSkin) {

	this._shell = shell;
	this._controller = controller;
	this._appCtxt = controller._appCtxt;
	this._isNewWindow = isNewWindow;
	this._hasSkin = hasSkin;

	this._shellSz = this._shell.getSize();
	this._controlListener = new AjxListener(this, this._shellControlListener);
	this._shell.addControlListener(this._controlListener);

	this._lastView = null;		// ID of previously visible view
	this._currentView = null;	// ID of currently visible view
	this._views = {};			// hash that gives names to app views
	this._hidden = [];			// stack of views that aren't visible
	
	this._appView = {};			// hash matching an app name to its current main view
	this._callbacks = {};		// view callbacks for when its state changes between hidden and shown
	this._viewApp = {};			// hash matching view names to their owning apps
	this._isAppView = {};		// names of top-level app views
	this._isPoppable = {}; 		// hash of viewId's and whether they are "poppable"

	this._compList = [];		// list of component IDs
	this._components = {};		// component objects (widgets)
	this._htmlEl = {};			// their HTML elements
	this._containers = {};		// containers within the skin
	this._contBounds = {};		// bounds for the containers

	// view preemption
	this._pushCallback = new AjxCallback(this, this.pushView);
	this._popCallback = new AjxCallback(this, this.popView);
}

// components
ZmAppViewMgr.C_BANNER					= "BANNER";
ZmAppViewMgr.C_USER_INFO				= "USER INFO";
ZmAppViewMgr.C_SEARCH					= "SEARCH";
ZmAppViewMgr.C_SEARCH_BUILDER			= "SEARCH BUILDER";
ZmAppViewMgr.C_SEARCH_BUILDER_TOOLBAR	= "SEARCH BUILDER TOOLBAR";
ZmAppViewMgr.C_CURRENT_APP				= "CURRENT APP";
ZmAppViewMgr.C_APP_CHOOSER				= "APP CHOOSER";
ZmAppViewMgr.C_TREE						= "TREE";
ZmAppViewMgr.C_TREE_FOOTER				= "TREE FOOTER";
ZmAppViewMgr.C_TOOLBAR_TOP				= "TOP TOOLBAR";
ZmAppViewMgr.C_TOOLBAR_BOTTOM			= "BOTTOM TOOLBAR";
ZmAppViewMgr.C_APP_CONTENT				= "APP CONTENT";
ZmAppViewMgr.C_STATUS					= "STATUS";
ZmAppViewMgr.C_SASH						= "SASH";

// keys for getting container IDs
ZmAppViewMgr.CONT_ID_KEY = {};
ZmAppViewMgr.CONT_ID_KEY[ZmAppViewMgr.C_BANNER]					= ZmSetting.SKIN_LOGO_ID;
ZmAppViewMgr.CONT_ID_KEY[ZmAppViewMgr.C_USER_INFO]				= ZmSetting.SKIN_USER_INFO_ID;
ZmAppViewMgr.CONT_ID_KEY[ZmAppViewMgr.C_SEARCH]					= ZmSetting.SKIN_SEARCH_ID;
ZmAppViewMgr.CONT_ID_KEY[ZmAppViewMgr.C_SEARCH_BUILDER]			= ZmSetting.SKIN_SEARCH_BUILDER_ID;
ZmAppViewMgr.CONT_ID_KEY[ZmAppViewMgr.C_SEARCH_BUILDER_TOOLBAR]	= ZmSetting.SKIN_SEARCH_BUILDER_TOOLBAR_ID;
ZmAppViewMgr.CONT_ID_KEY[ZmAppViewMgr.C_CURRENT_APP]			= ZmSetting.SKIN_CURRENT_APP_ID;
ZmAppViewMgr.CONT_ID_KEY[ZmAppViewMgr.C_APP_CHOOSER]			= ZmSetting.SKIN_APP_CHOOSER_ID;
ZmAppViewMgr.CONT_ID_KEY[ZmAppViewMgr.C_TREE]					= ZmSetting.SKIN_TREE_ID;
ZmAppViewMgr.CONT_ID_KEY[ZmAppViewMgr.C_TREE_FOOTER]			= ZmSetting.SKIN_TREE_FOOTER_ID;
ZmAppViewMgr.CONT_ID_KEY[ZmAppViewMgr.C_TOOLBAR_TOP]			= ZmSetting.SKIN_APP_TOP_TOOLBAR_ID;
ZmAppViewMgr.CONT_ID_KEY[ZmAppViewMgr.C_TOOLBAR_BOTTOM]			= ZmSetting.SKIN_APP_BOTTOM_TOOLBAR_ID;
ZmAppViewMgr.CONT_ID_KEY[ZmAppViewMgr.C_APP_CONTENT]			= ZmSetting.SKIN_APP_MAIN_ID;
ZmAppViewMgr.CONT_ID_KEY[ZmAppViewMgr.C_STATUS]					= ZmSetting.SKIN_STATUS_ID;
ZmAppViewMgr.CONT_ID_KEY[ZmAppViewMgr.C_SASH]					= ZmSetting.SKIN_SASH_ID;

// callbacks
ZmAppViewMgr.CB_PRE_HIDE	= 1;
ZmAppViewMgr.CB_POST_HIDE	= 2;
ZmAppViewMgr.CB_PRE_SHOW	= 3;
ZmAppViewMgr.CB_POST_SHOW	= 4;

// used to continue when returning from callbacks
ZmAppViewMgr.PENDING_VIEW = "ZmAppViewMgr.PENDING_VIEW";

// Public methods

ZmAppViewMgr.prototype.toString = 
function() {
	return "ZmAppViewMgr";
}

/**
* Registers the given components with the app view manager. This method should only be
* called once for any given component.
*
* @param components		a hash of component IDs and matching objects
* @param doFit			if true, go ahead and fit the components within their containers
* @param noSetZ			if true, do not set the z-index to VIEW
*/
ZmAppViewMgr.prototype.addComponents =
function(components, doFit, noSetZ) {
	var list = [];
	for (var cid in components) {
		this._compList.push(cid);
		var comp = components[cid];
		this._components[cid] = comp;
		var htmlEl = comp.getHtmlElement();
		this._htmlEl[cid] = htmlEl;
		if (this._hasSkin) {
			var contId = this._appCtxt.get(ZmAppViewMgr.CONT_ID_KEY[cid]);
			var contEl = document.getElementById(contId);
			if (contEl == null) {
				throw new AjxException("Skin container '" + contId + "' not found.");
			}
			this._containers[cid] = contEl;
			if (Dwt.contains(contEl, htmlEl))
				throw new AjxException("element already added to container: " + cid);		
			Dwt.removeChildren(contEl);
			list.push(cid);
		}

		if (!noSetZ)
			comp.zShow(true);

		if (cid == ZmAppViewMgr.C_SASH)
//			comp.registerCallback(this._sashCallback, this);
			comp.setCursor("default");
	}
	if (doFit)
		this._fitToContainer(list);
}

/**
* Shows/hides the search builder.
*
* @param visible	if true, the search builder is shown
*/
ZmAppViewMgr.prototype.showSearchBuilder =
function(visible) {
	DBG.println(AjxDebug.DBG1, "show search builder: " + visible);
	skin.showSearchBuilder(visible);
	this._components[ZmAppViewMgr.C_SEARCH_BUILDER_TOOLBAR].zShow(visible);
	this._components[ZmAppViewMgr.C_SEARCH_BUILDER].zShow(visible);
	var list = [ZmAppViewMgr.C_SEARCH_BUILDER, ZmAppViewMgr.C_SEARCH_BUILDER_TOOLBAR,
				ZmAppViewMgr.C_CURRENT_APP, ZmAppViewMgr.C_APP_CHOOSER, ZmAppViewMgr.C_TREE,
				ZmAppViewMgr.C_TREE_FOOTER, ZmAppViewMgr.C_TOOLBAR_TOP, ZmAppViewMgr.C_APP_CONTENT];
	this._fitToContainer(list);
	// search builder contains forms, and browsers have quirks around form fields and z-index
	if (!visible)
		this._components[ZmAppViewMgr.C_SEARCH_BUILDER].setLocation(Dwt.LOC_NOWHERE, Dwt.LOC_NOWHERE);
}

/**
* Shows/hides the tree footer (mini-calendar).
*
* @param visible	if true, the tree footer is shown
*/
ZmAppViewMgr.prototype.showTreeFooter =
function(visible) {
	DBG.println(AjxDebug.DBG1, "show tree footer: " + visible);
	skin.showTreeFooter(visible);
	this._components[ZmAppViewMgr.C_TREE_FOOTER].zShow(visible);
	this._fitToContainer([ZmAppViewMgr.C_TREE, ZmAppViewMgr.C_TREE_FOOTER]);
}

/**
* Returns the ID of the app view currently being displayed.
*/
ZmAppViewMgr.prototype.getCurrentViewId =
function() {
	return this._currentView;
}

/**
* Returns the ID of the app view last displayed.
*/
ZmAppViewMgr.prototype.getLastViewId =
function() {
	return this._lastView;
}

/**
* Returns the app view currently being displayed.
*/
ZmAppViewMgr.prototype.getCurrentView =
function() {
	var curView = this._views[this._currentView];
	return curView ? curView[ZmAppViewMgr.C_APP_CONTENT] : null;
}

/**
* Returns the current top-level view for the given app.
*
* @param app	the name of an app
*/
ZmAppViewMgr.prototype.getAppView =
function(app) {
	return this._appView[app];
}

/**
* Sets the current top-level view for the given app. Should be called by an app (or controller) that
* changes the top-level view of the app.
*
* @param app		the name of an app
* @param viewID		the ID of a view
*/
ZmAppViewMgr.prototype.setAppView =
function(app, viewId) {
	this._appView[app] = viewId;
}

/**
* Registers a set of elements comprising an app view.
*
* @param viewId			the ID of the view
* @param appName		the name of the owning app
* @param elements		a hash of elements
* @param callbacks 		functions to call before/after this view is shown/hidden
* @param isAppView 		whether this view is an app-level view
* @param isPoppable 	whether this view is allowed to get popped (i.e. Options, Compose, etc)
*/
ZmAppViewMgr.prototype.createView =
function(viewId, appName, elements, callbacks, isAppView, isPoppable) {
	DBG.println(AjxDebug.DBG1, "createView: " + viewId);

	this._views[viewId] = elements;
	this._callbacks[viewId] = callbacks ? callbacks : {};
	this._viewApp[viewId] = appName;
	this._isAppView[viewId] = isAppView;
	this._isPoppable[viewId] = isPoppable;
	this.addComponents(elements, false, true);
}

// XXX: should we have a destroyView() ?

/**
* Makes the given view visible, pushing the previously visible one to the top of the
* hidden stack.
*
* @param viewId		the ID of the app view to push
* @param force		don't run callbacks
* @returns			true if the view was pushed (is now visible)
*/
ZmAppViewMgr.prototype.pushView =
function(viewId, force) {
	// if same view, no need to go through hide/show
	if (viewId == this._currentView) {
		this._setTitle(viewId);
		return true;
	}

	DBG.println(AjxDebug.DBG1, "pushView: " + viewId);
	DBG.println(AjxDebug.DBG1, "hidden size: " + this._hidden.length);
	
	if (viewId == ZmAppViewMgr.PENDING_VIEW) {
		DBG.println(AjxDebug.DBG1, "push of pending view: " + this._pendingView);
		viewId = this._pendingView;
		force = true;
	}

	if (!this._hideView(this._currentView, this._pushCallback, viewId, force))
	 	return false;
	if (this._currentView && (this._currentView != viewId))
		this._hidden.push(this._currentView);

	this._removeFromHidden(viewId);
	var temp = this._lastView;
	this._lastView = this._currentView;
	this._currentView = viewId;
	DBG.println(AjxDebug.DBG2, "app view mgr: current view is now " + this._currentView);

	if (!this._showView(viewId, this._pushCallback, viewId, force, (viewId != this._currentView))){
		this._currentView = this._lastView;
		this._lastView = temp;
		return false;
	}

	this._layout(this._currentView);

	var viewController = this._views[viewId][ZmAppViewMgr.C_APP_CONTENT].getController();
	if (viewController && viewController.setCurrentView)
		viewController.setCurrentView(viewId);
	if (this._isAppView[viewId])
		this.setAppView(this._viewApp[viewId], viewId);
	return true;
}

/**
* Hides the currently visible view, and makes the view on top of the hidden stack visible.
*
* @param force	don't run callbacks
* @returns		true if the view was popped
*/
ZmAppViewMgr.prototype.popView =
function(force) {
	if (!this._currentView)
		throw new AjxException("no view to pop");

	DBG.println(AjxDebug.DBG1, "popView: " + this._currentView);
	if (!this._hideView(this._currentView, this._popCallback, null, force))
		return false;
	this._deactivateView(this._views[this._currentView]);
	this._lastView = this._currentView;
	this._currentView = this._hidden.pop();

	// close this window if no more views exist and it's a child window
	if (!this._currentView && this._isNewWindow) {
		window.close();
		return;
	}
	
	DBG.println(AjxDebug.DBG2, "app view mgr: current view is now " + this._currentView);
	if (!this._showView(this._currentView, this._popCallback, null, force, true))
		throw new AjxException("no view to show");
	this._removeFromHidden(this._currentView);

	this._layout(this._currentView);	
	
	this._controller.setActiveApp(this._viewApp[this._currentView], this._currentView);
	return true;
}

/**
* Makes the given view visible, and clears the hidden stack.
*
* @param viewId		the ID of the view
* @param force		ignore preemption callbacks
* @returns			true if the view was set
*/
ZmAppViewMgr.prototype.setView =
function(viewId, force) {
	DBG.println(AjxDebug.DBG1, "setView: " + viewId);
	var result = this.pushView(viewId, force);
	if (result) {
		for (var i = 0; i < this._hidden.length; i++) {
			var view = this._views[this._hidden[i]];
			this._deactivateView(view);
		}
		this._hidden = [];
	}
	return result;
}

ZmAppViewMgr.prototype.isAppView = 
function(viewId) {
	return this._isAppView[viewId];
}

/**
* Shows the view that was waiting for return from a popped view's callback. Typically, the
* popped view's callback will have put up some sort of dialog, and this function would be
* called by a listener on a dialog button.
*
* @param show		whether to show the pending view
*/
ZmAppViewMgr.prototype.showPendingView =
function(show) {
	if (show && this._pendingAction) {
		if (this._pendingAction.run(ZmAppViewMgr.PENDING_VIEW) && this._pendingView) {
			this._controller.setActiveApp(this._viewApp[this._pendingView], this._pendingView);
		}
	}
	this._pendingAction = this._pendingView = null;
}

/**
* Returns the currently pending view waiting to get pushed
*/
ZmAppViewMgr.prototype.getPendingViewId = 
function() {
	return this._pendingView;
}

ZmAppViewMgr.prototype.isPoppable = 
function(viewId) {
	return this._isPoppable[viewId] === true;
}

/**
* Destructor for this object.
*/
ZmAppViewMgr.prototype.reset = 
function() {
	this._shell.removeControlListener(this._controlListener);
	for (var i in this._views) {
		var elements = this._views[i];
		for (var j = 0; j < elements.length; j++) {
			for (var cid in elements[j]) {
//				this._components[cid].getHtmlElement().innerHTML = "";
				this._components[cid].dispose();
				this._components[cid] = null;
				this._containers[cid] = null;
				this._htmlEl[cid] = null;
			}
		}
	}
}

/**
* Shows the current view's title in the title bar.
*/
ZmAppViewMgr.prototype.updateTitle = 
function() {
	this._setTitle(this._currentView);
};

/**
* Checks if it is ok to log off.
* 
* @param action		action to perform if the user allows logout
*/
ZmAppViewMgr.prototype.isOkToLogOff =
function(pendingAction) {
	var okToContinue = true;
	var callback = this._callbacks[this._currentView] ? this._callbacks[this._currentView][ZmAppViewMgr.CB_PRE_HIDE] : null;
	if (callback) {
		DBG.println(AjxDebug.DBG2, "checking if ok to log off " + this._currentView);
		this._pendingAction = pendingAction;
		this._pendingView = null;
		okToContinue = callback.run(this._currentView, false);
	}
	return okToContinue;
};

// Private methods

// Locates and sizes the given list of components to fit within their containers.
ZmAppViewMgr.prototype._fitToContainer =
function(components) {
	for (var i = 0; i < components.length; i++) {
		var cid = components[i];
		DBG.println(AjxDebug.DBG3, "fitting to container: " + cid);
		var cont = this._containers[cid];
		if (cont) {
			var contBds = Dwt.getBounds(cont);
			var comp = this._components[cid];
			if (comp && (comp.getZIndex() != Dwt.Z_HIDDEN)) {
				comp.setBounds(contBds.x, contBds.y, contBds.width, contBds.height);
				this._contBounds[cid] = contBds;
			}
		}
	}
	if (DBG.getDebugLevel >= AjxDebug.DBG2)
		this._debugShowMetrics(components);
}

// Performs manual layout of the components, absent a containing skin. Currently assumes
// that there will be a top toolbar and app content.
ZmAppViewMgr.prototype._layout =
function(view) {
	// if skin, elements already laid out by being placed in their containers
	if (this._hasSkin) return; 
	
	var topToolbar = this._components[ZmAppViewMgr.C_TOOLBAR_TOP];
	var sz = topToolbar.getSize();
	var height = sz.y ? sz.y : topToolbar.getHtmlElement().clientHeight;
	topToolbar.setBounds(0, 0, this._shellSz.x, height);
	var appContent = this._components[ZmAppViewMgr.C_APP_CONTENT];
	appContent.setBounds(0, height, this._shellSz.x, this._shellSz.y - height);
};

// Tries to hide the given view. First checks to see if the view has a callback
// for when it is hidden. The callback must return true for the view to be hidden.
ZmAppViewMgr.prototype._hideView =
function(view, pendingAction, pendingView, skipCallback) {
	if (!view) return true;
	var okToContinue = true;
	var callback = this._callbacks[view] ? this._callbacks[view][ZmAppViewMgr.CB_PRE_HIDE] : null;
	if (callback && !skipCallback) {
		DBG.println(AjxDebug.DBG2, "hiding " + view + ", waiting on " + pendingView + "; skip = " + skipCallback);
		this._pendingAction = pendingAction;
		this._pendingView = pendingView;
		okToContinue = callback.run(view);
	}
	if (okToContinue) {
		this._setViewVisible(view, false);
		DBG.println(AjxDebug.DBG2, view + " hidden");
		callback = this._callbacks[view] ? this._callbacks[view][ZmAppViewMgr.CB_POST_HIDE] : null;
		if (callback)
			callback.run(view);
	}

	return okToContinue;
}

// Makes the given view visible.
ZmAppViewMgr.prototype._showView =
function(view, pendingAction, pendingView, skipCallback, isNewView) {
	var okToContinue = true;
	var callback = this._callbacks[view] ? this._callbacks[view][ZmAppViewMgr.CB_PRE_SHOW] : null;
	if (callback && !skipCallback) {
		DBG.println(AjxDebug.DBG2, "showing " + view + ", waiting on " + pendingView + "; skip = " + skipCallback);
		this._pendingAction = pendingAction;
		this._pendingView = pendingView;
		okToContinue = callback.run(view, isNewView);
	}
	if (okToContinue) {
		this._setViewVisible(view, true);
		DBG.println(AjxDebug.DBG2, view + " shown");
		callback = this._callbacks[view] ? this._callbacks[view][ZmAppViewMgr.CB_POST_SHOW] : null;
		if (callback)
			callback.run(view, isNewView);
	}

	return okToContinue;
}

// Makes elements visible/hidden by locating them off- or onscreen and setting
// their z-index.
ZmAppViewMgr.prototype._setViewVisible =
function(view, show) {
	var elements = this._views[view];
	if (show) {
		var list = [];
		for (var cid in elements) {
			list.push(cid);
			elements[cid].zShow(true);
			this._components[cid] = elements[cid];
		}
		if (this._hasSkin)
			this._fitToContainer(list);
		this._setTitle(view);
		this._controller.setActiveApp(this._viewApp[view], view);
	} else {
		for (var cid in elements) {
			DBG.println("hiding " + cid + " for view " + view);
			elements[cid].setLocation(Dwt.LOC_NOWHERE, Dwt.LOC_NOWHERE);
			elements[cid].zShow(false);
		}
	}
}

// Removes a view from the hidden stack.
ZmAppViewMgr.prototype._removeFromHidden =
function(view) {
	var newHidden = [];
	for (var i = 0; i < this._hidden.length; i++)
		if (this._hidden[i] != view)
			newHidden.push(this._hidden[i]);
	this._hidden = newHidden;
}

// Tells a view that it has been hidden.
ZmAppViewMgr.prototype._deactivateView =
function(view) {
	for (var cid in view) {
		var comp = this._components[cid];
		if (comp.deactivate)
			comp.deactivate();
	}
}

ZmAppViewMgr.prototype._setTitle =
function(view) {
	var elements = this._views[view];
	var content = elements[ZmAppViewMgr.C_APP_CONTENT];
	if (content && content.getTitle) {
		var title = content.getTitle();
		Dwt.setTitle(title ? title : ZmMsg.zimbraTitle);
	}
}

// Listeners

// Handles shell resizing event.
ZmAppViewMgr.prototype._shellControlListener =
function(ev) {
	if (ev.oldWidth != ev.newWidth || ev.oldHeight != ev.newHeight) {
		this._shellSz.x = ev.newWidth;
		this._shellSz.y = ev.newHeight;
		var deltaWidth = ev.newWidth - ev.oldWidth;
		var deltaHeight = ev.newHeight - ev.oldHeight;
		DBG.println(AjxDebug.DBG1, "shell control event: dW = " + deltaWidth + ", dH = " + deltaHeight);
		if (this._isNewWindow) {
			// reset width of top toolbar
			var topToolbar = this._views[this._currentView][ZmAppViewMgr.C_TOOLBAR_TOP];
			if (topToolbar)
				topToolbar.setSize(ev.newWidth, Dwt.DEFAULT);
			// make sure to remove height of top toolbar for height of app content
			var appContent = this._views[this._currentView][ZmAppViewMgr.C_APP_CONTENT];
			if (appContent)
				appContent.setSize(ev.newWidth, ev.newHeight - topToolbar.getH());
		} else {
			if (deltaHeight) {
				var list = [ZmAppViewMgr.C_APP_CHOOSER, ZmAppViewMgr.C_TREE, ZmAppViewMgr.C_TREE_FOOTER,
							ZmAppViewMgr.C_SASH, ZmAppViewMgr.C_APP_CONTENT, ZmAppViewMgr.C_STATUS];
				this._fitToContainer(list);
			}
			if (deltaWidth) {
				var list = [ZmAppViewMgr.C_BANNER, ZmAppViewMgr.C_SEARCH, ZmAppViewMgr.C_USER_INFO,
							ZmAppViewMgr.C_SEARCH_BUILDER, ZmAppViewMgr.C_SEARCH_BUILDER_TOOLBAR,
							ZmAppViewMgr.C_TOOLBAR_TOP, ZmAppViewMgr.C_APP_CONTENT, ZmAppViewMgr.C_TOOLBAR_BOTTOM];
				this._fitToContainer(list);
			}
		}
	}
}

ZmAppViewMgr.prototype._debugShowMetrics =
function(components) {
	for (var i = 0; i < components.length; i++) {
		var cid = components[i];
		var cont = this._containers[cid];
		if (cont) {
			var contBds = Dwt.getBounds(cont);
			DBG.println("Container bounds for " + cid + ": " + contBds.x + ", " + contBds.y + 
						" | " + contBds.width + " x " + contBds.height);
		}
	}
}

// Handles sash movement. An attempt to move the sash beyond the extent of the overview 
// panel or the view results in no movement at all.
ZmAppViewMgr.prototype._sashCallback =
function(delta) {
	
	DBG.println("************ sash callback **************");
	DBG.println("delta = " + delta);
	
//	skin.moveSash(delta);
	
	DBG.println("shell width = " + this._shellSz.x);

	// TODO: check overview min width
	var w = this._components[ZmAppViewMgr.C_APP_CONTENT].getSize().x;
	DBG.println("main app width = " + w);


//	delta = 100;
//	var table = document.getElementById("skin_td_left_chrome");
	var table = document.getElementById("skin_table_left_chrome");
//	var table = document.getElementById("skin_col_left");
	var tableSz = Dwt.getSize(table);
	DBG.println("left table width = " + tableSz.x);

//	var x = this._shellSz.x - tableSz.x;
//	DBG.println("inferred right side width (before) = " + x);

	Dwt.setSize(table, tableSz.x + delta, Dwt.DEFAULT);


	var list = [ZmAppViewMgr.C_CURRENT_APP, ZmAppViewMgr.C_TREE,
				ZmAppViewMgr.C_TREE_FOOTER, ZmAppViewMgr.C_STATUS];
	this._fitToContainer(list);
//	this._fitToContainer(this._compList);

	list = [ZmAppViewMgr.C_TOOLBAR_TOP, ZmAppViewMgr.C_APP_CONTENT];
	for (var i = 0; i < list.length; i++) {
		var cid = list[i];
		var newX = this._contBounds[cid].x + delta;
		var newWidth = this._contBounds[cid].width - delta;
		this._components[cid].setBounds(newX, Dwt.DEFAULT, newWidth, Dwt.DEFAULT);
	}

	return delta;



//	var x = this._shellSz.x - (tableSz.x + delta);
//	DBG.println("inferred right side width (after) = " + x);

//	table = document.getElementById("skin_table_main");
	table = document.getElementById("skin_col_main");
	tableSz = Dwt.getSize(table);
	DBG.println("right table width = " + tableSz.x);
	Dwt.setSize(table, tableSz.x - delta, Dwt.DEFAULT);



	var contSz = Dwt.getSize(this._appContentContainer);
//	var width = contSz.x;
	var width = this._contWidth;
	DBG.println("app cont width = " + this._contWidth);
	var height = contSz.y;
	if (viewId != null) {
		width -= delta;
		DBG.println("setting app stuff to width " + width);
		var topToolbar = this._views[viewId][0];
		topToolbar.setSize(width, Dwt.DEFAULT);
		var appContent = this._views[viewId][1];
		appContent.setSize(width, Dwt.DEFAULT);
		this._contWidth = width;
	}
	if (AjxEnv.isIE)
		return delta;

	var settings = this._appCtxt.getSettings();
	
	var currentApp = this._appCtxt.getCurrentAppToolbar()
	var caSz = currentApp.getSize();
	var width = caSz.x + delta;
	currentApp.setSize(width, Dwt.DEFAULT);
	DBG.println("current app width: " + caSz.x + " -> " + width);
	var currentAppEl = document.getElementById(settings.get(ZmSetting.SKIN_CURRENT_APP_ID));
	var caSz = Dwt.getSize(currentAppEl);
	Dwt.setSize(currentAppEl, width, Dwt.DEFAULT);
	DBG.println(" *** current app el width = " + currentAppEl.style.width);

	var statusEl = document.getElementById(settings.get(ZmSetting.SKIN_STATUS_ID));
//	var sbSz = Dwt.getSize(statusEl);
//	var sbSz = this._statusBox.getSize();
//	var width = sbSz.x + delta;
	this._statusBox.setSize(width, Dwt.DEFAULT);
	DBG.println("status box width: " + width);
	Dwt.setSize(statusEl, width, Dwt.DEFAULT);

	var ovSz = this._overviewPanel.getSize();
	var width = ovSz.x + delta;
	this._overviewPanel.setSize(width, Dwt.DEFAULT);
	DBG.println("overview width: " + ovSz.x + " -> " + width);
	var ovSz = Dwt.getSize(this._overviewContainer);
	Dwt.setSize(this._overviewContainer, ovSz.x + delta, Dwt.DEFAULT);

	return delta;
}
