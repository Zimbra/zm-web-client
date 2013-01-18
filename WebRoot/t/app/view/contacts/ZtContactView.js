Ext.define('ZCS.view.contacts.ZtContactView', {
	extend: 'Ext.Container',
	xtype: 'contactview',
	config: {
		tpl: Ext.create('Ext.XTemplate',
			'<tpl>',
			'<div>{firstName} {lastName}</div>',
			'</tpl>'
		)
	}
});
