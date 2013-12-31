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

		data.zcsId = node.id;
		data.type = ZCS.constant.ITEM_CONVERSATION;
		data.subject = ZCS.mailutil.stripSubjectPrefixes(node.su);
		data.numMsgs = node.n;
		data.fragment = node.fr;
		this.parseFlags(node, data);

		// process addresses, and create a string showing the senders
		data.addresses = ZCS.model.mail.ZtMailItem.convertAddressJsonToModel(node.e);
		data.senders = ZCS.mailutil.getSenders(data.addresses);
		data.dateStr = ZCS.util.getRelativeDateString(node.d, nowMs);

		// search results will tell us ID and folder for each msg in the conv
		if (node.m && node.m.length > 0) {
			var reader = ZCS.model.mail.ZtMailMsg.getProxy().getReader();
			data.msgs = [];
			Ext.each(node.m, function(msgData) {
				data.msgs.push(new ZCS.model.mail.ZtMailMsg(reader.getDataFromNode(msgData), msgData.id));
			});
		}

		return data;
	}
});
