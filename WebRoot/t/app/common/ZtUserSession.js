/**
 * This class stores a bunch of user-related data such as settings. It also processes the inlined
 * responses we get from the launch JSP into data that can then be used by display components.
 */
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

		// shortcut - setting this after Ext.define doesn't work for some reason
		ZCS.session = ZCS.common.ZtUserSession;

		// session ID
		this.setSessionId(data.header.context.session.id);

		// parse folder info from the {refresh} block
		var root = data.header.context.refresh.folder[0],
			folderData = {};

		Ext.each(ZCS.constant.ALL_APPS, function(app) {
			var folders = folderData[app] = [],
				view = ZCS.constant.FOLDER_VIEW[app];
			this.addFolder(root, folders, view);
		}, this);
		this.setFolderData(folderData);

		// grab the user's settings
		var gir = data.response.GetInfoResponse[0];
		this._settingsCache = Ext.apply(Ext.clone(gir.attrs._attrs), gir.prefs._attrs);

		// name of logged-in account
		this.setAccountName(gir.name);

		// save the JSON results of the user's initial search (usually 'in:inbox')
		this.setInitialSearchResults(data.response.SearchResponse[0]);

		// we always start in Mail
		this.setActiveApp(ZCS.constant.APP_MAIL);
	},

	/**
	 * Returns the value of the setting with the given name.
	 *
	 * @param {string}  setting     setting's name (LDAP attr name)
	 * @return {mixed}  the setting's value
	 */
	getSetting: function(setting) {
		return this._settingsCache[setting];
	},

	/**
	 * Sets the value of the setting with the given name.
	 *
	 * @param {string}  setting     setting's name (LDAP attr name)
	 * @param {mixed}  the setting's new value
	 */
	setSetting: function(setting, value) {
		this._settingsCache[setting] = value;
	},

	/**
	 * Returns the folder tree for the given app, in a form that is consumable by a TreeStore.
	 *
	 * @param {string}  app     app name
	 * @return {object}     folder tree (each node is a ZtFolder)
	 */
	getFolderDataByApp: function(app) {
		var folderData = this.getFolderData();
		return folderData ? folderData[app] : null;
	},

	/**
	 * Returns the folder list component (a nested list) for the given app.
	 *
	 * @param {string}  app     app name
	 * @return {Ext.dataview.NestedList}    folder list component
	 */
	getFolderListByApp: function(app) {
		var folderList = this.getFolderList();
		return folderList ? folderList[app] : null;
	},

	/**
	 * Sets the folder list component for the given app.
	 *
	 * @param {Ext.dataview.NestedList} list    folder list component
	 * @param {string}  app     app name
	 */
	setFolderListByApp: function(list, app) {
		var folderList = this.getFolderList();
		if (!folderList) {
			folderList = {};
			this.setFolderList(folderList);
		}
		folderList[app] = list;
	},

	/**
	 * Returns the folder with the given ID, within the given app if provided.
	 *
	 * @param {string}  id  folder ID
	 * @param {string}  app     (optional) app name
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

	/**
	 * @private
	 */
	addFolder: function(folderNode, folders, view) {

		var id = folderNode.id,
			isRoot = (id == ZCS.constant.ID_ROOT),
			isTrash = (id == ZCS.constant.ID_TRASH),
			hideFolder = ZCS.constant.FOLDER_HIDE[id];

		var hasChildren = !!(folderNode.folder && folderNode.folder.length > 0),
			folder;

		// add the folder if it has the right view; Trash is part of every folder tree
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

		// process child folders
		if ((isRoot || folder) && hasChildren) {
			Ext.each(folderNode.folder, function(node) {
				this.addFolder(node, isRoot ? folders : folder.items, view);
			}, this);
		}
	},

	/**
	 * Returns the currently active (visible) search field. (Each app has its own.)
	 *
	 * @return {Ext.field.Search}   search field
	 */
	getActiveSearchField: function() {
		var app = this.getActiveApp(),
			panel = ZCS.constant.LIST_PANEL_XTYPE[app];

		return Ext.ComponentQuery.query(panel + ' searchfield')[0];
	}
});
