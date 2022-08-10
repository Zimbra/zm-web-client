/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

ZmAccountTestDialog = function(parent) {
	DwtDialog.call(this, {parent:parent, title:ZmMsg.accountTest, className:"DwtBaseDialog ZmDataSourceTestDialog" });
	this.registerCallback(DwtDialog.OK_BUTTON, this._handleOkButton, this);
	this.registerCallback(DwtDialog.CANCEL_BUTTON, this._handleCancelButton, this);
};
ZmAccountTestDialog.prototype = new DwtDialog;
ZmAccountTestDialog.prototype.constructor = ZmAccountTestDialog;

ZmAccountTestDialog.prototype.toString = function() {
	return "ZmAccountTestDialog";
};

//
// DwtDialog methods
//

ZmAccountTestDialog.prototype.popup = function(accounts, okCallback, cancelCallback) {
	delete this._reqId;
	// perform tests
	if (accounts && accounts.length > 0) {
		this._okCallback = okCallback;
		this._cancelCallback = cancelCallback;

		// setup display
		this._initializeAccounts(accounts);
		this.setButtonEnabled(DwtDialog.OK_BUTTON, false);

		// show dialog
		DwtDialog.prototype.popup.call(this);

		// begin test
		var testCallback = new AjxCallback(this, this._handleTestResult);
		testCallback.args = [testCallback, 0];
		this._handleTestResult.apply(this, testCallback.args);
	}

	// nothing to do; report success
	else if (okCallback) {
		var successes = [];
		okCallback.run(successes);
	}
};

//
// Protected methods
//

ZmAccountTestDialog.prototype._initializeAccounts = function(accounts) {
	this._accounts = accounts;
	this._successes = new Array(accounts.length);

	var data = { id: this._htmlElId, accounts: accounts };
	var html = AjxTemplate.expand("prefs.Pages#AccountTestContent", data);
	this.setContent(html);
};

ZmAccountTestDialog.prototype._handleTestResult =
function(testCallback, index, result) {
	// show results
	if (result) {
		var account = this._accounts[index - 1];
		var statusEl = document.getElementById(account.id+"_test_status");

		var error = null;
		var resp = result._data && result._data.TestDataSourceResponse;
		if (resp) {
			this._successes[index - 1] = true;
			var dsrc = resp[ZmDataSource.prototype.ELEMENT_NAME] ||
					   resp[ZmPopAccount.prototype.ELEMENT_NAME] ||
					   resp[ZmImapAccount.prototype.ELEMENT_NAME];
			dsrc = dsrc && dsrc[0];
			if (dsrc.success) {
				statusEl.className = [statusEl.className,"ZmTestSucceeded"].join(" ");
				statusEl.innerHTML = ZmMsg.popAccountTestSuccess;
			}
			else {
				error = dsrc.error;
			}
		}
		else {
			error = "Generic Test Failure"; // TODO: i18n
		}

		if (error) {
			this._successes[index - 1] = false;

			statusEl.className = [statusEl.className,"ZmTestFailed"].join(" ");
			statusEl.innerHTML = ZmMsg.popAccountTestFailure;

			var detailsEl = document.getElementById(account.id+"_test_details");
			var errorEl = document.getElementById(account.id+"_test_error");
			error = AjxStringUtil.htmlEncode(error);
			errorEl.innerHTML = error.replace(/(\bhttps?:[^\s<]*)/igm, '<a href="$1" target="_blank">$1</a>');
			Dwt.setVisible(detailsEl, true);
		}

		this._position();
	}

	// finish
	if (this._accounts.length == index) {
		this.setButtonEnabled(DwtDialog.OK_BUTTON, true);
		return;
	}

	// continue testing
	var account = this._accounts[ testCallback.args[1]++ ];
	var statusEl = document.getElementById(account.id+"_test_status");
	statusEl.innerHTML = ZmMsg.popAccountTestInProgress;
	this._reqId = account.testConnection(testCallback, testCallback, null, true);
};

ZmAccountTestDialog.prototype._handleOkButton = function(evt) {
	this.popdown();
	if (this._reqId) {
		appCtxt.getAppController().cancelRequest(this._reqId);
	}
	if (this._okCallback) {
		this._okCallback.run(this._successes);
	}
};
ZmAccountTestDialog.prototype._handleCancelButton = function(evt) {
	this.popdown();
	if (this._cancelCallback) {
		this._cancelCallback.run();
	}
};