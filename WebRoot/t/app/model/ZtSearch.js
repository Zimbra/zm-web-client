Ext.define('ZCS.model.ZtSearch', {

	config: {
		query: null,
		folderId: null
	},

	constructor: function(config) {

		this.setQuery(config.query);

		var query = this.getQuery(),
			q = query && Ext.String.trim(query.toLowerCase()),
			m = q && q.match(/^in:["']?([a-z]+)["']?$/);

		if (m && m.length) {
			this.setFolderId(ZCS.constant.FOLDER_SYSTEM_ID[m[1]]);
		}
	}
});
