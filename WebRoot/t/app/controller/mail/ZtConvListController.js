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

			convItem.addCls('x-item-pressed');

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
			this.currentSlidingEl.setX(newX);
			this.currentSlidingItem.addCls('delete-active');
		// Don't let item move right past start
		} else if (newX > 0) {
			this.currentSlidingEl.setX(0);
		// Only take action if X movement is not 0
		} else if (moveDistance != 0) {
			this.currentSlidingEl.setX(newX);
			this.currentSlidingItem.removeCls('delete-active');
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
		if (slidingEl.getX() <= this.deleteThreshold) {
			ZCS.app.fireEvent('swipeDeleteMailItem', record, list, convItem);
		}
		slidingEl.setX(0);
		convItem.removeCls('x-item-pressed');
	},

	/**
	 * Handle a newly created conv. Add it to view if any of its messages (which
	 * should have also just been created) are in the currently viewed folder.
	 *
	 * @param {ZtItem}  item        (not passed for create notifications)
	 * @param {Object}  create      JSON create node
	 */
	handleConvCreateNotification: function(item, convCreate) {

		var curFolder = this.getFolder() || ZCS.session.getCurrentSearchOrganizer(),
			curFolderId = curFolder && curFolder.get('zcsId'),
			isOutbound = ZCS.util.isOutboundFolderId(curFolderId),
			creates = convCreate.creates,
			doAdd = false,
			ln = creates && creates.m ? creates.m.length : 0,
			msgCreate, i, addresses, recips, fragment;

		for (i = 0; i < ln; i++) {
			msgCreate = creates.m[i];
			if (msgCreate.cid === convCreate.id && msgCreate.l === curFolderId) {
				doAdd = true;
				if (isOutbound) {
					addresses = ZCS.model.mail.ZtMailItem.convertAddressJsonToModel(msgCreate.e);
					recips = ZCS.mailutil.getSenders(addresses);
					fragment = msgCreate.fr;
				}
				break;
			}
		}

		var reader = ZCS.model.mail.ZtConv.getProxy().getReader(),
			data = reader.getDataFromNode(convCreate),
			store = this.getStore(),
			conv = new ZCS.model.mail.ZtConv(data, convCreate.id);

		if (recips) {
			conv.set('senders', recips);
		}
		conv.set('fragment', conv.get('fragment') || fragment);

		if (doAdd || convCreate.doAdd) {
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

		var store = this.getStore();

		if (store.getById(msgCreate.cid)) {
			return;
		}

		var curFolder = this.getFolder() || ZCS.session.getCurrentSearchOrganizer(),
			curFolderId = curFolder && curFolder.get('zcsId'),
			convCreate;

		if (msgCreate.l === curFolderId) {
			// virtual conv that got promoted will have convCreateNode
			if (msgCreate.convCreateNode) {
				convCreate = msgCreate.convCreateNode;
				if (convCreate.newId) {
					convCreate.id = convCreate.newId;
					convCreate.doAdd = true;
					this.handleConvCreateNotification(null, convCreate);
				}
			}
			else {
				// create from msg node
				convCreate = {
					id:         msgCreate.cid,
					d:          msgCreate.d,
					e:          Ext.clone(msgCreate.e),
					f:          msgCreate.f,
					fr:         msgCreate.fr,
					itemType:   ZCS.constant.ITEM_CONVERSATION,
					nodeType:   ZCS.constant.NODE_CONVERSATION,
					su:         msgCreate.su,
					doAdd:      true
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
				newConv;

			if (store.getById(oldConv.getId())) {
				newConv = oldConv && oldConv.copy(modify.newId);
				store.remove(oldConv);
				store.insert(0, newConv);   // moves conv to top
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

		//If this item is a draft, go ahead and select it, because the normal ext logic unselects it.
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
