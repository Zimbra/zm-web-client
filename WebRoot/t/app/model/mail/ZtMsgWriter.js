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
 * Generates the proper JSON for a message-related request.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.mail.ZtMsgWriter', {

	extend: 'ZCS.model.mail.ZtMailWriter',

	alias: 'writer.msgwriter',

	writeRecords: function(request, data) {

		var operation = request.getOperation(),
			options = operation.getInitialConfig(),
			itemData = Ext.merge(data[0] || {}, options),
			convId = itemData.convId,
			action = request.getAction(),
			json, methodJson = {};

		if (action === 'read' && convId) {

			// 'read' operation with convId means we are loading a conv
			json = this.getSoapEnvelope(request, data, 'SearchConv', {
				addHeaders: true,
				isSearch: true
			});
			methodJson = json.Body.SearchConvRequest;

			var curFolder = ZCS.session.getCurrentSearchOrganizer(),
				curFolderId = curFolder && curFolder.get('zcsId'),
				fetch = (curFolderId === ZCS.constant.ID_DRAFTS) ? 'all' : 'u!';

			Ext.apply(methodJson, {
				cid:    convId,
				fetch:  fetch,
				sortBy: ZCS.constant.DATE_DESC,
				offset: 0,
				limit:  100,
				recip:  '2',
				read:   '1',
				max:    itemData.noMax ? 0 : ZCS.constant.MAX_MESSAGE_SIZE * 1000,
				query:  itemData.convQuery
			});
		}
		else if ((action === 'create' && !itemData.apptView) || itemData.isDraft) {

			// 'create' operation means we are sending a msg
			var	msg = request.getRecords()[0],
				method = itemData.isDraft ? 'SaveDraft' : itemData.isInviteReply ? 'SendInviteReply' : 'SendMsg';

			json = this.getSoapEnvelope(request, data, method);
			methodJson = json.Body[method + 'Request'];

			var m = methodJson.m = {},
				e = m.e = [],
				addrTypes = ZCS.constant.RECIP_TYPES.concat(ZCS.constant.FROM),
				ln = addrTypes.length,
				i, type, field,
				action = msg.getComposeAction(),
				origId = msg.get('origId'),
				irtMessageId = msg.get('irtMessageId'),
				identityId = ZCS.session.getAccountId(),
				parts = m.mp = [],                  // Note: should only ever be one top-level part
				mime = msg.getMime(),
				origAtt = msg.get('origAttachments'),
				attachments = msg.get('attachments'),
				draftId = msg.get('draftId'),
				isSeries = itemData.isSeries,
				ridZ = itemData.ridZ,
				exceptId = {};

			// recipient addresses
			for (i = 0; i < ln; i++) {
				type = addrTypes[i];
				Ext.each(msg.getAddressesByType(addrTypes[i]), function(addr) {
					e.push({
						t: ZCS.constant.TO_SOAP_TYPE[type],
						a: addr.get('email'),
						p: addr.get('name')
					});
				}, this);
			}

			// reply type
			m.rt = msg.get('replyType');

			// subject
			m.su = {
				_content: msg.get('subject')
			};

			// ID or original if this is reply or forward
			if (origId) {
				m.origid = origId;
			}

			// In-Response-To (message ID of original, for threading)
			if (irtMessageId) {
				m.irt = {
					_content: irtMessageId
				}
			}

			// identity
			m.idnt = identityId;

			// attachments to forward from original message
			if (origAtt && origAtt.length > 0) {
				m.attach = {
					mp: origAtt
				};
			}

			if (attachments && attachments.length > 0) {
				if (!m.attach) {
					m.attach = {
						aid: ""
					};
				} else {
					m.attach.aid = "";
				}

				Ext.each(attachments, function (attachment) {
					m.attach.aid += attachment.aid + ",";
				});

				m.attach.aid = m.attach.aid.slice(0, -1);

			}

			if (itemData.isInviteReply) {

				if (isSeries) {
					Ext.apply(methodJson, {
						compNum:            0,
						id:                 origId,
						idnt:               identityId,
						updateOrganizer:    'TRUE',
						verb:               msg.get('inviteAction')
					});
				}
				else {
					exceptId.d = ridZ;
					Ext.apply(methodJson, {
						compNum:            0,
						exceptId:           exceptId,
						id:                 origId,
						idnt:               identityId,
						updateOrganizer:    'TRUE',
						verb:               msg.get('inviteAction')
					});
				}
			}

			if (draftId) {
				if (itemData.isDraft) {
					m.id = draftId;
				}
				else {
					m.did = draftId;
				}
			}

			this.addMimePart(parts, mime);
		}
		else if (action === 'update' || itemData.apptView) {
			// 'update' operation means we are performing a MsgActionRequest or GetMsgRequest

			if (itemData.op === 'load') {
				// fetch the full content of the message
				request.setUrl(ZCS.constant.SERVICE_URL_BASE + 'GetMsgRequest');
				json = this.getSoapEnvelope(request, data, 'GetMsg', {
					addHeaders: true
				});
				methodJson = json.Body.GetMsgRequest;
				Ext.apply(methodJson, {
					m: {
						id:         itemData.id,
						read:       '1',
						html:       '1',
						needExp:    '1',
                        ridZ:       itemData.apptView ? itemData.ridZ : '',
						max:        itemData.noMax ? 0 : ZCS.constant.MAX_MESSAGE_SIZE * 1000,
						header:     ZCS.constant.ADDITIONAL_MAIL_HEADERS
					}
				});
			}
			else if (itemData.op === 'delete' && itemData.isApptRequest) {
				var isHardDelete = itemData.hardDelete;

				// TODO: Cancel appointment without notifying organizer
				request.setUrl(ZCS.constant.SERVICE_URL_BASE + (isHardDelete ? 'ItemActionRequest' : 'CancelAppointmentRequest'));
				json = this.getSoapEnvelope(request, data, isHardDelete ? 'ItemAction' : 'CancelAppointment');
				methodJson = isHardDelete ? json.Body.ItemActionRequest : json.Body.CancelAppointmentRequest;

				Ext.apply(methodJson, itemData.cancelReqObject);
			}
			else {
				json = this.getActionRequest(request, itemData, 'MsgAction');
			}
		}

		request.setJsonData(json);

		return request;
	},

	/**
	 * Adds the given part to the list of part nodes, then handles the part's children.
	 *
	 * @param {array}       parts       array of JSON part nodes
	 * @param {ZtMimePart}  part        part to add
	 */
	addMimePart: function(parts, part) {

  		var node;

  		//If this is an attachment in a related part, we need a different format.
  		if (part.get('contentDisposition') === ZCS.constant.OBJ_ATTACHMENT) {
  			node = {
  				ci: part.get('contentId').replace('<', '').replace('>', ''),
  				attach: {
  					mp: [{
  						"mid": part.data.mid,
  						"part": part.get('part')
  					}]
  				}
  			}
  		} else {
			node = {
			   ct: part.get('contentType')
			};
		}

		parts.push(node);

		var content = part.getContent();
		if (content) {
			node.content = {
				_content: content
			}
		}

		var children = part.get('children'),
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
