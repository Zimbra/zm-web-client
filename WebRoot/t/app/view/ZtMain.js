/**
 * The main view is a tab panel with a tab for each app.
 */
Ext.define("ZCS.view.ZtMain", {

    extend: 'Ext.TabPanel',

	requires: [
		'ZCS.view.ZtAppView'
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

	    listeners: {
		    // track the current app via tab panel change
		    activeitemchange: function (tabPanel, tab, oldTab) {
			    ZCS.session.setActiveApp(tab.config.app);
		    }
	    }
    },

	initialize: function() {

		this.callParent(arguments);

		Ext.each(ZCS.constant.ALL_APPS, function(app) {
			var mainView = {
				title: ZCS.constant.TAB_TITLE[app],
				xtype: 'appview',
				itemId: app + 'view',
				app: app
			};
			this.add(mainView);
		}, this);

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
