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
 * @author Tommy Maintz
 *
 * This class is the simple default id generator for Model instances.
 *
 * An example of a configured simple generator would be:
 *
 *     Ext.define('MyApp.data.MyModel', {
 *         extend: 'Ext.data.Model',
 *         config: {
 *             identifier: {
 *                 type: 'simple',
 *                 prefix: 'ID_'
 *             }
 *         }
 *     });
 *     // assign id's of ID_1, ID_2, ID_3, etc.
 *
 */
Ext.define('Ext.data.identifier.Simple', {
    alias: 'data.identifier.simple',
    
    statics: {
        AUTO_ID: 1
    },

    config: {
        prefix: 'ext-record-'
    },

    constructor: function(config) {
        this.initConfig(config);
    },

    generate: function(record) {
        return this._prefix + this.self.AUTO_ID++;
    }
});