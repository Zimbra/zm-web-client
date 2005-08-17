/**
* @class
* Application for the preferences UI. This is where the preferences
* hook into the overall application.
*/
function ZmPreferencesApp(appCtxt, container) {
	ZmApp.call(this, ZmZimbraMail.PREFERENCES_APP, appCtxt, container);
}

ZmPreferencesApp.prototype = new ZmApp;
ZmPreferencesApp.prototype.constructor = ZmPreferencesApp;

ZmPreferencesApp.prototype.toString =
function() {
	return "ZmPreferencesApp";
}

ZmPreferencesApp.prototype.launch =
function(appCtxt) {
	this.getPrefController().show();
}

ZmPreferencesApp.prototype.getPrefController =
function() {
	if (!this._prefController) {
		this._prefController = new ZmPrefController(this._appCtxt, this._container, this);
	}
	return this._prefController;
}

ZmPreferencesApp.prototype.getFilterController = function() {
	if (!this._filterController) {
		this._filterController = new ZmFilterController(this._appCtxt, this._container, this);
	}
	return this._filterController;
}
