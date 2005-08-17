/**
* @class
* Application for the preferences UI. This is where the preferences
* hook into the overall application.
*/
function LmPreferencesApp(appCtxt, container) {
	LmApp.call(this, LmLiquidMail.PREFERENCES_APP, appCtxt, container);
}

LmPreferencesApp.prototype = new LmApp;
LmPreferencesApp.prototype.constructor = LmPreferencesApp;

LmPreferencesApp.prototype.toString =
function() {
	return "LmPreferencesApp";
}

LmPreferencesApp.prototype.launch =
function(appCtxt) {
	this.getPrefController().show();
}

LmPreferencesApp.prototype.getPrefController =
function() {
	if (!this._prefController) {
		this._prefController = new LmPrefController(this._appCtxt, this._container, this);
	}
	return this._prefController;
}

LmPreferencesApp.prototype.getFilterController = function() {
	if (!this._filterController) {
		this._filterController = new LmFilterController(this._appCtxt, this._container, this);
	}
	return this._filterController;
}
