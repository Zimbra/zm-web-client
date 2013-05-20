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
			query = request.getParams().query,
			json, methodJson;

		// Do not pass query in query string.
		request.setParams({});

		if (action === 'read') {

			if (!query) {
				// if there's no query, this is the initial load so get all contacts
				json = this.getSoapEnvelope(request, data, 'GetContacts');
				methodJson = json.Body.GetContactsRequest;

				Ext.apply(methodJson, {
					sortBy: 'nameDesc',
					offset: offset,
					limit: ZCS.constant.DEFAULT_PAGE_SIZE
				});
			}
			else {
				// doing a search - replace the configured 'read' operation URL
				request.setUrl(ZCS.constant.SERVICE_URL_BASE + 'SearchRequest');

				json = this.getSoapEnvelope(request, data, 'Search');
				methodJson = json.Body.SearchRequest;

				Ext.apply(methodJson, {
					sortBy: "dateDesc",
					offset: 0,
					limit: 20,
					query: query,
					types: 'contact'
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
