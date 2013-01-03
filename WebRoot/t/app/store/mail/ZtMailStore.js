Ext.define('ZCS.store.mail.ZtMailStore', {

	extend: 'Ext.data.Store',

	config: {
		remoteSort: true
	},

	/**
	 *
	 * @param items
	 * @param setSenders
	 */
	convertAddresses: function(items, setSenders) {

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
					if (setSenders && addr.getType() === ZCS.common.ZtConstants.FROM) {
						senders.push(addr.getDisplayName() || addr.getName() || addr.getEmail());
					}
				}
				if (setSenders && senders.length) {
					item.set('senders', senders.join(', '));
				}
			}
		}

	}
});
