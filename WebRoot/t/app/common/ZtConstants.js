/**
 * This static class collects all the constants needed by ZCS in one place, rather than
 * partitioning them into the classes they're related to. We trade organization for
 * convenience, since the code will never have to worry about whether the defining class
 * has been loaded.
 *
 * Use of the shortcut ZCS.constant is recommended for accessing these constants.
 */
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

// shortcut
ZCS.constant = ZCS.common.ZtConstants;

// URL portion that precedes the API call
ZCS.constant.SERVICE_URL_BASE = '/service/soap/';

// Apps
ZCS.constant.APP_MAIL     = 'MAIL';
ZCS.constant.APP_CONTACTS = 'CONTACTS';
ZCS.constant.ALL_APPS = [
	ZCS.constant.APP_MAIL,
	ZCS.constant.APP_CONTACTS
];

// Various xtypes by app

ZCS.constant.MAIN_XTYPE = {};
ZCS.constant.MAIN_XTYPE[ZCS.constant.APP_MAIL]      = 'mailview';
ZCS.constant.MAIN_XTYPE[ZCS.constant.APP_CONTACTS]  = 'contactsview';

ZCS.constant.LIST_PANEL_XTYPE = {};
ZCS.constant.LIST_PANEL_XTYPE[ZCS.constant.APP_MAIL]     = 'convlistpanel';
ZCS.constant.LIST_PANEL_XTYPE[ZCS.constant.APP_CONTACTS] = 'contactlistpanel';

ZCS.constant.LIST_VIEW_XTYPE = {};
ZCS.constant.LIST_VIEW_XTYPE[ZCS.constant.APP_MAIL]     = 'convlistview';
ZCS.constant.LIST_VIEW_XTYPE[ZCS.constant.APP_CONTACTS] = 'contactlistview';

// View (from JSON folder data) that determines which app a folder belongs to
ZCS.constant.FOLDER_VIEW = {};
ZCS.constant.FOLDER_VIEW[ZCS.constant.APP_MAIL]     = 'message';
ZCS.constant.FOLDER_VIEW[ZCS.constant.APP_CONTACTS] = 'contact';

// System folder IDs
ZCS.constant.ID_ROOT      = 1;
ZCS.constant.ID_INBOX     = 2;
ZCS.constant.ID_TRASH     = 3;
ZCS.constant.ID_JUNK      = 4;
ZCS.constant.ID_SENT      = 5;
ZCS.constant.ID_DRAFTS    = 6;
ZCS.constant.ID_CONTACTS  = 7;
ZCS.constant.ID_EMAILED   = 13;
ZCS.constant.ID_CHATS     = 14;

// An ID less than this indicates a system folder
ZCS.constant.MAX_SYSTEM_ID = 255;

// System folder sort order
ZCS.constant.FOLDER_SORT_VALUE = {};
ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_TRASH]   = '_a';

ZCS.constant.FOLDER_SORT_VALUE = {};
ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_INBOX]   = '_____a';
ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_SENT]    = '____a';
ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_DRAFTS]  = '___a';
ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_JUNK]    = '__a';

ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_CONTACTS]    = '___a';
ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_EMAILED]     = '__a';

// Folders we don't want to show in overview
ZCS.constant.FOLDER_HIDE = {};
ZCS.constant.FOLDER_HIDE[ZCS.constant.ID_CHATS] = true;

// Email address types
ZCS.constant.TO       = 'TO';
ZCS.constant.FROM     = 'FROM';
ZCS.constant.CC       = 'CC';
ZCS.constant.BCC      = 'BCC';
ZCS.constant.REPLY_TO = 'REPLY_TO';
ZCS.constant.SENDER   = 'SENDER';

// Map SOAP type constants to those above
ZCS.constant.FROM_SOAP_TYPE = {};
ZCS.constant.FROM_SOAP_TYPE['f']  = ZCS.constant.FROM;
ZCS.constant.FROM_SOAP_TYPE['t']  = ZCS.constant.TO;
ZCS.constant.FROM_SOAP_TYPE['c']  = ZCS.constant.CC;
ZCS.constant.FROM_SOAP_TYPE['b']  = ZCS.constant.BCC;
ZCS.constant.FROM_SOAP_TYPE['r']  = ZCS.constant.REPLY_TO;
ZCS.constant.FROM_SOAP_TYPE['s']  = ZCS.constant.SENDER;

// and the other way too
ZCS.constant.TO_SOAP_TYPE = ZCS.constant.getBackMap(ZCS.constant.FROM_SOAP_TYPE);

// Setting names
ZCS.constant.SETTING_ALIASES            = 'zimbraMailAlias';
ZCS.constant.SETTING_INITIAL_SEARCH     = 'zimbraPrefMailInitialSearch';
ZCS.constant.SETTING_SHOW_SEARCH        = 'zimbraPrefShowSearchString'

// Item flags
ZCS.constant.FLAG_ATTACH			= 'a';
ZCS.constant.FLAG_FLAGGED			= 'f';
ZCS.constant.FLAG_FORWARDED			= 'w';
ZCS.constant.FLAG_ISDRAFT 			= 'd';
ZCS.constant.FLAG_ISSENT			= 's';
ZCS.constant.FLAG_REPLIED			= 'r';
ZCS.constant.FLAG_UNREAD			= 'u';

ZCS.constant.ALL_FLAGS = [
	ZCS.constant.FLAG_FLAGGED,
	ZCS.constant.FLAG_ATTACH,
	ZCS.constant.FLAG_UNREAD,
	ZCS.constant.FLAG_REPLIED,
	ZCS.constant.FLAG_FORWARDED,
	ZCS.constant.FLAG_ISSENT,
	ZCS.constant.FLAG_ISDRAFT
];

// Map flag to item property
ZCS.constant.FLAG_PROP = {};
ZCS.constant.FLAG_PROP[ZCS.constant.FLAG_ATTACH]			= "hasAttach";
ZCS.constant.FLAG_PROP[ZCS.constant.FLAG_FLAGGED]			= "isFlagged";
ZCS.constant.FLAG_PROP[ZCS.constant.FLAG_FORWARDED]			= "isForwarded";
ZCS.constant.FLAG_PROP[ZCS.constant.FLAG_ISDRAFT] 			= "isDraft";
ZCS.constant.FLAG_PROP[ZCS.constant.FLAG_ISSENT]			= "isSent";
ZCS.constant.FLAG_PROP[ZCS.constant.FLAG_REPLIED]			= "isReplied";
ZCS.constant.FLAG_PROP[ZCS.constant.FLAG_UNREAD]			= "isUnread";

//ZCS.constant.PROP_FLAG = ZCS.constant.getBackMap(ZCS.constant.FLAG_PROP);

ZCS.constant.MSEC_PER_MINUTE = 60000;
ZCS.constant.MSEC_PER_HOUR = 60 * ZCS.constant.MSEC_PER_MINUTE;
ZCS.constant.MSEC_PER_DAY = 24 * ZCS.constant.MSEC_PER_HOUR;
