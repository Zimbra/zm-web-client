/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a new double-pane view, with a list of conversations in the top pane,
 * and a message in the bottom pane.
 * @constructor
 * @class
 * This variation of a double pane view combines a conv list view with a reading
 * pane in which the first msg of a conv is shown. Any conv with more than one
 * message is expandable, and gets an expansion icon in the left column. Clicking on that
 * will display the conv's first page of messages. The icon then becomes a collapse icon and
 * clicking it will collapse the conv (hide the messages).
 * <p>
 * If a conv has more than one page of messages, the last message on the first page
 * will get a + icon, and that message is expandable.</p>
 *
 * @author Conrad Damon
 * 
 * @private
 */
ZmConvDoublePaneView = function(params) {

	params.className = params.className || "ZmConvDoublePaneView";
	params.mode = ZmId.VIEW_CONVLIST;
	ZmDoublePaneView.call(this, params);
};

ZmConvDoublePaneView.prototype = new ZmDoublePaneView;
ZmConvDoublePaneView.prototype.constructor = ZmConvDoublePaneView;

ZmConvDoublePaneView.prototype.isZmConvDoublePaneView = true;
ZmConvDoublePaneView.prototype.toString = function() { return "ZmConvDoublePaneView"; };

ZmConvDoublePaneView.prototype._createMailListView =
function(params) {
	return new ZmConvListView(params);
};

// default to conv item view
ZmConvDoublePaneView.prototype._createMailItemView =
function(params) {
	this._itemViewParams = params;
	return this._getItemView(ZmItem.CONV);
};

// get the item view based on the given type
ZmConvDoublePaneView.prototype._getItemView =
function(type) {
	
	this._itemViewParams.className = null;
	if (type == ZmItem.CONV) {
		if (!this._convView) {
			this._itemViewParams.id = ZmId.getViewId(ZmId.VIEW_CONV, null, this._itemViewParams.view);
			this._convView = new ZmConvView2(this._itemViewParams);
		}
	}
	else if (type == ZmItem.MSG) {
		if (!this._mailMsgView) {
			this._itemViewParams.id = ZmId.getViewId(ZmId.VIEW_MSG, null, this._itemViewParams.view);
			this._mailMsgView = new ZmMailMsgView(this._itemViewParams);
		}
	}
	return (type == ZmItem.CONV) ? this._convView : this._mailMsgView;
};

// set up to display either a conv or a msg in the item view
ZmConvDoublePaneView.prototype.setItem =
function(item, force, dontFocus) {
	var changed = ((item.type == ZmItem.CONV) != (this._itemView && this._itemView == this._convView));
	this._itemView = this._getItemView(item.type);
	var otherView = (item.type == ZmItem.CONV) ? this._mailMsgView : this._convView;
	if (otherView) {
		otherView.setVisible(false);
	}
	this._itemView.setVisible(true);
	if (changed) {
		this.setReadingPane();	// so that second view gets positioned
	}
	ZmDoublePaneView.prototype.setItem.apply(this, arguments);
};

/**
 * This class is a ZmMailListView which can display both convs and msgs.
 * It handles expanding convs as well as paging additional messages in. Message rows are
 * inserted after the row of the owning conv.
 * 
 * @private
 */
ZmConvListView = function(params) {

	params.type = ZmItem.CONV;
	this._controller = params.controller;
	params.headerList = this._getHeaderList();
	ZmMailListView.call(this, params);

	// change listener needs to handle both types of events
	this._handleEventType[ZmItem.CONV] = true;
	this._handleEventType[ZmItem.MSG] = true;

	this._mode = ZmId.VIEW_CONVLIST;
	this._hasHiddenRows = true;	// so that up and down arrow keys work
	this._resetExpansion();
};

ZmConvListView.prototype = new ZmMailListView;
ZmConvListView.prototype.constructor = ZmConvListView;

ZmConvListView.prototype.isZmConvListView = true;
ZmConvListView.prototype.toString = function() { return "ZmConvListView"; };

// Constants

ZmListView.FIELD_CLASS[ZmItem.F_EXPAND] = "Expand";

ZmConvListView.MSG_STYLE = "ZmConvExpanded";	// for differentiating msg rows

// Copy some functions from ZmMailMsgListView, for handling message rows
ZmConvListView.prototype._changeFolderName = ZmMailMsgListView.prototype._changeFolderName;
ZmConvListView.prototype._changeTrashStatus = ZmMailMsgListView.prototype._changeTrashStatus;


ZmConvListView.prototype.set =
function(list, sortField) {
	if (this.offset == 0) {
		this._resetExpansion();
	}
	ZmMailListView.prototype.set.apply(this, arguments);
};

ZmConvListView.prototype.handleKeyAction =
function(actionCode, ev) {
	// Enter is normally a list view widget shortcut for DBLCLICK; we need to no-op
	// it here so that it gets handled as an app shortcut (app shortcuts happen
	// after widget shortcuts).
	switch (actionCode) {
		case DwtKeyMap.DBLCLICK:
			return false;

		default:
			return ZmMailListView.prototype.handleKeyAction.call(this, actionCode, ev);
	}
};

/**
 * check whether all conversations are checked
 * overrides ZmListView.prototype._isAllChecked since the list here contains both conversations and messages, and we care only about messages
 * @return {Boolean} true if all conversations are checked
 */
ZmConvListView.prototype._isAllChecked =
function() {
	var selection = this.getSelection();
	//let's see how many conversations are checked.
	//ignore checked messages. Sure, if the user selects manually all messages in a conversation, the
	//conversation is not selected automatically too, but that's fine I think.
	//This method returns true if and only if all the conversations (in the conversation layer of the tree) are selected
	var convsSelected = 0;
	for (var i = 0; i < selection.length; i++) {
		if (selection[i].type == ZmItem.CONV) {
			convsSelected++;
		}
	}

	var list = this.getList();
	return (list && convsSelected == list.size());
};


ZmConvListView.prototype.markUIAsRead = 
function(item) {
	ZmMailListView.prototype.markUIAsRead.apply(this, arguments);
	if (item.type == ZmItem.MSG) {
		this._setImage(item, ZmItem.F_STATUS, item.getStatusIcon());
	}
};

/**
 * Overrides DwtListView.getList to optionally include any visible msgs.
 *
 * @param {Boolean}	allItems	if <code>true</code>, include visible msgs
 */
ZmConvListView.prototype.getList =
function(allItems) {
	if (!allItems) {
		return ZmMailListView.prototype.getList.call(this);
	} else {
		var list = [];
		var childNodes = this._parentEl.childNodes;
		for (var i = 0; i < childNodes.length; i++) {
			var el = childNodes[i];
			if (Dwt.getVisible(el)) {
				var item = this.getItemFromElement(el);
				if (item) {
					list.push(item);
				}
			}
		}
		return AjxVector.fromArray(list);
	}
};

// See if we've been rigged to return a particular msg
ZmConvListView.prototype.getSelection =
function() {
	return this._selectedMsg ? [this._selectedMsg] : ZmMailListView.prototype.getSelection.apply(this, arguments);
};

ZmConvListView.prototype.getItemIndex =
function(item, allItems) {
	var list = this.getList(allItems);
	if (item && list) {
		var len = list.size();
		for (var i = 0; i < len; ++i) {
			var test = list.get(i);
			if (test && test.id == item.id) {
				return i;
			}
		}
	}
	return null;
};

ZmConvListView.prototype._initHeaders =
function() {
	if (!this._headerInit) {
		ZmMailListView.prototype._initHeaders.call(this);
		this._headerInit[ZmItem.F_EXPAND]	= {icon:"NodeCollapsed", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.expand};
        //bug:45171 removed sorted from converstaion for FROM field
        this._headerInit[ZmItem.F_FROM]		= {text:ZmMsg.from, width:ZmMsg.COLUMN_WIDTH_FROM_CLV, resizeable:true};
	}
};

ZmConvListView.prototype._getHeaderList =
function() {
	var headers;
	if (this.isMultiColumn()) {
		headers = [
			ZmItem.F_SELECTION,
			ZmItem.F_EXPAND,
			ZmItem.F_FLAG,
			ZmItem.F_PRIORITY,
			ZmItem.F_TAG,
			ZmItem.F_STATUS,
			ZmItem.F_FROM,
			ZmItem.F_ATTACHMENT,
			ZmItem.F_MSG_PRIORITY,
			ZmItem.F_SUBJECT,
			ZmItem.F_FOLDER,
			ZmItem.F_SIZE
		];
		if (appCtxt.accountList.size() > 2) {
			headers.push(ZmItem.F_ACCOUNT);
		}
		headers.push(ZmItem.F_DATE);
	}
	else {
		headers = [
			ZmItem.F_SELECTION,
			ZmItem.F_SORTED_BY
		];
	}

	return this._getHeaders(ZmId.VIEW_CONVLIST, headers);
};

ZmConvListView.prototype._resetFromColumnLabel =
function() {
	// set from column sortability based on query string
	var headerCol = this._headerHash[ZmItem.F_FROM];
	if (headerCol) {
		headerCol._sortable = this._isOutboundFolder() ? ZmItem.F_FROM : null;
	}
	ZmMailListView.prototype._resetFromColumnLabel.apply(this, arguments);
};

ZmConvListView.prototype._getDivClass =
function(base, item, params) {
	if (item.type == ZmItem.MSG) {
		if (params.isDragProxy || params.isMatched) {
			return ZmMailMsgListView.prototype._getDivClass.apply(this, arguments);
		} else {
			return [base, ZmConvListView.MSG_STYLE].join(" ");
		}
	} else {
		return ZmMailListView.prototype._getDivClass.apply(this, arguments);
	}
};

ZmConvListView.prototype._getRowClass =
function(item) {
	return (item.type == ZmItem.MSG) ?
		ZmMailMsgListView.prototype._getRowClass.apply(this, arguments) :
		ZmMailListView.prototype._getRowClass.apply(this, arguments);
};

// set isMatched for msgs	
ZmConvListView.prototype._addParams =
function(item, params) {
	if (item.type == ZmItem.MSG) {
		ZmMailMsgListView.prototype._addParams.apply(this, arguments);
	}
};

//apply colors to from and subject cells via zimlet
ZmConvListView.prototype._getStyleViaZimlet =
function(field, item) {

	if (field != "fr" && field != "su" && field != "st") {
		return "";
	}

	if (appCtxt.zimletsPresent() && this._ignoreProcessingGetMailCellStyle == undefined) {
		if (!this._zimletMgr) {
			this._zimletMgr = appCtxt.getZimletMgr();	//cache zimletMgr
		}
		var style = this._zimletMgr.processARequest("getMailCellStyle", item, field);
		if (style != undefined && style != null) {
			return style;	//set style
		} else if (style == null && this._zimletMgr.isLoaded()) {
			//zimlet not available or disabled, set _ignoreProcessingGetMailCellStyle to true
			//to ignore this entire section for this session
			this._ignoreProcessingGetMailCellStyle = true;
		}
	}
	return "";
};

ZmConvListView.prototype._getCell =
function(htmlArr, idx, item, field, colIdx, params) {
	if (field == ZmItem.F_SORTED_BY && item.type == ZmItem.MSG) {
		htmlArr[idx++] = "<td width=16>";
		idx = this._getCellContents(htmlArr, idx, item, ZmItem.F_EXPAND, colIdx, params);
		htmlArr[idx++] = "</td>";
	}
	return ZmMailListView.prototype._getCell.apply(this, arguments);
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

	if (field == ZmItem.F_SELECTION) {
		idx = ZmMailListView.prototype._getCellContents.apply(this, arguments);
	}
	else if (field == ZmItem.F_EXPAND) {
		idx = this._getImageHtml(htmlArr, idx, this._isExpandable(item) ? "NodeCollapsed" : null, this._getFieldId(item, field));
	}
	else if (field == ZmItem.F_READ) {
		idx = this._getImageHtml(htmlArr, idx, item.getReadIcon(), this._getFieldId(item, field));
	}
	else if (item.type == ZmItem.MSG) {
		idx = ZmMailMsgListView.prototype._getCellContents.apply(this, arguments);
	}
	else {
		if (field == ZmItem.F_STATUS) {
			if (item.type == ZmItem.CONV && item.numMsgs == 1 && item.isScheduled) {
				idx = this._getImageHtml(htmlArr, idx, "SendLater", this._getFieldId(item, field));
			} else {
				htmlArr[idx++] = "&nbsp;";
			}
		}
		else if (field == ZmItem.F_FROM) {
			htmlArr[idx++] = this._getParticipantHtml(item, this._getFieldId(item, ZmItem.F_PARTICIPANT));
			if (item.type == ZmItem.CONV && (item.numMsgs > 1) && !this.isMultiColumn()) {
				htmlArr[idx++] = " - <span class='ZmConvListNumMsgs'>";
				htmlArr[idx++] = item.numMsgs;
				htmlArr[idx++] = "</span>";
			}
		}
		else if (field == ZmItem.F_SUBJECT) {
			var subj = ZmMailMsg.stripSubjectPrefixes(item.subject || ZmMsg.noSubject);
			htmlArr[idx++] = AjxStringUtil.htmlEncode(subj, true);
			if (appCtxt.get(ZmSetting.SHOW_FRAGMENTS) && item.fragment) {
				htmlArr[idx++] = this._getFragmentSpan(item);
			}
		}
		else if (field == ZmItem.F_FOLDER) {
			if (item.folderId) {
				htmlArr[idx++] = "<nobr id='";
				htmlArr[idx++] = this._getFieldId(item, field);
				htmlArr[idx++] = "'>"; // required for IE bug
				var folder = appCtxt.getById(item.folderId);
				if (folder) {
					htmlArr[idx++] = folder.getName();
				}
				htmlArr[idx++] = "</nobr>";
			}
		}
		else if (field == ZmItem.F_SIZE) {
			if (item.size) {
				htmlArr[idx++] = "<nobr>";
				htmlArr[idx++] = AjxUtil.formatSize(item.size);
				htmlArr[idx++] = "</nobr>";
			} else if (item.numMsgs > 1) {
				htmlArr[idx++] = "(";
				htmlArr[idx++] = item.numMsgs;
				htmlArr[idx++] = ")";
			}
		}
		else if (field == ZmItem.F_SORTED_BY) {
			htmlArr[idx++] = this._getAbridgedContent(item, colIdx);
		}
		else {
			idx = ZmMailListView.prototype._getCellContents.apply(this, arguments);
		}
	}
	
	return idx;
};

ZmConvListView.prototype._getAbridgedContent =
function(item, colIdx) {

	var htmlArr = [];
	var idx = 0;
	var width = (AjxEnv.isIE || AjxEnv.isSafari) ? 22 : 16;

	var isMsg = (item.type == ZmItem.MSG);
	var isConv = (item.type == ZmItem.CONV && item.numMsgs > 1);
	
	// first row
	htmlArr[idx++] = "<table class='TopRow' style='width:100%;border-collapse:collapse;border-spacing:0;'>";
	htmlArr[idx++] = (item.isUnread && !item.isMuted()) ? "<tr class='Unread' " : "<tr ";
	htmlArr[idx++] = "id='";
	htmlArr[idx++] = DwtId.getListViewItemId(DwtId.WIDGET_ITEM_FIELD, this._view, item.id, ZmItem.F_ITEM_ROW_3PANE);
	htmlArr[idx++] = "'>";
	
	idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_READ, colIdx, width);
	if (isConv) {
		idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_EXPAND, colIdx, "16", "style='padding:0'");
	}
	
	// for multi-account, show the account icon for cross mbox search results
	if (appCtxt.multiAccounts && !isMsg && appCtxt.getSearchController().searchAllAccounts) {
		idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_ACCOUNT, colIdx, "16", "align=right");
	}
	idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_FROM, colIdx);
	idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_DATE, colIdx, ZmMsg.COLUMN_WIDTH_DATE, "align=right");
	htmlArr[idx++] = "</tr></table>";

	// second row
	htmlArr[idx++] = "<table class='BottomRow' style='width:100%;border-collapse:collapse;border-spacing:0;'><tr>";
	htmlArr[idx++] = "<td width=";
	htmlArr[idx++] = width;
	htmlArr[idx++] = "></td>";
	
	if (isMsg) {
		idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_STATUS, colIdx, width);
	}
	if (item.isHighPriority || item.isLowPriority) {
		idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_PRIORITY, colIdx, "10", "align=right");
	}
	idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_SUBJECT, colIdx);
	if (item.hasAttach) {
		idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_ATTACHMENT, colIdx, width, "valign=top");
	}
	idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_TAG, colIdx, width);	
	if (appCtxt.get(ZmSetting.PRIORITY_INBOX_ENABLED)) {
		idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_MSG_PRIORITY, colIdx, "16", "align=right");	
	}
	if (appCtxt.get(ZmSetting.FLAGGING_ENABLED)) {
		idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_FLAG, colIdx, width);
	}
	htmlArr[idx++] = "</tr></table>";
	
	return htmlArr.join("");
};

ZmConvListView.prototype._getParticipantHtml =
function(conv, fieldId) {
	var html = [];
	var idx = 0;

	var part1 = conv.participants ? conv.participants.getArray() : null;
	var origLen = part1 ? part1.length : 0;
	// might get a weird case where there are no participants in message
	if (origLen > 0) {

		// bug 23832 - create notif for conv in sent gives us sender as participant, we want recip
		var folder = appCtxt.getById(this._folderId);
		if ((origLen == 1) && (part1[0].type == AjxEmailAddress.FROM) && folder && conv.isZmConv &&
			(folder.isUnder(ZmFolder.ID_SENT) || folder.isUnder(ZmFolder.ID_DRAFTS) ||
			folder.isUnder(ZmFolder.ID_OUTBOX))) {

			var msg = conv.getFirstHotMsg();
			if (msg) {
				var addrs = msg.getAddresses(AjxEmailAddress.TO).getArray();
	            if (addrs && addrs.length) {
					part1 = addrs;
				} else {
					return "&nbsp;"
				}
			}
		}

		var headerCol = this._headerHash[ZmItem.F_FROM];
		var partColWidth = headerCol ? headerCol._width : ZmMsg.COLUMN_WIDTH_FROM_CLV;
		var part2 = this._fitParticipants(part1, conv, partColWidth);
		for (var j = 0; j < part2.length; j++) {
			if (j == 0 && (conv.participantsElided || part2.length < origLen)) {
				html[idx++] = AjxStringUtil.ELLIPSIS;
			} else if (part2.length > 1 && j > 0) {
				html[idx++] = AjxStringUtil.LIST_SEP;
			}
			var p2 = (part2 && part2[j] && (part2[j].index != null)) ? part2[j].index : "";
			var spanId = [fieldId, p2].join(DwtId.SEP);
			html[idx++] = "<span style='white-space: nowrap' id='";
			html[idx++] = spanId;
			html[idx++] = "'>";
			html[idx++] = (part2 && part2[j]) ? AjxStringUtil.htmlEncode(part2[j].name) : "";
			html[idx++] = "</span>";
		}
	} else {
		// XXX: possible import bug but we must take into account
		html[idx++] = ZmMsg.noWhere;
	}

	return html.join("");
};

ZmConvListView.prototype._getHeaderToolTip =
function(field, itemIdx) {
    return (field == ZmItem.F_EXPAND)
		? ZmMsg.expandCollapse
		: ZmMailListView.prototype._getHeaderToolTip.call(this, field, itemIdx, this._isOutboundFolder());
};

ZmConvListView.prototype._getToolTip =
function(params) {
	if (!params.item) { return; }

	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED) && (params.field == ZmItem.F_PARTICIPANT || params.field == ZmItem.F_FROM)) { 
		var parts = params.item.participants;
		var matchedPart = params.match && params.match.participant;
		var addr = parts && parts.get(matchedPart || 0);
		if (!addr) { return ""; }

		var ttParams = {address:addr, ev:params.ev};
		var ttCallback = new AjxCallback(this,
			function(callback) {
				appCtxt.getToolTipMgr().getToolTip(ZmToolTipMgr.PERSON, ttParams, callback);
			});
		return {callback:ttCallback};
	} else {
		return ZmMailListView.prototype._getToolTip.apply(this, arguments);
	}
};

/**
 * @param conv		[ZmConv]		conv that owns the messages we will display
 * @param msg		[ZmMailMsg]*	msg that is the anchor for paging in more msgs
 * 
 * @private
 */
ZmConvListView.prototype._expand =
function(conv, msg) {
	var item = msg || conv;
	var isConv = (item.type == ZmItem.CONV);
	var rowIds = this._msgRowIdList[item.id];
	var lastRow;
	if (rowIds && rowIds.length && this._rowsArePresent(item)) {
		this._showMsgs(rowIds, true);
		lastRow = document.getElementById(rowIds[rowIds.length - 1]);
	} else {
		this._msgRowIdList[item.id] = [];
		var msgList = conv.msgs;
		if (!msgList) { return; }
		if (isConv) {
			// should be here only when the conv is first expanded
			msgList.addChangeListener(this._listChangeListener);
		}

		var ascending = (appCtxt.get(ZmSetting.CONVERSATION_ORDER) == ZmSearch.DATE_ASC);
		var index = this._getRowIndex(item);	// row after which to add rows
		if (ascending && msg) {
			index--;	// for ascending, we want to expand upward (add above expandable msg row)
		}
		var offset = this._msgOffset[item.id] || 0;
		var a = conv.getMsgList(offset, ascending);
		for (var i = 0; i < a.length; i++) {
			var msg = a[i];
			var div = this._createItemHtml(msg);
			this._addRow(div, index + i + 1);
			rowIds = this._msgRowIdList[item.id];
			if (rowIds) {
				rowIds.push(div.id);
			}
			if (i == a.length - 1) {
				lastRow = div;
			}
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
	if (lastRow) {
		this._scrollList(lastRow);
	}
	var convHeight = rowIds.length * Dwt.getSize(lastRow).y;
	if (convHeight > Dwt.getSize(lastRow.parentNode).y) {
		this._scrollList(this._getElFromItem(item));
	}
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
	}

	if (isConv) {
		this._expanded[item.id] = false;
		this._expandedItems[cid] = [];
	}

	this._resetColWidth();
};

ZmConvListView.prototype._doCollapse =
function(item) {
	var rowIds = this._msgRowIdList[item.id];
	if (rowIds && rowIds.length) {
		this._showMsgs(rowIds, false);
	}
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
 * 
 * @private
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
	this._expanded[item.id] = false;
	if (item.type == ZmItem.CONV) {
		this._expandedItems[item.id] = [];
	}
	else {
		AjxUtil.arrayRemove(this._expandedItems[item.cid], item);
	}
	return false;
};

/**
 * Returns true if the given conv or msg should have an expansion icon. A conv is
 * expandable if it has 2 or more msgs. A msg is expandable if it's the last on a
 * page and there are more msgs.
 *
 * @param item		[ZmMailItem]	conv or msg to check
 * 
 * @private
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
			var limit = appCtxt.get(ZmSetting.CONVERSATION_PAGE_SIZE);
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

	// remove change listeners on conv msg lists
	for (var id in this._expandedItems) {
		var item = this._expandedItems[id];
		if (item && item.msgs) {
			item.msgs.removeChangeListener(this._listChangeListener);
		}
	}

	this._expanded		= {};	// current expansion state, by ID
	this._msgRowIdList	= {};	// list of row IDs for a conv ID
	this._msgOffset		= {};	// the offset for a msg ID
	this._expandedItems	= {};	// list of expanded items for a conv ID (inc conv)
};

ZmConvListView.prototype.isExpanded =
function(item) {
	return item && this._expanded[item.id];
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
function(columnItem, bSortAsc, callback) {

	// call base class to save the new sorting pref
	ZmMailListView.prototype._sortColumn.call(this, columnItem, bSortAsc);

	var query;
	var list = this.getList();
	if (list && list.size() > 1 && this._sortByString) {
		query = this._controller.getSearchString();
	}

	var queryHint = this._controller.getSearchStringHint();

	if (query || queryHint) {
		var params = {
			query:			query,
			queryHint:		queryHint,
			types:			[ZmItem.CONV],
			sortBy:			this._sortByString,
			limit:			this.getLimit(),
			callback:		callback,
			userInitiated:	this._controller._currentSearch.userInitiated,
			sessionId:		this._controller._currentSearch.sessionId
		};
		appCtxt.getSearchController().search(params);
	}
};

ZmConvListView.prototype._changeListener =
function(ev) {

	var item = this._getItemFromEvent(ev);
	if (!item || ev.handled || !this._handleEventType[item.type]) {
		if (ev && ev.event == ZmEvent.E_CREATE) {
			AjxDebug.println(AjxDebug.NOTIFY, "ZmConvListView: initial check failed");
		}
		return;
	}

	var fields = ev.getDetail("fields");
	var isConv = (item.type == ZmItem.CONV);
    var isMuted = item.isMuted ? item.isMuted() : false;
	var sortBy = this._sortByString || ZmSearch.DATE_DESC;
	var handled = false;
	
	// msg moved or deleted
	if (!isConv && (ev.event == ZmEvent.E_MOVE || ev.event == ZmEvent.E_DELETE)) {
		var items = ev.batchMode ? this._getItemsFromBatchEvent(ev) : [item];
		for (var i = 0, len = items.length; i < len; i++) {
			var item = items[i];
			var conv = appCtxt.getById(item.cid);
			handled = true;
			if (conv) {
				if (item.folderId == ZmFolder.ID_SPAM || ev.event == ZmEvent.E_DELETE) {
					// msg marked as Junk, or hard-deleted
					// TODO: handle expandable msg removal
					conv.removeMsg(item);
					this.removeItem(item, true, ev.batchMode);	// remove msg row
					var rowIds = this._msgRowIdList[conv.id];
					if (this._expanded[conv.id] && rowIds && rowIds.length <= 1) {
						this._setImage(conv, ZmItem.F_EXPAND, null);
						this._collapse(conv);
					}
					this._controller._app._checkReplenishListView = this;
					this._setNextSelection();
				} else {
					if (!(conv.hasMatchingMsg(this._controller._app.currentSearch, true))) {
						this._list.remove(conv);				// view has sublist of controller list
						this._controller._list.remove(conv);	// complete list
						ev.item = item = conv;
						isConv = true;
						handled = false;
					} else {
						// normal case: just change folder name for msg
						this._changeFolderName(item, ev.getDetail("oldFolderId"));
						if (ev.event == ZmEvent.E_MOVE && (item.folderId == ZmFolder.ID_TRASH)) {
							this._setNextSelection();
						}
					}
				}
			}
		}
	}

	// conv moved or deleted	
	if (isConv && (ev.event == ZmEvent.E_MOVE || ev.event == ZmEvent.E_DELETE)) {
		var items = ev.batchMode ? this._getItemsFromBatchEvent(ev) : [item];
		for (var i = 0, len = items.length; i < len; i++) {
			var conv = items[i];
			if (this._itemToSelect && (this._itemToSelect.cid == conv.id  //the item to select is in this conv.
										|| this._itemToSelect.id == conv.id)) { //the item to select IS this conv
				var omit = {};
				if (conv.msgs) { //for some reason, msgs might not be set for the conv.
					var a = conv.msgs.getArray();
					for (var j = 0, len1 = a.length; j < len1; j++) {
						omit[a[j].id] = true;
					}
				}
				//omit the conv too, since if we have ZmSetting.DELETE_SELECT_PREV, going up will get back to this conv, but the conv is gone
				omit[conv.id] = true;
				this._itemToSelect = this._controller._getNextItemToSelect(omit);
			}
			this._removeMsgRows(conv.id);	// conv move: remove msg rows
			this._expanded[conv.id] = false;
			this._expandedItems[conv.id] = [];
			delete this._msgRowIdList[conv.id];
		}
	}

	// if we get a new msg that's part of an expanded conv, insert it into the
	// expanded conv, and don't move that conv
	if (!isConv && (ev.event == ZmEvent.E_CREATE)) {
		AjxDebug.println(AjxDebug.NOTIFY, "ZmConvListView: handle msg create " + item.id);
		var rowIds = this._msgRowIdList[item.cid];
		var conv = appCtxt.getById(item.cid);
		if (rowIds && rowIds.length && this._rowsArePresent(conv)) {
			var div = this._createItemHtml(item);
			if (!this._expanded[item.cid]) {
				Dwt.setVisible(div, false);
			}
			var convIndex = this._getRowIndex(conv);
			var sortIndex = ev.getDetail("sortIndex");
			var msgIndex = sortIndex || 0;
			AjxDebug.println(AjxDebug.NOTIFY, "ZmConvListView: add msg row to conv " + item.id + " within " + conv.id);
			this._addRow(div, convIndex + msgIndex + 1);
			rowIds.push(div.id);
		}
		handled = ev.handled = true;
	}

	// virtual conv promoted to real conv, got new ID
	if (isConv && (ev.event == ZmEvent.E_MODIFY) && (fields && fields[ZmItem.F_ID])) {
		// a virtual conv has become real, and changed its ID
		var div = document.getElementById(this._getItemId({id:item._oldId}));
		if (div) {
			this._createItemHtml(item, {div:div});
			this.associateItemWithElement(item, div);
			DBG.println(AjxDebug.DBG1, "conv updated from ID " + item._oldId + " to ID " + item.id);
		}
		this._expanded[item.id] = this._expanded[item._oldId];
		this._expandedItems[item.id] = this._expandedItems[item._oldId];
		this._msgRowIdList[item.id] = this._msgRowIdList[item._oldId] || [];
	}

	// when adding a conv (or changing its position within the list), we need to look at its sort order
	// within the list of rows (which may include msg rows) rather than in the ZmList of convs, since
	// those two don't necessarily map to each other
	if (isConv && ((ev.event == ZmEvent.E_MODIFY) && (fields && fields[ZmItem.F_INDEX]))) {
		// INDEX change: a conv has gotten a new msg and may need to be moved within the list of convs
		// if an expanded conv gets a new msg, don't move it to top
		AjxDebug.println(AjxDebug.NOTIFY, "ZmConvListView: handle conv create " + item.id);
		var sortIndex = this._getSortIndex(item, sortBy);
		var curIndex = this.getItemIndex(item, true);

		if ((sortIndex != null) && (curIndex != null) && (sortIndex != curIndex) &&	!this._expanded[item.id]) {
            AjxDebug.println(AjxDebug.NOTIFY, "ZmConvListView: change position of conv " + item.id + " to " + sortIndex);
            this._removeMsgRows(item.id);
            this.removeItem(item);
            if(isMuted) {
                AjxDebug.println(AjxDebug.NOTIFY, "ZmConvListView: change position of conv " + item.id + " to " + curIndex);
                this.addItem(item, curIndex);
                this._controller._doMarkRead([item], true);
                // TODO: mark create notif handled?
            }
            else {
                this.addItem(item, sortIndex);
                // TODO: mark create notif handled?
            }
		}
	}

	// only a conv can change its fragment
	if ((ev.event == ZmEvent.E_MODIFY || ev.event == ZmEvent.E_MOVE) && (fields && fields[ZmItem.F_FRAGMENT])) {
		this._updateField(isConv ? item : appCtxt.getById(item.cid), ZmItem.F_SUBJECT);
	}

	if (ev.event == ZmEvent.E_MODIFY && (fields && (fields[ZmItem.F_PARTICIPANT] || fields[ZmItem.F_FROM] ||
													(fields[ZmItem.F_SIZE] && !this.isMultiColumn())))) {
		this._updateField(item, ZmItem.F_FROM);
	}

	// msg count in a conv changed - see if we need to add or remove an expand icon
	if (isConv && (ev.event == ZmEvent.E_MODIFY) && (fields && fields[ZmItem.F_SIZE])) {
		this._updateField(item, ZmItem.F_EXPAND);
		if (this.isMultiColumn()) {
			this._updateField(item, ZmItem.F_SIZE);
		}
	}

	if (ev.event == ZmEvent.E_MODIFY && (fields && fields[ZmItem.F_DATE])) {
		this._updateField(item, ZmItem.F_DATE);
	}

	if (!handled) {
		if (isConv) {
			ZmMailListView.prototype._changeListener.apply(this, arguments);
		} else {
			ZmMailMsgListView.prototype._changeListener.apply(this, arguments);
		}
	}
};

ZmConvListView.prototype.handleUnmuteConv =
function(items) {
    for(var i=0; i<items.length; i++) {
        var item = items[i];
        var isConv = (item.type == ZmItem.CONV);
        if (!isConv) { continue; }
        var sortBy = this._sortByString || ZmSearch.DATE_DESC;
        var sortIndex = this._getSortIndex(item, sortBy);
        var curIndex = this.getItemIndex(item, true);

        if ((sortIndex != null) && (curIndex != null) && (sortIndex != curIndex) &&	!this._expanded[item.id]) {
            AjxDebug.println(AjxDebug.NOTIFY, "ZmConvListView: change position of conv " + item.id + " to " + sortIndex);
            this._removeMsgRows(item.id);
            this.removeItem(item);
            this.addItem(item, sortIndex);
        }
    }
};

ZmConvListView.prototype._getSortIndex =
function(conv, sortBy) {

	var itemDate = parseInt(conv.date);
	var list = this.getList(true);
	var a = list && list.getArray();
	if (a && a.length) {
		for (var i = 0; i < a.length; i++) {
			var item = a[i];
			if (!item || (item && item.type == ZmItem.MSG)) { continue; }
			var date = parseInt(item.date);
			if ((sortBy == ZmSearch.DATE_DESC && (itemDate >= date)) ||
				(sortBy == ZmSearch.DATE_ASC && (itemDate <= date))) {
				return i;
			}
		}
		return i;
	}
	else {
		return null;
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
		AjxUtil.arrayRemove(this._msgRowIdList[item.cid], this._getItemId(item));
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

ZmConvListView.prototype.redoExpansion =
function() {
	var list = [];
	var offsets = {};
	for (var cid in this._expandedItems) {
		var items = this._expandedItems[cid];
		for (var i = 0; i < items.length; i++) {
			var id = items[i];
			list.push(id);
			offsets[id] = this._msgOffset[id];
		}
	}
	this._expandAll(false);
	this._resetExpansion();
	for (var i = 0; i < list.length; i++) {
		var id = list[i];
		this._expand(id, offsets[id]);
	}
};

ZmConvListView.prototype._getLastItem =
function() {
	var list = this.getList();
	var a = list && list.getArray();
	if (a && a.length > 1) {
		return a[a.length - 1];
	}
	return null;
};

ZmConvListView.prototype._getActionMenuForColHeader =
function(force) {

	var menu = ZmMailListView.prototype._getActionMenuForColHeader.apply(this, arguments);
	if (!this.isMultiColumn()) {
		var mi = this._colHeaderActionMenu.getItemById(ZmItem.F_FROM);
		if (mi) {
			mi.setVisible(false);
		}
	}
	return menu;
};

/**
 * @private
 * @param {hash}		params			hash of parameters:
 * @param {boolean}		expansion		if true, preserve expansion
 */
ZmConvListView.prototype._saveState =
function(params) {
	ZmMailListView.prototype._saveState.apply(this, arguments);
	this._state.expanded = params && params.expansion && this._expanded;
};

ZmConvListView.prototype._restoreState =
function() {

	var s = this._state;
	if (s.expanded) {
		for (var id in s.expanded) {
			if (s.expanded[id]) {
				this._expandItem(s.expanded[id]);
			}
		}
	}
	ZmMailListView.prototype._restoreState.call(this);
};
