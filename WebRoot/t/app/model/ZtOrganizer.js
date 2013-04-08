/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 VMware, Inc.
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
 * This class represents a Zimbra organizer, which may be a folder, a saved search, or a tag.
 * Organizers show up in an overview. A folder may be a mail folder, or an address book.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.ZtOrganizer', {

	extend: 'Ext.data.Model',

	config: {
		fields: [
			// global fields
			{ name: 'type', type: 'string' },       // ZCS.constant.ORG_*
			{ name: 'typeName', type: 'string' },   // display name of group
			{ name: 'itemId', type: 'string' },     // ID on ZCS server
			{ name: 'parentItemId', type: 'string' },
			{ name: 'name', type: 'string' },
			{ name: 'path', type: 'string' },
			{ name: 'itemCount', type: 'int' },
			{ name: 'color', type: 'int' },
			{ name: 'rgb', type: 'string' },
			{ name: 'url', type: 'string' },        // feeds

			// folder fields
			{ name: 'disclosure', type: 'boolean' }, // override NestedList button behavior

			// mail folder fields
			{ name: 'unreadCount', type: 'int' },

			// saved search fields
			{ name: 'query', type: 'string' }
		]
	},

	constructor: function(data, id) {

		this.callParent(arguments);

		var orgId = (data && (data.itemId || data.id)) || id;

		ZCS.cache.set(orgId, this);
		if (data.path) {
			ZCS.cache.set(this.isSystem() ? ZCS.constant.FOLDER_SYSTEM_NAME[orgId] : data.path, this, 'path');
		}
	},

	isFolder: function() {
		var type = this.get('type');
		return type !== ZCS.constant.ORG_SAVED_SEARCH && type !== ZCS.constant.ORG_TAG;
	},

	isSystem: function() {
		return this.isFolder() && (this.get('itemId') <= ZCS.constant.MAX_SYSTEM_ID);
	},

	isFeed: function() {
		return !!(this.get('url'));
	},

	/**
	 * Returns the query for this organizer that will return its contents.
	 *
	 * @return {string}     query
	 */
	getQuery: function() {

		var type = this.get('type');

		if (this.isFolder()) {
			var path = this.get('path');

			if (this.isSystem()) {
				path = path.toLowerCase();
			}

			return 'in:"' + path + '"';
		}
		else if (type === ZCS.constant.ORG_SAVED_SEARCH) {
			return this.get('query');
		}
		else if (type === ZCS.constant.ORG_TAG) {
			return 'tag:"' + this.get('name') + '"';
		}
	},

	handleModifyNotification: function(modify) {

		if (modify.u) {
			this.set('unreadCount', modify.u);
		}
	}
});
