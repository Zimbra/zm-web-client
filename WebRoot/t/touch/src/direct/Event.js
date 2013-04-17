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
 * @class Ext.direct.Event
 * A base class for all Ext.direct events. An event is
 * created after some kind of interaction with the server.
 * The event class is essentially just a data structure
 * to hold a Direct response.
 */
Ext.define('Ext.direct.Event', {
    alias: 'direct.event',

    requires: ['Ext.direct.Manager'],

    config: {
        status: true,

        /**
         * @cfg {Object} data The raw data for this event.
         * @accessor
         */
        data: null,

        /**
         * @cfg {String} name The name of this Event.
         * @accessor
         */
        name: 'event',

        xhr: null,

        code: null,

        message: '',

        result: null,

        transaction: null
    },

    constructor: function(config) {
        this.initConfig(config)
    }
});