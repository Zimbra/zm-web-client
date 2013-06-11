/*
 * ***** BEGIN LICENSE BLOCK *****
 *
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
 *
 * ***** END LICENSE BLOCK *****
 */
//<debug>
Ext.Loader.setPath({
    'Ext': 'touch/src',
    'ZCS': 'app'
});
//</debug>

// Load utils and templates
Ext.require([
	'ZCS.common.ZtUtil',
	'ZCS.common.ZtTemplate'
]);

//<feature logger>
Ext.require('ZCS.common.ZtLogger');
//</feature>

// Define and run the app
Ext.application({

    name: 'ZCS',

    requires: [
        'Ext.MessageBox',
	    'ZCS.common.ZtHtmlUtil',
	    'ZCS.common.mail.ZtMailUtil',
	    'ZCS.common.ZtConstants',
	    'ZCS.common.ZtTemplate',
	    'ZCS.common.ZtItemCache',
	    'ZCS.common.ZtUserSession',
        'ZCS.common.ZtTimezone'
    ],
    //<feature logger>
	logger: {
		enabled: true,
		xclass: 'ZCS.common.ZtLogger',
		minPriority: 'verbose',
		writers: {
			console: {
				xclass: 'Ext.log.writer.Console',
				throwOnErrors: false,
				formatter: {
					xclass: 'Ext.log.formatter.Default'
				}
			}
		}
	},
    //</feature>

	controllers: [
		'ZCS.controller.ZtAppViewController',
		'ZCS.controller.ZtMainController',
		'ZCS.controller.ZtToastController',
		'ZCS.controller.ZtNotificationController',
		'ZCS.controller.mail.ZtConvListController',
		'ZCS.controller.mail.ZtConvController',
		'ZCS.controller.mail.ZtMsgController',
		'ZCS.controller.mail.ZtComposeController',
		'ZCS.controller.contacts.ZtContactListController',
		'ZCS.controller.contacts.ZtContactController',
        'ZCS.controller.calendar.ZtCalendarController'
	],

    views: ['ZtMain'],

    icon: {
        '57': 'resources/icons/Icon.png',
        '72': 'resources/icons/Icon~ipad.png',
        '114': 'resources/icons/Icon@2x.png',
        '144': 'resources/icons/Icon~ipad@2x.png'
    },

    isIconPrecomposed: true,

    startupImage: {
        '320x460': 'resources/startup/320x460.jpg',
        '640x920': 'resources/startup/640x920.png',
        '768x1004': 'resources/startup/768x1004.png',
        '748x1024': 'resources/startup/748x1024.png',
        '1536x2008': 'resources/startup/1536x2008.png',
        '1496x2048': 'resources/startup/1496x2048.png'
    },

    launch: function() {
        // Destroy the #appLoadingIndicator element
        Ext.fly('appLoadingIndicator').destroy();

		//<debug>
	    Ext.Logger.getWriters().console.getFormatter().setMessageFormat('{message}');
	    //</debug>

	    // Process the inline data (GetInfoResponse and SearchResponse)
	    ZCS.common.ZtUserSession.initSession(window.inlineData);

        //<debug>
	    Ext.Logger.info('STARTUP: app launch');
        //</debug>
	    // Note: initial view created by ZtMainController
    },

    onUpdated: function() {
        Ext.Msg.confirm(
            ZtMsg.appUpdateTitle,
	        ZtMsg.appUpdateMsg,
            function(buttonId) {
                if (buttonId === 'yes') {
                    window.location.reload();
                }
            }
        );
    },

	// Convenience methods for getting controllers

	getMainController: function() {
		return this.getController('ZCS.controller.ZtMainController');
	},

	getComposeController: function() {
		return this.getController('ZCS.controller.mail.ZtComposeController');
	},

	getConvListController: function() {
		return this.getController('ZCS.controller.mail.ZtConvListController');
	},

	getConvController: function() {
		return this.getController('ZCS.controller.mail.ZtConvController');
	},

	getMsgController: function() {
		return this.getController('ZCS.controller.mail.ZtMsgController');
	},

	getContactListController: function() {
		return this.getController('ZCS.controller.contacts.ZtContactListController');
	},

	getContactController: function() {
		return this.getController('ZCS.controller.contacts.ZtContactController');
	},

    getCalendarController: function() {
        return this.getController('ZCS.controller.calendar.ZtCalendarController');
    }
});
