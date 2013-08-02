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
 * This class parses JSON contact data into ZtContact objects.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.contacts.ZtContactReader', {

	extend: 'ZCS.model.ZtReader',

	alias: 'reader.contactreader',

	getDataFromNode: function(node) {

		var data = {},
			attrs = node._attrs;

		data.type = ZCS.constant.ITEM_CONTACT;
		if (attrs.type === 'group') {
			data.groupMembers = this.getGroupMembers(node.m);
	        data.isGroup = true;
            data.nickname = attrs.nickname;
        }
		else {
			data.folderId = node.l;
			data = this.parseAttributes(attrs, data);
		}

		data.tags = ZCS.model.ZtItem.parseTags(node.t);

        return data;
	},

	/**
	 * Some base attributes (such as email or phone) have a couple of variations: The first
	 * is type, which is something like 'home' or 'work'. The second is an iterator for
	 * multiple instances - for example, I could have several email addresses. The purpose
	 * of this function is to parse all that into a form that's easily consumed by a template.
	 * Any attribute that can appear multiple times will form a list. Any attribute that can
	 * vary by type will be contained in an object with a value and a type. Addresses will have
	 * several bits of data instead of a value: stree, city, etc., as well as a type.
	 *
	 * The parsing is done based on the name of the attribute. For example, 'homeCity2' tells
	 * us that the value is the city of the second home address.
	 *
	 * @param {Object}  attrs   contact attributes
	 * @param {Object}  data    parsed attribute data
	 */
	parseAttributes: function(attrs, data) {

		data = data || {};

		var	addresses = {},
			parsedAttrs = {};

		// attributes that don't require any parsing
		Ext.copyTo(data, attrs, ZCS.constant.CONTACT_FIELDS);

		// attributes that have different types or which can appear multiply
		Ext.each(Object.keys(attrs).sort(), function(attr) {

			var	value = attrs[attr];

			// 'email' has no type but can be multiple
			if (attr.indexOf('email') === 0) {
				var field = 'email',
					list = parsedAttrs[field] = parsedAttrs[field] || [];

				list.push({ email: value });
			}
			else {
				// see if attr is typed (eg 'homePhone')
				var m = attr.match(ZCS.constant.REGEX_CONTACT_ATTR);
				if (m && m.length > 0) {
					var type = m[1],
						f = m[2],
						field = f.charAt(0).toLowerCase() + f.slice(1),     // uncapitalize first letter
						num = m[3];
					type = ZCS.constant.ATTR_TYPE_SORT_VALUE[type] ? type : 'other';
					if (field === 'fax') {
						field = 'phone';
						type = 'other';
					}
					// address is a composite field
					if (ZCS.constant.IS_ADDRESS_FIELD[field]) {
						var idx = num ? num - 1 : 0,
							addressesByType = addresses[type] = addresses[type] || [],
							address = addressesByType[idx] = addressesByType[idx] || {};
						address[field] = value;
						address.addressType = address.addressType || type;
						address.typeStr = address.typeStr || ZtMsg[type] || '';
					}
					// phone, fax, url (and workEmail)
					else if (ZCS.constant.IS_PARSED_ATTR_FIELD[field]) {
						var list = parsedAttrs[field] = parsedAttrs[field] || [],
							dataObj = {};
						dataObj[field] = value;
						dataObj[field + 'Type'] = type;
						dataObj.typeStr = ZtMsg[type] || '';
						list.push(dataObj);
					}
				}
			}
		}, this);

		// gather all the addresses together
		parsedAttrs.address = [];
		Ext.Object.each(addresses, function(type) {
			parsedAttrs.address = parsedAttrs.address.concat(addresses[type]);
		}, this);

		Ext.each(parsedAttrs.address, function(addr) {
			addr.mapAddr = addr.street || addr.city ? Ext.Array.clean([addr.street, addr.city, addr.state, addr.country]).join(', ').replace(' ', '+') : '';
		}, this);

		// sort each list based on type
		Ext.Object.each(parsedAttrs, function(field) {
			parsedAttrs[field].sort(function(a, b) {
				var typeA = a[field + 'Type'],
					typeB = b[field + 'Type'];
				if (!typeA || !typeB) {
					return !typeA ? -1 : 1;
				}
				else {
					var sortA = ZCS.constant.ATTR_TYPE_SORT_VALUE[typeA] || 100;
					var sortB = ZCS.constant.ATTR_TYPE_SORT_VALUE[typeB] || 100;
					return sortA > sortB ? 1 : sortA === sortB ? 0 : -1;
				}
			});
		}, this);

		// copy into data
		Ext.apply(data, parsedAttrs);

		return data;
	},

	/**
	 * Take a contact group and fill out minimal data objects for each of its members.
	 *
	 * @param {Array}   members     contact group members
	 *
	 * @return {Array}  list of parsed member data
	 */
    getGroupMembers: function(members) {

        var group = [], data;

	    Ext.each(members, function(member) {
		    data = {};
		    if (member.cn) {
			    var attrs = data.attrs = member.cn[0]._attrs;
			    Ext.copyTo(data, attrs, ['jobTitle', 'company']);
			    data.longName = (attrs.firstName && attrs.lastName) ? [attrs.firstName, attrs.lastName].join(' ') : attrs.firstName || attrs.lastName || '';
			    data.memberEmail = attrs.email || '';
			    data.memberPhone = attrs.workPhone || attrs.homePhone || attrs.otherPhone || '';
			    if (member.type === 'C' || member.type === 'G') {
				    // TODO: what should we do here? will this happen?
				    data.itemId = member.value;
			    }
                data.memberImageUrl = ZCS.model.contacts.ZtContact.getImageUrl(attrs, member.value);
		    }
		    else if (member.type === 'I') {
			    data.memberEmail = member.value;
		    }
			group.push(data);
		}, this);

	    return group;
    }
});
