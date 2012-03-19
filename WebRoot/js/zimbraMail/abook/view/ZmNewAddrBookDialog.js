/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * This file contains the address book dialog class.
 */

/**
 * Creates an address book dialog.
 * @class
 * This class represents the address book dialog.
 * 
 * @param	{DwtControl}	parent		the parent
 * @param	{String}	className		the class name
 * @param	{String}	title		the dialog title
 * @param	{constant}	type		the type
 * 
 * @extends		ZmNewOrganizerDialog
 */
ZmNewAddrBookDialog = function(parent, className) {
	var title = ZmMsg.createNewAddrBook;
	var type = ZmOrganizer.ADDRBOOK;
	ZmNewOrganizerDialog.call(this, parent, className, title, type);
}

ZmNewAddrBookDialog.prototype = new ZmNewOrganizerDialog;
ZmNewAddrBookDialog.prototype.constructor = ZmNewAddrBookDialog;


// Public methods

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmNewAddrBookDialog.prototype.toString =
function() {
	return "ZmNewAddrBookDialog";
};


// Protected methods

/**
 * overload since we always want to init the color to grey.
 * 
 * @private
 */
ZmNewAddrBookDialog.prototype._initColorSelect =
function() {
	var option = this._colorSelect.getOptionWithValue(ZmOrganizer.DEFAULT_COLOR[this._organizerType]);
	this._colorSelect.setSelectedOption(option);
};

/**
 * overload so we dont show this.
 * 
 * @private
 */
ZmNewAddrBookDialog.prototype._createRemoteContentHtml =
function(html, idx) {
	return idx;
};

/**
 * @private
 */
ZmNewAddrBookDialog.prototype._setupFolderControl =
function(){
    ZmNewOrganizerDialog.prototype._setupFolderControl.call(this);
    if (this._omit) {
		this._omit[ZmFolder.ID_TRASH] = true;
		this._omit[ZmFolder.ID_DLS] = true;
	}
};