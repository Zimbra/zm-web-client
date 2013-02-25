/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra, Inc.
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

		if (action === 'read') {

			if (!query) {
				// if there's no query, this is the initial load so get all contacts
				json = this.getSoapEnvelope(request, data, 'GetContacts');
				methodJson = json.Body.GetContactsRequest;

				Ext.apply(methodJson, {
					sortBy: 'nameDesc',
					offset: offset,
					limit: ZCS.constant.DEFAULT_PAGE_SIZE,
					// ask server only for the fields we need
					a: [
						{ n: 'firstName' },
						{ n: 'lastName' },
						{ n: 'email' },
						{ n: 'company' },
						{ n: 'fileAs' }
					]
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
		}

		request.setJsonData(json);

		return request;
	}
});
