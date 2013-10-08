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
	 * Returns a "reversed" map, with the keys and values switched.
	 *
	 * @param {Object}  map     hash map
	 * @return {Object} reversed map
	 * @private
	 */
	getBackMap: function(map) {
		var backMap = {}, key;
		for (key in map) {
			backMap[map[key]] = key;
		}
		return backMap;
	},

	/**
	 * Returns a unique ID using a sequence number, eg "zcs-123".
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

	/**
	 * Returns the ID that matches the given set of params. If more than one ID matches, a list is returned.
	 * A partial set of params may be provided. The more params provided, the better the chance of finding just one ID.
	 * The best approach is to provide the minimal set of params that will uniquely differentiate the element. If no
	 * params are provided, returns all IDs.
	 *
	 * @param {Object}  params    set of fields describing the ID(s) being sought
	 */
/*
	lookupId: function(params) {

		var me = ZCS.util,
			allIds = Object.keys(me.idParams),
			len = ids.length, i, idParams, add, param,
			ids = [];

		if (!params) {
			return allIds;
		}

		for (i = 0; i < len; i++) {
			idParams = me.idParams[allIds[i]];
			add = true;
			for (param in params) {
				if (idParams[param] && params[param] !== idParams[param]) {
					add = false;
					continue;
				}
			}
			if (add) {
				ids.push(idParams.id);
			}
		}
		return (ids.length === 0) ? null : (ids.length === 1) ? ids[0] : ids;
	},
*/

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
	 * @param {Array}       array to convert
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
			accountId:  '',
			localId:    '',
			isRemote:   false
		};
		if (!id) {
			return result;
		}

		// handle ID that was made unique to satisfy ST, eg "mail-folder-3"
		var parts;
		if (id.indexOf('-') > 0) {
			parts = id.split('-');
			id = parts[parts.length - 1];
		}

		if (id.indexOf(':') > 0) {
			parts = id.split(':');
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
	 * Returns the local (unqualified) part of the given ID.
	 *
	 * @param {String}  id      an item or organizer ID
	 * @return {String}     local ID
	 */
	localId: function(id) {
		return id ? this.parseId(id).localId : '';
	},

	/**
	 * Returns true if the given folder (or folder ID) matches the given local ID.
	 * Intended use is to check to see if a folder is a particular type of system
	 * folder such as Trash.
	 *
	 * @param {ZtOrganizer|String}      folder      folder to check (or folder ID)
	 * @param {String}                  folderId    ID to check against
	 * @return {Boolean}    true if folder matches given folder ID
	 */
	folderIs: function(folder, folderId) {

		if (Ext.isString(folder)) {
			folder = ZCS.cache.get(folder);
		}
		return folder ? this.localId(folder.get('zcsId')) === folderId : false;
	},

	/**
	 * Returns the local ID of the folder currently being viewed, if any.
	 *
	 * @return {String}     local ID of current folder
	 */
	curFolderLocalId: function() {
		var curFolder = ZCS.session.getCurrentSearchOrganizer();
		return curFolder ? this.localId(curFolder.get('zcsId')) : '';
	},

	/**
	 * Returns true if the current folder matches the given ID.
	 *
	 * @param {String}      folderId        folder ID to match against
	 * @return {Boolean}        true if the current folder matches the given ID
	 */
	curFolderIs: function(folderId) {
		return this.curFolderLocalId() === folderId;
	},

	/**
	 * Returns true if the given folder ID is for a folder that typically stores
	 * outbound messages.
	 *
	 * @param {String}      folderId        folder ID to check
	 * @return {Boolean}    true if folder is outbound
	 */
	isOutboundFolderId: function(folderId) {
		var localId = this.localId(folderId);
		return localId === ZCS.constant.ID_SENT || localId === ZCS.constant.ID_DRAFTS;
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
	},

	/**
	 * Shortens a potentially long file name for display by eliding the middle part of the name
	 * and retaining the extension.
	 *
	 * ZCS.util.trimFileName('abcdefghijklmnopqrstuvwxyz.pdf', 15) => 'abcd...wxyz.pdf'
	 *
	 * @param {String}  fileName    name of file
	 * @param {Number}  max         maximum length of string to return
	 *
	 * @return {String}     possibly truncated file name
	 */
	trimFileName: function(fileName, max) {

		var parts = fileName.split('.');
		if (!parts || parts.length !== 2 || fileName.length <= max || max < 10) {
			return fileName;
		}

		var name = parts[0], ext = parts[1],
			len = (max - (ext.length + 4)) / 2;

		return name.substr(0, len) + '...' + name.substr(-len) + '.' + ext;
	},

	/**
	 * Copies fields from a model instance into a data hash suitable for passing
	 * to a template.
	 *
	 * @param {Model}   model       source model
	 * @param {Array}   fields      list of fields to copy
	 *
	 * @return {Object}     hash of data
	 */
	getFields: function(model, fields) {

		var data = {};

		Ext.each(fields, function(field) {
			data[field] = model.get(field);
		}, this);

		return data;
	},

	/**
	 * Copies fields from a hash of data into a model instance.
	 *
	 * @param {Object}  data        hash of data
	 * @param {Model}   model       target model
	 * @param {Array}   fields      list of fields to copy
	 */
	setFields: function(data, model, fields) {

		Ext.each(fields, function(field) {
			model.set(field, data[field]);
		}, this);
	},

    /**
     * Returns the position of item in an array.
     *
     * @param {Array} array
     * @param {Object} object
     * @param {String} strict
     * @return {Number}
     */
    indexOf: function(array, object, strict) {

        if (array) {
            var i,
                item;

            for (i = 0; i < array.length; i++) {
                item = array[i];

                if ((strict && item === object) || (!strict && item == object)) {
                    return i;
                }
            }
        }
        return -1;
    },

    /**
     * Returns server date time object.
     *
     * @param {String} serverStr
     * @param {String} noSpecialUtcCase
     * @return {Date}
     */
    parseServerDateTime: function(serverStr, noSpecialUtcCase) {
        if (serverStr == null) {
            return null;
        }

        var d = new Date(),
            yyyy = parseInt(serverStr.substr(0,4), 10),
            MM = parseInt(serverStr.substr(4,2), 10),
            dd = parseInt(serverStr.substr(6,2), 10);

        d.setFullYear(yyyy);
        d.setMonth(MM - 1);
        d.setMonth(MM - 1);
        d.setDate(dd);
        this.parseServerTime(serverStr, d, noSpecialUtcCase);
        return d;
    },

    /**
     * Returns server date time object.
     *
     * @param {String} serverStr
     * @param {Date} date
     * @param {String} noSpecialUtcCase
     * @return {Date}
     */
    parseServerTime: function(serverStr, date, noSpecialUtcCase) {
        if (serverStr.charAt(8) == 'T') {
            var hh = parseInt(serverStr.substr(9,2), 10),
                mm = parseInt(serverStr.substr(11,2), 10),
                ss = parseInt(serverStr.substr(13,2), 10);

            if (!noSpecialUtcCase && serverStr.charAt(15) == 'Z') {
                mm += ZCS.timezone.getOffset(ZCS.timezone.DEFAULT_TZ, date);
            }
            date.setHours(hh, mm, ss, 0);
        }
        return date;
    },

    /**
     * Returns messages from properties with formatted data.
     *
     * @param {String} pattern
     * @param {Object} value - This could be a Number/String/Array object
     * @return {String}
     */
    formatRecurMsg: function(pattern, value) {
        switch (pattern) {
            case ZtMsg.recurStart:
                return Ext.String.format(pattern, Ext.Date.format(value, 'F j, Y'));

            case ZtMsg.recurEndNumber:
                return Ext.String.format(pattern, value);

            case ZtMsg.recurEndByDate:
                return Ext.String.format(pattern, Ext.Date.format(value, 'F j, Y'));

            case ZtMsg.recurDailyEveryNumDays:
                return Ext.String.format(pattern, value);

            case ZtMsg.recurWeeklyEveryNumWeeksDate: {
                if (value[1].length === 0) {
                    return Ext.String.format(pattern, value[0], '');
                }
                else if (value[1].length === 1) {
                    return Ext.String.format(pattern, value[0], Ext.Date.format(value[0][0], 'l'));
                }

                var weekDaysLen = value[1].length,
                    i,
                    msgStr = '';

                for (i = 0; i < weekDaysLen; i++) {
                    msgStr += Ext.Date.format(value[1][i], 'l') + (i !== weekDaysLen - 1 ? ', ' : '');
                }

                return Ext.String.format(pattern, value[0], msgStr);
            }

            case ZtMsg.recurWeeklyEveryWeekday:
                return Ext.String.format(pattern, Ext.Date.format(value, 'l'));

            case ZtMsg.recurYearlyEveryDate:
                return Ext.String.format(pattern, Ext.Date.format(value[0], 'F'), value[1]);

            case ZtMsg.recurYearlyEveryMonthWeekDays:
                return Ext.String.format(pattern, this.getOrdinal(value[0]), this.getDayType(value[1]), Ext.Date.format(value[2], 'F'));

            case ZtMsg.recurYearlyEveryMonthNumDay:
                return Ext.String.format(pattern, this.getOrdinal(value[0]), Ext.Date.format(value[1], 'l'), Ext.Date.format(value[2], 'F'));

            case ZtMsg.recurMonthlyEveryNumMonthsNumDay:
                return Ext.String.format(pattern, this.getOrdinal(value[0]), Ext.Date.format(value[1], 'l'), value[2]);

            case ZtMsg.recurMonthlyEveryNumMonthsWeekDays:
                return Ext.String.format(pattern, this.getOrdinal(value[0]), this.getDayType(value[1]), value[2]);

            case ZtMsg.recurMonthlyEveryNumMonthsDate:
                return Ext.String.format(pattern, value[0], value[1]);
        }
    },

    /**
     * Returns words - last, first, second, third and fourth based on the bysetpos/ordinal values supplied.
     *
     * @param {String} ordinal
     * @return {String}
     */
    getOrdinal: function(ordinal) {
        switch (ordinal) {
            case -1: return ZtMsg.recurLast;
            case 1: return ZtMsg.recurFirst;
            case 2: return ZtMsg.recurSecond;
            case 3: return ZtMsg.recurThird;
            case 4: return ZtMsg.recurFourth;
        }
    },

    /**
     * Returns words - day, week end, weekday based on the dayType values supplied.
     *
     * @param {String} dayType
     * @return {String}
     */
    getDayType: function(dayType) {
        switch (dayType) {
            case -1: return ZtMsg.recurDay;
            case 0: return ZtMsg.recurWeekend;
            case 1: return ZtMsg.recurWeekday;
        }
    }
});
