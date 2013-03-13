/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra, Inc.
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
 * This static class collects all the constants needed by ZCS in one place, rather than
 * partitioning them into the classes they're related to. We trade organization for
 * convenience, since the code will never have to worry about whether the defining class
 * has been loaded.
 *
 * Use of the shortcut ZCS.constant is recommended for defining and accessing these constants.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.common.ZtConstants', {

	singleton: true,

	alternateClassName: 'ZCS.constant',

	/**
	 * Returns a "reversed" map, with the keys and values switched.
	 *
	 * @param {Object}  map     hash map
	 * @return {Object} reversed map
	 * @private
	 */
	getBackMap: function(map) {
		var backMap = {}, key;
		for (key in map) {
			backMap[map[key]] = key;
		}
		return backMap;
	},

	/**
	 * Creates a list of the constants whose property name starts with the given prefix.
	 *
	 * @param {String}  prefix      prefix to look for
	 * @return {Array}  list of constants
	 * @private
	 */
	makeList: function(prefix) {
		var list = [];
		Ext.Object.each(ZCS.constant, function(prop) {
			if (prop.indexOf(prefix) === 0) {
				list.push(ZCS.constant[prop]);
			}
		});
		return list;
	}
});

// Default page size for data requests. Note this is in sync with the size
// of the initial inline search results.  If they are not in sync, there
// could be paging errors on initial search result load.
ZCS.constant.DEFAULT_PAGE_SIZE = 20;

// URL portion that precedes a server API call
ZCS.constant.SERVICE_URL_BASE = '/service/soap/';

// How often to check for notifications, in seconds
ZCS.constant.POLL_INTERVAL = 120;

// Apps
ZCS.constant.APP_MAIL     = 'mail';
ZCS.constant.APP_CONTACTS = 'contacts';

// Order of app tabs
ZCS.constant.APPS = [
	ZCS.constant.APP_MAIL,
	ZCS.constant.APP_CONTACTS
];

// Turn features on/off
ZCS.constant.ADD_ATTACHMENT = 'add_attachment';

ZCS.constant.IS_ENABLED = {};
ZCS.constant.IS_ENABLED[ZCS.constant.APP_CONTACTS]  = false;
ZCS.constant.IS_ENABLED[ZCS.constant.ADD_ATTACHMENT] = false;

// Text for tab bar
ZCS.constant.TAB_TITLE = {};
ZCS.constant.TAB_TITLE[ZCS.constant.APP_MAIL]       = ZtMsg.mail;
ZCS.constant.TAB_TITLE[ZCS.constant.APP_CONTACTS]   = ZtMsg.contacts;

// Title to show in overview
ZCS.constant.OVERVIEW_TITLE = {};
ZCS.constant.OVERVIEW_TITLE[ZCS.constant.APP_MAIL]       = ZtMsg.folders;
ZCS.constant.OVERVIEW_TITLE[ZCS.constant.APP_CONTACTS]   = ZtMsg.addrbooks;

// Icon for button that creates a new item
ZCS.constant.NEW_ITEM_ICON = {};
ZCS.constant.NEW_ITEM_ICON[ZCS.constant.APP_MAIL]       = 'compose';
ZCS.constant.NEW_ITEM_ICON[ZCS.constant.APP_CONTACTS]   = 'plus';

// Buttons in toolbar at top of item panel
ZCS.constant.ITEM_BUTTONS = {};
ZCS.constant.ITEM_BUTTONS[ZCS.constant.APP_MAIL]        = [
	{ icon: 'reply',        event: 'reply' },
	{ icon: 'replytoall',   event: 'replyAll' },
	{ icon: 'trash',        event: 'delete' },
	{ icon: 'arrow_down',   event: 'showMenu' }
];
ZCS.constant.ITEM_BUTTONS[ZCS.constant.APP_CONTACTS]    = [
	{ icon: 'trash',        event: 'delete' },
	{ icon: 'arrow_down',   event: 'showMenu' }
];

// Display states for a message view header
ZCS.constant.HDR_COLLAPSED  = 'collapsed';
ZCS.constant.HDR_EXPANDED   = 'expanded';
ZCS.constant.HDR_DETAILED   = 'detailed';

// Item types as known by server
ZCS.constant.ITEM_CONVERSATION      = 'conversation';
ZCS.constant.ITEM_MESSAGE           = 'message';
ZCS.constant.ITEM_CONTACT           = 'contact';
ZCS.constant.ADDRESS_AUTOCOMPLETE   = 'match';

// App to which each item type belongs
ZCS.constant.APP_FOR_TYPE = {};
ZCS.constant.APP_FOR_TYPE[ZCS.constant.ITEM_CONVERSATION]  = ZCS.constant.APP_MAIL;
ZCS.constant.APP_FOR_TYPE[ZCS.constant.ITEM_MESSAGE]       = ZCS.constant.APP_MAIL;
ZCS.constant.APP_FOR_TYPE[ZCS.constant.ITEM_CONTACT]       = ZCS.constant.APP_CONTACTS;

// Model class for each item type
ZCS.constant.CLASS_FOR_TYPE = {};
ZCS.constant.CLASS_FOR_TYPE[ZCS.constant.ITEM_CONVERSATION]    = 'ZCS.model.mail.ZtConv';
ZCS.constant.CLASS_FOR_TYPE[ZCS.constant.ITEM_MESSAGE]         = 'ZCS.model.mail.ZtMailMsg';
ZCS.constant.CLASS_FOR_TYPE[ZCS.constant.ITEM_CONTACT]         = 'ZCS.model.contacts.ZtContact';
ZCS.constant.CLASS_FOR_TYPE[ZCS.constant.ADDRESS_AUTOCOMPLETE] = 'ZCS.model.address.ZtAutoComplete';

// Item type for model class
ZCS.constant.TYPE_FOR_CLASS = ZCS.constant.getBackMap(ZCS.constant.CLASS_FOR_TYPE);

// JSON node names for items
ZCS.constant.NODE_CONVERSATION  = 'c';
ZCS.constant.NODE_MESSAGE       = 'm';
ZCS.constant.NODE_CONTACT       = 'cn';
ZCS.constant.NODE_MATCH         = 'match';

// Order in which to handle notifications
ZCS.constant.NODES = [
	ZCS.constant.NODE_CONVERSATION,
	ZCS.constant.NODE_MESSAGE,
	ZCS.constant.NODE_CONTACT
];

// JSON node name for each item type
ZCS.constant.ITEM_NODE = {};
ZCS.constant.ITEM_NODE[ZCS.constant.ITEM_CONVERSATION] = ZCS.constant.NODE_CONVERSATION;
ZCS.constant.ITEM_NODE[ZCS.constant.ITEM_MESSAGE]      = ZCS.constant.NODE_MESSAGE;
ZCS.constant.ITEM_NODE[ZCS.constant.ITEM_CONTACT]      = ZCS.constant.NODE_CONTACT;
ZCS.constant.ITEM_NODE[ZCS.constant.ADDRESS_AUTOCOMPLETE]      = ZCS.constant.NODE_MATCH;

// Item type based on JSON node name
ZCS.constant.NODE_ITEM = ZCS.constant.getBackMap(ZCS.constant.ITEM_NODE);

// Controller that handles create for each item type
ZCS.constant.LIST_CONTROLLER = {};
ZCS.constant.LIST_CONTROLLER[ZCS.constant.ITEM_CONVERSATION]    = 'ZCS.controller.mail.ZtConvListController';
ZCS.constant.LIST_CONTROLLER[ZCS.constant.ITEM_MESSAGE]         = 'ZCS.controller.mail.ZtConvController';
ZCS.constant.LIST_CONTROLLER[ZCS.constant.ITEM_CONTACT]         = 'ZCS.controller.contacts.ZtContactListController';

// Store that holds items for list view
ZCS.constant.STORE = {};
ZCS.constant.STORE[ZCS.constant.APP_MAIL]       = 'ZtConvStore';
ZCS.constant.STORE[ZCS.constant.APP_CONTACTS]   = 'ZtContactStore';

// Organizer types
ZCS.constant.ORG_FOLDER         = 'folder';
ZCS.constant.ORG_MAIL_FOLDER    = 'mailFolder';
ZCS.constant.ORG_ADDRESS_BOOK   = 'addressBook';
ZCS.constant.ORG_SAVED_SEARCH   = 'search';
ZCS.constant.ORG_TAG            = 'tag';

// View (from JSON folder data) that determines which app a folder belongs to
ZCS.constant.FOLDER_VIEW = {};
ZCS.constant.FOLDER_VIEW[ZCS.constant.APP_MAIL]     = 'message';
ZCS.constant.FOLDER_VIEW[ZCS.constant.APP_CONTACTS] = 'contact';

// Folder type by app
ZCS.constant.FOLDER_TYPE = {};
ZCS.constant.FOLDER_TYPE[ZCS.constant.APP_MAIL]     = ZCS.constant.ORG_MAIL_FOLDER;
ZCS.constant.FOLDER_TYPE[ZCS.constant.APP_CONTACTS] = ZCS.constant.ORG_ADDRESS_BOOK;

// Organizer names (appear in overview groups)
ZCS.constant.ORG_NAME = {};
ZCS.constant.ORG_NAME[ZCS.constant.ORG_MAIL_FOLDER]   = ZtMsg.folders;
ZCS.constant.ORG_NAME[ZCS.constant.ORG_ADDRESS_BOOK]  = ZtMsg.addressBooks;
ZCS.constant.ORG_NAME[ZCS.constant.ORG_SAVED_SEARCH]  = ZtMsg.searches;
ZCS.constant.ORG_NAME[ZCS.constant.ORG_TAG]           = ZtMsg.tags;

// Organizer nodes (in JSON within a refresh block from the server)
ZCS.constant.ORG_NODE = {};
ZCS.constant.ORG_NODE[ZCS.constant.ORG_FOLDER]        = 'folder';
ZCS.constant.ORG_NODE[ZCS.constant.ORG_SAVED_SEARCH]  = 'search';
ZCS.constant.ORG_NODE[ZCS.constant.ORG_TAG]           = 'tag';

// Order in which organizers should appear grouped in overview
ZCS.constant.ORG_SORT_VALUE = {};
ZCS.constant.ORG_SORT_VALUE[ZCS.constant.ORG_MAIL_FOLDER]   = 1;
ZCS.constant.ORG_SORT_VALUE[ZCS.constant.ORG_ADDRESS_BOOK]  = 1;
ZCS.constant.ORG_SORT_VALUE[ZCS.constant.ORG_SAVED_SEARCH]  = 2;
ZCS.constant.ORG_SORT_VALUE[ZCS.constant.ORG_TAG]           = 3;

// System folder IDs
ZCS.constant.ID_ROOT      = '1';
ZCS.constant.ID_INBOX     = '2';
ZCS.constant.ID_TRASH     = '3';
ZCS.constant.ID_JUNK      = '4';
ZCS.constant.ID_SENT      = '5';
ZCS.constant.ID_DRAFTS    = '6';
ZCS.constant.ID_CONTACTS  = '7';
ZCS.constant.ID_EMAILED   = '13';
ZCS.constant.ID_CHATS     = '14';

// An ID less than this indicates a system folder
ZCS.constant.MAX_SYSTEM_ID = 255;

// When showing a conv, don't show messages in these folders
ZCS.constant.CONV_HIDE = {};
ZCS.constant.CONV_HIDE[ZCS.constant.ID_TRASH]   = true;
ZCS.constant.CONV_HIDE[ZCS.constant.ID_JUNK]    = true;

// System folder sort order
ZCS.constant.FOLDER_SORT_VALUE = {};

ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_TRASH]   = 5;

ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_INBOX]   = 1;
ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_SENT]    = 2;
ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_DRAFTS]  = 3;
ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_JUNK]    = 4;

ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_CONTACTS]    = 1;
ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_EMAILED]     = 2;

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

// Recipients
ZCS.constant.RECIP_TYPES = [
	ZCS.constant.TO,
	ZCS.constant.CC,
	ZCS.constant.BCC
];

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
ZCS.constant.TYPE_ARRAY     = 'array';

// Names of user settings (LDAP attribute names)
ZCS.constant.SETTING_ALIASES            = 'zimbraMailAlias';
ZCS.constant.SETTING_INITIAL_SEARCH     = 'zimbraPrefMailInitialSearch';
ZCS.constant.SETTING_SHOW_SEARCH        = 'zimbraPrefShowSearchString';
ZCS.constant.SETTING_LOCALE             = 'zimbraPrefLocale';
ZCS.constant.SETTING_TIMEZONE           = 'zimbraPrefTimeZoneId';
ZCS.constant.SETTING_MARK_READ          = 'zimbraPrefMarkMsgRead';  // -1 = never, 0 = now, [int] = delay in seconds
ZCS.constant.SETTING_REPLY_INCLUDE      = 'zimbraPrefReplyIncludeOriginalText';
ZCS.constant.SETTING_FORWARD_INCLUDE    = 'zimbraPrefForwardIncludeOriginalText';
ZCS.constant.SETTING_REPLY_PREFIX       = 'zimbraPrefForwardReplyPrefixChar';
ZCS.constant.SETTING_MAIL_ENABLED       = 'zimbraFeatureMailEnabled';
ZCS.constant.SETTING_CONTACTS_ENABLED   = 'zimbraFeatureContactsEnabled';
ZCS.constant.SETTING_DISPLAY_IMAGES     = 'zimbraPrefDisplayExternalImages';
ZCS.constant.SETTING_TRUSTED_SENDERS    = 'zimbraPrefMailTrustedSenderList';
ZCS.constant.SETTING_FROM_ADDRESS       = 'zimbraPrefFromAddress';
ZCS.constant.SETTING_FROM_NAME          = 'zimbraPrefFromDisplay';

// Names of internal settings
ZCS.constant.SETTING_CUR_SEARCH                 = 'CUR_SEARCH';
ZCS.constant.SETTING_CUR_SEARCH_ID              = 'CUR_SEARCH_ID';
ZCS.constant.SETTING_REPLY_INCLUDE_WHAT         = 'REPLY_INCLUDE_WHAT';
ZCS.constant.SETTING_REPLY_USE_PREFIX           = 'REPLY_USE_PREFIX';
ZCS.constant.SETTING_REPLY_INCLUDE_HEADERS      = 'REPLY_INCLUDE_HEADERS';
ZCS.constant.SETTING_FORWARD_INCLUDE_WHAT       = 'FORWARD_INCLUDE_WHAT';
ZCS.constant.SETTING_FORWARD_USE_PREFIX         = 'FORWARD_USE_PREFIX';
ZCS.constant.SETTING_FORWARD_INCLUDE_HEADERS    = 'FORWARD_INCLUDE_HEADERS';
ZCS.constant.SETTING_REST_URL                   = 'REST_URL';

ZCS.constant.SETTINGS = ZCS.constant.makeList('SETTING_');

// Setting type; defaults to string, so just note exceptions
ZCS.constant.SETTING_TYPE = {};
ZCS.constant.SETTING_TYPE[ZCS.constant.SETTING_SHOW_SEARCH]     = ZCS.constant.TYPE_BOOLEAN;
ZCS.constant.SETTING_TYPE[ZCS.constant.SETTING_DISPLAY_IMAGES]  = ZCS.constant.TYPE_BOOLEAN;
ZCS.constant.SETTING_TYPE[ZCS.constant.SETTING_TRUSTED_SENDERS] = ZCS.constant.TYPE_ARRAY;

// Forced setting values, which override user setting
ZCS.constant.SETTING_VALUE = {};
ZCS.constant.SETTING_VALUE[ZCS.constant.SETTING_SHOW_SEARCH] = 'false';

// Default values for settings
ZCS.constant.SETTING_DEFAULT = {};
ZCS.constant.SETTING_DEFAULT[ZCS.constant.SETTING_LOCALE] = 'en_US';

// Setting that tells us if an app is enabled
ZCS.constant.APP_SETTING = {};
ZCS.constant.APP_SETTING[ZCS.constant.APP_MAIL]     = ZCS.constant.SETTING_MAIL_ENABLED;
ZCS.constant.APP_SETTING[ZCS.constant.APP_CONTACTS] = ZCS.constant.SETTING_CONTACTS_ENABLED;

// Values for what is included on reply/forward - server bundles several options into a single value
ZCS.constant.INC_NONE				= "includeNone";
ZCS.constant.INC_ATTACH			    = "includeAsAttachment";
ZCS.constant.INC_BODY				= "includeBody";				// deprecated - same as includeBodyAndHeaders
ZCS.constant.INC_BODY_ONLY			= "includeBodyOnly";
ZCS.constant.INC_BODY_PRE			= "includeBodyWithPrefix";
ZCS.constant.INC_BODY_HDR			= "includeBodyAndHeaders";
ZCS.constant.INC_BODY_PRE_HDR		= "includeBodyAndHeadersWithPrefix";
ZCS.constant.INC_SMART				= "includeSmart";
ZCS.constant.INC_SMART_PRE			= "includeSmartWithPrefix";
ZCS.constant.INC_SMART_HDR			= "includeSmartAndHeaders";
ZCS.constant.INC_SMART_PRE_HDR		= "includeSmartAndHeadersWithPrefix";

// Map to translate setting value to values for three related settings
ZCS.constant.INC_MAP = {};
ZCS.constant.INC_MAP[ZCS.constant.INC_NONE]			    = [ZCS.constant.INC_NONE, false, false];
ZCS.constant.INC_MAP[ZCS.constant.INC_ATTACH]			= [ZCS.constant.INC_ATTACH, false, false];
ZCS.constant.INC_MAP[ZCS.constant.INC_BODY]			    = [ZCS.constant.INC_BODY, false, true];
ZCS.constant.INC_MAP[ZCS.constant.INC_BODY_ONLY]		= [ZCS.constant.INC_BODY, false, false];
ZCS.constant.INC_MAP[ZCS.constant.INC_BODY_PRE]		    = [ZCS.constant.INC_BODY, true, false];
ZCS.constant.INC_MAP[ZCS.constant.INC_BODY_HDR]		    = [ZCS.constant.INC_BODY, false, true];
ZCS.constant.INC_MAP[ZCS.constant.INC_BODY_PRE_HDR] 	= [ZCS.constant.INC_BODY, true, true];
ZCS.constant.INC_MAP[ZCS.constant.INC_SMART]			= [ZCS.constant.INC_SMART, false, false];
ZCS.constant.INC_MAP[ZCS.constant.INC_SMART_PRE]		= [ZCS.constant.INC_SMART, true, false];
ZCS.constant.INC_MAP[ZCS.constant.INC_SMART_HDR]		= [ZCS.constant.INC_SMART, false, true];
ZCS.constant.INC_MAP[ZCS.constant.INC_SMART_PRE_HDR]	= [ZCS.constant.INC_SMART, true, true];

// Operations (generally tied to dropdown menu items)
ZCS.constant.OP_COMPOSE     = 'COMPOSE';
ZCS.constant.OP_DELETE      = 'DELETE';
ZCS.constant.OP_FORWARD     = 'FORWARD';
ZCS.constant.OP_LOGOUT      = 'LOGOUT';
ZCS.constant.OP_MARK_READ   = 'MARK_READ';
ZCS.constant.OP_REPLY       = 'REPLY';
ZCS.constant.OP_REPLY_ALL   = 'REPLY_ALL';
ZCS.constant.OP_SPAM        = 'SPAM';
ZCS.constant.OP_MOVE        = 'MOVE';
ZCS.constant.OP_FLAG        = 'FLAG';
ZCS.constant.OP_TAG         = 'TAG';

// Item flags
ZCS.constant.FLAG_ATTACH			= 'a';
ZCS.constant.FLAG_FLAGGED			= 'f';
ZCS.constant.FLAG_FORWARDED			= 'w';
ZCS.constant.FLAG_ISDRAFT 			= 'd';
ZCS.constant.FLAG_ISSENT			= 's';
ZCS.constant.FLAG_REPLIED			= 'r';
ZCS.constant.FLAG_UNREAD			= 'u';
ZCS.constant.FLAG_INVITE			= 'v';

ZCS.constant.ALL_FLAGS = ZCS.constant.makeList('FLAG_');

// Map flag to item property
ZCS.constant.FLAG_PROP = {};
ZCS.constant.FLAG_PROP[ZCS.constant.FLAG_ATTACH]			= 'hasAttachment';
ZCS.constant.FLAG_PROP[ZCS.constant.FLAG_FLAGGED]			= 'isFlagged';
ZCS.constant.FLAG_PROP[ZCS.constant.FLAG_FORWARDED]			= 'isForwarded';
ZCS.constant.FLAG_PROP[ZCS.constant.FLAG_ISDRAFT] 			= 'isDraft';
ZCS.constant.FLAG_PROP[ZCS.constant.FLAG_ISSENT]			= 'isSent';
ZCS.constant.FLAG_PROP[ZCS.constant.FLAG_REPLIED]			= 'isReplied';
ZCS.constant.FLAG_PROP[ZCS.constant.FLAG_UNREAD]			= 'isUnread';
ZCS.constant.FLAG_PROP[ZCS.constant.FLAG_INVITE]			= 'isInvite';

//ZCS.constant.PROP_FLAG = ZCS.constant.getBackMap(ZCS.constant.FLAG_PROP);

// Date/time constants
ZCS.constant.MSEC_PER_MINUTE = 60000;
ZCS.constant.MSEC_PER_HOUR = 60 * ZCS.constant.MSEC_PER_MINUTE;
ZCS.constant.MSEC_PER_DAY = 24 * ZCS.constant.MSEC_PER_HOUR;

// How many senders to show for a conv in the conv list
ZCS.constant.NUM_CONV_SENDERS = 3;

// Extra mail headers to fetch for a SOAP request
ZCS.constant.ADDITIONAL_MAIL_HEADERS = [
	{ n: 'List-ID' },
	{ n: 'X-Zimbra-DL' },
	{ n: 'IN-REPLY-TO' }
];

// Useful regexes
ZCS.constant.REGEX_NON_WHITESPACE = /\S+/;
ZCS.constant.REGEX_SPLIT = /\r\n|\r|\n/;
ZCS.constant.REGEX_SUBJ_PREFIX = new RegExp('^\\s*(Re|Fw|Fwd|' + ZtMsg.re + '|' + ZtMsg.fwd + '|' + ZtMsg.fw + '):' + '\\s*', 'i');
ZCS.constant.REGEX_SPACE_WORD = new RegExp('\\s*\\S+', 'g');
ZCS.constant.REGEX_MSG_SEP = new RegExp('^\\s*--+\\s*(' + ZtMsg.originalMessage + '|' + ZtMsg.forwardedMessage + ')\\s*--+', 'i');
ZCS.constant.REGEX_SIG = /^(- ?-+)|(__+)\r?$/;
ZCS.constant.REGEX_HDR = /^\s*\w+:/;
ZCS.constant.REGEX_COLON = /\S+:$/;
ZCS.constant.REGEX_IMG_SRC_CID = /<img([^>]*)\ssrc=["']cid:/gi;
ZCS.constant.REGEX_URL = /(((https?):\/\/)|(www\.[\w\.\_\-]+))[^\s\xA0\(\)\<\>\[\]\{\}\'\"]*/i;

// URL paths
ZCS.constant.PATH_MSG_FETCH = '/service/home/~/';
ZCS.constant.IMAGE_URL_BASE = '/img/zimbra/Img';

// Default height of IFRAME element
ZCS.constant.DEFAULT_IFRAME_HEIGHT = 150;

// Quoting original content when replying
ZCS.constant.HTML_QUOTE_COLOR			= '#1010FF';
ZCS.constant.HTML_QUOTE_STYLE			= 'color:#000;font-weight:normal;font-style:normal;text-decoration:none;font-family:Helvetica,Arial,sans-serif;font-size:12pt;';
ZCS.constant.HTML_QUOTE_PREFIX_PRE		= '<blockquote style="border-left:2px solid ' + ZCS.constant.HTML_QUOTE_COLOR + ';margin-left:5px;padding-left:5px;' + ZCS.constant.HTML_QUOTE_STYLE + '">';
ZCS.constant.HTML_QUOTE_PREFIX_POST     = '</blockquote>';
ZCS.constant.HTML_QUOTE_NONPREFIX_PRE	= '<div style="' + ZCS.constant.HTML_QUOTE_STYLE + '">';
ZCS.constant.HTML_QUOTE_NONPREFIX_POST	= '</div><br/>';

// Wrapping text
ZCS.constant.WRAP_LENGTH				= 80;
ZCS.constant.HDR_WRAP_LENGTH			= 120;

// Email header IDs
ZCS.constant.HDR_FROM		= ZCS.constant.FROM;
ZCS.constant.HDR_TO		    = ZCS.constant.TO;
ZCS.constant.HDR_CC		    = ZCS.constant.CC;
ZCS.constant.HDR_DATE		= 'DATE';
ZCS.constant.HDR_SUBJECT	= 'SUBJECT';

// Which headers to include when quoting original message
ZCS.constant.QUOTED_HDRS = [
	ZCS.constant.HDR_FROM,
	ZCS.constant.HDR_TO,
	ZCS.constant.HDR_CC,
	ZCS.constant.HDR_DATE,
	ZCS.constant.HDR_SUBJECT
];

// String value of header, as in "From:'
ZCS.constant.HDR_KEY = {};
ZCS.constant.HDR_KEY[ZCS.constant.HDR_FROM]		= ZtMsg.fromHdr;
ZCS.constant.HDR_KEY[ZCS.constant.HDR_TO]		= ZtMsg.toHdr;
ZCS.constant.HDR_KEY[ZCS.constant.HDR_CC]		= ZtMsg.ccHdr;
ZCS.constant.HDR_KEY[ZCS.constant.HDR_DATE]		= ZtMsg.sentHdr;
ZCS.constant.HDR_KEY[ZCS.constant.HDR_SUBJECT]	= ZtMsg.subjectHdr;

// Invite-related constants
ZCS.constant.INVITE_NOTES_SEPARATOR = '*~*~*~*~*~*~*~*~*~*';

// Invite response actions
ZCS.constant.OP_ACCEPT      = 'ACCEPT';
ZCS.constant.OP_TENTATIVE   = 'TENTATIVE';
ZCS.constant.OP_DECLINE     = 'DECLINE';

// Participation status (there are others we can add if needed)
ZCS.constant.PSTATUS_ACCEPTED   = 'AC';
ZCS.constant.PSTATUS_TENTATIVE  = 'TE';
ZCS.constant.PSTATUS_DECLINED   = 'DE';

// Text describing participation status
ZCS.constant.PSTATUS_TEXT = {};
ZCS.constant.PSTATUS_TEXT[ZCS.constant.PSTATUS_ACCEPTED]    = ZtMsg.inviteAccepted;
ZCS.constant.PSTATUS_TEXT[ZCS.constant.PSTATUS_TENTATIVE]   = ZtMsg.inviteAcceptedTentatively;
ZCS.constant.PSTATUS_TEXT[ZCS.constant.PSTATUS_DECLINED]    = ZtMsg.inviteDeclined;

// Canned invite reply text based on response action
ZCS.constant.INVITE_REPLY_TEXT = {};
ZCS.constant.INVITE_REPLY_TEXT[ZCS.constant.OP_ACCEPT]      = ZtMsg.invReplyAcceptText;
ZCS.constant.INVITE_REPLY_TEXT[ZCS.constant.OP_TENTATIVE]   = ZtMsg.invReplyTentativeText;
ZCS.constant.INVITE_REPLY_TEXT[ZCS.constant.OP_DECLINE]     = ZtMsg.invReplyDeclineText;

// Invite attendee (calendar user) types
ZCS.constant.CUTYPE_INDIVIDUAL	= 'IND';
ZCS.constant.CUTYPE_GROUP		= 'GRO';
ZCS.constant.CUTYPE_RESOURCE	= 'RES';
ZCS.constant.CUTYPE_ROOM		= 'ROO';
ZCS.constant.CUTYPE_UNKNOWN		= 'UNK';

// Attendee roles
ZCS.constant.ROLE_CHAIR             = 'OPT';
ZCS.constant.ROLE_REQUIRED          = 'REQ';
ZCS.constant.ROLE_OPTIONAL          = 'OPT';
ZCS.constant.ROLE_NON_PARTICIPANT   = 'NON';

// Types for IDs we make up
ZCS.constant.IDTYPE_INVITE_ACTION   = 'invite action';
ZCS.constant.IDTYPE_QUOTED_LINK     = 'quoted link';
ZCS.constant.IDTYPE_ATTACHMENT      = 'attachment';
