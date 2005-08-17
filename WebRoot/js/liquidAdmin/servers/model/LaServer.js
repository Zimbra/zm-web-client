/**
* @class LaServer
* This class represents liquidServer objects. LaServer extends LaItem
* @author Greg Solovyev
* @contructor LaServer
* @param app reference to the application instance
**/
function LaServer(app) {
	LaItem.call(this, app);
	this.attrs = new Object();
	this.id = "";
	this.name="";
}

LaServer.prototype = new LaItem;
LaServer.prototype.constructor = LaServer;
LaServer.prototype.toString = function() {
	return this.name;
}

//attribute name constants, this values are taken from liquid.schema
LaServer.A_name = "cn";
LaServer.A_description = "description";
LaServer.A_notes = "liquidNotes";
LaServer.A_Service = "liquidService";
LaServer.A_ServiceHostname = "liquidServiceHostname";
LaServer.A_liquidMailPort = "liquidMailPort";
LaServer.A_liquidMailSSLPort = "liquidMailSSLPort";
// services
LaServer.A_liquidServiceInstalled = "liquidServiceInstalled";
LaServer.A_liquidLdapServiceInstalled = "_"+LaServer.A_liquidServiceInstalled+"_ldap";
LaServer.A_liquidMailboxServiceInstalled = "_"+LaServer.A_liquidServiceInstalled+"_mailbox";
LaServer.A_liquidMtaServiceInstalled = "_"+LaServer.A_liquidServiceInstalled+"_mta";
LaServer.A_liquidSnmpServiceInstalled = "_"+LaServer.A_liquidServiceInstalled+"_snmp";
LaServer.A_liquidAntiVirusServiceInstalled = "_"+LaServer.A_liquidServiceInstalled+"_antivirus";
LaServer.A_liquidAntiSpamServiceInstalled = "_"+LaServer.A_liquidServiceInstalled+"_antispam";
LaServer.A_liquidServiceEnabled = "liquidServiceEnabled";
LaServer.A_liquidLdapServiceEnabled = "_"+LaServer.A_liquidServiceEnabled+"_ldap";
LaServer.A_liquidMailboxServiceEnabled = "_"+LaServer.A_liquidServiceEnabled+"_mailbox";
LaServer.A_liquidMtaServiceEnabled = "_"+LaServer.A_liquidServiceEnabled+"_mta";
LaServer.A_liquidSnmpServiceEnabled = "_"+LaServer.A_liquidServiceEnabled+"_snmp";
LaServer.A_liquidAntiVirusServiceEnabled = "_"+LaServer.A_liquidServiceEnabled+"_antivirus";
LaServer.A_liquidAntiSpamServiceEnabled = "_"+LaServer.A_liquidServiceEnabled+"_antispam";
// MTA
LaServer.A_liquidMtaAuthEnabled = "liquidMtaAuthEnabled";
LaServer.A_liquidMtaDnsLookupsEnabled = "liquidMtaDnsLookupsEnabled";
LaServer.A_liquidMtaRelayHost = "liquidMtaRelayHost";
LaServer.A_liquidMtaTlsAuthOnly = "liquidMtaTlsAuthOnly";
//smtp
LaServer.A_SmtpHostname  = "liquidSmtpHostname";
LaServer.A_SmtpPort = "liquidSmtpPort";
LaServer.A_SmtpTimeout = "liquidSmtpTimeout";
//Lmtp
LaServer.A_LmtpAdvertisedName = "liquidLmtpAdvertisedName";
LaServer.A_LmtpBindAddress = "liquidLmtpBindAddress";
LaServer.A_LmtpBindPort = "liquidLmtpBindPort";
LaServer.A_LmtpNumThreads = "liquidLmtpNumThreads";
//pop3
LaServer.A_Pop3NumThreads = "liquidPop3NumThreads";
LaServer.A_Pop3AdvertisedName ="liquidPop3AdvertisedName";
LaServer.A_Pop3BindAddress = "liquidPop3BindAddress";
LaServer.A_Pop3BindPort = "liquidPop3BindPort";
LaServer.A_Pop3SSLBindPort = "liquidPop3SSLBindPort";
LaServer.A_Pop3SSLServerEnabled = "liquidPop3SSLServerEnabled";
LaServer.A_Pop3ServerEnabled = "liquidPop3ServerEnabled"
LaServer.A_Pop3CleartextLoginEnabled = "liquidPop3CleartextLoginEnabled";
//imap
LaServer.A_ImapBindPort="liquidImapBindPort";
LaServer.A_ImapServerEnabled="liquidImapServerEnabled";
LaServer.A_ImapSSLBindPort="liquidImapSSLBindPort";
LaServer.A_ImapSSLServerEnabled="liquidImapSSLServerEnabled";
LaServer.A_ImapCleartextLoginEnabled="liquidImapCleartextLoginEnabled";

//redo log
LaServer.A_RedologEnabled = "liquidRedologEnabled";
LaServer.A_RedologLogPath = "liquidRedologLogPath";
LaServer.A_RedologArchiveDir = "liquidRedologArchiveDir";
LaServer.A_RedologBacklogDir = "liquidRedologBacklogDir";
LaServer.A_RedologRolloverFileSizeKB = "liquidRedologRolloverFileSizeKB";
LaServer.A_RedologFsyncIntervalMS = "liquidRedologFsyncIntervalMS";
//master role settings
LaServer.A_MasterRedologClientConnections = "liquidMasterRedologClientConnections";
LaServer.A_MasterRedologClientTimeoutSec = "liquidMasterRedologClientTimeoutSec";
LaServer.A_MasterRedologClientTcpNoDelay = "liquidMasterRedologClientTcpNoDelay";
//slave role settings
LaServer.A_liquidUserServicesEnabled = "liquidUserServicesEnabled";

LaServer.STANDALONE = "standalone";
LaServer.MASTER = "master";
LaServer.SLAVE = "slave";
		
LaServer.myXModel = {
	items: [
		{id:LaItem.A_liquidId, type:_STRING_, ref:"attrs/" + LaItem.A_liquidId},
		{id:LaServer.A_name, ref:"attrs/" + LaServer.A_name, type:_STRING_},
		{id:LaServer.A_description, ref:"attrs/" +  LaServer.A_description, type:_STRING_},
		{id:LaServer.A_notes, ref:"attrs/" +  LaServer.A_notes, type:_STRING_},		
		{id:LaServer.A_Service, ref:"attrs/" +  LaServer.A_Service, type:_STRING_},				
		{id:LaServer.A_ServiceHostname, ref:"attrs/" +  LaServer.A_ServiceHostname, type:_STRING_},								
		// Services
		{id:LaServer.A_liquidLdapServiceEnabled, ref:"attrs/"+LaServer.A_liquidLdapServiceEnabled, type: _ENUM_, choices: [false,true] },
		{id:LaServer.A_liquidMailboxServiceEnabled, ref:"attrs/"+LaServer.A_liquidMailboxServiceEnabled, type: _ENUM_, choices: [false,true] },
		{id:LaServer.A_liquidMtaServiceEnabled, ref:"attrs/"+LaServer.A_liquidMtaServiceEnabled, type: _ENUM_, choices: [false,true] },
		{id:LaServer.A_liquidSnmpServiceEnabled, ref:"attrs/"+LaServer.A_liquidSnmpServiceEnabled, type: _ENUM_, choices: [false,true] },
		{id:LaServer.A_liquidAntiVirusServiceEnabled, ref:"attrs/"+LaServer.A_liquidAntiVirusServiceEnabled, type: _ENUM_, choices: [false,true] },
		{id:LaServer.A_liquidAntiSpamServiceEnabled, ref:"attrs/"+LaServer.A_liquidAntiSpamServiceEnabled, type: _ENUM_, choices: [false,true] },
		// MTA
		{id:LaServer.A_liquidMtaAuthEnabled, ref:"attrs/" +  LaServer.A_liquidMtaAuthEnabled, type: _ENUM_, choices: LaModel.BOOLEAN_CHOICES },
		{id:LaServer.A_liquidMtaTlsAuthOnly, ref:"attrs/" +  LaServer.A_liquidMtaTlsAuthOnly, type: _ENUM_, choices: LaModel.BOOLEAN_CHOICES },
		{id:LaServer.A_liquidMtaRelayHost, ref:"attrs/" +  LaServer.A_liquidMtaRelayHost, type: _STRING_ },
		{id:LaServer.A_liquidMtaDnsLookupsEnabled, ref:"attrs/" +  LaServer.A_liquidMtaDnsLookupsEnabled, type: _ENUM_, choices: LaModel.BOOLEAN_CHOICES },
		// ...other...
		{id:LaServer.A_SmtpHostname, ref:"attrs/" +  LaServer.A_SmtpHostname, type:_STRING_},														
		{id:LaServer.A_SmtpPort, ref:"attrs/" +  LaServer.A_SmtpPort, type:_STRING_},																
		{id:LaServer.A_SmtpTimeout, ref:"attrs/" + LaServer.A_SmtpTimeout, type:_STRING_},		
		{id:LaServer.A_LmtpAdvertisedName, ref:"attrs/" +  LaServer.A_LmtpAdvertisedName, type:_STRING_},
		{id:LaServer.A_LmtpBindAddress, ref:"attrs/" +  LaServer.A_LmtpBindAddress, type:_STRING_},		
		{id:LaServer.A_LmtpBindPort, ref:"attrs/" +  LaServer.A_LmtpBindPort, type:_STRING_},		
		{id:LaServer.A_LmtpNumThreads, ref:"attrs/" +  LaServer.A_LmtpNumThreads, type:_STRING_},		
		{id:LaServer.A_Pop3NumThreads, ref:"attrs/" +  LaServer.A_Pop3NumThreads, type:_STRING_},		
		{id:LaServer.A_Pop3AdvertisedName, ref:"attrs/" +  LaServer.A_Pop3AdvertisedName, type:_STRING_},		
		{id:LaServer.A_Pop3BindAddress, ref:"attrs/" +  LaServer.A_Pop3BindAddress, type:_STRING_},		
		{id:LaServer.A_LmtpBindPort, ref:"attrs/" +  LaServer.A_LmtpBindPort, type:_STRING_},		
		{id:LaServer.A_LmtpNumThreads, ref:"attrs/" +  LaServer.A_LmtpNumThreads, type:_STRING_},		
		{id:LaServer.A_Pop3NumThreads, ref:"attrs/" +  LaServer.A_Pop3NumThreads, type:_STRING_},		
		{id:LaServer.A_Pop3AdvertisedName, ref:"attrs/" +  LaServer.A_Pop3AdvertisedName, type:_STRING_},		
		{id:LaServer.A_Pop3BindAddress, ref:"attrs/" +  LaServer.A_Pop3BindAddress, type:_STRING_},		
		{id:LaServer.A_Pop3BindPort, ref:"attrs/" +  LaServer.A_Pop3BindPort, type:_STRING_},		
		{id:LaServer.A_Pop3SSLBindPort, ref:"attrs/" +  LaServer.A_Pop3SSLBindPort, type:_STRING_},		
		{id:LaServer.A_Pop3SSLServerEnabled, ref:"attrs/" + LaServer.A_Pop3SSLServerEnabled, type:_ENUM_, choices:LaModel.BOOLEAN_CHOICES},		
		{id:LaServer.A_Pop3ServerEnabled, ref:"attrs/" + LaServer.A_Pop3ServerEnabled, type:_ENUM_, choices:LaModel.BOOLEAN_CHOICES},		
		{id:LaServer.A_Pop3CleartextLoginEnabled, ref:"attrs/" + LaServer.A_Pop3CleartextLoginEnabled, type:_ENUM_, choices:LaModel.BOOLEAN_CHOICES},		
		{id:LaServer.A_ImapBindPort, ref:"attrs/" + LaServer.A_ImapBindPort, type:_STRING_},		
		{id:LaServer.A_ImapServerEnabled, ref:"attrs/" + LaServer.A_ImapServerEnabled, type:_ENUM_, choices:LaModel.BOOLEAN_CHOICES},		
		{id:LaServer.A_ImapSSLBindPort, ref:"attrs/" + LaServer.A_ImapSSLBindPort, type:_STRING_},		
		{id:LaServer.A_ImapSSLServerEnabled, ref:"attrs/" + LaServer.A_ImapSSLServerEnabled, type:_ENUM_, choices:LaModel.BOOLEAN_CHOICES},		
		{id:LaServer.A_ImapCleartextLoginEnabled, ref:"attrs/" + LaServer.A_ImapCleartextLoginEnabled, type:_ENUM_, choices:LaModel.BOOLEAN_CHOICES},		
		{id:LaServer.A_RedologEnabled, ref:"attrs/" + LaServer.A_RedologEnabled, type:_ENUM_, choices:LaModel.BOOLEAN_CHOICES},		
		{id:LaServer.A_RedologLogPath, ref:"attrs/" + LaServer.A_RedologLogPath, type:_STRING_},		
		{id:LaServer.A_RedologArchiveDir, ref:"attrs/" + LaServer.A_RedologArchiveDir, type:_STRING_},		
		{id:LaServer.A_RedologBacklogDir, ref:"attrs/" + LaServer.A_RedologBacklogDir, type:_STRING_},		
		{id:LaServer.A_RedologRolloverFileSizeKB, ref:"attrs/" + LaServer.A_RedologRolloverFileSizeKB, type:_STRING_},		
		{id:LaServer.A_RedologFsyncIntervalMS, ref:"attrs/" + LaServer.A_RedologFsyncIntervalMS, type:_STRING_},		
		{id:LaServer.A_MasterRedologClientConnections, ref:"attrs/" + LaServer.A_MasterRedologClientConnections, type:_STRING_},		
		{id:LaServer.A_MasterRedologClientTimeoutSec, ref:"attrs/" + LaServer.A_MasterRedologClientTimeoutSec, type:_STRING_},		
		{id:LaServer.A_MasterRedologClientTcpNoDelay, ref:"attrs/" + LaServer.A_MasterRedologClientTcpNoDelay, type:_STRING_},		
		{id:LaServer.A_liquidUserServicesEnabled, ref:"attrs/" + LaServer.A_liquidUserServicesEnabled, type:_ENUM_, choices:LaModel.BOOLEAN_CHOICES}		
	]
};
		
LaServer.getAll =
function() {
	var soapDoc = LsSoapDoc.create("GetAllServersRequest", "urn:liquidAdmin", null);	
	var resp = LsCsfeCommand.invoke(soapDoc, null, null, null, true).firstChild;
	var list = new LaItemList("server", LaServer);
	list.loadFromDom(resp);
//	list.sortByName();		
	return list;
}

/**
* @param mods - map of modified attributes
* modifies object's information in the database
**/
LaServer.prototype.modify =
function(mods) {
	var soapDoc = LsSoapDoc.create("ModifyServerRequest", "urn:liquidAdmin", null);
	soapDoc.set("id", this.id);
	for (var aname in mods) {
		if (mods[aname] instanceof Array) {
			var array = mods[aname];
			if (array.length > 0) {
				for (var i = 0; i < array.length; i++) {
					var attr = soapDoc.set("a", array[i]);
					attr.setAttribute("n", aname);
				}
			}
			else {
				var attr = soapDoc.set("a");
				attr.setAttribute("n", aname);
			}
		}
		else {
			var attr = soapDoc.set("a", mods[aname]);
			attr.setAttribute("n", aname);
		}
	}
	var resp = LsCsfeCommand.invoke(soapDoc, false, null, this.id, true).firstChild;
	//update itseld
	this.initFromDom(resp.firstChild);
}

/**
* Returns HTML for a tool tip for this domain.
*/
LaServer.prototype.getToolTip =
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
		html[idx++] = LsImg.getImageHtml(LaImg.I_SERVER);		
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

LaServer.prototype.remove = 
function() {
	var soapDoc = LsSoapDoc.create("DeleteServerRequest", "urn:liquidAdmin", null);
	soapDoc.set("id", this.id);
	LsCsfeCommand.invoke(soapDoc, null, null, null, true);	
}

LaServer.prototype.load = 
function(by, val, withConfig) {
	var soapDoc = LsSoapDoc.create("GetServerRequest", "urn:liquidAdmin", null);
	if(withConfig) {
		soapDoc.getMethod().setAttribute("applyConfig", "1");	
	} else {
		soapDoc.getMethod().setAttribute("applyConfig", "0");		
	}
	var elBy = soapDoc.set("server", val);
	elBy.setAttribute("by", by);
	var resp = LsCsfeCommand.invoke(soapDoc, null, null, null, true).firstChild;
	this.initFromDom(resp.firstChild);
}

LaServer.prototype.initFromDom = function(node) {
	LaItem.prototype.initFromDom.call(this, node);
	
	// convert installed/enabled services to hidden fields for xform binding
	var installed = this.attrs[LaServer.A_liquidServiceInstalled];
	if (installed) {
		if (LsUtil.isString(installed)) {
			installed = [ installed ];
		}
		for (var i = 0; i < installed.length; i++) {
			var service = installed[i];
			this.attrs["_"+LaServer.A_liquidServiceInstalled+"_"+service] = true;
			this.attrs["_"+LaServer.A_liquidServiceEnabled+"_"+service] = false;
		}
	}
	
	var enabled = this.attrs[LaServer.A_liquidServiceEnabled];
	if (enabled) {
		if (LsUtil.isString(enabled)) {
			enabled = [ enabled ];
		}
		for (var i = 0; i < enabled.length; i++) {
			var service = enabled[i];
			this.attrs["_"+LaServer.A_liquidServiceEnabled+"_"+service] = true;
		}
	}
}
