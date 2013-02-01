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
		style:  'border: solid blue 1px;',

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
			grouper: function(record) {
				return record.get('typeName');
			},
			sorters: [
				{
					// Sort by organizer type, then system folders to top, then by name.
					// We use organizer type as the first sort key because specifying a 'sortProperty'
					// in the grouper above does not work, maybe because this is a TreeStore.
					sorterFn: function(organizer1, organizer2) {

						var orgType1 = organizer1.get('type'),
							orgType2 = organizer2.get('type'),
							isSystem1 = organizer1.isSystem(),
							isSystem2 = organizer2.isSystem(),
							sortField1, sortField2;

						if (orgType1 !== orgType2) {
							sortField1 = ZCS.constant.ORG_SORT_VALUE[orgType1];
							sortField2 = ZCS.constant.ORG_SORT_VALUE[orgType2];
						}
						else if (isSystem1 !== isSystem2) {
							return isSystem1 ? -1 : 1;
						}
						else if (isSystem1 && isSystem2) {
							sortField1 = ZCS.constant.FOLDER_SORT_VALUE[organizer1.get('itemId')];
							sortField2 = ZCS.constant.FOLDER_SORT_VALUE[organizer2.get('itemId')];
						}
						else {
							sortField1 = organizer1.get('name').toLowerCase();
							sortField2 = organizer2.get('name').toLowerCase();
						}

						return sortField1 > sortField2 ? 1 : (sortField1 === sortField2 ? 0 : -1);
					},
					direction: 'ASC'
				}
			]
		});

		// show the account at the top of the overview, and a logout button
		var userInfo = {
			xtype: 'titlebar',
			docked: 'top',
			title: ZCS.session.getAccountName(),
			items: [
				{
					xtype: 'button',
					iconCls: 'eject',
					iconMask: true
				}
			]
		};

		// create the nested list that contains the grouped organizers
		var organizerList = Ext.create('ZCS.view.ZtOrganizerList', {
			title: 'All',
			displayField: 'name',
			store: organizerStore,
			grouped: true
		});

		ZCS.session.setOrganizerListByApp(organizerList, this.getApp());

		this.add([
			userInfo,
			organizerList
		]);
	}
});
