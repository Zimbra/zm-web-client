/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
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
			msgView: 'msgview',
			msgActionsMenu: 'list[itemId=msgActionsMenu]',
			msgReplyActionsMenu: 'list[itemId=msgReplyActionsMenu]',
			addressActionsMenu: 'list[itemId=addressActionsMenu]',
			tagActionsMenu: 'list[itemId=tagActionsMenu]'
		},

		control: {
			msgHeader: {
				contactTap: 'showMenu',
				toggleView: 'doToggleView',
				tagTap:     'showMenu'
			},
			msgBody: {
				contactTap:         'showMenu',
				inviteReply:        'doInviteReply',
				attachmentTap:      'doShowAttachment',
				toggleQuotedText:   'doToggleQuotedText',
				loadEntireMessage:  'doLoadEntireMessage',
				addressTouch:       'doComposeToAddress'
			},
			msgActionsMenu: {
				itemtap:            'onMenuItemSelect'
			},
			msgReplyActionsMenu: {
				itemtap:            'onMenuItemSelect'
			},
			addressActionsMenu: {
				itemtap:            'onMenuItemSelect'
			},
			tagActionsMenu: {
				itemtap:            'onMenuItemSelect'
			},
			'.moveview': {
				messageAssignment: 'saveItemMove'
			},
			'.tagview': {
				messageAssignment: 'saveItemTag'
			},
			'msgview button[cls=zcs-btn-msg-details]': {
				tap: 'onMsgActionsTap'
			},
			'msgview toolbar button[action=cancel]': {
				tap: 'onMsgActionsCancelTap'
			},
			'msgview toolbar button[iconCls=reply]': {
				tap: 'onMsgActionsButtonTap'
			},
			'msgview toolbar button[iconCls=trash]': {
				tap: 'onMsgActionsButtonTap'
			},
			'msgview toolbar button[iconCls=arrow_down]': {
				tap: 'onMsgActionsButtonTap'
			},
			'msgview toolbar': {
				show: 'onMsgViewToolbarShow'
			}
		},

		tagId: ''
	},

	onMsgActionsTap: function (button, e) {
		var msgView = button.up('msgview'),
			actionMenu = msgView.down('toolbar[cls=zcs-msg-actions-toolbar]'),
			actionMenuContainer = msgView.down('#toolbarContainer');

		actionMenuContainer.show();
		actionMenu.show();
		button.hide();
	},

	onMsgActionsCancelTap: function (button, e) {
		var msgView = button.up('msgview'),
			actionMenu = msgView.down('toolbar[cls=zcs-msg-actions-toolbar]'),
			actionMenuButton = msgView.down('button[cls=zcs-btn-msg-details]');

		actionMenuButton.show();
		actionMenu.hide();
		// container hide is done in actionMenu hide listener
	},

	onMsgActionsButtonTap: function (button, e) {
		var msgView = button.up('msgview'),
			msg = msgView.getMsg();

		if (button.get('iconCls') == 'trash') {
			this.doDelete({msg: msg});
		} else {
			this.showMenu(button, {
				menuName:   button.menuName,
				msg:        msg
			});
		}
	},

	onMsgViewToolbarShow: function (toolbar, eOpts) {
		if (toolbar.up('msgview').element.hasCls('x-list-item-last')) {
			toolbar.up('list').getScrollable().getScroller().scrollToEnd();
		}
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
			msg = msgView.getMsg(),
			curExpanded = msgView.getExpanded(),
			curState = msgView.getState(),
			newExpanded, newState,
			msgToolbarBtn = msgView.down('button[cls=zcs-btn-msg-details]');

		if (!detailsTapped) {
			newState = curExpanded ? ZCS.constant.HDR_COLLAPSED : ZCS.constant.HDR_EXPANDED;
		}
		else {
			newState = (curState === ZCS.constant.HDR_EXPANDED) ? ZCS.constant.HDR_DETAILED : ZCS.constant.HDR_EXPANDED;
		}

		newExpanded = (newState !== ZCS.constant.HDR_COLLAPSED);

		msgView.setExpanded(newState === ZCS.constant.HDR_EXPANDED || newState === ZCS.constant.HDR_DETAILED);

		msgView.setState(newState);

		if (newState === ZCS.constant.HDR_COLLAPSED) {
			msgToolbarBtn.hide();
		} else {
			msgToolbarBtn.show();
		}

		//<debug>
        Ext.Logger.info("Header state: " + newState + " (" + newExpanded + ")");
        //</debug>

        msgView.updateExpansion();
    	msgView.renderHeader();

		if (newExpanded && msg && !msg.get('isLoaded')) {
			msg.save({
				op: 'load',
				id: msg.getId(),
				success: function() {
					if (newExpanded) {
						msgView.renderBody();
						if (!msgView.usingIframe()) {
							msgView.updateHeight();
						}
					} else {
						msgView.updateHeight();
					}
				}
			});
		}
		else {
			//The body might not be rendered if we are going to expanded from not expanded.
			if (newExpanded) {
				msgView.renderBody();
				if (!msgView.usingIframe()) {
					msgView.updateHeight();
				}
			} else {
				msgView.updateHeight();
			}
		}
	},

	/**
	 * Starts a forward session with the active message as the original message.
	 */
	doForward: function(actionParams) {
		ZCS.app.getComposeController().forward(actionParams.msg);
	},

	doComposeToAddress: function (actionParams) {
		var addressModel = ZCS.model.mail.ZtEmailAddress.fromEmail(actionParams.address, ZCS.constant.TO);
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

	doToggleQuotedText: function(msgBody) {
		var msgView = msgBody.up('msgview'),
			msg = msgView.getMsg();

		msgView.renderBody(!msgBody.showingQuotedText);
		msgView.updateHeight();
	},

	/**
	 * Starts a new compose session.
	 *
	 * @param {String}  addr    email address of recipient (To: field)
	 */
	doCompose: function(actionParams) {
		var msg = actionParams.msg,
			toAddr = msg.getAddressObject('email', actionParams.address);

		ZCS.app.getComposeController().showComposeForm([toAddr]);
	},

	doReply: function(actionParams) {
		ZCS.app.getComposeController().reply(actionParams.msg);
	},

	doReplyAll: function(actionParams) {
		ZCS.app.getComposeController().replyAll(actionParams.msg);
	},

	doAddContact: function(actionParams) {
		ZCS.app.getContactController().showContactForm(ZCS.constant.OP_COMPOSE, ZCS.model.contacts.ZtContact.fromEmailObj(actionParams.addrObj));
	},

    doEditContact: function(actionParams) {
        var contact = ZCS.cache.get(actionParams.addrObj.get('email'), 'email'),
            contactCtrl = ZCS.app.getContactController();
        contactCtrl.setItem(contact);
        contactCtrl.showContactForm(ZCS.constant.OP_EDIT, contact);
    },

	/**
	 * Searches for mail from the given sender.
	 */
	doSearch: function(actionParams) {
		ZCS.app.getConvListController().doSearch('from:' + actionParams.address);
	},

	doLoadEntireMessage: function(msg, msgBody) {

		var msgView = msgBody.up('msgview');

		msg.save({
			op:     'load',
			id:     msg.getId(),
			noMax:  true,
			success: function() {
				msgView.render(msg);
				msgView.updateHeight();
			}
		}, this);
	},

	/**
	 * If the msg is already in Trash, permanently delete it.
	 */
	doDelete: function(actionParams) {

		var msg = actionParams.msg,
			localFolderId = msg ? ZCS.util.localId(msg.get('folderId')) : '';

		if (localFolderId === ZCS.constant.ID_TRASH || localFolderId === ZCS.constant.ID_JUNK) {
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
	 * Make sure the action menu shows the appropriate action based on the unread status of this conversation.
	 * The action will be either Mark Read or Mark Unread.
	 */
	updateMenuLabels: function(menuButton, params, menu) {

		var message = this.getMsgHeader().up('msgview').getMsg();

		var menuName = params.menuName;

		if (menuName === ZCS.constant.MENU_MSG) {
			var	unreadLabel, flagLabel, spamLabel;

			unreadLabel = message.get('isUnread') ? ZtMsg.markRead : ZtMsg.markUnread;
			flagLabel = message.get('isFlagged') ? ZtMsg.unflag : ZtMsg.flag;
			spamLabel = (message.get('folderId') === ZCS.constant.ID_JUNK) ? ZtMsg.markNotSpam : ZtMsg.markSpam;

			var store = menu.getStore(),
				unreadAction = menu.getItemAt(store.find('action', ZCS.constant.OP_MARK_READ)),
				flagAction = menu.getItemAt(store.find('action', ZCS.constant.OP_FLAG)),
				spamAction = menu.getItemAt(store.find('action', ZCS.constant.OP_SPAM));

			if (unreadAction) {
				unreadAction.getRecord().set('label', unreadLabel);
			}
			if (flagAction) {
				flagAction.getRecord().set('label', flagLabel);
			}
			if (spamAction) {
				spamAction.getRecord().set('label', spamLabel);
			}
		}
		else if (menuName === ZCS.constant.MENU_ADDRESS) {
			// Hiding/showing address listitems instead of changing labels
			menu.hideItem(ZCS.constant.OP_ADD_CONTACT, true);
			menu.hideItem(ZCS.constant.OP_EDIT, true);

			// Pick which listitem to show, only if contacts app is enabled
			if (ZCS.constant.IS_ENABLED[ZCS.constant.APP_CONTACTS]) {
				var fromAddr = message.getAddressByType(ZCS.constant.FROM),
					cachedAddr = ZCS.cache.get(fromAddr && fromAddr.get('email'), 'email');

				if (cachedAddr) {
					menu.hideItem(ZCS.constant.OP_EDIT, false);
				} else {
					menu.hideItem(ZCS.constant.OP_ADD_CONTACT, false);
				}
			}
		}
	},

	/**
	 * Disable "Tag" action if user doesn't have any tags.
	 */
	enableMenuItems: function(menu) {

		var curFolder = ZCS.session.getCurrentSearchOrganizer(),
			isFeed = curFolder && curFolder.isFeed(),
			isDrafts = ZCS.util.folderIs(curFolder, ZCS.constant.ID_DRAFTS);

		if (menu && menu.getItem(ZCS.constant.OP_TAG)) {
			var tags = ZCS.session.getOrganizerData(ZCS.constant.APP_MAIL, ZCS.constant.ORG_TAG);
			menu.enableItem(ZCS.constant.OP_TAG, tags && tags.length > 0);
		}
		menu.enableItem(ZCS.constant.OP_REPLY, !isFeed);
		menu.enableItem(ZCS.constant.OP_REPLY_ALL, !isFeed);
		menu.enableItem(ZCS.constant.OP_SPAM, !isDrafts);
	}
});
