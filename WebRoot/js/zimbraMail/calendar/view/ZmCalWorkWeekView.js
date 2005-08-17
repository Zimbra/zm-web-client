function ZmCalWorkWeekView(parent, posStyle, dropTgt) {
	if (arguments.length == 0) return;
	ZmCalDayView.call(this, parent, posStyle, dropTgt, ZmController.CAL_WORK_WEEK_VIEW, 5);
}

ZmCalWorkWeekView.prototype = new ZmCalDayView;
ZmCalWorkWeekView.prototype.constructor = ZmCalWorkWeekView;

ZmCalWorkWeekView.prototype.toString = 
function() {
	return "ZmCalWorkWeekView";
}

