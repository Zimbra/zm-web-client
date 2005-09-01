/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmCalDayView(parent, posStyle, dropTgt, view, numDays) {
	if (arguments.length == 0) return;
	if (numDays == null) numDays = 1;
	var className = "calendar_view";
	if (view == null) view = ZmController.CAL_DAY_VIEW;
	this._numDays = numDays;
	ZmCalBaseView.call(this, parent, className, posStyle, view);
	//this.getHtmlElement().style.overflow = "hidden";	
	//this.setScrollStyle(DwtControl.SCROLL);
	this.setScrollStyle(DwtControl.CLIP);	
	this._needFirstLayout = true;
	this._normalClassName = "calendar_grid_body_cell";
	this._selectedClassName = this._normalClassName+"-selected";
}

ZmCalDayView.prototype = new ZmCalBaseView;
ZmCalDayView.prototype.constructor = ZmCalDayView;

ZmCalDayView._hoursDivWidth = 40; // width of div holding hours (1:00am, etc)
ZmCalDayView._hoursDivWidth_pad = 5; // space between hours div and appts

ZmCalDayView._allDaySepHeight = 4; // height of separator between all day appts and body
ZmCalDayView._daySepWidth = 1; // width of separator between days

ZmCalDayView._minApptWidth = 20;
ZmCalDayView._scrollBarWidth = 20;

ZmCalDayView._apptXFudge = 0; // due to border stuff
ZmCalDayView._apptYFudge = -1; // ditto
ZmCalDayView._apptWidthFudge = (AjxEnv.isIE ? 0 : -3); // due to border stuff
ZmCalDayView._apptHeightFudge = (AjxEnv.isIE ? 0 : -4); // ditto


ZmCalDayView._hourHeight = 42;
ZmCalDayView._15minuteHeight = 10.5;
ZmCalDayView._dayHeight = 1008; // 24*42

ZmCalDayView._idToView = {}; // used to find a view object given the id for the appts div

ZmCalDayView.prototype.toString = 
function() {
	return "ZmCalDayView";
}

ZmCalDayView.prototype.getRollField =
function(isDouble) {
	switch(this.view) {
		case ZmController.CAL_WORK_WEEK_VIEW:	
		case ZmController.CAL_WEEK_VIEW:
			return isDouble ? AjxDateUtil.MONTH : AjxDateUtil.WEEK;
			break;
		case ZmController.CAL_DAY_VIEW:
		default:
			return isDouble ? AjxDateUtil.WEEK : AjxDateUtil.DAY;
			break;		
	}
}

ZmCalDayView.prototype._updateRange =
function(rangeChanged) {
	this._updateDays();
	this._timeRangeStart = this._days[0].date.getTime();
	this._timeRangeEnd = this._days[this._numDays-1].date.getTime() + AjxDateUtil.MSEC_PER_DAY;
}

ZmCalDayView.prototype._dateUpdate =
function(rangeChanged) {
	this._clearSelectedTime();
	this._updateSelectedTime();
}

ZmCalDayView.prototype._preSet = 
function() {
	this._resetAllDayData();
}

ZmCalDayView.prototype._postSet = 
function() {
//DBG.println("_postSet");
	// nuke any previous all day rows
	var table = Dwt.getDomObj(this.getDocument(), this._headerTableId);
	while (table.rows.length > 1)
		table.deleteRow(1);
	
	this._computeApptLayout();
	this._computeAllDayApptLayout();
	if (!this._needFirstLayout)
		this._layoutAppts();
	this._layout();
	ZmCalDayView._scrollTo8AM([this]);
}

ZmCalDayView._scrollTo8AM =
function(args)
{
	var view = args[0];
	var bodyElement = Dwt.getDomObj(view.getDocument(), view._bodyDivId);
	bodyElement.scrollTop = ZmCalDayView._hourHeight*8 - 10;
}

ZmCalDayView.prototype._updateTitle =
function() 
{
	if (this._numDays == 1) {
		var date = this._date;	
		this._title = DwtMsg.LONG_MONTH[date.getMonth()] + " " + date.getDate(); // + ", " + date.getFullYear();
	} else {
		var first = this._days[0].date;
		var last = this._days[this._numDays-1].date;
		this._title = DwtMsg.LONG_MONTH[first.getMonth()]+" "+first.getDate()+" - " +
				 DwtMsg.LONG_MONTH[last.getMonth()]+" "+last.getDate(); //+", "+last.getFullYear();
	}				 
}

ZmCalDayView.prototype._dayTitle =
function(date) {
	var title = (this._numDays == 1) ?
		DwtMsg.LONG_WEEKDAY[date.getDay()]+", "+DwtMsg.LONG_MONTH[date.getMonth()]+" "+date.getDate() :
		DwtMsg.MEDIUM_WEEKDAY[date.getDay()]+", "+DwtMsg.MEDIUM_MONTH[date.getMonth()]+" "+date.getDate();
	return AjxStringUtil.htmlEncode(title);
}

ZmCalDayView.prototype._updateDays =
function() {
	var d = new Date(this._date.getTime());
	d.setHours(0,0,0,0);	
	var dow;

	var now = new Date();
	now.setHours(0, 0, 0, 0);
			
	switch(this.view) {
		case ZmController.CAL_WORK_WEEK_VIEW:	
			dow = d.getDay();
			if (dow == 0)
				d.setDate(d.getDate()+1);
			else if (dow != 1)
				d.setDate(d.getDate()-(dow-1));
			break;				
		case ZmController.CAL_WEEK_VIEW:
			dow = d.getDay();
			if (dow != 0)
				d.setDate(d.getDate()-dow);
			break;
		case ZmController.CAL_DAY_VIEW:
		default:
			/* nothing */
			break;		
	}

	var doc = this.getDocument();
	
	this._dateToDayIndex = new Object();
	
	var lastDay = this._numDays - 1;
	for (var i=0; i < this._numDays; i++) {
		var day = this._days[i];
		day.lastDay = (i == lastDay);
		day.date = new Date(d);
		day.endDate = new Date(d);
		day.endDate.setHours(23,59,59,999);
		this._dateToDayIndex[this._dayKey(day.date)] = day;

 		var te = Dwt.getDomObj(doc, day.titleId);
		te.innerHTML = this._dayTitle(d);

 		//var ttd = Dwt.getDomObj(doc, day.titleTdId);
		//ttd.className = d.getTime() == now.getTime() ? "calendar_header_cells_td_today" : "calendar_header_cells_td";
		
//		var btd = Dwt.getDomObj(doc, day.bodyTdId);
//		btd.className = d.getTime() == now.getTime() ? "calendar_cells_td_today" : "calendar_cells_td";
		
		d.setDate(d.getDate()+1);
		
		
	}
	
	var te = Dwt.getDomObj(doc, this._headerYearId);
	te.innerHTML = this._days[0].date.getFullYear();
	
}

ZmCalDayView.prototype._resetAllDayData =
function() {
	this._allDayAppts = {};
	this._allDayApptsList = [];
	this._allDayApptsRowLayouts = [];
	// this controls number of initial all day appt rows added
	this._addAllDayApptRowLayout();
}

/**
 * we don't want allday appts that span days to be fanned out
 */
ZmCalDayView.prototype._fanoutAllDay =
function(appt) {
	return false;
}

/*
 * keep track of the all day appts
 *
 */
ZmCalDayView.prototype._addAllDayAppt = 
function(ao, now) {
	var id = ao.getUniqueId();
	var isStartInView = this.isStartInView(ao);
	var isEndInView = this.isEndInView(ao);
	var startTime = Math.max(ao.getStartTime(), this._timeRangeStart);
	var endTime = Math.min(ao.getEndTime(), this._timeRangeEnd);
	var numDays = Math.floor((endTime-startTime)/AjxDateUtil.MSEC_PER_DAY);
	this._allDayAppts[id] = {
		appt: ao,
		startTime: startTime,
		isStartInView: isStartInView,
		isEndInView: isEndInView,
		numDays: numDays
	};

	// call _createAllDayItemHtml after setting the _allDayAppts data, since _createAllDayItemHtml needs it
	this._allDayAppts[id].div =  this._createAllDayItemHtml(ao, now, false);
	
	this._allDayApptsList.push(ao);	
}

ZmCalDayView.prototype.addAppt = 
function(ao, now) {
	if (ao.isAllDayEvent()) {
		this._addAllDayAppt(ao, now);
	} else {
		var item = this._createItemHtml(ao, now);
		var div = this._getDivForAppt(ao);
		if (div) div.appendChild(item);
	}
}

ZmCalDayView.prototype._getDivForAppt =
function(appt) {
	return Dwt.getDomObj(this.getDocument(), this._apptBodyDivId);
}

// move this to Dwt?
ZmCalDayView._setOpacity =
function(el, opacity) {
	if (AjxEnv.isIE) el.style.filter = "alpha(opacity="+opacity+")";
	else el.style.opacity = opacity/100;
}

ZmCalDayView._setApptOpacity =
function(appt, div) {
	var pstatus = appt.getParticipationStatus();
	if (pstatus == ZmAppt.PSTATUS_DECLINED) {
		ZmCalDayView._setOpacity(div, 20);
	} else if (pstatus == ZmAppt.PSTATUS_TENTATIVE) {
		ZmCalDayView._setOpacity(div, 60);
	} else {
		ZmCalDayView._setOpacity(div, 100);	
	}
}

ZmCalDayView.prototype._createItemHtml =
function(appt, now, isDndIcon) {
	//DBG.println("---- createItem ---- "+appt);
	if (appt.isAllDayEvent()) {
		return this._createAllDayItemHtml(appt, now, isDndIcon);
	}
	
	// set up DIV
	var div = this.getDocument().createElement("div");	

	div.style.position = 'absolute';
	Dwt.setSize(div, 10, 10);
	div._styleClass = "appt";	
	div._selectedStyleClass = div._styleClass + '-' + DwtCssStyle.SELECTED;
	div.className = div._styleClass;

	ZmCalDayView._setApptOpacity(appt, div);

	this.associateItemWithElement(appt, div, ZmCalBaseView.TYPE_APPT);
	appt.__view = this;

	var html = new Array(30);
	var idx = 0;

	var titleOnly = (appt.getDuration() <= 30*60*1000);

	var pstatus = appt.getParticipationStatus();
	var isNew = pstatus == ZmAppt.PSTATUS_NEEDS_ACTION;
	var isAccepted = pstatus == ZmAppt.PSTATUS_ACCEPT;
	var id = this._getItemId(appt);
	var subs = {
		id: id,
		newState: isNew ? "_new" : "",
		color: "_blue",
		name: AjxStringUtil.htmlEncode(appt.getName()),
//		tag: isNew ? "NEW" : "",		//  HACK: i18n
		starttime: appt.getDurationText(true, true),
		endtime: ZmAppt._getTTHour(appt.getEndDate()),
		location: AjxStringUtil.htmlEncode(appt.getLocation()),
		statusKey: appt.getParticipationStatus(),
		status: appt.isOrganizer() ? "" : appt.getParticipationStatusString()
	};	

	div.innerHTML = DwtBorder.getBorderHtml(titleOnly ? "calendar_appt_30" : "calendar_appt", subs, null);

	// if (we can edit this appt) then create sash....
	if (!appt.isReadOnly()) {
		var sash = this.getDocument().createElement("div");
		sash.id = id+"_sash";
		sash.className = 'appt_sash';
		sash.style.cursor = AjxEnv.isIE ? "row-resize" : "n-resize";
		sash._type = ZmCalBaseView.TYPE_APPT_BOTTOM_SASH;
		div.appendChild(sash);
	}

	return div;
}

ZmCalDayView.prototype._createAllDayItemHtml =
function(appt, now, isDndIcon) {

	var data = this._allDayAppts[appt.getUniqueId()];

	var isStartInView = data ? data.isStartInView : true;
	var isEndInView = data ? data.isEndInView : true;	

	var div = this.getDocument().createElement("div");

	div._styleClass = "allday";
	div._selectedStyleClass = div._styleClass + '-' + DwtCssStyle.SELECTED;
	div.className = div._styleClass;

	this.associateItemWithElement(appt, div, ZmCalBaseView.TYPE_APPT);
	
	var html = new Array(10);
	var idx = 0;

	html[idx++] = "<table class=allday>";
	html[idx++] = "<tr>";
	if (isStartInView)
		html[idx++] = "<td><div class=allday_blue_start></div></td>";
	html[idx++] = "<td width=100%>";
	html[idx++] = "<div class=allday_blue_stretch><div class=allday_text>";
	html[idx++] = AjxStringUtil.htmlEncode(appt.getName());
	html[idx++] = "</div></div>";
	html[idx++] = "</td>";
	if (isEndInView)
		html[idx++] = "<td><div class=allday_blue_end></div></td>";
	html[idx++] = "</tr>";
	html[idx++] = "</table>";
	div.innerHTML = html.join("");
	return div;
}

ZmCalDayView.prototype._getDayForDate =
function(d) 
{
	return this._dateToDayIndex[this._dayKey(d)];
}	

ZmCalDayView.prototype._clearSelectedTime =
function() 
{
	var e = Dwt.getDomObj(this.getDocument(), this._timeSelectionDivId);
	if (e) Dwt.setVisible(e, false);
}
	

ZmCalDayView.prototype._updateSelectedTime =
function() 
{
//	return;
	var t = this._date.getTime();
	if (t < this._timeRangeStart || t >= this._timeRangeEnd)
		return;

	var e = Dwt.getDomObj(this.getDocument(), this._timeSelectionDivId);
	if (!e) return;
	e._type = ZmCalBaseView.TYPE_SELECTED_TIME;

	var bounds = this._getBoundsForDate(this._date, 60);
	if (bounds == null) return;
	var snap = this._snapXY(bounds.x, bounds.y, 30);

	Dwt.setLocation(e, snap.x, snap.y);
	Dwt.setSize(e, bounds.width, bounds.height);
	ZmCalDayView._setOpacity(e, 40);
	Dwt.setVisible(e, true);
 	/*
 	var m = this._date.getMinutes(); 	
	if (m != 0 && m != 30) {
		var temp = new Date(this._date.getTime());
		temp.setMinutes( m < 30 ? 0 : 30);
		e.innerHTML = ZmAppt._getTTHour(temp);
	} else {
		e.innerHTML = ZmAppt._getTTHour(this._date);
	}
	*/

}

ZmCalDayView.prototype._createHeadersColGroupHtml =
function(html,idx) {
	html[idx++] = "<colgroup>";
	html[idx++] = "<col id='"+this._headerHourColId+"'>";
	for (var i =0; i < this._numDays; i++) {
		html[idx++] = "<col id='"+this._days[i].headerColId+"'>";
	}
	html[idx++] =	"<col id='"+this._headerGutterColId+"'>"; // gutter
	html[idx++] = "</colgroup>";
	return idx;
}

ZmCalDayView.prototype._createHeadersHtml =
function(html,idx) {
	html[idx++] = "<td class=calendar_header_time_td><div id='"+this._headerYearId+"' class=calendar_header_time_text></div></td>";
	for (var i =0; i < this._numDays; i++) {
		html[idx++] = "<td class=calendar_header_cells_td id='"+this._days[i].titleTdId+"'><div id='"+this._days[i].titleId+"' class=calendar_header_cells_text></div></td>";
	}
	html[idx++] = "<td class=calendar_header_cells_td style='border-left:none'><div class=calendar_header_cells_text>&nbsp;</div></td>";
	return idx;	
}

ZmCalDayView.prototype._createHoursHtml =
function(html,idx) {
	html[idx++] = "<div style='position:absolute; width:"+ZmCalDayView._hoursDivWidth+"px;' id='"+this._bodyHourDivId+"'>";
	html[idx++] = "<table class=calendar_grid_day_table>";
	for (var h=0; h < 24; h++) {
		var hour = (h==0 || h == 12) ? 12 : h % 12;
		var ampm = (h < 12) ? "am" : "pm";
		html[idx++] = "<tr><td class=calendar_grid_body_time_td><div class=calendar_grid_body_time_text>";
		if (h == 0) {
			html[idx++] = "&nbsp;";
		} else if (h == 12) {
			html[idx++] = "Noon";		//XXX i18n		
		} else {
			html[idx++] = hour;
			html[idx++] = " ";
			html[idx++] = ampm;		
		}
		html[idx++] = "</div></td></tr>";	
	}
	html[idx++] = "</table>";
	html[idx++] = "</div>";	
	return idx;
}

ZmCalDayView.prototype._createHtml =
function(abook) {
	this._days = new Object();
	this._hours = new Object();

	this._layouts = new Array();
	this._allDayAppts = new Array();

	var idx = 0;
	var html = new Array(50);

	this._headerYearId = Dwt.getNextId();
	this._headerDivId = Dwt.getNextId();
	this._headerTableId = Dwt.getNextId();
	this._headerHourColId = Dwt.getNextId();
	this._headerGutterColId = Dwt.getNextId();
	this._bodyHourColId = Dwt.getNextId();
	this._bodyHourDivId = Dwt.getNextId();
	this._alldaySepDivId = Dwt.getNextId();
	this._bodyDivId = Dwt.getNextId();
	this._apptBodyDivId = Dwt.getNextId();
	this._timeSelectionDivId = Dwt.getNextId();

	this._allDayRows = new Array();
		
	for (var i =0; i < this._numDays; i++) {
		this._days[i] = {
			index: i,
			titleTdId: Dwt.getNextId(),
			titleId: Dwt.getNextId(),
			headerColId: Dwt.getNextId(),
			bodyDivId: Dwt.getNextId(),
			bodyTdId: Dwt.getNextId(),
			daySepDivId: Dwt.getNextId(),
			apptX: 0, // computed in layout
			apptWidth: 0// computed in layout
		};
	}

	html[idx++] = "<div id='"+this._headerDivId+"'>";
	html[idx++] =  "<table id='"+this._headerTableId+"' class=calendar_grid_table>";
	idx = this._createHeadersColGroupHtml(html, idx);
	html[idx++] =   "<tr>";
	idx = this._createHeadersHtml(html, idx);
	html[idx++] =   "</tr>";
	html[idx++] =   "</table>";
	html[idx++] =  "</div>";
	html[idx++] = "<div id='"+this._alldaySepDivId+"' class=calendar_header_allday_separator style='overflow:hidden;'></div>";
	html[idx++] =  "<div id='"+this._bodyDivId+"' class=calendar_body style='overflow-x:hidden; overflow:-moz-scrollbars-vertical;'>";
	idx = this._createHoursHtml(html, idx);
	html[idx++] =  "<div id='"+this._apptBodyDivId+"' class='ImgCalendarDayGrid_BG' style='width:100%; height:1008px; position:absolute;'>";	
	html[idx++] =  "<div id='"+this._timeSelectionDivId+"' class='calendar_time_selection' style='position:absolute; display:none;'></div>";
	for (var i =0; i < this._numDays; i++) {
		html[idx++] =  "<div id='"+this._days[i].daySepDivId+"' class='calendar_day_separator' style='position:absolute'></div>";
	}		
	html[idx++] = "</div>";
	html[idx++] = "</div>";
	
	html.length = idx;

	this.getHtmlElement().innerHTML = html.join("");
	
	Dwt.getDomObj(this.getDocument(), this._apptBodyDivId)._type = ZmCalBaseView.TYPE_APPTS_DAYGRID;

	ZmCalDayView._idToView[this._bodyDivId] = this;
	
	ZmCalDayView._scrollTo8AM([this]);
}

ZmCalDayView.prototype._computeMaxCols =
function(layout, max) {
	//DBG.println("compute max cols for "+layout.appt.id+" col="+layout.col);
	layout.maxcol = Math.max(layout.col, layout.maxcol, max);
	for (var r in layout.right) {
		var m = this._computeMaxCols(layout.right[r], layout.maxcol);
		layout.maxcol = Math.max(layout.col, m);
	}
	//DBG.println("max cols for "+layout.appt.id+" was: "+layout.maxcol);	
	return layout.maxcol;	
}

/*
 * compute appt layout for appts that aren't all day
 */
ZmCalDayView.prototype._computeApptLayout =
function() {
//	DBG.println("_computeApptLayout");
	var layouts = this._layouts = new Array();
	var list = this.getList();
	if (!list) return;
	
	var size = list.size();
	if (size == 0) return;

	for (var i=0; i < size; i++) {
		var ao = list.get(i);

		if (ao.isAllDayEvent()) {
			continue;
		}

		var st = ao.getStartTime();
		var et = ao.getEndTime();		
		var newLayout = { appt: ao, col: 0, maxcol: -1, left: [], right: [] };
		// look for overlapping appts
		var overlap = [];
		var overlappingCol = [];
		for (var j=0; j < layouts.length; j++) {
			var layout = layouts[j];
			if (ao.isOverlapping(layout.appt)) {
				overlap.push(layout);
				overlappingCol[layout.col] = true;
				// while we overlap, update our col
				while (overlappingCol[newLayout.col]) {
					newLayout.col++;
				}
			}
		}

		// figure out who is left and who is right
		for (var c in overlap) {
			var l = overlap[c];
			if (newLayout.col < l.col) {
				newLayout.right.push(l);
				l.left.push(newLayout);
			} else {
				newLayout.left.push(l);
				l.right.push(newLayout);
			}
		}
		layouts.push(newLayout);
	}
	
	// compute maxcols
	for (var i=0; i < layouts.length; i++) {
		this._computeMaxCols(layouts[i], -1);
	}
	
	/*
	for (var i=0; i < layouts.length; i++) {
		DBG.println("----- layout "+i);
		DBG.dumpObj(layouts[i]);
	}
	*/
}

/*
 * add a new all day appt row layout slot and return it
 */
ZmCalDayView.prototype._addAllDayApptRowLayout =
function() {
	var data = [];
	for (var i=0; i < this._numDays; i++) {
		// free is set to true if slot is available, false otherwise
		// appt is set to the _allDayAppts data in the first slot only (if appt spans days)
		data[i] = { free: true, data: null };
	}
	this._allDayApptsRowLayouts.push(data);
	return data;
}

/**
 * take the appt data in reserve the slots
 */
ZmCalDayView.prototype._fillAllDaySlot = 
function(row, dayIndex, data) {
	for (var j=0; j < data.numDays; j++) {
		row[dayIndex+j].data = j==0 ? data : null;
		row[dayIndex+j].free = false;
	}
}

/**
 * find a slot and fill it in, adding new rows if needed
 */
ZmCalDayView.prototype._findAllDaySlot = 
function(dayIndex, data) {
	var rows = this._allDayApptsRowLayouts;
	var row = null;
	for (var i=0; i < rows.length; i++) {
		row = rows[i];
		for (var j=0; j < data.numDays; j++) {
			if (!row[dayIndex+j].free) {
				row = null;
				break;
			}
		}
		if (row != null)	break;
	}
	if (row == null)
		row = this._addAllDayApptRowLayout();

	this._fillAllDaySlot(row, dayIndex, data);	
}

/*
 * compute layout info for all day appts
 */
ZmCalDayView.prototype._computeAllDayApptLayout =
function() {
	var adlist = this._allDayApptsList;
	adlist.sort(ZmAppt.compareByTimeAndDuration);
	
	for (var i=0; i < adlist.length; i++) {
		var appt = adlist[i];
		var data = this._allDayAppts[appt.getUniqueId()];
		if (data) {
			var day = this._getDayForDate(new Date(data.startTime));
			if (day) {
				this._findAllDaySlot(day.index, data);
				/*
				DBG.println("day index = "+day.index);
				DBG.println("colspan = "+data.numDays);
				DBG.println("includesFirst = "+data.isStartInView);
				DBG.println("includesLast = "+data.isEndInView);
				*/
			}
		}
	}
	this._layoutAllDayAppts();
}

ZmCalDayView.prototype._layoutAllDayAppts =
function() {
	var rows = this._allDayApptsRowLayouts;

	var table = Dwt.getDomObj(this.getDocument(), this._headerTableId);
	
	for (var i=0; i < rows.length; i++) {
		var row = rows[i];
		// add new row
		var tr = table.insertRow(-1);
		// add blank left cell
		var td = tr.insertCell(-1);
		td.innerHTML = "&nbsp;" // cell under the year
		for (var j=0; j < this._numDays; j++) {
			var slot = row[j];
			if (slot.free) {
				var td = tr.insertCell(-1);
				td.className = "calendar_header_allday_td";				
				td.innerHTML = "&nbsp;"
			} else if (slot.data) {
				var td = tr.insertCell(-1);
				td.className = "calendar_header_allday_td";
				td.colSpan = slot.data.numDays;
				td.appendChild(slot.data.div);
			}
		}
		// add gutter cell
		var td = tr.insertCell(-1);
		td.innerHTML = "&nbsp;" // gutter
	}
}

ZmCalDayView._getApptWidthPercent = 
function(numCols) {
	switch(numCols) {
		case 1: return 1;
		case 2: return 0.8;
		case 3: return 0.6;
		case 4: return 0.4;
		default: return 0.4;
	}
}

ZmCalDayView.prototype._positionAppt =
function(apptDiv, x, y) {
	// position overall div
	Dwt.setLocation(apptDiv, x + ZmCalDayView._apptXFudge, y + ZmCalDayView._apptYFudge);
}

ZmCalDayView.prototype._sizeAppt =
function(apptDiv, w, h) {
	// get the inner div that should be sized and set its width/height
	var apptBodyDiv = Dwt.getDomObj(this.getDocument(), apptDiv.id + "_body");
	Dwt.setSize(	apptBodyDiv,	w + ZmCalDayView._apptWidthFudge, h + ZmCalDayView._apptHeightFudge);

	// set the sash width. sash should really be inside appt_body...
	var apptSashDiv = Dwt.getDomObj(this.getDocument(), apptDiv.id + "_sash");
	if (apptSashDiv) Dwt.setSize(apptSashDiv, w + ZmCalDayView._apptWidthFudge, Dwt.DEFAULT);
}


ZmCalDayView.prototype._layoutAppt =
function(apptDiv, x, y, w, h) {
	this._positionAppt(apptDiv, x, y);
	this._sizeAppt(apptDiv, w, h);
}

ZmCalDayView.prototype._layoutAppts =
function() {

	var doc = this.getDocument();
	
	// for starting x and width	
	var data = this._hours[0];

	var doc = this.getDocument();
	for (var i=0; i < this._layouts.length; i++) {
		var layout = this._layouts[i];

		var ao = layout.appt;
		var apptDiv = Dwt.getDomObj(doc, this._getItemId(ao));
		if (apptDiv) {
			// only need to do this first time through
			var sd = ao.getStartDate();			
			var day = this._getDayForDate(sd);
			if (!layout.h) {
				var et = ao.getEndTime();
				var ed;
				layout.lastDay = day.lastDay;
				if (et >= day.endDate.getTime()) {
					ed = day.endDate;
				} else {
					ed = ao.getEndDate();
				}
				layout.y = this._getYfromDate(sd, true);
				var endY = this._getYfromDate(ed, false);
				//layout.h = Math.max(endY - layout.y, 2*ZmCalDayView._fiftenMinuteHeight) + 1; 
				layout.h = endY - layout.y + 1;
				//DBG.println("---- sd="+sd+" ed="+ed);
				//DBG.println("_layoutAppts: "+apptDiv);
				//DBG.println("_layoutAppts: layout.h="+layout.h+" layout.y="+layout.y+ " endY="+endY);
			}
			var w = Math.floor(day.apptWidth*ZmCalDayView._getApptWidthPercent(layout.maxcol+1));
			var xinc = layout.maxcol ? ((day.apptWidth - w) / layout.maxcol) : 0; // n-1
			var x = xinc * layout.col + (day.apptX);
			
			this._layoutAppt(apptDiv, x, layout.y, w, layout.h);
		}
	}
}

ZmCalDayView.prototype._getDayFromX =
function(x) {
	for (var i =0; i < this._numDays; i++) {
		var day = this._days[i];
		if (x >= day.apptX && x <= day.apptX+day.apptWidth) return day;
	}		
	return null;
}

ZmCalDayView.prototype._getYfromDate =
function(d) {
	var h = d.getHours();
	var m = d.getMinutes();
	return Math.floor((h+m/60) * ZmCalDayView._hourHeight) + 1;
}

ZmCalDayView.prototype._getLocationForDate =
function(d) {
	var h = d.getHours();
	var m = d.getMinutes();
	var day = this._getDayForDate(d);
	if (day == null) return null;
	return new DwtPoint(day.apptX, Math.floor(((h+m/60) * ZmCalDayView._hourHeight))+1);
}

ZmCalDayView.prototype._getBoundsForDate =
function(d, durationMinutes) {
	var h = d.getHours();
	var m = d.getMinutes();
	var day = this._getDayForDate(d);
	if (day == null) return null;
	return new DwtRectangle(day.apptX, ((h+m/60) * ZmCalDayView._hourHeight), 
					day.apptWidth, (ZmCalDayView._hourHeight / 60) * durationMinutes);
}

// snapXY coord to specified minute boundary (15,30)
ZmCalDayView.prototype._snapXY =
function(x, y, snapMinutes) {
	// snap it to grid
	var day = this._getDayFromX(x);
	if (day == null) return null;
	x = day.apptX;
	var height = (snapMinutes/60) * ZmCalMultiDayView._hourHeight;
	y = Math.floor(y/height) * height;
	return {x:x, y:y};	
}

ZmCalDayView.prototype._getDateFromXY =
function(x, y, snapMinutes) {
	var day = this._getDayFromX(x);
	if (day == null) return null;
	var minutes = Math.floor((y / ZmCalDayView._hourHeight) * 60);
	if (snapMinutes != null && snapMinutes > 1)	minutes = Math.floor(minutes/snapMinutes) * snapMinutes;
	return new Date(day.date.getTime() + (minutes * 60 * 1000));
}

ZmCalDayView.prototype._layout =
function() {
	DBG.println("ZmCalDayView in layout!");
	var doc = this.getDocument();

	var sz = this.getSize();
	var width = sz.x;
	var height = sz.y;

	if (width == 0 || height == 0) {
		return;
	}

	this._needFirstLayout = false;

	var doc = this.getDocument();

	var headerElement = Dwt.getDomObj(doc, this._headerDivId);
	var headerSize = Dwt.getSize(headerElement);
	var headerHeight = headerSize.y;
	Dwt.setSize(headerElement, width, Dwt.DEFAULT);

	var headerTableElement = Dwt.getDomObj(doc, this._headerTableId);
	Dwt.setSize(headerTableElement, width, Dwt.DEFAULT);

	var allDayDivElement = Dwt.getDomObj(doc, this._alldaySepDivId);
	Dwt.setSize(allDayDivElement, Dwt.DEFAULT, 5);

	var bodyElement = Dwt.getDomObj(doc, this._bodyDivId);
	var bodyWidth = width;
	
	var bodyY = headerHeight + ZmCalDayView._allDaySepHeight;
	var bodyHeight = height - bodyY;

	Dwt.setSize(bodyElement, bodyWidth, bodyHeight);
	//Dwt.setLocation(bodyElement, 0, bodyY);
	//Dwt.setSize(bodyElement, Dwt.DEFAULT, height - headerHeight);	

	// size all the columns
	Dwt.setSize(Dwt.getDomObj(doc, this._headerGutterColId), 18, Dwt.DEFAULT);//gutter
	Dwt.setSize(Dwt.getDomObj(doc, this._headerHourColId), 40, Dwt.DEFAULT);
	
	// size appts divs
	var apptsDiv = Dwt.getDomObj(doc, this._apptBodyDivId);

	var apptsDivX =  ZmCalDayView._hoursDivWidth + ZmCalDayView._hoursDivWidth_pad;
	var apptsDivHeight = ZmCalDayView._dayHeight + 1; // extra for midnight to show up
	var apptsDivWidth = bodyWidth - apptsDivX;
	
	Dwt.setLocation(apptsDiv, apptsDivX, -1);
	Dwt.setSize( apptsDiv, apptsDivWidth, apptsDivHeight);

	var dayWidth = Math.floor((apptsDivWidth-ZmCalDayView._scrollBarWidth)/this._numDays);

	var currentX = 0;
	
	for (var i =0; i < this._numDays; i++) {
		var daySepDiv = Dwt.getDomObj(doc, this._days[i].daySepDivId);
		Dwt.setLocation(daySepDiv, currentX, 0);
		Dwt.setSize(daySepDiv, ZmCalDayView._daySepWidth, apptsDivHeight);
		var day = this._days[i];
		day.apptX = currentX + ZmCalDayView._daySepWidth +1 ; //ZZZ
		day.apptWidth = dayWidth - ZmCalDayView._daySepWidth - 2;  //ZZZZ
		Dwt.setSize(Dwt.getDomObj(doc, this._days[i].headerColId), dayWidth, Dwt.DEFAULT);	
		currentX += dayWidth;		
	}	
	
	this._layoutAppts();
	this._updateSelectedTime();
	return;
}

ZmCalDayView.prototype._controlListener =
function(ev) {
	if (ev.newWidth == Dwt.DEFAULT && ev.newHeight == Dwt.DEFAULT) return;
	try {	
		if ((ev.oldWidth != ev.newWidth) || (ev.oldHeight != ev.newHeight)) {
			this._layout();
		}
	} catch(ex) {
		DBG.dumpObj(ex);
	}
}

ZmCalDayView.prototype._apptSelected =
function() {
	this._clearSelectedTime();
}

ZmCalDayView._ondblclickHandler =
function (ev){
	ev = DwtUiEvent.getEvent(ev);
	ev._isDblClick = true;
	ZmCalDayView._onclickHandler(ev);
};

ZmCalDayView.prototype._mouseUpAction =
function(ev, div) {
	ZmCalBaseView.prototype._mouseUpAction.call(this, ev, div);
	if (div._type == ZmCalBaseView.TYPE_APPTS_DAYGRID || div._type == ZmCalBaseView.TYPE_SELECTED_TIME)
		this._timeSelectionAction(ev, div, false);

}

ZmCalDayView.prototype._doubleClickAction =
function(ev, div) {
	ZmCalBaseView.prototype._doubleClickAction.call(this, ev, div);
	if (div._type == ZmCalBaseView.TYPE_APPTS_DAYGRID || div._type == ZmCalBaseView.TYPE_SELECTED_TIME)
		this._timeSelectionAction(ev, div, true);
}

ZmCalDayView.prototype._timeSelectionAction =
function(ev, div, dblclick) {
	
	var date;
	
	switch (div._type) {
		case ZmCalBaseView.TYPE_APPTS_DAYGRID:
			var date = this._getDateFromXY(ev.elementX, ev.elementY, 30);
			if (date == null) return false;
//			DBG.println("_mouseUplistener: element "+ev.elementX+ ", "+ev.elementY);
//			DBG.println("_mouseUplistener: date = "+date.toString());
//			DBG.println("_mouseUplistener: dbl click = "+dblclick);			
			break;
		case ZmCalBaseView.TYPE_SELECTED_TIME:
			//var date = new Date(this._date.getTime());
			var loc = Dwt.getLocation(div);
			var date = this._getDateFromXY(loc.x+ev.elementX, loc.y+ev.elementY, 30);
			if (date == null) return false;
//			DBG.println("_mouseUplistener: date = "+date.toString());
//			DBG.println("_mouseUplistener: dbl click = "+dblclick);						
			break;
		default:
			return;
	}
	if (!this._selectionEvent) this._selectionEvent = new DwtSelectionEvent(true);
	var sev = this._selectionEvent;
	sev._isDblClick = dblclick;
	sev.item = view;
	sev.detail = date;
	sev.force = false;
	this.notifyListeners(ZmCalBaseView.TIME_SELECTION, this._selectionEvent);
	sev._isDblClick = false;
}




/*
ZmCalDayView._oncontextmenuHandler =
function(event) {
	var event = DwtUiEvent.getEvent(event);
	var element = DwtUiEvent.getTargetWithProp(event, "id");
	if (!element) return;
	var id = element.id;
	var data = ZmCalDayView._idToData[id];
	var view = data.view;
	if (view) {
		if (!view._contextMenuEvent) {
			view._contextMenuEvent = new DwtUiEvent(true);
		}
		var ev = view._contextMenuEvent;
	   	ev.item = view;
	   	ev.detail = new Date(view._days[data.day].date.getTime() + 
		   					(data.hour * AjxDateUtil.MSEC_PER_HOUR) +
						   	(data.top ? 0 : AjxDateUtil.MSEC_PER_HALF_HOUR));
	   	view.notifyListeners(DwtEvent.ONCONTEXTMENU, view._contextMenuEvent);
	}		
}
*/

ZmCalDayView.prototype._mouseDownAction = 
function(ev, div) {
	//ZmCalBaseView.prototype._mouseDownAction.call(this, ev, div);
	switch (div._type) {
		case	 ZmCalBaseView.TYPE_APPT_BOTTOM_SASH:
			//DBG.println("_mouseDownAction for SASH!");
			return this._sashMouseDownAction(ev, div);
			break;
		case ZmCalBaseView.TYPE_APPT:
			//return this._apptMouseDownAction(ev, div);
			break;
	}
	return false;
}

// BEGIN APPT ACTION HANDLERS

ZmCalDayView.prototype._apptMouseDownAction =
function(ev, apptEl) {
	if (ev.button != DwtMouseEvent.LEFT) {
		return false;
	}

	var appt = AjxCore.objectWithId(apptEl._itemIndex);
	if (appt.isReadOnly()) return false;

	var loc = Dwt.getLocation(apptEl);
	
	var apptOffset = Dwt.toWindow(ev.target, ev.elementX, ev.elementY, apptEl);

	// snap it to grid
	var snap = this._snapXY(loc.x + apptOffset.x, loc.y, 15);
	if (snap == null) return false;
//DBG.println("mouseDown snap: "+snap.x+","+snap.y);	
	var data = { 
		appt:appt, 
		view:this,
		apptEl: apptEl, 
		apptX: loc.x,
		apptOffset: apptOffset,
		apptY: loc.y,
		docX: ev.docX,
		docY: ev.docY,
		snap: snap,
		date: new Date(appt.getStartTime())
	};
	var capture = new DwtMouseEventCapture	(data,
			ZmCalDayView._emptyHdlr, // mouse over
			ZmCalDayView._emptyHdlr, // mouse down (already handled by action)
			ZmCalDayView._apptMouseMoveHdlr, 
			ZmCalDayView._apptMouseUpHdlr, 
			ZmCalDayView._emptyHdlr, // mouse out
			true);
	capture.capture();
	this.deselectAll();
	this.setSelection(data.appt);
	ZmCalDayView._setOpacity(apptEl, 70);
	return false;	
}

ZmCalDayView._apptMouseMoveHdlr =
function(ev) {

	var mouseEv = DwtShell.mouseEvent;
	mouseEv.setFromDhtmlEvent(ev);	
	var data = DwtMouseEventCapture.getTargetObj();

	var deltaX = mouseEv.docX - data.docX;
	var deltaY = mouseEv.docY - data.docY;

	// snap new location to grid
	var snap = data.view._snapXY(data.apptX + data.apptOffset.x + deltaX, data.apptY + deltaY, 15);
	//DBG.println("mouseMove new snap: "+snap.x+","+snap.y+ " data snap: "+data.snap.x+","+data.snap.y);
	if (snap != null && (snap.x != data.snap.x || snap.y != data.snap.y)) {
		var newDate = data.view._getDateFromXY(snap.x, snap.y, 15);
		//DBG.println("new Date = "+newDate);
		if (newDate != null && newDate.getTime() != data.date.getTime()) {
			data.view._positionAppt(data.apptEl, snap.x, snap.y);
			data.date = newDate;
			data.snap = snap;
		}
	}
	mouseEv._stopPropagation = true;
	mouseEv._returnValue = false;
	mouseEv.setToDhtmlEvent(ev);
	return false;	
}

ZmCalDayView._apptMouseUpHdlr =
function(ev) {
//	DBG.println("ZmCalDayView._sashMouseUpHdlr");
	var data = DwtMouseEventCapture.getTargetObj();
	ZmCalDayView._setApptOpacity(data.appt, data.apptEl);	
	var mouseEv = DwtShell.mouseEvent;
	mouseEv.setFromDhtmlEvent(ev);	
	if (mouseEv.button != DwtMouseEvent.LEFT) {
		DwtUiEvent.setBehaviour(ev, true, false);
		return false;
	}

	DwtMouseEventCapture.getCaptureObj().release();

	data.view._positionAppt(data.apptEl, data.apptX, data.apptY);

	mouseEv._stopPropagation = true;
	mouseEv._returnValue = false;
	mouseEv.setToDhtmlEvent(ev);

	return false;	
}

// END APPT ACTION HANDLERS

// BEGIN SASH ACTION HANDLERS

ZmCalDayView.prototype._sashMouseDownAction =
function(ev, sash) {
//	DBG.println("ZmCalDayView._sashMouseDownHdlr");
	if (ev.button != DwtMouseEvent.LEFT) {
		return false;
	}
	sash.className = 'appt_sash_active';

	var apptEl = sash.parentNode;
	var apptBodyEl = apptEl.childNodes[0];

	var appt = AjxCore.objectWithId(apptEl._itemIndex);
	var origY = Dwt.getLocation(apptBodyEl).y;
	var origHeight = Dwt.getSize(apptBodyEl).y;
	var data = { 
		sash: sash,
		appt:appt, 
		view:this,
		apptEl: apptEl, 
		apptBodyEl: apptBodyEl,
		origHeight: origHeight,
		origY: origY,
		startY: ev.docY,
		endDate: new Date(appt.getEndTime())
	};
	//TODO: only create one of these and change data each time...
	var capture = new DwtMouseEventCapture	(data,
			ZmCalDayView._emptyHdlr, // mouse over
			ZmCalDayView._emptyHdlr, // mouse down (already handled by action)
			ZmCalDayView._sashMouseMoveHdlr, 
			ZmCalDayView._sashMouseUpHdlr, 
			ZmCalDayView._emptyHdlr, // mouse out
			true);
	capture.capture();
	this.deselectAll();
	this.setSelection(data.appt);
	ZmCalDayView._setOpacity(apptEl, 70);
	sash.innerHTML = "<div class=appt_sash_feedback_start>"+ZmAppt._getTTHour(data.endDate)+"</div>";
	return false;	
}

ZmCalDayView._sashMouseMoveHdlr =
function(ev) {
//	DBG.println("ZmCalDayView._sashMouseMoveHdlr");
	var mouseEv = DwtShell.mouseEvent;
	mouseEv.setFromDhtmlEvent(ev);	
	var delta = 0;
	var data = DwtMouseEventCapture.getTargetObj();

	if (mouseEv.docY > 0 && mouseEv.docY != data.startY)
		delta = mouseEv.docY - data.startY;

	var delta15 = Math.floor(delta/ZmCalDayView._15minuteHeight);
	delta = delta15 * ZmCalDayView._15minuteHeight;

	if (delta != data.lastDelta) {
		var newHeight = data.origHeight + delta;
		if (newHeight >= ZmCalDayView._15minuteHeight) {
//			DBG.println("delta = " + delta);
			Dwt.setSize(data.apptBodyEl, Dwt.DEFAULT, newHeight + ZmCalDayView._apptHeightFudge);
			data.lastDelta = delta;
			data.endDate.setTime(data.appt.getEndTime() + (delta15 * 15 * 60 * 1000)); // num msecs in 15 minutes
			var cname = delta == 0 ? "start" : "diff";
			data.sash.innerHTML = "<div class=appt_sash_feedback_"+cname+">"+ZmAppt._getTTHour(data.endDate)+"</div>";
		}
	}

	mouseEv._stopPropagation = true;
	mouseEv._returnValue = false;
	mouseEv.setToDhtmlEvent(ev);
	return false;	
}

ZmCalDayView._sashMouseUpHdlr =
function(ev) {
//	DBG.println("ZmCalDayView._sashMouseUpHdlr");
	var data = DwtMouseEventCapture.getTargetObj();
	ZmCalDayView._setApptOpacity(data.appt, data.apptEl);	
	var mouseEv = DwtShell.mouseEvent;
	mouseEv.setFromDhtmlEvent(ev);	
	if (mouseEv.button != DwtMouseEvent.LEFT) {
		DwtUiEvent.setBehaviour(ev, true, false);
		return false;
	}
	
	DwtMouseEventCapture.getCaptureObj().release();

	data.sash.innerHTML = "";
	data.sash.className = 'appt_sash';
	mouseEv._stopPropagation = true;
	mouseEv._returnValue = false;
	mouseEv.setToDhtmlEvent(ev);
	
	if (data.endDate.getTime() != data.appt.getEndTime()) {
		data.appt._orig.setViewMode(ZmAppt.MODE_EDIT);
		data.appt._orig.setEndDate(data.endDate);
		data.appt._orig.save(data.view._appCtxt.getAppController());
	}
	return false;	
}

// END SASH ACTION HANDLERS

ZmCalDayView._emptyHdlr =
function(ev) {
	var mouseEv = DwtShell.mouseEvent;
	mouseEv.setFromDhtmlEvent(ev);	
	mouseEv._stopPropagation = true;
	mouseEv._returnValue = false;
	mouseEv.setToDhtmlEvent(ev);
	return false;	
}

ZmCalDayView._getAttrFromElement =
function(el, attr)  {
	while (el != null) {
		if (el.getAttribute) {
			var value = el.getAttribute(attr);
			if (value != null) return value;
		}
		el = el.parentNode;
	}
	return null;
}

