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

			var m = methodJson.m = {},
				e = m.e = [],
				ln = ZCS.constant.RECIP_TYPES.length,
				i, type, field,
				action = msg.getComposeAction(),
				origId = msg.getOrigId(),
				parts = m.mp = [],                  // Note: should only ever be one top-level part
				mime = msg.getMime();

			// from address
			e.push({
				t: ZCS.constant.TO_SOAP_TYPE[ZCS.constant.FROM],
				a: msg.get('from')
				// TODO: add name part
			});

			// recipient addresses
			for (i = 0; i < ln; i++) {
				type = ZCS.constant.RECIP_TYPES[i];
				field = type.toLowerCase();
				Ext.each(msg.get(field), function(addr) {
					e.push({
						t: ZCS.constant.TO_SOAP_TYPE[type],
						a: addr.get('email'),
						p: addr.get('name')
					});
				}, this);
			}

			// reply type
			if (action === ZCS.constant.OP_REPLY || action === ZCS.constant.OP_REPLY_ALL) {
				m.rt = 'r';
			}
			else if (action === ZCS.constant.OP_FORWARD) {
				m.rt = 'w';
			}

			// subject
			m.su = {
				_content: msg.get('subject')
			};

			// ID or original if this is reply or forward
			if (origId) {
				m.origId = origId;
			}

			// TODO: irtMessageId (from Message-ID header)

			this.addMimePart(parts, mime);
		}
		else if (action === 'update') {
			// 'update' operation means we are performing a MsgActionRequest or GetMsgRequest

			var msg = data[0];
			if (msg.op === 'load') {
				// fetch the full content of the message
				request.setUrl(ZCS.constant.SERVICE_URL_BASE + 'GetMsgRequest');
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

		// TODO: does Sencha have pretty-print for objects? There's always the Network tab
		// TODO: in the debugger, but that's not available when at a breakpoint
		Ext.Logger.info('--- ' + request.soapMethod);

		return request;
	},

	/**
	 * Adds the given part to the list of part nodes, then handles the part's children.
	 *
	 * @param {array}       parts       array of JSON part nodes
	 * @param {ZtMimePart}  part        part to add
	 */
	addMimePart: function(parts, part) {

		var node = {
		   ct: part.getContentType()
		};
		parts.push(node);

		var content = part.getContent();
		if (content) {
			node.content = {
				_content: content
			}
		}

		var children = part.getChildren(),
			ln = children ? children.length : 0,
			i, child, mp;

		if (ln) {
			var subParts = node.mp = [];
			for (i = 0; i < ln; i++) {
				child = children[i];
				this.addMimePart(subParts, child);
			}
		}
	}
});
