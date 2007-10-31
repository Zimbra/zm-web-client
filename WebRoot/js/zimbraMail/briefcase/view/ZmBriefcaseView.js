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
ZmBriefcaseView = function(parent, controller, dropTgt) {
	// call super constructor
	var headerList = null;//no headers for this view
	var view = ZmController.BRIEFCASE_VIEW;
	ZmListView.call(this, parent, "ZmBriefcaseView", DwtControl.ABSOLUTE_STYLE, view, ZmItem.DOCUMENT, controller, headerList, dropTgt);
	
	this._controller = controller;

	this._USE_IFRAME = true;

	this._setMouseEventHdlrs(); // needed by object manager
	this._setAllowSelection();
	
	this.setDropTarget(dropTgt);
//	this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
//	this.setDragSource(this._dragSrc);
}
ZmBriefcaseView.prototype = new ZmListView;
ZmBriefcaseView.prototype.constructor = ZmBriefcaseView;

ZmBriefcaseView.prototype.toString =
function() {
	return "ZmBriefcaseView";
};

// Data

ZmBriefcaseView.prototype._controller;

// Public methods

ZmBriefcaseView.prototype.getController =
function() {
	return this._controller;
};

ZmBriefcaseView.prototype._createItemHtml =
function(item, params) {
	
	var name = item.name;
	var contentType = item.contentType;
	
	if(contentType && contentType.match(/;/)) {
			contentType = contentType.split(";")[0];
	}
	var mimeInfo = contentType ? ZmMimeTable.getInfo(contentType) : null;
	icon = "Img" + ( mimeInfo ? mimeInfo.imageLarge : "UnknownDoc_48");

	if(item.isFolder) {
		icon = "ImgBriefcase_48";
	}
	
	if(name.length>14){
		name = name.substring(0,14)+"...";
	}
	
	var div = document.createElement("div");
	div.className = "ZmBriefcaseItem";
	
	var div1 = document.createElement("div");
	div1.className = "ZmThumbnailItem";
	
	var div2 = document.createElement("div");
	div2.className = icon+" ZmThumbnailIcon";
	
	div1.appendChild(div2);
	div.appendChild(div1);
	
	var div2 = document.createElement("div");
	div2.className = "ZmThumbnailName";
	
	var span = document.createElement("span");
	
	if(item instanceof ZmBriefcaseItem){
		span.innerHTML = ["<a href='",item.restUrl,"' target='_blank'>",name,"</a>"].join("");
	}else{
		span.innerHTML = item;
	}
	
	div2.appendChild(span);
	div.appendChild(div2);
	
	if (params.isDragProxy) {
		Dwt.setPosition(div, Dwt.ABSOLUTE_STYLE);
	}
	
	this.associateItemWithElement(item, div, DwtListView.TYPE_LIST_ITEM);
	return div;
};

ZmBriefcaseView.prototype._itemClicked =
function(clickedEl, ev) {
	
	this._selectedClass = "ZmBriefcaseItemSelected";
	this._kbFocusClass = "ZmBriefcaseItemFocused";
	this._normalClass = "ZmBriefcaseItem";
	this._disabledSelectedClass = "ZmBriefcaseItemDisabledSelect";
	this._rightClickClass = "ZmBriefcaseItemSelected";
	this._styleRe = new RegExp(
        "\\b(" +
        [   this._disabledSelectedClass,
            this._selectedClass,
            this._kbFocusClass,
            this._dndClass,
            this._rightClickClass//,
//          this._normalClass
        ].join("|") +
        ")\\b", "g"
    );
    
	DwtListView.prototype._itemClicked.call(this,clickedEl,ev);
	return;
};


ZmBriefcaseView.prototype.setSelectedItems =
function(selectedArray) {
	this.deselectAll();
	var sz = selectedArray.length;
	for (var i = 0; i < sz; ++i) {
		var el = this._getElFromItem(selectedArray[i]);
		if (el) {
			this._selectedItems.add(el);
		}
	}
};

ZmBriefcaseView.prototype.set =
function(folderId) {
	var element = this.getHtmlElement();
	var items = this._controller.getItemsInFolderFromCache(folderId);

	var list = new AjxVector();
	for(var i in items){
		list.add(items[i]);
	}
	DwtListView.prototype.set.call(this,list);	
	
};

ZmBriefcaseView.prototype.getTitle =
function() {
	//TODO: title is the name of the current folder
	return [ZmMsg.zimbraTitle].join(": ");
};

ZmBriefcaseView.prototype.getContent =
function() {
	return this.getHtmlElement().innerHTML;
};

ZmBriefcaseView.prototype.setBounds =
function(x, y, width, height) {
	ZmListView.prototype.setBounds.call(this, x, y, width, height);	
};

// Protected methods

ZmBriefcaseView.prototype._createHtml = function() {
	var element = this.getHtmlElement();
	Dwt.setScrollStyle(element, Dwt.SCROLL);
};

ZmBriefcaseView.prototype.enableToolbar = function(enable){
	var toolbar = this._controller._toolbar[view._controller._currentView];
	toolbar.enable([ZmOperation.TAG_MENU, ZmOperation.DELETE], enable);
};

ZmBriefcaseView.prototype.onDelete = function(){

	var controller = this._controller;
	var object = controller._object;

};


ZmBriefcaseView.prototype.refresh = function(restUrl){
};

ZmBriefcaseView.prototype._getToolTip =
function(field, item, ev, div, match) {
	if (!item) { return; }
	var tooltip = item.name;	
	return tooltip;
};


ZmBriefcaseView.prototype._mouseOverAction =
function(ev, div) {
	DwtListView.prototype._mouseOverAction.call(this, ev, div);
	var id = ev.target.id || div.id;
	if (!id) return true;
	
	var match = this._parseId(id);
	if (match) {
		var item = this.getItemFromElement(div);
		if(item){
		this.setToolTipContent(this._getToolTip(match.field, item, ev, div, match));
		}
	}		
	return true;
};

ZmBriefcaseView.prototype._mouseDownListener =
function(ev) {
	DwtListView.prototype._mouseDownListener.call(this,ev);	
	if(this._dndSelection==null){
	this.deselectAll();	
	this._controller._resetOpForCurrentView();
	}
};

ZmBriefcaseView.prototype._updateDragSelection =
function(row, select) {
    // TODO: new style to mark drop target  
};

ZmBriefcaseView.prototype._addRow =
function(row, index) {
	if (!row) { return; }

	// bug fix #1894 - check for childNodes length otherwise IE barfs
	var len = this._parentEl.childNodes.length;

    if (index != null && len > 0 && index != len) {
        var childNodes = this._parentEl.childNodes;
        this._parentEl.insertBefore(row, childNodes[index]);
    } else {
		this._parentEl.appendChild(row);
	}
};

ZmBriefcaseView.prototype.deselectAll =
function() {
	var a = this._selectedItems.getArray();
	var sz = this._selectedItems.size();
	for (var i = 0; i < sz; i++) {
        Dwt.delClass(a[i], this._styleRe, this._normalClass);
    }
    this._selectedItems.removeAll();
	this._selAnchor = null;

	if (this._kbAnchor != null && this.hasFocus())
		Dwt.addClass(this._kbAnchor, this._kbFocusClass);
};

//for ZimbraDnD to do make even more generic
ZmBriefcaseView.prototype.processUploadFiles = function() {
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

ZmBriefcaseView.prototype.uploadFiles = function(){
    var attachDialog = appCtxt.getUploadDialog();
    this._controller = AjxDispatcher.run("GetBriefcaseController");
    ZmUploadDialog._uploadCallback = this._controller._handleUploadNewItem;
    var files = this.processUploadFiles();
    attachDialog.uploadFiles(files,document.getElementById("zdnd_form"),{id:this._controller._currentFolder});
};
//End ZimbraDnD