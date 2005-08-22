/*
***** BEGIN LICENSE BLOCK *****
Version: ZPL 1.1

The contents of this file are subject to the Zimbra Public License Version 1.1 ("License");
You may not use this file except in compliance with the License. You may obtain a copy of
the License at http://www.zimbra.com/license

Software distributed under the License is distributed on an "AS IS" basis, WITHOUT WARRANTY
OF ANY KIND, either express or implied. See the License for the specific language governing
rights and limitations under the License.

The Original Code is: Zimbra Collaboration Suite.

The Initial Developer of the Original Code is Zimbra, Inc.
Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
All Rights Reserved.
Contributor(s): ______________________________________.

***** END LICENSE BLOCK *****
*/

function ZmCalWeekView(parent, posStyle, dropTgt) {
	if (arguments.length == 0) return;
	ZmCalDayView.call(this, parent, posStyle, dropTgt, ZmController.CAL_WEEK_VIEW, 7);
}

ZmCalWeekView.prototype = new ZmCalDayView;
ZmCalWeekView.prototype.constructor = ZmCalWeekView;

ZmCalWeekView.prototype.toString = 
function() {
	return "ZmCalWeekView";
}
