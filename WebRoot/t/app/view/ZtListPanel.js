Ext.define('ZCS.view.ZtListPanel', {

	extend: 'Ext.Panel',

	requires: [
		'Ext.dataview.List',
		'Ext.TitleBar',
		'Ext.field.Search'
	],

	config: {
		layout: 'fit',
		style:  'border: solid blue 1px;',
		app: null,
		listPanelTitle: null,
		newItemIconCls: null,
		listPanelStoreName: null
	},

	initialize: function() {

		this.callParent(arguments);

		var app = this.getApp(),
			parentXtype = ZCS.constant.MAIN_XTYPE[app],
			listXtype = ZCS.constant.LIST_VIEW_XTYPE[app];

		var listToolbar = {
			docked: 'top',
			xtype: 'titlebar',
			title: this.getListPanelTitle(),
			items: [
				{
					xtype: 'button',
					handler: function() {
						this.up(parentXtype).fireEvent('showFolders');
					},
					iconCls: 'list',
					iconMask: true,
					align: 'left'
				},
				{
					xtype: 'button',
					handler: function() {
						this.up(parentXtype).fireEvent('compose');
					},
					iconCls: this.getNewItemIconCls(),
					iconMask: true,
					align: 'right'
				}
			]
		};

		var searchToolbar = {
			docked: 'top',
			xtype: 'toolbar',
			items: [
				{
					xtype: 'searchfield',
					name: 'searchField',
					width: '95%',
					listeners: {
						keyup: function(fld, ev) {
							var keyCode = ev.browserEvent.keyCode;
							if (keyCode === 13 || keyCode === 3) {
								this.up(parentXtype).fireEvent('search', fld.getValue());
							}
						}
					}
				}
			]
		};

		var listView = {
			xtype: listXtype,
			store: Ext.getStore(this.getListPanelStoreName())
		}

		this.add([
			listToolbar,
			searchToolbar,
			listView
		]);
	}
});
