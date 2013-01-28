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
 * This class translates JSON for a message into a ZtMsg.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.mail.ZtMsgReader', {

	extend: 'ZCS.model.mail.ZtMailReader',

	requires: [
		'ZCS.model.mail.ZtMimePart'
	],

	alias: 'reader.msgreader',

	/**
	 * Override this method since there's no easy way to override the generated methods that return the
	 * total, success, and message properties. Also, we need to do some more in-depth processing of
	 * non-trivial fields such as addresses.
	 */
	readRecords: function(data) {

		var me  = this;
		me.rawData = data;

		// TODO: find a cleaner way to grab the appropriate response
		var root = (data.Body.SearchConvResponse && data.Body.SearchConvResponse.m) ||
				   (data.Body.SendMsgResponse && data.Body.SendMsgResponse.m),
			total = root.length,
			success = true,
			message,
			recordCount = 0,
			records = [],
			nowMs = Ext.Date.now(),
			i, j, len, node, data, participant;

		if (root && total) {
			for (i = 0; i < total; i++) {
				node = root[i];
				data = {};
//				data.fragment = node.fr;
//				data.content = (node.mp && node.mp[0] && node.mp[0].content) || node.fr;
				data.content = node.fr;
				data.convId = node.cid;
				data.subject = node.su;
				me.parseFlags(node, data);

				me.convertAddresses(node.e, data);

				data.dateStr = this.getDateString(node, nowMs);

				if (node.mp) {
					var ctxt = {
						attachments:    [],
						bodyParts:      [],
						contentTypes:   {}
					}
					data.topPart = ZCS.model.mail.ZtMimePart.fromJson(node.mp[0], ctxt);
				}

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
