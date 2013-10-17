/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
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
 * This class represents a search used to retrieve items matching a query from the server.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.common.ZtSearch', {

	config: {
		query:          null,
		organizerId:    null
	},

	statics: {
		/**
		 * Parses the given query and returns an organizer ID if it's a folder or tag query.
		 *
		 * @param {String}      query
		 *
		 * @return {String}     organizer ID
		 */
		parseQuery: function(query) {

			var	q = query && Ext.String.trim(query),
				m = q && q.match(ZCS.constant.REGEX_FOLDER_TAG_SEARCH);

			if (m && m.length) {
				var	path = m[2],
					organizer = ZCS.cache.get(path, 'path') || (path && ZCS.cache.get(path.toLowerCase(), 'path'));

				if (organizer) {
					return organizer.get('itemId');
				}
			}
			return null;
		}
	},

	constructor: function(config) {
		this.initConfig(config);
		this.setOrganizerId(ZCS.common.ZtSearch.parseQuery(this.getQuery()));
	}
});
