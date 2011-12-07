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

ZmMailListView = function(params) {

	if (arguments.length == 0) { return; }

	params.pageless = true;
	ZmListView.call(this, params);

	this._folderId = null;
	this._selectAllEnabled = true;

	this._isMultiColumn = this.isMultiColumn();
	if (!this._isMultiColumn) {
		this._normalClass = ZmMailListView.ROW_DOUBLE_CLASS;
	}

};

ZmMailListView.prototype = new ZmListView;
ZmMailListView.prototype.constructor = ZmMailListView;

ZmMailListView.prototype.isZmMailListView = true;
ZmMailListView.prototype.toString = function() { return "ZmMailListView"; };

// Consts
ZmMailListView.ROW_DOUBLE_CLASS	= "RowDouble";

ZmMailListView.FIRST_ITEM	= -1;
ZmMailListView.LAST_ITEM	= -2;

ZmMailListView.SINGLE_COLUMN_SORT = [
	{field:ZmItem.F_FROM,	msg:"from"		},
	{field:ZmItem.F_SUBJECT,msg:"subject"	},
	{field:ZmItem.F_SIZE,	msg:"size"		},
	{field:ZmItem.F_DATE,	msg:"date"		},
    {field:ZmItem.F_ATTACHMENT, msg:"attachment" },
    {field:ZmItem.F_FLAG, msg:"flag" },
    {field:ZmItem.F_PRIORITY, msg:"priority" }
];

ZmMailListView.SORTBY_HASH = [];
ZmMailListView.SORTBY_HASH[ZmSearch.NAME_ASC] = {field:ZmItem.F_FROM, msg:"from"};
ZmMailListView.SORTBY_HASH[ZmSearch.NAME_DESC] = {field:ZmItem.F_FROM, msg:"from"};
ZmMailListView.SORTBY_HASH[ZmSearch.SUBJ_ASC] = {field:ZmItem.F_SUBJECT, msg:"subject"};
ZmMailListView.SORTBY_HASH[ZmSearch.SUBJ_DESC] = {field:ZmItem.F_SUBJECT, msg:"subject"};
ZmMailListView.SORTBY_HASH[ZmSearch.SIZE_ASC] = {field:ZmItem.F_SIZE, msg:"size"};
ZmMailListView.SORTBY_HASH[ZmSearch.SIZE_DESC] = {field:ZmItem.F_SIZE, msg:"size"};
ZmMailListView.SORTBY_HASH[ZmSearch.DATE_ASC] = {field:ZmItem.F_DATE, msg:"date"};
ZmMailListView.SORTBY_HASH[ZmSearch.DATE_DESC] = {field:ZmItem.F_DATE, msg:"date"};
ZmMailListView.SORTBY_HASH[ZmSearch.ATTACH_ASC] = {field:ZmItem.F_ATTACHMENT, msg:"attachment"};
ZmMailListView.SORTBY_HASH[ZmSearch.ATTACH_DESC] = {field:ZmItem.F_ATTACHMENT, msg:"attachment"};
ZmMailListView.SORTBY_HASH[ZmSearch.FLAG_ASC] = {field:ZmItem.F_FLAG, msg:"flag"};
ZmMailListView.SORTBY_HASH[ZmSearch.FLAG_DESC] = {field:ZmItem.F_FLAG, msg:"flag"};
ZmMailListView.SORTBY_HASH[ZmSearch.READ_ASC] = {field:ZmItem.F_READ, msg:"read"};
ZmMailListView.SORTBY_HASH[ZmSearch.READ_DESC] = {field:ZmItem.F_READ, msg:"read"};
ZmMailListView.SORTBY_HASH[ZmSearch.PRIORITY_ASC] = {field:ZmItem.F_PRIORITY, msg:"priority"};
ZmMailListView.SORTBY_HASH[ZmSearch.PRIORITY_DESC] = {field:ZmItem.F_PRIORITY, msg:"priority"};


// Public methods


// Reset row style
ZmMailListView.prototype.markUIAsRead = 
function(item) {
	this._setImage(item, ZmItem.F_READ, item.getReadIcon());

	var rowClass = this._getRowClass(item);
	if (this._isMultiColumn) {
		var row = this._getElement(item, ZmItem.F_ITEM_ROW);
		if (row) { row.className = rowClass; }
	} else {
		var row = this._getElement(item, ZmItem.F_ITEM_ROW);
		if (row) { row.className = rowClass; }

		var row2 = this._getElement(item, ZmItem.F_ITEM_ROW_3PANE);
		if (row2) { row2.className = rowClass; }
	}
};

ZmMailListView.prototype.set =
function(list, sortField) {

	var s = this._controller._activeSearch && this._controller._activeSearch.search;
	this._folderId = s && s.folderId;
    if (this._folderId) {
        this._group = this.getGroup(this._folderId);
    }

	var sortBy = s && s.sortBy;
	if (sortBy) {
		var column;
		if (sortBy == ZmSearch.SUBJ_DESC || sortBy == ZmSearch.SUBJ_ASC) {
			column = ZmItem.F_SUBJECT;
		} else if (sortBy == ZmSearch.DATE_DESC || sortBy == ZmSearch.DATE_ASC) {
			column = ZmItem.F_DATE;
		} else if (sortBy == ZmSearch.NAME_DESC || sortBy == ZmSearch.NAME_ASC) {
			column = ZmItem.F_FROM;
		} else if (sortBy == ZmSearch.SIZE_DESC || sortBy == ZmSearch.SIZE_ASC) {
			column = ZmItem.F_SIZE;
		}
		if (column) {
			var sortByAsc = (sortBy == ZmSearch.SUBJ_ASC || sortBy == ZmSearch.DATE_ASC || sortBy == ZmSearch.NAME_ASC || sortBy == ZmSearch.SIZE_ASC);
			this.setSortByAsc(column, sortByAsc);
		}
	}


    ZmListView.prototype.set.apply(this, arguments);

    this.markDefaultSelection(list);
};


ZmMailListView.prototype.markDefaultSelection =
function(list) {
	if(window.defaultSelection) {
		var sel = [];
		var a = list.getArray();
		for (var i in a) {
			if (window.defaultSelection[a[i].id]) {
				sel.push(a[i]);
			}
		}
		if (sel.length > 0) {
			this.setSelectedItems(sel);
		}
		window.defaultSelection = null;
	}
};

ZmMailListView.prototype.handleKeyAction =
function(actionCode, ev) {
	if (actionCode == DwtKeyMap.SELECT_NEXT || actionCode == DwtKeyMap.SELECT_PREV) {
		this._controller.lastListAction = actionCode;
	} else if (actionCode == DwtKeyMap.SELECT_ALL) {
		DwtListView.prototype.handleKeyAction.apply(this, arguments);
		var ctlr = this._controller;
		ctlr._resetOperations(ctlr.getCurrentToolbar(), this.getSelectionCount());
		return true;
	}
	return DwtListView.prototype.handleKeyAction.apply(this, arguments);
};

ZmMailListView.prototype.getTitle =
function() {
	var search = this._controller._activeSearch ? this._controller._activeSearch.search : null;
	return search ? search.getTitle() : "";
};

ZmMailListView.prototype.replenish = 
function(list) {
	DwtListView.prototype.replenish.call(this, list);
	this._resetColWidth();
};

ZmMailListView.prototype.resetSize =
function(newWidth, newHeight) {
	this.setSize(newWidth, newHeight);
	var height = (newHeight == Dwt.DEFAULT) ? newHeight : newHeight - DwtListView.HEADERITEM_HEIGHT;
	Dwt.setSize(this._parentEl, newWidth, height);
};

ZmMailListView.prototype.calculateMaxEntries =
function() {
	return (Math.floor(this._parentEl.clientHeight / (this._isMultiColumn ? 20 : 40)) + 5);
};

/**
 * Returns true if the reading pane is turned off or set to bottom. We use this
 * call to tell the UI whether to re-render the listview with multiple columns
 * or a single column (for right-pane).
 */
ZmMailListView.prototype.isMultiColumn =
function() {
	return !this._controller.isReadingPaneOnRight();
};

ZmMailListView.prototype._getAbridgedContent =
function(item, colIdx) {
	// override me
};

//apply colors to from and subject cells via zimlet
ZmMailListView.prototype._getStyleViaZimlet =
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


ZmMailListView.prototype._getAbridgedCell =
function(htmlArr, idx, item, field, colIdx, width, attr) {
	var params = {};

	htmlArr[idx++] = "<td";
	htmlArr[idx++] = this._getStyleViaZimlet(field, item);
	if (width) {
		htmlArr[idx++] = " width='";
		htmlArr[idx++] = width;
		htmlArr[idx++] = "'";
	}
	var cellId = this._getCellId(item, field, params);
	if (cellId) {
		htmlArr[idx++] = " id='";
		htmlArr[idx++] = cellId;
		htmlArr[idx++] = "'";
	}
	var className = this._getCellClass(item, field, params);
	if (className) {
		htmlArr[idx++] = " class='";
		htmlArr[idx++] = className;
		htmlArr[idx++] = "'";
	}
	if (attr) {
		htmlArr[idx++] = " ";
		htmlArr[idx++] = attr;
	}
	htmlArr[idx++] = ">";
	idx = this._getCellContents(htmlArr, idx, item, field, colIdx, params);
	htmlArr[idx++] = "</td>";

	return idx;
};

ZmMailListView.prototype._getCellContents =
function(htmlArr, idx, item, field, colIdx, params) {
	if (field == ZmItem.F_ACCOUNT) {
		idx = this._getImageHtml(htmlArr, idx, item.getAccount().getIcon(), this._getFieldId(item, field));
	} 
	else if (field == ZmItem.F_MSG_PRIORITY) {
		idx = this._getImageHtml(htmlArr, idx, this._getMsgPriorityIcon(item.isPriority), this._getFieldId(item, field));	
	}
	else {
		idx = ZmListView.prototype._getCellContents.apply(this, arguments);
	}

	return idx;
};

/**
 * Called by the controller whenever the reading pane preference changes
 * 
 * @private
 */
ZmMailListView.prototype.reRenderListView =
function() {
	var isMultiColumn = this.isMultiColumn();
	if (isMultiColumn != this._isMultiColumn) {
		this._saveState({selection:true, focus:true, scroll:true, expansion:true});
		this._isMultiColumn = isMultiColumn;
		this.headerColCreated = false;
		this._headerList = this._getHeaderList();
		this._rowHeight = null;
		this._normalClass = isMultiColumn ? DwtListView.ROW_CLASS : ZmMailListView.ROW_DOUBLE_CLASS;
		var list = this.getList() || (new AjxVector());
        this.clearGroupSections(this._folderId);
		this.set(list.clone());
		this._restoreState();
		this._resetFromColumnLabel();
	}
};

// Private / protected methods

ZmMailListView.prototype._initHeaders =
function() {
	if (!this._headerInit) {
		this._headerInit = {};
		this._headerInit[ZmItem.F_SELECTION]	= {icon:"CheckboxUnchecked", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.selection, precondition:ZmSetting.SHOW_SELECTION_CHECKBOX};
		this._headerInit[ZmItem.F_FLAG]			= {icon:"FlagRed", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.flag, sortable:ZmItem.F_FLAG, noSortArrow:true, precondition:ZmSetting.FLAGGING_ENABLED};
		this._headerInit[ZmItem.F_PRIORITY]		= {icon:"PriorityHigh_list", width:ZmListView.COL_WIDTH_NARROW_ICON, name:ZmMsg.priority, sortable:ZmItem.F_PRIORITY, noSortArrow:true, precondition:ZmSetting.MAIL_PRIORITY_ENABLED};
		this._headerInit[ZmItem.F_TAG]			= {icon:"Tag", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.tag, precondition:ZmSetting.TAGGING_ENABLED};
		this._headerInit[ZmItem.F_ACCOUNT]		= {icon:"AccountAll", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.account, noRemove:true, resizeable:true};
		this._headerInit[ZmItem.F_STATUS]		= {icon:"MsgStatus", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.status};
		this._headerInit[ZmItem.F_READ]			= {icon:"MsgUnread", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.readUnread, sortable: false /*ZmItem.F_READ*/, noSortArrow:true}; //todo - once server supports readAsc/readDesc sort orders, uncomment the sortable
		this._headerInit[ZmItem.F_FROM]			= {text:ZmMsg.from, width:ZmMsg.COLUMN_WIDTH_FROM_MLV, resizeable:true, sortable:ZmItem.F_FROM};
		this._headerInit[ZmItem.F_ATTACHMENT]	= {icon:"Attachment", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.attachment, sortable:ZmItem.F_ATTACHMENT, noSortArrow:true};
		this._headerInit[ZmItem.F_SUBJECT]		= {text:ZmMsg.subject, sortable:ZmItem.F_SUBJECT, noRemove:true, resizeable:true};
		this._headerInit[ZmItem.F_FOLDER]		= {text:ZmMsg.folder, width:ZmMsg.COLUMN_WIDTH_FOLDER, resizeable:true};
		this._headerInit[ZmItem.F_SIZE]			= {text:ZmMsg.size, width:ZmMsg.COLUMN_WIDTH_SIZE, sortable:ZmItem.F_SIZE, resizeable:true};
		this._headerInit[ZmItem.F_DATE]			= {text:ZmMsg.received, width:ZmMsg.COLUMN_WIDTH_DATE, sortable:ZmItem.F_DATE, resizeable:true};
		this._headerInit[ZmItem.F_SORTED_BY]	= {text:AjxMessageFormat.format(ZmMsg.arrangedBy, ZmMsg.date), sortable:ZmItem.F_SORTED_BY, resizeable:false};
		this._headerInit[ZmItem.F_MSG_PRIORITY] = {icon:"Priority", width:ZmListView.COL_WIDTH_ICON, resizable:false, name:ZmMsg.messagePriority, precondition: ZmSetting.PRIORITY_INBOX_ENABLED};
	}
};

ZmMailListView.prototype._getHeaders =
function(viewId, headerList) {

	this._initHeaders();
	var hList = [];

	this._defaultCols = headerList.join(ZmListView.COL_JOIN);
	var isMultiColumn = !this._controller.isReadingPaneOnRight();
	var userHeaders = isMultiColumn && appCtxt.get(ZmSetting.LIST_VIEW_COLUMNS, viewId);
	var headers = headerList;
	if (userHeaders && isMultiColumn) {
		headers = userHeaders.split(ZmListView.COL_JOIN);
		if (headers.length != headerList.length) {
			// this means a new column was added the user does not know about yet
			headers = this._normalizeHeaders(headers, headerList);
		}
	}
    // adding account header in _normalizeHeader method
    // sometimes doesn't work since we check for array length which is bad.

    // in ZD in case of All-Mailbox search always make sure account header is added to header array
    if(appCtxt.isOffline && appCtxt.getSearchController().searchAllAccounts && isMultiColumn) {
        var isAccHdrEnabled = false;
        for (var k=0; k< headers.length; k++) {
            if(headers[k] == ZmItem.F_ACCOUNT) {
                isAccHdrEnabled = true;
            }
        }
        if(!isAccHdrEnabled) {
            headers.splice(headers.length - 1, 0, ZmId.FLD_ACCOUNT);
        }

    }

	for (var i = 0, len = headers.length; i < len; i++) {
		var header = headers[i];
		var field = header.substr(0, 2);
		var hdrParams = this._headerInit[field];
		if (!hdrParams) { continue; }
		var pre = hdrParams.precondition;
		if (!pre || appCtxt.get(pre)) {
			hdrParams.field = field;
			// multi-account, account header is always initially invisible
			// unless user is showing global inbox. Ugh.
			if (appCtxt.multiAccounts &&
				appCtxt.accountList.size() > 2 &&
				appCtxt.get(ZmSetting.OFFLINE_SHOW_ALL_MAILBOXES) &&
				header.indexOf(ZmItem.F_ACCOUNT) != -1)
			{
				hdrParams.visible = true;
				this._showingAccountColumn = true;
			} else {
				hdrParams.visible = (appCtxt.multiAccounts && header == ZmItem.F_ACCOUNT && !userHeaders)
					? false : (header.indexOf("*") == -1);
			}
			hList.push(new DwtListHeaderItem(hdrParams));
		}
	}

	return hList;
};

/**
 * Cleans up the list of columns in various ways:
 * 		- Add new fields in penultimate position
 * 		- Remove duplicate fields
 * 		- Remove fields that aren't valid for the view
 *
 * @param userHeaders	[Array]		user-defined set of column headers
 * @param headerList	[Array]		default set of column headers
 */
ZmMailListView.prototype._normalizeHeaders =
function(userHeaders, headerList) {

	// strip duplicates and invalid headers
	var allHeaders = AjxUtil.arrayAsHash(headerList);
	var headers = [], used = {}, starred = {};
	for (var i = 0; i < userHeaders.length; i++) {
		var hdr = userHeaders[i];
		var idx = hdr.indexOf("*");
		if (idx != -1) {
			hdr = hdr.substr(0, idx);
			starred[hdr] = true;
		}
		if (allHeaders[hdr] && !used[hdr]) {
			headers.push(hdr);
			used[hdr] = true;
		}
	}

	// add columns this account doesn't know about
	for (var j = 0; j < headerList.length; j++) {
		var hdr = headerList[j];
		if (!used[hdr]) {
			// if account field, add it but initially invisible
			if (hdr == ZmId.FLD_ACCOUNT) {
				starred[ZmItem.F_ACCOUNT] = true;
			}
			headers.splice(headers.length - 1, 0, hdr);
		}
	}

	// rebuild the list, preserve invisibility
	var list = AjxUtil.map(headers, function(hdr) {
		return starred[hdr] ? hdr + "*" : hdr; });

	// save implicit pref with newly added column
	appCtxt.set(ZmSetting.LIST_VIEW_COLUMNS, list.join(ZmListView.COL_JOIN), this.view);
	return list;
};

ZmMailListView.prototype.createHeaderHtml =
function(defaultColumnSort) {

	var activeSortBy = this.getActiveSearchSortBy();
	// for multi-account, hide/show Account column header depending on whether
	// user is search across all accounts or not.
	if (appCtxt.multiAccounts) {
		var searchAllAccounts = appCtxt.getSearchController().searchAllAccounts;
		if (this._headerHash &&
			((this._showingAccountColumn && !searchAllAccounts) ||
			(!this._showingAccountColumn && searchAllAccounts)))
		{
			var accountHeader = this._headerHash[ZmItem.F_ACCOUNT];
			if (accountHeader) {
				accountHeader._visible = this._showingAccountColumn = searchAllAccounts;
				this.headerColCreated = false;
			}
		}
	}

	if (this._headerList && !this.headerColCreated) {
		var rpLoc = this._controller._getReadingPanePref();
		if (rpLoc == ZmSetting.RP_RIGHT && this._controller._itemCountText[rpLoc]) {
			this._controller._itemCountText[rpLoc].dispose();
		}

		if (activeSortBy && ZmMailListView.SORTBY_HASH[activeSortBy]) {
			defaultColumnSort = ZmMailListView.SORTBY_HASH[activeSortBy].field;
		}
		DwtListView.prototype.createHeaderHtml.call(this, defaultColumnSort);

		if (rpLoc == ZmSetting.RP_RIGHT) {
			var td = document.getElementById(this._itemCountTextTdId);
			if (td) {
				var textId = DwtId.makeId(this.view, rpLoc, "text");
				var textDiv = document.getElementById(textId);
				if (!textDiv) {
					var text = this._controller._itemCountText[rpLoc] =
							   new DwtText({parent:this, className:"itemCountText", id:textId});
					td.appendChild(text.getHtmlElement());
				}
			}
		}
	}

	// Setting label on date column
	this._resetFromColumnLabel();
	var col = Dwt.byId(this._currentColId);
    var headerCol = this._isMultiColumn ? this._headerHash[ZmItem.F_DATE] :
		            (col && this.getItemFromElement(col)) || (this._headerHash && this._headerHash[ZmItem.F_SORTED_BY]) || null;
	if (headerCol) {
		var colLabel = "";
		var column;
		if (this._isMultiColumn) {
			// set the received column name based on search folder
			colLabel = ZmMsg.received;
			if (this._isOutboundFolder()) {
				colLabel = "&nbsp;" + (this._folderId == ZmFolder.ID_DRAFTS) ? ZmMsg.lastSaved : ZmMsg.sentAt;
			}
		}
		else if (activeSortBy && ZmMailListView.SORTBY_HASH[activeSortBy]){
			var msg = ZmMailListView.SORTBY_HASH[activeSortBy].msg;
			var field = ZmMailListView.SORTBY_HASH[activeSortBy].field;
			if (msg) {
				colLabel = AjxMessageFormat.format(ZmMsg.arrangedBy, ZmMsg[msg]);
			}
			if (field) {
				headerCol._sortable = field;
			}
		}

		//Set colulmn label; for multi-column this changes the received text. For single column this sets to the sort by text
		var colSpan = document.getElementById(DwtId.getListViewHdrId(DwtId.WIDGET_HDR_LABEL, this._view, headerCol._field));
		if (colSpan) {
			colSpan.innerHTML = colLabel;
		}
		if (this._colHeaderActionMenu) {
			if (this._isMultiColumn) {
				var item = this._colHeaderActionMenu.getItem(headerCol._index);
				if (item) {
					item.setText(colLabel);
				}
			}
			else {
				var mi = this._colHeaderActionMenu.getMenuItem(field);
				if (mi) {
					mi.setChecked(true, true);
				}
			}
		}
	}
};

ZmMailListView.prototype._createHeader =
function(htmlArr, idx, headerCol, i, numCols, id, defaultColumnSort) {

	if (headerCol._field == ZmItem.F_SORTED_BY) {
		var field = headerCol._field;
		var textTdId = this._itemCountTextTdId = DwtId.makeId(this.view, ZmSetting.RP_RIGHT, "td");
		htmlArr[idx++] = "<td id='";
		htmlArr[idx++] = id;
		htmlArr[idx++] = "' class='";
		htmlArr[idx++] = (id == this._currentColId)	? "DwtListView-Column DwtListView-ColumnActive'" :
													  "DwtListView-Column'";
		htmlArr[idx++] = " width='auto'><table border=0 cellpadding=0 cellspacing=0 width='100%'><tr><td id='";
		htmlArr[idx++] = DwtId.getListViewHdrId(DwtId.WIDGET_HDR_LABEL, this._view, field);
		htmlArr[idx++] = "' class='DwtListHeaderItem-label'>";
		htmlArr[idx++] = headerCol._label;
		htmlArr[idx++] = "</td>";

		// sort icon
		htmlArr[idx++] = "<td class='itemSortIcon' id='";
		htmlArr[idx++] = DwtId.getListViewHdrId(DwtId.WIDGET_HDR_ARROW, this._view, field);
		htmlArr[idx++] = "'>";
		htmlArr[idx++] = AjxImg.getImageHtml(this._bSortAsc ? "ColumnUpArrow" : "ColumnDownArrow");
		htmlArr[idx++] = "</td>";

		// item count text
		htmlArr[idx++] = "<td align=right class='itemCountText' id='";
		htmlArr[idx++] = textTdId;
		htmlArr[idx++] = "'></td></tr></table></div></td>";
	} else {
		return DwtListView.prototype._createHeader.apply(this, arguments);
	}
};

ZmMailListView.prototype._resetColWidth =
function() {

	if (!this.headerColCreated) { return; }

	var lastColIdx = this._getLastColumnIndex();
    if (lastColIdx) {
        var lastCol = this._headerList[lastColIdx];
		if (lastCol._field != ZmItem.F_SORTED_BY) {
			DwtListView.prototype._resetColWidth.apply(this, arguments);
		}
	}
};

ZmMailListView.prototype._mouseOverAction =
function(mouseEv, div) {

	var type = this._getItemData(div, "type");
	if (type == DwtListView.TYPE_HEADER_ITEM){
		var hdr = this.getItemFromElement(div);
		if (hdr && this.sortingEnabled && hdr._sortable && hdr._sortable == ZmItem.F_FROM) {
			if (this._isOutboundFolder()) {
				div.className = "DwtListView-Column DwtListView-ColumnHover";
				return true;
			}
		}
	}

	return ZmListView.prototype._mouseOverAction.apply(this, arguments);
};

ZmMailListView.prototype._columnClicked =
function(clickedCol, ev) {

	var hdr = this.getItemFromElement(clickedCol);
	var group = this.getGroup(this._folderId);
	if (group && hdr && hdr._sortable) {
        var groupId = ZmMailListGroup.getGroupIdFromSortField(hdr._sortable);
		if (groupId != group.id) {
            this.setGroup(groupId);
		}
    }

	ZmListView.prototype._columnClicked.call(this, clickedCol, ev);
};

ZmMailListView.prototype._resetFromColumnLabel =
function() {

	// set the from column name based on query string
	var headerCol = this._headerHash[ZmItem.F_FROM];
	if (headerCol) {
		var colLabel = this._isOutboundFolder() ? ZmMsg.to : ZmMsg.from;
        //bug:1108 & 43789#c19 since sort-by-rcpt affects server performance avoid using in convList instead used in outbound folder
        headerCol._sortable = this._isOutboundFolder() ? ZmItem.F_TO :
				((this._mode == ZmId.VIEW_CONVLIST) ? null : ZmItem.F_FROM);

        var fromColSpan = document.getElementById(DwtId.getListViewHdrId(DwtId.WIDGET_HDR_LABEL, this._view, headerCol._field));
		if (fromColSpan) {
			fromColSpan.innerHTML = "&nbsp;" + colLabel;
		}
		var item = (this._colHeaderActionMenu) ? this._colHeaderActionMenu.getItem(headerCol._index) : null;
		if (item) {
			item.setText(colLabel);
		}
	}
};

/**
 * Returns true if the given folder is for outbound mail.
 *
 * @param folder
 *
 * @private
 */
ZmMailListView.prototype._isOutboundFolder =
function(folder) {
	folder = folder || (this._folderId && appCtxt.getById(this._folderId));
	return (folder && folder.isOutbound());
};

/**
 * Returns the current folder
 *
 */
ZmMailListView.prototype.getFolder =
function() {
	return this._folderId && appCtxt.getById(this._folderId);
};


ZmMailListView.prototype._getRowClass =
function(item) {
	return item.isUnread && !item.isMuted() ? "Unread" : null;
};

ZmMailListView.prototype._getCellId =
function(item, field) {
	return (field == ZmItem.F_SIZE || field == ZmItem.F_SUBJECT || field == ZmItem.F_SORTED_BY)
		? this._getFieldId(item, field)
		: ZmListView.prototype._getCellId.apply(this, arguments);
};

ZmMailListView.prototype._getHeaderToolTip =
function(field, itemIdx) {

	var isOutboundFolder = this._isOutboundFolder();
	if (field == ZmItem.F_FROM && isOutboundFolder) {
	   return this._headerList[itemIdx]._sortable ? ZmMsg.to : ZmMsg.to;
	}
	if (field == ZmItem.F_STATUS) {
		return ZmMsg.messageStatus;
	}
	if (field == ZmItem.F_READ) {
		return ZmMsg.readUnread;
	}

	return ZmListView.prototype._getHeaderToolTip.call(this, field, itemIdx, isOutboundFolder);
};

ZmMailListView.prototype._getToolTip =
function(params) {
	var tooltip, field = params.field, item = params.item, matchIndex = params.match.participant;
	if (!item) { return; }
	var folder = appCtxt.getById(item.folderId);

	if (field == ZmItem.F_STATUS) {
		tooltip = item.getStatusTooltip();
	}
	else if (field == ZmItem.F_READ) {
		tooltip = item.isUnread ? ZmMsg.unread : ZmMsg.read;
	}
	else if (appCtxt.get(ZmSetting.CONTACTS_ENABLED) &&
			(field == ZmItem.F_FROM || field == ZmItem.F_PARTICIPANT))
	{
		var addr;
		if (field == ZmItem.F_FROM) { 
			addr = item.getAddress(AjxEmailAddress.FROM);
		} else if (field == ZmItem.F_PARTICIPANT) {
			var matchIndex = (matchIndex != null) ? parseInt(matchIndex) : 0;
			addr = item.participants && item.participants.get(matchIndex);
		}
		if (!addr) {
			return;
		}
		
		var ttParams = {
			address:	item.getAddress(AjxEmailAddress.FROM),
			ev:			params.ev
		}
		var ttCallback = new AjxCallback(this,
			function(callback) {
				appCtxt.getToolTipMgr().getToolTip(ZmToolTipMgr.PERSON, ttParams, callback);
			});
		tooltip = {callback:ttCallback};
	}
	else if (field == ZmItem.F_SUBJECT || field ==  ZmItem.F_FRAGMENT) {
		if ((item.type == ZmItem.MSG) && item.isInvite() && item.needsRsvp()) {
			tooltip = item.invite.getToolTip();
		} else if (appCtxt.get(ZmSetting.SHOW_FRAGMENTS)) {
		    tooltip = AjxStringUtil.htmlEncode(item.fragment || ZmMsg.fragmentIsEmpty);
			var folderTip = null;
			if (folder && folder.parent) {
				folderTip = AjxMessageFormat.format(ZmMsg.accountDownloadToFolder, folder.getPath());
			}
			tooltip = folderTip ? [tooltip, folderTip].join("<br>") : tooltip;
        }
	}
	else if (field == ZmItem.F_FOLDER) {
		if (folder && folder.parent) {
			var name = folder.getName();
			var path = folder.getPath();
			if (path != name) {
				tooltip = path;
			}
		}
	}
	else if (field == ZmItem.F_ACCOUNT) {
		tooltip = item.getAccount().getDisplayName();
	}
	else {
		tooltip = ZmListView.prototype._getToolTip.apply(this, arguments);
	}
	
	return tooltip;
};

/**
 * (override of ZmListView to add hooks to zimletMgr)
 * Creates a TD and its content for a single field of the given item. Subclasses
 * may override several dependent functions to customize the TD and its content.
 *
 * @param htmlArr	[array]		array that holds lines of HTML
 * @param idx		[int]		current line of array
 * @param item		[object]	item to render
 * @param field		[constant]	column identifier
 * @param colIdx	[int]		index of column (starts at 0)
 * @param params	[hash]*		hash of optional params
 * 
 * @private
 */
ZmMailListView.prototype._getCell =
function(htmlArr, idx, item, field, colIdx, params) {
	var cellId = this._getCellId(item, field, params);
	var idText = cellId ? [" id=", "'", cellId, "'"].join("") : "";
	var width = this._getCellWidth(colIdx, params);
	var widthText = width ? ([" width=", width].join("")) : (" width='100%'");
	var className = this._getCellClass(item, field, params);
	var classText = className ? [" class=", className].join("") : "";
	var alignValue = this._getCellAlign(colIdx, params);
	var alignText = alignValue ? [" align=", alignValue].join("") : "";
	var otherText = (this._getCellAttrText(item, field, params)) || "";
	var attrText = [idText, widthText, classText, alignText, otherText].join(" ");

	htmlArr[idx++] = "<td";
	htmlArr[idx++] = this._getStyleViaZimlet(field, item);
	htmlArr[idx++] = attrText ? (" " + attrText) : "";
	htmlArr[idx++] = ">";
	
	idx = this._getCellContents(htmlArr, idx, item, field, colIdx, params);
	htmlArr[idx++] = "</td>";

	return idx;
};

ZmMailListView.prototype._getCellClass =
function(item, field, params) {
	return (!this._isMultiColumn && field == ZmItem.F_SUBJECT)
		? "SubjectDoubleRow" : null;
};

ZmMailListView.prototype._getFlagIcon =
function(isFlagged, isMouseover) {
	return (isFlagged || isMouseover)
		? "FlagRed"
		: (this._isMultiColumn ? "Blank_16" : "FlagDis");
};

ZmMailListView.prototype._getMsgPriorityIcon = 
function(isFlagged, isMouseover) {
	return (isFlagged || isMouseover) 
		? "Priority"
		: (this._isMultiColumn ? "Blank_16" : "PriorityDis");
};

/**
 * Returns a list of the largest subset of the given participants that will fit within the
 * given width. The participants are assumed to be ordered oldest to most recent. We return
 * as many of the most recent as possible.
 *
 * @private
 * @param {array}		participants		list of AjxEmailAddress
 * @param {ZmMailItem}	item				item that contains the participants
 * @param {int}			width				available space in pixels
 * 
 * @return list of participant objects with 'name' and 'index' fields
 */
ZmMailListView.prototype._fitParticipants =
function(participants, item, availWidth) {

	availWidth -= 15;	// safety margin

	var sepWidth = AjxStringUtil.getWidth(AjxStringUtil.LIST_SEP, item.isUnread);
	var ellWidth = AjxStringUtil.getWidth(AjxStringUtil.ELLIPSIS, item.isUnread);

	// first see if we can fit everyone with their full names
	var list = [];
	var pLen = participants.length;
	var width = 0;
	for (var i = 0; i < pLen; i++) {
		var p = participants[i];
		var field = p.name || p.address || p.company || "";
		width += AjxStringUtil.getWidth(AjxStringUtil.htmlEncode(field), item.isUnread);
		list.push({name:field, index:i});
	}
	width += (pLen - 1) * sepWidth;
	if (width < availWidth) {
		return list;
	}

	// now try with display (first) names; fit as many of the most recent as we can
	list = [];
	for (var i = 0; i < pLen; i++) {
		var p = participants[i];
		var field = p.dispName || p.address || p.company || "";
		list.push({name:field, index:i});
	}
	while (list.length) {
		var width = 0;
		// total the width of the names
		for (var i = 0; i < list.length; i++) {
			width += AjxStringUtil.getWidth(AjxStringUtil.htmlEncode(list[i].name), item.isUnread);
		}
		// add the width of the separators
		width += (list.length - 1) * sepWidth;
		// add the width of the ellipsis if we've dropped anyone
		if (list.length < pLen) {
			width += ellWidth;
		}
		if (width < availWidth) {
			return list;
		} else {
			list.shift();
		}
	}

	// not enough room for even one participant, just return the last one
	var p = participants[pLen - 1];
	var field = p.dispName || p.address || p.company || "";
	return [{name:field, index:pLen - 1}];
};

ZmMailListView.prototype._getActionMenuForColHeader =
function(force) {
	var activeSortBy = this.getActiveSearchSortBy();
	if (!this.isMultiColumn()) {
		if (!this._colHeaderActionMenu || force) {
			var defaultSort = activeSortBy && ZmMailListView.SORTBY_HASH[activeSortBy] ? 
							  ZmMailListView.SORTBY_HASH[activeSortBy].field : ZmItem.F_DATE;
			this._colHeaderActionMenu = this._getSortMenu(this._getSingleColumnSortFields(), defaultSort);
            this._getGroupByActionMenu(this._colHeaderActionMenu);
		}
		var mi = this._colHeaderActionMenu.getItemById(ZmItem.F_FROM);
		if (mi) {
			mi.setVisible(!this._isOutboundFolder());
		}
        this._setGroupByCheck();
		return this._colHeaderActionMenu;
	}

	var doReset = (!this._colHeaderActionMenu || force);

	var menu = ZmListView.prototype._getActionMenuForColHeader.call(this, force);

	if (doReset) {
		this._resetFromColumnLabel();
        this._getGroupByActionMenu(menu);
	}
    else if (this._groupByActionMenu) {
        this._setGroupByCheck();
    }

	return menu;
};


ZmMailListView.prototype._getSingleColumnSortFields =
function() {
	return ZmMailListView.SINGLE_COLUMN_SORT;
};

ZmMailListView.prototype._colHeaderActionListener =
function(ev) {
	if (!this.isMultiColumn()) {
		this._sortMenuListener(ev);
	}
	else {
		ZmListView.prototype._colHeaderActionListener.apply(this, arguments);
	}
};


ZmMailListView.prototype._getNoResultsMessage =
function() {
	if (appCtxt.isOffline && !appCtxt.getSearchController().searchAllAccounts) {
		// offline folders which are "syncable" but currently not syncing should
		// display a different message
		var fid = ZmOrganizer.getSystemId(this._controller._getSearchFolderId());
		var folder = fid && appCtxt.getById(fid);
		if (folder) {
			if (folder.isOfflineSyncable && !folder.isOfflineSyncing) {
				var link = "ZmMailListView.toggleSync('" + folder.id + "', '" + this._htmlElId + "');";
				return AjxMessageFormat.format(ZmMsg.notSyncing, link);
			}
		}
	}

	return DwtListView.prototype._getNoResultsMessage.call(this);
};

ZmMailListView.toggleSync =
function(folderId, htmlElementId) {
	var folder = appCtxt.getById(folderId);
	var htmlEl = folder ? document.getElementById(htmlElementId) : null;
	var listview = htmlEl ? DwtControl.fromElement(htmlEl) : null;
	if (listview) {
		var callback = new AjxCallback(listview, listview._handleToggleSync, [folder]);
		folder.toggleSyncOffline(callback);
	}
};

ZmMailListView.prototype._handleToggleSync =
function(folder) {
	folder.getAccount().sync();
	// bug fix #27846 - just clear the list view and let instant notify populate
	this.removeAll(true);
};


// Listeners

ZmMailListView.prototype.handleUnmuteConv =
function(items) {
    //overridden in ZmConvListView
};

ZmMailListView.prototype._changeListener =
function(ev) {

	var item = this._getItemFromEvent(ev);
	if (!item || ev.handled || !this._handleEventType[item.type]) {
		if (ev && ev.event == ZmEvent.E_CREATE) {
			AjxDebug.println(AjxDebug.NOTIFY, "ZmMailListView: initial check failed");
		}
		return;
	}

	if (!this.isMultiColumn() && (ev.event == ZmEvent.E_TAGS || ev.event == ZmEvent.E_REMOVE_ALL)) {
		DBG.println(AjxDebug.DBG2, "ZmMailListView: TAG");
		this.redrawItem(item);
		ev.handled = true;
	}

	if (ev.event == ZmEvent.E_FLAGS) { // handle "unread" and "isScheduled" flag
		DBG.println(AjxDebug.DBG2, "ZmMailListView: FLAGS");
		var flags = ev.getDetail("flags");
		for (var j = 0; j < flags.length; j++) {
			var flag = flags[j];
			if (flag == ZmItem.FLAG_UNREAD) {
				var on = item[ZmItem.FLAG_PROP[flag]];
				this.markUIAsRead(item, !on);
			} else if (flag == ZmItem.FLAG_ISSCHEDULED) {
				this._setImage(item, ZmItem.F_STATUS, "SendLater");
			}
		}
	}
	
	if (ev.event == ZmEvent.E_CREATE) {
		DBG.println(AjxDebug.DBG2, "ZmMailListView: CREATE");
		AjxDebug.println(AjxDebug.NOTIFY, "ZmMailListView: handle create " + item.id);

		if (this._controller.actionedMsgId) {
			var newMsg = appCtxt.getById(this._controller.actionedMsgId);
			if (newMsg) {
				this._itemToSelect = this._controller.isZmConvListController ? appCtxt.getById(newMsg.cid) : newMsg;
			}
			this._controller.actionedMsgId = null;
		}

		if (this._list && this._list.contains(item)) {
			AjxDebug.println(AjxDebug.NOTIFY, "ZmMailListView: list already has item " + item.id);
			return;
		}
		if (!this._handleEventType[item.type]) {
			AjxDebug.println(AjxDebug.NOTIFY, "ZmMailListView: list view of type " + this._mode + " does not handle " + item.type);
			return;
		}

		// Check to see if ZmMailList::notifyCreate gave us an index for the item.
		// If not, we assume that the new conv/msg is the most recent one. The only case
		// we handle is where the user is on the first page.
		//
		// TODO: handle other sort orders, arbitrary insertion points
		if ((this._isPageless || this.offset == 0) && (!this._sortByString || this._sortByString == ZmSearch.DATE_DESC)) {
			var sortIndex = ev.getDetail("sortIndex") || 0;
			AjxDebug.println(AjxDebug.NOTIFY, "ZmMailListView: adding item " + item.id + " at index " + sortIndex);
			this.addItem(item, sortIndex);

			if (appCtxt.isOffline && appCtxt.getActiveAccount().isOfflineInitialSync()) {
				this._controller._app.numEntries++;
			}
		}
		ev.handled = true;
	}

	if (!ev.handled) {
		ZmListView.prototype._changeListener.call(this, ev);
	}
};

/**
 * If we're showing content in the reading pane and there is exactly one item selected,
 * make sure the content is for that selected item. Otherwise, clear the content.
 */
ZmMailListView.prototype._itemClicked =
function(clickedEl, ev) {
	Dwt.setLoadingTime("ZmMailItem", new Date());
	ZmListView.prototype._itemClicked.apply(this, arguments);
	
	var ctlr = this._controller;
	if (ctlr.isReadingPaneOn()) {
		if (appCtxt.get(ZmSetting.SHOW_SELECTION_CHECKBOX) && ev.button == DwtMouseEvent.LEFT) {
			if (!ev.shiftKey && !ev.ctrlKey) {
				// get the field being clicked
				var id = (ev.target.id && ev.target.id.indexOf("AjxImg") == -1) ? ev.target.id : clickedEl.id;
				var m = id ? this._parseId(id) : null;
				if (m && m.field == ZmItem.F_SELECTION) {
					if (this.getSelectionCount() == 1) {
						var item = this.getSelection()[0];
						var msg = (item instanceof ZmConv) ? item.getFirstHotMsg() : item;
						if (msg && ctlr._curItem && (msg.id != ctlr._curItem.id)) {
							ctlr.reset();
						}
					}
				}
			}
		}
	}
};

ZmMailListView.prototype._setNextSelection =
function() {

	if (this._itemToSelect) {
		var item = this._getItemToSelect();
		if (item) {
			DBG.println("focus", "ZmMailListView._setNextSelection: select item with ID: " + item.id);
			this.setSelection(item, false);
			this._itemToSelect = null;
		}
	}
};

/**
 * Returns the next item to select, typically set by the controller.
 * 
 * @private
 */
ZmMailListView.prototype._getItemToSelect =
function() {
	var item = this._itemToSelect || (this._list && this._list.get(0));
	var list = this.getList(true);
	if (item == ZmMailListView.FIRST_ITEM) {
		list = list && list.getArray();
		item = list && list[0];
	} else if (item == ZmMailListView.LAST_ITEM) {
		list = list && list.getArray();
		item = list && list[list.length - 1];
	}
	return item;
};

ZmMailListView.prototype._getSearchForSort =
function(sortField, controller) {
	controller = controller || this._controller;
	var query = controller.getSearchString();
	if (!query) { return ""; }

	var str = (sortField == ZmItem.F_FLAG) ? " is:flagged" : " has:attachment";
	if (query.indexOf(str) != -1) {
		query = query.replace(str, "");
	} else {
		query = query + str;
	}
	return query;
};

ZmMailListView.prototype._getDefaultSortbyForCol =
function(colHeader) {
	// if not date field, sort asc by default
	return (colHeader._sortable != ZmItem.F_DATE);
};

//GROUP SUPPORT
ZmMailListView.prototype.reset =
function() {
	this.clearGroupSections(this.getActiveSearchFolderId());
	ZmListView.prototype.reset.call(this);
};


/**
 * Clear groups
 * @param {int} folderId folderId to get group
 */
ZmMailListView.prototype.clearGroupSections =
function(folderId) {
  if (folderId) {
      var group = this.getGroup(folderId);
      if (group) {
          group.clearSections();
      }
  }
  else if (this._group) {
      this._group.clearSections();
  }
};

/**
 * Set the group
 * @param {String} groupId
 */
ZmMailListView.prototype.setGroup =
function(groupId) {
    this._group = ZmMailListGroup.getGroup(groupId);
    if (this._folderId) {
	    appCtxt.set(ZmSetting.GROUPBY_LIST, groupId || ZmId.GROUPBY_NONE, this._folderId); //persist group Id
	    appCtxt.set(ZmSetting.GROUPBY_HASH, this._group, this._folderId); //local cache for group object
    }
};

/**
 * get the group
 * @param {int} folderId
 * @return {ZmMailListGroup} group object or null
 */
ZmMailListView.prototype.getGroup =
function(folderId) {
    if (folderId) {
	    var group = appCtxt.get(ZmSetting.GROUPBY_HASH, folderId);
	    if (!group) {
			var groupId = appCtxt.get(ZmSetting.GROUPBY_LIST, folderId);
			group = ZmMailListGroup.getGroup(groupId);
			appCtxt.set(ZmSetting.GROUPBY_HASH, group, folderId);
	    }

	    var activeSortBy = this.getActiveSearchSortBy();
	    if (activeSortBy && ZmMailListView.SORTBY_HASH[activeSortBy] && group && group.field != ZmMailListView.SORTBY_HASH[activeSortBy].field) {
		    //switching views can cause problems; make sure the group and sortBy match
		    group = null;
		    appCtxt.set(ZmSetting.GROUPBY_HASH, group, folderId); //clear cache
		    appCtxt.set(ZmSetting.GROUPBY_LIST, ZmId.GROUPBY_NONE, folderId); //persist groupId
	    }


	    return group;
    }
	else {
	    return this._group;
    }
};

ZmMailListView.prototype._getGroupByActionMenu =
function(parent) {
    var list = [ZmOperation.GROUPBY_NONE, ZmOperation.GROUPBY_DATE, ZmOperation.GROUPBY_FROM, ZmOperation.GROUPBY_SIZE];
    if (this._mode == ZmId.VIEW_CONVLIST || this._isOutboundFolder()) {
        AjxUtil.arrayRemove(list, ZmOperation.GROUPBY_FROM);
    }

    var actionListener = new AjxListener(this, this._groupByActionListener);
    var sortActionListener = new AjxListener(this, this._sortByActionListener);
    var menu = new ZmPopupMenu(parent);
    parent.createSeparator();
	var menuItem = parent.createMenuItem(ZmId.GROUPBY, {text:ZmMsg.groupBy, style:DwtMenuItem.NO_STYLE});
    var groupById = Dwt.getNextId("GroupByActionMenu_");
    var sortById = Dwt.getNextId("SortByActionMenu_");
    for (var i=0; i<list.length; i++) {
        var mi = menu.createMenuItem(list[i], {text:ZmMsg[ZmOperation.getProp(list[i], "textKey")], style:DwtMenuItem.RADIO_STYLE, radioGroupId:groupById});
        mi.addSelectionListener(actionListener);
        if (this._group && this._group.id == list[i]) {
           mi.setChecked(true, true);
        }
        else if (!this._group && list[i] == ZmOperation.GROUPBY_NONE ) {
           mi.setChecked(true, true);
        }
    }
    menu.createSeparator();
    var sortAsc = menu.createMenuItem(ZmOperation.SORT_ASC, {text:ZmMsg[ZmOperation.getProp(ZmOperation.SORT_ASC, "textKey")], style:DwtMenuItem.RADIO_STYLE, radioGroupId:sortById});
    sortAsc.addSelectionListener(sortActionListener);

    var sortDesc = menu.createMenuItem(ZmOperation.SORT_DESC, {text:ZmMsg[ZmOperation.getProp(ZmOperation.SORT_DESC, "textKey")], style:DwtMenuItem.RADIO_STYLE, radioGroupId:sortById});
    sortDesc.addSelectionListener(sortActionListener);

    if (this._bSortAsc) {
        sortAsc.setChecked(true, true);
    }
    else {
        sortDesc.setChecked(true, true);
    }
    menuItem.setMenu(menu);

    this._groupByActionMenu = menu;

};

ZmMailListView.prototype._groupByActionListener =
function(ev) {
	var groupId = ev && ev.item && ev.item.getData("menuItemId");
	//var oldGroup = this._group ? this._group : this.getGroup(this._folderId);
	var oldGroup = this.getGroup(this._folderId);
	var field = ZmMailListGroup.getHeaderField(groupId, this._isMultiColumn);
	var hdr = this._headerHash[field];
	if (!hdr) {
		if (oldGroup) {
			field = ZmMailListGroup.getHeaderField(oldGroup.id, this._isMultiColumn); //groups turned off, keep sort the same
		}
		else {
		   field = ZmId.FLD_DATE;
		}
		hdr = this._headerHash[field];
		this.setGroup(null);
	}
	else {
		if (!oldGroup || (oldGroup.id != groupId)) {
			hdr._sortable = ZmMailListGroup.getHeaderField(groupId);
			this.setGroup(groupId);
		}
	}

	if (!this._isMultiColumn) {
	   //this sets the "Sort by: Field" for reading pane on right
		var column = ZmMailListGroup.getHeaderField(groupId);
		for (var i=0; i< ZmMailListView.SINGLE_COLUMN_SORT.length; i++) {
			if (column == ZmMailListView.SINGLE_COLUMN_SORT[i].field) {
				var mi = this._colHeaderActionMenu.getMenuItem(column);
				if (mi) {
					mi.setChecked(true, true);
					var label = AjxMessageFormat.format(ZmMsg.arrangedBy, ZmMsg[ZmMailListView.SINGLE_COLUMN_SORT[i].msg]);
					column = this._headerHash[ZmItem.F_SORTED_BY];
					var cell = document.getElementById(DwtId.getListViewHdrId(DwtId.WIDGET_HDR_LABEL, this._view, field));
					if (cell) {
						cell.innerHTML = label;
					}
					break;
				}
			}
		}
	}

   if(ev && ev.item) {
       ev.item.setChecked(true, ev, true);
   }
   this._sortColumn(hdr, this._bSortAsc);
};

ZmMailListView.prototype._sortByActionListener =
function(ev) {
  var data = ev && ev.item && ev.item.getData("menuItemId");
  var sortAsc = data == ZmId.OP_SORT_ASC ? true : false;
  var oldSort = this._bSortAsc;
  if (oldSort != sortAsc) {
      this._bSortAsc = sortAsc;
      var col = Dwt.byId(this._currentColId);
      var hdr = (col && this.getItemFromElement(col)) || (this._headerHash && this._headerHash[ZmItem.F_SORTED_BY]) || null;
      if (hdr) {
        this.clearGroupSections(this._folderId);
        this._sortColumn(hdr, this._bSortAsc);
        if (!this._isMultiColumn) {
            this._setSortedColStyle(hdr._id);
        }
      }
  }

  if(ev && ev.item) {
      ev.item.setChecked(true, ev, true);
   }
};

ZmMailListView.prototype._sortMenuListener =
function(ev) {
   var mId = this._bSortAsc ? ZmOperation.OP_SORT_DESC : ZmOperation.OP_SORT_ASC;
   var mi = this._groupByActionMenu.getItemById(mId);
   if (mi) {
       mi.setChecked(true, true);
   }
   var sortField = ev && ev.item && ev.item.getData("menuItemId");
   if (this._group && sortField) {
       var groupId = ZmMailListGroup.getGroupIdFromSortField(sortField);
       this.setGroup(groupId);
   }
   this._setGroupByCheck();
   ZmListView.prototype._sortMenuListener.call(this, ev);
};

ZmMailListView.prototype._setGroupByCheck =
function() {
    var mi = this._group && this._group.id ? this._groupByActionMenu.getMenuItem(this._group.id) : this._groupByActionMenu.getMenuItem(ZmOperation.GROUPBY_NONE);
	if (mi) {
		mi.setChecked(true, true);
	}

    mi = this._bSortAsc ? this._groupByActionMenu.getMenuItem(ZmOperation.SORT_ASC) : this._groupByActionMenu.getMenuItem(ZmOperation.SORT_DESC);
	if (mi) {
		mi.setChecked(true, true);
	}
};

/**
 * Adds a row for the given item to the list view.
 * Supports adding section header when group is set.
 *
 * @param {Object}	item			the data item
 * @param {number}	index			the index at which to add item to list and list view
 * @param {boolean}	skipNotify	if <code>true</code>, do not notify listeners
 * @param {number}	itemIndex		index at which to add item to list, if different
 * 									from the one for the list view
 */
ZmMailListView.prototype.addItem =
function(item, index, skipNotify, itemIndex) {
    var group = this._group;
    if (!group) {
        return ZmListView.prototype.addItem.call(this, item, index, skipNotify, itemIndex);
    }

	if (!this._list) {
		this._list = new AjxVector();
	}

	// clear the "no results" message before adding!
	if (this._list.size() == 0) {
		this._resetList();
	}

    var section;
    var headerDiv;

	this._list.add(item, (itemIndex != null) ? itemIndex : index);
	var div = this._createItemHtml(item);
	if (div) {
		if (div instanceof Array) {
			for (var j = 0; j < div.length; j++) {
                section = group.addMsgToSection(item, div[j]);
                if (group.getSectionSize(section) == 1){
                    headerDiv = this._getSectionHeaderDiv(group, section);
                    this._addRow(headerDiv);
                }
				this._addRow(div[j]);
			}
		}
		else {
            section = group.addMsgToSection(item, div);
            if (group.getSectionSize(section) == 1){
                headerDiv = this._getSectionHeaderDiv(group, section);
                this._addRow(headerDiv, index);
                this._addRow(div, index+1); //account for header
            }
            else {
                this._addRow(div, index);
            }
		}
	}

	if (!skipNotify && this._evtMgr.isListenerRegistered(DwtEvent.STATE_CHANGE)) {
		this._evtMgr.notifyListeners(DwtEvent.STATE_CHANGE, this._stateChangeEv);
	}
};

/**
 * return the active search sortby value
 * @return {String} sortby value or null
 */
ZmMailListView.prototype.getActiveSearchSortBy =
function() {
	var sortBy = AjxUtil.get(this._controller, "_activeSearch", "search", "sortBy") || null;
	return sortBy;
};

/**
 * return folderId for the active search
 * @return {String} folderId or null
 */
ZmMailListView.prototype.getActiveSearchFolderId =
function() {
	var folderId = AjxUtil.get(this._controller, "_activeSearch", "search", "folderId") || null;
	return folderId;
};

ZmMailListView.prototype._changeFolderName = 
function(msg, oldFolderId) {

	var folder = appCtxt.getById(msg.folderId);

	if (!this._controller.isReadingPaneOn() || !this._controller.isReadingPaneOnRight()) {
		var folderCell = folder ? this._getElement(msg, ZmItem.F_FOLDER) : null;
		if (folderCell) {
			folderCell.innerHTML = folder.getName();
		}
	}

	if (folder && (folder.nId == ZmFolder.ID_TRASH || oldFolderId == ZmFolder.ID_TRASH)) {
		this._changeTrashStatus(msg);
	}
};

ZmMailListView.prototype._changeTrashStatus = 
function(msg) {

	var row = this._getElement(msg, ZmItem.F_ITEM_ROW);
	if (row) {
		if (msg.isUnread && !msg.isMuted()) {
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
