/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

ZmMailMsgListView = function(params) {

	this._mode = params.mode;
	this.view = params.view;
	params.type = ZmItem.MSG;
	this._controller = params.controller;
	params.headerList = this._getHeaderList();
	ZmMailListView.call(this, params);
	this.setAttribute("aria-label", ZmMsg.messageList);
};

ZmMailMsgListView.prototype = new ZmMailListView;
ZmMailMsgListView.prototype.constructor = ZmMailMsgListView;

ZmMailMsgListView.prototype.isZmMailMsgListView = true;
ZmMailMsgListView.prototype.toString = function() {	return "ZmMailMsgListView"; };

// Consts

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
	var classes = this._getClasses(ZmItem.F_STATUS, !this.isMultiColumn() ? ["ZmMsgListBottomRowIcon"]:null);
	this._setImage(msg, ZmItem.F_STATUS, msg.getStatusIcon(), classes);
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
	var classes = this._isMultiColumn ? ["DwtMsgListMultiCol"]:["ZmRowDoubleHeader"];
	if (this._mode != ZmId.VIEW_TRAD) {
		var folder = appCtxt.getById(msg.folderId);
		if (folder && folder.isInTrash()) {
			classes.push("Trash");
		}
	}
	if (msg.isUnread)	{	classes.push("Unread"); }
	if (msg.isSent)		{	classes.push("Sent"); }

	return classes.join(" ");
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
function(htmlArr, idx, msg, field, colIdx, params, classes) {
	var zimletStyle = this._getStyleViaZimlet(field, msg) || "";
	if (field == ZmItem.F_READ) {
		idx = this._getImageHtml(htmlArr, idx, msg.getReadIcon(), this._getFieldId(msg, field), classes);
	}
	else if (field == ZmItem.F_STATUS) {
		idx = this._getImageHtml(htmlArr, idx, msg.getStatusIcon(), this._getFieldId(msg, field), classes);
	} else if (field == ZmItem.F_FROM || field == ZmItem.F_PARTICIPANT) {
		htmlArr[idx++] = "<div " + AjxUtil.getClassAttr(classes) + zimletStyle + ">";
		// setup participants list for Sent/Drafts/Outbox folders
		if (this._isOutboundFolder()) {
			var addrs = msg.getAddresses(AjxEmailAddress.TO).getArray();

			if (addrs && addrs.length) {
				var fieldId = this._getFieldId(msg, ZmItem.F_FROM);
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
					htmlArr[idx++] = "<span id='";
					htmlArr[idx++] = [fieldId, parts[j].index].join(DwtId.SEP);
					htmlArr[idx++] = "'>";
					htmlArr[idx++] = AjxStringUtil.htmlEncode(parts[j].name);
					htmlArr[idx++] = "</span>";
				}
			} else {
				htmlArr[idx++] = "&nbsp;";
			}
		} else {
			var fromAddr = msg.getAddress(AjxEmailAddress.FROM);
			var fromText = fromAddr && fromAddr.getText();
			if (fromText) {
				htmlArr[idx++] = "<span id='";
				htmlArr[idx++] = this._getFieldId(msg, ZmItem.F_FROM);
				htmlArr[idx++] = "'>";
				htmlArr[idx++] = AjxStringUtil.htmlEncode(fromText);
				htmlArr[idx++] = "</span>";
			}
			else {
				htmlArr[idx++] = "<span>" + ZmMsg.unknown + "</span>";
			}
		}
		htmlArr[idx++] = "</div>";

	} else if (field == ZmItem.F_SUBJECT) {
		htmlArr[idx++] = "<div " + AjxUtil.getClassAttr(classes) +  zimletStyle + ">";
		if (this._mode == ZmId.VIEW_CONV || this._mode == ZmId.VIEW_CONVLIST) {
			// msg within a conv shows just the fragment
			//originally bug 97510 -  need a span so I can target it via CSS rule, so the margin is within the column content, and doesn't push the other columns
			htmlArr[idx++] = "<span " + (this._isMultiColumn ? "" : "class='ZmConvListFragment'") + " id='" + this._getFieldId(msg, ZmItem.F_FRAGMENT) + "'>";
			htmlArr[idx++] = AjxStringUtil.htmlEncode(msg.fragment, true);
			htmlArr[idx++] = "</span>";
		} else {
			// msg on its own (TV) shows subject and fragment
			var subj = msg.subject || ZmMsg.noSubject;
			htmlArr[idx++] = "<span class='ZmConvListSubject' id='";
			htmlArr[idx++] = this._getFieldId(msg, field);
			htmlArr[idx++] = "'>" + AjxStringUtil.htmlEncode(subj) + "</span>";
			if (appCtxt.get(ZmSetting.SHOW_FRAGMENTS) && msg.fragment) {
				htmlArr[idx++] = this._getFragmentSpan(msg);
			}
		}
		htmlArr[idx++] = "</div>";

	} else if (field == ZmItem.F_FOLDER) {
		htmlArr[idx++] = "<div " + AjxUtil.getClassAttr(classes) + " id='";
		htmlArr[idx++] = this._getFieldId(msg, field);
		htmlArr[idx++] = "'>"; // required for IE bug
		var folder = appCtxt.getById(msg.folderId);
		if (folder) {
			htmlArr[idx++] = folder.getName();
		}
		htmlArr[idx++] = "</div>";

	} else if (field == ZmItem.F_SIZE) {
		htmlArr[idx++] = "<div " + AjxUtil.getClassAttr(classes) + ">";
		htmlArr[idx++] = AjxUtil.formatSize(msg.size);
		htmlArr[idx++] = "</div>";
	} else if (field == ZmItem.F_SORTED_BY) {
		htmlArr[idx++] = this._getAbridgedContent(msg, colIdx);
	} else {
		if (this.isMultiColumn() || field !== ZmItem.F_SELECTION) {
			//do not call this for checkbox in single column layout
			idx = ZmMailListView.prototype._getCellContents.apply(this, arguments);
		}
	}
	
	return idx;
};

ZmMailMsgListView.prototype._getAbridgedContent =
function(item, colIdx) {
	var htmlArr = [];
	var idx = 0;
	var width = (AjxEnv.isIE || AjxEnv.isSafari) ? "22" : "16";

	var selectionCssClass = '';
	for (var i = 0; i < this._headerList.length; i++) {
		if (this._headerList[i]._field == ZmItem.F_SELECTION) {
			selectionCssClass = "ZmMsgListSelection";
			break;
		}
	}
	// first row
	htmlArr[idx++] = "<div class='TopRow " + selectionCssClass + "' ";
	htmlArr[idx++] = "id='";
	htmlArr[idx++] = DwtId.getListViewItemId(DwtId.WIDGET_ITEM_FIELD, this._view, item.id, ZmItem.F_ITEM_ROW_3PANE);
	htmlArr[idx++] = "'>";
	if (selectionCssClass) {
		idx = ZmMailListView.prototype._getCellContents.apply(this, [htmlArr, idx, item, ZmItem.F_SELECTION, colIdx]);
	}
	idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_READ, colIdx, width);
	idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_FROM, colIdx);
	idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_DATE, colIdx, ZmMsg.COLUMN_WIDTH_DATE, "align=right", ["ZmMsgListDate"]);
	htmlArr[idx++] = "</div>";

	// second row
	htmlArr[idx++] = "<div class='BottomRow " + selectionCssClass + "'>";
	idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_STATUS, colIdx, width,  null, ["ZmMsgListBottomRowIcon"]);
	
	// for multi-account, show the account icon for cross mbox search results
	if (appCtxt.multiAccounts && appCtxt.getSearchController().searchAllAccounts) {
		idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_ACCOUNT, colIdx, "16", "align=right");
	}
	if (item.isHighPriority || item.isLowPriority) {
		idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_PRIORITY, colIdx, "10", "align=right");
	}
	idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_SUBJECT, colIdx);
	//add the attach, flag and tags in a wrapping div
	idx = this._getListFlagsWrapper(htmlArr, idx, item);
	if (item.hasAttach) {
		idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_ATTACHMENT, colIdx, width);
	}
	var tags = item.getVisibleTags();
	if (tags && tags.length) {
		idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_TAG, colIdx, width, null, ["ZmMsgListColTag"]);
	}
	if (appCtxt.get("FLAGGING_ENABLED")) {
		idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_FLAG, colIdx, width);
	}
	htmlArr[idx++] = "</div></div>";

	return htmlArr.join("");
};

ZmMailMsgListView.prototype._getToolTip =
function(params) {

	var tooltip, field = params.field, item = params.item;
	if (!item) { return; }

	if (!this._isMultiColumn && (field == ZmItem.F_SUBJECT || field ==  ZmItem.F_FRAGMENT)) {
		var invite = (item.type == ZmItem.MSG) && item.isInvite() && item.invite;
		if (invite && (item.needsRsvp() || !invite.isEmpty())) {
			tooltip = ZmMailListView.prototype._getToolTip.apply(this, arguments);
		}
		else {
			tooltip = AjxStringUtil.htmlEncode(item.fragment || (item.hasAttach ? "" : ZmMsg.fragmentIsEmpty));
			var folderTip = null;
			var folder = appCtxt.getById(item.folderId);
			if (folder && folder.parent) {
				folderTip = AjxMessageFormat.format(ZmMsg.accountDownloadToFolder, folder.getPath());
			}
			tooltip = (tooltip && folderTip) ? [tooltip, folderTip].join("<br>") : tooltip || folderTip;
        }
	}
	else {
		tooltip = ZmMailListView.prototype._getToolTip.apply(this, arguments);
	}
	
	return tooltip;
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
				this._setImage(msg, ZmItem.F_STATUS, "MsgStatusReply", this._getClasses(ZmItem.F_STATUS));
			} else if (flag == ZmItem.FLAG_FORWARDED && on) {
				this._setImage(msg, ZmItem.F_STATUS, "MsgStatusForward", this._getClasses(ZmItem.F_STATUS));
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
	if (this._columnHasCustomQuery(columnItem)) {
		query = this._getSearchForSort(columnItem._sortable, this._controller);
	}
	else if (list && list.size() > 1 && this._sortByString) {
		query = this._controller.getSearchString();
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
			var conv = this._controller.getConv();
			if (conv) {
				var respCallback = new AjxCallback(this, this._handleResponseSortColumn, [conv, columnItem, this._controller, callback]);
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
