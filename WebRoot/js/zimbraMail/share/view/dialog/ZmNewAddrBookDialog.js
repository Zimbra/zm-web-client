/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006 Zimbra, Inc.
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

function ZmNewAddrBookDialog(parent, msgDialog, className) {
	var title = ZmMsg.createNewAddrBook;
	var type = ZmOrganizer.ADDRBOOK;
	ZmNewOrganizerDialog.call(this, parent, msgDialog, className, title, type);
}

ZmNewAddrBookDialog.prototype = new ZmNewOrganizerDialog;
ZmNewAddrBookDialog.prototype.constructor = ZmNewAddrBookDialog;


// Public methods

ZmNewAddrBookDialog.prototype.toString =
function() {
	return "ZmNewAddrBookDialog";
};


// Protected methods

// overload since we always want to init the color to grey
ZmNewAddrBookDialog.prototype._initColorSelect =
function() {
	var option = this._colorSelect.getOptionWithValue(ZmOrganizer.C_GRAY);
	this._colorSelect.setSelectedOption(option);
};

// overload so we dont show this
ZmNewAddrBookDialog.prototype._createRemoteContentHtml =
function(html, idx) {
	return idx;
};

// overload so we dont show this
ZmNewAddrBookDialog.prototype._createFolderContentHtml =
function(html, idx) {
	return idx;
};
