/*
 * ***** BEGIN LICENSE BLOCK *****
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
 * ***** END LICENSE BLOCK *****
 */

/**
 * This class represents a contact, which is typically a person.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
var urlBase = ZCS.constant.SERVICE_URL_BASE;

Ext.define('ZCS.model.address.ZtAutoComplete', {

	extend: 'ZCS.model.mail.ZtEmailAddress',

	requires: [
		'ZCS.model.ZtSoapProxy',
		'ZCS.model.address.ZtAutoCompleteReader',
		'ZCS.model.address.ZtAutoCompleteWriter'
	],

	config: {

		fields: [

			// all matches have these server fields
			{ name: 'isGroup',      type: 'boolean' },  // true for distribution list
			{ name: 'ranking',      type: 'int'},       // # times sent to
			{ name: 'matchType',    type: 'string' },   // gal|contact|rankingTable
//			{ name: 'canExpand',    type: 'boolean' },

			// local contacts will have item and folder IDs
			{ name: 'contactId',    type: 'string' },
			{ name: 'folderId',     type: 'string' }
		],

		proxy: {
			type: 'soapproxy',
			actionMethods: {
				read    : 'POST'
			},
			api: {
				read    : urlBase + 'AutoCompleteRequest'
			},
			headers: {
				'Content-Type': "application/soap+xml; charset=utf-8"
			},
			reader: 'autocompletereader',
			writer: 'autocompletewriter',
			// prevent Sencha from adding junk to the URL
			pageParam: false,
			startParam: false,
			limitParam: false,
			noCache: false
		}
	}
});
