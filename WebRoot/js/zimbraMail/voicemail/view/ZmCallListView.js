/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
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

ZmCallListView.FROM_WIDTH = 190;
ZmCallListView.DURATION_WIDTH = null; // Auto
ZmCallListView.DATE_WIDTH = 180;

ZmCallListView.prototype.createHeaderHtml = 
function(defaultColumnSort) {
	ZmVoiceListView.prototype.createHeaderHtml.call(this, defaultColumnSort);
	var isPlaced = this._getCallType() == ZmVoiceFolder.PLACED_CALL;
	this._setColumnHeader(ZmVoiceListView.F_CALLER, isPlaced ? ZmMsg.to : ZmMsg.from);
	this._setColumnHeader(ZmVoiceListView.F_DATE, isPlaced ? ZmMsg.placed : ZmMsg.received);
};

ZmCallListView.prototype._setColumnHeader = 
function(fieldId, label) {
	var index = this.getColIndexForId(fieldId);
	var fromColSpan = document.getElementById(DwtListView.HEADERITEM_LABEL + this._headerList[index]._id);
	if (fromColSpan) fromColSpan.innerHTML = "&nbsp;" + label;
	if (this._colHeaderActionMenu) this._colHeaderActionMenu.getItem(index).setText(label);
};

ZmCallListView.prototype._getHeaderList =
function() {

	var headerList = [];
	headerList.push(new DwtListHeaderItem(ZmVoiceListView.F_CALLER, ZmMsg.from, null, ZmCallListView.FROM_WIDTH, null, true));
	headerList.push(new DwtListHeaderItem(ZmVoiceListView.F_DURATION, ZmMsg.duration, null, ZmCallListView.DURATION_WIDTH, ZmVoiceListView.F_DURATION, true));
	headerList.push(new DwtListHeaderItem(ZmVoiceListView.F_DATE, ZmMsg.received, null, ZmCallListView.DATE_WIDTH, ZmVoiceListView.F_DATE, true));

	return headerList;
};

ZmCallListView.prototype.getPrintHtml =
function() {
	var buffer = [];
	var rowArgs = {};
	for(var i = 0, count = this._list.size(); i < count; i++) {
		var item = this._list.get(i);
		rowArgs.caller = this._getCallerHtml(item);
		rowArgs.duration = AjxDateUtil.computeDuration(item.duration);
		rowArgs.date = AjxDateUtil.simpleComputeDateStr(item.date);
		AjxTemplate.expand("voicemail.Voicemail#ZmCallListPrintViewRow", rowArgs, buffer);
	}
	
	var isPlaced = this._getCallType() == ZmVoiceFolder.PLACED_CALL;
	var args = {
		name: this._folder.getName(false, 0, true),
		callerHeader: isPlaced ? ZmMsg.to : ZmMsg.from,
		dateHeader: isPlaced ? ZmMsg.placed : ZmMsg.received,
		rows: buffer.join("")
	}
	return  AjxTemplate.expand("voicemail.Voicemail#ZmCallListPrintView", args);
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

ZmCallListView.prototype._getHeaderTooltip =
function(prefix) {
	if (prefix == ZmVoiceListView.F_CALLER) {
		var isPlaced = this._getCallType() == ZmVoiceFolder.PLACED_CALL;
		return isPlaced ? ZmMsg.to : ZmMsg.from;
	} else if (prefix == ZmVoiceListView.F_DURATION) {
		return ZmMsg.sortByDuration;
	} else if (prefix == ZmVoiceListView.F_DATE) {
		return ZmMsg.sortByReceived;
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


