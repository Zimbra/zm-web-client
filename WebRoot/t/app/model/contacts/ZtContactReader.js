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


        if (attrs.type && (attrs.type == ZCS.constant.ITEM_CONTACT_GROUP)) {
            data.groupMembers = this.populateContactGroupFields(node.m);
            data.type = ZCS.constant.ITEM_CONTACT_GROUP;
            data.nickname = attrs.nickname;
        } else {
            data = this.populateContactFields(attrs);
            data.type = ZCS.constant.ITEM_CONTACT;
        }

        return data;
	},


    populateContactFields: function(attrs) {
        var data = {};

        Ext.copyTo(data, attrs, ZCS.constant.CONTACT_ATTRS);

        Ext.each(ZCS.constant.CONTACT_MULTI_ATTRS, function(field) {
            var fieldValue = [],
                dataFieldName = field+'Fields';
            if (field in attrs) {
                fieldValue.push(attrs[field]);
                for(var index = 2; ;index++)
                {
                    if((field + index) in attrs)
                        fieldValue.push(attrs[field + index]);
                    else
                        break;
                }
                data[dataFieldName] = fieldValue;
            }
        });

        return data;
    },

    populateContactGroupFields: function(members) {
        var m = [];
        for (var i = 0, len = members.length; i < len; i++) {
            var member = members[i],
                memberData = {},
                cn = member.cn;
            if (cn) {
                //deferenced group members of type "C"(local) and "G"(Gal)
                var attrs = cn[0]._attrs;
                memberData = this.populateContactFields(attrs);
            } else {
                /**
                 * in case the group members are of type "I"(direct email addresses),
                 * store the same in the emailFields array.
                 */
                memberData['emailFields'] = member.value;
            }
            m.push(memberData);
        }
        return m;
    }

});
