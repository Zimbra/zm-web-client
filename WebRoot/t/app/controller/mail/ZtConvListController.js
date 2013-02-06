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
			}
		},

		app: ZCS.constant.APP_MAIL
	},

	getItemController: function() {
		return ZCS.app.getController('ZCS.controller.mail.ZtConvController');
	},

	getComposeController: function() {
		return ZCS.app.getController('ZCS.controller.mail.ZtComposeController');
	},

	doCompose: function() {
		this.getComposeController().compose();
	},

	handleCreateNotification: function(create) {

		var reader = ZCS.model.mail.ZtConv.getProxy().getReader(),
			data = reader.getDataFromNode(create),
			store = this.getStore(),
			conv = new ZCS.model.mail.ZtConv(data, create.id);

		store.insert(0, [conv]);
	},

	/**
	 * Handle promotion of virtual convs here since we need to interact with the store. Also handle anything
	 * we need a reader for, since we can get at it here.
	 *
	 * @param {ZtConv}  item    conversation
	 * @param {object}  modify  JSON notification
	 */
	handleModifyNotification: function(item, modify) {

		var store = this.getStore(),
			reader = store.getProxy().getReader();

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
			modify.addresses = reader.convertAddresses(modify.e);
			modify.senders = reader.getSenders(modify.addresses);
		}

		// let the conv itself handle the simple stuff
		item.handleModifyNotification(modify);
	}
});
