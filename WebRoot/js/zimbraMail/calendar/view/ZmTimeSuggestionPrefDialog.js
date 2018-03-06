/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 */

/**
 * Creates a time/location suggestion preference  dialog.
 * @class
 * This class represents a time/location preference dialog.
 *
 * @param	{DwtControl}	parent		the parent
 * @param	{String}	className		the class name
 *
 * @extends		DwtDialog
 */
ZmTimeSuggestionPrefDialog = function(parent, className) {

    this._prefs = {};
    this._prefFields = {};
    this._prefLoaded = false;

	className = className || "ZmTimeSuggestionPrefDialog";
	DwtDialog.call(this, {parent:parent, className:className, title:ZmMsg.suggestionPreferences});

	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._handleOkButton));
	this.setButtonListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this, this._handleCancelButton));

};

ZmTimeSuggestionPrefDialog.prototype = new DwtDialog;
ZmTimeSuggestionPrefDialog.prototype.constructor = ZmTimeSuggestionPrefDialog;

// Constants

ZmTimeSuggestionPrefDialog.META_DATA_KEY = "MD_LOCATION_SEARCH_PREF";
ZmTimeSuggestionPrefDialog.PREF_FIELDS = ["name", "site", "capacity", "building", "desc", "floor",
                                          "my_working_hrs_pref", "others_working_hrs_pref",
                                          "recurrenceSelect"];

// corresponding attributes for search command
ZmTimeSuggestionPrefDialog.SF_ATTR = {};
ZmTimeSuggestionPrefDialog.SF_ATTR["name"]		  = "fullName";
ZmTimeSuggestionPrefDialog.SF_ATTR["capacity"]	  = "zimbraCalResCapacity";
ZmTimeSuggestionPrefDialog.SF_ATTR["desc"]        = "description";
ZmTimeSuggestionPrefDialog.SF_ATTR["site"]		  = "zimbraCalResSite";
ZmTimeSuggestionPrefDialog.SF_ATTR["building"]	  = "zimbraCalResBuilding";
ZmTimeSuggestionPrefDialog.SF_ATTR["floor"]		  = "zimbraCalResFloor";

// search field compares ops - listed here if not substring ("has")
ZmTimeSuggestionPrefDialog.SF_OP = {};
ZmTimeSuggestionPrefDialog.SF_OP["capacity"]	= "ge";
ZmTimeSuggestionPrefDialog.SF_OP["floor"]		= "eq";

ZmTimeSuggestionPrefDialog.MY_WORKING_HOURS_FIELD = 'my_working_hrs_pref';
ZmTimeSuggestionPrefDialog.OTHERS_WORKING_HOURS_FIELD = 'others_working_hrs_pref';
ZmTimeSuggestionPrefDialog.RECURRENCE = 'recurrenceSelect';

ZmTimeSuggestionPrefDialog.CHECKBOX_FIELDS = {};
ZmTimeSuggestionPrefDialog.CHECKBOX_FIELDS[ZmTimeSuggestionPrefDialog.MY_WORKING_HOURS_FIELD]      = true;
ZmTimeSuggestionPrefDialog.CHECKBOX_FIELDS[ZmTimeSuggestionPrefDialog.OTHERS_WORKING_HOURS_FIELD]   = true;

ZmTimeSuggestionPrefDialog.DEFAULT_VAL = {};
ZmTimeSuggestionPrefDialog.DEFAULT_VAL[ZmTimeSuggestionPrefDialog.MY_WORKING_HOURS_FIELD]    = 'true';
ZmTimeSuggestionPrefDialog.DEFAULT_VAL[ZmTimeSuggestionPrefDialog.OTHERS_WORKING_HOURS_FIELD] = 'true';
ZmTimeSuggestionPrefDialog.DEFAULT_NUM_RECURRENCE = 4;
ZmTimeSuggestionPrefDialog.MAX_NUM_RECURRENCE = 10;
ZmTimeSuggestionPrefDialog.DEFAULT_VAL[ZmTimeSuggestionPrefDialog.RECURRENCE] =
    ZmTimeSuggestionPrefDialog.DEFAULT_NUM_RECURRENCE.toString();


// Public methods

ZmTimeSuggestionPrefDialog.prototype.toString =
function() {
	return "ZmTimeSuggestionPrefDialog";
};

ZmTimeSuggestionPrefDialog.prototype._handleOkButton =
function(event) {
    this.readPrefs();
    this.setSearchPreference();
    this.popdown();
    if(this._callback) this._callback.run();
};

ZmTimeSuggestionPrefDialog.prototype._handleCancelButton =
function(event) {
	this.popdown();
};



/**
 * Pops-up the properties dialog.
 *
 */
ZmTimeSuggestionPrefDialog.prototype.popup =
function(account) {
    this._account = account;
	DwtDialog.prototype.popup.call(this);
    this.getSearchPreference();

	var el = document.getElementById(this._htmlElId);
	var loc = Dwt.getLocation(el);
	if (loc.x < 0) {
		// For Bug 94520.  Japanese text is not getting formatted properly (it stays one very long string), until the
		// dialog was dragged.  Dragging runs the next line in its code (which places the left of the dialog on screen)
		// and it triggers the reformatting.
		// Don't try setting the location via the loc var to DwtDialog.popup - the DwtBaseDialog positioning 'corrects'
		// it and resets it to an offscreen value.
		el.style.left = "0px";
	}
};

ZmTimeSuggestionPrefDialog.prototype.popdown =
function() {
	DwtDialog.prototype.popdown.call(this);
};

ZmTimeSuggestionPrefDialog.prototype.getPrefLoaded =
function() {
    return this._prefLoaded;
}

ZmTimeSuggestionPrefDialog.prototype._getContentHtml =
function() {
    return AjxTemplate.expand("calendar.Appointment#TimeLocationPreference", {id: this.getHTMLElId()});
};

ZmTimeSuggestionPrefDialog.prototype.setContent =
function(text) {
	var d = this._getContentDiv();
	if (d) {
		d.innerHTML = text || "";
	}

    this._recurrenceSelect = new DwtSelect({id:this._htmlElId + "_recurrenceSelect",
                                parent:this, parentElement:(this._htmlElId + "_recurrence")});
    for (var i = 1; i <= ZmTimeSuggestionPrefDialog.MAX_NUM_RECURRENCE; i++) {
        this._recurrenceSelect.addOption(i.toString(), (i == 1), i);
    }


    this._dlgId = AjxCore.assignId(this);

    var element, id;
    for(var i=0; i<ZmTimeSuggestionPrefDialog.PREF_FIELDS.length; i++) {
        id = ZmTimeSuggestionPrefDialog.PREF_FIELDS[i];
        element = document.getElementById(this.getHTMLElId() + "_" + id);
        if (element) {
            this._prefFields[id] = element;
            this._prefs[id] = this.getPreferenceFieldValue(id);
        }
    }
};

ZmTimeSuggestionPrefDialog.prototype.getPreference =
function(id) {
    return (this._prefs[id] != null) ? this._prefs[id] : ZmTimeSuggestionPrefDialog.DEFAULT_VAL[id];
};

ZmTimeSuggestionPrefDialog.prototype.setCallback =
function(callback) {
    this._callback = callback;
};

ZmTimeSuggestionPrefDialog.prototype.readPrefs =
function(text) {
    var field;
    for(var id in this._prefFields) {
        this._prefs[id] = this.getPreferenceFieldValue(id)
    }
};

ZmTimeSuggestionPrefDialog.prototype.getPreferenceFieldValue =
function(id) {
    if (id == "recurrenceSelect") {
        return this._recurrenceSelect.getValue();
    } else {
        var field = this._prefFields[id];
        if(!field) return;

        if(ZmTimeSuggestionPrefDialog.CHECKBOX_FIELDS[id]){
            return field.checked ? 'true' : 'false';
        }else {
            return field.value;
        }
    }
};

ZmTimeSuggestionPrefDialog.prototype.setPreferenceFieldValue =
function(id, value) {
    if (id == "recurrenceSelect") {
       this._recurrenceSelect.setSelectedValue(value);
    } else {
        var field = this._prefFields[id];
        if(!field) return;

        if(ZmTimeSuggestionPrefDialog.CHECKBOX_FIELDS[id]){
            field.checked = (value == 'true');
        }else {
            field.value = value || "";
        }
    }
};

ZmTimeSuggestionPrefDialog.prototype.getSearchPreference =
function(account, prefSearchCallback) {
    var md = new ZmMetaData(account || this._account);
    var callback = new AjxCallback(this, this.processSearchPreference, [prefSearchCallback]);
    md.get(ZmTimeSuggestionPrefDialog.META_DATA_KEY, null, callback);
};

ZmTimeSuggestionPrefDialog.prototype.processSearchPreference =
function(prefSearchCallback, metadataResponse) {
    this._prefs = {};

    var objPrefs = metadataResponse.getResponse().BatchResponse.GetMailboxMetadataResponse[0].meta[0]._attrs;
    for (var name in objPrefs) {
        if(name && objPrefs[name]) {
            this._prefs[name] = objPrefs[name];
            this.setPreferenceFieldValue(name, this._prefs[name]);
        }
    }

    //set default value for the preferences
    for(var id in ZmTimeSuggestionPrefDialog.DEFAULT_VAL) {
        if(!this._prefs[id]) {
            this.setPreferenceFieldValue(id, ZmTimeSuggestionPrefDialog.DEFAULT_VAL[id]);            
        }
    }

    this._prefLoaded = true;
    if(prefSearchCallback) prefSearchCallback.run();
};

ZmTimeSuggestionPrefDialog.prototype.setSearchPreference =
function() {
    var md = new ZmMetaData(this._account);
    var newPrefs = {};
    for(var id in this._prefs) {
        if(this._prefs[id] != "") newPrefs[id] = this._prefs[id];
    }
    return md.set(ZmTimeSuggestionPrefDialog.META_DATA_KEY, newPrefs);
};

ZmTimeSuggestionPrefDialog.isSearchCondition =
function(id) {
    return Boolean(ZmTimeSuggestionPrefDialog.SF_ATTR[id]);
};

ZmTimeSuggestionPrefDialog.prototype.handleRoomCheckbox =
function() {
    this.enableLocationFields(true);
};

ZmTimeSuggestionPrefDialog.prototype.enableLocationFields =
function(enable) {
    for(var id in ZmTimeSuggestionPrefDialog.SF_ATTR) {
        if(!this._prefFields[id]) continue;
        this._prefFields[id].disabled = !enable;
    }
};

ZmTimeSuggestionPrefDialog._handleRoomCheckbox =
function(ev) {
	var el = DwtUiEvent.getTarget(ev);
	var dlg = AjxCore.objectWithId(el._dlgId);
	if (!dlg) { return; }
    dlg.handleRoomCheckbox();
};