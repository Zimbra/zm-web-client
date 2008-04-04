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

ZmSignaturesPage.SIGNATURE_TEMPLATE = "prefs.Pages#Signature";

//
// Public methods
//

ZmSignaturesPage.prototype.getAllSignatures = function(includeEmpty, includeNonModified) {
	return [].concat(
		this.getNewSignatures(includeEmpty),
		this.getModifiedSignatures(includeNonModified)
	);
};

ZmSignaturesPage.prototype.getNewSignatures = function(includeEmpty) {
	var array = [];
	for (var id in this._signatureComps) {
		var comps = this._signatureComps[id];
		var signature = comps.signature;
		if (!signature._new) continue;

		var hasName = signature.name.replace(/\s*/g,"") != "";
		var hasValue = signature.getValue().replace(/\s*/g,"") != "";
		if (includeEmpty || hasName || hasValue) {
			array.push(signature);
		}
	}
	return array;
};

ZmSignaturesPage.prototype.getDeletedSignatures = function() {
	var array = [];
	for (var id in this._deletedSignatures) {
		var signature = this._deletedSignatures[id];
		array.push(signature);
	}
	return array;
};

ZmSignaturesPage.prototype.getModifiedSignatures = function(includeNonModified) {
	var array = [];
	for (var id in this._signatureComps) {
		var comps = this._signatureComps[id];
		var signature = comps.signature;
		if (signature._new) continue;

		var name = signature._orig.name;
		var value = signature._orig.value;
        var contentType = signature._orig.contentType;
        var modified = includeNonModified ||
					   (name != null && name != signature.name) ||
					   (value != null && value != signature.getValue()) ||
                       (contentType != signature.getContentType());
		if (modified) {
			array.push(signature);
		}
	}
	return array;
};

ZmSignaturesPage.prototype.reset = function(useDefaults) {
	ZmPreferencesPage.prototype.reset.apply(this, arguments);
	for (var elemId in this._signatureComps) {
		var compEl = document.getElementById(elemId);
		compEl.parentNode.removeChild(compEl);
	}
	this._populateSignatures();
};

// saving

ZmSignaturesPage.prototype.isDirty = function() {

    if(this._editState){
        var sign = this._editState;
        this._handleDoneButton(sign._htmlElId, null);
    }

    return	this.getNewSignatures().length > 0 ||
			this.getDeletedSignatures().length > 0 ||
			this.getModifiedSignatures().length > 0;
};

ZmSignaturesPage.prototype.validate = function() {

    if(this._editState){
        var sign = this._editState;
        this._handleDoneButton(sign._htmlElId, null);
    }

    var signatures = this.getAllSignatures();
	var maxLength = appCtxt.get(ZmSetting.SIGNATURE_MAX_LENGTH);
	for (var i = 0; i < signatures.length; i++) {
        var signature = signatures[i];
		if (signature.name.replace(/\s*/g,"") == "") {
			if (signature.value.replace(/\s*/g,"") == "") {
				this._handleDeleteButton(signature._htmlElId);
			} else {
				this._errorMsg = ZmMsg.errorMissingRequired;
				return false;
			}
		}
		if (signature.value.length > maxLength) {
			this._errorMsg = AjxMessageFormat.format(ZmMsg.errorSignatureTooLong, maxLength);
			return false;
		}
	}
	return true;
};

ZmSignaturesPage.prototype.getErrorMessage = function() {
	return this._errorMsg;
};

ZmSignaturesPage.prototype.addCommand = function(batchCommand) {
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
		var comps = this._signatureComps[signature._htmlElId];
		var callback = new AjxCallback(this, this._handleModifyResponse, [signature]);
		var errorCallback = new AjxCallback(this, this._handleModifyError, [signature]);
		signature.save(callback, errorCallback, batchCommand);
	}

	// add signatures
	var newSigs = this.getNewSignatures();
	for (var i = 0; i < newSigs.length; i++) {
		var signature = newSigs[i];
		var callback = new AjxCallback(this, this._handleNewResponse, [signature]);
		signature.create(callback, null, batchCommand);
	}

};

//
// Protected methods
//

ZmSignaturesPage.prototype._setupCustom = function(id, setup, value) {
	if (id == ZmSetting.SIGNATURES) {
		// create container control
		var container = new ZmSignatureList(this);
		this.setFormObject(id, container);

		// create radio group for defaults
		this._defaultRadioGroup = new DwtRadioButtonGroup();

		// populate signatures
		this._populateSignatures();

		// add button
		var sigCount = appCtxt.getSignatureCollection().getSize();
		var lessThanEqual = sigCount <= this._maxEntries;
		var buttonEl = document.getElementById(this._htmlElId+"_ADD_SIGNATURE");
		if (buttonEl) {
			var button = new DwtButton({parent:this});
			button.setText(ZmMsg.addSignature);
			button.setEnabled(lessThanEqual);
			button.addSelectionListener(new AjxListener(this, this._handleAddButton));
			this._replaceControlElement(buttonEl, button);

			this._addSignatureButton = button;
		}

		return container;
	}

	return ZmPreferencesPage.prototype._setupCustom.apply(this, arguments);
};

ZmSignaturesPage.prototype._populateSignatures = function() {
	this._signatureComps = {};
	this._deletedSignatures = {};

	var signatures = appCtxt.getSignatureCollection().getSignatures();
	var sigNames = AjxUtil.keys(signatures).sort();
	var lessThanEqual = sigNames.length <= this._maxEntries;
	var count = lessThanEqual ? sigNames.length : this._maxEntries;
	for (var i = 0; i < count; i++) {
		this._addSignature(signatures[sigNames[i]]);
	}
	for (var i = count; i < this._minEntries; i++) {
        this._addNewSignature();
	}

	this._resetDeleteButtons();
};

ZmSignaturesPage.prototype._addNewSignature = function(skipControls) {
	// add new signature
	var signature = new ZmSignature(null);
	signature._new = true;
	if (!skipControls) {
		this._addSignature(signature);
	}

	return signature;
};

ZmSignaturesPage.prototype._addSignature = function(signature) {

    signature._htmlElId = [this._htmlElId, Dwt.getNextId()].join("_");

    if(!signature._new){
        signature._orig = {
            name:  signature.name,
            value: signature.getValue(),
            contentType:  signature.getContentType()
        }
    }
    
    // create html
	var data = { id: signature._htmlElId };
	var html = AjxTemplate.expand(ZmSignaturesPage.SIGNATURE_TEMPLATE, data);
	var el = Dwt.parseHtmlFragment(html);

	var listComp = this.getFormObject(ZmSetting.SIGNATURES); 
	var listEl = listComp.getHtmlElement();
	listEl.appendChild(el);

	// instantiate controls
	var comps = this._signatureComps[signature._htmlElId] = {
		signature: signature,
		tabGroup: new DwtTabGroup(signature.id)
	};

	this._enterTabScope();
	try {
        //Signature NAME
        var nameEl = document.getElementById(signature._htmlElId+"_SIGNATURE_NAME");
		if (nameEl) {
			var params = {
				parent: listComp,
                validationStyle: DwtInputField.CONTINUAL_VALIDATION,
				validator: AjxCallback.simpleClosure(this._validateName, this, signature._htmlElId)
			};
			var input = new DwtInputField(params);
            input.setEnabled(false);
            
            this._replaceControlElement(nameEl, input);

            comps.name = input;
		}

        //Singature DEFAULT
        var defaultEl = document.getElementById(signature._htmlElId+"_SIGNATURE_DEFAULT");
		if (defaultEl) {
			var name = this._htmlElId;
			var isDefault = false; // TODO
			var radio = new DwtRadioButton({parent:listComp, name:name, checked:isDefault});
			radio.setText(ZmMsg.def);
			this._replaceControlElement(defaultEl, radio);

			var id = radio._htmlElId;
			var value = signature._htmlElId;
			this._defaultRadioGroup.addRadio(id, value, isDefault);

			comps.isDefault = radio;
		}

        //Signature FORMAT 
        var formatEl = document.getElementById(signature._htmlElId+"_SIGNATURE_FORMAT");
        if(formatEl) {
            var select = new DwtSelect(listComp);
            select.setToolTipContent(ZmMsg.formatTooltip);
            select.addOption(ZmMsg.formatAsText, 1 , true);
            select.addOption(ZmMsg.formatAsHtml, 0, false);
            select.addChangeListener(new AjxListener(this,this._handleFormatSelect,[signature._htmlElId]));
            select.setEnabled(false);

            this._replaceControlElement(formatEl, select);
            comps.format = select;
        }

        //Signature EDIT/DONE 
        var actionEl = document.getElementById(signature._htmlElId+"_SIGNATURE_BUTTON");
		if (actionEl) {
			var button = new DwtButton({parent:listComp});
            this._replaceControlElement(actionEl, button);
			comps.actionButton = button;
        }

        //Signature CLEAR/DELETE
        var deleteEl = document.getElementById(signature._htmlElId+"_SIGNATURE_DELETE_BUTTON");
        if(deleteEl){
            var button = new DwtButton(listComp);
            button.addSelectionListener(new AjxListener(this, this._handleDeleteButton, [signature._htmlElId]));
            this._replaceControlElement(deleteEl, button);
            comps.doDelete = button;
        }

        //Signature SIGNATURE
        var valueEl = document.getElementById(signature._htmlElId+"_SIGNATURE");
		if (valueEl) {
            var displaySignature = new DwtComposite(listComp, "DwtComposite ZmSignature-disabled");
            displaySignature.setEnabled(false);
            this._replaceControlElement(valueEl, displaySignature);
			comps.value = displaySignature;
		}

		this._addControlsToTabGroup(comps.tabGroup);

		listComp.getTabGroup().addMember(comps.tabGroup);
	}
	finally {
		this._exitTabScope();
	}

	// initialize state
	this._resetSignature(signature);

	// can we add any more?
	this._resetAddButton();

	return comps;
};

ZmSignaturesPage.prototype._resetSignature = function(signature, clear ) {
	// remove recently added signature
	if (clear && signature._new) {
		var sigEl = document.getElementById(signature._htmlElId);
		sigEl.parentNode.removeChild(sigEl);
		delete this._signatureComps[signature._htmlElId];
		return;
	}

	// reset signature values back to original values
	var comps = this._signatureComps[signature._htmlElId] || {};
	if (comps.name) {
		comps.name.setValue(signature.name);
		comps.name.setEnabled(false);
	}

    if(comps.format){
        comps.format.setSelectedValue(signature.getContentType() == ZmMimeTable.TEXT_PLAIN);
        comps.format.setEnabled(false);
    }

    if(comps.actionButton){
        comps.actionButton.setText(ZmMsg.edit);
        comps.actionButton.removeSelectionListeners();
        comps.actionButton.addSelectionListener(new AjxListener(this, this._handleEditButton, [signature._htmlElId]));
        comps.actionButton.setEnabled(true);
    }
    
    if (comps.isDefault) {
		for (var id in this._signatureComps) {
			var sigComps = this._signatureComps[id];
			if (sigComps.isDefault) {
				sigComps.isDefault.setEnabled(false);
			}
		}
		// TODO: Select this one if it's the default; and remember it
	}
    
    if (comps.value) {
        var signContent = signature.value;
        if(signature.getContentType() == ZmMimeTable.TEXT_PLAIN){
           signContent = AjxStringUtil.convertToHtml(signContent); 
        }
        comps.value.setContent((signContent || "&nbsp;"));
        comps.value.setEnabled(false);

        comps.value.setDisplay(Dwt.DISPLAY_BLOCK);
    }
};

ZmSignaturesPage.prototype._resetAddButton = function() {
	if (this._addSignatureButton) {
		var more = this.getAllSignatures(true, true).length < this._maxEntries;
		this._addSignatureButton.setEnabled(more);
	}
};

ZmSignaturesPage.prototype._resetDeleteButtons = function() {
	this._deleteState = this.getAllSignatures(true, true).length > this._minEntries; 
	var text = this._deleteState ? ZmMsg.del : ZmMsg.clear;
	for (var id in this._signatureComps) {
		var comps = this._signatureComps[id];
        var signature = comps.signature;
        if (comps.doDelete) {
			comps.doDelete.setText(text);
            if( !this._deleteState && (signature.name == "" || signature.value == "") ){
                comps.doDelete.setEnabled(false);
            }else{
                comps.doDelete.setEnabled(true);
            }
        }
    }
};

// buttons
ZmSignaturesPage.prototype._handleFormatSelect = function(id, ev){
    var comps = this._signatureComps[id];
    var isText = comps.format.getValue();
    var htmlEditor = this._getSignatureEditor();
    htmlEditor.setMode( isText ? DwtHtmlEditor.TEXT : DwtHtmlEditor.HTML, true);
    comps.signature.setContentType( isText ? ZmMimeTable.TEXT_HTML : ZmMimeTable.TEXT_PLAIN);
    //Set Size
    var size = Dwt.getSize(comps.value.getHtmlElement().parentNode);
    htmlEditor.setSize(size.x, size.y);

};

ZmSignaturesPage.prototype._handleAddButton = function(evt) {
	var signature = this._addNewSignature();

    if(this._editState){
        var sign = this._editState;
        this._handleDoneButton(sign._htmlElId, null);
    }

    // focus input
	var comps = this._signatureComps[signature._htmlElId];
	if (comps.name) {
		comps.name.focus();
	}
	else if (comps.value) {
		comps.value.focus();
	}

	this._resetDeleteButtons();
};

ZmSignaturesPage.prototype._handleEditButton = function(id, evt){

    var sigList = this.getFormObject(ZmSetting.SIGNATURES);
    var comps = this._signatureComps[id];
    var signature = comps.signature;

    if(this._editState){
        var sign = this._editState;
        this._handleDoneButton(sign._htmlElId, null);
    }

    this._editState = signature;
    
    //Make Edit button into Delete button
    comps.actionButton.setText(ZmMsg.done);
    comps.actionButton.removeSelectionListeners();
    comps.actionButton.addSelectionListener(new AjxListener(this, this._handleDoneButton, [signature._htmlElId]));

    //Enable Format Selection
    comps.format.setEnabled(true);

    //Enable Name Field
    comps.name.setEnabled(true);

    //Hide Signature display div
    comps.value.setDisplay(Dwt.DISPLAY_NONE);
    var htmlEditor = this._getSignatureEditor();
    htmlEditor.setMode((signature.getContentType() == ZmMimeTable.TEXT_PLAIN) ? DwtHtmlEditor.TEXT : DwtHtmlEditor.HTML);
    var size = Dwt.getSize(comps.value.getHtmlElement().parentNode);
    htmlEditor.setSize(size.x, size.y);
    htmlEditor.setVisibility(true);
    htmlEditor.reparentHtmlElement(comps.value.getHtmlElement().parentNode);
    AjxTimedAction.scheduleAction(new AjxTimedAction(this, this._setSignatureContent, [htmlEditor, signature]), 10);
};

ZmSignaturesPage.prototype._setSignatureContent = function(editor, signature){
    editor.setContent(signature.value || "");
};

ZmSignaturesPage.prototype._handleDoneButton = function(id, evt){
    
    var sigList = this.getFormObject(ZmSetting.SIGNATURES);
    var comps = this._signatureComps[id];
    if (comps) {
	    var signature = comps.signature;
	
	    signature.name = comps.name.getValue();
	
	    var htmlEditor = this._getSignatureEditor();
	    signature.value = htmlEditor.getContent(false, true);
	    signature.setContentType((htmlEditor.getMode() == DwtHtmlEditor.HTML) ? ZmMimeTable.TEXT_HTML : ZmMimeTable.TEXT_PLAIN);
	
	    htmlEditor.reparentHtmlElement(this.getHtmlElement());
	    htmlEditor.setVisibility(false);
	    
	    this._resetSignature(signature);
    }

    this._editState = null;

    this._resetDeleteButtons();

};

ZmSignaturesPage.prototype._getSignatureEditor = function(){
    if(!this._signatureEditor){
        this._signatureEditor = new ZmHtmlEditor(this);
    }
    return this._signatureEditor;
};

ZmSignaturesPage.prototype._handleDeleteButton = function(id, evt) {
	var sigList = this.getFormObject(ZmSetting.SIGNATURES);
	var comps = this._signatureComps[id];
	var signature = comps.signature;

	// update controls
	if (this._deleteState) {
		var el = document.getElementById(id);
		el.parentNode.removeChild(el);
		sigList.getTabGroup().removeMember(comps.tabGroup);

		delete this._signatureComps[id];
	}
	else {
		var newSignature = this._addNewSignature(true);
		newSignature._htmlElId = id;
		comps.signature = newSignature;
		if (comps.name) comps.name.setValue("");
		if (comps.isDefault) comps.isDefault.setSelected(false);
		if (comps.value) comps.value.setContent("&nbsp;");
        if (comps.format) comps.format.setSelectedValue(signature.getContentType() == ZmMimeTable.TEXT_PLAIN);
    }

	// clean-up state
	if (!signature._new) {
		this._deletedSignatures[id] = signature;
	}

	// reset buttons
	this._resetDeleteButtons();
	this._resetAddButton();
};

// saving

ZmSignaturesPage.prototype._handleDeleteResponse = function(signature, resp) {
	var id = signature._htmlElId;
	delete this._deletedSignatures[id];
};

ZmSignaturesPage.prototype._handleModifyResponse = function(signature, resp) {
    signature._orig = {
            name:  signature.name,
            value: signature.getValue(),
            contentType:  signature.getContentType()
    }
};

ZmSignaturesPage.prototype._handleModifyError =
function(signature) {
	if (signature._orig) {
		signature.name = signature._orig.name;
		signature.value = signature._orig.value;
		signature.contentType = signature._orig.contentType;
	}
	return true;
};

ZmSignaturesPage.prototype._handleNewResponse = function(signature, resp) {
	delete signature._new;
    signature._orig = {
            name:  signature.name,
            value: signature.getValue(),
            contentType:  signature.getContentType()
    }
    this._resetSignature(signature);
};

// validation

ZmSignaturesPage.prototype._validateName = function(id, value) {
	var comps = this._signatureComps[id];
    var signature = comps.signature;
    if(signature.name.replace(/\s*/g,"") == "" && signature.value.replace(/\s*/g,"") != "" ){
        throw ZmMsg.errorMissingRequired;
    }
	return value;
};

//
// Classes
//

ZmSignatureList = function(parent) {
	DwtComposite.call(this, {parent:parent});
	this._tabGroup = new DwtTabGroup(this._htmlElId);
};
ZmSignatureList.prototype = new DwtComposite;
ZmSignatureList.prototype.constructor = ZmSignatureList;

ZmSignatureList.prototype.toString = function() {
	return "ZmSignatureList";
};

ZmSignatureList.prototype.getTabGroupMember = function() {
	return this._tabGroup;
};
ZmSignatureList.prototype.getTabGroup = ZmSignatureList.prototype.getTabGroupMember;
