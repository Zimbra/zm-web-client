/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2012, 2013 VMware, Inc.
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
 * This class represents a mail message.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
var urlBase = ZCS.constant.SERVICE_URL_BASE;

Ext.define('ZCS.model.mail.ZtMailMsg', {

	extend: 'ZCS.model.mail.ZtMailItem',

	requires: [
		'ZCS.model.mail.ZtMsgReader',
		'ZCS.model.mail.ZtMsgWriter'
	],

	config: {

		fields: [
			// directly from server
			{ name: 'folderId',     type: 'string' },
			{ name: 'convId',       type: 'string' },
			{ name: 'subject',      type: 'string' },
			{ name: 'date',         type: 'int' },
			{ name: 'sentDate',     type: 'int' },
			{ name: 'messageId',    type: 'string' },
			{ name: 'irtMessageId', type: 'string' },
			{ name: 'replyType',    type: 'string' },
			{ name: 'fullDateStr',  type: 'string' },

			// internal (via parsing), or for composed msgs
			{ name: 'attachments',      type: 'auto' },
			{ name: 'bodyParts',        type: 'auto' },     // MIME parts the server tells us to display
			{ name: 'contentTypes',     type: 'auto' },     // lookup hash of content types
			{ name: 'isLoaded',         type: 'boolean' },
			{ name: 'origId',           type: 'string' },   // ID of original if replying or forwarding
			{ name: 'invite',           type: 'auto' },     // ZtInvite if msg is an invite
			{ name: 'inviteAction',     type: 'string' },   // accept/tentative/decline
			{ name: 'origAttachments',  type: 'auto' },     // attachments to propagate on reply/forward
			{ name: 'draftId',          type: 'string' }    // ID of draft msg that should be deleted
		],

		proxy: {
			type: 'soapproxy',
			api: {
				create  : urlBase + 'SendMsgRequest',
				read    : urlBase + 'SearchConvRequest',
				update  : urlBase + 'MsgActionRequest',
				destroy : urlBase + 'MsgActionRequest'
			},
			reader: 'msgreader',
			writer: 'msgwriter'
		},

		mime: null,             // root MIME part (used when creating a msg for sending)
		composeAction: ''       // compose, reply, reply all, or forward
	},

	statics: {

		imgFixRegex: new RegExp("(<img\\s+.*dfsrc\\s*=\\s*)[\"']http[^'\"]+part=([\\d\\.]+)[\"']([^>]*>)", 'gi'),

		hasQuotedContent: {},

		/**
		 * Extracts and returns the text content out of a text/calendar part. It grabs text from
		 * the DESCRIPTION and COMMENT sections.
		 *
		 * @param	{string}	content 	content of a text/calendar MIME part
		 * @return	{string}	text content
		 */
		extractCalendarText: function(content) {

			var lines = content.split(/\r?\n/),
				desc = [],
				index = 0;

			function grabTextFromSection(name, lines, index, result) {
				while ((index < lines.length) && (lines[index].indexOf(name) !== 0)) {
					index++;
				}
				if (index < lines.length) {
					result.push(lines[index].substr(name.length));
					while ((index < lines.length) && /^\s+/.test(lines[index])) {
						result.push(lines[index++].replace(/^\s+/, ' '));
					}
				}
				return index;
			}

			index = grabTextFromSection('DESCRIPTION:', lines, index, desc);
			index = grabTextFromSection('COMMENT:', lines, index, desc);

			content = desc.join('');
			return content.replace(/\\t/g, '\t').replace(/\\n/g, '\n').replace(/\\(.)/g, '$1');
		}
	},

	/**
	 * Returns the preferred reply address for this message.
	 *
	 * @return {ZtEmailAddress}     reply address
	 */
	getReplyAddress: function() {
		return this.getAddressByType(ZCS.constant.REPLY_TO) ||
			   this.getAddressByType(ZCS.constant.FROM);
	},

	/**
	 * Returns true if this msg has loaded a part with the given content type.
	 *
	 * @param	{string}		contentType		MIME type
	 */
	hasContentType: function(contentType) {
		var types = this.get('contentTypes');
		return types && types[contentType];
	},

	/**
	 * Returns true if this message has an inline image
	 *
	 * @return {boolean}    true if this message has an inline image
	 */
	hasInlineImage: function() {

		var bodyParts = this.get('bodyParts'),
			ln = bodyParts ? bodyParts.length : 0,
			i;

		for (i = 0; i < ln; i++) {
			var part = bodyParts[i],
				disp = part.get('contentDisposition'),
				type = part.get('contentType'),
				fileName = part.get('fileName');

			if (disp === "inline" && fileName && ZCS.mime.isRenderableImage(type)) {
				return true;
			}
		}
		return false;
	},

	/**
	 * Returns true if this message has an HTML part (a part with a content-type
	 * of text/html, or an inline image).
	 *
	 * @return {boolean}    true if this message has an HTML part
	 */
	hasHtmlPart: function() {
		return this.hasContentType(ZCS.mime.TEXT_HTML) || this.hasInlineImage();
	},

	handleModifyNotification: function(mod) {

		this.callParent(arguments);

		// conv ID changes when a conv gets promoted from virtual (negative ID) to real
		if (mod.cid) {
			this.set('convId', mod.cid);
		}
	},

	/**
	 * Converts each body part to HTML and returns the accumulated content.
	 *
	 * @param {String}  msgBodyId           ID of owning ZtMsgBody
	 * @param {Boolean} trimQuotedContent   if true, trim quoted content
	 *
	 * @return {object}     content to have msg content as HTML
	 */
	getContentAsHtml: function(msgBodyId, trimQuotedContent) {
		if (this.get('isInvite') && this.get('invite')) {
			return this.get('invite').getContentAsHtml(msgBodyId);
		}

		var bodyParts = this.get('bodyParts'),
			ln = bodyParts ? bodyParts.length : 0, i,
			html = [],
            isOutDatedInv = this.get('isInvite') && (this.get('invite') === undefined);

		for (i = 0; i < ln; i++) {
			var bodyPart = bodyParts[i],
				content = bodyPart.getContent(),
				contentType = bodyPart.get('contentType'),
				disposition = bodyPart.get('contentDisposition');

            // Fix for bug: 83398. Adding invite not current message.
            if (isOutDatedInv) {
                html.push("<div class='zcs-invite-outdated'>" + ZtMsg.inviteNotCurrent + "</div>");
            }

			if (ZCS.mime.isRenderableImage(contentType)) {
				if (disposition !== 'inline') {
					var src = content || ZCS.htmlutil.buildUrl({
						path: ZCS.constant.PATH_MSG_FETCH,
						qsArgs: {
							auth: 'co',
							id: this.getId(),
							part: bodyPart.get('part')
						}
					});
					html.push("<img zmforced='1' class='InlineImage' src='" + src + "'>");
				}
			}
			else if (contentType === ZCS.mime.TEXT_PLAIN) {
				content = trimQuotedContent ? this.getOriginalContent(content, bodyPart) : content;
				html.push('<div>' + ZCS.mailutil.textToHtml(content) + '</div>');
			}
			else if (contentType === ZCS.mime.TEXT_HTML) {
				content = this.fixInlineImages(content);
				content = ZCS.htmlutil.fixSmileys(content);
				content = trimQuotedContent ? this.getOriginalContent(content, bodyPart) : content;
				html.push(content);
			}
			else if (contentType === ZCS.mime.TEXT_CAL) {
				html.push(ZCS.model.mail.ZtMailMsg.extractCalendarText(content));
			}
			else {
				html.push(ZCS.mailutil.textToHtml(content));
			}
		}

		return {content: html.join('')};
	},

	/**
	 * Returns the original content of this message, fetching it from the cache if this message
	 * has already been processed.
	 *
	 * @param {String}      content     content
	 * @param {ZtMimePart}  bodyPart    body part
	 * @return {String}     original content
	 */
	getOriginalContent: function(content, bodyPart) {

		var contentType = bodyPart.get('contentType'),
			id = this.getId(),
			cacheKey = [ id, bodyPart.get('part') ].join('|'),
			origContent = ZCS.cache.get(cacheKey);

		if (!origContent) {
			origContent = ZCS.quoted.getOriginalContent(content, contentType === ZCS.mime.TEXT_HTML);
			if (origContent.length !== content.length) {
				ZCS.cache.set(cacheKey, origContent);
				ZCS.model.mail.ZtMailMsg.hasQuotedContent[id] = true;
			}
		}

		return origContent;
	},

	/**
	 * Fix broken inline images - take one like this: <img dfsrc="http:...part=1.2.2">
	 * and make it look like this: <img dfsrc="cid:DWT123"> by looking up the cid for that part
	 *
	 * @param {String}  content     HTML content to fix
	 * @return {String}     HTML with images fixed
	 */
	fixInlineImages: function(content) {

		var attachments = this.get('attachments'),
			regex = ZCS.model.mail.ZtMailMsg.imgFixRegex,
			partToCid = {};

		if (attachments && regex.test(content)) {
			Ext.each(attachments, function(att) {
				var contentId = att.get('contentId'),
					part = att.get('part');
				if (contentId) {
					partToCid[att.part] = contentId.substring(1, contentId.length - 1);
				}
			}, this);

			content = content.replace(regex, function(s, p1, p2, p3) {
				return partToCid[p2] ? [p1, '"cid:', partToCid[p2], '"', p3].join('') : s;
			});
		}

		return content;
	},

	/**
	 * Creates the MIME structure for this message from the given content. If the content
	 * is HTML, the top part will be multipart/alternative. Otherwise, it's just text/plain.
	 *
	 * @param {string}      content     message text
	 * @param {boolean}     isHtml      true if content is HTML
	 */
	createMime: function(content, isHtml) {

		var top = new ZCS.model.mail.ZtMimePart(),
			prefix = ZCS.session.getSetting(ZCS.constant.SETTING_REPLY_PREFIX),
			textPart, htmlPart;

		if (isHtml) {
			top.set('contentType', ZCS.mime.MULTI_ALT);
			textPart = new ZCS.model.mail.ZtMimePart();
			textPart.set('contentType', ZCS.mime.TEXT_PLAIN);
			textPart.setContent(ZCS.mailutil.htmlToText(content, prefix));
			top.add(textPart);
			htmlPart = new ZCS.model.mail.ZtMimePart();
			htmlPart.set('contentType', ZCS.mime.TEXT_HTML);
			htmlPart.setContent(content);
			top.add(htmlPart);
		}
		else {
			top.set('contentType', ZCS.mime.TEXT_PLAIN);
			top.setContent(ZCS.mailutil.htmlToText(content, prefix));
		}

		this.setMime(top);
	},

	/**
	 * Returns a header string for the given header.
	 *
	 * @param	{string}	hdr			header type
	 * @return	{string}	header string
	 */
	getHeaderStr: function(header) {

		var key, value;

		if (header === ZCS.constant.HDR_DATE) {
			var date = new Date(this.get('sentDate') || this.get('date'));
			if (date) {
				value = Ext.Date.format(date, 'l, F j, Y h:i:s A');
			}
		}
		else if (header === ZCS.constant.HDR_SUBJECT) {
			value = this.get('subject');
		}
		else {
			var addrs = Ext.Array.map(this.getAddressesByType(header), function(addr) {
				return addr.getFullEmail();
			});
			value = addrs.join(', ');
		}

		if (!value) {
			return '';
		}

		key = ZCS.constant.HDR_KEY[header] + ' ';
		key = '<b>' + key + '</b>';
		value = ZCS.mailutil.textToHtml(value);

		return key + value;
	},

	/**
	 * Returns this message's content in a form that is suitable for use as the "original
	 * message" in a reply.
	 *
	 * @return {string}
	 * @adapts ZmComposeView._getBodyContent
	 */
	getContentForInclusion: function() {

		var bodyParts = this.get('bodyParts'),
			ln = bodyParts ? bodyParts.length : 0, i,
			crlf = '<br>',
			crlf2 = '<br><br>',
			result = [];

		for (i = 0; i < ln; i++) {
			var part = bodyParts[i],
				content = part.getContent(),
				contentType = part.get('contentType'),
				disposition = part.get('contentDisposition'),
				fileName = part.get('fileName');

			if (ZCS.mime.isRenderableImage(contentType)) {
				result.push([crlf, '[', contentType, ':', (fileName || '...'), ']', crlf].join(''));
			}
			else if (fileName && disposition === 'inline') {
				var attInfo = ZCS.mime.table[contentType],
					desc = attInfo ? attInfo.desc : contentType;
				result.push([crlf, '[', attInfo, ':', (fileName || '...'), ']', crlf].join(''));
			}
			else if (contentType === ZCS.mime.TEXT_PLAIN || (part.get('isBody') && ZCS.mime.isTextType(contentType))) {
				result.push(ZCS.mailutil.textToHtml(content, false));
			}
			else if (contentType === ZCS.mime.TEXT_HTML) {
				result.push(content);
			}
		}

		return result.join('').replace(/<\/?(html|head|body)[^>]*>/gi, '');
	},

	/**
	 * Looks for a part where the given field has the given value. If found, returns a URL that can be
	 * used to fetch that part from the server.
	 *
	 * @param {String}  field       body part field name
	 * @param {String}  value       value to look for
	 * @param {String}  foundProp   (optional) property to set to true in part if found
	 *
	 * @return {String}     URL for fetching body part
	 */
	getPartUrlByField: function(field, value, foundProp) {

		var bodyParts = this.get('bodyParts') || [],
			attachments = this.get('attachments') || [],
			allParts = bodyParts.concat(attachments),
			ln = allParts.length, i, part;

		for (i = 0; i < ln; i++) {
			part = allParts[i];
			if (part.get(field) === value) {
				if (foundProp) {
					part[foundProp] = true;
				}
				return this.getPartUrl(part.get('part'));
			}
		}

		return '';
	},

	/**
	 * Returns a URL for fetching the given part, adding locale, msg ID, and part number.
	 *
	 * @param {String}  part        part number
	 * @return {String}     URL to fetch part from server
	 * @private
	 */
	getPartUrl: function(part) {

		return ZCS.htmlutil.buildUrl({
			path: ZCS.constant.PATH_MSG_FETCH,
			qsArgs: {
				loc: ZCS.session.getSetting(ZCS.constant.SETTING_LOCALE),
				id: this.getId(),
				part: part
			}
		});
	},

	/**
	 * Returns true if the sender of this message is trusted.
	 *
	 * @return {Boolean}    true if the sender is trusted
	 */
	hasTrustedSender: function() {

		var	sender = this.getAddressByType(ZCS.constant.SENDER) || this.getAddressByType(ZCS.constant.FROM),
			email = sender.get('email') || '',
			addr = email.toLowerCase(),
			domain = addr.substr(addr.indexOf("@") + 1),
			trustedSenders = ZCS.session.getSetting(ZCS.constant.SETTING_TRUSTED_SENDERS),
			ln = trustedSenders ? trustedSenders.length : 0, i, trusted;

		for (i = 0; i < ln; i++) {
			trusted = trustedSenders[i].toLowerCase();
			if (addr === trusted || domain === trusted) {
				return true;
			}
		}
		return false;
	},

	/**
	 * Returns a list of attachments, plus any inline attachments that came as body parts.
	 *
	 * @return {Array}      list of attachments
	 */
	getAllAttachments: function() {
		var attachments = this.get('attachments') || [];
		return attachments.concat(this.getInlineAttachments());
	},

	/**
	 * Returns true if the message has attachments.
	 * @return {Boolean}    true if the message has attachments
	 */
	hasAttachments: function() {
		return this.getAllAttachments().length > 0;
	},

	/**
	 * Returns a list of objects, each of which has info about an attachment such as its name, size, etc.
	 *
	 * @return {Array}      list of attachment info objects
	 */
	getAttachmentInfo: function() {

		var attachments = this.getAllAttachments(),
			ln = attachments.length, i, attachment,
			attInfo = [];

		for (i = 0; i < ln; i++) {
			attachment = attachments[i];
			var type = attachment.get('contentType'),
				contentId = attachment.get('contentId'),
				contentLocation = attachment.get('contentLocation'),
				part = attachment.get('part'),
				isInlineImg = (ZCS.mime.getType(type) === ZCS.mime.IMG && contentId && attachment.foundInMsgBody),
				isInviteCalendar = (type === ZCS.mime.TEXT_CAL && this.get('isInvite'));

			if (!attachment.isIgnoredPart() && !isInlineImg && !isInviteCalendar) {
				var info = {},
					filename = attachment.get('name') || attachment.get('fileName') || Ext.String.format(ZtMsg.unknownAttType, type);

				info.label = ZCS.util.trimFileName(filename, 30);
				info.icon = ZCS.mime.getIconClass(type);
				info.size = ZCS.util.formatFileSize(attachment.get('size'));
				info.url = (!part || ZCS.constant.REGEX_URL.test(contentLocation)) ? contentLocation : this.getPartUrl(part);
				info.part = attachment.get('part');
				attInfo.push(info);
			}
		}
	
		return attInfo;
	},

	/**
	 * Returns a list of body parts that are inline attachments.
	 *
	 * @return {Array}      list of inline attachments
	 * @private
	 */
	getInlineAttachments: function() {

		var bodyParts = this.get('bodyParts') || [],
			ln = bodyParts.length, i, part,
			inlineAtts = [];

		for (i = 0; i < ln; i++) {
			part = bodyParts[i];
			if (part.fileName && part.contentDisposition === 'inline') {
				inlineAtts.push(part);
			}
		}

		return inlineAtts;
	},

	isTruncated: function() {
		var bodyParts = this.get('bodyParts'),
			ln = bodyParts ? bodyParts.length : 0, i;

		for (i = 0; i < ln; i++) {
			if (bodyParts[i].get('isTruncated')) {
				return true;
			}
		}
		return false;
	},

	getConv: function() {
		return ZCS.cache.get(this.get('convId'));
	}
},
	function (thisClass) {
		thisClass.inviteDescTpl = Ext.create('Ext.XTemplate', ZCS.template.InviteDesc);
		thisClass.inviteNotesTpl = Ext.create('Ext.XTemplate', ZCS.template.InviteNotes);
	}
);
