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
		headerList: this._getHeaderList(parent)
	}

	ZmListView.call(this, params);

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
ZmCalListView.DEFAULT_CALENDAR_PERIOD	= AjxDateUtil.MSEC_PER_DAY * 21;			// 3 weeks
ZmCalListView.DEFAULT_SEARCH_PERIOD		= AjxDateUtil.MSEC_PER_DAY * 31;			// 1 month
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
//	this._duration = duration; // necessary?
	this._date = new Date(date.getTime());

	var d = new Date(date.getTime());
	d.setHours(0, 0, 0, 0);
	this._timeRangeStart = d.getTime() - (AjxDateUtil.MSEC_PER_DAY * 7);
	this._timeRangeEnd = this._timeRangeStart + ZmCalListView.DEFAULT_CALENDAR_PERIOD;

	this._updateTitle();

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
