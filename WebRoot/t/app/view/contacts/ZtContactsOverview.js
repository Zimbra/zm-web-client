Ext.define('ZCS.view.contacts.ZtContactsOverview', {

	extend: 'Ext.Panel',

	requires: [
		'Ext.dataview.NestedList',
		'ZCS.model.ZtFolder',
		'ZCS.view.ZtFolderList',
		'ZCS.common.ZtConstants'
	],

	xtype: 'contactsoverview',

	config: {
		layout: 'fit',
		style:  'border: solid blue 1px;'
	},

	initialize: function() {

		this.callParent(arguments);

//		var folderList = {
//			xtype: 'nestedlist',
//			store: {
//				fields: ['name']
//			},
//			displayField: 'name'
//		};

//		return;
		var data = {
//			name: 'Folders',
			items: ZCS.common.ZtUserSession.getFolderData()
		};
		var store = Ext.create('Ext.data.TreeStore', {
			model: 'ZCS.model.ZtFolder',
			defaultRootProperty: 'items',
			root: data,
			sorters: [
				{
					sorterFn: function(folder1, folder2) {
						var id1 = folder1.get('id'),
							id2 = folder2.get('id'),
							name1 = folder1.get('name').toLowerCase(),
							name2 = folder2.get('name').toLowerCase(),
							sortField1 = folder1.isSystem() ? ZCS.common.ZtConstants.FOLDER_SORT_VALUE[id1] : name1,
							sortField2 = folder2.isSystem() ? ZCS.common.ZtConstants.FOLDER_SORT_VALUE[id2] : name2;

						return sortField1 > sortField2 ? 1 : (sortField1 === sortField2 ? 0 : -1);
					},
					direction: 'ASC'
				}
			]
		});

//		this.down('nestedlist').setStore(store);

//		var folderList = Ext.create('Ext.dataview.NestedList', {
		var folderList = Ext.create('ZCS.view.ZtFolderList', {
			title: 'Folders',
			displayField: 'name',
			store: store
//			disclosureProperty: 'hasChildren',
//			onItemDisclosure: true,
//			onItemDisclosure: function() {
//				console.log('Folder list DISCLOSE');
//			},
//			onItemTap: function() {
//				console.log('Folder list TAP');
//			},
//			preventSelectionOnDisclose: false
		});

		ZCS.common.ZtUserSession.setFolderList(folderList);
		this.add(folderList);
	}
});
