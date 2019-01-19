/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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
	this._controller = null;

	this._inprogress = false;
}

ZmUploadDialog.prototype = new DwtDialog;
ZmUploadDialog.prototype.constructor = ZmUploadDialog;

// Constants

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

ZmUploadDialog.prototype.warnInProgress = function() {
	var msgDlg = appCtxt.getMsgDialog();
	msgDlg.setMessage(ZmMsg.uploadDisabledInProgress, DwtMessageDialog.WARNING_STYLE);
	msgDlg.popup();
}

ZmUploadDialog.prototype.popup =
function(controller, folder, callback, title, loc, oneFileOnly, noResolveAction, showNotes, isImage, conflictAction) {
	if (this._inprogress) {
		this.warnInProgress();
		return;
	}

	this._controller     = controller;
	this._uploadFolder   = folder;
	this._uploadCallback = callback;
	this._conflictAction = conflictAction;
	var aCtxt = ZmAppCtxt.handleWindowOpener();

    this._supportsHTML5 = AjxEnv.supportsHTML5File && !this._showLinkTitleText && (aCtxt.get(ZmSetting.DOCUMENT_SIZE_LIMIT) != null);

	this.setTitle(title || ZmMsg.uploadDocs);

	// reset input fields
	var table = this._tableEl;
	var rows = table.rows;
	while (rows.length) {
		table.deleteRow(rows.length - 1);
	}
	this._addFileInputRow(oneFileOnly);

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
    var attSize = AjxUtil.formatSize(aCtxt.get(ZmSetting.DOCUMENT_SIZE_LIMIT) || 0, true);
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
	this._conflictAction = null;
    
	DwtDialog.prototype.popdown.call(this);
};

ZmUploadDialog.prototype._popupErrorDialog = function(message) {
	var dialog = appCtxt.getMsgDialog();
	dialog.setMessage(message, DwtMessageDialog.CRITICAL_STYLE, this._title);
	dialog.popup();
};

//to give explicitly the uploadForm, files to upload and folderId used for briefcase
ZmUploadDialog.prototype.uploadFiles =
function(files, uploadForm, folder) {
	if (this._inprogress) {
		this.warnInProgress();
		return;
	}

    if (files.length == 0) {
		return;
	}
    this._uploadFolder = folder;

    var popDownCallback = this.popdown.bind(this);
    var uploadParams = {
        uploadFolder: folder,
        preResolveConflictCallback: popDownCallback,
        errorCallback: popDownCallback,
        finalCallback: this._finishUpload.bind(this),
        docFiles: files
    }

	var aCtxt = appCtxt.isChildWindow ? parentAppCtxt : appCtxt;
	var briefcaseApp = aCtxt.getApp(ZmApp.BRIEFCASE);
    var callback =  briefcaseApp.uploadSaveDocs.bind(briefcaseApp, null, uploadParams);

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

ZmUploadDialog.prototype.setFileExtensions = function(){
    var extensionsData = appCtxt.getSettings().getInfoResponse.attrs._attrs.zimbraFeatureBriefcaseAllowedFileExtensions;
    var extensionArray;
    if (extensionsData) extensionArray = extensionsData.split(',');
    this.setAllowedExtensions(extensionArray);
}

// Protected methods
ZmUploadDialog.prototype._upload = function(){
    var form         	= this._uploadForm;
    var uploadFiles  	= [];
    var errors       	= [];
    this._linkText   	= {};
    var aCtxt        	= ZmAppCtxt.handleWindowOpener();
    var maxSize      	=  aCtxt.get(ZmSetting.DOCUMENT_SIZE_LIMIT);
    var elements     	= form.elements;
    var notes           = this.getNotes();
	var fileObj 		= [];
	var zmUploadManager = appCtxt.getZmUploadManager();
	var file;
    var msgFormat;
    var errorFilenames;
	var newError;
    this.setFileExtensions();

    var setLinkTitleText = (function(){
        if (this._showLinkTitleText) {
            var id = element.id;
            id = id.replace("_input", "") + "_titleinput";
            var txtElement = document.getElementById(id);
            if (txtElement) {
                this._linkText[file.name] = txtElement.value;
            }
        }
    }).bind(this);

    var postUpload = (function(){
        if (errors.length > 0) {
            this._msgInfo.innerHTML = zmUploadManager.createUploadErrorMsg(errors, maxSize, "<br>");
        } else if (uploadFiles.length > 0) {
            var briefcaseApp = aCtxt.getApp(ZmApp.BRIEFCASE);
            var shutDownCallback = null;
            var uploadButton = null;
            if (this._controller == null) {
                shutDownCallback = this.popdown.bind(this);
            } else {
                var toolbar = this._controller.getCurrentToolbar();
                if (toolbar) {
                    uploadButton = toolbar.getOp(ZmOperation.NEW_FILE);
                }
                this.popdown();
                shutDownCallback = this._enableUpload.bind(this, uploadButton);
            }
            var uploadParams = {
                attachment: false,
                files: fileObj,
                notes: notes,
                allResponses: null,
                start: 0,
                uploadFolder: this._uploadFolder,
                completeAllCallback: briefcaseApp.uploadSaveDocs.bind(briefcaseApp),
                conflictAction: this._conflictAction || this._selector.getValue(),
                preResolveConflictCallback: shutDownCallback,
                errorCallback: shutDownCallback,
                completeDocSaveCallback: this._finishUpload.bind(this, uploadButton),
                docFiles: uploadFiles
            }
            uploadParams.progressCallback = this._uploadFileProgress.bind(this, uploadButton, uploadParams);

            try {
                if (this._supportsHTML5) {
                    zmUploadManager.upload(uploadParams);
                } else {
                    var callback = briefcaseApp.uploadSaveDocs.bind(briefcaseApp, null, uploadParams);
                    var uploadMgr = appCtxt.getUploadManager();
                    window._uploadManager = uploadMgr;
                    uploadMgr.execute(callback, this._uploadForm);
                }

                if (uploadButton) {
                    // The 16x16 upload image has ImgUpload0 (no fill) .. ImgUpload12 (completely filled) variants to give a
                    // gross idea of the progress.
                    ZmToolBar._setButtonStyle(uploadButton, null, ZmMsg.uploading, "Upload0");
                    this._inprogress = true;
                }
            } catch (ex) {
                this._enableUpload(uploadButton);
                if (ex.msg) {
                    this._popupErrorDialog(ex.msg);
                } else {
                    this._popupErrorDialog(ZmMsg.unknownError);
                }
            }
        }
    }).bind(this);

    var fileElements = [];

    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        if ((element.name != ZmUploadDialog.UPLOAD_FIELD_NAME) || !element.value)  continue;        
        fileElements.push(elements[i]);
    }

    for (var i = 0; i < fileElements.length; i++) {
        var element = fileElements[i];
        this._msgInfo.innerHTML = "";

        if(this._supportsHTML5){
            var files = element.files;
            for (var j = 0; j < files.length; j++){
                file = files[j];
                fileObj.push(file);
                (function (i, j) {
                    zmUploadManager.getErrorsAsync(file, maxSize, null, this._extensions, (function (newError) {
                        if (newError) {
                            errors.push(newError);
                        } else {
                            uploadFiles.push({ name: file.name, fullname: file.name, notes: notes });
                        }
                        if (((j + 1) === files.length)) {
                            setLinkTitleText();
                        }

                        if ((i + 1) === elements.length) {
                            postUpload();
                        }
                    }).bind(this))

                }).bind(this)(i, j);
            }
        } else {
			var fileName = element.value.replace(/^.*[\\\/:]/, "");
            file = { name: fileName };
            (function (i) {
                zmUploadManager.getErrorsAsync(file, maxSize, null, this._extensions, (function (newError) {
                    if (newError) {
                        errors.push(newError);
                    } else {
                        uploadFiles.push({ name: file.name, fullname: file.name, notes: notes });
                    }
                    setLinkTitleText();
                    if ((i + 1) === elements.length) {
                        postUpload();
                    }
                }).bind(this));
            }).bind(this)(i);
        }
    }
};

ZmUploadDialog.prototype._uploadFileProgress =
	function(uploadButton, params, progress) {
		if (!uploadButton || !params || !progress.lengthComputable || !params.totalSize) return;

		// The 16x16 upload image has ImgUpload0 (no fill) .. ImgUpload12 (completely filled) variants to give a
		// gross idea of the progress.  A tooltip indicating the progress will be added too.
		var progressFraction = (progress.loaded / progress.total);
		var uploadedSize = params.uploadedSize + (params.currentFileSize * progressFraction);
		var fractionUploaded = uploadedSize/params.totalSize;
		if (fractionUploaded > 1) {
			fractionUploaded = 1;
		}
		var progressBucket = Math.round(fractionUploaded * 12);
		DBG.println(AjxDebug.DBG3,"Upload Progress: total=" + params.totalSize + ", uploadedSize=" + params.uploadedSize +
					", currentSize="+ params.currentFileSize + ", progressFraction=" +
					progressFraction + ", fractionUploaded=" + fractionUploaded + ", progressBucket=" + progressBucket);
		ZmToolBar._setButtonStyle(uploadButton, null, ZmMsg.uploadNewFile, "Upload" + progressBucket.toString());

		var tooltip = AjxMessageFormat.format(ZmMsg.uploadPercentComplete, [ Math.round(fractionUploaded * 100) ] )
		uploadButton.setToolTipContent(tooltip, true);
	};

ZmUploadDialog.prototype._enableUpload = function(uploadButton) {
	if (!uploadButton) return;

	ZmToolBar._setButtonStyle(uploadButton, null, ZmMsg.uploadNewFile, null);
	uploadButton.setToolTipContent(ZmMsg.uploadNewFile, true);
	this._inprogress = false;
};

ZmUploadDialog.prototype._finishUpload = function(uploadButton, docFiles, uploadFolder) {
    var filenames = [];
    for (var i in docFiles) {
        var name = docFiles[i].name;
        if(this._linkText[name]) {
            docFiles[i].linkText = this._linkText[name];
        }
        filenames.push(name);
    }
	this._enableUpload(uploadButton);

    this._uploadCallback.run(uploadFolder, filenames, docFiles);
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
        var size = file.size || file.fileSize /*Safari*/ || 0;
	    var aCtxt = ZmAppCtxt.handleWindowOpener();
        if(size > aCtxt.get(ZmSetting.DOCUMENT_SIZE_LIMIT))
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
	var aCtxt = ZmAppCtxt.handleWindowOpener();
    var uri = aCtxt.get(ZmSetting.CSFE_UPLOAD_URI);

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
	this._selector.addOption(ZmMsg.uploadActionKeepMine, false, ZmBriefcaseApp.ACTION_KEEP_MINE);
	this._selector.addOption(ZmMsg.uploadActionKeepTheirs, false, ZmBriefcaseApp.ACTION_KEEP_THEIRS);
	this._selector.addOption(ZmMsg.uploadActionAsk, true, ZmBriefcaseApp.ACTION_ASK);
	this._selector.reparentHtmlElement((id+"_conflict"));
    
    //Info Section
    var docSizeInfo = document.getElementById((id+"_info"));
    if(docSizeInfo){
        var attSize = AjxUtil.formatSize(aCtxt.get(ZmSetting.DOCUMENT_SIZE_LIMIT) || 0, true)
        docSizeInfo.innerHTML = AjxMessageFormat.format(ZmMsg.attachmentLimitMsg, attSize);
    }
    	
};
