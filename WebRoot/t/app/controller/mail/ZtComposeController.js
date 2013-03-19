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
 * This class manages the composition of email messages, including new messages,
 * replies, and forwards.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.controller.mail.ZtComposeController', {

	extend: 'Ext.app.Controller',

	requires: [
		'ZCS.view.mail.ZtComposeForm',
		'ZCS.common.ZtUtil'
	],

	mixins: {
		menuable: 'ZCS.common.ZtMenuable'
	},

	config: {

		refs: {
			// event handlers
			composePanel:       'composepanel',
			contactField:       'composepanel contactfield',
			attachmentsField:   '#attachments',

			// other
			mailView:       '#' + ZCS.constant.APP_MAIL + 'view',
			composeForm:    'composepanel formpanel'
		},

		control: {
			composePanel: {
				cancel:                     'doCancel',
				send:                       'doSend',
				saveDraft:                  'doSaveDraft',
				showOriginalAttachments:    'doShowOriginalAttachments',
				originalAttachmentTap:      'doShowMenu'
			},
			contactField: {
				bubbleTap:  'showBubbleMenu'
			}
		},

		models: [
			'ZCS.model.address.ZtAutoComplete'
		],

		stores: [
			'ZCS.store.address.ZtAutoCompleteStore'
		],

		menuConfigs: {
			originalAttachment: [
				{ label: ZtMsg.removeAttachment, action: ZCS.constant.OP_REMOVE_ATT, listener: 'doRemoveAttachment' }
			]
		},

		action: null,
		origMsg: null
	},

	showBubbleMenu: function (field, bubble, bubbleModel) {
		var menu = Ext.create('ZCS.common.ZtMenu', {
			referenceComponent: bubble,
			modal: true
		});

		menu.setMenuItems(Ext.create('ZCS.model.ZtMenuItem', {
			label: 'Remove',
			listener: function () {
				field.removeBubble(bubble);
			}
		}));

		menu.popup();
	},

	/**
	 * Compose a new message, or edit a draft message.
	 *
	 * @param {ZtMailMsg}   msg     (optional) draft message
	 */
	compose: function(msg) {

		var ccAddresses = null,
			bccAddresses = null,
			toAddresses = null,
			subject = null,
			body = null;

		if (msg) {
			toAddresses = msg.getAddressesByType(ZCS.constant.TO);
			ccAddresses = msg.getAddressesByType(ZCS.constant.CC);
			bccAddresses = msg.getAddressesByType(ZCS.constant.BCC);
			subject = this.getSubject(msg, '');
			body = msg.getContentForInclusion();
		}

		this.setAction(ZCS.constant.OP_COMPOSE);
		this.showComposeForm(toAddresses, ccAddresses, subject, body, msg);
	},

	reply: function(msg) {

		var action = ZCS.constant.OP_REPLY;

		this.setAction(action);
		this.setOrigMsg(msg);

		var to = [msg.getReplyAddress()],
			cc,
			subject = this.getSubject(msg, 'Re:'),
			body = this.quoteOrigMsg(msg, action);

		this.showComposeForm(to, cc, subject, body);
	},

	replyAll: function(msg) {

		var action = ZCS.constant.OP_REPLY_ALL;

		this.setAction(action);
		this.setOrigMsg(msg);

		var userEmail = ZCS.session.getAccountName(),
			replyAddr = msg.getReplyAddress(),
			origToAddrs = msg.getAddressesByType(ZCS.constant.TO),
			origCcAddrs = msg.getAddressesByType(ZCS.constant.CC),
			ccAddrs = [],
			used = {},
			subject = this.getSubject(msg, 'Re:'),
			body = this.quoteOrigMsg(msg, action);

		// Remember emails we don't want to repeat in Cc
		// TODO: add aliases to used hash
		used[userEmail] = true;
		used[replyAddr.get('email')] = true;

		Ext.each(origToAddrs.concat(origCcAddrs), function(addr) {
			if (!used[addr.get('email')]) {
				ccAddrs.push(addr);
			}
		}, this);

		this.showComposeForm([replyAddr], ccAddrs, subject, body);
	},

	forward: function(msg) {

		var action = ZCS.constant.OP_FORWARD;

		this.setAction(action);
		this.setOrigMsg(msg);

		var	subject = this.getSubject(msg, 'Fwd:'),
			body = this.quoteOrigMsg(msg, action);

		this.showComposeForm(null, null, subject, body);
	},

	/**
	 * Show the compose form, prepopulating any parameterized fields
	 *
	 * @param {Array}       toFieldAddresses    addresses for To: field
	 * @param {Array}       ccFieldAddresses    addresses for Cc: field
	 * @param {String}      subject             message subject
	 * @param {String}      body                message body
	 * @param {ZtMailMsg}   msg                 (optional) draft message
	 */
	showComposeForm: function (toFieldAddresses, ccFieldAddresses, subject, body, msg) {

		var panel = this.getComposePanel(),
			form = panel.down('formpanel'),
			toFld = form.down('contactfield[name=to]'),
			ccFld = form.down('contactfield[name=cc]'),
			subjectFld = form.down('field[name=subject]'),
			editor = this.getEditor();

		panel.setMsg(msg);

		panel.resetForm();

		if (ccFieldAddresses && ccFieldAddresses.length) {
			panel.showCc();
		}

		var action = this.getAction(),
			attachmentsField = this.getAttachmentsField();

		attachmentsField.hide();
		// see if there are any attachments the user may want to forward
		if (action === ZCS.constant.OP_REPLY || action === ZCS.constant.OP_REPLY_ALL || action === ZCS.constant.OP_FORWARD) {
			var isForward = (action === ZCS.constant.OP_FORWARD),
				which = isForward ? 'FORWARD' : 'REPLY',
				incWhat = ZCS.session.getSetting(ZCS.constant['SETTING_' + which + '_INCLUDE_WHAT']),
				origMsg = this.getOrigMsg();

			// if the original msg is being attached, or the user is not including any content, don't
			// offer to forward attachments
			if (origMsg.hasAttachments() && incWhat !== ZCS.constant.INC_ATTACH && incWhat !== ZCS.constant.INC_NONE) {
				if (action === ZCS.constant.OP_FORWARD) {
					this.doShowOriginalAttachments();
				}
				else {
					attachmentsField.setHtml(ZCS.controller.mail.ZtComposeController.originalAttachmentsTpl.apply({}));
				}
				attachmentsField.show();
			}
		}

		panel.show({
			type: 'slide',
			direction: 'up',
			duration: 250,
			onEnd: function () {
				//Only apply this after layout so it doesn't interfere with Ext layout managers
				Ext.fly(editor).addCls('zcs-fully-editable');

				if (!(toFieldAddresses && toFieldAddresses.length)) {
					toFld.focusInput();
				} else if (!subject) {
					subjectFld.focus();
					range = document.createRange();
					range.selectNodeContents(subjectFld.element.dom);
			        range.collapse(true);
			        var sel = window.getSelection();
			        sel.removeAllRanges();
			        sel.addRange(range);
				} else {
					editor.focus();

					range = document.createRange();
					range.selectNodeContents(editor);
			        range.collapse(true);
			        var sel = window.getSelection();
			        sel.removeAllRanges();
			        sel.addRange(range);
					// editor.scrollTop = 0
				}
			}
		});

		if (toFieldAddresses && toFieldAddresses.length) {
			toFld.addBubbles(toFieldAddresses);
		}

		if (ccFieldAddresses && ccFieldAddresses.length) {
			ccFld.addBubbles(ccFieldAddresses);
		}

		if (subject) {
			subjectFld.setValue(subject);
		}

		editor.innerHTML = body || '';

		if (!(toFieldAddresses && toFieldAddresses.length)) {
			toFld.focusInput();
		} else if (!subject) {
			subjectFld.focus();
		} else {
			editor.focus();
		}

		ZCS.htmlutil.resetWindowScroll();
	},

	/**
	 * @private
	 */
	getSubject: function(msg, prefix) {
		var subject = msg.get('subject'),
			pre = (subject.indexOf(prefix) === 0) ? '' : prefix + ' ';

		return pre + subject;
	},

	/**
	 * @private
	 */
	getEditor: function() {
		var panel = this.getComposePanel(),
			form = panel.down('formpanel'),
			bodyFld = form.down('#body'),
			editor = bodyFld.element.query('.zcs-editable')[0];

		return editor;
	},

	/**
	 * @private
	 */
	doCancel: function() {

		var editor = this.getEditor(),
			me = this;

		if (editor.innerHTML) {
			Ext.Msg.show({
				title: ZtMsg.warning,
				message: ZtMsg.saveDraftWarning,
				buttons: [
					{ text: ZtMsg.yes,      itemId: 'yes',  ui: 'action' },
					{ text: ZtMsg.no,       itemId: 'no' },
					{ text: ZtMsg.cancel,   itemId: 'cancel' }
				],
				fn: function(buttonId) {
					Ext.Logger.info('Compose cancel shield button: ' + buttonId);
					if (buttonId === 'yes') {
						me.doSaveDraft();
						me.endComposeSession();
					}
					else if (buttonId === 'no') {
						me.endComposeSession();
					}
				}
			});
		}
		else {
			this.endComposeSession();
		}
	},

	/**
	 * @private
	 */
	endComposeSession: function() {
		var editor = this.getEditor();
		// Remove this style so it doesn't interfere with the next layout
		Ext.fly(editor).removeCls('zcs-fully-editable');
		this.getComposePanel().hide();
	},

	/**
	 * @private
	 */
	doSend: function() {

		var msg = this.getMessageModel(),
			me = this;

		msg.save({
			success: function() {
				ZCS.app.fireEvent('showToast', ZtMsg.messageSent);
				me.getComposePanel().hide();
			}
		});
	},

	doSaveDraft: function () {
		var msg = this.getMessageModel();
		this.getComposePanel().setMsg(msg);
		msg.save({
			isDraft: true,
			success: function () {
				ZCS.app.fireEvent('showToast', ZtMsg.draftSaved);
			}
		});
	},

	getMessageModel: function () {

		var	existingMsg = this.getComposePanel().getMsg(),
			values = this.getComposeForm().getValues(),
			editor = this.getEditor(),
			action = this.getAction(),
			isNewCompose = (action === ZCS.constant.OP_COMPOSE),
			origMsg = !isNewCompose && this.getOrigMsg();

		Ext.Logger.info('Send message');
		var msg = existingMsg || Ext.create('ZCS.model.mail.ZtMailMsg'),
			from = ZCS.mailutil.getFromAddress();

		msg.set('subject', values.subject);
		msg.addAddresses([].concat(from, values.to, values.cc, values.bcc));
		msg.setComposeAction(action);
		if (origMsg) {
			msg.set('origId', origMsg.getId());
			var irtMessageId = origMsg.get('irtMessageId') || origMsg.get('messageId');
			if (irtMessageId) {
				msg.set('irtMessageId', irtMessageId);
			}
			var attArea = this.getAttachmentsField(),
				attBubbles = attArea.element.query('.zcs-attachment-bubble');

			// set up data for forwarded attachments
			if (attBubbles && attBubbles.length) {
				var ln = attBubbles ? attBubbles.length : 0, i,
					origAtt = [],
					msgId = origMsg.getId(), idParams;
				for (i = 0; i < ln; i++) {
					idParams = ZCS.util.getIdParams(attBubbles[i].id);
					if (idParams) {
						origAtt.push({
							mid:    msgId,
							part:   idParams.part
						});
					}
				}
				msg.set('origAttachments', origAtt);
			}
		}
		if (action === ZCS.constant.OP_REPLY || action === ZCS.constant.OP_REPLY_ALL) {
			msg.set('replyType', 'r');
		}
		else if (action === ZCS.constant.OP_FORWARD) {
			msg.set('replyType', 'w');
		}
		msg.createMime(editor.innerHTML, origMsg && origMsg.hasHtmlPart());

		return msg;
	},

	/**
	 * @private
	 */
	getComposePanel: function() {
		if (!this.composePanel) {
			this.composePanel = Ext.create('ZCS.view.mail.ZtComposeForm');
			Ext.Viewport.add(this.composePanel);
		}

		return this.composePanel;
	},

	quoteHtml: function(html) {
		return ZCS.constant.HTML_QUOTE_PREFIX_PRE + html + ZCS.constant.HTML_QUOTE_PREFIX_POST;
	},

	quoteOrigMsg: function(msg, action) {

		var isForward = (action === ZCS.constant.OP_FORWARD),
			which = isForward ? 'FORWARD' : 'REPLY',
			incWhat = ZCS.session.getSetting(ZCS.constant['SETTING_' + which + '_INCLUDE_WHAT']),
			usePrefix = ZCS.session.getSetting(ZCS.constant['SETTING_' + which + '_USE_PREFIX']),
			incHeaders = ZCS.session.getSetting(ZCS.constant['SETTING_' + which + '_INCLUDE_HEADERS']);

		if (incWhat === ZCS.constant.INC_NONE) {
			return '';
		}

		if (incWhat === ZCS.constant.INC_ATTACH) {
			return '';
		}

		var headerText = '',
			headers = [],
			hdrList = ZCS.constant.QUOTED_HDRS,
			sep = '<br><br>',
			ln = hdrList.length, i, hdr;

		if (incHeaders) {
			for (i = 0; i < ln; i++) {
				hdr = msg.getHeaderStr(hdrList[i]);
				if (hdr) {
					headers.push(hdr);
				}
			}
			headerText += headers.join('<br>') + sep;
		}

		var content = msg.getContentForInclusion(),
			isHtml = msg.hasHtmlPart();

		if (incWhat === ZCS.constant.INC_SMART) {
			content = ZCS.quoted.getOriginalContent(content, isHtml);
		}

		content = headerText + content;
		var	quoted = usePrefix ? this.quoteHtml(content) : content,
			divider = isForward ? ZtMsg.forwardedMessage : ZtMsg.originalMessage;

		return sep + '----- ' + divider + ' -----' + sep + quoted;
	},

	/**
	 * Show original attachments as bubbles.
	 * @private
	 */
	doShowOriginalAttachments: function() {

		var origMsg = this.getOrigMsg(),
			attachments = origMsg.getAttachmentInfo(),
			attachmentsField = this.getAttachmentsField();

		var html = [],
			idx = 0,
			ln = attachments.length, i;

		for (i = 0; i < ln; i++) {
			var attInfo = attachments[i],
				id = ZCS.util.getUniqueId({
					type:   ZCS.constant.IDTYPE_ATTACHMENT,
					url:    attInfo.url,
					part:   attInfo.part
				});

			attInfo.id = id;
			html[idx++] = ZCS.controller.mail.ZtComposeController.attachmentTpl.apply(attInfo);
		}
		attachmentsField.setHtml(html.join(''));
	},

	doShowMenu: function(menuButton, params) {

		this.mixins.menuable.doShowMenu.apply(this, arguments);
		if (params) {
			var menu = this.getMenu(params.menuName);
			if (menu) {
				menu.setArgs(ZCS.constant.OP_REMOVE_ATT, [ params.bubbleId ]);
			}
		}
	},

	/**
	 * Removes an attachment bubble so that the attachment does not get included in the outbound message.
	 *
	 * @param {Stirng}  bubbleId    DOM ID of the attachment bubble
	 */
	doRemoveAttachment: function(bubbleId) {
		Ext.Logger.info('Remove orig att ' + bubbleId);
		var bubble = Ext.fly(bubbleId);
		if (bubble) {
			bubble.destroy();
		}
	}
},
	function(thisClass) {
		thisClass.originalAttachmentsTpl = Ext.create('Ext.XTemplate', ZCS.template.OriginalAttachments);
		thisClass.attachmentTpl = Ext.create('Ext.XTemplate', ZCS.template.Attachment);
	}
);
