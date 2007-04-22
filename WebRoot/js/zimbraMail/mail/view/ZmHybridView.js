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

	this._hasHiddenRows = true;	// so that up and down arrow keys work
	this._msgRowIdList = {};	// hash of lists, each list has row IDs for an expandable item
	this._dblClickIsolation = (this._controller._readingPaneOn && !AjxEnv.isIE);
};

ZmHybridListView.prototype = new ZmConvListView;
ZmHybridListView.prototype.constructor = ZmHybridListView;

ZmHybridListView.INDENT = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

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
 * Double-click action toggles expanded state of a conv or msg (paging), if it is expandable.
 * Note that that action code actually results from pressing the Enter or O key, and not from
 * a mouse double-click (which is handled by _listSelectionListener).
 */
ZmHybridListView.prototype.handleKeyAction =
function(actionCode, ev) {
	switch (actionCode) {
		case DwtKeyMap.DBLCLICK:
			if (this.getSelectionCount() != 1) { break; }
			var item = this.getItemFromElement(this._kbAnchor);
			if (item && this._expandable[item.id]) {
				this._controller._toggle(item);
				break;
			} else if (this._controller._readingPaneOn && item.type == ZmItem.MSG && this._expanded[item.cid]) {
				var conv = this._appCtxt.getById(item.cid);
				this._controller._toggle(conv);
				this.setSelection(conv, true);
				break;
			}

		default:
			return DwtListView.prototype.handleKeyAction.call(this, actionCode, ev);
	}
	return true;
};

// Feh. Pass off to appropriate function (since we get called by generic ZmMailListView).
ZmHybridListView.prototype.markUIAsRead =
function(item, on) {
	(item.type == ZmItem.CONV) ? ZmConvListView.prototype.markUIAsRead.apply(this, arguments) :
								 ZmMailMsgListView.prototype.markUIAsRead.apply(this, arguments);

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

// TODO: this could be a generic version of this function
ZmHybridListView.prototype._createItemHtml =
function(item, now, isDndIcon, isMixedView, myDiv) {

	var isMatched = ((item.type == ZmItem.MSG) && item.isInHitList() && !this._appCtxt.getCurrentSearch().folderId);
	var	div = myDiv || this._getDiv(item, isDndIcon, isMatched);
	if ((item.type == ZmItem.MSG) && !isMatched) {
		// XXX: move to skins
		div.style.backgroundColor = "EEEEFF";
	}

	var htmlArr = [];
	var idx = 0;

	idx = this._getTable(htmlArr, idx, isDndIcon);
	idx = this._getRow(htmlArr, idx, item, item.isUnread ? "Unread" : null);

	for (var colIdx = 0; colIdx < this._headerList.length; colIdx++) {
		if (!this._headerList[colIdx]._visible) { continue; }

		var id = this._headerList[colIdx]._id;
		var prefix = id.substr(0,1);
		var field = ZmListView.PREFIX_FIELD[prefix];
		idx = this._getField(htmlArr, idx, item, field, colIdx, now);
	}

	htmlArr[idx++] = "</tr></table>";

	div.innerHTML = htmlArr.join("");
	return div;
};

ZmHybridListView.prototype._getField =
function(htmlArr, idx, item, field, colIdx, now) {
	var fieldId = this._getFieldId(item, field);
	var width = this._getFieldWidth(colIdx);
	var isConv = (item.type == ZmItem.CONV);
	if (field == ZmItem.F_EXPAND) {
		var expandable = this._isExpandable(item);
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
		if (!isConv) {
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

	} else if (field == ZmItem.F_PARTICIPANT) {
		var fieldId = this._getFieldId(item, ZmItem.F_PARTICIPANT);
		htmlArr[idx++] = "<td width=";
		htmlArr[idx++] = this._getFieldWidth(colIdx);
		htmlArr[idx++] = " id='";
		htmlArr[idx++] = fieldId;
		htmlArr[idx++] = "'>";
		if (AjxEnv.isSafari) {
			htmlArr[idx++] = "<div style='overflow:hidden'>";
		}
		if (!isConv) {
			htmlArr[idx++] = ZmHybridListView.INDENT;
		}
		htmlArr[idx++] = this._getParticipantHtml(item, fieldId);
		if (AjxEnv.isSafari) {
			htmlArr[idx++] = "</div>";
		}
		htmlArr[idx++] = "</td>";
		return idx;	

	} else if (field == ZmItem.F_SUBJECT) {
		if (isConv) {
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
			htmlArr[idx++] = ZmHybridListView.INDENT;
			htmlArr[idx++] = AjxStringUtil.htmlEncode(item.fragment, true);
		}
		return idx;

	} else if (field == ZmItem.F_FOLDER) {
		htmlArr[idx++] = "<td width=";
		htmlArr[idx++] = width;
		htmlArr[idx++] = ">";
		htmlArr[idx++] = "<nobr id='";
		htmlArr[idx++] = this._getFieldId(item, ZmItem.F_FOLDER);
		htmlArr[idx++] = "'>"; // required for IE bug
		if (!isConv) {
			var folder = this._appCtxt.getById(item.folderId);
			if (folder) {
				htmlArr[idx++] = folder.getName();
			}
		}
		htmlArr[idx++] = "</nobr>";
		htmlArr[idx++] = "</td>";
		return idx;

	} else if (field == ZmItem.F_SIZE) {
		if (isConv) {
			// Conversation count
			htmlArr[idx++] = "<td id='";
			htmlArr[idx++] = this._getFieldId(item, ZmItem.F_COUNT);
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
 */
ZmHybridListView.prototype._expand =
function(conv, msg, offset) {
	var item = msg || conv;
	var isConv = (item.type == ZmItem.CONV);
	var rowIds = this._msgRowIdList[item.id];
	if (rowIds && rowIds.length && this._rowsArePresent(item)) {
		this._showMsgs(rowIds, true);
	} else {
		this._msgRowIdList[item.id] = [];
		var msgList = conv.msgs;
		if (isConv) {
			// should be here only when the conv is first expanded
			msgList.addChangeListener(this._listChangeListener);
		}
		var index = this._getRowIndex(item);	// row after which to add rows

		// work with entire list of conv's msgs, using offset
		var a = msgList.getArray();
		if (!(a && a.length)) { return; }
		var limit = this._appCtxt.get(ZmSetting.PAGE_SIZE);
		offset = this._msgOffset[item.id] || 0;
		var num = Math.min(limit, msgList.size() - offset);
		for (var i = 0; i < num; i++) {
			var msg = a[offset + i];
			var div = this._createItemHtml(msg, this._now);
			this._addRow(div, index + i + 1);
			this._msgRowIdList[item.id].push(div.id);
		}
	}
	
	var img = document.getElementById(this._getFieldId(item, ZmItem.F_EXPAND));
	if (img && img.parentNode) {
		AjxImg.setImage(img.parentNode, "NodeExpanded");
	}
	this._expanded[item.id] = true;
	
	var cid = isConv ? item.id : item.cid;
	if (!this._expandedItems[cid]) {
		this._expandedItems[cid] = [];
	}
	this._expandedItems[cid].push(item);
};

ZmHybridListView.prototype._collapse =
function(item) {
	var isConv = (item.type == ZmItem.CONV);
	var cid = isConv ? item.id : item.cid;
	var expItems = this._expandedItems[cid];
	// also collapse any expanded sections below us within same conv
	if (expItems && expItems.length) {
		var done = false;
		while (!done) {
			var nextItem = expItems.pop();
			this._doCollapse(nextItem);
			done = ((nextItem.id == item.id) || (expItems.length == 0));
		}
	} else {
		this._doCollapse(item);
	}
};

ZmHybridListView.prototype._doCollapse =
function(item) {
	var rowIds = this._msgRowIdList[item.id];
	this._showMsgs(rowIds, false);

	var img = document.getElementById(this._getFieldId(item, ZmItem.F_EXPAND));
	if (img && img.parentNode) {
		AjxImg.setImage(img.parentNode, "NodeCollapsed");
	}
	this._expanded[item.id] = false;
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

/**
 * Returns true if the given conv or msg should have an expansion icon. A conv is
 * expandable if it has 2 or more msgs. A msg is expandable if it's the last on a
 * page and there are more msgs.
 *
 * @param item		[ZmMailItem]	conv or msg to check
 */
ZmHybridListView.prototype._isExpandable =
function(item) {
	var expandable = false;
	if (item.type == ZmItem.CONV) {
		expandable = (item.numMsgs > 1);
	} else {
		var conv = this._appCtxt.getById(item.cid);
		
		var a = conv.msgs.getArray();
		if (a && a.length) {
			var limit = this._appCtxt.get(ZmSetting.PAGE_SIZE);
			var idx = null;
			for (var i = 0; i < a.length; i++) {
				if (a[i].id == item.id) {
					idx = i + 1;	// start with 1
					break;
				}
			}
			if (idx && (idx % limit == 0) && (idx < a.length || conv.msgs._hasMore)) {
				this._msgOffset[item.id] = idx;
				expandable = true;
			}
		}
	}
	this._expandable[item.id] = expandable;
	return expandable;
};

ZmHybridListView.prototype._resetExpansion =
function() {
	this._expanded = {};		// current expansion state, by ID
	this._expandable = {};		// whether a row for a msg/conv ID has a +/- icon
	this._msgRowIdList = {};	// list of row IDs for a conv ID
	this._msgOffset = {};		// the offset for a msg ID
	this._expandedItems = {};	// list of expanded items for a conv ID (inc conv)
};

ZmHybridListView.prototype._changeListener =
function(ev) {

	var item = ev.item;
	if (ev.handled || !this._handleEventType[item.type]) { return; }

	var fields = ev.getDetail("fields");
	var isConv = (item.type == ZmItem.CONV);
	
	// prevent redundant handling for same item due to multiple change listeners
	// (msg will notify containing conv, and then notif for same conv gets processed)
	if (ev.event != ZmEvent.E_DELETE && ev.event != ZmEvent.E_CREATE) {
		this._appCtxt.getRequestMgr()._modifyHandled[item.id] = true;
	}
	
	// virtual conv promoted to real conv, got new ID
	if (isConv && (ev.event == ZmEvent.E_MODIFY) && (fields && fields[ZmItem.F_ID])) {
		// a virtual conv has become real, and changed its ID
		this._expanded[item.id] = this._expanded[item._oldId];
		this._expandable[item.id] = this._expandable[item._oldId];
		this._msgRowIdList[item.id] = this._msgRowIdList[item._oldId];
	}
	
	// msg count in a conv changed - see if we need to add or remove an expand icon
	if (isConv && (ev.event == ZmEvent.E_MODIFY) && (fields && fields[ZmItem.F_COUNT])) {
		var img = document.getElementById(this._getFieldId(item, ZmItem.F_EXPAND));
		if (img && img.parentNode) {
			var icon = !this._isExpandable(item) ? "Blank_16" : this._expanded[item.id] ? "NodeExpanded" : "NodeCollapsed";
			AjxImg.setImage(img.parentNode, icon);
		}
	}

	// msg moved or deleted	
	if (!isConv && (ev.event == ZmEvent.E_MOVE || ev.event == ZmEvent.E_DELETE)) {
		var	conv = this._appCtxt.getById(item.cid);
		ev.handled = true;
		if (item.folderId == ZmFolder.ID_SPAM || ev.event == ZmEvent.E_DELETE) {
			// msg marked as Junk, or deleted via Empty Trash
			// TODO: handle expandable msg removal
			conv.msgs.remove(item, true);
			conv.numMsgs = conv.msgs.size();
			if (this._expandable[conv.id] && conv.numMsgs == 1) {
				var img = document.getElementById(this._getFieldId(conv, ZmItem.F_EXPAND));
				if (img && img.parentNode) {
					AjxImg.setImage(img.parentNode, "Blank_16");
				}
				this._removeMsgRows(conv.id);
			}
		} else {
			// if this conv now has no msgs that match current search, remove it
			var removeConv = true;
			var folderId = this._appCtxt.getCurrentSearch().folderId;
			if (folderId) {
				var msgs = conv.msgs.getArray();
				for (var i = 0; i < msgs.length; i++) {
					if (msgs[i].folderId == folderId) {
						removeConv = false;
						break;
					}
				}
			}
			if (removeConv) {
				this._list.remove(conv);				// view has sublist of controller list
				this._controller._list.remove(conv);	// complete list
				ev.item = item = conv;
				isConv = true;
				ev.handled = false;
				ev.setDetail("replenish", true);
			} else {
				// normal case: just change folder name for msg
				this._changeFolderName(item);
			}
		}
	}

	// conv moved or deleted	
	if (isConv && (ev.event == ZmEvent.E_MOVE || ev.event == ZmEvent.E_DELETE)) {
		// conv move: remove msg rows
		this._removeMsgRows(item.id);
		if (this._list.size() <= 1) {
			// clear msg pane
		}
	}

	// if an expanded conv gets a new msg, don't move it to top	
	if (isConv && (ev.event == ZmEvent.E_MODIFY) && (fields && fields[ZmItem.F_INDEX])) {
		var sortIndex = ev.getDetail("sortIndex");
		if ((sortIndex[item.id] != null) && this._expanded[item.id]) {
			sortIndex[item.id] = null;	// hint to parent change listener not to move it
		}
	}

	// if we get a new msg that's part of an expanded conv, insert it into the
	// expanded conv, and don't move that conv
	if (!isConv && (ev.event == ZmEvent.E_CREATE) && this._expanded[item.cid]) {
		var div = this._createItemHtml(item, this._now);
		var conv = this._appCtxt.getById(item.cid);
		var convIndex = this._getRowIndex(conv);
		var sortIndex = ev.getDetail("sortIndex");
		var msgIndex = sortIndex ? sortIndex[item.id] || 0 : 0;
		this._addRow(div, convIndex + msgIndex + 1);
		this._msgRowIdList[item.cid].push(div.id);
		ev.handled = true;
	}

	if (!ev.handled) {
		isConv ? ZmConvListView.prototype._changeListener.apply(this, arguments) :
				 ZmMailMsgListView.prototype._changeListener.apply(this, arguments);
	}
};

ZmHybridListView.prototype._removeMsgRows =
function(convId) {
	var msgRows = this._msgRowIdList[convId];
	if (msgRows && msgRows.length) {
		for (var i = 0; i < msgRows.length; i++) {
			var row = document.getElementById(msgRows[i]);
			this._selectedItems.remove(row);
			this._parentEl.removeChild(row);
		}
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
		if (list && list.length) {
			for (var i = 0; i < list.length; i++) {
				if (list[i] == rowId) {
					list[i] = null;
					break OUT;
				}
			}
		}
	}
	DwtListView.prototype.removeItem.apply(this, arguments);
};

ZmHybridListView.prototype._allowFieldSelection =
function(id, field) {
	// allow left selection if clicking on blank icon
	if (field == ZmListView.FIELD_PREFIX[ZmItem.F_EXPAND]) {
		return !this._expandable[id];
	} else {
		return ZmListView.prototype._allowFieldSelection.apply(this, arguments);
	}
};
