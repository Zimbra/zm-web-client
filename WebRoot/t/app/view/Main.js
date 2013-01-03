Ext.define("ZCS.view.Main", {
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
		    type: 'card',
		    animation: {
			    type: 'fade'
		    }
	    },
	    items: [
		    {
			    title: 'Mail',
			    xtype: 'mailview'
			},
		    {
			    title: 'Contacts',
			    xtype: 'contactsview'
		    }
	    ]
     }
});
