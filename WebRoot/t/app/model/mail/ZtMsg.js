/**
 * This class represents a mail message.
 */
var urlBase = ZCS.constant.SERVICE_URL_BASE;

Ext.define('ZCS.model.mail.ZtMsg', {

	extend: 'ZCS.model.mail.ZtMailItem',

	requires: [
		'ZCS.model.mail.ZtMsgReader',
		'ZCS.model.mail.ZtMsgWriter'
	],

	config: {

		fields: [
			{ name: 'content', type: 'string' },
			{ name: 'from', type: 'string' },
			{ name: 'to', type: 'string' },
			{ name: 'convId', type: 'string', mapping: 'cid' }
		],

		proxy: {
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

	/**
	 * Returns the preferred reply address for this message.
	 *
	 * @return {ZtEmailAddress}     reply address
	 */
	getReplyAddress: function() {
		return this.getAddressByType(ZCS.constant.REPLY_TO) ||
			   this.getAddressByType(ZCS.constant.FROM);
	}
});
