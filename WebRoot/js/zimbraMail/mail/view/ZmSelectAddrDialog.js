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
 * @overview
 */

/**
 * Creates a dialog to allow the user to select a recipient address to search on.
 * @class
 * Provides the user a way to search on a recipient when they click on the To:
 * column in Sent or Drafts. That is in place of actual sorting. See bug 6830.
 *
 * @author Conrad Damon
 *
 * @param {DwtComposite}	parent				the parent widget (the shell)
 *
 * @extends		DwtDialog
 */
ZmSelectAddrDialog = function(parent) {

	if (arguments.length == 0) { return; }

	DwtDialog.call(this, {parent:parent, title:ZmMsg.findEmailsSentFolderTitle, className:"ZmSelectAddrDialog"});
    var okButton = this.getButton(DwtDialog.OK_BUTTON);
    if (okButton)
	    okButton.setText(ZmMsg.find);

    // create auto-completer
    if (appCtxt.get(ZmSetting.CONTACTS_ENABLED) || appCtxt.get(ZmSetting.GAL_ENABLED)) {
        var params = {
            dataClass: appCtxt.getAutocompleter(),
            matchValue: ZmAutocomplete.AC_VALUE_EMAIL,
            compCallback: (new AjxCallback(this, this._handleCompletionData, [this])),
            keyUpCallback: (new AjxCallback(this, this._acKeyUpListener))
        };
        this._acAddrSelectList = new ZmAutocompleteListView(params);
    }

	this.setContent(this._contentHtml());
    this._createInputView();
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okButtonListener));
};

ZmSelectAddrDialog.prototype = new DwtDialog;
ZmSelectAddrDialog.prototype.constructor = ZmQuickAddDialog;

ZmSelectAddrDialog.prototype.toString =
function() {
	return "ZmSelectAddrDialog";
};

ZmSelectAddrDialog.prototype._contentHtml =
function() {
    var html = [];
	var idx = 0;
	html[idx++] = "<table cellpadding=0 cellspacing=0 border=0>";
	html[idx++] = AjxTemplate.expand("share.Dialogs#ZmSelectAddrDialog", {id:this._htmlElId});
	html[idx++] = "</table>";
	return html.join("");
};

ZmSelectAddrDialog.prototype._createInputView =
function(){
    this._recipientInput = new DwtInputField({parent: this});
	this._recipientInput.setData(Dwt.KEY_OBJECT, this);
	this._recipientInput.setRequired(true);
	Dwt.associateElementWithObject(this._recipientInput.getInputElement(), this);
    this._recipientInput.setValidatorFunction(null, DwtInputField.validateEmail);

    var inputEl = this._recipientInput.getInputElement();
	if (this._acAddrSelectList) {
		this._acAddrSelectList.handle(inputEl);
	}

    var id = this._htmlElId + "_addrListTd";
	var td = document.getElementById(id);
	if (td) {
		this._recipientInput.reparentHtmlElement(td);
	}
};


/**
 * Populates the input field before showing the dialog.
 *
 * @param {array}		addrs			list of AjxEmailAddress to show user
 * @param {string}		folderId		ID of outbound folder
 */
ZmSelectAddrDialog.prototype.popup =
function(addrs, folderId) {

	this._addrs = [];
    var idx = folderId.indexOf(":");
    this._folderId = (idx != -1) ? (folderId.substr(idx + 1)) : folderId;
	var used = {}, id = 1;
	for (var i = 0, len = addrs.length; i < len; i++) {
		var addr = addrs[i];
		var email = addr.getAddress();
		// remove duplicates
		if (!used[email]) {
			addr.id = id++;
            addr.setAddress(AjxEmailAddress.split(email)[0]); //just show email portion
			this._addrs.push(addr);
			used[email] = true;
		}
	}
	this._addrs.sort(AjxEmailAddress.sortCompareByAddress);
    var inputValue = "";
    for (var i=0; i<this._addrs.length; i++){
        inputValue += this._addrs[i].getAddress() + "; ";
    }
	this._recipientInput.setValue(inputValue);
    var size = this.getSize();
	Dwt.setSize(this._recipientInput.getInputElement(), size.x * .85);
    DwtDialog.prototype.popup.call(this);

    if (addrs.length == 0)
        this._recipientInput.focus();
};

/**
 * @private
 */
ZmSelectAddrDialog.prototype._okButtonListener =
function() {


    var error;
    if (this._recipientInput.isValid() == null) {
	    error = this._recipientInput.getValue() ? AjxMsg.invalidEmailAddr : AjxMsg.valueIsRequired;
	}

    if (error) {
        return this._showError(error);
    }

    var emails = this._recipientInput.getValue();

	if (emails) {
        emails = AjxStringUtil.trim(emails);
        if (emails.substring(emails.length -1) == ";")
            emails = emails.substring(0, emails.length-1); //remove trailing ";"
        var query = [];
        var addr = emails.split(";");
		var folder = ZmFolder.QUERY_NAME[this._folderId];
	    for (var i = 0; i < addr.length; i++) {
            if (AjxEmailAddress.isValid(addr[i]))
		        query[i] = ["tocc:(", addr[i], ")"].join("");
            else{
                return this._showError(AjxMessageFormat.format(AjxMsg.invalidEmailAddrValue, addr[i]));
            }

        }

		appCtxt.getSearchController().search({query:"in:" + folder + " AND " + query.join(" AND ")});
	}
	this.popdown();
};

/**
 * @private
 */
ZmSelectAddrDialog.prototype._showError =
function(errorMessage) {

    var dialog = appCtxt.getErrorDialog();
    dialog.setMessage(errorMessage);
    dialog.popup(null, true);
};

/**
 * Creates the address list view.
 * @class
 * This class represents the address list view.
 *
 * @param	{DwtComposite}	parent		the parent widget
 *
 * @extends		DwtListView
 * 
 * @private
 */
ZmAddrListView = function(parent) {

	var headerList = this._getHeaderList();
	DwtListView.call(this, {parent:parent, headerList:headerList, view:"ALV"});
};

ZmAddrListView.COL_NAME	= "na";
ZmAddrListView.COL_ADDR	= "ad";

ZmAddrListView.prototype = new DwtListView;
ZmAddrListView.prototype.constructor = ZmAddrListView;

ZmAddrListView.prototype.toString =
function() {
	return "ZmAddrListView";
};

ZmAddrListView.prototype._getHeaderList =
function() {
	return [
		(new DwtListHeaderItem({field:ZmAddrListView.COL_NAME, text:ZmMsg.name, width:ZmMsg.COLUMN_WIDTH_NAME_SD})),
		(new DwtListHeaderItem({field:ZmAddrListView.COL_ADDR, text:ZmMsg.address}))
	];
};

ZmAddrListView.prototype._getCellContents =
function(html, idx, item, field, colIdx, params) {
	if (field == ZmAddrListView.COL_NAME) {
		html[idx++] = AjxStringUtil.htmlEncode(item.getName());
	} else if (field == ZmAddrListView.COL_ADDR) {
		html[idx++] = AjxStringUtil.htmlEncode(item.getAddress());
	}

	return idx;
};
