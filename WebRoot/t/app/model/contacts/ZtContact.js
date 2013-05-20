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
            { name: 'namePrefix', type: 'string' },
            { name: 'middleName', type: 'string' },
            { name: 'maidenName', type: 'string' },
            { name: 'nameSuffix', type: 'string' },
            {
                name: 'emailFields',
                type: 'auto'
            },
            {
                name: 'mobilePhoneFields',
                type: 'auto'
            },
            {
                name: 'workPhoneFields',
                type: 'auto'
            },
            {
                name: 'otherPhoneFields',
                type: 'auto'
            },
            {
                name: 'homeUrlFields',
                type: 'auto'
            },
            {
                name: 'workUrlFields',
                type: 'auto'
            },
            {
                name: 'otherUrlFields',
                type: 'auto'
            },
            { name: 'jobTitle', type: 'string'},
            { name: 'department', type: 'string'},
            { name: 'company', type: 'string' },
			{ name: 'fileAs', type: 'int' } ,
            /**
             * image and imagepart fields store the image related attributes for a contact.
             */
            { name: 'image', type: 'auto'},
            { name: 'imagepart', type: 'auto'},
            { name: 'zimletImage', type: 'auto'},
            //Home Address Fields
            { name: 'homeStreetFields', type: 'auto'},
            { name: 'homeCityFields', type: 'auto'},
            { name: 'homeStateFields', type: 'auto'},
            { name: 'homePostalCodeFields', type: 'auto'},
            { name: 'homeCountryFields', type: 'auto'},
            //Work Address Fields
            { name: 'workStreetFields', type: 'auto'},
            { name: 'workCityFields', type: 'auto'},
            { name: 'workStateFields', type: 'auto'},
            { name: 'workPostalCodeFields', type: 'auto'},
            { name: 'workCountryFields', type: 'auto'},
            //Other Address Fields
            { name: 'otherStreetFields', type: 'auto'},
            { name: 'otherCityFields', type: 'auto'},
            { name: 'otherStateFields', type: 'auto'},
            { name: 'otherPostalCodeFields', type: 'auto'},
            { name: 'otherCountryFields', type: 'auto'},

            { name: 'isHomeAddressExists', type: 'boolean',
                convert:function(v, record) {
                    if (record.data.homeStreetFields || record.data.homeCityFields || record.data.homeStateFields
                        || record.data.homePostalCodeFields || record.data.homeCountryFields) {
                        return true;
                    } else {
                        return false;
                    }
                }
            },
            { name: 'isWorkAddressExists', type: 'boolean',
                convert:function(v, record) {
                    if (record.data.workStreetFields || record.data.workCityFields || record.data.workStateFields
                        || record.data.workPostalCodeFields || record.data.workCountryFields) {
                        return true;
                    } else {
                        return false;
                    }
                }
            },
            { name: 'isOtherAddressExists', type: 'boolean',
                convert:function(v, record) {
                    if (record.data.otherStreetFields || record.data.otherCityFields || record.data.otherStateFields
                        || record.data.otherPostalCodeFields || record.data.otherCountryFields) {
                        return true;
                    } else {
                        return false;
                    }
                }
            },
            { name: 'imageUrl', type:'auto',
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
            }

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
	},

    constructor: function(data, id) {
        var contact = this.callParent(arguments) || this,
            emails = data && data.emailFields,
            altKey;

        //All the emails for a contact are stored in the emailFields array
        if (emails) {
            for (var i = 0, len = emails.length; i < len; i++) {
	            altKey = emails[i];
	            if (altKey) {
		            ZCS.cache.set(altKey, this, 'email');
	            }
            }
        }
        return contact;
    }
});
