/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
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

/**
* 
* @constructor
* @class
*
* @author Andy Clark
*
* @param id			[int]			numeric ID
* @param name		[string]		name
* @param parent		[ZmOrganizer]	parent organizer
* @param tree		[ZmTree]		tree model that contains this organizer
* @param color		[constant]		color for this calendar
* @param url		[string]*		URL for this organizer's feed
* @param owner		[string]*		ownder of this calendar
* @param zid		[string]*		Zimbra id of owner, if remote share
* @param rid		[string]*		Remote id of organizer, if remote share
* @param restUrl	[string]*		The REST URL of this organizer.
*/
ZmCalendar = function(params) {
	params.type = ZmOrganizer.CALENDAR;
	ZmOrganizer.call(this, params);
}

ZmCalendar.prototype = new ZmOrganizer;
ZmCalendar.prototype.constructor = ZmCalendar;


// Consts

ZmCalendar.ID_CALENDAR = ZmOrganizer.ID_CALENDAR;

// Public methods

ZmCalendar.prototype.toString = 
function() {
	return "ZmCalendar";
};

/**
 * Creates a new calendar. The color and flags will be set later in response
 * to the create notification. This function is necessary because calendar
 * creation needs custom error handling.
 */
ZmCalendar.create =
function(params) {
	params.errorCallback = new AjxCallback(null, ZmCalendar._handleErrorCreate, params);
	ZmOrganizer.create(params);
};

ZmCalendar._handleErrorCreate =
function(params, ex) {
	if (params.url && (ex.code == ZmCsfeException.SVC_PARSE_ERROR)) {
		msg = AjxMessageFormat.format(ZmMsg.calFeedInvalid, params.url);
		ZmOrganizer._showErrorMsg(msg);
		return true;
	} else {
		return ZmOrganizer._handleErrorCreate(params, ex);
	}
};

ZmCalendar.prototype.getName = 
function(showUnread, maxLength, noMarkup) {
    if (this.nId == ZmOrganizer.ID_ROOT) {
    	return ZmMsg.calendars;
    }
    if (this.path) {
    	return [this.path, this.name].join("/");
    }
    return this.name;
};

ZmCalendar.prototype.getIcon = 
function() {
	if (this.nId == ZmOrganizer.ID_ROOT)	{ return null; }
	if (this.link)							{ return "GroupSchedule"; }
	return "CalendarFolder";
};

ZmCalendar.prototype.setFreeBusy = 
function(exclude, callback, errorCallback) {
	if (this.excludeFreeBusy == exclude) { return; }
	// NOTE: Don't need to store the value since the response will
	//       report that the object was modified.
	this._organizerAction({action: "fb", attrs: {excludeFreeBusy: exclude ? "1" : "0"}, callback: callback, errorCallback: errorCallback});
};

ZmCalendar.prototype.setChecked = 
function(checked, batchCmd) {
	if (this.isChecked == checked) { return; }
	var action = checked ? "check" : "!check";
	this._organizerAction({action: action, batchCmd: batchCmd});
};

// Callbacks

ZmCalendar.prototype.notifyCreate =
function(obj) {
	var calendar = ZmFolderTree.createFromJs(this, obj, this.tree);
	var index = ZmOrganizer.getSortIndex(calendar, ZmCalendar.sortCompare);
	this.children.add(calendar, index);
	calendar._notify(ZmEvent.E_CREATE);
};

ZmCalendar.prototype.notifyModify =
function(obj) {
	ZmOrganizer.prototype.notifyModify.call(this, obj);

	var doNotify = false;
	var fields = {};
	if (obj.f != null) {
		this._parseFlags(obj.f);
		// TODO: Should a F_EXCLUDE_FB property be added to ZmOrganizer?
		//       It doesn't make sense to require the base class to know about
		//       all the possible fields in sub-classes. So I'm just using the
		//       modified property name as the key.
		fields["excludeFreeBusy"] = true;
		doNotify = true;
	}
	
	if (doNotify)
		this._notify(ZmEvent.E_MODIFY, {fields: fields});
};


// Static methods

ZmCalendar.checkName =
function(name) {
	return ZmOrganizer.checkName(name);
};

ZmCalendar.sortCompare = 
function(calA, calB) {
	var check = ZmOrganizer.checkSortArgs(calA, calB);
	if (check != null) return check;

	// links appear after personal calendars
	if (calA.link != calB.link) {
		return calA.link ? 1 : -1;
	}
	
	// sort by calendar name
	var calAName = calA.name.toLowerCase();
	var calBName = calB.name.toLowerCase();
	if (calAName < calBName) return -1;
	if (calAName > calBName) return 1;
	return 0;
};
