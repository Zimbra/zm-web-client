Ext.define('ZCS.common.ZtUserSession', {

	singleton: true,

	requires: [
		'ZCS.common.ZtConstants'
	],

	config: {
		sessionId: 0,
		accountName: null,
		notifySeq: 0,
		initialSearchResults: null,
		folderData: null,
		folderList: null,
		activeApp: null
	},

	initSession: function(data) {

		// shortcut
		ZCS.session = ZCS.common.ZtUserSession;

		// header
		this.setSessionId(data.header.context.session.id);
		var root = data.header.context.refresh.folder[0],
			folderData = {};

		Ext.each(ZCS.constant.ALL_APPS, function(app) {
			var folders = folderData[app] = [],
				view = ZCS.constant.FOLDER_VIEW[app];
			this.addFolder(root, folders, view);
		}, this);
		this.setFolderData(folderData);

		// response
		var gir = data.response.GetInfoResponse[0];
		this._settingsCache = Ext.apply(Ext.clone(gir.attrs._attrs), gir.prefs._attrs);
		this.setAccountName(gir.name);
		this.setInitialSearchResults(data.response.SearchResponse[0]);

		this.setActiveApp(ZCS.constant.APP_MAIL);
	},

	getSetting: function(setting) {
		return this._settingsCache[setting];
	},

	getFolderDataByApp: function(app) {
		var folderData = this.getFolderData();
		return folderData ? this.getFolderData()[app] : null;
	},

	getFolderListByApp: function(app) {
		var folderList = this.getFolderList();
		return folderList ? this.getFolderList()[app] : null;
	},

	setFolderListByApp: function(list, app) {
		var folderList = this.getFolderList();
		if (!folderList) {
			folderList = {};
			this.setFolderList(folderList);
		}
		folderList[app] = list;
	},

	/**
	 *
	 * @param id
	 * @param app (optional)
	 * @return ZtFolder
	 */
	getFolderById: function(id, app) {
		if (app) {
			var folderList = this.getFolderListByApp(app);
			return folderList ? folderList.getById(id) : null;
		}
		else {
			var folder = null;
			Ext.each(ZCS.constant.ALL_APPS, function(app) {
				folder = this.getFolderById(id, app);
				if (folder) {
					return false;   // break out of loop
				}
			}, this);
			return folder;
		}
	},

	addFolder: function(folderNode, folders, view) {

		var id = folderNode.id,
			isRoot = (id == ZCS.constant.ID_ROOT),
			isTrash = (id == ZCS.constant.ID_TRASH),
			hideFolder = ZCS.constant.FOLDER_HIDE[id];

		var hasChildren = !!(folderNode.folder && folderNode.folder.length > 0),
			folder;

		if (!isRoot && ((folderNode.view === view && !hideFolder) || isTrash)) {
			folder = {
				id: id,
				parentId: folderNode.l,
				name: folderNode.name,
				itemCount: folderNode.n,
				disclosure: hasChildren
			};
			// app-specific fields
			if (folderNode.u != null) {
				folder.unreadCount = folderNode.u;
			}

			if (hasChildren) {
				folder.items = [];
			}
			else {
				folder.leaf = true;
			}
			console.log('adding folder ' + folder.name + ' to parent ' + folderNode.l);
			folders.push(folder);
		}

		if ((isRoot || folder) && hasChildren) {
			Ext.each(folderNode.folder, function(node) {
				this.addFolder(node, isRoot ? folders : folder.items, view);
			}, this);
		}
	},

	getActiveSearchField: function() {
		var app = this.getActiveApp(),
			panel = ZCS.constant.LIST_PANEL_XTYPE[app];

		return Ext.ComponentQuery.query(panel + ' searchfield')[0];
	}
});
