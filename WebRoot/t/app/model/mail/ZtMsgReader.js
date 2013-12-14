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
 * This class translates JSON for a message into a ZtMailMsg.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.mail.ZtMsgReader', {

	extend: 'ZCS.model.mail.ZtMailReader',

	requires: [
		'ZCS.model.mail.ZtMimePart',
		'ZCS.model.mail.ZtInvite'
	],

	alias: 'reader.msgreader',

	// SendMsgResponse hands us back empty msg object, no need to process it
	getRoot: function(data, nodeName) {
		return (data.soapMethod === 'SendMsg') ? null : this.callParent(arguments);
	},

	getDataFromNode: function(node) {

		var data = {},
			ctxt;

		data.zcsId          = node.id;
		data.type           = ZCS.constant.ITEM_MESSAGE;
		data.folderId       = node.l;
		data.fragment       = node.fr;
		data.convId         = node.cid;
		data.subject        = node.su;
		data.date           = node.d;
		data.sentDate       = node.sd;
		data.messageId      = node.mid;
		data.irtMessageId   = node.irt;

		this.parseFlags(node, data);

		data.addresses = ZCS.model.mail.ZtMailItem.convertAddressJsonToModel(node.e);

		data.dateStr = ZCS.util.getRelativeDateString(node.d);
		data.fullDateStr = Ext.Date.format(new Date(node.d), 'F j, Y g:i:s A');

		data.tags = ZCS.model.ZtItem.parseTags(node.t, ZCS.constant.APP_MAIL);

		if (node.mp) {
			ctxt = {
				attachments:    [],
				bodyParts:      [],
				contentTypes:   {}
			}
			data.topPart = ZCS.model.mail.ZtMimePart.fromJson(node.mp[0], ctxt);
			data.attachments = ctxt.attachments;
			data.bodyParts = ctxt.bodyParts;
			data.contentTypes = ctxt.contentTypes;
			data.isLoaded = !!(data.bodyParts.length > 0 || data.attachments.length > 0);
		}
		else {
			data.isLoaded = false;
		}

        // Fix for bug: 83398. Checking if invite is empty
		if (node.inv && (Object.keys(node.inv[0]).length !== 0)) {

            var invite = ZCS.model.mail.ZtInvite.fromJson(node.inv[0], node.id);
 			data.invite = Ext.Object.merge({}, invite, {});
			if (node.cif) {
				data.invite.set('calendarIntendedFor', node.cif);
			}
		}

		return data;
	},

	/**
	 * Override so we can omit Trash/Junk/Drafts messages from being displayed as part of the conv, unless
	 * the user is in one of those folders.
	 */
	getRecords: function(root) {

		if (!root) {
			return [];
		}

		var records = [], ln = root.length, i;

		// Process each msg from JSON to data
		for (i = 0; i < ln; i++) {
			var node = root[i];
			if (ZCS.model.mail.ZtConv.shouldShowMessage(node)) {
				records.push({
					clientId:   null,
					id:         node.id,
					data:       this.getDataFromNode(node),
					node:       node
				});
			}
		}

		return records;
	}
});
