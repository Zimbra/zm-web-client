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
 * @author Komal Kakani<kkakani@zimbra.com>
 */
Ext.define('ZCS.model.contacts.ZtContactListWriter', {

    extend: 'ZCS.model.ZtWriter',

    alias: 'writer.contactlistwriter',

    writeRecords: function(request, data) {

        var	action = request.getAction(),
            offset = request.getOperation().getStart(),
            operation = request.getOperation(),
            options = operation.getInitialConfig(),
            itemData =  Ext.merge(((data && data[0]) || {}), options),
            query = request.getParams().query,
            json, methodJson;

        // Do not pass query in query string.
        request.setParams({});

        if (action === 'read') {

            if (!query) {
                // if there's no query, this is the initial load so get all contacts
                query = "in:contacts";
            }

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
        } else if (action === 'update') {
            if (itemData.op == 'delete' || itemData.op == 'move') {
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
                //Replaces all the attrs and group members in the existing contact
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
            if (attr_value && attr_value.length > 0) {
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


