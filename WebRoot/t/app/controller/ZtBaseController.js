/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2012, 2013 VMware, Inc.
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
 * Base class for controllers that handle items (messages, convs, contacts etc).
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.controller.ZtBaseController', {

	extend: 'Ext.app.Controller',

	mixins: {
		menuable: 'ZCS.common.ZtMenuable'
	},

	/**
	 * Returns the store that holds the data this controller is managing.
	 *
	 * @return {Ext.data.Store}     store
	 */
	getStore: function() {
		return Ext.getStore(ZCS.util.getStoreShortName(this));
	},

	getOrganizerTitle: function () {
		var	organizer = ZCS.session.getCurrentSearchOrganizer(),
			organizerName = organizer && organizer.get('name'),
			unread = organizer && organizer.get('unreadCount'),
			title = ZtMsg.searchResults;

		if (organizerName) {
			title = (unread > 0) ? '<b>' + organizerName + ' (' + unread + ')</b>' : organizerName;
		}

		return title;
	},


	/**
	 * Delete notification: remove item from the store.
	 *
	 * @param {ZtItem}  item            item that was deleted
	 * @param {Object}  notification    notification object
	 */
	handleDeleteNotification: function(item, notification) {
		this.getStore().remove(item);
	},

	/**
	 * Create notification: convert item JSON to data, then use that
	 * to instantiate a new model and add it to the store.
	 *
	 * @param {ZtItem}  item            existing item (not provided, will be undefined)
	 * @param {Object}  notification    JSON for new item
	 */
	handleCreateNotification: function(item, notification) {},

	/**
	 * Modify notification: let the item handle it.
	 *
	 * @param {ZtItem}  item           item that was changed
	 * @param {Object}  notification   JSON detailing the changes (each changed field and its new value)
	 */
	handleModifyNotification: function(item, notification) {
		item.handleModifyNotification(notification);
	},

	/**
	 * Folder change notification: let the folder handle it.
	 *
	 * @param {ZtOrganizer} folder         folder that was changed
	 * @param {Object}      notification   JSON detailing the changes (each changed field and its new value)
	 */
	handleFolderChange: function(folder, notification) {
		folder.handleModifyNotification(notification);
	}
});
