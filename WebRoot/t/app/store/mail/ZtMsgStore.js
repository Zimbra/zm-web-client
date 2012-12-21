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
		remoteSort: true
	}
});
