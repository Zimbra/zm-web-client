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
 * @author Ed Spencer
 *
 * Simple wrapper class that represents a set of records returned by a Proxy.
 */
Ext.define('Ext.data.ResultSet', {
    config: {
        /**
         * @cfg {Boolean} loaded
         * True if the records have already been loaded. This is only meaningful when dealing with
         * SQL-backed proxies.
         */
        loaded: true,

        /**
         * @cfg {Number} count
         * The number of records in this ResultSet. Note that total may differ from this number.
         */
        count: null,

        /**
         * @cfg {Number} total
         * The total number of records reported by the data source. This ResultSet may form a subset of
         * those records (see {@link #count}).
         */
        total: null,

        /**
         * @cfg {Boolean} success
         * True if the ResultSet loaded successfully, false if any errors were encountered.
         */
        success: false,

        /**
         * @cfg {Ext.data.Model[]} records (required)
         * The array of record instances.
         */
        records: null,

        /**
         * @cfg {String} message
         * The message that was read in from the data
         */
        message: null
    },

    /**
     * Creates the resultSet
     * @param {Object} [config] Config object.
     */
    constructor: function(config) {
        this.initConfig(config);
    },

    applyCount: function(count) {
        if (!count && count !== 0) {
            return this.getRecords().length;
        }
        return count;
    },
    
    /**
     * @private
     * Make sure we set the right count when new records have been sent in
     */
    updateRecords: function(records) {
        this.setCount(records.length);
    }
});