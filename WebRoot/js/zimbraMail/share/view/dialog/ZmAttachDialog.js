/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 */

/**
 * Creates an attachment dialog.
 * @class
 * This class represents an attachment dialog.
 * 
 * @param	{DwtControl}	shell		the parent
 * @param	{String}	className		the class name
 * 
 * @extends		DwtDialog
 */
ZmAttachDialog = function(shell, className) {

	className = className || "ZmAttachDialog";
	DwtDialog.call(this, {parent:shell, className:className, title:ZmMsg.attachFile});

	// Initialize
	this._createBaseHtml();

	// Ok and Cancel Actions
	this._defaultCancelCallback = new AjxCallback(this, this._defaultCancelListener);
	this._cancelListener = null;

	this._defaultOkCallback = new AjxCallback(this, this._defaultOkListener);
	this._okListener = null;

	this.setButtonListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this, function() {
		this._cancelButtonListener();
	}));

	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, function() {
		this._okButtonListener();
	}));


	var okButton = this.getButton(DwtDialog.OK_BUTTON);
	okButton.setText(ZmMsg.attach);

};

ZmAttachDialog.prototype = new DwtDialog;
ZmAttachDialog.prototype.constructor = ZmAttachDialog;

/**
 * Defines the "briefcase" tab key.
 */
ZmAttachDialog.TABKEY_BRIEFCASE		= "BRIEFCASE";

//Listeners

/**
 * Adds a cancel button listener.
 * 
 * @param	{constant}		tabKey		the tab key (see <code>TABKEY_</code> constants)
 * @param	{AjxListener|AjxCallback}	cancelCallbackOrListener		the listener
 */
ZmAttachDialog.prototype.setCancelListener =
function(cancelCallbackOrListener) {
	if (cancelCallbackOrListener &&
		(cancelCallbackOrListener instanceof AjxListener ||
		 cancelCallbackOrListener instanceof AjxCallback))
	{
		this._cancelListener = cancelCallbackOrListener;
	}
};


ZmAttachDialog.prototype._defaultCancelListener =
function() {
	this.popdown();
};

ZmAttachDialog.prototype._cancelButtonListener =
function() {
	if (this._cancelListener) {
		this._cancelListener.run();
	} else {
		this._defaultCancelCallback.run();
	}
};

/**
 * Adds a OK button listener.
 * 
 * @param	{constant}		tabKey		the tab key (see <code>TABKEY_</code> constants)
 * @param	{AjxListener|AjxCallback}	cancelCallbackOrListener		the listener
 */
ZmAttachDialog.prototype.setOkListener =
function(okCallbackOrListener) {
	if (okCallbackOrListener &&
		(okCallbackOrListener instanceof AjxListener ||
		 okCallbackOrListener instanceof AjxCallback))
	{
		this._okListener = okCallbackOrListener;
	}
};

ZmAttachDialog.prototype._defaultOkListener =
function() {
	this.popdown();
};

ZmAttachDialog.prototype._okButtonListener =
function() {

    var okButton = this.getButton(DwtDialog.OK_BUTTON);
    okButton.setEnabled(false);

	if (this._okListener) {
		this._okListener.run(this);
	} else {
		this._defaultOkCallback.run();
	}
    
     okButton.setEnabled(true);
};

// Create HTML Container
ZmAttachDialog.prototype._createBaseHtml =
function() {
	this._baseContainerView = new DwtComposite({parent:this, className:"ZmAttachDialog-container"});
	this._initializeTabView(this._baseContainerView);
	this.setView(this._baseContainerView);
};

ZmAttachDialog.prototype._initializeTabView =
function(view) {
    this._setAttachmentSizeSection(view);
	this._setInlineOptionSection(view);
    this._setMsgSection(view);
	this._setFooterSection(view);
};

/**
 * @private
 */
ZmAttachDialog.prototype.stateChangeListener =
function(ev) {
	// Reset Inline Options Here
	this._resetInlineOption();
};


ZmAttachDialog.prototype._setAttachmentSizeSection =
function(view) {
	var div = document.createElement("div");
	div.className = "ZmAttachDialog-note";
    var attSize = AjxUtil.formatSize(appCtxt.get(ZmSetting.MESSAGE_SIZE_LIMIT) || 0, true)
	div.innerHTML = AjxMessageFormat.format(ZmMsg.attachmentLimitMsg, attSize);
	view.getHtmlElement().appendChild(div);
};

ZmAttachDialog.prototype._setMsgSection =
function(view) {
	var div = document.createElement("div");
	div.className = "ZmAttachDialog-footer";
	div.id = Dwt.getNextId();
	view.getHtmlElement().appendChild(div);
	this._msgDiv = document.getElementById(div.id);
};

ZmAttachDialog.prototype._setFooterSection =
function(view) {
	var div = document.createElement("div");
	div.className = "ZmAttachDialog-footer";
	div.id = Dwt.getNextId();
	view.getHtmlElement().appendChild(div);

	this._footer = document.getElementById(div.id);
};

/**
 * Sets the footer content.
 * 
 * @param	{String}	html		the HTML footer content
 */
ZmAttachDialog.prototype.setFooter =
function(html) {
	if (typeof html == "string") {
		this._footer.innerHTML = html;
	} else {
		this._footer.appendChild(html);
	}
};

//Called when AjxEnv.supportsHTML5File is false

ZmAttachDialog.prototype.submitAttachmentFile =
function(view) {
    this.upload(this._uploadCallback, view.uploadForm);
};

ZmAttachDialog.prototype.cancelUploadFiles =
function() {
	// Fix this, as this needs feature request like AjxPost.getRequestId()
	// We need to cancel actual request, but for now just close the window
	this._cancelUpload = true;
	this._defaultCancelListener();
};

ZmAttachDialog.prototype.setUploadCallback =
function(callback) {
	this._uploadCallback = callback;
};

ZmAttachDialog.prototype.getUploadCallback =
function() {
	return this._uploadCallback;
};

/**
 * Uploads the attachments.
 * 
 * @param	{AjxCallback}		callback		the callback
 * @param	{Object}			uploadForm		the upload form
 */
ZmAttachDialog.prototype.upload =
function(callback, uploadForm) {
	if (!callback) {
		callback = false;
	}
	this.setButtonEnabled(DwtDialog.OK_BUTTON, false);
	this.setButtonEnabled(DwtDialog.CANCEL_BUTTON, true);
	this.setFooter(ZmMsg.attachingFiles);
	this._cancelUpload = false;
	this._processUpload(callback, uploadForm);
};

ZmAttachDialog.prototype._processUpload =
function(callback, uploadForm) {
	var ajxCallback = new AjxCallback(this, this._uploadDoneCallback, [callback]);
	var um = appCtxt.getUploadManager();
	window._uploadManager = um;

	try {
		um.execute(ajxCallback, uploadForm);
	} catch (ex) {
		ajxCallback.run();
	}
};

ZmAttachDialog.prototype._uploadDoneCallback =
function(callback, status, attId) {
	if (this._cancelUpload) { return; }

	this.setButtonEnabled(DwtDialog.CANCEL_BUTTON, true);

	if (status == AjxPost.SC_OK) {
		this.setFooter(ZmMsg.attachingFilesDone);
		if (callback) {
			callback.run(status, attId);
		}
	} else if (status == AjxPost.SC_UNAUTHORIZED) {
		// auth failed during att upload - let user relogin, continue with compose action
		var ex = new AjxException("401 response during attachment upload", ZmCsfeException.SVC_AUTH_EXPIRED);
		appCtxt.getAppController()._handleException(ex, {continueCallback:callback});
	} else {
		// bug fix #2131 - handle errors during attachment upload.
		appCtxt.getAppController().popupUploadErrorDialog(ZmItem.MSG, status);
		this.setFooter(ZmMsg.attachingFilesError);
	}

	this.setButtonEnabled(DwtDialog.OK_BUTTON, true);
};

ZmAttachDialog.prototype.removePrevAttDialogContent =
function(contentDiv) {
    var elementNode =  contentDiv && contentDiv.firstChild;
    if (elementNode && elementNode.className == "DwtComposite" ){
        contentDiv.removeChild(elementNode);
    }
};


ZmAttachDialog.prototype.getBriefcaseView =
function(){

    this.removePrevAttDialogContent(this._getContentDiv().firstChild);
    this.setTitle(ZmMsg.attachFile);

	if (!this._briefcaseView) {
		AjxDispatcher.require(["BriefcaseCore", "Briefcase"]);
		this._briefcaseView = new ZmBriefcaseTabView(this);
	}

    this._briefcaseView.reparentHtmlElement(this._getContentDiv().childNodes[0], 0);
    var okCallback = new AjxCallback(this._briefcaseView, this._briefcaseView.uploadFiles);
    this.setOkListener(okCallback);
    this.setCancelListener((new AjxCallback(this,this.cancelUploadFiles)));


	return this._briefcaseView;
};

// Inline Option for attachment Dialog.
ZmAttachDialog.prototype._setInlineOptionSection =
function(view){
	var div = document.createElement("div");
	div.className = "ZmAttachDialog-inline";
	div.id = Dwt.getNextId();
	view.getHtmlElement().appendChild(div);

	this._inlineOption = document.getElementById(div.id);
};

ZmAttachDialog.prototype.enableInlineOption =
function(enable) {
	if (enable) {
		var inlineCheckboxId = this._htmlElId + "_inlineCheckbox";
		this._inlineOption.setAttribute("option", "inline");
		this._inlineOption.innerHTML = [
			"<input type='checkbox' name='inlineimages' id='",
			inlineCheckboxId,
			"'> <label for='",
			inlineCheckboxId,
			"'>",
			ZmMsg.inlineAttachmentOption,
			"</label>"
		].join("");
		this._tabGroup.addMember(this._inlineOption.getElementsByTagName('input')[0],0);
	} else {
		this._inlineOption.innerHTML = "";
	}
};

ZmAttachDialog.prototype._resetInlineOption =
function() {
	var inlineOption = document.getElementById(this._htmlElId+"_inlineCheckbox");
	if (inlineOption) {
		inlineOption.checked = false;
	}
};

ZmAttachDialog.prototype.isInline =
function() {
	var inlineOption = document.getElementById(this._htmlElId+"_inlineCheckbox");
	return (inlineOption && inlineOption.checked);
};

ZmAttachDialog.prototype.setInline =
function(checked) {
	var inlineOption = document.getElementById(this._htmlElId+"_inlineCheckbox");

	if (inlineOption)
		inlineOption.checked = checked;
};


/**
 * Attachment Upload View
 *
 * @param parent
 * @param className
 * @param posStyle
 *
 * @class
 * @private
 */
ZmAttachDialog.prototype.getMyComputerView =
function(){
    var newElm = false;
    this.removePrevAttDialogContent(this._getContentDiv().firstChild);
    this.setTitle(ZmMsg.attachFile);

	if (!this._myComputerView) {
		this._myComputerView = new ZmMyComputerTabViewPage(this);
        newElm = true;
	}

    this._myComputerView.reparentHtmlElement(this._getContentDiv().childNodes[0], 0);

    if (!newElm) {
        this._myComputerView.resetAttachments()
    }

    var okCallback = new AjxCallback(this, this.submitAttachmentFile,[this._myComputerView]);
    this.setOkListener(okCallback);
    this.setCancelListener((new AjxCallback(this,this.cancelUploadFiles)));

	return this._myComputerView;
};


ZmMyComputerTabViewPage = function(parent, className, posStyle) {
	if (arguments.length == 0) { return; }

	DwtComposite.call(this, parent, className, Dwt.STATIC_STYLE);
    this._createHtml();
    this.showMe();
	this.setScrollStyle(Dwt.SCROLL);
};

ZmMyComputerTabViewPage.prototype = new DwtComposite;
ZmMyComputerTabViewPage.prototype.constructor = ZmMyComputerTabViewPage;

ZmMyComputerTabViewPage.SHOW_NO_ATTACHMENTS	= 5;
ZmMyComputerTabViewPage.MAX_NO_ATTACHMENTS	= 10;
ZmMyComputerTabViewPage.UPLOAD_FIELD_NAME	= "_attFile_";


ZmMyComputerTabViewPage.prototype.showMe =
function() {
	this.resetAttachments();
	this.setSize(Dwt.DEFAULT, "240");
	this._focusAttEl();
};

ZmMyComputerTabViewPage.prototype.hideMe =
function() {
	DwtTabViewPage.prototype.hideMe.call(this);
};

// Create UI for MyComputer
ZmMyComputerTabViewPage.prototype._createHtml =
function() {

	var subs = {
		id: this._htmlElId,
		uri: (appCtxt.get(ZmSetting.CSFE_ATTACHMENT_UPLOAD_URI) + "?fmt=extended")
	};
	this.setContent(AjxTemplate.expand("share.Dialogs#ZmAttachDialog-MyComputerTab", subs));

	this.attachmentTable = document.getElementById(this._htmlElId+"_attachmentTable");
	this.uploadForm = document.getElementById(this._htmlElId+"_uploadForm");
	this.attachmentButtonTable = document.getElementById(this._htmlElId+"_attachmentButtonTable");

	this._addAttachmentFieldButton();
	this._attachCount = 0;
};

// Attachments
ZmMyComputerTabViewPage.prototype._addAttachmentField =
function() {
	if (this._attachCount >= ZmMyComputerTabViewPage.MAX_NO_ATTACHMENTS) { return; }

	this._attachCount++;

	var row = this.attachmentTable.insertRow(-1);
	var cell = row.insertCell(-1);
	var fieldId = Dwt.getNextId();

	var subs = {
		id: fieldId,
		uploadName: ZmMyComputerTabViewPage.UPLOAD_FIELD_NAME
	};
	cell.innerHTML = AjxTemplate.expand("share.Dialogs#ZmAttachDialog-MyComputerTab-AddAttachment", subs);

	var removeEl = document.getElementById(fieldId+"_remove");   
	removeEl.onclick = AjxCallback.simpleClosure(this._removeAttachmentField, this, row);

    var inputId = fieldId+"_input";
	if (this._focusElId == -1) {
		this._focusElId = inputId;
	}    
    var inputEl = document.getElementById(inputId);
    var sizeEl = document.getElementById(fieldId+"_size");

    //HTML5
    if(AjxEnv.supportsHTML5File){
        Dwt.setHandler(inputEl, "onchange", AjxCallback.simpleClosure(this._handleFileSize, this, inputEl, sizeEl));
    }

	// trap key presses in IE for input field so we can ignore ENTER key (bug 961)
	if (AjxEnv.isIE) {
		inputEl.onkeydown = AjxCallback.simpleClosure(this._handleKeys, this);
	}
};

ZmMyComputerTabViewPage.prototype._handleFileSize =
function(inputEl, sizeEl){

    var files = inputEl.files;
    if(!files) return;

    var sizeStr = [], className, totalSize =0;
    for(var i=0; i<files.length;i++){
        var file = files[i];
        var size = file.size || file.fileSize /*Safari*/ || 0;
        if ((-1 /* means unlimited */ != appCtxt.get(ZmSetting.MESSAGE_SIZE_LIMIT)) &&
            (size > appCtxt.get(ZmSetting.MESSAGE_SIZE_LIMIT))) {
            className = "RedC";
        }
        totalSize += size;
    }

    if(sizeEl) {
        sizeEl.innerHTML = "  ("+AjxUtil.formatSize(totalSize, true)+")";
        if(className)
            Dwt.addClass(sizeEl, "RedC");
        else
            Dwt.delClass(sizeEl, "RedC");
    }
};



ZmMyComputerTabViewPage.prototype._removeAttachmentField =
function(row) {
	this.attachmentTable.deleteRow(row.rowIndex);
	this._attachCount--;

	if (this._attachCount == 0) {
		this._addAttachmentField();
	}
};

ZmMyComputerTabViewPage.prototype._addAttachmentFieldButton =
function() {
	var row = this.attachmentButtonTable.insertRow(-1);
	var cell = row.insertCell(-1);

	var button = new DwtButton({parent:this, parentElement:cell});
	button.setText(ZmMsg.addMoreAttachments);
	button.addSelectionListener(new AjxListener(this, this._addAttachmentField));
};

ZmMyComputerTabViewPage.prototype.gotAttachments =
function() {
	var atts = document.getElementsByName(ZmMyComputerTabViewPage.UPLOAD_FIELD_NAME);

	for (var i = 0; i < atts.length; i++)
		if (atts[i].value.length) {
			return true;
		}
	return false;
};

ZmMyComputerTabViewPage.prototype.resetAttachments =
function() {
	// CleanUp
	this._cleanTable(this.attachmentTable);
	this._attachCount = 0;
	if (ZmMyComputerTabViewPage.SHOW_NO_ATTACHMENTS > ZmMyComputerTabViewPage.MAX_NO_ATTACHMENTS) {
		ZmMyComputerTabViewPage.SHOW_NO_ATTACHMENTS = ZmMyComputerTabViewPage.MAX_NO_ATTACHMENTS;
	}

	// Re-initialize UI
	this._focusElId = -1;
	var row = this.attachmentTable.insertRow(-1);
	var cell = row.insertCell(-1);
	cell.appendChild(document.createElement("br"));
	cell.appendChild(document.createElement("br"));

	for (var i = 0; i < ZmMyComputerTabViewPage.SHOW_NO_ATTACHMENTS; i++) {
		this._addAttachmentField();
	}
	delete i;
};

ZmMyComputerTabViewPage.prototype._focusAttEl =
function() {
	var el = document.getElementById(this._focusElId);
	if (el) el.focus();
};

// Utilities
ZmMyComputerTabViewPage.prototype._cleanTable =
function(table) {
	if (!table || !table.rows) { return; }
	while (table.rows.length > 0) {
		table.deleteRow(0);
	}
};

ZmMyComputerTabViewPage.prototype._handleKeys =
function(ev) {
	var key = DwtKeyEvent.getCharCode(ev);
	return !DwtKeyEvent.IS_RETURN[key];
};

ZmMyComputerTabViewPage.prototype._validateFileSize =
function(){

    var atts = document.getElementsByName(ZmMyComputerTabViewPage.UPLOAD_FIELD_NAME);
    var file, size;
	for (var i = 0; i < atts.length; i++){
        file = atts[i].files;
        if(!file || file.length == 0) continue;
        for(var j=0; j<file.length;j++){
            var f = file[j];
            size = f.size || f.fileSize /*Safari*/;
            if ((-1 /* means unlimited */ != appCtxt.get(ZmSetting.MESSAGE_SIZE_LIMIT)) &&
                (size > appCtxt.get(ZmSetting.MESSAGE_SIZE_LIMIT))) {
                return false;
            }
        }
    }
	return true;
};

ZmMyComputerTabViewPage.prototype.validate =
function(){
    var status, errorMsg;
    if(AjxEnv.supportsHTML5File){
        status = this._validateFileSize();
        errorMsg = AjxMessageFormat.format(ZmMsg.attachmentSizeError, AjxUtil.formatSize(appCtxt.get(ZmSetting.MESSAGE_SIZE_LIMIT)));
    }else{
        status = true;
    }

    return {status: status, error:errorMsg};
};
