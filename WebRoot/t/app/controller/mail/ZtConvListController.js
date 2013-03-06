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
			listPanel: 'appview #' + ZCS.constant.APP_MAIL + 'listpanel',
			listView: ZCS.constant.APP_MAIL + 'listview',
			folderList: 'appview #' + ZCS.constant.APP_MAIL + 'overview nestedlist',
			itemPanel: 'appview #' + ZCS.constant.APP_MAIL + 'itempanel',

			// other
			overview: 'appview #' + ZCS.constant.APP_MAIL + 'overview',
			titlebar: 'appview #' + ZCS.constant.APP_MAIL + 'listpanel titlebar',
			searchBox: 'appview #' + ZCS.constant.APP_MAIL + 'listpanel searchfield'
		},

		control: {
			listPanel: {
				newItem: 'doCompose'
			},
			listView: {
				itemswipe: 'showDelete'
			}
		},

		app: ZCS.constant.APP_MAIL
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

	removeConv: function (conv) {
		var list = this.getListView(),
			conversationStore = list.getStore(),
			currentIndex = conversationStore.indexOf(conv),
			toSelect;

		conversationStore.remove(conv);
		toSelect = conversationStore.getAt(currentIndex);
		list.select(toSelect, false);
	},

	showDelete: function (list, index, convItem, record, e, eOpts) {
		var convEl = convItem.element,
			convElBox = convEl.getBox(),
			swipeDiv = Ext.String.format(
				ZCS.template.ConvListSwipeToDelete,
				convElBox.width,
				convElBox.height
			),
			swipeElm = Ext.dom.Element.create({
				html: swipeDiv
			}),
			dockItem = convEl.down('.x-dock'),
			anim = Ext.create('Ext.Anim');



		dockItem.hide();


		convEl.insertFirst(swipeElm);

		swipeElm.on('tap', function (event, node, options, eOpts) {
			if (event.target.className === 'zcs-swipe-delete') {
				ZCS.app.fireEvent('deleteMailItem', record);
				anim.run(swipeElm, {
					from: {
						opacity: 1
					},
					to: {
						opacity: 0
					},
					duration: 500,
					after: function () {
						dockItem.show();
						swipeElm.destroy();
					}
				});
			}

			if (event.target.className === 'zcs-swipe-spam') {
				ZCS.app.fireEvent('moveMailItemToSpam', record);
				anim.run(swipeElm, {
					from: {
						opacity: 1
					},
					to: {
						opacity: 0
					},
					duration: 500,
					after: function () {
						dockItem.show();
						swipeElm.destroy();
					}
				});
			}
		});

		swipeElm.on('swipe', function () {
			dockItem.show();
			swipeElm.destroy();
		});


	},


	/**
	 * Handle a newly created conv. Add it to view if user is viewing Inbox.
	 *
	 * @param {object}  create      JSON for new conv
	 */
	handleCreateNotification: function(create) {

		if (ZCS.session.getCurrentSearchOrganizer().getId() === ZCS.constant.ID_INBOX) {
			var reader = ZCS.model.mail.ZtConv.getProxy().getReader(),
				data = reader.getDataFromNode(create),
				store = this.getStore(),
				conv = new ZCS.model.mail.ZtConv(data, create.id);

			store.insert(0, [conv]);
		}
	},

	/**
	 * Handle promotion of virtual convs here since we need to interact with the store. Also handle anything
	 * we need a reader for, since we can get at it here.
	 *
	 * @param {ZtConv}  item    conversation
	 * @param {object}  modify  JSON notification
	 */
	handleModifyNotification: function(item, modify) {

		var store = this.getStore();

		// virtual conv changes ID when it gets a second message; we can't just change the ID
		// field since that breaks the connection to the list item in the UI
		if (modify.newId) {
			var oldConv = ZCS.cache.get(modify.id),
				newConv = oldConv && oldConv.copy(modify.newId);

			if (newConv) {
				store.remove(oldConv);
				ZCS.cache.remove(modify.id);
				store.insert(0, newConv);
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
	}
});
