/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * An app panel consists of an overview (which shows the app's folder tree), a list of items,
 * and a panel that shows the details of a single item.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.view.ZtAppView', {

	extend: 'Ext.Container',

	requires: [
		'Ext.field.Text',
		'Ext.Label',

		'ZCS.view.ZtOverview',
		'ZCS.view.ZtListPanel',
		'ZCS.view.ZtItemPanel'
	],

	xtype: 'appview',

	config: {
		layout: 'hbox',
		padding: 0,
		app: null
	},

	initialize: function() {

		this.callParent(arguments);

		var app = this.getApp();

		if (app !== ZCS.constant.APP_CALENDAR) {
			this.registerListPanel({
				xtype: 'listpanel',
				itemId: app + 'listpanel',
				app: app,
				newButtonIcon: ZCS.constant.NEW_ITEM_ICON[app],
				storeName: ZCS.constant.STORE[app]
			});
		}

		this.registerItemPanel({
			xtype: 'itempanel',
			itemId: app + 'itempanel',
			app: app
		});
	},

	registerListPanel: function (listPanelConfig) {
		this.fireEvent('registerListPanel', listPanelConfig, this, ZCS.constant.SIDE_MENU_CONFIG);
	},

	registerItemPanel: function (itemPanelConfig) {
		this.fireEvent('registerItemPanel', itemPanelConfig, this, ZCS.constant.SIDE_MENU_CONFIG);
	}
});
