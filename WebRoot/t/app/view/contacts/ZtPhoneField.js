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
 * This class displays the phone field on the contact form.
 *
 * @author Komal Kakani <kkakani@zimbra.com>
 */
Ext.define('ZCS.view.contacts.ZtPhoneField', {
    extend: 'Ext.Container',
    xtype: 'phonecontainer',
    //phone
    config: {
        layout: { type:'hbox'},
        docked: 'bottom',
        labelName: '',
        items:[
        {
            xtype: 'label',
            html: '',
            cls: 'zcs-contact-label',
            width: '20%'
        },
        {
            layout: {type:'vbox'},
            width: '80%',
            items: [
                {
                    layout: {type:'hbox'},
                    items: [
                            {
                                xtype: 'textfield',
                                component:{type: 'tel'},
                                placeHolder: ZtMsg.phone,
                                name: 'phonenumber',
                                width: '71%'
                            },
                            {
                                xtype: 'selectfield',
                                name: 'phonetype',
                                options: [
                                    {text: ZtMsg.mobile,  value: 'mobile'},
                                    {text: ZtMsg.work, value: 'work'},
                                    {text: ZtMsg.other,  value: 'other'}
                                ],
                                width: '15%'
                            },
                            {
                                xtype: 'button',
                                iconCls: 'plus',
                                itemId: 'btnAddPhone',
                                width: '7%',
                                iconMask: true,
                                align: 'right',
                                cls: 'zcs-flat zcs-contact-addremove'
                            },
                            {
                                xtype: 'button',
                                iconCls: 'minus',
                                itemId: 'btnRemovePhone',
                                width: '7%',
                                iconMask: true,
                                align: 'right',
                                cls: 'zcs-flat zcs-contact-addremove'
                            }
                    ]
                }
            ]
        }
    ]
    },
    initialize: function() {
        this.getItems().items[0].setHtml(this.getLabelName());
    }
});