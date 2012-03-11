/**
 * Date group divides messages into the following sections:
 * Today
 * Yesterday
 * Day of week -- not today or yesterday, but still within this week
 * Last Week
 * Two Weeks Ago
 * Three Weeks Ago
 * Earlier this Month
 * Last Month
 * Older
 *
 */
ZmMailListDateGroup = function(){
    this.id = ZmId.GROUPBY_DATE;
	this.field = ZmItem.F_DATE;
	this._weekStartDay = appCtxt.get(ZmSetting.CAL_FIRST_DAY_OF_WEEK) || 0;
	var dayOfWeek = this._getToday().getDay();
	this._keys = this._sortKeys(dayOfWeek, false);
    ZmMailListGroup.call(this);
};

ZmMailListDateGroup.prototype = new ZmMailListGroup;
ZmMailListDateGroup.prototype.constructor =  ZmMailListDateGroup;

ZmMailListDateGroup.MONDAY = "MONDAY";
ZmMailListDateGroup.TUESDAY = "TUESDAY";
ZmMailListDateGroup.WEDNESDAY = "WEDNESDAY";
ZmMailListDateGroup.THURSDAY = "THURSDAY";
ZmMailListDateGroup.FRIDAY = "FRIDAY";
ZmMailListDateGroup.SATURDAY = "SATURDAY";
ZmMailListDateGroup.SUNDAY = "SUNDAY";
ZmMailListDateGroup.TODAY = "TODAY";
ZmMailListDateGroup.YESTERDAY = "YESTERDAY";
ZmMailListDateGroup.LAST_WEEK = "LAST_WEEK";
ZmMailListDateGroup.TWO_WEEKS_AGO = "TWO_WEEKS_AGO";
ZmMailListDateGroup.THREE_WEEKS_AGO = "THREE_WEEKS_AGO";
ZmMailListDateGroup.EARLIER_THIS_MONTH = "EARLIER_THIS_MONTH";
ZmMailListDateGroup.LAST_MONTH = "LAST_MONTH";
ZmMailListDateGroup.OLDER = "OLDER";

ZmMailListDateGroup.GROUP = [ZmMailListDateGroup.TODAY, ZmMailListDateGroup.YESTERDAY, ZmMailListDateGroup.SUNDAY, ZmMailListDateGroup.MONDAY,
							 ZmMailListDateGroup.TUESDAY, ZmMailListDateGroup.WEDNESDAY, ZmMailListDateGroup.THURSDAY, ZmMailListDateGroup.FRIDAY,
							 ZmMailListDateGroup.SATURDAY, ZmMailListDateGroup.LAST_WEEK, ZmMailListDateGroup.TWO_WEEKS_AGO, ZmMailListDateGroup.THREE_WEEKS_AGO,
							 ZmMailListDateGroup.EARLIER_THIS_MONTH, ZmMailListDateGroup.LAST_MONTH, ZmMailListDateGroup.OLDER];

ZmMailListDateGroup.WEEKDAYS = [ZmMailListDateGroup.SUNDAY, ZmMailListDateGroup.MONDAY, ZmMailListDateGroup.TUESDAY, ZmMailListDateGroup.WEDNESDAY,
							    ZmMailListDateGroup.THURSDAY, ZmMailListDateGroup.FRIDAY, ZmMailListDateGroup.SATURDAY];

ZmMailListDateGroup.SECTION_TITLE = {};
ZmMailListDateGroup.SECTION_TITLE[ZmMailListDateGroup.TODAY] = ZmMsg.today;
ZmMailListDateGroup.SECTION_TITLE[ZmMailListDateGroup.YESTERDAY] = ZmMsg.yesterday;
ZmMailListDateGroup.SECTION_TITLE[ZmMailListDateGroup.MONDAY] = I18nMsg.weekdayMonLong;
ZmMailListDateGroup.SECTION_TITLE[ZmMailListDateGroup.TUESDAY] = I18nMsg.weekdayTueLong;
ZmMailListDateGroup.SECTION_TITLE[ZmMailListDateGroup.WEDNESDAY] = I18nMsg.weekdayWedLong;
ZmMailListDateGroup.SECTION_TITLE[ZmMailListDateGroup.THURSDAY] = I18nMsg.weekdayThuLong;
ZmMailListDateGroup.SECTION_TITLE[ZmMailListDateGroup.FRIDAY] = I18nMsg.weekdayFriLong;
ZmMailListDateGroup.SECTION_TITLE[ZmMailListDateGroup.SATURDAY] = I18nMsg.weekdaySatLong;
ZmMailListDateGroup.SECTION_TITLE[ZmMailListDateGroup.SUNDAY] = I18nMsg.weekdaySunLong;
ZmMailListDateGroup.SECTION_TITLE[ZmMailListDateGroup.LAST_WEEK] = ZmMsg.lastWeek;
ZmMailListDateGroup.SECTION_TITLE[ZmMailListDateGroup.TWO_WEEKS_AGO] = ZmMsg.twoWeeksAgo;
ZmMailListDateGroup.SECTION_TITLE[ZmMailListDateGroup.THREE_WEEKS_AGO] = ZmMsg.threeWeeksAgo;
ZmMailListDateGroup.SECTION_TITLE[ZmMailListDateGroup.EARLIER_THIS_MONTH] = ZmMsg.earlierThisMonth;
ZmMailListDateGroup.SECTION_TITLE[ZmMailListDateGroup.LAST_MONTH] = ZmMsg.lastMonth;
ZmMailListDateGroup.SECTION_TITLE[ZmMailListDateGroup.OLDER] = ZmMsg.older;

ZmMailListDateGroup.TIME = {};
ZmMailListDateGroup.TIME["YESTERDAY"] = AjxDateUtil.MSEC_PER_DAY;
ZmMailListDateGroup.TIME["LAST_WEEK"] = AjxDateUtil.MSEC_PER_DAY * 7;
ZmMailListDateGroup.TIME["TWO_WEEKS_AGO"] = AjxDateUtil.MSEC_PER_DAY * 14;
ZmMailListDateGroup.TIME["THREE_WEEKS_AGO"] = AjxDateUtil.MSEC_PER_DAY * 21;


/**
 *  returns HTML string for all sections.
 *  @param {boolean} sortAsc    true/false if sort ascending
 *  @return {String} HTML for all sections including section header
 * @param sortAsc
 */
ZmMailListDateGroup.prototype.getAllSections =
function(sortAsc) {
    var htmlArr = [];
	var dayOfWeek = this._getToday().getDay();
    var keys = sortAsc ? this._sortKeys(dayOfWeek, sortAsc) : this._keys; //keys have already been sorted desc
    this.resetSectionHeaders();
    for (var i=0; i<keys.length; i++) {
        if (this._section[keys[i]].length > 0) {
            htmlArr.push(this.getSectionHeader(ZmMailListDateGroup.SECTION_TITLE[keys[i]]));
            htmlArr.push(this._section[keys[i]].join(""));
        }
        else if (this._showEmptySectionHeader) {
            htmlArr.push(this.getSectionHeader(ZmMailListDateGroup.SECTION_TITLE[keys[i]]));
        }
    }
    return htmlArr.join("");
};

/**
 * Adds item to section
 * @param {ZmMailMsg} msg   mail message
 * @param {String} item  HTML to add to section
 * @return {String} section returns section if successfully added, else returns null
 */
ZmMailListDateGroup.prototype.addMsgToSection =
function(msg, item) {
   for (var i=0; i<this._keys.length; i++) {
       if (this.isMsgInSection(this._keys[i], msg)) {
        this._section[this._keys[i]].push(item);
        return this._keys[i];
       }
   }
};

/**
 * Determines if message is in group
 * @param {String} section ID of section
 * @param {ZmMailMsg} msg
 * @return {boolean} true/false
 */
ZmMailListDateGroup.prototype.isMsgInSection =
function(section, msg) {

   switch(section){
       case ZmMailListDateGroup.TODAY:
         return this._isToday(msg);

       case ZmMailListDateGroup.YESTERDAY:
        return this._isYesterday(msg);

       case ZmMailListDateGroup.MONDAY:
        return this._isDayOfWeek(msg, AjxDateUtil.MONDAY);

       case ZmMailListDateGroup.TUESDAY:
        return this._isDayOfWeek(msg, AjxDateUtil.TUESDAY);

       case ZmMailListDateGroup.WEDNESDAY:
        return this._isDayOfWeek(msg, AjxDateUtil.WEDNESDAY);

       case ZmMailListDateGroup.THURSDAY:
        return this._isDayOfWeek(msg, AjxDateUtil.THURSDAY);

       case ZmMailListDateGroup.FRIDAY:
        return this._isDayOfWeek(msg, AjxDateUtil.FRIDAY);

       case ZmMailListDateGroup.SATURDAY:
        return this._isDayOfWeek(msg, AjxDateUtil.SATURDAY);

       case ZmMailListDateGroup.SUNDAY:
        return this._isDayOfWeek(msg, AjxDateUtil.SUNDAY);

       case ZmMailListDateGroup.LAST_WEEK:
        return this._isWeeksAgo(msg, ZmMailListDateGroup.LAST_WEEK, ZmMailListDateGroup.YESTERDAY);

       case ZmMailListDateGroup.TWO_WEEKS_AGO:
        return this._isWeeksAgo(msg, ZmMailListDateGroup.TWO_WEEKS_AGO, ZmMailListDateGroup.LAST_WEEK);

       case ZmMailListDateGroup.THREE_WEEKS_AGO:
        return this._isWeeksAgo(msg, ZmMailListDateGroup.THREE_WEEKS_AGO, ZmMailListDateGroup.TWO_WEEKS_AGO);

       case ZmMailListDateGroup.EARLIER_THIS_MONTH:
        return this._isEarlierThisMonth(msg);

       case ZmMailListDateGroup.LAST_MONTH:
        return this._isLastMonth(msg);

       case ZmMailListDateGroup.OLDER:
        return this._isOlder(msg);

       default:
        return false;
   }
};

/**
 * Returns the sort by (ZmSearch.DATE_ASC or ZmSearch.DATE_DESC)
 * @param {boolean} sortAsc
 * @return {String} sortBy
 */
ZmMailListDateGroup.prototype.getSortBy =
function(sortAsc) {
    if (sortAsc) {
        return ZmSearch.DATE_ASC;
    }
    return ZmSearch.DATE_DESC;
};

ZmMailListDateGroup.prototype._init =
function(){
  this._section = {};
  this._section[ZmMailListDateGroup.TODAY] = [];
  this._section[ZmMailListDateGroup.YESTERDAY] = [];
  this._section[ZmMailListDateGroup.SUNDAY] = [];
  this._section[ZmMailListDateGroup.MONDAY] = [];
  this._section[ZmMailListDateGroup.TUESDAY] = [];
  this._section[ZmMailListDateGroup.WEDNESDAY] = [];
  this._section[ZmMailListDateGroup.THURSDAY] = [];
  this._section[ZmMailListDateGroup.FRIDAY] = [];
  this._section[ZmMailListDateGroup.SATURDAY] = [];
  this._section[ZmMailListDateGroup.LAST_WEEK] = [];
  this._section[ZmMailListDateGroup.TWO_WEEKS_AGO] = [];
  this._section[ZmMailListDateGroup.THREE_WEEKS_AGO] = [];
  this._section[ZmMailListDateGroup.EARLIER_THIS_MONTH] = [];
  this._section[ZmMailListDateGroup.LAST_MONTH] = [];
  this._section[ZmMailListDateGroup.OLDER] = [];
};

/**
 * determines if mail message was received today
 * @param msg {ZmMailMsg} mail msg
 * @return {boolean}
 */
ZmMailListDateGroup.prototype._isToday =
function(msg){
    if(msg){
        var today = this._getToday();
        var d = this._getDateFromMsg(msg, true);
        if (d) {
            return today.getTime() == d.getTime();
        }
    }
    return false;
};

/**
 * determines if msg was received yesterday
 * @param msg {ZmMailMsg} mail msg
 * @return {boolean}
 */
ZmMailListDateGroup.prototype._isYesterday =
function(msg) {
    if (msg) {
        var today = this._getToday();
        var yesterday = new Date();
        yesterday.setTime(today.getTime() - AjxDateUtil.MSEC_PER_DAY);
        var d = this._getDateFromMsg(msg, true);
        if (d) {
            return yesterday.getTime() == d.getTime();
        }
    }

    return false;
};

/**
 * message is this week, but not today or yesterday
 * @param msg {ZmMailMsg} mail msg
 * @param dayOfWeek {integer} the day of the week to check against (e.g. Monday)
 * @return {boolean}
 */
ZmMailListDateGroup.prototype._isDayOfWeek =
function(msg, dayOfWeek) {
    if (msg) {
        var today = this._getToday();
        var thisWeek = AjxDateUtil.getWeekNumber(today);
        var thisYear = today.getYear();

        var d = this._getDateFromMsg(msg, true);
        if (d) {
            return d.getDay() == dayOfWeek && AjxDateUtil.getWeekNumber(d) == thisWeek &&
                   !this._isYesterday(msg) && !this._isToday(msg) && thisYear == d.getYear();
        }
    }
    return false;
};

/**
 * Determines if msg is from X number of weeks ago.
 * @param {ZmMailMsg} msg the mail message to evaluate
 * @param {String} minGroup Group oldest in date  (e.g. three weeks ago)
 * @param {String} maxGroup Group newest in date  (e.g. two weeks ago)
 */
ZmMailListDateGroup.prototype._isWeeksAgo =
function(msg, minGroup, maxGroup) {
	if (msg) {
		var today = this._getToday();
		var max = today.getTime() - ZmMailListDateGroup.TIME[maxGroup];
		var min = today.getTime() - ZmMailListDateGroup.TIME[minGroup];
		var d = this._getDateFromMsg(msg, true);
		if (d) {
			return d.getTime() >= min && d.getTime() < max;
		}
	}

	return false;
};

/**
 * message is earlier this month and also more than 3 weeks ago
 * @param msg {ZmMailMsg} mail msg
 * @return {boolbean}
 */
ZmMailListDateGroup.prototype._isEarlierThisMonth =
function(msg) {
    if (msg) {
        var today = this._getToday();
        var threeWeeksAgo = today.getTime() - ZmMailListDateGroup.TIME[ZmMailListDateGroup.THREE_WEEKS_AGO];
        var thisMonth = today.getMonth();
        var thisYear = today.getYear();
        var d = this._getDateFromMsg(msg, true);
        if (d) {
            return d.getTime() < threeWeeksAgo && (d.getYear() == thisYear && d.getMonth() == thisMonth);
        }
    }
    return false;
};

/**
 * message is last month and also more than 3 weeks ago from today
 * @param msg {ZmMailMsg} mail message
 * @return {boolean}
 */
ZmMailListDateGroup.prototype._isLastMonth =
function(msg) {
    if (msg) {
        var today = this._getToday();
	    var threeWeeksAgo = today.getTime() - ZmMailListDateGroup.TIME[ZmMailListDateGroup.THREE_WEEKS_AGO];
        var thisMonth = today.getMonth();
        var thisYear = today.getYear();
        var lastMonth = this._calculateLastMonth(thisMonth);
        var d = this._getDateFromMsg(msg, true);
        if (d) {
            if(d.getMonth() != thisMonth) {
                if (d.getYear() == thisYear || d.getYear() == thisYear -1) {
                    return d.getMonth() == lastMonth && d.getTime() < threeWeeksAgo;
                }
            }
        }

    }
    return false;
};

/**
 * message is more than a month old
 * @param msg {ZmMailMsg} mail msg
 * @return {boolean}
 */
ZmMailListDateGroup.prototype._isOlder =
function(msg) {
    if (msg) {
        var today = this._getToday();
        var threeWeeksAgo = today.getTime() - ZmMailListDateGroup.TIME[ZmMailListDateGroup.THREE_WEEKS_AGO];
        var d = this._getDateFromMsg(msg, true);
        if (d) {
            return d.getTime() < threeWeeksAgo && !this._isEarlierThisMonth(msg) && !this._isLastMonth(msg);
        }
    }
    return false;
};

ZmMailListDateGroup.prototype._getDateFromMsg =
function(msg, resetHours) {
    if (msg) {
        var d = msg.sentDate ? new Date(msg.sentDate) : new Date(msg.date);
        if (d && resetHours) {
            d.setHours(0, 0, 0, 0);
        }
        return d;
    }
    return null;
};

/**
 * Sorts sections (e.g. Today, Yesterday, Days, Last Week, etc) by ASC or DESC order.  dayOfWeek is used to sort the week days in ASC/DESC order
 * @param dayOfWeek {integer} day value of today
 * @param sortAsc  {boolean} true if sort ascending
 * @return keys {array} sorted keys
 */
ZmMailListDateGroup.prototype._sortKeys =
function(dayOfWeek, sortAsc) {
    var keys = [];
	var sortedDays = this._sortThisWeek(dayOfWeek);
	sortedDays = sortedDays.slice(2); //account for today & yesterday
	keys = [ZmMailListDateGroup.TODAY, ZmMailListDateGroup.YESTERDAY];
	keys = keys.concat(sortedDays);
	keys = keys.concat([ZmMailListDateGroup.LAST_WEEK, ZmMailListDateGroup.TWO_WEEKS_AGO, ZmMailListDateGroup.THREE_WEEKS_AGO,
						ZmMailListDateGroup.EARLIER_THIS_MONTH, ZmMailListDateGroup.LAST_MONTH, ZmMailListDateGroup.OLDER]);
    if (sortAsc) {
        keys.reverse();
    }
    return keys;
};

ZmMailListDateGroup.prototype._calculateLastMonth =
function(month) {
    var lastMonth = month -1;
    if (lastMonth == -1){
        lastMonth = 11;
    }
    return lastMonth;
};

ZmMailListDateGroup.prototype._getToday =
function() {
  var today = new Date();
  today.setHours(0,0,0,0);
  return today;
};

ZmMailListDateGroup.prototype._getSectionHeaderTitle =
function(section) {
   if (ZmMailListDateGroup.SECTION_TITLE[section]) {
       return ZmMailListDateGroup.SECTION_TITLE[section];
   }

   return "";
};

/**
 * Sort days for this week.  If today is Monday & preferences is start week with Sunday, result will by [Monday, Sunday]
 * @param firstDay {integer}  day value of today
 * @return sorteDays {array} array of sorted days
 */
ZmMailListDateGroup.prototype._sortThisWeek =
function(firstDay) {
	var sortedDays = [];
	var count = 0;
	var foundStart = false;
	while (count < 7 && !foundStart) {
		if (firstDay == this._weekStartDay) {
			foundStart = true;
		}
		sortedDays[count] = ZmMailListDateGroup.WEEKDAYS[firstDay];
		firstDay--;
		if (firstDay < 0) {
			firstDay = 6;
		}
		count++;
	}

	return sortedDays;
};
