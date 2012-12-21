Ext.define('ZCS.model.mail.ZtConv', {
	extend: 'ZCS.model.ZtItem',
	requires: [
		'ZCS.model.ZtSoapProxy',
		'ZCS.model.mail.ZtConvReader',
		'ZCS.model.mail.ZtConvWriter'
	],
	config: {
		fields: [
			{ name: 'subject',  type: 'string' },
			{ name: 'from',     type: 'string' },
			{ name: 'fragment', type: 'string' },
			{ name: 'isUnread', type: 'boolean' },
			{ name: 'numMsgs',  type: 'int' }
		],
		proxy: {
			type: 'soapproxy',
			api: {
				create  : '',
				read    : '/service/soap/SearchRequest',
				update  : '/service/soap/ConvActionRequest',
				destroy : '/service/soap/ConvActionRequest'
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
		}
	}
});
