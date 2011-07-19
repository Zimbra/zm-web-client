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

ZmCalDayView = function(parent, posStyle, controller, dropTgt, view, numDays, readonly, isInviteMessage, isRight) {
	ZmCalColView.call(this, parent, posStyle, controller, dropTgt, ZmId.VIEW_CAL_DAY, 1, false, readonly, isInviteMessage, isRight);
	this._compactMode = false;
};

ZmCalDayView.prototype = new ZmCalColView;
ZmCalDayView.prototype.constructor = ZmCalDayView;

ZmCalDayView.prototype.toString =
function() {
	return "ZmCalDayView";
};

ZmCalDayView.prototype.setCompactMode =
function(compactMode) {
	this._compactMode = compactMode;
};

ZmCalDayView.prototype.isCompactMode =
function() {
	return this._compactMode;
};

ZmCalDayView.prototype.fbStatusBarEnabled =
function(){
    return true;
};

ZmCalDayView.prototype._layout =
function(refreshApptLayout) {
	ZmCalColView.prototype._layout.call(this, refreshApptLayout);

	if (this._compactMode && !this._closeButton) {
		var btn = this._closeButton = new DwtButton({
			parent:this,
			style: DwtLabel.ALIGN_RIGHT | DwtButton.ALWAYS_FLAT,
			posStyle: DwtControl.ABSOLUTE_STYLE,
			className:"DwtToolbarButton cal_day_expand"
		});
		this._closeButton.setImage("Close");
		this._closeButton.setToolTipContent(ZmMsg.close);
		this._closeButton.setSize(16,16);
		var size= this.getSize();
		this._closeButton.setLocation(size.x-22, 0); // close button at top right corner for compact mode alone
		this._closeButton.addSelectionListener(new AjxListener(this, this._closeDayViewListener));
	}
};

ZmCalDayView.prototype._closeDayViewListener =
function() {
	if (this._closeDayViewCallback) {
		this._closeDayViewCallback.run();
	}
};

ZmCalDayView.prototype.setCloseDayViewCallback =
function(callback) {
	this._closeDayViewCallback = callback;
};

ZmCalDayView.prototype.setSize =
function(width, height) {
	ZmCalColView.prototype.setSize.call(this, width, height);
	if (this._closeButton) {
		this._closeButton.setLocation(width-22, 0);
	}
};

ZmCalDayView.prototype._controlListener =
function(ev) {
	if (!this._compactMode) {
		ZmCalColView.prototype._controlListener.call(this, ev);
	}
};


ZmCalDayView.prototype._apptMouseDownAction =
function(ev, apptEl) {
    appt = this.getItemFromElement(apptEl);
    if (appt.isAllDayEvent()) {
        return false;
    } else {
        return ZmCalBaseView.prototype._apptMouseDownAction.call(this, ev, apptEl, appt);
    }
};

ZmCalDayTabView = function(parent, posStyle, controller, dropTgt, view, numDays, readonly, isInviteMessage, isRight) {
	//ZmCalColView.call(this, parent, posStyle, controller, dropTgt, ZmId.VIEW_CAL_DAY_TAB, 1, false, readonly, isInviteMessage, isRight);
    ZmCalColView.call(this, parent, posStyle, controller, dropTgt, ZmId.VIEW_CAL_DAY_TAB, 1, true);
	this._compactMode = false;
};

ZmCalDayTabView.prototype = new ZmCalColView;
ZmCalDayTabView.prototype.constructor = ZmCalDayTabView;

ZmCalDayTabView.prototype.toString =
function() {
	return "ZmCalDayTabView";
};

ZmCalDayTabView.prototype._createHtml =
function(abook) {
	this._days = {};
	this._columns = [];
	this._hours = {};
	this._layouts = [];
	this._allDayAppts = [];

	var html = new AjxBuffer();

	this._headerYearId = Dwt.getNextId();
	this._yearHeadingDivId = Dwt.getNextId();
	this._yearAllDayDivId = Dwt.getNextId();
	this._leftAllDaySepDivId = Dwt.getNextId();
	this._leftApptSepDivId = Dwt.getNextId();

	this._allDayScrollDivId = Dwt.getNextId();
	this._allDayHeadingDivId = Dwt.getNextId();
	this._allDayApptScrollDivId = Dwt.getNextId();
	this._allDayDivId = Dwt.getNextId();
	this._hoursScrollDivId = Dwt.getNextId();
	this._bodyHourDivId = Dwt.getNextId();
	this._allDaySepDivId = Dwt.getNextId();
	this._bodyDivId = Dwt.getNextId();
	this._apptBodyDivId = Dwt.getNextId();
	this._newApptDivId = Dwt.getNextId();
	this._newAllDayApptDivId = Dwt.getNextId();
	this._timeSelectionDivId = Dwt.getNextId();
    this._curTimeIndicatorHourDivId = Dwt.getNextId();
    this._curTimeIndicatorGridDivId = Dwt.getNextId();
    this._hourColDivId = Dwt.getNextId();

    this._unionHeadingDivId = Dwt.getNextId();
    this._unionAllDayDivId = Dwt.getNextId();
    this._unionHeadingSepDivId = Dwt.getNextId();
    this._unionGridScrollDivId = Dwt.getNextId();
    this._unionGridDivId = Dwt.getNextId();
    this._unionGridSepDivId = Dwt.getNextId();
    this._workingHrsFirstDivId = Dwt.getNextId();
    this._workingHrsSecondDivId = Dwt.getNextId();


    this._tabsContainerDivId = Dwt.getNextId();
    this._toggleBtnContainerId = Dwt.getNextId();


	this._allDayRows = [];

	// year heading
	var inviteMessageHeaderStyle = (this._isInviteMessage && !this._isRight ? "height:26px;" : ""); //override class css in this case, so the header height aligns with the message view on the left
	var headerStyle = "position:absolute;" + inviteMessageHeaderStyle;



	// div under year
	html.append("<div id='", this._yearAllDayDivId, "' style='position:absolute'>");

    html.append("<div id='", this._yearHeadingDivId, "' class='calendar_heading' style='", headerStyle,	"'>");
	html.append("<div id='", this._headerYearId,
		"' class=calendar_heading_year_text style='position:absolute; width:", ZmCalColView._HOURS_DIV_WIDTH,"px;'></div>");
	html.append("</div>");
    html.append("</div>");

	// sep between year and headings
	html.append("<div id='", this._leftAllDaySepDivId, "' class='calendar_day_separator' style='position:absolute'></div>");

	if (this._scheduleMode) {


		// div in all day space
		html.append("<div id='", this._unionAllDayDivId, "' style='position:absolute'>");
        html.append("<div id='", this._unionHeadingDivId, "' class=calendar_heading style='position:absolute'>");
		html.append("<div class=calendar_heading_year_text style='position:absolute; width:", ZmCalColView._UNION_DIV_WIDTH,"px;'>",ZmMsg.all,"</div>");
		html.append("</div>");
        html.append("</div>");

		// sep between year and headings
		html.append("<div id='", this._unionHeadingSepDivId, "' class='calendar_day_separator' style='position:absolute'></div>");
	}

	// all day scroll	=============
	html.append("<div id='", this._allDayScrollDivId, "' style='position:absolute; overflow:hidden;'>");



	html.append("</div>");
	// end of all day scroll ===========

	// div holding all day appts
	html.append("<div id='", this._allDayApptScrollDivId, "' class='calendar_allday_appt' style='position:absolute'>");
	html.append("<div id='", this._allDayDivId, "' style='position:absolute'>");
	html.append("<div id='", this._newAllDayApptDivId, "' class='appt-Selected' style='position:absolute; display:none;'></div>");
	html.append("</div>");
	html.append("</div>");

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
		html.append("<div id='", this._unionGridDivId, "' class='ImgCalendarDayGrid' style='width:100%; height:1008px; position:absolute;'>");
		html.append("</div></div>");
		// sep between union grid and appt grid
		html.append("<div id='", this._unionGridSepDivId, "' class='calendar_day_separator' style='position:absolute'></div>");
	}

	// grid body
	html.append("<div id='", this._bodyDivId, "' class=calendar_body style='position:absolute'>");
    html.append("<div id='", this._apptBodyDivId, "' class='ImgCalendarDayGrid' style='width:100%; height:1008px; position:absolute;background-color:#E3E3DC;'>");
	html.append("<div id='", this._timeSelectionDivId, "' class='calendar_time_selection' style='position:absolute; display:none;z-index:10;'></div>");
	html.append("<div id='", this._newApptDivId, "' class='appt-Selected' style='position:absolute; display:none;'></div>");

    html.append("<div id='", this._workingHrsFirstDivId, "' class='ImgCalendarDayGrid' style='background-color:#FFFFFF;position:absolute;'></div>");
    html.append("<div id='", this._workingHrsSecondDivId, "' class='ImgCalendarDayGrid' style='background-color:#FFFFFF;position:absolute;'></div>");


	html.append("</div>");
    //Strip to indicate the current time
    html.append("<div id='"+this._curTimeIndicatorGridDivId+"' class='calendar_cur_time_indicator_strip' style='position:absolute;background-color:#F16426; height: 1px;'></div>");
    html.append("<div id='"+this._curTimeIndicatorGridDivId+"' class='calendar_cur_time_indicator_strip' style='position:absolute;background-color:#F16426; height: 1px;'></div>");
	html.append("</div>");

    // all day headings
	html.append("<div id='", this._tabsContainerDivId, "' style='position:absolute;height:25px;bottom:0px;'>");
    html.append("<div id='", this._toggleBtnContainerId, "' style='position:absolute;'></div>");
	html.append("<div id='", this._allDayHeadingDivId, "' class='calendar_heading' style='", headerStyle,	"'>");
	if (!this._scheduleMode) {
		for (var i =0; i < this.numDays; i++) {
			html.append("<div id='", this._columns[i].titleId, "' class='calendar_heading_day' style='position:absolute;'></div>");
		}
	}
	html.append("</div>");
	html.append("</div>");

	this.getHtmlElement().innerHTML = html.toString();

    var func = AjxCallback.simpleClosure(ZmCalColView.__onScroll, ZmCalColView, this);
	document.getElementById(this._bodyDivId).onscroll = func;
	document.getElementById(this._allDayApptScrollDivId).onscroll = func;

	var ids = [this._apptBodyDivId, this._bodyHourDivId, this._allDayDivId, this._allDaySepDivId];
	var types = [ZmCalBaseView.TYPE_APPTS_DAYGRID, ZmCalBaseView.TYPE_HOURS_COL, ZmCalBaseView.TYPE_ALL_DAY, ZmCalBaseView.TYPE_DAY_SEP];
	for (var i = 0; i < ids.length; i++) {
		this.associateItemWithElement(null, document.getElementById(ids[i]), types[i], ids[i]);
	}
	this._scrollToTime(8);
};


ZmCalDayTabView.prototype._layout =
function(refreshApptLayout) {
	DBG.println(AjxDebug.DBG2, "ZmCalColView in layout!");
	this._updateDays();

	var numCols = this._columns.length;

	var sz = this.getSize();
	var width = sz.x;
	var height = sz.y;

	if (width == 0 || height == 0) { return; }

    height -= 25;
	this._needFirstLayout = false;

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
	var dayWidth = this._calcColWidth(this._apptBodyDivWidth - Dwt.SCROLLBAR_WIDTH, numCols);

	if (needHorzScroll) this._apptBodyDivWidth -= 18;
	var scrollFudge = needHorzScroll ? 20 : 0; // need all day to be a little wider then grid

	// year heading
	this._setBounds(this._yearHeadingDivId, 0, 0, hoursWidth, Dwt.DEFAULT);
	this._setBounds(this._toggleBtnContainerId, 0, 0, hoursWidth+ZmCalColView._UNION_DIV_WIDTH, Dwt.DEFAULT);

    this._toggleBtn = new DwtButton({parent:this});
    this._toggleBtn.setText("Toggle");
    this._toggleBtn.reparentHtmlElement(this._toggleBtnContainerId);
    this._toggleBtn.addListener(DwtEvent.ONCLICK, new AjxListener(this, this._toggleView));

	// column headings
	var allDayHeadingDiv = document.getElementById(this._allDayHeadingDivId);
	Dwt.setBounds(allDayHeadingDiv, ZmCalColView._UNION_DIV_WIDTH+hoursWidth+1, 0, this._apptBodyDivWidth + scrollFudge, Dwt.DEFAULT);
	var allDayHeadingDivHeight = Dwt.getSize(allDayHeadingDiv).y;

	// div for all day appts
	var numRows = this._allDayApptsRowLayouts ? (this._allDayApptsRowLayouts.length) : 1;
	if (this._allDayApptsList && this._allDayApptsList.length > 0) numRows++;
	this._allDayFullDivHeight = (ZmCalColView._ALL_DAY_APPT_HEIGHT+ZmCalColView._ALL_DAY_APPT_HEIGHT_PAD) * numRows + ZmCalColView._ALL_DAY_APPT_HEIGHT_PAD;

	var percentageHeight = (this._allDayFullDivHeight/height)*100;
	this._allDayDivHeight = this._allDayFullDivHeight;

	// if height overflows more than 50% of full height set its height
	// to nearest no of rows which occupies less than 50% of total height
	if (percentageHeight > 50) {
		var nearestNoOfRows = Math.floor((0.50*height-ZmCalColView._ALL_DAY_APPT_HEIGHT_PAD)/(ZmCalColView._ALL_DAY_APPT_HEIGHT+ZmCalColView._ALL_DAY_APPT_HEIGHT_PAD));
		this._allDayDivHeight = (ZmCalColView._ALL_DAY_APPT_HEIGHT+ZmCalColView._ALL_DAY_APPT_HEIGHT_PAD) * nearestNoOfRows + ZmCalColView._ALL_DAY_APPT_HEIGHT_PAD;
	}

	this._setBounds(this._allDayApptScrollDivId, bodyX, allDayHeadingDivHeight, this._bodyDivWidth, this._allDayDivHeight);
	this._setBounds(this._allDayDivId, 0, 0, this._apptBodyDivWidth + scrollFudge, this._allDayFullDivHeight);

	this._allDayVerticalScrollbar(this._allDayDivHeight != this._allDayFullDivHeight);

	// div under year
	this._setBounds(this._yearAllDayDivId, 0, 0, hoursWidth, this._allDayDivHeight);

	// all day scroll
	var allDayScrollHeight =  this._allDayDivHeight;
	this._setBounds(this._allDayScrollDivId, bodyX, 0, this._bodyDivWidth, allDayScrollHeight);

	// vert sep between year and all day headings
	this._setBounds(this._leftAllDaySepDivId, hoursWidth, 0, this._daySepWidth, allDayScrollHeight);

	// horiz separator between all day appts and grid
	this._setBounds(this._allDaySepDivId, 0, (this._hideAllDayAppt ? ZmCalColView._DAY_HEADING_HEIGHT : allDayScrollHeight), width, ZmCalColView._ALL_DAY_SEP_HEIGHT);

	var bodyY =  (this._hideAllDayAppt ? ZmCalColView._DAY_HEADING_HEIGHT : allDayScrollHeight) + ZmCalColView._ALL_DAY_SEP_HEIGHT +  (AjxEnv.isIE ? 0 : 2);

	this._bodyDivHeight = height - bodyY;

	// hours
	this._setBounds(this._hoursScrollDivId, 0, bodyY, hoursWidth, this._bodyDivHeight);

	// vert sep between hours and grid
	this._setBounds(this._leftApptSepDivId, hoursWidth, bodyY, this._daySepWidth, ZmCalColView._DAY_HEIGHT);

	// div for scrolling grid
	this._setBounds(this._bodyDivId, bodyX, bodyY, this._bodyDivWidth, this._bodyDivHeight);

	this._setBounds(this._apptBodyDivId, 0, -1, this._apptBodyDivWidth, this._apptBodyDivHeight);


    //heading
    this._setBounds(this._unionHeadingDivId, unionX, 0, ZmCalColView._UNION_DIV_WIDTH, Dwt.DEFAULT);

    //div under heading
    this._setBounds(this._unionAllDayDivId, 0, 0, ZmCalColView._UNION_DIV_WIDTH, this._allDayDivHeight);

    // sep in all day area
    var unionSepX = unionX + ZmCalColView._UNION_DIV_WIDTH;
    this._setBounds(this._unionHeadingSepDivId, unionSepX, 0, this._daySepWidth, allDayScrollHeight);

    // div for scrolling union
    this._setBounds(this._unionGridScrollDivId, unionX, bodyY, ZmCalColView._UNION_DIV_WIDTH, this._bodyDivHeight);
    this._setBounds(this._unionGridDivId, 0, -1, ZmCalColView._UNION_DIV_WIDTH, this._apptBodyDivHeight+ZmCalColView._HOUR_HEIGHT);

    // sep in grid area
    this._setBounds(this._unionGridSepDivId, unionSepX, bodyY, this._daySepWidth, this._apptBodyDivHeight);


    this.layoutWorkingHours(this.workingHours);
	this._layoutAllDayAppts();

    this._apptBodyDivOffset   = Dwt.toWindow(document.getElementById(this._apptBodyDivId), 0, 0, null, true);
    this._apptAllDayDivOffset = Dwt.toWindow(document.getElementById(this._allDayDivId), 0, 0, null, true);


	this._layoutAppts();
    this._layoutUnionData();

};

ZmCalDayTabView.prototype._toggleView =
function() {
    if(!this._mergedView) {
        this._mergedView = true;
    }
    else {
        this._mergedView = false;
    }
    this.set(this._list, null, true);
};

ZmCalDayTabView.prototype._resetCalendarData =
function() {
	// TODO: optimize: if calendar list is same, skip!

	// remove existing
	// TODO: optimize, add/remove depending on new calendar length
	if (this._numCalendars > 0) {
		for (var i = 0; i < this._numCalendars; i++) {
			var col = this._columns[i];
			this._removeNode(col.titleId);
			this._removeNode(col.headingDaySepDivId);
			this._removeNode(col.daySepDivId);
		}
	}

	this._calendars = this._controller.getCheckedCalendars();
	this._calendars.sort(ZmCalendar.sortCompare);
	this._folderIdToColIndex = {};
	this._columns = [];
	this._numCalendars = this._mergedView ? 1 : this._calendars.length;

	this._layoutMap = [];
	this._unionBusyData = []; 			//  0-47, one slot per half hour, 48 all day
	this._unionBusyDataToolTip = [];	// tool tips

	var titleParentEl = document.getElementById(this._allDayHeadingDivId);
	var headingParentEl = document.getElementById(this._allDayScrollDivId);
	var dayParentEl = document.getElementById(this._apptBodyDivId);

	for (var i = 0; i < this._numCalendars; i++) {
		var col = this._columns[i] = {
			index: i,
			dayIndex: 0,
			cal: this._calendars[i],
			titleId: Dwt.getNextId(),
			headingDaySepDivId: Dwt.getNextId(),
			daySepDivId: Dwt.getNextId(),
            workingHrsFirstDivId: Dwt.getNextId(),
            workingHrsSecondDivId: Dwt.getNextId(),
			apptX: 0, 		// computed in layout
			apptWidth: 0,	// computed in layout
			allDayX: 0, 	// computed in layout
			allDayWidth: 0	// computed in layout
		};
		var cal = this._calendars[i];
		this._folderIdToColIndex[cal.id] = col;
		if (cal.isRemote() && cal.rid && cal.zid) {
			this._folderIdToColIndex[cal.zid + ":" + cal.rid] = col;
		}

		var div = document.createElement("div");
		div.style.position = 'absolute';
		div.className = "calendar_heading_day";
		div.id = col.titleId;
		var calName = AjxStringUtil.htmlEncode(cal.getName());
		if (appCtxt.multiAccounts) {
			var acct = cal.getAccount();
			div.innerHTML = [
				"<center><table border=0><tr><td>",
				calName,
				"</td><td>[",
				"<td>",
				AjxImg.getImageSpanHtml(acct.getIcon(), "width:18px"),
				"</td><td>",
				AjxStringUtil.htmlEncode(acct.getDisplayName()),
				"]</td></tr></table></center>"
			].join("");
		} else {
			div.innerHTML = calName;
		}
        if(titleParentEl) {
		    titleParentEl.appendChild(div);
        }
		div = document.createElement("div");
		div.className = "calendar_day_separator";
		div.style.position = 'absolute';
		div.id = col.headingDaySepDivId;
        if(headingParentEl) {
		    headingParentEl.appendChild(div);
        }

		div = document.createElement("div");
		div.className = "calendar_day_separator";
		div.style.position = 'absolute';
		div.id = col.daySepDivId;
        if(dayParentEl) {
		    dayParentEl.appendChild(div);
        }
	}
};

ZmCalDayTabView.prototype._getBoundsForAppt =
function(appt) {
	var sd = appt.startDate;
	var endOfDay = new Date(sd);
	endOfDay.setHours(23,59,59,999);
	var et = Math.min(appt.getEndTime(), endOfDay.getTime());
	if (!this._mergedView)
		return this._getBoundsForCalendar(sd, et - sd.getTime(), appt.folderId);
	else
		return this._getBoundsForDate(sd, et - sd.getTime());
};

ZmCalDayTabView.prototype._getBoundsForDate =
function(d, duration, col) {
	var durationMinutes = duration / 1000 / 60;
	durationMinutes = Math.max(durationMinutes, 22);
	var h = d.getHours();
	var m = d.getMinutes();
	if (col == null) {
		var day = this._getDayForDate(d);
		col = day ? this._columns[day.index] : null;
	}
	if (col == null) return null;
	return new DwtRectangle(col.apptX, ((h+m/60) * ZmCalColView._HOUR_HEIGHT),
					col.apptWidth, (ZmCalColView._HOUR_HEIGHT / 60) * durationMinutes);
};

ZmCalDayTabView.prototype._resetList =
function() {
	var list = this.getList();
	var size = list ? list.size() : 0;
	if (size == 0) return;

	for (var i=0; i < size; i++) {
		var ao = list.get(i);
		var id = this._getItemId(ao);
		var appt = document.getElementById(id);
		if (appt) {
			appt.parentNode.removeChild(appt);
			this._data[id] = null;
		}
	}
	//list.removeAll();
	this.removeAll();
};