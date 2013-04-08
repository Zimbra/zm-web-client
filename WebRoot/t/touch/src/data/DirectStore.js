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
 * @aside guide stores
 *
 * Small helper class to create an {@link Ext.data.Store} configured with an {@link Ext.data.proxy.Direct}
 * and {@link Ext.data.reader.Json} to make interacting with an {@link Ext.direct.Manager} server-side
 * {@link Ext.direct.Provider Provider} easier. To create a different proxy/reader combination create a basic
 * {@link Ext.data.Store} configured as needed.
 *
 * Since configurations are deeply merged with the standard configuration, you can override certain proxy and
 * reader configurations like this:
 *
 *     Ext.create('Ext.data.DirectStore', {
 *         proxy: {
 *             paramsAsHash: true,
 *             directFn: someDirectFn,
 *             simpleSortMode: true,
 *             reader: {
 *                 rootProperty: 'results',
 *                 idProperty: '_id'
 *             }
 *         }
 *     });
 *
 */
Ext.define('Ext.data.DirectStore', {
    extend: 'Ext.data.Store',
    alias: 'store.direct',
    requires: ['Ext.data.proxy.Direct'],

    config: {
        proxy: {
            type: 'direct',
            reader: {
                type: 'json'
            }
        }
    }
});
