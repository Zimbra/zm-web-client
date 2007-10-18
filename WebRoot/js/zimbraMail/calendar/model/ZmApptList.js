/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
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

/**
 * Create a new, empty appt list.
 * @constructor
 * @class
 * This class represents a list of appts.
 */
ZmApptList = function() {
	ZmList.call(this, ZmItem.APPT);
};

ZmApptList.prototype = new ZmList;
ZmApptList.prototype.constructor = ZmApptList;

ZmApptList.prototype.toString = 
function() {
	return "ZmApptList";
};

ZmApptList.prototype.loadFromSummaryJs =
function(appts) {
	if (!appts) { return; }

	for (var i = 0; i < appts.length; i++) {
		var apptNode = appts[i];
		var instances = apptNode ? apptNode.inst : null;
		if (instances) {
			var args = {list:this};
			for (var j = 0; j < instances.length; j++) {
				var appt = ZmAppt.createFromDom(apptNode, args, instances[j]);
				if (appt) this.add(appt);
			}
		}
	}
}

ZmApptList.prototype.indexOf =
function(obj) {
	return this._vector.indexOf(obj);
};

ZmApptList.sortVector = 
function(vec) {
	vec.sort(ZmCalItem.compareByTimeAndDuration);
};

// merge all the sorted vectors in the specified array into a single sorted vector
ZmApptList.mergeVectors = 
function(vecArray) {
	// clone the single array case!
	if (vecArray.length == 1) return vecArray[0].clone();
	var result = new AjxVector();
	for (var i=0; i < vecArray.length; i++) result.addList(vecArray[i]);
	ZmApptList.sortVector(result);
	return result;
};

ZmApptList.toVector =
function(apptList, startTime, endTime, fanoutAllDay) {
	var result = new AjxVector();
	var list = apptList.getVector();
	var size = list.size();
	for (var i = 0; i < size; i++) {
		var ao = list.get(i);
		if (ao.isInRange(startTime, endTime)) {
			if (ao.isAllDayEvent() && !fanoutAllDay) {
				result.add(ZmAppt.quickClone(ao));
			} else {
				ZmApptList._fanout(ao, result, startTime, endTime, fanoutAllDay);
			}
		}
	}
	ZmApptList.sortVector(result);
	return result;
};

// fanout multi-day appoints into multiple single day appts. This has nothing to do with recurrence...
// TODO: should be more efficient by not fanning out appts in if part of the while if they are not in the range.
ZmApptList._fanout =
function(orig, result, startTime, endTime) {
	var appt = ZmAppt.quickClone(orig);
	var fanoutNum = 0;

	// HACK: Avoid "strange" appt durations that occur at transition
	//       days for timezones w/ DST. For example, going from DST to
	//       STD, the duration for a single day is 25 hours; while the
	//       transition from STD to DST, the duration is 23 hours. So
	//       we advance 12 hours (just to be safe) and then subtract
	//       off the extra hours.
	var origEndTime = orig.getEndTime();
	if (appt.isAllDayEvent()) {
		var origEndDate = new Date(origEndTime);
		origEndDate.setHours(0, 0, 0, 0);

		appt.setEndDate(origEndDate);
		origEndTime = origEndDate.getTime();
	}

	while (appt.isInRange(startTime,endTime)) {
		if (appt.isMultiDay()) {
			var apptStartTime = appt.getStartTime();
			// bug 12205: If someone mistypes "2007" as "200", we get into
			//            a seemingly never-ending loop trying to fanout
			//            every day even *before* the startTime of the view.
			var outOfBounds = apptStartTime < startTime;
			if (outOfBounds) {
				apptStartTime = startTime;
			}
			var nextDay = new Date(apptStartTime);
			nextDay.setDate(nextDay.getDate()+1);
			if (origEndTime < nextDay.getTime()) {
				nextDay = new Date(origEndTime);
			}
			nextDay.setHours(0,0,0,0);
			if (AjxDateUtil.isInRange(apptStartTime, nextDay.getTime(), startTime, endTime)) {
				var slice = ZmAppt.quickClone(appt);
				if (outOfBounds) {
					slice.startDate = new Date(startTime);
				}
				slice._fanoutFirst = (fanoutNum == 0);
				slice._orig = orig;
				slice.setEndDate(nextDay);
				slice._fanoutLast = (slice.getEndTime() == origEndTime);
				slice._fanoutNum = fanoutNum;
				slice.uniqStartTime = slice.getStartTime();					// need to construct uniq id later
				result.add(slice);
			}
			fanoutNum++;
			appt.setStartDate(nextDay);
			if (appt.getStartTime() >= appt.getEndTime())
				break;
		} else {
			if (appt.isInRange(startTime,endTime)) {
				appt._fanoutFirst = fanoutNum == 0;
				appt._fanoutLast = appt.getEndTime() == origEndTime;
				if (!appt._fanoutFirst)
					appt._orig = orig;
				appt._fanoutNum = fanoutNum;
				appt.uniqStartTime = appt.getStartTime();						// need to construct uniq id later
				result.add(appt);
			}
			break;
		}
	}
};

// given an app list, return a new appt list containing only appts in the given range.
// doesn't clone appts
ZmApptList.prototype.getSubset =
function(startTime, endTime) {
	var result  = new ZmApptList();
	var list = this.getVector();
	var size = list.size();
	for (var i=0; i < size; i++) {
		var ao = list.get(i);
		if (ao.isInRange(startTime, endTime)) {
			result.add(ao);
		}
	}
	return result;
};
