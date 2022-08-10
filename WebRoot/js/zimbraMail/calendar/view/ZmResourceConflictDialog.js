/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
* show history of the status window
* @param parent			the element that created this view
 * @private
*/
ZmResourceConflictDialog = function(parent) {
	var selectId = Dwt.getNextId();

    var saveButton = new DwtDialog_ButtonDescriptor(ZmResourceConflictDialog.SAVE_BUTTON, ZmMsg.save, DwtDialog.ALIGN_RIGHT, null);
    var cancelButton = new DwtDialog_ButtonDescriptor(ZmResourceConflictDialog.CANCEL_BUTTON, ZmMsg.cancel, DwtDialog.ALIGN_RIGHT, null);

    //Bug fix # 80490 - Added an ID handler to the dialog
	DwtDialog.call(this, {parent:parent, id:"RESC_CONFLICT_DLG", standardButtons: DwtDialog.NO_BUTTONS, extraButtons: [saveButton, cancelButton]});

	this.setContent(this._contentHtml(selectId));
	this.setTitle(ZmMsg.resourceConflictLabel);
	
	this._freeBusyStatusMap = {
		"F" : "free",
		"B" : "busy",
		"T" : "tentative",
		"O" : "outOfOffice",
		"U" : "unknown"
	};

    this.registerCallback(ZmResourceConflictDialog.SAVE_BUTTON, this._handleSaveButton, this);
    this.registerCallback(ZmResourceConflictDialog.CANCEL_BUTTON, this._handleCancelButton, this);
};

ZmResourceConflictDialog.prototype = new DwtDialog;
ZmResourceConflictDialog.prototype.constructor = ZmResourceConflictDialog;

ZmResourceConflictDialog.HEIGHT = 150;
ZmResourceConflictDialog.MAX_HEIGHT = 300;


ZmResourceConflictDialog.SAVE_BUTTON = ++DwtDialog.LAST_BUTTON;
ZmResourceConflictDialog.CANCEL_BUTTON = ++DwtDialog.LAST_BUTTON;
ZmResourceConflictDialog.IGNORE_SAVE_BUTTON = ++DwtDialog.LAST_BUTTON;

// Public methods

ZmResourceConflictDialog.prototype.toString =
function() {
	return "ZmResourceConflictDialog";
};

ZmResourceConflictDialog.prototype._contentHtml =
function(selectId) {
	this._listId = Dwt.getNextId();
	return [ "<div class='ResourceConflictMsg'>", ZmMsg.resourceConflictInfo, "</div>", 
	"<div class='ZmResourceConflictDialog' id='", this._listId, "' style='overflow:auto;height:", ZmResourceConflictDialog.HEIGHT ,"px;'></div>"].join("");
};

ZmResourceConflictDialog.prototype._addAttr =
function(html, title, value, data) {
	if (value) {
		html.append("<tr width=100% id='", this._rowId(data), "'>");
		html.append("<td align=right style='Zwidth:60px;' class='ZmReminderField'>", title, ":&nbsp;</td>");
		html.append("<td>",AjxStringUtil.htmlEncode(value), "</td>");
		html.append("</tr>");	
	}
};

ZmResourceConflictDialog.prototype._rowId =
function(data) {
	var id = Dwt.getNextId();
	data.rowIds.push(id);
	return id;
};

ZmResourceConflictDialog.prototype._addConflictInst =
function(html, inst, data, attendeeMap, needSep) {

	data.buttonId = Dwt.getNextId();
	data.deltaId = Dwt.getNextId();
	data.cancelButtonId = Dwt.getNextId();
	data.rowIds = [];
	
	if (needSep) html.append("<tr id='", inst.ridZ, "_sep'><td colspan=4><div class=horizSep></div></td></tr>");
    
	html.append("<tr width=100% id='conflict_row_", inst.ridZ, "'>");
	html.append("<td colspan=2 valign='top'>");
	html.append("<table  id='", inst.ridZ, "_conflictInstTxt' cellpadding=1 width='95%' cellspacing=0 border=0><tr>");
    html.append("<td width=25px>", AjxImg.getImageHtml("Appointment"), "</td>");
	html.append("<td><b>", this.getDurationText(inst), "</b></td>");
    html.append("</tr><tr>");
    html.append("<td align='left' colspan='2'>");
    html.append("<div class='ResourceConflictResolver'>");
    html.append("<span id='" + data.cancelButtonId + "'></span> <span id='" + data.deltaId + "'></span>");
    html.append("</div>");
    html.append("</td>");
	html.append("</tr></table>");
	html.append("</td>");
    //html.append("<td align=right valign='top' id='", data.cancelButtonId, "'>");
    //html.append("</td>");
	html.append("<td align=right valign='top' id='", data.buttonId, "'>");
	html.append("<table cellpadding=1 cellspacing=0 border=0>");
	
    var usr = inst.usr;
    if(usr) {
        if(!(usr instanceof Array)) {
            usr = [usr];
        }
        for(var i = 0; i < usr.length; i++) {
			var fbStatusStr = "";

            var name = usr[i].name;			
			if(attendeeMap[name]) {
				var at = attendeeMap[name];
				name = at.getFullName() || at.getEmail();		
			}
			var fbStatus = ZmMsg[this.getFreeBusyStatus(usr[i])];
			html.append("<tr>");
			html.append("<td>" +  this.getAttendeeImgHtml(at) + "</td>");
			html.append("<td>" + name +  "</td>");
			html.append("<td>(" + fbStatus +  ")</td>");
			html.append("</tr>");			
        }
    }

    html.append("</table>");
    html.append("</td>");
	html.append("</tr>");
	//this._addAttr(html, ZmMsg.location, appt.getReminderLocation(), data);
};

ZmResourceConflictDialog.prototype.getAttendeeImgHtml =
function(at) {
	var img = "Person";
	if(at.resType) {
		img = (at.resType == ZmCalBaseItem.LOCATION) ? "Location" : "Resource";
	}
	return AjxImg.getImageSpanHtml(img);
};

ZmResourceConflictDialog.prototype.getFreeBusyStatus =
function(usr) {
	return this._freeBusyStatusMap[usr.fb] ? this._freeBusyStatusMap[usr.fb] : "free";
};


ZmResourceConflictDialog.prototype.getDurationText =
function(inst) {
    var hourMinOffset = 0,
        start = new Date(),
        userTimeZone = appCtxt.get(ZmSetting.DEFAULT_TIMEZONE),
        currentTimeZone = AjxTimezone.getServerId(AjxTimezone.DEFAULT);
    if(this._appt.isAllDayEvent() && userTimeZone != currentTimeZone) {
        var offset1 = AjxTimezone.getOffset(AjxTimezone.getClientId(currentTimeZone), start);
        var offset2 = AjxTimezone.getOffset(AjxTimezone.getClientId(userTimeZone), start);
        hourMinOffset = (offset2 - offset1) * 60 * 1000;    //offset is in minutes convert to miliseconds
    }
    start = new Date(inst.s + hourMinOffset);
	var endTime = start.getTime() + inst.dur;
	var end = new Date(endTime);

    var pattern =  ZmMsg.apptTimeInstance;
    if(this._appt.isAllDayEvent()) {
        pattern =  ZmMsg.apptTimeAllDay;
        if(end.getDate() != start.getDate()) {
            pattern =  ZmMsg.apptTimeAllDayMulti;
        }
    }

	return AjxMessageFormat.format(pattern, [start, end, ""]);
};

ZmResourceConflictDialog.prototype.initialize =
function(list, appt, callback, cancelCallback) {
	this._list = list;
	this._appt = appt;
	this._instData = {};
    this._callback = callback;
    this._cancelCallback = cancelCallback;
	this._canceledInstanceCount = 0;
	
	var attendeeMap = {};
	var types = [ZmCalBaseItem.PERSON, ZmCalBaseItem.LOCATION, ZmCalBaseItem.EQUIPMENT];
	
	for(var i = 0; i < types.length; i++) {
		var attendees = appt.getAttendees(types[i]);
		for(var j = 0; j < attendees.length; j++) {
			var at = attendees[j];
			var email = at ? at.getEmail() : null;
			if(email) {
				attendeeMap[email] = at;
			}
		}
	}
	
	
	var html = new AjxBuffer();

	var formatter = AjxDateFormat.getDateTimeInstance(AjxDateFormat.SHORT, AjxDateFormat.MEDIUM);
	
	var size = this._conflictSize = list.length;

    var dlgC = document.getElementById(this._listId);
    Dwt.setSize(dlgC, Dwt.DEFAULT, size > 5 ? ZmResourceConflictDialog.MAX_HEIGHT : ZmResourceConflictDialog.HEIGHT);

	html.append("<table cellpadding=2 cellspacing=0 border=0 width=100%>");
	for (var i=0; i < size; i++) {
		var inst = list[i];
		var data = this._instData[i] = {inst: inst};
		this._addConflictInst(html, inst, data, attendeeMap, i > 0);
	}
	html.append("</table>");

	if (this._cancelButtons) {
		for (var buttonId in this._cancelButtons) {
			this._cancelButtons[buttonId].dispose();
		}
	}
	this._cancelButtons = {};
    
	var div = document.getElementById(this._listId);
	div.innerHTML = html.toString();

    if(appt.getRecurType() == ZmRecurrence.NONE && size==1) {
        return;
    }

    var recurrence = appt.getRecurrence();

    for (var i = 0; i < size; i++) {
        var data = this._instData[i];
        var cancelButtonContainer = document.getElementById(data.cancelButtonId);
        cancelButtonContainer.innerHTML = this.getCancelHTML(recurrence.isInstanceCanceled(data.inst.ridZ));
        Dwt.setHandler(cancelButtonContainer, DwtEvent.ONCLICK, AjxCallback.simpleClosure(this._handleCancelInstance, this, data.inst.ridZ, data.cancelButtonId, data.deltaId));
    }
};

ZmResourceConflictDialog._onClick =
function(ev) {
	ev = ev || window.event;
	var el = DwtUiEvent.getTarget(ev);
	var edv = AjxCore.objectWithId(el._editViewId);
	if (edv) {
		edv._handleOnClick(el);
	}
};

ZmResourceConflictDialog.prototype._handleCancelInstance =
function(ridZ, cancelButtonId, deltaId) {
    var instEl = document.getElementById(ridZ + "_conflictInstTxt");
    var deltaEl = document.getElementById(deltaId);
    var cancelEl = document.getElementById(cancelButtonId);
    if(instEl) {
        var appt = this._appt;
        var recurrence = appt.getRecurrence();
        if(recurrence) {
            var cancelInstance = !recurrence.isInstanceCanceled(ridZ);
            if(cancelInstance) {
                recurrence.addCancelRecurId(ridZ);
                this._canceledInstanceCount++;
            }else {
                recurrence.removeCancelRecurId(ridZ);
                this._canceledInstanceCount--;
            }
            if(cancelEl) {
                cancelEl.innerHTML =  this.getCancelHTML(cancelInstance);
            }            
        }
    }
};

ZmResourceConflictDialog.prototype.getCancelHTML =
function(isCanceled) {
    return isCanceled ? ZmMsg.cancelled + " - <span class='FakeAnchor'>" + ZmMsg.restorePage + "</span>" : "<span class='FakeAnchor'>" + ZmMsg.cancelInstance + "</span>";    
};

ZmResourceConflictDialog.prototype.popup =
function() {
	DwtDialog.prototype.popup.call(this);
	var dblBookingAllowed = appCtxt.get(ZmSetting.CAL_RESOURCE_DBL_BOOKING_ALLOWED);
	this._button[ZmResourceConflictDialog.SAVE_BUTTON].setEnabled(dblBookingAllowed);	
};

ZmResourceConflictDialog.prototype._handleSaveButton =
function() {
    if(this._callback) this._callback.run();
    this.popdown();
};

ZmResourceConflictDialog.prototype._handleCancelButton =
function() {
    if(this._cancelCallback) this._cancelCallback.run();
    if(this._appt) this._appt.getRecurrence().resetCancelRecurIds();
    this.popdown();
};

ZmResourceConflictDialog.prototype._handleIgnoreAllAndSaveButton =
function() {
    var size = this._list ? this._list.length : 0;
    var appt = this._appt;
    for (var i = 0; i < size; i++) {
        var data = this._instData[i];
        if(appt && data.inst) {
            appt._recurrence.addCancelRecurId(data.inst.ridZ);
        }
    }
    this._handleSaveButton();
};
