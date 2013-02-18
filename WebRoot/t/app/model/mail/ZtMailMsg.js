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

			if (disp === "inline" && fileName && ZCS.mime.IS_RENDERABLE_IMAGE[type]) {
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
	}
});
