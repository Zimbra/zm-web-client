/**
* @class LaDomain
* @ constructor LaDomain
* @param app reference to the application instance
* Data model for liquidDomain object
* @author Greg Solovyev
**/

function LaDomain(app) {
	LaItem.call(this, "domain");
	this.attrs = new Object();
	this.id = "";
	this.name="";
	this._app = app;
	//default attributes
	this.attrs[LaDomain.A_GalMode] = LaDomain.GAL_Mode_internal;
	this.attrs[LaDomain.A_GalMaxResults] = 100;
	this.attrs[LaDomain.A_AuthMech] = LaDomain.AuthMech_liquid;
}

LaDomain.prototype = new LaItem;
LaDomain.prototype.constructor = LaDomain;

//attribute name constants, this values are taken from liquid.schema
LaDomain.A_description = "description";
LaDomain.A_notes = "liquidNotes";
LaDomain.A_domainName = "liquidDomainName";
//GAL
LaDomain.A_GalMaxResults = "liquidGalMaxResults";
LaDomain.A_GalMode = "liquidGalMode";
LaDomain.A_GalLdapURL = "liquidGalLdapURL";
LaDomain.A_GalLdapSearchBase = "liquidGalLdapSearchBase";
LaDomain.A_GalLdapBindDn = "liquidGalLdapBindDn";
LaDomain.A_GalLdapBindPassword = "liquidGalLdapBindPassword";
LaDomain.A_GalLdapBindPasswordConfirm = "liquidGalLdapBindPasswordConfirm";
LaDomain.A_GalLdapFilter = "liquidGalLdapFilter";
//Auth
LaDomain.A_AuthMech = "liquidAuthMech";
LaDomain.A_AuthLdapURL = "liquidAuthLdapURL";
LaDomain.A_AuthLdapUserDn = "liquidAuthLdapBindDn";

//internal attributes - not synched with the server code yet
//GAL
LaDomain.A_GALServerType = "galservertype";
LaDomain.A_GALServerName = "galservername";
LaDomain.A_GALServerPort = "galserverport";
LaDomain.A_GALUseSSL = "galusessl";
LaDomain.A_GALTestMessage = "galtestmessage";
LaDomain.A_GALTestResultCode = "galtestresutcode";
LaDomain.A_GALSampleQuery = "samplequery";
LaDomain.A_UseBindPassword = "usebindpassword";

//values
LaDomain.GAL_Mode_internal = "liquid";
LaDomain.GAL_Mode_external = "ldap";
LaDomain.GAL_Mode_both = "both";
LaDomain.GAL_ServerType_ad = "ad";
LaDomain.GAL_ServerType_ldap = "ldap";

//Auth
LaDomain.A_AuthADDomainName = "liquidAuthADDomainName";
LaDomain.A_AuthLDAPServerName = "liquidAuthLDAPServerName";
LaDomain.A_AuthLDAPSearchBase = "liquidAuthLDAPSearchBase";
LaDomain.A_AuthLDAPServerPort = "liquidAuthLDAPServerPort";
LaDomain.A_AuthLDAPUseSSL = "authldapusessl";
LaDomain.A_AuthTestUserName = "authtestusername";
LaDomain.A_AuthTestPassword = "authtestpassword";
LaDomain.A_AuthTestMessage = "authtestmessage";
LaDomain.A_AuthTestResultCode = "authtestresutcode";
LaDomain.A_AuthComputedBindDn = "authcomputedbinddn";


//server value constants
LaDomain.AuthMech_ad = "ad";
LaDomain.AuthMech_ldap = "ldap";
LaDomain.AuthMech_liquid = "liquid";

//result codes returned from Check* requests
LaDomain.Check_OK = "check.OK";
LaDomain.Check_UNKNOWN_HOST="check.UNKNOWN_HOST";
LaDomain.Check_CONNECTION_REFUSED = "check.CONNECTION_REFUSED";
LaDomain.Check_SSL_HANDSHAKE_FAILURE = "check.SSL_HANDSHAKE_FAILURE";
LaDomain.Check_COMMUNICATION_FAILURE = "check.COMMUNICATION_FAILURE";
LaDomain.Check_AUTH_FAILED = "check.AUTH_FAILED";
LaDomain.Check_AUTH_NOT_SUPPORTED = "check.AUTH_NOT_SUPPORTED";
LaDomain.Check_NAME_NOT_FOUND = "check.NAME_NOT_FOUND";
LaDomain.Check_INVALID_SEARCH_FILTER = "check.INVALID_SEARCH_FILTER";
LaDomain.Check_FAILURE = "check.FAILURE"; 
LaDomain.Check_FAULT = "Fault";

LaDomain.AUTH_MECH_CHOICES = [LaDomain.AuthMech_ad,LaDomain.AuthMech_ldap,LaDomain.AuthMech_liquid];
/**
* static method getAll fetches liquidDomain objects from SOAP servlet using GetAllDomainsRequest
* returns a LaItemList of LaDomain objects
**/
LaDomain.getAll =
function() {
	var soapDoc = LsSoapDoc.create("GetAllDomainsRequest", "urn:liquidAdmin", null);	
	var resp = LsCsfeCommand.invoke(soapDoc, null, null, null, true).firstChild;
	var list = new LaItemList("domain", LaDomain);
	list.loadFromDom(resp);
//	list.sortByName();		
	return list;
}

/**
* Creates a new LaDomain. This method makes SOAP request (CreateDomainRequest) to create a new domain record in LDAP. 
* @param attrs
* @param name 
* @return LaDomain
**/
LaDomain.create =
function(tmpObj, app) {

	if(tmpObj.attrs == null) {
		//show error msg
		app.getCurrentController().popupMsgDialog(LaMsg.ERROR_UNKNOWN, null);
		return null;	
	}
	
	//name
	if(tmpObj.attrs[LaDomain.A_domainName] ==null || tmpObj.attrs[LaDomain.A_domainName].length < 1) {
		//show error msg
		app.getCurrentController().popupMsgDialog(LaMsg.ERROR_DOMAIN_NAME_REQUIRED);
		return null;
	}
	tmpObj.name = tmpObj.attrs[LaDomain.A_domainName];
	//check values
	if(!LsUtil.isNonNegativeInteger(tmpObj.attrs[LaDomain.A_GalMaxResults])) {
		//show error msg
		app.getCurrentController().popupMsgDialog(LaMsg.ERROR_INVALID_VALUE + ": " + LaMsg.NAD_GalMaxResults + " ! ");
		return null;
	}
	
	if(tmpObj.name.length > 256 || tmpObj.attrs[LaDomain.A_domainName].length > 256) {
		//show error msg
		app.getCurrentController().popupMsgDialog(LaMsg.ERROR_DOMAIN_NAME_TOOLONG);
		return null;
	}
	
	var domainRegEx = /(^([a-zA-Z0-9]))(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	if( !domainRegEx.test(tmpObj.attrs[LaDomain.A_domainName]) ) {
		//show error msg
		app.getCurrentController().popupMsgDialog(LaMsg.ERROR_DOMAIN_NAME_INVALID);
		return null;
	}
	var nonAlphaNumEx = /[^a-zA-Z0-9\-\.]+/
	if(nonAlphaNumEx.test(tmpObj.attrs[LaDomain.A_domainName]) ) {
		//show error msg
		app.getCurrentController().popupMsgDialog(LaMsg.ERROR_DOMAIN_NAME_INVALID);
		return null;
	}	

	var soapDoc = LsSoapDoc.create("CreateDomainRequest", "urn:liquidAdmin", null);
	soapDoc.set("name", tmpObj.attrs[LaDomain.A_domainName]);
	var attr = soapDoc.set("a", tmpObj.attrs[LaDomain.A_GalMode]);
	attr.setAttribute("n", LaDomain.A_GalMode);	

	attr = soapDoc.set("a", tmpObj.attrs[LaDomain.A_GalMaxResults]);
	attr.setAttribute("n", LaDomain.A_GalMaxResults);

	attr = soapDoc.set("a", tmpObj.attrs[LaDomain.A_notes]);
	attr.setAttribute("n", LaDomain.A_notes);	
	
	attr = soapDoc.set("a", tmpObj.attrs[LaDomain.A_AuthLdapURL]);
	attr.setAttribute("n", LaDomain.A_AuthLdapURL);		
	
	attr = soapDoc.set("a", tmpObj.attrs[LaDomain.A_description]);
	attr.setAttribute("n", LaDomain.A_description);		

	if(tmpObj.attrs[LaDomain.A_GalMode] != LaDomain.GAL_Mode_internal) {
		attr = soapDoc.set("a", tmpObj.attrs[LaDomain.A_GalLdapURL]);
		attr.setAttribute("n", LaDomain.A_GalLdapURL);	

		attr = soapDoc.set("a", tmpObj.attrs[LaDomain.A_GalLdapSearchBase]);
		attr.setAttribute("n", LaDomain.A_GalLdapSearchBase);	

		attr = soapDoc.set("a", tmpObj.attrs[LaDomain.A_GalLdapBindDn]);
		attr.setAttribute("n", LaDomain.A_GalLdapBindDn);	

		attr = soapDoc.set("a", tmpObj.attrs[LaDomain.A_GalLdapBindPassword]);
		attr.setAttribute("n", LaDomain.A_GalLdapBindPassword);	

		attr = soapDoc.set("a", tmpObj.attrs[LaDomain.A_GalLdapFilter]);
		attr.setAttribute("n", LaDomain.A_GalLdapFilter);	
	}

	if(tmpObj.attrs[LaDomain.A_AuthMech] == LaDomain.AuthMech_ad) {
		//set bind DN to default for AD
		attr = soapDoc.set("a", tmpObj.attrs[LaDomain.A_AuthLdapURL]);
		attr.setAttribute("n", LaDomain.A_AuthLdapURL);	
		
		attr = soapDoc.set("a", "%u@"+tmpObj.attrs[LaDomain.A_AuthADDomainName]);
		attr.setAttribute("n", LaDomain.A_AuthLdapUserDn);	

	} else if(tmpObj.attrs[LaDomain.A_AuthMech] == LaDomain.AuthMech_ldap) {
		attr = soapDoc.set("a", tmpObj.attrs[LaDomain.A_AuthLdapURL]);
		attr.setAttribute("n", LaDomain.A_AuthLdapURL);	

		attr = soapDoc.set("a", tmpObj.attrs[LaDomain.A_AuthLdapUserDn]);
		attr.setAttribute("n", LaDomain.A_AuthLdapUserDn);	
	}

	var attr = soapDoc.set("a", tmpObj.attrs[LaDomain.A_AuthMech]);
	attr.setAttribute("n", LaDomain.A_AuthMech);	

	var newDomain = new LaDomain();
	var resp = LsCsfeCommand.invoke(soapDoc, null, null, null, true).firstChild;
	newDomain.initFromDom(resp.firstChild);
	return newDomain;
}

LaDomain.testAuthSettings = 
function (obj, callback) {
	var soapDoc = LsSoapDoc.create("CheckAuthConfigRequest", "urn:liquidAdmin", null);
	var attr = soapDoc.set("a", obj.attrs[LaDomain.A_AuthMech]);
	attr.setAttribute("n", LaDomain.A_AuthMech);
	
	attr = soapDoc.set("a", obj.attrs[LaDomain.A_AuthLdapURL]);
	attr.setAttribute("n", LaDomain.A_AuthLdapURL);	
	
	attr = soapDoc.set("a", obj.attrs[LaDomain.A_AuthLdapUserDn]);
	attr.setAttribute("n", LaDomain.A_AuthLdapUserDn);	
	
	attr = soapDoc.set("name", obj[LaDomain.A_AuthTestUserName]);
	attr = soapDoc.set("password", obj[LaDomain.A_AuthTestPassword]);	
	
	var asynCommand = new LsCsfeAsynchCommand();
	asynCommand.addInvokeListener(callback);
	asynCommand.invoke(soapDoc, null, null, null, true);	
}

LaDomain.testGALSettings =
function (obj, callback, sampleQuery) {
	var soapDoc = LsSoapDoc.create("CheckGalConfigRequest", "urn:liquidAdmin", null);
	var attr = soapDoc.set("a", LaDomain.GAL_Mode_external);
	attr.setAttribute("n", LaDomain.A_GalMode);

	attr = soapDoc.set("a", obj.attrs[LaDomain.A_GalLdapURL]);
	attr.setAttribute("n", LaDomain.A_GalLdapURL);	
	
	attr = soapDoc.set("a", obj.attrs[LaDomain.A_GalLdapSearchBase]);
	attr.setAttribute("n", LaDomain.A_GalLdapSearchBase);	

	attr = soapDoc.set("a", obj.attrs[LaDomain.A_GalLdapFilter]);
	attr.setAttribute("n", LaDomain.A_GalLdapFilter);	

	if(obj.attrs[LaDomain.A_GalLdapBindDn]) {
		attr = soapDoc.set("a", obj.attrs[LaDomain.A_GalLdapBindDn]);
		attr.setAttribute("n", LaDomain.A_GalLdapBindDn);
	}

	if(obj.attrs[LaDomain.A_GalLdapBindPassword]) {
		attr = soapDoc.set("a", obj.attrs[LaDomain.A_GalLdapBindPassword]);
		attr.setAttribute("n", LaDomain.A_GalLdapBindPassword);
	}
	soapDoc.set("query", "cn=*" + sampleQuery + "*");

	var asynCommand = new LsCsfeAsynchCommand();
	asynCommand.addInvokeListener(callback);
	asynCommand.invoke(soapDoc, null, null, null, true);
}

LaDomain.modifyGalSettings = 
function(tmpObj, oldObj) {
	var soapDoc = LsSoapDoc.create("ModifyDomainRequest", "urn:liquidAdmin", null);
	soapDoc.set("id", oldObj.id);
	
	var attr = soapDoc.set("a", tmpObj.attrs[LaDomain.A_GalMode]);
	attr.setAttribute("n", LaDomain.A_GalMode);	
	
	if(tmpObj.attrs[LaDomain.A_GalMode] != LaDomain.GAL_Mode_internal) {
		attr = soapDoc.set("a", tmpObj.attrs[LaDomain.A_GalLdapURL]);
		attr.setAttribute("n", LaDomain.A_GalLdapURL);	

		attr = soapDoc.set("a", tmpObj.attrs[LaDomain.A_GalLdapSearchBase]);
		attr.setAttribute("n", LaDomain.A_GalLdapSearchBase);	

		attr = soapDoc.set("a", tmpObj.attrs[LaDomain.A_GalLdapBindDn]);
		attr.setAttribute("n", LaDomain.A_GalLdapBindDn);	

		attr = soapDoc.set("a", tmpObj.attrs[LaDomain.A_GalLdapBindPassword]);
		attr.setAttribute("n", LaDomain.A_GalLdapBindPassword);	

		attr = soapDoc.set("a", tmpObj.attrs[LaDomain.A_GalLdapFilter]);
		attr.setAttribute("n", LaDomain.A_GalLdapFilter);	
	}
	if(oldObj[LaDomain.A_GalMaxResults] != tmpObj.attrs[LaDomain.A_GalMaxResults]) {
		attr = soapDoc.set("a", tmpObj.attrs[LaDomain.A_GalMaxResults]);
		attr.setAttribute("n", LaDomain.A_GalMaxResults);	
	}

	var resp = LsCsfeCommand.invoke(soapDoc, null, null, null, true).firstChild;
	oldObj.initFromDom(resp.firstChild);
}

LaDomain.modifyAuthSettings = 
function(tmpObj, oldObj) {

	var soapDoc = LsSoapDoc.create("ModifyDomainRequest", "urn:liquidAdmin", null);
	soapDoc.set("id", oldObj.id);
	
	var attr = soapDoc.set("a", tmpObj.attrs[LaDomain.A_AuthMech]);
	attr.setAttribute("n", LaDomain.A_AuthMech);	
	
	if(tmpObj.attrs[LaDomain.A_AuthMech] == LaDomain.AuthMech_ad) {
		attr = soapDoc.set("a", tmpObj.attrs[LaDomain.A_AuthLdapURL]);
		attr.setAttribute("n", LaDomain.A_AuthLdapURL);	

		attr = soapDoc.set("a", "%u@"+tmpObj.attrs[LaDomain.A_AuthADDomainName]);
		attr.setAttribute("n", LaDomain.A_AuthLdapUserDn);	
	} else if (tmpObj.attrs[LaDomain.A_AuthMech] == LaDomain.AuthMech_ldap) {
		attr = soapDoc.set("a", tmpObj.attrs[LaDomain.A_AuthLdapURL]);
		attr.setAttribute("n", LaDomain.A_AuthLdapURL);	

		attr = soapDoc.set("a", tmpObj.attrs[LaDomain.A_AuthLdapUserDn]);
		attr.setAttribute("n", LaDomain.A_AuthLdapUserDn);	
	
	}
	var resp = LsCsfeCommand.invoke(soapDoc, null, null, null, true).firstChild;
	oldObj.initFromDom(resp.firstChild);
}

/**
* @param mods - map of modified attributes that will be sent to the server
* modifies object's information in the database
**/
LaDomain.prototype.modify =
function(mods) {
	var soapDoc = LsSoapDoc.create("ModifyDomainRequest", "urn:liquidAdmin", null);
	soapDoc.set("id", this.id);
	for (var aname in mods) {
		var attr = soapDoc.set("a", mods[aname]);
		attr.setAttribute("n", aname);
	}
		
	var resp = LsCsfeCommand.invoke(soapDoc, null, null, null, true).firstChild;
	//update itself
	this.initFromDom(resp.firstChild);
}

/**
* Domain configuration is tricky, therefore have to massage the values into the instace
**/
LaDomain.prototype.initFromDom = 
function (node) {
	LaItem.prototype.initFromDom.call(this, node);
	if(!this.attrs[LaDomain.A_AuthMech]) {
		this.attrs[LaDomain.A_AuthMech] = LaDomain.AuthMech_liquid; //default value
	}
	if(!this.attrs[LaDomain.A_GalMode]) {
		this.attrs[LaDomain.A_GalMode] = LaDomain.GAL_Mode_internal; //default value
	}

	if(this.attrs[LaDomain.A_AuthLdapURL]) {
		/* analyze Auth URL */
		var pieces = this.attrs[LaDomain.A_AuthLdapURL].split(/[:\/]/);
		if (pieces.length < 4) {
			//the URL is invalid - use default values
			this.attrs[LaDomain.A_AuthLDAPUseSSL] = "FALSE";	
			this.attrs[LaDomain.A_AuthLDAPServerPort] = 389;
			this.attrs[LaDomain.A_AuthLDAPServerName] = "";
		} else {
			if(pieces[0] == "ldaps") {
				this.attrs[LaDomain.A_AuthLDAPUseSSL] = "TRUE";
			} else {
				this.attrs[LaDomain.A_AuthLDAPUseSSL] = "FALSE";	
			}
			var ix = 1;
			var cnt = pieces.length;
			while( (pieces[ix] == null || pieces[ix] == "" || pieces[ix].length == 0) && ix < cnt) {
				ix++; //skip empty tokens
			}
			this.attrs[LaDomain.A_AuthLDAPServerName] = pieces[ix];
			ix++;
			if(ix < cnt && pieces[ix] != null && pieces[ix] != "" && pieces[ix].length >0) {
				this.attrs[LaDomain.A_AuthLDAPServerPort] = pieces[ix]; //got port token
			} else {
			 	//URL does not contain port, use default values
			 	if(this.attrs[LaDomain.A_AuthLDAPUseSSL] == "TRUE") {
				 	this.attrs[LaDomain.A_AuthLDAPServerPort] = 636;
			 	} else {
		 			this.attrs[LaDomain.A_AuthLDAPServerPort] = 389;
			 	}
			}
			
		}
	
		if (pieces.length == 2) {
			this.attrs[LaDomain.A_AuthLDAPServerPort] == pieces[1];
		}
	}
	if(this.attrs[LaDomain.A_GalLdapURL])	{	
		/* analyze GAL URL */
		var pieces = this.attrs[LaDomain.A_GalLdapURL].split(/[:\/]/);
		if (pieces.length < 4) {
			//the URL is invalid - use default values
			this.attrs[LaDomain.A_GALUseSSL] = "FALSE";	
			this.attrs[LaDomain.A_GALServerPort] = 389;
			this.attrs[LaDomain.A_GALServerName] = "";
		} else {
			if(pieces[0] == "ldaps") {
				this.attrs[LaDomain.A_GALUseSSL] = "TRUE";
			} else {
				this.attrs[LaDomain.A_GALUseSSL] = "FALSE";	
			}
			var ix = 1;
			var cnt = pieces.length;
			while( (pieces[ix] == null || pieces[ix] == "" || pieces[ix].length == 0) && ix < cnt) {
				ix++; //skip empty tokens
			}
			this.attrs[LaDomain.A_GALServerName] = pieces[ix];
			ix++;
			if(ix < cnt && pieces[ix] != null && pieces[ix] != "" && pieces[ix].length >0) {
				this.attrs[LaDomain.A_GALServerPort] = pieces[ix]; //got port token
			} else {
			 	//URL does not contain port, use default values
			 	if(this.attrs[LaDomain.A_GALUseSSL] == "TRUE") {
				 	this.attrs[LaDomain.A_GALServerPort] = 636;
			 	} else {
		 			this.attrs[LaDomain.A_GALServerPort] = 389;
			 	}
			}
			
		}
	}	
	
	if(this.attrs[LaDomain.A_GalMode]) {
		if(this.attrs[LaDomain.A_GalMode] == "ldap" || this.attrs[LaDomain.A_GalMode] == "both") {
			if(this.attrs[LaDomain.A_GalLdapFilter] == "ad") {
				this.attrs[LaDomain.A_GALServerType] = "ad";
			} else {
				this.attrs[LaDomain.A_GALServerType] = "ldap";
			}
		}
	} else {
		this.attrs[LaDomain.A_GalMode] = "liquid";
	}
	
	if(this.attrs[LaDomain.A_GalLdapBindDn] || this.attrs[LaDomain.A_GalLdapBindPassword]) {
		this.attrs[LaDomain.A_UseBindPassword] = "TRUE";
	} else {
		this.attrs[LaDomain.A_UseBindPassword] = "FALSE";
	}
	
	this[LaDomain.A_GALSampleQuery] = "john";

}
/**
* Returns HTML for a tool tip for this domain.
*/
LaDomain.prototype.getToolTip =
function() {
	// update/null if modified
	if (!this._toolTip) {
		var html = new Array(20);
		var idx = 0;
		html[idx++] = "<table cellpadding='0' cellspacing='0' border='0'>";
		html[idx++] = "<tr valign='center'><td colspan='2' align='left'>";
		html[idx++] = "<div style='border-bottom: 1px solid black; white-space:nowrap; overflow:hidden;width:350'>";
		html[idx++] = "<table cellpadding='0' cellspacing='0' border='0' style='width:100%;'>";
		html[idx++] = "<tr valign='center'>";
		html[idx++] = "<td><b>" + LsStringUtil.htmlEncode(this.name) + "</b></td>";
		html[idx++] = "<td align='right'>";
		html[idx++] = LsImg.getImageHtml(LaImg.I_DOMAIN);			
		html[idx++] = "</td>";
		html[idx++] = "</table></div></td></tr>";
		html[idx++] = "<tr></tr>";
		idx = this._addAttrRow(LaItem.A_description, html, idx);		
		idx = this._addAttrRow(LaItem.A_liquidId, html, idx);
		html[idx++] = "</table>";
		this._toolTip = html.join("");
	}
	return this._toolTip;
}

LaDomain.prototype.remove = 
function() {
	var soapDoc = LsSoapDoc.create("DeleteDomainRequest", "urn:liquidAdmin", null);
	soapDoc.set("id", this.id);
	LsCsfeCommand.invoke(soapDoc, null, null, null, true);	
}

LaDomain.myXModel = {
	items: [
		{id:LaItem.A_liquidId, type:_STRING_, ref:"attrs/" + LaItem.A_liquidId},
		{id:LaDomain.A_domainName, type:_STRING_, ref:"attrs/" + LaDomain.A_domainName, pattern:/(^([a-zA-Z0-9]))(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/},
		{id:LaDomain.A_description, type:_STRING_, ref:"attrs/" + LaDomain.A_description}, 
		{id:LaDomain.A_notes, type:_STRING_, ref:"attrs/" + LaDomain.A_notes},
		{id:LaDomain.A_GalMode, type:_STRING_, ref:"attrs/" + LaDomain.A_GalMode},
		{id:LaDomain.A_GalMaxResults, type:_NUMBER_, ref:"attrs/" + LaDomain.A_GalMaxResults, maxInclusive:2147483647, minInclusive:1},					
		{id:LaDomain.A_GALServerType, type:_STRING_, ref:"attrs/" + LaDomain.A_GALServerType},
		{id:LaDomain.A_GALServerName, type:_STRING_, ref:"attrs/" + LaDomain.A_GALServerName},					
		{id:LaDomain.A_GALServerPort, type:_NUMBER_, ref:"attrs/" + LaDomain.A_GALServerPort, maxInclusive:2147483647},
		{id:LaDomain.A_GALUseSSL, type:_ENUM_, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/" + LaDomain.A_GALUseSSL},
		{id:LaDomain.A_GalLdapFilter, type:_STRING_, ref:"attrs/" + LaDomain.A_GalLdapFilter},
		{id:LaDomain.A_GalLdapSearchBase, type:_STRING_, ref:"attrs/" + LaDomain.A_GalLdapSearchBase},
		{id:LaDomain.A_UseBindPassword, type:_ENUM_, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/" + LaDomain.A_UseBindPassword},
		{id:LaDomain.A_GalLdapURL, type:_STRING_, ref:"attrs/" + LaDomain.A_GalLdapURL},
		{id:LaDomain.A_GalLdapBindDn, type:_STRING_, ref:"attrs/" + LaDomain.A_GalLdapBindDn},
		{id:LaDomain.A_GalLdapBindPassword, type:_STRING_, ref:"attrs/" + LaDomain.A_GalLdapBindPassword},
		{id:LaDomain.A_GalLdapBindPasswordConfirm, type:_STRING_, ref:"attrs/" + LaDomain.A_GalLdapBindPasswordConfirm},		
		{id:LaDomain.A_AuthLdapUserDn, type:_STRING_,ref:"attrs/" + LaDomain.A_AuthLdapUserDn},
		{id:LaDomain.A_AuthLDAPUseSSL, type:_ENUM_, choices:LaModel.BOOLEAN_CHOICES, ref:"attrs/" + LaDomain.A_AuthLDAPUseSSL},
		{id:LaDomain.A_AuthLDAPServerName, type:_STRING_, ref:"attrs/" + LaDomain.A_AuthLDAPServerName},
		{id:LaDomain.A_AuthLDAPSearchBase, type:_STRING_, ref:"attrs/" + LaDomain.A_AuthLDAPSearchBase},
		{id:LaDomain.A_AuthLDAPServerPort, type:_NUMBER_, ref:"attrs/" + LaDomain.A_AuthLDAPServerPort, maxInclusive:2147483647},
		{id:LaDomain.A_AuthMech, type:_STRING_, ref:"attrs/" + LaDomain.A_AuthMech},
		{id:LaDomain.A_AuthLdapURL, type:_STRING_, ref:"attrs/" + LaDomain.A_AuthLdapURL},
		{id:LaDomain.A_AuthADDomainName, type:_STRING_, ref:"attrs/" + LaDomain.A_AuthADDomainName},
		{id:LaDomain.A_AuthTestUserName, type:_STRING_},
		{id:LaDomain.A_AuthTestPassword, type:_STRING_},
		{id:LaDomain.A_AuthTestMessage, type:_STRING_},
		{id:LaDomain.A_AuthTestResultCode, type:_STRING_},
		{id:LaDomain.A_AuthTestMessage, type:_STRING_},
		{id:LaDomain.A_AuthComputedBindDn, type:_STRING_},
		{id:LaDomain.A_GALTestMessage, type:_STRING_},
		{id:LaDomain.A_GALTestResultCode, type:_STRING_},
		{id:LaDomain.A_GALSampleQuery, type:_STRING_},
		{id:LaModel.currentStep, type:_NUMBER_, ref:LaModel.currentStep, maxInclusive:2147483647}
	]
};
