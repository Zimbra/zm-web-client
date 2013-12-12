/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2012, 2013 Zimbra Software, LLC.
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
			{ name: 'zcsId',    type: 'string' },   // ID on server
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
				'Content-Type': 'application/soap+xml; charset=utf-8'
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
		 * If the node has a list of tag IDs, return a list of their ZtOrganizer tag objects.
		 *
		 * @param {Array}  tagIds   comma-separated list of tag IDs
		 * @return {Array}  list of ZtOrganizer
		 */
		parseTags: function(tagIds, app) {

			return !tagIds ? [] : Ext.Array.map(tagIds.split(','), function(tagId) {

				var tags = ZCS.cache.get(tagId),
					tag = Array.isArray(tags) ? tags[0] : tags;

				if (tag) {
					return tag.getData();
				} else {
					//<debug>
                    Ext.Logger.warn('Could not find tag with ID ' + id + ' in the item cache');
                    //</debug>
				}
			});
		},

		/**
		 * Sets up tags with just the data we need, and an associated DOM ID.
		 *
		 * @param {Array}   tags        list of tags
		 * @return {Array}  list of tag data objects
		 */
		getTagData: function(tags) {
			var tagDataList;
			if (tags && tags.length) {
				tagDataList = Ext.Array.map(Ext.Array.clean(tags), function(tag) {
					var tagData = Ext.copyTo({}, tag, 'zcsId,color,name,displayName');
					tagData.id = ZCS.util.getUniqueId(tagData);
					return tagData;
				});
			}
			return tagDataList;
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

		if (modify.t != null) {
			var type = this.get('type'),
				app = ZCS.constant.APP_FOR_TYPE[type];

			this.set('tags', ZCS.model.ZtItem.parseTags(modify.t, app));
		}
	},

	/**
	 * Returns true if this item has the given tag.
	 *
	 * @param {ZtOrganizer}     tag     a tag
	 * @return {Boolean}
	 */
	hasTag: function(tag) {

		var targetName = tag.get('name'),
			tags = this.get('tags'),
			ln = tags ? tags.length : 0,
			i, tag, tagName;

		for (i = 0; i < ln; i++) {
			tag = tags[i];
			tagName = tag instanceof ZCS.model.ZtOrganizer ? tag.get('name') : tag.name;
			if (tagName === targetName) {
				return true;
			}
		}

		return false;
	}
});
