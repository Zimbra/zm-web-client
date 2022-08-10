/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a recurrence object.
 * @class
 * This class represents a recurrence pattern.
 * 
 * @param	{ZmCalItem}	calItem		the calendar item
 * 
 */
ZmRecurrence = function(calItem) {
	this._startDate 			= (calItem && calItem.startDate) ? calItem.startDate : (new Date());

	// initialize all params (listed alphabetically)
	this.repeatCustom			= "0";  										// 1|0
	this.repeatCustomCount		= 1; 											// ival
	this.repeatCustomDayOfWeek	= "SU"; 										// (DAY|WEEKDAY|WEEKEND) | (SU|MO|TU|WE|TH|FR|SA)
	this.repeatBySetPos	= "1";
	this.repeatCustomMonthDay	= this._startDate.getDate();
	this.repeatCustomType		= "S"; 											// (S)pecific, (O)rdinal
	this.repeatEnd				= null;
	this.repeatEndCount			= 1; 											// maps to "count" (when there is no end date specified)
	this.repeatEndDate			= null; 										// maps to "until"
	this.repeatEndType			= "N";
	this.repeatMonthlyDayList	= null; 										// list of numbers representing days (usually, just one day)
	this.repeatType				= ZmRecurrence.NONE;							// maps to "freq"
	this.repeatWeekday			= false; 										// set to true if freq = "DAI" and custom repeats every weekday
	this.repeatWeeklyDays		= [];	 										// SU|MO|TU|WE|TH|FR|SA
	this.repeatYearlyMonthsList	= 1; 											// list of numbers representing months (usually, just one month)

    this._cancelRecurIds        = {};                                           //list of recurIds to be excluded
};

ZmRecurrence.prototype.toString =
function() {
	return "ZmRecurrence";
};

/**
 * Defines the "none" recurrence.
 */
ZmRecurrence.NONE		= "NON";
/**
 * Defines the "daily" recurrence.
 */
ZmRecurrence.DAILY		= "DAI";
/**
 * Defines the "weekly" recurrence.
 */
ZmRecurrence.WEEKLY		= "WEE";
/**
 * Defines the "monthly" recurrence.
 */
ZmRecurrence.MONTHLY	= "MON";
/**
 * Defines the "yearly" recurrence.
 */
ZmRecurrence.YEARLY		= "YEA";

/**
 * Defines the "day" week day selection.
 */
ZmRecurrence.RECURRENCE_DAY = -1;
/**
 * Defines the "weekend" week day selection.
 */
ZmRecurrence.RECURRENCE_WEEKEND = -2;
/**
 * Defines the "weekday" week day selection.
 */
ZmRecurrence.RECURRENCE_WEEKDAY = -3

ZmRecurrence.prototype.setJson =
function(inv) {
	if (this.repeatType == ZmRecurrence.NONE) {
        return;
    }

	var recur = inv.recur = {},
        add = recur.add = {},
        rule = add.rule = {},
        interval = rule.interval = {},
        until,
        bwd,
        bmd,
        c,
        i,
        day,
        wkDay,
        bysetpos,
        bm;

	rule.freq = this.repeatType;
	interval.ival = this.repeatCustomCount;

	if (this.repeatEndDate != null && this.repeatEndType == "D") {
		until = rule.until = {};
		until.d = AjxDateUtil.getServerDate(this.repeatEndDate);
	}
    else if (this.repeatEndType == "A"){
		c = rule.count = {};
		c.num = this.repeatEndCount;
	}

	if (this.repeatCustom != "1") {
        this.setExcludes(recur);
		return;
    }

	if (this.repeatType == ZmRecurrence.DAILY) {
        if (this.repeatWeekday) {
			// TODO: for now, handle "every weekday" as M-F
			//       eventually, needs to be localized work week days
			bwd = rule.byday = {};
            wkDay = bwd.wkday = [];
			for (i = 0; i < ZmCalItem.SERVER_WEEK_DAYS.length; i++) {
				day = ZmCalItem.SERVER_WEEK_DAYS[i];
				if (day == "SA" || day == "SU") {
					continue;
                }
				wkDay.push({
                    day : day
                });
			}
		}
	}
    else if (this.repeatType == ZmRecurrence.WEEKLY) {
        bwd = rule.byday = {};
        wkDay = bwd.wkday = [];
		for (i = 0; i < this.repeatWeeklyDays.length; ++i) {
            wkDay.push({
                day : this.repeatWeeklyDays[i]
            });
		}
	}
	else if (this.repeatType == ZmRecurrence.MONTHLY) {
		if (this.repeatCustomType == "S") {
			bmd = rule.bymonthday = {};
			bmd.modaylist = this.repeatMonthlyDayList.join(",");
		}
        else {
			bwd = rule.byday = {};
            bwd.wkday = [];
            if (this.repeatCustomDays) {
                for (i=0; i < this.repeatCustomDays.length; i++) {
                    wkDay = {};
                    wkDay.day = this.repeatCustomDays[i];
                    if (this.repeatCustomOrdinal) {
                        wkDay.ordwk = this.repeatCustomOrdinal;
                    }
                    bwd.wkday.push(wkDay);
                }
            }

            if (this.repeatCustomOrdinal == null) {
                bysetpos = rule.bysetpos = {};
                bysetpos.poslist = this.repeatBySetPos;
            }
        }
    }
	else if (this.repeatType == ZmRecurrence.YEARLY) {
		bm = rule.bymonth = {};
		bm.molist = this.repeatYearlyMonthsList;
		if (this.repeatCustomType == "O") {
			bwd = rule.byday = {};
            bwd.wkday = [];
            if(this.repeatCustomDays) {
                for(i=0; i < this.repeatCustomDays.length; i++) {
                    wkDay = {};
                    wkDay.day = this.repeatCustomDays[i];
                    if (this.repeatCustomOrdinal) {
                        wkDay.ordwk = this.repeatCustomOrdinal;
                    }
                    bwd.wkday.push(wkDay);
                }
            }

            if(this.repeatCustomOrdinal == null) {
                bysetpos = rule.bysetpos = {};
                bysetpos.poslist = this.repeatBySetPos;
            }

        } else {
			bmd = rule.bymonthday = {};
			bmd.modaylist = this.repeatCustomMonthDay;
		}

	}

    this.setExcludes(recur);
};

ZmRecurrence.prototype.setExcludes =
function(recur) {
    if (!this._cancelRecurIds) {
        return;
    }

    var exclude,
        dates,
        i,
        ridZ,
        dtval,
        s;

    for (i in this._cancelRecurIds) {

        if (!this._cancelRecurIds[i]) {
            continue;
        }

        if (!exclude && !dates) {
            exclude = recur.exclude = {};
            dates = exclude.dates = {};
            // Fix for bug: 77998, 84054. Object was missing child element dtval as per soap doc.
            dates.dtval = [];
        }

        ridZ = i;
        dtval = {};
        s = dtval.s = {};
        s.d = ridZ;
        // dtval should hold list of timestamps for conflicting appointments.
        dates.dtval.push(dtval);
    }
};

/**
 * Gets the recurrence blurb.
 * 
 * @return	{String}	the blurb text
 */
ZmRecurrence.prototype.getBlurb =
function() {
	if (this.repeatType == ZmRecurrence.NONE)
		return "";

	var every = [];
	switch (this.repeatType) {
		case ZmRecurrence.DAILY: {
			if (this.repeatCustom == "1" && this.repeatWeekday) {
				every.push(ZmMsg.recurDailyEveryWeekday);
			} else if (this.repeatCustomCount == 1) {
				every.push(ZmMsg.recurDailyEveryDay);
			} else {
				var formatter = new AjxMessageFormat(ZmMsg.recurDailyEveryNumDays);
				every.push(formatter.format(this.repeatCustomCount));
			}
			break;
		}
		case ZmRecurrence.WEEKLY: {
			if (this.repeatCustomCount == 1 && this.repeatWeeklyDays.length == 1) {
				var dayofweek = AjxUtil.indexOf(ZmCalItem.SERVER_WEEK_DAYS, this.repeatWeeklyDays[0]);
				var date = new Date();
				date.setDate(date.getDate() - date.getDay() + dayofweek);

				var formatter = new AjxMessageFormat(ZmMsg.recurWeeklyEveryWeekday);
				every.push(formatter.format(date));
			} else {
				var weekdays = [];
				for (var i = 0; i < this.repeatWeeklyDays.length; i++) {
					var dayofweek = AjxUtil.indexOf(ZmCalItem.SERVER_WEEK_DAYS, this.repeatWeeklyDays[i]);
					var date = new Date();
					date.setDate(date.getDate() - date.getDay() + dayofweek);
					weekdays.push(date);
				}

				var formatter = new AjxMessageFormat(ZmMsg.recurWeeklyEveryNumWeeksDate);
				every.push(formatter.format([ this.repeatCustomCount, weekdays, "" ]));
			}
			break;
		}
		case ZmRecurrence.MONTHLY: {
			if (this.repeatCustomType == "S") {
				var count = Number(this.repeatCustomCount);
				var date = Number(this.repeatMonthlyDayList[0]);

				var formatter = new AjxMessageFormat(ZmMsg.recurMonthlyEveryNumMonthsDate);
				every.push(formatter.format([ date, count ]));
			} else {
				var ordinal = Number(this.repeatCustomOrdinal);
                var bysetpos = Number(this.repeatBySetPos);                                
                var dayofweek = AjxUtil.indexOf(ZmCalItem.SERVER_WEEK_DAYS, this.repeatCustomDayOfWeek);
				var day = new Date();
				day.setDate(day.getDate() - day.getDay() + dayofweek);
                var count = Number(this.repeatCustomCount);

                var days = this.repeatCustomDays.join(",");
                var workWeekDays = ZmCalItem.SERVER_WEEK_DAYS.slice(1,6).join(","); 
                var weekEndDays = [ZmCalItem.SERVER_WEEK_DAYS[AjxDateUtil.SUNDAY], ZmCalItem.SERVER_WEEK_DAYS[AjxDateUtil.SATURDAY]].join(",");

                //if both values are present and unequal give preference to repeatBySetPos
                if (this.repeatCustomOrdinal != null &&
                    this.repeatBySetPos != null &&
                    this.repeatCustomOrdinal != this.repeatBySetPos) {
                    this.repeatCustomOrdinal = this.repeatBySetPos;
                }

                if((ZmCalItem.SERVER_WEEK_DAYS.join(",") == days) || (workWeekDays == days) || (weekEndDays == days)) {
                    var formatter = new AjxMessageFormat(ZmMsg.recurMonthlyEveryNumMonthsWeekDays);
                    var dayType = -1;
                    if(workWeekDays == days) {
                        dayType = 1;
                    }else if(weekEndDays == days) {
                        dayType = 0;
                    }
                    every.push(formatter.format([ bysetpos || ordinal, dayType, count ]));
                }else {
                    var day = new Date();
                    day.setDate(day.getDate() - day.getDay() + dayofweek);
                    var formatter = new AjxMessageFormat(ZmMsg.recurMonthlyEveryNumMonthsNumDay);
                    every.push(formatter.format([ bysetpos || ordinal, day, count ]));
                }
			}
			break;
		}
		case ZmRecurrence.YEARLY: {
			if (this.repeatCustomType == "S") {
				var month = new Date();
				month.setMonth(Number(this.repeatYearlyMonthsList) - 1);
				var day = Number(this.repeatCustomMonthDay);

				var formatter = new AjxMessageFormat(ZmMsg.recurYearlyEveryDate);
				every.push(formatter.format([ month, day ]));
			} else {
				var ordinal = Number(this.repeatCustomOrdinal);
                var bysetpos = Number(this.repeatBySetPos);                
                var dayofweek = AjxUtil.indexOf(ZmCalItem.SERVER_WEEK_DAYS, this.repeatCustomDayOfWeek);
                var month = new Date();
                month.setMonth(Number(this.repeatYearlyMonthsList)-1);

                var days = this.repeatCustomDays.join(",");
                var workWeekDays = ZmCalItem.SERVER_WEEK_DAYS.slice(1,6).join(",");
                var weekEndDays = [ZmCalItem.SERVER_WEEK_DAYS[AjxDateUtil.SUNDAY], ZmCalItem.SERVER_WEEK_DAYS[AjxDateUtil.SATURDAY]].join(",");

                if((ZmCalItem.SERVER_WEEK_DAYS.join(",") == days) || (workWeekDays == days) || (weekEndDays == days)) {
                    var formatter = new AjxMessageFormat(ZmMsg.recurYearlyEveryMonthWeekDays);
                    var dayType = -1;
                    if(workWeekDays == days) {
                        dayType = 1;
                    }else if(weekEndDays == days) {
                        dayType = 0;
                    }
                    every.push(formatter.format([ bysetpos || ordinal, dayType, month ]));
                }else {

                    var day = new Date();
                    day.setDate(day.getDate() - day.getDay() + dayofweek);
                    var formatter = new AjxMessageFormat(ZmMsg.recurYearlyEveryMonthNumDay);
                    every.push(formatter.format([ bysetpos || ordinal, day, month ]));
                }
            }
			break;
		}
	}

	// start
	var start = [];
	var formatter = new AjxMessageFormat(ZmMsg.recurStart);
	start.push(formatter.format(this._startDate));

	// end
	var end = [];
	switch (this.repeatEndType) {
		case "N": {
			end.push(ZmMsg.recurEndNone);
			break;
		}
		case "A": {
			formatter = new AjxMessageFormat(ZmMsg.recurEndNumber);
			end.push(formatter.format(this.repeatEndCount));
			break;
		}
		case "D": {
			formatter = new AjxMessageFormat(ZmMsg.recurEndByDate);
			end.push(formatter.format(this.repeatEndDate));
			break;
		}
	}

	// join all three together
	if (every.length > 0) {
		every.push(".  ");
	}
	if (end.length > 0) {
		end.push(".  ");
	}
	formatter = new AjxMessageFormat(ZmMsg.recurBlurb);
	return formatter.format([ every.join(""), end.join(""), start.join("") ]);
};

ZmRecurrence.prototype.parse =
function(recurRules) {
	// bug 16513: This array never gets cleaned.
	// TODO: Maybe this needs a flag so it doesn't reparse?
	this.repeatWeeklyDays = [];

	for (var k = 0; k < recurRules.length ; ++k) {
		var adds = recurRules[k].add;
		if (!adds) continue;

		this.repeatYearlyMonthsList = this._startDate.getMonth() + 1;
		for (var i = 0; i < adds.length; ++i) {
			var rules = adds[i].rule;
			if (!rules) continue;

			for (var j = 0; j < rules.length; ++j) {
				var rule = rules[j];
				if (rule.freq) {
					this.repeatType = rule.freq.substring(0,3);
					if (rule.interval && rule.interval[0].ival) {
						this.repeatCustomCount = parseInt(rule.interval[0].ival);
						this.repeatCustom = "1";
					}
				}
				if (rule.bymonth) {
					this.repeatYearlyMonthsList = rule.bymonth[0].molist;
					this.repeatCustom = "1";
				}
				if (rule.bymonthday) {
					if (this.repeatType == ZmRecurrence.YEARLY) {
						this.repeatCustomMonthDay = rule.bymonthday[0].modaylist;
						this.repeatCustomType = "S";
					} else if (this.repeatType == ZmRecurrence.MONTHLY){
						this.repeatMonthlyDayList = rule.bymonthday[0].modaylist.split(",");
					}
					this.repeatCustom = "1";
				}
				if (rule.byday && rule.byday[0] && rule.byday[0].wkday) {
					this.repeatCustom = "1";
					var wkday = rule.byday[0].wkday;
					if (this.repeatType == ZmRecurrence.WEEKLY || (this.repeatType == ZmRecurrence.DAILY && wkday.length == 5)) {
						this.repeatWeekday = this.repeatType == ZmRecurrence.DAILY;
						for (var x = 0; x < wkday.length; ++x) {
							this.repeatWeeklyDays.push(wkday[x].day);
						}
					} else {
						this.repeatCustomDayOfWeek = wkday[0].day;
                        var days = [];
                        for(var i = 0; i < wkday.length; i++) {
                            days.push(wkday[i].day);
                        }
                        this.repeatCustomDays = days;                        
                        this.repeatCustomOrdinal = wkday[0].ordwk;
                        this.repeatBySetPos  = (rule.bysetpos && (rule.bysetpos.length > 0)) ? rule.bysetpos[0].poslist : null;
                        //ical sends only ordwk in recurrence rule, we follow outlook behavior in setting repeatbysetpos instead of ordwk
                        if(this.repeatBySetPos == null && this.repeatCustomOrdinal) {
                            this.repeatBySetPos  = this.repeatCustomOrdinal; 
                        }
                        this.repeatCustomType = "O";
					}
				}
				if (rule.until) {
					this.repeatEndType = "D";
					this.repeatEndDate = AjxDateUtil.parseServerDateTime(rule.until[0].d);
				} else if (rule.count) {
					this.repeatEndType = "A";
					this.repeatEndCount = rule.count[0].num;
				}
			}
		}
	}
};

ZmRecurrence.prototype.setRecurrenceStartTime =
function(startTime) {
	
	this._startDate.setTime(startTime);
    this.repeatCustomMonthDay	= this._startDate.getDate();    
	
	if (this.repeatType == ZmRecurrence.NONE) return;

	//if (this.repeatCustom != "0")
		//return;

 	if (this.repeatType == ZmRecurrence.WEEKLY) {
		this.repeatWeeklyDays = [ZmCalItem.SERVER_WEEK_DAYS[this._startDate.getDay()]];
	} else if (this.repeatType == ZmRecurrence.MONTHLY) {
		this.repeatMonthlyDayList = [this._startDate.getDate()];
    } else if (this.repeatType == ZmRecurrence.YEARLY) {
		this.repeatYearlyMonthsList = this._startDate.getMonth() + 1;	
	}
};

ZmRecurrence.prototype.setRecurrenceRules =
function(recurRules, startDate) {

    if (recurRules)
        this.parse(recurRules);    

    if(!startDate) return;

    if (this.repeatWeeklyDays == null) {
        this.repeatWeeklyDays = [ZmCalItem.SERVER_WEEK_DAYS[startDate.getDay()]];
    }
    if (this.repeatMonthlyDayList == null) {
        this.repeatMonthlyDayList = [startDate.getDate()];
    }

};

ZmRecurrence.prototype.addCancelRecurId =
function(ridZ) {
    this._cancelRecurIds[ridZ] = true;        
};

ZmRecurrence.prototype.resetCancelRecurIds =
function(   ) {
    this._cancelRecurIds = {};
};

ZmRecurrence.prototype.isInstanceCanceled =
function(ridZ) {
    return this._cancelRecurIds[ridZ];
};

ZmRecurrence.prototype.removeCancelRecurId =
function(ridZ) {
    this._cancelRecurIds[ridZ] = null;
};

ZmRecurrence.prototype.parseExcludeInfo =
function(recurInfo) {

    if (!recurInfo) { return; }

    for(var i=0; i < recurInfo.length; i++) {
        var excludeInfo = (recurInfo[i] && recurInfo[i].exclude) ? recurInfo[i].exclude : null;
        if(!excludeInfo) continue;
        for(var j=0; j < excludeInfo.length; j++) {
            var datesInfo = excludeInfo[j].dates;
            if(datesInfo) this._parseExcludeDates(datesInfo);
        }
    }

};

ZmRecurrence.prototype._parseExcludeDates =
function(datesInfo) {
    for(var j=0; j < datesInfo.length; j++) {

        var dtval = datesInfo[j].dtval;
        if(!dtval) continue;

        for(var k=0; k < dtval.length; k++) {
            var dinfo = dtval[k];
            var excludeDate = (dinfo && dinfo.s) ? dinfo.s[0].d : null;
            if(excludeDate) this.addCancelRecurId(excludeDate);
        }
    }
};

