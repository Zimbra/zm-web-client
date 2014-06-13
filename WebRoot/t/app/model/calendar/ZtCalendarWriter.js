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
 * This class generates the JSON for calendar-related SOAP requests.
 *
 * @author Ajinkya Chhatre <achhatre@zimbra.com>
 */

Ext.define('ZCS.model.calendar.ZtCalendarWriter', {

    extend: 'ZCS.model.ZtWriter',

    alias: 'writer.calendarwriter',

    writeRecords: function(request, data) {

        var	action = request.getAction(),
            operation = request.getOperation(),
            offset = operation.getStart(),
            options = operation.getInitialConfig(),
            itemData = data && data.length ? Ext.merge(data[0], options) : options,
            start = itemData.calStart,
            end = itemData.calEnd,
            json, methodJson;

        if (action === 'read') {

            var query = request.getParams().query || 'in:calendar';
            // doing a search - replace the configured 'read' operation URL
            request.setUrl(ZCS.constant.SERVICE_URL_BASE + 'Search');

            json = this.getSoapEnvelope(request, data, 'Search');
            methodJson = json.Body.SearchRequest;

            Ext.apply(methodJson, {
                sortBy: 'none',
                offset: offset,
                calExpandInstEnd: end,
                calExpandInstStart: start,
                limit: "500",
                query: query,
                types: 'appointment'
            });

        } else if (action === 'create') {

            var	appt = request.getRecords()[0];

            json = this.getSoapEnvelope(request, data, 'CreateAppointment');
            methodJson = json.Body.CreateAppointmentRequest;

            var m = methodJson.m = {};

            m = this.populateAttrs(methodJson, appt);
            m.l = itemData.folderId || ZCS.constant.ID_CALENDAR;

            Ext.apply(methodJson, {
                m: m
            });
        }

        request.setJsonData(json);

        return request;
    },

    populateAttrs: function(request, appt) {
        var m = request.m = {},
            mailFromAddress,
            comps,
            comp,
            inv,
            org;

        inv = m.inv = {};
        m.e = [];

        comps = inv.comp = [];
        comp = comps[0] = {};
        comp.at = [];
        org = comp.or = {};

        //FROM Address
        mailFromAddress =  ZCS.mailutil.getFromAddress();
        org.a = mailFromAddress.get('email');
        org.d = mailFromAddress.get('name');

        //start end time
        this._addDateTimeToRequest(request, comp, appt);

        // subject/location
        m.su = appt.get('subject');
        comp.name = appt.get('subject');
        comp.loc = appt.get('location');

        //recurrence
        this._setRecurrence(comp, appt);

        //alarm
        var reminderMinutes = appt.get('reminder');
        this._setAlarmData(comp, reminderMinutes);

        // notes
        this._addNotesToRequest(m, appt);

        return m;
    },

    _addDateTimeToRequest : function(request, comp, appt) {
        var allDay = appt.get('isAllDay') ? 1 : 0;
        comp.allDay = allDay + "";

        var tz,
            s,
            sd,
            e,
            ed,
            timezone = ZCS.timezone.DEFAULT_TZ;

        if (timezone) {
            tz = timezone;
        }

        // start date
        if (appt.get('start') || appt.get('startAllDay')) {
            s = comp.s = {};
            if (!allDay) {
                sd = Ext.Date.format(appt.get('start'), "Ymd\\THis");
                // set timezone if not utc date/time
                if (tz && tz.length) {
                    s.tz = tz;
                }
                s.d = sd;
            }
            else {
                s.d = Ext.Date.format(appt.get('startAllDay'), "Ymd");
            }
        }

        // end date
        if (appt.get('end') || appt.get('endAllDay')) {
            e = comp.e = {};
            if (!allDay) {
                ed = Ext.Date.format(appt.get('end'), "Ymd\\THis");

                // set timezone if not utc date/time
                if (tz && tz.length) {
                    e.tz = tz;
                }
                e.d = ed;

            } else {
                e.d = Ext.Date.format(appt.get('endAllDay'), "Ymd");
            }
        }
    },

    _setRecurrence: function(comp, appt) {
        if (appt.get('repeat') === ZCS.recur.self.NONE) {
            return;
        }
        var recur = comp.recur = {},
            add = recur.add = {},
            rule = add.rule = {},
            interval = rule.interval = {};
        rule.freq = appt.get('repeat');
        interval.ival = 1;
    },

    _setAlarmData: function(comp, reminderMinutes) {
        if (!reminderMinutes) {
            return;
        }
        var alarms = comp.alarm = comp.alarm || [];
        var alarm = {action: 'DISPLAY'};
        alarms.push(alarm);
        var trigger = alarm.trigger = {};
        this._setReminderUnits(trigger, reminderMinutes);
    },

    _setReminderUnits: function(trigger, time) {
        time = time || 0;
        var rel = trigger["rel"] = {};
        rel.m = time;
        //default option is to remind before appt start
        rel.related = "START";
        rel.neg = "1";

    },

    _addNotesToRequest : function(m, appt) {
        var mp = m.mp = {"mp" : []},
            content = appt.get('notes');

        mp.ct = ZCS.mime.MULTI_ALT;
        mp.mp.push({
            ct : ZCS.mime.TEXT_PLAIN
        });
        mp.mp[0].content = content;
    }

});