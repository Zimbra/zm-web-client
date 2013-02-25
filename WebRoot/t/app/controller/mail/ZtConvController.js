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
 * This class manages the display and manipulation of a single conversation, which is made up of one or more messages.
 * It is sort of a hybrid of an item controller (the item is a conversation), and a list controller (the list is the
 * conversation's messages).
 *
 * @see ZtConv
 * @see ZtMailMsg
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.controller.mail.ZtConvController', {

	extend: 'ZCS.controller.mail.ZtMailItemController',

	config: {

		models: ['ZCS.model.mail.ZtMailMsg'],
		stores: ['ZCS.store.mail.ZtMsgStore'],

		refs: {
			// event handlers
			itemPanelToolbar: 'appview #' + ZCS.constant.APP_MAIL + 'itempanel titlebar',

			itemPanel: 'appview #' + ZCS.constant.APP_MAIL + 'itempanel',

			// other
			msgListView: ZCS.constant.APP_MAIL + 'itemview'
		},

		control: {
			'.moveview': {
				assignment: 'saveItemMove'
			},
			'.tagview': {
				assignment: 'saveItemTag'
			}
		},

		menuData: [
			{label: ZtMsg.reply, action: ZCS.constant.OP_REPLY, listener: 'doReply'},
			{label: ZtMsg.replyAll, action: ZCS.constant.OP_REPLY_ALL, listener: 'doReplyAll'},
			{label: ZtMsg.forward, action: ZCS.constant.OP_FORWARD, listener: 'doForward'},
			{label: ZtMsg.del, action: ZCS.constant.OP_DELETE, listener: 'doDelete'},
			{label: ZtMsg.markRead, action: ZCS.constant.OP_MARK_READ, listener: 'doMarkRead'},
			{label: ZtMsg.move, action: ZCS.constant.OP_MOVE, listener: 'doMove'},
			{label: ZtMsg.tag, action: ZCS.constant.OP_MOVE, listener: 'doTag'}
		]
	},

	/**
	 * Clears messages from the store, so they're removed from the view as well.
	 */
	clear: function() {

		this.callParent();

		this.getStore().removeAll();
	},

	/**
	 * Displays the given conv as a list of messages. Sets toolbar text to the conv subject.
	 *
	 * @param {ZtConv}  conv        conv to show
	 */
	showItem: function(conv) {
		Ext.Logger.info("conv controller: show conv " + conv.getId());
		this.callParent(arguments);

		var toolbar = this.getItemPanelToolbar(),
			itemPanel = this.getItemPanel(),
			store = this.getStore();

		toolbar.setTitle(conv.get('subject'));

		store.load({
			convId: conv.getId(),
			callback: function(records, operation, success) {
				itemPanel.showMenuButton();
				Ext.Logger.info('Conv load callback');
				Ext.defer(this.adjustItemHeights.bind(this, Ext.ComponentQuery.query('msgview')), 500);
			},
			scope: this
		});
	},

	adjustItemHeights: function(msgViews) {
		var msgListView = this.getMsgListView();
		msgListView.updatedItems = msgViews;
		msgListView.updateItemHeights();
		msgListView.refreshScroller(msgListView.getScrollable().getScroller());
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
	 * Returns the message that a conversation-level operation should be applied to.
	 */
	getActiveMsg: function() {
		var conv = this.getItem(),
			msgs = conv.getMessages(),
			msg = null;
			msg = (msgs && msgs.length) ? msgs[0] : null;

//		Ext.each(msgs, function(msg) {
//			if (msg.get('isUnread') === true) {
//				return msg;
//			}
//		}, this);

		return (msgs && msgs[0]) || null;
	},

	/**
	 * Handle arrival of a new message. First, find its owning conversation. If we're currently
	 * showing that conv in the item pane, add the message to the top of the list. If the conv
	 * is in the conv list view, move it to the top.
	 *
	 * @param {object}  create      JSON notification object
	 */
	handleCreateNotification: function(create) {

		var item = this.getItem(),
			curId = item && item.getId(),
			convId = create.cid,
			conv = ZCS.cache.get(convId),
			convListCtlr = ZCS.app.getConvListController(),
			convStore = convListCtlr.getStore();

		// Move the conv to the top since it got a new msg and we always sort date descending.
		// Also propagate some fields from the message that don't appear in the conv's modified
		// notification.
		if (convStore.getById(convId)) {
			conv.handleModifyNotification({
				d: create.d,
				fr: create.fr
			});
			convStore.remove(conv);
			convStore.insert(0, conv);
			// TODO: if conv was selected we should re-select it to match what's in item pane
		}

		if (convId === curId) {
			var reader = ZCS.model.mail.ZtMailMsg.getProxy().getReader(),
				data = reader.getDataFromNode(create),
				store = this.getStore(),
				msg = new ZCS.model.mail.ZtMailMsg(data, create.id);

			store.insert(0, [msg]);
		}
	},

	/**
	 * Handle message notifications.
	 *
	 * @param {ZtMailMsg}   item    message
	 * @param {object}      modify  JSON notification
	 */
	handleModifyNotification: function(item, modify) {

		var store = this.getStore();

		if (modify.l) {

			item.set('folderId', modify.l);

			if (store.getById(item.getId())) {
				// if the msg was moved to Trash or Junk, remove it from the list in the item panel
				var parsedId = ZCS.util.parseId(modify.l);
				if (ZCS.constant.CONV_HIDE[parsedId.localId]) {
					store.remove(item);
				}
			}

			// Figure out if the conv should still be displayed in the list panel. If the user is viewing
			// Trash or Junk, then we leave the conv if it has at least one message in that folder. Otherwise,
			// we leave it as long as all of its messages aren't in Trash/Junk. We can only figure this out
			// if the conversation has been loaded (viewed). Otherwise, we have no idea what folders its
			// messages are in, since we only get message IDs in the conv objects returned by a search that
			// are shown in the list view.
			var convId = item.get('convId'),
				convListCtlr = ZCS.app.getConvListController(),
				convStore = convListCtlr.getStore();

			if (convStore.getById(convId)) {
				var	conv = ZCS.cache.get(convId),
					messages = conv && conv.getMessages(),
					organizer = ZCS.session.getCurrentSearchOrganizer(),
					parsedOrgId = organizer && ZCS.util.parseId(organizer.get('itemId')),
					viewingTrash = parsedOrgId && (parsedOrgId.localId === ZCS.constant.ID_TRASH),
					viewingJunk = parsedOrgId && (parsedOrgId.localId === ZCS.constant.ID_JUNK),
					removeConv = true,
					folderId, index, convListView, wasSelected;

				Ext.each(messages, function(msg) {
					parsedId = ZCS.util.parseId(msg.get('folderId'));
					folderId = parsedId.localId;
					if ((viewingTrash && (folderId.localId === ZCS.constant.ID_TRASH)) ||
						(viewingJunk && (folderId.localId === ZCS.constant.ID_JUNK))) {
						removeConv = false;
					}
					else if (!ZCS.constant.CONV_HIDE[folderId]) {
						removeConv = false;
					}
					return removeConv;
				}, this);

				if (removeConv) {
					// before removing conv, note where it was and whether it was selected
					convListView = convListCtlr.getListView();
					wasSelected = (convListView && convListView.isSelected(conv));
					index = wasSelected && convStore.indexOf(conv);
					// remove conv
					convStore.remove(conv);
					// if we removed selected conv, clear item panel and select next (or last) conv
					if (wasSelected) {
						this.clear();
						convListView.select(Math.min(index, convStore.getCount() - 1));
					}
				}
			}
		}

		item.handleModifyNotification(modify);
	}
});
