function LmCalWorkWeekView(parent, posStyle, dropTgt) {
	if (arguments.length == 0) return;
	LmCalDayView.call(this, parent, posStyle, dropTgt, LmController.CAL_WORK_WEEK_VIEW, 5);
}

LmCalWorkWeekView.prototype = new LmCalDayView;
LmCalWorkWeekView.prototype.constructor = LmCalWorkWeekView;

LmCalWorkWeekView.prototype.toString = 
function() {
	return "LmCalWorkWeekView";
}

