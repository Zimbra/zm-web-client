/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2012, 2013 VMware, Inc.
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
 * This class represents timezone information.
 * @adapts AjxTimezone
 *
 * @author Ajinkya Chhatre <achhatre@zimbra.com>
 */

Ext.define('ZCS.common.ZtTimezone', {

    singleton: true,

    alternateClassName: 'ZCS.timezone',

    statics: {
        AUTO_DETECTED: "Auto-Detected"
    },

    /**
     * @adapts AjxTimezone.addWkDayTransition
     */
    addWkDayTransition: function(onset) {
        var trans = onset.trans,
            mon = trans[1],
            monDay = trans[2],
            week = Math.floor((monDay - 1) / 7),
            date = new Date(trans[0], trans[1] - 1, trans[2], 12, 0, 0);

        // NOTE: This creates a date of the *last* day of specified month by
        //       setting the month to *next* month and setting day of month
        //       to zero (i.e. the day *before* the first day).
        var count = new Date(new Date(date.getTime()).setMonth(mon - 1, 0)).getDate(),
            last = count - monDay < 7;

        // set onset values
        onset.mon =  mon;
        onset.week = last ? -1 : week + 1;
        onset.wkday = date.getDay() + 1;
        onset.hour = trans[3];
        onset.min = trans[4];
        onset.sec = trans[5];

        return onset;
    },

    /**
     * @adapts AjxTimezone.getServerId
     */
    getServerId: function(clientId) {
        return ZCS.constant.CLIENT_2_SERVER[clientId] || clientId;
    },

    /**
     * @adapts AjxTimezone.getClientId
     */
    getClientId: function(serverId) {
        return ZCS.constant.SERVER_2_CLIENT[serverId] || serverId;
    },

    /**
     * @adapts AjxTimezone.getShortName
     */
    getShortName: function(clientId) {
        var rule = this.getRule(clientId);

        if (rule && rule.shortName) {
            return rule.shortName;
        }

        var generatedShortName = ["GMT", ZCS.constant.SHORT_NAMES[clientId]].join("");

        if (rule) {
            rule.shortName = generatedShortName;
        }

        return generatedShortName;
    },

    /**
     * @adapts AjxTimezone.getMediumName
     */
    getMediumName: function(clientId) {
        var rule = this.getRule(clientId);

        if (rule && rule.mediumName) {
            return rule.mediumName;
        }

        var generatedMediumName = ZtMsg[clientId] || ['(', this.getShortName(clientId),') ', clientId].join("");

        if (rule) {
            rule.mediumName = generatedMediumName;
        }

        return generatedMediumName;
    },

    /**
     * @adapts AjxTimezone.addRule
     */
    addRule: function(rule) {
        var serverId = rule.serverId,
            clientId = rule.clientId;

        ZCS.constant.CLIENT_2_SERVER[clientId] = serverId;

        ZCS.constant.SERVER_2_CLIENT[serverId] = clientId;

        ZCS.constant.SHORT_NAMES[clientId] = this.generateShortName(rule.standard.offset);

        ZCS.constant.CLIENT_2_RULE[clientId] = rule;

        var array = rule.daylight ? ZCS.constant.DAYLIGHT_RULES : ZCS.constant.STANDARD_RULES;

        array.push(rule);
    },

    /**
     * @adapts AjxTimezone.getRule
     */
    getRule: function(clientId, tz) {
        var rule = ZCS.constant.CLIENT_2_RULE[clientId];

        if (!rule) {
            // try to find the rule treating the clientId as the serverId
            clientId = ZCS.constant.SERVER_2_CLIENT[clientId];

            rule = ZCS.constant.CLIENT_2_RULE[clientId];
        }

        if (!rule && tz) {
            var names = [ "standard", "daylight" ],
                rules = tz.daylight ? ZCS.constant.DAYLIGHT_RULES : ZCS.constant.STANDARD_RULES,
                i, j;

            for (i = 0; i < rules.length; i++) {
                rule = rules[i];

                var found = true;
                for (j = 0; j < names.length; j++) {
                    var name = names[j],
                        onset = rule[name];

                    if (!onset) {
                        continue;
                    }

                    var breakOuter = false;

                    for (var p in tz[name]) {
                        if (tz[name][p] != onset[p]) {
                            found = false;
                            breakOuter = true;
                            break;
                        }
                    }

                    if (breakOuter){
                        break;
                    }
                }
                if (found) {
                    return rule;
                }
            }
            return null;
        }

        return rule;
    },

    /**
     * @adapts AjxTimezone._BY_OFFSET
     */
    byOffset: function(arule, brule) {
        // sort by offset and then by name
        var delta = arule.standard.offset - brule.standard.offset;

        if (delta == 0) {
            var aname = arule.serverId,
                bname = brule.serverId;

            if (aname < bname) {
                delta = -1;
            }
            else if (aname > bname) {
                delta = 1;
            }
        }

        return delta;
    },

    /**
     * @adapts AjxTimezone._guessMachineTimezone
     */
    guessMachineTimezone: function(timezonePreference) {
        var dec1 = new Date(ZCSTimezoneData.TRANSITION_YEAR, 11, 1, 0, 0, 0),
            jun1 = new Date(ZCSTimezoneData.TRANSITION_YEAR, 5, 1, 0, 0, 0),
            dec1offset = -dec1.getTimezoneOffset(),
            jun1offset = -jun1.getTimezoneOffset();
            matchingRules = [],
            matchingRulesMap = {},
            offsetMatchingRules = [],
            daylightMatchingFound = false;

        this.MATCHING_RULES = [];
        this.TIMEZONE_CONFLICT = false;

        // if the offset for jun is the same as the offset in december,
        // then we have a timezone that doesn't deal with daylight savings.
        if (jun1offset == dec1offset) {
            var rules = ZCS.constant.STANDARD_RULES;

            for (var i = 0, ruleLen = rules.length; i < rules.length ; ++i ) {
                var rule = rules[i];

                if (rule.standard.offset == jun1offset) {

                    if (!matchingRulesMap[rule.serverId]) {
                        matchingRules.push(rule);
                        matchingRulesMap[rule.serverId] = true;
                    }
                    this.MATCHING_RULES.push(rule);
                }
            }
        }

        // we need to find a rule that matches both offsets
        else {
            var rules = ZCS.constant.DAYLIGHT_RULES,
                dst = Math.max(dec1offset, jun1offset),
                std = Math.min(dec1offset, jun1offset),
                now = new Date(),
                currentOffset = -now.getTimezoneOffset(),
                i;

            for (i = 0; i < rules.length ; ++i ) {
                var rule = rules[i];

                if (rule.standard.offset == std && rule.daylight.offset == dst) {
                    var strans = rule.standard.trans,
                        dtrans = rule.daylight.trans,
                        s0 = new Date(strans[0], strans[1]-1, strans[2]-1),
                        s1 = new Date(strans[0], strans[1]-1, strans[2]+2),
                        d0 = new Date(dtrans[0], dtrans[1]-1, dtrans[2]-1),
                        d1 = new Date(dtrans[0], dtrans[1]-1, dtrans[2]+2);

                    if (-s1.getTimezoneOffset() == std && -d1.getTimezoneOffset() == dst &&
                        -s0.getTimezoneOffset() == dst && -d0.getTimezoneOffset() == std) {
                        if (!matchingRulesMap[rule.serverId]) {
                            matchingRules.push(rule);
                            matchingRulesMap[rule.serverId] = true;
                        }

                        daylightMatchingFound = true;
                    }
                }
                //used for conflict resolution when server rules are wrong
                if (rule.standard.offset == currentOffset || rule.daylight.offset == currentOffset) {
                    this.MATCHING_RULES.push(rule);
                }
            }
        }

        //when there is a timezone conflict use the preference to find better match
        if ((matchingRules.length > 0) && timezonePreference != null) {
            var rules = matchingRules;

            for (var i in rules) {
                if (rules[i].serverId == timezonePreference) {
                    return rules[i];
                }
            }
        }

        if (matchingRules.length > 0) {
            // resolve conflict, if possible
            if (matchingRules.length > 1) {
                matchingRules.sort(this.byScore);

                if (matchingRules[0].score != matchingRules[1].score) {
                    matchingRules.length = 1;
                }
            }

            // mark if conflict and return best guess
            this.TIMEZONE_CONFLICT = (matchingRules.length > 1);

            return matchingRules[0];
        }

        if ((this.MATCHING_RULES.length > 0) && timezonePreference != null) {
            var rules = this.MATCHING_RULES;

            for (var i in rules) {
                if (rules[i].serverId == timezonePreference) {
                    return rules[i];
                }
            }
        }

        // generate default rule
        return this.generateDefaultRule();
    },

    /**
     * @adapts AjxTimezone.__BY_SCORE
     */
    byScore: function(a, b) {
        return b.score - a.score;
    },

    /**
     * @adapts AjxTimezone._generateDefaultRule
     */
    generateDefaultRule: function() {
        var byMonth = 0,
            byDate = 1,
            byHour = 2,
            byMinute = 3,
            bySecond = 4;

        // Sweep the range between d1 and d2 looking for DST transitions.
        // Iterate the range by "by" unit.  When a transition is detected,
        // sweep the range between before/after dates by increasingly
        // smaller unit, month then date then hour then minute then finally second.
        function sweepRange(d1, d2, by, rule) {
            var upperBound = d2.getTime(),
                d = new Date(),
                prevD = new Date(),
                prevOffset = d1.getTimezoneOffset() * -1;

            d.setTime(d1.getTime());

            prevD.setTime(d.getTime());


            // initialize rule
            if (!rule) {
                rule = {
                    clientId: ZCS.timezone.AUTO_DETECTED,
                    autoDetected: true
                };
            }

            // perform sweep
            while (d.getTime() <= upperBound) {
                // Increment by the right unit.
                if (by == byMonth) {
                    d.setUTCMonth(d.getUTCMonth() + 1);
                }
                else if (by == byDate) {
                    d.setUTCDate(d.getUTCDate() + 1);
                }
                else if (by == byHour) {
                    d.setUTCHours(d.getUTCHours() + 1);
                }
                else if (by == byMinute) {
                    d.setUTCMinutes(d.getUTCMinutes() + 1);
                }
                else if (by == bySecond) {
                    d.setUTCSeconds(d.getUTCSeconds() + 1);
                }
                else {
                    return rule;
                }

                var offset = d.getTimezoneOffset() * -1;

                if (offset != prevOffset) {
                    if (by < bySecond) {
                        // Drill down.
                        rule = sweepRange(prevD, d, by + 1, rule);
                    }
                    else {
                        // Tricky:
                        // Initialize a Date object whose UTC fields are set to prevD's local fields.
                        // Then add 1 second to get UTC version of onset time.  We want to work in UTC
                        // to prevent the date object from experiencing the DST jump when we add 1 second.
                        var trans = new Date();

                        trans.setUTCFullYear(prevD.getFullYear(), prevD.getMonth(), prevD.getDate());

                        trans.setUTCHours(prevD.getHours(), prevD.getMinutes(),     prevD.getSeconds() + 1);

                        var onset = rule[prevOffset < offset ? "daylight" : "standard"] = {
                            offset: offset,

                            trans: [
                                trans.getUTCFullYear(), trans.getUTCMonth() + 1, trans.getUTCDate(),    // yyyy-MM-dd
                                trans.getUTCHours(),    trans.getUTCMinutes(),   trans.getUTCSeconds()  //   HH:mm:ss
                            ]
                        };

                        this.addWkDayTransition(onset);

                        return rule;
                    }
                }

                prevD.setTime(d.getTime());
                prevOffset = offset;
            }

            return rule;
        }

        // Find DST transitions between yyyy/07/71 00:00:00 and yyyy+1/06/30 23:59:59.
        // We can detect transition on/around 12/31 and 01/01.  Assume no one will
        // transition on/around 6/30 and 07/01.
        var d1 = new Date(),
            d2 = new Date();

        // set sweep start to yesterday
        var year = d1.getFullYear();
        d1.setUTCFullYear(year, d1.getMonth(), d1.getDate() - 1);
        d1.setUTCHours(0, 0, 0, 0);

        // set sweep end to tomorrow + 1 year
        d2.setTime(d1.getTime());
        d2.setUTCFullYear(year + 1, d1.getMonth(), d1.getDate() + 1);

        // case 1: no onset returned -> TZ doesn't use DST
        // case 2: two onsets returned -> TZ uses DST
        // case 3: only one onset returned -> mid-year policy change -> simplify and assume it's non-DST
        // case 4: three or more onsets returned -> shouldn't happen
        var rule = sweepRange(d1, d2, byMonth);

        // handle case 1 and 3
        if (!rule.daylight || !rule.standard) {
            rule.standard = { offset: d1.getTimezoneOffset() * -1 };

            delete rule.daylight;
        }

        // now that standard offset is determined, set serverId
        rule.serverId = ["(GMT",this.generateShortName(rule.standard.offset, true),") ", ZCS.timezone.AUTO_DETECTED].join("");

        // bug 33800: guard against inverted daylight/standard onsets
        if (rule.daylight && rule.daylight.offset < rule.standard.offset) {
            var onset = rule.daylight;

            rule.daylight = rule.standard;

            rule.standard = onset;
        }

        return rule;
    },

    /**
     * @adapts AjxTimezone._generateShortName
     */
    generateShortName: function(offset, period) {
        if (offset == 0) {
            return "";
        }

        var sign = offset < 0 ? "-" : "+",
            stdOffset = Math.abs(offset),
            hours = Math.floor(stdOffset / 60),
            minutes = stdOffset % 60;

        hours = hours < 10 ? '0' + hours : hours;

        minutes = minutes < 10 ? '0' + minutes : minutes;

        return [sign, hours, period ? "." : "", minutes].join("");
    }
},
    function() {
        //Timezone data object and the data
        //TODO: Get this data from servlet as per Conrad's suggestion

        /*
         * @adapts AjxTimezoneData
         */
        ZCSTimezoneData = {};

        ZCSTimezoneData.TRANSITION_YEAR = 2011;

        ZCSTimezoneData.TIMEZONE_RULES = [
            { serverId: "Etc/GMT+12", clientId: "Etc/GMT+12", score: 100,  standard: { offset: -720, tzname: "GMT+12" } },
            { serverId: "Pacific/Midway", clientId: "Pacific/Midway", score: 100,  standard: { offset: -660, tzname: "SST" } },
            { serverId: "Pacific/Honolulu", clientId: "Pacific/Honolulu", score: 200,  standard: { offset: -600, tzname: "HST" } },
            { serverId: "America/Anchorage", clientId: "America/Anchorage", score: 200,
                standard: { offset: -540, mon: 11, week: 1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 11, 6 ], tzname: "AKST" },
                daylight: { offset: -480, mon: 3, week: 2, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 3, 13 ], tzname: "AKDT" }
            },
            { serverId: "America/Los_Angeles", clientId: "America/Los_Angeles", score: 200,
                standard: { offset: -480, mon: 11, week: 1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 11, 6 ], tzname: "PST" },
                daylight: { offset: -420, mon: 3, week: 2, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 3, 13 ], tzname: "PDT" }
            },
            { serverId: "America/Tijuana", clientId: "America/Tijuana", score: 100,
                standard: { offset: -480, mon: 10, week: -1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 10, 30 ], tzname: "PST" },
                daylight: { offset: -420, mon: 4, week: 1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 4, 3 ], tzname: "PDT" }
            },
            { serverId: "America/Chihuahua", clientId: "America/Chihuahua", score: 100,
                standard: { offset: -420, mon: 10, week: -1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 10, 30 ], tzname: "MST" },
                daylight: { offset: -360, mon: 4, week: 1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 4, 3 ], tzname: "MDT" }
            },
            { serverId: "America/Denver", clientId: "America/Denver", score: 200,
                standard: { offset: -420, mon: 11, week: 1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 11, 6 ], tzname: "MST" },
                daylight: { offset: -360, mon: 3, week: 2, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 3, 13 ], tzname: "MDT" }
            },
            { serverId: "America/Phoenix", clientId: "America/Phoenix", score: 200,  standard: { offset: -420, tzname: "MST" } },
            { serverId: "America/Chicago", clientId: "America/Chicago", score: 200,
                standard: { offset: -360, mon: 11, week: 1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 11, 6 ], tzname: "CST" },
                daylight: { offset: -300, mon: 3, week: 2, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 3, 13 ], tzname: "CDT" }
            },
            { serverId: "America/Guatemala", clientId: "America/Guatemala", score: 100,  standard: { offset: -360 } },
            { serverId: "America/Mexico_City", clientId: "America/Mexico_City", score: 100,
                standard: { offset: -360, mon: 10, week: -1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 10, 30 ], tzname: "CST" },
                daylight: { offset: -300, mon: 4, week: 1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 4, 3 ], tzname: "CDT" }
            },
            { serverId: "America/Regina", clientId: "America/Regina", score: 200,  standard: { offset: -360, tzname: "CST" } },
            { serverId: "America/Bogota", clientId: "America/Bogota", score: 100,  standard: { offset: -300 } },
            { serverId: "America/Indiana/Indianapolis", clientId: "America/Indiana/Indianapolis", score: 100,
                standard: { offset: -300, mon: 11, week: 1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 11, 6 ], tzname: "EST" },
                daylight: { offset: -240, mon: 3, week: 2, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 3, 13 ], tzname: "EDT" }
            },
            { serverId: "America/New_York", clientId: "America/New_York", score: 200,
                standard: { offset: -300, mon: 11, week: 1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 11, 6 ], tzname: "EST" },
                daylight: { offset: -240, mon: 3, week: 2, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 3, 13 ], tzname: "EDT" }
            },
            { serverId: "America/Caracas", clientId: "America/Caracas", score: 100,  standard: { offset: -270, tzname: "VET" } },
            { serverId: "America/Asuncion", clientId: "America/Asuncion", score: 100,
                standard: { offset: -240, mon: 4, week: 2, wkday: 1, hour: 0, min: 0, sec: 0, trans: [ 2011, 4, 10 ], tzname: "PYT" },
                daylight: { offset: -180, mon: 10, week: 1, wkday: 1, hour: 0, min: 0, sec: 0, trans: [ 2011, 10, 2 ], tzname: "PYST" }
            },
            { serverId: "America/Cuiaba", clientId: "America/Cuiaba", score: 100,
                standard: { offset: -240, mon: 2, week: 3, wkday: 1, hour: 0, min: 0, sec: 0, trans: [ 2011, 2, 20 ], tzname: "AMT" },
                daylight: { offset: -180, mon: 10, week: 3, wkday: 1, hour: 0, min: 0, sec: 0, trans: [ 2011, 10, 16 ], tzname: "AMST" }
            },
            { serverId: "America/Guyana", clientId: "America/Guyana", score: 100,  standard: { offset: -240, tzname: "GYT" } },
            { serverId: "America/Halifax", clientId: "America/Halifax", score: 100,
                standard: { offset: -240, mon: 11, week: 1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 11, 6 ], tzname: "AST" },
                daylight: { offset: -180, mon: 3, week: 2, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 3, 13 ], tzname: "ADT" }
            },
            { serverId: "America/Santiago", clientId: "America/Santiago", score: 100,
                standard: { offset: -240, mon: 4, week: 1, wkday: 1, hour: 0, min: 0, sec: 0, trans: [ 2011, 4, 3 ], tzname: "CLT" },
                daylight: { offset: -180, mon: 10, week: 2, wkday: 1, hour: 0, min: 0, sec: 0, trans: [ 2011, 10, 9 ], tzname: "CLST" }
            },
            { serverId: "America/St_Johns", clientId: "America/St_Johns", score: 100,
                standard: { offset: -210, mon: 11, week: 1, wkday: 1, hour: 0, min: 1, sec: 0, trans: [ 2011, 11, 6 ], tzname: "NST" },
                daylight: { offset: -150, mon: 3, week: 2, wkday: 1, hour: 0, min: 1, sec: 0, trans: [ 2011, 3, 13 ], tzname: "NDT" }
            },
            { serverId: "America/Argentina/Buenos_Aires", clientId: "America/Argentina/Buenos_Aires", score: 100,  standard: { offset: -180 } },
            { serverId: "America/Cayenne", clientId: "America/Cayenne", score: 100,  standard: { offset: -180, tzname: "GFT" } },
            { serverId: "America/Godthab", clientId: "America/Godthab", score: 100,
                standard: { offset: -180, mon: 10, week: -1, wkday: 1, hour: 1, min: 0, sec: 0, trans: [ 2011, 10, 30 ], tzname: "WGT" },
                daylight: { offset: -120, mon: 3, week: -1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 3, 27 ], tzname: "WGST" }
            },
            { serverId: "America/Montevideo", clientId: "America/Montevideo", score: 100,
                standard: { offset: -180, mon: 3, week: 2, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 3, 13 ], tzname: "UYT" },
                daylight: { offset: -120, mon: 10, week: 1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 10, 2 ], tzname: "UYST" }
            },
            { serverId: "America/Sao_Paulo", clientId: "America/Sao_Paulo", score: 100,
                standard: { offset: -180, mon: 2, week: 3, wkday: 1, hour: 0, min: 0, sec: 0, trans: [ 2011, 2, 20 ], tzname: "BRT" },
                daylight: { offset: -120, mon: 10, week: 3, wkday: 1, hour: 0, min: 0, sec: 0, trans: [ 2011, 10, 16 ], tzname: "BRST" }
            },
            { serverId: "Atlantic/South_Georgia", clientId: "Atlantic/South_Georgia", score: 100,  standard: { offset: -120, tzname: "GST" } },
            { serverId: "Atlantic/Azores", clientId: "Atlantic/Azores", score: 100,
                standard: { offset: -60, mon: 10, week: -1, wkday: 1, hour: 1, min: 0, sec: 0, trans: [ 2011, 10, 30 ], tzname: "AZOT" },
                daylight: { offset: 0, mon: 3, week: -1, wkday: 1, hour: 0, min: 0, sec: 0, trans: [ 2011, 3, 27 ], tzname: "AZOST" }
            },
            { serverId: "Atlantic/Cape_Verde", clientId: "Atlantic/Cape_Verde", score: 100,  standard: { offset: -60, tzname: "CVT" } },
            { serverId: "Africa/Casablanca", clientId: "Africa/Casablanca", score: 100,
                standard: { offset: 0, mon: 8, week: 2, wkday: 1, hour: 0, min: 0, sec: 0, trans: [ 2011, 8, 14 ], tzname: "WET" },
                daylight: { offset: 60, mon: 5, week: 1, wkday: 1, hour: 0, min: 0, sec: 0, trans: [ 2011, 5, 1 ], tzname: "WEST" }
            },
            { serverId: "Africa/Monrovia", clientId: "Africa/Monrovia", score: 100,  standard: { offset: 0, tzname: "GMT" } },
            { serverId: "Europe/London", clientId: "Europe/London", score: 100,
                standard: { offset: 0, mon: 10, week: -1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 10, 30 ], tzname: "GMT/BST" },
                daylight: { offset: 60, mon: 3, week: -1, wkday: 1, hour: 1, min: 0, sec: 0, trans: [ 2011, 3, 27 ], tzname: "GMT/BST" }
            },
            { serverId: "UTC", clientId: "UTC", score: 100,  standard: { offset: 0, tzname: "UTC" } },
            { serverId: "Africa/Algiers", clientId: "Africa/Algiers", score: 100,  standard: { offset: 60, tzname: "CET" } },
            { serverId: "Africa/Windhoek", clientId: "Africa/Windhoek", score: 100,
                standard: { offset: 60, mon: 4, week: 1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 4, 3 ], tzname: "WAT" },
                daylight: { offset: 120, mon: 9, week: 1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 9, 4 ], tzname: "WAST" }
            },
            { serverId: "Europe/Belgrade", clientId: "Europe/Belgrade", score: 100,
                standard: { offset: 60, mon: 10, week: -1, wkday: 1, hour: 3, min: 0, sec: 0, trans: [ 2011, 10, 30 ], tzname: "CET" },
                daylight: { offset: 120, mon: 3, week: -1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 3, 27 ], tzname: "CEST" }
            },
            { serverId: "Europe/Berlin", clientId: "Europe/Berlin", score: 200,
                standard: { offset: 60, mon: 10, week: -1, wkday: 1, hour: 3, min: 0, sec: 0, trans: [ 2011, 10, 30 ], tzname: "CET" },
                daylight: { offset: 120, mon: 3, week: -1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 3, 27 ], tzname: "CEST" }
            },
            { serverId: "Europe/Brussels", clientId: "Europe/Brussels", score: 100,
                standard: { offset: 60, mon: 10, week: -1, wkday: 1, hour: 3, min: 0, sec: 0, trans: [ 2011, 10, 30 ], tzname: "CET" },
                daylight: { offset: 120, mon: 3, week: -1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 3, 27 ], tzname: "CEST" }
            },
            { serverId: "Europe/Warsaw", clientId: "Europe/Warsaw", score: 100,
                standard: { offset: 60, mon: 10, week: -1, wkday: 1, hour: 3, min: 0, sec: 0, trans: [ 2011, 10, 30 ], tzname: "CET" },
                daylight: { offset: 120, mon: 3, week: -1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 3, 27 ], tzname: "CEST" }
            },
            { serverId: "Africa/Cairo", clientId: "Africa/Cairo", score: 100,
                standard: { offset: 120, mon: 9, week: -1, wkday: 5, hour: 0, min: 0, sec: 0, trans: [ 2011, 9, 29 ], tzname: "EET" },
                daylight: { offset: 180, mon: 4, week: -1, wkday: 6, hour: 0, min: 0, sec: 0, trans: [ 2011, 4, 29 ], tzname: "EEST" }
            },
            { serverId: "Africa/Harare", clientId: "Africa/Harare", score: 100,  standard: { offset: 120, tzname: "CAT" } },
            { serverId: "Asia/Amman", clientId: "Asia/Amman", score: 100,
                standard: { offset: 120, mon: 10, week: -1, wkday: 6, hour: 1, min: 0, sec: 0, trans: [ 2011, 10, 28 ], tzname: "EET" },
                daylight: { offset: 180, mon: 3, week: -1, wkday: 5, hour: 23, min: 59, sec: 59, trans: [ 2011, 3, 31 ], tzname: "EEST" }
            },
            { serverId: "Asia/Beirut", clientId: "Asia/Beirut", score: 100,
                standard: { offset: 120, mon: 10, week: -1, wkday: 1, hour: 0, min: 0, sec: 0, trans: [ 2011, 10, 30 ], tzname: "EET" },
                daylight: { offset: 180, mon: 3, week: -1, wkday: 1, hour: 0, min: 0, sec: 0, trans: [ 2011, 3, 27 ], tzname: "EEST" }
            },
            { serverId: "Asia/Jerusalem", clientId: "Asia/Jerusalem", score: 100,
                standard: { offset: 120, mon: 9, week: 2, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 9, 11 ], tzname: "IST" },
                daylight: { offset: 180, mon: 3, week: -1, wkday: 6, hour: 2, min: 0, sec: 0, trans: [ 2011, 3, 25 ], tzname: "IDT" }
            },
            { serverId: "Europe/Athens", clientId: "Europe/Athens", score: 200,
                standard: { offset: 120, mon: 10, week: -1, wkday: 1, hour: 4, min: 0, sec: 0, trans: [ 2011, 10, 30 ], tzname: "EET" },
                daylight: { offset: 180, mon: 3, week: -1, wkday: 1, hour: 3, min: 0, sec: 0, trans: [ 2011, 3, 27 ], tzname: "EEST" }
            },
            { serverId: "Europe/Helsinki", clientId: "Europe/Helsinki", score: 100,
                standard: { offset: 120, mon: 10, week: -1, wkday: 1, hour: 4, min: 0, sec: 0, trans: [ 2011, 10, 30 ], tzname: "EET" },
                daylight: { offset: 180, mon: 3, week: -1, wkday: 1, hour: 3, min: 0, sec: 0, trans: [ 2011, 3, 27 ], tzname: "EEST" }
            },
            { serverId: "Europe/Minsk", clientId: "Europe/Minsk", score: 100,
                standard: { offset: 120, mon: 10, week: -1, wkday: 1, hour: 3, min: 0, sec: 0, trans: [ 2011, 10, 30 ], tzname: "EET" },
                daylight: { offset: 180, mon: 3, week: -1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 3, 27 ], tzname: "EEST" }
            },
            { serverId: "Africa/Nairobi", clientId: "Africa/Nairobi", score: 200,  standard: { offset: 180, tzname: "EAT" } },
            { serverId: "Asia/Baghdad", clientId: "Asia/Baghdad", score: 100,  standard: { offset: 180 } },
            { serverId: "Asia/Kuwait", clientId: "Asia/Kuwait", score: 100,  standard: { offset: 180, tzname: "AST" } },
            { serverId: "Europe/Moscow", clientId: "Europe/Moscow", score: 100,
                standard: { offset: 180, mon: 10, week: -1, wkday: 1, hour: 3, min: 0, sec: 0, trans: [ 2011, 10, 30 ], tzname: "MSK/MSD" },
                daylight: { offset: 240, mon: 3, week: -1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 3, 27 ], tzname: "MSK/MSD" }
            },
            { serverId: "Asia/Tehran", clientId: "Asia/Tehran", score: 100,
                standard: { offset: 210, mon: 9, week: 4, wkday: 4, hour: 0, min: 0, sec: 0, trans: [ 2011, 9, 28 ], tzname: "IRST" },
                daylight: { offset: 270, mon: 3, week: 4, wkday: 2, hour: 0, min: 0, sec: 0, trans: [ 2011, 3, 28 ], tzname: "IRDT" }
            },
            { serverId: "Asia/Baku", clientId: "Asia/Baku", score: 100,
                standard: { offset: 240, mon: 10, week: -1, wkday: 1, hour: 5, min: 0, sec: 0, trans: [ 2011, 10, 30 ], tzname: "AZT" },
                daylight: { offset: 300, mon: 3, week: -1, wkday: 1, hour: 4, min: 0, sec: 0, trans: [ 2011, 3, 27 ], tzname: "AZST" }
            },
            { serverId: "Asia/Muscat", clientId: "Asia/Muscat", score: 100,  standard: { offset: 240, tzname: "GST" } },
            { serverId: "Asia/Tbilisi", clientId: "Asia/Tbilisi", score: 200,  standard: { offset: 240, tzname: "GET" } },
            { serverId: "Asia/Yerevan", clientId: "Asia/Yerevan", score: 100,
                standard: { offset: 240, mon: 10, week: -1, wkday: 1, hour: 3, min: 0, sec: 0, trans: [ 2011, 10, 30 ], tzname: "AMT" },
                daylight: { offset: 300, mon: 3, week: -1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 3, 27 ], tzname: "AMST" }
            },
            { serverId: "Indian/Mauritius", clientId: "Indian/Mauritius", score: 100,  standard: { offset: 240 } },
            { serverId: "Asia/Kabul", clientId: "Asia/Kabul", score: 100,  standard: { offset: 270, tzname: "AFT" } },
            { serverId: "Asia/Karachi", clientId: "Asia/Karachi", score: 200,  standard: { offset: 300 } },
            { serverId: "Asia/Tashkent", clientId: "Asia/Tashkent", score: 100,  standard: { offset: 300, tzname: "UZT" } },
            { serverId: "Asia/Yekaterinburg", clientId: "Asia/Yekaterinburg", score: 100,
                standard: { offset: 300, mon: 10, week: -1, wkday: 1, hour: 3, min: 0, sec: 0, trans: [ 2011, 10, 30 ], tzname: "YEKT" },
                daylight: { offset: 360, mon: 3, week: -1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 3, 27 ], tzname: "YEKST" }
            },
            { serverId: "Asia/Colombo", clientId: "Asia/Colombo", score: 100,  standard: { offset: 330, tzname: "IST" } },
            { serverId: "Asia/Kolkata", clientId: "Asia/Kolkata", score: 200,  standard: { offset: 330, tzname: "IST" } },
            { serverId: "Asia/Almaty", clientId: "Asia/Almaty", score: 100,  standard: { offset: 360, tzname: "ALMT" } },
            { serverId: "Asia/Dhaka", clientId: "Asia/Dhaka", score: 100,  standard: { offset: 360 } },
            { serverId: "Asia/Novosibirsk", clientId: "Asia/Novosibirsk", score: 100,
                standard: { offset: 360, mon: 10, week: -1, wkday: 1, hour: 3, min: 0, sec: 0, trans: [ 2011, 10, 30 ], tzname: "NOVT" },
                daylight: { offset: 420, mon: 3, week: -1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 3, 27 ], tzname: "NOVST" }
            },
            { serverId: "Asia/Rangoon", clientId: "Asia/Rangoon", score: 100,  standard: { offset: 390, tzname: "MMT" } },
            { serverId: "Asia/Bangkok", clientId: "Asia/Bangkok", score: 100,  standard: { offset: 420, tzname: "ICT" } },
            { serverId: "Asia/Krasnoyarsk", clientId: "Asia/Krasnoyarsk", score: 100,
                standard: { offset: 420, mon: 10, week: -1, wkday: 1, hour: 3, min: 0, sec: 0, trans: [ 2011, 10, 30 ], tzname: "KRAT" },
                daylight: { offset: 480, mon: 3, week: -1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 3, 27 ], tzname: "KRAST" }
            },
            { serverId: "Asia/Hong_Kong", clientId: "Asia/Hong_Kong", score: 200,  standard: { offset: 480 } },
            { serverId: "Asia/Irkutsk", clientId: "Asia/Irkutsk", score: 100,
                standard: { offset: 480, mon: 10, week: -1, wkday: 1, hour: 3, min: 0, sec: 0, trans: [ 2011, 10, 30 ], tzname: "IRKT" },
                daylight: { offset: 540, mon: 3, week: -1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 3, 27 ], tzname: "IRKST" }
            },
            { serverId: "Asia/Kuala_Lumpur", clientId: "Asia/Kuala_Lumpur", score: 100,  standard: { offset: 480, tzname: "MYT" } },
            { serverId: "Asia/Taipei", clientId: "Asia/Taipei", score: 100,  standard: { offset: 480 } },
            { serverId: "Asia/Ulaanbaatar", clientId: "Asia/Ulaanbaatar", score: 100,  standard: { offset: 480 } },
            { serverId: "Australia/Perth", clientId: "Australia/Perth", score: 100,  standard: { offset: 480, tzname: "WST" } },
            { serverId: "Asia/Seoul", clientId: "Asia/Seoul", score: 100,  standard: { offset: 540 } },
            { serverId: "Asia/Tokyo", clientId: "Asia/Tokyo", score: 200,  standard: { offset: 540 } },
            { serverId: "Asia/Yakutsk", clientId: "Asia/Yakutsk", score: 100,
                standard: { offset: 540, mon: 10, week: -1, wkday: 1, hour: 3, min: 0, sec: 0, trans: [ 2011, 10, 30 ], tzname: "YAKT" },
                daylight: { offset: 600, mon: 3, week: -1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 3, 27 ], tzname: "YAKST" }
            },
            { serverId: "Australia/Adelaide", clientId: "Australia/Adelaide", score: 100,
                standard: { offset: 570, mon: 4, week: 1, wkday: 1, hour: 3, min: 0, sec: 0, trans: [ 2011, 4, 3 ], tzname: "CST" },
                daylight: { offset: 630, mon: 10, week: 1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 10, 2 ], tzname: "CST" }
            },
            { serverId: "Australia/Darwin", clientId: "Australia/Darwin", score: 100,  standard: { offset: 570, tzname: "CST" } },
            { serverId: "Asia/Vladivostok", clientId: "Asia/Vladivostok", score: 100,
                standard: { offset: 600, mon: 10, week: -1, wkday: 1, hour: 3, min: 0, sec: 0, trans: [ 2011, 10, 30 ], tzname: "VLAT" },
                daylight: { offset: 660, mon: 3, week: -1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 3, 27 ], tzname: "VLAST" }
            },
            { serverId: "Australia/Brisbane", clientId: "Australia/Brisbane", score: 200,  standard: { offset: 600, tzname: "EST" } },
            { serverId: "Australia/Hobart", clientId: "Australia/Hobart", score: 100,
                standard: { offset: 600, mon: 4, week: 1, wkday: 1, hour: 3, min: 0, sec: 0, trans: [ 2011, 4, 3 ], tzname: "EST" },
                daylight: { offset: 660, mon: 10, week: 1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 10, 2 ], tzname: "EST" }
            },
            { serverId: "Australia/Sydney", clientId: "Australia/Sydney", score: 200,
                standard: { offset: 600, mon: 4, week: 1, wkday: 1, hour: 3, min: 0, sec: 0, trans: [ 2011, 4, 3 ], tzname: "EST" },
                daylight: { offset: 660, mon: 10, week: 1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 10, 2 ], tzname: "EST" }
            },
            { serverId: "Pacific/Guam", clientId: "Pacific/Guam", score: 100,  standard: { offset: 600, tzname: "ChST" } },
            { serverId: "Asia/Magadan", clientId: "Asia/Magadan", score: 100,
                standard: { offset: 660, mon: 10, week: -1, wkday: 1, hour: 3, min: 0, sec: 0, trans: [ 2011, 10, 30 ], tzname: "MAGT" },
                daylight: { offset: 720, mon: 3, week: -1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 3, 27 ], tzname: "MAGST" }
            },
            { serverId: "Asia/Kamchatka", clientId: "Asia/Kamchatka", score: 100,
                standard: { offset: 720, mon: 10, week: -1, wkday: 1, hour: 3, min: 0, sec: 0, trans: [ 2011, 10, 30 ], tzname: "PETT" },
                daylight: { offset: 780, mon: 3, week: -1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 3, 27 ], tzname: "PETST" }
            },
            { serverId: "Pacific/Auckland", clientId: "Pacific/Auckland", score: 100,
                standard: { offset: 720, mon: 4, week: 1, wkday: 1, hour: 3, min: 0, sec: 0, trans: [ 2011, 4, 3 ], tzname: "NZST" },
                daylight: { offset: 780, mon: 9, week: -1, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 9, 25 ], tzname: "NZDT" }
            },
            { serverId: "Pacific/Fiji", clientId: "Pacific/Fiji", score: 100,
                standard: { offset: 720, mon: 3, week: -1, wkday: 1, hour: 3, min: 0, sec: 0, trans: [ 2011, 3, 27 ], tzname: "FJT" },
                daylight: { offset: 780, mon: 10, week: 4, wkday: 1, hour: 2, min: 0, sec: 0, trans: [ 2011, 10, 23 ], tzname: "FJST" }
            },
            { serverId: "Pacific/Tongatapu", clientId: "Pacific/Tongatapu", score: 100,  standard: { offset: 780 } }
        ];

        for (var i = 0; i < ZCSTimezoneData.TIMEZONE_RULES.length; i++) {
            var rule = ZCSTimezoneData.TIMEZONE_RULES[i],
                array = rule.daylight ? ZCS.constant.DAYLIGHT_RULES : ZCS.constant.STANDARD_RULES;

            if(array) {
                array.push(rule);
            }
        }

        ZCSTimezoneData.TIMEZONE_RULES.sort(ZCS.timezone.byOffset);

        for (var j = 0; j < ZCSTimezoneData.TIMEZONE_RULES.length; j++) {
            var rule = ZCSTimezoneData.TIMEZONE_RULES[j];

            this.addRule(rule);
        }
    }
);