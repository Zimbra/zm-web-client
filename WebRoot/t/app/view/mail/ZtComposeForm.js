/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2012, 2013 VMware, Inc.
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
 *
 * TODO: This form sets some hard-coded widths for labels. That won't work when localized.
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
		scrollable: false,
		hidden: true,
		modal: true,
		cls: 'zcs-compose-form',
		msg: null
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
						ui: 'neutral',
						handler: function() {
							this.up('composepanel').fireEvent('cancel');
						}
					}, {
						xtype: 'button',
						text: ZtMsg.saveDraft,
						align: 'right',
						ui: 'neutral',
						handler: function() {
							this.up('composepanel').fireEvent('saveDraft');
						}
					}, {
						xtype: 'button',
						text: ZtMsg.send,
						align: 'right',
						ui: 'green',
						padding: '0 2em',
						handler: function() {
							this.up('composepanel').fireEvent('send');
						}
					}
				]
			},
			form = {
				xtype: 'formpanel',
				scrollable: false,
				defaults: {
					labelWidth: '100px',
					inputCls: 'zcs-form-input'
				},
				layout: {
					type: 'vbox'
				},
				items: [{
					height: '2.5em',
					layout: {
						type: 'hbox'
					},
					items: [{
						xtype: 'contactfield',
						name: ZCS.constant.TO,
						labelWidth: '4.5em',
						flex: 1,
						label: ZtMsg.toHdr,
						addressType: ZCS.constant.TO
					}, {
						width: '4.5em',
						height: '2.5em',
						xtype: 'component',
						html: ZtMsg.ccOrBcc,
						itemId: 'ccToggle',
						cls: 'x-form-label x-form-label-nowrap x-field zcs-toggle-field',
						listeners: {
							painted: function () {
								this.element.on('tap', function() {
									composeForm.showCc();
								});
							}
						}
					}]
				}, {
					xtype: 'contactfield',
					name: ZCS.constant.CC,
					height: '2.5em',
					labelWidth: '4.5em',
					hidden: true,
					itemId: 'cc',
					label: ZtMsg.ccHdr,
					addressType: ZCS.constant.CC
				}, {
					xtype: 'contactfield',
					name: ZCS.constant.BCC,
					itemId: 'bcc',
					height: '2.5em',
					labelWidth: '4.5em',
					hidden: true,
					label: ZtMsg.bccHdr,
					addressType: ZCS.constant.BCC
				}, {
					height: '2.5em',
					layout: {
						type: 'hbox'
					},
					items: [{
						xtype: 'textfield',
						name: 'subject',
						height: '2.5em',
						labelWidth: '4.5em',
						flex: 1,
						listeners: {
							blur: function () {
								//Because this panel is floating, and a keystroke may have forced the whole window to scroll,
								//when we blur, reset the scroll.
								ZCS.htmlutil.resetWindowScroll();
							}
						},
						label: ZtMsg.subjectHdr
					}]
				}, {
					xtype: 'component',
					height: '2.5em',
					cls: 'zcs-attachments',
					hidden: true,
					itemId: 'attachments',
					listeners: {
						painted: function () {
							this.element.on('tap', function(e) {
								var el = Ext.fly(e.target);
								if (el.hasCls('zcs-link')) {
									composeForm.fireEvent('showOriginalAttachments');
								}
								if (el.hasCls('zcs-attachment-bubble')) {
									var idParams = ZCS.util.getIdParams(el.dom.id) || {};
									composeForm.fireEvent('originalAttachmentTap', el, {
										menuName:   ZCS.constant.MENU_ORIG_ATT,
										bubbleId:   el.dom.id
									});
								}
							});
						}
					}
				}, {
					xtype: 'container',
					scrollable: {
					    direction: 'vertical',
					    directionLock: true
					},
					padding: 0,
					flex: 1,
					items: [{
						xtype: 'component',
						html: '<div contenteditable="true" class="zcs-editable zcs-body-field"></div>',
						itemId: 'body',
						listeners: {
							painted: function () {
								var heightToSet = Math.max(this.up('container').element.getHeight(), this.element.down('.zcs-body-field').dom.scrollHeight),
									bodyField = this.element.down('.zcs-body-field');

								this.setHeight(heightToSet);

								bodyField.setHeight(heightToSet);

								bodyField.dom.addEventListener('blur', function () {
									ZCS.htmlutil.resetWindowScroll();
								});

								bodyField.dom.addEventListener('focus', function () {
									setTimeout(ZCS.htmlutil.resetWindowScroll, 0);
								});
							}
						}
					}]
				}]
			};

		if (ZCS.constant.IS_ENABLED[ZCS.constant.FEATURE_ADD_ATTACHMENT]) {
			form.items[3].items.push({
				width: 80,
				height: '2.5em',
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
			});
		}

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
