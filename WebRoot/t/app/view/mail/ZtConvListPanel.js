Ext.define('ZCS.view.mail.ZtConvListPanel', {

	extend: 'Ext.Panel',
	requires: [
		'Ext.dataview.List',
		'Ext.TitleBar',
		'Ext.field.Search',
		'ZCS.view.mail.ZtConvListView'
	],
	xtype: 'convlistpanel',

	config: {
		layout: 'fit',
		style:  'border: solid blue 1px;'
	},

	initialize: function() {

		this.callParent(arguments);

		var folders = window.inlineData.header.context.refresh.folder[0].folder,
			unread = '?';

		for (var i = 0; i < folders.length; i++) {
			var f = folders[i];
			if (f.id === '2') {
				unread = f.u;
				break;
			}
		}

		var listToolbar = {
			docked: 'top',
			xtype: 'titlebar',
			title: '<b>Inbox (' + unread + ')</b>',
			items: [
				{
					xtype: 'button',
					handler: function() {
						var mv = this.up('mailview');
						mv.fireEvent('showFolders', mv);
					},
					iconCls: 'list',
					iconMask: true,
					align: 'left'
				},
				{
					xtype: 'button',
					handler: function() {
						var mv = this.up('mailview');
						mv.fireEvent('compose', mv);
					},
					iconCls: 'compose',
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
					width: '95%'
				}
			]
		};

		var listView = {
			xtype: 'convlistview',
			store: Ext.getStore('ZtConvStore')
		}

		this.add([
			listToolbar,
			searchToolbar,
			listView
		]);
	}
});

