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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

/** small dialog for picking one contact with an autocompletion entry */

ZmOneContactPicker = function() {
	DwtDialog.call(this, DwtShell.getShell(window), null, ZmMsg.selectContact);
	this._init();
};

ZmOneContactPicker.prototype = new DwtDialog;
ZmOneContactPicker.prototype.constructor = ZmOneContactPicker;

ZmOneContactPicker.prototype._init = function() {
	var field = new DwtInputField({ parent : this,
					size   : 25,
					hint   : ZmMsg.search });
	this._contactField = field;
	var id = field.getInputElement().id;
	var div = document.createElement("div");
	div.innerHTML = AjxTemplate.expand("zimbraMail.abook.templates.Contacts#OneContactPicker", { id: id });
	this._getContentDiv().appendChild(div);
	field.reparentHtmlElement(id + "_entryCell");
	this._initAutocomplete();
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okButtonListener));
        this.setButtonListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this, this._cancelButtonListener));
};

ZmOneContactPicker._INSTANCE = null;
ZmOneContactPicker.getInstance = function() {
	if (!ZmOneContactPicker._INSTANCE) {
		ZmOneContactPicker._INSTANCE = new ZmOneContactPicker();
	}
	return ZmOneContactPicker._INSTANCE;
};

ZmOneContactPicker.showPicker = function(callbacks) {
	var dlg = ZmOneContactPicker.getInstance();
	dlg._callbacks = callbacks || {};
	dlg.reset();
	dlg.popup();
	dlg._contactField.focus();
};

ZmOneContactPicker.prototype.reset = function() {
	this._acContactsList.reset();
	this._acContactsList.show(false);
	this._contactField.setValue("", true);
};

ZmOneContactPicker.prototype._initAutocomplete = function() {
	var shell = DwtShell.getShell(window);
	var appCtxt = ZmAppCtxt.getFromShell(shell);
        var acCallback = new AjxCallback(this, this._autocompleteCallback);

        if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
                var contactsClass = appCtxt.getApp(ZmApp.CONTACTS);
                var contactsLoader = contactsClass.getContactList;
                var params = { parent	    : shell,
			       dataClass    : contactsClass,
			       dataLoader   : contactsLoader,
                               matchValue   : ZmContactsApp.AC_VALUE_FULL,
			       compCallback : acCallback
			     };
                this._acContactsList = new ZmAutocompleteListView(params);
                this._acContactsList.handle(this._contactField.getInputElement());
        }
};

ZmOneContactPicker.prototype._autocompleteCallback = function(text, el, match) {
	this._selectedItem = match.item;
	if (this._callbacks.onAutocomplete)
		this._callbacks.onAutocomplete(match.item, this, text, el, match);
};

ZmOneContactPicker.prototype._okButtonListener = function() {
	if (this._callbacks.onOK)
		this._callbacks.onOK(this._selectedItem);
	this.popdown();
};

ZmOneContactPicker.prototype._cancelButtonListener = function() {
	if (this._callbacks.onCancel)
		this._callbacks.onCancel();
	this.popdown();
};
