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
 * This class represents a contact, which is typically a person.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
var urlBase = ZCS.constant.SERVICE_URL_BASE;

Ext.define('ZCS.model.address.ZtAutoComplete', {

	extend: 'ZCS.model.ZtItem',

	requires: [
		'ZCS.model.address.ZtAutoCompleteReader',
		'ZCS.model.address.ZtAutoCompleteWriter'
	],

	config: {

		fields: [
			{ name: 'ranking', type: 'string'},
			{ name: 'email', type: 'string'},
			{ name: 'name', type: 'string'},
			{
				name: 'displayName',
				type: 'string',
				convert: function (v, record) {
					return record.get('name') || record.get('email');
				}
			},
			{ name: 'fullEmail', type: 'string'},
			{ name: 'type', type: 'string' },
			{ name: 'isGroup', type: 'int' },
			{ name: 'exp', type: 'int' },
			{ name: 'display', type: 'string' }
		],

		proxy: {
			api: {
				read    : urlBase + 'AutoCompleteRequest'
			},
			reader: 'autocompletereader',
			writer: 'autocompletewriter'
		}
	}
});
