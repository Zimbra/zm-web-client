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
 * This class manages the display and manipulation of a single contact in its panel.
 *
 * @see ZtContact
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.controller.contacts.ZtContactController', {

	extend: 'ZCS.controller.ZtItemController',

	config: {

		models: ['ZCS.model.contacts.ZtContact'],
		stores: ['ZCS.store.contacts.ZtContactStore'],

		refs: {
			// event handlers
			itemPanelToolbar: 'appview #' + ZCS.constant.APP_CONTACTS + 'itempanel titlebar',
			itemPanel: 'appview #' + ZCS.constant.APP_CONTACTS + 'itempanel',

			// other
			contactView: ZCS.constant.APP_CONTACTS + 'itemview',
            contactPanel: 'contactpanel',
            contactForm:    'contactpanel formpanel',
            //email
            emailField:     'contactpanel emailcontainer',
            emailFieldAdd: 'contactpanel #btnAddEmail',
            emailFieldRemove: 'contactpanel #btnRemoveEmail',
            //phone
            phoneField:     'contactpanel phonecontainer',
            phoneFieldAdd: 'contactpanel #btnAddPhone',
            phoneFieldRemove: 'contactpanel #btnRemovePhone',
            //url
            urlField:     'contactpanel urlcontainer',
            urlFieldAdd: 'contactpanel #btnAddUrl',
            urlFieldRemove: 'contactpanel #btnRemoveUrl',
            //address
            addrField:  'contactpanel addrcontainer',
            addrFieldAdd: 'contactpanel #btnAddAddr',
            addrFieldRemove: 'contactpanel #btnRemoveAddr'
        },

        control: {
            contactPanel: {
                cancel:                     'doCancel',
                create:                     'doCreate'
            },
            emailFieldAdd: {
                'tap' : 'addEmail'
            },
            emailFieldRemove: {
                'tap' : 'removeEmail'
            },
            phoneFieldAdd: {
                'tap' : 'addPhone'
            },
            phoneFieldRemove: {
                'tap' : 'removePhone'
            },
            urlFieldAdd: {
                'tap' : 'addUrl'
            },
            urlFieldRemove: {
                'tap' : 'removeUrl'
            },
            addrFieldAdd: {
                'tap' : 'addAddr'
            },
            addrFieldRemove: {
                'tap' :  'removeAddr'
            }
        },

		menuData: [
			{label: 'Delete', action: ZCS.constant.OP_DELETE, listener: 'doDelete'}
		]
	},

    /**
     * Pops the contact form
     */
    showContactForm: function() {
        var panel = this.getContactPanel();

        panel.resetForm();

        panel.show({
            type: 'slide',
            direction: 'up',
            duration: 250
        });
    },

    /**
	 * Moves the contact to Trash.
	 */
	doDelete: function() {
        //<debug>
		Ext.Logger.warn("TODO: contact controller DELETE");
        //</debug>
	},

    /**
     * Hides the contact form
     */
    doCancel : function() {
        this.getContactPanel().hide();
    },

    /**
     * Creates a contact constructed from the values in the contact form
     */
    doCreate: function() {
        this.getContactPanel().hide();
        this.createContactModel(this.getContactModel());
    },

    /**
     * @private
     */
    getContactPanel: function() {
        if (!this.contactPanel) {
            this.contactPanel = Ext.create('ZCS.view.contacts.ZtContactForm');
            Ext.Viewport.add(this.contactPanel);
        }

        return this.contactPanel;
    },

    createContactModel: function(contact, callback, scope) {
        contact.save({
            success: function() {
                ZCS.app.fireEvent('showToast', ZtMsg.contactCreated);
                if (callback) {
                    callback.apply(scope);
                }
            },
            failure: function() {
                ZCS.app.fireEvent('showToast', ZtMsg.errorCreateContact);
            }
        }, this);
    },

    getContactModel: function() {
        var contact = Ext.create('ZCS.model.contacts.ZtContact'),
            values = this.getContactForm().getValues(),
            emails = [],
            mobilePhones = [],
            workPhones = [],
            otherPhones = [],
            homeUrl = [],
            workUrl = [],
            otherUrl = [],
            addrs = {},
            i;

        //Personal Info
        contact.set('firstName', values.firstName);
        contact.set('lastName', values.lastName);
        contact.set('namePrefix', values.namePrefix);
        contact.set('middleName', values.middleName);
        contact.set('maidenName', values.maidenName);
        contact.set('nameSuffix', values.nameSuffix);
        contact.set('company', values.company);
        contact.set('jobTitle', values.jobTitle);
        contact.set('department', values.department);

        //Emails
        if (Array.isArray(values.email)) {
            for (i=0; i < values.email.length; i++) {
                emails.push(values.email[i]);
            }
        } else {
            emails.push(values.email);
        }
        contact.set('emailFields', emails);

        //Phones
        var phoneArr = [],
            phoneTypeArr = [];
        if (Array.isArray(values.phonenumber)) {
            phoneArr = values.phonenumber;
            phoneTypeArr = values.phonetype;
        } else
        {
            phoneArr.push(values.phonenumber);
            phoneTypeArr.push(values.phonetype);
        }

        for (i = 0; i < phoneArr.length; i++) {
            var phoneType = phoneTypeArr[i],
                phoneNumber = phoneArr[i];

            if (phoneType == ZCS.constant.MOBILE)  {
                mobilePhones.push(phoneNumber);
            } else if (phoneType == ZCS.constant.WORK) {
                workPhones.push(phoneNumber);
            } else if (phoneType == ZCS.constant.OTHER) {
                otherPhones.push(phoneNumber);
            }
        }
        contact.set('mobilePhoneFields', mobilePhones);
        contact.set('workPhoneFields', workPhones);
        contact.set('otherPhoneFields', otherPhones);

        //Urls
        var urlArr = [],
            urlTypeArr = [];
        if (Array.isArray(values.url)) {
            urlArr = values.url;
            urlTypeArr = values.urltype;
        } else {
            urlArr.push(values.url);
            urlTypeArr.push(values.urltype);
        }
        for (i = 0; i < urlArr.length; i++) {
            var urlType = urlTypeArr[i],
                urlValue = urlArr[i];

            if (urlType == ZCS.constant.HOME)  {
                homeUrl.push(urlValue);
            } else if (urlType == ZCS.constant.WORK) {
                workUrl.push(urlValue);
            } else if (urlType == ZCS.constant.OTHER) {
                otherUrl.push(urlValue);
            }
        }
        contact.set('homeUrlFields', homeUrl);
        contact.set('workUrlFields', workUrl);
        contact.set('otherUrlFields', otherUrl);

        //Addresses
        addrs = this.populateAddressFields(values);

        for(var key in addrs){
            if (addrs.hasOwnProperty(key)) {
                contact.set(key, addrs[key]);
            }
        }

        return contact;
    },

    populateAddressFields: function(values) {
        var formFields = [ 'street', 'city', 'state', 'postalcode', 'country'],
            contactFields = [ 'StreetFields', 'CityFields', 'StateFields', 'PostalCodeFields', 'CountryFields'],
            data = {};
        for (var i = 0, len = formFields.length; i<len; i++) {
            var fieldName = formFields[i],
                fieldVal = values[fieldName],
                contactFieldName = contactFields[i],
                homeArr = [],
                workArr = [],
                otherArr = [];

            var addrs = [],
                addrsType = [];
            if (Array.isArray(fieldVal)) {
                addrs = fieldVal;
                addrsType = values.addresstype;
            } else {
                addrs.push(fieldVal);
                addrsType.push(values.addresstype);
            }

            for (var j = 0; j < addrs.length; j++) {
                var addr = addrs[j];
                var addrType = addrsType[j];
                if (addrType == ZCS.constant.HOME)  {
                    homeArr.push(addr);
                } else if (addrType == ZCS.constant.WORK) {
                    workArr.push(addr);
                } else if (addrType == ZCS.constant.OTHER) {
                    otherArr.push(addr);
                }
            }
            data['home'+contactFieldName] = homeArr;
            data['work'+contactFieldName] = workArr;
            data['other'+contactFieldName] = otherArr;
        }
        return data;
    },

    /**
	 * Displays the given contact. Changes the toolbar text to the full name of the contact.
	 *
	 * @param {ZtContact}   contact     contact to show
	 */
	showItem: function(contact) {
        //<debug>
		Ext.Logger.info("contact controller: show contact " + contact.getId());
        //</debug>
		this.callParent(arguments);

		this.updateToolbar({
			title:  contact.get('displayName')
		});

		//Make sure the organizer button stays...
		ZCS.app.fireEvent('updatelistpanelToggle', this.getOrganizerTitle(), ZCS.session.getActiveApp());

		var tpl = this.getContactView().getTpl();
        var data = contact.getData();
        var imageUrl = ZCS.common.ZtUtil.getImageUrl(contact, 125);

        data.imageStyle = imageUrl ? 'background-image: url(' + imageUrl + ')' : '';
        this.getContactView().setHtml(tpl.apply(data));
	},

	updateToolbar: function(params) {

		this.callParent(arguments);

		params = params || {};
		var app = ZCS.util.getAppFromObject(this),
			hideAll = !this.getItem() || params.isAssignmentView;

		Ext.each(ZCS.constant.ITEM_BUTTONS[app], function(button) {
			this.showButton(button.op, !hideAll);
		}, this);

		if (hideAll) {
			return;
		}
	},

    addEmail: function() {
        this.getEmailField().add(Ext.create('ZCS.view.contacts.ZtEmailField'));
    },

    removeEmail: function() {
        var numEmails = this.getEmailField().getItems().length - 1;
        if (numEmails > 1)
            this.getEmailField().getItems().items[numEmails].destroy();
    },

    addPhone: function() {
        this.getPhoneField().add(Ext.create('ZCS.view.contacts.ZtPhoneField'));
    },

    removePhone: function() {
        var numPhones = this.getPhoneField().getItems().length - 1;
        if (numPhones > 1)
            this.getPhoneField().getItems().items[numPhones].destroy();
    },

    addAddr: function() {
        this.getAddrField().add(Ext.create('ZCS.view.contacts.ZtAddrField'));
    },

    removeAddr: function() {
        var numAddrs = this.getAddrField().getItems().length - 1;
        if (numAddrs > 1)
            this.getAddrField().getItems().items[numAddrs].destroy();
    },

    addUrl: function() {
        this.getUrlField().add(Ext.create('ZCS.view.contacts.ZtUrlField'));
    },

    removeUrl: function() {
        var numUrls = this.getUrlField().getItems().length - 1;
        if (numUrls > 1)
            this.getUrlField().getItems().items[numUrls].destroy();
    }

});
