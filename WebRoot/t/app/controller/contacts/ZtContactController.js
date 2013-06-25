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
			itemPanelToolbar:   'appview #' + ZCS.constant.APP_CONTACTS + 'itempanel titlebar',
			itemPanel:          'appview #' + ZCS.constant.APP_CONTACTS + 'itempanel',

			// other
			contactView:    ZCS.constant.APP_CONTACTS + 'itemview',
            contactPanel:   'contactpanel',
            contactForm:    'contactpanel formpanel'
        },

        control: {
            contactPanel: {
                cancel:         'doCancel',
                save:           'doSave',
	            multiAddRemove: 'doMultiAddRemove'
            },
            itemPanelToolbar: {
                'delete':   'doDelete',
                edit:       'doEdit'
            }
        },

		composeMode: null
	},

    launch: function() {
        ZCS.app.on('deleteContactItem', this.doDelete, this);
    },

	/**
	 * Fires a GetContactsRequest for the given contact/group.
	 * Displays the given contact/group. Changes the toolbar text to the full name of the contact/group.
	 *
	 * @param {ZtContact}   contact     contact to show
	 */
	showItem: function(contact) {

		this.callParent(arguments);

		// Make sure the organizer button stays...
		ZCS.app.fireEvent('updatelistpanelToggle', this.getOrganizerTitle(), ZCS.session.getActiveApp());

		var store = this.getStore();
		store.load({
			contactId: contact.getId(),
			isGroup: contact.get('isGroup'),
			callback: function(records, operation, success) {
				var contact = records[0];
				if (success) {
					this.getContactView().showItem(contact);
					this.updateToolbar({
						title:      contact.get('longName'),
						isGroup:    contact.get('isGroup')
					});
				}
			},
			scope: this
		});

	},

	/**
	 * Clears contact from the item panel and clears out the toolbar.
	 */
	clear: function() {
		this.getStore().removeAll();
		this.getContactView().clearItem();
		this.setItem(null);
		this.callParent(arguments);
	},

	updateToolbar: function(params) {

		this.callParent(arguments);

		params = params || {};
		var app = ZCS.util.getAppFromObject(this),
			hideAll = !this.getItem() || params.isAssignmentView;

		Ext.each(ZCS.constant.ITEM_BUTTONS[app], function(button) {
			this.showButton(button.op, !hideAll);
		}, this);

		this.showButton(ZCS.constant.OP_EDIT, !hideAll && !params.isGroup)
	},

	/**
     * Displays the contact form to either create a new contact or edit an existing one.
	 *
	 * @param {String}      mode        ZCS.constant.OP_COMPOSE or ZCS.constant.OP_EDIT
	 * @param {ZtContact}   contact     contact used to fill in form fields (optional)
     */
    showContactForm: function(mode, contact) {

		var me = this,
			panel = this.getContactPanel(),
			form = panel.down('formpanel'),
			isEdit = (mode === ZCS.constant.OP_EDIT);

		this.setComposeMode(mode);
		panel.resetForm();

		// Set the title of the form
		panel.down('titlebar').setTitle(isEdit ? ZtMsg.editContact : ZtMsg.createContact);

		// Fill in form fields if we're handed a contact
		if (contact) {
			this.populateForm(contact);
		}

        panel.show({
            type:       'slide',
            direction:  'up',
            duration:   250
        });
    },

 	/**
     * Hides the contact form.
     */
    hideContactForm: function() {
        var panel = this.getContactPanel();
		panel.resetForm();
		panel.hide();
		this.setComposeMode(null);
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
        this.hideContactForm();
    },

    /**
     * Saves a contact using the values in the contact form.
     */
    doSave: function() {

        var newContact = this.getContactModel(),
	        mode = this.getComposeMode(),
	        changedAttrs;

        if (newContact) {
            if (mode === ZCS.constant.OP_EDIT) {
	            changedAttrs = this.getChangedAttrs(this.getItem(), newContact);
                this.modifyContact(newContact, changedAttrs);
            }
            else {
	            changedAttrs = this.getChangedAttrs(newContact, null);
	            if (changedAttrs.length) {
	                this.createContact(newContact);
	            }
	            else {
		            Ext.Msg.alert(ZtMsg.error, ZtMsg.errorNoFields);
	            }
            }
        }
    },

	/**
	 * Populates the contact form with the current contact so it can be edited (unless it's a group).
	 */
    doEdit: function() {
        var contact = this.getItem();
        if (contact.get('isGroup')) {
	        Ext.Msg.alert(ZtMsg.error, ZtMsg.errorEditContactGroup);
        }
        else {
            this.showContactForm(ZCS.constant.OP_EDIT, contact);
        }
    },

	/**
	 * Adds or removes an instance of one of the multiply-occurring contact fields (such as Email).
	 *
	 * @param {Button}  button      plus or minus button
	 */
	doMultiAddRemove: function(button) {

		var idParams = ZCS.util.getIdParams(button.getItemId()),
			type = idParams.type,
			action = idParams.action,
			container = this.getContactPanel().down(type + 'container');

		if (container) {
			if (action === 'add') {
				container.addField();
			}
			else if (action === 'remove') {
				container.removeField(idParams.fieldId);
			}
		}
	},

    getContactPanel: function() {

        if (!this.contactPanel) {
            this.contactPanel = Ext.create('ZCS.view.contacts.ZtContactForm');
            Ext.Viewport.add(this.contactPanel);
        }

        return this.contactPanel;
    },

    modifyContact: function(newContact, changedAttrs) {

        var contact = this.getItem(),
            me = this,
            data = {
                op:         'modify',
                newContact: newContact,
	            attrs:      changedAttrs
            };

        this.performOp(contact, data, function() {
	        me.hideContactForm();
	        ZCS.app.fireEvent('showToast', ZtMsg.contactEdited);
	        // Reload to show newly updated state of the contact
            me.getStore().load();
        });
    },

    populateForm: function(contact) {

		var	panel = this.getContactPanel(),
			form = panel.down('formpanel'),
			value, formField,
			extraNameFieldsShown = false,
			extraJobFieldsShown = false;

	    // Create and populate the simple attrs
	    Ext.each(ZCS.constant.CONTACT_FIELDS, function(attr) {
		    value = contact.get(attr);
		    if (value) {
			    formField = form.down('field[name=' + attr + ']');
			    if (formField) {
				    if (ZCS.constant.IS_EXTRA_NAME_FIELD[attr] && !extraNameFieldsShown) {
					    panel.showNameFields();
					    extraNameFieldsShown = true;
				    }
				    if (ZCS.constant.IS_EXTRA_JOB_FIELD[attr] && !extraJobFieldsShown) {
					    panel.showJobFields();
					    extraJobFieldsShown = true;
				    }
				    formField.setValue(value);
			    }
		    }
	    }, this);

	    // Create as many fields as we need for each multiple-occurring attribute (at least one will be added)
	    var container;
	    Ext.each(ZCS.constant.CONTACT_MULTI_FIELDS, function(multiField) {
		    container = panel.down(multiField + 'container');
		    Ext.each(contact.get(multiField), function(field, index) {
			    if (index > 0) {
				    container.addField();
			    }
		    }, this);
	    }, this);

	    // Populate the fields created above. A bit tricky because the names of the form fields are different
	    // from what's used in the data. For example, address form fields will have a
	    // sequence number at the end, eg 'street2'.
	    var data, formAttrs, formFields, formField, isAddressField, value;
	    Ext.each(ZCS.constant.CONTACT_MULTI_FIELDS, function(multiField) {
		    data = contact.get(multiField);
		    if (data && data.length > 0) {
			    container = panel.down(multiField + 'container');
			    formAttrs = (multiField === 'address') ? ZCS.constant.ADDRESS_FIELDS.slice() : [ multiField ];
			    if (multiField !== 'email') {
				    formAttrs.push(multiField + 'Type');
			    }
			    Ext.each(formAttrs, function(formAttr) {
				    isAddressField = ZCS.constant.IS_ADDRESS_FIELD[formAttr] || formAttr === 'addressType';
				    if (!isAddressField) {
				        formFields = container.query('field[name=' + formAttr + ']');
				    }
				    Ext.each(data, function(dataObj, index) {
					    value = dataObj[formAttr];
					    if (value) {
						    formField = isAddressField ? container.down('field[name=' + formAttr + index + ']') : formFields[index];
						    if (formField) {
							   formField.setValue(value);
						    }
					    }
				    }, this);
			    }, this);
		    }
	    }, this);
    },

    createContact: function(contact, callback, scope) {

	    var me = this,
		    folder = ZCS.session.getCurrentSearchOrganizer();

        contact.save({
	        folderId: folder ? folder.get('itemId') : null,
            success: function() {
	            me.hideContactForm();
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
            values = this.getContactForm().getValues();

	    // Set simple fields (not multiple, not composite)
	    ZCS.util.setFields(values, contact, ZCS.constant.CONTACT_FIELDS);

	    // Address is multiple and composite. Make sure the name-based form field arrays are
	    // set up so that related address parts are kept together.
	    var attr, m, seq;
	    Ext.Object.each(values, function(field) {
			m = field.match(ZCS.constant.REGEX_CONTACT_FIELD);
			if (m && m.length > 0) {
				attr = m[1], seq = m[2];
				if (attr === 'addressType') {
					values.addressType = values.addressType || [];
					values.addressType.push(values[field]);
					Ext.each(ZCS.constant.ADDRESS_FIELDS, function(addrField) {
						values[addrField] = values[addrField] || [];
						values[addrField].push(values[addrField + seq] || '');
					}, this);
				}
			}
	    }, this);

	    // Use name-based form value arrays to set the contact's multi fields.
		var typeField, attrs, fieldValues;
	    Ext.each(ZCS.constant.CONTACT_MULTI_FIELDS, function(multiField) {
		    typeField = multiField + 'Type';
		    attrs = [ multiField, typeField ];
			fieldValues = [];
		    if (multiField === 'address') {
			    attrs = attrs.concat(ZCS.constant.ADDRESS_FIELDS);
		    }
		    Ext.each(attrs, function(attr) {
			    Ext.each(values[attr], function(value, index) {
				    fieldValues[index] = fieldValues[index] || {};
				    fieldValues[index][attr] = value || '';
			    }, this);
		    }, this);
		    contact.set(multiField, fieldValues);
	    }, this);

        return contact;
    },

	/**
	 * Returns a list of JSON attributes whose values differ between the two contacts.
	 *
	 * @param {ZtContact}   contactA        contact
	 * @param {ZtContact}   contactB        other contact
	 *
	 * @return {Array}  list of JSON attributes
	 */
	getChangedAttrs: function(contactA, contactB) {

		var attrsA = contactA ? contactA.fieldsToAttrs() : {},
			attrsB = contactB ? contactB.fieldsToAttrs() : {},
			changedAttrs = [], valueA, valueB;

		Ext.each(Ext.Array.unique(Object.keys(attrsA).concat(Object.keys(attrsB))), function(attr) {
			valueA = attrsA[attr] || '';
			valueB = attrsB[attr] || '';
			if (valueA !== valueB) {
				changedAttrs.push(attr);
			}
		}, this);

		return changedAttrs;
	}
});
