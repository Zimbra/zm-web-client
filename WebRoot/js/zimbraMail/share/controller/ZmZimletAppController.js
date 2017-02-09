/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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
 * @param	{DwtShell}	container	the container
 * @param	{ZmApp}		app			the app
 * 
 * @extends		ZmController
 */
ZmZimletAppController = function(name, container, app) {
	if (arguments.length == 0) { return; }
	ZmController.call(this, container, app);
	this._name = name;
};

ZmZimletAppController.prototype = new ZmController;
ZmZimletAppController.prototype.constructor = ZmZimletAppController;

ZmZimletAppController.prototype.isZmZimletAppController = true;
ZmZimletAppController.prototype.toString = function() { return "ZmZimletAppController"; };

//
// Public methods
//

// Note: If there's ever a need to make this a session controller (unlikely), we'll have to figure
// out some way to return an appropriate view type in a static context.
ZmZimletAppController.getDefaultViewType =
function() {
	return "zimlet";
};

ZmZimletAppController.prototype.getDefaultViewType =
function() {
	return this._name;
};

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
		var elements = this.getViewElements(null, this._view, this._toolbar);


		// create callbacks
		var callbacks = {};
//		callbacks[ZmAppViewMgr.CB_PRE_HIDE] = new AjxCallback(this, this._preHideCallback);
//		callbacks[ZmAppViewMgr.CB_PRE_UNLOAD] = new AjxCallback(this, this._preUnloadCallback);
//		callbacks[ZmAppViewMgr.CB_POST_SHOW] = new AjxCallback(this, this._postShowCallback);
//		callbacks[ZmAppViewMgr.CB_POST_HIDE] = new AjxCallback(this, this._postHideCallback);

		// create app view
	    this._app.createView({	viewId:			this.getDefaultViewType(),
								elements:		elements,
								controller:		this,
								callbacks:		callbacks,
								isAppView:		true,
								isTransient:	true});
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
	return this._app.pushView(this.getDefaultViewType());
};
