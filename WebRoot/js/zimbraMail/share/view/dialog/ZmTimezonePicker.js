/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

ZmTimezonePicker = function(parent, className) {

    var buttons = [ ZmTimezonePicker.SAVE_BUTTON ];
    var saveButton = new DwtDialog_ButtonDescriptor(ZmTimezonePicker.SAVE_BUTTON, ZmMsg.save, DwtDialog.ALIGN_RIGHT);
	ZmDialog.call(this, {parent:parent, className:className, 
        title:ZmMsg.selectTimezoneTitle, standardButtons:DwtDialog.NO_BUTTONS,
        extraButtons: [saveButton]});

    this.setButtonListener(ZmTimezonePicker.SAVE_BUTTON, new AjxListener(this, this._handleSaveButton));
	this._setTimezoneMenu();
};

ZmTimezonePicker.prototype = new ZmDialog;
ZmTimezonePicker.prototype.constructor = ZmTimezonePicker;

ZmTimezonePicker.SAVE_BUTTON = ++DwtDialog.LAST_BUTTON;

ZmTimezonePicker.prototype.toString = 
function() {
	return "ZmTimezonePicker";
};

ZmTimezonePicker.prototype.popup =
function() {
	this._initTzSelect();
    this.autoSelectTimezone();
	ZmDialog.prototype.popup.call(this);
};

ZmTimezonePicker.prototype.cleanup =
function(bPoppedUp) {
	DwtDialog.prototype.cleanup.call(this, bPoppedUp);
};

ZmTimezonePicker.prototype._setTimezoneMenu =
function() {
	var timezoneListener = new AjxListener(this, this._timezoneListener);
	
	this._tzoneSelect = new DwtSelect({parent:this, parentElement: (this._htmlElId + "_tzSelect"), cascade:false});
	this._tzoneSelect.addChangeListener(timezoneListener);
};

ZmTimezonePicker.prototype._initTzSelect =
function() {
	var options = AjxTimezone.getMatchingTimezoneChoices();
    var serverIdMap = {};
    var serverId;
	if (options.length != this._tzCount) {
		this._tzCount = options.length;
		this._tzoneSelect.clearOptions();
		for (var i = 0; i < options.length; i++) {
            if(options[i].clientId != AjxTimezone.AUTO_DETECTED) {

                serverId = options[i].value;
                //avoid duplicate entries
                if(serverIdMap[serverId]) continue;
                serverIdMap[serverId] = true;

			    this._tzoneSelect.addOption(options[i]);
            }else {
                var idx = (i+1 < options.length) ? i+1 : options.length-1;
                this._nxtTimezoneOption = options[idx];             
            }
		}
	}
};

ZmTimezonePicker.prototype.autoSelectTimezone =
function() {
    if(AjxTimezone.DEFAULT_RULE.autoDetected) {

        var cRule = AjxTimezone.DEFAULT_RULE;
        var standardOffsetMatch, daylightOffsetMatch, transMatch;

        for(var i in AjxTimezone.MATCHING_RULES) {
            var rule = AjxTimezone.MATCHING_RULES[i];
            if(rule.clientId == AjxTimezone.AUTO_DETECTED) continue;
            if(rule.standard.offset == cRule.standard.offset) {

                if(!standardOffsetMatch) standardOffsetMatch = rule.serverId;

                var isDayLightOffsetMatching = (cRule.daylight && rule.daylight && (rule.daylight.offset == cRule.daylight.offset));

                if(isDayLightOffsetMatching) {

                    if(!daylightOffsetMatch) daylightOffsetMatch = rule.serverId;

                    var isTransYearMatching = (rule.daylight.trans[0] == cRule.daylight.trans[0]);
                    var isTransMonthMatching = (rule.daylight.trans[1] == cRule.daylight.trans[1]);

                    if(isTransYearMatching && isTransMonthMatching && !transMatch) {
                        transMatch = rule.serverId;
                    }
                }
            }
        }
        //select closest matching timezone
        var serverId = transMatch ? transMatch : (daylightOffsetMatch || standardOffsetMatch);
        if(serverId) this._tzoneSelect.setSelectedValue(serverId);
    }else {
        var tz = AjxTimezone.getServerId(AjxTimezone.DEFAULT);
        this._tzoneSelect.setSelectedValue(tz);
    }
};

ZmTimezonePicker.prototype.updateTimezone =
function(dateInfo) {
	this._tzoneSelect.setSelectedValue(dateInfo.timezone);
};

ZmTimezonePicker.prototype.setCallback =
function(callback) {
	this._callback = callback;
};

ZmTimezonePicker.prototype._timezoneListener =
function(ev) {
	//todo: timezone change listener
};

ZmTimezonePicker.prototype._contentHtml = 
function() {
	return AjxTemplate.expand("share.Dialogs#ZmTimezonePicker", {id:this._htmlElId});
};

ZmTimezonePicker.prototype._okButtonListener =
function(ev) {
	DwtDialog.prototype._buttonListener.call(this, ev, results);
};

ZmTimezonePicker.prototype._enterListener =
function(ev) {
};

ZmTimezonePicker.prototype._getTabGroupMembers =
function() {
	return [this._tzoneSelect];
};

ZmTimezonePicker.prototype._handleSaveButton =
function(event) {
    var timezone = this._tzoneSelect.getValue();
    this.popdown();
    if(this._callback) {
        this._callback.run(timezone);
    }
};

ZmTimezonePicker.prototype.handleKeyAction =
function(actionCode, ev) {
	switch (actionCode) {
		case DwtKeyMap.CANCEL:
			this._runCallbackForButtonId(DwtDialog.CANCEL_BUTTON);
			break;
		default:
			DwtDialog.prototype.handleKeyAction.call(this, actionCode, ev);
			break;
	}
	return true;
};
