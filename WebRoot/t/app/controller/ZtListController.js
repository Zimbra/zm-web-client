/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra, Inc.
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
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

		Ext.Logger.verbose('STARTUP: list ctlr launch - ' + ZCS.util.getClassName(this));
		this.callParent();

		//Set the proxies params so this parameter persists between paging requests.
		this.getStore().getProxy().setExtraParams({
			query: defaultQuery
		});

		this.getStore().load({
			query: defaultQuery,
			callback: this.storeLoaded.bind(this, null, null)
		});
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

		var overview = this.getOverview(),
			itemPanel = this.getItemPanel();

		show = (show === true || show === false) ? show : overview.isHidden();

		if (show) {
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

		this.getItemController().clear();
		Ext.Logger.info('SearchRequest: ' + query);
		if (folder) {
			this.getSearchBox().setValue('');
		}

		// If we got here via tap on a saved search in the overview, remember it so we can show its name
		var searchId = (folder && folder.get('type') === ZCS.constant.ORG_SAVED_SEARCH) ? folder.get('itemId') : null;
		ZCS.session.setSetting(ZCS.constant.SETTING_CUR_SEARCH_ID, searchId);

		this.getStore().currentPage = 1;

		//Set the proxies params so this parameter persists between paging requests.
		this.getStore().getProxy().setExtraParams({
			query: query
		});

		this.getListView().getScrollable().getScroller().scrollToTop();

		this.getStore().load({
			query: query,
			callback: this.storeLoaded.bind(this, query, folder)
		});
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

		if (query && success) {
			var search = Ext.create('ZCS.common.ZtSearch', {
				query: query
			});
			ZCS.session.setSetting(ZCS.constant.SETTING_CUR_SEARCH, search);
			if (ZCS.session.getSetting(ZCS.constant.SETTING_SHOW_SEARCH)) {
				ZCS.session.getCurrentSearchField().setValue(query);
			}
			this.updateTitlebar();
			if (folder && records.length) {
				this.doShowFolders(false);
			}
		}
	},

	/**
	 * Updates the text on the list panel's titlebar to reflect the current search results.
	 */
	updateTitlebar: function() {

		var titlebar = this.getTitlebar();  // might not be available during startup
		if (!titlebar) {
			return;
		}

		var	organizer = ZCS.session.getCurrentSearchOrganizer(),
			organizerName = organizer && organizer.get('name'),
			unread = organizer && organizer.get('unreadCount'),
			title = ZtMsg.searchResults;

		if (organizerName) {
			title = (unread > 0) ? '<b>' + organizerName + ' (' + unread + ')</b>' : organizerName;
		}

		titlebar.setTitle(title);
	}
});
