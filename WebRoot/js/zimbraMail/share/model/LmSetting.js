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
function LmSetting(id, name, type, dataType, defaultValue, settings) {

	if (arguments.length == 0) return;
	LmModel.call(this, true);
	
	this.id = id;
	this.name = name;
	this.type = type;
	this.dataType = dataType ? dataType : LmSetting.D_STRING;
	this.defaultValue = defaultValue;
	this.settings = settings;
	
	if (this.dataType == LmSetting.D_HASH_TABLE) {
		this.value = new Object();
		this.defaultValue = new Object();
	} else {
		this.value = null;
	}
}

LmSetting.prototype = new LmModel;
LmSetting.prototype.constructor = LmSetting;

LmSetting.CAL_DAY			= "day";
LmSetting.CAL_MONTH			= "month";
LmSetting.CAL_WEEK			= "week";
LmSetting.CAL_WORK_WEEK		= "workWeek";
LmSetting.COMPOSE_TEXT 		= "text";					// liquidPrefComposeFormat
LmSetting.COMPOSE_HTML 		= "html";
LmSetting.CV_CARDS			= "cards"; 					// liquidPrefContactsInitialView
LmSetting.CV_LIST			= "list";
LmSetting.GROUP_BY_CONV		= "conversation";			// liquidPrefGroupMailBy
LmSetting.GROUP_BY_MESSAGE	= "message";
LmSetting.INCLUDE_NONE		= "includeNone";			// liquidPrefForwardIncludeOriginalText
LmSetting.INCLUDE			= "includeBody";
LmSetting.INCLUDE_PREFIX	= "includeBodyWithPrefix";
LmSetting.INCLUDE_ATTACH	= "includeAsAttachment";
LmSetting.INCLUDE_SMART		= "includeSmart";
LmSetting.DEDUPE_NONE		= "dedupeNone";				// liquidPrefDedupeMessagesSentToSelf
LmSetting.DEDUPE_SECOND		= "secondCopyifOnToOrCC";
LmSetting.DEDUPE_INBOX		= "moveSentMessageToInbox";
LmSetting.DEDUPE_ALL		= "dedupeAll";
LmSetting.SIG_INTERNET		= "internet";				// liquidPrefMailSignatureStyle
LmSetting.SIG_OUTLOOK		= "outlook";

// Constants for various setting types. A setting can represent configuration data, a COS attribute, or a user preference.
// Any setting added here must also be added to INIT below.
var i = 1;

// CONFIG SETTINGS
LmSetting.AC_TIMER_INTERVAL				= i++;
LmSetting.BRANCH						= i++;
LmSetting.CONFIG_PATH					= i++;
LmSetting.CSFE_MSG_FETCHER_URI			= i++;
LmSetting.CSFE_SERVER_URI				= i++;
LmSetting.CSFE_UPLOAD_URI				= i++;
LmSetting.CSFE_EXPORT_URI 				= i++;
LmSetting.FORCE_CAL_OFF					= i++;
LmSetting.HELP_URI						= i++;
LmSetting.LOGO_URI						= i++;
LmSetting.USE_XML						= i++;

// IDs FOR HTML COMPONENTS IN THE SKIN
LmSetting.SKIN_APP_BOTTOM_TOOLBAR_ID	= i++;
LmSetting.SKIN_APP_CHOOSER_ID			= i++;
LmSetting.SKIN_APP_MAIN_ID				= i++;
LmSetting.SKIN_APP_TOP_TOOLBAR_ID		= i++;
LmSetting.SKIN_CURRENT_APP_ID			= i++;
LmSetting.SKIN_LOGO_ID					= i++;
LmSetting.SKIN_SASH_ID					= i++;
LmSetting.SKIN_SEARCH_BUILDER_ID		= i++;
LmSetting.SKIN_SEARCH_BUILDER_TOOLBAR_ID= i++;
LmSetting.SKIN_SEARCH_BUILDER_TR_ID		= i++;
LmSetting.SKIN_SEARCH_ID				= i++;
LmSetting.SKIN_SHELL_ID					= i++;
LmSetting.SKIN_STATUS_ID				= i++;
LmSetting.SKIN_TREE_ID					= i++;
LmSetting.SKIN_TREE_FOOTER_ID			= i++;
LmSetting.SKIN_USER_INFO_ID				= i++;

// COS SETTINGS
LmSetting.BROWSE_ENABLED				= i++;
LmSetting.CALENDAR_ENABLED				= i++;
LmSetting.CHANGE_PASSWORD_ENABLED		= i++;
LmSetting.CONTACTS_ENABLED				= i++;
LmSetting.CONVERSATIONS_ENABLED			= i++;
LmSetting.DISPLAY_NAME					= i++;
LmSetting.FILTERS_ENABLED				= i++;
LmSetting.GAL_ENABLED					= i++;
LmSetting.HTML_COMPOSE_ENABLED 			= i++;
LmSetting.IDLE_SESSION_TIMEOUT 			= i++;
LmSetting.INITIAL_SEARCH_ENABLED		= i++;
LmSetting.MAX_CONTACTS					= i++;
LmSetting.MIN_POLLING_INTERVAL			= i++;
LmSetting.QUOTA							= i++;
LmSetting.SAVED_SEARCHES_ENABLED		= i++;
LmSetting.TAGGING_ENABLED				= i++;
// user metadata (included with COS since the user can't change them)
LmSetting.QUOTA_USED					= i++;
LmSetting.TOKEN_LIFETIME				= i++;
LmSetting.USERNAME						= i++;

// CLIENT SIDE FEATURE SUPPORT
LmSetting.ATT_VIEW_ENABLED				= i++;
LmSetting.EVAL_ENABLED 					= i++;
LmSetting.HELP_ENABLED					= i++;
LmSetting.IM_ENABLED					= i++;
LmSetting.MIXED_VIEW_ENABLED			= i++;
LmSetting.NOTES_ENABLED					= i++;
LmSetting.PREFS_ENABLED					= i++;
LmSetting.PRINT_ENABLED					= i++;
LmSetting.REPLY_MENU_ENABLED			= i++;
LmSetting.SAVE_DRAFT_ENABLED			= i++;
LmSetting.SEARCH_ENABLED				= i++;
LmSetting.SKI_HACK_ENABLED				= i++;
LmSetting.SPAM_ENABLED					= i++;
LmSetting.USER_FOLDERS_ENABLED			= i++;

// USER PREFERENCES (mutable)

// address book preferences
LmSetting.AUTO_ADD_ADDRESS				= i++;
LmSetting.CONTACTS_PER_PAGE 			= i++;
LmSetting.CONTACTS_VIEW					= i++;
LmSetting.EXPORT 						= i++;
LmSetting.IMPORT 						= i++;
// calendar preferences
LmSetting.CAL_SHOW_TIMEZONE				= i++;
LmSetting.CALENDAR_INITIAL_VIEW			= i++;
LmSetting.DEFAULT_CALENDAR_TIMEZONE		= i++;
// general preferences
LmSetting.PASSWORD						= i++;
LmSetting.SEARCH_INCLUDES_SPAM			= i++;
LmSetting.SEARCH_INCLUDES_TRASH			= i++;
LmSetting.SHOW_SEARCH_STRING			= i++;
LmSetting.SORTING_PREF 					= i++;
// mail preferences
LmSetting.COMPOSE_AS_FORMAT				= i++;
LmSetting.COMPOSE_SAME_FORMAT 			= i++;
LmSetting.DEDUPE_MSG_TO_SELF			= i++;
LmSetting.FORWARD_INCLUDE_ORIG			= i++;
LmSetting.GROUP_MAIL_BY					= i++;
LmSetting.INITIAL_SEARCH				= i++;
LmSetting.NEW_WINDOW_COMPOSE			= i++;
LmSetting.NOTIF_ADDRESS					= i++;
LmSetting.NOTIF_ENABLED					= i++;
LmSetting.PAGE_SIZE						= i++;
LmSetting.POLLING_INTERVAL				= i++;
LmSetting.REPLY_INCLUDE_ORIG			= i++;
LmSetting.REPLY_PREFIX					= i++;
LmSetting.REPLY_TO_ADDRESS				= i++;
LmSetting.SAVE_TO_SENT					= i++;
LmSetting.SENT_FOLDER_NAME				= i++;
LmSetting.SHOW_FRAGMENTS				= i++;
LmSetting.SIGNATURE						= i++;
LmSetting.SIGNATURE_ENABLED				= i++;
LmSetting.SIGNATURE_STYLE				= i++;
LmSetting.USE_KEYBOARD_SHORTCUTS		= i++;
LmSetting.VACATION_MSG					= i++;
LmSetting.VACATION_MSG_ENABLED			= i++;
LmSetting.VIEW_AS_HTML					= i++;


LmSetting.MAX_INDEX 	= i-1;

// setting types
LmSetting.T_CONFIG		= 1;
LmSetting.T_PREF		= 2;
LmSetting.T_COS			= 3;

// setting data types
LmSetting.D_STRING		= 1; // default type
LmSetting.D_INT			= 2;
LmSetting.D_BOOLEAN		= 3;
LmSetting.D_LDAP_TIME 	= 4;
LmSetting.D_HASH_TABLE 	= 5;


// initialization for settings: [name, type, data type, default value]
LmSetting.INIT = new Object();

// CONFIG SETTINGS
LmSetting.INIT[LmSetting.AC_TIMER_INTERVAL]				= [null, LmSetting.T_CONFIG, LmSetting.D_INT, 300];
LmSetting.INIT[LmSetting.BRANCH]						= [null, LmSetting.T_CONFIG, LmSetting.D_STRING, "main"];
LmSetting.INIT[LmSetting.CONFIG_PATH]					= [null, LmSetting.T_CONFIG, LmSetting.D_STRING, "/liquid/js/liquidMail/config"];
LmSetting.INIT[LmSetting.CSFE_MSG_FETCHER_URI]			= [null, LmSetting.T_CONFIG, LmSetting.D_STRING];
LmSetting.INIT[LmSetting.CSFE_SERVER_URI]				= [null, LmSetting.T_CONFIG, LmSetting.D_STRING];
LmSetting.INIT[LmSetting.CSFE_UPLOAD_URI]				= [null, LmSetting.T_CONFIG, LmSetting.D_STRING];
LmSetting.INIT[LmSetting.CSFE_EXPORT_URI]				= [null, LmSetting.T_CONFIG, LmSetting.D_STRING];
LmSetting.INIT[LmSetting.FORCE_CAL_OFF]					= [null, LmSetting.T_CONFIG, LmSetting.D_BOOLEAN, false];
LmSetting.INIT[LmSetting.HELP_URI]						= [null, LmSetting.T_CONFIG, LmSetting.D_STRING, "/liquid/help/Zimbra_User_Help.htm"];
LmSetting.INIT[LmSetting.LOGO_URI]						= [null, LmSetting.T_CONFIG, LmSetting.D_STRING, "http://www.zimbra.com"];
LmSetting.INIT[LmSetting.USE_XML]						= [null, LmSetting.T_CONFIG, LmSetting.D_BOOLEAN, false];

// IDs FOR HTML COMPONENTS IN THE SKIN
LmSetting.INIT[LmSetting.SKIN_APP_BOTTOM_TOOLBAR_ID]	= [null, LmSetting.T_CONFIG, LmSetting.D_STRING, "skin_container_app_bottom_toolbar"];
LmSetting.INIT[LmSetting.SKIN_APP_CHOOSER_ID]			= [null, LmSetting.T_CONFIG, LmSetting.D_STRING, "skin_container_app_chooser"];
LmSetting.INIT[LmSetting.SKIN_APP_MAIN_ID]				= [null, LmSetting.T_CONFIG, LmSetting.D_STRING, "skin_container_app_main"];
LmSetting.INIT[LmSetting.SKIN_APP_TOP_TOOLBAR_ID]		= [null, LmSetting.T_CONFIG, LmSetting.D_STRING, "skin_container_app_top_toolbar"];
LmSetting.INIT[LmSetting.SKIN_CURRENT_APP_ID]			= [null, LmSetting.T_CONFIG, LmSetting.D_STRING, "skin_container_current_app"];
LmSetting.INIT[LmSetting.SKIN_LOGO_ID]					= [null, LmSetting.T_CONFIG, LmSetting.D_STRING, "skin_container_logo"];
LmSetting.INIT[LmSetting.SKIN_SASH_ID]					= [null, LmSetting.T_CONFIG, LmSetting.D_STRING, "skin_container_tree_app_sash"];
LmSetting.INIT[LmSetting.SKIN_SEARCH_BUILDER_ID]		= [null, LmSetting.T_CONFIG, LmSetting.D_STRING, "skin_container_search_builder"];
LmSetting.INIT[LmSetting.SKIN_SEARCH_BUILDER_TOOLBAR_ID]= [null, LmSetting.T_CONFIG, LmSetting.D_STRING, "skin_container_search_builder_toolbar"];
LmSetting.INIT[LmSetting.SKIN_SEARCH_BUILDER_TR_ID]		= [null, LmSetting.T_CONFIG, LmSetting.D_STRING, "skin_tr_search_builder"];
LmSetting.INIT[LmSetting.SKIN_SEARCH_ID]				= [null, LmSetting.T_CONFIG, LmSetting.D_STRING, "skin_container_search"];
LmSetting.INIT[LmSetting.SKIN_SHELL_ID]					= [null, LmSetting.T_CONFIG, LmSetting.D_STRING, "skin_outer"];
LmSetting.INIT[LmSetting.SKIN_STATUS_ID]				= [null, LmSetting.T_CONFIG, LmSetting.D_STRING, "skin_container_status"];
LmSetting.INIT[LmSetting.SKIN_TREE_ID]					= [null, LmSetting.T_CONFIG, LmSetting.D_STRING, "skin_container_tree"];
LmSetting.INIT[LmSetting.SKIN_TREE_FOOTER_ID]			= [null, LmSetting.T_CONFIG, LmSetting.D_STRING, "skin_container_tree_footer"];
LmSetting.INIT[LmSetting.SKIN_USER_INFO_ID]				= [null, LmSetting.T_CONFIG, LmSetting.D_STRING, "skin_container_quota"];

// COS SETTINGS
LmSetting.INIT[LmSetting.BROWSE_ENABLED]				= ["liquidFeatureAdvancedSearchEnabled", LmSetting.T_COS, LmSetting.D_BOOLEAN, false];
LmSetting.INIT[LmSetting.CALENDAR_ENABLED]				= ["liquidFeatureCalendarEnabled", LmSetting.T_COS, LmSetting.D_BOOLEAN, false];
LmSetting.INIT[LmSetting.CHANGE_PASSWORD_ENABLED]		= ["liquidFeatureChangePasswordEnabled", LmSetting.T_COS, LmSetting.D_BOOLEAN, false];
LmSetting.INIT[LmSetting.CONTACTS_ENABLED]				= ["liquidFeatureContactsEnabled", LmSetting.T_COS, LmSetting.D_BOOLEAN, false];
LmSetting.INIT[LmSetting.CONVERSATIONS_ENABLED]			= ["liquidFeatureConversationsEnabled", LmSetting.T_COS, LmSetting.D_BOOLEAN, false];
LmSetting.INIT[LmSetting.DISPLAY_NAME]					= ["displayName", LmSetting.T_COS, LmSetting.D_STRING];
LmSetting.INIT[LmSetting.FILTERS_ENABLED]				= ["liquidFeatureFiltersEnabled", LmSetting.T_COS, LmSetting.D_BOOLEAN, false];
LmSetting.INIT[LmSetting.GAL_ENABLED]					= ["liquidFeatureGalEnabled", LmSetting.T_COS, LmSetting.D_BOOLEAN, true];
LmSetting.INIT[LmSetting.HTML_COMPOSE_ENABLED] 			= ["liquidFeatureHtmlComposeEnabled", LmSetting.T_COS, LmSetting.D_BOOLEAN, true];
LmSetting.INIT[LmSetting.IDLE_SESSION_TIMEOUT] 			= ["liquidMailIdleSessionTimeout", LmSetting.T_COS, LmSetting.D_LDAP_TIME, 0];
LmSetting.INIT[LmSetting.INITIAL_SEARCH_ENABLED]		= ["liquidFeatureInitialSearchPreferenceEnabled", LmSetting.T_COS, LmSetting.D_BOOLEAN, false];
LmSetting.INIT[LmSetting.MAX_CONTACTS]					= ["liquidContactMaxNumEntries", LmSetting.T_COS, LmSetting.D_INT, 0];
LmSetting.INIT[LmSetting.MIN_POLLING_INTERVAL]			= ["liquidMailMinPollingInterval", LmSetting.T_COS, LmSetting.D_LDAP_TIME, 300];
LmSetting.INIT[LmSetting.QUOTA]							= ["liquidMailQuota", LmSetting.T_COS, LmSetting.D_INT, 0];
LmSetting.INIT[LmSetting.SAVED_SEARCHES_ENABLED]		= ["liquidFeatureSavedSearchesEnabled", LmSetting.T_COS, LmSetting.D_BOOLEAN, false];
LmSetting.INIT[LmSetting.TAGGING_ENABLED]				= ["liquidFeatureTaggingEnabled", LmSetting.T_COS, LmSetting.D_BOOLEAN, false];
// user metadata (included with COS since the user can't change them)
LmSetting.INIT[LmSetting.QUOTA_USED]					= [null, LmSetting.T_COS, LmSetting.D_INT];
LmSetting.INIT[LmSetting.TOKEN_LIFETIME]				= [null, LmSetting.T_COS, LmSetting.D_INT];
LmSetting.INIT[LmSetting.USERNAME]						= [null, LmSetting.T_COS, LmSetting.D_STRING];

// CLIENT SIDE FEATURE SUPPORT
LmSetting.INIT[LmSetting.ATT_VIEW_ENABLED]				= [null, LmSetting.T_COS, LmSetting.D_BOOLEAN, false];
LmSetting.INIT[LmSetting.EVAL_ENABLED] 			 		= [null, LmSetting.T_COS, LmSetting.D_BOOLEAN, false];
LmSetting.INIT[LmSetting.HELP_ENABLED]					= [null, LmSetting.T_COS, LmSetting.D_BOOLEAN, true];
LmSetting.INIT[LmSetting.IM_ENABLED]					= [null, LmSetting.T_COS, LmSetting.D_BOOLEAN, false];
LmSetting.INIT[LmSetting.MIXED_VIEW_ENABLED]			= [null, LmSetting.T_COS, LmSetting.D_BOOLEAN, true];
LmSetting.INIT[LmSetting.NOTES_ENABLED]					= [null, LmSetting.T_COS, LmSetting.D_BOOLEAN, false];
LmSetting.INIT[LmSetting.PREFS_ENABLED]					= [null, LmSetting.T_COS, LmSetting.D_BOOLEAN, true];
LmSetting.INIT[LmSetting.PRINT_ENABLED]					= [null, LmSetting.T_COS, LmSetting.D_BOOLEAN, true];
LmSetting.INIT[LmSetting.REPLY_MENU_ENABLED]			= [null, LmSetting.T_COS, LmSetting.D_BOOLEAN, false];
LmSetting.INIT[LmSetting.SAVE_DRAFT_ENABLED]			= [null, LmSetting.T_COS, LmSetting.D_BOOLEAN, true];
LmSetting.INIT[LmSetting.SEARCH_ENABLED]				= [null, LmSetting.T_COS, LmSetting.D_BOOLEAN, true];
LmSetting.INIT[LmSetting.SKI_HACK_ENABLED]				= [null, LmSetting.T_COS, LmSetting.D_BOOLEAN, false];
LmSetting.INIT[LmSetting.SPAM_ENABLED]					= [null, LmSetting.T_COS, LmSetting.D_BOOLEAN, true];
LmSetting.INIT[LmSetting.USER_FOLDERS_ENABLED]			= [null, LmSetting.T_COS, LmSetting.D_BOOLEAN, true];

// USER PREFERENCES (mutable)

// address book preferences
LmSetting.INIT[LmSetting.AUTO_ADD_ADDRESS]				= ["liquidPrefAutoAddAddressEnabled", LmSetting.T_PREF, LmSetting.D_BOOLEAN, false];
LmSetting.INIT[LmSetting.CONTACTS_PER_PAGE] 			= ["liquidPrefContactsPerPage", LmSetting.T_PREF, LmSetting.D_INT, 25];
LmSetting.INIT[LmSetting.CONTACTS_VIEW]					= ["liquidPrefContactsInitialView", LmSetting.T_PREF, LmSetting.D_STRING, LmSetting.CV_LIST];
LmSetting.INIT[LmSetting.EXPORT] 						= [null, LmSetting.T_PREF];
LmSetting.INIT[LmSetting.IMPORT] 						= [null, LmSetting.T_PREF];
// calendar preferences
LmSetting.INIT[LmSetting.CAL_SHOW_TIMEZONE]	 			= ["liquidPrefUseTimeZoneListInCalendar", LmSetting.T_PREF, LmSetting.D_BOOLEAN, false];
LmSetting.INIT[LmSetting.CALENDAR_INITIAL_VIEW]			= ["liquidPrefCalendarInitialView", LmSetting.T_PREF, LmSetting.D_STRING, LmSetting.CAL_DAY];
LmSetting.INIT[LmSetting.DEFAULT_CALENDAR_TIMEZONE]		= ["liquidPrefTimeZoneId", LmSetting.T_PREF, LmSetting.D_STRING];
// general preferences
LmSetting.INIT[LmSetting.PASSWORD]						= [null, LmSetting.T_PREF];
LmSetting.INIT[LmSetting.SEARCH_INCLUDES_SPAM]			= ["liquidPrefIncludeSpamInSearch", LmSetting.T_PREF, LmSetting.D_BOOLEAN, false];
LmSetting.INIT[LmSetting.SEARCH_INCLUDES_TRASH]			= ["liquidPrefIncludeTrashInSearch", LmSetting.T_PREF, LmSetting.D_BOOLEAN, false];
LmSetting.INIT[LmSetting.SHOW_SEARCH_STRING]			= ["liquidPrefShowSearchString", LmSetting.T_PREF, LmSetting.D_BOOLEAN, false];
LmSetting.INIT[LmSetting.SORTING_PREF] 					= [null, LmSetting.T_PREF, LmSetting.D_HASH_TABLE];
// mail preferences
LmSetting.INIT[LmSetting.COMPOSE_AS_FORMAT] 			= ["liquidPrefComposeFormat", LmSetting.T_PREF, LmSetting.D_STRING, LmSetting.COMPOSE_TEXT];
LmSetting.INIT[LmSetting.COMPOSE_SAME_FORMAT] 			= ["liquidPrefForwardReplyInOriginalFormat", LmSetting.T_PREF, LmSetting.D_BOOLEAN, false];
LmSetting.INIT[LmSetting.DEDUPE_MSG_TO_SELF]			= ["liquidPrefDedupeMessagesSentToSelf", LmSetting.T_PREF, LmSetting.D_STRING, LmSetting.DEDUPE_NONE];
LmSetting.INIT[LmSetting.FORWARD_INCLUDE_ORIG]			= ["liquidPrefForwardIncludeOriginalText", LmSetting.T_PREF, LmSetting.D_STRING, LmSetting.INCLUDE];
LmSetting.INIT[LmSetting.GROUP_MAIL_BY]					= ["liquidPrefGroupMailBy", LmSetting.T_PREF, LmSetting.D_STRING, LmSetting.GROUP_BY_MESSAGE];
LmSetting.INIT[LmSetting.INITIAL_SEARCH]				= ["liquidPrefMailInitialSearch", LmSetting.T_PREF, LmSetting.D_STRING, "in:inbox"];
LmSetting.INIT[LmSetting.NEW_WINDOW_COMPOSE]			= ["liquidPrefComposeInNewWindow", LmSetting.T_PREF, LmSetting.D_BOOLEAN, true];
LmSetting.INIT[LmSetting.NOTIF_ENABLED]					= ["liquidPrefNewMailNotificationEnabled", LmSetting.T_PREF, LmSetting.D_BOOLEAN, false];
LmSetting.INIT[LmSetting.NOTIF_ADDRESS]					= ["liquidPrefNewMailNotificationAddress", LmSetting.T_PREF];
LmSetting.INIT[LmSetting.PAGE_SIZE]						= ["liquidPrefMailItemsPerPage", LmSetting.T_PREF, LmSetting.D_INT, 25];
LmSetting.INIT[LmSetting.POLLING_INTERVAL]				= ["liquidPrefMailPollingInterval", LmSetting.T_PREF, LmSetting.D_LDAP_TIME, 300];
LmSetting.INIT[LmSetting.REPLY_INCLUDE_ORIG]			= ["liquidPrefReplyIncludeOriginalText", LmSetting.T_PREF, LmSetting.D_STRING, LmSetting.INCLUDE];
LmSetting.INIT[LmSetting.REPLY_PREFIX]					= ["liquidPrefForwardReplyPrefixChar", LmSetting.T_PREF, LmSetting.D_STRING, ">"];
LmSetting.INIT[LmSetting.REPLY_TO_ADDRESS]				= ["liquidPrefReplyToAddress", LmSetting.T_PREF];
LmSetting.INIT[LmSetting.SAVE_TO_SENT]					= ["liquidPrefSaveToSent", LmSetting.T_PREF, LmSetting.D_BOOLEAN, true];
LmSetting.INIT[LmSetting.SENT_FOLDER_NAME]				= ["liquidPrefSentMailFolder", LmSetting.T_PREF, LmSetting.D_STRING, "sent"];
LmSetting.INIT[LmSetting.SHOW_FRAGMENTS]				= ["liquidPrefShowFragments", LmSetting.T_PREF, LmSetting.D_BOOLEAN, false];
LmSetting.INIT[LmSetting.SIGNATURE]						= ["liquidPrefMailSignature", LmSetting.T_PREF];
LmSetting.INIT[LmSetting.SIGNATURE_ENABLED]				= ["liquidPrefMailSignatureEnabled", LmSetting.T_PREF, LmSetting.D_BOOLEAN, false];
LmSetting.INIT[LmSetting.SIGNATURE_STYLE]				= ["liquidPrefMailSignatureStyle", LmSetting.T_PREF, LmSetting.D_STRING, LmSetting.SIG_OUTLOOK];
LmSetting.INIT[LmSetting.USE_KEYBOARD_SHORTCUTS]		= ["liquidPrefUseKeyboardShortcuts", LmSetting.T_PREF, LmSetting.D_BOOLEAN, false];
LmSetting.INIT[LmSetting.VACATION_MSG]					= ["liquidPrefOutOfOfficeReply", LmSetting.T_PREF];
LmSetting.INIT[LmSetting.VACATION_MSG_ENABLED]			= ["liquidPrefOutOfOfficeReplyEnabled", LmSetting.T_PREF, LmSetting.D_BOOLEAN, false];
LmSetting.INIT[LmSetting.VIEW_AS_HTML]					= ["liquidPrefMessageViewHtmlPreferred", LmSetting.T_PREF, LmSetting.D_BOOLEAN, false];

LmSetting.prototype.toString =
function() {
	return this.name + ": " + this.value;
};

/**
* Returns the current value of this setting.
*
* @param key 			optional key for use by hash table data type
*/
LmSetting.prototype.getValue =
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
LmSetting.prototype.setValue =
function(value, key, setDefault) {
	if (this.dataType == LmSetting.D_STRING) {
		this.value = value;
	} else if (this.dataType == LmSetting.D_INT) {
		this.value = parseInt(value);
		if (isNaN(this.value)) // revert to string if NaN
			this.value = value;
	} else if (this.dataType == LmSetting.D_BOOLEAN) {
		if (typeof(value) == "string")
			this.value = (value.toLowerCase() == "true");
		else
			this.value = value;
	} else if (this.dataType == LmSetting.D_LDAP_TIME) {
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
	} else if (this.dataType == LmSetting.D_HASH_TABLE) {
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

LmSetting.prototype.notify =
function(event, details) {
	if (this.settings._evtMgr.isListenerRegistered(LmEvent.L_MODIFY)) {
		this.settings._evt.set(event, this);
		this.settings._evt.setDetails(details);
		this.settings._evtMgr.notifyListeners(LmEvent.L_MODIFY, this.settings._evt);
	}
};

LmSetting.prototype.notifyModify = 
function(obj) {
	if (this.id == LmSetting.QUOTA_USED && obj._name == "mbx") {
		this.setValue(obj.s);
		this.notify(LmEvent.E_MODIFY);
	}
};
