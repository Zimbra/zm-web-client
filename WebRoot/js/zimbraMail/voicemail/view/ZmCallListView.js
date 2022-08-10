/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2007, 2008, 2009, 2010, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

ZmCallListView = function(parent, controller, dropTgt) {
	var headerList = this._getHeaderList();
	ZmVoiceListView.call(this, {parent:parent, posStyle:Dwt.ABSOLUTE_STYLE,
								view:ZmId.VIEW_CALL_LIST, type:ZmItem.CALL, controller:controller,
								headerList:headerList, dropTgt:dropTgt});
}
ZmCallListView.prototype = new ZmVoiceListView;
ZmCallListView.prototype.constructor = ZmCallListView;

ZmCallListView.prototype.toString = function() {
	return "ZmCallListView";
};

ZmCallListView.FROM_WIDTH = ZmMsg.COLUMN_WIDTH_FROM_CALL;
ZmCallListView.DURATION_WIDTH = null; // Auto
ZmCallListView.DATE_WIDTH = ZmMsg.COLUMN_WIDTH_DATE_CALL;

ZmCallListView.prototype.createHeaderHtml = 
function(defaultColumnSort) {
	ZmVoiceListView.prototype.createHeaderHtml.call(this, defaultColumnSort);
	var isPlaced = this._getCallType() == ZmVoiceFolder.PLACED_CALL;
	this._setColumnHeader(ZmVoiceListView.F_CALLER, isPlaced ? ZmMsg.to : ZmMsg.from);
	this._setColumnHeader(ZmVoiceListView.F_DATE, isPlaced ? ZmMsg.timePlaced : ZmMsg.received);
};

ZmCallListView.prototype._setColumnHeader = 
function(fieldId, label) {
	var headerCol = this._headerHash[fieldId];
	var index = headerCol._index;
	var fromColSpan = document.getElementById(DwtId.getListViewHdrId(DwtId.WIDGET_HDR_LABEL, this._view, headerCol._field));
	if (fromColSpan) {
		fromColSpan.innerHTML = "&nbsp;" + label;
	}
	if (this._colHeaderActionMenu && !AjxUtil.isUndefined(index)) this._colHeaderActionMenu.getItem(index).setText(label);
};

ZmCallListView.prototype._getHeaderList =
function() {

	var headerList = [];
	headerList.push(new DwtListHeaderItem({field:ZmVoiceListView.F_CALLER, text:ZmMsg.from, width:ZmCallListView.FROM_WIDTH, resizeable:true}));
	headerList.push(new DwtListHeaderItem({field:ZmVoiceListView.F_DURATION, text:ZmMsg.duration, width:ZmCallListView.DURATION_WIDTH, sortable:ZmVoiceListView.F_DURATION, resizeable:true}));
	headerList.push(new DwtListHeaderItem({field:ZmVoiceListView.F_DATE, text:ZmMsg.received, width:ZmCallListView.DATE_WIDTH, sortable:ZmVoiceListView.F_DATE, resizeable:true}));

	return headerList;
};

ZmCallListView.prototype._getCellContents =
function(htmlArr, idx, voicemail, field, colIdx, params) {
	if (field == ZmVoiceListView.F_DURATION) {
		htmlArr[idx++] = AjxDateUtil.computeDuration(voicemail.duration);
	} else {
		idx = ZmVoiceListView.prototype._getCellContents.apply(this, arguments);
	}
	
	return idx;
};

ZmCallListView.prototype._getHeaderToolTip =
function(prefix) {
	if (prefix == ZmVoiceListView.F_CALLER) {
		var isPlaced = this._getCallType() == ZmVoiceFolder.PLACED_CALL;
		return isPlaced ? ZmMsg.to : ZmMsg.from;
	} else if (prefix == ZmVoiceListView.F_DURATION) {
		return ZmMsg.sortByDuration;
	} else if (prefix == ZmVoiceListView.F_DATE) {
		return this._getCallType() == ZmVoiceFolder.PLACED_CALL ? ZmMsg.sortByTimePlaced : ZmMsg.sortByReceived;
	}
	return null;
};

ZmCallListView.prototype._getItemTooltip =
function(call) {
	var location;
	var party = this.getCallingParty(call);
	if (party.city && party.state && party.country) {
		if (!this._locationFormatterCityStateCountry) {
			this._locationFormatterCityStateCountry = new AjxMessageFormat(ZmMsg.locationFormatCityStateCountry);
		}
		location = this._locationFormatterCityStateCountry.format([party.city, party.state, party.country]);
	} else 	if (party.city && party.country) {
		if (!this._locationFormatterCityCountry) {
			this._locationFormatterCityCountry = new AjxMessageFormat(ZmMsg.locationFormatCityCountry);
		}
		location = this._locationFormatterCityCountry.format([party.city, party.country]);
	} else {
		location = ZmMsg.unknown;
	}
	var callerLabel = (this._getCallType() == ZmVoiceFolder.PLACED_CALL) ? ZmMsg.toLabel : ZmMsg.fromLabel;
	var data = { 
		image: "Img" + this._controller._folder.getIcon(), 
		callerLabel: callerLabel, 
		caller: this._getCallerHtml(call), 
		duration: AjxDateUtil.computeDuration(call.duration),
		date: AjxDateUtil.computeDateTimeString(call.date),
		location: location
	};
	var html = AjxTemplate.expand("voicemail.Voicemail#CallTooltip", data);
	return html;
};

ZmCallListView.prototype._getNoResultsMessage =
function() {
	return ZmMsg.noCallResults;
};


