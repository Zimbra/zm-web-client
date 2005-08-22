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

/**
 * @class ZmCalendarPreferencesView
 * handles the layout of the mail preferences.
 */ 
function ZmCalendarPreferencesView(parent, app) {
    DwtTabViewPage.call(this, parent, "ZmCalendarPreferencesView");
    this._fieldIds = new Object(); //stores the ids of all the form elements
    
    // _fieldIds[] - this is a map, the keys are the field names of the 
    // mail user preference fields.
    // Account object and values are ids of the corresponding form fields 
    	
    this._app = app;
    this._createHTML();
};

// Descend the class from DwtTabViewPage
ZmCalendarPreferencesView.prototype = new DwtTabViewPage;
ZmCalendarPreferencesView.prototype.constructor = ZmCalendarPreferencesView;


ZmCalendarPreferencesView.DAY_TIMES = 
    new Array('12:00', '12:30', '1:00', '1:30',
	      '2:00', '2:30', '3:00','3:30', 
	      '4:00', '4:30', '5:00', '5:30', 
	      '6:00', '6:30', '7:00', '7:30', 
	      '8:00', '8:30', '9:00', '9:30', 
	      '10:00','10:30', '11:00', '11:30'
	      );


ZmCalendarPreferencesView.prototype._createOptionTablePre = 
    function(title, imageInfo, html, idx) {
    html[idx++] = "<div class='TitleBar'>";
    
    html[idx++] = "<div class='horizSep'></div>";
    html[idx++] = "<table cellpadding='0' cellspacing='2' border='0'>";
    //html[idx++] = "<col/>";
    html[idx++] = "<col style='width: 32px;'/>";	
    html[idx++] = "<col/>";
    html[idx++] = "<tr valign='center'><td>";
    html[idx++] = AjxImg.getImageHtml(imageInfo);
    html[idx++] = "</td><td>";	
    html[idx++] = "<div class='Title'>";
    html[idx++] = title;
    html[idx++] = "</div>";
    html[idx++] = "</td></tr>";
    html[idx++] = "</table>";
    html[idx++] = "<div class='horizSep'></div>";
    html[idx++] = "</div>";
    return idx;
};

ZmCalendarPreferencesView.prototype._createHTML = function () {
    var div = this.getDocument().createElement("div");
    var html = new Array(25);
    var idx = 0;
    idx = this._createOptionTablePre("Calendar Options", ZmImg.IN_CALENDAR, html, idx);
    
    html[idx++] = "<table cellpadding='0' cellspacing='5' border='0' style='width:100%'>";
    
    html[idx++] = "<tr valign='center'><td align='left'>Week begins on:&nbsp;</td>";
    var beginsOnId = Dwt.getNextId();
    //AjxLog.info("Id for cell = " + beginsOnId);
    html[idx++] = "<td id= " + beginsOnId + ">&nbsp;";
    html[idx++] = "</td></tr>";
    
    html[idx++] = "<tr valign='center'><td align='left'>Day start time:&nbsp;</td>";
    var startTimeId = Dwt.getNextId();
    html[idx++] = "<td id=" + startTimeId + ">";
    html[idx++] = "</td></tr>";
    
    html[idx++] = "<tr valign='center'><td align='left'>Day end time:&nbsp;</td>";
    var endTimeId = Dwt.getNextId();
    html[idx++] = "<td id =" + endTimeId + ">";
    html[idx++] = "</td></tr>";
    
    html[idx++] = "</table>";
    
    //idx = this._createOptionTablePost(html, idx);
    div.innerHTML = html.join("");
    this.getHtmlElement().appendChild(div);
    var el = document.getElementById(beginsOnId);
    var sel = new DwtSelect(this);
    var optionId = sel.addOption("Sunday", true);
    optionId = sel.addOption("Monday");
    optionId = sel.addOption("Tuesday");
    optionId = sel.addOption("Wednesday");
    optionId = sel.addOption("Thursday");
    optionId = sel.addOption("Friday");
    optionId = sel.addOption("Saturday");

    el.appendChild(sel.getHtmlElement());

    el = document.getElementById(startTimeId);
    sel = new DwtSelect(this);
    for (i = 0; i < ZmCalendarPreferencesView.DAY_TIMES.length; ++i) {
        optionId = 
            sel.addOption(ZmCalendarPreferencesView.DAY_TIMES[i] + " AM");
    	if (i == 16) { 
            sel.setSelected(optionId);
    	}
    }
    i = 0;
    for (; i< ZmCalendarPreferencesView.DAY_TIMES.length; ++i) {
        optionId = 
            sel.addOption(ZmCalendarPreferencesView.DAY_TIMES[i] + " PM");
    }
    el.appendChild(sel.getHtmlElement());

    el = document.getElementById(endTimeId);
    sel = new DwtSelect(this);
    i = 0;
    for ( ; i <ZmCalendarPreferencesView.DAY_TIMES.length ; ++i) {
        optionId = 
            sel.addOption(ZmCalendarPreferencesView.DAY_TIMES[i] + " AM");
    }
    i = 0;
    for (; i< ZmCalendarPreferencesView.DAY_TIMES.length; ++i) {
        optionId = 
            sel.addOption(ZmCalendarPreferencesView.DAY_TIMES[i] + " PM");
	if (i == 10) {
            sel.setSelected(optionId);
	}
    }
    el.appendChild(sel.getHtmlElement());
};
