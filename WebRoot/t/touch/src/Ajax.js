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
 * @aside guide ajax
 *
 * A singleton instance of an {@link Ext.data.Connection}. This class
 * is used to communicate with your server side code. It can be used as follows:
 *
 *     Ext.Ajax.request({
 *         url: 'page.php',
 *         params: {
 *             id: 1
 *         },
 *         success: function(response){
 *             var text = response.responseText;
 *             // process server response here
 *         }
 *     });
 *
 * Default options for all requests can be set by changing a property on the Ext.Ajax class:
 *
 *     Ext.Ajax.setTimeout(60000); // 60 seconds
 *
 * Any options specified in the request method for the Ajax request will override any
 * defaults set on the Ext.Ajax class. In the code sample below, the timeout for the
 * request will be 60 seconds.
 *
 *     Ext.Ajax.setTimeout(120000); // 120 seconds
 *     Ext.Ajax.request({
 *         url: 'page.aspx',
 *         timeout: 60000
 *     });
 *
 * In general, this class will be used for all Ajax requests in your application.
 * The main reason for creating a separate {@link Ext.data.Connection} is for a
 * series of requests that share common settings that are different to all other
 * requests in the application.
 */
Ext.define('Ext.Ajax', {
    extend: 'Ext.data.Connection',
    singleton: true,

    /**
     * @property {Boolean} autoAbort
     * Whether a new request should abort any pending requests.
     */
    autoAbort : false
});
