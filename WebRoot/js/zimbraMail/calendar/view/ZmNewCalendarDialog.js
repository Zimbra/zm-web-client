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
 * Portions created by Zimbra are Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

ZmNewCalendarDialog = function(parent, className) {
	var title = ZmMsg.createNewCalendar;
	var type = ZmOrganizer.CALENDAR;
	ZmNewOrganizerDialog.call(this, parent, className, title, type);
};

ZmNewCalendarDialog.prototype = new ZmNewOrganizerDialog;
ZmNewCalendarDialog.prototype.constructor = ZmNewCalendarDialog;

ZmNewCalendarDialog.prototype.toString = 
function() {
	return "ZmNewCalendarDialog";
};

// Public methods

ZmNewCalendarDialog.prototype.reset =
function() {
	ZmNewOrganizerDialog.prototype.reset.call(this);
	this._excludeFbCheckbox.checked = false;
};

// Protected methods

ZmNewCalendarDialog.prototype._getRemoteLabel =
function() {
	return ZmMsg.addRemoteAppts;
};

ZmNewCalendarDialog.prototype._createExtraContentHtml =
function(html, idx) {
	idx = this._createFreeBusyContentHtml(html, idx);
	return ZmNewOrganizerDialog.prototype._createExtraContentHtml.call(this, html, idx);
};

ZmNewCalendarDialog.prototype._createFreeBusyContentHtml =
function(html, idx) {
	this._excludeFbCheckboxId	= Dwt.getNextId();

	html[idx++] = "<tr><td colspan=2>";
	html[idx++] = "<table cellpadding=0 cellspacing=5 border=0>";
	html[idx++] = "<tr valign='center'><td class='Label'>";
	html[idx++] = "<input type='checkbox' id='";
	html[idx++] = this._excludeFbCheckboxId;
	html[idx++] = "'/></td><td>";
	html[idx++] = ZmMsg.excludeFromFreeBusy;
	html[idx++] = "</td></tr>";
	html[idx++] = "</table>";	
	html[idx++] = "</td></tr>";

	return idx;
};

// NOTE: new calendar dialog doesn't show overview
ZmNewCalendarDialog.prototype._createFolderContentHtml = 
function(html, idx) {
	return idx;
};

ZmNewCalendarDialog.prototype._setupExtraControls =
function() {
	ZmNewOrganizerDialog.prototype._setupExtraControls.call(this);
	this._setupFreeBusyControl();
};

ZmNewCalendarDialog.prototype._setupFreeBusyControl =
function() {
	this._excludeFbCheckbox = document.getElementById(this._excludeFbCheckboxId);
};

/** 
 * Checks the input for validity and returns the following array of values:
 * <ul>
 * <li> parentFolder
 * <li> name
 * <li> color
 * <li> URL
 * <li> excludeFB
 * </ul>
 */
ZmNewCalendarDialog.prototype._getFolderData =
function() {
	var data = ZmNewOrganizerDialog.prototype._getFolderData.call(this);
	if (data) {
		data.f = this._excludeFbCheckbox.checked ? "b#" : "#";
	}
	return data;
};
