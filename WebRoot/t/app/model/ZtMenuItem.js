Ext.define('ZCS.model.ZtMenuItem', {
	extend: 'Ext.data.Model',
	config: {
		fields: [
			{ name: 'label', type: 'string' },
			{ name: 'action', type: 'string' },
			{ name: 'listener', type: 'auto' }
		]
	}
});
