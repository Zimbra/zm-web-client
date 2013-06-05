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

		var operation = request.getOperation(),
			options = operation.getInitialConfig(),
			action = request.getAction(),
			itemData = data && data.length ? Ext.merge(data[0], options) : options,
			contactId = itemData.contactId,
			json, methodJson;

		if (action === 'read') {

			if (contactId) {
				json = this.getSoapEnvelope(request, data, 'GetContacts');
				methodJson = json.Body.GetContactsRequest;
				methodJson.cn = {
					id: contactId
				};
				methodJson.derefGroupMember = itemData.isGroup ? 1 : 0;
			}
			else {
				var query = request.getParams().query || 'in:contacts';
				request.setUrl(ZCS.constant.SERVICE_URL_BASE + 'SearchRequest');    // replace configured 'read' URL
				json = this.getSoapEnvelope(request, data, 'Search');
				methodJson = json.Body.SearchRequest;

				Ext.apply(methodJson, {
					sortBy: 'nameAsc',
					offset: operation.getStart(),
					limit:  ZCS.constant.DEFAULT_PAGE_SIZE,
					query:  query,
					types:  'contact'
				});
			}

		}
		else if (action === 'create') {

            var	contact = request.getRecords()[0];

            json = this.getSoapEnvelope(request, data, 'CreateContact');
            methodJson = json.Body.CreateContactRequest;

            var cn = methodJson.cn = {};

            cn.l = '7';     // always create in Contacts folder for now
            cn.m = [];
            cn.a = this.populateAttrs(contact);

            Ext.apply(methodJson, {
                cn: cn
            });
		}
		else if (action === 'update') {

			if (itemData.op === 'delete' || itemData.op === 'move') {
				json = this.getSoapEnvelope(request, itemData, 'ContactAction');
				methodJson = json.Body.ContactActionRequest;

				Ext.apply(methodJson, {
					action: {
						id: itemData.id,
						op: itemData.op
					}
				});

				if (itemData.l) {
					methodJson.action.l = itemData.l;
				}
			}
			else if (itemData.op === 'modify') {
				var	contact = request.getRecords()[0],
					cn;

				json = this.getSoapEnvelope(request, data, 'ModifyContact');
				methodJson = json.Body.ModifyContactRequest;
				// Replaces all the attrs and group members in the existing contact
				// TODO: Probably shouldn't be doing full replace; just update changed attrs
				methodJson.replace = 1;

				cn = methodJson.cn = {id: itemData.id};

				cn.l = contact.data.folderId;
				cn.m = [];
				cn.a = this.populateAttrs(itemData.newContact);

				Ext.apply(methodJson, {
					cn: cn
				});
			}
		}

		// Do not pass query in query string.
		request.setParams({});
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
