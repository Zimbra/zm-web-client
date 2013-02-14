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
		variableHeights: true,
		scrollable: {
			direction: 'vertical'
		},
		store: 'ZtMsgStore',
		itemCls: 'zcs-msgview',

		//Sets the default list item height, which corresponds to collapsed message height
		itemHeight: 70
	},

	initialize: function() {

		this.callParent(arguments);

		this.preventTap = false;

		// Add a delegate here so we can catch a tap on a msg header.
		// Note: Adding this listener via config does not work.
		this.on({
			tap: function(e) {
				Ext.Logger.verbose('TAP via delegate');
				var msgHeader = this.down('#' + e.delegatedTarget.id);
				if (msgHeader && !this.preventTap) {
					msgHeader.fireEvent('toggleView', msgHeader);
				}

				if (this.preventTap) {
					this.preventTap = false;
				}
			},
			element: 'element',
			delegate: '.zcs-msg-header',
			scope: this
		});

		this.on({
			taphold: function(e, node) {
				//This will not prevent tap events by itself, so we have to manually prevent taps for a period of time to prevent collapse
				//when holding on an address.

				var elm = Ext.fly(e.target),
					msgHeader = this.down('#' + e.delegatedTarget.id),
					msg = msgHeader.getMsg();

				if (elm.hasCls('vm-area-bubble')) {

					this.preventTap = true;
					msgHeader.fireEvent('bubbleHold', elm, msg, Ext.String.htmlDecode(elm.getAttribute('address')));
				}
			},
			element: 'element',
			delegate: '.zcs-msg-header',
			scope: this
		});
	}
});
