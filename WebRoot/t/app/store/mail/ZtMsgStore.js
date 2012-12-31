Ext.define('ZCS.store.mail.ZtMsgStore', {
	extend: 'Ext.data.Store',
	config: {
		model: 'ZCS.model.mail.ZtMsg',
		fields: ['content'],
/*
		data: [
			{from: 'Bill Lumbergh', subject: 'TPS Report Meeting Scrum'},
			{from: 'Michael Bolton', subject: 'Conv 2'},
			{from: 'Michael, Samir, me', subject: 'Conv 3'},
			{from: 'Joanna', subject: 'Conv 4'}
		],
*/
		remoteSort: true,

		listeners: {
			load: function(me, records, successful, operation, eOpts) {
				console.log('msg store load event');
				var conv = ZCS.app.getController('ZCS.controller.mail.ZtConvController').getConv(),
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
