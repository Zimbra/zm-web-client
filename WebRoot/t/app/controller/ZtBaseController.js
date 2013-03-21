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

	/**
	 * Delete notification: remove item from the store
	 *
	 * @param {ZtItem}  item      item that was deleted
	 */
	handleDeleteNotification: function(item) {
		this.getStore().remove(item);
	},

	/**
	 * Create notification: convert item JSON to data, then use that
	 * to instantiate a new model and add it to the store.
	 */
	handleCreateNotification: function(create) {},

	/**
	 * Modify notification: let the item handle it
	 *
	 * @param {ZtItem}  item        item that was changed
	 * @param {object}  modify      JSON detailing the changes (each changed field and its new value)
	 */
	handleModifyNotification: function(item, modify) {
		item.handleModifyNotification(modify);
	}
});
