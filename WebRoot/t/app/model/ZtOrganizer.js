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
			{ name: 'type', type: 'string' },           // ZCS.constant.ORG_*
			{ name: 'typeName', type: 'string' },       // display name of group
			{ name: 'itemId', type: 'string' },         // ID on ZCS server
			{ name: 'parentItemId', type: 'string' },   // ID of parent organizer
			{ name: 'name', type: 'string' },           // not encoded, should not be displayed
			{ name: 'displayName', type: 'string' },    // HTML-encoded
			{ name: 'path', type: 'string' },           // full path with / separators
			{ name: 'itemCount', type: 'int' },         // number of items contained by this organizer
			{ name: 'color', type: 'int' },             // standard color
			{ name: 'rgb', type: 'string' },            // extended RGB color
			{ name: 'url', type: 'string' },            // feeds

			// folder fields
			{ name: 'disclosure', type: 'boolean' },    // override NestedList button behavior
			{ name: 'leaf', type: 'boolean' },    //whether this is a leaf node or not.

			// mail folder fields
			{ name: 'unreadCount', type: 'int' },       // number of unread messages in this folder

			// saved search fields
			{ name: 'query', type: 'string' }           // search query
		]
	},

	statics: {

		compare: function(organizer1, organizer2) {

			if (!organizer1 || !organizer2) {
				return !organizer1 && !organizer2 ? 0 : organizer1 ? 1 : -1;
			}

			// organizers may come to us as data or as instantiated ZtOrganizer objects
			var orgType1 = organizer1.type || organizer1.get('type'),
				orgType2 = organizer2.type || organizer2.get('type'),
				id1 = organizer1.itemId || organizer1.get('itemId'),
				id2 = organizer2.itemId || organizer2.get('itemId'),
				name1 = organizer1.name || organizer1.get('name'),
				name2 = organizer2.name || organizer2.get('name'),
				isSystem1 = (orgType1 !== ZCS.constant.ORG_SAVED_SEARCH && orgType1 !== ZCS.constant.ORG_TAG && id1 <= ZCS.constant.MAX_SYSTEM_ID),
				isSystem2 = (orgType2 !== ZCS.constant.ORG_SAVED_SEARCH && orgType2 !== ZCS.constant.ORG_TAG && id2 <= ZCS.constant.MAX_SYSTEM_ID),
				sortField1, sortField2;

			if (orgType1 !== orgType2) {
				sortField1 = ZCS.constant.ORG_SORT_VALUE[orgType1];
				sortField2 = ZCS.constant.ORG_SORT_VALUE[orgType2];
			}
			else if (isSystem1 !== isSystem2) {
				return isSystem1 ? -1 : 1;
			}
			else if (isSystem1 && isSystem2) {
				sortField1 = ZCS.constant.FOLDER_SORT_VALUE[id1];
				sortField2 = ZCS.constant.FOLDER_SORT_VALUE[id2];
			}
			else {
				sortField1 = name1 ? name1.toLowerCase() : '';
				sortField2 = name2 ? name2.toLowerCase() : '';
			}

			return sortField1 > sortField2 ? 1 : (sortField1 === sortField2 ? 0 : -1);
		}
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

	/**
	 * Returns a string that represents this organizer.
	 *
	 * @param {String}      defaultText     text to use if there is no name
	 * @param {Boolean}     showCount       if true, show number of items
	 * @return {String} organizer title
	 */
	getTitle: function(defaultText, showCount) {

		var	organizerName = this.get('name'),
			type = this.get('type'),
			title = organizerName || defaultText || '';

		if (organizerName) {
			if (type === ZCS.constant.ORG_MAIL_FOLDER) {
				var unread = showCount ? this.get('unreadCount') : 0;
				title = (unread > 0) ? '<b>' + organizerName + ' (' + unread + ')</b>' : organizerName;
			}
			else if (type === ZCS.constant.ORG_ADDRESS_BOOK) {
				var contactCount = showCount ? this.get('itemCount') : 0;
				title = (contactCount > 0) ? '<b>' + organizerName + ' (' + contactCount + ')</b>' : organizerName;
			}
		}

		return title;
	},

	handleModifyNotification: function(modify) {

		if (modify.u != null) {
			this.set('unreadCount', modify.u);
		}
	}
});
