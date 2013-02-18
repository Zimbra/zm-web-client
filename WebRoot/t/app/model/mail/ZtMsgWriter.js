/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra, Inc.
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ('License'); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an 'AS IS'
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
			action = request.getAction(),
			json, methodJson = {};

		if (action === 'read' && convId) {

			// 'read' operation with convId means we are expanding a conv
			json = this.getSoapEnvelope(request, data, 'SearchConv', {
				addHeaders: true,
				isSearch: true
			});
			methodJson = json.Body.SearchConvRequest;

			Ext.apply(methodJson, {
				cid: convId,
				fetch: 'u1',
				sortBy: 'dateDesc',
				offset: 0,
				limit: 100,
				recip: '2',
				query: 'underid:1 AND NOT underid:3 AND NOT underid:4'
			});
		}
		else if (action === 'create') {

			// 'create' operation means we are sending a msg
			json = this.getSoapEnvelope(request, data, 'SendMsg');

			var	msg = request.getRecords()[0];

			methodJson = json.Body.SendMsgRequest;

			Ext.apply(methodJson, {
				m: {
					e: [
						{
							t: 'f',
							a: msg.get('from')
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
			});

			//Add the to, cc, bcc.  Note, we're assuming these are ZtEmailAddress objects at this point.
			Ext.each(msg.get('to'), function (to) {
				methodJson.m.e.push({
					t: 't',
					a: to.get('email'),
					p: to.get('name')
				});
			});

			Ext.each(msg.get('cc'), function (cc) {
				methodJson.m.e.push({
					t: 'c',
					a: cc.get('email'),
					p: cc.get('name')
				});
			});

			Ext.each(msg.get('bcc'), function (bcc) {
				methodJson.m.e.push({
					t: 'b',
					a: bcc.get('email'),
					p: bcc.get('name')
				});
			});

		}
		else if (action === 'update') {
			// 'update' operation means we are performing a MsgActionRequest or GetMsgRequest

			var msg = data[0];
			if (msg.op === 'load') {
				// fetch the full content of the message
				json = this.getSoapEnvelope(request, data, 'GetMsg', {
					addHeaders: true
				});
				methodJson = json.Body.GetMsgRequest;
				Ext.apply(methodJson, {
					m: {
						id: msg.id,
						read: 1,
						html: 1,
						needExp: 1,
						header: ZCS.constant.ADDITIONAL_MAIL_HEADERS
					},
				});
			}
			else {
				json = this.getActionRequest(request, data, 'MsgAction');
			}
		}

		request.setJsonData(json);

		// TODO: does Sencha have pretty-print for objects?
//		Ext.Logger.info(request);

		return request;
	}
});
