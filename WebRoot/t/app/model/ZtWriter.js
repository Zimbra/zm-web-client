Ext.define('ZCS.model.ZtWriter', {

	extend: 'Ext.data.writer.Json',

	config: {
		writeAllFields: false
	},

	getSoapEnvelope: function(request, data, nameSpace) {

		var sessionId = ZCS.session.getSessionId();

		var envelope = {
			Header: {
				_jsns: nameSpace || 'urn:zimbra',
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
						seq: ZCS.session.getNotifySeq()
					},
					account: {
						_content: ZCS.session.getAccountName(),
						by: 'name'
					}
				}
			},
			Body: {}
		};

		return envelope;
	}
});
