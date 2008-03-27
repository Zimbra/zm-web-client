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

ZmColListView =	function(parent, controller, dropTgt, index) {

	// save data
	//this._folderId = null;
	this._controller = controller;
	var view = ZmController.BRIEFCASE_COLUMN_VIEW;
	controller._currentView = view;//cdel
	ZmListView.call(this, {parent:parent, className:"ZmColListView",
						   view:view, type:ZmItem.DOCUMENT,
						   controller:controller, headerList:this._getHeaderList(parent),
						   dropTgt:dropTgt});
	
	this._colIdx = index;
	// create a action menu for the header list
	
	//adding the listeners in constructors so that we get listener events
	//for all new columns created on fly
	this._controller._addListListeners(this);	
}

ZmColListView.prototype = new ZmListView;
ZmColListView.prototype.constructor = ZmColListView;

ZmColListView.prototype.toString = function() {
	return "ZmColListView";
};

// Constants

ZmColListView.KEY_ID = "_keyId";

// Protected methods

ZmColListView.prototype._getHeaderList =
function(parent) {
	return null;
};

ZmColListView.prototype._getCellContents =
function(htmlArr, idx, item, field, colIdx, params) {
	var contentType = item.contentType;
	if(contentType && contentType.match(/;/)) {
			contentType = contentType.split(";")[0];
	}
	var mimeInfo = contentType ? ZmMimeTable.getInfo(contentType) : null;
	var icon = mimeInfo ? mimeInfo.image : "UnknownDoc" ;
	if(item.isFolder){
		icon = "Folder";
	}

	idx = this._getTable(htmlArr, idx, params);
	idx = this._getRow(htmlArr, idx, item, params);
	
	htmlArr[idx++] = "<td style='vertical-align:middle;' width=20><center>";
	htmlArr[idx++] = AjxImg.getImageHtml(icon);
	htmlArr[idx++] = "</center></td>";
	htmlArr[idx++] = "<td style='vertical-align:middle;'>&nbsp;";
	htmlArr[idx++] = AjxStringUtil.htmlEncode(item.name);
	htmlArr[idx++] = "</td>";

	htmlArr[idx++] = "</tr></table>";

	return idx;
};

// listeners

ZmColListView.prototype._colHeaderActionListener = function(event) {
  	// TODO
};

//
// Private functions
//

ZmColListView.__typify = function(array, type) {
	for (var i = 0; i < array.length; i++) {
		array[i]._type = type;
	}
};

ZmColListView.prototype.getTitle =
function() {
	//TODO: title is the name of the current folder
	return [ZmMsg.zimbraTitle, this._controller.getApp().getDisplayName()].join(": ");
};

ZmColListView.prototype.set =
function(folderId) {
	this._folderId = folderId;
	var element = this.getHtmlElement();
	
	var items = this._controller.getItemsInFolderFromCache(folderId);

	var list = new AjxVector();
	for(var i in items){
		list.add(items[i]);
	}

	DwtListView.prototype.set.call(this,list);	

	//cdel
	if(!this._controller.isRefreshing()){
		this._controller._currentFolder = folderId;
		this._controller._object = folderId;
	}
	//this.parent.updateColumn(this,folderId);
};

ZmColListView.prototype._itemClicked =
function(clickedEl, ev) {
	this._controller._listView[ZmController.BRIEFCASE_COLUMN_VIEW] = this;
	ZmListView.prototype._itemClicked.call(this,clickedEl,ev);
	var items = this.getSelection();
	
	this.parent.removeChildColumns(this._colIdx);
	this.parent.setCurrentListView(this);				
	if(items && items.length ==1){
		if(items[0].isFolder){
			this.parent.expandFolder(items[0].id);
		}else{
			this.parent.showFileProps(items[0]);
		}
	}
};

ZmColListView.prototype._resetColWidth =
function() {
	return;
};

ZmColListView.prototype.getColumnIndex =
function() {
	return this._colIdx;
};

ZmColListView.prototype.setNextColumn =
function(listView) {
	this._nextColumn = listView;	
};

ZmColListView.prototype.getNextColumn =
function( ) {
	return this._nextColumn;
};

ZmColListView.prototype.setPreviousColumn =
function(listView){
	this._previousColumn = listView;
};

ZmColListView.prototype.getPreviousColumn =
function( ) {
	return this._previousColumn;
};

ZmColListView.prototype._mouseOverAction =
function(ev, div) {
	DwtListView.prototype._mouseOverAction.call(this, ev, div);
	var id = ev.target.id || div.id;
	if (!id) return true;
	
	if (div) {
		var item = this.getItemFromElement(div);
		if(item && !item.isFolder){
		this.setToolTipContent(this._getToolTip(item, ev, div));
		}
	}		
	return true;
};

ZmColListView.prototype._getToolTip =
function(item, ev, div) {
	if (!item) { return; }
	return this._controller.getItemTooltip(item, this);
};