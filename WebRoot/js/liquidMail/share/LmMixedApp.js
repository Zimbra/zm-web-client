function LmMixedApp(appCtxt, container) {
	LmApp.call(this, LmLiquidMail.MIXED_APP, appCtxt, container);
}

LmMixedApp.prototype = new LmApp;
LmMixedApp.prototype.constructor = LmMixedApp;

LmMixedApp.prototype.toString = 
function() {
	return "LmMixedApp";
}

LmMixedApp.prototype.launch = function() {}

LmMixedApp.prototype.getMixedController =
function() {
	if (!this._mixedController)
		this._mixedController = new LmMixedController(this._appCtxt, this._container, this);
	return this._mixedController;
}
