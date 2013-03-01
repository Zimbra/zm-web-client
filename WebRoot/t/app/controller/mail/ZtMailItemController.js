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
	 * Starts a forward session with the active message as the original message.
	 */
	doForward: function(msg) {
		ZCS.app.getComposeController().forward(msg || this.getActiveMsg());
	},

	/**
	 * Moves the mail item to Trash.
	 *
	 * @param {ZtMailMsg}   msg     mail msg (present if delete action triggered by button)
	 */
	doDelete: function(msg) {
		this.performOp(msg, 'trash', function (item) {
			//Because a conversation trash can occur when messages are not present in the UI,
			//our standard notificaiton logic won't work, so manually force a removal.
			if (item.get('type') === ZCS.constant.ITEM_CONVERSATION) {
				ZCS.app.getConvListController().removeConv(item);
			}
		});
	},

	/**
	 * Moves the mail item to Junk.
	 *
	 * @param {ZtMailMsg}   msg     mail msg (present if spam action triggered by button)
	 */
	doSpam: function(msg) {
		this.performOp(msg, 'spam');
	},

	/**
	 * Toggles read/unread on the conv.
	 */
	doMarkRead: function(msg) {
		Ext.Logger.info("mail item controller MARK_READ");
		var item = msg || this.getItem(),
			wasUnread = item.get('isUnread');

		item.set('op', wasUnread ? 'read' : '!read');
		item.save({
			success: function(item, operation) {
				Ext.Logger.info('mail item saved successfully');
				item.set('op', null);
			}
		});
	}
});
