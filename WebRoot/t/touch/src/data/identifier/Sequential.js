/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
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
 * 
 * ***** END LICENSE BLOCK *****
 */
/**
 * @author Tommy Maintz
 *
 * This class is a sequential id generator. A simple use of this class would be like so:
 *
 *     Ext.define('MyApp.data.MyModel', {
 *         extend: 'Ext.data.Model',
 *         config: {
 *             identifier: 'sequential'
 *         }
 *     });
 *     // assign id's of 1, 2, 3, etc.
 *
 * An example of a configured generator would be:
 *
 *     Ext.define('MyApp.data.MyModel', {
 *         extend: 'Ext.data.Model',
 *         config: {
 *             identifier: {
 *                 type: 'sequential',
 *                 prefix: 'ID_',
 *                 seed: 1000
 *             }
 *         }
 *     });
 *     // assign id's of ID_1000, ID_1001, ID_1002, etc.
 *
 */
Ext.define('Ext.data.identifier.Sequential', {
    extend: 'Ext.data.identifier.Simple',
    alias: 'data.identifier.sequential',

    config: {
        /**
         * @cfg {String} prefix
         * The string to place in front of the sequential number for each generated id. The
         * default is blank.
         */
        prefix: '',

        /**
         * @cfg {Number} seed
         * The number at which to start generating sequential id's. The default is 1.
         */
        seed: 1
    },

    constructor: function() {
        var me = this;
        me.callParent(arguments);
        me.parts = [me.getPrefix(), ''];
    },

    generate: function(record) {
        var me = this,
            parts = me.parts,
            seed = me.getSeed() + 1;

        me.setSeed(seed);
        parts[1] = seed;

        return parts.join('');
    }
});