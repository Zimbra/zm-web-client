/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2012, 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
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

			var	query = request.getParams().query,
				search = Ext.create('ZCS.common.ZtSearch', { query:query }),
				folderId = ZCS.util.localId(search.getOrganizerId()),
				isOutbound = ZCS.util.isOutboundFolderId(folderId);

			Ext.apply(methodJson, {
				sortBy:             ZCS.constant.DATE_DESC,
				offset:             operation.getStart(),
				limit:              ZCS.constant.DEFAULT_PAGE_SIZE,
				query:              query,
				types:              'conversation',
				fullConversation:   1,  // as of 8.5 server
				fetch:              1,
				recip:              isOutbound ? 1 : 0
			});

		} else if (action === 'update') {

			// 'update' operation means we're performing a ConvActionRequest
			var itemData = Ext.merge(data[0] || {}, options),
				op = itemData.op;

			json = this.getActionRequest(request, itemData, 'ConvAction');
			if (op === 'move' || op === 'trash') {
				var changeToken = ZCS.session.getChangeToken();
				if (changeToken) {
					json.Header.context.change = {
						token: changeToken
					};
				}
			}
		}

		// Do not pass query in query string.
		request.setParams({});
		request.setJsonData(json);

		return request;
	}
});
