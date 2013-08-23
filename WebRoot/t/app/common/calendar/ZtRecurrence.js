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
 * Creates a recurrence string based on the rules.
 *
 * @author Ajinkya Chhatre <achhatre@zimbra.com>
 */

Ext.define('ZCS.common.calendar.ZtRecurrence', {

    singleton: true,

    alternateClassName: 'ZCS.recur',

    statics: {
        NONE: 'NON',

        DAILY: 'DAI',

        WEEKLY: 'WEE',

        MONTHLY: 'MON',

        YEARLY: 'YEA',

        RECURRENCE_DAY: -1,

        RECURRENCE_WEEKEND: -2,

        RECURRENCE_WEEKDAY: -3,

        SERVER_WEEK_DAYS: ["SU", "MO", "TU", "WE", "TH", "FR", "SA"],

        SUNDAY: 0,

        MONDAY: 1,

        TUESDAY: 2,

        WEDNESDAY: 3,

        THURSDAY: 4,

        FRIDAY: 5,

        SATURDAY: 6
    },

    init: function() {
        this.invite = null;
        this.startDate = null;
        this.repeatCustom = 0;
        this.repeatCustomCount = 1;
        this.repeatCustomDayOfWeek = "SU";
        this.repeatBySetPos = "1";
        this.repeatCustomMonthDay = null;
        this.repeatCustomType = "S";
        this.repeatEnd = null;
        this.repeatEndCount = 1;
        this.repeatEndDate = null;
        this.repeatEndType = "N";
        this.repeatMonthlyDayList = null;
        this.repeatType = this.self.NONE;
        this.repeatWeekday = false;
        this.repeatWeeklyDays = [];
        this.repeatYearlyMonthsList = 1;
    },

    /**
     * Returns recurrence string based on the recur rules in invite object.
     *
     * @param {ZtInvite} inv
     * @return {String}
     */
    getBlurb: function(inv) {

        this.init();

        this.startDate = ZCS.model.mail.ZtInvite.getDateFromJson(inv.s && inv.s[0]);

        // Set recur rules
        this.setRecurrenceRules(inv.recur);

        if (this.repeatType === this.self.NONE) {
            return "";
        }

        var every = [];

        switch (this.repeatType) {
            case this.self.DAILY: {
                if (this.repeatCustom === 1 && this.repeatWeekday) {
                    every.push(ZtMsg.recurDailyEveryWeekday);
                }
                else if (this.repeatCustomCount === 1) {
                    every.push(ZtMsg.recurDailyEveryDay);
                }
                else {
                    every.push(ZCS.util.formatRecurMsg(ZtMsg.recurDailyEveryNumDays, this.repeatCustomCount));
                }
                break;
            }
            case this.self.WEEKLY: {
                if (this.repeatCustomCount === 1 && this.repeatWeeklyDays.length === 1) {
                    var dayofweek = ZCS.util.indexOf(this.self.SERVER_WEEK_DAYS, this.repeatWeeklyDays[0]),
                        date = new Date(),
                        formatter;

                    date.setDate(date.getDate() - date.getDay() + dayofweek);

                    every.push(ZCS.util.formatRecurMsg(ZtMsg.recurWeeklyEveryWeekday, date));
                }
                else {
                    var weekdays = [],
                        i,
                        formatter,
                        weeklyDaysLen = this.repeatWeeklyDays.length;

                    for (i = 0; i < weeklyDaysLen; i++) {
                        var dayofweek = ZCS.util.indexOf(this.self.SERVER_WEEK_DAYS, this.repeatWeeklyDays[i]),
                            date = new Date();

                        date.setDate(date.getDate() - date.getDay() + dayofweek);
                        weekdays.push(date);
                    }

                    every.push(ZCS.util.formatRecurMsg(ZtMsg.recurWeeklyEveryNumWeeksDate, [this.repeatCustomCount, weekdays]));
                }
                break;
            }
            case this.self.MONTHLY: {
                if (this.repeatCustomType === "S") {
                    var count = Number(this.repeatCustomCount),
                        date = Number(this.repeatMonthlyDayList[0]);

                    every.push(ZCS.util.formatRecurMsg(ZtMsg.recurMonthlyEveryNumMonthsDate, [date, count]));
                }
                else {
                    var ordinal = Number(this.repeatCustomOrdinal);
                    bysetpos = Number(this.repeatBySetPos),
                        dayofweek = ZCS.util.indexOf(this.self.SERVER_WEEK_DAYS, this.repeatCustomDayOfWeek),
                        day = new Date(),
                        count = Number(this.repeatCustomCount),
                        days = (this.repeatCustomDays && this.repeatCustomDays.join(",")) || null,
                        workWeekDays = this.self.SERVER_WEEK_DAYS.slice(1,6).join(","),
                        weekEndDays = [this.self.SERVER_WEEK_DAYS[this.self.SUNDAY], this.self.SERVER_WEEK_DAYS[this.self.SATURDAY]].join(",");

                    day.setDate(day.getDate() - day.getDay() + dayofweek);

                    //if both values are present and unequal give preference to repeatBySetPos
                    if (this.repeatCustomOrdinal !== null &&
                        this.repeatBySetPos !== null &&
                        this.repeatCustomOrdinal !== this.repeatBySetPos) {
                        this.repeatCustomOrdinal = this.repeatBySetPos;
                    }

                    if ((this.self.SERVER_WEEK_DAYS.join(",") === days) || (workWeekDays === days) || (weekEndDays === days)) {
                        var dayType = -1;

                        if (workWeekDays === days) {
                            dayType = 1;
                        }
                        else if (weekEndDays === days) {
                            dayType = 0;
                        }

                        every.push(ZCS.util.formatRecurMsg(ZtMsg.recurMonthlyEveryNumMonthsWeekDays, [bysetpos || ordinal, dayType, count]));
                    }
                    else {
                        var day = new Date();
                        day.setDate(day.getDate() - day.getDay() + dayofweek);

                        every.push(ZCS.util.formatRecurMsg(ZtMsg.recurMonthlyEveryNumMonthsNumDay, [bysetpos || ordinal, day, count]));
                    }
                }
                break;
            }
            case this.self.YEARLY: {
                if (this.repeatCustomType === "S") {
                    var month = new Date(),
                        day = Number(this.repeatCustomMonthDay || this.startDate.getDate());

                    month.setMonth(Number(this.repeatYearlyMonthsList) - 1);
                    every.push(ZCS.util.formatRecurMsg(ZtMsg.recurYearlyEveryDate, [month, day]));
                }
                else {
                    var ordinal = Number(this.repeatCustomOrdinal),
                        bysetpos = Number(this.repeatBySetPos),
                        dayofweek = ZCS.util.indexOf(this.self.SERVER_WEEK_DAYS, this.repeatCustomDayOfWeek),
                        month = new Date(),
                        days = (this.repeatCustomDays && this.repeatCustomDays.join(",")) || null,
                        workWeekDays = this.self.SERVER_WEEK_DAYS.slice(1,6).join(","),
                        weekEndDays = [this.self.SERVER_WEEK_DAYS[this.self.SUNDAY], this.self.SERVER_WEEK_DAYS[this.self.SATURDAY]].join(",");

                    month.setMonth(Number(this.repeatYearlyMonthsList)-1);

                    if ((this.self.SERVER_WEEK_DAYS.join(",") === days) || (workWeekDays === days) || (weekEndDays === days)) {
                        var dayType = -1;

                        if (workWeekDays === days) {
                            dayType = 1;
                        }
                        else if (weekEndDays === days) {
                            dayType = 0;
                        }

                        every.push(ZCS.util.formatRecurMsg(ZtMsg.recurYearlyEveryMonthWeekDays, [bysetpos || ordinal, dayType, month]));
                    }
                    else {
                        var day = new Date();
                        day.setDate(day.getDate() - day.getDay() + dayofweek);

                        every.push(ZCS.util.formatRecurMsg(ZtMsg.recurYearlyEveryMonthNumDay, [bysetpos || ordinal, day, month]));
                    }
                }
                break;
            }
        }

        // Start & end strings
        var start = [],
            end = [];

        start.push(ZCS.util.formatRecurMsg(ZtMsg.recurStart, this.startDate));

        switch (this.repeatEndType) {
            case "N": {
                end.push(ZtMsg.recurEndNone);
                break;
            }
            case "A": {
                end.push(ZCS.util.formatRecurMsg(ZtMsg.recurEndNumber, this.repeatEndCount));
                break;
            }
            case "D": {
                end.push(ZCS.util.formatRecurMsg(ZtMsg.recurEndByDate, this.repeatEndDate));
                break;
            }
        }

        return Ext.String.format(ZtMsg.recurBlurb, every.join(""), start.join(""), end.join(""));
    },

    /**
     * Sets up recurrence rules.
     *
     * @param {Object} recurRules
     * @return {void}
     */
    setRecurrenceRules: function(recurRules) {
        if (recurRules) {
            this.parse(recurRules);
        }

        if (this.repeatWeeklyDays === null) {
            this.repeatWeeklyDays = [this.self.SERVER_WEEK_DAYS[this.startDate.getDay()]];
        }

        if (this.repeatMonthlyDayList === null) {
            this.repeatMonthlyDayList = [this.startDate.getDate()];
        }
    },

    /**
     * Parses recurrence rules.
     *
     * @param {Object} recurRules
     * @return {void}
     */
    parse: function(recurRules) {
        this.repeatWeeklyDays = [];

        var k,
            recurRulesLen = recurRules.length;

        for (k = 0; k < recurRulesLen; ++k) {
            var adds = recurRules[k].add;

            if (!adds) {
                continue;
            }

            this.repeatYearlyMonthsList = this.startDate.getMonth() + 1;
            for (var i = 0; i < adds.length; ++i) {
                var rules = adds[i].rule;

                if (!rules) {
                    continue;
                }

                for (var j = 0; j < rules.length; ++j) {
                    var rule = rules[j];

                    if (rule.freq) {
                        this.repeatType = rule.freq.substring(0,3);

                        if (rule.interval && rule.interval[0].ival) {
                            this.repeatCustomCount = parseInt(rule.interval[0].ival);
                            this.repeatCustom = 1;
                        }
                    }
                    if (rule.bymonth) {
                        this.repeatYearlyMonthsList = rule.bymonth[0].molist;
                        this.repeatCustom = 1;
                    }
                    if (rule.bymonthday) {
                        if (this.repeatType === this.self.YEARLY) {
                            this.repeatCustomMonthDay = rule.bymonthday[0].modaylist;
                            this.repeatCustomType = "S";
                        }
                        else if (this.repeatType === this.self.MONTHLY) {
                            this.repeatMonthlyDayList = rule.bymonthday[0].modaylist.split(",");
                        }
                        this.repeatCustom = 1;
                    }
                    if (rule.byday && rule.byday[0] && rule.byday[0].wkday) {
                        this.repeatCustom = 1;
                        var wkday = rule.byday[0].wkday;

                        if (this.repeatType === this.self.WEEKLY || (this.repeatType === this.self.DAILY && wkday.length === 5)) {
                            this.repeatWeekday = this.repeatType === this.self.DAILY;

                            for (var x = 0; x < wkday.length; ++x) {
                                this.repeatWeeklyDays.push(wkday[x].day);
                            }
                        }
                        else {
                            this.repeatCustomDayOfWeek = wkday[0].day;
                            var days = [],
                                i,
                                weekDayLen = wkday.length;

                            for (i = 0; i < weekDayLen; i++) {
                                days.push(wkday[i].day);
                            }
                            this.repeatCustomDays = days;
                            this.repeatCustomOrdinal = wkday[0].ordwk;
                            this.repeatBySetPos  = (rule.bysetpos && (rule.bysetpos.length > 0)) ? rule.bysetpos[0].poslist : null;
                            //ical sends only ordwk in recurrence rule, we follow outlook behavior in setting repeatbysetpos instead of ordwk
                            if (this.repeatBySetPos === null && this.repeatCustomOrdinal) {
                                this.repeatBySetPos  = this.repeatCustomOrdinal;
                            }
                            this.repeatCustomType = "O";
                        }
                    }
                    if (rule.until) {
                        this.repeatEndType = "D";
                        this.repeatEndDate = ZCS.util.parseServerDateTime(rule.until[0].d);
                    }
                    else if (rule.count) {
                        this.repeatEndType = "A";
                        this.repeatEndCount = rule.count[0].num;
                    }
                }
            }
        }
    }
});