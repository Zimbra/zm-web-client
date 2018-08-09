/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * Provides a framework for uploading multiple files; the callbacks allow the upload to be stored as an
 * attachment or saved document.
 *
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

ZmUploadManager.prototype._extensions;

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

ZmUploadManager.ERROR_INVALID_SIZE      = "invalidSize";
ZmUploadManager.ERROR_INVALID_EXTENSION = "invalidExtension";
ZmUploadManager.ERROR_INVALID_FILENAME  = "invalidFilename";

/**
 * uploadMyComputerFile serializes a set of files uploads.  The responses are accumulated, and progress is provided to the
 * current view, if any.  Once all files are uploaded, a custom callback is run (if provided) to finish the upload.
 *
 * @param	{object}	params		params to customize the upload flow:
 *      attachment				    True => Mail msg attachment, False => File Upload
 *      uploadFolder                Folder to save associated document into
 *      files:                      raw File object from the external HTML5 drag and drop
 *      notes:                      Notes associated with each of the files being added
 *      allResponses:               Placeholder, initialized here and passed to the chained calls, accumulating responses
 *      start:                      current index into files
 *      curView:                    target view for the drag and drop
 *      url							url to use (optional, currently only from ZmImportExportController)
 *      stateChangeCallback			callback to use from _handleUploadResponse which is the onreadystatechange listener, instead of the normal code here. (optiona, see ZmImportExportController)
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
	params.start = params.start || 0;

    try {
        this.upLoadC = this.upLoadC + 1;
		var file     = params.files[params.start];
		var fileName = file.name || file.fileName;

		if (!params.allResponses) {
            // First file to upload.  Do an preparation prior to uploading the files
            params.allResponses = [];
            if (params.preAllCallback) {
                params.preAllCallback.run(fileName);
            }
			// Determine the total number of bytes to be upload across all the files
			params.totalSize = this._getTotalUploadSize(params);
			params.uploadedSize = 0;
		}

		if (params.start > 0) {
			// Increment the total number of bytes upload with the previous file that completed.
			params.uploadedSize += params.currentFileSize;
		}
		// Set the upload size of the current file
		params.currentFileSize = file.size || file.fileSize || 0;

        // Initiate the first upload
        var req = new XMLHttpRequest(); // we do not call this function in IE
		var uri = params.url || (params.attachment ? (appCtxt.get(ZmSetting.CSFE_ATTACHMENT_UPLOAD_URI) + "?fmt=extended,raw") : appCtxt.get(ZmSetting.CSFE_UPLOAD_URI));
        req.open("POST", uri, true);
        req.setRequestHeader("Cache-Control", "no-cache");
        req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        req.setRequestHeader("Content-Type",  (file.type || "application/octet-stream") + ";");
        req.setRequestHeader("Content-Disposition", 'attachment; filename="'+ AjxUtil.convertToEntities(fileName) + '"');
		if (window.csrfToken) {
			req.setRequestHeader("X-Zimbra-Csrf-Token", window.csrfToken);
		}

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

ZmUploadManager.prototype._getTotalUploadSize = function(params) {
	// Determine the total number of bytes to be upload across all the files
	var totalSize = 0;
	for (var i = 0; i < params.files.length; i++) {
		var file = params.files[i];
		var size = file.size || file.fileSize || 0; // fileSize: Safari
		totalSize += size;
	}
	return totalSize;
}

ZmUploadManager.prototype._handleUploadResponse =
function(req, fileName, params){
	if (params.stateChangeCallback) {
		return params.stateChangeCallback(req);
	}
    var curView      = params.curView;
    var files        = params.files;
    var start        = params.start;
    var allResponses = params.allResponses;
    if (req.readyState === 4) {
		var response = null;
		var aid      = null;
		var status   = req.status;
		if (status === 200) {
			if (params.attachment) {
				// Sent via CSFE_ATTACHMENT_UPLOAD_URI
				var resp = eval("["+req.responseText+"]");
				response = resp.length && resp[2];
				if (response) {
					response = response[0];
					if (response) {
						aid = response.aid;
					}
				}
			} else {
				// Sent via CSFE_UPLOAD_URI
				// <UGLY> - the server assumes the javascript object/function it will communicate with - AjxPost.  It invokes it with:
				// function doit() { window.parent._uploadManager.loaded(200,'null','<uploadId>'); }  and then <body onload='doit()'>
				// We need to extract the uploadId param from the function call
				var functionStr = "loaded(";
				var response    = req.responseText;
				if (response) {
					// Get the parameter text between 'loaded('  and  ')';
					var paramText    = response.substr(response.indexOf(functionStr) + functionStr.length);
					paramText        = paramText.substr(0, paramText.indexOf(")"));
					// Convert to an array of params.  Third one is the upload id
					var serverParams = paramText.split(',');
					var serverParamArray =  eval( "["+ serverParams +"]" );
					status = serverParamArray[0];
					aid = serverParamArray && serverParamArray.length && serverParamArray[2];
					response = { aid: aid };
				}
				// </UGLY>
			}
		}
        if (response || this._uploadAttReq.aborted) {
			allResponses.push(response  || null);
            if (aid) {
                DBG.println(AjxDebug.DBG1,"Uploaded file: "  + fileName + "Successfully.");
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
                this._completeAll(params, allResponses, status);
            }
        }
        else {
            DBG.println("Error while uploading file: "  + fileName + " response is null.");

            // Uploads are all done
            this._completeAll(params, allResponses, status);

            var msgDlg = appCtxt.getMsgDialog();
            this.upLoadC = this.upLoadC - 1;
			msgDlg.setMessage(ZmMsg.importErrorUpload, DwtMessageDialog.CRITICAL_STYLE);
            msgDlg.popup();
            return false;
        }
    }

};

ZmUploadManager.prototype._completeAll =
function(params, allResponses, status) {
    if (params.completeAllCallback) {
        // Run a custom callback (like for mail ComposeView, which is doing attachment handling)
        params.completeAllCallback.run(allResponses, params, status)
    }
}

ZmUploadManager.prototype._popupErrorDialog = function(message) {
    var dialog = appCtxt.getMsgDialog();
    dialog.setMessage(message, DwtMessageDialog.CRITICAL_STYLE);
    dialog.popup();
};


// --- Upload File Validation -------------------------------------------
ZmUploadManager.prototype.getErrors = function(file, maxSize, errors, extensions){
	this._extensions = extensions;
	var error = { errorCodes:[], filename: AjxStringUtil.htmlEncode(file.name) };
    var valid = true;
    var size = file.size || file.fileSize || 0;  // fileSize: Safari
    if (size && (size > maxSize)) {
		valid = false;
		error.errorCodes.push( ZmUploadManager.ERROR_INVALID_SIZE );
    }
    if (!this._checkExtension(file.name, extensions)) {
		valid = false;
		error.errorCodes.push( ZmUploadManager.ERROR_INVALID_EXTENSION );
    }
	if (ZmAppCtxt.INVALID_NAME_CHARS_RE.test(file.name)) {
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
