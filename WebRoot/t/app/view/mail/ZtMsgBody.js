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
 * This class displays the content of a mail message.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.view.mail.ZtMsgBody', {

	extend: 'Ext.Container',

	requires: [
		'ZCS.common.mail.ZtQuotedContent',
		'ZCS.view.ux.ZtIframe'
	],

	xtype: 'msgbody',

	config: {
		padding: 5,
		tpl: Ext.create('Ext.XTemplate', ZCS.template.MsgBody)
	},

	statics: {

		imgFixRegex: new RegExp("(<img\\s+.*dfsrc\\s*=\\s*)[\"']http[^'\"]+part=([\\d\\.]+)[\"']([^>]*>)", 'gi'),

		// fix broken inline images - take one like this: <img dfsrc="http:...part=1.2.2">
		// and make it look like this: <img dfsrc="cid:DWT123"> by looking up the cid for that part
		fixInlineImages: function(msg, content) {

			var attachments = msg.get('attachments'),
				regex = ZCS.view.mail.ZtMsgBody.imgFixRegex,
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
	 * Renders the given msg.
	 *
	 * @param {ZtMailMsg}   msg     a mail message
	 * @param {boolean}     isLast  true if this is the last msg in the conv to be rendered,
	 *                              in which case its quoted text will not be trimmed
	 *
	 * @adapts ZmMailMsgView._renderMessageBody1
	 */
	render: function(msg, isLast) {

		Ext.Logger.info('ZtMsgBody render into element ' + this.element.id);

		var html = this.getHtmlFromBodyParts(msg, isLast),
			iframe = this.iframe;

		html = this.fixSmileys(html);
		// TODO: images and info bar
		// TODO: invites
		// TODO: truncation

		if (iframe) {
			iframe.getBody().innerHTML = '';
//			iframe.getBody().height = 150;
		}
		if (true || msg.hasHtmlPart()) {
			if (!iframe) {
				iframe = this.iframe = new ZCS.view.ux.ZtIframe({
					name: 'ZCSIframe-' + msg.getId()
				});
				this.add(iframe);
			}
//			this.setHtml('');
			iframe.setContent(html);
//			iframe.show();
		}
		else {
			if (iframe) {
				iframe.hide();
			}
			this.setHtml(html);
		}
	},

	/**
	 * Converts each body part to HTML and returns the accumulated content.
	 *
	 * @private
	 */
	getHtmlFromBodyParts: function(msg, isLast) {

		var bodyParts = msg.get('bodyParts'),
			html = [];

		Ext.each(bodyParts, function(part) {

			var content = part.getContent(),
				contentType = part.getContentType(),
				disposition = part.getContentDisposition(),
				trimQuotedContent = !isLast;

			if (ZCS.mime.IS_RENDERABLE_IMAGE[contentType]) {
				if (disposition !== 'inline') {
					var src = content || ZCS.util.buildUrl({
						path: ZCS.constant.PATH_MSG_FETCH,
						qsArgs: {
							auth: 'co',
							id: msg.id,
							part: part.part
						}
					});
					html.push("<img zmforced='1' class='InlineImage' src='" + src + "'>");
				}
			}
			else if (contentType === ZCS.mime.TEXT_PLAIN) {
				content = ZCS.util.convertToHtml(content);
				if (trimQuotedContent) {
					content = ZCS.quoted.getOriginalContent(content, false);
					trimQuotedContent = false;
				}
				html.push(content);
			}
			else if (contentType === ZCS.mime.TEXT_HTML) {
				// TODO: handle invite
				if (trimQuotedContent) {
					content = ZCS.quoted.getOriginalContent(content, false);
					trimQuotedContent = false;
				}
				content = ZCS.view.mail.ZtMsgBody.fixInlineImages(msg, content);
				html.push(content);
			}
			else if (contentType === ZCS.mime.TEXT_CAL) {
				html.push(ZCS.view.mail.ZtMsgBody.extractCalendarText(content));
			}
			else {
				html.push(ZCS.util.convertToHtml(content));
			}
		}, this);

		return html.join('');
	},

	/**
	 * Replaces Microsoft-specific emoticons (Wingdings) with their Unicode equivalents.
	 * When that doesn't happen, you see a bare J hanging out.
	 *
	 * @private
	 */
	fixSmileys: function(html) {
		return html.replace(/<span style=["']font-family:Wingdings["']>J<\/span>/gi, '\u263a')  // :)
				   .replace(/<span style=["']font-family:Wingdings["']>L<\/span>/gi, '\u2639'); // :(
	}
});
