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
 * This class generates the JSON for organizer-related SOAP requests.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.ZtOrganizerWriter', {

	extend: 'ZCS.model.ZtWriter',

	alias: 'writer.organizerwriter',

	writeRecords: function(request, data) {

		var operation = request.getOperation(),
			options = operation.getInitialConfig(),
			itemData = Ext.merge(data[0] || {}, options),
			action = request.getAction(),
			json, methodJson;

		if (action === 'create') {

			var	organizer = request.getRecords()[0],
				type = organizer.get('type'),
				orgName = organizer.get('name');

			if (type === ZCS.constant.ORG_FOLDER) {
				json = this.getSoapEnvelope(request, data, 'CreateFolder');
				methodJson = json.Body.CreateFolderRequest;
				var folder = methodJson.folder = {};
				folder.name = orgName;
				folder.l = organizer.get('parentZcsId');
				folder.view = itemData.view;
			}
			else if (type === ZCS.constant.ORG_TAG) {
				json = this.getSoapEnvelope(request, data, 'CreateTag');
				methodJson = json.Body.CreateTagRequest;
				var tag = methodJson.tag = {};
				tag.name = orgName;
				tag.color = organizer.get('color');
			}
		}
		else if (action === 'read') {

			// GetFolderRequest

		}
		else if (action === 'update') {

			var	organizer = request.getRecords()[0],
				type = organizer.get('type');

			if (type === ZCS.constant.ORG_FOLDER) {
				json = this.getSoapEnvelope(request, data, 'FolderAction');
				methodJson = json.Body.FolderActionRequest;
				var action = methodJson.action = {
					id: organizer.get('zcsId')
				};
				if (itemData.name) {
					action.op = 'rename';
					action.name = itemData.name;
				}
				else if (itemData.trash) {
					action.op = 'trash';
				}
				else if (itemData.delete) {
					action.op = 'delete';
				}
				else if (itemData.parentId) {
					action.op = 'move';
					action.l = itemData.parentId;
				}
			}
			else if (type === ZCS.constant.ORG_TAG) {

				json = this.getSoapEnvelope(request, data, 'TagAction');
				methodJson = json.Body.TagActionRequest;
				var action = methodJson.action = {
					id: organizer.get('zcsId')
				};
				if (itemData.name) {
					action.op = 'rename';
					action.name = itemData.name;
				}
				else if (itemData.color) {
					action.op = 'color';
					action.color = itemData.color;
				}
				else if (itemData.delete) {
					action.op = 'delete';
				}
			}
		}

		// Do not pass query in query string.
		request.setParams({});
		request.setJsonData(json);

		return request;
	}
});
