Ext.define('ZCS.model.ZtSearch', {

	config: {
		query: null,
		folderId: null,
		folderName: null
	},

	constructor: function(config) {

		this.initConfig(config);

		var query = this.getQuery(),
			q = query && Ext.String.trim(query),
			m = q && q.match(/^in:["']?([a-z\/]+)["']?$/);

		if (m && m.length) {
			var folderName = m[1],
				systemId = ZCS.constant.FOLDER_SYSTEM_ID[m[1].toLowerCase()],
				systemFolder = systemId && ZCS.session.getFolderById(systemId),
				systemName = systemFolder && systemFolder.get('name');

//			if (folderId) {
//				folderName =
//			}
			this.setFolderId(ZCS.constant.FOLDER_SYSTEM_ID[m[1].toLowerCase()] || m[1]);
		}
	}
});
