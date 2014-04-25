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
 * This class displays the display status field on the create appointment form.
 *
 * @author Komal Kakani <kkakani@zimbra.com>
 */
Ext.define('ZCS.view.calendar.ZtStatusField', {

    extend: 'Ext.Container',

    xtype: 'fbstatuscontainer',

    config: {
        cls: 'create-appt-margin last',
        layout: {
              type: 'hbox'
        },
        items: [
            {
                xtype:  'label',
                html:    ZtMsg.display,
                cls:    'zcs-appt-label',
                flex:   1
            },
            {
                xtype: 'selectfield',
                name:   'displayStatus',
                flex:   1,
                options: [ {text: ZtMsg.busy, value: "B"} ],
                listeners: {
                    painted: function() {
                        var arr = [];
                        for (var i = 0; i < ZCS.constant.SHOWAS_OPTIONS.length; i++) {
                            var data = {text: ZCS.constant.SHOWAS_OPTIONS[i].label, value:ZCS.constant.SHOWAS_OPTIONS[i].value};
                            arr.push(data);
                        }
                        this.setOptions(arr);
                    }
                }

            }
        ]
    }
});