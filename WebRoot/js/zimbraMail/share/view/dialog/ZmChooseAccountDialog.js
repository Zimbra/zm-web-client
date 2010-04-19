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

	this._accountSelect.clearOptions();
	var activeAcct = selectedAccount || appCtxt.getActiveAccount();
	var accounts = appCtxt.accountList.visibleAccounts;

	for (var i = 0; i < accounts.length; i++) {
		var acct = accounts[i];
		if (appCtxt.isOffline && acct.isMain) { continue; }
		if (accountType && acct.type != accountType) { continue; }

		var icon = appCtxt.isOffline ? acct.getIcon() : null;
		var option = new DwtSelectOption(acct.id, (acct == activeAcct), acct.getDisplayName(), null, null, icon);
		this._accountSelect.addOption(option);
	}

	ZmDialog.prototype.popup.call(this);
};

ZmChooseAccountDialog.prototype._okButtonListener =
function(ev) {
	DwtDialog.prototype._buttonListener.call(this, ev, [this._accountSelect.getValue()]);
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
	this._accountSelect = new DwtSelect({parent: this, parentElement: (this._htmlElId+"_accountSelectId")});
	this._chooseMessageEl = document.getElementById(this._htmlElId+"_chooseAccountMsg");
};
