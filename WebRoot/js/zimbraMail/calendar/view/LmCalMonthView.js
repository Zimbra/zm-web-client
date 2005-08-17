function LmCalMonthView(parent, posStyle, dropTgt) {
	LmCalBaseView.call(this, parent, "calendar_view", posStyle, LmController.CAL_MONTH_VIEW, dropTgt);	
	this.getHtmlElement().style.overflow = "hidden";
	//this.setScrollStyle(DwtControl.SCROLL);
	this._needFirstLayout = true;
}

LmCalMonthView.prototype = new LmCalBaseView;
LmCalMonthView.prototype.constructor = LmCalMonthView;

LmCalMonthView._DaySpacer = 1; // space between days

LmCalMonthView.prototype.toString = 
function() {
	return "LmCalMonthView";
}

LmCalMonthView.prototype.getRollField =
function(isDouble)
{
	return isDouble? LsDateUtil.YEAR : LsDateUtil.MONTH;
}

LmCalMonthView.prototype._dateUpdate =
function(rangeChanged)
{
	this._clearSelectedDay();
	this._updateSelectedDay();
}

LmCalMonthView.prototype._updateRange =
function()
{
	this._updateDays();
	this._timeRangeStart = this._days[0].date.getTime();
	this._timeRangeEnd = this._days[41].date.getTime() + LsDateUtil.MSEC_PER_DAY;
}

LmCalMonthView.prototype._updateTitle =
function() 
{	
	// updated in updateDays
}

LmCalMonthView.prototype._clearSelectedDay =
function() 
{
	if (this._selectedData != null) {
		var today = new Date();
		today.setHours(0,0,0, 0);
		
		var te = Dwt.getDomObj(this.getDocument(),this._selectedData.tdId);
		var isToday = this._selectedData.date.getTime() == today.getTime();
		te.className = isToday ? 'calendar_month_cells_td_today' :'calendar_month_cells_td';
		this._selectedData = null;
	}
}

LmCalMonthView.prototype._updateSelectedDay =
function() 
{
	var day = this._dateToDayIndex[this._dayKey(this._date)];
	var te = Dwt.getDomObj(this.getDocument(), day.tdId);	
	te.className = 'calendar_month_cells_td-Selected';	
	this._selectedData = day;	
}

LmCalMonthView.prototype._apptSelected =
function() {
	this._clearSelectedDay();
}

LmCalMonthView.prototype._getWeekForAppt =
function(appt) {
	var day = this._getDayForAppt(appt);
	return day ? this._weeks[day.week] : null;
}

LmCalMonthView.prototype._getDayForAppt =
function(appt) {
	return this._dateToDayIndex[this._dayKey(appt.getStartDate())];
}

LmCalMonthView.prototype._getDivForAppt =
function(appt) {
	var day = this._getDayForAppt(appt);
	return day ? Dwt.getDomObj(this.getDocument(), day.dayId) : null;
}

LmCalMonthView.prototype._dayTitle =
function(date) {
	if (this._shortMonInDay != date.getMonth()) {
		this._shortMonInDay = date.getMonth();
		return DwtMsg.MEDIUM_MONTH[date.getMonth()]+" "+date.getDate();
	} else {
		return date.getDate();
	}
}

LmCalMonthView.prototype._reserveRow = 
function(day, data, appt, weekAppts) {
	var appts = day.allDayAppts;
	if (data == null) { // find free slot or push
		for (var k=0; k < appts.length; k++) {
			if (appts[k] == null) {
				appts[k] = appt;
				return { row: k, first: appt, last: appt, num: 1, dow: day.dow};
			}
		}
		appts.push(appt);
		return { row: appts.length-1, first: appt, last: appt, num: 1, dow: day.dow};
	} else { // reserve same row
		var row = data.row;
		var move = appts[row];
		appts[row] = appt;
		if (move) {
			// in use, need to move to free slot or end
			var moveIndex = -1;
			for (var i=0; i < appts.length; i++) {
				if (appts[i] == null) {
					moveIndex = i;
					break;
				}
			}
			if (moveIndex == -1) moveIndex = appts.length;
			appts[moveIndex] = move;
			var uniqId = (move._orig) ? move._orig.getUniqueId() : move.getUniqueId();
			weekAppts[uniqId].row = moveIndex;
		} 
		data.last = appt;
		data.num++;
		return data;
	}
}

LmCalMonthView.prototype.addAppt = 
function(appt, now) {
	var day = this._getDayForAppt(appt);
	if (!day) return;
	
	if (!appt.isAllDayEvent(appt)) {
		if (!day.appts) day.appts = [];
		day.appts.push(appt);
		return;				
	}

	// make sure multi-day all day appts line up
	var uniqId = (appt._orig) ? appt._orig.getUniqueId() : appt.getUniqueId();
	var week = this._weeks[day.week];
	// check to see if appt already has a row number for its week
	
	var data = week.appts[uniqId];
	if (!day.allDayAppts) day.allDayAppts = [];
	if (data != null) {
		this._reserveRow(day, data, appt, week.appts);
	} else {
		week.appts[uniqId] = this._reserveRow(day, null, appt, null);
	}
}

LmCalMonthView.prototype._postSet = 
function() {
	// now go through each day and create appts in correct order to line things up
	var allDayParent = Dwt.getDomObj(this.getDocument(), this._daysId); 
	var day;
	for (var i=0; i < 6; i++)	 {
		var week = this._weeks[i];
		for (var key in week.appts) {
			var data = week.appts[key];
			allDayParent.appendChild(this._createAllDayItemHtml(data.first, data.last));
		}
		for (var j=0; j < 7; j++)	 {
			day = this._days[i*7+j];
			if (day.allDayAppts) {
				for (var k=0; k < day.allDayAppts.length; k++) {
					var appt = day.allDayAppts[k];			
					var div = this._createAllDayFillerHtml(day);
					this._fillers.push(div);
				}
			}
			if (day.appts) {
				for (var k=0; k < day.appts.length; k++)
					var div = this._createItemHtml(day.appts[k], null);
			}
		}
	}
	if (!this._needFirstLayout)
		this._layout();
}

LmCalMonthView.prototype._preSet = 
function() {
	// reset all layout data
	// cleanup any filler
	if (this._fillers.length > 0) {
		for (var i=0; i < this._fillers.length; i++) {
			var f = 	this._fillers[i];
			this._fillers[i] = null;
			f.parentNode.removeChild(f);
		}
		this._fillers = [];
	}
	for (var i=0; i < 6; i++)	 {
		this._weeks[i] = { appts: {} };
		for (var j=0; j < 7; j++)	 {	
			day = this._days[i*7+j];
			if (day.allDayAppts)	delete day.allDayAppts;
			if (day.appts) delete day.appts;
		}
	}
}

LmCalMonthView.prototype._createAllDayItemHtml =
function(appt, apptEnd) {
	var isStartInView = appt._fanoutFirst;
	var isEndInView = apptEnd._fanoutLast;

	var needTitle = true; 

	var result = this.getDocument().createElement("div");
	
	Dwt.setSize(result, 100, Dwt.DEFAULT);
	result.style.position = 'absolute';

	result._styleClass = "allday";
	result._selectedStyleClass = result._styleClass + '-' + DwtCssStyle.SELECTED;
	result.className = result._styleClass;	

	this.associateItemWithElement(appt, result, DwtListView.TYPE_LIST_ITEM);
	
	var html = new Array(10);
	var idx = 0;

	html[idx++] = "<table class=allday>";
	html[idx++] = "<tr>";
	if (isStartInView)
		html[idx++] = "<td><div class=allday_blue_start></div></td>";
	html[idx++] = "<td width=100%>";		
	html[idx++] = "<div class=allday_blue_stretch><div class=allday_text>";
	if (needTitle)
		html[idx++] = LsStringUtil.htmlEncode(appt.getName());
	html[idx++] = "</div></div>";
	html[idx++] = "</td>";
	if (isEndInView)
		html[idx++] = "<td><div class=allday_blue_end></div></td>";
	html[idx++] = "</tr>";
	html[idx++] = "</table>";

	result.innerHTML = html.join("");
	return result;
}

LmCalMonthView.prototype._createAllDayFillerHtml =
function(day) {
	var dayTable = Dwt.getDomObj(this.getDocument(), day.dayId);
	var	result = dayTable.insertRow(-1);
	result._styleClass = "allday";
	result._selectedStyleClass = result._styleClass + '-' + DwtCssStyle.SELECTED;
	result.className = result._styleClass;	
	var cell = result.insertCell(-1);
	//cell.innerHTML = "HELLO";
	cell.innerHTML = "<table class=allday><tr><td><div class=allday_item_filler></div></td></tr></table>";	
	//cell.colSpan = 2;
	cell.className = "calendar_month_day_item";
	return result;
}

LmCalMonthView.prototype._createItemHtml =
function(appt, now, isDndIcon) {
	var result;

	/*
	if (appt.isAllDayEvent()) {
		return this._createAllDayItemHtml(appt, now, isDndIcon);
	}
	*/

	if (!isDndIcon) {
		result = this._getDivForAppt(appt).insertRow(-1);
		result._styleClass = "calendar_month_day_item_row";
		result._selectedStyleClass = result._styleClass + '-' + DwtCssStyle.SELECTED;
	} else {
		result = this.getDocument().createElement("div");	
		result._styleClass = "calendar_month_day_item";
	}
	result.className = result._styleClass;	
		
	this.associateItemWithElement(appt, result, DwtListView.TYPE_LIST_ITEM);
	
	var html = new Array(10);
	var idx = 0;

	/*includeDuration */
	//var dur = appt.getDurationText(true, true);
	var dur = appt.getShortStartHour();
	html[idx++] = "<LI>";
	html[idx++] = dur;
	if (dur != "") {
		html[idx++] = "&nbsp;";
	}
	html[idx++] = LsStringUtil.htmlEncode(appt.getName());
	html[idx++] = "</LI>";	
	/**/

	//html[idx++] = "<LI>"+LsStringUtil.htmlEncode(appt.getName())+"</LI>";

	//if (appt.getLocation() != "")	html[idx++] = "&nbsp;("+LsStringUtil.htmlEncode(appt.getLocation())+")";
	
	if (isDndIcon) {
		result.innerHTML = html.join("");
	} else {
		var cell = result.insertCell(-1);
		cell.innerHTML = html.join("");
		//cell.colSpan = 2;
		cell.className = "calendar_month_day_item";
	}
	
	if (isDndIcon) {
		result.style.position = 'absolute';	
		var ae= Dwt.getDomObj(this.getDocument(), this._getItemId(appt));
		var sz;
		if (ae) {
			sz = Dwt.getSize(ae);
			//sz.x *= 2;
		} else {
			sz = new DwtPoint(250, 100);
		}
		Dwt.setSize(result, Dwt.DEFAULT, sz.y);
	}
	return result;
}

LmCalMonthView._idToData = {};

LmCalMonthView.prototype._createDay =
function(html, idx, loc, week, dow) {
	var tdid = Dwt.getNextId();
	var did = Dwt.getNextId();
	var tid = Dwt.getNextId();	

	html[idx++] = "<td class='calendar_month_cells_td' id='"+tdid+"' ondblclick='LmCalMonthView._ondblclickHandler(event)' onclick='LmCalMonthView._onclickHandler(event)'>";
	html[idx++] = "<table class='calendar_month_day_table'>";
	html[idx++] = "<tr><td colspan=2 id='"+tid+"' ondblclick='LmCalMonthView._ondblclickHandler(event)' onclick='LmCalMonthView._onclickHandler(event)'></td></tr></table>";
	html[idx++] = "<table class='calendar_month_day_table'><tbody id='"+did+"'>";
	html[idx++] = "</tbody></table>";
	html[idx++] = "</td>";
	var data = { dayId: did, titleId: tid, tdId: tdid, week: week, dow: dow, view: this};
	this._days[loc] = data;
	LmCalMonthView._idToData[tdid] = LmCalMonthView._idToData[did] = LmCalMonthView._idToData[tid] = data;
	return idx;
}

LmCalMonthView.prototype._createHtml =
function() {
	this._days = new Object();	
	this._weeks = new Array();
	this._dayInfo = new Object();
	this._fillers = [];
	this._headerId = Dwt.getNextId();
	this._titleId = Dwt.getNextId();	
	this._daysId = Dwt.getNextId();	
	this._bodyId = Dwt.getNextId();
	this._headerColId = [];
	this._bodyColId = [];	

	var idx = 0;
	var html = new Array(250);
			
	html[idx++] = "<table class=calendar_view_table>";
	html[idx++] = "<tr><td>";
	html[idx++] = "<div id='"+this._headerId+"' style='position:relative;'>";
	html[idx++] = "<table id=calendar_month_header_table class=calendar_month_table>";
	html[idx++] = "<colgroup>";
	for (var i=0; i < 7; i++) {
		this._headerColId[i] = Dwt.getNextId();
		html[idx++] = "<col id='"+this._headerColId[i]+"'/>";
	}
	html[idx++] = "</colgroup>";
	html[idx++] = "<tr>";
	html[idx++] = "<td colspan=7 class=calendar_month_header_month id='"+this._titleId+"'></td>";
	html[idx++] = "</tr>";
	html[idx++] = "<tr>";
	
	for (var day in DwtMsg.LONG_WEEKDAY) {
		html[idx++] = "<td class=calendar_month_header_cells_text>"+DwtMsg.LONG_WEEKDAY[day]+"</td>";
	}

	html[idx++] = "</tr>";
	html[idx++] = "</table>";
	html[idx++] = "</div>";
	html[idx++] = "</td></tr>";
	html[idx++] = "<tr><td>";
	html[idx++] = "<div id='"+this._daysId+"' class=calendar_month_body>";
	html[idx++] = "<table id='"+this._bodyId+"' class=calendar_month_table>";
	html[idx++] = "<colgroup>";
	for (var i=0; i < 7; i++) {
		this._bodyColId[i] = Dwt.getNextId();
		html[idx++] = "<col id='"+this._bodyColId[i]+"'/>";
	}
	html[idx++] = "</colgroup>";
								
	for (var i=0; i < 6; i++)	 {
		this._weeks[i] = { appts: {} };
		html[idx++] = "<tr>";
		for (var j=0; j < 7; j++)	 {
			idx = this._createDay(html, idx, i*7+j, i, j);
		}
		html[idx++] = "</tr>";	
	}
	
	html[idx++] = "</table>";
	html[idx++] = "</div>";
	html[idx++] = "</td></tr>";
	html[idx++] = "</table>";
	html.length = idx;
	this.getHtmlElement().innerHTML = html.join("");
}

LmCalMonthView.prototype._updateDays =
function() {
	var d = new Date(this._date.getTime());
	this._month = d.getMonth();
	
	d.setHours(0,0,0,0);
	d.setDate(1)	
	var dow = d.getDay();
	if (dow == 0)
		d.setDate(d.getDate()-7);
	else 
		d.setDate(d.getDate()-dow);

	var doc = this.getDocument();

	this._dateToDayIndex = new Object();

	var today = new Date();
	today.setHours(0,0,0, 0);
	
	for (var i=0; i < 6; i++) {
		for (var j=0; j < 7; j++) {
			var day = this._days[i*7+j];
			day.date = new Date(d);
			this._dateToDayIndex[this._dayKey(day.date)] = day;
			var thisMonth = day.date.getMonth() == this._month;
	 		var te = Dwt.getDomObj(doc, day.titleId);
			te.innerHTML = this._dayTitle(d);
			te.className = thisMonth ? 'calendar_month_day_label' : 'calendar_month_day_label_off_month';
	 		var de = Dwt.getDomObj(doc, day.tdId);			
			de.className = d.getTime() == today.getTime() ? 'calendar_month_cells_td_today' :'calendar_month_cells_td';
			d.setDate(d.getDate()+1);
		}
	}
	
	var first = this._days[0].date;
	var last = this._days[41].date;
	this._title = DwtMsg.LONG_MONTH[this._date.getMonth()]+" "+this._date.getFullYear();	
	
	var title = Dwt.getDomObj(doc, this._titleId);
	title.innerHTML = this._title;
}

LmCalMonthView.prototype._layoutAllDay = 
function() {
	var dayY = [];
	var dayWidth;
	var sum = 0;
	for (var i=0; i < 6; i++)  {
		dayY[i] = sum;
		var sz = Dwt.getSize(Dwt.getDomObj(this.getDocument(), this._days[7*i].tdId));
		if (i == 0)
			dayWidth = sz.x;
		sum += sz.y;
	}
	
	for (var i=0; i < 6; i++)	 {
		var week = this._weeks[i];
		for (var key in week.appts) {
			var data = week.appts[key];
			var appt = data.first;
			var ae = Dwt.getDomObj(this.getDocument(), this._getItemId(appt));
			if (ae) {
				var apptWidth = (dayWidth * data.num) - 1;
				var apptX = dayWidth*data.dow;
				var apptY = dayY[i] + (17*data.row) + 17; //first 17, each appt + 1, second 17, day heading
				Dwt.setBounds(ae, apptX, apptY, apptWidth, Dwt.DEFAULT);
			}
		}
	}
}

LmCalMonthView.prototype._layout =
function() {
	var sz = this.getSize();
	var width = sz.x;
	var height = sz.y;

	if (width == 0 || height == 0) {
		return;
	}

	this._needFirstLayout = false;
		
	var doc = this.getDocument();

	var he = Dwt.getDomObj(doc, this._headerId);
	var headingHeight = Dwt.getSize(he).y;

	var w = width - 5;
	var h = height - headingHeight - 10;
	
	var de = Dwt.getDomObj(doc, this._daysId);
	Dwt.setSize(de, w, h);

	var be = Dwt.getDomObj(doc, this._bodyId);
	Dwt.setSize(be, w, h);

	var colWidth = Math.floor(w/7) - 1;

	for (var i=0; i < 7; i++) {
		var col = Dwt.getDomObj(doc, this._headerColId[i]);
		Dwt.setSize(col, colWidth, Dwt.DEFAULT);
		col = Dwt.getDomObj(doc, this._bodyColId[i]);
		Dwt.setSize(col, colWidth, Dwt.DEFAULT);		
	}

	this._layoutAllDay(h);
}

LmCalMonthView.getDayToolTipText =
function(date, list) {
	var html = new Array(50);
	var idx = 0;
	
	var title = DwtMsg.LONG_MONTH[date.getMonth()]+" "+date.getDate()+", "+date.getFullYear();
	
	html[idx++] = "<div>";
	html[idx++] = "<table cellpadding='0' cellspacing='0' border='0'>";	
	html[idx++] = "<tr><td><div class='calendar_tooltip_month_day_label'>"+title+"</div></td></tr>";
		
	html[idx++] = "<tr><td>";
	html[idx++] = "<table cellpadding='0' cellspacing='0' border='0'>";	
	
	var size = list ? list.size() : 0;

	for (var i=0; i < size; i++) {
		var ao = list.get(i);
		if (ao.isAllDayEvent()) {
			//DBG.println("AO    "+ao);
			html[idx++] = "<tr><td><table width=100% cellpadding='0' cellspacing='0' border='0'>";
			html[idx++] = "<tr>";
			if (ao._fanoutFirst)
				html[idx++] = "<td><div class=allday_blue_start></div></td>";
			html[idx++] = "<td width=100%>";		
			html[idx++] = "<div class=allday_blue_stretch><div class=allday_text>";
			html[idx++] = LsStringUtil.htmlEncode(ao.getName());
			html[idx++] = "</div></div>";
			html[idx++] = "</td>";
			if (ao._fanoutLast)
				html[idx++] = "<td><div class=allday_blue_end></div></td>";
			html[idx++] ="</tr>";
			html[idx++] = "</table></td></tr>";
		}
	}

	for (var i=0; i < size; i++) {
		var ao = list.get(i);
		if (!ao.isAllDayEvent()) {
			html[idx++] = "<tr><td class='calendar_month_day_item'><LI>";
			var dur = ao.getShortStartHour();
			html[idx++] = dur;
			if (dur != "") {
				html[idx++] = "&nbsp;";
			}
			html[idx++] = LsStringUtil.htmlEncode(ao.getName());
			html[idx++] = "</LI>";
			html[idx++] ="</td></tr>";
		}
	}
	
	if ( size == 0) {
		html[idx++] = "<tr><td>no appointments</td></tr>"; // TODO: i18n
	}
	html[idx++] = "</table>";
	html[idx++] = "</tr></td></table>";
	html[idx++] = "</div>";

	html.length = idx;

	return html.join("");	
}

LmCalMonthView._ondblclickHandler =
function (ev){
	ev = DwtUiEvent.getEvent(ev);
	ev._isDblClick = true;
	var element = DwtUiEvent.getTargetWithProp(ev, "id");
	if (!element) return;
	var id = element.id;
	var data = LmCalMonthView._idToData[id];
	if (!data) return;
	var now = new Date();
	data.date.setHours(now.getHours(), now.getMinutes(), 0, 0);
	LmCalMonthView._onclickHandler(ev, data);
};

LmCalMonthView._onclickHandler =
function(ev, optionalData) {
	var element = DwtUiEvent.getTargetWithProp(ev, "id");
	if (!element) return;
	var id = element.id;
	var data = (optionalData != null )? optionalData: LmCalMonthView._idToData[id];
	if (!data) return;
	var view = data.view;
	if (view) {
		if (!view._selectionEvent)
			view._selectionEvent = new DwtSelectionEvent(true);
	   	view._selectionEvent.item = view;
	   	view._selectionEvent.detail = data.date;
	   	view._selectionEvent.force = false;
		view._selectionEvent._isDblClick = ev._isDblClick;
	   	view.notifyListeners(LmCalBaseView.TIME_SELECTION, view._selectionEvent);
		view._selectionEvent._isDblClick = false;
	}
}

