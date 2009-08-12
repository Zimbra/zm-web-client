/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009 Zimbra, Inc.
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

ZmAttachDialog.TABKEY_MYCOMPUTER	= "MY_COMPUTER";
ZmAttachDialog.TABKEY_BRIEFCASE		= "BRIEFCASE";


//Listeners

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
	var okListener = this._okListeners[this._tabView.getCurrentTab()];
	if (okListener) {
		okListener.run(this);
	} else {
		this._defaultOkCallback.run();
	}
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
	this._setInlineOptionSection(view);
	this._setFooterSection(view);
};

ZmAttachDialog.prototype.stateChangeListener =
function(ev) {
	// Reset Inline Options Here
	this._resetInlineOption();
};

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

ZmAttachDialog.prototype._setFooterSection =
function(view) {
	var div = document.createElement("div");
	div.className = "ZmAttachDialog-footer";
	div.id = Dwt.getNextId();
	view.getHtmlElement().appendChild(div);

	this._footer = document.getElementById(div.id);
};

ZmAttachDialog.prototype.setFooter =
function(html) {
	if (typeof html == "string") {
		this._footer.innerHTML = html;
	} else {
		this._footer.appendChild(html);
	}
};

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
	if (!callback) {
		callback = false;
	}
	this._uploadCallback = callback;
};

ZmAttachDialog.prototype.getUploadCallback =
function() {
	return this._uploadCallback;
};

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
	var briefcaseTabViewCallback =  new AjxCallback(this, this.getBriefcaseTabView);
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
	this._inlineOption.innerHTML = "";
	this._inline = false;

	if (!!enable) {
		this._inlineOption.setAttribute("option", "inline");
		this._inlineOption.innerHTML = [
			"<input type='checkbox' name='inlineimages' id='inline'> ",
			ZmMsg.inlineAttachmentOption
		].join("");

		var inlineOption = document.getElementById("inline");
		inlineOption.onclick = AjxCallback.simpleClosure(this._handleInline, this, inlineOption);
	}
};

ZmAttachDialog.prototype._resetInlineOption =
function() {
	var inlineOption = document.getElementById("inline");
	if (inlineOption) {
		inlineOption.checked = false;
	}
	this._inline = false;
};

ZmAttachDialog.prototype._handleInline =
function(checkbox) {
	this._inline = (checkbox && checkbox.checked);
	var currentTabPageView = this._tabView.getTabView(this._tabView.getCurrentTab());
	if (currentTabPageView._handleInline) {
		currentTabPageView._handleInline(this._inline);
	}
};

ZmAttachDialog.prototype.isInline =
function() {
	return (!!this._inline);
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

ZmAttachTabView.prototype =  new DwtTabView;
ZmAttachTabView.prototype.constructor = new ZmAttachTabView;

ZmAttachTabView.prototype.addTabChangeListener =
function(listener) {
	this._addTabChangeListener = listener;
};

ZmAttachTabView.prototype.switchToTab =
function(tabKey,skipTabChangeListener){
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
ZmMyComputerTabViewPage.prototype.addAttachmentField =
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
		this.addAttachmentField();
	}
};

ZmMyComputerTabViewPage.prototype._addAttachmentFieldButton =
function() {
	var row = this.attachmentButtonTable.insertRow(-1);
	var cell = row.insertCell(-1);

	var button = new DwtButton({parent:this, parentElement:cell});
	button.setText(ZmMsg.addMoreAttachments);
	button.addSelectionListener(new AjxListener(this, this.addAttachmentField));
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
		this.addAttachmentField();
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
