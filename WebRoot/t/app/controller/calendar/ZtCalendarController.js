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
            calToolbar: 'appview #' + ZCS.constant.APP_CALENDAR + 'itempanel caltoolbar',
            appointmentView : ZCS.constant.APP_CALENDAR + 'appointmentview'
        },

        control: {
            calendarView: {
                eventtap: 'onEventTap',
                periodchange: 'onPeriodChange'
            },
            appointmentView: {
                inviteReply: 'doInviteReply'
            }
        },

        app: ZCS.constant.APP_CALENDAR,
        invite: null
    },

    launch: function() {

	    if (!ZCS.util.isAppEnabled(this.getApp())) {
		    return;
	    }

        this.callParent();

        //Create a toolbar with calendar view buttons - Month, Week, Day, Workweek and Today
        this.createToolbar();
    },

    /*
     * Loads the appointments on application switch
     */
    loadCalendar: function() {
        var defaultQuery = this.getDefaultQuery(),
            me = this;

        //Set the proxies params so this parameter persists between paging requests.
        this.getStore().getProxy().setExtraParams({
            query: defaultQuery
        });

        this.getStore().load({
            calStart: this.getMonthStartTime(),
            calEnd: this.getMonthEndTime(),
            query: defaultQuery,
            callback: function(records, operation, success) {
                if (success) {
                    // Fix for bug: 83607
                    me.refreshCurrentView();
                }
            }
        });
    },

    /*
     * Refreshes and reloads default/last selected calendar view
     */
    refreshCurrentView: function() {
        var monthView = this.getCalMonthView(),
            dayView = this.getCalDayView(),
            weekView = this.getCalWeekView();

        if (!monthView.isHidden()) {
            monthView.view.refreshDelta(0);
        }
        else if (!dayView.isHidden()) {
            dayView.view.refreshDelta(0);
        }
        else if (!weekView.isHidden()) {
            weekView.view.refreshDelta(0);
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
            start = event.get('start'),
            me = this;

        msg.save({
            op: 'load',
            id: inviteId,
            apptView: true,
            ridZ: start,
            success: function(record) {
                me.showItem(record, event);
            }
        });
    },

    /**
     * Show appoinment view panel, by sliding it up on an overlay
     * @param {ZCS.model.calendar.ZtCalendar} event The Event record that was tapped
     */

    showItem: function(msg, event) {
        var panel = this.getApptViewPanel();
        panel.setPanel(msg, event);
        panel.show({
            type:       'slide',
            direction:  'up',
            duration:   250
        });
        this.setInvite(msg.get('invite'));
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
        return 'in:calendar';
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
    },

    /**
     * Sends the attendee response as a notification to the organizer
     */
    doInviteReply: function(invId, action) {
        var invite = this.getInvite(),
            msg = Ext.create('ZCS.model.mail.ZtMailMsg');

        msg.set('origId', invId);  //not sure if origId should be set to invite id
        msg.set('inviteAction', action);
        msg.set('replyType', 'r');

        msg.set('subject', invite.get('subject'));

        var from = ZCS.mailutil.getFromAddress();
        msg.addAddresses(from);

        if (!invite.get('isOrganizer')) {
            var	organizer = invite.get('organizer'),
                organizerEmail = organizer && organizer.get('email'),
                toEmail = organizerEmail || invite.get('sentBy');

            if (toEmail) {
                msg.addAddresses(ZCS.model.mail.ZtEmailAddress.fromEmail(toEmail, ZCS.constant.TO));
            }
        }

        var replyBody = invite.getSummary(true) + ZCS.constant.INVITE_REPLY_TEXT[action] + '<br><br>';

        msg.createMime(replyBody, true);
        var me = this;
        msg.save({
            isInviteReply: true,
            success: function () {
                me.getApptViewPanel().hide();
                ZCS.app.fireEvent('showToast', ZtMsg.invReplySent);
            }
        });
    }
});
