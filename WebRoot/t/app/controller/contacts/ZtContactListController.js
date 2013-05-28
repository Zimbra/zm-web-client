/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 VMware, Inc.
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
		'ZCS.view.contacts.ZtContactView',
        'ZCS.view.contacts.ZtContactForm'
    ],

	config: {

		models: ['ZCS.model.contacts.ZtContactList'],
		stores: ['ZCS.store.contacts.ZtContactListStore'],

		refs: {
			// event handlers
			listPanel: 'sheet #' + ZCS.constant.APP_CONTACTS + 'listpanel',
			listView: ZCS.constant.APP_CONTACTS + 'listview',
			folderList: 'sheet #' + ZCS.constant.APP_CONTACTS + 'overview nestedlist',
			itemPanel: 'appview #' + ZCS.constant.APP_CONTACTS + 'itempanel',

			// other
			overview: 'sheet #' + ZCS.constant.APP_CONTACTS + 'overview',
			titlebar: 'sheet #' + ZCS.constant.APP_CONTACTS + 'listpanel titlebar',
			searchBox: 'sheet #' + ZCS.constant.APP_MAIL + 'listpanel searchfield'
		},

		control: {
			listPanel: {
				newItem: 'doNewContact'
		    }
    	},

		app: ZCS.constant.APP_CONTACTS
	},

    launch: function() {
        this.callParent(arguments);
        ZCS.app.on('notifyContactlistCreate', this.handleCreateNotification, this);
    },

    /**
     * Handle a newly created contact. Add it to view if is is in the currently viewed folder.
     */
    handleCreateNotification: function(item, create) {
        var curFolder = ZCS.session.getCurrentSearchOrganizer(),
            curFolderId = curFolder && curFolder.get('itemId'),
            doAdd = false,
            creates = create.creates,
            ln = creates && creates.cn ? creates.cn.length : 0,
            contactCreate, i;

        for (i = 0; i < ln; i++) {
            contactCreate = creates.cn[i];
            if (contactCreate.id === create.id && contactCreate.l === curFolderId) {
                doAdd = true;
                break;
            }
        }

        var reader = ZCS.model.contacts.ZtContactList.getProxy().getReader(),
            data = reader.getDataFromNode(create),
            store = this.getStore(),
            contact= new ZCS.model.contacts.ZtContactList(data, create.id);

        if (doAdd) {
            store.insert(0, [contact]);
        }
    },

	getItemController: function() {
        return ZCS.app.getContactController();
	},

	getDefaultQuery: function() {
		return "in:contacts";
	},

	doNewContact: function() {
        this.getItemController().showContactForm();
	},

    /**
     * Removes the contact from the store and updates the list view
     */
    removeContact: function(contact) {
        var list = this.getListView(),
            contactStore = list.getStore(),
            currentIndex = contactStore.indexOf(contact),
            toSelect;

        contactStore.remove(contact);
        toSelect = contactStore.getAt(currentIndex);
        if (toSelect) {
            list.select(toSelect, false);
        }
        else {
            this.getItemController().clear();
        }
    }

});
