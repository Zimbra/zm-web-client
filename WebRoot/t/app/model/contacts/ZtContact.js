var urlBase = ZCS.common.ZtConstants.SERVICE_URL_BASE;

Ext.define('ZCS.model.contacts.ZtContact', {
	extend: 'ZCS.model.ZtItem',
	requires: [
		'ZCS.model.ZtSoapProxy',
		'ZCS.model.contacts.ZtContactReader',
		'ZCS.model.contacts.ZtContactWriter'
	],
	config: {
		fields: [
			{ name: 'firstName', type: 'string' },
			{ name: 'lastName', type: 'string' },
			{ name: 'email', type: 'string' },
			{ name: 'company', type: 'string' },
			{ name: 'fileAs', type: 'int' }
		],
		proxy: {
			type: 'soapproxy',
			api: {
				create  : '',
				read    : urlBase + 'GetContactsRequest',
				update  : urlBase + 'ContactActionRequest',
				destroy : urlBase + 'ContactActionRequest'
			},
			reader: 'contactreader',
			writer: 'contactwriter'
		},

		messages: []
	}
});
