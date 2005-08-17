function LmTimePicker(parent) {

	LmPicker.call(this, parent, LmPicker.TIME);

    this._checkedItems = new Object();
}

LmTimePicker.prototype = new LmPicker;
LmTimePicker.prototype.constructor = LmTimePicker;

LmPicker.CTOR[LmPicker.TIME] = LmTimePicker;

LmTimePicker.prototype.toString = 
function() {
	return "LmTimePicker";
}

LmTimePicker.prototype._makeRow =
function(left, leftId, right, rightId) {
    var size = 20;
    var html = new Array(10);
    var i = 0;
    html[i++] = "<tr valign='middle'>";
    html[i++] = "<td align='left' nowrap><input id='" + leftId + "' type='checkbox' value='" + left + "'></input></td>";
    html[i++] = "<td align='left' nowrap>" + left + "</td>";
    html[i++] = "<td align='left' nowrap><input id='" + rightId + "' type='checkbox'></input></td>";
    html[i++] = "<td align='left' nowrap>" + right + "</td>";
    html[i++] = "</tr>";
	return html.join("");
}

LmTimePicker.prototype._setupPicker =
function(parent) {
    var picker = new DwtComposite(parent);

    var lastHourId = Dwt.getNextId();
    var last4HoursId = Dwt.getNextId();
    var todayId = Dwt.getNextId();
    var yesterdayId = Dwt.getNextId();
    var thisWeekId = Dwt.getNextId();
    var lastWeekId = Dwt.getNextId();
    var thisMonthId = Dwt.getNextId();
    var lastMonthId = Dwt.getNextId();
    var thisYearId = Dwt.getNextId();
    var lastYearId = Dwt.getNextId();

	var html = new Array(10);
	var i = 0;
	html[i++] = "<table cellpadding='2' cellspacing='0' border='0'>";
	html[i++] = this._makeRow(LmMsg.P_TIME_LAST_HOUR, lastHourId, LmMsg.P_TIME_LAST_4_HOURS, last4HoursId);
	html[i++] = this._makeRow(LmMsg.P_TIME_TODAY, todayId, LmMsg.P_TIME_YESTERDAY, yesterdayId);
	html[i++] = this._makeRow(LmMsg.P_TIME_THIS_WEEK, thisWeekId, LmMsg.P_TIME_LAST_WEEK, lastWeekId);
	html[i++] = this._makeRow(LmMsg.P_TIME_THIS_MONTH, thisMonthId, LmMsg.P_TIME_LAST_MONTH, lastMonthId);
	html[i++] = this._makeRow(LmMsg.P_TIME_THIS_YEAR, thisYearId, LmMsg.P_TIME_LAST_YEAR, lastYearId);
	html[i++] = "</table>";
	picker.getHtmlElement().innerHTML = html.join("");

	this._installOnChange(lastHourId, "after:-1hour");
	this._installOnChange(last4HoursId, "after:-4hour");
	this._installOnChange(todayId, "after:-1day");
	this._installOnChange(yesterdayId, "(after:-2day AND before:-1day)");
	this._installOnChange(thisWeekId, "after:-1week");
	this._installOnChange(lastWeekId, "(after:-2week AND before:-1week)");
	this._installOnChange(thisMonthId, "after:-1month");
	this._installOnChange(lastMonthId,"(after:-2month AND before:-1month)"); 
	this._installOnChange(thisYearId, "after:-1year"); 
	this._installOnChange(lastYearId, "(after:-2year AND before:-1year)"); 
}

LmTimePicker.prototype._installOnChange =
function(id, query) {
	var box = Dwt.getDomObj(this.getDocument(), id);
	box.onclick = LmTimePicker.prototype._onChange;
	box._query = query;
	box._picker = this;
}

LmTimePicker.prototype._onChange =
function(ev) {
	var element = DwtUiEvent.getTarget(ev);
	var picker = element._picker;
	if (element.checked)
		picker._checkedItems[element._query] = true;
	else
		delete picker._checkedItems[element._query];
	picker._updateQuery();
}

LmTimePicker.prototype._updateQuery = 
function() {
	var query = new Array();
	for (var q in this._checkedItems)
		query.push(q);
	var str = "";
	if (query.length > 1)
		str += "(";
	str += query.join(" OR ");
	if (query.length > 1)
		str += ")";
	this.setQuery(str);
	this.execute();
}
