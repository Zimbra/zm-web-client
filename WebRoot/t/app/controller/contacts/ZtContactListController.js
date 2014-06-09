/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
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

		models: ['ZCS.model.contacts.ZtContact'],
		stores: ['ZCS.store.contacts.ZtContactStore'],

		refs: {
			// event handlers
			listPanel: 'sheet #' + ZCS.constant.APP_CONTACTS + 'listpanel',
			listView: ZCS.constant.APP_CONTACTS + 'listview',
			folderList: 'sheet #' + ZCS.constant.APP_CONTACTS + 'overview nestedlist',
			itemPanel: 'appview #' + ZCS.constant.APP_CONTACTS + 'itempanel',

			// other
			overview: 'sheet #' + ZCS.constant.APP_CONTACTS + 'overview',
			titlebar: 'sheet #' + ZCS.constant.APP_CONTACTS + 'listpanel titlebar',
			searchBox: 'sheet #' + ZCS.constant.APP_CONTACTS + 'listpanel searchfield'
		},

		control: {
			listPanel: {
				newItem: 'doNewContact'
		    }
    	},

		app: ZCS.constant.APP_CONTACTS
	},

	launch: function() {

        if (!ZCS.util.isAppEnabled(this.getApp())) {
            return;
        }

	    this.callParent();

	    ZCS.app.on('notifyContactCreate', this.handleCreateNotification, this);
        ZCS.app.on('notifyContactChange', this.handleModifyNotification, this);

        if (ZCS.session.getSetting(ZCS.constant.SETTING_SHOW_DL_FOLDER)) {
            // cobble together a folder create notification for the DL folder
            var dlFolder = {
                type:           ZCS.constant.NOTIFY_CREATE,
                id:             ZCS.constant.ID_DLS,
                nodeType:       ZCS.constant.ORG_FOLDER,
                absFolderPath:  '/Distribution Lists',
                l:              '1',
                name:           ZtMsg.distributionLists,
                view:           'contact'
            };
            ZCS.app.fireEvent('notify', dlFolder);
        }
    },

    /**
     * Load contacts from the system Contacts folder.
     */
    loadContacts: function() {

        var defaultQuery = this.getDefaultQuery();

        this.getStore().getProxy().setExtraParams({
            query: defaultQuery
        });

        this.getStore().load({
            query:      defaultQuery,
            callback:   this.storeLoaded,
            scope:      this
        });
    },

	loadContactByEmail: function(email, callback) {
		this.getStore().load({
			field:      'email',
			query:      email,
			callback:   callback
		});
	},

    /**
     * Load local contacts via REST call so we can cache them.
     */
    loadAllContacts: function(callback) {

        var store = this.getStore();

	    var restUri = ZCS.htmlutil.buildUrl({
                path:   '/home/' + ZCS.session.getAccountName() + '/Contacts',
                qsArgs: {
                    fmt:    'cf',
                    t:      2,
                    all:    'all'
                }
            });

        Ext.Ajax.request({
            url: restUri,
            success: function(response, options) {

	            this.contactData = {};

                var text = response.responseText,
                    contacts = text.split('\u001E'),
                    reader = ZCS.model.contacts.ZtContact.getProxy().getReader(),
                    ln = contacts.length, i, fields, data, attrs, j, field, value, emails, field,
                    contactGroupIds = [],
	                dataFields = ZCS.constant.CONTACT_DATA_FIELDS,
	                dataFieldsLn = dataFields.length;

                for (i = 0; i < ln; i++) {
                    fields = contacts[i].split('\u001D');
                    attrs = {};
	                emails = [];

	                // first, find all the emails while remembering the other attr/value pairs
                    for (j = 0; j < fields.length; j += 2) {
	                    field = fields[j];
	                    value = fields[j + 1];
                        attrs[field] = value;
	                    if (field.indexOf('email') === 0) {
		                    emails.push(value);
	                    }
                    }

	                // add an object with the attrs we need for each email we found
	                if (emails.length > 0) {
		                data = {};
		                for (j = 0; j < dataFieldsLn; j++) {
			                field = dataFields[j];
			                if (attrs[field]) {
			                    data[field] = attrs[field];
			                }
		                }
		                for (j = 0; j < emails.length; j++) {
		                    this.contactData[emails[j]] = data;
		                }
	                }
                }

	            if (callback) {
		            callback();
	            }
            },
	        scope: this
        });
    },

	// Go find the group members for the contact group with the given ID.
	loadGroupMembers: function(contactId, callback) {
		this.getStore().load({
			contactId:      contactId,
			contactType:    ZCS.constant.CONTACT_GROUP,
			callback:       callback
		});
	},

	/**
	 * Returns the value of the given field for the contact data object with the given email.
	 *
	 * @param {string}  email       email address
	 * @param {string}  field       name of field
	 * @param {int}     maxWidth    width of image (optional)
	 *
	 * @returns {string}    value of field
	 */
	getDataFieldByEmail: function(email, field, maxWidth) {

		var data = this.contactData && this.contactData[email];
		if (!data) {
			return '';
		}

		var result = data[field];
		if (field === 'shortName') {
			result = data.nickname || data.firstName || email;
		}
		else if (field === 'longName') {
			result = data.firstName && data.lastName ? [ data.firstName, data.lastName ].join(' ') : data.firstName || data.lastName || email;
		}
		else if (field === 'image' && data.imagepart) {
			result = ZCS.model.contacts.ZtContact.getImageUrl({ imagepart: data.imagepart }, data.id, maxWidth);
		}
		else if (field === 'exists') {
			result = 'true';    // return string that is truthy
		}

		return result || '';
	},

    /**
     * Handle a newly created contact. Add it to view if is is in the currently viewed folder.
     */
    handleCreateNotification: function(item, create) {

        var curFolder = ZCS.session.getCurrentSearchOrganizer(),
            curFolderId = curFolder && curFolder.get('zcsId'),
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

        if (doAdd) {
	        var reader = ZCS.model.contacts.ZtContact.getProxy().getReader(),
		        data = reader.getDataFromNode(create),
		        store = this.getStore(),
		        contact = new ZCS.model.contacts.ZtContact(data, create.id),
	            insertIndex = store.getCount();

	        store.each(function(record, index) {
		        if (ZCS.model.contacts.ZtContact.compare(contact, record) === -1) {
			        insertIndex = index;
			        return false;
		        }
	        });
            store.insert(insertIndex, [contact]);
        }
    },

	/**
	 * If the modified contact is in this list's store, update its model.
	 */
	handleModifyNotification: function(item, modify) {

	    var store = this.getStore();
	    if (store.getById(item.getId())) {
		    item.handleModifyNotification(modify);
	    }

		// Handle contact move
		if (modify.l) {
			item.set('folderId', modify.l);
			this.removeItem(item);
		}
	},

	getItemController: function() {
        return ZCS.app.getContactController();
	},

	getDefaultQuery: function() {
		return 'in:contacts';
	},

	doNewContact: function() {
        this.getItemController().showContactForm(ZCS.constant.OP_COMPOSE);
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
    },

     updateTitlebar: function(app) {
         this.callParent(arguments);

        //disable Add button for Contacts -> Distribution Lists
         var titlebar = this.getTitlebar(),
             addButton = titlebar && titlebar.down([ '#', ZCS.constant.APP_CONTACTS, '-newButton'].join('')),
             curFolder = ZCS.session.getCurrentSearchOrganizer();

         if (addButton) {
             addButton.setVisibility(!ZCS.util.folderIs(curFolder, ZCS.constant.ID_DLS));
         }
     }
},
    function (thisClass) {
        thisClass.swipeToDeleteTpl = Ext.create('Ext.XTemplate', ZCS.template.ConvListSwipeToDelete);
    }
);
