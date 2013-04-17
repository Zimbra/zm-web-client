/*
 * ***** BEGIN LICENSE BLOCK *****
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

	alias: 'widget.ztmain',

    config: {
	    fullscreen: true,
        tabBarPosition: 'top',
        cls: 'zcs-main-tabs',
        ui: 'dark',
	    defaults: {
		    styleHtmlContent: true
	    },
	    layout: {
		    animation: {
			    type: 'fade'
		    }
	    }
    },

	initialize: function() {
		var numTabs = 0;

		this.callParent(arguments);

		Ext.each(ZCS.constant.APPS, function(app) {
			if (ZCS.session.getSetting(ZCS.constant.APP_SETTING[app])) {
				var mainView = {
					title: ZCS.constant.TAB_TITLE[app],
					xtype: 'appview',
					itemId: app + 'view',
					app: app
				};
				numTabs += 1;
				this.add(mainView);
			}
		}, this);

		//Hide buttons in tab bar if only one button
		if (numTabs < 2) {
			this.getTabBar().addCls('zcs-no-tabs-showing');
		}

		// Place some branding text on the right side of the tab bar
		this.getTabBar().add([
			{
				xtype: 'spacer'
			},
			{
				xtype: 'component',
                cls: 'zcs-banner-image'
			},
			{
				xtype: 'button',
				cls: 'zcs-flat',
				handler: function() {
					this.up('tabbar').fireEvent('showMenu', this, { menuName: 'settings' });
				},
				iconCls: 'settings9',
				iconMask: true
			}
		]);
	}
});
