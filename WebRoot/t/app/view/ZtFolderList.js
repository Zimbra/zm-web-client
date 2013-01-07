Ext.define('ZCS.view.ZtFolderList', {

	extend: 'Ext.dataview.NestedList',

	config: {
		onItemDisclosure: function(record, item, index, e) {
			// This event is scoped to the sub-list that caught it, so we need to get the top-level nested
			// list to expand the node, since a sub-list only knows how to display a flat series of items.
			var list = item.dataview,
				store = list.getStore(),
				node = store.getAt(index),
				nestedList = this.up('nestedlist');

			nestedList.goToNode(node);
		}
	},

	onItemTap: function(list, index, target, folder, e) {
		var query = 'in:"' + folder.getQueryPath() + '"';
		this.fireEvent('search', query);
	},

	getById: function(id) {
		return this.getStore().getById(id);
	}
});
