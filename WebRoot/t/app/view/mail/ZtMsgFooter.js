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
 * This class displays a toolbar of actions at the bottom of a message.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.view.mail.ZtMsgFooter', {

	extend: 'Ext.Toolbar',

	xtype: 'msgfooter',

	config: {
		msg: null,
		docked: 'bottom',
		overlay: true,
		cls: 'zcs-msg-footer',
		items: [
			{
				xtype: 'spacer'
			},
			{
				xtype: 'button',
				iconCls: 'reply',
				iconMask: true,
				handler: function(a, b, c) {
					this.up('msgfooter').fireEvent('reply', this.up('msgview').getMsg());
				}
			},
			{
				xtype: 'button',
				iconCls: 'replytoall',
				iconMask: true,
				handler: function() {
					this.up('msgfooter').fireEvent('replyAll', this.up('msgview').getMsg());
				}
			},
			{
				xtype: 'button',
				iconCls: 'trash',
				iconMask: true,
				handler: function() {
					this.up('msgfooter').fireEvent('delete', this.up('msgview').getMsg());
				}
			},
			{
				xtype: 'button',
				iconCls: 'arrow_down',
				iconMask: true,
				handler: function() {
					this.up('msgfooter').fireEvent('showMenu', this, this.up('msgview').getMsg());
				}
			}
		]
	}
});
