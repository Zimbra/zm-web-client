/**
 * the data behind this is a user's schedule.
 *
 * Each row in the table should represent a date range of a user's 
 * schedule. 
 *
 * NOTES:
 * Not sure if I should use a DwtListView here, since there is no
 * list to display, and since the layout is very static. Hmm ...
 *
 * This needs to use an LmAppt as it's model data.... Maybe LmAppt
 * needs to handle the fetch of the data, and the creation of the busy blocks.
 */
function LmFreeBusyView (parent, userSchedules, start, end, appt, className, posStyle) {
	var clsName = className? className: "LmFreeBusyView";
	var pStyle = posStyle? posStyle: DwtControl.RELATIVE_STYLE;
	DwtComposite.call(this, parent, clsName, pStyle);
	this.userSchedules = userSchedules? userSchedules: new Array();
	// FOR TESTING
	//this.userSchedules = this._createDummySchedule();
	this.startDate = start;
	//this.endDate = end;
	this.endDate = new Date(start.getTime());
	LsDateUtil.roll(this.endDate, LsDateUtil.DAY, 1);
	// this has to come from an appointment
	this._appt = appt;
	this._currentAppt = new LmFreeBusyAppointment(appt.getStartDate(), appt.getEndDate(), this);
	//this._startApptDate = appt.getStartDate();
	//this._endApptDate = appt.getEndDate();
	// If this uses the list view, we will have to
	this._dummyBlock = new LmBusyBlock();
	this._selectionManager = new LsSelectionManager(this);
	this._aggregatedSchedule = new Array();
	this.enable();
	this.render();
}

LmFreeBusyView.prototype = new DwtComposite;
LmFreeBusyView.prototype.constructor = LmFreeBusyView;

LmFreeBusyView.ADD_NAME_MSG = "Click to add a name";

LmFreeBusyView.PAGINATE_FORWARD = 1;
LmFreeBusyView.PAGINATE_BACK = 2;

LmFreeBusyView.MAX_DURATION_MILLIS = 86400000;
LmFreeBusyView.BLOCK_TYPE_TO_CLASSNAME = {
	b: "busy",
	f: "free",
	t: "tentative",
	o: "ooo",
	n: "n_a"
};

LmFreeBusyView.TYPE_RANKING = {
	'n_a': 0,
	'free': 1,
	'tentative': 2,
	'busy': 3,
	'ooo': 4
};

LmFreeBusyView.CLASS_TO_HIGHLIGHTEDCLASS = {
	'free': 'freeHighlighted',
	'tentative': 'tentativeHighlighted',
	'busy': 'busyHighlighted',
	'ooo': 'oooHighlighted',
	'n_a': 'n_aHighlighted'
};

LmFreeBusyView.HIGHLIGHTEDCLASS_TO_CLASS = {
	'freeHighlighted': 	'free',
	'tentativeHighlighted': 'tentative',
	'busyHighlighted': 'busy',
	'oooHighlighted': 'ooo',
	'n_aHighlighted': 'n_a'
};

LmFreeBusyView.ADDR_SELECTED = "addrSelected";
LmFreeBusyView.ADDRESS_CELL = "addressCell";
LmFreeBusyView.ADDRESS_INPUT_CELL = "addressInputCell";
LmFreeBusyView.ADDRESS_INPUT_EMPTY_CELL = "addressInputEmptyCell";

LmFreeBusyView.hourMap = {
	0:"12", 1:"1", 2:"2", 3:"3", 4:"4", 5:"5",
	6:"6", 7:"7", 8:"8", 9:"9", 10:"10", 11:"11",
	12:"12", 13:"1", 14:"2", 15:"3", 16:"4",17:"5",
	18:"6", 19:"7", 20:"8", 21:"9", 22:"10", 23:"11"
};


LmFreeBusyView.prototype._createDummySchedule = function () {

	var a = new LmUserSchedule();
	a.blocks = [
			   new LmBusyBlock(1115742500000, 1115746200000, "b"), // 9-10:30
			   new LmBusyBlock(1115748000000, 1115751600000, "b"), // 11-12
			   new LmBusyBlock(1115755200000, 1115762400000, "b") // 13-15
			   ];
	a.id ="user1@db682461.liquidsys.com"
	var b = new LmUserSchedule ();
	b.blocks =[
			   new LmBusyBlock(1115740800000, 1115744400000, "b"), // 9-10
			   new LmBusyBlock(1115748000000, 1115751600000, "b"), // 11-12
			   new LmBusyBlock(1115755200000, 1115762400000, "b") // 13-15
			   ];
	b.id = "user2@db682461.liquidsys.com"

	var schedule = [a,b];
	
	return schedule;
};

LmFreeBusyView.ROW_HEIGHT = 21;
LmFreeBusyView.ID_PREFIX="LFBV_";

// ========================================================================
// main render methods
// ========================================================================

/**
 * Assume that the free busy request has been made before render has 
 * been called. That means that we can render the table in one pass, 
 * using colspan for the rendering of scheduled items.
 */
LmFreeBusyView.prototype.render = function () {
	//DBG.showTiming(true,"Start Render");
	var buf = new LsBuffer();
	var i = 0;
	var x = 0;
	//var containerHeight = this.parent.getH() - 88;
	var containerHeight = 240;
	var rowsToSubtract = 2;
	if (LsEnv.isIE) rowsToSubtract = 2;
	this._totalRows = (Math.round(containerHeight/LmFreeBusyView.ROW_HEIGHT) ) - rowsToSubtract;
	this._origTotalRows = this._totalRows;
	this._startDateId = Dwt.getNextId();
	this._startTimeHrId = Dwt.getNextId();
	this._startTimeMinId = Dwt.getNextId();
	this._startTimeAmPmId = Dwt.getNextId();
	this._endDateId = Dwt.getNextId();
	this._endTimeHrId = Dwt.getNextId();
	this._endTimeMinId = Dwt.getNextId();
	this._endTimeAmPmId = Dwt.getNextId();
	this._rangeDateId = Dwt.getNextId();
	this._scheduleContainerId = Dwt.getNextId();
	buf.append(
			   "<div class='LmFreeBusyView_headers'><table>",
			   "<colgroup><col width=100><col width=85 ><col width=50><col width=50><col width=55></colgroup>",
			   "<tbody><tr>",
			   "<td>Meeting start time:</td><td id='", this._startDateId, "'></td>",
			   "<td id='",this._startTimeHrId, "'></td>",
			   "<td id='",this._startTimeMinId, "'></td>",
			   "<td id='",this._startTimeAmPmId, "'></td>",
			   "</tr>",
			   "<tr><td>Meeting end time:</td><td id='",this._endDateId, "'></td>",
			   "<td id='",this._endTimeHrId, "'></td>",
			   "<td id='",this._endTimeMinId, "'></td>",
			   "<td id='",this._endTimeAmPmId, "'></td>",
			   "</tr></table></div>",

			   "<div class='LmFreeBusyView_key'>",
			   LsImg.getImageHtml(LmImg.CAL_FB_KEY),
			   "</div>",

			   "<div class='LmFreeBusyView_dateString' id='", this._rangeDateId, "'>", 
			   (LsDateUtil.getTimeStr(this.startDate,"%M %d, %Y")) ,"</div>",

			   //"<tr style='height:", containerHeight, ";'><td colspan=2 class='LmFreeBusyView_scheduleCol' id='", 
			   "<div class='LmFreeBusyView_scheduleCol' id='",
			   this._scheduleContainerId, "'>");

	this._renderSchedules(buf, containerHeight);
	// write the div with the invitees

	//buf.append("</td></tr></table>");
	buf.append("</div>");
	this.setContent(buf.toString());
	for ( var i = 0 ; i < this.userSchedules.length; ++i) {
		this._updateRow(this.userSchedules[i], i + 3);
// 		this._updateAddressRow(this.userSchedules[i], i + 3);
// 		this._updateScheduleRow(this.userSchedules[i], i + 3);
		this._updateAggregatedSchedule(this.userSchedules[i].blocks);
	}
	this._updateEmptyRow(i + 3);

	this._writeAggregatedRow()
	var datePickerCreation = function () {
		this._createDatePicker(this._currentAppt.getStartDate());
		this._createDatePicker(this._currentAppt.getEndDate(), true);

		// create the slider thingy
		var div = document.createElement('div');
		div.className = "LmFreeBusyView_slider";
		div.id = this._sliderId = LmFreeBusyView.ID_PREFIX + "_slider";
		// TODO: add drag handlers
		div.innerHTML = "<div class='LmFreeBusyView_slider_left'>&nbsp;</div><div class='LmFreeBusyView_slider_right'>&nbsp;</div>";
		this.highlightAppointment(div);
		document.getElementById(this._scheduleContainerId).appendChild(div);
		//DBG.println(LsStringUtil.htmlEncode(this.getHtmlElement().innerHTML));
	}
	var action = new LsTimedAction();
	action.obj = this;
	action.method = datePickerCreation;
	LsTimedAction.scheduleAction(action, 2);
};

LmFreeBusyView.prototype.highlightAppointment = function (optionalSliderDiv){
	var st = this.startDate.getTime();
	var et = this.endDate.getTime();
	var apptStartCell, dur;
	if (this._currentAppt.isInRange(st, et)) {
		apptStartCell = this._dateToCell(this._currentAppt.getStartDate());
		dur = this._currentAppt.getDuration();
	} else if (this._currentAppt.isStartInRange(st, et)){
		apptStartCell = this._dateToCell(this._currentAppt.getStartDate());
		dur = et - this._currentAppt.getStartTime();
	} else if (this._currentAppt.isEndInRange(st, et)) {
		apptStartCell = 0;
		dur = this._currentAppt.getEndTime() - st;
	} else if (this._currentAppt.beginsBeforeEndsAfter(st,et)){
		apptStartCell = 0;
		dur = 24*60*60*1000;
	} else {
		// hide the slider
		apptStartCell = 0;
		dur = -1;
	}

	this.highlightRange(apptStartCell, dur, optionalSliderDiv);
};

LmFreeBusyView.prototype.setData = function (schedules, appt) {
	this.enable();
	this.setSchedules(schedules);
	this.setAppointment(appt);
};

LmFreeBusyView.prototype.setAppointment = function (appt) {
	this._appt = appt;
	this._currentAppt.setDates(appt.getStartDate(), appt.getEndDate());
	this.highlightAppointment();
	this._updateDateTimes();
};

LmFreeBusyView.prototype._renderSchedules = function ( buf, containerHeight) {
	var hours = this._getViewHours();
	var start = this._getStartHour();
	var numCells = (hours * 2);

	this._scheduleTableId = Dwt.getNextId();
	buf.append("<table id='", this._scheduleTableId, "' class='LmFreeBusyView_scheduleCol_table' onmousedown='LsCore.objectWithId(", this.__internalId,")._handleScheduleMouseDown(event)'><colgroup><col class='adCol2'><col class='adCol3'><col class='endZone'>");
	var className = (LsEnv.isIE)? "LmFreeBusyView_scheduleCol_colIE": "LmFreeBusyView_scheduleCol_col";
	for (i = 0; i < numCells; ++i) {

		buf.append("<col class='",className,"'>");
	}
	buf.append("<col class='endZone'></colgroup>");
	buf.append("</colgroup>");

	var prevDayMessage = "<br>P<br>r<br>e<br>v<br>&nbsp;<br>d<br>a<br>y<br>";
	var nextDayMessage = "<br>N<br>e<br>x<br>t<br>&nbsp;<br>d<br>a<br>y<br>";

	// write the header Row
	buf.append("<tr class='firstRow'><td><div>&nbsp;</div></td><td><div>&nbsp;</div></td><td><div>&nbsp;</div></td>");
	var numHeaderCells = hours;
	for (i = 0; i < numHeaderCells; ++i) {
		buf.append("<td colspan=2><div class='hour'>", LmFreeBusyView.hourMap[ (start + i) % hours], "</div></td>");
	}
	buf.append("<td><div>&nbsp;</div></td></tr>");

	// write the row with the paginate areas
	buf.append("<tr class='hiddenRow'><td></td><td></td><td class='endZoneCell' onclick='LsCore.objectWithId(",this.__internalId,").paginate(", LmFreeBusyView.PAGINATE_BACK, ")' rowspan='", (this._totalRows + 300), "'><div class='endZoneContainer'>", LsImg.getImageHtml(LmImg.CAL_FB_PREV_DAY), "</div></td>");
	for (i = 0; i < numCells; ++i) {
		buf.append("<td></td>");
	}
	buf.append("<td class='endZoneCell' rowspan=", (this._totalRows + 300), " onclick='LsCore.objectWithId(",this.__internalId,").paginate(", LmFreeBusyView.PAGINATE_FORWARD, ")'><div class='endZoneContainer'>", LsImg.getImageHtml(LmImg.CAL_FB_NEXT_DAY,"height:249px; border-bottom:1px solid #9F9F9F"),"</div></td></tr>");
	// write the aggregate row
	buf.append("<tr><td class='", LmFreeBusyView.ADDRESS_CELL, "'><div class='mozWidth'>&nbsp;</div></td><td class='", LmFreeBusyView.ADDRESS_INPUT_CELL,"'><div>All Attendees</div></td>");

	var rowBuf = new Array();
	var idx = 0;
	for (i = 0; i < numCells; ++i) {
		rowBuf[idx++] = "<td class='free'></td>";
	}
	rowBuf[idx++] = "</tr>";
	buf.append(rowBuf.join(""));

	idx = 0;
	rowBuf.length = 0;
	rowBuf[idx++] = "<tr><td></td><td class='empty'></td>";
	for (i = 0; i < numCells; ++i) {
		rowBuf[idx++] = "<td class='free'></td>";
	}
	rowBuf[idx++] = "</tr>";
	var emptyRowString = rowBuf.join("");

	this._dummyEmptyRow = Dwt.parseHtmlFragment(emptyRowString,"TR");
	buf.append(emptyRowString);
	for (var i = 0 ; i < this._totalRows; ++i){
		buf.append(emptyRowString);
	}
			   
};

LmFreeBusyView.prototype._updateAggregatedSchedule = function (blocks) {
	for (var i = 0; i < blocks.length; ++i){
		this._aggregatedSchedule.push(blocks[i]);
	}
};

LmFreeBusyView.prototype._createAggregatedSchedule = function () {
	this._aggregatedSchedule = new Array();
	var len = this.userSchedules.length;
	for ( var i = 0; i < len; ++i) {
		var blocks = this.userSchedules[i].blocks;
		var innerLen = blocks.length;
		for (var j = 0 ; j < innerLen; ++j){
			this._aggregatedSchedule.push(blocks[j]);
		}
	}
};

LmFreeBusyView.prototype._getViewHours = function () {
	if (this._viewHours == null) {
		var duration = this.endDate.getTime() - this.startDate.getTime();
		this._viewHours = this._durationToCellNum(duration)/2;
	}
	return this._viewHours;
};

LmFreeBusyView.prototype._getStartHour = function () {
	return this.startDate.getHours();
};


LmFreeBusyView.prototype._dateToCell = function (date) {
	var start = this._getStartHour();
	var hours = date.getHours();
	var min = LsDateUtil.getRoundedMins(date, 30);
	if (min == 60){
		hours++;
	} else if (min == 30){
		hours += 0.5;
	}
	if (start > hours ){
		hours += (24 - start);
	} else {
		hours = hours - start;
	}
	var cell = hours *2 + start;
	return cell;
};

// ========================================================================
// date picker rendering methods
// ========================================================================

LmFreeBusyView.prototype._createDatePicker = function (date, isEnd) {
	var dateCell, timeHrCell, timeMinCell, timeAmPmCell;
	if (isEnd) {
		dateCell = document.getElementById(this._endDateId);
		timeHrCell = document.getElementById(this._endTimeHrId);
		timeMinCell = document.getElementById(this._endTimeMinId);
		timeAmPmCell = document.getElementById(this._endTimeAmPmId);
	} else {
		dateCell = document.getElementById(this._startDateId);
		timeHrCell = document.getElementById(this._startTimeHrId);
		timeMinCell = document.getElementById(this._startTimeMinId);
		timeAmPmCell = document.getElementById(this._startTimeAmPmId);
	}

	var dPick = new DwtButton(this);
	var dPickEl = dPick.getHtmlElement();
	dPick.setActionTiming(DwtButton.ACTION_MOUSEDOWN);
	var menu = new DwtMenu(dPick, DwtMenu.CALENDAR_PICKER_STYLE,
						   null, null, this);
	var cal = new DwtCalendar(menu);
	cal.__isEnd = (isEnd != null)? isEnd: false;
	cal.setDate(date);
	dPick.__cal = cal;
	cal.__date = date;
	var ls = new LsListener(this, this._dateChangeHandler);
	cal.addSelectionListener(ls);
	dPick.setMenu(menu, true);
	menu.setAssociatedObj(dPick);
	dPickEl.parentNode.removeChild(dPickEl);
	dateCell.appendChild(dPickEl);
	dPick.setText(this._getDateValueStr(date));

	//var sel = new DwtSelect(this, this._getSelectOptions(_TIME_OF_DAY_CHOICES));
	var sel = new DwtSelect(this, ["1","2","3","4","5","6","7","8","9","10","11","12"]);
	var hours = date.getHours() % 12;
	hours = (hours == 0)? 12: hours;
	sel.setSelectedValue("" + hours);
	var selEl = sel.getHtmlElement();
	sel.__cal = cal;
	var ls = new LsListener(this, this._hourChangeHandler);
	sel.addChangeListener(ls);
	selEl.parentNode.removeChild(selEl);
	timeHrCell.appendChild(selEl);

	var sel = new DwtSelect(this, ["00","15","30","45"]);
	sel.setSelectedValue(LsDateUtil.getRoundedMins(date, 15));
	var selEl = sel.getHtmlElement();
	sel.__cal = cal;
	var ls = new LsListener(this, this._minuteChangeHandler);
	sel.addChangeListener(ls);
	selEl.parentNode.removeChild(selEl);
	timeMinCell.appendChild(selEl);

	var sel = new DwtSelect(this, ["AM", "PM"]);
	sel.setSelectedValue( (date.getHours() >= 12)? "PM": "AM");
	var selEl = sel.getHtmlElement();
	sel.__cal = cal;
	var ls = new LsListener(this, this._amPmChangeHandler);
	sel.addChangeListener(ls);
	selEl.parentNode.removeChild(selEl);
	timeAmPmCell.appendChild(selEl);
	sel.getHtmlElement().style.width = "50px";

};

LmFreeBusyView.prototype._getSelectOptions = function (choices) {
	var selectOptions = new Array();
	for (var i = 0; i < choices.length; i++) {
		var choice = choices[i];
		var choiceValue = (typeof choice == "string" ? choice : choice.value);
		var choiceLabel = (typeof choice == "string" ? choice : choice.label);
		selectOptions[i] = new DwtSelectOptionData(choiceValue, choiceLabel);
	}
	return selectOptions;
};

LmFreeBusyView.prototype._getDateValueStr = function(date) {
	if (date == null || !(date instanceof Date)) return "";
	return (date.getMonth()+1) + "/" + date.getDate() + "/" + (date.getFullYear());
};

LmFreeBusyView.prototype._getTimeValueStr = function(date, rounded) {
	if (date == null || !(date instanceof Date)) date = new Date();
	var mins = date.getMinutes();
	var hours = date.getHours();
	if (rounded && mins != 30 && mins != 0) {
		mins = Math.round(mins/30) * 30;
		if (mins == 60){
			mins = 0;
			hours++;
		}
	}
	return hours + ":" + ((mins < 10) ? "0" + mins : mins);
};


// ========================================================================
// render helper methods
// ========================================================================
LmFreeBusyView.prototype._getClassName = function (block) {
	return LmFreeBusyView.BLOCK_TYPE_TO_CLASSNAME[block.type];
};

LmFreeBusyView.prototype._renderExtraRows = function (buf, rowString, containerHeight, alreadyRendered) {
	if (this._totalRows > alreadyRendered) {
		var extraRows = this._totalRows - alreadyRendered;
		var replacedRowString = null;
		for (i = extraRows; i > 0; --i){
			buf.append(rowString);
		}
	}

};

LmFreeBusyView.prototype._getAddressOnclickHandler = function () {
	if (this._addrOnclickFunc == null) {
		this._addrOnclickFunc = new Function ("event", "LsCore.objectWithId(" + this.__internalId + ").handleAddrRowClick(event);");
	}
	return this._addrOnclickFunc;
};

LmFreeBusyView.prototype._getAddressOnchangeHandler = function () {
	if (this._addrOnchangeFunc == null) {
		this._addrOnchangeFunc = new Function ("event", "LsCore.objectWithId(" + this.__internalId + ").handleAddrChange(event);");
	}
	return this._addrOnchangeFunc;
};

LmFreeBusyView.prototype._getAddressInput = function (address) {
	if (this._dummyInput == null) {
		this._dummyInput = document.createElement("input");
	}
	var i = this._dummyInput.cloneNode(true);
	i.onchange = this._getAddressOnchangeHandler();
	i.value = address;
	
	return i;
};

// ========================================================================
// row blasting methods
// ========================================================================

/** This assumes that the skeleton grid has been set in the dom **/
LmFreeBusyView.prototype._writeAggregatedRow = function () {
	this._updateScheduleRow(this._aggregatedSchedule, 2, null, true);
};

LmFreeBusyView.prototype._resetAggregatedRow = function () {
	this._resetScheduleRow(2);
	var scheduleTable = document.getElementById(this._scheduleTableId);
	var row = scheduleTable.rows[2];
	row.cells[0].className = LmFreeBusyView.ADDRESS_CELL;
	row.cells[0].innerHTML = "<div class='mozWidth'></div>";
	row.cells[1].className = LmFreeBusyView.ADDRESS_INPUT_CELL;
	row.cells[1].innerHTML = "<div>All Attendees</div>";
};

LmFreeBusyView.prototype._resetScheduleRow = function (index, optionalRow) {
	var scheduleTable = document.getElementById(this._scheduleTableId);
	var row;
	if (optionalRow != null) {
		row = optionalRow;
	} else {
		row = scheduleTable.rows[index];
	}
	//var newRow = scheduleTable.rows[scheduleTable.rows.length - 1].cloneNode(true);
	var newRow = this._dummyEmptyRow.cloneNode(true);
	var startHour = this._getStartHour();
	scheduleTable.lastChild.replaceChild(newRow, row);
};

LmFreeBusyView.prototype._updateRow = function (schedule, index, optionalRow) {
	var row;
	if (optionalRow != null) {
		row = optionalRow;
	} else {
		var scheduleTable = document.getElementById(this._scheduleTableId);
		row = scheduleTable.rows[index];
		if (row == null) {
			row = this._addRow(scheduleTable);
		}
	}
	this._updateAddressRow(schedule, index, row);
	this._updateScheduleRow(schedule, index, row);	
};

LmFreeBusyView.prototype._addRow = function (scheduleTable) {
	var row = scheduleTable.rows[scheduleTable.rows.length - 1].cloneNode(true);
	scheduleTable.tBodies[0].insertBefore(row, null);
	this._totalRows++;
	return row;
};

LmFreeBusyView.prototype._removeRow = function (index) {
	var scheduleTable = document.getElementById(this._scheduleTableId);
	//var row = scheduleTable.rows[index]
	if (index < scheduleTable.rows.length) {
		scheduleTable.deleteRow(index);
		this._totalRows--;
	}
};

LmFreeBusyView.prototype._updateEmptyRow = function (index) {
	this._updateAddressRow(null, index, null, true);
};

LmFreeBusyView.prototype._updateAddressRow = function (userSchedule, index, optionalRow, empty){
	var row;
	if (optionalRow != null) {
		row = optionalRow;
	} else {
		var scheduleTable = document.getElementById(this._scheduleTableId);
		row = scheduleTable.rows[index];
		if (row == null) {
			row = this._addRow(scheduleTable);
		}
	}

	var addr = null;
	if (empty != true){
		if (userSchedule != null) {
			row.id = "LMFBA_" + userSchedule.getUniqueId();
			addr = userSchedule.id;
		}
	} else {
		row.id = "LMFBA_Empty";
		addr = LmFreeBusyView.ADD_NAME_MSG;
	}
	var onclickFunc = this._getAddressOnclickHandler();
	var cell0 = row.cells[0];
	var cell1 = row.cells[1];
	cell0.onclick = onclickFunc;
	cell1.onclick = onclickFunc;
	cell0.className = LmFreeBusyView.ADDRESS_CELL;
	if (empty == true) {
		cell1.className = LmFreeBusyView.ADDRESS_INPUT_EMPTY_CELL;
	} else {
		cell1.className = LmFreeBusyView.ADDRESS_INPUT_CELL;
	}
	cell1.innerHTML = "";
	cell1.appendChild(this._getAddressInput(addr));
};

LmFreeBusyView.prototype._updateScheduleRow = function (userSchedule, index, optionalRow, aggregated) {
	var row;
	if (optionalRow != null) {
		row = optionalRow;
	} else {
		var scheduleTable = document.getElementById(this._scheduleTableId);
		row = scheduleTable.rows[index];
	}
	var hours = this._getViewHours();
	var start = this._getStartHour();
	var numCells = start + (hours * 2);
	var colspan = -1;
	var j = 0;
	var i = start;
	var blocks = null;
	if (!aggregated) {
		blocks = userSchedule.blocks;
	} else {
		blocks = userSchedule;
	}
	var sLen = blocks.length;
	for (i = 0 ; i < blocks.length; ++i) {
		colspan = 1;
		var className = "";
		var bStart = blocks[i].getStartHour();
		if (start > bStart ){
			bStart += (24 - start);
		} else {
			bStart = bStart - start;
		}
		var dur = blocks[i].getDuration();
		colspan = this._durationToCellNum(dur);
		className = this._getClassName(blocks[i]);
		var cellNum = (bStart * 2);
		var cell = row.cells[cellNum + 2];
		var baseClassName = className;
		for (var y = colspan; (y > 0 && (cell != null)); y--) {
			if (aggregated) {
				if (cell.className){
					var clArr = cell.className.split("Higlighted");
					var baseCl = clArr[0];
					if (LmFreeBusyView.TYPE_RANKING[baseCl] > LmFreeBusyView.TYPE_RANKING[className]){
						continue;
					}
				}
			}

			className = baseClassName;
			var highlight = (cell.className.indexOf("Highlighted") != -1);
			if (highlight) {
				className = LmFreeBusyView.CLASS_TO_HIGHLIGHTEDCLASS[baseClassName];
			}
			cell.className = className;
			cell = cell.nextSibling;
		}
	}
};


// ========================================================================
// Event handling methods
// ========================================================================
LmFreeBusyView.prototype.paginate = function (direction) {

	var len = this.userSchedules.length;
	var uids = new Array();
	for (var i = 0; i < len; ++i ){
		uids.push(this.userSchedules[i].id);
	}
	var v;
	switch (direction) {
	case LmFreeBusyView.PAGINATE_FORWARD:
		LsDateUtil.roll(this.startDate, LsDateUtil.DAY, 1);
		LsDateUtil.roll(this.endDate, LsDateUtil.DAY, 1);
		break;
	case LmFreeBusyView.PAGINATE_BACK:
		LsDateUtil.roll(this.startDate, LsDateUtil.DAY, -1);
		LsDateUtil.roll(this.endDate, LsDateUtil.DAY, -1);
		break;
	};
	this.getSchedulesForDates(this.startDate, this.endDate, uids);
};

LmFreeBusyView.prototype.getSchedulesForDates = function (start, end, uids) {
	this.startDate.setTime(start.getTime());
	this.endDate.setTime(end.getTime());
	this.userSchedules = LmUserSchedule.getSchedules(this.startDate, this.endDate, uids);
	this.setSchedules(this.userSchedules);
	
	// set the display date
	document.getElementById(this._rangeDateId).innerHTML = LsDateUtil.getTimeStr(this.startDate, "%M %d, %Y");
	this.highlightAppointment();

};

LmFreeBusyView.prototype.setSchedules = function (schedules){
	var len = (schedules != null)? schedules.length: 0;
	var oldLen = this.userSchedules.length;
	for (var i = 0; i < len ; ++i) {
		this._updateRow(schedules[i], i+3);
	}
	// reset any rows that appeared previously, and add the empty 
	// row at the end.
	if (len < oldLen){
		var j = i;
		for (i = oldLen; i > j ; --i) {
			if (i >= this._origTotalRows){
				this._removeRow(i + 3);
			} else {
				this._resetScheduleRow(i + 3 );
			}
		}
	}
	this._updateEmptyRow(len + 3);
	
	this.userSchedules = (schedules != null)? schedules: new Array();
	this._createAggregatedSchedule();
	this._resetAggregatedRow();
	this._writeAggregatedRow();
};

LmFreeBusyView.prototype._dateChangeHandler = function (event) {
	var newDate = event.detail;
	var cal = event.item;
	var dateChanged = cal.__date;
	var dur = this._currentAppt.getDuration();

 	dateChanged.setDate(newDate.getDate());
 	dateChanged.setYear(newDate.getFullYear());
 	dateChanged.setMonth(newDate.getMonth());

	this._updateTime(dur, cal.__isEnd);
};

LmFreeBusyView.prototype._minuteChangeHandler = function (event) {
	var sel = event._args.selectObj;
	var cal = sel.__cal;
	var date = cal.__date;
	var dur = this._currentAppt.getDuration();
	var minutesStr = event._args.newValue;
	var minutes = parseInt(minutesStr);
	if (!isNaN(minutes)) {
		date.setMinutes(minutes);
	}
	this._updateTime(dur, cal.__isEnd);
};

LmFreeBusyView.prototype._amPmChangeHandler = function (event) {
	var sel = event._args.selectObj;
	var cal = sel.__cal;
	var date = cal.__date;
	var ampmStr = event._args.newValue;
	var dur = this._currentAppt.getDuration();
	var isPM = (ampmStr == LsMsg.pm);
	var hours = date.getHours() % 12;
	
	date.setHours(hours + (isPM ? 12 : 0));

	this._updateTime(dur, cal.__isEnd);

};

LmFreeBusyView.prototype._updateTime = function (dur, isEnd, isHour) {
	var oldStartDate = this._currentAppt.getStartDate().getDate();
	// make adjustments ( apply our constraints );
	this._adjustStartEndDate(dur, isEnd, isHour);

	var newStartDate = this._currentAppt.getStartDate().getDate();
	// update the view
	this._updateDateTimes();

	// either change the date range, or just highlight the appointment time.
	if (!isEnd || oldStartDate != newStartDate ) {
		var len = this.userSchedules.length;
		var uids = new Array();
		for (var i = 0; i < len; ++i ){
			uids.push(this.userSchedules[i].id);
		}
		var s = this._currentAppt.getStartTime();
		this.startDate.setTime(s);
		this.startDate.setHours(0,0,0,0);
		this.endDate.setTime(s + 24*60*60*1000);
		this.endDate.setHours(0,0,0,0);
		this.getSchedulesForDates(this.startDate, this.endDate, uids);
	} else {
		this.highlightAppointment();
	}
	
};

LmFreeBusyView.prototype._hourChangeHandler = function (event) {
	var sel = event._args.selectObj;
	var cal = sel.__cal;
	var date = cal.__date;
	var dur = this._currentAppt.getDuration();
	var hoursStr = event._args.newValue;
	var hours = parseInt(hoursStr);
	if (!isNaN(hours)) {
		if (hours == 12) hours = 0;
		var wasPM = (date.getHours() > 11);
		if (wasPM) hours += 12;
		date.setHours(hours);
	}
	
	this._updateTime(dur, cal.__isEnd, true);
};


LmFreeBusyView.prototype._getRowFromAddressEvent = function ( event ){
	var target = DwtUiEvent.getTarget(event);
	return this._getAncestor(target, "TR");
};

LmFreeBusyView.prototype.handleAddrRowClick = function ( event ) {
	event = DwtUiEvent.getEvent(event);
	var target = DwtUiEvent.getTarget(event);
	var row = this._getRowFromAddressEvent(event);
	var itemId = row.id.split("_")[1];
	var item = null;
	if (itemId == "Empty") {
		item = this._dummyBlock;
	} else {
		for (var i = 0; i < this.userSchedules.length; ++i) {
			if (this.userSchedules[i].getUniqueId() == itemId){
				item = this.userSchedules[i];
				break;
			}
		}
	}
	if (event.altKey) {
		// do nothing
	} else if (event.ctrlKey) {
		// not working correctly
		this._selectionManager.toggleItem(item);
	} else if (event.shiftKey) {
		this._selectionManager.selectFromAnchorToItem(item);
	} else {
		this._selectionManager.selectOneItem(item);
	}
};

LmFreeBusyView.prototype._getAncestor = function (element, tag) {
	if (!element){
		return null;
	}
	var retEl = null;
	while (element) {
		if (element.tagName == tag) {
			retEl = element;
			break;
		}
		element = element.parentNode;
	}
	return retEl;
};

LmFreeBusyView.prototype.handleAddrChange = function ( event ) {
	// This is really to prevent us making a server request when
	// the view is going 
	if (!this._enabled) return true;

	var target = DwtUiEvent.getTarget(event);
	if (target.tagName == "INPUT"){
		var tr = this._getAncestor(target, "TR");
		if (target.value != null && target.value != "") {
			var sched = null;
			var index = -1;
			// create the new row
			// see if we are dealing with the empty row
			if (tr.id != null) {
				if (tr.id.indexOf("Empty")!= -1){
					this._updateEmptyRow(tr.rowIndex + 1);
					sched = new LmUserSchedule();
					this.userSchedules[this.userSchedules.length] = sched;
					tr.id = "LMFBA_" + sched.getUniqueId();
					index = tr.rowIndex;//this.userSchedules.length;
					this._selectionManager.selectOneItem(this._dummyBlock);
				} else {
					// from the id we should be able to decide which row we are working with.
					index = tr.rowIndex;
					if (index != -1) {
						sched = this.userSchedules[index - 2];
					}
				}
				// send a request to the server for the free busy information for the new
				// address.
				// TODO: This should probably live in a controller somewhere.
				sched.getSchedule(this.startDate, this.endDate, target.value, true);
				
				// update the view
				this._updateRow(sched, index);
// 				this._updateAddressRow(sched, index);
// 				this._updateScheduleRow(sched, index);
				this._updateAggregatedSchedule(sched.blocks);
				this._writeAggregatedRow();
				//this._saveAppointmentInfo();
			}
		} else {
			// when there is no value in the input, if it's the empty row,
			// then just replace the message in the input.
			// if it's one of the intialized rows, then this should trigger 
			// a row deletion.
			if (tr.id != null) {
				if (tr.id.indexOf("Empty")!= -1){
					target.value = LmFreeBusyView.ADD_NAME_MSG;
				} else {

					// delete row
					var newRow = tr.parentNode.lastChild.cloneNode(true);
					tr.parentNode.appendChild(newRow);
					var index = tr.rowIndex;
					this.userSchedules.splice((index - 2), 1);
					tr.parentNode.removeChild(tr);

					// reset the aggregated row
					this._resetAggregatedRow();
					// reset the aggregated model
					this._createAggregatedSchedule();
					// rewrite the aggregated row
					this._writeAggregatedRow();
				}
			}
		}
	}	
	return true;
};

LmFreeBusyView.prototype._getScheduleIndexById = function (schedId) {
	var index = -1;
	for (var i = 0 ; i < this.userSchedules.length ; ++i ){
		if (this.userSchedules[i].getUniqueId() == schedId ){
			sched = this.userSchedules[i];
			index = i;
			break;
		}
	}
	return index;
};

LmFreeBusyView.prototype._handleScheduleMouseDown = function (event){
	var target = DwtUiEvent.getTarget(event);
	var hourCell = target.cellIndex;
	// if we are in the address section of the table, don't do anything
	//DBG.println("handleScheduleMouseDown: target.tagName = " + target.tagName + " index = " + target.cellIndex);
	if (hourCell < 2 || target.tagName != "TD" || target.parentNode.rowIndex < 2) return;
	hourCell = hourCell - 2;
	var hour = (hourCell/2) + this._getStartHour();
	var mins = ((hour * 60) % 60);
	var startApptDate = this._currentAppt.getStartDate();
	var endApptDate = this._currentAppt.getEndDate();
	var sd = this.startDate;
	startApptDate.setFullYear(sd.getFullYear(), sd.getMonth(), sd.getDate())
	startApptDate.setHours(hour,mins,0,0);
	endApptDate.setFullYear( sd.getFullYear(), sd.getMonth(), sd.getDate());
	endApptDate.setHours( ( (mins == 0)? hour: ++hour), ( (mins == 0)? 30: 0), 0, 0 );

	this._updateDateTimes();
	this.highlightRange(hourCell, 1800000);
};

LmFreeBusyView.prototype._selectAddress = function ( cell, selected ) {
	if (cell) {
		if (selected) {
			cell.className = LmFreeBusyView.ADDR_SELECTED;
		} else {
			cell.className = LmFreeBusyView.ADDRESS_CELL;
		}
	}
};

LmFreeBusyView.prototype._updateDateTimes = function () {
	//DBG.println("_updateDateTimes startDate = ", this._currentAppt.getStartDate(), " end = " , this._currentAppt.getEndDate());
	var startDateCell = document.getElementById(this._startDateId);
	var startTimeHrCell = document.getElementById(this._startTimeHrId);
	var startTimeMinCell = document.getElementById(this._startTimeMinId);
	var startTimeAmPmCell = document.getElementById(this._startTimeAmPmId);
	var endDateCell = document.getElementById(this._endDateId);
	var endTimeHrCell = document.getElementById(this._endTimeHrId);
	var endTimeMinCell = document.getElementById(this._endTimeMinId);
	var endTimeAmPmCell = document.getElementById(this._endTimeAmPmId);
	
	var startDate = this._currentAppt.getStartDate();
	var b = LsCore.objectWithId(startDateCell.firstChild.dwtObj);
	if (b) {
		b.setText(this._getDateValueStr(startDate));
		b.__cal.setDate(startDate, true);
	}
	var sel = LsCore.objectWithId(startTimeHrCell.firstChild.dwtObj);
	if (sel) {
		var hr = startDate.getHours() %12;
		hr = (hr == 0) ? "12": "" + hr;
		sel.setSelectedValue(hr);
	}

	sel = LsCore.objectWithId(startTimeMinCell.firstChild.dwtObj);
	if (sel) {
		var min = LsDateUtil._pad(LsDateUtil.getRoundedMins(startDate));
		sel.setSelectedValue(min);
	}
	
	sel = LsCore.objectWithId(startTimeAmPmCell.firstChild.dwtObj);
	if (sel) {
		var amPm = (startDate.getHours() >= 12)? LsMsg.pm: LsMsg.am;
		sel.setSelectedValue(amPm);
	}


	var endDate = this._currentAppt.getEndDate();
	b = LsCore.objectWithId(endDateCell.firstChild.dwtObj);
	if (b) {
		b.setText(this._getDateValueStr(endDate));
		b.__cal.setDate(endDate,true);
	}

	sel = LsCore.objectWithId(endTimeHrCell.firstChild.dwtObj);
	if (sel) {
		var hr = endDate.getHours() %12;
		hr = (hr == 0) ? "12": "" + hr;
		sel.setSelectedValue(hr);
	}

	sel = LsCore.objectWithId(endTimeMinCell.firstChild.dwtObj);
	if (sel) {
		var min = LsDateUtil._pad(LsDateUtil.getRoundedMins(endDate));
		sel.setSelectedValue(min);
	}
	
	sel = LsCore.objectWithId(endTimeAmPmCell.firstChild.dwtObj);
	if (sel) {
		var amPm = (endDate.getHours() >= 12)? LsMsg.pm: LsMsg.am;
		sel.setSelectedValue(amPm);
	}
};

LmFreeBusyView.prototype.getAppointmentAttendees = function () {
	var tempArr = new Array();
	var userName = this.shell.getData(LmAppCtxt.LABEL).get(LmSetting.USERNAME);
	for (var i = 0; i < this.userSchedules.length; ++i) {
		if (this.userSchedules[i].id == userName) {
			continue;
		}
		tempArr.push(this.userSchedules[i].id);
	}
	var possiblyEmptyRow = document.getElementById("LMFBA_Empty");
	var val = (possiblyEmptyRow != null)? possiblyEmptyRow.cells[1].firstChild.value: null;
	if (val != "" && val != LmFreeBusyView.ADD_NAME_MSG) {
		tempArr.push(val);
	}
	return tempArr.toString();
};

LmFreeBusyView.prototype.getAppointmentStartDate = function () {
	return this._currentAppt.getStartDate();
};

LmFreeBusyView.prototype.getAppointmentEndDate = function () {
	return this._currentAppt.getEndDate();
};

LmFreeBusyView.prototype.disable = function () {
	this._enabled = false;
};

LmFreeBusyView.prototype.enable = function () {
	this._enabled = true;
};

LmFreeBusyView.prototype.saveAppointmentInfo = function () {
	this._appt.setStartDate(this._currentAppt.getStartDate());
	this._appt.setEndDate(this._currentAppt.getEndDate());
	this._appt.attendees = this.getAppointmentAttendees();
};

LmFreeBusyView.prototype._adjustStartEndDate = function (duration, endChanged, hourChanged) {
	var startDate = this._currentAppt.getStartDate();
	var endDate = this._currentAppt.getEndDate();

	if (hourChanged) {
		var startHrs = startDate.getHours();
		var endHrs = endDate.getHours();
		if (endHrs < startHrs && startHrs < 12){
			endDate.setHours(endHrs + 12);
		}
	}
	
	var startTime = startDate.getTime();
	var endTime = endDate.getTime();	

	// check time
	if (!endChanged || (endTime <= startTime)){
		var e, s;
		if (endChanged) {
			e = startDate;
			s = endDate;
			duration = (-1* duration);
		} else {
			e = endDate;
			s = startDate;
			duration = duration;
		}
		e.setTime(s.getTime() + duration);
	}
};

// ========================================================================
// slider handling methods
// ========================================================================

LmFreeBusyView.prototype._getCellWidth = function () {
	if (this._cellWidth == null || this._cellWidth == 0) {
		var paddingFactor = 1;
		var start = this._getStartHour();
		var aCell = document.getElementById(this._scheduleTableId).rows[2].cells[3];
		this._cellWidth = parseInt(DwtCssStyle.getProperty(aCell, "width"));
		//DBG.println("cell width = " + this._cellWidth);
		this._cellWidth = (!isNaN(this._cellWidth))? this._cellWidth: 0;
		if (!LsEnv.isIE){
			var paddingRight = parseFloat(DwtCssStyle.getProperty(aCell, "padding-right"));
			var paddingLeft = parseFloat(DwtCssStyle.getProperty(aCell, "padding-left"));
			paddingRight = (!isNaN(paddingRight))? paddingRight: 0;
			paddingLeft = (!isNaN(paddingRight))? paddingLeft: 0;
			var borderRight = parseFloat(DwtCssStyle.getProperty(aCell, "border-right-width"));
			var borderLeft = parseFloat(DwtCssStyle.getProperty(aCell, "border-left-width"));
			borderRight = isNaN(borderRight)? 0: (borderRight * paddingFactor);
			borderLeft = isNaN(borderLeft)? 0: (borderLeft * paddingFactor);
			this._cellWidth += paddingRight + paddingLeft + borderRight + borderLeft;
		}
	}
	return this._cellWidth;
};

LmFreeBusyView.prototype._durationToCellNumRelativeToStart = function (duration, optionalStartCell) {
	var startCell = (optionalStartCell != null)? optionalStartCell: this._dateToCell(this._currentAppt.getStartDate());
	var start = this._getStartHour();
	var normalizedStartCell = startCell - start;
	var dur = this._durationToCellNum(duration);
	return Math.min(dur,  (48  - normalizedStartCell));
};

LmFreeBusyView.prototype._durationToCellNum = function (duration, optionalStartCell) {
	return Math.round((duration/1000) / (60 * 30));
};

LmFreeBusyView.prototype.highlightRange = function(startCell, duration, optionalSlider){
	var slider = optionalSlider? optionalSlider : document.getElementById(this._sliderId);
	if (duration > 0) {
		this._setSliderBounds(startCell, duration, this._getCellWidth(), slider);
	} else {
		this._hideSlider(slider);
	}
	
	var durationCellNum = 0;
	if (( this._lastHighlightedHour!= null) && (this._lastHighlightedDuration != null)) {
		durationCellNum = this._durationToCellNumRelativeToStart(this._lastHighlightedDuration, this._lastHighlightedHour);
		this._toggleHighlight(false, this._totalRows, durationCellNum, this._lastHighlightedHour);
	}
	if (duration > 0 ) {
		durationCellNum = this._durationToCellNum(duration);
		this._toggleHighlight(true, this._totalRows, durationCellNum, startCell);
		
		this._lastHighlightedHour = startCell;
		this._lastHighlightedDuration = duration;
	} else {
		this._lastHighlightedHour = null;
		this._lastHighlightedDuration = null;
	}
};
LmFreeBusyView.CLASS_HIGHLIGHTED = "Highlighted";

LmFreeBusyView.prototype._toggleHighlight = function (highlight, rows, numCells, startCellIndex) {
	
	var cell = null;
	var table = document.getElementById(this._scheduleTableId);
	var start = this._getStartHour();
	if (!LsEnv.isIE) {
		var rows = table.rows;
		var numRows = rows.length;		
		for(var i = 2; i < numRows; i++) {
			var row = rows[i];
			var rowLen = row.cells.length;
			var x = (startCellIndex - start + 2);
			var stopCell = x + numCells;
			var cell = row.cells[x];
			var newClass;
			for (; (x < stopCell && x < rowLen); ++x){
				cell = row.cells[x];
				if (!highlight) {
					newClass = LmFreeBusyView.HIGHLIGHTEDCLASS_TO_CLASS[cell.className];
					if (newClass != null) {
						cell.className = newClass;
					}
				} else {
					cell.className = LmFreeBusyView.CLASS_TO_HIGHLIGHTEDCLASS[cell.className];
				}
			}
		}
	} else {
		var x = (startCellIndex - start + 3);
		var stopCell = x + numCells;
		for (var i = x ; i < stopCell; ++i) {
			if (highlight) {
				table.firstChild.childNodes[i].style.backgroundColor = "#ADD6D6";
			} else {
				table.firstChild.childNodes[i].style.backgroundColor = "";
			}
		}
	}
};

LmFreeBusyView.prototype._hideSlider  = function(slider) {
	slider.style.display = "none";
};

LmFreeBusyView.prototype._setSliderBounds = function (startCell, duration, cellWidth, slider){
	var scheduleTable = document.getElementById(this._scheduleTableId);
	var scheduleContainer = document.getElementById(this._scheduleContainerId);
	// get the location relative to our container, since the container will move around.

	var location = Dwt.toWindow(scheduleTable.rows[2].cells[startCell + 2], 0, 0, scheduleContainer);
	var tableSize = Dwt.getSize(scheduleTable);

	var newLeft = location.x;
	slider.style.left = newLeft + "px";
	slider.style.top  = location.y + "px";
	var extraRows = 3;
	//slider.style.height = ((this._totalRows + extraRows)* LmFreeBusyView.ROW_HEIGHT) + "px";
	var topTwoRowsHeight = 30;
	if (LsEnv.isIE) {
		topTwoRowsHeight = 26
	}
	slider.style.height = (tableSize.y - topTwoRowsHeight) + "px";
	var hours = this._getViewHours();
	var numCells = (hours * 2) + 1;
	var widthInCells = this._durationToCellNumRelativeToStart(duration, startCell);
	//DBG.println("duration = ", duration , " startCell = ", startCell, " widthInCells = ", widthInCells, " numCells = ", numCells);
	var addition = 0;
	if ((startCell + widthInCells + 2) > numCells ) {
		widthInCells-- ;
		addition = cellWidth;
	}
	//DBG.println("2 duration = ", duration , " startCell = ", startCell, " widthInCells = ", widthInCells, " numCells = ", numCells);
	//DBG.println("getting cell ", startCell + widthInCells + 2 , " -- ", scheduleTable.rows[2].cells[startCell + widthInCells + 2]);
	var endLoc = Dwt.toWindow(scheduleTable.rows[2].cells[startCell + widthInCells + 2], 0, 0, scheduleContainer);
	endLoc.x = endLoc.x + addition;
	slider.style.width = ( endLoc.x - location.x) + "px";
	slider.style.display = "";
}


// ========================================================================
// LsSelectionManager interface methods
// ========================================================================

LmFreeBusyView.prototype.getItemCount = function () {
	return this.userSchedules.length + 1;
};

LmFreeBusyView.prototype.getItem = function (index) {
	if (index == this.userSchedules.length){
		return this._dummyBlock;
	}
	return this.userSchedules[index];
};

LmFreeBusyView.prototype.itemSelectionChanged = function (item, index, isSelected) {
	var id = null;
	var inputChangeNeeded = false;
	if (index == this.userSchedules.length) {
		id = "LMFBA_Empty";
		inputChangeNeeded = true;
	} else {
		id = "LMFBA_" + item.getUniqueId();
	}
	var row = document.getElementById(id);
	// if the user clicks on a row to start the delete, then
	// the row may have been removed already.
	if (row != null) {
		this._selectAddress(row.cells[0], isSelected);
		var input = row.cells[1].firstChild;
		if (inputChangeNeeded && isSelected && input.value == LmFreeBusyView.ADD_NAME_MSG){
			row.cells[1].className = LmFreeBusyView.ADDRESS_INPUT_CELL;
			input.value = "";
		} else if (inputChangeNeeded && !isSelected && input.value == ""){
			row.cells[1].className = LmFreeBusyView.ADDRESS_INPUT_EMPTY_CELL;
			input.value =  LmFreeBusyView.ADD_NAME_MSG;
		}
		if (isSelected){
			input.focus();
		}
	}
};

LmFreeBusyView.prototype.selectionChanged = function () {
	//DBG.println("Selection Changed called");
	// do nothing for now
};


// ========================================================================
// LmUserSchedule class
// ========================================================================
function LmUserSchedule () {
	this.blocks = new Array();
	this._objectId = LmUserSchedule._internalIds++;
}
LmUserSchedule._internalIds = 0;
LmUserSchedule.prototype.setId = function (id){
	this.id = id;
};

LmUserSchedule.prototype.getUniqueId = function () {
	return this._objectId;
}

/**
 * This is specifically for sorting. Comparisons of
 * these blocks should really only compare the user names.
 */ 
LmUserSchedule.prototype.valueOf = function () {
	return (this.id + this._objectId);
};

LmUserSchedule.getSchedules = function (start, end, uids) {
	var soapDoc = LsSoapDoc.create("GetFreeBusyRequest", "urn:liquidMail");
	soapDoc.setMethodAttribute("s", start.getTime());
	soapDoc.setMethodAttribute("e", end.getTime());
	var u = null;
	if (uids.constructor === Array){
		if (uids.length > 0) {
			u = uids.join(',');
		} else {
			return new Array();
		}
	} else if (typeof(uids) == 'string'){
		u = uids;
	}
	soapDoc.setMethodAttribute("uid", u);
	var resp = null;
	if (LmUserSchedule.commandSender != null) {
		resp = LmUserSchedule.commandSender.sendRequest(soapDoc);
	} else {
		// testing only
		resp = LsCsfeCommand.invoke(soapDoc, null, null, null, false);
		resp = resp.Body;
	}
	if (resp != null) {
		return LmUserSchedule.loadFromDom(resp);
	} else {
		var users = uids.split(',');
		var numUsers = users.length;
		var userSchedules = new Array(numUsers);
		for (var i = 0; i < numUsers; ++i) {
			userSchedules[i] = new LmUserSchedule();
			userSchedules[i].blocks[i] = new LmBusyBlock(start.getTime(), end.getTime(), "f");
			userSchedules[i].id = users[i];
		}
		return userSchedules;
	}
}

LmUserSchedule.loadFromDom = function (freeBusyResponse) {
	// parse the GetFreeBusyResponse message.
	//DBG.println("LoadFromDom: resp=>");
	//DBG.dumpObj(freeBusyResponse);		
	var users = freeBusyResponse.GetFreeBusyResponse.usr;
	var len = users.length;
	var userSchedules = new Array();
	for (var i = 0; i < len; i++) {
		var userS = new LmUserSchedule();
		LmUserSchedule._parseOneScheduleResponse(users[i], userS);
		userSchedules.push(userS);
	}
	return userSchedules;
};

LmUserSchedule._parseOneScheduleResponse = function (users, userSchedObj) {
	for (key in users) {
		if (key == 'id'){
			userSchedObj.id = users[key];
			continue;
		}
		var typeArr = users[key];
		for (var j = 0; j < typeArr.length; j++){
			var start = typeArr[j].s;
			var end = typeArr[j].e;
			
			var block = new LmBusyBlock(start, end, key);
			userSchedObj.blocks.push(block);
		}
	}
};

LmUserSchedule.prototype.getSchedule = function (start, end, uid, force) {
	if (force || this.blocks.length <= 0){
		// if we've been forced to refresh, then zero out our blocks
		if (this.blocks.length > 0 ){
			this.blocks = new Array();
		}
		// go to the server
		var soapDoc = LsSoapDoc.create("GetFreeBusyRequest", "urn:liquidMail");
		soapDoc.setMethodAttribute("s", start.getTime());
		// TODO: Not sure what the period should be here
		soapDoc.setMethodAttribute("e", end.getTime());
		soapDoc.setMethodAttribute("uid", uid);
		// TODO
		if (LmUserSchedule.commandSender != null) {
			var resp = LmUserSchedule.commandSender.sendRequest(soapDoc);
		} else {
			// testing only
			var resp = LsCsfeCommand.invoke(soapDoc, null, null, null, false).Body;
		}
		var user = resp.GetFreeBusyResponse.usr[0];
		LmUserSchedule._parseOneScheduleResponse(user, this);
	}
	return this.blocks;
};

LmUserSchedule.setCommandSender = function (sender) {
	LmUserSchedule.commandSender = sender;
};

// ========================================================================
// LmBusyBlock class
// ========================================================================

function LmBusyBlock (start, end, type) {
	this.startTime = start;
	this.endTime = end;
	this.type = type;
	this.duration = end - start;
}

LmBusyBlock.prototype.isInRange = function (startTime, endTime) {
	var tst = this.startTime;
	return (tst >= startTime && tst < endTime);
};

LmBusyBlock.prototype.getDuration = function () {
	return this.duration;
};

LmBusyBlock.prototype.getStartHour = function () {
	if (this._startDate == null) {
		this._startDate = new Date(this.startTime);
		this._startDate = LsDateUtil.roundTimeMins(this._startDate, 30);
		this._startHour = this._startDate.getHours();
		if (this._startDate.getMinutes() == 30){
			this._startHour += 0.5;
		}
	}
	return this._startHour;
};

LmBusyBlock.prototype.isOverlapping = function(otherBlock) {
	var tst = this.startTime;
	var tet = this.endTime;
	var ost = otherBlock.startTime;
	var oet = otherBlock.endTime;
	
	return (tst >= ost && tst < oet) || (tet > ost && tet < oet);
};

function LmFreeBusyAppointment (startDate, endDate, fbView) {
	this._startDate = new Date(startDate.getTime());
	this._endDate = new Date(endDate.getTime());
}

LmFreeBusyAppointment.prototype.setDates = function (startDate, endDate) {
	this._startDate.setTime(startDate.getTime());
	this._endDate.setTime(endDate.getTime());
};

LmFreeBusyAppointment.prototype.isInRange = function(startTime, endTime) {
	var tst = this.getStartTime();
	var tet = this.getEndTime();	
	return (tst > startTime && tet < endTime);
};

/**
 * return true if the start time of this appt is within range
 */
LmFreeBusyAppointment.prototype.isStartInRange = function(startTime, endTime) {
	var tst = this.getStartTime();
	return (tst < endTime && tst >= startTime);
};

/**
 * return true if the end time of this appt is within range
 */
LmFreeBusyAppointment.prototype.isEndInRange = function(startTime, endTime) {
	var tet = this.getEndTime();
	return (tet <= endTime && tet > startTime);
};

LmFreeBusyAppointment.prototype.beginsBeforeEndsAfter = function (startTime, endTime) {
	var tst = this.getStartTime();
	var tet = this.getEndTime();	
	return (tst < startTime && tet > endTime);
};

LmFreeBusyAppointment.prototype.getStartDate = function() {
	return this._startDate;
};

LmFreeBusyAppointment.prototype.getEndDate = function() {
	return this._endDate;
};

LmFreeBusyAppointment.prototype.getStartTime = function() {
	return this._startDate.getTime();
};

LmFreeBusyAppointment.prototype.getEndTime = function() {
	return this._endDate.getTime();
};

LmFreeBusyAppointment.prototype.getDuration = function() {
	return this._endDate.getTime() - this._startDate.getTime();
};
