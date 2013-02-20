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
 * This class generates the JSON for conversation-related SOAP requests.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.mail.ZtConvWriter', {

	extend: 'ZCS.model.mail.ZtMailWriter',

	alias: 'writer.convwriter',

	writeRecords: function(request, data) {

		var	action = request.getAction(),
			offset = request.getOperation().getStart(),
			query = request.getOperation().config.query,
			json, methodJson;

		if (action === 'read') {

			// 'read' operation means we're doing a search
			json = this.getSoapEnvelope(request, data, 'Search', {
				addHeaders: true,
				isSearch: true
			});
			methodJson = json.Body.SearchRequest;

			Ext.apply(methodJson, {
				sortBy: 'dateDesc',
				offset: offset,
				limit: ZCS.constant.DEFAULT_PAGE_SIZE,
				query: query,
				types: 'conversation',
				fetch: 1
			});
		}
		else if (action === 'update') {

			// 'update' operation means we're performing a ConvActionRequest
			json = this.getActionRequest(request, data, 'ConvAction');
		}

		request.setJsonData(json);

		return request;
	}
});
