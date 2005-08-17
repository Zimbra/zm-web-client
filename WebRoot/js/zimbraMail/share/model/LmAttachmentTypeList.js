function LmAttachmentTypeList(appCtxt) {
	if (arguments.length == 0) return;
	LmModel.call(this, true);
	this._appCtxt = appCtxt;
};

LmAttachmentTypeList.prototype = new LmModel;
LmAttachmentTypeList.prototype.constructor = LmAttachmentTypeList;

LmAttachmentTypeList.prototype.toString = 
function() {
	return "LmAttachmentTypeList";
};

LmAttachmentTypeList.prototype.getAttachments =
function() {
	return this._attachments;
};

LmAttachmentTypeList.compareEntry = 
function(a,b) {
	if (a.desc.toLowerCase() < b.desc.toLowerCase())
		return -1;
	if (a.desc.toLowerCase() > b.desc.toLowerCase())
		return 1;
	else
		return 0;
};

LmAttachmentTypeList.prototype.load =
function() {
	this._attachments = new Array();

	var soapDoc = LsSoapDoc.create("BrowseRequest", "urn:liquidMail");
	soapDoc.getMethod().setAttribute("browseBy", "attachments");

	var att = this._appCtxt.getAppController().sendRequest(soapDoc).BrowseResponse.bd;
	if (att) {
		for (var i=0; i<att.length; i++) {
			var type = att[i]._content;
			if (!LmMimeTable.isIgnored(type) && (type.indexOf("/") != -1 || type == "image"))
				this._attachments.push(LmMimeTable.getInfo(type, true));
		}
		this._attachments.sort(LmAttachmentTypeList.compareEntry);
	}
};
