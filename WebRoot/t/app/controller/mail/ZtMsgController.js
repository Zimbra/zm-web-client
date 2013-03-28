/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 VMware, Inc.
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
 * This class manages the display and manipulation of a single message.
 *
 * @see ZtMailMsg
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.controller.mail.ZtMsgController', {

	extend: 'ZCS.controller.mail.ZtMailItemController',

	config: {

		models: ['ZCS.model.mail.ZtMailMsg'],
		stores: ['ZCS.store.mail.ZtMsgStore'],

		refs: {
			msgHeader: 'msgheader',
			msgBody: 'msgbody',
			msgView: 'msgview'
		},

		control: {
			msgHeader: {
				contactTap: 'doShowMenu',
				toggleView: 'doToggleView',
				menuTap:    'doShowMenu',
				tagTap:     'doShowMenu'
			},
			msgBody: {
				contactTap:         'doShowMenu',
				inviteReply:        'doInviteReply',
				attachmentTap:      'doShowAttachment',
				toggleQuotedText:   'doToggleQuotedText',
				loadEntireMessage:  'doLoadEntireMessage',
				addressTouch: 'doComposeToAddress'
			}
		},

		menuConfigs: {

			msgActions: [
				{ label: ZtMsg.reply,       action: ZCS.constant.OP_REPLY,      listener: 'doReply' },
				{ label: ZtMsg.replyAll,    action: ZCS.constant.OP_REPLY_ALL,  listener: 'doReplyAll' },
				{ label: ZtMsg.forward,     action: ZCS.constant.OP_FORWARD,    listener: 'doForward' },
				{ label: ZtMsg.del,         action: ZCS.constant.OP_DELETE,     listener: 'doDelete' },
				{ label: ZtMsg.markRead,    action: ZCS.constant.OP_MARK_READ,  listener: 'doMarkRead' },
				{ label: ZtMsg.move,        action: ZCS.constant.OP_MOVE,       listener: 'doMove' },
				{ label: ZtMsg.markSpam,    action: ZCS.constant.OP_SPAM,       listener: 'doSpam' },
				{ label: ZtMsg.flag,        action: ZCS.constant.OP_FLAG,       listener: 'doFlag' },
				{ label: ZtMsg.tag,         action: ZCS.constant.OP_TAG,        listener: 'doTag' }
			],

			tagActions: [
				{ label: ZtMsg.removeTag, action: ZCS.constant.OP_REMOVE_TAG, listener: 'doRemoveTag' }
			]
		},

		tagId: ''
	},

	/**
	 * Figure out what state the msg header should be in. There are three states: collapsed, expanded,
	 * and detailed. For all but collapsed, we show the msg body. Tapping the header toggles whether it
	 * is collapsed. A 'details' link toggles between expanded and detailed.
	 *
	 * @param {ZtMsgHeader} msgHeader       the message header
	 * @param {Boolean}     detailsTapped   true if the 'details' (or 'hide') link was tapped
	 */
	doToggleView: function(msgHeader, detailsTapped) {

		var msgView = msgHeader.up('msgview'),
			msg = msgView.getRecord(),
			curExpanded = msgView.getExpanded(),
			curState = msgView.getState(),
			newExpanded, newState;

		if (!detailsTapped) {
			newState = curExpanded ? ZCS.constant.HDR_COLLAPSED : ZCS.constant.HDR_EXPANDED;
		}
		else {
			newState = (curState === ZCS.constant.HDR_EXPANDED) ? ZCS.constant.HDR_DETAILED : ZCS.constant.HDR_EXPANDED;
		}
		newExpanded = (newState !== ZCS.constant.HDR_COLLAPSED);
		msgView.setExpanded(newExpanded);
		msgView.setState(newState);
		Ext.Logger.info("Header state: " + newState + " (" + newExpanded + ")");

		if (newExpanded && msg && !msg.get('isLoaded')) {
			msg.isExpand = true;
			// ZtMsgView updated via 'updatedata' event
			msg.save({
				op: 'load',
				id: msg.getId()
			});
		}
		else {
			msgView.toggleView();
		}
	},

	doShowMenu: function(menuButton, params) {

		this.setItem(params.msg);
		this.setActiveMailComponent(menuButton.up('.itempanel'));
		this.callParent(arguments);
		if (params.address) {
			var menu = this.getMenu(params.menuName);
			if (menu) {
				menu.setArgs(ZCS.constant.OP_COMPOSE, [ params.address ]);
				if (menu.getItem(ZCS.constant.OP_ADD_CONTACT)) {
					menu.setArgs(ZCS.constant.OP_ADD_CONTACT, [ params.address ]);
				}
			}
		}
		if (params.tagName) {
			var menu = this.getMenu(params.menuName);
			if (menu) {
				menu.setArgs(ZCS.constant.OP_REMOVE_TAG, [ params.tagName ]);
			}
		}
	},

	/**
	 * Override so that we show an "Add to Contacts" item only if the contacts
	 * app is enabled.
	 */
	getMenuConfig: function(menuName) {

		if (menuName === ZCS.constant.MENU_CONTACT) {
			var menuData = [];
			if (ZCS.constant.IS_ENABLED[ZCS.constant.APP_CONTACTS]) {
				menuData.push({
					label:      ZtMsg.addContact,
					action:     ZCS.constant.OP_ADD_CONTACT,
					listener:   'doAddContact'
				});
			}
			menuData.push({
				label:      ZtMsg.newMessage,
				action:     ZCS.constant.OP_COMPOSE,
				listener:   'doCompose'
			});
			return menuData;
		}
		else {
			return this.callParent(arguments);
		}
	},

	/**
	 * Starts a forward session with the active message as the original message.
	 */
	doForward: function() {
		ZCS.app.getComposeController().forward(this.getItem());
	},

	doComposeToAddress: function (address) {
		var addressModel = ZCS.model.mail.ZtEmailAddress.fromEmail(address, ZCS.constant.TO);
		ZCS.app.getComposeController().showComposeForm([addressModel]);
	},

	doInviteReply: function(origMsgId, action) {

		var origMsg = ZCS.cache.get(origMsgId),
			invite = origMsg.get('invite'),
			msg = Ext.create('ZCS.model.mail.ZtMailMsg');

		msg.set('origId', origMsgId);
		msg.set('inviteAction', action);
		msg.set('replyType', 'r');

		msg.set('subject', invite.get('subject'));

		var from = ZCS.mailutil.getFromAddress();
		msg.addAddresses(from);

		if (!invite.get('isOrganizer')) {
			var	organizer = invite.get('organizer'),
				organizerEmail = organizer && organizer.get('email'),
				toEmail = organizerEmail || invite.get('sentBy'),
				toAddress;

			if (!toEmail) {
				var origFrom = origMsg.getAddressByType(ZCS.constant.FROM),
					origEmail = origFrom && origFrom.get('email');

				if (origEmail !== from.get('email')) {
					toEmail = origEmail;
				}
			}
			if (toEmail) {
				msg.addAddresses(ZCS.model.mail.ZtEmailAddress.fromEmail(toEmail, ZCS.constant.TO));
			}
		}

		var replyBody = invite.getSummary(true) + ZCS.constant.INVITE_REPLY_TEXT[action] + '<br><br>';

		msg.createMime(replyBody, true);
		msg.save({
			isInviteReply: true,
			success: function () {
				ZCS.app.fireEvent('showToast', ZtMsg.invReplySent);
			}
		});
	},

	doShowAttachment: function(el) {

		var idParams = ZCS.util.getIdParams(el.dom.id),
			url = idParams && idParams.url;

		if (url) {
			window.open(url, '_blank');
		}
	},

	doRemoveTag: function(tagId) {
		var msg = this.getItem();
		if (msg && tagId) {
			this.tagItem(msg, tagId, true);
		}
	},

	doToggleQuotedText: function(msgBody) {
		var msgView = this.getMsgView(),
			msg = msgView.getMsg();

		msgView.renderBody(!msgBody.showingQuotedText);
	},

	/**
	 * Starts a new compose session.
	 *
	 * @param {String}  addr    email address of recipient (To: field)
	 */
	doCompose: function(addr) {
		var msg = this.getItem(),
			toAddr = msg.getAddressObject('email', addr);

		ZCS.app.getComposeController().showComposeForm([toAddr]);
	},

	doReply: function() {
		ZCS.app.getComposeController().reply(this.getItem());
	},

	doReplyAll: function() {
		ZCS.app.getComposeController().replyAll(this.getItem());
	},

	doAddContact: function(addr) {
		// TODO
	},

	doLoadEntireMessage: function(msg) {
		msg.save({
			op:     'load',
			id:     msg.getId(),
			noMax:  true
		});
	},

	/**
	 * If the msg is already in Trash, permanently delete it.
	 */
	doDelete: function() {

		var msg = this.getItem(),
			parsedId = ZCS.util.parseId(msg.get('folderId'));

		if (parsedId && (parsedId.localId === ZCS.constant.ID_TRASH || parsedId.localId === ZCS.constant.ID_JUNK)) {
			Ext.Msg.confirm(ZtMsg.hardDeleteMsgTitle, ZtMsg.hardDeleteMsgText, function(buttonId) {
				if (buttonId === 'yes') {
						this.performOp(msg, 'delete', function() {
						ZCS.app.fireEvent('showToast', ZtMsg.messageDeleted);
					});
				}
			}, this);
		}
		else {
			this.callParent(arguments);
		}
	},

	/**
	 * Nothing changes in the UI when flagging a message, so show toast.
	 *
	 * @param {ZtMailItem}   item     mail item
	 */
	doFlag: function(item) {

		item = item || this.getItem();

		var isFlagged = item.get('isFlagged'),
			toastMsg = isFlagged ? ZtMsg.messageUnflagged : ZtMsg.messageFlagged;

		this.performOp(item, isFlagged ? '!flag' : 'flag', function() {
			ZCS.app.fireEvent('showToast', toastMsg);
		});
	}
});
