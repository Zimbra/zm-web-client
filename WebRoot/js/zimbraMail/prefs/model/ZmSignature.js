ZmSignature = function(id) {
	this.id = id;
	this._appCtxt = ZmAppCtxt.getFromShell(DwtShell.getShell(window));
};

ZmSignature.prototype.toString = function() {
	return "ZmSignature";
};

//
// Data
//

ZmSignature.prototype.name = "";
ZmSignature.prototype.contentType = ZmMimeTable.TEXT_PLAIN;
ZmSignature.prototype.value = "";

//
// Static functions
//

ZmSignature.createFromJson = function(object) {
	var appCtxt = ZmAppCtxt.getFromShell(DwtShell.getShell(window));
	var signature = new ZmSignature(object.id);
	signature.setFromJson(object);
	return signature;
};

//
// Public methods
//

ZmSignature.prototype.create = function(callback, errorCallback, batchCmd) {
	var respCallback = callback ? new AjxCallback(this, this._handleCreateResponse, [callback]) : null;
	var resp = this._sendRequest("CreateSignatureRequest", false, respCallback, errorCallback, batchCmd);
	if (!callback && !batchCmd) {
		this._handleCreateResponse(callback, resp);
	}
};

ZmSignature.prototype.save = function(callback, errorCallback, batchCmd) {
	var respCallback = callback ? new AjxCallback(this, this._handleModifyResponse, [callback]) : null;
	var resp = this._sendRequest("ModifySignatureRequest", false, respCallback, errorCallback, batchCmd);
	if (!callback && !batchCmd) {
		this._handleModifyResponse(callback, resp);
	}
};

ZmSignature.prototype.doDelete = function(callback, errorCallback, batchCmd) {
	var respCallback = callback ? new AjxCallback(this, this._handleDeleteResponse, [callback]) : null;
	var resp = this._sendRequest("DeleteSignatureRequest", true, respCallback, errorCallback, batchCmd);
	if (!callback && !batchCmd) {
		this._handleDeleteResponse(callback, resp);
	}
};

ZmSignature.prototype.setFromJson = function(object) {
	this.name = object.name || this.name;
	var content = object.content && object.content[0];
	if (content) {
		this.contentType = content.type || this.contentType;
		this.value = content._content != null ? content._content : this.value;
	}
};

//
// Protected methods
//

ZmSignature.prototype._sendRequest =
function(method, idOnly, respCallback, errorCallback, batchCmd) {
	var soapDoc = AjxSoapDoc.create(method, "urn:zimbraAccount");
	var signatureEl = soapDoc.set("signature");
	if (this.id) {
		signatureEl.setAttribute("id", this.id);
	}
	if (!idOnly) {
		signatureEl.setAttribute("name", this.name);
		var contentEl = soapDoc.set("content", this.value, signatureEl);
		contentEl.setAttribute("type", this.contentType);
	}

	if (batchCmd) {
		var execFrame = null; // ???
		batchCmd.addNewRequestParams(soapDoc, respCallback, errorCallback, execFrame);
		return;
	}

	var appController = this._appCtxt.getAppController();
	var params = {
		soapDoc: soapDoc,
		asyncMode: Boolean(respCallback),
		callback: respCallback,
		errorCallback: errorCallback
	}
	return appController.sendRequest(params);
};

ZmSignature.prototype._handleCreateResponse = function(callback, resp) {
	// save id
	this.id = resp._data.CreateSignatureResponse.signature[0].id;

	// add to global hash
	var signatures = this._appCtxt.get(ZmSetting.SIGNATURES);
	signatures[this.id] = this;

	if (callback) {
		callback.run();
	}
};

ZmSignature.prototype._handleModifyResponse = function(callback, resp) {
	// promote settings to global signature
	var signatures = this._appCtxt.get(ZmSetting.SIGNATURES);
	var signature = signatures[this.id];
	signature.name = this.name;
	signature.value = this.value;

	if (callback) {
		callback.run();
	}
};

ZmSignature.prototype._handleDeleteResponse = function(callback, resp) {
	// remove from global hash
	var signatures = this._appCtxt.get(ZmSetting.SIGNATURES);
	delete signatures[this.id];

	if (callback) {
		callback.run();
	}
};
