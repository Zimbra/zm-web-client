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
Ext.define('Ext.device.device.PhoneGap', {
    extend: 'Ext.device.device.Abstract',

    constructor: function() {
        // We can't get the device details until the device is ready, so lets wait.
        if (Ext.Viewport.isReady) {
            this.onReady();
        } else {
            Ext.Viewport.on('ready', this.onReady, this, {single: true});
        }
    },

    onReady: function() {
        this.name = device.name;
        this.uuid = device.uuid;
        this.platform = device.platformName || Ext.os.name;
    }
});
