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
 * This class represents a controller that manages a list of contacts.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.controller.contacts.ZtContactListController', {

	extend: 'ZCS.controller.ZtListController',

	// slight hack to load some needed files early, rather than dynamically loading as needed via an
	// asynchronous request (which introduces timing problems)
	requires: [
		'ZCS.view.contacts.ZtContactView'
	],

	config: {

		models: ['ZCS.model.contacts.ZtContact'],
		stores: ['ZCS.store.contacts.ZtContactStore'],

		refs: {
			// event handlers
			listPanel: 'appview #' + ZCS.constant.APP_CONTACTS + 'listpanel',
			listView: ZCS.constant.APP_CONTACTS + 'listview',
			folderList: 'appview #' + ZCS.constant.APP_CONTACTS + 'overview nestedlist',
			itemPanel: 'appview #' + ZCS.constant.APP_CONTACTS + 'itempanel',

			// other
			overview: 'appview #' + ZCS.constant.APP_CONTACTS + 'overview',
			titlebar: 'appview #' + ZCS.constant.APP_CONTACTS + 'listpanel titlebar',
			searchBox: 'appview #' + ZCS.constant.APP_MAIL + 'listpanel searchfield'
		},

		control: {
			listPanel: {
				newItem: 'doNewContact'
			}
		},

		app: ZCS.constant.APP_CONTACTS
	},

	// TODO: launch happens on startup; delay load until Contacts tab shown

	getItemController: function() {
		return ZCS.app.getController('ZCS.controller.contacts.ZtContactController');
	},

	doNewContact: function() {
		Ext.Logger.warn('TODO: Create new contact');
	}
});
