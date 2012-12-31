Ext.define('ZCS.model.mail.ZtConvWriter', {

	extend: 'ZCS.model.ZtWriter',

	alias: 'writer.convwriter',

	writeRecords: function(request, data) {

		var json = this.getSoapEnvelope(request, data);

		json.Body.SearchRequest = {
			_jsns: "urn:zimbraMail",
			sortBy: "dateDesc",
			header: [
				{ n: "List-ID" },
				{ n: "X-Zimbra-DL" },
				{ n: "IN-REPLY-TO" }
			],
			tz: {
				id: "America/Los_Angeles"
			},
			locale: {
				"_content": "en_US"
			},
			offset: 0,
			limit: 20,
//			query: "in:inbox",
			query: request.getOperation().config.query,
			types: "conversation",
			fetch: 1,
			html: 1,
			needExp: 1
		};

		request.setJsonData(json);
		return request;
	}
});
