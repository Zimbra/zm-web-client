/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
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

ZmCalDayView = function(parent, posStyle, controller, dropTgt, view, numDays) {
	ZmCalColView.call(this, parent, posStyle, controller, dropTgt, ZmId.VIEW_CAL_DAY, 1, false);
}

ZmCalDayView.prototype = new ZmCalColView;
ZmCalDayView.prototype.constructor = ZmCalDayView;

ZmCalDayView.prototype.toString = 
function() {
	return "ZmCalDayView";
}
