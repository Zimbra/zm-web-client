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
 * This class renders calendar views.
 *
 * @author Ajinkya Chhatre <achhatre@zimbra.com>
 */

Ext.define('ZCS.view.calendar.ZtCalendarView', {

    extend: 'Ext.Container',

    xtype: ZCS.constant.APP_CALENDAR + 'itemview',

    config: {
        loadingText: ZtMsg.loadingCalendar
    },

    initialize: function() {

        this.callParent(arguments);

        var monthView = {
            xtype: 'calendar',
            width: '100%',
            height: '100%',
            viewMode: 'month',
            itemId: 'calMonthView',
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

        }

        var weekView = {
            xtype: 'calendar',
            width: '100%',
            height: '100%',
            viewMode: 'week',
            itemId: 'calWeekView',
            hidden: true,
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

        }

        var dayView = {
            xtype: 'calendar',
            width: '100%',
            height: '100%',
            viewMode: 'day',
            itemId: 'calDayView',
            hidden: true,
            value: new Date(),
            enableEventBars: {
                eventHeight: 'auto',
                eventBarTpl: '<div>{title}&nbsp;&nbsp;&nbsp;<i>{event}</i></div>'
            },
            viewConfig: {
                weekStart: 0, //TODO: This will be set as per User Preferences
                eventStore: Ext.getStore('ZtCalendarStore'),
                plugins: [Ext.create('Ext.ux.TouchCalendarEvents', {
                    eventHeight: 'auto',
                    eventBarTpl: '<div>{title}&nbsp;&nbsp;&nbsp;<i>{event}</i></div>'
                })]
            }
        }

        this.add([
            monthView,
            weekView,
            dayView
        ]);
    }
});