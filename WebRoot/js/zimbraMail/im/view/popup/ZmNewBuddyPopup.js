/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

ZmNewBuddyPopup = function(params) {
	ZmTaskbarPopup.call(this, params);
	this._createTabGroupMember();
	this._init();
};

ZmNewBuddyPopup.prototype = new ZmTaskbarPopup;
ZmNewBuddyPopup.prototype.constructor = ZmNewBuddyPopup;

ZmNewBuddyPopup.prototype.toString =
function() {
	return "ZmNewBuddyPopup";
};

ZmNewBuddyPopup.prototype.popup =
function() {
	ZmTaskbarPopup.prototype.popup.apply(this, arguments);
	this.reset();
	this._addrEntry.focus();
	this._setFocusMember(this._addrEntry);

	// find groups currently defined in the buddy list
	this._groups = AjxDispatcher.run("GetRoster").getGroups();
	this._groups.sort();
	this._groupsDropDown.setVisible(this._groups.size() > 0);

	// Set state of service options.
	var roster = AjxDispatcher.run("GetRoster");
	var gws = roster.getGateways();
	var firstOnline;
	for (var i = 0; i < gws.length; i++) {
		var gw = gws[i];
		var online = (gw.type == "xmpp") || gw.isOnline();
		this._serviceTypeSelect.enableOption(gw.type, online);
		if (!firstOnline && online) {
			firstOnline = gw.type;
		}
	}
	var selectedValue = this._serviceTypeSelect.getValue(),
		selectedOption = this._serviceTypeSelect.getOptionWithValue(selectedValue);
	if (selectedOption && !selectedOption.enabled && firstOnline) {
		this._serviceTypeSelect.setSelectedValue(firstOnline);
	}
};


ZmNewBuddyPopup.prototype._init =
function() {
	var contentEl = this._createPopupHtml(ZmMsg.createNewRosterItem);
	var id = this._htmlElId;
	contentEl.innerHTML = AjxTemplate.expand("im.Chat#NewRosterItemDlg", { id : id });


	this._addrEntry = new DwtInputField({ parent		 : this,
		size		 : 30,
		required		 : true,
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
		var label = ZmMsg["imGateway_" + gw.type] || gw.type;
		options.push(new DwtSelectOption(gw.type, i == 0, label));
	}
	this._serviceTypeSelect = new DwtSelect({parent:this, options:options});
	this._serviceTypeSelect.reparentHtmlElement(id + "_serviceType");
	if (options.length <= 1) {
		Dwt.setVisible(Dwt.byId(this._htmlElId + "_serviceParent"), false);
	}

	var okButton = new DwtButton({ parent: this, parentElement: id + "_okButton" });
	okButton.setText(ZmMsg.ok);
	okButton.addSelectionListener(new AjxListener(this, this._okButtonListener));

	var cancelButton = new DwtButton({ parent: this, parentElement: id + "_cancelButton" });
	cancelButton.setText(ZmMsg.cancel);
	cancelButton.addSelectionListener(new AjxListener(this, this._cancelButtonListener));

	//	this.setTitle(ZmMsg.createNewRosterItem);
	this._initAddressAutocomplete();
	this._initGroupAutocomplete();

	this._tabGroup.addMember(this._serviceTypeSelect);
	this._tabGroup.addMember(this._addrEntry);
	this._tabGroup.addMember(this._nameEntry);
	this._tabGroup.addMember(this._groupsEntry);
	this._tabGroup.addMember(okButton);
	this._tabGroup.addMember(cancelButton);
};

ZmNewBuddyPopup.prototype._getSelGroupsArray = function() {
        var groups = this._groupsEntry.getValue();
        groups = groups.replace(/^\s*[,;]*\s*/, "");
        groups = groups.replace(/\s*[,;]*\s*$/, "");
        if (/\S/.test(groups))
                groups = groups.split(/\s*[;,]\s*/);
        else
                groups = [];
        return groups;
};

ZmNewBuddyPopup.prototype._groupsMenuItemListener = function(ev) {
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

ZmNewBuddyPopup.prototype._getGroupsMenu = function() {
	var menu = new ZmPopupMenu(this._groupsDropDown);

        // find groups currently defined in the buddy list
	var groups = this._groups;

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
	menu.addPopdownListener(new AjxListener(this, this._groupsPopdownListener, [menu]));

	return menu;
};

ZmNewBuddyPopup.prototype._groupsPopdownListener =
function(menu) {
	// Dispose the menu on a timer, to make sure other listners get the popdown event
	// before we dispose the menu.
	var action = new AjxTimedAction(this, function() {
		// force rebuild the next time.
		this._groupsDropDown.setMenu(this._getGroupsMenu);
		menu.dispose();
	});
	AjxTimedAction.scheduleAction(action, 10000);
};

ZmNewBuddyPopup.prototype._popupListener = function() {
	this._addrEntry.focus();
	this._setFocusMember(this._addrEntry);

	// find groups currently defined in the buddy list
	this._groups = AjxDispatcher.run("GetRoster").getGroups();
	this._groups.sort();
	this._groupsDropDown.setVisible(this._groups.size() > 0);

};

ZmNewBuddyPopup.prototype._contentHtml = function() {
	var id = this._baseId = Dwt.getNextId();                                                                                         
	return AjxTemplate.expand("im.Chat#NewRosterItemDlg",
				  { id : id });
};

ZmNewBuddyPopup.prototype._okButtonListener =
function() {
	var results = this._getRosterItemData();
	if (results) {
		ZmImApp.INSTANCE.getRoster().createRosterItem(results.address, results.name, results.groups);
		this._doPopdown();
	}
};

ZmNewBuddyPopup.prototype._onEnter =
function() {
	this._okButtonListener();
};

ZmNewBuddyPopup.prototype._cancelButtonListener =
function() {
	this._doPopdown();
};

ZmNewBuddyPopup.prototype._getRosterItemData = function() {
	var name = AjxStringUtil.trim(this._nameEntry.getValue());
	var msg = ZmRosterItem.checkName(name);

	var address = AjxStringUtil.trim(this._addrEntry.getValue());
	if (address) address = address.replace(/;$/, "");

	var serviceType = this._serviceTypeSelect.getValue();
	if (serviceType == "yahoo") {
		address = address.replace(/@yahoo.com/i, "");
	}
	address = AjxDispatcher.run("GetRoster").makeServerAddress(address, serviceType);
	if (!msg) msg = ZmRosterItem.checkAddress(address);

	var groups = AjxStringUtil.trim(this._groupsEntry.getValue());
	if (groups) groups = groups.replace(/,$/, "");
	if (!msg) msg = ZmRosterItem.checkGroups(groups);

	return (msg ? this._showError(msg) : {address: address, name: name, groups: groups});
};

ZmNewBuddyPopup.prototype.reset = function() {
	this.setTitle(ZmMsg.createNewRosterItem);
	this._addrEntry.setValue("");
	this._addrEntry.setEnabled(true);
	this._serviceTypeSelect.setEnabled(true);
	this._nameEntry.setValue("");
	this._groupsEntry.setValue("");
};

ZmNewBuddyPopup.prototype.setGroups = function(newGroups) {
	this._groupsEntry.setValue(newGroups || "");
};

ZmNewBuddyPopup.prototype.setName = function(newName) {
	this._nameEntry.setValue(newName || "");
};

ZmNewBuddyPopup.prototype.setService = function(service) {
	this._serviceTypeSelect.setSelectedValue(service);
};

ZmNewBuddyPopup.prototype.setAddress = function(newAddress, readonly) {
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

ZmNewBuddyPopup.prototype._initAddressAutocomplete = function() {
	if (this._addressAutocomplete) { return; }

	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED) || appCtxt.get(ZmSetting.GAL_ENABLED)) {
		var params = {
			dataClass: appCtxt.getAutocompleter(),
			matchValue : ZmAutocomplete.AC_VALUE_EMAIL
		};
		this._addressAutocomplete = new ZmAutocompleteListView(params);
		this._addressAutocomplete.handle(this._addrEntry.getInputElement());
	}
};

ZmNewBuddyPopup.prototype._initGroupAutocomplete = function() {
	if (this._groupAutocomplete) { return; }

	var imApp = appCtxt.getApp(ZmApp.IM);
	var groupList = imApp ? imApp.getAutoCompleteGroups : null;
	var params = {
		       dataClass  : imApp,
		       dataLoader : groupList,
		       matchValue : "text",
		       separator  : ','
		     };
	this._groupAutocomplete = new ZmAutocompleteListView(params);
	this._groupAutocomplete.handle(this._groupsEntry.getInputElement());
};

