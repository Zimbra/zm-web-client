/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Base class for a controller that manages a list of items.
 *
 * @see ZtListPanel
 * @see ZtList
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.controller.ZtListController', {

	extend: 'ZCS.controller.ZtBaseController',

	requires: [
		'ZCS.common.ZtSearch',
		'ZCS.common.ZtClientCmdHandler'
	],

	config: {

		refs: {
			// event handlers
			listPanel: null,
			listView: null,
			folderList: null,
			itemPanel: null,

			// other
			overview: null,
			titlebar: null,
			searchBox: null
		},

		control: {
			listPanel: {
				showFolders: 'doShowFolders',
				newItem: null,
				search: 'doSearch'
			},
			listView: {
				showItem: 'doShowItem'
			},
			folderList: {
				search: 'doSearch'
			},
			itemPanel: {
				showMenu: null
			}
		}
	},

	/**
	 * On launch, populate the list with items
	 */
	launch: function () {

		var defaultQuery = this.getDefaultQuery();
        //<debug>
		Ext.Logger.verbose('STARTUP: list ctlr launch - ' + ZCS.util.getClassName(this));
        //</debug>
		this.callParent();

		//Set the proxies params so this parameter persists between paging requests.
		this.getStore().getProxy().setExtraParams({
			query: defaultQuery
		});

		this.getStore().load({
			query: defaultQuery,
			callback: Ext.Function.bind(this.storeLoaded, this, [defaultQuery, null], 0)
		});

		ZCS.app.on('applicationSwitch', function (newApp) {
			if (this.getApp() === newApp) {
				this.updateTitlebar(newApp);
			}
		}, this);

		ZCS.app.on('notifyFolderChange', this.handleFolderChange, this);
	},

	/**
	 * Returns the default query used to launch this controller/app.
	 * @return {string}
	 */
	getDefaultQuery: function() {
		return '';
	},

	/**
	 * Returns the controller for a single item.
	 * @return {ZtListController}
	 */
	getItemController: function() {},

	/**
	 * Displays the overview, which contains the folder list. Panel widths are adjusted.
	 *
	 * @param {boolean}     show        if true, show the overview
	 */
	doShowFolders: function(show) {
		//TODO: consider removing control of this to the app view controller...
		//      only downside is not being able to differentiate between apps at that point
		ZCS.app.fireEvent('showOverviewPanel');
	},

	/**
	 * Displays the tapped item in the item panel.
	 *
	 * @param {ZtListView}  view        containing list view
	 * @param {ZtItem}      item        item that was tapped
	 * @protected
	 */
	doShowItem: function(view, item) {
		this.getItemController().showItem(item);
	},

	/**
	 * This function is the centralized kickoff for searches. It can be triggered by
	 * typing a query into the search box, or by clicking on something in the overview.
	 *
	 * @param {string}      query           query to run
	 * @param {ZtOrganizer} folder          overview folder that was tapped (optional)
	 *
	 * TODO: we don't really handle the search request failing
	 */
	doSearch: function(query, folder) {

		if (query.indexOf('$cmd:') === 0) {
			ZCS.common.ZtClientCmdHandler.handle(query.substr(5), this.getStore().getProxy());
			return;
		}

        //<debug>
		Ext.Logger.info('SearchRequest: ' + query);
        //</debug>
		if (folder) {
			this.getSearchBox().setValue('');
		}

		this.getStore().currentPage = 1;

		//Set the proxy's params so this parameter persists between paging requests.
		this.getStore().getProxy().setExtraParams({
			query:  query
		});

		this.getListView().getScrollable().getScroller().scrollToTop();

		this.getStore().load({
			query:      query,
			folder:     folder,
			callback:   Ext.Function.bind(this.storeLoaded, this, [query, folder], 0)
		});

		ZCS.app.fireEvent('hideOverviewPanel');
	},

	/**
	 * After the search has run, remember it as the one backing the current list,
	 * and set the title in the top toolbar.
	 *
	 * @param {string}      query       search query that produced these results
	 * @param {ZtOrganizer} folder      overview folder that was tapped (optional)
	 * @param {array}       records
	 * @param {Operation}   operation
	 * @param {boolean}     success
	 */
	storeLoaded: function(query, folder, records, operation, success) {

		query = query || operation.config.query;

		var app = this.getApp();

		if (success) {

			if (folder) {
				// If we got here via tap on a saved search in the overview, remember it so we can show its name
				var searchId = (folder.get('type') === ZCS.constant.ORG_SAVED_SEARCH) ? folder.get('itemId') : null;
				ZCS.session.setSetting(ZCS.constant.SETTING_CUR_SEARCH_ID, searchId, app);
			}
			else {
				// If the user ran a search, deselect the selected folder since it no longer matches results
				this.getFolderList().getActiveItem().deselectAll();
			}

			this.updateTitlebar();
			this.getItemController().clear(records.length === 0);
			ZCS.app.fireEvent('updatelistpanelToggle', this.getOrganizerTitle(), app);
			if (folder && records.length) {
				//make sure this element doesn't get focus due to an errant touch
				this.getSearchBox().blur();
			}
		} else {
			//<debug>
			Ext.Logger.info('Parameters not present in storeLoaded');
	        //</debug>
		}
	},

	/**
	 * Updates the text on the list panel's titlebar to reflect the current search results.
	 *
	 * @param {String}  app     app
	 */
	updateTitlebar: function(app) {

		var titlebar = this.getTitlebar();  // might not be available during startup
		if (!titlebar) {
			Ext.Logger.info('Titlebar not found');
			return;
		}

		titlebar.setTitle(this.getOrganizerTitle(null, true, app));
	},

	removeItem: function(item, isSwipeDelete) {

		var list = this.getListView(),
			store = list.getStore(),
			currentIndex = store.indexOf(item),
			toSelect;

		store.remove(item);
		if (!isSwipeDelete) {
			toSelect = store.getAt(currentIndex);
			if (toSelect) {
				list.select(toSelect, false);
			}
			else {
				this.getItemController().clear();
			}
		}
	},

	/**
	 * Update list panel title if the current folder changed in some way, since the title
	 * often reflects something about the folder (number of items, for example).
	 */
	handleFolderChange: function(folder, notification) {

		this.callParent(arguments);
		var	curOrganizer = ZCS.session.getCurrentSearchOrganizer();
		if (curOrganizer && curOrganizer.get('itemId') === folder.get('itemId')) {
			this.updateTitlebar();
			ZCS.app.fireEvent('updatelistpanelToggle', this.getOrganizerTitle(), ZCS.session.getActiveApp());
		}
	}
});
