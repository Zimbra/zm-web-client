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
 * The main view is a tab panel with a tab for each app.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define("ZCS.view.ZtMain", {

	extend: 'Ext.Container',

	requires: [
		'ZCS.view.mail.ZtComposeForm',
		'ZCS.view.ZtAppView',
		'ZCS.view.ZtAppsMenu',
		'ZCS.view.ZtOrganizerEdit'
	],

	alias: 'widget.ztmain',

	config: {
		fullscreen: true,
		defaults: {
			styleHtmlContent: true
		},
		layout: {
			type: 'card',
			animation: {
				type: 'fade'
			}
		}
	},

	initialize: function() {
		var me = this;

		this.callParent(arguments);

		Ext.each(ZCS.constant.APPS, function(app) {
			if (ZCS.util.isAppEnabled(app)) {
				var mainView = {
					xtype: 'appview',
					itemId: app + 'view',
					app: app
				};
				me.add(mainView);
			}
		}, this);

		Ext.Viewport.add(Ext.create('ZCS.view.ZtAppsMenu'));
		Ext.Viewport.add(Ext.create('ZCS.view.ZtOrganizerEdit'));
		Ext.Viewport.add(Ext.create('ZCS.view.mail.ZtComposeForm'));
		Ext.Viewport.add(Ext.create('ZCS.view.contacts.ZtContactForm'));
		Ext.Viewport.add(Ext.create('ZCS.view.calendar.ZtAppointmentForm'));
        Ext.Viewport.add(Ext.create('ZCS.view.calendar.ZtNewAppointment'));
        Ext.Viewport.add(Ext.create('ZCS.view.calendar.ZtAppointmentDialog'));
	}
});
