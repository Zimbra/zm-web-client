Ext.define('ZCS.model.mail.ZtMsg', {
	extend: 'ZCS.model.ZtItem',
	requires: [
		'ZCS.model.mail.ZtMsgReader',
		'ZCS.model.mail.ZtMsgWriter'
	],
	config: {
		fields: [
			{ name: 'content',  type: 'string' }
		],
		proxy: {
			type: 'ajax',
			api: {
				create  : '',
				read    : '/service/soap/SearchConvRequest',
				update  : '/service/soap/MsgActionRequest',
				destroy : '/service/soap/MsgActionRequest'
			},
/*
			reader: {
				type: 'json',
				rootProperty: 'Body.SearchResponse.c',
				idProperty: 'id',
				totalProperty: 'Body.SearchResponse.c.length'
			},
*/
			reader: 'msgreader',
			writer: 'msgwriter'
		}
	}
});
