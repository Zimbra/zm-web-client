/**
 * Appointment list view.
 */
ZmApptListView = function(parent, posStyle, controller, dropTgt) {
    if (arguments.length == 0) return;
    var params = Dwt.getParams(arguments, ZmApptListView.PARAMS);
    params.headerList = this._getHeaderList();
    ZmListView.call(this, params);
    this._bSortAsc = true;
    this._defaultSortField = ZmItem.F_DATE;
    this.setDragSource(params.controller._dragSrc);
};
ZmApptListView.prototype = new ZmListView;
ZmApptListView.prototype.constructor = ZmApptListView;

ZmApptListView.prototype.toString = function() {
    return "ZmApptListView";
};

ZmApptListView.PARAMS = ["parent","posStyle","controller","dropTgt"];

//
// Constants
//

ZmApptListView.COL_WIDTH_DATE			= ZmMsg.COLUMN_WIDTH_DATE_CAL;
ZmApptListView.COL_WIDTH_LOCATION		= ZmMsg.COLUMN_WIDTH_LOCATION_CAL;
ZmApptListView.COL_WIDTH_STATUS			= ZmMsg.COLUMN_WIDTH_STATUS_CAL;
ZmApptListView.COL_WIDTH_FOLDER			= ZmMsg.COLUMN_WIDTH_FOLDER_CAL;

//
// Public methods
//

ZmApptListView.prototype.getApptList = function() {
    return this._apptList;
};

ZmApptListView.prototype.refresh = function() {
    if (this.needsRefresh()) {
        var selection = this.getSelection();
        this.set(this.getApptList());
        if (selection) {
            this.setSelectedItems(selection);
        }
        this.setNeedsRefresh(false);
    }
};

ZmApptListView.prototype.needsRefresh = function() {
    var controller = this._controller;
    return controller.getCurrentView().needsRefresh();
};

ZmApptListView.prototype.setNeedsRefresh = function(needsRefresh) {
    var controller = this._controller;
    return controller.getCurrentView().setNeedsRefresh(needsRefresh);
};

//
// Protected methods
//

ZmApptListView.prototype._getToolTip =
function(params) {
	var tooltip, field = params.field, item = params.item;
	if (field && (field == ZmItem.F_SELECTION || field == ZmItem.F_TAG)) {
		tooltip = ZmListView.prototype._getToolTip.apply(this, arguments);
	} else if (item.getToolTip) {
		tooltip = item.getToolTip(this._controller);
	}
	return tooltip;
};

ZmApptListView.prototype._sortList = function(list, column) {
	ZmApptListView.sortByAsc = this._bSortAsc;

	switch (column) {
		case ZmItem.F_SUBJECT:	list.sort(ZmApptListView._sortSubject); break;
		case ZmItem.F_STATUS:	list.sort(ZmApptListView._sortStatus); break;
		case ZmItem.F_FOLDER:	list.sort(ZmApptListView._sortFolder); break;
		case ZmItem.F_DATE:		list.sort(ZmApptListView._sortDate); break;
	}
};

ZmApptListView.prototype._sortColumn = function(columnItem, bSortAsc) {
	this._defaultSortField = columnItem._field;

	var list = this.getList().clone();
	this._sortList(list, columnItem._field);
	this.set(list, null, true);
};

ZmApptListView.prototype._getHeaderToolTip = function(field, itemIdx) {
	switch (field) {
		case ZmItem.F_LOCATION: return ZmMsg.location;
		case ZmItem.F_FOLDER:	return ZmMsg.calendar;
		case ZmItem.F_DATE:		return ZmMsg.date;
	}
	return ZmListView.prototype._getHeaderToolTip.call(this, field, itemIdx);
};

ZmApptListView.prototype._getHeaderList = function() {
	var hList = [];

	if (appCtxt.get(ZmSetting.SHOW_SELECTION_CHECKBOX)) {
		hList.push(new DwtListHeaderItem({field:ZmItem.F_SELECTION, icon:"CheckboxUnchecked", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.selection}));
	}
	if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		hList.push(new DwtListHeaderItem({field:ZmItem.F_TAG, icon:"Tag", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.tag}));
	}
	hList.push(new DwtListHeaderItem({field:ZmItem.F_ATTACHMENT, icon:"Attachment", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.attachment}));
	hList.push(new DwtListHeaderItem({field:ZmItem.F_SUBJECT, text:ZmMsg.subject, noRemove:true, sortable:ZmItem.F_SUBJECT}));
	hList.push(new DwtListHeaderItem({field:ZmItem.F_LOCATION, text:ZmMsg.location, width:ZmApptListView.COL_WIDTH_LOCATION, resizeable:true}));
	hList.push(new DwtListHeaderItem({field:ZmItem.F_STATUS, text:ZmMsg.status, width:ZmApptListView.COL_WIDTH_STATUS, resizeable:true, sortable:ZmItem.F_STATUS}));
	hList.push(new DwtListHeaderItem({field:ZmItem.F_FOLDER, text:ZmMsg.calendar, width:ZmApptListView.COL_WIDTH_FOLDER, resizeable:true, sortable:ZmItem.F_FOLDER}));
	hList.push(new DwtListHeaderItem({field:ZmItem.F_RECURRENCE, icon:"ApptRecur", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.recurrence}));
	hList.push(new DwtListHeaderItem({field:ZmItem.F_DATE, text:ZmMsg.startDate, width:ZmApptListView.COL_WIDTH_DATE, sortable:ZmItem.F_DATE}));

	return hList;
};

//
// DwtListView methods
//

ZmApptListView.prototype._itemClicked = function() {
    this._controller.setCurrentListView(this);
    return ZmListView.prototype._itemClicked.apply(this, arguments);
};

ZmApptListView.prototype.set = function(apptList, skipMiniCalUpdate, skipSort) {
    this._apptList = apptList;
	if (!skipSort) {
		if ((this._defaultSortField != ZmItem.F_DATE) ||
			(this._defaultSortField == ZmItem.F_DATE && !this._bSortAsc))
		{
			this._sortList(apptList, this._defaultSortField);
		}
	}
	ZmListView.prototype.set.call(this, apptList, this._defaultSortField);
};

ZmApptListView.prototype._getItemId = function(item) {
	var itemId = (item && item.id) ? item.getUniqueId(true) : Dwt.getNextId();
	return DwtId.getListViewItemId(DwtId.WIDGET_ITEM, this._view, itemId);
};

ZmApptListView.prototype._getFieldId = function(item, field) {
	var itemId = (item && item.getUniqueId) ? item.getUniqueId(true) : item.id;
	return DwtId.getListViewItemId(DwtId.WIDGET_ITEM_FIELD, this._view, itemId, field);
};

ZmApptListView.prototype._getCellId = function(item, field) {
	if (field == ZmItem.F_SUBJECT || field == ZmItem.F_DATE) {
		return this._getFieldId(item, field);
	}
};

ZmApptListView.prototype._getCellContents = function(htmlArr, idx, appt, field, colIdx, params) {
	if (field == ZmItem.F_RECURRENCE) {
		var icon;
		if (appt.isException) {
			icon = "ApptException";
		}
        else if (appt.isRecurring()) {
			icon = "ApptRecur";
		}
		idx = this._getImageHtml(htmlArr, idx, icon, this._getFieldId(appt, field));

	}
    else if (field == ZmItem.F_FROM) { // for mixed view
		htmlArr[idx++] = appt.getOrganizer();

	}
    else if (field == ZmItem.F_SUBJECT) {
		if (params.isMixedView) {
			htmlArr[idx++] = appt.name ? AjxStringUtil.htmlEncode(appt.name, true) : AjxStringUtil.htmlEncode(ZmMsg.noSubject);
		}
        else {
			htmlArr[idx++] = AjxStringUtil.htmlEncode(appt.getName(), true);
		}
		if (appCtxt.get(ZmSetting.SHOW_FRAGMENTS) && appt.fragment) {
			htmlArr[idx++] = this._getFragmentSpan(appt);
		}

	}
    else if (field == ZmItem.F_LOCATION) {
		htmlArr[idx++] = AjxStringUtil.htmlEncode(appt.getLocation(), true);

	}
    else if (field == ZmItem.F_STATUS) {
		if (appt.otherAttendees) {
			htmlArr[idx++] = appt.getParticipantStatusStr();
		}

	}
    else if (field == ZmItem.F_FOLDER) {
		var calendar = appt.getFolder();
        var rgb = calendar.rgb || ZmOrganizer.COLOR_VALUES[calendar.color||ZmOrganizer.DEFAULT_COLOR[ZmOrganizer.CALENDAR]]; 
		var colors = ZmCalBaseView._getColors(rgb);
		var subs = {
			folderColor: colors.standard.header.bgcolor,
			folderName: appt.getFolder().getName()
		};
		htmlArr[idx++] = AjxTemplate.expand("calendar.Calendar#ListViewFolder", subs);

	}
    else if (field == ZmItem.F_DATE) {
		htmlArr[idx++] = (appt.isAllDayEvent())
			? AjxMessageFormat.format(ZmMsg.apptDateTimeAllDay, [appt.startDate])
			: AjxMessageFormat.format(ZmMsg.apptDateTime, [appt.startDate, appt.startDate]);

	}
    else {
		idx = ZmListView.prototype._getCellContents.apply(this, arguments);
	}

	return idx;
};

//
// Private methods
//

ZmApptListView._sortSubject = function(a, b) {
	var aVal = a.getName();
	var bVal = b.getName();

	if (aVal < bVal)		{ return ZmApptListView.sortByAsc ? -1 : 1; }
	else if (aVal > bVal)	{ return ZmApptListView.sortByAsc ? 1 : -1; }
	else 					{ return 0; }

};

ZmApptListView._sortStatus = function(a, b) {
	if (!a.otherAttendees)	{ return ZmApptListView.sortByAsc ? -1 : 1; }
	if (!b.otherAttendees)	{ return ZmApptListView.sortByAsc ? 1 : -1; }

	var aVal = a.getParticipantStatusStr();
	var bVal = b.getParticipantStatusStr();

	if (aVal < bVal)		{ return ZmApptListView.sortByAsc ? -1 : 1; }
	else if (aVal > bVal)	{ return ZmApptListView.sortByAsc ? 1 : -1; }
	else 					{ return 0; }
};

ZmApptListView._sortFolder = function(a, b) {
	var aVal = a.getFolder().getName();
	var bVal = b.getFolder().getName();

	if (aVal < bVal)		{ return ZmApptListView.sortByAsc ? -1 : 1; }
	else if (aVal > bVal)	{ return ZmApptListView.sortByAsc ? 1 : -1; }
	else 					{ return 0; }
};

ZmApptListView._sortDate = function(a, b) {
	var aVal = a.startDate.getTime();
	var bVal = b.startDate.getTime();

	if (aVal < bVal)		{ return ZmApptListView.sortByAsc ? -1 : 1; }
	else if (aVal > bVal)	{ return ZmApptListView.sortByAsc ? 1 : -1; }
	else 					{ return 0; }
};
