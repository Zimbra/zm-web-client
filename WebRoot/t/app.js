//<debug>
Ext.Loader.setPath({
    'Ext': '/t/touch/src',
    'ZCS': '/t/app'
});
//</debug>

// Load templates
Ext.require([
	'Ext.Ajax',
	'ZCS.common.ZtTemplate'
], function() {
	ZCS.common.ZtTemplate.loadTemplates();
});

// Define and run the app
Ext.application({

    name: 'ZCS',

    requires: [
        'Ext.MessageBox',

	    'ZCS.common.ZtLogger',
	    'ZCS.common.ZtUtil',
	    'ZCS.common.ZtHtmlUtil',
	    'ZCS.common.mail.ZtMailUtil',
	    'ZCS.common.ZtConstants',
	    'ZCS.common.ZtTemplate',
	    'ZCS.common.ZtItemCache',
	    'ZCS.common.ZtUserSession'
    ],

	logger: {
		enabled: true,
		xclass: 'ZCS.common.ZtLogger',
		minPriority: 'verbose',
		writers: {
			console: {
				xclass: 'Ext.log.writer.Console',
				throwOnErrors: true,
				formatter: {
					xclass: 'Ext.log.formatter.Default'
				}
			}
		}
	},

	controllers: [
		'ZCS.controller.ZtMainController',
		'ZCS.controller.ZtToastController',
		'ZCS.controller.mail.ZtConvListController',
		'ZCS.controller.mail.ZtConvController',
		'ZCS.controller.mail.ZtMsgController',
		'ZCS.controller.mail.ZtComposeController',
		'ZCS.controller.contacts.ZtContactListController',
		'ZCS.controller.contacts.ZtContactController'
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

	    Ext.Logger.getWriters().console.getFormatter().setMessageFormat('{message}');

	    // Process the inline data (GetInfoResponse and SearchResponse)
	    ZCS.common.ZtUserSession.initSession(window.inlineData);

	    Ext.Logger.info('STARTUP: app launch');

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
	}
});
