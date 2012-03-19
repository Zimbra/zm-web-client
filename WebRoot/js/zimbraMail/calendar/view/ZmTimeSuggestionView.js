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
 * Creates a list view for time suggestions
 * @constructor
 * @class
 *
 *  @author Sathishkumar Sugumaran
 *
 * @param parent			[ZmScheduleAssistantView]	the smart scheduler view
 * @param controller		[ZmApptComposeController]	the appt compose controller
 * @param apptEditView		[ZmApptEditView]	        the appt edit view
 */
ZmTimeSuggestionView = function(parent, controller, apptEditView) {
    ZmSuggestionsView.call(this, parent, controller, apptEditView, ZmId.VIEW_SUGGEST_TIME_PANE, true);
    this._sectionHeaderHtml = {};
}
ZmTimeSuggestionView.prototype = new ZmSuggestionsView;
ZmTimeSuggestionView.prototype.constructor = ZmTimeSuggestionView;

ZmTimeSuggestionView.prototype.toString =
function() {
	return "ZmTimeSuggestionView";
}

ZmTimeSuggestionView._VALUE = 'value';
ZmTimeSuggestionView._ITEM_INFO = 'iteminfo';
ZmTimeSuggestionView.SHOW_MORE_VALUE = '-1';
ZmTimeSuggestionView.F_LABEL = 'ts';
ZmTimeSuggestionView.COL_NAME	= "t";

ZmTimeSuggestionView.prototype.set =
function(params) {
    this._totalUsers = params.totalUsers;
    this._totalLocations = params.totalLocations;
    this._duration = params.duration;
    this._startDate = params.timeFrame.start;

    ZmSuggestionsView.prototype.set.call(this, params);
};

ZmTimeSuggestionView.prototype._createItemHtml =
function (item) {
    var id = this.associateItemWithElement(item, null, null, null);

    var attendeeImage = "AttendeeOrange";
    var locationImage = "LocationRed";

    if(item.availableUsers == this._totalUsers) attendeeImage = "AttendeeGreen";

    if(item.availableUsers < Math.ceil(this._totalUsers/2)) attendeeImage = "AttendeeRed";
    if(item.availableLocations >0) locationImage = "LocationGreen";

    var params = {
        id: id,
        item: item,
        timeLabel: AjxDateFormat.getTimeInstance(AjxDateFormat.SHORT).format(new Date(item.startTime)),
        locationCountStr: item.availableLocations,
        attendeeImage: attendeeImage,
        locationImage: locationImage,
        totalUsers: this._totalUsers, 
        totalLocations: this._totalLocations
    };
    return AjxTemplate.expand("calendar.Appointment#TimeSuggestion", params);
};

ZmTimeSuggestionView.prototype._getHeaderList =
function() {
    this._headerItem = (new DwtListHeaderItem({field:ZmTimeSuggestionView.COL_NAME, text:'&nbsp;'}));
	return [
	    this._headerItem	
	];
};

ZmTimeSuggestionView.prototype._itemSelected =
function(itemDiv, ev) {
    ZmListView.prototype._itemSelected.call(this, itemDiv, ev);

    var item = this.getItemFromElement(itemDiv);
    if(item) {
        this._editView.setDate(new Date(item.startTime), new Date(item.endTime));
        //user clicked the link directly
        if (ev.target && (ev.target.className == "removeLink" || ev.target.className == "ImgLocationGreen" || ev.target.className == "ImgLocationRed")) {
            var menu = this._createLocationsMenu(item);
            menu.popup(0, ev.docX, ev.docY);
        }
    }
};

ZmTimeSuggestionView.prototype.getToolTipContent =
function(ev) {
	var div = this.getTargetItemDiv(ev);
	if (!div) { return; }
	var id = ev.target.id || div.id;
	if (!id) { return ""; }

    var tooltip;
    var item = this.getItemFromElement(div);
    if(item) {
        var params = {item:item, ev:ev, div:div};
        tooltip = this._getToolTip(params);
    }
    return tooltip;
};

ZmTimeSuggestionView.prototype._getToolTip =
function(params) {
    var tooltip, target = params.ev.target, item = params.item;

    if(!item) return;

    //show all unavailable attendees on tooltip
    if(item.availableUsers < this._totalUsers) {

        //get unavailable attendees from available & total attendees list
        var freeUsers = [], busyUsers = [], attendee;
        for (var i = item.attendees.length; --i >=0;) {
            attendee = this._items[item.attendees[i]];
            freeUsers[attendee] = true;
        }

        var attendees = this._editView.getAttendees(ZmCalBaseItem.PERSON).getArray();
        var attEmail;

        var organizer = this._editView.getOrganizer();
        var orgEmail = organizer.getEmail();
        if (orgEmail instanceof Array) {
            orgEmail = orgEmail[0];
        }
        if(!freeUsers[orgEmail]) {
            busyUsers.push(organizer.getAttendeeText());
        }

        for (var i = 0; i < attendees.length; i++) {
            attendee = attendees[i];
            attEmail = attendees[i].getEmail();
            if (attEmail instanceof Array) {
                attEmail = attEmail[0];
            }
            if(!freeUsers[attEmail]) {
                busyUsers.push(attendee.getAttendeeText());
            }
        }

        if(busyUsers.length) tooltip = AjxTemplate.expand("calendar.Appointment#SuggestionTooltip", {attendees: busyUsers})
    }
    return tooltip;
};

//obsolete - will be removed as a part of clean up process
ZmTimeSuggestionView.prototype.switchLocationSelect =
function(item, id, ev) {
    var locId = id + "_loc";

    var locationC = document.getElementById(locId);
    if(!locationC) return;

    var roomsAvailable = (item.locations.length > 0);

    if(!this._locSelect && !roomsAvailable) {
        return;
    }

    if(roomsAvailable) locationC.innerHTML = "";

    if(!this._locSelect) {
        this._locSelect = new DwtSelect({parent:this, parentElement: locId});
        this._locSelect.addChangeListener(new AjxListener(this, this._locationListener));
        this._locSelect.dynamicButtonWidth();
    }else {
        if(roomsAvailable) this._locSelect.reparentHtmlElement(locId);
        this._locSelect.clearOptions();
        if(this._locSelect.itemId != id) this._restorePrevLocationInfo();
    }

    this._locSelect.itemId = id;
    this._locSelect.itemInfo = item;

    var location, name, locationObj;
    for (var i = item.locations.length; --i >=0;) {
        location = this._items[item.locations[i]];
        locationObj = this.parent.getLocationByEmail(location);
        name = location;
        if(locationObj) {
            name = locationObj.getAttr(ZmResource.F_locationName) || locationObj.getAttr(ZmResource.F_name);
        }
        this._locSelect.addOption(name, false, location);

        if(item.locations.length - i > 20) {
            this._locSelect.addOption(ZmMsg.showMore, false, ZmTimeSuggestionView.SHOW_MORE_VALUE);
            break;
        }
    }

    //user clicked the link directly
    if (ev.target && (ev.target.className == "fakeAnchor")) {
        this._locSelect.popup();        
    }

    this.handleLocationOverflow();
};

ZmTimeSuggestionView.prototype._createLocationsMenu =
function(item) {
    var menu = this._locationsMenu = new ZmPopupMenu(this, null, null, this._controller);  
    var listener = new AjxListener(this, this._locationsMenuListener);

    var location, name, locationObj;
    for (var i = item.locations.length; --i >=0;) {
        location = this._items[item.locations[i]];
        locationObj = this.parent.getLocationByEmail(location);
        name = location;
        if(locationObj) {
            name = locationObj.getAttr(ZmResource.F_name) || locationObj.getAttr(ZmResource.F_locationName);
        }

        var mi = menu.createMenuItem(location, {style:DwtMenuItem.RADIO_STYLE, text: name});
        mi.addSelectionListener(listener);
        mi.setData(ZmTimeSuggestionView._VALUE, location);

        if(item.locations.length - i > 20) {
            mi = menu.createMenuItem(ZmTimeSuggestionView.SHOW_MORE_VALUE, {style:DwtMenuItem.RADIO_STYLE, text: ZmMsg.showMore});
            mi.addSelectionListener(listener);
            mi.setData(ZmTimeSuggestionView._VALUE, ZmTimeSuggestionView.SHOW_MORE_VALUE);
            mi.setData(ZmTimeSuggestionView._ITEM_INFO, item);
            break;
        }
    }

    return menu;
};

ZmTimeSuggestionView.prototype._locationsMenuListener =
function(ev) {

    var id = ev.item.getData(ZmTimeSuggestionView._VALUE)

    if(id == ZmTimeSuggestionView.SHOW_MORE_VALUE) {
        var itemInfo = ev.item.getData(ZmTimeSuggestionView._ITEM_INFO);
        if(itemInfo) this.showMore(itemInfo);
        return;
    }

    var itemIndex = this._itemIndex[id];
    var location = this._items[itemIndex];
    if(location) {
        var locationObj = this.parent.getLocationByEmail(location);
        this._editView.updateLocation(locationObj);
    }
};

ZmTimeSuggestionView.prototype.handleLocationOverflow =
function() {
    var locTxt = this._locSelect.getText();
    if(locTxt && locTxt.length > 15) {
        locTxt = locTxt.substring(0, 15) + '...';
        this._locSelect.setText(locTxt);
    }
};

//obsolete - will be removed as a part of clean up process
ZmTimeSuggestionView.prototype._restorePrevLocationInfo =
function() {
    var prevId = this._locSelect.itemId;
    var prevItemDiv = document.getElementById(prevId);
    var prevItem = prevItemDiv ? this.getItemFromElement(prevItemDiv) : null;
    if(prevItem) {
        var prevLoc = document.getElementById(prevId + '_loc');
        prevLoc.innerHTML = '<span class="fakeAnchor">' + AjxMessageFormat.format(ZmMsg.availableRoomsCount, [prevItem.availableLocations]) + '</span>';
    }
};

ZmTimeSuggestionView.prototype._locationListener =
function() {
    var id = this._locSelect.getValue();

    if(id == ZmTimeSuggestionView.SHOW_MORE_VALUE) {
        this.showMore(this._locSelect.itemInfo);
        return;
    }

    var itemIndex = this._itemIndex[id];
    var location = this._items[itemIndex];
    if(location) {
        var locationObj = this.parent.getLocationByEmail(location);
        this._editView.updateLocation(locationObj);
    }
    this.handleLocationOverflow();
};

ZmTimeSuggestionView.prototype.setNoAttendeesHtml =
function() {
    this.removeAll();
    var	div = document.createElement("div");
    div.innerHTML = AjxTemplate.expand("calendar.Appointment#TimeSuggestion-NoAttendees");
    this._addRow(div);
};

ZmTimeSuggestionView.prototype._setNoResultsHtml =
function() {
	var	div = document.createElement("div");
	var subs = {
		message: this._getNoResultsMessage(),
		type: this.type,
        id: this.getHTMLElId()
	};
	div.innerHTML = AjxTemplate.expand("calendar.Appointment#TimeSuggestion-NoSuggestions", subs);
	this._addRow(div);

    //add event handlers for no results action link
    this._searchAllId = this.getHTMLElId() + "_showall";
    this._searchAllLink = document.getElementById(this._searchAllId);
    if(this._searchAllLink) {
        this._searchAllLink._viewId = AjxCore.assignId(this);
        Dwt.setHandler(this._searchAllLink, DwtEvent.ONCLICK, AjxCallback.simpleClosure(ZmTimeSuggestionView._onClick, this, this._searchAllLink));
    }
};

ZmTimeSuggestionView.prototype.setShowSuggestionsHTML =
function(date) {
    if(this._date && this._date == date) {
        return;
    }
    this._date = date;
    this.removeAll();
	var	div = document.createElement("div");
    var params = [
        '<span class="fakeanchor" id="' + this.getHTMLElId() + '_showsuggestions">',
        '</span>',
        date
    ];
	var subs = {
		message: AjxMessageFormat.format(ZmMsg.showSuggestionsFor, params),
        id: this.getHTMLElId()
	};
	div.innerHTML = AjxTemplate.expand("calendar.Appointment#TimeSuggestion-ShowSuggestions", subs);
	this._addRow(div);

    //add event handlers for showing link
    this._suggestId = this.getHTMLElId() + "_showsuggestions";
    this._suggestLink = document.getElementById(this._suggestId);
    if(this._suggestLink) {
        this._suggestLink._viewId = AjxCore.assignId(this);
        Dwt.setHandler(this._suggestLink, DwtEvent.ONCLICK, AjxCallback.simpleClosure(ZmTimeSuggestionView._onClick, this, this._suggestLink));
    }
};

ZmTimeSuggestionView.prototype._getNoResultsMessage =
function() {
    var durationStr = AjxDateUtil.computeDuration(this._duration);
    return AjxMessageFormat.format(this._showOnlyGreenSuggestions ? ZmMsg.noGreenSuggestionsFound : ZmMsg.noSuggestionsFound, [this._startDate, durationStr]);
};

ZmTimeSuggestionView.prototype.showMore =
function(locationInfo) {

    var location, name, locationObj, items = new AjxVector();
    for (var i = locationInfo.locations.length; --i >=0;) {
        location = this._items[locationInfo.locations[i]];
        locationObj = this.parent.getLocationByEmail(location);
        if(locationObj) items.add(locationObj)
    }

    var attendeePicker = this._editView.getAttendeePicker(ZmCalBaseItem.LOCATION);
    attendeePicker.showSuggestedItems(items);    
};

ZmTimeSuggestionView.prototype._getHeaderColor = 
function(item) {
    var className = (item.availableUsers == this._totalUsers) ? "GreenLight" : "OrangeLight";
    if(item.availableUsers < Math.ceil(this._totalUsers/2)) className = "RedLight";
    return className;
};

ZmTimeSuggestionView.prototype._renderListSectionHdr =
function(hdrKey, item) {
    if(!this._sectionHeaderHtml[hdrKey]) {
        var htmlArr = [];
        var idx = 0;
        htmlArr[idx++] = "<table cellpadding=0 cellspacing=0 border=0 width=100% class='ZmTimeSuggestionView-Column ";
        htmlArr[idx++] =  this._getHeaderColor(item);        
        htmlArr[idx++] = "'><tr>";
        htmlArr[idx++] = "<td><div class='DwtListHeaderItem-label ";
        htmlArr[idx++] = "' style='padding:0px 0px 2px 2px;'>";
        htmlArr[idx++] = AjxMessageFormat.format(ZmMsg.availableCount, [item.availableUsers, this._totalUsers]);
        htmlArr[idx++] = "</div></td>";
        htmlArr[idx++] = "</tr></table>";
        this._sectionHeaderHtml[hdrKey] = htmlArr.join("");
   }

   return this._sectionHeaderHtml[hdrKey];
};

ZmTimeSuggestionView.prototype._getHeaderKey =
function(item) {
    return item.availableUsers + '-' + this._totalUsers;
}

ZmTimeSuggestionView._onClick =
function(el, ev) {
	var edv = AjxCore.objectWithId(el._viewId);
	if (edv) {
		edv._handleOnClick(el);
	}
};

ZmTimeSuggestionView.prototype._handleOnClick =
function(el) {
    if(!el || !el.id) return;
	// figure out which input field was clicked
	if (el.id == this._searchAllId) {
         this.parent.suggestAction(true, true);
	}else if (el.id == this._suggestId) {
         this.parent.overrideManualSuggestion(true);
         this.parent.suggestAction(true, false);
	}
};