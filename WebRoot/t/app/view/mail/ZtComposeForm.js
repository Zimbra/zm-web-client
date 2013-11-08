/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2012, 2013 Zimbra Software, LLC.
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
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
		width: Ext.os.deviceType === "Phone" ? '100%' : '80%',
		height: '100%',
		scrollable: false,
		hidden: true,
		modal: true,
		cls: 'zcs-compose-form'
	},

	initialize: function() {

		var composeForm = this,
			isPhone = Ext.os.deviceType === "Phone",
			toolbar = {
				xtype: 'titlebar',
				cls: 'zcs-item-titlebar',
				docked: 'top',
				title: ZtMsg.compose,
				items: [
					{
						xtype: 'button',
						text: ZtMsg.cancel,
						handler: function() {
							this.up('composepanel').fireEvent('cancel');
						}
					}, {
						xtype: 'button',
						text: ZtMsg.saveDraft,
						hidden: isPhone,
						align: 'right',
						handler: function() {
							this.up('composepanel').fireEvent('saveDraft');
						}
					}, {
						xtype: 'button',
						text: ZtMsg.send,
						align: 'right',
						minWidth: '6em',
						handler: function() {
							this.up('composepanel').fireEvent('send');
						}
					}
				]
			},
			form = {
				xtype: 'formpanel',
				scrollable: false,
				scrollable: false,
				defaults: {
					inputCls: 'zcs-form-input',
					labelWidth: '5.5em'
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
						xtype: 'button',
						itemId: 'showcc',
						cls: 'zcs-show-cc-btn',
						iconCls: 'collapsed',
						handler: function () {
							composeForm.showCcBcc(composeForm.down('#cc').isHidden());
						}
					}, {
						xtype: 'contactfield',
						name: ZCS.constant.TO,
						addressType: ZCS.constant.TO,
						flex: 1,
						label: ZtMsg.toHdr,
						labelWidth: '3em'
					}]
				}, {
					xtype: 'contactfield',
					name: ZCS.constant.CC,
					itemId: 'cc',
					addressType: ZCS.constant.CC,
					height: '2.5em',
					hidden: true,
					label: ZtMsg.ccHdr,
					labelWidth: '5.5em'
				}, {
					xtype: 'contactfield',
					name: ZCS.constant.BCC,
					itemId: 'bcc',
					addressType: ZCS.constant.BCC,
					height: '2.5em',
					hidden: true,
					label: ZtMsg.bccHdr,
					labelWidth: '5.5em'
				}, {
					cls: 'zcs-subjectline',
					height: '2.5em',
					layout: {
						type: 'hbox'
					},
					items: [{
						xtype: 'textfield',
						cls: 'zcs-subject',
						name: 'subject',
						flex: 1,
						height: '2.5em',
						label: ZtMsg.subjectHdr,
						labelWidth: '5.5em',
						listeners: {
							blur: function () {
								//Because this panel is floating, and a keystroke may have forced the whole window to scroll,
								//when we blur, reset the scroll.
								ZCS.htmlutil.resetWindowScroll();
							}
						}
					}]
				}, {
					xtype: 'container',
					flex: 1,
					scrollable: {
						direction: 'both',
						directionLock: true
					},
					items: [{
						xtype: 'component',
						cls: 'zcs-attachments',
						itemId: 'attachments',
						hidden: true,
						listeners: {
							initialize: function () {
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
						padding: 0,
						flex: 1,
						items: [{
							xtype: 'component',
							itemId: 'body',
							html: '<div contenteditable="true" class="zcs-editable zcs-body-field"></div>',
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
				}]
			};

		if (ZCS.constant.IS_ENABLED[ZCS.constant.FEATURE_ADD_ATTACHMENT]) {
			form.items[3].items.push({
				xtype: 'component',
				cls: 'x-form-label x-form-label-nowrap x-field zcs-toggle-field',
				itemId: 'attach',
				html: ZtMsg.attach,
				width: 80,
				listeners: {
					initialize: function () {
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

	// TODO: Separate toggles for CC and BCC
	showCcBcc: function(show) {
		if (show) {
			this.down('#cc').show();
			this.down('#bcc').show();
			this.down('#showcc').setIconCls('expanded');
		}
		else {
			this.down('#cc').hide();
			this.down('#bcc').hide();
			this.down('#showcc').setIconCls('collapsed');
		}
	},

	doAttach: function () {
		this.fireEvent('doAttachment');
	},

	resetForm: function () {
		this.down('.formpanel').reset();
		this.down('#cc').hide();
		this.down('#bcc').hide();
		this.down('#showcc').setIconCls('collapsed');
	}
});