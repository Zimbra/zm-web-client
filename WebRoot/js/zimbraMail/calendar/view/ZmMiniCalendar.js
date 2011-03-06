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

ZmMiniCalendar = function(params) {
	if (arguments.length == 0) { return; }
    DwtCalendar.call(this, params);
};

ZmMiniCalendar.prototype = new DwtCalendar;
ZmMiniCalendar.prototype.constructor = ZmMiniCalendar;

ZmMiniCalendar.COLOR_GREEN   = 'green';
ZmMiniCalendar.COLOR_RED     = 'red';
ZmMiniCalendar.COLOR_ORANGE  = 'orange';

//override class name selection to include color code into consideration
ZmMiniCalendar.prototype._setCellClassName =
function(cell, className, mode) {
    var className = DwtCalendar.prototype._setCellClassName.call(this, cell, className, mode);
    if(cell._colorCode) {
        className += this._getSuggestionClassName(cell._colorCode);
    }
    return className;
};

ZmMiniCalendar.prototype._getSuggestionClassName =
function(colorCode) {
    return " " + this._origDayClassName + "-" + colorCode;        
};

/**
 * Enables/disables the highlight (i.e. "bolding") on the dates in <code>&lt;dates&gt;</code>.
 *
 * @param {array}	dates	an array of {@link Date} objects for which to enable/disable highlighting
 * @param {boolean}	clear 	if <code>true</code>, clear current highlighting 
 * @param {array}	string  an array of strings representing color codes array ZmMiniCalendar.COLOR_GREEN, ZmMiniCalendar.COLOR_RED, ZmMiniCalendar.COLOR_ORANGE
 */
ZmMiniCalendar.prototype.setColor =
function(dates, clear, color) {
	if (this._date2CellId == null) { return; }

	var cell;
	var aDate;
	if (clear) {
		for (aDate in this._date2CellId) {
			cell = document.getElementById(this._date2CellId[aDate]);
			if (cell._colorCode) {
                cell._colorCode = null;
				this._setClassName(cell, DwtCalendar._NORMAL);
			}
		}
	}

	var cellId;
	for (var i in dates) {
		aDate = dates[i];
		cellId = this._date2CellId[aDate.getFullYear() * 10000 + aDate.getMonth() * 100 + aDate.getDate()];

		if (cellId) {
			cell = document.getElementById(cellId);
			if (color[i]) {
                cell._colorCode = color[i];
				this._setClassName(cell, DwtCalendar._NORMAL);
			}
		}
	}
};