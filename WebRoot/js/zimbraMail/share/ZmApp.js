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
}

// Public methods

ZmApp.prototype.toString = 
function() {
	return "ZmApp";
}

/**
* Returns the app's name.
*/
ZmApp.prototype.getName =
function() {
	return this._name;
}

/**
* Returns the app view manager.
*/
ZmApp.prototype.getAppViewMgr = 
function() {
	return this._appViewMgr;
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

// Abstract methods

/**
* Launches an app, which creates a view and shows it.
*/
ZmApp.prototype.launch =
function() {
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
