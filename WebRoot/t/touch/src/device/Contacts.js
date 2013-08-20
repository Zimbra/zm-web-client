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
 * This device API allows you to access a users contacts using a {@link Ext.data.Store}. This allows you to search, filter
 * and sort through all the contacts using its methods.
 *
 * To use this API, all you need to do is require this class (`Ext.device.Contacts`) and then use `Ext.device.Contacts.getContacts()`
 * to retrieve an array of contacts.
 *
 * **Please note that this will *only* work using the Sencha Native Packager.**
 * 
 * # Example
 *
 *     Ext.application({
 *         name: 'Sencha',
 *         requires: 'Ext.device.Contacts',
 *
 *         launch: function() {
 *             Ext.Viewport.add({
 *                 xtype: 'list',
 *                 itemTpl: '{First} {Last}',
 *                 store: {
 *                     fields: ['First', 'Last'],
 *                     data: Ext.device.Contacts.getContacts()
 *                 }
 *             });
 *         }
 *     });
 *
 * @mixins Ext.device.contacts.Abstract
 * @mixins Ext.device.contacts.Sencha
 *
 * @aside guide native_apis
 */
Ext.define('Ext.device.Contacts', {
    singleton: true,

    requires: [
        'Ext.device.Communicator',
        'Ext.device.contacts.Sencha'
    ],

    constructor: function() {
        var browserEnv = Ext.browser.is;

        if (browserEnv.WebView && !browserEnv.PhoneGap) {
            return Ext.create('Ext.device.contacts.Sencha');
        } else {
            return Ext.create('Ext.device.contacts.Abstract');
        }
    }
});
