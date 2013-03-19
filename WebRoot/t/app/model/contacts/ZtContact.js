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

Ext.define('ZCS.model.contacts.ZtContact', {

	extend: 'ZCS.model.ZtItem',

	requires: [
		'ZCS.model.contacts.ZtContactReader',
		'ZCS.model.contacts.ZtContactWriter'
	],

	config: {

		fields: [
			{ name: 'firstName', type: 'string' },
			{ name: 'lastName', type: 'string' },
			{
				name: 'displayName',
				type: 'string',
				convert: function (v, record) {
					if (record.data.firstName && record.data.lastName) {
						return record.data.firstName + ' ' + record.data.lastName;
					} else {
						return record.data.email;
					}
				}
			},
			{ name: 'email', type: 'string' },
			{ name: 'company', type: 'string' },
			{ name: 'fileAs', type: 'int' } ,
            /**
             * image and imagepart fields store the image related attributes for a contact.
             */
            { name: 'image', type: 'auto'},
            { name: 'imagepart', type: 'auto'}
		],

		proxy: {
			type: 'soapproxy',
			api: {
				create  : '',
				read    : urlBase + 'GetContactsRequest',
				update  : urlBase + 'ContactActionRequest',
				destroy : urlBase + 'ContactActionRequest'
			},
			reader: 'contactreader',
			writer: 'contactwriter'
		}
	},

    constructor: function(data, id) {

        var contact = this.callParent(arguments) || this,
            altKey = data && data.email;

        /**
         * Create a mapping of contact email address against contact Id. This helps in fetching
         * contact record from email address.
         * Usage : This cache is used in fetching image data for a contact based on email id.
         */
        if (altKey) {
            // store only the contact id against email, we can fetch the whole contact using the id.
            ZCS.cache.set(altKey, data.id, 'email');
        }
        return contact;
    }
});
