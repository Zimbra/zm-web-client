/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
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

ZmDetailListView = 	function(parent, controller, dropTgt) {

	// save data
	//this._folderId = null;
	this._controller = controller;

	// call super constructor
	var headerList = this._getHeaderList(parent);
	var view = ZmController.BRIEFCASE_VIEW;
	ZmListView.call(this, parent, "ZmBriefcaseDetailListView", DwtControl.ABSOLUTE_STYLE, view, ZmItem.DOCUMENT, controller, headerList, dropTgt);

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

ZmDetailListView.prototype = new ZmListView;
ZmDetailListView.prototype.constructor = ZmDetailListView;

ZmDetailListView.prototype.toString = function() {
	return "ZmDetailListView";
};

// Constants

ZmDetailListView.KEY_ID = "_keyId";

ZmDetailListView.COLWIDTH_ICON 			= 20;
ZmDetailListView.COLWIDTH_NAME			= 160;
ZmDetailListView.COLWIDTH_TYPE			= 80;
ZmDetailListView.COLWIDTH_SIZE 			= 45;
ZmDetailListView.COLWIDTH_DATE 			= 80;
ZmDetailListView.COLWIDTH_OWNER			= 80;
ZmDetailListView.COLWIDTH_FOLDER			= 100;

// Protected methods

ZmDetailListView.prototype._getHeaderList = function(parent) {
	// Columns: tag, name, type, size, date, owner, folder
	var headers = [];
	
	if (appCtxt.get(ZmSetting.SHOW_SELECTION_CHECKBOX)) {
		headers.push(new DwtListHeaderItem(ZmItem.F_SELECTION, null, "TaskCheckbox", ZmListView.COL_WIDTH_ICON, null, null, null, ZmMsg.selection));
	}	
	if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		headers.push(
			new DwtListHeaderItem(ZmItem.F_TAG, null, "Tag", ZmDetailListView.COLWIDTH_ICON, null, null, true, ZmMsg.tag)
		);
	}	
	headers.push(
		// new DwtListHeaderItem(id, label, icon, width, sortable, resizeable, visible, tt)
		new DwtListHeaderItem(ZmItem.F_TYPE, null, "Globe", ZmDetailListView.COLWIDTH_ICON, null, null, true, null),
		new DwtListHeaderItem(ZmItem.F_SUBJECT, ZmMsg._name, null, ZmDetailListView.COLWIDTH_NAME, null, true, true, null),
		new DwtListHeaderItem(ZmItem.F_FILE_TYPE, ZmMsg.type, null, ZmDetailListView.COLWIDTH_TYPE, null, null, true, null),
		new DwtListHeaderItem(ZmItem.F_SIZE, ZmMsg.size, null, ZmDetailListView.COLWIDTH_SIZE, null, null, true, null),
		new DwtListHeaderItem(ZmItem.F_DATE, ZmMsg.date, null, ZmDetailListView.COLWIDTH_DATE, null, null, true, null),
		new DwtListHeaderItem(ZmItem.F_FROM, ZmMsg.owner, null, ZmDetailListView.COLWIDTH_OWNER, null, null, true, null),
		new DwtListHeaderItem(ZmItem.F_FOLDER, ZmMsg.folder, null, ZmDetailListView.COLWIDTH_FOLDER, null, null, true, null)
	);
	return headers;
};

ZmDetailListView.prototype._getCellAttrText =
function(item, field, params) {
	if (field == ZmItem.F_SIZE) {
		return "align='right'";
	} else if (field == ZmItem.F_TYPE) {
		return "align='middle'";
	}
};

ZmDetailListView.prototype._getCellContents =
function(htmlArr, idx, item, field, colIdx, params) {

	if (field == ZmItem.F_SELECTION) {
		var icon = params.bContained ? "TaskCheckboxCompleted" : "TaskCheckbox";
		idx = this._getImageHtml(htmlArr, idx, icon, this._getFieldId(item, field));
	} else if (field == ZmItem.F_SUBJECT) {
		htmlArr[idx++] = AjxStringUtil.htmlEncode(item.name);
	} else if (field == ZmItem.F_SIZE) {
		if(!item.isFolder){
			htmlArr[idx++] = AjxUtil.formatSize(item.size);
		}
	} else if (field == ZmItem.F_FILE_TYPE) {
		var desc = null;
		if (!desc) {
			var mimeInfo = item.ct ? ZmMimeTable.getInfo(item.ct) : null;
			desc = mimeInfo ? mimeInfo.desc : "&nbsp;";
		}
		htmlArr[idx++] = desc;
	} else if (field == ZmItem.F_TYPE) {
		var icon = null;
		if (!icon) {
			var contentType = item.contentType;
			if(contentType && contentType.match(/;/)) {
				contentType = contentType.split(";")[0];
			}
			var mimeInfo = contentType ? ZmMimeTable.getInfo(contentType) : null;
			icon = mimeInfo ? mimeInfo.image : "UnknownDoc" ;
			if(item.isFolder){
				icon = "Folder";
			}

		}
		htmlArr[idx++] = "<div class='Img" + icon + "'></div>";
	} else if (field == ZmItem.F_FROM) {
		var creator = item.creator? item.creator.split("@") : [""];
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
		var path = notebook ? notebook.getPath() : item.folderId;
		htmlArr[idx++] = path;
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

ZmDetailListView.prototype._colHeaderActionListener = function(event) {
  	// TODO
};

//
// Private functions
//

ZmDetailListView.__typify = function(array, type) {
	for (var i = 0; i < array.length; i++) {
		array[i]._type = type;
	}
};

ZmDetailListView.prototype.getTitle =
function() {
	//TODO: title is the name of the current folder
	return [ZmMsg.zimbraTitle, this._controller.getApp().getDisplayName()].join(": ");
};

ZmDetailListView.prototype.set =
function(folderId) {
	var element = this.getHtmlElement();
	var items = this._controller.getItemsInFolderFromCache(folderId);

	var list = new AjxVector();
	for(var i in items){
		list.add(items[i]);
	}
	DwtListView.prototype.set.call(this,list);		
};

//for ZimbraDnD to do make even more generic
ZmDetailListView.prototype.processUploadFiles = function() {
    var ulEle = document.getElementById('zdnd_ul');
    var files = [];
    if (ulEle);
    {
        for (var i = 0; i < ulEle.childNodes.length; i++)
        {
            var liEle = ulEle.childNodes[i];
            var inputEle = liEle.childNodes[0];
            if (inputEle.name != "_attFile_") continue;
            if (!inputEle.value) continue;
            var file = {
                fullname: inputEle.value,
                name: inputEle.value.replace(/^.*[\\\/:]/, "")
            };
            files.push(file);
         }
   }
   return files;
}

ZmDetailListView.prototype.uploadFiles = function(){
    var attachDialog = appCtxt.getUploadDialog();
    this._controller = AjxDispatcher.run("GetBriefcaseController");
    ZmUploadDialog._uploadCallback = this._controller._handleUploadNewItem;
    var files = this.processUploadFiles();
    attachDialog.uploadFiles(files,document.getElementById("zdnd_form"),{id:this._controller._currentFolder});
};
//end zimbradnd