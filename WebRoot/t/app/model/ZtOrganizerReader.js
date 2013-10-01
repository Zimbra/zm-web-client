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
 * This class parses JSON organizer (folder/search/tag) data into ZtOrganizer objects.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.ZtOrganizerReader', {

	// we don't extend ZtReader since we don't actually make SOAP requests
	extend: 'Ext.data.reader.Json',

	alias: 'reader.organizerreader',

	getDataFromNode: function(node, type, app, parents) {

		// Get exact folder type if we're dealing with a folder. Tag needs unique ID for each store
		// it appears in (tag is only organizer that can appear in multiple overviews). Trash also
		// appears in more than one overview.
		var type1 = (type === ZCS.constant.ORG_FOLDER) ? ZCS.constant.FOLDER_TYPE[app] : type,
			id = ZCS.model.ZtOrganizer.getOrganizerId(node.id, type, app),
			parentId = node.l ? ZCS.model.ZtOrganizer.getOrganizerId(node.l, type, app) : null;

		var childNodeName = ZCS.constant.ORG_NODE[type],
			hasChildren = !!(node[childNodeName] && node[childNodeName].length > 0);

		var data = {
			id:             id,
			itemId:         id,
			zcsId:          node.id,
			parentItemId:   parentId,
			name:           node.name,
			displayName:    Ext.String.htmlEncode(node.name),
			notifyType:     type,
			path:           node.name,
			color:          node.color,
			rgb:            node.rgb,
			itemCount:      node.n,
			disclosure:     hasChildren,
			type:           type1,
			url:            node.url
		};
		data.typeName = ZCS.constant.ORG_NAME[type1];

		if (node.absFolderPath) {
			data.path = node.absFolderPath;
		}
		else if (parents && parents.length) {
			data.path = parents.join('/') + '/' + node.name;
		}

		// type-specific fields
		if (type1 === ZCS.constant.ORG_MAIL_FOLDER) {
			if (node.u != null) {
				data.unreadCount = node.u;
			}
		}
		else if (type === ZCS.constant.ORG_SAVED_SEARCH) {
			data.query = node.query;
		}

		if (hasChildren) {
			data.items = [];
			data.leaf = false;
		} else {
			data.leaf = true;
		}

		return data;
	}
});
