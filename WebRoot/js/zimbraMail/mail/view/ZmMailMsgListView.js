/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004-2011 Zimbra, Inc.
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

ZmMailMsgListView = function(params) {

	this._mode = params.mode;
	this.view = params.view;
	params.type = ZmItem.MSG;
	this._controller = params.controller;
	params.headerList = this._getHeaderList();
	ZmMailListView.call(this, params);
};

ZmMailMsgListView.prototype = new ZmMailListView;
ZmMailMsgListView.prototype.constructor = ZmMailMsgListView;

ZmMailMsgListView.prototype.isZmMailMsgListView = true;
ZmMailMsgListView.prototype.toString = function() {	return "ZmMailMsgListView"; };

// Consts

ZmMailMsgListView.INDENT		= "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

// TODO: move to CV
ZmMailMsgListView.SINGLE_COLUMN_SORT_CV = [
	{field:ZmItem.F_FROM,	msg:"from"		},
	{field:ZmItem.F_SIZE,	msg:"size"		},
	{field:ZmItem.F_DATE,	msg:"date"		}
];

// Public methods


ZmMailMsgListView.prototype.markUIAsRead = 
function(msg) {
	ZmMailListView.prototype.markUIAsRead.apply(this, arguments);
	this._setImage(msg, ZmItem.F_STATUS, msg.getStatusIcon());
};

// Private / protected methods

// following _createItemHtml support methods are also used for creating msg
// rows in ZmConvListView

// support for showing which msgs in a conv matched the search
// TODO: move to CV
ZmMailMsgListView.prototype._addParams =
function(msg, params) {
	if (this._mode == ZmId.VIEW_TRAD) {
		return ZmMailListView.prototype._addParams.apply(this, arguments);
	} else {
		var conv = appCtxt.getById(msg.cid);
		var s = this._controller._activeSearch && this._controller._activeSearch.search;
		params.isMatched = (s && s.hasContentTerm() && msg.inHitList);
	}
};

ZmMailMsgListView.prototype._getDivClass =
function(base, item, params) {
	if (params.isMatched && !params.isDragProxy) {
		return base + " " + [base, DwtCssStyle.MATCHED].join("-");			// Row Row-matched
	} else {
		return ZmMailListView.prototype._getDivClass.apply(this, arguments);
	}
};

ZmMailMsgListView.prototype._getRowClass =
function(msg) {
	var classes = [];
	if (this._mode != ZmId.VIEW_TRAD) {
		var folder = appCtxt.getById(msg.folderId);
		if (folder && folder.isInTrash()) {
			classes.push("Trash");
		}
	}
	if (msg.isUnread && !msg.isMuted())	{	classes.push("Unread"); }
	if (msg.isSent)		{	classes.push("Sent"); }

	return classes.length ? classes.join(" ") : null;
};

ZmMailMsgListView.prototype._getCellId =
function(item, field) {
	if (field == ZmItem.F_SUBJECT && (this._mode == ZmId.VIEW_CONV ||
									  this._mode == ZmId.VIEW_CONVLIST)) {
		return this._getFieldId(item, field);
	} else {
		return ZmMailListView.prototype._getCellId.apply(this, arguments);
	}
};

ZmMailMsgListView.prototype._getCellContents =
function(htmlArr, idx, msg, field, colIdx, params) {

	if (field == ZmItem.F_READ) {
		idx = this._getImageHtml(htmlArr, idx, msg.getReadIcon(), this._getFieldId(msg, field));
	}
	else if (field == ZmItem.F_STATUS) {
		idx = this._getImageHtml(htmlArr, idx, msg.getStatusIcon(), this._getFieldId(msg, field));
	} else if (field == ZmItem.F_FROM || field == ZmItem.F_PARTICIPANT) {
		// setup participants list for Sent/Drafts/Outbox folders
		if (this._isOutboundFolder()) {
			var addrs = msg.getAddresses(AjxEmailAddress.TO).getArray();

			// default to FROM addresses if no TO: found
			if (!addrs || addrs.length == 0) {
				addrs = msg.getAddresses(AjxEmailAddress.FROM).getArray();
			}

			if (addrs && addrs.length) {
				var fieldId = this._getFieldId(msg, ZmItem.F_PARTICIPANT);
				var origLen = addrs.length;
				var headerCol = this._headerHash[field];
				var partColWidth = headerCol ? headerCol._width : ZmMsg.COLUMN_WIDTH_FROM_CLV;
				var parts = this._fitParticipants(addrs, msg, partColWidth);
				for (var j = 0; j < parts.length; j++) {
					if (j == 0 && (parts.length < origLen)) {
						htmlArr[idx++] = AjxStringUtil.ELLIPSIS;
					} else if (parts.length > 1 && j > 0) {
						htmlArr[idx++] = AjxStringUtil.LIST_SEP;
					}
					htmlArr[idx++] = "<span style='white-space: nowrap' id='";
					htmlArr[idx++] = [fieldId, parts[j].index].join(DwtId.SEP);
					htmlArr[idx++] = "'>";
					htmlArr[idx++] = AjxStringUtil.htmlEncode(parts[j].name);
					htmlArr[idx++] = "</span>";
				}
			} else {
				htmlArr[idx++] = "&nbsp;"
			}
		} else {
			if ((this._mode == ZmId.VIEW_CONVLIST) && this._isMultiColumn) {
				htmlArr[idx++] = ZmMailMsgListView.INDENT;
			}
			var fromAddr = msg.getAddress(AjxEmailAddress.FROM);
			var fromText = fromAddr && (fromAddr.getName() || fromAddr.getDispName() || fromAddr.getAddress());
			if (fromText) {
				htmlArr[idx++] = "<span style='white-space:nowrap' id='";
				htmlArr[idx++] = this._getFieldId(msg, ZmItem.F_FROM);
				htmlArr[idx++] = "'>";
				htmlArr[idx++] = AjxStringUtil.htmlEncode(fromText);
				htmlArr[idx++] = "</span>";
			}
			else {
				htmlArr[idx++] = "<span style='white-space:nowrap'>" + ZmMsg.unknown + "</span>";
			}
		}

	} else if (field == ZmItem.F_SUBJECT) {
		if (this._mode == ZmId.VIEW_CONV || this._mode == ZmId.VIEW_CONVLIST) {
			// msg within a conv shows just the fragment
			if ((this._mode == ZmId.VIEW_CONVLIST) && this._isMultiColumn) {
				htmlArr[idx++] = ZmMailMsgListView.INDENT;
			}
			if (!this._isMultiColumn) {
				htmlArr[idx++] = "<span class='ZmConvListFragment'>";
			}
			htmlArr[idx++] = AjxStringUtil.htmlEncode(msg.fragment, true);
			if (!this._isMultiColumn) {
				htmlArr[idx++] = "</span>";
			}
		} else {
			// msg on its own (TV) shows subject and fragment
			var subj = msg.subject || ZmMsg.noSubject;
			htmlArr[idx++] = AjxStringUtil.htmlEncode(subj);
			if (appCtxt.get(ZmSetting.SHOW_FRAGMENTS) && msg.fragment) {
				htmlArr[idx++] = this._getFragmentSpan(msg);
			}
		}

	} else if (field == ZmItem.F_FOLDER) {
		htmlArr[idx++] = "<nobr id='";
		htmlArr[idx++] = this._getFieldId(msg, field);
		htmlArr[idx++] = "'>"; // required for IE bug
		var folder = appCtxt.getById(msg.folderId);
		if (folder) {
			htmlArr[idx++] = folder.getName();
		}
		htmlArr[idx++] = "</nobr>";

	} else if (field == ZmItem.F_SIZE) {
		htmlArr[idx++] = "<nobr>";
		htmlArr[idx++] = AjxUtil.formatSize(msg.size);
		htmlArr[idx++] = "</nobr>";
	} else if (field == ZmItem.F_SORTED_BY) {
		htmlArr[idx++] = this._getAbridgedContent(msg, colIdx);
	} else {
		idx = ZmMailListView.prototype._getCellContents.apply(this, arguments);
	}
	
	return idx;
};

ZmMailMsgListView.prototype._getAbridgedContent =
function(item, colIdx) {
	var htmlArr = [];
	var idx = 0;
	var width = (AjxEnv.isIE || AjxEnv.isSafari) ? "22" : "16";

	// first row
	htmlArr[idx++] = "<table class='TopRow' style='width:100%;border-collapse:collapse;border-spacing:0;'>";
	htmlArr[idx++] = (item.isUnread && !item.isMuted()) ? "<tr class='Unread' " : "<tr ";
	htmlArr[idx++] = "id='";
	htmlArr[idx++] = DwtId.getListViewItemId(DwtId.WIDGET_ITEM_FIELD, this._view, item.id, ZmItem.F_ITEM_ROW_3PANE);
	htmlArr[idx++] = "'>";
	
	idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_READ, colIdx, width);
	idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_FROM, colIdx);
	idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_DATE, colIdx, ZmMsg.COLUMN_WIDTH_DATE, "align=right");

	htmlArr[idx++] = "</tr></table>";


	// second row
	htmlArr[idx++] = "<table class='BottomRow' style='width:100%;border-collapse:collapse;border-spacing:0;'><tr>";
	htmlArr[idx++] = "<td width=";
	htmlArr[idx++] = width;
	htmlArr[idx++] = "></td>";
	idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_STATUS, colIdx, width);
	
	// for multi-account, show the account icon for cross mbox search results
	if (appCtxt.multiAccounts && appCtxt.getSearchController().searchAllAccounts) {
		idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_ACCOUNT, colIdx, "16", "align=right");
	}
	if (item.isHighPriority || item.isLowPriority) {
		idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_PRIORITY, colIdx, "10", "align=right");
	}
	idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_SUBJECT, colIdx);
	if (item.hasAttach) {
		idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_ATTACHMENT, colIdx, width);
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

// Listeners

ZmMailMsgListView.prototype._changeListener =
function(ev) {

	var msg = this._getItemFromEvent(ev);
	if (!msg || ev.handled || !this._handleEventType[msg.type]) { return; }

	if ((ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.E_MOVE) && this._mode == ZmId.VIEW_CONV) {
		if (!this._controller.handleDelete()) {
			if (ev.event == ZmEvent.E_DELETE) {
				ZmMailListView.prototype._changeListener.call(this, ev);
			} else {
				// if spam, remove it from listview
				if (msg.folderId == ZmFolder.ID_SPAM) {
					this._controller._list.remove(msg, true);
					ZmMailListView.prototype._changeListener.call(this, ev);
				} else {
					this._changeFolderName(msg, ev.getDetail("oldFolderId"));
					this._checkReplenishOnTimer();
				}
			}
		}
	} else if (this._mode == ZmId.VIEW_CONV && ev.event == ZmEvent.E_CREATE) {
		var conv = AjxDispatcher.run("GetConvController").getConv();
		if (conv && (msg.cid == conv.id)) {
			ZmMailListView.prototype._changeListener.call(this, ev);
		}
	} else if (ev.event == ZmEvent.E_FLAGS) { // handle "replied" and "forwarded" flags
		var flags = ev.getDetail("flags");
		for (var j = 0; j < flags.length; j++) {
			var flag = flags[j];
			var on = msg[ZmItem.FLAG_PROP[flag]];
			if (flag == ZmItem.FLAG_REPLIED && on) {
				this._setImage(msg, ZmItem.F_STATUS, "MsgStatusReply");
			} else if (flag == ZmItem.FLAG_FORWARDED && on) {
				this._setImage(msg, ZmItem.F_STATUS, "MsgStatusForward");
			}
		}
		ZmMailListView.prototype._changeListener.call(this, ev); // handle other flags
	} else {
		ZmMailListView.prototype._changeListener.call(this, ev);
		if (ev.event == ZmEvent.E_CREATE || ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.E_MOVE)	{
			this._resetColWidth();
		}
	}
};

ZmMailMsgListView.prototype._getHeaderList =
function() {

	var headers;
	if (this.isMultiColumn()) {
		headers = [];
		headers.push(ZmItem.F_SELECTION);
		if (appCtxt.get("FLAGGING_ENABLED")) {
			headers.push(ZmItem.F_FLAG);
		}
		headers.push(
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
		);
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

	return this._getHeaders(this.view, headers);
};

ZmMailMsgListView.prototype._initHeaders =
function() {

	ZmMailListView.prototype._initHeaders.apply(this, arguments);
	if (this._mode == ZmId.VIEW_CONV) {
		this._headerInit[ZmItem.F_SUBJECT] = {text:ZmMsg.message, noRemove:true, resizeable:true};
	}
};

ZmMailMsgListView.prototype._getHeaderToolTip =
function(field, itemIdx) {
	if (field == ZmItem.F_SUBJECT && this._mode == ZmId.VIEW_CONV) {
		return ZmMsg.message;
	}
	else {
		return ZmMailListView.prototype._getHeaderToolTip.apply(this, arguments);
	}
};

ZmMailMsgListView.prototype._getSingleColumnSortFields =
function() {
	return (this._mode == ZmId.VIEW_CONV) ? ZmMailMsgListView.SINGLE_COLUMN_SORT_CV : ZmMailListView.SINGLE_COLUMN_SORT;
};

ZmMailMsgListView.prototype._sortColumn = 
function(columnItem, bSortAsc, callback) {

	// call base class to save new sorting pref
	ZmMailListView.prototype._sortColumn.call(this, columnItem, bSortAsc);

	var query;
	var list = this.getList();
	var controller = AjxDispatcher.run((this._mode == ZmId.VIEW_CONV) ? "GetConvController" : "GetTradController");
	if (list && list.size() > 1 && this._sortByString) {
		query = controller.getSearchString();
	}

	var queryHint = this._controller.getSearchStringHint();

	if (query || queryHint) {
		var params = {
			query:			query,
			queryHint:		queryHint,
			sortBy:			this._sortByString,
			userInitiated:	this._controller._currentSearch.userInitiated,
			sessionId:		this._controller._currentSearch.sessionId
		}
		if (this._mode == ZmId.VIEW_CONV) {
			var conv = controller.getConv();
			if (conv) {
				var respCallback = new AjxCallback(this, this._handleResponseSortColumn, [conv, columnItem, controller, callback]);
				params.getFirstMsg = controller.isReadingPaneOn();
				conv.load(params, respCallback);
			}
		} else {
			params.types = [ZmItem.MSG];
			params.limit = this.getLimit();
			params.callback = callback;
			appCtxt.getSearchController().search(params);
		}
	}
};

ZmMailMsgListView.prototype._handleResponseSortColumn =
function(conv, columnItem, controller, callback, result) {
	var searchResult = result.getResponse();
	var list = searchResult.getResults(ZmItem.MSG);
	controller.setList(list); // set the new list returned
	controller._activeSearch = searchResult;
	this.offset = 0;
	this.set(conv.msgs, columnItem);
	this.setSelection(conv.getFirstHotMsg({offset:this.offset, limit:this.getLimit(this.offset)}));
	if (callback instanceof AjxCallback)
		callback.run();
};

ZmMailMsgListView.prototype._getParentForColResize = 
function() {
	return this.parent;
};
