Ext.define('ZCS.model.ZtFolder', {

	extend: 'Ext.data.Model',

	config: {
		fields: [
			{ name: 'name', type: 'string' },
			{ name: 'id', type: 'string' },
			{ name: 'itemCount', type: 'int' },
			{ name: 'disclosure', type: 'boolean' }
		]
	},

	isSystem: function() {
		return (this.get('id') <= ZCS.constant.MAX_SYSTEM_ID);
	},

	getQueryPath: function() {

		var path = this.get('name'),
			parent = ZCS.session.getFolderById(this.get('parentId'));

		if (this.isSystem()) {
			path = path.toLowerCase();
		}

		while (parent && (parent.get('id') != ZCS.constant.ID_ROOT)) {
			path = parent.get('name') + '/' + path;
			parent = ZCS.session.getFolderById(parent.get('parentId'));
		}

		return path;
	}
});
