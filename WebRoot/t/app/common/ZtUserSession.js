Ext.define('ZCS.common.ZtUserSession', {

	singleton: true,

	config: {
		sessionId: 0,
		accountName: null,
		notifySeq: 0,
		initialSearchResults: null,
		folderData: null,
		folderList: null
	},

	initSession: function(data) {

		// header
		this.setSessionId(data.header.context.session.id);
		var root = data.header.context.refresh.folder[0];
		var folders = [];
		this.addFolder(root, folders);
		this.setFolderData(folders);

		// response
		var gir = data.response.GetInfoResponse[0];
		this._settingsCache = Ext.apply(Ext.clone(gir.attrs._attrs), gir.prefs._attrs);
		this.setAccountName(gir.name);
		this.setInitialSearchResults(data.response.SearchResponse[0]);
	},

	getSetting: function(setting) {
		return this._settingsCache[setting];
	},

	getFolderById: function(id) {
		return this.getFolderList().getById(id);
	},

	addFolder: function(folderNode, folders) {

		var isRoot = (folderNode.id == ZCS.common.ZtConstants.ID_ROOT),
			isTrash = (folderNode.id == ZCS.common.ZtConstants.ID_TRASH),
			isChats = (folderNode.id == ZCS.common.ZtConstants.ID_CHATS);

		var hasChildren = !!(folderNode.folder && folderNode.folder.length > 0),
			folder;

		if (!isRoot && ((folderNode.view === 'message' && !isChats) || isTrash)) {
			folder = {
				id: folderNode.id,
				parentId: folderNode.l,
				name: folderNode.name,
				itemCount: folderNode.n,
				unreadCount: folderNode.u,
				disclosure: hasChildren
			};

			if (hasChildren) {
				folder.items = [];
			}
			else {
				folder.leaf = true;
			}
			console.log('adding folder ' + folder.name + ' to parent ' + folderNode.l);
			folders.push(folder);
		}

		if (hasChildren) {
			Ext.each(folderNode.folder, function(node) {
				this.addFolder(node, isRoot ? folders : folder.items);
			}, this);
		}
	}
});
