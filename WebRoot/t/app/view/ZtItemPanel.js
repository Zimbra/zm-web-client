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
 * Base class for a panel that displays a single item. It has a toolbar at the top, and the item is
 * displayed below. The toolbar has a button that will show an action menu for the item.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.view.ZtItemPanel', {

	extend: 'Ext.Container',

	requires: [
		'Ext.dataview.List',
		'Ext.TitleBar'
	],

	xtype: 'itempanel',

	config: {
		layout: 'fit',
		cls:    'zcs-item-panel',
		app:    null
	},

	initialize: function() {

		this.callParent(arguments);

		var app = this.getApp(),
			items = [],
			buttons = ZCS.constant.ITEM_BUTTONS[app],
			ln = buttons ? buttons.length : 0,
			i, button;

		function createHandler(event) {
			return function() {
				this.up('titlebar').fireEvent(event, this);
			}
		}

		for (i = 0; i < ln; i++) {
			var button = buttons[i];
			items.push({
				xtype:      'button',
				iconCls:    button.icon,
				cls:        'zcs-flat',
				iconMask:   true,
				align:      'right',
				handler:    createHandler(button.event),
				hidden:     true,
				menuName:   button.menuName
			});
		}

		var toolbar = {
			xtype:  'titlebar',
			docked: 'top',
		    cls:    'zcs-item-titlebar',
			items:  items
		};

		var itemView = {
			xtype: app + 'itemview'
		};

		this.add([
			toolbar,
			itemView
		]);
	},

	showButtons: function () {
		Ext.each(this.down('titlebar').query('button'), function(button) {
			button.show();
		}, this);
	},

	hideButtons: function () {
		Ext.each(this.down('titlebar').query('button'), function(button) {
			button.hide();
		}, this);
	}


});
