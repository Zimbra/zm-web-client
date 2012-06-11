/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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

UT.module("MailListGroups");

UT.test("Sort This Week: Today is Monday, Start of Week is Sunday", {},
	function() {
		UT.expect(2);
		var dateGroup = new ZmMailListDateGroup();
		var dayOfWeek = AjxDateUtil.MONDAY;
		dateGroup._weekStartDay = AjxDateUtil.SUNDAY;
		var sortedDays = dateGroup._sortThisWeek(dayOfWeek, false); //desc
		var expected = [ZmMailListDateGroup.MONDAY, ZmMailListDateGroup.SUNDAY];
		for (var i=0; i<sortedDays.length; i++) {
			UT.equal(sortedDays[i], expected[i], "sortedDay = " + sortedDays[i]);
		}
	}
);

UT.test("Sort This Week: Today is Friday, Start of Week is Monday", {},
	function() {
		UT.expect(5);
		var dateGroup = new ZmMailListDateGroup();
		var dayOfWeek = AjxDateUtil.FRIDAY;
		dateGroup._weekStartDay = AjxDateUtil.MONDAY;
		var sortedDays = dateGroup._sortThisWeek(dayOfWeek, false); //desc
		var expected = [ZmMailListDateGroup.FRIDAY, ZmMailListDateGroup.THURSDAY, ZmMailListDateGroup.WEDNESDAY, ZmMailListDateGroup.TUESDAY, ZmMailListDateGroup.MONDAY];
		for (var i=0; i<sortedDays.length; i++) {
			UT.equal(sortedDays[i], expected[i], "sortedDay = " + sortedDays[i]);
		}
	}
);

UT.test("Sort Date Groups Descending: Today is Friday, Start of Week is Sunday", {},
	function() {
		UT.expect(12);
		var dateGroup = new ZmMailListDateGroup();
		var dayOfWeek = AjxDateUtil.FRIDAY;
		var keys = dateGroup._sortKeys(dayOfWeek, false); //sort desc
		var expected = [ZmMailListDateGroup.TODAY, ZmMailListDateGroup.YESTERDAY, ZmMailListDateGroup.WEDNESDAY,
						ZmMailListDateGroup.TUESDAY, ZmMailListDateGroup.MONDAY, ZmMailListDateGroup.SUNDAY, ZmMailListDateGroup.LAST_WEEK, ZmMailListDateGroup.TWO_WEEKS_AGO, ZmMailListDateGroup.THREE_WEEKS_AGO,
						ZmMailListDateGroup.EARLIER_THIS_MONTH, ZmMailListDateGroup.LAST_MONTH, ZmMailListDateGroup.OLDER];
		for (var i=0; i<keys.length; i++) {
			UT.equal(keys[i], expected[i], "keys = " + keys[i]);
		}
	}

);

UT.test("Sort Date Groups Descending: Today is Tuesday, Start of Week is Sunday", {},
	function() {
		UT.expect(9);
		var dateGroup = new ZmMailListDateGroup();
		var dayOfWeek = AjxDateUtil.TUESDAY;
		var keys = dateGroup._sortKeys(dayOfWeek, false); //sort desc
		var expected = [ZmMailListDateGroup.TODAY, ZmMailListDateGroup.YESTERDAY, ZmMailListDateGroup.SUNDAY, ZmMailListDateGroup.LAST_WEEK, ZmMailListDateGroup.TWO_WEEKS_AGO, ZmMailListDateGroup.THREE_WEEKS_AGO,
						ZmMailListDateGroup.EARLIER_THIS_MONTH, ZmMailListDateGroup.LAST_MONTH, ZmMailListDateGroup.OLDER];
		for (var i=0; i<keys.length; i++) {
			UT.equal(keys[i], expected[i], "keys = " + keys[i]);
		}
	}
);

UT.test("Sort Date Groups Ascending: Today is Friday, Start of Week is Sunday", {},
	function() {
		UT.expect(12);
		var dateGroup = new ZmMailListDateGroup();
		dateGroup._weekStartDay = AjxDateUtil.SUNDAY;
		var dayOfWeek = AjxDateUtil.FRIDAY;
		var keys = dateGroup._sortKeys(dayOfWeek, true);
		var expected = [ZmMailListDateGroup.OLDER, ZmMailListDateGroup.LAST_MONTH, ZmMailListDateGroup.EARLIER_THIS_MONTH, ZmMailListDateGroup.THREE_WEEKS_AGO,
						ZmMailListDateGroup.TWO_WEEKS_AGO, ZmMailListDateGroup.LAST_WEEK, ZmMailListDateGroup.SUNDAY, ZmMailListDateGroup.MONDAY, ZmMailListDateGroup.TUESDAY,
						ZmMailListDateGroup.WEDNESDAY, ZmMailListDateGroup.YESTERDAY, ZmMailListDateGroup.TODAY];
		for (var i=0; i<keys.length; i++) {
			UT.equal(keys[i], expected[i], "keys = " + keys[i]);
		}
	}
);

UT.test("Date: isMsgInSection", {
	teardown: function() {

	},

	setup: function() {
		var oneDay = 86400000; //one day
		var lastWeek = oneDay * 7; //one week ago
		var twoWeeks = oneDay * 14; //two weeks ago
		var threeWeeks = oneDay * 21; //three weeks ago
		//var thisMonth = oneDay * 22; //more than three weeks ago
		var lastMonth = oneDay * 32; //one month ago
		var yearAgo = oneDay * 365; //one year ago

		this._sections = [ZmMailListDateGroup.TODAY, ZmMailListDateGroup.YESTERDAY, ZmMailListDateGroup.LAST_WEEK, ZmMailListDateGroup.TWO_WEEKS_AGO, ZmMailListDateGroup.THREE_WEEKS_AGO,
						  ZmMailListDateGroup.LAST_MONTH, ZmMailListDateGroup.OLDER];

		var today = new Date();
		var now = today.getTime();
		var todayMsg = {"sentDate": new Date()};
		var yesterdayMsg = {"sentDate": new Date(today.setTime(now - oneDay))};
		var lastWeekMsg = {"sentDate": new Date(today.setTime(now - lastWeek))};
	    var twoWeeksMsg = {"sentDate": new Date(today.setTime(now - twoWeeks))};
		var threeWeeksMsg = {"sentDate": new Date(today.setTime(now - threeWeeks))};
		//var thisMonthMsg = {"sentDate" : new Date(today.setTime(now - thisMonth))};
		var lastMonthMsg = {"sentDate" : new Date(today.setTime(now - lastMonth))};
		var olderMsg = {"sentDate" : new Date(today.setTime(now - yearAgo))};
		this._msgs = [todayMsg, yesterdayMsg, lastWeekMsg, twoWeeksMsg, threeWeeksMsg, lastMonthMsg, olderMsg];

	}},

	function() {
		UT.expect(56);
		var result = null;
	    var dateGroup = new ZmMailListDateGroup();
		for (var i=0; i<this._msgs.length; i++) {
			result = dateGroup.isMsgInSection(this._sections[i], this._msgs[i]);
			UT.equal(result, true, this._msgs[i].sentDate + " = " + result + " for section " + this._sections[i]);
		}

		for (var i=0; i<this._sections.length; i++) {
			for (var j=0; j<this._msgs.length; j++) {
				result = dateGroup.isMsgInSection(this._sections[i], this._msgs[j]); //test msg against all
				var expected = i == j ? true : false;
				UT.equal(result, expected, this._msgs[j].sentDate + " = " + result + " for section " + this._sections[i]);
		    }
		}
	}
);

UT.test("Date: isLastMonth", {
	teardown: function() {
		
	},
			
	setup: function() {
		var today = new Date();
		var now = today.getTime();
		var oneDay = 86400000; //one day
		var lastMonth = oneDay * 32; //one month ago
		var yearAgo = oneDay * 365; //one year ago
		this._lastMonthMsg = {"sentDate" : new Date(today.setTime(now - lastMonth))};
		this._oneYearAndOneMonthAgoMsg = {"sentDate" : new Date(today.setTime(now - lastMonth - yearAgo))};
	}},
		
	function() {
		UT.expect(2);
		var dateGroup = new ZmMailListDateGroup();
		var isLastMonth = dateGroup.isMsgInSection(ZmMailListDateGroup.LAST_MONTH, this._lastMonthMsg);
		UT.equal(isLastMonth, true, this._lastMonthMsg.sentDate + " = " + isLastMonth + " for last month");
		isLastMonth = dateGroup.isMsgInSection(ZmMailListDateGroup.LAST_MONTH, this._oneYearAndOneMonthAgoMsg);
		UT.equal(isLastMonth, false, this._oneYearAndOneMonthAgoMsg.sentDate + " = " + isLastMonth + " for last month");		
	}
);

UT.test("Message Size: isMsgInSection", {
	teardown: function() {

	},

	setup: function() {
		var megabyte = 1024 * 1024;
		this._tinySize = [(1024 * 9) + 511, 1024 * 5, 0]; //max, avg, min
		this._smallSize = [(1024 * 24) + 511, 1024 * 13, (1024*9) + 512];
		this._mediumSize = [(1024 * 99) + 511, 1024 * 50, (1024 * 24) + 512];
		this._largeSize = [(1024 * 499) + 511, 1024 * 250, (1024 * 99) + 512];
		this._veryLargeSize = [(1023 * 1024) + 511, 1024 * 750, (1024 * 499) + 512];
		this._hugeSize = [(megabyte * 4) + (megabyte/2) - 1, megabyte * 2, (1023 * 1024) + 512];
		this._enormousSize = [(megabyte * 20), megabyte * 10, (megabyte * 4) + (megabyte/2) + 1];
	}},

	function () {
		UT.expect(21);
		var sizeGroup = new ZmMailListSizeGroup();
		var msg = {};
		var result;
		for (var i=0; i<this._tinySize.length; i++) {
			msg.size = this._tinySize[i];
			result = sizeGroup.isMsgInSection(ZmMailListSizeGroup.TINY, msg);
			UT.equal(result, true, AjxUtil.formatSize(msg.size, false, 25) + " = " + result + " for section TINY");
		}

		for (var i=0; i<this._smallSize.length; i++) {
			msg.size = this._smallSize[i];
			result = sizeGroup.isMsgInSection(ZmMailListSizeGroup.SMALL, msg);
			UT.equal(result, true, AjxUtil.formatSize(msg.size, false, 5) + " = " + result + " for section SMALL");
		}

		for (var i=0; i<this._mediumSize.length; i++) {
			msg.size = this._mediumSize[i];
			result = sizeGroup.isMsgInSection(ZmMailListSizeGroup.MEDIUM, msg);
			UT.equal(result, true, AjxUtil.formatSize(msg.size, false, 5) + " = " + result + " for section MEDIUM");
		}

		for (var i=0; i<this._largeSize.length; i++) {
			msg.size = this._largeSize[i];
			result = sizeGroup.isMsgInSection(ZmMailListSizeGroup.LARGE, msg);
			UT.equal(result, true, AjxUtil.formatSize(msg.size, false, 5) + " = " + result + " for section LARGE");
		}

		for (var i=0; i<this._veryLargeSize.length; i++) {
			msg.size = this._veryLargeSize[i];
			result = sizeGroup.isMsgInSection(ZmMailListSizeGroup.VERY_LARGE, msg);
			UT.equal(result, true, AjxUtil.formatSize(msg.size, false, 5) + " = " + result + " for section VERY LARGE");
		}

		for (var i=0; i<this._hugeSize.length; i++) {
			msg.size = this._hugeSize[i];
			result = sizeGroup.isMsgInSection(ZmMailListSizeGroup.HUGE, msg);
			UT.equal(result, true, AjxUtil.formatSize(msg.size, false, 5) + " = " + result + " for section HUGE");
		}

		for (var i=0; i<this._enormousSize.length; i++) {
			msg.size = this._enormousSize[i];
			result = sizeGroup.isMsgInSection(ZmMailListSizeGroup.ENORMOUS, msg);
			UT.equal(result, true, AjxUtil.formatSize(msg.size, false, 5) + " = " + result + " for section ENORMOUS");
		}
	}
);


