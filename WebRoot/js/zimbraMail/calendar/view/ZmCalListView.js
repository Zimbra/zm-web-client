/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010 Zimbra, Inc.
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

ZmCalListView = function(parent, posStyle, controller, dropTgt) {
	if (arguments.length == 0) { return; }

	var params = {
		parent: parent,
		posStyle: posStyle,
		controller: controller,
		dropTgt: dropTgt,
		view: ZmId.VIEW_CAL_LIST,
		headerList: this._getHeaderList(parent),
		pageless: true
	};

	ZmListView.call(this, params);

	// add date-search bar first
	this._dateSearchBar = new DwtComposite({parent:parent, className:"calendar_date_search"});
	this._createSearchBarHtml();

	this._needsRefresh = true;
	this._timeRangeStart = 0;
	this._timeRangeEnd = 0;
	this._title = "";
	this._bSortAsc = true;
	this._defaultSortField = ZmItem.F_DATE;

	this.setDragSource(controller._dragSrc);
};

ZmCalListView.prototype = new ZmListView;
ZmCalListView.prototype.constructor = ZmCalListView;


// Consts
ZmCalListView.DEFAULT_CALENDAR_PERIOD	= AjxDateUtil.MSEC_PER_DAY * 14;			// 2 weeks
ZmCalListView.COL_WIDTH_DATE			= ZmMsg.COLUMN_WIDTH_DATE_CAL;
ZmCalListView.COL_WIDTH_LOCATION		= ZmMsg.COLUMN_WIDTH_LOCATION_CAL;
ZmCalListView.COL_WIDTH_STATUS			= ZmMsg.COLUMN_WIDTH_STATUS_CAL;
ZmCalListView.COL_WIDTH_FOLDER			= ZmMsg.COLUMN_WIDTH_FOLDER_CAL;


// Public methods

ZmCalListView.prototype.toString =
function() {
	return "ZmCalListView";
};


// ZmCalBaseView methods

ZmCalListView.prototype.getTimeRange =
function() {
	return { start:this._timeRangeStart, end:this._timeRangeEnd };
};

ZmCalListView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, this.getCalTitle()].join(": ");
};

ZmCalListView.prototype.getCalTitle =
function() {
	return this._title;
};

ZmCalListView.prototype.needsRefresh =
function() {
	return this._needsRefresh;
};

ZmCalListView.prototype.setNeedsRefresh =
function(needsRefresh) {
	this._needsRefresh = needsRefresh;
};

ZmCalListView.prototype.getDate =
function() {
	return this._date;
};

ZmCalListView.prototype.setDate =
function(date, duration, roll) {
	this._date = new Date(date.getTime());

	var d = new Date(date.getTime());
	d.setHours(0, 0, 0, 0);
	this._timeRangeStart = d.getTime();
	this._timeRangeEnd = this._timeRangeStart + ZmCalListView.DEFAULT_CALENDAR_PERIOD;

	this._updateTitle();
	this._segmentedDates = [];

	// update widgets
	var startDate = new Date(this._timeRangeStart);
	var endDate = new Date(this._timeRangeEnd);
	this._startDateField.value = AjxDateUtil.simpleComputeDateStr(startDate);
	this._endDateField.value = AjxDateUtil.simpleComputeDateStr(endDate);

	this._updateDateRange(startDate, endDate);

	// Notify any listeners
	if (this.isListenerRegistered(DwtEvent.DATE_RANGE)) {
		if (!this._dateRangeEvent) {
			this._dateRangeEvent = new DwtDateRangeEvent(true);
		}
		this._dateRangeEvent.item = this;
		this._dateRangeEvent.start = new Date(this._timeRangeStart);
		this._dateRangeEvent.end = new Date(this._timeRangeEnd);
		this.notifyListeners(DwtEvent.DATE_RANGE, this._dateRangeEvent);
	}
};

ZmCalListView.prototype.getRollField =
function() {
	return AjxDateUtil.TWO_WEEKS;
};

ZmCalListView.prototype._fanoutAllDay =
function(appt) {
	return false;
};

ZmCalListView.prototype._apptSelected =
function() {
	// do nothing
};

ZmCalListView.prototype._updateTitle =
function() {
	var dayFormatter = DwtCalendar.getDayFormatter();
	var start = new Date(this._timeRangeStart);
	var end = new Date(this._timeRangeEnd);

	this._title = [
		dayFormatter.format(start), " - ", dayFormatter.format(end)
	].join("");
};

ZmCalListView.prototype._updateDateRange =
function(startDate, endDate) {
	var params = [
		AjxDateUtil._getMonthName(startDate, true),
		startDate.getDate(),
		AjxDateUtil._getMonthName(endDate, true),
		endDate.getDate()
	];
	this._dateRangeField.innerHTML = AjxMessageFormat.format(ZmMsg.viewCalListDateRange, params);
};

ZmCalListView.prototype.addTimeSelectionListener =
function(listener) {
	// do nothing
};

ZmCalListView.prototype.addDateRangeListener =
function(listener) {
	this.addListener(DwtEvent.DATE_RANGE, listener);
};

ZmCalListView.prototype.addViewActionListener =
function(listener) {
	// do nothing
};


// DwtListView methods

/**
 * Sets the initial set of results when user first comes to the listview
 *
 * @param list					[AjxVector]		data as a list
 * @param skipMiniCalUpdate		[Boolean]		skip mini cal update
 * @param skipSort				[Boolean]		skip sorting
 */
ZmCalListView.prototype.set =
function(list, skipMiniCalUpdate, skipSort) {
	if (!skipSort) {
		if ((this._defaultSortField != ZmItem.F_DATE) ||
			(this._defaultSortField == ZmItem.F_DATE && !this._bSortAsc))
		{
			this._sortList(list, this._defaultSortField);
		}
	}
	ZmListView.prototype.set.call(this, list, this._defaultSortField);

	// bug 49340 - fix slow rendering issue with IE. Always call layout after
	// list is set.
	if (AjxEnv.isIE) {
		this.parent._layout();
	}
};

ZmCalListView.prototype.setBounds =
function(x, y, width, height) {
	// set height to 32px (plus 1px for bottom border) to adjust for the new date-range toolbar
	ZmListView.prototype.setBounds.call(this, x, 33, width, height-33);
};

ZmCalListView.prototype._getItemId =
function(item) {
	var itemId = (item && item.id) ? item.getUniqueId(true) : Dwt.getNextId();
	return DwtId.getListViewItemId(DwtId.WIDGET_ITEM, this._view, itemId);
};

ZmCalListView.prototype._getFieldId =
function(item, field) {
	var itemId = (item && item.getUniqueId) ? item.getUniqueId(true) : item.id;
	return DwtId.getListViewItemId(DwtId.WIDGET_ITEM_FIELD, this._view, itemId, field);
};

ZmCalListView.prototype._getCellId =
function(item, field) {
	if (field == ZmItem.F_SUBJECT ||
		field == ZmItem.F_DATE)
	{
		return this._getFieldId(item, field);
	}
};

ZmCalListView.prototype._getCellContents =
function(htmlArr, idx, appt, field, colIdx, params) {
	if (field == ZmItem.F_RECURRENCE) {
		var icon;
		if (appt.isException) {
			icon = "ApptException";
		} else if (appt.isRecurring()) {
			icon = "ApptRecur";
		}
		idx = this._getImageHtml(htmlArr, idx, icon, this._getFieldId(appt, field));

	} else if (field == ZmItem.F_FROM) { // for mixed view
		htmlArr[idx++] = appt.getOrganizer();

	} else if (field == ZmItem.F_SUBJECT) {
		if (params.isMixedView) {
			htmlArr[idx++] = appt.name ? AjxStringUtil.htmlEncode(appt.name, true) : AjxStringUtil.htmlEncode(ZmMsg.noSubject);
		} else {
			htmlArr[idx++] = AjxStringUtil.htmlEncode(appt.getName(), true);
		}
		if (appCtxt.get(ZmSetting.SHOW_FRAGMENTS) && appt.fragment) {
			htmlArr[idx++] = this._getFragmentSpan(appt);
		}

	} else if (field == ZmItem.F_LOCATION) {
		htmlArr[idx++] = AjxStringUtil.htmlEncode(appt.getLocation(), true);

	} else if (field == ZmItem.F_STATUS) {
		if (appt.otherAttendees) {
			htmlArr[idx++] = appt.getParticipantStatusStr();
		}

	} else if (field == ZmItem.F_FOLDER) {
		var calendar = appt.getFolder();
		var colors = ZmCalBaseView._getColors(calendar.rgb || ZmOrganizer.COLOR_VALUES[calendar.color]);
		var subs = {
			folderColor: colors.standard.header.bgcolor,
			folderName: appt.getFolder().getName()
		};
		htmlArr[idx++] = AjxTemplate.expand("calendar.Calendar#ListViewFolder", subs);

	} else if (field == ZmItem.F_DATE) {
		htmlArr[idx++] = (appt.isAllDayEvent())
			? AjxMessageFormat.format(ZmMsg.apptDateTimeAllDay, [appt.startDate])
			: AjxMessageFormat.format(ZmMsg.apptDateTime, [appt.startDate, appt.startDate]);

	} else {
		idx = ZmListView.prototype._getCellContents.apply(this, arguments);
	}

	return idx;
};

ZmCalListView.prototype._mouseOverAction =
function(ev, div) {
	DwtListView.prototype._mouseOverAction.call(this, ev, div);
	var id = ev.target.id || div.id;
	if (!id) { return true; }

	// check if we're hovering over a column header
	var data = this._data[div.id];
	var type = data.type;
	if (type && type == DwtListView.TYPE_HEADER_ITEM) {
		var itemIdx = data.index;
		var field = this._headerList[itemIdx]._field;
		this.setToolTipContent(this._getHeaderToolTip(field, itemIdx));
	} else {
		var item = this.getItemFromElement(div);
		if (item) {
			var match = this._parseId(id);
			if (!match) { return; }
			this.setToolTipContent(this._getToolTip({field:match.field, item:item, ev:ev, div:div, match:match}));
			if (match.field != ZmItem.F_SELECTION && match.field != ZmItem.F_TAG && item.getToolTip) {
				// load attendee status if necessary
				if (item.otherAttendees && (item.ptstHashMap == null)) {
					var clone = ZmAppt.quickClone(item);
					var uid = this._currentMouseOverApptId = clone.getUniqueId();
					var callback = new AjxCallback(null, ZmApptViewHelper.refreshApptTooltip, [clone, this]);
					AjxTimedAction.scheduleAction(new AjxTimedAction(this, this.getApptDetails, [clone, callback, uid]), 2000);
				}
			}
		}
	}
	return true;
};

ZmCalListView.prototype._getToolTip =
function(params) {
	var tooltip, field = params.field, item = params.item;
	if (field && (field == ZmItem.F_SELECTION || field == ZmItem.F_TAG)) {
		tooltip = ZmListView.prototype._getToolTip.apply(this, arguments);
	} else if (item.getToolTip) {
		tooltip = item.getToolTip(this._controller);
	}
	return tooltip;
};

ZmCalListView.prototype.getApptDetails =
function(appt, callback, uid) {
	if (this._currentMouseOverApptId &&
		this._currentMouseOverApptId == uid)
	{
		this._currentMouseOverApptId = null;
		appt.getDetails(null, callback, null, null, true);
	}
};

ZmCalListView.prototype._sortList =
function(list, column) {
	ZmCalListView.sortByAsc = this._bSortAsc;

	switch (column) {
		case ZmItem.F_SUBJECT:	list.sort(ZmCalListView._sortSubject); break;
		case ZmItem.F_STATUS:	list.sort(ZmCalListView._sortStatus); break;
		case ZmItem.F_FOLDER:	list.sort(ZmCalListView._sortFolder); break;
		case ZmItem.F_DATE:		list.sort(ZmCalListView._sortDate); break;
	}
};

ZmCalListView.prototype._sortColumn =
function(columnItem, bSortAsc) {
	this._defaultSortField = columnItem._field;

	var list = this.getList().clone();
	this._sortList(list, columnItem._field);
	this.set(list, null, true);
};

ZmCalListView.prototype._getHeaderToolTip =
function(field, itemIdx) {
	switch (field) {
		case ZmItem.F_LOCATION: return ZmMsg.location;
		case ZmItem.F_FOLDER:	return ZmMsg.calendar;
		case ZmItem.F_DATE:		return ZmMsg.date;
	}
	return ZmListView.prototype._getHeaderToolTip.call(this, field, itemIdx);
};

ZmCalListView.prototype._getHeaderList =
function(parent) {
	var hList = [];

	if (appCtxt.get(ZmSetting.SHOW_SELECTION_CHECKBOX)) {
		hList.push(new DwtListHeaderItem({field:ZmItem.F_SELECTION, icon:"CheckboxUnchecked", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.selection}));
	}
	if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		hList.push(new DwtListHeaderItem({field:ZmItem.F_TAG, icon:"Tag", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.tag}));
	}
	hList.push(new DwtListHeaderItem({field:ZmItem.F_ATTACHMENT, icon:"Attachment", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.attachment}));
	hList.push(new DwtListHeaderItem({field:ZmItem.F_SUBJECT, text:ZmMsg.subject, noRemove:true, sortable:ZmItem.F_SUBJECT}));
	hList.push(new DwtListHeaderItem({field:ZmItem.F_LOCATION, text:ZmMsg.location, width:ZmCalListView.COL_WIDTH_LOCATION, resizeable:true}));
	hList.push(new DwtListHeaderItem({field:ZmItem.F_STATUS, text:ZmMsg.status, width:ZmCalListView.COL_WIDTH_STATUS, resizeable:true, sortable:ZmItem.F_STATUS}));
	hList.push(new DwtListHeaderItem({field:ZmItem.F_FOLDER, text:ZmMsg.calendar, width:ZmCalListView.COL_WIDTH_FOLDER, resizeable:true, sortable:ZmItem.F_FOLDER}));
	hList.push(new DwtListHeaderItem({field:ZmItem.F_RECURRENCE, icon:"ApptRecur", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.recurrence}));
	hList.push(new DwtListHeaderItem({field:ZmItem.F_DATE, text:ZmMsg.startDate, width:ZmCalListView.COL_WIDTH_DATE, sortable:ZmItem.F_DATE}));

	return hList;
};

/**
 * Adds the HTML needed to render the date-search-bar. Caches the DOM objects
 * and sets up event listeners.
 *
 * @private
 */
ZmCalListView.prototype._createSearchBarHtml =
function() {
	this._dateSearchBar.getHtmlElement().innerHTML = AjxTemplate.expand("calendar.Calendar#ListViewSearchBar", {id:this._htmlElId});

	this._startDateField = document.getElementById(this._htmlElId+"_startDateInput");
	this._endDateField = document.getElementById(this._htmlElId+"_endDateInput");

	this._startDateField.onchange = AjxCallback.simpleClosure(this._onDatesChange, this, [true]);
	this._endDateField.onchange = AjxCallback.simpleClosure(this._onDatesChange, this);

	var dateButtonListener = new AjxListener(this, this._dateButtonListener);
	var dateCalSelectionListener = new AjxListener(this, this._dateCalSelectionListener);
	this._startDateButton = ZmCalendarApp.createMiniCalButton(this._dateSearchBar, (this._htmlElId+"_startMiniCal"), dateButtonListener, dateCalSelectionListener);
	this._endDateButton = ZmCalendarApp.createMiniCalButton(this._dateSearchBar, (this._htmlElId+"_endMiniCal"), dateButtonListener, dateCalSelectionListener);

	this._dateRangeField = document.getElementById(this._htmlElId+"_searchBarDate");
};

/**
 * Event listener triggered when user clicks on the down arrow button to bring
 * up the date picker.
 *
 * @param ev		[Event]		Browser event
 * @private
 */
ZmCalListView.prototype._dateButtonListener =
function(ev) {
	var calDate = ev.item == this._startDateButton
		? AjxDateUtil.simpleParseDateStr(this._startDateField.value)
		: AjxDateUtil.simpleParseDateStr(this._endDateField.value);

	// if date was input by user and its foobar, reset to today's date
	if (isNaN(calDate)) {
		calDate = new Date();
		var field = ev.item == this._startDateButton
			? this._startDateField : this._endDateField;
		field.value = AjxDateUtil.simpleComputeDateStr(calDate);
	}

	// always reset the date to current field's date
	var menu = ev.item.getMenu();
	var cal = menu.getItem(0);
	cal.setDate(calDate, true);
	ev.item.popup();
};

/**
 * Event listener triggered when user selects date in the date-picker.
 *
 * @param ev		[Event]		Browser event
 * @private
 */
ZmCalListView.prototype._dateCalSelectionListener =
function(ev) {
	var parentButton = ev.item.parent.parent;

	// update the appropriate field w/ the chosen date
	var field = (parentButton == this._startDateButton)
		? this._startDateField : this._endDateField;
	field.value = AjxDateUtil.simpleComputeDateStr(ev.detail);

	// change the start/end date if they mismatch
	this._handleDateChange(parentButton == this._startDateButton);
};

/**
 * Called when user selects a new date from the date-picker. Normalizes the
 * start/end dates if user chose start date to be after end date or vice versa.
 * Also updates the UI with the new date ranges and initiates SearchRequest.
 *
 * @param isStartDate
 * @private
 */
ZmCalListView.prototype._handleDateChange =
function(isStartDate) {
	var start = AjxDateUtil.simpleParseDateStr(this._startDateField.value);
	var end = AjxDateUtil.simpleParseDateStr(this._endDateField.value);

	var startTime = start.getTime();
	var endTime = end.getTime();

	// normalize dates
	if (isStartDate && startTime >= endTime) {
		endTime = startTime + AjxDateUtil.MSEC_PER_DAY;
		end = new Date(endTime);
		this._endDateField.value = AjxDateUtil.simpleComputeDateStr(end);
	}
	else if (endTime <= startTime) {
		startTime = endTime - AjxDateUtil.MSEC_PER_DAY;
		start = new Date(startTime);
		this._startDateField.value = AjxDateUtil.simpleComputeDateStr(start);
	}

	this._timeRangeStart = startTime;
	this._timeRangeEnd = endTime;

	this._updateDateRange(start, end);
	this._updateTitle();

	this._segmentedDates = [];

	this._segmentDates(startTime, endTime);
	this.set((new AjxVector()), null, true); // clear the current list
	this._search();
};

/**
 * Chunks the date range into intervals per the default calendar period. We do
 * this to avoid taxing the server with a large date range.
 *
 * @param startTime		[String]	start time in ms
 * @param endTime		[String]	end time in ms
 * @private
 */
ZmCalListView.prototype._segmentDates =
function(startTime, endTime) {
	var startPeriod = startTime;
	var endPeriod = startTime + ZmCalListView.DEFAULT_CALENDAR_PERIOD;

	// reset back to end time if we're search less than next block (e.g. two weeks)
	if (endPeriod > endTime) {
		endPeriod = endTime;
	}

	do {
		this._segmentedDates.push({startTime: startPeriod, endTime: endPeriod});

		startPeriod += ZmCalListView.DEFAULT_CALENDAR_PERIOD;

		var newEndPeriod = endPeriod + ZmCalListView.DEFAULT_CALENDAR_PERIOD;
		endPeriod = (newEndPeriod > endTime) ? endTime : newEndPeriod;
	}
	while (startPeriod < endTime);
};

/**
 * Makes a SearchRequest for the first chunk of appointments
 *
 * @private
 */
ZmCalListView.prototype._search =
function() {
	var dates = this._segmentedDates.shift();

	var params = {
		start: dates.startTime,
		end: dates.endTime,
		folderIds: this._controller.getCheckedCalendarFolderIds(),
		callback: (new AjxCallback(this, this._handleSearchResponse)),
		noBusyOverlay: true
	};

	this._controller.apptCache.getApptSummaries(params);
};

/**
 * Appends the SearchResponse results to the listview. Attempts to request the
 * next chunk of appointments if the user's scrollbar isn't shown.
 *
 * @param list		[AjxVector]		list returned by ZmApptCache
 * @private
 */
ZmCalListView.prototype._handleSearchResponse =
function(list) {

	this.addItems(list.getArray());

	// if we have more days to fetch, search again for the next set
	if (this._segmentedDates.length > 0 && this._getItemsNeeded(true) > 0) {
		this._search();
	}
};

/**
 * This method gets called when the user scrolls up/down. If there are more
 * appointments to request, it does so.
 *
 * @private
 */
ZmCalListView.prototype._checkItemCount =
function() {
	if (this._segmentedDates.length > 0) {
		this._search();
	}
};

/**
 * Called when the date input field loses focus.
 *
 * @param isStartDate		[Boolean]	If true, the start date field is what changed.
 * @private
 */
ZmCalListView.prototype._onDatesChange =
function(isStartDate) {
	if (ZmApptViewHelper.handleDateChange(this._startDateField, this._endDateField, isStartDate)) {
		this._handleDateChange(isStartDate);
	}
};


// private static methods

ZmCalListView._sortSubject =
function(a, b) {
	var aVal = a.getName();
	var bVal = b.getName();

	if (aVal < bVal)		{ return ZmCalListView.sortByAsc ? -1 : 1; }
	else if (aVal > bVal)	{ return ZmCalListView.sortByAsc ? 1 : -1; }
	else 					{ return 0; }

};

ZmCalListView._sortStatus =
function(a, b) {
	if (!a.otherAttendees)	{ return ZmCalListView.sortByAsc ? -1 : 1; }
	if (!b.otherAttendees)	{ return ZmCalListView.sortByAsc ? 1 : -1; }

	var aVal = a.getParticipantStatusStr();
	var bVal = b.getParticipantStatusStr();

	if (aVal < bVal)		{ return ZmCalListView.sortByAsc ? -1 : 1; }
	else if (aVal > bVal)	{ return ZmCalListView.sortByAsc ? 1 : -1; }
	else 					{ return 0; }
};

ZmCalListView._sortFolder =
function(a, b) {
	var aVal = a.getFolder().getName();
	var bVal = b.getFolder().getName();

	if (aVal < bVal)		{ return ZmCalListView.sortByAsc ? -1 : 1; }
	else if (aVal > bVal)	{ return ZmCalListView.sortByAsc ? 1 : -1; }
	else 					{ return 0; }
};

ZmCalListView._sortDate =
function(a, b) {
	var aVal = a.startDate.getTime();
	var bVal = b.startDate.getTime();

	if (aVal < bVal)		{ return ZmCalListView.sortByAsc ? -1 : 1; }
	else if (aVal > bVal)	{ return ZmCalListView.sortByAsc ? 1 : -1; }
	else 					{ return 0; }
};
