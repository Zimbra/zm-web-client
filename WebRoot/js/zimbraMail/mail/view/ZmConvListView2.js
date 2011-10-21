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
 * @class
 * This variation of a double pane view combines a conv list view with a reading
 * pane in which a conv can be shown.
 *
 * @author Conrad Damon
 * 
 * @private
 */
ZmConvDoublePaneView2 = function(params) {

	params.className = params.className || "ZmConvDoublePaneView2";
	params.mode = ZmId.VIEW_CONVLIST2;
	ZmDoublePaneView.call(this, params);
};

ZmConvDoublePaneView2.prototype = new ZmDoublePaneView;
ZmConvDoublePaneView2.prototype.constructor = ZmConvDoublePaneView2;

ZmConvDoublePaneView2.prototype.isZmConvDoublePaneView2 = true;
ZmConvDoublePaneView2.prototype.toString = function() { return "ZmConvDoublePaneView2"; };

ZmConvDoublePaneView2.prototype._createMailListView =
function(params) {
	return new ZmConvListView2(params);
};

ZmConvDoublePaneView2.prototype._createMailItemView =
function(params) {
	params.id = ZmId.getViewId(ZmId.VIEW_CONV, null, params.view);
	return new ZmConvView2(params);
};

/**
 * This class is a ZmMailListView which displays convs.
 * 
 * @private
 */
ZmConvListView2 = function(params) {

	this.view = params.view = params.view || ZmId.VIEW_CONVLIST2;
	params.type = ZmItem.CONV;
	this._controller = params.controller;
	params.headerList = this._getHeaderList();
	ZmMailListView.call(this, params);

	// change listener needs to handle both types of events
	this._handleEventType[ZmItem.CONV] = true;
	this._handleEventType[ZmItem.MSG] = true;

	this._mode = ZmId.VIEW_CONVLIST2;
	this._hasHiddenRows = true;	// so that up and down arrow keys work
//	this._resetExpansion();
};

ZmConvListView2.prototype = new ZmMailListView;
ZmConvListView2.prototype.constructor = ZmConvListView2;

ZmConvListView2.prototype.isZmConvListView2 = true;
ZmConvListView2.prototype.toString = function() { return "ZmConvListView2"; };

// Constants

// Copy some functions from ZmMailMsgListView, for handling message rows
ZmConvListView2.prototype._changeFolderName = ZmMailMsgListView.prototype._changeFolderName;
ZmConvListView2.prototype._changeTrashStatus = ZmMailMsgListView.prototype._changeTrashStatus;

// See if we've been rigged to return a particular msg
ZmConvListView2.prototype.getSelection =
function() {
	return this._selectedMsg ? [this._selectedMsg] : ZmMailListView.prototype.getSelection.apply(this, arguments);
};

ZmConvListView2.prototype.handleKeyAction =
function(actionCode, ev) {
	
	if (this._controller._convViewHasFocus) {
		return false;
	}
	
	switch (actionCode) {
		// Enter is normally a list view widget shortcut for DBLCLICK; we need to no-op
		// it here so that it gets handled as an app shortcut (app shortcuts happen
		// after widget shortcuts).
		case DwtKeyMap.DBLCLICK:
			return false;
		
		// Magic shortcut starts by moving focus to CV2 (like right-arrow / EXPAND), selecting first unread msg
		case DwtKeyMap.SELECT_NEXT:
			var key = DwtKeyEvent.getCharCode(ev || DwtShell.keyEvent);
			if (key == 32 && (this.getSelectionCount() == 1)) {
				return this._controller.handleKeyAction(ZmKeyMap.EXPAND);
			}

		default:
			return ZmMailListView.prototype.handleKeyAction.call(this, actionCode, ev);
	}
	return true;
};

ZmConvListView2.prototype._initHeaders =
function() {
	if (!this._headerInit) {
		ZmMailListView.prototype._initHeaders.call(this);
        //bug:45171 removed sorted from converstaion for FROM field
        this._headerInit[ZmItem.F_FROM]		= {text:ZmMsg.from, width:ZmMsg.COLUMN_WIDTH_FROM_CLV, resizeable:true};
	}
};

ZmConvListView2.prototype._getHeaderList =
function() {
	var headers;
	if (this.isMultiColumn()) {
		headers = [
			ZmItem.F_SELECTION,
			ZmItem.F_FLAG,
			ZmItem.F_PRIORITY,
			ZmItem.F_TAG,
			ZmItem.F_READ,
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

ZmConvListView2.prototype._resetFromColumnLabel =
function() {
	// set from column sortability based on query string
	var headerCol = this._headerHash[ZmItem.F_FROM];
	if (headerCol) {
		headerCol._sortable = this._isOutboundFolder() ? ZmItem.F_FROM : null;
	}
	ZmMailListView.prototype._resetFromColumnLabel.apply(this, arguments);
};

//apply colors to from and subject cells via zimlet
ZmConvListView2.prototype._getStyleViaZimlet =
function(field, item) {
	if (field != "fr" && field != "su" && field != "st")
		return "";

	if (appCtxt.zimletsPresent() && this._ignoreProcessingGetMailCellStyle == undefined) {
		if (!this._zimletMgr) {
			this._zimletMgr = appCtxt.getZimletMgr();//cache zimletMgr
		}
		var style = this._zimletMgr.processARequest("getMailCellStyle", item, field);
		if (style != undefined && style != null) {
			return style;//set style
		} else if (style == null && this._zimletMgr.isLoaded()) {
			//zimlet not available or disabled, set _ignoreProcessingGetMailCellStyle to true
			//to ignore this entire section for this session
			this._ignoreProcessingGetMailCellStyle = true;
		}
	}
	return "";
};

ZmConvListView2.prototype._getCellId =
function(item, field) {
	return (field == ZmItem.F_FROM)
		? this._getFieldId(item, field)
		: ZmMailListView.prototype._getCellId.apply(this, arguments);
};

ZmConvListView2.prototype._getCellClass =
function(item, field, params) {
	return (item.type == ZmItem.CONV && field == ZmItem.F_SIZE)
		? "Count"
		: (ZmMailListView.prototype._getCellClass.apply(this, arguments));
};

ZmConvListView2.prototype._getCellContents =
function(htmlArr, idx, item, field, colIdx, params) {

	if (field == ZmItem.F_READ) {
		idx = this._getImageHtml(htmlArr, idx, item.getReadIcon(), this._getFieldId(item, field));
	}
	else if (field == ZmItem.F_SELECTION) {
		idx = ZmMailListView.prototype._getCellContents.apply(this, arguments);
	} else {
		if (field == ZmItem.F_STATUS) {
			if (item.type == ZmItem.CONV && item.numMsgs == 1 && item.isScheduled) {
				idx = this._getImageHtml(htmlArr, idx, "SendLater", this._getFieldId(item, field));
			} else {
				htmlArr[idx++] = "&nbsp;";
			}
		} else if (field == ZmItem.F_FROM) {
			htmlArr[idx++] = this._getParticipantHtml(item, this._getFieldId(item, ZmItem.F_PARTICIPANT));
		} else if (field == ZmItem.F_SUBJECT) {
			var subj = ZmMailMsg.stripSubjectPrefixes(item.subject || ZmMsg.noSubject);
			htmlArr[idx++] = AjxStringUtil.htmlEncode(subj, true);
			if (appCtxt.get(ZmSetting.SHOW_FRAGMENTS) && item.fragment) {
				htmlArr[idx++] = this._getFragmentSpan(item);
			}
		} else if (field == ZmItem.F_FOLDER) {
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
		} else if (field == ZmItem.F_SIZE) {
			if (item.size) {
				htmlArr[idx++] = "<nobr>";
				htmlArr[idx++] = AjxUtil.formatSize(item.size);
				htmlArr[idx++] = "</nobr>";
			} else if (item.numMsgs > 1) {
				htmlArr[idx++] = "(";
				htmlArr[idx++] = item.numMsgs;
				htmlArr[idx++] = ")";
			}
		} else if (field == ZmItem.F_SORTED_BY) {
			htmlArr[idx++] = this._getAbridgedContent(item, colIdx);
		} else {
			idx = ZmMailListView.prototype._getCellContents.apply(this, arguments);
		}
	}
	
	return idx;
};

ZmConvListView2.prototype._getAbridgedContent =
function(item, colIdx) {

	var htmlArr = [];
	var idx = 0;
	var width = (AjxEnv.isIE || AjxEnv.isSafari) ? 22 : 16;

	// first row
	htmlArr[idx++] = "<table cellpadding='0' style='width:100%;border-collapse:collapse;'>";
	htmlArr[idx++] = (item.isUnread && !item.isMuted()) ? "<tr class='Unread' " : "<tr ";
	htmlArr[idx++] = "id='";
	htmlArr[idx++] = DwtId.getListViewItemId(DwtId.WIDGET_ITEM_FIELD, this._view, item.id, ZmItem.F_ITEM_ROW_3PANE);
	htmlArr[idx++] = "'>";
	
	idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_READ, colIdx, width);
	idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_FROM, colIdx);
	//idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_SIZE, colIdx, ZmMsg.COLUMN_WIDTH_SIZE);
	idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_DATE, colIdx, ZmMsg.COLUMN_WIDTH_DATE, "align=right");
	
	htmlArr[idx++] = "</tr></table>";


	// second row
	htmlArr[idx++] = "<table cellpadding='0' style='width:100%;border-collapse:collapse;'><tr>";
	htmlArr[idx++] = "<td width='16'></td>";
		//htmlArr[idx++] = "<td width='" + (width + 15) + "'";
		//htmlArr[idx++] = this._getStyleViaZimlet(ZmItem.F_FROM, item);
		//htmlArr[idx++] = "></td>";

	// for multi-account, show the account icon for cross mbox search results
	if (appCtxt.multiAccounts &&
		item.type == ZmItem.CONV &&
		appCtxt.getSearchController().searchAllAccounts)
	{
		idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_ACCOUNT, colIdx, "16", "align=right");
	}
	if (item.isHighPriority || item.isLowPriority) {
		idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_PRIORITY, colIdx, "10", "align=right");
	}
	idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_SUBJECT, colIdx);
	if (item.hasAttach) {
		idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_ATTACHMENT, colIdx, width, "valign=top");
	}
	
	var tags = item.getVisibleTags();
	if (tags && tags.length) {
	idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_TAG, colIdx, width);	
	}
	if (appCtxt.get(ZmSetting.PRIORITY_INBOX_ENABLED)) {
		idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_MSG_PRIORITY, colIdx, "16", "align=right");	
	}
	if (appCtxt.get("FLAGGING_ENABLED")) {
		idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_FLAG, colIdx, width);
	}
	htmlArr[idx++] = "</tr></table>";

	return htmlArr.join("");
};

ZmConvListView2.prototype._getParticipantHtml =
function(conv, fieldId) {

	var html = [];
	var idx = 0;

	var part1 = conv.participants ? conv.participants.getArray() : null;
	var origLen = part1 ? part1.length : 0;
	// might get a weird case where there are no participants in message
	if (origLen > 0) {

		// bug 23832 - create notif for conv in sent gives us sender as participant, we want recip
		var folder = appCtxt.getById(this._folderId);
		if ((origLen == 1) && (part1[0].type == AjxEmailAddress.FROM) && folder &&
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
			html[idx++] = (part2 && part2[j]) ? part2[j].name : "";
			html[idx++] = "</span>";
		}
	} else {
		// XXX: possible import bug but we must take into account
		html[idx++] = ZmMsg.noWhere;
	}

	return html.join("");
};

ZmConvListView2.prototype._getToolTip =
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

ZmConvListView2.prototype._sortColumn =
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
			query: query,
			queryHint: queryHint,
			types: [ZmItem.CONV],
			sortBy: this._sortByString,
			limit:this.getLimit(),
			callback: callback
		};
		appCtxt.getSearchController().search(params);
	}
};

ZmConvListView2.prototype._changeListener =
function(ev) {

	var item = this._getItemFromEvent(ev);
	if (!item || ev.handled || !this._handleEventType[item.type]) {
		if (ev && ev.event == ZmEvent.E_CREATE) {
			AjxDebug.println(AjxDebug.NOTIFY, "ZmConvListView2: initial check failed");
		}
		return;
	}

	var conv = item;
	var fields = ev.getDetail("fields");
	var sortBy = this._sortByString || ZmSearch.DATE_DESC;
    var isMuted = item.isMuted ? item.isMuted() : false;
	var handled = false;
	
	// conv moved or deleted	
	if (ev.event == ZmEvent.E_MOVE || ev.event == ZmEvent.E_DELETE) {
		var items = ev.batchMode ? this._getItemsFromBatchEvent(ev) : [item];
		for (var i = 0, len = items.length; i < len; i++) {
			var conv = items[i];
			if (this._itemToSelect && (this._itemToSelect.id == conv.id)) {
				var omit = {};
				// omit the conv, since if we have ZmSetting.DELETE_SELECT_PREV, going up will get back to this conv, but the conv is gone
				omit[conv.id] = true;
				this._itemToSelect = this._controller._getNextItemToSelect(omit);
			}
		}
	}

	// virtual conv promoted to real conv, got new ID
	if ((ev.event == ZmEvent.E_MODIFY) && (fields && fields[ZmItem.F_ID])) {
		// a virtual conv has become real, and changed its ID
		var div = document.getElementById(this._getItemId({id:item._oldId}));
		if (div) {
			this._createItemHtml(item, {div:div});
			this.associateItemWithElement(item, div);
			DBG.println(AjxDebug.DBG1, "conv updated from ID " + item._oldId + " to ID " + item.id);
		}
	}

	// when adding a conv (or changing its position within the list), we need to look at its sort order
	// within the list of rows (which may include msg rows) rather than in the ZmList of convs, since
	// those two don't necessarily map to each other
	if ((ev.event == ZmEvent.E_MODIFY) && (fields && fields[ZmItem.F_INDEX]) ||
	   ((ev.event == ZmEvent.E_CREATE) && (sortBy == ZmSearch.DATE_DESC))) {

		// INDEX change: a conv has gotten a new msg and may need to be moved within the list of convs
		// if an expanded conv gets a new msg, don't move it to top
		AjxDebug.println(AjxDebug.NOTIFY, "ZmConvListView2: handle conv create " + item.id);
		var sortIndex = ev.getDetail("sortIndex");
		var curIndex = this.getItemIndex(item);
		if ((sortIndex != null) && (curIndex != null) && (sortIndex != curIndex)) {
			AjxDebug.println(AjxDebug.NOTIFY, "ZmConvListView2: change position of conv " + item.id + " to " + sortIndex);
			this.removeItem(item);
			// TODO: mark create notif handled?
            if(isMuted) {
                AjxDebug.println(AjxDebug.NOTIFY, "ZmConvListView: change position of conv " + item.id + " to " + curIndex);
                this.addItem(item, curIndex);
                this._controller._doMarkRead([item], true);
            }
            else {
                this.addItem(item, sortIndex);
            }
		}
	}

	// only a conv can change its fragment
	if ((ev.event == ZmEvent.E_MODIFY || ev.event == ZmEvent.E_MOVE) && (fields && fields[ZmItem.F_FRAGMENT])) {
		var fragmentField = this._getElement(item, ZmItem.F_FRAGMENT);
		if (fragmentField) {
			fragmentField.innerHTML = this._getFragmentHtml(conv);
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
	if ((ev.event == ZmEvent.E_MODIFY) && (fields && fields[ZmItem.F_SIZE])) {
		var countField = this._getElement(item, ZmItem.F_SIZE);
		if (countField) {
			countField.innerHTML = item.numMsgs > 1 ? ["(", item.numMsgs, ")"].join("") : "";
		}
	}

	if (ev.event == ZmEvent.E_MODIFY && (fields && fields[ZmItem.F_DATE])) {
		var fieldId = this._getFieldId(item, ZmItem.F_DATE);
		var dateField = document.getElementById(fieldId);
		if (dateField) {
			var html = [];
			var colIdx = this._headerHash[ZmItem.F_DATE] && this._headerHash[ZmItem.F_DATE]._index;
			this._getCellContents(html, 0, item, ZmItem.F_DATE, colIdx, new Date());
			dateField.innerHTML = html.join("");
		}
	}

	if (!handled) {
		ZmMailListView.prototype._changeListener.apply(this, arguments);
	}
};

ZmConvListView2.prototype._getActionMenuForColHeader =
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

ZmConvListView2.prototype._focus =
function() {
	ZmMailListView.prototype._focus.call(this);
	if (this._controller._convViewHasFocus) {
		this.parent._itemView._blur();
	}
	this._controller._convViewHasFocus = false;
};

ZmConvListView2.prototype._blur =
function() {
	ZmMailListView.prototype._blur.call(this);
	if (this._controller._convViewHasFocus) {
		this.parent._itemView._blur();
	}
	this._controller._convViewHasFocus = false;
};


// Functions and properties that support expansion in ZmConvListView. Stub them
// out so we don't get JS errors when using CLV2.
ZmConvListView2.prototype._expanded = {};
ZmConvListView2.prototype._msgRowIdList = {};
ZmConvListView2.prototype._msgOffset = {};
ZmConvListView2.prototype._expandedItems = {};
ZmConvListView2.prototype.isExpanded = function() {	return false; };
ZmConvListView2.prototype._isExpandable = function() {	return false; };
ZmConvListView2.prototype.redoExpansion = function() {};
ZmConvListView2.prototype._isExpandable = function() {};
ZmConvListView2.prototype._expand = function() {};
ZmConvListView2.prototype._collapse = function() {};
ZmConvListView2.prototype._rowsArePresent = function() {};
ZmConvListView2.prototype._expandItem = function() {};
ZmConvListView2.prototype._expandAll = function() {};
