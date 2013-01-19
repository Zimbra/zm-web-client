/**
 * An app panel consists of an overview (which shows the app's folder tree), a list of items,
 * and a panel that shows the details of a single item.
 */
Ext.define('ZCS.view.ZtAppView', {

	extend: 'Ext.Container',

	requires: [
		'Ext.Panel',
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

		var overview = {
			width: '20%',
			hidden: true,

			xtype: 'overview',
			itemId: app + 'overview',

			app: app,
			model: ZCS.constant.OVERVIEW_MODEL[app],
			title: ZCS.constant.OVERVIEW_TITLE[app]
		};

		var listPanel = {
			width: '30%',

			xtype: 'listpanel',
			itemId: app + 'listpanel',

			app: app,
			newButtonIcon: ZCS.constant.NEW_ITEM_ICON[app],
			storeName: ZCS.constant.STORE[app]
		};

		var itemPanel = {
			width: '70%',

			xtype: 'itempanel',
			itemId: app + 'itempanel',

			app: app
		};

		this.add([
			overview,
			listPanel,
			itemPanel
		]);
	}
});
