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
 * Creates a new appointment view. The view does not display itself on construction.
 * @constructor
 * @class
 * This class provides a form for creating/editing appointments. It is a tab view with
 * five tabs: the appt form, a scheduling page, and three pickers (one each for finding
 * attendees, locations, and equipment). The attendee data (people, locations, and
 * equipment are all attendees) is maintained here centrally, since it is presented and
 * can be modified in each of the five tabs.
 *
 * @author Parag Shah
 *
 * @param {DwtShell}	parent			the element that created this view
 * @param {String}	className 		class name for this view
 * @param {ZmCalendarApp}	calApp			a handle to the owning calendar application
 * @param {ZmApptComposeController}	controller		the controller for this view
 * 
 * @extends		DwtTabView
 */
ZmApptComposeView = function(parent, className, calApp, controller) {

	className = className ? className : "ZmApptComposeView";
	DwtComposite.call(this, parent, className, Dwt.ABSOLUTE_STYLE);

	this.setScrollStyle(DwtControl.CLIP);
	this._app = calApp;
	this._controller = controller;
	
	// centralized date info
	this._dateInfo = {};

	// centralized attendee data
	this._attendees = {};
	this._attendees[ZmCalBaseItem.PERSON]	= new AjxVector();	// list of ZmContact
	this._attendees[ZmCalBaseItem.LOCATION]	= new AjxVector();	// list of ZmResource
	this._attendees[ZmCalBaseItem.EQUIPMENT]= new AjxVector();	// list of ZmResource

	// set of attendee keys (for preventing duplicates)
	this._attendeeKeys = {};
	this._attendeeKeys[ZmCalBaseItem.PERSON]	= {};
	this._attendeeKeys[ZmCalBaseItem.LOCATION]	= {};
	this._attendeeKeys[ZmCalBaseItem.EQUIPMENT]	= {};

	// for attendees change events
	this._evt = new ZmEvent(ZmEvent.S_CONTACT);
	this._evtMgr = new AjxEventMgr();
	
	this._initialize();
};

// attendee operations
ZmApptComposeView.MODE_ADD		= 1;
ZmApptComposeView.MODE_REMOVE	= 2;
ZmApptComposeView.MODE_REPLACE	= 3;

ZmApptComposeView.prototype = new DwtComposite;
ZmApptComposeView.prototype.constructor = ZmApptComposeView;

// Consts

// Message dialog placement
ZmApptComposeView.DIALOG_X = 50;
ZmApptComposeView.DIALOG_Y = 100;

//compose mode
ZmApptComposeView.CREATE       = 1;
ZmApptComposeView.EDIT         = 2;
ZmApptComposeView.FORWARD      = 3;
ZmApptComposeView.PROPOSE_TIME = 4;

// Public methods

ZmApptComposeView.prototype.toString = 
function() {
	return "ZmApptComposeView";
};

ZmApptComposeView.prototype.getController =
function() {
	return this._controller;
};

ZmApptComposeView.prototype.set =
function(appt, mode, isDirty) {

    var isForward = false;

    //decides whether appt is being edited/forwarded/proposed new time
    var apptComposeMode = ZmApptComposeView.EDIT;


    //"mode" should always be set to one of ZmCalItem.MODE_EDIT/ZmCalItem.MODE_EDIT_INSTANCE/ZmCalItem.MODE_EDIT_SERIES/ZmCalItem.MODE_NEW
    if(ZmCalItem.FORWARD_MAPPING[mode]) {
        isForward = true;
        this._forwardMode = mode;
        mode = ZmCalItem.FORWARD_MAPPING[mode];
        apptComposeMode = ZmApptComposeView.FORWARD; 
    } else {
        this._forwardMode = undefined;        
    }

    this._proposeNewTime = (mode == ZmCalItem.MODE_PROPOSE_TIME);

    if (this._proposeNewTime) {
        mode = appt.viewMode || ZmCalItem.MODE_EDIT;
        apptComposeMode = ZmApptComposeView.PROPOSE_TIME;
    }

	this._setData = [appt, mode, isDirty];
	this._dateInfo.timezone = appt.getTimezone();
    this._apptEditView.initialize(appt, mode, isDirty, apptComposeMode);
    this._apptEditView.show();

    var editMode = !Boolean(this._forwardMode) && !this._proposeNewTime;
    this._apptEditView.enableInputs(editMode);
    this._apptEditView.enableSubjectField(!this._proposeNewTime);

    var toolbar = this._controller.getToolbar();
    toolbar.enableAll(true);    
    toolbar.enable([ZmOperation.ATTACHMENT], editMode);
};

ZmApptComposeView.prototype.cleanup = 
function() {
	// clear attendees lists
	this._attendees[ZmCalBaseItem.PERSON]		= new AjxVector();
	this._attendees[ZmCalBaseItem.LOCATION]		= new AjxVector();
	this._attendees[ZmCalBaseItem.EQUIPMENT]	= new AjxVector();

	this._attendeeKeys[ZmCalBaseItem.PERSON]	= {};
	this._attendeeKeys[ZmCalBaseItem.LOCATION]	= {};
	this._attendeeKeys[ZmCalBaseItem.EQUIPMENT]	= {};

    this._apptEditView.cleanup();
};

ZmApptComposeView.prototype.preload = 
function() {
    this.setLocation(Dwt.LOC_NOWHERE, Dwt.LOC_NOWHERE);
    this._apptEditView.createHtml();
};

ZmApptComposeView.prototype.getComposeMode = 
function() {
	return this._apptEditView.getComposeMode();
};

// Sets the mode ZmHtmlEditor should be in.
ZmApptComposeView.prototype.setComposeMode = 
function(composeMode) {
	if (composeMode == DwtHtmlEditor.TEXT || 
		(composeMode == DwtHtmlEditor.HTML && appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED)))
	{
		this._apptEditView.setComposeMode(composeMode);
	}
};

ZmApptComposeView.prototype.reEnableDesignMode = 
function() {
	this._apptEditView.reEnableDesignMode();
};

ZmApptComposeView.prototype.isDirty =
function() {
	//drag and drop changed appts will be dirty even if nothing is changed
	var apptEditView = this._apptEditView;
	if( apptEditView && apptEditView._calItem && apptEditView._calItem.dndUpdate){
			return true;
	}    
    return apptEditView.isDirty();
};

ZmApptComposeView.prototype.isReminderOnlyChanged =
function() {
	return this._apptEditView ? this._apptEditView.isReminderOnlyChanged() : false;
};

ZmApptComposeView.prototype.isValid = 
function() {
    return this._apptEditView.isValid();
};

/**
 * Adds an attachment file upload field to the compose form.
 * 
 */
ZmApptComposeView.prototype.addAttachmentField =
function() {
	this._apptEditView.addAttachmentField();
};

ZmApptComposeView.prototype.getAppt = 
function(attId) {
	return this._apptEditView.getCalItem(attId);
};

ZmApptComposeView.prototype.getForwardAddress =
function() {
    return this._apptEditView.getForwardAddress();
};

ZmApptComposeView.prototype.getHtmlEditor = 
function() {
	return this._apptEditView.getHtmlEditor();
};

/**
 * Updates the set of attendees for this appointment, by adding attendees or by
 * replacing the current list (with a clone of the one passed in).
 *
 * @param attendees	[object]		attendee(s) as string, array, or AjxVector
 * @param type		[constant]		attendee type (attendee/location/equipment)
 * @param mode		[constant]*		replace (default) or add
 * @param index		[int]*			index at which to add attendee
 * 
 * @private
 */
ZmApptComposeView.prototype.updateAttendees =
function(attendees, type, mode, index) {
	attendees = (attendees instanceof AjxVector) ? attendees.getArray() :
				(attendees instanceof Array) ? attendees : [attendees];
	mode = mode || ZmApptComposeView.MODE_REPLACE;
	if (mode == ZmApptComposeView.MODE_REPLACE) {
		this._attendees[type] = new AjxVector();
		this._attendeeKeys[type] = {};
		for (var i = 0; i < attendees.length; i++) {
			var attendee = attendees[i];
			this._attendees[type].add(attendee);
			this._addAttendeeKey(attendee, type);
		}
	} else if (mode == ZmApptComposeView.MODE_ADD) {
		for (var i = 0; i < attendees.length; i++) {
			var attendee = attendees[i];
			var key = this._getAttendeeKey(attendee);
			if (!this._attendeeKeys[type][key] === true) {
				this._attendees[type].add(attendee, index);
				this._addAttendeeKey(attendee, type);
			}
		}
	} else if (mode == ZmApptComposeView.MODE_REMOVE) {
		for (var i = 0; i < attendees.length; i++) {
			var attendee = attendees[i];
			this._removeAttendeeKey(attendee, type);
			this._attendees[type].remove(attendee);
		}
	}
};

ZmApptComposeView.prototype.showMeetingFields =
function(show){
    this._apptEditView.showMeetingFields(show);
};

ZmApptComposeView.prototype.isMeetingAppt =
function(){
    return this._apptEditView.isMeeting();
};

ZmApptComposeView.prototype.setApptMessage =
function(msg){
    this._apptEditView.setApptMessage(msg);  
};

ZmApptComposeView.prototype.getTitle = 
function() {
	return [ZmMsg.zimbraTitle, ZmMsg.appointment].join(": ");
};

ZmApptComposeView.prototype._getAttendeeKey =
function(attendee) {
	var email = attendee.getEmail();
	var name = attendee.getFullName();
	return email ? email : name;
};

ZmApptComposeView.prototype._addAttendeeKey =
function(attendee, type) {
	var key = this._getAttendeeKey(attendee);
	if (key) {
		this._attendeeKeys[type][key] = true;
	}
};

ZmApptComposeView.prototype._removeAttendeeKey =
function(attendee, type) {
	var key = this._getAttendeeKey(attendee);
	if (key) {
		delete this._attendeeKeys[type][key];
	}
};

/**
* Adds a change listener.
*
* @param {AjxListener}	listener	a listener
*/
ZmApptComposeView.prototype.addChangeListener = 
function(listener) {
	return this._evtMgr.addListener(ZmEvent.L_MODIFY, listener);
};

/**
* Removes the given change listener.
*
* @param {AjxListener}	listener	a listener
*/
ZmApptComposeView.prototype.removeChangeListener = 
function(listener) {
	return this._evtMgr.removeListener(ZmEvent.L_MODIFY, listener);    	
};

ZmApptComposeView.prototype.showErrorMessage = 
function(msg, style, cb, cbObj, cbArgs) {
	var msgDialog = appCtxt.getMsgDialog();
	msgDialog.reset();
	style = style ? style : DwtMessageDialog.CRITICAL_STYLE
	msgDialog.setMessage(msg, style);
	msgDialog.popup(this._getDialogXY());
    msgDialog.registerCallback(DwtDialog.OK_BUTTON, cb, cbObj, cbArgs);
};

// Private / Protected methods

ZmApptComposeView.prototype._initialize =
function() {
    this._apptEditView = new ZmApptEditView(this, this._attendees, this._controller, this._dateInfo);
	this._apptEditView.addRepeatChangeListener(new AjxListener(this, this._repeatChangeListener));
	this.addControlListener(new AjxListener(this, this._controlListener));
};

ZmApptComposeView.prototype.getApptEditView =
function() {
    return this._apptEditView;
};

ZmApptComposeView.prototype.getAttendees =
function(type) {
    return this._attendees[type];
};

ZmApptComposeView.prototype._repeatChangeListener =
function(ev) {

};

// Consistent spot to locate various dialogs
ZmApptComposeView.prototype._getDialogXY =
function() {
	var loc = Dwt.toWindow(this.getHtmlElement(), 0, 0);
	return new DwtPoint(loc.x + ZmApptComposeView.DIALOG_X, loc.y + ZmApptComposeView.DIALOG_Y);
};

// Listeners

ZmApptComposeView.prototype._controlListener =
function(ev) {
	var newWidth = (ev.oldWidth == ev.newWidth) ? null : ev.newWidth;
	var newHeight = (ev.oldHeight == ev.newHeight) ? null : ev.newHeight;

	if (!(newWidth || newHeight)) return;

	this._apptEditView.resize(newWidth, newHeight);
};
