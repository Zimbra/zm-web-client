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
 * This class represents a controller that manages calendar.
 *
 * @author Ajinkya Chhatre <achhatre@zimbra.com>
 */

Ext.define('ZCS.controller.calendar.ZtCalendarController', {

    extend: 'ZCS.controller.ZtItemController',

    requires: [
        'Ext.ux.TouchCalendarEventsBase',
        'Ext.ux.TouchCalendarMonthEvents',
        'Ext.ux.TouchCalendarWeekEvents',
        'Ext.ux.TouchCalendarDayEvents',
        'Ext.ux.TouchCalendarEvents',
        'Ext.ux.TouchCalendarSimpleEvents',
        'Ext.ux.TouchCalendarView',
        'Ext.ux.TouchCalendar',
        'ZCS.view.calendar.ZtCalendarToolbar',
        'ZCS.view.calendar.ZtAppointmentView'
    ],

    config: {

        models: ['ZCS.model.calendar.ZtCalendar'],

        stores: ['ZCS.store.calendar.ZtCalendarStore'],

        views: [
            'ZCS.view.calendar.ZtCalendarView'
        ],

        refs: {
            overview: '#' + ZCS.constant.APP_CALENDAR + 'overview',
            itemPanel: 'appview #' + ZCS.constant.APP_CALENDAR + 'itempanel',
            calendarView: ZCS.constant.APP_CALENDAR + 'itemview',
            calMonthView: 'appview #' + ZCS.constant.APP_CALENDAR + 'itempanel #calMonthView',
            calWeekView: 'appview #' + ZCS.constant.APP_CALENDAR + 'itempanel #calWeekView',
            calDayView: 'appview #' + ZCS.constant.APP_CALENDAR + 'itempanel #calDayView',
            itemPanelTitleBar: 'appview #' + ZCS.constant.APP_CALENDAR + 'itempanel titlebar',
            calToolbar: 'appview #' + ZCS.constant.APP_CALENDAR + 'itempanel caltoolbar'
        },

        control: {
            calendarView: {
                eventtap: 'onEventTap',
                periodchange: 'onPeriodChange'
            }
        },

        app: ZCS.constant.APP_CALENDAR
    },

    launch: function() {

        // Create toolbar and load store only if calendar app is enabled
        if (ZCS.session.getSetting(ZCS.constant.APP_SETTING[this.getApp()])) {
            var defaultQuery = this.getDefaultQuery();

            this.callParent();

            //Create a toolbar with calendar view buttons - Month, Week, Day, Workweek and Today
            this.createToolbar();

            //Set the proxies params so this parameter persists between paging requests.
            this.getStore().getProxy().setExtraParams({
                query: defaultQuery
            });

            this.getStore().load({
                calStart: this.getMonthStartTime(),
                calEnd: this.getMonthEndTime(),
                query: defaultQuery
            });
        }
    },

    /*
     * Invokes when an appointment is tapped
     *
     * @param {ZCS.model.calendar.ZtCalendar} event The Event record that was tapped
     */
    onEventTap: function(event) {
        var msg = Ext.create('ZCS.model.mail.ZtMailMsg'),
            inviteId = event.get('invId'),
            me = this;

        msg.save({
            op: 'load',
            id: inviteId,
            apptView: true,
            success: function(records) {
                me.showItem(records);
            }
        });
    },

    /**
     * Show appoinment view panel, by sliding it up on an overlay
     * @param {ZCS.model.calendar.ZtCalendar} event The Event record that was tapped
     */

    showItem: function(msg) {
        var panel = this.getApptViewPanel();
        panel.setPanel(msg);
        panel.show({
            type:       'slide',
            direction:  'up',
            duration:   250
        });
    },

    /**
     * Creates a ZtAppointmentView panel which can be used to view the appointment details
     * @returns {ZCS.view.calendar.ZtAppointmentView}
     */
    getApptViewPanel: function() {
        if (!this.apptViewPanel) {
            this.apptViewPanel = Ext.create('ZCS.view.calendar.ZtAppointmentView');
            Ext.Viewport.add(this.apptViewPanel);
        }
        return this.apptViewPanel;
    },


    /**
     * Handler for the calendar's periodchange event.
     *
     * @param {Ext.ux.TouchCalendarView} view The underlying Ext.ux.TouchCalendarView instance
     * @param {Date} minDate The min date of the new period
     * @param {Date} maxDate The max date of the new period
     * @param {String} direction The direction the period change moved.
     */
    onPeriodChange: function(view, minDate, maxDate, direction) {
        this.getStore().load({
            calStart: minDate.getTime(),
            calEnd: maxDate.getTime(),
            callback: function(records, operation, success) {
                if (success) {
                    view.refresh();
                }
            }
        });
    },

    getDefaultQuery: function() {
        return '';
    },

    createToolbar: function() {
        this.getItemPanelTitleBar().add(Ext.create('ZCS.view.calendar.ZtCalendarToolbar', {
            newButtonIcon: ZCS.constant.NEW_ITEM_ICON[ZCS.constant.APP_CALENDAR]
        }));
    },

    getMonthStartTime: function() {
        var weekStart = this.getCalMonthView().getViewConfig().weekStart,
            firstDay = new Date().setDate(1),  //Month starts with 1
            firstDayDate = new Date(firstDay),
            today = new Date(firstDay).getDay(),
            daysToSubtract = today - weekStart;

        return this.getTimeStamp(firstDayDate, -daysToSubtract);
    },

    getMonthEndTime: function() {
        var daysInWeek = 7,
            weekStart = this.getCalMonthView().getViewConfig().weekStart,
            month = new Date().getMonth(), //Starts from 0 as January
            year = new Date().getFullYear(),
            lastDayDate = new Date(year, month + 1, 0),
            daysToAdd = (daysInWeek + weekStart) - 1;

        return this.getTimeStamp(lastDayDate, daysToAdd);
    },

    getTimeStamp: function(date, daysToAdjust) {
        return new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate() + daysToAdjust,
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
            date.getMilliseconds()
        ).getTime();
    },

    toggleCalView: function(viewToShow, date) {
        var monthView = this.getCalMonthView(),
            weekView = this.getCalWeekView(),
            dayView = this.getCalDayView();

        if (!date) {
            switch(viewToShow) {
                case 'month':
                    monthView.show();
                    this.getCalToolbar().down('#monthBtn').setCls('x-button-pressed');
                    weekView.hide();
                    this.getCalToolbar().down('#weekBtn').removeCls('x-button-pressed');
                    dayView.hide();
                    this.getCalToolbar().down('#dayBtn').removeCls('x-button-pressed');
                    break;

                case 'week':
                    weekView.show();
                    this.getCalToolbar().down('#weekBtn').setCls('x-button-pressed');
                    monthView.hide();
                    this.getCalToolbar().down('#monthBtn').removeCls('x-button-pressed');
                    dayView.hide();
                    this.getCalToolbar().down('#dayBtn').removeCls('x-button-pressed');
                    break;

                case 'day':
                    dayView.show();
                    this.getCalToolbar().down('#dayBtn').setCls('x-button-pressed');
                    monthView.hide();
                    this.getCalToolbar().down('#monthBtn').removeCls('x-button-pressed');
                    weekView.hide();
                    this.getCalToolbar().down('#weekBtn').removeCls('x-button-pressed');
                    this.setDayViewConfig(new Date().getTime());
                    break;
            }
        }
        else {
            dayView.show();
            this.getCalToolbar().down('#dayBtn').setCls('x-button-pressed');
            monthView.hide();
            this.getCalToolbar().down('#monthBtn').removeCls('x-button-pressed');
            weekView.hide();
            this.getCalToolbar().down('#weekBtn').removeCls('x-button-pressed');
            this.setDayViewConfig(date);
        }
    },

    setDayViewConfig: function(date) {
        this.getCalDayView().setCustomView({
            weekStart: 0,
            currentDate: new Date(date),
            viewMode: 'day',
            eventStore: Ext.getStore('ZtCalendarStore'),
            plugins: [Ext.create('Ext.ux.TouchCalendarEvents', {
                eventHeight: 'auto',
                eventBarTpl: '<div>{title}&nbsp;&nbsp;&nbsp;<i>{event}</i></div>'
            })]
        });
    }
});
