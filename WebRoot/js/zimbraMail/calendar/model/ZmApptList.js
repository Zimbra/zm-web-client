/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
* Create a new, empty appt list.
* @constructor
* @class
* This class represents a list of appts.
*
*/
function ZmApptList(appCtxt) {
	
	ZmList.call(this, ZmItem.APPT, appCtxt);
};

ZmApptList.prototype = new ZmList;
ZmApptList.prototype.constructor = ZmApptList;

ZmApptList.prototype.toString = 
function() {
	return "ZmApptList";
};

ZmApptList._fba2ptst = {
	B: ZmAppt.PSTATUS_ACCEPT,
	F: ZmAppt.PSTATUS_DECLINED,
	T: ZmAppt.PSTATUS_TENTATIVE
};
			
ZmApptList.prototype._getAttr =
function(appt, inst, name) {
	var v = inst[name];
	return (v != undefined) ? v : ((appt[name] != null) ? appt[name] : null);
};

ZmApptList.prototype.loadFromSummaryJs =
function(resp) {
	if (!resp.appt)
		return;
	// go through each <appt> node		
	var appts = resp.appt;
	for (var i = 0; i < appts.length; i++) {
		var apptNode = appts[i];
		if (!apptNode.inst) continue;
		// Now deal with instances		
		var instances = apptNode.inst;
		// emc 8/24/2005 - instanceStartTimes is a workaround for bug 3590.
		// When the server side is fixed, we can remove the few lines containing
		// instanceStartTimes.
		var instanceStartTimes = new AjxVector();
		for (var j = 0; j < instances.length; j++) {
			var instNode = instances[j];
            var allDay = instNode.allDay != null ? instNode.allDay : apptNode.allDay;
            var adjustMs = allDay ? instNode.tzo + new Date(instNode.s).getTimezoneOffset()*60*1000 : 0;
			var startTime = parseInt(this._getAttr(apptNode, instNode, "s"),10) + adjustMs;
			if (instanceStartTimes.contains(startTime)) {
				continue;
			}
			instanceStartTimes.add(startTime);
			var appt = new ZmAppt(this._appCtxt, this);
			appt.uid =  apptNode.uid;
			appt.folderId = apptNode.l || ZmOrganizer.ID_CALENDAR;

			appt.fragment = this._getAttr(apptNode, instNode, "fr");			
			var duration = parseInt(this._getAttr(apptNode, instNode, "d"));
			appt.type = this._getAttr(apptNode, instNode, "type");
			appt.isOrg = this._getAttr(apptNode, instNode, "isOrg");
			appt.transparency = this._getAttr(apptNode, instNode,"transp");
			appt.status = this._getAttr(apptNode, instNode,"status");
			appt.ptst = this._getAttr(apptNode, instNode,"ptst");			
			appt.id = this._getAttr(apptNode, instNode, "id");
			appt.invId = this._getAttr(apptNode, instNode, "invId");
			appt.compNum = this._getAttr(apptNode, instNode, "compNum");
			appt.exception = this._getAttr(apptNode, instNode, "ex");
			appt.allDayEvent = this._getAttr(apptNode, instNode, "allDay");
			appt.allDayEvent = (appt.allDayEvent == true)? '1' :'0';
			if (appt.allDayEvent == null) appt.allDayEvent = '0';
			appt.otherAttendees = this._getAttr(apptNode, instNode, "otherAtt");
			appt.alarm = this._getAttr(apptNode, instNode, "alarm");
			appt.recurring = instNode.recur != null ? instNode.recur : apptNode.recur;
			if (appt.recurring) {
				appt._seriesInvId = apptNode.invId;
			}
			appt.name = this._getAttr(apptNode, instNode, "name");
			appt.setAttendees(this._getAttr(apptNode, instNode, "loc"), ZmAppt.LOCATION);
			appt.startDate = new Date(startTime);
			appt._uniqStartTime = appt.startDate.getTime(); // neede to construct uniq id later
			if (instNode.fba && ZmApptList._fba2ptst[instNode.fba]) {
				// override appt.ptst for this instance
				appt.ptst = ZmApptList._fba2ptst[instNode.fba];
			}
			//appt.exception = this._getAttr(apptNode, instNode, "exception");
			var endTime = startTime + duration;
			appt.endDate = new Date(endTime);
            appt.setTimezone(AjxTimezone.getServerId(AjxTimezone.DEFAULT));
            this.add(appt);
		}
	}
}

ZmApptList.prototype.indexOf =
function (obj) {
	return this._vector.indexOf(obj);
};

ZmApptList.sortVector = 
function(vec) {
	vec.sort(ZmAppt.compareByTimeAndDuration);
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
	var result  = new AjxVector();
	var list = apptList.getVector();
	var size = list.size();
	for (var i=0; i < size; i++) {
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
			nextDay.setHours(0,0,0,0);
			if (AjxDateUtil.isInRange(apptStartTime, nextDay.getTime(), startTime, endTime)) {
				var slice = ZmAppt.quickClone(appt);
                if (outOfBounds) {
                    slice.startDate = new Date(startTime);
                }
                slice._fanoutFirst = (fanoutNum == 0);
				slice._orig = orig;
				slice.setEndDate(nextDay);			
				slice._fanoutLast = (slice.getEndTime() == orig.getEndTime());	
				slice._fanoutNum = fanoutNum;
				slice._uniqStartTime = slice.getStartTime(); // neede to construct uniq id later							
				result.add(slice);
			}
			fanoutNum++;
			appt.setStartDate(nextDay);
			if (appt.getStartTime() >= appt.getEndTime())
				break;				
		} else {
			if (appt.isInRange(startTime,endTime)) {
				appt._fanoutFirst = (fanoutNum == 0);	
				appt._fanoutLast = (appt.getEndTime() == orig.getEndTime());				
				if (!appt._fanoutFirst)
					appt._orig = orig;
				appt._fanoutNum = fanoutNum;
				appt._uniqStartTime = appt.getStartTime(); // neede to construct uniq id later
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
	var result  = new ZmApptList(this._appCtxt);
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
