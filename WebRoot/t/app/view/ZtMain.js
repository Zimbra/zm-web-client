Ext.define("ZCS.view.ZtMain", {
    extend: 'Ext.TabPanel',
	requires: [
		'ZCS.view.mail.ZtMailView',
		'ZCS.view.contacts.ZtContactsView'
	],
    config: {
	    fullscreen: true,
        tabBarPosition: 'top',
	    defaults: {
		    styleHtmlContent: true
	    },
	    layout: {
		    animation: {
			    type: 'fade'
		    }
	    },
	    items: [
		    {
			    title: 'Mail',
			    xtype: 'mailview',
			    app: ZCS.constant.APP_MAIL
			},
		    {
			    title: 'Contacts',
			    xtype: 'contactsview',
			    app: ZCS.constant.APP_CONTACTS
		    }
	    ],
	    listeners: {
		    activeitemchange: function (tabPanel, tab, oldTab) {
			    ZCS.session.setActiveApp(tab.config.app);
		    }
	    }
    },

	initialize: function() {

		this.callParent(arguments);

		// Place some branding text on the right side of the tab bar
		this.getTabBar().add([
			{
				xtype: 'spacer'
			},
			{
				xtype: 'label',
				html: 'VMware Zimbra',
				style: 'color:white;'
			}
		]);
	}
});
