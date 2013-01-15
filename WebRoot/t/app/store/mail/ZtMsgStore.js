Ext.define('ZCS.store.mail.ZtMsgStore', {

	extend: 'ZCS.store.mail.ZtMailStore',

	config: {
		model: 'ZCS.model.mail.ZtMsg',

		listeners: {

			// process addresses then add the msgs that were just loaded to their owning conv
			refresh: function(me, records, eOpts) {

				// records is a Collection, which is a private Sencha class - break privacy to get the array
				this.convertAddresses(records.all, false);

				var conv = ZCS.app.getController('ZCS.controller.mail.ZtConvController').getItem(),
					msg, i, convId,
					messages = [];

				records.each(function(msg) {
					convId = conv.get('id');
					if (msg.get('convId') === convId) {
						messages.push(msg);
					}
					else {
						console.log('conv ID ' + msg.get('convId') + ' in msg does not match current conv ID ' + convId);
					}
				}, this);

				conv.setMessages(messages);
			}
		}
	}
});
