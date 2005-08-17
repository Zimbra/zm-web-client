/**
* @class LaGlobalStatsController 
* @contructor LaGlobalStatsController
* @param appCtxt
* @param container
* @param app
* @author Greg Solovyev
**/
function LaGlobalStatsController(appCtxt, container, app) {

	LaController.call(this, appCtxt, container, app);
}

LaGlobalStatsController.prototype = new LaController();
LaGlobalStatsController.prototype.constructor = LaGlobalStatsController;

LaGlobalStatsController.STATUS_VIEW = "LaGlobalStatsController.STATUS_VIEW";

LaGlobalStatsController.prototype.show = 
function() {
    if (!this._appView) {
		this._contentView = new LaGlobalStatsView(this._container, this._app);
		this._appView = this._app.createView(LaGlobalStatsController.STATUS_VIEW, [this._contentView]);
	}
	this._app.pushView(LaGlobalStatsController.STATUS_VIEW);
	this._app.setCurrentController(this);
}

/**
* @param nextViewCtrlr - the controller of the next view
* Checks if it is safe to leave this view. Displays warning and Information messages if neccesary.
**/
LaGlobalStatsController.prototype.switchToNextView = 
function (nextViewCtrlr, func, params) {
	func.call(nextViewCtrlr, params);
}