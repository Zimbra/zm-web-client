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

	className = className || "ZmTimeSuggestionPrefDialog";
	DwtDialog.call(this, {parent:parent, className:className, title:ZmMsg.suggestionPreferences});

	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._handleOkButton));
	this.setButtonListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this, this._handleCancelButton));

};

ZmTimeSuggestionPrefDialog.prototype = new DwtDialog;
ZmTimeSuggestionPrefDialog.prototype.constructor = ZmTimeSuggestionPrefDialog;

// Constants

ZmTimeSuggestionPrefDialog.META_DATA_KEY = "MD_LOCATION_SEARCH_PREF";
ZmTimeSuggestionPrefDialog.PREF_FIELDS = ["name", "site", "capacity", "building", "desc", "floor", "non_working_hrs"];

// corresponding attributes for search command
ZmTimeSuggestionPrefDialog.SF_ATTR = {};
ZmTimeSuggestionPrefDialog.SF_ATTR["name"]		  = "fullName";
ZmTimeSuggestionPrefDialog.SF_ATTR["capacity"]	  = "zimbraCalResCapacity";
ZmTimeSuggestionPrefDialog.SF_ATTR["desc"]        = "notes";
ZmTimeSuggestionPrefDialog.SF_ATTR["site"]		  = "zimbraCalResSite";
ZmTimeSuggestionPrefDialog.SF_ATTR["building"]	  = "zimbraCalResBuilding";
ZmTimeSuggestionPrefDialog.SF_ATTR["floor"]		  = "zimbraCalResFloor";

// search field compares ops - listed here if not substring ("has")
ZmTimeSuggestionPrefDialog.SF_OP = {};
ZmTimeSuggestionPrefDialog.SF_OP["capacity"]	= "ge";
ZmTimeSuggestionPrefDialog.SF_OP["floor"]		= "eq";


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
};

ZmTimeSuggestionPrefDialog.prototype.popdown =
function() {
	DwtDialog.prototype.popdown.call(this);
};

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

    var suffix, id, field;
    for(var i=0; i<ZmTimeSuggestionPrefDialog.PREF_FIELDS.length; i++) {
        id = ZmTimeSuggestionPrefDialog.PREF_FIELDS[i];
        this._prefFields[id] = field = document.getElementById(this.getHTMLElId() + "_" + id);
        if(id != "non_working_hrs") {
            this._prefs[id] = field.value;
        }else {
            this._prefs[id] = field.checked ? 'true' : 'false';            
        }
    }

    this._workingHrsCheckbox = document.getElementById(this.getHTMLElId() + "_non_working_hrs");
};

ZmTimeSuggestionPrefDialog.prototype.getPreference =
function(id) {
    return this._prefs[id];
};

ZmTimeSuggestionPrefDialog.prototype.setCallback =
function(callback) {
    this._callback = callback;
};

ZmTimeSuggestionPrefDialog.prototype.readPrefs =
function(text) {
    var field;
    for(var id in this._prefFields) {
        field = this._prefFields[id];
        if(id != "non_working_hrs") {
            this._prefs[id] = field.value;
        }else {
            this._prefs[id] = field.checked ? 'true' : 'false';
        }
    }
};

ZmTimeSuggestionPrefDialog.prototype.getSearchPreference =
function(account) {
    var md = new ZmMetaData(account || this._account);
    var callback = new AjxCallback(this, this.processSearchPreference);
    md.get(ZmTimeSuggestionPrefDialog.META_DATA_KEY, null, callback);
};

ZmTimeSuggestionPrefDialog.prototype.processSearchPreference =
function(metadataResponse) {
    this._prefs = {};

    var objPrefs = metadataResponse.getResponse().BatchResponse.GetMailboxMetadataResponse[0].meta[0]._attrs;
    for (name in objPrefs) {
        if(name && objPrefs[name]) {
            this._prefs[name] = objPrefs[name];
            if(name != "non_working_hrs") {
                this._prefFields[name].value = this._prefs[name] || "";
            }else {
                this._prefFields[name].checked = (this._prefs[name] == 'true'); 
            }
        }
    }
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