ZmDocletMgr = function() {
};

ZmDocletMgr.prototype.saveDocument =
function(item) {
    this._uploadSaveDocs2([{id: item.id, name: item.name, version: (item.version ? item.version :1), folderId: item.folderId}], null, null, item.name, item.content, item.contentType);
};

ZmDocletMgr.prototype._uploadSaveDocs2 =
function(files, status, guids, name, content, ct) {
    // create document wrappers
    var soapDoc = AjxSoapDoc.create("BatchRequest", "urn:zimbra", null);
    soapDoc.setMethodAttribute("onerror", "continue");
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if (file.done) continue;

        var saveDocNode = soapDoc.set("SaveDocumentRequest", null, null, "urn:zimbraMail");
        saveDocNode.setAttribute("requestId", i);

        var docNode = soapDoc.set("doc", null, saveDocNode);
        if (file.id) {
            docNode.setAttribute("id", file.id);
            docNode.setAttribute("ver", file.version);
        }
        else {
            docNode.setAttribute("l", file.folderId);
        }

        if(ct){
            docNode.setAttribute("ct", ct);
        }

        if(file.guid) {
            var uploadNode = soapDoc.set("upload", null, docNode);
            uploadNode.setAttribute("id", file.guid);
        }

        if(name!=null && content!=null) {
            var wordNode = soapDoc.set("w", content, docNode);
            wordNode.setAttribute("name", name);
        }
    }

    var args = [ files, status, guids ];
    var callback = new AjxCallback(this, this._uploadSaveDocsResponse, args);
    var params = {
        soapDoc:soapDoc,
        asyncMode:true,
        callback:callback
    };
    this.sendRequest(params);
};

ZmDocletMgr.prototype.sendRequest =
function(params) {
    if(!this._requestMgr) {
        this._requestMgr = new ZmRequestMgr(this);
    }
    params.noSession = true;
    return this._requestMgr.sendRequest(params);
};

ZmDocletMgr.prototype._uploadSaveDocsResponse =
function(files, status, guids, response) {
    var resp = response && response._data && response._data.BatchResponse;

	// mark successful uploads
    if (resp && resp.SaveDocumentResponse) {
        for (var i = 0; i < resp.SaveDocumentResponse.length; i++) {
            var saveDocResp = resp.SaveDocumentResponse[i];
            files[saveDocResp.requestId].done = true;
            files[saveDocResp.requestId].rest = saveDocResp.doc[0].rest;
            files[saveDocResp.requestId].ver = saveDocResp.doc[0].ver;
            files[saveDocResp.requestId].id = saveDocResp.doc[0].id;
        }
    }

	// check for conflicts
    var conflicts = [];
    if (resp && resp.Fault) {
        var errors = [];
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
                        case "id": { file.id = attr._content; break; }
                        case "ver": { file.version = attr._content; break; }
                        case "rest": { file.rest = attr._content; break; }
                    }
                }
                conflicts.push(file);
            }
            else {
                DBG.println("Unknown error occurred: "+code);
                errors[fault.requestId] = fault;
            }
        }
		// TODO: What to do about other errors?
    }
    /*
	// resolve conflicts
	var conflictCount = conflicts.length;
	if (conflictCount > 0 && this._mode == ZmDocletMgr.MODE_CREATE) {
		var dialog = appCtxt.getUploadConflictDialog();
		if (!this._conflictCallback) {
			this._conflictCallback = new AjxCallback(this, this._uploadSaveDocs2);
		}
		this._conflictCallback.args = [ files, status, guids, name, content ];
		dialog.popup(this._uploadFolder, conflicts, this._conflictCallback);
	}

	// keep mine
	else if (conflictCount > 0 && this._mode == ZmDocletMgr.MODE_SAVE) {
		this._uploadSaveDocs2(files, status, guids, name, content);
	}
	// perform callback
	else*/
    if (this._saveCallback) {
        this._saveCallback.run(files);
    }
};

ZmDocletMgr.prototype.setSaveCallback =
function(callback) {
  this._saveCallback = callback;  

};

ZmDocletMgr.prototype._kickPolling =
function(resetBackoff) {

};

ZmDocletMgr.prototype._handleException =
function(ex, continuation) {
    var handled = false;
    if (ex.code == ZmCsfeException.MAIL_NO_SUCH_FOLDER) {
        //todo: handle folder not found exception
    }
    if (!handled) {
        ZmController.prototype._handleException.apply(this, arguments);
    }
};

ZmDocletMgr.prototype.runAppFunction =
function(funcName, force) {
    //not needed in new function
};

ZmDocletMgr.prototype.fetchDocumentContent =
function(item) {
    var restURL = item.rest;
    var urlParts = AjxStringUtil.parseURL(restURL);
    if(urlParts && urlParts.path) {
        var result = AjxRpc.invoke("", urlParts.path + "?fmt=native", {}, null, true);
        var docContent = "";
        if(result && result.success) {
            docContent = this._pendingContent = result.text;
        }
        return docContent;
    }
    return "";
};


ZmDocletMgr.prototype.getItemInfo =
function(params)
{
    var soapDoc = AjxSoapDoc.create("GetItemRequest", "urn:zimbraMail");
    var folderNode = soapDoc.set("item");

    if(params.path){
        folderNode.setAttribute("path", params.path);
    }else if(params.folderId && params.id){ //bug:19658
        folderNode.setAttribute("l", params.folderId);
        folderNode.setAttribute("id", params.id);
    }else if(params.folderId && params.name){
        folderNode.setAttribute("l", params.folderId);
        folderNode.setAttribute("name", params.name);
    }else if(params.id){
        folderNode.setAttribute("id", params.id);
    }

    var args = [];
    var asyncMode = (params.callback?true:false);

    var handleResponse = null;
    if(asyncMode){
        handleResponse = new AjxCallback(this, this.handleGetItemResponse,[params]);
    }

    var reqParams = {
        soapDoc: soapDoc,
        asyncMode: asyncMode,
        callback: handleResponse,
        accountName: params.accountName
    };

    var response = this.sendRequest(reqParams);

    if(!asyncMode && response){
        var item = this.handleGetItemResponse(params,response.GetItemResponse);
        return item;
    }

    return null;
};

ZmDocletMgr.prototype.handleGetItemResponse =
function(params,response)
{

    var path = params.path;
    var callback = params.callback;

    var getItemResponse = response;
    if(response && response._data){
        getItemResponse = response && response._data && response._data.GetItemResponse;
    }

    var docResp = getItemResponse && getItemResponse.doc && getItemResponse.doc[0];

    var item = null;

    if(docResp){
        item = new ZmItem();
        var data = docResp;
        if (data.id) item.id = data.id;        
        if (data.rest) item.restUrl = data.rest;
        if (data.l) item.folderId = data.l;
        if (data.name) item.name = data.name;
        if (data.cr) item.creator = data.cr;
        if (data.d) item.createDate = new Date(Number(data.d));
        if (data.md) item.modifyDate = new Date(Number(data.md));
        if (data.leb) item.modifier = data.leb;
        if (data.s) item.size = Number(data.s);
        if (data.ver) item.version = Number(data.ver);
        if (data.ct) item.contentType = data.ct.split(";")[0];
        item.folderId = docResp.l || ZmOrganizer.ID_BRIEFCASE;

        if(!item.rest) {
            item.rest = window.appContextPath + "/home/user1/Briefcase/" + item.name;
        }
    }

    if(callback){
        callback.run(item);
    }

    return item;
};