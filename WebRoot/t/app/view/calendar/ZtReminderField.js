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
 * This class displays the reminder field on the create appointment form.
 *
 * @author Komal Kakani <kkakani@zimbra.com>
 */
Ext.define('ZCS.view.calendar.ZtReminderField', {

    extend: 'Ext.Container',

    xtype: 'remindercontainer',

    config: {
        xtype: 'container',
        cls: 'create-appt-margin first last',
        layout: {
            type: 'hbox'
        },
        items: [
            {
                xtype:  'label',
                html:    ZtMsg.reminderLabel,
                cls:    'zcs-appt-label',
                flex:   1
            },
            {
                xtype:   'selectfield',
                name:    'reminderAlert',
                flex:     1,
                options: [ { text: ZtMsg.apptRemindNever, value: 0} ] ,
                listeners: {
                    painted: function() {
                        var arr = [];
                        for (var i = 0; i < ZCS.constant.reminderTimeDisplayMsgs.length; i++) {
                            var optLabel = Ext.String.format(ZCS.constant.reminderTimeDisplayMsgs[i], ZCS.constant.reminderTimeLabels[i]),
                                data = {text: optLabel, value:ZCS.constant.reminderTimeValues[i]};
                            arr.push(data);
                        }
                        this.setOptions(arr);
	                    this.setValue(ZCS.constant.defaultReminderValue);
                    }
                }
            }
        ]
    }
});
