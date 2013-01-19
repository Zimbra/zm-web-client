Ext.define('ZCS.store.contacts.ZtContactStore', {

	extend: 'Ext.data.Store',

	config: {
		model: 'ZCS.model.contacts.ZtContact',
		remoteSort: true
	}
});
