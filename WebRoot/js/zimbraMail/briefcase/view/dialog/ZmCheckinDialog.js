ZmCheckinDialog = function(parent, controller, className) {
	if (arguments.length == 0) return;
	DwtDialog.call(this, {parent:parent, className:className, title:ZmMsg.checkInFileToBriefcase});

    this._controller = controller;

    this._createUploadHtml();

    this.getButton(DwtDialog.OK_BUTTON).setText(ZmMsg.checkInFile);
    this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._upload));
};

ZmCheckinDialog.prototype = new DwtDialog;
ZmCheckinDialog.prototype.constructor = ZmCheckinDialog;

ZmCheckinDialog.prototype.popup =
function(item, callback){

    this._item = item;
    this._uploadCallback = callback;
    //this._uploadFolder = appCtxt.get(item.folderId);    

    this._verDiv.innerHTML = Number(item.version) + 1;
    this._fileTD.innerHTML = "";
    this._fileTD.innerHTML = [
        '<input type="file" name="file" id="',this._templateId,'_file" size="35"/>'
    ].join('');
    this._notes.value = "";

    DwtDialog.prototype.popup.call(this);
};

ZmCheckinDialog.prototype._createUploadHtml =
function(){
    this._templateId = Dwt.getNextId();
    var uri = appCtxt.get(ZmSetting.CSFE_UPLOAD_URI);
    this.setContent(AjxTemplate.expand("briefcase.Briefcase#CheckinDialog", {id: this._templateId, uri:uri}));
    this._verDiv = document.getElementById(this._templateId+"_version");
    this._fileTD = document.getElementById(this._templateId+"_fileTD");
    this._notes = document.getElementById(this._templateId+"_notes");
};

ZmCheckinDialog.prototype._upload = function(){
    var fileInput = document.getElementById(this._templateId+"_file");
    if(!fileInput.value) return;
    var item = this._item;
    var file = {
        fullname: fileInput.value,
        name: fileInput.value.replace(/^.*[\\\/:]/, ""),
        id: item.id,
        version: item.version,
        folder: item.folderId,
        notes: this._notes.value
    };

    var callback = new AjxCallback(this, this._uploadSaveDocs, file);

    this._initiateUpload(this._templateId+"_form", callback)

};

ZmCheckinDialog.prototype._initiateUpload =
function(formId, callback){

    this.setButtonEnabled(DwtDialog.OK_BUTTON, false);
	this.setButtonEnabled(DwtDialog.CANCEL_BUTTON, false);

	var uploadForm = document.getElementById(formId);

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

ZmCheckinDialog.prototype._uploadSaveDocs = function(file, status, guid) {
	if (status != AjxPost.SC_OK) {
		var message = AjxMessageFormat.format(ZmMsg.uploadError, status);
		if(status == '413') {
			message = ZmMsg.errorAttachmentTooBig;
		}
		this._popupErrorDialog(message);
	} else {

        file.guid = guid;
		this._uploadSaveDocs2(file, status, guid);

	}
};

ZmCheckinDialog.prototype._uploadSaveDocs2 =
function(file, status, guid) {

    var json = {
		SaveDocumentRequest: {
			_jsns: "urn:zimbraMail",
			doc: {
				id:	    file.id,
                ver:    file.version,
                l:      file.folderId,
                name:   file.name,
                desc:   file.notes,
                upload: {
                    id: file.guid
                }
			}
		}
	};

    var callback = new AjxCallback(this, this._uploadSaveDocsResponse, [ file, status, guid ]);
    var params = {
        jsonObj:    json,
        asyncMode:  true,
        callback:   callback
    };
    appCtxt.getAppController().sendRequest(params);    
};

ZmCheckinDialog.prototype._uploadSaveDocsResponse =
function(file, status, guid, response) {

    var resp = response && response._data;
    var saveDocResp = resp && resp.SaveDocumentResponse;

    if(saveDocResp){
        saveDocResp = saveDocResp.doc[0];
        file.done     = true;
        file.name     = saveDocResp.name;
        file.version  = saveDocResp.ver;

        this._finishUpload(file);
    }

    this.popdown();

    if (resp && resp.Fault) {
        var fault = resp.Fault;
        var error = fault.Detail.Error;
        var code = error.Code;
        //Handle Mailbox Exceeded Exception
        if(code == ZmCsfeException.MAIL_QUOTA_EXCEEDED){
            this._popupErrorDialog(ZmMsg.errorQuotaExceeded);
        }
    }

};

ZmCheckinDialog.prototype._finishUpload = function(file) {
	if(this._uploadCallback)
	    this._uploadCallback.run(file);
};

ZmCheckinDialog.prototype._popupErrorDialog = function(message) {
	this.setButtonEnabled(DwtDialog.OK_BUTTON, true);
	this.setButtonEnabled(DwtDialog.CANCEL_BUTTON, true);

	var dialog = appCtxt.getMsgDialog();
	dialog.setMessage(message, DwtMessageDialog.CRITICAL_STYLE, this._title);
	dialog.popup();
};
