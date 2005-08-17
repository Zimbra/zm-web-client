function LmDatePicker(parent) {

	LmPicker.call(this, parent, LmPicker.DATE);
}

LmDatePicker.prototype = new LmPicker;
LmDatePicker.prototype.constructor = LmDatePicker;

LmPicker.CTOR[LmPicker.DATE] = LmDatePicker;

LmDatePicker.prototype.toString = 
function() {
	return "LmDatePicker";
}

LmDatePicker.prototype._setupPicker =
function(parent) {
	var picker = new DwtComposite(parent);
	var selectId = Dwt.getNextId();
	var calId = Dwt.getNextId();
    
    var html = new Array(20);
    var i = 0;
    html[i++] = "<table cellpadding='3' cellspacing='0' border='0' style='width:100%;'>";
    html[i++] = "<tr align='center' valign='middle'>";
    html[i++] = "<td align='right' nowrap>" + LmMsg.date + ":</td>";
    html[i++] = "<td align='left' nowrap>";
    html[i++] = "<select name='op' id='" + selectId + "'>";
    html[i++] = "<option value='after'>" + LmMsg.isAfter + "</option>";
    html[i++] = "<option selected value='before'>" + LmMsg.isBefore + "</option>";
    html[i++] = "<option value='date'>" + LmMsg.isOn + "</option>";
    html[i++] = "</select>";
    html[i++] = "</td>";
    html[i++] = "</tr>";
    html[i++] = "<tr valign='left'>";
    html[i++] = "<td nowrap align='center' colspan='2' id='" + calId + "'></td>";
    html[i++] = "</tr>";
    html[i++] = "</table>";
	picker.getHtmlElement().innerHTML = html.join("");

	var cal = this._cal = new DwtCalendar(picker);
	cal.setDate(new Date());
	cal.addSelectionListener(new LsListener(this, this._calSelectionListener));
	
	var doc = this.getDocument();
	Dwt.getDomObj(doc, calId).appendChild(cal.getHtmlElement());
	var select = this._select = Dwt.getDomObj(doc, selectId);
	select.onchange = LmDatePicker._onChange;
	select._picker = this;
	this._updateQuery();
}

// Set date for second instance of date picker to 3 months back, select "after"
LmDatePicker.prototype.secondDate =
function() {
	this._select.selectedIndex = 0;
	var date = new Date(this._cal.getDate());
	LsDateUtil.roll(date, LsDateUtil.MONTH, -3);
	this._cal.setDate(date);
	this._updateQuery();
}

LmDatePicker.prototype._updateQuery = 
function() {
	var d = this._cal.getDate();
	if (d) {
		var date = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
		this.setQuery(this._select.value + ":" + date);
	} else {
		this.setQuery("");
	}
	this.execute();
}

LmDatePicker._onChange = 
function(ev) {
	var element = DwtUiEvent.getTarget(ev);
	var picker = element._picker;
	picker._updateQuery();
}

LmDatePicker.prototype._calSelectionListener =
function(ev) {
	this._updateQuery();
}
