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
 * Generates the proper JSON for a message-related request.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.mail.ZtMsgWriter', {

	extend: 'ZCS.model.mail.ZtMailWriter',

	alias: 'writer.msgwriter',

	writeRecords: function(request, data) {

		var convId = request.getOperation().getInitialConfig().convId,
			json = this.getSoapEnvelope(request, data),
			action = request.getAction();

		if (action === 'read' && convId) {

			// 'read' operation with convId means we are expanding a conv
			json.Body.SearchConvRequest = {
				_jsns: "urn:zimbraMail",
				cid: convId,
				fetch: "u1",
				sortBy: "dateDesc",
				header: [
					{ n: "List-ID" },
					{ n: "X-Zimbra-DL" },
					{ n: "IN-REPLY-TO" }
				],
				tz: {
					id: "America/Los_Angeles"
				},
				locale: {
					"_content": "en_US"
				},
				offset: 0,
				limit: 100,
				query: "underid:1 AND NOT underid:3 AND NOT underid:4",
				read: 1,
				html: 1,
				needExp: 1
			};
		}
		else if (action === 'create') {

			// 'create' operation means we are sending a msg
			var msg = request.getRecords()[0];

			json.Body.SendMsgRequest = {
				_jsns: "urn:zimbraMail",
				m: {
					e: [
						{
							t: 'f',
							a: msg.get('from')
						},
						{
							t: 't',
							a: msg.get('to')
						}
					],
					su: {
						_content: msg.get('subject')
					},
					mp: [
						{
							content: {
								_content: msg.get('content')
							},
							ct: 'text/plain'
						}
					]
				}
			};
		}
		else if (action === 'update') {
			// 'update' operation means we are performing a MsgActionRequest or GetMsgRequest

			var msg = data[0];
			if (msg.op === 'load') {
				// fetch the full content of the message
				json.Body.GetMsgRequest = {
					_jsns: "urn:zimbraMail",
					m: {
						id: msg.id,
						read: 1,
						html: 1,
						needExp: 1,
						header: [
							{ n: "List-ID" },
							{ n: "X-Zimbra-DL" },
							{ n: "IN-REPLY-TO" }
						]
					},
				};
			}
			else {
				this.setActionRequest(json.Body, data[0], true);
			}
		}

		request.setJsonData(json);
		return request;
	}
});
