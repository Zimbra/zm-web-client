Ext.define('ZCS.view.ZtOverview', {

	extend: 'Ext.Panel',

	requires: [
		'Ext.dataview.NestedList',
		'ZCS.view.ZtFolderList',
		'ZCS.constant'
	],

	config: {
		layout: 'fit',
		style:  'border: solid blue 1px;'
	},

	initialize: function() {

		this.callParent(arguments);

		var app = this.getOverviewApp(),
			data = {
				items: ZCS.session.getFolderDataByApp(app)
			};

		var store = Ext.create('Ext.data.TreeStore', {
			model: this.getOverviewModel(),
			defaultRootProperty: 'items',
			root: data,
			sorters: [
				{
					sorterFn: function(folder1, folder2) {
						var id1 = folder1.get('id'),
							id2 = folder2.get('id'),
							name1 = folder1.get('name').toLowerCase(),
							name2 = folder2.get('name').toLowerCase(),
							sortField1 = folder1.isSystem() ? ZCS.constant.FOLDER_SORT_VALUE[id1] : name1,
							sortField2 = folder2.isSystem() ? ZCS.constant.FOLDER_SORT_VALUE[id2] : name2;

						return sortField1 > sortField2 ? 1 : (sortField1 === sortField2 ? 0 : -1);
					},
					direction: 'ASC'
				}
			]
		});

		var folderList = Ext.create('ZCS.view.ZtFolderList', {
			title: this.getOverviewTitle(),
			displayField: 'name',
			store: store
		});

		ZCS.session.setFolderListByApp(folderList, app);
		this.add(folderList);
	}
});
