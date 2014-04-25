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
            org,
            notifyList = appt.get('attendee');

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
        m.su = appt.get('title');
        m.l = appt.get('calendarFolder');

        comp.name = appt.get('title');
        comp.loc = appt.get('location');
        comp.fb = appt.get('displayStatus');

        //recurrence
        this._setRecurrence(comp, appt);

        //alarm
        var reminderMinutes = appt.get('reminder');
        this._setAlarmData(comp, reminderMinutes);

        //attendees
        this._addAttendeesToRequest(comp, m, notifyList);

        // notes
        this._addNotesToRequest(m, appt);

        return m;
    },

    _addAttendeesToRequest : function(inv, m, notifyList) {
        Ext.each(notifyList, function(attendee) {
            var email = attendee.get('email'),
                displayName = attendee.get('longName'),
                e;

            e = {
                a : email,
                t : "t"
            };
            if (displayName) {
                e.p = displayName;
            }
            m.e.push(e);

            if (inv) {
                var at = {};

                //TODO: add support for optional attendees
                at.role = ZCS.constant.ROLE_REQUIRED;
                at.ptst = ZCS.constant.PSTATUS_UNKNOWN;
                at.rsvp = 1;
                at.a = email;

                if (displayName) {
                    at.d = displayName;
                }
                inv.at.push(at);
            }
        }, this);
    },

    _addDateTimeToRequest : function(request, comp, appt) {
        var allDay = appt.get('isAllDay') ? 1 : 0;
        comp.allDay = allDay + "";

        var tz,
            s,
            sd,
            e,
            ed,
            start = appt.get('startDate'),
            end = appt.get('endDate'),
            timezone = ZCS.timezone.DEFAULT_TZ;

        if (timezone) {
            tz = timezone;
        }

        // start date
        if (start) {
            s = comp.s = {};
            if (!allDay) {
                var startTime = appt.get('startTime');
                start.setHours(startTime.getHours());
                start.setMinutes(startTime.getMinutes());
                sd = Ext.Date.format(start, "Ymd\\THis");
                // set timezone if not utc date/time
                if (tz && tz.length) {
                    s.tz = tz;
                }
                s.d = sd;
            }
            else {
                s.d = Ext.Date.format(start, "Ymd");
            }
        }

        // end date
        if (end) {
            e = comp.e = {};
            if (!allDay) {
                var endTime = appt.get('endTime');
                end.setHours(endTime.getHours());
                end.setMinutes(endTime.getMinutes());
                ed = Ext.Date.format(end, "Ymd\\THis");

                // set timezone if not utc date/time
                if (tz && tz.length) {
                    e.tz = tz;
                }
                e.d = ed;

            } else {
                e.d = Ext.Date.format(end, "Ymd");
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