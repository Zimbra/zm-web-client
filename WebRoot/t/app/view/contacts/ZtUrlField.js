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
 * This class displays the url field on the contact form.
 *
 * @author Komal Kakani <kkakani@zimbra.com>
 */
Ext.define('ZCS.view.contacts.ZtUrlField', {
    extend: 'Ext.Container',
    xtype: 'urlcontainer',

    config: {
        layout: { type:'hbox'},
        docked: 'bottom',
        labelName: '',
        items:[
            {
                xtype: 'label',
                style: {
                    'text-align': 'right',
                    'padding': '12px',
                    'background-color': '#f7f7f7'
                },
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
                                xtype: 'urlfield',
                                placeHolder: ZtMsg.url,
                                name: 'url',
                                width: '71%'
                            },
                            {
                                xtype: 'selectfield',
                                name: 'urltype',
                                options: [
                                    {text: ZtMsg.home,  value: 'home'},
                                    {text: ZtMsg.work, value: 'work'},
                                    {text: ZtMsg.other,  value: 'other'}
                                ],
                                width: '15%'
                            },
                            {
                                xtype: 'button',
                                iconCls: 'add1',
                                itemId: 'btnAddUrl',
                                width: '7%',
                                iconMask: true,
                                align: 'right',
                                cls: 'zcs-flat zcs-contact-addremove'
                            },
                            {
                                xtype: 'button',
                                iconCls: 'minus2',
                                itemId: 'btnRemoveUrl',
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
})