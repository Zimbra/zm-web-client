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
 * This class represents a contact form that can be used to create or edit a contact. It has a toolbar
 * on top and the actual form below. The form has fields for entering various fields of the
 * contact. The toolbar has button to cancel or save the contact.
 *
 * @author Komal Kakani<kkakani@zimbra.com>
 */

Ext.define('ZCS.view.contacts.ZtContactForm', {

    extend: 'Ext.Sheet',

    requires: [
        'Ext.form.Panel',
        'Ext.field.Email',
        'Ext.field.Url',
        'Ext.field.Select',
        'Ext.field.Hidden',
        'Ext.Label',
        'ZCS.view.contacts.ZtMultiField',
        'ZCS.view.contacts.ZtNameField',
        'ZCS.view.contacts.ZtCompanyField',
        'ZCS.view.contacts.ZtEmailField',
        'ZCS.view.contacts.ZtPhoneField',
        'ZCS.view.contacts.ZtAddrField',
        'ZCS.view.contacts.ZtUrlField',
        'ZCS.view.contacts.ZtAddButton'
    ],

    xtype: 'contactpanel',

    config: {
        layout:     'fit',
        width:      Ext.os.deviceType === "Phone" ? '100%' : '80%',
        height:     '100%',
        scrollable: false,
        hidden:     true,
        modal:      true,
        cls:        'zcs-contact-form'
    },

    initialize: function() {

        var contactForm = this,

            toolbar = {
                xtype: 'titlebar',
                cls: 'zcs-item-titlebar contact-form-titlebar',
                docked: 'top',
                title: ZtMsg.createContact,
                items: [
                    {
                        xtype:  'button',
                        text:   ZtMsg.cancel,
                        cls:    'contact-form-action-button',
                        handler: function() {
                            this.up('contactpanel').fireEvent('cancel');
                        }
                    },
                    {
                        xtype:      'button',
                        text:       ZtMsg.save,
                        align:      'right',
                        cls:        'contact-form-action-button',
                        handler: function() {
                            this.up('contactpanel').fireEvent('save');
                        }
                    }
                ]
            },

            spacer = {
                xtype:  'spacer',
                cls:    'zcs-contact-spacer'
            },

            form = {
                xtype:      'formpanel',
                layout:     'vbox',
                itemId:     'formPanel',
                scrollable: true,
                defaults: {
                    labelWidth: '100px',
                    inputCls:   'zcs-form-input'
                },
                items: [
                    spacer,
                    {
                        xtype:      'namecontainer'
                    },
                    spacer,
                    {
                        xtype:      'companycontainer'
                    },
                        spacer,
                    {
                        xtype:      'emailcontainer'
                    },
                    spacer,
                    {
                        xtype:      'phonecontainer'
                    },
                    spacer,
                    {
                        xtype:      'addresscontainer'
                    },
                    spacer,
                    {
                        xtype:      'urlcontainer'
                    },
                    spacer
                ]
            };

        this.add([
            toolbar,
            form
        ]);
    },

    /**
     * Displays a set of optional fields, and hides the toggle.
     *
     * @param {String}  toggleId        DOM ID of toggle
     * @param {Array}   extraFields     list of fields to show
     */
    showExtraFields: function(toggleId, extraFields) {
        this.down('#' + toggleId).hide();
        Ext.each(extraFields, function(field) {
            this.down('field[name=' + field + ']').show();
        }, this);
    },

    // Shows the optional name fields
    showNameFields: function() {
        this.showExtraFields('nameFieldsToggle', ZCS.constant.EXTRA_NAME_FIELDS)
    },

    // Shows the optional job fields
    showJobFields: function() {
        this.showExtraFields('jobFieldsToggle', ZCS.constant.EXTRA_JOB_FIELDS)
    },

    // Resets the form back to its initial state
    resetForm: function () {
        this.down('titlebar').setTitle(ZtMsg.createContact);
        this.down('.formpanel').reset();

        Ext.each(ZCS.constant.CONTACT_FORM_FIELDS, function(type) {
                this.down(type + 'container').reset();
        }, this);
    }
});
