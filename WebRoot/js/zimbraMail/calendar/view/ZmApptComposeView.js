/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
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
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

/**
* Creates a new appointment view. The view does not display itself on construction.
* @constructor
* @class
* This class provides a form for creating/editing appointments. It is a tab view with
* five tabs: the appt form, a scheduling page, and three pickers (one each for finding
* attendees, locations, and resources). The attendee data (people, locations, and
* resources are all attendees) is maintained here centrally, since it is presented and
* can be modified in each of the five tabs.
*
* @author Parag Shah
*
* @param parent			[DwtShell]					the element that created this view
* @param className 		[string]*					class name for this view
* @param calApp			[ZmCalendarApp]				a handle to the owning calendar application
* @param controller		[ZmApptComposeController]	the controller for this view
*/
function ZmApptComposeView(parent, className, calApp, controller) {

	className = className ? className : "ZmApptComposeView";
	DwtTabView.call(this, parent, className, Dwt.ABSOLUTE_STYLE);
	
	this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);
	this._app = calApp;
	this._controller = controller;
	
	this._tabPages = {};
	this._tabKeys = {};
	this._tabIdByKey = {};

	// centralized attendee data
	this._attendees = {};
	this._attendees[ZmAppt.PERSON]		= new AjxVector();	// list of ZmContact
	this._attendees[ZmAppt.LOCATION]	= new AjxVector();	// list of ZmResource
	this._attendees[ZmAppt.RESOURCE]	= new AjxVector();	// list of ZmResource

	// set of attendee keys (for preventing duplicates)
	this._attendeeKeys = {};
	this._attendeeKeys[ZmAppt.PERSON]	= {};
	this._attendeeKeys[ZmAppt.LOCATION]	= {};
	this._attendeeKeys[ZmAppt.RESOURCE]	= {};

	// error msg for when user enters invalid attendee
	this._badAttendeeMsg = {};
	this._badAttendeeMsg[ZmAppt.PERSON]		= ZmMsg.schedBadAttendee;
	this._badAttendeeMsg[ZmAppt.LOCATION]	= ZmMsg.schedBadLocation;
	this._badAttendeeMsg[ZmAppt.RESOURCE]	= ZmMsg.schedBadResource;

	// for attendees change events
	this._evt = new ZmEvent(ZmEvent.S_CONTACT);
	this._evtMgr = new AjxEventMgr();
	
	this._msgDialog = this._appCtxt.getMsgDialog();

	this._initialize();
};

var i = 1;
ZmApptComposeView.TAB_APPOINTMENT	= i++;
ZmApptComposeView.TAB_SCHEDULE		= i++;
ZmApptComposeView.TAB_ATTENDEES		= i++;
ZmApptComposeView.TAB_LOCATIONS		= i++;
ZmApptComposeView.TAB_RESOURCES		= i++;
delete i;

ZmApptComposeView.TAB_NAME = {};
ZmApptComposeView.TAB_NAME[ZmApptComposeView.TAB_APPOINTMENT]	= "appointment";
ZmApptComposeView.TAB_NAME[ZmApptComposeView.TAB_SCHEDULE]		= "schedule";
ZmApptComposeView.TAB_NAME[ZmApptComposeView.TAB_ATTENDEES]		= "findAttendees";
ZmApptComposeView.TAB_NAME[ZmApptComposeView.TAB_LOCATIONS]		= "findLocations";
ZmApptComposeView.TAB_NAME[ZmApptComposeView.TAB_RESOURCES]		= "findResources";

ZmApptComposeView.TAB_IMAGE = {};
ZmApptComposeView.TAB_IMAGE[ZmApptComposeView.TAB_APPOINTMENT]	= "Appointment";
ZmApptComposeView.TAB_IMAGE[ZmApptComposeView.TAB_SCHEDULE]		= "GroupSchedule";
ZmApptComposeView.TAB_IMAGE[ZmApptComposeView.TAB_ATTENDEES]	= "ApptMeeting";
ZmApptComposeView.TAB_IMAGE[ZmApptComposeView.TAB_LOCATIONS]	= "Globe";
ZmApptComposeView.TAB_IMAGE[ZmApptComposeView.TAB_RESOURCES]	= "Attachment";

ZmApptComposeView.TABS = [ZmApptComposeView.TAB_APPOINTMENT, ZmApptComposeView.TAB_SCHEDULE, ZmApptComposeView.TAB_ATTENDEES,
						  ZmApptComposeView.TAB_LOCATIONS, ZmApptComposeView.TAB_RESOURCES];

ZmApptComposeView.ATT_TYPES = [ZmAppt.PERSON, ZmAppt.LOCATION, ZmAppt.RESOURCE];

ZmApptComposeView.MODE_ADD		= 1;
ZmApptComposeView.MODE_REPLACE	= 2;

ZmApptComposeView.prototype = new DwtTabView;
ZmApptComposeView.prototype.constructor = ZmApptComposeView;

// Consts

// Message dialog placement
ZmApptComposeView.DIALOG_X = 50;
ZmApptComposeView.DIALOG_Y = 100;


// Public methods

ZmApptComposeView.prototype.toString = 
function() {
	return "ZmApptComposeView";
};

ZmApptComposeView.prototype.getController =
function() {
	return this._controller;
}

ZmApptComposeView.prototype.set =
function(appt, mode, isDirty) {
	var button = this.getTabButton(this._apptTabKey);
	if (mode == ZmAppt.MODE_EDIT_SINGLE_INSTANCE) {
		button.setImage("ApptException");
	} else if (mode == ZmAppt.MODE_EDIT_SERIES || 
			(mode == ZmAppt.MODE_NEW_FROM_QUICKADD && appt.repeatType != "NON")) {
		button.setImage("ApptRecur");
	} else {
		button.setImage("Appointment");
	}

	// always switch to appointment tab
	this.switchToTab(this._apptTabKey);

	for (var i = 0; i < ZmApptComposeView.TABS.length; i++) {
		var id = ZmApptComposeView.TABS[i];
		this._tabPages[id].initialize(appt, mode, isDirty);
	}
	this._addChooserListener(this._tabPages[ZmApptComposeView.TAB_ATTENDEES]);
	this._addChooserListener(this._tabPages[ZmApptComposeView.TAB_LOCATIONS]);
	this._addChooserListener(this._tabPages[ZmApptComposeView.TAB_RESOURCES]);
};

ZmApptComposeView.prototype.cleanup = 
function() {
	// reset autocomplete lists
	if (this._acContactsList) {
		this._acContactsList.reset();
		this._acContactsList.show(false);
	}
	if (this._acResourcesList) {
		this._acResourcesList.reset();
		this._acResourcesList.show(false);
	}

	// clear attendees lists
	this._attendees[ZmAppt.PERSON]		= new AjxVector();
	this._attendees[ZmAppt.LOCATION]	= new AjxVector();
	this._attendees[ZmAppt.RESOURCE]	= new AjxVector();

	this._attendeeKeys[ZmAppt.PERSON]	= {};
	this._attendeeKeys[ZmAppt.LOCATION]	= {};
	this._attendeeKeys[ZmAppt.RESOURCE]	= {};

	for (var i = 0; i < ZmApptComposeView.TABS.length; i++) {
		var id = ZmApptComposeView.TABS[i];
		this._tabPages[id].cleanup();
	}
};

ZmApptComposeView.prototype.preload = 
function() {
    this.setLocation(Dwt.LOC_NOWHERE, Dwt.LOC_NOWHERE);
    this._tabPages[ZmApptComposeView.TAB_APPOINTMENT].createHtml();
};

ZmApptComposeView.prototype.getComposeMode = 
function() {
	return this._apptTab.getComposeMode();
};

// Sets the mode ZmHtmlEditor should be in.
ZmApptComposeView.prototype.setComposeMode = 
function(composeMode) {
	if (composeMode == DwtHtmlEditor.TEXT || 
		(composeMode == DwtHtmlEditor.HTML && this._appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED)))
	{
		this._apptTab.setComposeMode(composeMode);
	}
};

ZmApptComposeView.prototype.reEnableDesignMode = 
function() {
	this._apptTab.reEnableDesignMode();
};

ZmApptComposeView.prototype.isDirty =
function() {
	for (var i = 0; i < ZmApptComposeView.TABS.length; i++) {
		var id = ZmApptComposeView.TABS[i];
		if (this._tabPages[id].isDirty()) {
			return true;
		}
	}
	return false;
};

ZmApptComposeView.prototype.isValid = 
function() {
	for (var i = 0; i < ZmApptComposeView.TABS.length; i++) {
		var id = ZmApptComposeView.TABS[i];
		if (!this._tabPages[id].isValid()) {
			return false;
		}
	}
	return true;
};

/**
* Adds an attachment file upload field to the compose form.
*/
ZmApptComposeView.prototype.addAttachmentField =
function() {
	this._apptTab.addAttachmentField();
};

ZmApptComposeView.prototype.tabSwitched =
function(tabKey) {
	var toolbar = this._controller.getToolbar();
	toolbar.enableAll(true);
	// based on the current tab selected, enable/disable appropriate buttons in toolbar
	if (tabKey == this._tabKeys[ZmApptComposeView.TAB_APPOINTMENT]) {
		this._apptTab.enableInputs(true);
		this._apptTab.reEnableDesignMode();
	} else {
		var buttons = [ZmOperation.ATTACHMENT, ZmOperation.SPELL_CHECK];
		if (this._appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED))
			buttons.push(ZmOperation.COMPOSE_FORMAT);
		if (!this.isChildWindow)
			buttons.push(ZmOperation.DETACH_COMPOSE);
		toolbar.enable(buttons, false);
		this._apptTab.enableInputs(false);
	}
	if (this._curTabId) {
		this._tabPages[this._curTabId].tabBlur();
	}
	this._curTabId = this._tabIdByKey[tabKey];
};

ZmApptComposeView.prototype.getAppt = 
function(attId) {
	if (this._curTabId) {
		this._tabPages[this._curTabId].tabBlur();
	}
	return this._apptTab.getAppt(attId);
};

ZmApptComposeView.prototype.getApptTab =
function() {
	return this._apptTab;
};

ZmApptComposeView.prototype.getHtmlEditor = 
function() {
	return this._apptTab.getNotesHtmlEditor();
};

ZmApptComposeView.prototype.getTabPage =
function(id) {
	return this._tabPages[id];
};

ZmApptComposeView.prototype.switchToTab =
function(id) {
	var tabKey = this._tabKeys[id];
	if (tabKey) {
		DwtTabView.prototype.switchToTab.call(this, tabKey);
		this._curTabId = this._tabIdByKey[tabKey];
	}
};

/**
* Updates the set of attendees for this appointment, by adding attendees or by
* replacing the current list (with a clone of the one passed in).
*
* @param attendees	[object]		attendee(s) as string, array, or AjxVector
* @param type		[constant]		attendee type (attendee/location/resource)
* @param mode		[constant]*		replace (default) or add
* @param index		[int]*			index at which to add attendee
*/
ZmApptComposeView.prototype.updateAttendees =
function(attendees, type, mode, index) {
	attendees = (attendees instanceof AjxVector) ? attendees :
				(attendees instanceof Array) ? AjxVector.fromArray(attendees) : AjxVector.fromArray([attendees]);
	mode = mode ? mode : ZmApptComposeView.MODE_REPLACE;
	if (mode == ZmApptComposeView.MODE_REPLACE) {
		this._attendees[type] = attendees.clone();
		this._setAttendeeKeys(this._attendees[type], type);
	} else {
		// only add first attendee passed in
		var attendee = attendees.get(0);
		if (!this.hasAttendeeKey(attendee, type)) {
			this._attendees[type].add(attendee, index);
		}
	}
};

ZmApptComposeView.prototype.hasAttendeeKey =
function(attendee, type) {
	var email = attendee.getEmail();
	var name = attendee.getFullName();
	var key = email ? email : name;
	return (this._attendeeKeys[type][key] === true);
};

ZmApptComposeView.prototype._setAttendeeKeys =
function(attendees, type) {
	for (var i = 0; i < attendees.length; i++) {
		var email = attendees[i].getEmail();
		var name = attendee.getFullName();
		var key = email ? email : name;
		this._attendeeKeys[type][key] = true;
	}
};

/**
* Adds a change listener.
*
* @param listener	[AjxListener]	a listener
*/
ZmApptComposeView.prototype.addChangeListener = 
function(listener) {
	return this._evtMgr.addListener(ZmEvent.L_MODIFY, listener);
};

/**
* Removes the given change listener.
*
* @param listener	[AjxListener]	a listener
*/
ZmApptComposeView.prototype.removeChangeListener = 
function(listener) {
	return this._evtMgr.removeListener(ZmEvent.L_MODIFY, listener);    	
};

ZmApptComposeView.prototype.showErrorMessage = 
function(msg, style, cb, cbObj, cbArgs) {
	this._msgDialog.reset();
	style = style ? style : DwtMessageDialog.CRITICAL_STYLE
	this._msgDialog.setMessage(msg, style);
	this._msgDialog.popup(this._getDialogXY());
    this._msgDialog.registerCallback(DwtDialog.OK_BUTTON, cb, cbObj, cbArgs);
};

// Private / Protected methods

ZmApptComposeView.prototype._initialize = 
function() {
	// for attendees
	var shell = this._appCtxt.getShell();
	var locCallback = new AjxCallback(this, this._getAcListLoc);
	var acCallback = new AjxCallback(this, this._autocompleteCallback);
	if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		var contactsClass = this._appCtxt.getApp(ZmZimbraMail.CONTACTS_APP);
		var contactsLoader = contactsClass.getContactList;
		var params = {parent: shell, dataClass: contactsClass, dataLoader: contactsLoader,
					  matchValue: ZmContactList.AC_VALUE_EMAIL, locCallback: locCallback, compCallback: acCallback};
		this._acContactsList = new ZmAutocompleteListView(params);
	}
	// for locations/resources
	if (this._appCtxt.get(ZmSetting.GAL_ENABLED)) {
		var resourcesClass = this._appCtxt.getApp(ZmZimbraMail.CALENDAR_APP);
		var resourcesLoader = resourcesClass.getResources;
		var params = {parent: shell, dataClass: resourcesClass, dataLoader: resourcesLoader,
					  matchValue: ZmContactList.AC_VALUE_NAME, locCallback: locCallback, compCallback: acCallback};
		this._acResourcesList = new ZmAutocompleteListView(params);
	}

	for (var i = 0; i < ZmApptComposeView.TABS.length; i++) {
		var id = ZmApptComposeView.TABS[i];
		this._tabPages[id] = this._createTabViewPage(id);
		this._tabKeys[id] = this.addTab(ZmMsg[ZmApptComposeView.TAB_NAME[id]], this._tabPages[id]);
		this._tabIdByKey[this._tabKeys[id]] = id;
		var image = ZmApptComposeView.TAB_IMAGE[id];
		if (image) {
			var button = this.getTabButton(this._tabKeys[id]);
			button.setImage(image);
		}
	}
	this._apptTab = this._tabPages[ZmApptComposeView.TAB_APPOINTMENT];
	this._apptTabKey = this._tabKeys[ZmApptComposeView.TAB_APPOINTMENT];
	
	this._apptTab.addRepeatChangeListener(new AjxListener(this, this._repeatChangeListener));
	this.addControlListener(new AjxListener(this, this._controlListener));
};

ZmApptComposeView.prototype._createTabViewPage =
function(id) {
	switch (id) {
		case ZmApptComposeView.TAB_APPOINTMENT :
			return new ZmApptTabViewPage(this, this._appCtxt, this._attendees, this._acContactsList, this._acResourcesList);
		case ZmApptComposeView.TAB_SCHEDULE :
			return new ZmSchedTabViewPage(this, this._appCtxt, this._attendees, this._controller, this._acContactsList, this._acResourcesList);
		case ZmApptComposeView.TAB_ATTENDEES :
			return new ZmApptChooserTabViewPage(this, this._appCtxt, this._attendees, ZmAppt.PERSON);
		case ZmApptComposeView.TAB_LOCATIONS :
			return new ZmApptChooserTabViewPage(this, this._appCtxt, this._attendees, ZmAppt.LOCATION);
		case ZmApptComposeView.TAB_RESOURCES :
			return new ZmApptChooserTabViewPage(this, this._appCtxt, this._attendees, ZmAppt.RESOURCE);
	}
};

ZmApptComposeView.prototype._repeatChangeListener =
function(ev) {
	var value = ev._args.newValue;
	var button = this.getTabButton(this._apptTabKey);
	button.setImage(value != "NON" ? "ApptRecur" : "Appointment");
};

// Consistent spot to locate various dialogs
ZmApptComposeView.prototype._getDialogXY =
function() {
	var loc = Dwt.toWindow(this.getHtmlElement(), 0, 0);
	return new DwtPoint(loc.x + ZmComposeView.DIALOG_X, loc.y + ZmComposeView.DIALOG_Y);
};

ZmApptComposeView.prototype._getAcListLoc =
function(ev) {
	var element = ev.element;
	var loc = Dwt.getLocation(element);
	var height = Dwt.getSize(element).y;
	return (new DwtPoint(loc.x, loc.y + height));
};

ZmApptComposeView.prototype._autocompleteCallback =
function(text, el, match) {
	var attendee = match.item;
	var type = el._attType;
	this.updateAttendees(attendee, type, ZmApptComposeView.MODE_ADD);
};

ZmApptComposeView.prototype._addChooserListener =
function(tab) {
	if (!this._chooserLstnr) {
		this._chooserLstnr = new AjxListener(this, this._chooserListener);
	}
	if (tab && tab._chooser) {
		tab._chooser.addChangeListener(this._chooserLstnr);
	}
};

// Listeners

ZmApptComposeView.prototype._chooserListener =
function(ev) {
	var vec = ev.getDetail("items");
	var type = ev.getDetail("type");
	this.updateAttendees(vec.getArray(), type);
};

ZmApptComposeView.prototype._controlListener = 
function(ev) {
	var newWidth = (ev.oldWidth == ev.newWidth) ? null : ev.newWidth;
	var newHeight = (ev.oldHeight == ev.newHeight) ? null : ev.newHeight;

	if (!(newWidth || newHeight)) return;

	this._tabPages[this._tabIdByKey[this.getCurrentTab()]].resize(newWidth, newHeight);
};
