Ext.define('ZCS.model.ZtItem', {
	extend: 'Ext.data.Model',
	requires: [
		'ZCS.model.ZtSoapProxy'
	],
	config: {
		idProperty: 'id',
		proxy: {
			type: 'soapproxy',
			actionMethods: {
				create  : 'POST',
				read    : 'POST',
				update  : 'POST',
				destroy : 'POST'
			},
			headers: {
				'Content-Type': "application/soap+xml; charset=utf-8"
			},
			pageParam: false,
			startParam: false,
			limitParam: false,
			noCache: false
		}
	}
});
