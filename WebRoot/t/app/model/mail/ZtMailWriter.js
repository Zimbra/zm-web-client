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
