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

Ext.define('ZCS.view.calendar.ZtNewAppointment', {

    extend: 'Ext.Sheet',

    requires: [
        'Ext.form.Panel',
        'Ext.field.Text',
        'Ext.Component',
        'Ext.field.DatePicker',
        'Ext.field.Select',
        'Ext.ux.picker.Time',
        'Ext.ux.field.TimePicker',
        'ZCS.view.calendar.ZtTitleField',
        'ZCS.view.contacts.ZtMultiField',
        'ZCS.view.calendar.ZtAttendeeField',
        'ZCS.view.calendar.ZtDateField',
        'ZCS.view.calendar.ZtFolderField',
        'ZCS.view.calendar.ZtStatusField',
        'ZCS.view.calendar.ZtReminderField',
        'ZCS.view.calendar.ZtDescriptionField'
    ],

    xtype: 'newapptpanel',

    config: {
        layout:     'fit',
        width:      Ext.os.deviceType === "Phone" ? '100%' : '80%',
        height:     '100%',
        scrollable:  false,
        hidden:      true,
        modal:       true,
        cls:        'zcs-contact-form'
    },

    initialize: function() {

        var newApptForm = this,
            toolbar = {
                xtype:   'titlebar',
                cls: 'zcs-item-titlebar contact-form-titlebar',
                docked:  'top',
                title:    ZtMsg.createAppointment,
                items: [
                    {
                        xtype:  'button',
                        text:    ZtMsg.cancel,
                        cls:    'contact-form-action-button',
                        handler: function() {
                            this.up('newapptpanel').fireEvent('cancel');
                        }
                    },
                    {
                        xtype:      'button',
                        text:        ZtMsg.save,
                        align:      'right',
                        cls:    'contact-form-action-button',
                        handler: function() {
                            this.up('newapptpanel').fireEvent('create');
                        }
                    }
                ]
            },
            spacer = {
                xtype:  'spacer',
                cls:    'zcs-form-spacer'
            };

	        var items = [
		        spacer,
		        { xtype: 'titlecontainer' },
		        spacer,
		        { xtype: 'datecontainer' },
		        spacer,
		        { xtype: 'foldercontainer' },
		        { xtype: 'fbstatuscontainer' },
		        spacer,
		        { xtype: 'remindercontainer' }
		    ];
	        if (ZCS.session.getSetting(ZCS.constant.SETTING_GROUP_CALENDAR_ENABLED)) {
		        items.push(spacer, { xtype: 'attendeecontainer' });
	        }
	        items.push(spacer,  { xtype: 'descriptioncontainer' });

            var form = {
                xtype:       'formpanel',
                layout: 'vbox',
                scrollable:   true,
                defaults: {
                    labelWidth:  '5.5em',
                    inputCls:    'zcs-form-input'
                },
                items: items
            };

        this.add([
            toolbar,
            form
        ]);
    },

    resetForm: function() {
        this.down('titlebar').setTitle(ZtMsg.createAppointment);
        this.down('.formpanel').reset();
	    var attendeesField = this.down('attendeecontainer');
	    if (attendeesField) {
		    attendeesField.reset();
	    }
        this.down('#body').element.down('.zcs-body-field').setHtml('');
    }
});
