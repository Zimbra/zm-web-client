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
    if (item.email) {
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
    var	div = document.createElement("div");
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
        if(item) {
            tooltip = AjxTemplate.expand("calendar.Appointment#LocationSuggestionTooltip",
                        {name:        item.name,
                         description: item.description,
                         contactMail: item.contactMail,
                         capacity:    item.capacity
                        });
        }
    }
    var consoleText = tooltip;
    if (!consoleText) {
        consoleText = "None";
    } else if(consoleText.length > 15) {
        consoleText = consoleText.substring(0, 15) + '...';
    }
    console.log("getToolTipContent, div = " + (div ? div.id : "null") + ", text = " + consoleText);
    return tooltip;
};
