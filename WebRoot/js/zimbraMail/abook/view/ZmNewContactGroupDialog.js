/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * Creates a new contact group dialog.
 * @class
 * This class represents a new contact group dialog.
 *
 * @param	{DwtControl}	parent		the parent
 * @param	{String}	className		the class name
 *
 * @extends		ZmDialog
 */
ZmNewContactGroupDialog = function(parent, className) {
	ZmDialog.call(this, {parent:parent, className:className, title:ZmMsg.createNewContactGroup, id:"CreateContactGroupDialog"});

	this._setNameField(this._htmlElId+"_name");
	DBG.timePt("set content");
};

ZmNewContactGroupDialog.prototype = new ZmDialog;
ZmNewContactGroupDialog.prototype.constructor = ZmNewContactGroupDialog;

ZmNewContactGroupDialog.prototype.toString =
function() {
	return "ZmNewContactGroupDialog";
};

/**
 * Pops-up the dialog.
 *
 * @param	{ZmOrganizer}	org		the organizer
 * @param	{ZmAccount}		account	the account
 */
ZmNewContactGroupDialog.prototype.popup =
function(org, account) {
	if (this._accountSelect) {
		var acct = account || appCtxt.getActiveAccount();
		this._accountSelect.setSelectedValue(acct.id);
	}

	ZmDialog.prototype.popup.call(this);
};

ZmNewContactGroupDialog.prototype.cleanup =
function(bPoppedUp) {
	DwtDialog.prototype.cleanup.call(this, bPoppedUp);
};


ZmNewContactGroupDialog.prototype._contentHtml =
function() {
	return AjxTemplate.expand("share.Dialogs#ZmContactGroupDialog", {id:this._htmlElId});
};

ZmNewContactGroupDialog.prototype._okButtonListener =
function(ev) {
	var results = this._getContactGroupData();
	if (results) {
		DwtDialog.prototype._buttonListener.call(this, ev, results);
	}
};

ZmNewContactGroupDialog.prototype._getContactGroupData =
function() {
	// check name for presence
	var name = AjxStringUtil.trim(this._nameField.value);
	if (name == "") {
		return this._showError(ZmMsg.errorGroupName);
	}

    var data = {name:name};
    return data;
};

ZmNewContactGroupDialog.prototype._enterListener =
function(ev) {
	var results = this._getContactGroupData();
	if (results) {
		this._runEnterCallback(results);
	}
};

ZmNewContactGroupDialog.prototype._getTabGroupMembers =
function() {
	return [this._nameField];
};
