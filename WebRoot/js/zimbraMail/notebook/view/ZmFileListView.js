/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
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

ZmFileListView = function(params) {

	// call super constructor
	var headerList = params.headerList = this._getHeaderList(parent);
	params.view = ZmController.NOTEBOOK_FILE_VIEW;
	params.type = ZmItem.PAGE;
	ZmListView.call(this, params);

	// create a action menu for the header list
	this._colHeaderActionMenu = new ZmPopupMenu(this);
	var actionListener = new AjxListener(this, this._colHeaderActionListener);
	for (var i = 0; i < headerList.length; i++) {
		var hCol = headerList[i];
		// lets not allow columns w/ relative width to be removed (for now) - it messes stuff up
		if (hCol._width) {
			var mi = this._colHeaderActionMenu.createMenuItem(hCol._id, {text:hCol._name, style:DwtMenuItem.CHECK_STYLE});
			mi.setData(ZmFileListView.KEY_ID, hCol._id);
			mi.setChecked(true, true);
			this._colHeaderActionMenu.addSelectionListener(hCol._id, actionListener);
		}
	}
};

ZmFileListView.prototype = new ZmListView;
ZmFileListView.prototype.constructor = ZmFileListView;

ZmFileListView.prototype.toString =
function() {
	return "ZmFileListView";
};

// Constants

ZmFileListView.KEY_ID = "_keyId";

ZmFileListView.COLWIDTH_ICON 			= 20;
ZmFileListView.COLWIDTH_TYPE			= 80;
ZmFileListView.COLWIDTH_SIZE 			= 45;
ZmFileListView.COLWIDTH_DATE 			= 80;
ZmFileListView.COLWIDTH_OWNER			= 80;
ZmFileListView.COLWIDTH_FOLDER			= 120;

// Protected methods

ZmFileListView.prototype._getHeaderList =
function(parent) {
	// Columns: tag, name, type, size, date, owner, folder
	var headers = [];
	if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		headers.push(new DwtListHeaderItem(ZmItem.F_TAG, null, "Tag", ZmFileListView.COLWIDTH_ICON, null, null, true, ZmMsg.tag));
	}
	headers.push(
		// new DwtListHeaderItem(id, label, icon, width, sortable, resizeable, visible, tt)
		new DwtListHeaderItem(ZmItem.F_TYPE, null, "Globe", ZmFileListView.COLWIDTH_ICON),
		new DwtListHeaderItem(ZmItem.F_SUBJECT, ZmMsg._name, null, null, null, true),
		new DwtListHeaderItem(ZmItem.F_FILE_TYPE, ZmMsg.type, null, ZmFileListView.COLWIDTH_TYPE),
		new DwtListHeaderItem(ZmItem.F_SIZE, ZmMsg.size, null, ZmFileListView.COLWIDTH_SIZE),
		new DwtListHeaderItem(ZmItem.F_DATE, ZmMsg.date, null, ZmFileListView.COLWIDTH_DATE),
		new DwtListHeaderItem(ZmItem.F_FROM, ZmMsg.owner, null, ZmFileListView.COLWIDTH_OWNER),
		new DwtListHeaderItem(ZmItem.F_FOLDER, ZmMsg.folder, null, ZmFileListView.COLWIDTH_FOLDER)
	);
	return headers;
};

ZmFileListView.prototype._getCellContents =
function(htmlArr, idx, item, field, colIdx, params) {
	if (field == ZmItem.F_SUBJECT) {
		htmlArr[idx++] = AjxStringUtil.htmlEncode(item.name);
	} else if (field == ZmItem.F_SIZE) {
		htmlArr[idx++] = AjxUtil.formatSize(item.size);
	} else if (field == ZmItem.F_FILE_TYPE) {
		var desc = (item instanceof ZmPage) ? ZmMsg.page : null;
		if (!desc) {
			var mimeInfo = item.ct ? ZmMimeTable.getInfo(item.ct) : null;
			desc = mimeInfo ? mimeInfo.desc : "&nbsp;";
		}
		htmlArr[idx++] = desc;
	} else if (field == ZmItem.F_TYPE) {
		var icon = (item instanceof ZmPage) ? "Page" : null;
		if (!icon) {
			var contentType = item.contentType;
			var mimeInfo = contentType ? ZmMimeTable.getInfo(contentType) : null;
			icon = mimeInfo ? mimeInfo.image : "UnknownDoc";
		}
		htmlArr[idx++] = "<div class='Img" + icon + "'></div>";
	} else if (field == ZmItem.F_FROM) {
		var creator = item.creator.split("@");
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
		var notebook = appCtxt.getById(item.folderId);
		htmlArr[idx++] = notebook ? notebook.getPath() : item.folderId;
	} else {
		if (field == ZmItem.F_DATE) {
			item = AjxUtil.createProxy(item);
			item.date = item.modifyDate;
		}
		idx = ZmListView.prototype._getCellContents.apply(this, arguments);
	}
	
	return idx;
};

// listeners

ZmFileListView.prototype._colHeaderActionListener =
function(event) {
  	// TODO
};

//
// Private functions
//

ZmFileListView.__typify =
function(array, type) {
	for (var i = 0; i < array.length; i++) {
		array[i]._type = type;
	}
};

ZmFileListView.prototype._changeListener =
function(ev) {
	var item = ev.item || ev.getDetail("items");
	var items = (item instanceof Array) ? item : [item];
	for(var i in items) {
		this._handleChangeItem(ev,items[i]);
	}
};

ZmFileListView.prototype._handleChangeItem =
function(ev,item) {

	if (ev.handled || !this._handleEventType[item.type] && (this.type != ZmItem.MIXED)) { return; }
	
	if (ev.event == ZmEvent.E_TAGS || ev.event == ZmEvent.E_REMOVE_ALL) {
		DBG.println(AjxDebug.DBG2, "ZmListView: TAG");
		this._setImage(item, ZmItem.F_TAG, item.getTagImageInfo());
	}
	
	if (ev.event == ZmEvent.E_FLAGS) { // handle "flagged" and "has attachment" flags
		DBG.println(AjxDebug.DBG2, "ZmListView: FLAGS");
		var flags = ev.getDetail("flags");
		for (var j = 0; j < flags.length; j++) {
			var flag = flags[j];
			var on = item[ZmItem.FLAG_PROP[flag]];
			if (flag == ZmItem.FLAG_FLAGGED) {
				this._setImage(item, ZmItem.F_FLAG, on ? "FlagRed" : null);
			} else if (flag == ZmItem.FLAG_ATTACH) {
				this._setImage(item, ZmItem.F_ATTACHMENT, on ? "Attachment" : null);
			}
		}
	}
	
	if (ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.E_MOVE) {
		DBG.println(AjxDebug.DBG2, "ZmListView: DELETE or MOVE");
        this.removeItem(item, true);
        this._controller._app._checkReplenishListView = this;
		this._controller._resetToolbarOperations();		
	}
};
