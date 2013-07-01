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

			cn.l = itemData.folderId || ZCS.constant.ID_CONTACTS;
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

				if (itemData.folderId) {
					methodJson.action.l = itemData.folderId;
				}
			}
			else if (itemData.op === 'modify') {
				var	contact = request.getRecords()[0],
					cn;

				json = this.getSoapEnvelope(request, data, 'ModifyContact');
				methodJson = json.Body.ModifyContactRequest;

				cn = methodJson.cn = { id: itemData.id };
				cn.m = [];
				cn.a = this.populateAttrs(itemData.newContact, itemData.attrs);

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

	/**
	 * Converts contact fields to the JSON attributes our server expects.
	 *
	 * @param {ZtContact}   contact     a contact
	 *
	 * @return {Array}  array of JSON attr objects
	 */
    populateAttrs : function(contact, attrs) {

		var contactAttrs = contact.fieldsToAttrs(),
			attrsToReturn = attrs && ZCS.util.arrayAsLookupHash(attrs),
			jsonAttrs = [];

		Ext.Object.each(contactAttrs, function(attr) {
			if (!attrsToReturn || attrsToReturn[attr]) {
				jsonAttrs.push({
					n:          attr,
					_content:   contactAttrs[attr]
				});
			}
		}, this);

		return jsonAttrs;
    }
});
