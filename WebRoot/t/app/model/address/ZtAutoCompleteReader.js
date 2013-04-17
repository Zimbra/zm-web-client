/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 VMware, Inc.
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
 * This class parses JSON contact data into ZtContact objects.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.address.ZtAutoCompleteReader', {

	extend: 'ZCS.model.ZtReader',

	alias: 'reader.autocompletereader',

	getDataFromNode: function(node) {
		//Take the email address that was given by the search, and break it down into a ZtEmailAddress
		//This may be in the form <email> or "blah" <email>
		var emailAddress = ZCS.model.mail.ZtEmailAddress.fromEmail(node.email);

		node.name = emailAddress.get('name');
		node.fullEmail = node.email;
		node.email = emailAddress.get('email');

		return node;
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

		Ext.each(root, function(node) {
			var nodeId;

			if (node.id) {
				nodeId = node.type + '-' + node.id;
			} else {
				//The server did not provide an id for this record.
				nodeId = null;
			}

			//For some reason, this API returns the same exact contact record multiple times. Filtering them out.
			if (!ids[nodeId]) {

				//Only set a flag if the node has a server provided id, if not, let ext generate one.
				if (nodeId) {
					ids[nodeId] = true;
				}
				records.push({
					clientId: null,
					id: nodeId,
					data: this.getDataFromNode(node),
					node: node
				});
			}
		}, this);

		return records;
	}
});
