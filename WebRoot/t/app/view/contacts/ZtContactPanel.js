Ext.define('ZCS.view.contacts.ZtContactPanel', {

	extend: 'ZCS.view.ZtItemPanel',

	requires: [
		'ZCS.view.contacts.ZtContactView'
	],

	xtype: 'contactpanel',

	getItemView: function() {
		return {
			xtype: 'contactview'
		};
	}
});
