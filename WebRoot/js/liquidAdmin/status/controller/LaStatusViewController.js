/**
* @class LaStatusViewController 
* @contructor LaStatusViewController
* @param appCtxt
* @param container
* @param app
* @author Roland Schemers
* @author Greg Solovyev
**/
function LaStatusViewController(appCtxt, container, app) {

	LaController.call(this, appCtxt, container, app);
}

LaStatusViewController.prototype = new LaController();
LaStatusViewController.prototype.constructor = LaStatusViewController;

LaStatusViewController.STATUS_VIEW = "LaStatusViewController.STATUS_VIEW";

LaStatusViewController.prototype.show = 
function() {
    if (!this._appView) {
//		this._toolbar = new LaStatusToolBar(this._container);
		this._contentView = new LaStatusView(this._container, this._app);
		this._appView = this._app.createView(LaStatusViewController.STATUS_VIEW, [this._contentView]);
	}
	this._app.pushView(LaStatusViewController.STATUS_VIEW);
	this._app.setCurrentController(this);
}


/**
* @param nextViewCtrlr - the controller of the next view
* Checks if it is safe to leave this view. Displays warning and Information messages if neccesary.
**/
LaStatusViewController.prototype.switchToNextView = 
function (nextViewCtrlr, func, params) {
	func.call(nextViewCtrlr, params);
}