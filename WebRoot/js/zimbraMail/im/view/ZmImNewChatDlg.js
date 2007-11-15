/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
 *
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 *
 * ***** END LICENSE BLOCK *****
 */

/** small dialog for picking one contact with an autocompletion entry */

ZmImNewChatDlg = function() {
	DwtDialog.call(this, DwtShell.getShell(window), null, ZmMsg.selectBuddyOrContact);
	this._init();
};

ZmImNewChatDlg.prototype = new DwtDialog;
ZmImNewChatDlg.prototype.constructor = ZmImNewChatDlg;

ZmImNewChatDlg.prototype._init = function() {
	var field = new DwtInputField({ parent : this,
					size   : 25,
					hint   : ZmMsg.search });
	this._contactField = field;
	var id = field.getInputElement().id;
	var div = document.createElement("div");
	div.innerHTML = AjxTemplate.expand("im.Chat#NewChatDlg", { id: id });
	this._getContentDiv().appendChild(div);
	field.reparentHtmlElement(id + "_entryCell");
	this._initAutocomplete();
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okButtonListener));
        this.setButtonListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this, this._cancelButtonListener));

        var list = new ZmImOverview(this, { posStyle    : Dwt.STATIC_STYLE,
                                            isFloating  : true,
                                            noAssistant : true
                                          });
        list.reparentHtmlElement(id + "_buddyListCont");
        list.setSize(Dwt.DEFAULT, 200);
};

ZmImNewChatDlg._INSTANCE = null;
ZmImNewChatDlg.getInstance = function() {
	if (!ZmImNewChatDlg._INSTANCE) {
		ZmImNewChatDlg._INSTANCE = new ZmImNewChatDlg();
	}
	return ZmImNewChatDlg._INSTANCE;
};

ZmImNewChatDlg.show = function(callbacks) {
	var dlg = ZmImNewChatDlg.getInstance();
	dlg._callbacks = callbacks || {};
	dlg.reset();
	dlg.popup();
	dlg._contactField.focus();
};

ZmImNewChatDlg.prototype.reset = function() {
	this._acContactsList.reset();
	this._acContactsList.show(false);
	this._contactField.setValue("", true);
};

ZmImNewChatDlg.prototype._initAutocomplete = function() {
        if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
                var acCallback = new AjxCallback(this, this._autocompleteCallback);
                var contactsClass = appCtxt.getApp(ZmApp.CONTACTS);
                var contactsLoader = contactsClass.getContactList;
                var params = { parent	    : DwtShell.getShell(window),
		               dataClass    : contactsClass,
		               dataLoader   : contactsLoader,
                               matchValue   : ZmContactsApp.AC_VALUE_FULL,
		               compCallback : acCallback
		             };
                this._acContactsList = new ZmAutocompleteListView(params);
                this._acContactsList.handle(this._contactField.getInputElement());
        }
};

ZmImNewChatDlg.prototype._autocompleteCallback = function(text, el, match) {
	this._selectedItem = match.item;
	if (this._callbacks.onAutocomplete)
		this._callbacks.onAutocomplete(match.item, this, text, el, match);
};

ZmImNewChatDlg.prototype._okButtonListener = function() {
	if (this._callbacks.onOK)
		this._callbacks.onOK(this._selectedItem);
	this.popdown();
};

ZmImNewChatDlg.prototype._cancelButtonListener = function() {
	if (this._callbacks.onCancel)
		this._callbacks.onCancel();
	this.popdown();
};
