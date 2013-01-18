/**
 * Base class for a controller that manages a list of items.
 *
 * @see ZtListPanel
 * @see ZtList
 */
Ext.define('ZCS.controller.ZtListController', {

	extend: 'Ext.app.Controller',

	requires: [
		'ZCS.model.ZtSearch'
	],

	config: {
		refs: {
			parentView: null,
			overview: null,
			folderList: null,
			itemPanel: null,
			listView: null,
			titlebar: null
		},
		control: {
			parentView: {
				showFolders: 'onShowFolders',
				search: 'onSearch'
			},
			listView: {
				showItem: 'onShowItem',
				updateTitlebar: 'onUpdateTitlebar'
			},
			folderList: {
				search: 'onSearch'
			}
		}
	},

	// On launch, populate the list with items
	launch: function () {
		console.log('STARTUP: list ctlr launch - ' + this.$className);
		this.callParent();
		Ext.getStore(this.getStoreShortName()).load();
	},

	/**
	 * Class name of the store, without the initial name-spacing parts.
	 * @protected
	 */
	getStoreShortName: function() {
		var parts = this.getStores()[0].split('.');
		return parts[parts.length - 1];
	},

	/**
	 * Returns the controller for a single item.
	 * @protected
	 */
	getItemController: function() {},

	/**
	 * Displays the overview, which contains the folder list. Panel widths are adjusted.
	 * @protected
	 */
	onShowFolders: function() {
		console.log("Folders event caught");
		var overview = this.getOverview(),
			itemPanel = this.getItemPanel();

		if (overview.isHidden()) {
			itemPanel.setWidth('50%');
			// animation clears space then slides in (not great)
			overview.show({
				type: 'slide',
				direction: 'right',
				duration: 500
			});
//			overview.show();
		}
		else {
			// animation starts overview at far right (flex) or doesn't work at all (%) :(
//			overview.hide({
//				type: 'slide',
//				direction: 'left'
//			});
			itemPanel.setWidth('70%');
			overview.hide();
		}
	},

	/**
	 * Displays the tapped item in the item panel.
	 *
	 * @param {ZtListView}  view        containing list view
	 * @param {ZtItem}      item        item that was tapped
	 * @protected
	 */
	onShowItem: function(view, item) {
		this.getItemController().showItem(item);
	},

	/**
	 * Runs a search using the text in the search box as the query.
	 *
	 * @param {string}  query       query to run
	 */
	onSearch: function(query) {
		this.getItemController().clear();
		console.log('SearchRequest: ' + query);
		Ext.getStore(this.getStoreShortName()).load({query: query});
	},

	/**
	 *
	 */
	onUpdateTitlebar: function() {

		var curQuery = ZCS.session.getSetting(ZCS.constant.SETTING_CUR_SEARCH),
			search = curQuery && Ext.create('ZCS.model.ZtSearch', {
				query: curQuery
			});

		var folderId = search && search.getFolderId(),
			folder = folderId && ZCS.session.getFolderById(folderId),
			folderName = folder && folder.get('name'),
			unread = folder && folder.get('unreadCount'),
			title = 'Search Results';

		if (folderName) {
			title = (unread > 0) ? '<b>' + folderName + ' (' + unread + ')</b>' : folderName;
		}
		this.getTitlebar().setTitle(title);
	}
});
