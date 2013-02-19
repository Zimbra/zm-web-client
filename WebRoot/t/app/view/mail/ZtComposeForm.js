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
		'Ext.field.TextArea',
		'ZCS.view.contacts.ZtContactField'
	],

	xtype: 'composepanel',

	config: {
		layout: 'fit',
		width: '80%',
		height: '100%',
		hidden: true,
		modal: true,
		cls: 'compose-form'
	},

	initialize: function() {

		var composeForm = this,
			toolbar = {
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
			},
			form = {
				xtype: 'formpanel',
				defaults: {
					labelWidth: '100px',
					inputCls: 'zcs-form-input'
				},
				layout: {
					type: 'vbox'
				},
				items: [{
					height: 44,
					layout: {
						type: 'hbox'
					},
					items: [{
						xtype: 'contactfield',
						name: 'to',
						labelWidth: 32,
						flex: 1,
						label: ZtMsg.toHdr
					}, {
						width: 80,
						height: 44,
						xtype: 'component',
						html: ZtMsg.ccOrBcc,
						itemId: 'ccToggle',
						cls: 'x-form-label x-form-label-nowrap x-field zcs-toggle-field',
						listeners: {
							painted: function () {
								var comp = this;
								this.element.on('tap', function () {
									composeForm.showCc();
								});
							}
						}
					}]
				}, {
					xtype: 'contactfield',
					name: 'cc',
					height: 44,
					labelWidth: 35,
					hidden: true,
					itemId: 'cc',
					label: ZtMsg.ccHdr
				}, {
					xtype: 'contactfield',
					name: 'bcc',
					itemId: 'bcc',
					height: 44,
					labelWidth: 50,
					hidden: true,
					label: ZtMsg.bccHdr
				}, {
					height: 44,
					layout: {
						type: 'hbox'
					},
					items: [{
						xtype: 'textfield',
						name: 'subject',
						height: 44,
						labelWidth: 80,
						flex: 1,
						listeners: {
							blur: function () {
								//Because this panel is floating, and a keystroke may have forced the whole window to scroll,
								//when we blur, reset the scroll.
								ZCS.util.resetWindowScroll();
							}
						},
						label: ZtMsg.subjectHdr
					}, {
						width: 80,
						height: 44,
						xtype: 'component',
						html: ZtMsg.attach,
						itemId: 'attach',
						cls: 'x-form-label x-form-label-nowrap x-field zcs-toggle-field',
						listeners: {
							painted: function () {
								var comp = this;
								this.element.on('tap', function () {
									composeForm.doAttach();
								});
							}
						}
					}]
				}, /*{
					xtype: 'textareafield',
					name: 'body',
					flex: 1,
					maxRows: 16,
					listeners: {
						blur: function () {
							//Because this panel is floating, and a keystroke may have forced the whole window to scroll,
							//when we blur, reset the scroll.
							ZCS.util.resetWindowScroll();
						}
					}
				}*/
					{
						xtype: 'component',
//						html: '<div contenteditable="true" id="zcs-body-field" style="-webkit-user-select:auto;-webkit-user-drag:auto;background-color:white;height:400px;"></div>',
						html: '<div contenteditable="true" id="zcs-body-field" class="zcs-editable zcs-body-field"></div>',
						itemId: 'body'
					}]
			};

		this.add([
			toolbar,
			form
		]);
	},
	showCc: function () {
		this.down('#ccToggle').hide();
		this.down('#cc').show();
		this.down('#bcc').show();
	},
	doAttach: function () {
		this.fireEvent('doAttachment');
	},
	resetForm: function () {
		this.down('.formpanel').reset();
		this.down('#ccToggle').show();
		this.down('#cc').hide();
		this.down('#bcc').hide();
	}
});
