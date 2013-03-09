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

	idSeq: 0,

	idParams: {},

	/**
	 * Returns a unique DOM ID using a sequence number, eg "zcs-123".
	 *
	 * @param {Object}  params  optional params to associate with this ID
	 * @return {String}
	 */
	getUniqueId: function(params) {
		var me = ZCS.util;
		me.idSeq = me.idSeq + 1;
		var id = 'zcs-' + me.idSeq;
		if (params) {
			me.idParams[id] = params;
		}
		return id;
	},

	/**
	 * Returns the params (if any) associated with the given ID when it was created.
	 * @param id
	 * @return {Object}     ID params
	 */
	getIdParams: function(id) {
		return ZCS.util.idParams[id];
	},

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
	},

	compareOrganizers: function(organizer1, organizer2) {

		var orgType1 = organizer1.type,
			orgType2 = organizer2.type,
			id1 = organizer1.itemId,
			id2 = organizer2.itemId,
			isSystem1 = (orgType1 !== ZCS.constant.ORG_SAVED_SEARCH && orgType1 !== ZCS.constant.ORG_TAG && id1 <= ZCS.constant.MAX_SYSTEM_ID),
			isSystem2 = (orgType2 !== ZCS.constant.ORG_SAVED_SEARCH && orgType2 !== ZCS.constant.ORG_TAG && id2 <= ZCS.constant.MAX_SYSTEM_ID),
			sortField1, sortField2;

		if (orgType1 !== orgType2) {
			sortField1 = ZCS.constant.ORG_SORT_VALUE[orgType1];
			sortField2 = ZCS.constant.ORG_SORT_VALUE[orgType2];
		}
		else if (isSystem1 !== isSystem2) {
			return isSystem1 ? -1 : 1;
		}
		else if (isSystem1 && isSystem2) {
			sortField1 = ZCS.constant.FOLDER_SORT_VALUE[id1];
			sortField2 = ZCS.constant.FOLDER_SORT_VALUE[id2];
		}
		else {
			sortField1 = organizer1.name.toLowerCase();
			sortField2 = organizer2.name.toLowerCase();
		}

		return sortField1 > sortField2 ? 1 : (sortField1 === sortField2 ? 0 : -1);
	},

	/**
	 * Converts a date from the Zimbra server format to a Date object.
	 *
	 * @param {string}      dateStr     date in Zimbra server format
	 * @return {Date}
	 */
	convertZimbraDate: function(dateStr) {

		if (!dateStr) {
			return null;
		}

		var date = new Date();

		date.setFullYear(parseInt(dateStr.substr(0, 4)));
		date.setMonth(parseInt(dateStr.substr(4, 2) - 1));
		date.setDate(parseInt(dateStr.substr(6, 2)));

		if (dateStr.charAt(8) == 'T') {
			var hh = parseInt(serverStr.substr(9, 2)),
				mm = parseInt(serverStr.substr(11, 2)),
				ss = parseInt(serverStr.substr(13, 2));

			date.setHours(hh, mm, ss, 0);
		}

		return date;
	},

	/**
	 * Returns a readable version of a file size, such as "1.8 MB".  Would be nice to
	 * have Ext.util.Format.fileSize available, but it's not.
	 *
	 * @param {int}     size        file size in bytes
	 * @return {String}     file size string
	 */
	formatFileSize: function(size) {

		if (size < 1024) {
			return size + ' ' + ZtMsg.bytes;
		}
		else if (size < (1024 * 1024)) {
			return (Math.round((size / 1024) * 10) / 10) + ' ' + ZtMsg.kilobytes;
		}
		else {
			return (Math.round((size / (1024 * 1024)) * 10) / 10) + ' ' + ZtMsg.megabytes;
		}
	}
});
