Ext.define('ZCS.view.contacts.ZtContactListPanel', {

	extend: 'Ext.Panel',
	requires: [
		'Ext.dataview.List',
		'Ext.TitleBar',
		'Ext.field.Search',
		'ZCS.view.contacts.ZtContactListView'
	],
	xtype: 'contactlistpanel',

	config: {
		layout: 'fit',
		style:  'border: solid blue 1px;'
	},

	initialize: function() {

		this.callParent(arguments);

		var listToolbar = {
			docked: 'top',
			xtype: 'titlebar',
			title: '<b>Contacts</b>',
			items: [
				{
					xtype: 'button',
					handler: function() {
						this.up('contactsview').fireEvent('showFolders');
					},
					iconCls: 'list',
					iconMask: true,
					align: 'left'
				},
				{
					xtype: 'button',
					handler: function() {
						this.up('contactsview').fireEvent('newContact');
					},
					iconCls: 'plus',
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
								this.up('contactsview').fireEvent('search', fld.getValue());
							}
						}
					}
				}
			]
		};

		var listView = {
			xtype: 'contactlistview',
			store: Ext.getStore('ZtContactStore')
		}

		this.add([
			listToolbar,
			searchToolbar,
			listView
		]);
	}
});

