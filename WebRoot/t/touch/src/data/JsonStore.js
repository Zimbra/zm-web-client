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
 * @author Ed Spencer
 * @class Ext.data.JsonStore
 * @extends Ext.data.Store
 * @private
 *
 * Small helper class to make creating {@link Ext.data.Store}s from JSON data easier.
 * A JsonStore will be automatically configured with a {@link Ext.data.reader.Json}.
 *
 * A store configuration would be something like:
 *
 *     var store = new Ext.data.JsonStore({
 *         // store configs
 *         autoDestroy: true,
 *         storeId: 'myStore',
 *
 *         proxy: {
 *             type: 'ajax',
 *             url: 'get-images.php',
 *             reader: {
 *                 type: 'json',
 *                 root: 'images',
 *                 idProperty: 'name'
 *             }
 *         },
 *
 *         // alternatively, a {@link Ext.data.Model} name can be given (see {@link Ext.data.Store} for an example)
 *         fields: ['name', 'url', {name:'size', type: 'float'}, {name:'lastmod', type:'date'}]
 *     });
 *
 * This store is configured to consume a returned object of the form:
 *
 *     {
 *         images: [
 *             {name: 'Image one', url:'/GetImage.php?id=1', size:46.5, lastmod: new Date(2007, 10, 29)},
 *             {name: 'Image Two', url:'/GetImage.php?id=2', size:43.2, lastmod: new Date(2007, 10, 30)}
 *         ]
 *     }
 *
 * An object literal of this form could also be used as the {@link #data} config option.
 *
 * @xtype jsonstore
 */
Ext.define('Ext.data.JsonStore',  {
    extend: 'Ext.data.Store',
    alias: 'store.json',

    config: {
        proxy: {
            type: 'ajax',
            reader: 'json',
            writer: 'json'
        }
    }
});
