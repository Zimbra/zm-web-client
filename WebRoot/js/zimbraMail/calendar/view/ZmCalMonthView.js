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

function ZmCalMonthView(parent, posStyle, dropTgt) {
	ZmCalBaseView.call(this, parent, "calendar_view", posStyle, ZmController.CAL_MONTH_VIEW, dropTgt);	
	this.getHtmlElement().style.overflow = "hidden";
	//this.setScrollStyle(DwtControl.SCROLL);
	this._needFirstLayout = true;
	this.setNumDays(42);
}

ZmCalMonthView.prototype = new ZmCalBaseView;
ZmCalMonthView.prototype.constructor = ZmCalMonthView;

ZmCalMonthView._DaySpacer = 1; // space between days

ZmCalMonthView.prototype.toString = 
function() {
	return "ZmCalMonthView";
}

ZmCalMonthView.prototype.getRollField =
function(isDouble)
{
	return isDouble? AjxDateUtil.YEAR : AjxDateUtil.MONTH;
}

ZmCalMonthView.prototype._dateUpdate =
function(rangeChanged)
{
	this._clearSelectedDay();
	this._updateSelectedDay();
}

ZmCalMonthView.prototype._updateTitle =
function() 
{	
	// updated in updateDays
}

ZmCalMonthView.prototype._clearSelectedDay =
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

ZmCalMonthView.prototype._updateSelectedDay =
function() 
{
	var day = this._dateToDayIndex[this._dayKey(this._date)];
	var te = Dwt.getDomObj(this.getDocument(), day.tdId);	
	te.className = 'calendar_month_cells_td-Selected';	
	this._selectedData = day;	
}

ZmCalMonthView.prototype._apptSelected =
function() {
	this._clearSelectedDay();
}

ZmCalMonthView.prototype._getWeekForAppt =
function(appt) {
	var day = this._getDayForAppt(appt);
	return day ? this._weeks[day.week] : null;
}

ZmCalMonthView.prototype._getDayForAppt =
function(appt) {
	return this._dateToDayIndex[this._dayKey(appt.getStartDate())];
}

ZmCalMonthView.prototype._getDivForAppt =
function(appt) {
	var day = this._getDayForAppt(appt);
	return day ? Dwt.getDomObj(this.getDocument(), day.dayId) : null;
}

ZmCalMonthView.prototype._dayTitle =
function(date) {
	if (this._shortMonInDay != date.getMonth()) {
		this._shortMonInDay = date.getMonth();
		return DwtMsg.MEDIUM_MONTH[date.getMonth()]+" "+date.getDate();
	} else {
		return date.getDate();
	}
}

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
}

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
}

ZmCalMonthView.prototype._postSet = 
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
}

ZmCalMonthView._allDayItemHtml =
function(appt,id, body_style) {
	var pstatus = appt.getParticipationStatus();
	var isNew = pstatus == ZmAppt.PSTATUS_NEEDS_ACTION;
	var isAccepted = pstatus == ZmAppt.PSTATUS_ACCEPT;
	var subs = {
		id: id,
		body_style: body_style,
		newState: isNew ? "_new" : "",
		color: "_blue",
		name: AjxStringUtil.htmlEncode(appt.getName()),
//		tag: isNew ? "NEW" : "",		//  HACK: i18n
		starttime: appt.getDurationText(true, true),
		endtime: (!appt._fanoutLast && (appt._fanoutFirst || (appt._fanoutNum > 0))) ? "" : ZmAppt._getTTHour(appt.getEndDate()),
		location: AjxStringUtil.htmlEncode(appt.getLocation()),
		statusKey: appt.getParticipationStatus(),
		status: appt.isOrganizer() ? "" : appt.getParticipationStatusString()
	};	
	var template = "calendar_appt_allday";
	return DwtBorder.getBorderHtml(template, subs, null);
}

ZmCalMonthView.prototype._createAllDayItemHtml =
function(appt, apptEnd) {
	//DBG.println("---- createItem ---- "+appt);
	
	// set up DIV
	var doc = this.getDocument();
	var div = doc.createElement("div");	

	div.style.position = 'absolute';
	Dwt.setSize(div, 10, 10);
	div._styleClass = "appt";	
	div._selectedStyleClass = div._styleClass + '-' + DwtCssStyle.SELECTED;
	div.className = div._styleClass;

	ZmCalDayView._setApptOpacity(appt, div);


	var bs = "";
	if (!appt._fanoutFirst) bs = "border-left:none;";
	if (!apptEnd._fanoutLast) bs += "border-right:none;";
	var body_style = (bs != "") ? "style='"+bs+"'" : "";

	this.associateItemWithElement(appt, div, ZmCalBaseView.TYPE_APPT);
	div.innerHTML = ZmCalMonthView._allDayItemHtml(appt, this._getItemId(appt), body_style);

	return div;
}

ZmCalMonthView.prototype._createAllDayFillerHtml =
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

ZmCalMonthView.prototype._createItemHtml =	
function(appt) {
	var result = this._getDivForAppt(appt).insertRow(-1);
	result._styleClass = "calendar_month_day_item_row";
	result._selectedStyleClass = result._styleClass + '-' + DwtCssStyle.SELECTED;

	result.className = result._styleClass;	
		
	this.associateItemWithElement(appt, result, ZmCalBaseView.TYPE_APPT);
	
	var html = new AjxBuffer();

	/*includeDuration */
	//var dur = appt.getDurationText(true, true);
	var dur = appt.getShortStartHour();
	html.append("<LI>");
	html.append(dur);
	if (dur != "") {
		html.append("&nbsp;");
	}
	html.append(AjxStringUtil.htmlEncode(appt.getName()));
	html.append("</LI>");	
	/**/

	//html.append("<LI>"+AjxStringUtil.htmlEncode(appt.getName())+"</LI>";

	//if (appt.getLocation() != "")	html.append("&nbsp;("+AjxStringUtil.htmlEncode(appt.getLocation())+")";
	
	var cell = result.insertCell(-1);
	cell.innerHTML = html.toString();
	//cell.colSpan = 2;
	cell.className = "calendar_month_day_item";

	return result;
}

ZmCalMonthView.prototype._createDay =
function(html, loc, week, dow) {
	var tdid = Dwt.getNextId();
	var did = Dwt.getNextId();
	var tid = Dwt.getNextId();	

	html.append("<td class='calendar_month_cells_td' id='", tdid, "'>");
	html.append("<table class='calendar_month_day_table'>");
	html.append("<tr><td colspan=2 id='", tid, "'></td></tr></table>");
	html.append("<table class='calendar_month_day_table'><tbody id='", did, "'>");
	html.append("</tbody></table>");
	html.append("</td>");
	var data = { dayId: did, titleId: tid, tdId: tdid, week: week, dow: dow, view: this};
	this._days[loc] = data;
}

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
	this._bodyColId = [];	

	var html = new AjxBuffer();
			
	html.append("<table class=calendar_view_table>");
	html.append("<tr><td>");
	html.append("<div id='", this._headerId, "' style='position:relative;'>");
	html.append("<table id=calendar_month_header_table class=calendar_month_table>");
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
	
	for (var day in DwtMsg.LONG_WEEKDAY) {
		html.append("<td class=calendar_month_header_cells_text>", DwtMsg.LONG_WEEKDAY[day], "</td>");
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
}

ZmCalMonthView.prototype._updateDays =
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
			var loc = i*7+j;
			var day = this._days[loc];
			day.date = new Date(d);
			this._dateToDayIndex[this._dayKey(day.date)] = day;
			var thisMonth = day.date.getMonth() == this._month;
	 		var te = Dwt.getDomObj(doc, day.titleId);
			te.innerHTML = this._dayTitle(d);
			te.className = thisMonth ? 'calendar_month_day_label' : 'calendar_month_day_label_off_month';
	 		var de = Dwt.getDomObj(doc, day.tdId);			
			de.className = d.getTime() == today.getTime() ? 'calendar_month_cells_td_today' :'calendar_month_cells_td';
			de._loc = loc;
			de._type = ZmCalBaseView.TYPE_MONTH_DAY;
			d.setDate(d.getDate()+1);
		}
	}
	
	this._title = DwtMsg.LONG_MONTH[this._date.getMonth()]+" "+this._date.getFullYear();	
	var titleEl = Dwt.getDomObj(doc, this._titleId);
	titleEl.innerHTML = this._title;
}

ZmCalMonthView.prototype._layoutAllDay = 
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
				var apptWidth = (dayWidth * data.num) - 8;
				var apptX = dayWidth*data.dow + 3;
				var apptY = dayY[i] + (21*data.row) + 18 + 3; //first 17, each appt + 1, second 17, day heading
				Dwt.setLocation(ae, apptX, apptY);
				Dwt.setSize(ae, apptWidth, 16); //Dwt.DEFAULT);
				var apptBodyDiv = Dwt.getDomObj(this.getDocument(), ae.id + "_body");
				Dwt.setSize(apptBodyDiv, apptWidth, 16); //Dwt.DEFAULT);
			}
		}
	}
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

ZmCalMonthView.getDayToolTipText =
function(date, list) {
	var html = new AjxBuffer();
	
	var title = DwtMsg.LONG_WEEKDAY[date.getDay()]+", "+DwtMsg.LONG_MONTH[date.getMonth()]+" "+date.getDate()+", "+date.getFullYear();
	
	html.append("<div>");
	html.append("<table cellpadding='0' cellspacing='0' border='0'>");
	html.append("<tr><td><div class='calendar_tooltip_month_day_label'>", title, "</div></td></tr>");
		
	html.append("<tr><td>");
	html.append("<table cellpadding='0' cellspacing='0' border='0'>");
	
	var size = list ? list.size() : 0;

	for (var i=0; i < size; i++) {
		var ao = list.get(i);
		if (ao.isAllDayEvent()) {
			//DBG.println("AO    "+ao);
			var bs = "";
			if (!ao._fanoutFirst) bs = "border-left:none;";
			if (!ao._fanoutLast) bs += "border-right:none;";
			var body_style = (bs != "") ? "style='"+bs+"'" : "";
			html.append("<tr><td><div class=appt>");
			html.append(ZmCalMonthView._allDayItemHtml(ao, Dwt.getNextId(), body_style));
			html.append("</div></td></tr>");
			html.append("<tr><td><div style='height=2px;'></div></td></tr>");
		}
	}

	for (var i=0; i < size; i++) {
		var ao = list.get(i);
		if (!ao.isAllDayEvent()) {
			html.append("<tr><td class='calendar_month_day_item'><LI>");
			var dur = ao.getShortStartHour();
			html.append(dur);
			if (dur != "") {
				html.append("&nbsp;");
			}
			html.append(AjxStringUtil.htmlEncode(ao.getName()));
			html.append("</LI>");
			html.append("</td></tr>");
		}
	}
	if ( size == 0) {
		html.append("<tr><td>"+ZmMsg.noAppts+"</td></tr>");
	}
	html.append("</table>");
	html.append("</tr></td></table>");
	html.append("</div>");

	return html.toString();
}

ZmCalMonthView.prototype._mouseDownAction = 
function(ev, div) {
	switch (div._type) {
		case ZmCalBaseView.TYPE_MONTH_DAY:
			this._timeSelectionAction(ev, div, false);
			break;
	}
	return false;
}

ZmCalMonthView.prototype._doubleClickAction =
function(ev, div) {
	ZmCalBaseView.prototype._doubleClickAction.call(this, ev, div);
	if (div._type == ZmCalBaseView.TYPE_MONTH_DAY) {
		this._timeSelectionAction(ev, div, true);
	}
}

ZmCalMonthView.prototype._timeSelectionAction =
function(ev, div, dblclick) {
	
	var date;
	
	switch (div._type) {
		case ZmCalBaseView.TYPE_MONTH_DAY:
			var date = new Date(this._days[div._loc].date);
			var now = new Date();
			date.setHours(now.getHours(), now.getMinutes());
			break;
		default:
			return;
	}
	this._timeSelectionEvent(date, AjxDateUtil.MSEC_PER_HOUR, dblclick);
}
