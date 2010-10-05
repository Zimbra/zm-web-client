/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * @overview
 * 
 */

/**
 * Creates the briefcase detail list view.
 * @class
 * This class represents the briefcase detail list view.
 * 
 * @param	{ZmControl}		parent		the parent
 * @param	{ZmBriefcaseController}	controller		the controller
 * @param	{DwtDropTarget}		dropTgt		the drop target
 * 
 * @extends		ZmBriefcaseBaseView
 */
ZmDetailListView = 	function(parent, controller, dropTgt) {

    this._controller = controller;

	var headerList = this._getHeaderList(parent);
	var params = {parent:parent, className:"ZmBriefcaseDetailListView",
				  view:ZmId.VIEW_BRIEFCASE_DETAIL,
				  controller:controller, headerList:headerList, dropTgt:dropTgt};
	ZmBriefcaseBaseView.call(this, params);

	// create a action menu for the header list
	this._colHeaderActionMenu = new ZmPopupMenu(this);
	var actionListener = new AjxListener(this, this._colHeaderActionListener);
	for (var i = 0; i < headerList.length; i++) {
		var hCol = headerList[i];
		// lets not allow columns w/ relative width to be removed (for now) - it messes stuff up
		if (hCol._width) {
			var mi = this._colHeaderActionMenu.createMenuItem(hCol._id, {text:hCol._name, style:DwtMenuItem.CHECK_STYLE});
			mi.setData(ZmDetailListView.KEY_ID, hCol._id);
			mi.setChecked(true, true);
			this._colHeaderActionMenu.addSelectionListener(hCol._id, actionListener);
		}
	}
}

ZmDetailListView.prototype = new ZmBriefcaseBaseView;
ZmDetailListView.prototype.constructor = ZmDetailListView;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmDetailListView.prototype.toString =
function() {
	return "ZmDetailListView";
};

// Constants

ZmDetailListView.KEY_ID = "_keyId";

ZmDetailListView.COLWIDTH_ICON = 20;

// Protected methods

ZmDetailListView.prototype._getHeaderList =
function(parent) {
	// Columns: tag, name, type, size, date, owner, folder
	var headers = [];
	var view = this._view;
	if (appCtxt.get(ZmSetting.SHOW_SELECTION_CHECKBOX)) {
		headers.push(new DwtListHeaderItem({field:ZmItem.F_SELECTION, icon:"CheckboxUnchecked", width:ZmListView.COL_WIDTH_ICON,
											name:ZmMsg.selection}));
	}
    if(this.isMultiColumn()){
        if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
            headers.push(new DwtListHeaderItem({field:ZmItem.F_TAG, icon:"Tag", width:ZmDetailListView.COLWIDTH_ICON,
                name:ZmMsg.tag}));
        }
        headers.push(
                new DwtListHeaderItem({field:ZmItem.F_LOCK, icon: "PadLock", width:ZmDetailListView.COLWIDTH_ICON}),
                new DwtListHeaderItem({field:ZmItem.F_TYPE, icon:"GenericDoc", width:ZmDetailListView.COLWIDTH_ICON, name:ZmMsg.icon}),
                new DwtListHeaderItem({field:ZmItem.F_SUBJECT, text:ZmMsg._name, sortable:ZmItem.F_SUBJECT}),
                new DwtListHeaderItem({field:ZmItem.F_FILE_TYPE, text:ZmMsg.type, width:ZmMsg.COLUMN_WIDTH_TYPE_DLV}),
                new DwtListHeaderItem({field:ZmItem.F_SIZE, text:ZmMsg.size, width:ZmMsg.COLUMN_WIDTH_SIZE_DLV, sortable:ZmItem.F_SIZE}),
                new DwtListHeaderItem({field:ZmItem.F_DATE, text:ZmMsg.date, width:ZmMsg.COLUMN_WIDTH_DATE_DLV, sortable:ZmItem.F_DATE}),
                new DwtListHeaderItem({field:ZmItem.F_FROM, text:ZmMsg.owner, width:ZmMsg.COLUMN_WIDTH_OWNER_DLV}),
                new DwtListHeaderItem({field:ZmItem.F_FOLDER, text:ZmMsg.folder, width:ZmMsg.COLUMN_WIDTH_FOLDER_DLV}),
                new DwtListHeaderItem({field:ZmItem.F_VERSION, text:ZmMsg.version, width:ZmMsg.COLUMN_WIDTH_VERSION_DLV})
                );
    }else{
        headers.push(new DwtListHeaderItem({field:ZmItem.F_SORTED_BY, text:AjxMessageFormat.format(ZmMsg.arrangedBy, ZmMsg.date), sortable:ZmItem.F_SORTED_BY, resizeable:false}));
    }
	return headers;
};

ZmDetailListView.prototype._getCellContents =
function(htmlArr, idx, item, field, colIdx, params) {

	if (field == ZmItem.F_SELECTION) {
		var icon = params.bContained ? "CheckboxChecked" : "CheckboxUnchecked";
		idx = this._getImageHtml(htmlArr, idx, icon, this._getFieldId(item, field));
	} else if (field == ZmItem.F_TYPE) {
		htmlArr[idx++] = AjxImg.getImageHtml(item.getIcon());
	} else if (field == ZmItem.F_LOCK) {
		htmlArr[idx++] = AjxImg.getImageHtml(item.locked ? "PadLock" : "Blank_16");
	} else if (field == ZmItem.F_VERSION) {
		htmlArr[idx++] = item.version;
	} else if (field == ZmItem.F_SUBJECT) {
		htmlArr[idx++] = "<div id='"+this._getFieldId(item,ZmItem.F_SUBJECT)+"'>"+AjxStringUtil.htmlEncode(item.name)+"</div>";
	} else if (field == ZmItem.F_FILE_TYPE) {
		var mimeInfo = item.contentType ? ZmMimeTable.getInfo(item.contentType) : null;
		htmlArr[idx++] = mimeInfo ? mimeInfo.desc : "&nbsp;";
	} else if (field == ZmItem.F_SIZE) {
		if (!item.isFolder) {
			htmlArr[idx++] = AjxUtil.formatSize(item.size);
		}
	} else if (field == ZmItem.F_DATE) {
		if (item.modifyDate) {
			htmlArr[idx++] = AjxDateUtil.simpleComputeDateStr(item.modifyDate);
		}
	} else if (field == ZmItem.F_FROM) {
        var creator = item.modifer || item.creator;
		creator = creator ? creator.split("@") : [""];
		var cname = creator[0];
		var uname = appCtxt.get(ZmSetting.USERNAME);
		if (uname) {
			var user = uname.split("@");
			if (creator[1] != user[1]) {
				cname = creator.join("@");
			}
		}
		htmlArr[idx++] = "<span style='white-space: nowrap'>";
		htmlArr[idx++] = cname;
		htmlArr[idx++] = "</span>";
	} else if (field == ZmItem.F_FOLDER) {
		var briefcase = appCtxt.getById(item.folderId);
		htmlArr[idx++] = briefcase ? briefcase.getPath() : item.folderId;
	} else if(field == ZmItem.F_SORTED_BY){
        htmlArr[idx++] = this._getAbridgedContent(item, colIdx);
    }else {
		idx = ZmListView.prototype._getCellContents.apply(this, arguments);
	}

	return idx;
};

ZmDetailListView.prototype._getAbridgedContent =
function(item, colIdx) {

    var idx=0, html=[];
	idx = this._getTable(html, idx, item);
	idx = this._getRow(html, idx, item);

	html[idx++] = "<td style='vertical-align:middle;' width=20 id='" + this._getFieldId(item, ZmItem.F_FOLDER) + "'><center>";
	html[idx++] = AjxImg.getImageHtml(item.getIcon());
	html[idx++] = "</center></td>";
	html[idx++] = "<td style='vertical-align:middle;' width='100%' id='" + this._getFieldId(item, ZmItem.F_SUBJECT) + "'>";
    //html[idx++] =    "&nbsp;"+AjxStringUtil.htmlEncode(item.name);
    html[idx++] = "&nbsp;"+AjxMessageFormat.format(ZmMsg.briefcaseFileVersion, [AjxStringUtil.htmlEncode(item.name), item.version]);
	html[idx++] = "</td>";

    html[idx++] = "<td style='vertical-align:middle;text-align:left;' width=40 id='" + this._getFieldId(item, ZmItem.F_SIZE) + "'>";
	idx = this._getCellContents(html, idx, item, ZmItem.F_SIZE, colIdx);
	html[idx++] = "</td>";

    html[idx++] = "<td style='vertical-align:middle;' width='16' align='right' id='" + this._getFieldId(item, ZmItem.F_LOCK)+"' ";
    html[idx++] = item.locked ? "class='ImgPadLock' ":" ";
    html[idx++] = " >";
	html[idx++] = "</td>";

    html[idx++] = "<td style='vertical-align:middle;' width='16' align='right' id='" + this._getFieldId(item, ZmItem.F_TAG)+"'>";
    idx = this._getImageHtml(html, idx, item.getTagImageInfo(), this._getFieldId(item, ZmItem.F_TAG));
	html[idx++] = "</td>";

	html[idx++] = "</tr>";
    html[idx++] = "</table>";

    html[idx++] = "<table width='100%' border='0' cellpadding=0 cellspacing=0><tr>";
    html[idx++] = "<td style='text-align:center'>";
    idx = this._getCellContents(html, idx, item, ZmItem.F_FROM, colIdx);
    html[idx++] = "<td style='text-align:right;padding-right:50px;'>";
    idx = this._getCellContents(html, idx, item, ZmItem.F_DATE, colIdx);
    html[idx++] = "</td></tr></table>";

	return html.join('');
};

// listeners

ZmDetailListView.prototype._sortColumn =
function(columnItem, bSortAsc) {

	// call base class to save the new sorting pref
	ZmBriefcaseBaseView.prototype._sortColumn.apply(this, arguments);

	var query = this._controller.getSearchString();
	var queryHint = this._controller.getSearchStringHint();

	if (this._sortByString && (query || queryHint)) {
		var params = {
			query:		query,
			queryHint:	queryHint,
			types:		[ZmItem.BRIEFCASE_ITEM],
			sortBy:		this._sortByString
		};
		appCtxt.getSearchController().search(params);
	}
};

ZmDetailListView.prototype.isMultiColumn =
function(controller) {
	var ctlr = controller || this._controller;
	return !ctlr.isReadingPaneOnRight();
};


ZmDetailListView.prototype.reRenderListView =
function() {
	var isMultiColumn = this.isMultiColumn();
	if (isMultiColumn != this._isMultiColumn) {
		this._saveState({selection:true, focus:true, scroll:true, expansion:true});
		this._isMultiColumn = isMultiColumn;
		this.headerColCreated = false;
		this._headerList = this._getHeaderList();
		this._rowHeight = null;
		this._normalClass = isMultiColumn ? DwtListView.ROW_CLASS : ZmTaskListView.ROW_DOUBLE_CLASS;
		var list = this.getList() || (new AjxVector());
		this.set(list.clone());
		this._restoreState();
	}
};

ZmDetailListView.prototype.setSize =
function(width, height) {
	ZmListView.prototype.setSize.call(this, width, height);
	this._resetColWidth();
};

ZmDetailListView.prototype.resetSize =
function(newWidth, newHeight) {
	this.setSize(newWidth, newHeight);
	var height = (newHeight == Dwt.DEFAULT) ? newHeight : newHeight - DwtListView.HEADERITEM_HEIGHT;
	Dwt.setSize(this._parentEl, newWidth, height);
};

ZmDetailListView.prototype._resetColWidth =
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


