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
 * This class displays calendar.
 *
 * @author Ajinkya Chhatre <achhatre@zimbra.com>
 */

Ext.define('ZCS.view.calendar.ZtCalendarView', {

    extend: 'Ext.TabPanel',

    xtype: ZCS.constant.APP_CALENDAR + 'itemview',

    config: {
        loadingText: 'Loading Calendar'
    },

    initialize: function() {

        this.callParent(arguments);

        /*
         * Following is a temporary code.
         *
         * TODO:
         * 1.) Create a calendar base view class and extend Ext.ux.TouchCalendar
         * 2.) Current class would make a provision to add Month, Week and Day views
         *
         */

        this.setItems(
            [
                {
                    xtype: 'calendar',
                    title: 'Month',
                    viewMode: 'month',
                    value: new Date(),
                    enableEventBars: {
                        eventHeight: 'auto',
                        eventBarTpl: '<div>{title}</div>'
                    },
                    viewConfig: {
                        weekStart: 0,
                        eventStore: Ext.getStore('ZtCalendarStore'),
                        plugins: [Ext.create('Ext.ux.TouchCalendarEvents', {
                            eventHeight: 'auto',
                            eventBarTpl: '<div>{title}</div>'
                        })]
                    }
                },
                {
                    xtype: 'calendar',
                    title: 'Week',
                    viewMode: 'week',
                    value: new Date(),
                    enableEventBars: {
                        eventHeight: 'auto',
                        eventBarTpl: '<div>{title}</div>'
                    },
                    viewConfig: {
                        weekStart: 0,
                        eventStore: Ext.getStore('ZtCalendarStore'),
                        plugins: [Ext.create('Ext.ux.TouchCalendarEvents', {
                            eventHeight: 'auto',
                            eventBarTpl: '<div>{title}</div>'
                        })]
                    }
                },
                {
                    xtype: 'calendar',
                    title: 'Day',
                    viewMode: 'day',
                    value: new Date(),
                    enableEventBars: {
                        eventHeight: 'auto',
                        eventBarTpl: '<div>{title}&nbsp;&nbsp;&nbsp;<i>{event}</i></div>'
                    },
                    viewConfig: {
                        weekStart: 0,
                        eventStore: Ext.getStore('ZtCalendarStore'),
                        plugins: [Ext.create('Ext.ux.TouchCalendarEvents', {
                            eventHeight: 'auto',
                            eventBarTpl: '<div>{title}&nbsp;&nbsp;&nbsp;<i>{event}</i></div>'
                        })]
                    }
                }
            ]
        );
    }
});