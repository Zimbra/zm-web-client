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

// TODOs
// Somewhere in here, I need to create proxies of the features. (Or maybe as an easy hack, just work directly on the model. It's not used anywhere else.)

ZmVoicePrefsView = function(parent, controller) {
	DwtTabViewPage.call(this, parent, "ZmVoicePreferencesPage");
	this._controller = controller;
	this._hasRendered = false;
	this._tabview = new ZmVoicePrefsTabView({parent:this, controller:controller, posStyle:DwtControl.ABSOLUTE_STYLE});
	
	this._section = ZmPref.getPrefSectionWithPref(ZmSetting.VOICE_ACCOUNTS);
	this._title = [ZmMsg.zimbraTitle, controller.getApp().getDisplayName(), this._section && this._section.title].join(": ");	
}


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

ZmVoicePrefsView.prototype.showMe =
function() {
	if (!this._hasRendered) {
	    this._tabview.show();	
	    this._hasRendered = true;
	}
}

ZmVoicePrefsView.prototype.isDirty =
function() {
	var pages = this._tabview.getPages();
	var dirty = false;
	for (var id in pages) { // Do not jump out of this loop before isDirty() has been called on all elements
		if (pages[id].isDirty())
			dirty = true;
	}
	return dirty;
};

ZmVoicePrefsView.prototype.validate =
function() {
	var pages = this._tabview.getPages();
	var errors = [];
	for (var id in pages) {
		pages[id].validate(errors);
	}
	this._errors = errors;
	return this._errors.length == 0;
};

ZmVoicePrefsView.prototype.addCommand =
function(batchCommand) {
	var pages = this._tabview.getPages();
	for (var id in pages) {
		pages[id].addCommand(batchCommand);
	}
};

ZmVoicePrefsView.prototype.getTitle =
function() {
	return this._title;
}

ZmVoicePrefsView.prototype.reset =
function() {
	var pages = this._tabview.getPages();
	for (var id in pages) {
		pages[id].reset();
	}
}



ZmVoicePrefsTabView = function(params) {
    params.className = "ZmVoicePrefsTabView";
    DwtTabView.call(this, params);
    this.parent = params.parent;
    this._controller = params.controller;  
    this._pages = []; 
}

ZmVoicePrefsTabView.prototype = new DwtTabView;
ZmVoicePrefsTabView.prototype.constructor = ZmVoicePrefsTabView;

ZmVoicePrefsTabView.prototype.toString =
function() {
    return "ZmVoicePrefsTabView";
}

ZmVoicePrefsTabView.prototype.show =
function() {
    if (this._hasRendered) return;
    this._hasRendered = true;
    
    var sections = [
	{title: ZmMsg.voiceMail, manageDirty:false, precondition:"VOICE_ENABLED", prefs:["VOICE_ACCOUNTS"], page: new ZmVoiceGeneralPage(this, this._controller)},
	{title: ZmMsg.emailNotifications, manageDirty:false, precondition:"VOICE_ENABLED", prefs:["VOICE_ACCOUNTS"], page: new ZmVoiceNotificationPage(this, this._controller)},
	{title: ZmMsg.callForwardingHeader, manageDirty:false, precondition:"VOICE_ENABLED", prefs:["VOICE_ACCOUNTS"], page: new ZmVoiceForwardingPage(this, this._controller)},
	{title: ZmMsg.callScreeningHeader, manageDirty:false, precondition:"VOICE_ENABLED", prefs:["VOICE_ACCOUNTS"], page: new ZmVoiceRejectionPage(this, this._controller)}
    ];
   
    for (var i=0; i<sections.length; i++) {
	var section = sections[i];
	if (!this._controller.checkPreCondition(section)) { continue; }
	var tabButtonId = ZmId.getTabId(this._controller._currentView, section.title.replace(/[' ]/ig, "_"));
	try {
	    var id = this.addTab(section.title, section.page, tabButtonId);
	    this._pages[id] = section.page;
	} catch (e) {
	}
    }
    this.setVisible(true);
};

ZmVoicePrefsTabView.prototype.getPages =
function() {
    return this._pages;
}






ZmVoicePrefsPage = function(parent, controller) {
	if (!arguments.length) return;
	DwtTabViewPage.call(this, parent, "ZmPreferencesPage");
	this._controller = controller;
	this._hasRendered = false;
	this._item = null;
	this._section = ZmPref.getPrefSectionWithPref(ZmSetting.VOICE_ACCOUNTS);
	this._title = [ZmMsg.zimbraTitle, controller.getApp().getDisplayName(), this._section && this._section.title].join(": ");
	this._ui = [];
	this._changes = null;
};

ZmVoicePrefsPage.prototype = new DwtTabViewPage;
ZmVoicePrefsPage.prototype.constructor = ZmVoicePrefsPage;

ZmVoicePrefsPage.prototype.toString =
function() {
	return "ZmVoicePrefsPage";
};

ZmVoicePrefsPage.prototype.hasRendered =
function () {
	return this._hasRendered;
};

ZmVoicePrefsPage.prototype.getList =
function() {
	return this._list;
};

ZmVoicePrefsPage.prototype.getUIByName =
function(name) {
	for (var i = 0; i < this._ui.length; i++) {
		var ui = this._ui[i];
		if (ui.getName() == name)
			return ui;
	}
	return null;
};

ZmVoicePrefsPage.prototype.setItem =
function(item) {
	if (item) {
		this._item = item;
		//TODO: Retarded.
		this._getChanges();
		this.showItem(item);
	}
};

ZmVoicePrefsPage.prototype.validate =
function() {
	if (!this._item) {
		return true;
	}
	var errors = [];
	for(var i = 0, count = this._ui.length; i < count; i++) {
		var ui = this._ui[i];
		if (!ui._checkbox || ui._checkbox.isSelected()) {
			ui.validate(errors);
		}
	}
	this._errors = errors;
	return this._errors.length == 0;
};

ZmVoicePrefsPage.prototype.getErrorMessage =
function() {
	if (!this._errors.length) {
		return null;
	} else {
		return this._errors.join("<br>");
	}
};

ZmVoicePrefsPage.prototype.getTitle =
function() {
	return this._title;
};

ZmVoicePrefsPage.prototype.showMe =
function() {
	var prefsController = AjxDispatcher.run("GetPrefController");
	prefsController._resetOperations(prefsController._toolbar, this._section && this._section.id);
	Dwt.setTitle(this._title);
	if (this._hasRendered) return;

	this._handleResponseGetFeaturesObj = new AjxCallback(this, this._handleResponseGetFeatures);
	this._handleErrorGetFeaturesObj = new AjxCallback(this, this._handleErrorGetFeatures);

	var params = {
		method: "GetContacts",
		callback: new AjxCallback(this, this._handleResponseContactsLoaded),
		preLoadOk: false
	};
	AjxDispatcher.run(params);
	var voiceInfoCallback = new AjxCallback(this, this._handleResponseGetVoiceInfo);
	var voiceInfoErrorCallback = new AjxCallback(this, this._handleErrorGetVoiceInfo);
	appCtxt.getApp(ZmApp.VOICE).getVoiceInfo(voiceInfoCallback, voiceInfoErrorCallback);
};

ZmVoicePrefsPage.prototype._handleResponseContactsLoaded =
function(contacts) {
	this._myCard = contacts.getMyCard();
	if (this._myCard) {
		contacts.addChangeListener(new AjxListener(this, this._contactsChangeListener));
		if (this._hasRendered) {
			for(var i = 0, count = this._ui.length; i < count; i++) {
				this._ui[i].updateMyCard();
			}
		}
	}
};

ZmVoicePrefsPage.prototype._handleErrorGetVoiceInfo =
function(ex) {
	if (ex.code == "voice.SECONDARY_NOT_ALLOWED") {
		if (!this._showingErrorMessage) {
			this._showingErrorMessage = true;
			this.getHtmlElement().innerHTML = ZMsg["voice.SECONDARY_NOT_ALLOWED_PREFS"];
		}
		return true;
	}
	return false;
};

ZmVoicePrefsPage.prototype._handleResponseGetVoiceInfo =
function() {
	var id = this._htmlElId;
	var data = { id: id };
	this.getHtmlElement().innerHTML = AjxTemplate.expand(this._template, data);
	this._showingErrorMessage = false;

	// Create the list view and the contents of the detail pane.
	this._list = new ZmPhoneList(this);
	
	this._list.replaceElement(id + "_list");
	this._list.sortingEnabled = false;

	for(var i = 0, count = this._ui.length; i < count; i++) {
		this._ui[i]._initialize(id);
		this._ui[i].updateMyCard();
	}

	this._controller._setup(this);

	this._hasRendered = true;
};


ZmVoicePrefsPage.prototype.isDirty =
function() {
	this._getChanges();
	return this._changes != null;
};

ZmVoicePrefsPage.prototype._getChanges =
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

ZmVoicePrefsPage.prototype._addChange =
function(ui) {
	if (!this._changes) {
		this._changes = {};
	}
	if (!this._changes[this._phone.name]) {
		this._changes[this._phone.name] = { phone: this._phone, features: {} };
	}
	var feature = ui.getFeature();
	this._changes[this._phone.name].features[feature.name] = feature;
};

ZmVoicePrefsPage.prototype.reset =
function() {
	this._changes = null;
	//if (this._item)
		this.showItem(this._item);
};

ZmVoicePrefsPage.prototype.showItem =
function(phone) {
	if (phone instanceof ZmPhone) {
		this._phone = phone;
		phone.getCallFeatures(this._handleResponseGetFeaturesObj, this._handleErrorGetFeaturesObj);
	}
};

ZmVoicePrefsPage.prototype._handleResponseGetFeatures =
function(features, phone) {
	var changedFeatures = (this._changes && this._changes[phone.name]) ? this._changes[phone.name].features : null;
	for(var i = 0, count = this._ui.length; i < count; i++) {
		var featureName = this._ui[i].getName();
		var feature;
		if (changedFeatures && changedFeatures[featureName]) {
			feature = changedFeatures[featureName];
		} else {
			feature = features[featureName];
		}
		this._ui[i].setFeature(feature);
	}
};

ZmVoicePrefsPage.prototype._handleErrorGetFeatures =
function(csfeException) {
	for(var i = 0, count = this._ui.length; i < count; i++) {
		var ui = this._ui[i];
		ui.setEnabled(false);
		if (ui._checkbox) {
			ui._checkbox.setEnabled(false);
		}
	}
};

ZmVoicePrefsPage.prototype.addCommand =
function(batchCommand) {
	var first = true;
	for (var i in this._changes) {
		var change = this._changes[i];
		var phone = change.phone;
		var callback = null;
		if (first) {
			if (!this._handleResponseObj) {
				this._handleResponseObj = new AjxCallback(this, this._handleResponseCallFeatures);
			}
			callback = this._handleResponseObj;
			first = false;
		}
		var list = [];
		var features = change.features;
		for (var name in features) {
			list.push(features[name]);
		}
		phone.modifyCallFeatures(batchCommand, list, callback);
	 }
};

ZmVoicePrefsPage.prototype._handleResponseCallFeatures =
function() {
	this._changes = null;
};

ZmVoicePrefsPage.prototype._containsMyCard =
function(contacts) {
    for(var i = 0, count = contacts.length; i < count; i++) {
		if (contacts[i] == this._myCard) {
			return true;
		}
    }
    return false;
};

ZmVoicePrefsPage.prototype._contactsChangeListener =
function(ev) {
	var redraw = false;
	if (ev.event == ZmEvent.E_MODIFY) {
        var contacts = ev.getDetails().items;
		if (contacts && this._containsMyCard(contacts)) {
            for(var i = 0, count = this._ui.length; i < count; i++) {
                this._ui[i].updateMyCard();
            }
        }
	}
};

ZmVoicePrefsPage.prototype._validatePhoneNumber =
function(value) {
	if (AjxStringUtil.trim(value) == "") {
		throw AjxMsg.valueIsRequired;
	}
	var errors = [];
	if (!this._phone.validate(value, errors)) {
		throw AjxMessageFormat.format(errors[0], [""]);
	}
	return value;
};

ZmVoicePrefsPage.prototype._validatePhoneNumberFct =
function(value) {
	try {
		this._validatePhoneNumber(value);
	} catch (e) {
		return e;
	}
	return null;
}

ZmVoicePrefsPage._validateEmailAddress =
function(value) {
	if (value == "") {
		throw AjxMsg.valueIsRequired;
	} else if (!AjxEmailAddress.isValid(value) || value.length > ZmCallFeature.EMAIL_MAX_LENGTH) {
		throw ZmMsg.errorInvalidEmail;
	}
	return value;
};

///////////////////////////////////////////////////

ZmVoiceGeneralPage = function(parent, controller) {
	ZmVoicePrefsPage.call(this, parent, controller);

	this._controller = controller;
	this._hasRendered = false;
	this._item = null;
	
	this._section = ZmPref.getPrefSectionWithPref(ZmSetting.VOICE_ACCOUNTS);
	this._title = [ZmMsg.zimbraTitle, controller.getApp().getDisplayName(), this._section && this._section.title].join(": ");
	this._ui = [
		new ZmVoiceAnsweringLanguageUI(this),
		new ZmVoiceUserLanguageUI(this),
		new ZmVoiceAutoplayUI(this),
		new ZmVoicePromptUI(this),
		new ZmVoiceAnnounceDateTimeUI(this),
		new ZmVoiceRequirePinUI(this),
		new ZmCallSendToVoicemailAfterRingsUI(this)
	];
	this._changes = null;
	
	this._template = "voicemail.Voicemail#ZmVoicePrefsGeneralView";
};

ZmVoiceGeneralPage.prototype = new ZmVoicePrefsPage;
ZmVoiceGeneralPage.prototype.constructor = ZmVoiceGeneralPage;

ZmVoiceGeneralPage.prototype.toString =
function() {
	return "ZmVoiceGeneralPage";
};

ZmVoiceGeneralPage.prototype._handleResponseGetVoiceInfo =
function() {
	var id = this._htmlElId;
	var data = { id: id };
	this.getHtmlElement().innerHTML = AjxTemplate.expand(this._template, data);
	this._showingErrorMessage = false;

	// Create the list view and the contents of the detail pane.
	this._list = new ZmPhoneList(this);
	this._list.replaceElement(id + "_list");
	this._list.sortingEnabled = false;

	// Initialize the page size selector.
	var current = appCtxt.get(ZmSetting.VOICE_PAGE_SIZE);
	var choices = ["10", "25", "50", "100"];
	var options = [];
	for (var i = 0, count = choices.length; i < count; i++) {
		var choice = choices[i];
		var selected = current == choice;
		options[i] = new DwtSelectOptionData(choice, choice, selected);
	}
	this._pageSizeSelect = new DwtSelect({parent:this, options:options});
	this._pageSizeSelect.replaceElement(id + "_itemsPerPageSelect");

	for(var i = 0, count = this._ui.length; i < count; i++) {
		this._ui[i]._initialize(id);
		this._ui[i].updateMyCard();
	}

	this._controller._setup(this);

	this._hasRendered = true;
};

ZmVoiceGeneralPage.prototype.isDirty =
function() {
	this._getChanges();
	return this._changes != null || this.isPageSizeDirty();
};


ZmVoiceGeneralPage.prototype.isPageSizeDirty =
function() {
	return this._pageSizeSelect && this._pageSizeSelect.getValue() != appCtxt.get(ZmSetting.VOICE_PAGE_SIZE);
};


ZmVoiceGeneralPage.prototype._handleResponsePageSize =
function() {
	appCtxt.getApp(ZmApp.VOICE).redoSearch();
};

ZmVoiceGeneralPage.prototype.addCommand =
function(batchCommand) {
	ZmVoicePrefsPage.prototype.addCommand.call(this, batchCommand);
	if (this.isPageSizeDirty()) {
		var settings = appCtxt.getSettings();
		var pageSizeSetting = settings.getSetting(ZmSetting.VOICE_PAGE_SIZE);
		pageSizeSetting.setValue(this._pageSizeSelect.getValue());
		settings.save([pageSizeSetting], new AjxCallback(this, this._handleResponsePageSize), batchCommand);
	}
};

ZmVoiceGeneralPage.prototype.reset =
function() {
	ZmVoicePrefsPage.prototype.reset.call(this);
	if (this._pageSizeSelect)
		this._pageSizeSelect.setSelectedValue(appCtxt.get(ZmSetting.VOICE_PAGE_SIZE));
};

////////////////////////////////////////////////////////

ZmVoiceNotificationPage = function(parent, controller) {
	ZmVoicePrefsPage.call(this, parent, controller);

	this._controller = controller;
	this._hasRendered = false;
	this._item = null;
	
	this._section = ZmPref.getPrefSectionWithPref(ZmSetting.VOICE_ACCOUNTS);
	this._title = [ZmMsg.zimbraTitle, controller.getApp().getDisplayName(), this._section && this._section.title].join(": ");
	this._ui = [
		new ZmEmailNotificationUI(this)
	];
	this._template = "voicemail.Voicemail#ZmVoicePrefsNotificationView";
	this._changes = null;
};

ZmVoiceNotificationPage.prototype = new ZmVoicePrefsPage;
ZmVoiceNotificationPage.prototype.constructor = ZmVoiceNotificationPage;

ZmVoiceNotificationPage.prototype.toString =
function() {
	return "ZmVoiceNotificationPage";
};

//////////////////////////////////////////////////////

ZmVoiceForwardingPage = function(parent, controller) {
	ZmVoicePrefsPage.call(this, parent, controller);

	this._controller = controller;
	this._hasRendered = false;
	this._item = null;
	
	this._section = ZmPref.getPrefSectionWithPref(ZmSetting.VOICE_ACCOUNTS);
	this._title = [ZmMsg.zimbraTitle, controller.getApp().getDisplayName(), this._section && this._section.title].join(": ");
	this._ui = [
		new ZmSelectiveCallForwardingUI(this),
		new ZmCallForwardingUI(this)
	];
	this._template = "voicemail.Voicemail#ZmVoicePrefsForwardingView";
	this._changes = null;
};

ZmVoiceForwardingPage.prototype = new ZmVoicePrefsPage;
ZmVoiceForwardingPage.prototype.constructor = ZmVoiceForwardingPage;

ZmVoiceForwardingPage.prototype.toString =
function() {
	return "ZmVoiceForwardingPage";
};

/////////////////////////////////////////////////////

ZmVoiceRejectionPage = function(parent, controller) {
	ZmVoicePrefsPage.call(this, parent, controller);

	this._controller = controller;
	this._hasRendered = false;
	this._item = null;
	
	this._section = ZmPref.getPrefSectionWithPref(ZmSetting.VOICE_ACCOUNTS);
	this._title = [ZmMsg.zimbraTitle, controller.getApp().getDisplayName(), this._section && this._section.title].join(": ");
	this._ui = [
		new ZmSelectiveCallRejectionUI(this),
		new ZmAnonymousCallRejectionUI(this)
	];
	this._template = "voicemail.Voicemail#ZmVoicePrefsRejectionView";
	this._changes = null;
};

ZmVoiceRejectionPage.prototype = new ZmVoicePrefsPage;
ZmVoiceRejectionPage.prototype.constructor = ZmVoiceRejectionPage;

ZmVoiceRejectionPage.prototype.toString =
function() {
	return "ZmVoiceRejectionPage";
};

////////////////////////////////////////////////////

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
	if (!this._feature || !this._feature.isSubscribed) {
		return false;
	}
	if (this._checkbox && (this._feature.isActive != this._checkbox.isSelected())) {
		return true;
	}
	return this._isValueDirty();
};

ZmCallFeatureUI.prototype._createCheckbox =
function(text, id) {
	this._checkbox = new DwtCheckbox({parent:this._view});
	this._checkbox.setText(text);
	this._checkbox.replaceElement(id);
	this._checkbox.addSelectionListener(new AjxListener(this, this._checkboxListener));
};

ZmCallFeatureUI.prototype._checkboxListener =
function(ev) {
    /*if(this.toString() == "ZmEmailNotificationUI" && !this._checkbox.isSelected() && this._getSelectedValue() != ""){
        var value  =  this._getSelectedValue();
        if (!AjxEmailAddress.isValid(value))
           appCtxt.setStatusMsg(ZmMsg.invalidEmailAddress);
        else
            appCtxt.setStatusMsg(ZmMsg.lostEmailNotification);
    }*/
	this.setEnabled(this._checkbox.isSelected());
};

ZmCallFeatureUI.prototype._populatePhoneComboBox =
function(comboBox) {
    comboBox.removeAll();
	var myCard = this._view._myCard;
	if (myCard) {
		for (var fieldIndex = 0, fieldCount = ZmContact.F_PHONE_FIELDS.length; fieldIndex < fieldCount; fieldIndex++) {
			var fieldId = ZmContact.F_PHONE_FIELDS[fieldIndex];
			var phone = myCard.getAttr(fieldId);
			if (phone) {
				var name = ZmPhone.calculateName(phone);
				comboBox.add(ZmPhone.calculateDisplay(name), name, false);
			}
		}
	}
};

ZmCallFeatureUI.prototype._populateEmailComboBox =
function(comboBox) {
    comboBox.removeAll();
    var accountAddress = appCtxt.get(ZmSetting.USERNAME);
    this._comboBox.add(accountAddress, false);
	var myCard = this._view._myCard;
	if (myCard) {
		for (var fieldIndex = 0, fieldCount = ZmContact.F_EMAIL_FIELDS.length; fieldIndex < fieldCount; fieldIndex++) {
			var fieldId = ZmContact.F_EMAIL_FIELDS[fieldIndex];
			var email = myCard.getAttr(fieldId);
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

ZmCallFeatureUI.prototype._isComboBoxValid =
function(comboBox) {
	return comboBox && comboBox.input && comboBox.input.isValid() !== null;
};

ZmCallFeatureUI.prototype._validateComboBox =
function(comboBox, errorList, message) {
	if (!this._isComboBoxValid(comboBox)) {
		errorList.push(message);
	}
};

ZmCallFeatureUI.prototype._clearField =
function(field) {
	if (field instanceof DwtComboBox || field instanceof DwtInputField) {
		field.setValue(null, true);
		field.focus();
	}
}

ZmCallFeatureUI.prototype.getFaqLink =
function() {
	return AjxMessageFormat.format(ZmMsg.errorPhoneFAQLink, [ZmMsg.errorPhoneFAQURL]);
}

ZmCallFeatureUI.prototype.showDialog =
function(text) {
	var shell = appCtxt.getShell();
	var dialog = new ZmDialog({parent:shell, title:ZmMsg.errorCap});
	dialog.setContent(text);
	dialog.popup();
}

ZmCallFeatureUI.prototype.showDialogWithFAQ =
function(text) {
	if (AjxUtil.isString(text)) {
		var msg = AjxStringUtil.trim(text);
		if (msg.length > 0) {
			if (msg.indexOf("{0}") == -1) {
				if (!msg.match(/\.$/))
					msg += ".";
				msg += " " + this.getFaqLink();
			} else {
				msg = AjxMessageFormat.format(msg, [this.getFaqLink()]);
			}
			this.showDialog(msg);
		}
	}
}

// "Abstract" methods:
ZmCallFeatureUI.prototype.getName =
function() {
	//alert('ZmCallFeatureUI.prototype.getName');
};
ZmCallFeatureUI.prototype._initialize =
function(id) {
	//alert('ZmCallFeatureUI.prototype._initialize');
};
ZmCallFeatureUI.prototype.setEnabled =
function(enabled) {
	//alert('ZmCallFeatureUI.prototype.setEnabled ' + enabled);
};
ZmCallFeatureUI.prototype.validate =
function(errors) {
	// No-op.
};
ZmCallFeatureUI.prototype.updateMyCard =
function() {
	// No-op.
};

/////////////////////////////////////////////////////////////////////////

ZmVoiceLanguageUI = function(view) {
	ZmCallFeatureUI.call(this, view);
	this._buttonGroup = null;
	this._buttons = {};
}

ZmVoiceLanguageUI.prototype = new ZmCallFeatureUI;
ZmVoiceLanguageUI.prototype.constructor = ZmVoiceLanguageUI;
ZmVoiceLanguageUI.prototype.toString = 
function() {
	return "ZmVoiceLanguageUI";
}

ZmVoiceLanguageUI.prototype._getLanguageName =
function(id) {
	return ZmMsg["language_"+id];
}

ZmVoiceLanguageUI.prototype.getName =
function() {
	return null;
};

ZmVoiceLanguageUI.prototype.show =
function(feature) {
	// No-op
};

ZmVoiceLanguageUI.prototype._isValueDirty =
function() {
	return (this._getSelectedValue() != this._feature.data.value);
};

ZmVoiceLanguageUI.prototype.getFeature =
function() {
	var result = this._feature.createProxy();
	result.data.value = this._getSelectedValue();
	return result;
};

ZmVoiceLanguageUI.prototype.setFeature =
function(feature) {
	this._feature = feature;
	this.show(feature);
	if (this._buttonGroup) {
		// this._buttonGroup.setSelectedValue(feature.data.value);
		var radiobutton = this._buttons[feature.data.value]; // DwtRadioButtonGroup.prototype.setSelectedValue() doesn't work correctly, so we use setSelectedId() instead
		if (radiobutton) {
			this._buttonGroup.setSelectedId(radiobutton.getInputElement().id, true);
		}
	}
	this.setEnabled(feature.isActive);
};

ZmVoiceLanguageUI.prototype.setEnabled =
function(enabled) {
	this._buttonGroup.setEnabled(enabled);
};

ZmVoiceLanguageUI.prototype.validate =
function(errors) {
	return (this._buttonGroup.getSelectedId() != undefined);
};

ZmVoiceLanguageUI.prototype._getSelectedValue =
function() {
	//return this._buttonGroup.getSelectedValue(); DwtRadioButtonGroup.prototype.getSelectedValue doesn't function properly
	var el = document.getElementById(this._buttonGroup.getSelectedId());
	return (el) ? el.value : null;
};

ZmVoiceLanguageUI.prototype._initialize =
function(id, suffix) {
	var buttons={};
	var _suffix = suffix || "_voiceLanguage";
	var name = id + _suffix;
	this._container = new DwtComposite({parent:this._view});
	this._container.replaceElement(id + _suffix);
	this._buttonGroup = new DwtRadioButtonGroup({});
	for (var i=0; i<ZmCallFeature.LOCALE_VALUES.length; i++) {
		var value = ZmCallFeature.LOCALE_VALUES[i];
		var b_id = name + "_" + value;
		var button = new DwtRadioButton({parent:this._container, id: b_id, name: name, checked:false});
		button.setValue(value);
		button.setText(this._getLanguageName(value));
		this._buttons[value] = button;
		buttons[b_id] = value;
		this._buttonGroup.addRadio(b_id, button, false);		
	}
	
};

///////////////////////////

ZmVoiceAnsweringLanguageUI = function(view) {
	ZmVoiceLanguageUI.call(this, view);
}

ZmVoiceAnsweringLanguageUI.prototype = new ZmVoiceLanguageUI;
ZmVoiceAnsweringLanguageUI.prototype.constructor = ZmVoiceAnsweringLanguageUI;
ZmVoiceAnsweringLanguageUI.prototype.toString = 
function() {
	return "ZmVoiceAnsweringLanguageUI";
}

ZmVoiceAnsweringLanguageUI.prototype.getName =
function() {
	return ZmCallFeature.ANSWERING_LOCALE;
};

ZmVoiceAnsweringLanguageUI.prototype._initialize =
function(id) {
	ZmVoiceLanguageUI.prototype._initialize.call(this, id, "_voiceAnsweringLocale");
}

///////////////////////////

ZmVoiceUserLanguageUI = function(view) {
	ZmVoiceLanguageUI.call(this, view);
}

ZmVoiceUserLanguageUI.prototype = new ZmVoiceLanguageUI;
ZmVoiceUserLanguageUI.prototype.constructor = ZmVoiceUserLanguageUI;
ZmVoiceUserLanguageUI.prototype.toString = 
function() {
	return "ZmVoiceUserLanguageUI";
}

ZmVoiceUserLanguageUI.prototype.getName =
function() {
	return ZmCallFeature.USER_LOCALE;
};

ZmVoiceUserLanguageUI.prototype._initialize =
function(id) {
	ZmVoiceLanguageUI.prototype._initialize.call(this, id, "_voiceUserLocale");
}

/////////////////////////////////////////////////////////////////////////

ZmVoiceAutoplayUI = function(view) {
	ZmCallFeatureUI.call(this, view);
	this._checkbox = null;
}
ZmVoiceAutoplayUI.prototype = new ZmCallFeatureUI;
ZmVoiceAutoplayUI.prototype.constructor = ZmVoiceAutoplayUI;
ZmVoiceAutoplayUI.prototype.toString = 
function() {
	return "ZmVoiceAutoplayUI";
}

ZmVoiceAutoplayUI.prototype.getName =
function() {
	return ZmCallFeature.AUTOPLAY;
};

ZmVoiceAutoplayUI.prototype.setEnabled =
function(enabled) {
	// Hook to Prompt Level selection
	var ui = this._view.getUIByName(ZmCallFeature.PROMPT_LEVEL);
	if (ui) {
		ui.setEnabledFromAutoplay(enabled);
	}
}

ZmVoiceAutoplayUI.prototype.show =
function() {
	// No-op
}


ZmVoiceAutoplayUI.prototype._isValueDirty =
function() {
	return false;
}


ZmVoiceAutoplayUI.prototype._initialize =
function(id) {
	this._createCheckbox(ZmMsg.voicemailAutoplay, id + "_voiceAutoplayCheckbox");
}


/////////////////////////////////////////////////////////////////////////

ZmVoicePromptUI = function(view) {
	ZmCallFeatureUI.call(this, view);
	this._buttonGroup = null;
	this._buttons = {};
}

ZmVoicePromptUI.prototype = new ZmCallFeatureUI;
ZmVoicePromptUI.prototype.constructor = ZmVoicePromptUI;
ZmVoicePromptUI.prototype.toString = 
function() {
	return "ZmVoicePromptUI";
}

ZmVoicePromptUI.prototype._getPromptLevelName =
function(id) {
	return ZmMsg["voicemailPromptLevel_"+id];
}

ZmVoicePromptUI.prototype.getName =
function() {
	return ZmCallFeature.PROMPT_LEVEL;
};

ZmVoicePromptUI.prototype.show =
function(feature) {
	if (this._buttonGroup) {
		// this._buttonGroup.setSelectedValue(feature.data.value);
		var radiobutton = this._buttons[feature.data.value]; // DwtRadioButtonGroup.prototype.setSelectedValue() doesn't work correctly, so we use setSelectedId() instead
		if (radiobutton) {
			this._buttonGroup.setSelectedId(radiobutton.getInputElement().id, true);
		}
	}
};

ZmVoicePromptUI.prototype._isValueDirty =
function() {
	return (this._getSelectedValue() != this._feature.data.value);
};

ZmVoicePromptUI.prototype.getFeature =
function() {
	var result = this._feature.createProxy();
	result.data.value = this._getSelectedValue();
	return result;
};

ZmVoicePromptUI.prototype.setFeature =
function(feature) {
	this._feature = feature;
	this.show(feature);
	this.setEnabled(feature.isActive);
};

ZmVoicePromptUI.prototype.setEnabled =
function(enabled) {
	// No-op: hook from autoplay enables/disables this
};

ZmVoicePromptUI.prototype.setEnabledFromAutoplay =
function(enabled) {
	//this._buttonGroup.setEnabled(enabled); // Doesn't work as it should
	for (var v in this._buttons) { // So we do this instead
		var button = this._buttons[v];
		button.setEnabled(enabled);
	}
};

ZmVoicePromptUI.prototype.validate =
function(errors) {
	return (this._buttonGroup.getSelectedId() != undefined);
};

ZmVoicePromptUI.prototype._getSelectedValue =
function() {
	//return this._buttonGroup.getSelectedValue(); DwtRadioButtonGroup.prototype.getSelectedValue doesn't function properly
	var el = document.getElementById(this._buttonGroup.getSelectedId());
	return (el) ? el.value : null;
};

ZmVoicePromptUI.prototype._initialize =
function(id) {
	var buttons={};
	var suffix = "_voicePromptLevel";
	var name = id + suffix;
	this._container = new DwtComposite({parent:this._view});
	this._container.replaceElement(name);
	this._buttonGroup = new DwtRadioButtonGroup({});
	for (var i=0; i<ZmCallFeature.PROMPT_LEVEL_VALUES.length; i++) {
		var value = ZmCallFeature.PROMPT_LEVEL_VALUES[i];
		var b_id = name + "_" +value;
		var button = new DwtRadioButton({parent:this._container, id: b_id, name: name, checked:false});
		button.setValue(value);
		button.setText(this._getPromptLevelName(value));
		this._buttons[value] = button;
		buttons[b_id] = value;	
		this._buttonGroup.addRadio(b_id, button, false);	
	}	
};


/////////////////////////////////////////////////////////////////////////

ZmVoiceAnnounceDateTimeUI = function(view) {
	ZmCallFeatureUI.call(this, view);
	this._checkbox = null;
}
ZmVoiceAnnounceDateTimeUI.prototype = new ZmCallFeatureUI;
ZmVoiceAnnounceDateTimeUI.prototype.constructor = ZmVoiceAnnounceDateTimeUI;
ZmVoiceAnnounceDateTimeUI.prototype.toString = 
function() {
	return "ZmVoiceAnnounceDateTimeUI";
}

ZmVoiceAnnounceDateTimeUI.prototype.getName =
function() {
	return ZmCallFeature.ANNOUNCE_DATETIME;
};

ZmVoiceAnnounceDateTimeUI.prototype.setEnabled =
function() {
	// No-op
}

ZmVoiceAnnounceDateTimeUI.prototype.show =
function() {
	// No-op
}


ZmVoiceAnnounceDateTimeUI.prototype._isValueDirty =
function() {
	return false;
}


ZmVoiceAnnounceDateTimeUI.prototype._initialize =
function(id) {
	this._createCheckbox(ZmMsg.voicemailAnnounceDateTime, id + "_voiceAnnounceDateTimeCheckbox");
}


/////////////////////////////////////////////////////////////////////////


// The checkbox of this control is INVERSE of the actual model entry value,
// as the model on the backend was designed to be "skip pin entry" whereas
// this control needs to be "require pin entry". Therefore, we overload the
// methods setFeature, getFeature and isDirty from ZmCallFeatureUI to achieve 
// this effect. isActive will always represent the "skip pin entry" truth 
// value, while this._checkbox.isSelected is the inverse of that

ZmVoiceRequirePinUI = function(view) {
	ZmCallFeatureUI.call(this, view);
	this._checkbox = null;
}
ZmVoiceRequirePinUI.prototype = new ZmCallFeatureUI;
ZmVoiceRequirePinUI.prototype.constructor = ZmVoiceRequirePinUI;
ZmVoiceRequirePinUI.prototype.toString = 
function() {
	return "ZmVoiceRequirePinUI";
}

ZmVoiceRequirePinUI.prototype.getName =
function() {
	return ZmCallFeature.SKIP_PIN_ENTRY;
};

ZmVoiceRequirePinUI.prototype.setFeature =
function(feature) {
	this._feature = feature;
	if (this._checkbox) {
		this._checkbox.setSelected(!feature.isActive);
		this._checkbox.setEnabled(feature.isSubscribed);
	}
};

ZmVoiceRequirePinUI.prototype.getFeature =
function() {
	var result = this._feature.createProxy();
	result.isActive = this._checkbox ? !this._checkbox.isSelected() : false;
	return result;
};

ZmVoiceRequirePinUI.prototype.isDirty =
function() {
	if (!this._feature || !this._feature.isSubscribed) {
		return false;
	}
	if (this._checkbox && (this._feature.isActive != (!this._checkbox.isSelected()))) {
		return true;
	}
	return this._isValueDirty();
};


ZmVoiceRequirePinUI.prototype.setEnabled =
function() {
	// No-op
}

ZmVoiceRequirePinUI.prototype.show =
function() {
	// No-op
}


ZmVoiceRequirePinUI.prototype._isValueDirty =
function() {
	return false;
}


ZmVoiceRequirePinUI.prototype._initialize =
function(id) {
	this._createCheckbox(ZmMsg.voicemailRequirePin, id + "_voiceRequirePinCheckbox");
}

/////////////////////////////////////////////////////////////////////////

ZmCallSendToVoicemailAfterRingsUI = function(view) {
	ZmCallFeatureUI.call(this, view);
}
ZmCallSendToVoicemailAfterRingsUI.prototype = new ZmCallFeatureUI;
ZmCallSendToVoicemailAfterRingsUI.prototype.constructor = ZmCallSendToVoicemailAfterRingsUI;
ZmCallSendToVoicemailAfterRingsUI.prototype.toString = 
function() {
	return "ZmCallSendToVoicemailAfterRingsUI";
}

ZmCallSendToVoicemailAfterRingsUI.prototype.getName =
function() {
	return ZmCallFeature.CALL_FORWARD_NO_ANSWER;
};

ZmCallSendToVoicemailAfterRingsUI.prototype.getFeature =
function() {
	var result = this._feature.createProxy();
	result.data.nr = this._select.getValue();
	return result;
};

ZmCallSendToVoicemailAfterRingsUI.prototype.setFeature =
function(feature) {
	this._feature = feature;
	this.show(feature);
	this.setEnabled(feature.isActive);
};


ZmCallSendToVoicemailAfterRingsUI.prototype.setEnabled =
function(enabled) {
	// No-op
	this._select.setEnabled(enabled);
}

ZmCallSendToVoicemailAfterRingsUI.prototype.show =
function(feature) {
	this._select.setSelectedValue(feature.data.nr);
}


ZmCallSendToVoicemailAfterRingsUI.prototype._isValueDirty =
function() {
	return this._select && this._select.getValue() != this._feature.data.nr;
}


ZmCallSendToVoicemailAfterRingsUI.prototype._initialize =
function(id) {
	this._select = new DwtSelect({parent:this._view});
	var choices = ZmCallFeature.CALL_FORWARD_NO_ANSWER_RINGS_VALUES;
	for (var i = 0; i < choices.length; i++) {
		var choice = choices[i];
		var option = new DwtSelectOption(choice, false, ""+choice);
		this._select.addOption(option);
	}
	this._select.replaceElement(id + "_callSendToVoicemailAfterRingsSelect");
}

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
	return !this._isComboBoxValid(this._comboBox) || (this._getSelectedValue() != this._feature.data.ft);
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

ZmCallForwardingUI.prototype.updateMyCard =
function() {
    this._populatePhoneComboBox(this._comboBox);
};

ZmCallForwardingUI.prototype.validate =
function(errors) {
	this._validateComboBox(this._comboBox, errors, ZmMsg.callForwardingError);
	if (this._getSelectedValue() == this._view._phone.name) {
		errors.push(ZmMsg.callForwardingSameNumberError);
	}
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
	
	var inputParams = {
		size: 25,
		//validator: ZmVoicePrefsPage._validatePhoneNumber,
		validator: AjxCallback.simpleClosure(this._view._validatePhoneNumber, this._view),
		validationStyle: DwtInputField.CONTINUAL_VALIDATION
	};
	this._comboBox = new DwtComboBox({parent:this._view, inputParams:inputParams});
	this._populatePhoneComboBox(this._comboBox);
	this._comboBox.replaceElement(id + "_callForwardingComboBox");
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
	var arr = feature.data.value.split(",");
	var items = [];
	if (arr.length>0) {
		for (var i=0; i<arr.length; i++) {
			if (arr[i]!=null) {
				var text = AjxStringUtil.trim(arr[i]);
				if (text.length > 0) {
					items.push({text: text});
				}
			}
		}
	}
	this._list.set(AjxVector.fromArray(items), 1);
	if (items.length>0) {
		feature.isActive = true;
	} else {
		feature.isActive = false;
	}
	this._list.setEnabled(true);
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
	var addresses = this._getAddresses();
	if (!addresses || addresses.length==0) {
		result.isActive = false;
		result.data.value = "";
	} else {
		result.data.value = addresses.join(",");
		result.isActive = true;
	}
	return result;
};

ZmEmailNotificationUI.prototype.updateMyCard =
function() {
    this._populateEmailComboBox(this._comboBox);
};

ZmEmailNotificationUI.prototype.validate =
function(errors) {
    var values = this._getAddresses();
    for (var i=0; i<values.length; i++)
	this._validateEmailAddress(values[i], errors);
};


ZmEmailNotificationUI.prototype._validateEmailAddress =
function(value, errors) {
    if (!AjxUtil.isString(value) || value == "") {
	errors.push(ZmMsg.missingEmailAddress);
    } else if (!AjxEmailAddress.isValid(value)) {
        errors.push(ZmMsg.invalidEmailAddress);
    }
}

ZmEmailNotificationUI.prototype._getAddresses =
function() {
	return (this._list)? this._list.getItemStrings() : [];
}


ZmEmailNotificationUI.prototype._getSelectedValue =
function() {
	return this._getAddresses().join(",");
};

ZmEmailNotificationUI.prototype._handleAddFromNumber =
function(event) {
	var addValue = this._comboBox.getText();
	if (this._list.getList() && this._list.getList().size() >= ZmCallFeature.EMAIL_NOTIFICATION_MAX_ENTRIES) {
		this.showDialogWithFAQ(ZmMsg.voicemailNotificationErrorMax);
	} else if (!AjxUtil.isString(addValue) || AjxStringUtil.trim(addValue) == "") {
		this.showDialogWithFAQ(ZmMsg.missingEmailAddress);
		this._clearField(this._comboBox);
	} else if (!AjxEmailAddress.isValid(addValue)) {
		this.showDialogWithFAQ(ZmMsg.voicemailNotificationErrorInvalid);
		this._clearField(this._comboBox);
	} else {
		var addObject = {a: true, text: addValue.toLowerCase()};
		if (this._list.containsItem(addObject)) {
			this.showDialogWithFAQ(ZmMsg.errorEmailNotUnique);
			this._clearField(this._comboBox);
		} else {
			this._list.addItem(addObject, null, false);
			this._comboBox.setText("", true);
		}
	}
};

ZmEmailNotificationUI.prototype._handleRemoveAll =
function(event) {
	if (this._list)
		this._list.removeAll();
}

ZmEmailNotificationUI.prototype._initialize =
function(id) {
	this._descriptionLabel = new DwtLabel({parent:this._view});
	this._descriptionLabel.setText(ZmMsg.voicemailNotificationDescription);
	this._descriptionLabel.replaceElement(id + "_emailNotificationDescriptionLabel");

	this._comboBox = new DwtComboBox({parent:this._view, inputParams: {size: 20, validator: ZmVoicePrefsPage._validateEmailAddress, validationStyle: DwtInputField.CONTINUAL_VALIDATION}, className:"DwtComboBox ValidatorFix"});
	this._comboBox.replaceElement(id + "_emailNotificationComboBox");
	
	this._clearButton = new DwtButton({parent:this._view, size: 75});
	this._clearButton.setText(ZmMsg.removeAll);
	this._clearButton.addSelectionListener(new AjxListener(this, this._handleRemoveAll));
	this._clearButton.replaceElement(id + "_emailNotificationRemoveAllButton");

	this._addButton = new DwtButton({parent:this._view, size: 75});
	this._addButton.setText(ZmMsg.add);
	this._addButton.addSelectionListener(new AjxListener(this, this._handleAddFromNumber));
	this._addButton.replaceElement(id + "_emailNotificationAddButton");
	
	this._list = new ZmBufferList({parent:this._view, headerText:ZmMsg.voicemailNotificationListHeader, displayProperty:"text"});
	this._list.sortingEnabled = false;
	this._list.replaceElement(id + "_emailNotificationList");
	
};

///////////////////////////////////////////////////////////////////////

ZmSelectiveCallForwardingUI = function(view) {
	ZmCallFeatureUI.call(this, view);
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
	this._list.set(AjxVector.fromArray((feature.data.phone)? [].concat(feature.data.phone) : []), 1); // setting directly from feature.data.phone would cause the array to be cleared on save, so we clone it using concat
	this._comboBox.setText(ZmPhone.calculateDisplay(feature.data.ft));
};

ZmSelectiveCallForwardingUI.prototype._isValueDirty =
function() {
	if (!this._isComboBoxValid(this._comboBox) || (this._getTo() != this._feature.data.ft)) return true;
	var newPhones = (this._list && this._list.getList())? this._list.getList().getArray() : null;
	var oldPhones = this._feature.data.phone || null;
	
	if (!newPhones && !oldPhones) return false;
	if (!newPhones || !oldPhones) return true;
	if (newPhones.length != oldPhones.length) return true;
	if (this._list.getChanged()) return true;
	for (var i=0; i<newPhones.length; i++) {
		if (newPhones[i].pn != oldPhones[i].pn || newPhones[i].a != oldPhones[i].a)
			return true;
	}
	return false;
};

ZmSelectiveCallForwardingUI.prototype.validate =
function(errors) {
	this._validateComboBox(this._comboBox, errors, ZmMsg.callForwardingError);
	
	var from = this._getFrom();
	if (from.length < 1) {
		errors.push(ZmMsg.selectiveCallForwardingFromErrorMin);
	} else if (from.length > ZmCallFeature.SELECTIVE_CALL_FORWARDING_MAX_ENTRIES) {
		errors.push(ZmMsg.selectiveCallForwardingFromErrorMax);
	} else {
		for (var i=0; i<from.length; i++) {
			var phone = from[i].pn;
			if (phone) {
				var error = this._view._validatePhoneNumberFct(phone);
				if (error != null) {
					errors.push(error);
				}
			}
		}
	}
};


ZmSelectiveCallForwardingUI.prototype.getFeature =
function() {
	var result = ZmCallFeatureUI.prototype.getFeature.call(this);
	
	var from = this._getFrom();
	if (!from || from.length==0) {
		result.isActive = false;
		result.data.phone = [];
	} else {
		result.data.phone = from;
	}

	var to = this._getTo();
	if (!to || to=="") {
		result.isActive = false;
	} else {
		result.data.ft = to;
	}
	return result;
};

ZmSelectiveCallForwardingUI.prototype._getFrom =
function() {
	var from = [];
	if (this._list && this._list.getList()) {
		var items = this._list.getList().getArray();
		for (var i=0; i<items.length; i++)
			from.push({a: items[i].a, pn: items[i].pn}); // Filter all other attributes	
	}
	return from;
}

ZmSelectiveCallForwardingUI.prototype._getTo =
function() {
	if (this._comboBox) {
		var value = this._comboBox.getValue();
		if (value) {
			return value;
		} else {
			return ZmPhone.calculateName(this._comboBox.getText());
		}
	} else return null;
};

ZmSelectiveCallForwardingUI.prototype._validateFromPhoneNumber =
function(number) {
	number = this._view._validatePhoneNumber(number);
	if (ZmPhone.calculateFullName(number) == ZmPhone.calculateFullName(this._getTo())) {
		throw ZmMsg.selectiveCallForwardingFromErrorSameAsTo;
	}
	return number;
}

ZmSelectiveCallForwardingUI.prototype._validateToPhoneNumber =
function(number) {
	number = this._view._validatePhoneNumber(number);
	if (this._list && this._list.containsNumber(number)) {
		throw ZmMsg.selectiveCallForwardingToErrorInList;
	}
	return number;
}

ZmSelectiveCallForwardingUI.prototype._handleAddFromNumber =
function(event) {
	var addValue = this._addField.getValue();
	if (!addValue || AjxStringUtil.trim(addValue) == "") {
		this.showDialogWithFAQ(AjxMsg.valueIsRequired);
		this._clearField(this._addField);
	} else {
		var error = this._view._validatePhoneNumberFct(addValue);
		if (error!=null) {
			this.showDialogWithFAQ(error);
			this._clearField(this._addField);
		} else if (this._list) {
			if (!ZmPhone.isValid(addValue)) {
				this.showDialogWithFAQ(ZmMsg.selectiveCallForwardingError);
				this._clearField(this._addField);
			} else if (ZmPhone.calculateFullName(addValue) == ZmPhone.calculateFullName(this._getTo())) {
				this.showDialogWithFAQ(ZmMsg.selectiveCallForwardingFromErrorSameAsTo);
				this._clearField(this._addField);
			} else if (this._list.containsNumber(addValue)) {
				this.showDialogWithFAQ(ZmMsg.errorPhoneNotUnique);
				this._clearField(this._addField);
			} else {
				this._list.addNumber(addValue);
				this._addField.setValue(null, true);
				this._setAddFromNumberVisibility(false);
			}
		}
	}
};

ZmSelectiveCallForwardingUI.prototype._handleExposeButtonClick =
function() {
	if (this._list.getList() && this._list.getList().size() >= ZmCallFeature.SELECTIVE_CALL_FORWARDING_MAX_ENTRIES) {
		this.showDialogWithFAQ(ZmMsg.selectiveCallForwardingFromErrorMax);
	} else {
		this._setAddFromNumberVisibility(true);
		this._addField.focus();
	}
}

ZmSelectiveCallForwardingUI.prototype._setAddFromNumberVisibility =
function(visible) {
	visible = Boolean(visible);
	this._addLabel.setVisible(visible);
	this._addField.setVisible(visible);
	this._addButton.setVisible(visible);
	this._addRules.setVisible(visible);
	this._exposeAddField.setVisible(!visible);
	this.addVisible = visible;
}

ZmSelectiveCallForwardingUI.prototype.setEnabled =
function(enabled) {
	this._list.setEnabled(enabled);
	this._exposeAddField.setEnabled(enabled && !this.addVisible);
	
	this._addLabel.setEnabled(enabled);
	
	DwtControl.prototype.setEnabled.call(this._addField, enabled); // We don't want to validate the input field when we enable it, so do everything that DwtInputField.prototype.setEnabled() does except validation
	this._addField.getInputElement().disabled = !enabled;
	
	this._addButton.setEnabled(enabled);
	this._addRules.setEnabled(enabled);
	
	this._toLabel.setEnabled(enabled);
	this._comboBox.setEnabled(enabled);
};

ZmSelectiveCallForwardingUI.prototype._initialize =
function(id) {
	this._createCheckbox(ZmMsg.selectiveCallForwardingFromDescription, id + "_selectiveCallForwardingCheckbox");
	
	this._list = new ZmPhoneBufferList(this._view);
	this._list.sortingEnabled = false;
	this._list.replaceElement(id + "_selectiveCallForwardingList");
	
	this._exposeAddField = new DwtButton({parent:this._view, size: 75});
	this._exposeAddField.setText(ZmMsg.add);
	this._exposeAddField.addSelectionListener(new AjxListener(this, this._handleExposeButtonClick));
	this._exposeAddField.replaceElement(id + "_selectiveCallForwardingExposeAddBox");
	
	this._addLabel = new DwtLabel({parent:this._view, className:"DwtLabel AlignRight"});
	this._addLabel.setText(ZmMsg.selectiveCallForwardingAddFrom);
	this._addLabel.replaceElement(id + "_selectiveCallForwardingAddLabel");
	
	this._addField = new DwtInputField({parent:this._view, size: 25, validator: AjxCallback.simpleClosure(this._validateFromPhoneNumber, this), validationStyle: DwtInputField.CONTINUAL_VALIDATION});
	this._addField.replaceElement(id + "_selectiveCallForwardingAddBox");
	
	this._addRules = new DwtLabel({parent:this._view});
	this._addRules.setText(ZmMsg.selectiveCallForwardingRules);
	this._addRules.replaceElement(id + "_selectiveCallForwardingAddRules");
	
	this._addButton = new DwtButton({parent:this._view, size: 75});
	this._addButton.setText(ZmMsg.add);
	this._addButton.addSelectionListener(new AjxListener(this, this._handleAddFromNumber));
	this._addButton.replaceElement(id + "_selectiveCallForwardingAddButton");

	this._toLabel = new DwtLabel({parent:this._view, style: (DwtLabel.IMAGE_LEFT | DwtLabel.ALIGN_RIGHT), className:"DwtLabel AlignRight"});
	this._toLabel.setText(ZmMsg.selectiveCallForwardingToDescription);
	this._toLabel.replaceElement(id + "_selectiveCallForwardingToLabel");
	
	this._comboBox = new DwtComboBox({parent:this._view, inputParams:{size: 25, validator: AjxCallback.simpleClosure(this._validateToPhoneNumber, this), validationStyle: DwtInputField.CONTINUAL_VALIDATION}});
	this._populatePhoneComboBox(this._comboBox);
	this._comboBox.replaceElement(id + "_selectiveCallForwardingComboBox");
	
	this._setAddFromNumberVisibility(false);
};

///////////////////////////////////////////////////////////////////////

ZmAnonymousCallRejectionUI = function(view) {
	ZmCallFeatureUI.call(this, view);
	this._checkbox = null;
}

ZmAnonymousCallRejectionUI.prototype = new ZmCallFeatureUI;
ZmAnonymousCallRejectionUI.prototype.constructor = ZmAnonymousCallRejectionUI;
ZmAnonymousCallRejectionUI.prototype.toString =
function() {
	return "ZmAnonymousCallRejectionUI";
}

ZmAnonymousCallRejectionUI.prototype.getName =
function() {
	return ZmCallFeature.ANONYMOUS_REJECTION;
};


ZmAnonymousCallRejectionUI.prototype.setEnabled =
function() {
	// No-op
}

ZmAnonymousCallRejectionUI.prototype.show =
function() {
	// No-op
}


ZmAnonymousCallRejectionUI.prototype._isValueDirty =
function() {
	return false;
}


ZmAnonymousCallRejectionUI.prototype._initialize =
function(id) {
	this._createCheckbox(ZmMsg.anonymousCallRejectionDescription, id + "_anonymousCallRejectionCheckbox");
};

///////////////////////////////////////////////////////////////////////

ZmSelectiveCallRejectionUI = function(view) {
	ZmCallFeatureUI.call(this, view);
}

ZmSelectiveCallRejectionUI.prototype = new ZmCallFeatureUI;
ZmSelectiveCallRejectionUI.prototype.constructor = ZmSelectiveCallRejectionUI;
ZmSelectiveCallRejectionUI.prototype.toString =
function() {
	return "ZmSelectiveCallRejectionUI";
}

ZmSelectiveCallRejectionUI.prototype.getName =
function() {
	return ZmCallFeature.SELECTIVE_CALL_REJECTION;
};

ZmSelectiveCallRejectionUI.prototype.show =
function(feature) {
	this._list.set(AjxVector.fromArray((feature.data.phone)? [].concat(feature.data.phone) : []), 1);
};

ZmSelectiveCallRejectionUI.prototype._isValueDirty =
function() {
	var newPhones = (this._list && this._list.getList()) ? this._list.getList().getArray() : null;
	var oldPhones = this._feature.data.phone;
	
	if (!newPhones && !oldPhones) return false;
	if (!newPhones || !oldPhones) return true;
	if (newPhones.length != oldPhones.length) return true;
	if (this._list.getChanged()) return true;
	for (var i=0; i<newPhones.length; i++) {
		if (newPhones[i].pn != oldPhones[i].pn || newPhones[i].a != oldPhones[i].a)
			return true;
	}
	return false;
};

ZmSelectiveCallRejectionUI.prototype.validate =
function(errors) {	
	var from = this._getFrom();
	if (from.length < 1) {
		errors.push(ZmMsg.selectiveCallRejectionFromErrorMin);
	} else if (from.length > ZmCallFeature.SELECTIVE_CALL_REJECTION_MAX_ENTRIES) {
		errors.push(ZmMsg.selectiveCallRejectionFromErrorMax);
	} else {
		for (var i=0; i<from.length; i++) {
			var phone = from[i].pn;
			if (phone) {
				var error = this._view._validatePhoneNumberFct(phone);
				if (error != null) {
					errors.push(error);
				}
			}
		}
	}
};

ZmSelectiveCallRejectionUI.prototype.getFeature =
function() {
	var result = ZmCallFeatureUI.prototype.getFeature.call(this);
	var from = this._getFrom();
	if (!from || from.length==0) {
		result.isActive = false;
		result.data.phone = [];
	} else {
		result.data.phone = from;
	}
	return result;
};

ZmSelectiveCallRejectionUI.prototype._getFrom =
function() {
	var from = [];
	if (this._list && this._list.getList()) {
		var items = this._list.getList().getArray();
		for (var i=0; i<items.length; i++)
			from.push({a: items[i].a, pn: items[i].pn}); // Filter all other attributes
	}
	return from;
}

ZmSelectiveCallRejectionUI.prototype._handleAddFromNumber =
function(event) {
	var addValue = this._addField.getValue();
	if (!addValue || AjxStringUtil.trim(addValue) == "") {
		this.showDialogWithFAQ(AjxMsg.valueIsRequired);
		this._clearField(this._addField);
	} else {
		var error = this._view._validatePhoneNumberFct(addValue);
		if (error!=null) {
			this.showDialogWithFAQ(error);
			this._clearField(this._addField);
		} else if (this._list) {
			if (!ZmPhone.isValid(addValue)) {
				this.showDialogWithFAQ(ZmMsg.selectiveCallRejectionError);
				this._clearField(this._addField);
			} else if (this._list && this._list.containsNumber(addValue)) {
				this.showDialogWithFAQ(ZmMsg.errorPhoneNotUnique);
				this._clearField(this._addField);
			} else {
				this._list.addNumber(addValue);
				this._addField.setValue(null, true);
				this._setAddFromNumberVisibility(false);
			}
		}
	}
};

ZmSelectiveCallRejectionUI.prototype._handleExposeButtonClick =
function() {
	if (this._list.getList() && this._list.getList().size() >= ZmCallFeature.SELECTIVE_CALL_REJECTION_MAX_ENTRIES)
		this.showDialogWithFAQ(ZmMsg.selectiveCallRejectionFromErrorMax);
	else {
		this._setAddFromNumberVisibility(true);
		this._addField.focus();
	}
}

ZmSelectiveCallRejectionUI.prototype._setAddFromNumberVisibility =
function(visible) {
	visible = Boolean(visible);
	this._addLabel.setVisible(visible);
	this._addField.setVisible(visible);
	this._addButton.setVisible(visible);
	this._addRules.setVisible(visible);
	this._exposeAddField.setVisible(!visible);
	this.addVisible = visible;
}

ZmSelectiveCallRejectionUI.prototype.setEnabled =
function(enabled) {
	this._list.setEnabled(enabled);
	this._exposeAddField.setEnabled(enabled && !this.addVisible);
	
	this._addLabel.setEnabled(enabled);
	
	DwtControl.prototype.setEnabled.call(this._addField, enabled); // We don't want to validate the input field when we enable it, so do everything that DwtInputField.prototype.setEnabled() does except validation
	this._addField.getInputElement().disabled = !enabled;
	
	this._addButton.setEnabled(enabled);
	this._addRules.setEnabled(enabled);
};

ZmSelectiveCallRejectionUI.prototype._initialize =
function(id) {
	this._createCheckbox(ZmMsg.selectiveCallRejectionFromDescription, id + "_selectiveCallRejectionCheckbox");
	
	this._list = new ZmPhoneBufferList(this._view);
	this._list.sortingEnabled = false;
	this._list.replaceElement(id + "_selectiveCallRejectionList");
	
	this._exposeAddField = new DwtButton({parent:this._view, size: 75});
	this._exposeAddField.setText(ZmMsg.add);
	this._exposeAddField.addSelectionListener(new AjxListener(this, this._handleExposeButtonClick));
	this._exposeAddField.replaceElement(id + "_selectiveCallRejectionExposeAddBox");
	
	this._addLabel = new DwtLabel({parent:this._view, className:"DwtLabel AlignRight"});
	this._addLabel.setText(ZmMsg.selectiveCallRejectionAddFrom);
	this._addLabel.replaceElement(id + "_selectiveCallRejectionAddLabel");
	
	this._addField = new DwtInputField({parent:this._view, size: 25, validator: AjxCallback.simpleClosure(this._view._validatePhoneNumber, this._view), validationStyle: DwtInputField.CONTINUAL_VALIDATION});
	this._addField.replaceElement(id + "_selectiveCallRejectionAddBox");
	
	this._addRules = new DwtLabel({parent:this._view});
	this._addRules.setText(ZmMsg.selectiveCallRejectionRules);
	this._addRules.replaceElement(id + "_selectiveCallRejectionAddRules");
	
	this._addButton = new DwtButton({parent:this._view, size: 75});
	this._addButton.setText(ZmMsg.add);
	this._addButton.addSelectionListener(new AjxListener(this, this._handleAddFromNumber));
	this._addButton.replaceElement(id + "_selectiveCallRejectionAddButton");

	this._setAddFromNumberVisibility(false);
};

///////////////////////////////////////////////////////////////////////

ZmSelectiveCallAcceptanceUI = function(view) {
	ZmCallFeatureUI.call(this, view);
}

ZmSelectiveCallAcceptanceUI.prototype = new ZmCallFeatureUI;
ZmSelectiveCallAcceptanceUI.prototype.constructor = ZmSelectiveCallAcceptanceUI;
ZmSelectiveCallAcceptanceUI.prototype.toString =
function() {
	return "ZmSelectiveCallAcceptanceUI";
}

ZmSelectiveCallAcceptanceUI.prototype.getName =
function() {
	return ZmCallFeature.SELECTIVE_CALL_ACCEPTANCE;
};

ZmSelectiveCallAcceptanceUI.prototype.show =
function(feature) {
	this._list.set(AjxVector.fromArray((feature.data.phone)? [].concat(feature.data.phone) : []), 1);
};

ZmSelectiveCallAcceptanceUI.prototype._isValueDirty =
function() {
	var newPhones = (this._list && this._list.getList()) ? this._list.getList().getArray() : null;
	var oldPhones = this._feature.data.phone;
	
	if (!newPhones && !oldPhones) return false;
	if (!newPhones || !oldPhones) return true;
	if (newPhones.length != oldPhones.length) return true;
	if (this._list.getChanged()) return true;
	for (var i=0; i<newPhones.length; i++) {
		if (newPhones[i].pn != oldPhones[i].pn || newPhones[i].a != oldPhones[i].a)
			return true;
	}
	return false;
};

ZmSelectiveCallAcceptanceUI.prototype.validate =
function(errors) {	
	var from = this._getFrom();
	if (from.length < 1) {
		errors.push(ZmMsg.selectiveCallAcceptanceFromErrorMin);
	} else if (from.length > ZmCallFeature.SELECTIVE_CALL_ACCEPTANCE_MAX_ENTRIES) {
		errors.push(ZmMsg.selectiveCallAcceptanceFromErrorMax);
	} else {
		for (var i=0; i<from.length; i++) {
			var phone = from[i].pn;
			if (phone) {
				var error = this._view._validatePhoneNumberFct(phone);
				if (error != null) {
					errors.push(error);
				}
			}
		}
	}
};

ZmSelectiveCallAcceptanceUI.prototype.getFeature =
function() {
	var result = ZmCallFeatureUI.prototype.getFeature.call(this);
	var from = this._getFrom();
	if (!from || from.length==0) {
		result.isActive = false;
		result.data.phone = [];
	} else {
		result.data.phone = from;
	}
	return result;
};

ZmSelectiveCallAcceptanceUI.prototype._getFrom =
function() {
	var from = [];
	if (this._list && this._list.getList()) {
		var items = this._list.getList().getArray();
		for (var i=0; i<items.length; i++)
			from.push({a: items[i].a, pn: items[i].pn}); // Filter all other attributes
	}
	return from;
}

ZmSelectiveCallAcceptanceUI.prototype._handleAddFromNumber =
function(event) {
	var addValue = this._addField.getValue();
	if (!addValue || AjxStringUtil.trim(addValue) == "") {
		this.showDialogwithFAQ(AjxMsg.valueIsRequired);
		this._clearField(this._addField);
	} else {
		var error = this._view._validatePhoneNumberFct(addValue);
		if (error!=null) {
			this.showDialogwithFAQ(error);
			this._clearField(this._addField);
		} else if (this._list) {
			if (!ZmPhone.isValid(addValue)) { // Possibly obsolete, but doesn't do any harm
				this.showDialogwithFAQ(ZmMsg.selectiveCallAcceptanceError);
				this._clearField(this._addField);
			} else if (this._list.containsNumber(addValue)) {
				this.showDialogwithFAQ(ZmMsg.errorPhoneNotUnique);
				this._clearField(this._addField);
			} else {
				this._list.addNumber(addValue);
				this._addField.setValue(null, true);
				this._setAddFromNumberVisibility(false);
			}
		}
	}
};

ZmSelectiveCallAcceptanceUI.prototype._handleExposeButtonClick =
function() {
	if (this._list.getList() && this._list.getList().size() >= ZmCallFeature.SELECTIVE_CALL_REJECTION_MAX_ENTRIES)
		this.showDialogWithFAQ(ZmMsg.selectiveCallRejectionFromErrorMax);
	else {
		this._setAddFromNumberVisibility(true);
		this._addField.focus();
	}
}

ZmSelectiveCallAcceptanceUI.prototype._setAddFromNumberVisibility =
function(visible) {
	visible = Boolean(visible);
	this._addLabel.setVisible(visible);
	this._addField.setVisible(visible);
	this._addButton.setVisible(visible);
	this._addRules.setVisible(visible);
	this._exposeAddField.setEnabled(!visible);
	this.addVisible = visible;
}

ZmSelectiveCallAcceptanceUI.prototype.setEnabled =
function(enabled) {
	this._list.setEnabled(enabled);
	this._exposeAddField.setEnabled(enabled && !this.addVisible);
	
	this._addLabel.setEnabled(enabled);
	
	DwtControl.prototype.setEnabled.call(this._addField, enabled); // We don't want to validate the input field when we enable it, so do everything that DwtInputField.prototype.setEnabled() does except validation
	this._addField.getInputElement().disabled = !enabled;
	
	this._addButton.setEnabled(enabled);
	this._addRules.setEnabled(enabled);
};

ZmSelectiveCallAcceptanceUI.prototype._initialize =
function(id) {
	this._createCheckbox(ZmMsg.selectiveCallAcceptanceFromDescription, id + "_selectiveCallAcceptanceCheckbox");
	
	this._list = new ZmPhoneBufferList(this._view);
	this._list.sortingEnabled = false;
	this._list.replaceElement(id + "_selectiveCallAcceptanceList");
	
	this._exposeAddField = new DwtButton({parent:this._view, size: 75});
	this._exposeAddField.setText(ZmMsg.add);
	this._exposeAddField.addSelectionListener(new AjxListener(this, this._handleExposeButtonClick));
	this._exposeAddField.replaceElement(id + "_selectiveCallAcceptanceExposeAddBox");
	
	this._addLabel = new DwtLabel({parent:this._view});
	this._addLabel.setText(ZmMsg.selectiveCallRejectionAddFrom);
	this._addLabel.replaceElement(id + "_selectiveCallAcceptanceAddLabel");
	
	this._addField = new DwtInputField({parent:this._view, size: 25, validator: AjxCallback.simpleClosure(this._view._validatePhoneNumber, this._view), validationStyle: DwtInputField.CONTINUAL_VALIDATION});
	this._addField.replaceElement(id + "_selectiveCallAcceptanceAddBox");
	
	this._addRules = new DwtLabel({parent:this._view});
	this._addRules.setText(ZmMsg.selectiveCallRejectionRules);
	this._addRules.replaceElement(id + "_selectiveCallAcceptanceAddRules");
	
	this._addButton = new DwtButton({parent:this._view, size: 75});
	this._addButton.setText(ZmMsg.add);
	this._addButton.addSelectionListener(new AjxListener(this, this._handleAddFromNumber));
	this._addButton.replaceElement(id + "_selectiveCallAcceptanceAddButton");

	this._setAddFromNumberVisibility(false);
};


///////////////////////////////////////////////////////////////////////

/*
* ZmPhoneList
* The list of phone accounts.
*/
ZmPhoneList = function(parent) {
	var headerList = [new DwtListHeaderItem({field:1, text:ZmMsg.number})];
	DwtListView.call(this, {parent:parent, className:"ZmPhoneList", headerList:headerList});

	this.multiSelectEnabled = false;
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

///////////////////////////////////////////////////

/*
* ZmBufferList
* A dwtlist of items with "remove" links
*/
ZmBufferList = function(params) {
	if (arguments.length == 0) { return; }
	params = Dwt.getParams(arguments, DwtListView.PARAMS);
	if (!params.headerList) params.headerList = [new DwtListHeaderItem({field:1, text:params.headerText, sortable:false, resizeable:false, noRemove:true, width:"200"}), new DwtListHeaderItem({field:2, sortable:false, text:"&nbsp;", resizeable:false, noRemove:true, width: "180"})];
	if (!params.className) params.className = "ZmBufferList";
	DwtListView.call(this, params);
	this.setSize(400, Dwt.DEFAULT);
	this.multiSelectEnabled = false;
	this.displayProperty = params.displayProperty || "text";
	this._changed = false;
};

ZmBufferList.prototype = new DwtListView;
ZmBufferList.prototype.constructor = ZmBufferList;

ZmBufferList.prototype.toString =
function() {
	return "ZmBufferList";
};

ZmBufferList.prototype.set =
function(list, defaultColumnSort) {
	DwtListView.prototype.set.call(this, list, defaultColumnSort);
	this._changed = false;
}

ZmBufferList.prototype.getChanged =
function() {
	return this._changed;
}

ZmBufferList.prototype._getCellContents =
function(htmlArr, idx, item, field, colIdx, params) {
	if (item) {
	switch (colIdx) {
		case 0:
			if (item[this.displayProperty])
				htmlArr[idx++] = this.getItemDisplay(item);
			break;
		case 1:
			var id = Dwt.getNextId();
			htmlArr[idx++] = "<span class='FakeAnchor' id='";
			htmlArr[idx++] = id;
			htmlArr[idx++] = "'>";
			htmlArr[idx++] = ZmMsg.remove;
			htmlArr[idx++] = "</span>";
			item.link = id;
			break;
	}
	}
	return idx;
};

ZmBufferList.prototype.getItemDisplay =
function(item) {
	return item ? AjxStringUtil.htmlEncode(item[this.displayProperty], true) : "";
}

ZmBufferList.prototype.addItem =
function(item, index, skipNotify) {
	item.id = Dwt.getNextId();
	
	DwtListView.prototype.addItem.call(this, item, index, skipNotify);
	
	var link = document.getElementById(item.link);
	if (link && item) {
		link.onclick = AjxCallback.simpleClosure(this.preRemoveItem, this, item);
	}
	this._changed = true;
}

ZmBufferList.prototype._renderList =
function(list, noResultsOk) {
	if (list instanceof AjxVector && list.size()) {
		var size = list.size();
		for (var i = 0; i < size; i++) {
		        var item = list.get(i);
			if (item)
				item.id = Dwt.getNextId();
		}
	}
	noResultsOk = true;
	
	DwtListView.prototype._renderList.apply(this, arguments);
	
	var size = this._list.size();
	for (var i = 0; i < size; i++) {
	        var item = this._list.get(i);
		if (item) {
			var link = document.getElementById(item.link);
			if (link) {
				link.onclick = AjxCallback.simpleClosure(this.preRemoveItem, this, item);
			}
		}
	}
};

ZmBufferList.prototype.preRemoveItem =
function(item) {
	if (item && this.getEnabled()) {
		this.removeItem.call(this, item);
		this._changed = true;
	}
}
	
ZmBufferList.prototype.containsItem =
function(item) {
	var displayProperty = this.displayProperty;
	return item? (this._list.indexOfLike(item, function() {return this[displayProperty]}) != -1) : false;
}

ZmBufferList.prototype.getItemStrings =
function() {
	var strings = [];
	if (this._list) {
		var arr = this._list.getArray();
		for (var i=0; i<arr.length; i++) {
			strings.push(arr[i][this.displayProperty]);
		}
	}
	return strings;
}

////////////////////////////////////////////////////////

/*
* ZmPhoneBufferList
* phone number specific version of ZmBufferList
*/
ZmPhoneBufferList = function(parent) {
	var headerList = [new DwtListHeaderItem({field:1, text:ZmMsg.voicemailPhoneNumber, sortable:false, resizeable:false, noRemove:true, width:"150"}), new DwtListHeaderItem({field:2, sortable:false, text:"&nbsp;", resizeable:false, noRemove:true, width: "130"})];
	ZmBufferList.call(this, {parent:parent, className:"ZmPhoneBufferList", headerList:headerList, displayProperty:"pn"});
	this.setSize(300, Dwt.DEFAULT);
	this.multiSelectEnabled = false;
};

ZmPhoneBufferList.prototype = new ZmBufferList;
ZmPhoneBufferList.prototype.constructor = ZmPhoneBufferList;

ZmPhoneBufferList.prototype.toString =
function() {
	return "ZmPhoneBufferList";
};

ZmPhoneBufferList.prototype.getItemDisplay =
function(item) {
	return AjxStringUtil.htmlEncode(ZmPhone.calculateDisplay(item[this.displayProperty]), true);
}

ZmPhoneBufferList.prototype.containsItem =
function(item) {
	if (item.pn && this._list) {
		var pn = ZmPhone.calculateFullName(item.pn);
		for (var i=0, count=this._list.size(); i<count; i++)
			if (pn == ZmPhone.calculateFullName(this._list.get(i).pn))
				return true;
	}
	return false;
}

ZmPhoneBufferList.prototype.containsNumber =
function(number) {
	number = ZmPhone.calculateFullName(number);
	if (this._list) {
		for (var i=0, count=this._list.size(); i<count; i++)
			if (number == ZmPhone.calculateFullName(this._list.get(i).pn))
				return true;
	}
	return false;
}

ZmPhoneBufferList.prototype.addNumber =
function(number) {
	this.addItem({a: true, pn: ZmPhone.calculateName(number)}, null, false);
}

ZmPhoneBufferList.getItemNumber =
function() {
	return (this.pn) ? ZmPhone.calculateName(this.pn) : null;
}

ZmPhoneBufferList.prototype.getItemNumbers =
function() {
	var numbers = [];
	if (this._list) {
		var arr = this._list.getArray();
		for (var i=0; i<arr.length; i++) {
			numbers.push(ZmPhoneBufferList.getItemNumber.call(arr[i]));
		}
	}
	return numbers;
}

