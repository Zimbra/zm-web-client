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

function ZmVoicePrefsView(parent, appCtxt, controller) {
	var labels = { listHeader: ZmMsg.phoneNumbers, detailsHeader: ZmMsg.callSettings };

	ZmPrefListView.call(this, parent, appCtxt, controller, labels, "ZmVoicePrefsView", DwtControl.STATIC_STYLE);
	this._appCtxt = appCtxt;
	this._controller = controller;
	
	this._title = [ZmMsg.zimbraTitle, ZmMsg.options, ZmPrefView.TAB_NAME[ZmPrefView.VOICE]].join(": ");
	this._ui = [
		new ZmAnonymousRejectionUI(this), 
		new ZmCallForwardingUI(this)
	];
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
	for(var i = 0, count = this._ui.length; i < count; i++) {
		if (this._ui[i].isDirty()) {
			return true;
		}
	}
	return false;
};

ZmVoicePrefsView.prototype.reset =
function() {
	var listView = this.getList();
	listView.set(this._controller._getListData());
	listView.setSelection(AjxDispatcher.run("GetIdentityCollection").defaultIdentity);
	this._clearChanges();
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
function(phone) {
	phone.getCallFeatures(new AjxCallback(this, this._handleResponseGetFeatures, phone));
};

ZmVoicePrefsView.prototype._handleResponseGetFeatures =
function(phone, features) {
	for(var i = 0, count = this._ui.length; i < count; i++) {
		var feature = features[this._ui[i].getName()];
		this._ui[i].set(feature);
	}
};

ZmVoicePrefsView.prototype._validateSelectedItem =
function(errors) {
//	alert('ZmVoicePrefsView.prototype._validateSelectedItem');
};

ZmVoicePrefsView.prototype.addCommand =
function(batchCommand) {
	alert('ZmVoicePrefsView.prototype._validateSelectedItem');
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

ZmVoicePrefsView.prototype._updateList =
function() {
//	// Just redraw the whole list.
//	var listView = this.getList();
//	listView.set(this._controller._getListData());
//
//	// Make sure the correct proxy identity is now selected.
//	if (this._identity) {
//		var identityCollection = AjxDispatcher.run("GetIdentityCollection");
//		var list = this.getList().getList();
//		for (var i = 0, count = list.size(); i < count; i++) {
//			var identity = list.get(i);
//			if (identity.id == this._identity.id) {
//				this.getList().setSelection(identity);
//				break;
//			}
//		}
//	}
};

ZmVoicePrefsView.prototype._clearChanges =
function() {
//	this._adds.length = 0;
//	this._deletes.length = 0;
//	this._updates.length = 0;
};

ZmVoicePrefsView.prototype.getChanges =
function() {
//	var dirty = false;
//	if (!this._identity) {
//		return dirty;
//	}
//	if (this._identity.hasOwnProperty("name")) {
//		dirty = true;
//	}
//	for (var i = 0, count = this._pages.length; i < count; i++) {
//		dirty = this._pages[i].getChanges(this._identity) || dirty;
//	}
//	
//	if (dirty && this._identity._object_) {
//		var found = false;
//		for (var i = 0, count = this._updates.length; i < count; i++) {
//			if (this._updates[i].id == this._identity.id) {
//				found = true; 
//				break;
//			}
//		}
//		if (!found) {
//			this._updates[this._updates.length] = this._identity;
//		}
//	}
//	return dirty;
};

function ZmCallFeatureUI(view) {
	this._view = view;
}

ZmCallFeatureUI.prototype.set =
function(feature) {
	this._feature = feature;
	this._checkbox.setSelected(feature.isActive);
	this._show(feature);
};

ZmCallFeatureUI.prototype.isDirty =
function() {
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
ZmCallFeatureUI.prototype._setValue =
function(value) {
	alert('ZmCallFeatureUI.prototype._setValue');
};
ZmCallFeatureUI.prototype._getValue =
function() {
	alert('ZmCallFeatureUI.prototype._getValue');
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
	return "anoncallrejection";
};

ZmAnonymousRejectionUI.prototype._show =
function(feature) {
	// Nothing to do here.
};

ZmAnonymousRejectionUI.prototype._isValueDirty =
function(feature) {
	return false;
};

ZmAnonymousRejectionUI.prototype._getValue =
function() {
	return this._checkbox.isSelected() ? "TRUE" : "FALSE";
	alert('ZmCallFeatureUI.prototype._getValue');
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
	return "anoncallrejection";
};

ZmCallForwardingUI.prototype._show =
function(feature) {
	// Nothing to do here.
};

ZmCallForwardingUI.prototype._isValueDirty =
function(feature) {
	return false;
};

ZmCallForwardingUI.prototype._getValue =
function() {
	return this._checkbox.isSelected() ? "TRUE" : "FALSE";
	alert('ZmCallFeatureUI.prototype._getValue');
};

ZmCallForwardingUI.prototype._initialize =
function(id) {
	this._checkbox = new DwtCheckbox(this._view);
	this._checkbox.setText(ZmMsg.callForwardingDescription);
	this._checkbox.replaceElement(id + "_callForwardingCheckbox");
};



///////////////////////////////////////////////////////////////////////////

/* Hold off till maybe this is implemented as a call feature...
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
//!!!!! Not an actual call preference.	
	return "donotdisturb";
};

ZmEmailNotificationUI.prototype._show =
function(feature) {
// TODO: Fill in combo box.....
};

ZmEmailNotificationUI.prototype._isValueDirty =
function(feature) {
// TODO: Compare value of combo box to feature....
};

ZmEmailNotificationUI.prototype._getValue =
function() {
	return this._checkbox.isSelected() ? "TRUE" : "FALSE";
	alert('ZmCallFeatureUI.prototype._getValue');
};

ZmEmailNotificationUI.prototype._initialize =
function(id) {
	this._checkbox = new DwtCheckbox(this._view);
	this._checkbox.setText(ZmMsg.emailNotificationDescription);
	this._checkbox.replaceElement(id + "_emailNotificationCheckbox");
};
*/
