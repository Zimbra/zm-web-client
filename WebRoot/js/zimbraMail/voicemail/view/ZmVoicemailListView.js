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

function ZmVoicemailListView(parent, controller, dropTgt) {
	if (arguments.length == 0) return;
	var headerList = this._getHeaderList();
	ZmVoiceListView.call(this, parent, "DwtListView ZmVoicemailListView", Dwt.ABSOLUTE_STYLE, ZmController.VOICEMAIL_VIEW, ZmItem.VOICEMAIL, controller, headerList, dropTgt);

	this._playing = null; // The voicemail currently loaded in the player.
	this._players = { }; // Map of voicemail.id to sound player
	this._soundChangeListeners = [];
}
ZmVoicemailListView.prototype = new ZmVoiceListView;
ZmVoicemailListView.prototype.constructor = ZmVoicemailListView;

ZmVoicemailListView.prototype.toString = function() {
	return "ZmVoicemailListView";
};

ZmVoicemailListView.FROM_WIDTH = 150;
ZmVoicemailListView.PLAYING_WIDTH = null; // Auto
ZmVoicemailListView.PRIORITY_WIDTH = ZmListView.COL_WIDTH_ICON;
ZmVoicemailListView.DATE_WIDTH = 120;

// Resuse existing field codes rather than adding voice-specific stuff to ZmList...
ZmVoicemailListView.F_CALLER = ZmItem.F_FROM;
ZmVoicemailListView.F_PLAYING = ZmItem.F_ATTACHMENT;
ZmVoicemailListView.F_PRIORITY = ZmItem.F_ICON;
ZmVoicemailListView.F_DATE = ZmItem.F_DATE;

// Event details.
ZmVoicemailListView.PLAY_BUTTON_PRESSED = "PlayButtonPressed";

ZmVoicemailListView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, ": ", ZmMsg.voicemail].join("");
};

ZmVoicemailListView.prototype.setPlaying =
function(voicemail) {
	var player = this._players[voicemail.id];
	if (player) {
		player.play();
	}
};	

ZmVoicemailListView.prototype.getPlaying =
function() {
	return this._playing;
};

ZmVoicemailListView.prototype.addSoundChangeListener =
function(listener) {
	this._soundChangeListeners.push(listener);
};

ZmVoicemailListView.prototype.markUIAsRead =
function(items, on) {
	var className = on ? "" : "Unread";
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		var row = document.getElementById(this._getFieldId(item, ZmItem.F_ITEM_ROW));
		if (row) {
			row.className = className;
		}
	}
};

ZmVoicemailListView.prototype._getHeaderList =
function() {

	var headerList = [];
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmVoicemailListView.F_PRIORITY], null, "Critical", ZmVoicemailListView.PRIORITY_WIDTH, null, false));
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmVoicemailListView.F_CALLER], ZmMsg.from, null, ZmVoicemailListView.FROM_WIDTH, ZmVoicemailListView.F_CALLER, true));
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmVoicemailListView.F_PLAYING], ZmMsg.message, null, ZmVoicemailListView.PLAYING_WIDTH, null, true));
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmVoicemailListView.F_DATE], ZmMsg.received, null, ZmVoicemailListView.DATE_WIDTH, ZmVoicemailListView.F_DATE, true));

	return headerList;
};

ZmVoicemailListView.prototype._createItemHtml =
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
			if (prefix == ZmListView.FIELD_PREFIX[ZmVoicemailListView.F_FROM]) {
				htmlArr[idx++] = "_0";
			}
			htmlArr[idx++] = "'";
		}
		htmlArr[idx++] = ">";
		
		if (id.indexOf(ZmListView.FIELD_PREFIX[ZmVoicemailListView.F_CALLER]) == 0) {
			htmlArr[idx++] = this._getCallerHtml(voicemail);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmVoicemailListView.F_PRIORITY]) == 0) {
			htmlArr[idx++] = this._getPriorityHtml(voicemail);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmVoicemailListView.F_PLAYING]) == 0) {
			// No-op. This is handled in _addRow()
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmVoicemailListView.F_DATE]) == 0) {
			htmlArr[idx++] = AjxDateUtil.computeDateStr(now, voicemail.date);
		}
		htmlArr[idx++] = "</td>";
	}	
	
	htmlArr[idx++] = "</tr></table>";
	
	div.innerHTML = htmlArr.join("");
	return div;
};

ZmVoicemailListView.prototype.removeItem =
function(item, skipNotify) {
	ZmVoiceListView.prototype.removeItem.call(this, item, skipNotify);
	var player = this._players[item.id];
	if (player) {
		player.dispose();
	}
	if (this._playing == item) {
		this._playing = null;
	}
	delete this._players[item.id];
};

ZmVoicemailListView.prototype.removeAll =
function(skipNotify) {
	for (var i in this._players) {
		this._players[i].dispose();
	}
	this._players = {};
	this._playing = null;
	ZmVoiceListView.prototype.removeAll.call(this, skipNotify);
};

ZmVoicemailListView.prototype._addRow =
function(row, index) {
	ZmVoiceListView.prototype._addRow.call(this, row, index);
	var list = this.getList();
	
	if (!list || !list.size()) {
		return;
	}
	if (this._callType != ZmVoiceFolder.VOICEMAIL) {
		return;
	}
	var voicemail = this.getItemFromElement(row);
	var columnIndex = this._getColumnIndex(ZmVoicemailListView.F_PLAYING);
	var cell = this._getCell(columnIndex, row);
	var player = new ZmSoundPlayer(this, voicemail);
	player.reparentHtmlElement(cell);
	if (!this._compactListenerObj) {
		this._compactListenerObj = new AjxListener(this, this._compactListener);
	}
	player.addCompactListener(this._compactListenerObj);
	this._players[voicemail.id] = player;
	for (var i = 0, count = this._soundChangeListeners.length; i < count; i++) {
		player.addChangeListener(this._soundChangeListeners[i]);
	}
};

ZmVoicemailListView.prototype._compactListener =
function(ev) {
	if (!ev.isCompact) {
		if (this._playing) {
			var player = this._players[this._playing.id];
			player.setCompact(true);
			player.pause();
			player.rewind();
		}
		this._playing = ev.dwtObj.voicemail;
		this._activePlayer;
	}
};

ZmVoicemailListView.prototype._getPriorityHtml =
function(voicemail) {
	return "";
};
