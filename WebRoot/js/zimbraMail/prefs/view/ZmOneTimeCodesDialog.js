/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2015, 2016 Synacor, Inc. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a dialog for
 * @constructor
 * @class
 * @author  Hem Aravind
 *
 * @extends	DwtDialog
 */
ZmOneTimeCodesDialog = function(params) {
	this.twoStepAuthCodesSpan = params.twoStepAuthCodesSpan;
	this.twoStepAuthCodesViewLink = params.twoStepAuthCodesViewLink;
	this.twoStepAuthCodesGenerateLink = params.twoStepAuthCodesGenerateLink;
	var generateNewCodesButton = new DwtDialog_ButtonDescriptor(ZmOneTimeCodesDialog.GENERATE_NEW_CODES_BUTTON, ZmMsg.twoStepAuthGenerateNewCodes, DwtDialog.ALIGN_LEFT, this._getScratchCodes.bind(this, true));
	var printButton = new DwtDialog_ButtonDescriptor(ZmOneTimeCodesDialog.PRINT_BUTTON, ZmMsg.print, DwtDialog.ALIGN_RIGHT, this._printListener.bind(this));
	var closeButton = new DwtDialog_ButtonDescriptor(DwtDialog.DISMISS_BUTTON, ZmMsg.cancel, DwtDialog.ALIGN_RIGHT, this.popdown.bind(this));
	var newParams = {
		parent : appCtxt.getShell(),
		title : ZmMsg.twoStepAuthOneTimeCodesTitle,
		standardButtons: [DwtDialog.NO_BUTTONS],
		extraButtons : [generateNewCodesButton, printButton, closeButton]
	};
	DwtDialog.call(this, newParams);
	this.setContent(this._contentHtml());
	this._setAllowSelection();
};

ZmOneTimeCodesDialog.prototype = new DwtDialog;
ZmOneTimeCodesDialog.prototype.constructor = ZmOneTimeCodesDialog;

ZmOneTimeCodesDialog.GENERATE_NEW_CODES_BUTTON = ++DwtDialog.LAST_BUTTON;
ZmOneTimeCodesDialog.PRINT_BUTTON = ++DwtDialog.LAST_BUTTON;

/**
 * Pops-up the dialog.
 */
ZmOneTimeCodesDialog.prototype.popup =
function() {
	this._getScratchCodes();
	DwtDialog.prototype.popup.call(this);
};

ZmOneTimeCodesDialog.prototype._getScratchCodes =
function(isNew) {
	var params = {
		twoStepAuthCodesSpan : this.twoStepAuthCodesSpan,
		twoStepAuthCodesViewLink : this.twoStepAuthCodesViewLink,
		twoStepAuthCodesGenerateLink : this.twoStepAuthCodesGenerateLink
	};
	var callback = this._getScratchCodesCallback.bind(this);
	ZmAccountsPage.getScratchCodes(isNew, params, callback);
};

ZmOneTimeCodesDialog.prototype._getScratchCodesCallback =
function(scratchCode) {
	this.setContent(this._contentHtml(scratchCode));
};

ZmOneTimeCodesDialog.prototype._printListener =
function() {
	var content = AjxTemplate.expand("prefs.Pages#OneTimeCodesPrint", {content : this._getContentDiv().innerHTML});
	var win = window.open('', '_blank');
	appCtxt.handlePopupBlocker(win);
	win.document.write(content);
	win.document.close();
	win.focus();
	win.print();
};

ZmOneTimeCodesDialog.prototype._contentHtml =
function(oneTimeCodes) {
	var data = {
		id : this._htmlElId,
		oneTimeCodes : oneTimeCodes
	};
	return AjxTemplate.expand("prefs.Pages#OneTimeCodes", data);
};