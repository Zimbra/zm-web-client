function ZmDomainTree(appCtxt) {
	ZmModel.call(this, true);
	this._appCtxt = appCtxt;
};

ZmDomainTree.prototype = new ZmModel;
ZmDomainTree.prototype.constructor = ZmDomainTree;

ZmDomainTree.prototype.toString = 
function() {
	return "ZmDomainTree";
};

ZmDomainTree.prototype.getRootDomain =
function() {
	return this._rootDomain;
};

ZmDomainTree.prototype.load =
function() {
	this._rootDomain = new ZmDomain(".", null, "");

	var soapDoc = AjxSoapDoc.create("BrowseRequest", "urn:liquidMail", null);
	soapDoc.getMethod().setAttribute("browseBy", "domains");

	var domains = this._appCtxt.getAppController().sendRequest(soapDoc).BrowseResponse.bd;
	
	if (domains) {
		for (var i = 0; i < domains.length; i++)
			this._rootDomain.addSubDomain(domains[i]._content, domains[i].h);
	}
};
