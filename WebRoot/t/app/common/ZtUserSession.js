/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra, Inc.
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * This class stores a bunch of user-related data such as settings. It also processes the inlined
 * responses we get from the launch JSP into data that can then be used by display components.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.common.ZtUserSession', {

	singleton: true,

	requires: [
		'ZCS.common.ZtConstants',
		'ZCS.model.ZtSetting'
	],

	config: {
		sessionId: 0,
		accountName: null,
		notifySeq: 0,
		initialSearchResults: null,
		folderData: null,
		folderList: null,   // organizer list
		activeApp: null
	},

	initSession: function(data) {

		// shortcut - setting this after Ext.define doesn't work for some reason
		ZCS.session = ZCS.common.ZtUserSession;

		// session ID
		this.setSessionId(data.header.context.session.id);

		// parse folder info from the {refresh} block
		var folderRoot = data.header.context.refresh.folder[0],
			tagRoot = data.header.context.refresh.tags,
			folderData = {};

		// each overview needs data with unique IDs, so even though tags are global, we
		// need to create a separate record for each tag per app
		Ext.each(ZCS.constant.ALL_APPS, function(app) {
			var folders = folderData[app] = [];
			this.addFolder(folderRoot, folders, app, ZCS.constant.ORG_FOLDER);
			this.addFolder(folderRoot, folders, app, ZCS.constant.ORG_SAVED_SEARCH);
			this.addFolder(tagRoot, folders, app, ZCS.constant.ORG_TAG);
		}, this);
		this.setFolderData(folderData);

		// grab the user's settings
		var gir = data.response.GetInfoResponse[0];
		this._settings = {};
		this.createSettings(Ext.apply(Ext.clone(gir.attrs._attrs), gir.prefs._attrs));

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
	 * @param {string}  settingName     setting's name (LDAP attr name)
	 * @return {mixed}  the setting's value
	 */
	getSetting: function(settingName) {
		var setting = this._settings[settingName];
		return setting ? setting.getValue() : null
	},

	/**
	 * Sets the value of the setting with the given name. The given value will not be
	 * converted based on the type (eg a value of "TRUE" is a string and not a boolean).
	 *
	 * @param {string}  settingName     setting's name (LDAP attr name)
	 * @param {mixed}  the setting's new value
	 */
	setSetting: function(settingName, value) {
		var setting = this._settings[settingName];
		if (setting) {
			setting.setValue(value);
		}
	},

	/**
	 * Returns the folder tree for the given app, in a form that is consumable by a TreeStore.
	 *
	 * @param {string}  app     app name
	 * @return {object}     folder tree (each node is a ZtOrganizer)
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
			if (folderList) {
				return folderList.getById(id);
			}
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
	addFolder: function(folderNode, folders, app, orgType) {

		var itemId = folderNode.id,
			isRoot = (!itemId || itemId == ZCS.constant.ID_ROOT),   // use == since IDs come as strings
			isTrash = (itemId == ZCS.constant.ID_TRASH),
			view = ZCS.constant.FOLDER_VIEW[app],
			hideFolder = ZCS.constant.FOLDER_HIDE[itemId],
			childNodeName = ZCS.constant.ORG_NODE[orgType];

		var hasChildren = !!(folderNode[childNodeName] && folderNode[childNodeName].length > 0),
			validType = false,
			folder;

		if (!isRoot && (orgType === ZCS.constant.ORG_SAVED_SEARCH) && folderNode.types) {
			Ext.each(folderNode.types.split(','), function(type) {
				if (ZCS.constant.APP_FOR_TYPE[Ext.String.trim(type)] === app) {
					validType = true;
					return false;
				}
			}, this);
		}
		else if (orgType === ZCS.constant.ORG_FOLDER) {
			validType = (folderNode.view === view);
		}
		else if (orgType === ZCS.constant.ORG_TAG) {
			validType = true;
		}

		// add the folder if it has the right view/type; Trash is part of every folder tree
		if (!isRoot && ((validType && !hideFolder) || isTrash)) {

			// Get exact folder type if we're dealing with a folder
			var type = (orgType === ZCS.constant.ORG_FOLDER) ? ZCS.constant.FOLDER_TYPE[app] : orgType;

			folder = {
				id: [app, type, itemId].join('-'),
				itemId: itemId,
				name: folderNode.name,
				itemCount: folderNode.n,
				disclosure: hasChildren,
				type: type
			};
			folder.typeName = ZCS.constant.ORG_NAME[type];

			// type-specific fields
			if (type === ZCS.constant.ORG_MAIL_FOLDER) {
				if (folderNode.u != null) {
					folder.unreadCount = folderNode.u;
				}
			}
			else if (type === ZCS.constant.ORG_SAVED_SEARCH) {
				folder.query = folderNode.query;
			}

			if (hasChildren) {
				folder.items = [];
			}
			else {
				folder.leaf = true;
			}
			Ext.Logger.verbose('adding folder ' + folder.name + ' to parent ' + folderNode.l);
			folders.push(folder);
		}

		// process child folders
		if ((isRoot || folder) && hasChildren) {
			Ext.each(folderNode[childNodeName], function(node) {
				this.addFolder(node, isRoot ? folders : folder.items, app, orgType);
			}, this);
		}
	},

	/**
	 * Returns the currently active (visible) search field. (Each app has its own.)
	 *
	 * @return {Ext.field.Search}   search field
	 */
	getCurrentSearchField: function() {
		return Ext.ComponentQuery.query('#' + this.getActiveApp() + 'listpanel searchfield')[0];
	},

	getCurrentOverview: function() {
		return Ext.ComponentQuery.query('#' + this.getActiveApp() + 'overview')[0];
	},

	/**
	 * @private
	 */
	createSettings: function(settings) {

		// process just those settings we use
		Ext.each(ZCS.constant.SETTINGS, function(key) {

			var setting = Ext.create('ZCS.model.ZtSetting', {
				name: key,
				type: ZCS.constant.SETTING_TYPE[key] || ZCS.constant.TYPE_STRING
			});

			var value = ZCS.constant.SETTING_VALUE[key] || settings[key] || ZCS.constant.SETTING_DEFAULT[key];
			if (setting.getType() === ZCS.constant.TYPE_NUMBER) {
				var newValue = parseInt(value);
				if (!isNaN(newValue)) {
					value = newValue;
				}
			}
			else if (setting.getType() === ZCS.constant.TYPE_BOOLEAN) {
				value = !!(value.toLowerCase() === 'true');
			}

			setting.setValue(value);
			this._settings[setting.getName()] = setting;
		}, this);
	}
});
