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
			searchBox: 'sheet #' + ZCS.constant.APP_MAIL + 'listpanel searchfield'
		},

		control: {
			listPanel: {
				newItem: 'doNewContact'
		    },
            listView: {
                itemswipe: 'handleSwipe'
            }
    	},

		app: ZCS.constant.APP_CONTACTS
	},

    launch: function() {
        this.callParent(arguments);
        ZCS.app.on('notifyContactCreate', this.handleCreateNotification, this);
        ZCS.app.on('notifyContactChange', this.handleModifyNotification, this);
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

    handleModifyNotification: function(item, modify) {

        var store = this.getStore(),
            itemPresent = store.getById(item.getId()),
            contactListView = this.getListView();

        if (itemPresent) {
            contactListView.refresh();
            contactListView.select(ZCS.app.getContactController().getItem());
        }
    },

	getItemController: function() {
        return ZCS.app.getContactController();
	},

	getDefaultQuery: function() {
		return "in:contacts";
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

    handleSwipe: function(list, index, contactItem, record, e, eOpts) {
        var contactEl = contactItem.element,
            contactElBox = contactEl.getBox(),
            buttonHeight = contactElBox.height,
            buttonWidth = 120,
            swipeElm = Ext.dom.Element.create({
                html: ZCS.controller.contacts.ZtContactListController.swipeToDeleteTpl.apply({
                    width: buttonWidth,
                    height: buttonHeight
                }),
                "class": 'zcs-outer-swipe-elm'
            }),
            sameItemSwipeButton = contactEl.down('.zcs-outer-swipe-elm'),
            anySwipeButton = list.element.down('.zcs-outer-swipe-elm');

        e.preventDefault();

        if (sameItemSwipeButton) {
            sameItemSwipeButton.fadeAway();
        } else {

            if (anySwipeButton && !anySwipeButton.fading) {
                anySwipeButton.fadeAway();
            }

            swipeElm.fadeAway = function () {
                var fadingButton = swipeElm;
                fadingButton.fading = true;
                Ext.Anim.run(fadingButton, 'fade', {
                    after: function() {
                        fadingButton.destroy();
                    },
                    out: true
                })
            }

            swipeElm.on('tap', function (event, node, options, eOpts) {
                var el = Ext.fly(event.target);
                if (el.hasCls('zcs-swipe-delete')) {
                    ZCS.app.fireEvent('deleteContactItem', record);
                    swipeElm.fadeAway();
                }
            });

            swipeElm.on('swipe', function () {
                swipeElm.fadeAway();
            });

            //Delay this so any scroll that occurs before a swiper has a chance to complete
            Ext.defer(function () {
                swipeElm.insertAfter(Ext.fly(contactEl.dom.children[0]));
            }, 100);

        }
    }
},
    function (thisClass) {
        thisClass.swipeToDeleteTpl = Ext.create('Ext.XTemplate', ZCS.template.ConvListSwipeToDelete);
    }
);
