function LaGlobalConfig(app) {
	LaItem.call(this, app);
	this.attrs = new Object();
	this.load();
}

LaGlobalConfig.prototype = new LaItem;
LaGlobalConfig.prototype.constructor = LaGlobalConfig;

LaGlobalConfig.MTA_RESTRICTIONS = [
	"reject_invalid_hostname", "reject_non_fqdn_hostname", "reject_non_fqdn_sender",
	"reject_unknown_client", "reject_unknown_hostname", "reject_unknown_sender_domain"
];

//general
LaGlobalConfig.A_liquidLastLogonTimestampFrequency = "liquidLastLogonTimestampFrequency";
LaGlobalConfig.A_liquidDefaultDomainName = "liquidDefaultDomainName";
// attachements
LaGlobalConfig.A_liquidAttachmentsBlocked = "liquidAttachmentsBlocked";
LaGlobalConfig.A_liquidAttachmentsViewInHtmlOnly = "liquidAttachmentsViewInHtmlOnly";
LaGlobalConfig.A_liquidMtaBlockedExtension = "liquidMtaBlockedExtension";
LaGlobalConfig.A_liquidMtaCommonBlockedExtension = "liquidMtaCommonBlockedExtension";
LaGlobalConfig.A_liquidMtaCommonBlockedExtensions = "liquidMtaCommonBlockedExtensions";
// MTA
LaGlobalConfig.A_liquidMtaAuthEnabled = "liquidMtaAuthEnabled";
LaGlobalConfig.A_liquidMtaTlsAuthOnly = "liquidMtaTlsAuthOnly";
LaGlobalConfig.A_liquidMtaDnsLookupsEnabled  = "liquidMtaDnsLookupsEnabled";
LaGlobalConfig.A_liquidMtaMaxMessageSize = "liquidMtaMaxMessageSize";
LaGlobalConfig.A_liquidMtaRelayHost = "liquidMtaRelayHost";
LaGlobalConfig.A_liquidComponentAvailable = "liquidComponentAvailable";
LaGlobalConfig.A_liquidComponentAvailable_convertd = "_"+LaGlobalConfig.A_liquidComponentAvailable+"_convertd";
LaGlobalConfig.A_liquidComponentAvailable_replication = "_"+LaGlobalConfig.A_liquidComponentAvailable+"_replication";
LaGlobalConfig.A_liquidComponentAvailable_hotbackup = "_"+LaGlobalConfig.A_liquidComponentAvailable+"_hotbackup";
// --protocol checks
LaGlobalConfig.A_liquidMtaRestriction = "liquidMtaRestriction";
LaGlobalConfig.A_liquidMtaRejectInvalidHostname = "_"+LaGlobalConfig.A_liquidMtaRestriction+"_reject_invalid_hostname";
LaGlobalConfig.A_liquidMtaRejectNonFqdnHostname = "_"+LaGlobalConfig.A_liquidMtaRestriction+"_reject_non_fqdn_hostname";
LaGlobalConfig.A_liquidMtaRejectNonFqdnSender = "_"+LaGlobalConfig.A_liquidMtaRestriction+"_reject_non_fqdn_sender";
// -- dns checks
LaGlobalConfig.A_liquidMtaRejectUnknownClient = "_"+LaGlobalConfig.A_liquidMtaRestriction+"_reject_unknown_client";
LaGlobalConfig.A_liquidMtaRejectUnknownHostname = "_"+LaGlobalConfig.A_liquidMtaRestriction+"_reject_unknown_hostname";
LaGlobalConfig.A_liquidMtaRejectUnknownSenderDomain = "_"+LaGlobalConfig.A_liquidMtaRestriction+"_reject_unknown_sender_domain";
//Domain
LaGlobalConfig.A_liquidGalLdapFilterDef = "liquidGalLdapFilterDef";
LaGlobalConfig.A_liquidGalMaxResults = "liquidGalMaxResults";
//Server
LaGlobalConfig.A_liquidLmtpNumThreads = "liquidLmtpNumThreads";
LaGlobalConfig.A_liquidLmtpBindPort = "liquidLmtpBindPort";
LaGlobalConfig.A_liquidPop3NumThreads = "liquidPop3NumThreads";
LaGlobalConfig.A_liquidPop3BindPort = "liquidPop3BindPort";
LaGlobalConfig.A_liquidRedologEnabled = "liquidRedologEnabled";
LaGlobalConfig.A_liquidRedologLogPath = "liquidRedologLogPath";
LaGlobalConfig.A_liquidRedologArchiveDir = "liquidRedologArchiveDir";
LaGlobalConfig.A_liquidRedologBacklogDir = "liquidRedologBacklogDir";
LaGlobalConfig.A_liquidRedologRolloverFileSizeKB = "liquidRedologRolloverFileSizeKB";
LaGlobalConfig.A_liquidRedologFsyncIntervalMS = "liquidRedologFsyncIntervalMS";



// smtp
LaGlobalConfig.A_liquidSmtpHostname = "liquidSmtpHostname";
LaGlobalConfig.A_liquidSmtpPort = "liquidSmtpPort";
LaGlobalConfig.A_liquidSmtpTimeout = "liquidSmtpTimeout";
// pop
LaGlobalConfig.A_liquidPop3BindPort="liquidPop3BindPort";
LaGlobalConfig.A_liquidPop3ServerEnabled = "liquidPop3ServerEnabled";
LaGlobalConfig.A_liquidPop3SSLBindPort = "liquidPop3SSLBindPort";
LaGlobalConfig.A_liquidPop3SSLServerEnabled = "liquidPop3SSLServerEnabled";
LaGlobalConfig.A_liquidPop3CleartextLoginEnabled = "liquidPop3CleartextLoginEnabled";
// imap
LaGlobalConfig.A_liquidImapBindPort = "liquidImapBindPort";
LaGlobalConfig.A_liquidImapServerEnabled = "liquidImapServerEnabled";
LaGlobalConfig.A_liquidImapSSLBindPort = "liquidImapSSLBindPort";
LaGlobalConfig.A_liquidImapSSLServerEnabled = "liquidImapSSLServerEnabled";
LaGlobalConfig.A_liquidImapCleartextLoginEnabled = "liquidImapCleartextLoginEnabled";
// anti-spam
LaGlobalConfig.A_liquidSpamCheckEnabled = "liquidSpamCheckEnabled";
LaGlobalConfig.A_liquidSpamKillPercent = "liquidSpamKillPercent";
LaGlobalConfig.A_liquidSpamTagPercent = "liquidSpamTagPercent";
LaGlobalConfig.A_liquidSpamSubjectTag = "liquidSpamSubjectTag";
// anti-virus
LaGlobalConfig.A_liquidVirusCheckEnabled = "liquidVirusCheckEnabled";
LaGlobalConfig.A_liquidVirusWarnRecipient = "liquidVirusWarnRecipient";
LaGlobalConfig.A_liquidVirusWarnAdmin = "liquidVirusWarnAdmin";
LaGlobalConfig.A_liquidVirusDefinitionsUpdateFrequency = "liquidVirusDefinitionsUpdateFrequency";
LaGlobalConfig.A_liquidVirusBlockEncryptedArchive = "liquidVirusBlockEncryptedArchive";
//immutable attrs
LaGlobalConfig.A_liquidAccountClientAttr = "liquidAccountClientAttr";
LaGlobalConfig.A_liquidServerInheritedAttr = "liquidServerInheritedAttr";
LaGlobalConfig.A_liquidDomainInheritedAttr = "liquidDomainInheritedAttr";
LaGlobalConfig.A_liquidCOSInheritedAttr = "liquidCOSInheritedAttr";
LaGlobalConfig.A_liquidGalLdapAttrMap = "liquidGalLdapAttrMap";
LaGlobalConfig.A_liquidGalLdapFilterDef = "liquidGalLdapFilterDef";
// others
LaGlobalConfig.A_liquidNewExtension = "_liquidNewExtension";


LaGlobalConfig.prototype.load =
function () {
	var soapDoc = LsSoapDoc.create("GetAllConfigRequest", "urn:liquidAdmin", null);
	var resp = LsCsfeCommand.invoke(soapDoc, null, null, null, true).firstChild;
	this.initFromDom(resp);
}

LaGlobalConfig.prototype.initFromDom = function(node) {
	LaItem.prototype.initFromDom.call(this, node);

	// convert blocked extension lists to arrays
	var common = this.attrs[LaGlobalConfig.A_liquidMtaCommonBlockedExtension];
	if (common == null) {
		common = [];
	}
	else if (LsUtil.isString(common)) {
		common = [ common ];
	}
	var commonMap = {};
	for (var i = 0; i < common.length; i++) {
		var ext = common[i];
		common[i] = new String(ext);
		common[i].id = "id_"+ext;
		commonMap[ext] = common[i];
	}
	this.attrs[LaGlobalConfig.A_liquidMtaCommonBlockedExtension] = common;
	
	var blocked = this.attrs[LaGlobalConfig.A_liquidMtaBlockedExtension];
	if (blocked == null) {
		blocked = [];
	}
	else if (LsUtil.isString(blocked)) {
		blocked = [ blocked ];
	}
	for (var i = 0; i < blocked.length; i++) {
		var ext = blocked[i];
		if (commonMap[ext]) {
			blocked[i] = commonMap[ext];
		}
		else {
			blocked[i] = new String(ext);
			blocked[i].id = "id_"+ext;
		}
	}
	this.attrs[LaGlobalConfig.A_liquidMtaBlockedExtension] = blocked;

	// convert available components to hidden fields for xform binding
	var components = this.attrs[LaGlobalConfig.A_liquidComponentAvailable];
	if (components) {
		if (LsUtil.isString(components)) {
			components = [ components ];
		}
		for (var i = 0; i < components.length; i++) {
			var component = components[i];
			this.attrs["_"+LaGlobalConfig.A_liquidComponentAvailable+"_"+component] = true;
		}
	}
	
	// convert restrictions to hidden fields for xform binding
	var restrictions = this.attrs[LaGlobalConfig.A_liquidMtaRestriction];
	if (restrictions) {
		if (LsUtil.isString(restrictions)) {
			restrictions = [ restrictions ];
		}
		for (var i = 0; i < restrictions.length; i++) {
			var restriction = restrictions[i];
			this.attrs["_"+LaGlobalConfig.A_liquidMtaRestriction+"_"+restriction] = true;
		}
	}
}

LaGlobalConfig.prototype.modify = 
function (mods) {
	var soapDoc = LsSoapDoc.create("ModifyConfigRequest", "urn:liquidAdmin", null);
	for (var aname in mods) {
		//multy value attribute
		if(mods[aname] instanceof Array) {
			var cnt = mods[aname].length;
			if(cnt > 0) {
				for(var ix=0; ix <cnt; ix++) {
					var attr = soapDoc.set("a", mods[aname][ix]);
					attr.setAttribute("n", aname);
				}
			} 
			else {
				var attr = soapDoc.set("a");
				attr.setAttribute("n", aname);
			}
		} else {
			var attr = soapDoc.set("a", mods[aname]);
			attr.setAttribute("n", aname);
		}
	}
	var resp = LsCsfeCommand.invoke(soapDoc, null, null, null, true).firstChild;
	var newConfig = this._app.getGlobalConfig(true);
	if(newConfig.attrs) {
		for (var aname in newConfig.attrs) {
			this.attrs[aname] = newConfig.attrs[aname];
		}
	}
}

LaGlobalConfig.myXModel = {
	items:[
	  	// ...other...
		{ id:LaGlobalConfig.A_liquidGalMaxResults, ref:"attrs/" + LaGlobalConfig.A_liquidGalMaxResults , type:_NUMBER_},
		{ id:LaGlobalConfig.A_liquidDefaultDomainName, ref:"attrs/" + LaGlobalConfig.A_liquidDefaultDomainName, type:_STRING_},
		// attachments
		{ id:LaGlobalConfig.A_liquidAttachmentsBlocked, ref:"attrs/" + LaGlobalConfig.A_liquidAttachmentsBlocked, type:_ENUM_, choices:LaModel.BOOLEAN_CHOICES},
		{ id:LaGlobalConfig.A_liquidMtaBlockedExtension, ref:"attrs/" + LaGlobalConfig.A_liquidMtaBlockedExtension, type: _LIST_, dataType: _STRING_ },
		{ id:LaGlobalConfig.A_liquidMtaCommonBlockedExtensions, ref:"attrs/" + LaGlobalConfig.A_liquidMtaCommonBlockedExtensions, type: _STRING_ },
		{ id:LaGlobalConfig.A_liquidMtaCommonBlockedExtension, ref:"attrs/" + LaGlobalConfig.A_liquidMtaCommonBlockedExtension, type: _LIST_, dataType: _STRING_ },
		// MTA
		{ id:LaGlobalConfig.A_liquidMtaAuthEnabled, ref:"attrs/" + LaGlobalConfig.A_liquidMtaAuthEnabled, type: _ENUM_, choices: LaModel.BOOLEAN_CHOICES },
		{ id:LaGlobalConfig.A_liquidMtaTlsAuthOnly, ref:"attrs/" + LaGlobalConfig.A_liquidMtaTlsAuthOnly, type: _ENUM_, choices: LaModel.BOOLEAN_CHOICES },
		{ id:LaGlobalConfig.A_liquidAttachmentsViewInHtmlOnly, ref:"attrs/" + LaGlobalConfig.A_liquidAttachmentsViewInHtmlOnly, type:_ENUM_, choices:LaModel.BOOLEAN_CHOICES},
		{ id:LaGlobalConfig.A_liquidSmtpHostname, ref:"attrs/" + LaGlobalConfig.A_liquidSmtpHostname, type:_STRING_},
		{ id:LaGlobalConfig.A_liquidSmtpPort, ref:"attrs/" + LaGlobalConfig.A_liquidSmtpPort, type:_NUMBER_},
		{ id:LaGlobalConfig.A_liquidMtaMaxMessageSize, ref:"attrs/" + LaGlobalConfig.A_liquidMtaMaxMessageSize, type: _FILE_SIZE_, units: LsUtil.SIZE_KILOBYTES },
		{ id:LaGlobalConfig.A_liquidMtaRelayHost, ref:"attrs/" + LaGlobalConfig.A_liquidMtaRelayHost, type: _STRING_ },
		{ id:LaGlobalConfig.A_liquidMtaDnsLookupsEnabled, ref:"attrs/" + LaGlobalConfig.A_liquidMtaDnsLookupsEnabled, type: _ENUM_, choices: LaModel.BOOLEAN_CHOICES },
		// -- protocol checks
		{ id:LaGlobalConfig.A_liquidMtaRejectInvalidHostname, ref:"attrs/" + LaGlobalConfig.A_liquidMtaRejectInvalidHostname, type: _ENUM_, choices: [false,true] },
		{ id:LaGlobalConfig.A_liquidMtaRejectNonFqdnHostname, ref:"attrs/" + LaGlobalConfig.A_liquidMtaRejectNonFqdnHostname, type: _ENUM_, choices: [false,true] },
		{ id:LaGlobalConfig.A_liquidMtaRejectNonFqdnSender, ref:"attrs/" + LaGlobalConfig.A_liquidMtaRejectNonFqdnSender, type: _ENUM_, choices: [false,true] },
		// -- dns checks
		{ id:LaGlobalConfig.A_liquidMtaRejectUnknownClient, ref:"attrs/" + LaGlobalConfig.A_liquidMtaRejectUnknownClient, type: _ENUM_, choices: [false,true] },
		{ id:LaGlobalConfig.A_liquidMtaRejectUnknownHostname, ref:"attrs/" + LaGlobalConfig.A_liquidMtaRejectUnknownHostname, type: _ENUM_, choices: [false,true] },
		{ id:LaGlobalConfig.A_liquidMtaRejectUnknownSenderDomain, ref:"attrs/" + LaGlobalConfig.A_liquidMtaRejectUnknownSenderDomain, type: _ENUM_, choices: [false,true] },
		// smtp
		{ id:LaGlobalConfig.A_liquidSmtpTimeout, ref:"attrs/" + LaGlobalConfig.A_liquidSmtpTimeout, type:_NUMBER_},		
		// pop
		{ id:LaGlobalConfig.A_liquidPop3ServerEnabled, ref:"attrs/" + LaGlobalConfig.A_liquidPop3ServerEnabled, type:_ENUM_, choices:LaModel.BOOLEAN_CHOICES},
		{ id:LaGlobalConfig.A_liquidPop3SSLServerEnabled, ref:"attrs/" + LaGlobalConfig.A_liquidPop3SSLServerEnabled, type:_ENUM_, choices:LaModel.BOOLEAN_CHOICES},		
		{ id:LaGlobalConfig.A_liquidPop3CleartextLoginEnabled, ref:"attrs/" + LaGlobalConfig.A_liquidPop3CleartextLoginEnabled, type:_ENUM_, choices:LaModel.BOOLEAN_CHOICES},				
		{ id:LaGlobalConfig.A_liquidPop3BindPort, ref:"attrs/" + LaGlobalConfig.A_liquidPop3BindPort, type:_NUMBER_},				
		{ id:LaGlobalConfig.A_liquidPop3SSLBindPort, ref:"attrs/" + LaGlobalConfig.A_liquidPop3SSLBindPort, type:_NUMBER_},	
		// imap
		{ id:LaGlobalConfig.A_liquidImapServerEnabled, ref:"attrs/" + LaGlobalConfig.A_liquidImapServerEnabled, type:_ENUM_, choices:LaModel.BOOLEAN_CHOICES},						
		{ id:LaGlobalConfig.A_liquidImapSSLServerEnabled, ref:"attrs/" + LaGlobalConfig.A_liquidImapSSLServerEnabled, type:_ENUM_, choices:LaModel.BOOLEAN_CHOICES},								
		{ id:LaGlobalConfig.A_liquidImapCleartextLoginEnabled, ref:"attrs/" + LaGlobalConfig.A_liquidImapCleartextLoginEnabled, type:_ENUM_, choices:LaModel.BOOLEAN_CHOICES},										
		{ id:LaGlobalConfig.A_liquidImapBindPort, ref:"attrs/" + LaGlobalConfig.A_liquidImapBindPort, type:_NUMBER_},					
		{ id:LaGlobalConfig.A_liquidImapSSLBindPort, ref:"attrs/" + LaGlobalConfig.A_liquidImapSSLBindPort, type:_NUMBER_},
		// anti-spam
	  	{ id:LaGlobalConfig.A_liquidSpamCheckEnabled, ref:"attrs/" + LaGlobalConfig.A_liquidSpamCheckEnabled, type: _ENUM_, choices: LaModel.BOOLEAN_CHOICES },
	  	{ id:LaGlobalConfig.A_liquidSpamKillPercent, ref:"attrs/" + LaGlobalConfig.A_liquidSpamKillPercent, type: _NUMBER_, fractionDigits: 0, minInclusive: 0, maxInclusive: 100 },
	  	{ id:LaGlobalConfig.A_liquidSpamTagPercent, ref:"attrs/" + LaGlobalConfig.A_liquidSpamTagPercent, type: _NUMBER_, fractionDigits: 0, minInclusive: 0, maxInclusive: 100 },
	  	{ id:LaGlobalConfig.A_liquidSpamSubjectTag, ref:"attrs/" + LaGlobalConfig.A_liquidSpamSubjectTag, type: _STRING_, whiteSpace: 'collapse' },
	  	// anti-virus
	  	{ id:LaGlobalConfig.A_liquidVirusCheckEnabled, ref:"attrs/" + LaGlobalConfig.A_liquidVirusCheckEnabled, type: _ENUM_, choices: LaModel.BOOLEAN_CHOICES },
	  	{ id:LaGlobalConfig.A_liquidVirusDefinitionsUpdateFrequency, ref:"attrs/" + LaGlobalConfig.A_liquidVirusDefinitionsUpdateFrequency, type: _NUMBER_, fractionDigits: 0 },
	  	{ id:LaGlobalConfig.A_liquidVirusBlockEncryptedArchive, ref:"attrs/" + LaGlobalConfig.A_liquidVirusBlockEncryptedArchive, type: _ENUM_, choices: LaModel.BOOLEAN_CHOICES },
	  	{ id:LaGlobalConfig.A_liquidVirusWarnAdmin, ref:"attrs/" + LaGlobalConfig.A_liquidVirusWarnAdmin, type: _ENUM_, choices: LaModel.BOOLEAN_CHOICES },
	  	{ id:LaGlobalConfig.A_liquidVirusWarnRecipient, ref:"attrs/" + LaGlobalConfig.A_liquidVirusWarnRecipient, type: _ENUM_, choices: LaModel.BOOLEAN_CHOICES }
	]	
};
