/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra, Inc.
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * This class represents a Zimbra item such as a mail message, a conversation, or a contact.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.ZtItem', {
	extend: 'Ext.data.Model',
	requires: [
		'ZCS.model.ZtSoapProxy'
	],
	config: {
		idProperty: 'id',
		proxy: {
			type: 'soapproxy',
			// our server always wants us to POST for API calls
			actionMethods: {
				create  : 'POST',
				read    : 'POST',
				update  : 'POST',
				destroy : 'POST'
			},
			headers: {
				'Content-Type': "application/soap+xml; charset=utf-8"
			},
			// prevent Sencha from adding junk to the URL
			pageParam: false,
			startParam: false,
			limitParam: false,
			noCache: false
		}
	},

	constructor: function(data, id) {
		ZCS.cache.set(data.id || id, this);
		return this.callParent(arguments);
	}
});
