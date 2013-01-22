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

	    'ZCS.common.ZtUtil',
	    'ZCS.common.ZtConstants',
	    'ZCS.common.ZtTemplate',
	    'ZCS.common.ZtUserSession',
	    'ZCS.model.ZtEmailAddress'
    ],

	controllers: [
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
	    console.log('STARTUP: app launch');
        // Destroy the #appLoadingIndicator element
        Ext.fly('appLoadingIndicator').destroy();

	    // Process the inline data (GetInfoResponse and SearchResponse)
	    ZCS.common.ZtUserSession.initSession(window.inlineData);

        // Initialize the main view
        Ext.Viewport.add(Ext.create('ZCS.view.ZtMain'));
    },

    onUpdated: function() {
        Ext.Msg.confirm(
            "Application Update",
            "This application has just successfully been updated to the latest version. Reload now?",
            function(buttonId) {
                if (buttonId === 'yes') {
                    window.location.reload();
                }
            }
        );
    }
});
