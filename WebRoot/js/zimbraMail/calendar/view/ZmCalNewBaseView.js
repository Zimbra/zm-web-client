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

function ZmCalNewBaseView(parent, className, posStyle, view, dropTgt) {
	if (arguments.length == 0) return;

	DBG.println("ZmCalNewBaseView");
	ZmListView.call(this, parent, className, posStyle, view, ZmItem.APPT, null, dropTgt);
	this._timeRangeStart = 0;
	this._timeRangeEnd = 0;
	this.addControlListener(new AjxListener(this, this._controlListener));	
	this._createHtml();
	this._firstSet = true;
	this._needsRefresh = true;
	this.setMultiSelect(false);
}

ZmCalNewBaseView.prototype = new ZmListView;
ZmCalNewBaseView.prototype.constructor = ZmCalNewBaseView;

ZmCalNewBaseView.TIME_SELECTION = "ZmCalTimeSelection";

ZmCalNewBaseView.prototype._parseId =
function(id) {
	var m = id.match(/^V(\d+)_([a-z]?)((DWT)?.+)_?(\d*)$/);
	if (m)
		return {view: m[1], field: m[2], item: m[3], participant: m[5]};
	else
		return null;
}

ZmCalNewBaseView.prototype.getTitle = 
function() {
	return [ZmMsg.zimbraTitle, this.getCalTitle()].join(": ");
}

ZmCalNewBaseView.prototype.needsRefresh = 
function() {
	return this._needsRefresh;
}

ZmCalNewBaseView.prototype.setNeedsRefresh = 
function(refresh) {
	 this._needsRefresh = refresh;
}

ZmCalNewBaseView.prototype.isFirstSet = 
function() {
	return this._firstSet;
}

ZmCalNewBaseView.prototype.setFirstSet = 
function(set) {
	this._firstSet = set;
}

ZmCalNewBaseView.prototype._getItemId =
function(item) {
	return id = item ? (this._getViewPrefix()+item.getUniqueId()) : null;
}

ZmCalNewBaseView.prototype.addTimeSelectionListener = 
function(listener) {
	this.addListener(ZmCalNewBaseView.TIME_SELECTION, listener);
}

ZmCalNewBaseView.prototype.removeTimeSelectionListener = 
function(listener) { 
	this.removeListener(ZmCalNewBaseView.TIME_SELECTION, listener);
}

ZmCalNewBaseView.prototype.addDateRangeListener = 
function(listener) {
	this.addListener(DwtEvent.DATE_RANGE, listener);
}

ZmCalNewBaseView.prototype.removeDateRangeListener = 
function(listener) { 
	this.removeListener(DwtEvent.DATE_RANGE, listener);
}

// override. 
ZmCalNewBaseView.prototype.getRollField =
function(isDouble)
{
	return 0;
}

ZmCalNewBaseView.prototype.getDate =
function() {
	return this._date;
}

ZmCalNewBaseView.prototype.getTimeRange =
function() {
	return { start: this._timeRangeStart, end: this._timeRangeEnd };
}

ZmCalNewBaseView.prototype.isInView =
function(appt) {
	return appt.isInRange(this._timeRangeStart, this._timeRangeEnd);
}

ZmCalNewBaseView.prototype.isStartInView =
function(appt) {
	return appt.isStartInRange(this._timeRangeStart, this._timeRangeEnd);
}

ZmCalNewBaseView.prototype.isEndInView =
function(appt) {
	return appt.isEndInRange(this._timeRangeStart, this._timeRangeEnd);
}

ZmCalNewBaseView.prototype._dayKey =
function(date) {
	var key = date.getFullYear()+"/"+date.getMonth()+"/"+date.getDate();
	return key;
}

ZmCalNewBaseView.prototype.setDate =
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
ZmCalNewBaseView.prototype._dateUpdate =
function(rangeChanged) 
{

}

/*
* override: called when an appointment is clicked to see if the view should de-select a selected time range. For example,
* in day view if you have selected the 8:00 AM row and then click on an appt, the 8:00 AM row should be de-selected. If
* you are in month view though and have a day selected, thne day should still be selected if the appt you clicked on is in 
* the same day.
*/
ZmCalNewBaseView.prototype._apptSelected =
function() {

}

// override
ZmCalNewBaseView.prototype._updateRange =
function() { }

// override 
ZmCalNewBaseView.prototype._updateTitle =
function() { }


ZmCalNewBaseView.prototype.addAppt = 
function(ao, now) {
	var item = this._createItemHtml(ao, now);
	var div = this._getDivForAppt(ao);
	if (div) div.appendChild(item);
}

ZmCalNewBaseView.prototype.set = 
function(list) {
	this._preSet();
//	ZmListView.prototype.set.call(this, list);
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
ZmCalNewBaseView.prototype._fanoutAllDay =
function(appt) {
	return true;
}

// override
ZmCalNewBaseView.prototype._postSet =
function(appt) {}

// override
ZmCalNewBaseView.prototype._preSet =
function(appt) {}

// override
ZmCalNewBaseView.prototype._getDivForAppt =
function(appt) {}

ZmCalNewBaseView.prototype.setUI =
function(defaultColumnSort) {	/* do nothing */ }

ZmCalNewBaseView.prototype._setNoResultsHtml =
function() { /* do nothing */ }

ZmCalNewBaseView.prototype._addApptIcons =
function(appt, html, idx) {

	html[idx++] = "<table border=0 cellpadding=0 cellspacing=0 style='display:inline'><tr>";

	if (appt.hasOtherAttendees())
		html[idx++] = "<td>" + AjxImg.getImageHtml(ZmImg.I_APPT_MEETING) + "</td>";

	if (appt.isException())
		html[idx++] = "<td>" + AjxImg.getImageHtml(ZmImg.I_APPT_EXCEPTION) + "</td>";
	else if (appt.isRecurring())
		html[idx++] = "<td>" + AjxImg.getImageHtml(ZmImg.I_APPT_RECUR) + "</td>";

	if (appt.hasAlarm())
		html[idx++] = "<td>" + AjxImg.getImageHtml(ZmImg.I_APPT_REMINDER) + "</td>";
	
	html[idx++] = "</tr></table>";

	return idx;
}

ZmCalNewBaseView.prototype._getElFromItem = 
function(item) {
			return Dwt.getDomObj(this.getDocument(), this._getItemId(item));
}

ZmCalNewBaseView.prototype._resetList =
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
			AjxCore.unassignId(appt._itemIndex);
		}
	}
	list.removeAll();
	this.removeAll();	
}

ZmCalNewBaseView.prototype.removeAll =
function() {
	this._selectedItems.removeAll();
	this._selAnchor = null;
}

ZmCalNewBaseView.prototype.getCalTitle = 
function() {
	return this._title;
}

// override
ZmCalNewBaseView.prototype._createItemHtml =
function(appt, now, isDndIcon) {}

// override
ZmCalNewBaseView.prototype._createHtml =
function() {}

ZmCalNewBaseView.prototype._controlListener =
function(ev) {
	if ((ev.oldWidth != ev.newWidth) ||
		(ev.oldHeight != ev.newHeight)) {
		this._layout();
	}
}

/**
* override
*/
ZmCalNewBaseView.prototype._layout =
function() {}

ZmCalNewBaseView.prototype._mouseOverAction =
function(ev, div) {
	DwtListView.prototype._mouseOverAction.call(this, ev, div);
	//var id = ev.target.id ? ev.target.id : div.id;
	//if (!id) return true;

	var item = this.getItemFromElement(div);
	if (item instanceof ZmAppt) {
		this.setToolTipContent(item.getToolTip());
	} else {
		this.setToolTipContent(null);
	}
	return true;
}
