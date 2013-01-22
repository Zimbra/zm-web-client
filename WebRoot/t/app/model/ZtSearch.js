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
Ext.define('ZCS.model.ZtSearch', {

	config: {
		query: null,
		folderId: null,
		folderName: null
	},

	constructor: function(config) {

		this.initConfig(config);

		var query = this.getQuery(),
			q = query && Ext.String.trim(query),
			m = q && q.match(/^in:["']?([a-z\/]+)["']?$/);

		if (m && m.length) {
			var folderName = m[1],
				systemId = ZCS.constant.FOLDER_SYSTEM_ID[m[1].toLowerCase()],
				systemFolder = systemId && ZCS.session.getFolderById(systemId),
				systemName = systemFolder && systemFolder.get('name');

//			if (folderId) {
//				folderName =
//			}
			this.setFolderId(ZCS.constant.FOLDER_SYSTEM_ID[m[1].toLowerCase()] || m[1]);
		}
	}
});
