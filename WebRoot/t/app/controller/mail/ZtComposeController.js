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

		action:     '',
		origMsg:    null,
		formHash:   ''      // used to perform dirty check
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

	/**
	 * Reply to the sender of the given message.
	 *
	 * @param {ZtMailMsg}   msg     original message
	 */
	reply: function(msg) {

		var action = ZCS.constant.OP_REPLY,
			addrs = this.getReplyAddresses(msg, action),
			subject = this.getSubject(msg, ZtMsg.rePrefix),
			body = this.quoteOrigMsg(msg, action);

		this.setAction(action);
		this.setOrigMsg(msg);

		this.showComposeForm(addrs[ZCS.constant.TO], addrs[ZCS.constant.CC], subject, body);
	},

	/**
	 * Reply to the sender and other recipients of the given message.
	 *
	 * @param {ZtMailMsg}   msg     original message
	 */
	replyAll: function(msg) {

		var action = ZCS.constant.OP_REPLY_ALL,
			addrs = this.getReplyAddresses(msg, action),
			subject = this.getSubject(msg, ZtMsg.rePrefix),
			body = this.quoteOrigMsg(msg, action);

		this.setAction(action);
		this.setOrigMsg(msg);

		this.showComposeForm(addrs[ZCS.constant.TO], addrs[ZCS.constant.CC], subject, body);
	},

	/**
	 * Forward the given message.
	 *
	 * @param {ZtMailMsg}   msg     original message
	 */
	forward: function(msg) {

		var action = ZCS.constant.OP_FORWARD,
			subject = this.getSubject(msg, ZtMsg.fwdPrefix),
			body = this.quoteOrigMsg(msg, action);

		this.setAction(action);
		this.setOrigMsg(msg);

		this.showComposeForm(null, null, subject, body);
	},

	/**
	 * Returns TO and CC addresses for the given message and reply action.
	 *
	 * @param {ZtMailMsg}   msg     original message
	 * @param {String}      action  compose action
	 *
	 * @return {Object}     recipient addresses
	 */
	getReplyAddresses: function(msg, action) {

		var addrs = {},
			replyAddr = msg.getReplyAddress();

		replyAddr.set('type', ZCS.constant.TO);
		addrs[ZCS.constant.TO] = replyAddr;

		if (action === ZCS.constant.OP_REPLY_ALL) {
			var userEmail = ZCS.session.getAccountName(),
				origToAddrs = msg.getAddressesByType(ZCS.constant.TO),
				origCcAddrs = msg.getAddressesByType(ZCS.constant.CC),
				ccAddrs = [],
				used = {};

			// Remember emails we don't want to repeat in Cc
			// TODO: add aliases to used hash
			used[userEmail] = true;
			used[replyAddr.get('email')] = true;

			Ext.each(origToAddrs.concat(origCcAddrs), function(addr) {
				if (!used[addr.get('email')]) {
					addr.set('type', ZCS.constant.CC);
					ccAddrs.push(addr);
				}
			}, this);

			if (ccAddrs.length > 0) {
				addrs[ZCS.constant.CC] = ccAddrs;
			}
		}

		return addrs;
	},

	/**
	 * Show the compose form, prepopulating any parameterized fields
	 *
	 * @param {Array|String}    toFieldAddresses    addresses for To: field
	 * @param {Array}           ccFieldAddresses    addresses for Cc: field
	 * @param {String}          subject             message subject
	 * @param {String}          body                message body
	 * @param {ZtMailMsg}       msg                 (optional) draft message
	 */
	showComposeForm: function (toFieldAddresses, ccFieldAddresses, subject, body, msg) {

		var panel = this.getComposePanel(),
			form = panel.down('formpanel'),
			toFld = form.down('contactfield[name=TO]'),
			ccFld = form.down('contactfield[name=CC]'),
			subjectFld = form.down('field[name=subject]'),
			editor = this.getEditor();

		panel.setMsg(msg);

		panel.resetForm();

		if (!toFieldAddresses) {
			toFieldAddresses = [];
		} else {
			toFieldAddresses = Array.isArray(toFieldAddresses) ? toFieldAddresses : [toFieldAddresses];
		}

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

		this.setFormHash(this.calculateFormHash());

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

		if (this.isDirty()) {
			Ext.Msg.show({
				title: ZtMsg.warning,
				message: ZtMsg.saveDraftWarning,
				buttons: [
					{ text: ZtMsg.yes,    itemId: 'yes',    ui: 'neutral' },
					{ text: ZtMsg.no,     itemId: 'no',     ui: 'neutral' },
					{ text: ZtMsg.cancel, itemId: 'cancel', ui: 'neutral' }
				],
				fn: function(buttonId) {
                    //<debug>
					Ext.Logger.info('Compose cancel shield button: ' + buttonId);
                    //</debug>
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
	 * Sends a message constructed from values in the compose form.
	 */
	doSend: function() {
		this.sendMessage(this.getMessageModel());
	},

	/**
	 * Sends a message. Normally constructs a message based on values in the compose form,
	 * but can also take a message created via quick reply and send that.
	 */
	sendMessage: function(msg, callback, scope) {

		msg.save({
			success: function() {
				ZCS.app.fireEvent('showToast', ZtMsg.messageSent);
				this.getComposePanel().hide();
				if (callback) {
					callback.apply(scope);
				}
				this.setFormHash('');
			}
		}, this);
	},

	doSaveDraft: function () {
		var msg = this.getMessageModel();
		this.getComposePanel().setMsg(msg);
		msg.save({
			isDraft: true,
			success: function () {
				ZCS.app.fireEvent('showToast', ZtMsg.draftSaved);
				this.setFormHash(this.calculateFormHash());
			}
		}, this);
	},

	getMessageModel: function () {

		var	existingMsg = this.getComposePanel().getMsg(),
			values = this.getComposeForm().getValues(),
			editor = this.getEditor(),
			action = this.getAction(),
			isNewCompose = (action === ZCS.constant.OP_COMPOSE),
			origMsg = !isNewCompose && this.getOrigMsg();

        //<debug>
		Ext.Logger.info('Send message');
        //</debug>

		if (origMsg) {
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
			}
		}
		values.content = editor.innerHTML;

		return this.setOutboundMessage(existingMsg, values, action, origMsg, origAtt);
	},

	setOutboundMessage: function(msg, values, action, origMsg, origAtt) {

		msg = /*msg || */Ext.create('ZCS.model.mail.ZtMailMsg');

		var from = ZCS.mailutil.getFromAddress(),
			addrs = Ext.Array.clean([].concat(from, values[ZCS.constant.TO], values[ZCS.constant.CC], values[ZCS.constant.BCC]));

		msg.set('subject', values.subject);
		msg.addAddresses(addrs);
		msg.setComposeAction(action);

		if (origMsg) {
			msg.set('origId', origMsg.getId());
			var irtMessageId = origMsg.get('irtMessageId') || origMsg.get('messageId');
			if (irtMessageId) {
				msg.set('irtMessageId', irtMessageId);
			}
			msg.set('origAttachments', origAtt);
		}

		if (action === ZCS.constant.OP_REPLY || action === ZCS.constant.OP_REPLY_ALL) {
			msg.set('replyType', 'r');
		}
		else if (action === ZCS.constant.OP_FORWARD) {
			msg.set('replyType', 'w');
		}

		msg.createMime(values.content, origMsg && origMsg.hasHtmlPart());

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
		//<debug>
        Ext.Logger.info('Remove orig att ' + bubbleId);
        //</debug>
		var bubble = Ext.fly(bubbleId);
		if (bubble) {
			bubble.destroy();
		}
	},

	/**
	 * Returns true if the contents of the form have changed since it was shown.
	 *
	 * @return {Boolean}    true if the contents of the form have changed since it was shown
	 */
	isDirty: function() {
		return this.getFormHash() != this.calculateFormHash();
	},

	/**
	 * Creates a hash that represents the form contents. For now we just use the length of the content
	 * since content can be huge and we don't want to copy it. An MD5 hash would be better, but ST doesn't
	 * support that out of the box.
	 *
	 * @return {String}     hash of form contents
	 */
	calculateFormHash: function() {

		var values = this.getComposeForm().getValues(),
			editor = this.getEditor();

		var parts = Ext.Array.map(ZCS.constant.RECIP_TYPES, function(type) {
			return Ext.Array.map(values[type], function(addr) {
				return addr.get('email');
			}).join('\u001E');
		});

		parts.push(values.subject, editor ? editor.innerHTML.length : 0);  // MD5 of content would be better

		return parts.join('\u001D');
	}
},
	function(thisClass) {
		thisClass.originalAttachmentsTpl = Ext.create('Ext.XTemplate', ZCS.template.OriginalAttachments);
		thisClass.attachmentTpl = Ext.create('Ext.XTemplate', ZCS.template.Attachment);
	}
);
