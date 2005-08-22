/*
***** BEGIN LICENSE BLOCK *****
Version: ZPL 1.1

The contents of this file are subject to the Zimbra Public License Version 1.1 ("License");
You may not use this file except in compliance with the License. You may obtain a copy of
the License at http://www.zimbra.com/license

Software distributed under the License is distributed on an "AS IS" basis, WITHOUT WARRANTY
OF ANY KIND, either express or implied. See the License for the specific language governing
rights and limitations under the License.

The Original Code is: Zimbra Collaboration Suite.

The Initial Developer of the Original Code is Zimbra, Inc.
Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
All Rights Reserved.
Contributor(s): ______________________________________.

***** END LICENSE BLOCK *****
*/

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
	var soapDoc = AjxSoapDoc.create("CreateSearchFolderRequest", "urn:zimbraMail");
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
