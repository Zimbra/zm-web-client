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
		stores: ['ZCS.store.contacts.ZtContactDetailStore'],

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
                'cancel' : 'doCancel',
                'create' : 'doCreate'
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
            },
            itemPanelToolbar: {
                'delete' : 'doDelete',
                'edit' : 'doEdit'
            }
        }
	},

    launch: function() {
        ZCS.app.on('deleteContactItem', this.doDelete, this);
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

        var contact = arguments[0].data ? arguments[0] : this.getItem(),
            folderId = contact.data.folderId,
            l,toastMsg,
            op;

        if (folderId == ZCS.constant.ID_TRASH) {
            op = 'delete';
            toastMsg = ZtMsg.contactDeleted;
        }
        else {
            op = 'move';
            l = '3';
            toastMsg = ZtMsg.contactMovedToTrash;
        }

        var me = this,
            data = {
                op: op
            };

        if (l) {
            data.l = l;
        }
        this.performOp(contact, data, function() {
            ZCS.app.fireEvent('showToast', toastMsg);
            ZCS.app.getContactListController().removeContact(contact);
        });
        contact.destroy();
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

        // Get the contact's item id from the hidden field. If present it means contact is edited else new created
        var contactItemId = this.getContactForm().down('field[name=contactItemId]').getValue();

        if (contactItemId) {
            this.modifyContact();
        }
        else {
            var contact = this.getContactModel();
            if (contact) {
                this.createContactModel(contact);
            }
        }
    },

    doEdit: function() {
        //Gets the current selected contact and provision it for editing
        var contact = this.getStore().getById(this.getItem().data.id).data;
        if (contact.type !== ZCS.constant.ITEM_CONTACT_GROUP) {
            this.editContact(contact);
        }
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

    modifyContact: function() {

        var contact = this.getItem(),
            modifiedContact = this.getContactModel(),
            me = this,
            data = {
                op: 'modify',
                newContact: modifiedContact
            };

        this.performOp(contact, data, function() {
            ZCS.app.fireEvent('showToast', ZtMsg.contactEdited);
            //Re-load the store to display the updated data
            me.getStore().load();
        });
    },

    editContact: function(contact) {

        var me = this,
            panel = this.getContactPanel(),
            form = panel.down('formpanel'),
            fname = form.down('field[name=firstName]'),
            lname = form.down('field[name=lastName]'),
            prefix = form.down('field[name=namePrefix]'),
            middle = form.down('field[name=middleName]'),
            maiden = form.down('field[name=maidenName]'),
            suffix = form.down('field[name=nameSuffix]'),
            company = form.down('field[name=company]'),
            jobTitle = form.down('field[name=jobTitle]'),
            department = form.down('field[name=department]'),
            i,
            len,
            phones = [],
            mobilePhone = [],
            workPhone = [],
            otherPhone = [],
            phoneFieldLength = null,
            addresses = [],
            homeAddr = [],
            workAddr = [],
            otherAddr = [],
            addrFieldLength = null,
            urls = [],
            homeUrl = [],
            workUrl = [],
            otherUrl = [],
            urlFieldLength = null;

        panel.resetForm();

        //Set the title of the form
        panel.down('titlebar').setTitle(ZtMsg.editContact);

        //Sets first name
        if (contact.firstName) {
            fname.setValue(contact.firstName)
        }
        //Sets last name
        if (contact.lastName) {
            lname.setValue(contact.lastName);
        }
        //Sets prefix, suffix, maiden name and middle name if present
        if (contact.namePrefix || contact.nameSuffix || contact.maidenName || contact.middleName) {
            //Show more personal detail items
            this.getContactPanel().showPersonalDetails();
            prefix.setValue(contact.namePrefix || '');
            suffix.setValue(contact.nameSuffix || '');
            middle.setValue(contact.middleName || '');
            maiden.setValue(contact.maidenName || '');
        }
        //Sets job title, depart and company name if present
        if (contact.jobTitle || contact.department || contact.company) {
            //Show more job detail items
            this.getContactPanel().showJobDetails();
            company.setValue(contact.company || '');
            jobTitle.setValue(contact.jobTitle || '');
            department.setValue(contact.department || '');
        }
        //Adds email fields
        if (contact.emailFields && contact.emailFields.length > 0) {
            for (i = 0, len = contact.emailFields.length - 1; i < len; i++) {
                this.addEmail();
            }
        }
        //Adds mobile phone field if present
        if (contact.mobilePhoneFields && contact.mobilePhoneFields.length > 0) {
            mobilePhone = this.addPhoneFields('mobile', contact);
        }
        //Adds other phone field if present
        if (contact.otherPhoneFields && contact.otherPhoneFields.length > 0) {
            otherPhone = this.addPhoneFields('other', contact);
        }
        //Adds work phone field if present
        if (contact.workPhoneFields && contact.workPhoneFields.length > 0) {
            workPhone = this.addPhoneFields('work', contact);
        }

        //Merge all phones
        phones = phones.concat(mobilePhone, otherPhone, workPhone);

        /*
         * By default there is at least one phone field present on the form, hence delete the extra
         * In case there is no phone associated with the current contact then keep one field to fill in
         */
        phoneFieldLength = this.getPhoneField().getItems().length;
        if (phoneFieldLength > 2) {
            this.getPhoneField().getItems().items[phoneFieldLength - 1].destroy();
        }

        //Adds home address fields
        if (contact.isHomeAddressExists) {
            homeAddr = this.addAddressComponent('home', contact);
        }
        //Adds other address fields
        if (contact.isOtherAddressExists) {
            otherAddr = this.addAddressComponent('other', contact);
        }
        //Adds work address fields
        if (contact.isWorkAddressExists) {
            workAddr = this.addAddressComponent('work', contact);
        }

        //Merge all addresses
        addresses = addresses.concat(homeAddr, otherAddr, workAddr);

        /*
         * By default there is at least one address component present on the form, hence delete the extra
         * In case there is no address associated with the current contact then keep one component to fill in
         */
        addrFieldLength = this.getAddrField().getItems().length;
        if (addrFieldLength > 2) {
            this.getAddrField().getItems().items[addrFieldLength - 1].destroy();
        }

        //Adds URL fields - home, work and other
        if (contact.homeURLFields && contact.homeURLFields.length > 0) {
            homeUrl = this.addUrlFields('home', contact);
        }
        if (contact.otherURLFields && contact.otherURLFields.length > 0) {
            otherUrl = this.addUrlFields('other', contact);
        }
        if (contact.workURLFields && contact.workURLFields.length > 0) {
            workUrl = this.addUrlFields('work', contact);
        }

        //Merge all URLs
        urls = urls.concat(homeUrl, otherUrl, workUrl);

        /*
         * By default there is at least one URL field present on the form, hence delete the extra
         * In case there is no URL associated with the current contact then keep one field to fill in
         */
        urlFieldLength = this.getUrlField().getItems().length;
        if (urlFieldLength > 2) {
            this.getUrlField().getItems().items[urlFieldLength - 1].destroy();
        }

        panel.show({
            type: 'slide',
            direction: 'up',
            duration: 250,
            onEnd: function () {
                //'this' here is not instance of controller
                me.populateEditForm(contact, phones, addresses, urls);
            }
        });
    },

    addAddressComponent: function(fieldType, contact) {
        //Get the max field count
        var addressFields = [],
            i,
        //Find the count of each address field and consider whichever is highest
            cityFieldsLen = contact[fieldType + 'CityFields'] ? contact[fieldType + 'CityFields'].length : 0,
            countryFieldsLen = contact[fieldType + 'CountryFields'] ? contact[fieldType + 'CountryFields'].length : 0,
            postalCodeFieldsLen = contact[fieldType + 'PostalCodeFields'] ? contact[fieldType + 'PostalCodeFields'].length : 0,
            stateFieldsLen = contact[fieldType + 'StateFields'] ? contact[fieldType + 'StateFields'].length : 0,
            streetFieldsLen = contact[fieldType + 'StreetFields'] ? contact[fieldType + 'StreetFields'].length : 0,
            addrFieldsToAdd = Math.max(cityFieldsLen, countryFieldsLen, postalCodeFieldsLen, stateFieldsLen, streetFieldsLen);

        for (i = 0; i < addrFieldsToAdd; i++) {
            this.addAddr();

            addressFields.push({
                type: fieldType,
                cityFields: contact[fieldType + 'CityFields'] && contact[fieldType + 'CityFields'].length > 0 ? contact[fieldType + 'CityFields'][i] : '',
                countryFields: contact[fieldType + 'CountryFields'] && contact[fieldType + 'CountryFields'].length > 0 ? contact[fieldType + 'CountryFields'][i] : '',
                postalCodeFields: contact[fieldType + 'PostalCodeFields'] && contact[fieldType + 'PostalCodeFields'].length > 0 ? contact[fieldType + 'PostalCodeFields'][i] : '',
                stateFields: contact[fieldType + 'StateFields'] && contact[fieldType + 'StateFields'].length > 0 ? contact[fieldType + 'StateFields'][i] : '',
                streetFields: contact[fieldType + 'StreetFields'] && contact[fieldType + 'StreetFields'].length > 0 ? contact[fieldType + 'StreetFields'][i] : ''
            });
        }
        return addressFields;
    },

    addPhoneFields: function(fieldType, contact) {
        var phoneFields = [],
            i,
            len;

        for (i = 0, len = contact[fieldType + 'PhoneFields'].length; i < len; i++) {
            this.addPhone();

            phoneFields.push({
                type: fieldType,
                number: contact[fieldType + 'PhoneFields'][i]
            });
        }
        return phoneFields;
    },

    addUrlFields: function(fieldType, contact) {
        var urlFields = [],
            i,
            len;

        for (i = 0, len = contact[fieldType + 'URLFields'].length; i < len; i++) {
            this.addUrl();

            urlFields.push({
                type: fieldType,
                url: contact[fieldType + 'URLFields'][i]
            });
        }
        return urlFields;
    },

    populateEditForm: function(contact, phones, addresses, urls) {
        //Form object
        var contactForm = this.getContactForm(),
            i,
            len;

        //Setting up email values
        if (contact.emailFields && contact.emailFields.length > 0) {
            var formEmailFields = contactForm.query('field[name=email]');

            for (i = 0, len = formEmailFields.length; i < len; i++) {
                formEmailFields[i].setValue(contact.emailFields[i]);
            }
        }

        //Setting up phone values
        if (phones.length > 0) {
            var phoneFields = contactForm.query('field[name=phonenumber]'),
                typeFields = contactForm.query('field[name=phonetype]');

            for (i = 0, len = phones.length; i < len; i++) {
                phoneFields[i].setValue(phones[i].number);
                typeFields[i].setValue(phones[i].type);
            }
        }

        //Setting up address component values
        if (addresses.length > 0) {
            var streetFields = contactForm.query('field[name=street]'),
                cityFields = contactForm.query('field[name=city]'),
                stateFields = contactForm.query('field[name=state]'),
                postalCodeFields = contactForm.query('field[name=postalcode]'),
                countryFields = contactForm.query('field[name=country]'),
                addrTypeFields = contactForm.query('field[name=addresstype]');

            for (i = 0, len = addresses.length; i < len; i++) {
                streetFields[i].setValue(addresses[i].streetFields);
                cityFields[i].setValue(addresses[i].cityFields);
                stateFields[i].setValue(addresses[i].stateFields);
                postalCodeFields[i].setValue(addresses[i].postalCodeFields);
                countryFields[i].setValue(addresses[i].countryFields);
                addrTypeFields[i].setValue(addresses[i].type);
            }
        }

        //Setting up URL component
        if (urls.length > 0) {
            var urlFields = contactForm.query('field[name=url]'),
                urlTypeFields = contactForm.query('field[name=urltype]');

            for (i = 0, len = urls.length; i < len; i++) {
                urlFields[i].setValue(urls[i].url);
                urlTypeFields[i].setValue(urls[i].type);
            }
        }

        //Set itemId of the current contact in a hidden field
        var contactItemId = contactForm.down('field[name=contactItemId]');
        contactItemId.setValue(contact.id);
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

        //Throw an error if user tries to save an empty contact
        if (values.firstName == "" && values.lastName == "" && values.namePrefix == "" && values.middleName == ""
            && values.maidenName == "" && values.nameSuffix == "" && values.company == "" && values.jobTitle == ""
            && values.department == "" && values.email == "" && values.phonenumber == "" && values.url == ""
            && values.street == "" && values.city == "" && values.state == "" && values.postalcode == "" && values.country == "") {
            Ext.Msg.alert(ZtMsg.error, ZtMsg.errorNoFields);
            return null;
        }

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
        contact.set('homeURLFields', homeUrl);
        contact.set('workURLFields', workUrl);
        contact.set('otherURLFields', otherUrl);

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
	 * Fires a GetContactsRequest for the given contact/group.
     * Displays the given contact/group. Changes the toolbar text to the full name of the contact/group.
	 *
	 * @param {ZtContact}   contact     contact to show
	 */
	showItem: function(contact) {
        //<debug>
		Ext.Logger.info("contact controller: show contact " + contact.getId());
        //</debug>
        this.callParent(arguments);

		// Make sure the organizer button stays...
		ZCS.app.fireEvent('updatelistpanelToggle', this.getOrganizerTitle(), ZCS.session.getActiveApp());

        var store = this.getStore();
        store.load({
            contactId: contact.getId(),
	        isGroup: contact.get('isGroup'),
            callback: function(records, operation, success) {
                if (success) {
                    var data = records[0].data,
                        tpl = this.getContactView().getTpl(),
                        imageUrl = ZCS.common.ZtUtil.getImageUrl(records[0], 125);
                    data.imageStyle = imageUrl ? 'background-image: url(' + imageUrl + ')' : '';
                    this.updateToolbar({
                        title: records[0].data['displayName']
                    });
                    this.getContactView().setHtml(tpl.apply(data));
                }
            },
            scope: this
        });

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
