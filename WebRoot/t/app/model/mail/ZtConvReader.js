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

	/**
	 * Override this method since there's no easy way to override the generated methods that return the
	 * total, success, and message properties. Note that we have not created a ZtConv yet, so we can't
	 * directly add values to it. All we can do is set up the 'data' object, which is then used to transfer
	 * properties into a newly created ZtConv in Operation::processRead.
	 *
	 * @param data
	 */
	readRecords: function(data) {

		var me  = this;
		me.rawData = data;

		var root = data.Body.SearchResponse && data.Body.SearchResponse.c,
			total = root ? root.length : 0,
			success = true,
			message,
			recordCount = 0,
			records = [],
			nowMs = Ext.Date.now(),
			i, node, data;

		if (total > 0) {
			for (i = 0; i < total; i++) {
				node = root[i];
				data = {};
				data.subject = node.su;
				data.numMsgs = node.n;
				data.fragment = node.fr;
				me.parseFlags(node, data);

				// process addresses, and create a string showing the senders
				me.convertAddresses(node.e, data);
				if (data.addresses[ZCS.constant.FROM]) {
					var senders = Ext.Array.map(data.addresses[ZCS.constant.FROM], function(addr) {
						return addr.getDisplayName() || addr.getName() || addr.getEmail();
					});
					var numSenders = ZCS.constant.NUM_CONV_SENDERS;
					if (senders.length > numSenders) {
						senders = senders.slice(0, numSenders);
						senders.push('...');
					}
					data.senders = senders.join(', ');
				}

				data.dateStr = me.getDateString(node, nowMs);

				records.push({
					clientId: null,
					id: node.id,
					data: data,
					node: node
				});
			}
			recordCount = total;
		}

		return new Ext.data.ResultSet({
			total  : total,
			count  : recordCount,
			records: records,
			success: success,
			message: message
		});
	}
});
