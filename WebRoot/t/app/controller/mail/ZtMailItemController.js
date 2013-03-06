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
 * Base class for a controller that manages a single mail item.
 *
 * @see ZtItemPanel
 * @see ZtMailItem
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.controller.mail.ZtMailItemController', {

	extend: 'ZCS.controller.ZtItemController',

	requires: [
		'ZCS.view.mail.ZtFolderAssignmentView',
		'ZCS.view.mail.ZtTagAssignmentView'
	],

	config: {
		/**
		 * This is the mail component which contains the menu that has been triggered.  Since the menu
		 * implementation is entirely decoupled from its component context, this seems the only reasonable
		 * way to re-establish that context.
		 */
		activeMailComponent: null
	},

	/**
	 * Returns the message that an operation should be applied to.
	 */
	getActiveMsg: function() {},

	/**
	 * Launches a move assignment view.
	 */
	doMove: function(item) {
		this.doAssignmentView(item, 'ZCS.view.mail.ZtFolderAssignmentView', ZtMsg.folders, 'folderView');
	},

	/**
	 * Launches a tag assignment view.
	 */
	doTag: function (item) {
		this.doAssignmentView(item, 'ZCS.view.mail.ZtTagAssignmentView', ZtMsg.tags, 'tagView');
	},

	/**
	 * Launches an assignment view
	 */
	doAssignmentView: function (item, view, listTitle, viewProp) {
		var targetComp = Ext.Viewport.down('tabpanel'),
			activeComp = this.getActiveMailComponent(),
			activeList = activeComp.down('list'),
			activeStore = activeList.getStore(),
			item = item || this.getItem(),
			contentHeight,
			isMessage = item instanceof ZCS.model.mail.ZtMailMsg;


		if (isMessage) {
			activeStore.filter('id', item.get('id'));
		}

		activeList.setReadOnly(true);

		contentHeight = activeList.getItemMap().getTotalHeight();

		//To account for the panel header
		contentHeight += 20;

		if (!this[viewProp]) {
			this[viewProp] = Ext.create(view, {
				targetElement: targetComp.bodyElement,
				record: item || this.getItem(),
				listTitle: listTitle,
				onAssignmentComplete: function () {
					activeComp.showMenuButton();
					activeList.setReadOnly(false);
					//undo any filtering we may have done
					activeStore.clearFilter();
				}
			});
		}

		activeComp.hideMenuButton();
		this[viewProp].showWithComponent(activeComp, item, contentHeight);
	},

	/**
	 * Make sure the action menu shows the appropriate action based on the unread status of this conversation.
	 * The action will be either Mark Read or Mark Unread.
	 */
	doShowMenu: function(menuButton) {
		this.setActiveMailComponent(menuButton.up('.itempanel'));

		var menu = this.getMenu(),
			label = this.getItem().get('isUnread') ? ZtMsg.markRead : ZtMsg.markUnread;

		if (menu) {
			var list = menu.down('list'),
				store = list.getStore(),
				item = list.getItemAt(store.find('action', 'MARK_READ'));

			if (item) {
				item.getRecord().set('label', label);
			}
		}
		else {
			// first time showing menu, change data since menu not ready yet
			var menuData = this.getMenuData();
			Ext.each(menuData, function(menuItem) {
				if (menuItem.action === 'MARK_READ') {
					menuItem.label = label;
				}
			}, this);
		}
		this.callParent(arguments);
	},

	/**
	 * Disable "Tag" action if user doesn't have any tags.
	 */
	enableMenuItems: function() {
		var tags = ZCS.session.getOrganizerDataByAppAndOrgType(ZCS.constant.APP_MAIL, ZCS.constant.ORG_TAG);
		this.getMenu().enableItem(ZCS.constant.OP_TAG, tags && tags.length > 0);
	},

	/**
	 * Saves the item and tags it.
	 */
	saveItemTag: function (tag, item) {
		item.set('op', 'tag');
		item.set('tn', tag.get('name'));

		item.save({
			success: function(item, operation) {
				Ext.Logger.info('mail item tagged successfully');
				item.set('op', null);
			}
		});
	},

	/**
	 * Saves the item and moves it into the selected folder.
	 */
	saveItemMove: function (folder, item) {
		item.set('op', 'move');
		item.set('l', folder.get('id'));

		item.save({
			success: function(item, operation) {
				var isConversation = item instanceof ZCS.model.mail.ZtConv,
					isMessage = item instanceof ZCS.model.mail.ZtMailMsg,
					conv,
					convHasOneMessage,
					listIndex;

				if (isMessage) {
					conv = ZCS.cache.get(item.get('convId'));
				} else {
					conv = item;
				}

				if (!isMessage || conv.get('numMsgs') === 1) {
					ZCS.app.getConvListController().removeConv(conv);
				}

				Ext.Logger.info('mail item moved successfully');
				item.set('op', null);
			}
		});
	},

	/**
	 * Starts a reply session with the active message as the original message.
	 */
	doReply: function(msg) {
		ZCS.app.getComposeController().reply(msg || this.getActiveMsg());
	},

	/**
	 * Starts a reply-all session with the active message as the original message.
	 */
	doReplyAll: function(msg) {
		ZCS.app.getComposeController().replyAll(msg || this.getActiveMsg());
	},

	/**
	 * Do a delete originating form a button.  This drops the button parameter and
	 * allows doDelete to be used by both a button and the standard menu behavior.
	 */
	doButtonDelete: function() {
		this.doDelete();
	},

	/**
	 * Moves the mail item to Trash.
	 *
	 * @param {ZtMailItem}   item     mail item
	 */
	doDelete: function(item) {
		this.lastDeletedItem = item;

		item = item || this.getItem();

		this.performOp(item, 'trash', function (item) {
			//Because a conversation trash can occur when messages are not present in the UI,
			//our standard notificaiton logic won't work, so manually force a removal.
			if (item.get('type') === ZCS.constant.ITEM_CONVERSATION) {
				ZCS.app.getConvListController().removeConv(item);
			}
			//TODO: Where should we get trash from? ZtUserSession in ZtUserOrganizers?
			ZCS.app.fireEvent('showToast', Ext.String.format(ZtMsg.moveMessage, 'Trash'), this.undoDelete, this);
		});
	},

	undoDelete: function () {

	},

	/**
	 * Moves the mail item to Junk.
	 *
	 * @param {ZtMailItem}   item     mail item
	 */
	doSpam: function(item) {
		this.performOp(item, 'spam');
	},

	/**
	 * Toggles read/unread on the mail item.
	 *
	 * @param {ZtMailItem}   item     mail item
	 */
	doMarkRead: function(item) {

		item = item || this.getItem();
		var	wasUnread = item.get('isUnread');

		item.set('op', wasUnread ? 'read' : '!read');
		item.save({
			success: function(item, operation) {
				Ext.Logger.info('mail item marked read successfully');
				item.set('op', null);
			}
		});
	}
});
