Ext.define('ZCS.view.ZtFolderList', {

	extend: 'Ext.dataview.NestedList',

	config: {
		onItemDisclosure: function(record, item, index, e) {
			console.log('Folder list DISCLOSE');
//			Ext.dataview.NestedList.prototype.onItemTap.call(this, item.dataview, index, item, record, e);
//			ZCS.view.ZtFolderList.superclass.onItemTap.call(this, item.dataview, index, item, record, e);
			var list = item.dataview,
				store = list.getStore(),
				node = store.getAt(index),
				nestedList = this.up('nestedlist');
//			this.goToNode(node);
			nestedList.goToNode(node);
		}
	},

	onItemTap: function(list, index, target, folder, e) {
//		console.log('ZtFolderList folder selected');
		var query = 'in:' + folder.getQueryPath();
		this.up('mailoverview').fireEvent('search', query);
	},

	getById: function(id) {
		return this.getStore().getById(id);
	}
});
