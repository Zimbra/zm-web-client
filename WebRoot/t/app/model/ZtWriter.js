Ext.define('ZCS.model.ZtWriter', {

	extend: 'Ext.data.writer.Json',

	getSoapEnvelope: function(request, data, nameSpace) {

		var sessionId = ZCS.common.ZtUserSession.getSessionId();

		var envelope = {
			Header: {
				_jsns: nameSpace || "urn:zimbra",
				context: {
					userAgent: {
						name: Ext.browser.userAgent,
						version: Ext.browser.version.version
					},
					session: {
						_content: sessionId,
						id: sessionId
					},
					notify: {
						seq: ZCS.common.ZtUserSession.getNotifySeq()
					},
					account: {
						_content: ZCS.common.ZtUserSession.getAccountName(),
						by: "name"
					}
				}
			},
			Body: {}
		};

		return envelope;
	}
});
