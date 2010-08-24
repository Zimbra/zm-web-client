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

	DwtComposite.call(this, {parent:parent, className:className, posStyle:posStyle});

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

ZmCalBaseView._getColors = function(color) {
	// generate header and body colors
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
	var wHrsPerDay = wHrsString.split(','),
        i,
        wHrs = [],
        wDay,
        w,
        idx;

    for(i=0; i<wHrsPerDay.length; i++) {
        wDay = wHrsPerDay[i].split(':');
        w = {};
        idx = wDay[0];
        if(wDay[1] === "Y") {
            w.isWorkingDay = true;
        }
        else {
            w.isWorkingDay = false;
        }
        w.startTime = wDay[2];
        w.endTime = wDay[3];

        wHrs[idx] = w;
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
			this._selEv.item = this.getItemFromElement(div);
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
	var bContained = this._selectedItems.contains(clickedEl);

	DwtUiEvent.copy(this._selEv, ev);
	var item = this._selEv.item = this.getItemFromElement(clickedEl);
	var type = this._getItemData(clickedEl, "type");

	if (ev.shiftKey && bContained) {
		this._selectedItems.remove(clickedEl);
		clickedEl.className = this._getStyle(type);
		this._selEv.detail = DwtListView.ITEM_DESELECTED;
		this._evtMgr.notifyListeners(DwtEvent.SELECTION, this._selEv);
	} else if (!bContained) {
		// clear out old left click selection(s)
		for (i = 0; i < numSelectedItems; i++) {
			a[i].className = this._getStyle(type);
		}
		this._selectedItems.removeAll();

		// save new left click selection
		this._selectedItems.add(clickedEl);
		clickedEl.className = this._getStyle(type, true, !this.getEnabled(), item);
		this._selEv.detail = DwtListView.ITEM_SELECTED;
		this._evtMgr.notifyListeners(DwtEvent.SELECTION, this._selEv);
	}

	if (ev.button == DwtMouseEvent.RIGHT) {
		DwtUiEvent.copy(this._actionEv, ev);
		this._actionEv.item = item;
		this._evtMgr.notifyListeners(DwtEvent.ACTION, this._actionEv);
	}
};

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
	return item ? DwtId.getListViewItemId(DwtId.WIDGET_ITEM, this.view, item.getUniqueId()) : null;
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
	this._timeRangeEnd = this._days[this.numDays-1].date.getTime() + AjxDateUtil.MSEC_PER_DAY;
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
	if (list) {
		var size = list.size();
		if (size != 0) {
			for (var i=0; i < size; i++) {
				var ao = list.get(i);
				this.addAppt(ao);
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
