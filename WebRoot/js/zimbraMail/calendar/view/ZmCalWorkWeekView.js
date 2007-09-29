/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

function ZmCalWorkWeekView(parent, posStyle, controller, dropTgt) {
	ZmCalColView.call(this, parent, posStyle, controller, dropTgt, ZmController.CAL_WORK_WEEK_VIEW, 5, false);
}

ZmCalWorkWeekView.prototype = new ZmCalColView;
ZmCalWorkWeekView.prototype.constructor = ZmCalWorkWeekView;

ZmCalWorkWeekView.prototype.toString = 
function() {
	return "ZmCalWorkWeekView";
}


