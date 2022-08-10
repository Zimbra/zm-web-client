/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
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
ZmFreeBusySchedulerView = function(parent, attendees, controller, dateInfo, appt, fbParentCallback) {

	DwtComposite.call(this, {
		parent: parent,
		posStyle: DwtControl.RELATIVE_STYLE,
		className: 'ZmFreeBusySchedulerView'
	});

	this._attendees  = attendees;
	this._controller = controller;
	this._dateInfo   = dateInfo;
	this._appt       = appt;
	this._fbParentCallback = fbParentCallback;

	this._editView = parent;

	this._rendered = false;
	this._emailToIdx = {};
	this._schedTable = [];
	this._autoCompleteHandled = {};
	this._allAttendees = [];
	this._allAttendeesStatus = [];
	this._allAttendeesSlot = null;
    this._sharedCalIds = {};
    
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
    this._resultsPaginated = true;
    this._isPageless = false;

    this._fbConflict = {};

    //this._fbCache = controller.getApp().getFreeBusyCache();
    this._fbCache = parent.getFreeBusyCache();
};

ZmFreeBusySchedulerView.prototype = new DwtComposite;
ZmFreeBusySchedulerView.prototype.constructor = ZmFreeBusySchedulerView;

ZmFreeBusySchedulerView.prototype.isZmFreeBusySchedulerView = true;
ZmFreeBusySchedulerView.prototype.toString = function() { return "ZmFreeBusySchedulerView"; };


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

ZmFreeBusySchedulerView.ROLE_OPTIONS = {};

ZmFreeBusySchedulerView.ROLE_OPTIONS[ZmCalBaseItem.PERSON]          = { label: ZmMsg.requiredAttendee, 			value: ZmCalBaseItem.PERSON, 	        image: "AttendeesRequired" };
ZmFreeBusySchedulerView.ROLE_OPTIONS[ZmCalItem.ROLE_OPTIONAL]       = { label: ZmMsg.optionalAttendee, 			value: ZmCalItem.ROLE_OPTIONAL, 	image: "AttendeesOptional" };
ZmFreeBusySchedulerView.ROLE_OPTIONS[ZmCalBaseItem.LOCATION]        = { label: ZmMsg.location, 			        value: ZmCalBaseItem.LOCATION, 	        image: "Location" };
ZmFreeBusySchedulerView.ROLE_OPTIONS[ZmCalBaseItem.EQUIPMENT]       = { label: ZmMsg.equipmentAttendee, 			value: ZmCalBaseItem.EQUIPMENT, 	    image: "Resource" };

// Hold on to this one separately because we use it often
ZmFreeBusySchedulerView.FREE_CLASS = ZmFreeBusySchedulerView.STATUS_CLASSES[ZmFreeBusySchedulerView.STATUS_FREE];

ZmFreeBusySchedulerView.DELAY = 200;
ZmFreeBusySchedulerView.BATCH_SIZE = 25;

ZmFreeBusySchedulerView._VALUE = "value";

// Public methods

ZmFreeBusySchedulerView.prototype.setComposeMode =
function(isComposeMode) {
	this.isComposeMode = isComposeMode;
};

ZmFreeBusySchedulerView.prototype.showMe =
function() {

    if(this.composeMode) ZmApptViewHelper.getDateInfo(this._editView, this._dateInfo);

	this._dateBorder = this._getBordersFromDateInfo();

	if (!this._rendered) {
		this._initialize();
	}

    var organizer;
    if(this.isComposeMode) {
        organizer = this._isProposeTime ? this._editView.getCalItemOrganizer() : this._editView.getOrganizer();
    }else {
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
};

ZmFreeBusySchedulerView.prototype.update =
function(dateInfo, organizer, attendees) {
	this._updateAttendees(organizer, attendees);
    this.updateFreeBusy();
	this._outlineAppt();
};

ZmFreeBusySchedulerView.prototype.cleanup =
function() {
	if (!this._rendered) return;

    if(this._timedActionId)  {
        AjxTimedAction.cancelAction(this._timedActionId);
        this._timedActionId = null;
    }

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
    this._emptyRowIndex = null;
    this._autoCompleteHandled = {}

    this._fbConflict = {};
};

// Private / protected methods

ZmFreeBusySchedulerView.prototype._initialize =
function() {
	this._createHTML();
	this._initAutocomplete();
	this._createDwtObjects();
	this._resetAttendeeCount();

    //intialize a single common event mouseover/out handler for optimization
    Dwt.setHandler(this.getHtmlElement(), DwtEvent.ONMOUSEOVER, ZmFreeBusySchedulerView._onFreeBusyMouseOver);
    Dwt.setHandler(this.getHtmlElement(), DwtEvent.ONMOUSEOUT, ZmFreeBusySchedulerView._onFreeBusyMouseOut);


    Dwt.setHandler(this._showMoreLink, DwtEvent.ONCLICK, ZmFreeBusySchedulerView._onShowMore);


	this._rendered = true;
};

ZmFreeBusySchedulerView.prototype._createHTML =
function() {
	this._navToolbarId		= this._htmlElId + "_navToolbar";
	this._attendeesTableId	= this._htmlElId + "_attendeesTable";
	this._showMoreLinkId	= this._htmlElId + "_showMoreLink";

	this._schedTable[0] = null;	// header row has no attendee data

	var subs = { id:this._htmlElId, isAppt: true, showTZSelector: appCtxt.get(ZmSetting.CAL_SHOW_TIMEZONE) };
	this.getHtmlElement().innerHTML = AjxTemplate.expand("calendar.Appointment#InlineScheduleView", subs);
};

ZmFreeBusySchedulerView.prototype._initAutocomplete =
function() {

	var acCallback = this._autocompleteCallback.bind(this);
	var keyUpCallback = this._autocompleteKeyUpCallback.bind(this);
	this._acList = {};

	// autocomplete for attendees
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED) || appCtxt.get(ZmSetting.GAL_ENABLED)) {
		var params = {
			dataClass:		appCtxt.getAutocompleter(),
			separator:		"",
			options:		{needItem: true},
			matchValue:		[ZmAutocomplete.AC_VALUE_NAME, ZmAutocomplete.AC_VALUE_EMAIL],
			keyUpCallback:	keyUpCallback,
			compCallback:	acCallback
		};
		params.contextId = [this._controller.getCurrentViewId(), this.toString(), ZmCalBaseItem.PERSON].join("-");
		this._acContactsList = new ZmAutocompleteListView(params);
		this._acList[ZmCalBaseItem.PERSON] = this._acContactsList;

		// autocomplete for locations/equipment
		if (appCtxt.get(ZmSetting.GAL_ENABLED)) {
			params.options = {type:ZmAutocomplete.AC_TYPE_LOCATION};
			params.contextId = [this._controller.getCurrentViewId(), this.toString(), ZmCalBaseItem.LOCATION].join("-");
			this._acLocationsList = new ZmAutocompleteListView(params);
			this._acList[ZmCalBaseItem.LOCATION] = this._acLocationsList;

			params.options = {type:ZmAutocomplete.AC_TYPE_EQUIPMENT};
			params.contextId = [this._controller.getCurrentViewId(), this.toString(), ZmCalBaseItem.EQUIPMENT].join("-");
			this._acEquipmentList = new ZmAutocompleteListView(params);
			this._acList[ZmCalBaseItem.EQUIPMENT] = this._acEquipmentList;
		}
	}
};

// Add the attendee, then create a new empty slot since we've now filled one.
ZmFreeBusySchedulerView.prototype._autocompleteCallback =
function(text, el, match) {
    if(match && match.fullAddress) {
        el.value = match.fullAddress;
    }
	if (match && match.item) {
		if (match.item.isGroup && match.item.isGroup()) {
			var members = match.item.getGroupMembers().good.getArray();
			for (var i = 0; i < members.length; i++) {
				el.value = members[i].address;

                if(el._acHandlerInProgress) { return; }
                el._acHandlerInProgress = true;
				var index = this._handleAttendeeField(el);
                this._editView.showConflicts();
                el._acHandlerInProgress = false;

				if (index && ((i+1) < members.length)) {
					el = this._schedTable[index].inputObj.getInputElement();
				}
			}
		} else {
            if(el._acHandlerInProgress) { return; }
            el._acHandlerInProgress = true;
			this._handleAttendeeField(el, match.item);
            this._editView.showConflicts();
            el._acHandlerInProgress = false;
		}
	}
};

// Enter listener. If the user types a return when no autocomplete list is showing,
// then go ahead and add a new empty slot.
ZmFreeBusySchedulerView.prototype._autocompleteKeyUpCallback =
function(ev, aclv, result) {
	var key = DwtKeyEvent.getCharCode(ev);
	if (DwtKeyEvent.IS_RETURN[key] && !aclv.getVisible()) {
		var el = DwtUiEvent.getTargetWithProp(ev, "id");
        if(el._acHandlerInProgress) { return; }
        el._acHandlerInProgress = true;
        this._handleAttendeeField(el);
        this._editView.showConflicts();
        el._acHandlerInProgress = false;
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

ZmFreeBusySchedulerView.prototype._deleteAttendeeEntry =
function(email) {
    var index = this._emailToIdx[email];
    if(!index) {
        return;
    }
    delete this._emailToIdx[email];
    Dwt.setDisplay(this._attendeesTable.rows[index], 'none');
    this._schedTable[index] = null;
};

ZmFreeBusySchedulerView.prototype._hideRow =
function(index) {
    Dwt.setDisplay(this._attendeesTable.rows[index], 'none');
};

ZmFreeBusySchedulerView.prototype._deleteAttendeeRow =
function(email) {
    this._deleteAttendeeEntry(email);

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

	this._dateBorder = this._getBordersFromDateInfo();

	var data = {
		id: dwtId,
		sched: sched,
		isAllAttendees: isAllAttendees,
		organizer: organizer,
		cellCount: ZmFreeBusySchedulerView.FREEBUSY_NUM_CELLS,
        isComposeMode: this.isComposeMode,
        dateBorder: this._dateBorder
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
		var button;
		var btnId = sched.dwtSelectId;
		var btnDiv = document.getElementById(btnId);
		if (this.isComposeMode && btnDiv) {
            button  = new DwtButton({parent: this, parentElement: btnId, className: 'ZAttRole'});
            button.setText("");
            button.setImage("AttendeesRequired");
            button.setMenu(new AjxListener(this, this._getAttendeeRoleMenu, [index]));
            sched.btnObj = button;
		}
		// add DwtInputField
		var nameDiv = document.getElementById(sched.dwtNameId);
		if (nameDiv) {
			var dwtInputField = new DwtInputField({parent: this, type: DwtInputField.STRING, maxLen: 256});
			dwtInputField.setDisplay(Dwt.DISPLAY_INLINE);
			var inputEl = dwtInputField.getInputElement();
            Dwt.setSize(inputEl, Dwt.DEFAULT, "2rem")
			inputEl.className = "ZmSchedulerInput";
			inputEl.id = sched.dwtInputId;
            inputEl.style.border = "0px";
			sched.attType = inputEl._attType = ZmCalBaseItem.PERSON;
			sched.inputObj = dwtInputField;
			if (button) {
				button.dwtInputField = dwtInputField;
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

ZmFreeBusySchedulerView.prototype._getAttendeeRoleMenu =
function(index) {
    var sched = this._schedTable[index];
    var listener = new AjxListener(this, this._attendeeRoleListener, [index]);
    var menu = new DwtMenu({parent:sched.btnObj});
    for(var i in ZmFreeBusySchedulerView.ROLE_OPTIONS) {
        var info = ZmFreeBusySchedulerView.ROLE_OPTIONS[i];
        var menuItem = new DwtMenuItem({parent:menu, style:DwtMenuItem.CASCADE_STYLE});
        menuItem.setImage(info.image);
        menuItem.setText(info.label);
        menuItem.setData(ZmOperation.MENUITEM_ID, i);
        menuItem.addSelectionListener(listener);
    }
    return menu;
};

ZmFreeBusySchedulerView.prototype._attendeeRoleListener =
function(index, ev) {
    var item = ev.dwtObj;
    var data = item.getData(ZmOperation.MENUITEM_ID);
    var sched = this._schedTable[index];
    sched.btnObj.setImage(ZmFreeBusySchedulerView.ROLE_OPTIONS[data].image);
    sched.btnObj.getMenu().popdown();
    this._handleRoleChange(sched, data, this);
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
	this._showMoreLink = document.getElementById(this._showMoreLinkId);
    this._showMoreLink._schedViewPageId = this._svpId;
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
            var lookupEmail = this.getEmail(curAttendee);
            var emailTextShortForm = ZmApptViewHelper.getAttendeesText(curAttendee, type, true);
            //parse the email id to separate the name and email address
            var emailAddrObj = AjxEmailAddress.parse(value);
            var emailAddr = emailAddrObj ? emailAddrObj.getAddress() : "";
			if (emailAddr == lookupEmail || emailAddr == emailTextShortForm) {
				return;
			} else {
				this._resetRow(sched, false, type, true);
			}
		}
		attendee = attendee ? attendee : ZmApptViewHelper.getAttendeeFromItem(value, type, true);
		if (attendee) {
			var email = this.getEmail(attendee);


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
				this._getFreeBusyInfo(this._getStartTime(), email);
			}
            var attendeeType = sched.btnObj ? sched.btnObj.getData(ZmFreeBusySchedulerView._VALUE) : null;
            var isOptionalAttendee = (attendeeType == ZmCalItem.ROLE_OPTIONAL);
            if(type != ZmCalBaseItem.LOCATION && type != ZmCalBaseItem.EQUIPMENT) {
                attendee.setParticipantRole( isOptionalAttendee ? ZmCalItem.ROLE_OPTIONAL : ZmCalItem.ROLE_REQUIRED);
            }
			sched.attendee = attendee;
            this._setParticipantStatus(sched, attendee, idx);
			this._setAttendeeToolTip(sched, attendee);
            //directly update attendees
			if(this.isComposeMode) {
                this._editView.parent.updateAttendees(attendee, type, ZmApptComposeView.MODE_ADD);
                if(isOptionalAttendee) this._editView.showOptional();
                this._editView._setAttendees();
            }
            else {
                this._editView.setMetadataAttendees(this._schedTable[this._organizerIndex].attendee, email);
                this._editView.refreshAppts();
            }
            if (!curAttendee) {
				// user added attendee in empty slot
				var value = this._emptyRowIndex = this._addAttendeeRow(false, null, true, null, true, true); // add new empty slot
                if (this.isComposeMode) {
                    this._editView.resize();
                }
                return value;
			}
		} else {
			this._activeInputIdx = null;
		}
	} else if (curAttendee) {

        if(this.isComposeMode) {
            this._editView.parent.updateAttendees(curAttendee, type, ZmApptComposeView.MODE_REMOVE);
            this._editView.removeAttendees(curAttendee, type);
            this._editView._setAttendees();
        }
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
	var email = this.getEmail(attendee);
	if (name && email) {
		var ptst = ZmMsg.attendeeStatusLabel + ZmCalItem.getLabelForParticipationStatus(attendee.getParticipantStatus() || "NE");
		sched.inputObj.setToolTipContent(email + (this.isComposeMode && this._editView.getRsvp()) ? ("<br>"+ ptst) : "");
	}
};

ZmFreeBusySchedulerView.prototype._getStartTime =
function() {
	return this._getStartDate().getTime();
};

ZmFreeBusySchedulerView.prototype._getEndTime =
function() {
	return this._getEndDate().getTime();
};

ZmFreeBusySchedulerView.prototype._getStartDate =
function() {
    var startDate = AjxDateUtil.simpleParseDateStr(this._dateInfo.startDate);
    return AjxTimezone.convertTimezone(startDate, this._dateInfo.timezone, AjxTimezone.DEFAULT);
};

ZmFreeBusySchedulerView.prototype._getEndDate =
function() {
    var endDate = AjxDateUtil.simpleParseDateStr(this._dateInfo.endDate);
    return AjxTimezone.convertTimezone(endDate, this._dateInfo.timezone, AjxTimezone.DEFAULT);
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

ZmFreeBusySchedulerView.prototype.updateFreeBusy =
function(onlyUpdateTable) {
    this._updateFreeBusy();
};

ZmFreeBusySchedulerView.prototype._updateFreeBusy =
function() {
	// update the full date field
	this._resetFullDateField();

	// clear the schedules for existing attendees
	for (var i = 0; i < this._schedTable.length; i++) {
		var sched = this._schedTable[i];
		if (!sched) continue;
		while (sched._coloredCells && sched._coloredCells.length > 0) {
			sched._coloredCells[0].className = ZmFreeBusySchedulerView.FREE_CLASS;
			sched._coloredCells.shift();
		}

	}

	this._resetAttendeeCount();

    // Set in updateAttendees
	if (this._allAttendeeEmails && this._allAttendeeEmails.length) {
        //all attendees status need to be update even for unshown attendees
		var emails = this._allAttendeeEmails.join(",");
		this._getFreeBusyInfo(this._getStartTime(), emails);
	}
};

// XXX: optimize later - currently we always update the f/b view :(
ZmFreeBusySchedulerView.prototype._setAttendees =
function(organizer, attendees) {
	this.cleanup();

    //sync with date info from schedule view
    if(this.isComposeMode) ZmApptViewHelper.getDateInfo(this._editView, this._dateInfo);

    var emails = [], email, showMoreLink = false;

	// create a slot for the organizer
	this._organizerIndex = this._addAttendeeRow(false, ZmApptViewHelper.getAttendeesText(organizer, ZmCalBaseItem.PERSON, true), false);
	emails.push(this._setAttendee(this._organizerIndex, organizer, ZmCalBaseItem.PERSON, true));

    var list = [], totalAttendeesCount = 0;
    for (var t = 0; t < this._attTypes.length; t++) {
        var type = this._attTypes[t];
        if(attendees[type]) {
            var att = attendees[type].getArray ? attendees[type].getArray() : attendees[type];
            var attLength = att.length;
            totalAttendeesCount += att.length;
            if(this.isComposeMode && !this._isPageless && att.length > 10) {
                attLength = 10;
                showMoreLink = true;
            }

            for (var i = 0; i < attLength; i++) {
                list.push(att[i]);
                email = att[i] ? this.getEmail(att[i]) : null;
                emails.push(email);
            }
        }
    }

    Dwt.setDisplay(this._showMoreLink, showMoreLink ? Dwt.DISPLAY_INLINE : Dwt.DISPLAY_NONE);
    //exclude organizer while reporting no of attendees remaining
    this.updateNMoreAttendeesLabel(totalAttendeesCount - (emails.length - 1));

    this._updateBorders(this._allAttendeesSlot, true);
    
    //chunk processing of UI rendering
    this.batchUpdate(list);

    if (emails.length) {
        //all attendees status need to be update even for unshown attendees
        var allAttendeeEmails = this._allAttendeeEmails = this.getAllAttendeeEmails(attendees, organizer);
        this._getFreeBusyInfo(this._getStartTime(), allAttendeeEmails.join(","));
	}
};

ZmFreeBusySchedulerView.prototype.batchUpdate =
function(list, updateCycle) {

    if(list.length == 0) {
        // make sure there's always an empty slot
        this._emptyRowIndex = this._addAttendeeRow(false, null, false, null, true, false);
        this._colorAllAttendees();
        this.resizeKeySpacer();
        return;
    }

    if(!updateCycle) updateCycle = 0;

    var isOrganizer = this.isComposeMode ? this._appt.isOrganizer() : null;
    var emails = [], type;

    for(var i=0; i < ZmFreeBusySchedulerView.BATCH_SIZE; i++) {
        if(list.length == 0) break;
        var att = list.shift();
        type = (att instanceof ZmResource) ? att.resType : ZmCalBaseItem.PERSON;
        this.addAttendee(att, type, isOrganizer, emails);
    }
    
    if (this.isComposeMode) {
        this._editView.resize();
    }
    this.batchUpdateSequence(list, updateCycle+1);
};

ZmFreeBusySchedulerView.prototype.batchUpdateSequence =
function(list,updateCycle) {
    this._timedAction = new AjxTimedAction(this, this.batchUpdate, [list, updateCycle]);
    this._timedActionId = AjxTimedAction.scheduleAction(this._timedAction, ZmFreeBusySchedulerView.DELAY);
};

ZmFreeBusySchedulerView.prototype.addAttendee =
function(att, type, isOrganizer, emails) {
    var email = att ? this.getEmail(att) : null;
    if (email && !this._emailToIdx[email]) {
        var index = this._addAttendeeRow(false, null, false); // create a slot for this attendee
        emails.push(this._setAttendee(index, att, type, false));

        var sched = this._schedTable[index];
        if(this._appt && sched) {
            if(sched.inputObj) sched.inputObj.setEnabled(isOrganizer);
            if(sched.btnObj) sched.btnObj.setEnabled(isOrganizer);
        }
    }
};

ZmFreeBusySchedulerView.prototype.setUpdateCallback =
function(callback) {
    this._updateCallback = callback;
};

ZmFreeBusySchedulerView.prototype.postUpdateHandler =
function() {
    this._colorAllAttendees();
    if(this._updateCallback) {
        this._updateCallback.run();
        this._updateCallback = null;
    }
};


ZmFreeBusySchedulerView.prototype.getAllAttendeeEmails =
function(attendees, organizer) {
    var emails = [];
    for (var t = 0; t < this._attTypes.length; t++) {
        var type = this._attTypes[t];
        var att = attendees[type].getArray ? attendees[type].getArray() : attendees[type];
        var attLength = att.length;
        for (var i = 0; i < attLength; i++) {
            var email = att[i] ? this.getEmail(att[i]) : null;
            if (email) emails.push(email);
        }
    }
    if(organizer) {
        var organizerEmail =  this.getEmail(organizer);
        emails.push(organizerEmail);
    }
    return emails;
};

ZmFreeBusySchedulerView.prototype._updateAttendees =
function(organizer, attendees) {

    var emails = [], newEmails = {}, showMoreLink = false, totalAttendeesCount = 0, attendeesRendered = 0;

    //update newly added attendee
	for (var t = 0; t < this._attTypes.length; t++) {
		var type = this._attTypes[t];
        if(attendees[type]) {
            var att = attendees[type].getArray ? attendees[type].getArray() : attendees[type];

            //debug: remove this limitation
            var attLengthLimit = att.length;
            totalAttendeesCount += att.length;
            if(this.isComposeMode && !this._isPageless && att.length > 10) {
                attLengthLimit = 10;
                showMoreLink = true;
            }

            for (var i = 0; i < att.length; i++) {
                var email = att[i] ? this.getEmail(att[i]) : null;
                if(email) newEmails[email] = true;
                if (i < attLengthLimit && email && !this._emailToIdx[email]) {
                    var index;
                    if(this._emptyRowIndex != null) {
                        emails.push(this._setAttendee(this._emptyRowIndex, att[i], type, false));
                        this._emptyRowIndex = null;
                    }else {
                        index = this._addAttendeeRow(false, null, false); // create a slot for this attendee
                        emails.push(this._setAttendee(index, att[i], type, false));
                    }
                }

                //keep track of total attendees rendered
                if (this._emailToIdx[email]) attendeesRendered++;
            }
        }
	}

    Dwt.setDisplay(this._showMoreLink, showMoreLink ? Dwt.DISPLAY_INLINE : Dwt.DISPLAY_NONE);
    this.updateNMoreAttendeesLabel(totalAttendeesCount - attendeesRendered);

    //update deleted attendee
    for(var id in this._emailToIdx) {
        if(!newEmails[id]) {
            var idx = this._emailToIdx[id];
            if(this._organizerIndex == idx) continue;
            var sched = this._schedTable[idx];
            if(!sched) continue;
            this._resetRow(sched, false, sched.attType, false, true);
            this._hideRow(idx);
            this._schedTable[idx] = null;
        }
    }

    this._setAttendee(this._organizerIndex, organizer, ZmCalBaseItem.PERSON, true);

    if(emails.length > 0) {
	    // make sure there's always an empty slot
	    this._emptyRowIndex = this._addAttendeeRow(false, null, false, null, true, false);
    }

    // Update the attendee list
    this._allAttendeeEmails = this.getAllAttendeeEmails(attendees, organizer);
	if (emails.length) {
        //all attendees status need to be update even for unshown attendees
        var allAttendeeEmails =  this._allAttendeeEmails;
		this._getFreeBusyInfo(this._getStartTime(), allAttendeeEmails.join(","));
	}else {
        this.postUpdateHandler();
    }
};

ZmFreeBusySchedulerView.prototype.updateNMoreAttendeesLabel =
function(count) {
    this._showMoreLink.innerHTML = AjxMessageFormat.format(ZmMsg.moreAttendees, count);
};

ZmFreeBusySchedulerView.prototype._setAttendee =
function(index, attendee, type, isOrganizer) {
	var sched = this._schedTable[index];
	if (!sched) { return; }

	sched.attendee = attendee;
	sched.attType = type;
	var input = sched.inputObj;
	if (input) {
		input.setValue(ZmApptViewHelper.getAttendeesText(attendee, type, false), true);
		this._setAttendeeToolTip(sched, attendee, type);
	}

    var nameDiv = document.getElementById(sched.dwtNameId);
    if(isOrganizer && nameDiv) {
        nameDiv.innerHTML = '<div class="ZmSchedulerInputDisabled">' + ZmApptViewHelper.getAttendeesText(attendee, type, true) + '</div>';
    }

    var button = sched.btnObj;
    var role = attendee.getParticipantRole() || ZmCalItem.ROLE_REQUIRED;

    if(type == ZmCalBaseItem.PERSON && role == ZmCalItem.ROLE_OPTIONAL) {
        type = ZmCalItem.ROLE_OPTIONAL;
    }

	if (button) {
        var info = ZmFreeBusySchedulerView.ROLE_OPTIONS[type];
        button.setImage(info.image);
        button.setData(ZmFreeBusySchedulerView._VALUE, type);
	}

    this._setParticipantStatus(sched, attendee, index);
    
	var email = this.getEmail(attendee);
	if (email instanceof Array) {
        sched.uid = email[0];
		for (var i in email) {
			this._emailToIdx[email[i]] = index;
		}
	} else {
        sched.uid = email;
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
            deleteButton.setImage("Disable");
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
 * @param noUpdate		[boolean]*		if true, don't update parent view
 */
ZmFreeBusySchedulerView.prototype._resetRow =
function(sched, resetRole, type, noClear, noUpdate) {

	var input = sched.inputObj;
	if (sched.attendee && type) {

        if(this.isComposeMode && !noUpdate) {
            this._editView.parent.updateAttendees(sched.attendee, type, ZmApptComposeView.MODE_REMOVE);
            this._editView._setAttendees();
        }

        if (input) {
			input.setToolTipContent(null);
		}

        var email = this.getEmail(sched.attendee);
        delete this._fbConflict[email];

        if (email instanceof Array) {
            for (var i in email) {
                var m = email[i];
                this._emailToIdx[m] = null;
                delete this._emailToIdx[m];
            }
        } else {
            this._emailToIdx[email] = null;
            delete this._emailToIdx[email];
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
	if (resetRole) {
		var button = sched.btnObj;
		if (button) {
            var info = ZmFreeBusySchedulerView.ROLE_OPTIONS[ZmCalBaseItem.PERSON];
			button.setImage(info.image);
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
    this.handleTimeChange();
};

ZmFreeBusySchedulerView.prototype.handleTimeChange =
function() {
    if(this.isComposeMode) ZmApptViewHelper.getDateInfo(this._editView, this._dateInfo);
	this._dateBorder = this._getBordersFromDateInfo();
	this._outlineAppt();
    this._updateFreeBusy();
};

ZmFreeBusySchedulerView.prototype._handleRoleChange =
function(sched, type, svp) {

    if(type == ZmCalBaseItem.PERSON || type == ZmCalItem.ROLE_REQUIRED || type == ZmCalItem.ROLE_OPTIONAL) {
        if(sched.attendee) {
            sched.attendee.setParticipantRole((type == ZmCalItem.ROLE_OPTIONAL) ? ZmCalItem.ROLE_OPTIONAL : ZmCalItem.ROLE_REQUIRED);
            if(this.isComposeMode) {
                this._editView._setAttendees();
                this._editView.updateScheduleAssistant(this._attendees[ZmCalBaseItem.PERSON], ZmCalBaseItem.PERSON);
                if(type == ZmCalItem.ROLE_OPTIONAL) this._editView.showOptional();  
            }
        }
        type = ZmCalBaseItem.PERSON;
    }

	if (sched.attType == type) return;

    var attendee = sched.attendee;

	// if we wiped out an attendee, make sure it's reflected in master list
	if (attendee) {

        var email = this.getEmail(attendee);
        delete this._emailToIdx[email];
        delete this._fbConflict[email];
        this._editView.showConflicts();

		if(this.isComposeMode) {
            this._editView.parent.updateAttendees(attendee, sched.attType, ZmApptComposeView.MODE_REMOVE);
            this._editView._setAttendees();
            if(type == ZmCalBaseItem.PERSON) this._editView.updateScheduleAssistant(this._attendees[ZmCalBaseItem.PERSON], ZmCalBaseItem.PERSON);
        }
		sched.attendee = null;
	}
	sched.attType = type;

	// reset row
	var input = sched.inputObj;
	input.setValue("", true);
    input.focus();
	svp._clearColoredCells(sched);

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

ZmFreeBusySchedulerView.prototype.getEmail =
function(attendee) {
    return attendee.getLookupEmail() || attendee.getEmail();
};

ZmFreeBusySchedulerView.prototype._colorSchedule =
function(status, slots, table, sched) {
	var row = table.rows[0];
	var className = this._getClassForStatus(status);

    var currentDate = this._getStartDate();

	if (row && className) {
		// figure out the table cell that needs to be colored
		for (var i = 0; i < slots.length; i++) {
            if(status == ZmFreeBusySchedulerView.STATUS_WORKING) {
                this._fbCache.convertWorkingHours(slots[i], currentDate);
            }
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

ZmFreeBusySchedulerView.prototype._updateAllAttendees =
function(status, slots) {

    var currentDate = this._getStartDate();

    for (var i = 0; i < slots.length; i++) {
        if(status == ZmFreeBusySchedulerView.STATUS_WORKING) {
            this._fbCache.convertWorkingHours(slots[i], currentDate);
        }
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
            if (status != ZmFreeBusySchedulerView.STATUS_UNKNOWN) {
                this._allAttendees[j] = this._allAttendees[j] + 1;
                this.updateAllAttendeeCellStatus(j, status);
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
    this.resizeKeySpacer();
};

ZmFreeBusySchedulerView.prototype.resizeKeySpacer =
function() {
    var graphKeySpacer = document.getElementById(this._htmlElId + '_graphKeySpacer');
    if(graphKeySpacer) {
        var size = Dwt.getSize(document.getElementById(this._navToolbarId));
        Dwt.setSize(graphKeySpacer, size.x - 6, Dwt.DEFAULT);
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

	var td, div, curClass, newClass;

	// mark right borders of appropriate f/b table cells
	var normalClassName = "ZmSchedulerGridDiv";
	var halfHourClassName = normalClassName + "-halfHour";
	var startClassName = normalClassName + "-start";
	var endClassName = normalClassName + "-end";

	var table = document.getElementById(sched.dwtTableId);
	var row = table.rows[0];
	if (row) {
		for (var i = 0; i < ZmFreeBusySchedulerView.FREEBUSY_NUM_CELLS; i++) {
		    td = row.cells[i];
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
		td = row.cells[0];
		div = td ? td.getElementsByTagName("*")[0] : null;
		if (div && (this._dateBorder.start == -1)) {
		    div.className += " " + normalClassName + "-leftStart";
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
    var hourmin,
        seconds;
    adjust = adjust != null ? adjust : true;
    if(adjust) {
        var dayStartTime = this._getStartTime();
        var indexTime = (time instanceof Date) ? time.getTime() : time;
        hourmin = (indexTime - dayStartTime)/60000; //60000 = 1000(msec) * 60 (sec) - hence, dividing by 60000 means calculating the minutes and
        seconds = (indexTime - dayStartTime)%60000; //mod by 60000 means calculating the seconds remaining
    }
    else {
        var d = (time instanceof Date) ? time : new Date(time);
        hourmin = d.getHours() * 60 + d.getMinutes();
        seconds = d.getSeconds();
    }
    var idx = Math.floor(hourmin / 60) * 2;
	var minutes = hourmin % 60;
	if (minutes >= 30) {
		idx++;
	}
	// end times don't mark blocks on half-hour boundary
	if (isEnd && (minutes == 0 || minutes == 30)) {
		// block even if it exceeds 1 second
		//var s = d.getSeconds();
		if (seconds == 0) {
			idx--;
		}
	}

	return idx;
};

ZmFreeBusySchedulerView.prototype._getBordersFromDateInfo =
function() {
	// Setup the start/end for an all day appt
	var index = {start: -1, end: ZmFreeBusySchedulerView.FREEBUSY_NUM_CELLS-1};
	if (this._dateInfo.showTime) {
		// Not an all day appt, determine the appts start and end
		var idx = AjxDateUtil.isLocale24Hour() ? 0 : 1;
		this._processDateInfo(this._dateInfo);

		// subtract 1 from index since we're marking right borders
		index.start = this._getIndexFromTime(this._startDate, null, false) - 1;
		if (this._dateInfo.endDate == this._dateInfo.startDate) {
			index.end = this._getIndexFromTime(this._endDate, true, false);
		}
	}
	return index;
};

ZmFreeBusySchedulerView.prototype._processDateInfo =
function(dateInfo) {
    var startDate = AjxDateUtil.simpleParseDateStr(dateInfo.startDate);
    var endDate   = AjxDateUtil.simpleParseDateStr(dateInfo.endDate);
    if (dateInfo.isAllDay) {
        startDate.setHours(0,0,0,0);
        this._startDate = startDate;
        endDate.setHours(23,59,59,999);
        this._endDate   = endDate;
    } else {
        this._startDate = DwtTimeInput.getDateFromFields(dateInfo.startTimeStr,startDate);
        this._endDate   = DwtTimeInput.getDateFromFields(dateInfo.endTimeStr,  endDate);
    }
}

ZmFreeBusySchedulerView.prototype._getClassForStatus =
function(status) {
	return ZmFreeBusySchedulerView.STATUS_CLASSES[status];
};

ZmFreeBusySchedulerView.prototype._getClassForParticipationStatus =
function(status) {
	return ZmFreeBusySchedulerView.PSTATUS_CLASSES[status];
};

ZmFreeBusySchedulerView.prototype._getFreeBusyInfo =
function(startTime, emailList, callback) {

    var endTime = startTime + AjxDateUtil.MSEC_PER_DAY;
    var emails = emailList.split(",");
    var freeBusyParams  = {
        emails: emails,
        startTime: startTime,
        endTime: endTime,
        callback: callback
    };

    var callback = new AjxCallback(this, this._handleResponseFreeBusy, [freeBusyParams]);    
	var errorCallback = new AjxCallback(this, this._handleErrorFreeBusy, [freeBusyParams]);

    var acct = (appCtxt.multiAccounts)
        ? this._editView.getCalendarAccount() : null;


    var params = {
        startTime: startTime,
        endTime: endTime,
        emails: emails,
        callback: callback,
        errorCallback: errorCallback,
        noBusyOverlay: true,
        account: acct
    };

    var appt = this._editView.parent.getAppt ? this._editView.parent.getAppt(true) : null;
    if (appt) {
        params.excludedId = appt.uid;

    }
    this._freeBusyRequest = this._fbCache.getFreeBusyInfo(params);
};

// Callbacks

ZmFreeBusySchedulerView.prototype._handleResponseFreeBusy =
function(params, result) {

    this._freeBusyRequest = null;
    var dateInfo = this._dateInfo;
    this._processDateInfo(dateInfo);
    // Adjust start and end time by 1 msec, to avoid fencepost problems when detecting conflicts
    var apptStartTime = this._startDate.getTime(),
        apptEndTime = this._endDate.getTime(),
        apptConflictStartTime = apptStartTime+ 1,
        apptConflictEndTime   = apptEndTime-1,
        appt = this._appt,
        orgEmail = appt && !appt.inviteNeverSent ? appt.organizer : null,
        apptOrigStartTime = appt ? appt.getOrigStartTime() : null,
        apptOrigEndTime = appt ? (dateInfo.isAllDay ? appt.getOrigEndTime() - 1 : appt.getOrigEndTime()) : null,
        apptTimeChanged = appt ? !(apptOrigStartTime == apptStartTime && apptOrigEndTime == apptEndTime) : false;

    for (var i = 0; i < params.emails.length; i++) {
		var email = params.emails[i];

		this._detectConflict(email, apptConflictStartTime, apptConflictEndTime);

		// first clear out the whole row for this email id
		var sched = this._schedTable[this._emailToIdx[email]],
            attendee = sched ? sched.attendee : null,
            ptst = attendee ? attendee.getParticipantStatus() : null,
            usr = this._fbCache.getFreeBusySlot(params.startTime, params.endTime, email),
            table = sched ? document.getElementById(sched.dwtTableId) : null;

        if (usr && (ptst == ZmCalBaseItem.PSTATUS_ACCEPT || email == orgEmail)) {
            if (!usr.b) {
                usr.b = [];
            }
            if (apptTimeChanged) {
                usr.b.push({s:apptOrigStartTime, e: apptOrigEndTime});
            }
            else {
                usr.b.push({s:apptStartTime, e: apptEndTime});
            }
        }

		if (table) {
			table.rows[0].className = "ZmSchedulerNormalRow";
			this._clearColoredCells(sched);

            if(!usr) continue;
			sched.uid = usr.id;

            // next, for each free/busy status, color the row for given start/end times
			if (usr.n) this._colorSchedule(ZmFreeBusySchedulerView.STATUS_UNKNOWN, usr.n, table, sched);
			if (usr.t) this._colorSchedule(ZmFreeBusySchedulerView.STATUS_TENTATIVE, usr.t, table, sched);
			if (usr.b) this._colorSchedule(ZmFreeBusySchedulerView.STATUS_BUSY, usr.b, table, sched);
			if (usr.u) this._colorSchedule(ZmFreeBusySchedulerView.STATUS_OUT, usr.u, table, sched);
		}else {

            //update all attendee status - we update all attendee status correctly even if we have slight
            if(!usr) continue;

            if (usr.n) this._updateAllAttendees(ZmFreeBusySchedulerView.STATUS_UNKNOWN, usr.n);
            if (usr.t) this._updateAllAttendees(ZmFreeBusySchedulerView.STATUS_TENTATIVE, usr.t);
            if (usr.b) this._updateAllAttendees(ZmFreeBusySchedulerView.STATUS_BUSY, usr.b);
            if (usr.u) this._updateAllAttendees(ZmFreeBusySchedulerView.STATUS_OUT, usr.u);

        }
	}

    if (this._fbParentCallback) {
        this._fbParentCallback.run();
    }

    var acct = (appCtxt.multiAccounts)
        ? this._editView.getCalendarAccount() : null;
    
    var workingHrsCallback = new AjxCallback(this, this._handleResponseWorking, [params]);
    var errorCallback = new AjxCallback(this, this._handleErrorFreeBusy, [params]);

    //optimization: fetch working hrs for a week - wrking hrs pattern repeat everyweek
    var weekStartDate = new Date(params.startTime);
    var dow = weekStartDate.getDay();
    weekStartDate.setDate(weekStartDate.getDate()-((dow+7))%7);


    var whrsParams = {
        startTime: weekStartDate.getTime(),
        endTime: weekStartDate.getTime() + 7*AjxDateUtil.MSEC_PER_DAY,
        emails: params.emails,
        callback: workingHrsCallback,
        errorCallback: errorCallback,
        noBusyOverlay: true,
        account: acct
    };

    this._workingHoursRequest = this._fbCache.getWorkingHours(whrsParams);
};

ZmFreeBusySchedulerView.prototype._detectConflict =
function(email, startTime, endTime) {
    var sched = this._fbCache.getFreeBusySlot(startTime, endTime, email);
    var isFree = true;
    if(sched.b) isFree = isFree && ZmApptAssistantView.isBooked(sched.b, startTime, endTime);
    if(sched.t) isFree = isFree && ZmApptAssistantView.isBooked(sched.t, startTime, endTime);
    if(sched.u) isFree = isFree && ZmApptAssistantView.isBooked(sched.u, startTime, endTime);

    this._fbConflict[email] = isFree;
}

ZmFreeBusySchedulerView.prototype.getConflicts =
function() {
    return this._fbConflict;
}



ZmFreeBusySchedulerView.prototype._handleResponseWorking =
function(params, result) {

    this._workingHoursRequest = null;

	for (var i = 0; i < params.emails.length; i++) {
		var email = params.emails[i];
        var usr = this._fbCache.getWorkingHrsSlot(params.startTime, params.endTime, email);

        if(!usr) continue;

		// first clear out the whole row for this email id
		var sched = this._schedTable[this._emailToIdx[usr.id]];
		var table = sched ? document.getElementById(sched.dwtTableId) : null;
		if (table) {
            sched.uid = usr.id;
            // next, for each free/busy status, color the row for given start/end times
			if (usr.f) this._colorSchedule(ZmFreeBusySchedulerView.STATUS_WORKING, usr.f, table, sched);
            //show entire day as working hours if the information is not available (e.g. external accounts)
            if (usr.n) {
                var currentDay = this._getStartDate();
                var entireDaySlot = {
                    s: currentDay.getTime(),
                    e: currentDay.getTime() + AjxDateUtil.MSEC_PER_DAY
                };
                this._colorSchedule(ZmFreeBusySchedulerView.STATUS_WORKING, [entireDaySlot], table, sched);
            }
		}
	}

    if(params.callback) {
        params.callback.run();
    }

    this.postUpdateHandler();    
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

        var currentDate = this._getStartDate();

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
function(params, result) {

    this._freeBusyRequest = null;
    this._workingHoursRequest = null;

    if (result.code == ZmCsfeException.OFFLINE_ONLINE_ONLY_OP) {
		var emails = params.emails;
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
		var email = this.getEmail(attendee);

		var startDate  = new Date(this._getStartTime());
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
    var cc = AjxDispatcher.run("GetCalController"),
        treeController =  cc.getCalTreeController(),
        calendars = treeController ? treeController.getOwnedCalendars(appCtxt.getApp(ZmApp.CALENDAR).getOverviewId(), params.email) : [],
        tooltipContent = "",
        i,
        length;
    if(!params.status) params.status = ZmFreeBusySchedulerView.STATUS_FREE;

    var fbStatusMsg = [];
    fbStatusMsg[ZmFreeBusySchedulerView.STATUS_FREE]     = ZmMsg.nonWorking;
    fbStatusMsg[ZmFreeBusySchedulerView.STATUS_BUSY]     = ZmMsg.busy;
    fbStatusMsg[ZmFreeBusySchedulerView.STATUS_TENTATIVE]= ZmMsg.tentative;
    fbStatusMsg[ZmFreeBusySchedulerView.STATUS_OUT]      = ZmMsg.outOfOffice;
    fbStatusMsg[ZmFreeBusySchedulerView.STATUS_UNKNOWN]  = ZmMsg.unknown;
    fbStatusMsg[ZmFreeBusySchedulerView.STATUS_WORKING]  = ZmMsg.free;

    var calIds = [];
    var calRemoteIds = new AjxVector();
    for (i = 0, length = calendars.length; i < length; i++) {
        var cal = calendars[i];
        if (cal && (cal.nId != ZmFolder.ID_TRASH)) {
            calIds.push(appCtxt.multiAccounts ? cal.id : cal.nId);
            calRemoteIds.add(cal.getRemoteId(), null, true);
        }
    }
    var sharedCalIds = this.getUserSharedCalIds(params.email);
    var id;
    // Check and remove the duplicates
    // otherwise results will be duplicated
    if(sharedCalIds) {
        for(i=0, length = sharedCalIds.length; i<length; i++) {
            id = sharedCalIds[i];
            if(id && !calRemoteIds.contains(id)) {
                calIds.push(id);
            }
        }
    }
    tooltipContent = "<b>" + ZmMsg.statusLabel + " " + fbStatusMsg[params.status] + "</b>";
    if(calIds.length > 0) {
        var acct = this._editView.getCalendarAccount();
        var emptyMsg = tooltipContent || (acct && (acct.name == params.email) ? fbStatusMsg[params.status] : ZmMsg.unknown);
        tooltipContent = cc.getUserStatusToolTipText(params.startDate, params.endDate, true, params.email, emptyMsg, calIds);
    }
    var shell = DwtShell.getShell(window);
    var tooltip = shell.getToolTip();
    tooltip.setContent(tooltipContent, true);
    tooltip.popup(params.x, params.y, true);
};

ZmFreeBusySchedulerView.prototype.getUserSharedCalIds =
function(email) {
    var organizer = this._schedTable[this._organizerIndex] ? this._schedTable[this._organizerIndex].attendee : null,
        organizerEmail = organizer ? this.getEmail(organizer) : "",
        activeAcct = appCtxt.getActiveAccount(),
        acctEmail = activeAcct ? activeAcct.getEmail() : "";

    if(!email || email == organizerEmail || email == acctEmail) {
        return [];
    }
    if(this._sharedCalIds && this._sharedCalIds[email]) {
        return this._sharedCalIds[email];
    }
    var jsonObj = {GetShareInfoRequest:{_jsns:"urn:zimbraAccount"}};
	var request = jsonObj.GetShareInfoRequest;
	if (email) {
		request.owner = {by:"name", _content:email};
	}
	var result = appCtxt.getAppController().sendRequest({jsonObj:	jsonObj});

    //parse the response
    var resp = result && result.GetShareInfoResponse;
    var share = (resp && resp.share) ? resp.share : null;
    var ids = [];
    if(share) {
        for(var i=0; i<share.length; i++) {
            if(share[i].ownerId && share[i].folderId) {
                var folderId = share[i].ownerId + ":" + share[i].folderId;
                ids.push(folderId);
            }
        }
        if(!this._sharedCalIds) {
            this._sharedCalIds = {};
        }
    }
    this._sharedCalIds[email] = ids;
    return ids;
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

ZmFreeBusySchedulerView.prototype.initAutoCompleteOnFocus =
function(inputElement) {
    if (this._acContactsList && !this._autoCompleteHandled[inputElement._schedTableIdx]) {
        this._acContactsList.handle(inputElement);
        this._autoCompleteHandled[inputElement._schedTableIdx] = true;
    }
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
        svp.initAutoCompleteOnFocus(el);
	}
};

ZmFreeBusySchedulerView._onBlur =
function(ev) {
	var el = DwtUiEvent.getTarget(ev);
    if(el._acHandlerInProgress) { return; }
	var svp = AjxCore.objectWithId(el._schedViewPageId);
	if (!svp) { return; }
    el._acHandlerInProgress = true;
    svp._handleAttendeeField(el);
    el._acHandlerInProgress = false;
    if (svp._editView) { svp._editView.showConflicts(); }
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
	if (!fbDiv || fbDiv._freeBusyCellIndex == undefined) { return; }

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

/**
 * Called when "Show more" link is clicked, this module shows all the attendees without pagination
 * @param ev click event
 */
ZmFreeBusySchedulerView._onShowMore =
function(ev) {
	ev = DwtUiEvent.getEvent(ev);
    var showMoreLink = DwtUiEvent.getTarget(ev);
    var svp = AjxCore.objectWithId(showMoreLink._schedViewPageId);
    if (!svp) { return; }
    svp.showMoreResults();
};

ZmFreeBusySchedulerView._onFreeBusyMouseOut =
function(ev) {
	ev = DwtUiEvent.getEvent(ev);

	var el = DwtUiEvent.getTarget(ev);
	var svp = el && el._schedViewPageId ? AjxCore.objectWithId(el._schedViewPageId) : null;
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

    if(status == ZmFreeBusySchedulerView.STATUS_WORKING) return;

	if (!this._allAttendeesStatus[idx]) {
		this._allAttendeesStatus[idx] = status;
	} else if (status!= this._allAttendeesStatus[idx]) {
		if (status != ZmFreeBusySchedulerView.STATUS_UNKNOWN &&
			status != ZmFreeBusySchedulerView.STATUS_FREE)
		{
            if(status == ZmFreeBusySchedulerView.STATUS_OUT || this._allAttendeesStatus[idx] == ZmFreeBusySchedulerView.STATUS_OUT) {
    			this._allAttendeesStatus[idx] = ZmFreeBusySchedulerView.STATUS_OUT;
            }else {
            	this._allAttendeesStatus[idx] = ZmFreeBusySchedulerView.STATUS_BUSY;
            }
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
          if(sched.btnObj) {
            sched.btnObj.setEnabled(enable);
          }
      }
  }
};


/**
 * Resets pageless mode while rendering attendees list, when pageless mode is enabled all attendees will be shown in
 * single list without 'Show more' controls
 *
 * @param enable	[boolean]*		if true, enable pageless mode
 */
ZmFreeBusySchedulerView.prototype.resetPagelessMode =
function(enable) {
    this._isPageless = enable;
};

ZmFreeBusySchedulerView.prototype.showMoreResults =
function() {
    //enable pageless mode and render entire list
    this.resetPagelessMode(true);
    Dwt.setDisplay(this._showMoreLink, Dwt.DISPLAY_NONE);
    this.showMe();
};
