function LmDomainTree(appCtxt) {
	LmModel.call(this, true);
	this._appCtxt = appCtxt;
};

LmDomainTree.prototype = new LmModel;
LmDomainTree.prototype.constructor = LmDomainTree;

LmDomainTree.prototype.toString = 
function() {
	return "LmDomainTree";
};

LmDomainTree.prototype.getRootDomain =
function() {
	return this._rootDomain;
};

LmDomainTree.prototype.load =
function() {
	this._rootDomain = new LmDomain(".", null, "");

	var soapDoc = LsSoapDoc.create("BrowseRequest", "urn:liquidMail", null);
	soapDoc.getMethod().setAttribute("browseBy", "domains");

	var domains = this._appCtxt.getAppController().sendRequest(soapDoc).BrowseResponse.bd;
	
	if (domains) {
		for (var i = 0; i < domains.length; i++)
			this._rootDomain.addSubDomain(domains[i]._content, domains[i].h);
	}
};
