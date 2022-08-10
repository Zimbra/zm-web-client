/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2010, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a dialog with a list of visible accounts to choose from
 * @class
 * This class represents choose account dialog.
 *
 * @param	{DwtControl}	parent		the parent, usually the global DwtShell
 *
 * @extends		ZmDialog
 */
ZmChooseAccountDialog = function(parent) {
	ZmDialog.call(this, {parent:parent});
	this._createControls();
};

ZmChooseAccountDialog.prototype = new ZmDialog;
ZmChooseAccountDialog.prototype.constructor = ZmChooseAccountDialog;

ZmChooseAccountDialog.prototype.toString =
function() {
	return "ZmChooseAccountDialog";
};

/**
 * Pops up this dialog
 *
 * @param selectedAccount	{ZmZimbraAccount}	Optional. The account to have initially "selected". Otherwise, the active account is selected.
 * @param accountType		{String}			Optional. Only offer accounts of this type. Otherwise, all visible accounts are offered.
 * @param chooserMessage	{String}			Optional. The message to prompt user with. A default message is used if none provided.
 * @param title				{String}			Optional. Dialog title.
 */
ZmChooseAccountDialog.prototype.popup =
function(selectedAccount, accountType, chooserMessage, title) {
	this.setTitle(title || ZmMsg.chooseAccount);

	this._chooseMessageEl.innerHTML = chooserMessage || ZmMsg.chooseAccount;

	var activeAcct = selectedAccount || appCtxt.getActiveAccount();
	var accounts = appCtxt.accountList.visibleAccounts;

	var html = [];
	var idx = 0;

	html[idx++] = "<table border=0 cellpadding=1 cellspacing=1>";
	for (var i = 0; i < accounts.length; i++) {
		var acct = accounts[i];
		if (appCtxt.isOffline && acct.isMain) { continue; }
		if (accountType && acct.type != accountType) { continue; }

		var icon = appCtxt.isOffline ? acct.getIcon() : null;
		var inputId = Dwt.getNextId();

		html[idx++] = "<tr><td><input type='checkbox' name='";
		html[idx++] = this._inputName;
		html[idx++] = "'";
		if (acct == activeAcct) {
			html[idx++] = " checked";
		}
		html[idx++] = " _acctId='";
		html[idx++] = acct.id;
		html[idx++] = "' id='";
		html[idx++] = inputId;
		html[idx++] = "'></td>";
		if (icon) {
			html[idx++] = "<td>";
			html[idx++] = AjxImg.getImageHtml(icon);
			html[idx++] = "</td>";
		}
		html[idx++] = "<td><label for='";
		html[idx++] = inputId;
		html[idx++] = "'>";
		html[idx++] = acct.getDisplayName();
		html[idx++] = "</label></td></tr>";
	}
	html[idx++] = "</table>";
	this._accountSelectEl.innerHTML = html.join("");

	ZmDialog.prototype.popup.call(this);
};

ZmChooseAccountDialog.prototype._okButtonListener =
function(ev) {
	var selected = document.getElementsByName(this._inputName);
	var accountIds = [];
	for (var i = 0; i < selected.length; i++) {
		if (selected[i].checked) {
			accountIds.push(selected[i].getAttribute("_acctId"));
		}
	}
	DwtDialog.prototype._buttonListener.call(this, ev, [accountIds]);
};

ZmChooseAccountDialog.prototype._enterListener =
function(ev) {
	this._okButtonListener.call(this, ev);
};

ZmChooseAccountDialog.prototype._contentHtml =
function() {
	return AjxTemplate.expand("share.Widgets#ZmChooseAccountDialog", {id:this._htmlElId});
};

ZmChooseAccountDialog.prototype._createControls =
function() {
	this._accountSelectEl = document.getElementById(this._htmlElId+"_accountSelectId");
	this._chooseMessageEl = document.getElementById(this._htmlElId+"_chooseAccountMsg");
	this._inputName = this._htmlElId + "_accountCheckbox";
};
