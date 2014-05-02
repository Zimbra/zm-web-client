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
 * This class manages the display and manipulation of a single contact in its panel.
 *
 * @see ZtContact
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.controller.contacts.ZtContactController', {

	extend: 'ZCS.controller.ZtItemController',

    mixins: {
        contactFieldsMenuable: 'ZCS.common.ZtContactFieldsMenuable'
    },

	config: {

		models: ['ZCS.model.contacts.ZtContact'],
		stores: ['ZCS.store.contacts.ZtContactDetailStore'],

		refs: {
			// event handlers
			itemPanelToolbar:   'appview #' + ZCS.constant.APP_CONTACTS + 'itempanel titlebar',
            convTitleBar:       'appview #' + ZCS.constant.APP_CONTACTS + 'itempanel #itemTitleOnlyBar',
			itemPanel:          'appview #' + ZCS.constant.APP_CONTACTS + 'itempanel',
			contactActionsMenu: 'list[itemId=contactActionsMenu]',

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
                edit:       'doEdit'
            },
	        '.moveview': {
		        contactAssignment: 'saveItemMove'
	        },
	        '.tagview': {
		        contactAssignment: 'saveItemTag'
	        },
	        contactView: {
		        tagTap:     'showMenu'
	        },
            contactActionsMenu: {
                itemtap:    'onMenuItemSelect'
            }
        },

		composeMode:    null,
		app:            ZCS.constant.APP_CONTACTS
	},

    launch: function() {
        ZCS.app.on('deleteContactItem', this.doDelete, this);
	    ZCS.app.on('notifyContactChange', this.handleModifyNotification, this);
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

		var store = this.getStore(),
			contactType = contact.get('contactType');

		store.load({
			contactId:      contact.getId(),
			contactType:    contactType,
			nickname:       contact.get('nickname'),    // for DLs, which are fetched by nickname rather than ID

			callback: function(records, operation, success) {
				var contact = records[0];
				if (success) {
					this.getContactView().showItem(contact);
					this.updateToolbar({
						title:      Ext.String.htmlEncode(contact.get('longName')),
						isMultiple: contact.get('isMultiple')
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

		this.showButton(ZCS.constant.OP_EDIT, !hideAll && !params.isMultiple)
	},

    updateTitle: function (params) {
        var convTitleBar = this.getConvTitleBar();

        if (convTitleBar && params && params.title != null) {
            convTitleBar.setHtml(params.title);
            if (params.title) {
                convTitleBar.show();
            } else {
                convTitleBar.hide();
            }
        }
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

		// Set the title of the form
		panel.down('titlebar').setTitle(isEdit ? ZtMsg.editContact : ZtMsg.createContact);

		// Fill in form fields if we're handed a contact
		if (contact) {
			this.populateForm(contact);
		}

		me.unhideContactForm();
	},

	unhideContactForm: function () {
		if (Ext.os.deviceType === "Phone") {
			this.getContactPanel().element.dom.style.removeProperty('display');
		} else {
			this.getContactPanel().show({
				type: 'fadeIn',
				duration: 250
			});
		}
	},

	/**
	 * Hides the contact form.
	 */
	hideContactForm: function() {
		var panel = this.getContactPanel();

		if (Ext.os.deviceType === "Phone") {
			panel.element.dom.style.setProperty('display', 'none');
		} else {
			panel.hide({
				type: 'fadeOut',
				duration: 250
			});
		}

		panel.resetForm();
		this.setComposeMode(null);
	},

	/**
	 * Moves the contact to Trash, or deletes it if it's already in Trash.
	 */
	doDelete: function() {

        var contact = this.getItem(),
            folderId, toastMsg, op;

        if (contact.get('folderId') === ZCS.constant.ID_TRASH) {
            op = 'delete';
            toastMsg = ZtMsg.contactDeleted;
        }
        else {
            op = 'move';
	        folderId = ZCS.constant.ID_TRASH;
            toastMsg = ZtMsg.contactMovedToTrash;
        }

        var me = this,
            data = {
                op:         op,
	            folderId:   folderId
            };

        var contactName = Ext.String.htmlEncode(contact.get('longName')),
            allowPermDelete = false;

        if (op === 'move') {
            this.doActualDelete(contact, data, toastMsg);
        } else if (op === 'delete') {
            var deleteMsg = Ext.String.format(ZtMsg.hardDeleteContactText, contactName);

            Ext.Msg.confirm(ZtMsg.hardDeleteContactTitle, deleteMsg, function(buttonId) {
                if (buttonId === 'yes') {
                    this.doActualDelete(contact, data, toastMsg);
                }
            }, this);
        }
    },

    /**
     * Performs move or delete operation on a contact.
     */
    doActualDelete: function(contact, data, toastMsg) {
        this.performOp(contact, data, function() {
            ZCS.app.fireEvent('showToast', toastMsg);
        });
    },


	/**
	 * Launches a move assignment view.
	 */
	doMove: function(actionParams) {
		this.doAssignmentView(null, ZCS.constant.ORG_FOLDER);
	},

	/**
	 * Launches a tag assignment view.
	 */
	doTag: function(actionParams) {
		this.doAssignmentView(null, ZCS.constant.ORG_TAG);
	},

	/**
	 * Launches an assignment view
	 *
	 * @param {ZtContact}   item        contact being moved or tagged
	 * @param {String}      type        ZCS.constant.ORG_*
	 */
	doAssignmentView: function(item, type) {
		ZCS.app.getAssignmentController().showAssignmentView(item || this.getItem(), type, this.getApp(), this);
	},

	/**
     * Hides the contact form
     */
    doCancel : function() {

		var me = this;

	    if (this.isDirty()) {
		    Ext.Msg.show({
			    title: ZtMsg.warning,
			    message: ZtMsg.saveChangesWarning,
			    buttons: ZCS.constant.CANCEL_SHIELD_BUTTONS,
			    fn: function(buttonId) {
				    //<debug>
				    Ext.Logger.info('Cancel contact edit/create shield button: ' + buttonId);
				    //</debug>
				    if (buttonId === 'yes') {
					    me.doSave();
				    }
				    else if (buttonId === 'no') {
					    me.hideContactForm();
				    }
			    }
		    });
	    }
	    else {
		    this.hideContactForm();
	    }
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
                // Bug fix: 83280. Copy the image object from original contact to new contact
                var imageObj = this.getItem().get('image');
                if (imageObj) {
                    newContact.set('image', imageObj);
                }

	            changedAttrs = ZCS.model.contacts.ZtContact.getChangedAttrs(this.getItem(), newContact);
                this.modifyContact(newContact, changedAttrs);
            }
            else {
	            changedAttrs = ZCS.model.contacts.ZtContact.getChangedAttrs(null, newContact);
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


		if (container && action === 'remove') {
			container.removeField(idParams.fieldId);
            return;
		}

        var willShowOptionsOnTap = button.getWillShowOptionsOnTap();
        
        if (willShowOptionsOnTap) {
            var fieldList = Ext.Array.clone(container.getOptionalFields());
            while (true) {
                var stop = true;
                for (var i = 0; i < fieldList.length; i += 1) {
                    option = fieldList[i];
                    if (container.getVisibleFields().indexOf(option.order) != -1) {
                        stop = false;
                        Ext.Array.remove(fieldList, option);
                        break;
                    }
                }
                if (stop) break;
            }

            button.setAvailableOptionalFields(fieldList);

            if (fieldList.length) {
                this.showFieldsMenu(button);
            }
        }

        if (container && action === 'add' && type !== "name" && type !== "company") {
            container.addField();
        }
	},

    modifyContact: function(newContact, changedAttrs) {
        var contact = this.getItem(),
            me = this,
            data = {
                op:         'modify',
                newContact: newContact,
	            attrs:      changedAttrs
            };

        //send Modify Contacts request only if something was changed
        if (changedAttrs.length > 0) {
            this.performOp(contact, data, function() {
                me.hideContactForm();
                ZCS.app.fireEvent('showToast', ZtMsg.contactEdited);
                // Reload to show newly updated state of the contact
                me.getStore().load();
            });
        } else {
            me.hideContactForm();
        }
    },

    populateForm: function(contact) {

		var	panel = this.getContactPanel(),
			form = panel.down('formpanel'),
			value, formField;

	    // Create and populate the simple attrs
	    Ext.each(ZCS.constant.CONTACT_FIELDS, function(attr) {
		    value = contact.get(attr);
		    if (value) {
			    formField = form.down('field[name=' + attr + ']');
			    if (formField) {
                    formField.setValue(value);
                } else {
				    if (ZCS.constant.IS_EXTRA_NAME_FIELD[attr]) {
                        var container = panel.down('namecontainer');
                        container.addField({
                            mandatory: false,
                            value: value,
                            name: attr,
                            order: ZCS.constant.NAME_FIELDS_ORDER[attr]
                        });
				    }
				    if (ZCS.constant.IS_EXTRA_JOB_FIELD[attr]) {
                        var container = panel.down('companycontainer');
                        container.addField({
                            mandatory: false,
                            value: value,
                            name: attr,
                            order: ZCS.constant.COMPANY_FIELDS_ORDER[attr]
                        });
				    }
                }
		    }
	    }, this);

	    // Create as many fields as we need for each multiple-occurring attribute (at least one will be added)
	    var container;
	    Ext.each(ZCS.constant.CONTACT_MULTI_FIELDS, function(multiField) {
		    container = panel.down(multiField + 'container');
		    Ext.each(contact.get(multiField), function(field, index) {
			    container.addField();
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
		    curApp = ZCS.session.getActiveApp(),
		    folder = (curApp === ZCS.constant.APP_CONTACTS) ? ZCS.session.getCurrentSearchOrganizer() : null;

        contact.save({
	        folderId: folder ? folder.get('zcsId') : null,
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
	 * Returns true if the user has made changes to the contact form.
	 *
	 * @return {Boolean}    true if changes have been made
	 */
	isDirty: function() {

		if (this.getContactPanel().isHidden()) {
			return false;
		}

		var curContact = (this.getComposeMode() === ZCS.constant.OP_EDIT) ? this.getItem() : null,
			newContact = this.getContactModel(),
			changedAttrs = ZCS.model.contacts.ZtContact.getChangedAttrs(curContact, newContact);

		return changedAttrs && changedAttrs.length > 0;
	},

	/**
	 * Contact was modified, so re-display it.
	 */
	handleModifyNotification: function(item, modify) {

		if (this.getItem() !== item) {
			return;
		}
		if (modify._attrs != null || modify.t != null) {
			this.getContactView().showItem(item);
		}
	},

	/**
	 * Moves the contact to an address book.
	 *
	 * @param {ZtOrganizer}     folder      target folder
	 * @param {ZtMailItem}      item        item to move
	 */
	saveItemMove: function (folder, item) {

		var folderId = folder.get('zcsId'),
			me = this,
			data = {
				op:         'move',
				folderId:   folderId
			};

		this.performOp(item, data, function() {
			me.processMove(item, folderId);
		});
	},

	processMove: function(item, folderId) {

		var contactName = Ext.String.htmlEncode(item.get('longName')),
			addressBook = ZCS.cache.get(folderId).get('displayName');

		ZCS.app.fireEvent('showToast', Ext.String.format(ZtMsg.moveContact, contactName, addressBook));
	},

	/**
	 * Applies the given tag to the given contact.
	 *
	 * @param {ZtOrganizer}     tag     tag to apply or remove
	 * @param {ZtMailitem}      item    item to tag or untag
	 */
	saveItemTag: function (tag, item) {
		this.tagItem(item, tag.get('name'), false);
	},

    /**
     * Disable "Tag" action if user doesn't have any tags.
     */
    enableMenuItems: function(menu) {
        this.enableTagItem(menu);
    }
});
