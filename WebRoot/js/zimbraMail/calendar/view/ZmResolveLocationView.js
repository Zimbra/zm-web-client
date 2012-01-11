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
 * View that displays the location conflicts and possible alternate locations
 * @constructor
 * @class
 *
 *  @author Vince Bellows
 *
 * @param parent        [ZmResolveLocationConflictDialog]   parent dialog
 * @param controller	[ZmApptComposeController]	        compose controller
 * @param apptEditView	[ZmApptEditView]	                the appt edit view
 * @param id		    [string]	                        id for the view
 *
 */
ZmResolveLocationView = function(parent, controller, apptEditView, id ) {
    if (arguments.length == 0) { return; }


    var headerList = [{_field:"date",     _width:150, _label:ZmMsg.date},
                      {_field:"location", _width:200, _label:ZmMsg.location}];

    var params = {parent: parent, posStyle: DwtControl.RELATIVE_STYLE, view: id,
                  className:"ZmResolveConflictList DwtListView"};
	DwtListView.call(this, params);

	this._controller = controller;
	this._editView = apptEditView;

	this._rendered = false;
    this._normalClass = DwtListView.ROW_CLASS;
    this.setMultiSelect(false);

};

ZmResolveLocationView.prototype = new DwtListView;
ZmResolveLocationView.prototype.constructor = ZmResolveLocationView;

ZmResolveLocationView.NO_SELECTION = "NONE";

ZmResolveLocationView.prototype.toString =
function() {
	return "ZmResolveLocationView";
}

ZmResolveLocationView.prototype.set =
function(params) {
    DwtListView.prototype.set.call(this, params.list);
};

ZmResolveLocationView.prototype._setNoResultsHtml =
function() {
    var	div = document.createElement("div");
    var elText = document.createTextNode(ZmMsg.noConflicts);
    div.appendChild(elText);
    this._addRow(div);
};

ZmResolveLocationView.prototype.setLoadingHtml =
function() {
    this.removeAll();
    var	div = document.createElement("div");
    div.innerHTML = AjxTemplate.expand("calendar.Appointment#AlternateLocation-Loading");
    this._addRow(div);
};

ZmResolveLocationView.prototype._renderList =
function(list, noResultsOk, doAdd) {
    var params = {};
    var htmlArr = [];
    // Add the header
    htmlArr.push(AjxTemplate.expand("calendar.Appointment#ResolveLocationConflictHeader", params));
    var item;

    // Add the list items, consisting of the date of the conflict, and a select dropdown
    // showing the alternate location suggestions
    this._selectLocation = [];
	if (list instanceof AjxVector && list.size()) {
		var size = list.size();
        var ids = [];
        var even = true;
        // Add the rows, one per conflict date
		for (var i = 0; i < size; i++) {
			item = list.get(i);

            var id = this.associateItemWithElement(item, null, null, null);
            ids.push(id);

            var dateStr = AjxDateUtil.simpleComputeDateStr(new Date(item.inst.s));
            params = {
                id:        id,
                date:      dateStr,
                className: even ? "ZmResolveLocationConflictEven" : "ZmResolveLocationConflictOdd"
            };
            even = !even;
            htmlArr.push(AjxTemplate.expand("calendar.Appointment#ResolveLocationConflict", params));
		}
		if (htmlArr.length) {
			this._parentEl.innerHTML = htmlArr.join("");
		}

        // Create the pulldowns that provide the possible valid alternate locations
        for (var i = 0; i < ids.length; i++) {
            item = list.get(i);
            var el = document.getElementById(ids[i] + "_alternatives");
            if (item.enabled) {
                var select = this._createSelectionDropdown(el, item);
                this._selectLocation.push(select);
            } else {
                // Multiple locations already specified - not supported for now, just display
                el.innerHTML = AjxStringUtil.htmlEncode(item.originalLocation);
            }
        }

	} else if (!noResultsOk) {
		this._setNoResultsHtml();
	}
};

ZmResolveLocationView.prototype._createSelectionDropdown =
function(el, listItem) {
    var select = new DwtSelect({parent:this, congruent:true,
        posStyle:DwtControl.RELATIVE_STYLE});
    select.reparentHtmlElement(el);
    var options = listItem.alternateLocationInfo;
    select.addOption(ZmMsg.selectAlternateLocation, false,
        ZmResolveLocationView.NO_SELECTION);
    // Add each of the valid alternate locations
    for (var i = 0; i < options.size(); i++) {
        var locInfo = options.get(i);
        var name = this.formatLocation(locInfo.name);
        select.addOption(name, (listItem.originalLocation == locInfo.email), locInfo.email);
    }
    // Add <HR> and 'No Location'
    select.addHR();
    select.addOption(ZmMsg.noLocation, (listItem.originalLocation == ZmMsg.noLocation),
        null, null, "ZmResolveNoLocationSelect ZWidgetTitle");
    return select;
}

ZmResolveLocationView.prototype.formatLocation =
function(name) {
    // Limit the alternate location text to 40 characters
    if(name && name.length > 40) {
        name = name.substring(0, 40) + '...';
    }
    return name;
};

ZmResolveLocationView.prototype.getAlternateLocation =
function(index) {
    var location = null;
    var select = this._selectLocation[index];
    if (select) {
        location = select.getValue();
    }
    return location;
}

ZmResolveLocationView.prototype._itemSelected =
function(itemDiv, ev) {
}