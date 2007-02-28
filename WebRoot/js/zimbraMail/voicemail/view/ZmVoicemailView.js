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
	ZmListView.call(this, parent, "DwtListView ZmVoicemailView", Dwt.ABSOLUTE_STYLE, ZmController.VOICEMAIL_VIEW, ZmItem.VOICEMAIL, controller, headerList, dropTgt);

	this._appCtxt = appCtxt;
	this._controller = controller;
	this._playing = null; // The voicemail currently loaded in the player.
	this._previewing = null; // The voicemail whose play button is visible.
}
ZmVoicemailView.prototype = new ZmListView;
ZmVoicemailView.prototype.constructor = ZmVoicemailView;

ZmVoicemailView.prototype.toString = function() {
	return "ZmVoicemailView";
};

ZmVoicemailView.FROM_WIDTH = 150;
ZmVoicemailView.PLAYING_WIDTH = 20;
ZmVoicemailView.DURATION_WIDTH = 120;
ZmVoicemailView.DATE_WIDTH = null; // Auto
ZmVoicemailView.CALLER_NAME_WIDTH = 150;

var i = 1;
ZmVoicemailView.F_CALLER = i++;
ZmVoicemailView.F_PLAYING = i++;
ZmVoicemailView.F_SIZE = i++;
ZmVoicemailView.F_DATE = i++;
ZmVoicemailView.F_CALLER_NAME = i++;
delete i;

ZmVoicemailView.FIELD_PREFIX = {};
ZmVoicemailView.FIELD_PREFIX[ZmVoicemailView.F_CALLER]	= "a";
ZmVoicemailView.FIELD_PREFIX[ZmVoicemailView.F_PLAYING]	= "b";
ZmVoicemailView.FIELD_PREFIX[ZmVoicemailView.F_SIZE]	= "c";
ZmVoicemailView.FIELD_PREFIX[ZmVoicemailView.F_DATE]	= "d";
ZmVoicemailView.FIELD_PREFIX[ZmVoicemailView.F_CALLER_NAME]	= "e";

// Event details.
ZmVoicemailView.PLAY_BUTTON_PRESSED = "PlayButtonPressed";

ZmVoicemailView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, ": ", ZmMsg.voicemail].join("");
};

ZmVoicemailView.prototype.setCallType =
function(callType) {
	this._callType = callType;	
};

ZmVoicemailView.prototype.setPlaying =
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

ZmVoicemailView.prototype.createHeaderHtml = 
function(defaultColumnSort) {
	ZmListView.prototype.createHeaderHtml.call(this, defaultColumnSort);
	var isPlaced = this._callType == ZmVoicemailFolder.PLACED_CALL;
	var callerLabel = isPlaced ? ZmMsg.to : ZmMsg.from;
	this._setColumnHeader(ZmVoicemailView.F_CALLER_NAME, callerLabel);
	var dateLabel = isPlaced ? ZmMsg.placed : ZmMsg.received;	
	this._setColumnHeader(ZmVoicemailView.F_DATE, dateLabel);
};

ZmVoicemailView.prototype._setColumnHeader = 
function(fieldId, label) {
	var index = this.getColIndexForId(ZmVoicemailView.FIELD_PREFIX[fieldId]);
	var fromColSpan = document.getElementById(DwtListView.HEADERITEM_LABEL + this._headerList[index]._id);
	if (fromColSpan) fromColSpan.innerHTML = "&nbsp;" + label;
	if (this._colHeaderActionMenu) this._colHeaderActionMenu.getItem(index).setText(label);
};

ZmVoicemailView.prototype._getColumnIndex = 
function(field) {
	var prefix = ZmVoicemailView.FIELD_PREFIX[field];
	for (var i = 0, count = this._headerList.length; i < count; i++) {
		if (this._headerList[i]._id.indexOf(prefix) == 0) {
			return i;
		}
	}
	return 0;
};

ZmVoicemailView.prototype._getCell = 
function(columnIndex, element) {
	var table = element.firstChild;
	return table.rows[0].cells[columnIndex];
};

ZmVoicemailView.prototype._getHeaderList =
function(appCtxt) {

	var headerList = new Array();
	headerList.push(new DwtListHeaderItem(ZmVoicemailView.FIELD_PREFIX[ZmVoicemailView.F_PLAYING], "", null, ZmVoicemailView.PLAYING_WIDTH, null, true));
	headerList.push(new DwtListHeaderItem(ZmVoicemailView.FIELD_PREFIX[ZmVoicemailView.F_CALLER_NAME], ZmMsg.from, null, ZmVoicemailView.CALLER_NAME_WIDTH, null, true));
	headerList.push(new DwtListHeaderItem(ZmVoicemailView.FIELD_PREFIX[ZmVoicemailView.F_CALLER], ZmMsg.phoneNumber, null, ZmVoicemailView.FROM_WIDTH, ZmVoicemailView.F_CALLER, true));
	headerList.push(new DwtListHeaderItem(ZmVoicemailView.FIELD_PREFIX[ZmVoicemailView.F_SIZE], ZmMsg.duration, null, ZmVoicemailView.DURATION_WIDTH, ZmVoicemailView.F_SIZE, true));
	headerList.push(new DwtListHeaderItem(ZmVoicemailView.FIELD_PREFIX[ZmVoicemailView.F_DATE], ZmMsg.received, null, ZmVoicemailView.DATE_WIDTH, ZmVoicemailView.F_DATE, true));

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
		var id = this._headerList[i]._id;
		htmlArr[idx++] = "<td width=";
		htmlArr[idx++] = width;
		htmlArr[idx++] = ">";
		
		if (id.indexOf(ZmVoicemailView.FIELD_PREFIX[ZmVoicemailView.F_CALLER]) == 0) {
			htmlArr[idx++] = voicemail.caller;
		} else if (id.indexOf(ZmVoicemailView.FIELD_PREFIX[ZmVoicemailView.F_SIZE]) == 0) {
			htmlArr[idx++] = AjxDateUtil.computeDuration(voicemail.duration);
		} else if (id.indexOf(ZmVoicemailView.FIELD_PREFIX[ZmVoicemailView.F_PLAYING]) == 0) {
			htmlArr[idx++] = "<div class='ImgBlank_16 ZmPlayButton-hidden'></div>";
		} else if (id.indexOf(ZmVoicemailView.FIELD_PREFIX[ZmVoicemailView.F_DATE]) == 0) {
			htmlArr[idx++] = AjxDateUtil.computeDateStr(now, voicemail.date);
		} else if (id.indexOf(ZmVoicemailView.FIELD_PREFIX[ZmVoicemailView.F_CALLER_NAME]) == 0) {
			htmlArr[idx++] = AjxStringUtil.htmlEncode(voicemail.callerName);
		}
		htmlArr[idx++] = "</td>";
	}	
	
	htmlArr[idx++] = "</tr></table>";
	
	div.innerHTML = htmlArr.join("");
	return div;
};

ZmVoicemailView.prototype._addRow =
function(row, index) {
	DwtListView.prototype._addRow.call(this, row, index);
};

ZmVoicemailView.prototype._mouseOverAction =
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

ZmVoicemailView.prototype._mouseDownAction =
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

ZmVoicemailView.prototype._mouseUpAction =
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
				this._selEv.detail = ZmVoicemailView.PLAY_BUTTON_PRESSED;
				this._evtMgr.notifyListeners(DwtEvent.SELECTION, this._selEv);
			}
		}
	}
};

ZmVoicemailView.prototype._isInPlayingCell =
function(target) {
	if (this._callType == ZmVoicemailFolder.VOICEMAIL) {
		var thisElement = this.getHtmlElement();
		var columnIndex = this._getColumnIndex(ZmVoicemailView.F_PLAYING);
		while (target && target != thisElement) {
			if (target.cellIndex == columnIndex) {
				return true;
			}
			target = target.parentNode;
		}
		return false;
	}
};

ZmVoicemailView.prototype._setPlayState =
function(voicemail, state, visible, playing) {
	var columnIndex = this._getColumnIndex(ZmVoicemailView.F_PLAYING);
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

ZmVoicemailView.prototype._mouseOutAction =
function(ev, div) {
	if (this._callType == ZmVoicemailFolder.VOICEMAIL) {
		var voicemail = this.getItemFromElement(div);
		if (voicemail != this._playing && this._previewing) {
			this._setPlayState(this._previewing, null, false);
			this._previewing = null;
		}
	}
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
