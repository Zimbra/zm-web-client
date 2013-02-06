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
 * This class parses JSON conversation data into ZtConv objects.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.mail.ZtConvReader', {

	extend: 'ZCS.model.mail.ZtMailReader',

	alias: 'reader.convreader',

	getDataFromNode: function(node) {

		var data = {},
			nowMs = Ext.Date.now();

		data.itemId = node.id;
		data.type = ZCS.constant.ITEM_CONVERSATION;
		data.subject = ZCS.model.mail.ZtMailItem.stripSubjectPrefixes(node.su);
		data.numMsgs = node.n;
		data.fragment = node.fr;
		this.parseFlags(node, data);

		// process addresses, and create a string showing the senders
		data.addresses = this.convertAddresses(node.e);
		data.senders = this.getSenders(data.addresses);
		data.dateStr = this.getDateString(node.d, nowMs);

		return data;
	},

	/**
	 * Create a sender string from addresses. It shows up to a certain number of senders,
	 * with an ellipsis at the end if not all of them are shown.
	 *
	 * @param {object}  addresses   hash of addresses by type
	 */
	getSenders: function(addresses) {

		var senderStr = '',
			senders;

		if (addresses && addresses[ZCS.constant.FROM]) {
			senders = Ext.Array.map(addresses[ZCS.constant.FROM], function(addr) {
				return addr.getDisplayName() || addr.getName() || addr.getEmail();
			});
			var numSenders = ZCS.constant.NUM_CONV_SENDERS;
			if (senders.length > numSenders) {
				senders = senders.slice(0, numSenders);
				senders.push('...');
			}
			senderStr = senders.join(', ');
		}

		return senderStr;
	}
});
