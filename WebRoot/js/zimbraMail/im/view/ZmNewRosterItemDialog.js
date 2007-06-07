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

ZmNewRosterItemDialog = function(parent, appCtxt) {
	ZmQuickAddDialog.call(this, parent, null, null);
	this._appCtxt = appCtxt;

	this._init();
};

ZmNewRosterItemDialog._OVERVIEW_ID = "ZmNewRosterItemDialog";

ZmNewRosterItemDialog.prototype = new ZmQuickAddDialog;
ZmNewRosterItemDialog.prototype.constructor = ZmNewRosterItemDialog;

ZmNewRosterItemDialog.prototype._init = function() {
	this.setContent(this._contentHtml());
	var id = this._baseId;

	this._addrEntry = new DwtInputField({ parent: this, size: 30, required: true });
	this._addrEntry.reparentHtmlElement(id + "_address");

	this._nameEntry = new DwtInputField({ parent: this, size: 30 });
	this._nameEntry.reparentHtmlElement(id + "_name");

	this._groupsEntry = new DwtInputField({ parent: this, size: 30, required: true });
	this._groupsEntry.reparentHtmlElement(id + "_groups");

	var options = [];
	var roster = AjxDispatcher.run("GetRoster");
	var gws = roster.getGateways();
	for (var i = 0; i < gws.length; i++) {
		var gw = gws[i];
		options.push(new DwtSelectOption(gw.type, i == 0, gw.type));
	}
	this._serviceTypeSelect = new DwtSelect(this, options);
	this._serviceTypeSelect.reparentHtmlElement(id + "_serviceType");

	this.setTitle(ZmMsg.createNewRosterItem);
	this._initAddressAutocomplete();
	this._initGroupAutocomplete();
    	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okButtonListener));

	this._tabGroup.addMember(this._serviceTypeSelect);
	this._tabGroup.addMember(this._addrEntry);
	this._tabGroup.addMember(this._nameEntry);
	this._tabGroup.addMember(this._groupsEntry);
};

ZmNewRosterItemDialog.prototype._contentHtml = function() {
	var id = this._baseId = Dwt.getNextId();
	return AjxTemplate.expand("zimbraMail.im.templates.Chat#NewRosterItemDlg",
				  { id : id });
};

ZmNewRosterItemDialog.prototype.popup = function(loc) {
	DwtDialog.prototype.popup.call(this, loc);
	this._serviceTypeSelect.focus();
};

ZmNewRosterItemDialog.prototype._okButtonListener = function(ev) {
	var results = this._getRosterItemData();
	if (results)
		DwtDialog.prototype._buttonListener.call(this, ev, results);
};

ZmNewRosterItemDialog.prototype._getRosterItemData = function() {
	var name = AjxStringUtil.trim(this._nameEntry.getValue());
	var msg = ZmRosterItem.checkName(name);

	var address = AjxStringUtil.trim(this._addrEntry.getValue());
	if (address) address = address.replace(/;$/, "");
	address = AjxDispatcher.run("GetRoster").makeServerAddress(address, this._serviceTypeSelect.getValue());
	if (!msg) msg = ZmRosterItem.checkAddress(address);

	var groups = AjxStringUtil.trim(this._groupsEntry.getValue());
	if (groups) groups = groups.replace(/,$/, "");
	if (!msg) msg = ZmRosterItem.checkGroups(groups);

	return (msg ? this._showError(msg) : [address, name, groups]);
};

ZmNewRosterItemDialog.prototype.reset = function() {
	ZmDialog.prototype.reset.call(this);
	this._addrEntry.setValue("");
	this._addrEntry.setEnabled(true);
	this._serviceTypeSelect.setEnabled(true);
	this._nameEntry.setValue("");
	this._groupsEntry.setValue("");
};

ZmNewRosterItemDialog.prototype.setGroups = function(newGroups) {
	this._groupsEntry.setValue(newGroups || "");
};

ZmNewRosterItemDialog.prototype.setName = function(newName) {
	this._nameEntry.setValue(newName || "");
};

ZmNewRosterItemDialog.prototype.setAddress = function(newAddress, readonly) {
	var a = AjxDispatcher.run("GetRoster").breakDownAddress(newAddress);
	if (a.type) {
		this._serviceTypeSelect.setSelectedValue(a.type);
		newAddress = a.addr;
	}
	this._addrEntry.setValue(newAddress);
	if (readonly) {
		this._addrEntry.setEnabled(false);
		this._serviceTypeSelect.setEnabled(false);
	}
};


ZmNewRosterItemDialog.prototype._initAddressAutocomplete = function() {
	if (this._addressAutocomplete || !this._appCtxt.get(ZmSetting.CONTACTS_ENABLED))
		return;

	var shell = this._appCtxt.getShell();
	var contactsApp = shell ? shell.getData(ZmAppCtxt.LABEL).getApp(ZmApp.CONTACTS) : null;
	var contactsList = contactsApp ? contactsApp.getContactList : null;
	var params = { parent	  : shell,
		       dataClass  : contactsApp,
		       dataLoader : contactsList,
		       matchValue : ZmContactsApp.AC_VALUE_EMAIL
		     };
	this._addressAutocomplete = new ZmAutocompleteListView(params);
	this._addressAutocomplete.handle(this._addrEntry.getInputElement());
};

ZmNewRosterItemDialog.prototype._initGroupAutocomplete = function() {
	if (this._groupAutocomplete) return;

	var shell = this._appCtxt.getShell();
	var imApp = shell ? shell.getData(ZmAppCtxt.LABEL).getApp(ZmApp.IM) : null;
	var groupList = imApp ? imApp.getAutoCompleteGroups : null;
	var params = { parent	  : shell,
		       dataClass  : imApp,
		       dataLoader : groupList,
		       matchValue : "text",
		       separator  : ','
		     };
	this._groupAutocomplete = new ZmAutocompleteListView(params);
	this._groupAutocomplete.handle(this._groupsEntry.getInputElement());
};

ZmNewRosterItemDialog.prototype._showError = function(msg, loc) {
	var msgDialog = this._appCtxt.getMsgDialog();
	msgDialog.reset();
	loc = loc ? loc : new DwtPoint(this.getLocation().x + 50, this.getLocation().y + 100);
	msgDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
	msgDialog.popup(loc);
	return null;
};
