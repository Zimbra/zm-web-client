Ext.define('ZCS.store.mail.ZtConvStore', {
	extend: 'Ext.data.Store',
//		requires: "Ext.data.proxy.LocalStorage",
	config: {
		model: 'ZCS.model.mail.ZtConv',
		fields: ['from', 'subject'],
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
