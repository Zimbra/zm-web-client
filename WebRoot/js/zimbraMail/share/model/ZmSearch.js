function ZmSearch(appCtxt, query, types, sortBy, offset, limit, contactSource) {

	this._appCtxt = appCtxt;
	this.query = query;
	this.types = types;
	this.sortBy = sortBy;
	this.offset = offset;
	this.limit = limit;
	this.contactSource = contactSource;
	this._parseQuery();
}

// Search types
ZmSearch.TYPE = new Object();
ZmSearch.TYPE[ZmItem.CONV] = "conversation";
ZmSearch.TYPE[ZmItem.MSG] = "message";
ZmSearch.TYPE[ZmItem.CONTACT] = "contact";
ZmSearch.TYPE[ZmItem.APPT] = "appointment";
ZmSearch.TYPE[ZmItem.NOTE] = "note";
ZmSearch.TYPE_ANY = "any";

// Sort By
ZmSearch.DATE_DESC 	= "dateDesc";
ZmSearch.DATE_ASC 	= "dateAsc";
ZmSearch.SUBJ_DESC 	= "subjDesc";
ZmSearch.SUBJ_ASC 	= "subjAsc";
ZmSearch.NAME_DESC 	= "nameDesc";
ZmSearch.NAME_ASC 	= "nameAsc";
ZmSearch.SCORE_DESC = "scoreDesc";

ZmSearch.FOLDER_QUERY_RE = new RegExp('^in:\\s*"?(' + ZmOrganizer.VALID_PATH_CHARS + '+)"?\\s*$', "i");
ZmSearch.TAG_QUERY_RE = new RegExp('^tag:\\s*"?(' + ZmOrganizer.VALID_NAME_CHARS + '+)"?\\s*$', "i");
ZmSearch.UNREAD_QUERY_RE = new RegExp('\\bis:\\s*(un)?read\\b', "i");

ZmSearch.prototype.toString = 
function() {
	return "ZmSearch";
}

// NOTE: exception handling should be responsibility of calling function!
ZmSearch.prototype.execute =
function() {
	if (!this.query) return;

	var isGalSearch = (this.contactSource == ZmSearchToolBar.FOR_GAL_MI);
	var soapDoc;
	if (isGalSearch) {
		soapDoc = AjxSoapDoc.create("SearchGalRequest", "urn:liquidAccount");
		soapDoc.set("name", this.query);
	} else {
		soapDoc = AjxSoapDoc.create("SearchRequest", "urn:zimbraMail");
		var method = this._getStandardMethod(soapDoc);
		if (this.types) {
			var a = this.types.getArray();
			if (a.length) {
				var typeStr = new Array();
				for (var i = 0; i < a.length; i++)
					typeStr.push(ZmSearch.TYPE[a[i]]);
				method.setAttribute("types", typeStr.join(","));
				// bug fix #2744 and #3298
				if (a.length == 1 && a[0] == ZmItem.MSG && 
					(this.query == "in:sent" || this.query == "in:drafts"))
				{
					method.setAttribute("recip", "1");
				}
			}
		}
	}
	
	var resp = this._appCtxt.getAppController().sendRequest(soapDoc);
	resp = isGalSearch ? resp.SearchGalResponse : resp.SearchResponse;
	
	var searchResult = new ZmSearchResult(this._appCtxt, this);
	searchResult.set(resp, this.contactSource);
	return searchResult;
}

// searching w/in a conv (to get its messages) has its own special command
// NOTE: exception handling should be responsibility of calling function!
ZmSearch.prototype.forConv = 
function(cid) {
	if (!this.query || !cid) return;

	var soapDoc = AjxSoapDoc.create("SearchConvRequest", "urn:zimbraMail");
	var method = this._getStandardMethod(soapDoc);
	method.setAttribute("cid", cid);
	method.setAttribute("fetch", "1");
	if (this._appCtxt.get(ZmSetting.VIEW_AS_HTML))
		method.setAttribute("html", "1");
	// XXX: we dont want to set read flag yet since it does us no good
	// the modify notification handling gets called before the model (msg list)
	// is even created so it ends up being completely ignored
	//method.setAttribute("read", "1");
	
	var resp = this._appCtxt.getAppController().sendRequest(soapDoc).SearchConvResponse;
	
	var searchResult = new ZmSearchResult(this._appCtxt, this);
	searchResult.set(resp, null, true);
	return searchResult;
}

/**
* Returns a title that summarizes this search.
*/
ZmSearch.prototype.getTitle =
function() {
	var where = null;
	if (this.folderId) {
		var folder = this._appCtxt.getFolderTree().getById(this.folderId);
		if (folder)
			where = folder.getName(true, ZmOrganizer.MAX_DISPLAY_NAME_LENGTH, true);
	} else if (this.tagId) {
		where = this._appCtxt.getTagList().getById(this.tagId).getName(true, ZmOrganizer.MAX_DISPLAY_NAME_LENGTH, true);
	}
	var title = where ? [LmMsg.zimbraTitle, where].join(": ") : 
						[LmMsg.zimbraTitle, LmMsg.searchResults].join(": ");
	return title;
}

ZmSearch.prototype._getStandardMethod = 
function(soapDoc) {

	var method = soapDoc.getMethod();
	
	// only set sort by if given
	if (this.sortBy)
		method.setAttribute("sortBy", this.sortBy);

	// always set offset (init to zero if not provided)
	this.offset = this.offset || 0;
	method.setAttribute("offset", this.offset);

	// always set limit (init to user pref for page size if not provided)
	this.limit = this.limit || this._appCtxt.get(ZmSetting.PAGE_SIZE);
	method.setAttribute("limit", this.limit);
	
	// and of course, always set the query
	soapDoc.set("query", this.query);

	return method;
}

/**
* Parse simple queries so we can do basic matching on new items (determine whether
* they match this search query). The following types of queries are handled:
*
*    in:foo
*    tag:foo
*
* which may result in this.folderId or this.tagId getting set.
*/
ZmSearch.prototype._parseQuery =
function() {
	var results = this.query.match(ZmSearch.FOLDER_QUERY_RE);
	if (results) {
		var path = results[1].toLowerCase();
		// first check if it's a system folder (name in query string may not match actual name)
		for (var id in ZmFolder.QUERY_NAME)
			if (ZmFolder.QUERY_NAME[id] == path)
				this.folderId = id;
		// now check all folders by name
		if (!this.folderId) {
			var folder = this._appCtxt.getFolderTree().getByPath(path);
			if (folder)
				this.folderId = folder.id;
		}
	}
	results = this.query.match(ZmSearch.TAG_QUERY_RE);
	if (results) {
		var name = results[1].toLowerCase();
		var tag = this._appCtxt.getTagList().getByName(name);
		if (tag)
			this.tagId = tag.id;
	}
	this.hasUnreadTerm = ZmSearch.UNREAD_QUERY_RE.test(this.query);
}
