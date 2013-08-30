/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2012, 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
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
		sessionId:              null,       // User session ID, created by server
		notifySeq:              0,          // Help server track which notifications we have gotten
		changeToken:            null,       // Used to prevent race conditions during item modification
		accountName:            '',
		accountId:              '',
		initialSearchResults:   null,
		debugLevel:             '',
		organizerData:          null,
		activeApp:              '',
		version:                '[unknown]'
	},

	/**
	 * Finds and returns the session ID encoded in any of several formats.
	 *
	 * @param {mixed} session Any valid session object: string, number, object, or array.
	 *
	 * @return {Number|Null} session ID or null
	 */
	extractSessionId: function(session) {

		var id;
		if (Array.isArray(session)) {
			session = session[0].id;
		}
		else if (session && session.id) {
			session = session.id;
		}

		// We either have extracted the id or were given some primitive form.
		// Whatever we have at this point, attempt conversion and clean up response.
		id = parseInt(session);
		// Normalize response
		if (isNaN(id)) {
			id = null;
		}

		return id;
	},

	applySessionId: function(session) {
		var curSessionId = this.getSessionId();
		if (curSessionId) {
			this.staleSessions[curSessionId] = true;
		}
		return this.extractSessionId(session);
	},

	isStaleSession: function(session) {
		var sessionId = this.extractSessionId(session);
		return sessionId && this.staleSessions[sessionId];
	},

	initSession: function(data) {

		this.setDebugLevel(data.debugLevel);

		// session handling
		this.staleSessions = {};
		this.setSessionId(data.header.context.session);
		this.setNotifySeq(0);

		// Load organizers
		this.loadFolders(data.header.context.refresh);

		// Find default identity, use it for account ID and prefs
		var gir = data.response.GetInfoResponse[0],
			identityAttrs;

		this.setVersion(gir.version);

        Ext.each(gir.identities.identity, function(identity) {
			if (identity.name === 'DEFAULT') {
				this.setAccountId(identity.id);
				identityAttrs = identity._attrs;
			}
		}, this);

		// grab the user's settings
		this._settings = {};
		this.createSettings(Ext.Object.merge({}, gir.attrs._attrs, gir.prefs._attrs, identityAttrs));
		this.setSetting(ZCS.constant.SETTING_REST_URL, gir.rest);

		// name of logged-in account
		this.setAccountName(gir.name);

		// save the JSON results of the user's initial search (usually 'in:inbox')
		this.setInitialSearchResults(data.response.SearchResponse[0]);

        // Enable third party JS error tracking, if zimbraTouchJSErrorTrackingEnabled is set to TRUE
        // Uncomment the below code for Zimbra.Next
        /*
        var loggingEnabled = this.getSetting(ZCS.constant.SETTING_JSLOGGING_ENABLED);
        var loggerKey = this.getSetting(ZCS.constant.SETTING_JSLOGGING_KEY);
        if (loggingEnabled && loggerKey) {
            Raven.config(loggerKey).install();
        }
        */

		// we always start in Mail
		this.setActiveApp(ZCS.constant.APP_MAIL);

		this.loadCss();
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
			organizers.sort(ZCS.model.ZtOrganizer.compare);
		}, this);
		this.setOrganizerData(organizerData);
	},

	/**
	 * Returns the value of the setting with the given name.
	 *
	 * @param {string}  settingName     setting's name
	 * @param {String}  key             the setting's key (hash type settings only)
	 *
	 * @return {mixed}  the setting's value
	 */
	getSetting: function(settingName, key) {

		var setting = this._settings[settingName];
		if (setting) {
			var value = setting.getValue();
			return (key && value && setting.getType() === ZCS.constant.TYPE_HASH) ? value[key] : value;
		}
		return null;
	},

	/**
	 * Sets the value of the setting with the given name. The given value will not be
	 * converted based on the type (eg a value of "TRUE" is a string and not a boolean).
	 *
	 * @param {String}  settingName     setting's name
	 * @param {mixed}   value           the setting's new value
	 * @param {String}  key             the setting's key (hash type settings only)
	 */
	setSetting: function(settingName, value, key) {

		var setting = this._settings[settingName];
		if (setting) {
			if (key && setting.getType() === ZCS.constant.TYPE_HASH) {
				var hash = setting.getValue() || {};
				hash[key] = value;
				value = hash;
			}
			setting.setValue(value);
		}
	},

	applyNotifySeq: function(seq) {
		//<debug>
		Ext.Logger.info('set notify seq to ' + seq + ' (current is ' + this.getNotifySeq() + ')');
		//</debug>

		// Make sure it's highest we've seen, or 0 (got a refresh block, start over)
		return seq > this.getNotifySeq() || seq === 0 ? seq : undefined;
	},

	/**
	 * Returns the tree for the given app, in a form that is consumable by a TreeStore.
	 *
	 * @param {string}  app     app name
	 * @return {object}     tree (each node is a ZtOrganizer)
	 */
	getOrganizerDataByApp: function(app) {
		var organizerData = this.getOrganizerData();
		return organizerData ? Ext.clone(organizerData[app]) : null;
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
			// it appears in (tag is only organizer that can appear in multiple overviews). Trash also
			// appears in more than one overview.
			var type1 = (type === ZCS.constant.ORG_FOLDER) ? ZCS.constant.FOLDER_TYPE[app] : type,
				id = ZCS.model.ZtOrganizer.getOrganizerId(itemId, type, app);

			organizer = {
				id:             id,
//				itemId:         itemId,
				itemId:         id,
				parentItemId:   node.l,
				name:           node.name,
				displayName:    Ext.String.htmlEncode(node.name),
				path:           node.name,
				color:          node.color,
				rgb:            node.rgb,
				itemCount:      node.n,
				disclosure:     hasChildren,
				type:           type1,
				url:            node.url
			};
			organizer.typeName = ZCS.constant.ORG_NAME[type1];

			if (parents.length) {
				organizer.path = parents.join('/') + '/' + node.name;
			}

			// type-specific fields
			if (type1 === ZCS.constant.ORG_MAIL_FOLDER) {
				if (node.u != null) {
					organizer.unreadCount = node.u;
				}
			}
			else if (type === ZCS.constant.ORG_SAVED_SEARCH) {
				organizer.query = node.query;
			}

			if (hasChildren) {
				organizer.items = [];
				organizer.leaf = false;
			} else {
				organizer.leaf = true;
			}

            //<debug>
			Ext.Logger.verbose('adding folder ' + organizer.path);
            //</debug>
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
				value = Ext.isString(value) ? !!(value && value.toLowerCase() === 'true') : !!value;
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
	 * @param {String}  app     app (defaults to active app)
	 *
	 * @return {ZtOrganizer}    organizer whose contents are being displayed
	 */
	getCurrentSearchOrganizer: function(app) {

		app = app || this.getActiveApp();

		// see if user tapped on a saved search
		var orgId = ZCS.session.getSetting(ZCS.constant.SETTING_CUR_SEARCH_ID, app);

		// now see if current search was for folder or tag
		if (!orgId) {
			var search = ZCS.session.getSetting(ZCS.constant.SETTING_CUR_SEARCH, app),
				orgId = search && search.getOrganizerId();
		}

		return orgId ? ZCS.cache.get(orgId) : null;
	},

	/**
	 * Loads CSS that we will inject into msg body iframes.
	 */
	loadCss: function() {
		Ext.Ajax.request({
			url: '/t/resources/css/msgbody.css',
			async: false,
			success: function(response) {
				ZCS.session.msgBodyCss = response.responseText
			}
		});
	}
});
