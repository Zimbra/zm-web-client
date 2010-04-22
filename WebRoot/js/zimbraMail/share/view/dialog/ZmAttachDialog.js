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
	this._cancelListeners = {};

	this._defaultOkCallback = new AjxCallback(this, this._defaultOkListener);
	this._okListeners = {};

	this.setButtonListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this, function() {
		this._cancelButtonListener();
	}));

	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, function() {
		this._okButtonListener();
	}));

	this._tabKeys = {};

	var okButton = this.getButton(DwtDialog.OK_BUTTON);
	okButton.setText(ZmMsg.attach);

	// Add Default MyComputer tab
	this._addMyComputerTab();

	if (appCtxt.get(ZmSetting.BRIEFCASE_ENABLED)) {
		this._addBriefcaseViewTab();
	}
};

ZmAttachDialog.prototype = new DwtDialog;
ZmAttachDialog.prototype.constructor = ZmAttachDialog;

/**
 * Defines the "my computer" tab key.
 */
ZmAttachDialog.TABKEY_MYCOMPUTER	= "MY_COMPUTER";
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
ZmAttachDialog.prototype.addCancelListener =
function(tabKey, cancelCallbackOrListener) {
	if (cancelCallbackOrListener &&
		(cancelCallbackOrListener instanceof AjxListener ||
		 cancelCallbackOrListener instanceof AjxCallback))
	{
		this._cancelListeners[tabKey] = cancelCallbackOrListener;
	}
};

ZmAttachDialog.prototype._defaultCancelListener =
function() {
	this.popdown();
};

ZmAttachDialog.prototype._cancelButtonListener =
function() {
	var cancelListener = this._cancelListeners[this._tabView.getCurrentTab()];
	if (cancelListener) {
		cancelListener.run();
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
ZmAttachDialog.prototype.addOkListener =
function(tabKey, okCallbackOrListener) {
	if (okCallbackOrListener &&
		(okCallbackOrListener instanceof AjxListener ||
		 okCallbackOrListener instanceof AjxCallback))
	{
		this._okListeners[tabKey] = okCallbackOrListener;
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

	var okListener = this._okListeners[this._tabView.getCurrentTab()];
	if (okListener) {
		okListener.run(this);
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
	this._tabView = new ZmAttachTabView(view, null, Dwt.STATIC_STYLE);
	this._tabView.addTabChangeListener(new AjxListener(this, this.tabChangeListener));
	this._tabView.addStateChangeListener(new AjxListener(this, this.stateChangeListener));
    this._setAttachmentSizeSection(view);
	this._setInlineOptionSection(view);
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

/**
 * @private
 */
ZmAttachDialog.prototype.tabChangeListener =
function(ev) {
	this.setFooter("");

	// Add a warning if there are selected files.
	var tabKey = this._tabView.getCurrentTab();
	var tabView = this._tabView.getTabView(tabKey);
	if (tabView && tabView.gotAttachments()) {
		this.setFooter(ZmMsg.attachClearUploadMessage);
		return false;
	}
	return true;
};

ZmAttachDialog.prototype._setAttachmentSizeSection =
function(view) {
	var div = document.createElement("div");
	div.className = "ZmAttachDialog-note";
    var attSize = AjxUtil.formatSize(appCtxt.get(ZmSetting.ATTACHMENT_SIZE_LIMIT) || 0, true)
	div.innerHTML = AjxMessageFormat.format(ZmMsg.attachmentLimitMsg, attSize);
	view.getHtmlElement().appendChild(div);
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

/**
 * Gets the tab view.
 * 
 * @return	{ZmAttachTabView}	the tab view
 */
ZmAttachDialog.prototype.getTabView =
function() {
	return this._tabView;
};

ZmAttachDialog.prototype.addTab =
function(id, title, tabViewPage) {
	if (!this._tabView || !tabViewPage) { return null; }

	this._tabKeys[id] = this._tabView.addTab(title, tabViewPage);
	return this._tabKeys[id];
};

ZmAttachDialog.prototype.getTabKey =
function(id) {
	return this._tabKeys[id];
};

ZmAttachDialog.prototype.getTabViewPage =
function(id) {
	return this._tabView.getTabView(this._tabKeys[id]);
};

// PopUp Hack to refresh the UI everytime
ZmAttachDialog.prototype.popup =
function() {
	var tabKey = this.getTabKey(ZmAttachDialog.TABKEY_MYCOMPUTER);
	this._tabView.switchToTab(tabKey, true);

	this.setButtonEnabled(DwtDialog.OK_BUTTON, true);
	this.setButtonEnabled(DwtDialog.CANCEL_BUTTON, true);
	this.setFooter("");

	DwtDialog.prototype.popup.call(this);
	this.setFooter("");
};

// Upload Utitlity Methods
ZmAttachDialog.prototype.uploadFiles =
function() {
	var tabKey = this._tabView.getCurrentTab();
	var tabView = this._tabView.getTabView(tabKey);
	if (tabView && tabView.gotAttachments()) {
		this.upload(this._uploadCallback, tabView.uploadForm);
	} else {
		this.setFooter(ZmMsg.attachSelectMessage);
	}
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
		var msg = AjxMessageFormat.format(ZmMsg.errorAttachment, (status || AjxPost.SC_NO_CONTENT));

		switch (status) {
			// add other error codes/message here as necessary
			case AjxPost.SC_REQUEST_ENTITY_TOO_LARGE:	msg += " " + ZmMsg.errorAttachmentTooBig + "<br><br>"; break;
			default:									msg += " "; break;
		}
		var dialog = appCtxt.getMsgDialog();
		dialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
		dialog.popup();

		this.setFooter(ZmMsg.attachingFilesError);
	}

	this.setButtonEnabled(DwtDialog.OK_BUTTON, true);
};

// MyComputer: Add MyComputer Tab View
ZmAttachDialog.prototype._addMyComputerTab =
function() {
	this._myComputerTabViewPage = new ZmMyComputerTabViewPage(this._tabView);
	var tabKey = this.addTab(ZmAttachDialog.TABKEY_MYCOMPUTER, ZmMsg.myComputer, this._myComputerTabViewPage);
	this.addOkListener(tabKey, (new AjxCallback(this, this.uploadFiles)));
	this.addCancelListener(tabKey, (new AjxCallback(this, this.cancelUploadFiles)));
};

ZmAttachDialog.prototype._addBriefcaseViewTab =
function(){
	var briefcaseTabViewCallback = new AjxCallback(this, this.getBriefcaseTabView);
	var tabKey = this.addTab(ZmAttachDialog.TABKEY_BRIEFCASE, ZmMsg.briefcase, briefcaseTabViewCallback);
};

ZmAttachDialog.prototype.getBriefcaseTabView =
function(tabKey){
	if (!this._briefcaseTabView) {
		AjxDispatcher.require(["BriefcaseCore", "Briefcase"]);
		this._briefcaseTabView = new ZmBriefcaseTabView(this._tabView);
		var okCallback = new AjxCallback(this._briefcaseTabView, this._briefcaseTabView.uploadFiles);
		this.addOkListener(tabKey, okCallback);
		this.addCancelListener(tabKey, (new AjxCallback(this,this.cancelUploadFiles)));
	}
	return this._briefcaseTabView;
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


/**
 * Extended DwtTabView class to get handle over switchToTab() method, so that I
 * could run a pre-switchToTab listener.
 *
 * @param parent
 * @param className
 * @param position
 */
ZmAttachTabView = function(parent, className, position) {
	if (arguments.length == 0) { return; }

	DwtTabView.call(this, parent, className, position);
};

ZmAttachTabView.prototype = new DwtTabView;
ZmAttachTabView.prototype.constructor = new ZmAttachTabView;

ZmAttachTabView.prototype.addTabChangeListener =
function(listener) {
	this._addTabChangeListener = listener;
};

ZmAttachTabView.prototype.switchToTab =
function(tabKey, skipTabChangeListener){
	if (!skipTabChangeListener &&
		this._addTabChangeListener &&
		!this._addTabChangeListener.run())
	{
		var button = this._tabBar.getButton(this.getCurrentTab());
		button.setOpen();

		button = this._tabBar.getButton(tabKey);
		button.setClosed();
		return;
	}

	DwtTabView.prototype.switchToTab.call(this,tabKey);
};

/**
 * Attachment Upload View
 *
 * @param parent
 * @param className
 * @param posStyle
 */
ZmMyComputerTabViewPage = function(parent, className, posStyle) {
	if (arguments.length == 0) { return; }

	DwtTabViewPage.call(this, parent, className, Dwt.STATIC_STYLE);

	this.setScrollStyle(Dwt.SCROLL);
};

ZmMyComputerTabViewPage.prototype = new DwtTabViewPage;
ZmMyComputerTabViewPage.prototype.constructor = ZmMyComputerTabViewPage;

ZmMyComputerTabViewPage.SHOW_NO_ATTACHMENTS	= 5;
ZmMyComputerTabViewPage.MAX_NO_ATTACHMENTS	= 10;
ZmMyComputerTabViewPage.UPLOAD_FIELD_NAME	= "_attFile_";

ZmMyComputerTabViewPage.prototype.toString =
function() {
	return "ZmMyComputerTabViewPage";
};

ZmMyComputerTabViewPage.prototype.showMe =
function() {
	this.resetAttachments();

	DwtTabViewPage.prototype.showMe.call(this);

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
	this._contentEl = this.getContentHtmlElement(); // needs assigment b/c used by base class
	this._contentEl.innerHTML = AjxTemplate.expand("share.Dialogs#ZmAttachDialog-MyComputerTab", subs);

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
	var removeLinkId = Dwt.getNextId();

	var subs = {
		id: this._htmlElId,
		removeLinkId: removeLinkId,
		uploadName: ZmMyComputerTabViewPage.UPLOAD_FIELD_NAME
	};
	cell.innerHTML = AjxTemplate.expand("share.Dialogs#ZmAttachDialog-MyComputerTab-AddAttachment", subs);

	var inputId = this._htmlElId+"_input";
	if (this._focusElId == -1) {
		this._focusElId = inputId;
	}

	var removeEl = document.getElementById(removeLinkId);
	removeEl.onclick = AjxCallback.simpleClosure(this._removeAttachmentField, this, row);

	// trap key presses in IE for input field so we can ignore ENTER key (bug 961)
	if (AjxEnv.isIE) {
		var inputEl = document.getElementById(inputId);
		inputEl.onkeydown = AjxCallback.simpleClosure(this._handleKeys, this);
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
	return (key != DwtKeyEvent.KEY_ENTER && key != DwtKeyEvent.KEY_END_OF_TEXT);
};
