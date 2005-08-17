function LmSearchFolder(id, name, parent, tree, numUnread, query, types, sortBy) {

	LmFolder.call(this, id, name, parent, tree, numUnread);
	
	this.type = LmOrganizer.SEARCH;
	this.query = query;
}

LmSearchFolder.prototype = new LmFolder;
LmSearchFolder.prototype.constructor = LmSearchFolder;

LmSearchFolder.ID_ROOT = LmOrganizer.ID_ROOT;

/**
* Creates a new saved search.
*
* @param name		the name of the saved search
* @param search		a search object which contains the details of the search
* @param parentId	ID of the parent (present only if parent is a folder)
*/
LmSearchFolder.prototype.create =
function(name, search, parentId) {
	var soapDoc = LsSoapDoc.create("CreateSearchFolderRequest", "urn:liquidMail");
	var searchNode = soapDoc.set("search");
	searchNode.setAttribute("name", name);
	searchNode.setAttribute("query", search.query);
	if (search.types) {
		var a = search.types.getArray();
		if (a.length) {
			var typeStr = new Array();
			for (var i = 0; i < a.length; i++)
				typeStr.push(LmSearch.TYPE[a[i]]);
			searchNode.setAttribute("types", typeStr.join(","));
		}
	}
	if (search.sortBy)
		searchNode.setAttribute("sortBy", search.sortBy);
	var id = parentId || this.id;
	var id = Math.max(id, LmFolder.ID_ROOT);
	searchNode.setAttribute("l", id);
	var resp = this.tree._appCtxt.getAppController().sendRequest(soapDoc).firstChild;
}
