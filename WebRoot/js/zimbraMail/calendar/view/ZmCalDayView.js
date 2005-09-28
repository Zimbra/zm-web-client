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
	this.setNumDays(numDays);
	// set before call to parent
	this._scheduleMode = false;
	//this._numDays = numDays;
	ZmCalBaseView.call(this, parent, className, posStyle, view);
	this.setScrollStyle(DwtControl.CLIP);	
	this._needFirstLayout = true;
	this.__colorIndex = 0;
}

ZmCalDayView.prototype = new ZmCalBaseView;
ZmCalDayView.prototype.constructor = ZmCalDayView;

ZmCalDayView.DRAG_THRESHOLD = 5;

ZmCalDayView._OPACITY_APPT_NORMAL = 100;
ZmCalDayView._OPACITY_APPT_DECLINED = 20;
ZmCalDayView._OPACITY_APPT_TENTATIVE = 60;
ZmCalDayView._OPACITY_APPT_DND = 70;

ZmCalDayView._HOURS_DIV_WIDTH = 40; // width of div holding hours text (1:00am, etc)
ZmCalDayView._UNION_DIV_WIDTH = 40; // width of div holding union in sched view
ZmCalDayView._HOURS_DIV_WIDTH_PAD = 0; // space between hours div and appts

ZmCalDayView._ALL_DAY_SEP_HEIGHT = 5; // height of separator between all day appts and body
ZmCalDayView._DAY_SEP_WIDTH = 1; // width of separator between days

ZmCalDayView._SCROLLBAR_WIDTH = 20;

ZmCalDayView._DAY_HEADING_HEIGHT = 20;
ZmCalDayView._ALL_DAY_APPT_HEIGHT = 20;
ZmCalDayView._ALL_DAY_APPT_HEIGHT_PAD = 3; // space between all day appt rows
ZmCalDayView._APPT_X_FUDGE = 0; // due to border stuff
ZmCalDayView._APPT_Y_FUDGE = -1; // ditto
ZmCalDayView._APPT_WIDTH_FUDGE = (AjxEnv.isIE ? 0 : -3); // due to border stuff
ZmCalDayView._APPT_HEIGHT_FUDGE = (AjxEnv.isIE ? 0 : -4); // ditto

ZmCalDayView._HOUR_HEIGHT = 42;
ZmCalDayView._15_MINUTE_HEIGHT = ZmCalDayView._HOUR_HEIGHT/4;
ZmCalDayView._DAY_HEIGHT = ZmCalDayView._HOUR_HEIGHT*24;

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

ZmCalDayView.prototype.getPrintHtml = 
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
ZmCalDayView.prototype._loadDetailsForAppts = 
function(list, numAppts) {
	var makeBatchReq = false;
	var needToLoad = new Object();
	var apptHash = new Object();

	// collect all appointments that dont have details loaded yet
	for (var i = 0; i < numAppts; i++) {
		var appt = list.get(i);
		if (!appt.hasDetails()) {
			var newMessage = new ZmMailMsg(this._appCtxt);
			newMessage.id = appt.getInvId();
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
		var resp = command.invoke(soapDoc).Body.BatchResponse.GetMsgResponse;

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

ZmCalDayView.prototype._printApptDetails = 
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

ZmCalDayView.prototype._getDateHdrForPrintView = 
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

ZmCalDayView.prototype._dateUpdate =
function(rangeChanged) {
	this._selectDay(this._date);
	this._clearSelectedTime();
	this._updateSelectedTime();
}

ZmCalDayView.prototype._selectDay =
function(date) {
	if (this._numDays == 1) return;
	var day = this._getDayForDate(date);
	if (day != null) {
		var doc = this.getDocument();
		if (this._selectedDay) {
	 		var te = Dwt.getDomObj(doc, this._selectedDay.titleId);
	 		te.className = this._selectedDay.isToday ? 'calendar_heading_day_today' : 'calendar_heading_day';
		}
		this._selectedDay = day;
		var te = Dwt.getDomObj(doc, day.titleId);
 		te.className = day.isToday ? 'calendar_heading_day_today-selected' : 'calendar_heading_day-selected';
	}
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
	var t = this._date.getTime();
	if (t < this._timeRangeStart || t >= this._timeRangeEnd)
		return;

	var e = Dwt.getDomObj(this.getDocument(), this._timeSelectionDivId);
	if (!e) return;

	var bounds = this._getBoundsForDate(this._date,  AjxDateUtil.MSEC_PER_HALF_HOUR);
	if (bounds == null) return;
	var snap = this._snapXY(bounds.x, bounds.y, 30);

	Dwt.setLocation(e, snap.x, snap.y);
	Dwt.setSize(e, bounds.width, bounds.height);
	ZmCalDayView._setOpacity(e, 40);
	Dwt.setVisible(e, true);
}

ZmCalDayView.prototype._preSet = 
function() {
	this._resetAllDayData();
}

ZmCalDayView.prototype._postSet = 
function() {
//DBG.println("_postSet");
	this._computeApptLayout();
	this._computeAllDayApptLayout();
	if (!this._needFirstLayout)
		this._layoutAppts();
	this._layout();
	this._scrollTo8AM();
}

ZmCalDayView.prototype._syncScroll =
function()
{
	var bodyElement = Dwt.getDomObj(this.getDocument(), this._bodyDivId);
	var hourElement = Dwt.getDomObj(this.getDocument(), this._hoursScrollDivId);
	var unionGridScrollElement = Dwt.getDomObj(this.getDocument(), this._unionGridScrollDivId);	
	hourElement.scrollTop = bodyElement.scrollTop;
	if (unionGridScrollElement) unionGridScrollElement.scrollTop = bodyElement.scrollTop;
}

ZmCalDayView.prototype._scrollTo8AM =
function()
{
	if (!this._autoScrollDisabled) {
		var bodyElement = Dwt.getDomObj(this.getDocument(), this._bodyDivId);
		bodyElement.scrollTop = ZmCalDayView._HOUR_HEIGHT*8 - 10;
		this._syncScroll();
	} else {
		this._autoScrollDisabled = false;
	}
}

ZmCalDayView.prototype._updateTitle =
function() 
{
	var numDays = this.getNumDays();
	if (numDays == 1) {
		var date = this._date;	
		this._title = AjxDateUtil.MONTH_LONG[date.getMonth()] + " " + date.getDate(); // + ", " + date.getFullYear();
	} else {
		var first = this._days[0].date;
		var last = this._days[numDays-1].date;
		this._title = AjxDateUtil.MONTH_LONG[first.getMonth()]+" "+first.getDate()+" - " +
				 AjxDateUtil.MONTH_LONG[last.getMonth()]+" "+last.getDate(); //+", "+last.getFullYear();
	}				 
}

ZmCalDayView.prototype._dayTitle =
function(date) {
	var title = (this.getNumDays() == 1) ?
		AjxDateUtil.WEEKDAY_LONG[date.getDay()]+", "+AjxDateUtil.MONTH_LONG[date.getMonth()]+" "+date.getDate() :
		AjxDateUtil.WEEKDAY_MEDIUM[date.getDay()]+", "+AjxDateUtil.MONTH_MEDIUM[date.getMonth()]+" "+date.getDate();
	return AjxStringUtil.htmlEncode(title);
}

ZmCalDayView.prototype._updateDays =
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
	
	var today = new Date();
	today.setHours(0,0,0,0);

	var numDays = this.getNumDays();
	var lastDay = numDays - 1;
	for (var i=0; i < numDays; i++) {
		var day = this._days[i];
		day.lastDay = (i == lastDay);
		day.date = new Date(d);
		day.endDate = new Date(d);
		day.endDate.setHours(23,59,59,999);
		day.isToday = day.date.getTime() == today.getTime();
		this._dateToDayIndex[this._dayKey(day.date)] = day;

 		var te = Dwt.getDomObj(doc, day.titleId);
		te.firstChild.innerHTML = this._dayTitle(d);
		te._type = ZmCalBaseView.TYPE_DAY_HEADER;
		te._dayIndex = i;
		te.className = day.isToday ? 'calendar_heading_day_today' : 'calendar_heading_day';
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
	this._addAllDayApptRowLayout();
}

/**
 * we don't want allday appts that span days to be fanned out
 */
ZmCalDayView.prototype._fanoutAllDay =
function(appt) {
	return false;
}

ZmCalDayView.prototype._getDivForAppt =
function(appt) {
	return Dwt.getDomObj(this.getDocument(), appt.isAllDayEvent() ? this._allDayDivId : this._apptBodyDivId);		 
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
		ZmCalDayView._setOpacity(div, ZmCalDayView._OPACITY_APPT_DECLINED);
	} else if (pstatus == ZmAppt.PSTATUS_TENTATIVE) {
		ZmCalDayView._setOpacity(div, ZmCalDayView._OPACITY_APPT_TENTATIVE);
	} else {
		ZmCalDayView._setOpacity(div, ZmCalDayView._OPACITY_APPT_NORMAL);	
	}
}

// for the new appt when drag selecting time grid
ZmCalDayView.prototype._populateNewApptHtml =
function(div) {
	div.style.position = 'absolute';
	Dwt.setSize(div, 10, 10);// will be resized
	div.className = 	"appt-" + DwtCssStyle.SELECTED;
	ZmCalDayView._setOpacity(div, ZmCalDayView._OPACITY_APPT_DND);
	var subs = {
		id: div.id,
		newState: "",
		headerColor: "BlueLight",
		bodyColor: "BlueBg",
		name: AjxStringUtil.htmlEncode(ZmMsg.newAppt),
		starttime: "",
		endtime: "",
		location: "",
		statusKey: "",
		status: ""
	};	
	div.innerHTML = DwtBorder.getBorderHtml("calendar_appt", subs, null);
	return div;
}

ZmCalDayView.prototype._createItemHtml =
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

	ZmCalDayView._setApptOpacity(appt, div);

	this.associateItemWithElement(appt, div, ZmCalBaseView.TYPE_APPT);

	var pstatus = appt.getParticipationStatus();
	var isNew = pstatus == ZmAppt.PSTATUS_NEEDS_ACTION;
	var isAccepted = pstatus == ZmAppt.PSTATUS_ACCEPT;
	var id = this._getItemId(appt);
	//var color = ZmCalBaseView.COLORS[(this.__colorIndex++) % ZmCalBaseView.COLORS.length];
	var color = "Blue";
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

ZmCalDayView.prototype._getDayForDate =
function(d) 
{
	return this._dateToDayIndex[this._dayKey(d)];
}	

ZmCalDayView.prototype._createHoursHtml =
function(html) {
	html.append("<div style='position:absolute; top:-8; width:", ZmCalDayView._HOURS_DIV_WIDTH, "px;' id='", this._bodyHourDivId, "'>");
	html.append("<table class=calendar_grid_day_table>");
	for (var h=0; h < 25; h++) {
		var hour = (h==0 || h == 12) ? 12 : h % 12;
		var ampm = (h < 12) ? "am" : "pm";
		html.append("<tr><td class=calendar_grid_body_time_td style='height:",
		ZmCalDayView._HOUR_HEIGHT ,"px; width:", ZmCalDayView._HOURS_DIV_WIDTH, "px'><div class=calendar_grid_body_time_text>");
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

ZmCalDayView.prototype._createHtml =
function(abook) {
	this._days = new Object();
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
	for (var i =0; i < numDays; i++) {
		this._days[i] = {
			index: i,
			titleId: Dwt.getNextId(),
			headingDaySepDivId: Dwt.getNextId(),
			daySepDivId: Dwt.getNextId(),
			apptX: 0, // computed in layout
			apptWidth: 0,// computed in layout
			allDayX: 0, // computed in layout
			allDayWidth: 0// computed in layout			
		};
	}

	// year heading	
	html.append("<div id='", this._yearHeadingDivId, "' class=calendar_heading style='position:absolute'>");
	html.append("<div id='", this._headerYearId, 
		"' class=calendar_heading_year_text style='position:absolute; width:", ZmCalDayView._HOURS_DIV_WIDTH,"px;'></div>");
	html.append("</div>");

	// div under year
	html.append("<div id='", this._yearAllDayDivId, "' style='position:absolute'></div>");
	
	// sep between year and headings
	html.append("<div id='", this._leftAllDaySepDivId, "' class='calendar_day_separator' style='position:absolute'></div>");

	if (this._scheduleMode) {
		// "All" heading
		html.append("<div id='", this._unionHeadingDivId, "' class=calendar_heading style='position:absolute'>");
		html.append("<div class=calendar_heading_year_text style='position:absolute; width:", ZmCalDayView._HOURS_DIV_WIDTH,"px;'>",ZmMsg.all,"</div>");
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
	for (var i =0; i < this.getNumDays(); i++) {
		html.append("<div id='", this._days[i].titleId, "' class=calendar_heading_day style='position:absolute;'><div class=calendar_heading_day_text></div></div>");
	}
	html.append("</div>");
	
	// divs to separate day headings
	for (var i =0; i < numDays; i++) {
		html.append("<div id='", this._days[i].headingDaySepDivId, "' class='calendar_day_separator' style='position:absolute'></div>");
	}
	// div holding all day appts
	html.append("<div id='", this._allDayDivId, "' style='position:absolute'></div>");
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
	for (var i =0; i < numDays; i++) {
		html.append("<div id='", this._days[i].daySepDivId, "' class='calendar_day_separator' style='position:absolute'></div>");
	}		
	html.append("</div>");
	html.append("</div>");

	this.getHtmlElement().innerHTML = html.toString();
	
	var bdi = this._bodyDivId;
	var hsdi = this._hoursScrollDivId;
	var adsdi = this._allDayScrollDivId;
	var ugsdi = this._unionGridScrollDivId;	
	Dwt.getDomObj(this.getDocument(), this._bodyDivId).onscroll = function() {
		var bodyElement = Dwt.getDomObj(document, bdi);
		var hourElement = Dwt.getDomObj(document, hsdi);
		var alldayElement = Dwt.getDomObj(document, adsdi);
		var unionGridScrollElement = Dwt.getDomObj(document, ugsdi);
		hourElement.scrollTop = bodyElement.scrollTop;
		alldayElement.scrollLeft = bodyElement.scrollLeft;
		if (unionGridScrollElement) unionGridScrollElement.scrollTop = bodyElement.scrollTop;
	};
	Dwt.getDomObj(this.getDocument(), this._apptBodyDivId)._type = ZmCalBaseView.TYPE_APPTS_DAYGRID;
	Dwt.getDomObj(this.getDocument(), this._bodyHourDivId)._type = ZmCalBaseView.TYPE_HOURS_COL;
	Dwt.getDomObj(this.getDocument(), this._allDayDivId)._type = ZmCalBaseView.TYPE_ALL_DAY;
	this._populateNewApptHtml(Dwt.getDomObj(this.getDocument(), this._newApptDivId));
	this._scrollTo8AM();
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
	var numDays = this.getNumDays();
	for (var i=0; i < numDays; i++) {
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
			if (day)	 this._findAllDaySlot(day.index, data);
		}
	}
}

ZmCalDayView.prototype._layoutAllDayAppts =
function() {
	var rows = this._allDayApptsRowLayouts;
	if (!rows) return;
	
	var doc = this.getDocument();
	var rowY = ZmCalDayView._ALL_DAY_APPT_HEIGHT_PAD + 2;
	for (var i=0; i < rows.length; i++) {
		var row = rows[i];
		var numDays = this.getNumDays();
		for (var j=0; j < numDays; j++) {
			var slot = row[j];
			if (slot.data) {
				var appt = slot.data.appt;
				var div = Dwt.getDomObj(doc, this._getItemId(appt));
				this._positionAppt(div, this._days[j].allDayX+0, rowY);
				this._sizeAppt(div, this._days[j].allDayWidth * slot.data.numDays - ZmCalDayView._DAY_SEP_WIDTH - 1,
							 ZmCalDayView._ALL_DAY_APPT_HEIGHT);
			}
		}
		rowY += ZmCalDayView._ALL_DAY_APPT_HEIGHT + ZmCalDayView._ALL_DAY_APPT_HEIGHT_PAD;
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
	Dwt.setLocation(apptDiv, x + ZmCalDayView._APPT_X_FUDGE, y + ZmCalDayView._APPT_Y_FUDGE);

}

ZmCalDayView.prototype._sizeAppt =
function(apptDiv, w, h) {
	// set outer as well as inner
	Dwt.setSize(	apptDiv,	w + ZmCalDayView._APPT_WIDTH_FUDGE, h); // no fudge for you
	// get the inner div that should be sized and set its width/height
	var apptBodyDiv = Dwt.getDomObj(this.getDocument(), apptDiv.id + "_body");
	Dwt.setSize(	apptBodyDiv, w + ZmCalDayView._APPT_WIDTH_FUDGE, h + ZmCalDayView._APPT_HEIGHT_FUDGE);
}


ZmCalDayView.prototype._layoutAppt =
function(ao, apptDiv, x, y, w, h) {
	// record to restore after dnd/sash
	ao._layout = {x: x, y: y, w: w, h: h};
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
			
			this._layoutAppt(ao, apptDiv, x, layout.y, w, layout.h);
		}
	}
}

ZmCalDayView.prototype._getDayFromX =
function(x) {
	var numDays = this.getNumDays();
	for (var i =0; i < numDays; i++) {
		var day = this._days[i];
		if (x >= day.apptX && x <= day.apptX+day.apptWidth) return day;
	}		
	return null;
}

ZmCalDayView.prototype._getYfromDate =
function(d) {
	var h = d.getHours();
	var m = d.getMinutes();
	return Math.floor((h+m/60) * ZmCalDayView._HOUR_HEIGHT) + 1;
}

ZmCalDayView.prototype._getLocationForDate =
function(d) {
	var h = d.getHours();
	var m = d.getMinutes();
	var day = this._getDayForDate(d);
	if (day == null) return null;
	return new DwtPoint(day.apptX, Math.floor(((h+m/60) * ZmCalDayView._HOUR_HEIGHT))+1);
}

ZmCalDayView.prototype._getBoundsForDate =
function(d, duration) {
	var durationMinutes = duration / 1000 / 60;
	var h = d.getHours();
	var m = d.getMinutes();
	var day = this._getDayForDate(d);
	if (day == null) return null;
	return new DwtRectangle(day.apptX, ((h+m/60) * ZmCalDayView._HOUR_HEIGHT), 
					day.apptWidth, (ZmCalDayView._HOUR_HEIGHT / 60) * durationMinutes);
}

// snapXY coord to specified minute boundary (15,30)
ZmCalDayView.prototype._snapXY =
function(x, y, snapMinutes, roundUp) {
	// snap it to grid
	var day = this._getDayFromX(x);
	if (day == null) return null;
	x = day.apptX;
	var height = (snapMinutes/60) * ZmCalDayView._HOUR_HEIGHT;
	y = Math.floor(y/height) * height;
	if (roundUp) y += height;
	return {x:x, y:y};	
}

ZmCalDayView.prototype._getDateFromXY =
function(x, y, snapMinutes, roundUp) {
	var day = this._getDayFromX(x);
	if (day == null) return null;
	var minutes = Math.floor((y / ZmCalDayView._HOUR_HEIGHT) * 60);
	if (snapMinutes != null && snapMinutes > 1)	{
		minutes = Math.floor(minutes/snapMinutes) * snapMinutes;
		if (roundUp) minutes += snapMinutes;
	}
	return new Date(day.date.getTime() + (minutes * 60 * 1000));
}

ZmCalDayView.prototype._getAllDayDateFromXY =
function(x, y) {
	var day = this._getDayFromX(x);
	if (day == null) return null;
	return new Date(day.date.getTime());
}

// helper function to minimize code and catch errors
ZmCalDayView.prototype._setBounds =
function(id, x, y, w, h) {
	var el = Dwt.getDomObj(this.getDocument(), id);
	if (el == null) {
		DBG.println("ZmCalDayView._setBounds null element for id: "+id);
	} else {
		Dwt.setBounds(el, x, y, w, h);
	}
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

	var hoursWidth = ZmCalDayView._HOURS_DIV_WIDTH;
	
	var bodyX = hoursWidth + ZmCalDayView._DAY_SEP_WIDTH;
	var unionX = bodyX;
	if (this._scheduleMode) {
		bodyX += ZmCalDayView._UNION_DIV_WIDTH + ZmCalDayView._DAY_SEP_WIDTH;
	}

	var scrollTest = 0; //1000;
	var scrollTest2 = scrollTest ? scrollTest-100 : 0;

	// year heading
	this._setBounds(this._yearHeadingDivId, 0, 0, hoursWidth, Dwt.DEFAULT);	
		
	// column headings
	var allDayHeadingDiv = Dwt.getDomObj(doc, this._allDayHeadingDivId);
	Dwt.setBounds(allDayHeadingDiv, 0, 0, width - bodyX + scrollTest, Dwt.DEFAULT);
	var allDayHeadingDivHeight = Dwt.getSize(allDayHeadingDiv).y;
	
	// div for all day appts
	//var allDayDiv = Dwt.getDomObj(doc, this._allDayDivId);
	var numRows = this._allDayApptsRowLayouts ? (this._allDayApptsRowLayouts.length+1) : 1;	
	var allDayDivHeight = (ZmCalDayView._ALL_DAY_APPT_HEIGHT+ZmCalDayView._ALL_DAY_APPT_HEIGHT_PAD) * numRows + ZmCalDayView._ALL_DAY_APPT_HEIGHT_PAD;
	var allDayDivY = allDayHeadingDivHeight;
	this._setBounds(this._allDayDivId, 0, allDayDivY, width - bodyX + scrollTest, allDayDivHeight);
	
	// div under year
	this._setBounds(this._yearAllDayDivId, 0, 0, hoursWidth, allDayDivHeight);	

	// all day scroll
	var allDayScrollHeight = allDayDivY + allDayDivHeight;
	this._setBounds(this._allDayScrollDivId, bodyX, 0, width - bodyX, allDayScrollHeight);	

	// vert sep between year and all day headings
	this._setBounds(this._leftAllDaySepDivId, hoursWidth, 0, ZmCalDayView._DAY_SEP_WIDTH, allDayScrollHeight);		
	
	// horiz separator between all day appts and grid
	this._setBounds(this._allDaySepDivId, 0, allDayScrollHeight, width, ZmCalDayView._ALL_DAY_SEP_HEIGHT);	

	// compute height for hours/grid
	this._bodyDivWidth = width - bodyX;
	
	//var bodyY =allDayHeadingDivHeight + allDayDivHeight + ZmCalDayView._ALL_DAY_SEP_HEIGHT +  (AjxEnv.isIE ? 0 : 2);
	var bodyY = allDayScrollHeight + ZmCalDayView._ALL_DAY_SEP_HEIGHT +  (AjxEnv.isIE ? 0 : 2);

	this._bodyDivHeight = height - bodyY;

	// hours
	this._setBounds(this._hoursScrollDivId, 0, bodyY, hoursWidth, this._bodyDivHeight);	

	// vert sep between hours and grid
	this._setBounds(this._leftApptSepDivId, hoursWidth, bodyY, ZmCalDayView._DAY_SEP_WIDTH, ZmCalDayView._DAY_HEIGHT);	

	// div for scrolling grid	
	this._setBounds(this._bodyDivId, bodyX, bodyY, this._bodyDivWidth, this._bodyDivHeight);	

	// size appts divs
	var apptsDivX =  ZmCalDayView._HOURS_DIV_WIDTH_PAD;
	this._apptBodyDivHeight = ZmCalDayView._DAY_HEIGHT + 1; // extra for midnight to show up
	this._apptBodyDivWidth = this._bodyDivWidth - apptsDivX;

	this._setBounds(this._apptBodyDivId, apptsDivX, -1, this._apptBodyDivWidth + scrollTest2, this._apptBodyDivHeight);	

	if (this._scheduleMode) {
		//heading
		this._setBounds(this._unionHeadingDivId, unionX, 0, ZmCalDayView._UNION_DIV_WIDTH, Dwt.DEFAULT);
				
		//div under heading
		this._setBounds(this._unionAllDayDivId, unionX, allDayDivY, ZmCalDayView._UNION_DIV_WIDTH, allDayDivHeight);		

		// sep in all day area
		var unionSepX = unionX + ZmCalDayView._UNION_DIV_WIDTH;
		this._setBounds(this._unionHeadingSepDivId, unionSepX, 0, ZmCalDayView._UNION_DIV_WIDTH, allDayScrollHeight);		

		// div for scrolling union
		this._setBounds(this._unionGridScrollDivId, unionX, bodyY, ZmCalDayView._UNION_DIV_WIDTH, this._bodyDivHeight);		
		this._setBounds(this._unionGridDivId, 0, -1, ZmCalDayView._UNION_DIV_WIDTH, this._apptBodyDivHeight+ZmCalDayView._HOUR_HEIGHT);		

		// sep in grid area
		this._setBounds(this._unionGridSepDivId, unionSepX, bodyY, ZmCalDayView._DAY_SEP_WIDTH, this._apptBodyDivHeight);		
	}

	var numDays = this.getNumDays();
	var dayWidth = Math.floor((this._apptBodyDivWidth-ZmCalDayView._SCROLLBAR_WIDTH)/numDays);

	var currentX = 0;
	for (var i = 0; i < numDays; i++) {
		var day = this._days[i];
			
		// position day heading
		var dayWfudge = (day.isToday && !AjxEnv.isIE) ? 1 : 0;
		this._setBounds(day.titleId, apptsDivX+currentX+1, Dwt.DEFAULT, dayWidth-2 - dayWfudge, ZmCalDayView._DAY_HEADING_HEIGHT-2);

		day.apptX = currentX + 2 ; //ZZZ
		day.apptWidth = dayWidth - ZmCalDayView._DAY_SEP_WIDTH - 3;  //ZZZZ
		day.allDayX = apptsDivX + day.apptX;
		day.allDayWidth = dayWidth; // doesn't include sep
		currentX += dayWidth;

		this._setBounds(day.headingDaySepDivId, apptsDivX+currentX, 0, ZmCalDayView._DAY_SEP_WIDTH, allDayHeadingDivHeight + allDayDivHeight);		
		this._setBounds(day.daySepDivId, currentX, 0, ZmCalDayView._DAY_SEP_WIDTH, this._apptBodyDivHeight);

		currentX += ZmCalDayView._DAY_SEP_WIDTH;
	}	

	this._layoutAllDayAppts();
	this._layoutAppts();

	this._apptBodyDivOffset = Dwt.toWindow(Dwt.getDomObj(doc, this._apptBodyDivId), 0, 0, null);

	return;
}

ZmCalDayView.prototype._handleApptScrollRegion =
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
	//
}

ZmCalDayView._ondblclickHandler =
function (ev){
	ev = DwtUiEvent.getEvent(ev);
	ev._isDblClick = true;
	ZmCalDayView._onclickHandler(ev);
};

ZmCalDayView.prototype._mouseOverAction =
function(ev, div) {
	ZmCalBaseView.prototype._mouseOverAction.call(this, ev, div);
	if (div._type == ZmCalBaseView.TYPE_DAY_HEADER) {
		div.firstChild.style.textDecoration = "underline";
	}
}

ZmCalDayView.prototype._mouseOutAction =
function(ev, div) {
	ZmCalBaseView.prototype._mouseOutAction.call(this, ev, div);
	if (div._type == ZmCalBaseView.TYPE_DAY_HEADER) {
		div.firstChild.style.textDecoration = "none";
	}
}


ZmCalDayView.prototype._mouseUpAction =
function(ev, div) {
	ZmCalBaseView.prototype._mouseUpAction.call(this, ev, div);
	if (div._type == ZmCalBaseView.TYPE_DAY_HEADER) {
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

ZmCalDayView.prototype._doubleClickAction =
function(ev, div) {
	ZmCalBaseView.prototype._doubleClickAction.call(this, ev, div);
	if (div._type == ZmCalBaseView.TYPE_APPTS_DAYGRID || div._type == ZmCalBaseView.TYPE_ALL_DAY) {
		this._timeSelectionAction(ev, div, true);
	}
}

ZmCalDayView.prototype._timeSelectionAction =
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

ZmCalDayView.prototype._mouseDownAction = 
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
	}
	return false;
}

// BEGIN APPT ACTION HANDLERS

ZmCalDayView.prototype._apptMouseDownAction =
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
			ZmCalDayView._emptyHdlr, // mouse over
			ZmCalDayView._emptyHdlr, // mouse down (already handled by action)
			ZmCalDayView._apptMouseMoveHdlr, 
			ZmCalDayView._apptMouseUpHdlr, 
			ZmCalDayView._emptyHdlr, // mouse out
			true);
	capture.capture();
	return false;	
}

// called when DND is confirmed after threshold
ZmCalDayView.prototype._apptDndBegin =
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
	
	data.bodyDivEl.style.cursor = 'move';	
	this.deselectAll();
	this.setSelection(data.appt);
	ZmCalDayView._setOpacity(data.apptEl, ZmCalDayView._OPACITY_APPT_DND);
	data.dndStarted = true;
	return true;
}

ZmCalDayView._apptMouseMoveHdlr =
function(ev) {

	var mouseEv = DwtShell.mouseEvent;
	mouseEv.setFromDhtmlEvent(ev);	
	var data = DwtMouseEventCapture.getTargetObj();

	var deltaX = mouseEv.docX - data.docX;
	var deltaY = mouseEv.docY - data.docY;

	if (!data.dndStarted) {
		var withinThreshold =  (Math.abs(deltaX) < ZmCalDayView.DRAG_THRESHOLD && Math.abs(deltaY) < ZmCalDayView.DRAG_THRESHOLD);
		if (withinThreshold || !data.view._apptDndBegin(data)) {
			mouseEv._stopPropagation = true;
			mouseEv._returnValue = false;
			mouseEv.setToDhtmlEvent(ev);
			return false;
		}
	}

	var scrollOffset = data.view._handleApptScrollRegion(mouseEv.docX, mouseEv.docY, ZmCalDayView._HOUR_HEIGHT);
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
		if (newDate != null && newDate.getTime() != data.startDate.getTime()) {
			data.view._positionAppt(data.apptEl, snap.x, snap.y);
// begin size width
			var day = data.view._getDayFromX(snap.x);
			Dwt.setSize(	data.apptEl,	day.apptWidth + ZmCalDayView._APPT_WIDTH_FUDGE, Dwt.DEFAULT);
			// get the inner div that should be sized and set its width/height
			Dwt.setSize(	data.apptBodyEl, day.apptWidth + ZmCalDayView._APPT_WIDTH_FUDGE, Dwt.DEFAULT);
// end size width
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

ZmCalDayView._apptMouseUpHdlr =
function(ev) {
//	DBG.println("ZmCalDayView._sashMouseUpHdlr");
	var data = DwtMouseEventCapture.getTargetObj();
	ZmCalDayView._setApptOpacity(data.appt, data.apptEl);	
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
			if (cc.updateApptDate(data.appt._orig, data.startDate, new Date(data.startDate.getTime()+origDuration), false)) return false;
		}
		// restore
		var lo = data.appt._layout;
		data.view._layoutAppt(data.appt, data.apptEl, lo.x, lo.y, lo.w, lo.h);
	}

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
			ZmCalDayView._emptyHdlr, // mouse over
			ZmCalDayView._emptyHdlr, // mouse down (already handled by action)
			ZmCalDayView._sashMouseMoveHdlr, 
			ZmCalDayView._sashMouseUpHdlr, 
			ZmCalDayView._emptyHdlr, // mouse out
			true);
	capture.capture();
	this.deselectAll();
	this.setSelection(data.appt);
	ZmCalDayView._setOpacity(apptEl, ZmCalDayView._OPACITY_APPT_DND);
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

	var scrollOffset = data.view._handleApptScrollRegion(mouseEv.docX, mouseEv.docY, ZmCalDayView._HOUR_HEIGHT);
	if (scrollOffset != 0) {
		data.startY -= scrollOffset;	
		deltaY += scrollOffset;
	}

	var delta15 = Math.floor(delta/ZmCalDayView._15_MINUTE_HEIGHT);
	delta = delta15 * ZmCalDayView._15_MINUTE_HEIGHT;

	if (delta != data.lastDelta) {
		if (data.isTop) {
			var newY = data.apptY + delta;
			var newHeight = data.origHeight - delta;
			if (newHeight >= ZmCalDayView._15_MINUTE_HEIGHT) {
				Dwt.setLocation(data.apptEl, Dwt.DEFAULT, newY);
				Dwt.setSize(data.apptEl, Dwt.DEFAULT, data.parentOrigHeight - delta);				
				Dwt.setSize(data.apptBodyEl, Dwt.DEFAULT, Math.floor(newHeight));
				data.lastDelta = delta;
				data.startDate.setTime(data.appt.getStartTime() + (delta15 * AjxDateUtil.MSEC_PER_FIFTEEN_MINUTES)); // num msecs in 15 minutes
				if (data.startTimeEl) data.startTimeEl.innerHTML = ZmAppt._getTTHour(data.startDate);
			}
		} else {
			var newHeight = data.origHeight + delta;
			if (newHeight >= ZmCalDayView._15_MINUTE_HEIGHT) {
				var parentNewHeight = data.parentOrigHeight + delta;			
//			DBG.println("delta = " + delta);
				Dwt.setSize(data.apptEl, Dwt.DEFAULT, parentNewHeight);
				Dwt.setSize(data.apptBodyEl, Dwt.DEFAULT, newHeight + ZmCalDayView._APPT_HEIGHT_FUDGE);

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

	//data.sash.innerHTML = "";
//	data.sash.className = 'appt_sash';
	mouseEv._stopPropagation = true;
	mouseEv._returnValue = false;
	mouseEv.setToDhtmlEvent(ev);

	if (data.isTop && data.startDate.getTime() != data.appt.getStartTime()) {
		data.view._autoScrollDisabled = true;
		var cc = data.view._appCtxt.getAppController().getApp(ZmZimbraMail.CALENDAR_APP).getCalController();
		if (cc.updateApptDate(data.appt._orig, data.startDate, null, false)) return false;	
	} else if (!data.isTop && data.endDate.getTime() != data.appt.getEndTime()) {
		data.view._autoScrollDisabled = true;	
		var cc = data.view._appCtxt.getAppController().getApp(ZmZimbraMail.CALENDAR_APP).getCalController();
		if (cc.updateApptDate(data.appt._orig, null, data.endDate, false)) return false;
	}
	// restore
	var lo = data.appt._layout;
	data.view._layoutAppt(data.appt, data.apptEl, lo.x, lo.y, lo.w, lo.h);	
	return false;	
}

// END SASH ACTION HANDLERS


// BEGIN APPT ACTION HANDLERS

ZmCalDayView.prototype._gridMouseDownAction =
function(ev, gridEl, gridLoc) {
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
		docY: ev.docY
	};

	var capture = new DwtMouseEventCapture	(data,
			ZmCalDayView._emptyHdlr, // mouse over
			ZmCalDayView._emptyHdlr, // mouse down (already handled by action)
			ZmCalDayView._gridMouseMoveHdlr, 
			ZmCalDayView._gridMouseUpHdlr, 
			ZmCalDayView._emptyHdlr, // mouse out
			true);
	capture.capture();
	return false;	
}

// called when DND is confirmed after threshold
ZmCalDayView.prototype._gridDndBegin =
function(data) {
	data.gridEl.style.cursor = 's-resize';	
	data.newApptDivEl = Dwt.getDomObj(data.view.getDocument(), data.view._newApptDivId);
	data.apptBodyEl = Dwt.getDomObj(data.view.getDocument(), data.newApptDivEl.id + "_body");
	data.endTimeEl = Dwt.getDomObj(this.getDocument(), data.newApptDivEl.id +"_et");
	data.startTimeEl = Dwt.getDomObj(this.getDocument(), data.newApptDivEl.id +"_st");
	this.deselectAll();
	return true;
}

ZmCalDayView._gridMouseMoveHdlr =
function(ev) {

	var mouseEv = DwtShell.mouseEvent;
	mouseEv.setFromDhtmlEvent(ev);	
	var data = DwtMouseEventCapture.getTargetObj();

	var deltaX = mouseEv.docX - data.docX;
	var deltaY = mouseEv.docY - data.docY;

	if (!data.dndStarted) {
		var withinThreshold =  (Math.abs(deltaX) < ZmCalDayView.DRAG_THRESHOLD && Math.abs(deltaY) < ZmCalDayView.DRAG_THRESHOLD);
		if (withinThreshold || !data.view._gridDndBegin(data)) {
			mouseEv._stopPropagation = true;
			mouseEv._returnValue = false;
			mouseEv.setToDhtmlEvent(ev);
			return false;
		}
	}

	var scrollOffset = data.view._handleApptScrollRegion(mouseEv.docX, mouseEv.docY, ZmCalDayView._HOUR_HEIGHT);
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

		var bounds = data.view._getBoundsForDate(data.startDate, duration);
		if (bounds == null) return false;
		Dwt.setLocation(e, newStart.x, newStart.y);
		Dwt.setSize(e, bounds.width, bounds.height);
		Dwt.setSize(data.apptBodyEl, bounds.width, bounds.height);		
//		ZmCalDayView._setOpacity(e, ZmCalDayView._OPACITY_APPT_DND);
		Dwt.setVisible(e, true);
//		e.innerHTML = ZmAppt._getTTHour(data.startDate) + " - " + ZmAppt._getTTHour(data.endDate);
//		e.innerHTML = "<div style='position:absolute; top:0; left:0;'>"+ZmAppt._getTTHour(data.startDate) + 
//					"</div><div style='position:absolute; bottom:0;left:0'>" + ZmAppt._getTTHour(data.endDate) + "</div>";
//		data.newApptDiv.style.zIndex = 30;

		if (data.startTimeEl) data.startTimeEl.innerHTML = ZmAppt._getTTHour(data.startDate);
		if (data.endTimeEl) data.endTimeEl.innerHTML = ZmAppt._getTTHour(data.endDate);
	}
	mouseEv._stopPropagation = true;
	mouseEv._returnValue = false;
	mouseEv.setToDhtmlEvent(ev);
	return false;	
}

ZmCalDayView._gridMouseUpHdlr =
function(ev) {
//	DBG.println("ZmCalDayView._sashMouseUpHdlr");
	var data = DwtMouseEventCapture.getTargetObj();
	//ZmCalDayView._setApptOpacity(data.appt, data.apptEl);	
	var mouseEv = DwtShell.mouseEvent;
	mouseEv.setFromDhtmlEvent(ev);	

	DwtMouseEventCapture.getCaptureObj().release();
	
	if (data.dndStarted) {
		data.gridEl.style.cursor = 'auto';
		var duration = (data.endDate.getTime() - data.startDate.getTime());
		if (duration < AjxDateUtil.MSEC_PER_HALF_HOUR) duration = AjxDateUtil.MSEC_PER_HALF_HOUR;		
		//DBG.println("calling timeSelectionEvent with : "+data.startDate+ " duration "+duration);
		Dwt.setVisible(data.newApptDivEl, false);
		data.view._appCtxt.getAppController().getApp(ZmZimbraMail.CALENDAR_APP).getCalController().newAppointmentHelper(data.startDate, duration);
		//var loc = new DwtPoint(mouseEv.docX, mouseEv.docY);
		//DBG.println("loc = "+loc.x+","+loc.y);
		//data.view._appCtxt.getAppController().getApp(ZmZimbraMail.CALENDAR_APP).getCalController().newApptDialog(loc, data.startDate, duration);
	}

	mouseEv._stopPropagation = true;
	mouseEv._returnValue = false;
	mouseEv.setToDhtmlEvent(ev);
	
	return false;	
}

// END APPT ACTION HANDLERS

ZmCalDayView._emptyHdlr =
function(ev) {
	var mouseEv = DwtShell.mouseEvent;
	mouseEv.setFromDhtmlEvent(ev);
	mouseEv._stopPropagation = true;
	mouseEv._returnValue = false;
	mouseEv.setToDhtmlEvent(ev);
	return false;
}
