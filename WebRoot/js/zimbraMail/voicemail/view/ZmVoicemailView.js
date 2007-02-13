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

function ZmVoicemailView(parent, appCtxt, controller, dropTgt) {
	var headerList = this._getHeaderList(appCtxt);
	ZmListView.call(this, parent, null, Dwt.ABSOLUTE_STYLE, ZmController.VOICEMAIL_VIEW, ZmItem.VOICEMAIL, controller, headerList, dropTgt);

	this._appCtxt = appCtxt;
	this._controller = controller;
	this._playing = null; // The voicemail currently loaded in the player.
}
ZmVoicemailView.prototype = new ZmListView;
ZmVoicemailView.prototype.constructor = ZmVoicemailView;

ZmVoicemailView.prototype.toString = function() {
	return "ZmVoicemailView";
};

ZmVoicemailView.FROM_WIDTH = 150;
ZmVoicemailView.PLAYING_WIDTH = 16;
ZmVoicemailView.DURATION_WIDTH = 120;
ZmVoicemailView.DATE_WIDTH = 60;
ZmVoicemailView.SUBJECT_WIDTH = null; // Auto

var i = 1;
ZmVoicemailView.F_CALLER = i++;
ZmVoicemailView.F_PLAYING = i++;
ZmVoicemailView.F_SIZE = i++;
ZmVoicemailView.F_DATE = i++;
ZmVoicemailView.F_SUBJECT = i++;
delete i;

ZmVoicemailView.FIELD_PREFIX = {};
ZmVoicemailView.FIELD_PREFIX[ZmVoicemailView.F_CALLER]	= "a";
ZmVoicemailView.FIELD_PREFIX[ZmVoicemailView.F_PLAYING]	= "b";
ZmVoicemailView.FIELD_PREFIX[ZmVoicemailView.F_SIZE]	= "c";
ZmVoicemailView.FIELD_PREFIX[ZmVoicemailView.F_DATE]	= "d";
ZmVoicemailView.FIELD_PREFIX[ZmVoicemailView.F_SUBJECT]	= "e";

ZmVoicemailView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, ": ", ZmMsg.voicemail].join("");
};

ZmVoicemailView.prototype.setPlaying =
function(voicemail) {
	if (voicemail == this._playing)  {
		return;
	}
		
	var prefix = ZmVoicemailView.FIELD_PREFIX[ZmVoicemailView.F_PLAYING];
	var columnIndex = this._getColumnIndexByPrefix(prefix);
	if (this._playing) {
		this._showPlayingImage(this._playing, columnIndex, false);
	}
	this._playing = voicemail;
	if (this._playing) {
		this._showPlayingImage(this._playing, columnIndex, true);
	}
};

ZmVoicemailView.prototype._getColumnIndexByPrefix =
function(prefix) {
	var playingColumn = this.getColumnBy
	var columnCount = this._headerList.length;
	for (var i = 0, count = this._headerList.length; i < count; i++) {
		if (this._headerList[i]._id.indexOf(prefix) == 0) {
			return i;
		}
	}
	return 0;
};

ZmVoicemailView.prototype._showPlayingImage =
function(voicemail, columnIndex, show) {
	
	var element = this._getElFromItem(voicemail);
	var table = element.firstChild;
	var cell = table.rows[0].cells[columnIndex];
	cell.className = show ? "ImgPlaying" : "";
};

ZmVoicemailView.prototype._getHeaderList =
function(appCtxt) {

	var headerList = new Array();
	headerList.push(new DwtListHeaderItem(ZmVoicemailView.FIELD_PREFIX[ZmVoicemailView.F_CALLER], ZmMsg.from, null, ZmVoicemailView.FROM_WIDTH, ZmVoicemailView.F_CALLER, true));
	headerList.push(new DwtListHeaderItem(ZmVoicemailView.FIELD_PREFIX[ZmVoicemailView.F_PLAYING], "", null, ZmVoicemailView.PLAYING_WIDTH, null, true));
	headerList.push(new DwtListHeaderItem(ZmVoicemailView.FIELD_PREFIX[ZmVoicemailView.F_SIZE], ZmMsg.duration, null, ZmVoicemailView.DURATION_WIDTH, ZmVoicemailView.F_SIZE, true));
	headerList.push(new DwtListHeaderItem(ZmVoicemailView.FIELD_PREFIX[ZmVoicemailView.F_DATE], ZmMsg.received, null, ZmVoicemailView.DATE_WIDTH, ZmVoicemailView.F_DATE, true));
	headerList.push(new DwtListHeaderItem(ZmVoicemailView.FIELD_PREFIX[ZmVoicemailView.F_SUBJECT], ZmMsg.subjectNotes, null, ZmVoicemailView.SUBJECT_WIDTH, null, true));

	return headerList;
};

ZmVoicemailView.prototype._createItemHtml =
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
		htmlArr[idx++] = "<td width=";
		htmlArr[idx++] = width;
		htmlArr[idx++] = ">";
		
		var id = this._headerList[i]._id;
		if (id.indexOf(ZmVoicemailView.FIELD_PREFIX[ZmVoicemailView.F_CALLER]) == 0) {
			htmlArr[idx++] = voicemail.caller;
		} else if (id.indexOf(ZmVoicemailView.FIELD_PREFIX[ZmVoicemailView.F_PLAYING]) == 0) {
			htmlArr[idx++] = voicemail == this._playing ? AjxImg.getImageHtml("Playing") : "";
		} else if (id.indexOf(ZmVoicemailView.FIELD_PREFIX[ZmVoicemailView.F_SIZE]) == 0) {
			htmlArr[idx++] = AjxDateUtil.computeDuration(voicemail.duration);
		} else if (id.indexOf(ZmVoicemailView.FIELD_PREFIX[ZmVoicemailView.F_DATE]) == 0) {
			htmlArr[idx++] = AjxDateUtil.computeDateStr(now, voicemail.date);
		} else if (id.indexOf(ZmVoicemailView.FIELD_PREFIX[ZmVoicemailView.F_SUBJECT]) == 0) {
			htmlArr[idx++] = AjxStringUtil.htmlEncode(voicemail.subject);
		}
		htmlArr[idx++] = "</td>";
	}	
	
	htmlArr[idx++] = "</tr></table>";
	
	div.innerHTML = htmlArr.join("");
	return div;
};

ZmVoicemailView.prototype._mouseOverAction =
function(ev, div) {
	DwtListView.prototype._mouseOverAction.call(this, ev, div);
	var voicemail = this.getItemFromElement(div);
	var tooltip = voicemail ? this._createTooltip(voicemail) : null;
	this.setToolTipContent(tooltip);
};

ZmVoicemailView.prototype._createTooltip =
function(voicemail) {
	var data = { 
		caller: voicemail.caller, 
		duration: AjxDateUtil.computeDuration(voicemail.duration),
		date: AjxDateUtil.computeDateTimeString(voicemail.date)
	};
	var html = AjxTemplate.expand("zimbraMail.voicemail.templates.Voicemail#Tooltip", data);
	return html;
};

ZmVoicemailView.prototype._sortColumn =
function(columnItem, bSortAsc) {
	var comparator;
	switch (columnItem._sortable) {
		case ZmVoicemailView.F_CALLER: comparator = ZmVoicemail.getCallerComparator(bSortAsc); break;
		case ZmVoicemailView.F_SIZE: comparator = ZmVoicemail.getDurationComparator(bSortAsc); break;
		case ZmVoicemailView.F_DATE: comparator = ZmVoicemail.getDateComparator(bSortAsc); break;
		default: break;
	}
	if (comparator) {
		this.getList().sort(comparator);
		this.setUI();
	}
};

