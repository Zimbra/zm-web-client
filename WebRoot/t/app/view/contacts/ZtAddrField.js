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
 * This class displays the address field on the contact form.
 *
 * @author Komal Kakani <kkakani@zimbra.com>
 */
Ext.define('ZCS.view.contacts.ZtAddrField', {
    extend: 'Ext.Container',
    xtype: 'addrcontainer',
    config: {
        layout:{type: 'hbox'},
        docked: 'bottom',
        items: [
            {
                xtype: 'label',
                html: ZtMsg.address,
                cls: 'zcs-contact-label',
                width: '20%'
            },
            {
                layout: {type:'vbox'},
                width: '80%',
                items: [
                    {
                        layout: {type:'hbox'},
                        items:[
                            {
                                xtype:'textfield',
                                placeHolder: ZtMsg.streetAdd,
                                name: 'street',
                                flex: 1,
                                width: '71%'
                            },
                            {
                                xtype: 'selectfield',
                                name: 'addresstype',
                                options: [
                                    {text: ZtMsg.home,  value: 'home'},
                                    {text: ZtMsg.work, value: 'work'},
                                    {text: ZtMsg.other,  value: 'other'}
                                ],
                                width: '15%'
                            },
                            {
                                xtype: 'button',
                                iconCls: 'plus',
                                itemId: 'btnAddAddr',
                                width: '7%',
                                iconMask: true,
                                align: 'right',
                                cls: 'zcs-flat zcs-contact-addremove'
                            },
                            {
                                xtype: 'button',
                                iconCls: 'minus',
                                itemId: 'btnRemoveAddr',
                                width: '7%',
                                iconMask: true,
                                align: 'right',
                                cls: 'zcs-flat zcs-contact-addremove'
                            }
                        ]
                    },
                    {
                        layout: {type: 'hbox'},
                        items: [
                            {
                                xtype: 'textfield',
                                name: 'city',
                                placeHolder: ZtMsg.city,
                                flex:1
                            },
                            {
                                xtype: 'textfield',
                                name: 'state',
                                placeHolder: ZtMsg.state,
                                flex:1
                            },
                            {
                                xtype: 'textfield',
                                name: 'postalcode',
                                placeHolder: ZtMsg.postalcode,
                                flex:1
                            }
                        ]
                    },
                    {
                        layout: {type:'hbox'},
                        items:[
                            {
                                xtype: 'textfield',
                                name: 'country',
                                placeHolder: ZtMsg.country,
                                flex:1
                            }
                        ]
                    }
                ]


            }
        ]
    }
})
