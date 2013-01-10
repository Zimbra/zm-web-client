/**
 * This class represents a mail item (conversation or message).
 */
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

	/**
	 * Add the given address to this mail item.
	 *
	 * @param {ZtEmailAddress}  address     email address
	 */
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

	/**
	 * Returns a list of email addresses of the given type (to, from, etc).
	 *
	 * @param {string}  type        ZCS.constant.TO, etc
	 * @return {array}      list of email addresses
	 */
	getAddressesByType: function(type) {
		type = type || ZCS.constant.FROM;
		var addrs = this.getAddresses();
		return (addrs && addrs[type]) || [];
	},

	/**
	 * Returns the first address of the given type.
	 *
	 * @param {string}  type        ZCS.constant.TO, etc
	 * @return {ZtEmailAddress}     email address
	 */
	getAddressByType: function(type) {
		return this.getAddressesByType(type)[0];
	}
});
