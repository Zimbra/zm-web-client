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
 * This class represents a controller that manages a list of conversations.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.controller.mail.ZtConvListController', {

	extend: 'ZCS.controller.ZtListController',

	// slight hack to load some needed files early, rather than dynamically loading as needed via an
	// asynchronous request (which introduces timing problems)
	requires: [
		'ZCS.view.mail.ZtMsgListView'
	],

	config: {

		models: ['ZCS.model.mail.ZtConv'],
		stores: ['ZCS.store.mail.ZtConvStore'],

		refs: {
			// event handlers
			listPanel: 'sheet #' + ZCS.constant.APP_MAIL + 'listpanel',
			listView: ZCS.constant.APP_MAIL + 'listview',
			folderList: 'sheet #' + ZCS.constant.APP_MAIL + 'overview nestedlist',
			itemPanel: 'appview #' + ZCS.constant.APP_MAIL + 'itempanel',

			// other
			overview: '#' + ZCS.constant.APP_MAIL + 'overview',
			titlebar: 'sheet #' + ZCS.constant.APP_MAIL + 'listpanel titlebar',
			searchBox: 'sheet #' + ZCS.constant.APP_MAIL + 'listpanel searchfield'
		},

		control: {
			listPanel: {
				newItem: 'doCompose'
			},
			listView: {
				itemtouchstart: 'onItemTouchStart',
				itemtouchmove:  'onItemTouchMove',
				itemtouchend:   'onItemTouchEnd'
			}
		},

		app: ZCS.constant.APP_MAIL
	},

	launch: function() {

		this.callParent();

		ZCS.app.on('notifyConversationDelete', this.handleDeleteNotification, this);
		ZCS.app.on('notifyConversationCreate', this.handleConvCreateNotification, this);
		ZCS.app.on('notifyMessageCreate', this.handleMsgCreateNotification, this);
		ZCS.app.on('notifyConversationChange', this.handleModifyNotification, this);

		ZCS.app.on('notifyRefresh', this.handleRefresh, this);
	},

	doDelete: function (list, item, target, record) {
		ZCS.app.fireEvent('deleteMailItem', record);
	},

	getDefaultQuery: function() {
		return ZCS.session.getSetting(ZCS.constant.SETTING_INITIAL_SEARCH);
	},

	getItemController: function() {
		return ZCS.app.getConvController();
	},

	doCompose: function() {
		ZCS.app.getComposeController().compose();
	},

	onItemTouchStart: function (list, index, convItem, record, e, eOpts) {
		this.listItemLastMouseX = e.pageX;
		this.listItemLastMouseY = e.pageY;
		this.listItemLastX = 0;
	},

	/**
	 * The event 'itemtouchmove' only fires once at the start of moving. Detect
	 *  if it represents primarily an X axis move, or Y axis move. If X, suspend
	 *  scrolling and attach a continous touchmove listener.
	 */
	onItemTouchMove: function (list, index, convItem, record, e, eOpts) {
		var me = this;

		if (Math.abs(e.pageX - this.listItemLastMouseX) > Math.abs(e.pageY - this.listItemLastMouseY)) {
			// Minimizing processing required in continuous touchmove handler
			sliderDivWidth = convItem.element.down('.zcs-mail-list-slideable').getWidth();
			this.deleteThreshold = convItem.element.getWidth() / -2;
			this.currentSlidingEl = convItem.element.down('.zcs-mail-list-slideable');
			this.currentSlidingItem = convItem;

			convItem.addCls('x-item-swiping');
			convItem.removeCls('x-item-pressed');

			list.setScrollable(false);
			list.container.innerElement.on({
				touchmove: this.slideConvItem, //Ext.Function.createThrottled(this.onItemTouchMove, 20, this),
				delegate: '.' + Ext.baseCSSPrefix + 'list-item',
				scope: this
			});
		}
	},

	slideConvItem: function (e) {
		var moveDistance = e.pageX - this.listItemLastMouseX,
			newX = this.listItemLastX + moveDistance;

		// Apply delete style at halfway
		if (newX <= this.deleteThreshold) {
			this.currentSlidingEl.translate(newX);
            this.currentSlidingEl.slideOffset = newX;
            
            if (!this.currentSlidingItem.deleteActive) {
				this.currentSlidingItem.addCls('delete-active');
				//Save state so we don't keep re-applying this class and hitting the dom
				this.currentSlidingItem.deleteActive = true;
			}
		// Don't let item move right past start
		} else if (newX > 0) {
			this.currentSlidingEl.translate(0);
            this.currentSlidingEl.slideOffset = 0;
		// Only take action if X movement is not 0
		} else if (moveDistance != 0) {
			this.currentSlidingEl.translate(newX);
            this.currentSlidingEl.slideOffset = newX;

            if (this.currentSlidingItem.deleteActive) {
				this.currentSlidingItem.removeCls('delete-active');
				this.currentSlidingItem.deleteActive = false;
			}
		}
		this.listItemLastMouseX = e.pageX;
		this.listItemLastX = newX;
	},

	onItemTouchEnd: function (list, index, convItem, record, e, eOpts) {
		var slidingEl = convItem.element.down('.zcs-mail-list-slideable');
		list.container.innerElement.un({
			touchmove: this.slideConvItem,
			delegate: '.' + Ext.baseCSSPrefix + 'list-item',
			scope: this
		});
		list.setScrollable(true);
		if (slidingEl.slideOffset <= this.deleteThreshold) {
			ZCS.app.fireEvent('swipeDeleteMailItem', record, list, convItem);
		} else {
			convItem.removeCls('delete-active');
	        convItem.removeCls('x-item-pressed');
	        convItem.removeCls('x-item-swiping');
		}
		if (this.lastItemLastX !== 0) {
			slidingEl.translate(0);
		}
		convItem.deleteActive = false;
	},

	/**
	 * Handle a newly created conv. Add it to view if it matches the current search. Unfortunately, a conv
	 * node from a notification does not contain msg data (a conv node from search results has msg data),
	 * so we need to construct it from msg create notifications that we got with the conv create.
	 *
	 * @param {ZtItem}  item        (not passed for create notifications)
	 * @param {Object}  create      JSON create node
	 */
	handleConvCreateNotification: function(item, convCreate) {

		var creates = convCreate.creates,
			ln = creates && creates.m ? creates.m.length : 0,
			msgs = [],
			msgCreate, i, addresses, recips, fragment;

		var curSearch = ZCS.session.getSetting(ZCS.constant.SETTING_CUR_SEARCH, this.getApp()),
			curFolder = this.getFolder() || ZCS.session.getCurrentSearchOrganizer(),
			isOutbound = curFolder && ZCS.util.isOutboundFolderId(curFolder.get('zcsId'));

		// gather up the conv's msgs from their create nodes (typically just one msg)
		for (i = 0; i < ln; i++) {
			msgCreate = creates.m[i];
			if (msgCreate.cid === convCreate.id) {
				msgs.push(msgCreate);
				fragment = fragment || msgCreate.fr;
				// if we're in Sent, gather the recipients so we can show them instead of senders
				if (isOutbound) {
					addresses = ZCS.model.mail.ZtMailItem.convertAddressJsonToModel(msgCreate.e);
					recips = ZCS.mailutil.getSenders(addresses);
				}
				break;
			}
		}
		convCreate.m = msgs;

		var reader = ZCS.model.mail.ZtConv.getProxy().getReader(),
			data = reader.getDataFromNode(convCreate),
			store = this.getStore(),
			conv = new ZCS.model.mail.ZtConv(data, convCreate.id);

		if (recips) {
			conv.set('senders', recips);
		}
		conv.set('fragment', conv.get('fragment') || fragment);

		// if the newly arrived conv matches the current search, add it at the top of our list
		if (curSearch.match(conv)) {
			store.insert(0, [conv]);
		}
	},

	/**
	 * We only care about a new message if it matches our search and if we have
	 * not seen its conv. For example, a conversation may have one or more messages
	 * in folders other than Inbox (such as Sent), and then receive a message into
	 * Inbox. In that case, we want to create a new conversation and add it to our
	 * list.
	 *
	 * @param {ZtItem}  item        (not passed for create notifications)
	 * @param {Object}  create      JSON create node
	 */
	handleMsgCreateNotification: function(item, msgCreate) {

		var reader = ZCS.model.mail.ZtMailMsg.getProxy().getReader(),
			data = reader.getDataFromNode(msgCreate),
			store = this.getStore(),
			msg = new ZCS.model.mail.ZtMailMsg(data, msgCreate.id);

		var curSearch = ZCS.session.getSetting(ZCS.constant.SETTING_CUR_SEARCH, this.getApp()),
			msgMatches = curSearch.match(msg),
			convCreate;

		// conv is already in the store, doesn't need to be added; just bump conv to top if msg matches
		if (store.getById(msgCreate.cid)) {
			if (msgMatches) {
				var conv = ZCS.cache.get(msgCreate.cid);
				if (conv && store.indexOf(conv) > 0) {
					store.insert(0, [conv]);
				}
			}
			return;
		}

		// conv is not in our list
		if (msgMatches) {
			// virtual conv that got promoted will have convCreateNode; we get here if the first msg in the conv
			// did not match the search (so conv is not in list), but the second one does
			if (msgCreate.convCreateNode) {
				convCreate = msgCreate.convCreateNode;
				if (convCreate.newId) {
					convCreate.id = convCreate.newId;
					this.handleConvCreateNotification(null, convCreate);
				}
			}
			else {
				// normally shouldn't get here, since conv create should be handled first; if we somehow get here,
				// create a new conv based on the msg create node
				convCreate = {
					id:         msgCreate.cid,
					d:          msgCreate.d,
					e:          Ext.clone(msgCreate.e),
					f:          msgCreate.f,
					fr:         msgCreate.fr,
					itemType:   ZCS.constant.ITEM_CONVERSATION,
					nodeType:   ZCS.constant.NODE_CONVERSATION,
					su:         msgCreate.su
				};
				this.handleConvCreateNotification(null, convCreate);
			}
		}
	},

	/**
	 * Handle promotion of virtual convs here since we need to interact with the store. Also handle anything
	 * we need a reader for, since we can get at it here.
	 */
	handleModifyNotification: function(item, modify) {

		var store = this.getStore();

		// virtual conv changes ID when it gets a second message; we can't just change the ID
		// field since that breaks the connection to the list item in the UI
		if (modify.newId) {
			var oldConv = ZCS.cache.get(modify.id),
				index = oldConv ? store.indexOf(oldConv) : -1,
				newConv;

			if (index !== -1) {
				newConv = oldConv.copy(modify.newId);
				store.remove(oldConv);
				store.insert(index, newConv);   // replace old conv with new one
				item = newConv;
			}
		}

		// regenerate addresses and senders (the possibly truncated string in the list view)
		if (modify.e) {
			modify.addresses = ZCS.model.mail.ZtMailItem.convertAddressJsonToModel(modify.e);
			modify.senders = ZCS.mailutil.getSenders(modify.addresses);
		}

		// let the conv itself handle the simple stuff
		item.handleModifyNotification(modify);

		// If this item is a draft, go ahead and select it, because the normal ext logic unselects it.
		if (item.data.isDraft) {
			this.getListView().select(item);
		}
	},

	handleRefresh: function() {
		this.redoSearch();
	}
},
	function (thisClass) {
		thisClass.swipeToDeleteTpl = Ext.create('Ext.XTemplate', ZCS.template.ConvListSwipeToDelete);
	}
);
