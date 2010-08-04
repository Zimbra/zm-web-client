/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * Creates an upload dialog.
 * @class
 * This class represents an upload dialog.
 * 
 * @param	{DwtComposite}	shell		the parent
 * @param	{String}	className		the class name
 *  
 * @extends		DwtDialog
 */
ZmUploadDialog = function(shell, className) {
	className = className || "ZmUploadDialog";
	var title = ZmMsg.uploadDocs;
	DwtDialog.call(this, {parent:shell, className:className, title:title});
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._upload));
	this._createUploadHtml();
    this._showLinkTitleText = false;
    this._linkText = {};
}

ZmUploadDialog.prototype = new DwtDialog;
ZmUploadDialog.prototype.constructor = ZmUploadDialog;

// Constants

ZmUploadDialog.ACTION_KEEP_MINE = "mine";
ZmUploadDialog.ACTION_KEEP_THEIRS = "theirs";
ZmUploadDialog.ACTION_ASK = "ask";

ZmUploadDialog.UPLOAD_FIELD_NAME = "uploadFile";
ZmUploadDialog.UPLOAD_TITLE_FIELD_NAME = "uploadFileTitle";

// Data

ZmUploadDialog.prototype._formId;
ZmUploadDialog.prototype._tableId;

ZmUploadDialog.prototype._selector;

ZmUploadDialog.prototype._uploadFolder;
ZmUploadDialog.prototype._uploadCallback;

ZmUploadDialog.prototype._extensions;

// Public methods
/**
 * Enables the link title option.
 * 
 * @param	{Boolean}	enabled		if <code>true</code>, to enbled the link title option
 */
ZmUploadDialog.prototype.enableLinkTitleOption =
function(enabled) {
    this._showLinkTitleText = enabled;    
};

/**
 * Sets allowed extensions.
 * 
 * @param	{Array}		array		an array of extensions
 */
ZmUploadDialog.prototype.setAllowedExtensions =
function(array) {
	this._extensions = array;
	if (array) {
		for (var i = 0; i < array.length; i++) {
			array[i] = array[i].toUpperCase();
		}
	}
};

ZmUploadDialog.prototype.popup =
function(folder, callback, title, loc, oneFileOnly, noResolveAction) {
	this._uploadFolder = folder;
	this._uploadCallback = callback;

    this._supportsHTML5 = AjxEnv.supportsHTML5File && !this._showLinkTitleText && (appCtxt.get(ZmSetting.DOCUMENT_SIZE_LIMIT) != null);

	this.setTitle(title || ZmMsg.uploadDocs);

	// reset input fields
	var table = document.getElementById(this._tableId);
	var rows = table.rows;
	while (rows.length) {
		table.deleteRow(rows.length - 1);
	}
	this._addFileInputRow(oneFileOnly);

	// enable buttons
	this.setButtonEnabled(DwtDialog.OK_BUTTON, true);
	this.setButtonEnabled(DwtDialog.CANCEL_BUTTON, true);

	// hide/show elements
	var id = this._htmlElId;
	var labelEl = document.getElementById(id+"_label");
	if (labelEl) {
		Dwt.setVisible(labelEl, !oneFileOnly);
	}
	var actionRowEl = document.getElementById(id+"_actionRow");
	if (actionRowEl) {
		Dwt.setVisible(actionRowEl, !noResolveAction);
	}

    this._msgInfo.innerHTML = "";

	// show
	DwtDialog.prototype.popup.call(this, loc);
};

ZmUploadDialog.prototype.popdown =
function() {
	/***
	// NOTE: Do NOT set these values to null! The conflict dialog will
	//       call back to this dialog after it's hidden to process the
	//       files that should be replaced.
	this._uploadFolder = null;
	this._uploadCallback = null;
	/***/
	this._extensions = null;
	DwtDialog.prototype.popdown.call(this);
};

//to give explicitly the uploadForm, files to upload and folderId used for breifcase
ZmUploadDialog.prototype.uploadFiles =
function(files,uploadForm,folder) {

    if (files.length == 0) {
		return;
	}
    this._uploadFolder = folder;
    var callback = new AjxCallback(this, this._uploadSaveDocs, [files]);

    var uploadMgr = appCtxt.getUploadManager();
	  window._uploadManager = uploadMgr;

    try {
		uploadMgr.execute(callback, uploadForm);
	} catch (ex) {
		if (ex.msg) {
			this._popupErrorDialog(ex.msg);
		} else {
			this._popupErrorDialog(ZmMsg.unknownError);
		}
	}
};

// Protected methods
ZmUploadDialog.prototype._upload = function(){
	var form = document.getElementById(this._formId);
	var files = [];
    this._linkText = {};
	var elements = form.elements;
	for (var i = 0; i < elements.length; i++) {
		var element = form.elements[i];
		if (element.name != ZmUploadDialog.UPLOAD_FIELD_NAME) continue;
		if (!element.value) continue;
		if (!this._checkExtension(element.value)) {
			var params = [ this._extensions.join(", ") ];
			var message = AjxMessageFormat.format(ZmMsg.errorNotAllowedFile, params);
			this._popupErrorDialog(message);
			return;
		}
        this._msgInfo.innerHTML = "";
        if(this._supportsHTML5){
            if(this._validateSize()){
                var f = element.files; 
                for(var j=0; j<f.length; j++){
                    files.push({name:f[j].name, fullname: f[j].name});
                }
            }else{
                this._msgInfo.innerHTML = AjxMessageFormat.format(ZmMsg.attachmentSizeError, AjxUtil.formatSize(appCtxt.get(ZmSetting.DOCUMENT_SIZE_LIMIT)));;
                return;
            }
        }else{
            var file = {
                fullname: element.value,
                name: element.value.replace(/^.*[\\\/:]/, "")
            };
            files.push(file);
        }
        if(this._showLinkTitleText) {
            var id = element.id;
            id = id.replace("_input", "") + "_titleinput";
            var txtElement = document.getElementById(id);
            if(txtElement) {
                this._linkText[file.name] = txtElement.value;
            }
        }

	}
	if (files.length == 0) {
		return;
	}
    
	this.setButtonEnabled(DwtDialog.OK_BUTTON, false);
	this.setButtonEnabled(DwtDialog.CANCEL_BUTTON, false);

	var callback = new AjxCallback(this, this._uploadSaveDocs, [files]);
	var uploadForm = document.getElementById(this._formId);

	var uploadMgr = appCtxt.getUploadManager();
	window._uploadManager = uploadMgr;
	try {
		uploadMgr.execute(callback, uploadForm);
	} catch (ex) {
		if (ex.msg) {
			this._popupErrorDialog(ex.msg);
		} else {
			this._popupErrorDialog(ZmMsg.unknownError);
		}
	}
};

ZmUploadDialog.prototype._checkExtension = function(filename) {
	if (!this._extensions) return true;
	var ext = filename.replace(/^.*\./,"").toUpperCase();
	for (var i = 0; i < this._extensions.length; i++) {
		if (this._extensions[i] == ext) {
			return true;
		}
	}
	return false;
};

ZmUploadDialog.prototype._validateSize =
function(){

    var atts = document.getElementsByName(ZmUploadDialog.UPLOAD_FIELD_NAME);
    var file, size;
	for (var i = 0; i < atts.length; i++){
        file = atts[i].files;
        if(!file || file.length == 0) continue;
        for(var j=0; j<file.length;j++){
            var f = file[j];
            size = f.size || f.fileSize /*Safari*/;
            if(size > appCtxt.get(ZmSetting.DOCUMENT_SIZE_LIMIT)){
                return false;
            }
        }
    }
	return true;        
};

ZmUploadDialog.prototype._popupErrorDialog = function(message) {
	this.setButtonEnabled(DwtDialog.OK_BUTTON, true);
	this.setButtonEnabled(DwtDialog.CANCEL_BUTTON, true);

	var dialog = appCtxt.getMsgDialog();
	dialog.setMessage(message, DwtMessageDialog.CRITICAL_STYLE, this._title);
	dialog.popup();
};

ZmUploadDialog.prototype._uploadSaveDocs = function(files, status, guids) {
	if (status != AjxPost.SC_OK) {
		var message = AjxMessageFormat.format(ZmMsg.uploadError, status);
		if(status == '413') {
			message = ZmMsg.errorAttachmentTooBig;
		}
		this._popupErrorDialog(message);
	} else {
		guids = guids.split(",");
		for (var i = 0; i < files.length; i++) {
			DBG.println("guids["+i+"]: "+guids[i]+", files["+i+"]: "+files[i]);
			files[i].guid = guids[i];
		}
		if (this._uploadFolder) {
			this._uploadSaveDocs2(files, status, guids);
		}
		else {
			this._finishUpload(files, status, guids);
		}
	}
};

ZmUploadDialog.prototype._uploadSaveDocs2 =
function(files, status, guids) {
	// create document wrappers
	var soapDoc = AjxSoapDoc.create("BatchRequest", "urn:zimbra", null);
	soapDoc.setMethodAttribute("onerror", "continue");
	var foundOne = false;
	for (var i = 0; i < files.length; i++) {
		var file = files[i];
		if (file.done) { continue; }
		foundOne = true;

		var saveDocNode = soapDoc.set("SaveDocumentRequest", null, null, "urn:zimbraMail");
		saveDocNode.setAttribute("requestId", i);

		var docNode = soapDoc.set("doc", null, saveDocNode);
		if (file.id) {
			docNode.setAttribute("id", file.id);
			docNode.setAttribute("ver", file.version);
		}
		else {
			docNode.setAttribute("l", this._uploadFolder.id);
		}

		var uploadNode = soapDoc.set("upload", null, docNode);
		uploadNode.setAttribute("id", file.guid);
	}

	if (foundOne) {
		var callback = new AjxCallback(this, this._uploadSaveDocsResponse, [ files, status, guids ]);
		var params = {
			soapDoc:soapDoc,
			asyncMode:true,
			callback:callback
		};
		var appController = appCtxt.getAppController();
		appController.sendRequest(params);
	}
};

ZmUploadDialog.prototype._uploadSaveDocsResponse =
function(files, status, guids, response) {
	var resp = response && response._data && response._data.BatchResponse;

	// mark successful uploads
	if (resp && resp.SaveDocumentResponse) {
		for (var i = 0; i < resp.SaveDocumentResponse.length; i++) {
			var saveDocResp = resp.SaveDocumentResponse[i];
			files[saveDocResp.requestId].done = true;
			files[saveDocResp.requestId].name = saveDocResp.doc[0].name;
            files[saveDocResp.requestId].id   = saveDocResp.doc[0].id;
            files[saveDocResp.requestId].ver   = saveDocResp.doc[0].ver;
		}
	}

	// check for conflicts
	var conflicts = [];
	if (resp && resp.Fault) {
		var errors = [], mailboxQuotaExceeded=false;
		for (var i = 0; i < resp.Fault.length; i++) {
			var fault = resp.Fault[i];
			var error = fault.Detail.Error;
			var code = error.Code;
			var attrs = error.a;
			if (code == ZmCsfeException.MAIL_ALREADY_EXISTS ||
				code == ZmCsfeException.MODIFY_CONFLICT) {
				var file = files[fault.requestId];
				for (var p in attrs) {
					var attr = attrs[p];
					switch (attr.n) {
                        case "itemId" : { file.id = attr._content; break }
						case "id": { file.id = attr._content; break; }
						case "ver": { file.version = attr._content; break; }
						case "name": { file.name = attr._content; break; }
					}
				}
                file.version = file.version || 1;
				conflicts.push(file);
			}else {
				DBG.println("Unknown error occurred: "+code);
                if(code == ZmCsfeException.MAIL_QUOTA_EXCEEDED){
                    mailboxQuotaExceeded = true;
                }
				errors[fault.requestId] = fault;
			}
		}
		// TODO: What to do about other errors?
        if(mailboxQuotaExceeded){
            this._popupErrorDialog(ZmMsg.errorQuotaExceeded);
            return;
        }
	}

	// dismiss dialog
	this.popdown();

	// resolve conflicts
	var conflictCount = conflicts.length;
	var action = this._selector.getValue();
	if (conflictCount > 0 && action == ZmUploadDialog.ACTION_ASK) {
		var dialog = appCtxt.getUploadConflictDialog();
		dialog.popup(this._uploadFolder, conflicts,
                             new AjxCallback(this, this._uploadSaveDocs2, [ files, status, guids ]));
	}

	// keep mine
	else if (conflictCount > 0 && action == ZmUploadDialog.ACTION_KEEP_MINE) {
		this._uploadSaveDocs2(files, status, guids);
	}

	// perform callback
	else if (this._uploadCallback) {
		this._finishUpload(files, status, guids);
	}
};

ZmUploadDialog.prototype._finishUpload = function(files, status, guids) {
	var filenames = [];
	for (var i in files) {
        var name = files[i].name;
        if(this._linkText[name]) {
            files[i].linkText = this._linkText[name]; 
        }
		filenames.push(name);
	}
	this._uploadCallback.run(this._uploadFolder, filenames, files);
};

ZmUploadDialog.prototype._addFileInputRow = function(oneInputOnly) {
	var id = Dwt.getNextId();
	var inputId = id + "_input";
	var removeId = id + "_remove";
	var addId = id + "_add";
    var sizeId = id + "_size";

	var table = document.getElementById(this._tableId);
	var row = table.insertRow(-1);

    var cellLabel = row.insertCell(-1);
    cellLabel.innerHTML = ZmMsg.fileLabel;

	var cell = row.insertCell(-1);
	cell.innerHTML = [
		"<input id='",inputId,"' type='file' name='",ZmUploadDialog.UPLOAD_FIELD_NAME,"' size=30 ",(this._supportsHTML5 ? "multiple" : ""),">"
	].join("");

	var cell = row.insertCell(-1);
    cell.id = sizeId;
	cell.innerHTML = "&nbsp;";

    //HTML5
    if(this._supportsHTML5){
        var inputEl = document.getElementById(inputId);
        var sizeEl = cell;
        Dwt.setHandler(inputEl, "onchange", AjxCallback.simpleClosure(this._handleFileSize, this, inputEl, sizeEl));
    }

    if(oneInputOnly){
        cell.colSpan = 3;
    }else{    
        var cell = row.insertCell(-1);
        cell.innerHTML = [
            "<span ",
            "id='",removeId,"' ",
            "onmouseover='this.style.cursor=\"pointer\"' ",
            "onmouseout='this.style.cursor=\"default\"' ",
            "style='color:blue;text-decoration:underline;'",
            ">", ZmMsg.remove, "</span>"
        ].join("");
        var removeSpan = document.getElementById(removeId);
        Dwt.setHandler(removeSpan, DwtEvent.ONCLICK, ZmUploadDialog._removeHandler);

        var cell = row.insertCell(-1);
        cell.innerHTML = "&nbsp;";
        var cell = row.insertCell(-1);
        cell.innerHTML = [
            "<span ",
            "id='",addId,"' ",
            "onmouseover='this.style.cursor=\"pointer\"' ",
            "onmouseout='this.style.cursor=\"default\"' ",
            "style='color:blue;text-decoration:underline;'",
            ">", ZmMsg.add, "</span>"
        ].join("");
        var addSpan = document.getElementById(addId);
        Dwt.setHandler(addSpan, DwtEvent.ONCLICK, ZmUploadDialog._addHandler);
    }


    if(this._showLinkTitleText) {
        var txtInputId = id + "_titleinput";
        var txtRow = table.insertRow(-1);
        var txtCell = txtRow.insertCell(-1);
        txtCell.innerHTML = [
    		ZmMsg.linkTitleOptionalLabel
    	].join("");

        txtCell = txtRow.insertCell(-1);
	    txtCell.innerHTML = [
    		"<input id='",txtInputId,"' type='text' name='",ZmUploadDialog.UPLOAD_TITLE_FIELD_NAME,"' size=40>",
    	].join("");
        txtCell.colSpan = 3;
    }
};

ZmUploadDialog.prototype._handleFileSize =
function(inputEl, sizeEl){

    var files = inputEl.files;
    if(!files) return;

    var sizeStr = [], className, totalSize =0;
    for(var i=0; i<files.length;i++){
        var file = files[i];
        var size = file.size || file.fileSize /*Safari*/;
        if(size > appCtxt.get(ZmSetting.DOCUMENT_SIZE_LIMIT))
            className = "RedC";
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

ZmUploadDialog._removeHandler = function(event) {
	var span = DwtUiEvent.getTarget(event || window.event);
	var cell = span.parentNode;
	var row = cell.parentNode;

    var endRow = row;

    if(span.id) {
       var id = span.id;
       id = id.replace("_remove", "") + "_titleinput";
       var txtInput = document.getElementById(id);
       if(txtInput) {
           var txtCell = txtInput.parentNode;
           var txtRow = txtCell.parentNode;
           endRow = txtRow;
       }
    }
    
	if (row.previousSibling == null && endRow.nextSibling == null) {
		var comp = DwtControl.findControl(span);
		comp._addFileInputRow();
	}

    if(endRow != row) {
        endRow.parentNode.removeChild(endRow);
    }

	row.parentNode.removeChild(row);
};

ZmUploadDialog._addHandler = function(event) {
	var span = DwtUiEvent.getTarget(event || window.event);
	var comp = DwtControl.findControl(span);
	comp._addFileInputRow();
};

ZmUploadDialog.prototype._createUploadHtml = function() {
	var id = this._htmlElId;
	this._formId = id+"_form";
	this._tableId = id+"_table";

	this._selector = new DwtSelect({parent:this});
	this._selector.addOption(ZmMsg.uploadActionKeepMine, false, ZmUploadDialog.ACTION_KEEP_MINE);
	this._selector.addOption(ZmMsg.uploadActionKeepTheirs, false, ZmUploadDialog.ACTION_KEEP_THEIRS);
	this._selector.addOption(ZmMsg.uploadActionAsk, true, ZmUploadDialog.ACTION_ASK);

	var label = document.createElement("DIV");
	label.id = id+"_label";
	label.style.marginBottom = "0.5em";
	label.innerHTML = ZmMsg.uploadChoose;

	var container = document.createElement("DIV");
	/***
	container.style.position = "relative";
	container.style.height = "7em";
	container.style.overflow = "auto";
	/***/
	container.style.marginLeft = "1em";
	container.style.marginBottom = "0.5em";

	var uri = appCtxt.get(ZmSetting.CSFE_UPLOAD_URI);
	container.innerHTML = [
		"<form id='",this._formId,"' method='POST' action='",uri,"' enctype='multipart/form-data'>",
			"<table id='",this._tableId,"' cellspacing=4 cellpadding=3 border=0>",
			"</table>",
		"</form>"
	].join("");

	var table = document.createElement("TABLE");
	table.border = 0;
	table.cellPadding = 0;
	table.cellSpacing = 4;

	var row = table.insertRow(-1);
	row.id = id+"_actionRow";
	var cell = row.insertCell(-1);
	cell.innerHTML = ZmMsg.uploadAction;

	var cell = row.insertCell(-1);
	cell.appendChild(this._selector.getHtmlElement());

    var docSizeInfo = document.createElement("DIV");
    var attSize = AjxUtil.formatSize(appCtxt.get(ZmSetting.DOCUMENT_SIZE_LIMIT) || 0, true)
	docSizeInfo.innerHTML = AjxMessageFormat.format(ZmMsg.attachmentLimitMsg, attSize);

    var msgInfo = this._msgInfo = document.createElement("DIV");
    msgInfo.style.textAlign = "center";
	msgInfo.innerHTML = "";

	var element = this._getContentDiv();
	element.appendChild(label);
	element.appendChild(container);
	element.appendChild(table);
    element.appendChild(docSizeInfo);
    element.appendChild(msgInfo);
};
