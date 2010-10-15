/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

ZmCalMonthView = function(parent, posStyle, controller, dropTgt) {
	ZmCalBaseView.call(this, parent, "calendar_view", posStyle, controller, ZmId.VIEW_CAL_MONTH, dropTgt);	

	this.setScrollStyle(DwtControl.CLIP);
	this._needFirstLayout = true;
	this.numDays = 42;

	this._monthItemClass = "calendar_month_day_item_row";
	this._monthItemSelectedClass = [this._monthItemClass, DwtCssStyle.SELECTED].join('-');
	this._monthItemDisabledSelectedClass = [this._monthItemSelectedClass, DwtCssStyle.DISABLED].join("-");
};

ZmCalMonthView.prototype = new ZmCalBaseView;
ZmCalMonthView.prototype.constructor = ZmCalMonthView;

ZmCalMonthView._DaySpacer = 1; 			// space between days
ZmCalMonthView.FIRST_WORKWEEK_DAY = 1; 	// hard code to monday until we get real prefs
ZmCalMonthView.NUM_DAYS_IN_WORKWEEK = 5;// hard code to 5 days until we get real prefs

ZmCalMonthView.EXPANDED_HEIGHT_PERCENT = 70;
ZmCalMonthView.EXPANDED_WIDTH_PERCENT = 50;
ZmCalMonthView.ANIMATE_NO_OF_FRAMES = 5;
ZmCalMonthView.ANIMATE_DURATION = 300;

ZmCalMonthView.prototype.toString = 
function() {
	return "ZmCalMonthView";
};

ZmCalMonthView.prototype.getRollField =
function() {
	return AjxDateUtil.MONTH;
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
	var day;
	if(this._expandedDayInfo) {
		var row = this._expandedDayInfo.week;
		var col = this._expandedDayInfo.dow;
		var day = this._days[row*7+col];
		var d = new Date(this._date.getTime());
		d.setHours(0,0,0);
		if(d.getTime() == day.date.getTime()) {
			this.setDayView(day);
		}else {
			this.createApptItems();
		}
	}else {
		this.createApptItems();
	}
};

ZmCalMonthView.prototype.createApptItems =
function() {
	var allDayParent = document.getElementById( this._daysId); 	
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
		
	if(this._dayView) {
		this._dayView.setVisible(false);
		this.clearExpandedDay();
	}
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
	div.className = this._getStyle();

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
	var dayTable = document.getElementById(day.dayId);
	var	result = dayTable.insertRow(-1);
	result.className = "allday";
	var cell = result.insertCell(-1);
	cell.innerHTML = "<table class=allday><tr><td><div class=allday_item_filler></div></td></tr></table>";
	cell.className = "calendar_month_day_item";
	return result;
};

ZmCalMonthView.prototype._createItemHtml =	
function(appt) {
	var result = this._getDivForAppt(appt).insertRow(-1);
	result.className = "calendar_month_day_item_row";
	this._getStyle(ZmCalBaseView.TYPE_APPT);
	this.associateItemWithElement(appt, result, ZmCalBaseView.TYPE_APPT);

	var needsAction = appt.ptst == ZmCalBaseItem.PSTATUS_NEEDS_ACTION;
	var calendar = appCtxt.getById(appt.folderId);
	var colors = ZmCalBaseView._getColors(calendar.rgb || ZmOrganizer.COLOR_VALUES[calendar.color]);
	var headerStyle = ZmCalBaseView._toColorsCss(needsAction ? colors.deeper.header : colors.standard.header);
	var bodyStyle = ZmCalBaseView._toColorsCss(needsAction ? colors.deeper.body : colors.standard.body);

	var data = {
		appt: appt,
		duration: appt.getShortStartHour(),
		headerStyle: headerStyle,
		bodyStyle: bodyStyle,
		multiday: appt._fanoutFirst != null,
		first: appt._fanoutFirst,
		last: appt._fanoutLast,
		showAsColor : ZmApptViewHelper._getShowAsColorFromId(appt.fba)
	};

	var cell = result.insertCell(-1);
	cell.innerHTML = AjxTemplate.expand("calendar.Calendar#month_appt", data);
	cell.className = "calendar_month_day_item";

	return result;
};

ZmCalMonthView.prototype._getStyle =
function(type, selected, disabled, item) {
	if (type == ZmCalBaseView.TYPE_APPT && item && !item.isAllDayEvent()) {
		return selected ? this._monthItemSelectedClass : this._monthItemClass;
	} else {
		return ZmCalBaseView.prototype._getStyle.apply(this, arguments);
	}
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
    this._showWeekNumber = appCtxt.get(ZmSetting.CAL_SHOW_CALENDAR_WEEK);    
	this._days = new Object();	
	this._rowIds = new Object();		
	this._weeks = new Array();
	this._dayInfo = new Object();
	this._fillers = [];
	this._headerId = Dwt.getNextId();
	this._titleId = Dwt.getNextId();	
	this._daysId = Dwt.getNextId();	
	this._bodyId = Dwt.getNextId();
	this._weekNumBodyId = Dwt.getNextId();
	this._headerColId = [];
	this._dayNameId = [];
	this._bodyColId = [];

	var html = new AjxBuffer();
			
	html.append("<table class=calendar_view_table cellpadding=0 cellspacing=0>");
	html.append("<tr>");

    if(this._showWeekNumber) {
        html.append("<td width=10 valign='bottom' class='calendar_month_header_cells_text'>");
	    html.append(AjxMsg.calendarWeekTitle);
	    html.append("</td>");
    }

	html.append("<td>");
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
	html.append("<tr>");

    if(this._showWeekNumber) {
        html.append("<td width=10>");

        //generate cells for showing week numbers on the side
        this._weekNumberIds = {};
        html.append("<table id='", this._weekNumBodyId, "' class='calendar_month_table'>");
        for (var i=0; i < 6; i++)	 {
            var weekNumberId = Dwt.getNextId();
            html.append("<tr>");
            html.append("<td id='" +  weekNumberId + "' class='calendar_month_weekno_td'>");
            html.append("</td>");
            html.append("</tr>");
            this._weekNumberIds[i] = weekNumberId;
        }
        html.append("</table>");
        html.append("</td>");
    }

	html.append("<td>");
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
		var weekId = Dwt.getNextId();
		html.append("<tr id='" +  weekId + "'>");
		for (var j=0; j < 7; j++)	 {
			this._createDay(html, i*7+j, i, j);
		}
		html.append("</tr>");	
		this._rowIds[i] = weekId;
	}
	
	html.append("</table>");
	html.append("</div>");
	html.append("</td></tr>");
	html.append("</table>");
	this.getHtmlElement().innerHTML = html.toString();
};

ZmCalMonthView.prototype._updateWeekNumber =
function(i) {
    if(!this._showWeekNumber) return;

    var day = this._days[i*7 + 0];
	if(day && day.date) {
        
        //todo: need to use server setting to decide the weekno standard
        var serverId = AjxTimezone.getServerId(AjxTimezone.DEFAULT);
        var useISO8601WeekNo = (serverId && serverId.indexOf("Europe")==0 && serverId != "Europe/London");

        var weekNumber = AjxDateUtil.getWeekNumber(day.date, this.firstDayOfWeek(), null, useISO8601WeekNo);
        var wkId = this._weekNumberIds[i];
        var wkCell = wkId ? document.getElementById(wkId) : null;
        if(wkCell) {
            wkCell.innerHTML = weekNumber;   
        }
    }
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
            day.dayClassName = te.className;
			var id = day.tdId;
	 		var de = document.getElementById(id);			
			de.className = 'calendar_month_cells_td';
			this.associateItemWithElement(null, de, ZmCalBaseView.TYPE_MONTH_DAY, id, {loc:loc});
            //d.setTime(d.getTime() + AjxDateUtil.MSEC_PER_DAY);
            var oldDate = d.getDate();
            d.setDate(d.getDate() + 1);
            if(oldDate == d.getDate()) {
                //daylight saving problem
                d.setHours(0,0,0,0);
                d.setTime(d.getTime() + AjxDateUtil.MSEC_PER_DAY);
            }
        }
        this._updateWeekNumber(i);
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

	var w = width - (this._showWeekNumber ? 15 : 5);
	var h = height - headingHeight - 10;
	
	var de = document.getElementById(this._daysId);
	Dwt.setSize(de, w, h);

	var be = document.getElementById(this._bodyId);
    if(h < Dwt.getSize(be).y){
        w = w - 15; //Less Scroll bar width
    }
	Dwt.setSize(be, w, h);

    if(this._showWeekNumber) {
        var wk = document.getElementById(this._weekNumBodyId);
        Dwt.setSize(wk, Dwt.DEFAULT, h);
    }

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

	for (var i=0; i < 6; i++) {
		var row = document.getElementById(this._rowIds[i]);
		Dwt.setSize(row, Dwt.DEFAULT, Math.floor(100/6) + '%');
        if(this._showWeekNumber) this.resizeWeekNumberCell(i, Math.floor(100/6) + '%');
	}

	this._layoutAllDay(h);
	if(this._expandedDayInfo) {
		this.resizeCalendarGrid();
	}
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
			var isNew = ao.ptst == ZmCalBaseItem.PSTATUS_NEEDS_ACTION;
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

	if (Dwt.ffScrollbarCheck(ev)) { return false; }

	var type = this._getItemData(div, "type");
	switch (type) {
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
	var type = this._getItemData(div, "type");
	if (type == ZmCalBaseView.TYPE_MONTH_DAY) {
		this._timeSelectionAction(ev, div, true);
	}
};

ZmCalMonthView.prototype._timeSelectionAction =
function(ev, div, dblclick) {

    var date;

    var type = this._getItemData(div, "type");
    switch (type) {
        case ZmCalBaseView.TYPE_MONTH_DAY:
            var loc = this._getItemData(div, "loc");
            date = new Date(this._days[loc].date.getTime());
            var now = new Date();
            date.setHours(now.getHours(), now.getMinutes());
			if(ev.button == DwtMouseEvent.LEFT) {
            	AjxTimedAction.scheduleAction(new AjxTimedAction(this, this.expandDay, [this._days[loc]]), 200);
			}
            break;
        default:
            return;
    }
    this._timeSelectionEvent(date, AjxDateUtil.MSEC_PER_HOUR, dblclick);
};

ZmCalMonthView.prototype.setDayView =
function(dayInfo) {
    var date = new Date(dayInfo.date.getTime());
    var tdCell = document.getElementById(dayInfo.tdId);
    var size = Dwt.getSize(tdCell);
    var view = this._dayView ;
    if(!view) {
        view = this._dayView = new ZmCalDayView(this, DwtControl.ABSOLUTE_STYLE, this._controller, this._dropTgt);
        view.setCompactMode(true);
        view.setCloseDayViewCallback(new AjxCallback(this, this._closeDayView));
        //listener changes
        view.addViewActionListener(new AjxListener(this._controller, this._controller._viewActionListener));
        view.addTimeSelectionListener(new AjxListener(this._controller, this._controller._timeSelectionListener));
        view.addSelectionListener(new AjxListener(this, this._dayListSelectionListener));
        view.addActionListener(new AjxListener(this._controller, this._controller._listActionListener));

    }else {
        view.setVisible(true);
    }

    view.setDate(date, 0, true);
    view.setSize(size.x-10, size.y-12);

    var loc = Dwt.toWindow(tdCell, 0, 0, this.getHtmlElement(), true);
    view.setLocation(loc.x+5, loc.y+5);

    view._preSet();
    view._layout(true);

    var subList = new AjxVector();
    var appts = dayInfo.appts;

    if(appts) {
        for(var i in appts) {
            subList.add(appts[i]);
        }
    }

    var allDayAppts = dayInfo.allDayAppts;

    if(allDayAppts) {
        for(var i in allDayAppts) {
            subList.add(allDayAppts[i])
        }
    }

    view.set(subList, true);
};

ZmCalMonthView.prototype.expandDay =
function(dayInfo) {
    this.clearCalendarGrid(true);
    this.startExpand(dayInfo);
};


ZmCalMonthView.prototype.clearCalendarGrid =
function(markApptDays) {
    for (var i=0; i < 6; i++) {

        //clear all day appts
        var week = this._weeks[i];
        for (var key in week.appts) {
            var data = week.appts[key];
            var appt = data.first;
            var ae = document.getElementById( this._getItemId(appt));
            if(ae) {
                ae.parentNode.removeChild(ae);
            }
        }

        for (var j=0; j < 7; j++) {
            var loc = i*7+j;
            var day = this._days[loc];
            if(day && day.dayId) {
                var node = document.getElementById(day.dayId);
                while(node && node.firstChild) {
                    node.firstChild.parentNode.removeChild(node.firstChild);
                }
            }
            if(day && day.titleId) {
                var te = document.getElementById(day.titleId);
                te.className = day.dayClassName?day.dayClassName : '';
                if(markApptDays) {
                    var apptAvailable = (day.appts && day.appts.length > 0) || (day.allDayAppts && day.allDayAppts.length > 0);
                    te.className = te.className + (apptAvailable ? ' calendar_month_day_label_bold' : '');
                }
            }            
        }
    }

    //clear all day fillers
    if (this._fillers.length > 0) {
        for (var i=0; i < this._fillers.length; i++) {
            var f = 	this._fillers[i];
            this._fillers[i] = null;
            if(f.parentNode) {
                f.parentNode.removeChild(f);
            }
        }
        this._fillers = [];
    }
};

ZmCalMonthView.prototype.resizeWeekNumberCell =
function(row, height) {

    if(!this._showWeekNumber) return;
    
    var weekNumCell = document.getElementById(this._weekNumberIds[row]);
    if(weekNumCell) {
        Dwt.setSize(weekNumCell, Dwt.DEFAULT, height);
    }
};

ZmCalMonthView.prototype.resizeCalendarGrid =
function() {
    var grid = document.getElementById(this._daysId)
    var size = Dwt.getSize(grid);

    var avgHeight = size.y/6;
    var avgWidth = size.x/7;

    for (var i=0; i < 6; i++) {
        var row = document.getElementById(this._rowIds[i]);
        if(i==5) {
            avgHeight = avgHeight-1;
        }
        Dwt.setSize(row, Dwt.DEFAULT, avgHeight);

        if(AjxEnv.isSafari) {
            Dwt.setSize(this.getCell(i, 0), Dwt.DEFAULT, avgHeight);            
        }

        this.resizeWeekNumberCell(i, avgHeight);
    }

    for (var j=0; j < 7; j++) {
        var hdrCol = document.getElementById(this._headerColId[j]);
        var bdyCol = document.getElementById(this._bodyColId[j]);
        if(j==6) {
            avgWidth = avgWidth-1;
        }
        Dwt.setSize(hdrCol, avgWidth, Dwt.DEFAULT);
        Dwt.setSize(bdyCol, avgWidth, Dwt.DEFAULT);
        if(AjxEnv.isSafari) {
            Dwt.setSize(this.getCell(0, j), avgWidth, Dwt.DEFAULT);            
        }
    }
};

ZmCalMonthView.prototype._closeDayView =
function() {
    if(this._dayView) {
        this._dayView.setVisible(false);
        this._needFirstLayout = false;
        this.clearExpandedDay();
        this.clearCalendarGrid();
        var newList = new AjxVector();
        newList.addList(this._list || [])
        this.set(newList, true);
    }
};

ZmCalMonthView.prototype.resizeCol =
function(colIdx, params) {
    var dayInfo = params.dayInfo;
    var hdrCol = document.getElementById(this._headerColId[colIdx]);
    var bdyCol = document.getElementById(this._bodyColId[colIdx]);
    var newWidth = params.avgWidth;

    if(dayInfo.dow == colIdx) {
        newWidth = params.expandedWidth;
    }else if( params.collapseColId == colIdx) {
        newWidth = params.collapsedWidth;
    }

    if(bdyCol && hdrCol) {
        newWidth = (colIdx==6) ? newWidth-1 : newWidth;
        Dwt.setSize(bdyCol, newWidth, Dwt.DEFAULT);
        Dwt.setSize(hdrCol, newWidth, Dwt.DEFAULT);

        if(AjxEnv.isSafari || AjxEnv.isChrome || (AjxEnv.isFirefox2_0up && !AjxEnv.isFirefox3up)) {
            //change first column cell
            Dwt.setSize(this.getCell(0, colIdx), newWidth, Dwt.DEFAULT);
        }

    }
};

ZmCalMonthView.prototype.resizeRow =
function(rowIdx, params) {

    if(rowIdx==null) return;

    var dayInfo = params.dayInfo;
    var height = params.avgHeight;

    var colId = null;

    if(dayInfo.week == rowIdx) {
        height = params.expandedHeight;
        colId = dayInfo.dow;
    }else if( params.collapseRowId == rowIdx) {
        height = params.collapsedHeight;
    }

    height = (rowIdx==5) ? height-1 : height;

    var row = document.getElementById(this._rowIds[rowIdx]);
    Dwt.setSize(row, Dwt.DEFAULT, height);

    //change first row cell
    if(AjxEnv.isSafari || AjxEnv.isChrome) {
        Dwt.setSize(this.getCell(rowIdx,0), Dwt.DEFAULT, height);
    }

    //IE needs direct cell expansion
    if(AjxEnv.isIE && colId!=null && rowIdx!=null) {
        var day = this.getCell(rowIdx, colId);
        Dwt.setSize(day, Dwt.DEFAULT, height);
    }

    this.resizeWeekNumberCell(rowIdx, height);
};

ZmCalMonthView.prototype.resizeCell =
function(dayInfo, height) {
    var day = this.getCell(dayInfo.week, dayInfo.dow);
    Dwt.setSize(day, Dwt.DEFAULT, height);
    this.resizeWeekNumberCell(dayInfo.week, height);
};

ZmCalMonthView.prototype.clearCellHeight =
function(dayInfo) {
    if(!dayInfo) return;
    var day = this.getCell(dayInfo.week, dayInfo.dow);
    Dwt.setSize(day, Dwt.DEFAULT, Dwt.CLEAR);
    this.resizeWeekNumberCell(dayInfo.week, Dwt.CLEAR);
};

ZmCalMonthView.prototype.getCell =
function(row, col) {
    var loc = row*7+col;
    var cellId = this._days[loc].tdId
    return document.getElementById(cellId);
};

ZmCalMonthView.prototype.startExpand =
function(dayInfo) {

    var grid = document.getElementById(this._daysId)
    var size = Dwt.getSize(grid);

    var expandedHeight = size.y*ZmCalMonthView.EXPANDED_HEIGHT_PERCENT/100;
    var expandedWidth = size.x*ZmCalMonthView.EXPANDED_WIDTH_PERCENT/100;
    var avgHeight = (size.y-expandedHeight)/5;
    var avgWidth = (size.x-expandedWidth)/6;
    var diffWidth = expandedWidth - avgWidth;
    var diffHeight = expandedHeight - avgHeight;
    var deltaWidth = diffWidth/ZmCalMonthView.ANIMATE_NO_OF_FRAMES;
    var deltaHeight = diffHeight/ZmCalMonthView.ANIMATE_NO_OF_FRAMES;

    var param = {
        dayInfo: dayInfo,
        avgWidth: avgWidth,
        avgHeight: avgHeight,
        expandedWidth: avgWidth,
        expandedHeight: avgHeight,
        maxWidth: expandedWidth,
        maxHeight: expandedHeight,
        deltaHeight: deltaHeight,
        deltaWidth: deltaWidth,
        changeCol: true,
        changeRow: true,
        frameNo: ZmCalMonthView.ANIMATE_NO_OF_FRAMES
    };

    //old expanded day needs to be collapsed
    if(this._expandedDayInfo) {
        var oldDayInfo = this._expandedDayInfo;

        param.collapseRowId = oldDayInfo.week;
        param.collapseColId = oldDayInfo.dow;
        param.collapsedWidth = expandedWidth;
        param.collapsedHeight = expandedHeight;

        if(oldDayInfo.week == dayInfo.week) {
            param.changeRow = false;
            param.expandedHeight = expandedHeight;
        }
        if(oldDayInfo.dow == dayInfo.dow) {
            param.changeCol = false;
            param.expandedWidth = expandedWidth;
        }
    }

    if(this._dayView) {
        this._dayView.setVisible(false);
    }

    this.animateExpansion(param);
};


ZmCalMonthView.prototype.animateExpansion =
function(param) {

    if(param.frameNo <= 0) {
        this._expandDayGrid(param);
        this.setDayView(param.dayInfo);
        var dayInfo = param.dayInfo;
        this._expandedDayInfo = {week: dayInfo.week, dow: dayInfo.dow, date: dayInfo.date};
        return;
    }

    this._expandDayGrid(param);

    var interval = ZmCalMonthView.ANIMATE_DURATION/ZmCalMonthView.ANIMATE_NO_OF_FRAMES;

    if(param.changeCol) {
        param.expandedWidth = (param.expandedWidth!=null)? param.expandedWidth + param.deltaWidth : null;
        param.collapsedWidth = (param.collapsedWidth)? param.collapsedWidth - param.deltaWidth : null;
    }else {
        param.expandedWidth = param.collapsedWidth = param.maxWidth;
    }

    if(param.changeRow) {
        param.expandedHeight = (param.expandedHeight!=null)? param.expandedHeight + param.deltaHeight : null;
        param.collapsedHeight = (param.collapsedHeight!=null)? param.collapsedHeight - param.deltaHeight : null;
    }else {
        param.expandedHeight = param.collapsedHeight = param.maxHeight;
    }

    param.frameNo = param.frameNo - 1;
    AjxTimedAction.scheduleAction(new AjxTimedAction(this, this.animateExpansion, [param]), interval);
};

ZmCalMonthView.prototype._expandDayGrid =
function(params) {

    var dayInfo = params.dayInfo;

    if(!this._expandedDayInfo) {
        for (var i=0; i < 6; i++) {
            this.resizeRow(i, params);
        }
        for (var j=0; j < 7; j++) {
            this.resizeCol(j, params);
        }
    }else {
        if(params.changeRow) {
            this.resizeRow(params.collapseRowId, params);
            this.resizeRow(dayInfo.week, params);
        }

        if(params.changeCol) {
            this.resizeCol(params.collapseColId, params);
            this.resizeCol(dayInfo.dow, params);
        }

        if(AjxEnv.isIE){
            if(!params.changeRow) {
                this.resizeCell(dayInfo, params.maxHeight);
            }
            this.clearCellHeight(this._expandedDayInfo);
        }

    }
};

ZmCalMonthView.prototype.clearExpandedDay =
function() {
    if(!this._expandedDayInfo) return;
    this.clearCellHeight(this._expandedDayInfo);
    this.resizeCalendarGrid();
    this._expandedDayInfo = null;
};

ZmCalMonthView.prototype._controlListener =
function(ev) {
    if(!this._expandedDayInfo) {
        ZmCalBaseView.prototype._controlListener.call(this, ev);
    }else {
        this._closeDayView();
    }
};

ZmCalMonthView.prototype._viewActionListener =
function(ev) {
    this.notifyListeners(ZmCalBaseView.VIEW_ACTION, ev);
};

ZmCalMonthView.prototype._dayListSelectionListener =
function(ev) {
    this._evtMgr.notifyListeners(DwtEvent.SELECTION, ev);
};

ZmCalMonthView.prototype.getSelection =
function() {
    if(this._expandedDayInfo) {
        return this._dayView.getSelection();
    }else {
        return ZmCalBaseView.prototype.getSelection.call(this);
    }
};

ZmCalMonthView.prototype.resizeDayCell =
function(rowId, colId) {
    var sz = this.getSize();
    var width = sz.x;
    var height = sz.y;

    var he = document.getElementById(this._headerId);
    var headingHeight = Dwt.getSize(he).y;

    var w = width - 5;
    var h = height - headingHeight - 10;

    var de = document.getElementById(this._daysId);
    Dwt.setSize(de, w, h);

    var be = document.getElementById(this._bodyId);
    Dwt.setSize(be, w, h);

    var grid = document.getElementById(this._daysId)
    var size = Dwt.getSize(grid);
    var height = size.y*ZmCalMonthView.EXPANDED_HEIGHT_PERCENT/100;
    var width = size.x*ZmCalMonthView.EXPANDED_WIDTH_PERCENT/100;


    var row = document.getElementById(this._rowIds[rowId]);
    var bodyCol = document.getElementById(this._bodyColId[colId]);
    var headerCol = document.getElementById(this._headerColId[colId]);
    if(row) {
        Dwt.setSize(row, Dwt.DEFAULT, height);
        Dwt.setSize(row.firstChild, Dwt.DEFAULT, height);
        Dwt.setSize(document.getElementById(this._days[rowId*7+colId].tdId), Dwt.DEFAULT, height);
    }
    if(bodyCol && headerCol) {
        Dwt.setSize(bodyCol, width, Dwt.DEFAULT);
        Dwt.setSize(headerCol, width, Dwt.DEFAULT);
    }

};