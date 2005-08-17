/**
* @class LaAccount
* @contructor LaAccount
* @param LaApp app
* this class is a model for liquidAccount ldap objects
* @author Roland Schemers
* @author Greg Solovyev
**/
function LaAccount(app) {
	LaItem.call(this, app);
	this.attrs = new Object();
	this.id = "";
	this.name="";
	this.attrs[LaAccount.A_liquidMailAlias] = new Array();
}

LaAccount.prototype = new LaItem;
LaAccount.prototype.constructor = LaAccount;

//object attributes
LaAccount.A_name = "name";
LaAccount.A_uid = "uid";
LaAccount.A_accountName = "cn"; //contact name
LaAccount.A_firstName = "givenName"; //first name
LaAccount.A_lastName = "sn"; //last name
LaAccount.A_mail = "mail";
LaAccount.A_password = "password";
LaAccount.A_description = "description";
LaAccount.A_telephoneNumber = "telephoneNumber";
LaAccount.A_displayname = "displayName";
LaAccount.A_country = "co"; //country
LaAccount.A_company = "company";
LaAccount.A_initials = "initials"; //middle initial
LaAccount.A_city = "l";
LaAccount.A_orgUnit = "ou";
LaAccount.A_office = "physicalDeliveryOfficeName";
LaAccount.A_postalAddress = "postalAddress";
LaAccount.A_zip = "postalCode";
LaAccount.A_state = "st";
LaAccount.A_mailDeliveryAddress = "liquidMailDeliveryAddress";
LaAccount.A_accountStatus = "liquidAccountStatus";
LaAccount.A_notes = "liquidNotes";
LaAccount.A_liquidMailQuota = "liquidMailQuota";
LaAccount.A_mailHost = "liquidMailHost";
LaAccount.A_COSId = "liquidCOSId";
LaAccount.A_isAdminAccount = "liquidIsAdminAccount";
LaAccount.A_liquidMinPwdLength="liquidPasswordMinLength";
LaAccount.A_liquidMaxPwdLength="liquidPasswordMaxLength";
LaAccount.A_liquidMinPwdAge="liquidPasswordMinAge";
LaAccount.A_liquidMaxPwdAge="liquidPasswordMaxAge";
LaAccount.A_liquidEnforcePwdHistory="liquidPasswordEnforceHistory";
LaAccount.A_liquidMailAlias="liquidMailAlias";
LaAccount.A_liquidMailForwardingAddress="liquidMailForwardingAddress";
LaAccount.A_liquidPasswordMustChange="liquidPasswordMustChange";
LaAccount.A_liquidPasswordLocked="liquidPasswordLocked";
LaAccount.A_liquidDomainName = "liquidDomainName";
LaAccount.A_liquidContactMaxNumEntries = "liquidContactMaxNumEntries";
LaAccount.A_liquidAttachmentsBlocked = "liquidAttachmentsBlocked";
LaAccount.A_liquidAttachmentsViewInHtmlOnly = "liquidAttachmentsViewInHtmlOnly";
LaAccount.A_liquidAuthTokenLifetime = "liquidAuthTokenLifetime";
LaAccount.A_liquidMailMessageLifetime = "liquidMailMessageLifetime";
LaAccount.A_liquidMailSpamLifetime = "liquidMailSpamLifetime";
LaAccount.A_liquidMailTrashLifetime = "liquidMailTrashLifetime";

//prefs
LaAccount.A_prefSaveToSent="liquidPrefSaveToSent";
LaAccount.A_prefMailSignature="liquidPrefMailSignature";
LaAccount.A_prefMailSignatureEnabled="liquidPrefMailSignatureEnabled";
LaAccount.A_liquidPrefSentMailFolder = "liquidPrefSentMailFolder";
LaAccount.A_liquidPrefGroupMailBy = "liquidPrefGroupMailBy";
LaAccount.A_liquidPrefIncludeSpamInSearch = "liquidPrefIncludeSpamInSearch";
LaAccount.A_liquidPrefIncludeTrashInSearch = "liquidPrefIncludeTrashInSearch";
LaAccount.A_liquidPrefMailInitialSearch = "liquidPrefMailInitialSearch";
LaAccount.A_liquidPrefMailItemsPerPage = "liquidPrefMailItemsPerPage";
LaAccount.A_liquidPrefMailPollingInterval = "liquidPrefMailPollingInterval";
LaAccount.A_liquidPrefOutOfOfficeReply = "liquidPrefOutOfOfficeReply";
LaAccount.A_liquidPrefOutOfOfficeReplyEnabled = "liquidPrefOutOfOfficeReplyEnabled";
LaAccount.A_liquidPrefReplyToAddress = "liquidPrefReplyToAddress";
LaAccount.A_liquidPrefUseKeyboardShortcuts = "liquidPrefUseKeyboardShortcuts";
LaAccount.A_liquidPrefContactsPerPage = "liquidPrefContactsPerPage";
LaAccount.A_liquidMemberOf = "liquidMemberOf";
LaAccount.A_liquidPrefComposeInNewWindow = "liquidPrefComposeInNewWindow";
LaAccount.A_liquidPrefForwardReplyInOriginalFormat = "liquidPrefForwardReplyInOriginalFormat";
LaAccount.A_liquidPrefAutoAddAddressEnabled = "liquidPrefAutoAddAddressEnabled";
LaAccount.A_liquidPrefComposeFormat = "liquidPrefComposeFormat";
LaAccount.A_liquidPrefMessageViewHtmlPreferred = "liquidPrefMessageViewHtmlPreferred";
LaAccount.A_liquidPrefNewMailNotificationAddress = "liquidPrefNewMailNotificationAddress";
LaAccount.A_liquidPrefNewMailNotificationEnabled = "liquidPrefNewMailNotificationEnabled";
LaAccount.A_liquidPrefOutOfOfficeReply = "liquidPrefOutOfOfficeReply";
LaAccount.A_liquidPrefOutOfOfficeReplyEnabled = "liquidPrefOutOfOfficeReplyEnabled";
LaAccount.A_liquidPrefShowSearchString = "liquidPrefShowSearchString";
LaAccount.A_liquidPrefMailSignatureStyle = "liquidPrefMailSignatureStyle";
LaAccount.A_liquidPrefUseTimeZoneListInCalendar = "liquidPrefUseTimeZoneListInCalendar";
LaAccount.A_liquidPrefImapSearchFoldersEnabled = "liquidPrefImapSearchFoldersEnabled";

//features
LaAccount.A_liquidFeatureContactsEnabled="liquidFeatureContactsEnabled";
LaAccount.A_liquidFeatureCalendarEnabled="liquidFeatureCalendarEnabled";
LaAccount.A_liquidFeatureTaggingEnabled="liquidFeatureTaggingEnabled";
LaAccount.A_liquidFeatureAdvancedSearchEnabled="liquidFeatureAdvancedSearchEnabled";
LaAccount.A_liquidFeatureSavedSearchesEnabled="liquidFeatureSavedSearchesEnabled";
LaAccount.A_liquidFeatureConversationsEnabled="liquidFeatureConversationsEnabled";
LaAccount.A_liquidFeatureChangePasswordEnabled="liquidFeatureChangePasswordEnabled";
LaAccount.A_liquidFeatureInitialSearchPreferenceEnabled="liquidFeatureInitialSearchPreferenceEnabled";
LaAccount.A_liquidFeatureFiltersEnabled="liquidFeatureFiltersEnabled";
LaAccount.A_liquidFeatureGalEnabled="liquidFeatureGalEnabled";
LaAccount.A_liquidAttachmentsIndexingEnabled = "liquidAttachmentsIndexingEnabled";
LaAccount.A_liquidFeatureHtmlComposeEnabled = "liquidFeatureHtmlComposeEnabled";
LaAccount.A_liquidImapEnabled = "liquidImapEnabled";
LaAccount.A_liquidPop3Enabled = "liquidPop3Enabled";

//readonly
LaAccount.A_liquidLastLogonTimestamp = "liquidLastLogonTimestamp";
LaAccount.A_liquidPasswordModifiedTime = "liquidPasswordModifiedTime";


LaAccount.ACCOUNT_STATUS_ACTIVE = "active";
LaAccount.ACCOUNT_STATUS_MAINTENANCE = "maintenance";
LaAccount.ACCOUNT_STATUS_LOCKED = "locked";
LaAccount.ACCOUNT_STATUS_CLOSED = "closed";

//this attributes are not used in the XML object, but is used in the model
LaAccount.A2_confirmPassword = "confirmPassword";
LaAccount.A2_mbxsize = "mbxSize";
LaAccount.A2_quota = "quota2";
LaAccount.A2_autodisplayname = "autodisplayname";
LaAccount.A2_myCOS = "mycos";
LaAccount.A2_newAlias = "newalias";
//LaAccount.A2_newForward = "newforward";
LaAccount.A2_aliases = "aliases";
LaAccount.A2_forwarding = "forwardings";

LaAccount.MAXSEARCHRESULTS = "500";
LaAccount.RESULTSPERPAGE = "25";

LaAccount.checkValues = 
function(tmpObj, app) {
	/**
	* check values
	**/

	if(tmpObj.name == null || tmpObj.name.length < 1) {
		//show error msg
		app.getCurrentController().popupMsgDialog(LaMsg.ERROR_ACCOUNT_NAME_REQUIRED);
		return false;
	}
	
	if(tmpObj.attrs[LaAccount.A_lastName] == null || tmpObj.attrs[LaAccount.A_lastName].length < 1) {
		//show error msg
		app.getCurrentController().popupMsgDialog(LaMsg.ERROR_ACCOUNT_LAST_NAME_REQUIRED);
		return false;
	}

	var emailRegEx = /^([a-zA-Z0-9_\-])+((\.)?([a-zA-Z0-9_\-])+)*@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	if(!emailRegEx.test(tmpObj.name) ) {
		//show error msg
		app.getCurrentController().popupMsgDialog(LaMsg.ERROR_ACCOUNT_NAME_INVALID);
		return false;
	}
	
	var myCos = null;
	var maxPwdLen = Number.POSITIVE_INFINITY;
	var minPwdLen = 1;	
	
	//find out what is this account's COS
	var cosList = app.getCosList().getArray();
	for(var ix in cosList) {
		if(cosList[ix].id == tmpObj.attrs[LaAccount.A_COSId]) {
			myCos = cosList[ix];
			break;
		}
	}
	//if the account did not have a valid cos id - pick the first COS
	if(!myCos && cosList.length > 0) {
		myCos = cosList[0];
		tmpObj.attrs[LaAccount.A_COSId] = cosList[0].id;
	}		
	//validate password length against this account's COS setting
	if(tmpObj.attrs[LaAccount.A_liquidMinPwdLength] != null) {
		minPwdLen = tmpObj.attrs[LaAccount.A_liquidMinPwdLength];
	} else {
		if(myCos) {
			if(myCos.attrs[LaCos.A_liquidMinPwdLength] > 0) {
				minPwdLen = myCos.attrs[LaCos.A_liquidMinPwdLength];
			}
		}
	}
	
	if(tmpObj.attrs[LaAccount.A_liquidMaxPwdLength] != null) {
		maxPwdLen = tmpObj.attrs[LaAccount.A_liquidMaxPwdLength];
	} else {
		if(myCos) {
			if(myCos.attrs[LaCos.A_liquidMaxPwdLength] > 0) {
				maxPwdLen = myCos.attrs[LaCos.A_liquidMaxPwdLength];
			}		
		}
	}
	//if there is a password - validate it
	if(tmpObj.attrs[LaAccount.A_password]!=null || tmpObj[LaAccount.A2_confirmPassword]!=null) {
		if(tmpObj.attrs[LaAccount.A_password] != tmpObj[LaAccount.A2_confirmPassword]) {
			//show error msg
			app.getCurrentController().popupMsgDialog(LaMsg.ERROR_PASSWORD_MISMATCH);
			return false;
		} 			
		if(tmpObj.attrs[LaAccount.A_password].length < minPwdLen || LsStringUtil.trim(tmpObj.attrs[LaAccount.A_password]).length < minPwdLen) { 
			//show error msg
			app.getCurrentController().popupMsgDialog(LaMsg.ERROR_PASSWORD_TOOSHORT + "<br>" + LaMsg.NAD_passMinLength +  minPwdLen);
			return false;		
		}
		
		if(LsStringUtil.trim(tmpObj.attrs[LaAccount.A_password]).length > maxPwdLen) { 
			//show error msg
			app.getCurrentController().popupMsgDialog(LaMsg.ERROR_PASSWORD_TOOLONG+ "<br>" + LaMsg.NAD_passMaxLength + maxPwdLen);
			return false;		
		}
	} 		
	if(tmpObj.attrs[LaAccount.A_liquidMailQuota] != "" && tmpObj.attrs[LaAccount.A_liquidMailQuota] !=null && !LsUtil.isNonNegativeInteger(tmpObj.attrs[LaAccount.A_liquidMailQuota])) {
		//show error msg
		app.getCurrentController().popupMsgDialog(LaMsg.ERROR_INVALID_VALUE + ": " + LaMsg.NAD_MailQuota + " ! ");
		return false;
	}

	if(tmpObj.attrs[LaAccount.A_liquidContactMaxNumEntries] != "" && tmpObj.attrs[LaAccount.A_liquidContactMaxNumEntries] !=null && !LsUtil.isNonNegativeInteger(tmpObj.attrs[LaAccount.A_liquidContactMaxNumEntries])) {
		//show error msg
		app.getCurrentController().popupMsgDialog(LaMsg.ERROR_INVALID_VALUE + ": " + LaMsg.NAD_ContactMaxNumEntries + " ! ");
		return false;
	}
	
	if(tmpObj.attrs[LaAccount.A_liquidContactMaxNumEntries])
		tmpObj.attrs[LaAccount.A_liquidContactMaxNumEntries] = parseInt	(tmpObj.attrs[LaAccount.A_liquidContactMaxNumEntries]);
	
	if(tmpObj.attrs[LaAccount.A_liquidMinPwdLength] != "" && tmpObj.attrs[LaAccount.A_liquidMinPwdLength] !=null && !LsUtil.isNonNegativeInteger(tmpObj.attrs[LaAccount.A_liquidMinPwdLength])) {
		//show error msg
		app.getCurrentController().popupMsgDialog(LaMsg.ERROR_INVALID_VALUE + ": " + LaMsg.NAD_passMinLength + " ! ");
		return false;
	}
	
	if(tmpObj.attrs[LaAccount.A_liquidMaxPwdLength] != "" && tmpObj.attrs[LaAccount.A_liquidMaxPwdLength] !=null && !LsUtil.isNonNegativeInteger(tmpObj.attrs[LaAccount.A_liquidMaxPwdLength])) {
		//show error msg
		app.getCurrentController().popupMsgDialog(LaMsg.ERROR_INVALID_VALUE + ": " + LaMsg.NAD_passMaxLength + " ! ");
		return false;
	}	
	
	if(parseInt(tmpObj.attrs[LaAccount.A_liquidMaxPwdLength]) < parseInt(tmpObj.attrs[LaAccount.A_liquidMinPwdLength]) && parseInt(tmpObj.attrs[LaAccount.A_liquidMaxPwdLength]) > 0) {
		//show error msg
		app.getCurrentController().popupMsgDialog(LaMsg.ERROR_MAX_MIN_PWDLENGTH);

		return false;
	}	
	if(tmpObj.attrs[LaAccount.A_liquidMaxPwdLength])
		tmpObj.attrs[LaAccount.A_liquidMaxPwdLength] = parseInt(tmpObj.attrs[LaAccount.A_liquidMaxPwdLength]);
	
	if(tmpObj.attrs[LaAccount.A_liquidMinPwdLength])
		tmpObj.attrs[LaAccount.A_liquidMinPwdLength] = parseInt(tmpObj.attrs[LaAccount.A_liquidMinPwdLength]);
		
	if(tmpObj.attrs[LaAccount.A_liquidMinPwdAge] != "" && tmpObj.attrs[LaAccount.A_liquidMinPwdAge] !=null && !LsUtil.isNonNegativeInteger(tmpObj.attrs[LaAccount.A_liquidMinPwdAge])) {
		//show error msg
		app.getCurrentController().popupMsgDialog(LaMsg.ERROR_INVALID_VALUE + ": " + LaMsg.NAD_passMinAge + " ! ");

		return false;
	}		
	
	if(tmpObj.attrs[LaAccount.A_liquidMaxPwdAge] != "" && tmpObj.attrs[LaAccount.A_liquidMaxPwdAge] !=null && !LsUtil.isNonNegativeInteger(tmpObj.attrs[LaAccount.A_liquidMaxPwdAge])) {
		//show error msg
		app.getCurrentController().popupMsgDialog(LaMsg.ERROR_INVALID_VALUE + ": " + LaMsg.NAD_passMaxAge + " ! ");

		return false;
	}		
	
	if(parseInt(tmpObj.attrs[LaCos.A_liquidMaxPwdAge]) < parseInt(tmpObj.attrs[LaAccount.A_liquidMinPwdAge]) && parseInt(tmpObj.attrs[LaCos.A_liquidMaxPwdAge]) > 0) {
		//show error msg
		app.getCurrentController().popupMsgDialog(LaMsg.ERROR_MAX_MIN_PWDAGE);

		return false;
	}
	if(tmpObj.attrs[LaAccount.A_liquidMinPwdAge])
		tmpObj.attrs[LaAccount.A_liquidMinPwdAge] = parseInt(tmpObj.attrs[LaAccount.A_liquidMinPwdAge]);
	
	if(tmpObj.attrs[LaCos.A_liquidMaxPwdAge])
		tmpObj.attrs[LaCos.A_liquidMaxPwdAge] = parseInt(tmpObj.attrs[LaCos.A_liquidMaxPwdAge]);
	
	if(tmpObj.attrs[LaAccount.A_liquidAuthTokenLifetime] != "" && tmpObj.attrs[LaAccount.A_liquidAuthTokenLifetime] !=null && !LsUtil.isLifeTime(tmpObj.attrs[LaAccount.A_liquidAuthTokenLifetime])) {
		//show error msg
		app.getCurrentController().popupMsgDialog(LaMsg.ERROR_INVALID_VALUE + ": " + LaMsg.NAD_AuthTokenLifetime + " ! ");

		return false;
	}
	
	if(tmpObj.attrs[LaAccount.A_liquidMailMessageLifetime] != "" && tmpObj.attrs[LaAccount.A_liquidMailMessageLifetime] !=null && !LsUtil.isLifeTime(tmpObj.attrs[LaAccount.A_liquidMailMessageLifetime])) {
		//show error msg
		app.getCurrentController().popupMsgDialog(LaMsg.ERROR_INVALID_VALUE + ": " + LaMsg.NAD_MailMessageLifetime + " ! ");

		return false;
	}			

	if(tmpObj.attrs[LaAccount.A_liquidMailTrashLifetime] != "" && tmpObj.attrs[LaAccount.A_liquidMailTrashLifetime] !=null && !LsUtil.isLifeTime(tmpObj.attrs[LaAccount.A_liquidMailTrashLifetime])) {
		//show error msg
		app.getCurrentController().popupMsgDialog(LaMsg.ERROR_INVALID_VALUE + ": " + LaMsg.NAD_MailTrashLifetime + " ! ");

		return false;
	}	
	
	if(tmpObj.attrs[LaAccount.A_liquidMailSpamLifetime] != "" && tmpObj.attrs[LaAccount.A_liquidMailSpamLifetime] !=null && !LsUtil.isLifeTime(tmpObj.attrs[LaAccount.A_liquidMailSpamLifetime])) {
		//show error msg
		app.getCurrentController().popupMsgDialog(LaMsg.ERROR_INVALID_VALUE + ": " + LaMsg.NAD_MailSpamLifetime + " ! ");
		
		return false;
	}		

	if(tmpObj.attrs[LaAccount.A_liquidPrefContactsPerPage] != "" && tmpObj.attrs[LaAccount.A_liquidPrefContactsPerPage] !=null && !LsUtil.isNonNegativeInteger(tmpObj.attrs[LaAccount.A_liquidPrefContactsPerPage])) {
		//show error msg
		app.getCurrentController().popupMsgDialog(LaMsg.ERROR_INVALID_VALUE + ": " + LaMsg.NAD_PrefContactsPerPage + " ! ");

		return false;
	}	
	if(tmpObj.attrs[LaAccount.A_liquidPrefContactsPerPage])
		tmpObj.attrs[LaAccount.A_liquidPrefContactsPerPage] = parseInt(tmpObj.attrs[LaAccount.A_liquidPrefContactsPerPage]);

	if(tmpObj.attrs[LaAccount.A_passEnforceHistory] != "" && tmpObj.attrs[LaAccount.A_passEnforceHistory] !=null && !LsUtil.isNonNegativeInteger(tmpObj.attrs[LaAccount.A_passEnforceHistory])) {
		//show error msg
		app.getCurrentController().popupMsgDialog(LaMsg.ERROR_INVALID_VALUE + ": " + LaMsg.NAD_passEnforceHistory + " ! ");

		return false;
	}	
	if(tmpObj.attrs[LaAccount.A_passEnforceHistory])
		tmpObj.attrs[LaAccount.A_passEnforceHistory] = parseInt(tmpObj.attrs[LaAccount.A_passEnforceHistory]);
	return true;
}
/**
* Creates a new LaAccount. This method makes SOAP request to create a new account record. 
* @param attrs
* @param name 
* @param password
* @return LaAccount
**/
LaAccount.create =
function(tmpObj, app) {
	
	tmpObj.attrs[LaAccount.A_mail] = tmpObj.name;	
		
	//create SOAP request
	var soapDoc = LsSoapDoc.create("CreateAccountRequest", "urn:liquidAdmin", null);
	soapDoc.set(LaAccount.A_name, tmpObj.name);
	if(tmpObj.attrs[LaAccount.A_password] && tmpObj.attrs[LaAccount.A_password].length > 0)
		soapDoc.set(LaAccount.A_password, tmpObj.attrs[LaAccount.A_password]);
		
	for (var aname in tmpObj.attrs) {
		if(aname == LaAccount.A_password || aname == LaAccount.A_liquidMailAlias || aname == LaItem.A_objectClass || aname == LaAccount.A2_mbxsize || aname == LaAccount.A_mail) {
			continue;
		}	
		
		if(tmpObj.attrs[aname] instanceof Array) {
			var cnt = tmpObj.attrs[aname].length;
			if(cnt) {
				for(var ix=0; ix <cnt; ix++) {
					var attr = soapDoc.set("a", tmpObj.attrs[aname][ix]);
					attr.setAttribute("n", aname);
				}
			} 
		} else {	
			if(tmpObj.attrs[aname] != null) {
				var attr = soapDoc.set("a", tmpObj.attrs[aname]);
				attr.setAttribute("n", aname);
			}
		}
	}
	try {
		var resp = LsCsfeCommand.invoke(soapDoc, null, null, null, true).firstChild;
	} catch (ex) {
		switch(ex.code) {
			case LsCsfeException.ACCT_EXISTS:
				app.getCurrentController().popupMsgDialog(LaMsg.ERROR_ACCOUNT_EXISTS);
			break;
			case LsCsfeException.ACCT_INVALID_PASSWORD:
				app.getCurrentController().popupMsgDialog(LaMsg.ERROR_PASSWORD_INVALID);
			break;
			default:
				app.getCurrentController()._handleException(ex, "LaAccount.create", null, false);
			break;
		}
		return null;
	}
	var account = new LaAccount(app);
	account.initFromDom(resp.firstChild);
	
	//add aliases
	if(tmpObj.attrs[LaAccount.A_liquidMailAlias].length) {
		var tmpObjCnt = tmpObj.attrs[LaAccount.A_liquidMailAlias].length;
		var failedAliases = "";
		var failedAliasesCnt = 0;
		try {
			for(var ix=0; ix < tmpObjCnt; ix++) {
				try {
					account.addAlias(tmpObj.attrs[LaAccount.A_liquidMailAlias][ix]);
					account.attrs[LaAccount.A_liquidMailAlias].push(tmpObj.attrs[LaAccount.A_liquidMailAlias][ix]);
				} catch (ex) {
					if(ex.code == LsCsfeException.ACCT_EXISTS) {
						//if failed because account exists just show a warning
						failedAliases += ("<br>" + tmpObj.attrs[LaAccount.A_liquidMailAlias][ix]);
						failedAliasesCnt++;
					} else {
						//if failed for another reason - jump out
						throw (ex);
					}
				}
			}
			if(failedAliasesCnt == 1) {
				app.getCurrentController().popupMsgDialog(LaMsg.WARNING_ALIAS_EXISTS + failedAliases);
			} else if(failedAliasesCnt > 1) {
				app.getCurrentController().popupMsgDialog(LaMsg.WARNING_ALIASES_EXIST + failedAliases);
			}
		} catch (ex) {
			app.getCurrentController().popupMsgDialog(LaMsg.FAILED_ADD_ALIASES, ex);
			return null;
		}	
	}	
	return account;
}

/**
* @method modify
* Updates LaAccount attributes (SOAP)
* @param mods set of modified attributes and their new values
*/
LaAccount.prototype.modify =
function(mods) {
	//update the object
	var soapDoc = LsSoapDoc.create("ModifyAccountRequest", "urn:liquidAdmin", null);
	soapDoc.set("id", this.id);
	for (var aname in mods) {
		//multy value attribute
		if(mods[aname] instanceof Array) {
			var cnt = mods[aname].length;
			if(cnt) {
				for(var ix=0; ix <cnt; ix++) {
					if(mods[aname][ix]) { //if there is an empty element in the array - don't send it
						var attr = soapDoc.set("a", mods[aname][ix]);
						attr.setAttribute("n", aname);
					}
				}
			} else {
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
	this[LaAccount.A2_confirmPassword] = null;
	return;
}


/**
* @param newAlias
* addAlias adds one alias to the account. Adding each alias takes separate Soap Request
**/
LaAccount.prototype.addAlias = 
function (newAlias) {
	var soapDoc = LsSoapDoc.create("AddAccountAliasRequest", "urn:liquidAdmin", null);
	soapDoc.set("id", this.id);
	soapDoc.set("alias", newAlias);	
	LsCsfeCommand.invoke(soapDoc, null, null, null, true);	
}

/**
* @param aliasToRemove
* addAlias adds one alias to the account. Adding each alias takes separate Soap Request
**/
LaAccount.prototype.removeAlias = 
function (aliasToRemove) {
	var soapDoc = LsSoapDoc.create("RemoveAccountAliasRequest", "urn:liquidAdmin", null);
	soapDoc.set("id", this.id);
	soapDoc.set("alias", aliasToRemove);	
	LsCsfeCommand.invoke(soapDoc, null, null, null, true);	
}


LaAccount.getSearchByNameQuery =
function(n) {
	if (n == null || n == "") {
		return "";
	} else {
		return ("(|(cn=*"+n+"*)(sn=*"+n+"*)(gn=*"+n+"*)(displayName=*"+n+"*)(liquidMalAlias=*"+n+"*)(liquidId="+n+")(liquidMailAddress=*"+n+"*)(liquidMailDeliveryAddress=*"+n+"*))");
	}
}

LaAccount.searchByQueryHolder = 
function (queryHolder, pagenum, orderby, isascending, app) {
	if(queryHolder.isByDomain) {
 		return LaAccount.searchByDomain(queryHolder.byValAttr, pagenum, orderby, isascending, app);
	} else {
		return LaAccount.search(queryHolder.queryString, pagenum, orderby, isascending, app);	
	}
}

LaAccount.getViewMailLink = 
function(accId) {
	var retVal={authToken:"", lifetime:0};
	var soapDoc = LsSoapDoc.create("DelegateAuthRequest", "urn:liquidAdmin", null);	
	var attr = soapDoc.set("account", accId);
	attr.setAttribute("by", "id");
	var resp = LsCsfeCommand.invoke(soapDoc, null, null, null, true).firstChild;	
	var children = resp.childNodes;
	for (var i=0; i< children.length;  i++) {
		child = children[i];
		if(child.nodeName == "authToken") {
			if(child.firstChild != null)
				retVal.authToken = child.firstChild.nodeValue;
		} else if (child.nodeName == "lifetime") {
			if(child.firstChild != null)
				retVal.lifetime= child.firstChild.nodeValue;
		}
	}
	return retVal;
}

LaAccount.search =
function(query, pagenum, orderby, isascending, app) {
	if(!orderby) orderby = LaAccount.A_uid;
	var myisascending = "0";
	
	if(isascending) {
		myisascending = "1";
	} 
	
	var offset = (pagenum-1) * LaAccount.RESULTSPERPAGE;
	var attrs = LaAccount.A_displayname + "," + LaItem.A_liquidId + "," + LaAccount.A_mailHost + "," + LaAccount.A_uid + "," + LaAccount.A_accountStatus + "," + LaAccount.A_description;
	var soapDoc = LsSoapDoc.create("SearchAccountsRequest", "urn:liquidAdmin", null);
	soapDoc.set("query", query);
	soapDoc.getMethod().setAttribute("offset", offset);
	soapDoc.getMethod().setAttribute("limit", LaAccount.RESULTSPERPAGE);
	soapDoc.getMethod().setAttribute("applyCos", "0");
	soapDoc.getMethod().setAttribute("attrs", attrs);
	soapDoc.getMethod().setAttribute("sortBy", orderby);
	soapDoc.getMethod().setAttribute("sortAscending", myisascending);
	var resp = LsCsfeCommand.invoke(soapDoc, null, null, null, true).firstChild;
	var list = new LaItemList("account", LaAccount, app);
	list.loadFromDom(resp);
	var searchTotal = resp.getAttribute("searchTotal");
	var numPages = Math.ceil(searchTotal/LaAccount.RESULTSPERPAGE);
	return {"list":list, "numPages":numPages};
}


LaAccount.prototype.initFromDom =
function(node) {
	this.name = node.getAttribute("name");
	this.id = node.getAttribute("id");
	this.attrs[LaAccount.A_liquidMailAlias] = new Array();
	this.attrs[LaAccount.A_liquidMailForwardingAddress] = new Array();
	var children = node.childNodes;
	for (var i=0; i< children.length;  i++) {
		child = children[i];
		if (child.nodeName != 'a') continue;
		var name = child.getAttribute("n");
		if (child.firstChild != null) {
			var value = child.firstChild.nodeValue;
			if (name in this.attrs) {
				var vc = this.attrs[name];
				if ((typeof vc) == "object") {
					vc.push(value);
				} else {
					this.attrs[name] = [vc, value];
				}
			} else {
				this.attrs[name] = value;
			}
		}
	}

}

LaAccount.searchByDomain = 
function (domainName, pagenum, orderby, isascending, app) {
	if(!orderby) orderby = LaAccount.A_uid;
	var myisascending = "0";
	
	if(isascending) {
		myisascending = "1";
	} 
	
	var offset = (pagenum-1) * LaAccount.RESULTSPERPAGE;
	var attrs = LaAccount.A_displayname + "," + LaItem.A_liquidId + "," + LaAccount.A_mailHost + "," + LaAccount.A_uid + "," + LaAccount.A_accountStatus + "," + LaAccount.A_description;
	var soapDoc = LsSoapDoc.create("SearchAccountsRequest", "urn:liquidAdmin", null);
	soapDoc.set("query", "");
	soapDoc.getMethod().setAttribute("domain", domainName);
	soapDoc.getMethod().setAttribute("limit", LaAccount.RESULTSPERPAGE);
	soapDoc.getMethod().setAttribute("offset", offset);
	soapDoc.getMethod().setAttribute("applyCos", "0");
	soapDoc.getMethod().setAttribute("attrs", attrs);
	soapDoc.getMethod().setAttribute("sortBy", orderby);
	soapDoc.getMethod().setAttribute("sortAscending", myisascending);
	var resp = LsCsfeCommand.invoke(soapDoc, null, null, null, true).firstChild;
	var list = new LaItemList("account", LaAccount, app);
	list.loadFromDom(resp);
	var searchTotal = resp.getAttribute("searchTotal");
	var numPages = Math.ceil(searchTotal/LaAccount.RESULTSPERPAGE);
	return {"list":list, "numPages":numPages};
	
}

/**
* @param app reference to LaApp
**/
LaAccount.getAll =
function(app) {
	return LaAccount.search("", 1, LaAccount.A_uid, true, app);
}

/**
* Returns HTML for a tool tip for this account.
*/
LaAccount.prototype.getToolTip =
function() {
	// update/null if modified
	if (!this._toolTip) {
		var html = new Array(20);
		var idx = 0;
		html[idx++] = "<table cellpadding='0' cellspacing='0' border='0'>";
		html[idx++] = "<tr valign='center'><td colspan='2' align='left'>";
		html[idx++] = "<div style='border-bottom: 1px solid black; white-space:nowrap; overflow:hidden;width:350' >";
		html[idx++] = "<table cellpadding='0' cellspacing='0' border='0' style='width:100%;'>";
		html[idx++] = "<tr valign='center'>";
		html[idx++] = "<td><b>" + LsStringUtil.htmlEncode(this.name) + "</b></td>";
		html[idx++] = "<td align='right'>";
		html[idx++] = LsImg.getImageHtml(LaImg.I_ACCOUNT);		
		html[idx++] = "</td>";
		html[idx++] = "</table></div></td></tr>";
		html[idx++] = "<tr></tr>";
		idx = this._addRow(LaMsg.attrDesc(LaAccount.A_accountStatus), 
						LaMsg.accountStatus(this.attrs[LaAccount.A_accountStatus]), html, idx);
		// TODO: COS
		idx = this._addAttrRow(LaAccount.A_description, html, idx);
		idx = this._addAttrRow(LaAccount.A_cn, html, idx);		
		idx = this._addAttrRow(LaItem.A_liquidId, html, idx);
		idx = this._addAttrRow(LaAccount.A_mailHost, html, idx);
		html[idx++] = "</table>";
		this._toolTip = html.join("");
	}
	return this._toolTip;
}

LaAccount.prototype.remove = 
function() {
	var soapDoc = LsSoapDoc.create("DeleteAccountRequest", "urn:liquidAdmin", null);
	soapDoc.set("id", this.id);

	//find out which server I am on
	var myServer = this._app.getServerByName(this.attrs[LaAccount.A_mailHost]);

	LsCsfeCommand.invoke(soapDoc, null, null, myServer.id, true);	
}

LaAccount.prototype.load = 
function(by, val, withCos) {
	var soapDoc = LsSoapDoc.create("GetAccountRequest", "urn:liquidAdmin", null);
	if(withCos) {
		soapDoc.getMethod().setAttribute("applyCos", "1");	
	} else {
		soapDoc.getMethod().setAttribute("applyCos", "0");		
	}
	var elBy = soapDoc.set("account", val);
	elBy.setAttribute("by", by);
	var resp = LsCsfeCommand.invoke(soapDoc, null, null, null, true).firstChild;
	this.attrs = new Object();
	this.initFromDom(resp.firstChild);
	
	var soapDoc = LsSoapDoc.create("GetMailboxRequest", "urn:liquidAdmin", null);
	var mbox = soapDoc.set("mbox", "");
	mbox.setAttribute("id", this.attrs[LaItem.A_liquidId]);
	//find out which server I am on
	var myServer = this._app.getServerByName(this.attrs[LaAccount.A_mailHost]);
				
	var resp = LsCsfeCommand.invoke(soapDoc, false, null, myServer.id, true);
	if(resp && resp.firstChild && resp.firstChild.firstChild) {
		this.attrs[LaAccount.A2_mbxsize] = resp.firstChild.firstChild.getAttribute("s");
	}
	this[LaAccount.A2_confirmPassword] = null;
	
	var autoDispName;
	if(this.attrs[LaAccount.A_firstName])
		autoDispName = this.attrs[LaAccount.A_firstName];
	else
		autoDispName = "";
		
	if(this.attrs[LaAccount.A_initials]) {
		autoDispName += " ";
		autoDispName += this.attrs[LaAccount.A_initials];
		autoDispName += ".";
	}
	if(this.attrs[LaAccount.A_lastName]) {
		if(autoDispName.length > 0)
			autoDispName += " ";
			
	    autoDispName += this.attrs[LaAccount.A_lastName];
	} 	
	
	if( autoDispName == this.attrs[LaAccount.A_displayname]) {
		this[LaAccount.A2_autodisplayname] = "TRUE";
	} else {
		this[LaAccount.A2_autodisplayname] = "FALSE";
	}
}

LaAccount.prototype.refresh = 
function(withCos) {
	this.load("id", this.id, withCos);
	
}

/**
* public rename; sends RenameAccountRequest soap request
**/
LaAccount.prototype.rename = 
function (newName) {
	var soapDoc = LsSoapDoc.create("RenameAccountRequest", "urn:liquidAdmin", null);
	soapDoc.set("id", this.id);
	soapDoc.set("newName", newName);	
	LsCsfeCommand.invoke(soapDoc, null, null, null, true);	
}

/**
* private _changePassword; sends SetPasswordRequest soap request
* @param newPassword
**/
LaAccount.prototype.changePassword = 
function (newPassword) {
	var soapDoc = LsSoapDoc.create("SetPasswordRequest", "urn:liquidAdmin", null);
	soapDoc.set("id", this.id);
	soapDoc.set("newPassword", newPassword);	
	LsCsfeCommand.invoke(soapDoc, null, null, null, true);
}

function LaAccountQuery (queryString, byDomain, byVal) {
	this.query = queryString;
	this.isByDomain = byDomain;
	this.byValAttr = byVal;
}

/**
* LaAccount.myXModel - XModel for XForms
**/
LaAccount.myXModel = new Object();
LaAccount.myXModel.items = new Array();
LaAccount.myXModel.items.push({id:LaAccount.A_name, type:_STRING_, ref:"name", required:true, pattern:/^([a-zA-Z0-9_\-])+((\.)?([a-zA-Z0-9_\-])+)*@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/});
LaAccount.myXModel.items.push({id:LaItem.A_liquidId, type:_STRING_, ref:"attrs/" + LaItem.A_liquidId});

LaAccount.myXModel.items.push({id:LaAccount.A_uid, type:_STRING_, ref:"attrs/"+LaAccount.A_uid});
LaAccount.myXModel.items.push({id:LaAccount.A_accountName, type:_STRING_, ref:"attrs/"+LaAccount.A_accountName});
LaAccount.myXModel.items.push({id:LaAccount.A_firstName, type:_STRING_, ref:"attrs/"+LaAccount.A_firstName});
LaAccount.myXModel.items.push({id:LaAccount.A_lastName, type:_STRING_, ref:"attrs/"+LaAccount.A_lastName, required:true});
LaAccount.myXModel.items.push({id:LaAccount.A_mail, type:_STRING_, ref:"attrs/"+LaAccount.A_mail});
LaAccount.myXModel.items.push({id:LaAccount.A_password, type:_STRING_, ref:"attrs/"+LaAccount.A_password});
LaAccount.myXModel.items.push({id:LaAccount.A2_confirmPassword, type:_STRING_});
LaAccount.myXModel.items.push({id:LaAccount.A_description, type:_STRING_, ref:"attrs/"+LaAccount.A_description});
LaAccount.myXModel.items.push({id:LaAccount.A_telephoneNumber, type:_STRING_, ref:"attrs/"+LaAccount.A_telephoneNumber});
LaAccount.myXModel.items.push({id:LaAccount.A_displayname, type:_STRING_, ref:"attrs/"+LaAccount.A_displayname});
LaAccount.myXModel.items.push({id:LaAccount.A2_autodisplayname, type:_ENUM_, choices:LaModel.BOOLEAN_CHOICES});
LaAccount.myXModel.items.push({id:LaAccount.A_country, type:_STRING_, ref:"attrs/"+LaAccount.A_country});
LaAccount.myXModel.items.push({id:LaAccount.A_company, type:_STRING_, ref:"attrs/"+LaAccount.A_company});
LaAccount.myXModel.items.push({id:LaAccount.A_initials, type:_STRING_, ref:"attrs/"+LaAccount.A_initials});
LaAccount.myXModel.items.push({id:LaAccount.A_city, type:_STRING_, ref:"attrs/"+LaAccount.A_city});
LaAccount.myXModel.items.push({id:LaAccount.A_orgUnit, type:_STRING_, ref:"attrs/"+LaAccount.A_orgUnit});
LaAccount.myXModel.items.push({id:LaAccount.A_office, type:_STRING_, ref:"attrs/"+LaAccount.A_office});
LaAccount.myXModel.items.push({id:LaAccount.A_postalAddress, type:_STRING_, ref:"attrs/"+LaAccount.A_postalAddress});
LaAccount.myXModel.items.push({id:LaAccount.A_zip, type:_STRING_, ref:"attrs/"+LaAccount.A_zip});
LaAccount.myXModel.items.push({id:LaAccount.A_state, type:_STRING_, ref:"attrs/"+LaAccount.A_state});
LaAccount.myXModel.items.push({id:LaAccount.A_mailDeliveryAddress, type:_STRING_, ref:"attrs/"+LaAccount.A_mailDeliveryAddress});
LaAccount.myXModel.items.push({id:LaAccount.A_accountStatus, type:_STRING_, ref:"attrs/"+LaAccount.A_accountStatus});
LaAccount.myXModel.items.push({id:LaAccount.A_notes, type:_STRING_, ref:"attrs/"+LaAccount.A_notes});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidMailQuota, type:_COS_MAILQUOTA_, ref:"attrs/"+LaAccount.A_liquidMailQuota});
LaAccount.myXModel.items.push({id:LaAccount.A_mailHost, type:_STRING_, ref:"attrs/"+LaAccount.A_mailHost});
LaAccount.myXModel.items.push({id:LaAccount.A_COSId, type:_STRING_, ref:"attrs/" + LaAccount.A_COSId});
LaAccount.myXModel.items.push({id:LaAccount.A_isAdminAccount, type:_ENUM_, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaAccount.A_isAdminAccount});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidMaxPwdLength, type:_COS_NUMBER_, ref:"attrs/"+LaAccount.A_liquidMaxPwdLength, maxInclusive:2147483647, minInclusive:0});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidMinPwdLength, type:_COS_NUMBER_, ref:"attrs/"+LaAccount.A_liquidMinPwdLength, maxInclusive:2147483647, minInclusive:0});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidMinPwdAge, type:_COS_NUMBER_, ref:"attrs/"+LaAccount.A_liquidMinPwdAge, maxInclusive:2147483647, minInclusive:0});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidMaxPwdAge, type:_COS_NUMBER_, ref:"attrs/"+LaAccount.A_liquidMaxPwdAge, maxInclusive:2147483647, minInclusive:0});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidEnforcePwdHistory, type:_COS_NUMBER_, ref:"attrs/"+LaAccount.A_liquidEnforcePwdHistory, maxInclusive:2147483647, minInclusive:0});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidMailAlias, type:_LIST_, ref:"attrs/"+LaAccount.A_liquidMailAlias, listItem:{type:_STRING_}});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidMailForwardingAddress, type:_LIST_, ref:"attrs/"+LaAccount.A_liquidMailForwardingAddress, listItem:{type:_STRING_, pattern:/^([a-zA-Z0-9_\-])+((\.)?([a-zA-Z0-9_\-])+)*@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/}});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidPasswordMustChange, type:_ENUM_, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaAccount.A_liquidPasswordMustChange}); 
LaAccount.myXModel.items.push({id:LaAccount.A_liquidPasswordLocked, type:_COS_ENUM_, ref:"attrs/"+LaAccount.A_liquidPasswordLocked, choices:LaModel.BOOLEAN_CHOICES}); 
LaAccount.myXModel.items.push({id:LaAccount.A_liquidDomainName, type:_STRING_, ref:"attrs/"+LaAccount.A_liquidDomainName});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidContactMaxNumEntries, type:_COS_NUMBER_, ref:"attrs/"+LaAccount.A_liquidContactMaxNumEntries, maxInclusive:2147483647, minInclusive:0});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidAttachmentsBlocked, type:_COS_ENUM_, ref:"attrs/"+LaAccount.A_liquidAttachmentsBlocked, choices:LaModel.BOOLEAN_CHOICES}); 
LaAccount.myXModel.items.push({id:LaAccount.A_liquidAttachmentsViewInHtmlOnly, type:_COS_ENUM_, ref:"attrs/"+LaAccount.A_liquidAttachmentsViewInHtmlOnly, choices:LaModel.BOOLEAN_CHOICES}); 
LaAccount.myXModel.items.push({id:LaAccount.A_liquidAuthTokenLifetime, type:_COS_MLIFETIME_, ref:"attrs/"+LaAccount.A_liquidAuthTokenLifetime});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidMailMessageLifetime, type:_COS_MLIFETIME_, ref:"attrs/" + LaAccount.A_liquidMailMessageLifetime});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidMailSpamLifetime, type:_COS_MLIFETIME_, ref:"attrs/" + LaAccount.A_liquidMailSpamLifetime});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidMailTrashLifetime, type:_COS_MLIFETIME_, ref:"attrs/"+LaAccount.A_liquidMailTrashLifetime});


//pref
LaAccount.myXModel.items.push({id:LaAccount.A_prefSaveToSent, type:_COS_ENUM_, ref:"attrs/"+LaAccount.A_prefSaveToSent, choices:LaModel.BOOLEAN_CHOICES});
LaAccount.myXModel.items.push({id:LaAccount.A_prefMailSignature, type:_STRING_, ref:"attrs/"+LaAccount.A_prefMailSignature});
LaAccount.myXModel.items.push({id:LaAccount.A_prefMailSignatureEnabled, type:_ENUM_, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaAccount.A_prefMailSignatureEnabled});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidPrefSentMailFolder, type:_STRING_, ref:"attrs/"+LaAccount.A_liquidPrefSentMailFolder});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidPrefIncludeSpamInSearch, type:_COS_ENUM_, ref:"attrs/"+LaAccount.A_liquidPrefIncludeSpamInSearch, choices:LaModel.BOOLEAN_CHOICES});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidPrefIncludeTrashInSearch, type:_COS_ENUM_, ref:"attrs/"+LaAccount.A_liquidPrefIncludeTrashInSearch, choices:LaModel.BOOLEAN_CHOICES});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidPrefMailInitialSearch, type:_COS_STRING_, ref:"attrs/"+LaAccount.A_liquidPrefMailInitialSearch});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidPrefMailItemsPerPage, type:_COS_NUMBER_, ref:"attrs/"+LaAccount.A_liquidPrefMailItemsPerPage, choices:[10,25,50,100]});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidPrefMailPollingInterval, type:_COS_NUMBER_, ref:"attrs/"+LaAccount.A_liquidPrefMailPollingInterval});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidPrefOutOfOfficeReply, type:_STRING_, ref:"attrs/"+LaAccount.A_liquidPrefOutOfOfficeReply});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidPrefOutOfOfficeReplyEnabled, type:_ENUM_, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaAccount.A_liquidPrefOutOfOfficeReplyEnabled});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidPrefReplyToAddress, type:_STRING_, ref:"attrs/"+LaAccount.A_liquidPrefReplyToAddress});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidPrefUseKeyboardShortcuts, type:_COS_ENUM_, ref:"attrs/"+LaAccount.A_liquidPrefUseKeyboardShortcuts, choices:LaModel.BOOLEAN_CHOICES});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidPrefContactsPerPage, type:_COS_NUMBER_, ref:"attrs/"+LaAccount.A_liquidPrefContactsPerPage, choices:[10,25,50,100]});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidPrefComposeInNewWindow, type:_COS_ENUM_, ref:"attrs/"+LaAccount.A_liquidPrefComposeInNewWindow, choices:LaModel.BOOLEAN_CHOICES});				
LaAccount.myXModel.items.push({id:LaAccount.A_liquidPrefForwardReplyInOriginalFormat, type:_COS_ENUM_, ref:"attrs/"+LaAccount.A_liquidPrefForwardReplyInOriginalFormat, choices:LaModel.BOOLEAN_CHOICES});						
LaAccount.myXModel.items.push({id:LaAccount.A_liquidPrefAutoAddAddressEnabled, type:_COS_ENUM_, ref:"attrs/"+LaAccount.A_liquidPrefAutoAddAddressEnabled, choices:LaModel.BOOLEAN_CHOICES});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidPrefComposeFormat, type:_COS_ENUM_, ref:"attrs/"+LaAccount.A_liquidPrefComposeFormat, choices:LaModel.COMPOSE_FORMAT_CHOICES});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidPrefGroupMailBy, type:_COS_ENUM_, ref:"attrs/"+LaAccount.A_liquidPrefGroupMailBy, choices:LaModel.GROUP_MAIL_BY_CHOICES});					
LaAccount.myXModel.items.push({id:LaAccount.A_liquidPrefMessageViewHtmlPreferred, type:_COS_ENUM_, ref:"attrs/"+LaAccount.A_liquidPrefMessageViewHtmlPreferred, choices:LaModel.BOOLEAN_CHOICES});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidPrefNewMailNotificationAddress, type:_STRING_, ref:"attrs/"+LaAccount.A_liquidPrefNewMailNotificationAddress});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidPrefNewMailNotificationEnabled, type:_ENUM_, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaAccount.A_liquidPrefNewMailNotificationEnabled});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidPrefOutOfOfficeReply, type:_STRING_, ref:"attrs/"+LaAccount.A_liquidPrefOutOfOfficeReply});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidPrefOutOfOfficeReplyEnabled, type:_ENUM_, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/"+LaAccount.A_liquidPrefOutOfOfficeReplyEnabled});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidPrefShowSearchString, type:_COS_ENUM_, ref:"attrs/"+LaAccount.A_liquidPrefShowSearchString, choices:LaModel.BOOLEAN_CHOICES});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidPrefMailSignatureStyle, type:_COS_ENUM_, ref:"attrs/"+LaAccount.A_liquidPrefMailSignatureStyle, choices:LaModel.SIGNATURE_STYLE_CHOICES});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidPrefUseTimeZoneListInCalendar, type:_COS_ENUM_, ref:"attrs/"+LaAccount.A_liquidPrefUseTimeZoneListInCalendar, choices:LaModel.BOOLEAN_CHOICES});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidPrefImapSearchFoldersEnabled, type:_COS_ENUM_, ref:"attrs/"+LaAccount.A_liquidPrefImapSearchFoldersEnabled, choices:LaModel.BOOLEAN_CHOICES});
				
//features
LaAccount.myXModel.items.push({id:LaAccount.A_liquidFeatureContactsEnabled, type:_COS_ENUM_, ref:"attrs/"+LaAccount.A_liquidFeatureContactsEnabled, choices:LaModel.BOOLEAN_CHOICES});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidFeatureCalendarEnabled, type:_COS_ENUM_, ref:"attrs/"+LaAccount.A_liquidFeatureCalendarEnabled, choices:LaModel.BOOLEAN_CHOICES});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidFeatureTaggingEnabled, type:_COS_ENUM_, ref:"attrs/"+LaAccount.A_liquidFeatureTaggingEnabled, choices:LaModel.BOOLEAN_CHOICES});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidFeatureAdvancedSearchEnabled, type:_COS_ENUM_, ref:"attrs/"+LaAccount.A_liquidFeatureAdvancedSearchEnabled, choices:LaModel.BOOLEAN_CHOICES});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidFeatureSavedSearchesEnabled, type:_COS_ENUM_, ref:"attrs/"+LaAccount.A_liquidFeatureSavedSearchesEnabled, choices:LaModel.BOOLEAN_CHOICES});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidFeatureConversationsEnabled, type:_COS_ENUM_, ref:"attrs/"+LaAccount.A_liquidFeatureConversationsEnabled, choices:LaModel.BOOLEAN_CHOICES});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidFeatureChangePasswordEnabled, type:_COS_ENUM_, ref:"attrs/"+LaAccount.A_liquidFeatureChangePasswordEnabled, choices:LaModel.BOOLEAN_CHOICES});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidFeatureInitialSearchPreferenceEnabled, type:_COS_ENUM_, ref:"attrs/"+LaAccount.A_liquidFeatureInitialSearchPreferenceEnabled, choices:LaModel.BOOLEAN_CHOICES});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidFeatureFiltersEnabled, type:_COS_ENUM_, ref:"attrs/"+LaAccount.A_liquidFeatureFiltersEnabled, choices:LaModel.BOOLEAN_CHOICES});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidFeatureGalEnabled, type:_COS_ENUM_, ref:"attrs/"+LaAccount.A_liquidFeatureGalEnabled, choices:LaModel.BOOLEAN_CHOICES});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidAttachmentsIndexingEnabled, type:_COS_ENUM_, ref:"attrs/"+LaAccount.A_liquidAttachmentsIndexingEnabled, choices:LaModel.BOOLEAN_CHOICES});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidFeatureHtmlComposeEnabled, type:_COS_ENUM_, ref:"attrs/"+LaAccount.A_liquidFeatureHtmlComposeEnabled, choices:LaModel.BOOLEAN_CHOICES});

LaAccount.myXModel.items.push({id:LaAccount.A_liquidImapEnabled, type:_COS_ENUM_, ref:"attrs/"+LaAccount.A_liquidImapEnabled, choices:LaModel.BOOLEAN_CHOICES});
LaAccount.myXModel.items.push({id:LaAccount.A_liquidPop3Enabled, type:_COS_ENUM_, ref:"attrs/"+LaAccount.A_liquidPop3Enabled, choices:LaModel.BOOLEAN_CHOICES});		
LaAccount.myXModel.items.push({id:LaModel.currentStep, type:_NUMBER_, ref:LaModel.currentStep});
LaAccount.myXModel.items.push({id:LaAccount.A2_newAlias, type:_STRING_});
//LaAccount.myXModel.items.push({id:LaAccount.A2_newForward, type:_STRING_});
LaAccount.myXModel.items.push({id:LaAccount.A2_aliases, type:_LIST_,listItem:{type:_STRING_}});
LaAccount.myXModel.items.push({id:LaAccount.A2_forwarding, type:_LIST_,listItem:{type:_STRING_}});
LaAccount.myXModel.items.push({id:LaAccount.A2_mbxsize, type:_NUMBER_, ref:"attrs/"+LaAccount.A2_mbxsize});
LaAccount.myXModel.items.push({id:LaAccount.A2_quota, type:_MAILQUOTA_2_, ref:"attrs/"+LaAccount.A_liquidMailQuota});
