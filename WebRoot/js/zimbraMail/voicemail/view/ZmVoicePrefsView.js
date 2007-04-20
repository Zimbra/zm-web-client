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
// Clean up the interface for the ui class.
// Implement the rest of the interface for a prefs page...cancelling, etc.
// Somewhere in here, I need to create proxies of the features. (Or maybe as an easy hack, just work directly on the model. It's not used anywhere else.)


function ZmVoicePrefsView(parent, appCtxt, controller) {
	var labels = { listHeader: ZmMsg.phoneNumbers, detailsHeader: ZmMsg.callSettings };

	ZmPrefListView.call(this, parent, appCtxt, controller, labels, "ZmVoicePrefsView", DwtControl.STATIC_STYLE);
	this._appCtxt = appCtxt;
	this._controller = controller;
	
	this._title = [ZmMsg.zimbraTitle, ZmMsg.options, ZmPrefView.TAB_NAME[ZmPrefView.VOICE]].join(": ");
	this._ui = [
		new ZmAnonymousRejectionUI(this), 
		new ZmEmailNotificationUI(this), 
		new ZmCallForwardingUI(this),
		new ZmSelectiveCallForwardingUI(this)
	];
	this._changes = null;
};

ZmVoicePrefsView.prototype = new ZmPrefListView;
ZmVoicePrefsView.prototype.constructor = ZmVoicePrefsView;
 
ZmVoicePrefsView.prototype.toString =
function() {
	return "ZmVoicePrefsView";
};

ZmVoicePrefsView.prototype.getTitle =
function() {
	return this._title;
};

ZmVoicePrefsView.prototype.showMe =
function() {
	var callback = new AjxCallback(this, this._handleResponseGetPhones)
	this._appCtxt.getApp(ZmApp.VOICE).getVoiceInfo(callback);
};

ZmVoicePrefsView.prototype._handleResponseGetPhones =
function() {
	ZmPrefListView.prototype.showMe.call(this);
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
			if (list[i] == this._phone) {
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
	this.showItem(this._item, true);
	this.clearAllErrors();
};

ZmVoicePrefsView.prototype._showInfoBox =
function() {
	return false;
};

ZmVoicePrefsView.prototype._createDetails =
function(parentElement) {
    var id = this._htmlElId;
    parentElement.innerHTML = AjxTemplate.expand("zimbraMail.voicemail.templates.Voicemail#ZmVoicePrefsView", id);
    for(var i = 0, count = this._ui.length; i < count; i++) {
    	this._ui[i]._initialize(id);
    }
};

ZmVoicePrefsView.prototype.showItem =
function(phone, ignoreChanges) {
	if (!ignoreChanges) {
		this._getChanges();
	}
//Retarded: saving a reference to the phone here, even though the parent class has it (as _item).
//Even more retarded because IdentityView does the same retarded thing.
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

ZmVoicePrefsView.prototype._validateSelectedItem =
function(errors) {
//	alert('ZmVoicePrefsView.prototype._validateSelectedItem');
};

ZmVoicePrefsView.prototype.addCommand =
function(batchCommand) {
	for (var i in this._changes) {
		var phone = this._changes[i].phone;
		phone.modifyCallFeatures(batchCommand, this._changes[i].list, null);
 	}
};

ZmVoicePrefsView.prototype._getItemText =
function(phone) {
	return phone.getDisplay();
};


ZmVoicePrefsView.prototype._handleResponse =
function(identity, request, result) {
//	var list;
//	switch (request) {
//		case "CreateIdentityRequest": list = this._adds; break;
//		case "ModifyIdentityRequest": list = this._updates; break;
//		case "DeleteIdentityRequest": list = this._deletes; break;
//	}
//	for (var i = 0, count = list.length; i < count; i++) {
//		if (list[i] == identity) {
//			list.splice(i,1);
//			break;
//		}
//	}
};

ZmVoicePrefsView.prototype._handleResponseError =
function(identity, request, result) {
//	var message;
//	if (result.code == ZmCsfeException.IDENTITY_EXISTS) {
//	    message = AjxMessageFormat.format(ZmMsg.errorIdentityAlreadyExists, identity.name);
//	} else {
//		message = ZmCsfeException.getErrorMsg(result.code);
//	}
//	if (message) {
//	    var dialog = this._appCtxt.getMsgDialog();
//		dialog.setMessage(message, DwtMessageDialog.CRITICAL_STYLE);
//		dialog.popup();
//	    return true;
//	}
};



function ZmCallFeatureUI(view) {
	this._view = view;
}

ZmCallFeatureUI.prototype.setFeature =
function(feature) {
	this._feature = feature;
	this._checkbox.setSelected(feature.isActive);
	this.show(feature);
};

ZmCallFeatureUI.prototype.getFeature =
function() {
	this._feature.isActive = this._checkbox.isSelected();
	return this._feature;
};

ZmCallFeatureUI.prototype.isDirty =
function() {
	if (!this._feature) {
		return false;
	}
	if (this._feature.isActive != this._checkbox.isSelected()) {
		return true;
	}
	return this._isValueDirty();
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

/////////////////////////////////////////////////////////////////////////

function ZmAnonymousRejectionUI(view) {
	ZmCallFeatureUI.call(this, view);
	this._checkbox = null;
}
ZmAnonymousRejectionUI.prototype = new ZmCallFeatureUI;
ZmAnonymousRejectionUI.prototype.constructor = ZmAnonymousRejectionUI;
ZmAnonymousRejectionUI.prototype.toString = 
function() {
	return "ZmAnonymousRejectionUI";
}

ZmAnonymousRejectionUI.prototype.getName =
function() {
	return ZmCallFeature.ANONYNOUS_REJECTION;
};

ZmAnonymousRejectionUI.prototype.show =
function(feature) {
	// Nothing to do here.
};

ZmAnonymousRejectionUI.prototype._isValueDirty =
function() {
	return false;
};

ZmAnonymousRejectionUI.prototype._initialize =
function(id) {
	this._checkbox = new DwtCheckbox(this._view);
	this._checkbox.setText(ZmMsg.anonymousRejectionDescription);
	this._checkbox.replaceElement(id + "_anonymousRejectionCheckbox");
};


/////////////////////////////////////////////////////////////////////////

function ZmCallForwardingUI(view) {
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
	this._checkbox = new DwtCheckbox(this._view);
	this._checkbox.setText(ZmMsg.callForwardingDescription);
	this._checkbox.replaceElement(id + "_callForwardingCheckbox");
	
	var inputParams = { size:25 }
	this._comboBox = new DwtComboBox(this._view, inputParams);
	var phones = this._view._appCtxt.getApp(ZmApp.VOICE).phones;
	for (var i = 0, count = phones.length; i < count; i++) {
		var phone = phones[i];
		this._comboBox.add(phone.getDisplay(), phone.name, false);
	}
	this._comboBox.replaceElement(id + "_callForwardingComboBox");
};

/////////////////////////////////////////////////////////////////////////

function ZmSelectiveCallForwardingUI(view) {
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
	var rowCount = feature.data.phone.length;
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
	result.data.phone = [];
	var rows = this._getTable().rows;
	for(var i = 1, count = rows.length; i < count; i++) {
		var cell = rows[i].cells[0].childNodes[0].rows[0].cells[0]; // Byick....surf through the big table structures to find the phone number text.
		var display = AjxUtil.getInnerText(cell);
		var name = ZmPhone.calculateName(display);
		result.data.phone.push({ a: true, pn: name });
	}
	return result;
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
	var row = this._getTable().insertRow(-1);
	row.className = (row.rowIndex % 2) ? "Line1" : "Line2"
	var cell = row.insertCell(-1);
	var args = { text: this._addInput.getValue(), linkId: Dwt.getNextId() };
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
			if (className == "Line1" || className == "Line2") {
				var rowIndex = node.rowIndex;
				var table = this._getTable();
				table.deleteRow(rowIndex);
				var rows = table.rows;
				for (var i = rowIndex || 0, count = rows.length; i < count; i++) {
					rows[i].className = (i % 2) ? "Line1" : "Line2";
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
	this._checkbox = new DwtCheckbox(this._view);
	this._checkbox.setText(ZmMsg.selectiveCallForwardingDescription);
	this._checkbox.replaceElement(id + "_selectiveCallForwardingCheckbox");
	
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

function ZmEmailNotificationUI(view) {
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
	if (this._getSelectedValue() != this._feature.data.ft) {
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

ZmEmailNotificationUI.prototype._getSelectedValue =
function() {
	return AjxStringUtil.trim(this._comboBox.getText());
};

ZmEmailNotificationUI.prototype._initialize =
function(id) {
	this._checkbox = new DwtCheckbox(this._view);
	this._checkbox.setText(ZmMsg.EmailNotificationDescription);
	this._checkbox.replaceElement(id + "_emailNotificationCheckbox");
	
	var inputParams = { size:25 }
	this._comboBox = new DwtComboBox(this._view, inputParams);
	var accountAddress = this._view._appCtxt.get(ZmSetting.USERNAME);
	this._comboBox.add(accountAddress, false);
	this._comboBox.replaceElement(id + "_emailNotificationComboBox");
};

