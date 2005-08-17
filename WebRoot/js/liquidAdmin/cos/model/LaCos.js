/**
* @class LaCos
* Data model for liquidCos object
* @ constructor LaCos
* @param app reference to the application instance
* @author Greg Solovyev
**/
function LaCos(app) {
	LaItem.call(this, LaEvent.S_COS);
	this.attrs = new Object();
	this.id = "";
	this.name="";
	this._app = app;	
}

LaCos.prototype = new LaItem;
LaCos.prototype.constructor = LaCos;
//object attributes
LaCos.A_liquidNotes="liquidNotes";
LaCos.A_liquidMailQuota="liquidMailQuota";
LaCos.A_liquidMinPwdLength="liquidPasswordMinLength";
LaCos.A_liquidMaxPwdLength="liquidPasswordMaxLength";
LaCos.A_liquidMinPwdAge = "liquidPasswordMinAge";
LaCos.A_liquidMaxPwdAge = "liquidPasswordMaxAge";
LaCos.A_liquidEnforcePwdHistory ="liquidPasswordEnforceHistory";
LaCos.A_liquidPasswordLocked = "liquidPasswordLocked";
LaCos.A_name = "cn";
LaCos.A_description = "description";
LaCos.A_liquidAttachmentsBlocked = "liquidAttachmentsBlocked";
LaCos.A_liquidAttachmentsViewInHtmlOnly = "liquidAttachmentsViewInHtmlOnly";
LaCos.A_liquidAuthTokenLifetime = "liquidAuthTokenLifetime";
LaCos.A_liquidAdminAuthTokenLifetime = "liquidAdminAuthTokenLifetime";
LaCos.A_liquidContactMaxNumEntries = "liquidContactMaxNumEntries";
LaCos.A_liquidMailMinPollingInterval = "liquidMailMinPollingInterval";
LaCos.A_liquidMailMessageLifetime = "liquidMailMessageLifetime";
LaCos.A_liquidMailTrashLifetime = "liquidMailTrashLifetime";
LaCos.A_liquidMailSpamLifetime = "liquidMailSpamLifetime";
LaCos.A_liquidMailHostPool = "liquidMailHostPool";
//prefs
LaCos.A_liquidPrefGroupMailBy = "liquidPrefGroupMailBy";
LaCos.A_liquidPrefIncludeSpamInSearch = "liquidPrefIncludeSpamInSearch";
LaCos.A_liquidPrefIncludeTrashInSearch = "liquidPrefIncludeTrashInSearch";
LaCos.A_liquidPrefMailInitialSearch = "liquidPrefMailInitialSearch";
LaCos.A_liquidPrefMailItemsPerPage = "liquidPrefMailItemsPerPage";
LaCos.A_liquidPrefMailPollingInterval = "liquidPrefMailPollingInterval";
LaCos.A_liquidPrefUseKeyboardShortcuts = "liquidPrefUseKeyboardShortcuts";
LaCos.A_liquidPrefSaveToSent = "liquidPrefSaveToSent";
LaCos.A_liquidPrefContactsPerPage="liquidPrefContactsPerPage";
LaCos.A_liquidPrefComposeInNewWindow = "liquidPrefComposeInNewWindow";
LaCos.A_liquidPrefForwardReplyInOriginalFormat = "liquidPrefForwardReplyInOriginalFormat";
LaCos.A_liquidPrefAutoAddAddressEnabled = "liquidPrefAutoAddAddressEnabled";
LaCos.A_liquidPrefMailItemsPerPage = "liquidPrefMailItemsPerPage";
LaCos.A_liquidPrefComposeFormat = "liquidPrefComposeFormat";
LaCos.A_liquidPrefMessageViewHtmlPreferred = "liquidPrefMessageViewHtmlPreferred";
LaCos.A_liquidPrefShowSearchString = "liquidPrefShowSearchString";
LaCos.A_liquidPrefMailSignatureStyle = "liquidPrefMailSignatureStyle";
LaCos.A_liquidPrefUseTimeZoneListInCalendar = "liquidPrefUseTimeZoneListInCalendar";
LaCos.A_liquidPrefImapSearchFoldersEnabled = "liquidPrefImapSearchFoldersEnabled";

//features
LaCos.A_liquidFeatureContactsEnabled="liquidFeatureContactsEnabled";
LaCos.A_liquidFeatureCalendarEnabled="liquidFeatureCalendarEnabled";
LaCos.A_liquidFeatureTaggingEnabled="liquidFeatureTaggingEnabled";
LaCos.A_liquidFeatureAdvancedSearchEnabled="liquidFeatureAdvancedSearchEnabled";
LaCos.A_liquidFeatureSavedSearchesEnabled="liquidFeatureSavedSearchesEnabled";
LaCos.A_liquidFeatureConversationsEnabled="liquidFeatureConversationsEnabled";
LaCos.A_liquidFeatureChangePasswordEnabled="liquidFeatureChangePasswordEnabled";
LaCos.A_liquidFeatureInitialSearchPreferenceEnabled="liquidFeatureInitialSearchPreferenceEnabled";
LaCos.A_liquidFeatureFiltersEnabled="liquidFeatureFiltersEnabled";
LaCos.A_liquidFeatureGalEnabled="liquidFeatureGalEnabled";
LaCos.A_liquidAttachmentsIndexingEnabled = "liquidAttachmentsIndexingEnabled";
LaCos.A_liquidImapEnabled = "liquidImapEnabled";
LaCos.A_liquidPop3Enabled = "liquidPop3Enabled";
LaCos.A_liquidFeatureHtmlComposeEnabled = "liquidFeatureHtmlComposeEnabled";


//internal attributes - do not send these to the server
LaCos.A_liquidMailAllServersInternal = "allserversarray";
LaCos.A_liquidMailHostPoolInternal = "hostpoolarray";

LaCos.prototype.load =
function (by, val) {
	var soapDoc = LsSoapDoc.create("GetCosRequest", "urn:liquidAdmin", null);
	var el = soapDoc.set("cos", val);
	el.setAttribute("by", by);
	var resp = LsCsfeCommand.invoke(soapDoc, null, null, null, true).firstChild;
	this.initFromDom(resp.firstChild);
}

/**
* massage the values into the instace suitable for an XForm
**/
LaCos.prototype.initFromDom =
function (node) {
	LaItem.prototype.initFromDom.call(this, node);
	
	this[LaCos.A_liquidMailAllServersInternal] = new Array();
	this[LaCos.A_liquidMailHostPoolInternal] = new Array();
		
	var hostVector = new LaItemVector();
	if(this.attrs[LaCos.A_liquidMailHostPool] instanceof Array) {	
		for(sname in this.attrs[LaCos.A_liquidMailHostPool]) {
			if(this._app.getServerMap()[this.attrs[LaCos.A_liquidMailHostPool][sname]]) {
				hostVector.add(this._app.getServerMap()[this.attrs[LaCos.A_liquidMailHostPool][sname]]);
			} else {
				var newServer = new LaServer(this._app);
				newServer.load("id", this.attrs[LaCos.A_liquidMailHostPool][sname]);
				hostVector.add(newServer);
			}
		}
	} else if(typeof(this.attrs[LaCos.A_liquidMailHostPool]) == 'string'){
		if(this._app.getServerMap()[this.attrs[LaCos.A_liquidMailHostPool]]) {
			hostVector.add(this._app.getServerMap()[this.attrs[LaCos.A_liquidMailHostPool]]);
		} else {
			var newServer = new LaServer();
			newServer.load("id", this.attrs[LaCos.A_liquidMailHostPool]);
			hostVector.add(newServer);
		}
	}
	
	/*var sourceArray = this._app.getServerList().getVector().getArray();
	var sourceVector = new LaItemVector();
	for(var ix in sourceArray) {
		if(!hostVector.contains(sourceArray[ix])) {
			sourceVector.add(sourceArray[ix]);
		}
	}*/	
	this[LaCos.A_liquidMailHostPoolInternal] = hostVector.getArray();
}


/**
* public LaCos.rename
* @param name - name for the new COS
* @param attrs - map of attributes
**/
LaCos.prototype.create = 
function(name, mods) {
	var soapDoc = LsSoapDoc.create("CreateCosRequest", "urn:liquidAdmin", null);
	soapDoc.set("name", name);
	for (var aname in mods) {
		//multy value attribute
		if(mods[aname] instanceof Array) {
			var cnt = mods[aname].length;
			if(cnt) { //only set if not empty
				for(var ix=0; ix <cnt; ix++) {
					var attr = soapDoc.set("a", mods[aname][ix]);
					attr.setAttribute("n", aname);
				}
			} 
		} else if(mods[aname] && (mods[aname].length || !isNaN(mods[aname]) )) {
			var attr = soapDoc.set("a", mods[aname]);
			attr.setAttribute("n", aname);
		}	
	}
	var resp = LsCsfeCommand.invoke(soapDoc, null, null, null, true).firstChild;
	this.initFromDom(resp.firstChild);
}

/**
* public LaCos.rename
* @param newName - new name
**/
LaCos.prototype.rename = 
function(newName) {
	var soapDoc = LsSoapDoc.create("RenameCosRequest", "urn:liquidAdmin", null);
	soapDoc.set("id", this.id);
	soapDoc.set("newName", newName);	
	var resp = LsCsfeCommand.invoke(soapDoc, null, null, null, true).firstChild;
	this.initFromDom(resp.firstChild);
}

/**
* public LaCos.remove
* sends DeleteCosRequest SOAP command
**/
LaCos.prototype.remove = 
function() {
	var soapDoc = LsSoapDoc.create("DeleteCosRequest", "urn:liquidAdmin", null);
	soapDoc.set("id", this.id);
	LsCsfeCommand.invoke(soapDoc, null, null, null, true);	
}
/**
* public LaCos.modify
* @param mods - map of modified attributes
**/
LaCos.prototype.modify = 
function (mods) {
	var soapDoc = LsSoapDoc.create("ModifyCosRequest", "urn:liquidAdmin", null);
	soapDoc.set("id", this.id);
	for (var aname in mods) {
		//multy value attribute
		if(mods[aname] instanceof Array) {
			var cnt = mods[aname].length;
			if(cnt) {
				for(var ix=0; ix <cnt; ix++) {
					var attr = soapDoc.set("a", mods[aname][ix]);
					attr.setAttribute("n", aname);
				}
			} else {
				//set empty values
				var attr = soapDoc.set("a", "");
				attr.setAttribute("n", aname);
			}
		} else {
			var attr = soapDoc.set("a", mods[aname]);
			attr.setAttribute("n", aname);
		}
	}
	var resp = LsCsfeCommand.invoke(soapDoc, null, null, null, true).firstChild;
	//update itseld
	this.initFromDom(resp.firstChild);
		
}

/**
* Returns HTML for a tool tip for this cos.
*/
LaCos.prototype.getToolTip =
function() {
	// update/null if modified
	if (!this._toolTip) {
		var html = new Array(20);
		var idx = 0;
		html[idx++] = "<table cellpadding='0' cellspacing='0' border='0'>";
		html[idx++] = "<tr valign='center'><td colspan='2' align='left'>";
		html[idx++] = "<div style='border-bottom: 1px solid black; white-space:nowrap; overflow:hidden;'>";
		html[idx++] = "<table cellpadding='0' cellspacing='0' border='0' style='width:100%;'>";
		html[idx++] = "<tr valign='center'>";
		html[idx++] = "<td><b>" + LsStringUtil.htmlEncode(this.name) + "</b></td>";
		html[idx++] = "<td align='right'>";
		html[idx++] = LsImg.getImageHtml(LaImg.I_COS);				
		html[idx++] = "</td>";
		html[idx++] = "</table></div></td></tr>";
		html[idx++] = "<tr></tr>";
		idx = this._addAttrRow(LaItem.A_description, html, idx);
		idx = this._addAttrRow(LaItem.A_liquidId, html, idx);
		idx = this._addAttrRow(LaItem.A_liquidMailQuota, this.attrs.liquidMailQuota, html, idx);		
		html[idx++] = "</table>";
		this._toolTip = html.join("");
	}
	return this._toolTip;
}

LaCos.getAll =
function(app) {
	var soapDoc = LsSoapDoc.create("GetAllCosRequest", "urn:liquidAdmin", null);	
	var resp = LsCsfeCommand.invoke(soapDoc, null, null, null, true).firstChild;
	var list = new LaItemList("cos", LaCos, app);
	list.loadFromDom(resp);
	//list.sortByName();		
	return list;
}
LaCos.myXModel = new Object();
LaCos.myXModel.items = new Array();
		LaCos.myXModel.items.push({id:LaItem.A_liquidId, type:_STRING_, ref:"attrs/" + LaItem.A_liquidId});
		LaCos.myXModel.items.push({id:LaCos.A_liquidMailAllServersInternal, type:_LIST_, ref:LaCos.A_liquidMailAllServersInternal});
		LaCos.myXModel.items.push({id:LaCos.A_liquidMailHostPoolInternal, type:_LIST_, ref:LaCos.A_liquidMailHostPoolInternal});
		LaCos.myXModel.items.push({id:LaCos.A_liquidNotes, type:_STRING_, ref:"attrs/"+LaCos.A_liquidNotes});
		LaCos.myXModel.items.push({id:LaCos.A_liquidMailQuota, type:_MAILQUOTA_, ref:"attrs."+LaCos.A_liquidMailQuota}); 
		LaCos.myXModel.items.push({id:LaCos.A_liquidMinPwdLength, type:_NUMBER_, ref:"attrs/"+LaCos.A_liquidMinPwdLength, maxInclusive:2147483647, minInclusive:0}); 
		LaCos.myXModel.items.push({id:LaCos.A_liquidMaxPwdLength, type:_NUMBER_, ref:"attrs/"+LaCos.A_liquidMaxPwdLength, maxInclusive:2147483647, minInclusive:0}); 
		LaCos.myXModel.items.push({id:LaCos.A_liquidMinPwdAge, type:_NUMBER_, ref:"attrs/"+LaCos.A_liquidMinPwdAge, maxInclusive:2147483647, minInclusive:0}); 
		LaCos.myXModel.items.push({id:LaCos.A_liquidMaxPwdAge, type:_NUMBER_, ref:"attrs/"+LaCos.A_liquidMaxPwdAge, maxInclusive:2147483647, minInclusive:0});
		LaCos.myXModel.items.push({id:LaCos.A_liquidEnforcePwdHistory, type:_NUMBER_, ref:"attrs/"+LaCos.A_liquidEnforcePwdHistory, maxInclusive:2147483647, minInclusive:0});
		LaCos.myXModel.items.push({id:LaCos.A_liquidPasswordLocked, type:_ENUM_, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaCos.A_liquidPasswordLocked});
		LaCos.myXModel.items.push({id:LaCos.A_name, type:_STRING_, ref:"attrs/"+LaCos.A_name, pattern:/^[A-Za-z0-9]+$/});
		LaCos.myXModel.items.push({id:LaCos.A_description, type:_STRING_, ref:"attrs/"+LaCos.A_description});
		LaCos.myXModel.items.push({id:LaCos.A_liquidAttachmentsBlocked, type:_ENUM_, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaCos.A_liquidAttachmentsBlocked});
		LaCos.myXModel.items.push({id:LaCos.A_liquidAttachmentsViewInHtmlOnly, type:_ENUM_, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaCos.A_liquidAttachmentsViewInHtmlOnly});
		LaCos.myXModel.items.push({id:LaCos.A_liquidAuthTokenLifetime, type:_STRING_, ref:"attrs/"+LaCos.A_liquidAuthTokenLifetime});
		LaCos.myXModel.items.push({id:LaCos.A_liquidAdminAuthTokenLifetime, type:_STRING_, ref:"attrs/"+LaCos.A_liquidAdminAuthTokenLifetime});
		LaCos.myXModel.items.push({id:LaCos.A_liquidContactMaxNumEntries, type:_NUMBER_, ref:"attrs/"+LaCos.A_liquidContactMaxNumEntries, maxInclusive:2147483647, minInclusive:0});
		LaCos.myXModel.items.push({id:LaCos.A_liquidMailMinPollingInterval, type:_NUMBER_, ref:"attrs/"+LaCos.A_liquidMailMinPollingInterval});
		LaCos.myXModel.items.push({id:LaCos.A_liquidMailMessageLifetime, type:_STRING_, ref:"attrs/"+LaCos.A_liquidMailMessageLifetime});
		LaCos.myXModel.items.push({id:LaCos.A_liquidMailTrashLifetime, type:_STRING_, ref:"attrs/"+LaCos.A_liquidMailTrashLifetime});
		LaCos.myXModel.items.push({id:LaCos.A_liquidMailSpamLifetime, type:_STRING_, ref:"attrs/"+LaCos.A_liquidMailSpamLifetime});
//pref		
		LaCos.myXModel.items.push({id:LaCos.A_liquidPrefGroupMailBy, type:_STRING_, ref:"attrs/"+LaCos.A_liquidPrefGroupMailBy});
		LaCos.myXModel.items.push({id:LaCos.A_liquidPrefIncludeSpamInSearch, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaCos.A_liquidPrefIncludeSpamInSearch, type:_ENUM_});
		LaCos.myXModel.items.push({id:LaCos.A_liquidPrefIncludeTrashInSearch, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaCos.A_liquidPrefIncludeTrashInSearch, type:_ENUM_});		
		LaCos.myXModel.items.push({id:LaCos.A_liquidPrefMailInitialSearch, type:_STRING_, ref:"attrs/"+LaCos.A_liquidPrefMailInitialSearch});
		LaCos.myXModel.items.push({id:LaCos.A_liquidPrefMailItemsPerPage, type:_NUMBER_, ref:"attrs/"+LaCos.A_liquidPrefMailItemsPerPage});
		LaCos.myXModel.items.push({id:LaCos.A_liquidPrefMailPollingInterval, type:_NUMBER_, ref:"attrs/"+LaCos.A_liquidPrefMailPollingInterval});
		LaCos.myXModel.items.push({id:LaCos.A_liquidPrefUseKeyboardShortcuts, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaCos.A_liquidPrefUseKeyboardShortcuts, type:_ENUM_});
		LaCos.myXModel.items.push({id:LaCos.A_liquidPrefSaveToSent, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaCos.A_liquidPrefSaveToSent, type:_ENUM_});
		LaCos.myXModel.items.push({id:LaCos.A_liquidPrefContactsPerPage, type:_NUMBER_, ref:"attrs/"+LaCos.A_liquidPrefContactsPerPage, choices:[10,25,50,100]});
		LaCos.myXModel.items.push({id:LaCos.A_liquidPrefMailItemsPerPage, type:_NUMBER_, ref:"attrs/"+LaCos.A_liquidPrefMailItemsPerPage, choices:[10,25,50,100]});
		LaCos.myXModel.items.push({id:LaCos.A_liquidPrefComposeInNewWindow, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaCos.A_liquidPrefComposeInNewWindow, type:_ENUM_});				
		LaCos.myXModel.items.push({id:LaCos.A_liquidPrefForwardReplyInOriginalFormat, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaCos.A_liquidPrefForwardReplyInOriginalFormat, type:_ENUM_});
		LaCos.myXModel.items.push({id:LaCos.A_liquidPrefComposeFormat, choices:LaModel.COMPOSE_FORMAT_CHOICES, ref:"attrs/"+LaCos.A_liquidPrefComposeFormat, type:_ENUM_});		
		LaCos.myXModel.items.push({id:LaCos.A_liquidPrefAutoAddAddressEnabled, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaCos.A_liquidPrefAutoAddAddressEnabled, type:_ENUM_});								
		LaCos.myXModel.items.push({id:LaCos.A_liquidPrefImapSearchFoldersEnabled, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaCos.A_liquidPrefImapSearchFoldersEnabled, type:_ENUM_});				
		LaCos.myXModel.items.push({id:LaCos.A_liquidPrefGroupMailBy, choices:LaModel.GROUP_MAIL_BY_CHOICES, ref:"attrs/"+LaCos.A_liquidPrefGroupMailBy, type:_ENUM_});		
		LaCos.myXModel.items.push({id:LaCos.A_liquidPrefMessageViewHtmlPreferred, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaCos.A_liquidPrefMessageViewHtmlPreferred, type:_ENUM_});
		LaCos.myXModel.items.push({id:LaCos.A_liquidPrefShowSearchString, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaCos.A_liquidPrefShowSearchString, type:_ENUM_});		
		LaCos.myXModel.items.push({id:LaCos.A_liquidPrefMailSignatureStyle, choices:LaModel.SIGNATURE_STYLE_CHOICES, ref:"attrs/"+LaCos.A_liquidPrefMailSignatureStyle, type:_ENUM_});				
		LaCos.myXModel.items.push({id:LaCos.A_liquidPrefUseTimeZoneListInCalendar, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaCos.A_liquidPrefUseTimeZoneListInCalendar, type:_ENUM_});		
		
//features
		LaCos.myXModel.items.push({id:LaCos.A_liquidFeatureContactsEnabled, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaCos.A_liquidFeatureContactsEnabled, type:_ENUM_});
		LaCos.myXModel.items.push({id:LaCos.A_liquidFeatureCalendarEnabled, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaCos.A_liquidFeatureCalendarEnabled, type:_ENUM_});
		LaCos.myXModel.items.push({id:LaCos.A_liquidFeatureTaggingEnabled, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaCos.A_liquidFeatureTaggingEnabled, type:_ENUM_});
		LaCos.myXModel.items.push({id:LaCos.A_liquidFeatureAdvancedSearchEnabled, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaCos.A_liquidFeatureAdvancedSearchEnabled, type:_ENUM_});
		LaCos.myXModel.items.push({id:LaCos.A_liquidFeatureSavedSearchesEnabled, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaCos.A_liquidFeatureSavedSearchesEnabled, type:_ENUM_});
		LaCos.myXModel.items.push({id:LaCos.A_liquidFeatureConversationsEnabled, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaCos.A_liquidFeatureConversationsEnabled, type:_ENUM_});
		LaCos.myXModel.items.push({id:LaCos.A_liquidFeatureChangePasswordEnabled, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaCos.A_liquidFeatureChangePasswordEnabled, type:_ENUM_});
		LaCos.myXModel.items.push({id:LaCos.A_liquidFeatureHtmlComposeEnabled, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaCos.A_liquidFeatureHtmlComposeEnabled, type:_ENUM_});		
		LaCos.myXModel.items.push({id:LaCos.A_liquidFeatureInitialSearchPreferenceEnabled, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaCos.A_liquidFeatureInitialSearchPreferenceEnabled, type:_ENUM_});
		LaCos.myXModel.items.push({id:LaCos.A_liquidFeatureFiltersEnabled, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaCos.A_liquidFeatureFiltersEnabled, type:_ENUM_});
		LaCos.myXModel.items.push({id:LaCos.A_liquidFeatureGalEnabled, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaCos.A_liquidFeatureGalEnabled, type:_ENUM_});
		LaCos.myXModel.items.push({id:LaCos.A_liquidAttachmentsIndexingEnabled, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaCos.A_liquidAttachmentsIndexingEnabled, type:_ENUM_});																
		LaCos.myXModel.items.push({id:LaCos.A_liquidImapEnabled, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaCos.A_liquidImapEnabled, type:_ENUM_});
		LaCos.myXModel.items.push({id:LaCos.A_liquidFeatureHtmlComposeEnabled, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaCos.A_liquidFeatureHtmlComposeEnabled, type:_ENUM_});		
		LaCos.myXModel.items.push({id:LaCos.A_liquidImapEnabled, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaCos.A_liquidImapEnabled, type:_ENUM_});		
		LaCos.myXModel.items.push({id:LaCos.A_liquidPop3Enabled, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaCos.A_liquidPop3Enabled, type:_ENUM_});				
