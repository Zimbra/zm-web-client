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

function ZmCalColView(parent, posStyle, dropTgt, view, numDays, scheduleMode) {
	if (arguments.length == 0) return;
	if (numDays == null) numDays = 1;
	if (view == null) view = ZmController.CAL_DAY_VIEW;
	var className = "calendar_view";
	// set before call to parent	
	this._scheduleMode = scheduleMode;
	this.setNumDays(numDays);
	this._daySepWidth = scheduleMode ? 2 : 1; // width of separator between days
	this._columns = [];
	this._unionBusyDivIds = new Array(); //  div ids for layingout union
	//this._numDays = numDays;
	ZmCalBaseView.call(this, parent, className, posStyle, view);
	this.setScrollStyle(DwtControl.CLIP);	
	this._needFirstLayout = true;
}

ZmCalColView.prototype = new ZmCalBaseView;
ZmCalColView.prototype.constructor = ZmCalColView;

ZmCalColView.DRAG_THRESHOLD = 5;

// min width before we'll turn on horizontal scrollbars
ZmCalColView.MIN_COLUMN_WIDTH = 100; 

ZmCalColView._OPACITY_APPT_NORMAL = 100;
ZmCalColView._OPACITY_APPT_DECLINED = 20;
ZmCalColView._OPACITY_APPT_TENTATIVE = 60;
ZmCalColView._OPACITY_APPT_DND = 70;

ZmCalColView._HOURS_DIV_WIDTH = 40; // width of div holding hours text (1:00am, etc)
ZmCalColView._UNION_DIV_WIDTH = 30; // width of div holding union in sched view

ZmCalColView._ALL_DAY_SEP_HEIGHT = 5; // height of separator between all day appts and body

ZmCalColView._SCROLLBAR_WIDTH = 22;

ZmCalColView._DAY_HEADING_HEIGHT = 20;
ZmCalColView._ALL_DAY_APPT_HEIGHT = 20;
ZmCalColView._ALL_DAY_APPT_HEIGHT_PAD = 3; // space between all day appt rows
ZmCalColView._APPT_X_FUDGE = 0; // due to border stuff
ZmCalColView._APPT_Y_FUDGE = -1; // ditto
ZmCalColView._APPT_WIDTH_FUDGE = (AjxEnv.isIE ? 0 : -3); // due to border stuff
ZmCalColView._APPT_HEIGHT_FUDGE = (AjxEnv.isIE ? 0 : -4); // ditto

ZmCalColView._HOUR_HEIGHT = 42;
ZmCalColView._HALF_HOUR_HEIGHT = ZmCalColView._HOUR_HEIGHT/2;
ZmCalColView._15_MINUTE_HEIGHT = ZmCalColView._HOUR_HEIGHT/4;
ZmCalColView._DAY_HEIGHT = ZmCalColView._HOUR_HEIGHT*24;

ZmCalColView.prototype.toString = 
function() {
	return "ZmCalColView";
}

ZmCalColView.prototype.getRollField =
function(isDouble) {
	switch(this.view) {
		case ZmController.CAL_WORK_WEEK_VIEW:	
		case ZmController.CAL_WEEK_VIEW:
			return isDouble ? AjxDateUtil.MONTH : AjxDateUtil.WEEK;
			break;
		case ZmController.CAL_DAY_VIEW:
		case ZmController.CAL_SCHEDULE_VIEW:
		default:
			return isDouble ? AjxDateUtil.WEEK : AjxDateUtil.DAY;
			break;		
	}
}

ZmCalColView.prototype.getPrintHtml = 
function() {
	var html = new Array();
	var idx = 0;
	
	var timeRange = this.getTimeRange();
	var startDate = new Date(timeRange.start);
	var endDate = new Date(timeRange.end);

	// print the common header for calendar by calling base class
	html[idx++] = ZmCalBaseView.prototype.getPrintHtml.call(this);
	html[idx++] = "<div style='width:100%'>";
	html[idx++] = "<table width=100% border=0 cellpadding=1 cellspacing=1 style='border:2px solid black'>";

	var list = this.getList();
	var numAppts = list ? list.size() : 0;
	var nextDay = new Date(startDate);
	var numDays = this.getNumDays();

	// single day print out requires all details for each appointment
	if (numDays == 1) {
		this._loadDetailsForAppts(list, numAppts);
	}
	
	for (var i = 0; i < numDays; i++) {
		html[idx++] = "<tr><td width=100%>";
		if (numDays > 1) {
			// XXX: set the styles inline so we force the printer to acknowledge them!
			var style = "background-color:#EEEEEE; text-align:center; font-family:Arial; font-size:14px; font-weight:bold; border:1px solid #EEEEEE;";
			html[idx++] = "<div style='" + style + "'>";
			html[idx++] = AjxDateUtil.getTimeStr(nextDay, "%w, %M %D");
			html[idx++] = "</div>";
		}
		
		// print out all the appointments for this day
		var inTable = false;
		for (var j = 0; j < numAppts; j++) {
			var appt = list.get(j);
			if (appt.startDate.getDate() == nextDay.getDate() || numDays == 1) {
				var loc = appt.getLocation();
				var status = appt.getParticipationStatusString();
				if (appt.isAllDayEvent()) {
					// XXX: this is bad HTML but the browsers do the right thing and help us out
					html[idx++] = "<table border=0 cellpadding=2 cellspacing=2 width=100% style='border:1px solid black'>";
					html[idx++] = "<tr><td style='font-family:Arial; font-size:13px; width:100%;'>";
					html[idx++] = "<b>" + appt.getName() + "</b>";
					if (loc)
						html[idx++] = " (" + loc + ")";
					html[idx++] = " [" + status + "]";
					// print more detail if we're printing a single day
					if (numDays == 1) {
						html[idx++] = this._printApptDetails(appt);
					}
					html[idx++] = "</td></tr></table>";
				} else {
					if (!inTable) {
						inTable = true;
						html[idx++] = "<table border=0>";
					}
					var startTime = AjxDateUtil.getTimeStr(appt.startDate, "%h:%m%p");
					var endTime = AjxDateUtil.getTimeStr(appt.endDate, "%h:%m%p");
					style = "font-family:Arial; font-size:13px; vertical-align:top;"
					html[idx++] = "<tr>";
					html[idx++] = "<td align=right style='" + style + "'><b>" + startTime + "</b></td>";
					html[idx++] = "<td valign=top> - </td>";
					html[idx++] = "<td align=right style='" + style + "'><b>" + endTime + "</b></td>";
					html[idx++] = "<td style='" + style + "'>";
					html[idx++] = appt.getName();
					if (loc) {
						html[idx++] = " (" + loc + ")";
					}
					html[idx++] = " [" + status + "]";
					html[idx++] = "</td></tr>";
					
					if (numDays == 1) {
						html[idx++] = "<tr><td></td><td></td><td></td><td>";
						html[idx++] = this._printApptDetails(appt);
						html[idx++] = "</td></tr>";
					}
					
					// spacer
					html[idx++] = "<tr><td><br></td></tr>";
				}
			}
		}
		if (inTable)
			html[idx++] = "</table>";

		html[idx++] = "<br><br></td></tr>";

		nextDay.setDate(nextDay.getDate() + 1);
	}
	html[idx++] = "</table>";
	html[idx++] = "</div>";

	return html.join("");
};

// Helper function that collects all appointments that dont have details loaded
// and makes batch request to go fetch them. Used for printing.
ZmCalColView.prototype._loadDetailsForAppts = 
function(list, numAppts) {
	var makeBatchReq = false;
	var needToLoad = new Object();
	var apptHash = new Object();

	// collect all appointments that dont have details loaded yet
	for (var i = 0; i < numAppts; i++) {
		var appt = list.get(i);
		if (!appt.hasDetails()) {
			var newMessage = new ZmMailMsg(this._appCtxt, appt.getInvId());
			needToLoad[newMessage.id] = newMessage;
			apptHash[newMessage.id] = appt;
			appt.setMessage(newMessage);
			makeBatchReq = true;
		}
	}

	if (makeBatchReq) {
		// set up batch request call
		var soapDoc = AjxSoapDoc.create("BatchRequest", "urn:zimbra");
		soapDoc.setMethodAttribute("onerror", "continue");

		for (var i in needToLoad) {
			var msgRequest = soapDoc.set("GetMsgRequest");
			msgRequest.setAttribute("xmlns", "urn:zimbraMail");

			var doc = soapDoc.getDoc();
			var msgNode = doc.createElement("m");
			msgNode.setAttribute("id", i);
	
			msgRequest.appendChild(msgNode);
		}

		var command = new ZmCsfeCommand();
		var resp = command.invoke({soapDoc: soapDoc}).Body.BatchResponse.GetMsgResponse;

		for (var i = 0; i < resp.length; i++) {
			var msgNode = resp[i].m[0];
			var msg = needToLoad[msgNode.id];
			if (msg) {
				msg._loadFromDom(msgNode);
				// parse ZmMailMsg into ZmAppt
				var appt = apptHash[msgNode.id];
				if (appt)
					appt.setFromMessage(msg);
			}
		}
	}
};

ZmCalColView.prototype._printApptDetails = 
function(appt) {
	var html = new Array();
	var idx = 0;
	var style= "font-family:Arial; font-size:12px; vertical-align:top;";
	
	html[idx++] = "<table border=0 width=100%>";
	
	var organizer = appt.getOrganizer();
	var attendees = appt.getAttendees();

	if (organizer && attendees) {
		html[idx++] = "<tr><td width=1% style='" + style + "'><u>" + ZmMsg.organizer + "</u></td>";
		html[idx++] = "<td style='" + style + "'>" + appt.getOrganizer() + "</td></tr>";
		html[idx++] = "<tr><td width=1% style='" + style + "'><u>" + ZmMsg.attendees + ":</u></td>";
		html[idx++] = "<td style='" + style + "'>" + attendees + "</td></tr>";
	}
	
	var attachments = appt.getAttachments();
	if (attachments) {
		html[idx++] = "<tr>";
		html[idx++] = "<td width=1% style='" + style + "'><u>" + ZmMsg.attachments + ":</u></td>";
		html[idx++] = "<td style='" + style + "'>";
		for (var i = 0; i < attachments.length; i++) {
			 html[idx++] = attachments[i].filename;
			 if (i != attachments.length-1)
			 	html[idx++] = ", ";
		}
		html[idx++] = "</td></tr>";
	}
	
	var notes = appt.getNotes();
	if (notes) {
		style= "font-family:Arial; font-size:11px; vertical-align:top; margin-top:3px";
		html[idx++] = "<tr><td colspan=2 style='" + style + "'>" + AjxStringUtil.nl2br(notes) + "</td></tr>";
	}

	html[idx++] = "</table>";
	
	return html.join("");
};

ZmCalColView.prototype._getDateHdrForPrintView = 
function() {
	var header = "";
	var timeRange = this.getTimeRange();
	var startDate = new Date(timeRange.start);

	if (this.getNumDays() > 1) {
		var endDate = new Date(timeRange.end - AjxDateUtil.MSEC_PER_DAY);
		var startWeek = AjxDateUtil.getTimeStr(startDate, "%t %D");
		var endWeek = AjxDateUtil.getTimeStr(endDate, "%t %D");
		header = startWeek + " - " + endWeek;
	} else {
		header = AjxDateUtil.getTimeStr(startDate, "%M %D, %Y<br><font size=-1>%w</font>");
	}

	return header;
};

ZmCalColView.prototype._dateUpdate =
function(rangeChanged) {
	this._selectDay(this._date);
	this._clearSelectedTime();
	this._updateSelectedTime();
}

ZmCalColView.prototype._selectDay =
function(date) {
	if (this._numDays == 1 || this._scheduleMode) return;
	var day = this._getDayForDate(date);
	if (day != null) {
		var col = this._columns[day.index];
		var doc = this.getDocument();
		if (this._selectedDay) {
	 		var te = Dwt.getDomObj(doc, this._selectedCol.titleId);
	 		te.className = this._selectedDay.isToday ? 'calendar_heading_day_today' : 'calendar_heading_day';
		}
		this._selectedDay = day;
		this._selectedCol = col;
		var te = Dwt.getDomObj(doc, col.titleId);
 		te.className = day.isToday ? 'calendar_heading_day_today-selected' : 'calendar_heading_day-selected';
	}
}

ZmCalColView.prototype._clearSelectedTime =
function() 
{
	var e = Dwt.getDomObj(this.getDocument(), this._timeSelectionDivId);
	if (e) Dwt.setVisible(e, false);
}

ZmCalColView.prototype._updateSelectedTime =
function() 
{
	var t = this._date.getTime();
	if (t < this._timeRangeStart || t >= this._timeRangeEnd)
		return;

	var e = Dwt.getDomObj(this.getDocument(), this._timeSelectionDivId);
	if (!e) return;

	var bounds = this._getBoundsForDate(this._date,  AjxDateUtil.MSEC_PER_HALF_HOUR);
	if (bounds == null) return;
	var snap = this._snapXY(bounds.x, bounds.y, 30);
	if (snap == null) return;

	Dwt.setLocation(e, snap.x, snap.y);
	Dwt.setSize(e, bounds.width, bounds.height);
	ZmCalColView._setOpacity(e, 40);
	Dwt.setVisible(e, true);
}

ZmCalColView.prototype._removeNode =
function(doc, id) {
	var node = Dwt.getDomObj(doc, id);
	if (node) node.parentNode.removeChild(node);
}

ZmCalColView.prototype._updateUnionDataHash =
function(index, folderId) {
	var hash = this._unionBusyData[index];
	if (!hash) hash = this._unionBusyData[index] = {};
	hash[folderId] = 1;	
}

ZmCalColView.prototype._updateUnionData =
function(appt) {
	if (appt.isAllDayEvent()) {
		this._updateUnionDataHash(48, appt.getFolderId());
	} else {
		var sd = appt.getStartDate();
		var ed = appt.getEndDate();
		var em = ed.getMinutes();	
		var eh = ed.getHours();
		var startIndex = (sd.getHours()*2) + (sd.getMinutes() < 30 ? 0 : 1);
		var endIndex = ((eh ? eh : 24) *2) + (em == 0 ? 0 : (em <= 30 ? 1 : 2));
		var folderId = appt.getFolderId();
		if (startIndex == endIndex) endIndex++;
		for (var i=startIndex; i < endIndex; i++) {
			this._updateUnionDataHash(i, folderId);
		}
	}
}

ZmCalColView.prototype.addAppt = 
function(appt) {
	ZmCalBaseView.prototype.addAppt.call(this, appt);
	if (this._scheduleMode) {
		this._updateUnionData(appt);
	}
}

ZmCalColView.prototype._resetCalendarData =
function() {
	// TODO: optimize: if calendar list is same, skip!

	// remove existing
	// TODO: optimize, add/remove depending on new calendar length
	var doc = this.getDocument();
	
	if (this._numCalendars > 0) {
		for (var i =0; i < this._numCalendars; i++) {
			var col = this._columns[i];
			this._removeNode(doc, col.titleId);
			this._removeNode(doc, col.headingDaySepDivId);
			this._removeNode(doc, col.daySepDivId);			
		}
	}

	this._calendars = this._calController.getCheckedCalendars();
	this._calendars.sort(ZmCalendar.sortCompare);
	this._folderIdToColIndex = {};
	this._columns = [];
	this._numCalendars = this._calendars.length;

	this._unionBusyData = new Array(); //  0-47, one slot per half hour, 48 all day
	this._unionBusyDataToolTip = new Array(); // tool tips

	var titleParentEl = Dwt.getDomObj(doc, this._allDayHeadingDivId);
	var headingParentEl = Dwt.getDomObj(doc, this._allDayScrollDivId);
	var dayParentEl = Dwt.getDomObj(doc, this._apptBodyDivId);

	for (var i =0; i < this._numCalendars; i++) {
		var col = this._columns[i] = {
			index: i,
			dayIndex: 0,
			cal: this._calendars[i],
			titleId: Dwt.getNextId(),
			headingDaySepDivId: Dwt.getNextId(),
			daySepDivId: Dwt.getNextId(),
			apptX: 0, // computed in layout
			apptWidth: 0,// computed in layout
			allDayX: 0, // computed in layout
			allDayWidth: 0// computed in layout			
		};
		this._folderIdToColIndex[this._calendars[i].id] = col;

		var div = doc.createElement("div");
		div.style.position = 'absolute';
		div.className = "calendar_heading_day";
		div.id = col.titleId;
		div.innerHTML = AjxStringUtil.htmlEncode(this._calendars[i].getName());
		titleParentEl.appendChild(div);

		div = doc.createElement("div");
		div.className = "calendar_day_separator";
		div.style.position = 'absolute';		
		div.id = col.headingDaySepDivId;
		headingParentEl.appendChild(div);						

		div = doc.createElement("div");
		div.className = "calendar_day_separator";
		div.style.position = 'absolute';		
		div.id = col.daySepDivId;
		dayParentEl.appendChild(div);						
	}
}

ZmCalColView.prototype._preSet = 
function() {
	if (this._scheduleMode) this._resetCalendarData(); // cal must be first
	this._resetAllDayData();
}

ZmCalColView.prototype._postSet = 
function() {
	this._computeApptLayout();
	this._computeAllDayApptLayout();
	if (!this._needFirstLayout)
		this._layoutAppts();
	this._layout();
	this._scrollTo8AM();
}

ZmCalColView.prototype._syncScroll =
function(resetLeft)
{
	var bodyElement = Dwt.getDomObj(document, this._bodyDivId);
	var hourElement = Dwt.getDomObj(document, this._hoursScrollDivId);
	var alldayElement = Dwt.getDomObj(document, this._allDayScrollDivId);
	var unionGridScrollElement = Dwt.getDomObj(document, this._unionGridScrollDivId);
	hourElement.scrollTop = bodyElement.scrollTop;
	if (resetLeft) bodyElement.scrollLeft = 0;
	alldayElement.scrollLeft = bodyElement.scrollLeft;
	if (unionGridScrollElement) unionGridScrollElement.scrollTop = bodyElement.scrollTop;
}

ZmCalColView.prototype._horizontalScrollbar =
function(enable)
{
	var bodyElement = Dwt.getDomObj(document, this._bodyDivId);
	bodyElement.className = enable ? "calendar_body_hscroll" : "calendar_body";
	if (enable != this._horzEnabled) {
		this._horzEnabled = enable;
		this._syncScroll(true);	
	}
}

ZmCalColView.prototype._scrollTo8AM =
function()
{
	if (!this._autoScrollDisabled) {
		var bodyElement = Dwt.getDomObj(this.getDocument(), this._bodyDivId);
		bodyElement.scrollTop = ZmCalColView._HOUR_HEIGHT*8 - 10;
		this._syncScroll();
	} else {
		this._autoScrollDisabled = false;
	}
}

ZmCalColView.prototype._updateTitle =
function() 
{
	var numDays = this.getNumDays();
	if (numDays == 1) {
		var date = this._date;
		this._title = ((this._scheduleMode) ? AjxDateUtil.WEEKDAY_LONG[date.getDay()]+", " : "") +
							AjxDateUtil.MONTH_LONG[date.getMonth()] + " " + date.getDate();
	} else {
		var first = this._days[0].date;
		var last = this._days[numDays-1].date;
		this._title = AjxDateUtil.MONTH_LONG[first.getMonth()]+" "+first.getDate()+" - " +
				 AjxDateUtil.MONTH_LONG[last.getMonth()]+" "+last.getDate(); //+", "+last.getFullYear();
	}				 
}

ZmCalColView.prototype._dayTitle =
function(date) {
	var title = (this.getNumDays() == 1) ?
		AjxDateUtil.WEEKDAY_LONG[date.getDay()]+", "+AjxDateUtil.MONTH_LONG[date.getMonth()]+" "+date.getDate() :
		AjxDateUtil.WEEKDAY_MEDIUM[date.getDay()]+", "+AjxDateUtil.MONTH_MEDIUM[date.getMonth()]+" "+date.getDate();
	return AjxStringUtil.htmlEncode(title);
}

ZmCalColView.prototype._updateDays =
function() {
	var d = new Date(this._date.getTime());
	d.setHours(0,0,0,0);	
	var dow;
			
	switch(this.view) {
		case ZmController.CAL_WORK_WEEK_VIEW:	
			dow = d.getDay();
			if (dow == 0)
				d.setDate(d.getDate()+1);
			else if (dow != 1)
				d.setDate(d.getDate()-(dow-1));
			break;				
		case ZmController.CAL_WEEK_VIEW:
			var fdow = this.firstDayOfWeek();
			dow = d.getDay();
			if (dow != fdow) {
				d.setDate(d.getDate()-((dow+(7-fdow))%7));
			}
			break;
		case ZmController.CAL_DAY_VIEW:
		default:
			/* nothing */
			break;		
	}

	var doc = this.getDocument();
	
	this._dateToDayIndex = new Object();
	
	var today = new Date();
	today.setHours(0,0,0,0);

	var numDays = this.getNumDays();
	var lastDay = numDays - 1;

	for (var i=0; i < numDays; i++) {
		var day = this._days[i] = {};
		day.index = i;
		day.date = new Date(d);
		day.endDate = new Date(d);
		day.endDate.setHours(23,59,59,999);
		day.isToday = day.date.getTime() == today.getTime();
		this._dateToDayIndex[this._dayKey(day.date)] = day;
		if (!this._scheduleMode) {
	 		var te = Dwt.getDomObj(doc, this._columns[i].titleId);
			te.innerHTML = this._dayTitle(d);
			te._type = ZmCalBaseView.TYPE_DAY_HEADER;
			te._dayIndex = i;
			te.className = day.isToday ? 'calendar_heading_day_today' : 'calendar_heading_day';
		}
		d.setDate(d.getDate()+1);		
	}
	var te = Dwt.getDomObj(doc, this._headerYearId);
	te.innerHTML = this._days[0].date.getFullYear();
}

ZmCalColView.prototype._resetAllDayData =
function() {
	this._allDayAppts = {};
	this._allDayApptsList = [];
	this._allDayApptsRowLayouts = [];
	this._addAllDayApptRowLayout();
}

/**
 * we don't want allday appts that span days to be fanned out
 */
ZmCalColView.prototype._fanoutAllDay =
function(appt) {
	return false;
}

ZmCalColView.prototype._getDivForAppt =
function(appt) {
	return Dwt.getDomObj(this.getDocument(), appt.isAllDayEvent() ? this._allDayDivId : this._apptBodyDivId);		 
}

// move this to Dwt?
ZmCalColView._setOpacity =
function(el, opacity) {
	if (AjxEnv.isIE) el.style.filter = "alpha(opacity="+opacity+")";
	else el.style.opacity = opacity/100;
}

ZmCalColView._setApptOpacity =
function(appt, div) {
	var pstatus = appt.getParticipationStatus();
	if (pstatus == ZmAppt.PSTATUS_DECLINED) {
		ZmCalColView._setOpacity(div, ZmCalColView._OPACITY_APPT_DECLINED);
	} else if (pstatus == ZmAppt.PSTATUS_TENTATIVE) {
		ZmCalColView._setOpacity(div, ZmCalColView._OPACITY_APPT_TENTATIVE);
	} else {
		ZmCalColView._setOpacity(div, ZmCalColView._OPACITY_APPT_NORMAL);	
	}
}

// for the new appt when drag selecting time grid
ZmCalColView.prototype._populateNewApptHtml =
function(div, allDay, folderId) {
	if (folderId == null) folderId = this._calController.getDefaultCalendarFolderId();
	var color = ZmCalBaseView.COLORS[this._calController.getCalendarColor(folderId)];
	var prop = allDay ? "_newAllDayApptColor" : "_newApptColor";
	if (this[prop] && this[prop] == color) return div;
	else this[prop] = color;
	div.style.position = 'absolute';
	Dwt.setSize(div, 10, 10);// will be resized
	div.className = 	"appt-" + DwtCssStyle.SELECTED;
	ZmCalColView._setOpacity(div, ZmCalColView._OPACITY_APPT_DND);
	var subs = {
		id: div.id,
		newState: "",
		headerColor: color + "Light",
		bodyColor: color + "Bg",
		body_style: "",
		name: AjxStringUtil.htmlEncode(ZmMsg.newAppt),
		starttime: "",
		endtime: "",
		location: "",
		statusKey: "",
		status: ""
	};	
	div.innerHTML = DwtBorder.getBorderHtml(allDay ? "calendar_appt_allday" : "calendar_appt", subs, null);
	return div;
}

ZmCalColView.prototype._createItemHtml =
function(appt) {
	//DBG.println("---- createItem ---- "+appt);
	if (appt.isAllDayEvent()) {
		var dataId = appt.getUniqueId();
		var startTime = Math.max(appt.getStartTime(), this._timeRangeStart);
		var endTime = Math.min(appt.getEndTime(), this._timeRangeEnd);
		var numDays = Math.floor((endTime-startTime)/AjxDateUtil.MSEC_PER_DAY);
		var data = this._allDayAppts[dataId] = {
			appt: appt,
			startTime: startTime,
			numDays: numDays
		};
		this._allDayApptsList.push(appt);
	}
	
	// set up DIV
	var doc = this.getDocument();
	var div = doc.createElement("div");	

	div.style.position = 'absolute';
	Dwt.setSize(div, 10, 10);
	div._styleClass = "appt";	
	div._selectedStyleClass = div._styleClass + '-' + DwtCssStyle.SELECTED;
	div.className = div._styleClass;

	ZmCalColView._setApptOpacity(appt, div);

	this.associateItemWithElement(appt, div, ZmCalBaseView.TYPE_APPT);

	var pstatus = appt.getParticipationStatus();
	var isNew = pstatus == ZmAppt.PSTATUS_NEEDS_ACTION;
	var isAccepted = pstatus == ZmAppt.PSTATUS_ACCEPT;
	var id = this._getItemId(appt);
	var color = ZmCalBaseView.COLORS[this._calController.getCalendarColor(appt.getFolderId())];
	//var color = "Blue";
	var subs = {
		id: id,
		body_style: "",
		newState: isNew ? "_new" : "",
		headerColor: color + (isNew ? "Dark" : "Light"),
		bodyColor: color + (isNew ? "" : "Bg"),
		name: AjxStringUtil.htmlEncode(appt.getName()),
//		tag: isNew ? "NEW" : "",		//  HACK: i18n
		starttime: appt.getDurationText(true, true),
		endtime: (!appt._fanoutLast && (appt._fanoutFirst || (appt._fanoutNum > 0))) ? "" : ZmAppt._getTTHour(appt.getEndDate()),
		location: AjxStringUtil.htmlEncode(appt.getLocation()),
		statusKey: appt.getParticipationStatus(),
		status: appt.isOrganizer() ? "" : appt.getParticipationStatusString()
	};	
	
	var template;
	if (appt.isAllDayEvent()) {
		template = "calendar_appt_allday";
		var bs = "";
		if (!this.isStartInView(appt._orig)) bs = "border-left:none;";
		if (!this.isEndInView(appt._orig)) bs += "border-right:none;";
		if (bs != "") subs.body_style = "style='"+bs+"'";
	} else if (appt._orig.getDuration() <= AjxDateUtil.MSEC_PER_HALF_HOUR) {
		template = "calendar_appt_30";
	} else if (appt._fanoutNum > 0) {
		template = "calendar_appt_bottom_only";
	} else {
		template = "calendar_appt";
	}

	div.innerHTML = DwtBorder.getBorderHtml(template, subs, null);

	// if (we can edit this appt) then create sash....
 	if (!appt.isReadOnly() && !appt.isAllDayEvent()) {
	
		if (appt._fanoutLast || (!appt._fanoutFirst && (!appt._fanoutNum))) {
			var bottom = this.getDocument().createElement("div");
			//sash.id = id+"_sash";
			bottom.className = 'appt_bottom_sash';
			bottom._type = ZmCalBaseView.TYPE_APPT_BOTTOM_SASH;
			div.appendChild(bottom);
		}

		if (appt._fanoutFirst || (!appt._fanoutLast && (!appt._fanoutNum))) {
			var top = this.getDocument().createElement("div");
			top.className = 'appt_top_sash';
			top._type = ZmCalBaseView.TYPE_APPT_TOP_SASH;
			div.appendChild(top);		
		}
	}
	return div;
}

ZmCalColView.prototype._createHoursHtml =
function(html) {
	html.append("<div style='position:absolute; top:-8; width:", ZmCalColView._HOURS_DIV_WIDTH, "px;' id='", this._bodyHourDivId, "'>");
	html.append("<table class=calendar_grid_day_table>");
	for (var h=0; h < 25; h++) {
		var hour = (h==0 || h == 12) ? 12 : h % 12;
		var ampm = (h < 12) ? "am" : "pm";
		html.append("<tr><td class=calendar_grid_body_time_td style='height:",
		ZmCalColView._HOUR_HEIGHT ,"px; width:", ZmCalColView._HOURS_DIV_WIDTH, "px'><div class=calendar_grid_body_time_text>");
		if (h == 0 || h == 24) {
			html.append("&nbsp;");
		} else if (h == 12) {
			html.append(ZmMsg.noon);
		} else {
			html.append(hour, " ", ampm);
		}
		html.append("</div></td></tr>");	
	}
	html.append("</table>", "</div>");	
}

ZmCalColView.prototype._createHtml =
function(abook) {
	this._days = new Object();
	this._columns = new Array();
	this._hours = new Object();

	this._layouts = new Array();
	this._allDayAppts = new Array();

	var html = new AjxBuffer();

	this._headerYearId = Dwt.getNextId();
	this._yearHeadingDivId = Dwt.getNextId();		
	this._yearAllDayDivId = Dwt.getNextId();
	this._leftAllDaySepDivId = Dwt.getNextId();	
	this._leftApptSepDivId = Dwt.getNextId();		

	this._allDayScrollDivId = Dwt.getNextId();
	this._allDayHeadingDivId = Dwt.getNextId();
	this._allDayDivId = Dwt.getNextId();
	this._hoursScrollDivId = Dwt.getNextId();
	this._bodyHourDivId = Dwt.getNextId();
	this._allDaySepDivId = Dwt.getNextId();
	this._bodyDivId = Dwt.getNextId();
	this._apptBodyDivId = Dwt.getNextId();
	this._newApptDivId = Dwt.getNextId();
	this._newAllDayApptDivId = Dwt.getNextId();	
	this._timeSelectionDivId = Dwt.getNextId();

	if (this._scheduleMode) {
		this._unionHeadingDivId = Dwt.getNextId();
		this._unionAllDayDivId = Dwt.getNextId();		
		this._unionHeadingSepDivId = Dwt.getNextId();
		this._unionGridScrollDivId = Dwt.getNextId();
		this._unionGridDivId = Dwt.getNextId();
		this._unionGridSepDivId = Dwt.getNextId();
	}		

	this._allDayRows = new Array();

	var numDays = this.getNumDays();
	if (!this._scheduleMode) {
		for (var i =0; i < numDays; i++) {
			this._columns[i] = {
				index: i,
				dayIndex: i,
				titleId: Dwt.getNextId(),
				headingDaySepDivId: Dwt.getNextId(),
				daySepDivId: Dwt.getNextId(),
				apptX: 0, // computed in layout
				apptWidth: 0,// computed in layout
				allDayX: 0, // computed in layout
				allDayWidth: 0// computed in layout
			};
		}
	}

	// year heading	
	html.append("<div id='", this._yearHeadingDivId, "' class=calendar_heading style='position:absolute'>");
	html.append("<div id='", this._headerYearId, 
		"' class=calendar_heading_year_text style='position:absolute; width:", ZmCalColView._HOURS_DIV_WIDTH,"px;'></div>");
	html.append("</div>");

	// div under year
	html.append("<div id='", this._yearAllDayDivId, "' style='position:absolute'></div>");
	
	// sep between year and headings
	html.append("<div id='", this._leftAllDaySepDivId, "' class='calendar_day_separator' style='position:absolute'></div>");

	if (this._scheduleMode) {
		// "All" heading
		html.append("<div id='", this._unionHeadingDivId, "' class=calendar_heading style='position:absolute'>");
		html.append("<div class=calendar_heading_year_text style='position:absolute; width:", ZmCalColView._UNION_DIV_WIDTH,"px;'>",ZmMsg.all,"</div>");
		html.append("</div>");

		// div in all day space
		html.append("<div id='", this._unionAllDayDivId, "' style='position:absolute'></div>");
	
		// sep between year and headings
		html.append("<div id='", this._unionHeadingSepDivId, "' class='calendar_day_separator' style='position:absolute'></div>");
	}

	// all day scroll	=============
	html.append("<div id='", this._allDayScrollDivId, "' style='position:absolute; overflow:hidden;'>");
	
	// all day headings
	html.append("<div id='", this._allDayHeadingDivId, "' class=calendar_heading style='position:absolute'>");
	if (!this._scheduleMode) {
		for (var i =0; i < this.getNumDays(); i++) {
			html.append("<div id='", this._columns[i].titleId, "' class=calendar_heading_day style='position:absolute;'></div>");
		}
	}
	html.append("</div>");
	
	// divs to separate day headings
	if (!this._scheduleMode) {	
		for (var i =0; i < numDays; i++) {
			html.append("<div id='", this._columns[i].headingDaySepDivId, "' class='calendar_day_separator' style='position:absolute'></div>");
		}
	}
	// div holding all day appts
	html.append("<div id='", this._allDayDivId, "' style='position:absolute'>");
	html.append("<div id='", this._newAllDayApptDivId, "' class='appt-Selected' style='position:absolute; display:none;'></div>");	
	html.append("</div>"); 	
	html.append("</div>"); 
	// end of all day scroll ===========
	
	// sep betwen all day and normal appts	
	html.append("<div id='", this._allDaySepDivId, "' class=calendar_header_allday_separator style='overflow:hidden;position:absolute;'></div>");

	// div to hold hours
	html.append("<div id='", this._hoursScrollDivId, "' class=calendar_hour_scroll style='position:absolute;'>");
	this._createHoursHtml(html);	
	html.append("</div>");

	// sep between hours and grid
	html.append("<div id='", this._leftApptSepDivId, "' class='calendar_day_separator' style='position:absolute'></div>");

	// union grid
	if (this._scheduleMode) {
		html.append("<div id='", this._unionGridScrollDivId, "' class=calendar_union_scroll style='position:absolute'>");
		html.append("<div id='", this._unionGridDivId, "' class='ImgCalendarDayGrid__BG' style='width:100%; height:1008px; position:absolute;'>");	
		html.append("</div></div>");
		// sep between union grid and appt grid
		html.append("<div id='", this._unionGridSepDivId, "' class='calendar_day_separator' style='position:absolute'></div>");
	}
	
	// grid body
	html.append("<div id='", this._bodyDivId, "' class=calendar_body style='position:absolute'>");
	html.append("<div id='", this._apptBodyDivId, "' class='ImgCalendarDayGrid__BG' style='width:100%; height:1008px; position:absolute;'>");	
	html.append("<div id='", this._timeSelectionDivId, "' class='calendar_time_selection' style='position:absolute; display:none;'></div>");
	html.append("<div id='", this._newApptDivId, "' class='appt-Selected' style='position:absolute; display:none;'></div>");
	if (!this._scheduleMode) {	
		for (var i =0; i < numDays; i++) {
		  html.append("<div id='", this._columns[i].daySepDivId, "' class='calendar_day_separator' style='position:absolute'></div>");
		}
	}
	html.append("</div>");
	html.append("</div>");

	this.getHtmlElement().innerHTML = html.toString();
	
	var myView = this;
	Dwt.getDomObj(this.getDocument(), this._bodyDivId).onscroll = function() {
		myView._syncScroll();
	};
	Dwt.getDomObj(this.getDocument(), this._apptBodyDivId)._type = ZmCalBaseView.TYPE_APPTS_DAYGRID;
	Dwt.getDomObj(this.getDocument(), this._bodyHourDivId)._type = ZmCalBaseView.TYPE_HOURS_COL;
	Dwt.getDomObj(this.getDocument(), this._allDayDivId)._type = ZmCalBaseView.TYPE_ALL_DAY;
	this._scrollTo8AM();
}

ZmCalColView.prototype._computeMaxCols =
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
ZmCalColView.prototype._computeApptLayout =
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
			if (ao.isOverlapping(layout.appt, this._scheduleMode)) {
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
}

/*
 * add a new all day appt row layout slot and return it
 */
ZmCalColView.prototype._addAllDayApptRowLayout =
function() {
	var data = [];
	var num = this._columns.length;
	for (var i=0; i < num; i++) {
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
ZmCalColView.prototype._fillAllDaySlot = 
function(row, colIndex, data) {
	for (var j=0; j < data.numDays; j++) {
		row[colIndex+j].data = j==0 ? data : null;
		row[colIndex+j].free = false;
	}
}

/**
 * find a slot and fill it in, adding new rows if needed
 */
ZmCalColView.prototype._findAllDaySlot = 
function(colIndex, data) {
	var rows = this._allDayApptsRowLayouts;
	var row = null;
	for (var i=0; i < rows.length; i++) {
		row = rows[i];
		for (var j=0; j < data.numDays; j++) {
			if (!row[colIndex+j].free) {
				row = null;
				break;
			}
		}
		if (row != null)	break;
	}
	if (row == null)
		row = this._addAllDayApptRowLayout();

	this._fillAllDaySlot(row, colIndex, data);	
}

/*
 * compute layout info for all day appts
 */
ZmCalColView.prototype._computeAllDayApptLayout =
function() {
	var adlist = this._allDayApptsList;
	adlist.sort(ZmAppt.compareByTimeAndDuration);
	
	for (var i=0; i < adlist.length; i++) {
		var appt = adlist[i];
		var data = this._allDayAppts[appt.getUniqueId()];
		if (data) {
			var col = this._scheduleMode ? this._getColForFolderId(data.appt.getFolderId()) : this._getDayForDate(new Date(data.startTime));
			if (col)	 this._findAllDaySlot(col.index, data);			
		}
	}
}

ZmCalColView.prototype._layoutAllDayAppts =
function() {
	var rows = this._allDayApptsRowLayouts;
	if (!rows) return;
	
	var doc = this.getDocument();
	var rowY = ZmCalColView._ALL_DAY_APPT_HEIGHT_PAD + 2;
	for (var i=0; i < rows.length; i++) {
		var row = rows[i];
		var num = this._scheduleMode ? this._numCalendars : this.getNumDays();
		for (var j=0; j < num; j++) {
			var slot = row[j];
			if (slot.data) {
				var appt = slot.data.appt;
				var div = Dwt.getDomObj(doc, this._getItemId(appt));
				if (this._scheduleMode) {
					var cal= this._getColForFolderId(appt.getFolderId());
					this._positionAppt(div, cal.allDayX+0, rowY);
					this._sizeAppt(div, cal.allDayWidth * slot.data.numDays - this._daySepWidth - 1,
								 ZmCalColView._ALL_DAY_APPT_HEIGHT);
				 } else {
					this._positionAppt(div, this._columns[j].allDayX+0, rowY);
					this._sizeAppt(div, this._columns[j].allDayWidth * slot.data.numDays - this._daySepWidth - 1,
								 ZmCalColView._ALL_DAY_APPT_HEIGHT);
				 }
				 
			}
		}
		rowY += ZmCalColView._ALL_DAY_APPT_HEIGHT + ZmCalColView._ALL_DAY_APPT_HEIGHT_PAD;
	}
}

ZmCalColView._getApptWidthPercent = 
function(numCols) {
	switch(numCols) {
		case 1: return 1;
		case 2: return 0.8;
		case 3: return 0.6;
		case 4: return 0.4;
		default: return 0.4;
	}
}

ZmCalColView.prototype._positionAppt =
function(apptDiv, x, y) {
	// position overall div
	Dwt.setLocation(apptDiv, x + ZmCalColView._APPT_X_FUDGE, y + ZmCalColView._APPT_Y_FUDGE);
}

ZmCalColView.prototype._sizeAppt =
function(apptDiv, w, h) {
	// set outer as well as inner
	var fw =	 w + ZmCalColView._APPT_WIDTH_FUDGE; // no fudge for you
	var fh = h;
	Dwt.setSize(	apptDiv,	fw >= 0 ? fw : 0, fh >= 0 ? fh : 0);

	// get the inner div that should be sized and set its width/height
	var apptBodyDiv = Dwt.getDomObj(this.getDocument(), apptDiv.id + "_body");
	fw = w + ZmCalColView._APPT_WIDTH_FUDGE;
	fh = h + ZmCalColView._APPT_HEIGHT_FUDGE;
	Dwt.setSize(	apptBodyDiv, fw >= 0 ? fw : 0, fh >= 0 ? fh : 0);
}

ZmCalColView.prototype._layoutAppt =
function(ao, apptDiv, x, y, w, h) {
	// record to restore after dnd/sash
	if (ao) ao._layout = {x: x, y: y, w: w, h: h};
	this._positionAppt(apptDiv, x, y);
	this._sizeAppt(apptDiv, w, h);
}

ZmCalColView.prototype._layoutAppts =
function() {

	var doc = this.getDocument();
	
	// for starting x and width	
	var data = this._hours[0];

	var doc = this.getDocument();
	for (var i=0; i < this._layouts.length; i++) {
		var layout = this._layouts[i];
		var apptDiv = Dwt.getDomObj(doc, this._getItemId(layout.appt));
		if (apptDiv) {
			layout.bounds = this._getBoundsForAppt(layout.appt);
			var w = Math.floor(layout.bounds.width*ZmCalColView._getApptWidthPercent(layout.maxcol+1));
			var xinc = layout.maxcol ? ((layout.bounds.width - w) / layout.maxcol) : 0; // n-1
			var x = xinc * layout.col + (layout.bounds.x);
			this._layoutAppt(layout.appt, apptDiv, x, layout.bounds.y, w, layout.bounds.height);
		}
	}
}

ZmCalColView.prototype._getDayForDate =
function(d) 
{
	return this._dateToDayIndex[this._dayKey(d)];
}	

ZmCalColView.prototype._getColForFolderId =
function(folderId) 
{
	return this._folderIdToColIndex[folderId];
}	

ZmCalColView.prototype._getColFromX =
function(x) {
	var num = this._columns.length;
	for (var i =0; i < num; i++) {
		var col = this._columns[i];
		if (x >= col.apptX && x <= col.apptX+col.apptWidth) return col;
	}		
	return null;
}

ZmCalColView.prototype._getLocationForDate =
function(d) {
	var h = d.getHours();
	var m = d.getMinutes();
	var day = this._getDayForDate(d);
	if (day == null) return null;
	return new DwtPoint(day.apptX, Math.floor(((h+m/60) * ZmCalColView._HOUR_HEIGHT))+1);
}

ZmCalColView.prototype._getBoundsForAppt =
function(appt) {
	var sd = appt.getStartDate();
	var endOfDay = new Date(sd);
	endOfDay.setHours(23,59,59,999);
	var et = Math.min(appt.getEndTime(), endOfDay.getTime());
	if (this._scheduleMode) 
		return this._getBoundsForCalendar(sd, et - sd.getTime(), appt.getFolderId());
	else
		return this._getBoundsForDate(sd, et - sd.getTime());
}

ZmCalColView.prototype._getBoundsForDate =
function(d, duration, col) {
	var durationMinutes = duration / 1000 / 60;
	var h = d.getHours();
	var m = d.getMinutes();
	if (col == null && !this._scheduleMode) {
		var day = this._getDayForDate(d);
		col = this._columns[day.index];
	}
	if (col == null) return null;
	return new DwtRectangle(col.apptX, ((h+m/60) * ZmCalColView._HOUR_HEIGHT), 
					col.apptWidth, (ZmCalColView._HOUR_HEIGHT / 60) * durationMinutes);
}

ZmCalColView.prototype._getBoundsForCalendar =
function(d, duration, folderId) {
	var durationMinutes = duration / 1000 / 60;
	var h = d.getHours();
	var m = d.getMinutes();
	var col= this._getColForFolderId(folderId);
	if (col == null) return null;
	return new DwtRectangle(col.apptX, ((h+m/60) * ZmCalColView._HOUR_HEIGHT), 
					col.apptWidth, (ZmCalColView._HOUR_HEIGHT / 60) * durationMinutes);
}

ZmCalColView.prototype._getBoundsForAllDayDate =
function(startSnap, endSnap) {
	if (startSnap == null || endSnap == null) return null;
	return new DwtRectangle(startSnap.col.allDayX, 0, 
			(endSnap.col.allDayX + endSnap.col.allDayWidth) - startSnap.col.allDayX - this._daySepWidth-1, 
			ZmCalColView._ALL_DAY_APPT_HEIGHT);
}

// snapXY coord to specified minute boundary (15,30)
// return x, y, col 
ZmCalColView.prototype._snapXY =
function(x, y, snapMinutes, roundUp) {
	// snap it to grid
	var col = this._getColFromX(x);
	if (col == null) return null;
	x = col.apptX;
	var height = (snapMinutes/60) * ZmCalColView._HOUR_HEIGHT;
	y = Math.floor(y/height) * height;
	if (roundUp) y += height;
	return {x:x, y:y, col:col};	
}

// snapXY coord to specified minute boundary (15,30)
// return x, y, col 
ZmCalColView.prototype._snapAllDayXY =
function(x, y) {
	// snap it to grid
	var col = this._getColFromX(x);	
	if (col == null) return null;
	x = col.allDayX;
	return {x:x, y:0, col:col};
}

ZmCalColView.prototype._getDateFromXY =
function(x, y, snapMinutes, roundUp) {
	var col = this._getColFromX(x);
	if (col == null) return null;
	var minutes = Math.floor((y / ZmCalColView._HOUR_HEIGHT) * 60);
	if (snapMinutes != null && snapMinutes > 1)	{
		minutes = Math.floor(minutes/snapMinutes) * snapMinutes;
		if (roundUp) minutes += snapMinutes;
	}
	var day = this._days[col.dayIndex];
	if (day == null) return null;	
	return new Date(day.date.getTime() + (minutes * 60 * 1000));
}

ZmCalColView.prototype._getAllDayDateFromXY =
function(x, y) {
	var col = this._getColFromX(x);
	if (col == null) return null;
	var day = this._days[col.dayIndex];
	if (day == null) return null;
	return new Date(day.date.getTime());
}

// helper function to minimize code and catch errors
ZmCalColView.prototype._setBounds =
function(id, x, y, w, h) {
	var el = Dwt.getDomObj(this.getDocument(), id);
	if (el == null) {
		DBG.println("ZmCalColView._setBounds null element for id: "+id);
	} else {
		Dwt.setBounds(el, x, y, w, h);
	}
}

ZmCalColView.prototype._calcColWidth = 
function(bodyWidth, numCols, horzScroll) {
//	var sbwfudge = (AjxEnv.isIE ? 1 : 0) + (horzScroll ? 0 : ZmCalColView._SCROLLBAR_WIDTH);
	var sbwfudge = 0;
	return dayWidth = Math.floor((bodyWidth-sbwfudge)/numCols) - (this._daySepWidth == 1 ? 0 : 1);
}

ZmCalColView.prototype._calcMinBodyWidth = 
function(width, numCols) {
	//return minWidth = (ZmCalColView.MIN_COLUMN_WIDTH * numCols) + (this._daySepWidth == 1 ? 0 : 1);
	return minWidth = (ZmCalColView.MIN_COLUMN_WIDTH  + (this._daySepWidth == 1 ? 0 : 1)) * numCols;	
}

ZmCalColView.prototype._layout =
function() {
	DBG.println("ZmCalColView in layout!");
	var doc = this.getDocument();

	var numCols = this._columns.length;

	var sz = this.getSize();
	var width = sz.x;
	var height = sz.y;

	if (width == 0 || height == 0) {
		return;
	}

	this._needFirstLayout = false;

	var doc = this.getDocument();

	var hoursWidth = ZmCalColView._HOURS_DIV_WIDTH;
	
	var bodyX = hoursWidth + this._daySepWidth;
	var unionX = bodyX;
	if (this._scheduleMode) {
		bodyX += ZmCalColView._UNION_DIV_WIDTH + this._daySepWidth;
	}

	// compute height for hours/grid
	this._bodyDivWidth = width - bodyX;

	// size appts divs
	this._apptBodyDivHeight = ZmCalColView._DAY_HEIGHT + 1; // extra for midnight to show up
	this._apptBodyDivWidth = Math.max(this._bodyDivWidth, this._calcMinBodyWidth(this._bodyDivWidth, numCols));
	var needHorzScroll = this._apptBodyDivWidth > this._bodyDivWidth;
	

	this._horizontalScrollbar(needHorzScroll);
	var sbwfudge = AjxEnv.isIE ? 1 : 0;
	var dayWidth = this._calcColWidth(this._apptBodyDivWidth - ZmCalColView._SCROLLBAR_WIDTH, numCols);

	if (needHorzScroll) this._apptBodyDivWidth -= 18;
	var scrollFudge = needHorzScroll ? 20 : 0; // need all day to be a little wider then grid

	// year heading
	this._setBounds(this._yearHeadingDivId, 0, 0, hoursWidth, Dwt.DEFAULT);	
		
	// column headings
	var allDayHeadingDiv = Dwt.getDomObj(doc, this._allDayHeadingDivId);
	Dwt.setBounds(allDayHeadingDiv, 0, 0, this._apptBodyDivWidth + scrollFudge, Dwt.DEFAULT);
	var allDayHeadingDivHeight = Dwt.getSize(allDayHeadingDiv).y;
	
	// div for all day appts
	//var allDayDiv = Dwt.getDomObj(doc, this._allDayDivId);
	var numRows = this._allDayApptsRowLayouts ? (this._allDayApptsRowLayouts.length) : 1;	
	if (this._allDayApptsList && this._allDayApptsList.length > 0) numRows++;
	this._allDayDivHeight = (ZmCalColView._ALL_DAY_APPT_HEIGHT+ZmCalColView._ALL_DAY_APPT_HEIGHT_PAD) * numRows + ZmCalColView._ALL_DAY_APPT_HEIGHT_PAD;
	var allDayDivY = allDayHeadingDivHeight;
	this._setBounds(this._allDayDivId, 0, allDayDivY, this._apptBodyDivWidth + scrollFudge, this._allDayDivHeight);
	
	// div under year
	this._setBounds(this._yearAllDayDivId, 0, allDayDivY, hoursWidth, this._allDayDivHeight);	

	// all day scroll
	var allDayScrollHeight = allDayDivY + this._allDayDivHeight;
	this._setBounds(this._allDayScrollDivId, bodyX, 0, this._bodyDivWidth, allDayScrollHeight);	

	// vert sep between year and all day headings
	this._setBounds(this._leftAllDaySepDivId, hoursWidth, 0, this._daySepWidth, allDayScrollHeight);		
	
	// horiz separator between all day appts and grid
	this._setBounds(this._allDaySepDivId, 0, allDayScrollHeight, width, ZmCalColView._ALL_DAY_SEP_HEIGHT);	

	var bodyY = allDayScrollHeight + ZmCalColView._ALL_DAY_SEP_HEIGHT +  (AjxEnv.isIE ? 0 : 2);

	this._bodyDivHeight = height - bodyY;

	// hours
	this._setBounds(this._hoursScrollDivId, 0, bodyY, hoursWidth, this._bodyDivHeight);	

	// vert sep between hours and grid
	this._setBounds(this._leftApptSepDivId, hoursWidth, bodyY, this._daySepWidth, ZmCalColView._DAY_HEIGHT);	

	// div for scrolling grid	
	this._setBounds(this._bodyDivId, bodyX, bodyY, this._bodyDivWidth, this._bodyDivHeight);	

	this._setBounds(this._apptBodyDivId, 0, -1, this._apptBodyDivWidth, this._apptBodyDivHeight);

	if (this._scheduleMode) {
		//heading
		this._setBounds(this._unionHeadingDivId, unionX, 0, ZmCalColView._UNION_DIV_WIDTH, Dwt.DEFAULT);
				
		//div under heading
		this._setBounds(this._unionAllDayDivId, unionX, allDayDivY, ZmCalColView._UNION_DIV_WIDTH, this._allDayDivHeight);		

		// sep in all day area
		var unionSepX = unionX + ZmCalColView._UNION_DIV_WIDTH;
		this._setBounds(this._unionHeadingSepDivId, unionSepX, 0, this._daySepWidth, allDayScrollHeight);		

		// div for scrolling union
		this._setBounds(this._unionGridScrollDivId, unionX, bodyY, ZmCalColView._UNION_DIV_WIDTH, this._bodyDivHeight);		
		this._setBounds(this._unionGridDivId, 0, -1, ZmCalColView._UNION_DIV_WIDTH, this._apptBodyDivHeight+ZmCalColView._HOUR_HEIGHT);		

		// sep in grid area
		this._setBounds(this._unionGridSepDivId, unionSepX, bodyY, this._daySepWidth, this._apptBodyDivHeight);		
	}

	var currentX = 0;
	
	for (var i = 0; i < numCols; i++) {
		var col = this._columns[i];
			
		// position day heading
		var day = this._days[col.dayIndex];
		//this._setBounds(col.titleId, currentX+1, Dwt.DEFAULT, dayWidth-2, ZmCalColView._DAY_HEADING_HEIGHT-2);
		this._setBounds(col.titleId, currentX+1, Dwt.DEFAULT, dayWidth, ZmCalColView._DAY_HEADING_HEIGHT);
		col.apptX = currentX + 2 ; //ZZZ
		col.apptWidth = dayWidth - this._daySepWidth - 3;  //ZZZZ
		col.allDayX = col.apptX;
		col.allDayWidth = dayWidth; // doesn't include sep
		currentX += dayWidth;

		this._setBounds(col.headingDaySepDivId, currentX, 0, this._daySepWidth, allDayHeadingDivHeight + this._allDayDivHeight);
		this._setBounds(col.daySepDivId, currentX, 0, this._daySepWidth, this._apptBodyDivHeight);
		currentX += this._daySepWidth;
	}	

	this._layoutAllDayAppts();
	this._layoutAppts();

	this._apptBodyDivOffset = Dwt.toWindow(Dwt.getDomObj(doc, this._apptBodyDivId), 0, 0, null);

	if (this._scheduleMode) {
		this._layoutUnionData();
	}
}

ZmCalColView.prototype._getUnionToolTip =
function(i) {
	// cache it...
	var tooltip = this._unionBusyDataToolTip[i];
	if (tooltip) return tooltip;
	
	var data = this._unionBusyData[i];
	if (!data instanceof Object) return null;
	
	var html = new AjxBuffer();
	html.append("<table cellpadding=2 cellspacing=0 border=0>");
	var checkedCals = this._calController.getCheckedCalendarFolderIds();
	for (var i=0; i < checkedCals.length; i++) {
		var fid = checkedCals[i];
		if (data[fid]) {
			var cal = this._calController.getCalendar(fid);
			if (cal) {
				var color = ZmCalBaseView.COLORS[cal.color];
				html.append("<tr valign='center' class='", color, "Bg'><td>", AjxImg.getImageHtml(cal.getIcon()), "</td>");
				html.append("<td>", AjxStringUtil.htmlEncode(cal.getName()), "</td></tr>");
			}
		}
	}
	html.append("</table>");
	tooltip = this._unionBusyDataToolTip[i] = html.toString();
	return tooltip;
}
		
ZmCalColView.prototype._layoutUnionDataDiv =
function(doc, gridEl, allDayEl, i, data, numCols) {
	var enable = data instanceof Object;
	var id = this._unionBusyDivIds[i];
	var divEl = null;

//	DBG.println(i + ": "+enable);	
	if (id == null) {
//		DBG.println(i + ": done ID is null");
		if (!enable) return;
		id = this._unionBusyDivIds[i] = Dwt.getNextId();
		var divEl = doc.createElement("div");
		divEl.style.position = 'absolute';
		divEl.className = "calendar_sched_union_div";
		divEl.id = id;
		divEl._type = ZmCalBaseView.TYPE_SCHED_FREEBUSY;
		divEl._index = i;

		//ZmCalColView._setOpacity(divEl, (i/48)*80);
		ZmCalColView._setOpacity(divEl, 40);

		if (i == 48) {
			//have to resize every layout, since all day div height might change
			allDayEl.appendChild(divEl);
		} else {
			// position/size once right here!		
			Dwt.setBounds(divEl, 2, ZmCalColView._HALF_HOUR_HEIGHT*i+1, ZmCalColView._UNION_DIV_WIDTH-4 , ZmCalColView._HALF_HOUR_HEIGHT-2);
			gridEl.appendChild(divEl);			
		}

	} else {
		divEl =  Dwt.getDomObj(doc, id);
	}
	// have to relayout each time
	if (i == 48)	Dwt.setBounds(divEl, 1, 1, ZmCalColView._UNION_DIV_WIDTH-2, this._allDayDivHeight-2);


	var num = 0;
	for (var key in data) num++;
	//divEl.innerHTML = num;
		
	ZmCalColView._setOpacity(divEl, 20 + (60 * (num/numCols)));
		
	Dwt.setVisibility(divEl, enable);
}

ZmCalColView.prototype._layoutUnionData =
function() {
	if (!this._unionBusyData) return;
	var doc = this.getDocument();
	var gridEl = Dwt.getDomObj(doc, this._unionGridDivId);
	var allDayEl = Dwt.getDomObj(doc, this._unionAllDayDivId);	
	var numCols = this._columns.length;
	for (var i=0; i < 49; i++) {
		this._layoutUnionDataDiv(doc, gridEl, allDayEl, i, this._unionBusyData[i], numCols);
	}
}

ZmCalColView.prototype._handleApptScrollRegion =
function(docX, docY, incr) {
	var offset = 0;
	var upper = docY < this._apptBodyDivOffset.y;
	var lower = docY > this._apptBodyDivOffset.y+this._bodyDivHeight;
	
	if (upper || lower) {
		var div = Dwt.getDomObj(this.getDocument(), this._bodyDivId);
		var sTop = div.scrollTop;
		if (upper && sTop > 0) {
			offset = -(sTop > incr ? incr : sTop);
		} else if (lower) {
			var sVisibleTop = this._apptBodyDivHeight - this._bodyDivHeight;
			if (sTop < sVisibleTop) {
				var spaceLeft = sVisibleTop - sTop;
				offset = spaceLeft  > incr ?incr : spaceLeft;
			}
		}
		if (offset != 0)	div.scrollTop += offset;
	}
	return offset;
}

ZmCalColView.prototype._controlListener =
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

ZmCalColView.prototype._apptSelected =
function() {
	//
}

ZmCalColView._ondblclickHandler =
function (ev){
	ev = DwtUiEvent.getEvent(ev);
	ev._isDblClick = true;
	ZmCalColView._onclickHandler(ev);
};

ZmCalColView.prototype._mouseOverAction =
function(ev, div) {
	ZmCalBaseView.prototype._mouseOverAction.call(this, ev, div);
	if (div._type == ZmCalBaseView.TYPE_DAY_HEADER) {
		div.style.textDecoration = "underline";
	} else if (div._type == ZmCalBaseView.TYPE_SCHED_FREEBUSY) {
		this.setToolTipContent(this._getUnionToolTip(div._index));
	}
}

ZmCalColView.prototype._mouseOutAction =
function(ev, div) {
	ZmCalBaseView.prototype._mouseOutAction.call(this, ev, div);
	if (div._type == ZmCalBaseView.TYPE_DAY_HEADER) {
		div.style.textDecoration = "none";
	} else if (div._type == ZmCalBaseView.TYPE_SCHED_FREEBUSY) {
		this.setToolTipContent(null);
	}
}

ZmCalColView.prototype._mouseUpAction =
function(ev, div) {
	ZmCalBaseView.prototype._mouseUpAction.call(this, ev, div);
	if (div._type == ZmCalBaseView.TYPE_DAY_HEADER && !this._scheduleMode) {
		var date = this._days[div._dayIndex].date;
		var cc = this._appCtxt.getAppController().getApp(ZmZimbraMail.CALENDAR_APP).getCalController();

		if (this.getNumDays() > 1) {
			cc.setDate(date);
			cc.show(ZmCalViewMgr.DAY_VIEW);
		} else {
			// TODO: use pref for work week
			if (date.getDay() > 0 && date.getDay() < 6)
				cc.show(ZmCalViewMgr.WORK_WEEK_VIEW);
			else
				cc.show(ZmCalViewMgr.WEEK_VIEW);			
		}
	}	
}

ZmCalColView.prototype._doubleClickAction =
function(ev, div) {
	ZmCalBaseView.prototype._doubleClickAction.call(this, ev, div);
	if (div._type == ZmCalBaseView.TYPE_APPTS_DAYGRID || div._type == ZmCalBaseView.TYPE_ALL_DAY) {
		this._timeSelectionAction(ev, div, true);
	}
}

ZmCalColView.prototype._timeSelectionAction =
function(ev, div, dblclick) {
	
	var date;
	var 	duration = AjxDateUtil.MSEC_PER_HALF_HOUR;
	var isAllDay = false;
	switch (div._type) {
		case ZmCalBaseView.TYPE_APPTS_DAYGRID:
			var gridLoc = Dwt.toWindow(ev.target, ev.elementX, ev.elementY, div);
			var date = this._getDateFromXY(gridLoc.x, gridLoc.y, 30);
			if (date == null) return false;
			break;
		case ZmCalBaseView.TYPE_ALL_DAY:
			var gridLoc = Dwt.toWindow(ev.target, ev.elementX, ev.elementY, div);
			var date = this._getAllDayDateFromXY(gridLoc.x, gridLoc.y);
			if (date == null) return false;
			isAllDay = true;
			break;			
		default:
			return;
	}
	//this._timeSelectionEvent(date, (dblclick ? 60 : 30) * 60 * 1000, dblclick);	
	this._timeSelectionEvent(date, duration, dblclick, isAllDay);
}

ZmCalColView.prototype._mouseDownAction = 
function(ev, div) {
	//ZmCalBaseView.prototype._mouseDownAction.call(this, ev, div);
	switch (div._type) {
		case	 ZmCalBaseView.TYPE_APPT_BOTTOM_SASH:
		case	 ZmCalBaseView.TYPE_APPT_TOP_SASH:
			//DBG.println("_mouseDownAction for SASH!");
			this.setToolTipContent(null);			
			return this._sashMouseDownAction(ev, div);
			break;
		case ZmCalBaseView.TYPE_APPT:
			this.setToolTipContent(null);		
			return this._apptMouseDownAction(ev, div);
			break;
		case ZmCalBaseView.TYPE_HOURS_COL:
			if (ev.button == DwtMouseEvent.LEFT) {
				var gridLoc = AjxEnv.isIE ? Dwt.toWindow(ev.target, ev.elementX, ev.elementY, div) : {x: ev.elementX, y: ev.elementY};
				var fakeLoc = this._getLocationForDate(this.getDate());
				if (fakeLoc) {
					gridLoc.x = fakeLoc.x;
					var gridDiv = Dwt.getDomObj(this.getDocument(), this._apptBodyDivId);
					return this._gridMouseDownAction(ev, gridDiv, gridLoc);
				}
			} else if (ev.button == DwtMouseEvent.RIGHT) {
				DwtUiEvent.copy(this._actionEv, ev);
				this._actionEv.item = this;
				this._evtMgr.notifyListeners(ZmCalBaseView.VIEW_ACTION, this._actionEv);	
			}
			break;
		case ZmCalBaseView.TYPE_APPTS_DAYGRID:
			this._timeSelectionAction(ev, div, false);
			if (ev.button == DwtMouseEvent.LEFT) {
				// save grid location here, since timeSelection might move the time selection div
				var gridLoc = Dwt.toWindow(ev.target, ev.elementX, ev.elementY, div);
				return this._gridMouseDownAction(ev, div, gridLoc);
			} else if (ev.button == DwtMouseEvent.RIGHT) {
				DwtUiEvent.copy(this._actionEv, ev);
				this._actionEv.item = this;
				this._evtMgr.notifyListeners(ZmCalBaseView.VIEW_ACTION, this._actionEv);
			}
			break;
		case ZmCalBaseView.TYPE_ALL_DAY:
			this._timeSelectionAction(ev, div, false);
			if (ev.button == DwtMouseEvent.LEFT) {
				var gridLoc = Dwt.toWindow(ev.target, ev.elementX, ev.elementY, div);
				return this._gridMouseDownAction(ev, div, gridLoc, true);				
			} else if (ev.button == DwtMouseEvent.RIGHT) {
				DwtUiEvent.copy(this._actionEv, ev);
				this._actionEv.item = this;
				this._evtMgr.notifyListeners(ZmCalBaseView.VIEW_ACTION, this._actionEv);
			}
			break;
			
	}
	return false;
}

// BEGIN APPT ACTION HANDLERS

ZmCalColView.prototype._apptMouseDownAction =
function(ev, apptEl) {
	if (ev.button != DwtMouseEvent.LEFT) {
		return false;
	}

	var doc = this.getDocument();
	var appt = AjxCore.objectWithId(apptEl._itemIndex);
	if (appt.isReadOnly() || appt.isAllDayEvent() || (appt._fanoutNum > 0)) return false;
	
	var apptOffset = Dwt.toWindow(ev.target, ev.elementX, ev.elementY, apptEl);

	var data = { 
		dndStarted: false,
		appt: appt, 
		view: this,
		apptEl: apptEl, 
		apptOffset: apptOffset,
		docX: ev.docX,
		docY: ev.docY
	};

	var capture = new DwtMouseEventCapture	(data,
			ZmCalColView._emptyHdlr, // mouse over
			ZmCalColView._emptyHdlr, // mouse down (already handled by action)
			ZmCalColView._apptMouseMoveHdlr, 
			ZmCalColView._apptMouseUpHdlr, 
			ZmCalColView._emptyHdlr, // mouse out
			true);
	capture.capture();
	return false;	
}

// called when DND is confirmed after threshold
ZmCalColView.prototype._apptDndBegin =
function(data) {

	var doc = this.getDocument();
	var loc = Dwt.getLocation(data.apptEl);
	data.apptX = loc.x;
	data.apptY = loc.y;
	data.apptsDiv = Dwt.getDomObj(doc, this._apptBodyDivId);
	data.bodyDivEl = Dwt.getDomObj(this.getDocument(), this._bodyDivId);
	data.apptBodyEl = Dwt.getDomObj(this.getDocument(), data.apptEl.id + "_body");	
	data.snap = this._snapXY(data.apptX + data.apptOffset.x, data.apptY, 30); 	// get orig grid snap
	if (data.snap == null) return false;
	data.startDate = new Date(data.appt.getStartTime());
	data.startTimeEl = Dwt.getDomObj(doc, data.apptEl.id +"_st");
	data.endTimeEl = Dwt.getDomObj(doc, data.apptEl.id +"_et");
	data.layout = data.appt._layout; // record original layout
			
	data.bodyDivEl.style.cursor = 'move';	
	this.deselectAll();
	this.setSelection(data.appt);
	ZmCalColView._setOpacity(data.apptEl, ZmCalColView._OPACITY_APPT_DND);
	data.dndStarted = true;
	return true;
}

ZmCalColView._apptMouseMoveHdlr =
function(ev) {

	var mouseEv = DwtShell.mouseEvent;
	mouseEv.setFromDhtmlEvent(ev);	
	var data = DwtMouseEventCapture.getTargetObj();

	var deltaX = mouseEv.docX - data.docX;
	var deltaY = mouseEv.docY - data.docY;

	if (!data.dndStarted) {
		var withinThreshold =  (Math.abs(deltaX) < ZmCalColView.DRAG_THRESHOLD && Math.abs(deltaY) < ZmCalColView.DRAG_THRESHOLD);
		if (withinThreshold || !data.view._apptDndBegin(data)) {
			mouseEv._stopPropagation = true;
			mouseEv._returnValue = false;
			mouseEv.setToDhtmlEvent(ev);
			return false;
		}
	}

	var scrollOffset = data.view._handleApptScrollRegion(mouseEv.docX, mouseEv.docY, ZmCalColView._HOUR_HEIGHT);
	if (scrollOffset != 0) {
		data.docY -= scrollOffset;	
		deltaY += scrollOffset;
	}

	// snap new location to grid
	var snap = data.view._snapXY(data.apptX + data.apptOffset.x + deltaX, data.apptY + deltaY, 30);
	//DBG.println("mouseMove new snap: "+snap.x+","+snap.y+ " data snap: "+data.snap.x+","+data.snap.y);
	if (snap != null && (snap.x != data.snap.x || snap.y != data.snap.y)) {
		var newDate = data.view._getDateFromXY(snap.x, snap.y, 30);
		//DBG.println("new Date = "+newDate);
		if (newDate != null && 
			(!(data.view._scheduleMode && snap.col != data.snap.col)) && // don't allow col moves in sched view
			newDate.getTime() != data.startDate.getTime()) {
			var bounds = data.view._getBoundsForDate(newDate, data.appt._orig.getDuration(), snap.col);
			data.view._layoutAppt(null, data.apptEl, bounds.x, bounds.y, bounds.width, bounds.height);
			data.startDate = newDate;
			data.snap = snap;
			if (data.startTimeEl) data.startTimeEl.innerHTML = ZmAppt._getTTHour(data.startDate);
			if (data.endTimeEl) data.endTimeEl.innerHTML = ZmAppt._getTTHour(new Date(data.startDate.getTime()+data.appt.getDuration()));
		}
	}
	mouseEv._stopPropagation = true;
	mouseEv._returnValue = false;
	mouseEv.setToDhtmlEvent(ev);
	return false;	
}

ZmCalColView._apptMouseUpHdlr =
function(ev) {
//	DBG.println("ZmCalColView._sashMouseUpHdlr");
	var data = DwtMouseEventCapture.getTargetObj();
	ZmCalColView._setApptOpacity(data.appt, data.apptEl);	
	var mouseEv = DwtShell.mouseEvent;
	mouseEv.setFromDhtmlEvent(ev);	

	DwtMouseEventCapture.getCaptureObj().release();
	
	if (data.dndStarted) {
		data.bodyDivEl.style.cursor = 'auto';
		if (data.startDate.getTime() != data.appt.getStartTime()) {
			// save before we muck with start/end dates
			var origDuration = data.appt._orig.getDuration();
			data.view._autoScrollDisabled = true;			
			var cc = data.view._appCtxt.getAppController().getApp(ZmZimbraMail.CALENDAR_APP).getCalController();
			var endDate = new Date(data.startDate.getTime() + origDuration);
			var errorCallback = new AjxCallback(null, ZmCalColView._handleError, data);
			cc.updateApptDate(data.appt._orig, data.startDate, endDate, false, null, errorCallback);
		} else {
			ZmCalColView._restoreLayout(data);
		}
	}

	mouseEv._stopPropagation = true;
	mouseEv._returnValue = false;
	mouseEv.setToDhtmlEvent(ev);
	
	return false;	
}

// END APPT ACTION HANDLERS

// BEGIN SASH ACTION HANDLERS

ZmCalColView.prototype._sashMouseDownAction =
function(ev, sash) {
//	DBG.println("ZmCalColView._sashMouseDownHdlr");
	if (ev.button != DwtMouseEvent.LEFT) {
		return false;
	}

	var apptEl = sash.parentNode;
	var apptBodyEl = Dwt.getDomObj(this.getDocument(), apptEl.id + "_body");	

	var appt = AjxCore.objectWithId(apptEl._itemIndex);
	var origHeight = Dwt.getSize(apptBodyEl).y;
	var origLoc = Dwt.getLocation(apptEl);
	var parentOrigHeight = Dwt.getSize(apptEl).y;	
	var isTop = sash._type == ZmCalBaseView.TYPE_APPT_TOP_SASH;
	var data = { 
		sash: sash,
		isTop: isTop,
		appt:appt, 
		view:this,
		apptEl: apptEl, 
		endTimeEl: Dwt.getDomObj(this.getDocument(), apptEl.id +"_et"),
		startTimeEl: Dwt.getDomObj(this.getDocument(), apptEl.id +"_st"),		
		apptBodyEl: apptBodyEl,
		origHeight: origHeight,
		apptX: origLoc.x,
		apptY: origLoc.y,
		parentOrigHeight: parentOrigHeight,		
		startY: ev.docY
	};

	if (isTop) data.startDate = new Date(appt.getStartTime());
	else data.endDate = new Date(appt.getEndTime());
	
	//TODO: only create one of these and change data each time...
	var capture = new DwtMouseEventCapture	(data,
			ZmCalColView._emptyHdlr, // mouse over
			ZmCalColView._emptyHdlr, // mouse down (already handled by action)
			ZmCalColView._sashMouseMoveHdlr, 
			ZmCalColView._sashMouseUpHdlr, 
			ZmCalColView._emptyHdlr, // mouse out
			true);
	capture.capture();
	this.deselectAll();
	this.setSelection(data.appt);
	ZmCalColView._setOpacity(apptEl, ZmCalColView._OPACITY_APPT_DND);
	return false;	
}

ZmCalColView._sashMouseMoveHdlr =
function(ev) {
//	DBG.println("ZmCalColView._sashMouseMoveHdlr");
	var mouseEv = DwtShell.mouseEvent;
	mouseEv.setFromDhtmlEvent(ev);	
	var delta = 0;
	var data = DwtMouseEventCapture.getTargetObj();

	if (mouseEv.docY > 0 && mouseEv.docY != data.startY)
		delta = mouseEv.docY - data.startY;

	var scrollOffset = data.view._handleApptScrollRegion(mouseEv.docX, mouseEv.docY, ZmCalColView._HOUR_HEIGHT);
	if (scrollOffset != 0) {
		data.startY -= scrollOffset;	
		deltaY += scrollOffset;
	}

	var delta15 = Math.floor(delta/ZmCalColView._15_MINUTE_HEIGHT);
	delta = delta15 * ZmCalColView._15_MINUTE_HEIGHT;

	if (delta != data.lastDelta) {
		if (data.isTop) {
			var newY = data.apptY + delta;
			var newHeight = data.origHeight - delta;
			if (newHeight >= ZmCalColView._15_MINUTE_HEIGHT) {
				Dwt.setLocation(data.apptEl, Dwt.DEFAULT, newY);
				Dwt.setSize(data.apptEl, Dwt.DEFAULT, data.parentOrigHeight - delta);				
				Dwt.setSize(data.apptBodyEl, Dwt.DEFAULT, Math.floor(newHeight));
				data.lastDelta = delta;
				data.startDate.setTime(data.appt.getStartTime() + (delta15 * AjxDateUtil.MSEC_PER_FIFTEEN_MINUTES)); // num msecs in 15 minutes
				if (data.startTimeEl) data.startTimeEl.innerHTML = ZmAppt._getTTHour(data.startDate);
			}
		} else {
			var newHeight = data.origHeight + delta;
			if (newHeight >= ZmCalColView._15_MINUTE_HEIGHT) {
				var parentNewHeight = data.parentOrigHeight + delta;			
//			DBG.println("delta = " + delta);
				Dwt.setSize(data.apptEl, Dwt.DEFAULT, parentNewHeight);
				Dwt.setSize(data.apptBodyEl, Dwt.DEFAULT, newHeight + ZmCalColView._APPT_HEIGHT_FUDGE);

				data.lastDelta = delta;
				data.endDate.setTime(data.appt.getEndTime() + (delta15 * AjxDateUtil.MSEC_PER_FIFTEEN_MINUTES)); // num msecs in 15 minutes
				if (data.endTimeEl) data.endTimeEl.innerHTML = ZmAppt._getTTHour(data.endDate);
			}
		}
	}

	mouseEv._stopPropagation = true;
	mouseEv._returnValue = false;
	mouseEv.setToDhtmlEvent(ev);
	return false;	
}

ZmCalColView._sashMouseUpHdlr =
function(ev) {
//	DBG.println("ZmCalColView._sashMouseUpHdlr");
	var data = DwtMouseEventCapture.getTargetObj();
	ZmCalColView._setApptOpacity(data.appt, data.apptEl);	
	var mouseEv = DwtShell.mouseEvent;
	mouseEv.setFromDhtmlEvent(ev);	
	if (mouseEv.button != DwtMouseEvent.LEFT) {
		DwtUiEvent.setBehaviour(ev, true, false);
		return false;
	}
	
	DwtMouseEventCapture.getCaptureObj().release();

	//data.sash.innerHTML = "";
//	data.sash.className = 'appt_sash';
	mouseEv._stopPropagation = true;
	mouseEv._returnValue = false;
	mouseEv.setToDhtmlEvent(ev);

	var needUpdate = false;
	var startDate = null, endDate = null;
	if (data.isTop && data.startDate.getTime() != data.appt.getStartTime()) {
		needUpdate = true;
		startDate = data.startDate;
	} else if (!data.isTop && data.endDate.getTime() != data.appt.getEndTime()) {
		needUpdate = true;
		endDate = data.endDate;
	}
	if (needUpdate) {
		data.view._autoScrollDisabled = true;
		var cc = data.view._appCtxt.getAppController().getApp(ZmZimbraMail.CALENDAR_APP).getCalController();
		var errorCallback = new AjxCallback(null, ZmCalColView._handleError, data);
		cc.updateApptDate(data.appt._orig, startDate, endDate, false, null, errorCallback);
	}
}

// END SASH ACTION HANDLERS


// BEGIN GRID ACTION HANDLERS

ZmCalColView.prototype._gridMouseDownAction =
function(ev, gridEl, gridLoc, isAllDay) {
	if (ev.button != DwtMouseEvent.LEFT) {
		return false;
	}

	//DBG.println("gridLoc: "+gridLoc.x+","+gridLoc.y);

	//var gridLoc = Dwt.toWindow(ev.target, ev.elementX, ev.elementY, gridEl);

	var data = { 
		dndStarted: false,
		view: this,
		gridEl: gridEl, 
		gridX: gridLoc.x, // ev.elementX,
		gridY: gridLoc.y,  //ev.elementY,
		docX: ev.docX,
		docY: ev.docY,
		isAllDay: isAllDay
	};

	var capture = new DwtMouseEventCapture	(data,
			ZmCalColView._emptyHdlr, // mouse over
			ZmCalColView._emptyHdlr, // mouse down (already handled by action)
			isAllDay? ZmCalColView._gridAllDayMouseMoveHdlr : ZmCalColView._gridMouseMoveHdlr,
			ZmCalColView._gridMouseUpHdlr, 
			ZmCalColView._emptyHdlr, // mouse out
			true);
	capture.capture();
	return false;	
}

// called when DND is confirmed after threshold
ZmCalColView.prototype._gridDndBegin =
function(data) {
	var col = data.view._getColFromX(data.gridX);
	data.folderId = col ? (col.cal ? col.cal.id : null) : null;

	if (data.isAllDay) {
		data.gridEl.style.cursor = 'e-resize';	
		data.newApptDivEl = Dwt.getDomObj(data.view.getDocument(), data.view._newAllDayApptDivId);
		data.view._populateNewApptHtml(data.newApptDivEl, true, data.folderId);		
		data.apptBodyEl = Dwt.getDomObj(data.view.getDocument(), data.newApptDivEl.id + "_body");	
	} else {
		data.gridEl.style.cursor = 's-resize';	
		data.newApptDivEl = Dwt.getDomObj(data.view.getDocument(), data.view._newApptDivId);
		data.view._populateNewApptHtml(data.newApptDivEl, false, data.folderId);
		data.apptBodyEl = Dwt.getDomObj(data.view.getDocument(), data.newApptDivEl.id + "_body");
		data.endTimeEl = Dwt.getDomObj(this.getDocument(), data.newApptDivEl.id +"_et");
		data.startTimeEl = Dwt.getDomObj(this.getDocument(), data.newApptDivEl.id +"_st");
	}
	this.deselectAll();
	return true;
}

ZmCalColView._gridMouseMoveHdlr =
function(ev) {

	var mouseEv = DwtShell.mouseEvent;
	mouseEv.setFromDhtmlEvent(ev);	
	var data = DwtMouseEventCapture.getTargetObj();

	var deltaX = mouseEv.docX - data.docX;
	var deltaY = mouseEv.docY - data.docY;

	if (!data.dndStarted) {
		var withinThreshold =  (Math.abs(deltaX) < ZmCalColView.DRAG_THRESHOLD && Math.abs(deltaY) < ZmCalColView.DRAG_THRESHOLD);
		if (withinThreshold || !data.view._gridDndBegin(data)) {
			mouseEv._stopPropagation = true;
			mouseEv._returnValue = false;
			mouseEv.setToDhtmlEvent(ev);
			return false;
		}
	}

	var scrollOffset = data.view._handleApptScrollRegion(mouseEv.docX, mouseEv.docY, ZmCalColView._HOUR_HEIGHT);
	if (scrollOffset != 0) {
		data.docY -= scrollOffset;	
		deltaY += scrollOffset;
	}

	// snap new location to grid
	var snap = data.view._snapXY(data.gridX + deltaX, data.gridY + deltaY, 30);
	if (snap == null) return false;
	
	var newStart, newEnd;

	if (deltaY >= 0) { // dragging down
		newStart = data.view._snapXY(data.gridX, data.gridY, 30);
		newEnd = data.view._snapXY(data.gridX, data.gridY + deltaY, 30, true);
	} else { // dragging up
		newEnd = data.view._snapXY(data.gridX, data.gridY, 30);
		newStart = data.view._snapXY(data.gridX, data.gridY + deltaY, 30);
	}

	if (newStart == null || newEnd == null) return false;

	if ((data.start == null) || (data.start.y != newStart.y) || (data.end.y != newEnd.y)) {

		if (!data.dndStarted) data.dndStarted = true;

		data.start = newStart;
		data.end = newEnd;
		
		data.startDate = data.view._getDateFromXY(data.start.x, data.start.y, 30, false);
		data.endDate = data.view._getDateFromXY(data.end.x, data.end.y, 30, false);

		var e = data.newApptDivEl;
		if (!e) return;
		var duration = (data.endDate.getTime() - data.startDate.getTime());
		if (duration < AjxDateUtil.MSEC_PER_HALF_HOUR) duration = AjxDateUtil.MSEC_PER_HALF_HOUR;

		var bounds = data.view._getBoundsForDate(data.startDate, duration, newStart.col);
		if (bounds == null) return false;
		data.view._layoutAppt(null, e, newStart.x, newStart.y, bounds.width, bounds.height);
		Dwt.setVisible(e, true);
		if (data.startTimeEl) data.startTimeEl.innerHTML = ZmAppt._getTTHour(data.startDate);
		if (data.endTimeEl) data.endTimeEl.innerHTML = ZmAppt._getTTHour(data.endDate);
	}
	mouseEv._stopPropagation = true;
	mouseEv._returnValue = false;
	mouseEv.setToDhtmlEvent(ev);
	return false;	
}

ZmCalColView._gridMouseUpHdlr =
function(ev) {
//	DBG.println("ZmCalColView._sashMouseUpHdlr");
	var data = DwtMouseEventCapture.getTargetObj();
	//ZmCalColView._setApptOpacity(data.appt, data.apptEl);	
	var mouseEv = DwtShell.mouseEvent;
	mouseEv.setFromDhtmlEvent(ev);	

	DwtMouseEventCapture.getCaptureObj().release();
	
	if (data.dndStarted) {
		data.gridEl.style.cursor = 'auto';
		Dwt.setVisible(data.newApptDivEl, false);		
		if (data.isAllDay) {
			data.view._appCtxt.getAppController().getApp(ZmZimbraMail.CALENDAR_APP).getCalController().newAllDayAppointmentHelper(data.startDate, data.endDate, data.folderId);		
		} else {
			var duration = (data.endDate.getTime() - data.startDate.getTime());
			if (duration < AjxDateUtil.MSEC_PER_HALF_HOUR) duration = AjxDateUtil.MSEC_PER_HALF_HOUR;	
			data.view._appCtxt.getAppController().getApp(ZmZimbraMail.CALENDAR_APP).getCalController().newAppointmentHelper(data.startDate, duration, data.folderId);
		}
	}

	mouseEv._stopPropagation = true;
	mouseEv._returnValue = false;
	mouseEv.setToDhtmlEvent(ev);
	
	return false;	
}

// END GRID ACTION HANDLERS

// BEGIN ALLDAY GRID ACTION HANDLERS

ZmCalColView._gridAllDayMouseMoveHdlr =
function(ev) {

	var mouseEv = DwtShell.mouseEvent;
	mouseEv.setFromDhtmlEvent(ev);	
	var data = DwtMouseEventCapture.getTargetObj();

	var deltaX = mouseEv.docX - data.docX;
	var deltaY = mouseEv.docY - data.docY;

	if (!data.dndStarted) {
		var withinThreshold =  (Math.abs(deltaX) < ZmCalColView.DRAG_THRESHOLD && Math.abs(deltaY) < ZmCalColView.DRAG_THRESHOLD);
		if (withinThreshold || !data.view._gridDndBegin(data)) {
			mouseEv._stopPropagation = true;
			mouseEv._returnValue = false;
			mouseEv.setToDhtmlEvent(ev);
			return false;
		}
	}

	// snap new location to grid
	var snap = data.view._snapXY(data.gridX + deltaX, data.gridY + deltaY, 30);
	if (snap == null) return false;
	
	var newStart, newEnd;

	if (deltaX >= 0) { // dragging right
		newStart = data.view._snapAllDayXY(data.gridX, data.gridY);
		newEnd = data.view._snapAllDayXY(data.gridX + deltaX, data.gridY);
	} else { // dragging left
		newEnd = data.view._snapAllDayXY(data.gridX, data.gridY);
		newStart = data.view._snapAllDayXY(data.gridX + deltaX, data.gridY);
	}

	if (newStart == null || newEnd == null) return false;

	if ((data.start == null) || (!data.view._scheduleMode && ((data.start.x != newStart.x) || (data.end.x != newEnd.x)))) {

		if (!data.dndStarted) data.dndStarted = true;

		data.start = newStart;
		data.end = newEnd;
		
		data.startDate = data.view._getAllDayDateFromXY(data.start.x, data.start.y);
		data.endDate = data.view._getAllDayDateFromXY(data.end.x, data.end.y);

		var e = data.newApptDivEl;
		if (!e) return;

		var bounds = data.view._getBoundsForAllDayDate(data.start, data.end);
		if (bounds == null) return false;
		// blank row at the bottom
		var y = data.view._allDayDivHeight - (ZmCalColView._ALL_DAY_APPT_HEIGHT+ZmCalColView._ALL_DAY_APPT_HEIGHT_PAD);
		Dwt.setLocation(e, newStart.x, y);
		Dwt.setSize(e, bounds.width, bounds.height);
		Dwt.setSize(data.apptBodyEl, bounds.width, bounds.height);		
		Dwt.setVisible(e, true);
	}
	mouseEv._stopPropagation = true;
	mouseEv._returnValue = false;
	mouseEv.setToDhtmlEvent(ev);
	return false;	
}

// END ALLDAY GRID ACTION HANDLERS

ZmCalColView._emptyHdlr =
function(ev) {
	var mouseEv = DwtShell.mouseEvent;
	mouseEv.setFromDhtmlEvent(ev);
	mouseEv._stopPropagation = true;
	mouseEv._returnValue = false;
	mouseEv.setToDhtmlEvent(ev);
	return false;
}

ZmCalColView._handleError =
function(args) {
	var data	= args[0];
	var ex		= args[1];
	
	ZmCalColView._restoreLayout(data);
	return false;
}

ZmCalColView._restoreLayout =
function(data) {
	var lo = data.layout;
	data.view._layoutAppt(null, data.apptEl, lo.x, lo.y, lo.w, lo.h);
}
