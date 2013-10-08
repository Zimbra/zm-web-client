/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
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
 * An overview ties a TreeStore to a NestedList to represent a set of organizers (folders,
 * searches, tags).
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.view.ZtOverview', {

	extend: 'Ext.Container',

	requires: [
		'Ext.dataview.NestedList',
		'ZCS.view.ZtOrganizerList',
		'ZCS.model.ZtOrganizer',
		'ZCS.store.ZtOrganizerStore'
	],

	xtype: 'overview',

	config: {
		layout: 'fit',
		//ui: 'dark',
		cls: 'zcs-overview',
		app: null,
		title: null
	},

	initialize: function() {

		this.callParent(arguments);

		// Grab all our organizers in one big list. Attempting to display the organizers as separate
		// lists (folders, searches, tags) within a scrollable container does not work. The workaround
		// is to display them in a single nested list that is grouped by organizer type.

		// get the organizer data for this app
		var app = this.getApp(),
			organizerData = {
				items: ZCS.session.getOrganizerData(app, null, 'overview')
			};

		// create a store for the organizers
		var organizerStore = Ext.create('ZCS.store.ZtOrganizerStore');
		organizerStore.setRoot(organizerData);

		// show the account name at the top of the overview
		var accountName = ZCS.session.getAccountName(),
			userName = accountName.substr(0, accountName.indexOf('@'));

		// create the nested list that contains the grouped organizers
		var organizerList = Ext.create('ZCS.view.ZtOrganizerList', {
			title:          userName,
			displayField:   'displayName',
			store:          organizerStore,
			grouped:        true
		});

		this.add(organizerList);

		ZCS.app.on('notifyFolderCreate', this.handleOrganizerCreate, this);
		ZCS.app.on('notifyFolderChange', this.handleOrganizerChange, this);

		ZCS.app.on('notifySearchCreate', this.handleOrganizerCreate, this);
		ZCS.app.on('notifySearchChange', this.handleOrganizerChange, this);

		ZCS.app.on('notifyTagCreate', this.handleOrganizerCreate, this);
	},

	/**
	 * An organizer has just been created. We need to add it to our session data,
	 * and insert it into the organizer list component.
	 *
	 * @param {ZtOrganizer}     folder          null (arg not passed)
	 * @param {Object}          notification    JSON with organizer data
	 */
	handleOrganizerCreate: function(folder, notification) {

		var organizer = ZCS.model.ZtOrganizer.getProxy().getReader().getDataFromNode(notification, notification.itemType);
		if (organizer) {
			ZCS.model.ZtOrganizer.addOtherFields(organizer, this.getApp(), 'overview', false);
			this.insertOrganizer(organizer, organizer.parentItemId, organizer.parentZcsId);
		}
	},

	/**
	 * An organizer has just changed. If it is a move, we need to relocate it within
	 * the organizer nested list.
	 *
	 * @param {ZtOrganizer}     folder          organizer that changed
	 * @param {Object}          notification    JSON with new data
	 */
	handleOrganizerChange: function(folder, notification) {

		if (notification.l) {
			var reader = ZCS.model.ZtOrganizer.getProxy().getReader(),
				data = reader.getDataFromNode(notification, folder.get('type'), this.getApp(), []),
				list = this.down('folderlist'),
				store = list && list.getStore(),
				oldParentId = folder.get('parentItemId'),
				oldParentZcsId = folder.get('parentZcsId'),
				itemId = ZCS.model.ZtOrganizer.getOrganizerId(notification.id, this.getApp(), 'overview'),
				newParentId = ZCS.model.ZtOrganizer.getOrganizerId(data.parentZcsId, this.getApp(), 'overview');

			folder.set('parentZcsId', data.parentZcsId);
			folder.set('parentItemId', newParentId);

			this.insertOrganizer(ZCS.cache.get(itemId), newParentId, data.parentZcsId, oldParentId, oldParentZcsId);
		}
	},

	/**
	 * Adds a new child to the given parent, inserting it at the proper position within
	 * the parent's children.
	 *
	 * @param {ZtOrganizer} organizer
	 * @param {String}      parentId
	 * @private
	 */
	insertOrganizer: function(organizer, parentId, parentZcsId, oldParentId, oldParentZcsId) {

		var list = this.down('folderlist'),
			store = list && list.getStore(),
			parent = (!parentId || parentZcsId === ZCS.constant.ID_ROOT) ? store.getRoot() : store.getNodeById(parentId),
			oldParent = (!oldParentId || oldParentZcsId === ZCS.constant.ID_ROOT) ? store.getRoot() : store.getNodeById(oldParentId);

		if (parent && organizer) {
			var index = this.getSortIndex(parent, organizer);
			if (index === -1) {
				// TODO: possible JS error here if organizer isn't decorated (missing 'childNodes' property)
				parent.appendChild(organizer);
			}
			else {
				parent.insertChild(index, organizer);
			}
			parent.set('disclosure', true);
			parent.set('leaf', false);

			if (oldParent && !(oldParent.childNodes && oldParent.childNodes.length > 0)) {
				oldParent.set('disclosure', false);
				oldParent.set('leaf', true);
			}
		}
	},

	/**
	 * Returns the index of the child within the parent's children, or -1 if there
	 * are no children.
	 *
	 * @param {ZtOrganizer} parent
	 * @param {ZtOrganizer} child
	 * @return {Integer}    the sort index
	 * @private
	 */
	getSortIndex: function(parent, child) {

		var ln = parent && parent.childNodes ? parent.childNodes.length : 0,
			i, organizer;

		for (i = 0; i < ln; i++) {
			organizer = parent.childNodes[i];
			if (ZCS.model.ZtOrganizer.compare(child, organizer) === -1) {
				return i;
			}
		}
		return -1;
	}
});
