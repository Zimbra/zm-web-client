/**
* Create a new, empty appt list.
* @constructor
* @class
* This class represents a list of appts.
*
*/
function ZmApptList(appCtxt) {
	
	ZmList.call(this, ZmItem.APPT, appCtxt);
}

ZmApptList.prototype = new ZmList;
ZmApptList.prototype.constructor = ZmApptList;

ZmApptList.prototype.toString = 
function() {
	return "ZmApptList";
}

ZmApptList.prototype._getAttr =
function(appt, inst, name)
{
	var v = inst[name];
	return (v !=  undefined) ? v : ( (appt[name] != null)? appt[name]: null);
}

ZmApptList.prototype.loadFromSummaryJs =
function(resp) {
	if (!resp.appt)
		return;
	// go through each <appt> node		
	var appts = resp.appt;
	for (var i = 0; i < appts.length; i++) {
		var apptNode = appts[i];
		//DBG.println(" appt = "+apptNode.uid);
		if (!apptNode.inst) continue;
		// Now deal with instances		
		var instances = apptNode.inst;
		for (var j = 0; j < instances.length; j++) {
			var appt = new ZmAppt(this._appCtxt, this);
			appt.uid =  apptNode.uid;
			appt.notes = apptNode.fr;	
			var instNode = instances[j];
			var duration = parseInt(this._getAttr(apptNode, instNode, "d"));
			appt.type = this._getAttr(apptNode, instNode, "type");
			appt.transparency = this._getAttr(apptNode, instNode,"transp");
			appt.status = this._getAttr(apptNode, instNode,"status");
			appt.ptst = this._getAttr(apptNode, instNode,"ptst");			
			appt.id = this._getAttr(apptNode, instNode, "id");
			appt.invId = this._getAttr(apptNode, instNode, "invId");
			appt.compNum = this._getAttr(apptNode, instNode, "compNum");
			appt.exception = this._getAttr(apptNode, instNode, "ex");
			appt.allDayEvent = this._getAttr(apptNode, instNode, "allDay");
			if (appt.allDayEvent == null) appt.allDayEvent = '0';
			appt.otherAttendees = this._getAttr(apptNode, instNode, "otherAtt");
			appt.alarm = this._getAttr(apptNode, instNode, "alarm");
			appt.recurring = apptNode.recur;//this._getAttr(apptNode, instNode, "recur");
			if (appt.recurring) {
				appt._seriesInvId = apptNode.invId;
			}
			appt.name = this._getAttr(apptNode, instNode, "name");
			appt.location = this._getAttr(apptNode, instNode, "loc");
			var startTime = parseInt(this._getAttr(apptNode, instNode, "s"));
			appt.startDate = new Date(startTime);
			appt._uniqStartTime = appt.startDate.getTime(); // neede to construct uniq id later
			//appt.exception = this._getAttr(apptNode, instNode, "exception");
			var endTime = startTime + duration;
			appt.endDate = new Date(endTime);
			this.add(appt);
		}
		//DBG.println("   added: "+appt);
	}
}

ZmApptList.prototype.indexOf =
function (obj) {
	return this._vector.indexOf(obj);
};

ZmApptList.toVector =
function(apptList, startTime, endTime, fanoutAllDay)
{
	var _st = new Date();
	var result  = new AjxVector();
	var list = apptList.getVector();
	var size = list.size();
	for (var i=0; i < size; i++) {
		var ao = list.get(i);
		//DBG.println("_appListToVector: "+ao);
		if (ao.isInRange(startTime, endTime)) {
			if (ao.isAllDayEvent() && !fanoutAllDay) {
				result.add(ao.clone());
			} else {
				ZmApptList._fanout(ao, result, startTime, endTime, fanoutAllDay);
			}
		}
	}
	result.getArray().sort(ZmAppt.compareByTimeAndDuration);
	DBG.println("ZmApptList.toVector took " + (new Date() - _st.getTime()) + "ms");		
	return result;
}

// fanout multi-day appoints into multiple single day appts. This has nothing to do with recurrence...
// TODO: should be more efficient by not fanning out appts in if part of the while if they are not in the range.
ZmApptList._fanout =
function(orig, result, startTime, endTime) {
//	DBG.println("fanout>>>>>>>>>>>>>>>>>>>>");
	var appt = orig.clone();
	var fanoutNum = 0;
	while (appt.isInRange(startTime,endTime)) {
		if (appt.isMultiDay()) {
			var nextDay = new Date(appt.getStartTime());
			nextDay.setDate(nextDay.getDate()+1);
			nextDay.setHours(0,0,0,0);
			if (AjxDateUtil.isInRange(appt.getStartTime(), nextDay.getTime(), startTime, endTime)) {
				var slice = appt.clone();
				slice._fanoutFirst = (fanoutNum == 0);
				slice._orig = orig;
				slice.setEndDate(nextDay);			
				slice._fanoutZast = (slice.getEndTime() == orig.getEndTime());	
				slice._fanoutNum = fanoutNum;
				slice._uniqStartTime = slice.getStartTime(); // neede to construct uniq id later							
				result.add(slice);
				//DBG.println("_fanout add: "+slice);
			}
			fanoutNum++;
			appt.setStartDate(nextDay);
			if (appt.getStartTime() >= appt.getEndTime())
				break;				
		} else {
			if (appt.isInRange(startTime,endTime)) {
				appt._fanoutFirst = (fanoutNum == 0);	
				appt._fanoutZast = (appt.getEndTime() == orig.getEndTime());				
				if (!appt._fanoutFirst)
					appt._orig = orig;
				appt._fanoutNum = fanoutNum;
				appt._uniqStartTime = appt.getStartTime(); // neede to construct uniq id later
				result.add(appt);
				//DBG.println("_fanout add: "+appt);
			}
			break;
		}
	}
//	DBG.println("fanout<<<<<<<<<<<<<<<<<<<<");
}


// given an app list, return a new appt list containing only appts in the given range.
// doesn't clone appts
ZmApptList.prototype.getSubset =
function(startTime, endTime)
{
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
}

