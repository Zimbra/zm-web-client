Ext.define('ZCS.store.mail.ZtMsgStore', {

	extend: 'ZCS.store.mail.ZtMailStore',

	config: {
		model: 'ZCS.model.mail.ZtMsg',

		listeners: {

			// add the msgs that were just loaded to their owning conv
			load: function(me, records, successful, operation, eOpts) {

				this.convertAddresses(records, false);

				var conv = ZCS.app.getController('ZCS.controller.mail.ZtConvController').getItem(),
					msg, i, convId,
					messages = [];

				for (i = 0; i < records.length; i++) {
					msg = records[i];
					convId = conv.get('id');
					if (msg.get('convId') === convId) {
						messages.push(msg);
					}
					else {
						console.log('conv ID ' + msg.get('convId') + ' in msg does not match current conv ID ' + convId);
					}
				}
				conv.setMessages(messages);
			}
		}
	}
});
