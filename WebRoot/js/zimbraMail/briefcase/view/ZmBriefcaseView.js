/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */
ZmBriefcaseView = function(parent, appCtxt, controller, dropTgt) {
	// call super constructor
	var headerList = null;//no headers for this view
	var view = ZmController.BRIEFCASE_VIEW;
	ZmListView.call(this, parent, "ZmBriefcaseView", DwtControl.ABSOLUTE_STYLE, view, ZmItem.DOCUMENT, controller, headerList, dropTgt);
	
	this._appCtxt = appCtxt;
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

ZmBriefcaseView.prototype._appCtxt;
ZmBriefcaseView.prototype._controller;

// Public methods

ZmBriefcaseView.prototype.getController =
function() {
	return this._controller;
};

ZmBriefcaseView.FILE_EXT = {
	ppt: "ImgMSPowerpointDoc_48",
	doc: "ImgMSWordDoc_48",
	xls: "ImgMSExcelDoc_48",
	zip: "ImgZipDoc_48",
	pdf: "ImgPDFDoc_48",
	exe: "ImgExeDoc_48"
};

ZmBriefcaseView.prototype._createItemHtml =
function(item, params) {
	
	var name = item.name;
	var icon =  "ImgUnknownDoc_48";
	
	var idx = name.indexOf(".");
	if(idx>0){
		var ext = name.substring(idx+1);	
		var tmpIcon = ZmBriefcaseView.FILE_EXT[ext];
			if(tmpIcon){
			icon = tmpIcon;
			}
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
		span.innerHTML = ["<a href='",item.restUrl,"' target='_blank'>",item.name,"</a>"].join("");
	}else{
		span.innerHTML = item;
	}
	
	div2.appendChild(span);
	div.appendChild(div2);
	
	if (params.isDnDIcon) {
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
            this._rightClickClass,
            this._normalClass
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
            //Dwt.delClass(el, this._styleRe, this.getEnabled() ? this._selectedClass : this._disabledSelectedClass);
			//if (this._kbAnchor == el && this.hasFocus())
			//Dwt.addClass(el, this._kbFocusClass);
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

ZmBriefcaseView.getPrintHtml =
function(page, appCtxt) {
	if (!ZmBriefcaseView._objectMgr) {
		ZmBriefcaseView._objectMgr = new ZmObjectManager(null, appCtxt, null, true);
		var handler = new ZmNotebookObjectHandler(this._appCtxt);
		ZmBriefcaseView._objectMgr.addHandler(handler, ZmNotebookObjectHandler.TYPE, 1);
		ZmBriefcaseView._objectMgr.sortHandlers();
	}
	var html = ZmBriefcaseView._generateContent(page, appCtxt);
	var node = Dwt.parseHtmlFragment("<div>" + html + "</div>");
	ZmBriefcaseView._fixLinks(node);
	ZmBriefcaseView._findObjects(ZmBriefcaseView._objectMgr, node);
	return node.innerHTML;
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

/*
ZmBriefcaseView.prototype.getSelection =
function() {
	return [this._controller.getPage()];
};*/

/*ZmBriefcaseView.prototype.addActionListener = function(listener) {  };
ZmBriefcaseView.prototype.handleActionPopdown = function(ev) {  };*/

ZmBriefcaseView.prototype.setBounds =
function(x, y, width, height) {
	ZmListView.prototype.setBounds.call(this, x, y, width, height);	
};

// Protected methods

ZmBriefcaseView._fixLinks =
function(element) {
	var links = element.getElementsByTagName("A");
	for (var i = 0; i < links.length; i++) {
		var link = links[i];
		if (!link.href) continue;

		if (!link.target) {
			link.target = "_new";
		}
	}
};

ZmBriefcaseView._generateContent =
function(page, appCtxt) {
	if (!page) {
		return "";
	}

	var cache = appCtxt.getApp(ZmApp.NOTEBOOK).getNotebookCache();
	var chrome = cache.getPageByName(page.folderId, ZmNotebook.PAGE_CHROME, true);
	var chromeContent = chrome.getContent();

	var content = chromeContent;
	if (page.name != ZmNotebook.PAGE_CHROME) {
		var pageContent = page.getContent();
		content = chromeContent.replace(ZmWiklet.RE_CONTENT, pageContent);
	}
	return ZmWikletProcessor.process(appCtxt, page, content);
};

ZmBriefcaseView._findObjects =
function(objectMgr, element) {
	objectMgr.reset();
	var discard = [];
	var ignore = "nolink";
	objectMgr.processHtmlNode(element, true, discard, ignore);
};

ZmBriefcaseView.prototype._createHtml = function() {
	var element = this.getHtmlElement();
	Dwt.setScrollStyle(element, Dwt.SCROLL);
};

ZmBriefcaseView.prototype.enableToolbar = function(enable){
	var toolbar = this._controller._toolbar[view._controller._currentView];
	toolbar.enable([ZmOperation.TAG_MENU, ZmOperation.DELETE, ZmOperation.PRINT,ZmOperation.SEND_PAGE,ZmOperation.DETACH], enable);
};

ZmBriefcaseView.prototype.onDelete = function(){

	var controller = this._controller;
	var object = controller._object;

};


ZmBriefcaseView.prototype.refresh = function(restUrl){
};

