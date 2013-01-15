/**
 * Generates the proper JSON for a message-related request.
 */
Ext.define('ZCS.model.mail.ZtMsgWriter', {

	extend: 'ZCS.model.mail.ZtMailWriter',

	alias: 'writer.msgwriter',

	writeRecords: function(request, data) {

		var cid = request.getOperation().getInitialConfig().convId,
			json = this.getSoapEnvelope(request, data),
			action = request.getAction();

		if (action === 'read') {

			// 'read' operation means we are expanding a conv
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
				limit: 100,
				query: "underid:1 AND NOT underid:3 AND NOT underid:4",
				read: 1,
				html: 1,
				needExp: 1
			};
		}
		else if (action === 'create') {

			// 'create' operation means we are sending a msg
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
		else if (action === 'update') {
			// 'update' operation means we are performing a MsgActionRequest
			this.setActionRequest(json.Body, data[0], true);
		}

		request.setJsonData(json);
		return request;
	}
});
