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
 * This class parses JSON organizer (folder/search/tag) data into ZtOrganizer data objects.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.ZtOrganizerReader', {

	// we don't extend ZtReader since we don't work directly with SOAP responses
	extend: 'Ext.data.reader.Json',

	alias: 'reader.organizerreader',

	/**
	 * Returns an anonymous object that can used to create a ZtOrganizer instance based
	 * on the given JSON node. At this point, the only ID is the ZCS ID which the server
	 * gives us. The IDs of the organizers within Sencha stores aren't added until the
	 * organizer data is requested from the session, when we'll have enough info to
	 * construct unique IDs.
	 *
	 * @param {Object}  node    JSON node
	 * @param {String}  type    organizer type (folder/search/tag)
	 */
	getDataFromNode: function(node, type) {

		var data = {
			zcsId:          node.id,
			parentZcsId:    node.l || ZCS.constant.ID_ROOT,
			type:           type,
			folderType:     (type === ZCS.constant.ORG_FOLDER) ? ZCS.constant.FOLDER_TYPE[node.view] : null,
			name:           node.name,
			displayName:    Ext.String.htmlEncode(node.name),
			path:           node.absFolderPath || node.name,
			color:          node.color,
			rgb:            node.rgb,
			itemCount:      node.n,
			disclosure:     false,
			leaf:           true,

			url:            node.url,   // feeds
			unreadCount:    node.u,     // mail folders
			query:          node.query, // saved searches
			searchTypes:    node.types  // saved searches
		};

		var	childNodeNames = !type ? [ ZCS.constant.ORG_FOLDER, ZCS.constant.ORG_SEARCH, ZCS.constant.ORG_TAG ] :
				(type === ZCS.constant.ORG_FOLDER) ? [ ZCS.constant.ORG_FOLDER, ZCS.constant.ORG_SEARCH ] : [ type ],
			hasChildren = false;

		Ext.each(childNodeNames, function(childType) {
			if (node[childType] && node[childType].length > 0) {
				hasChildren = true;
				return false;
			}
		}, this);

		data.leaf = !hasChildren;
		if (hasChildren) {
			data.items = [];
		}

		return data;
	}
});
