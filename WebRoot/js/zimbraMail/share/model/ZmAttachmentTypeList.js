function ZmAttachmentTypeList(appCtxt) {
	if (arguments.length == 0) return;
	ZmModel.call(this, true);
	this._appCtxt = appCtxt;
};

ZmAttachmentTypeList.prototype = new ZmModel;
ZmAttachmentTypeList.prototype.constructor = ZmAttachmentTypeList;

ZmAttachmentTypeList.prototype.toString = 
function() {
	return "ZmAttachmentTypeList";
};

ZmAttachmentTypeList.prototype.getAttachments =
function() {
	return this._attachments;
};

ZmAttachmentTypeList.compareEntry = 
function(a,b) {
	if (a.desc.toLowerCase() < b.desc.toLowerCase())
		return -1;
	if (a.desc.toLowerCase() > b.desc.toLowerCase())
		return 1;
	else
		return 0;
};

ZmAttachmentTypeList.prototype.load =
function() {
	this._attachments = new Array();

	var soapDoc = AjxSoapDoc.create("BrowseRequest", "urn:zimbraMail");
	soapDoc.getMethod().setAttribute("browseBy", "attachments");

	var att = this._appCtxt.getAppController().sendRequest(soapDoc).BrowseResponse.bd;
	if (att) {
		for (var i=0; i<att.length; i++) {
			var type = att[i]._content;
			if (!ZmMimeTable.isIgnored(type) && (type.indexOf("/") != -1 || type == "image"))
				this._attachments.push(ZmMimeTable.getInfo(type, true));
		}
		this._attachments.sort(ZmAttachmentTypeList.compareEntry);
	}
};
