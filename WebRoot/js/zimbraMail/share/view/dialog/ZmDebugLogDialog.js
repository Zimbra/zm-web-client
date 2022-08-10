/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2010, 2011, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a dialog for showing debug log messages.
 * @class
 * This class represents a dialog for showing debug log messages.
 *
 * @param	{DwtControl}	shell		the parent
 *
 * @extends		DwtDialog
 */
ZmDebugLogDialog = function(parent) {

	var title = ZmMsg.debugLog;
	var emailButton = new DwtDialog_ButtonDescriptor(ZmDebugLogDialog.EMAIL_BUTTON, ZmMsg.sendAsEmail, DwtDialog.ALIGN_LEFT);
	var clearButton = new DwtDialog_ButtonDescriptor(ZmDebugLogDialog.CLEAR_BUTTON, ZmMsg.clear, DwtDialog.ALIGN_LEFT);
	DwtDialog.call(this, {parent:parent, title:title, standardButtons:[DwtDialog.OK_BUTTON],
						  extraButtons: [emailButton, clearButton]});

	this.setButtonListener(ZmDebugLogDialog.EMAIL_BUTTON, new AjxListener(this, this._handleEmailButton));
	this.setButtonListener(ZmDebugLogDialog.CLEAR_BUTTON, new AjxListener(this, this._handleClearButton));

	this._setAllowSelection();
	this.setContent(this._contentHtml());
};

ZmDebugLogDialog.prototype = new DwtDialog;
ZmDebugLogDialog.prototype.constructor = ZmDebugLogDialog;

ZmDebugLogDialog.EMAIL_BUTTON = "EMAIL";
ZmDebugLogDialog.CLEAR_BUTTON = "CLEAR";

// Public methods

/**
 * Pops-up the dialog.
 *
 * @param	{string}		content		text to display
 * @param	{constant}		type		logging type (see AjxDebug)
 */
ZmDebugLogDialog.prototype.popup =
function(content, type) {

	this._logType = type;
	this.setTitle(AjxMessageFormat.format(ZmMsg.debugLog, [type]));
	var div = document.getElementById(this._descDivId);
	if (div) {
		var size = AjxDebug.BUFFER_MAX[type];
		div.innerHTML = AjxMessageFormat.format(ZmMsg.debugLogDesc, [size, type]);
	}
	div = document.getElementById(this._contentDivId);
	if (div) {
		div.innerHTML = content;
	}

	DwtDialog.prototype.popup.call(this);
};

// Protected methods

ZmDebugLogDialog.prototype._contentHtml =
function() {

	this._descDivId = this._htmlElId + "_desc";
	this._contentDivId = this._htmlElId + "_log";

	return AjxTemplate.expand("share.Widgets#ZmDebugLogDialog", {id:this._htmlElId});
};

ZmDebugLogDialog.prototype._handleEmailButton =
function(event) {
	this.popdown();
	var div = document.getElementById(this._contentDivId);
	var text = AjxStringUtil.convertHtml2Text(div);
	var params = {action:ZmOperation.NEW_MESSAGE, subjOverride:ZmMsg.debugLogEmailSubject,
				  composeMode: Dwt.TEXT, extraBodyText:text};
	appCtxt.getApp(ZmApp.MAIL).compose(params);
};

ZmDebugLogDialog.prototype._handleClearButton =
function(event) {
	AjxDebug.BUFFER[this._logType] = [];
	var div = document.getElementById(this._contentDivId);
	div.innerHTML = "";
};
