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

ZmMailMsgListView = function(parent, className, posStyle, mode, controller, dropTgt) {
	this._mode = mode;
	var headerList = this._getHeaderList(parent);
	ZmMailListView.call(this, parent, className, posStyle, mode, ZmItem.MSG, controller, headerList, dropTgt);
};

ZmMailMsgListView.prototype = new ZmMailListView;
ZmMailMsgListView.prototype.constructor = ZmMailMsgListView;


// Consts

ZmMailMsgListView.COL_WIDTH_FROM = 105;

// Public methods

ZmMailMsgListView.prototype.toString = 
function() {
	return "ZmMailMsgListView";
};

ZmMailMsgListView.prototype.createHeaderHtml = 
function(defaultColumnSort) {

	ZmMailListView.prototype.createHeaderHtml.call(this, defaultColumnSort);
	
	// Show "From" or "To" depending on which folder we're looking at
	if (this._mode == ZmController.TRAD_VIEW) {
		var isFolder = this._resetFromColumnLabel();

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
	}
};

ZmMailMsgListView.prototype.markUIAsRead = 
function(msg) {
	ZmMailListView.prototype.markUIAsRead.apply(this, arguments);
	this._setImage(msg, ZmItem.F_STATUS, msg.getStatusIcon());
};

// Private / protected methods

// following _createItemHtml support methods are also used for creating msg
// rows in ZmConvListView

ZmMailMsgListView.prototype._addParams =
function(msg, params) {
	// bug fix #3595 - dont hilite if search was in:<folder name>
	params.isMatched = (msg.isInHitList() && (this._mode == ZmController.CONV_VIEW) && !appCtxt.getCurrentSearch().folderId);
};

ZmMailMsgListView.prototype._getDivClass =
function(base, item, params) {
	var style;
	if (params.isDragProxy && params.isMatched) {
		var one = [base, DwtCssStyle.MATCHED, DwtCssStyle.DRAG_PROXY].join("-");
		var two = [base, DwtCssStyle.DRAG_PROXY].join("-");
		style = [one, two].join(" ");							// Row-matched-dnd Row-dnd
	} else if (params.isMatched) {
		style = [base, DwtCssStyle.MATCHED].join("-");			// Row-matched
	} else {
		style = ZmMailListView.prototype._getDivClass.apply(this, arguments);
	}

	return style;
};

ZmMailMsgListView.prototype._getRowClass =
function(msg) {
	var classes = [];
	if (this._mode == ZmController.CONV_VIEW) {
		var folder = appCtxt.getById(msg.folderId);
		if (folder && folder.isInTrash()) {
			classes.push("Trash");
		}
	}
	if (msg.isUnread)	{	classes.push("Unread"); }
	if (msg.isSent)		{	classes.push("Sent"); }

	return classes.length ? classes.join(" ") : null;
};

ZmMailMsgListView.prototype._getCellId =
function(item, field) {
	if (field == ZmItem.F_SUBJECT && (this._mode == ZmController.CONV_VIEW ||
									  this._mode == ZmController.CONVLIST_VIEW)) {
		return this._getFieldId(item, field);
	} else {
		return ZmMailListView.prototype._getCellId.apply(this, arguments);
	}
};

ZmMailMsgListView.prototype._getCellContents =
function(htmlArr, idx, msg, field, colIdx, params) {

	if (field == ZmItem.F_STATUS) {
		htmlArr[idx++] = "<center>";
		idx = this._getImageHtml(htmlArr, idx, msg.getStatusIcon(), this._getFieldId(msg, field));
		htmlArr[idx++] = "</center>";
	} else if (field == ZmItem.F_FROM || field == ZmItem.F_PARTICIPANT) {
		// setup participants list for Sent/Drafts/Outbox folders
		var folder = appCtxt.getById(msg.folderId);
		if (this._mode == ZmController.TRAD_VIEW && folder &&
			(folder.isUnder(ZmFolder.ID_SENT) ||
			 folder.isUnder(ZmFolder.ID_DRAFTS) ||
			 folder.isUnder(ZmFolder.ID_OUTBOX)))
		{
			var addrs = msg.getAddresses(AjxEmailAddress.TO).getArray();
	
			// default to FROM addresses if no TO: found
			if (!(addrs && addrs.length)) {
				addrs = msg.getAddresses(AjxEmailAddress.FROM).getArray();
			}
			
			if (addrs && addrs.length) {
				var fieldId = this._getFieldId(msg, ZmItem.F_PARTICIPANT);
				var origLen = addrs.length;
				var partsElided = false; // may need to get this from server...
				var parts = this._fitParticipants(addrs, partsElided, 145);
				for (var j = 0; j < parts.length; j++) {
					if (j == 1 && (partsElided || parts.length < origLen)) {
						htmlArr[idx++] = AjxStringUtil.ELLIPSIS;
					} else if (parts.length > 1 && j > 0) {
						htmlArr[idx++] = ", ";
					}
					htmlArr[idx++] = "<span style='white-space: nowrap' id='";
					// bug fix #3001 - always add one to index value (to take FROM: address into account)
					htmlArr[idx++] = [fieldId, parts[j].index + 1].join("_");
					htmlArr[idx++] = "'>";
					htmlArr[idx++] = parts[j].name;
					htmlArr[idx++] = "</span>";
					if (parts.length == 1 && parts.length < origLen) {
						htmlArr[idx++] = AjxStringUtil.ELLIPSIS;
					}
				}
			}
		}
		else
		{
			var fromAddr = msg.getAddress(AjxEmailAddress.FROM);
			if (fromAddr) {
				if (this._mode == ZmController.CONVLIST_VIEW) {
					htmlArr[idx++] = ZmConvListView.INDENT;
				}
				htmlArr[idx++] = "<span style='white-space:nowrap' id='";
				htmlArr[idx++] = this._getFieldId(msg, ZmItem.F_FROM);
				htmlArr[idx++] = "'>";
				var name = fromAddr.getName() || fromAddr.getDispName();
				htmlArr[idx++] = AjxStringUtil.htmlEncode(name);
				htmlArr[idx++] = "</span>";
			}
		}

	} else if (field == ZmItem.F_SUBJECT) {
		if (this._mode == ZmController.CONV_VIEW || this._mode == ZmController.CONVLIST_VIEW) {
			// msg within a conv shows just the fragment
			if (this._mode == ZmController.CONVLIST_VIEW) {
				htmlArr[idx++] = ZmConvListView.INDENT;
			}
			htmlArr[idx++] = AjxStringUtil.htmlEncode(msg.fragment, true);
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

	} else {
		idx = ZmMailListView.prototype._getCellContents.apply(this, arguments);
	}
	
	return idx;
};

// Listeners

ZmMailMsgListView.prototype._changeListener =
function(ev) {

	var msg = this._getItemFromEvent(ev);
	if (!msg || ev.handled || !this._handleEventType[msg.type]) { return; }

	// only update if we're currently visible or we're the view underneath
	if (this._mode &&
		(this._mode != appCtxt.getCurrentViewId()) &&
		(this._mode != appCtxt.getAppViewMgr().getLastViewId())) { return; }

	if ((ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.E_MOVE) && this._mode == ZmController.CONV_VIEW) {
		if (!this._controller.handleDelete()) {
			if (ev.event == ZmEvent.E_DELETE) {
				ZmMailListView.prototype._changeListener.call(this, ev);
			} else {
				// if spam, remove it from listview
				if (msg.folderId == ZmFolder.ID_SPAM) {
					this._controller._list.remove(msg, true);
					ZmMailListView.prototype._changeListener.call(this, ev);
				} else {
					this._changeTrashStatus(msg);
					this._changeFolderName(msg);
				}
			}
		}
	} else if (this._mode == ZmController.CONV_VIEW && ev.event == ZmEvent.E_CREATE) {
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

ZmMailMsgListView.prototype._changeFolderName = 
function(msg) {
	var folderCell = this._getElement(msg, ZmItem.F_FOLDER);
	if (folderCell) {
		var folder = appCtxt.getById(msg.folderId);
		if (folder) {
			folderCell.innerHTML = folder.getName();
		}
		if (msg.folderId == ZmFolder.ID_TRASH) {
			this._changeTrashStatus(msg);
		}
	}
};

ZmMailMsgListView.prototype._changeTrashStatus = 
function(msg) {
	var row = this._getElement(msg, ZmItem.F_ITEM_ROW);
	if (row) {
		if (msg.isUnread) {
			Dwt.addClass(row, "Unread");
		}

		var folder = appCtxt.getById(msg.folderId);
		if (folder && folder.isInTrash()) {
			Dwt.addClass(row, "Trash");
		} else {
			Dwt.delClass(row, "Trash");
		}

		if (msg.isSent) {
			Dwt.addClass(row, "Sent");
		}
	}
};

ZmMailMsgListView.prototype._getHeaderList =
function(parent) {

	var hList = [];

	if (appCtxt.get(ZmSetting.SHOW_SELECTION_CHECKBOX)) {
		hList.push(new DwtListHeaderItem(ZmItem.F_SELECTION, null, "TaskCheckbox", ZmListView.COL_WIDTH_ICON, null, null, null, ZmMsg.selection));
	}
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
	hList.push(new DwtListHeaderItem(ZmItem.F_FROM, ZmMsg.from, null, ZmMailMsgListView.COL_WIDTH_FROM, ZmItem.F_FROM, true));
	hList.push(new DwtListHeaderItem(ZmItem.F_ATTACHMENT, null, "Attachment", ZmListView.COL_WIDTH_ICON, null, null, null, ZmMsg.attachment));

	var isConvView = (this._mode == ZmController.CONV_VIEW);
	var sortBy = isConvView ? null : ZmItem.F_SUBJECT;
	var colName = isConvView ? ZmMsg.fragment : ZmMsg.subject;
	hList.push(new DwtListHeaderItem(ZmItem.F_SUBJECT, colName, null, null, sortBy, null, null, null, null, true));

	hList.push(new DwtListHeaderItem(ZmItem.F_FOLDER, ZmMsg.folder, null, ZmMailListView.COL_WIDTH_FOLDER, null, true));
	hList.push(new DwtListHeaderItem(ZmItem.F_SIZE, ZmMsg.size, null, ZmMailListView.COL_WIDTH_SIZE, null, true));
	hList.push(new DwtListHeaderItem(ZmItem.F_DATE, ZmMsg.received, null, ZmListView.COL_WIDTH_DATE, ZmItem.F_DATE, true));

	return hList;
};

ZmMailMsgListView.prototype._sortColumn = 
function(columnItem, bSortAsc) {

	// call base class to save new sorting pref
	ZmMailListView.prototype._sortColumn.call(this, columnItem, bSortAsc);

	if (this.getList().size() > 1 && this._sortByString) {
		var controller = AjxDispatcher.run((this._mode == ZmController.CONV_VIEW) ? "GetConvController" :
																					"GetTradController");
		var searchString = controller.getSearchString();

		if (this._mode == ZmController.CONV_VIEW) {
			var conv = controller.getConv();
			if (conv) {
				var respCallback = new AjxCallback(this, this._handleResponseSortColumn, [conv, columnItem, controller]);
				conv.load({query:searchString, sortBy:this._sortByString, getFirstMsg:controller._readingPaneOn}, respCallback);
			}
		} else {
			var params = {query:searchString, types:[ZmItem.MSG], sortBy:this._sortByString, limit:this.getLimit()};
			appCtxt.getSearchController().search(params);
		}
	}
};

ZmMailMsgListView.prototype._handleResponseSortColumn =
function(conv, columnItem, controller, result) {
	var searchResult = result.getResponse();
	var list = searchResult.getResults(ZmItem.MSG);
	controller.setList(list); // set the new list returned
	this.setOffset(0);
	this.set(conv.msgs, columnItem);
	this.setSelection(conv.getFirstHotMsg({offset:this.getOffset(), limit:this.getLimit()}));
};

ZmMailMsgListView.prototype._getDefaultSortbyForCol = 
function(colHeader) {
	// if not date field, sort asc by default
	return colHeader._sortable != ZmItem.F_DATE;
};

ZmMailMsgListView.prototype._getParentForColResize = 
function() {
	return this.parent;
};
