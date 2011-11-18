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
ZmLocationSuggestionView = function(parent, controller, apptEditView) {
    ZmSuggestionsView.call(this, parent, controller, apptEditView, ZmId.VIEW_SUGGEST_LOCATION_PANE, false);
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

ZmLocationSuggestionView.prototype.set =
function(params) {
    this._items = params.locationInfo.locations;
    ZmListView.prototype.set.call(this, params.locationInfo.locations);
    //ZmSuggestionsView.prototype.set.call(this, params);
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
    }
};

ZmLocationSuggestionView.prototype._setNoResultsHtml =
function() {
    var	div = document.createElement("div");
    var elText = document.createTextNode(ZmMsg.noLocations);
    div.appendChild(elText);
    this._addRow(div);
};
