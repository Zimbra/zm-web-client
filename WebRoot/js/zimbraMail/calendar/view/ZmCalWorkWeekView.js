/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2013, 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an "AS IS" basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2013, 2014 Zimbra, Inc. All Rights Reserved. 
 * ***** END LICENSE BLOCK *****
 */

ZmCalWorkWeekView = function(parent, posStyle, controller, dropTgt) {
    var workingDays = ZmCalBaseView.parseWorkingHours(ZmCalBaseView.getWorkingHours()),
        numOfWorkingDays = 0,
        i;
    for(i=0; i<workingDays.length; i++) {
        if(workingDays[i].isWorkingDay) {
            numOfWorkingDays++;    
        }
    }
	ZmCalColView.call(this, parent, posStyle, controller, dropTgt, ZmId.VIEW_CAL_WORK_WEEK, numOfWorkingDays, false);
}

ZmCalWorkWeekView.prototype = new ZmCalColView;
ZmCalWorkWeekView.prototype.constructor = ZmCalWorkWeekView;

ZmCalWorkWeekView.prototype.toString = 
function() {
	return "ZmCalWorkWeekView";
}

/**
 * Returns the available start time in work week view
 *
 * @param   {ZmAppt} appt
 *
 * @return	{Time} or <code>null</code> if start time is not available
 */
ZmCalWorkWeekView.prototype.getAvailableStartTime = function(appt) {
	// If appointment start date is available in the view then just return start time
	if (this._getDayForDate(appt.startDate)) {
		return appt.startTime;
	}
	if (appt.isMultiDay()) {
		//If multi-day appointment start date is not available in the view then try to find the next available day by rolling the start date to next day.
		var startTime = Math.max(appt.getStartTime(), this._timeRangeStart);
		var endTime = Math.min(appt.getEndTime(), this._timeRangeEnd);
		while (startTime < endTime) {
			var startDate = new Date(startTime);
			if (this._getDayForDate(startDate)) {
				return startTime;
			}
			AjxDateUtil.rollToNextDay(startDate);
			startTime = startDate.getTime();
		}
	}
	return null;
};
