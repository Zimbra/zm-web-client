/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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


