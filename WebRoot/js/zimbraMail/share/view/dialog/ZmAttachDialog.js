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

ZmAttachDialog = function(shell, className) {

    className = className || "ZmAttachDialog";
    var title = ZmMsg.attachFile;
    DwtDialog.call(this, shell, className, title);

	//Initialize
    this._createBaseHtml();
	
	//Ok and Cancel Actions
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
    okButton.setText("Attach");
	
	//Add Default MyComputer tab
    this._addMyComputerTab();
}


ZmAttachDialog.prototype = new DwtDialog;
ZmAttachDialog.prototype.constructor = ZmAttachDialog;


//Listeners

ZmAttachDialog.prototype.addCancelListener = function(tabKey, cancelCallbackOrListener) {
    if (cancelCallbackOrListener && (cancelCallbackOrListener instanceof AjxListener || cancelCallbackOrListener instanceof AjxCallback)) {
        this._cancelListeners[tabKey] = cancelCallbackOrListener;
    }
};

ZmAttachDialog.prototype._defaultCancelListener = function() {
    this.popdown();
};

ZmAttachDialog.prototype._cancelButtonListener = function() {

    var cancelListener = this._cancelListeners[this._tabView.getCurrentTab()];
    if (cancelListener) {
        cancelListener.run();
    } else {
        this._defaultCancelCallback.run();
    }
};

ZmAttachDialog.prototype.addOkListener = function(tabKey, okCallbackOrListener) {
    if (okCallbackOrListener && (okCallbackOrListener instanceof AjxListener || okCallbackOrListener instanceof AjxCallback)) {
        this._okListeners[tabKey] = okCallbackOrListener;
    }
};

ZmAttachDialog.prototype._defaultOkListener = function() {
    this.popdown();
};

ZmAttachDialog.prototype._okButtonListener = function() {

    var okListener = this._okListeners[this._tabView.getCurrentTab()];
    if (okListener) {
         okListener.run();
    } else {
        this._defaultOkCallback.run();
    }
};

//Create HTML Container

ZmAttachDialog.prototype._createBaseHtml = function() {
    var view = this._baseContainerView = new DwtComposite(this);
    view.setScrollStyle(Dwt.CLIP);
    view.setSize("500px", "300px");
    this._initializeTabView(view);
    this.setView(view);
};

ZmAttachDialog.prototype._initializeTabView = function(view) {
    this._tabView = new ZmAttachTabView(view, null, Dwt.STATIC_STYLE);
    this._tabView.addTabChangeListener(new AjxListener(this, this.tabChangeListener));
    this._tabView.addStateChangeListener(new AjxListener(this, this.stateChangeListener));
    this._setInlineOptionSection(view);
    this._setFooterSection(view);

};

ZmAttachDialog.prototype.stateChangeListener = function(ev){
     //Reset Inline Options Here
    this._resetInlineOption();
};

ZmAttachDialog.prototype.tabChangeListener = function(ev) {
    this.setFooter("");
	// Add a warning if there are selected files.
    var tabKey = this._tabView.getCurrentTab();
    var tabView = this._tabView.getTabView(tabKey);
    if (tabView && tabView.gotAttachments()) {
        this.setFooter("Please clear or upload attachments before changing tabs");
        return false;
    }
    return true;
};

ZmAttachDialog.prototype._setFooterSection = function(view) {

    var div = document.createElement("div");
    div.style.height = "10px";
    div.style.textAlign = "center";
    div.id = Dwt.getNextId();
    view.getHtmlElement().appendChild(div);

    this._footer = document.getElementById(div.id);
};

ZmAttachDialog.prototype.setFooter = function(html) {
    if (typeof html == "string") {
        this._footer.innerHTML = html;
    } else {
        this._footer.appendChild(html);
    }
};

ZmAttachDialog.prototype.getTabView = function() {
    return this._tabView;
};

ZmAttachDialog.prototype.addTab = function(id, title, tabViewPage) {
    if (!this._tabView || !tabViewPage) return null;
    var tabKey = this._tabView.addTab(title, tabViewPage);
    this._tabKeys[id] = tabKey;
    return tabKey;
};

ZmAttachDialog.prototype.getTabKey = function(id) {
    return this._tabKeys[id];
};

ZmAttachDialog.prototype.getTabViewPage = function(id) {
    return this._tabView.getTabView(this._tabKeys[id]);
};

//PopUp Hack to refresh the UI everytime

ZmAttachDialog.prototype.popup = function() {
    var tabKey = this.getTabKey("MY_COMPUTER");
    this._tabView.switchToTab(tabKey,true);
    this.setFooter("");
    DwtDialog.prototype.popup.call(this);
    this.setFooter("");
};

//Upload Utitlity Methods
ZmAttachDialog.prototype.uploadFiles = function() {
    var tabKey = this._tabView.getCurrentTab();
    var tabView = this._tabView.getTabView(tabKey);
    if (tabView && tabView.gotAttachments()) {
        this.upload(this._uploadCallback, tabView.getUploadForm());
    } else {
        this.setFooter("Add atleast one file to attach");
    }
};

ZmAttachDialog.prototype.cancelUploadFiles = function() {

    //Fix this, as this needs feature request like AjxPost.getRequestId()
    //We need to cancel the actual request, but we are for now just closing the window
    this._cancelUpload = true;
    this._defaultCancelListener();

};

ZmAttachDialog.prototype.setUploadCallback = function(callback) {
    if (!callback) callback = false;
    this._uploadCallback = callback;
};

ZmAttachDialog.prototype.upload = function(callback, uploadForm) {

    if (!callback) callback = false;
    this.setButtonEnabled(DwtDialog.OK_BUTTON, false);
    this.setButtonEnabled(DwtDialog.CANCEL_BUTTON, true);
    this.setFooter("Attaching files...");
    this._cancelUpload = false;
    this._processUpload(callback, uploadForm);

};

ZmAttachDialog.prototype._processUpload = function(callback, uploadForm) {

    var ajxCallback = new AjxCallback(this, this._uploadDoneCallback, [callback]);
    var um = appCtxt.getUploadManager();
    window._uploadManager = um;

    try {
        um.execute(ajxCallback, uploadForm);
    } catch (ex) {
        ajxCallback.run();
    }
};

ZmAttachDialog.prototype._uploadDoneCallback = function(callback, status, attId) {

    this.setButtonEnabled(DwtDialog.OK_BUTTON, true);
    this.setButtonEnabled(DwtDialog.CANCEL_BUTTON, true);

    if (this._cancelUpload) {
        return;
    }

    if (status == AjxPost.SC_OK) {
        this.setFooter("Finished attaching files.");
        if (callback) {
            callback.run(status, attId);
        }

    } else if (status == AjxPost.SC_UNAUTHORIZED) {

        // auth failed during att upload - let user relogin, continue with compose action
        var ex = new AjxException("401 response during attachment upload", ZmCsfeException.SVC_AUTH_EXPIRED);
        appCtxt.getAppController()._handleException(ex, callback);

    } else {

        // bug fix #2131 - handle errors during attachment upload.
        var msg = AjxMessageFormat.format(ZmMsg.errorAttachment, (status || AjxPost.SC_NO_CONTENT));

        switch (status) {
        // add other error codes/message here as necessary
            case AjxPost.SC_REQUEST_ENTITY_TOO_LARGE:     msg += " " + ZmMsg.errorAttachmentTooBig + "<br><br>"; break;
            default:                                     msg += " "; break;
        }
        var dialog = appCtxt.getMsgDialog();
        dialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
        dialog.popup();

        this.setFooter("Error while attaching files.")
    }
};

//MyComputer: Add MyComputer Tab View

ZmAttachDialog.prototype._addMyComputerTab = function() {
    this._myComputerTabViewPage = new ZmMyComputerTabViewPage(this._tabView);
    var tabKey = this.addTab("MY_COMPUTER", ZmMsg.myComputer, this._myComputerTabViewPage);
    var okCallback = new AjxCallback(this, this.uploadFiles);
    this.addOkListener(tabKey, okCallback);
    var cancelCallback = new AjxCallback(this, this.cancelUploadFiles);
    this.addCancelListener(tabKey, cancelCallback);
};

//Inline Option for attachment Dialog.
ZmAttachDialog.INLINE_OPTION_MSG = "Show images in message body";
ZmAttachDialog.prototype._setInlineOptionSection = function(view){
    var div = document.createElement("div");
    div.style.height = "10px";
    div.style.textAlign = "left";
    div.id = Dwt.getNextId();
    view.getHtmlElement().appendChild(div);

    this._inlineOption = document.getElementById(div.id);
};

ZmAttachDialog.prototype.enableInlineOption = function(enable) {
    
    this._inlineOption.innerHTML = "";
    this._inline = false;
    if(!!enable){
        var html = [];
        var idx = 0;
	    //Adding inline option
        html[idx++] = "<input type='checkbox' name='inlineimages' id='inline'>&nbsp;" + ZmAttachDialog.INLINE_OPTION_MSG;
        html = html.join("");

        this._inlineOption.setAttribute("option", "inline");
        this._inlineOption.innerHTML = html;

        var inlineOption = document.getElementById("inline");
        inlineOption.onclick = AjxCallback.simpleClosure(this._handleInline, this, inlineOption);
    }
};

ZmAttachDialog.prototype._resetInlineOption = function(){
   var inlineOption = document.getElementById("inline");
   if(inlineOption){
       inlineOption.checked = false;
   }
    this._inline = false;
};

ZmAttachDialog.prototype._handleInline = function(checkbox) {
    this._inline = (checkbox && checkbox.checked);
    var currentTabPageView = this._tabView.getTabView(this._tabView.getCurrentTab());
    if(currentTabPageView._handleInline){
        currentTabPageView._handleInline(this._inline);
    }
    //this._uploadForm.setAttribute("action", this._uri + ((this._inline) ? "?fmt=extended" : ""));
};

ZmAttachDialog.prototype.isInline = function(){
    return (!!this._inline);
};

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx//
//ZmAttachTabView: Extended DwtTabView class to get handle over switchToTab() method,
// so that I could run a pre-switchToTab listener.

ZmAttachTabView = function(parent, className, position){
    if(arguments.length == 0) return;
    DwtTabView.call(this,parent,className,position);
};

ZmAttachTabView.prototype =  new DwtTabView;
ZmAttachTabView.prototype.constructor = new ZmAttachTabView;

ZmAttachTabView.prototype.addTabChangeListener = function(listener) {
    this._addTabChangeListener = listener;
};

ZmAttachTabView.prototype.switchToTab =function(tabKey,skipTabChangeListener){
 
    if(!skipTabChangeListener && this._addTabChangeListener && !this._addTabChangeListener.run()){
          var button = this._tabBar.getButton(this.getCurrentTab());
          button.setOpen();
          button = this._tabBar.getButton(tabKey);
          button.setClosed();
          return;
      }
      DwtTabView.prototype.switchToTab.call(this,tabKey);
};

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx//
//MyComputer TabViewPage: Attachment Upload View

ZmMyComputerTabViewPage = function(parent, className, posStyle) {

    if (arguments.length == 0) return;
	
	//className = className || "DwtTabViewPage";
    DwtTabViewPage.call(this, parent, className, Dwt.STATIC_STYLE);

    this.setScrollStyle(Dwt.SCROLL);
};

ZmMyComputerTabViewPage.prototype = new DwtTabViewPage;
ZmMyComputerTabViewPage.prototype.constructor = ZmMyComputerTabViewPage;

ZmMyComputerTabViewPage.SHOW_NO_ATTACHMENTS = 5;
ZmMyComputerTabViewPage.MAX_NO_ATTACHMENTS = 10;
ZmMyComputerTabViewPage.UPLOAD_FIELD_NAME = "_attFile_";
ZmMyComputerTabViewPage.ADD_ATTACHMENT_FIELD = "Add More Attachments";

ZmMyComputerTabViewPage.prototype.toString = function() {
    return "ZmMyComputerTabViewPage";
};


ZmMyComputerTabViewPage.prototype.showMe = function() {
    this.resetAttachments();
    DwtTabViewPage.prototype.showMe.call(this);
    this.setSize(Dwt.DEFAULT, "240");
    this._focusAttEl();
};

ZmMyComputerTabViewPage.prototype.hideMe = function() {
    //this._resetInlineOption();
    DwtTabViewPage.prototype.hideMe.call(this);
};

//Create UI for MyComputer
ZmMyComputerTabViewPage.prototype._createHtml = function() {

    this._uri = appCtxt.get(ZmSetting.CSFE_UPLOAD_URI);

    var attachmentTableId = this._attachmentTableId = Dwt.getNextId();
    var uploadFormId = this._uploadFormId = Dwt.getNextId();
    var attachmentButtonTableId = this._attachmentButtonTableId = Dwt.getNextId();
    var optionTableId = this._optionTableId = Dwt.getNextId();

    var html = [];
    var idx = 0;
    html[idx++] = "<div style='overflow:auto'><form accept-charset='utf-8' method='POST' action='";
    html[idx++] = this._uri;
    html[idx++] = "' id='";
    html[idx++] = uploadFormId;
    html[idx++] = "' enctype='multipart/form-data'><input type='hidden' name='_charset_'/><table id='";
    html[idx++] = attachmentTableId;
    html[idx++] = "' cellspacing=0 cellpadding=0 border=0 class='iframeTable'></table>";
    html[idx++] = "</form></div>";
    html[idx++] = "<div><table id='";
    html[idx++] = attachmentButtonTableId;
    html[idx++] = "'></table></div>";
    html[idx++] = "<div><table id='";
    html[idx++] = optionTableId;
    html[idx++] = "'></table></div>";

    this._contentEl = this.getContentHtmlElement();
    this._contentEl.innerHTML = html.join("");
	
	//Initialize
    this._attachmentTable = document.getElementById(this._attachmentTableId);
    delete this._attachmentTableId;

    this._uploadForm = document.getElementById(this._uploadFormId);
    delete this._uploadFormId;

    this._uploadForm.setAttribute("action", this._uri);

    this._attachmentButtonTable = document.getElementById(this._attachmentButtonTableId);
    delete this._attachmentButtonTableId;

    this._optionTable = document.getElementById(this._optionTableId);
    delete this._optionTableId;

    this._addAttachmentFieldButton();

    this._attachCount = 0;
};

ZmMyComputerTabViewPage.prototype._getAttachmentTable = function() {
    return this._attachmentTable;
};

ZmMyComputerTabViewPage.prototype._getAttachmentButtonTable = function() {
    return this._attachmentButtonTable;
};

ZmMyComputerTabViewPage.prototype._getOptionTable = function() {
    return this._optionTable;
};

ZmMyComputerTabViewPage.prototype.getUploadForm = function() {
    return this._uploadForm;
};

//Inline Options
/*
ZmMyComputerTabViewPage.INLINE_OPTION_MSG = "Show images in message body";
ZmMyComputerTabViewPage.prototype.showInlineOption = function() {

    this._inline = false;
    var optTable = this._getOptionTable();
    this._cleanTable(optTable);
    var html = [];
    var idx = 0;
	//Adding inline option
    html[idx++] = "<input type='checkbox' name='inlineimages' id='inline'>&nbsp;" + ZmMyComputerTabViewPage.INLINE_OPTION_MSG;
    html = html.join("");

    optTable.setAttribute("option", "inline");
    var row = optTable.insertRow(-1);
    var cell = row.insertCell(-1);
    cell.innerHTML = html;

    var inlineOption = document.getElementById("inline");
    inlineOption.onclick = AjxCallback.simpleClosure(this._handleInline, this, inlineOption);
};

ZmMyComputerTabViewPage.prototype.hideInlineOption = function() {
    var optTable = this._getOptionTable();
    if (optTable.getAttribute("option") != "inline") return;
    optTable.setAttribute("option", "");
    this._cleanTable(optTable);
    this._inline = false;
};
*/
ZmMyComputerTabViewPage.prototype._handleInline = function(inline) {
    this._uploadForm.setAttribute("action", this._uri + (inline? "?fmt=extended" : ""));
};
/*
ZmMyComputerTabViewPage.prototype._resetInlineOption = function() {

    var inlineOption = document.getElementById("inline");
    if (inlineOption) {
        inlineOption.checked = false;
    }
    this._inline = false;
    this._uploadForm.setAttribute("action", this._uri);
};

ZmMyComputerTabViewPage.prototype.isInline = function() {
    return ((this._inline) ? this._inline : false);
};
*/


//Attachments
ZmMyComputerTabViewPage.prototype.addAttachmentField = function(noRemoveLink) {

    if (this._attachCount >= ZmMyComputerTabViewPage.MAX_NO_ATTACHMENTS) {
        return;
    }

    var attTable = this._getAttachmentTable();

    this._attachCount++;

    noRemoveLink = (noRemoveLink != null && typeof noRemoveLink == "boolean") ? noRemoveLink : false;
	// add new row
    var row = attTable.insertRow(-1);
    var attId = "_att_" + Dwt.getNextId();
    var attRemoveId = attId + "_r";
    var attInputId = attId + "_i";
    row.id = attId;
	
	// add new cell and build html for inserting file upload input element
    var cell = row.insertCell(-1);
    var html = [];
    var idx = 0;
    html[idx++] = "<table cellspacing=2 cellpadding=0 border=0><tr><td><div class='attachText'>";
    html[idx++] = ["Attach File ",this._attachCount,":"].join("");
    html[idx++] = "</div></td><td class='nobreak'><input id='";
    html[idx++] = attInputId;
    html[idx++] = "' type='file' name='";
    html[idx++] = ZmMyComputerTabViewPage.UPLOAD_FIELD_NAME;
    html[idx++] = "' size=40>";
    if (!noRemoveLink) {
        html[idx++] = "&nbsp;<span id='";
        html[idx++] = attRemoveId;
        html[idx++] = "' onmouseover='this.style.cursor=\"pointer\"' onmouseout='this.style.cursor=\"default\"' style='color:blue;text-decoration:underline;'>";
        html[idx++] = ZmMsg.remove;
        html[idx++] = "</span>";
    }
    html[idx++] = "</td></tr></table>";
    cell.innerHTML = html.join("");

    if (this._focusElId == -1) {
        this._focusElId = attInputId;
    }

    if (!noRemoveLink) {
        var attRemoveLink = document.getElementById(attRemoveId);
        attRemoveLink["onclick"] = AjxCallback.simpleClosure(this._removeAttachmentField, this, attId);
    }
	// trap key presses in IE for input field so we can ignore ENTER key (bug 961)
    if (AjxEnv.isIE) {
        var attField = document.getElementById(attInputId);
        attField["onkeydown"] = AjxCallback.simpleClosure(this._handleKeys, this);
    }

};

ZmMyComputerTabViewPage.prototype._removeAttachmentField = function(attId) {
    var row = document.getElementById(attId);
    this._attachmentTable.deleteRow(row.rowIndex);
    if (--this._attachCount == 0) {
        return false; // disables following of link
    }
    return true;
};


ZmMyComputerTabViewPage.prototype._addAttachmentFieldButton = function() {

    var attTable = this._getAttachmentButtonTable();
    var row = attTable.insertRow(-1);
    var cell = row.insertCell(-1);

    var addAttachmentFieldButton = new DwtButton(this);
    addAttachmentFieldButton.setText(ZmMyComputerTabViewPage.ADD_ATTACHMENT_FIELD);
    cell.appendChild(addAttachmentFieldButton.getHtmlElement());
    addAttachmentFieldButton.addSelectionListener(new AjxListener(this, this.addAttachmentField));

};

ZmMyComputerTabViewPage.prototype.gotAttachments =
function() {
    var atts = document.getElementsByName(ZmMyComputerTabViewPage.UPLOAD_FIELD_NAME);
    for (var i = 0; i < atts.length; i++)
        if (atts[i].value.length)
            return true;
    return false;
};

ZmMyComputerTabViewPage.prototype.resetAttachments = function() {

    //CleanUp
    var attTable = this._getAttachmentTable();
    this._cleanTable(attTable);
    this._attachCount = 0;
    if (ZmMyComputerTabViewPage.SHOW_NO_ATTACHMENTS > ZmMyComputerTabViewPage.MAX_NO_ATTACHMENTS) {
        ZmMyComputerTabViewPage.SHOW_NO_ATTACHMENTS = ZmMyComputerTabViewPage.MAX_NO_ATTACHMENTS;
    }
	
	//Re-initialize UI
    this._focusElId = -1;
    var row = attTable.insertRow(-1);
    var cell = row.insertCell(-1);
    cell.appendChild(document.createElement("br"));
    cell.appendChild(document.createElement("br"));

    this.addAttachmentField(true);
    for (var i = 1; i < ZmMyComputerTabViewPage.SHOW_NO_ATTACHMENTS; i++) {
        this.addAttachmentField();
    }
    delete i;
};

ZmMyComputerTabViewPage.prototype._focusAttEl = function() {
    var el = document.getElementById(this._focusElId);
    if (el) el.focus();
};

//Utilities
ZmMyComputerTabViewPage.prototype._cleanTable = function(table) {
    if (!table || !table.rows) return;
    while (table.rows.length > 0) {
        table.deleteRow(0);
    }
};

ZmMyComputerTabViewPage.prototype._handleKeys = function(ev) {
    var key = DwtKeyEvent.getCharCode(ev);
    return (key != DwtKeyEvent.KEY_ENTER && key != DwtKeyEvent.KEY_END_OF_TEXT);
};

