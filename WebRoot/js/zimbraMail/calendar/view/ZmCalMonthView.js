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
	ZmCalBaseView.call(this, parent, "calendar_view", posStyle, controller, ZmId.VIEW_CAL_MONTH, false);	

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

ZmCalMonthView.OUT_OF_BOUNDS_SNAP = -1000;

ZmCalMonthView.ALL_DAY_DIV_BODY   = "_body";

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


ZmCalMonthView.prototype._getDayForAppt =
function(appt) {
	return this._getDayForDate(appt.startDate);
};

ZmCalMonthView.prototype._getDayForDate =
function(date) {
	return this._dateToDayIndex[this._dayKey(date)];
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

ZmCalMonthView.prototype._getApptUniqueId =
function(appt) {
    return (appt._orig) ? appt._orig.getUniqueId() : appt.getUniqueId();
}

ZmCalMonthView.prototype._reserveRow = 
function(day, apptSet, appt) {
	var appts = day.allDayAppts;
    var row = -1;

    if (apptSet.rows[day.week] === undefined) {
        // New apptSet, or another week in the set.  Find a free slot or add to the end
        row = this._allocateRow(day, apptSet);
    } else {
        // Use the existing row for the apptSet
        row = apptSet.rows[day.week];
    }
    var apptToMove = appts[row];
    appts[row] = appt;

    if (apptToMove) {
        // The row was in use, need to move to free slot or end
        var uniqId = this._getApptUniqueId(apptToMove);
        var apptSetToMove = this._apptSets[uniqId];
        row = this._allocateRow(day, apptSetToMove);
        appts[row] = apptToMove;
        apptSetToMove.rows[day.week] = row;
    }
};

ZmCalMonthView.prototype._allocateRow =
function(day, apptSet) {
    var appts = day.allDayAppts;
    apptSet.rows[day.week] = appts.length;
    for (var i=0; i < appts.length; i++) {
        if (appts[i] == null) {
            apptSet.rows[day.week] = i;
            break;
        }
    }
    return apptSet.rows[day.week];
}

ZmCalMonthView.prototype.addAppt = 
function(appt) {
    var day = this._getDayForAppt(appt);

    if (appt._orig.isAllDayEvent() || appt._orig.isMultiDay()) {
        var uniqueId = this._getApptUniqueId(appt);
        var apptSet = this._apptSets[uniqueId];
        if (apptSet == null) {
            apptSet = this._createApptSet(appt, uniqueId);
        }
        apptSet.appts.push(appt);
    }

    if (day) {
        if (appt._orig.isAllDayEvent(appt)) {
            // make sure multi-day all day appts line up
            // Assuming sliced up appts passed in chronological order (first is start) - verify
            if (!day.allDayAppts) {
                day.allDayAppts = [];
            }  else {

            }
            // Reserve a row if its onscreen
            this._reserveRow(day, apptSet, appt);
        } else {
            if (!day.appts) {
                day.appts = [];
            }
            day.appts.push(appt);
        }
    }

};


// Multi-day appts have been sliced into a set of single day appts.  Accumulate
// the appts into an apptSet, so that when DnD is performed we can update the
// position of each appt slice that comprises the full appt.
ZmCalMonthView.prototype._createApptSet =
function(appt, uniqueId, day) {
    var dow;
    var apptSet = null;
    if (day) {
        dow = day.dow;
    } else {
        // DayIndex should be < 0 (no corresponding day, and assuming sliced appts
        // passed in from earliest to last)
        var dayIndex = this._createDayIndexFromDate(appt.startDate);
        var zeroDay = this._days[0]
        dow = (zeroDay.dow + dayIndex + 7) % 7;
    }
    // The set tracks the starting dow of the full appt, whether or not it is
    // an all-day event (note that there can be multi-day non-all-day appts),
    // the appt slices (one per day) that comprise the full appt, and the row
    // position of each slice  (in case the full appt spans multiple weeks).
    apptSet = { appts: [], rows: {}, dow: dow, allDay: appt.isAllDayEvent()};
    this._apptSets[uniqueId] = apptSet;
    return apptSet;
}

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
    var day;
    // Create the all-day divs
    this._apptAllDayDiv = {};
    for (var uniqueId in this._apptSets) {
        var apptSet = this._apptSets[uniqueId];
        if (!apptSet.allDay) continue;

        var currentWeek = -1;
        var first = true;
        var last = false;
        var startDayIndex = this._createDayIndexFromDate(apptSet.appts[0]._orig.startDate);
        // Set first (header div) if offscreen and first div, or first on the grid,
        //   starting a new week.
        // Set last if in last day (41) or last in appt sequence
        for (var iAppt = 0; iAppt < apptSet.appts.length; iAppt++) {
            var appt = apptSet.appts[iAppt];
            day = this._getDayForAppt(appt);
            first = (iAppt == 0);
            last = (iAppt == (apptSet.appts.length - 1));
            if (day) {
                if (((startDayIndex + iAppt) == (this.numDays -1))) {
                    last = true;
                }
                if (day.week != currentWeek) {
                    // Catches 1st on-screen appt (0th or not)
                    first = true;
                    currentWeek = day.week;
                }
            }
            var allDayDiv = this._createAllDayApptDiv(allDayParent, appt, iAppt, first, last);
            if (!day) {
                Dwt.setVisible(allDayDiv, false);
            }
            first = false;
            last = false;
        }
    }

	for (var i=0; i < 6; i++)	 {
		for (var j=0; j < 7; j++)	 {
            var dayIndex = i*7+j;
			day = this._days[dayIndex];
			if (day.allDayAppts) {
				for (var k=0; k < day.allDayAppts.length; k++) {
					var appt = day.allDayAppts[k];			
					var div = this._attachAllDayFillerHtml(appt, dayIndex);
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
    this._apptSets = new Object();;
	for (var i=0; i < 6; i++)	 {
		for (var j=0; j < 7; j++)	 {
			day = this._days[i*7+j];
			if (day.allDayAppts)	delete day.allDayAppts;
			if (day.appts) delete day.appts;
		}
	}
};


ZmCalMonthView.prototype._createAllDayApptDiv =
function(allDayParent, appt, iAppt, first, last) {
    var allDayDiv = this._createAllDayItemHtml(appt, first, last);
    allDayParent.appendChild(allDayDiv);
    var divKey = appt.invId + "_" + iAppt.toString();
    if (!this._apptAllDayDiv[divKey]) {
        this._apptAllDayDiv[divKey] = allDayDiv.id;
    }
    return allDayDiv;
}


ZmCalMonthView.prototype._createAllDayItemHtml =
function(appt, first, last) {
	//DBG.println("---- createItem ---- "+appt);
	
	// set up DIV
	var div = document.createElement("div");	

	div.style.position = 'absolute';
	Dwt.setSize(div, 10, 10);
	div.className = this._getStyle();

    div.style.overflow = "hidden";
    div.style.paddingBottom = "4px"
    div.head = first;
    div.tail = last;

	this.associateItemWithElement(appt, div, ZmCalBaseView.TYPE_APPT);
    var id = this._getItemId(appt);
	div.innerHTML = ZmApptViewHelper._allDayItemHtml(appt, id, this._controller, first, last);
    var apptBodyDiv = div.firstChild;

    if (!first) {
        apptBodyDiv.style.cssText += "border-left: 0px none black !important;";
    }
    if (!last) {
        apptBodyDiv.style.cssText += "border-right: 0px none black !important;";
    }
    // Set opacity on the table that is colored with the gradient - needed by IE
    var tableEl = Dwt.getDescendant(apptBodyDiv, id + "_tableBody");
    ZmCalBaseView._setApptOpacity(appt, tableEl);

	return div;
};


ZmCalMonthView.prototype._attachAllDayFillerHtml =
function(appt, dayIndex) {
    var day = this._days[dayIndex];
    var dayTable = document.getElementById(day.dayId);
    return this._createAllDayFillerHtml(appt, dayIndex, dayTable);
}

ZmCalMonthView.prototype._createAllDayFillerHtml =
function(appt, dayIndex, dayTable) {
    var targetTable = null;
    var remove = false;
    if (!dayTable) {
        if (!this._fillerGenTableBody) {
            var table = document.createElement("table");
            this._fillerGenTableBody = document.createElement("tbody");
            table.appendChild(this._fillerGenTableBody);
        }
        targetTable = this._fillerGenTableBody;
        remove = true;
    } else {
        targetTable = dayTable;
    }
	var	result = targetTable.insertRow(-1);
    if (appt) {
        result.id = appt.invId + ":" + dayIndex;
    }
	result.className = "allday";
    this._createAllDayFillerContent(result, true);
    if (remove) {
        result.parentNode.removeChild(result);
    }
	return result;
};


ZmCalMonthView.prototype._createAllDayFillerContent =
function(tr, createCell) {
    var cell;
    if (createCell) {
        cell = tr.insertCell(-1);
    } else {
        cell = tr.firstChild;
    }
    cell.innerHTML = "<table class=allday><tr><td><div class=allday_item_filler></div></td></tr></table>";
    cell.className = "calendar_month_day_item";
}



ZmCalMonthView.prototype._createItemHtml =	
function(appt) {
	var result = this._getDivForAppt(appt).insertRow(-1);
	result.className = this._getStyle(ZmCalBaseView.TYPE_APPT);
    result.apptStartTimeOffset  = this._getTimeOffset(appt.getStartTime());

	this.associateItemWithElement(appt, result, ZmCalBaseView.TYPE_APPT);

    this._createItemHtmlContents(appt, result);

	return result;
};

ZmCalMonthView.prototype._createItemHtmlContents =
function(appt, tr) {
    var needsAction = appt.ptst == ZmCalBaseItem.PSTATUS_NEEDS_ACTION;
    var calendar = appCtxt.getById(appt.folderId);
    var fba = needsAction ? ZmCalBaseItem.PSTATUS_NEEDS_ACTION : appt.fba;

    var tagIds  = appt.getVisibleTags();
    var tagIcon = appt.getTagImageFromIds(tagIds);

    var headerColors = ZmApptViewHelper.getApptColor(needsAction, calendar, tagIds, "header");
    var headerStyle  = ZmCalBaseView._toColorsCss(headerColors.appt);
    var bodyColors   = ZmApptViewHelper.getApptColor(needsAction, calendar, tagIds, "body");
    var bodyStyle    = ZmCalBaseView._toColorsCss(bodyColors.appt);


    var data = {
        id: this._getItemId(appt),
        appt: appt,
        duration: appt.getShortStartHour(),
        headerStyle: headerStyle,
        bodyStyle: bodyStyle,
        multiday: appt._fanoutFirst != null,
        first: appt._fanoutFirst,
        last: appt._fanoutLast,
        showAsColor : ZmApptViewHelper._getShowAsColorFromId(fba),
        tagIcon: tagIcon
    };
    ZmApptViewHelper.setupCalendarColor(true, bodyColors, tagIds, data, "headerStyle", null, 0, 0);

    var cell = tr.insertCell(-1);
    cell.className = "calendar_month_day_item";
    cell.innerHTML = AjxTemplate.expand("calendar.Calendar#month_appt", data);
    // Hack for IE - it doesn't display the tag and peel unless you  alter a containing className.
    // The month template div does not have any classNames, so this is safe.
    cell.firstChild.className = "";
}

ZmCalMonthView.prototype._getStyle =
function(type, selected, disabled, item) {
	if (type == ZmCalBaseView.TYPE_APPT && item && !item.isAllDayEvent()) {
        return (!selected) ? this._monthItemClass :
                 (disabled ? this._monthItemDisabledSelectedClass :
                             this._monthItemSelectedClass);
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
    this._apptSets = new Object();
	this._dayInfo = new Object();
	this._fillers = [];
	this._headerId = Dwt.getNextId();
	this._titleId = Dwt.getNextId();	
	this._daysId = Dwt.getNextId();	
	this._bodyId = Dwt.getNextId();
	this._weekNumBodyId = Dwt.getNextId();
    this._monthViewTable = Dwt.getNextId();
	this._headerColId = [];
	this._dayNameId = [];
	this._bodyColId = [];

	var html = new AjxBuffer();
			
	html.append("<table class=calendar_view_table cellpadding=0 cellspacing=0 id='",this._monthViewTable,"'>");
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

        // AjxDateUtil alters the date.  Make a copy
        var date = new Date(day.date.getTime());
        var weekNumber = AjxDateUtil.getWeekNumber(date, this.firstDayOfWeek(), null, useISO8601WeekNo);

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
			var loc = this._calcDayIndex(i, j);
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

ZmCalMonthView.prototype._calcDayIndex =
function(rowIndex, colIndex) {
    return (rowIndex * 7) + colIndex;
}

ZmCalMonthView.prototype.getShortCalTitle = function(){
	var formatter = DwtCalendar.getShortMonthFormatter();
	return formatter.format(this._date);
};

ZmCalMonthView.prototype._setAllDayDivSize =
function(allDayDiv, width) {
    Dwt.setSize(allDayDiv, width, 16 + 4); //Dwt.DEFAULT);
    var apptBodyDiv = document.getElementById(allDayDiv.id + ZmCalMonthView.ALL_DAY_DIV_BODY);
    Dwt.setSize(apptBodyDiv, width, 16); //Dwt.DEFAULT);
}

ZmCalMonthView.prototype._layoutAllDay = 
function() {
	var dayY = [];
	var sum = 0;
	for (var i=0; i < 6; i++)  {
		dayY[i] = sum;
		var sz = Dwt.getSize(document.getElementById( this._days[7*i].tdId));
		if (i == 0)
			this.dayWidth = sz.x;
		sum += sz.y;
	}

    var apptWidth = this.dayWidth;
    for (var uniqueId in this._apptSets) {
        var apptSet = this._apptSets[uniqueId];
        if (!apptSet.allDay) continue;

        for (var iAppt = 0; iAppt < apptSet.appts.length; iAppt++) {
            var appt = apptSet.appts[iAppt];
            var ae = document.getElementById( this._getItemId(appt));
            if (ae) {
                var width = this._calculateAllDayWidth(apptWidth, ae.head, ae.tail);
                this._setAllDayDivSize(ae, width);

                var day = this._getDayForAppt(appt);
                if (day) {
                    var dow = (apptSet.dow + iAppt) % 7;
                    var apptX = this._calculateAllDayX(dow, ae.head);
                    var apptY = dayY[day.week] + (21*apptSet.rows[day.week]) + 18 + 3; //first 17, each appt + 1, second 17, day heading
                    Dwt.setLocation(ae, apptX, apptY);
                }
            }
        }
    }

};

// Week = week integer index, row = row index within cell, dow = day of week,
// iAppt = appt slice of a multi-day appt, 0 .. (numDays-1)
ZmCalMonthView.prototype._calculateAllDayX =
function(dow, head) {
    var apptX = 0;
    if (head) {
        apptX = (this.dayWidth * dow) + 3;
    } else {
        apptX = this.dayWidth * dow;
    }
    return apptX;
}


ZmCalMonthView.prototype._calculateAllDayWidth =
function(baseWidth, head, tail) {
    var apptWidth = baseWidth;
    if (head) {
        apptWidth -= 3;
     }
    //return (this.dayWidth * (dow + iAppt)) + 3;
    // +1 for overlap to make box-shadow on the bottom be seamless
    return apptWidth + (tail ? -3 : 1);
}


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

	colWidth = Math.floor(w/7) - 1;

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
	}

	this._layoutAllDay(h);
	if(this._expandedDayInfo) {
        this.resizeCalendarGrid();
	}
    this.resizeAllWeekNumberCell();
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
			//if (!ao._fanoutFirst) bs = "border-left:none;";
			//if (!ao._fanoutLast) bs += "border-right:none;";
			//var bodyStyle = bs != "" ? ("style='" + bs + "'") : "";
			html[idx++] = "<tr><td><div class='appt'>";
			html[idx++] = ZmApptViewHelper._allDayItemHtml(ao, Dwt.getNextId(),
                controller, true, true);
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

	//if (Dwt.ffScrollbarCheck(ev)) { return false; }

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
        case ZmCalBaseView.TYPE_APPT:
            this.setToolTipContent(null);
            this._apptMouseDownAction(ev, div);
            break;
        case ZmCalBaseView.TYPE_ALL_DAY:
            this.setToolTipContent(null);
            this._apptMouseDownAction(ev, div);
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


ZmCalMonthView.prototype._getItemClickedSet =
function(clickedEl) {
    var clickedElSet = [];
    var appt = this.getItemFromElement(clickedEl);
    if (appt.isAllDayEvent()) {
        var uniqueId = this._getApptUniqueId(appt);
        var apptSet = this._apptSets[uniqueId];
        for (var iAppt = 0; iAppt < apptSet.appts.length; iAppt++) {
            clickedElSet.push(this._getAllDayDiv(appt, iAppt));
        }
    } else {
        clickedElSet.push(clickedEl);
    }
    return clickedElSet;
}


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
                if(ZmCalViewController._contextMenuOpened){
                    ZmCalViewController._contextMenuOpened = false;
                    break;
                }
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
        for (var uniqueId in this._apptSets) {
            var apptSet = this._apptSets[uniqueId];
            if (!apptSet.allDay) continue;

            for (var iAppt = 0; iAppt < apptSet.appts.length; iAppt++) {
                var appt = apptSet.appts[iAppt];
                var ae = document.getElementById( this._getItemId(appt));
                if(ae) {
                    ae.parentNode.removeChild(ae);
                }
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

ZmCalMonthView.prototype.resizeAllWeekNumberCell =
function() {
    // Calculate the row heights and apply to the week number cells
    var previousY = 0;
    for (var iRow=0; iRow < 6; iRow++) {
        var row = document.getElementById(this._rowIds[iRow]);
        // Use location to calculate y size - getSize may get off by one
        // due to rounding errors.
        var location = Dwt.getLocation(row);
        if (iRow > 0) {
            var ySize = location.y - previousY;
            this.resizeWeekNumberCell(iRow-1, ySize);
        }
        previousY = location.y;
    }
}

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
    this.resizeAllWeekNumberCell();
    this._expandedDayInfo = null;
};

ZmCalMonthView.prototype._controlListener =
function(ev) {
    if(!this._expandedDayInfo) {
        ZmCalBaseView.prototype._controlListener.call(this, ev);
        var mvTable = document.getElementById(this._monthViewTable);
        var s = Dwt.getSize(mvTable);
        if(s.y != ev.newHeight || s.x != ev.newWidth){
            this._layout();
        }                
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

// --- Overrides of ZmCalBaseView Appt DnD, and custom DnD functions
ZmCalMonthView.prototype._createContainerRect =
function(data) {
    var calendarBody = document.getElementById(this._bodyId);
    var calPt = Dwt.getLocation(calendarBody);
    var calSize = Dwt.getSize(calendarBody);
    this._containerRect = new DwtRectangle(calPt.x, calPt.y, calSize.x, calSize.y);
    data.originX = calPt.x;
    data.originY = calPt.y;
    DBG.println(AjxDebug.DBG3,"_createContainerRect containerRect.y: " + calPt.y);
}


// called when DND is confirmed after threshold
ZmCalMonthView.prototype._apptDndBegin =
function(data) {
	var loc = Dwt.getLocation(data.apptEl);
    data.dndObj = {};
    data.apptX = loc.x;
    data.apptY = loc.y;
    //DBG.println(AjxDebug.DBG3,"MouseMove Begin apptOffset.x,y: " + data.apptOffset.x + "," + data.apptOffset.y +
    //    ", originX, originY: " + data.originX + "," + data.originY);

    this._colWidth = this.dayWidth;

    data.snap = this._snapXYToDate(data.docX - data.originX, data.docY - data.originY);
    if (data.snap == null) return false;

    var originalAppt = data.appt._orig;
    data.startDate   = new Date(originalAppt.getStartTime());
    var date = new Date(data.startDate);
    date.setHours(0,0,0,0);
    data.startDayIndex = this._createDayIndexFromDate(date);
    data.offsetDayIndex = data.snap.dayIndex - data.startDayIndex;
    data.startDateOffset  = -(data.offsetDayIndex * AjxDateUtil.MSEC_PER_DAY);
    data.timeOffset  = [];

    if (data.appt.isAllDayEvent()) {
        // All day, possibly multi-day appt
        data.timeOffset.push(0);
        data.numDays = this._createDayIndexFromDate(originalAppt.endDate) - data.startDayIndex;
        data.offsetY  = [];
        var allDayDiv = null;
        var blankHtml = null;

        // Offscreen divs are already setup, merely not positioned and made visible.
        // Alter the display html of onscreen divs from 2nd to last-1 to be blank (!head and !tail)
        for (var i = 0; i < data.numDays; i++) {
            var iDay = data.startDayIndex + i;
            allDayDiv = this._getAllDayDiv(data.appt, i);
            if ((iDay >= 0) && (iDay < this.numDays)) {
                // Initially onscreen div
                day = this._days[iDay];
                this._calculateOffsetY(data, allDayDiv, day.week);
                if (data.numDays > 1) {
                    if (i == 0) {
                        allDayDiv.saveHtml  = allDayDiv.innerHTML;
                        this._clearIcon(allDayDiv.id, "tag");
                        this._clearIcon(allDayDiv.id, "peel");
                    } else {
                        if (allDayDiv.head || (allDayDiv.tail  && (i < (data.numDays - 1)))) {
                            allDayDiv.saveHtml  = allDayDiv.innerHTML;
                            if (!blankHtml) {
                                var itemId = this._getItemId(data.appt);
                                blankHtml = ZmApptViewHelper._allDayItemHtml(data.appt, itemId, this._controller, false, false);
                            }
                            allDayDiv.innerHTML = blankHtml;
                            allDayDiv.firstChild.id = allDayDiv.id + ZmCalMonthView.ALL_DAY_DIV_BODY;

                            allDayDiv.firstChild.style.cssText += "border-left: 0px none black !important;";
                            allDayDiv.firstChild.style.cssText += "border-right: 0px none black !important;";
                            this._setAllDayDnDSize(allDayDiv, false, false);
                         }
                    }
                }

            }
            //this._setAllDayDnDSize(data, i, allDayDiv);
            this._highlightAllDayDiv(allDayDiv, data.appt, true);
        }

    } else {
        // Non-all day appt - It could be a multi-day non-all-day appt
        var uniqueId = this._getApptUniqueId(data.appt);
        var apptSet = this._apptSets[uniqueId];
        if (!apptSet) {
             // Non-multiday, Non-all-day
            var apptDay = this._getDayForAppt(data.appt);
            apptSet = this._createApptSet(data.appt, uniqueId, apptDay);
            apptSet.appts.push(data.appt);
        }
        data.trEl = [];
        data.tableEl = [];
        for (var iAppt = 0; iAppt < apptSet.appts.length; iAppt++) {
            var appt = apptSet.appts[iAppt];
            var trId = this._getItemId(appt);
            var trEl = document.getElementById(trId);
            if (trEl == null) {
                // Offscreen ,create a tr for DnD
                trEl = document.createElement("tr");
                trEl.className = "calendar_month_day_item_row_selected";
                this._createItemHtmlContents(appt, trEl);
                this.associateItemWithElement(appt, trEl, ZmCalBaseView.TYPE_APPT);
            }
            data.tableEl[iAppt] = Dwt.getDescendant(trEl, this._getItemId(appt) + "_tableBody");
            data.trEl.push(trEl);
            data.timeOffset.push(this._getTimeOffset(appt.getStartTime()));
        }
        this._calculateWeekY(data);
        data.apptDiv = {};
    }

	data.dndStarted = true;
	return true;
};

ZmCalMonthView.prototype._clearIcon =
function(allDayDivId, iconName) {
    var td = document.getElementById(allDayDivId + "_" + iconName);
    if (td) {
        td.innerHTML = "";
    }
}


ZmCalMonthView.prototype._highlightAllDayDiv =
function(allDayDiv, appt, highlight) {
    var apptBodyDiv = document.getElementById(allDayDiv.id + ZmCalMonthView.ALL_DAY_DIV_BODY);
    var tableEl = document.getElementById(this._getItemId(appt) + "_tableBody");
    // Not altering opacity - it was setting it to 0.7 for DnD, but the base opacity for all day is 0.4
    if (highlight) {
        Dwt.addClass(apptBodyDiv, DwtCssStyle.DROPPABLE);
        Dwt.setZIndex(allDayDiv, "1000000000");
    } else {
        Dwt.delClass(apptBodyDiv, DwtCssStyle.DROPPABLE);
        Dwt.setZIndex(allDayDiv, "");
    }
}

ZmCalMonthView.prototype._setAllDayDnDSize =
function(allDayDiv, first, last) {
    var width = this._calculateAllDayWidth(this.dayWidth, first, last);
    this._setAllDayDivSize(allDayDiv, width);
}

ZmCalMonthView.prototype._getAllDayDiv =
function(appt, iSlice) {
    var divKey = appt.invId + "_" + iSlice.toString();
    var allDayDivId = this._apptAllDayDiv[divKey];
    return document.getElementById(allDayDivId);

}


// Generate a dayIndex that may be < 0 or > (number of days-1), using this._days[0] as
// the 0 reference
ZmCalMonthView.prototype._createDayIndexFromDate =
function(dayDate) {
    // Bug 68507: all-day appointments don't appear correctly in month view
    // Round it.  If the dayDate is has a daylight savings time transition between itself
    // and the current day, the day index may be off by +/- 1/24.  The DayIndex needs
    // to be an integer value, otherwise we get incorrect dayOfWeek values (dayIndex % 7)
    return Math.round((dayDate.getTime() -
        this._days[0].date.getTime())/AjxDateUtil.MSEC_PER_DAY);
}


// Calculate the y position of each week
ZmCalMonthView.prototype._calculateWeekY =
function(data) {
	data.weekY = [];
	var y = 0;
	for (var iWeek=0; iWeek < 6; iWeek++)  {
		data.weekY[iWeek] = y;
		var size = Dwt.getSize(document.getElementById( this._days[7*iWeek].tdId));
		y += size.y;
	}
    data.weekY[6] = y;
}

ZmCalMonthView.prototype._calculateOffsetY =
function(data, allDayDiv, week) {
    // Record the y offset within the start cell for a particular week
    if (!data.weekY) {
        this._calculateWeekY(data);
    }
    if (data.offsetY[week] === undefined) {
        var allDayDivPt = Dwt.getLocation(allDayDiv);
        data.offsetY[week] = (allDayDivPt.y - data.weekY[week]);
    }
}

ZmCalMonthView.prototype._getTimeOffset =
function(time) {
    var date = new Date(time);
    date.setHours(0,0,0,0);
    return time - date.getTime();
}


ZmCalMonthView.prototype._snapXYToDate =
function(x, y) {
    var colIndex = Math.floor(x/this._colWidth);
    var rowIndex = 5;

    // Recheck the row heights each time - these can change as an DnD element
    // moves and out, potentially expanding or contracting a cell
    var height = 0;
    for (var iRow=0; iRow < 6; iRow++) {
        var row = document.getElementById(this._rowIds[iRow]);
        var rowSize = Dwt.getSize(row);
        height += rowSize.y;
        if (y < height) {
            rowIndex = iRow;
            break;
        }
    }
    // containerRect should aways have constrained this to be 0 <= index < numDays
    var dayIndex = this._calcDayIndex(rowIndex, colIndex);
    var dayOffset = 0;
    if (dayIndex < 0) {
        dayOffset = -dayIndex;
        dayIndex = 0;
    } else if (dayIndex >= this.numDays) {
        dayOffset = dayIndex - this.numDays + 1;
        dayIndex = this.numDays - 1;
    }
    var day = this._days[dayIndex];
    var dayDate = new Date(this._days[dayIndex].date.getTime());
    // Set to zero hours/min/sec/msec - the last day has a time set to 23:59:59:999
    dayDate.setHours(0,0,0,0);

    var snapDate = null;
    if(day && dayDate) {
         snapDate = new Date(dayDate.getTime() + (AjxDateUtil.MSEC_PER_DAY * dayOffset));
    }
    DBG.println(AjxDebug.DBG3,"mouseMove colIndex: " + colIndex + ", rowIndex: " + rowIndex + ", dayIndex: " + dayIndex + ", snapDate: " + snapDate);

    return {date:snapDate, dayIndex:dayIndex};
}


ZmCalMonthView.prototype._clearSnap =
function(snap) {
    snap.dayIndex = ZmCalMonthView.OUT_OF_BOUNDS_SNAP;
}


ZmCalMonthView.prototype._doApptMove =
function(data, deltaX, deltaY) {
    var x = data.docX - data.originX + deltaX;
    var y = data.docY - data.originY + deltaY;
    //DBG.println(AjxDebug.DBG3,"_doApptMove docY: " + data.docY + ",  originY: " + data.originY + ",  deltaY: " + deltaY + ",  y: " + y);
    var snap = this._snapXYToDate(x, y);
    if ((snap != null) && (snap.dayIndex != data.snap.dayIndex)) {
        DBG.println(AjxDebug.DBG3,"mouseMove new snap: " + snap.date + " (" + snap.dayIndex + ")   data snap: " +
                     data.snap.date+ " (" + data.snap.dayIndex + ")");

        if (data.appt.isAllDayEvent()) {
            // Map the dayIndex to the start of the (potentially) multi-day appt
            this._moveAllDayAppt(data, snap.dayIndex- data.offsetDayIndex);
        } else {
            this._moveApptRow(data, snap.dayIndex);
        }
        data.startDate = new Date(snap.date.getTime() + data.startDateOffset + data.timeOffset[0]);
        data.snap = snap;
    }

}

ZmCalMonthView.prototype._moveAllDayAppt =
function(data, newDayIndex) {
    var currentWeek = -1;
    var firstDow = this.firstDayOfWeek();
    for (var i = 0; i < data.numDays; i++) {
        var iDay = newDayIndex + i;
        var allDayDiv = this._getAllDayDiv(data.appt, i);
        if ((iDay < 0) || (iDay >= this.numDays)) {
            Dwt.setVisible(allDayDiv, false);
        } else {
            var dow = (newDayIndex + i) % 7;
            var first = (i== 0) || (firstDow == dow);
            var last  = ((i == (data.numDays-1) || (iDay == (this.numDays-1)) || (dow == (firstDow + 6))));
            var apptX = this._calculateAllDayX(dow, first);
            var day = this._days[iDay];
            var apptY = 0;
            Dwt.setVisible(allDayDiv, true);
            this._setAllDayDnDSize(allDayDiv, first, last);
            var size = Dwt.getSize(allDayDiv);
            var halfHeight = size.y/2;
            if (data.offsetY[day.week] !== undefined) {
                apptY = data.weekY[day.week] + data.offsetY[day.week];
            } else {
                apptY = (data.weekY[day.week] + data.weekY[day.week + 1])/2 - halfHeight;
            }
            Dwt.setLocation(allDayDiv, apptX, apptY);
        }
    }
}


// Move a non-all-day appt
ZmCalMonthView.prototype._moveApptRow =
function(data, newDayIndex) {
    newDayIndex = newDayIndex - data.offsetDayIndex;
    var allDayParent = null;
    for (var i = 0; i < data.trEl.length; i++) {
        var day = this._days[newDayIndex + i];
        if (day) {
            if (!data.apptDiv[i]) {
                // TR -> TD -> TemplateApptDiv.
                var td =  data.trEl[i].firstChild;
                var templateApptDiv = td.firstChild;
                td.saveHTML = td.innerHTML;
                // Replace the templateApptDiv with filler content
                td.removeChild(templateApptDiv);
                // Create a spacer row - changes in height invalidates the all day div positioning
                this._createAllDayFillerContent(data.trEl[i], false);
                if (!allDayParent) {
                    allDayParent = document.getElementById( this._daysId);
                }
                data.apptDiv[i] = this._createDnDApptDiv(data, i, allDayParent, templateApptDiv);
            }
            Dwt.setVisible(data.apptDiv[i], true);
            var apptTable = data.apptDiv[i].firstChild;
            var apptSize = Dwt.getSize(apptTable);
            var apptX = (this.dayWidth * day.dow) + this.dayWidth/2 - apptSize.x/2;
            var apptY = (data.weekY[day.week] + data.weekY[day.week + 1])/2 - apptSize.y/2;
            Dwt.setLocation(data.apptDiv[i], apptX, apptY);

        }  else if (data.apptDiv[i]) {
            Dwt.setVisible(data.apptDiv[i], false);
        }
    }
}

ZmCalMonthView.prototype._createDnDApptDiv =
function(data, iAppt, allDayParent, templateApptDiv) {
    var div = document.createElement("div");
    var subs = { apptSlice:iAppt};
    div.style.position = "absolute";
    // Attach month appt to DnD proxy div
    div.appendChild(templateApptDiv);

    var trSize  = Dwt.getSize(data.trEl[iAppt]);
    Dwt.setSize(div, trSize.x, Dwt.CLEAR);
    Dwt.setZIndex(div, '100000000');
    allDayParent.appendChild(div);

    // Set the opacity on the table that has the gradient coloring; Needed for IE
    Dwt.setOpacity(data.tableEl[iAppt], ZmCalColView._OPACITY_APPT_DND);
    Dwt.addClass(div, DwtCssStyle.DROPPABLE);

    return div;
}


ZmCalMonthView.prototype._reattachApptDnDHtml =
function(data, startIndex, deselect) {
     for (var i = 0; i < data.trEl.length; i++) {
         var day = this._days[startIndex + i];
         if (data.apptDiv[i]) {
             // Detach the Appt DnD Proxy Div from the allDayParent
             data.apptDiv[i].parentNode.removeChild(data.apptDiv[i]);
         }

         if (day && data.trEl[i]) {
             // TD that originally contained the appt
             var td = data.trEl[i].firstChild;
             if (td.saveHTML) {
                 if (startIndex == data.startDayIndex) {
                     // Remove the filler
                     td.removeChild(td.firstChild);
                 } else {
                     // Dropped in a new cell - find the correct position within the appts of the current day
                     var tBody = document.getElementById(day.dayId);
                     var insertIndex = 0;
                     for (insertIndex = 0; insertIndex < tBody.childNodes.length; insertIndex++) {
                         var targetTR = tBody.childNodes[insertIndex];
                         if ((targetTR.apptStartTimeOffset !== undefined) && (targetTR.apptStartTimeOffset > data.timeOffset[i])) {
                              break;
                        }
                     }
                     // Remove the original TR from its day div
                     if (data.trEl[i].parentNode) {
                         data.trEl[i].parentNode.removeChild(data.trEl[i]);
                     }
                     data.trEl[i].removeChild(td);

                     // Create a new TR in the new day div
                     var tr = tBody.insertRow(insertIndex);
                     tr.appendChild(td);
                     tr.id = data.trEl[i].id;
                     tr.className = data.trEl[i].className;
                 }
                 // Set the td with the original appt content.  Do via innerHTML since IE
                 // does not handle the gradient coloring properly if the appt's div is simply moved
                 td.innerHTML = td.saveHTML;
                 // Hack for IE - it doesn't display the tag and peel unless you  alter a containing className.
                 // The month template div does not have any classNames, so this is safe.
                 td.firstChild.className = "";
             }
         }
     }
     data.apptDiv = {};
}

ZmCalMonthView.prototype._removeDnDApptDiv =
function(data) {
    if (data.apptDiv) {
        for (var iAppt in data.apptDiv) {
            data.apptDiv[iAppt].parentNode.removeChild(data.apptDiv[iAppt]);
        }
        data.apptDiv = null;
    }
}

ZmCalMonthView.prototype._restoreApptLoc =
function(data) {
    if (data.appt.isAllDayEvent()) {
        this._moveAllDayAppt(data, data.startDayIndex);
    } else {
        this._reattachApptDnDHtml(data, data.startDayIndex, false);
    }
    data.snap.dayIndex = data.startDayIndex;
};

ZmCalMonthView.prototype._deselectDnDHighlight =
function(data) {
    if (data.appt.isAllDayEvent()) {
        for (var i = 0; i < data.numDays; i++) {
            var allDayDiv = this._getAllDayDiv(data.appt, i);
            if (allDayDiv) {
                this._highlightAllDayDiv(allDayDiv, data.appt, false);
            }
        }
    } else {
        if (data.snap.dayIndex == ZmCalMonthView.OUT_OF_BOUNDS_SNAP) {
            for (var i = 0; i < data.trEl.length; i++) {
                var day = this._days[data.startDayIndex + i];
                if (day) {
                    var td = data.trEl[i].firstChild;
                    // Set the opacity on the table containing the gradient coloring; needed for IE
                    ZmCalBaseView._setApptOpacity(data.appt, data.tableEl[i]);
                }
            }
        } else {
            this._reattachApptDnDHtml(data, data.snap.dayIndex - data.offsetDayIndex, true);
        }
    }
};

ZmCalMonthView.prototype._restoreAppt =
function(data) {
   if (data.appt.isAllDayEvent()) {
        for (var i = 0; i < data.numDays; i++) {
            var allDayDiv = this._getAllDayDiv(data.appt, i);
            if (allDayDiv.saveHtml !== undefined) {
                allDayDiv.innerHTML = allDayDiv.saveHtml;
                allDayDiv.saveHtml = undefined;
            }
        }
    }
};

ZmCalMonthView.prototype._handleApptScrollRegion =
function(docX, docY, incr, data) {
	var offset = 0;
    var div = document.getElementById(this._daysId);
    var fullDiv = document.getElementById(this._bodyId);
    var originPt = Dwt.getLocation(div);
    var size = Dwt.getSize(div);
    var he = document.getElementById(this._headerId);
    var headingHeight = Dwt.getSize(he).y;
    var headingBaseY  = Dwt.getLocation(he).y;

    DBG.println(AjxDebug.DBG3,"_handleApptScrollRegion mouseY: " + docY + "    headingHeight:" + headingHeight +
        "    headingBaseY: " + headingBaseY +  "    sizeY:" + size.y);

	var upper = docY < headingBaseY + headingHeight + 4;;
	var lower = docY > originPt.y + size.y - 8; // - 8;

	if (upper || lower) {
		var sTop = div.scrollTop;
		if (upper && sTop > 0) {
            DBG.println(AjxDebug.DBG3,"_handleApptScrollRegion sTop: " + sTop);
			offset = -(sTop > incr ? incr : sTop);
		} else if (lower) {
            var fullSize = Dwt.getSize(fullDiv);
            var sVisibleTop = fullSize.y - size.y;
            DBG.println(AjxDebug.DBG3,"_handleApptScrollRegion sTop: " + sTop + ", sVisibleTop: " + sVisibleTop);
			if (sTop < sVisibleTop) {
				var spaceLeft = sVisibleTop - sTop;
				offset = spaceLeft  > incr ?incr : spaceLeft;
                DBG.println(AjxDebug.DBG3,"_handleApptScrollRegion spaceLeft: " + spaceLeft);
			}
		}
		if (offset != 0) {
			div.scrollTop += offset;
            DBG.println(AjxDebug.DBG3,"_handleApptScrollRegion offset: " + offset);
            this._containerRect.set(this._containerRect.x, this._containerRect.y - offset);
            data.originY -= offset;
            //DBG.println(AjxDebug.DBG3,"_handleApptScrollRegion new containerRect.y = " + this._containerRect.y + ",   originY = " + data.originY);
		}

	}
	return offset;
};

