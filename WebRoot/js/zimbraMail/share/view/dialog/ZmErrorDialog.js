/*
***** BEGIN LICENSE BLOCK *****
Version: ZAPL 1.1

The contents of this file are subject to the Zimbra AJAX Public License Version 1.1 ("License");
You may not use this file except in compliance with the License. You may obtain a copy of the
License at http://www.zimbra.com/license

Software distributed under the License is distributed on an "AS IS" basis, WITHOUT WARRANTY OF
ANY KIND, either express or implied. See the License for the specific language governing rights
and limitations under the License.

The Original Code is: Zimbra AJAX Toolkit.

The Initial Developer of the Original Code is Zimbra, Inc.
Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
All Rights Reserved.
Contributor(s): ______________________________________.

***** END LICENSE BLOCK *****
*/

/**
* Creates an error dialog which basically means it will have a "Report" button
* @constructor
* @class
* A normal DwtMessageDialog w/ a "Report" button that will post user info to the 
* server when clicked.
*/
function ZmErrorDialog(parent, appCtxt) {
	if (arguments.length == 0) return;

	// go ahead and cache the navigator info now (since it should never change)		
	this._strNav = this._getNavigatorInfo();

	var newButton = new DwtDialog_ButtonDescriptor(ZmErrorDialog.REPORT_BUTTON, ZmMsg.report, DwtDialog.ALIGN_LEFT);
	DwtMessageDialog.call(this, parent, null, null, [newButton]);

	this._appCtxt = appCtxt;
	this.registerCallback(ZmErrorDialog.REPORT_BUTTON, this._reportCallback, this);
};

ZmErrorDialog.prototype = new DwtMessageDialog;
ZmErrorDialog.prototype.constructor = ZmErrorDialog;


// Consts

ZmErrorDialog.REPORT_BUTTON = DwtDialog.LAST_BUTTON + 1;
ZmErrorDialog.REPORT_URL = "http://localhost:7070/zimbra/public/errorreport.jsp";

// Public methods

ZmErrorDialog.prototype.toString = 
function() {
	return "ZmErrorDialog";
};

ZmErrorDialog.prototype._getNavigatorInfo = 
function() {
	var strNav = new Array();
	var idx = 0;
	
	for (var i in navigator)
		strNav[idx++] = i + ": " + navigator[i] + "\n";
	// lets add the url the user has used to connect as well..
	strNav[idx++] = "href: " + location.href + "\n";

	return strNav.join("");
}

ZmErrorDialog.prototype._getUserPrefs = 
function() {
	var strPrefs = new Array();
	var idx = 0;

	for (var i in ZmSetting.INIT) {
		if (ZmSetting.INIT[i][0])
			strPrefs[idx++] = ZmSetting.INIT[i][0] + ": " + (ZmSetting.INIT[i][3] || "") + "\n";
	}
	// add the user name at the end
	strPrefs[idx++] = "username: " + this._appCtxt.getUsername() + "\n";
	strPrefs[idx++] = "currentSearch: " + this._appCtxt.getCurrentSearch().query + "\n";

	return strPrefs.join("");
};

// Callbacks

ZmErrorDialog.prototype._reportCallback = 
function() {
	// initialization...
	var formId = Dwt.getNextId();
	var iframe = this.getDocument().createElement("iframe");
	iframe.style.width = iframe.style.height = 0;
	iframe.style.visibility = "hidden";
	var contentDiv = this._getContentDiv();
	contentDiv.appendChild(iframe);
	
	// get the prefs for this user
	var strPrefs = this._getUserPrefs();

	// generate html form for submission via POST
	var html = new Array();
	var idx = 0;
	html[idx++] = "<html><head></head><body>";
	html[idx++] = "<form id='" + formId + "' method='POST' action='" + ZmErrorDialog.REPORT_URL + "'>";
	html[idx++] = "<textarea name='details'>" + this._detailStr + "</textarea>";
	html[idx++] = "<textarea name='navigator'>" + this._strNav + "</textarea>";
	html[idx++] = "<textarea name='prefs'>" + strPrefs + "</textarea>";
	html[idx++] = "</form>";
	html[idx++] = "</body></html>";

	var idoc = Dwt.getIframeDoc(iframe);
	idoc.open();
	idoc.write(html.join(""));
	idoc.close();
	
	// submit the form!
	var form = idoc.getElementById(formId);
	if (form)
		form.submit();

	// clean up
	contentDiv.removeChild(iframe);
	iframe = null;
	this.popdown();
};
