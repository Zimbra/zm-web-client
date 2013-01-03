var urlBase = ZCS.common.ZtConstants.SERVICE_URL_BASE;

Ext.define('ZCS.model.mail.ZtConv', {
	extend: 'ZCS.model.ZtItem',
	requires: [
		'ZCS.model.ZtSoapProxy',
		'ZCS.model.mail.ZtConvReader',
		'ZCS.model.mail.ZtConvWriter'
	],
	config: {
		fields: [
			{ name: 'senders', type: 'string' },
			{ name: 'fragment', type: 'string' },
			{ name: 'isUnread', type: 'boolean' },
			{ name: 'numMsgs',  type: 'int' }
		],
//		associations: [
//			{
//				type: 'hasMany',
//				model: 'ZCS.model.mail.ZtMsg',
//				name: 'messages'
//			}
//		],
		proxy: {
			type: 'soapproxy',
			api: {
				create  : '',
				read    : urlBase + 'SearchRequest',
				update  : urlBase + 'ConvActionRequest',
				destroy : urlBase + 'ConvActionRequest'
			},
//			limit: 50,
/*
			reader: {
				type: 'json',
				rootProperty: 'Body.SearchResponse.c',
				idProperty: 'id',
				totalProperty: 'Body.SearchResponse.c.length'
			},
*/
			reader: 'convreader',
			writer: 'convwriter'
		},

		messages: []
	}
});
