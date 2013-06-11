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
 * This class parses JSON calendar data into ZtCalendar objects.
 *
 * @author Ajinkya Chhatre <achhatre@zimbra.com>
 */

Ext.define('ZCS.model.calendar.ZtCalendarReader', {

    extend: 'ZCS.model.ZtReader',

    alias: 'reader.calendarreader',

    getDataFromNode: function(node) {

        var attrs = node,
            syear = new Date(node.inst[0].s).getFullYear(),
            smonth = new Date(node.inst[0].s).getMonth(),
            sday = new Date(node.inst[0].s).getDate(),
            shour = new Date(node.inst[0].s).getHours(),
            sminutes = new Date(node.inst[0].s).getMinutes(),
            eyear = new Date(node.inst[0].s + node.dur).getFullYear(),
            emonth = new Date(node.inst[0].s + node.dur).getMonth(),
            eday = new Date(node.inst[0].s + node.dur).getDate(),
            ehour = new Date(node.inst[0].s + node.dur).getHours(),
            eminutes = new Date(node.inst[0].s + node.dur).getMinutes(),
            data = {
                type: ZCS.constant.ITEM_CALENDAR,
                event: new Date(node.inst[0].s).getHours() + ':' + this.getPaddedDigits(new Date(node.inst[0].s).getMinutes()) + ' - ' + new Date(node.inst[0].s + node.dur).getHours() + ':' + this.getPaddedDigits(new Date(node.inst[0].s + node.dur).getMinutes()),
                title: node.name,
                start: new Date(syear, smonth, sday, shour, sminutes),
                end: new Date(eyear, emonth, eday, ehour, eminutes)
            };

        return data;
    },

    getPaddedDigits: function(number) {
        return ('0' + number).slice(-2);
    }
});