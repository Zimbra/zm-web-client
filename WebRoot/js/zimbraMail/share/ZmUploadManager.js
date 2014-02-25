/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013 Zimbra Software, LLC.
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * Provides a framework for uploading multiple files; the callbacks allow the upload to be stored as an
 * attachment or saved document.
 *
 * The default behaviour is to save as a document (for the briefcase).  This will trigger the conflict checking
 * and resolution.
 */

/**
 * Creates the ZmUploadManager
 * @class
 * This class represents the file uploading, with document creation
 *
 */
ZmUploadManager = function() {
};


ZmUploadManager.prototype.constructor = ZmUploadManager;

/**
 * Returns a string representation of the object.
 *
 * @return		{String}		a string representation of the object
 */
ZmUploadManager.prototype.toString =
function() {
    return "ZmUploadManager";
};

// Constants

//ZmUploadManager.ACTION_KEEP_MINE = "mine";
//ZmUploadManager.ACTION_KEEP_THEIRS = "theirs";
//ZmUploadManager.ACTION_ASK = "ask";

ZmUploadManager.ERROR_INVALID_SIZE      = "invalidSize";
ZmUploadManager.ERROR_INVALID_EXTENSION = "invalidExtension";
ZmUploadManager.ERROR_INVALID_FILENAME  = "invalidFilename";

/**
 * uploadMyComputerFile serializes a set of files uploads.  The responses are accumulated, and progress is provided to the
 * current view, if any.  Once all files are uploaded, a custom callback is run (if provided) to finish the upload.
 *
 * @param	{object}	params		params to customize the upload flow:
 *      uploadFolder                Folder to save associated document into
 *      files:                      raw File object from the external HTML5 drag and drop
 *      notes:                      Notes associated with each of the files being added
 *      allResponses:               Placeholder, initialized here and passed to the chained calls, accumulating responses
 *      start:                      current index into files
 *      curView:                    target view for the drag and drop
 *      preAllCallback:             Run prior to All uploads
 *      initOneUploadCallback:      Run prior to a single upload
 *      progressCallback:           Run by the upload code to provide upload progress
 *      errorCallback:              Run upon an error
 *      completeOneCallback:        Run when a single upload completes
 *      completeAllCallback:        Run when the last file has completed its upload
 *
 */
ZmUploadManager.prototype.upload =
function(params) {
    if (!params.files) {
        return;
    }

    try {
        this.upLoadC = this.upLoadC + 1;
        var file = params.files[params.start];
        var fileName = file.name || file.fileName;

        if (!params.allResponses) {
            // First file to upload.  Do an preparation prior to uploading the files
            params.allResponses = [];
            if (params.preAllCallback) {
                params.preAllCallback.run(fileName);
            }
        }

        // Initiate the first upload
        var req = new XMLHttpRequest(); // we do not call this function in IE
        req.open("POST", appCtxt.get(ZmSetting.CSFE_ATTACHMENT_UPLOAD_URI)+"?fmt=extended,raw", true);
        req.setRequestHeader("Cache-Control", "no-cache");
        req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        req.setRequestHeader("Content-Type",  (file.type || "application/octet-stream") + ";");
        req.setRequestHeader("Content-Disposition", 'attachment; filename="'+ AjxUtil.convertToEntities(fileName) + '"');

        if (params.initOneUploadCallback) {
            params.initOneUploadCallback.run();
        }

        DBG.println(AjxDebug.DBG1,"Uploading file: "  + fileName + " file type" + (file.type || "application/octet-stream") );
        this._uploadAttReq = req;
        if (AjxEnv.supportsHTML5File) {
            if (params.progressCallback) {
                req.upload.addEventListener("progress", params.progressCallback, false);
            }
        }
        else {
            if (params.curView) {
                var progress = function (obj) {
                    var viewObj = obj;
                    viewObj.si = window.setInterval (function(){viewObj._progress();}, 500);
                };
                progress(params.curView);
            }
        }

        req.onreadystatechange = this._handleUploadResponse.bind(this, req, fileName, params);
        req.send(file);
        delete req;
    } catch(exp) {
        DBG.println("Error while uploading file: "  + fileName);
        DBG.println("Exception: "  + exp);

        if (params.errorCallback) {
            params.errorCallback.run();
        }
        this._popupErrorDialog(ZmMsg.importErrorUpload);
        this.upLoadC = this.upLoadC - 1;
        return false;
    }

};


ZmUploadManager.prototype._handleUploadResponse =
function(req, fileName, params){
    var curView      = params.curView;
    var files        = params.files;
    var start        = params.start;
    var allResponses = params.allResponses;
    if (req.readyState === 4) {
        var resp = (req.status === 200) && eval("["+req.responseText+"]");
        var response = (req.status === 200 ) && resp.length && resp[2];
        if (response || this._uploadAttReq.aborted) {
            allResponses.push((response && response[0]) || null);
            var aid = "";
            if (response && response.length){
                DBG.println(AjxDebug.DBG1,"Uploaded file: "  + fileName + "Successfully.");
                aid = (response && response[0] && response[0].aid);
            }
            if (start < files.length - 1) {
                // Still some file uploads to perform
                if (params.completeOneCallback) {
                    params.completeOneCallback.run(files, start + 1, aid);
                }
                // Start the next upload
                params.start++;
                this.upload(params);
            }
            else {
                // Uploads are all done
                this._completeAll(params, allResponses);
            }
        }
        else {
            DBG.println("Error while uploading file: "  + fileName + " response is null.");

            // Uploads are all done
            this._completeAll(params, allResponses);

            var msgDlg = appCtxt.getMsgDialog();
            this.upLoadC = this.upLoadC - 1;
            msgDlg.setMessage(ZmMsg.importErrorUpload, DwtMessageDialog.CRITICAL_STYLE);
            msgDlg.popup();
            return false;
        }
    }

};

ZmUploadManager.prototype._completeAll =
function(params, allResponses) {
    if (params.completeAllCallback) {
        // Run a custom callback (like for mail ComposeView, which is doing attachment handling)
        params.completeAllCallback.run(allResponses, params, 200)
    }
}

ZmUploadManager.prototype._popupErrorDialog = function(message) {
    var dialog = appCtxt.getMsgDialog();
    dialog.setMessage(message, DwtMessageDialog.CRITICAL_STYLE);
    dialog.popup();
};


// --- Upload File Validation -------------------------------------------
ZmUploadManager.prototype.getErrors =
function(file, maxSize, errors, extensions){
	var error = { errorCodes:[], filename: AjxStringUtil.htmlEncode(file.name) };
    var valid = true;
    var size = file.size || file.fileSize; // Safari
    if (size && (size > maxSize)) {
		valid = false;
		error.errorCodes.push( ZmUploadManager.ERROR_INVALID_SIZE );
    }
    if (!this._checkExtension(file.name, extensions)) {
		valid = false;
		error.errorCodes.push( ZmUploadManager.ERROR_INVALID_EXTENSION );
    }
    if(ZmAppCtxt.INVALID_NAME_CHARS_RE.test(file.name)) {
		valid = false;
		error.errorCodes.push( ZmUploadManager.ERROR_INVALID_FILENAME );
    }

    return valid ? null : error;
};

ZmUploadManager.prototype._checkExtension =
function(filename, extensions) {
    if (!extensions) return true;
    var ext = filename.replace(/^.*\./,"").toUpperCase();
    for (var i = 0; i < extensions.length; i++) {
        if (extensions[i] == ext) {
            return true;
        }
    }
    return false;
};

ZmUploadManager.prototype.createUploadErrorMsg =
function(errors, maxSize, lineBreak) {
	var errorSummary = {};
	var errorCodes;
	var errorCode;
	for (var i = 0; i < errors.length; i++) {
		errorCodes = errors[i].errorCodes;
		for (var j = 0; j < errorCodes.length; j++) {
			errorCode = errorCodes[j];
			if (!errorSummary[errorCode])  {
				errorSummary[errorCode] = [];
			}
			errorSummary[errorCode].push(errors[i].filename);
		}
	}

    var errorMsg = [ZmMsg.uploadFailed];
    if (errorSummary.invalidExtension) {
        var extensions = this._formatUploadErrorList(this._extensions);
        errorMsg.push("* " + AjxMessageFormat.format(ZmMsg.errorNotAllowedFile, [ extensions ]));
    }
	var msgFormat, errorFilenames;
    if (errorSummary.invalidFilename) {
        msgFormat =  (errorSummary.invalidFilename.length > 1) ? ZmMsg.uploadInvalidNames : ZmMsg.uploadInvalidName;
        errorFilenames = this._formatUploadErrorList(errorSummary.invalidFilename);
        errorMsg.push("* " + AjxMessageFormat.format(msgFormat, [ errorFilenames ] ));
    }
    if (errorSummary.invalidSize) {
        msgFormat =  (errorSummary.invalidSize.length > 1) ? ZmMsg.uploadSizeError : ZmMsg.singleUploadSizeError;
        errorFilenames = this._formatUploadErrorList(errorSummary.invalidSize);
        errorMsg.push("* " + AjxMessageFormat.format(msgFormat, [ errorFilenames, AjxUtil.formatSize(maxSize)] ));
    }
    return errorMsg.join(lineBreak);
};

ZmUploadManager.prototype._formatUploadErrorList =
function(errorObjList) {
    var errorObjText = "";
    if (errorObjList) {
        if (!errorObjList.length) {
            errorObjText = errorObjList;
        } else {
            if (errorObjList.length == 1) {
                errorObjText = errorObjList[0];
            } else {
                var lastObj = errorObjList.slice(-1);
                errorObjList = errorObjList.slice(0, errorObjList.length - 1);
                var initialErrorObjs = errorObjList.join(", ");
                errorObjText = AjxMessageFormat.format(ZmMsg.pluralList, [ initialErrorObjs, lastObj] );
            }
        }
    }
    return errorObjText;
};
