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
			{ name: 'folderId', type: 'string' },
			{ name: 'convId', type: 'string' },
			{ name: 'subject', type: 'string' },
			{ name: 'date', type: 'int' },
			{ name: 'sentDate', type: 'int' },

			// internal (via parsing), or for composed msgs
			{ name: 'content', type: 'string' },
			{ name: 'from', type: 'string' },
			{ name: 'to', type: 'auto' },
			{ name: 'cc', type: 'auto' },
			{ name: 'bcc', type: 'auto' },
			{ name: 'topPart', type: 'auto' },
			{ name: 'attachments', type: 'auto' },
			{ name: 'bodyParts', type: 'auto' },
			{ name: 'contentTypes', type: 'auto' },
			{ name: 'isLoaded', type: 'boolean' },
			{ name: 'isLast', type: 'boolean' }
		],

		proxy: {
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
		composeAction: '',      // compose, reply, reply all, or forward
		origId: null            // ID or original if replying or forwarding
	},

	statics: {

		imgFixRegex: new RegExp("(<img\\s+.*dfsrc\\s*=\\s*)[\"']http[^'\"]+part=([\\d\\.]+)[\"']([^>]*>)", 'gi'),

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
				disp = part.getContentDisposition(),
				type = part.getContentType(),
				fileName = part.getFileName();

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
	 */
	getContentAsHtml: function() {

		var bodyParts = this.get('bodyParts'),
			ln = bodyParts ? bodyParts.length : 0, i,
			html = [];

		for (i = 0; i < ln; i++) {
			var part = bodyParts[i],
				content = part.getContent(),
				contentType = part.getContentType(),
				disposition = part.getContentDisposition();

			if (ZCS.mime.isRenderableImage(contentType)) {
				if (disposition !== 'inline') {
					var src = content || ZCS.util.html.buildUrl({
						path: ZCS.constant.PATH_MSG_FETCH,
						qsArgs: {
							auth: 'co',
							id: this.getId(),
							part: part.part
						}
					});
					html.push("<img zmforced='1' class='InlineImage' src='" + src + "'>");
				}
			}
			else if (contentType === ZCS.mime.TEXT_PLAIN) {
				html.push('<div>' + ZCS.util.mail.textToHtml(content) + '</div>');
			}
			else if (contentType === ZCS.mime.TEXT_HTML) {
				// TODO: handle invite
				content = this.fixInlineImages(content);
				content = ZCS.util.html.fixSmileys(content);
				html.push(content);
			}
			else if (contentType === ZCS.mime.TEXT_CAL) {
				html.push(ZCS.model.mail.ZtMailMsg.extractCalendarText(content));
			}
			else {
				html.push(ZCS.util.mail.textToHtml(content));
			}
		}

		return html.join('');
	},

	// fix broken inline images - take one like this: <img dfsrc="http:...part=1.2.2">
	// and make it look like this: <img dfsrc="cid:DWT123"> by looking up the cid for that part
	fixInlineImages: function(content) {

		var attachments = this.get('attachments'),
			regex = ZCS.model.mail.ZtMailMsg.imgFixRegex,
			partToCid = {};

		if (attachments && regex.test(content)) {
			Ext.each(attachments, function(att) {
				var contentId = att.getContentId(),
					part = att.getPart();
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
			textPart, htmlPart;

		if (isHtml) {
			top.setContentType(ZCS.mime.MULTI_ALT);
			textPart = new ZCS.model.mail.ZtMimePart();
			textPart.setContentType(ZCS.mime.TEXT_PLAIN);
			textPart.setContent(ZCS.util.mail.htmlToText(content, ZCS.session.getSetting(ZCS.constant.SETTING_REPLY_PREFIX)));
			top.add(textPart);
			htmlPart = new ZCS.model.mail.ZtMimePart();
			htmlPart.setContentType(ZCS.mime.TEXT_HTML);
			htmlPart.setContent(content);
			top.add(htmlPart);
		}
		else {
			top.setContentType(ZCS.mime.TEXT_PLAIN);
			top.setContent(content);
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
		value = ZCS.util.mail.textToHtml(value);

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
				contentType = part.getContentType(),
				disposition = part.getContentDisposition(),
				fileName = part.getFileName();

			if (ZCS.mime.isRenderableImage(contentType)) {
				result.push([crlf, '[', contentType, ':', (fileName || '...'), ']', crlf].join(''));
			}
			else if (fileName && disposition === 'inline') {
				var attInfo = ZCS.mime.table[contentType],
					desc = attInfo ? attInfo.desc : contentType;
				result.push([crlf, '[', attInfo, ':', (fileName || '...'), ']', crlf].join(''));
			}
			else if (contentType === ZCS.mime.TEXT_PLAIN || (part.getIsBody() && ZCS.mime.isTextType(contentType))) {
				result.push(content);
			}
			else if (contentType === ZCS.mime.TEXT_HTML) {
				result.push(content);
			}
		}

		return result.join('').replace(/<\/?(html|head|body)[^>]*>/gi, '');
	}
});
