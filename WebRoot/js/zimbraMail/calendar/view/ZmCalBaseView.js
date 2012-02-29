/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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

ZmCalBaseView = function(parent, className, posStyle, controller, view, readonly) {
	if (arguments.length == 0) { return; }

	DwtComposite.call(this, {parent:parent, className:className, posStyle:posStyle, id:ZmId.getViewId(view)});

	this._isReadOnly = readonly;

	// BEGIN LIST-RELATED
	this._setMouseEventHdlrs();
	this.setCursor("default");

	this._listenerMouseOver = new AjxListener(this, ZmCalBaseView.prototype._mouseOverListener);
	this._listenerMouseOut = new AjxListener(this, ZmCalBaseView.prototype._mouseOutListener);
	this._listenerDoubleClick = new AjxListener(this, ZmCalBaseView.prototype._doubleClickListener);
	this._listenerMouseDown = new AjxListener(this, ZmCalBaseView.prototype._mouseDownListener);
	this._listenerMouseUp = new AjxListener(this, ZmCalBaseView.prototype._mouseUpListener);
	this._listenerMouseMove = new AjxListener(this, ZmCalBaseView.prototype._mouseMoveListener);
	this.addListener(DwtEvent.ONMOUSEOVER, this._listenerMouseOver);
	this.addListener(DwtEvent.ONMOUSEOUT, this._listenerMouseOut);
	this.addListener(DwtEvent.ONDBLCLICK, this._listenerDoubleClick);
	this.addListener(DwtEvent.ONMOUSEDOWN, this._listenerMouseDown);
	this.addListener(DwtEvent.ONMOUSEUP, this._listenerMouseUp);
	this.addListener(DwtEvent.ONMOUSEMOVE, this._listenerMouseMove);

	this._controller = controller;
	this.view = view;	
	this._evtMgr = new AjxEventMgr();	 
	this._selectedItems = new AjxVector();
	this._selEv = new DwtSelectionEvent(true);
	this._actionEv = new DwtListViewActionEvent(true);	

	this._normalClass = "appt";
	this._selectedClass = [this._normalClass, DwtCssStyle.SELECTED].join('-');
	this._disabledSelectedClass = [this._selectedClass, DwtCssStyle.DISABLED].join("-");

	// the key is the HTML ID of the item's associated DIV; the value is an object
	// with information about that row
	this._data = {};

	// END LIST-RELATED
		
	this._timeRangeStart = 0;
	this._timeRangeEnd = 0;
	this.addControlListener(new AjxListener(this, this._controlListener));	
	this._createHtml();
	this._needsRefresh = true;
};

ZmCalBaseView.prototype = new DwtComposite;
ZmCalBaseView.prototype.constructor = ZmCalBaseView;

ZmCalBaseView.TIME_SELECTION = "ZmCalTimeSelection";
ZmCalBaseView.VIEW_ACTION = "ZmCalViewAction";

ZmCalBaseView.TYPE_APPTS_DAYGRID = 1; // grid holding days, for example
ZmCalBaseView.TYPE_APPT = 2; // an appt
ZmCalBaseView.TYPE_HOURS_COL = 3; // hours on lefthand side
ZmCalBaseView.TYPE_APPT_BOTTOM_SASH = 4; // a sash for appt duration
ZmCalBaseView.TYPE_APPT_TOP_SASH = 5; // a sash for appt duration
ZmCalBaseView.TYPE_DAY_HEADER = 6; // over date header for a day
ZmCalBaseView.TYPE_MONTH_DAY = 7; // over a day in month view
ZmCalBaseView.TYPE_ALL_DAY = 8; // all day div area in day view
ZmCalBaseView.TYPE_SCHED_FREEBUSY = 9; // free/busy union
ZmCalBaseView.TYPE_DAY_SEP = 10;//allday separator

ZmCalBaseView.headerColorDelta = 0;
ZmCalBaseView.bodyColorDelta = .5;
ZmCalBaseView.deepenColorAdjustment = .9;
ZmCalBaseView.darkThreshold = (256 * 3) / 2;
ZmCalBaseView.deepenThreshold = .3;
ZmCalBaseView.WORK_HOURS_TIME_FORMAT = "HHmm";

ZmCalBaseView._getColors = function(color) {
	// generate header and body colors
    color = color || ZmOrganizer.COLOR_VALUES[ZmOrganizer.DEFAULT_COLOR[ZmOrganizer.CALENDAR]];
	var hs = { bgcolor: AjxColor.darken(color, ZmCalBaseView.headerColorDelta) };
	var hd = { bgcolor: AjxColor.deepen(hs.bgcolor, ZmCalBaseView.deepenColorAdjustment) };
	var bs = { bgcolor: AjxColor.lighten(color, ZmCalBaseView.bodyColorDelta)  };
	var bd = { bgcolor: AjxColor.deepen(bs.bgcolor, ZmCalBaseView.deepenColorAdjustment) };

	// ensure enough difference between background and deeper colors
	var cs = AjxColor.components(hs.bgcolor);
	var cd = AjxColor.components(hd.bgcolor);
	var ss = cs[0]+cs[1]+cs[2];
	var sd = cd[0]+cd[1]+cd[2];
	if (ss/sd > 1 - ZmCalBaseView.deepenThreshold) {
		hs.bgcolor = AjxColor.lighten(hd.bgcolor, ZmCalBaseView.deepenThreshold);
		bs.bgcolor = AjxColor.lighten(bd.bgcolor, ZmCalBaseView.deepenThreshold);
	}

	// use light text color for dark backgrounds
	hs.color = ZmCalBaseView._isDark(hs.bgcolor) && "#ffffff";
	hd.color = ZmCalBaseView._isDark(hd.bgcolor) && "#ffffff";
	bs.color = ZmCalBaseView._isDark(bs.bgcolor) && "#ffffff";
	bd.color = ZmCalBaseView._isDark(bd.bgcolor) && "#ffffff";

	return { standard: { header: hs, body: bs }, deeper: { header: hd, body: bd } };
};

ZmCalBaseView._toColorsCss =
function(object) {
	var a = [ "background-color:",object.bgcolor,";" ];
	if (object.color) {
		a.push("color:",object.color,";");
	}
	return a.join("");
};

ZmCalBaseView._isDark =
function(color) {
	var c = AjxColor.components(color);
	return c[0]+c[1]+c[2] < ZmCalBaseView.darkThreshold;
};

ZmCalBaseView.prototype.getController =
function() {
	return this._controller;
};

ZmCalBaseView.prototype.firstDayOfWeek =
function() {
	return appCtxt.get(ZmSetting.CAL_FIRST_DAY_OF_WEEK) || 0;
};


ZmCalBaseView.getWorkingHours =
function() {
	return appCtxt.get(ZmSetting.CAL_WORKING_HOURS) || 0;
};

ZmCalBaseView.parseWorkingHours =
function(wHrsString) {
    if(wHrsString === 0) {
        return [];
    }
	var userTimeZone = appCtxt.get(ZmSetting.DEFAULT_TIMEZONE),
        currentTimeZone = AjxTimezone.getServerId(AjxTimezone.DEFAULT),
        wHrsPerDay = wHrsString.split(','),
        i,
        wHrs = [],
        wDay,
        w,
        offset1,
        offset2,
        hourMinOffset = 0,
        idx,
        startDate = new Date(),
        endDate = new Date(),
        hourMin,
        startDayIdx,
        endDayIdx,
        curDayIdx = endDate.getDay(),
        tf = new AjxDateFormat(ZmCalBaseView.WORK_HOURS_TIME_FORMAT);

    //Helper inner functions, these functions takes the advantage of the fact that wHrs is available in local scope
    function isWorkingDay(idx) {
        return wHrs[idx] && wHrs[idx].isWorkingDay;
    }

    function setWorkingDay(idx, startTime, endTime) {
        if(isWorkingDay(idx)) {
            addWorkingTime(idx, startTime, endTime);
        }
        else {
            addWorkingDay(idx, startTime, endTime);
        }
    }

    function setNonWorkingDay(idx) {
        wHrs[idx] = {};
        wHrs[idx].isWorkingDay = false;
        wHrs[idx].startTime = ["0000"];
        wHrs[idx].endTime = ["0000"];
    }

    function addWorkingDay(idx, startTime, endTime) {
        wHrs[idx] = {};
        wHrs[idx].isWorkingDay = true;
        wHrs[idx].startTime = [startTime];
        wHrs[idx].endTime = [endTime];
    }

    function addWorkingTime(idx, startTime, endTime) {
        wHrs[idx].startTime.push(startTime);
        wHrs[idx].endTime.push(endTime);
    }
    
    if(userTimeZone != currentTimeZone) {
        offset1 = AjxTimezone.getOffset(AjxTimezone.getClientId(currentTimeZone), startDate);
        offset2 = AjxTimezone.getOffset(AjxTimezone.getClientId(userTimeZone), startDate);
        hourMinOffset = offset2 - offset1;
    }
    for(i=0; i<wHrsPerDay.length; i++) {
        wDay = wHrsPerDay[i].split(':');
        w = {};
        idx = wDay[0]-1;
        if(wDay[1] === "N") {
            if(!isWorkingDay(idx)) {
                setNonWorkingDay(idx);
            }
            continue;
        }

        if(hourMinOffset) {
            endDate = new Date();
            startDate = new Date();
            
            endDate.setHours(wDay[3]/100, wDay[3]%100);
            hourMin = endDate.getHours() * 60 + endDate.getMinutes() - hourMinOffset;
            endDate.setHours(hourMin/60, hourMin%60);
            endDayIdx = endDate.getDay();

            startDate.setHours(wDay[2]/100, wDay[2]%100);
            hourMin = startDate.getHours() * 60 + startDate.getMinutes() - hourMinOffset;
            startDate.setHours(hourMin/60, hourMin%60);
            startDayIdx = startDate.getDay();

            if(startDayIdx == curDayIdx && endDayIdx == curDayIdx) {
                //Case 1 working time starts current day and ends on the current day -- IDEAL one :)
                setWorkingDay(idx, tf.format(startDate), tf.format(endDate));
            }
            else if((endDayIdx == 0 && startDayIdx == 6) ||
                    (startDayIdx < curDayIdx  && endDayIdx == curDayIdx)) {
                //Case 2 working time starts prev day and ends on current day
                startDayIdx = idx-1;
                if(startDayIdx < 0) {
                   startDayIdx = 6;
                }
                setWorkingDay(startDayIdx, tf.format(startDate), "2400");
                setWorkingDay(idx, "0000", tf.format(endDate));
            }
            else if((startDayIdx == 6 && endDayIdx == 0) || 
                    (startDayIdx == curDayIdx  && endDayIdx > curDayIdx)) {
                //Case 3 working time starts current day and ends on next day
                endDayIdx = idx+1;
                if(endDayIdx > 6) {
                   endDayIdx = 0; 
                }
                setWorkingDay(endDayIdx, "0000", tf.format(endDate));
                setWorkingDay(idx, tf.format(startDate), "2400");
            }
            else if(startDayIdx < curDayIdx &&
                    endDayIdx < curDayIdx &&
                    startDayIdx == endDayIdx) {
                //EDGE CASE 1: working time starts and ends on the prev day
                startDayIdx = idx-1;
                setWorkingDay(startDayIdx, tf.format(startDate), tf.format(endDate));
                if(!isWorkingDay(idx)) {
                    setNonWorkingDay(idx);
                }
            }

            else if(startDayIdx > curDayIdx &&
                    endDayIdx > curDayIdx &&
                    startDayIdx == endDayIdx) {
                //EDGE CASE 2: working time starts and ends on the next day
                endDayIdx = idx+1;
                setWorkingDay(endDayIdx, tf.format(startDate), tf.format(endDate));
                if(!isWorkingDay(idx)) {
                    setNonWorkingDay(idx);
                }
            }            
        }
        else {
            //There is no timezone diff, client and server are in the same timezone
            setWorkingDay(idx, wDay[2], wDay[3]);
        }

    }
    return wHrs;
};

ZmCalBaseView.prototype.addViewActionListener =
function(listener) {
	this._evtMgr.addListener(ZmCalBaseView.VIEW_ACTION, listener);
};

ZmCalBaseView.prototype.removeViewActionListener =
function(listener) {
	this._evtMgr.removeListener(ZmCalBaseView.VIEW_ACTION, listener);
};

// BEGIN LIST-RELATED

ZmCalBaseView.prototype.addSelectionListener = 
function(listener) {
	this._evtMgr.addListener(DwtEvent.SELECTION, listener);
};

ZmCalBaseView.prototype.removeSelectionListener = 
function(listener) {
	this._evtMgr.removeListener(DwtEvent.SELECTION, listener);    	
};

ZmCalBaseView.prototype.addActionListener = 
function(listener) {
	this._evtMgr.addListener(DwtEvent.ACTION, listener);
};

ZmCalBaseView.prototype.removeActionListener = 
function(listener) {
	this._evtMgr.removeListener(DwtEvent.ACTION, listener);    	
};

ZmCalBaseView.prototype.getList = 
function() {
	return this._list;
};

ZmCalBaseView.prototype.associateItemWithElement =
function (item, element, type, optionalId) {
	DwtListView.prototype.associateItemWithElement.apply(this, arguments);
};

ZmCalBaseView.prototype.getItemFromElement =
function(el) {
	return DwtListView.prototype.getItemFromElement.apply(this, arguments);
};

ZmCalBaseView.prototype.getTargetItemDiv =
function(ev)  {
	return this.findItemDiv(DwtUiEvent.getTarget(ev));
};

ZmCalBaseView.prototype.findItemDiv =
function(el) {
	return DwtListView.prototype.findItemDiv.apply(this, arguments);
};

ZmCalBaseView.prototype._getItemData =
function(el, field, id) {
	return DwtListView.prototype._getItemData.apply(this, arguments);
};

ZmCalBaseView.prototype._setItemData =
function(id, field, value) {
	DwtListView.prototype._setItemData.apply(this, arguments);
};

ZmCalBaseView.prototype.deselectAll =
function() {
	var a = this._selectedItems.getArray();
	var sz = this._selectedItems.size();
	for (var i = 0; i < sz; i++) {
		a[i].className = this._getStyle(this._getItemData(a[i], "type"));
	}
	this._selectedItems.removeAll();
};

/**
 * Returns a style appropriate to the given item type. Subclasses should override to return
 * styles for different item types. This implementation does not consider the type.
 * 
 * @param type		[constant]*		a type constant
 * @param selected	[boolean]*		if true, return a style for an item that has been selected
 * @param disabled	[boolean]*		if true, return a style for an item that has been disabled
 * @param item		[object]*		item behind the div
 * 
 * @private
 */
ZmCalBaseView.prototype._getStyle =
function(type, selected, disabled, item) {
	return (!selected)
		? this._normalClass
		: (disabled ? this._disabledSelectedClass : this._selectedClass);
};

ZmCalBaseView.prototype.getToolTipContent =
function(ev) {
	var div = this.getTargetItemDiv(ev);
	if (!div) { return null; }
	if (this._getItemData(div, "type") != ZmCalBaseView.TYPE_APPT) { return null; }

	var item = this.getItemFromElement(div);
	return item.getToolTip(this._controller);
};

ZmCalBaseView.prototype.getApptDetails =
function(appt, callback, uid) {
	if (this._currentMouseOverApptId &&
		this._currentMouseOverApptId == uid)
	{
		this._currentMouseOverApptId = null;
		appt.getDetails(null, callback, null, null, true);
	}
};

ZmCalBaseView.prototype._mouseOutListener = 
function(ev) {
	var div = this.getTargetItemDiv(ev);
	if (!div) { return; }

	// NOTE: The DwtListView handles the mouse events on the list items
	//		 that have associated tooltip text. Therefore, we must
	//		 explicitly null out the tooltip content whenever we handle
	//		 a mouse out event. This will prevent the tooltip from
	//		 being displayed when we re-enter the listview even though
	//		 we're not over a list item.
	if (this._getItemData(div, "type") == ZmCalBaseView.TYPE_APPT) {
		this.setToolTipContent(null);
	}
	this._mouseOutAction(ev, div);
};

ZmCalBaseView.prototype._mouseOutAction = 
function(ev, div) {
	return true;
};


ZmCalBaseView.prototype._mouseMoveListener = 
function(ev) {
	// do nothing
};

// XXX: why not use Dwt.findAncestor?
ZmCalBaseView.prototype._findAncestor =
function(elem, attr) {
	while (elem && (elem[attr] == null)) {
		elem = elem.parentNode;
	}
	return elem;
};

ZmCalBaseView.prototype._mouseDownListener = 
function(ev) {
	if (this._isReadOnly) { return; }

	var div = this.getTargetItemDiv(ev);
	if (!div) {
		return this._mouseDownAction(ev, div);
	}

	this._clickDiv = div;
	if (this._getItemData(div, "type") == ZmCalBaseView.TYPE_APPT) {
		if (ev.button == DwtMouseEvent.LEFT || ev.button == DwtMouseEvent.RIGHT) {
			this._itemClicked(div, ev);
		}
	}
	return this._mouseDownAction(ev, div);
};

ZmCalBaseView.prototype._mouseDownAction = 
function(ev, div) {
	return !Dwt.ffScrollbarCheck(ev);
};

ZmCalBaseView.prototype._mouseUpListener = 
function(ev) {
	delete this._clickDiv;
	return this._mouseUpAction(ev, this.getTargetItemDiv(ev));
};

ZmCalBaseView.prototype._mouseUpAction = 
function(ev, div) {
	return !Dwt.ffScrollbarCheck(ev);
};

ZmCalBaseView.prototype._doubleClickAction = 
function(ev, div) { return true; };

ZmCalBaseView.prototype._doubleClickListener =
function(ev) {
	var div = this.getTargetItemDiv(ev);
	
	if (!div) { return;	}
		
	if (this._getItemData(div, "type") == ZmCalBaseView.TYPE_APPT) {
		if (this._evtMgr.isListenerRegistered(DwtEvent.SELECTION)) {
			DwtUiEvent.copy(this._selEv, ev);
			var item = this.getItemFromElement(div);
            var orig = item.getOrig();
            item = orig && orig.isMultiDay() ? orig : item;
			this._selEv.item = item;
			this._selEv.detail = DwtListView.ITEM_DBL_CLICKED;
			this._evtMgr.notifyListeners(DwtEvent.SELECTION, this._selEv);
		}
	}
	return this._doubleClickAction(ev, div);
};

ZmCalBaseView.prototype._itemClicked =
function(clickedEl, ev) {
	var i;
	var a = this._selectedItems.getArray();
	var numSelectedItems = this._selectedItems.size();

	// is this element currently in the selected items list?
    var clickedElSet = this._getItemClickedSet(clickedEl);
    // If one of a click set is contained, all should be.  Handles sliced up multi-day appts
	var bContained = this._selectedItems.contains(clickedElSet[0]);

	DwtUiEvent.copy(this._selEv, ev);
	var item = this._selEv.item = this.getItemFromElement(clickedElSet[0]);
	var type = this._getItemData(clickedElSet[0], "type");

	if (ev.shiftKey && bContained) {
        for (var i = 0; i < clickedElSet.length; i++) {
		    this._selectedItems.remove(clickedElSet[i]);
            clickedElSet[i].className = this._getStyle(type);
        }
		this._selEv.detail = DwtListView.ITEM_DESELECTED;
		this._evtMgr.notifyListeners(DwtEvent.SELECTION, this._selEv);
	} else if (!bContained) {
		// clear out old left click selection(s)
		for (i = 0; i < numSelectedItems; i++) {
			a[i].className = this._getStyle(type);
		}
		this._selectedItems.removeAll();

		// save new left click selection
        for (var i = 0; i < clickedElSet.length; i++) {
            this._selectedItems.add(clickedElSet[i]);
		    clickedElSet[i].className = this._getStyle(type, true, !this.getEnabled(), item);
        }
        this._selEv.detail = DwtListView.ITEM_SELECTED;
		this._evtMgr.notifyListeners(DwtEvent.SELECTION, this._selEv);
	}

	if (ev.button == DwtMouseEvent.RIGHT) {
		DwtUiEvent.copy(this._actionEv, ev);
		this._actionEv.item = item;
		this._evtMgr.notifyListeners(DwtEvent.ACTION, this._actionEv);
	}
};


ZmCalBaseView.prototype._getItemClickedSet =
function(clickedEl) {
    return [clickedEl];
}

// YUCK: ZmListView overloads b/c ZmListController thinks its always dealing w/ ZmListView's
ZmCalBaseView.prototype.setSelectionCbox = function(obj, bContained) {};
ZmCalBaseView.prototype.setSelectionHdrCbox = function(check) {};

ZmCalBaseView.prototype.setSelection =
function(item, skipNotify) {
	var el = this._getElFromItem(item);
	if (el) {
		var i;
		var a = this._selectedItems.getArray();
		var sz = this._selectedItems.size();
		for (i = 0; i < sz; i++) {
			a[i].className = this._getStyle(this._getItemData(a[i], "type"));
		}
		this._selectedItems.removeAll();
		this._selectedItems.add(el);
		el.className = this._getStyle(this._getItemData(el, "type"), true, !this.getEnabled(), item);
		if (!skipNotify && this._evtMgr.isListenerRegistered(DwtEvent.SELECTION)) {
			var selEv = new DwtSelectionEvent(true);
			selEv.button = DwtMouseEvent.LEFT;
			selEv.target = el;
			selEv.item = item;
			selEv.detail = DwtListView.ITEM_SELECTED;
			this._evtMgr.notifyListeners(DwtEvent.SELECTION, selEv);
		}	
	}
};

ZmCalBaseView.prototype.getSelectionCount =
function() {
	return this._selectedItems.size();
};

ZmCalBaseView.prototype.getSelection =
function() {
	var a = new Array();
	var sa = this._selectedItems.getArray();
	var saLen = this._selectedItems.size();
	for (var i = 0; i < saLen; i++) {
		a[i] = this.getItemFromElement(sa[i]);
	}
	return a;
};

ZmCalBaseView.prototype.getSelectedItems =
function() {
	return this._selectedItems;
};

ZmCalBaseView.prototype.handleActionPopdown = 
function(ev) {
	// clear out old right click selection
    ZmCalViewController._contextMenuOpened = false;

    if(ev && ev._ev && ev._ev.type === "mousedown"){//Only check for mouse events
        var htmlEl = DwtUiEvent.getTarget(ev._ev),
            element = document.getElementById(this._bodyDivId) || document.getElementById(this._daysId);

        if(element){
            while (htmlEl !== null) {
                if(htmlEl === element){
                    ZmCalViewController._contextMenuOpened = true;
                    break;
                }
                htmlEl = htmlEl.parentNode;
            }
        }
    }
};

// END LIST-RELATED

ZmCalBaseView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, this.getCalTitle()].join(": ");
};

ZmCalBaseView.prototype.needsRefresh = 
function() {
	return this._needsRefresh;
};

ZmCalBaseView.prototype.setNeedsRefresh = 
function(refresh) {
	 this._needsRefresh = refresh;
};

ZmCalBaseView.prototype._getItemId =
function(item) {
	return item ? (DwtId.getListViewItemId(DwtId.WIDGET_ITEM, this.view, item.getUniqueId())) : null;
};

ZmCalBaseView.prototype.addTimeSelectionListener = 
function(listener) {
	this.addListener(ZmCalBaseView.TIME_SELECTION, listener);
};

ZmCalBaseView.prototype.removeTimeSelectionListener = 
function(listener) { 
	this.removeListener(ZmCalBaseView.TIME_SELECTION, listener);
};

ZmCalBaseView.prototype.addDateRangeListener = 
function(listener) {
	this.addListener(DwtEvent.DATE_RANGE, listener);
};

ZmCalBaseView.prototype.removeDateRangeListener = 
function(listener) { 
	this.removeListener(DwtEvent.DATE_RANGE, listener);
};

ZmCalBaseView.prototype.getRollField =
function() {
	// override.
	return 0;
};

ZmCalBaseView.prototype.getDate =
function() {
	return this._date;
};
//to override
ZmCalBaseView.prototype.getAtttendees =
function() {
    return null;
};

ZmCalBaseView.prototype.getTimeRange =
function() {
	return { start: this._timeRangeStart, end: this._timeRangeEnd };
};

ZmCalBaseView.prototype.isInView =
function(appt) {
	return appt.isInRange(this._timeRangeStart, this._timeRangeEnd);
};

ZmCalBaseView.prototype.isStartInView =
function(appt) {
	return appt.isStartInRange(this._timeRangeStart, this._timeRangeEnd);
};

ZmCalBaseView.prototype.isEndInView =
function(appt) {
	return appt.isEndInRange(this._timeRangeStart, this._timeRangeEnd);
};

ZmCalBaseView.prototype._dayKey =
function(date) {
	return (date.getFullYear()+"/"+date.getMonth()+"/"+date.getDate());
};

ZmCalBaseView.prototype.setDate =
function(date, duration, roll) {
	this._duration = duration;
	this._date = new Date(date.getTime());
	var d = new Date(date.getTime());
	d.setHours(0, 0, 0, 0);
	var t = d.getTime();
	if (roll || t < this._timeRangeStart || t >= this._timeRangeEnd) {
		this._resetList();
		this._updateRange();		
		this._dateUpdate(true);
		this._updateTitle();
		
		// Notify any listeners
		if (this.isListenerRegistered(DwtEvent.DATE_RANGE)) {
			if (!this._dateRangeEvent)
				this._dateRangeEvent = new DwtDateRangeEvent(true);
			this._dateRangeEvent.item = this;
			this._dateRangeEvent.start = new Date(this._timeRangeStart);
			this._dateRangeEvent.end = new Date(this._timeRangeEnd);
			this.notifyListeners(DwtEvent.DATE_RANGE, this._dateRangeEvent);
		}
	} else {
		this._dateUpdate(false);
	}
};

ZmCalBaseView.prototype._dateUpdate =
function(rangeChanged) {
	// override: responsible for updating any view-specific data when the date
	// changes during a setDate call.
};

ZmCalBaseView.prototype._apptSelected =
function() {
	// override: called when an appointment is clicked to see if the view should
	// de-select a selected time range. For example, in day view if you have
	// selected the 8:00 AM row and then click on an appt, the 8:00 AM row
	// should be de-selected. If you are in month view though and have a day
	// selected, thne day should still be selected if the appt you clicked on is
	// in the same day.
};

// override
ZmCalBaseView.prototype._updateRange =
function() { 
	this._updateDays();
	this._timeRangeStart = this._days[0].date.getTime();
	//this._timeRangeEnd = this._days[this.numDays-1].date.getTime() + AjxDateUtil.MSEC_PER_DAY;
    var endDate = this._days[this.numDays-1].date;
    endDate.setHours(23, 59, 59, 999);
	this._timeRangeEnd = endDate.getTime();
};

// override 
ZmCalBaseView.prototype._updateTitle =
function() { };

ZmCalBaseView.prototype.addAppt = 
function(ao) {
	var item = this._createItemHtml(ao);
	var div = this._getDivForAppt(ao);
	if (div) div.appendChild(item);

	this._postApptCreate(ao,div);	
};

// override
ZmCalBaseView.prototype._postApptCreate =
function(appt,div) {
};

ZmCalBaseView.prototype.set = 
function(list) {
	this._preSet();
	this._selectedItems.removeAll();
	var newList = list;
	if(list && (list == this._list)) {
		newList = list.clone();
	}
	this._resetList();
	this._list = newList;	
    var showDeclined = appCtxt.get(ZmSetting.CAL_SHOW_DECLINED_MEETINGS);
    if (list) {
		var size = list.size();
		if (size != 0) {
			for (var i=0; i < size; i++) {
				var ao = list.get(i);
                if (showDeclined || (ao.ptst != ZmCalBaseItem.PSTATUS_DECLINED)) {
				    this.addAppt(ao);
                }
			}
		}
	}
	this._postSet(list);
};

// override
ZmCalBaseView.prototype._fanoutAllDay =
function(appt) {
	return true;
};

// override
ZmCalBaseView.prototype._postSet =
function(appt) {};

// override
ZmCalBaseView.prototype._preSet =
function(appt) {};

// override
ZmCalBaseView.prototype._getDivForAppt =
function(appt) {};

ZmCalBaseView.prototype._addApptIcons =
function(appt, html, idx) {
	html[idx++] = "<table border=0 cellpadding=0 cellspacing=0 style='display:inline'><tr>";

	if (appt.otherAttendees) {
		html[idx++] = "<td>";
		html[idx++] = AjxImg.getImageHtml("ApptMeeting");
		html[idx++] = "</td>";
	}

	if (appt.isException) {
		html[idx++] = "<td>";
		html[idx++] = AjxImg.getImageHtml("ApptException");
		html[idx++] = "</td>";
	} else if (appt.isRecurring()) {
		html[idx++] = "<td>";
		html[idx++] = AjxImg.getImageHtml("ApptRecur");
		html[idx++] = "</td>";
	}

	if (appt.alarm) {
		html[idx++] = "<td>";
		html[idx++] = AjxImg.getImageHtml("ApptReminder");
		html[idx++] = "</td>";
	}
	html[idx++] = "</tr></table>";

	return idx;
};

ZmCalBaseView.prototype._getElFromItem = 
function(item) {
	return document.getElementById(this._getItemId(item));
};

ZmCalBaseView.prototype._resetList =
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
	list.removeAll();
	this.removeAll();
};

ZmCalBaseView.prototype.removeAll =
function() {
	this._selectedItems.removeAll();
};

ZmCalBaseView.prototype.layoutView =
function() {
    this._layout();
};

ZmCalBaseView.prototype.getCalTitle = 
function() {
	return this._title;
};

ZmCalBaseView.prototype._getStartDate =
function() {
	var timeRange = this.getTimeRange();
	return new Date(timeRange.start);
};

// override
ZmCalBaseView.prototype._createItemHtml =
function(appt) {};

// override
ZmCalBaseView.prototype._createHtml =
function() {};

// override
ZmCalBaseView.prototype.checkIndicatorNeed =
function(viewId, startDate) {};

ZmCalBaseView.prototype._controlListener =
function(ev) {
	if ((ev.oldWidth != ev.newWidth) ||
		(ev.oldHeight != ev.newHeight))
	{
		this._layout();
	}
};

// override
ZmCalBaseView.prototype._layout =
function() {};

ZmCalBaseView.prototype._timeSelectionEvent =
function(date, duration, isDblClick, allDay, folderId, shiftKey) {
	if (!this._selectionEvent) this._selectionEvent = new DwtSelectionEvent(true);
	var sev = this._selectionEvent;
	sev._isDblClick = isDblClick;
	sev.item = this;
	sev.detail = date;
	sev.duration = duration;
	sev.isAllDay = allDay;
	sev.folderId = folderId;
	sev.force = false;
	sev.shiftKey = shiftKey;
	this.notifyListeners(ZmCalBaseView.TIME_SELECTION, this._selectionEvent);
	sev._isDblClick = false;
};


ZmCalBaseView._setApptOpacity =
function(appt, div) {
    var opacity = this.getApptOpacity(appt);
	Dwt.setOpacity(div, opacity);
};

ZmCalBaseView.getApptOpacity =
function(appt) {
    var opacity = 100;

    switch (appt.ptst) {
		case ZmCalBaseItem.PSTATUS_DECLINED:	opacity = ZmCalColView._OPACITY_APPT_DECLINED;  break;
		case ZmCalBaseItem.PSTATUS_TENTATIVE:	opacity = ZmCalColView._OPACITY_APPT_TENTATIVE; break;
		default:								opacity = ZmCalColView._OPACITY_APPT_NORMAL;    break;
	}

	// obey free busy status for organizer's appts
	if (appt.fba && appt.isOrganizer()) {
		 switch (appt.fba) {
			case "F":	opacity = ZmCalColView._OPACITY_APPT_FREE; break;
			case "B":	opacity = ZmCalColView._OPACITY_APPT_BUSY; break;
			case "T":	opacity = ZmCalColView._OPACITY_APPT_TENTATIVE; break;
		 }
	}
    return opacity;
};

ZmCalBaseView._emptyHdlr =
function(ev) {
	var mouseEv = DwtShell.mouseEvent;
	mouseEv.setFromDhtmlEvent(ev);
	mouseEv._stopPropagation = true;
	mouseEv._returnValue = false;
	mouseEv.setToDhtmlEvent(ev);
	return false;
};


ZmCalBaseView.prototype._apptMouseDownAction =
function(ev, apptEl, appt) {
	if (ev.button != DwtMouseEvent.LEFT) { return false; }

    if (!appt) {
        appt = this.getItemFromElement(apptEl);
    }
	var calendar = appCtxt.getById(appt.folderId);
	var isRemote = Boolean(calendar.url);
    if (appt.isReadOnly() || isRemote) return false;

	var apptOffset = Dwt.toWindow(ev.target, ev.elementX, ev.elementY, apptEl, false);

	var data = {
		dndStarted: false,
		appt: appt,
		view: this,
		apptEl: apptEl,
		apptOffset: apptOffset,
		docX: ev.docX,
		docY: ev.docY
	};

	var capture = new DwtMouseEventCapture({
		targetObj:data,
		mouseOverHdlr:ZmCalBaseView._emptyHdlr,
		mouseDownHdlr:ZmCalBaseView._emptyHdlr, // mouse down (already handled by action)
		mouseMoveHdlr:ZmCalBaseView._apptMouseMoveHdlr,
		mouseUpHdlr:  ZmCalBaseView._apptMouseUpHdlr,
		mouseOutHdlr: ZmCalBaseView._emptyHdlr
	});
    DBG.println(AjxDebug.DBG3,"data.docX,Y: " + data.docX + "," + data.docY);

    this._createContainerRect(data);
    // Problem with Month View ??
    this._controller.setCurrentListView(this);

	capture.capture();
	return false;
};



ZmCalBaseView.prototype._getApptDragProxy =
function(data) {
	// set icon
	var icon;
	if (this._apptDragProxyDivId == null) {
		icon = document.createElement("div");
		icon.id = this._apptDragProxyDivId = Dwt.getNextId();
		Dwt.setPosition(icon, Dwt.ABSOLUTE_STYLE);
		this.shell.getHtmlElement().appendChild(icon);
		Dwt.setZIndex(icon, Dwt.Z_DND);
	} else {
		icon = document.getElementById(this._apptDragProxyDivId);
	}
	icon.className = DwtCssStyle.NOT_DROPPABLE;

	var appt = data.appt;
	var formatter = AjxDateFormat.getDateInstance(AjxDateFormat.SHORT);
	var color = ZmCalendarApp.COLORS[this._controller.getCalendarColor(appt.folderId)];
	if (appt.ptst != ZmCalBaseItem.PSTATUS_NEEDS_ACTION) {
		color += "Bg";
	}

	var proxyData = {
		shortDate: formatter.format(appt.startDate),
		dur: appt.getShortStartHour(),
		color: color,
		apptName: AjxStringUtil.htmlEncode(appt.getName())
	};

	icon.innerHTML = AjxTemplate.expand("calendar.Calendar#ApptDragProxy", proxyData);

	var imgHtml = AjxImg.getImageHtml("RoundPlus", "position:absolute; top:30; left:-11; visibility:hidden");
	icon.appendChild(Dwt.parseHtmlFragment(imgHtml));

	return icon;
};



ZmCalBaseView._apptMouseMoveHdlr =
function(ev) {
    var data = DwtMouseEventCapture.getTargetObj();
    if (!data) return false;

	var mouseEv = DwtShell.mouseEvent;
	mouseEv.setFromDhtmlEvent(ev, true);
    var view = data.view;

	var deltaX = mouseEv.docX - data.docX;
	var deltaY = mouseEv.docY - data.docY;
    DBG.println(AjxDebug.DBG3,"_apptMouseMoveHdlr mouseEv.docY: " + mouseEv.docY + ",   data.docY: " + data.docY);

	if (!data.dndStarted) {
		var withinThreshold = (Math.abs(deltaX) < ZmCalColView.DRAG_THRESHOLD && Math.abs(deltaY) < ZmCalColView.DRAG_THRESHOLD);
		if (withinThreshold || !view._apptDndBegin(data)) {
			mouseEv._stopPropagation = true;
			mouseEv._returnValue = false;
			mouseEv.setToDhtmlEvent(ev);
			return false;
		}
	}

	if (view._apptDraggedOut(mouseEv.docX, mouseEv.docY)) {
		// simulate DND
        DBG.println(AjxDebug.DBG3,"MouseMove DragOut");
        view._dragOut(mouseEv, data);
	}
	else
	{
		if (data._lastDraggedOut) {
			data._lastDraggedOut = false;
			if (data.icon) {
				Dwt.setVisible(data.icon, false);
			}
            view._restoreHighlight(data);
		}
        var obj = data.dndObj;
		obj._lastDestDwtObj = null;
        if (!data.disableScroll) {
            var scrollOffset = view._handleApptScrollRegion(mouseEv.docX, mouseEv.docY, ZmCalColView._HOUR_HEIGHT, data);
            if (scrollOffset != 0) {
                deltaY += scrollOffset;
            }
        }

		// snap new location to grid
        view._doApptMove(data, deltaX, deltaY);
	}
	mouseEv._stopPropagation = true;
	mouseEv._returnValue = false;
	mouseEv.setToDhtmlEvent(ev);
	return false;
};



ZmCalBaseView.prototype._dragOut =
function(mouseEv, data) {
    // simulate DND
    var obj = data.dndObj;
    if (!data._lastDraggedOut) {
        data._lastDraggedOut = true;
        this._clearSnap(data.snap);
        data.startDate = new Date(data.appt.getStartTime());
        this._restoreApptLoc(data);
        if (!data.icon) {
            data.icon = this._getApptDragProxy(data);
        }
        Dwt.setVisible(data.icon, true);
    }
    Dwt.setLocation(data.icon, mouseEv.docX+5, mouseEv.docY+5);
    var destDwtObj = mouseEv.dwtObj;
    var obj = data.dndObj;

    if (destDwtObj && destDwtObj._dropTarget)
    {
        if (destDwtObj != obj._lastDestDwtObj ||
            destDwtObj._dropTarget.hasMultipleTargets())
        {
            //DBG.println("dwtObj = "+destDwtObj._dropTarget);
            if (destDwtObj._dropTarget._dragEnter(Dwt.DND_DROP_MOVE, destDwtObj, {data: data.appt}, mouseEv, data.icon)) {
                //obj._setDragProxyState(true);
                data.icon.className = DwtCssStyle.DROPPABLE;
                obj._dropAllowed = true;
                destDwtObj._dragEnter(mouseEv);
            } else {
                //obj._setDragProxyState(false);
                data.icon.className = DwtCssStyle.NOT_DROPPABLE;
                obj._dropAllowed = false;
            }
        } else if (obj._dropAllowed) {
            destDwtObj._dragOver(mouseEv);
        }
    } else {
        data.icon.className = DwtCssStyle.NOT_DROPPABLE;
        //obj._setDragProxyState(false);
    }

    if (obj._lastDestDwtObj &&
        obj._lastDestDwtObj != destDwtObj &&
        obj._lastDestDwtObj._dropTarget &&
        obj._lastDestDwtObj != obj)
    {
        obj._lastDestDwtObj._dragLeave(mouseEv);
        obj._lastDestDwtObj._dropTarget._dragLeave();
    }
    obj._lastDestDwtObj = destDwtObj;

}

ZmCalBaseView.prototype._apptDraggedOut =
function(docX, docY) {
    var draggedOut = this._containerRect ? true : false;
    return draggedOut &&
           ((docY < this._containerRect.y) ||
            (docY > (this._containerRect.y + this._containerRect.height)) ||
            (docX < this._containerRect.x) ||
            (docX > (this._containerRect.x + this._containerRect.width)));
};

ZmCalBaseView._apptMouseUpHdlr =
function(ev) {
	//DBG.println("ZmCalBaseView._apptMouseUpHdlr: "+ev.shiftKey);
	var data = DwtMouseEventCapture.getTargetObj();


	var mouseEv = DwtShell.mouseEvent;
    if (ev && mouseEv) {
	    mouseEv.setFromDhtmlEvent(ev, true);
    }
	DwtMouseEventCapture.getCaptureObj().release();

	var draggedOut = data.view._apptDraggedOut(mouseEv.docX, mouseEv.docY);

	if (data.dndStarted) {
        data.view._deselectDnDHighlight(data);
		//notify Zimlet when an appt is dragged.
 		appCtxt.notifyZimlets("onApptDrag", [data]);
		if (data.startDate.getTime() != data.appt._orig.getStartTime() && !draggedOut) {
			if (data.icon) Dwt.setVisible(data.icon, false);
			// save before we muck with start/end dates
			var origDuration = data.appt._orig.getDuration();
			data.view._autoScrollDisabled = true;
			var cc = appCtxt.getCurrentController();
			var endDate = new Date(data.startDate.getTime() + origDuration);
			var errorCallback = new AjxCallback(null, ZmCalColView._handleDnDError, data);
			var sdOffset = data.startDate ? (data.startDate.getTime() - data.appt._orig.getStartTime()) : null;
			var edOffset = endDate ? (endDate.getTime() - data.appt._orig.getEndTime() ) : null;
			cc.dndUpdateApptDate(data.appt._orig, sdOffset, edOffset, null, errorCallback, mouseEv);
		} else {
            data.view._restoreAppt(data);
		}

		if (draggedOut) {
			var obj = data.dndObj;
			obj._lastDestDwtObj = null;
			var destDwtObj = mouseEv.dwtObj;
			if (destDwtObj != null &&
				destDwtObj._dropTarget != null &&
				obj._dropAllowed &&
				destDwtObj != obj)
			{
				destDwtObj._drop(mouseEv);
				var srcData = {
					data: data.appt,
					controller: data.view._controller
				};
				destDwtObj._dropTarget._drop(srcData, mouseEv);
				obj._dragging = DwtControl._NO_DRAG;
				if (data.icon) Dwt.setVisible(data.icon, false);
			}
			else {
				// The following code sets up the drop effect for when an
				// item is dropped onto an invalid target. Basically the
				// drag icon will spring back to its starting location.
				var bd = data.view._badDrop = { dragEndX: mouseEv.docX, dragEndY: mouseEv.docY, dragStartX: data.docX, dragStartY: data.docY };
				bd.icon = data.icon;
				if (data.view._badDropAction == null) {
					data.view._badDropAction = new AjxTimedAction(data.view, data.view._apptBadDropEffect);
				}

				// Line equation is y = mx + c. Solve for c, and set up d (direction)
				var m = (bd.dragEndY - bd.dragStartY) / (bd.dragEndX - bd.dragStartX);
				data.view._badDropAction.args = [m, bd.dragStartY - (m * bd.dragStartX), (bd.dragStartX - bd.dragEndX < 0) ? -1 : 1];
				AjxTimedAction.scheduleAction(data.view._badDropAction, 0);
			}
		}
	}

    if (mouseEv) {
        mouseEv._stopPropagation = true;
        mouseEv._returnValue = false;
        if (ev) {
            mouseEv.setToDhtmlEvent(ev);
        }
    }
	return false;
};

ZmCalBaseView.prototype._deselectDnDHighlight =
function(data) {
}
ZmCalBaseView.prototype._restoreAppt =
function(data) {
}


ZmCalBaseView.prototype._apptBadDropEffect =
function(m, c, d) {
	var usingX = (Math.abs(m) <= 1);
	// Use the bigger delta to control the snap effect
	var bd = this._badDrop;
	var delta = usingX ? bd.dragStartX - bd.dragEndX : bd.dragStartY - bd.dragEndY;
	if (delta * d > 0) {
		if (usingX) {
			bd.dragEndX += (30 * d);
			bd.icon.style.top = m * bd.dragEndX + c;
			bd.icon.style.left = bd.dragEndX;
		} else {
			bd.dragEndY += (30 * d);
			bd.icon.style.top = bd.dragEndY;
			bd.icon.style.left = (bd.dragEndY - c) / m;
		}
		AjxTimedAction.scheduleAction(this._badDropAction, 0);
	} else {
		Dwt.setVisible(bd.icon, false);
		bd.icon = null;
	}
};

// --- Functions to be overridden for DnD
ZmCalBaseView.prototype._createContainerRect =
function(data) {
    this._containerRect = new DwtRectangle(0,0,0,0);
}

ZmCalBaseView.prototype._clearSnap =
function(snap) { }

ZmCalBaseView.prototype._apptDndBegin =
function(data) {
    return  false;
}

ZmCalBaseView.prototype._restoreHighlight =
function(data) { }

ZmCalBaseView.prototype._doApptMove =
function(data, deltaX, deltaY) { }

ZmCalBaseView.prototype._restoreApptLoc =
function(data) { }

ZmCalBaseView.prototype._handleApptScrollRegion =
function(docX, docY, incr, data) {  }
