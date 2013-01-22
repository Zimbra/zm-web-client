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
 * This class is a List that shows the messages within a conversation.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.view.mail.ZtMsgListView', {

//	extend: 'Ext.Container',
//	extend: 'Ext.Panel',
	extend: 'Ext.dataview.List',

	requires: [
		'ZCS.view.mail.ZtMsgView'
	],

	xtype: ZCS.constant.APP_MAIL + 'itemview',

//	layout: 'fit',

	config: {
		useComponents: true,
		defaultType: 'msgview',
		scrollable: {
			direction: 'vertical'
		},
		store: 'ZtMsgStore',
		msgList: null
	},

	updateMsgList: function(msgs) {
//		this.removeAll();
//		this.setHtml("Holy crap, " + msgs.length + " messages!");
		this.add({
			html: "Holy shit, " + msgs.length + " messages!"
		});
		return;
		Ext.each(msgs, function(msg) {
			var msgView = new ZCS.view.mail.ZtMsgView();
			msgView.setMsg(msg);
			this.add(msgView);
		}, this);
	}
});
