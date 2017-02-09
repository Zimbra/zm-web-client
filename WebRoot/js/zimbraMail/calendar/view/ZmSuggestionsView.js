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
 * Creates a list view for time or location suggestions
 * @constructor
 * @class
 *
 *  @author Vince Bellows
 *
 * @param parent			[ZmScheduleAssistantView]	the smart scheduler view
 * @param controller		[ZmApptComposeController]	the appt compose controller
 * @param apptEditView		[ZmApptEditView]	        the appt edit view
 */
ZmSuggestionsView = function(parent, controller, apptEditView, id, showHeaders, className) {
    if (arguments.length == 0) { return; }

    var params = {parent: parent, posStyle: DwtControl.RELATIVE_STYLE, view: id};
    if (className) {
        params.className = className;
    }
	ZmListView.call(this, params);

	this._controller = controller;
	this._editView = apptEditView;

	this._rendered = false;
	this._kbMgr = appCtxt.getKeyboardMgr();
    this._normalClass = DwtListView.ROW_CLASS;
    this._selectedClass = [DwtListView.ROW_CLASS, DwtCssStyle.SELECTED].join("-");
    this.setMultiSelect(false);

    this._showHeaders = showHeaders;
};

ZmSuggestionsView.prototype = new ZmListView;
ZmSuggestionsView.prototype.constructor = ZmSuggestionsView;

ZmSuggestionsView.prototype.toString =
function() {
	return "ZmSuggestionsView";
}

ZmSuggestionsView.prototype.set =
function(params) {
    this._items = params.items;
    this._itemIndex = params.itemIndex;
    ZmListView.prototype.set.call(this, params.list);
};

ZmSuggestionsView.prototype._setNoResultsHtml =
function() {};

ZmSuggestionsView.prototype.setShowSuggestionsHTML =
function(date) {};

ZmSuggestionsView.prototype.setLoadingHtml =
function() {
    this.removeAll();
    var	div = document.createElement("div");
    div.innerHTML = AjxTemplate.expand("calendar.Appointment#TimeSuggestion-Loading");
    this._addRow(div);
};

ZmSuggestionsView.prototype._getHeaderKey =
function(item) {
    return '';
}

ZmSuggestionsView.prototype._renderList =
function(list, noResultsOk, doAdd, prefixHtml) {
	if (list instanceof AjxVector && list.size()) {
		var now = new Date();
		var size = list.size();
		var htmlArr = [], hdrKey, hdrListed = {};
		if (prefixHtml) {
		    htmlArr.push(prefixHtml);
		}
		var nonZeroAvailableFound = false;
		for (var i = 0; i < size; i++) {
			var item = list.get(i);
			nonZeroAvailableFound = nonZeroAvailableFound || item.availableUsers > 0;
			//Note that this works since it's sorted from higher available down, so first we'll get the non zero.
			if (item.availableUsers === 0 && nonZeroAvailableFound) {
				break; //ignore 0 available if we got items with more than 0 available.
			}

            if (this._showHeaders) {
                hdrKey = this._getHeaderKey(item);
                if(!hdrListed[hdrKey]) {
                    var sectionHeaderHtml = this._renderListSectionHdr(hdrKey, item);
                    if(sectionHeaderHtml) htmlArr.push(sectionHeaderHtml);
                    hdrListed[hdrKey] = true;
                }
            }

			var div = this._createItemHtml(item, {now:now}, !doAdd, i);
			if (div) {
				if (div instanceof Array) {
					for (var j = 0; j < div.length; j++){
						this._addRow(div[j]);
					}
				} else if (div.tagName || doAdd) {
					this._addRow(div);
				} else {
					htmlArr.push(div);
				}
			}
		}
		if (htmlArr.length) {
			this._parentEl.innerHTML = htmlArr.join("");
		}
	} else if (!noResultsOk) {
		this._setNoResultsHtml();
	}
};



