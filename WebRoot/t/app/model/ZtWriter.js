/**
 * This is a base class for our request writers which creates the SOAP envelope and fills in
 * some header fields.
 */
Ext.define('ZCS.model.ZtWriter', {

	extend: 'Ext.data.writer.Json',

	config: {
		writeAllFields: false       // may as well try to be efficient; turn back on if signs of trouble
	},

	/**
	 * Returns a SOAP envelope with a Header and Body. The header will have a few fields filled in.
	 *
	 * @return {object}     SOAP envelope
	 */
	getSoapEnvelope: function(request, data, nameSpace) {

		var sessionId = ZCS.session.getSessionId();

		var envelope = {
			Header: {
				_jsns: 'urn:zimbra',
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
