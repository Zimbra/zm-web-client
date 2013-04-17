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
			itemPanelToolbar:   'appview #' + ZCS.constant.APP_MAIL + 'itempanel titlebar',
			itemPanel:          'appview #' + ZCS.constant.APP_MAIL + 'itempanel',
			msgListView:        ZCS.constant.APP_MAIL + 'itemview',
			quickReply:         '#quickReply',
			quickReplyTextarea: '#quickReply textareafield'
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
		ZCS.app.on('sendQuickReply', this.doSendQuickReply, this);
		ZCS.app.on('notifyMessageDelete', this.handleDeleteNotification, this);
		ZCS.app.on('notifyMessageCreate', this.handleCreateNotification, this);
		ZCS.app.on('notifyMessageChange', this.handleModifyNotification, this);
		ZCS.app.on('notifyConversationChange', this.handleConvChange, this);

		var quickReplyTextarea = this.getQuickReplyTextarea();
		if (quickReplyTextarea) {
			quickReplyTextarea.on('focus', function() {
				quickReplyTextarea.setHeight(ZCS.constant.QUICK_REPLY_LARGE);
				if (!quickReplyTextarea.getValue()) {
					this.setQuickReplyPlaceholderText('');
				}
			}, this);
			quickReplyTextarea.on('blur', function() {
				quickReplyTextarea.setHeight(ZCS.constant.QUICK_REPLY_SMALL);
				if (!quickReplyTextarea.getValue()) {
					this.setQuickReplyPlaceholderText(this.getQuickReplyPlaceholderText());
				}
			}, this);
		}
	},

	/**
	 * Clears messages from the store, so they're removed from the view as well.
	 */
	clear: function() {

		this.callParent();

		this.getStore().removeAll();
		var quickReply = this.getQuickReply();
		if (quickReply) {
			quickReply.hide();
		}
	},

	/**
	 * Displays the given conv as a list of messages. Sets toolbar text to the conv subject.
	 *
	 * @param {ZtConv}  conv        conv to show
	 */
	showItem: function(conv) {

        //<debug>
		Ext.Logger.info("conv controller: show conv " + conv.getId());
        //</debug>

		var curFolder = ZCS.session.getCurrentSearchOrganizer(),
			curFolderId = curFolder && curFolder.get('itemId'),
			store = this.getStore();

		if (curFolderId === ZCS.constant.ID_DRAFTS) {
			var itemPanel = this.getItemPanel();
			this.clear();
			this.setItem(conv);
			store.load({
				convId: conv.getId(),
				callback: function() {
					ZCS.app.getComposeController().compose(conv.getMessages()[0]);
				}
			});
		}

		this.callParent(arguments);

		var toolbar = this.getItemPanelToolbar(),
			itemPanel = this.getItemPanel(),
			convQueryTerms = [ 'underid:1' ],
			title = conv.get('subject') || ZtMsg.noSubject;

		//Make sure the organizer button stays.
		ZCS.app.fireEvent('updatelistpanelToggle', this.getOrganizerTitle(), ZCS.session.getActiveApp());

		toolbar.setTitle(title);

		Ext.each(ZCS.constant.CONV_HIDE, function(id) {
			if (id !== curFolderId) {
				convQueryTerms.push('NOT underid:' + id);
			}
		}, this);

		var quickReply = this.getQuickReply();
		if (quickReply) {
			quickReply.show();
		}

		store.load({
			convId: conv.getId(),
			convQuery: convQueryTerms.join(' AND '),
			callback: function(records, operation, success) {
				if (success) {
					var msgViews = this.getMsgListView().query('msgview');
					Ext.each(records, function(msg, index) {
						var msgView = msgViews && msgViews[index];
						if (msgView) {
							msgView.render(msg);
						}
					}, this);
					itemPanel.showButtons();
					if (quickReply) {
						this.setQuickReplyPlaceholderText(this.getQuickReplyPlaceholderText());
					}
					this.adjustItemHeights(msgViews);
				}
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
	 * Returns the message that a conversation-level reply should use.
	 * It will be the first msg not in Sent, Drafts, Trash, or Junk (unless the user
	 * is viewing one of those folders, in which case that one is okay).
	 *
	 * @param {Function}    callback    callback to run with result if msg needs to be loaded
	 * @return {ZtMailMsg}      msg to reply to
	 */
	getActiveMsg: function(callback) {

		var conv = this.getItem(),
			msgs = conv.getMessages(),
			ln = msgs ? msgs.length : 0, i, msg, folderId,
			curFolder = ZCS.session.getCurrentSearchOrganizer(),
			curFolderId = curFolder && curFolder.get('itemId'),
			ignoreFolder = ZCS.util.arrayAsLookupHash(ZCS.constant.CONV_REPLY_OMIT),
			activeMsg = null;

		for (i = 0; i < ln; i++) {
			msg = msgs[i];
			folderId = msg.get('folderId');
			if (!ignoreFolder[folderId] || (curFolderId === folderId)) {
				activeMsg = msg;
			}
		}
		activeMsg = activeMsg || (ln > 0 ? msgs[0] : null);

		if (callback) {
			if (activeMsg.get('isLoaded')) {
				callback(activeMsg);
			}
			else {
				activeMsg.save({
					op: 'load',
					id: activeMsg.getId(),
					success: function() {
						callback(activeMsg);
					}
				});
			}
		}
		else {
			return activeMsg;
		}
	},

	/**
	 * Handle arrival of a new message. First, find its owning conversation. If we're currently
	 * showing that conv in the item pane, add the message to the top of the list. If the conv
	 * is in the conv list view, move it to the top.
	 */
	handleCreateNotification: function(item, create) {

		var item = this.getItem(),
			curId = item && item.getId(),
			convId = create.cid,
			conv = ZCS.cache.get(convId),
			convListCtlr = ZCS.app.getConvListController(),
			convStore = convListCtlr.getStore();

		// Move the conv to the top since it got a new msg and we always sort date descending.
		// Also propagate some fields from the message that don't appear in the conv's modified
		// notification. We only do this for a real conv (more than two messages). If a conv has
		// just been promoted from virtual to real, then ZtConvListController::handleModifyNotification
		// handles moving it to the top.
		if (convStore.getById(convId) && conv.get('numMsgs') > 2) {
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
	 * Handle message change notifications.
	 */
	handleModifyNotification: function(item, modify) {

		var store = this.getStore(),
			itemPresent = store.getById(item.getId());

		// msg has been moved
		if (modify.l) {

			item.set('folderId', modify.l);

			if (itemPresent) {
				// if the msg was moved to Trash or Junk, remove it from the list in the item panel
				var localId = ZCS.util.localId(modify.l),
					omit = ZCS.util.arrayAsLookupHash(ZCS.constant.CONV_HIDE);

				if (omit[localId]) {
					store.remove(item);
				}
			}

			this.checkConv(item, false);
		}

		// tag has been added or removed
		if (modify.t != null) {
			item.set('tags', ZCS.model.ZtItem.parseTags(modify.t))
			if (itemPresent) {
				var msgViews = this.getMsgListView().query('msgview'),
					itemIndex = store.indexOf(item),
					msgView = msgViews && (itemIndex != null) && msgViews[itemIndex];

				if (msgView) {
					msgView.renderHeader();
				}
			}
		}

		item.handleModifyNotification(modify);
	},

	/**
	 * If a virtual conversation has been promoted and it's the one we're viewing,
	 * make sure that we use the real conversation.
	 */
	handleConvChange: function(item, modify) {

		if (modify.newId) {
			var newConv = ZCS.cache.get(modify.newId),
				curId = item.getId();

			if (newConv && curId === modify.id) {
				this.setItem(newConv);
				ZCS.cache.remove(curId);
			}
		}
	},

	/**
	 * Handle message delete notifications.
	 *
	 * @param {ZtMailMsg}   msg    msg that was deleted
	 */
	handleDeleteNotification: function(msg) {
		this.checkConv(msg, true);
		this.callParent(arguments);
	},

	/**
	 * Handle message move/delete by checking to see if the conv still has at least one message in the folder
	 * currently being viewed. If it doesn't, remove it from the list view.
	 *
	 * @param {ZtMailMsg}   item        message
	 * @param {Boolean}     isDelete    if true, this is a (hard) delete; otherwise it's a move
	 * @private
	 */
	checkConv: function(item, isDelete) {

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
				folderId, isGone, index, convListView, wasSelected;

			if (curFolderId) {
				for (i = 0; i < ln; i++) {
					folderId = messages[i].get('folderId');
					isGone = (isDelete && folderId === ZCS.constant.ID_TRASH);
					if (folderId === curFolderId && !isGone) {
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
	},

	doReply: function() {

		if (this.isFeedAction()) {
			return;
		}

		this.getActiveMsg(function(msg) {
			ZCS.app.getComposeController().reply(msg);
		});
	},

	doReplyAll: function() {

		if (this.isFeedAction()) {
			return;
		}

		this.getActiveMsg(function(msg) {
			ZCS.app.getComposeController().replyAll(msg);
		});
	},

	/**
	 * Checks if the user is currently in a feed folder, presumably trying to do something
	 * that's disallowed like replying. If so, put up an alert.
	 *
	 * @return {Boolean}    true if the user is in a feed folder
	 */
	isFeedAction: function() {
		var curFolder = ZCS.session.getCurrentSearchOrganizer(),
			isFeed = curFolder && curFolder.isFeed();
		if (isFeed) {
			Ext.Msg.alert(ZtMsg.alertFeedReplyTitle, ZtMsg.alertFeedReplyText);
		}
		return isFeed;
	},

	/**
	 * If deleting a conv while viewing Trash, permanently delete any of its messages that are in Trash.
	 */
	doDelete: function() {

		var conv = this.getItem(),
			inTrash = ZCS.util.curFolderIs(ZCS.constant.ID_TRASH),
			inJunk = ZCS.util.curFolderIs(ZCS.constant.ID_JUNK);

		if (inTrash || inJunk) {
			var folderName = ZCS.session.getCurrentSearchOrganizer().get('name'),
				deleteMsg = Ext.String.format(ZtMsg.hardDeleteConvText, folderName);

			Ext.Msg.confirm(ZtMsg.hardDeleteConvTitle, deleteMsg, function(buttonId) {
				if (buttonId === 'yes') {
					var data = {
						op:     'delete',
						tcon:   inTrash ? 't' : 'j'
					};
					this.performOp(conv, data, function() {
						ZCS.app.fireEvent('showToast', ZtMsg.convDeleted);
						ZCS.app.getConvListController().removeConv(conv);
					});
				}
			}, this);
		}
		else {
			this.callParent(arguments);
		}
	},

	// TODO: What if a new message came in?
	doSendQuickReply: function() {

		var action = ZCS.constant.OP_REPLY_ALL,
			textarea = this.getQuickReplyTextarea(),
			text = textarea ? textarea.getValue() : '';

		if (text) {
			this.getActiveMsg(function(origMsg) {

				var ctlr = ZCS.app.getComposeController(),
					addrs = ctlr.getReplyAddresses(origMsg, action);

				var values = {
					subject:    ctlr.getSubject(origMsg, ZtMsg.rePrefix),
					content:    text + ctlr.quoteOrigMsg(origMsg, action)
				};
				Ext.apply(values, addrs);

				var msg = ctlr.setOutboundMessage(null, values, action, origMsg, null);
				ctlr.sendMessage(msg, function() {
					textarea.setValue('');
					textarea.blur();
				}, this);
			});
		}
	},

	/**
	 * Returns text to put in the quick reply textarea as a placeholder.
	 *
	 * @return {String}     placeholder text
	 */
	getQuickReplyPlaceholderText: function() {

		var activeMsg = this.getActiveMsg(),
			fromAddr = activeMsg && activeMsg.getAddressByType(ZCS.constant.FROM),
			fromName = fromAddr && fromAddr.get('viewName'),
			placeholder = fromName && Ext.String.format(ZtMsg.quickReplyPlaceholder, fromName);

		return placeholder || '';
	},

	/**
	 * Sets the placeholder text in the quick reply textarea.
	 */
	setQuickReplyPlaceholderText: function(text) {

		var quickReplyTextarea = this.getQuickReplyTextarea(),
			textarea = quickReplyTextarea.element.down('textarea').dom;

		textarea.placeholder = text;
	},

	/**
	 * Set tcon so that messages in Trash, Junk, Sent, or Drafts are not moved
	 * unless the user is viewing one of those folders.
	 */
	getTcon: function() {

		var	curLocalId = ZCS.util.curFolderLocalId(),
			tcon = '';

		Ext.each(Object.keys(ZCS.constant.TCON), function(folderId) {
			if (folderId !== curLocalId) {
				tcon += ZCS.constant.TCON[folderId];
			}
		}, this);

		return '-' + tcon;
	}
});
