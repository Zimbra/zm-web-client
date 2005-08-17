function LmCalendarApp(appCtxt, container) {
	LmApp.call(this, LmLiquidMail.CALENDAR_APP, appCtxt, container);
}

LmCalendarApp.prototype = new LmApp;
LmCalendarApp.prototype.constructor = LmCalendarApp;

LmCalendarApp.prototype.toString = 
function() {
	return "LmCalendarApp";
}

LmCalendarApp.prototype.launch =
function(appCtxt) {
DBG.println("LAUNCHING CALENDAR APP!");
	var cc = this.getCalController();
	cc.show(cc._defaultView());
}

LmCalendarApp.prototype.setActive =
function(active) {
DBG.println("SETTING CAL APP ACTIVE!");
	if (active) {
		this.getCalController().show();
	}
}

LmCalendarApp.prototype.getCalController =
function() {
	if (!this._calController)
		this._calController = new LmCalViewController(this._appCtxt, this._container, this);
	return this._calController;
};

LmCalendarApp.prototype.getApptDetailController =
function () {
	if (!this._apptDetailController) {
		this._apptDetailController = 
		     new LmApptDetailController(this._appCtxt, this._container, this);
	}
	return this._apptDetailController;
};

