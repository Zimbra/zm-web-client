Ext.define('ZCS.model.mail.ZtMsgWriter', {
	extend: 'ZCS.model.ZtWriter',
	alias: 'writer.msgwriter',
	writeRecords: function(request, data) {
		var cid = request.getOperation().getInitialConfig().convId;
		var json = this.getSoapEnvelope(request, data);
		var body = json.Body = {};
		json.Body.SearchConvRequest = {
			_jsns: "urn:zimbraMail",
			cid: cid,
			fetch: "u1",
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
			query: "underid:1 AND NOT underid:3 AND NOT underid:4",
			read: 1,
			html: 1,
			needExp: 1
		};

		request.setJsonData(json);
		return request;
	}
});
