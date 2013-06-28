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
 * This class respresents a store of organizers.
 *
 * @author Conrad Damon
 */
Ext.define('ZCS.store.ZtOrganizerStore', {

	extend: 'Ext.data.TreeStore',

	requires: [
		'ZCS.common.ZtConstants'
	],

	config: {

		model:                  'ZCS.model.ZtOrganizer',
		defaultRootProperty:    'items',
		storeId:                'organizerStore',

		grouper: function(record) {
			return record.get('typeName');
		},

		sorters: [
			{
				sorterFn:   ZCS.util.compareOrganizers,
				direction:  'ASC'
			}
		]
	},

	/**
	 * Override NodeStore::applyFilters, which returns a default filter that checks
	 * whether the node is visible. The overview might well be hidden when a folder
	 * changes, so that's not a helpful test.
	 */
	applyFilters: function(filters) {
		return function(item) {
			return true;
		};
	}
});
