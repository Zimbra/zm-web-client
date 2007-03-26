/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmCallListView(parent, controller, dropTgt) {
	if (arguments.length == 0) return;
	var headerList = this._getHeaderList();
	ZmVoiceListView.call(this, parent, null, Dwt.ABSOLUTE_STYLE, ZmController.CALLLIST_VIEW, ZmItem.CALL, controller, headerList, dropTgt);
}
ZmCallListView.prototype = new ZmVoiceListView;
ZmCallListView.prototype.constructor = ZmCallListView;

ZmCallListView.prototype.toString = function() {
	return "ZmCallListView";
};

ZmCallListView.FROM_WIDTH = 150;
ZmCallListView.DURATION_WIDTH = 120;
ZmCallListView.DATE_WIDTH = null; // Auto

// Resuse existing field codes rather than adding voice-specific stuff to ZmList...
ZmCallListView.F_CALLER = ZmItem.F_PARTICIPANT;
ZmCallListView.F_SIZE = ZmItem.F_SIZE;
ZmCallListView.F_DATE = ZmItem.F_DATE;

ZmCallListView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, ": ", ZmMsg.voicemail].join("");
};

ZmCallListView.prototype.createHeaderHtml = 
function(defaultColumnSort) {
	ZmVoiceListView.prototype.createHeaderHtml.call(this, defaultColumnSort);
	var isPlaced = this._callType == ZmVoiceFolder.PLACED_CALL;
	var callerLabel = isPlaced ? ZmMsg.to : ZmMsg.from;
	this._setColumnHeader(ZmCallListView.F_CALLER, callerLabel);
	var dateLabel = isPlaced ? ZmMsg.placed : ZmMsg.received;	
	this._setColumnHeader(ZmCallListView.F_DATE, dateLabel);
};

ZmCallListView.prototype._setColumnHeader = 
function(fieldId, label) {
	var index = this.getColIndexForId(ZmListView.FIELD_PREFIX[fieldId]);
	var fromColSpan = document.getElementById(DwtListView.HEADERITEM_LABEL + this._headerList[index]._id);
	if (fromColSpan) fromColSpan.innerHTML = "&nbsp;" + label;
	if (this._colHeaderActionMenu) this._colHeaderActionMenu.getItem(index).setText(label);
};

ZmCallListView.prototype._getHeaderList =
function() {

	var headerList = [];
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmCallListView.F_CALLER], ZmMsg.from, null, ZmCallListView.FROM_WIDTH, ZmCallListView.F_CALLER, true));
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmCallListView.F_SIZE], ZmMsg.duration, null, ZmCallListView.DURATION_WIDTH, ZmCallListView.F_SIZE, true));
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmCallListView.F_DATE], ZmMsg.received, null, ZmCallListView.DATE_WIDTH, ZmCallListView.F_DATE, true));

	return headerList;
};

ZmCallListView.prototype._createItemHtml =
function(voicemail, now, isDndIcon, isMixedView, myDiv) {
	
	var	div = this._getDiv(voicemail, isDndIcon, false);
	var htmlArr = [];
	var idx = 0;
	
	idx = this._getTable(htmlArr, idx, isDndIcon);
	var className = voicemail.isUnheard ? "Unread" : "";
	idx = this._getRow(htmlArr, idx, voicemail, className);
	var columnCount = this._headerList.length;

	for (var i = 0; i < columnCount; i++) {
		if (!this._headerList[i]._visible)
			continue;
		var width = this._getFieldWidth(i);
		var id = this._headerList[i]._id;
		htmlArr[idx++] = "<td width=";
		htmlArr[idx++] = width;
		var prefix = id.length ? id.charAt(0) : null;
		if (prefix) {
			htmlArr[idx++] = " id='";
			htmlArr[idx++] = this._getFieldIdFromPrefix(voicemail, prefix);
			htmlArr[idx++] = "'";
		}
		htmlArr[idx++] = ">";
		
		if (id.indexOf(ZmListView.FIELD_PREFIX[ZmCallListView.F_CALLER]) == 0) {
			htmlArr[idx++] = this._getCallerNameHtml(voicemail);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmCallListView.F_SIZE]) == 0) {
			htmlArr[idx++] = AjxDateUtil.computeDuration(voicemail.duration);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmCallListView.F_DATE]) == 0) {
			htmlArr[idx++] = AjxDateUtil.computeDateStr(now, voicemail.date);
		}
		htmlArr[idx++] = "</td>";
	}	
	
	htmlArr[idx++] = "</tr></table>";
	
	div.innerHTML = htmlArr.join("");
	return div;
};

