/**
 * This class represents a folder that contains mail messages.
 */
Ext.define('ZCS.model.mail.ZtMailFolder', {

	extend: 'ZCS.model.ZtFolder',

	config: {
		fields: [
			{ name: 'unreadCount', type: 'int' }
		]
	}
});
