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
 * This view represents action menu for appointments. Eg. Open instance, series or cancel
 *
 * @author Ajinkya Chhatre <achhatre@zimbra.com>
 */

Ext.define('ZCS.view.calendar.ZtAppointmentDialog', {

	extend: 'Ext.Container',

	xtype: 'appointmentdialog',

	config: {
		itemId:       'appointmentDialog',
		bottom:        0,
		height:       '30%',
		width:        '100%',
		cls:          'zcs-appt-dialog',
		hidden:        true,
		modal:         true,
		showAnimation: {
			type:       'slide',
			easing:     'ease-out',
			direction:  'up',
			duration:    400
		},
		hideAnimation: {
			type:       'slideOut',
			easing:     'ease-out',
			direction:  'down',
			duration:    400
		},
		layout:  'vbox',
		defaults: {
			flex: 1
		},
		items: [
			{
				xtype:  'button',
				text:    ZtMsg.apptOpenInstance,
				cls:    'zcs-appt-dialogbtn first',
				handler: function() {
					ZCS.app.getCalendarController().appointmentDialogAction(true);
					Ext.ComponentQuery.query('#appointmentDialog')[0].hide();
				}
			},
			{
				xtype:  'button',
				text:    ZtMsg.apptOpenSeries,
				cls:    'zcs-appt-dialogbtn last',
				handler: function() {
					ZCS.app.getCalendarController().appointmentDialogAction(false);
					Ext.ComponentQuery.query('#appointmentDialog')[0].hide();
				}
			},
			{
				xtype:  'button',
				text:    ZtMsg.cancel,
				cls:    'zcs-appt-dialogbtn zcs-appt-cancelbtn',
				handler: function() {
					Ext.ComponentQuery.query('#appointmentDialog')[0].hide();
				}
			}
		]
	}
});