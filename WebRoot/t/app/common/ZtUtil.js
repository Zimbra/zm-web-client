/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2012, 2013 VMware, Inc.
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
		folder = Ext.isString(folder) ? ZCS.cache.get(folder) : folder;
		return folder ? this.localId(folder.get('itemId')) === folderId : false;
	},

	/**
	 * Returns the local ID of the folder currently being viewed, if any.
	 *
	 * @return {String}     local ID of current folder
	 */
	curFolderLocalId: function() {
		var curFolder = ZCS.session.getCurrentSearchOrganizer();
		return curFolder ? this.localId(curFolder.get('itemId')) : '';
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
     * Get the image URL.
     *
     * contact {Object} contact details
     * maxWidth {int} max pixel width (optional - default 48)
     * @return	{String}	the image URL
     */
    getImageUrl: function(contact, maxWidth) {
        var image = contact && contact.data.image;
        var imagePart  = (image && image.part) || contact.data.imagepart;

        if (!imagePart) {
            return contact.data.zimletImage || null;  //return zimlet populated image only if user-uploaded image is not there.
        }

        maxWidth = maxWidth || 48;

        return ZCS.htmlutil.buildUrl({
            path: ZCS.constant.PATH_MSG_FETCH,
            qsArgs: {
                auth: 'co',
                id: contact.data.id,
                part: imagePart,
                max_width:maxWidth,
                t:(new Date()).getTime()
            }
        });
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
	}
});
