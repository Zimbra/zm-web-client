/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * The file defines a search class.
 * 
 */

/**
 * Creates a new search with the given properties.
 * @class
 * This class represents a search to be performed on the server. It has properties for
 * the different search parameters that may be used. It can be used for a regular search,
 * or to search within a conversation. The results are returned via a callback.
 *
 * @param {Hash}		params		a hash of parameters
 * @param   {String}	params.query					the query string
 * @param	{String}	params.queryHint				the query string that gets appended to the query but not something the user needs to know about
 * @param	{AjxVector}	params.types					the item types to search for
 * @param	{constant}	params.sortBy					the sort order
 * @param	{int}		params.offset					the starting point within result set
 * @param	{int}		params.limit					the number of results to return
 * @param	{Boolean}	params.getHtml					if <code>true</code>, return HTML part for inlined msg
 * @param	{constant}	params.contactSource			where to search for contacts (GAL or personal)
 * @param	{Boolean}	params.isGalAutocompleteSearch	if <code>true</code>, autocomplete against GAL
 * @param	{constant}	params.galType					the type of GAL autocomplete (account or resource)
 * @param	{int}		params.lastId					the ID of last item displayed (for pagination)
 * @param	{String}	params.lastSortVal				the value of sort field for above item
 * @param	{Boolean}	params.fetch					if <code>true</code>, fetch first hit message
 * @param	{int}		params.searchId					the ID of owning search folder (if any)
 * @param	{Array}		params.conds					the list of search conditions (<code><SearchCalendarResourcesRequest></code>)
 * @param	{Array}		params.attrs					the list of attributes to return (<code><SearchCalendarResourcesRequest></code>)
 * @param	{String}	params.field					the field to search within (instead of default)
 * @param	{Object}	params.soapInfo					the object with method, namespace, response, and additional attribute fields for creating soap doc
 * @param	{Object}	params.response					the canned JSON response (no request will be made)
 * @param	{Array}		params.folders					the list of folders for autocomplete
 * @param	{Array}		params.allowableTaskStatus		the list of task status types to return (assuming one of the values for "types" is "task")
 * @param	{String}	params.accountName				the account name to run this search against
 * @params	{Boolean}	params.idsOnly					if <code>true</code>, response returns item IDs only
 */
ZmSearch = function(params) {

	if (params) {
		for (var p in params) {
			this[p] = params[p];
		}
		this.galType					= this.galType || ZmSearch.GAL_ACCOUNT;
		this.join						= this.join || ZmSearch.JOIN_AND;

		if (this.query || this.queryHint) {
			this._parseQuery();
			if (this.querySortOrder) {
				this.sortBy = this.querySortOrder;
			}
		}
	}
	this.isGalSearch = false;
	this.isCalResSearch = false;

	if (ZmSearch._mailEnabled == null) {
		ZmSearch._mailEnabled = appCtxt.get(ZmSetting.MAIL_ENABLED);
		if (ZmSearch._mailEnabled) {
			AjxDispatcher.require("MailCore");
		}
	}

	if (!(this.types instanceof AjxVector)) {
		this.types = AjxVector.fromArray(AjxUtil.toArray(this.types));
	}
};

// Search types
ZmSearch.TYPE = {};
ZmSearch.TYPE_ANY = "any";

ZmSearch.GAL_ACCOUNT	= "account";
ZmSearch.GAL_RESOURCE	= "resource";
ZmSearch.GAL_ALL		= "";

ZmSearch.JOIN_AND	= 1;
ZmSearch.JOIN_OR	= 2;

ZmSearch.TYPE_MAP = {};

ZmSearch.DEFAULT_LIMIT = DwtListView.DEFAULT_LIMIT;

// Sort By
ZmSearch.DATE_DESC 		= "dateDesc";
ZmSearch.DATE_ASC 		= "dateAsc";
ZmSearch.SUBJ_DESC 		= "subjDesc";
ZmSearch.SUBJ_ASC 		= "subjAsc";
ZmSearch.NAME_DESC 		= "nameDesc";
ZmSearch.NAME_ASC 		= "nameAsc";
ZmSearch.SIZE_DESC 		= "sizeDesc";
ZmSearch.SIZE_ASC 		= "sizeAsc";
ZmSearch.SCORE_DESC 	= "scoreDesc";
ZmSearch.DURATION_DESC	= "durDesc";
ZmSearch.DURATION_ASC	= "durAsc";
ZmSearch.STATUS_DESC	= "taskStatusDesc";
ZmSearch.STATUS_ASC		= "taskStatusAsc";
ZmSearch.PCOMPLETE_DESC	= "taskPercCompletedDesc";
ZmSearch.PCOMPLETE_ASC	= "taskPercCompletedAsc";
ZmSearch.DUE_DATE_DESC	= "taskDueDesc";
ZmSearch.DUE_DATE_ASC	= "taskDueAsc";

ZmSearch.UNREAD_QUERY_RE = new RegExp('\\bis:\\s*(un)?read\\b', "i");
ZmSearch.IS_ANYWHERE_QUERY_RE = new RegExp('\\bis:\\s*anywhere\\b', "i");

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmSearch.prototype.toString =
function() {
	return "ZmSearch";
};

ZmSearch.prototype.execute =
function(params) {
	if (params.batchCmd || this.soapInfo) {
		this._executeSoap(params);
	} else {
		this._executeJson(params);
	}
};

/**
 * Creates a SOAP request that represents this search and sends it to the server.
 *
 * @param {Hash}	params		a hash of parameters
 * @param {AjxCallback}	params.callback		the callback to run when response is received
 * @param {AjxCallback}	params.errorCallback	the callback to run if there is an exception
 * @param {ZmBatchCommand}	params.batchCmd		the batch command that contains this request
 * @param {int}	params.timeout		the timeout value (in seconds)
 * @param {Boolean}	params.noBusyOverlay	if <code>true</code>, don't use the busy overlay
 * 
 * @private
 */
ZmSearch.prototype._executeSoap =
function(params) {

	this.isGalSearch = (this.contactSource && (this.contactSource == ZmId.SEARCH_GAL));
	this.isCalResSearch = (this.conds != null);
	if (!this.query && !this.isCalResSearch) return;

	var soapDoc;
	if (!this.response) {
		if (this.isGalSearch) {
			// DEPRECATED: Use JSON version
			soapDoc = AjxSoapDoc.create("SearchGalRequest", "urn:zimbraAccount");
			var method = soapDoc.getMethod();
			if (this.galType) {
				method.setAttribute("type", this.galType);
			}
			soapDoc.set("name", this.query);
		} else if (this.isAutocompleteSearch) {
			soapDoc = AjxSoapDoc.create("AutoCompleteRequest", "urn:zimbraMail");
			var method = soapDoc.getMethod();
			if (this.limit) {
				method.setAttribute("limit", this.limit);
			}
			soapDoc.set("name", this.query);
		} else if (this.isGalAutocompleteSearch) {
			soapDoc = AjxSoapDoc.create("AutoCompleteGalRequest", "urn:zimbraAccount");
			var method = soapDoc.getMethod();
			method.setAttribute("limit", this._getLimit());
			if (this.galType) {
				method.setAttribute("type", this.galType);
			}
			soapDoc.set("name", this.query);
		} else if (this.isCalResSearch) {
			soapDoc = AjxSoapDoc.create("SearchCalendarResourcesRequest", "urn:zimbraAccount");
			var method = soapDoc.getMethod();
			if (this.attrs) { method.setAttribute("attrs", this.attrs.join(",")); }
			var searchFilterEl = soapDoc.set("searchFilter");
			if (this.conds && this.conds.length) {
				var condsEl = soapDoc.set("conds", null, searchFilterEl);
				if (this.join == ZmSearch.JOIN_OR) {
					condsEl.setAttribute("or", 1);
				}
				for (var i = 0; i < this.conds.length; i++) {
					var cond = this.conds[i];
					var condEl = soapDoc.set("cond", null, condsEl);
					condEl.setAttribute("attr", cond.attr);
					condEl.setAttribute("op", cond.op);
					condEl.setAttribute("value", cond.value);
				}
			}
		} else {
			if (this.soapInfo) {
				soapDoc = AjxSoapDoc.create(this.soapInfo.method, this.soapInfo.namespace);
				// Pass along any extra soap data. (Voice searches use this to pass user identification.)
				for (var nodeName in this.soapInfo.additional) {
					var node = soapDoc.set(nodeName);
					var attrs = this.soapInfo.additional[nodeName];
					for (var attr in attrs) {
						node.setAttribute(attr, attrs[attr]);
					}
				}
			} else {
				soapDoc = AjxSoapDoc.create("SearchRequest", "urn:zimbraMail");
			}
			var method = this._getStandardMethod(soapDoc);
			if (this.types) {
				var a = this.types.getArray();
				if (a.length) {
					var typeStr = [];
					for (var i = 0; i < a.length; i++) {
						typeStr.push(ZmSearch.TYPE[a[i]]);
					}
					method.setAttribute("types", typeStr.join(","));
					// special handling for showing participants ("To" instead of "From")
					var folder = appCtxt.getById(this.folderId);
					if (folder &&
						(folder.isUnder(ZmFolder.ID_SENT) ||
						folder.isUnder(ZmFolder.ID_DRAFTS) ||
						folder.isUnder(ZmFolder.ID_OUTBOX)))
					{
						method.setAttribute("recip", "1");
					}
					// if we're prefetching the first hit message, also mark it as read
					if (this.fetch) {

						method.setAttribute("fetch", ( this.fetch == "all" ) ? "all" : "1");
						// and set the html flag if we want the html version
						if (this.getHtml) {
							method.setAttribute("html", "1");
						}
					}
					if (this.markRead) {
						method.setAttribute("read", "1");
					}
				}
			}
		}
	}

	var respCallback = new AjxCallback(this, this._handleResponseExecute, [params.callback]);

	if (params.batchCmd) {
		params.batchCmd.addRequestParams(soapDoc, respCallback);
	} else {
		return appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true, callback:respCallback,
													   errorCallback:params.errorCallback,
													   timeout:params.timeout, noBusyOverlay:params.noBusyOverlay,
													   response:this.response});
	}
};

/**
 * Creates a JSON request that represents this search and sends it to the server.
 *
 * @param {Hash}	params		a hash of parameters
 * @param {AjxCallback}	params.callback		the callback to run when response is received
 * @param {AjxCallback}	params.errorCallback	the callback to run if there is an exception
 * @param {ZmBatchCommand}	params.batchCmd		the batch command that contains this request
 * @param {int}	params.timeout		the timeout value (in seconds)
 * @param {Boolean}	params.noBusyOverlay	if <code>true</code>, don't use the busy overlay
 * 
 * @private
 */
ZmSearch.prototype._executeJson =
function(params) {

	this.isGalSearch = (this.contactSource && (this.contactSource == ZmId.SEARCH_GAL));
	this.isCalResSearch = (this.conds != null);
	if (!this.query && !this.queryHint && !this.isCalResSearch) { return; }

	var jsonObj, request, soapDoc;
	if (!this.response) {
		if (this.isGalSearch) {
			jsonObj = {SearchGalRequest:{_jsns:"urn:zimbraAccount"}};
			request = jsonObj.SearchGalRequest;
			if (this.galType) { request.type = this.galType; }
			request.name = this.query;

			// bug #36188 - add offset/limit for paging support
			request.offset = this.offset = (this.offset || 0);
			request.limit = this._getLimit();

			if (this.lastId) { // add lastSortVal and lastId for cursor-based paging
				request.cursor = {id:this.lastId, sortVal:(this.lastSortVal || "")};
			}
			if (this.sortBy) {
				request.sortBy = this.sortBy;
			}
		} else if (this.isAutocompleteSearch) {
			jsonObj = {AutoCompleteRequest:{_jsns:"urn:zimbraMail"}};
			request = jsonObj.AutoCompleteRequest;
			if (this.limit) {
				request.limit = this.limit;
			}
			request.name = {_content:this.query};
		} else if (this.isGalAutocompleteSearch) {
			jsonObj = {AutoCompleteGalRequest:{_jsns:"urn:zimbraAccount"}};
			request = jsonObj.AutoCompleteGalRequest;
			request.limit = this._getLimit();
			request.name = this.query;
			if (this.galType) { request.type = this.galType; }
		} else if (this.isCalResSearch) {
			jsonObj = {SearchCalendarResourcesRequest:{_jsns:"urn:zimbraAccount"}};
			request = jsonObj.SearchCalendarResourcesRequest;
			if (this.attrs) {
				request.attrs = this.attrs.join(",");
			}
			if (this.conds && this.conds.length) {
				request.searchFilter = {conds:{}};
				var conds = request.searchFilter.conds;
				var cond = conds.cond = [];
				if (this.join == ZmSearch.JOIN_OR) {
					conds.or = 1;
				}
				for (var i = 0; i < this.conds.length; i++) {
					var c = this.conds[i];
					cond.push({attr:c.attr, op:c.op, value:c.value});
				}
			}
		} else {
			if (this.soapInfo) {
				soapDoc = AjxSoapDoc.create(this.soapInfo.method, this.soapInfo.namespace);
				// Pass along any extra soap data. (Voice searches use this to pass user identification.)
				for (var nodeName in this.soapInfo.additional) {
					var node = soapDoc.set(nodeName);
					var attrs = this.soapInfo.additional[nodeName];
					for (var attr in attrs) {
						node.setAttribute(attr, attrs[attr]);
					}
				}
			} else {
				jsonObj = {SearchRequest:{_jsns:"urn:zimbraMail"}};
				request = jsonObj.SearchRequest;
			}
			this._getStandardMethodJson(request);
			if (this.types) {
				var a = this.types.getArray();
				if (a.length) {
					var typeStr = [];
					for (var i = 0; i < a.length; i++) {
						typeStr.push(ZmSearch.TYPE[a[i]]);
					}
					request.types = typeStr.join(",");

					// special handling for showing participants ("To" instead of "From")
					var folder = appCtxt.getById(this.folderId);
					if (folder &&
						(folder.isUnder(ZmFolder.ID_SENT) ||
						folder.isUnder(ZmFolder.ID_DRAFTS) ||
						folder.isUnder(ZmFolder.ID_OUTBOX)))
					{
						request.recip = 1;
					}

					// if we're prefetching the first hit message, also mark it as read
					if (this.fetch) {
                        request.fetch = ( this.fetch == "all" ) ? "all" : 1;
						// and set the html flag if we want the html version
						if (this.getHtml) {
							request.html = 1;
						}
					}

					if (this.markRead) {
						request.read = 1;
					}

                    if (this.headers) {
                        for (var hdr in this.headers) {
                            if (!request.header) { request.header = []; }
                            request.header.push({n:hdr});
                        }
                    }

					if (a.length == 1 && a[0] == ZmItem.TASK && this.allowableTaskStatus) {
						request.allowableTaskStatus = this.allowableTaskStatus;
					}
                }
            }
        }
    }

	var respCallback = new AjxCallback(this, this._handleResponseExecute, [params.callback]);

	if (params.batchCmd) {
		params.batchCmd.addRequestParams(soapDoc, respCallback);
	} else {
		var searchParams = {
			jsonObj:jsonObj,
			soapDoc:soapDoc,
			asyncMode:true,
			callback:respCallback,
			errorCallback:params.errorCallback,
			timeout:params.timeout,
			noBusyOverlay:params.noBusyOverlay,
			response:this.response,
			accountName:this.accountName
		};
		return appCtxt.getAppController().sendRequest(searchParams);
	}
};

/**
 * Converts the response into a {ZmSearchResult} and passes it along.
 * 
 * @private
 */
ZmSearch.prototype._handleResponseExecute =
function(callback, result) {
	var response = result.getResponse();

	if      (this.isGalSearch)				{ response = response.SearchGalResponse; }
	else if (this.isCalResSearch)			{ response = response.SearchCalendarResourcesResponse; }
	else if (this.isAutocompleteSearch)		{ response = response.AutoCompleteResponse; }
	else if (this.isGalAutocompleteSearch)	{ response = response.AutoCompleteGalResponse; }
	else if (this.soapInfo)					{ response = response[this.soapInfo.response]; }
	else									{ response = response.SearchResponse; }

	var searchResult = new ZmSearchResult(this);
	searchResult.set(response);
	result.set(searchResult);

	if (callback) {
		callback.run(result);
	}
};

/**
 * Fetches a conversation from the server.
 *
 * @param {Hash}	params		a hash of parameters
 * @param {String}	params.cid			the conv ID
 * @param {AjxCallback}	params.callback		the callback to run with result
 * @param {String}	params.fetchId		the ID of msg to load
 * @param {Boolean}	params.markRead		if <code>true</code>, mark msg read
 * @param {Boolean}	params.noTruncate	if <code>true</code>, do not limit size of msg
 */
ZmSearch.prototype.getConv =
function(params) {
	if ((!this.query && !this.queryHint) || !params.cid) { return; }

	var jsonObj = {SearchConvRequest:{_jsns:"urn:zimbraMail"}};
	var request = jsonObj.SearchConvRequest;
	this._getStandardMethodJson(request);
	request.cid = params.cid;
	if (params.fetchId) {
		request.fetch = params.fetchId;	// fetch content of this msg
		if (params.markRead) {
			request.read = 1;			// mark that msg read
		}
		if (this.getHtml) {
			request.html = 1;			// get it as HTML
		}
		// added headers to the request
		if (ZmMailMsg.requestHeaders) {
			for (var hdr in ZmMailMsg.requestHeaders) {
				if (!request.header) request.header = [];
				request.header.push({n:hdr});
			}
		}
	}

	if (!params.noTruncate) {
		request.max = appCtxt.get(ZmSetting.MAX_MESSAGE_SIZE);
	}

	var searchParams = {
		jsonObj: jsonObj,
		asyncMode: true,
		callback: (new AjxCallback(this, this._handleResponseGetConv, params.callback)),
		accountName:this.accountName
	};
	appCtxt.getAppController().sendRequest(searchParams);
};

/**
 * @private
 */
ZmSearch.prototype._handleResponseGetConv =
function(callback, result) {
	var response = result.getResponse().SearchConvResponse;
	var searchResult = new ZmSearchResult(this);
	searchResult.set(response, null, true);
	result.set(searchResult);

	if (callback) {
		callback.run(result);
	}
};

/**
 * Gets a title that summarizes this search.
 * 
 * @return	{String}	the title
 */
ZmSearch.prototype.getTitle =
function() {
	var where;
	DBG.println("bt", "ZmSearch.prototype.getTitle");
	if (this.folderId) {
		DBG.println("bt", "got folder id: " + this.folderId);
		var fid = ZmOrganizer.getSystemId(this.folderId);
		var folder = appCtxt.getById(fid);
		if (folder) {
			where = folder.getName(true, ZmOrganizer.MAX_DISPLAY_NAME_LENGTH, true);
		}
	} else if (this.tagId) {
		where = appCtxt.getById(this.tagId).getName(true, ZmOrganizer.MAX_DISPLAY_NAME_LENGTH, true);
	}
	return where
		? ([ZmMsg.zimbraTitle, where].join(": "))
		: ([ZmMsg.zimbraTitle, ZmMsg.searchResults].join(": "));
};

/**
 * Checks if this search is multi-account.
 * 
 * @return	{Boolean}	<code>true</code> if multi-account
 */
ZmSearch.prototype.isMultiAccount =
function() {
	if (!this._isMultiAccount) {
		this._isMultiAccount = (this.queryHint && this.queryHint.length > 0 &&
								(this.queryHint.split("inid:").length > 1 ||
								 this.queryHint.split("underid:").length > 1));
	}
	return this._isMultiAccount;
};

/**
 * @private
 */
ZmSearch.prototype._getStandardMethod =
function(soapDoc) {

	var method = soapDoc.getMethod();

	if (this.sortBy) {
		method.setAttribute("sortBy", this.sortBy);
	}

	if (ZmSearch._mailEnabled) {
		var headerNode;
		for (var hdr in ZmMailMsg.requestHeaders) {
			headerNode = soapDoc.set('header', null, null);
			headerNode.setAttribute('n', hdr);
		}
	}

	// bug 5771: add timezone and locale info
	ZmTimezone.set(soapDoc, AjxTimezone.DEFAULT, null);
	soapDoc.set("locale", appCtxt.get(ZmSetting.LOCALE_NAME), null);

	if (this.lastId != null && this.lastSortVal) {
		// cursor is used for paginated searches
		var cursor = soapDoc.set("cursor");
		cursor.setAttribute("id", this.lastId);
		cursor.setAttribute("sortVal", this.lastSortVal);
		if (this.endSortVal) {
			cursor.setAttribute("endSortVal", this.endSortVal);
		}
	}

	this.offset = this.offset || 0;
	method.setAttribute("offset", this.offset);

	// always set limit
	method.setAttribute("limit", this._getLimit());

	// and of course, always set the query and append the query hint if applicable
	// only use query hint if this is not a "simple" search
	var query = (this.queryHint)
		? ([this.query, " (", this.queryHint, ")"].join(""))
		: this.query;
	soapDoc.set("query", query);

	// set search field if provided
	if (this.field) {
		method.setAttribute("field", this.field);
	}

	return method;
};

/**
 * @private
 */
ZmSearch.prototype._getStandardMethodJson = 
function(req) {

	if (this.sortBy) {
		req.sortBy = this.sortBy;
	}

	if (ZmSearch._mailEnabled) {
		var hdrs = ZmMailMsg.requestHeaders;
		if (hdrs && hdrs.length) {
			req.header = [];
			for (var hdr in hdrs) {
				req.header.push({n:hdr});
			}
		}
	}

	// bug 5771: add timezone and locale info
	ZmTimezone.set(req, AjxTimezone.DEFAULT);
	// bug 15878: We can't use appCtxt.get(ZmSetting.LOCALE) because that
	//            will return the server's default locale if it is not set
	//            set for the user or their COS. But AjxEnv.DEFAULT_LOCALE
	//            is set to the browser's locale setting in the case when
	//            the user's (or their COS) locale is not set.
	req.locale = { _content: AjxEnv.DEFAULT_LOCALE };

	if (this.lastId != null && this.lastSortVal) {
		// cursor is used for paginated searches
		req.cursor = {id:this.lastId, sortVal:this.lastSortVal};
		if (this.endSortVal) {
			req.cursor.endSortVal = this.endSortVal;
		}
	}

	req.offset = this.offset = this.offset || 0;

	// always set limit
	req.limit = this._getLimit();

	if (this.idsOnly) {
		req.resultMode = "IDS";
	}

	// and of course, always set the query and append the query hint if
	// applicable only use query hint if this is not a "simple" search
	req.query = (this.queryHint)
		? ([this.query, " (", this.queryHint, ")"].join(""))
		: this.query;

	// set search field if provided
	if (this.field) {
		req.field = this.field;
	}
};

/**
 * @private
 */
ZmSearch.prototype._getLimit =
function() {

	if (this.limit) { return this.limit; }

	var limit;
	if (this.isGalAutocompleteSearch) {
		limit = appCtxt.get(ZmSetting.AUTOCOMPLETE_LIMIT);
	} else {
		var type = this.types && this.types.get(0);
		var app = appCtxt.getApp(ZmItem.APP[type]) || appCtxt.getCurrentApp();
		if (app && app.getLimit) {
			limit = app.getLimit(this.offset);
		} else {
			limit = appCtxt.get(ZmSetting.PAGE_SIZE) || ZmSearch.DEFAULT_LIMIT;
		}
	}

	this.limit = limit;
	return limit;
};

ZmSearch.IS_OP	= {"in":true, "inid":true, "is":true, "tag":true, "sort":true};
ZmSearch.COND	= {"and":" && ", "or":" || ", "not":" !"};
ZmSearch.EOW	= {" ":true, ":":true, "(":true, ")":true};
ZmSearch.FLAG = {};
ZmSearch.FLAG["unread"]			= "item.isUnread";
ZmSearch.FLAG["read"]			= "!item.isUnread";
ZmSearch.FLAG["flagged"]		= "item.isFlagged";
ZmSearch.FLAG["unflagged"]		= "!item.isFlagged";
ZmSearch.FLAG["forwarded"]		= "item.isForwarded";
ZmSearch.FLAG["unforwarded"]	= "!item.isForwarded";
ZmSearch.FLAG["sent"]			= "item.isSent";
ZmSearch.FLAG["replied"]		= "item.isReplied";
ZmSearch.FLAG["unreplied"]		= "!item.isReplied";

/**
 * Parse simple queries so we can do basic matching on new items (determine whether
 * they match this search query). The following types of query terms are handled:
 *
 *    in:[folder]
 *    tag:[tag]
 *    is:[flag]
 *
 * Those may be joined by conditionals: "and", "or", "not", "-", and the implied "and"
 * that appears between consecutive terms. The result of the parsing is the creation
 * of a function that takes an item as its argument and returns true if that item
 * matches this search. If the parsing fails for any reason, the function is not
 * created.
 *
 * If the query contains a term of "in:" or "tag:" and has no OR conditionals, then
 * this.folderId or this.tagId will be set.
 *
 * Compound terms such as "in:(inbox or sent)" will not result in the creation of
 * a match function, nor will anything that invokes a text search
 * (such as "in:inbox xml").
 * 
 * @private
 */
ZmSearch.prototype._parseQuery =
function() {

	var query = this.query || this.queryHint; 
	this.hasUnreadTerm = ZmSearch.UNREAD_QUERY_RE.test(query);
	this.isAnywhere = ZmSearch.IS_ANYWHERE_QUERY_RE.test(query);

	function skipSpace(str, pos) {
		while (pos < str.length && str.charAt(pos) == " ") {
			pos++;
		}
		return pos;
	}

	function getQuotedStr(str, pos) {
		var q = str.charAt(pos);
		pos++;
		var done = false, ch, quoted = "";
		while (pos < str.length && !done) {
			ch = str.charAt(pos);
			if (ch == q) {
				done = true;
			} else {
				quoted += ch;
				pos++;
			}
		}

		return done ? {str:quoted, pos:pos + 1} : null;
	}


	var len = query.length;
	var tokens = [], ch, op, word = "", fail = false, eow = false, endOk = true, hasOrTerm = false;
	var pos = skipSpace(query, 0);
	while (pos < len) {
		ch = query.charAt(pos);
		eow = ZmSearch.EOW[ch];

		if (ch == ":") {
			if (ZmSearch.IS_OP[word]) {
				op = word;
			} else {
				fail = true;
			}
			word = "";
			pos = skipSpace(query, pos + 1);
			continue;
		}

		if (eow) {
			if (op && word) {
				tokens.push({isTerm:true, op:op, arg:word});
				op = word = "";
				endOk = true;
			} else if (!op) {
				if (ZmSearch.COND[word.toLowerCase()]) {
					var cond = word.toLowerCase();
					tokens.push(ZmSearch.COND[cond]);
					word = "";
					endOk = false;
					if (cond == "or") {
						hasOrTerm = true;
					}
				} else if (word) {
					fail = true;
				}
			}
		}

		if (ch == "'" || ch == '"') {
			var results = getQuotedStr(query, pos);
			if (results) {
				word = results.str;
				pos = results.pos;
			} else {
				fail = true;
			}
		} else if (ch == "(" || ch == ")") {
			tokens.push(ch);
			pos = skipSpace(query, pos + 1);
		} else if (ch == "-" && !word) {
			tokens.push("not");
			pos = skipSpace(query, pos + 1);
			endOk = false;
		} else {
			if (ch != " ") {
				word += ch;
			}
			pos++;
		}
	}

	// check for term at end
	if (!fail && (pos == query.length) && op && word) {
		tokens.push({isTerm:true, op:op, arg:word});
		endOk = true;
	} else if (!op && word) {
		fail = true;
	}

	fail = fail || !endOk;

	var folderId, tagId;
	var func = ["return Boolean("];
	for (var i = 0, len = tokens.length; i < len; i++) {
		var t = tokens[i];
		if (t.isTerm) {
			if (t.op == "in" || t.op == "inid") {
				folderId = (t.op == "in") ? this._getFolderId(t.arg) : t.arg;
				if (folderId) {
					func.push("((item.type == ZmItem.CONV) ? item.folders && item.folders['" + folderId +"'] : item.folderId == '" + folderId + "')");
				}
			} else if (t.op == "tag") {
				tagId = this._getTagId(t.arg);
				if (tagId) {
					func.push("item.hasTag('" + tagId + "')");
				}
			} else if (t.op == "is") {
				var test = ZmSearch.FLAG[t.arg];
				if (test) {
					func.push(test);
				}
			} else if (t.op == "sort") {
				this.querySortOrder = t.arg;
			}
			var next = tokens[i + 1];
			if (next && (next.isTerm || next == ZmSearch.COND["not"] || next == "(")) {
				func.push(ZmSearch.COND["and"]);
			}
		} else {
			func.push(t);
		}
	}
	func.push(")");

	if (!fail) {
		try {
			this.matches = new Function("item", func.join(""));
		} catch(ex) {}
	}

	this.numTerms = tokens.length;

	// the way multi-account searches are done, we set the queryHint *only* so
	// set the folderId if it exists for simple multi-account searches
	var isMultiAccountSearch = (appCtxt.multiAccounts && this.isMultiAccount() && !this.query && this.queryHint);
	if (!hasOrTerm || isMultiAccountSearch) {
		this.folderId = folderId;
		this.tagId = tagId;
	}
};

/**
 * Returns the fully-qualified ID for the given folder path.
 *
 * @param {String}	path	the path
 * 
 * @private
 */
ZmSearch.prototype._getFolderId =
function(path) {
	// first check if it's a system folder (name in query string may not match actual name)
	var folderId = ZmFolder.QUERY_ID[path];

	var accountName = this.accountName;
	if (!accountName) {
		var active = appCtxt.getActiveAccount();
		accountName = active ? active.name : appCtxt.accountList.mainAccount;
	}

	// now check all folders by name
	if (!folderId) {
		var account = accountName && appCtxt.accountList.getAccountByName(accountName);
		var folders = appCtxt.getFolderTree(account);
		var folder = folders ? folders.getByPath(path, true) : null;
		if (folder) {
			folderId = folder.id;
		}
	}

	if (accountName) {
		folderId = ZmOrganizer.getSystemId(folderId, appCtxt.accountList.getAccountByName(accountName));
	}

	return folderId;
};

/**
 * @private
 */
ZmSearch.prototype._getTagId =
function(name) {
	var tagTree = appCtxt.getTagTree();
	if (tagTree) {
		var tag = tagTree.getByName(name.toLowerCase());
		if (tag) {
			return tag.id;
		}
	}
};

/**
 * Checks if the search has a folder term.
 * 
 * @return	{Boolean}	<code>true</code> if the search has a folder term
 */
ZmSearch.prototype.hasFolderTerm =
function(path) {
	if (!path) { return false; }
	var regEx = new RegExp('\\s*in:\\s*"?(' + AjxStringUtil.regExEscape(path) + ')"?\\s*', "i");
	var regExNot = new RegExp('(-|not)\\s*in:\\s*"?(' + AjxStringUtil.regExEscape(path) + ')"?\\s*', "i");
	return (regEx.test(this.query) && !regExNot.test(this.query));
};

/**
 * Replaces the folder term.
 * 
 * @param	{String}	oldPath		the old path
 * @param	{String}	newPath		the new path
 */
ZmSearch.prototype.replaceFolderTerm =
function(oldPath, newPath) {
	if (!(oldPath && newPath)) { return; }
	var regEx = new RegExp('(\\s*in:\\s*"?)(' + AjxStringUtil.regExEscape(oldPath) + ')("?\\s*)', "gi");
	this.query = this.query.replace(regEx, "$1" + newPath + "$3");
};

/**
 * Checks if the search has a tag term.
 * 
 * @return	{Boolean}	<code>true</code> if the search has a tag term
 */
ZmSearch.prototype.hasTagTerm =
function(name) {
	if (!name) { return false; }
	var regEx = new RegExp('\\s*tag:\\s*"?(' + AjxStringUtil.regExEscape(name) + ')"?\\s*', "i");
	var regExNot = new RegExp('(-|not)\\s*tag:\\s*"?(' + AjxStringUtil.regExEscape(name) + ')"?\\s*', "i");
	return (regEx.test(this.query) && !regExNot.test(this.query));
};

/**
 * Replaces the tag term.
 * 
 * @param	{String}	oldName		the old name
 * @param	{String}	newName		the new name
 */
ZmSearch.prototype.replaceTagTerm =
function(oldName, newName) {
	if (!(oldName && newName)) { return; }
	var regEx = new RegExp('(\\s*tag:\\s*"?)(' + AjxStringUtil.regExEscape(oldName) + ')("?\\s*)', "gi");
	this.query = this.query.replace(regEx, "$1" + newName + "$3");
};
