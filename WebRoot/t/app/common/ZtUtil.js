/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra, Inc.
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

/**
 * General-purpose utility functions. Most help with class information or
 * provide some JS language support.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.common.ZtUtil', {

	singleton: true,

	alternateClassName: 'ZCS.util',

	getAppFromObject: function(obj) {

		var path = Ext.getDisplayName(obj),
			parts = path && path.split('.'),
			app;

		app = (parts.length >= 3 && parts[0] === 'ZCS' && parts[2]);
		return ZCS.constant.TAB_TITLE[app] ? app : '';
	},

	/**
	 * Returns just the last part of the class name, without the preceding
	 * namespace or path.
	 *
	 * @param {object}  obj     object (instance of a class)
	 */
	getClassName: function(obj) {

		var className = Ext.getClassName(obj),
			parts = className && className.split('.');

		return parts ? parts[parts.length - 1] : '[unknown]';
	},

	/**
	 * Returns the class name of the store, without the initial name-spacing parts.
	 * It will typically be passed to Ext.getStore().
	 */
	getStoreShortName: function(controller) {
		var parts = controller.getStores()[0].split('.');
		return parts[parts.length - 1];
	},

	/**
	 * Converts an array of scalar values into a lookup hash where each value is a key.
	 *
	 * @param {array}       array to convert
	 * @return {object}     lookup hash
	 */
	arrayAsLookupHash: function(array) {
		var hash = {};
		Ext.each(array, function(member) {
			hash[member] = true;
		});
		return hash;
	},

	/**
	 * Parses a possibly compound ID into account and local parts, and returns
	 * them in an object. If the ID is not a compound ID, then the account ID is
	 * set to the current account ID.
	 *
	 * @param {string}  id      item ID
	 *
	 * @return {object}     object with 'accountId' and 'localId' properties
	 */
	parseId: function(id) {

		var result = {
			isRemote: false
		};

		if (id.indexOf(':') > 0) {
			var parts = id.split(':');
			result.accountId = parts[0];
			result.localId = parts[1];
			result.isRemote = true;
		}
		else {
			result.accountId = ZCS.session.getAccountId();
			result.localId = id;
		}

		return result;
	},

	/**
	 * Returns a summary relative date string (eg '5 minutes ago') for the date in the given JSON node, relative
	 * to the given time, or the current time if no time is provided. The string indicates how many minutes ago,
	 * how many hours ago, or if the difference is more than a day, a short version of the month and day.
	 *
	 * @param {int}     date        date in ms
	 * @param {int}     nowMs       base time in ms (defaults to now if not provided)
	 */
	getRelativeDateString: function(date, nowMs) {

		if (date == null) {
			return '';
		}

		var nowMs = nowMs || Ext.Date.now(),
			then = new Date(date),
			thenMs = then.getTime(),
			dateDiff = nowMs - thenMs,
			num, unit, dateStr;

		if (dateDiff < ZCS.constant.MSEC_PER_MINUTE) {
			dateStr = ZtMsg.receivedNow;
		}
		else if (dateDiff < ZCS.constant.MSEC_PER_DAY) {
			if (dateDiff < ZCS.constant.MSEC_PER_HOUR) {
				num = Math.round(dateDiff / ZCS.constant.MSEC_PER_MINUTE);
				unit = num > 1 ? ZtMsg.minutes : ZtMsg.minute;
			}
			else {
				num = Math.round(dateDiff / ZCS.constant.MSEC_PER_HOUR);
				unit = num > 1 ? ZtMsg.hours : ZtMsg.hour;
			}
			dateStr = Ext.String.format(ZtMsg.receivedRecently, num, unit);
		}
		else {
			dateStr = Ext.Date.format(then, 'M j');
		}

		return dateStr;
	}
});
