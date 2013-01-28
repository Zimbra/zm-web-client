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

	extend: 'Ext.Component',

	requires: [
		'ZCS.common.mail.ZtQuotedContent'
	],

	xtype: 'msgbody',

	config: {
		padding: 5,
		tpl: Ext.create('Ext.XTemplate', ZCS.template.MsgBody)
	},

	render: function(msg) {

		var bodyParts = msg.get('bodyParts'),
			html = '';

		Ext.each(bodyParts, function(part) {
			html += ZCS.quoted.getOriginalContent(part.getContent(), part.getContentType() === ZCS.mime.TEXT_HTML);
		}, this);

		this.setHtml(html);
	}
});
