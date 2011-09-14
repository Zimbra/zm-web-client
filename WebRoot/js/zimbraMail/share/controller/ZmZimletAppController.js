/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2011 Zimbra, Inc.
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
 * This file defines a zimlet app controller.
 *
 */

/**
 * Creates a zimlet app controller.
 * @class
 * This class represents a zimlet application controller.
 * 
 * @param	{String}	name		the application name
 * @param	{ZmComposite}	container	the container
 * @param	{ZmApp}		app			the app
 * @extends		ZmController
 */
ZmZimletAppController = function(name, container, app) {
	if (arguments.length == 0) { return; }
	ZmController.call(this, container, app);
	this._name = name;
};

ZmZimletAppController.prototype = new ZmController;
ZmZimletAppController.prototype.constructor = ZmZimletAppController;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmZimletAppController.prototype.toString = function() {
	return "ZmZimletAppController";
};

//
// Public methods
//

/**
 * Gets the view.
 * 
 * @return	{ZmZimletAppView}	the view
 */
ZmZimletAppController.prototype.getView =
function() {
	if (!this._view) {
		// create components
		this._view = new ZmZimletAppView(this._container, this);
		this._toolbar = new ZmToolBar({parent:DwtShell.getShell(window)});

		// setup app elements
		var elements = {};
		elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar;
		elements[ZmAppViewMgr.C_APP_CONTENT] = this._view;

		// create callbacks
		var callbacks = {};
//		callbacks[ZmAppViewMgr.CB_PRE_HIDE] = new AjxCallback(this, this._preHideCallback);
//		callbacks[ZmAppViewMgr.CB_PRE_UNLOAD] = new AjxCallback(this, this._preUnloadCallback);
//		callbacks[ZmAppViewMgr.CB_POST_SHOW] = new AjxCallback(this, this._postShowCallback);
//		callbacks[ZmAppViewMgr.CB_POST_HIDE] = new AjxCallback(this, this._postHideCallback);

		// create app view
	    this._app.createView({viewId:this._getViewType(), elements:elements, callbacks:callbacks, isAppView:true, isTransient:true});
	}
	return this._view;
};

/**
 * Gets the toolbar.
 * 
 * @return	{ZmToolBar}	the tool bar
 */
ZmZimletAppController.prototype.getToolbar = function() {
	this.getView();
	return this._toolbar;
};

/**
 * Shows the controller.
 * 
 *@return boolean <code>true</code> if previous view was not dirty and hence could swap it with new view; else <code>false</code>
 */
ZmZimletAppController.prototype.show = function() {
	this.getView();
	return this._app.pushView(this._getViewType());
};

//
// Protected methods
//

/**
 * @private
 */
ZmZimletAppController.prototype._getViewType = function() {
	return this._name;
};