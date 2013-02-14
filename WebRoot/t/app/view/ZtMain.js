/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra, Inc.
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * The main view is a tab panel with a tab for each app.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
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

		Ext.each(ZCS.constant.APPS, function(app) {
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
				html: ZtMsg.bannerText,
				style: 'color:white;'
			}
		]);
	}
});
