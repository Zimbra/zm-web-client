Ext.define('ZCS.model.mail.ZtMsg', {
	extend: 'ZCS.model.ZtItem',
	requires: [
		'ZCS.model.ZtSoapProxy',
		'ZCS.model.mail.ZtMsgReader',
		'ZCS.model.mail.ZtMsgWriter'
	],
	config: {
		fields: [
			'subject',
			'content',
			'from',
			'to',
			'convId'
		],
//		associations: [
//			{
//				type: 'belongsTo',
//				model: 'ZCS.model.mail.ZtConv'
//			}
//		],
		proxy: {
			type: 'soapproxy',
			api: {
				create  : '/service/soap/SendMsgRequest',
				read    : '/service/soap/SearchConvRequest',
				update  : '/service/soap/MsgActionRequest',
				destroy : '/service/soap/MsgActionRequest'
			},
			reader: 'msgreader',
			writer: 'msgwriter'
		}
	}
});
