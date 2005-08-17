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
function LmApp(name, appCtxt, container, parentController) {

	if (arguments.length == 0) return;
	
	this._name = name;
	this._appCtxt = appCtxt;
	this._appViewMgr = appCtxt.getAppViewMgr();
	this._container = container;
	this._parentController = parentController;
}

// Public methods

LmApp.prototype.toString = 
function() {
	return "LmApp";
}

/**
* Returns the app's name.
*/
LmApp.prototype.getName =
function() {
	return this._name;
}

/**
* Returns the app view manager.
*/
LmApp.prototype.getAppViewMgr = 
function() {
	return this._appViewMgr;
}

// Convenience functions that call through to app view manager. See LmAppViewMgr for details.

LmApp.prototype.setAppView =
function(view) {
	this._appViewMgr.setAppView(this._name, view);
}

LmApp.prototype.createView =
function(viewName, elements, callbacks, isAppView) {
	return this._appViewMgr.createView(viewName, this._name, elements, callbacks, isAppView);
}

LmApp.prototype.pushView =
function(name, force) {
	return this._appViewMgr.pushView(name, force);
}

LmApp.prototype.popView =
function(force) {
	return this._appViewMgr.popView(force);
}

LmApp.prototype.setView =
function(name, force) {
	return this._appViewMgr.setView(name, force);
}

// Abstract methods

/**
* Launches an app, which creates a view and shows it.
*/
LmApp.prototype.launch =
function() {
}

/**
* Run when the activation state of an app changes.
*/
LmApp.prototype.activate =
function(active) {
}

/**
* Clears an app's state.
*/
LmApp.prototype.reset =
function(active) {
}
