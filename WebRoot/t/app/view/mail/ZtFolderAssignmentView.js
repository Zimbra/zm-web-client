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
 * This class shows a user a list of folders to apply to the configured component/record.
 *
 * @author Macy Abbey
 */
Ext.define('ZCS.view.mail.ZtFolderAssignmentView', {
	extend: 'ZCS.view.mail.ZtAssignmentView',
	requires: [
		'ZCS.model.ZtFolder'
	],
	alias: 'widget.moveview',

	config: {
		/**
		 * @cfg {Object} Folder tree with which to populate the store
		 */
		folderTree: null
	},

	constructor: function (config) {

		var cfg = config || {};

		// get the organizer data for this app
		var organizerData = {
			items: cfg.folderTree
		};

		// create a store for the organizers
		var organizerStore = Ext.create('Ext.data.TreeStore', {
			model: 'ZCS.model.ZtFolder',
			defaultRootProperty: 'items',
			root: organizerData,
			storeId: 'organizerStore',
			proxy: {
				type: 'memory',
				model: 'ZCS.model.ZtFolder'
			}
		});

		cfg.list = {
			xtype: 'folderlist',
			displayField: 'name',
			title: cfg.listTitle,
			store: organizerStore,
			grouped: false
		};

		cfg.listHasOwnHeader = true;

		this.callParent([cfg]);
	}
});
