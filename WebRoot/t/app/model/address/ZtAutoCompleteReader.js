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
 * This class parses JSON contact data into ZtContact objects.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.address.ZtAutoCompleteReader', {

	extend: 'ZCS.model.ZtReader',

	alias: 'reader.autocompletereader',

	/**
	 * The response always has: 'email', 'type', 'isGroup', and 'ranking'. If it is a local
	 * contact, it will also have 'id' and 'l'. The email address is a full email string, so
	 * we parse it into components.
	 */
	getDataFromNode: function(node) {

		var data = {},
			emailAddressObj = ZCS.model.mail.ZtEmailAddress.fromEmail(node.email);

        if (emailAddressObj) {
            data.email = emailAddressObj.get('email');
            data.name = emailAddressObj.get('name');
            data.displayName = node.display || emailAddressObj.get('displayName');
        }
		if (node.display) {
			data.name = node.display;
		}
		data.isGroup = node.isGroup;
		data.ranking = node.ranking;
        data.matchType = node.type;
		data.contactId = node.id;
		data.folderId = node.l;

		return data;
	},

	/**
	 * Converts a list of JSON nodes into a list of records.
	 *
	 * @param {array}   root        list of JSON nodes
	 * @return {array}  list of records
	 */
	getRecords: function(root) {

		var records = [],
			ids = {};

		Ext.each(root, function(node, index) {
			var nodeId = node.id ? [ node.type, node.id, index ].join(ZCS.constant.ID_JOIN) : null;
			// For some reason, this API can return the same record multiple times. Filtering them out.
			if (!ids[nodeId]) {

				// Only set a flag if the node has a server provided id, if not, let ext generate one.
				if (nodeId) {
					ids[nodeId] = true;
				}
				records.push({
					clientId:   null,
					id:         nodeId,
					data:       this.getDataFromNode(node),
					node:       node
				});
			}
		}, this);

		return records;
	}
});
