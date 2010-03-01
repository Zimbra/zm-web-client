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
/**
 * Creates a new appointment tab.
 * @constructor
 * @class
 * This is the main screen for creating/editing an appointment. It provides inputs
 * for the various appointment details.
 *
 * @author Parag Shah
 *
 * @param {DwtComposite}	parent			the appt compose view
 * @param {Hash}	attendees			the attendees/locations/equipment
 * @param {ZmApptComposeController}	controller		the appt compose controller
 * @param {Hash}	dateInfo			the hash of date info
 * 
 * @extends		DwtTabViewPage
 * @private
 */
ZmApptTabViewPage = function(parent, attendees, controller, dateInfo) {
	if (arguments.length == 0) return;

	DwtTabViewPage.call(this, parent);

	this._controller = controller;
	this._editView = new ZmApptEditView(this, attendees, controller, dateInfo);
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
function(appt, mode, isDirty, isForward) {
	this._editView.initialize(appt, mode, isDirty, isForward);
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

ZmApptTabViewPage.prototype.toggleAllDayField =
function() {
	this._editView.toggleAllDayField();
};

ZmApptTabViewPage.prototype.setApptLocation =
function(val) {
	this._editView.setApptLocation(val);
};
