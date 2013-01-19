/**
 * This class represents a Zimbra item such as a mail message, a conversation, or a contact.
 */
Ext.define('ZCS.model.ZtItem', {
	extend: 'Ext.data.Model',
	requires: [
		'ZCS.model.ZtSoapProxy'
	],
	config: {
		idProperty: 'id',
		proxy: {
			type: 'soapproxy',
			// our server always wants us to POST for API calls
			actionMethods: {
				create  : 'POST',
				read    : 'POST',
				update  : 'POST',
				destroy : 'POST'
			},
			headers: {
				'Content-Type': "application/soap+xml; charset=utf-8"
			},
			// prevent Sencha from adding junk to the URL
			pageParam: false,
			startParam: false,
			limitParam: false,
			noCache: false
		}
	}
});
