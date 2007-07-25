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

// TODOs
// Somewhere in here, I need to create proxies of the features. (Or maybe as an easy hack, just work directly on the model. It's not used anywhere else.)


ZmVoicePrefsView = function(parent, appCtxt, controller) {
	DwtTabViewPage.call(this, parent, "ZmPreferencesPage");

	this._appCtxt = appCtxt;
	this._controller = controller;
	this._hasRendered = false;
	this._item = null;
	
    var section = ZmPref.getPrefSectionWithPref(ZmSetting.VOICE_ACCOUNTS);
	this._title = [ZmMsg.zimbraTitle, ZmMsg.options, section && section.title].join(": ");
	this._ui = [
		new ZmVoicePageSizeUI(this),
		new ZmEmailNotificationUI(this),
		new ZmCallForwardingUI(this),
		new ZmSelectiveCallForwardingUI(this)
	];
	this._changes = null;
};

ZmVoicePrefsView.prototype = new DwtTabViewPage;
ZmVoicePrefsView.prototype.constructor = ZmVoicePrefsView;
 
ZmVoicePrefsView.prototype.toString =
function() {
	return "ZmVoicePrefsView";
};

ZmVoicePrefsView.prototype.hasRendered =
function () {
	return this._hasRendered;
};

ZmVoicePrefsView.prototype.getList =
function() {
	return this._list;
};

ZmVoicePrefsView.prototype.setItem =
function(item) {
	this._item = item;
//TODO: Retarded.
	this._getChanges();
	this.showItem(item);
};

ZmVoicePrefsView.prototype.validate =
function() {
	return true;
};

ZmVoicePrefsView.prototype.getTitle =
function() {
	return this._title;
};

ZmVoicePrefsView.prototype.showMe =
function() {
	Dwt.setTitle(this._title);
	if (this._hasRendered) return;

    var contacts = AjxDispatcher.run("GetContacts");
    this._me = contacts.getMe ? contacts.getMe() : [];
    if (this._me.length) {
        contacts.addChangeListener(new AjxListener(this, this._contactsChangeListener));
    }
	this._appCtxt.getApp(ZmApp.VOICE).getVoiceInfo(new AjxCallback(this, this._handleResponseGetVoiceInfo));
};

ZmVoicePrefsView.prototype._handleResponseGetVoiceInfo =
function() {
	var id = this._htmlElId;
	var data = { id: id };
	this.getHtmlElement().innerHTML = AjxTemplate.expand("zimbraMail.voicemail.templates.Voicemail#ZmVoicePrefsView", data);

	// Create the list view and the contents of the detail pane.
	this._list = new ZmPhoneList(this, this._appCtxt);
	this._list.replaceElement(id + "_list");
	this._list.enableSorting(false);

	for(var i = 0, count = this._ui.length; i < count; i++) {
		this._ui[i]._initialize(id);
		this._ui[i].setMe(this._me);
	}

	this._controller._setup();

	this._hasRendered = true;
};

ZmVoicePrefsView.prototype.isDirty =
function() {
	this._getChanges();
	return this._changes != null;
};

ZmVoicePrefsView.prototype._getChanges =
function() {
	if (!this._phone) {
		return;
	}
	for(var i = 0, count = this._ui.length; i < count; i++) {
		if (this._ui[i].isDirty()) {
			this._addChange(this._ui[i]);
		}
	}
};

ZmVoicePrefsView.prototype._addChange =
function(ui) {
	var list;
	if (!this._changes) {
		this._changes = {};
	} else {
		var change = this._changes[this._phone.name];
		if (change) {
			list = change.list;
		}
	}
	
	if (list) {
		var found = false;
		for (var i = 0, count = list.length; i < count; i++) {
			if (list[i].name == ui.getName()) {
				found = true;
				break;
			}
		}
		if (!found) {
			list.push(ui.getFeature());
		}
	} else {
		this._changes[this._phone.name] = {phone: this._phone, list: [ui.getFeature()]};
	}
};

ZmVoicePrefsView.prototype.reset =
function() {
	this._changes = null;
	this.showItem(this._item);
};

ZmVoicePrefsView.prototype.showItem =
function(phone) {
//Retarded: saving a reference to the phone here, even though the parent class has it (as _item).
	this._phone = phone;
	phone.getCallFeatures(new AjxCallback(this, this._handleResponseGetFeatures, phone));
};

ZmVoicePrefsView.prototype._handleResponseGetFeatures =
function(phone, features) {
	for(var i = 0, count = this._ui.length; i < count; i++) {
		var feature = features[this._ui[i].getName()];
		this._ui[i].setFeature(feature);
	}
};

ZmVoicePrefsView.prototype.addCommand =
function(batchCommand) {
	var first = true;
	for (var i in this._changes) {
		var phone = this._changes[i].phone;
		var callback = null;
		if (first) {
			if (!this._handleResponseObj) {
				this._handleResponseObj = new AjxCallback(this, this._handleResponse);
			}
			callback = this._handleResponseObj;
			first = false;
		}
		phone.modifyCallFeatures(batchCommand, this._changes[i].list, callback);
	 }
};

ZmVoicePrefsView.prototype._handleResponse =
function(identity, request, result) {
	this._changes  = null;
};

ZmVoicePrefsView.prototype._containsMe =
function(contacts) {
    for(var contactIndex = 0, contactCount = contacts.length; contactIndex < contactCount; contactIndex++) {
        var contact = contacts[contactIndex];
        for (var meIndex = 0, meCount = this._me.length; meIndex < meCount; meIndex++) {
            var me = this._me[meIndex];
            if (me.id == contact.id) {
                return true;
            }
        }
    }
    return false;
};

ZmVoicePrefsView.prototype._contactsChangeListener =
function(ev) {
	var redraw = false;
	if (ev.event == ZmEvent.E_MODIFY) {
        var meChanged = false;
        var contacts = ev.getDetails().items;
		if (contacts && this._containsMe(contacts)) {
            for(var i = 0, count = this._ui.length; i < count; i++) {
                this._ui[i].setMe(this._me);
            }
        }
	}
};

ZmCallFeatureUI = function(view) {
	this._view = view;
}

ZmCallFeatureUI.prototype.setFeature =
function(feature) {
	this._feature = feature;
	this.show(feature);
	if (this._checkbox) {
		this._checkbox.setSelected(feature.isActive);
		this._checkbox.setEnabled(feature.isSubscribed);
	}
	this.setEnabled(feature.isActive);
};

ZmCallFeatureUI.prototype.getFeature =
function() {
	var result = this._feature.createProxy();
	result.isActive = this._checkbox ? this._checkbox.isSelected() : true;
	return result;
};

ZmCallFeatureUI.prototype.isDirty =
function() {
	if (!this._feature) {
		return false;
	}
	if (this._checkbox && (this._feature.isActive != this._checkbox.isSelected())) {
		return true;
	}
	return this._isValueDirty();
};

ZmCallFeatureUI.prototype._createCheckbox =
function(text, id) {
	this._checkbox = new DwtCheckbox(this._view);
	this._checkbox.setText(text);
	this._checkbox.replaceElement(id);
	this._checkbox.addSelectionListener(new AjxListener(this, this._checkboxListener));
};

ZmCallFeatureUI.prototype._checkboxListener =
function(ev) {
	this.setEnabled(this._checkbox.isSelected());
};

ZmCallFeatureUI.prototype._populatePhoneComboBox =
function(comboBox) {
    comboBox.removeAll();
    for (var meIndex = 0, meCount = this._view._me.length; meIndex < meCount; meIndex++) {
        var me = this._view._me[meIndex];
        for (var fieldIndex = 0, fieldCount = ZmContact.F_PHONE_FIELDS.length; fieldIndex < fieldCount; fieldIndex++) {
            var fieldId = ZmContact.F_PHONE_FIELDS[fieldIndex];
            var phone = me.getAttr(fieldId);
            if (phone) {
                var name = ZmPhone.calculateName(phone);
                var display = [ZmMsg["AB_FIELD_" + fieldId], " ", ZmPhone.calculateDisplay(name)].join("");
                comboBox.add(display, name, false);
            }
        }
    }
};

ZmCallFeatureUI.prototype._populateEmailComboBox =
function(comboBox) {
    comboBox.removeAll();
    var accountAddress = this._view._appCtxt.get(ZmSetting.USERNAME);
    this._comboBox.add(accountAddress, false);
    for (var meIndex = 0, meCount = this._view._me.length; meIndex < meCount; meIndex++) {
        var me = this._view._me[meIndex];
        for (var fieldIndex = 0, fieldCount = ZmContact.F_EMAIL_FIELDS.length; fieldIndex < fieldCount; fieldIndex++) {
            var fieldId = ZmContact.F_EMAIL_FIELDS[fieldIndex];
            var email = me.getAttr(fieldId);
            if (email) {
                var accountAddressLower = null;
                if (!accountAddressLower) {
                    accountAddressLower = accountAddress.toLowerCase();
                }
                if (email.toLowerCase != accountAddressLower) {
                    comboBox.add(email, email, false);
                }
            }
        }
    }
};

// "Abstract" methods:
ZmCallFeatureUI.prototype.getName =
function() {
	alert('ZmCallFeatureUI.prototype.getName');
};
ZmCallFeatureUI.prototype._initialize =
function(id) {
	alert('ZmCallFeatureUI.prototype._initialize');
};
ZmCallFeatureUI.prototype.setEnabled =
function(enabled) {
	alert('ZmCallFeatureUI.prototype.setEnabled ' + enabled);
};
ZmCallFeatureUI.prototype.setMe =
function(me) {
	// No-op.
};



/////////////////////////////////////////////////////////////////////////

ZmCallForwardingUI = function(view) {
	ZmCallFeatureUI.call(this, view);
	this._checkbox = null;
}
ZmCallForwardingUI.prototype = new ZmCallFeatureUI;
ZmCallForwardingUI.prototype.constructor = ZmCallForwardingUI;
ZmCallForwardingUI.prototype.toString = 
function() {
	return "ZmCallForwardingUI";
}

ZmCallForwardingUI.prototype.getName =
function() {
	return ZmCallFeature.CALL_FORWARDING;
};

ZmCallForwardingUI.prototype.show =
function(feature) {
	var display = ZmPhone.calculateDisplay(feature.data.ft);
	this._comboBox.setText(display);
};

ZmCallForwardingUI.prototype._isValueDirty =
function() {
	if (this._getSelectedValue() != this._feature.data.ft) {
		return true;
	}
	return false;
};

ZmCallForwardingUI.prototype.getFeature =
function() {
	var result = ZmCallFeatureUI.prototype.getFeature.call(this);
	result.data.ft = ZmPhone.calculateName(this._comboBox.getText());
	return result;
};

ZmCallForwardingUI.prototype.setEnabled =
function(enabled) {
	this._comboBox.setEnabled(enabled);
};

ZmCallForwardingUI.prototype.setMe =
function() {
    this._populatePhoneComboBox(this._comboBox);
};

ZmCallForwardingUI.prototype._getSelectedValue =
function() {
	var value = this._comboBox.getValue();
	if (value) {
		return value;
	} else {
		return ZmPhone.calculateName(this._comboBox.getText());
	}
};

ZmCallForwardingUI.prototype._initialize =
function(id) {
	this._createCheckbox(ZmMsg.callForwardingDescription, id + "_callForwardingCheckbox");
	
	var inputParams = { size:25 }
	this._comboBox = new DwtComboBox(this._view, inputParams);
	this._comboBox.replaceElement(id + "_callForwardingComboBox");
};

/////////////////////////////////////////////////////////////////////////

ZmSelectiveCallForwardingUI = function(view) {
	ZmCallFeatureUI.call(this, view);
	this._checkbox = null;
	this._removeCallbackObj = AjxCallback.simpleClosure(this._removeCallback, this);
	this._tableIsDirty = false;
}
ZmSelectiveCallForwardingUI.prototype = new ZmCallFeatureUI;
ZmSelectiveCallForwardingUI.prototype.constructor = ZmSelectiveCallForwardingUI;
ZmSelectiveCallForwardingUI.prototype.toString = 
function() {
	return "ZmSelectiveCallForwardingUI";
}

ZmSelectiveCallForwardingUI.prototype.getName =
function() {
	return ZmCallFeature.SELECTIVE_CALL_FORWARDING;
};

ZmSelectiveCallForwardingUI.prototype.show =
function(feature) {
	var display = ZmPhone.calculateDisplay(feature.data.ft);
	this._comboBox.setText(display);
	var parent = this._getTableParent();
	
	var phones = [];
	var rowCount = feature.data.phone ? feature.data.phone.length : 0;
	for(var i = 0; i < rowCount; i++) {
		var name = feature.data.phone[i].pn;
		phones[i] = ZmPhone.calculateDisplay(name);
	}
	var args = { phones: phones, id: this._view._htmlElId};
	parent.innerHTML = AjxTemplate.expand("zimbraMail.voicemail.templates.Voicemail#ZmVoiceSelectiveCallForwardingTable", args);
	for (var i = 0; i < rowCount; i++) {
		var link = document.getElementById(this._view._htmlElId + "_selectiveCallForwardingRemove_" + i);
		link.onclick = this._removeCallbackObj;
	}
	this._tableIsDirty = false;
};


ZmSelectiveCallForwardingUI.prototype._getTableParent =
function() {
	return document.getElementById(this._view._htmlElId + "_selectiveCallForwardingTableParent");
};

ZmSelectiveCallForwardingUI.prototype._getTable =
function() {
	return document.getElementById(this._view._htmlElId + "_selectiveCallForwardingTable");
};

ZmSelectiveCallForwardingUI.prototype._isValueDirty =
function() {
	if (this._getSelectedValue() != this._feature.data.ft) {
		return true;
	} else if (this._tableIsDirty) {
		return true;
	}
	return false;
};

ZmSelectiveCallForwardingUI.prototype.getFeature =
function() {
	var result = ZmCallFeatureUI.prototype.getFeature.call(this);
	result.data.ft = ZmPhone.calculateName(this._comboBox.getText());
	var names = this._getFromNumbers();
	result.data.phone = [];
	for (var i = 0, count = names.length; i < count; i++) {
		result.data.phone.push({ a: true, pn: names[i] });
	}
	return result;
};

ZmSelectiveCallForwardingUI.prototype._getFromNumbers =
function() {
	var result = [];
	var rows = this._getTable().rows;
	for(var i = 1, count = rows.length; i < count; i++) {
		var cell = rows[i].cells[0].childNodes[0].rows[0].cells[0]; // Byick....surf through the big table structures to find the phone number text.
		var display = AjxUtil.getInnerText(cell);
		result.push(ZmPhone.calculateName(display));
	}
	return result;
};

ZmSelectiveCallForwardingUI.prototype.setEnabled =
function(enabled) {
	this._comboBox.setEnabled(enabled);
	this._addInput.setEnabled(enabled);
	this._addButton.setEnabled(enabled);
};

ZmSelectiveCallForwardingUI.prototype.setMe =
function() {
    this._populatePhoneComboBox(this._comboBox);
};

ZmSelectiveCallForwardingUI.prototype._getSelectedValue =
function() {
	var value = this._comboBox.getValue();
	if (value) {
		return value;
	} else {
		return ZmPhone.calculateName(this._comboBox.getText());
	}
};

ZmSelectiveCallForwardingUI.prototype._addListener =
function(ev) {
	var error = null;
	var value = AjxStringUtil.trim(this._addInput.getValue());
	if (!value.length) {
		error = ZmMsg.errorNoPhone;
	} else {
		var fromNumbers = this._getFromNumbers();
		var name = ZmPhone.calculateName(value);
		for (var i = 0, count = fromNumbers.length; i < count; i++) {
			if (name == fromNumbers[i]) {
				error = ZmMsg.errorPhoneNotUnique;
				break;
			}
		}
	}
	if (error) {
		this._view._appCtxt.setStatusMsg(error, ZmStatusView.LEVEL_WARNING);
		return;
	}
	var row = this._getTable().insertRow(-1);
	row.className = "Row " + ((row.rowIndex % 2) ? DwtListView.ROW_CLASS_ODD : DwtListView.ROW_CLASS_EVEN);
	var cell = row.insertCell(-1);
	var args = { text: value, linkId: Dwt.getNextId() };
	cell.innerHTML = AjxTemplate.expand("zimbraMail.voicemail.templates.Voicemail#ZmVoiceSelectiveCallForwardingTableRow", args);
	var link = document.getElementById(args.linkId);
	link.onclick = this._removeCallbackObj;
	this._addInput.setValue("");
	this._tableIsDirty = true;
};

ZmSelectiveCallForwardingUI.prototype._inputKeyListener =
function(ev) {
	if (ev.keyCode == DwtKeyEvent.KEY_RETURN) {
		this._addListener(ev);
	}
};

ZmSelectiveCallForwardingUI.prototype._removeCallback =
function(ev) {
	var node = DwtUiEvent.getTarget(ev);
	while (node) {
		if (node.tagName.toUpperCase() == "TR") {
			var className = node.className;
			if ((className.indexOf(DwtListView.ROW_CLASS_ODD)) != -1 || (className.indexOf(DwtListView.ROW_CLASS_EVEN) != -1)) {
				var rowIndex = node.rowIndex;
				var table = this._getTable();
				table.deleteRow(rowIndex);
				var rows = table.rows;
				for (var i = rowIndex || 0, count = rows.length; i < count; i++) {
					rows[i].className = "Row " + ((i % 2) ? DwtListView.ROW_CLASS_ODD : DwtListView.ROW_CLASS_EVEN);
				}
				this._tableIsDirty = true;
				break;
			}
		}
		node = node.parentNode;
	}
};

ZmSelectiveCallForwardingUI.prototype._initialize =
function(id) {
	this._createCheckbox(ZmMsg.selectiveCallForwardingDescription, id + "_selectiveCallForwardingCheckbox");
	
	var inputParams = { size:25 }
	this._comboBox = new DwtComboBox(this._view, inputParams);
	var phones = this._view._appCtxt.getApp(ZmApp.VOICE).phones;
	for (var i = 0, count = phones.length; i < count; i++) {
		var phone = phones[i];
		this._comboBox.add(phone.getDisplay(), phone.name, false);
	}
	this._comboBox.replaceElement(id + "_selectiveCallForwardingComboBox");
	
	var addParams = { parent: this._view, size: 25 };
	this._addInput = new DwtInputField(addParams);
	this._addInput.replaceElement(id + "_selectiveCallForwardingAddInput");
	this._addInput.addListener(DwtEvent.ONKEYUP, new AjxListener(this, this._inputKeyListener));
	
	this._addButton = new DwtButton(this._view);
	this._addButton.setText(ZmMsg.add);
	this._addButton.addSelectionListener(new AjxListener(this, this._addListener));
	this._addButton.replaceElement(id + "_selectiveCallForwardingAddButton");
};

/////////////////////////////////////////////////////////////////////////

ZmEmailNotificationUI = function(view) {
	ZmCallFeatureUI.call(this, view);
	this._checkbox = null;
}
ZmEmailNotificationUI.prototype = new ZmCallFeatureUI;
ZmEmailNotificationUI.prototype.constructor = ZmEmailNotificationUI;
ZmEmailNotificationUI.prototype.toString =
function() {
	return "ZmEmailNotificationUI";
}

ZmEmailNotificationUI.prototype.getName =
function() {
	return ZmCallFeature.EMAIL_NOTIFICATION;
};

ZmEmailNotificationUI.prototype.show =
function(feature) {
	this._comboBox.setText(feature.data.value);
};

ZmEmailNotificationUI.prototype._isValueDirty =
function() {
	if (this._getSelectedValue() != this._feature.data.value) {
		return true;
	}
	return false;
};

ZmEmailNotificationUI.prototype.getFeature =
function() {
	var result = ZmCallFeatureUI.prototype.getFeature.call(this);
	result.data.value = this._getSelectedValue();
	return result;
};

ZmEmailNotificationUI.prototype.setEnabled =
function(enabled) {
	this._comboBox.setEnabled(enabled);
};

ZmEmailNotificationUI.prototype.setMe =
function() {
    this._populateEmailComboBox(this._comboBox);
};

ZmEmailNotificationUI.prototype._getSelectedValue =
function() {
	return AjxStringUtil.trim(this._comboBox.getText());
};

ZmEmailNotificationUI.prototype._initialize =
function(id) {
	this._createCheckbox(ZmMsg.emailNotificationDescription, id + "_emailNotificationCheckbox");

	var inputParams = { size:25 }
	this._comboBox = new DwtComboBox(this._view, inputParams);
	this._comboBox.replaceElement(id + "_emailNotificationComboBox");
};

/////////////////////////////////////////////////////////////////////////

ZmVoicePageSizeUI = function(view) {
	ZmCallFeatureUI.call(this, view);
}
ZmVoicePageSizeUI.prototype = new ZmCallFeatureUI;
ZmVoicePageSizeUI.prototype.constructor = ZmVoicePageSizeUI;
ZmVoicePageSizeUI.prototype.toString =
function() {
	return "ZmVoicePageSizeUI";
}

ZmVoicePageSizeUI.prototype.getName =
function() {
	return ZmCallFeature.NUMBER_PER_PAGE;
};

ZmVoicePageSizeUI.prototype.show =
function(feature) {
	// No-op.
};

ZmVoicePageSizeUI.prototype._isValueDirty =
function() {
	return this._select.getValue() != this._view._appCtxt.get(ZmSetting.VOICE_PAGE_SIZE);
};

ZmVoicePageSizeUI.prototype.getFeature =
function() {
	var result = ZmCallFeatureUI.prototype.getFeature.call(this);
	result.data.value = this._select.getValue();
	return result;
};

ZmVoicePageSizeUI.prototype.setEnabled =
function(enabled) {
	this._select.setEnabled(enabled);
};

ZmVoicePageSizeUI.prototype._getSelectedValue =
function() {
	return this._select.getValue();
};

ZmVoicePageSizeUI.prototype._initialize =
function(id) {
	var current = this._view._appCtxt.get(ZmSetting.VOICE_PAGE_SIZE);
	var choices = ["10", "25", "50", "100"];
	var options = [];
	for (var i = 0, count = choices.length; i < count; i++) {
		var choice = choices[i];
		var selected = current == choice;
		options[i] = new DwtSelectOptionData(choice, choice, selected);
	}
	this._select = new DwtSelect(this._view, options);
	this._select.replaceElement(id + "_itemsPerPageSelect");
};

/*
* ZmPhoneList
* The list of phone accounts.
*/
ZmPhoneList = function(parent, appCtxt) {
	var headerList = [new DwtListHeaderItem(1, ZmMsg.number, null, null)];
	DwtListView.call(this, parent, "ZmPhoneList", null, headerList);

	this._appCtxt = appCtxt;

	this.setMultiSelect(false);
};

ZmPhoneList.prototype = new DwtListView;
ZmPhoneList.prototype.constructor = ZmPhoneList;

ZmPhoneList.prototype.toString =
function() {
	return "ZmPhoneList";
};

ZmPhoneList.prototype._getCellContents =
function(htmlArr, idx, phone, field, colIdx, params) {
	htmlArr[idx++] = AjxStringUtil.htmlEncode(phone.getDisplay(), true);
	return idx;
};
