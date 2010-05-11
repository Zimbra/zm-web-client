/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 */

/**
 * Creates a dialog to allow the user to select a recipient address to search on.
 * @class
 * Provides the user a way to search on a recipient when they click on the To:
 * column in Sent or Drafts. That is in place of actual sorting. See bug 6830.
 *
 * @author Conrad Damon
 *
 * @param {DwtComposite}	parent				the parent widget (the shell)
 *
 * @extends		DwtDialog
 */
ZmSelectAddrDialog = function(parent) {

	if (arguments.length == 0) { return; }

	DwtDialog.call(this, {parent:parent, title:"Select an Address", className:"ZmSelectAddrDialog"});

	this.setContent(this._contentHtml());
	this._setupListView();
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okButtonListener));
};

ZmSelectAddrDialog.prototype = new DwtDialog;
ZmSelectAddrDialog.prototype.constructor = ZmQuickAddDialog;

ZmSelectAddrDialog.prototype.toString =
function() {
	return "ZmSelectAddrDialog";
};

ZmSelectAddrDialog.prototype._contentHtml =
function() {
	var html = [];
	var idx = 0;
	html[idx++] = "<table cellpadding=0 cellspacing=0 border=0";
	html[idx++] = (AjxEnv.isSafari) ? " width='300'>" : ">";
	html[idx++] = AjxTemplate.expand("share.Dialogs#ZmSelectAddrDialog", {id:this._htmlElId});
	html[idx++] = "</table>";
	return html.join("");
};

ZmSelectAddrDialog.prototype._setupListView =
function() {
	var id = this._htmlElId + "_addrListTd";
	var td = document.getElementById(id);
	if (td) {
		var lv = this._listView = new ZmAddrListView(this);
		lv.setMultiSelect(false);
		lv.reparentHtmlElement(td);
	}
};

/**
 * Populates the list view before showing the dialog.
 *
 * @param {array}		addrs			list of AjxEmailAddress to show user
 * @param {string}		folderId		ID of outbound folder
 */
ZmSelectAddrDialog.prototype.popup =
function(addrs, folderId) {

	if (!(addrs && addrs.length)) {
		var d = appCtxt.getMsgDialog();
		d.setMessage(ZmMsg.selectAddrNone, DwtMessageDialog.CRITICAL_STYLE);
		d.popup();
		return;
	}

	this._addrs = [];
	this._folderId = folderId;
	var used = {}, id = 1;
	for (var i = 0, len = addrs.length; i < len; i++) {
		var addr = addrs[i];
		var email = addr.getAddress();
		// remove duplicates
		if (!used[email]) {
			addr.id = id++;
			this._addrs.push(addr);
			used[email] = true;
		}
	}
	this._addrs.sort(AjxEmailAddress.sortCompareByAddress);
	this._listView.set(AjxVector.fromArray(this._addrs));
	this._listView.setSelection(this._addrs[0]);

	DwtDialog.prototype.popup.call(this);
};

/**
 * @private
 */
ZmSelectAddrDialog.prototype._okButtonListener =
function() {

	var sel = this._listView.getSelection();
	if (sel && sel.length) {
		var folder = ZmFolder.QUERY_NAME[this._folderId];
		var query = "in:" + folder + " to:" + sel[0].getAddress();
		appCtxt.getSearchController().search({query:query});
	}
	this.popdown();
};

/**
 * Creates the address list view.
 * @class
 * This class represents the address list view.
 *
 * @param	{DwtComposite}	parent		the parent widget
 *
 * @extends		DwtListView
 * 
 * @private
 */
ZmAddrListView = function(parent) {

	var headerList = this._getHeaderList();
	DwtListView.call(this, {parent:parent, headerList:headerList, view:"ALV"});
};

ZmAddrListView.COL_NAME	= "na";
ZmAddrListView.COL_ADDR	= "ad";

ZmAddrListView.prototype = new DwtListView;
ZmAddrListView.prototype.constructor = ZmAddrListView;

ZmAddrListView.prototype.toString =
function() {
	return "ZmAddrListView";
};

ZmAddrListView.prototype._getHeaderList =
function() {
	return [
		(new DwtListHeaderItem({field:ZmAddrListView.COL_NAME, text:ZmMsg.name, width:ZmMsg.COLUMN_WIDTH_NAME_SD})),
		(new DwtListHeaderItem({field:ZmAddrListView.COL_ADDR, text:ZmMsg.address}))
	];
};

ZmAddrListView.prototype._getCellContents =
function(html, idx, item, field, colIdx, params) {
	if (field == ZmAddrListView.COL_NAME) {
		html[idx++] = AjxStringUtil.htmlEncode(item.getName());
	} else if (field == ZmAddrListView.COL_ADDR) {
		html[idx++] = AjxStringUtil.htmlEncode(item.getAddress());
	}

	return idx;
};
