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
			itemPanelToolbar:       'appview #' + ZCS.constant.APP_MAIL + 'itempanel titlebar',
			convTitleBar:           'appview #' + ZCS.constant.APP_MAIL + 'itempanel #itemTitleOnlyBar',
			itemPanel:              'appview #' + ZCS.constant.APP_MAIL + 'itempanel',
			msgListView:            ZCS.constant.APP_MAIL + 'itemview',
			quickReply:             '#quickReply',
			quickReplyTitleBar:     '#quickReply titlebar',
			quickReplyTextarea:     '#quickReply textareafield',
			convActionsMenu:        'list[itemId=convActionsMenu]',
			convReplyActionsMenu:   'list[itemId=convReplyActionsMenu]'
		},

		control: {
			itemPanelToolbar: {
				'delete':   'doButtonDelete',
				reply:      'doReply',
				replyAll:   'doReplyAll',
				edit:       'doEdit'
			},
			'.moveview': {
				conversationAssignment: 'saveItemMove'
			},
			'.tagview': {
				conversationAssignment: 'saveItemTag'
			},
			msgListView: {
				messageSwipeRight:   'doGoBackOneConversation',
				messageSwipeLeft:   'doGoForwardOneConversation'
			},
			convActionsMenu: {
				itemtap: 'onMenuItemSelect'
			},
			convReplyActionsMenu: {
				itemtap: 'onMenuItemSelect'
			}
		},

		// Flag to turn handling of 'updatedata' event within ZtMsgView on and off
		handleUpdateDataEvent: false
	},

	activeDeleteAnimCount: 0,

	launch: function () {

		ZCS.app.on('swipeDeleteMailItem', this.swipeDelete, this);
		ZCS.app.on('sendQuickReply', this.doSendQuickReply, this);
		ZCS.app.on('notifyMessageDelete', this.handleDeleteNotification, this);
		ZCS.app.on('notifyMessageCreate', this.handleCreateNotification, this);
		ZCS.app.on('notifyMessageChange', this.handleModifyNotification, this);
		ZCS.app.on('notifyConversationChange', this.handleConvChange, this);
		ZCS.app.on('rerenderMessages', this.renderMessages, this);

		ZCS.app.on('messageSent', function(isDraft) {
			if (isDraft) {
				this.clear();
			}
		}, this);

		this.getStore().on('addrecords', this.onAddRecords, this);

		var quickReplyTextarea = this.getQuickReplyTextarea(),
			quickReplyTitleBar = this.getQuickReplyTitleBar(),
			quickReply = this.getQuickReply();
		if (quickReplyTextarea) {
			quickReplyTextarea.on('focus', function() {
				quickReplyTextarea.setHeight(ZCS.constant.QUICK_REPLY_LARGE);
				quickReplyTitleBar.show();
				quickReply.addCls('expanded');
				if (!quickReplyTextarea.getValue()) {
					this.setQuickReplyPlaceholderText('');
				}
			}, this);
			quickReplyTextarea.on('blur', function() {
				quickReplyTextarea.setHeight(ZCS.constant.QUICK_REPLY_SMALL);
				quickReplyTitleBar.hide();
				quickReply.removeCls('expanded');
				if (!quickReplyTextarea.getValue()) {
					this.setQuickReplyPlaceholderText(this.getQuickReplyPlaceholderText());
				}
			}, this);
		}
	},

	/**
	 * Clears messages from the store, so they're removed from the view as well.
	 */
	clear: function(noItemsFound) {

		this.getStore().removeAll();

		this.callParent(arguments);

		var quickReply = this.getQuickReply();
		if (quickReply) {
			quickReply.hide();
		}

		this.msgViewById = {};
	},

	/**
	 * Returns the component that holds placeholder text.
	 * @return {Component}
	 */
	getPlaceholder: function() {
		var itemListView = this.getItemPanel().down('list');
		return itemListView ? itemListView.emptyTextCmp : null;
	},

	doGoBackOneConversation: function (e) {
		// Check for an edge swipe.
		if (e.target.getBoundingClientRect().left - e.distance < 50) {
			if (Ext.Viewport.getOrientation() == 'portrait') {
				ZCS.app.fireEvent('showListPanel');
			} else {
				ZCS.app.fireEvent('showOverviewPanel');
			}
		} else {
			this.navigateToAdjacentConversation(-1);
		}
	},

	doGoForwardOneConversation: function () {
		this.navigateToAdjacentConversation(1)
	},

	navigateToAdjacentConversation: function (indexIncrement) {
		var conversationStore = ZCS.app.getConvListController().getStore(),
            conversationList = ZCS.app.getConvListController().getListView(),
			conversationIndex = conversationStore.indexOf(this.currentConversation),
			adjacentConversation = conversationStore.getAt(conversationIndex + indexIncrement);

		if (adjacentConversation) {
            conversationList.select(adjacentConversation, false, false);
		}
	},

	/**
	 * Displays the given conv as a list of messages. Sets toolbar text to the conv subject.
	 *
	 * @param {ZtConv}  conv        conv to show
	 */
	showItem: function(conv) {

		this.currentConversation = conv;

        //<debug>
		Ext.Logger.info("conv controller: show conv " + conv.getId());
        //</debug>

		this.callParent(arguments);

		var curFolder = ZCS.session.getCurrentSearchOrganizer(),
			curFolderId = curFolder && curFolder.get('zcsId'),
			store = this.getStore(),
			isDraft = (curFolderId === ZCS.constant.ID_DRAFTS),
			remoteAccountId = conv.get('isShared') && conv.get('accountId'),
			convQueryTerms = [],
			title = Ext.String.htmlEncode(conv.get('subject') || ZtMsg.noSubject),
			msgListView = this.getMsgListView();

		function makeFolderTerm(id) {
			return 'underid:' + (remoteAccountId ? '"' + [ remoteAccountId, id ].join(':') + '"' : id);
		}

		convQueryTerms.push(makeFolderTerm(ZCS.constant.ID_ROOT));

		Ext.each(Object.keys(ZCS.constant.CONV_HIDE), function(id) {
			if (id !== curFolderId) {
				convQueryTerms.push('NOT ' + makeFolderTerm(id));
			}
		}, this);

		// Make sure the organizer button stays.
		ZCS.app.fireEvent('updatelistpanelToggle', this.getOrganizerTitle(), ZCS.session.getActiveApp());

		var quickReply = this.getQuickReply();
		if (quickReply) {
			quickReply.show();
		}

		// Reset the translation on this list -- in the touch world, scrolling is done
		// by using translate3d.  In Sencha's implementation, there is a scroller object (Ext.scroll.Scroller)
		// and an underlying translation provider.  There appears to be a bug with the list
		// in that if you fire a refresh event on the list, and you have its scrollToTopOnRefresh
		// property set to true, it will tell the Scroller object to scroll, but if the translation
		// object has an old y value, that never gets reset by the scroller.
		// So manually reset it here.
		msgListView.topItemIndex = 0;
		msgListView.getScrollable().getScroller().getTranslatable().y = 0;

		//Additionally, reset our own hacks which prevent bugs with iframes that have parents with
		//translate3d.  Removing this will cause the msg list view to retain its old scroll position
		//when it should not.
     	msgListView.resetScrollHack();

		store.load({
			convId: conv.getId(),
			convQuery: convQueryTerms.join(' AND '),
			callback: function(records, operation, success) {
				if (success) {
					this.updateToolbar({
						title:      title,
						isDraft:    isDraft
					});

					if (quickReply) {
						this.setQuickReplyPlaceholderText(this.getQuickReplyPlaceholderText());
						quickReply.down('titlebar').setTitle(this.getQuickReplyTitleText());
					}

					this.setHandleUpdateDataEvent(false);

					// Hate to use a timer here, but couldn't find an event that fires after the msgListView has
					// rendered. The Sencha List component doesn't fire 'show' or 'painted'.
					Ext.defer(msgListView.scrollToFirstExpandedMsg, 100, msgListView);
				}
			},
			scope: this
		});
	},

	/**
	 * This is inefficient due to the limitations of component-based lists. The number of
	 * msgviews (each one is a ListItem) created initially is based on some minimal height.
	 * We're unlikely to display that many msgs that the user can see.
	 *
	 * @private
	 */
	renderMessages: function() {

		var store = this.getStore(),
			msgViews = this.getMsgListView().query('msgview'),
			ln = msgViews.length, i, msgView, msgId, record;

		this.msgViewById = {};

		for (i = 0; i < ln; i++) {
			msgView = msgViews[i];
			record = store.getAt(i);
			if (msgView && record) {
				msgView.render(record);
				msgId = record.get('zcsId');
				this.msgViewById[msgId] = msgView;
			}
		}

		this.adjustItemHeights(msgViews);
	},

	/**
	 * Returns the msg view that is currently displaying the msg with the given ID.
	 *
	 * @param {String}  msgId       a msg ID
	 * @return {ZtMsgView}
	 */
	getMsgViewById: function(msgId) {
		return this.msgViewById ? this.msgViewById[msgId] : null;
	},

	/**
	 * Establishes a mapping between a msg with the given ID and a msg view.
	 * If no msg view is provided, removes the mapping for the given ID.
	 *
	 * @param {String}      msgId       a msg ID
	 * @param {ZtMsgView}   msgView     a msg view
	 */
	setMsgViewById: function(msgId, msgView) {

		var msgViewById = this.msgViewById = this.msgViewById || {};
		if (!msgView) {
			msgViewById[msgId] = null;
			delete msgViewById[msgId];
		}
		else {
			msgViewById[msgId] = msgView;
		}
	},

	adjustItemHeights: function(msgViews) {
		var msgListView = this.getMsgListView();

		// Was only needed when list was infinite
		if (msgListView.getInfinite() && msgListView.itemsCount) {
			msgListView.updatedItems = msgViews;
			msgListView.handleItemHeights();
			msgListView.handleItemTransforms();
			msgListView.refreshScroller();
		}
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
			msgs = conv && conv.getMessages(),
			ln = msgs ? msgs.length : 0, i, msg, folderId,
			curFolder = ZCS.session.getCurrentSearchOrganizer(),
			curFolderId = curFolder && curFolder.get('zcsId'),
			ignoreFolder = ZCS.constant.CONV_REPLY_OMIT,
			lastMessage = null,
			activeMsg = null;

		for (i = 0; i < ln; i++) {
			msg = msgs[i];
			folderId = msg.get('folderId');
			if (!ignoreFolder[folderId] || (curFolderId === folderId)) {
				if (!activeMsg) {
					activeMsg = msg;
				}
				lastMessage = msg;

			}
		}
		activeMsg = activeMsg || (ln > 0 ? msgs[0] : null);

		if (callback && activeMsg) {
			if (activeMsg.get('isLoaded')) {
				callback(activeMsg, lastMessage);
			}
			else {
				activeMsg.save({
					op: 'load',
					id: activeMsg.getId(),
					success: function() {
						callback(activeMsg, lastMessage);
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
			convStore = convListCtlr.getStore(),
			curFolder = ZCS.session.getCurrentSearchOrganizer(),
			curFolderId = curFolder ? curFolder.get('zcsId') : '',
			createFolderId = ZCS.util.localId(create.l);

		// Ignore new msg in Trash/Junk/Drafts
		if (ZCS.constant.CONV_HIDE[createFolderId] && curFolderId !== create.l) {
			return;
		}

		// Move the conv to the top since it got a new msg and we always sort the conv list date descending.
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

			if (ZCS.session.getSetting(ZCS.constant.SETTING_CONVERSATION_ORDER) === ZCS.constant.DATE_ASC) {
				store.add(msg);
			}
			else {
				store.insert(0, [msg]);
			}
		}
	},

	/**
	 * New msg came into conv, re-render its msgs.
	 */
	onAddRecords: function(store, records, eOpts) {
//		this.getMsgListView().refresh();    // doesn't work for component-based list :(
		this.renderMessages();
	},

	updateMenuLabels: function(menuButton, params, menu) {

		var conv = this.getItem(),
			unreadLabel, flagLabel;

		if (params.menuName === ZCS.constant.MENU_CONV) {

			unreadLabel = conv.get('isUnread') ? ZtMsg.convMarkRead : ZtMsg.convMarkUnread;
			flagLabel = conv.get('isFlagged') ? ZtMsg.convUnflag : ZtMsg.convFlag;

			var store = menu.getStore(),
				unreadAction = menu.getItemAt(store.find('action', ZCS.constant.OP_MARK_READ)),
				flagAction = menu.getItemAt(store.find('action', ZCS.constant.OP_FLAG));

			if (unreadAction) {
				unreadAction.getRecord().set('label', unreadLabel);
			}
			if (flagAction) {
				flagAction.getRecord().set('label', flagLabel);
			}
		}
	},

	/**
	 * Handle message change notifications.
	 */
	handleModifyNotification: function(item, modify) {

		var store = this.getStore(),
			itemPresent = !!store.getById(item.getId());

		// msg has been moved
		if (modify.l) {

			item.set('folderId', modify.l);
			var conv = ZCS.cache.get(item.get('convId'));
			if (conv) {
				conv.set('numMsgsShown', conv.get('numMsgsShown'));
			}

			if (itemPresent) {
				// if the msg was moved to Trash or Junk, remove it from the list in the item panel
				var localId = ZCS.util.localId(modify.l);

				if (ZCS.constant.CONV_HIDE[localId]) {
					this.setHandleUpdateDataEvent(true);
					store.remove(item);
					this.setHandleUpdateDataEvent(false);
				}
			}

			this.checkConv(item, false);
		}

		// tag has been added or removed
		if (modify.t != null) {
			item.set('tags', ZCS.model.ZtItem.parseTags(modify.t, ZCS.constant.APP_MAIL));
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
				curFolderId = curFolder && curFolder.get('zcsId'),
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

		this.getActiveMsg(function(originalMessage, lastMessage) {
			ZCS.app.getComposeController().reply(originalMessage, lastMessage);
		});
	},

	doReplyAll: function() {

		if (this.isFeedAction()) {
			return;
		}

		this.getActiveMsg(function(originalMessage, lastMessage) {
			ZCS.app.getComposeController().replyAll(originalMessage, lastMessage);
		});
	},

	doForward: function(actionParams) {

		if (this.isFeedAction()) {
			return;
		}

		this.getActiveMsg(function(originalMessage, lastMessage) {
			ZCS.app.getComposeController().forward(originalMessage, lastMessage);
		});
	},

	doEdit: function() {
		this.getActiveMsg(function(originalMessage, lastMessage) {
			ZCS.app.getComposeController().compose(originalMessage, lastMessage);
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
	doDelete: function(item, isSwipeDelete) {

		var conv = item || this.getItem(),
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
						ZCS.app.getConvListController().removeItem(conv);
					});
				}
			}, this);
		}
		else {
			this.callParent(arguments);
		}
	},

	swipeDelete: function(record, list, convItem) {
		var listStore = list.getStore(),
			itemIndex = listStore.indexOf(record),
			placeholder,
			listItem,
			deletedId = record.get('zcsId'),
			storeStillHasItem;

		// Replace the deleted item with a placeholder to indicate deletion
		listStore.remove(record);
		placeholder = listStore.insert(itemIndex, {deletedIndicator: true, zcsId: deletedId});

		// Handle visual experience of delete
		Ext.defer(function () {
			
			storeStillHasItem = deletedId === listStore.getAt(itemIndex).get('zcsId');
			if (storeStillHasItem) {
				// Suspend events so list doesn't re-order during animation
				this.activeDeleteAnimCount++;
				listStore.suspendEvents();

				if (convItem.element && storeStillHasItem) {
					Ext.Anim.run(convItem.element, 'fade', {
						duration: 2000,
						scope: this,
						after: function () {
							this.activeDeleteAnimCount--;
							listStore.remove(placeholder);

							if (this.activeDeleteAnimCount == 0) {
								// Let list refresh after all animations are done
								listStore.resumeEvents();
							} else {
								// Stay blank instead of letting text show again
								convItem.element.down('.zcs-mail-listitem-deleted').setHtml("");
							}
						}
					});
				}
			}
		}, 2000, this);

		// Handle the actual conversation deletion
		this.doDelete(record, true);
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

				// compose ctlr expects HTML (composer uses editable DIV), so convert text
				var values = {
					subject:    ctlr.getSubject(origMsg, ZtMsg.rePrefix),
					content:    ZCS.mailutil.textToHtml(text) + ctlr.quoteOrigMsg(origMsg, action)
				};
				Ext.apply(values, addrs);

				var msg = ctlr.setOutboundMessage(values, action, origMsg, null);
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
		return Ext.String.format(ZtMsg.quickReplyPlaceholder, this.getAllNames());
	},

	getQuickReplyTitleText: function() {
		return Ext.String.format(ZtMsg.quickReplyTitle, this.getAllNames('longName'));
	},

	/**
	 * Returns a string of all names involved in the conversation. Comma
	 * separated, with TO addresss first: "User1, CCUser1, and CCUser2"
	 */
	getAllNames: function(nameField) {

		var activeMsg = this.getActiveMsg(),
			action = ZCS.constant.OP_REPLY_ALL,
			addrs = ZCS.app.getComposeController().getReplyAddresses(activeMsg, action),
			recips = Ext.Array.clean(addrs[ZCS.constant.TO].concat(addrs[ZCS.constant.CC])),
			names = [], nameString, nameField = nameField || 'shortName';

		Ext.each(recips, function(recip) {
			names.push(recip.get(nameField));
		}, this);

		if (names.length < 3) {
			nameString = names.join(' ' + ZtMsg.and + ' ');
		}
		else {
			nameString = names.join(', ');
			nameString = nameString.replace(/,\s([^,]+)$/, ', ' + ZtMsg.and + ' $1');
		}

		return nameString;
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
	},

	updateToolbar: function(params) {

		this.callParent(arguments);

		params = params || {};
		var app = ZCS.util.getAppFromObject(this),
			hideAll = !this.getItem() || params.hideAll;

		Ext.each(ZCS.constant.ITEM_BUTTONS[app], function(button) {
			this.showButton(button.op, !hideAll);
		}, this);

		if (hideAll) {
			return;
		}

		if (params.isDraft) {
			this.showButton(ZCS.constant.OP_REPLY, false);
			this.showButton(ZCS.constant.OP_REPLY_ALL, false);
		}
		else {
			this.showButton(ZCS.constant.OP_EDIT, false);

		}
	},

	updateTitle: function (params) {
		var convTitleBar = this.getConvTitleBar(),
			msgListView = this.getMsgListView(),
			listScrollInner = msgListView.element.down('.x-scroll-view .x-inner');

		if (convTitleBar && params && params.title != null) {
			convTitleBar.setHtml(params.title);
			if (params.title) {
				convTitleBar.show();
			} else {
				convTitleBar.hide();
			}
		}

		// Add padding inside scroll inner so items start below transparent titlebar
		listScrollInner.addCls('top-padding-'+convTitleBar.element.getHeight());
	}
});
