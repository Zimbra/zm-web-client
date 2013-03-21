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

		var operation = request.getOperation(),
			options = operation.getInitialConfig(),
			action = request.getAction(),
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
				offset: operation.getStart(),
				limit: ZCS.constant.DEFAULT_PAGE_SIZE,
				query: request.getParams().query,
				types: 'conversation',
				fetch: 1
			});

			//Do not pass query in query string.
			request.setParams({});
		} else if (action === 'update') {

			// 'update' operation means we're performing a ConvActionRequest
			var itemData = Ext.merge(data[0] || {}, options);
			json = this.getActionRequest(request, itemData, 'ConvAction');
		}

		request.setJsonData(json);

		return request;
	}
});
