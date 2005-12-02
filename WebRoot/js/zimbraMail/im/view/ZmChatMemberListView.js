/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
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
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */
 
function ZmChatMemberListView(parent, bExtHeader) {
	DwtListView.call(this, parent, null, null, this._getHeaderList(parent, bExtHeader));
	this.type = ZmItem.ROSTER_ITEM;
};

ZmChatMemberListView.prototype = new DwtListView;
ZmChatMemberListView.prototype.constructor = ZmChatMemberListView;

ZmChatMemberListView.ID_SHOW_ICON = "i--";
ZmChatMemberListView.ID_NAME = "n--";

ZmChatMemberListView.prototype.toString = 
function() {
	return "ZmChatMemberListView";
};

ZmChatMemberListView.prototype.setSize =
function(width, height) {
	DwtListView.prototype.setSize.call(this, width, height);
	this._sizeChildren(width, height);
};

ZmChatMemberListView.prototype.setBounds =
function(x, y, width, height) {
	DwtListView.prototype.setBounds.call(this, x, y, width, height);
	this._sizeChildren(width, height);
};

ZmChatMemberListView.prototype._sizeChildren =
function(width, height) {
	if (this._listDiv) {
		Dwt.setSize(this._listDiv, Dwt.DEFAULT, this.getHtmlElement().clientHeight - DwtListView.HEADERITEM_HEIGHT);
		this._listDiv.style.overflow = 'auto';
	}
};

ZmChatMemberListView.prototype._setNoResultsHtml = 
function() {
	// ignore if target list view
//	if (this._initialized && !this._extHeader)
//		DwtListView.prototype._setNoResultsHtml.call(this);
};

// The items are ZmRosterItem objects
ZmChatMemberListView.prototype._createItemHtml =
function(item) {

	var doc = this.getDocument();
	var div = doc.createElement("div");
	div._styleClass = "Row";
	div._selectedStyleClass = div._styleClass + '-' + DwtCssStyle.SELECTED;
	div.className = div._styleClass;
			
	var html = new AjxBuffer();

	html.append("<table cellpadding=0 cellspacing=0 border=0 width=100%><tr>");
	for (var i = 0; i < this._headerList.length; i++) {
		var id = this._headerList[i]._id;
		if (id.indexOf(ZmChatMemberListView.ID_SHOW_ICON) == 0) {
			html.append("<td width=", this._headerList[i]._width, ">", AjxImg.getImageHtml(item.getIcon()), "</td>");
		} else if (id.indexOf(ZmChatMemberListView.ID_NAME) == 0) {
			html.append("<td>&nbsp;", item.getName(), "</td>");
		}
	}
	html.append("</tr></table>");
	div.innerHTML = html.toString();
	this.associateItemWithElement(item, div, DwtListView.TYPE_LIST_ITEM);
	return div;
};

ZmChatMemberListView.prototype._getHeaderList = 
function(parent) {
	var headerList = new Array();
    headerList.push(new DwtListHeaderItem(ZmChatMemberListView.ID_SHOW_ICON, null, "ImStartChat", 20, false, false, true));
	headerList.push(new DwtListHeaderItem(ZmChatMemberListView.ID_NAME, ZmMsg.buddy));
	return headerList;
};

ZmChatMemberListView.prototype._itemClicked = 
function(clickedEl, ev) {

	// dont allow right clicks since it doesnt make sense here...
	if (!ev.shiftKey && !ev.ctrlKey && ev.button == DwtMouseEvent.RIGHT) {
		return;
	} else {
		DwtListView.prototype._itemClicked.call(this, clickedEl, ev);
	}
};

// NOTE: this is taken from ZmListView but we no longer derive from it
ZmChatMemberListView.prototype._mouseUpAction =
function(ev, div) {
	var id = (ev.target.id && ev.target.id.indexOf("AjxImg") == -1) ? ev.target.id : div.id;
	if (!id) return true;

	if (ev.button == DwtMouseEvent.LEFT &&
		this._evtMgr.isListenerRegistered(DwtEvent.SELECTION))
	{
		var m = this._parseId(id);
		this._selEv.field = m ? m.field : null;
		this._evtMgr.notifyListeners(DwtEvent.SELECTION, this._selEv);
	}
};

// NOTE: this is taken from ZmListView but we no longer derive from it
ZmChatMemberListView.prototype._parseId =
function(id) {
	var m = id.match(/^V(\d+)_([a-z]?)((DWT)?-?\d+)_?(\d*)$/);
	if (m)
		return {view: m[1], field: m[2], item: m[3], participant: m[5]};
	else
		return null;
};

ZmChatMemberListView.prototype._sortColumn = 
function(columnItem, bSortAsc) {
//	var sortBy = bSortAsc ? ZmSearch.NAME_ASC : ZmSearch.NAME_DESC;
//	this.parent.search(sortBy);
};
