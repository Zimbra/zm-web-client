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
 * The Original Code is: Zimbra Collaboration Suite.
 *
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

/**
* show history of the status window
* @param parent			the element that created this view
*/
function ZmStatusHistoryDialog(parent, appCtxt) {

	DwtDialog.call(this, parent, null, null, [DwtDialog.OK_BUTTON]);

	this._appCtxt = appCtxt;
	this.setContent(this._contentHtml());
	this.setTitle(ZmMsg.statusHistory);	
};

ZmStatusHistoryDialog.prototype = new DwtDialog;
ZmStatusHistoryDialog.prototype.constructor = ZmStatusHistoryDialog;


ZmStatusHistoryDialog.ID_DATE		= "d--";
ZmStatusHistoryDialog.ID_MESSAGE 	= "m--";

// Public methods

ZmStatusHistoryDialog.prototype.toString = 
function() {
	return "ZmStatusHistoryDialog";
};


ZmStatusHistoryDialog.prototype._contentHtml = 
function() {
	this._listId = Dwt.getNextId();

	var html = new AjxBuffer();
	html.append("<div class='ZmStatusHistory' id='",this._listId,"'>");
	return html.toString();
};

ZmStatusHistoryDialog.prototype._createListView = 
function(listViewId) {
	var listView = new ZmStatusHistoryListView(this);
	var listDiv = document.getElementById(listViewId);
 	listDiv.appendChild(listView.getHtmlElement());
	var size = Dwt.getSize(listDiv);
	listView.setSize(size.x, size.y);
//	var defaultSortCol = bExtendedHeader ? null : ZmItem.F_PARTICIPANT;
//	listView.setUI(defaultSortCol);
	listView._initialized = true;
	return listView;
};

ZmStatusHistoryDialog.prototype.initialize = 
function(historyVector) {
	if (this._listView == null) {
		this._listView = this._createListView(this._listId);
	}
	this._listView.set(historyVector);
};

//-----------------------------------------

function ZmStatusHistoryListView(parent) {
	
	DwtListView.call(this, parent, null, null, this._getHeaderList(parent));
//	this.view = view;
//	this.type = ZmItem.CONTACT;
//	this._extHeader = bExtHeader || false;
};

ZmStatusHistoryListView.prototype = new DwtListView;
ZmStatusHistoryListView.prototype.constructor = ZmStatusHistoryListView;

ZmStatusHistoryListView.prototype.toString = 
function() {
	return "ZmStatusHistoryListView";
};

ZmStatusHistoryListView.prototype.setSize =
function(width, height) {
	DwtListView.prototype.setSize.call(this, width, height);
	this._sizeChildren(width, height);
};

ZmStatusHistoryListView.prototype.setBounds =
function(x, y, width, height) {
	DwtListView.prototype.setBounds.call(this, x, y, width, height);
	this._sizeChildren(width, height);
};

ZmStatusHistoryListView.prototype._sizeChildren =
function(width, height) {
	if (this._listDiv) {
		Dwt.setSize(this._listDiv, Dwt.DEFAULT, this.getHtmlElement().clientHeight - DwtListView.HEADERITEM_HEIGHT);
		this._listDiv.style.overflow = 'auto';
	}
};

ZmStatusHistoryListView.prototype._setNoResultsHtml = 
function() {
/*
	// ignore if target list view
	if (this._initialized)
		DwtListView.prototype._setNoResultsHtml.call(this);
		*/
};

// The items are work objects from ZmStatusView
ZmStatusHistoryListView.prototype._createItemHtml =
function(item) {

	var doc = this.getDocument();
	var div = doc.createElement("div");
	div._styleClass = "Row";
	div._selectedStyleClass = div._styleClass + '-' + DwtCssStyle.SELECTED;
	div.className = div._styleClass;
			
	var html = new Array();
	var idx = 0;

	html[idx++] = "<table cellpadding=0 cellspacing=0 border=0 width=100%><tr>";
	
	for (var i = 0; i < this._headerList.length; i++) {
		var id = this._headerList[i]._id;
		if (id.indexOf(ZmStatusHistoryDialog.ID_DATE) == 0) {
			html[idx++] = "<td width=" + this._headerList[i]._width + ">&nbsp;" + AjxDateUtil.getTimeStr(item.date,"%n/%d %H:%m:%s %P") + "</td>";			
		} else if (id.indexOf(ZmStatusHistoryDialog.ID_MESSAGE) == 0) {
			html[idx++] = "<td class='"+ZmStatusView.getClass(item)+"'>&nbsp;" + item.msg + "</td>";			
		}
	}

	html[idx++] = "</tr></table>";
		
	div.innerHTML = html.join("");
		
	this.associateItemWithElement(item, div, DwtListView.TYPE_LIST_ITEM, Dwt.getNextId());
		
	return div;
};

ZmStatusHistoryListView.prototype._getHeaderList = 
function(parent) {

	var headerList = new Array();

	var sortBy = null;
	headerList.push(new DwtListHeaderItem(ZmStatusHistoryDialog.ID_DATE, ZmMsg.date, null, 100, sortBy));
	headerList.push(new DwtListHeaderItem(ZmStatusHistoryDialog.ID_MESSAGE, ZmMsg.message));
	
	return headerList;
};
