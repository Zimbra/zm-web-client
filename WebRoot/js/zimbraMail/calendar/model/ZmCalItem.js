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
ZmCalItem = function(type, list, id, folderId) {

	if (arguments.length == 0) { return; }

	ZmItem.call(this, type, id, list);

	this.id = id || -1;
	this.uid = -1; // iCal uid of appt

	this.folderId = folderId || this._getDefaultFolderId();
	this.fragment = "";
	this.name = "";
	this.notesTopPart = null; // ZmMimePart containing children w/ message parts
	this.attachments = null;

	this.allDayEvent = "0";
	this.startDate = null;
	this.endDate = null;
	this.timezone = AjxTimezone.getServerId(AjxTimezone.DEFAULT);

	this.alarm = false;
	this.isException = false;
	this.recurring = false;
	this.priority = null;
	this.ptst = null; // participant status
	this.status = ZmCalendarApp.STATUS_CONF;
	this.viewMode = ZmCalItem.MODE_NEW;

	this._recurrence = new ZmRecurrence(this);
	this._noBusyOverlay = null;
};

ZmCalItem.prototype = new ZmItem;
ZmCalItem.prototype.constructor = ZmCalItem;

// Consts

ZmCalItem.MODE_NEW					= 1;
ZmCalItem.MODE_EDIT					= 2;
ZmCalItem.MODE_EDIT_SINGLE_INSTANCE	= 3;
ZmCalItem.MODE_EDIT_SERIES			= 4;
ZmCalItem.MODE_DELETE				= 5;
ZmCalItem.MODE_DELETE_INSTANCE		= 6;
ZmCalItem.MODE_DELETE_SERIES		= 7;
ZmCalItem.MODE_NEW_FROM_QUICKADD 	= 8;
ZmCalItem.MODE_GET					= 9;
ZmCalItem.MODE_LAST					= 9;

ZmCalItem.PRIORITY_LOW				= 9;
ZmCalItem.PRIORITY_NORMAL			= 5;
ZmCalItem.PRIORITY_HIGH				= 1;

ZmCalItem.PSTATUS_ACCEPT			= "AC";			// vevent, vtodo
ZmCalItem.PSTATUS_DECLINED			= "DE";			// vevent, vtodo
ZmCalItem.PSTATUS_DEFERRED			= "DF";			// vtodo					[outlook]
ZmCalItem.PSTATUS_DELEGATED			= "DG";			// vevent, vtodo
ZmCalItem.PSTATUS_NEEDS_ACTION		= "NE";			// vevent, vtodo
ZmCalItem.PSTATUS_COMPLETED			= "CO";			// vtodo
ZmCalItem.PSTATUS_TENTATIVE			= "TE";			// vevent, vtodo
ZmCalItem.PSTATUS_WAITING			= "WA";			// vtodo					[outlook]

ZmCalItem.ROLE_CHAIR				= "CHA";
ZmCalItem.ROLE_REQUIRED				= "REQ";
ZmCalItem.ROLE_OPTIONAL				= "OPT";
ZmCalItem.ROLE_NON_PARTICIPANT		= "NON";

ZmCalItem.PERSON					= 1;
ZmCalItem.LOCATION					= 2;
ZmCalItem.EQUIPMENT					= 3;

ZmCalItem.SERVER_WEEK_DAYS			= ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

ZmCalItem.ATTACHMENT_CHECKBOX_NAME	= Dwt.getNextId();

ZmCalItem.FBA_TO_PTST = {
	B: ZmCalItem.PSTATUS_ACCEPT,
	F: ZmCalItem.PSTATUS_DECLINED,
	T: ZmCalItem.PSTATUS_TENTATIVE
};

ZmCalItem.prototype.toString =
function() {
	return "ZmCalItem";
};


// Getters

ZmCalItem.prototype.getCompNum			= function() { return this.compNum || "0"; }
ZmCalItem.prototype.getDuration 		= function() { return this.getEndTime() - this.getStartTime(); } // duration in ms
ZmCalItem.prototype.getEndTime 			= function() { return this.endDate.getTime(); }; 	// end time in ms
ZmCalItem.prototype.getFolder			= function() { /* override */ };
ZmCalItem.prototype.getLocation			= function() { /* override */ };
ZmCalItem.prototype.getName 			= function() { return this.name || ""; };			// name (aka Subject) of appt
ZmCalItem.prototype.getOrganizer 		= function() { return this.organizer || ""; };
ZmCalItem.prototype.getSentBy           = function() { return this.sentBy || ""; };
ZmCalItem.prototype.getOrigStartDate 	= function() { return this._origStartDate || this.startDate; };
ZmCalItem.prototype.getOrigStartTime 	= function() { return this.getOrigStartDate().getTime(); };
ZmCalItem.prototype.getOrigTimezone     = function() { return this._origTimezone || this.timezone; };
ZmCalItem.prototype.getRecurBlurb		= function() { return this._recurrence.getBlurb(); };
ZmCalItem.prototype.getRecurType		= function() { return this._recurrence.repeatType; };
ZmCalItem.prototype.getStartTime 		= function() { return this.startDate.getTime(); }; 	// start time in ms
ZmCalItem.prototype.getTimezone         = function() { return this.timezone; };
ZmCalItem.prototype.getSummary			= function(isHtml) { /* override */ };
ZmCalItem.prototype.getToolTip			= function(controller) { /* override */ };

ZmCalItem.prototype.isAllDayEvent 		= function() { return this.allDayEvent == "1"; };
ZmCalItem.prototype.isCustomRecurrence 	= function() { return this._recurrence.repeatCustom == "1" || this._recurrence.repeatEndType != "N"; };
ZmCalItem.prototype.isOrganizer 		= function() { return (typeof(this.isOrg) === 'undefined') || (this.isOrg == true); };
ZmCalItem.prototype.isRecurring 		= function() { return (this.recurring || (this._rawRecurrences != null)); };
ZmCalItem.prototype.hasAttachments 		= function() { return this.getAttachments() != null; };
ZmCalItem.prototype.hasAttendees		= function() { return false; } // override if necessary
ZmCalItem.prototype.hasPersonAttendees	= function() { return false; } // override if necessary

// Setters
ZmCalItem.prototype.setAllDayEvent 		= function(isAllDay) 	{ this.allDayEvent = isAllDay ? "1" : "0"; };
ZmCalItem.prototype.setName 			= function(newName) 	{ this.name = newName; };
ZmCalItem.prototype.setOrganizer 		= function(organizer) 	{ this.organizer = organizer != "" ? organizer : null; };
ZmCalItem.prototype.setRecurType		= function(repeatType)	{ this._recurrence.repeatType = repeatType; };
ZmCalItem.prototype.setType 			= function(newType) 	{ this.type = newType; };


ZmCalItem.prototype.setFolderId =
function(folderId) {
	this.folderId = folderId || ZmOrganizer.ID_CALENDAR;
};

// Returns the "local" folder Id even for remote folders. Otherwise, just use
// this.folderId if you dont care.
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

ZmCalItem.prototype.setEndDate =
function(endDate, keepCache) {
	this.endDate = new Date(endDate instanceof Date ? endDate.getTime(): endDate);
	if (!keepCache)
		this._resetCached();
};

ZmCalItem.prototype.setStartDate =
function(startDate, keepCache) {
	if (this._origStartDate == null && this.startDate != null) {
		this._origStartDate = new Date(this.startDate.getTime());
	}
	this.startDate = new Date(startDate instanceof Date ? startDate.getTime() : startDate);
	if (!keepCache)
		this._resetCached();
    if(this.recurring && this._recurrence){                    //Recurrence shuld reflect start date.
        this._recurrence._startDate = this.startDate;        
    }
};

ZmCalItem.prototype.setTimezone = function(timezone, keepCache) {
    if (this._origTimezone == null) {
        this._origTimezone = timezone;
    }
    this.timezone = timezone;
    if (!keepCache)
        this._resetCached();
};

/**
 * This method sets the view mode, and resets any other fields that should not
 * be set for that view mode.
 */
ZmCalItem.prototype.setViewMode =
function(mode) {
	this.viewMode = mode || ZmCalItem.MODE_NEW;

	if (this.viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE)
		this._recurrence.repeatType = "NON";
};

ZmCalItem.prototype.getUniqueId =
function(useStartTime) {
	if (useStartTime) {
		if (!this._startTimeUniqId) this._startTimeUniqId = this.id + "_" + this.getStartTime();
		return this._startTimeUniqId;
	} else {
		if (this._uniqId == null)
			this._uniqId = Dwt.getNextId();
		return (this.id + "_" + this._uniqId);
	}
};

/**
 * Walks the notesParts array looking for the first part that matches given
 * content type - for now, returns the content (but we could just return the whole part?)
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

// returns "owner" of remote/shared calItem folder this calItem belongs to
// (null if folder is not remote/shared)
ZmCalItem.prototype.getRemoteFolderOwner =
function() {
	// bug fix #18855 - dont return the folder owner if this is a folder move
	// from local to remote (server will do the right thing)
	if (this._orig &&
		(this._orig.folderId != this.folderId) &&
		(!this._orig.getFolder().link && this.getFolder().link))
	{
		return null;
	}

	var folder = this.getFolder();
	return folder && folder.link ? folder.owner : null;
};

ZmCalItem.prototype.isReadOnly =
function() {
	var isLinkAndReadOnly = false;
	var folder = this.getFolder();
	// if we're dealing w/ a shared cal, find out if we have any write access
	if (folder.link) {
		var shares = folder.getShares();
		var share = shares ? shares[0] : null;
		isLinkAndReadOnly = share && !share.isWrite();
	}

	return !this.isOrganizer() || isLinkAndReadOnly;
};

ZmCalItem.prototype.resetRepeatWeeklyDays =
function() {
	if (this.startDate)
		this._recurrence.repeatWeeklyDays = [ZmCalItem.SERVER_WEEK_DAYS[this.startDate.getDay()]];
};

ZmCalItem.prototype.resetRepeatMonthlyDayList =
function() {
	if (this.startDate)
		this._recurrence.repeatMonthlyDayList = [this.startDate.getDate()];
};

ZmCalItem.prototype.resetRepeatYearlyMonthsList =
function(mo) {
	this._recurrence.repeatYearlyMonthsList = mo;
};

ZmCalItem.prototype.resetRepeatCustomDayOfWeek =
function() {
	if (this.startDate)
		this._recurrence.repeatCustomDayOfWeek = ZmCalItem.SERVER_WEEK_DAYS[this.startDate.getDay()];
};

ZmCalItem.prototype.isOverlapping =
function(other, checkFolder) {
	if (checkFolder && this.folderId != other.folderId) return false;

	var tst = this.getStartTime();
	var tet = this.getEndTime();
	var ost = other.getStartTime();
	var oet = other.getEndTime();

	return (tst < oet) && (tet > ost);
};

ZmCalItem.prototype.isInRange =
function(startTime, endTime) {
	var tst = this.getStartTime();
	var tet = this.getEndTime();
	return (tst < endTime && tet > startTime);
};

/**
 * return true if the start time of this appt is within range
 */
ZmCalItem.prototype.isStartInRange =
function(startTime, endTime) {
	var tst = this.getStartTime();
	return (tst < endTime && tst >= startTime);
};

/**
 * return true if the end time of this appt is within range
 */
ZmCalItem.prototype.isEndInRange =
function(startTime, endTime) {
	var tet = this.getEndTime();
	return (tet <= endTime && tet > startTime);
};

ZmCalItem.prototype.setDateRange =
function (rangeObject, instance, parentValue, refPath) {
	var s = rangeObject.startDate;
	var e = rangeObject.endDate;
	this.endDate.setTime(rangeObject.endDate.getTime());
	this.startDate.setTime(rangeObject.startDate.getTime());
};

ZmCalItem.prototype.getDateRange =
function(instance, current, refPath) {
	return { startDate:this.startDate, endDate: this.endDate };
};

/**
 * true if startDate and endDate are on different days
 */
ZmCalItem.prototype.isMultiDay =
function() {
	var start = this.startDate;
	var end = this.endDate;
	if (end.getHours() == 0 && end.getMinutes() == 0 && end.getSeconds() == 0) {
		// if end is the beginning of day, then disregard that it
		// technically crossed a day boundary for the purpose of
		// determining if it is a multi-day appt
		end = new Date(end.getTime() - 2 * AjxDateUtil.MSEC_PER_HOUR);
	}
	return (start.getDate() != end.getDate()) ||
		   (start.getMonth() != end.getMonth()) ||
		   (start.getFullYear() != end.getFullYear());
};

/**
 * accepts a comma delimeted string of ids
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

ZmCalItem.prototype.getAttachments =
function() {
	var attachs = this.message ? this.message._attachments : null;
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

ZmCalItem.prototype.getDurationText =
function(emptyAllDay,startOnly) {
	var isAllDay = this.isAllDayEvent();
	var isMultiDay = this.isMultiDay();
	if (isAllDay) {
		if (emptyAllDay) return "";

		var start = this.startDate;
		var end = new Date(this.endDate.getTime() - (isMultiDay ? 2 * AjxDateUtil.MSEC_PER_HOUR : 0));

		var pattern = isMultiDay ? ZmMsg.apptTimeAllDayMulti : ZmMsg.apptTimeAllDay;
		return AjxMessageFormat.format(pattern, [start, end]);
	}

	if (startOnly) {
		return ZmCalItem._getTTHour(this.startDate);
	}

	var pattern = isMultiDay ? ZmMsg.apptTimeInstanceMulti : ZmMsg.apptTimeInstance;
	return AjxMessageFormat.format(pattern, [this.startDate, this.endDate, ""]);
};

ZmCalItem.prototype.getShortStartHour =
function() {
	var formatter = AjxDateFormat.getTimeInstance(AjxDateFormat.SHORT);
	return formatter.format(this.startDate);
};

ZmCalItem.prototype.getUniqueStartDate =
function() {
	if (this._uniqueStartDate == null && this.uniqStartTime) {
		this._uniqueStartDate = new Date(this.uniqStartTime);
	}
	return this._uniqueStartDate;
};

ZmCalItem.prototype.getUniqueEndDate =
function() {
	if (this._uniqueEndDate == null && this.uniqStartTime) {
		this._uniqueEndDate = new Date(this.uniqStartTime + this.getDuration());
	}
	return this._uniqueEndDate;
};

ZmCalItem.prototype.setNoBusyOverlay  =
function(val) {
	this._noBusyOverlay = val;
};

ZmCalItem.prototype.getDetails =
function(viewMode, callback, errorCallback, ignoreOutOfDate) {
	var mode = viewMode || this.viewMode;

	var seriesMode = mode == ZmCalItem.MODE_EDIT_SERIES;
	if (this.message == null) {
		var id = seriesMode ? (this._seriesInvId || this.invId) : this.invId;
		this.message = new ZmMailMsg(id);
		var respCallback = new AjxCallback(this, this._handleResponseGetDetails, [mode, this.message, callback]);
		var respErrorCallback = !ignoreOutOfDate
			? (new AjxCallback(this, this._handleErrorGetDetails, [mode, callback, errorCallback]))
			: errorCallback;
		this.message.load(appCtxt.get(ZmSetting.VIEW_AS_HTML), false, respCallback, respErrorCallback, this._noBusyOverlay);
	} else {
		this.setFromMessage(this.message, mode);
		if (callback)
			callback.run();
	}
};

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

ZmCalItem.prototype._handleErrorGetDetails2 =
function(mode, callback, errorCallback, result) {
	// Update invId and force a message reload
	var invite = this._getInviteFromError(result);
	this.invId = [this.id, invite.id].join("-");
	this.message = null;
	var ignoreOutOfDate = true;
	this.getDetails(mode, callback, errorCallback, ignoreOutOfDate);
};

ZmCalItem.prototype.setFromMessage =
function(message, viewMode) {
	if (message == this._currentlyLoaded)
		return;

	if(message.invite){
		this.isOrg = message.invite.isOrganizer();
		this.organizer = message.invite.getOrganizerEmail();
    	this.sentBy = message.invite.getSentBy();
		this.name = message.invite.getName();
		this.isException = message.invite.isException();
		this._setTimeFromMessage(message, viewMode);
		this._setExtrasFromMessage(message);
		this._setRecurrence(message);
	}
	this._setNotes(message);
	this.getAttachments();

	this._currentlyLoaded = message;
};

// This method gets called when a mail item is dragged onto the minical and we
// need to load the mail item and parse the right parts to show in ZmCalItemEditView
ZmCalItem.prototype.setFromMailMessage =
function(message, subject) {
	this.name = subject;
	this._setNotes(message);
	// set up message so attachments work
	this.message = message;
	this.invId = message.id;
};

ZmCalItem.prototype.setTextNotes =
function(notes) {
	this.notesTopPart = new ZmMimePart();
	this.notesTopPart.setContentType(ZmMimeTable.TEXT_PLAIN);
	this.notesTopPart.setContent(notes);
};

ZmCalItem.prototype._setTimeFromMessage =
function(message, viewMode) {
	// if instance of recurring appointment, start date is generated from unique
	// start time sent in appointment summaries. Associated message will contain
	// only the original start time.
	var start = message.invite.getServerStartTime();
	var end = message.invite.getServerEndTime();
	if (viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE) {
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

	// record timezone if given, otherwise, guess
    var serverId = !this.startsInUTC && message.invite.getServerStartTimeTz();
    this.setTimezone(serverId || AjxTimezone.getServerId(AjxTimezone.DEFAULT));

	// adjust start/end times based on UTC/timezone
	if (viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE) {
        var timezone = this.getOrigTimezone();
        ZmCalItem.__adjustDateForTimezone(this.startDate, timezone, this.startsInUTC);
		ZmCalItem.__adjustDateForTimezone(this.endDate, timezone, this.endsInUTC);
        this.setTimezone(AjxTimezone.getServerId(AjxTimezone.DEFAULT));
	}

    var tzrule = AjxTimezone.getRule(AjxTimezone.getClientId(this.getTimezone()));
    if (tzrule) {
        if (tzrule.aliasId) {
            tzrule = AjxTimezone.getRule(tzrule.aliasId) || tzrule;
        }
        this.setTimezone(tzrule.serverId);
    }
};

ZmCalItem.prototype._setExtrasFromMessage =
function(message) {
	// override
};

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
//We are removing starting 2 \n's for the bug 21823 
ZmCalItem.prototype._getCleanHtml2Text = 
function(dwtIframe){
    var textContent;
    if (dwtIframe && dwtIframe.getDocument() && dwtIframe.getDocument().body) {
        dwtIframe.getDocument().body.innerHTML = dwtIframe.getDocument().body.innerHTML.replace(/\n/ig,"");
        dwtIframe.getDocument().body.innerHTML = dwtIframe.getDocument().body.innerHTML.replace(/<!--.*-->/ig,"");
        var firstChild = dwtIframe.getDocument().body.firstChild;
        var removeN = false;
        if(firstChild && firstChild.tagName && firstChild.tagName.toLocaleLowerCase() == "p"){
            removeN = true;
        }
        textContent = AjxStringUtil.convertHtml2Text(dwtIframe.getDocument().body);
        if(removeN){
            textContent = textContent.replace(/\n\n/i,"");
        }
    }
    return textContent;
}

ZmCalItem.prototype._setNotes =
function(message) {
	var text = message.getBodyPart(ZmMimeTable.TEXT_PLAIN);
	var html = message.getBodyPart(ZmMimeTable.TEXT_HTML);

    this.notesTopPart = new ZmMimePart();
	if (html) {
        var htmlContent = this._trimNotesSummary(html.content.replace(/<title\s*>.*\/title>/ig,""), true);
		var textContent = "";

		// create a temp iframe to create a proper DOM tree
		var params = {parent:appCtxt.getShell(), hidden:true, html:htmlContent};
		var dwtIframe = new DwtIframe(params);
        if (dwtIframe) {
            textContent = this._getCleanHtml2Text(dwtIframe);
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
        var textContent = this._trimNotesSummary((text && text.content) || "");

		this.notesTopPart.setContentType(ZmMimeTable.TEXT_PLAIN);
		this.notesTopPart.setContent(textContent);
	}
}

/**
 * @param attachmentId 		[string]*		ID of the already uploaded attachment
 * @param callback 			[AjxCallback]*	callback triggered once request for appointment save is complete
 * @param errorCallback 	[AjxCallback]*	callback triggered if error during appointment save request
 * @param notifyList 		[Array]*		optional sublist of attendees to be notified (if different from original list of attendees)
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
	} else {
		// set recurrence rules for appointment (but not for exceptions!)
		this._recurrence.setSoap(soapDoc, comp);
	}

	this._sendRequest(soapDoc, accountName, callback, errorCallback);
};

ZmCalItem.prototype.cancel =
function(mode, msg, callback, errorCallback) {
	this.setViewMode(mode);
	if (msg) {
		// REVISIT: I have to explicitly set the bodyParts of the message
		//          because ZmComposeView#getMsg only sets the topPart on
		//          the new message that's returned. And ZmCalItem#_setNotes
		//          calls ZmMailMsg#getBodyPart.
		var bodyParts = [];
		var childParts = msg._topPart.node.ct == ZmMimeTable.MULTI_ALT
				? msg._topPart.children.getArray()
				: [msg._topPart];
		for (var i = 0; i < childParts.length; i++) {
			bodyParts.push(childParts[i].node);
		}
		msg.setBodyParts(bodyParts);
		this._setNotes(msg);
		this._doCancel(mode, callback, msg);
	} else {
		// To get the attendees for this appointment, we have to get the message.
		var respCallback = new AjxCallback(this, this._doCancel, [mode, callback, null]);
		var cancelErrorCallback = new AjxCallback(this, this._handleCancelError, [mode, callback, errorCallback]);
		if(this._blobInfoMissing && mode != ZmCalItem.MODE_DELETE_SERIES) {
			this.showBlobMissingDlg();		
		}else {
			this.getDetails(null, respCallback, cancelErrorCallback);
		}		
	}
};

ZmCalItem.prototype.showBlobMissingDlg =
function() {
	var msgDialog = appCtxt.getMsgDialog();
	msgDialog.setMessage(ZmMsg.apptBlobMissing, DwtMessageDialog.INFO_STYLE);
	msgDialog.popup();
};

ZmCalItem.prototype._handleCancelError = 
function(mode, callback, errorCallback, ex) {

	if (ex.code == "mail.NO_SUCH_BLOB") {
 		//bug: 19033, cannot delete instance of appt with missing blob info
 		if(this.isRecurring() && mode != ZmCalItem.MODE_DELETE_SERIES) {
			this._blobInfoMissing = true;
			this.showBlobMissingDlg();
			return true;
 		}else {
	 		this._doCancel(mode, callback, this.message);
 		}
 		return true;
 	}
	
	if(errorCallback){
		return errorCallback.run(ex);
	}
	
	return false;	
};

ZmCalItem.prototype._doCancel =
function(mode, callback, msg, result) {
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
					if (accountName && type == AjxEmailAddress.FROM)
						continue;
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
		soapDoc.set("su", ([ZmMsg.cancelled, ": ", this.name].join("")), m);
		this._addNotesToSoap(soapDoc, m, true);
		this._sendRequest(soapDoc, accountName, callback);
	} else {
		if (callback) callback.run();
	}
};

// Returns canned text for meeting invites.
// - Instances of recurring meetings should send out information that looks very
//   much like a simple appointment.
ZmCalItem.prototype.getTextSummary =
function() {
	return this.getSummary(false);
};

ZmCalItem.prototype.getHtmlSummary =
function() {
	return this.getSummary(true);
};

/**
 * @param attach		generic Object contain meta info about the attachment
 * @param hasCheckbox	whether to insert a checkbox prior to the attachment
*/
ZmCalItem.prototype.getAttachListHtml =
function(attach, hasCheckbox) {
  	var msgFetchUrl = appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI);
	var hrefRoot = "href='" + msgFetchUrl + "&id=" + this.invId + "&amp;part=";

	// gather meta data for this attachment
	var mimeInfo = ZmMimeTable.getInfo(attach.ct);
	var icon = mimeInfo ? mimeInfo.image : "GenericDoc";
	var size = attach.s;
	var sizeText = null;
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
	html[i++] = "<td width=20><a target='_blank' class='AttLink' ";
	html[i++] = hrefRoot;
	html[i++] = attach.part;
	html[i++] = "'>";
	html[i++] = AjxImg.getImageHtml(icon);
	html[i++] = "</a></td>";
	html[i++] = "<td><a target='_blank' class='AttLink' ";
	html[i++] = hrefRoot;
	html[i++] = attach.part;
	html[i++] = "'>";
	html[i++] = attach.filename;
	html[i++] = "</a>";

	var addHtmlLink = (appCtxt.get(ZmSetting.VIEW_ATTACHMENT_AS_HTML) &&
					  attach.body == null && ZmMimeTable.hasHtmlVersion(attach.ct));

	if (sizeText || addHtmlLink) {
		html[i++] = "&nbsp;(";
		if (sizeText) {
			html[i++] = sizeText;
			if (addHtmlLink)
				html[i++] = ", ";
		}
		if (addHtmlLink) {
			html[i++] = "<a style='text-decoration:underline' target='_blank' class='AttLink' ";
			html[i++] = hrefRoot;
			html[i++] = attach.part;
			html[i++] = "&view=html";
			html[i++] = "'>";
			html[i++] = ZmMsg.viewAsHtml;
			html[i++] = "</a>";
		}
		if (attach.ct != ZmMimeTable.MSG_RFC822) {
			html[i++] = ", ";
			html[i++] = "<a style='text-decoration:underline' class='AttLink' onclick='ZmZimbraMail.unloadHackCallback();' ";
			html[i++] = hrefRoot;
			html[i++] = attach.part;
			html[i++] = "&disp=a'>";
			html[i++] = ZmMsg.download;
			html[i++] = "</a>";
		}
		html[i++] = ")";
	}

	html[i++] = "</td></tr>";
	html[i++] = "</table>";

	return html.join("");
};


// Private / Protected methods

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

// Uses indexOf() rather than a regex since IE didn't split on the regex correctly.
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

ZmCalItem.prototype._resetCached =
function() {
	delete this._startTimeUniqId; this._startTimeUniqId = null;
	delete this._validAttachments; this._validAttachments = null;
	delete this.tooltip; this.tooltip = null;
};

ZmCalItem.prototype._getTTDay =
function(d) {
	return DwtCalendar.getDayFormatter().format(d);
};

ZmCalItem.prototype._addInviteAndCompNum =
function(soapDoc) {
	if (this.viewMode == ZmCalItem.MODE_EDIT_SERIES || this.viewMode == ZmCalItem.MODE_DELETE_SERIES) {
		if (this.recurring && this._seriesInvId !== void 0 && this._seriesInvId != null) {
			soapDoc.setMethodAttribute("id", this._seriesInvId);
			soapDoc.setMethodAttribute("comp", this.getCompNum());
		}
	} else {
		if (this.invId !== void 0 && this.invId != null && this.invId != -1) {
			soapDoc.setMethodAttribute("id", this.invId);
			soapDoc.setMethodAttribute("comp", this.getCompNum());
		}
	}
};

ZmCalItem.prototype._getDefaultBlurb =
function(cancel, isHtml) {
	var buf = [];
	var i = 0;
	var singleInstance = this.viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE ||
						 this.viewMode == ZmCalItem.MODE_DELETE_INSTANCE;

	if (isHtml) buf[i++] = "<h3>";

	if (cancel) {
		buf[i++] = singleInstance ? ZmMsg.apptInstanceCanceled : ZmMsg.apptCanceled;
	} else {
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
	}

	if (isHtml) buf[i++] = "</h3>";

	buf[i++] = "\n\n";
	buf[i++] = this.getSummary(isHtml);

	return buf.join("");
};

ZmCalItem.prototype._getDefaultFolderId =
function() {
	// override
};


// Server request calls

ZmCalItem.prototype._getSoapForMode =
function(mode, isException) {
	// override
};

ZmCalItem.prototype._getInviteFromError =
function(result) {
	// override
};

ZmCalItem.prototype._setSimpleSoapAttributes =
function(soapDoc, attachmentId, notifyList, onBehalfOf) {

	var m = this._messageNode = soapDoc.set('m');

	if (onBehalfOf) {
		m.setAttribute("l", this.getFolder().rid);
	} else {
		m.setAttribute("l", this.folderId);
	}

	var inv = soapDoc.set("inv", null, m);
	if (this.uid !== void 0 && this.uid != null && this.uid != -1)
		inv.setAttribute("uid", this.uid);

	var comp = soapDoc.set("comp", null, inv);

	// attendees
	if (this.isOrganizer())
		this._addAttendeesToSoap(soapDoc, comp, m, notifyList, onBehalfOf);

	this._addExtrasToSoap(soapDoc, inv, comp);

	// date/time
	this._addDateTimeToSoap(soapDoc, inv, comp);

	// subject/location
	soapDoc.set("su", this.name, m);
	comp.setAttribute("name", this.name);
	this._addLocationToSoap(comp);

	// notes
	this._addNotesToSoap(soapDoc, m);

	// set organizer
	var user = appCtxt.get(ZmSetting.USERNAME);
	var organizer = this.organizer || user;
	var org = soapDoc.set("or", null, comp);
	org.setAttribute("a", organizer);
	// if on-behalf of, set sentBy
	if (organizer != user) org.setAttribute("sentBy", user);
	// set display name of organizer
	var orgEmail = ZmApptViewHelper.getOrganizerEmail(this.organizer);
	var orgName = orgEmail.getName();
	if (orgName) org.setAttribute("d", orgName);

	// handle attachments
	if (attachmentId != null || (this._validAttachments != null && this._validAttachments.length)) {
		var attachNode = soapDoc.set("attach", null, m);
		if (attachmentId)
			attachNode.setAttribute("aid", attachmentId);

		if (this._validAttachments) {
			for (var i = 0; i < this._validAttachments.length; i++) {
				var msgPartNode = soapDoc.set("mp", null, attachNode);
				msgPartNode.setAttribute("mid", (this.invId || this.message.id));
				msgPartNode.setAttribute("part", this._validAttachments[i].part);
			}
		}
	}

	return {'inv': inv, 'm': m};
};

ZmCalItem.prototype._addExtrasToSoap =
function(soapDoc, inv, comp) {
	if (this.priority) comp.setAttribute("priority", this.priority);
	comp.setAttribute("status", this.status);
};

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

ZmCalItem.prototype._addLocationToSoap =
function(inv) {
	// override
};

ZmCalItem.prototype._addAttendeesToSoap =
function(soapDoc, inv, m, notifyList, onBehalfOf) {
	// if this appt is on-behalf-of, set the from address to that person
	if (onBehalfOf) {
		e = soapDoc.set("e", null, m);
		e.setAttribute("a", onBehalfOf);
		e.setAttribute("t", AjxEmailAddress.toSoapType[AjxEmailAddress.FROM]);
	}
};

ZmCalItem.prototype._addNotesToSoap =
function(soapDoc, m, cancel) {

	var hasAttendees = this.hasPersonAttendees();
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

			var pprefix = pct == ZmMimeTable.TEXT_HTML ? hprefix : tprefix;
			var content = AjxBuffer.concat(pprefix, part.getContent());
			soapDoc.set("content", content, partNode);
		}
	} else {
		var tcontent = this.notesTopPart ? this.notesTopPart.getContent() : "";
		var textPart = soapDoc.set("mp", null, mp);
		textPart.setAttribute("ct", ZmMimeTable.TEXT_PLAIN);
		soapDoc.set("content", AjxBuffer.concat(tprefix, tcontent), textPart);

		// bug fix #9592 - html encode the text before setting it as the "HTML" part
		var hcontent = AjxStringUtil.nl2br(AjxStringUtil.htmlEncode(tcontent));
		var htmlPart = soapDoc.set("mp", null, mp);
		htmlPart.setAttribute("ct", ZmMimeTable.TEXT_HTML);
		var html = "<html><body>" + AjxBuffer.concat(hprefix, hcontent) + "</body></html>";
		soapDoc.set("content", html, htmlPart);
	}
};

ZmCalItem.prototype._sendRequest =
function(soapDoc, accountName, callback, errorCallback) {
	var responseName = soapDoc.getMethod().nodeName.replace("Request", "Response");
	var respCallback = new AjxCallback(this, this._handleResponseSend, [responseName, callback]);
	appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true, accountName:accountName, callback:respCallback, errorCallback:errorCallback});
};

ZmCalItem.prototype._loadFromDom =
function(calItemNode, instNode) {

	this.uid 			= calItemNode.uid;
	this.folderId 		= calItemNode.l || this._getDefaultFolderId();
	this.id 			= this._getAttr(calItemNode, instNode, "id");
	this.name 			= this._getAttr(calItemNode, instNode, "name");
	this.fragment 		= this._getAttr(calItemNode, instNode, "fr");
	this.isOrg 			= this._getAttr(calItemNode, instNode, "isOrg");
    var org             = calItemNode.or;
    this.organizer      = org && org.a;
    this.sentBy         = org && org.sentBy;
    this.status 		= this._getAttr(calItemNode, instNode, "status");
	this.ptst 			= this._getAttr(calItemNode, instNode, "ptst");
	this.invId 			= this._getAttr(calItemNode, instNode, "invId");
	this.compNum 		= this._getAttr(calItemNode, instNode, "compNum") || "0";
	this.isException 	= this._getAttr(calItemNode, instNode, "ex");
	var itemAllDay		= calItemNode.allDay;
	var instAllDay		= instNode.allDay;
	var dur				= this._getAttr(calItemNode, instNode, "dur");
	this.allDayEvent	= (instAllDay || (itemAllDay && !this.isException)) ? "1" : "0";
	this.alarm 			= this._getAttr(calItemNode, instNode, "alarm");
	this.priority 		= parseInt(this._getAttr(calItemNode, instNode, "priority"));

	this.recurring 		= instNode.recur != null ? instNode.recur : calItemNode.recur; // TEST for null since recur can be FALSE
	this._seriesInvId 	= this.recurring ? calItemNode.invId : null;

	// override ptst for this instance if map-able
	if (instNode.fba && ZmCalItem.FBA_TO_PTST[instNode.fba])
		this.ptst = ZmCalItem.FBA_TO_PTST[instNode.fba];

	var sd = this._getAttr(calItemNode, instNode, "s");
	if (sd) {
		var adjustMs = this.isAllDayEvent() ? (instNode.tzo + new Date(instNode.s).getTimezoneOffset()*60*1000) : 0;
		var startTime = parseInt(sd,10) + adjustMs;
		this.startDate = new Date(startTime);
		this.uniqStartTime = this.startDate.getTime();
	}

	var ed = dur;
	if (ed) {
		var endTime = startTime + (parseInt(ed));
		this.endDate = new Date(endTime);
	}

	if (calItemNode.t) {
		this._parseTags(calItemNode.t);
	}
};

ZmCalItem.prototype._getAttr =
function(calItem, inst, name) {
	return inst[name] || calItem[name];
};


// Callbacks

ZmCalItem.prototype._handleResponseSend =
function(respName, callback, result) {
	var resp = result.getResponse();

	// branch for different responses
	var response = resp[respName];
	if (response.uid != null)
		this.uid = response.uid;

	if (response.m != null) {
		var oldInvId = this.invId;
		this.invId = response.m.id;
		if (oldInvId != this.invId)
			this.message = null;
	}

	this._messageNode = null;

	if (callback)
		callback.run();
};

ZmCalItem.prototype._handleResponseGetDetails =
function(mode, message, callback, result) {
	// msg content should be text, so no need to pass callback to setFromMessage()
	this.setFromMessage(message, mode);
	if (callback) callback.run(result);
};


// Static methods

/**
* Compares two appts. sort by (starting date, duration)
* sort methods.
*
* @param a		an appt
* @param b		an appt
*/
ZmCalItem.compareByTimeAndDuration =
function(a, b) {
	if (a.getStartTime() > b.getStartTime()) 	return 1;
	if (a.getStartTime() < b.getStartTime()) 	return -1;
	if (a.getDuration() < b.getDuration()) 		return 1;
	if (a.getDuration() > b.getDuration()) 		return -1;
	return 0;
};

ZmCalItem.getLabelForPriority =
function(priority) {
	switch (priority) {
		case ZmCalItem.PRIORITY_LOW:	return ZmMsg.low;
		case ZmCalItem.PRIORITY_NORMAL: return ZmMsg.normal;
		case ZmCalItem.PRIORITY_HIGH:	return ZmMsg.high;
		default: return "";
	}
};

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

ZmCalItem.getLabelForParticipationStatus =
function(status) {
	switch (status) {
		case ZmCalItem.PSTATUS_ACCEPT: return ZmMsg.ptstAccept;
		case ZmCalItem.PSTATUS_DECLINED: return ZmMsg.ptstDeclined;
		case ZmCalItem.PSTATUS_DEFERRED: return ZmMsg.ptstDeferred;
		case ZmCalItem.PSTATUS_DELEGATED: return ZmMsg.ptstDelegated;
		case ZmCalItem.PSTATUS_NEEDS_ACTION: return ZmMsg.ptstNeedsAction;
		case ZmCalItem.PSTATUS_COMPLETED:  return ZmMsg.completed;
		case ZmCalItem.PSTATUS_TENTATIVE: return ZmMsg.ptstTentative;
		case ZmCalItem.PSTATUS_WAITING: return ZmMsg.ptstWaiting;
	}
	return "";
};

ZmCalItem.getParticipationStatusIcon =
function(status) {
	switch (status) {
		case ZmCalItem.PSTATUS_ACCEPT: return "Check";
		case ZmCalItem.PSTATUS_DECLINED: return "Cancel";
		case ZmCalItem.PSTATUS_DEFERRED: return "QuestionMark";
		case ZmCalItem.PSTATUS_DELEGATED: return "Plus";
		case ZmCalItem.PSTATUS_NEEDS_ACTION: return "QuestionMark";
		case ZmCalItem.PSTATUS_COMPLETED: return "Completed";		
		case ZmCalItem.PSTATUS_TENTATIVE: return "QuestionMark";
		case ZmCalItem.PSTATUS_WAITING: return "Minus";
	}
	return "";
};

ZmCalItem._getTTHour =
function(d) {
	var formatter = AjxDateFormat.getTimeInstance(AjxDateFormat.SHORT);
	return formatter.format(d);
};

ZmCalItem._getTTDay =
function(d, format) {
	format = format || AjxDateFormat.SHORT;
	var formatter = AjxDateFormat.getDateInstance();
	return formatter.format(d);
};

// REVISIT: Move to AjxDateUtil function
ZmCalItem.__adjustDateForTimezone =
function(date, timezoneServerId, inUTC) {
	var currentOffset = AjxTimezone.getOffset(AjxTimezone.DEFAULT, date);
	var timezoneOffset = currentOffset;
	if (!inUTC) {
		var timezoneClientId = AjxTimezone.getClientId(timezoneServerId);
		timezoneOffset = AjxTimezone.getOffset(timezoneClientId, date);
	}
	var offset = currentOffset - timezoneOffset;
	date.setMinutes(date.getMinutes() + offset);
};
