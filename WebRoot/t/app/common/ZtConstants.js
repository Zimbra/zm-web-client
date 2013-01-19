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

// shortcut to this class
ZCS.constant = ZCS.common.ZtConstants;

// URL portion that precedes a server API call
ZCS.constant.SERVICE_URL_BASE = '/service/soap/';

// Apps
ZCS.constant.APP_MAIL     = 'mail';
ZCS.constant.APP_CONTACTS = 'contacts';
ZCS.constant.ALL_APPS = [
	ZCS.constant.APP_MAIL,
	ZCS.constant.APP_CONTACTS
];

// Text for tab bar
ZCS.constant.TAB_TITLE = {};
ZCS.constant.TAB_TITLE[ZCS.constant.APP_MAIL]       = 'Mail';
ZCS.constant.TAB_TITLE[ZCS.constant.APP_CONTACTS]   = 'Contacts';

// Organizer type to show in overview
ZCS.constant.OVERVIEW_MODEL = {};
ZCS.constant.OVERVIEW_MODEL[ZCS.constant.APP_MAIL]       = 'ZCS.model.mail.ZtMailFolder';
ZCS.constant.OVERVIEW_MODEL[ZCS.constant.APP_CONTACTS]   = 'ZCS.model.contacts.ZtContactsFolder';

// Organizer type to show in overview
ZCS.constant.OVERVIEW_TITLE = {};
ZCS.constant.OVERVIEW_TITLE[ZCS.constant.APP_MAIL]       = 'Folders';
ZCS.constant.OVERVIEW_TITLE[ZCS.constant.APP_CONTACTS]   = 'Address Books';

// View (from JSON folder data) that determines which app a folder belongs to
ZCS.constant.FOLDER_VIEW = {};
ZCS.constant.FOLDER_VIEW[ZCS.constant.APP_MAIL]     = 'message';
ZCS.constant.FOLDER_VIEW[ZCS.constant.APP_CONTACTS] = 'contact';

// Icon for button that creates a new item
ZCS.constant.NEW_ITEM_ICON = {};
ZCS.constant.NEW_ITEM_ICON[ZCS.constant.APP_MAIL]       = 'compose';
ZCS.constant.NEW_ITEM_ICON[ZCS.constant.APP_CONTACTS]   = 'plus';

// Store that holds items for list view
ZCS.constant.STORE = {};
ZCS.constant.STORE[ZCS.constant.APP_MAIL]       = 'ZtConvStore';
ZCS.constant.STORE[ZCS.constant.APP_CONTACTS]   = 'ZtContactStore';

// Xtype of view that displays a single item from the list
ZCS.constant.ITEM_VIEW = {};
ZCS.constant.ITEM_VIEW[ZCS.constant.APP_MAIL]     = 'msglistview';
ZCS.constant.ITEM_VIEW[ZCS.constant.APP_CONTACTS] = 'contactview';

// Xtype of view that displays a single item from the list
ZCS.constant.ITEM_CLASS = {};
ZCS.constant.ITEM_CLASS[ZCS.constant.APP_MAIL]     = 'ZCS.view.mail.ZtMsgListView';
ZCS.constant.ITEM_CLASS[ZCS.constant.APP_CONTACTS] = 'ZCS.view.contacts.ZtContactPanel';

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

ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_INBOX]   = '_____a';
ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_SENT]    = '____a';
ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_DRAFTS]  = '___a';
ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_JUNK]    = '__a';

ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_CONTACTS]    = '___a';
ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_EMAILED]     = '__a';

// System folder names (used in search queries)
ZCS.constant.FOLDER_SYSTEM_NAME = {};
ZCS.constant.FOLDER_SYSTEM_NAME[ZCS.constant.ID_TRASH]   = 'trash';

ZCS.constant.FOLDER_SYSTEM_NAME[ZCS.constant.ID_INBOX]   = 'inbox';
ZCS.constant.FOLDER_SYSTEM_NAME[ZCS.constant.ID_SENT]    = 'sent';
ZCS.constant.FOLDER_SYSTEM_NAME[ZCS.constant.ID_DRAFTS]  = 'drafts';
ZCS.constant.FOLDER_SYSTEM_NAME[ZCS.constant.ID_JUNK]    = 'junk';

ZCS.constant.FOLDER_SYSTEM_NAME[ZCS.constant.ID_CONTACTS]    = 'contacts';
ZCS.constant.FOLDER_SYSTEM_NAME[ZCS.constant.ID_EMAILED]     = 'emailedContacts';

ZCS.constant.FOLDER_SYSTEM_ID = ZCS.constant.getBackMap(ZCS.constant.FOLDER_SYSTEM_NAME);

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

// Data types
ZCS.constant.TYPE_STRING    = 'string';
ZCS.constant.TYPE_NUMBER    = 'number';
ZCS.constant.TYPE_BOOLEAN   = 'boolean';

// Names of user settings (LDAP attribute names)
ZCS.constant.SETTING_ALIASES            = 'zimbraMailAlias';
ZCS.constant.SETTING_INITIAL_SEARCH     = 'zimbraPrefMailInitialSearch';
ZCS.constant.SETTING_SHOW_SEARCH        = 'zimbraPrefShowSearchString';

// Names of internal settings
ZCS.constant.SETTING_CUR_SEARCH         = 'currentSearch';

// List of all settings we care about
ZCS.constant.SETTINGS = [
	ZCS.constant.SETTING_ALIASES,
	ZCS.constant.SETTING_INITIAL_SEARCH,
	ZCS.constant.SETTING_SHOW_SEARCH,
	ZCS.constant.SETTING_CUR_SEARCH
];

// Setting type; defaults to string, so just note exceptions
ZCS.constant.SETTING_TYPE = {};
ZCS.constant.SETTING_TYPE[ZCS.constant.SETTING_SHOW_SEARCH] = ZCS.constant.TYPE_BOOLEAN;

// Forced setting values, which override user setting
ZCS.constant.SETTING_VALUE = {};
ZCS.constant.SETTING_VALUE[ZCS.constant.SETTING_SHOW_SEARCH] = 'false';

ZCS.constant.SETTING_DEFAULT = {};

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

// Date/time constants
ZCS.constant.MSEC_PER_MINUTE = 60000;
ZCS.constant.MSEC_PER_HOUR = 60 * ZCS.constant.MSEC_PER_MINUTE;
ZCS.constant.MSEC_PER_DAY = 24 * ZCS.constant.MSEC_PER_HOUR;

// How many senders to show for a conv in the conv list
ZCS.constant.NUM_CONV_SENDERS = 3;
