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
			},
			itemPanelToolbar: {
				'delete':   'doButtonDelete',
				reply:      'doReply',
				replyAll:   'doReplyAll'
			}
		},

		menuConfigs: {
			convActions: [
				{ label: ZtMsg.markRead,    action: ZCS.constant.OP_MARK_READ,  listener: 'doMarkRead' },
				{ label: ZtMsg.move,        action: ZCS.constant.OP_MOVE,       listener: 'doMove' },
				{ label: ZtMsg.flag,        action: ZCS.constant.OP_FLAG,       listener: 'doFlag' },
				{ label: ZtMsg.tag,         action: ZCS.constant.OP_TAG,        listener: 'doTag' }
			]
		}
	},

	launch: function () {
		ZCS.app.on('deleteMailItem', this.doDelete, this);
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

		var curFolder = ZCS.session.getCurrentSearchOrganizer(),
			curFolderId = curFolder && curFolder.getId(),
			store = this.getStore();

		if (curFolderId === ZCS.constant.ID_DRAFTS) {
			var itemPanel = this.getItemPanel();
			itemPanel.suppressRedraw = true;
			this.clear();
			this.setItem(conv);
			store.load({
				convId: conv.getId(),
				callback: function() {
					ZCS.app.getComposeController().compose(conv.getMessages()[0]);
					itemPanel.suppressRedraw = false;
				}
			});
			return;
		}

		this.callParent(arguments);

		var toolbar = this.getItemPanelToolbar(),
			itemPanel = this.getItemPanel();

		toolbar.setTitle(conv.get('subject'));

		store.load({
			convId: conv.getId(),
			callback: function(records, operation, success) {
				itemPanel.showButtons();
				Ext.Logger.info('Conv load callback');
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
	 * Returns the message that a conversation-level operation should be applied to.
	 */
	getActiveMsg: function() {
		var conv = this.getItem(),
			msgs = conv.getMessages(),
			msg = null;
			msg = (msgs && msgs.length) ? msgs[0] : null;

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

			// Handle message move by checking to see if the conv still has at least one message in the folder
			// currently being viewed. If it doesn't, remove it from the list view.
			var convId = item.get('convId'),
				convListCtlr = ZCS.app.getConvListController(),
				convStore = convListCtlr.getStore();

			if (convStore.getById(convId)) {
				var	conv = ZCS.cache.get(convId),
					messages = conv && conv.getMessages(),
					ln = messages ? messages.length : 0, i,
					curFolder = ZCS.session.getCurrentSearchOrganizer(),
					curFolderId = curFolder && curFolder.get('itemId'),
					removeConv = true,
					index, convListView, wasSelected;

				if (curFolderId) {
					for (i = 0; i < ln; i++) {
						if (messages[i].get('folderId') === curFolderId) {
							removeConv = false;
							break;
						}
					}
				}
				else {
					removeConv = false;
				}

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
