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
 * This class represents a compose form that can be used to compose, reply to, or forward a message. It has a toolbar
 * on top and the actual form below. The form has fields for entering addresses, a subject, and the body of the
 * message. The toolbar has button to cancel or send the message.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.view.mail.ZtComposeForm', {

	extend: 'Ext.Sheet',

	requires: [
		'Ext.form.Panel',
		'Ext.field.Email',
		'Ext.field.Text',
		'Ext.field.TextArea'
	],

	xtype: 'composepanel',

	config: {
		layout: 'fit',
		width: '80%',
		height: '90%',
		hidden: true,
		modal: true
	},

	initialize: function() {

		var toolbar = {
			xtype: 'titlebar',
			docked: 'top',
			title: ZtMsg.compose,
			items: [
				{
					xtype: 'button',
					text: ZtMsg.cancel,
					handler: function() {
						this.up('composepanel').fireEvent('cancel');
					}
				},
				{
					xtype: 'button',
					text: ZtMsg.send,
					align: 'right',
					handler: function() {
						this.up('composepanel').fireEvent('send');
					}
				}
			]
		};

		var form = {
			xtype: 'formpanel',
			defaults: {
				labelWidth: '100px',
				inputCls: 'zcs-form-input'
			},
			items: [
				{
					xtype: 'emailfield',
					name: 'to',
					label: ZtMsg.toLabel
				},
				{
					xtype: 'emailfield',
					name: 'cc',
					label: ZtMsg.ccLabel
				},
				{
					xtype: 'textfield',
					name: 'subject',
					label: ZtMsg.subjectLabel
				},
				{
					xtype: 'textareafield',
					name: 'body',
					maxRows: 16     // TODO: would be nicer to auto-size to remaining height
				}
			]
		};

		this.add([
			toolbar,
			form
		]);
	}
});
