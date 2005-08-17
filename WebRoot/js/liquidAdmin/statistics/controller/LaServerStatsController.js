/**
* @class LaServerStatsController 
* @contructor LaServerStatsController
* @param appCtxt
* @param container
* @param app
* @author Greg Solovyev
**/
function LaServerStatsController(appCtxt, container, app) {

	LaController.call(this, appCtxt, container, app);
}

LaServerStatsController.prototype = new LaController();
LaServerStatsController.prototype.constructor = LaServerStatsController;

LaServerStatsController.STATUS_VIEW = "LaServerStatsController.STATUS_VIEW";

LaServerStatsController.prototype.show = 
function(item) {
    if (!this._appView) {
		this._contentView = new LaServerStatsView(this._container);
		this._appView = this._app.createView(LaServerStatsController.STATUS_VIEW, [this._contentView]);
	}
	this._app.pushView(LaServerStatsController.STATUS_VIEW);
	this._app.setCurrentController(this);
	this._contentView.setObject(item);
}

/**
* @param nextViewCtrlr - the controller of the next view
* Checks if it is safe to leave this view. Displays warning and Information messages if neccesary.
**/
LaServerStatsController.prototype.switchToNextView = 
function (nextViewCtrlr, func, params) {
	func.call(nextViewCtrlr, params);
}