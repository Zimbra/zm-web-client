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
 * This class represents a Zimbra folder, which may be a mail folder, an address book, etc.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.ZtFolder', {

	extend: 'Ext.data.Model',

	config: {
		fields: [
			{ name: 'name', type: 'string' },
			{ name: 'id', type: 'string' },
			{ name: 'itemCount', type: 'int' },
			// disclosure is here so we can override the default behavior of the button in the NestedList
			{ name: 'disclosure', type: 'boolean' }
		]
	},

	statics: {
		fromPath: function(path) {

		}
	},

	/**
	 * Returns true if this folder is a system folder.
	 *
	 * @return {boolean}    true if this folder is a system folder
	 */
	isSystem: function() {
		return (this.get('id') <= ZCS.constant.MAX_SYSTEM_ID);
	},

	/**
	 * Returns the full path for this folder, for use in a search query.
	 *
	 * @return {string}     path
	 */
	getQueryPath: function() {

		var path = this.get('name'),
			parent = ZCS.session.getFolderById(this.get('parentId'));

		if (this.isSystem()) {
			path = path.toLowerCase();
		}

		while (parent && (parent.get('id') != ZCS.constant.ID_ROOT)) {
			path = parent.get('name') + '/' + path;
			parent = ZCS.session.getFolderById(parent.get('parentId'));
		}

		return path;
	}
});
