/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2011, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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
