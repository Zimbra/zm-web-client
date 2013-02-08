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

	extend: "Ext.app.Controller",

	requires: [
		'ZCS.view.mail.ZtComposeForm',
		'ZCS.common.ZtUtil'
	],

	config: {

		refs: {
			// event handlers
			composePanel: 'composepanel',
			contactField: 'composepanel contactfield',

			// other
			mailView: '#' + ZCS.constant.APP_MAIL + 'view',
			composeForm: 'composepanel formpanel'
		},

		control: {
			composePanel: {
				cancel: 'doCancel',
				send: 'doSend'
			},
			contactField: {
				bubbleHold: 'showBubbleMenu'
			}
		}
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

	compose: function() {
		var panel = this.getComposePanel(),
			form = panel.down('formpanel'),
			fieldComponent = form.down('contactfield[name=to]');

		panel.resetForm();	

		panel.show({
			type: 'slide',
			direction: 'up',
			delay: 0
		});

		fieldComponent.focusInput();

		//Due to a timing issue between the virtual keyboard showing, and the
		//panel animating, IOS sets the window scroll when it should not,
		//so we manually fix that here.
		ZCS.util.resetWindowScroll();
	},

	reply: function(msg) {

		var panel = this.getComposePanel(),
			form = panel.down('formpanel'),
			toFld = form.down('contactfield[name=to]'),
			subjectFld = form.down('field[name=subject]'),
			bodyFld = form.down('field[name=body]');

		panel.resetForm();
		panel.show({
			type: 'slide',
			direction: 'up'
		});

		toFld.addBubble(msg.getReplyAddress());
		subjectFld.setValue(this.getSubject(msg, 'Re:'));
		bodyFld.setValue('\n\n' + '----- ' + ZtMsg.originalMessage + ' -----\n' + msg.get('content'));
		var textarea = bodyFld.element.query('textarea')[0];
		textarea.scrollTop = 0;
		bodyFld.focus();
		ZCS.util.resetWindowScroll();
	},

	replyAll: function(msg) {

		var panel = this.getComposePanel(),
			form = panel.down('formpanel'),
			toFld = form.down('contactfield[name=to]'),
			ccFld = form.down('contactfield[name=cc]'),
			subjectFld = form.down('field[name=subject]'),
			bodyFld = form.down('field[name=body]');

		panel.resetForm();
		panel.showCc();

		panel.show({
			type: 'slide',
			direction: 'up'
		});

		var userEmail = ZCS.session.getAccountName(),
			replyAddr = msg.getReplyAddress(),
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
				ccAddrs.push(addr);
			}
		}, this);

		toFld.addBubble(replyAddr);
		ccFld.addBubbles(ccAddrs);
		subjectFld.setValue(this.getSubject(msg, 'Re:'));
		bodyFld.setValue('\n\n' + '----- ' + ZtMsg.originalMessage + ' -----\n' + msg.get('content'));
		bodyFld.focus();
		var textarea = bodyFld.element.query('textarea')[0];
		textarea.scrollTop = 0;
		ZCS.util.resetWindowScroll();
	},

	forward: function(msg) {

		var panel = this.getComposePanel(),
			form = panel.down('formpanel'),
			subjectFld = form.down('field[name=subject]'),
			bodyFld = form.down('field[name=body]');

		panel.resetForm();
		panel.show({
			type: 'slide',
			direction: 'up'
		});
		subjectFld.setValue(this.getSubject(msg, 'Fwd:'));
		bodyFld.setValue('\n\n' + '----- ' + ZtMsg.forwardedMessage + ' -----\n' + msg.get('content'));
		form.down('contactfield[name=to]').focus();
		ZCS.util.resetWindowScroll();
	},

	getSubject: function(msg, prefix) {
		var subject = msg.get('subject'),
			pre = (subject.indexOf(prefix) === 0) ? '' : prefix + ' ';

		return pre + subject;
	},

	doCancel: function() {
		this.getComposePanel().hide();
	},

	doSend: function() {
		var values = this.getComposeForm().getValues();
		Ext.Logger.info('Send message');
		var msg = Ext.create('ZCS.model.mail.ZtMailMsg', {
			from: ZCS.session.getAccountName(),
			to: values.to,
			cc: values.cc,
			bcc: values.bcc,
			subject: values.subject,
			content: values.body
		});
		msg.save();
		this.getComposePanel().hide();
	},

	// private
	getComposePanel: function() {

		if (!this.composePanel) {
			this.composePanel = Ext.create('ZCS.view.mail.ZtComposeForm');
			Ext.Viewport.add(this.composePanel);
		}

		return this.composePanel;
	}
});
