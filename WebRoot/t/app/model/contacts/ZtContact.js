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

			{ name: 'contactType',  type: 'string' },   // ZCS.constant.CONTACT_*

			// simple fields (not composite, not multiple) - see ZCS.constant.CONTACT_FIELDS
			{ name: 'firstName',    type: 'string' },
			{ name: 'lastName',     type: 'string' },
			{ name: 'namePrefix',   type: 'string' },
			{ name: 'nameSuffix',   type: 'string' },
			{ name: 'nickname',     type: 'string' },
			{ name: 'maidenName',   type: 'string' },
			{ name: 'middleName',   type: 'string' },
			{ name: 'company',      type: 'string' },
			{ name: 'jobTitle',     type: 'string' },
			{ name: 'department',   type: 'string' },
            { name: 'image',        type: 'auto'},
            { name: 'imagepart',    type: 'auto'},
            { name: 'zimletImage',  type: 'auto'},

			// fields that can have multiple instances - see ZCS.constant.CONTACT_MULTI_FIELDS
			{ name: 'email',        type: 'auto' },
			{ name: 'phone',        type: 'auto' },
			{ name: 'address',      type: 'auto' },
			{ name: 'url',          type: 'auto' },

			// Below are fields created out of the simple fields above

			// long name, eg "Johnathan Smith"
			{
				name: 'longName',
				type: 'string',
				convert: function (value, record) {
					var firstName = record.get('firstName'),
						lastName = record.get('lastName'),
                        emails = record.get('email'),
                        addrObj = emails && emails.length > 0 ? emails[0] : null,
                        email = addrObj ? addrObj.email : '';
                    return (firstName && lastName) ? [firstName, lastName].join(' ') : firstName || lastName || email || '';
				}
			},

			// last name first, eg "Smith, Johnathan"
			{
				name: 'nameLastFirst',
				type: 'string',
				convert: function (value, record) {
					var firstName = record.get('firstName'),
						lastName = record.get('lastName'),
                        emails = record.get('email'),
                        addrObj = emails && emails.length > 0 ? emails[0] : null,
                        email = addrObj ? addrObj.email : '';

                    return (firstName && lastName) ? [lastName, firstName].join(', ') : firstName || lastName || email || '';
				}
			},

			// short name or nickname, eg "Johnathan" or "John"
			{
				name: 'shortName',
				type: 'string',
				convert: function (value, record) {
                    var emails = record.get('email'),
                        addrObj = emails && emails.length > 0 ? emails[0] : null,
                        email = addrObj ? addrObj.email : '';
                    return record.get('nickname') || record.get('firstName') || email || record.get('lastName') || '';
				}
			},

			// full name with all the parts, eg: Mr Fred Barnaby (Delacroix) Flintstone, Esquire “Knuckles”
			{
				name: 'fullName',
				type: 'string',
				convert: function (value, record) {
					var nameParts = [
							record.get('namePrefix'),
							record.get('firstName'),
							record.get('middleName'),
							record.get('maidenName') ? '(' + record.get('maidenName') + ')' : null,
							record.get('lastName')
						],
						fullName = Ext.Array.clean(nameParts).join(' ');

					if (record.get('nameSuffix')) {
						fullName += ', ' + record.get('nameSuffix');
					}
					if (record.get('nickname')) {
						fullName += ' "' + record.get('nickname') + '"';
					}

					return fullName;
				}
			},

			// combo of job title and company, eg "Waiter, Denny's"
			{
				name: 'job',
				type: 'string',
				convert: function(value, record) {
					return Ext.Array.clean([record.get('jobTitle'), record.get('company')]).join(', ');
				}
			},

			// URL to thumbnail picture of contact
            {
	            name: 'imageUrl',
	            type: 'auto',
                convert: function(value, record) {
                    return ZCS.model.contacts.ZtContact.getImageUrl(record, record.getId());
                }
            },

			// true if the contact is a local, user-created group
			{
				name: 'isGroup',
				type: 'boolean',
				convert: function(value, record) {
					return record.get('contactType') === ZCS.constant.CONTACT_GROUP;
				}
			},

			// true if the contact is a distribution list
			{
				name: 'isDistributionList',
				type: 'boolean',
				convert: function(value, record) {
					return record.get('contactType') === ZCS.constant.CONTACT_DL;
				}
			},

			// true if the contact is a group or a distribution list
			{
				name: 'isMultiple',
				type: 'boolean',
				convert: function(value, record) {
					return record.get('contactType') !== ZCS.constant.CONTACT_PERSON;
				}
			},

			// List of members (groups and distribution lists). Each member is an anonymous object
			// with 'memberEmail', 'memberPhone', and 'memberImageUrl' properties.
            { name: 'members', type: 'auto' },

			// Distribution lists
            { name: 'isMember', type: 'boolean'},
            { name: 'isOwner',  type: 'boolean'}
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
            emails = data && data.email,
            altKey;

        if (emails) {
            for (var i = 0, len = emails.length; i < len; i++) {
                altKey = emails[i].email;
                if (altKey) {
                    ZCS.cache.set(altKey, this, 'email');
                }
            }
        }

	    // Compile a static list of fields that are converted (so they can be updated when
	    // the contact model changes)
	    if (!ZCS.model.contacts.ZtContact.convertedFields) {
		    var allFields = this.getFields(),
			    convertedFields = [];
		    allFields.each(function(field) {
			    if (field.hasCustomConvert()) {
				    convertedFields.push(field.getName());
			    }
		    }, this);
		    ZCS.model.contacts.ZtContact.convertedFields = convertedFields;
	    }

	    return contact;
    },

	statics: {

		convertedFields: null,

		/**
		 * Creates a ZtContact from a ZtEmailAddress. The name portion of the address is parsed into
		 * first, middle, and last names. There will be some misses since the parsing is fairly simple.
		 *
		 * @param {ZtEmailAddress}  addr        email address object
		 *
		 * @return {ZtContact}  a contact
		 */
		fromEmailObj: function(addr) {

			var data = {},
				fullName = addr.get('name') || '',
				parts = fullName.split(','),
				firstName, middleName, lastName;

			// Handle "Last, First" by moving Last to the end
			fullName = (parts.length === 2) ? [ parts[1], parts[0] ].join(' ') : fullName;
			parts = fullName.split(/\s+/);
			// "Charo"
			if (parts.length === 1) {
				lastName = parts[0];
			}
			// "Ryan Gosling"
			else if (parts.length === 2) {
				firstName = parts[0];
				lastName = parts[1];
			}
			// "David Ogden Stiers"
			else if (parts.length > 2) {
				firstName = parts[0];
				middleName = parts[1];
				lastName = parts.slice(2).join(' ');
			}

			return new ZCS.model.contacts.ZtContact({
				firstName:  firstName,
				middleName: middleName,
				lastName:   lastName,
				email:      [ { email: addr.get('email') } ]
			});
		},

		// Compares two contacts. Primary key is last name (or nickname for a group). Secondary key is first name.
		compare: function(contact1, contact2) {

			var lastName1 = contact1.get('isGroup') ? contact1.get('nickname') : contact1.get('lastName'),
				lastName2 = contact2.get('isGroup') ? contact2.get('nickname') : contact2.get('lastName'),
				firstName1 = contact1.get('firstName'),
				firstName2 = contact2.get('firstName');

			if (lastName1 === lastName2) {
				return firstName1 > firstName2 ? 1 : (firstName1 === firstName2 ? 0 : -1);
			}
			else {
				return lastName1 > lastName2 ? 1 : (lastName1 === lastName2 ? 0 : -1);
			}
		},

		/**
		 * Returns a list of JSON attributes whose values differ between the two contacts.
		 *
		 * @param {ZtContact}   contactA        contact
		 * @param {ZtContact}   contactB        other contact
		 *
		 * @return {Array}  list of JSON attributes
		 */
		getChangedAttrs: function(contactA, contactB) {

			var attrsA = contactA ? contactA.fieldsToAttrs() : {},
				attrsB = contactB ? contactB.fieldsToAttrs() : {},
				changedAttrs = [], valueA, valueB;

			Ext.each(Ext.Array.unique(Object.keys(attrsA).concat(Object.keys(attrsB))), function(attr) {
				valueA = attrsA[attr] || '';
				valueB = attrsB[attr] || '';
					if (valueA !== valueB) {
						changedAttrs.push(attr);
					}
			}, this);

			return changedAttrs;
		},

		/**
		 * Returns a list of fields whose values differ between the two contacts.
		 *
		 * @param {ZtContact}   contactA        contact
		 * @param {ZtContact}   contactB        other contact
		 * @param {Array}       fields          list of fields to check
		 *
		 * @return {Array}  list of field names
		 */
		getChangedFields: function(contactA, contactB, fields) {

			var changedFields = [],
				valueA, valueB, lenA, lenB, subFields;

			Ext.each(fields, function(field) {
				// Default value of '' is okay because attr values are all strings (never 0)
				valueA = contactA.get(field) || '';
				valueB = contactB.get(field) || '';
				if (ZCS.constant.IS_CONTACT_MULTI_FIELD[field]) {
					lenA = valueA ? valueA.length : 0;
					lenB = valueB ? valueB.length : 0;
					if (lenA !== lenB) {
						changedFields.push(field);
					}
					else {
						subFields = [ field + 'Type' ];
						subFields = subFields.concat(field === 'address' ? ZCS.constant.ADDRESS_FIELDS : field);
						var isChanged = false,
							i, subValueA, subValueB;
						for (i = 0; i < lenA; i++) {
							subValueA = valueA[i] || '';
							subValueB = valueB[i] || '';
							Ext.each(subFields, function(subField) {
								if (subValueA[subField] !== subValueB[subField] && !isChanged) {
									changedFields.push(field);
									isChanged = true;
									return false;
								}
							}, this);
						}
					}
				}
				else {
					if (valueA !== valueB) {
						changedFields.push(field);
					}
				}
			}, this);

			return changedFields;
		},

		/**
		 * Returns a URL that can be used to fetch the image for the given contact.
		 * @param {ZtContact|Object}    contact     contact or attr hash
		 * @param {String}              contactId   contact ID
		 * @param {int}                 maxWidth    max image width in pixels (defaults to 48)
		 *
		 * @return {String}     image URL
		 */
		getImageUrl: function(contact, contactId, maxWidth) {

			var attrs = contact instanceof ZCS.model.contacts.ZtContact ? contact.getData() : contact;

			var imagePart  = (attrs.image && attrs.image.part) || attrs.imagepart;

			if (!imagePart) {
				return attrs.zimletImage || null;  // return zimlet populated image only if user-uploaded image is not there
			}

			maxWidth = maxWidth || 48;

			return ZCS.htmlutil.buildUrl({
				path: ZCS.constant.PATH_MSG_FETCH,
				qsArgs: {
					auth:       'co',
					id:         contactId,
					part:       imagePart,
					max_width:  maxWidth,
					t:          (new Date()).getTime()
				}
			});
		}
	},

	/**
	 * Returns a hash of JSON attribute keys and values based on this contact's fields.
	 *
	 * @return {Object}     JSON attributes
	 */
	fieldsToAttrs: function() {

		// Simple attrs with equivalent contact fields
		var attrs = {};
		Ext.each(ZCS.constant.CONTACT_FIELDS, function(attr) {
			attrs[attr] = this.get(attr);
		}, this);

		// First, set up a list of values for each multiply-appearing type-qualified attr, eg 'homeCity'
		var attrList = {}, type, key;
		Ext.each(ZCS.constant.CONTACT_MULTI_FIELDS, function(multiField) {
			Ext.each(this.get(multiField), function(field) {
				type = field[multiField + 'Type'] || '';
				if (multiField === 'address') {
					Ext.each(ZCS.constant.ADDRESS_FIELDS, function(addrField) {
						if (field[addrField]) {
							key = type ? type + Ext.String.capitalize(addrField) : addrField;
							attrList[key] = attrList[key] || [];
							attrList[key].push(field[addrField]);
						}
					}, this);
				}
				else {
					key = type ? type + Ext.String.capitalize(multiField) : multiField;
					attrList[key] = attrList[key] || [];
					attrList[key].push(field[multiField]);
				}
			}, this);
		}, this);

		// Now, translate the index of each multiple attr into 'homeCity', 'homeCity2', etc
		Ext.Object.each(attrList, function(attr) {
			Ext.each(attrList[attr], function(value, index) {
				var attrName = attr + (index > 0 ? index + 1 : '');
				attrs[attrName] = value;
			}, this);
		}, this);

		return attrs;
	},

	/**
	 * Note that contact change notifications work differently from mail notifications. When the user edits
	 * a contact, the server sends back the updated contact in the response, and ST uses that to update the
	 * model. In that case, we only really need to update fields in the model which are converted, and which
	 * show up in the list template (the item panel just re-displays the item).
	 *
	 * TODO: distinguish between edited contact and out-of-band change notification
	 *
	 * @param modify
	 */
	handleModifyNotification: function(modify) {

		this.callParent(arguments);

		// ST takes care of updating the simple string fields like 'lastName' in the model, so any of those will
		// get updated in the list view. We need to update converted fields ourselves.
		if (modify && modify._attrs) {
			var reader = this.getProxy().getReader(),
				data = reader.getDataFromNode(modify),
				tmpContact = new ZCS.model.contacts.ZtContact(data),
				fields = Ext.Array.intersect(ZCS.constant.CONTACT_TEMPLATE_FIELDS, ZCS.model.contacts.ZtContact.convertedFields),
				changedFields = ZCS.model.contacts.ZtContact.getChangedFields(this, tmpContact, fields);

			Ext.each(changedFields, function(field) {
				this.set(field, tmpContact.get(field));
			}, this);

			tmpContact.destroy();
		}
	}
});
