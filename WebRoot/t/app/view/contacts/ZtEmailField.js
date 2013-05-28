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
 * This class displays the email field on the contact form.
 *
 * @author Komal Kakani <kkakani@zimbra.com>
 */
Ext.define('ZCS.view.contacts.ZtEmailField', {
    extend: 'Ext.Container',
    xtype: 'emailcontainer',
    config: {
        layout: {type:'hbox'},
        labelName: '',
        docked: 'bottom',
        items: [
            {
                xtype: 'label',
                html: '',
                cls: 'zcs-contact-label',
                width: '20%'
            },
            {
                layout: {type:'hbox'},
                width: '80%',
                items: [
                    {
                        xtype: 'emailfield',
                        placeHolder: ZtMsg.email,
                        name: 'email',
                        width: '86%'
                    },
                    {
                        xtype: 'button',
                        iconCls: 'plus',
                        itemId: 'btnAddEmail',
                        width: '7%',
                        iconMask: true,
                        align: 'right',
                        cls: 'zcs-flat zcs-contact-addremove'
                    },
                    {
                        xtype: 'button',
                        iconCls: 'minus',
                        itemId: 'btnRemoveEmail',
                        width: '7%',
                        iconMask: true,
                        align: 'right',
                        cls: 'zcs-flat zcs-contact-addremove'
                    }
                ]
            }
        ]
    },
    initialize: function() {
        this.getItems().items[0].setHtml(this.getLabelName());
    }
});
