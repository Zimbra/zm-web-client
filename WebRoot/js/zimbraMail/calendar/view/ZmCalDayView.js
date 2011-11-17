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
    ZmCalColView.call(this, parent, posStyle, controller, dropTgt, ZmId.VIEW_CAL_DAY, 1, true);
	this._compactMode = false;
};

ZmCalDayTabView.prototype = new ZmCalColView;
ZmCalDayTabView.prototype.constructor = ZmCalDayTabView;

ZmCalDayTabView._ALL_DAY_APPT_HEIGHT_PAD = 3;
ZmCalDayTabView._UNION_DIV_WIDTH = 0;

ZmCalDayTabView.NAV_TOOLBAR_CLASSNAME = "ZmDayTabNavToolBar";

ZmCalDayTabView._TAB_BORDER_WIDTH = 1;
ZmCalDayTabView._TAB_BORDER_MARGIN = 6;
ZmCalDayTabView._TAB_SEP_WIDTH = 8;
ZmCalDayTabView._TAB_TITLE_MAX_LENGTH = 15;

ZmCalDayTabView.ATTR_CAL_ID = "_calid";

ZmCalDayTabView.prototype.toString =
function() {
	return "ZmCalDayTabView";
};

ZmCalDayTabView.prototype.fbStatusBarEnabled =
function(){
    return true;
};

ZmCalDayTabView.prototype._createHtml =
function(abook) {
	this._days = {};
	this._columns = [];
	this._hours = {};
	this._layouts = [];
	this._allDayAppts = [];
    this._allDayRows = [];

	this._headerYearId = Dwt.getNextId();
	this._yearHeadingDivId = Dwt.getNextId();
	this._yearAllDayDivId = Dwt.getNextId();
	this._yearAllDayTopBorderId = Dwt.getNextId();
	this._yearAllDayBottomBorderId = Dwt.getNextId();
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
    this._startLimitIndicatorDivId = Dwt.getNextId();
    this._endLimitIndicatorDivId = Dwt.getNextId();
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

    this._borderLeftDivId = Dwt.getNextId();
    this._borderRightDivId = Dwt.getNextId();
    this._borderTopDivId = Dwt.getNextId();
    this._borderBottomDivId = Dwt.getNextId();
    this._startLimitIndicatorDivId = Dwt.getNextId();
    this._endLimitIndicatorDivId = Dwt.getNextId();

    var html = new AjxBuffer(),
        // year heading
	    inviteMessageHeaderStyle = (this._isInviteMessage && !this._isRight ? "height:26px;" : ""), //override class css in this case, so the header height aligns with the message view on the left
	    headerStyle = "position:absolute;" + inviteMessageHeaderStyle,
        func,
        ids,
        types,
        i;

	// div under year
	html.append("<div id='", this._yearAllDayDivId, "' name='_yearAllDayDivId' style='position:absolute;'>");
	html.append("<div id='", this._yearAllDayTopBorderId, "' class='calendar_day_separator'  name='_yearAllDayTopBorderId' style='position:absolute;top:0px;width:100%;height:2px;'></div>");
    html.append("<div id='", this._yearAllDayBottomBorderId, "' class='calendar_day_separator'  name='_yearAllDayTopBorderId' style='position:absolute;bottom:0px;width:100%;height:2px;'></div>");
    html.append("<div id='", this._yearHeadingDivId, "' class='calendar_heading' name='_yearHeadingDivId' style='", headerStyle,	"top:1px;'>");
	html.append("<div id='", this._headerYearId,
		"' name='_headerYearId' class=calendar_heading_year_text style='position:absolute; width:", ZmCalColView._HOURS_DIV_WIDTH,"px;'></div>");
	html.append("</div>");
    html.append("</div>");

	// sep between year and headings
	html.append("<div id='", this._leftAllDaySepDivId, "' name='_leftAllDaySepDivId' class='calendar_day_separator' style='position:absolute'></div>");

	if (this._scheduleMode) {

		// div in all day space
		html.append("<div id='", this._unionAllDayDivId, "' name='_unionAllDayDivId' style='position:absolute'>");
        html.append("<div id='", this._unionHeadingDivId, "' name='_unionHeadingDivId' class=calendar_heading style='position:absolute'>");
		html.append("<div class=calendar_heading_year_text style='position:absolute; width:", ZmCalDayTabView._UNION_DIV_WIDTH,"px;'>",ZmMsg.allDay,"</div>");
		html.append("</div>");
        html.append("</div>");

		// sep between year and headings
		html.append("<div id='", this._unionHeadingSepDivId, "' name='_unionHeadingSepDivId' class='calendar_day_separator' style='position:absolute'></div>");
	}

	// all day scroll	=============
	html.append("<div id='", this._allDayScrollDivId, "' name='_allDayScrollDivId' style='position:absolute; overflow:hidden;'>");
	html.append("</div>");
	// end of all day scroll ===========

	// div holding all day appts
	html.append("<div id='", this._allDayApptScrollDivId, "' name='_allDayApptScrollDivId' class='calendar_allday_appt' style='position:absolute'>");
	html.append("<div id='", this._allDayDivId, "' name='_allDayDivId' style='position:absolute'>");
	html.append("<div id='", this._newAllDayApptDivId, "' name='_newAllDayApptDivId' class='appt-Selected' style='position:absolute; display:none;'></div>");
	html.append("</div>");
	html.append("</div>");
    // end of div holding all day appts

	// sep betwen all day and normal appts
	html.append("<div id='", this._allDaySepDivId, "' name='_allDaySepDivId' style='overflow:hidden;position:absolute;'></div>");

	// div to hold hours
	html.append("<div id='", this._hoursScrollDivId, "' name='_hoursScrollDivId' class=calendar_hour_scroll style='position:absolute;'>");
	this._createHoursHtml(html);
	html.append("</div>");
    // end of div to hold hours

	// sep between hours and grid
	html.append("<div id='", this._leftApptSepDivId, "' name='_leftApptSepDivId' class='calendar_day_separator' style='position:absolute'></div>");

	// union grid
	if (this._scheduleMode) {
		html.append("<div id='", this._unionGridScrollDivId, "' name='_unionGridScrollDivId' class=calendar_union_scroll style='position:absolute;display:none;'>");
		html.append("<div id='", this._unionGridDivId, "' name='_unionGridDivId' class='ImgCalendarDayGrid' style='width:100%; height:1008px; position:absolute;'>");
		html.append("</div></div>");
		// sep between union grid and appt grid
		html.append("<div id='", this._unionGridSepDivId, "' name='_unionGridSepDivId' class='calendar_day_separator' style='position:absolute;display:none;'></div>");
	}

	// grid body
	html.append("<div id='", this._bodyDivId, "' name='_bodyDivId' class=calendar_body style='position:absolute'>");
    html.append("<div id='", this._apptBodyDivId, "' name='_apptBodyDivId' class='ImgCalendarDayGrid' style='width:100%; height:1008px; position:absolute;background-color:#E3E3DC;'>");
	html.append("<div id='", this._timeSelectionDivId, "' name='_timeSelectionDivId' class='calendar_time_selection' style='position:absolute; display:none;z-index:10;'></div>");
	html.append("<div id='", this._newApptDivId, "' name='_newApptDivId' class='appt-Selected' style='position:absolute; display:none;'></div>");

    html.append("<div id='", this._workingHrsFirstDivId, "' style='position:absolute;background-color:#FFFFFF;'><div class='ImgCalendarDayGrid' id='", this._workingHrsFirstChildDivId, "' style='position:absolute;top:0px;left:0px;overflow:hidden;'></div></div>");
    html.append("<div id='", this._workingHrsSecondDivId, "' style='position:absolute;background-color:#FFFFFF;'><div class='ImgCalendarDayGrid' id='", this._workingHrsSecondChildDivId, "' style='position:absolute;top:0px;left:0px;overflow:hidden;'></div></div>");

    html.append("<div id='", this._borderLeftDivId, "' name='_borderLeftDivId' class='ZmDayTabSeparator' style='background-color:#FFFFFF;position:absolute;'></div>");
    html.append("<div id='", this._borderRightDivId, "' name='_borderRightDivId' class='ZmDayTabSeparator' style='background-color:#FFFFFF;position:absolute;'></div>");
    html.append("<div id='", this._borderTopDivId, "' name='_borderTopDivId' class='ZmDayTabSeparator' style='background-color:#FFFFFF;position:absolute;'></div>");
    html.append("<div id='", this._borderBottomDivId, "' name='_borderBottomDivId' class='ZmDayTabSeparator' style='background-color:#FFFFFF;position:absolute;'></div>");
	html.append("</div>");
    // end of grid body

    //Strip to indicate the current time
    html.append("<div id='"+this._curTimeIndicatorGridDivId+"' name='_curTimeIndicatorGridDivId' class='calendar_cur_time_indicator_strip' style='position:absolute;background-color:#F16426; height: 1px;'></div>");
    //arrow to indicate the off-screen appointments
    html.append("<div id='"+this._startLimitIndicatorDivId+"' class='calendar_start_limit_indicator'><div class='ImgArrowMoreUp'></div></div>");
    html.append("<div id='"+this._endLimitIndicatorDivId+"' class='calendar_end_limit_indicator'><div class='ImgArrowMoreDown'></div></div>");

    //html.append("<div id='"+this._curTimeIndicatorGridDivId+"' name='_curTimeIndicatorGridDivId' class='calendar_cur_time_indicator_strip' style='position:absolute;background-color:#F16426; height: 1px;'></div>");
	html.append("</div>");

    // all day headings
	html.append("<div id='", this._tabsContainerDivId, "' name='_tabsContainerDivId' style='position:absolute;height:25px;bottom:0px;'>");
    html.append("<div id='", this._toggleBtnContainerId, "' name='_toggleBtnContainerId' style='position:absolute;bottom:0px;'></div>");
	html.append("<div id='", this._allDayHeadingDivId, "' name='_allDayHeadingDivId' style='", headerStyle,	"'>");

	html.append("</div>");
	html.append("</div>");
    // end of all day headings

	this.getHtmlElement().innerHTML = html.toString();
    func = AjxCallback.simpleClosure(ZmCalColView.__onScroll, ZmCalColView, this);
	document.getElementById(this._bodyDivId).onscroll = func;
	document.getElementById(this._allDayApptScrollDivId).onscroll = func;

	ids = [this._apptBodyDivId, this._bodyHourDivId, this._allDayDivId, this._allDaySepDivId];
	types = [ZmCalBaseView.TYPE_APPTS_DAYGRID, ZmCalBaseView.TYPE_HOURS_COL, ZmCalBaseView.TYPE_ALL_DAY, ZmCalBaseView.TYPE_DAY_SEP];
	for (i = 0; i < ids.length; i++) {
		this.associateItemWithElement(null, document.getElementById(ids[i]), types[i], ids[i]);
	}
	this._scrollToTime(8);
};


ZmCalDayTabView.prototype._layout =
function(refreshApptLayout) {
	DBG.println(AjxDebug.DBG2, "ZmCalColView in layout!");
	this._updateDays();

	var numCols = this._columns.length,
        sz = this.getSize(),
        width = sz.x,
        height = sz.y,
        hoursWidth = ZmCalColView._HOURS_DIV_WIDTH,
        bodyX = hoursWidth + this._daySepWidth,
        bodyY,
        unionX = ZmCalColView._HOURS_DIV_WIDTH,
        needHorzScroll,
        scrollFudge,
        allDayHeadingDiv = document.getElementById(this._allDayHeadingDivId),
        allDayHeadingDivHeight = Dwt.getSize(allDayHeadingDiv).y,
        numRows = this._allDayApptsRowLayouts ? (this._allDayApptsRowLayouts.length) : 1,
        percentageHeight,
        nearestNoOfRows,
        allDayScrollHeight,
        unionSepX;

	if (width == 0 || height == 0) { return; }

    height -= 25;
	this._needFirstLayout = false;
	bodyX += this._daySepWidth + ZmCalDayTabView._TAB_SEP_WIDTH;;

	// compute height for hours/grid
	this._bodyDivWidth = width - bodyX;

	// size appts divs
	this._apptBodyDivHeight = ZmCalColView._DAY_HEIGHT + 1; // extra for midnight to show up
	this._apptBodyDivWidth = Math.max(this._bodyDivWidth, this._calcMinBodyWidth(this._bodyDivWidth, numCols));
	needHorzScroll = this._apptBodyDivWidth > this._bodyDivWidth;

	this._horizontalScrollbar(needHorzScroll);

	if (needHorzScroll) this._apptBodyDivWidth -= 18;
	scrollFudge = needHorzScroll ? 20 : 0; // need all day to be a little wider then grid

    if(!this._toggleBtn) {
        this._setBounds(this._toggleBtnContainerId, 0, Dwt.DEFAULT, hoursWidth+ZmCalDayTabView._UNION_DIV_WIDTH+this._daySepWidth, Dwt.DEFAULT);
        this._toggleBtn = new DwtButton({parent:this, parentElement: this._toggleBtnContainerId, className: "ZButton ZPicker ZCalToggleBtn"});
        this._toggleBtn.setText(ZmMsg.calTabsMerge);
        this._toggleBtn.addListener(DwtEvent.ONCLICK, new AjxListener(this, this._toggleView));
    }

	// column headings
	Dwt.setBounds(allDayHeadingDiv, ZmCalDayTabView._UNION_DIV_WIDTH+hoursWidth+1, 0, this._apptBodyDivWidth + scrollFudge, Dwt.DEFAULT);
	// div for all day appts
	if (this._allDayApptsList && this._allDayApptsList.length > 0) {
        numRows++;
    }
	this._allDayFullDivHeight = (ZmCalColView._ALL_DAY_APPT_HEIGHT+ZmCalDayTabView._ALL_DAY_APPT_HEIGHT_PAD) * numRows + ZmCalDayTabView._ALL_DAY_APPT_HEIGHT_PAD;

	percentageHeight = (this._allDayFullDivHeight/height)*100;
	this._allDayDivHeight = this._allDayFullDivHeight;

	// if height overflows more than 50% of full height set its height
	// to nearest no of rows which occupies less than 50% of total height
	if (percentageHeight > 50) {
		nearestNoOfRows = Math.floor((0.50*height-ZmCalDayTabView._ALL_DAY_APPT_HEIGHT_PAD)/(ZmCalColView._ALL_DAY_APPT_HEIGHT+ZmCalDayTabView._ALL_DAY_APPT_HEIGHT_PAD));
		this._allDayDivHeight = (ZmCalColView._ALL_DAY_APPT_HEIGHT+ZmCalDayTabView._ALL_DAY_APPT_HEIGHT_PAD) * nearestNoOfRows + ZmCalDayTabView._ALL_DAY_APPT_HEIGHT_PAD;
	}

	this._setBounds(this._allDayApptScrollDivId, bodyX, allDayHeadingDivHeight+ZmCalDayTabView._TAB_BORDER_MARGIN, this._bodyDivWidth, this._allDayDivHeight+ZmCalDayTabView._TAB_BORDER_MARGIN);
	this._setBounds(this._allDayDivId, 0, 0, this._apptBodyDivWidth + scrollFudge, this._allDayFullDivHeight+ZmCalDayTabView._TAB_BORDER_MARGIN);

	this._allDayVerticalScrollbar(this._allDayDivHeight != this._allDayFullDivHeight);

	// div under year
	this._setBounds(this._yearAllDayDivId, 0, ZmCalDayTabView._TAB_BORDER_MARGIN, hoursWidth + ZmCalDayTabView._UNION_DIV_WIDTH + this._daySepWidth, this._allDayDivHeight);
    this._setBounds(this._yearHeadingDivId, 0, this._daySepWidth, hoursWidth + ZmCalDayTabView._UNION_DIV_WIDTH + this._daySepWidth, ZmCalColView._ALL_DAY_APPT_HEIGHT+2);
	// all day scroll
	allDayScrollHeight =  this._allDayDivHeight;
	this._setBounds(this._allDayScrollDivId, bodyX, 0, this._bodyDivWidth, allDayScrollHeight);

	// horiz separator between all day appts and grid
	this._setBounds(this._allDaySepDivId, 0, (this._hideAllDayAppt ? ZmCalColView._DAY_HEADING_HEIGHT : allDayScrollHeight)+2, width, ZmCalColView._ALL_DAY_SEP_HEIGHT);

	bodyY =  (this._hideAllDayAppt ? ZmCalColView._DAY_HEADING_HEIGHT : allDayScrollHeight) + ZmCalColView._ALL_DAY_SEP_HEIGHT +  (AjxEnv.isIE ? 0 : 2);

	this._bodyDivHeight = height - bodyY;

	// hours
	this._setBounds(this._hoursScrollDivId, 0, bodyY, hoursWidth, this._bodyDivHeight);

	// vert sep between hours and grid
	this._setBounds(this._leftApptSepDivId, hoursWidth, bodyY-ZmCalDayTabView._TAB_BORDER_WIDTH, this._daySepWidth, ZmCalColView._DAY_HEIGHT);

	// div for scrolling grid
	this._setBounds(this._bodyDivId, bodyX, bodyY, this._bodyDivWidth, this._bodyDivHeight);

	this._setBounds(this._apptBodyDivId, 0, -1, this._apptBodyDivWidth, this._apptBodyDivHeight);

    // sep in all day area
    unionSepX = unionX + ZmCalDayTabView._UNION_DIV_WIDTH;
    this._setBounds(this._unionHeadingSepDivId, unionSepX, ZmCalDayTabView._TAB_BORDER_MARGIN, this._daySepWidth, allDayScrollHeight+1);

    // div for scrolling union
    this._setBounds(this._unionGridScrollDivId, unionX, bodyY, ZmCalDayTabView._UNION_DIV_WIDTH, this._bodyDivHeight);
    this._setBounds(this._unionGridDivId, 0, -1, ZmCalDayTabView._UNION_DIV_WIDTH, this._apptBodyDivHeight+ZmCalColView._HOUR_HEIGHT);

    // sep in grid area
    this._setBounds(this._unionGridSepDivId, unionSepX, bodyY-ZmCalDayTabView._TAB_BORDER_MARGIN, this._daySepWidth, this._apptBodyDivHeight);

    this._bodyX = bodyX;
    this.layoutWorkingHours(this.workingHours);
	this._layoutAllDayAppts();

    this._apptBodyDivOffset   = Dwt.toWindow(document.getElementById(this._apptBodyDivId), 0, 0, null, true);
    this._apptAllDayDivOffset = Dwt.toWindow(document.getElementById(this._allDayDivId), 0, 0, null, true);


	this._layoutAppts();
    this._layoutUnionData();

};

ZmCalDayTabView.prototype.layoutWorkingHours =
function(workingHours){
    if(!workingHours) {
        workingHours = ZmCalBaseView.parseWorkingHours(ZmCalBaseView.getWorkingHours());
        this.workingHours = workingHours;
    }
    var numCols = this._columns.length;
    var dayWidth = this._calcColWidth(this._apptBodyDivWidth - Dwt.SCROLLBAR_WIDTH, numCols);

    var allDayHeadingDiv = document.getElementById(this._allDayHeadingDivId);
	var allDayHeadingDivHeight = Dwt.getSize(allDayHeadingDiv).y;

    var currentX = 0;
    var topBorderYPos = AjxEnv.isIE ? ZmCalDayTabView._TAB_BORDER_WIDTH : ZmCalColView._ALL_DAY_SEP_HEIGHT-ZmCalDayTabView._TAB_BORDER_WIDTH;

	for (var i = 0; i < numCols; i++) {
		var col = this._columns[i];

		// position day heading
		var day = this._days[col.dayIndex];
		this._setBounds(col.titleId, currentX+ZmCalDayTabView._TAB_BORDER_WIDTH+ZmCalDayTabView._TAB_SEP_WIDTH+2, Dwt.DEFAULT, Dwt.CLEAR, ZmCalColView._DAY_HEADING_HEIGHT);
		col.apptX = currentX + 2 ; //ZZZ
		col.apptWidth = dayWidth - 3*this._daySepWidth - ZmCalDayTabView._TAB_SEP_WIDTH;  //ZZZZ
		col.allDayX = col.apptX;
		col.allDayWidth = dayWidth - ZmCalDayTabView._TAB_SEP_WIDTH; // doesn't include sep

        //split into half hrs sections
        var dayIndex = day.date.getDay(),
            workingHrs = this.workingHours[dayIndex],
            pos = this.getPostionForWorkingHourDiv(dayIndex, 0);

        if(this._scheduleMode && day.isWorkingDay) {
            this.layoutWorkingHoursDiv(col.workingHrsFirstDivId, pos, currentX, dayWidth-ZmCalDayTabView._TAB_BORDER_MARGIN);
            if( workingHrs.startTime.length >= 2 &&
                workingHrs.endTime.length >= 2) {

                pos = this.getPostionForWorkingHourDiv(dayIndex, 1);
                this.layoutWorkingHoursDiv(col.workingHrsSecondDivId, pos, currentX, dayWidth-ZmCalDayTabView._TAB_BORDER_MARGIN);

            }
        }
        //set tab borders
        this._setBounds(col.borderTopDivId, currentX+this._bodyX, topBorderYPos, dayWidth-ZmCalDayTabView._TAB_BORDER_MARGIN, Dwt.CLEAR);
        this._setBounds(col.borderBottomDivId, currentX+ZmCalDayTabView._TAB_BORDER_WIDTH+ZmCalDayTabView._TAB_SEP_WIDTH+2, 0, dayWidth-ZmCalDayTabView._TAB_BORDER_MARGIN, Dwt.CLEAR);
        this._setBounds(col.borderLeftDivId, currentX, 0, ZmCalDayTabView._TAB_BORDER_WIDTH, this._apptBodyDivHeight);
        this._setBounds(col.borderRightDivId, currentX+dayWidth-ZmCalDayTabView._TAB_BORDER_WIDTH-ZmCalDayTabView._TAB_BORDER_MARGIN, 0, ZmCalDayTabView._TAB_BORDER_WIDTH, this._apptBodyDivHeight);

        this._setBounds(col.borderLeftAllDayDivId, currentX, 0, ZmCalDayTabView._TAB_BORDER_WIDTH, this._allDayDivHeight+ZmCalDayTabView._TAB_BORDER_WIDTH);
        this._setBounds(col.borderTopAllDayDivId, currentX, 0, dayWidth-ZmCalDayTabView._TAB_BORDER_MARGIN, Dwt.CLEAR);
        this._setBounds(col.borderRightAllDayDivId, currentX+dayWidth-ZmCalDayTabView._TAB_BORDER_WIDTH-ZmCalDayTabView._TAB_BORDER_MARGIN, 0, ZmCalDayTabView._TAB_BORDER_WIDTH, this._allDayDivHeight+ZmCalDayTabView._TAB_BORDER_WIDTH);

        currentX += dayWidth;

		//this._setBounds(col.headingDaySepDivId, currentX, 0, this._daySepWidth, allDayHeadingDivHeight + this._allDayDivHeight);
		this._setBounds(col.daySepDivId, currentX-ZmCalDayTabView._TAB_BORDER_MARGIN, 0, ZmCalDayTabView._TAB_SEP_WIDTH, this._apptBodyDivHeight);

		currentX += this._daySepWidth;
	}
};

ZmCalDayTabView.prototype._toggleView =
function() {
    if(!this._mergedView) {
        this._mergedView = true;
        this._toggleBtn.setText(ZmMsg.calTabsSplit);
    }
    else {
        this._mergedView = false;
        this._toggleBtn.setText(ZmMsg.calTabsMerge);
    }
    this.set(this._list, null, true);
};

ZmCalDayTabView.prototype._resetCalendarData =
function() {
	// TODO: optimize: if calendar list is same, skip!
    var titleParentEl = document.getElementById(this._allDayHeadingDivId),
        dayParentEl = document.getElementById(this._apptBodyDivId),
        allDaySepEl = document.getElementById(this._allDaySepDivId),
        allDayDivEl = document.getElementById(this._allDayDivId),
        cal,
        calName,
        calColor,
        mergedCal,
        calMergerdTabColor,
        col,
        html,
        calId,
        div,
        i,
        k;
	// remove existing
	// TODO: optimize, add/remove depending on new calendar length
	if (this._numCalendars > 0) {
		for (i = 0; i < this._numCalendars; i++) {
			col = this._columns[i];
			this._removeNode(col.titleId);
			//this._removeNode(col.headingDaySepDivId);
			this._removeNode(col.daySepDivId);
			this._removeNode(col.borderBottomDivId);
			this._removeNode(col.borderLeftDivId);
			this._removeNode(col.borderRightDivId);
			this._removeNode(col.borderTopDivId);
			this._removeNode(col.borderLeftAllDayDivId);
			this._removeNode(col.borderTopAllDayDivId);
			this._removeNode(col.borderRightAllDayDivId);
            this._removeNode(col.workingHrsFirstChildDivId);
			this._removeNode(col.workingHrsSecondChildDivId);
            this._removeNode(col.workingHrsFirstDivId);
			this._removeNode(col.workingHrsSecondDivId);
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

	for (i = 0; i < this._numCalendars; i++) {
        cal = this._calendars[i];
        calId = cal.id ? cal.id : "";
		col = this._columns[i] = {
			index: i,
			dayIndex: 0,
			cal: cal,
			titleId: Dwt.getNextId(),
			headingDaySepDivId: Dwt.getNextId(),
			daySepDivId: Dwt.getNextId(),
            workingHrsFirstDivId: Dwt.getNextId(),
            workingHrsSecondDivId: Dwt.getNextId(),
			apptX: 0, 		// computed in layout
			apptWidth: 0,	// computed in layout
			allDayX: 0, 	// computed in layout
			allDayWidth: 0,	// computed in layout
            borderLeftDivId: Dwt.getNextId(),
            borderRightDivId: Dwt.getNextId(),
            borderTopDivId: Dwt.getNextId(),
            borderBottomDivId: Dwt.getNextId(),
            borderLeftAllDayDivId: Dwt.getNextId(),
            borderTopAllDayDivId: Dwt.getNextId(),
            borderRightAllDayDivId: Dwt.getNextId(),
            workingHrsFirstChildDivId: Dwt.getNextId(),
            workingHrsSecondChildDivId: Dwt.getNextId()
		};
        calColor = this._mergedView ? "" : cal.rgb;
		this._folderIdToColIndex[cal.id] = col;
		if (cal.isRemote() && cal.rid && cal.zid) {
			this._folderIdToColIndex[cal.zid + ":" + cal.rid] = col;
		}

        this._createDivForColumn(col.workingHrsFirstDivId, dayParentEl, "", "#FFFFFF");
        div = this._createDivForColumn(col.workingHrsFirstChildDivId, col.workingHrsFirstDivId, "ImgCalendarDayGrid");
        div.setAttribute(ZmCalDayTabView.ATTR_CAL_ID, calId);
        this._createDivForColumn(col.workingHrsSecondDivId, dayParentEl, "", "#FFFFFF");
        div = this._createDivForColumn(col.workingHrsSecondChildDivId, col.workingHrsSecondDivId, "ImgCalendarDayGrid");
        div.setAttribute(ZmCalDayTabView.ATTR_CAL_ID, calId);
        this._createDivForColumn(col.borderBottomDivId, titleParentEl, "ZmDayTabSeparator", calColor, calColor);

        div = this._createDivForColumn(col.titleId, titleParentEl, this._mergedView ? "" : "ZmCalDayTab", calColor, calColor);
        div.style.top = ZmCalDayTabView._TAB_BORDER_WIDTH + 'px';
		if (this._mergedView) {
            //var div = this._createDivForColumn(Dwt.getNextId(), titleParentEl, "ZmCalDayTab", calColor, calColor);
            html = ["<table border=0><tr>"];
            for (k=0; k<this._calendars.length; k++) {
                mergedCal = this._calendars[k];
                calMergerdTabColor = mergedCal.rgb;
                calName = AjxStringUtil.htmlEncode(AjxStringUtil.clipByLength(mergedCal.getName(), ZmCalDayTabView._TAB_TITLE_MAX_LENGTH));
                html.push('<td class=ZmCalDayTab style="background-color: ', calMergerdTabColor, ';" valign="top">');
                html.push(calName);
                html.push('</td>');
                html.push('<td>&nbsp;</td>');
            }
            html.push('</tr</table>');
            div.innerHTML = html.join("");
		} else {
            calName = AjxStringUtil.htmlEncode(AjxStringUtil.clipByLength(cal.getName(), ZmCalDayTabView._TAB_TITLE_MAX_LENGTH));
            div.style.top = ZmCalDayTabView._TAB_BORDER_WIDTH + 'px';
			div.innerHTML = calName;
		}

        this._createDivForColumn(col.borderLeftAllDayDivId, allDayDivEl, "ZmDayTabSeparator", calColor, calColor);
        this._createDivForColumn(col.borderTopAllDayDivId, allDayDivEl, "ZmDayTabSeparator", calColor, calColor);
        this._createDivForColumn(col.borderRightAllDayDivId, allDayDivEl, "ZmDayTabSeparator", calColor, calColor);
        this._createDivForColumn(col.daySepDivId, dayParentEl, "ZmDayTabMarginDiv");
		this._createDivForColumn(col.borderLeftDivId, dayParentEl, "ZmDayTabSeparator", calColor, calColor);
        this._createDivForColumn(col.borderRightDivId, dayParentEl, "ZmDayTabSeparator", calColor, calColor);
        this._createDivForColumn(col.borderTopDivId, allDaySepEl, "ZmDayTabSeparator", calColor, calColor);

	}
};

ZmCalDayTabView.prototype._createDivForColumn =
function(id, parentEl, className, bgColor, borderColor, position, isSpan, calId) {
    var div = document.createElement(isSpan ? "span" : "div");
    div.className = className ? className : "";
    div.id = id;
    div.style.position = position ? position : 'absolute';
    if(bgColor) { div.style.backgroundColor = bgColor; }
    if(borderColor) { div.style.borderColor = borderColor; }
    if(parentEl) {
        parentEl = typeof parentEl === "string" ? document.getElementById(parentEl) : parentEl;
        parentEl.appendChild(div);
    }
    return div;
};


ZmCalDayTabView.prototype._layoutAllDayAppts =
function() {
	var rows = this._allDayApptsRowLayouts;
	if (!rows) { return; }

	var rowY = ZmCalColView._ALL_DAY_APPT_HEIGHT_PAD + 2;
	for (var i=0; i < rows.length; i++) {
		var row = rows[i];
		var num = this._mergedView ? 1 : this._numCalendars;
		for (var j=0; j < num; j++) {
			var slot = row[j];
			if (slot.data) {
				var appt = slot.data.appt;
                var div = document.getElementById(this._getItemId(appt));
                if(div) {
                    if (!this._mergedView) {
                        var cal = this._getColForFolderId(appt.folderId);
                        this._positionAppt(div, cal.allDayX+0, rowY);
                        this._sizeAppt(div, ((cal.allDayWidth + this._daySepWidth) * slot.data.numDays) - this._daySepWidth - 1 - ZmCalDayTabView._TAB_SEP_WIDTH,
                                     ZmCalColView._ALL_DAY_APPT_HEIGHT);
                    } else {
                        this._positionAppt(div, this._columns[j].allDayX+0, rowY);
                        this._sizeAppt(div, ((this._columns[j].allDayWidth + this._daySepWidth) * slot.data.numDays) - this._daySepWidth - 1 - ZmCalDayTabView._TAB_SEP_WIDTH,
                                     ZmCalColView._ALL_DAY_APPT_HEIGHT);
                    }
                }
			}
		}
		rowY += ZmCalColView._ALL_DAY_APPT_HEIGHT + ZmCalColView._ALL_DAY_APPT_HEIGHT_PAD;
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

ZmCalDayTabView.prototype._computeAllDayApptLayout =
function() {
	var adlist = this._allDayApptsList;
	adlist.sort(ZmCalBaseItem.compareByTimeAndDuration);

	for (var i=0; i < adlist.length; i++) {
		var appt = adlist[i];
		var data = this._allDayAppts[appt.getUniqueId()];
		if (data) {
			var col = this._mergedView ? this._columns[0] : this._getColForFolderId(data.appt.folderId);
			if (col)	 this._findAllDaySlot(col.index, data);
		}
	}
};

ZmCalDayTabView.prototype._layoutUnionDataDiv =
function(gridEl, allDayEl, i, data, numCols) {
	var enable = data instanceof Object;
	var id = this._unionBusyDivIds[i];
	var divEl = null;

	if (id == null) {
		if (!enable) { return; }
		id = this._unionBusyDivIds[i] = Dwt.getNextId();
		var divEl = document.createElement("div");
		divEl.style.position = 'absolute';
		divEl.className = "calendar_sched_union_div";
		this.associateItemWithElement(null, divEl, ZmCalBaseView.TYPE_SCHED_FREEBUSY, id, {index:i});

		Dwt.setOpacity(divEl, 40);

		if (i == 48) {
			//have to resize every layout, since all day div height might change
			allDayEl.appendChild(divEl);
		} else {
			// position/size once right here!
			Dwt.setBounds(divEl, 1, ZmCalColView._HALF_HOUR_HEIGHT*i+1, ZmCalDayTabView._UNION_DIV_WIDTH-2 , ZmCalColView._HALF_HOUR_HEIGHT-2);
			gridEl.appendChild(divEl);
		}

	} else {
		divEl =  document.getElementById(id);
	}
	// have to relayout each time
	//if (i == 48)	Dwt.setBounds(divEl, 1, 1, ZmCalColView._UNION_DIV_WIDTH-2, this._allDayDivHeight-2);

	var num = 0;
	for (var key in data) num++;

	Dwt.setOpacity(divEl, 20 + (60 * (num/numCols)));
	Dwt.setVisibility(divEl, enable);
};

/*
 * compute appt layout for appts that aren't all day
 */
ZmCalDayTabView.prototype._computeApptLayout =
function() {
//	DBG.println("_computeApptLayout");
//	DBG.timePt("_computeApptLayout: start", true);
	var layouts = this._layouts = new Array();
	var layoutsDayMap = [];
	var layoutsAllDay = [];
	var list = this.getList();
	if (!list) return;

	var size = list.size();
	if (size == 0) { return; }

	var overlap = null;
	var overlappingCol = null;

	for (var i=0; i < size; i++) {
		var ao = list.get(i);

		if (ao.isAllDayEvent()) {
			continue;
		}

		var newLayout = { appt: ao, col: 0, maxcol: -1};

		overlap = null;
		overlappingCol = null;

		var asd = ao.startDate;
		var aed = ao.endDate;

		var asdDate = asd.getDate();
		var aedDate = aed.getDate();

		var checkAllLayouts = (asdDate != aedDate);
		var layoutCheck = [];

		// if a appt starts n end in same day, it should be compared only with
		// other appts on same day and with those which span multiple days
		if (checkAllLayouts) {
			layoutCheck.push(layouts);
		} else {
			layoutCheck.push(layoutsAllDay);
			if (layoutsDayMap[asdDate]!=null) {
				layoutCheck.push(layoutsDayMap[asdDate]);
			}
		}

		// look for overlapping appts
		for (var k = 0; k < layoutCheck.length; k++) {
			for (var j=0; j < layoutCheck[k].length; j++) {
				var layout = layoutCheck[k][j];
				if (ao.isOverlapping(layout.appt, !this._mergedView)) {
					if (overlap == null) {
						overlap = [];
						overlappingCol = [];
					}
					overlap.push(layout);
					overlappingCol[layout.col] = true;
					// while we overlap, update our col
					while (overlappingCol[newLayout.col]) {
						newLayout.col++;
					}
				}
			}
		}

		// figure out who is on our right
		if (overlap != null) {
			for (var c in overlap) {
				var l = overlap[c];
				if (newLayout.col < l.col) {
					if (!newLayout.right) newLayout.right = [l];
					else newLayout.right.push(l);
				} else {
					if (!l.right) l.right = [newLayout];
					else l.right.push(newLayout);
				}
			}
		}
		layouts.push(newLayout);
		if (asdDate == aedDate) {
			if(!layoutsDayMap[asdDate]) {
				layoutsDayMap[asdDate] = [];
			}
			layoutsDayMap[asdDate].push(newLayout);
		} else {
			layoutsAllDay.push(newLayout);
		}
	}

	// compute maxcols
	for (var i=0; i < layouts.length; i++) {
		this._computeMaxCols(layouts[i], -1);
		this._layoutMap[this._getItemId(layouts[i].appt)]  = layouts[i];
//		DBG.timePt("_computeApptLayout: computeMaxCol "+i, false);
	}

	delete layoutsAllDay;
	delete layoutsDayMap;
	delete layoutCheck;
	//DBG.timePt("_computeApptLayout: end", false);
};
