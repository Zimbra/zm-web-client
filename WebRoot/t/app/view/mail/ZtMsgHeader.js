Ext.define('ZCS.view.mail.ZtMsgHeader', {

	extend: 'Ext.Component',

	xtype: 'msgheader',

	config: {
		msg: null,
		padding: 5,
		tpl: Ext.create('Ext.XTemplate', ZCS.template.MSG_HEADER)
	},

	setContent: function(msg) {

		var data = msg.getData(),
			addressTypes = [
				ZCS.constant.FROM,
				ZCS.constant.TO,
				ZCS.constant.CC
			];

		Ext.each(addressTypes, function(type) {
			var addrs = msg.getAddressesByType(type);
			if (addrs.length > 0) {
				data[type.toLowerCase()] = Ext.String.htmlEncode(addrs.join('; '));
			}
		}, this);

		this.setHtml(this.getTpl().apply(data));
	}
});
