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
 * This class generates the JSON for conversation-related SOAP requests.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.mail.ZtConvWriter', {

	extend: 'ZCS.model.mail.ZtMailWriter',

	alias: 'writer.convwriter',

	writeRecords: function(request, data) {

		var json = this.getSoapEnvelope(),
			action = request.getAction();

		if (action === 'read') {
			// 'read' operation means we're doing a search
			json.Body.SearchRequest = {
				_jsns: 'urn:zimbraMail',
				sortBy: 'dateDesc',
				header: [
					{ n: 'List-ID' },
					{ n: 'X-Zimbra-DL' },
					{ n: 'IN-REPLY-TO' }
				],
				tz: {
					id: 'America/Los_Angeles'
				},
				locale: {
					'_content': 'en_US'
				},
				offset: 0,
				limit: 20,
				query: request.getOperation().config.query,
				types: 'conversation',
				fetch: 1,
				html: 1,
				needExp: 1
			};
		}
		else if (action === 'update') {
			// 'update' operation means we're performing a ConvActionRequest
			this.setActionRequest(json.Body, data[0], false);
		}

		request.setJsonData(json);
		return request;
	}
});
