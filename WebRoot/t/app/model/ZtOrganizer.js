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

	requires: [
		'ZCS.model.ZtOrganizerReader'
	],

	config: {

		// Note that 'id' is the ID within Sencha. Since a single organizer from
		// the ZCS server may exist in multiple Sencha stores, and each instance within Sencha
		// must have a unique ID, we need to disambiguate the ID. For example, a tag with 'zcsId'
		// 607 may correspond to ZtOrganizer instances with IDs 'mail-tag-607' and 'contacts-tag-607'.
		// Also, the 'parentItemId' is basically the same as the internal Sencha field 'parentId',
		// but 'parentId' isn't always assigned by the time we need to use it.

		fields: [
			// global fields
			{ name: 'type',             type: 'string' },   // folder, search, or tag
			{ name: 'folderType',       type: 'string' },   // specific type of folder (eg mail folder)
			{ name: 'zcsId',            type: 'string' },   // ID on ZCS server
			{ name: 'parentItemId',     type: 'string' },   // ID of parent organizer
			{ name: 'parentZcsId',      type: 'string' },   // ID of parent on ZCS server
			{ name: 'name',             type: 'string' },   // name on server - not encoded, should not be displayed
			{ name: 'displayName',      type: 'string' },   // HTML-encoded
			{ name: 'path',             type: 'string' },   // full path with / separators
			{ name: 'itemCount',        type: 'int' },      // number of items contained by this organizer
			{ name: 'color',            type: 'int' },      // standard color
			{ name: 'rgb',              type: 'string' },   // extended RGB color
			{ name: 'url',              type: 'string' },   // feeds

			// folder fields
			{ name: 'disclosure',       type: 'boolean' },  // override NestedList button behavior

			// mail folder fields
			{ name: 'unreadCount',      type: 'int' },      // number of unread messages in this folder

			// saved search fields
			{ name: 'query',            type: 'string' },   // search query
			{ name: 'searchTypes',      type: 'string' },   // search types

			// title including count (if count is nonzero, title is bolded)
			{
				name:       'title',
				type:       'string',
				convert:    function(value, record) {
					return record.getTitle(null, true);
				}
			}
		],

		proxy: {
			type:   'memory',
			reader: 'organizerreader'
		}
	},

	statics: {

		/**
		 * Returns an ID for an organizer which should be unique. Note that this is the ID of the
		 * organizer within a Sencha store, and not a DOM ID.
		 *
		 * @param {String}      zcsId       organizer ID on ZCS server
		 * @param {String}      app         ZCS.constant.APP_*
		 * @param {String}      context     (optional) container (such as 'overview' or 'assignment')
		 *
		 * @return {String}     suitable ID for organizer within a Sencha store
		 */
		getOrganizerId: function(zcsId, app, context) {
			return Ext.clean([ app, context, zcsId ]).join('-');
		},

		/**
		 * Parse an organizer ID into its component fields.
		 *
		 * @param {String}      id          organizer ID, such as 'mail-overview-2'
		 *
		 * @return {Object}     object with ID fields
		 */
		parseOrganizerId: function(id) {

			var fields = id.split('-'),
				parsed = {}, i, prop;

			parsed.zcsId = fields.pop();
			for (i = 0; i < fields.length; i++) {
				prop = ZCS.constant.IS_APP[fields[i]] ? 'app' : 'context';
				parsed[prop] = fields[i];
			}

			return parsed;
		},

		/**
		 * Compares two organizers to see which should come first in an overview. Primary key is organizer type:
		 * folders, then searches, then tags. Secondary key within folders is to put system folders first.
		 *
		 * @param {ZtOrganizer} organizer1
		 * @param {ZtOrganizer} organizer2
		 *
		 * @return {Number}
		 */
		compare: function(organizer1, organizer2) {

			if (!organizer1 || !organizer2) {
				return !organizer1 && !organizer2 ? 0 : organizer1 ? 1 : -1;
			}

			// organizers may come to us as data or as instantiated ZtOrganizer objects
			var get1 = !!organizer1.get,
				get2 = !!organizer2.get,
				orgType1 = organizer1.type || (get1 ? organizer1.get('type') : null),
				orgType2 = organizer2.type || (get2 ? organizer2.get('type') : null),
				id1 = organizer1.zcsId || (get1 ? organizer1.get('zcsId') : null),
				id2 = organizer2.zcsId || (get2 ? organizer2.get('zcsId') : null),
				name1 = organizer1.name || (get1 ? organizer1.get('name') : null),
				name2 = organizer2.name || (get2 ? organizer2.get('name') : null),
				isSystem1 = (orgType1 === ZCS.constant.ORG_FOLDER && id1 <= ZCS.constant.MAX_SYSTEM_ID),
				isSystem2 = (orgType2 === ZCS.constant.ORG_FOLDER && id2 <= ZCS.constant.MAX_SYSTEM_ID),
				sortField1, sortField2;

			if (orgType1 !== orgType2) {
				sortField1 = ZCS.constant.ORG_SORT_VALUE[orgType1] || 0;
				sortField2 = ZCS.constant.ORG_SORT_VALUE[orgType2] || 0;
			}
			else if (isSystem1 !== isSystem2) {
				return isSystem1 ? -1 : 1;
			}
			else if (isSystem1 && isSystem2) {
				sortField1 = ZCS.constant.FOLDER_SORT_VALUE[id1] || 0;
				sortField2 = ZCS.constant.FOLDER_SORT_VALUE[id2] || 0;
			}
			else {
				sortField1 = name1 ? name1.toLowerCase() : '';
				sortField2 = name2 ? name2.toLowerCase() : '';
			}

			return sortField1 > sortField2 ? 1 : (sortField1 === sortField2 ? 0 : -1);
		},

		/**
		 * Fills in a few Sencha-related fields in an organizer data object:
		 *
		 *      id:             ID within a specific Sencha store
		 *      parentItemId:   ID of parent organizer within a specific Sencha store
		 *      leaf:           true if organizer has no children
		 *      disclosure:     true if we should show disclosure icon (to show children)
		 *
		 * @param {Object}      organizer       anonymous object with organizer data
		 * @param {String}      app             app (used to create unique ID)
		 * @param {String}      context         context (used to create unique ID)
		 * @param {Boolean}     hasChildren     true if organizer contains child organizers
		 */
		addOtherFields: function(organizer, app, context, hasChildren) {

			organizer.id = ZCS.model.ZtOrganizer.getOrganizerId(organizer.zcsId, app, context);
			organizer.parentItemId = ZCS.model.ZtOrganizer.getOrganizerId(organizer.parentZcsId, app, context);

			if (Ext.isBoolean(hasChildren)) {
				organizer.leaf = !hasChildren;
				organizer.disclosure = hasChildren;
			}
		}
	},

	constructor: function(data, id, raw) {

        // Setting these fixes bug in framework when instance of this record is already cached
 	    this.modified = {};
        this.raw = raw || data || {};
        this.stores = [];

        this.callParent(arguments);

		var orgId = (data && (data.id || data.zcsId)) || id;
		//console.log('Cache organizer "' + data.name + '" under key "' + orgId + '"');

		ZCS.cache.set(orgId, this);
		if (data.zcsId && data.zcsId !== orgId) {
			var orgList = ZCS.cache.get(data.zcsId, null, true);
			if (!orgList || !Array.isArray(orgList)) {
				orgList = [];
				ZCS.cache.set(data.zcsId, orgList);
			}
			orgList.push(this);
		}

		if (data.path) {
			var sysId = ZCS.util.localId(this.get('zcsId'));
			ZCS.cache.set(this.isSystem() ? '/' + ZCS.constant.FOLDER_SYSTEM_NAME[sysId] : data.path, this, 'path');
		}
	},

	isFolder: function() {
		return this.get('type') === ZCS.constant.ORG_FOLDER;
	},

	isSystem: function() {
		return this.isFolder() && (ZCS.util.localId(this.get('zcsId')) <= ZCS.constant.MAX_SYSTEM_ID);
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
		else if (type === ZCS.constant.ORG_SEARCH) {
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
			folderType = this.get('folderType'),
			title = organizerName || defaultText || '';

		if (organizerName) {
			if (folderType === ZCS.constant.ORG_MAIL_FOLDER) {
				var unread = showCount ? this.get('unreadCount') : 0;
				title = (unread > 0) ? '<b>' + organizerName + ' (' + unread + ')</b>' : organizerName;
			}
			else if (folderType === ZCS.constant.ORG_ADDRESS_BOOK) {
				var contactCount = showCount ? this.get('itemCount') : 0;
				title = (contactCount > 0) ? '<b>' + organizerName + ' (' + contactCount + ')</b>' : organizerName;
			}
		}

		return title;
	},

	handleDeleteNotification: function() {
		this.destroy();
	},

	handleModifyNotification: function(modify, app) {

		// Use reader to perform any needed data transformation
		var reader = ZCS.model.ZtOrganizer.getProxy().getReader(),
			data = reader.getDataFromNode(modify, this.get('type'), app, []);

		if (modify.u != null) {
			this.set('unreadCount', data.unreadCount);
		}
		if (modify.name) {
			this.set('name', data.name);
		}
		if (modify.absFolderPath) {
			this.set('path', data.path);
		}
		if (modify.color) {
			this.set('color', data.color);
		}
		if (modify.rgb) {
			this.set('rgb', data.rgb);
		}

		// Note: updating parent folder ('parentItemId') is handled in ZtOverview
	},

	/**
	 * Returns true if this organizer is a valid assignment target for the given item (ie, the item
	 * is getting moved to this folder or is getting this tag).
	 *
	 * @param {ZtItem}      item        item
	 * @return {Boolean}
	 */
	isValidAssignmentTarget: function(item) {

		var	type = this.get('type');

		if (type === ZCS.constant.ORG_TAG) {
			return !item.hasTag(this);
		}
		else {
			return this.mayContain(item);
		}
	},

	/**
	 * Returns true if the given item can be moved to this folder.
	 *
	 * @param {ZtItem}      item        item
	 * @return {Boolean}
	 */
	mayContain: function(item) {

		if (!item) {
			return true;
		}
		if (this.isFeed()) {
			return false;
		}

		var	myId = this.get('zcsId'),
			itemFolderId = item.get('folderId'),
			curFolder = ZCS.session.getCurrentSearchOrganizer(),
			curFolderId = curFolder ? curFolder.get('zcsId') : null,
			isDraftsFolder = ZCS.util.folderIs(this, ZCS.constant.ID_DRAFTS),
			isTrashFolder = ZCS.util.folderIs(this, ZCS.constant.ID_TRASH),
			isDraft = item.get('isDraft');

		// Can't move an item to its current folder. Also, assume that there's no reason to
		// move something to the folder the user is viewing.
		if (myId === itemFolderId || myId === curFolderId) {
			return false;
		}

		// can move drafts into Trash or Drafts
		if (isDraft && !isDraftsFolder && !isTrashFolder) {
			return false;
		}

		// only drafts can be moved into Drafts
		if (isDraftsFolder && !isDraft) {
			return false;
		}

		return true;
	},

	/**
	 * Returns true if this folder is movable.
	 */
	isMovable: function () {
		// TO DO - implement this
		return true;
	},

	/**
	 * Returns true if this folder is deletable.
	 */
	isDeletable: function () {
		// TO DO - implement this
		return !ZCS.util.folderIs(this, ZCS.constant.ID_TRASH);
	}

});
