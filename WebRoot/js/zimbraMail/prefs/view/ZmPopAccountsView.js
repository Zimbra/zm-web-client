/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmPopAccountsView(parent, appCtxt, controller) {
    var labels = {
        infoTitle: ZmMsg.popAccountsInfoHeader,
        infoContents: ZmMsg.popAccountsInfo,
        detailsHeader: ZmMsg.popAccountSettings,
        listHeader: ZmMsg.popAccounts
    };
	ZmPrefListView.call(this, parent, appCtxt, controller, labels, "ZmPopAccountView");

	this._title = [ZmMsg.zimbraTitle, ZmMsg.options, ZmPrefView.TAB_NAME[ZmPrefView.POP_ACCOUNTS]].join(": ");
};

ZmPopAccountsView.prototype = new ZmPrefListView;
ZmPopAccountsView.prototype.constructor = ZmPopAccountsView;
 
ZmPopAccountsView.prototype.toString =
function() {
	return "ZmPopAccountsView";
};

// Public methods

ZmPopAccountsView.prototype.getTitle =
function() {
	return this._title;
};

ZmPopAccountsView.prototype.showItem =
function(account) {
    this._account = account;
    if (account) {
        this._accountView.setAccount(account);
        this._accountView.setVisible(true);
        this._accountView.focus();
        this.validate();
    }
    else {
        this._accountView.setVisible(false);
    }
};

ZmPopAccountsView.prototype.getPreSaveCallback = function() {
    return new AjxCallback(this, this._preSaveTestAccounts);
};

ZmPopAccountsView.prototype._preSaveTestAccounts =
function(continueCallback, batchCommand, testOkCallback, testCancelCallback) {

    // clear sensitive data
    this._accountView._password1Field.setValue("");

    // get list of accounts to test
    var list = this.getList();
    if (!list) return null;

    var accounts = [];
    var items = list.getList().getArray();
    for (var i = 0; i < items.length; i++) {
        var account = items[i];

        var isNew = account._new;
        if (isNew) {
            if (account.enabled) {
                accounts.push(account);
            }
            else {
                this._doCreateAccount(account, batchCommand);
            }
        }
        else {
            var modified = false;
            for (var p in account) {
                if (!p.match(/^_/) && account.hasOwnProperty(p)) {
                    modified = true;
                    break;
                }
            }
            if (modified) {
                if (account.enabled) {
                    accounts.push(account);
                }
                else {
                    this._doSaveAccount(account, batchCommand);
                }
            }
        }
    }

    // is there anything to do?
    if (accounts.length == 0) {
        continueCallback.run(true);
        return;
    }

    var successes = new Array(accounts.length);

    // setup test dialog
    if (!this._testDialog) {
        var shell = DwtShell.getShell(window);
        var className = "ZmDataSourceTestDialog";
        var title = ZmMsg.popAccountTestTitle; 
        var buttons = [DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON];
        this._testDialog = new DwtDialog(shell, className, title, buttons);
    }

    var html = [
        "<table border='0' cellspacing='0' cellpadding='3' ",
                "id='",this._htmlElId,"_accts","' class='ZmDataSourceTestTable'>",
            "<tr><th>",ZmMsg.account,"</th><th>",ZmMsg.status,"</th></tr>"
    ];
    for (var i = 0; i < accounts.length; i++) {
        var account = accounts[i];
        html.push(
            "<tr>",
                "<td class='ZmTestItem'>",account.name,"</td>",
                "<td class='ZmTestStatus' id='",this._htmlElId,"_acct_",account.id,"'></td>",
            "</tr>"
        );
    }
    html.push("</table>");
    this._testDialog.setContent(html.join(""));

	var cancelListener = testOkCallback || (new AjxListener(this, this._preSaveTestButtonListener, [continueCallback, batchCommand, accounts, successes, false]));
	var okListener = testCancelCallback || (new AjxListener(this, this._preSaveTestButtonListener, [continueCallback, batchCommand, accounts, successes, true]));
	this._testDialog.setButtonListener(DwtDialog.CANCEL_BUTTON, cancelListener);
	this._testDialog.setButtonListener(DwtDialog.OK_BUTTON, okListener);
    this._testDialog.setButtonEnabled(DwtDialog.OK_BUTTON, false);
    this._testDialog.popup();

    // start test
    var testCallback = new AjxCallback(this, this._preSaveTestResults);
    testCallback.args = [testCallback, accounts, 0, successes, continueCallback, batchCommand];
    this._preSaveTestResults.apply(this, testCallback.args);
};

ZmPopAccountsView.prototype._preSaveTestResults =
function(testCallback, accounts, index, successes, continueCallback, batchCommand, result) {
    // show results
    if (result) {
        var account = accounts[index - 1];
        var el = this.__getAcctEl(account);

        var error = null;
        if (result._data.TestDataSourceResponse) {
            successes[index - 1] = true;
            var pop3 = result._data.TestDataSourceResponse.pop3[0];
            if (pop3.success) {
                el.className = [el.className,"ZmTestSucceeded"].join(" ");
                el.innerHTML = ZmMsg.popAccountTestSuccess;
            }
            else {
                error = pop3.error;
            }
        }

        if (error) {
            successes[index - 1] = false;

            el.className = [el.className,"ZmTestFailed"].join(" ");
            el.innerHTML = ZmMsg.popAccountTestFailure;

            var row = el.parentNode;
            var rowIndex = 0;
            while (row) {
                rowIndex++;
                row = row.previousSibling;
            }
            var table = document.getElementById(this._htmlElId+"_accts");
            var row = table.insertRow(rowIndex);
            var cell = row.insertCell(-1);
            cell.colSpan = 2;
            cell.className = "ZmTestDetails";

            cell.innerHTML = [
                "<table border='0'>",
                    "<tr valign='top'>",
                        "<td class='ZmTestError'>",ZmMsg.errorLabel,"</td>",
                        "<td class='ZmTestError'>",error,"</td>",
                    "</tr>",
                    "<tr valign='top'>",
                        "<td class='ZmTestNote'>",ZmMsg.noteLabel,"</td>",
                        "<td class='ZmTestNote'>",ZmMsg.popAccountTestNote,"</td>",
                    "</tr>",
                "</table>"
            ].join("");
        }
    }

    // finish
    if (accounts.length == index) {
        this._testDialog.setButtonEnabled(DwtDialog.OK_BUTTON, true);
        return;
    }

    // continue testing
    var account = accounts[ testCallback.args[2]++ ];
    var el = this.__getAcctEl(account);
    /***
    el.innerHTML = [
        ZmMsg.popAccountTestInProgress,
        " <a href='javascript:void 0'>", // TODO: hook up click handler
            ZmMsg.popAccountTestSkip,
        "</a>"
    ].join("");
    /***/
    el.innerHTML = ZmMsg.popAccountTestInProgress; 
    /***/
    account.testConnection(testCallback, testCallback);
};

ZmPopAccountsView.prototype.__getAcctEl = function(account) {
    return document.getElementById([this._htmlElId,"_acct_",account.id].join(""));
};

ZmPopAccountsView.prototype._preSaveTestButtonListener =
function(continueCallback, batchCommand, accounts, successes, success) {
    this._testDialog.popdown();
    if (success) {
        for (var i = 0; i < successes.length; i++) {
            var account = accounts[i]; 

            // disable accounts that failed
            if (successes[i] == false) {
                account.enabled = false;
                var itemEl = this.getList()._getElFromItem(account);
                var checkbox = itemEl.getElementsByTagName("INPUT")[0];
                checkbox.checked = false;
            }

            // add command
            if (account._new) {
                this._doCreateAccount(account, batchCommand);
            }
            else {
                this._doSaveAccount(account, batchCommand);
            }
        }
    }
    continueCallback.run(success);
};

ZmPopAccountsView.prototype._doCreateAccount =
function(account, batchCommand) {
    var callback = new AjxCallback(this, this._commandResult, [account]);
    var errorCallback = new AjxCallback(this, this._commandException);

    // create account
    account.create(callback, errorCallback, batchCommand);

    // create identity
    if (account._identity.checked) {
        var email = account._identity.email;
        var display = email.replace(/@.*$/,"");

        var identity = new ZmIdentity(this._appCtxt);
        identity.name = account.name;
        identity.sendFromDisplay = display;
        identity.sendFromAddress = email;
        identity.setReplyTo = true;
        identity.setReplyToDisplay = display;
        identity.setReplyToAddress = email;
        identity.useWhenSentTo = account._identity.linkAddr;
        if (identity.useWhenSentTo) {
	        identity.whenSentToAddresses = [email];
        }
        identity.useWhenInFolder = account._identity.linkFolder;
        if (identity.useWhenInFolder) {
	        identity.whenInFolderIds = [account.folderId];
        }
		identity.setAllDefaultAdvancedFields();

        identity.createRequest("CreateIdentityRequest", batchCommand);
    }
};

ZmPopAccountsView.prototype._doSaveAccount =
function(account, batchCommand) {
    var callback = new AjxCallback(this, this._commandResult, [account]);
    var errorCallback = new AjxCallback(this, this._commandException);

    account.save(callback, errorCallback, batchCommand);
};

ZmPopAccountsView.prototype.addCommand = function(batchCommand) {
    // gather up creates, updates, and deletes
    var creates = [];
    var modifies = [];
    var deletes = [];

    var list = this.getList();
    var items = list.getList().getArray();
    for (var i = 0; i < items.length; i++) {
        var account = items[i];
        var isNew = account._new;
        if (!isNew) {
            var modified = false;
            for (var pname in account) {
                if (pname.match(/^_/)) continue;
                if (account.hasOwnProperty(pname)) {
                    modified = true;
                    break;
                }
            }
            if (!modified) {
                continue;
            }
        }
        var array = isNew ? creates : modifies;
        array.push(account);
    }

    var removedItems = this._controller.getRemovedItems();
    for (var i = 0; i < removedItems.length; i++) {
        var account = removedItems[i];
        deletes.push(account);
    }

    // is there anything to do?
    if (creates.length == 0 && modifies.length == 0 && deletes.length == 0) {
        return;
    }

    // add soap docs to batch request
    var errorCallback = new AjxCallback(this, this._commandException);
    var execFrame;
    for (var i = 0; i < deletes.length; i++) {
        var account = deletes[i];
        var callback = new AjxCallback(this, this._commandResult, [account]);
        account.doDelete(callback, errorCallback, batchCommand);
    }
};

ZmPopAccountsView.prototype.getAccount = function() {
    return this._account;
};

ZmPopAccountsView.prototype.isDirty = function() {
    return this._accountView.isDirty();
};

ZmPopAccountsView.prototype.reset = function() {
	//TODO: Implement this. It gets called by the pop shield-no callback. 
};

// Protected methods

ZmPopAccountsView.prototype._commandResult = function(account, result) {
    var collection = AjxDispatcher.run("GetDataSourceCollection");

    var data = result._data;
    if (data.CreateDataSourceResponse) {
        var pop3 = data.CreateDataSourceResponse.pop3[0];

        var itemEl = this.getList()._getElFromItem(account);
        itemEl.id = pop3.id;

        account.id = pop3.id;
        account.password = "";
        delete account._new;
        delete account._identity;
        collection.add(account);
    }
    if (data.ModifyDataSourceResponse) {
        collection.modify(account);
    }
    if (data.DeleteDataSourceResponse) {
        /*** HACK: response is incorrect ***
        var pop3 = data.DeleteDataSourceResponse.pop3[0];
        var account = collection.getById(pop3.id);
        /***/
        collection.remove(account);
    }
};
ZmPopAccountsView.prototype._commandException = function(ex) {
//    debugger;
};

ZmPopAccountsView.prototype._validateSelectedItem = function(errors) {
    if (this._account) {
        this._accountView._validateSelectedItem(errors);
    }
};

ZmPopAccountsView.prototype._createDetails = function(parentElement) {
    // REVISIT: When we have more server support, will separate
    //       settings into two pages: basic and advanced.
    this._accountView = new ZmPopAccountBasicPage(this, this._appCtxt, "basic");
    this._accountView.setVisible(false);

    var el = this._accountView.getHtmlElement();
    parentElement.appendChild(el);
};

ZmPopAccountsView.prototype._createItemHtml = function(item) {
    var span = document.createElement("SPAN");
    span.innerHTML = [
        "<INPUT type='checkbox' ",(item.enabled?"checked ":""),">"
    ].join("");
    var input = span.firstChild;
    Dwt.associateElementWithObject(input, {view:this, item:item}, "popItem");
    Dwt.setHandler(input, DwtEvent.ONMOUSEDOWN, ZmPopAccountsView._eventHandled);
    Dwt.setHandler(input, DwtEvent.ONMOUSEUP, ZmPopAccountsView._eventHandled);
    Dwt.setHandler(input, DwtEvent.ONCLICK, ZmPopAccountsView._handleItemCheckbox);

    var div = ZmPrefListView.prototype._createItemHtml.call(this, item);
    var table = div.firstChild;
    var row = table.rows[0];
    var cell = row.insertCell(0);
    if (AjxEnv.isIE) {
        cell.width = "24px";
    }
    cell.appendChild(input);
    return div;
};

ZmPopAccountsView._eventHandled = function(event) {
    DwtUiEvent.setBehaviour(event, true, true);
};
ZmPopAccountsView._handleItemCheckbox = function(event) {
    var target = DwtUiEvent.getTarget(event);
    var object = Dwt.getObjectFromElement(target, "popItem");
    var view = object.view;
    var item = object.item;
    item.enabled = target.checked;
    view._accountView._dirtyListener(null);
};

//
// Class: ZmPopAccountBasicPage
//

function ZmPopAccountBasicPage(parent, appCtxt, pageId, className, posStyle) {
	DwtTabViewPage.call(this, parent, className, posStyle || DwtControl.STATIC_STYLE);
	this._appCtxt = appCtxt;
	this._pageId = pageId;
    this._createHtml();
}
ZmPopAccountBasicPage.prototype = new DwtTabViewPage;
ZmPopAccountBasicPage.prototype.constructor = ZmPopAccountBasicPage;

// Constants

ZmPopAccountBasicPage.DEFAULT_FOLDER_ID = ZmOrganizer.ID_INBOX; 

// Data

ZmPopAccountBasicPage.prototype._account;

ZmPopAccountBasicPage.prototype._nameField;
ZmPopAccountBasicPage.prototype._folderButton;

ZmPopAccountBasicPage.prototype._serverField;
ZmPopAccountBasicPage.prototype._usernameField;
ZmPopAccountBasicPage.prototype._password1Field;

ZmPopAccountBasicPage.prototype._sslEl;
/***
ZmPopAccountBasicPage.prototype._sslTrustDiv;
ZmPopAccountBasicPage.prototype._sslTrustEl;
/***/
ZmPopAccountBasicPage.prototype._portField;
ZmPopAccountBasicPage.prototype._portDefEl;

ZmPopAccountBasicPage.prototype._testButton;

ZmPopAccountBasicPage.prototype._createIdentityEl;
ZmPopAccountBasicPage.prototype._identityNameEl;
ZmPopAccountBasicPage.prototype._emailField;
ZmPopAccountBasicPage.prototype._linkAddrEl;
ZmPopAccountBasicPage.prototype._linkFolderEl;

ZmPopAccountBasicPage.prototype._isDirty;
ZmPopAccountBasicPage.prototype._isLinkEmailDirty;

//
// Public methods
//

ZmPopAccountBasicPage.prototype.setAccount = function(account) {
    // save account object
    this._account = account;
    var isNew = Boolean(account._new);
    if (isNew && !account._identity) {
        account._identity = {
            checked: false, linkAddr: true, linkFolder: false 
        };
    }

    // initialize input fields
    this._nameField.setValue(account.name);
    var folderId = account.folderId || ZmPopAccountBasicPage.DEFAULT_FOLDER_ID;
    var folder = this._appCtxt.getById(folderId);
    this._folderButton.setText(folder.name);
    this._downloadSelect.setSelectedValue(account.leaveOnServer);

    this._serverField.setValue(account.mailServer);
    this._usernameField.setValue(account.userName);
    this._password1Field.setRequired(isNew);
    this._password1Field.setValue(account.password);
    this._password1Field.setInputType(DwtInputField.PASSWORD);
    this._showPasswordCheckbox.setSelected(false);

    var useSSL = account.connectionType == ZmPopAccount.CONNECT_SSL;
    var portDef = useSSL ? ZmPopAccount.PORT_SSL : ZmPopAccount.PORT_DEFAULT;
    this._sslCheckbox.setSelected(useSSL);
    /***
    Dwt.setVisible(this._sslTrustDiv, useSSL);
    this._sslTrustEl.checked = account.trustSelfSignedCerts;
    /***/
    this._portField.setValue(account.port || portDef);
    this._portDefEl.innerHTML = portDef;

    // initialize other form state
    var identitiesEnabled = this._appCtxt.get(ZmSetting.IDENTITIES_ENABLED);
    this._createIdentityCheckbox.setSelected(false);
    this._updateLinkName();
    this._updateLinkEmail();
    this._linkAddrCheckbox.setSelected(account._identity && account._identity.linkAddr);
    this._linkFolderCheckbox.setSelected(account._identity && account._identity.linkFolder);
    this._setCreateIdentityVisible(identitiesEnabled && isNew);

    this._isDirty = false;
    this._isLinkEmailDirty = account._identity && account._identity._emailDirty;

    this.parent.validate();
};

ZmPopAccountBasicPage.prototype.getAccount = function() {
    return this._account;
};

ZmPopAccountBasicPage.prototype.isDirty = function() {
    return this._isDirty;
};

ZmPopAccountBasicPage.prototype._validateSelectedItem = function(errors) {
    // tally errors (only if enabled)
    var account = this._account;
    if (account.enabled) {
        var isNew = account._new;
        var isDirty = this.isDirty();
        var requiredFields = account.name && account.mailServer && account.userName;
        requiredFields = requiredFields && (isNew || !isDirty || account.password);
        var requiredNewFields = !isNew || (account.password && account._identity.email);
        if (!requiredFields || !requiredNewFields) {
            errors.push(ZmMsg.errorMissingRequired);
        }
        if (isNew && account._identity.email && !this._emailField.isValid()) {
            errors.push(ZmMsg.errorInvalidEmail);
        }
    }
    else if (!account.name) {
        errors.push(ZmMsg.errorMissingRequired);
    }
    if (account.name && !this._nameField.isValid()) {
        errors.push(ZmMsg.errorDuplicateName);
    }

    // toggle test button
    var connectionFields = account.mailServer && account.userName && account.password;
    this._testButton.setEnabled(connectionFields);
};

ZmPopAccountBasicPage.prototype.focus = function() {
    this._nameField.focus();
};

// Protected methods

ZmPopAccountBasicPage.prototype._updateLinkName = function() {
    var name = this._nameField.getValue();
    this._identityNameEl.innerHTML = AjxStringUtil.htmlEncode(name);
};
ZmPopAccountBasicPage.prototype._updateLinkEmail = function() {
    if (this._isLinkEmailDirty) return;

    var value;
    var userName = this._usernameField.getValue();
    if (userName.indexOf('@') != -1) {
    	value = userName;
    } else {
	    var mailServer = this._serverField.getValue();
	    value = userName && mailServer ? [userName,mailServer].join("@") : "";
    }
    this._emailField.setValue(value);
};
ZmPopAccountBasicPage.prototype._setCreateIdentityVisible = function(visible) {
    var id = this._htmlElId;
    var ids = [
        id+"_identity_title_row",
        id+"_identity_help_row",
        id+"_identity_create_row"
    ];
    this.__setVisible(ids, visible);
    this._setIdentityVisible(false);
};
ZmPopAccountBasicPage.prototype._setIdentityVisible = function(visible) {
    var id = this._htmlElId;
    var ids = [
        id+"_identity_spacer_row",
        id+"_identity_name_row",
        id+"_identity_email_row",
        id+"_identity_use_address_row",
        id+"_identity_use_folder_row"
    ];
    this.__setVisible(ids, visible);
};

ZmPopAccountBasicPage.prototype.__setVisible = function(ids, visible) {
    ids = AjxUtil.isArray(ids) ? ids : [ ids ];
    for (var i = 0; i < ids.length; i++) {
        var el = document.getElementById(ids[i]);
        Dwt.setVisible(el, visible);
    }
};

ZmPopAccountBasicPage.prototype._validateName = function(value) {
    var name = value && value.replace(/^\s+$/);
    if (!name || name == '') {
        return null;
    }
    var view = this.parent;
    var list = view.getList();
    var items = list.getList().getArray();
    for (var i = 0; i < items.length; i++) {
        var account = items[i];
        if (account === this._account) continue;
        if (account.name == name) {
            return null;
        }
    }
    return value;
};
ZmPopAccountBasicPage.prototype._validateEmail = function(value) {
    if (/^.+@.+$/.test(value)) {
        return value;
    }
    return null;
};

ZmPopAccountBasicPage.prototype._createHtml = function() {
    // create controls
    this._nameField = new DwtInputField({
        parent:this, required:true,
        validationStyle:DwtInputField.CONTINUAL_VALIDATION,
        validatorCtxtObj:this, validator: this._validateName
    });
    this._folderButton = new DwtButton(this);
    this._downloadSelect = new DwtSelect(this);
    this._downloadSelect.addOption(ZmMsg.popAccountDownloadLeave, false, true);
    this._downloadSelect.addOption(ZmMsg.popAccountDownloadRemove, false, false);

    this._serverField = new DwtInputField({
        parent:this, required:true,
        validationStyle:DwtInputField.CONTINUAL_VALIDATION
    });
    this._usernameField = new DwtInputField({
        parent:this, required:true,
        validationStyle:DwtInputField.CONTINUAL_VALIDATION
    });
    this._password1Field = new DwtInputField({
        parent:this, type:DwtInputField.PASSWORD, required:true,
        validationStyle:DwtInputField.CONTINUAL_VALIDATION
    });
    this._showPasswordCheckbox = new DwtCheckbox(this);

    this._sslCheckbox = new DwtCheckbox(this);
    this._portField = new DwtInputField({
        parent:this, type:DwtInputField.INTEGER,
        validationStyle:DwtInputField.CONTINUAL_VALIDATION
    });

    this._testButton = new DwtButton(this);
    this._testButton.setText(ZmMsg.popAccountTest);

    this._createIdentityCheckbox = new DwtCheckbox(this);
    this._emailField = new DwtInputField({
        parent:this, required:true,
        validationStyle:DwtInputField.CONTINUAL_VALIDATION,
        validatorCtxtObj: this, validator: this._validateEmail
    });
    this._linkAddrCheckbox = new DwtCheckbox(this);
    this._linkFolderCheckbox = new DwtCheckbox(this);

    // set html
    var id = this._htmlElId;
    var div = document.createElement("DIV");
    div.innerHTML = AjxTemplate.expand("zimbraMail.prefs.templates.Options#PopForm", id);
    this.getHtmlElement().appendChild(div);

    // insert dwt controls
    this._nameField.replaceElement(id+"_name");
    this._folderButton.replaceElement(id+"_location");
    this._downloadSelect.replaceElement(id+"_download");

    this._serverField.replaceElement(id+"_server");
    this._usernameField.replaceElement(id+"_username");
    this._password1Field.replaceElement(id+"_password");
    this._showPasswordCheckbox.replaceElement(id+"_show_password");

    this._sslCheckbox.replaceElement(id+"_ssl");
    this._portField.replaceElement(id+"_port");

    this._testButton.replaceElement(id+"_testButton");

    this._createIdentityCheckbox.replaceElement(id+"_create_identity");
    this._emailField.replaceElement(id+"_email");
    this._linkAddrCheckbox.replaceElement(id+"_identity_use_address");
    this._linkFolderCheckbox.replaceElement(id+"_identity_use_folder");

    // save refs to elements
    this._portDefEl = document.getElementById(id+"_port_label");
//    this._sslTrustDiv = document.getElementById(sslTrustDivId);
//    this._sslTrustEl = document.getElementById(sslTrustId);
    this._identityNameEl = document.getElementById(id+"_identity_name");

    // register handlers and associate elements
//    Dwt.setHandler(this._sslTrustEl, DwtEvent.ONCLICK, ZmPopAccountBasicPage._handleSslTrust);
//    Dwt.associateElementWithObject(this._sslTrustEl, this);

    // create listeners
    var nameListener = new AjxListener(this, this._nameListener);
    var folderListener = new AjxListener(this, this._folderListener);
    var downloadListener = new AjxListener(this, this._downloadListener);

    var serverListener = new AjxListener(this, this._serverOrUserNameListener, [this._serverField, "mailServer"]);
    var userNameListener = new AjxListener(this, this._serverOrUserNameListener, [this._usernameField, "userName"]);
    var passwordListener = new AjxListener(this, this._passwordListener);
    var showPasswordListener = new AjxListener(this, this._showPasswordListener);

    var portListener = new AjxListener(this, this._portListener);
    var sslListener = new AjxListener(this, this._sslListener);

    var testListener = new AjxListener(this, this._testListener);

    var createIdentityListener = new AjxListener(this, this._createIdentityListener);
    var emailListener = new AjxListener(this, this._emailListener);
    var linkAddrListener = new AjxListener(this, this._linkAddrListener);
    var linkFolderListener = new AjxListener(this, this._linkFolderListener);

    // register listeners
    this._nameField.addListener(DwtEvent.ONKEYUP, nameListener);
    this._folderButton.addSelectionListener(folderListener);
    this._downloadSelect.addChangeListener(downloadListener);

    this._serverField.addListener(DwtEvent.ONKEYUP, serverListener);
    this._usernameField.addListener(DwtEvent.ONKEYUP, userNameListener);
    this._password1Field.addListener(DwtEvent.ONKEYUP, passwordListener);
    this._showPasswordCheckbox.addSelectionListener(showPasswordListener);

    this._sslCheckbox.addSelectionListener(sslListener);
    this._portField.addListener(DwtEvent.ONKEYUP, portListener);

    this._testButton.addSelectionListener(testListener);

    this._createIdentityCheckbox.addSelectionListener(createIdentityListener);
    this._emailField.addListener(DwtEvent.ONKEYUP, emailListener);
    this._linkAddrCheckbox.addSelectionListener(linkAddrListener);
    this._linkFolderCheckbox.addSelectionListener(linkFolderListener);
};

//
// Listeners
//

ZmPopAccountBasicPage.prototype._fieldListener =
function(field, pname, evt) {
    this._account[pname] = field.getValue();
};

ZmPopAccountBasicPage.prototype._nameListener = function(evt) {
    this._fieldListener(this._nameField, "name", evt);
    var name = this._nameField.getValue();
    this._identityNameEl.innerHTML = AjxStringUtil.htmlEncode(name);
    this.parent.getList().redrawItem(this._account);
    this._dirtyListener(evt);
};
ZmPopAccountBasicPage.prototype._folderListener = function(evt) {
    var dialog = this._appCtxt.getChooseFolderDialog();
    dialog.reset();
    dialog.registerCallback(DwtDialog.OK_BUTTON, this._folderOkListener, this, [dialog]);
    dialog.popup([ZmOrganizer.FOLDER], null, true, ZmMsg.popAccountFolderSelect);
};
ZmPopAccountBasicPage.prototype._folderOkListener = function(dialog, folder) {
    dialog.popdown();
    this._folderButton.setText(folder.name);
    this._account.folderId = folder.id;
    this._dirtyListener(null);
};
ZmPopAccountBasicPage.prototype._downloadListener = function(evt) {
    this._account.leaveOnServer = this._downloadSelect.getValue();
    this._dirtyListener(evt);
};

ZmPopAccountBasicPage.prototype._serverOrUserNameListener =
function(field, pname, evt) {
    this._fieldListener(field, pname, evt);
    if (this._account._new) {
    	this._updateLinkEmail();
        this._account._identity.email = this._emailField.getValue();
    }
    this._password1Field.setRequired(true);
    this._dirtyListener(evt);
};
ZmPopAccountBasicPage.prototype._passwordListener =
function(evt) {
    this._fieldListener(this._password1Field, "password", evt);
    this._dirtyListener(evt);
};
ZmPopAccountBasicPage.prototype._showPasswordListener = function(event) {
    var checked = event.detail;
    this._password1Field.setInputType(checked ? DwtInputField.STRING : DwtInputField.PASSWORD);
};

ZmPopAccountBasicPage.prototype._advancedListener = function(event) {
    var checked = event.detail;
    this._setAdvancedVisible(checked);
};
ZmPopAccountBasicPage.prototype._sslListener = function(event) {
    var checked = event.detail;
    var port = checked ? ZmPopAccount.PORT_SSL : ZmPopAccount.PORT_DEFAULT;
    this._account.connectionType = checked ? ZmPopAccount.CONNECT_SSL : ZmPopAccount.CONNECT_CLEAR;
    this._account.port = port;
    this._portField.setValue(port);
    this._portDefEl.innerHTML = port;
    /***
    Dwt.setVisible(page._sslTrustDiv, checked);
    /***/
    this._dirtyListener();
};
/***
ZmPopAccountBasicPage._handleSslTrust = function(event) {
    var target = DwtUiEvent.getTarget(event);
    var page = Dwt.getObjectFromElement(target);
    page._account.trustSelfSignedCerts = target.checked;
    page._dirtyListener();
};
/***/
ZmPopAccountBasicPage.prototype._portListener =
function(evt) {
    this._account.port = parseInt(this._portField.getValue()) || this._account.getPort();
    this._dirtyListener(evt);
};

ZmPopAccountBasicPage.prototype._testListener = function(evt) {
    var callback = new AjxCallback(this, this._testResponse, [this._account]);
	var testOkCancelCallback = new AjxListener(this, this._testOkCancelListener);
	this.parent._preSaveTestAccounts(callback, null, testOkCancelCallback, testOkCancelCallback);
};

ZmPopAccountBasicPage.prototype._testOkCancelListener =
function(ev) {
	this.parent._testDialog.popdown();
};

ZmPopAccountBasicPage.prototype._testResponse = function(account, resp) {
    var response = resp && resp._data && resp._data.TestDataSourceResponse;
    var pop3 = response && response.pop3 && response.pop3[0];
    var success = pop3.success;

    var key = success ? ZmMsg.popAccountTestSuccessMsg : ZmMsg.popAccountTestFailureMsg;
    var message = AjxMessageFormat.format(key, account.name);
    var details = !success ? pop3.error : null;
    var style = success ? DwtMessageDialog.INFO_STYLE : DwtMessageDialog.WARNING_STYLE;
    var title = ZmMsg.popAccountTest;

    var dialog = this._appCtxt.getErrorDialog();
    dialog.setButtonVisible(ZmErrorDialog.REPORT_BUTTON, false);
    dialog.setMessage(message, details, style, title);
    dialog.popup();
};

ZmPopAccountBasicPage.prototype._createIdentityListener = function(event) {
    var checked = event.detail;
    this._account._identity.checked = checked;
    this._setIdentityVisible(checked);
    this.parent.validate();
};
ZmPopAccountBasicPage.prototype._emailListener = function(evt) {
    this._account._identity.email = this._emailField.getValue();
    this._isLinkEmailDirty = true;
    this._dirtyListener(evt);
};
ZmPopAccountBasicPage.prototype._linkAddrListener = function(event) {
    this._linkAddrOrFolderListener("linkAddr", event);
};
ZmPopAccountBasicPage.prototype._linkFolderListener = function(event) {
    this._linkAddrOrFolderListener("linkFolder", event);
};
ZmPopAccountBasicPage.prototype._linkAddrOrFolderListener = function(pname, event) {
    var checked = event.detail;
    this._account._identity[pname] = checked;
};

ZmPopAccountBasicPage.prototype._dirtyListener = function(evt) {
    // REVISIT: Do something with this information?
    this._isDirty = true;
    this.parent.validate();
};

/***
//
// Class: ZmPopAccountAdvancedPage
//

function ZmPopAccountAdvancedPage(parent, appCtxt, pageId, className, posStyle) {
	DwtTabViewPage.call(this, parent, className, posStyle);
	this._appCtxt = appCtxt;
	this._pageId = pageId;
}
ZmPopAccountAdvancedPage.prototype = new DwtTabViewPage;
ZmPopAccountAdvancedPage.prototype.constructor = ZmPopAccountAdvancedPage;
/***/