Ext.define('ZCS.view.contacts.ZtContactPanel', {

	extend: 'ZCS.view.ZtItemPanel',

	requires: [
		'ZCS.view.contacts.ZtContactView'
	],

	xtype: ZCS.constant.APP_CONTACTS + 'itempanel',

	getItemView: function() {
		return {
			xtype: 'contactview'
		};
	}
});
