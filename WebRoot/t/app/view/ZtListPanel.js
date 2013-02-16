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
 * A list panel consists of three components: A header describing the list contents in general, a search box, and a list
 * of items. The header has a button on the left to show the folder tree, and a button on the right to create a new
 * item.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.view.ZtListPanel', {

	extend: 'Ext.Container',

	requires: [
		'Ext.dataview.List',
		'Ext.TitleBar',
		'Ext.field.Search',

		'ZCS.view.mail.ZtConvListView',
		'ZCS.view.contacts.ZtContactListView'
	],

	xtype: 'listpanel',

	config: {
		layout: 'fit',
		style: 'border-right: 1px solid #303030;',
		app: null,
		newButtonIcon: null,
		storeName: null
	},

	initialize: function() {

		this.callParent(arguments);

		var app = this.getApp();

		var listToolbar = {
			docked: 'top',
			xtype: 'titlebar',
			title: '',
			items: [
				{
					xtype: 'button',
					handler: function() {
						this.up('listpanel').fireEvent('showFolders');
					},
					iconCls: 'list',
					iconMask: true,
					align: 'left'
				},
				{
					xtype: 'button',
					handler: function() {
						this.up('listpanel').fireEvent('newItem');
					},
					iconCls: this.getNewButtonIcon(),
					iconMask: true,
					align: 'right'
				}
			]
		};

		var searchToolbar = {
			docked: 'top',
			xtype: 'toolbar',
			items: [
				{
					xtype: 'searchfield',
					name: 'searchField',
					style: 'width:95%;',
					listeners: {
						keyup: function(fld, ev) {
							var keyCode = ev.browserEvent.keyCode;
							if (keyCode === 13 || keyCode === 3) {
								this.up('listpanel').fireEvent('search', fld.getValue(), false);
							}
						}
					}
				}
			]
		};

		var listView = {
			xtype: app + 'listview',
			store: Ext.getStore(this.getStoreName())
		}

		this.add([
			listToolbar,
			searchToolbar,
			listView
		]);
	}
});
