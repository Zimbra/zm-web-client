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
 * This class provides an easy way to look up Zimbra items by ID. An item could
 * be a message, conversation, contact, folder, saved search, or tag. IDs are unique
 * across all of those.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.common.ZtItemCache', {

	singleton: true,

	constructor: function() {
		this._cache = {};
	},

	get: function(key) {
		return this._cache[key];
	},

	set: function(key, item) {

		if (!key) {
			Ext.Logger.warn('Setting item in cache without a key');
			return;
		}

		if (this.get(key) === item) {
			Ext.Logger.warn('Setting item in cache that is already there. ID: ' + key);
		}

		this._cache[key] = item;
	}
});

ZCS.cache = ZCS.common.ZtItemCache;
