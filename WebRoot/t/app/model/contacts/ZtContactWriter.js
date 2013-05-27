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
 * This class generates the JSON for contact-related SOAP requests.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.contacts.ZtContactWriter', {

	extend: 'ZCS.model.ZtWriter',

	alias: 'writer.contactwriter',

	writeRecords: function(request, data) {

		var	action = request.getAction(),
			offset = request.getOperation().getStart(),
            operation = request.getOperation(),
            options = operation.getInitialConfig(),
            itemData = Ext.merge(((data && data[0]) || {}), options),
            contactId = itemData ? itemData.contactId : '',
            type = itemData ? itemData.type : '',
			json, methodJson;

		// Do not pass query in query string.
		request.setParams({});

		if (action === 'read') {
            json = this.getSoapEnvelope(request, data, 'GetContacts');
            methodJson = json.Body.GetContactsRequest;
            //Fetch the specific contact/group
            if (contactId) {
                var cn = methodJson.cn = {};
                cn.id = contactId;
            }
            if (type == ZCS.constant.ITEM_CONTACT_GROUP) {
                //In case of contact groups, deference the group members
                Ext.apply(methodJson, {
                    cn: cn,
                    derefGroupMember:1
                });
            } else {
                Ext.apply(methodJson, {
                    cn: cn
                });
            }
		} else if (action === 'create') {
            var	contact = request.getRecords()[0];

            json = this.getSoapEnvelope(request, data, 'CreateContact');
            methodJson = json.Body.CreateContactRequest;

            var cn = methodJson.cn = {};

            cn.l = "7";
            cn.m = [];
            cn.a = this.populateAttrs(contact);

            Ext.apply(methodJson, {
                cn: cn
            });
        }

		request.setJsonData(json);

		return request;
	},

    populateAttrs : function(contact) {

        var attrs=[];

        Ext.each(ZCS.constant.CONTACT_ATTRS, function(field) {
            var attr_value = contact.get(field);
            if (attr_value) {
                var node = {};
                node.n = field;
                node._content = attr_value;
                attrs.push(node);
            }
        });

        Ext.each(ZCS.constant.CONTACT_MULTI_ATTRS, function(field) {
            var dataFieldName = field+'Fields',
                attr_value = contact.get(dataFieldName);
            if (attr_value.length > 0) {
                attrs.push({n:field, _content:attr_value[0]});
                for (var i= 1,len=attr_value.length; i<len; i++) {
                    var node={};
                    node.n = field + (i+1);
                    node._content = attr_value[i];
                    attrs.push(node);
                }
            }
        });

        return attrs;
    }
});
