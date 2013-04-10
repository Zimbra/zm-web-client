/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 VMware, Inc.
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
		'ZCS.model.ZtOrganizer'
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
				items: ZCS.session.getOrganizerDataByApp(app)
			};

		// create a store for the organizers
		var organizerStore = Ext.create('Ext.data.TreeStore', {
			model: 'ZCS.model.ZtOrganizer',
			defaultRootProperty: 'items',
			root: organizerData,
			storeId: 'organizerStore',
			grouper: function(record) {
				return record.get('typeName');
			}
		});

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
	}
});
