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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a new hybrid view.
 * @constructor
 * @class
 * This variation of a double pane view combines a conv list view with a reading
 * pane in which the first msg of a conv is shown. Any conv with more than one
 * message is expandable, and gets a + icon in the left column. Clicking on that
 * will display the conv's first page of messages. The icon then becomes a - and
 * clicking it will collapse the conv (hide the messages).
 * <p>
 * If a conv has more than one page of messages, the last message on the first page
 * will get a + icon, and that message is expandable.</p>
 *
 * @author Conrad Damon
 */
function ZmHybridView(parent, className, posStyle, controller, dropTgt) {

	className = className || "ZmHybridView";
	ZmDoublePaneView.call(this, parent, className, posStyle, ZmController.HYBRID_VIEW, controller, dropTgt);
}

ZmHybridView.prototype = new ZmDoublePaneView;
ZmHybridView.prototype.constructor = ZmHybridView;

ZmHybridView.prototype.toString = 
function() {
	return "ZmHybridView";
}

ZmHybridView.prototype.setItem =
function(convs) {
	ZmDoublePaneView.prototype.setItem.call(this, convs);

	this._mailListView.set(convs, ZmItem.F_DATE);

	// show the first conv, which will show its first msg
	var list = this._mailListView.getList();
	var selectedItem = list ? list.get(0) : null
	if (selectedItem) {
		this._mailListView.setSelection(selectedItem, false, true);
	}
};

ZmHybridView.prototype._createMailListView =
function(mode, controller, dropTgt) {
	return new ZmHybridListView(this, null, Dwt.ABSOLUTE_STYLE, controller, dropTgt);
};

ZmHybridView.prototype._resetSize = 
function(newWidth, newHeight) {
	if (newHeight <= 0)
		return;
	
	if (this._isMsgViewVisible()) {
		var sashHeight = this._msgSash.getSize().y;
		if (!this._sashMoved) {
			var listViewHeight = (newHeight / 2) - DwtListView.HEADERITEM_HEIGHT;
			this._mailListView.resetHeight(listViewHeight);
			this._msgView.setBounds(Dwt.DEFAULT, listViewHeight + sashHeight, Dwt.DEFAULT,
									newHeight - (listViewHeight + sashHeight));
			this._msgSash.setLocation(Dwt.DEFAULT, listViewHeight);
		} else {
			var mvHeight = newHeight - this._msgView.getLocation().y;
			var minHeight = this._msgView.getMinHeight();
			if (mvHeight < minHeight) {
				this._mailListView.resetHeight(newHeight - minHeight);
				this._msgView.setBounds(Dwt.DEFAULT, (newHeight - minHeight) + sashHeight,
										Dwt.DEFAULT, minHeight - sashHeight);
			} else {
				this._msgView.setSize(Dwt.DEFAULT, mvHeight);
			}
			this._msgSash.setLocation(Dwt.DEFAULT, this._msgView.getLocation().y - sashHeight);
		}
	} else {
		this._mailListView.resetHeight(newHeight);
	}
	this._mailListView._resetColWidth();
}

ZmHybridView.prototype._sashCallback =
function(delta) {

	if (!this._sashMoved)
		this._sashMoved = true;

	if (delta > 0) {
		var newMsgViewHeight = this._msgView.getSize().y - delta;
		var minMsgViewHeight = this._msgView.getMinHeight();
		if (newMsgViewHeight > minMsgViewHeight) {
			// moving sash down
			this._mailListView.resetHeight(this._mailListView.getSize().y + delta);
			this._msgView.setSize(Dwt.DEFAULT, newMsgViewHeight);
			this._msgView.setLocation(Dwt.DEFAULT, this._msgView.getLocation().y + delta);
		} else {
			delta = 0;
		}
	} else {
		var absDelta = Math.abs(delta);
		
		if (!this._minMLVHeight) {
			var list = this._mailListView.getList();
			if (list && list.size()) {
				var item = list.get(0);
				var div = document.getElementById(this._mailListView._getItemId(item));
				this._minMLVHeight = DwtListView.HEADERITEM_HEIGHT + (Dwt.getSize(div).y * 2);
			} else {
				this._minMLVHeight = DwtListView.HEADERITEM_HEIGHT;
			}
		}
		
		if (this._msgSash.getLocation().y - absDelta > this._minMLVHeight) {
			// moving sash up
			this._mailListView.resetHeight(this._mailListView.getSize().y - absDelta);
			this._msgView.setSize(Dwt.DEFAULT, this._msgView.getSize().y + absDelta);
			this._msgView.setLocation(Dwt.DEFAULT, this._msgView.getLocation().y - absDelta);
		} else {
			delta = 0;
		}
	}

	if (delta)
		this._mailListView._resetColWidth();

	return delta;
};

/**
 * This class is a mutant version of ZmConvListView which can display both convs and msgs.
 * It handles expanding convs as well as paging additional messages in. Message rows are
 * inserted after the row of the owning conv.
 */
function ZmHybridListView(parent, className, posStyle, controller, dropTgt) {

	ZmConvListView.call(this, parent, className, posStyle, controller, dropTgt, ZmController.HYBRID_VIEW);

	// change listener needs to handle both types of events
	this._handleEventType[ZmItem.CONV] = true;
	this._handleEventType[ZmItem.MSG] = true;

	// click on + or - icon does not select the row
	this._disallowSelection[ZmListView.FIELD_PREFIX[ZmItem.F_EXPAND]] = true;

	this._hasHiddenRows = true;	// so that up and down arrow keys work
	this._msgRowIdList = {};	// hash of lists, each list has row IDs for an expandable item
	this._expandable = {};		// whether a row for a msg/conv ID has a +/- icon
//	this._dblClickTimeout = 5000;
};

ZmHybridListView.prototype = new ZmConvListView;
ZmHybridListView.prototype.constructor = ZmHybridListView;

// Copy some functions from ZmMailMsgListView, for handling message rows
ZmHybridListView.prototype._changeFolderName = ZmMailMsgListView.prototype._changeFolderName;
ZmHybridListView.prototype._changeTrashStatus = ZmMailMsgListView.prototype._changeTrashStatus;

ZmHybridListView.prototype.toString = 
function() {
	return "ZmHybridListView";
}

ZmHybridListView.prototype.resetHeight = 
function(newHeight) {
	this.setSize(Dwt.DEFAULT, newHeight);
	Dwt.setSize(this._parentEl, Dwt.DEFAULT, newHeight - DwtListView.HEADERITEM_HEIGHT);
};

/**
 * Double-click action toggles expanded state of a conv or msg (paging). Note that that action
 * code actually results from pressing the Enter or O key, and not from a mouse double-click
 * (which is handled by _listSelectionListener).
 */
ZmHybridListView.prototype.handleKeyAction =
function(actionCode, ev) {
	switch (actionCode) {
		case DwtKeyMap.DBLCLICK:
			var item = this.getItemFromElement(this._kbAnchor);
			if (item && this._expandable[item.id]) {
				this._controller._toggle(item);
			}
			break;
			
		default:
			return DwtListView.prototype.handleKeyAction.call(this, actionCode, ev);
	}
	return true;
};

ZmHybridListView.prototype._getHeaderList =
function(parent) {
	var shell = (parent instanceof DwtShell) ? parent : parent.shell;
	var appCtxt = shell.getData(ZmAppCtxt.LABEL); // this._appCtxt not set until parent constructor is called

	var hList = [];

	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_EXPAND], null, "NodeCollapsed", ZmListView.COL_WIDTH_ICON, null, null, null, ZmMsg.expand));
	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_FLAG], null, "FlagRed", ZmListView.COL_WIDTH_ICON, null, null, null, ZmMsg.flag));
	if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_TAG], null, "MiniTag", ZmListView.COL_WIDTH_ICON, null, null, null, ZmMsg.tag));
	}
	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_STATUS], null, "MsgStatus", ZmListView.COL_WIDTH_ICON, null, null, null, ZmMsg.status));
	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_PARTICIPANT], ZmMsg.from, null, ZmConvListView.COL_WIDTH_FROM, null, true));
	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_ATTACHMENT], null, "Attachment", ZmListView.COL_WIDTH_ICON, null, null, null, ZmMsg.attachment));
	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_SUBJECT], ZmMsg.subject, null, null, ZmItem.F_SUBJECT));
	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_FOLDER], ZmMsg.folder, null, ZmMailMsgListView.COL_WIDTH_FOLDER, null, true));
	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_SIZE], ZmMsg.size, null, ZmMailMsgListView.COL_WIDTH_SIZE, null, true));
	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_DATE], ZmMsg.received, null, ZmListView.COL_WIDTH_DATE, ZmItem.F_DATE));

	return hList;
};

ZmHybridListView.prototype._createItemHtml =
function(item, now, isDndIcon, isMixedView, myDiv) {

	var	div = myDiv || this._getDiv(item, isDndIcon);

	var htmlArr = [];
	var idx = 0;

	idx = this._getTable(htmlArr, idx, isDndIcon);
	idx = this._getRow(htmlArr, idx, item, item.isUnread ? "Unread" : null);

	for (var i = 0; i < this._headerList.length; i++) {
		if (!this._headerList[i]._visible)
			continue;

		var id = this._headerList[i]._id;
		if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_EXPAND]) == 0) {
			idx = this._getField(htmlArr, idx, item, ZmItem.F_EXPAND, i);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_STATUS]) == 0) {
			idx = this._getField(htmlArr, idx, item, ZmItem.F_STATUS, i);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_FOLDER]) == 0) {
			idx = this._getField(htmlArr, idx, item, ZmItem.F_FOLDER, i);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_FLAG]) == 0) {
			idx = this._getField(htmlArr, idx, item, ZmItem.F_FLAG, i);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_TAG]) == 0) {
			idx = this._getField(htmlArr, idx, item, ZmItem.F_TAG, i);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_PARTICIPANT]) == 0) {
			var fieldId = this._getFieldId(item, ZmItem.F_PARTICIPANT);
			htmlArr[idx++] = "<td width=";
			htmlArr[idx++] = this._getFieldWidth(i);
			htmlArr[idx++] = " id='";
			htmlArr[idx++] = fieldId;
			htmlArr[idx++] = "'>";
			if (AjxEnv.isSafari)
				htmlArr[idx++] = "<div style='overflow:hidden'>";
			htmlArr[idx++] = this._getParticipantHtml(item, fieldId);
			if (AjxEnv.isSafari)
				htmlArr[idx++] = "</div>";
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_ATTACHMENT]) == 0) {
			idx = this._getField(htmlArr, idx, item, ZmItem.F_ATTACHMENT, i);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_SUBJECT]) == 0) {
			idx = this._getField(htmlArr, idx, item, ZmItem.F_SUBJECT, i);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_SIZE]) == 0) {
			idx = this._getField(htmlArr, idx, item, ZmItem.F_SIZE, i, now);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_DATE]) == 0) {
			// Date
			idx = this._getField(htmlArr, idx, item, ZmItem.F_DATE, i, now);
		}
	}

	htmlArr[idx++] = "</tr></table>";

	div.innerHTML = htmlArr.join("");
	return div;
};

ZmHybridListView.prototype._getField =
function(htmlArr, idx, item, field, colIdx, now) {
	var fieldId = this._getFieldId(item, field);
	var width = this._getFieldWidth(colIdx);
	if (field == ZmItem.F_EXPAND) {
		var expandable = (((item.type == ZmItem.CONV) && (item.numMsgs > 1)) || (item.offset > 0));
		this._expandable[item.id] = expandable;
		var imageInfo = expandable ? "NodeCollapsed" : "Blank_16";
		htmlArr[idx++] = "<td width=";
		htmlArr[idx++] = width;
		htmlArr[idx++] = " class='Icon'>";
		htmlArr[idx++] = AjxImg.getImageHtml(imageInfo, null, ["id='", fieldId, "'"].join(""));
		htmlArr[idx++] = "</td>";
		
		return idx;
	} else if (field == ZmItem.F_STATUS) {
		var imageInfo = "Blank_16";
		htmlArr[idx++] = "<td width=";
		htmlArr[idx++] = width;
		htmlArr[idx++] = "><center>";
		if (item.type == ZmItem.MSG) {
			if (item.isInvite())		{ imageInfo = "Appointment"; }
			else if (item.isDraft)		{ imageInfo = "MsgStatusDraft"; }
			else if (item.isReplied)	{ imageInfo = "MsgStatusReply"; }
			else if (item.isForwarded)	{ imageInfo = "MsgStatusForward"; }
			else if (item.isSent)		{ imageInfo = "MsgStatusSent"; }
			else						{ imageInfo = item.isUnread ? "MsgStatusUnread" : "MsgStatusRead"; }
		}
		htmlArr[idx++] = AjxImg.getImageHtml(imageInfo, null, ["id='", this._getFieldId(item, ZmItem.F_STATUS), "'"].join(""));	
		htmlArr[idx++] = "</center></td>";

		return idx;
	} else if (field == ZmItem.F_SUBJECT) {
		if (item.type == ZmItem.CONV) {
			htmlArr[idx++] = "<td id='";
			htmlArr[idx++] = this._getFieldId(item, ZmItem.F_SUBJECT);
			htmlArr[idx++] = "'>";
			htmlArr[idx++] = AjxEnv.isSafari ? "<div style='overflow:hidden'>" : "";
			htmlArr[idx++] = item.subject ? AjxStringUtil.htmlEncode(item.subject, true) : AjxStringUtil.htmlEncode(ZmMsg.noSubject);
			if (this._appCtxt.get(ZmSetting.SHOW_FRAGMENTS) && item.fragment) {
				htmlArr[idx++] = "<span class='ZmConvListFragment'> - ";
				htmlArr[idx++] = AjxStringUtil.htmlEncode(item.fragment, true);
				htmlArr[idx++] = "</span>";
			}
			htmlArr[idx++] = AjxEnv.isSafari ? "</div></td>" : "</td>";
		} else {
			htmlArr[idx++] = "<td id='";
			htmlArr[idx++] = this._getFieldId(item, ZmItem.F_FRAGMENT);
			htmlArr[idx++] = "'";
			htmlArr[idx++] = AjxEnv.isSafari ? " style='width:auto;'><div style='overflow:hidden'>" : " width=100%>";
			htmlArr[idx++] = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
			htmlArr[idx++] = AjxStringUtil.htmlEncode(item.fragment, true);
		}
		
		return idx;
	} else if (field == ZmItem.F_FOLDER) {
		// Folder
		htmlArr[idx++] = "<td width=";
		htmlArr[idx++] = width;
		htmlArr[idx++] = ">";
		htmlArr[idx++] = "<nobr id='";
		htmlArr[idx++] = this._getFieldId(item, ZmItem.F_FOLDER);
		htmlArr[idx++] = "'>"; // required for IE bug
		if (item.type == ZmItem.MSG) {
			var folder = this._appCtxt.getById(item.folderId);
			if (folder) {
				htmlArr[idx++] = folder.getName();
			}
		}
		htmlArr[idx++] = "</nobr>";
		htmlArr[idx++] = "</td>";

		return idx;
	} else if (field == ZmItem.F_SIZE) {
		if (item.type == ZmItem.CONV) {
			// Conversation count
			htmlArr[idx++] = "<td id='";
			htmlArr[idx++] = this._getFieldId(item, ZmItem.F_SIZE);
			htmlArr[idx++] = "' width=";
			htmlArr[idx++] = this._getFieldWidth(colIdx);
			htmlArr[idx++] = ">";
			if (item.numMsgs > 1) {
				htmlArr[idx++] = "(";
				htmlArr[idx++] = item.numMsgs;
				htmlArr[idx++] = ")";
			}
			htmlArr[idx++] = "</td>";
		} else {
			// Message size
			htmlArr[idx++] = "<td width=";
			htmlArr[idx++] = width;
			htmlArr[idx++] = "><nobr>";
			htmlArr[idx++] = AjxUtil.formatSize(item.size);
			htmlArr[idx++] = "</td>";
		}
		
		return idx;
	} else {
		return ZmListView.prototype._getField.apply(this, arguments);
	}
};

/**
 * @param conv		[ZmConv]		conv that owns the messages we will display
 * @param msg		[ZmMailMsg]*	msg that is the anchor for paging in more msgs
 * @param offset	[int]*			start of current page of msgs within conv
 * @param limit		[int]*			size of one batch of msgs
 */
ZmHybridListView.prototype._expand =
function(conv, msg, offset, limit) {
	var item = msg || conv;
	var rowIds = this._msgRowIdList[item.id];
	if (rowIds && rowIds.length && this._rowsArePresent(item)) {
		this._showMsgs(rowIds, true);
	} else {
		this._msgRowIdList[item.id] = [];
		msgList = conv.msgs;
		if (item.type == ZmItem.CONV) {
			// should be here only when the conv is first expanded
			msgList.addChangeListener(this._listChangeListener);
		}
		var index = this._getRowIndex(item);	// row after which to add rows

		// work with entire list of conv's msgs, using offset and limit
		var a = msgList.getArray();
		if (!(a && a.length)) { return; }
		var hasMore = false;
		var num = Math.min(limit, msgList.size() - offset);
		for (var i = 0; i < num; i++) {
			var msg = a[offset + i];
			if (msgList._hasMore && (i == (num - 1))) {
				// add hint so that msg row gets an expand icon
				msg.offset = a.length;
			}
			var div = this._createItemHtml(msg, this._now);
			div.style.backgroundColor = "EEEEFF";
			this._addRow(div, index + i + 1);
			this._msgRowIdList[item.id].push(div.id);
		}
	}
	
	var img = document.getElementById(this._getFieldId(item, ZmItem.F_EXPAND));
	if (img && img.parentNode) {
		AjxImg.setImage(img.parentNode, "NodeExpanded");
	}
};

ZmHybridListView.prototype._collapse =
function(item) {
	var rowIds = this._msgRowIdList[item.id];
	this._showMsgs(rowIds, false);

	var img = document.getElementById(this._getFieldId(item, ZmItem.F_EXPAND));
	if (img && img.parentNode) {
		AjxImg.setImage(img.parentNode, "NodeCollapsed");
	}
};

ZmHybridListView.prototype._showMsgs =
function(ids, show) {
	if (!(ids && ids.length)) { return; }
	for (var i = 0; i < ids.length; i++) {
		var row = document.getElementById(ids[i]);
		if (row) {
			Dwt.setVisible(row, show);
		}
	}
};

/**
 * Make sure that the given item has a set of expanded rows. If you expand an item
 * and then page away and back, the DOM is reset and your rows are gone.
 */
ZmHybridListView.prototype._rowsArePresent =
function(item) {
	var rowIds = this._msgRowIdList[item.id];
	if (rowIds && rowIds.length) {
		for (var i = 0; i < rowIds.length; i++) {
			if (document.getElementById(rowIds[i])) {
				return true;
			}
		}
	}
	this._msgRowIdList[item.id] = [];	// start over
	return false;
};

ZmHybridListView.prototype._changeListener =
function(ev) {
	if (!this._handleEventType[ev.type]) { return; }

	var fields = ev.getDetail("fields");
	var items = ev.getDetail("items");
	
	// prevent redundant handling for same item due to multiple change listeners
	// (msg will notify containing conv, and then notif for same conv gets processed)
	var reqMgr = this._appCtxt.getRequestMgr();
	for (var i = 0; i < items.length; i++) {
		reqMgr._modifyHandled[items[i].id] = true;
	}
	
	if (ev.type == ZmItem.MSG && (ev.event == ZmEvent.E_MOVE || ev.event == ZmEvent.E_DELETE)) {
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			if (item.folderId == ZmFolder.ID_SPAM || ev.event == ZmEvent.E_DELETE) {
				this._controller._list.remove(item, true);
//				this._checkExpandable(item, true);
				ZmConvListView.prototype._changeListener.call(this, ev);
			} else {
				this._changeFolderName([item]);
			}
		}
	} else {
		ZmConvListView.prototype._changeListener.call(this, ev);
	}
};

/**
 * Override so we can clean up lists of cached rows.
 */
ZmHybridListView.prototype.removeItem =
function(item, skipNotify) {
	var rowId = this._getItemId(item);
	OUT:
	for (var id in this._msgRowIdList) {
		var list = this._msgRowIdList[id];
		for (var i = 0; i < list.length; i++) {
			if (list[i] == rowId) {
				list[i] = null;
				break OUT;
			}
		}
	}
	DwtListView.prototype.removeItem.apply(this, arguments);
};

ZmHybridListView.prototype._checkExpandable =
function(item, removed, added) {
	var expandable;
	if (item.type == ZmItem.MSG) {
		var conv = this._appCtxt.getById(item.cid);
		
		expandable = (item.numMsgs > 1);

	}
	if (expandable != this._expandable[item.id]) {
	
	}
};
