/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2012, 2013 VMware, Inc.
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

ZmDragAndDrop = function(parent) {
    this._view = parent;
    this._controller = parent._controller;
    this._element = parent.getHtmlElement();
    this._initialize();
};

ZmDragAndDrop.prototype.constructor = ZmDragAndDrop;

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
        ZmDragAndDrop.MESSAGE_SIZE_LIMIT = appCtxt.get(ZmSetting.MESSAGE_SIZE_LIMIT);
        ZmDragAndDrop.ATTACHMENT_URL = appCtxt.get(ZmSetting.CSFE_ATTACHMENT_UPLOAD_URI)+"?fmt=extended,raw";
    }

    return ZmDragAndDrop.isSupported();
};

/**
 * @return	{boolean} 	true if attachment size exceeded and shows the warning dialog
 */
ZmDragAndDrop.isAttachmentSizeExceeded = function(files, showDialog) {
    var j,
        filesLength,
		size,
        file;

    if (!files) {
        return false;
    }

    for (j = 0 , size = 0, filesLength = files.length; j < filesLength; j++) {
        file = files[j];
        if (file) {
			//Check the total size of the files we upload this time (we don't know the previously uploaded files total size so we do the best we can).
			//NOTE - we compare to the MTA message size limit since there's no limit on specific attachments.
            size += file.size || file.fileSize; /*Safari*/
            //Showing Error dialog if the attachment size is exceeded
            if ((-1 /* means unlimited */ != ZmDragAndDrop.MESSAGE_SIZE_LIMIT) &&
                (size > ZmDragAndDrop.MESSAGE_SIZE_LIMIT)) {
                if (showDialog) {
                    var msgDlg = appCtxt.getMsgDialog();
                    var errorMsg = AjxMessageFormat.format(ZmMsg.attachmentSizeError, AjxUtil.formatSize(ZmDragAndDrop.MESSAGE_SIZE_LIMIT));
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
	if (!ZmDragAndDrop.isSupported() && this._element && this._element.id) {
		var tooltip = document.getElementById(this._element.id + ZmId.CMP_DND_TOOLTIP);
		if (tooltip) {
			tooltip.style.display = "none";
			tooltip.innerHTML = "";
		}
	}
    if (!this._view || !this._controller || !this._element || !ZmDragAndDrop.isSupported()) {
        return;
    }
    this._addHandlers(this._element);
    this._dndTooltipEl = document.getElementById(this._element.id + ZmId.CMP_DND_TOOLTIP);
    this._setToolTip();
};

ZmDragAndDrop.prototype._addHandlers = function(el) {
    Dwt.setHandler(el,"ondragover",this._onDragOver.bind(this));
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

ZmDragAndDrop.prototype._onDragOver = function(ev) {
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

    dt = ev.dataTransfer;
    if (!dt) {
        return;
    }

    files = dt.files;
    if (!files) {
        return;
    }

    if (files.length) {
        ZmDragAndDrop._stopEvent(ev);
    }

	//just re-use code from the my computer option as it should be exactly the same case from now on.
	this._view._submitMyComputerAttachments(files, null, isEditorDND);
};

ZmDragAndDrop._stopEvent = function(ev) {
	if (!ZmDragAndDrop.containFiles(ev)) {
		return;
	}
	if (ev.preventDefault) {
		ev.preventDefault();
	}
	if (ev.stopPropagation) {
		ev.stopPropagation();
	}
};

ZmDragAndDrop.containFiles =
function(ev, type) {
	var typesArray = ev && ev.dataTransfer && ev.dataTransfer.types;
    if (!typesArray) {
		return false;
	}
	type = type || "Files";
	for (var i = 0; i < typesArray.length; i++) {
		if (typesArray[i] === type) {
			return true;
		}
	}
	return false;
};