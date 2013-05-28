/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2012, 2013 VMware, Inc.
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
 * This class represents a contact form that can be used to create a contact. It has a toolbar
 * on top and the actual form below. The form has fields for entering various fields of the
 * contact. The toolbar has button to cancel or save the contact.
 *
 * @author Komal Kakani<kkakani@zimbra.com>
 */

Ext.define('ZCS.view.contacts.ZtContactForm', {
    extend: 'Ext.Sheet',

    requires:
        [
            'Ext.form.Panel',
            'Ext.field.Email',
            'Ext.field.Url',
            'Ext.field.Select',
            'Ext.field.Hidden',
            'Ext.Label',
            'ZCS.view.contacts.ZtEmailField',
            'ZCS.view.contacts.ZtPhoneField',
            'ZCS.view.contacts.ZtAddrField',
            'ZCS.view.contacts.ZtUrlField'
        ],
    xtype: 'contactpanel',

    config: {
        layout: 'fit',
        width: '80%',
        height: '100%',
        scrollable: true,
        hidden: true,
        modal: true,
        cls: 'zcs-contact-form'
    },

    initialize: function() {
        var contactForm = this,
            toolbar = {
                xtype: 'titlebar',
                docked: 'top',
                title: 'Create Contact',
                items: [
                    {
                        xtype: 'button',
                        text: ZtMsg.cancel,
                        ui: 'neutral',
                        handler: function() {
                            this.up('contactpanel').fireEvent('cancel');
                        }
                    },
                    {
                        xtype: 'button',
                        text: ZtMsg.save,
                        align: 'right',
                        ui: 'green',
                        padding: '0 2em',
                        handler: function() {
                            this.up('contactpanel').fireEvent('create');
                        }
                    }
                ]
            }, form = {
                xtype: 'formpanel',
                itemId: 'formPanel',
                scrollable: true,
                defaults: {
                    labelWidth: '100px',
                    inputCls: 'zcs-form-input'
                },
                layout: {
                    type: 'vbox'
                },
                items: [
                    {
                        //Personal info container
                        layout: {
                            type: 'hbox'
                        },
                        items: [
                            {
                                xtype: 'container',
                                width: '20%',
                                cls: 'zcs-contact-imgborder',
                                items:[
                                    {
                                        xtype: 'component',
                                        itemId: 'photofield',
                                        cls: 'zcs-contact-image'
                                    }
                                ]

                            },
                            {
                                xtype: 'container',
                                cls: 'zcs-contact-personalinfo',
                                layout: {
                                    type: 'vbox'
                                },

                                items:[
                                    {
                                        xtype:'container',
                                        layout: {
                                            type:'hbox'
                                        },
                                        items:[
                                            {
                                                xtype:'textfield',
                                                placeHolder: 'Prefix',
                                                hidden:true,
                                                flex:1,
                                                name:'namePrefix',
                                                itemId: 'prefix'
                                            },
                                            {
                                                xtype:'textfield',
                                                placeHolder: 'First Name',
                                                hidden:false,
                                                flex:2,
                                                name:'firstName'
                                            },
                                            {
                                                width: '4.5em',
                                                height: '2.5em',
                                                xtype: 'component',
                                                html: 'More',
                                                itemId: 'more1Toggle',
                                                cls: 'x-form-label x-form-label-nowrap x-field zcs-toggle-field',
                                                listeners: {
                                                    painted: function () {
                                                        this.element.on('tap', function() {
                                                            contactForm.showPersonalDetails();
                                                        });
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        xtype: 'container',
                                        layout: {type:'hbox'},
                                        items:[
                                            {
                                                xtype:'textfield',
                                                placeHolder: 'Middle',
                                                hidden:true,
                                                flex:1,
                                                name:'middleName',
                                                itemId: 'middle'
                                            },
                                            {
                                                xtype:'textfield',
                                                placeHolder: 'Maiden',
                                                hidden:true,
                                                flex:1,
                                                name:'maidenName',
                                                itemId: 'maiden'
                                            }

                                        ]
                                    },
                                    {
                                        xtype: 'container',
                                        layout: {type:'hbox'},
                                        items:[
                                            {
                                                xtype:'textfield',
                                                placeHolder: 'Last Name',
                                                hidden:false,
                                                flex:2,
                                                name:'lastName'
                                            },
                                            {
                                                xtype:'textfield',
                                                placeHolder: 'Suffix',
                                                hidden:true,
                                                flex:1,
                                                name:'nameSuffix',
                                                itemId: 'suffix'
                                            }
                                        ]
                                    },
                                    {
                                        xtype: 'container',
                                        layout:{type:'hbox'},
                                        items:[
                                            {
                                                xtype:'textfield',
                                                placeHolder: 'Job Title',
                                                hidden:true,
                                                flex:1,
                                                name:'jobTitle',
                                                itemId: 'jtitle'
                                            },
                                            {
                                                xtype:'textfield',
                                                placeHolder: 'Department',
                                                hidden:true,
                                                flex:1,
                                                name:'department',
                                                itemId: 'dept'
                                            }
                                        ]

                                    },
                                    {
                                        xtype:'container',
                                        layout: {type:'hbox'},
                                        items:[
                                            {
                                                xtype:'textfield',
                                                placeHolder: 'Company',
                                                hidden:false,
                                                flex:1,
                                                name:'company'
                                            },
                                            {
                                                width: '4.5em',
                                                height: '2.5em',
                                                xtype: 'component',
                                                html: 'More',
                                                itemId: 'more2Toggle',
                                                cls: 'x-form-label x-form-label-nowrap x-field zcs-toggle-field',
                                                listeners: {
                                                    painted: function () {
                                                        this.element.on('tap', function() {
                                                            contactForm.showJobDetails();
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
                    {
                        xtype:'spacer',
                        cls: 'zcs-contact-spacer'
                    },
                    {
                        //email
                        xtype:'emailcontainer',
                        docked: '',
                        labelName: ZtMsg.email
                    },
                    {
                        xtype:'spacer',
                        cls: 'zcs-contact-spacer'
                    },
                    {
                        //phone
                        xtype:'phonecontainer',
                        docked: '',
                        labelName: ZtMsg.phone
                    },
                    {
                        xtype:'spacer',
                        cls: 'zcs-contact-spacer'
                    },
                    {
                        //Address
                        xtype: 'addrcontainer',
                        docked: ''
                    },
                    {
                        xtype:'spacer',
                        cls: 'zcs-contact-spacer'
                    },
                    {
                        //url
                        xtype:'urlcontainer',
                        docked: '',
                        labelName: ZtMsg.url
                    },
                    {
                        xtype: 'hiddenfield',
                        name: 'contactItemId'
                    }
                ]
            };
        this.add([
            toolbar,
            form
        ]);
    },

    showPersonalDetails: function() {
        this.down('#more1Toggle').hide();
        this.down('#prefix').show();
        this.down('#middle').show();
        this.down('#maiden').show();
        this.down('#suffix').show();
    },

    showJobDetails: function() {
        this.down('#more2Toggle').hide();
        this.down('#jtitle').show();
        this.down('#dept').show();
    },

    resetForm: function () {
        this.down('.formpanel').reset();
        this.down('#more1Toggle').show();
        this.down('#more2Toggle').show();
        this.down('#prefix').hide();
        this.down('#middle').hide();
        this.down('#maiden').hide();
        this.down('#suffix').hide();
        this.down('#jtitle').hide();
        this.down('#dept').hide();

        var numEmails = this.down('.emailcontainer').getItems().length - 1;
        while (numEmails > 1) {
            this.down('.emailcontainer').getItems().items[numEmails].destroy();
            numEmails--;
        }

        var numPhones = this.down('.phonecontainer').getItems().length - 1;
        while (numPhones > 1) {
            this.down('.phonecontainer').getItems().items[numPhones].destroy();
            numPhones--;
        }

        var numAddrs = this.down('.addrcontainer').getItems().length - 1;
        while (numAddrs > 1) {
            this.down('.addrcontainer').getItems().items[numAddrs].destroy();
            numAddrs--;
        }

        var numUrls = this.down('.urlcontainer').getItems().length - 1;
        while (numUrls > 1) {
            this.down('.urlcontainer').getItems().items[numUrls].destroy();
            numUrls--;
        }
    }
});
