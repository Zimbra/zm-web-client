/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */

ZmCalMonthView = function(parent, posStyle, controller, dropTgt) {
	ZmCalBaseView.call(this, parent, "calendar_view", posStyle, controller, ZmController.CAL_MONTH_VIEW, dropTgt);	
	//this.getHtmlElement().style.overflow = "hidden";
	this.setScrollStyle(DwtControl.CLIP);
	this._needFirstLayout = true;
	this.setNumDays(42);
};

ZmCalMonthView.prototype = new ZmCalBaseView;
ZmCalMonthView.prototype.constructor = ZmCalMonthView;

ZmCalMonthView._DaySpacer = 1; 			// space between days
ZmCalMonthView.FIRST_WORKWEEK_DAY = 1; 	// hard code to monday until we get real prefs
ZmCalMonthView.NUM_DAYS_IN_WORKWEEK = 5;// hard code to 5 days until we get real prefs

ZmCalMonthView.prototype.toString = 
function() {
	return "ZmCalMonthView";
};

ZmCalMonthView.prototype.getRollField =
function(isDouble) {
	return isDouble? AjxDateUtil.YEAR : AjxDateUtil.MONTH;
};

ZmCalMonthView.prototype._dateUpdate =
function(rangeChanged) {
	this._clearSelectedDay();
	this._updateSelectedDay();
};

ZmCalMonthView.prototype._updateTitle =
function()  {	
	// updated in updateDays
};

ZmCalMonthView.prototype._clearSelectedDay =
function() {
	if (this._selectedData != null) {
		var te = document.getElementById(this._selectedData.tdId);
		te.className = 'calendar_month_cells_td';			
		this._selectedData = null;
	}
};

ZmCalMonthView.prototype._updateSelectedDay =
function() {
	var day = this._dateToDayIndex[this._dayKey(this._date)];
	var te = document.getElementById( day.tdId);	
	te.className = 'calendar_month_cells_td-Selected';	
	this._selectedData = day;	
};

ZmCalMonthView.prototype._apptSelected =
function() {
	this._clearSelectedDay();
};

ZmCalMonthView.prototype._getWeekForAppt =
function(appt) {
	var day = this._getDayForAppt(appt);
	return day ? this._weeks[day.week] : null;
};

ZmCalMonthView.prototype._getDayForAppt =
function(appt) {
	return this._dateToDayIndex[this._dayKey(appt.startDate)];
};

ZmCalMonthView.prototype._getDivForAppt =
function(appt) {
	var day = this._getDayForAppt(appt);
	return day ? document.getElementById( day.dayId) : null;
};

ZmCalMonthView.prototype._getStartDate = 
function() {
	return new Date(this.getDate());
};

ZmCalMonthView.prototype.getPrintHtml = 
function() {
	var html = new Array();
	var idx = 0;
	var startDate = new Date(this.getTimeRange().start);
	var endDate = new Date(this.getTimeRange().end);
	var currDate = new Date(startDate.getTime());
	var currMonth = this.getDate().getMonth();
	var currYear = this.getDate().getFullYear();
	var list = this.getList();
	var count = 0;
	var numAppts = 0;

	html[idx++] = "<div style='width:100%'>";
	html[idx++] = "<table width=100% cellpadding=3 cellspacing=3 bgcolor='#EEEEEE' style='border:2px solid black; margin-bottom:2px'><tr>";
	html[idx++] = "<td valign=top width=100% style='font-size:22px; font-weight:bold; white-space:nowrap'>";
	html[idx++] = this._getDateHdrForPrintView();
	html[idx++] = "</td></tr></table>";

	html[idx++] = "<table border=0 cellpadding=1 cellspacing=1 style='border:2px solid black'><tr><td>";
	
	html[idx++] = "<table border=0>";
	// print the weekdays
	html[idx++] = "<tr>";

	var fdow = this.firstDayOfWeek();

	for (var i = 0; i < AjxDateUtil.WEEKDAY_LONG.length; i++) {
		html[idx++] = "<td valign=top style='width:120px; font-family:Arial; font-size:11px; white-space:nowrap; overflow:hidden; border:1px solid black;'><center><b>";
		html[idx++] = AjxDateUtil.WEEKDAY_LONG[(i+fdow)%7]
		html[idx++] = "</b></center></td>";
	}
	html[idx++] = "</tr>";
	
	var style = "width:118px; font-family:Arial; font-size:10px; white-space:nowrap; overflow:hidden;";
	
	// calc. the number of weeks in the current month
	var numOfWeeks = 0;
	while (currDate < endDate) {
		if ((currDate.getMonth() > currMonth && currDate.getFullYear() == currYear) || currDate.getFullYear() > currYear)
			break;
		currDate.setDate(currDate.getDate() + 7);
		numOfWeeks++;
	}
	
	currDate = new Date(startDate.getTime());
	var dayFormatter = DwtCalendar.getDayFormatter();
	var timeFormatter = AjxDateFormat.getTimeInstance(AjxDateFormat.SHORT);
	while (currDate < endDate) {
		// prevent printing extra week for next month
		if ((currDate.getMonth() > currMonth && currDate.getFullYear() == currYear) || currDate.getFullYear() > currYear)
			break;
		
		var rowHeight = numOfWeeks == 5 ? "100px" : "85px";
		var maxNumAppts = numOfWeeks == 5 ? 6 : 4;
		
		html[idx++] = "<tr style='height:";
		html[idx++] = rowHeight;
		html[idx++] = ";'>";
		for (var i = 0; i < AjxDateUtil.WEEKDAY_LONG.length; i++) {
			html[idx++] = "<td valign=top style='border:1px solid black;'><div style='text-align:right; color:#AAAAAA; "
			html[idx++] = style;
			html[idx++] = "'>";
			
			var dateHdr = (i == 0 && currDate.getMonth() != currMonth) || (currDate.getDate() == 1)
				? dayFormatter.format(currDate)
				: currDate.getDate();
			
			html[idx++] = "<b>";
			html[idx++] = dateHdr;
			html[idx++] = "</b></div>";
			numAppts = 0;
			var appt = list.get(count);
			while (appt && appt.startDate.getDate() == currDate.getDate()) {
				if (numAppts < maxNumAppts) {
					var loc = appt.getLocation();
					if (appt.isAllDayEvent()) {
						html[idx++] = "<div style='border:1px solid #AAAAAA; ";
						if (currDate.getMonth() != currMonth)
							html[idx++] = "color:#AAAAAA; ";
						html[idx++] = style + "'>";
						html[idx++] = "<b>";
						html[idx++] = appt.getName();
						html[idx++] = "</b>";
						if (loc) {
							html[idx++] = " (";
							html[idx++] = loc;
							html[idx++] = ")";
						}
						html[idx++] = "</div>";
					} else {
						var startTime = timeFormatter.format(appt.startDate);
						html[idx++] = "<div style='";
						html[idx++] = style;
						if (currDate.getMonth() != currMonth)
							html[idx++] = " color:#AAAAAA;";
						html[idx++] = "'>";
						html[idx++] = startTime;
						html[idx++] = "&nbsp;";
						html[idx++] = appt.getName();
						if (loc) {
							html[idx++] = " (";
							html[idx++] = loc;
							html[idx++] = ")";
						}
						html[idx++] = "</div>";
					}
					appt = list.get(++count);
					numAppts++;
				} else {
					html[idx++] = "<div style='";
					html[idx++] = style;
					html[idx++] = "'>";
					html[idx++] = ZmMsg.more;
					html[idx++] = "</div>";
					// move passed this day
					while (appt && appt.startDate.getDate() == currDate.getDate())
						appt = list.get(++count);
					break;
				}				
			}
			html[idx++] ="</td>";
			currDate.setDate(currDate.getDate() + 1);
			// if this is the last day of the week and the next day is the next month, dont bother continuing
			if (i == 6 && ((currDate.getMonth() > currMonth && currDate.getFullYear() == currYear) || currDate.getFullYear() > currYear))
				break;
		}
		html[idx++] = "</tr>";
	}
	html[idx++] = "</table>";
	
	html[idx++] = "</td></tr></table>";
	
	return html.join("");
};

ZmCalMonthView.prototype._getDateHdrForPrintView = 
function() {
	var formatter = DwtCalendar.getMonthFormatter();
	return formatter.format(this.getDate());
};

ZmCalMonthView.prototype._dayTitle =
function(date) {
	if (this._shortMonInDay != date.getMonth()) {
		this._shortMonInDay = date.getMonth();
		var formatter = DwtCalendar.getDayFormatter();
		return formatter.format(date);
	}
	return date.getDate();
};

ZmCalMonthView.prototype._reserveRow = 
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
};

ZmCalMonthView.prototype.addAppt = 
function(appt) {
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
};

ZmCalMonthView.prototype._postSet = 
function() {
	// now go through each day and create appts in correct order to line things up
	var allDayParent = document.getElementById( this._daysId); 
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
};

ZmCalMonthView.prototype._preSet = 
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
};

ZmCalMonthView.prototype._createAllDayItemHtml =
function(appt, apptEnd) {
	//DBG.println("---- createItem ---- "+appt);
	
	// set up DIV
	var div = document.createElement("div");	

	div.style.position = 'absolute';
	Dwt.setSize(div, 10, 10);
	div[DwtListView._STYLE_CLASS] = "appt";	
	div[DwtListView._SELECTED_STYLE_CLASS] = div[DwtListView._STYLE_CLASS] + '-' + DwtCssStyle.SELECTED;
	div.className = div[DwtListView._STYLE_CLASS];

	ZmCalColView._setApptOpacity(appt, div);


	var bs = "";
	if (!appt._fanoutFirst) bs = "border-left:none;";
	if (!apptEnd._fanoutLast) bs += "border-right:none;";
	var body_style = (bs != "") ? ("style='" + bs + "'") : "";

	this.associateItemWithElement(appt, div, ZmCalBaseView.TYPE_APPT);
	div.innerHTML = ZmApptViewHelper._allDayItemHtml(appt, this._getItemId(appt), body_style, this._controller);

	return div;
};

ZmCalMonthView.prototype._createAllDayFillerHtml =
function(day) {
	var dayTable = document.getElementById( day.dayId);
	var	result = dayTable.insertRow(-1);
	result[DwtListView._STYLE_CLASS] = "allday";
	result[DwtListView._SELECTED_STYLE_CLASS] = result[DwtListView._STYLE_CLASS] + '-' + DwtCssStyle.SELECTED;
	result.className = result[DwtListView._STYLE_CLASS];	
	var cell = result.insertCell(-1);
	cell.innerHTML = "<table class=allday><tr><td><div class=allday_item_filler></div></td></tr></table>";
	cell.className = "calendar_month_day_item";
	return result;
};

ZmCalMonthView.prototype._createItemHtml =	
function(appt) {
	var result = this._getDivForAppt(appt).insertRow(-1);
	result[DwtListView._STYLE_CLASS] = "calendar_month_day_item_row";
	result[DwtListView._SELECTED_STYLE_CLASS] = result[DwtListView._STYLE_CLASS] + '-' + DwtCssStyle.SELECTED;
	result.className = result[DwtListView._STYLE_CLASS];
	this.associateItemWithElement(appt, result, ZmCalBaseView.TYPE_APPT);

	var data = {
		appt: appt,
		duration: appt.getShortStartHour(),
		color: ZmCalendarApp.COLORS[this._controller.getCalendarColor(appt.folderId)] +
				(appt.ptst == ZmCalItem.PSTATUS_NEEDS_ACTION ? "DarkC" : "C"),
		multiday: appt._fanoutFirst != null,
		first: appt._fanoutFirst,
		last: appt._fanoutLast
	};

	var cell = result.insertCell(-1);
	cell.innerHTML = AjxTemplate.expand("calendar.Calendar#month_appt", data);
	cell.className = "calendar_month_day_item";

	return result;
};

ZmCalMonthView.prototype._createDay =
function(html, loc, week, dow) {
	var tdid = Dwt.getNextId();
	var did = Dwt.getNextId();
	var tid = Dwt.getNextId();	

	html.append("<td class='calendar_month_cells_td' id='", tdid, "'>");
	html.append("<div style='width:100%;height:100%;'>");
	html.append("<table class='calendar_month_day_table'>");
	html.append("<tr><td colspan=2 id='", tid, "'></td></tr></table>");
	html.append("<table class='calendar_month_day_table'><tbody id='", did, "'>");
	html.append("</tbody></table>");
	html.append("</div>");
	html.append("</td>");

	var data = { dayId: did, titleId: tid, tdId: tdid, week: week, dow: dow, view: this};
	this._days[loc] = data;
};

ZmCalMonthView.prototype._createHtml =
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
	this._dayNameId = [];
	this._bodyColId = [];

	var html = new AjxBuffer();
			
	html.append("<table class=calendar_view_table>");
	html.append("<tr><td>");
	html.append("<div id='", this._headerId, "' style='position:relative;'>");
	html.append("<table id=calendar_month_header_table class=calendar_month_header_table>");
	html.append("<colgroup>");
	for (var i=0; i < 7; i++) {
		this._headerColId[i] = Dwt.getNextId();
		html.append("<col id='", this._headerColId[i], "'/>");
	}
	html.append("</colgroup>");
	html.append("<tr>");
	html.append("<td colspan=7 class=calendar_month_header_month id='", this._titleId, "'></td>");
	html.append("</tr>");
	html.append("<tr>");
	
	for (var day=0; day < 7; day++) {
		this._dayNameId[day] = Dwt.getNextId();
		html.append("<td class=calendar_month_header_cells_text id='",this._dayNameId[day],"'></td>");
	}

	html.append("</tr>");
	html.append("</table>");
	html.append("</div>");
	html.append("</td></tr>");
	html.append("<tr><td>");
	html.append("<div id='", this._daysId, "' class=calendar_month_body>");
	
	html.append("<table id='", this._bodyId, "' class=calendar_month_table>");
	html.append("<colgroup>");
	for (var i=0; i < 7; i++) {
		this._bodyColId[i] = Dwt.getNextId();
		html.append("<col id='", this._bodyColId[i], "'/>");
	}
	html.append("</colgroup>");
								
	for (var i=0; i < 6; i++)	 {
		this._weeks[i] = { appts: {} };
		html.append("<tr>");
		for (var j=0; j < 7; j++)	 {
			this._createDay(html, i*7+j, i, j);
		}
		html.append("</tr>");	
	}
	
	html.append("</table>");
	html.append("</div>");
	html.append("</td></tr>");
	html.append("</table>");
	this.getHtmlElement().innerHTML = html.toString();
};

ZmCalMonthView.prototype._updateDays =
function() {
	var d = new Date(this._date.getTime());
	this._month = d.getMonth();
	
	d.setHours(0,0,0,0);
	d.setDate(1)	
	var dow = d.getDay();
	var fdow = this.firstDayOfWeek();
	if (dow != fdow) {
		d.setDate(d.getDate()-((dow+(7-fdow))%7));
	}

	this._dateToDayIndex = new Object();

	var today = new Date();
	today.setHours(0,0,0, 0);
	
	for (var i=0; i < 6; i++) {
		for (var j=0; j < 7; j++) {
			var loc = i*7+j;
			var day = this._days[loc];
			day.date = new Date(d.getTime());
			this._dateToDayIndex[this._dayKey(day.date)] = day;
			var thisMonth = day.date.getMonth() == this._month;
	 		var te = document.getElementById(day.titleId);
	 		var isToday = d.getTime() == today.getTime();
			//te.innerHTML = d.getTime() == today.getTime() ? ("<div class=calendar_month_day_today>" + this._dayTitle(d) + "</div>") : this._dayTitle(d);
			te.innerHTML = this._dayTitle(d);			
			te.className = (thisMonth ? 'calendar_month_day_label' : 'calendar_month_day_label_off_month') + (isToday ? "_today" : "");
	 		var de = document.getElementById(day.tdId);			
			de.className = 'calendar_month_cells_td';	
			de._loc = loc;
			de._type = ZmCalBaseView.TYPE_MONTH_DAY;
			d.setDate(d.getDate()+1);
		}
	}
	
	var formatter = DwtCalendar.getMonthFormatter();
	this._title = formatter.format(this._date);
	var titleEl = document.getElementById(this._titleId);
	titleEl.innerHTML = this._title;
};

ZmCalMonthView.prototype.getShortCalTitle = function(){
	var formatter = DwtCalendar.getShortMonthFormatter();
	return formatter.format(this._date);
};

ZmCalMonthView.prototype._layoutAllDay = 
function() {
	var dayY = [];
	var dayWidth;
	var sum = 0;
	for (var i=0; i < 6; i++)  {
		dayY[i] = sum;
		var sz = Dwt.getSize(document.getElementById( this._days[7*i].tdId));
		if (i == 0)
			dayWidth = sz.x;
		sum += sz.y;
	}
	
	for (var i=0; i < 6; i++)	 {
		var week = this._weeks[i];
		for (var key in week.appts) {
			var data = week.appts[key];
			var appt = data.first;
			var ae = document.getElementById( this._getItemId(appt));
			if (ae) {
				var apptWidth = (dayWidth * data.num) - 8;
				var apptX = dayWidth*data.dow + 3;
				var apptY = dayY[i] + (21*data.row) + 18 + 3; //first 17, each appt + 1, second 17, day heading
				Dwt.setLocation(ae, apptX, apptY);
				Dwt.setSize(ae, apptWidth, 16); //Dwt.DEFAULT);
				var apptBodyDiv = document.getElementById(ae.id + "_body");
				Dwt.setSize(apptBodyDiv, apptWidth, 16); //Dwt.DEFAULT);
			}
		}
	}
};

ZmCalMonthView.prototype._layout =
function() {

	DBG.println("ZmCalMonthView _layout!");

	var sz = this.getSize();
	var width = sz.x;
	var height = sz.y;

	if (width == 0 || height == 0) {
		return;
	}

	this._needFirstLayout = false;
		
	var he = document.getElementById(this._headerId);
	var headingHeight = Dwt.getSize(he).y;

	var w = width - 5;
	var h = height - headingHeight - 10;
	
	var de = document.getElementById(this._daysId);
	Dwt.setSize(de, w, h);

	var be = document.getElementById(this._bodyId);
	Dwt.setSize(be, w, h);

	var colWidth = Math.floor(w/7) - 1;

	var fdow = this.firstDayOfWeek();
	for (var i=0; i < 7; i++) {
		var col = document.getElementById(this._headerColId[i]);
		Dwt.setSize(col, colWidth, Dwt.DEFAULT);
		col = document.getElementById(this._bodyColId[i]);
		Dwt.setSize(col, colWidth, Dwt.DEFAULT);		

		var dayName = document.getElementById(this._dayNameId[i]);
		dayName.innerHTML = AjxDateUtil.WEEKDAY_LONG[(i+fdow)%7];
	}

	this._layoutAllDay(h);
};

ZmCalMonthView.getDayToolTipText =
function(date, list, controller, noheader) {
	var html = [];
	var idx = 0;

	html[idx++] = "<div><table cellpadding=0 cellspacing=0 border=0>";
	if (!noheader) {
		html[idx++] = "<tr><td><div class='calendar_tooltip_month_day_label'>";
		html[idx++] = DwtCalendar.getDateFullFormatter().format(date);
		html[idx++] = "</div></td></tr>";
	}
	html[idx++] = "<tr><td><table cellpadding=1 cellspacing=0 border=0 width=100%>";

	var size = list ? list.size() : 0;

	for (var i=0; i < size; i++) {
		var ao = list.get(i);
		if (ao.isAllDayEvent()) {
			var bs = "";
			if (!ao._fanoutFirst) bs = "border-left:none;";
			if (!ao._fanoutLast) bs += "border-right:none;";
			var bodyStyle = bs != "" ? ("style='" + bs + "'") : "";
			html[idx++] = "<tr><td><div class='appt'>";
			html[idx++] = ZmApptViewHelper._allDayItemHtml(ao, Dwt.getNextId(), bodyStyle, controller);
			html[idx++] = "</div></td></tr>";
		}
	}

	for (var i=0; i < size; i++) {
		var ao = list.get(i);
		if (!ao.isAllDayEvent()) {
			var isNew = ao.ptst == ZmCalItem.PSTATUS_NEEDS_ACTION
			var dur = ao.getDurationText(false, false);

			html[idx++] = "<tr><td class='calendar_month_day_item'><div class='";
			html[idx++] = ZmCalendarApp.COLORS[controller.getCalendarColor(ao.folderId)];
			html[idx++] = isNew ? "DarkC" : "C";
			html[idx++] = "'>";
			if (isNew) html[idx++] = "<b>";
			html[idx++] = dur;
			if (dur != "") html[idx++] = "&nbsp;";
			html[idx++] = AjxStringUtil.htmlEncode(ao.getName());
			if (isNew) html[idx++] = "</b>";
			html[idx++] = "</div></td></tr>";
		}
	}
	if ( size == 0) {
		html[idx++] = "<tr><td>";
		html[idx++] = ZmMsg.noAppts;
		html[idx++] = "</td></tr>";
	}
	html[idx++] = "</table></tr></td></table></div>";

	return html.join("");
};

ZmCalMonthView.prototype._mouseDownAction = 
function(ev, div) {
	switch (div._type) {
		case ZmCalBaseView.TYPE_MONTH_DAY:
			this._timeSelectionAction(ev, div, false);
			if (ev.button == DwtMouseEvent.RIGHT) {
				DwtUiEvent.copy(this._actionEv, ev);
				this._actionEv.item = this;
				this._evtMgr.notifyListeners(ZmCalBaseView.VIEW_ACTION, this._actionEv);
			}
			break;
	}
	return false;
};

ZmCalMonthView.prototype._doubleClickAction =
function(ev, div) {
	ZmCalBaseView.prototype._doubleClickAction.call(this, ev, div);
	if (div._type == ZmCalBaseView.TYPE_MONTH_DAY) {
		this._timeSelectionAction(ev, div, true);
	}
};

ZmCalMonthView.prototype._timeSelectionAction =
function(ev, div, dblclick) {
	
	var date;
	
	switch (div._type) {
		case ZmCalBaseView.TYPE_MONTH_DAY:
			date = new Date(this._days[div._loc].date.getTime());
			var now = new Date();
			date.setHours(now.getHours(), now.getMinutes());
			break;
		default:
			return;
	}
	this._timeSelectionEvent(date, AjxDateUtil.MSEC_PER_HOUR, dblclick);
};
