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
 * @param	{Boolean}	params.idsOnly					if <code>true</code>, response returns item IDs only
 * @param   {Boolean}   params.inDumpster               if <code>true</code>, search in the dumpster
 * @param	{boolean}	params.expandDL					if <code>true</code>, set flag to have server indicate expandability for DLs
 * @param	{string}	params.origin					indicates what initiated the search
 * @param	{boolean}	params.isEmpty					if true, return empty response without sending a request
 */
ZmSearch = function(params) {

	params = params || {};
	for (var p in params) {
		this[p] = params[p];
	}
	this.galType					= this.galType || ZmSearch.GAL_ACCOUNT;
	this.join						= this.join || ZmSearch.JOIN_AND;

	if (this.query || this.queryHint) {
		// only parse regular searches
		if (!this.isGalSearch && !this.isAutocompleteSearch &&
			!this.isGalAutocompleteSearch && !this.isCalResSearch) {
			
			var pq = this.parsedQuery = new ZmParsedQuery(this.query || this.queryHint);
			this._setProperties();
			var sortTerm = pq.getTerm("sort");
			if (sortTerm) {
				this.sortBy = sortTerm.arg;
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
		this.types = AjxUtil.toArray(this.types);
        if (!appCtxt.get(ZmSetting.MAIL_ENABLED)) {
            this.types = AjxUtil.arrayAsHash(this.types);
            delete this.types[ZmSearch.TYPE[ZmItem.MSG]];
            delete this.types[ZmSearch.TYPE[ZmItem.CONV]];
            this.types = AjxUtil.keys(this.types);
        }
        this.types = AjxVector.fromArray(this.types);
	}

    // a search of no types is equivalent to a search of all allowed types
    if (this.types.size() == 0) {
        this.types = AjxVector.fromArray(AjxUtil.keys(ZmSearch.TYPE));
    }
};

ZmSearch.prototype.isZmSearch = true;
ZmSearch.prototype.toString = function() { return "ZmSearch"; };

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
ZmSearch.RCPT_ASC       = "rcptAsc";
ZmSearch.RCPT_DESC      = "rcptDesc";
ZmSearch.ATTACH_ASC     = "attachAsc"
ZmSearch.ATTACH_DESC    = "attachDesc"
ZmSearch.FLAG_ASC       = "flagAsc";
ZmSearch.FLAG_DESC      = "flagDesc";
ZmSearch.READ_ASC       = "readAsc";
ZmSearch.READ_DESC      = "readDesc";
ZmSearch.PRIORITY_ASC   = "priorityAsc";
ZmSearch.PRIORITY_DESC  = "priorityDesc";
ZmSearch.SCORE_DESC 	= "scoreDesc";
ZmSearch.DURATION_DESC	= "durDesc";
ZmSearch.DURATION_ASC	= "durAsc";
ZmSearch.STATUS_DESC	= "taskStatusDesc";
ZmSearch.STATUS_ASC		= "taskStatusAsc";
ZmSearch.PCOMPLETE_DESC	= "taskPercCompletedDesc";
ZmSearch.PCOMPLETE_ASC	= "taskPercCompletedAsc";
ZmSearch.DUE_DATE_DESC	= "taskDueDesc";
ZmSearch.DUE_DATE_ASC	= "taskDueAsc";



ZmSearch.prototype.execute =
function(params) {
	if (params.batchCmd || this.soapInfo) {
		return this._executeSoap(params);
	} else {
		return this._executeJson(params);
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
	this.isCalResSearch = (!this.contactSource && this.conds != null);
    if (appCtxt.isOffline && this.isCalResSearch) {
        this.isCalResSearch =  appCtxt.isZDOnline();
    }
	if (this.isEmpty) {
		this._handleResponseExecute(params.callback);
		return null;
	}

	var soapDoc;
	if (!this.response) {
		if (this.isGalSearch) {
			// DEPRECATED: Use JSON version
			soapDoc = AjxSoapDoc.create("SearchGalRequest", "urn:zimbraAccount");
			var method = soapDoc.getMethod();
			if (this.galType) {
				method.setAttribute("type", this.galType);
			}
			if (this.expandDL) {
				method.setAttribute("needExp", 1);
			}
			soapDoc.set("name", this.query);
			var searchFilterEl = soapDoc.set("searchFilter");
			if (this.conds && this.conds.length) {
				var condsEl = soapDoc.set("conds", null, searchFilterEl);
				this._applySoapCond(this.conds, soapDoc, condsEl);
			}
		} else if (this.isAutocompleteSearch) {
			soapDoc = AjxSoapDoc.create("AutoCompleteRequest", "urn:zimbraMail");
			var method = soapDoc.getMethod();
			if (this.limit) {
				method.setAttribute("limit", this.limit);
			}
			if (this.expandDL) {
				method.setAttribute("needExp", 1);
			}
			soapDoc.set("name", this.query);
		} else if (this.isGalAutocompleteSearch) {
			soapDoc = AjxSoapDoc.create("AutoCompleteGalRequest", "urn:zimbraAccount");
			var method = soapDoc.getMethod();
			method.setAttribute("limit", this._getLimit());
			if (this.galType) {
				method.setAttribute("type", this.galType);
			}
			if (this.expandDL) {
				method.setAttribute("needExp", 1);
			}
			soapDoc.set("name", this.query);
		} else if (this.isCalResSearch) {
			soapDoc = AjxSoapDoc.create("SearchCalendarResourcesRequest", "urn:zimbraAccount");
			var method = soapDoc.getMethod();
			if (this.attrs) {
				var attrs = [].concat(this.attrs);
				AjxUtil.arrayRemove(attrs, "fullName");
				method.setAttribute("attrs", attrs.join(","));
			}
			var searchFilterEl = soapDoc.set("searchFilter");
			if (this.conds && this.conds.length) {
				var condsEl = soapDoc.set("conds", null, searchFilterEl);
				this._applySoapCond(this.conds, soapDoc, condsEl);
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
			if (this.inDumpster) {
				method.setAttribute("inDumpster", "1");
			}
		}
	}

	var respCallback = this._handleResponseExecute.bind(this, params.callback);

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
	this.isCalResSearch = (!this.contactSource && this.conds != null);
    if (appCtxt.isOffline && this.isCalResSearch) {
        this.isCalResSearch = appCtxt.isZDOnline();
    }
	if (this.isEmpty) {
		this._handleResponseExecute(params.callback);
		return null;
	}

	var jsonObj, request, soapDoc;
	if (!this.response) {
		if (this.isGalSearch) {
			jsonObj = {SearchGalRequest:{_jsns:"urn:zimbraAccount"}};
			request = jsonObj.SearchGalRequest;
			if (this.galType) {
				request.type = this.galType;
			}
			if (this.expandDL) {
				request.needExp = 1;
			}
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
			if (this.conds && this.conds.length) {
				request.searchFilter = {conds:{}};
				request.searchFilter.conds = ZmSearch.prototype._applyJsonCond(this.conds, request);
			}
		} else if (this.isAutocompleteSearch) {
			jsonObj = {AutoCompleteRequest:{_jsns:"urn:zimbraMail"}};
			request = jsonObj.AutoCompleteRequest;
			if (this.limit) {
				request.limit = this.limit;
			}
			if (this.expandDL) {
				request.needExp = 1;
			}
			request.name = {_content:this.query};
		} else if (this.isGalAutocompleteSearch) {
			jsonObj = {AutoCompleteGalRequest:{_jsns:"urn:zimbraAccount"}};
			request = jsonObj.AutoCompleteGalRequest;
			request.limit = this._getLimit();
			request.name = this.query;
			if (this.galType) {
				request.type = this.galType;
			}
			if (this.expandDL) {
				request.needExp = 1;
			}
		} else if (this.isCalResSearch) {
			jsonObj = {SearchCalendarResourcesRequest:{_jsns:"urn:zimbraAccount"}};
			request = jsonObj.SearchCalendarResourcesRequest;
			if (this.attrs) {
				var attrs = [].concat(this.attrs);
				request.attrs = attrs.join(",");
			}
            request.offset = this.offset = (this.offset || 0);
            request.limit = this._getLimit();
			if (this.conds && this.conds.length) {
				request.searchFilter = {conds:{}};
				request.searchFilter.conds = ZmSearch.prototype._applyJsonCond(this.conds, request);
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
                            request.header.push({n: this.headers[hdr]});
                        }
                    }

					if (a.length == 1 && a[0] == ZmItem.TASK && this.allowableTaskStatus) {
						request.allowableTaskStatus = this.allowableTaskStatus;
					}
                }
            }
			if (this.inDumpster) {
				request.inDumpster = 1;
			}
        }
    }

	var respCallback = this._handleResponseExecute.bind(this, params.callback);

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

ZmSearch.prototype._applySoapCond =
function(inConds, soapDoc, condsEl, or) {
	if (or || this.join == ZmSearch.JOIN_OR) {
		condsEl.setAttribute("or", 1);
	}
	for (var i = 0; i < inConds.length; i++) {
		var c = inConds[i];
		if (AjxUtil.isArray(c)) {
			var subCondsEl = soapDoc.set("conds", null, condsEl);
			this._applySoapCond(c, soapDoc, subCondsEl, true);
		} else if (c.attr=="fullName" && c.op=="has") {
			var nameEl = soapDoc.set("name", c.value);
		} else {
			var condEl = soapDoc.set("cond", null, condsEl);
			condEl.setAttribute("attr", c.attr);
			condEl.setAttribute("op", c.op);
			condEl.setAttribute("value", c.value);
		}
	}
};

ZmSearch.prototype._applyJsonCond =
function(inConds, request, or) {
	var outConds = {};
	if (or || this.join == ZmSearch.JOIN_OR) {
		outConds.or = 1;
	}

	for (var i = 0; i < inConds.length; i++) {
		var c = inConds[i];
		if (AjxUtil.isArray(c)) {
			if (!outConds.conds)
				outConds.conds = [];
			outConds.conds.push(this._applyJsonCond(c, request, true));
		} else if (c.attr=="fullName" && c.op=="has") {
			request.name = {_content: c.value};
		} else {
			if (!outConds.cond)
				outConds.cond = [];
			outConds.cond.push({attr:c.attr, op:c.op, value:c.value});
		}
	}
	return outConds;
};

/**
 * Converts the response into a {ZmSearchResult} and passes it along.
 * 
 * @private
 */
ZmSearch.prototype._handleResponseExecute =
function(callback, result) {
	
	if (result) {
		var response = result.getResponse();
	
		if      (this.isGalSearch)				{ response = response.SearchGalResponse; }
		else if (this.isCalResSearch)			{ response = response.SearchCalendarResourcesResponse; }
		else if (this.isAutocompleteSearch)		{ response = response.AutoCompleteResponse; }
		else if (this.isGalAutocompleteSearch)	{ response = response.AutoCompleteGalResponse; }
		else if (this.soapInfo)					{ response = response[this.soapInfo.response]; }
		else									{ response = response.SearchResponse; }
	}
	else {
		response = { _jsns: "urn:zimbraMail", more: false };
	}
	var searchResult = new ZmSearchResult(this);
	searchResult.set(response);
	result = result || new ZmCsfeResult();
	result.set(searchResult);

	if (callback) {
		callback.run(result);
	}
};

/**
 * Fetches a conversation from the server.
 *
 * @param {Hash}		params				a hash of parameters:
 * @param {String}		params.cid			the conv ID
 * @param {AjxCallback}	params.callback		the callback to run with result
 * @param {String}		params.fetchId		the ID of msg to load
 * @param {Boolean}		params.markRead		if <code>true</code>, mark msg read
 * @param {Boolean}		params.noTruncate	if <code>true</code>, do not limit size of msg
 * @param {boolean}		params.needExp		if not <code>false</code>, have server check if addresses are DLs
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
		if (params.needExp !== false) {
			request.needExp = 1;
		}
		// added headers to the request
		if (ZmMailMsg.requestHeaders) {
			for (var hdr in ZmMailMsg.requestHeaders) {
				if (!request.header) request.header = [];
				request.header.push({n:ZmMailMsg.requestHeaders[hdr]});
			}
		}
	}

	if (!params.noTruncate) {
		request.max = appCtxt.get(ZmSetting.MAX_MESSAGE_SIZE);
	}

	var searchParams = {
		jsonObj:		jsonObj,
		asyncMode:		true,
		callback:		this._handleResponseGetConv.bind(this, params.callback),
		accountName:	this.accountName
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
			headerNode.setAttribute('n', ZmMailMsg.requestHeaders[hdr]);
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
				req.header.push({n:hdrs[hdr]});
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

/**
 * Tests the given item against a matching function generated from the query.
 * 
 * @param {ZmItem}	item		an item
 * @return	true if the item matches, false if it doesn't, and null if a matching function could not be generated
 */
ZmSearch.prototype.matches =
function(item) {
	var matchFunc = this.parsedQuery && this.parsedQuery.getMatchFunction();
	return matchFunc ? matchFunc(item) : null;
};

ZmSearch.prototype.isMatchable =
function(item) {
	var matchFunc = this.parsedQuery && this.parsedQuery.getMatchFunction();
	return (matchFunc != null);
};

/**
 * Returns true if the query has a folder-related term with the given value.
 * 
 * @param 	{string}	path		a folder path (optional)
 */
ZmSearch.prototype.hasFolderTerm =
function(path) {
	return this.parsedQuery && this.parsedQuery.hasTerm(["in", "under"], path);
};

/**
 * Replaces the old folder path with the new folder path in the query string, if found.
 * 
 * @param	{string}	oldPath		the old folder path
 * @param	{string}	newPath		the new folder path
 * 
 * @return	{boolean}	true if replacement was performed
 */
ZmSearch.prototype.replaceFolderTerm =
function(oldPath, newPath) {
	if (!this.parsedQuery) {
		return this.query;
	}
	var newQuery = this.parsedQuery.replaceTerm(["in", "under"], oldPath, newPath);
	if (newQuery) {
		this.query = newQuery;
	}
	return Boolean(newQuery);
};

/**
 * Returns true if the query has a tag term with the given value.
 * 
 * @param 	{string}	tagName		a tag name (optional)
 */
ZmSearch.prototype.hasTagTerm =
function(tagName) {
	return this.parsedQuery && this.parsedQuery.hasTerm("tag", tagName);
};

/**
 * Replaces the old tag name with the new tag name in the query string, if found.
 * 
 * @param	{string}	oldName		the old tag name
 * @param	{string}	newName		the new tag name
 * 
 * @return	{boolean}	true if replacement was performed
 */
ZmSearch.prototype.replaceTagTerm =
function(oldName, newName) {
	if (!this.parsedQuery) {
		return this.query;
	}
	var newQuery = this.parsedQuery.replaceTerm("tag", oldName, newName);
	if (newQuery) {
		this.query = newQuery;
	}
	return Boolean(newQuery);
};

/**
 * Returns true if the query has a term related to unread status.
 */
ZmSearch.prototype.hasUnreadTerm =
function() {
	return (this.parsedQuery && (this.parsedQuery.hasTerm("is", "read") ||
								 this.parsedQuery.hasTerm("is", "unread")));
};

/**
 * Returns true if the query has the term "is:anywhere".
 */
ZmSearch.prototype.isAnywhere =
function() {
	return (this.parsedQuery && this.parsedQuery.hasTerm("is", "anywhere"));
};

/**
 * Returns true if the query has a "content" term.
 */
ZmSearch.prototype.hasContentTerm =
function() {
	return (this.parsedQuery && this.parsedQuery.hasTerm("content"));
};

/**
 * Returns true if the query has just one term, and it's a folder or tag term.
 */
ZmSearch.prototype.isSimple =
function() {
	var pq = this.parsedQuery;
	if (pq && (pq.getNumTokens() == 1)) {
		return pq.hasTerm(["in", "inid", "tag"]);
	}
	return false;
};

ZmSearch.prototype.getTokens =
function() {
	return this.parsedQuery && this.parsedQuery.getTokens();
};

ZmSearch.prototype._setProperties =
function() {
	var props = this.parsedQuery && this.parsedQuery.getProperties();
	for (var key in props) {
		this[key] = props[key];
	}
};





/**
 * This class is a parsed representation of a query string. It parses the string into tokens.
 * A token is a paren, a conditional operator, or a search term (which has an operator and an
 * argument). The query string is assumed to be valid.
 * 
 * Compound terms such as "in:(inbox or sent)" will be exploded into multiple terms.
 * 
 * @param	{string}	query		a query string
 * 
 * TODO: handle "field[lastName]" and "#lastName"
 */
ZmParsedQuery = function(query) {
	this._tokens = this._parse(AjxStringUtil.trim(query, true));
};

ZmParsedQuery.prototype.isZmParsedQuery = true;
ZmParsedQuery.prototype.toString = function() { return "ZmParsedQuery"; };

ZmParsedQuery.TERM	= "TERM";	// search operator such as "in"
ZmParsedQuery.COND	= "COND";	// AND OR NOT
ZmParsedQuery.GROUP	= "GROUP";	// ( or )

ZmParsedQuery.OP_CONTENT	= "content";

ZmParsedQuery.OP_LIST = [
	"content", "subject", "msgid", "envto", "envfrom", "contact", "to", "from", "cc", "tofrom", 
	"tocc", "fromcc", "tofromcc", "in", "under", "inid", "underid", "has", "filename", "type", 
	"attachment", "is", "date", "mdate", "day", "week", "month", "year", "after", "before", 
	"size", "bigger", "larger", "smaller", "tag", "priority", "message", "my", "modseq", "conv", 
	"conv-count", "conv-minm", "conv-maxm", "conv-start", "conv-end", "appt-start", "appt-end", "author", "title", "keywords", 
	"company", "metadata", "item", "sort"
];
ZmParsedQuery.IS_OP		= AjxUtil.arrayAsHash(ZmParsedQuery.OP_LIST);

// valid arguments for the search term "is:"
ZmParsedQuery.IS_VALUES = [	"unread", "read", "flagged", "unflagged",
							"sent", "received", "replied", "unreplied", "forwarded", "unforwarded",
							"invite",
							"solo",
							"tome", "fromme", "ccme", "tofromme", "toccme", "fromccme", "tofromccme",
							"local", "remote", "anywhere" ];

// ops that can appear more than once in a query
ZmParsedQuery.MULTIPLE = {};
ZmParsedQuery.MULTIPLE["to"]	= true;
ZmParsedQuery.MULTIPLE["is"]	= true;
ZmParsedQuery.MULTIPLE["has"]	= true;
ZmParsedQuery.MULTIPLE["tag"]	= true;

ZmParsedQuery.isMultiple =
function(term) {
	return Boolean(term && ZmParsedQuery.MULTIPLE[term.op]);
};

// ops that are mutually exclusive
ZmParsedQuery.EXCLUDE = {};
ZmParsedQuery.EXCLUDE["before"]	= ["date"];
ZmParsedQuery.EXCLUDE["after"]	= ["date"];

// values that mutually exclusive - list value implies full multi-way exclusivity
ZmParsedQuery.EXCLUDE["is"]					= {};
ZmParsedQuery.EXCLUDE["is"]["read"]			= ["unread"];
ZmParsedQuery.EXCLUDE["is"]["flagged"]		= ["unflagged"];
ZmParsedQuery.EXCLUDE["is"]["sent"]			= ["received"];
ZmParsedQuery.EXCLUDE["is"]["replied"]		= ["unreplied"];
ZmParsedQuery.EXCLUDE["is"]["forwarded"]	= ["unforwarded"];
ZmParsedQuery.EXCLUDE["is"]["local"]		= ["remote", "anywhere"];
ZmParsedQuery.EXCLUDE["is"]["tome"]			= ["tofromme", "toccme", "tofromccme"];
ZmParsedQuery.EXCLUDE["is"]["fromme"]		= ["tofromme", "fromccme", "tofromccme"];
ZmParsedQuery.EXCLUDE["is"]["ccme"]			= ["toccme", "fromccme", "tofromccme"];

ZmParsedQuery._createExcludeMap =
function(excludes) {

	var excludeMap = {};
	for (var key in excludes) {
		var value = excludes[key];
		if (AjxUtil.isArray1(value)) {
			value.push(key);
			ZmParsedQuery._permuteExcludeMap(excludeMap, value);
		}
		else {
			for (var key1 in value) {
				var value1 = excludes[key][key1];
				value1.push(key1);
				ZmParsedQuery._permuteExcludeMap(excludeMap, AjxUtil.map(value1,
						function(val) {
							return new ZmSearchToken(key, val).toString();
						}));
			}
		}
	}
	return excludeMap;
};

// makes each possible pair in the list exclusive
ZmParsedQuery._permuteExcludeMap =
function(excludeMap, list) {
	if (list.length < 2) { return; }
	for (var i = 0; i < list.length - 1; i++) {
		var a = list[i];
		for (var j = i + 1; j < list.length; j++) {
			var b = list[j];
			excludeMap[a] = excludeMap[a] || {};
			excludeMap[b] = excludeMap[b] || {};
			excludeMap[a][b] = true;
			excludeMap[b][a] = true;
		}
	}
};

/**
 * Returns true if the given search terms should not appear in the same query.
 * 
 * @param {ZmSearchToken}	termA	search term
 * @param {ZmSearchToken}	termB	search term
 */
ZmParsedQuery.areExclusive =
function(termA, termB) {
	if (!termA || !termB) { return false; }
	var map = ZmParsedQuery.EXCLUDE_MAP;
	if (!map) {
		map = ZmParsedQuery.EXCLUDE_MAP = ZmParsedQuery._createExcludeMap(ZmParsedQuery.EXCLUDE);
	}
	var opA = termA.op, opB = termB.op;
	var strA = termA.toString(), strB = termB.toString();
	return Boolean((map[opA] && map[opA][opB]) || (map[opB] && map[opB][opA]) ||
				   (map[strA] && map[strA][strB]) || (map[strB] && map[strB][strA]));
};

// conditional ops
ZmParsedQuery.COND_AND		= "and"
ZmParsedQuery.COND_OR		= "or";
ZmParsedQuery.COND_NOT		= "not";
ZmParsedQuery.GROUP_OPEN	= "(";
ZmParsedQuery.GROUP_CLOSE	= ")";

// JS version of conditional
ZmParsedQuery.COND_OP = {};
ZmParsedQuery.COND_OP[ZmParsedQuery.COND_AND]	= " && ";
ZmParsedQuery.COND_OP[ZmParsedQuery.COND_OR]	= " || ";
ZmParsedQuery.COND_OP[ZmParsedQuery.COND_NOT]	= " !";

// word separators
ZmParsedQuery.EOW_LIST	= [" ", ":", ZmParsedQuery.GROUP_OPEN, ZmParsedQuery.GROUP_CLOSE];
ZmParsedQuery.IS_EOW	= AjxUtil.arrayAsHash(ZmParsedQuery.EOW_LIST);

// map is:xxx to item properties
ZmParsedQuery.FLAG = {};
ZmParsedQuery.FLAG["unread"]		= "item.isUnread";
ZmParsedQuery.FLAG["read"]			= "!item.isUnread";
ZmParsedQuery.FLAG["flagged"]		= "item.isFlagged";
ZmParsedQuery.FLAG["unflagged"]		= "!item.isFlagged";
ZmParsedQuery.FLAG["forwarded"]		= "item.isForwarded";
ZmParsedQuery.FLAG["unforwarded"]	= "!item.isForwarded";
ZmParsedQuery.FLAG["sent"]			= "item.isSent";
ZmParsedQuery.FLAG["replied"]		= "item.isReplied";
ZmParsedQuery.FLAG["unreplied"]		= "!item.isReplied";

ZmParsedQuery.prototype._parse =
function(query) {

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
	
	function skipSpace(str, pos) {
		while (pos < str.length && str.charAt(pos) == " ") {
			pos++;
		}
		return pos;
	}
	
	function fail(reason, query) {
		DBG.println(AjxDebug.DBG1, "ZmParsedQuery failure: " + reason + "; query: [" + query + "]");
		this.parseFailed = reason;
		return tokens;		
	}

	var len = query.length;
	var tokens = [], ch, lastCh, op, word = "", isEow = false, endOk = true, compound = 0;
	var pos = skipSpace(query, 0);
	while (pos < len) {
		lastCh = (ch != " ") ? ch : lastCh;
		ch = query.charAt(pos);
		isEow = ZmParsedQuery.IS_EOW[ch];

		if (ch == ":") {
			if (ZmParsedQuery.IS_OP[word]) {
				op = word;
			} else {
				return fail("unrecognized op '" + word + "'", query);
			}
			word = "";
			pos = skipSpace(query, pos + 1);
			continue;
		}

		if (isEow) {
			var lcWord = word.toLowerCase();
			var isCondOp = ZmParsedQuery.COND_OP[lcWord];
			if (op && word && !(isCondOp && compound > 0)) {
				tokens.push(new ZmSearchToken(op, lcWord));
				if (compound == 0) {
					op = "";
				}
				word = "";
				endOk = true;
			} else if (!op || (op && compound > 0)) {
				if (isCondOp) {
					tokens.push(new ZmSearchToken(lcWord));
					endOk = false;
					if (lcWord == ZmParsedQuery.COND_OR) {
						this.hasOrTerm = true;
					}
				} else if (word) {
					tokens.push(new ZmSearchToken(ZmParsedQuery.OP_CONTENT, word));
				}
				word = "";
			}
		}

		if (ch == '"') {
			var results = getQuotedStr(query, pos);
			if (results) {
				word = results.str;
				pos = results.pos;
			} else {
				return fail("improper use of quotes", query);
			}
		} else if (ch == ZmParsedQuery.GROUP_OPEN) {
			if (compound > 0) {
				compound++
			}
			else if (lastCh == ":") {
				compound = 1;
			}
			tokens.push(new ZmSearchToken(ch));
			pos = skipSpace(query, pos + 1);
		} else if (ch == ZmParsedQuery.GROUP_CLOSE) {
			if (compound > 0) {
				compound--;
			}
			tokens.push(new ZmSearchToken(ch));
			pos = skipSpace(query, pos + 1);
		} else if (ch == "-" && !word) {
			tokens.push(new ZmSearchToken(ZmParsedQuery.COND_NOT));
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
	if ((pos == query.length) && op && word) {
		tokens.push(new ZmSearchToken(op, word));
		endOk = true;
	} else if (!op && word) {
		tokens.push(new ZmSearchToken(word));
	}

	if (!endOk) {
		return fail("unexpected end of query", query);
	}
	
	return tokens;
};

ZmParsedQuery.prototype.getTokens =
function() {
	return this._tokens;
};

ZmParsedQuery.prototype.getNumTokens =
function() {
	return this._tokens ? this._tokens.length : 0;
};

ZmParsedQuery.prototype.getProperties =
function() {
	
	var props = {};
	for (var i = 0, len = this._tokens.length; i < len; i++) {
		var t = this._tokens[i];
		if (t.type == ZmParsedQuery.TERM) {
			if (t.op == "in" || t.op == "inid") {
				this.folderId = props.folderId = (t.op == "in") ? this._getFolderId(t.arg) : t.arg;
			}
		} else if (t.op == "tag") {
			// TODO: make sure there's only one tag term?
			this.tagId = props.tagId = this._getTagId(t.arg, true);
		}
	}
	return props;
};

/**
 * Returns a function based on the parsed query. The function is passed an item (msg or conv) and returns
 * true if the item matches the search.
 * 
 * @return {Function}	the match function
 * 
 * TODO: refactor so that items generate their code
 * TODO: handle more ops
 */
ZmParsedQuery.prototype.getMatchFunction =
function() {
	
	if (this._matchFunction) {
		return this._matchFunction;
	}
	if (this.parseFailed || this.hasTerm(ZmParsedQuery.OP_CONTENT)) {
		return null;
	}
	
	var folderId, tagId;
	var func = ["return Boolean("];
	for (var i = 0, len = this._tokens.length; i < len; i++) {
		var t = this._tokens[i];
		if (t.type == ZmParsedQuery.TERM) {
			if (t.op == "in" || t.op == "inid") {
				if (this.folderId) {
					func.push("((item.type == ZmItem.CONV) ? item.folders && item.folders['" + this.folderId +"'] : item.folderId == '" + this.folderId + "')");
				}
			} else if (t.op == "tag") {
				if (this.tagId) {
					func.push("item.hasTag('" + this.tagId + "')");
				}
			} else if (t.op == "is") {
				var test = ZmParsedQuery.FLAG[t.arg];
				if (test) {
					func.push(test);
				}
			}
			else {
				// search had a term we don't know how to match
				return null;
			}
			var next = this._tokens[i + 1];
			if (next && (next.type == ZmParsedQuery.TERM || next == ZmParsedQuery.COND[ZmParsedQuery.COND_NOT] || next == ZmParsedQuery.GROUP_CLOSE)) {
				func.push(ZmParsedQuery.COND_OP[ZmParsedQuery.COND_AND]);
			}
		}
		else if (t.type == ZmParsedQuery.COND) {
			func.push(ZmParsedQuery.COND_OP[t.op]);
		}
		else if (t.type == ZmParsedQuery.GROUP) {
			func.push(t.op);
		}
	}
	func.push(")");

	// the way multi-account searches are done, we set the queryHint *only* so
	// set the folderId if it exists for simple multi-account searches
	var isMultiAccountSearch = (appCtxt.multiAccounts && this.isMultiAccount() && !this.query && this.queryHint);
	if (!this.hasOrTerm || isMultiAccountSearch) {
		this.folderId = folderId;
		this.tagId = tagId;
	}
	
	try {
		this._matchFunction = new Function("item", func.join(""));
	} catch(ex) {}
	
	return this._matchFunction;
};

/**
 * Returns a query string that should be logically equivalent to the original query.
 */
ZmParsedQuery.prototype.createQuery =
function() {
	var terms = [];
	for (var i = 0, len = this._tokens.length; i < len; i++) {
		terms.push(this._tokens[i].toString());
	}
	return terms.join(" ");
};

// Returns the fully-qualified ID for the given folder path.
ZmParsedQuery.prototype._getFolderId =
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

// Returns the ID for the given tag name.
ZmParsedQuery.prototype._getTagId =
function(name, normalized) {
	var tagTree = appCtxt.getTagTree();
	if (tagTree) {
		var tag = tagTree.getByName(name.toLowerCase());
		if (tag) {
			return normalized ? tag.nId : tag.id;
		}
	}
	return null;
};

/**
 * Gets the given term with the given argument. Case-insensitive. Returns the first term found.
 * 
 * @param	{array}		opList		list of ops 
 * @param	{string}	value		argument value (optional)
 * 
 * @return	{object}	a token object, or null
 */
ZmParsedQuery.prototype.getTerm =
function(opList, value) {
	var opHash = AjxUtil.arrayAsHash(opList);
	var lcValue = value && value.toLowerCase();
	for (var i = 0, len = this._tokens.length; i < len; i++) {
		var t = this._tokens[i];
		var lcArg = t.arg && t.arg.toLowerCase();
		if (t.type == ZmParsedQuery.TERM && opHash[t.op] && (!value || lcArg == lcValue)) {
			return t;
		}
	}
	return null;
};

/**
 * Returns true if the query contains the given term with the given argument. Case-insensitive.
 * 
 * @param	{array}		opList		list of ops 
 * @param	{string}	value		argument value (optional)
 * 
 * @return	{boolean}	true if the query contains the given term with the given argument
 */
ZmParsedQuery.prototype.hasTerm =
function(opList, value) {
	return Boolean(this.getTerm(opList, value));
};

/**
 * Replaces the argument within the query for the given ops, if found. Case-insensitive. Replaces
 * only the first match.
 * 
 * @param	{array}		opList		list of ops 
 * @param	{string}	oldValue	the old argument
 * @param	{string}	newValue	the new argument
 * 
 * @return	{string}	a new query string (if the old argument was found and replaced), or the empty string
 */
ZmParsedQuery.prototype.replaceTerm =
function(opList, oldValue, newValue) {
	var lcValue = oldValue && oldValue.toLowerCase();
	var opHash = AjxUtil.arrayAsHash(opList);
	if (oldValue && newValue) {
		for (var i = 0, len = this._tokens.length; i < len; i++) {
			var t = this._tokens[i];
			var lcArg = t.arg && t.arg.toLowerCase();
			if (t.type == ZmParsedQuery.TERM && opHash[t.op] && (lcArg == lcValue)) {
				t.arg = newValue;
				return this.createQuery();
			}
		}
	}
	return "";
};

/**
 * This class represents one unit of a search query. That may be a search term ("is:unread"),
 * and conditional operator (AND, OR, NOT), or a grouping operator (left or right paren).
 * 
 * @param {string}	op		operator
 * @param {string}	arg		argument part of search term
 */
ZmSearchToken = function(op, arg) {
	
	if (op && arguments.length == 1) {
		var parts = op.split(":");
		op = parts[0];
		arg = parts[1];
	}
	
	this.op = op;
	this.arg = arg;
	if (ZmParsedQuery.IS_OP[op] && arg) {
		this.type = ZmParsedQuery.TERM;
	}
	else if (op && ZmParsedQuery.COND_OP[op.toLowerCase()]) {
		this.type = ZmParsedQuery.COND;
		this.op = op.toLowerCase();
	}
	else if (op == ZmParsedQuery.GROUP_OPEN || op == ZmParsedQuery.GROUP_CLOSE) {
		this.type = ZmParsedQuery.GROUP;
	} else if (op) {
		this.type = ZmParsedQuery.TERM;
		this.op = ZmParsedQuery.OP_CONTENT;
		this.arg = op;
	}
};

ZmSearchToken.prototype.isZmSearchToken = true;

/**
 * Returns the string version of this token.
 * 
 * @param {boolean}		force		if true, return "and" instead of an empty string ("and" is implied)
 */
ZmSearchToken.prototype.toString =
function(force) {
	if (this.type == ZmParsedQuery.TERM) {
		return (this.op == ZmParsedQuery.OP_CONTENT) ? this.arg : [this.op, this.arg].join(":");
	}
	else {
		return (!force && this.op == ZmParsedQuery.COND_AND) ? "" : this.op;
	}
};
