var urlBase = ZCS.common.ZtConstants.SERVICE_URL_BASE;

Ext.define('ZCS.model.mail.ZtMsg', {
	extend: 'ZCS.model.ZtItem',
	requires: [
		'ZCS.model.ZtSoapProxy',
		'ZCS.model.mail.ZtMsgReader',
		'ZCS.model.mail.ZtMsgWriter'
	],
	config: {
		fields: [
			{ name: 'content', type: 'string' },
//			{ name: 'from', type: 'string' },
//			{ name: 'to', type: 'string' },
			{ name: 'convId', type: 'string', mapping: 'cid' }
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
				create  : urlBase + 'SendMsgRequest',
				read    : urlBase + 'SearchConvRequest',
				update  : urlBase + 'MsgActionRequest',
				destroy : urlBase + 'MsgActionRequest'
			},
			reader: 'msgreader',
			writer: 'msgwriter'
		}
	},

	getReplyAddress: function() {
		return this.getAddressByType(ZCS.common.ZtConstants.REPLY_TO) ||
			   this.getAddressByType(ZCS.common.ZtConstants.FROM);
	}
});
