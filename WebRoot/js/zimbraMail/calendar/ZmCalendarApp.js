function ZmCalendarApp(appCtxt, container) {
	ZmApp.call(this, ZmZimbraMail.CALENDAR_APP, appCtxt, container);
}

ZmCalendarApp.prototype = new ZmApp;
ZmCalendarApp.prototype.constructor = ZmCalendarApp;

ZmCalendarApp.prototype.toString = 
function() {
	return "ZmCalendarApp";
}

ZmCalendarApp.prototype.launch =
function(appCtxt) {
DBG.println("LAUNCHING CALENDAR APP!");
	var cc = this.getCalController();
	cc.show(cc._defaultView());
}

ZmCalendarApp.prototype.setActive =
function(active) {
DBG.println("SETTING CAL APP ACTIVE!");
	if (active) {
		this.getCalController().show();
	}
}

ZmCalendarApp.prototype.getCalController =
function() {
	if (!this._calController)
		this._calController = new ZmCalViewController(this._appCtxt, this._container, this);
	return this._calController;
};

ZmCalendarApp.prototype.getApptDetailController =
function () {
	if (!this._apptDetailController) {
		this._apptDetailController = 
		     new ZmApptDetailController(this._appCtxt, this._container, this);
	}
	return this._apptDetailController;
};

