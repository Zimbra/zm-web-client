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
ZmCalItem.MODE_NEW					    = 1;
/**
 * Defines the "edit" mode.
 */
ZmCalItem.MODE_EDIT					    = 2;
/**
 * Defines the "edit single instance" mode.
 */
ZmCalItem.MODE_EDIT_SINGLE_INSTANCE	    = 3;
/**
 * Defines the "edit series" mode.
 */
ZmCalItem.MODE_EDIT_SERIES			    = 4;
/**
 * Defines the "delete" mode.
 */
ZmCalItem.MODE_DELETE				    = 5;
/**
 * Defines the "delete instance" mode.
 */
ZmCalItem.MODE_DELETE_INSTANCE		    = 6;
/**
 * Defines the "delete series" mode.
 */
ZmCalItem.MODE_DELETE_SERIES		    = 7;
/**
 * Defines the "new from quick" mode.
 */
ZmCalItem.MODE_NEW_FROM_QUICKADD 	    = 8;
/**
 * Defines the "get" mode.
 */
ZmCalItem.MODE_GET					    = 9;
/**
 * Defines the "forward" mode.
 */
ZmCalItem.MODE_FORWARD				    = 10;
/**
 * Defines the "forward single instance" mode.
 */
ZmCalItem.MODE_FORWARD_SINGLE_INSTANCE	= 11;
/**
 * Defines the "forward series" mode.
 */
ZmCalItem.MODE_FORWARD_SERIES			= 12;
/**
 * Defines the "forward" mode.
 */
ZmCalItem.MODE_FORWARD_INVITE			= 13;
/**
 * Defines the "propose" mode.
 */
ZmCalItem.MODE_PROPOSE_TIME 			= 14;
/**
 * Defines the "last" mode index constant.
 */
ZmCalItem.MODE_LAST					    = 14;

ZmCalItem.FORWARD_MAPPING = {};
ZmCalItem.FORWARD_MAPPING[ZmCalItem.MODE_FORWARD]                   = ZmCalItem.MODE_EDIT;
ZmCalItem.FORWARD_MAPPING[ZmCalItem.MODE_FORWARD_SINGLE_INSTANCE]   = ZmCalItem.MODE_EDIT_SINGLE_INSTANCE;
ZmCalItem.FORWARD_MAPPING[ZmCalItem.MODE_FORWARD_SERIES]            = ZmCalItem.MODE_EDIT_SERIES;
ZmCalItem.FORWARD_MAPPING[ZmCalItem.MODE_FORWARD_INVITE]            = ZmCalItem.MODE_EDIT;

/**
 * Defines the "low" priority.
 */
ZmCalItem.PRIORITY_LOW				= 9;
/**
 * Defines the "normal" priority.
 */
ZmCalItem.PRIORITY_NORMAL			= 5;
/**
 * Defines the "high" priority.
 */
ZmCalItem.PRIORITY_HIGH				= 1;

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
	if (this._origStartDate == null && this.startDate != null) {
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
		if (content == null || content == "") {
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
		return AjxUtil.isString(content) ? content : content.content;
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

	// if dealing w/ a shared cal, check for write access
	var share = folder.link && folder.getMainShare();

	return (!this.isOrganizer() || (share && !share.isWrite()));
};

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
 * @private
 */
ZmCalItem.prototype.parseAlarmData =
function() {
	if (!this.alarmData) { return; }

	for (var i in this.alarmData) {
		var alarm = this.alarmData[i].alarm;
		if (alarm) {
			for (var j in alarm) {
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

	var m, h, d;
	var trigger = (tmp) ? tmp.trigger : null;
	var rel = (trigger && (trigger.length > 0)) ? trigger[0].rel : null;
	m = (rel && (rel.length > 0)) ? rel[0].m : null;
	d = (rel && (rel.length > 0)) ? rel[0].d : null;
	h = (rel && (rel.length > 0)) ? rel[0].h : null;

	this._reminderMinutes = 0;
	if (tmp && (tmp.action == "DISPLAY")) {
		if (m != null) {
			this._reminderMinutes = m;
            this._origReminderUnits = ZmCalItem.REMINDER_UNIT_MINUTES;
		}
		if (h != null) {
			h = parseInt(h);
			this._reminderMinutes = h*60;
            this._origReminderUnits = ZmCalItem.REMINDER_UNIT_HOURS;
		}
		if (d != null) {
			d = parseInt(d);
			this._reminderMinutes = d*24*60;
            this._origReminderUnits = ZmCalItem.REMINDER_UNIT_DAYS;
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
		for (var i = 0 ; i < split.length; i++)
			this.attachments[i] = { id:split[i] };
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
				if (this.message.isRealAttachment(attachs[i]))
					this._validAttachments.push(attachs[i]);
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
		var id = seriesMode ? (this.seriesInvId || this.invId) : this.invId;
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
        if (start) this.setStartDate(AjxDateUtil.parseServerDateTime(start));
        if (end) this.setEndDate(AjxDateUtil.parseServerDateTime(end));

        // record whether the start/end dates are in UTC
        this.startsInUTC = start ? start.charAt(start.length-1) == "Z" : null;
        this.endsInUTC = end && start ? end.charAt(start.length-1) == "Z" : null;

        //set all the fields that are not generated in GetAppointmentResponse - accept proposal mode
        this.status = invite.components[0].status;


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
		var soapDoc = AjxSoapDoc.create(this._getSoapForMode(ZmCalItem.MODE_GET), "urn:zimbraMail");
		soapDoc.setMethodAttribute("id", this.id);

		var respCallback = new AjxCallback(this, this._handleErrorGetDetails2, [mode, callback, errorCallback]);
		var params = {
			soapDoc: soapDoc,
			asyncMode: true,
			callback: respCallback,
			errorCallback: errorCallback
		};
		appCtxt.getAppController().sendRequest(params);
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
		this.sentBy = message.invite.getSentBy();
		this.name = message.invite.getName() || message.subject;
		this.isException = message.invite.isException();
        this.recurring =  message.invite.isRecurring();
        this.location = message.invite.getLocation();
		this._setTimeFromMessage(message, viewMode);
		this._setExtrasFromMessage(message);
		this._setRecurrence(message);
	}
	this._setNotes(message);
	this.getAttachments();

	this._currentlyLoaded = message;
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
	// if instance of recurring appointment, start date is generated from unique
	// start time sent in appointment summaries. Associated message will contain
	// only the original start time.
	var start = message.invite.getServerStartTime();
	var end = message.invite.getServerEndTime();
	if (viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE || viewMode == ZmCalItem.MODE_FORWARD_SINGLE_INSTANCE) {
		var usd = this.getUniqueStartDate();
		if (usd) this.setStartDate(usd);

		var ued = this.getUniqueEndDate();
		if (ued) this.setEndDate(ued);
	} else {
		if (start) this.setStartDate(AjxDateUtil.parseServerDateTime(start));
		if (end) this.setEndDate(AjxDateUtil.parseServerDateTime(end));
	}

	// record whether the start/end dates are in UTC
	this.startsInUTC = start ? start.charAt(start.length-1) == "Z" : null;
	this.endsInUTC = end && start ? end.charAt(start.length-1) == "Z" : null;

	// record timezone
	if (viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE || viewMode == ZmCalItem.MODE_DELETE_INSTANCE || viewMode == ZmCalItem.MODE_FORWARD_SINGLE_INSTANCE) {
		this.setTimezone(AjxTimezone.getServerId(AjxTimezone.DEFAULT));
	}
	else {
		var serverId = !this.startsInUTC && message.invite.getServerStartTimeTz();
		this.setTimezone(serverId || AjxTimezone.getServerId(AjxTimezone.DEFAULT));
	}

	var tzrule = AjxTimezone.getRule(AjxTimezone.getClientId(this.getTimezone()));
	if (tzrule) {
		if (tzrule.aliasId) {
			tzrule = AjxTimezone.getRule(tzrule.aliasId) || tzrule;
		}
		this.setTimezone(tzrule.serverId);
	}
};

/**
 * @private
 */
ZmCalItem.prototype._setExtrasFromMessage =
function(message) {
	// override
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
	var text = message.getBodyPart(ZmMimeTable.TEXT_PLAIN);
	var html = message.getBodyPart(ZmMimeTable.TEXT_HTML);

	this.notesTopPart = new ZmMimePart();
	var htmlContent = "";
	var textContent = "";

	if (html) {
		var notes = AjxUtil.isString(html) ? html : html.content;
		var htmlContent = notes.replace(/<title\s*>.*\/title>/ig,"");
		if (!this._includeEditReply) {
			htmlContent = this._trimNotesSummary(htmlContent, true);
		}
	}

	if (html && htmlContent) {
		// create a temp iframe to create a proper DOM tree
		var params = {parent:appCtxt.getShell(), hidden:true, html:htmlContent};
		var dwtIframe = new DwtIframe(params);
		if (dwtIframe) {
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
        textContent = (text && text.content) || "";
		if (!this._includeEditReply) {
			textContent = this._trimNotesSummary(textContent);
		}

		this.notesTopPart.setContentType(ZmMimeTable.TEXT_PLAIN);
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
 * Sets the exception details to soap
 *
 * @param	{Element}	comp	soap element
 */
ZmCalItem.prototype.addExceptionDetails =
function(soapDoc, comp) {
    var exceptId = soapDoc.set("exceptId", null, comp);
    // bug 13529: exception id based on original appt, not new data
    var allDay = this._orig ? this._orig.allDayEvent : this.allDayEvent;
    if (allDay != "1") {
        var sd = AjxDateUtil.getServerDateTime(this.getOrigStartDate(), this.startsInUTC);
        // bug fix #4697 (part 2)
        var timezone = this.getOrigTimezone();
        if (!this.startsInUTC && timezone) {
            exceptId.setAttribute("tz", timezone);
        }
        exceptId.setAttribute("d", sd);
    } else {
        var sd = AjxDateUtil.getServerDate(this.getOrigStartDate());
        exceptId.setAttribute("d", sd);
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
	var needsExceptionId = false;
	var soapDoc = AjxSoapDoc.create(this._getSoapForMode(this.viewMode, this.isException), "urn:zimbraMail");

	if (this.viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE &&
		!this.isException)
	{
		this._addInviteAndCompNum(soapDoc);
		needsExceptionId = true;
	}
	else if (this.viewMode == ZmCalItem.MODE_EDIT ||
			 this.viewMode == ZmCalItem.MODE_EDIT_SERIES)
	{
		this._addInviteAndCompNum(soapDoc);
		needsExceptionId = this.isException;
	}

	var accountName = this.getRemoteFolderOwner();
	var invAndMsg = this._setSimpleSoapAttributes(soapDoc, attachmentId, notifyList, accountName);

	var comp = invAndMsg.inv.getElementsByTagName("comp")[0];
	if (needsExceptionId) {
        this.addExceptionDetails(soapDoc, comp);
	} else {
		// set recurrence rules for appointment (but not for exceptions!)
		this._recurrence.setSoap(soapDoc, comp);
	}

	//set alarm data
	this._setAlarmData(soapDoc, comp);

	this._sendRequest(soapDoc, accountName, callback, errorCallback);
};

/**
 * @private
 */
ZmCalItem.prototype._setAlarmData = 
function(soapDoc, comp) {
	if (this._reminderMinutes == 0 || this._reminderMinutes == null) {
		return;
	}

	var alarm = soapDoc.set("alarm", null, comp);
	alarm.setAttribute("action", "DISPLAY");

	var trigger = soapDoc.set("trigger", null, alarm);

	var rel = soapDoc.set("rel", null, trigger);

    this._setReminderUnits(rel);

	this._addXPropsToAlarm(soapDoc, alarm);
};

/**
 * @private
 */
ZmCalItem.prototype._setReminderUnits =
function(rel) {
    rel.setAttribute("m", this._reminderMinutes ? this._reminderMinutes:0);
    //default option is to remind before appt start
    rel.setAttribute("related", "START");
    rel.setAttribute("neg", "1");
};

/**
 * @private
 */
ZmCalItem.prototype._addXPropsToAlarm =
function(soapDoc, alarmNode) {
	if (!this.alarmData) { return; }
	var alarmData = (this.alarmData && this.alarmData.length > 0)? this.alarmData[0] : null;
	var alarm = alarmData ? alarmData.alarm : null;
	var alarmInst = (alarm && alarm.length > 0) ? alarm[0] : null;
	this._setAlarmXProps(alarmInst, soapDoc, alarmNode);
};

/**
 * @private
 */
ZmCalItem.prototype._setAlarmXProps =
function(alarmInst, soapDoc, alarmNode)  {
   var xprops = (alarmInst && alarmInst.xprop) ? alarmInst.xprop : null;
   if (!xprops) { return; }
	// bug 28924: preserve x props
	xprops = (xprops instanceof Array) ? xprops : [xprops];

	for (var i in xprops) {
		var xprop = xprops[i];
		if (xprop && xprop.name) {
			var x = soapDoc.set("xprop", null, alarmNode);
			x.setAttribute("name", xprop.name);
			if (xprop.value != null) {
				x.setAttribute("value", xprop.value);
			}
			this._addXParamToSoap(soapDoc, x, xprop.xparam);
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
function(reminderValue, reminderUnits) {
    if(!reminderValue) {
        this._reminderMinutes = 0;
        return;
    }
    reminderValue = parseInt(reminderValue + "");
	this._reminderMinutes = ZmCalendarApp.convertReminderUnits(reminderValue, reminderUnits);
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
		var childParts = msg._topPart.node.ct == ZmMimeTable.MULTI_ALT
			? msg._topPart.children.getArray()
			: [msg._topPart];
		for (var i = 0; i < childParts.length; i++) {
			bodyParts.push(childParts[i].node);
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

/**
 * @private
 */
ZmCalItem.prototype._doCancel =
function(mode, callback, msg, batchCmd, result) {

    if(mode == ZmCalItem.MODE_DELETE_SERIES && this._cancelFutureInstances) {

        var recurrence = this._recurrence;
        var untilDate = new Date(this.getOrigStartDate().getTime());
        untilDate.setTime(untilDate.getTime() - AjxDateUtil.MSEC_PER_DAY);
        recurrence.repeatEndDate = untilDate;
        recurrence.repeatEndType = "D";

        this.viewMode = ZmCalItem.MODE_EDIT_SERIES;
        this.save(null, callback);
        return;
    }

	if (mode == ZmCalItem.MODE_DELETE ||
		mode == ZmCalItem.MODE_DELETE_SERIES ||
		mode == ZmCalItem.MODE_DELETE_INSTANCE)
	{
		var soapDoc = AjxSoapDoc.create(this._getSoapForMode(mode), "urn:zimbraMail");
		var accountName = this.getRemoteFolderOwner();
		this._addInviteAndCompNum(soapDoc);

		// Exceptions should be treated as instances (bug 15817)
		if (mode == ZmCalItem.MODE_DELETE_INSTANCE || this.isException) {
			soapDoc.setMethodAttribute("s", this.getOrigStartTime());
			var inst = soapDoc.set("inst");
			var allDay = this.isAllDayEvent();
			var format = allDay ? AjxDateUtil.getServerDate : AjxDateUtil.getServerDateTime;
			inst.setAttribute("d", format(this.getOrigStartDate()));
			if (!allDay && this.timezone) {
				inst.setAttribute("tz", this.timezone);

				var clientId = AjxTimezone.getClientId(this.timezone);
				ZmTimezone.set(soapDoc, clientId, null, true);
			}
		}

		var m = soapDoc.set("m");
		if (this.isOrganizer()) {
			// NOTE: We only use the explicit list of addresses if sending via
			//       a message compose.
			if (msg) {
				for (var i = 0; i < ZmMailMsg.ADDRS.length; i++) {
					var type = ZmMailMsg.ADDRS[i];

					// if on-behalf-of, dont set the from address
					if (accountName && type == AjxEmailAddress.FROM) { continue; }

					var vector = msg.getAddresses(type);
					var count = vector.size();
					for (var j = 0; j < count; j++) {
						var addr = vector.get(j);
						var e = soapDoc.set("e", null, m);
						e.setAttribute("a", addr.getAddress());
						e.setAttribute("t", AjxEmailAddress.toSoapType[type]);
					}
				}

				// set from address to on-behalf-of if applicable
				if (accountName) {
					var e = soapDoc.set("e", null, m);
					e.setAttribute("a", accountName);
					e.setAttribute("t", AjxEmailAddress.toSoapType[AjxEmailAddress.FROM]);
				}
			}
			else {
				this._addAttendeesToSoap(soapDoc, null, m, null, accountName);
			}
		}
        var subject = (msg && msg.subject) ? msg.subject : ([ZmMsg.cancelled, ": ", this.name].join(""));
		soapDoc.set("su", subject, m);
		this._addNotesToSoap(soapDoc, m, true);

		if (batchCmd) {
			batchCmd.addRequestParams(soapDoc, callback);
		} else {
			this._sendRequest(soapDoc, accountName, callback);
		}
	} else {
		if (callback) callback.run();
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

/**
 * Gets the attach list as HTML.
 * 
 * @param {Object}		attach		a generic Object contain meta info about the attachment
 * @param {Boolean}		hasCheckbox		<code>true</code> to insert a checkbox prior to the attachment
 * @return	{String}	the HTML
 */
ZmCalItem.prototype.getAttachListHtml =
function(attach, hasCheckbox) {
	var msgFetchUrl = appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI);

	// gather meta data for this attachment
	var mimeInfo = ZmMimeTable.getInfo(attach.ct);
	var icon = mimeInfo ? mimeInfo.image : "GenericDoc";
	var size = attach.s;
	var sizeText;
	if (size != null) {
		if (size < 1024)		sizeText = size + " B";
		else if (size < 1024^2)	sizeText = Math.round((size/1024) * 10) / 10 + " KB";
		else 					sizeText = Math.round((size / (1024*1024)) * 10) / 10 + " MB";
	}

	var html = [];
	var i = 0;

	// start building html for this attachment
	html[i++] = "<table border=0 cellpadding=0 cellspacing=0><tr>";
	if (hasCheckbox) {
		html[i++] = "<td width=1%><input type='checkbox' checked value='";
		html[i++] = attach.part;
		html[i++] = "' name='";
		html[i++] = ZmCalItem.ATTACHMENT_CHECKBOX_NAME;
		html[i++] = "'></td>";
	}

	var hrefRoot = ["href='", msgFetchUrl, "&id=", this.invId, "&amp;part="].join("");
	html[i++] = "<td width=20><a target='_blank' class='AttLink' ";
	html[i++] = hrefRoot;
	html[i++] = attach.part;
	html[i++] = "'>";
	html[i++] = AjxImg.getImageHtml(icon);
	html[i++] = "</a></td><td><a target='_blank' class='AttLink' ";
	if (appCtxt.get(ZmSetting.MAIL_ENABLED) && attach.ct == ZmMimeTable.MSG_RFC822) {
		html[i++] = " href='javascript:;' onclick='ZmCalItemView.rfc822Callback(";
		html[i++] = '"';
		html[i++] = this.invId;
		html[i++] = '"';
		html[i++] = ",\"";
		html[i++] = attach.part;
		html[i++] = "\"); return false;'";
	} else {
		html[i++] = hrefRoot;
		html[i++] = attach.part;
		html[i++] = "'";
	}
	html[i++] = ">";
	html[i++] = attach.filename;
	html[i++] = "</a>";

	var addHtmlLink = (appCtxt.get(ZmSetting.VIEW_ATTACHMENT_AS_HTML) &&
					   attach.body == null && ZmMimeTable.hasHtmlVersion(attach.ct));

	if (sizeText || addHtmlLink) {
		html[i++] = "&nbsp;(";
		if (sizeText) {
			html[i++] = sizeText;
			html[i++] = ") ";
		}
		if (addHtmlLink) {
			html[i++] = "<a style='text-decoration:underline' target='_blank' class='AttLink' ";
			html[i++] = hrefRoot;
			html[i++] = attach.part;
			html[i++] = "&view=html'>";
			html[i++] = ZmMsg.preview;
			html[i++] = "</a>&nbsp;";
		}
		if (attach.ct != ZmMimeTable.MSG_RFC822) {
			html[i++] = "<a style='text-decoration:underline' class='AttLink' onclick='ZmZimbraMail.unloadHackCallback();' ";
			html[i++] = hrefRoot;
			html[i++] = attach.part;
			html[i++] = "&disp=a'>";
			html[i++] = ZmMsg.download;
			html[i++] = "</a>";
		}
	}

	html[i++] = "</td></tr></table>";

	return html.join("");
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
			var junk = isHtml ? "</div><br>" : "\n\n";
			if (notes.indexOf(junk) == 0) {
				notes = notes.replace(junk, "");
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
function(soapDoc) {
	if (this.viewMode == ZmCalItem.MODE_EDIT_SERIES || this.viewMode == ZmCalItem.MODE_DELETE_SERIES) {
		if (this.recurring && this.seriesInvId != null) {
			soapDoc.setMethodAttribute("id", this.seriesInvId);
			soapDoc.setMethodAttribute("comp", this.getCompNum());
		}
	} else {
		if (this.invId != null && this.invId != -1) {
			var id =  this.invId;

			// bug: 41530 - for offline, make sure id is fully qualified if moving across accounts
			if (appCtxt.multiAccounts &&
				this._orig &&
				this._orig.getFolder().getAccount() != this.getFolder().getAccount())
			{
				id = ZmOrganizer.getSystemId(this.invId, this._orig.getFolder().getAccount(), true);
			}

			soapDoc.setMethodAttribute("id", id);
			soapDoc.setMethodAttribute("comp", this.getCompNum());
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
		if (this.viewMode == ZmCalItem.MODE_EDIT ||
			this.viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE ||
			this.viewMode == ZmCalItem.MODE_EDIT_SERIES)
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
ZmCalItem.prototype._getSoapForMode =
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
ZmCalItem.prototype._setSimpleSoapAttributes =
function(soapDoc, attachmentId, notifyList, accountName) {

	var m = this._messageNode = soapDoc.set('m');

	var calendar = this.getFolder();
	var acct = calendar.getAccount();
    var isOnBehalfOf = accountName && acct && acct.name != accountName;
	m.setAttribute("l", (isOnBehalfOf ? this.getFolder().rid : this.folderId));

	var inv = soapDoc.set("inv", null, m);
	if (this.uid != null && this.uid != -1) {
		inv.setAttribute("uid", this.uid);
	}

	var comp = soapDoc.set("comp", null, inv);

	// attendees
	this._addAttendeesToSoap(soapDoc, comp, m, notifyList, accountName);

    var identity = this.identity;
    var isPrimary = identity == null || identity.isDefault;
    var isRemote = calendar.isRemote();    

    //FROM Address
	var mailFromAddress = this.getMailFromAddress();
	if (this.isOrganizer() && !accountName && (mailFromAddress || isRemote || !isPrimary)) {
        var e = soapDoc.set("e", null, m);
        var addr, displayName;
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
        e.setAttribute("a", addr);
        e.setAttribute("t", AjxEmailAddress.toSoapType[AjxEmailAddress.FROM]);
        if(!displayName && addr == appCtxt.get(ZmSetting.USERNAME)){
             displayName = appCtxt.get(ZmSetting.DISPLAY_NAME);
        }
        if(displayName){
             e.setAttribute("p", displayName);
        }        
	}

    //SENDER Address
    if(isRemote){
        var e = soapDoc.set("e", null, m);
        var addr, displayName;
        identity = identity || appCtxt.getIdentityCollection().defaultIdentity;
        if(identity){
            addr = identity.sendFromAddress;
            displayName = identity.sendFromDisplay;
        }else{
            addr = appCtxt.get(ZmSetting.USERNAME);
            displayName = appCtxt.get(ZmSetting.DISPLAY_NAME);
        }
		e.setAttribute("a", addr);
		e.setAttribute("t", AjxEmailAddress.toSoapType[AjxEmailAddress.SENDER]);
        if (displayName) {
            e.setAttribute("p", displayName);
        }
    }

	this._addExtrasToSoap(soapDoc, inv, comp);
	this._addDateTimeToSoap(soapDoc, inv, comp);
	this._addXPropsToSoap(soapDoc, inv, comp);
	
	// subject/location
	soapDoc.set("su", this.name, m);
	comp.setAttribute("name", this.name);
	this._addLocationToSoap(comp);

	// notes
	this._addNotesToSoap(soapDoc, m);

	// set organizer - but not for local account
	if (!(appCtxt.isOffline && acct.isMain)) {
		var me = (appCtxt.multiAccounts) ? acct.getEmail() : appCtxt.get(ZmSetting.USERNAME);
        var user, displayName, identityUser;
        identity = identity || appCtxt.getIdentityCollection().defaultIdentity;
        if(identity){ //If !Identity then consider the default identity
            identityUser = identity.sendFromAddress;
            displayName = identity.sendFromDisplay;
        }
		user = mailFromAddress || identityUser || me;
		var organizer = this.organizer || user;
		var org = soapDoc.set("or", null, comp);
		org.setAttribute("a", organizer);        
		if (isRemote) {
			org.setAttribute("sentBy", user); // if on-behalf of, set sentBy
		}
        var orgName = (organizer == identityUser) ? displayName : (ZmApptViewHelper.getAddressEmail(organizer)).getName();
		if (orgName)
            org.setAttribute("d", orgName);
	}

	// handle attachments
	this.flagLocal(ZmItem.FLAG_ATTACH, false);
	this.getAttachments(); // bug 22874: make sure to populate _validAttachments
	if (attachmentId != null ||
		(this._validAttachments != null && this._validAttachments.length))
	{
		var attachNode = soapDoc.set("attach", null, m);
		if (attachmentId){
			attachNode.setAttribute("aid", attachmentId);
			this.flagLocal(ZmItem.FLAG_ATTACH, true);
		}

		if (this._validAttachments) {
			var validAttLen = this._validAttachments.length;
			for (var i = 0; i < validAttLen; i++) {
				var msgPartNode = soapDoc.set("mp", null, attachNode);
				var mid = (this.invId || this.message.id);
				if ((mid.indexOf(":") < 0) && calendar.isRemote()) {
					mid = (appCtxt.getActiveAccount().id + ":" + mid);
				}
				msgPartNode.setAttribute("mid", mid);
				msgPartNode.setAttribute("part", this._validAttachments[i].part);
			}
			if (validAttLen > 0) {
				this.flagLocal(ZmItem.FLAG_ATTACH, true);
			}
		}
	}

	return {'inv': inv, 'm': m};
};

/**
 * @private
 */
ZmCalItem.prototype._addExtrasToSoap =
function(soapDoc, inv, comp) {
	if (this.priority) {
		comp.setAttribute("priority", this.priority);
	}
	comp.setAttribute("status", this.status);
};

/**
 * @private
 */
ZmCalItem.prototype._addXPropsToSoap =
function(soapDoc, inv, comp) {
	var message = this.message ? this.message : null;
	var invite = (message && message.invite) ? message.invite : null;
	var xprops = invite ? invite.getXProp() : null;
	if (!xprops) { return; }

	// bug 16024: preserve x props
	xprops = (xprops instanceof Array) ? xprops : [xprops];

	for (var i in xprops) {
		var xprop = xprops[i];
		if (xprop && xprop.name) {
			var x = soapDoc.set("xprop", null, comp);
			x.setAttribute("name", xprop.name);
			if (xprop.value != null) {
				x.setAttribute("value", xprop.value);
			}
			this._addXParamToSoap(soapDoc, x, xprop.xparam);
		}		
	}
};

/**
 * @private
 */
ZmCalItem.prototype._addXParamToSoap = 
function(soapDoc, xprop, xparams) {
	if (!xparams) { return; }

	xparams = (xparams instanceof Array) ? xparams : [xparams];

	for (var j in xparams) {
		var xparam = xparams[j];
		if (xparam && xparam.name) {
			var x = soapDoc.set("xparam", null, xprop);
			x.setAttribute("name", xparam.name);
			if (xparam.value != null) {
				x.setAttribute("value", xparam.value);
			}
		}
	}
};

/**
 * @private
 */
ZmCalItem.prototype._addDateTimeToSoap =
function(soapDoc, inv, comp) {
	// always(?) set all day
	comp.setAttribute("allDay", this.allDayEvent);

	// timezone
	var tz;
	if (this.timezone) {
		var clientId = AjxTimezone.getClientId(this.timezone);
		ZmTimezone.set(soapDoc, clientId, inv, true);
		tz = this.timezone;
	}

	// start date
	if (this.startDate) {
		var s = soapDoc.set("s", null, comp);
		if (!this.isAllDayEvent()) {
			var sd = AjxDateUtil.getServerDateTime(this.startDate, this.startsInUTC);

			// set timezone if not utc date/time
			if (!this.startsInUTC && tz && tz.length)
				s.setAttribute("tz", tz);

			s.setAttribute("d", sd);
		} else {
			s.setAttribute("d", AjxDateUtil.getServerDate(this.startDate));
		}
	}

	// end date
	if (this.endDate) {
		var e = soapDoc.set("e", null, comp);
		if (!this.isAllDayEvent()) {
			var ed = AjxDateUtil.getServerDateTime(this.endDate, this.endsInUTC);

			// set timezone if not utc date/time
			if (!this.endsInUTC && tz && tz.length)
				e.setAttribute("tz", tz);

			e.setAttribute("d", ed);

		} else {
			e.setAttribute("d", AjxDateUtil.getServerDate(this.endDate));
		}
	}
};

/**
 * @private
 */
ZmCalItem.prototype._addAttendeesToSoap =
function(soapDoc, inv, m, notifyList, accountName) {
	// if this appt is on-behalf-of, set the from address to that person
    if (this.isOrganizer() && accountName) {
        e = soapDoc.set("e", null, m);
        e.setAttribute("a", accountName);
        e.setAttribute("t", AjxEmailAddress.toSoapType[AjxEmailAddress.FROM]);
    }
};

/**
 * @private
 */
ZmCalItem.prototype._addNotesToSoap =
function(soapDoc, m, cancel) {

	var hasAttendees = this.hasAttendees();
	var tprefix = hasAttendees ? this._getDefaultBlurb(cancel) : "";
	var hprefix = hasAttendees ? this._getDefaultBlurb(cancel, true) : "";

	var mp = soapDoc.set("mp", null, m);
	mp.setAttribute("ct", ZmMimeTable.MULTI_ALT);
	var numSubParts = this.notesTopPart ? this.notesTopPart.children.size() : 0;
	if (numSubParts > 0) {
		for (var i = 0; i < numSubParts; i++) {
			var part = this.notesTopPart.children.get(i);
			var partNode = soapDoc.set("mp", null, mp);
			var pct = part.getContentType();
			partNode.setAttribute("ct", pct);

			var content;
			if (pct == ZmMimeTable.TEXT_HTML) {
				content = "<html><body>" + (this._includeEditReply ? part.getContent() : AjxBuffer.concat(hprefix, part.getContent())) + "</body></html>";
			} else {
				content = this._includeEditReply ? part.getContent() : AjxBuffer.concat(tprefix, part.getContent());
			}
			soapDoc.set("content", content, partNode);
		}
	} else {
		var tcontent = this.notesTopPart ? this.notesTopPart.getContent() : "";
		var textPart = soapDoc.set("mp", null, mp);
		textPart.setAttribute("ct", ZmMimeTable.TEXT_PLAIN);
		soapDoc.set("content", (this._includeEditReply ? tcontent : AjxBuffer.concat(tprefix, tcontent)), textPart);

		//bug fix #9592 - html encode the text before setting it as the "HTML" part
		var hcontent = AjxStringUtil.nl2br(AjxStringUtil.htmlEncode(tcontent));
		var htmlPart = soapDoc.set("mp", null, mp);
	    htmlPart.setAttribute("ct", ZmMimeTable.TEXT_HTML);
		var html = "<html><body>" + (this._includeEditReply ? hcontent : AjxBuffer.concat(hprefix, hcontent)) + "</body></html>";
		soapDoc.set("content", html, htmlPart);
	}
};


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
function(soapDoc, accountName, callback, errorCallback) {
	var responseName = soapDoc.getMethod().nodeName.replace("Request", "Response");
	var respCallback = new AjxCallback(this, this._handleResponseSend, [responseName, callback]);
	appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true, accountName:accountName, callback:respCallback, errorCallback:errorCallback});
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

	if (calItemNode.t) {
		this._parseTags(calItemNode.t);
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

	if (response.m != null) {
		var oldInvId = this.invId;
		this.invId = response.m.id;
		if (oldInvId != this.invId)
			this.message = null;
	}

	this._messageNode = null;

	if (callback) {
		callback.run(response);
	}
};


// Static methods

/**
 * Gets the priority label.
 * 
 * @param	{int}	priority		the priority (see <code>ZmCalItem.PRIORITY_</code> constants)
 * @return	{String}	the priority label
 * 
 */
ZmCalItem.getLabelForPriority =
function(priority) {
	switch (priority) {
		case ZmCalItem.PRIORITY_LOW:	return ZmMsg.low;
		case ZmCalItem.PRIORITY_NORMAL: return ZmMsg.normal;
		case ZmCalItem.PRIORITY_HIGH:	return ZmMsg.high;
		default: return "";
	}
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
	switch (task.priority) {
		case ZmCalItem.PRIORITY_LOW:
			return id
				? AjxImg.getImageHtml("TaskLow", null, ["id='", id, "'"].join(""))
				: AjxImg.getImageHtml("TaskLow");
		case ZmCalItem.PRIORITY_HIGH:
			return id
				? AjxImg.getImageHtml("TaskHigh", null, ["id='", id, "'"].join(""))
				: AjxImg.getImageHtml("TaskHigh");
		default: return "";
	}
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
