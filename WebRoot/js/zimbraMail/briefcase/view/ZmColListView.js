/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008 Zimbra, Inc.
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

ZmColListView =	function(parent, controller, dropTgt, index) {

	this._controller = controller;
	var view = ZmId.VIEW_BRIEFCASE_COLUMN;
	controller._currentView = view;
	this._colIdx = index;

	var params = {parent:parent, dropTgt:dropTgt,
				  view:view, id:ZmId.getViewId(view, index), posStyle:DwtControl.STATIC_STYLE,
				  controller:controller, headerList:this._getHeaderList(parent)};
	ZmBriefcaseBaseView.call(this, params);
	
	//adding the listeners in constructors so that we get listener events
	//for all new columns created on fly
	this._controller._addListListeners(this);	
}

ZmColListView.prototype = new ZmBriefcaseBaseView;
ZmColListView.prototype.constructor = ZmColListView;

ZmColListView.prototype.toString = function() {
	return "ZmColListView";
};

// Constants

ZmColListView.KEY_ID = "_keyId";

ZmColListView.prototype.set =
function(list, sortField) {

	var paging = Boolean(this._itemsToAdd);
	ZmBriefcaseBaseView.prototype.set.apply(this, arguments);

	// show subfolders at top since virtual paging makes them hard to see
	if (!paging) {
		var subs = this._controller._getSubfolders();
		if (subs.length) {
			for (var i = subs.length - 1; i >= 0; i--) {
				var div = this._createItemHtml(subs[i]);
				this._addRow(div, 0);
			}
		}
	}
};

// Protected methods

ZmColListView.prototype._getHeaderList =
function(parent) {
	return null;
};

// This list view has no headers, so we create the entire row here
ZmColListView.prototype._getCellContents =
function(htmlArr, idx, item, field, colIdx, params) {

	idx = this._getTable(htmlArr, idx, params);
	idx = this._getRow(htmlArr, idx, item, params);
	
	htmlArr[idx++] = "<td style='vertical-align:middle;' width=20><center>";
	htmlArr[idx++] = AjxImg.getImageHtml(item.getIcon());
	htmlArr[idx++] = "</center></td>";
	htmlArr[idx++] = "<td style='vertical-align:middle;' width='100%' id='" + this._getFieldId(item, ZmItem.F_SUBJECT) + "'>&nbsp;";
	htmlArr[idx++] = AjxStringUtil.htmlEncode(item.name);
	htmlArr[idx++] = "</td>";

    htmlArr[idx++] = "<td style='vertical-align:middle;' width='16' align='right' id='" + this._getFieldId(item,ZmItem.F_SUBJECT)+"'>";
    idx = this._getImageHtml(htmlArr, idx, item.getTagImageInfo(), this._getFieldId(item, ZmItem.F_TAG));
	htmlArr[idx++] = "</td>";

	htmlArr[idx++] = "</tr></table>";

	return idx;
};

ZmColListView.prototype._itemClicked =
function(clickedEl, ev) {

	this.parent.setCurrentListIndex(this._colIdx);
	ZmListView.prototype._itemClicked.call(this,clickedEl,ev);

	if (ev.button == DwtMouseEvent.LEFT) {
		this.parent.removeChildColumns(this._colIdx);
		var items = this.getSelection();
		if (items && items.length == 1) {
			var item = items[0];
			if (item.isFolder) {
				this.parent.expandFolder(item.id);
			} else {
				this.parent.showFileProps(item);
			}
		}
	}
};

ZmColListView.prototype._resetColWidth = function() {};

ZmColListView.prototype._mouseOverAction =
function(ev, div) {
	DwtListView.prototype._mouseOverAction.call(this, ev, div);
	var id = ev.target.id || div.id;
	if (!id) return true;
	
	if (div) {
		var item = this.getItemFromElement(div);
		if(item && !item.isFolder){
		this.setToolTipContent(this._getToolTip({item:item, ev:ev, div:div}));
		}
	}
	return true;
};

ZmColListView.prototype._getScrollDiv =
function() {
	return this.parent._divs[this._colIdx];
};
