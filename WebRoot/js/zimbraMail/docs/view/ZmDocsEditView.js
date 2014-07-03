/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2011, 2012, 2013, 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an "AS IS" basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2008, 2009, 2010, 2011, 2012, 2013, 2014 Zimbra, Inc. All Rights Reserved. 
 * ***** END LICENSE BLOCK *****
 */

ZmDocsEditView = function(parent, className, posStyle, controller, deferred) {
    className = className || "ZmDocsEditView";

    DwtComposite.call(this, {parent:parent, className:className, posStyle:DwtControl.ABSOLUTE_STYLE});

    this._buttons = {};
    this._controller = controller;
    this._docMgr = new ZmDocletMgr();
    this._initialize();    

    this.addControlListener(this._controlListener.bind(this));
};

ZmDocsEditView.prototype = new DwtComposite;
ZmDocsEditView.prototype.constructor = ZmDocsEditView;

ZmDocsEditView.ZD_VALUE = "ZD";
ZmDocsEditView.APP_ZIMBRA_DOC = "application/x-zimbra-doc";

ZmDocsEditView.prototype.TEMPLATE = 'briefcase.Briefcase#ZmDocsEditView';

ZmDocsEditView.prototype.toString =
function() {
	return "ZmDocsEditView";
};

ZmDocsEditView.prototype.getController =
function() {
	return this._controller;
};

ZmDocsEditView.prototype._focusPageInput =
function() {
	if (this.warngDlg) {
		this.warngDlg.popdown();
	}
	this._buttons.fileName.focus();
};


ZmDocsEditView.prototype._showVersionDescDialog =
function(callback){

    if(!this._descDialog){
        var dlg = this._descDialog = new DwtDialog({parent:appCtxt.getShell()});
        var id = Dwt.getNextId();
        dlg.setContent(AjxTemplate.expand("briefcase.Briefcase#VersionNotes", {id: id}));
        dlg.setTitle(ZmMsg.addVersionNotes);
        this._versionNotes = document.getElementById(id+"_notes");
    }

    ZmDocsEditApp.fileInfo.desc = "";
    this._versionNotes.value = "";

    this._descDialog.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okCallback, callback));
    this._descDialog.popup();

    this._versionNotes.focus();

};

ZmDocsEditView.prototype._okCallback =
function(callback){

    ZmDocsEditApp.fileInfo.desc = this._versionNotes.value;

    if(callback){
        callback.run();
    }

    this._descDialog.popdown();
};


ZmDocsEditView.prototype.isDirty = function() {
	return this._editor && this._editor.isDirty();
};

ZmDocsEditView.prototype.save = function(force){

    var fileName = this._buttons.fileName.getValue();
    var message = this._docMgr.checkInvalidDocName(fileName);

    // Ignore save if document is not dirty
    var _docModified = this.isDirty();
    var _docNameModified = fileName && (fileName != ZmDocsEditApp.fileInfo.name);
    if (!_docModified && !_docNameModified && !message) {
        if(this._saveClose){
            window.close();
        } else {
            return;
        }
    }

    ZmDocsEditApp.fileInfo.descEnabled = this._getVersionNotesChk().checked;
    if (message) {
		var style = DwtMessageDialog.WARNING_STYLE;
		var dialog = this.warngDlg = appCtxt.getMsgDialog();
		dialog.setMessage(message, style);
		dialog.popup();
	    dialog.registerCallback(DwtDialog.OK_BUTTON, this._focusPageInput, this);
		return false;
	}
    if(!force && this._getVersionNotesChk().checked){
        this._showVersionDescDialog(new AjxCallback(this, this.save, true));
        return false;
    }

    ZmDocsEditApp.fileInfo.name    = fileName;
    ZmDocsEditApp.fileInfo.content = this._editor.getContent();
    ZmDocsEditController.savedDoc = ZmDocsEditApp.fileInfo.content; 
    ZmDocsEditApp.fileInfo.contentType = ZmDocsEditApp.APP_ZIMBRA_DOC;

    this._docMgr.setSaveCallback(new AjxCallback(this, this._saveHandler));
    this._docMgr.saveDocument(ZmDocsEditApp.fileInfo);

};

ZmDocsEditView.prototype._saveHandler =
function(files, conflicts) {
    if(conflicts){
        var formatter = new AjxMessageFormat(ZmMsg.saveConflictDoc);
        appCtxt.setStatusMsg(formatter.format(files[0].name), ZmStatusView.LEVEL_WARNING);
    } else {
        if (files && files.length > 0) {
            this._editor.clearDirty();

            ZmDocsEditApp.fileInfo.id = files[0].id;
            ZmDocsEditApp.fileInfo.version = files[0].ver;

            var item = this.loadData(ZmDocsEditApp.fileInfo.id);
            if(item && !item.rest){    //TODO: Change this code to construct a rest url
                item.rest = ZmDocsEditApp.restUrl;
            }
            if(item != null) {
                ZmDocsEditApp.fileInfo = item;
                this.setFooterInfo(item);
            }

            if(this._saveClose){
                parentAppCtxt.setStatusMsg(ZmMsg.savedDoc, ZmStatusView.LEVEL_INFO);
                window.close();
            } else {
                appCtxt.setStatusMsg(ZmMsg.savedDoc, ZmStatusView.LEVEL_INFO);
            }
        }
    }

};

ZmDocsEditView.prototype.setFooterInfo = function(item){

    if(!this._locationEl) return;

	var content;
	var rootId = ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT);
    
	if (item.folderId == rootId) {
		content = appCtxt.getById(item.folderId).name;
	}else {
		var separator = "&nbsp;&raquo;&nbsp;";
		var a = [ ];
		var folderId = item.folderId;
		while ((folderId != null) && (folderId != rootId)) {
            var wAppCtxt = null;
            if(window.isRestView) {
               wAppCtxt = top.appCtxt;
            } else {
               wAppCtxt = window.opener && window.opener.appCtxt;
            }
            var docs = wAppCtxt && wAppCtxt.getById(folderId);
            if(!docs) {
                break;
            }
            
            a.unshift(docs.name);

            if(!docs.parent) {
                break;
            }

            folderId = docs.parent.id;
			if (folderId != rootId) {
				a.unshift(separator);
			}

        }
		content = a.join("");
	}

	this._locationEl.innerHTML = content;
	this._versionEl.innerHTML = (item.version ? item.version : "");
	this._authorEl.innerHTML = (item.creator ? item.creator : "");
	this._modifiedEl.innerHTML = (item.createDate ? item.createDate : "");
};


ZmDocsEditView.prototype.loadData =
function(id) {
    return this._docMgr.getItemInfo({id:id});
};

ZmDocsEditView.prototype.loadDoc =
function(item) {
    var content =
		this._docMgr.fetchDocumentContent(item) || "<br/>";

    if(this._editor) {
        this._editor.setContent(content);
    } else {
		this.setPendingContent(content);
    }
};

ZmDocsEditView.prototype.setPendingContent =
function(content) {
	this._pendingContent = content;
};

ZmDocsEditView.prototype.getPendingContent =
function() {
	return this._pendingContent;
};

ZmDocsEditView.prototype.onLoadContent =
function() {
	var pendingContent = this.getPendingContent();
	if (pendingContent != null) {
		var ed = this.getEditor();
		ed.setContent(pendingContent, {format: "raw"});
		this.setPendingContent(null);
	}
};

ZmDocsEditView.prototype.onEditorLoad =
function(editor) {
	setTimeout(this._resetSize.bind(this), 0);
};

ZmDocsEditView.prototype._controlListener =
function() {
	this._resetSize();
};
    
ZmDocsEditView.prototype._resetSize =
function() {
	var bounds = this.getInsetBounds();

	bounds.height -= this._toolbar.getSize().y + Dwt.getSize(this._footerEl).y;

	this._editor.setSize(bounds.width, bounds.height);
};


ZmDocsEditView.prototype._initialize = function() {
	var className = this.getClassName();
	var id = this.getHTMLElId();
	var data = {
		headerId: id + '_header',
		mainId: id + '_main',
		footerId: id + '_footer',

		locationId: id + '_location',
		versionId: id + '_version',
		authorId: id + '_author',
		modifiedId: id + '_modified'
	};

	this._createHtmlFromTemplate(this.TEMPLATE, data);

    var toolbar = this._toolbar = new DwtToolBar({parent:this, parentElement: data.headerId, className:"ZDToolBar", cellSpacing:2, posStyle:DwtControl.RELATIVE_STYLE});
    this._createToolbar(toolbar);

    var editor = this._editor = new ZmHtmlEditor({
		parent: this,
		parentElement: data.mainId,
		content: '',
		initCallback: this._controlListener.bind(this),
		mode: Dwt.HTML
        });
	editor.addOnContentInitializedListener(this.onLoadContent.bind(this));

	this._locationEl = document.getElementById(data.locationId);
	this._versionEl = document.getElementById(data.versionId);
	this._authorEl = document.getElementById(data.authorId);
	this._modifiedEl = document.getElementById(data.modifiedId);
	this._footerEl = document.getElementById(data.footerId);
};

ZmDocsEditView.prototype._stealFocus =
function(iFrameId) {
	if(AjxEnv.isFirefox3up) {
		var iframe = document.getElementById(iFrameId);
		if (iframe) {
			iframe.blur();
			iframe.focus();
		}
	}
}

ZmDocsEditView.prototype._saveButtonListener = function(ev) {
    this._saveClose = false;
    this.save();
};

ZmDocsEditView.prototype._saveCloseButtonListener = function(ev) {
    this._saveClose = true;
    this.save();
};

ZmDocsEditView.prototype._insertDocElements = function(ev) {

    var action = ev.item.getData(ZmDocsEditView.ZD_VALUE);

    var doc = this._editor._getIframeDoc();
    var spanEl = doc.createElement("span");

    if(action == "DocElement2") {
        spanEl.innerHTML = '<table width="90%" cellspacing="1" cellpadding="3" align="center" style="border:1px solid rgb(0,0,0);"><tbody><tr height="40"><td style="background-color: rgb(204, 0, 0);"><br/></td></tr><tr><td><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/>' +
                            '<br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><div _moz_dirty="" style="margin-left: 80px;">' +
                            '<font size="7" _moz_dirty="">[ Document Title ]</font><br _moz_dirty=""/><font size="3" _moz_dirty="" style="color: rgb(192, 192, 192);">&nbsp;[ Sub Title]</font><br _moz_dirty=""/></div><br _moz_dirty=""/>' +
                            '<br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/>' +
                            '<br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><div _moz_dirty="" style="margin-left: 76%;">&nbsp;' +
                            '<img src="http://www.zimbra.com/_media/logos/zimbra_logo.gif" alt="http://www.zimbra.com/_media/logos/zimbra_logo.gif" _moz_dirty="" style="width: 211px; height: 101px;"/>' +
                            '<br _moz_dirty=""/></div><br _moz_dirty=""/><br _moz_dirty=""/></td></tr></tbody></table>';

    } else if(action == "DocElement3") {

        spanEl.innerHTML = '<table width="90%" cellspacing="1" cellpadding="3" align="center"><tbody><tr><td style="border: 1px solid rgb(0, 0, 0);"><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/>' +
                            '<br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><div _moz_dirty="" style="margin-left: 80px;">' +
                            '<font size="7" _moz_dirty="">[ Document Title ]</font><br _moz_dirty=""/><font size="3" _moz_dirty="" style="color: rgb(192, 192, 192);">&nbsp;[ Sub Title]</font><br _moz_dirty=""/></div><br _moz_dirty=""/>' +
                            '<br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/>' +
                            '<br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><div _moz_dirty="" style="margin-left: 80%;">&nbsp;' +
                            '<img src="http://yhoo.client.shareholder.com/press/images/yahoobang-small.gif" alt="http://yhoo.client.shareholder.com/press/images/yahoobang-small.gif" _moz_dirty="" style="width: 156px; height: 91px;"/>' +
                            '<br _moz_dirty=""/></div><br _moz_dirty=""/><br _moz_dirty=""/></td></tr></tbody></table>';

    }

    var p = doc.createElement("br");
    var df = doc.createDocumentFragment();
    df.appendChild(p);
    df.appendChild(spanEl.getElementsByTagName("table")[0]);
    df.appendChild(p.cloneNode(true));

    this._editor._insertNodeAtSelection(df);

};

ZmDocsEditView.prototype._createToolbar = function(toolbar) {

    var params = {parent:toolbar};

    b = this._buttons.fileName = new DwtInputField({parent:toolbar, size:20});    
    
    var b = this._buttons.saveFile = new DwtToolBarButton(params);
    b.setImage("Save");
    b.setText(ZmMsg.save);
    b.setData(ZmDocsEditView.ZD_VALUE, "Save");
    b.addSelectionListener(new AjxListener(this, this._saveButtonListener));
    b.setToolTipContent(ZmMsg.save);

    new DwtControl({parent:toolbar, className:"vertSep"});

    var b = this._buttons.saveAndCloseFile = new DwtToolBarButton(params);
    b.setImage("Save");
    b.setText(ZmMsg.saveClose);
    b.setData(ZmDocsEditView.ZD_VALUE, "Save&Close");
    b.addSelectionListener(new AjxListener(this, this._saveCloseButtonListener));
    b.setToolTipContent(ZmMsg.saveClose);

    toolbar.addFiller();

    b = new DwtComposite({parent:toolbar});
    b.setContent([
        "<div style='white-space: nowrap; padding-right:10px;'>",
            "<input type='checkbox' name='enableDesc' id='enableDesc' value='enableVersions'>",
            "&nbsp; <label class='ZmFieldLabelRight' for='enableDesc'>",
                ZmMsg.enableVersionNotes,
            "</label>",
        "</div>"
    ].join(''));

    /* var listener = new AjxListener(this, this._tbActionListener);


    new DwtControl({parent:toolbar, className:"vertSep"});

    b = this._buttons.clipboardCopy = new DwtToolBarButton(params);
	b.setImage("Copy");
	b.setData(ZmDocsEditView.ZD_VALUE, "ClipboardCopy");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.copy);

	b = this._buttons.clipboardCut = new DwtToolBarButton(params);
	b.setImage("Cut");
	b.setData(ZmDocsEditView.ZD_VALUE, "ClipboardCut");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.cut);

	b = this._buttons.clipboardPaste = new DwtToolBarButton(params);
	b.setImage("Paste");
	b.setData(ZmDocsEditView.ZD_VALUE, "ClipboardPaste");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.paste);

    new DwtControl({parent:toolbar, className:"vertSep"});

    b = this._buttons.newDocument = new DwtToolBarButton(params);
    b.setText(ZmMsg.newDocument);
    b.setImage("Doc");
    b.setData(ZmDocsEditView.ZD_VALUE, "NewDocument");
    b.addSelectionListener(listener);
    b.setToolTipContent(ZmMsg.briefcaseCreateNewDocument);


    b = this._buttons.clipboardPaste = new DwtToolBarButton(params);
    b.setText("Open Document");
    b.setData(ZmDocsEditView.ZD_VALUE, "OpenDocument");
    b.addSelectionListener(listener);
    b.setToolTipContent(ZmMsg.paste);
    */
    
};

ZmDocsEditView.prototype._getVersionNotesChk =
function(){
    if(!this._verNotesChk){
        this._verNotesChk = document.getElementById('enableDesc');
    }
    return this._verNotesChk;
}

ZmDocsEditView.prototype.enableVersionNotes =
function(enable){
    this._getVersionNotesChk().checked = !!enable;
};


ZmDocsEditView.prototype._pushIframeContent =
function(iframeN) {

    if(!iframeN) return;
    var iContentWindow = iframeN.contentWindow;
    var doc = iContentWindow ? iContentWindow.document : null;
    if(doc) {
        doc.open();
        var html = [];
        html.push('<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">');
        html.push('<html>');
        html.push('<body><br _moz_dirty=""/></body>');
        html.push('</html>');
        doc.write(html.join(""));
        doc.close();
        iContentWindow.focus();
    }
};
