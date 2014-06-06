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
		sessionId:              null,           // User session ID, created by server
		notifySeq:              0,              // Help server track which notifications we have gotten
		changeToken:            null,           // Used to prevent race conditions during item modification
		accountName:            '',
		accountId:              '',
		initialSearchResults:   null,
		organizerRoot:          null,           // Root for canonical tree of organizers (unsorted)
		activeApp:              '',
		version:                '[unknown]',
		lastSearchOrganizerByApp:    {}            // Last organizer (folder/saved search/tag) visited
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

	/**
	 * If session ID changed, mark the previous one as stale.
	 */
	applySessionId: function(session) {

		var curSessionId = this.getSessionId(),
			newSessionId = this.extractSessionId(session);

		if (curSessionId && curSessionId !== newSessionId) {
			this.staleSessions[curSessionId] = true;
		}

		return newSessionId;
	},

	isStaleSession: function(session) {
		var sessionId = this.extractSessionId(session);
		return sessionId && this.staleSessions[sessionId];
	},

	initSession: function(data) {

		this.setLastSearchOrganizerByApp({});

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

		this.loadSignature(gir.signatures);

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
	 * Loads folders, searches, and tags from data in a {refresh} block.
	 *
	 * @param {object}  refresh     JSON folder data
	 */
	loadFolders: function(refresh) {

		// parse organizer info from the {refresh} block
		var folderRoot = refresh.folder[0],
			tagRoot = refresh.tags;

		// move tags in with folders and searches
		if (tagRoot) {
			folderRoot[ZCS.constant.ORG_TAG] = tagRoot[ZCS.constant.ORG_TAG];
		}
		this.setOrganizerRoot(this.addOrganizer(folderRoot));
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
	 * Creates organizer data from the given node and adds it to the given list (of its
	 * parent's children).
	 * @private
	 */
	addOrganizer: function(node, list, type) {

		var organizer = ZCS.model.ZtOrganizer.getProxy().getReader().getDataFromNode(node, type);
		if (list) {
			list.push(organizer);
		}

		var	childNodeNames = !type ? [ ZCS.constant.ORG_FOLDER, ZCS.constant.ORG_SEARCH, ZCS.constant.ORG_TAG, ZCS.constant.ORG_MOUNTPOINT ] :
				(type === ZCS.constant.ORG_FOLDER) ? [ ZCS.constant.ORG_FOLDER, ZCS.constant.ORG_SEARCH, ZCS.constant.ORG_MOUNTPOINT ] : [ type ];

		Ext.each(childNodeNames, function(childType) {
			Ext.each(node[childType], function(child) {
				this.addOrganizer(child, organizer.items, childType);
			}, this);
		}, this);

		return organizer;
	},

	/**
	 * Returns the tree for the given app, in a form that is consumable by a TreeStore. Note
	 * that each organizer is copied, so we aren't returning references to the canonical organizer data
	 * within the session.
	 *
	 * @param {string}  app     app name
	 * @param {string}  type    organizer type
	 * @return {object}     tree (each node is a ZtOrganizer)
	 */
	getOrganizerData: function(app, type, context) {

		var root = this.addOrganizerData(this.getOrganizerRoot(), null, app, type, context);

		return root.items;
	},

	/**
	 * Filter the given organizer and add it to the list if it passes. Then handle its children.
	 * Currently we don't handle the situation where an organizer is missed because it has a
	 * parent that got filtered out.
	 * @private
	 */
	addOrganizerData: function(organizer, list, app, type, context) {

		// Create a copy of the organizer data, since we don't want the caller to mess with the canonical data.
		var org = {},
			isTrash = (organizer.zcsId === ZCS.constant.ID_TRASH);

		if (this.isValidOrganizer(organizer, app, type)) {
			Ext.apply(org, organizer);
			delete org.items;
			ZCS.model.ZtOrganizer.addOtherFields(org, app, context, !!(organizer.items && organizer.items.length > 0));
			if (isTrash) {
				org.folderType = ZCS.constant.APP_FOLDER[app];
			}
			if (list) {
				list.push(org);
			}

			if (organizer.items) {
				org.items = [];
				Ext.each(organizer.items, function(child) {
					this.addOrganizerData(child, org.items, app, type, context);
				}, this);
			}
		}

		return org;
	},

	/**
	 * Returns true if the given organizer (in the form of a data object) is valid for the given app
	 * and/or type. For example, an address book folder is valid for Contacts but not Mail.
	 *
	 * @param {Object}  organizer
	 * @param {String}  app
	 * @param {String}  type
	 * @return {Boolean}    true if the organizer is valid
	 */
	isValidOrganizer: function(organizer, app, type) {

		var isValid = !ZCS.constant.FOLDER_HIDE[organizer.zcsId],
			isRoot = (organizer.zcsId === ZCS.constant.ID_ROOT),
			isTrash = (organizer.zcsId === ZCS.constant.ID_TRASH),
			orgApp = ZCS.constant.FOLDER_APP[organizer.folderType];

		// check if we're constrained by organizer type
		if (isValid && !isRoot && type && organizer.type !== type) {
			isValid = false;
		}

		// if we're constrained by app, folders must be of the correct type
		if (isValid && !isRoot && app && !isTrash && organizer.type === ZCS.constant.ORG_FOLDER && orgApp !== app) {
			isValid = false;
		}

		// if this is a search, make sure it looks for items for the given app
		if (isValid && app && organizer.type === ZCS.constant.ORG_SEARCH && organizer.searchTypes) {
			isValid = false;
			// a saved search should only have a single type since we no longer support
			// mixed searches, but there might be legacy mixed-type searches out there
			Ext.each(organizer.searchTypes.split(','), function(type) {
				if (ZCS.constant.APP_FOR_TYPE[Ext.String.trim(type)] === app) {
					isValid = true;
					return false;
				}
			}, this);
		}

		return isValid;
	},

	handleOrganizerCreate: function(organizer, notification) {

		var org = ZCS.model.ZtOrganizer.getProxy().getReader().getDataFromNode(notification, notification.itemType);
		this.findOrganizer(this.getOrganizerRoot(), org.parentZcsId, false, org);
	},

	handleOrganizerDelete: function(organizer, notification) {

		this.findOrganizer(this.getOrganizerRoot(), notification.id, true);
		Ext.each(ZCS.cache.get(notification.id, null, true), function(org) {
			org.handleDeleteNotification();
		}, this);
	},

	handleOrganizerChange: function(organizer, notification) {

		var root = this.getOrganizerRoot(),
			org = this.findOrganizer(root, notification.id),
			proxy, prop;

		if (org) {
			proxy = ZCS.model.ZtOrganizer.getProxy().getReader().getDataFromNode(notification, notification.itemType);
			for (prop in proxy) {
				if (proxy[prop] != null && org[prop] !== proxy[prop]) {
					org[prop] = proxy[prop];
				}
			}
			if (notification.l) {
				org = this.findOrganizer(root, notification.id, true);
				this.findOrganizer(root, notification.l, false, org);
			}
		}
	},

	/**
	 * Returns a single organizer model based on the passed zcsId.  Since this class 
	 * holds organizers as Object literals, we need a bit more logic to get a model of
	 * a single organizer.
	 *
	 */
	getOrganizerModel: function (zcsId) {
		var organizerData = this.findOrganizerByAttribute("zcsId", zcsId);

		if (organizerData) {
			var organizerModel = Ext.create('ZCS.model.ZtOrganizer', organizerData);

			ZCS.model.ZtOrganizer.addOtherFields(organizerModel.data);

			return organizerModel;
		}

		return null;
	},

	/**
	 * Returns a single organizer based on the attribute and value passed.
	 *
	 * @param {String} attribute   The property of the organizer to find by.
	 * @param {String} value       The value for the property.
	 *
	 * @return {Object} A JavaScript object literal representing an organizer.
	 */
	findOrganizerByAttribute: function (attribute, value) {
		var root = this.getOrganizerRoot();

		return this.findOrganizerInRootByAttribute(
			root,
			attribute, 
			value
		);
	},

	/**
	 * Finds the organizer with the given ID in the canonical organizer tree, and possibly
	 * performs an action as a side effect.
	 *
	 * @param {Object}      org         root from which to start search
	 * @param {String}      id          ID of organizer being sought
	 * @param {Boolean}     doDelete    (optional) if true, remove the organizer
	 * @param {Object}      newChildOrg (optional) if true, add this child to the organizer's child list
	 *
	 * @private
	 * @return {Object}     the organizer that was found, or null
	 */
	findOrganizer: function(org, id, doDelete, newChildOrg) {
		return this.findOrganizerInRootByAttribute(
			org,
			"zcsId",
			id,
			doDelete, 
			newChildOrg
		);
	},

	/** 
	 * Finds the organizer with the given ID in the canonical organizer tree, and possibly
	 * performs an action as a side effect.
	 *
	 * @param {Object}      org         root from which to start search
	 * @param {String}      attr        The property of the organizer to find by.
	 * @param {String}      value       The value for the property.
	 * @param {Boolean}     doDelete    (optional) if true, remove the organizer
	 * @param {Object}      newChildOrg (optional) if true, add this child to the organizer's child list
	 *
	 *
	 * @private
	 */
	findOrganizerInRootByAttribute: function (org, attr, value, doDelete, newChildOrg) {
		if (!org) {
			return null;
		}

		var areStrings = org[attr] && value && Ext.isString(org[attr]) && Ext.isString(value);

		if (org[attr] === value ||
				(areStrings && org[attr].toLowerCase() === value.toLowerCase())) {
			if (newChildOrg) {
				org.items = org.items || [];
				org.items.push(newChildOrg);
				org.leaf = false;
				org.disclosure = true;
			}
			return org;
		}

		var list = org.items,
			ln = list ? list.length : 0,
			i, childOrg;

		for (i = 0; i < ln; i++) {
			childOrg = this.findOrganizerInRootByAttribute(org.items[i], attr, value, doDelete, newChildOrg);
			if (childOrg) {
				if (doDelete) {
					list.splice(i, 1);
				}
				return childOrg;
			}
		}

		return null;
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
			else if (setting.getType() === ZCS.constant.TYPE_LDAP_TIME) {
				var lastChar = (Ext.isString(value) &&
								value.charAt(value.length-1).toLowerCase());
				var num = parseInt(value);
				// convert to seconds
				if (lastChar == 'd') {
					value = num * 24 * 60 * 60;
				} else if (lastChar == 'h') {
					value = num * 60 * 60;
				} else if (lastChar == 'm') {
					value = num * 60;
				} else {
					value = num;	// default
				}
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

		var organizer = orgId ? ZCS.session.getOrganizerModel(orgId) : null;
		if (organizer) {
			this.setLastSearchOrganizer(app, organizer);
		}

		return organizer;
	},

	setLastSearchOrganizer: function (app, organizer) {
		var map = this.getLastSearchOrganizerByApp();

		app = app || this.getActiveApp();

		map[app] = organizer;
	},

	getLastSearchOrganizer: function (app) {
		var map = this.getLastSearchOrganizerByApp();
 
		app = app || this.getActiveApp();

		return map[app];
	},

	/**
	 * Loads CSS that we will inject into msg body iframes.
	 */
	loadCss: function() {
		Ext.Ajax.request({
			url: 'resources/css/msgbody.css',
			async: false,
			success: function(response) {
				ZCS.session.msgBodyCss = response.responseText
			}
		});
	},

	/**
	 * Find the most appropriate signature(s) to use for compose and reply/forward. If there is a
	 * signature named "Mobile", that's used for everything. Otherwise, we look for signatures for
	 * the primary account.
	 *
	 * @param {Object}  data
	 */
	loadSignature: function(data) {

		var signatures = data && data.signature,
			ln = signatures ? signatures.length : 0, i,
			defaultSig, replySig, mobileSig,
			defaultSigId = ZCS.session.getSetting(ZCS.constant.SETTING_SIGNATURE_ID),
			replySigId = ZCS.session.getSetting(ZCS.constant.SETTING_REPLY_SIGNATURE_ID);

		for (i = 0; i < ln; i++) {
			var sig = signatures[i],
				content = sig.content && sig.content[0],
				value = content && content._content,
				type = content && content.type;

			if (!value) {
				continue;
			}
			if (sig.name === 'Mobile') {
				mobileSig = value;
			}
			else {
				if (sig.id === defaultSigId) {
					defaultSig = value;
				}
				if (sig.id === replySigId) {
					replySig = value;
				}
			}
		}

		ZCS.session.setSetting(ZCS.constant.SETTING_SIGNATURE, mobileSig || defaultSig);
		ZCS.session.setSetting(ZCS.constant.SETTING_REPLY_SIGNATURE, mobileSig || replySig);
	}
});
