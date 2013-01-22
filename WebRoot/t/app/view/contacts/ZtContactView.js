Ext.define('ZCS.view.contacts.ZtContactView', {
	extend: 'Ext.Container',
	xtype: ZCS.constant.APP_CONTACTS + 'itemview',
	config: {
		tpl: Ext.create('Ext.XTemplate', ZCS.template.Contact)
	}
});
