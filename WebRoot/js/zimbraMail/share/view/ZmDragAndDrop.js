/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Zimlets
 * Copyright (C) 2007, 2008, 2009, 2010, 2011 Zimbra, Inc.
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
 * Drag and Drop Event handler
 *
 * @author Hem Aravind
 *
 * @private
 */

function ZmDragAndDrop(parent) {
    this._view = parent;
    this._controller = parent._controller;
    this._element = parent.getHtmlElement();
    this._initialize();
}

/**
* @return	{boolean}	true if drag and drop is supported
*/
ZmDragAndDrop.isSupported = function() {

    //Refer https://github.com/Modernizr/Modernizr/issues/57#issuecomment-4187079 Drag and Drop support
    var div = document.createElement('div'),
        dragSupport = (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)),
        isSupported = dragSupport && !!window.FileReader;

    if (AjxEnv.isSafari4up && dragSupport) {
        isSupported = true;
    }

    ZmDragAndDrop.isSupported = function() {
        return isSupported;
    };

    if (isSupported) {
        ZmDragAndDrop.ATTACHMENT_SIZE_LIMIT = appCtxt.get(ZmSetting.ATTACHMENT_SIZE_LIMIT);
        ZmDragAndDrop.ATTACHMENT_URL = appCtxt.get(ZmSetting.CSFE_ATTACHMENT_UPLOAD_URI)+"?fmt=extended,raw";
    }

    return ZmDragAndDrop.isSupported();
};

/**
 * @return	{boolean} 	true if attachment size exceeded and shows the warning dialog
 */
ZmDragAndDrop.isAttachmentSizeExceeded = function(files, showDialog) {
    var j,
        size,
        filesLength,
        file;

    if (!files) {
        return false;
    }

    for (j = 0 , size = 0, filesLength = files.length; j < filesLength; j++) {
        file = files[j];
        if (file) {
            size += file.size || file.fileSize; /*Safari*/
            //Showing Error dialog if the attachment size is exceeded
            if (size > ZmDragAndDrop.ATTACHMENT_SIZE_LIMIT) {
                if (showDialog) {
                    var msgDlg = appCtxt.getMsgDialog();
                    var errorMsg = AjxMessageFormat.format(ZmMsg.attachmentSizeError, AjxUtil.formatSize(ZmDragAndDrop.ATTACHMENT_SIZE_LIMIT));
                    msgDlg.setMessage(errorMsg, DwtMessageDialog.WARNING_STYLE);
                    msgDlg.popup();
                }
                return true;
            }
        }
    }
    return false;
};

ZmDragAndDrop.prototype._initialize = function () {
    if (!this._view || !this._controller || !this._element || !ZmDragAndDrop.isSupported()) {
        return;
    }
    this._addHandlers(this._element);
    this._dndTooltipEl = document.getElementById(this._element.id + '_zdnd_tooltip');
    this._setToolTip();
};

ZmDragAndDrop.prototype._addHandlers = function(el) {
    Dwt.setHandler(el,"ondragenter",this._onDragEnter.bind(this));
    Dwt.setHandler(el,"ondragover",this._onDragOver.bind(this));
    Dwt.setHandler(el,"ondragleave",this._onDragLeave.bind(this));
    Dwt.setHandler(el,"ondrop", this._onDrop.bind(this));
};

ZmDragAndDrop.prototype._setToolTip = function(){
    if (!this._dndTooltipEl) {
        return;
    }
    if (this._view._attachCount > 0 || this._dndFilesLength > 0){
        this._dndTooltipEl.style.display = "none";
        this._dndTooltipEl.innerHTML = "";
    } else {
        this._dndTooltipEl.innerHTML = ZmMsg.dndTooltip;
        this._dndTooltipEl.style.display = "block";
    }
};


ZmDragAndDrop.prototype._onDragEnter = function(ev) {
    ZmDragAndDrop._stopEvent(ev);
};

ZmDragAndDrop.prototype._onDragOver = function(ev) {
    ZmDragAndDrop._stopEvent(ev);
};

ZmDragAndDrop.prototype._onDragLeave = function(ev) {
    ZmDragAndDrop._stopEvent(ev);
};

ZmDragAndDrop.prototype._onDrop = function(ev, isEditorDND) {
    var dt,
        files,
        file,
        j,
        filesLength;

    if (!ev || (this._view && this._view._disableAttachments === true) ) {
        return;
    }

    ZmDragAndDrop._stopEvent(ev);

    dt = ev.dataTransfer;
    if (!dt) {
        return;
    }

    files = dt.files;
    if (!files) {
        return;
    }

    if (ZmDragAndDrop.isAttachmentSizeExceeded(files, true)) {
        return;
    }

    this._uploadedAttachment = [];
    this._dndFilesLength = filesLength = files.length;

    for (j = 0; j < filesLength; j++) {
        file = files[j];
        if (file) {
            if (j === 0) {
                this._dndTooltipEl.innerHTML = "<img src='/img/animated/ImgSpinner.gif' width='16' height='16' border='0' style='float:left;'/>&nbsp;<div style='display:inline;'>" + ZmMsg.attachingFiles + "</div>";
                this._dndTooltipEl.style.display = "block";
            }
            this._view._initProgressSpan(file.name || file.fileName);
            this._uploadFiles(file, isEditorDND);
        }
        else {
            this._dndFilesLength--;
        }
    }
};

ZmDragAndDrop.prototype._uploadFiles = function(file, isEditorDND) {
    var req = new XMLHttpRequest();
    var fileName = file.name || file.fileName;
    req.open("POST", ZmDragAndDrop.ATTACHMENT_URL, true);
    req.setRequestHeader("Cache-Control", "no-cache");
    req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    req.setRequestHeader("Content-Type",  (file.type || "application/octet-stream") + ";");
    req.setRequestHeader("Content-Disposition", 'attachment; filename="'+ AjxUtil.convertToEntities(fileName) + '"');
    var upload = req.upload;
    if (upload && upload.addEventListener) {
        upload.addEventListener("progress", this._view._uploadFileProgress.bind(this._view), false);
    }
    req.onreadystatechange = this._handleResponse.bind(this, req, isEditorDND);
    req.send(file);
};

ZmDragAndDrop.prototype._handleResponse = function(req, isEditorDND) {
    if(req.readyState === 4 && req.status === 200) {
        this._dndFilesLength--;
        var resp = eval("["+req.responseText+"]");
        if (resp && resp[0] === 200 && resp.length === 3) {
            if (isEditorDND) {
                this._handleEditorDND(resp[2]);
            }
            else {
                this._handleNormalDND(resp[2]);
            }
        }
        else {
            this._handleErrorResponse(resp[0] || resp);
        }
        //Clean up the properties
        if (this._dndFilesLength === 0) {
            delete this._dndFilesLength;
            delete this._uploadedAttachment;
            this._setToolTip();
        }
    }
};

ZmDragAndDrop.prototype._handleNormalDND = function(resp) {
    if (resp[0].aid) {
        this._uploadedAttachment.push(resp[0].aid);
    }
    if (this._dndFilesLength === 0 && this._uploadedAttachment.length > 0) {
        this._controller.saveDraft(ZmComposeController.DRAFT_TYPE_AUTO, this._uploadedAttachment.join(","));
    }
};

ZmDragAndDrop.prototype._handleEditorDND = function(resp) {
    this._uploadedAttachment.push(resp[0]);
    if (this._dndFilesLength === 0 && this._uploadedAttachment.length > 0) {
        this._uploadedAttachment.clipboardPaste = true;
        this._controller.saveDraft(ZmComposeController.DRAFT_TYPE_AUTO, this._uploadedAttachment);
    }
};

ZmDragAndDrop.prototype._handleErrorResponse = function(respCode) {
    var warngDlg = appCtxt.getMsgDialog();
    if (respCode === 413) {
        warngDlg.setMessage(ZmMsg.errorAttachmentTooBig, DwtMessageDialog.CRITICAL_STYLE);
    } else {
        warngDlg.setMessage(AjxMessageFormat.format(ZmMsg.errorAttachment, (respCode || AjxPost.SC_NO_CONTENT)), DwtMessageDialog.CRITICAL_STYLE);
    }
    warngDlg.popup();
};

ZmDragAndDrop._stopEvent = function(ev) {
    if (!ev) {
        return;
    }
    if (ev.preventDefault) {
        ev.preventDefault();
    }
    if (ev.stopPropagation) {
        ev.stopPropagation();
    }
};