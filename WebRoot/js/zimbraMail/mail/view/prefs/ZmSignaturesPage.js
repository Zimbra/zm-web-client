/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
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

ZmSignaturesPage = function(parent, section, controller) {

	ZmPreferencesPage.call(this, parent, section, controller);

	this._minEntries = appCtxt.get(ZmSetting.SIGNATURES_MIN);
	this._maxEntries = appCtxt.get(ZmSetting.SIGNATURES_MAX);
};

ZmSignaturesPage.prototype = new ZmPreferencesPage;
ZmSignaturesPage.prototype.constructor = ZmSignaturesPage;

ZmSignaturesPage.prototype.toString = function() {
	return "ZmSignaturesPage";
};

//
// Data
//

ZmSignaturesPage.SIGNATURE_TEMPLATE = "prefs.Pages#SignatureSplitView";

ZmSignaturesPage.NO_SIGNATURE = "none";

ZmSignaturesPage.SIG_TYPES = [ZmIdentity.SIGNATURE, ZmIdentity.REPLY_SIGNATURE];

//
// Public methods
//

ZmSignaturesPage.prototype.showMe =
function() {

	ZmPreferencesPage.prototype.showMe.call(this);

	// bug fix #41719 - always resize when in multi-account mode.
	if (!this._firstTime) {
		this._resetSize();
		this._firstTime = true;
	}

	// bug fix #31849 - reset the signature html editor when in multi-account mode
	// since the view gets re-rendered whenever the account changes
	if (appCtxt.multiAccounts) {
		this._signatureEditor = null;
	}
};

ZmSignaturesPage.prototype.getAllSignatures =
function(includeEmpty, includeNonModified) {
	return [].concat(
		this.getNewSignatures(includeEmpty),
		this.getModifiedSignatures(includeNonModified)
	);
};

ZmSignaturesPage.prototype.getNewSignatures =
function(includeEmpty) {
	var array = [];
	for (var id in this._signatures) {
		var signature = this._signatures[id];
		if (!signature._new) continue;

		var hasName = signature.name.replace(/\s*/g,"") != "";
		var hasValue = signature.getValue().replace(/\s*/g,"") != "";
		var isNameDefault = ZmSignaturesPage.isNameDefault(signature.name);
                
		if ((includeEmpty && !isNameDefault) || (hasName && hasValue)) {
			array.push(signature);
		}
	}
	return array;
};

ZmSignaturesPage.prototype.getDeletedSignatures =
function() {
	var array = [];
	for (var id in this._deletedSignatures) {
		var signature = this._deletedSignatures[id];
		array.push(signature);
	}
	return array;
};

ZmSignaturesPage.prototype.getModifiedSignatures =
function(includeNonModified) {
	var array = [];
	for (var id in this._signatures) {
		var signature = this._signatures[id];
		if (signature._new) { continue; }

		var modified = includeNonModified || this._hasChanged(signature);
		if (modified) {
			array.push(signature);
		}
	}
	return array;
};

ZmSignaturesPage.SIG_FIELDS = [ZmIdentity.SIGNATURE, ZmIdentity.REPLY_SIGNATURE];

ZmSignaturesPage.prototype.getChangedUsage =
function() {

	if (this._newUsage && this._newUsage.length) {
		return this._newUsage;
	}

	var changes = [];
	var ic = appCtxt.getIdentityCollection();
	var identities = ic && ic.getIdentities();
	if (identities && identities.length) {
		for (var i = 0, len = identities.length; i < len; i++) {
			var identity = identities[i];
			for (var j = 0; j < ZmSignaturesPage.SIG_FIELDS.length; j++) {
				var field = ZmSignaturesPage.SIG_FIELDS[j];
				var sigId = identity.getField(field) || null;
				var select = this._sigSelect[identity.id] && this._sigSelect[identity.id][field];
				if (select) {
					var value = select.getValue();
					if (value == ZmSignaturesPage.NO_SIGNATURE) {
						value = null;
					}
					if (value != sigId) {
						changes.push({identity:identity.id, sig:field, value:value});
					}
				}
			}
		}
	}
	return changes;
};

ZmSignaturesPage.prototype.reset =
function(useDefaults) {
	if (this._selSignature) {
		this._updateSignature();
	}

	ZmPreferencesPage.prototype.reset.apply(this, arguments);

	this._populateSignatures(true);
};

ZmSignaturesPage.prototype.resetOnAccountChange =
function() {
	ZmPreferencesPage.prototype.resetOnAccountChange.apply(this, arguments);
	this._selSignature = null;
	this._firstTime = false;
};

// saving

ZmSignaturesPage.prototype.isDirty =
function() {

	if (this._selSignature) {
		this._updateSignature();
	}

	return this.getNewSignatures(true).length > 0 ||
		   this.getDeletedSignatures().length > 0 ||
		   this.getModifiedSignatures().length > 0 ||
		   this.getChangedUsage().length > 0;
};

ZmSignaturesPage.defaultNameRegex = new RegExp("^" + ZmMsg.signature+"\\s#(\\d+)$", "i");
ZmSignaturesPage.isNameDefault =
function(name) {
	return name && name.match(ZmSignaturesPage.defaultNameRegex);
};

ZmSignaturesPage.prototype.validate =
function() {
	if (this._selSignature) {
		this._updateSignature();
	}

	var signatures = this.getAllSignatures(true);
	var maxLength = appCtxt.get(ZmSetting.SIGNATURE_MAX_LENGTH);
	for (var i = 0; i < signatures.length; i++) {
		var signature = signatures[i];
		var isNameEmpty = (signature.name.replace(/\s*/g,"") == "");
		var isValueEmpty = (signature.value.replace(/\s*/g,"") == "");
		var isNameDefault = ZmSignaturesPage.isNameDefault(signature.name);
		if (isNameEmpty && isValueEmpty) {
			this._deleteSignature(signature);
		} else if (isNameEmpty || (isValueEmpty && !isNameDefault)) {
			this._errorMsg = isNameEmpty ? ZmMsg.signatureNameMissingRequired : ZmMsg.signatureValueMissingRequired;
			return false;
		}
		var sigValue = signature.value;
		if (sigValue.length > maxLength) {
			this._errorMsg = AjxMessageFormat.format((signature.contentType == ZmMimeTable.TEXT_HTML)
				? ZmMsg.errorHtmlSignatureTooLong
				: ZmMsg.errorSignatureTooLong, maxLength);
			return false;
		}
	}
	return true;
};

ZmSignaturesPage.prototype.getErrorMessage =
function() {
	return this._errorMsg;
};

ZmSignaturesPage.prototype.addCommand =
function(batchCommand) {

	// delete signatures
	var deletedSigs = this.getDeletedSignatures();
	for (var i = 0; i < deletedSigs.length; i++) {
		var signature = deletedSigs[i];
		var callback = new AjxCallback(this, this._handleDeleteResponse, [signature]);
		signature.doDelete(callback, null, batchCommand);
	}

	// modify signatures
	var modifiedSigs = this.getModifiedSignatures();
	for (var i = 0; i < modifiedSigs.length; i++) {
		var signature = modifiedSigs[i];
		var comps = this._signatures[signature._htmlElId];
		var callback = new AjxCallback(this, this._handleModifyResponse, [signature]);
		var errorCallback = new AjxCallback(this, this._handleModifyError, [signature]);
		signature.save(callback, errorCallback, batchCommand);
	}

	// add signatures
	var newSigs = this.getNewSignatures();
	for (var i = 0; i < newSigs.length; i++) {
		var signature = newSigs[i];
		signature._id = signature.id; // Clearing existing dummy id
		signature.id = null;
		var callback = new AjxCallback(this, this._handleNewResponse, [signature]);
		signature.create(callback, null, batchCommand);
	}

	// signature usage
	var sigChanges = this.getChangedUsage();
	var ic = appCtxt.getIdentityCollection();
	for (var i = 0; i < sigChanges.length; i++) {
		var usage = sigChanges[i];
		if (!usage.ready) {
			this._newUsage.push(usage);
		}
		else {
			var identity = ic.getById(usage.identity);
			identity.setField(usage.sig, usage.value);
			identity.save(null, null, batchCommand);
		}
	}
};

ZmSignaturesPage.prototype.setContact =
function(contact) {
	this._selSignature.contactId = contact.id;
	this._vcardField.value = contact.getFileAs();
};

//
// Protected methods
//

ZmSignaturesPage.prototype._initialize =
function(container) {

	container.getHtmlElement().innerHTML = AjxTemplate.expand(ZmSignaturesPage.SIGNATURE_TEMPLATE, {id:this._htmlElId});

	//Signature LIST
	var listEl = document.getElementById(this._htmlElId + "_SIG_LIST");
	var list = new ZmSignatureListView(this);
	this._replaceControlElement(listEl, list);
	list.setMultiSelect(false);
	list.addSelectionListener(new AjxListener(this, this._selectionListener));
	list.setUI(null, true); // renders headers and empty list
	this._sigList = list;

	// Signature ADD
	var addEl = document.getElementById(this._htmlElId + "_SIG_NEW");
	var button = new DwtButton(this);
	button.setText(ZmMsg.newSignature);
	button.addSelectionListener(new AjxListener(this, this._handleAddButton));
	this._replaceControlElement(addEl, button);
	this._sigAddBtn = button;

	// Signature DELETE
	var deleteEl = document.getElementById(this._htmlElId + "_SIG_DELETE");
	var button = new DwtButton(this);
	button.setText(ZmMsg.del);
	button.addSelectionListener(new AjxListener(this, this._handleDeleteButton));
	this._replaceControlElement(deleteEl, button);
	this._deleteBtn = button;

	// vCard INPUT
	this._vcardField = document.getElementById(this._htmlElId + "_SIG_VCARD");

	// vCard BROWSE
	var el = document.getElementById(this._htmlElId + "_SIG_VCARD_BROWSE");
	var button = new DwtButton(this);
	button.setText(ZmMsg.browse);
	button.addSelectionListener(new AjxListener(this, this._handleVcardBrowseButton));
	this._replaceControlElement(el, button);
	this._vcardBrowseBtn = button;

	// vCard CLEAR
	var el = document.getElementById(this._htmlElId + "_SIG_VCARD_CLEAR");
	var button = new DwtButton(this);
	button.setText(ZmMsg.clear);
	button.addSelectionListener(new AjxListener(this, this._handleVcardClearButton));
	this._replaceControlElement(el, button);
	this._vcardClearBtn = button;

	// Signature Name
	var nameEl = document.getElementById(this._htmlElId + "_SIG_NAME");
	var params = {
		parent: this,
		type: DwtInputField.STRING,
		required: true,
		validationStyle: DwtInputField.CONTINUAL_VALIDATION,
		validator: AjxCallback.simpleClosure(this._updateName, this)
	};
	var input = this._sigName = new DwtInputField(params);
	this._replaceControlElement(nameEl, input);

	// Signature FORMAT
	var formatEl = document.getElementById(this._htmlElId + "_SIG_FORMAT");
	if (formatEl && appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED)) {
		var select = new DwtSelect(this);
		select.setToolTipContent(ZmMsg.formatTooltip);
		select.addOption(ZmMsg.formatAsText, 1 , true);
		select.addOption(ZmMsg.formatAsHtml, 0, false);
		select.addChangeListener(new AjxListener(this,this._handleFormatSelect));
		this._replaceControlElement(formatEl, select);
		this._sigFormat = select;
	}

	// Signature CONTENT
	var valueEl = document.getElementById(this._htmlElId + "_SIG_EDITOR");
	var htmlEditor = new ZmSignatureEditor(this);
	this._replaceControlElement(valueEl, htmlEditor);
	this._sigEditor = htmlEditor;

	// Signature use by identity
	this._resetUsageSelects();
	var ic = appCtxt.getIdentityCollection();
	if (ic) {
		ic.addChangeListener(new AjxListener(this, this._identityChangeListener));
	}

	this._initialized = true;
};

ZmSignaturesPage.prototype._resetUsageSelects =
function() {

	var table = document.getElementById(this._htmlElId + "_SIG_TABLE");
	while (table.rows.length > 1) {
		table.deleteRow(-1);
	}
	for (var id in this._sigSelect) {
		for (var field in this._sigSelect[id]) {
			var select = this._sigSelect[id][field];
			if (select) {
				select.dispose();
			}
		}
	}

	this._sigSelect = {};
	var signatures = appCtxt.getSignatureCollection().getSignatures();
	signatures.sort(ZmSignatureCollection.BY_NAME);
	var ic = appCtxt.getIdentityCollection();
	var identities = ic && ic.getIdentities();
	if (identities && identities.length) {
		identities.sort(ZmIdentityCollection._comparator);
		for (var i = 0, len = identities.length; i < len; i++) {
			var identity = identities[i];
			var row = table.insertRow(i + 1);
			var name = identity.getField(ZmIdentity.NAME);
			if (name == ZmMsg.defaultIdentityName) {
				name = ZmMsg.accountDefault;
			}
			var cell = row.insertCell(-1);
			cell.className = "ZOptionsLabel";
			cell.innerHTML = "<span style='font-weight:bold'>" + name + ":</span>";

			this._sigSelect[identity.id] = {};
			this._addUsageSelect(row, identity, signatures, ZmIdentity.SIGNATURE);
			this._addUsageSelect(row, identity, signatures, ZmIdentity.REPLY_SIGNATURE);
		}
	}
};

ZmSignaturesPage.prototype._addUsageSelect =
function(row, identity, signatures, field) {

	var select = this._sigSelect[identity.id][field] = new DwtSelect(this);
	var curSigId = identity.getField(field);
	select.addOption(ZmMsg.noSignature, Boolean(curSigId), ZmSignaturesPage.NO_SIGNATURE);
	for (var i = 0, len = signatures.length; i < len; i++) {
		var sig = signatures[i];
		select.addOption(sig.name, (curSigId == sig.id), sig.id);
	}
	var cell = row.insertCell(-1);
	select.reparentHtmlElement(cell);
};

ZmSignaturesPage.prototype._updateUsageSelects =
function(signature, action) {

	if (!this._initialized) { return; }
	
	var ic = appCtxt.getIdentityCollection();
	var identities = ic && ic.getIdentities();
	if (identities && identities.length) {
		for (var i = 0, len = identities.length; i < len; i++) {
			var sigTypes = ZmSignaturesPage.SIG_TYPES;
			for (var j = 0; j < sigTypes.length; j++) {
				var select = this._sigSelect[identities[i].id][sigTypes[j]];
				if (select) {
					if (action == ZmEvent.E_CREATE) {
						select.addOption(signature.name, false, signature.id);
					}
					else if (action == ZmEvent.E_DELETE) {
						select.removeOption(signature.id);
					}
					else if (action == ZmEvent.E_MODIFY) {
						select.rename(signature.id, signature.name);
					}
				}
			}
		}
	}
};

ZmSignaturesPage.prototype._identityChangeListener =
function(ev) {
	if (ev.event == ZmEvent.E_CREATE || ev.event == ZmEvent.E_DELETE ||
		(ev.event == ZmEvent.E_MODIFY && ev.getDetail("rename"))) {

		this._resetUsageSelects();
	}
};

	ZmSignaturesPage.prototype._resetSize =
function() {
	this._resetEditorSize();

	// Make sure they are on the the same level
	var sigSize = Dwt.getSize(this._sigEditor.getHtmlElement().parentNode);
	this._sigList.setSize(Dwt.CLEAR, sigSize.y);
};

ZmSignaturesPage.prototype._resetEditorSize =
function() {
	// Adjust Size of the HTML Editor
	var size = Dwt.getSize(this._sigEditor.getHtmlElement().parentNode);
	this._sigEditor.setSize(Dwt.CLEAR, size.y);
};

ZmSignaturesPage.prototype._setupCustom =
function(id, setup, value) {
	if (id == ZmSetting.SIGNATURES) {
		// create container control
		var container = new DwtComposite(this);
		this.setFormObject(id, container);

		// create radio group for defaults
		this._defaultRadioGroup = new DwtRadioButtonGroup();

		this._initialize(container);
		this._populateSignatures();

		return container;
	}

	return ZmPreferencesPage.prototype._setupCustom.apply(this, arguments);
};

ZmSignaturesPage.prototype._selectionListener =
function(ev) {
	if (this._selSignature) {
		this._updateSignature();
	}

	var signature = this._sigList.getSelection()[0];
	if (signature) {
		this._resetSignature(this._signatures[signature.id]);
	}
};

ZmSignaturesPage.prototype._updateSignature =
function(select) {
	var oldSignature = this._selSignature;
	if (!oldSignature) { return; }

	var newName = this._sigName.getValue();
	var isNameModified = newName != oldSignature.name;

	oldSignature.name = newName;

	var isText = this._sigFormat ? this._sigFormat.getValue() : true;
	oldSignature.setContentType(isText ? ZmMimeTable.TEXT_PLAIN : ZmMimeTable.TEXT_HTML);

	if (!isText) {
		this._restoreSignatureInlineImages();
	}
	oldSignature.value = this._sigEditor.getContent(false, true);

	if (isNameModified) {
		this._sigList.redrawItem(oldSignature);
	}

	this._signatures[oldSignature.id] = oldSignature;
};

ZmSignaturesPage.prototype._populateSignatures =
function(reset) {

	this._signatures = {};
	this._deletedSignatures = {};
	this._selSignature = null;
	this._sigList.removeAll(true);
	this._sigList._resetList();
	this._newUsage = [];

	var signatures = appCtxt.getSignatureCollection().getSignatures();
	signatures.sort(ZmSignatureCollection.BY_NAME);
	var lessThanEqual = signatures.length <= this._maxEntries;
	var count = lessThanEqual ? signatures.length : this._maxEntries;

	this._calcAutoSignatureNames(signatures);

	for (var i = 0; i < count; i++) {
		this._addSignature(signatures[i], true, reset);
	}
	for (var i = count; i < this._minEntries; i++) {
		this._addNewSignature(true);
	}

	var selectSig = this._sigList.getList().get(0);
	this._sigList.setSelection(selectSig);
};

ZmSignaturesPage.prototype._calcAutoSignatureNames =
function(signatures) {
	var autoNames = [];
	for (var i = 0; i < signatures.length; i++) {
		var match = ZmSignaturesPage.defaultNameRegex.exec(signatures[i].name);
		if (match && match.length>=2) {
			autoNames.push(match[1]);
		}
		ZmSignaturesPage.defaultNameRegex.lastIndex = 0;
	}
	autoNames.sort(function(a, b) { return a-b; });

	var newNames = [];
	for (var i = 1; i < 25; i++) { // Should be ideally appCtxt.get(ZmSetting.SIGNATURE_MAX_LENGTH).
		newNames.push(i);
	}

	if (autoNames.length > 0) {
		newNames = AjxUtil.arraySubstract(newNames, autoNames);
	}

	this._newNames = newNames;
};

ZmSignaturesPage.prototype._getNewSignatureName =
function() {
	return AjxMessageFormat.format(ZmMsg.signatureNewName, this._newNames.shift());
};

ZmSignaturesPage.prototype._getNewSignature =
function() {
	var signature = new ZmSignature(null);
	signature.id = Dwt.getNextId();
	signature.name = this._getNewSignatureName();
	signature._new = true;

	return signature;
};

ZmSignaturesPage.prototype._addNewSignature =
function(skipControls) {
	// add new signature
	var signature = this._getNewSignature();
	signature = this._addSignature(signature, skipControls);

	return signature;
};

ZmSignaturesPage.prototype._addSignature =
function(signature, skipControls, reset, index) {

	if (!signature._new) {
		if (reset) {
			this._restoreFromOrig(signature);
		} else if (!signature._orig) {
			this._setOrig(signature);
		}
	}

	this._signatures[signature.id] = signature;

	if (this._sigList.getItemIndex(signature) == null) {
		this._sigList.addItem(signature, index);
	}

	if (!skipControls) {
		this._resetSignature(signature); // initialize state
	}

	this._resetAddButton();

	return signature;
};

ZmSignaturesPage.prototype._fixSignatureInlineImages_onTimer =
function(msg) {
	// first time the editor is initialized, idoc.getElementsByTagName("img") is empty
	// Instead of waiting for 500ms, trying to add this callback. Risky but works.
	if (!this._firstTimeFixImages) {
		this._sigEditor.addOnContentIntializedListener(new AjxCallback(this, this._fixSignatureInlineImages));
	} else {
		this._fixSignatureInlineImages();
	}
};

ZmSignaturesPage.prototype._fixSignatureInlineImages =
function() {
	var idoc = this._sigEditor.getIframeDoc();
	if (idoc) {
		if (!this._firstTimeFixImages) {
			this._firstTimeFixImages = true;
			this._sigEditor.removeOnContentIntializedListener();
		}

		var images = idoc.getElementsByTagName("img");
		var path = appCtxt.get(ZmSetting.REST_URL) + ZmFolder.SEP;
		var img;
		for (var i = 0; i < images.length; i++) {
			img = images[i];
			var dfsrc = img.getAttribute("dfsrc");
			if (dfsrc && dfsrc.indexOf("doc:") == 0) {
				img.src = [path, dfsrc.substring(4)].join('');
			}
		}
	}
};

ZmSignaturesPage.prototype._restoreSignatureInlineImages =
function() {
	var idoc = this._sigEditor.getIframeDoc();
	if (idoc) {
		var images = idoc.getElementsByTagName("img");
		var img;
		for (var i = 0; i < images.length; i++) {
			img = images[i];
			var dfsrc = img.getAttribute("dfsrc");
			if (dfsrc && dfsrc.substring(0, 4) == "doc:") {
				img.removeAttribute("src");
			}
		}
	}
};

ZmSignaturesPage.prototype._resetSignature =
function(signature, clear) {
	this._selSignature = signature;
	this._sigList.setSelection(signature, true);
	this._sigName.setValue(signature.name);
	this._sigName._origName = signature.name;
	if (this._sigFormat) {
		this._sigFormat.setSelectedValue(signature.getContentType() == ZmMimeTable.TEXT_PLAIN);
	}
	var vcardName = "";
	if (signature.contactId) {
		var contactsApp = appCtxt.getApp(ZmApp.CONTACTS);
		var contact = contactsApp && contactsApp.getContactList().getById(signature.contactId)
		if (contact) {
			vcardName = contact.getFileAs();
		}
	}
	this._vcardField.value = vcardName;

	var editorMode = (appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED) && signature.getContentType() == ZmMimeTable.TEXT_HTML)
		? DwtHtmlEditor.HTML : DwtHtmlEditor.TEXT;
	var htmlModeInited = this._sigEditor.isHtmlModeInited();
	if (editorMode != this._sigEditor.getMode()) {
		this._sigEditor.setMode(editorMode);
		this._resetEditorSize();
	}
	this._sigEditor.setContent(signature.getValue(editorMode == DwtHtmlEditor.HTML ? ZmMimeTable.TEXT_HTML : ZmMimeTable.TEXT_PLAIN));
	if (editorMode == DwtHtmlEditor.HTML) {
		this._fixSignatureInlineImages_onTimer();
	}
	this._resetDeleteButtons();
};

ZmSignaturesPage.prototype._resetAddButton =
function() {
	if (this._sigAddBtn) {
		var more = this.getAllSignatures(true, true).length < this._maxEntries;
		this._sigAddBtn.setEnabled(more);
	}
};

ZmSignaturesPage.prototype._resetDeleteButtons =
function() {
	var allSignatures = this.getAllSignatures(true, true);
	this._deleteState = allSignatures.length > this._minEntries;
	this._deleteBtn.setText(this._deleteState ? ZmMsg.del : ZmMsg.clear);
};

// buttons
ZmSignaturesPage.prototype._handleFormatSelect =
function(ev) {
	var signature = this._selSignature;
	var isText = this._sigFormat ? this._sigFormat.getValue() : true;
	this._sigEditor.setMode( isText ? DwtHtmlEditor.TEXT : DwtHtmlEditor.HTML, true);

	signature.setContentType(isText ? ZmMimeTable.TEXT_HTML : ZmMimeTable.TEXT_PLAIN);

	this._resetSize();
};

ZmSignaturesPage.prototype._handleAddButton =
function(ev) {
	if (this._selSignature) {
		this._updateSignature();
	}

	var signature = this._addNewSignature();
	this._updateUsageSelects(signature, ZmEvent.E_CREATE);
};

ZmSignaturesPage.prototype._clearSignature =
function(signature, keepName, keepValue) {
	if (!keepName || !keepValue) {
		signature = signature || this._selSignature;
		if (!signature._orig) {
			this._setOrig(signature);
		}
		if (!keepName && !ZmSignaturesPage.isNameDefault(signature.name)) {
			signature.name = this._getNewSignatureName();
		}
		if (!keepValue) {
			signature.value = "";
		}
		this._resetSignature(signature);
	}
};

ZmSignaturesPage.prototype._deleteSignature =
function(signature) {
	signature = signature || this._selSignature;
	this._sigList.removeItem(signature);
	delete this._signatures[signature.id];
	if (!signature._new) {
		this._deletedSignatures[signature.id] = signature;
	}
};

ZmSignaturesPage.prototype._handleDeleteButton =
function(evt) {
	var signature = this._selSignature;

	// update controls
	if (this._deleteState) {
		this._deleteSignature();
		this._updateUsageSelects(this._selSignature, ZmEvent.E_DELETE);
		this._selSignature = null;

		var sel = this._sigList.getList().get(0);
		if (sel) {
			this._sigList.setSelection(sel);
		}
		this._resetAddButton();
	} else {
		this._clearSignature(signature);
	}
};

// saving

ZmSignaturesPage.prototype._handleDeleteResponse =
function(signature, resp) {
	delete this._deletedSignatures[signature.id];
	this._resetUsageSelects();
};

ZmSignaturesPage.prototype._handleModifyResponse =
function(signature, resp) {

	if (signature.name != signature._orig.name) {
		this._resetUsageSelects();
	}
	this._setOrig(signature);
};

ZmSignaturesPage.prototype._handleModifyError =
function(signature) {
	this._restoreFromOrig(signature);
	if (this._selSignature.id == signature.id) {
		this._resetSignature(signature);
	}
	return true;
};

ZmSignaturesPage.prototype._handleNewResponse =
function(signature, resp) {

	var id = signature.id;
	signature.id = signature._id;

	var index = this._sigList.getItemIndex(signature);
	this._deleteSignature(signature);

	signature.id = id;
	this._addSignature(signature, false, false, index);

	delete signature._new;

	this._setOrig(signature);
	this._resetUsageSelects();

	if (this._newUsage) {
		for (var i = 0; i < this._newUsage.length; i++) {
			var usage = this._newUsage[i];
			if (usage.value == signature._id) {
				usage.value = signature.id;
				usage.ready = true;
			}
		}
		this._controller.save(null, true);
		this._newUsage = [];
	}
};

ZmSignaturesPage.prototype._handleVcardBrowseButton =
function(ev) {

	var query;
	if (!this._vcardPicker) {
		AjxDispatcher.require(["ContactsCore", "Contacts"]);
		this._vcardPicker = new ZmVcardPicker({sigPage:this});
		var user = appCtxt.getUsername();
		query = user.substr(0, user.indexOf('@'));
	}
	this._vcardPicker.popup(query);
};

ZmSignaturesPage.prototype._handleVcardClearButton =
function(ev) {
	this._vcardField.value = "";
	this._selSignature.contactId = null;
};

// validation

ZmSignaturesPage.prototype._updateName =
function(value) {

	var signature = this._selSignature;
	if (!signature) { return; }

	if (signature.name != value) {
		signature.name = value;
		this._sigList.redrawItem(signature);
		this._sigList.setSelection(signature, true);
		this._updateUsageSelects(signature, ZmEvent.E_MODIFY);
	}
};

ZmSignaturesPage.prototype._validateName =
function(value) {
	if (value.replace(/\s*/g,"") == "") {
		throw ZmMsg.errorMissingRequired;
	}

	var signature = this._selSignature;
	if (!signature) { return; }

	signature.name = value;
	this._sigList.redrawItem(signature);

	return value;
};

ZmSignaturesPage.prototype._hasChanged =
function(signature) {

	var o = signature._orig;
	return (o.name != signature.name ||
			o.contactId != signature.contactId ||
			o.value != signature.getValue() ||
			o.contentType != signature.getContentType());
};

ZmSignaturesPage.prototype._setOrig =
function(signature) {

	signature._orig = {
		name:			signature.name,
		contactId:		signature.contactId,
		value:			signature.getValue(),
		contentType:	signature.getContentType()
	};
};

ZmSignaturesPage.prototype._restoreFromOrig =
function(signature) {

	var o = signature._orig;
	signature.name = o.name;
	signature.contactId = o.contactId;
	signature.value = o.value;
	signature.setContentType(o.contentType);
};

//
// Classes
//

//ZmSignatureListView:  Signatures List

ZmSignatureListView = function(parent) {
	if (arguments.length == 0) { return; }

	DwtListView.call(this, {parent:parent, className:"ZmSignatureListView"});
};

ZmSignatureListView.prototype = new DwtListView;
ZmSignatureListView.prototype.constructor = ZmSignatureListView;

ZmSignatureListView.prototype.toString =
function() {
	return "ZmSignatureListView";
};

ZmSignatureListView.prototype._getCellContents =
function(html, idx, signature, field, colIdx, params) {
	html[idx++] = AjxStringUtil.htmlEncode(signature.name, true);
	return idx;
};

ZmSignatureListView.prototype._getItemId =
function(signature) {
	return (signature && signature.id) ? signature.id : Dwt.getNextId();
};

ZmSignatureListView.prototype.setSignatures =
function(signatures) {
	this._resetList();
	this.addItems(signatures);
	var list = this.getList();
	if (list && list.size() > 0) {
		this.setSelection(list.get(0));
	}
};


// ZmSignatureEditor

ZmSignatureEditor = function(parent) {
	ZmHtmlEditor.call(this, parent);
};

ZmSignatureEditor.prototype = new ZmHtmlEditor;
ZmSignatureEditor.prototype.constructor = ZmSignatureEditor;

ZmSignatureEditor.prototype._createToolbars =
function() {
	if (!this._toolbar1) {
		ZmHtmlEditor.prototype._createToolbars.call(this, true);

		//TODO: Need to clean up the code to follow ZCS Toolbar/Opertation model
		var tb = this._toolbar1;
		this._createFontFamilyMenu(tb);
		this._createFontSizeMenu(tb);
		this._createStyleMenu(tb);
		this._createJustifyMenu(tb);
		new DwtControl({parent:tb, className:"vertSep"});
		this._createBUIButtons(tb);
		new DwtControl({parent:tb, className:"vertSep"});
		this._createFontColorButtons(tb);
		new DwtControl({parent:tb, className:"vertSep"});
		this._createHorizRuleButton(tb);
		this._createUrlButton(tb);
		this._createUrlImageButton(tb);

        if (appCtxt.get(ZmSetting.BRIEFCASE_ENABLED)) {
            this._createImageButton(tb);
        }

		this._resetFormatControls();
	}
};

ZmSignatureEditor.prototype._createImageButton =
function(tb) {
	var button = new DwtToolBarButton({parent:tb});
	button.setImage("InsertImage");
	button.setToolTipContent(ZmMsg.insertImage);
	button.addSelectionListener(new AjxListener(this, this._insertImagesListener));
};

ZmSignatureEditor.prototype._createUrlImageButton =
function(tb) {
	var button = new DwtToolBarButton({parent:tb});
	button.setImage("ImageDoc");
	button.setToolTipContent(ZmMsg.insertImageUrl);
	button.addSelectionListener(new AjxListener(this, this._insertUrlImagesListener));
};

ZmSignatureEditor.prototype._insertUrlImagesListener =
function(ev) {
	this._getImgSelDlg().popup();
};

ZmSignatureEditor.prototype._insertImagesListener =
function(ev) {
	AjxDispatcher.require("BriefcaseCore");    
	appCtxt.getApp(ZmApp.BRIEFCASE)._createDeferredFolders();

	var callback = new AjxCallback(this, this._imageUploaded);
	var cFolder = appCtxt.getById(ZmOrganizer.ID_BRIEFCASE);
	var dialog = appCtxt.getUploadDialog();
	dialog.popup(cFolder,callback, ZmMsg.uploadImage, null, true);
};

ZmSignatureEditor.prototype._imageUploaded =
function(folder, fileNames, files) {
	for (var i=0; i< files.length; i++) {
		var file = files[i];
		var path = appCtxt.get(ZmSetting.REST_URL) + ZmFolder.SEP;
		var docPath = folder.getRestUrl() + ZmFolder.SEP + file.name;
		docPath = ["doc:", docPath.substr(docPath.indexOf(path) + path.length)].join("");

		file.docpath = docPath;
		file.rest = folder.getRestUrl() + ZmFolder.SEP + AjxStringUtil.urlComponentEncode(file.name);

		this.insertImageDoc(file);
	}
};

ZmSignatureEditor.prototype.insertImageDoc =
function(file, width, height) {
	var src = file.rest;
	if (!src) { return; }

	var doc = this._getIframeDoc();
	var img = doc.createElement("img");
	img.src = src;
	if (file.docpath) {
		img.setAttribute("dfsrc", file.docpath);
	}
	if (width) {
		img.width = width;
	} else {
		img.removeAttribute('width');
	}
	if (height) {
		img.height = height;
	} else {
		img.removeAttribute('height');
	}

	var df = doc.createDocumentFragment();
	df.appendChild(img);
	this._insertNodeAtSelection(df);
};

ZmSignatureEditor.prototype._getImgSelDlg =
function() {
	if (this._imgSelDlg) {
		this._imgSelField.value = '';
		return this._imgSelDlg;
	}

	var dlg = this._imgSelDlg = new DwtDialog(appCtxt.getShell(), null, ZmMsg.addImg);
	dlg.getButton(DwtDialog.OK_BUTTON).setText(ZmMsg.add);

	var inputId = Dwt.getNextId();
	var html = [
			"<div style='padding:5px;' class='ImgSel'>",
				"<strong>Url:&nbsp;</strong>","<input size='50' id='",inputId,"' type='text' value=''>",
			"</div>"
	].join("");
	dlg.setContent(html);

	this._imgSelField = document.getElementById(inputId);
	delete inputId;

	dlg.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this,function() {
		var imgUrl = this._imgSelField.value;
		if(imgUrl != '')
			this.insertImage(imgUrl);
		dlg.popdown();
	}));

	return this._imgSelDlg;
};

ZmSignatureEditor.prototype.setContent =
function(content, callback) {
	this._setContentCallback = callback;
	ZmHtmlEditor.prototype.setContent.call(this, content);
};

ZmSignatureEditor.prototype._onContentInitialized =
function() {
	ZmHtmlEditor.prototype._onContentInitialized.call(this);
	if (this._setContentCallback) {
		this._setContentCallback.run();
	}
};

ZmSignatureEditor.prototype.insertLink =
function(params) {
	if (this.getContent() == "") {
		this.setContent("<br>");
	}
	ZmHtmlEditor.prototype.insertLink.call(this, params);
};

ZmSignatureEditor.prototype.getIframeDoc =
function() {
	if (!this._iframeDoc) {
		this._iframeDoc = this._getIframeDoc();
	}
	return this._iframeDoc;
};

// ZmVcardPicker

ZmVcardPicker = function(params) {

	params = params || {};
	params.parent = appCtxt.getShell();
	params.title = ZmMsg.selectContact;
	DwtDialog.call(this, params);

	this._sigPage = params.sigPage;
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okButtonListener));
};

ZmVcardPicker.prototype = new DwtDialog;
ZmVcardPicker.prototype.constructor = ZmVcardPicker;

ZmVcardPicker.prototype.popup =
function(query, account) {

	if (!this._initialized) {
		this._initialize();
	}
	this._contactSearch.reset(query, account);
	if (query) {
		this._contactSearch.search();
	}

	DwtDialog.prototype.popup.call(this);
};

ZmVcardPicker.prototype._initialize =
function(account) {

	var options = {preamble: ZmMsg.vcardContactSearch};
	this._contactSearch = new ZmContactSearch({options:options});
	this.setView(this._contactSearch);
	this._initialized = true;
};

ZmVcardPicker.prototype._okButtonListener =
function(ev) {

	var data = this._contactSearch.getContacts();
	var contact = data && data[0];
	if (contact) {
		this._sigPage.setContact(contact);
	}

	this.popdown();
};
