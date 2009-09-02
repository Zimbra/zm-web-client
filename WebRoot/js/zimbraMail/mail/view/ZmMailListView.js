/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

ZmMailListView = function(params) {

	if (arguments.length == 0) { return; }
	
	ZmListView.call(this, params);

	this._folderId = null;

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
	this._folderId = (list && list.search) ? list.search.folderId : null;
	ZmListView.prototype.set.call(this, list, sortField);

	var sortBy = list && list.search && list.search.sortBy;
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
	if (field != "fr" && field != "su")
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

/**
 * Called by the controller whenever the reading pane preference changes
 */
ZmMailListView.prototype.reRenderListView =
function() {
	var isMultiColumn = this.isMultiColumn();
	if (isMultiColumn != this._isMultiColumn) {
		var sel = this.getSelection();
		this._isMultiColumn = isMultiColumn;
		this.headerColCreated = false;
		this._headerList = this._getHeaderList();
		this._normalClass = isMultiColumn ? DwtListView.ROW_CLASS : ZmMailListView.ROW_DOUBLE_CLASS;
		var list = this.getList() || (new AjxVector());
		this.set(list.clone());
		this.setSelectedItems(sel);
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
		this._headerInit[ZmItem.F_STATUS]		= {icon:"MsgStatus", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.status};
		this._headerInit[ZmItem.F_FROM]			= {text:ZmMsg.from, width:ZmMsg.COLUMN_WIDTH_FROM_MLV, resizeable:true, sortable:ZmItem.F_FROM};
		this._headerInit[ZmItem.F_ATTACHMENT]	= {icon:"Attachment", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.attachment, sortable:ZmItem.F_ATTACHMENT, noSortArrow:true};
		this._headerInit[ZmItem.F_SUBJECT]		= {text:ZmMsg.subject, sortable:ZmItem.F_SUBJECT, noRemove:true, resizeable:true};
		this._headerInit[ZmItem.F_FOLDER]		= {text:ZmMsg.folder, width:ZmMsg.COLUMN_WIDTH_FOLDER, resizeable:true};
		this._headerInit[ZmItem.F_SIZE]			= {text:ZmMsg.size, width:ZmMsg.COLUMN_WIDTH_SIZE, sortable:ZmItem.F_SIZE, resizeable:true};
		this._headerInit[ZmItem.F_DATE]			= {text:ZmMsg.received, width:ZmMsg.COLUMN_WIDTH_DATE, sortable:ZmItem.F_DATE, resizeable:true};
		this._headerInit[ZmItem.F_SORTED_BY]	= {text:AjxMessageFormat.format(ZmMsg.arrangedBy, ZmMsg.date), sortable:ZmItem.F_SORTED_BY};
	}
};

ZmMailListView.prototype._getHeaders =
function(viewId, headerList) {

	this._initHeaders();
	var hList = [];

	this._defaultCols = headerList.join(ZmListView.COL_JOIN);
	var userHeaders = appCtxt.get(ZmSetting.LIST_VIEW_COLUMNS, viewId);
	var headers = (userHeaders && this._isMultiColumn) ? userHeaders.split(ZmListView.COL_JOIN) : headerList;
	for (var i = 0, len = headers.length; i < len; i++) {
		var header = headers[i];
		var field = header.substr(0, 2);
		var hdrParams = this._headerInit[field];
		if (!hdrParams) { continue; }
		var pre = hdrParams.precondition;
		if (!pre || appCtxt.get(pre)) {
			hdrParams.field = field;
			hdrParams.visible = (header.indexOf("*") == -1);
			hList.push(new DwtListHeaderItem(hdrParams));
		}
	}

	return hList;
};

ZmMailListView.prototype._resetFromColumnLabel =
function() {
	var isFolder = this._isSentOrDraftsFolder();

	// set the from column name based on query string
	var headerCol = this._headerHash[ZmItem.F_FROM];
	if (headerCol) {
		var colLabel = (isFolder.sent || isFolder.drafts) ? ZmMsg.to : ZmMsg.from;

		var fromColSpan = document.getElementById(DwtId.getListViewHdrId(DwtId.WIDGET_HDR_LABEL, this._view, headerCol._field));
		if (fromColSpan) {
			fromColSpan.innerHTML = "&nbsp;" + colLabel;
		}
		var item = (this._colHeaderActionMenu) ? this._colHeaderActionMenu.getItem(headerCol._index) : null;
		if (item) {
			item.setText(colLabel);
		}
	}

	return isFolder;
};

ZmMailListView.prototype._isSentOrDraftsFolder =
function() {
	var folder = appCtxt.getById(this._folderId);
	var isSentFolder = folder && (folder.isUnder(ZmFolder.ID_SENT) || folder.isUnder(ZmFolder.ID_OUTBOX));
	var isDraftsFolder = folder && folder.isUnder(ZmFolder.ID_DRAFTS);

	// XXX: is the code below necessary?
	// if not in Sent/Drafts, deep dive into query to be certain
	if (!isSentFolder && !isDraftsFolder) {
		// check for is:sent or is:draft w/in search query
		var idx = null, query = null;
		var curSearch = this._controller._app.currentSearch;
		if (curSearch) {
			query = curSearch.query;
			idx = query.indexOf(":");
		}
		if (idx) {
			var prefix = AjxStringUtil.trim(query.substring(0, idx));
			if (prefix == "is") {
				var folderStr = AjxStringUtil.trim(query.substring(idx + 1));
				isSentFolder = (folderStr == ZmFolder.QUERY_NAME[ZmFolder.ID_SENT]);
				isDraftsFolder = (folderStr == ZmFolder.QUERY_NAME[ZmFolder.ID_DRAFTS]);
			}
		}
	}
	return {sent:isSentFolder, drafts:isDraftsFolder};
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
    var isFolder = this._isSentOrDraftsFolder();
    return (field == ZmItem.F_STATUS)
		? ZmMsg.messageStatus
		: ZmListView.prototype._getHeaderToolTip.call(this, field, itemIdx, isFolder);
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
	var doReset = (!this._colHeaderActionMenu || force);

	var menu = ZmListView.prototype._getActionMenuForColHeader.call(this, force);

	if (doReset) {
		this._resetFromColumnLabel();
	}

	return menu;
};

ZmMailListView.prototype._getNoResultsMessage =
function() {
	if (appCtxt.isOffline) {
		// offline folders which are "syncable" but currently not syncing should
		// display a different message
		var fid = ZmOrganizer.getSystemId(this._controller._getSearchFolderId());
		var folder = (fid != null) ? appCtxt.getById(fid) : null;
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
		var callback = new AjxCallback(listview, listview._handleToggleSync);
		folder.toggleSyncOffline(callback);
	}
};

ZmMailListView.prototype._handleToggleSync =
function() {
	appCtxt.getAppController().sendSync();
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
		if (this._list && this._list.contains(item)) { return; } // skip if we already have it
		if (!this._handleEventType[item.type]) { return; }

		// Check to see if ZmMailList::notifyCreate gave us an index for the item.
		// If not, we assume that the new conv/msg is the most recent one. The only case
		// we handle is where the user is on the first page.
		//
		// TODO: handle other sort orders, arbitrary insertion points
		if ((this.offset == 0) && (!this._sortByString || this._sortByString == ZmSearch.DATE_DESC)) {
			this.addItem(item, ev.getDetail("sortIndex") || 0);
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
	var item = this._getItemToSelect();
	if (item) {
		this.setSelection(item, false);
	}
};

/**
 * Returns the next item to select, typically set by the controller.
 * A value of -1 means return the last item.
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
