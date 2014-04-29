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
						paddingRight: '1em',
						handler: function() {
							this.up('composepanel').fireEvent('cancel');
						}
					},{
						xtype: 'button',
						text: ZtMsg.send,
						paddingLeft: '1em',
						align: 'right',
						handler: function() {
							this.up('composepanel').fireEvent('send');
						}
					}
				]
			},
			form = {
				// Scrolling container
				xtype: 'formpanel',
				scrollable: true,
				defaults: {
					inputCls: 'zcs-form-input',
					labelWidth: '5.5em'
				},
				listeners: {
					initialize: function () {
						/**
						 * Fixing dom bug caused by contenteditable where parent scroller
						 * gets pushed outside its fit container. Manually making sure the
						 * scroll container always fills its parent when scrolling starts.
						 */
						this.getScrollable().getScroller().on('scrollstart', function () {
							this.container.dom.scrollIntoView(false);
						});
					}
				},
				items: [{
					cls: 'zcs-recipient-line',
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
						labelWidth: '2.7em'
					}]
				}, {
					xtype: 'contactfield',
					name: ZCS.constant.CC,
					itemId: 'cc',
					addressType: ZCS.constant.CC,
					hidden: true,
					label: ZtMsg.ccHdr,
					labelWidth: '5.2em'
				}, {
					xtype: 'contactfield',
					name: ZCS.constant.BCC,
					itemId: 'bcc',
					addressType: ZCS.constant.BCC,
					hidden: true,
					label: ZtMsg.bccHdr,
					labelWidth: '5.2em'
				}, {
					cls: 'zcs-subjectline',
					layout: {
						type: 'hbox'
					},
					items: [{
						xtype: 'textfield',
						cls: 'zcs-subject',
						name: 'subject',
						flex: 1,
						label: '',
						placeHolder: ZtMsg.subjectHdr,
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
					}]
				}, {
					xtype: 'component',
					itemId: 'body',
					html: '<div contenteditable="true" class="zcs-editable zcs-body-field"></div>',
					listeners: {
						painted: function () {
							var heightToSet = Math.max(this.up('container').element.getHeight(), this.element.down('.zcs-body-field').dom.scrollHeight),
								bodyField = this.element.down('.zcs-body-field');

							bodyField.setMinHeight(heightToSet);
							bodyField.on('blur', function () {
								ZCS.htmlutil.resetWindowScroll();
							});
						}
					}
				}]
			};

		if (ZCS.constant.IS_ENABLED[ZCS.constant.FEATURE_ADD_ATTACHMENT] && Ext.feature.has.XHR2) {
			/**
			 *
			 * We overlay a transparent file input element over the label.  This is because you can't 
			 * style the file input element directly.  Additionally, if you try and programmatically trigger
			 * a click on the file input element, there are positioning bugs in iOS.  This is a hack,
			 * but works.
			 *
			 */
			form.items[3].items.push({
				xtype: 'container',
				width: 80,
				cls: 'zcs-attach-hack-container',
				layout: 'auto',
				items: [{
					xtype: 'filefield',
					width: 80,
					opacity: 0.01,
					cls: 'file-input-div',
					// style:  "visibility:hidden;",
					listeners: {
						change: function (field, newValue, oldValue) {
							//When the value of this field is reset, newValue is null.
							if (newValue) {
							 	composeForm.fireEvent('attachmentAdded', field, newValue, oldValue);
							}
						},
						initialize: function (fileField) {
							fileField.on('blur', function () {
							 	ZCS.htmlutil.resetWindowScroll();
							});		
						}
					}
				}, {
					xtype: 'component',
					cls: 'x-form-label x-form-label-nowrap x-field zcs-toggle-field attach-label',
					itemId: 'attach',
					html: ZtMsg.attach,
					width: 80
				}]
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

	resetForm: function () {
		this.down('.formpanel').reset();
		this.down('#cc').hide();
		this.down('#bcc').hide();
		this.down('#showcc').setIconCls('collapsed');
		//This is necessary to reset the file input inside of the form.
		this.down('.formpanel').element.dom.reset();
		//Reset this so we don't parse out old attachment info next time we come to the form.
		this.down('#attachments').setHtml('');
	}
});
