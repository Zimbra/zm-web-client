/**
 * This class is a NestedList that shows a folder tree. The main reason we subclass NestedList is so
 * that we can use the disclosure button to expand a folder (rather than show a detail card), and tap
 * to perform a folder search (rather than expand the folder).
 */
Ext.define('ZCS.view.ZtFolderList', {

	extend: 'Ext.dataview.NestedList',

	config: {

		 // Show the folder's child list.
		onItemDisclosure: function(record, item, index, e) {

			// This event is scoped to the sub-list that caught it, so we need to get the top-level nested
			// list to expand the node, as a sub-list only knows how to display a flat series of items.
			var list = item.dataview,
				store = list.getStore(),
				node = store.getAt(index),
				nestedList = this.up('nestedlist');

			nestedList.goToNode(node);
		}
	},

	/**
	 * Runs a search that will show the folder's contents.
	 */
	onItemTap: function(list, index, target, folder, e) {
		var query = 'in:"' + folder.getQueryPath() + '"';
		this.fireEvent('search', query);
	},

	/**
	 * Returns the folder with the given ID.
	 *
	 * @param {string}  id      folder ID
	 * @return {ZtFolder}       folder
	 */
	getById: function(id) {
		return this.getStore().getById(id);
	}
});
