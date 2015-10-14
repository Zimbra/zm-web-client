/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2013, 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an "AS IS" basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2011, 2013, 2014 Zimbra, Inc. All Rights Reserved. 
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 */

/**
 * Creates a Mail Redirect dialog.
 * @class
 * This class represents a Mail Redirect dialog.
 *
 * @param	{DwtControl}	parent		the parent
 * @param	{String}	className		the class name
 *
 * @extends		DwtDialog
 */
ZmMailRedirectDialog = function(parent, className) {
	className = className || "ZmFolderPropsDialog";

    DwtDialog.call(this, {parent:parent, className:className, title:ZmMsg.mailRedirect, id:"RedirectDialog"});

	this.setButtonListener(DwtDialog.CANCEL_BUTTON, this._handleCancelButton.bind(this));

	var recipParams = {};
	recipParams.enableContainerInputs		= this.enableInputs.bind(this);
	recipParams.contactPopdownListener		= this.contactPopdownListener.bind(this);
	recipParams.contextId					= this.toString();
    this._recipients = new ZmRecipients(recipParams);

    this._fieldNames = [AjxEmailAddress.TO];
    var data = { id : this._htmlElId };

    for (var i = 0; i < this._fieldNames.length; i++) {
        var typeStr = AjxEmailAddress.TYPE_STRING[this._fieldNames[i]];
        var ids =  this._recipients.createRecipientIds(this._htmlElId, typeStr)
        data[typeStr + "RowId"]    = ids.row;
        data[typeStr + "PickerId"] = ids.picker;
        data[typeStr + "InputId"]  = ids.control;
        data[typeStr + "CellId"]   = ids.cell;
    }

    var html = AjxTemplate.expand("mail.Message#RedirectDialog", data);
    this.setContent(html);


    this._recipients.createRecipientHtml(this, this._htmlElId, this._htmlElId, this._fieldNames);
    this._tabGroup.addMember(this._recipients.getField(AjxEmailAddress.TO), 0);
};

ZmMailRedirectDialog.prototype = new DwtDialog;
ZmMailRedirectDialog.prototype.constructor = ZmMailRedirectDialog;

ZmMailRedirectDialog.prototype.isZmMailRedirectDialog = true;
ZmMailRedirectDialog.prototype.toString = function() { return "ZmMailRedirectDialog"; };



ZmMailRedirectDialog.prototype.getAddrs =
function() {
	return this._recipients.collectAddrs();
};


/**
 * Pops-up the properties dialog.
 *
 * @param	{ZmOrganizer}	organizer		the organizer
 */
ZmMailRedirectDialog.prototype.popup =
function(mail) {
    this._recipients.setup();

	DwtDialog.prototype.popup.call(this);
};

ZmMailRedirectDialog.prototype._resetTabFocus =
function(){
	this._tabGroup.setFocusMember(this._recipients.getField(AjxEmailAddress.TO), true);
};


ZmMailRedirectDialog.prototype.popdown =
function() {
    this._recipients.reset();
	DwtDialog.prototype.popdown.call(this);
};


// Miscellaneous methods

ZmMailRedirectDialog.prototype.enableInputs =
function(bEnable) {
    this._recipients.enableInputs(bEnable);
};

/**
 * Handles re-enabling inputs if the pop shield is dismissed via
 * Esc. Otherwise, the handling is done explicitly by a callback.
 */
// *** NEEDED??? **** //
ZmMailRedirectDialog.prototype.contactPopdownListener =
function() {
	this.enableInputs(true);
	appCtxt.getAppViewMgr().showPendingView(false);
};

ZmMailRedirectDialog.prototype._handleCancelButton =
function(event) {
	this.popdown();
};
