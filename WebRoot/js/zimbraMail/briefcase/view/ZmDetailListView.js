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

    this.enableRevisionView(true);

    this._expanded = {};
    this._itemRowIdList = {};
};

ZmDetailListView.prototype = new ZmBriefcaseBaseView;
ZmDetailListView.prototype.constructor = ZmDetailListView;

ZmDetailListView.ROW_DOUBLE_CLASS	= "RowDouble";


ZmDetailListView.SINGLE_COLUMN_SORT = [
	{field:ZmItem.F_NAME, msg:"name"},
	{field:ZmItem.F_SIZE, msg:"size"},
	{field:ZmItem.F_DATE, msg:"date"}
];


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

ZmDetailListView.prototype.enableRevisionView =
function(enabled){
    this._revisionView = enabled;    
};

ZmDetailListView.prototype._changeListener =
function(ev){

    ZmBriefcaseBaseView.prototype._changeListener.call(this, ev);

    if (this._revisionView && ( ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.E_MOVE )) {
        var item, items = ev.getDetail("items");
        for (var i = 0, len = items.length; i < len; i++) {
			item = items[i];
            this.collapse(item, true);
        }
    }
};

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

        if(this._revisionView){
            headers.push(new DwtListHeaderItem({field:ZmItem.F_EXPAND, icon: "NodeCollapsed", width:ZmDetailListView.COLWIDTH_ICON, name:ZmMsg.expand}));            
        }

        if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
            headers.push(new DwtListHeaderItem({field:ZmItem.F_TAG, icon:"Tag", width:ZmDetailListView.COLWIDTH_ICON,
                name:ZmMsg.tag}));
        }
        headers.push(
                new DwtListHeaderItem({field:ZmItem.F_LOCK, icon: "PadLock", width:ZmDetailListView.COLWIDTH_ICON}),
                new DwtListHeaderItem({field:ZmItem.F_TYPE, icon:"GenericDoc", width:ZmDetailListView.COLWIDTH_ICON, name:ZmMsg.icon}),
                new DwtListHeaderItem({field:ZmItem.F_NAME, text:ZmMsg._name, sortable:ZmItem.F_NAME}),
                new DwtListHeaderItem({field:ZmItem.F_FILE_TYPE, text:ZmMsg.type, width:ZmMsg.COLUMN_WIDTH_TYPE_DLV}),
                new DwtListHeaderItem({field:ZmItem.F_SIZE, text:ZmMsg.size, width:ZmMsg.COLUMN_WIDTH_SIZE_DLV, sortable:ZmItem.F_SIZE}),
                new DwtListHeaderItem({field:ZmItem.F_DATE, text:ZmMsg.modified, width:ZmMsg.COLUMN_WIDTH_DATE_DLV, sortable:ZmItem.F_DATE}),
                new DwtListHeaderItem({field:ZmItem.F_FROM, text:ZmMsg.author, width:ZmMsg.COLUMN_WIDTH_OWNER_DLV}),
                new DwtListHeaderItem({field:ZmItem.F_FOLDER, text:ZmMsg.folder, width:ZmMsg.COLUMN_WIDTH_FOLDER_DLV}),
                new DwtListHeaderItem({field:ZmItem.F_VERSION, text:ZmMsg.version, width:ZmMsg.COLUMN_WIDTH_VERSION_DLV})
                );
    }else{
        headers.push(new DwtListHeaderItem({field:ZmItem.F_SORTED_BY, text:AjxMessageFormat.format(ZmMsg.arrangedBy, ZmMsg.name), sortable:ZmItem.F_SORTED_BY, resizeable:false}));
    }
	return headers;
};

ZmDetailListView.prototype._getHeaderToolTip =
function(field, itemIdx, isOutboundFolder) {

    var tooltip;
    if(field == ZmItem.F_EXPAND){
        tooltip = ZmMsg.expandCollapse;
    }else if(field == ZmItem.F_LOCK){
        tooltip = ZmMsg.fileLockStatus;
    }else if(field == ZmItem.F_DATE){
        tooltip = ZmMsg.sortByModified; 
    }else if(field == ZmItem.F_FROM){
        tooltip = ZmMsg.author;
    }else if(field == ZmItem.F_VERSION){
        tooltip = ZmMsg.latestVersion;
    }else if(field == ZmItem.F_NAME){
        tooltip = ZmMsg.sortByName;
    }else{
        tooltip = ZmBriefcaseBaseView.prototype._getHeaderToolTip.call(this, field, itemIdx, isOutboundFolder);
    }   
    return tooltip;
};


ZmDetailListView.prototype._getActionMenuForColHeader =
function(force) {

	if (!this.isMultiColumn()) {
		if (!this._colHeaderActionMenu || force) {
			this._colHeaderActionMenu = this._getSortMenu(ZmDetailListView.SINGLE_COLUMN_SORT, ZmItem.F_NAME);
		}
		return this._colHeaderActionMenu;
	}

	var menu = ZmListView.prototype._getActionMenuForColHeader.call(this, force);

	return menu;
};

ZmDetailListView.prototype._colHeaderActionListener =
function(ev) {
	if (!this.isMultiColumn()) {
		this._sortMenuListener(ev);
	}
	else {
		ZmListView.prototype._colHeaderActionListener.apply(this, arguments);
	}
};


ZmDetailListView.prototype._isExpandable =
function(item){
    return (!item.isFolder && !item.isRevision && parseInt(item.version) > 1 );
};

ZmDetailListView.prototype._getCellContents =
function(htmlArr, idx, item, field, colIdx, params) {

	if (field == ZmItem.F_SELECTION) {
		var icon = params.bContained ? "CheckboxChecked" : "CheckboxUnchecked";
		idx = this._getImageHtml(htmlArr, idx, icon, this._getFieldId(item, field));
    } else if (field == ZmItem.F_EXPAND) {
		idx = this._getImageHtml(htmlArr, idx, 
				this._isExpandable(item) ? (this._expanded[item.id] ? "NodeExpanded" : "NodeCollapsed" )
						: null, this._getFieldId(item, field));   
	} else if (field == ZmItem.F_TYPE) {
		htmlArr[idx++] = AjxImg.getImageHtml(item.getIcon());
	} else if (field == ZmItem.F_LOCK) {
		idx = this._getImageHtml(htmlArr, idx, (item.locked ? "PadLock" : "Blank_16") , this._getFieldId(item, field)); //AjxImg.getImageHtml(item.locked ? "PadLock" : "Blank_16");
	} else if (field == ZmItem.F_VERSION) {
		htmlArr[idx++] = item.version;
	} else if (field == ZmItem.F_NAME) {
		htmlArr[idx++] = "<div id='"+this._getFieldId(item, ZmItem.F_NAME)+"'>"+this._getDisplayName(item)+"</div>";
	} else if (field == ZmItem.F_FILE_TYPE) {
        if(item.isFolder){
            htmlArr[idx++] = ZmMsg.folder;
        }else{
            var mimeInfo = item.contentType ? ZmMimeTable.getInfo(item.contentType) : null;
            htmlArr[idx++] = mimeInfo ? mimeInfo.desc : "&nbsp;";
        }
	} else if (field == ZmItem.F_SIZE) {
	    htmlArr[idx++] = item.isFolder ? ZmMsg.folder : AjxUtil.formatSize(item.size);
	} else if (field == ZmItem.F_DATE) {
		if (item.modifyDate) {
			htmlArr[idx++] = AjxDateUtil.simpleComputeDateStr(item.modifyDate);
		}
	} else if (field == ZmItem.F_FROM) {
        var creator = item.modifier || item.creator;
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

ZmDetailListView.prototype._getDisplayName =
function(item){
    var subject;
    if(item.isRevision){
        subject = ("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + item.subject );
    }else if(parseInt(item.version) > 1){
        subject = AjxMessageFormat.format(ZmMsg.briefcaseFileVersion, [AjxStringUtil.htmlEncode(item.name), item.version])
    }
    return subject || (AjxStringUtil.htmlEncode(item.name));
};

ZmDetailListView.prototype._getAbridgedContent =
function(item, colIdx) {

    var idx=0, html=[];
	idx = this._getTable(html, idx, item);
	idx = this._getRow(html, idx, item);

    if(this._revisionView){
        html[idx++] = "<td style='vertical-align:middle;' width=16 id='" + this._getFieldId(item, ZmItem.F_FOLDER) + "'><center>";
        idx = this._getCellContents(html, idx, item, ZmItem.F_EXPAND, colIdx);
        html[idx++] = "</center></td>";
    }

	html[idx++] = "<td style='vertical-align:middle;' width=20 id='" + this._getFieldId(item, ZmItem.F_FOLDER) + "'><center>";
	html[idx++] = AjxImg.getImageHtml(item.getIcon());
	html[idx++] = "</center></td>";
	html[idx++] = "<td style='vertical-align:middle;' width='100%' id='" + this._getFieldId(item, ZmItem.F_NAME) + "'>";
    html[idx++] = "&nbsp;"+ this._getDisplayName(item);
	html[idx++] = "</td>";

    html[idx++] = "<td style='vertical-align:middle;text-align:left;' width=40 id='" + this._getFieldId(item, ZmItem.F_SIZE) + "'>";
	idx = this._getCellContents(html, idx, item, ZmItem.F_SIZE, colIdx);
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
    html[idx++] = "</td>";
    html[idx++] = "<td style='vertical-align:middle;' width='16' align='right' id='" + this._getFieldId(item, ZmItem.F_LOCK)+"' ";
    idx =   this._getImageHtml(html, idx, (item.locked ? "PadLock" : "Blank_16") , this._getFieldId(item, ZmItem.F_LOCK));
	html[idx++] = "</td>";
    html[idx++] = "</tr></table>";

	return html.join('');
};

ZmDetailListView.prototype._getDivClass =
function(base, item, params) {
	if (item.isRevision) {
	    return [base, "BriefcaseItemExpanded"].join(" ");
	} else {
		return ZmBriefcaseBaseView.prototype._getDivClass.apply(this, arguments);
	}
};

ZmDetailListView.prototype.expandItem =
function(item) {
	if (item && this._isExpandable(item) && this._revisionView) {
		this.parent._toggle(item);
	}
};

ZmDetailListView.prototype.expand =
function(item, revisions){

    if(!revisions || revisions.size() == 0 ) return;

    this._addRevisionRows(item, revisions);
       
    this._setImage(item, ZmItem.F_EXPAND, "NodeExpanded");
    this._expanded[item.id] = true;
};

ZmDetailListView.prototype._addRevisionRows =
function(item, revisions){

    var rowIds = this._itemRowIdList[item.id];
    if(rowIds && rowIds.length && this._rowsArePresent(item)){
        this._showRows(rowIds, true);
    }else{
        var index = this._getRowIndex(item);
        this._itemRowIdList[item.id] = [];
        for(var i=0; i< revisions.size(); i++){
            var rev = revisions.get(i);
            var div = this._createItemHtml(rev);
            this._addRow(div, index+i+1);
            this._itemRowIdList[item.id].push(div.id);
        }
    }
    
};

ZmDetailListView.prototype.collapse =
function(item, clear){
     var rowIds = this._itemRowIdList[item.id];
     this._showRows(rowIds, false);
     this._setImage(item, ZmItem.F_EXPAND, "NodeCollapsed");
	 this._expanded[item.id] = false;
     if(clear){
         this._itemRowIdList[item.id] = null;
     }
};

ZmDetailListView.prototype.refreshItem =
function(item){
     if(this._expanded[item.id]){
         var rowIds = this._itemRowIdList[item.id];
     }
};

ZmDetailListView.prototype._showRows =
function(rowIds, show){
   if (rowIds && rowIds.length) {
        for (var i = 0; i < rowIds.length; i++) {
            var row = document.getElementById(rowIds[i]);
            if (row) {
                Dwt.setVisible(row, show);
            }
        }
     }
};

ZmDetailListView.prototype._rowsArePresent =
function(item) {
	var rowIds = this._itemRowIdList[item.id];
	if (rowIds && rowIds.length) {
		for (var i = 0; i < rowIds.length; i++) {
			if (document.getElementById(rowIds[i])) {
				return true;
			}
		}
	}
	this._itemRowIdList[item.id] = [];	// start over
	this._expanded[item.id] = false;
	return false;
};



ZmDetailListView.prototype._allowFieldSelection =
function(id, field) {
	// allow left selection if clicking on blank icon
	if (field == ZmItem.F_EXPAND) {
		var item = appCtxt.getById(id);
		return (item && !this._isExpandable(item));
	} else {
		return ZmListView.prototype._allowFieldSelection.apply(this, arguments);
	}
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
function(force) {
	var isMultiColumn = this.isMultiColumn();
	if (isMultiColumn != this._isMultiColumn || force) {
		this._saveState({selection:true, focus:true, scroll:true, expansion:true});
		this._isMultiColumn = isMultiColumn;
		this.headerColCreated = false;
		this._headerList = this._getHeaderList();
		this._rowHeight = null;
		this._normalClass = isMultiColumn ? DwtListView.ROW_CLASS : ZmDetailListView.ROW_DOUBLE_CLASS;
		var list = this._zmList || this.getList() || (new AjxVector());
		this.set(list);
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

ZmDetailListView.prototype._getToolTip =
function(params) {

    if( params.field == ZmItem.F_LOCK){
        var item = params.item;
        if(item.locked){
            var dateFormatter = AjxDateFormat.getDateTimeInstance(AjxDateFormat.LONG, AjxDateFormat.SHORT);
            var subs = {
                title: ZmMsg.checkedOutFile,
                fileProperties:	[
                    {name: ZmMsg.checkoutTo, value:item.lockUser},
                    {name: ZmMsg.when, value: dateFormatter.format(item.lockTime)}
                ]
            };
            return AjxTemplate.expand("briefcase.Briefcase#Tooltip", subs);
        }
    }
    
	return ZmBriefcaseBaseView.prototype._getToolTip.call(this, params);
};

ZmDetailListView.prototype._folderChangeListener =
function(ev){

    ZmBriefcaseBaseView.prototype._folderChangeListener.call(this, ev);

    var organizers = ev.getDetail("organizers");
	var organizer = (organizers && organizers.length) ? organizers[0] : ev.source;
    var currentFolderId = this._controller._folderId;

    var refresh = false;
    if (ev.event == ZmEvent.E_CREATE) {
        if(organizer && currentFolderId == organizer.parent.id)
            refresh = true;
    }else if(ev.event == ZmEvent.E_MODIFY) {
        var fields = ev.getDetail("fields");        
        if( fields[ZmOrganizer.F_NAME] || fields[ZmOrganizer.F_COLOR] )
            refresh = true;
    }
    
    if(refresh) {
        appCtxt.getApp(ZmApp.BRIEFCASE).search({folderId: currentFolderId});
    }
        
};


