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

	this._minEntries = appCtxt.get(ZmSetting.SIGNATURES_MIN);	// added for Comcast
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

ZmSignaturesPage.prototype._rehashByName =
function() {
	this._byName = {};
	for (var id in this._signatures) {
		var signature = this._signatures[id];
		this._byName[signature.name] = signature;
	}
};

ZmSignaturesPage.prototype.getNewSignatures =
function(onlyValid) {
	var list = [];
	this._rehashByName();
	for (var id in this._signatures) {
		var signature = this._signatures[id];
		if (signature._new && !this._isAutoAddedAndBlank(signature) && !(onlyValid && this._isInvalidSig(signature, true))) {
			list.push(signature);
		}
	}
	return list;
};

ZmSignaturesPage.prototype.getDeletedSignatures =
function() {
	return AjxUtil.values(this._deletedSignatures);
};

ZmSignaturesPage.prototype.getModifiedSignatures =
function() {

	var array = [];
	for (var id in this._signatures) {
		var signature = this._signatures[id];
		if (signature._new) { continue; }

		if (this._hasChanged(signature)) {
			array.push(signature);
		}
	}
	return array;
};

ZmSignaturesPage.SIG_FIELDS = [ZmIdentity.SIGNATURE, ZmIdentity.REPLY_SIGNATURE];

// returns a hash representing the current usage, based on form selects
ZmSignaturesPage.prototype._getUsage =
function(newOnly) {

	var usage = {};
	var foundOne;
	for (var identityId in this._sigSelect) {
		usage[identityId] = {};
		for (var j = 0; j < ZmSignaturesPage.SIG_FIELDS.length; j++) {
			var field = ZmSignaturesPage.SIG_FIELDS[j];
			var select = this._sigSelect[identityId] && this._sigSelect[identityId][field];
			if (select) {
				var sigId = select.getValue();
				if (newOnly && this._newSigId[sigId]) {
					return true;
				}
				else {
					usage[identityId][field] = sigId;
				}
			}
		}
	}
	return newOnly ? false : usage;
};

// returns a hash representing the current usage, based on identity data
ZmSignaturesPage.prototype._getUsageFromIdentities =
function() {

	var usage = {};
	var collection = appCtxt.getIdentityCollection();
	var identities = collection && collection.getIdentities();
	for (var i = 0, len = identities.length; i < len; i++) {
		var identity = identities[i];
		usage[identity.id] = {};
		for (var j = 0; j < ZmSignaturesPage.SIG_FIELDS.length; j++) {
			var field = ZmSignaturesPage.SIG_FIELDS[j];
			usage[identity.id][field] = identity.getField(field) || "";
		}
	}
	return usage;
};

/**
 * Returns a list of usage changes. Each item in the list details the identity,
 * which type of signature, and the ID of the new signature.
 */
ZmSignaturesPage.prototype.getChangedUsage =
function() {

	var list = [];
	var usage = this._getUsage();
	for (var identityId in usage) {
		var u1 = this._origUsage[identityId];
		var u2 = usage[identityId];
		for (var j = 0; j < ZmSignaturesPage.SIG_FIELDS.length; j++) {
			var field = ZmSignaturesPage.SIG_FIELDS[j];
			var savedSigId = u1[field];
			var curSigId = this._newSigId[u2[field]] || u2[field];
			if (savedSigId != curSigId) {
				list.push({identity:identityId, sig:field, value:curSigId});
			}
		}
	}
	return list;
};

ZmSignaturesPage.prototype.reset =
function(useDefaults) {
	this._updateSignature();
	ZmPreferencesPage.prototype.reset.apply(this, arguments);
	this._populateSignatures(true);
};

ZmSignaturesPage.prototype.resetOnAccountChange =
function() {
	ZmPreferencesPage.prototype.resetOnAccountChange.apply(this, arguments);
	this._selSignature = null;
	this._firstTime = false;
};

ZmSignaturesPage.prototype.isDirty =
function() {

	this._updateSignature();

	var printSigs = function(sig) {
		if (AjxUtil.isArray(sig)) {
			return AjxUtil.map(sig, printSigs).join("\n");
		}
		return [sig.name, " (", ((sig._orig && sig._orig.value != sig.value) ? (sig._orig.value+" changed to ") : ""), sig.value, ")"].join("");
	}

	var printUsages = function(usage) {
		if (AjxUtil.isArray(usage)) {
			return AjxUtil.map(usage, printUsages).join("\n");
		}
		return ["identityId: ", usage.identity, ", type: ", usage.sig, ", signatureId: ", usage.value].join("");
	}

	if (this.getNewSignatures(false).length > 0) {
		AjxDebug.println(AjxDebug.PREFS, "Dirty preferences:\nNew signatures:\n" + printSigs(this.getNewSignatures(false)));
		return true;
	}
	if (this.getDeletedSignatures().length > 0) {
		AjxDebug.println(AjxDebug.PREFS, "Dirty preferences:\nDeleted signatures:\n" + printSigs(this.getDeletedSignatures()));
		return true;
	}
	if (this.getModifiedSignatures().length > 0) {
		AjxDebug.println(AjxDebug.PREFS, "Dirty preferences:\nModified signatures:\n" + printSigs(this.getModifiedSignatures()));
		return true;
	}
	if (this.getChangedUsage().length > 0) {
		AjxDebug.println(AjxDebug.PREFS, "Dirty preferences:\nSignature usage changed:\n" + printUsages(this.getChangedUsage()));
		return true;
	}
};

ZmSignaturesPage.prototype.validate =
function() {
	this._updateSignature();
	this._rehashByName();

	for (var id in this._signatures) {
		var error = this._isInvalidSig(this._signatures[id]);
		if (error) {
			this._errorMsg = error;
			return false;
		}
	}
	return true;
};

// The 'strict' parameter will make the function return true if a signature is not
// saveable, even if it can be safely ignored. Without it, the function returns an error
// only if there's bad user input.
ZmSignaturesPage.prototype._isInvalidSig =
function(signature, strict) {

	var hasName = AjxStringUtil._NON_WHITESPACE.test(signature.name);
	var hasContact = Boolean(signature.contactId);
	var hasValue = AjxStringUtil._NON_WHITESPACE.test(signature.getValue()) || hasContact;
	var isNameDefault = (this._newNamesHash[signature.name] != null);
	if (!hasName && !hasValue) {
		this._deleteSignature(signature);
		if (strict) {
			return true;
		}
	} else if (!hasName || (!hasValue && !isNameDefault)) {
		return !hasName ? ZmMsg.signatureNameMissingRequired : ZmMsg.signatureValueMissingRequired;
	} else if (strict && isNameDefault && !hasValue) {
		return true;
	}
	if (signature._new && hasName && this._byName[signature.name] != signature) {
		return AjxMessageFormat.format(ZmMsg.signatureNameDuplicate, signature.name);
	}
	var sigValue = signature.value;
	var maxLength = appCtxt.get(ZmSetting.SIGNATURE_MAX_LENGTH);
	if (sigValue.length > maxLength) {
		return AjxMessageFormat.format((signature.contentType == ZmMimeTable.TEXT_HTML)
			? ZmMsg.errorHtmlSignatureTooLong
			: ZmMsg.errorSignatureTooLong, maxLength);
	}

	return false;
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
	var newSigs = this.getNewSignatures(true);
	for (var i = 0; i < newSigs.length; i++) {
		var signature = newSigs[i];
		signature._id = signature.id; // Clearing existing dummy id
		signature.id = null;
		var callback = new AjxCallback(this, this._handleNewResponse, [signature]);
		signature.create(callback, null, batchCommand);
	}

	// signature usage
	var sigChanges = this.getChangedUsage();
	if (sigChanges.length) {
		var collection = appCtxt.getIdentityCollection();
		if (collection) {
			for (var i = 0; i < sigChanges.length; i++) {
				var usage = sigChanges[i];
				var identity = collection.getById(usage.identity);
				// don't save usage of new signature just yet
				if (identity && !this._isTempId[usage.value]) {
					identity.setField(usage.sig, usage.value);
					identity.save(null, null, batchCommand);
				}
			}
		}
	}
};

ZmSignaturesPage.prototype.getPostSaveCallback =
function() {
	return new AjxCallback(this, this._postSave);
};

// if a new sig has been assigned to an identity, we need to save again since
// we only now know the sig's ID
ZmSignaturesPage.prototype._postSave =
function() {

	var newUsage = this._getUsage(true);
	if (newUsage) {
		var respCallback = new AjxCallback(this, this._handleResponsePostSave);
		this._controller.save(respCallback, true);
	}
};

ZmSignaturesPage.prototype._handleResponsePostSave =
function() {

	this._newSigId = {};	// clear this to prevent request loop
	this._resetOperations();
	this._origUsage = this._getUsage();	// form selects and data in identities should be in sync now
};

ZmSignaturesPage.prototype.setContact =
function(contact) {
	if (this._selSignature) {
		this._selSignature.contactId = contact.id;
	}
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
    if( !appCtxt.isTinyMCEEnabled() ){
        var htmlEditor = new ZmSignatureEditor(this);
        this._replaceControlElement(valueEl, htmlEditor);
    }
	this._sigEditor = htmlEditor;

	// Signature use by identity
	var collection = appCtxt.getIdentityCollection();
	if (collection) {
		collection.addChangeListener(new AjxListener(this, this._identityChangeListener));
	}

	this._initialized = true;
};

// generate usage selects based on identity data
ZmSignaturesPage.prototype._resetUsageSelects =
function(addSigs) {

	this._clearUsageSelects();

	var table = document.getElementById(this._htmlElId + "_SIG_TABLE");
	this._sigSelect = {};
	var signatures;
	if (addSigs) {
		signatures = appCtxt.getSignatureCollection().getSignatures(true);
	}
	var ic = appCtxt.getIdentityCollection();
	var identities = ic && ic.getIdentities(true);
	if (identities && identities.length) {
		for (var i = 0, len = identities.length; i < len; i++) {
			this._addUsageSelects(identities[i], table, signatures);
		}
	}
};

ZmSignaturesPage.prototype._clearUsageSelects =
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
};

ZmSignaturesPage.prototype._addUsageSelects =
function(identity, table, signatures, index) {

	table = table || document.getElementById(this._htmlElId + "_SIG_TABLE");
	index = (index != null) ? index : -1;
	var row = table.insertRow(index);
	row.id = identity.id + "_row";
	var name = identity.getField(ZmIdentity.NAME);
	if (name == ZmMsg.defaultIdentityName) {
		name = ZmMsg.accountDefault;
	}
	var cell = row.insertCell(-1);
	cell.className = "ZOptionsLabel";
	var id = identity.id + "_name";
	cell.innerHTML = "<span id='" + id + "'>" + AjxStringUtil.htmlEncode(name) + ":</span>";

	this._sigSelect[identity.id] = {};
	for (var i = 0; i < ZmSignaturesPage.SIG_FIELDS.length; i++) {
		this._addUsageSelect(row, identity, signatures, ZmSignaturesPage.SIG_FIELDS[i]);
	}
};

ZmSignaturesPage.prototype._addUsageSelect =
function(row, identity, signatures, sigType) {

	var select = this._sigSelect[identity.id][sigType] = new DwtSelect(this);
	var curSigId = identity.getField(sigType);
	var noSigId = (sigType == ZmIdentity.REPLY_SIGNATURE) ? ZmIdentity.SIG_ID_NONE : "";
	this._addUsageSelectOption(select, {name:ZmMsg.noSignature, id:noSigId}, sigType, identity);
	if (signatures) {
		for (var i = 0, len = signatures.length; i < len; i++) {
			this._addUsageSelectOption(select, signatures[i], sigType, identity);
		}
	}
	var cell = row.insertCell(-1);
	select.reparentHtmlElement(cell);
};

// if we're adding to a reply select and the identity has no value for reply sig,
// default it to the regular sig
ZmSignaturesPage.prototype._addUsageSelectOption =
function(select, signature, sigType, identity) {

	var curSigId = identity.getField(sigType);
	if (!curSigId && sigType == ZmIdentity.REPLY_SIGNATURE) {
		curSigId = identity.getField(ZmIdentity.SIGNATURE) || ZmIdentity.SIG_ID_NONE;
	}
	DBG.println(AjxDebug.DBG3, "Adding " + sigType + " option for " + identity.name + ": " + signature.name + " / " + signature.id + " (" + (curSigId == signature.id) + ")");
	select.addOption(signature.name, (curSigId == signature.id), signature.id);
};

// handles addition, removal, or rename of a signature within the form
ZmSignaturesPage.prototype._updateUsageSelects =
function(signature, action) {

	if (!this._initialized) { return; }

	for (var id in this._sigSelect) {
		for (var sigType in this._sigSelect[id]) {
			var select = this._sigSelect[id][sigType];
			if (select) {
				var hasOption = Boolean(select.getOptionWithValue(signature.id));
				var collection = appCtxt.getIdentityCollection();
				var identity = collection && collection.getById(id);
				if (action == ZmEvent.E_CREATE && !hasOption && identity) {
					this._addUsageSelectOption(select, signature, sigType, identity);
				}
				else if (action == ZmEvent.E_DELETE && hasOption && identity) {
					select.removeOptionWithValue(signature.id);
					var curSigId = identity.getField(sigType);
					if (curSigId == signature.id) {
						var noSigId = (sigType == ZmIdentity.REPLY_SIGNATURE) ? ZmIdentity.SIG_ID_NONE : "";
						select.setSelectedValue(noSigId);
					}
				}
				else if (action == ZmEvent.E_MODIFY && hasOption) {
					select.rename(signature.id, signature.name);
				}
			}
		}
	}
};

ZmSignaturesPage.prototype._identityChangeListener =
function(ev) {

	var identity = ev.getDetail("item");
	if (!identity) { return; }
	
	var collection = appCtxt.getIdentityCollection();
	var id = identity.id;
	var signatures = appCtxt.getSignatureCollection().getSignatures(true);
	var table = document.getElementById(this._htmlElId + "_SIG_TABLE");
	if (ev.event == ZmEvent.E_CREATE) {
		var index = collection.getSortIndex(identity);
		this._addUsageSelects(identity, table, signatures, index);
		for (var i = 0; i < ZmSignaturesPage.SIG_FIELDS.length; i++) {
			var field = ZmSignaturesPage.SIG_FIELDS[i];
			var select = this._sigSelect[id] && this._sigSelect[id][field];
			if (select) {
				this._origUsage[id] = this._origUsage[id] || {};
				this._origUsage[id][field] = select.getValue();
			}
		}
	}
	else if (ev.event == ZmEvent.E_DELETE) {
		var row = document.getElementById(id + "_row");
		if (row) {
			table.deleteRow(row.rowIndex);
		}
		delete this._origUsage[id];
	}
	else if (ev.event == ZmEvent.E_MODIFY) {
		var row = document.getElementById(id + "_row");
		if (row) {
			var index = collection.getSortIndex(identity);
			if (index == row.rowIndex - 1) {	// header row doesn't count
				var span = document.getElementById(id + "_name");
				if (span) {
					span.innerHTML = identity.name + ":";
				}
			}
			else {
				table.deleteRow(row.rowIndex);
				this._addUsageSelects(identity, table, signatures, index);
			}
		}
	}
};

ZmSignaturesPage.prototype._resetSize =
function() {
	this._resetEditorSize();

	// Make sure they are on the the same level
	var sigSize = Dwt.getSize(this._sigEditor.getHtmlElement().parentNode);
	if (sigSize && sigSize.y)
		this._sigList.setSize(Dwt.CLEAR, sigSize.y);
};

ZmSignaturesPage.prototype._resetEditorSize =
function() {
	// Adjust Size of the HTML Editor
	var size = Dwt.getSize(this._sigEditor.getHtmlElement().parentNode);
	if (size && size.y)
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
        if( !appCtxt.isTinyMCEEnabled() ){
            this._populateSignatures();
        }

		return container;
	}

	return ZmPreferencesPage.prototype._setupCustom.apply(this, arguments);
};

ZmSignaturesPage.prototype._selectionListener =
function(ev) {

	this._updateSignature();

	var signature = this._sigList.getSelection()[0];
	if (signature) {
		this._resetSignature(this._signatures[signature.id]);
	}
	this._resetOperations();
};

// Updates name and format of selected sig based on form fields
ZmSignaturesPage.prototype._updateSignature =
function(select) {

	if (!this._selSignature) { return; }

	var sig = this._selSignature;
	var newName = AjxStringUtil.trim(this._sigName.getValue());
	var isNameModified = (newName != sig.name);

	sig.name = newName;

	var isText = this._sigFormat ? this._sigFormat.getValue() : true;
	sig.setContentType(isText ? ZmMimeTable.TEXT_PLAIN : ZmMimeTable.TEXT_HTML);

	if (!isText) {
		this._restoreSignatureInlineImages();
	}
	sig.value = this._sigEditor.getContent(false, true);

	if (isNameModified) {
		this._sigList.redrawItem(sig);
		this._updateUsageSelects(sig, ZmEvent.E_MODIFY);
	}
};

ZmSignaturesPage.prototype._populateSignatures =
function(reset) {

	this._signatures = {};
	this._deletedSignatures = {};
	this._origUsage = {};
	this._isTempId = {};
	this._newSigId = {};
	this._byName = {};

	this._selSignature = null;
	this._sigList.removeAll(true);
	this._sigList._resetList();
	this._resetUsageSelects();	// signature options will be added via _addSignature

	var signatures = appCtxt.getSignatureCollection().getSignatures(true);
	var count = Math.min(signatures.length, this._maxEntries);
	for (var i = 0; i < count; i++) {
		var signature = signatures[i];
		this._addSignature(signature, true, reset);
	}
	this._calcAutoSignatureNames(signatures);
	for (var i = count; i < this._minEntries; i++) {
        this._autoAddedSig = true;
		this._addNewSignature(true);
	}

	var selectSig = this._sigList.getList().get(0);
	this._sigList.setSelection(selectSig);

	this._origUsage = this._getUsageFromIdentities();
};

ZmSignaturesPage.prototype._calcAutoSignatureNames =
function(signatures) {
	this._newNames = [];
	this._newNamesHash = {};
	for (var i = 1; i <= this._maxEntries; i++) {
		var sigName = AjxMessageFormat.format(ZmMsg.signatureNewName, i);
		this._newNames.push(sigName);
		this._newNamesHash[sigName] = true;
	}
};

ZmSignaturesPage.prototype._getNewSignatureName =
function() {
	var used = {};
	for (var id in this._signatures) {
		used[this._signatures[id].name] = true;
	}

	for (var i = 0; i < this._newNames.length; i++) {
		var name = this._newNames[i];
		if (!used[name]) {
			return name;
		}
	}
	return "";
};

ZmSignaturesPage.prototype._getNewSignature =
function() {
	var signature = new ZmSignature(null);
	signature.id = Dwt.getNextId();
	signature.name = this._getNewSignatureName();
	signature._new = true;
	this._isTempId[signature.id] = true;
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
function(signature, skipControls, reset, index, skipNotify) {
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
		if (!skipNotify) {
			this._updateUsageSelects(signature, ZmEvent.E_CREATE);
		}
	}

	if (!skipControls) {
		this._resetSignature(signature); // initialize state
	}

	this._resetOperations();
	this._byName[signature.name] = signature;

	return signature;
};

ZmSignaturesPage.prototype._fixSignatureInlineImages_onTimer =
function(msg) {
	// first time the editor is initialized, idoc.getElementsByTagName("img") is empty
	// Instead of waiting for 500ms, trying to add this callback. Risky but works.
	if (!this._firstTimeFixImages) {
		this._sigEditor.addOnContentInitializedListener(new AjxCallback(this, this._fixSignatureInlineImages));
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
			this._sigEditor.removeOnContentInitializedListener();
		}

		var images = idoc.getElementsByTagName("img");
		var path = appCtxt.get(ZmSetting.REST_URL) + ZmFolder.SEP;
		var img;
		for (var i = 0; i < images.length; i++) {
			img = images[i];
			var dfsrc = img.getAttribute("dfsrc");
			if (dfsrc && dfsrc.indexOf("doc:") == 0) {
				var url = [path, dfsrc.substring(4)].join('');
				img.src = AjxStringUtil.fixCrossDomainReference(url);
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
	if (!signature) { return; }

	this._sigList.setSelection(signature, true);
	this._sigName.setValue(signature.name);
	if (this._sigFormat) {
		this._sigFormat.setSelectedValue(signature.getContentType() == ZmMimeTable.TEXT_PLAIN);
	}
	var vcardName = "";
	if (signature.contactId) {
		var contactsApp = appCtxt.getApp(ZmApp.CONTACTS);
		var contact = contactsApp && contactsApp.getContactList().getById(signature.contactId);
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
};

ZmSignaturesPage.prototype._resetOperations =
function() {
	if (this._sigAddBtn) {
		this._sigAddBtn.setEnabled(this._sigList.size() < this._maxEntries);
	}
};

ZmSignaturesPage.prototype._setFormat =
function(isText) {
	this._sigEditor.setMode(isText ? DwtHtmlEditor.TEXT : DwtHtmlEditor.HTML, true);
	this._selSignature.setContentType(isText ? ZmMimeTable.TEXT_PLAIN : ZmMimeTable.TEXT_HTML);
	this._resetSize();
};

ZmSignaturesPage.prototype._formatOkCallback =
function(isText) {
	this._formatWarningDialog.popdown();
	this._setFormat(isText);
};

ZmSignaturesPage.prototype._formatCancelCallback =
function(isText) {
	this._formatWarningDialog.popdown();
	// reset the option
	this._sigFormat.setSelectedValue(!isText);
};


// buttons
ZmSignaturesPage.prototype._handleFormatSelect =
function(ev) {
	var isText = this._sigFormat ? this._sigFormat.getValue() : true;
	var currentIsText = this._sigEditor.getMode() === DwtHtmlEditor.TEXT;
	if (isText == currentIsText) {
		return;
	}

	var content = this._sigEditor.getContent();
	var contentIsEmpty = content == "<html><body><br></body></html>" || content == "";

	if (!contentIsEmpty) {
		if (!this._formatWarningDialog) {
			this._formatWarningDialog = new DwtMessageDialog({parent : appCtxt.getShell(), buttons : [DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON]});
		}
		var dialog = this._formatWarningDialog;
		dialog.registerCallback(DwtDialog.OK_BUTTON, this._formatOkCallback, this, [isText]);
		dialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._formatCancelCallback, this, [isText]);
		var msg  = isText ? ZmMsg.switchToText : ZmMsg.switchToHtml;
		dialog.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
		dialog.popup();
		return;
	}
	this._setFormat(isText);

};

ZmSignaturesPage.prototype._handleAddButton =
function(ev) {
	this._updateSignature();
	this._addNewSignature();
};

ZmSignaturesPage.prototype._deleteSignature =
function(signature, skipNotify) {
	signature = signature || this._selSignature;
	if (this._selSignature && !skipNotify) {
		this._sigName.clear();
	}
	this._sigList.removeItem(signature);
	if (!skipNotify) {
		this._updateUsageSelects(signature, ZmEvent.E_DELETE);
	}
	delete this._signatures[signature.id];
	if (!signature._new) {
		this._deletedSignatures[signature.id] = signature;
	}
	delete this._byName[signature.name];
};

ZmSignaturesPage.prototype._handleDeleteButton =
function(evt) {
	this._deleteSignature();
	this._selSignature = null;

	if (this._sigList.size() > 0) {
		var sel = this._sigList.getList().get(0);
		if (sel) {
			this._sigList.setSelection(sel);
		}
	}
	else {
		for (var i = 0; i < this._minEntries; i++) {
			this._addNewSignature();
		}
	}
	this._resetOperations();
};

// saving

ZmSignaturesPage.prototype._handleDeleteResponse =
function(signature, resp) {
	delete this._deletedSignatures[signature.id];
};

ZmSignaturesPage.prototype._handleModifyResponse =
function(signature, resp) {
	delete this._byName[signature._orig.name];
	this._byName[signature.name] = signature;
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

	// delete and add so that ID of row in list view is updated
	var index = this._sigList.getItemIndex(signature);
	this._deleteSignature(signature, true);
	signature.id = id;
	this._addSignature(signature, false, false, index, true);

	this._newSigId[signature._id] = signature.id;
	delete signature._new;

	this._setOrig(signature);
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
	if (this._selSignature) {
		this._selSignature.contactId = null;
	}
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
	this._updateUsageSelects(signature, ZmEvent.E_MODIFY);

	return value;
};

ZmSignaturesPage.prototype._hasChanged =
function(signature) {

	var o = signature._orig;
	return (o.name != signature.name ||
			o.contactId != signature.contactId ||
			o.contentType != signature.getContentType() ||
			!AjxStringUtil.equalsHtmlPlatformIndependent(o.value, signature.getValue()));
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
    this.setTextAreaId("TEXTAREA_SIGNATURE");
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
	img.style.border = "0"; // set border explicitly to 0, since otherwise a border is added implicitly in case it's wrapped with a link 

	var df = doc.createDocumentFragment();
	df.appendChild(img);
	this._insertNodeAtSelection(df);
	this.parent._fixSignatureInlineImages();
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
		if (imgUrl != '') {
			this.insertImage(imgUrl, true); //do not use execcommand - since it has no way of adding 0 border, which is necessary if image is wrapped in a link
		}
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

/*
 * determines if signature was auto-added (e.g. user had no signatures) and is blank.
 * returns true if both auto added and blank, else false
 *
 */
ZmSignaturesPage.prototype._isAutoAddedAndBlank =
function(signature) {
  if (this._autoAddedSig) {
    var hasValue = AjxStringUtil._NON_WHITESPACE.test(signature.getValue());
    return !hasValue;
  }
  return false;
};
