function LmCalBaseView(parent, className, posStyle, view, dropTgt) {
	if (arguments.length == 0) return;

	DBG.println("LmCalBaseView");
	LmListView.call(this, parent, className, posStyle, view, LmItem.APPT, null, dropTgt);
	this._timeRangeStart = 0;
	this._timeRangeEnd = 0;
	this.addControlListener(new LsListener(this, this._controlListener));	
	this._createHtml();
	this._firstSet = true;
	this._needsRefresh = true;
	this.setMultiSelect(false);
}

LmCalBaseView.prototype = new LmListView;
LmCalBaseView.prototype.constructor = LmCalBaseView;

LmCalBaseView.TIME_SELECTION = "LmCalTimeSelection";

LmCalBaseView.prototype._parseId =
function(id) {
	var m = id.match(/^V(\d+)_([a-z]?)((DWT)?.+)_?(\d*)$/);
	if (m)
		return {view: m[1], field: m[2], item: m[3], participant: m[5]};
	else
		return null;
}

LmCalBaseView.prototype.getTitle = 
function() {
	return [LmMsg.zimbraTitle, this.getCalTitle()].join(": ");
}

LmCalBaseView.prototype.needsRefresh = 
function() {
	return this._needsRefresh;
}

LmCalBaseView.prototype.setNeedsRefresh = 
function(refresh) {
	 this._needsRefresh = refresh;
}

LmCalBaseView.prototype.isFirstSet = 
function() {
	return this._firstSet;
}

LmCalBaseView.prototype.setFirstSet = 
function(set) {
	this._firstSet = set;
}

LmCalBaseView.prototype._getItemId =
function(item) {
	return id = item ? (this._getViewPrefix()+item.getUniqueId()) : null;
}

LmCalBaseView.prototype.addTimeSelectionListener = 
function(listener) {
	this.addListener(LmCalBaseView.TIME_SELECTION, listener);
}

LmCalBaseView.prototype.removeTimeSelectionListener = 
function(listener) { 
	this.removeListener(LmCalBaseView.TIME_SELECTION, listener);
}

LmCalBaseView.prototype.addDateRangeListener = 
function(listener) {
	this.addListener(DwtEvent.DATE_RANGE, listener);
}

LmCalBaseView.prototype.removeDateRangeListener = 
function(listener) { 
	this.removeListener(DwtEvent.DATE_RANGE, listener);
}

// override. 
LmCalBaseView.prototype.getRollField =
function(isDouble)
{
	return 0;
}

LmCalBaseView.prototype.getDate =
function() {
	return this._date;
}

LmCalBaseView.prototype.getTimeRange =
function() {
	return { start: this._timeRangeStart, end: this._timeRangeEnd };
}

LmCalBaseView.prototype.isInView =
function(appt) {
	return appt.isInRange(this._timeRangeStart, this._timeRangeEnd);
}

LmCalBaseView.prototype.isStartInView =
function(appt) {
	return appt.isStartInRange(this._timeRangeStart, this._timeRangeEnd);
}

LmCalBaseView.prototype.isEndInView =
function(appt) {
	return appt.isEndInRange(this._timeRangeStart, this._timeRangeEnd);
}

LmCalBaseView.prototype._dayKey =
function(date) {
	var key = date.getFullYear()+"/"+date.getMonth()+"/"+date.getDate();
	return key;
}

LmCalBaseView.prototype.setDate =
function(date, duration, roll)
{
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
}

/*
* override: responsible for updating any view-specific data when the date changes during a setDate call.
*/
LmCalBaseView.prototype._dateUpdate =
function(rangeChanged) 
{

}

/*
* override: called when an appointment is clicked to see if the view should de-select a selected time range. For example,
* in day view if you have selected the 8:00 AM row and then click on an appt, the 8:00 AM row should be de-selected. If
* you are in month view though and have a day selected, thne day should still be selected if the appt you clicked on is in 
* the same day.
*/
LmCalBaseView.prototype._apptSelected =
function() {

}

// override
LmCalBaseView.prototype._updateRange =
function() { }

// override 
LmCalBaseView.prototype._updateTitle =
function() { }


LmCalBaseView.prototype.addAppt = 
function(ao, now) {
	var item = this._createItemHtml(ao, now);
	var div = this._getDivForAppt(ao);
	if (div) div.appendChild(item);
}

LmCalBaseView.prototype.set = 
function(list) {
	this._preSet();
//	LmListView.prototype.set.call(this, list);
	this._selectedItems.removeAll();
	this._resetList();
	this._list = list;	
	var list = this.getList();
	if (list) {
		var size = list.size();
		if (size != 0) {
			var now = new Date();
			for (var i=0; i < size; i++) {
				var ao = list.get(i);
				this.addAppt(ao, now);
			}
		}
	}
	this._postSet(list);
}

// override
LmCalBaseView.prototype._fanoutAllDay =
function(appt) {
	return true;
}

// override
LmCalBaseView.prototype._postSet =
function(appt) {}

// override
LmCalBaseView.prototype._preSet =
function(appt) {}

// override
LmCalBaseView.prototype._getDivForAppt =
function(appt) {}

LmCalBaseView.prototype.setUI =
function(defaultColumnSort) {	/* do nothing */ }

LmCalBaseView.prototype._setNoResultsHtml =
function() { /* do nothing */ }

LmCalBaseView.prototype._addApptIcons =
function(appt, html, idx) {

	html[idx++] = "<table border=0 cellpadding=0 cellspacing=0 style='display:inline'><tr>";

	if (appt.hasOtherAttendees())
		html[idx++] = "<td>" + LsImg.getImageHtml(LmImg.I_APPT_MEETING) + "</td>";

	if (appt.isException())
		html[idx++] = "<td>" + LsImg.getImageHtml(LmImg.I_APPT_EXCEPTION) + "</td>";
	else if (appt.isRecurring())
		html[idx++] = "<td>" + LsImg.getImageHtml(LmImg.I_APPT_RECUR) + "</td>";

	if (appt.hasAlarm())
		html[idx++] = "<td>" + LsImg.getImageHtml(LmImg.I_APPT_REMINDER) + "</td>";
	
	html[idx++] = "</tr></table>";

	return idx;
}

LmCalBaseView.prototype._resetList =
function() {
	var doc = this.getDocument();
	var list = this.getList();
	if (list == null) return;

	var size = list.size();
	if (size == 0) return;

	for (var i=0; i < size; i++) {
		var ao = list.get(i);
		var appt = Dwt.getDomObj(doc, this._getItemId(ao));
		if (appt) {
			appt.parentNode.removeChild(appt);
			LsCore.unassignId(appt._itemIndex);
		}
	}
	list.removeAll();
	this.removeAll();	
}

LmCalBaseView.prototype.removeAll =
function() {
	this._selectedItems.removeAll();
	this._selAnchor = null;
}

LmCalBaseView.prototype.getCalTitle = 
function() {
	return this._title;
}

// override
LmCalBaseView.prototype._createItemHtml =
function(appt, now, isDndIcon) {}

// override
LmCalBaseView.prototype._createHtml =
function() {}

LmCalBaseView.prototype._controlListener =
function(ev) {
	if ((ev.oldWidth != ev.newWidth) ||
		(ev.oldHeight != ev.newHeight)) {
		this._layout();
	}
}

/**
* override
*/
LmCalBaseView.prototype._layout =
function() {}

LmCalBaseView.prototype._mouseOverAction =
function(ev, div) {
	DwtListView.prototype._mouseOverAction.call(this, ev, div);
	//var id = ev.target.id ? ev.target.id : div.id;
	//if (!id) return true;

	var item = this.getItemFromElement(div);
	if (item instanceof LmAppt) {
		this.setToolTipContent(item.getToolTip());
	} else {
		this.setToolTipContent(null);
	}
	return true;
}
