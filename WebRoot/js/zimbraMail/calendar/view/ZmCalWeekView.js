function ZmCalWeekView(parent, posStyle, dropTgt) {
	if (arguments.length == 0) return;
	ZmCalDayView.call(this, parent, posStyle, dropTgt, ZmController.CAL_WEEK_VIEW, 7);
}

ZmCalWeekView.prototype = new ZmCalDayView;
ZmCalWeekView.prototype.constructor = ZmCalWeekView;

ZmCalWeekView.prototype.toString = 
function() {
	return "ZmCalWeekView";
}
