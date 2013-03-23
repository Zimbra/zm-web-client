/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
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
 * 
 * ***** END LICENSE BLOCK *****
 */
/**
 * @private
 */
Ext.define('Ext.util.Grouper', {

    /* Begin Definitions */

    extend: 'Ext.util.Sorter',

    isGrouper: true,
    
    config: {
        /**
         * @cfg {Function} groupFn This function will be called for each item in the collection to
         * determine the group to which it belongs.
         * @cfg {Object} groupFn.item The current item from the collection
         * @cfg {String} groupFn.return The group identifier for the item
         */
        groupFn: null,

        /**
         * @cfg {String} sortProperty You can define this configuration if you want the groups to be sorted
         * on something other then the group string returned by the `groupFn`.
         */
        sortProperty: null,

        /**
         * @cfg {Function} sorterFn
         * Grouper has a custom sorterFn that cannot be overridden by the user. If a property has been defined
         * on this grouper, we use the default `sorterFn`, else we sort based on the returned group string.
         */
        sorterFn: function(item1, item2) {
            var property = this.getSortProperty(),
                groupFn, group1, group2, modifier;

            groupFn = this.getGroupFn();
            group1 = groupFn.call(this, item1);
            group2 = groupFn.call(this, item2);

            if (property) {
                if (group1 !== group2) {
                    return this.defaultSortFn.call(this, item1, item2);
                } else {
                    return 0;
                }
            }
            return (group1 > group2) ? 1 : ((group1 < group2) ? -1 : 0);
        }
    },

    /**
     * @private
     * Basic default sorter function that just compares the defined property of each object.
     */
    defaultSortFn: function(item1, item2) {
        var me = this,
            transform = me._transform,
            root = me._root,
            value1, value2,
            property = me._sortProperty;

        if (root !== null) {
            item1 = item1[root];
            item2 = item2[root];
        }

        value1 = item1[property];
        value2 = item2[property];

        if (transform) {
            value1 = transform(value1);
            value2 = transform(value2);
        }

        return value1 > value2 ? 1 : (value1 < value2 ? -1 : 0);
    },

    updateProperty: function(property) {
        this.setGroupFn(this.standardGroupFn);
    },

    standardGroupFn: function(item) {
        var root = this.getRoot(),
            property = this.getProperty(),
            data = item;

        if (root) {
            data = item[root];
        }

        return data[property];
    },

    getGroupString: function(item) {
        var group = this.getGroupFn().call(this, item);
        return typeof group != 'undefined' ? group.toString() : '';
    }
});