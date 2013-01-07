Ext.define('ZCS.model.mail.ZtMailItem', {
	extend: 'ZCS.model.ZtItem',
	config: {
		fields: [
			{ name: 'rawAddresses', type: 'auto' },
			{ name: 'subject', type: 'string' },
			{ name: 'flags', type: 'string' },
			{ name: 'dateStr', type: 'string' }
		],
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
		type = type || ZCS.constant.FROM;
		var addrs = this.getAddresses();
		return (addrs && addrs[type]) || [];
	},

	getAddressByType: function(type) {
		return this.getAddressesByType(type)[0];
	}
});
