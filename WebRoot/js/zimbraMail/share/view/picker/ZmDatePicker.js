/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */

ZmDatePicker = function(parent) {
	ZmPicker.call(this, parent, ZmPicker.DATE);
};

ZmDatePicker.prototype = new ZmPicker;
ZmDatePicker.prototype.constructor = ZmDatePicker;

ZmPicker.CTOR[ZmPicker.DATE] = ZmDatePicker;

ZmDatePicker.SELECT_OPTIONS = [
	{ label: ZmMsg.isAfter, 	value: "after", 	selected: false },
	{ label: ZmMsg.isBefore, 	value: "before", 	selected: true  },
	{ label: ZmMsg.isOn, 		value: "date", 		selected: false }];

ZmDatePicker.prototype.toString = 
function() {
	return "ZmDatePicker";
};

ZmDatePicker.prototype._setupPicker =
function(parent) {
	var picker = new DwtComposite(parent);
	var selectId = Dwt.getNextId();
	var calId = Dwt.getNextId();
    
    var html = new Array(11);
    var i = 0;
    html[i++] = "<table cellpadding=3 cellspacing=0 border=0 style='width:100%;'>";
    html[i++] = "<tr align='center' valign='middle'><td align='right' nowrap>";
    html[i++] = ZmMsg.date;
    html[i++] = ":</td><td align='left' id='";
    html[i++] = selectId;
    html[i++] = "'></td></tr>";
    html[i++] = "<tr valign='left'>";
    html[i++] = "<td nowrap align='center' colspan='2' id='";
    html[i++] = calId;
    html[i++] = "'></td></tr></table>";
	picker.getHtmlElement().innerHTML = html.join("");

	// create and add DwtSelect
	this._select = new DwtSelect({parent:this});
	this._select.addChangeListener(new AjxListener(this, this._dateChangeListener));
	for (var i = 0; i < ZmDatePicker.SELECT_OPTIONS.length; i++) {
		var option = ZmDatePicker.SELECT_OPTIONS[i];
		this._select.addOption(option.label, option.selected, option.value);
	}
	this._select.reparentHtmlElement(selectId);

	// create and add DwtCalendar
	var firstDay = appCtxt.get(ZmSetting.CAL_FIRST_DAY_OF_WEEK) || 0;
	var cal = this._cal = new DwtCalendar(picker, null, null, firstDay);
	cal.setDate(new Date());
	cal.addSelectionListener(new AjxListener(this, this._calSelectionListener));
	cal.reparentHtmlElement(calId);

	this._updateQuery();
};

// Set date for second instance of date picker to 3 months back, select "after"
ZmDatePicker.prototype.secondDate =
function() {
	this._select.setSelected(0);
	var date = new Date(this._cal.getDate().getTime());
	AjxDateUtil.roll(date, AjxDateUtil.MONTH, -3);
	this._cal.setDate(date);
	this._updateQuery();
};

ZmDatePicker.prototype._updateQuery = 
function() {
	var d = this._cal.getDate();
	if (d) {
        var formatter = AjxDateFormat.getDateInstance(AjxDateFormat.SHORT);
        var date = formatter.format(d);
        var query = [this._select.getValue(),':"',date,'"'].join("");
        this.setQuery(query);
	} else {
		this.setQuery("");
	}
	this.execute();
};

ZmDatePicker.prototype._calSelectionListener =
function(ev) {
	this._updateQuery();
};

ZmDatePicker.prototype._dateChangeListener = 
function(ev) {
	this._updateQuery();
};
