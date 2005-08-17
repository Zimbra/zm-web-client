function LmCalWeekView(parent, posStyle, dropTgt) {
	if (arguments.length == 0) return;
	LmCalDayView.call(this, parent, posStyle, dropTgt, LmController.CAL_WEEK_VIEW, 7);
}

LmCalWeekView.prototype = new LmCalDayView;
LmCalWeekView.prototype.constructor = LmCalWeekView;

LmCalWeekView.prototype.toString = 
function() {
	return "LmCalWeekView";
}
