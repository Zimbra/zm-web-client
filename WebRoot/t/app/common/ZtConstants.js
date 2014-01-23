/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
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

// Max amount of message content to get, in K
ZCS.constant.MAX_MESSAGE_SIZE = 100;

// Character used to join ID parts; should not be ':' or '-' since those are used in ZCS IDs
ZCS.constant.ID_JOIN = '_';

// Apps (these should be the same names that are used in source paths, eg ZCS.model.mail.ZtConv)
ZCS.constant.APP_MAIL     = 'mail';
ZCS.constant.APP_CONTACTS = 'contacts';
ZCS.constant.APP_CALENDAR = 'calendar';

// App names
ZCS.constant.APP_NAME = {};
ZCS.constant.APP_NAME[ZCS.constant.APP_MAIL]        = ZtMsg.appMail;
ZCS.constant.APP_NAME[ZCS.constant.APP_CONTACTS]    = ZtMsg.appContacts;
ZCS.constant.APP_NAME[ZCS.constant.APP_CALENDAR]    = ZtMsg.appCalendar;

// Order of app tabs
ZCS.constant.APPS = [
	ZCS.constant.APP_MAIL,
	ZCS.constant.APP_CONTACTS,
    ZCS.constant.APP_CALENDAR
];
ZCS.constant.IS_APP = ZCS.util.arrayAsLookupHash(ZCS.constant.APPS);

// Apps here support editing of their overviews (add, modify, delete folders)
ZCS.constant.EDITABLE_OVERVIEW_APPS = [
    ZCS.constant.APP_MAIL,
	ZCS.constant.APP_CONTACTS
];

// Turn features on/off
ZCS.constant.FEATURE_ADD_ATTACHMENT = 'add_attachment'; // attach file when composing
ZCS.constant.FEATURE_QUICK_REPLY    = 'quick_reply';    // quick reply area for conv panel
ZCS.constant.FEATURE_FIND_OBJECTS   = 'find_objects';   // look for URLs and email addrs in msg body, make them actionable

// Global way to turn features on/off, regardless of user settings
ZCS.constant.IS_ENABLED = {};
ZCS.constant.IS_ENABLED[ZCS.constant.APP_MAIL]                  = true;
ZCS.constant.IS_ENABLED[ZCS.constant.APP_CONTACTS]              = true;
ZCS.constant.IS_ENABLED[ZCS.constant.APP_CALENDAR]              = true;
ZCS.constant.IS_ENABLED[ZCS.constant.FEATURE_ADD_ATTACHMENT]    = true;
ZCS.constant.IS_ENABLED[ZCS.constant.FEATURE_QUICK_REPLY]       = true;
ZCS.constant.IS_ENABLED[ZCS.constant.FEATURE_FIND_OBJECTS]      = true;

// Text to show in overview toolbar if we're showing search results (not a folder, saved search, or tag)
ZCS.constant.DEFAULT_OVERVIEW_TITLE = ZtMsg.searchResults;

// Title to show in overview
ZCS.constant.OVERVIEW_TITLE = {};
ZCS.constant.OVERVIEW_TITLE[ZCS.constant.APP_MAIL]       = ZtMsg.folders;
ZCS.constant.OVERVIEW_TITLE[ZCS.constant.APP_CONTACTS]   = ZtMsg.addrbooks;
ZCS.constant.OVERVIEW_TITLE[ZCS.constant.APP_CALENDAR]   = ZtMsg.calendar;

// Icon for button that creates a new item
ZCS.constant.NEW_ITEM_ICON = {};
ZCS.constant.NEW_ITEM_ICON[ZCS.constant.APP_MAIL]       = 'compose';
ZCS.constant.NEW_ITEM_ICON[ZCS.constant.APP_CONTACTS]   = 'add';
ZCS.constant.NEW_ITEM_ICON[ZCS.constant.APP_CALENDAR]   = 'add';

// Buttons for a cancel shield ("Save changes?")
ZCS.constant.CANCEL_SHIELD_BUTTONS = [
	{ text: ZtMsg.yes,    itemId: 'yes',    ui: 'neutral' },
	{ text: ZtMsg.no,     itemId: 'no',     ui: 'neutral' },
	{ text: ZtMsg.cancel, itemId: 'cancel', ui: 'neutral' }
];

// popup menus
ZCS.constant.MENU_CONV      = 'convActions';
ZCS.constant.MENU_CONV_REPLY= 'convReplyActions';
ZCS.constant.MENU_MSG       = 'msgActions';
ZCS.constant.MENU_MSG_REPLY = 'msgReplyActions';
ZCS.constant.MENU_TAG       = 'tagActions';
ZCS.constant.MENU_ADDRESS   = 'addressActions';
ZCS.constant.MENU_CONTACT   = 'contactActions';
ZCS.constant.MENU_ORIG_ATT  = 'originalAttachment';
ZCS.constant.MENU_RECIPIENT = 'recipientActions';

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
ZCS.constant.OP_REMOVE_TAG  = 'REMOVE_TAG';
ZCS.constant.OP_REMOVE_ATT  = 'REMOVE_ATT';
ZCS.constant.OP_ADD_CONTACT = 'ADD_CONTACT';
ZCS.constant.OP_EDIT        = 'EDIT';
ZCS.constant.OP_MENU        = 'MENU';
ZCS.constant.OP_SEARCH      = 'SEARCH';

// Buttons in toolbar at top of item panel
ZCS.constant.ITEM_BUTTONS = {};
ZCS.constant.ITEM_BUTTONS[ZCS.constant.APP_MAIL]        = [
	{ op: ZCS.constant.OP_EDIT,         icon: 'edit',         event: 'edit',        hidden: true },
    { op: ZCS.constant.OP_REPLY,        icon: 'reply',        event: 'showMenu',    menuName: ZCS.constant.MENU_CONV_REPLY },
	{ op: ZCS.constant.OP_DELETE,       icon: 'trash',        event: 'delete' },
	{ op: ZCS.constant.OP_MENU,         icon: 'arrow_down',   event: 'showMenu',    menuName: ZCS.constant.MENU_CONV }
];
ZCS.constant.ITEM_BUTTONS[ZCS.constant.APP_CONTACTS]    = [
    { op: ZCS.constant.OP_EDIT,     icon: 'edit',       event: 'edit' },
	{ op: ZCS.constant.OP_MENU,     icon: 'arrow_down', event: 'showMenu', menuName: ZCS.constant.MENU_CONTACT }
];

// Display states for a message view header
ZCS.constant.HDR_COLLAPSED  = 'collapsed';
ZCS.constant.HDR_EXPANDED   = 'expanded';
ZCS.constant.HDR_DETAILED   = 'detailed';

// Types of actionable objects that can appear in msg header or body
ZCS.constant.OBJ_ADDRESS    = 'address';
ZCS.constant.OBJ_ATTACHMENT = 'attachment';
ZCS.constant.OBJ_INVITE     = 'invite'; // accept/tentative/decline
ZCS.constant.OBJ_TAG        = 'tag';
ZCS.constant.OBJ_QUOTED     = 'quoted';
ZCS.constant.OBJ_TRUNCATED  = 'truncated';

// Item types (server JSON)
ZCS.constant.ITEM_CONVERSATION      = 'conversation';
ZCS.constant.ITEM_MESSAGE           = 'message';
ZCS.constant.ITEM_CONTACT           = 'contact';
ZCS.constant.ITEM_APPOINTMENT       = 'appointment';
ZCS.constant.ITEM_CALENDAR          = 'calendar';   // TODO: organizer, not item
ZCS.constant.ITEM_MATCH             = 'match';      // autocomplete response JSON

// Contact types
ZCS.constant.CONTACT_PERSON     = 'person';
ZCS.constant.CONTACT_GROUP      = 'group';
ZCS.constant.CONTACT_DL         = 'distributionList';

// JSON node names for items
ZCS.constant.NODE_CONVERSATION  = 'c';
ZCS.constant.NODE_MESSAGE       = 'm';
ZCS.constant.NODE_CONTACT       = 'cn';
ZCS.constant.NODE_CALENDAR      = 'appt';
ZCS.constant.NODE_MATCH         = 'match';
ZCS.constant.NODE_DL            = 'dl';
ZCS.constant.NODE_DL_MEMBER     = 'dlm';

// Organizer types (same as server JSON)
ZCS.constant.ORG_FOLDER         = 'folder';
ZCS.constant.ORG_SEARCH         = 'search';
ZCS.constant.ORG_TAG            = 'tag';
ZCS.constant.ORG_MOUNTPOINT     = 'link';

// Folder sub-types
ZCS.constant.ORG_MAIL_FOLDER        = 'mailFolder';
ZCS.constant.ORG_ADDRESS_BOOK       = 'addressBook';
ZCS.constant.ORG_CALENDAR           = 'calendar';

// Organizer list types
ZCS.constant.ORG_LIST_OVERVIEW      = 'overview';
ZCS.constant.ORG_LIST_ASSIGNMENT    = 'assignment';
ZCS.constant.ORG_LIST_SELECTOR      = 'selector';

// App to which each item type belongs
ZCS.constant.APP_FOR_TYPE = {};
ZCS.constant.APP_FOR_TYPE[ZCS.constant.ITEM_CONVERSATION]  = ZCS.constant.APP_MAIL;
ZCS.constant.APP_FOR_TYPE[ZCS.constant.ITEM_MESSAGE]       = ZCS.constant.APP_MAIL;
ZCS.constant.APP_FOR_TYPE[ZCS.constant.ITEM_CONTACT]       = ZCS.constant.APP_CONTACTS;
ZCS.constant.APP_FOR_TYPE[ZCS.constant.ITEM_CALENDAR]      = ZCS.constant.APP_CALENDAR;

// Model class for each item type
ZCS.constant.CLASS_FOR_TYPE = {};
ZCS.constant.CLASS_FOR_TYPE[ZCS.constant.ITEM_CONVERSATION] = 'ZCS.model.mail.ZtConv';
ZCS.constant.CLASS_FOR_TYPE[ZCS.constant.ITEM_MESSAGE]      = 'ZCS.model.mail.ZtMailMsg';
ZCS.constant.CLASS_FOR_TYPE[ZCS.constant.ITEM_CONTACT]      = 'ZCS.model.contacts.ZtContact';
ZCS.constant.CLASS_FOR_TYPE[ZCS.constant.ITEM_MATCH]        = 'ZCS.model.address.ZtAutoComplete';
ZCS.constant.CLASS_FOR_TYPE[ZCS.constant.ITEM_CALENDAR]     = 'ZCS.model.calendar.ZtCalendar';

ZCS.constant.ORG_NODE_FIELD_HASH = ZCS.util.arrayAsLookupHash([
	'name', 'absFolderPath', 'color', 'rgb', 'l', 'n', 'u', 'url', 'query', 'types'
]);

// Organizer name constraints
ZCS.constant.ORG_NAME_MAX_LENGTH = 128;
// Following chars invalid in organizer names: " : / [anything less than " "]
ZCS.constant.ORG_NAME_REGEX = /^[^\\x00-\\x1F\\x7F:\\/\\\"]+$/;

// Item type for model class
ZCS.constant.TYPE_FOR_CLASS = ZCS.util.getBackMap(ZCS.constant.CLASS_FOR_TYPE);

// Order in which to handle notifications
ZCS.constant.NODES = [
	ZCS.constant.NODE_CONVERSATION,
	ZCS.constant.NODE_MESSAGE,
	ZCS.constant.NODE_CONTACT,
	ZCS.constant.ORG_FOLDER,
	ZCS.constant.ORG_SEARCH,
	ZCS.constant.ORG_TAG,
	ZCS.constant.ORG_MOUNTPOINT
];

// Notification types
ZCS.constant.NOTIFY_DELETE  = 'Delete';
ZCS.constant.NOTIFY_CREATE  = 'Create';
ZCS.constant.NOTIFY_CHANGE  = 'Change';

// JSON node name for each item/org type
ZCS.constant.ITEM_NODE = {};
ZCS.constant.ITEM_NODE[ZCS.constant.ITEM_CONVERSATION]      = ZCS.constant.NODE_CONVERSATION;
ZCS.constant.ITEM_NODE[ZCS.constant.ITEM_MESSAGE]           = ZCS.constant.NODE_MESSAGE;
ZCS.constant.ITEM_NODE[ZCS.constant.ITEM_CONTACT]           = ZCS.constant.NODE_CONTACT;
ZCS.constant.ITEM_NODE[ZCS.constant.ITEM_MATCH]             = ZCS.constant.NODE_MATCH;
ZCS.constant.ITEM_NODE[ZCS.constant.ITEM_CALENDAR]          = ZCS.constant.NODE_CALENDAR;

// Item type based on JSON node name
ZCS.constant.NODE_ITEM = ZCS.util.getBackMap(ZCS.constant.ITEM_NODE);

// Controller that handles create for each item type
ZCS.constant.LIST_CONTROLLER = {};
ZCS.constant.LIST_CONTROLLER[ZCS.constant.ITEM_CONVERSATION]    = 'ZCS.controller.mail.ZtConvListController';
ZCS.constant.LIST_CONTROLLER[ZCS.constant.ITEM_MESSAGE]         = 'ZCS.controller.mail.ZtConvController';
ZCS.constant.LIST_CONTROLLER[ZCS.constant.ITEM_CONTACT]         = 'ZCS.controller.contacts.ZtContactListController';

// Store that holds items for list view
ZCS.constant.STORE = {};
ZCS.constant.STORE[ZCS.constant.APP_MAIL]       = 'ZtConvStore';
ZCS.constant.STORE[ZCS.constant.APP_CONTACTS]   = 'ZtContactStore';
ZCS.constant.STORE[ZCS.constant.APP_CALENDAR]   = 'ZtCalendarStore';

// App based on folder type
ZCS.constant.FOLDER_APP = {};
ZCS.constant.FOLDER_APP[ZCS.constant.ORG_MAIL_FOLDER]      = ZCS.constant.APP_MAIL;
ZCS.constant.FOLDER_APP[ZCS.constant.ORG_ADDRESS_BOOK]     = ZCS.constant.APP_CONTACTS;
ZCS.constant.FOLDER_APP[ZCS.constant.ORG_CALENDAR]         = ZCS.constant.APP_CALENDAR;

// Folder type for each app
ZCS.constant.APP_FOLDER = ZCS.util.getBackMap(ZCS.constant.FOLDER_APP);

// View (from JSON folder data) that determines which app a folder belongs to
ZCS.constant.FOLDER_VIEW = {};
ZCS.constant.FOLDER_VIEW[ZCS.constant.APP_MAIL]     = 'message';
ZCS.constant.FOLDER_VIEW[ZCS.constant.APP_CONTACTS] = 'contact';
ZCS.constant.FOLDER_VIEW[ZCS.constant.APP_CALENDAR] = 'calendar';

// Folder type by organizer view (from JSON)
ZCS.constant.FOLDER_TYPE = {};
ZCS.constant.FOLDER_TYPE[ZCS.constant.ITEM_MESSAGE]     = ZCS.constant.ORG_MAIL_FOLDER;
ZCS.constant.FOLDER_TYPE[ZCS.constant.ITEM_CONTACT]     = ZCS.constant.ORG_ADDRESS_BOOK;
ZCS.constant.FOLDER_TYPE[ZCS.constant.ITEM_APPOINTMENT] = ZCS.constant.ORG_CALENDAR;

// Organizer names (appear in overview groups)
ZCS.constant.ORG_NAME = {};
ZCS.constant.ORG_NAME[ZCS.constant.ORG_MAIL_FOLDER]     = ZtMsg.folders;
ZCS.constant.ORG_NAME[ZCS.constant.ORG_ADDRESS_BOOK]    = ZtMsg.addressBooks;
ZCS.constant.ORG_NAME[ZCS.constant.ORG_SEARCH]          = ZtMsg.searches;
ZCS.constant.ORG_NAME[ZCS.constant.ORG_TAG]             = ZtMsg.tags;
ZCS.constant.ORG_NAME[ZCS.constant.ORG_CALENDAR]        = ZtMsg.calendar;

// Order in which organizers should appear grouped in overview
ZCS.constant.ORG_SORT_VALUE = {};
ZCS.constant.ORG_SORT_VALUE[ZCS.constant.ORG_FOLDER]        = 1;
ZCS.constant.ORG_SORT_VALUE[ZCS.constant.ORG_SEARCH]        = 2;
ZCS.constant.ORG_SORT_VALUE[ZCS.constant.ORG_TAG]           = 3;

// System folder IDs
ZCS.constant.ID_ROOT        = '1';
ZCS.constant.ID_INBOX       = '2';
ZCS.constant.ID_TRASH       = '3';
ZCS.constant.ID_JUNK        = '4';
ZCS.constant.ID_SENT        = '5';
ZCS.constant.ID_DRAFTS      = '6';
ZCS.constant.ID_CONTACTS    = '7';
ZCS.constant.ID_CALENDAR    = '10';
ZCS.constant.ID_EMAILED     = '13';
ZCS.constant.ID_CHATS       = '14';

// Use negative ID for internal system folder
ZCS.constant.ID_DLS         = '-18';    // distribution lists

// An ID less than this indicates a system folder
ZCS.constant.MAX_SYSTEM_ID = 255;

// When showing a conv, don't show messages in these folders
ZCS.constant.CONV_HIDE = ZCS.util.arrayAsLookupHash([
	ZCS.constant.ID_TRASH,
	ZCS.constant.ID_JUNK,
	ZCS.constant.ID_DRAFTS
]);

// When replying to or forwarding a conv, omit these folders when
// figuring out which message to use as the original for the reply/forward
ZCS.constant.CONV_REPLY_OMIT = ZCS.util.arrayAsLookupHash([
//	ZCS.constant.ID_SENT,
	ZCS.constant.ID_DRAFTS,
	ZCS.constant.ID_TRASH,
	ZCS.constant.ID_JUNK
]);

// Folder constraint identifiers, used to manage which messages are moved
// when a conversation is moved.
ZCS.constant.TCON = {};
ZCS.constant.TCON[ZCS.constant.ID_TRASH]    = 't';
ZCS.constant.TCON[ZCS.constant.ID_JUNK]     = 'j';
ZCS.constant.TCON[ZCS.constant.ID_SENT]     = 's';
ZCS.constant.TCON[ZCS.constant.ID_DRAFTS]   = 'd';

// System folder sort order
ZCS.constant.FOLDER_SORT_VALUE = {};

ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_TRASH]   = 99;

ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_INBOX]   = 1;
ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_SENT]    = 2;
ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_DRAFTS]  = 3;
ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_JUNK]    = 4;

ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_CONTACTS]    = 1;
ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_DLS]         = 2;
ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_EMAILED]     = 3;

// System folder names (used in search queries)
ZCS.constant.FOLDER_SYSTEM_NAME = {};
ZCS.constant.FOLDER_SYSTEM_NAME[ZCS.constant.ID_TRASH]   = 'trash';

ZCS.constant.FOLDER_SYSTEM_NAME[ZCS.constant.ID_INBOX]   = 'inbox';
ZCS.constant.FOLDER_SYSTEM_NAME[ZCS.constant.ID_SENT]    = 'sent';
ZCS.constant.FOLDER_SYSTEM_NAME[ZCS.constant.ID_DRAFTS]  = 'drafts';
ZCS.constant.FOLDER_SYSTEM_NAME[ZCS.constant.ID_JUNK]    = 'junk';

ZCS.constant.FOLDER_SYSTEM_NAME[ZCS.constant.ID_CONTACTS]   = 'contacts';
ZCS.constant.FOLDER_SYSTEM_NAME[ZCS.constant.ID_EMAILED]    = 'emailed contacts';
ZCS.constant.FOLDER_SYSTEM_NAME[ZCS.constant.ID_CALENDAR]   = 'calendar';

ZCS.constant.FOLDER_SYSTEM_ID = ZCS.util.getBackMap(ZCS.constant.FOLDER_SYSTEM_NAME);

// Folders we don't want to show in overview
ZCS.constant.FOLDER_HIDE = {};
ZCS.constant.FOLDER_HIDE[ZCS.constant.ID_CHATS] = true;

// Email address types
ZCS.constant.TO             = 'to';
ZCS.constant.FROM           = 'from';
ZCS.constant.CC             = 'cc';
ZCS.constant.BCC            = 'bcc';
ZCS.constant.REPLY_TO       = 'reply-to';
ZCS.constant.SENDER         = 'sender';
ZCS.constant.RESENT_FROM    = 'resent-from';
ZCS.constant.READ_RECEIPT   = 'read-receipt';

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
ZCS.constant.FROM_SOAP_TYPE['rf'] = ZCS.constant.RESENT_FROM;
ZCS.constant.FROM_SOAP_TYPE['n']  = ZCS.constant.READ_RECEIPT;

// and the other way too
ZCS.constant.TO_SOAP_TYPE = ZCS.util.getBackMap(ZCS.constant.FROM_SOAP_TYPE);

// sort orders
ZCS.constant.DATE_DESC 		= 'dateDesc';
ZCS.constant.DATE_ASC 		= 'dateAsc';

// Data types
ZCS.constant.TYPE_STRING    = 'string';
ZCS.constant.TYPE_NUMBER    = 'number';
ZCS.constant.TYPE_BOOLEAN   = 'boolean';
ZCS.constant.TYPE_ARRAY     = 'array';
ZCS.constant.TYPE_HASH      = 'hash';

// Content types
ZCS.constant.TEXT_PLAIN = 'text/plain';
ZCS.constant.TEXT_HTML  = 'text/html';

// Names of user settings (LDAP attribute names)

// General
ZCS.constant.SETTING_JSLOGGING_ENABLED  = 'zimbraTouchJSErrorTrackingEnabled';  // third-party logging service
ZCS.constant.SETTING_JSLOGGING_KEY      = 'zimbraTouchJSErrorTrackingKey';      // third-party logging service
ZCS.constant.SETTING_LOCALE             = 'zimbraPrefLocale';
ZCS.constant.SETTING_SHOW_SEARCH        = 'zimbraPrefShowSearchString';
ZCS.constant.SETTING_TIMEZONE           = 'zimbraPrefTimeZoneId';

// Mail
ZCS.constant.SETTING_ALIASES            = 'zimbraMailAlias';
ZCS.constant.SETTING_CONVERSATION_ORDER = 'zimbraPrefConversationOrder';
ZCS.constant.SETTING_DISPLAY_IMAGES     = 'zimbraPrefDisplayExternalImages';
ZCS.constant.SETTING_FORWARD_INCLUDE    = 'zimbraPrefForwardIncludeOriginalText';
ZCS.constant.SETTING_FROM_ADDRESS       = 'zimbraPrefFromAddress';
ZCS.constant.SETTING_FROM_NAME          = 'zimbraPrefFromDisplay';
ZCS.constant.SETTING_INITIAL_SEARCH     = 'zimbraPrefMailInitialSearch';
ZCS.constant.SETTING_MAIL_ENABLED       = 'zimbraFeatureMailEnabled';
ZCS.constant.SETTING_MARK_READ          = 'zimbraPrefMarkMsgRead';  // -1 = never, 0 = now, [int] = delay in seconds
ZCS.constant.SETTING_REPLY_INCLUDE      = 'zimbraPrefReplyIncludeOriginalText';
ZCS.constant.SETTING_REPLY_PREFIX       = 'zimbraPrefForwardReplyPrefixChar';
ZCS.constant.SETTING_SIGNATURE_ID       = 'zimbraPrefDefaultSignatureId';
ZCS.constant.SETTING_REPLY_SIGNATURE_ID = 'zimbraPrefForwardReplySignatureId';
ZCS.constant.SETTING_SIGNATURE_STYLE    = 'zimbraPrefMailSignatureStyle';
ZCS.constant.SETTING_TRUSTED_SENDERS    = 'zimbraPrefMailTrustedSenderList';

// Contacts
ZCS.constant.SETTING_CONTACTS_ENABLED   = 'zimbraFeatureContactsEnabled';
ZCS.constant.SETTING_SHOW_DL_FOLDER     = 'zimbraFeatureDistributionListFolderEnabled';

// Calendar
ZCS.constant.SETTING_CALENDAR_ENABLED   = 'zimbraFeatureCalendarEnabled';

// Internal settings
ZCS.constant.SETTING_CUR_SEARCH                 = 'CUR_SEARCH';
ZCS.constant.SETTING_CUR_SEARCH_ID              = 'CUR_SEARCH_ID';
ZCS.constant.SETTING_FORWARD_INCLUDE_HEADERS    = 'FORWARD_INCLUDE_HEADERS';
ZCS.constant.SETTING_FORWARD_INCLUDE_WHAT       = 'FORWARD_INCLUDE_WHAT';
ZCS.constant.SETTING_FORWARD_USE_PREFIX         = 'FORWARD_USE_PREFIX';
ZCS.constant.SETTING_GET_NAME_FROM_CONTACTS     = 'GET_NAME_FROM_CONTACTS';
ZCS.constant.SETTING_REPLY_INCLUDE_HEADERS      = 'REPLY_INCLUDE_HEADERS';
ZCS.constant.SETTING_REPLY_INCLUDE_WHAT         = 'REPLY_INCLUDE_WHAT';
ZCS.constant.SETTING_REPLY_SIGNATURE            = 'REPLY_SIGNATURE';
ZCS.constant.SETTING_REPLY_USE_PREFIX           = 'REPLY_USE_PREFIX';
ZCS.constant.SETTING_REST_URL                   = 'REST_URL';
ZCS.constant.SETTING_SIGNATURE                  = 'SIGNATURE';

ZCS.constant.SETTINGS = ZCS.constant.makeList('SETTING_');

// Setting type; defaults to string, so just note exceptions
ZCS.constant.SETTING_TYPE = {};
ZCS.constant.SETTING_TYPE[ZCS.constant.SETTING_MAIL_ENABLED]                = ZCS.constant.TYPE_BOOLEAN;
ZCS.constant.SETTING_TYPE[ZCS.constant.SETTING_CONTACTS_ENABLED]            = ZCS.constant.TYPE_BOOLEAN;
ZCS.constant.SETTING_TYPE[ZCS.constant.SETTING_CALENDAR_ENABLED]            = ZCS.constant.TYPE_BOOLEAN;
ZCS.constant.SETTING_TYPE[ZCS.constant.SETTING_SHOW_SEARCH]                 = ZCS.constant.TYPE_BOOLEAN;
ZCS.constant.SETTING_TYPE[ZCS.constant.SETTING_DISPLAY_IMAGES]              = ZCS.constant.TYPE_BOOLEAN;
ZCS.constant.SETTING_TYPE[ZCS.constant.SETTING_JSLOGGING_ENABLED]           = ZCS.constant.TYPE_BOOLEAN;
ZCS.constant.SETTING_TYPE[ZCS.constant.SETTING_TRUSTED_SENDERS]             = ZCS.constant.TYPE_ARRAY;
ZCS.constant.SETTING_TYPE[ZCS.constant.SETTING_GET_NAME_FROM_CONTACTS]      = ZCS.constant.TYPE_BOOLEAN;
ZCS.constant.SETTING_TYPE[ZCS.constant.SETTING_SHOW_DL_FOLDER]              = ZCS.constant.TYPE_BOOLEAN;
ZCS.constant.SETTING_TYPE[ZCS.constant.SETTING_CUR_SEARCH]                  = ZCS.constant.TYPE_HASH;
ZCS.constant.SETTING_TYPE[ZCS.constant.SETTING_CUR_SEARCH_ID]               = ZCS.constant.TYPE_HASH;

// Forced setting values, which override user setting
ZCS.constant.SETTING_VALUE = {};
ZCS.constant.SETTING_VALUE[ZCS.constant.SETTING_SHOW_SEARCH] = 'false';

// Default values for settings
ZCS.constant.SETTING_DEFAULT = {};
ZCS.constant.SETTING_DEFAULT[ZCS.constant.SETTING_LOCALE]                   = 'en_US';
ZCS.constant.SETTING_DEFAULT[ZCS.constant.SETTING_GET_NAME_FROM_CONTACTS]   = true; // see bug 81656
ZCS.constant.SETTING_DEFAULT[ZCS.constant.SETTING_SHOW_DL_FOLDER]           = true;
ZCS.constant.SETTING_DEFAULT[ZCS.constant.SETTING_CONVERSATION_ORDER]       = ZCS.constant.DATE_DESC;

// Signature styles
ZCS.constant.SIG_INTERNET   = 'internet';
ZCS.constant.SIG_OUTLOOK    = 'outlook';

// Setting that tells us if an app is enabled
ZCS.constant.APP_SETTING = {};
ZCS.constant.APP_SETTING[ZCS.constant.APP_MAIL]     = ZCS.constant.SETTING_MAIL_ENABLED;
ZCS.constant.APP_SETTING[ZCS.constant.APP_CONTACTS] = ZCS.constant.SETTING_CONTACTS_ENABLED;
ZCS.constant.APP_SETTING[ZCS.constant.APP_CALENDAR] = ZCS.constant.SETTING_CALENDAR_ENABLED;

// Values for what is included on reply/forward - server bundles several options into a single value
ZCS.constant.INC_NONE				= 'includeNone';
ZCS.constant.INC_ATTACH			    = 'includeAsAttachment';
ZCS.constant.INC_BODY				= 'includeBody';				// deprecated - same as includeBodyAndHeaders
ZCS.constant.INC_BODY_ONLY			= 'includeBodyOnly';
ZCS.constant.INC_BODY_PRE			= 'includeBodyWithPrefix';
ZCS.constant.INC_BODY_HDR			= 'includeBodyAndHeaders';
ZCS.constant.INC_BODY_PRE_HDR		= 'includeBodyAndHeadersWithPrefix';
ZCS.constant.INC_SMART				= 'includeSmart';
ZCS.constant.INC_SMART_PRE			= 'includeSmartWithPrefix';
ZCS.constant.INC_SMART_HDR			= 'includeSmartAndHeaders';
ZCS.constant.INC_SMART_PRE_HDR		= 'includeSmartAndHeadersWithPrefix';

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

//ZCS.constant.PROP_FLAG = ZCS.util.getBackMap(ZCS.constant.FLAG_PROP);

// Date/time constants
ZCS.constant.MSEC_PER_MINUTE = 60000;
ZCS.constant.MSEC_PER_HOUR = 60 * ZCS.constant.MSEC_PER_MINUTE;
ZCS.constant.MSEC_PER_DAY = 24 * ZCS.constant.MSEC_PER_HOUR;
ZCS.constant.MSEC_PER_WEEK = 7 * ZCS.constant.MSEC_PER_DAY;
ZCS.constant.MSEC_PER_YEAR = 365 * ZCS.constant.MSEC_PER_DAY;

// How many senders to show for a conv in the conv list
ZCS.constant.NUM_CONV_SENDERS = 3;

// Extra mail headers to fetch for a SOAP request
ZCS.constant.ADDITIONAL_MAIL_HEADERS = [
	{ n: 'List-ID' },
	{ n: 'X-Zimbra-DL' },
	{ n: 'IN-REPLY-TO' }
];

// Useful regexes
ZCS.constant.REGEX_NON_WHITESPACE       = /\S+/;
ZCS.constant.REGEX_SPLIT                = /\r\n|\r|\n/;
ZCS.constant.REGEX_SUBJ_PREFIX          = new RegExp('^\\s*(Re:|Fw:|Fwd:|' + ZtMsg.rePrefix + '|' + ZtMsg.fwdPrefix + '|' + ZtMsg.fwPrefix + ')' + '\\s*', 'i');
ZCS.constant.REGEX_SPACE_WORD           = new RegExp('\\s*\\S+', 'g');
ZCS.constant.REGEX_MSG_SEP              = new RegExp('^\\s*--+\\s*(' + ZtMsg.originalMessage + '|' + ZtMsg.forwardedMessage + ')\\s*--+', 'i');
ZCS.constant.REGEX_SIG                  = /^(- ?-+)|(__+)\r?$/;
ZCS.constant.REGEX_HDR                  = /^\s*\w+:/;
ZCS.constant.REGEX_COLON                = /\S+:$/;
ZCS.constant.REGEX_IMG_SRC_CID          = /<img([^>]*)\ssrc=["']cid:/gi;
ZCS.constant.REGEX_URL                  = /(((https?):\/\/)|(www\.[\w\.\_\-]+))[^\s\xA0\(\)\<\>\[\]\{\}\'\"]*/gi;
// simple email regex - see ZtEmailAddress for fancier ones
ZCS.constant.REGEX_EMAIL                = /(\s+href=["']mailto:)?\b([A-Z0-9\._%+-]+@[A-Z0-9\.-]+\.[A-Z]{2,5})["']?/gi;
ZCS.constant.REGEX_FOLDER_TAG_SEARCH    = /^(in|tag):["']?([^\x00-\x1F\x7F:\"]+)["']?$/;
ZCS.constant.REGEX_CONTACT_ATTR         = /^([a-z]+)([a-zA-Z]+)(\d*)$/;
ZCS.constant.REGEX_CONTACT_FIELD        = /^([a-z][a-zA-Z]+)(\d*)$/;

ZCS.constant.ORIGINAL_SRC_ATTRIBUTE = 'origSrc';

// URL paths
ZCS.constant.PATH_MSG_FETCH = '/service/home/~/';
ZCS.constant.ATTACHMENT_UPLOAD = '/service/upload';
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
ZCS.constant.HTML_QUOTE_DIVIDER_ID     	= 'zwchr';
ZCS.constant.HTML_QUOTE_DIVIDER     	= '<hr id="' + ZCS.constant.HTML_QUOTE_DIVIDER_ID + '">';

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

// Autocomplete
ZCS.constant.NUM_AUTOCOMPLETE_MATCHES = 20;

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
ZCS.constant.PSTATUS_UNKNOWN    = 'NE';

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

// Quick reply textarea - height in pixels
ZCS.constant.QUICK_REPLY_SMALL  = 20;
ZCS.constant.QUICK_REPLY_LARGE  = 80;

// Contact fields used by the contact template
ZCS.constant.CONTACT_TEMPLATE_FIELDS = [
	'isGroup', 'isDistributionList', 'isMultiple',
	'nameLastFirst', 'fullName', 'nickname', 'email', 'phone',
	'address', 'url', 'jobTitle', 'company', 'tags',
	'members', 'isOwner', 'isMember'
];

// Contact fields that can have multiple values
ZCS.constant.CONTACT_MULTI_FIELDS = [
	'email', 'phone', 'address', 'url'
];
ZCS.constant.IS_CONTACT_MULTI_FIELD = ZCS.util.arrayAsLookupHash(ZCS.constant.CONTACT_MULTI_FIELDS);

// Contact attributes that make up an address
ZCS.constant.ADDRESS_FIELDS = [
	'street', 'city', 'state', 'postalCode', 'country'
];
ZCS.constant.IS_ADDRESS_FIELD = ZCS.util.arrayAsLookupHash(ZCS.constant.ADDRESS_FIELDS);

// Contact attributes that have variable type (home, work, etc)
ZCS.constant.IS_PARSED_ATTR_FIELD = ZCS.util.arrayAsLookupHash([
	'email', 'phone', 'url'
]);

// Ordering for display of attribute types
ZCS.constant.ATTR_TYPE_SORT_VALUE = {
	mobile: 1,
	home:   2,
	work:   3,
	other:  4
};

// Contact attributes that can be copied directly from form to contact fields
ZCS.constant.CONTACT_FIELDS = [
    'firstName',
    'lastName',
    'nickname',
    'namePrefix',
    'nameSuffix',
    'maidenName',
    'middleName',
    'company',
    'jobTitle',
    'department',
    'image',
    'imagepart',
    'zimletImage'
];

ZCS.constant.CALENDAR_FIELDS = [
    'subject',
    'location',
    'start',
    'end',
    'startAllDay',
    'endAllDay',
    'isAllDay',
    'repeat',
    'reminder',
    'notes'
];

ZCS.constant.EXTRA_NAME_FIELDS = [
	'namePrefix', 'middleName', 'maidenName', 'nameSuffix', 'nickname'
];
ZCS.constant.IS_EXTRA_NAME_FIELD = ZCS.util.arrayAsLookupHash(ZCS.constant.EXTRA_NAME_FIELDS);

ZCS.constant.EXTRA_JOB_FIELDS = [
	'jobTitle', 'department'
];
ZCS.constant.IS_EXTRA_JOB_FIELD = ZCS.util.arrayAsLookupHash(ZCS.constant.EXTRA_JOB_FIELDS);

// Server errors that should force a logout
ZCS.constant.IS_FATAL_ERROR = ZCS.util.arrayAsLookupHash([
	'account.MAINTENANCE_MODE',
	'mail.MAINTENANCE',
	'service.AUTH_REQUIRED',
	'service.AUTH_EXPIRED'
]);

// Needs to match _zttag.scss
ZCS.constant.TAG_COLOR_COUNT = 10;

ZCS.constant.SIDE_MENU_CONFIG = {
    tablet: {
        landscape: {
            itemNavigationReservesSpace: true,
            itemNavigationAlwaysShown: true,
            hasOverviewNavigation: true,
            navigationWidth: 0.3
	    },
        portrait: {
            itemNavigationReservesSpace: false,
            itemNavigationAlwaysShown: false,
            hasOverviewNavigation: true,
            navigationWidth: 0.4
        }
    },
    phone: {
	    landscape: {
            itemNavigationReservesSpace: false,
            itemNavigationAlwaysShown: false,
            hasOverviewNavigation: true,
            navigationWidth: 0.8
	    },
	    portrait: {
            itemNavigationReservesSpace: false,
            itemNavigationAlwaysShown: false,
            hasOverviewNavigation: true,
            navigationWidth: 1.0
        }
    }
};

// Constants related to parsing search queries based on the Zimbra query language

// types of search tokens
ZCS.constant.SEARCH_TERM	= 'TERM';	// search operator such as 'in'
ZCS.constant.SEARCH_COND	= 'COND';	// AND OR NOT
ZCS.constant.SEARCH_GROUP	= 'GROUP';	// ( or )

// query operators
ZCS.constant.SEARCH_IS_OP = ZCS.util.arrayAsLookupHash([
	'content', 'subject', 'msgid', 'envto', 'envfrom', 'contact', 'to', 'from', 'cc', 'tofrom',
	'tocc', 'fromcc', 'tofromcc', 'in', 'under', 'inid', 'underid', 'has', 'filename', 'type',
	'attachment', 'is', 'date', 'mdate', 'day', 'week', 'month', 'year', 'after', 'before',
	'size', 'bigger', 'larger', 'smaller', 'tag', 'priority', 'message', 'my', 'modseq', 'conv',
	'conv-count', 'conv-minm', 'conv-maxm', 'conv-start', 'conv-end', 'appt-start', 'appt-end',
	'author', 'title', 'keywords', 'company', 'metadata', 'item', 'sort'
]);

// special operator for content term
ZCS.constant.SEARCH_OP_CONTENT = 'content';

// conditional ops
ZCS.constant.SEARCH_COND_AND	= 'and'
ZCS.constant.SEARCH_COND_OR		= 'or';
ZCS.constant.SEARCH_COND_NOT	= 'not';
ZCS.constant.SEARCH_GROUP_OPEN	= '(';
ZCS.constant.SEARCH_GROUP_CLOSE	= ')';

// JS version of conditional
ZCS.constant.SEARCH_COND_OP = {};
ZCS.constant.SEARCH_COND_OP[ZCS.constant.SEARCH_COND_AND]	= ' && ';
ZCS.constant.SEARCH_COND_OP[ZCS.constant.SEARCH_COND_OR]	= ' || ';
ZCS.constant.SEARCH_COND_OP[ZCS.constant.SEARCH_COND_NOT]	= ' !';

// word separators
ZCS.constant.SEARCH_IS_EOW	= ZCS.util.arrayAsLookupHash([ ' ', ':', ZCS.constant.SEARCH_GROUP_OPEN, ZCS.constant.SEARCH_GROUP_CLOSE ]);

// map is:xxx to code that checks item property
ZCS.constant.SEARCH_FLAG = {};
ZCS.constant.SEARCH_FLAG['unread']		= "item.get('isUnread')";
ZCS.constant.SEARCH_FLAG['read']		= "!item.get('isUnread')";
ZCS.constant.SEARCH_FLAG['flagged']		= "item.get('isFlagged')";
ZCS.constant.SEARCH_FLAG['unflagged']	= "!item.get('isFlagged')";
ZCS.constant.SEARCH_FLAG['forwarded']	= "item.get('isForwarded')";
ZCS.constant.SEARCH_FLAG['unforwarded']	= "!item.get('isForwarded')";
ZCS.constant.SEARCH_FLAG['sent']		= "item.get('isSent')";
ZCS.constant.SEARCH_FLAG['draft']		= "item.get('isDraft')";
ZCS.constant.SEARCH_FLAG['replied']		= "item.get('isReplied')";
ZCS.constant.SEARCH_FLAG['unreplied']	= "!item.get('isReplied')";
