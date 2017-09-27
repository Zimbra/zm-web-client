/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a list view for location suggestions
 * @constructor
 * @class
 *
 *  @author Vince Bellows
 *
 * @param parent			[ZmScheduleAssistantView]	the smart scheduler view
 * @param controller		[ZmApptComposeController]	the appt compose controller
 * @param apptEditView		[ZmApptEditView]	        the appt edit view
 */
ZmLocationSuggestionView = function(parent, controller, apptEditView, className) {
    ZmSuggestionsView.call(this, parent, controller, apptEditView, ZmId.VIEW_SUGGEST_LOCATION_PANE, false, className);
    this._warning = false;
    this._emailToDivIdMap = {};
};

ZmLocationSuggestionView.prototype = new ZmSuggestionsView;
ZmLocationSuggestionView.prototype.constuctor = ZmLocationSuggestionView;

ZmLocationSuggestionView.prototype.toString =
function() {
	return "ZmLocationSuggestionView";
}

ZmLocationSuggestionView.prototype._createItemHtml =
function (item) {
    var id = this.associateItemWithElement(item, null, null, null);

    var params = {
        id: id,
        locationName: item.name,
        locationDescription: item.description
    };
    return AjxTemplate.expand("calendar.Appointment#LocationSuggestion", params);
};

ZmLocationSuggestionView.prototype._getItemId =
function(item) {
    var id;
    if (item && item.email) {
        id = this._emailToDivIdMap[item.email];
        if (!id) {
            // No email->id mapping - first time accessed, so generate an id and create a mapping.
            // Return the id, which will be used as the id of the containing div.
            id = ZmListView.prototype._getItemId.call(this, item);
            this._emailToDivIdMap[item.email] = id;
        }
    }
    return id;
};

ZmLocationSuggestionView.prototype.set =
function(params) {
    this._emailToDivIdMap = {};
    this._items = params.locationInfo.locations;
    ZmListView.prototype.set.call(this, params.locationInfo.locations);
};

ZmLocationSuggestionView.prototype.handleLocationOverflow =
function() {
    var locTxt = this._locSelect.getText();
    if(locTxt && locTxt.length > 15) {
        locTxt = locTxt.substring(0, 15) + '...';
        this._locSelect.setText(locTxt);
    }
};

ZmLocationSuggestionView.prototype._itemSelected =
function(itemDiv, ev) {
    ZmListView.prototype._itemSelected.call(this, itemDiv, ev);

    var locationInfo = this.getItemFromElement(itemDiv);
    if(locationInfo != null) {
        var locationObj = locationInfo.locationObj;
        var locationStr = locationInfo.email;
        this._editView.updateLocation(locationObj, locationStr);
        this.setToolTipContent(null);
    }
};

ZmLocationSuggestionView.prototype._setNoResultsHtml =
function() {
    var div = document.createElement("div");
    Dwt.addClass(div, 'NoSuggestions');
    var elText = document.createTextNode(ZmMsg.noLocations);
    div.appendChild(elText);
    this._addRow(div);
};

ZmLocationSuggestionView.prototype.setWarning =
function(warning) {
    this._warning = warning;
}


ZmLocationSuggestionView.prototype._renderList =
function(list, noResultsOk, doAdd) {
    var warningHtml = "";
    if (this._warning) {
        warningHtml = AjxTemplate.expand("calendar.Appointment#LocationSuggestion-Warning");
    }
    ZmSuggestionsView.prototype._renderList.call(this, list, noResultsOk, doAdd, warningHtml);
}

ZmLocationSuggestionView.prototype.getToolTipContent =
function(ev) {
    var tooltip = "";
    var div = this.getTargetItemDiv(ev);
    if (div) {
        var item = this.getItemFromElement(div);
        //show tooltip only if there is additional data
        if(item && (item.description || item.contactMail || item.capacity)) {
            tooltip = AjxTemplate.expand("calendar.Appointment#LocationSuggestionTooltip",
                        {name:        item.name,
                         description: item.description,
                         contactMail: item.contactMail,
                         capacity:    item.capacity
                        });
        }
    }
    return tooltip;
};
