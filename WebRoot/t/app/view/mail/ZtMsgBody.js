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

		Ext.Logger.conv('ZtMsgBody render into element ' + this.element.id);

		var html = msg.getContentAsHtml(),
			iframe = this.iframe;

		if (!isLast) {
			html = ZCS.quoted.getOriginalContent(html, false);
		}

		// TODO: images and info bar
		// TODO: invites
		// TODO: truncation

		if (msg.hasHtmlPart()) {
			Ext.Logger.conv('Use IFRAME for [' + msg.get('fragment') + ']');
			if (!iframe) {
				iframe = this.iframe = new ZCS.view.ux.ZtIframe({
					// TODO: components are reused, should name iframe after msgview index
					name: 'ZCSIframe-' + msg.getId()
				});
				this.add(iframe);
			}
			this.setHtml('');
			iframe.setContent(html);
			iframe.show();
		}
		else {
			Ext.Logger.conv('No IFRAME for [' + msg.get('fragment') + ']');
			if (iframe) {
				iframe.hide();
			}
			this.setHtml(html);
		}
	}
});
