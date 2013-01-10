Ext.define('ZCS.store.mail.ZtMailStore', {

	extend: 'Ext.data.Store',

	config: {
		remoteSort: true
	},

	/**
	 * Convert JSON objects into address objects. Done here so that we can add the
	 * addresses to the actual ZtMailItem (rather than pass it through data in the reader).
	 * Optionally builds a string of senders using display names.
	 *
	 * @param {array}   items       list of mail records
	 * @param {int}     numSenders  number of senders to summarize into a 'senders' property (optional)
	 */
	convertAddresses: function(items, numSenders) {

		for (var i = 0; i < items.length; i++) {
			var item = items[i],
				addrNodes = item.get('rawAddresses'),
				len = addrNodes.length,
				senders, j;

			if (len > 0) {
				senders = [];
				for (j = 0; j < len; j++) {
					var addr = ZCS.model.ZtEmailAddress.fromAddressNode(addrNodes[j]);
					item.addAddress(addr);
					if (numSenders && addr.getType() === ZCS.constant.FROM) {
						senders.push(addr.getDisplayName() || addr.getName() || addr.getEmail());
					}
				}
				if (numSenders && senders.length) {
					if (senders.length > numSenders) {
						senders = senders.slice(0, numSenders);
						senders.push('...');
					}
					item.set('senders', senders.join(', '));
				}
			}
		}

	}
});
