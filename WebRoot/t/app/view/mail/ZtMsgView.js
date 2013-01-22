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
 * This class displays a mail message using three components: a header, a body, and a footer.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.view.mail.ZtMsgView', {

//	extend: 'Ext.Container',
//	extend: 'Ext.Panel',
	extend: 'Ext.dataview.component.ListItem',

	requires: [
		'ZCS.view.mail.ZtMsgHeader',
		'ZCS.view.mail.ZtMsgBody',
		'ZCS.view.mail.ZtMsgFooter'
	],

	xtype: 'msgview',

	config: {
//		layout: 'fit',
		msg: null,
//		html: 'Hello',
		items: [
			{
//				html: 'Howdy'
				xtype: 'msgheader'
			},
			{
				xtype: 'msgbody'
			},
			{
				xtype: 'msgfooter'
			}
		],
		listeners: {
			updatedata: function(msgView, msgData) {
				if (msgData) {
					console.log('updatedata for msg ' + msgData.id);
					var msg = this.up(ZCS.constant.APP_MAIL + 'itemview').getStore().getById(msgData.id);
					if (msg) {
//						msgView.displayMsg(msg);
						this.setMsg(msg);
						var msgHeader = msgView.down('msgheader');
						msgHeader.setContent(msg);
						var msgBody = msgView.down('msgbody');
						msgBody.setContent(msg);
					}
				}
			}
		}
	},

	displayMsg: function(msg) {

//		var msg = this.getMsg();
//		if (!msg) {
//			return;
//		}

		var msgHeader = {
//			xtype: 'msgheader',
			xtype: 'component',
			html: 'Header',
			msg: msg
		};
//		var msgHeader = Ext.create('ZCS.view.mail.ZtMsgHeader', {msg:msg});

		var msgBody = {
//			xtype: 'msgbody',
			xtype: 'component',
			html: 'Body',
			msg: msg
		};

		var msgFooter = {
//			xtype: 'msgfooter',
			xtype: 'component',
			html: 'Footer',
			msg: msg
		};

		this.add([
			msgHeader,
			msgBody,
			msgFooter
		]);
	}
});

