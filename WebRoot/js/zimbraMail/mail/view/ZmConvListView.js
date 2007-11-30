/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
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

/**
 * Creates a new double-pane view, with a list of conversations in the top pane,
 * and a message in the bottom pane.
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
ZmConvDoublePaneView = function(parent, className, posStyle, controller, dropTgt) {

	className = className || "ZmConvDoublePaneView";
	ZmDoublePaneView.call(this, parent, className, posStyle, ZmController.CONVLIST_VIEW, controller, dropTgt);
}

ZmConvDoublePaneView.prototype = new ZmDoublePaneView;
ZmConvDoublePaneView.prototype.constructor = ZmConvDoublePaneView;

ZmConvDoublePaneView.prototype.toString = 
function() {
	return "ZmConvDoublePaneView";
}

ZmConvDoublePaneView.prototype._createMailListView =
function(mode, controller, dropTgt) {
	return new ZmConvListView(this, null, Dwt.ABSOLUTE_STYLE, controller, dropTgt);
};

/**
 * This class is a ZmMailListView which can display both convs and msgs.
 * It handles expanding convs as well as paging additional messages in. Message rows are
 * inserted after the row of the owning conv.
 */
ZmConvListView = function(parent, className, posStyle, controller, dropTgt) {

	var headerList = this._getHeaderList(parent);
	ZmMailListView.call(this, parent, className, posStyle, ZmController.CONVLIST_VIEW, ZmItem.CONV, controller, headerList, dropTgt);

	// change listener needs to handle both types of events
	this._handleEventType[ZmItem.CONV] = true;
	this._handleEventType[ZmItem.MSG] = true;

	this._mode = ZmController.CONVLIST_VIEW;
	this._hasHiddenRows = true;	// so that up and down arrow keys work
	this._msgRowIdList = {};	// hash of lists, each list has row IDs for an expandable item
//	this._dblClickIsolation = (this._controller._readingPaneOn && !AjxEnv.isIE);
};

ZmConvListView.prototype = new ZmMailListView;
ZmConvListView.prototype.constructor = ZmConvListView;

// Constants

ZmConvListView.COL_WIDTH_FROM	= 145;
ZmConvListView.INDENT			= "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

ZmListView.FIELD_CLASS[ZmItem.F_EXPAND] = "Expand";

// Copy some functions from ZmMailMsgListView, for handling message rows
ZmConvListView.prototype._changeFolderName = ZmMailMsgListView.prototype._changeFolderName;
ZmConvListView.prototype._changeTrashStatus = ZmMailMsgListView.prototype._changeTrashStatus;

ZmConvListView.prototype.toString = 
function() {
	return "ZmConvListView";
};

ZmConvListView.prototype.createHeaderHtml =
function(defaultColumnSort) {

	ZmMailListView.prototype.createHeaderHtml.call(this, defaultColumnSort);

	// Show "From" or "To" depending on which folder we're looking at
	isFolder = this._resetFromColumnLabel();
      // set the received column name based on query string
		colLabel = isFolder.sent ? ZmMsg.sentAt : isFolder.drafts ? ZmMsg.lastSaved : ZmMsg.received;
		var recdColIdx = this.getColIndexForId(ZmItem.F_DATE);
		var recdColSpan = document.getElementById(DwtListView.HEADERITEM_LABEL + this._headerList[recdColIdx]._id);
		if (recdColSpan) {
			recdColSpan.innerHTML = "&nbsp;" + colLabel;
		}
		if (this._colHeaderActionMenu) {
			this._colHeaderActionMenu.getItem(recdColIdx).setText(colLabel);
            }
};

// Enter is normally a list view widget shortcut for DBLCLICK; we need to no-op
// it here so that it gets handled as an app shortcut (app shortcuts happen
// after widget shortcuts).
ZmConvListView.prototype.handleKeyAction =
function(actionCode, ev) {
	switch (actionCode) {
		case DwtKeyMap.DBLCLICK:
			return false;

		default:
			return ZmMailListView.prototype.handleKeyAction.call(this, actionCode, ev);
	}
};

ZmConvListView.prototype.markUIAsRead = 
function(item) {
	ZmMailListView.prototype.markUIAsRead.apply(this, arguments);
	if (item.type == ZmItem.MSG) {
		this._setImage(item, ZmItem.F_STATUS, item.getStatusIcon());
	}
};

ZmConvListView.prototype._getHeaderList =
function(parent) {

	var hList = [];

	if (appCtxt.get(ZmSetting.SHOW_SELECTION_CHECKBOX)) {
		hList.push(new DwtListHeaderItem(ZmItem.F_SELECTION, null, "TaskCheckbox", ZmListView.COL_WIDTH_ICON, null, null, null, ZmMsg.selection));
	}
	hList.push(new DwtListHeaderItem(ZmItem.F_EXPAND, null, "NodeCollapsed", ZmListView.COL_WIDTH_ICON, null, null, null, ZmMsg.expand));
	if (appCtxt.get(ZmSetting.FLAGGING_ENABLED)) {
		hList.push(new DwtListHeaderItem(ZmItem.F_FLAG, null, "FlagRed", ZmListView.COL_WIDTH_ICON, null, null, null, ZmMsg.flag));
	}
    if (appCtxt.get(ZmSetting.MAIL_PRIORITY_ENABLED)) {
        hList.push(new DwtListHeaderItem(ZmItem.F_PRIORITY, null, "PriorityHigh_list", ZmListView.COL_WIDTH_NARROW_ICON, null, null, null, ZmMsg.priority));
    }
	if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		hList.push(new DwtListHeaderItem(ZmItem.F_TAG, null, "Tag", ZmListView.COL_WIDTH_ICON, null, null, null, ZmMsg.tag));
	}
	hList.push(new DwtListHeaderItem(ZmItem.F_STATUS, null, "MsgStatus", ZmListView.COL_WIDTH_ICON, null, null, null, ZmMsg.status));
	hList.push(new DwtListHeaderItem(ZmItem.F_FROM, ZmMsg.from, null, ZmConvListView.COL_WIDTH_FROM, null, true));
	hList.push(new DwtListHeaderItem(ZmItem.F_ATTACHMENT, null, "Attachment", ZmListView.COL_WIDTH_ICON, null, null, null, ZmMsg.attachment));
	hList.push(new DwtListHeaderItem(ZmItem.F_SUBJECT, ZmMsg.subject, null, null, ZmItem.F_SUBJECT));
	hList.push(new DwtListHeaderItem(ZmItem.F_FOLDER, ZmMsg.folder, null, ZmMailListView.COL_WIDTH_FOLDER, null, true));
	hList.push(new DwtListHeaderItem(ZmItem.F_SIZE, ZmMsg.size, null, ZmMailListView.COL_WIDTH_SIZE, null, true));
	hList.push(new DwtListHeaderItem(ZmItem.F_DATE, ZmMsg.received, null, ZmListView.COL_WIDTH_DATE, ZmItem.F_DATE));

	return hList;
};

ZmConvListView.prototype._getDiv =
function(item, params) {
	var div = DwtListView.prototype._getDiv.apply(this, arguments);
	if ((item.type == ZmItem.MSG) && !params.isMatched) {
		div.style.backgroundColor = "EEEEFF";	// XXX: move to skins
	}
	return div;
};

// set isMatched for msgs	
ZmConvListView.prototype._addParams =
function(item, params) {
	if (item.type == ZmItem.MSG) {
		ZmMailMsgListView.prototype._addParams.apply(this, arguments);
	}
};

ZmConvListView.prototype._getCellId =
function(item, field) {
	return (field == ZmItem.F_FROM)
		? this._getFieldId(item, field)
		: ZmMailListView.prototype._getCellId.apply(this, arguments);
};

ZmConvListView.prototype._getCellClass =
function(item, field, params) {
	return (item.type == ZmItem.CONV && field == ZmItem.F_SIZE)
		? "Count"
		: (ZmMailListView.prototype._getCellClass.apply(this, arguments));
};

ZmConvListView.prototype._getCellContents =
function(htmlArr, idx, item, field, colIdx, params) {
	if (field == ZmItem.F_EXPAND) {
		idx = this._getImageHtml(htmlArr, idx, this._isExpandable(item) ? "NodeCollapsed" : null, this._getFieldId(item, field));
	} else if (item.type == ZmItem.MSG) {
		idx = ZmMailMsgListView.prototype._getCellContents.apply(this, arguments);
	} else {
		if (field == ZmItem.F_STATUS || field == ZmItem.F_FOLDER) {
			htmlArr[idx++] = "&nbsp;";
		} else if (field == ZmItem.F_FROM) {
			htmlArr[idx++] = this._getParticipantHtml(item, this._getFieldId(item, ZmItem.F_PARTICIPANT));
		} else if (field == ZmItem.F_SUBJECT) {
			htmlArr[idx++] = item.subject ? AjxStringUtil.htmlEncode(item.subject, true) : AjxStringUtil.htmlEncode(ZmMsg.noSubject);
			if (appCtxt.get(ZmSetting.SHOW_FRAGMENTS) && item.fragment) {
				htmlArr[idx++] = this._getFragmentSpan(item);
			}
		} else if (field == ZmItem.F_SIZE) {
			if (item.numMsgs > 1) {
				htmlArr[idx++] = "(";
				htmlArr[idx++] = item.numMsgs;
				htmlArr[idx++] = ")";
			}
		} else if (field == ZmItem.F_TYPE) {
			// Type icon (mixed view only)
			if (item.isDraft) {
				htmlArr[idx++] = AjxImg.getImageHtml("MsgStatusDraft", null, ["id='", this._getFieldId(item, ZmItem.F_STATUS), "'"].join(""));
			} else {
				idx = ZmMailListView.prototype._getCellContents.apply(this, arguments);
			}
		} else {
			idx = ZmMailListView.prototype._getCellContents.apply(this, arguments);
		}
	}
	
	return idx;
};

ZmConvListView.prototype._getParticipantHtml =
function(conv, fieldId) {
	var html = [];
	var idx = 0;

	var part1 = conv.participants ? conv.participants.getArray() : null;
	var origLen = part1 ? part1.length : 0;
	// might get a weird case where there are no participants in message
	if (origLen > 0) {
		var partColWidth = this._headerList[this.getColIndexForId(ZmItem.F_FROM)]._width;
		var part2 = this._fitParticipants(part1, conv.participantsElided, partColWidth);
		for (var j = 0; j < part2.length; j++) {
			if (j == 1 && (conv.participantsElided || part2.length < origLen)) {
				html[idx++] = AjxStringUtil.ELLIPSIS;
			} else if (part2.length > 1 && j > 0) {
				html[idx++] = ", ";
			}
			var spanId = [fieldId, part2[j].index].join("_");
			html[idx++] = "<span style='white-space: nowrap' id='";
			html[idx++] = spanId;
			html[idx++] = "'>";
			html[idx++] = part2[j].name;
			html[idx++] = "</span>";
		}

		// bug fix #724
		if (part2.length == 1 && origLen > 1) {
			html[idx++] = AjxStringUtil.ELLIPSIS;
		}
	} else {
		// XXX: possible import bug but we must take into account
		html[idx++] = ZmMsg.noWhere;
	}

	return html.join("");
};

ZmConvListView.prototype._getHeaderToolTip =
function(field, itemIdx) {
    var isFolder = this._isSentOrDraftsFolder();
    return (field == ZmItem.F_EXPAND)
		? ZmMsg.expandCollapse
		: ZmMailListView.prototype._getHeaderToolTip.call(this, field, itemIdx, isFolder);
};

ZmConvListView.prototype._getToolTip =
function(field, item, ev, div, match) {
	if (!item) { return; }
	if (field == ZmItem.F_PARTICIPANT || field == ZmItem.F_FROM) {
		return item.participants ? this._getParticipantToolTip(item.participants.get(match.participant || 0)) : null;
	} else {
		return ZmMailListView.prototype._getToolTip.apply(this, arguments);
	}
};

/**
 * @param conv		[ZmConv]		conv that owns the messages we will display
 * @param msg		[ZmMailMsg]*	msg that is the anchor for paging in more msgs
 * @param offset	[int]*			start of current page of msgs within conv
 */
ZmConvListView.prototype._expand =
function(conv, msg, offset) {
	var item = msg || conv;
	var isConv = (item.type == ZmItem.CONV);
	var rowIds = this._msgRowIdList[item.id];
	if (rowIds && rowIds.length && this._rowsArePresent(item)) {
		this._showMsgs(rowIds, true);
	} else {
		this._msgRowIdList[item.id] = [];
		var msgList = conv.msgs;
		if (!msgList) { return; }
		if (isConv) {
			// should be here only when the conv is first expanded
			msgList.addChangeListener(this._listChangeListener);
		}
		var index = this._getRowIndex(item);	// row after which to add rows

		// work with entire list of conv's msgs, using offset
		var a = msgList.getArray();
		var limit = appCtxt.get(ZmSetting.PAGE_SIZE);
		offset = this._msgOffset[item.id] || 0;
		var num = Math.min(limit, msgList.size() - offset);
		for (var i = 0; i < num; i++) {
			var msg = a[offset + i];
			var div = this._createItemHtml(msg, {now:this._now});
			this._addRow(div, index + i + 1);
			this._msgRowIdList[item.id].push(div.id);
		}
	}

	this._setImage(item, ZmItem.F_EXPAND, "NodeExpanded");
	this._expanded[item.id] = true;
	
	var cid = isConv ? item.id : item.cid;
	if (!this._expandedItems[cid]) {
		this._expandedItems[cid] = [];
	}
	this._expandedItems[cid].push(item);

	this._resetColWidth();
};

ZmConvListView.prototype._collapse =
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

	this._resetColWidth();
};

ZmConvListView.prototype._doCollapse =
function(item) {
	var rowIds = this._msgRowIdList[item.id];
	this._showMsgs(rowIds, false);
	this._setImage(item, ZmItem.F_EXPAND, "NodeCollapsed");
	this._expanded[item.id] = false;
};

ZmConvListView.prototype._showMsgs =
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
ZmConvListView.prototype._rowsArePresent =
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
ZmConvListView.prototype._isExpandable =
function(item) {
	var expandable = false;
	if (item.type == ZmItem.CONV) {
		expandable = (item.numMsgs > 1);
	} else {
		var conv = appCtxt.getById(item.cid);
		if (!conv) { return false; }
		
		var a = conv.msgs ? conv.msgs.getArray() : null;
		if (a && a.length) {
			var limit = appCtxt.get(ZmSetting.PAGE_SIZE);
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

	return expandable;
};

ZmConvListView.prototype._resetExpansion =
function() {
	this._expanded = {};		// current expansion state, by ID
	this._msgRowIdList = {};	// list of row IDs for a conv ID
	this._msgOffset = {};		// the offset for a msg ID
	this._expandedItems = {};	// list of expanded items for a conv ID (inc conv)
};

ZmConvListView.prototype._expandItem =
function(item) {
	if (item && this._isExpandable(item)) {
		this._controller._toggle(item);
	} else if (item.type == ZmItem.MSG && this._expanded[item.cid]) {
		var conv = appCtxt.getById(item.cid);
		this._controller._toggle(conv);
		this.setSelection(conv, true);
	}
};

ZmConvListView.prototype._expandAll =
function(expand) {
	var a = this._list.getArray();
	for (var i = 0, count = a.length; i < count; i++) {
		var conv = a[i];
		if (!this._isExpandable(conv)) { continue; }
		if (expand)	{
			this._expandItem(conv);
		} else {
			this._collapse(conv);
		}
	}
};

ZmConvListView.prototype._sortColumn =
function(columnItem, bSortAsc) {

	// call base class to save the new sorting pref
	ZmMailListView.prototype._sortColumn.call(this, columnItem, bSortAsc);

	if (this.getList().size() > 1 && this._sortByString) {
		var searchString = this._controller.getSearchString();
		var params = {query:searchString, types:[ZmItem.CONV], sortBy:this._sortByString, limit:this.getLimit()};
		appCtxt.getSearchController().search(params);
	}
};

ZmConvListView.prototype._changeListener =
function(ev) {

	var item = this._getItemFromEvent(ev);
	if (!item || ev.handled || !this._handleEventType[item.type]) { return; }

	var fields = ev.getDetail("fields");
	var isConv = (item.type == ZmItem.CONV);
	
	// msg moved or deleted	
	if (!isConv && (ev.event == ZmEvent.E_MOVE || ev.event == ZmEvent.E_DELETE)) {
		var	conv = appCtxt.getById(item.cid);
		ev.handled = true;
		if (conv) {
			if (item.folderId == ZmFolder.ID_SPAM || ev.event == ZmEvent.E_DELETE) {
				// msg marked as Junk, or deleted via Empty Trash
				// TODO: handle expandable msg removal
				conv.removeMsg(item);
				if (this._isExpandable(conv) && conv.numMsgs == 1) {
					this._setImage(conv, ZmItem.F_EXPAND, null);
					this._removeMsgRows(conv.id);
				}
				this.removeItem(item, true);	// remove msg row
			} else {
				// if this conv now has no msgs that match current search, remove it
				var removeConv = true;
				var curSearch = this._controller._app.currentSearch;
				var folderId = curSearch ? curSearch.folderId : null;
				if (folderId && conv.msgs) {
					var msgs = conv.msgs.getArray();
					for (var i = 0; i < msgs.length; i++) {
						if (msgs[i].folderId == folderId) {
							removeConv = false;
							break;
						}
					}
				} else {
					removeConv = false;
				}
				if (removeConv) {
					this._list.remove(conv);				// view has sublist of controller list
					this._controller._list.remove(conv);	// complete list
					ev.item = item = conv;
					isConv = true;
					ev.handled = false;
				} else {
					// normal case: just change folder name for msg
					this._changeFolderName(item);
				}
			}
		}
	}

	// conv moved or deleted	
	if (isConv && (ev.event == ZmEvent.E_MOVE || ev.event == ZmEvent.E_DELETE)) {
		// conv move: remove msg rows
		this._removeMsgRows(item.id);
		if (this._list.size() <= 1) {
			// XXX: clear msg pane
		}
	}

	// if we get a new msg that's part of an expanded conv, insert it into the
	// expanded conv, and don't move that conv
	if (!isConv && (ev.event == ZmEvent.E_CREATE)) {
		if (this._expanded[item.cid]) {
			var div = this._createItemHtml(item, {now:this._now});
			var conv = appCtxt.getById(item.cid);
			var convIndex = this._getRowIndex(conv);
			var sortIndex = ev.getDetail("sortIndex");
			var msgIndex = sortIndex || 0;
			this._addRow(div, convIndex + msgIndex + 1);
			this._msgRowIdList[item.cid].push(div.id);
		}
		ev.handled = true;
	}

	// virtual conv promoted to real conv, got new ID
	if (isConv && (ev.event == ZmEvent.E_MODIFY) && (fields && fields[ZmItem.F_ID])) {
		// a virtual conv has become real, and changed its ID
		var div = document.getElementById(this._getItemId({id:item._oldId}));
		if (div) {
			this._createItemHtml(item, {now:this._now, div:div});
			this.associateItemWithElement(item, div, DwtListView.TYPE_LIST_ITEM);
			DBG.println(AjxDebug.DBG1, "conv updated from ID " + item._oldId + " to ID " + item.id);
		}
		this._expanded[item.id] = this._expanded[item._oldId];
		this._msgRowIdList[item.id] = this._msgRowIdList[item._oldId];
	}
	
	if (isConv && (ev.event == ZmEvent.E_MODIFY) && (fields && fields[ZmItem.F_INDEX])) {
		// a conv has gotten a new msg and may need to be moved within its list
		// if an expanded conv gets a new msg, don't move it to top
		var sortIndex = ev.getDetail("sortIndex");
		if ((sortIndex != null) && (this._list.indexOf(item) != sortIndex) && !this._expanded[item.id]) {
			this.removeItem(item);
			this.addItem(item, sortIndex);
		}
	}

	// only a conv can change its fragment
	if (ev.event == ZmEvent.E_MODIFY && (fields && fields[ZmItem.F_FRAGMENT])) {
		var fragmentField = this._getElement(item, ZmItem.F_FRAGMENT);
		if (fragmentField) {
			fragmentField.innerHTML = this._getFragmentHtml(item);
		}
	}

	if (ev.event == ZmEvent.E_MODIFY && (fields && (fields[ZmItem.F_PARTICIPANT] || fields[ZmItem.F_FROM]))) {
		var fieldId = this._getFieldId(item, ZmItem.F_FROM);
		var fromField = document.getElementById(fieldId);
		if (fromField) {
			fromField.innerHTML = this._getParticipantHtml(item, fieldId);
		}
	}

	// msg count in a conv changed - see if we need to add or remove an expand icon
	if (isConv && (ev.event == ZmEvent.E_MODIFY) && (fields && fields[ZmItem.F_SIZE])) {
		var countField = this._getElement(item, ZmItem.F_SIZE);
		if (countField) {
			countField.innerHTML = item.numMsgs > 1 ? ["(", item.numMsgs, ")"].join("") : "";
		}
		var imageInfo = !this._isExpandable(item) ? null : this._expanded[item.id] ? "NodeExpanded" : "NodeCollapsed";
		this._setImage(item, ZmItem.F_EXPAND, imageInfo);
	}

	if (ev.event == ZmEvent.E_MODIFY && (fields && fields[ZmItem.F_DATE])) {
		var fieldId = this._getFieldId(item, ZmItem.F_DATE);
		var dateField = document.getElementById(fieldId);
		if (dateField) {
			var html = [];
			this._getCellContents(html, 0, item, ZmItem.F_DATE, this.getColIndexForId(ZmItem.F_DATE), new Date());
			dateField.innerHTML = html.join("");
		}
	}

	if (!ev.handled) {
		isConv ? ZmMailListView.prototype._changeListener.apply(this, arguments) :
				 ZmMailMsgListView.prototype._changeListener.apply(this, arguments);
	}
};

ZmConvListView.prototype._removeMsgRows =
function(convId) {
	var msgRows = this._msgRowIdList[convId];
	if (msgRows && msgRows.length) {
		for (var i = 0; i < msgRows.length; i++) {
			var row = document.getElementById(msgRows[i]);
			if (row) {
				this._selectedItems.remove(row);
				this._parentEl.removeChild(row);
			}
		}
	}
};

/**
 * Override so we can clean up lists of cached rows.
 */
ZmConvListView.prototype.removeItem =
function(item, skipNotify) {
	if (item.type == ZmItem.MSG) {
		var msgRowId = this._getItemId(item);
		var list = this._msgRowIdList[item.cid];
		if (list && list.length) {
			for (var i = 0; i < list.length; i++) {
				if (list[i] == msgRowId) {
					list[i] = null;
					break;
				}
			}
		}
	}
	DwtListView.prototype.removeItem.apply(this, arguments);
};

ZmConvListView.prototype._allowFieldSelection =
function(id, field) {
	// allow left selection if clicking on blank icon
	if (field == ZmItem.F_EXPAND) {
		var item = appCtxt.getById(id);
		return (item && !this._isExpandable(item));
	} else {
		return ZmListView.prototype._allowFieldSelection.apply(this, arguments);
	}
};

// Static methods

// XXX: test, also handle msgs
ZmConvListView.getPrintHtml =
function(conv, preferHtml, callback) {

	// first, get list of all msg id's for this conversation
	if (conv.msgIds == null) {
		var soapDoc = AjxSoapDoc.create("GetConvRequest", "urn:zimbraMail");
		var msgNode = soapDoc.set("c");
		msgNode.setAttribute("id", conv.id);

		var respCallback = new AjxCallback(null, ZmConvListView._handleResponseGetPrintHtml, [conv, preferHtml, callback]);
		window._zimbraMail.sendRequest({soapDoc: soapDoc, asyncMode: true, callback: respCallback});
	} else {
		ZmConvListView._printMessages(conv, preferHtml, callback);
	}
};

ZmConvListView._handleResponseGetPrintHtml =
function(conv, preferHtml, result) {
	var resp = result.getResponse().GetConvResponse.c[0];
	var msgIds = new Array();
	var len = resp.m.length;
	for (var i = 0; i < len; i++)
		msgIds.push(resp.m[i].id);
	conv.msgIds = msgIds;
	ZmConvListView._printMessages(conv, preferHtml, callback);
};

ZmConvListView._printMessages =
function(conv, preferHtml, callback) {
	// XXX: optimize? Once these msgs are d/l'ed should they be cached?
	var soapDoc = AjxSoapDoc.create("BatchRequest", "urn:zimbra");
	soapDoc.setMethodAttribute("onerror", "continue");

	for (var i = 0; i < conv.msgIds.length; i++) {
		// make a request to get this mail message from the server
		var msgRequest = soapDoc.set("GetMsgRequest", null, null, "urn:zimbraMail");

		var doc = soapDoc.getDoc();
		var msgNode = doc.createElement("m");
		msgNode.setAttribute("id", conv.msgIds[i]);
		if (preferHtml)
			msgNode.setAttribute("html", "1");
		msgRequest.appendChild(msgNode);
	}
	var respCallback = new AjxCallback(null, ZmConvListView._handleResponseGetMessages, [conv, preferHtml, callback]);
	window._zimbraMail.sendRequest({soapDoc: soapDoc, asyncMode: true, callback: respCallback});
};

ZmConvListView._handleResponseGetMessages =
function(conv, preferHtml, callback, result) {
	var resp = result.getResponse().BatchResponse.GetMsgResponse;

	var html = new Array();
	var idx = 0;

	html[idx++] = "<font size=+2>";
	html[idx++] = conv.subject;
	html[idx++] = "</font><br><font size=+1>";
	html[idx++] = conv.numMsgs;
	html[idx++] = (conv.numMsgs > 1) ? " messages" : " message";
	html[idx++] = "</font><hr>";

	for (var i = 0; i < resp.length; i++) {
		var msgNode = resp[i].m[0];
		var msg = ZmMailMsg.createFromDom(msgNode, {list:null});
		html[idx++] = ZmMailMsgView.getPrintHtml(msg, preferHtml);
		if (i < resp.length - 1) {
			html[idx++] = "<hr>";
		}
	}

	result.set(html.join(""));
	if (callback) callback.run(result);
};
