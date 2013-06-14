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
 * This class represents a contact, which is typically a person, but also could
 * be a distribution list.
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

			// raw attrs in case they're needed
			{ name: 'attrs', type: 'auto' },

			// fields that can have multiple instances
			{ name: 'email', type: 'auto' },
			{ name: 'phone', type: 'auto' },
			{ name: 'address', type: 'auto' },
			{ name: 'fax', type: 'auto' },
			{ name: 'url', type: 'auto' },

			// long name, eg "Johnathan Smith"
			{
				name: 'longName',
				type: 'string',
				convert: function (v, record) {
					var d = record.get('attrs') || {};
					return (d.firstName && d.lastName) ? [d.firstName, d.lastName].join(' ') : d.firstName || d.email || '';
				}
			},

			// last name first, eg "Smith, Johnathan"
			{
				name: 'nameLastFirst',
				type: 'string',
				convert: function (v, record) {
					var d = record.get('attrs') || {};
					return (d.firstName && d.lastName) ? [d.lastName, d.firstName].join(', ') : d.firstName || d.email || '';
				}
			},

			// short name or nickname, eg "John"
			{
				name: 'shortName',
				type: 'string',
				convert: function (v, record) {
					var d = record.get('attrs') || {};
					return d.nickname || d.firstName || d.email || d.lastName || '';
				}
			},

			// full name with all the parts, eg: Mr Fred Barnaby (Delacroix) Flintstone, Esquire “Knuckles”
			{
				name: 'fullName',
				type: 'string',
				convert: function (v, record) {
					var d = record.get('attrs') || {},
						nameParts = [
							d.namePrefix,
							d.firstName,
							d.middleName,
							d.maidenName ? '(' + d.maidenName + ')' : null,
							d.lastName
						],
						fullName = Ext.Array.clean(nameParts).join(' ');

					if (d.nameSuffix) {
						fullName += ', ' + d.nameSuffix;
					}
					if (d.nickname) {
						fullName += ' "' + d.nickname + '"';
					}

					return fullName;
				}
			},

			// combo of job title and company, eg "Waiter, Denny's"
			{
				name: 'job',
				type: 'string',
				convert: function(v, record) {
					var d = record.get('attrs') || {};
					return Ext.Array.clean([d.jobTitle, d.company]).join(', ');
				}
			},

			// URL to thumbnail picture of contact
            {
	            name: 'imageUrl',
	            type: 'auto',
                convert: function(v, record) {
                    var image = record.data.image;
                    var imagePart  = (image && image.part) || record.data.imagepart;

                    if (!imagePart) {
                        return record.data.zimletImage || null;  //return zimlet populated image only if user-uploaded image is not there.
                    }

                    return ZCS.htmlutil.buildUrl({
                        path: ZCS.constant.PATH_MSG_FETCH,
                        qsArgs: {
                            auth: 'co',
                            id: record.data.id,
                            part: imagePart,
                            max_width:48,
                            t:(new Date()).getTime()
                        }
                    });
                }
            },

			// Fields related to contact groups
			{ name: 'isGroup', type: 'boolean' },       // true for groups
            { name: 'groupMembers', type: 'auto' },     // list of small member objects
			// group member fields
			{ name: 'memberEmail', type: 'string' },
			{ name: 'memberPhone', type: 'string' }
        ],

		proxy: {
			type: 'soapproxy',
			api: {
				create  : urlBase + 'CreateContactRequest',
				read    : urlBase + 'GetContactsRequest',
				update  : urlBase + 'ContactActionRequest',
				destroy : urlBase + 'ContactActionRequest'
			},
			reader: 'contactreader',
			writer: 'contactwriter'
		}
	}
});
