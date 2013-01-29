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

	extend: 'Ext.dataview.List',

	requires: [
		'ZCS.view.mail.ZtMsgView'
	],

	xtype: ZCS.constant.APP_MAIL + 'itemview',

	config: {
		useComponents: true,
		defaultType: 'msgview',
		disableSelection: true,
		scrollable: {
			direction: 'vertical'
		},
		store: 'ZtMsgStore',
		itemCls: 'zcs-msgview'
	},

	initialize: function() {

		this.callParent(arguments);

		// Add a delegate here so we can catch a tap on a msg header.
		// Note: Adding this listener via config does not work.
		this.on({
			tap: function(e) {
				Ext.Logger.verbose('TAP via delegate');
				var msgHeader = this.down('#' + e.delegatedTarget.id);
				if (msgHeader) {
					msgHeader.fireEvent('toggleView', msgHeader);
				}
			},
			element: 'element',
			delegate: '.zcs-msg-header',
			scope: this
		});
	}
});
