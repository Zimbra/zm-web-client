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

function ZmVoiceListView(parent, appCtxt, controller, dropTgt) {
	var headerList = this._getHeaderList(appCtxt);
	ZmListView.call(this, parent, "DwtListView ZmVoiceListView", Dwt.ABSOLUTE_STYLE, ZmController.VOICEMAIL_VIEW, ZmItem.VOICEMAIL, controller, headerList, dropTgt);

	this._appCtxt = appCtxt;
	this._controller = controller;
	
	this._playing = null; // The voicemail currently loaded in the player.
	this._players = { }; // Map of voicemail.id to sound player
	this._soundChangeListeners = [];
}
ZmVoiceListView.prototype = new ZmListView;
ZmVoiceListView.prototype.constructor = ZmVoiceListView;

ZmVoiceListView.prototype.toString = function() {
	return "ZmVoiceListView";
};

ZmVoiceListView.FROM_WIDTH = 150;
ZmVoiceListView.PLAYING_WIDTH = null; // Auto
ZmVoiceListView.DURATION_WIDTH = 120;
ZmVoiceListView.DATE_WIDTH = 120;
ZmVoiceListView.CALLER_NAME_WIDTH = 150;

// Resuse existing field codes rather than adding voice-specific stuff to ZmList...
ZmVoiceListView.F_CALLER = ZmItem.F_FROM;
ZmVoiceListView.F_PLAYING = ZmItem.F_ATTACHMENT;
ZmVoiceListView.F_SIZE = ZmItem.F_SIZE;
ZmVoiceListView.F_DATE =ZmItem.F_DATE;
ZmVoiceListView.F_CALLER_NAME = ZmItem.F_PARTICIPANT;

// Event details.
ZmVoiceListView.PLAY_BUTTON_PRESSED = "PlayButtonPressed";

ZmVoiceListView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, ": ", ZmMsg.voicemail].join("");
};

ZmVoiceListView.prototype.setCallType =
function(callType) {
	this._callType = callType;	
};

ZmVoiceListView.prototype.setPlaying =
function(voicemail) {
	var player = this._players[voicemail.id];
	if (player) {
		player.play();
	}
};	

ZmVoiceListView.prototype.getPlaying =
function() {
	return this._playing;
};

ZmVoiceListView.prototype.addSoundChangeListener =
function(listener) {
	this._soundChangeListeners.push(listener);
};

ZmVoiceListView.prototype.markUIAsRead =
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

ZmVoiceListView.prototype.createHeaderHtml = 
function(defaultColumnSort) {
	ZmListView.prototype.createHeaderHtml.call(this, defaultColumnSort);
	var isPlaced = this._callType == ZmVoiceFolder.PLACED_CALL;
	var callerLabel = isPlaced ? ZmMsg.to : ZmMsg.from;
	this._setColumnHeader(ZmVoiceListView.F_CALLER_NAME, callerLabel);
	var dateLabel = isPlaced ? ZmMsg.placed : ZmMsg.received;	
	this._setColumnHeader(ZmVoiceListView.F_DATE, dateLabel);
};

ZmVoiceListView.prototype._setColumnHeader = 
function(fieldId, label) {
	var index = this.getColIndexForId(ZmListView.FIELD_PREFIX[fieldId]);
	var fromColSpan = document.getElementById(DwtListView.HEADERITEM_LABEL + this._headerList[index]._id);
	if (fromColSpan) fromColSpan.innerHTML = "&nbsp;" + label;
	if (this._colHeaderActionMenu) this._colHeaderActionMenu.getItem(index).setText(label);
};

ZmVoiceListView.prototype._getColumnIndex = 
function(field) {
	var prefix = ZmListView.FIELD_PREFIX[field];
	for (var i = 0, count = this._headerList.length; i < count; i++) {
		if (this._headerList[i]._id.indexOf(prefix) == 0) {
			return i;
		}
	}
	return 0;
};

ZmVoiceListView.prototype._getCell = 
function(columnIndex, element) {
	var table = element.firstChild;
	return table.rows[0].cells[columnIndex];
};

ZmVoiceListView.prototype._getHeaderList =
function(appCtxt) {

	var headerList = [];
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmVoiceListView.F_CALLER_NAME], ZmMsg.from, null, ZmVoiceListView.CALLER_NAME_WIDTH, null, true));
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmVoiceListView.F_CALLER], ZmMsg.phoneNumber, null, ZmVoiceListView.FROM_WIDTH, ZmVoiceListView.F_CALLER, true));
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmVoiceListView.F_SIZE], ZmMsg.duration, null, ZmVoiceListView.DURATION_WIDTH, ZmVoiceListView.F_SIZE, true));
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmVoiceListView.F_PLAYING], ZmMsg.message, null, ZmVoiceListView.PLAYING_WIDTH, null, true));
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmVoiceListView.F_DATE], ZmMsg.received, null, ZmVoiceListView.DATE_WIDTH, ZmVoiceListView.F_DATE, true));

	return headerList;
};

ZmVoiceListView.prototype._createItemHtml =
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
			if (prefix == ZmListView.FIELD_PREFIX[ZmVoiceListView.F_CALLER_NAME]) {
				htmlArr[idx++] = "_0";
			}
			htmlArr[idx++] = "'";
		}
		htmlArr[idx++] = ">";
		
		if (id.indexOf(ZmListView.FIELD_PREFIX[ZmVoiceListView.F_CALLER]) == 0) {
			htmlArr[idx++] = this._getCallerHtml(voicemail);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmVoiceListView.F_SIZE]) == 0) {
			htmlArr[idx++] = AjxDateUtil.computeDuration(voicemail.duration);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmVoiceListView.F_PLAYING]) == 0) {
			// No-op. This is handled in _addRow()
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmVoiceListView.F_DATE]) == 0) {
			htmlArr[idx++] = AjxDateUtil.computeDateStr(now, voicemail.date);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmVoiceListView.F_CALLER_NAME]) == 0) {
			htmlArr[idx++] = this._getCallerNameHtml(voicemail);
		}
		htmlArr[idx++] = "</td>";
	}	
	
	htmlArr[idx++] = "</tr></table>";
	
	div.innerHTML = htmlArr.join("");
	return div;
};

ZmVoiceListView.prototype._getCallerNameHtml =
function(voicemail) {
	var contactList = AjxDispatcher.run("GetContacts");
	var contact = contactList.getContactByPhone(voicemail.caller);
	if (contact) {
// TODO: Seems like this should go on ZmVoicemail?!?!?		
		voicemail.participants.getArray()[0] = voicemail.caller;
		return AjxStringUtil.htmlEncode(contact.getFullName());
	} else {
		return this._getCallerHtml(voicemail);
	}
};

ZmVoiceListView.prototype._getCallerHtml =
function(voicemail) {
	var display = ZmPhone.calculateDisplay(voicemail.caller);
	return AjxStringUtil.htmlEncode(display);
};

ZmVoiceListView.prototype.removeItem =
function(item, skipNotify) {
	DwtListView.prototype.removeItem.call(this, item, skipNotify);
	var player = this._players[item.id];
	if (player) {
		player.dispose();
	}
	if (this._playing == item) {
		this._playing = null;
	}
	delete this._players[item.id];
};

ZmVoiceListView.prototype.removeAll =
function(skipNotify) {
	for (var i in this._players) {
		this._players[i].dispose();
	}
	this._players = {};
	this._playing = null;
	DwtListView.prototype.removeAll.call(this, skipNotify);
};

ZmVoiceListView.prototype._addRow =
function(row, index) {
	DwtListView.prototype._addRow.call(this, row, index);
	var list = this.getList();
	
	if (!list || !list.size()) {
		return;
	}
	if (this._callType != ZmVoiceFolder.VOICEMAIL) {
		return;
	}
	var voicemail = this.getItemFromElement(row);
	var columnIndex = this._getColumnIndex(ZmVoiceListView.F_PLAYING);
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

ZmVoiceListView.prototype._mouseOverAction =
function(ev, div) {
	// Bypassing the ZmList._mouseOverAction which does some participant stuff I'm not
	// set up to handle yet....
	DwtListView.prototype._mouseOverAction.call(this, ev, div);
};

ZmVoiceListView.prototype._mouseOutAction =
function(ev, div) {
	DwtListView.prototype._mouseOverAction.call(this, ev, div);
};

ZmVoiceListView.prototype._compactListener =
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

ZmVoiceListView.prototype._createTooltip =
function(voicemail) {
	var data = { 
		caller: voicemail.caller, 
		duration: AjxDateUtil.computeDuration(voicemail.duration),
		date: AjxDateUtil.computeDateTimeString(voicemail.date)
	};
	var html = AjxTemplate.expand("zimbraMail.voicemail.templates.Voicemail#Tooltip", data);
	return html;
};

ZmVoiceListView.prototype._sortColumn =
function(columnItem, bSortAsc) {
	var comparator;
	switch (columnItem._sortable) {
		case ZmVoiceListView.F_CALLER: comparator = ZmVoiceItem.getCallerComparator(bSortAsc); break;
		case ZmVoiceListView.F_SIZE: comparator = ZmVoiceItem.getDurationComparator(bSortAsc); break;
		case ZmVoiceListView.F_DATE: comparator = ZmVoiceItem.getDateComparator(bSortAsc); break;
		default: break;
	}
	if (comparator) {
		this.getList().sort(comparator);
		this.setUI();
	}
};
