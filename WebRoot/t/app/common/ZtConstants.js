Ext.define('ZCS.common.ZtConstants', {
	singleton: true,
	requires: [
//		'ZCS.common.ZtUtil'
	],

//	statics: {
		// putting this in ZtUtil leads to random load-order errors :(
		getBackMap: function(map) {
			var backMap = {},
				key;
			for (key in map) {
				backMap[map[key]] = key;
			}
			return backMap;
		}
//	}
});

// URL portion that precedes the API call
ZCS.common.ZtConstants.SERVICE_URL_BASE = '/service/soap/';

// System folder IDs
ZCS.common.ZtConstants.ID_ROOT      = 1;
ZCS.common.ZtConstants.ID_INBOX     = 2;
ZCS.common.ZtConstants.ID_TRASH     = 3;
ZCS.common.ZtConstants.ID_JUNK      = 4;
ZCS.common.ZtConstants.ID_SENT      = 5;
ZCS.common.ZtConstants.ID_DRAFTS    = 6;
ZCS.common.ZtConstants.ID_CHATS     = 14;

// An ID less than this indicates a system folder
ZCS.common.ZtConstants.MAX_SYSTEM_ID = 255;

// System folder sort order
ZCS.common.ZtConstants.FOLDER_SORT_VALUE = {};
ZCS.common.ZtConstants.FOLDER_SORT_VALUE[ZCS.common.ZtConstants.ID_INBOX]   = '_____a';
ZCS.common.ZtConstants.FOLDER_SORT_VALUE[ZCS.common.ZtConstants.ID_SENT]    = '____a';
ZCS.common.ZtConstants.FOLDER_SORT_VALUE[ZCS.common.ZtConstants.ID_DRAFTS]  = '___a';
ZCS.common.ZtConstants.FOLDER_SORT_VALUE[ZCS.common.ZtConstants.ID_JUNK]    = '__a';
ZCS.common.ZtConstants.FOLDER_SORT_VALUE[ZCS.common.ZtConstants.ID_TRASH]   = '_a';

// Email address types
ZCS.common.ZtConstants.TO       = 'TO';
ZCS.common.ZtConstants.FROM     = 'FROM';
ZCS.common.ZtConstants.CC       = 'CC';
ZCS.common.ZtConstants.BCC      = 'BCC';
ZCS.common.ZtConstants.REPLY_TO = "REPLY_TO";
ZCS.common.ZtConstants.SENDER   = "SENDER";

// Map SOAP type constants to those above
ZCS.common.ZtConstants.FROM_SOAP_TYPE = {};
ZCS.common.ZtConstants.FROM_SOAP_TYPE["f"]  = ZCS.common.ZtConstants.FROM;
ZCS.common.ZtConstants.FROM_SOAP_TYPE["t"]  = ZCS.common.ZtConstants.TO;
ZCS.common.ZtConstants.FROM_SOAP_TYPE["c"]  = ZCS.common.ZtConstants.CC;
ZCS.common.ZtConstants.FROM_SOAP_TYPE["b"]  = ZCS.common.ZtConstants.BCC;
ZCS.common.ZtConstants.FROM_SOAP_TYPE["r"]  = ZCS.common.ZtConstants.REPLY_TO;
ZCS.common.ZtConstants.FROM_SOAP_TYPE["s"]  = ZCS.common.ZtConstants.SENDER;

ZCS.common.ZtConstants.TO_SOAP_TYPE = ZCS.common.ZtConstants.getBackMap(ZCS.common.ZtConstants.FROM_SOAP_TYPE);

ZCS.common.ZtConstants.SETTING_ALIASES = 'zimbraMailAlias';
