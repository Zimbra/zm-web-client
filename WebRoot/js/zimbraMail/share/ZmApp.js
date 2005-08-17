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
function(viewName, elements, callbacks, isAppView) {
	return this._appViewMgr.createView(viewName, this._name, elements, callbacks, isAppView);
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
