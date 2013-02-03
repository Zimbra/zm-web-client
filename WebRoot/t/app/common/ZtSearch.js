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
 * This class represents a search used to retrieve items matching a query from the server.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.common.ZtSearch', {

	config: {
		query: null,
		folderId: null,
		folderName: null
	},

	/**
	 * Parses the given query so we can save some useful fields.
	 *
	 * @param config
	 * @adapts ZmParsedQuery
	 */
	constructor: function(config) {

		this.initConfig(config);

		var query = this.getQuery(),
			q = query && Ext.String.trim(query),
			m = q && q.match(/^(in|tag):["']?([\w \/]+)["']?$/);

		if (m && m.length) {
			var path = m[2],
				organizer = ZCS.cache.get(path, 'path') || (path && ZCS.cache.get(path.toLowerCase(), 'path'));

			if (organizer) {
				this.setFolderId(organizer.get('itemId'));
			}
		}
	}
});
