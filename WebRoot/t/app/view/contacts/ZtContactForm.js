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
        'ZCS.view.contacts.ZtEmailField',
        'ZCS.view.contacts.ZtPhoneField',
        'ZCS.view.contacts.ZtAddrField',
        'ZCS.view.contacts.ZtUrlField'
    ],

    xtype: 'contactpanel',

    config: {
        layout:     'fit',
        width:      Ext.os.deviceType === "Phone" ? '100%' : '80%',
        height:     '100%',
        scrollable: true,
        hidden:     true,
        modal:      true,
        cls:        'zcs-contact-form'
    },

    initialize: function() {

        var contactForm = this,

            toolbar = {
                xtype: 'titlebar',
                cls: 'zcs-item-titlebar',
                docked: 'top',
                title: ZtMsg.createContact,
                items: [
                    {
                        xtype:  'button',
                        text:   ZtMsg.cancel,
                        ui:     'neutral',

                        handler: function() {
                            this.up('contactpanel').fireEvent('cancel');
                        }
                    },
                    {
                        xtype:      'button',
                        text:       ZtMsg.save,
                        align:      'right',
                        ui:         'green',
                        padding:    '0 2em',

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
                    {
                        layout: 'hbox',
                        items: [
                            {
                                xtype:  'container',
                                width:  '20%',
                                cls:    'zcs-contact-imgborder',
                                items:[
                                    {
                                        xtype:  'component',
                                        itemId: 'photofield',
                                        cls:    'zcs-contact-image'
                                    }
                                ]

                            },
                            {
                                xtype:  'container',
                                cls:    'zcs-contact-personalinfo',
                                layout: 'vbox',
                                items:[
                                    {
                                        xtype:  'container',
                                        layout: 'hbox',
                                        items:[
                                            {
                                                xtype:          'textfield',
                                                placeHolder:    ZtMsg.placeholderPrefix,
                                                hidden:         true,
                                                flex:           1,
                                                name:           'namePrefix'
                                            },
                                            {
                                                xtype:          'textfield',
                                                placeHolder:    ZtMsg.placeholderFirstName,
                                                flex:           2,
                                                name:           'firstName'
                                            },
                                            {
                                                width: '4.5em',
                                                height: '2.5em',
                                                xtype: 'component',
                                                html: ZtMsg.more,
                                                itemId: 'nameFieldsToggle',
                                                cls: 'x-form-label x-form-label-nowrap x-field zcs-toggle-field',
                                                listeners: {
                                                    painted: function () {
                                                        this.element.on('tap', function() {
	                                                        contactForm.showNameFields();
                                                        });
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        xtype:  'container',
                                        layout: 'hbox',
                                        items: [
                                            {
                                                xtype:          'textfield',
                                                placeHolder:    ZtMsg.placeholderMiddleName,
                                                hidden:         true,
                                                flex:           1,
                                                name:           'middleName'
                                            },
                                            {
                                                xtype:          'textfield',
                                                placeHolder:    ZtMsg.placeholderMaidenName,
                                                hidden:         true,
                                                flex:           1,
                                                name:           'maidenName'
                                            }

                                        ]
                                    },
                                    {
                                        xtype:  'container',
                                        layout: 'hbox',
                                        items:[
                                            {
                                                xtype:          'textfield',
                                                placeHolder:    ZtMsg.placeholderLastName,
                                                flex:           2,
                                                name:           'lastName'
                                            },
                                            {
                                                xtype:          'textfield',
                                                placeHolder:    ZtMsg.placeholderSuffix,
                                                hidden:         true,
                                                flex:           1,
                                                name:           'nameSuffix'
                                            },
                                            {
                                                xtype:          'textfield',
                                                placeHolder:    ZtMsg.placeholderNickname,
                                                hidden:         true,
                                                flex:           2,
                                                name:           'nickname'
                                            }
                                        ]
                                    },
                                    {
                                        xtype:  'container',
                                        layout: 'hbox',
                                        items:[
                                            {
                                                xtype:          'textfield',
                                                placeHolder:    ZtMsg.placeholderJobTitle,
                                                hidden:         true,
                                                flex:           1,
                                                name:           'jobTitle'
                                            },
                                            {
                                                xtype:          'textfield',
                                                placeHolder:    ZtMsg.placeholderDepartment,
                                                hidden:         true,
                                                flex:           1,
                                                name:           'department'
                                            }
                                        ]

                                    },
                                    {
                                        xtype:  'container',
                                        layout: 'hbox',
                                        items:[
                                            {
                                                xtype:          'textfield',
                                                placeHolder:    ZtMsg.placeholderCompany,
                                                flex:           1,
                                                name:           'company'
                                            },
                                            {
                                                width:      '4.5em',
                                                height:     '2.5em',
                                                xtype:      'component',
                                                html:       ZtMsg.more,
                                                itemId:     'jobFieldsToggle',
                                                cls:        'x-form-label x-form-label-nowrap x-field zcs-toggle-field',
                                                listeners: {
                                                    painted: function () {
                                                        this.element.on('tap', function() {
	                                                        contactForm.showJobFields();
                                                        });
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]

                    },
	                spacer,
                    {
                        xtype:      'emailcontainer',
                        labelName:  ZtMsg.email
                    },
	                spacer,
                    {
                        xtype:      'phonecontainer',
                        labelName:  ZtMsg.phone
                    },
	                spacer,
                    {
                        xtype:      'addresscontainer',
	                    labelName:  ZtMsg.address
                    },
	                spacer,
                    {
                        xtype:      'urlcontainer',
                        labelName:  ZtMsg.url
                    }
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
        this.down('#nameFieldsToggle').show();
        this.down('#jobFieldsToggle').show();
	    Ext.each(ZCS.constant.EXTRA_NAME_FIELDS.concat(ZCS.constant.EXTRA_JOB_FIELDS), function(field) {
		    this.down('field[name=' + field + ']').hide();
	    }, this);

	    Ext.each(ZCS.constant.CONTACT_MULTI_FIELDS, function(type) {
		    this.down(type + 'container').reset();
	    }, this);
    }
});
