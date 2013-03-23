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
//<feature logger>
Ext.define('Ext.log.writer.Writer', {
    extend: 'Ext.log.Base',

    requires: ['Ext.log.formatter.Formatter'],

    config: {
        formatter: null,
        filters: {}
    },

    constructor: function() {
        this.activeFilters = [];

        return this.callParent(arguments);
    },

    updateFilters: function(filters) {
        var activeFilters = this.activeFilters,
            i, filter;

        activeFilters.length = 0;

        for (i in filters) {
            if (filters.hasOwnProperty(i)) {
                filter = filters[i];
                activeFilters.push(filter);
            }
        }
    },

    write: function(event) {
        var filters = this.activeFilters,
            formatter = this.getFormatter(),
            i, ln, filter;

        for (i = 0,ln = filters.length; i < ln; i++) {
            filter = filters[i];

            if (!filters[i].accept(event)) {
                return this;
            }
        }

        if (formatter) {
            event.message = formatter.format(event);
        }

        this.doWrite(event);

        return this;
    },

    // @private
    doWrite: Ext.emptyFn
});
//</feature>
