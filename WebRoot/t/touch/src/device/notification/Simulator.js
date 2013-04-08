/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
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
 * 
 * ***** END LICENSE BLOCK *****
 */
/**
 * @private
 */
Ext.define('Ext.device.notification.Simulator', {
    extend: 'Ext.device.notification.Abstract',
    requires: ['Ext.MessageBox'],

    // @private
    msg: null,

	show: function() {
        var config = this.callParent(arguments),
            buttons = [],
            ln = config.buttons.length,
            button, i, callback, msg;

        //buttons
        for (i = 0; i < ln; i++) {
            button = config.buttons[i];
            if (Ext.isString(button)) {
                button = {
                    text: config.buttons[i],
                    itemId: config.buttons[i].toLowerCase()
                };
            }

            buttons.push(button);
        }

        this.msg = Ext.create('Ext.MessageBox');

        msg = this.msg;

        callback = function(itemId) {
            if (config.callback) {
                config.callback.apply(config.scope, [itemId]);
            }
        };

        this.msg.show({
            title  : config.title,
            message: config.message,
            scope  : this.msg,
            buttons: buttons,
            fn     : callback
        });
    },

    vibrate: function() {
        //nice animation to fake vibration
        var animation = [
            "@-webkit-keyframes vibrate{",
            "    from {",
            "        -webkit-transform: rotate(-2deg);",
            "    }",
            "    to{",
            "        -webkit-transform: rotate(2deg);",
            "    }",
            "}",

            "body {",
            "    -webkit-animation: vibrate 50ms linear 10 alternate;",
            "}"
        ];

        var head = document.getElementsByTagName("head")[0];
        var cssNode = document.createElement('style');
        cssNode.innerHTML = animation.join('\n');
        head.appendChild(cssNode);

        setTimeout(function() {
            head.removeChild(cssNode);
        }, 400);
    }
});
