/**
* Creates a setting.
* @constructor
* @class
* This class represents a single setting. A setting's default value never changes; it
* is available in case the user wishes to restore the current value to the default.
* Most but not all settings have a corollary on the server side. Settings that don't
* will depend on the environment or user activity to get their value.
*
* @author Conrad Damon
* @param id				a unique ID
* @param name			the name of the pref or attr on the server
* @param type			config, pref, or COS
* @param dataType		string, int, or boolean
* @param defaultValue	default value
*/
function ZmSetting(id, name, type, dataType, defaultValue, settings) {

	if (arguments.length == 0) return;
	ZmModel.call(this, true);
	
	this.id = id;
	this.name = name;
	this.type = type;
	this.dataType = dataType ? dataType : ZmSetting.D_STRING;
	this.defaultValue = defaultValue;
	this.settings = settings;
	
	if (this.dataType == ZmSetting.D_HASH_TABLE) {
		this.value = new Object();
		this.defaultValue = new Object();
	} else {
		this.value = null;
	}
}

ZmSetting.prototype = new ZmModel;
ZmSetting.prototype.constructor = ZmSetting;

ZmSetting.CAL_DAY			= "day";
ZmSetting.CAL_MONTH			= "month";
ZmSetting.CAL_WEEK			= "week";
ZmSetting.CAL_WORK_WEEK		= "workWeek";
ZmSetting.COMPOSE_TEXT 		= "text";					// liquidPrefComposeFormat
ZmSetting.COMPOSE_HTML 		= "html";
ZmSetting.CV_CARDS			= "cards"; 					// liquidPrefContactsInitialView
ZmSetting.CV_LIST			= "list";
ZmSetting.GROUP_BY_CONV		= "conversation";			// liquidPrefGroupMailBy
ZmSetting.GROUP_BY_MESSAGE	= "message";
ZmSetting.INCLUDE_NONE		= "includeNone";			// liquidPrefForwardIncludeOriginalText
ZmSetting.INCLUDE			= "includeBody";
ZmSetting.INCLUDE_PREFIX	= "includeBodyWithPrefix";
ZmSetting.INCLUDE_ATTACH	= "includeAsAttachment";
ZmSetting.INCLUDE_SMART		= "includeSmart";
ZmSetting.DEDUPE_NONE		= "dedupeNone";				// liquidPrefDedupeMessagesSentToSelf
ZmSetting.DEDUPE_SECOND		= "secondCopyifOnToOrCC";
ZmSetting.DEDUPE_INBOX		= "moveSentMessageToInbox";
ZmSetting.DEDUPE_ALL		= "dedupeAll";
ZmSetting.SIG_INTERNET		= "internet";				// liquidPrefMailSignatureStyle
ZmSetting.SIG_OUTLOOK		= "outlook";

// Constants for various setting types. A setting can represent configuration data, a COS attribute, or a user preference.
// Any setting added here must also be added to INIT below.
var i = 1;

// CONFIG SETTINGS
ZmSetting.AC_TIMER_INTERVAL				= i++;
ZmSetting.BRANCH						= i++;
ZmSetting.CONFIG_PATH					= i++;
ZmSetting.CSFE_MSG_FETCHER_URI			= i++;
ZmSetting.CSFE_SERVER_URI				= i++;
ZmSetting.CSFE_UPLOAD_URI				= i++;
ZmSetting.CSFE_EXPORT_URI 				= i++;
ZmSetting.FORCE_CAL_OFF					= i++;
ZmSetting.HELP_URI						= i++;
ZmSetting.LOGO_URI						= i++;
ZmSetting.USE_XML						= i++;

// IDs FOR HTML COMPONENTS IN THE SKIN
ZmSetting.SKIN_APP_BOTTOM_TOOLBAR_ID	= i++;
ZmSetting.SKIN_APP_CHOOSER_ID			= i++;
ZmSetting.SKIN_APP_MAIN_ID				= i++;
ZmSetting.SKIN_APP_TOP_TOOLBAR_ID		= i++;
ZmSetting.SKIN_CURRENT_APP_ID			= i++;
ZmSetting.SKIN_LOGO_ID					= i++;
ZmSetting.SKIN_SASH_ID					= i++;
ZmSetting.SKIN_SEARCH_BUILDER_ID		= i++;
ZmSetting.SKIN_SEARCH_BUILDER_TOOLBAR_ID= i++;
ZmSetting.SKIN_SEARCH_BUILDER_TR_ID		= i++;
ZmSetting.SKIN_SEARCH_ID				= i++;
ZmSetting.SKIN_SHELL_ID					= i++;
ZmSetting.SKIN_STATUS_ID				= i++;
ZmSetting.SKIN_TREE_ID					= i++;
ZmSetting.SKIN_TREE_FOOTER_ID			= i++;
ZmSetting.SKIN_USER_INFO_ID				= i++;

// COS SETTINGS
ZmSetting.BROWSE_ENABLED				= i++;
ZmSetting.CALENDAR_ENABLED				= i++;
ZmSetting.CHANGE_PASSWORD_ENABLED		= i++;
ZmSetting.CONTACTS_ENABLED				= i++;
ZmSetting.CONVERSATIONS_ENABLED			= i++;
ZmSetting.DISPLAY_NAME					= i++;
ZmSetting.FILTERS_ENABLED				= i++;
ZmSetting.GAL_ENABLED					= i++;
ZmSetting.HTML_COMPOSE_ENABLED 			= i++;
ZmSetting.IDLE_SESSION_TIMEOUT 			= i++;
ZmSetting.INITIAL_SEARCH_ENABLED		= i++;
ZmSetting.MAX_CONTACTS					= i++;
ZmSetting.MIN_POLLING_INTERVAL			= i++;
ZmSetting.QUOTA							= i++;
ZmSetting.SAVED_SEARCHES_ENABLED		= i++;
ZmSetting.TAGGING_ENABLED				= i++;
// user metadata (included with COS since the user can't change them)
ZmSetting.QUOTA_USED					= i++;
ZmSetting.TOKEN_LIFETIME				= i++;
ZmSetting.USERNAME						= i++;

// CLIENT SIDE FEATURE SUPPORT
ZmSetting.ATT_VIEW_ENABLED				= i++;
ZmSetting.EVAL_ENABLED 					= i++;
ZmSetting.HELP_ENABLED					= i++;
ZmSetting.IM_ENABLED					= i++;
ZmSetting.MIXED_VIEW_ENABLED			= i++;
ZmSetting.NOTES_ENABLED					= i++;
ZmSetting.PREFS_ENABLED					= i++;
ZmSetting.PRINT_ENABLED					= i++;
ZmSetting.REPLY_MENU_ENABLED			= i++;
ZmSetting.SAVE_DRAFT_ENABLED			= i++;
ZmSetting.SEARCH_ENABLED				= i++;
ZmSetting.SKI_HACK_ENABLED				= i++;
ZmSetting.SPAM_ENABLED					= i++;
ZmSetting.USER_FOLDERS_ENABLED			= i++;

// USER PREFERENCES (mutable)

// address book preferences
ZmSetting.AUTO_ADD_ADDRESS				= i++;
ZmSetting.CONTACTS_PER_PAGE 			= i++;
ZmSetting.CONTACTS_VIEW					= i++;
ZmSetting.EXPORT 						= i++;
ZmSetting.IMPORT 						= i++;
// calendar preferences
ZmSetting.CAL_SHOW_TIMEZONE				= i++;
ZmSetting.CALENDAR_INITIAL_VIEW			= i++;
ZmSetting.DEFAULT_CALENDAR_TIMEZONE		= i++;
// general preferences
ZmSetting.PASSWORD						= i++;
ZmSetting.SEARCH_INCLUDES_SPAM			= i++;
ZmSetting.SEARCH_INCLUDES_TRASH			= i++;
ZmSetting.SHOW_SEARCH_STRING			= i++;
ZmSetting.SORTING_PREF 					= i++;
// mail preferences
ZmSetting.COMPOSE_AS_FORMAT				= i++;
ZmSetting.COMPOSE_SAME_FORMAT 			= i++;
ZmSetting.DEDUPE_MSG_TO_SELF			= i++;
ZmSetting.FORWARD_INCLUDE_ORIG			= i++;
ZmSetting.GROUP_MAIL_BY					= i++;
ZmSetting.INITIAL_SEARCH				= i++;
ZmSetting.NEW_WINDOW_COMPOSE			= i++;
ZmSetting.NOTIF_ADDRESS					= i++;
ZmSetting.NOTIF_ENABLED					= i++;
ZmSetting.PAGE_SIZE						= i++;
ZmSetting.POLLING_INTERVAL				= i++;
ZmSetting.REPLY_INCLUDE_ORIG			= i++;
ZmSetting.REPLY_PREFIX					= i++;
ZmSetting.REPLY_TO_ADDRESS				= i++;
ZmSetting.SAVE_TO_SENT					= i++;
ZmSetting.SENT_FOLDER_NAME				= i++;
ZmSetting.SHOW_FRAGMENTS				= i++;
ZmSetting.SIGNATURE						= i++;
ZmSetting.SIGNATURE_ENABLED				= i++;
ZmSetting.SIGNATURE_STYLE				= i++;
ZmSetting.USE_KEYBOARD_SHORTCUTS		= i++;
ZmSetting.VACATION_MSG					= i++;
ZmSetting.VACATION_MSG_ENABLED			= i++;
ZmSetting.VIEW_AS_HTML					= i++;


ZmSetting.MAX_INDEX 	= i-1;

// setting types
ZmSetting.T_CONFIG		= 1;
ZmSetting.T_PREF		= 2;
ZmSetting.T_COS			= 3;

// setting data types
ZmSetting.D_STRING		= 1; // default type
ZmSetting.D_INT			= 2;
ZmSetting.D_BOOLEAN		= 3;
ZmSetting.D_LDAP_TIME 	= 4;
ZmSetting.D_HASH_TABLE 	= 5;


// initialization for settings: [name, type, data type, default value]
ZmSetting.INIT = new Object();

// CONFIG SETTINGS
ZmSetting.INIT[ZmSetting.AC_TIMER_INTERVAL]				= [null, ZmSetting.T_CONFIG, ZmSetting.D_INT, 300];
ZmSetting.INIT[ZmSetting.BRANCH]						= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "main"];
ZmSetting.INIT[ZmSetting.CONFIG_PATH]					= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "/liquid/js/liquidMail/config"];
ZmSetting.INIT[ZmSetting.CSFE_MSG_FETCHER_URI]			= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING];
ZmSetting.INIT[ZmSetting.CSFE_SERVER_URI]				= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING];
ZmSetting.INIT[ZmSetting.CSFE_UPLOAD_URI]				= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING];
ZmSetting.INIT[ZmSetting.CSFE_EXPORT_URI]				= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING];
ZmSetting.INIT[ZmSetting.FORCE_CAL_OFF]					= [null, ZmSetting.T_CONFIG, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.HELP_URI]						= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "/liquid/help/Zimbra_User_Help.htm"];
ZmSetting.INIT[ZmSetting.LOGO_URI]						= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "http://www.zimbra.com"];
ZmSetting.INIT[ZmSetting.USE_XML]						= [null, ZmSetting.T_CONFIG, ZmSetting.D_BOOLEAN, false];

// IDs FOR HTML COMPONENTS IN THE SKIN
ZmSetting.INIT[ZmSetting.SKIN_APP_BOTTOM_TOOLBAR_ID]	= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "skin_container_app_bottom_toolbar"];
ZmSetting.INIT[ZmSetting.SKIN_APP_CHOOSER_ID]			= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "skin_container_app_chooser"];
ZmSetting.INIT[ZmSetting.SKIN_APP_MAIN_ID]				= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "skin_container_app_main"];
ZmSetting.INIT[ZmSetting.SKIN_APP_TOP_TOOLBAR_ID]		= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "skin_container_app_top_toolbar"];
ZmSetting.INIT[ZmSetting.SKIN_CURRENT_APP_ID]			= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "skin_container_current_app"];
ZmSetting.INIT[ZmSetting.SKIN_LOGO_ID]					= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "skin_container_logo"];
ZmSetting.INIT[ZmSetting.SKIN_SASH_ID]					= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "skin_container_tree_app_sash"];
ZmSetting.INIT[ZmSetting.SKIN_SEARCH_BUILDER_ID]		= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "skin_container_search_builder"];
ZmSetting.INIT[ZmSetting.SKIN_SEARCH_BUILDER_TOOLBAR_ID]= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "skin_container_search_builder_toolbar"];
ZmSetting.INIT[ZmSetting.SKIN_SEARCH_BUILDER_TR_ID]		= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "skin_tr_search_builder"];
ZmSetting.INIT[ZmSetting.SKIN_SEARCH_ID]				= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "skin_container_search"];
ZmSetting.INIT[ZmSetting.SKIN_SHELL_ID]					= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "skin_outer"];
ZmSetting.INIT[ZmSetting.SKIN_STATUS_ID]				= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "skin_container_status"];
ZmSetting.INIT[ZmSetting.SKIN_TREE_ID]					= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "skin_container_tree"];
ZmSetting.INIT[ZmSetting.SKIN_TREE_FOOTER_ID]			= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "skin_container_tree_footer"];
ZmSetting.INIT[ZmSetting.SKIN_USER_INFO_ID]				= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "skin_container_quota"];

// COS SETTINGS
ZmSetting.INIT[ZmSetting.BROWSE_ENABLED]				= ["liquidFeatureAdvancedSearchEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.CALENDAR_ENABLED]				= ["liquidFeatureCalendarEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.CHANGE_PASSWORD_ENABLED]		= ["liquidFeatureChangePasswordEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.CONTACTS_ENABLED]				= ["liquidFeatureContactsEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.CONVERSATIONS_ENABLED]			= ["liquidFeatureConversationsEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.DISPLAY_NAME]					= ["displayName", ZmSetting.T_COS, ZmSetting.D_STRING];
ZmSetting.INIT[ZmSetting.FILTERS_ENABLED]				= ["liquidFeatureFiltersEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.GAL_ENABLED]					= ["liquidFeatureGalEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.HTML_COMPOSE_ENABLED] 			= ["liquidFeatureHtmlComposeEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.IDLE_SESSION_TIMEOUT] 			= ["liquidMailIdleSessionTimeout", ZmSetting.T_COS, ZmSetting.D_LDAP_TIME, 0];
ZmSetting.INIT[ZmSetting.INITIAL_SEARCH_ENABLED]		= ["liquidFeatureInitialSearchPreferenceEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.MAX_CONTACTS]					= ["liquidContactMaxNumEntries", ZmSetting.T_COS, ZmSetting.D_INT, 0];
ZmSetting.INIT[ZmSetting.MIN_POLLING_INTERVAL]			= ["liquidMailMinPollingInterval", ZmSetting.T_COS, ZmSetting.D_LDAP_TIME, 300];
ZmSetting.INIT[ZmSetting.QUOTA]							= ["liquidMailQuota", ZmSetting.T_COS, ZmSetting.D_INT, 0];
ZmSetting.INIT[ZmSetting.SAVED_SEARCHES_ENABLED]		= ["liquidFeatureSavedSearchesEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.TAGGING_ENABLED]				= ["liquidFeatureTaggingEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
// user metadata (included with COS since the user can't change them)
ZmSetting.INIT[ZmSetting.QUOTA_USED]					= [null, ZmSetting.T_COS, ZmSetting.D_INT];
ZmSetting.INIT[ZmSetting.TOKEN_LIFETIME]				= [null, ZmSetting.T_COS, ZmSetting.D_INT];
ZmSetting.INIT[ZmSetting.USERNAME]						= [null, ZmSetting.T_COS, ZmSetting.D_STRING];

// CLIENT SIDE FEATURE SUPPORT
ZmSetting.INIT[ZmSetting.ATT_VIEW_ENABLED]				= [null, ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.EVAL_ENABLED] 			 		= [null, ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.HELP_ENABLED]					= [null, ZmSetting.T_COS, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.IM_ENABLED]					= [null, ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.MIXED_VIEW_ENABLED]			= [null, ZmSetting.T_COS, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.NOTES_ENABLED]					= [null, ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.PREFS_ENABLED]					= [null, ZmSetting.T_COS, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.PRINT_ENABLED]					= [null, ZmSetting.T_COS, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.REPLY_MENU_ENABLED]			= [null, ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.SAVE_DRAFT_ENABLED]			= [null, ZmSetting.T_COS, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.SEARCH_ENABLED]				= [null, ZmSetting.T_COS, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.SKI_HACK_ENABLED]				= [null, ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.SPAM_ENABLED]					= [null, ZmSetting.T_COS, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.USER_FOLDERS_ENABLED]			= [null, ZmSetting.T_COS, ZmSetting.D_BOOLEAN, true];

// USER PREFERENCES (mutable)

// address book preferences
ZmSetting.INIT[ZmSetting.AUTO_ADD_ADDRESS]				= ["liquidPrefAutoAddAddressEnabled", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.CONTACTS_PER_PAGE] 			= ["liquidPrefContactsPerPage", ZmSetting.T_PREF, ZmSetting.D_INT, 25];
ZmSetting.INIT[ZmSetting.CONTACTS_VIEW]					= ["liquidPrefContactsInitialView", ZmSetting.T_PREF, ZmSetting.D_STRING, ZmSetting.CV_LIST];
ZmSetting.INIT[ZmSetting.EXPORT] 						= [null, ZmSetting.T_PREF];
ZmSetting.INIT[ZmSetting.IMPORT] 						= [null, ZmSetting.T_PREF];
// calendar preferences
ZmSetting.INIT[ZmSetting.CAL_SHOW_TIMEZONE]	 			= ["liquidPrefUseTimeZoneListInCalendar", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.CALENDAR_INITIAL_VIEW]			= ["liquidPrefCalendarInitialView", ZmSetting.T_PREF, ZmSetting.D_STRING, ZmSetting.CAL_DAY];
ZmSetting.INIT[ZmSetting.DEFAULT_CALENDAR_TIMEZONE]		= ["liquidPrefTimeZoneId", ZmSetting.T_PREF, ZmSetting.D_STRING];
// general preferences
ZmSetting.INIT[ZmSetting.PASSWORD]						= [null, ZmSetting.T_PREF];
ZmSetting.INIT[ZmSetting.SEARCH_INCLUDES_SPAM]			= ["liquidPrefIncludeSpamInSearch", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.SEARCH_INCLUDES_TRASH]			= ["liquidPrefIncludeTrashInSearch", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.SHOW_SEARCH_STRING]			= ["liquidPrefShowSearchString", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.SORTING_PREF] 					= [null, ZmSetting.T_PREF, ZmSetting.D_HASH_TABLE];
// mail preferences
ZmSetting.INIT[ZmSetting.COMPOSE_AS_FORMAT] 			= ["liquidPrefComposeFormat", ZmSetting.T_PREF, ZmSetting.D_STRING, ZmSetting.COMPOSE_TEXT];
ZmSetting.INIT[ZmSetting.COMPOSE_SAME_FORMAT] 			= ["liquidPrefForwardReplyInOriginalFormat", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.DEDUPE_MSG_TO_SELF]			= ["liquidPrefDedupeMessagesSentToSelf", ZmSetting.T_PREF, ZmSetting.D_STRING, ZmSetting.DEDUPE_NONE];
ZmSetting.INIT[ZmSetting.FORWARD_INCLUDE_ORIG]			= ["liquidPrefForwardIncludeOriginalText", ZmSetting.T_PREF, ZmSetting.D_STRING, ZmSetting.INCLUDE];
ZmSetting.INIT[ZmSetting.GROUP_MAIL_BY]					= ["liquidPrefGroupMailBy", ZmSetting.T_PREF, ZmSetting.D_STRING, ZmSetting.GROUP_BY_MESSAGE];
ZmSetting.INIT[ZmSetting.INITIAL_SEARCH]				= ["liquidPrefMailInitialSearch", ZmSetting.T_PREF, ZmSetting.D_STRING, "in:inbox"];
ZmSetting.INIT[ZmSetting.NEW_WINDOW_COMPOSE]			= ["liquidPrefComposeInNewWindow", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.NOTIF_ENABLED]					= ["liquidPrefNewMailNotificationEnabled", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.NOTIF_ADDRESS]					= ["liquidPrefNewMailNotificationAddress", ZmSetting.T_PREF];
ZmSetting.INIT[ZmSetting.PAGE_SIZE]						= ["liquidPrefMailItemsPerPage", ZmSetting.T_PREF, ZmSetting.D_INT, 25];
ZmSetting.INIT[ZmSetting.POLLING_INTERVAL]				= ["liquidPrefMailPollingInterval", ZmSetting.T_PREF, ZmSetting.D_LDAP_TIME, 300];
ZmSetting.INIT[ZmSetting.REPLY_INCLUDE_ORIG]			= ["liquidPrefReplyIncludeOriginalText", ZmSetting.T_PREF, ZmSetting.D_STRING, ZmSetting.INCLUDE];
ZmSetting.INIT[ZmSetting.REPLY_PREFIX]					= ["liquidPrefForwardReplyPrefixChar", ZmSetting.T_PREF, ZmSetting.D_STRING, ">"];
ZmSetting.INIT[ZmSetting.REPLY_TO_ADDRESS]				= ["liquidPrefReplyToAddress", ZmSetting.T_PREF];
ZmSetting.INIT[ZmSetting.SAVE_TO_SENT]					= ["liquidPrefSaveToSent", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.SENT_FOLDER_NAME]				= ["liquidPrefSentMailFolder", ZmSetting.T_PREF, ZmSetting.D_STRING, "sent"];
ZmSetting.INIT[ZmSetting.SHOW_FRAGMENTS]				= ["liquidPrefShowFragments", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.SIGNATURE]						= ["liquidPrefMailSignature", ZmSetting.T_PREF];
ZmSetting.INIT[ZmSetting.SIGNATURE_ENABLED]				= ["liquidPrefMailSignatureEnabled", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.SIGNATURE_STYLE]				= ["liquidPrefMailSignatureStyle", ZmSetting.T_PREF, ZmSetting.D_STRING, ZmSetting.SIG_OUTLOOK];
ZmSetting.INIT[ZmSetting.USE_KEYBOARD_SHORTCUTS]		= ["liquidPrefUseKeyboardShortcuts", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.VACATION_MSG]					= ["liquidPrefOutOfOfficeReply", ZmSetting.T_PREF];
ZmSetting.INIT[ZmSetting.VACATION_MSG_ENABLED]			= ["liquidPrefOutOfOfficeReplyEnabled", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.VIEW_AS_HTML]					= ["liquidPrefMessageViewHtmlPreferred", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, false];

ZmSetting.prototype.toString =
function() {
	return this.name + ": " + this.value;
};

/**
* Returns the current value of this setting.
*
* @param key 			optional key for use by hash table data type
*/
ZmSetting.prototype.getValue =
function(key) {
	if (this.value != null)
		return key ? this.value[key] : this.value;
	else if (this.defaultValue != null)
		return key ? this.defaultValue[key] : this.defaultValue;
	else
		return null;
};

/**
* Sets the current value of this setting, performing any necessary data type conversion.
*
* @param value			the new value for the setting
* @param key 			optional key for use by hash table data type
* @param setDefault		if true, also set the default value
*/
ZmSetting.prototype.setValue =
function(value, key, setDefault) {
	if (this.dataType == ZmSetting.D_STRING) {
		this.value = value;
	} else if (this.dataType == ZmSetting.D_INT) {
		this.value = parseInt(value);
		if (isNaN(this.value)) // revert to string if NaN
			this.value = value;
	} else if (this.dataType == ZmSetting.D_BOOLEAN) {
		if (typeof(value) == "string")
			this.value = (value.toLowerCase() == "true");
		else
			this.value = value;
	} else if (this.dataType == ZmSetting.D_LDAP_TIME) {
		var lastChar = (value.toLowerCase()).charAt(value.length-1);
		var num = parseInt(value);
		// convert to seconds
		if (lastChar == 'd') {
			this.value = num * 24 * 60 * 60;
		} else if (lastChar == 'h') {
			this.value = num * 60 * 60;
		} else if (lastChar == 'm') {
			this.value = num * 60;
		} else {
			this.value = num;	// default
		}
	} else if (this.dataType == ZmSetting.D_HASH_TABLE) {
		if (key) {
			this.value[key] = value;
		}
	}

	if (setDefault) {
		if (key)
			this.defaultValue[key] = this.value[key];
		else
			this.defaultValue = this.value;
	}
};

ZmSetting.prototype.notify =
function(event, details) {
	if (this.settings._evtMgr.isListenerRegistered(ZmEvent.L_MODIFY)) {
		this.settings._evt.set(event, this);
		this.settings._evt.setDetails(details);
		this.settings._evtMgr.notifyListeners(ZmEvent.L_MODIFY, this.settings._evt);
	}
};

ZmSetting.prototype.notifyModify = 
function(obj) {
	if (this.id == ZmSetting.QUOTA_USED && obj._name == "mbx") {
		this.setValue(obj.s);
		this.notify(ZmEvent.E_MODIFY);
	}
};
