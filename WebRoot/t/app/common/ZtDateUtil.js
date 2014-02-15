/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2012, 2013 Zimbra Software, LLC.
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * General-purpose date utility functions. On app load, initializes by converting
 * strings from ZtMsg into a form that can be used by DateExtras within Sencha Touch.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.common.ZtDateUtil', {

	singleton: true,

	alternateClassName: 'ZCS.dateutil',

	requires: ['Ext.DateExtras'],

	constructor: function() {

		var dayNames = [
			'Sunday',
			'Monday',
			'Tuesday',
			'Wednesday',
			'Thursday',
			'Friday',
			'Saturday'
		];

		var monthNames = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December'
		];

		Ext.Date.dayNames = Ext.Array.map(dayNames, function(day) {
			return ZtMsg['weekday' + day];
		});

		Ext.Date.monthNames = Ext.Array.map(monthNames, function(month) {
			return ZtMsg['month' + month];
		});

		Ext.Date.getShortDayName = function(dayIndex) {
			var day = dayNames[dayIndex];
			return ZtMsg['weekday' + day + 'Short'] || ZtMsg['weekday' + day];
		};

		Ext.Date.getShortMonthName = function(monthIndex) {
			var month = monthNames[monthIndex];
			return ZtMsg['month' + month + 'Short'] || ZtMsg['month' + month];
		};

		var monthNumber = {};
		Ext.each(monthNames, function(month, index) {
			var shortMonth = Ext.Date.getShortMonthName(month);
			monthNumber[month] = monthNumber[shortMonth] = index;
		});

		Ext.Date.getMonthNumber = function(month) {
			return monthNumber[month];
		};
	}
});
