/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */
ZmRecurrence = function(calItem) {
	this._startDate 			= (calItem && calItem.startDate) ? calItem.startDate : (new Date());

	// initialize all params (listed alphabetically)
	this.repeatCustom			= "0";  										// 1|0
	this.repeatCustomCount		= 1; 											// ival
	this.repeatCustomDayOfWeek	= "SU"; 										// (DAY|WEEKDAY|WEEKEND) | (SU|MO|TU|WE|TH|FR|SA)
	this.repeatCustomOrdinal	= "1";
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
};

ZmRecurrence.prototype.toString =
function() {
	return "ZmRecurrence";
};

ZmRecurrence.NONE		= "NON";
ZmRecurrence.DAILY		= "DAI";
ZmRecurrence.WEEKLY		= "WEE";
ZmRecurrence.MONTHLY	= "MON";
ZmRecurrence.YEARLY		= "YEA";

ZmRecurrence.prototype.setSoap =
function(soapDoc, inv) {
	if (this.repeatType == ZmRecurrence.NONE) return;

	var recur = soapDoc.set("recur", null, inv);
	var add = soapDoc.set("add", null, recur);
	var rule = soapDoc.set("rule", null, add);
	rule.setAttribute("freq", this.repeatType);

	var interval = soapDoc.set("interval", null, rule);
	interval.setAttribute("ival", this.repeatCustomCount);

	if (this.repeatEndDate != null && this.repeatEndType == "D") {
		var until = soapDoc.set("until", null, rule);
		until.setAttribute("d", AjxDateUtil.getServerDate(this.repeatEndDate));
	} else if (this.repeatEndType == "A"){
		var c = soapDoc.set("count",null, rule);
		c.setAttribute("num", this.repeatEndCount);
	}

	if (this.repeatCustom != "1")
		return;

	if (this.repeatType == ZmRecurrence.DAILY) {
		if (this.repeatWeekday) {
			// TODO: for now, handle "every weekday" as M-F
			//       eventually, needs to be localized work week days
			var bwd = soapDoc.set("byday", null, rule);
			for (var i in ZmCalItem.SERVER_WEEK_DAYS) {
				var day = ZmCalItem.SERVER_WEEK_DAYS[i];
				if (day == "SA" || day == "SU")
					continue;
				var wkDay = soapDoc.set("wkday", null, bwd);
				wkDay.setAttribute("day", day);
			}
		}
	} else if (this.repeatType == ZmRecurrence.WEEKLY) {
		var bwd = soapDoc.set("byday", null, rule);
		for (var i = 0; i < this.repeatWeeklyDays.length; ++i) {
			var wkDay = soapDoc.set("wkday", null, bwd);
			wkDay.setAttribute("day", this.repeatWeeklyDays[i]);
		}
	}
	else if (this.repeatType == ZmRecurrence.MONTHLY)
	{
		if (this.repeatCustomType == "S") {
			var bmd = soapDoc.set("bymonthday", null, rule);
			bmd.setAttribute("modaylist", this.repeatMonthlyDayList);
		} else {
			var bwd = soapDoc.set("byday", null, rule);
			wkDay = soapDoc.set("wkday", null, bwd);
			wkDay.setAttribute("ordwk", this.repeatCustomOrdinal);
			wkDay.setAttribute("day", this.repeatCustomDayOfWeek);
		}
	}
	else if (this.repeatType == ZmRecurrence.YEARLY)
	{
		var bm = soapDoc.set("bymonth", null, rule);
		bm.setAttribute("molist", this.repeatYearlyMonthsList);
		if (this.repeatCustomType == "O") {
			var bwd = soapDoc.set("byday", null, rule);
			wkDay = soapDoc.set("wkday", null, bwd);
			wkDay.setAttribute("ordwk", this.repeatCustomOrdinal);
			wkDay.setAttribute("day", this.repeatCustomDayOfWeek);
		} else {
			var bmd = soapDoc.set("bymonthday", null, rule);
			bmd.setAttribute("modaylist", this.repeatCustomMonthDay);
		}
	}
};

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
				var dayofweek = AjxUtil.indexOf(ZmCalItem.SERVER_WEEK_DAYS, this.repeatCustomDayOfWeek);
				var day = new Date();
				day.setDate(day.getDate() - day.getDay() + dayofweek);
				var count = Number(this.repeatCustomCount);

				var formatter = new AjxMessageFormat(ZmMsg.recurMonthlyEveryNumMonthsNumDay);
				every.push(formatter.format([ ordinal, day, count ]));
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
				var dayofweek = AjxUtil.indexOf(ZmCalItem.SERVER_WEEK_DAYS, this.repeatCustomDayOfWeek);
				var day = new Date();
				day.setDate(day.getDate() - day.getDay() + dayofweek);
				var month = new Date();
				month.setMonth(Number(this.repeatYearlyMonthsList)-1);

				var formatter = new AjxMessageFormat(ZmMsg.recurYearlyEveryMonthNumDay);
				every.push(formatter.format([ ordinal, day, month ]));
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
	formatter = new AjxMessageFormat(ZmMsg.recurBlurb);
	return formatter.format([ every.join(""), start.join(""), end.join("") ]);
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
						this.repeatCustomOrdinal = wkday[0].ordwk;
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
