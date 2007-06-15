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
* Creates a new appointment tab.
* @constructor
* @class
* This is the main screen for creating/editing an appointment. It provides inputs
* for the various appointment details.
*
* @author Parag Shah
*
* @param parent				[DwtComposite]				the appt compose view
* @param appCtxt 			[ZmAppCtxt]					app context
* @param attendees			[hash]						attendees/locations/equipment
* @param controller			[ZmApptComposeController]	the appt compose controller
* @param dateInfo			[object]					hash of date info
*/
ZmApptTabViewPage = function(parent, appCtxt, attendees, controller, dateInfo) {
	if (arguments.length == 0) return;

	DwtTabViewPage.call(this, parent);

	this._controller = controller;
	this._editView = new ZmApptEditView(this, appCtxt, attendees, controller, dateInfo);
};

ZmApptTabViewPage.prototype = new DwtTabViewPage;
ZmApptTabViewPage.prototype.constructor = ZmApptTabViewPage;

ZmApptTabViewPage.prototype.toString =
function() {
	return "ZmApptTabViewPage";
};


// Public

ZmApptTabViewPage.prototype.showMe =
function() {
	if (!this._editView.isRendered()) return;

	this._editView.show();
	this.parent.tabSwitched(this._tabKey);
	this._controller._setComposeTabGroup(true);
};

ZmApptTabViewPage.prototype.tabBlur =
function(useException) {
	this._editView.blur();
};

ZmApptTabViewPage.prototype.getEditView =
function() {
	return this._editView;
};

ZmApptTabViewPage.prototype.initialize =
function(appt, mode, isDirty) {
	this._editView.initialize(appt, mode, isDirty);
};

ZmApptTabViewPage.prototype.isDirty =
function(excludeAttendees) {
	return this._editView.isDirty(excludeAttendees);
};

ZmApptTabViewPage.prototype.cleanup =
function() {
	this._editView.cleanup();
};

ZmApptTabViewPage.prototype.createHtml =
function() {
	this._editView.createHtml();
};

ZmApptTabViewPage.prototype.resize =
function(newWidth, newHeight) {
	this._editView.resize(newWidth, newHeight);
};

ZmApptTabViewPage.prototype.isValid =
function() {
	return this._editView.isValid();
};

ZmApptTabViewPage.prototype.getTabPage =
function(id) {
	return this.parent.getTabPage(id);
};

// Private / protected methods

ZmApptTabViewPage.prototype._addTabGroupMembers =
function(tabGroup) {
	this._editView._addTabGroupMembers(tabGroup);
};

ZmApptTabViewPage.prototype._getDefaultFocusItem =
function() {
	this._editView._getDefaultFocusItem();
};
