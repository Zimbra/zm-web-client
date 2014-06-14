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
        cls:   'zcs-status-field',
        layout: {
              type: 'hbox'
        }
    },

    initialize: function() {
        var me = this;
        this.callParent(arguments);

        this.add({
            xtype:  'label',
            html:    ZtMsg.display,
            cls:    'zcs-appt-label',
            flex:    1
        });

        this.add({
            xtype:  'selectfield',
            cls:    'zcs-appt-value-withlabel',
            name:   'fb',
            flex:    1,
            value:  'B',
            options: me.setStatusOptions()
        });
    },

    setStatusOptions: function() {
        var arr = [];
        for (var i = 0; i < ZCS.constant.SHOWAS_OPTIONS.length; i++) {
            var data = {text: ZCS.constant.SHOWAS_OPTIONS[i].label, value:ZCS.constant.SHOWAS_OPTIONS[i].value};
            arr.push(data);
        }
        return arr;
    }
});