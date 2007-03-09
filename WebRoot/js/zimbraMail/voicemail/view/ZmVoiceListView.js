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
	this._previewing = null; // The voicemail whose play button is visible.
}
ZmVoiceListView.prototype = new ZmListView;
ZmVoiceListView.prototype.constructor = ZmVoiceListView;

ZmVoiceListView.prototype.toString = function() {
	return "ZmVoiceListView";
};

ZmVoiceListView.FROM_WIDTH = 150;
ZmVoiceListView.PLAYING_WIDTH = 20;
ZmVoiceListView.DURATION_WIDTH = 120;
ZmVoiceListView.DATE_WIDTH = null; // Auto
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
	if (voicemail == this._playing)  {
		return;
	}

	if (this._playing) {
		this._setPlayState(this._playing, null, false);
	}
	this._playing = voicemail;
	if (this._playing) {
		this._setPlayState(this._playing, "toggled", true, true);
	}
};

ZmVoiceListView.prototype.createHeaderHtml = 
function(defaultColumnSort) {
	ZmListView.prototype.createHeaderHtml.call(this, defaultColumnSort);
	var isPlaced = this._callType == ZmVoicemailFolder.PLACED_CALL;
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

	var headerList = new Array();
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmVoiceListView.F_PLAYING], "", null, ZmVoiceListView.PLAYING_WIDTH, null, true));
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmVoiceListView.F_CALLER_NAME], ZmMsg.from, null, ZmVoiceListView.CALLER_NAME_WIDTH, null, true));
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmVoiceListView.F_CALLER], ZmMsg.phoneNumber, null, ZmVoiceListView.FROM_WIDTH, ZmVoiceListView.F_CALLER, true));
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmVoiceListView.F_SIZE], ZmMsg.duration, null, ZmVoiceListView.DURATION_WIDTH, ZmVoiceListView.F_SIZE, true));
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
			htmlArr[idx++] = "<div class='ImgBlank_16 ZmPlayButton-hidden'></div>";
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

ZmVoiceListView.prototype._addRow =
function(row, index) {
	DwtListView.prototype._addRow.call(this, row, index);
};

ZmVoiceListView.prototype._mouseOverAction =
function(ev, div) {
	DwtListView.prototype._mouseOverAction.call(this, ev, div);
	
	if (this._callType == ZmVoicemailFolder.VOICEMAIL) {
		var voicemail = this.getItemFromElement(div);
		if (voicemail != this._playing && voicemail != this._previewing) {
			if (this._previewing) {
				this._setPlayState(this._previewing, null, false);
			}
			this._previewing = voicemail;
			var target = ev.target;
			var inPlayingCell = this._isInPlayingCell(target);
			var state = inPlayingCell ? "activated" : null;
			if (this._previewing) {
				this._setPlayState(this._previewing, state, true);
			}
		}
	}
};

ZmVoiceListView.prototype._mouseDownAction =
function(ev, div) {
	if (this._callType == ZmVoicemailFolder.VOICEMAIL) {
		var voicemail = this.getItemFromElement(div);
		if (voicemail && voicemail == this._previewing) {
			var target = ev.target;
			var inPlayingCell = this._isInPlayingCell(target);
			if (inPlayingCell) {
				this._setPlayState(this._previewing, "triggered", true);
			}
		}
	}
};

ZmVoiceListView.prototype._mouseUpAction =
function(ev, div) {
	if (this._callType == ZmVoicemailFolder.VOICEMAIL) {
		var voicemail = this.getItemFromElement(div);
		if (voicemail && voicemail == this._previewing) {
			var target = ev.target;
			var inPlayingCell = this._isInPlayingCell(target);
			if (inPlayingCell) {
				this._previewing = null;
				
				// Notify listeners of play button selection.
				// (This will cuase the play state to be updated.)
				DwtUiEvent.copy(this._selEv, ev);
				this._selEv.item = this.getItemFromElement(div);
				this._selEv.detail = ZmVoiceListView.PLAY_BUTTON_PRESSED;
				this._evtMgr.notifyListeners(DwtEvent.SELECTION, this._selEv);
			}
		}
	}
};

ZmVoiceListView.prototype._isInPlayingCell =
function(target) {
	if (this._callType == ZmVoicemailFolder.VOICEMAIL) {
		var thisElement = this.getHtmlElement();
		var columnIndex = this._getColumnIndex(ZmVoiceListView.F_PLAYING);
		while (target && target != thisElement) {
			if (target.cellIndex == columnIndex) {
				return true;
			}
			target = target.parentNode;
		}
		return false;
	}
};

ZmVoiceListView.prototype._setPlayState =
function(voicemail, state, visible, playing) {
	var columnIndex = this._getColumnIndex(ZmVoiceListView.F_PLAYING);
	var element = this._getElFromItem(voicemail);
	var cell = this._getCell(columnIndex, element);
	var div = cell.childNodes[0];
	if (!visible) {
		div.className = "ImgBlank_16 ZmPlayButton-hidden";
	} else {
		var buttonClass = state ? " ZmPlayButton-" + state : " ZmPlayButton";
		var imageClass = playing ? "ImgPlayingMessage" : "ImgPlay";
		div.className = imageClass + buttonClass;
	}
};

ZmVoiceListView.prototype._mouseOutAction =
function(ev, div) {
	if (this._callType == ZmVoicemailFolder.VOICEMAIL) {
		var voicemail = this.getItemFromElement(div);
		if (voicemail != this._playing && this._previewing) {
			this._setPlayState(this._previewing, null, false);
			this._previewing = null;
		}
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
		case ZmVoiceListView.F_CALLER: comparator = ZmVoicemail.getCallerComparator(bSortAsc); break;
		case ZmVoiceListView.F_SIZE: comparator = ZmVoicemail.getDurationComparator(bSortAsc); break;
		case ZmVoiceListView.F_DATE: comparator = ZmVoicemail.getDateComparator(bSortAsc); break;
		default: break;
	}
	if (comparator) {
		this.getList().sort(comparator);
		this.setUI();
	}
};
