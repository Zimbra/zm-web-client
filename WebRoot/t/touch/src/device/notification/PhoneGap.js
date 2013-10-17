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
 * @private
 */
Ext.define('Ext.device.notification.PhoneGap', {
    extend: 'Ext.device.notification.Abstract',
    requires: ['Ext.device.Communicator'],

    show: function() {
        var config = this.callParent(arguments),
            buttons = config.buttons,
            onShowCallback = function (index) {
                if (config.callback) {
                    config.callback.apply(config.scope, (config.buttons) ? [config.buttons[index - 1].itemId.toLowerCase()] : []);
                }
            };

         // change Ext.MessageBox buttons into normal arrays
        var ln = buttons.length;
        if (ln && typeof buttons[0] != "string") {
            var newButtons = [],
                i;

            for (i = 0; i < ln; i++) {
                newButtons.push(buttons[i].text);
            }

            buttons = newButtons.join(',');
        }

        navigator.notification.confirm(
            config.message, // message
            onShowCallback, // callback
            config.title, // title
            buttons // array of button names
        );
    },

    vibrate: function() {
        navigator.notification.vibrate(2000);
    }
});
