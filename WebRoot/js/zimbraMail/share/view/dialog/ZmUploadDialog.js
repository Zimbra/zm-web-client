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

ZmUploadDialog.prototype.getNotes =
function(){
    return (this._notes ? this._notes.value : "");
};

ZmUploadDialog.prototype.setNotes =
function(notes){
    if(this._notes){
        this._notes.value = (notes || "");
    }
};

ZmUploadDialog.prototype.popup =
function(folder, callback, title, loc, oneFileOnly, noResolveAction, showNotes, isImage) {
	this._uploadFolder = folder;
	this._uploadCallback = callback;

    this._supportsHTML5 = AjxEnv.supportsHTML5File && !this._showLinkTitleText && (appCtxt.get(ZmSetting.DOCUMENT_SIZE_LIMIT) != null);

	this.setTitle(title || ZmMsg.uploadDocs);

	// reset input fields
	var table = this._tableEl;
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
        if(oneFileOnly && isImage){
            labelEl.innerHTML = ZmMsg.uploadChooseImage;
            Dwt.setVisible(labelEl, true);
        }
        else{
            labelEl.innerHTML = ZmMsg.uploadChoose;
            Dwt.setVisible(labelEl, !oneFileOnly);
        }
    }
    var actionRowEl = document.getElementById(id+"_actionRow");
	if (actionRowEl) {
		Dwt.setVisible(actionRowEl, !noResolveAction);
	}

    var notesEl = document.getElementById(id+"_notesTD");
	if (notesEl) {
		Dwt.setVisible(notesEl, showNotes);
	}
    // In case of a single file upload show proper info message

    var docSizeInfo = document.getElementById((id+"_info"));
    var attSize = AjxUtil.formatSize(appCtxt.get(ZmSetting.DOCUMENT_SIZE_LIMIT) || 0, true);
        if(docSizeInfo){
            if(oneFileOnly){
                docSizeInfo.innerHTML = AjxMessageFormat.format(ZmMsg.attachmentLimitMsgSingleFile, attSize);
            }
            else{
                docSizeInfo.innerHTML = AjxMessageFormat.format(ZmMsg.attachmentLimitMsg, attSize);
            }
        }


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

    //Cleanup
    this._enableStatus = false;

    this._notes.removeAttribute("disabled");
    this.setNotes("");
    this._msgInfo.innerHTML = "";
    
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
	var form = this._uploadForm;
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
        var notes = this.getNotes();
        if(this._supportsHTML5){
            if(this._validateSize()){
                var f = element.files; 
                for(var j=0; j<f.length; j++){
                    files.push({name:f[j].name, fullname: f[j].name, notes: notes});
                }
            }else{
                this._msgInfo.innerHTML = AjxMessageFormat.format(ZmMsg.attachmentSizeError, AjxUtil.formatSize(appCtxt.get(ZmSetting.DOCUMENT_SIZE_LIMIT)));;
                return;
            }
        }else{
            var file = {
                fullname: element.value,
                name: element.value.replace(/^.*[\\\/:]/, ""),
                notes: notes
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
	var uploadMgr = appCtxt.getUploadManager();
	window._uploadManager = uploadMgr;
	try {
		uploadMgr.execute(callback, this._uploadForm);
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
    var request = [];
    var foundOne = false;
	for (var i = 0; i < files.length; i++) {
         var file = files[i];
		if (file.done) { continue; }
		foundOne = true;

        var  SaveDocumentRequest = {
            _jsns: "urn:zimbraMail",
            requestId: i,
            doc: {}
        }

        var doc = SaveDocumentRequest.doc;
        if(file.id){
            doc.id = file.id;
            doc.ver = file.version;
        }else{
            doc.l = this._uploadFolder.id;
        }
        if(file.notes){
            doc.desc = file.notes;
        }
        doc.upload = {
            id: file.guid
        }
        request.push(SaveDocumentRequest);
    }

    if (foundOne) {
        var json = {
            BatchRequest: {
                _jsns: "urn:zimbra",
                onerror: "continue",
                SaveDocumentRequest: ( (request.length == 1) ? request[0] : request )
            }
        };
		var callback = new AjxCallback(this, this._uploadSaveDocsResponse, [ files, status, guids ]);
		var params = {
			jsonObj: json,
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
            files[saveDocResp.requestId].version   = saveDocResp.doc[0].ver;
		}
	}

	// check for conflicts
	var conflicts = [];
	if (resp && resp.Fault) {
		var errors = [], mailboxQuotaExceeded=false, isItemLocked=false;
		for (var i = 0; i < resp.Fault.length; i++) {
			var fault = resp.Fault[i];
			var error = fault.Detail.Error;
			var code = error.Code;
			var attrs = error.a;
            isItemLocked = (code==ZmCsfeException.LOCKED);
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
        else if(isItemLocked){
            this._popupErrorDialog(ZmMsg.errorItemLocked);
            return;
        }
        else if(code==ZmCsfeException.SVC_PERM_DENIED){
            this._popupErrorDialog(ZmMsg.errorPermissionDenied);
            this.popdown();
            return;
        }
	}

	// dismiss dialog
	this.popdown();

	// resolve conflicts
	var conflictCount = conflicts.length;
	var action = this._conflictAction || this._selector.getValue();
	if (conflictCount > 0 && action == ZmUploadDialog.ACTION_ASK) {
        var dialog = appCtxt.getUploadConflictDialog();
		dialog.popup(this._uploadFolder, conflicts,
                             new AjxCallback(this, this._uploadSaveDocs2, [ files, status, guids ]));
    }

	// keep mine
	else if (conflictCount > 0 && action == ZmUploadDialog.ACTION_KEEP_MINE) {
        if(this._conflictAction){
            this._shieldSaveDocs(files, status, guids);
        }else{
		    this._uploadSaveDocs2(files, status, guids);
        }
	}
	// perform callback
	else if (this._uploadCallback) {
		this._finishUpload(files, status, guids);
	}else{
        this._conflictAction = null;
    }
};

ZmUploadDialog.prototype._shieldSaveDocs =
function(files, status, guids){
    var dlg = appCtxt.getYesNoMsgDialog();
    dlg.reset();
    dlg.setButtonListener(DwtDialog.YES_BUTTON, new AjxListener(this, this._shieldSaveDocsYesCallback, [dlg, files, status, guids]));
    dlg.setMessage(ZmMsg.uploadConflictShield, DwtMessageDialog.WARNING_STYLE, ZmMsg.uploadConflict);
    dlg.popup();
};

ZmUploadDialog.prototype._shieldSaveDocsYesCallback =
function(dlg, files, status, guids){
    this._uploadSaveDocs2(files, status, guids);
    dlg.popdown();
};

ZmUploadDialog.prototype.setConflictAction =
function(conflictAction){
     this._conflictAction = conflictAction;
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
    this._conflictAction = null;
};

ZmUploadDialog.prototype._addFileInputRow = function(oneInputOnly) {
	var id = Dwt.getNextId();
	var inputId = id + "_input";
	var removeId = id + "_remove";
	var addId = id + "_add";
    var sizeId = id + "_size";

	var table = this._tableEl;
	var row = table.insertRow(-1);

    var cellLabel = row.insertCell(-1);
    cellLabel.innerHTML = ZmMsg.fileLabel;

	var cell = row.insertCell(-1);
	// bug:53841 allow only one file upload when oneInputOnly is set
	cell.innerHTML = [
		"<input id='",inputId,"' type='file' name='",ZmUploadDialog.UPLOAD_FIELD_NAME,"' size=30 ",(this._supportsHTML5 ? (oneInputOnly ? "" : "multiple") : ""),">"
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
    		"<input id='",txtInputId,"' type='text' name='",ZmUploadDialog.UPLOAD_TITLE_FIELD_NAME,"' size=40>"
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
    var uri = appCtxt.get(ZmSetting.CSFE_UPLOAD_URI);

    var subs = {
        id: id,
        uri: uri
    };
    this.setContent(AjxTemplate.expand("share.Dialogs#UploadDialog", subs));

    //variables
    this._uploadForm = document.getElementById((id+"_form"));
    this._tableEl = document.getElementById((id + "_table"));
    this._msgInfo = document.getElementById((id+"_msg"));
    this._notes = document.getElementById((id+"_notes"));


    //Conflict Selector
    this._selector = new DwtSelect({parent:this});
	this._selector.addOption(ZmMsg.uploadActionKeepMine, false, ZmUploadDialog.ACTION_KEEP_MINE);
	this._selector.addOption(ZmMsg.uploadActionKeepTheirs, false, ZmUploadDialog.ACTION_KEEP_THEIRS);
	this._selector.addOption(ZmMsg.uploadActionAsk, true, ZmUploadDialog.ACTION_ASK);
    this._selector.reparentHtmlElement((id+"_conflict"));
    
    //Info Section
    var docSizeInfo = document.getElementById((id+"_info"));
    if(docSizeInfo){
        var attSize = AjxUtil.formatSize(appCtxt.get(ZmSetting.DOCUMENT_SIZE_LIMIT) || 0, true)
        docSizeInfo.innerHTML = AjxMessageFormat.format(ZmMsg.attachmentLimitMsg, attSize);
    }
    	
};
