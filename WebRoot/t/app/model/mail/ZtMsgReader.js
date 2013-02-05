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
 * This class translates JSON for a message into a ZtMailMsg.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.mail.ZtMsgReader', {

	extend: 'ZCS.model.mail.ZtMailReader',

	requires: [
		'ZCS.model.mail.ZtMimePart'
	],

	alias: 'reader.msgreader',

	getDataFromNode: function(node) {

		var data = {},
			nowMs = Ext.Date.now(),
			ctxt;

		data.itemId = node.id;
		data.type = ZCS.constant.ITEM_MESSAGE;
		data.fragment = node.fr;
		data.content = node.fr;
		data.convId = node.cid;
		data.subject = node.su;
		this.parseFlags(node, data);

		this.convertAddresses(node.e, data);

		data.dateStr = this.getDateString(node.d, nowMs);

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

		return data;
	}
});
