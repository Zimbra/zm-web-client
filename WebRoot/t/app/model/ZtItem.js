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
 * This class represents a Zimbra item such as a mail message, a conversation, or a contact.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.ZtItem', {

	extend: 'Ext.data.Model',

	requires: [
		'ZCS.model.ZtSoapProxy'
	],

	config: {

		fields: [
			{ name: 'type',     type: 'string' },   // ZCS.constant.ITEM_*
			{ name: 'itemId',   type: 'string' },   // ID on server
			{ name: 'tags',		type: 'auto' }      // list of tag data objects
		],

		proxy: {
			type: 'soapproxy',
			// our server always wants us to POST for API calls
			actionMethods: {
				create  : 'POST',
				read    : 'POST',
				update  : 'POST',
				destroy : 'POST'
			},
			headers: {
				'Content-Type': "application/soap+xml; charset=utf-8"
			},
			// prevent Sencha from adding junk to the URL
			pageParam: false,
			startParam: false,
			limitParam: false,
			noCache: false
		}
	},

	statics: {

		/**
		 * If the node has a list of tag IDs, return a list their ZtOrganizer tag objects.
		 *
		 * @param {object}  node        JSON node representing model instance
		 * @return {Array}  list of ZtOrganizer
		 */
		parseTags: function(tagIds) {
			return !tagIds ? null : Ext.Array.map(tagIds.split(','), function(tagId) {
				var tag = ZCS.cache.get(tagId);
				if (tag) {
					return tag.getData();
				} else {
					//<debug>
                    Ext.Logger.warn('Encountered an item with a tag that is not in cache and thus will not display.');
                    //</debug>
				}
			});
		}
	},

	constructor: function(data, id) {

		// The Model constructor can return a cached object rather than 'this',
		// so we need to check for that and return it if we get one.
		var item = this.callParent(arguments) || this,
			key = (data && data.id) || id;

		if (key) {
			ZCS.cache.set(key, item);
		}

		return item;
	},

	/**
	 * Processes a notification that this item has been modified.
	 *
	 * @param {object}  modify     notification
	 */
	handleModifyNotification: function(modify) {

		if (modify.t) {
			this.set('tags', ZCS.model.ZtItem.parseTags(modify.t));
		}
	}
});
