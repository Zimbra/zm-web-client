function ZmMixedApp(appCtxt, container) {
	ZmApp.call(this, ZmZimbraMail.MIXED_APP, appCtxt, container);
}

ZmMixedApp.prototype = new ZmApp;
ZmMixedApp.prototype.constructor = ZmMixedApp;

ZmMixedApp.prototype.toString = 
function() {
	return "ZmMixedApp";
}

ZmMixedApp.prototype.launch = function() {}

ZmMixedApp.prototype.getMixedController =
function() {
	if (!this._mixedController)
		this._mixedController = new ZmMixedController(this._appCtxt, this._container, this);
	return this._mixedController;
}
