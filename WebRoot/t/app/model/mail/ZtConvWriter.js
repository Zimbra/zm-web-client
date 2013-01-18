/**
 * This class generates the JSON for conversation-related SOAP requests.
 */
Ext.define('ZCS.model.mail.ZtConvWriter', {

	extend: 'ZCS.model.mail.ZtMailWriter',

	alias: 'writer.convwriter',

	writeRecords: function(request, data) {

		var json = this.getSoapEnvelope(),
			action = request.getAction();

		if (action === 'read') {
			// 'read' operation means we're doing a search
			json.Body.SearchRequest = {
				_jsns: 'urn:zimbraMail',
				sortBy: 'dateDesc',
				header: [
					{ n: 'List-ID' },
					{ n: 'X-Zimbra-DL' },
					{ n: 'IN-REPLY-TO' }
				],
				tz: {
					id: 'America/Los_Angeles'
				},
				locale: {
					'_content': 'en_US'
				},
				offset: 0,
				limit: 20,
				query: request.getOperation().config.query,
				types: 'conversation',
				fetch: 1,
				html: 1,
				needExp: 1
			};
		}
		else if (action === 'update') {
			// 'update' operation means we're performing a ConvActionRequest
			this.setActionRequest(json.Body, data[0], false);
		}

		request.setJsonData(json);
		return request;
	}
});
