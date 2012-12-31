Ext.define('ZCS.model.mail.ZtMsgWriter', {

	extend: 'ZCS.model.ZtWriter',

	alias: 'writer.msgwriter',

	writeRecords: function(request, data) {

		var cid = request.getOperation().getInitialConfig().convId,
			json = this.getSoapEnvelope(request, data),
			action = request.getAction();

		if (action === 'read') {

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
		}
		else if (action === 'create') {

			console.log('create msg record');
			var msg = request.getRecords()[0];

			json.Body.SendMsgRequest = {
				_jsns: "urn:zimbraMail",
				m: {
					e: [
						{
							t: 'f',
							a: msg.get('from')
						},
						{
							t: 't',
							a: msg.get('to')
						}
					],
					su: {
						_content: msg.get('subject')
					},
					mp: [
						{
							content: {
								_content: msg.get('content')
							},
							ct: 'text/plain'
						}
					]
				}
			};
		}

		request.setJsonData(json);
		return request;
	}
});
