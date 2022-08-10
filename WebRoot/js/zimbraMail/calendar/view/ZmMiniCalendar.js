/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2010, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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