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
 * This class manages the composition of email messages, including new messages,
 * replies, and forwards.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.controller.mail.ZtComposeController', {

	extend: 'Ext.app.Controller',

	requires: [
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
			originalAttachmentMenu: 'list[itemId=originalAttachmentMenu]',
			recipientActionsMenu: 'list[itemId=recipientActionsMenu]',

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
				originalAttachmentTap:      'showMenu'
			},
			originalAttachmentMenu: {
				itemtap:            'onMenuItemSelect'
			},
			recipientActionsMenu: {
				itemtap:            'onMenuItemSelect'
			},
			contactField: {
				bubbleTap:  'showMenu'
			}
		},

		models: [
			'ZCS.model.address.ZtAutoComplete'
		],

		stores: [
			'ZCS.store.address.ZtAutoCompleteStore'
		],

		action:     '',
		origMsg:    null,   // reply/forward
		draftId:    null,   // ID of existing draft to delete when edited version is sent
		formHash:   ''      // used to perform dirty check
	},

	doRemoveRecipient: function (actionParams) {
		actionParams.field.removeBubble(actionParams.bubble);
	},

	/**
	 * Compose a new message, or edit a draft message.
	 *
	 * @param {ZtMailMsg}   msg     (optional) draft message
	 */
	compose: function(msg) {

		var addresses = {},
			subject = null,
			body = null,
			signature = ZCS.session.getSetting(ZCS.constant.SETTING_SIGNATURE);

		if (msg) {
			Ext.each(ZCS.constant.RECIP_TYPES, function(type) {
				addresses[type] = msg.getAddressesByType(type);
			}, this);
			subject = this.getSubject(msg, '');
			body = msg.getContentForInclusion();
		}
		else {
			body = signature ? '<br><br>' + signature : null;
		}

		this.setAction(ZCS.constant.OP_COMPOSE);
		this.setDraftId(msg ? msg.get('zcsId') : null);
		this.showComposeForm(addresses, subject, body, msg);
	},

	/**
	 * Reply to the sender of the given message.
	 *
	 * @param {ZtMailMsg}   msg     original message
	 */
	reply: function(msg) {
		this.doReply(msg, false);
	},

	/**
	 * Reply to the sender and other recipients of the given message.
	 *
	 * @param {ZtMailMsg}   msg     original message
	 */
	replyAll: function(msg) {
		this.doReply(msg, true);
	},

	doReply: function(msg, replyAll) {

		var action = replyAll ? ZCS.constant.OP_REPLY_ALL : ZCS.constant.OP_REPLY,
			addrs = this.getReplyAddresses(msg, action),
			subject = this.getSubject(msg, ZtMsg.rePrefix),
			body = this.quoteOrigMsg(msg, action);

		this.setAction(action);
		this.setOrigMsg(msg);
		this.setDraftId(null);

		this.showComposeForm(addrs, subject, body, msg);
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
		this.setDraftId(null);

		this.showComposeForm(null, subject, body, msg);
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
	 * @param {Object|Array|String} addresses    addresses (hash by type, list of To:, or a single To:)
	 * @param {String}              subject      message subject
	 * @param {String}              body         message body
 	 * @param {ZtMailMsg}   msg     original message
	 */
	showComposeForm: function(addresses, subject, body, msg) {

		var panel = this.getComposePanel(),
			form = panel.down('formpanel'),
			formField = {},
			subjectFld = form.down('field[name=subject]'),
			editor = this.getEditor();

		// make sure addresses is a hash of arrays by address type; array is list of ZtEmailAddress
		if (!Ext.isObject(addresses)) {
			addresses = Ext.isString(addresses) ? [ ZCS.model.mail.ZtEmailAddress.fromEmail(addresses) ] : addresses;
			var addrs = {};
			addrs[ZCS.constant.TO] = Array.isArray(addresses) ? addresses : [];
			addresses = addrs;
		}

		// get the form fields; show CC/BCC if we have any of those addresses
		var showCcBcc = false;
		Ext.each(ZCS.constant.RECIP_TYPES, function(type) {
			formField[type] = form.down('contactfield[name=' + type + ']');
			if (type !== ZCS.constant.TO && addresses[type] && addresses[type].length) {
				showCcBcc = true;
			}
		}, this);
		panel.showCcBcc(showCcBcc);

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
                // Bug: 82698. Attachment info will only be present in case of valid attachments, for invite msg message.ics is ignored as attachment
                if (origMsg.getAttachmentInfo().length) {
                    attachmentsField.show();
                }
			}
		}

		this.unhideComposeForm();

		Ext.each(ZCS.constant.RECIP_TYPES, function(type) {
			formField[type].addBubbles(addresses[type]);
		}, this);

		if (subject) {
			subjectFld.setValue(subject);
		}

		editor.innerHTML = body || '';

		ZCS.htmlutil.fixImages(msg, editor, false);

		this.setFormHash(this.calculateFormHash());

		if (!(addresses[ZCS.constant.TO] && addresses[ZCS.constant.TO].length)) {
			panel.suspendEvents();
			ZCS.ZTPreventOverflowCheck = true;
			formField[ZCS.constant.TO].focusInput();
			ZCS.ZTPreventOverflowCheck = false;
			panel.resumeEvents(false);
		} else if (!subject) {
			subjectFld.focus();
		} else {
			editor.focus();

			var range = document.createRange();
			range.selectNodeContents(editor);
			range.collapse(true);
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		}

        Ext.fly(editor).addCls('zcs-fully-editable');

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
				buttons: ZCS.constant.CANCEL_SHIELD_BUTTONS,
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
		var editor = this.getEditor(),
			composePanel = this.getComposePanel();

		// Remove this style so it doesn't interfere with the next layout
		Ext.fly(editor).removeCls('zcs-fully-editable');
		this.hideComposeForm();
		composePanel.resetForm();
	},

	/**
	 * Sends a message constructed from values in the compose form.
	 *
	 * @param {Object}                  eOpts       Sencha event options
	 * @param {Ext.event.Controller}    controller  Sencha event controller
	 * @param {Boolean}                 force       if true, skip error checks and send (or save) msg
	 */
	doSend: function(eOpts, controller, force) {
		var msg = this.getMessageModel(force);
		if (msg) {
			this.sendMessage(msg);
		}
	},

	/**
	 * Sends a message. Normally constructs a message based on values in the compose form,
	 * but can also take a message created via quick reply and send that.
	 */
	sendMessage: function(msg, callback, scope) {
		var composePanel = this.getComposePanel();

		composePanel.element.dom.style.setProperty('display', 'none');
		composePanel.resetForm();
		msg.save({
			success: function() {
				ZCS.app.fireEvent('showToast', ZtMsg.messageSent);
				ZCS.app.fireEvent('messageSent', this.getDraftId() != null);
				if (callback) {
					callback.apply(scope);
				}
				this.setFormHash('');
			}
		}, this);
	},

	doSaveDraft: function () {
		var msg = this.getMessageModel(true);
		msg.save({
			isDraft: true,
			success: function(msg, operation) {
				ZCS.app.fireEvent('showToast', ZtMsg.draftSaved);
				this.setFormHash(this.calculateFormHash());
				// parse response so we can get ID of draft msg - that way we can tell server to
				// delete it when the msg is sent
				var reader = ZCS.model.mail.ZtMailMsg.getProxy().getReader(),
					response = reader.getResponseData(operation.getResponse());
				this.setDraftId(response.Body.SaveDraftResponse.m[0].id);
			}
		}, this);
	},

	getMessageModel: function(force) {

		var	values = this.getComposeForm().getValues(),
			numAddresses = values[ZCS.constant.TO].length + values[ZCS.constant.CC].length + values[ZCS.constant.BCC].length,
			editor = this.getEditor(),
			action = this.getAction(),
			isNewCompose = (action === ZCS.constant.OP_COMPOSE),
			origMsg = !isNewCompose && this.getOrigMsg();

		if (!force && numAddresses === 0) {
			Ext.Msg.alert(ZtMsg.error, ZtMsg.errorNoAddresses);
			return null;
		}

		if (!force && !values.subject) {
			Ext.Msg.confirm(ZtMsg.warning, ZtMsg.errorNoSubject, function(buttonId) {
				if (buttonId === 'yes') {
					this.doSend(null, null, true);
				}
			}, this);
			return null;
		}

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

		return this.setOutboundMessage(values, action, origMsg, origAtt);
	},

	setOutboundMessage: function(values, action, origMsg, origAtt) {

		var msg = Ext.create('ZCS.model.mail.ZtMailMsg'),
			from = ZCS.mailutil.getFromAddress(),
			addrs = Ext.Array.clean([].concat(from, values[ZCS.constant.TO], values[ZCS.constant.CC], values[ZCS.constant.BCC]));

		msg.set('subject', values.subject);
		msg.addAddresses(addrs);
		msg.setComposeAction(action);
		msg.set('draftId', this.getDraftId());

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

	quoteHtml: function(html) {
		return ZCS.constant.HTML_QUOTE_PREFIX_PRE + html + ZCS.constant.HTML_QUOTE_PREFIX_POST;
	},

	quoteOrigMsg: function(msg, action) {

		var isForward = (action === ZCS.constant.OP_FORWARD),
			which = isForward ? 'FORWARD' : 'REPLY',
			incWhat = ZCS.session.getSetting(ZCS.constant['SETTING_' + which + '_INCLUDE_WHAT']),
			usePrefix = ZCS.session.getSetting(ZCS.constant['SETTING_' + which + '_USE_PREFIX']),
			incHeaders = ZCS.session.getSetting(ZCS.constant['SETTING_' + which + '_INCLUDE_HEADERS']);

		if (incWhat === ZCS.constant.INC_NONE || incWhat === ZCS.constant.INC_ATTACH) {
			return '';
		}

		var headerText = '',
			headers = [],
			hdrList = ZCS.constant.QUOTED_HDRS,
			sep1 = '<br>',
			sep2 = '<br><br>',
			ln = hdrList.length, i, hdr;

		if (incHeaders) {
			for (i = 0; i < ln; i++) {
				hdr = msg.getHeaderStr(hdrList[i]);
				if (hdr) {
					headers.push(hdr);
				}
			}
			headerText += headers.join('<br>') + sep2;
		}

		var content = msg.getContentForInclusion(),
			isHtml = msg.hasHtmlPart();

		if (incWhat === ZCS.constant.INC_SMART) {
			content = ZCS.quoted.getOriginalContent(content, isHtml);
		}

		content = headerText + content;

		if (!ZCS.htmlutil.trimHtml(content)) {
			return '';
		}

		var	quoted = usePrefix ? this.quoteHtml(content) : content;

		var signature = ZCS.session.getSetting(ZCS.constant.SETTING_REPLY_SIGNATURE),
			sigStyle = ZCS.session.getSetting(ZCS.constant.SETTING_SIGNATURE_STYLE),
			body = '';

		if (signature) {
			if (sigStyle === ZCS.constant.SIG_OUTLOOK) {
				body = sep2 + signature + sep2 + ZCS.constant.HTML_QUOTE_DIVIDER + quoted;
			}
			else {
				body = sep2 + ZCS.constant.HTML_QUOTE_DIVIDER + quoted + sep2 + '--<br>' + signature;
			}
		}
		else {
			body = sep2 + ZCS.constant.HTML_QUOTE_DIVIDER + quoted;
		}

		return body;
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

		if (this.getComposePanel().isHidden()) {
			return false;
		}
		else {
		    return this.getFormHash() != this.calculateFormHash();
		}
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
	},

	unhideComposeForm: function () {
		if (Ext.os.deviceType === "Phone") {
			this.getComposePanel().element.dom.style.removeProperty('display');
		} else {
			this.getComposePanel().show({
				type: 'fadeIn',
				duration: 250
			});
		}
	},

	hideComposeForm: function () {
		if (Ext.os.deviceType === "Phone") {
			this.getComposePanel().element.dom.style.setProperty('display', 'none');
		} else {
			this.getComposePanel().hide({
				type: 'fadeOut',
				duration: 250
			});
		}
	}
},
	function(thisClass) {
		thisClass.originalAttachmentsTpl = Ext.create('Ext.XTemplate', ZCS.template.OriginalAttachments);
		thisClass.attachmentTpl = Ext.create('Ext.XTemplate', ZCS.template.Attachment);
	}
);
