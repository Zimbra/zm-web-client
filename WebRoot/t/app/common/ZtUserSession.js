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

	alternateClassName: 'ZCS.session',

	requires: [
		'ZCS.common.ZtConstants',
		'ZCS.model.ZtSetting'
	],

	config: {
		sessionId: 0,
		accountName: '',
		accountId: '',
		initialSearchResults: null,
		debugLevel: '',
		organizerData: null,
		activeApp: ''
	},

	initSession: function(data) {

		this.setDebugLevel(data.debugLevel);

		// session ID
		this.setSessionId(data.header.context.session.id);

		// Notification sequence number (so the server knows what we've seen)
		this.notifySeq = 0;

		// Load organizers
		this.loadFolders(data.header.context.refresh);

		// grab the user's settings
		var gir = data.response.GetInfoResponse[0];
		this._settings = {};
		this.createSettings(Ext.apply(Ext.clone(gir.attrs._attrs), gir.prefs._attrs));
		this.setSetting(ZCS.constant.SETTING_REST_URL, gir.rest);

		// name of logged-in account
		this.setAccountName(gir.name);

		// ID of logged-in account
		Ext.each(gir.identities.identity, function(identity) {
			if (identity.name === 'DEFAULT') {
				this.setAccountId(identity.id);
			}
		}, this);

		// save the JSON results of the user's initial search (usually 'in:inbox')
		this.setInitialSearchResults(data.response.SearchResponse[0]);

		// we always start in Mail
		this.setActiveApp(ZCS.constant.APP_MAIL);
	},

	/**
	 * Loads folders (and saved searches and tags) from data in a {refresh} block.
	 *
	 * @param {object}  refresh     JSON folder data
	 */
	loadFolders: function(refresh) {

		// parse organizer info from the {refresh} block
		var folderRoot = refresh.folder[0],
			tagRoot = refresh.tags,
			organizerData = {};

		// each overview needs data with unique IDs, so even though tags are global, we
		// need to create a separate record for each tag per app
		Ext.each(ZCS.constant.APPS, function(app) {
			var organizers = organizerData[app] = [];
			this.addOrganizer(folderRoot, organizers, app, ZCS.constant.ORG_FOLDER, []);
			this.addOrganizer(folderRoot, organizers, app, ZCS.constant.ORG_SAVED_SEARCH, []);
			this.addOrganizer(tagRoot, organizers, app, ZCS.constant.ORG_TAG, []);
			organizers.sort(ZCS.util.compareOrganizers);
		}, this);
		this.setOrganizerData(organizerData);
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

	getNotifySeq: function() {
		return this.notifySeq;
	},

	setNotifySeq: function(seq, force) {
		if (force || (seq > this.notifySeq)) {
			this.notifySeq = seq;
		}
	},

	/**
	 * Returns the tree for the given app, in a form that is consumable by a TreeStore.
	 *
	 * @param {string}  app     app name
	 * @return {object}     tree (each node is a ZtOrganizer)
	 */
	getOrganizerDataByApp: function(app) {
		var organizerData = this.getOrganizerData();
		return organizerData ? organizerData[app] : null;
	},

	getOrganizerDataByAppAndOrgType: function (app, type) {
		var organizerData = this.getOrganizerDataByApp(app),
			typeData = Ext.Array.filter(organizerData, function (data) {
			    if (data.type === type) {
			    	return true;
			    } else {
			    	return false;
			    }
			});

		return typeData;
	},

	/**
	 * @private
	 */
	addOrganizer: function(node, organizers, app, type, parents) {

		if (!node) {
			return;
		}

		var itemId = node.id,
			isRoot = (!itemId || itemId === ZCS.constant.ID_ROOT),
			isTrash = (itemId === ZCS.constant.ID_TRASH),
			view = node.view || ZCS.constant.FOLDER_VIEW[ZCS.constant.APP_MAIL],    // if view missing, default to 'message'
			appView = ZCS.constant.FOLDER_VIEW[app],
			hideFolder = ZCS.constant.FOLDER_HIDE[itemId],
			childNodeName = ZCS.constant.ORG_NODE[type];

		var hasChildren = !!(node[childNodeName] && node[childNodeName].length > 0),
			validType = false,
			organizer;

		if (!isRoot && (type === ZCS.constant.ORG_SAVED_SEARCH) && node.types) {
			Ext.each(node.types.split(','), function(type) {
				if (ZCS.constant.APP_FOR_TYPE[Ext.String.trim(type)] === app) {
					validType = true;
					return false;
				}
			}, this);
		}
		else if (type === ZCS.constant.ORG_FOLDER) {
			validType = (view === appView);
		}
		else if (type === ZCS.constant.ORG_TAG) {
			validType = true;
		}

		// add the organizer if it has the right view/type; Trash is part of every folder list
		if (!isRoot && ((validType && !hideFolder) || isTrash)) {

			// Get exact folder type if we're dealing with a folder. Tag needs unique ID for each store
			// it appears in (tag is only organizer that can appear in multiple overviews).
			var type1 = (type === ZCS.constant.ORG_FOLDER) ? ZCS.constant.FOLDER_TYPE[app] : type,
				id = (type === ZCS.constant.ORG_TAG) ? [app, type, itemId].join('-') : itemId;

			organizer = {
				id: id,
				itemId: itemId,
				parentItemId: node.l,
				name: node.name,
				path: node.name,
				color: node.color,
				itemCount: node.n,
				disclosure: hasChildren,
				type: type1
			};
			organizer.typeName = ZCS.constant.ORG_NAME[type1];

			if (parents.length) {
				organizer.path = parents.join('/') + '/' + node.name;
			}

			// type-specific fields
			if (type === ZCS.constant.ORG_MAIL_FOLDER) {
				if (node.u != null) {
					organizer.unreadCount = node.u;
				}
			}
			else if (type === ZCS.constant.ORG_SAVED_SEARCH) {
				organizer.query = node.query;
			}

			if (hasChildren) {
				organizer.items = [];
			}
			else {
				organizer.leaf = true;
			}

			Ext.Logger.verbose('adding folder ' + organizer.path);
			organizers.push(organizer);
		}

		// process child organizers
		if ((isRoot || organizer) && hasChildren) {
			if (!isRoot) {
				parents.push(organizer.name);
			}
			Ext.each(node[childNodeName], function(node) {
				this.addOrganizer(node, isRoot ? organizers : organizer.items, app, type, parents);
			}, this);
			if (!isRoot) {
				parents.pop();
			}
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

		// fill in settings that control what's included when replying to or forwarding a message
		var value, list;
		Ext.each(['REPLY', 'FORWARD'], function(which) {
			value = this.getSetting(ZCS.constant['SETTING_' + which + '_INCLUDE']);
			if (value) {
				list = ZCS.constant.INC_MAP[value];
				this.setSetting(ZCS.constant['SETTING_' + which + '_INCLUDE_WHAT'], list[0]);
				this.setSetting(ZCS.constant['SETTING_' + which + '_USE_PREFIX'], list[1]);
				this.setSetting(ZCS.constant['SETTING_' + which + '_INCLUDE_HEADERS'], list[2]);
			}
		}, this);

		// Contacts app needs to be enabled by us and the user
		var contactsSetting = ZCS.constant.SETTING_CONTACTS_ENABLED;
		this.setSetting(contactsSetting, this.getSetting(contactsSetting) && ZCS.constant.IS_ENABLED[ZCS.constant.APP_CONTACTS]);
	},

	/**
	 * Returns the organizer corresponding to the current search, which must be a result
	 * of a tap in the overview, or a simple search using either 'in:' or 'tag:'.
	 *
	 * @return {ZtOrganizer}    organizer whose contents are being displayed
	 */
	getCurrentSearchOrganizer: function() {

		// see if user tapped on a saved search
		var orgId = ZCS.session.getSetting(ZCS.constant.SETTING_CUR_SEARCH_ID);

		// now see if current search was for folder or tag
		if (!orgId) {
			var search = ZCS.session.getSetting(ZCS.constant.SETTING_CUR_SEARCH),
				orgId = search && search.getOrganizerId();
		}

		return orgId ? ZCS.cache.get(orgId) : null;
	}
});
