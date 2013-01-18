/**
 * This is a base class for writing a JSON SOAP request for a mail item.
 */
Ext.define('ZCS.model.mail.ZtMailWriter', {

	extend: 'ZCS.model.ZtWriter',

/*
	setFlags: function(data, node) {
		var flags = '';
		Ext.Object.each(ZCS.constant.FLAG_PROP, function(prop) {
			if (data[prop] === true) {
				flags += ZCS.constant.PROP_FLAG[prop];
			}
		});
		data.f = flags;
	}
*/

	/**
	 * Returns the JSON for a skeleton SOAP request body.
	 *
	 * @param {object}  parent      the SOAP Body
	 * @param {object}  item        record data that maps to the ZtMailItem
	 * @param {boolean} isMsg       true if the mail item is a ZtMsg
	 */
	setActionRequest: function(parent, item, isMsg) {
		var method = isMsg ? 'MsgActionRequest' : 'ConvActionRequest';
		parent[method] = {
			_jsns: 'urn:zimbraMail',
			action: {
				id: item.id,
				op: item.op
			}
		}
	}
});
