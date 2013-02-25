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
		'ZCS.controller.mail.ZtConvListController',
		'ZCS.controller.mail.ZtConvController',
		'ZCS.controller.mail.ZtMsgController',
		'ZCS.controller.mail.ZtMsgAddressController',
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

	// items for settings menu
	menuData: [
		{ label: ZtMsg.logout, action: 'LOGOUT', listener: 'doLogout' }
	],

    launch: function() {
        // Destroy the #appLoadingIndicator element
        Ext.fly('appLoadingIndicator').destroy();

	    Ext.Logger.getWriters().console.getFormatter().setMessageFormat('{message}');

	    // Process the inline data (GetInfoResponse and SearchResponse)
	    ZCS.common.ZtUserSession.initSession(window.inlineData);

	    Ext.Logger.info('STARTUP: app launch');

        // Initialize the main view
        Ext.Viewport.add(Ext.create('ZCS.view.ZtMain'));
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

	setMenuItems: function() {
		var menuData = this.config.menuData;
		Ext.each(menuData, function(menuItem) {
			menuItem.listener = Ext.bind(this[menuItem.listener], this);
		}, this);
		this.menu.setMenuItems(menuData);
	},

	doShowMenu: function(button) {
		Ext.Logger.info('Settings menu (app)');
		var menu = this.menu;
		if (!menu) {
			menu = this.menu = Ext.create('ZCS.common.ZtMenu');
			this.setMenuItems();
		}
		menu.setReferenceComponent(button);
		menu.popup();
	},

	/**
	 * Logs off the application
	 */
	doLogout: function() {
		window.location.href = "/?loginOp=logout";
	},

	// Convenience methods for getting controllers

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
