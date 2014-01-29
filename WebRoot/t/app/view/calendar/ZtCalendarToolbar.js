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
 * This class creates a toolbar for calendar view.
 */

Ext.define('ZCS.view.calendar.ZtCalendarToolbar', {

    extend: 'Ext.Container',

    xtype: 'caltoolbar',

    requires: [
        'Ext.TitleBar',
        'Ext.Button'
    ],

    config: {
        layout: 'hbox',
        newButtonIcon: null
    },

    initialize: function() {
        this.callParent(arguments);

        /* TODO:
         * 1. Yet to enable Week, Workweek, Day and Today buttons
         * 2. Create a panel view which would hold the below buttons
         * 3. Match up the styling with that given in mock ups
         */

        this.add([
            {
                xtype: 'panel',
                items: [
                    {
                        xtype: 'button',
                        cls: 'zcs-flat',
                        handler: function() {
                            //Todo: Code to show calendar folders
                            this.up('caltoolbar').fireEvent('showAppsMenu');
                        },
                        iconCls: 'organizer',
                        iconMask: true
                    }
                ]
            },
            {
                xtype: 'panel',
                layout: {
                    type: 'hbox'
                },
                items: [
                    {
                        xtype: 'button',
                        text: ZtMsg.calTodayLabel,
                        disabled: true
                    },
                    {
                        xtype: 'button',
                        itemId: 'dayBtn',
                        text: ZtMsg.calDayLabel,
                        handler: function() {
                            ZCS.app.getCalendarController().toggleCalView('day');
                        }
                    },
                    {
                        xtype: 'button',
                        text: ZtMsg.calWorkWeekLabel,
                        disabled: true
                    },
                    {
                        xtype: 'button',
                        itemId: 'weekBtn',
                        text: ZtMsg.calWeekLabel,
                        disabled: true,
                        handler: function() {
                            ZCS.app.getCalendarController().toggleCalView('week');
                        }
                    },
                    {
                        xtype: 'button',
                        itemId: 'monthBtn',
                        cls: 'x-button-pressed',
                        text: ZtMsg.calMonthLabel,
                        handler: function() {
                            ZCS.app.getCalendarController().toggleCalView('month');
                        }
                    }
                ]
            },
            {
                xtype: 'panel',
                items: [
                    {
                        xtype: 'button',
                        cls: 'zcs-flat',
                        iconCls: this.getNewButtonIcon(),
                        iconMask: true,
                        handler: function() {
                            ZCS.app.getAppointmentController().showNewApptForm();
                        }
                    }
                ]
            }
        ]);
    }

});