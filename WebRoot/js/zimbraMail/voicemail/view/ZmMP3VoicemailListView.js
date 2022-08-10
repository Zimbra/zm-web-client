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

ZmMP3VoicemailListView = function(parent, controller, dropTgt) {
	ZmVoicemailListView.call(this, parent, controller, dropTgt);
	this.player = new ZmFlashAudioPlayer();
}

ZmMP3VoicemailListView.prototype = new ZmVoicemailListView;
ZmMP3VoicemailListView.prototype.constructor = ZmMP3VoicemailListView;

ZmMP3VoicemailListView.prototype.toString =
function() {
	return "ZmMP3VoicemailListView";
};

ZmMP3VoicemailListView.FROM_WIDTH		= ZmMsg.COLUMN_WIDTH_FROM_CALL;
ZmMP3VoicemailListView.PLAYING_WIDTH	= null; // Auto
ZmMP3VoicemailListView.DATE_WIDTH		= ZmMsg.COLUMN_WIDTH_DATE_CALL;


ZmMP3VoicemailListView.DURATION_SUFFIX = "_duration";

ZmMP3VoicemailListView._durationCellIds = [];


ZmMP3VoicemailListView.prototype._getCellContents =
function(htmlArr, idx, voicemail, field, colIdx, params) {
	if (field == ZmVoiceListView.F_DURATION) {
		htmlArr[idx++] = this._getDurationHtml(voicemail);
	} else {
		idx = ZmVoicemailListView.prototype._getCellContents.apply(this, arguments);
	}
	return idx;
};

ZmMP3VoicemailListView.prototype._renderList =
function(list, noResultsOk, doAdd) {
	ZmVoiceListView.prototype._renderList.apply(this, arguments);
};

ZmMP3VoicemailListView.prototype.displayPlayer =
function(ev) {
	if(!this.player.hasFlash) {
		return false;
	}
	var selection = this.getSelection();
	if (selection.length == 1) {
		var voicemail = selection[0];
		var row = this._getElement(voicemail, ZmItem.F_ITEM_ROW);
		var cellId = row.id.replace(ZmItem.F_ITEM_ROW, ZmVoiceListView.F_DURATION);
		var cell = document.getElementById(cellId);
		if(cell && (this.clickedOnPlayBtn(ev) || ev.detail == DwtListView.ITEM_DBL_CLICKED)) {
			this.player.playAt(Dwt.toWindow(cell), voicemail, true);
			this._hideDurationCell(voicemail.id);
			return true;
		}
	}
	return false;
};

ZmMP3VoicemailListView.prototype.clickedOnPlayBtn =
function(ev) {
		return ev && ev.target && ev.target.className == "ImgPlay" ? true : false;
};

ZmMP3VoicemailListView.prototype._hideDurationCell =
function(vId) {
	this._displayAllDurationCells();
	var durationFieldId = vId + ZmMP3VoicemailListView.DURATION_SUFFIX;
	var dObj = document.getElementById(durationFieldId);
	if(dObj) {
		dObj.style.display = "none";
	}
	ZmMP3VoicemailListView._durationCellIds[durationFieldId] = true;
};

ZmMP3VoicemailListView.prototype._displayAllDurationCells =
function() {
	for(var id in ZmMP3VoicemailListView._durationCellIds) {
		var dObj = document.getElementById(id);
		if(dObj) {
			dObj.style.display = "block";
		}
		delete ZmMP3VoicemailListView._durationCellIds[id];
	}
};

ZmMP3VoicemailListView.prototype._getNoResultsMessage =
function() {
	return this._folder && !this._folder.phone.hasVoiceMail ? ZmMsg.noVoiceMail : AjxMsg.noResults;
};

ZmMP3VoicemailListView.prototype._getDurationHtml =
function(voicemail) {
	var html = [];
	html.push("<table id='", voicemail.id, ZmMP3VoicemailListView.DURATION_SUFFIX, "'><tr><td>",AjxDateUtil.computeDuration(voicemail.duration, true), "</td><td><div class='ImgPlay'></div></td></tr></table>");
	return html.join("");
};

ZmMP3VoicemailListView.prototype.stopPlaying =
function() {
	this.player.hide();
	this._displayAllDurationCells();
};

ZmMP3VoicemailListView.prototype.removeItem =
function(item, skipNotify) {
	this.player.hide();
	ZmVoicemailListView.prototype.removeItem.call(this, item, skipNotify);
};
