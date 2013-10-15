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
 * Base class for a controller that manages a single mail item.
 *
 * @see ZtItemPanel
 * @see ZtMailItem
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.controller.mail.ZtMailItemController', {

	extend: 'ZCS.controller.ZtItemController',

	config: {
		/**
		 * This is the mail component which contains the menu that has been triggered.  Since the menu
		 * implementation is entirely decoupled from its component context, this seems the only reasonable
		 * way to re-establish that context.
		 */
		activeMailComponent:    null,

		app:                    ZCS.constant.APP_MAIL
	},

	/**
	 * Launches a move assignment view.
	 */
	doMove: function(item) {
		this.doAssignmentView(item, ZCS.constant.ORG_FOLDER);
	},

	/**
	 * Launches a tag assignment view.
	 */
	doTag: function(item) {
		this.doAssignmentView(item, ZCS.constant.ORG_TAG);
	},

	/**
	 * Launches an assignment view
	 *
	 * @param {ZtMailItem}  item        item being moved or tagged
	 * @param {String}      type        ZCS.constant.ORG_*
	 */
	doAssignmentView: function (item, type) {

		var targetComp = Ext.Viewport.down('tabpanel'),
			activeComp = this.getActiveMailComponent(),
			activeList = activeComp.down('list'),
			activeStore = activeList.getStore(),
			item = item || this.getItem(),
			isMessage = item instanceof ZCS.model.mail.ZtMailMsg,
			convCtlr = ZCS.app.getConvController(),
			quickReply = !isMessage && convCtlr.getQuickReply();

		if (isMessage) {
			activeStore.filter('id', item.get('id'));
		}

		activeList.setReadOnly(true);

		ZCS.app.getAssignmentController().showAssignmentView(item, type, this.getApp(), this, 'afterAssignment');

		if (quickReply) {
			quickReply.hide();
		}
	},

	/**
	 * Function to run after assignment has happened.
	 */
	afterAssignment: function() {

		var	activeComp = this.getActiveMailComponent(),
			activeList = activeComp.down('list'),
			activeStore = activeList.getStore(),
			convCtlr = ZCS.app.getConvController(),
			quickReply = convCtlr.getQuickReply();

		activeList.setReadOnly(false);

		//undo any filtering we may have done
		activeStore.clearFilter();
		if (quickReply) {
			quickReply.show();
		}

		ZCS.app.fireEvent('rerenderMessages');
	},

	/**
	 * Make sure the action menu shows the appropriate action based on the unread status of this conversation.
	 * The action will be either Mark Read or Mark Unread.
	 */
	doShowMenu: function(menuButton, params) {

		var itemPanel = menuButton.up('.itempanel');
		if (!itemPanel) {
			var itemPanelEl = menuButton.up('.zcs-item-panel');
			itemPanel = itemPanelEl && Ext.getCmp(itemPanelEl.id);
		}
		this.setActiveMailComponent(itemPanel);

		var menuName = params.menuName;

		if (menuName === ZCS.constant.MENU_CONV || menuName === ZCS.constant.MENU_MSG) {
			var	menu = this.getMenu(menuName),
				isConvMenu = (menuName === ZCS.constant.MENU_CONV),
				item = this.getItem(),
				unreadLabel, flagLabel,
				spamLabel = (item.get('folderId') === ZCS.constant.ID_JUNK) ? ZtMsg.markNotSpam : ZtMsg.markSpam;

			if (isConvMenu) {
				unreadLabel = item.get('isUnread') ? ZtMsg.convMarkRead : ZtMsg.convMarkUnread;
				flagLabel = item.get('isFlagged') ? ZtMsg.convUnflag : ZtMsg.convFlag;
			}
			else {
				unreadLabel = item.get('isUnread') ? ZtMsg.markRead : ZtMsg.markUnread;
				flagLabel = item.get('isFlagged') ? ZtMsg.unflag : ZtMsg.flag;
			}

			if (menu) {
				var list = menu.down('list'),
					store = list.getStore(),
					unreadAction = list.getItemAt(store.find('action', ZCS.constant.OP_MARK_READ)),
					flagAction = list.getItemAt(store.find('action', ZCS.constant.OP_FLAG)),
					spamAction = list.getItemAt(store.find('action', ZCS.constant.OP_SPAM));
;
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
			else {
				// first time showing menu, change data since menu not ready yet
				var menuData = this.getMenuConfig(menuName);
				Ext.each(menuData, function(menuItem) {
					if (menuItem.action === ZCS.constant.OP_MARK_READ) {
						menuItem.label = unreadLabel;
					}
					if (menuItem.action === ZCS.constant.OP_FLAG) {
						menuItem.label = flagLabel;
					}
					if (menuItem.action === ZCS.constant.OP_SPAM) {
						menuItem.label = spamLabel;
					}
				}, this);
			}
		}

		this.callParent(arguments);
	},

	/**
	 * Disable "Tag" action if user doesn't have any tags.
	 */
	enableMenuItems: function(menuName) {

		var menu = this.getMenu(menuName),
			curFolder = ZCS.session.getCurrentSearchOrganizer(),
			isFeed = curFolder && curFolder.isFeed(),
			isDrafts = ZCS.util.folderIs(curFolder, ZCS.constant.ID_DRAFTS);

		if (menu && menu.getItem(ZCS.constant.OP_TAG)) {
			var tags = ZCS.session.getOrganizerData(ZCS.constant.APP_MAIL, ZCS.constant.ORG_TAG);
			menu.enableItem(ZCS.constant.OP_TAG, tags && tags.length > 0);
		}
		menu.enableItem(ZCS.constant.OP_REPLY, !isFeed);
		menu.enableItem(ZCS.constant.OP_REPLY_ALL, !isFeed);
		menu.enableItem(ZCS.constant.OP_SPAM, !isDrafts);
	},

	/**
	 * Applies the given tag to the given mail item.
	 *
	 * @param {ZtOrganizer}     tag     tag to apply or remove
	 * @param {ZtMailitem}      item    item to tag or untag
	 */
	saveItemTag: function (tag, item) {
		this.tagItem(item, tag.get('name'), false);
	},

	/**
	 * Saves the item and moves it into the selected folder.
	 *
	 * @param {ZtOrganizer}     folder      target folder
	 * @param {ZtMailItem}      item        item to move
	 */
	saveItemMove: function (folder, item) {

		var folderId = folder.get('zcsId'),
			me = this,
			data = {
				op:     'move',
				l:      folderId,
				tcon:   this.getTcon()
			};

		this.performOp(item, data, function() {
			me.processMove(item, folderId);
		});
	},

	/**
	 * Returns a "tcon" string, which sets constraints on which messages are moved.
	 * For example, if you move a conversation with three Inbox messages and one Trash
	 * message to the folder "Archive", the Trash message does not move.
	 */
	getTcon: function() {
		return '';
	},

	/**
	 * Starts a reply session with the active message as the original message.
	 */
	doReply: function() {
	},

	/**
	 * Starts a reply-all session with the active message as the original message.
	 */
	doReplyAll: function() {
	},

	/**
	 * Moves the mail item to Trash.
	 *
	 * @param {ZtMailItem}   item     mail item
	 */
	doDelete: function(item, isSwipeDelete) {

		item = item || this.getItem();

		var me = this,
			data = {
				op:     'trash',
				tcon:   this.getTcon()
			};

		this.performOp(item, data, function() {
			me.processMove(item, ZCS.constant.ID_TRASH, isSwipeDelete);
		});
	},

	/**
	 * If we moved a conv, we can't rely on notifications to figure out that it moved since
	 * we may not have loaded its messages (the only move notifications that we get are for
	 * messages). So we do it manually if the request succeeded.
	 *
	 * @private
	 */
	processMove: function(item, folderId, isSwipeDelete) {

		var isConv = (item.get('type') === ZCS.constant.ITEM_CONVERSATION),
			toastMsg = isConv ? ZtMsg.moveConversation : ZtMsg.moveMessage,
			folder = ZCS.cache.get(folderId),
			folderName = folder && folder.get('displayName');

		if (isConv) {
			ZCS.app.getConvListController().removeItem(item, isSwipeDelete);
		}
		if (folderName) {
			ZCS.app.fireEvent('showToast', Ext.String.format(toastMsg, folderName));
		}
	},

	/**
	 * Moves the mail item to Junk.
	 *
	 * @param {ZtMailItem}   item     mail item
	 */
	doSpam: function(item) {

		item = item || this.getItem();

		var unspam = (item.get('folderId') === ZCS.constant.ID_JUNK),
			op = unspam ? '!spam' : 'spam',
			newFolder = unspam ? ZCS.constant.ID_INBOX : ZCS.constant.ID_JUNK,
			me = this,
			data = {
				op:     op,
				tcon:   this.getTcon()
			};

		this.performOp(item, op, function() {
			me.processMove(item, newFolder);
		});
	},

	/**
	 * Toggles read/unread on the mail item.
	 *
	 * @param {ZtMailItem}   item     mail item
	 */
	doMarkRead: function(item) {

		item = item || this.getItem();

		var isConv = (item.get('type') === ZCS.constant.ITEM_CONVERSATION),
			isUnread = item.get('isUnread'),
			toastMsg;

		if (isConv) {
			toastMsg = isUnread ? ZtMsg.convMarkedRead : ZtMsg.convMarkedUnread;
		}
		else {
			toastMsg = isUnread ? ZtMsg.messageMarkedRead : ZtMsg.messageMarkedUnread;
		}

		this.performOp(item, isUnread ? 'read' : '!read', function() {
			ZCS.app.fireEvent('showToast', toastMsg);
		});
	},

	/**
	 * Toggles the flagged state of the mail item.
	 *
	 * @param {ZtMailItem}   item     mail item
	 */
	doFlag: function(item) {

		item = item || this.getItem();

		var isConv = (item.get('type') === ZCS.constant.ITEM_CONVERSATION),
			isFlagged = item.get('isFlagged'),
			toastMsg;

		if (isConv) {
			toastMsg = isFlagged ? ZtMsg.convUnflagged : ZtMsg.convFlagged;
		}
		else {
			toastMsg = isFlagged ? ZtMsg.messageUnflagged : ZtMsg.messageFlagged;
		}

		this.performOp(item, isFlagged ? '!flag' : 'flag', function() {
			ZCS.app.fireEvent('showToast', toastMsg);
		});
	}
});
