function ZmSearchFolder(id, name, parent, tree, numUnread, query, types, sortBy) {

	ZmFolder.call(this, id, name, parent, tree, numUnread);
	
	this.type = ZmOrganizer.SEARCH;
	this.query = query;
}

ZmSearchFolder.prototype = new ZmFolder;
ZmSearchFolder.prototype.constructor = ZmSearchFolder;

ZmSearchFolder.ID_ROOT = ZmOrganizer.ID_ROOT;

/**
* Creates a new saved search.
*
* @param name		the name of the saved search
* @param search		a search object which contains the details of the search
* @param parentId	ID of the parent (present only if parent is a folder)
*/
ZmSearchFolder.prototype.create =
function(name, search, parentId) {
	var soapDoc = AjxSoapDoc.create("CreateSearchFolderRequest", "urn:liquidMail");
	var searchNode = soapDoc.set("search");
	searchNode.setAttribute("name", name);
	searchNode.setAttribute("query", search.query);
	if (search.types) {
		var a = search.types.getArray();
		if (a.length) {
			var typeStr = new Array();
			for (var i = 0; i < a.length; i++)
				typeStr.push(ZmSearch.TYPE[a[i]]);
			searchNode.setAttribute("types", typeStr.join(","));
		}
	}
	if (search.sortBy)
		searchNode.setAttribute("sortBy", search.sortBy);
	var id = parentId || this.id;
	var id = Math.max(id, ZmFolder.ID_ROOT);
	searchNode.setAttribute("l", id);
	var resp = this.tree._appCtxt.getAppController().sendRequest(soapDoc).firstChild;
}
