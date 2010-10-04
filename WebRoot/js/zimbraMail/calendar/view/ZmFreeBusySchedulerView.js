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
 * Creates a new tab view for scheduling appointment attendees.
 * @constructor
 * @class
 * This class displays free/busy information for an appointment's attendees. An
 * attendee may be a person, a location, or equipment.
 *
 *  @author Sathishkumar Sugumaran
 *
 * @param parent			[ZmApptComposeView]			the appt compose view
 * @param attendees			[hash]						attendees/locations/equipment
 * @param controller		[ZmApptComposeController]	the appt compose controller
 * @param dateInfo			[object]					hash of date info
 */
ZmFreeBusySchedulerView = function(parent, attendees, controller, dateInfo) {

	DwtComposite.call(this, {parent: parent, posStyle: DwtControl.RELATIVE_STYLE});

	this._attendees = attendees;
	this._controller = controller;
	this._dateInfo = dateInfo;

	this._editView = parent;

	this._rendered = false;
	this._emailToIdx = {};
	this._schedTable = [];
	this._allAttendees = [];
	this._allAttendeesStatus = [];
	this._allAttendeesSlot = null;

	this._attTypes = [ZmCalBaseItem.PERSON];
	if (appCtxt.get(ZmSetting.GAL_ENABLED)) {
		this._attTypes.push(ZmCalBaseItem.LOCATION);
		this._attTypes.push(ZmCalBaseItem.EQUIPMENT);
	}

	this._fbCallback = new AjxCallback(this, this._handleResponseFreeBusy);
	this._workCallback = new AjxCallback(this, this._handleResponseWorking);
	this._kbMgr = appCtxt.getKeyboardMgr();
    this._emailAliasMap = {};

    this.addListener(DwtEvent.ONMOUSEDOWN, parent._listenerMouseDown);

    this.isComposeMode = true;
};

ZmFreeBusySchedulerView.prototype = new DwtComposite;
ZmFreeBusySchedulerView.prototype.constructor = ZmFreeBusySchedulerView;


// Consts

ZmFreeBusySchedulerView.FREEBUSY_NUM_CELLS		= 48;

/**
 * Defines the "free" status.
 */
ZmFreeBusySchedulerView.STATUS_FREE				= 1;
/**
 * Defines the "busy" status.
 */
ZmFreeBusySchedulerView.STATUS_BUSY				= 2;
/**
 * Defines the "tentative" status.
 */
ZmFreeBusySchedulerView.STATUS_TENTATIVE			= 3;
/**
 * Defines the "out" status.
 */
ZmFreeBusySchedulerView.STATUS_OUT				= 4;
/**
 * Defines the "unknown" status.
 */
ZmFreeBusySchedulerView.STATUS_UNKNOWN			= 5;
ZmFreeBusySchedulerView.STATUS_WORKING			= 6;
// Pre-cache the status css class names
ZmFreeBusySchedulerView.STATUS_CLASSES = [];
ZmFreeBusySchedulerView.STATUS_CLASSES[ZmFreeBusySchedulerView.STATUS_FREE]		= "ZmScheduler-free";
ZmFreeBusySchedulerView.STATUS_CLASSES[ZmFreeBusySchedulerView.STATUS_BUSY]		= "ZmScheduler-busy";
ZmFreeBusySchedulerView.STATUS_CLASSES[ZmFreeBusySchedulerView.STATUS_TENTATIVE]	= "ZmScheduler-tentative";
ZmFreeBusySchedulerView.STATUS_CLASSES[ZmFreeBusySchedulerView.STATUS_OUT]		= "ZmScheduler-outOfOffice";
ZmFreeBusySchedulerView.STATUS_CLASSES[ZmFreeBusySchedulerView.STATUS_UNKNOWN]	= "ZmScheduler-unknown";
ZmFreeBusySchedulerView.STATUS_CLASSES[ZmFreeBusySchedulerView.STATUS_WORKING]	= "ZmScheduler-working";

ZmFreeBusySchedulerView.PSTATUS_CLASSES = [];
ZmFreeBusySchedulerView.PSTATUS_CLASSES[ZmCalBaseItem.PSTATUS_DECLINED]      = "ZmSchedulerPTST-declined";
ZmFreeBusySchedulerView.PSTATUS_CLASSES[ZmCalBaseItem.PSTATUS_DEFERRED]      = "ZmSchedulerPTST-deferred";
ZmFreeBusySchedulerView.PSTATUS_CLASSES[ZmCalBaseItem.PSTATUS_DELEGATED]     = "ZmSchedulerPTST-delegated";
ZmFreeBusySchedulerView.PSTATUS_CLASSES[ZmCalBaseItem.PSTATUS_NEEDS_ACTION]  = "ZmSchedulerPTST-needsaction";
ZmFreeBusySchedulerView.PSTATUS_CLASSES[ZmCalBaseItem.PSTATUS_TENTATIVE]     = "ZmSchedulerPTST-tentative";
ZmFreeBusySchedulerView.PSTATUS_CLASSES[ZmCalBaseItem.PSTATUS_WAITING]       = "ZmSchedulerPTST-waiting";

// Hold on to this one separately because we use it often
ZmFreeBusySchedulerView.FREE_CLASS = ZmFreeBusySchedulerView.STATUS_CLASSES[ZmFreeBusySchedulerView.STATUS_FREE];

// Public methods

ZmFreeBusySchedulerView.prototype.toString =
function() {
	return "ZmFreeBusySchedulerView";
};

ZmFreeBusySchedulerView.prototype.setComposeMode =
function(isComposeMode) {
	this.isComposeMode = isComposeMode;
};

ZmFreeBusySchedulerView.prototype.showMe =
function() {

    if(this.composeMode) ZmApptViewHelper.getDateInfo(this._editView, this._dateInfo);

	this._dateBorder = this._getBordersFromDateInfo(this._dateInfo);

	if (!this._rendered) {
		this._initialize();
	}

    var organizer;
    if(this.isComposeMode) {
        organizer = this._isProposeTime ? this._editView.getCalItemOrganizer() : this._editView.getOrganizer();
    }else {
        /* var organizer = new ZmContact(null);
        var account = appCtxt.multiAccounts && appCtxt.getById(folderId).getAccount();
        var orgAddress = appCtxt.get(ZmSetting.USERNAME, null, account);
	    var orgName = appCtxt.get(ZmSetting.DISPLAY_NAME, null, account);
	    var organizerEmail = new AjxEmailAddress(orgAddress, null, orgName);
        organizer.initFromEmail(organizerEmail, true);  */
        organizer = this._editView.getOrganizer();
    }

	this.set(this._dateInfo, organizer, this._attendees);
    this.enablePartcipantStatusColumn(this.isComposeMode ? this._editView.getRsvp() : true);
};

ZmFreeBusySchedulerView.prototype.initialize =
function(appt, mode, isDirty, apptComposeMode) {
	this._appt = appt;
	this._mode = mode;
    this._isForward = (apptComposeMode == ZmApptComposeView.FORWARD);
    this._isProposeTime = (apptComposeMode == ZmApptComposeView.PROPOSE_TIME);
};

ZmFreeBusySchedulerView.prototype.set =
function(dateInfo, organizer, attendees) {

    //need to capture initial time set while composing/editing appt
    if(this.isComposeMode) ZmApptViewHelper.getDateInfo(this._editView, this._dateInfo);

	this._setAttendees(organizer, attendees);
	this._outlineAppt();
};

ZmFreeBusySchedulerView.prototype.cleanup =
function() {
	if (!this._rendered) return;

	// remove all but first two rows (header and All Attendees)
	while (this._attendeesTable.rows.length > 2) {
		this._removeAttendeeRow(2);
	}
	this._activeInputIdx = null;

	// cleanup all attendees row
	var allAttCells = this._allAttendeesSlot._coloredCells;
	while (allAttCells.length > 0) {
		allAttCells[0].className = ZmFreeBusySchedulerView.FREE_CLASS;
		allAttCells.shift();
	}

	for (var i in this._emailToIdx) {
		delete this._emailToIdx[i];
	}

	this._curValStartDate = "";
	this._curValEndDate = "";

	this._resetAttendeeCount();

	// reset autocomplete lists
	if (this._acContactsList) {
		this._acContactsList.reset();
		this._acContactsList.show(false);
	}
	if (this._acEquipmentList) {
		this._acEquipmentList.reset();
		this._acEquipmentList.show(false);
	}

    this._emailAliasMap = {};
};

// Private / protected methods

ZmFreeBusySchedulerView.prototype._initialize =
function() {
	this._createHTML();
	this._initAutocomplete();
	this._createDwtObjects();
	this._resetAttendeeCount();

	this._rendered = true;
};

ZmFreeBusySchedulerView.prototype._createHTML =
function() {
	this._navToolbarId		= this._htmlElId + "_navToolbar";
	this._attendeesTableId	= this._htmlElId + "_attendeesTable";

	this._schedTable[0] = null;	// header row has no attendee data

	var subs = { id:this._htmlElId, isAppt: true, showTZSelector: appCtxt.get(ZmSetting.CAL_SHOW_TIMEZONE) };
	this.getHtmlElement().innerHTML = AjxTemplate.expand("calendar.Appointment#InlineScheduleView", subs);
    this._navToolbarContainerId = this._htmlElId + "_navToolbar";
};

ZmFreeBusySchedulerView.prototype._initAutocomplete =
function() {

	var acCallback = new AjxCallback(this, this._autocompleteCallback);
	var keyUpCallback = new AjxCallback(this, this._autocompleteKeyUpCallback);
	this._acList = {};

	// autocomplete for attendees
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED) || appCtxt.get(ZmSetting.GAL_ENABLED)) {
		var params = {
			dataClass: appCtxt.getAutocompleter(),
			separator: "",
			options: {needItem: true},
			matchValue: [ZmAutocomplete.AC_VALUE_NAME, ZmAutocomplete.AC_VALUE_EMAIL],
			keyUpCallback: keyUpCallback,
			compCallback: acCallback
		};
		this._acContactsList = new ZmAutocompleteListView(params);
		this._acList[ZmCalBaseItem.PERSON] = this._acContactsList;

		// autocomplete for locations/equipment
		if (appCtxt.get(ZmSetting.GAL_ENABLED)) {
			params.options = {type:ZmAutocomplete.AC_TYPE_LOCATION};
			this._acLocationsList = new ZmAutocompleteListView(params);
			this._acList[ZmCalBaseItem.LOCATION] = this._acLocationsList;

			params.options = {type:ZmAutocomplete.AC_TYPE_EQUIPMENT};
			this._acEquipmentList = new ZmAutocompleteListView(params);
			this._acList[ZmCalBaseItem.EQUIPMENT] = this._acEquipmentList;
		}
	}
};

// Add the attendee, then create a new empty slot since we've now filled one.
ZmFreeBusySchedulerView.prototype._autocompleteCallback =
function(text, el, match) {
	if (match && match.item) {
		if (match.item.isGroup && match.item.isGroup()) {
			var members = match.item.getGroupMembers().good.getArray();
			for (var i = 0; i < members.length; i++) {
				el.value = members[i].address;
				var index = this._handleAttendeeField(el);

				if (index && ((i+1) < members.length)) {
					el = this._schedTable[index].inputObj.getInputElement();
				}
			}
		} else {
			this._handleAttendeeField(el, match.item);
		}
	}
};

// Enter listener. If the user types a return when no autocomplete list is showing,
// then go ahead and add a new empty slot.
ZmFreeBusySchedulerView.prototype._autocompleteKeyUpCallback =
function(ev, aclv, result) {
	var key = DwtKeyEvent.getCharCode(ev);
	if ((key == 3 || key == 13) && !aclv.getVisible()) {
		var el = DwtUiEvent.getTargetWithProp(ev, "id");
        this._handleAttendeeField(el);
	}
};

ZmFreeBusySchedulerView.prototype._addTabGroupMembers =
function(tabGroup) {
	for (var i = 0; i < this._schedTable.length; i++) {
		var sched = this._schedTable[i];
		if (sched && sched.inputObj) {
			tabGroup.addMember(sched.inputObj);
		}
	}
};

ZmFreeBusySchedulerView.prototype._deleteAttendeeRow =
function(email) {
    var index = this._emailToIdx[email];
    if(!index) {
        return;
    }
    delete this._emailToIdx[email];
    Dwt.setDisplay(this._attendeesTable.rows[index], 'none');
    this._schedTable[index] = null;
    //remove appt divs created for attendee/calendar

    this._editView.removeApptByEmail(email);


    this._updateFreeBusy();
    this._editView.removeMetadataAttendees(this._schedTable[this._organizerIndex].attendee, email);
}

/**
 * Adds a new, empty slot with a select for the attendee type, an input field,
 * and cells for free/busy info.
 *
 * @param isAllAttendees	[boolean]*	if true, this is the "All Attendees" row
 * @param organizer			[string]*	organizer
 * @param drawBorder		[boolean]*	if true, draw borders to indicate appt time
 * @param index				[int]*		index at which to add the row
 * @param updateTabGroup	[boolean]*	if true, add this row to the tab group
 * @param setFocus			[boolean]*	if true, set focus to this row's input field
 */
ZmFreeBusySchedulerView.prototype._addAttendeeRow =
function(isAllAttendees, organizer, drawBorder, index, updateTabGroup, setFocus) {
	index = index || this._attendeesTable.rows.length;

	// store some meta data about this table row
	var sched = {};
	var dwtId = Dwt.getNextId();	// container for input
	sched.dwtNameId		= dwtId + "_NAME_";			// TD that contains name
	sched.dwtTableId	= dwtId + "_TABLE_";		// TABLE with free/busy cells
	sched.dwtSelectId	= dwtId + "_SELECT_";		// TD that contains select menu
	sched.dwtInputId	= dwtId + "_INPUT_";		// input field
	sched.idx = index;
	sched._coloredCells = [];
	this._schedTable[index] = sched;

	var data = {
		id: dwtId,
		sched: sched,
		isAllAttendees: isAllAttendees,
		organizer: organizer,
		cellCount: ZmFreeBusySchedulerView.FREEBUSY_NUM_CELLS,
        isComposeMode: this.isComposeMode
	};

	var tr = this._attendeesTable.insertRow(index);
	var td = tr.insertCell(-1);
    if(isAllAttendees) {
        td.className = "ZmSchedulerAllTd";
    }
	td.innerHTML = AjxTemplate.expand("calendar.Appointment#AttendeeName", data);

	var td = tr.insertCell(-1);
	td.innerHTML = AjxTemplate.expand("calendar.Appointment#AttendeeFreeBusy", data);
    td.style.padding = "0";

	var freeBusyTable = document.getElementById(sched.dwtTableId);
	Dwt.setHandler(freeBusyTable, DwtEvent.ONMOUSEOVER, ZmFreeBusySchedulerView._onFreeBusyMouseOver);
	Dwt.setHandler(freeBusyTable, DwtEvent.ONMOUSEOUT, ZmFreeBusySchedulerView._onFreeBusyMouseOut);

	for (var k = 0; k < data.cellCount; k++) {
		var id = sched.dwtTableId + "_" + k;
		var fbDiv = document.getElementById(id);
		if (fbDiv) {
			fbDiv._freeBusyCellIndex = k;
			fbDiv._schedTableIdx = index;
			fbDiv._schedViewPageId = this._svpId;
		}
	}

	// create DwtInputField and DwtSelect for the attendee slots, add handlers
	if (!isAllAttendees && !organizer) {
		// add DwtSelect
		var select;
		var selectId = sched.dwtSelectId;
		var selectDiv = document.getElementById(selectId);
		if (this.isComposeMode && selectDiv) {
			select = new DwtSelect({parent:this});
			select.addOption(new DwtSelectOption(ZmCalBaseItem.PERSON, true, ZmMsg.requiredAttendee, null, null, "AttendeesRequired"));
			select.addOption(new DwtSelectOption(ZmCalItem.ROLE_OPTIONAL, false, ZmMsg.optionalAttendee, null, null, "AttendeesOptional"));
			select.addOption(new DwtSelectOption(ZmCalBaseItem.LOCATION, false, ZmMsg.location, null, null, "Location"));

            if(appCtxt.get(ZmSetting.CAL_SHOW_RESOURCE_TABS)) {
                select.addOption(new DwtSelectOption(ZmCalBaseItem.EQUIPMENT, false, ZmMsg.resourceAttendee, null, null, "Resource"));
            }

			select.reparentHtmlElement(selectId);
			select.addChangeListener(this._selectChangeListener);
			select.setSize("45");
			select.setText("");
            select._schedTableIdx = index;
			sched.selectObj = select;
		}
		// add DwtInputField
		var nameDiv = document.getElementById(sched.dwtNameId);
		if (nameDiv) {
			var dwtInputField = new DwtInputField({parent: this, type: DwtInputField.STRING, maxLen: 256});
			dwtInputField.setDisplay(Dwt.DISPLAY_INLINE);
			var inputEl = dwtInputField.getInputElement();
            Dwt.setSize(inputEl, Dwt.DEFAULT, "22px")
			inputEl.className = "ZmSchedulerInput";
			inputEl.id = sched.dwtInputId;
            inputEl.style.border = "0px";
			sched.attType = inputEl._attType = ZmCalBaseItem.PERSON;
			sched.inputObj = dwtInputField;
			if (select) {
				select.dwtInputField = dwtInputField;
			}
			dwtInputField.reparentHtmlElement(sched.dwtNameId);
		}

		sched.ptstObj = document.getElementById(sched.dwtNameId+"_ptst");

        Dwt.setVisible(sched.ptstObj, this.isComposeMode ? this._editView.getRsvp() : true);

		// set handlers
		var attendeeInput = document.getElementById(sched.dwtInputId);
		if (attendeeInput) {
			this._activeInputIdx = index;
			// handle focus moving to/from an enabled input
			Dwt.setHandler(attendeeInput, DwtEvent.ONFOCUS, ZmFreeBusySchedulerView._onFocus);
			Dwt.setHandler(attendeeInput, DwtEvent.ONBLUR, ZmFreeBusySchedulerView._onBlur);
			attendeeInput._schedViewPageId = this._svpId;
			attendeeInput._schedTableIdx = index;
			// default to person-based autocomplete handling
			if (this._acContactsList) {
				this._acContactsList.handle(attendeeInput);
			}
		}
	}

	if (drawBorder) {
		this._updateBorders(sched, isAllAttendees);
	}
    
	if (setFocus && sched.inputObj) {
		this._kbMgr.grabFocus(sched.inputObj);
	}
	return index;
};

ZmFreeBusySchedulerView.prototype._removeAttendeeRow =
function(index, updateTabGroup) {
	this._attendeesTable.deleteRow(index);
	this._schedTable.splice(index, 1);
	if (updateTabGroup) {
		this._controller._setComposeTabGroup(true);
	}
};

ZmFreeBusySchedulerView.prototype._hideAttendeeRow =
function(index, updateTabGroup) {
    var row = this._attendeesTable.rows[index];
    if(row){
        row.style.display="none";
    }
    if (updateTabGroup) {
        this._controller._setComposeTabGroup(true);
    }

};

ZmFreeBusySchedulerView.prototype._createDwtObjects =
function() {

    //todo: use time selection listener when appt time is changed
	//var timeSelectListener = new AjxListener(this, this._timeChangeListener);

	this._curValStartDate = "";
	this._curValEndDate = "";

	// add All Attendees row
	this._svpId = AjxCore.assignId(this);
	this._attendeesTable = document.getElementById(this._attendeesTableId);
	this._allAttendeesIndex = this._addAttendeeRow(true, null, false);
	this._allAttendeesSlot = this._schedTable[this._allAttendeesIndex];
	this._allAttendeesTable = document.getElementById(this._allAttendeesSlot.dwtTableId);

	this._selectChangeListener = new AjxListener(this, this._selectChangeListener);
};

ZmFreeBusySchedulerView.prototype._showTimeFields =
function(show) {
	Dwt.setVisibility(this._startTimeSelect.getHtmlElement(), show);
	Dwt.setVisibility(this._endTimeSelect.getHtmlElement(), show);
	this._setTimezoneVisible(this._dateInfo);

	// also show/hide the "@" text
	Dwt.setVisibility(document.getElementById(this._startTimeAtLblId), show);
	Dwt.setVisibility(document.getElementById(this._endTimeAtLblId), show);
};

ZmFreeBusySchedulerView.prototype._isDuplicate =
function(email) {
    return this._emailToIdx[email] ? true : false;
}

/**
 * Called by ONBLUR handler for attendee input field.
 *
 * @param inputEl
 * @param attendee
 * @param useException
 */
ZmFreeBusySchedulerView.prototype._handleAttendeeField =
function(inputEl, attendee, useException) {

	var idx = inputEl._schedTableIdx;
	if (idx != this._activeInputIdx) return;

	var sched = this._schedTable[idx];
	if (!sched) return;
	var input = sched.inputObj;
	if (!input) return;

	var value = input.getValue();
	if (value) {
		value = AjxStringUtil.trim(value.replace(/[;,]$/, ""));	// trim separator, white space
	}
	var curAttendee = sched.attendee;
	var type = sched.attType;

	if (value) {
		if (curAttendee) {
			// user edited slot with an attendee in it
			var attText = AjxStringUtil.trim(curAttendee.getAttendeeText(type, true));
			if (value == attText) {
				return;
			} else {
				this._resetRow(sched, false, type, true);
			}
		}
		attendee = attendee ? attendee : ZmApptViewHelper.getAttendeeFromItem(value, type, true);
		if (attendee) {
			var email = attendee.getEmail();


			if (email instanceof Array) {
				for (var i in email) {
                    if(this._isDuplicate(email[i])) {
                        //if duplicate - do nothing
                        return;
                    }
					this._emailToIdx[email[i]] = idx;
				}
			} else {
                if(this._isDuplicate(email)) {
                    //if duplicate - do nothing
                    return;
                }
				this._emailToIdx[email] = idx;
			}

			// go get this attendee's free/busy info if we haven't already
			if (sched.uid != email) {
				this._getFreeBusyInfo(this._getStartTime(), email, this._fbCallback, this._workCallback);
			}
			sched.attendee = attendee;
            this._setParticipantStatus(sched, attendee, idx);

			this._setAttendeeToolTip(sched, attendee);
            //directly update attendees
			if(this.isComposeMode) {
                this._editView.parent.updateAttendees(attendee, type, ZmApptComposeView.MODE_ADD);
                this._editView._setAttendees();
            }
            else {
                this._editView.setMetadataAttendees(this._schedTable[this._organizerIndex].attendee, email);
                this._editView.refreshAppts();
            }
            if (!curAttendee) {
				// user added attendee in empty slot
				var value = this._addAttendeeRow(false, null, true, null, true, true); // add new empty slot
                if(this.isComposeMode) this._editView.autoSize();
                return value;
			}
		} else {
			this._activeInputIdx = null;
		}
	} else if (curAttendee) {
		// user erased an attendee
		this._resetRow(sched, false, type);
        // bug:43660 removing row (splicing array) causes index mismatch.
        //this._removeAttendeeRow(idx, true);
		this._hideAttendeeRow(idx, true);
	}
};

ZmFreeBusySchedulerView.prototype._setAttendeeToolTip =
function(sched, attendee, type) {
	if (type != ZmCalBaseItem.PERSON) { return; }

	var name = attendee.getFullName();
	var email = attendee.getEmail();
	if (name && email) {
		var ptst = ZmMsg.attendeeStatusLabel + ZmCalItem.getLabelForParticipationStatus(attendee.getParticipantStatus() || "NE");
		sched.inputObj.setToolTipContent(email + (this.isComposeMode && this._editView.getRsvp()) ? ("<br>"+ ptst) : "");
	}
};

ZmFreeBusySchedulerView.prototype._getStartTime =
function() {
	var startDate = AjxDateUtil.simpleParseDateStr(this._dateInfo.startDate);
	return startDate.getTime();
};

ZmFreeBusySchedulerView.prototype._getEndTime =
function() {
	var endDate = AjxDateUtil.simpleParseDateStr(this._dateInfo.endDate);
	return endDate.getTime();
};

ZmFreeBusySchedulerView.prototype._setDateInfo =
function(dateInfo) {
	this._dateInfo = dateInfo;
};

ZmFreeBusySchedulerView.prototype._colorAllAttendees =
function() {
	var row = this._allAttendeesTable.rows[0];

	for (var i = 0; i < this._allAttendees.length; i++) {
		//if (this._allAttendees[i] > 0) {
			// TODO: opacity...
			var status = this.getAllAttendeeStatus(i);
			row.cells[i].className = this._getClassForStatus(status);
			this._allAttendeesSlot._coloredCells.push(row.cells[i]);
		//}
	}
};

ZmFreeBusySchedulerView.prototype._updateFreeBusy =
function() {
	// update the full date field
	this._resetFullDateField();

	// clear the schedules for existing attendees
	var uids = [];
	for (var i = 0; i < this._schedTable.length; i++) {
		var sched = this._schedTable[i];
		if (!sched) continue;
		if (sched.uid)
			uids.push(sched.uid);
		while (sched._coloredCells && sched._coloredCells.length > 0) {
			sched._coloredCells[0].className = ZmFreeBusySchedulerView.FREE_CLASS;
			sched._coloredCells.shift();
		}

	}

	this._resetAttendeeCount();

	if (uids.length) {
		var emails = uids.join(",");
		this._getFreeBusyInfo(this._getStartTime(), emails, this._fbCallback, this._workCallback);
	}
};

// XXX: optimize later - currently we always update the f/b view :(
ZmFreeBusySchedulerView.prototype._setAttendees =
function(organizer, attendees) {
	this.cleanup();

    //sync with date info from schedule view
    if(this.isComposeMode) ZmApptViewHelper.getDateInfo(this._editView, this._dateInfo);

    var emails = [];

	// create a slot for the organizer
	this._organizerIndex = this._addAttendeeRow(false, organizer.getAttendeeText(ZmCalBaseItem.PERSON, true), false);
	emails.push(this._setAttendee(this._organizerIndex, organizer, ZmCalBaseItem.PERSON, true));

	// create slots for each of the other attendees/resources
	for (var t = 0; t < this._attTypes.length; t++) {
		var type = this._attTypes[t];
        if(attendees[type]) {
            var att = attendees[type].getArray ? attendees[type].getArray() : attendees[type];
            for (var i = 0; i < att.length; i++) {
                var email = att[i] ? att[i].getEmail() : null;

                if (email && !this._emailToIdx[email]) {
                    var index = this._addAttendeeRow(false, null, false); // create a slot for this attendee
                    emails.push(this._setAttendee(index, att[i], type, false));
                }
            }
        }
	}

	// make sure there's always an empty slot
	this._addAttendeeRow(false, null, false, null, true, false);

	if (emails.length) {
		this._getFreeBusyInfo(this._getStartTime(), emails.join(","), this._fbCallback, this._workCallback);
	}

    if(this._appt) {
        this.enableAttendees(this._appt.isOrganizer());
    }
};

ZmFreeBusySchedulerView.prototype._setAttendee =
function(index, attendee, type, isOrganizer) {
	var sched = this._schedTable[index];
	if (!sched) { return; }

	sched.attendee = attendee;
	sched.attType = type;
	var input = sched.inputObj;
	if (input) {
		input.setValue(attendee.getAttendeeText(type, true), true);
		this._setAttendeeToolTip(sched, attendee, type);
	}

	var select = sched.selectObj;
    var role = attendee.getParticipantRole() || ZmCalItem.ROLE_REQUIRED;

    if(type == ZmCalBaseItem.PERSON && role == ZmCalItem.ROLE_OPTIONAL) {
        type = ZmCalItem.ROLE_OPTIONAL;
    }

	if (select) {
		select.setSelectedValue(type);
        select.setText("");
	}
    this._setParticipantStatus(sched, attendee, index);
    
	var email = attendee.getEmail();
	if (email instanceof Array) {
		for (var i in email) {
			this._emailToIdx[email[i]] = index;
		}
	} else {
		this._emailToIdx[email] = index;
	}

	return email;
};

ZmFreeBusySchedulerView.prototype.getAttendees =
function() {
    var attendees = [];
    for (var i=0; i < this._schedTable.length; i++) {
        var sched = this._schedTable[i];
        if(!sched) {
            continue;
        }
        if(sched.attendee) {
            attendees.push(sched.attendee);
        }
    }
    return AjxVector.fromArray(attendees);
};

/**
 * sets participant status for an attendee
 *
 * @param sched 		[object]		scedule object which contains info related to this attendee row
 * @param attendee		[object]		attendee object ZmContact/ZmResource
 * @param index 		[Integer]		index of the schedule
 */
ZmFreeBusySchedulerView.prototype._setParticipantStatus =
function(sched, attendee, index) {
    var ptst = attendee.getParticipantStatus() || "NE";
    var ptstCont = sched.ptstObj;
    if (ptstCont) {
        if(this.isComposeMode) {
            var ptstIcon = ZmCalItem.getParticipationStatusIcon(ptst);
            if (ptstIcon != "") {
                var ptstLabel = ZmMsg.attendeeStatusLabel + " " + ZmCalItem.getLabelForParticipationStatus(ptst);
                ptstCont.innerHTML = AjxImg.getImageHtml(ptstIcon);
                var imgDiv = ptstCont.firstChild;
                if(imgDiv && !imgDiv._schedViewPageId ){
                    Dwt.setHandler(imgDiv, DwtEvent.ONMOUSEOVER, ZmFreeBusySchedulerView._onPTSTMouseOver);
                    Dwt.setHandler(imgDiv, DwtEvent.ONMOUSEOUT, ZmFreeBusySchedulerView._onPTSTMouseOut);
                    imgDiv._ptstLabel = ptstLabel;
                    imgDiv._schedViewPageId = this._svpId;
                    imgDiv._schedTableIdx = index;
                }
            }
        }
        else {
            var deleteButton = new DwtBorderlessButton({parent:this, className:"Label"});
            deleteButton.setImage("Trash");
            deleteButton.setText("");
            deleteButton.addSelectionListener(new AjxListener(this, this._deleteAttendeeRow, [attendee.getEmail()]));
            deleteButton.getHtmlElement().style.cursor = 'pointer';
            deleteButton.replaceElement(ptstCont.firstChild, false, false);
        }
    }
};

/**
 * Resets a row to its starting state. The input is cleared and removed, and
 * the free/busy blocks are set back to their default color. Optionally, the
 * select is set back to person.
 *
 * @param sched			[object]		info for this row
 * @param resetSelect	[boolean]*		if true, set select to PERSON
 * @param type			[constant]*		attendee type
 * @param noClear		[boolean]*		if true, don't clear input field
 */
ZmFreeBusySchedulerView.prototype._resetRow =
function(sched, resetSelect, type, noClear) {

	var input = sched.inputObj;
	if (sched.attendee && type) {

        if(this.isComposeMode) {
            this._editView.parent.updateAttendees(sched.attendee, type, ZmApptComposeView.MODE_REMOVE);
            this._editView._setAttendees();
        }

        if (input) {
			input.setToolTipContent(null);
		}
		sched.attendee = null;
	}

	// clear input field
	if (input && !noClear) {
		input.setValue("", true);
	}

	// reset the row color to non-white
	var table = document.getElementById(sched.dwtTableId);
	if (table) {
		table.rows[0].className = "ZmSchedulerDisabledRow";
	}

	// remove the bgcolor from the cells that were colored
	this._clearColoredCells(sched);

	// reset the select to person
	if (resetSelect) {
		var select = AjxCore.objectWithId(sched.selectObjId);
		if (select) {
			select.setSelectedValue(ZmCalBaseItem.PERSON);
            select.setText("");
		}
	}

	sched.uid = null;
	this._activeInputIdx = null;
};

ZmFreeBusySchedulerView.prototype._resetTimezoneSelect =
function(dateInfo) {
	this._tzoneSelect.setSelectedValue(dateInfo.timezone);
};

ZmFreeBusySchedulerView.prototype._setTimezoneVisible =
function(dateInfo) {
	var showTimezone = !dateInfo.isAllDay;
	if (showTimezone) {
		showTimezone = appCtxt.get(ZmSetting.CAL_SHOW_TIMEZONE) ||
					   dateInfo.timezone != AjxTimezone.getServerId(AjxTimezone.DEFAULT);
	}
	Dwt.setVisibility(this._tzoneSelect.getHtmlElement(), showTimezone);
};

ZmFreeBusySchedulerView.prototype._clearColoredCells =
function(sched) {
	while (sched._coloredCells.length > 0) {
		// decrement cell count in all attendees row
		var idx = sched._coloredCells[0].cellIndex;
		if (this._allAttendees[idx] > 0) {
			this._allAttendees[idx] = this._allAttendees[idx] - 1;
		}

		sched._coloredCells[0].className = ZmFreeBusySchedulerView.FREE_CLASS;
		sched._coloredCells.shift();
	}
	var allAttColors = this._allAttendeesSlot._coloredCells;
	while (allAttColors.length > 0) {
		var idx = allAttColors[0].cellIndex;
		// clear all attendees cell if it's now free
		if (this._allAttendees[idx] == 0) {
			allAttColors[0].className = ZmFreeBusySchedulerView.FREE_CLASS;
		}
		allAttColors.shift();
	}
};

ZmFreeBusySchedulerView.prototype._resetAttendeeCount =
function() {
	for (var i = 0; i < ZmFreeBusySchedulerView.FREEBUSY_NUM_CELLS; i++) {
		this._allAttendees[i] = 0;
		delete this._allAttendeesStatus[i];
	}
};

ZmFreeBusySchedulerView.prototype._resetFullDateField =
function() {
};

// Listeners

ZmFreeBusySchedulerView.prototype._navBarListener =
function(ev) {
	var op = ev.item.getData(ZmOperation.KEY_ID);

	var sd = AjxDateUtil.simpleParseDateStr(this._dateInfo.startDate);
	var ed = AjxDateUtil.simpleParseDateStr(this._dateInfo.endDate);

	var newSd = op == ZmOperation.PAGE_BACK ? sd.getDate()-1 : sd.getDate()+1;
	var newEd = op == ZmOperation.PAGE_BACK ? ed.getDate()-1 : ed.getDate()+1;

	sd.setDate(newSd);
	ed.setDate(newEd);

	this._updateFreeBusy();

	// finally, update the appt tab view page w/ new date(s)
	if(this.isComposeMode) this._editView.updateDateField(AjxDateUtil.simpleComputeDateStr(sd), AjxDateUtil.simpleComputeDateStr(ed));
};



ZmFreeBusySchedulerView.prototype.changeDate =
function(dateInfo) {

    this._setDateInfo(dateInfo);
	this._updateFreeBusy();

	// finally, update the appt tab view page w/ new date(s)
	if(this.isComposeMode) this._editView.updateDateField(AjxDateUtil.simpleComputeDateStr(sd), AjxDateUtil.simpleComputeDateStr(ed));
};

ZmFreeBusySchedulerView.prototype.setDateBorder =
function(dateBorder) {
    this._dateBorder = dateBorder;
};
ZmFreeBusySchedulerView.prototype._timeChangeListener =
function(ev, id) {
    if(this.isComposeMode) ZmApptViewHelper.getDateInfo(this._editView, this._dateInfo);
	this._dateBorder = this._getBordersFromDateInfo(this._dateInfo);
	this._outlineAppt();
};

ZmFreeBusySchedulerView.prototype._selectChangeListener =
function(ev) {
	var select = ev._args.selectObj;
	if (!select) return;

    select.setText("");

	var svp = select.parent;
	var type = select.getValue();
	var sched = svp._schedTable[select._schedTableIdx];

    if(type == ZmCalBaseItem.PERSON || type == ZmCalItem.ROLE_REQUIRED || type == ZmCalItem.ROLE_OPTIONAL) {
        if(sched.attendee) {
            sched.attendee.setParticipantRole((type == ZmCalItem.ROLE_OPTIONAL) ? ZmCalItem.ROLE_OPTIONAL : ZmCalItem.ROLE_REQUIRED);
            if(this.isComposeMode) this._editView._setAttendees();
        }
        type = ZmCalBaseItem.PERSON;
    }

	if (sched.attType == type) return;

	// reset row
	var input = sched.inputObj;
	input.setValue("", true);
	svp._clearColoredCells(sched);

	// if we wiped out an attendee, make sure it's reflected in master list
	if (sched.attendee) {
		if(this.isComposeMode) {
            this._editView.parent.updateAttendees(sched.attendee, sched.attType, ZmApptComposeView.MODE_REMOVE);
            this._editView._setAttendees();
        }
		sched.attendee = null;
	}
	sched.attType = type;

	// reset autocomplete handler
	var inputEl = input.getInputElement();
	if (type == ZmCalBaseItem.PERSON && svp._acContactsList) {
		svp._acContactsList.handle(inputEl);
	} else if (type == ZmCalBaseItem.LOCATION && svp._acLocationsList) {
		svp._acLocationsList.handle(inputEl);
	} else if (type == ZmCalBaseItem.EQUIPMENT && svp._acEquipmentList) {
		svp._acEquipmentList.handle(inputEl);
	}
};

ZmFreeBusySchedulerView.prototype._colorSchedule =
function(status, slots, table, sched) {
	var row = table.rows[0];
	var className = this._getClassForStatus(status);

    var currentDate = AjxDateUtil.simpleParseDateStr(this._dateInfo.startDate);

	if (row && className) {
		// figure out the table cell that needs to be colored
		for (var i = 0; i < slots.length; i++) {
			var startIdx = this._getIndexFromTime(slots[i].s);
			var endIdx = this._getIndexFromTime(slots[i].e, true);

            if(slots[i].s <= currentDate.getTime()) {
                startIdx = 0;
            }

            if(slots[i].e >= currentDate.getTime() + AjxDateUtil.MSEC_PER_DAY) {
                endIdx = ZmFreeBusySchedulerView.FREEBUSY_NUM_CELLS - 1;
            }

            //bug:45623 assume start index is zero if its negative
            if(startIdx < 0) {startIdx = 0;}
            //bug:45623 skip the slot that has negative end index.
            if(endIdx < 0) { continue; }

			// normalize
			if (endIdx < startIdx) {
				endIdx = ZmFreeBusySchedulerView.FREEBUSY_NUM_CELLS - 1;
			}

			for (j = startIdx; j <= endIdx; j++) {
				if (row.cells[j]) {
					if (status != ZmFreeBusySchedulerView.STATUS_UNKNOWN) {
						this._allAttendees[j] = this._allAttendees[j] + 1;
						this.updateAllAttendeeCellStatus(j, status);
					}
                    if(row.cells[j].className != ZmFreeBusySchedulerView.FREE_CLASS && status == ZmFreeBusySchedulerView.STATUS_WORKING) {
                        // do not update anything if the status is already changed
                        continue;
                    }
                    sched._coloredCells.push(row.cells[j]);
                    row.cells[j].className = className;
                    row.cells[j]._fbStatus = status;

				}
			}
		}
	}
};

/**
 * Draws a dark border for the appt's start and end times.
 */
ZmFreeBusySchedulerView.prototype._outlineAppt =
function() {
	this._updateBorders(this._allAttendeesSlot, true);
	for (var j = 1; j < this._schedTable.length; j++) {
		this._updateBorders(this._schedTable[j]);
	}
};

/**
 * Outlines the times of the current appt for the given row.
 *
 * @param sched				[sched]			info for this row
 * @param isAllAttendees	[boolean]*		if true, this is the All Attendees row
 */
ZmFreeBusySchedulerView.prototype._updateBorders =
function(sched, isAllAttendees) {
	if (!sched) { return; }

	var div, curClass, newClass;

	// mark right borders of appropriate f/b table cells
	var normalClassName = "ZmSchedulerGridDiv";
	var halfHourClassName = normalClassName + "-halfHour";
	var startClassName = normalClassName + "-start";
	var endClassName = normalClassName + "-end";

	var table = document.getElementById(sched.dwtTableId);
	var row = table.rows[0];
	if (row) {
		for (var i = 0; i < ZmFreeBusySchedulerView.FREEBUSY_NUM_CELLS; i++) {
			var td = row.cells[i];
			div = td ? td.getElementsByTagName("*")[0] : null;
			if (div) {
				curClass = div.className;
				newClass = normalClassName;
				if (i == this._dateBorder.start) {
					newClass = startClassName;
				} else if (i == this._dateBorder.end) {
					newClass = endClassName;
				} else if (i % 2 == 0) {
					newClass = halfHourClassName;
				}
				if (curClass != newClass) {
					div.className = newClass;
				}
			}
		}
	}
};

/**
 * Calculate index of the cell that covers the given time. A start time on a
 * half-hour border covers the corresponding time block, whereas an end time
 * does not. For example, an appt with a start time of 5:00 causes the 5:00 -
 * 5:30 block to be marked. The end time of 5:30 does not cause the 5:30 - 6:00
 * block to be marked.
 *
 * @param time		[Date or int]		time
 * @param isEnd		[boolean]*			if true, this is an appt end time
 * @param adjust	[boolean]*			Specify whether the time should be
 * 										adjusted based on timezone selector. If
 * 										not specified, assumed to be true.
 */
ZmFreeBusySchedulerView.prototype._getIndexFromTime =
function(time, isEnd, adjust) {
	var d = (time instanceof Date) ? time : new Date(time);
	var hourmin = d.getHours() * 60 + d.getMinutes();
	adjust = adjust != null ? adjust : true;
	if (adjust && this._dateInfo.timezone != AjxTimezone.getServerId(AjxTimezone.DEFAULT)) {
		var offset1 = AjxTimezone.getOffset(AjxTimezone.DEFAULT, d);
		var offset2 = AjxTimezone.getOffset(AjxTimezone.getClientId(this._dateInfo.timezone), d);
		hourmin += offset2 - offset1;
	}
	var idx = Math.floor(hourmin / 60) * 2;
	var minutes = hourmin % 60;
	if (minutes >= 30) {
		idx++;
	}
	// end times don't mark blocks on half-hour boundary
	if (isEnd && (minutes == 0 || minutes == 30)) {
		// block even if it exceeds 1 second
		var s = d.getSeconds();
		if (s == 0) {
			idx--;
		}
	}

	return idx;
};

ZmFreeBusySchedulerView.prototype._getBordersFromDateInfo =
function(dateInfo) {
	var index = {start: -99, end: -99};
	if (dateInfo.showTime) {
		var idx = AjxDateUtil.isLocale24Hour() ? 0 : 1;
        var startDate = ZmTimeInput.getDateFromFields(dateInfo.startTimeStr,
													   AjxDateUtil.simpleParseDateStr(dateInfo.startDate));
		var endDate = ZmTimeInput.getDateFromFields(dateInfo.endTimeStr,
													 AjxDateUtil.simpleParseDateStr(dateInfo.endDate));

        // subtract 1 from index since we're marking right borders
		index.start = this._getIndexFromTime(startDate, null, false) - 1;
		if (dateInfo.endDate == dateInfo.startDate) {
			index.end = this._getIndexFromTime(endDate, true, false);
		}
	}
	return index;
};

ZmFreeBusySchedulerView.prototype._getClassForStatus =
function(status) {
	return ZmFreeBusySchedulerView.STATUS_CLASSES[status];
};

ZmFreeBusySchedulerView.prototype._getClassForParticipationStatus =
function(status) {
	return ZmFreeBusySchedulerView.PSTATUS_CLASSES[status];
};

// Callbacks

ZmFreeBusySchedulerView.prototype._handleResponseFreeBusy =
function(result) {
	var args = result.getResponse().GetFreeBusyResponse.usr;

	for (var i = 0; i < args.length; i++) {
		var usr = args[i];

		// first clear out the whole row for this email id
		var sched = this._schedTable[this._emailToIdx[usr.id]];
		var table = sched ? document.getElementById(sched.dwtTableId) : null;
		if (table) {
			table.rows[0].className = "ZmSchedulerNormalRow";

			this._clearColoredCells(sched);
			sched.uid = usr.id;

            // next, for each free/busy status, color the row for given start/end times
			if (usr.n) this._colorSchedule(ZmFreeBusySchedulerView.STATUS_UNKNOWN, usr.n, table, sched);
			if (usr.t) this._colorSchedule(ZmFreeBusySchedulerView.STATUS_TENTATIVE, usr.t, table, sched);
			if (usr.b) this._colorSchedule(ZmFreeBusySchedulerView.STATUS_BUSY, usr.b, table, sched);
			if (usr.u) this._colorSchedule(ZmFreeBusySchedulerView.STATUS_OUT, usr.u, table, sched);
		}
	}
	this._colorAllAttendees();
};

ZmFreeBusySchedulerView.prototype._handleResponseWorking =
function(result) {
	var args = result.getResponse().GetWorkingHoursResponse.usr;

	for (var i = 0; i < args.length; i++) {
		var usr = args[i];

		// first clear out the whole row for this email id
		var sched = this._schedTable[this._emailToIdx[usr.id]];
		var table = sched ? document.getElementById(sched.dwtTableId) : null;
		if (table) {
            sched.uid = usr.id;
            // next, for each free/busy status, color the row for given start/end times
			if (usr.f) this._colorSchedule(ZmFreeBusySchedulerView.STATUS_WORKING, usr.f, table, sched);
		}
	}
	this._colorAllAttendees();
};

ZmFreeBusySchedulerView.prototype.colorAppt =
function(appt, div) {
    var idx = this._emailToIdx[appt.getFolder().getOwner()];
    var sched = this._schedTable[idx];
    var table = sched ? document.getElementById(sched.dwtTableId) : null;
    if (table) {
        table.rows[0].className = "ZmSchedulerNormalRow";

        //this._clearColoredCells(sched);

        var row = table.rows[0];

        var currentDate = AjxDateUtil.simpleParseDateStr(this._dateInfo.startDate);

        if (row) {
            // figure out the table cell that needs to be colored

            var startIdx = this._getIndexFromTime(appt.startDate);
            var endIdx = this._getIndexFromTime(appt.endDate, true);

            if(appt.startDate <= currentDate.getTime()) {
                startIdx = 0;
            }

            if(appt.endDate >= currentDate.getTime() + AjxDateUtil.MSEC_PER_DAY) {
                endIdx = ZmFreeBusySchedulerView.FREEBUSY_NUM_CELLS - 1;
            }

            //bug:45623 assume start index is zero if its negative
            if(startIdx < 0) {startIdx = 0;}
            //bug:45623 skip the slot that has negative end index.
            if(endIdx < 0) { return; }

            // normalize
            if (endIdx < startIdx) {
                endIdx = ZmFreeBusySchedulerView.FREEBUSY_NUM_CELLS - 1;
            }

            var cb = Dwt.getBounds(row.cells[startIdx]),
                pb = Dwt.toWindow(div.parentNode, 0, 0, null, null, new DwtPoint(0, 0)),
                width = (endIdx-startIdx+1)*cb.width;

            Dwt.setBounds(div, cb.x - pb.x + 1, cb.y - pb.y-1, width-2, cb.height-1);            
        }

    }
};

ZmFreeBusySchedulerView.prototype._handleErrorFreeBusy =
function(emailList, result) {
	if (result.code == ZmCsfeException.OFFLINE_ONLINE_ONLY_OP) {
		var emails = emailList.split(",");
		for (var i = 0; i < emails.length; i++) {
			var e = emails[i];
			var sched = this._schedTable[this._emailToIdx[e]];
			var table = sched ? document.getElementById(sched.dwtTableId) : null;
			if (table) {
				table.rows[0].className = "ZmSchedulerNormalRow";
				this._clearColoredCells(sched);
				sched.uid = e;
				var now = new Date();
				var obj = [{s: now.setHours(0,0,0), e:now.setHours(24,0,0)}];
				this._colorSchedule(ZmFreeBusySchedulerView.STATUS_UNKNOWN, obj, table, sched);
			}
		}
	}
	return false;
};

ZmFreeBusySchedulerView.prototype._emailValidator =
function(value) {
	var str = AjxStringUtil.trim(value);
	if (str.length > 0 && !AjxEmailAddress.isValid(value)) {
		throw ZmMsg.errorInvalidEmail;
	}

	return value;
};

ZmFreeBusySchedulerView.prototype._getDefaultFocusItem =
function() {
	for (var i = 0; i < this._schedTable.length; i++) {
		var sched = this._schedTable[i];
		if (sched && sched.inputObj && !sched.inputObj.disabled) {
			return sched.inputObj;
		}
	}
	return null;
};

ZmFreeBusySchedulerView.prototype._getFreeBusyInfo =
function(startTime, emailList, fbCallback, workCallback) {
	var endTime = startTime + AjxDateUtil.MSEC_PER_DAY;
	var errorCallback = new AjxCallback(this, this._handleErrorFreeBusy, emailList);
	this._controller.getFreeBusyInfo(startTime, endTime, emailList, fbCallback, errorCallback);
	this._controller.getWorkingInfo(startTime, endTime, emailList, workCallback, errorCallback);
};

ZmFreeBusySchedulerView.prototype.showFreeBusyToolTip =
function() {
	var fbInfo = this._fbToolTipInfo;
	if (!fbInfo) { return; }

	var sched = fbInfo.sched;
	var cellIndex = fbInfo.index;
	var tableIndex = fbInfo.tableIndex;
	var x = fbInfo.x;
	var y = fbInfo.y;

	var attendee = sched.attendee;
	var table = sched ? document.getElementById(sched.dwtTableId) : null;
	if (attendee) {
		var email = attendee.getEmail();

		var startDate  = new Date(this._getStartTime());
		startDate.setHours(0,0,0,0);
		var startTime = startDate.getTime() +  cellIndex*30*60*1000;
		startDate = new Date(startTime);
		var endTime = startTime + 30*60*1000;
		var endDate = new Date(endTime);

        var row = table.rows[0];
        var cell = row.cells[cellIndex];
        //resolve alias before doing owner mounted calendars search
        var params = {
            startDate: startDate,
            endDate: endDate,
            x: x,
            y: y,
            email: email,
            status: cell._fbStatus
        };
        this.getAccountEmail(params);
	}
	this._fbToolTipInfo = null;
};

ZmFreeBusySchedulerView.prototype.popupFreeBusyToolTop =
function(params) {
    var cc = AjxDispatcher.run("GetCalController");
    var treeController =  cc.getCalTreeController();
    var calendars = treeController ? treeController.getOwnedCalendars(appCtxt.getApp(ZmApp.CALENDAR).getOverviewId(), params.email) : [];
    var tooltipContent = "";
    if(calendars.length == 0) {

        if(!params.status) params.status = ZmFreeBusySchedulerView.STATUS_FREE;

        var fbStatusMsg = [];
        fbStatusMsg[ZmFreeBusySchedulerView.STATUS_FREE]     = ZmMsg.free;
        fbStatusMsg[ZmFreeBusySchedulerView.STATUS_BUSY]     = ZmMsg.busy;
        fbStatusMsg[ZmFreeBusySchedulerView.STATUS_TENTATIVE]= ZmMsg.tentative;
        fbStatusMsg[ZmFreeBusySchedulerView.STATUS_OUT]      = ZmMsg.outOfOffice;
        fbStatusMsg[ZmFreeBusySchedulerView.STATUS_UNKNOWN]  = ZmMsg.unknown;
        fbStatusMsg[ZmFreeBusySchedulerView.STATUS_WORKING]  = ZmMsg.free;

        tooltipContent = "<b>" + ZmMsg.statusLabel + " " + fbStatusMsg[params.status] + "</b>";
    }else {
        tooltipContent = cc.getUserStatusToolTipText(params.startDate, params.endDate, true, params.email);
    }
    var shell = DwtShell.getShell(window);
    var tooltip = shell.getToolTip();
    tooltip.setContent(tooltipContent, true);
    tooltip.popup(params.x, params.y, true);
};

//bug: 30989 - getting proper email address from alias
ZmFreeBusySchedulerView.prototype.getAccountEmail =
function(params) {

    if(this._emailAliasMap[params.email]) {
        params.email = this._emailAliasMap[params.email];
        this.popupFreeBusyToolTop(params);
        return;
    }

    var soapDoc = AjxSoapDoc.create("GetAccountInfoRequest", "urn:zimbraAccount", null);
    var elBy = soapDoc.set("account", params.email);
    elBy.setAttribute("by", "name");

    var callback = new AjxCallback(this, this._handleGetAccountInfo, [params]);
    var errorCallback = new AjxCallback(this, this._handleGetAccountInfoError, [params]);
    appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true, callback: callback, errorCallback:errorCallback});
};

ZmFreeBusySchedulerView.prototype._handleGetAccountInfo =
function(params, result) {
    var response = result.getResponse();
    var getAccInfoResponse = response.GetAccountInfoResponse;
    var accountName = (getAccInfoResponse && getAccInfoResponse.name) ? getAccInfoResponse.name : null;
    if(accountName) {
        this._emailAliasMap[params.email] = accountName;
    }
    params.email = accountName || params.email;
    this.popupFreeBusyToolTop(params);
};

ZmFreeBusySchedulerView.prototype._handleGetAccountInfoError =
function(params, result) {
    var email = params.email;
	//ignore the error : thrown for external email ids
	this._emailAliasMap[email] = email;
	this.popupFreeBusyToolTop(params);
	return true;
};

// Static methods

ZmFreeBusySchedulerView._onClick =
function(ev) {
	var el = DwtUiEvent.getTarget(ev);
	var svp = AjxCore.objectWithId(el._schedViewPageId);
	if (!svp) { return; }
};

ZmFreeBusySchedulerView._onFocus =
function(ev) {
	var el = DwtUiEvent.getTarget(ev);
	var svp = AjxCore.objectWithId(el._schedViewPageId);
	if (!svp) { return; }

	var sched = svp._schedTable[el._schedTableIdx];
	if (sched) {
		svp._activeInputIdx = el._schedTableIdx;
	}
};

ZmFreeBusySchedulerView._onBlur =
function(ev) {
	var el = DwtUiEvent.getTarget(ev);
	var svp = AjxCore.objectWithId(el._schedViewPageId);
	if (!svp) { return; }

    svp._handleAttendeeField(el);
};

ZmFreeBusySchedulerView._onPTSTMouseOver =
function(ev) {
	ev = DwtUiEvent.getEvent(ev);
	var el = DwtUiEvent.getTarget(ev);
	var svp = AjxCore.objectWithId(el._schedViewPageId);
	if (!svp) return;
	var sched = svp._schedTable[el._schedTableIdx];
	if (sched) {
		var shell = DwtShell.getShell(window);
		var tooltip = shell.getToolTip();
		tooltip.setContent(el._ptstLabel, true);
		tooltip.popup((ev.pageX || ev.clientX), (ev.pageY || ev.clientY), true);
	}
};

ZmFreeBusySchedulerView._onPTSTMouseOut =
function(ev) {
	ev = DwtUiEvent.getEvent(ev);
	var el = DwtUiEvent.getTarget(ev);
	var svp = AjxCore.objectWithId(el._schedViewPageId);
	if (!svp) { return; }

	var sched = svp._schedTable[el._schedTableIdx];
	if (sched) {
		var shell = DwtShell.getShell(window);
		var tooltip = shell.getToolTip();
		tooltip.popdown();
	}
};

ZmFreeBusySchedulerView._onFreeBusyMouseOver =
function(ev) {
	ev = DwtUiEvent.getEvent(ev);
	var fbDiv = DwtUiEvent.getTarget(ev);
	if (!fbDiv) { return; }

	var svp = AjxCore.objectWithId(fbDiv._schedViewPageId);
	if (!svp) { return; }

	var sched = svp._schedTable[fbDiv._schedTableIdx];
	var cellIndex = fbDiv._freeBusyCellIndex;

	if (svp && sched) {
		svp._fbToolTipInfo = {
			x: (ev.pageX || ev.clientX),
			y: (ev.pageY || ev.clientY),
			el: fbDiv,
			sched: sched,
			index: cellIndex,
			tableIndex: fbDiv._schedTableIdx
		};
		//avoid redundant request to server
		AjxTimedAction.scheduleAction(new AjxTimedAction(svp, svp.showFreeBusyToolTip), 1000);
	}
};

ZmFreeBusySchedulerView._onFreeBusyMouseOut =
function(ev) {
	ev = DwtUiEvent.getEvent(ev);

	var el = DwtUiEvent.getTarget(ev);
	var svp = AjxCore.objectWithId(el._schedViewPageId);
	if (!svp) { return; }

	svp._fbToolTipInfo = null;
	var sched = svp._schedTable[el._schedTableIdx];
	if (sched) {
		var shell = DwtShell.getShell(window);
		var tooltip = shell.getToolTip();
		tooltip.popdown();
	}
};

ZmFreeBusySchedulerView.prototype.updateAllAttendeeCellStatus =
function(idx, status) {
	if (!this._allAttendeesStatus[idx]) {
		this._allAttendeesStatus[idx] = status;
	} else if (status!= this._allAttendeesStatus[idx]) {
		if (status != ZmFreeBusySchedulerView.STATUS_UNKNOWN &&
			status != ZmFreeBusySchedulerView.STATUS_FREE)
		{
			this._allAttendeesStatus[idx] = ZmFreeBusySchedulerView.STATUS_BUSY;;
		}
	}
};

ZmFreeBusySchedulerView.prototype.getAllAttendeeStatus =
function(idx) {
	return this._allAttendeesStatus[idx] ? this._allAttendeesStatus[idx] : ZmFreeBusySchedulerView.STATUS_FREE;
};


ZmFreeBusySchedulerView.prototype.enablePartcipantStatusColumn =
function(show) {
    for(var i in this._schedTable) {
        var sched = this._schedTable[i];
        if(sched && sched.ptstObj) {
            Dwt.setVisible(sched.ptstObj, show);
        }else if(i == this._organizerIndex) {
            var ptstObj = document.getElementById(sched.dwtNameId+"_ptst");
            Dwt.setVisible(ptstObj, show);
        }
    }
};

ZmFreeBusySchedulerView.prototype.enableAttendees =
function(enable) {
  for(var i in this._schedTable) {
      var sched = this._schedTable[i];
      if(sched) {
          if(sched.inputObj) {
            sched.inputObj.setEnabled(enable);
          }
          if(sched.selectObj) {
            sched.selectObj.setEnabled(enable);
          }
      }
  }
};