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
		storeId:                'organizerStore',

		grouper: function(record) {
		    if (record.parentNode && record.parentNode.parentNode && !record.parentNode.parentNode.isRoot()) {
		        return record.parentNode.parentNode.getTitle();
		    } else {
                return record.getGroupName();
		    }
		}
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
	},

	/**
	 * Overriding default functionality so this store does not clone the root.
	 */
	applyRoot: function(root) {
        var me = this;
        root = root || {};

        // Allow the root to remain the passed in model instead of creating a new instance.
        // root = Ext.apply({}, root);

        if (!root.isModel) {
            Ext.applyIf(root, {
                id: me.getStoreId() + '-' + me.getDefaultRootId(),
                text: 'Root',
                allowDrag: false
            });

            root = Ext.data.ModelManager.create(root, me.getModel());
        }

        Ext.data.NodeInterface.decorate(root);
        root.set(root.raw);

        return root;
    },

    doDefaultSorting: function () {
		this.data._autoSort = false;
		this.suspendEvents();

    	this.setSorters({
			sorterFn: function(organizer1, organizer2) {
				return ZCS.model.ZtOrganizer.compare(organizer1, organizer2);
			}
		});

    	//Make sure shared roots don't trigger sort storms.
    	this.getRoot().disableStoreSorting();
    	//Make sure sorting the root doesn't trigger a sort storm.
		this.getRoot().sortWithoutEvents(this.data.getSortFn(), true, true);
		//Sort ourselves without trigger a storm.
		this.getRoot().enableStoreSorting();

		this.data._autoSort = true;
		this.resumeEvents(true);
    }
});
