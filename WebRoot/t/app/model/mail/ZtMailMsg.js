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

			// internal (via parsing)
			{ name: 'from', type: 'string' },
			{ name: 'to', type: 'string' },
			{ name: 'cc', type: 'string' },
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
		return this.getContentTypes()[contentType];
	},

	/**
	 * Returns the list of body parts.
	 *
	 * @param	{string}	contentType		preferred MIME type of alternative parts (optional)
	 */
	getBodyPartsByType: function(contentType) {

		var bodyParts = this.getBodyParts();

		// no multi/alt, so we have a plain list
		if (!this.hasContentType(ZmMimeTable.MULTI_ALT)) {
			return bodyParts;
		}

		// grab the preferred type out of multi/alt parts
		var parts = [];
		Ext.each(bodyParts, function(part) {
			if (ZCS.util.getClassName(part) === 'ZtMimePart') {
				parts.push(part);
			}
			else if (part) {
				// part is a hash of alternative parts by content type
				var altPart = contentType && part[contentType];
				parts.push(altPart || AjxUtil.values(part)[0]);
			}
		}, this);

		return parts;
	},

	handleModifyNotification: function(mod) {

		this.callParent(arguments);

		// conv ID changes when a conv gets promoted from virtual (negative ID) to real
		if (mod.cid) {
			this.set('convId', mod.cid);
		}
	}
});
