/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */
 
/**
 * @overview
 * This file defines a Zimbra calendar item.
 *
 */

/**
 * @class
 * This class represents a calendar item.
 *
 * @param	{constant}	type		the item type
 * @param	{ZmList}	list		the list
 * @param	{int}	id				the task id
 * @param	{String}	folderId	the folder id
 *
 * @extends ZmCalBaseItem
 */
ZmCalItem = function(type, list, id, folderId) {
	if (arguments.length == 0) { return; }

	ZmCalBaseItem.call(this, type, list, id, folderId);

	this.notesTopPart = null; // ZmMimePart containing children w/ message parts
	this.attachments = null;
	this.viewMode = ZmCalItem.MODE_NEW;
	this._recurrence = new ZmRecurrence(this);
	this._noBusyOverlay = null;
    this._sendNotificationMail = true;
    this.identity = null;
    this.isProposeTimeMode = false;
    this.isForwardMode = false;
	this.alarmActions = new AjxVector();
	this.alarmActions.add(ZmCalItem.ALARM_DISPLAY);
	this._useAbsoluteReminder = false;
    this._ignoreVersion=false; //to ignore revision related attributes(ms & rev) during version conflict
};

ZmCalItem.prototype = new ZmCalBaseItem;
ZmCalItem.prototype.constructor = ZmCalItem;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmCalItem.prototype.toString =
function() {
	return "ZmCalItem";
};

// Consts

/**
 * Defines the "new" mode.
 */
ZmCalItem.MODE_NEW					    = "NEW"; // Changing those constants from numbers to strings to be easier for debugging. I could not deal with 2,3 etc anymore.
/**
 * Defines the "edit" mode.
 */
ZmCalItem.MODE_EDIT					    = "EDIT";

/**
 * Defines the "copy single instance" mode.
 */
ZmCalItem.MODE_COPY_SINGLE_INSTANCE	    = "COPY_INST";

/**
 * Defines the "edit single instance" mode.
 */
ZmCalItem.MODE_EDIT_SINGLE_INSTANCE	    = "EDIT_INST";
/**
 * Defines the "edit series" mode.
 */
ZmCalItem.MODE_EDIT_SERIES			    = "EDIT_SER";
/**
 * Defines the "delete" mode.
 */
ZmCalItem.MODE_DELETE				    = "DELETE";
/**
 * Defines the "delete instance" mode.
 */
ZmCalItem.MODE_DELETE_INSTANCE		    = "DELETE_INST";
/**
 * Defines the "delete series" mode.
 */
ZmCalItem.MODE_DELETE_SERIES		    = "DELETE_SER";
/**
 * Defines the "new from quick" mode.
 */
ZmCalItem.MODE_NEW_FROM_QUICKADD 	    = "NEW_FROM_QUICK";
/**
 * Defines the "get" mode.
 */
ZmCalItem.MODE_GET					    = "GET";
/**
 * Defines the "forward" mode.
 */
ZmCalItem.MODE_FORWARD				    = "FORWARD";
/**
 * Defines the "forward single instance" mode.
 */
ZmCalItem.MODE_FORWARD_SINGLE_INSTANCE	= "FORWARD_INST";
/**
 * Defines the "forward series" mode.
 */
ZmCalItem.MODE_FORWARD_SERIES			= "FORWARD_SER";
/**
 * Defines the "forward" mode.
 */
ZmCalItem.MODE_FORWARD_INVITE			= "FORWARD_INV";
/**
 * Defines the "propose" mode.
 */
ZmCalItem.MODE_PROPOSE_TIME 			= "PROPOSE_TIME";

/**
 * Defines the "purge" (delete from trash) mode.
 */
ZmCalItem.MODE_PURGE 					= 15; //keeping this and the last one as 15 as I am not sure if it's a bug or intentional that they are the same

/**
 * Defines the "last" mode index constant.
 */
ZmCalItem.MODE_LAST					    = 15;

ZmCalItem.FORWARD_MAPPING = {};
ZmCalItem.FORWARD_MAPPING[ZmCalItem.MODE_FORWARD]                   = ZmCalItem.MODE_EDIT;
ZmCalItem.FORWARD_MAPPING[ZmCalItem.MODE_FORWARD_SINGLE_INSTANCE]   = ZmCalItem.MODE_EDIT_SINGLE_INSTANCE;
ZmCalItem.FORWARD_MAPPING[ZmCalItem.MODE_FORWARD_SERIES]            = ZmCalItem.MODE_EDIT_SERIES;
ZmCalItem.FORWARD_MAPPING[ZmCalItem.MODE_FORWARD_INVITE]            = ZmCalItem.MODE_EDIT;

/**
 * Defines the "low" priority.
 */
ZmCalItem.PRIORITY_LOW				= 9;
ZmCalItem.PRIORITY_LOW_RANGE		= [6,7,8,9];

/**
 * Defines the "normal" priority.
 */
ZmCalItem.PRIORITY_NORMAL			= 5;
ZmCalItem.PRIORITY_NORMAL_RANGE		= [0,5];
/**
 * Defines the "high" priority.
 */
ZmCalItem.PRIORITY_HIGH				= 1;
ZmCalItem.PRIORITY_HIGH_RANGE		= [1,2,3,4];

/**
 * Defines the "chair" role.
 */
ZmCalItem.ROLE_CHAIR				= "CHA";
/**
 * Defines the "required" role.
 */
ZmCalItem.ROLE_REQUIRED				= "REQ";
/**
 * Defines the "optional" role.
 */
ZmCalItem.ROLE_OPTIONAL				= "OPT";
/**
 * Defines the "non-participant" role.
 */
ZmCalItem.ROLE_NON_PARTICIPANT		= "NON";

ZmCalItem.SERVER_WEEK_DAYS			= ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

ZmCalItem.ATTACHMENT_CHECKBOX_NAME	= "__calAttCbox__";
ZmCalItem.ATT_LINK_IMAGE            = "mainImage";
ZmCalItem.ATT_LINK_MAIN			    = "main";
ZmCalItem.ATT_LINK_DOWNLOAD		    = "download";

/**
 * Defines "minutes "reminder units.
 */
ZmCalItem.REMINDER_UNIT_MINUTES     = "minutes";
/**
 * Defines "hours" reminder units.
 */
ZmCalItem.REMINDER_UNIT_HOURS       = "hours";
/**
 * Defines "days" reminder units.
 */
ZmCalItem.REMINDER_UNIT_DAYS        = "days";
/**
 * Defines "weeks" reminder units.
 */
ZmCalItem.REMINDER_UNIT_WEEKS       = "weeks";
/**
 * Defines "none" reminder.
 */
ZmCalItem.REMINDER_NONE             = "none";

// Alarm actions
ZmCalItem.ALARM_DISPLAY	= "DISPLAY";
ZmCalItem.ALARM_EMAIL	= "EMAIL";
ZmCalItem.ALARM_DEVICE_EMAIL = "DEVICE_EMAIL"; // SMS

// Duration Checks
ZmCalItem.MSEC_LIMIT_PER_WEEK  = AjxDateUtil.MSEC_PER_DAY * 7;
// Because recurrences can be on the first (or 2nd, 3rd...) Day-of-week of a
// month, play it safe and make the limit 5 weeks
ZmCalItem.MSEC_LIMIT_PER_MONTH = AjxDateUtil.MSEC_PER_DAY * 7 * 5;
ZmCalItem.MSEC_LIMIT_PER_YEAR  = AjxDateUtil.MSEC_PER_DAY * 366;


// Getters

/**
 * @private
 */
ZmCalItem.prototype.getCompNum			= function() { return this.compNum || "0"; };

/**
 * Gets the folder.
 * 
 * @return	{Object}	the folder
 */
ZmCalItem.prototype.getFolder			= function() { };						// override if necessary

/**
 * Gets the organizer.
 * 
 * @return	{String}	the organizer
 */
ZmCalItem.prototype.getOrganizer 		= function() { return this.organizer || ""; };

/**
 * Gets the organizer name.
 *
 * @return	{String}	the organizer name
 */
ZmCalItem.prototype.getOrganizerName 	= function() { return this.organizerName; };


/**
 * Gets the sent by.
 * 
 * @return	{String}	the sent by
 */
ZmCalItem.prototype.getSentBy           = function() { return this.sentBy || ""; };

/**
 * Gets the original start date.
 * 
 * @return	{Date}	the original start date
 */
ZmCalItem.prototype.getOrigStartDate 	= function() { return this._origStartDate || this.startDate; };

/**
 * Gets the original start time.
 * 
 * @return	{Date}	the original start time
 */
ZmCalItem.prototype.getOrigStartTime 	= function() { return this.getOrigStartDate().getTime(); };

/**
 * Gets the original end date.
 *
 * @return	{Date}	the original end date
 */
ZmCalItem.prototype.getOrigEndDate 	= function() { return this._origEndDate || this.endDate; };

/**
 * Gets the original end time.
 *
 * @return	{Date}	the original end time
 */
ZmCalItem.prototype.getOrigEndTime 	= function() { return this.getOrigEndDate().getTime(); };

/**
 * Gets the original calendar item.
 *
 * @return	{ZmCalItem}	the original calendar item
 */
ZmCalItem.prototype.getOrig 	        = function() { return this._orig; };

/**
 * Gets the original timezone.
 * 
 * @return	{Date}	the original timezone
 */
ZmCalItem.prototype.getOrigTimezone     = function() { return this._origTimezone || this.timezone; };

/**
 * Gets the recurrence "blurb".
 * 
 * @return	{String}	the recurrence blurb
 * @see		ZmRecurrence
 */
ZmCalItem.prototype.getRecurBlurb		= function() { return this._recurrence.getBlurb(); };

/**
 * Gets the recurrence.
 * 
 * @return	{ZmRecurrence}	the recurrence
 */
ZmCalItem.prototype.getRecurrence		= function() { return this._recurrence; };

/**
 * Gets the recurrence "type".
 * 
 * @return	{String}	the recurrence type
 * @see		ZmRecurrence
 */
ZmCalItem.prototype.getRecurType		= function() { return this._recurrence.repeatType; };

/**
 * Gets the timezone.
 * 
 * @return	{AjxTimezone}	the timezone
 */
ZmCalItem.prototype.getTimezone         = function() { return this.timezone; };

/**
 * Gets the summary.
 * 
 * @param	{Boolean}	isHtml		<code>true</code> to return as html
 * @return	{String}	the summary
 */
ZmCalItem.prototype.getSummary			= function(isHtml) { };					// override if necessary

/**
 * Gets the tool tip.
 * 
 * @param	{ZmController}		controller		the controller
 * @return	{String}	the tool tip
 */
ZmCalItem.prototype.getToolTip			= function(controller) { };				// override if necessary
/**
 * Checks if this item has a custom recurrence.
 * 
 * @return	{Boolean}	<code>true</code> for a custom recurrence
 */
ZmCalItem.prototype.isCustomRecurrence 	= function() { return this._recurrence.repeatCustom == "1" || this._recurrence.repeatEndType != "N"; };
/**
 * Checks if this item is an organizer.
 * 
 * @return	{Boolean}	<code>true</code> for an organizer
 */
ZmCalItem.prototype.isOrganizer 		= function() { return (typeof(this.isOrg) === 'undefined') || (this.isOrg == true); };
/**
 * Checks if this item is recurring.
 * 
 * @return	{Boolean}	<code>true</code> for recurrence
 */
ZmCalItem.prototype.isRecurring 		= function() { return (this.recurring || (this._rawRecurrences != null)); };
/**
 * Checks if this item has attachments.
 * 
 * @return	{Boolean}	<code>true</code> if this item has attachments
 */
ZmCalItem.prototype.hasAttachments 		= function() { return this.getAttachments() != null; };
/**
 * Checks if this item has attendee type.
 * 
 * @return	{Boolean}	always returns <code>false</code>; override if necessary
 */
ZmCalItem.prototype.hasAttendeeForType	= function(type) { return false; };		// override if necessary
/**
 * Checks if this item has attendees.
 * 
 * @return	{Boolean}	always returns <code>false</code>; override if necessary
 */
ZmCalItem.prototype.hasAttendees    	= function() { return false; }; 		// override if necessary
/**
 * Checks if this item has person attendees.
 * 
 * @return	{Boolean}	always returns <code>false</code>; override if necessary
 */
ZmCalItem.prototype.hasPersonAttendees	= function() { return false; };			// override if necessary

// Setters
/**
 * Sets all day event.
 * 
 * @param	{Boolean}	isAllDay	<code>true</code> for an all day event
 */
ZmCalItem.prototype.setAllDayEvent 		= function(isAllDay) 	{ this.allDayEvent = isAllDay ? "1" : "0"; };
/**
 * Sets the name.
 * 
 * @param	{String}	newName			the name
 */
ZmCalItem.prototype.setName 			= function(newName) 	{ this.name = newName; };
/**
 * Sets the organizer.
 * 
 * @param	{String}	organizer			the organizer
 */
ZmCalItem.prototype.setOrganizer 		= function(organizer) 	{ this.organizer = organizer != "" ? organizer : null; };
/**
 * Sets the repeat type.
 * 
 * @param	{constant}	repeatType			the repeat type
 */
ZmCalItem.prototype.setRecurType		= function(repeatType)	{ this._recurrence.repeatType = repeatType; };
/**
 * Sets the item type.
 * 
 * @param	{constant}	newType			the item type
 */
ZmCalItem.prototype.setType 			= function(newType) 	{ this.type = newType; };
/**
 * Sets the original timezone.
 * 
 * @param	{Object}	timezone		the timezone
 */
ZmCalItem.prototype.setOrigTimezone     = function(timezone)    { this._origTimezone = timezone; };

/**
 * Sets the folder id.
 * 
 * @param	{String}	folderId		the folder id
 */
ZmCalItem.prototype.setFolderId =
function(folderId) {
	this.folderId = folderId || ZmOrganizer.ID_CALENDAR;
};

/**
 * Gets the "local" folder id even for remote folders. Otherwise, just use <code>this.folderId</code>.
 * 
 * @return	{ZmFolder|String}		the folder or folder id
 */
ZmCalItem.prototype.getLocalFolderId =
function() {
	var fid = this.folderId;
	if (this.isShared()) {
		var folder = appCtxt.getById(this.folderId);
		if (folder)
			fid = folder.id;
	}
	return fid;
};

/**
 * Sets the end date.
 * 
 * @param	{Date}	endDate		the end date
 * @param	{Boolean}	keepCache	if <code>true</code>, keep the cache; <code>false</code> to reset the cache
 */
ZmCalItem.prototype.setEndDate =
function(endDate, keepCache) {
    if (this._origEndDate == null && this.endDate != null && this.endDate != "") {
        this._origEndDate = new Date(this.endDate.getTime());
    }
	this.endDate = new Date(endDate instanceof Date ? endDate.getTime(): endDate);
	if (!keepCache)
		this._resetCached();
};

/**
 * Sets the start date.
 * 
 * @param	{Date}	startDate		the start date
 * @param	{Boolean}	keepCache	if <code>true</code>, keep the cache; <code>false</code> to reset the cache
 */
ZmCalItem.prototype.setStartDate =
function(startDate, keepCache) {
	if (this._origStartDate == null && this.startDate != null && this.startDate != "") {
		this._origStartDate = new Date(this.startDate.getTime());
	}
	this.startDate = new Date(startDate instanceof Date ? startDate.getTime() : startDate);

	if (!keepCache) {
		this._resetCached();
	}

	// recurrence should reflect start date
	if (this.recurring && this._recurrence) {
		this._recurrence.setRecurrenceStartTime(this.startDate.getTime());
	}
};

/**
 * Sets the timezone.
 * 
 * @param	{AjxTimezone}	timezone	the timezone
 * @param	{Boolean}	keepCache	if <code>true</code>, keep the cache; <code>false</code> to reset the cache
 */
ZmCalItem.prototype.setTimezone =
function(timezone, keepCache) {
	if (this._origTimezone == null) {
		this._origTimezone = timezone;
	}
	this.timezone = timezone;
	if (!keepCache) {
		this._resetCached();
	}
};

/**
 * Sets the end timezone.
 *
 * @param	{AjxTimezone}	timezone	the timezone
 */
ZmCalItem.prototype.setEndTimezone =
function(timezone) {
	if (this._origEndTimezone == null) {
		this._origEndTimezone = timezone;
	}
	this.endTimezone = timezone;
};

/**
 * Sets the view mode, and resets any other fields that should not be set for that view mode.
 * 
 * @param	{constant}	mode		the mode (see <code>ZmCalItem.MODE_</code> constants)
 */
ZmCalItem.prototype.setViewMode =
function(mode) {
	this.viewMode = mode || ZmCalItem.MODE_NEW;

	if (this.viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE)
		this._recurrence.repeatType = "NON";
};

/**
 * Gets the view mode
 */
ZmCalItem.prototype.getViewMode =
function(mode) {
	return this.viewMode;
};

/**
 * Gets the notes part. This method will walk the notesParts array looking for
 * the first part that matches given content type.
 * 
 * @param	{constant}	contentType		the content type (see {@link ZmMimeTable.TEXT_PLAIN})	
 * @return	{String}	the content
 * 
 * @see	ZmMimeTable
 */
ZmCalItem.prototype.getNotesPart =
function(contentType) {
	if (this.notesTopPart) {
		var ct = contentType || ZmMimeTable.TEXT_PLAIN;
		var content = this.notesTopPart.getContentForType(ct);

		// if requested content type not found, try the other
		if (!content) {
			if (ct == ZmMimeTable.TEXT_PLAIN) {
				var div = document.createElement("div");
				content = this.notesTopPart.getContentForType(ZmMimeTable.TEXT_HTML);
				div.innerHTML = content || "";
				var text = AjxStringUtil.convertHtml2Text(div);
				return text.substring(1); // above func prepends \n due to div
			} else if (ct == ZmMimeTable.TEXT_HTML) {
				content = AjxStringUtil.convertToHtml(this.notesTopPart.getContentForType(ZmMimeTable.TEXT_PLAIN));
			}
		}
		return content;
	} else {
		return this.fragment;
	}
};

/**
 * Gets the remote folder owner.
 * 
 * @return {String}	the "owner" of remote/shared item folder this item belongs to
 */
ZmCalItem.prototype.getRemoteFolderOwner =
function() {
	// bug fix #18855 - dont return the folder owner if moving betw. accounts
	var controller = AjxDispatcher.run("GetCalController");
	if (controller.isMovingBetwAccounts(this, this.folderId)) {
		return null;
	}

	var folder = this.getFolder();
	var owner = folder && folder.link && folder.owner;

    var acct = (!owner && appCtxt.multiAccounts && folder.getAccount());
	if (acct) {
		owner = acct.name;
	}
	return owner;
};

/**
 * Checks if the item is read-only.
 * 
 * @return	{Boolean}	<code>true</code> if the item is read-only
 */
ZmCalItem.prototype.isReadOnly =
function() {
	var folder = this.getFolder();

	if (appCtxt.multiAccounts) {
		var orgAcct = appCtxt.accountList.getAccountByEmail(this.organizer);
		var calAcct = appCtxt.accountList.getAccountByEmail(folder.getAccount().getEmail());
		if (orgAcct == calAcct) {
			return false;
		}
	}
   // TODO: Correct this method in order to return fasle for users with manager/admin rights
	return (!this.isOrganizer() || (folder.link && folder.isReadOnly()));
};

/**
 * Checks if the folder containing the item is read-only by the .
 *
 * @return	{Boolean}	<code>true</code> if the folder is read-only
 */
ZmCalItem.prototype.isFolderReadOnly =
function() {
	var folder = this.getFolder();
    return (folder && folder.isReadOnly());
};

/*
*   To check whether version has been ignored
* */
ZmCalItem.prototype.isVersionIgnored=function(){
    return this._ignoreVersion;
}

/*
*   Method to set _ignoreVersion as true when conflict arises and false otherwise.
*   If true, the next soap request wont be sent with revision related attributes like ms&rev.
* */
ZmCalItem.prototype.setIgnoreVersion=function(isIgnorable){
    this._ignoreVersion=isIgnorable;
}

/**
 * Resets the repeat weekly days.
 */
ZmCalItem.prototype.resetRepeatWeeklyDays =
function() {
	if (this.startDate) {
		this._recurrence.repeatWeeklyDays = [ZmCalItem.SERVER_WEEK_DAYS[this.startDate.getDay()]];
	}
};

/**
 * Resets the repeat monthly day months list.
 */
ZmCalItem.prototype.resetRepeatMonthlyDayList =
function() {
	if (this.startDate) {
		this._recurrence.repeatMonthlyDayList = [this.startDate.getDate()];
	}
};

/**
 * Resets the repeat yearly months list.
 */
ZmCalItem.prototype.resetRepeatYearlyMonthsList =
function(mo) {
	this._recurrence.repeatYearlyMonthsList = mo;
};

/**
 * Resets the repeat custom day of week.
 */
ZmCalItem.prototype.resetRepeatCustomDayOfWeek =
function() {
	if (this.startDate) {
		this._recurrence.repeatCustomDayOfWeek = ZmCalItem.SERVER_WEEK_DAYS[this.startDate.getDay()];
	}
};

/**
 * Checks if the item is overlapping.
 * 
 * @param	{ZmCalItem}	other		the other item to check
 * @param	{Boolean}	checkFolder	<code>true</code> to check the folder id
 * @return	{Boolean}	<code>true</code> if the items overlap; <code>false</code> if the items do not overlap or the item folder ids do not match
 */
ZmCalItem.prototype.isOverlapping =
function(other, checkFolder) {
	if (checkFolder && this.folderId != other.folderId) { return false; }

	var tst = this.getStartTime();
	var tet = this.getEndTime();
	var ost = other.getStartTime();
	var oet = other.getEndTime();

	return (tst < oet) && (tet > ost);
};

/**
 * Checks if this item is in range.
 * 
 * @param	{Date}	startTime	the start range
 * @param	{Date}	endTime	the end range
 * @return	{Boolean}	<code>true</code> if the item is in range
 */
ZmCalItem.prototype.isInRange =
function(startTime, endTime) {
	var tst = this.getStartTime();
	var tet = this.getEndTime();
	return (tst < endTime && tet > startTime);
};

/**
 * Checks whether the duration of this item is valid.
 *
 * @return	{Boolean}	<code>true</code> if the item possess valid duration.
 */
ZmCalItem.prototype.isValidDuration =
function(){

    var startTime = this.getStartTime();
    var endTime = this.getEndTime();

    if(this.endTimezone && this.endTimezone!=this.timezone){
      var startOffset = AjxTimezone.getRule(this.timezone).standard.offset;
      var endOffset = AjxTimezone.getRule(this.endTimezone).standard.offset;

      startTime = startTime - (startOffset*60000);
      endTime = endTime - (endOffset*60000);
    }

    return (startTime<=endTime);

}
/**
 * Checks whether the duration of this item is valid with respect to the
 * recurrence period.  For example, if the item repeats daily, its duration
 * should not be longer than a day.
 *
 * This can get very complicated due to custom repeat rules.  So the
 * limitation is just set on the repeat type.  The purpose is to prevent
 * (as has happened) someone creating a repeating appt where they set the
 * duration to be the span the appt is in effect over a year instead of its
 * duration during the day.  For example, repeat daily, start = Jan 1 2014,
 * end = July 1 2014.   See Bug 87993.
 *
 * @return	{Boolean}	<code>true</code> if the item possess valid duration.
 */
ZmCalItem.prototype.isValidDurationRecurrence = function() {
	var valid     = true;
	var recurType = this.getRecurType();
	var duration  = this.getDuration();
	switch (recurType) {
		case ZmRecurrence.DAILY:   valid = duration <= AjxDateUtil.MSEC_PER_DAY;       break;
		case ZmRecurrence.WEEKLY:  valid = duration <= ZmCalItem.MSEC_LIMIT_PER_WEEK;  break;
		case ZmRecurrence.MONTHLY: valid = duration <= ZmCalItem.MSEC_LIMIT_PER_MONTH; break;
		case ZmRecurrence.YEARLY:  valid = duration <= ZmCalItem.MSEC_LIMIT_PER_YEAR;  break;
		default: break;
	}
	return valid;
}

/**
 * @private
 */
ZmCalItem.prototype.parseAlarmData =
function() {
	if (!this.alarmData) { return; }

	for (var i = 0; i < this.alarmData.length; i++) {
		var alarm = this.alarmData[i].alarm;
		if (alarm) {
			for (var j = 0; j < alarm.length; j++) {
				this.parseAlarm(alarm[j]);
			}
		}
	}
};

/**
 * @private
 */
ZmCalItem.prototype.parseAlarm =
function(tmp) {
	if (!tmp) { return; }

	var s, m, h, d, w;
	var trigger = tmp.trigger;
	var rel = (trigger && (trigger.length > 0)) ? trigger[0].rel : null;
    s = (rel && (rel.length > 0)) ? rel[0].s : null;
	m = (rel && (rel.length > 0)) ? rel[0].m : null;
	d = (rel && (rel.length > 0)) ? rel[0].d : null;
	h = (rel && (rel.length > 0)) ? rel[0].h : null;
	w = (rel && (rel.length > 0)) ? rel[0].w : null;

    this._reminderMinutes = -1;
	if (tmp.action == ZmCalItem.ALARM_DISPLAY) {
        if (s == 0) { // at time of event
            this._reminderMinutes = 0;
        }
		if (m != null) {
			this._reminderMinutes = m;
            this._origReminderUnits = ZmCalItem.REMINDER_UNIT_MINUTES;
		}
		if (h != null) {
			h = parseInt(h);
			this._reminderMinutes = h * 60;
            this._origReminderUnits = ZmCalItem.REMINDER_UNIT_HOURS;
		}
		if (d != null) {
			d = parseInt(d);
			this._reminderMinutes = d * 24 * 60;
            this._origReminderUnits = ZmCalItem.REMINDER_UNIT_DAYS;
		}
        if (w != null) {
			w = parseInt(w);
			this._reminderMinutes = w * 7 * 24 * 60;
            this._origReminderUnits = ZmCalItem.REMINDER_UNIT_WEEKS;
		}
	}
};

/**
 * Checks if the start date is in range.
 * 
 * @param	{Date}	startTime	the start time of the range
 * @param	{Date}	endTime		the end time of the range
 * @return {Boolean}	<code>true</code> if the start date of this item is within range
 */
ZmCalItem.prototype.isStartInRange =
function(startTime, endTime) {
	var tst = this.getStartTime();
	return (tst < endTime && tst >= startTime);
};

/**
 * Checks if the end date is in range.
 * 
 * @param	{Date}	startTime	the start time of the range
 * @param	{Date}	endTime		the end time of the range
 * @return {Boolean}	<code>true</code> if the end date of this item is within range
 */
ZmCalItem.prototype.isEndInRange =
function(startTime, endTime) {
	var tet = this.getEndTime();
	return (tet <= endTime && tet > startTime);
};

/**
 * Sets the date range.
 * 
 * @param	{Hash}	rangeObject		a hash of <code>startDate</code> and <code>endDate</code>
 * @param	{Object}	instance	not used
 * @param	{Object}	parentValue	not used
 * @param	{Object}	refPath	not used
 */
ZmCalItem.prototype.setDateRange =
function (rangeObject, instance, parentValue, refPath) {
	var s = rangeObject.startDate;
	var e = rangeObject.endDate;
	this.endDate.setTime(rangeObject.endDate.getTime());
	this.startDate.setTime(rangeObject.startDate.getTime());
};

/**
 * Gets the date range.
 * 
 * @param	{Object}	instance	not used
 * @param	{Object}	current		not used
 * @param	{Object}	refPath		not used
 * @return	{Hash}	a hash of <code>startDate</code> and <code>endDate</code>
 */
ZmCalItem.prototype.getDateRange =
function(instance, current, refPath) {
	return { startDate:this.startDate, endDate: this.endDate };
};

/**
 * Sets the attachments.
 * 
 * @param	{String}	ids		a comma delimited string of ids
 */
ZmCalItem.prototype.setAttachments =
function(ids) {
	this.attachments = [];

	if (ids && ids.length > 0) {
		var split = ids.split(',');
		for (var i = 0 ; i < split.length; i++) {
			this.attachments[i] = { id:split[i] };
		}
	}
};

/**
 * Gets the attachments.
 * 
 * @return	{Array}	an array of attachments or <code>null</code> for none
 */
ZmCalItem.prototype.getAttachments =
function() {
	var attachs = this.message ? this.message.attachments : null;
	if (attachs) {
		if (this._validAttachments == null) {
			this._validAttachments = [];
			for (var i = 0; i < attachs.length; ++i) {
				if (this.message.isRealAttachment(attachs[i]) || attachs[i].contentType == ZmMimeTable.TEXT_CAL) {
					this._validAttachments.push(attachs[i]);
				}
			}
		}
		return this._validAttachments.length > 0 ? this._validAttachments : null;
	}
	return null;
};

/**
 * Removes an attachment.
 * 
 * @param	{Object}	part	the attachment part to remove
 */
ZmCalItem.prototype.removeAttachment =
function(part) {
	if (this._validAttachments && this._validAttachments.length > 0) {
		for (var i = 0; i < this._validAttachments.length; i++) {
			if (this._validAttachments[i].part == part) {
				this._validAttachments.splice(i,1);
				break;
			}
		}
	}
};

/**
 * Gets the start hour in short date format.
 * 
 * @return	{String}	the start hour
 */
ZmCalItem.prototype.getShortStartHour =
function() {
	var formatter = AjxDateFormat.getTimeInstance(AjxDateFormat.SHORT);
	return formatter.format(this.startDate);
};

/**
 * Gets the unique start date.
 * 
 * @return	{Date}	the start date
 */
ZmCalItem.prototype.getUniqueStartDate =
function() {
	if (this._uniqueStartDate == null && this.uniqStartTime) {
		this._uniqueStartDate = new Date(this.uniqStartTime);
	}
	return this._uniqueStartDate;
};

/**
 * Gets the unique end date.
 * 
 * @return	{Date}	the end date
 */
ZmCalItem.prototype.getUniqueEndDate =
function() {
	if (this._uniqueEndDate == null && this.uniqStartTime) {
		this._uniqueEndDate = new Date(this.uniqStartTime + this.getDuration());
	}
	return this._uniqueEndDate;
};

/**
 * Gets the details.
 * 
 * @param	{constant}	viewMode	the view mode
 * @param	{AjxCallback}	callback	the callback
 * @param	{AjxCallback}	errorCallback	the callback on error
 * @param	{Boolean}	ignoreOutOfDate		if <code>true</code>, ignore out of date items
 * @param	{Boolean}	noBusyOverlay		if <code>true</code>, no busy overlay
 * @param	{ZmBatchCommand}	batchCmd			set if part of a batch operation
 */
ZmCalItem.prototype.getDetails =
function(viewMode, callback, errorCallback, ignoreOutOfDate, noBusyOverlay, batchCmd) {
	var mode = viewMode || this.viewMode;

	var seriesMode = mode == ZmCalItem.MODE_EDIT_SERIES;
    var fetchSeriesMsg = (seriesMode && this.message && !this.message.seriesMode);
	if (this.message == null || fetchSeriesMsg) {
		var id = seriesMode ? (this.seriesInvId || this.invId || this.id) : this.invId;
		this.message = new ZmMailMsg(id);
		if (this._orig) {
			this._orig.message = this.message;
		}
		var respCallback = new AjxCallback(this, this._handleResponseGetDetails, [mode, this.message, callback]);
		var respErrorCallback = (!ignoreOutOfDate)
			? (new AjxCallback(this, this._handleErrorGetDetails, [mode, callback, errorCallback]))
			: errorCallback;

		var acct = appCtxt.isOffline && this.getFolder().getAccount();
		var params = {
			callback: respCallback,
			errorCallback: respErrorCallback,
			noBusyOverlay: noBusyOverlay,
			ridZ: (seriesMode ? null : this.ridZ),
			batchCmd: batchCmd,
			accountName: (acct && acct.name)
		};
		this.message.load(params);
	} else {
		this.setFromMessage(this.message, mode);
		if (callback) {
			callback.run();
		}
	}
};

/**
 * @private
 */
ZmCalItem.prototype.convertToLocalTimezone =
function() {
    var apptTZ = this.getTimezone();
    var localTZ = AjxTimezone.getServerId(AjxTimezone.DEFAULT);
    var sd = this.startDate;
    var ed = this.endDate;
    if(apptTZ != localTZ) {
        var offset1 = AjxTimezone.getOffset(AjxTimezone.DEFAULT, sd);
        var offset2 = AjxTimezone.getOffset(AjxTimezone.getClientId(apptTZ), sd);
        sd.setTime(sd.getTime() + (offset1 - offset2)*60*1000);
        ed.setTime(ed.getTime() + (offset1 - offset2)*60*1000);
        this.setTimezone(localTZ);
        this.setEndTimezone(localTZ);
    }
};


/**
 * @private
 */
ZmCalItem.prototype._handleResponseGetDetails =
function(mode, message, callback, result) {
	// msg content should be text, so no need to pass callback to setFromMessage()
	this.setFromMessage(message, mode);
    message.seriesMode = (mode == ZmCalItem.MODE_EDIT_SERIES);

    //overwrite proposed time
    if(this._orig && this._orig.proposedInvite) {
        var invite = this._orig.proposedInvite;
        var start = invite.getServerStartTime();
        var end = invite.getServerEndTime();
        if (start) this.setStartDate(AjxDateUtil.parseServerDateTime(start, true));
        if (end) this.setEndDate(AjxDateUtil.parseServerDateTime(end, true));

        //set timezone from proposed invite
        var tz = invite.getServerStartTimeTz();
        this.setTimezone(tz || AjxTimezone.getServerId(AjxTimezone.DEFAULT));

        // record whether the start/end dates are in UTC
        this.startsInUTC = start ? start.charAt(start.length-1) == "Z" : null;
        this.endsInUTC = end && start ? end.charAt(start.length-1) == "Z" : null;

        //set all the fields that are not generated in GetAppointmentResponse - accept proposal mode
        this.status = invite.components[0].status;

        //convert proposed invite timezone to local timezone
        this.convertToLocalTimezone();
        this.isAcceptingProposal = true;
    }
	if (callback) callback.run(result);
};

/**
 * @private
 */
ZmCalItem.prototype._handleErrorGetDetails =
function(mode, callback, errorCallback, ex) {
	if (ex.code == "mail.INVITE_OUT_OF_DATE") {
        var jsonObj = {},
            requestName = this._getRequestNameForMode(ZmCalItem.MODE_GET),
            request = jsonObj[requestName] = {
                _jsns : "urn:zimbraMail"
            },
            respCallback = new AjxCallback(this, this._handleErrorGetDetails2, [mode, callback, errorCallback]),
            params;

        request.id = this.id;
		params = {
			jsonObj: jsonObj,
			asyncMode: true,
			callback: respCallback,
			errorCallback: errorCallback
		};
		appCtxt.getAppController().sendRequest(params);
		return true;
	}
	if (ex.code == "account.ACCOUNT_INACTIVE") {
        var msg = ex.msg ? ex.msg.split(':') : null,
            acctEmailId = msg ? msg[1] : '',
            msgDlg = appCtxt.getMsgDialog();
        msgDlg.setMessage(AjxMessageFormat.format(ZmMsg.accountInactiveError, acctEmailId), DwtMessageDialog.CRITICAL_STYLE);
        msgDlg.popup();
		return true;
	}
	if (errorCallback) {
		return errorCallback.run(ex);
	}
	return false;
};

/**
 * @private
 */
ZmCalItem.prototype._handleErrorGetDetails2 =
function(mode, callback, errorCallback, result) {
	// Update invId and force a message reload
	var invite = this._getInviteFromError(result);
	this.invId = [this.id, invite.id].join("-");
	this.message = null;
	var ignoreOutOfDate = true;
	this.getDetails(mode, callback, errorCallback, ignoreOutOfDate);
};

/**
 * Sets the from message.
 * 
 * @param	{String}	message		the message
 * @param	{constant}	viewMode	the view mode
 * 
 * @private
 */
ZmCalItem.prototype.setFromMessage =
function(message, viewMode) {
	if (message == this._currentlyLoaded) { return; }

	if (message.invite) {
		this.isOrg = message.invite.isOrganizer();
		this.organizer = message.invite.getOrganizerEmail();
		this.organizerName = message.invite.getOrganizerName();
		this.sentBy = message.invite.getSentBy();
		this.name = message.invite.getName() || message.subject;
		this.isException = message.invite.isException();
        this.recurring =  message.invite.isRecurring();
        this.location = message.invite.getLocation();
        this.seq = message.invite.getSequenceNo();
        this.allDayEvent = message.invite.isAllDayEvent();
        this.rgb = message.invite.getRGB();
        this.color = message.invite.getColor();
        if(message.invite.id) {
            this.invId = this.id + "-" + message.invite.id;
        }
		this._setTimeFromMessage(message, viewMode);
		this._setExtrasFromMessage(message);
		this._setRecurrence(message);
	}
	this._setNotes(message);
	this.getAttachments();

	this._currentlyLoaded = message;
};

/**
 * Sets the required data from saved response
 *
 * @param	{Object} result create/moify appt response
 */
ZmCalItem.prototype.setFromSavedResponse =
function(result) {
    this.invId = result.invId;
    if(this.message) {
        this.message.rev = result.rev;
        this.message.ms = result.ms;
    }

    if(this.viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE && !this.isException) {
        this.isException = true;
    }
};

/**
 * Sets the from mail message. This method gets called when a mail item
 * is dragged onto the item and we
 * need to load the mail item and parse the right parts to show in {@link ZmCalItemEditView}.
 * 
 * @param	{String}	message		the message
 * @param	{String}	subject		the subject
 * 
 * @private
 */
ZmCalItem.prototype.setFromMailMessage =
function(message, subject) {
	this.name = subject;
	this._setNotes(message);
	// set up message so attachments work
	this.message = message;
	this.invId = message.id;
};

/**
 * Sets the notes (text/plain).
 * 
 * @param	{String}	notes		the notes
 */
ZmCalItem.prototype.setTextNotes =
function(notes) {
	this.notesTopPart = new ZmMimePart();
	this.notesTopPart.setContentType(ZmMimeTable.TEXT_PLAIN);
	this.notesTopPart.setContent(notes);
};

/**
 * @private
 */
ZmCalItem.prototype._setTimeFromMessage =
function(message, viewMode) {
	// For instance of recurring appointment, start date is generated from unique
	// start time sent in appointment summaries. Associated message will contain
	// only the original start time.
	var start = message.invite.getServerStartTime();
	var end = message.invite.getServerEndTime();
	if (viewMode === ZmCalItem.MODE_EDIT_SINGLE_INSTANCE || viewMode === ZmCalItem.MODE_FORWARD_SINGLE_INSTANCE
			|| viewMode === ZmCalItem.MODE_COPY_SINGLE_INSTANCE) {
		var usd = this.getUniqueStartDate();
		if (usd) {
			this.setStartDate(usd);
		}

		var ued = this.getUniqueEndDate();
		if (ued) {
			if (this.isAllDayEvent() && viewMode === ZmCalItem.MODE_COPY_SINGLE_INSTANCE) {
				//special case - copying and all day event. The day it ends is a one too many days. Creating a copy gets confused otherwise and adds that day.
				ued.setDate(ued.getDate() - 1);
			}
			this.setEndDate(ued);
		}
		if (viewMode === ZmCalItem.MODE_COPY_SINGLE_INSTANCE) {
			viewMode = ZmCalItem.MODE_EDIT_SINGLE_INSTANCE; // kinda hacky - the copy mode has run its course. Now treat it like edit mode. Would be less impact.
		}
	}
	else {
		if (start) this.setStartDate(AjxDateUtil.parseServerDateTime(start));
		if (end) this.setEndDate(AjxDateUtil.parseServerDateTime(end));
	}

	// record whether the start/end dates are in UTC
	this.startsInUTC = start ? start.charAt(start.length-1) == "Z" : null;
	this.endsInUTC = end && start ? end.charAt(start.length-1) == "Z" : null;

	// record timezone
    var timezone;
	if (viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE || viewMode == ZmCalItem.MODE_DELETE_INSTANCE || viewMode == ZmCalItem.MODE_FORWARD_SINGLE_INSTANCE) {
        timezone = AjxTimezone.getServerId(AjxTimezone.DEFAULT);
		this.setTimezone(timezone);
		this.setEndTimezone(timezone);
	}
	else {
		var serverId = !this.startsInUTC && message.invite.getServerStartTimeTz();
        timezone = serverId || AjxTimezone.getServerId(AjxTimezone.DEFAULT);
		this.setTimezone(timezone);
        var endServerId = !this.endsInUTC && message.invite.getServerEndTimeTz();
		this.setEndTimezone(endServerId || AjxTimezone.getServerId(AjxTimezone.DEFAULT));
		if(!this.startsInUTC && message.invite.getServerEndTimeTz()) this.setEndTimezone(message.invite.getServerEndTimeTz());
	}

	var tzrule = AjxTimezone.getRule(AjxTimezone.getClientId(this.getTimezone()));
	if (tzrule) {
		if (tzrule.aliasId) {
			tzrule = AjxTimezone.getRule(tzrule.aliasId) || tzrule;
		}
		this.setTimezone(tzrule.serverId);
	}

    tzrule = AjxTimezone.getRule(AjxTimezone.getClientId(this.endTimezone));
    if (tzrule) {
        if (tzrule.aliasId) {
            tzrule = AjxTimezone.getRule(tzrule.aliasId) || tzrule;
        }
        this.setEndTimezone(tzrule.serverId);
    }
};

/**
 * Override to add specific initialization but remember to call
 * the base implementation.
 *
 * @private
 */
ZmCalItem.prototype._setExtrasFromMessage =
function(message) {
    this._setAlarmFromMessage(message);
};

ZmCalItem.prototype._setAlarmFromMessage =
function(message) {
    this._reminderMinutes = -1;
	var alarm = message.invite.getAlarm();
	if (alarm) {
		for (var i = 0; i < alarm.length; i++) {
            var alarmInst = alarm[i];
            if (!alarmInst) continue;

            var action = alarmInst.action;
			if (action == ZmCalItem.ALARM_DISPLAY) {
				this.parseAlarm(alarmInst);
                // NOTE: No need to add a display alarm because it's
                // NOTE: added by default in the constructor.
                continue;
			}

            // NOTE: Both email and device-email/sms reminders appear
            // NOTE: as "EMAIL" alarms but we distinguish between them
            // NOTE: upon loading.
            if (action == ZmCalItem.ALARM_EMAIL) {
                var emails = alarmInst.at;
                if (!emails) continue;
                for (var j = 0; j < emails.length; j++) {
                    var email = emails[j].a;
                    if (email == appCtxt.get(ZmSetting.CAL_DEVICE_EMAIL_REMINDERS_ADDRESS)) {
                        action = ZmCalItem.ALARM_DEVICE_EMAIL;
                    }
                    this.addReminderAction(action);
                }
            }
		}
	}
};

/**
 * @private
 */
ZmCalItem.prototype._setRecurrence =
function(message) {
	var recurRules = message.invite.getRecurrenceRules();

	if (recurRules)
		this._recurrence.parse(recurRules);

	if (this._recurrence.repeatWeeklyDays == null)
		this.resetRepeatWeeklyDays();

	if (this._recurrence.repeatMonthlyDayList == null)
		this.resetRepeatMonthlyDayList();
};

/**
 * We are removing starting 2 \n's for the bug 21823
 * XXX - this does not look very efficient
 * 
 * @private
 */
ZmCalItem.prototype._getCleanHtml2Text = 
function(dwtIframe) {
	var textContent;
	var idoc = dwtIframe ? dwtIframe.getDocument() : null;
	var body = idoc ? idoc.body : null;
	if (body) {
		var html = body.innerHTML.replace(/\n/ig, "");
		body.innerHTML = html.replace(/<!--.*-->/ig, "");
		var firstChild = body.firstChild;
		var removeN = (firstChild && firstChild.tagName && firstChild.tagName.toLocaleLowerCase() == "p");
		textContent = AjxStringUtil.convertHtml2Text(body);
		if (removeN) {
			textContent = textContent.replace(/\n\n/i, "");
		}
	}
	return textContent;
};

/**
 * @private
 */
ZmCalItem.prototype._setNotes =
function(message) {

    if(!(message.isZmMailMsg)) { return; }
	this.notesTopPart = new ZmMimePart();

	var htmlContent = message.getBodyContent(ZmMimeTable.TEXT_HTML);
	if (htmlContent) {
		htmlContent = htmlContent.replace(/<title\s*>.*\/title>/ig,"");
		if (!this._includeEditReply) {
			htmlContent = this._trimNotesSummary(htmlContent, true);
		}
	}

	if (htmlContent) {
		// create a temp iframe to create a proper DOM tree
		var params = {parent:appCtxt.getShell(), hidden:true, html:htmlContent};
		var textContent = message.getInviteDescriptionContentValue(ZmMimeTable.TEXT_PLAIN);
		if (!textContent) { //only go through this pain if textContent is somehow not available from getInviteDescriptionContentValue (no idea if this could happen).
			var dwtIframe = new DwtIframe(params);
			textContent = this._getCleanHtml2Text(dwtIframe);
			// bug: 23034 this hidden iframe under shell is adding more space
			// which breaks calendar column view
			var iframe = dwtIframe.getIframe();
			if (iframe && iframe.parentNode) {
				iframe.parentNode.removeChild(iframe);
			}
			delete dwtIframe;
		}

        // create two more mp's for text and html content types
		var textPart = new ZmMimePart();
		textPart.setContentType(ZmMimeTable.TEXT_PLAIN);
		textPart.setContent(textContent);

		var htmlPart = new ZmMimePart();
		htmlPart.setContentType(ZmMimeTable.TEXT_HTML);
		htmlPart.setContent(htmlContent);

		this.notesTopPart.setContentType(ZmMimeTable.MULTI_ALT);
		this.notesTopPart.children.add(textPart);
		this.notesTopPart.children.add(htmlPart);
	} else {
		var textContent = message.getBodyContent(ZmMimeTable.TEXT_PLAIN);
		if (!this._includeEditReply) {
			textContent = this._trimNotesSummary(textContent);
		}

        // The last content type is updated based on message's content type, it takes care of text/plain or text/html based on their availability
        var mimeContentType = this.isTextPartPresent(message) ? ZmMimeTable.TEXT_PLAIN : message._lastContentType;

		this.notesTopPart.setContentType(mimeContentType);
		this.notesTopPart.setContent(textContent);
	}
};

/**
 * Gets the mail notification option.
 * 
 * @return	{Boolean}	<code>true</code> if the mail notification is set; <code>false</code> otherwise
 */
ZmCalItem.prototype.getMailNotificationOption =
function() {
    return this._sendNotificationMail;
};

/**
 * Sets the mail notification option.
 * 
 * @param	{Boolean}	sendNotificationMail	<code>true</code> to set the mail notification
 */
ZmCalItem.prototype.setMailNotificationOption =
function(sendNotificationMail) {
    this._sendNotificationMail = sendNotificationMail;    
};

/**
 * Sets the exception details to request
 *
 * @param	{Element}	comp	comp element of request object
 */
ZmCalItem.prototype.addExceptionDetails =
function(comp) {
    var exceptId = comp.exceptId = {},
        allDay = this._orig ? this._orig.allDayEvent : this.allDayEvent,
        timezone,
        sd;

    if (allDay != "1") {
        sd = AjxDateUtil.getServerDateTime(this.getOrigStartDate(), this.startsInUTC);
        // bug fix #4697 (part 2)
        timezone = this.getOrigTimezone();
        if (!this.startsInUTC && timezone) {
            exceptId.tz = timezone;
        }
        exceptId.d = sd;
    }
    else {
        sd = AjxDateUtil.getServerDate(this.getOrigStartDate());
        exceptId.d = sd;
    }
};

/**
 * Saves the item.
 * 
 * @param {String}	attachmentId 		the id of the already uploaded attachment
 * @param {AjxCallback}		callback 			the callback triggered once request for appointment save is complete
 * @param {AjxCallback}		errorCallback		the callback triggered if error during appointment save request
 * @param {Array}	notifyList 		the optional sublist of attendees to be notified (if different from original list of attendees)
*/
ZmCalItem.prototype.save =
function(attachmentId, callback, errorCallback, notifyList) {
	var needsExceptionId = false,
        jsonObj = {},
        requestName = this._getRequestNameForMode(this.viewMode, this.isException),
        request = jsonObj[requestName] = {
            _jsns : "urn:zimbraMail"
        },
        accountName,
        invAndMsg,
        comp;

	if (this.viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE &&
		!this.isException)
	{
		this._addInviteAndCompNum(request);
		needsExceptionId = true;
	}
	else if (this.viewMode == ZmCalItem.MODE_EDIT ||
			 this.viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE || 
			 this.viewMode == ZmCalItem.MODE_EDIT_SERIES)
	{
		this._addInviteAndCompNum(request);
		needsExceptionId = this.isException;
	}

	accountName = this.getRemoteFolderOwner();
	invAndMsg = this._setRequestAttributes(request, attachmentId, notifyList, accountName);

	comp = invAndMsg.inv.comp[0];
	if (needsExceptionId) {
        this.addExceptionDetails(comp);
	} else {
		// set recurrence rules for appointment (but not for exceptions!)
		this._recurrence.setJson(comp);
	}

	//set alarm data
	this._setAlarmData(comp);

	this._sendRequest(null, accountName, callback, errorCallback, jsonObj, requestName);
};

ZmCalItem.prototype._setAlarmData =
function(comp) {

	var useAbs = this._useAbsoluteReminder,
        time = useAbs ? this._reminderAbs : this._reminderMinutes;

    if (time == null || time === -1) {
        return;
    }

    for (var i = 0, len = this.alarmActions.size(); i < len; i++) {
		var email = null;
		var action = this.alarmActions.get(i);
		if (action == ZmCalItem.ALARM_EMAIL) {
			email = appCtxt.get(ZmSetting.CAL_EMAIL_REMINDERS_ADDRESS);
			if (!email) {
                continue;
            }
		}
        if (action == ZmCalItem.ALARM_DEVICE_EMAIL) {
            email = appCtxt.get(ZmSetting.CAL_DEVICE_EMAIL_REMINDERS_ADDRESS);
            if (!email) {
                continue;
            }
            // NOTE: treat device email alarm as a standard email alarm
            action = ZmCalItem.ALARM_EMAIL;
        }
		var alarms = comp.alarm = comp.alarm || [];
		var alarm = {action: action};
		alarms.push(alarm);
		var trigger = alarm.trigger = {};
		this._setReminderUnits(trigger, time);
		this._addXPropsToAlarm(alarm);
		if (email) {
			alarm.at = {a: email};
		}
	}
};

/**
 * @private
 */
ZmCalItem.prototype._setReminderUnits =
function(trigger, time) {
	time = time || 0;
	var useAbs = this._useAbsoluteReminder,
        rel = trigger[useAbs ? "abs" : "rel"] = {};
	if (useAbs) {
		rel.d = time;
	}
	else {
		rel.m = time;
		//default option is to remind before appt start
		rel.related = "START";
		rel.neg = "1";
	}
};

/**
 * @private
 */
ZmCalItem.prototype._addXPropsToAlarm =
function(alarmNode) {
	if (!this.alarmData) {
        return;
    }
	var alarmData = (this.alarmData && this.alarmData.length > 0)? this.alarmData[0] : null,
	    alarm = alarmData ? alarmData.alarm : null,
	    alarmInst = (alarm && alarm.length > 0) ? alarm[0] : null;

    this._setAlarmXProps(alarmInst, alarmNode);
};

/**
 * @private
 */
ZmCalItem.prototype._setAlarmXProps =
function(alarmInst, alarmNode)  {
    var xprops = (alarmInst && alarmInst.xprop) ? alarmInst.xprop : null,
        i,
        x,
        xprop;

    if (!xprops) {
        return;
    }
    // bug 28924: preserve x props
    xprops = (xprops instanceof Array) ? xprops : [xprops];

    for (i = 0; i < xprops.length; i++) {
        xprop = xprops[i];
        if (xprop && xprop.name) {
            x = alarmNode.xprop = {};
            x.name = xprop.name;
            if (xprop.value != null) {
                x.value = xprop.value;
            }
            this._addXParamToRequest(x, xprop.xparam);
        }
    }
};

/**
 * Sets reminder minutes.
 * 
 * @param	{int}	minutes		the minutes
 */
ZmCalItem.prototype.setReminderMinutes =
function(minutes) {
	this._reminderMinutes = minutes;
};

/**
 * Sets the reminder units
 * 
 * @param	{int}	reminderValue		the reminder value
 * @param	{int}	reminderUnits		the reminder units
 */
ZmCalItem.prototype.setReminderUnits =
function(reminderValue, reminderUnits, sendEmail) {
    if (!reminderValue) {
        this._reminderMinutes = 0;
        return;
    }
    reminderValue = parseInt(reminderValue + "");
	this._reminderMinutes = ZmCalendarApp.convertReminderUnits(reminderValue, reminderUnits);
	this._reminderSendEmail = sendEmail;
};

/**
 * Adds the given action to this appt's reminders. A type of action can only be added once.
 *
 * @param {constant}	action		alarm action
 */
ZmCalItem.prototype.addReminderAction =
function(action) {
	this.alarmActions.add(action, null, true);
};

/**
 * Removes the given action from this appt's reminders.
 *
 * @param {constant}	action		alarm action
 */
ZmCalItem.prototype.removeReminderAction =
function(action) {
	this.alarmActions.remove(action);
};

/**
 * Deletes/cancels appointment/invite
 *
 * @param {int}	mode		designated what kind of delete op is this?
 * @param {ZmMailMsg}		msg				the message to be sent in lieu of delete
 * @param {AjxCallback}		callback			the callback to trigger after delete
 * @param {AjxCallback}		errorCallback	the error callback to trigger
 * @param {ZmBatchCommand}	batchCmd		set if part of a batch operation
 */
ZmCalItem.prototype.cancel =
function(mode, msg, callback, errorCallback, batchCmd) {
	this.setViewMode(mode);
	if (msg) {
		// REVISIT: We explicitly set the bodyParts of the message b/c
		// ZmComposeView#getMsg only sets topPart on new message that's returned.
		// And ZmCalItem#_setNotes calls ZmMailMsg#getBodyPart.
		var bodyParts = [];
		var childParts = (msg._topPart.contentType == ZmMimeTable.MULTI_ALT)
			? msg._topPart.children.getArray()
			: [msg._topPart];
		for (var i = 0; i < childParts.length; i++) {
			bodyParts.push(childParts[i]);
		}
		msg.setBodyParts(bodyParts);
		this._setNotes(msg);
		this._doCancel(mode, callback, msg, batchCmd);
	} else {
		// To get the attendees for this appointment, we have to get the message.
		var respCallback = new AjxCallback(this, this._doCancel, [mode, callback, null, batchCmd]);
		var cancelErrorCallback = new AjxCallback(this, this._handleCancelError, [mode, callback, errorCallback]);
		if (this._blobInfoMissing && mode != ZmCalItem.MODE_DELETE_SERIES) {
			this.showBlobMissingDlg();		
		} else {
			this.getDetails(null, respCallback, cancelErrorCallback);
		}
	}
};

/**
 * @private
 */
ZmCalItem.prototype.showBlobMissingDlg =
function() {
	var msgDialog = appCtxt.getMsgDialog();
	msgDialog.setMessage(ZmMsg.apptBlobMissing, DwtMessageDialog.INFO_STYLE);
	msgDialog.popup();
};

/**
 * @private
 */
ZmCalItem.prototype._handleCancelError = 
function(mode, callback, errorCallback, ex) {

	if (ex.code == "mail.NO_SUCH_BLOB") {
 		//bug: 19033, cannot delete instance of appt with missing blob info
 		if (this.isRecurring() && mode != ZmCalItem.MODE_DELETE_SERIES) {
			this._blobInfoMissing = true;
			this.showBlobMissingDlg();
			return true;
 		} else {
	 		this._doCancel(mode, callback, this.message);
 		}
 		return true;
 	}
	
	if (errorCallback) {
		return errorCallback.run(ex);
	}

	return false;
};

/**
 * @private
 */
ZmCalItem.prototype.setCancelFutureInstances =
function(cancelFutureInstances) {
    this._cancelFutureInstances = cancelFutureInstances;    
};

ZmCalItem.prototype._sendCancelMsg =
function(callback){
    this.save(null, callback);
};

/**
 * @private
 */
ZmCalItem.prototype._doCancel =
function(mode, callback, msg, batchCmd, result) {
    var folderId = this.getFolder().nId,
        jsonObj = {},
        requestName,
        request,
        action,
        accountName = this.getRemoteFolderOwner(),
        recurrence,
        untilDate,
        inst,
        allDay,
        format,
        clientId,
        m,
        e,
        i,
        j,
        type,
        vector,
        count,
        addr,
        subject,
        mailFromAddress,
        isOrganizer;

    if (folderId == ZmOrganizer.ID_TRASH) {
		mode = ZmCalItem.MODE_PURGE;
        requestName = this._getRequestNameForMode(mode);
        request = jsonObj[requestName] = {
            _jsns : "urn:zimbraMail"
        };
        action = request.action = {};
		action.op = "delete";
		action.id = this.id;
		if (batchCmd) {
			batchCmd.addRequestParams(jsonObj, callback);
		} else {
			this._sendRequest(null, accountName, callback, null, jsonObj, requestName);
		}
	}
    else {
	    if (mode == ZmCalItem.MODE_DELETE_SERIES && this._cancelFutureInstances && this.getOrigStartDate().getTime() != this.getStartTime()) {
	
	        recurrence = this._recurrence;
	        untilDate = new Date(this.getOrigStartDate().getTime());
	        untilDate.setTime(untilDate.getTime() - AjxDateUtil.MSEC_PER_DAY);
	        recurrence.repeatEndDate = untilDate;
	        recurrence.repeatEndType = "D";
	
	        this.viewMode = ZmCalItem.MODE_EDIT_SERIES;
	        this._sendCancelMsg(callback);
	        return;
	    }
		
		if (mode == ZmCalItem.MODE_DELETE ||
			mode == ZmCalItem.MODE_DELETE_SERIES ||
			mode == ZmCalItem.MODE_DELETE_INSTANCE)
		{
            requestName = this._getRequestNameForMode(mode);
            request = jsonObj[requestName] = {
                _jsns : "urn:zimbraMail"
            };

			this._addInviteAndCompNum(request);

			// Exceptions should be treated as instances (bug 15817)
			if (mode == ZmCalItem.MODE_DELETE_INSTANCE || this.isException) {
                request.s = this.getOrigStartTime();
				inst = request.inst = {};
				allDay = this.isAllDayEvent();
				format = allDay ? AjxDateUtil.getServerDate : AjxDateUtil.getServerDateTime;
				inst.d = format(this.getOrigStartDate());
				if (!allDay && this.timezone) {
					inst.tz = this.timezone;

					clientId = AjxTimezone.getClientId(this.timezone);
					ZmTimezone.set(request, clientId, null, true);
				}
			}
            m = request.m = {};
            e = m.e = [];
            isOrganizer = this.isOrganizer();
            if (isOrganizer) {
                if (!this.inviteNeverSent) {
                    // NOTE: We only use the explicit list of addresses if sending via
                    //       a message compose.
                    if (msg) {
                        for (i = 0; i < ZmMailMsg.ADDRS.length; i++) {
                            type = ZmMailMsg.ADDRS[i];

                            // if on-behalf-of, dont set the from address and
                            // don't set the reset-from (only valid when receiving a message)
                            if ((accountName && type == AjxEmailAddress.FROM) ||
                                (type == AjxEmailAddress.RESENT_FROM)) {
                                continue;
                            }

                            vector = msg.getAddresses(type);
                            count = vector.size();
                            for (j = 0; j < count; j++) {
                                addr = vector.get(j);
                                e.push({
                                    a: addr.getAddress(),
                                    t: AjxEmailAddress.toSoapType[type]
                                });
                            }
                        }

                        // set from address to on-behalf-of if applicable
                        if (accountName) {
                            e.push({
                                a: accountName,
                                t: AjxEmailAddress.toSoapType[AjxEmailAddress.FROM]
                            });
                        }
                    }
                    else {
                        this._addAttendeesToRequest(null, m, null, accountName);
                    }
                }
                mailFromAddress = this.getMailFromAddress();
                if (mailFromAddress) {
                    e.push({
                        a : mailFromAddress,
                        t : AjxEmailAddress.toSoapType[AjxEmailAddress.FROM]
                    });
                }
            }
	        subject = (msg && msg.subject) ? msg.subject : ([ZmMsg.cancelled, ": ", this.name].join(""));
            m.su = subject;
			this._addNotesToRequest(m, true);

			if (batchCmd) {
				batchCmd.addRequestParams(jsonObj, callback);
			}
            else {
				this._sendRequest(null, accountName, callback, null, jsonObj, requestName);
			}
		}
        else {
			if (callback) callback.run();
		}
	}
};

/**
 * Gets the mail from address.
 * 
 * @return	{String}	the address
 */
ZmCalItem.prototype.getMailFromAddress =
function() {
    var mailFromAddress = appCtxt.get(ZmSetting.MAIL_FROM_ADDRESS);
    if(mailFromAddress) {
        return (mailFromAddress instanceof Array) ? mailFromAddress[0] : mailFromAddress;
    }
};

// Returns canned text for meeting invites.
// - Instances of recurring meetings should send out information that looks very
//   much like a simple appointment.
/**
 * Gets the summary as text.
 * 
 * @return	{String}	the summary
 */
ZmCalItem.prototype.getTextSummary =
function() {
	return this.getSummary(false);
};

/**
 * Gets the summary as HTML.
 * 
 * @return	{String}	the summary
 */
ZmCalItem.prototype.getHtmlSummary =
function() {
	return this.getSummary(true);
};



// Private / Protected methods

/**
 * @private
 */
ZmCalItem.prototype._getTextSummaryTime =
function(isEdit, fieldstr, extDate, start, end, hasTime) {
	var showingTimezone = appCtxt.get(ZmSetting.CAL_SHOW_TIMEZONE);

	var buf = [];
	var i = 0;

	if (extDate) {
		buf[i++] = AjxDateUtil.longComputeDateStr(extDate);
		buf[i++] = ", ";
	}
	if (this.isAllDayEvent()) {
		buf[i++] = ZmMsg.allDay;
	} else {
		var formatter = AjxDateFormat.getTimeInstance();
		if (start)
			buf[i++] = formatter.format(start);
		if (start && end)
			buf[i++] = " - ";
		if (end)
			buf[i++] = formatter.format(end);

		if (showingTimezone) {
			buf[i++] = " ";
			buf[i++] = AjxTimezone.getLongName(AjxTimezone.getClientId(this.timezone));
		}
	}
	// NOTE: This relies on the fact that setModel creates a clone of the
	//		 appointment object and that the original object is saved in
	//		 the clone as the _orig property.
	if (isEdit && ((this._orig && this._orig.isAllDayEvent() != this.isAllDayEvent()) || hasTime)) {
		buf[i++] = " ";
		buf[i++] = ZmMsg.apptModifiedStamp;
	}
	buf[i++] = "\n";

	return buf.join("");
};

/**
 * Uses indexOf() rather than a regex since IE didn't split on the regex correctly.
 * 
 * @private
 */
ZmCalItem.prototype._trimNotesSummary =
function(notes, isHtml) {
	if (notes) {
		var idx = notes.indexOf(ZmItem.NOTES_SEPARATOR);
		if (idx != -1) {
			notes = notes.substr(idx + ZmItem.NOTES_SEPARATOR.length);
            if (isHtml) {
                // If HTML content is generated from text content \n are replaced with br
                // Remove the leading <br> added
                notes = notes.replace(/^<br><br>/i, "");
				notes = notes.replace(/^<\/div><br>/i, "");
				// Removes </body></html> if that is all that is left.  Reduces the html to "" in that case,
				// so that later checks don't detect HTML notes.
				notes = notes.replace(/^<\/body><\/html>/i, "");
			}
            else {
                notes = notes.replace(/^\n\n/i, "");
            }
		}
	}
	return AjxStringUtil.trim(notes);
};

/**
 * @private
 */
ZmCalItem.prototype._resetCached =
function() {
	delete this._startTimeUniqId; this._startTimeUniqId = null;
	delete this._validAttachments; this._validAttachments = null;
	delete this.tooltip; this.tooltip = null;
};

/**
 * @private
 */
ZmCalItem.prototype._getTTDay =
function(d) {
	return DwtCalendar.getDayFormatter().format(d);
};

/**
 * @private
 */
ZmCalItem.prototype._addInviteAndCompNum =
function(request) {
    var id;
    if(this.message && !this.isVersionIgnored()){
        request.ms = this.message.ms;
        request.rev = this.message.rev;

    }
	if (this.viewMode == ZmCalItem.MODE_EDIT_SERIES || this.viewMode == ZmCalItem.MODE_DELETE_SERIES) {
		if (this.recurring && this.seriesInvId != null) {
            request.id = this.seriesInvId;
            request.comp = this.getCompNum();
		}
	} else {
		if (this.invId != null && this.invId != -1) {
			id =  this.invId;

			// bug: 41530 - for offline, make sure id is fully qualified if moving across accounts
			if (appCtxt.multiAccounts &&
				this._orig &&
				this._orig.getFolder().getAccount() != this.getFolder().getAccount())
			{
				id = ZmOrganizer.getSystemId(this.invId, this._orig.getFolder().getAccount(), true);
			}

            request.id = id;
            request.comp = this.getCompNum();
		}
	}
};

/**
 * @private
 */
ZmCalItem.prototype._getDefaultBlurb =
function(cancel, isHtml) {
	var buf = [];
	var i = 0;
	var singleInstance = this.viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE ||
						 this.viewMode == ZmCalItem.MODE_DELETE_INSTANCE;

	if (isHtml) buf[i++] = "<h3>";

    if(this.isProposeTimeMode) {
        buf[i++] =  ZmMsg.subjectNewTime;
    }else if (cancel) {
		buf[i++] = singleInstance ? ZmMsg.apptInstanceCanceled : ZmMsg.apptCanceled;
	} else if(!this.isForwardMode || this.isOrganizer()){
		if (!this.inviteNeverSent && ( this.viewMode == ZmCalItem.MODE_EDIT ||
			this.viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE ||
			this.viewMode == ZmCalItem.MODE_EDIT_SERIES ) )
		{
			buf[i++] = singleInstance ? ZmMsg.apptInstanceModified : ZmMsg.apptModified;
		}
		else
		{
			buf[i++] = ZmMsg.apptNew;
		}
	}else {
        buf[i++] =  ZmMsg.apptForwarded;
    }

	if (isHtml) buf[i++] = "</h3>";

	buf[i++] = "\n\n";
	buf[i++] = this.getSummary(isHtml);

	return buf.join("");
};

// Server request calls

/**
 * @private
 */
ZmCalItem.prototype._getRequestNameForMode =
function(mode, isException) {
	// override
};

/**
 * @private
 */
ZmCalItem.prototype._getInviteFromError =
function(result) {
	// override
};

/**
 * @private
 */
ZmCalItem.prototype._setRequestAttributes =
function(request, attachmentId, notifyList, accountName) {

	var m = request.m = {},
	    calendar = this.getFolder(),
        acct = calendar.getAccount(),
        isOnBehalfOf = accountName && acct && acct.name != accountName,
        mailFromAddress,
        identityUser,
        displayName,
        validAttLen,
        attachNode,
        organizer,
        isPrimary,
        identityC,
        identity,
        isRemote,
        addrObj,
        orgName,
        comps,
        comp,
        user,
        addr,
        inv,
        org,
        mid,
        me,
        e,
        i;
	//m.setAttribute("l", (isOnBehalfOf ? this.getFolder().rid : this.folderId));
    m.l = (isOnBehalfOf ? this.getFolder().rid : this.folderId);
    inv = m.inv = {};
    e = m.e = [];
	if (this.uid != null && this.uid != -1 && !this.isSharedCopy) {
        inv.uid = this.uid;
	}

    comps = inv.comp = [];
    comp = comps[0] = {};
    comp.at = [];
	// attendees
	this._addAttendeesToRequest(comp, m, notifyList, accountName);

    identity = this.identity;
    isPrimary = identity == null || identity.isDefault;
    isRemote = calendar.isRemote();

    //FROM Address
	mailFromAddress = this.getMailFromAddress();
	if (this.isOrganizer() && !accountName && (mailFromAddress || isRemote || !isPrimary)) {
        if(mailFromAddress){
            addr = mailFromAddress;
        }else{
            if(isRemote){
                addr = this.organizer;
            }else if(identity){
                addr = identity.sendFromAddress;
                displayName = identity.sendFromDisplay;
            }
        }
        addrObj = {
            a : addr,
            t : AjxEmailAddress.toSoapType[AjxEmailAddress.FROM]
        };
        if(!displayName && addr == appCtxt.get(ZmSetting.USERNAME)){
             displayName = appCtxt.get(ZmSetting.DISPLAY_NAME);
        }
        if(displayName){
            addrObj.p = displayName;
        }
        e.push(addrObj);
        if (identity && identity.isFromDataSource && !isRemote) {
            this._addIdentityFrom(identity, e, m);
        }
	}

    //SENDER Address
    if (isRemote) {
        if (!identity) {
            identityC = appCtxt.getIdentityCollection();
            identity = identityC && identityC.defaultIdentity;
        }
        if (identity) {
            addr = identity.sendFromAddress;
            displayName = identity.sendFromDisplay;
        }
        else {
            addr = appCtxt.get(ZmSetting.USERNAME);
            displayName = appCtxt.get(ZmSetting.DISPLAY_NAME);
        }
        addrObj = {
            a : addr,
            t : AjxEmailAddress.toSoapType[AjxEmailAddress.SENDER]
        };
        if (displayName) {
            addrObj.p = displayName;
        }
        e.push(addrObj);
    }

	this._addExtrasToRequest(request, comp);
	this._addDateTimeToRequest(request, comp);
	this._addXPropsToRequest(comp);
	
	// subject/location
    m.su = this.name;
    comp.name = this.name;
	this._addLocationToRequest(comp);

	// notes
	this._addNotesToRequest(m);

	// set organizer - but not for local account
	if (!(appCtxt.isOffline && acct.isMain)) {
		me = (appCtxt.multiAccounts) ? acct.getEmail() : appCtxt.get(ZmSetting.USERNAME);
        if (!identity) {
            identityC = appCtxt.getIdentityCollection(acct);
            identity = identityC && identityC.defaultIdentity;
        }        
        if (identity) { //If !Identity then consider the default identity
            identityUser = identity.sendFromAddress;
            displayName = identity.sendFromDisplay;
        }
		user = mailFromAddress || identityUser || me;
		organizer = this.organizer || user;
        org = comp.or = {};
        org.a = organizer;
		if (isRemote) {
			org.sentBy = user;  // if on-behalf of, set sentBy
		}
        orgName = (organizer == identityUser) ? displayName : (ZmApptViewHelper.getAddressEmail(organizer)).getName();
		if (orgName) {
            org.d = orgName;
        }
	}

	// handle attachments
	this.flagLocal(ZmItem.FLAG_ATTACH, false);
	this.getAttachments(); // bug 22874: make sure to populate _validAttachments
	if (attachmentId != null ||
		(this._validAttachments != null && this._validAttachments.length))
	{
        attachNode = request.m.attach = {};
		if (attachmentId){
            attachNode.aid = attachmentId;
			this.flagLocal(ZmItem.FLAG_ATTACH, true);
		}

		if (this._validAttachments) {
			validAttLen = this._validAttachments.length;
            attachNode.mp = [];
			for (i = 0; i < validAttLen; i++) {

				mid = (this.invId || this.message.id);
				if ((mid.indexOf(":") < 0) && calendar.isRemote()) {
					mid = (appCtxt.getActiveAccount().id + ":" + mid);
				}
                attachNode.mp.push({
                    mid : mid,
                    part : this._validAttachments[i].part
                });
			}
			if (validAttLen > 0) {
				this.flagLocal(ZmItem.FLAG_ATTACH, true);
			}
		}
	}
	// Appointment color
	this._addColorRgbToRequest(comp);

	return {'inv': inv, 'm': m };
};

ZmCalItem.prototype._addIdentityFrom =
function(identity, e, m) {
    var dataSource = appCtxt.getDataSourceCollection().getById(identity.id),
        provider,
        doNotAddSender,
        addrObj,
        displayName;

    if (dataSource) {
        provider = ZmDataSource.getProviderForAccount(dataSource);
        doNotAddSender = provider && provider._nosender;
        // main account is "sender"
        if (!doNotAddSender) {
            e.push({
                t : AjxEmailAddress.toSoapType[AjxEmailAddress.SENDER],
                p : appCtxt.get(ZmSetting.DISPLAY_NAME) || ""
            });
        }
        // mail is "from" external account
        addrObj = {
            t : AjxEmailAddress.toSoapType[AjxEmailAddress.SENDER],
            a : dataSource.getEmail()
        };
        if (appCtxt.get(ZmSetting.DEFAULT_DISPLAY_NAME)) {
            displayName = dataSource.identity && dataSource.identity.sendFromDisplay;
            displayName = displayName || dataSource.userName || dataSource.getName();
            if(displayName) {
                addrObj.p = displayName;
            }
        }
        e.push(addrObj);
    }
};

/**
 * @private
 */
ZmCalItem.prototype._addExtrasToRequest =
function(request, comp) {
	if (this.priority) {
		comp.priority = this.priority;
	}
    comp.status = this.status;
};

/**
 * @private
 */
ZmCalItem.prototype._addXPropsToRequest =
function(comp) {
	var message = this.message ? this.message : null,
	    invite = (message && message.invite) ? message.invite : null,
        xprops = invite ? invite.getXProp() : null,
        xprop,
        x,
        i;
	if (!xprops) { return; }
    comp.xprop = [];
	// bug 16024: preserve x props
	xprops = (xprops instanceof Array) ? xprops : [xprops];

	for (i = 0; i < xprops.length; i++) {
		xprop = xprops[i],
        x = {};
		if (xprop && xprop.name) {
            x.name = xprop.name;
			if (xprop.value != null) {
                x.value = xprop.value;
			}
			this._addXParamToRequest(x, xprop.xparam);
            comp.xprop.push(x);
		}		
	}
};

/**
 * @private
 */
ZmCalItem.prototype._addXParamToRequest =
function(xprop, xparams) {
	if (!xparams) {
        return;
    }

	xparams = (xparams instanceof Array) ? xparams : [xparams];
    var xparam = xprop.xparam = [],
        xObj = {},
        j,
        x;

	for (j = 0; j < xparams.length; j++) {
		x = xparams[j];
        xObj = {};
		if (x && x.name) {
            xObj.name = x.name;
			if (x.value != null) {
                xObj.value = x.value;
			}
            xparam.push(xObj);
		}
	}
};

/**
 * @private
 */
ZmCalItem.prototype._addDateTimeToRequest =
function(request, comp) {
	// always(?) set all day
    comp.allDay = this.allDayEvent + "";
	// timezone
	var tz,
        clientId,
        s,
        sd,
        e,
        ed;
	if (this.timezone) {
		clientId = AjxTimezone.getClientId(this.timezone);
		ZmTimezone.set(request, clientId, null, true);
		tz = this.timezone;
	}

	// start date
	if (this.startDate) {
        s = comp.s = {};
		if (!this.isAllDayEvent()) {
			sd = AjxDateUtil.getServerDateTime(this.startDate, this.startsInUTC);

			// set timezone if not utc date/time
			if (!this.startsInUTC && tz && tz.length) {
                s.tz = tz;
            }
            s.d = sd;
		}
        else {
            s.d = AjxDateUtil.getServerDate(this.startDate);
		}
	}


    if(this.endTimezone) {
        tz = this.endTimezone;
    }

	// end date
	if (this.endDate) {
        e = comp.e = {};
		if (!this.isAllDayEvent()) {
			ed = AjxDateUtil.getServerDateTime(this.endDate, this.endsInUTC);

			// set timezone if not utc date/time
			if (!this.endsInUTC && tz && tz.length) {
				e.tz = tz;
            }
            e.d = ed;

		} else {
			e.d = AjxDateUtil.getServerDate(this.endDate);
		}
	}
};

/**
 * @private
 */
ZmCalItem.prototype._addAttendeesToRequest =
function(inv, m, notifyList, accountName) {
	// if this appt is on-behalf-of, set the from address to that person
    if (this.isOrganizer() && accountName) {
        m.e.push({
            a : accountName,
            t : AjxEmailAddress.toSoapType[AjxEmailAddress.FROM]
        });
    }
};

/**
 * @private
 */
ZmCalItem.prototype._addNotesToRequest =
function(m, cancel) {

	var hasAttendees = this.hasAttendees(),
        tprefix = hasAttendees ? this._getDefaultBlurb(cancel) : "",
        hprefix = hasAttendees ? this._getDefaultBlurb(cancel, true) : "",
        mp = m.mp = {"mp" : []},
        numSubParts,
        part,
        pct,
        content,
        ntp,
        tcontent,
        hcontent,
        html,
        i;

    mp.ct = ZmMimeTable.MULTI_ALT;
	numSubParts = this.notesTopPart ? this.notesTopPart.children.size() : 0;
	if (numSubParts > 0) {
		for (i = 0; i < numSubParts; i++) {
			part = this.notesTopPart.children.get(i);
            pct = part.getContentType();

			if (pct == ZmMimeTable.TEXT_HTML) {
                var htmlContent = part.getContent();
                htmlContent = AjxStringUtil.defangHtmlContent(htmlContent);
                content = "<html><body id='htmlmode'>" + (this._includeEditReply ? htmlContent : AjxBuffer.concat(hprefix, htmlContent)) + "</body></html>";
			} else {
				content = this._includeEditReply ? part.getContent() : AjxBuffer.concat(tprefix, part.getContent());
			}
            mp.mp.push({
                ct : pct,
                content : content
            });
		}
	} else {
        ntp = this.notesTopPart;
		tcontent = ntp ? ntp.getContent() : "";
        pct = ntp ? ntp.getContentType() : ZmMimeTable.TEXT_PLAIN;
        mp.mp.push({
            ct : pct
        });
        if (pct == ZmMimeTable.TEXT_HTML) {
            //bug fix #9592 - html encode the text before setting it as the "HTML" part
            hcontent = AjxStringUtil.nl2br(AjxStringUtil.htmlEncode(tcontent));
            html = "<html><body>" + (this._includeEditReply ? hcontent : AjxBuffer.concat(hprefix, hcontent)) + "</body></html>";
            mp.mp[0].content = html;
        }
        else {
            mp.mp[0].content = (this._includeEditReply ? tcontent : AjxBuffer.concat(tprefix, tcontent));
        }
	}
};

/**
 * @private
 */
ZmCalItem.prototype._addColorRgbToRequest =
function(comp) {
	comp.color = this.color;
	comp.rgb = this.rgb;
}

/**
 * Gets a string representation of the invite content.
 * 
 * @param       {Boolean}		isHtml	if <code>true</code>, get HTML content
 * @return		{String}		a string representation of the invite
 */
ZmCalItem.prototype.getInviteDescription =
function(isHtml) {
	var hasAttendees = this.hasAttendees();
	var tprefix = hasAttendees ? this.getSummary(false) : "";
	var hprefix = hasAttendees ? this.getSummary(true) : "";

    var notes = this.getNotesPart(isHtml ? ZmMimeTable.TEXT_HTML : ZmMimeTable.TEXT_PLAIN);
    return AjxBuffer.concat(isHtml ? hprefix : tprefix, notes)    
};

/**
 * @private
 */
ZmCalItem.prototype.setIncludeEditReply =
function(includeEditReply) {
	this._includeEditReply = includeEditReply;
};

/**
 * @private
 */
ZmCalItem.prototype._sendRequest =
function(soapDoc, accountName, callback, errorCallback, jsonObj, requestName) {
	var responseName = soapDoc ? soapDoc.getMethod().nodeName.replace("Request", "Response") : requestName.replace("Request", "Response");
	var respCallback = new AjxCallback(this, this._handleResponseSend, [responseName, callback]);
    if (!jsonObj) {
	    appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true, accountName:accountName, callback:respCallback, errorCallback:errorCallback});
    }
    else {
        appCtxt.getAppController().sendRequest({jsonObj:jsonObj, asyncMode:true, accountName:accountName, callback:respCallback, errorCallback:errorCallback});
    }
};

/**
 * @private
 */
ZmCalItem.prototype._loadFromDom =
function(calItemNode, instNode) {
	ZmCalBaseItem.prototype._loadFromDom.call(this, calItemNode, instNode);

	this.isOrg 			= this._getAttr(calItemNode, instNode, "isOrg");
	var org				= calItemNode.or;
	this.organizer		= org && org.a;
	this.sentBy			= org && org.sentBy;
	this.invId 			= this._getAttr(calItemNode, instNode, "invId");
	this.compNum 		= this._getAttr(calItemNode, instNode, "compNum") || "0";
	this.parseAlarmData(this.alarmData);
	this.seriesInvId	= this.recurring ? calItemNode.invId : null;
	this.ridZ 			= instNode && instNode.ridZ;

	if (calItemNode.tn) {
		this._parseTagNames(calItemNode.tn);
	}
	if (calItemNode.f) {
		this._parseFlags(calItemNode.f);
	}
};

// Callbacks

/**
 * @private
 */
ZmCalItem.prototype._handleResponseSend =
function(respName, callback, result) {
	var resp = result.getResponse();

	// branch for different responses
	var response = resp[respName];
	if (response.uid != null) {
		this.uid = response.uid;
	}

    var msgNode;
    //echo=1 sends back echo response node, process it
    if(response.echo){
        msgNode = response.echo;
        if(msgNode.length > 0){
            msgNode = msgNode[0];
        }
    }
    msgNode = msgNode ? msgNode.m : response.m;
	if (msgNode != null) {
        if(msgNode.length > 0){
            msgNode = msgNode[0];
        }
		var oldInvId = this.invId;
		this.invId = msgNode.id;
		if (AjxUtil.isSpecified(oldInvId) && oldInvId != this.invId){
			this.message = null;
        }else if(msgNode){
            this.message = new ZmMailMsg(msgNode.id);
            this.message._loadFromDom(msgNode);
            delete this._validAttachments;
            this._validAttachments = null;
            this.getAttachments();
        }
	}

	this._messageNode = null;

	if (callback) {
		callback.run(response);
	}
};

ZmCalItem.prototype.processErrorSave =
function(ex) {
	// TODO: generalize error message for calItem instead of just Appt
    var status = {
        continueSave: false,
        errorMessage: ""
    };
	if (ex.code == ZmCsfeException.MAIL_SEND_ABORTED_ADDRESS_FAILURE) {
		var invalid = ex.getData(ZmCsfeException.MAIL_SEND_ADDRESS_FAILURE_INVALID);
		var invalidMsg = (invalid && invalid.length)
			? AjxMessageFormat.format(ZmMsg.apptSendErrorInvalidAddresses, AjxStringUtil.htmlEncode(invalid.join(", "))) : null;
		status.errorMessage = ZmMsg.apptSendErrorAbort + "<br/>" + invalidMsg;
	} else if (ex.code == ZmCsfeException.MAIL_SEND_PARTIAL_ADDRESS_FAILURE) {
		var invalid = ex.getData(ZmCsfeException.MAIL_SEND_ADDRESS_FAILURE_INVALID);
		status.errorMessage = (invalid && invalid.length)
			? AjxMessageFormat.format(ZmMsg.apptSendErrorPartial, AjxStringUtil.htmlEncode(invalid.join(", ")))
			: ZmMsg.apptSendErrorAbort;
	} else if(ex.code == ZmCsfeException.MAIL_MESSAGE_TOO_BIG) {
        status.errorMessage = (this.type == ZmItem.TASK) ? ZmMsg.taskSaveErrorToobig : ZmMsg.apptSaveErrorToobig;
    } else if (ex.code == ZmCsfeException.MAIL_INVITE_OUT_OF_DATE) {
        if(!this.isVersionIgnored()){
            this.setIgnoreVersion(true);
            status.continueSave = true;
        }
        else{
            status.errorMessage = ZmMsg.inviteOutOfDate;
            this.setIgnoreVersion(false);
        }
    } else if (ex.code == ZmCsfeException.MAIL_NO_SUCH_CALITEM) {
        status.errorMessage = ex.getErrorMsg([ex.getData("itemId")]);
    } else if (ex.code == ZmCsfeException.MAIL_QUOTA_EXCEEDED) {
    		if(this.type == ZmItem.APPT){
                status.errorMessage=ZmMsg.errorQuotaExceededAppt;
            } else if(this.type == ZmItem.TASK){
                status.errorMessage=ZmMsg.errorQuotaExceededTask;
            }
    }
	else if (ex.code === ZmCsfeException.MUST_BE_ORGANIZER) {
		status.errorMessage = ZmMsg.mustBeOrganizer;
	}

    return status;
};

ZmCalItem.prototype.setProposedTimeCallback =
function(callback) {
    this._proposedTimeCallback = callback;
};

ZmCalItem.prototype.handlePostSaveCallbacks =
function() {
    if(this._proposedTimeCallback) this._proposedTimeCallback.run(this);
    this.setIgnoreVersion(false);
};

// Static methods

ZmCalItem.isPriorityHigh = function(priority) {
	return AjxUtil.arrayContains(ZmCalItem.PRIORITY_HIGH_RANGE, priority);
};
ZmCalItem.isPriorityLow = function(priority) {
	return AjxUtil.arrayContains(ZmCalItem.PRIORITY_LOW_RANGE, priority);
};
ZmCalItem.isPriorityNormal = function(priority) {
	return AjxUtil.arrayContains(ZmCalItem.PRIORITY_NORMAL_RANGE, priority);
};

/**
 * Gets the priority label.
 * 
 * @param	{int}	priority		the priority (see <code>ZmCalItem.PRIORITY_</code> constants)
 * @return	{String}	the priority label
 * 
 */
ZmCalItem.getLabelForPriority =
function(priority) {
	if (ZmCalItem.isPriorityLow(priority)) {
		return ZmMsg.low;
	}
	if (ZmCalItem.isPriorityNormal(priority)) {
		return ZmMsg.normal;
	}
	if (ZmCalItem.isPriorityHigh(priority)) {
		return ZmMsg.high;
	}
	return "";
};

/**
 * Gets the priority image.
 * 
 * @param	{ZmTask}	task	the task
 * @param	{int}	id		the id
 * @return	{String}	the priority image
 */
ZmCalItem.getImageForPriority =
function(task, id) {
	if (ZmCalItem.isPriorityLow(task.priority)) {
			return id
				? AjxImg.getImageHtml("PriorityLow_list", null, ["id='", id, "'"].join(""))
				: AjxImg.getImageHtml("PriorityLow_list");
	} else if (ZmCalItem.isPriorityHigh(task.priority)) {
			return id
				? AjxImg.getImageHtml("PriorityHigh_list", null, ["id='", id, "'"].join(""))
				: AjxImg.getImageHtml("PriorityHigh_list");
	}
	return "";
};

/**
 * Gets the status label.
 * 
 * @param	{int}	status		the status (see <code>ZmCalendarApp.STATUS_</code> constants)
 * @return	{String}	the status label
 * 
 * @see	ZmCalendarApp
 */
ZmCalItem.getLabelForStatus =
function(status) {
	switch (status) {
		case ZmCalendarApp.STATUS_CANC: return ZmMsg.cancelled;
		case ZmCalendarApp.STATUS_COMP: return ZmMsg.completed;
		case ZmCalendarApp.STATUS_DEFR: return ZmMsg.deferred;
		case ZmCalendarApp.STATUS_INPR: return ZmMsg.inProgress;
		case ZmCalendarApp.STATUS_NEED: return ZmMsg.notStarted;
		case ZmCalendarApp.STATUS_WAIT: return ZmMsg.waitingOn;
	}
	return "";
};

/**
 * Gets the participation status label.
 * 
 * @param	{int}	status		the status (see <code>ZmCalBaseItem.PSTATUS_</code> constants)
 * @return	{String}	the status label
 * 
 * @see	ZmCalBaseItem
 */
ZmCalItem.getLabelForParticipationStatus =
function(status) {
	switch (status) {
		case ZmCalBaseItem.PSTATUS_ACCEPT:		return ZmMsg.ptstAccept;
		case ZmCalBaseItem.PSTATUS_DECLINED:	return ZmMsg.ptstDeclined;
		case ZmCalBaseItem.PSTATUS_DEFERRED:	return ZmMsg.ptstDeferred;
		case ZmCalBaseItem.PSTATUS_DELEGATED:	return ZmMsg.ptstDelegated;
		case ZmCalBaseItem.PSTATUS_NEEDS_ACTION:return ZmMsg.ptstNeedsAction;
		case ZmCalBaseItem.PSTATUS_COMPLETED:	return ZmMsg.completed;
		case ZmCalBaseItem.PSTATUS_TENTATIVE:	return ZmMsg.ptstTentative;
		case ZmCalBaseItem.PSTATUS_WAITING:		return ZmMsg.ptstWaiting;
	}
	return "";
};

/**
 * Gets the participation status icon.
 * 
 * @param	{int}	status		the status (see <code>ZmCalBaseItem.PSTATUS_</code> constants)
 * @return	{String}	the status icon or an empty string if status not set
 * 
 * @see	ZmCalBaseItem
 */
ZmCalItem.getParticipationStatusIcon =
function(status) {
	switch (status) {
		case ZmCalBaseItem.PSTATUS_ACCEPT:		return "Check";
		case ZmCalBaseItem.PSTATUS_DECLINED:	return "Cancel";
		case ZmCalBaseItem.PSTATUS_DEFERRED:	return "QuestionMark";
		case ZmCalBaseItem.PSTATUS_DELEGATED:	return "Plus";
		case ZmCalBaseItem.PSTATUS_NEEDS_ACTION:return "NeedsAction";
		case ZmCalBaseItem.PSTATUS_COMPLETED:	return "Completed";
		case ZmCalBaseItem.PSTATUS_TENTATIVE:	return "QuestionMark";
		case ZmCalBaseItem.PSTATUS_WAITING:		return "Minus";
	}
	return "";
};

/**
 * @private
 */
ZmCalItem._getTTDay =
function(d, format) {
	format = format || AjxDateFormat.SHORT;
	var formatter = AjxDateFormat.getDateInstance();
	return formatter.format(d);
};

/*
 * Returns the status of text part from the message. If the message doesn't contain text body part then we convert html body part to text.
 * This function helps in determining if we use text/plain or last content type to process the notes top part's body.
 *
 * @param	{ZmMailMsg}	message	the message object received for setting notes section
 * @return {Boolean}
 */
ZmCalItem.prototype.isTextPartPresent =
function(message) {
    var textMimePart = message._topPart && message._topPart.children.getArray().filter(function(item) {
        return item.contentType === ZmMimeTable.TEXT_PLAIN;
    });

    var textContent = textMimePart && textMimePart.length && textMimePart[0].getContent();

    if (textContent && textContent.length) {
        // The text part is available, set contenttype to text/plain
        return true;
    }
    else {
        // The text part is missing, set contenttype to text/html
        return false;
    }
};
