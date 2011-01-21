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
	var buttons = [ DwtDialog.OK_BUTTON, DwtDialog.NO_BUTTON ];
	var emailButton = new DwtDialog_ButtonDescriptor(ZmDebugLogDialog.EMAIL_BUTTON, ZmMsg.sendAsEmail, DwtDialog.ALIGN_LEFT);
	DwtDialog.call(this, {parent:parent, title:title, standardButtons:[DwtDialog.OK_BUTTON],
						  extraButtons: [emailButton]});

	this.setButtonListener(ZmDebugLogDialog.EMAIL_BUTTON, new AjxListener(this, this._handleEmailButton));

	this._setAllowSelection();
	this.setContent(this._contentHtml());
};

ZmDebugLogDialog.prototype = new DwtDialog;
ZmDebugLogDialog.prototype.constructor = ZmDebugLogDialog;

// Public methods

/**
 * Pops-up the dialog.
 *
 * @param	{string}		content		text to display
 * @param	{constant}		type		logging type (see AjxDebug)
 */
ZmDebugLogDialog.prototype.popup =
function(content, type) {

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
	var params = {action:ZmOperation.NEW_MESSAGE, subjOverride:ZmMsg.debugLogEmailSubject, extraBodyText:text};
	appCtxt.getApp(ZmApp.MAIL).compose(params);
};
