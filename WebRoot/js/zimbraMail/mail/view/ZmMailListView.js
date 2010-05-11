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

// Consts
ZmMailListView.ROW_DOUBLE_CLASS	= "RowDouble";

ZmMailListView.FIRST_ITEM	= -1;
ZmMailListView.LAST_ITEM	= -2;

ZmMailListView.SINGLE_COLUMN_SORT = [
	{field:ZmItem.F_FROM,	msg:"from"		},
	{field:ZmItem.F_SUBJECT,msg:"subject"	},
	{field:ZmItem.F_SIZE,	msg:"size"		},
	{field:ZmItem.F_DATE,	msg:"date"		}
];


// Public methods

ZmMailListView.prototype.toString = 
function() {
	return "ZmMailListView";
};

// Reset row style
ZmMailListView.prototype.markUIAsRead = 
function(item) {
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
	ZmListView.prototype.set.call(this, list, sortField);

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
		ctlr._resetOperations(ctlr._toolbar[ctlr._currentView], this.getSelectionCount());
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
function(controller) {
	var ctlr = controller || this._controller;
	return !ctlr.isReadingPaneOnRight();
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
	htmlArr[idx++] = " id='";
	htmlArr[idx++] = this._getCellId(item, field, params);
	htmlArr[idx++] = "'";
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
	} else {
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
		var sel = this.getSelection();
		this._isMultiColumn = isMultiColumn;
		this.headerColCreated = false;
		this._headerList = this._getHeaderList();
		this._rowHeight = null;
		this._normalClass = isMultiColumn ? DwtListView.ROW_CLASS : ZmMailListView.ROW_DOUBLE_CLASS;
		var list = this.getList() || (new AjxVector());
		this.set(list.clone());
		this._resetFromColumnLabel();
		this.setSelectedItems(sel);
		this.scrollToTop();
	}
};

// Private / protected methods

ZmMailListView.prototype._initHeaders =
function() {
	if (!this._headerInit) {
		this._headerInit = {};
		this._headerInit[ZmItem.F_SELECTION]	= {icon:"CheckboxUnchecked", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.selection, precondition:ZmSetting.SHOW_SELECTION_CHECKBOX};
		this._headerInit[ZmItem.F_FLAG]			= {icon:"FlagRed", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.flag, sortable:ZmItem.F_FLAG, noSortArrow:true, precondition:ZmSetting.FLAGGING_ENABLED};
		this._headerInit[ZmItem.F_PRIORITY]		= {icon:"PriorityHigh_list", width:ZmListView.COL_WIDTH_NARROW_ICON, name:ZmMsg.priority, precondition:ZmSetting.MAIL_PRIORITY_ENABLED};
		this._headerInit[ZmItem.F_TAG]			= {icon:"Tag", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.tag, precondition:ZmSetting.TAGGING_ENABLED};
		this._headerInit[ZmItem.F_ACCOUNT]		= {icon:"AccountAll", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.account, noRemove:true, resizeable:true};
		this._headerInit[ZmItem.F_STATUS]		= {icon:"MsgStatus", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.status};
		this._headerInit[ZmItem.F_FROM]			= {text:ZmMsg.from, width:ZmMsg.COLUMN_WIDTH_FROM_MLV, resizeable:true, sortable:ZmItem.F_FROM};
		this._headerInit[ZmItem.F_ATTACHMENT]	= {icon:"Attachment", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.attachment, sortable:ZmItem.F_ATTACHMENT, noSortArrow:true};
		this._headerInit[ZmItem.F_SUBJECT]		= {text:ZmMsg.subject, sortable:ZmItem.F_SUBJECT, noRemove:true, resizeable:true};
		this._headerInit[ZmItem.F_FOLDER]		= {text:ZmMsg.folder, width:ZmMsg.COLUMN_WIDTH_FOLDER, resizeable:true};
		this._headerInit[ZmItem.F_SIZE]			= {text:ZmMsg.size, width:ZmMsg.COLUMN_WIDTH_SIZE, sortable:ZmItem.F_SIZE, resizeable:true};
		this._headerInit[ZmItem.F_DATE]			= {text:ZmMsg.received, width:ZmMsg.COLUMN_WIDTH_DATE, sortable:ZmItem.F_DATE, resizeable:true};
		this._headerInit[ZmItem.F_SORTED_BY]	= {text:AjxMessageFormat.format(ZmMsg.arrangedBy, ZmMsg.date), sortable:ZmItem.F_SORTED_BY, resizeable:false};
	}
};

ZmMailListView.prototype._getHeaders =
function(viewId, headerList) {

	this._initHeaders();
	var hList = [];

	this._defaultCols = headerList.join(ZmListView.COL_JOIN);
	var isMultiColumn = appCtxt.get(ZmSetting.READING_PANE_LOCATION) != ZmSetting.RP_RIGHT;
	var userHeaders = isMultiColumn && appCtxt.get(ZmSetting.LIST_VIEW_COLUMNS, viewId);
	var headers = headerList;
	if (userHeaders && isMultiColumn) {
		headers = userHeaders.split(ZmListView.COL_JOIN);
		if (headers.length != headerList.length) {
			// this means a new column was added the user does not know about yet
			headers = this._normalizeHeaders(headers, headerList);
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
				appCtxt.inStartup &&
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
		var rpLoc = appCtxt.get(ZmSetting.READING_PANE_LOCATION);
		if (rpLoc == ZmSetting.RP_RIGHT && this._controller._itemCountText[rpLoc]) {
			this._controller._itemCountText[rpLoc].dispose();
		}

		DwtListView.prototype.createHeaderHtml.apply(this, arguments);

		if (rpLoc == ZmSetting.RP_RIGHT) {
			var td = document.getElementById(this._itemCountTextTdId);
			if (td) {
				var textId = DwtId._makeId(this.view, rpLoc, "text");
				var textDiv = document.getElementById(textId);
				if (!textDiv) {
					var text = this._controller._itemCountText[rpLoc] =
							   new DwtText({parent:this, className:"itemCountText", id:textId});
					td.appendChild(text.getHtmlElement());
				}
			}
		}
	}

	// Show "From" or "To" depending on which folder we're looking at
	var headerCol = this._headerHash[ZmItem.F_DATE];
	if (headerCol) {
		this._resetFromColumnLabel();
		// set the received column name based on search folder
		var colLabel = ZmMsg.received;
		if (this._isOutboundFolder()) {
			colLabel = (this._folderId == ZmFolder.ID_DRAFTS) ? ZmMsg.lastSaved : ZmMsg.sentAt;
		}
		var recdColSpan = document.getElementById(DwtId.getListViewHdrId(DwtId.WIDGET_HDR_LABEL, this._view, headerCol._field));
		if (recdColSpan) {
			recdColSpan.innerHTML = "&nbsp;" + colLabel;
		}
		if (this._colHeaderActionMenu) {
			this._colHeaderActionMenu.getItem(headerCol._index).setText(colLabel);
		}
	}
};

ZmMailListView.prototype._createHeader =
function(htmlArr, idx, headerCol, i, numCols, id, defaultColumnSort) {

	if (headerCol._field == ZmItem.F_SORTED_BY) {
		var field = headerCol._field;
		var textTdId = this._itemCountTextTdId = DwtId._makeId(this.view, ZmSetting.RP_RIGHT, "td");
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

	// Bug 6830 - since server can't sort on recipient, let user search via dialog
	var hdr = this.getItemFromElement(clickedCol);
	if (hdr && hdr._sortable && hdr._sortable == ZmItem.F_FROM) {
		if (this._isOutboundFolder()) {
			var sel = this.getSelection();
			var addrs = [];
			for (var i = 0, len = sel.length; i < len; i++) {
				var vec = sel[i].getAddresses(AjxEmailAddress.TO);
				addrs = addrs.concat(vec.getArray());
			}
			var dlg = appCtxt.getAddrSelectDialog();
			dlg.popup(addrs, this._folderId);
			this._checkSelectionColumnClicked(clickedCol, ev);
			return;
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
	return folder && folder.isOutbound;
};

ZmMailListView.prototype._getRowClass =
function(item) {
	return item.isUnread ? "Unread" : null;
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
	   return this._headerList[itemIdx]._sortable ? ZmMsg.sortByTo : ZmMsg.to;
	} else if (field == ZmItem.F_STATUS) {
		return ZmMsg.messageStatus;
	} else {
		return ZmListView.prototype._getHeaderToolTip.call(this, field, itemIdx, isOutboundFolder);
	}
};

ZmMailListView.prototype._getToolTip =
function(params) {
	var tooltip, field = params.field, item = params.item;
	if (!item) { return; }

	if (field == ZmItem.F_STATUS) {
		tooltip = item.getStatusTooltip();
	}
	else if (appCtxt.get(ZmSetting.CONTACTS_ENABLED) &&
			(field == ZmItem.F_FROM || field == ZmItem.F_PARTICIPANT))
	{
		tooltip = {callback:new AjxCallback(this, this._getParticipantToolTip, [item.getAddress(AjxEmailAddress.FROM)]), loading:true};
	}
	else if (field == ZmItem.F_SUBJECT) {
		if ((item.type == ZmItem.MSG) && item.isInvite() && item.needsRsvp()) {
			tooltip = item.invite.getToolTip();
		} else if (appCtxt.get(ZmSetting.SHOW_FRAGMENTS)) {
		    tooltip = AjxStringUtil.htmlEncode(item.fragment || ZmMsg.fragmentIsEmpty);
            if (tooltip == "") {
				tooltip = null;
			}
        }
	}
	else if (field == ZmItem.F_FOLDER) {
		var folder = appCtxt.getById(item.folderId);
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
 * Get the tooltip for the given address. May invoke a server request. The caller will pass
 * a callback if there may be a server request. If it does not pass a callback, return a
 * tooltip based on cached data.
 *
 * @param address		[AjxEmailAddress]
 * @param callback		[AjxCallback]
 */
ZmMailListView.prototype._getParticipantToolTip =
function(address, callback) {
	var addr = address && address.getAddress();
	if (!addr || !appCtxt.get(ZmSetting.CONTACTS_ENABLED)) { return; }

	if (callback) {
		var respCallback = new AjxCallback(this, this._handleResponseGetContact, [address, callback]);
		appCtxt.getApp(ZmApp.CONTACTS).getContactByEmail(addr, respCallback);
	} else {
		return this._handleResponseGetContact(address, null, appCtxt.getApp(ZmApp.CONTACTS).getContactByEmail(addr));
	}
};

ZmMailListView.prototype._handleResponseGetContact =
function(address, callback, contact) {
	var tooltip;
	if (contact) {
		tooltip = contact.getToolTip(address.getAddress());
	} else {
		tooltip = address && AjxTemplate.expand("abook.Contacts#TooltipNotInAddrBook", {addrstr:address.toString()});
	}
	if (callback) {
		callback.run(tooltip);
	} else {
		return tooltip;
	}
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

// Figure out how many of the participants will fit into a given pixel width.
// We always include the originator, and then as many of the most recent participants
// as possible. If any have been elided (either by the server or because they don't
// fit), there will be an ellipsis after the originator.
//
// The length of a participants string is determined mathematically. Since each letter
// is assumed to be an em in width, the calculated length is significantly longer than
// the actual length. The only way I've found to get the actual length is to create
// invisible divs and measure them, but that's expensive. The calculated length seems to
// run about 50% greater than the actual length, so we use a 30% fudge factor. The text 
// that's tested is bolded, since that's bigger and the conv may be unread.
//
// Returns a list of objects with name and original index.
ZmMailListView.prototype._fitParticipants = 
function(participants, participantsElided, width) {
	// fudge factor since we're basing calc on em width; the actual ratio is around 1.5
	width = width * 1.3;
	// only one participant, no need to test width
	if (participants.length == 1) {
		var p = participants[0];
		var name = p.name ? p.name : p.dispName;
		var tmp = {name: AjxStringUtil.htmlEncode(name), index: 0};
		return [tmp];
	}
	// create a list of "others" (not the originator)
	var list = new Array();
	for (var i = 0; i < participants.length; i++) {
		var tmp = {name: AjxStringUtil.htmlEncode(participants[i].dispName), index: i};
		list.push(tmp);
	}
	var origLen = list.length;
	var originator = list.shift();
	// test originator + others
	// if it's too big, remove the oldest from others
	while (list.length) {
		var test = [originator];
		test = test.concat(list);
		var text;
		var tmp = [];
		var w = 0;
		for (var i = 0; i < test.length; i++)
			w = w + (test[i].name.length * DwtUnits.WIDTH_EM); // total width of names
		if ((test.length == origLen) && !participantsElided) {
			w = w + (test.length - 1) * DwtUnits.WIDTH_SEP; // none left out, comma join
			for (var i = 0; i < test.length; i++)
				tmp.push(test[i].name);
			text = tmp.join(", ");
		} else {
			w = w + DwtUnits.WIDTH_ELLIPSIS;				// some left out, add in ellipsis
			w = w + (test.length - 2) * DwtUnits.WIDTH_SEP; // and remaining commas
			for (var i = 0; i < list.length; i++)
				tmp.push(list[i].name);
			text = originator.name + AjxStringUtil.ELLIPSIS + tmp.join(", ");
		}
		//DBG.println(AjxDebug.DBG3, "calc width of [" + text + "] = " + w);
		if (w <= width) {
			return test;
		} else {
			list.shift();
		}
	}
	return [originator];
};

ZmMailListView.prototype._getActionMenuForColHeader =
function(force) {

	if (!this.isMultiColumn()) {
		if (!this._colHeaderActionMenu || force) {
			// create a action menu for the header list
			var menu = this._colHeaderActionMenu = new ZmPopupMenu(this);
			var actionListener = new AjxListener(this, this._colHeaderActionListener);

			for (var i = 0; i < ZmMailListView.SINGLE_COLUMN_SORT.length; i++) {
				var column = ZmMailListView.SINGLE_COLUMN_SORT[i];
				var label = AjxMessageFormat.format(ZmMsg.arrangedBy, ZmMsg[column.msg]);
				var mi = menu.createMenuItem(column.field, {text:label, style:DwtMenuItem.RADIO_STYLE});
				if (column.field == ZmItem.F_DATE) {
					mi.setChecked(true, true);
				}
				mi.setData(ZmListView.KEY_ID, column.field);
				menu.addSelectionListener(column.field, actionListener);
			}
		}
		var mi = this._colHeaderActionMenu.getItemById(ZmItem.F_FROM);
		if (mi) {
			mi.setVisible(!this._isOutboundFolder());
		}
		return this._colHeaderActionMenu;
	}

	var doReset = (!this._colHeaderActionMenu || force);

	var menu = ZmListView.prototype._getActionMenuForColHeader.call(this, force);

	if (doReset) {
		this._resetFromColumnLabel();
	}

	return menu;
};

ZmMailListView.prototype._colHeaderActionListener =
function(ev) {
	if (!this.isMultiColumn()) {
		var column = this._headerHash[ZmItem.F_SORTED_BY];
		var cell = document.getElementById(DwtId.getListViewHdrId(DwtId.WIDGET_HDR_LABEL, this._view, column._field));
		if (cell) {
			cell.innerHTML = ev.item.getText();
		}
		column._sortable = ev.item.getData(ZmListView.KEY_ID);
		this._sortColumn(column, this._bSortAsc);
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

ZmMailListView.prototype._changeListener =
function(ev) {

	var item = this._getItemFromEvent(ev);
	if (!item || ev.handled || !this._handleEventType[item.type]) { return; }

	if (ev.event == ZmEvent.E_FLAGS) { // handle "unread" flag
		DBG.println(AjxDebug.DBG2, "ZmMailListView: FLAGS");
		var flags = ev.getDetail("flags");
		for (var j = 0; j < flags.length; j++) {
			var flag = flags[j];
			if (flag == ZmItem.FLAG_UNREAD) {
				var on = item[ZmItem.FLAG_PROP[flag]];
				this.markUIAsRead(item, !on);
			}
		}
	}
	
	if (ev.event == ZmEvent.E_CREATE) {
		DBG.println(AjxDebug.DBG2, "ZmMailListView: CREATE");

		if (this._controller.actionedMsgId) {
			var newMsg = appCtxt.getById(this._controller.actionedMsgId);
			this._itemToSelect = (this._controller._app.getGroupMailBy() == ZmId.ITEM_CONV)
				? appCtxt.getById(newMsg.cid) : newMsg;
			this._controller.actionedMsgId = null;
		}

		if (this._list && this._list.contains(item)) { return; } // skip if we already have it
		if (!this._handleEventType[item.type]) { return; }

		// Check to see if ZmMailList::notifyCreate gave us an index for the item.
		// If not, we assume that the new conv/msg is the most recent one. The only case
		// we handle is where the user is on the first page.
		//
		// TODO: handle other sort orders, arbitrary insertion points
		if ((this._isPageless || this.offset == 0) && (!this._sortByString || this._sortByString == ZmSearch.DATE_DESC)) {
			this.addItem(item, ev.getDetail("sortIndex") || 0);

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
						if (msg && ctlr._curMsg && (msg.id != ctlr._curMsg.id)) {
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
	if (item == ZmMailListView.FIRST_ITEM) {
		var list = this.getList(true).getArray();
		item = list && list[0];
	} else if (item == ZmMailListView.LAST_ITEM) {
		var list = this.getList(true).getArray();
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
