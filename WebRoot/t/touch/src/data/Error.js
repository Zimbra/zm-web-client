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
 * @author Ed Spencer
 * @class Ext.data.Error
 *
 * This is used when validating a record. The validate method will return an {@link Ext.data.Errors} collection
 * containing Ext.data.Error instances. Each error has a field and a message.
 *
 * Usually this class does not need to be instantiated directly - instances are instead created
 * automatically when {@link Ext.data.Model#validate validate} on a model instance.
 */

Ext.define('Ext.data.Error', {
    config: {
        /**
         * @cfg {String} field
         * The name of the field this error belongs to.
         */
        field: null,

        /**
         * @cfg {String} message
         * The message containing the description of the error.
         */
        message: ''
    },

    constructor: function(config) {
        this.initConfig(config);
    }
});
