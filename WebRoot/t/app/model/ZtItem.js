Ext.define('ZCS.model.ZtItem', {
	extend: 'Ext.data.Model',
	config: {
		idProperty: 'id',
		fields: [
			{ name: 'rawAddresses', type: 'auto' },
			{ name: 'subject', type: 'string' }
		],
		proxy: {
			type: 'ajax',
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
		},
		addresses: null
	},

	addAddress: function(address) {

		var addrs = this.getAddresses();
		if (!addrs) {
			addrs = {};
			this.setAddresses(addrs);
		}

		var	addrType = address.getType(),
			addrsByType = addrs[addrType];

		if (!addrsByType) {
			addrsByType = addrs[addrType] = [];
		}
		addrsByType.push(address);
	},

	getAddressesByType: function(type) {
		type = type || ZCS.common.ZtConstants.FROM;
		var addrs = this.getAddresses();
		return (addrs && addrs[type]) || [];
	},

	getAddressByType: function(type) {
		return this.getAddressesByType(type)[0];
	}
});
