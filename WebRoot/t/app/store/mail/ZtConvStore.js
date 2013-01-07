Ext.define('ZCS.store.mail.ZtConvStore', {

	extend: 'ZCS.store.mail.ZtMailStore',

	config: {
		model: 'ZCS.model.mail.ZtConv',

		listeners: {

			// convert JSON address nodes into address objects
			load: function(me, records, successful, operation, eOpts) {
				this.convertAddresses(records, 2);
			}
		}
	}
});
