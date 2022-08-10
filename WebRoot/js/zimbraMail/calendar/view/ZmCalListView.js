/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
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
	ZmApptListView.call(this, params);

	this._dateSearchBar = this._createSearchBar(parent);

	this._needsRefresh = true;
	this._timeRangeStart = 0;
	this._timeRangeEnd = 0;
	this._title = "";
};

ZmCalListView.prototype = new ZmApptListView;
ZmCalListView.prototype.constructor = ZmCalListView;


// Consts
ZmCalListView.DEFAULT_CALENDAR_PERIOD	= AjxDateUtil.MSEC_PER_DAY * 14;			// 2 weeks
ZmCalListView.DEFAULT_SEARCH_PERIOD		= AjxDateUtil.MSEC_PER_DAY * 400;			// 400 days (maximum supported by the server)


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

ZmCalListView.prototype.createHeaderHtml =
function(defaultColumnSort) {
	DwtListView.prototype.createHeaderHtml.call(this, defaultColumnSort, true);
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
	this._startDateField.setValue(AjxDateUtil.simpleComputeDateStr(startDate));
	this._endDateField.setValue(AjxDateUtil.simpleComputeDateStr(endDate));

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

ZmCalListView.prototype.setBounds =
function(x, y, width, height) {
	// set height to 32px (plus 1px for bottom border) to adjust for the new date-range toolbar
    if (this._dateSearchBar) {
        this._dateSearchBar.setBounds(x, y, width, 33);
        ZmListView.prototype.setBounds.call(this, x, y+33, width, height-33);
    }
    else {
        ZmListView.prototype.setBounds.apply(this, arguments);
    }
};

ZmCalListView.prototype.setLocation = function(x, y) {
    // HACK: setBounds calls setLocation so only relocate date search bar
    // HACK: when the location is NOWHERE
    if (this._dateSearchBar && x == Dwt.LOC_NOWHERE) {
        this._dateSearchBar.setLocation(x, y);
    }
    ZmApptListView.prototype.setLocation.call(this, x, y);
};

// NOTE: Currently setLocation is called with values of NOWHERE when they
// NOTE: want the control to disappear. But I'm adding an override for
// NOTE: setVisible as well to be defensive against future changes.
ZmCalListView.prototype.setVisible = function(visible) {
    if (this._dateSearchBar) {
        this._dateSearchBar.setVisible(visible);
    }
    ZmApptListView.prototype.setVisible.apply(this, arguments);
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
        // Bug: 76489 - Added <span> as workaround to show tooltip as HTML
        // The ideal fix should add a method in DwtControl to remove the tooltip
		this.setToolTipContent('<span>'+this._getHeaderToolTip(field, itemIdx)+'</span>');
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

ZmCalListView.prototype.getApptDetails =
function(appt, callback, uid) {
	if (this._currentMouseOverApptId &&
		this._currentMouseOverApptId == uid)
	{
		this._currentMouseOverApptId = null;
		appt.getDetails(null, callback, null, null, true);
	}
};

ZmCalListView.prototype._createSearchBar = function(parent) {
    var id = this._htmlElId;

    var searchBar = new DwtComposite({parent:parent, className:"ZmCalListViewSearchBar", posStyle:DwtControl.ABSOLUTE_STYLE});
    searchBar.getHtmlElement().innerHTML = AjxTemplate.expand("calendar.Calendar#ListViewSearchBar",id);

    var controls = new DwtMessageComposite({
        parent: searchBar,
        parentElement: Dwt.byId(id+"_searchBarControls"),
        format: ZmMsg.showApptsFromThrough,
        controlCallback: this._createSearchBarComponent.bind(this),
    });

    this._dateRangeField = document.getElementById(id+"_searchBarDate");
    this._makeFocusable(this._dateRangeField);

    return searchBar;
};

ZmCalListView.prototype._getSearchBarTabGroup = function() {
	if (!this._dateSearchBarTabGroup) {
		var tg = this._dateSearchBarTabGroup =
			new DwtTabGroup('ZmCalListView search');

		tg.addMember([
			this._dateSearchBar.getChild(0).getTabGroupMember(),
			this._dateRangeField
		]);
	}

	return this._dateSearchBarTabGroup;
}

ZmCalListView.prototype._createSearchBarComponent = function(searchBar, segment, i) {
    var isStart = segment.getIndex() == 0;
    var id = this._htmlElId;
    var prefix = isStart ? "_start" : "_end";

    var component = new DwtToolBar({parent:searchBar});

    var inputId = [id,prefix,"DateInput"].join("");
    var input = new DwtInputField({id: inputId, parent: component});
    Dwt.setHandler(input.getInputElement(), DwtEvent.ONCHANGE,
                   this._onDatesChange.bind(this, isStart));

    var dateButtonListener = new AjxListener(this, this._dateButtonListener);
    var dateCalSelectionListener = new AjxListener(this, this._dateCalSelectionListener);
    var buttonId = [id,prefix,"MiniCal"].join("");
    var button = ZmCalendarApp.createMiniCalButton(component, buttonId, dateButtonListener, dateCalSelectionListener, false);

    // this.getTabGroupMember().addMember([inputEl, button]);

    if (isStart) {
        this._startDateField = input;
        this._startDateField.setToolTipContent(ZmMsg.startDate);
        this._startDateButton = button;
    }
    else {
        this._endDateField = input;
        this._endDateField.setToolTipContent(ZmMsg.endDate);
        this._endDateButton = button;
    }

    return component;
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
		? AjxDateUtil.simpleParseDateStr(this._startDateField.getValue())
		: AjxDateUtil.simpleParseDateStr(this._endDateField.getValue());

	// if date was input by user and its foobar, reset to today's date
	if (isNaN(calDate)) {
		calDate = new Date();
		var field = ev.item == this._startDateButton
			? this._startDateField : this._endDateField;
		field.setValue(AjxDateUtil.simpleComputeDateStr(calDate));
	}

	// always reset the date to current field's date
	var menu = ev.item.getMenu();
	var cal = menu.getItem(0);
	cal.setDate(calDate, true);
	ev.item.popup();

    if(AjxEnv.isIE) {
        //DwtMenu adds padding of 6px each side
        //IE has to add 12px to width and height to adjust the calendar
        var menuSize = menu.getSize();
        menu.setSize(menuSize.x+12, menuSize.y+12);
        menu.getHtmlElement().style.width = "180px";
    }
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
	field.setValue(AjxDateUtil.simpleComputeDateStr(ev.detail));

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
	var start = AjxDateUtil.simpleParseDateStr(this._startDateField.getValue());
	var end = AjxDateUtil.simpleParseDateStr(this._endDateField.getValue());

	var startTime = start.getTime();
	var endTime = end.getTime() + AjxDateUtil.MSEC_PER_DAY;

	// normalize dates
	if (isStartDate && startTime >= endTime) {
		endTime = startTime + AjxDateUtil.MSEC_PER_DAY;
		end = new Date(endTime);
		this._endDateField.setValue(AjxDateUtil.simpleComputeDateStr(end));
	}
	else if (endTime <= startTime) {
		startTime = end.getTime() - AjxDateUtil.MSEC_PER_DAY;
		start = new Date(startTime);
		this._startDateField.setValue(AjxDateUtil.simpleComputeDateStr(start));
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
 * Chunks the date range into intervals per the default search period. We do
 * this to avoid taxing the server with a large date range.
 *
 * @param startTime		[String]	start time in ms
 * @param endTime		[String]	end time in ms
 * @private
 */
ZmCalListView.prototype._segmentDates =
function(startTime, endTime) {
	var startPeriod = startTime;
	var endPeriod = startTime + ZmCalListView.DEFAULT_SEARCH_PERIOD;

	// reset back to end time if we're search less than next block (e.g. two weeks)
	if (endPeriod > endTime) {
		endPeriod = endTime;
	}

	do {
		this._segmentedDates.push({startTime: startPeriod, endTime: endPeriod});

		startPeriod += ZmCalListView.DEFAULT_SEARCH_PERIOD;

		var newEndPeriod = endPeriod + ZmCalListView.DEFAULT_SEARCH_PERIOD;
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
		noBusyOverlay: true,
		query: this._controller._userQuery
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
    Dwt.setTitle(this.getTitle());
	// if we have more days to fetch, search again for the next set
	if (this._segmentedDates.length > 0 && this._getItemsNeeded(true) > 0) {
		this._search();
	}
};

/**
 * Method overridden to hnadle action popdown - left it blank coz DwtListView.prototype.handleActionPopdown is clearing
 * the this._rightSelItem.
 *
 * @param	{array}		itemArray		an array of items
 */
ZmCalListView.prototype.handleActionPopdown =
function(ev) {
    //kept empty to avoid clearing of this._rightSelItem.
};

/**
 * Adds the items.
 * The function is overridden to not to show the "No results found" if anything is present in the list.
 *
 * @param	{array}		itemArray		an array of items
 */
ZmCalListView.prototype.addItems =
function(itemArray) {
	if (AjxUtil.isArray(itemArray)) {
		if (!this._list) {
			this._list = new AjxVector();
		}

		// clear the "no results" message before adding!
		if (this._list.size() == 0) {
			this._resetList();
		}

		// Prune the appts before passing to the underlying ListView
		var showDeclined = appCtxt.get(ZmSetting.CAL_SHOW_DECLINED_MEETINGS);
		var filterV = new AjxVector();
		for (var i = 0; i < itemArray.length; i++) {
            var appt = itemArray[i];
            if (showDeclined || (appt.ptst != ZmCalBaseItem.PSTATUS_DECLINED)) {
                filterV.add(appt);
            }
		}

        //Bug fix# 80459. Since ZmCalListView inherits from ZmApptListView, make use of the sorting function and use the sorted list to render
        //By default the list is sorted on date and thereafter we use the changed sort field if any
        this._sortList(filterV, this._defaultSortField);

		this._renderList(filterV, this._list.size() != 0, true);
		this._list.addList(filterV.getArray());
        this._resetColWidth();
        //Does not make sense but required to make the scrollbar appear
        var size = this.getSize();
        this._listDiv.style.height = (size.y - DwtListView.HEADERITEM_HEIGHT)+"px";
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
	if (this._startDateField instanceof DwtInputField) { // Fix for Bug 103534, called when user modifies date from input field.
		this.validStartEnd();
		this._handleDateChange(isStartDate);
		return;
	}
	if (ZmApptViewHelper.handleDateChange(this._startDateField, this._endDateField, isStartDate)) {
		this._handleDateChange(isStartDate);
	}
};

ZmCalListView.prototype.validStartEnd =  function() {

		var startDate = AjxDateUtil.simpleParseDateStr(this._startDateField.getValue());
		var endDate = AjxDateUtil.simpleParseDateStr(this._endDateField.getValue());
	    var date = new Date();

			if (startDate == null || isNaN(startDate)) {
				startDate =  date;
				this._startDateField.setValue(AjxDateUtil.simpleComputeDateStr(startDate));
			}

			if (endDate == null || isNaN(endDate)) {
				endDate = date;
				this._endDateField.setValue(AjxDateUtil.simpleComputeDateStr(endDate));
			}

			if((startDate.valueOf() > endDate.valueOf())) {
				this._endDateField.setValue(AjxDateUtil.simpleComputeDateStr(startDate));
			}

};
