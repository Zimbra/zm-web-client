/**
 * This class represents a conversation, which is made up of one or more messages.
 */
var urlBase = ZCS.constant.SERVICE_URL_BASE;

Ext.define('ZCS.model.mail.ZtConv', {

	extend: 'ZCS.model.mail.ZtMailItem',

	requires: [
		'ZCS.model.mail.ZtConvReader',
		'ZCS.model.mail.ZtConvWriter'
	],

	config: {

		fields: [
			{ name: 'senders', type: 'string' },
			{ name: 'fragment', type: 'string' },
			{ name: 'isUnread', type: 'boolean' },
			{ name: 'numMsgs',  type: 'int' },
			{ name: 'op', type: 'string' }
		],

		proxy: {
			api: {
				create  : '',
				read    : urlBase + 'SearchRequest',
				update  : urlBase + 'ConvActionRequest',
				destroy : urlBase + 'ConvActionRequest'
			},
			reader: 'convreader',
			writer: 'convwriter'
		},

		messages: []
	}
});
