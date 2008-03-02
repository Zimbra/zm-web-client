/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
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

ZmNewRosterItemDialog = function(parent) {
	DwtDialog.call(this, {parent:parent, title:ZmMsg.createNewRosterItem});

	this._init();
};

ZmNewRosterItemDialog._OVERVIEW_ID = "ZmNewRosterItemDialog";

ZmNewRosterItemDialog.prototype = new DwtDialog;
ZmNewRosterItemDialog.prototype.constructor = ZmNewRosterItemDialog;

ZmNewRosterItemDialog.prototype._init = function() {
	this.setContent(this._contentHtml());
	var id = this._baseId;

	this._addrEntry = new DwtInputField({ parent	     : this,
					      size	     : 30,
					      required	     : true,
					      errorIconStyle : DwtInputField.ERROR_ICON_RIGHT
					    });
	this._addrEntry.reparentHtmlElement(id + "_address");

	this._nameEntry = new DwtInputField({ parent: this, size: 30 });
	this._nameEntry.reparentHtmlElement(id + "_name");

	this._groupsEntry = new DwtInputField({ parent: this, size: 30 });
	this._groupsEntry.reparentHtmlElement(id + "_groups");

        this._groupsDropDown = new DwtButton({parent:this});
        // this._groupsDropDown.setImage("SelectPullDownArrow");
        // this._groupsDropDown.addSelectionListener(new AjxListener(this, this._groupsDropDownListener));
        this._groupsDropDown.reparentHtmlElement(id + "_groupsDropDown");
        this._getGroupsMenu = new AjxCallback(this, this._getGroupsMenu);
        this._groupsDropDown.setMenu(this._getGroupsMenu);

	var options = [];
	var roster = AjxDispatcher.run("GetRoster");
	var gws = roster.getGateways();
	for (var i = 0; i < gws.length; i++) {
		var gw = gws[i];
                if (gw.type == "xmpp" || gw.isOnline()) {
                        var label = ZmMsg["imGateway_" + gw.type] || gw.type;
		        options.push(new DwtSelectOption(gw.type, i == 0, label));
                }
	}
	this._serviceTypeSelect = new DwtSelect({parent:this, options:options});
	this._serviceTypeSelect.reparentHtmlElement(id + "_serviceType");

	this.setTitle(ZmMsg.createNewRosterItem);
	this._initAddressAutocomplete();
	this._initGroupAutocomplete();
    	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okButtonListener));

	this._tabGroup.addMember(this._serviceTypeSelect);
	this._tabGroup.addMember(this._addrEntry);
	this._tabGroup.addMember(this._nameEntry);
	this._tabGroup.addMember(this._groupsEntry);

	this.addPopupListener(new AjxListener(this, this._popupListener));
};

// ZmNewRosterItemDialog.prototype._groupsDropDownListener = function(ev) {};

ZmNewRosterItemDialog.prototype._getSelGroupsArray = function() {
        var groups = this._groupsEntry.getValue();
        groups = groups.replace(/^\s*[,;]*\s*/, "");
        groups = groups.replace(/\s*[,;]*\s*$/, "");
        if (/\S/.test(groups))
                groups = groups.split(/\s*[;,]\s*/);
        else
                groups = [];
        return groups;
};

ZmNewRosterItemDialog.prototype._groupsMenuItemListener = function(ev) {
        var g = ev.item.getData("ZmImGroup");
        var groups = this._getSelGroupsArray();
        // remove it first
        for (var i = groups.length; --i >= 0;)
                if (groups[i].toLowerCase() == g.toLowerCase())
                        groups.splice(i, 1);

        if (ev.item.getChecked())
                groups.push(g);

        this._groupsEntry.setValue(groups.join(", "));
};

ZmNewRosterItemDialog.prototype._getGroupsMenu = function() {
        var menu = new ZmPopupMenu(this._groupsDropDown);

        // find groups currently defined in the buddy list
	var groups = AjxDispatcher.run("GetRoster").getGroups();
        groups.sort();

        // see what groups are currently selected
        var tmp = this._getSelGroupsArray();

        var selected_groups = {};
        for (var i = 0; i < tmp.length; ++i)
                selected_groups[tmp[i]] = 0;

        var itemListener = new AjxListener(this, this._groupsMenuItemListener);

        groups.foreach(function(label) {
                var item = new DwtMenuItem({parent:menu, style:DwtMenuItem.CHECK_STYLE});
                item.addSelectionListener(itemListener);
                item.setText(label);
                item.setData("ZmImGroup", label);
                if (label in selected_groups) {
                        selected_groups[label]++;
                        item.setChecked(true, true);
                }
        });

        // any additional groups?
        var added = false;
        for (var i in selected_groups) {
                if (selected_groups[i] == 0) {
                        // not encountered
                        if (!added) {
                                new DwtMenuItem({parent:menu, style:DwtMenuItem.SEPARATOR_STYLE});
                                added = true;
                        }
                        var item = new DwtMenuItem({parent:menu, style:DwtMenuItem.CHECK_STYLE});
                        item.addSelectionListener(itemListener);
                        item.setText(i);
                        item.setData("ZmImGroup", i);
                        // checked, because it's in selected_groups
                        item.setChecked(true, true);
                }
        }

        // make sure it's gone when it pops down; the groups can
        // change very dinamically so we don't wanna cache this menu.
        menu.addPopdownListener(new AjxListener(this, function() {
                // force rebuild the next time.
                this._groupsDropDown.setMenu(this._getGroupsMenu);
                menu.dispose();
        }));

        return menu;
};

ZmNewRosterItemDialog.prototype._popupListener = function() {
        this._addrEntry.focus();
        this._tabGroup.setFocusMember(this._addrEntry);

        // FIXME: the following works around a wicked FF bug that manifests
	// only in Windows or Mac (because it's there where we display the
	// semiopaque veil).  The bug prevents this dialog from being visible,
	// because immediately after the veil is displayed, this.getSize()
	// (used in DwtBaseDialog::_positionDialog) returns a huge width,
	// ~7000px, which positions the left side of the dialog much below 0px.
        var pos = this.getLocation();
	if (pos.x < 0) {
		// Amazing! the following doesn't work:
		// pos.x = 400;
		// this.setLocation(pos);
		// console.log(pos);
		// console.log(this.getLocation());

		// this works
                // 			var el = this.getHtmlElement();
                // 			el.style.left = "400px";

		setTimeout(AjxCallback.simpleClosure(function() {
			this._positionDialog();
		}, this), 1);
	}
};

ZmNewRosterItemDialog.prototype._contentHtml = function() {
	var id = this._baseId = Dwt.getNextId();
	return AjxTemplate.expand("im.Chat#NewRosterItemDlg",
				  { id : id });
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
	DwtDialog.prototype.reset.call(this);
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
	if (this._addressAutocomplete || !appCtxt.get(ZmSetting.CONTACTS_ENABLED))
		return;

	var contactsApp = appCtxt.getApp(ZmApp.CONTACTS);
	var contactsList = contactsApp ? contactsApp.getContactList : null;
	var params = { parent	  : appCtxt.getShell(),
		       dataClass  : contactsApp,
		       dataLoader : contactsList,
		       matchValue : ZmContactsApp.AC_VALUE_EMAIL
		     };
	this._addressAutocomplete = new ZmAutocompleteListView(params);
	this._addressAutocomplete.handle(this._addrEntry.getInputElement());
};

ZmNewRosterItemDialog.prototype._initGroupAutocomplete = function() {
	if (this._groupAutocomplete) return;

	var imApp = appCtxt.getApp(ZmApp.IM);
	var groupList = imApp ? imApp.getAutoCompleteGroups : null;
	var params = { parent	  : appCtxt.getShell(),
		       dataClass  : imApp,
		       dataLoader : groupList,
		       matchValue : "text",
		       separator  : ','
		     };
	this._groupAutocomplete = new ZmAutocompleteListView(params);
	this._groupAutocomplete.handle(this._groupsEntry.getInputElement());
};

ZmNewRosterItemDialog.prototype._showError = function(msg, loc) {
	var msgDialog = appCtxt.getMsgDialog();
	msgDialog.reset();
	loc = loc ? loc : new DwtPoint(this.getLocation().x + 50, this.getLocation().y + 100);
	msgDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
	msgDialog.popup(loc);
	return null;
};
