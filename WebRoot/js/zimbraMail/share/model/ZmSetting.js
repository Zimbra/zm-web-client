/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

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
* 
* @param id				a unique ID
* @param name			the name of the pref or attr on the server
* @param type			config, pref, or COS
* @param dataType		string, int, or boolean
* @param defaultValue	default value
*/
function ZmSetting(id, name, type, dataType, defaultValue, settings) {

	if (arguments.length == 0) return;
	ZmModel.call(this, ZmEvent.S_SETTING);
	
	this.id = id;
	this.name = name;
	this.type = type;
	this.dataType = dataType ? dataType : ZmSetting.D_STRING;
	this.defaultValue = defaultValue;
	this.settings = settings;
	
	if (this.dataType == ZmSetting.D_HASH) {
		this.value = {};
		this.defaultValue = {};
	} else if (this.dataType == ZmSetting.D_LIST) {
		this.value = [];
		this.defaultValue = [];
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
ZmSetting.CAL_SCHEDULE		= "schedule";
ZmSetting.COMPOSE_FONT_COLOR= "#000000";	 			// zimbraPrefHtmlEditorDefaultFontColor
ZmSetting.COMPOSE_FONT_FAM 	= "Times New Roman";		// zimbraPrefHtmlEditorDefaultFontFamily
ZmSetting.COMPOSE_FONT_SIZE = "12pt"; 					// zimbraPrefHtmlEditorDefaultFontSize
ZmSetting.COMPOSE_TEXT 		= "text";					// zimbraPrefComposeFormat
ZmSetting.COMPOSE_HTML 		= "html";
ZmSetting.CV_CARDS			= "cards"; 					// zimbraPrefContactsInitialView
ZmSetting.CV_LIST			= "list";
ZmSetting.DEDUPE_NONE		= "dedupeNone";				// zimbraPrefDedupeMessagesSentToSelf
ZmSetting.DEDUPE_SECOND		= "secondCopyifOnToOrCC";
ZmSetting.DEDUPE_INBOX		= "moveSentMessageToInbox";
ZmSetting.DEDUPE_ALL		= "dedupeAll";
ZmSetting.GROUP_BY_CONV		= "conversation";			// zimbraPrefGroupMailBy
ZmSetting.GROUP_BY_MESSAGE	= "message";
ZmSetting.INCLUDE_NONE		= "includeNone";			// zimbraPrefForwardIncludeOriginalText
ZmSetting.INCLUDE			= "includeBody";
ZmSetting.INCLUDE_PREFIX	= "includeBodyWithPrefix";
ZmSetting.INCLUDE_ATTACH	= "includeAsAttachment";
ZmSetting.INCLUDE_SMART		= "includeSmart";
ZmSetting.LICENSE_BAD		= "bad";					// license status (network only)
ZmSetting.LICENSE_GOOD		= "good";
ZmSetting.LICENSE_GRACE		= "inGracePeriod";
ZmSetting.SIG_INTERNET		= "internet";				// zimbraPrefMailSignatureStyle
ZmSetting.SIG_OUTLOOK		= "outlook";

// Constants for various setting types. A setting can represent configuration data, a COS attribute, or a user preference.
// Any setting added here must also be added to INIT below.
var i = 1;

// CONFIG SETTINGS
ZmSetting.AC_TIMER_INTERVAL				= i++;
ZmSetting.ASYNC_MODE					= i++;
ZmSetting.BRANCH						= i++;
ZmSetting.CLIENT_DATETIME 				= i++;
ZmSetting.CLIENT_RELEASE 				= i++;
ZmSetting.CLIENT_VERSION				= i++;
ZmSetting.CONFIG_PATH					= i++;
ZmSetting.CSFE_MSG_FETCHER_URI			= i++;
ZmSetting.CSFE_SERVER_URI				= i++;
ZmSetting.CSFE_UPLOAD_URI				= i++;
ZmSetting.CSFE_EXPORT_URI 				= i++;
ZmSetting.FORCE_CAL_OFF					= i++;
ZmSetting.HELP_URI						= i++;
ZmSetting.LOGO_URI						= i++;
ZmSetting.LOG_REQUEST					= i++;
ZmSetting.TIMEOUT						= i++;
ZmSetting.USE_XML						= i++;

// IDs FOR HTML COMPONENTS IN THE SKIN
ZmSetting.SKIN_APP_BOTTOM_TOOLBAR_ID	= i++;
ZmSetting.SKIN_APP_CHOOSER_ID			= i++;
ZmSetting.SKIN_APP_MAIN_ID				= i++;
ZmSetting.SKIN_APP_MAIN_FULL_ID			= i++;
ZmSetting.SKIN_APP_MAIN_ROW_ID			= i++;
ZmSetting.SKIN_APP_MAIN_ROW_FULL_ID		= i++;
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
ZmSetting.SKIN_STATUS_ROW_ID			= i++;
ZmSetting.SKIN_TREE_ID					= i++;
ZmSetting.SKIN_TREE_FOOTER_ID			= i++;
ZmSetting.SKIN_USER_INFO_ID				= i++;
ZmSetting.SKIN_QUOTA_INFO_ID			= i++;

// COS SETTINGS
ZmSetting.ALLOW_ANY_FROM_ADDRESS		= i++;
ZmSetting.ALLOW_FROM_ADDRESSES			= i++;
ZmSetting.AVAILABLE_SKINS				= i++;
ZmSetting.BROWSE_ENABLED				= i++;
ZmSetting.CALENDAR_ENABLED				= i++;
ZmSetting.CHANGE_PASSWORD_ENABLED		= i++;
ZmSetting.CONTACTS_ENABLED				= i++;
ZmSetting.CONVERSATIONS_ENABLED			= i++;
ZmSetting.DISPLAY_NAME					= i++;
ZmSetting.FILTERS_ENABLED				= i++;
ZmSetting.GAL_AUTOCOMPLETE_ENABLED		= i++;
ZmSetting.GAL_ENABLED					= i++;
ZmSetting.HTML_COMPOSE_ENABLED 			= i++;
ZmSetting.IDENTITIES_ENABLED            = i++;
ZmSetting.IDLE_SESSION_TIMEOUT 			= i++;
ZmSetting.IM_ENABLED					= i++;
ZmSetting.INITIAL_SEARCH_ENABLED		= i++;
ZmSetting.MAIL_ALIASES					= i++;
ZmSetting.MAIL_ENABLED					= i++;
ZmSetting.MAX_CONTACTS					= i++;
ZmSetting.MIN_POLLING_INTERVAL			= i++;
ZmSetting.NOTEBOOK_ENABLED				= i++;
ZmSetting.NOTIF_FEATURE_ENABLED			= i++;
ZmSetting.OPTIONS_ENABLED				= i++;
ZmSetting.POP_ACCOUNTS_ENABLED          = i++;
ZmSetting.PORTAL_ENABLED				= i++;
ZmSetting.PORTAL_NAME                   = i++;
ZmSetting.PWD_MAX_LENGTH				= i++;
ZmSetting.PWD_MIN_LENGTH				= i++;
ZmSetting.QUOTA							= i++;
ZmSetting.SAVED_SEARCHES_ENABLED		= i++;
ZmSetting.SHARING_ENABLED				= i++;
ZmSetting.SKIN_CHANGE_ENABLED			= i++;
ZmSetting.TAGGING_ENABLED				= i++;
ZmSetting.TASKS_ENABLED					= i++;
ZmSetting.VACATION_MSG_FEATURE_ENABLED	= i++;
ZmSetting.VIEW_ATTACHMENT_AS_HTML 		= i++;
ZmSetting.VOICEMAIL_ENABLED				= i++;

// USER METADATA
ZmSetting.LICENSE_STATUS				= i++;
ZmSetting.QUOTA_USED					= i++;
ZmSetting.TOKEN_LIFETIME				= i++;
ZmSetting.USERID						= i++;
ZmSetting.USERNAME						= i++;

// CLIENT SIDE FEATURE SUPPORT
ZmSetting.ATT_VIEW_ENABLED				= i++;
ZmSetting.EVAL_ENABLED 					= i++;
ZmSetting.FEED_ENABLED					= i++;
ZmSetting.HELP_ENABLED					= i++;
ZmSetting.MAIL_FORWARDING_ENABLED		= i++;
ZmSetting.MIXED_VIEW_ENABLED			= i++;
ZmSetting.NOTES_ENABLED					= i++;
ZmSetting.PRINT_ENABLED					= i++;
ZmSetting.REPLY_MENU_ENABLED			= i++;
ZmSetting.FORWARD_MENU_ENABLED 			= i++;
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
ZmSetting.GAL_AUTOCOMPLETE				= i++;
ZmSetting.GAL_AUTOCOMPLETE_SESSION		= i++;
ZmSetting.IMPORT 						= i++;

// calendar preferences
ZmSetting.CAL_ALWAYS_SHOW_MINI_CAL		= i++;
ZmSetting.CAL_FIRST_DAY_OF_WEEK 		= i++;
ZmSetting.CAL_REMINDER_WARNING_TIME		= i++;
ZmSetting.CAL_SHOW_TIMEZONE				= i++;
ZmSetting.CAL_USE_QUICK_ADD 			= i++;
ZmSetting.CALENDAR_INITIAL_VIEW			= i++;
ZmSetting.DEFAULT_CALENDAR_TIMEZONE		= i++;

// general preferences
ZmSetting.PASSWORD						= i++;
ZmSetting.SEARCH_INCLUDES_SPAM			= i++;
ZmSetting.SEARCH_INCLUDES_TRASH			= i++;
ZmSetting.SHOW_SEARCH_STRING			= i++;
ZmSetting.SKIN_NAME						= i++;
ZmSetting.SORTING_PREF 					= i++;

// mail preferences
ZmSetting.COMPOSE_AS_FORMAT				= i++;
ZmSetting.COMPOSE_INIT_FONT_COLOR 		= i++;
ZmSetting.COMPOSE_INIT_FONT_FAMILY 		= i++;
ZmSetting.COMPOSE_INIT_FONT_SIZE 		= i++;
ZmSetting.COMPOSE_SAME_FORMAT 			= i++;
ZmSetting.DEDUPE_MSG_TO_SELF			= i++;
ZmSetting.FORWARD_INCLUDE_ORIG			= i++;
ZmSetting.GROUP_MAIL_BY					= i++;
ZmSetting.INITIAL_GROUP_MAIL_BY			= i++;
ZmSetting.INITIAL_SEARCH				= i++;
ZmSetting.MAIL_LOCAL_DELIVERY_DISABLED	= i++;
ZmSetting.MAIL_FORWARDING_ADDRESS		= i++;
ZmSetting.NEW_WINDOW_COMPOSE			= i++;
ZmSetting.NOTIF_ADDRESS					= i++;
ZmSetting.NOTIF_ENABLED					= i++;
ZmSetting.PAGE_SIZE						= i++;
ZmSetting.POLLING_INTERVAL				= i++;
ZmSetting.READING_PANE_ENABLED			= i++;
ZmSetting.REPLY_INCLUDE_ORIG			= i++;
ZmSetting.REPLY_PREFIX					= i++;
ZmSetting.REPLY_TO_ADDRESS				= i++;
ZmSetting.SAVE_TO_SENT					= i++;
ZmSetting.SENT_FOLDER_NAME				= i++;
ZmSetting.SHORTCUTS						= i++;
ZmSetting.SHOW_BCC						= i++;
ZmSetting.SHOW_FRAGMENTS				= i++;
ZmSetting.SIGNATURE						= i++;
ZmSetting.SIGNATURE_ENABLED				= i++;
ZmSetting.SIGNATURE_STYLE				= i++;
ZmSetting.USE_KEYBOARD_SHORTCUTS		= i++;
ZmSetting.VACATION_MSG					= i++;
ZmSetting.VACATION_MSG_ENABLED			= i++;
ZmSetting.VIEW_AS_HTML					= i++;


ZmSetting.MAX_INDEX 	= i - 1;
delete i;

// setting types
ZmSetting.T_CONFIG		= 1;
ZmSetting.T_PREF		= 2;
ZmSetting.T_COS			= 3;

// setting data types
ZmSetting.D_STRING		= 1; // default type
ZmSetting.D_INT			= 2;
ZmSetting.D_BOOLEAN		= 3;
ZmSetting.D_LDAP_TIME 	= 4;
ZmSetting.D_HASH 		= 5;
ZmSetting.D_LIST		= 6;


// initialization for settings: [name, type, data type, default value]
ZmSetting.INIT = {};

// CONFIG SETTINGS
ZmSetting.INIT[ZmSetting.AC_TIMER_INTERVAL]				= [null, ZmSetting.T_CONFIG, ZmSetting.D_INT, 300];
ZmSetting.INIT[ZmSetting.ASYNC_MODE]					= [null, ZmSetting.T_CONFIG, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.BRANCH]						= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "main"];
ZmSetting.INIT[ZmSetting.CLIENT_DATETIME] 				= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "@buildDateTime@"]; // this gets replaced during deploy
ZmSetting.INIT[ZmSetting.CLIENT_RELEASE]				= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "@buildRelease@"];  // this gets replaced during deploy
ZmSetting.INIT[ZmSetting.CLIENT_VERSION]				= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "@buildVersion@"];  // this gets replaced during deploy
ZmSetting.INIT[ZmSetting.CONFIG_PATH]					= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, appContextPath+"/js/zimbraMail/config"];
ZmSetting.INIT[ZmSetting.CSFE_MSG_FETCHER_URI]			= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING];
ZmSetting.INIT[ZmSetting.CSFE_SERVER_URI]				= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING];
ZmSetting.INIT[ZmSetting.CSFE_UPLOAD_URI]				= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING];
ZmSetting.INIT[ZmSetting.CSFE_EXPORT_URI]				= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING];
ZmSetting.INIT[ZmSetting.FORCE_CAL_OFF]					= [null, ZmSetting.T_CONFIG, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.HELP_URI]						= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, appContextPath+"/help/Zimbra_User_Help.htm"];
ZmSetting.INIT[ZmSetting.LOG_REQUEST]					= [null, ZmSetting.T_CONFIG, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.LOGO_URI]						= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "http://www.zimbra.com"];
ZmSetting.INIT[ZmSetting.TIMEOUT]						= [null, ZmSetting.T_CONFIG, ZmSetting.D_INT, 30];
ZmSetting.INIT[ZmSetting.USE_XML]						= [null, ZmSetting.T_CONFIG, ZmSetting.D_BOOLEAN, false];

// IDs FOR HTML COMPONENTS IN THE SKIN
ZmSetting.INIT[ZmSetting.SKIN_APP_BOTTOM_TOOLBAR_ID]	= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "skin_container_app_bottom_toolbar"];
ZmSetting.INIT[ZmSetting.SKIN_APP_CHOOSER_ID]			= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "skin_container_app_chooser"];
ZmSetting.INIT[ZmSetting.SKIN_APP_MAIN_ID]				= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "skin_container_app_main"];
ZmSetting.INIT[ZmSetting.SKIN_APP_MAIN_FULL_ID]			= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "skin_container_app_main_full"];
ZmSetting.INIT[ZmSetting.SKIN_APP_MAIN_ROW_ID]			= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "skin_tr_main"];
ZmSetting.INIT[ZmSetting.SKIN_APP_MAIN_ROW_FULL_ID]		= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "skin_tr_main_full"];
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
ZmSetting.INIT[ZmSetting.SKIN_STATUS_ROW_ID]			= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "skin_tr_status"];
ZmSetting.INIT[ZmSetting.SKIN_TREE_ID]					= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "skin_container_tree"];
ZmSetting.INIT[ZmSetting.SKIN_TREE_FOOTER_ID]			= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "skin_container_tree_footer"];
ZmSetting.INIT[ZmSetting.SKIN_USER_INFO_ID]				= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "skin_container_username"];
ZmSetting.INIT[ZmSetting.SKIN_QUOTA_INFO_ID]			= [null, ZmSetting.T_CONFIG, ZmSetting.D_STRING, "skin_container_quota"];

// COS SETTINGS
ZmSetting.INIT[ZmSetting.ALLOW_ANY_FROM_ADDRESS]		= ["zimbraAllowAnyFromAddress", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.ALLOW_FROM_ADDRESSES]			= ["zimbraAllowFromAddress", ZmSetting.T_COS, ZmSetting.D_LIST];
ZmSetting.INIT[ZmSetting.AVAILABLE_SKINS]				= [null, ZmSetting.T_COS, ZmSetting.D_LIST];
ZmSetting.INIT[ZmSetting.BROWSE_ENABLED]				= ["zimbraFeatureAdvancedSearchEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.CALENDAR_ENABLED]				= ["zimbraFeatureCalendarEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.CHANGE_PASSWORD_ENABLED]		= ["zimbraFeatureChangePasswordEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.CONTACTS_ENABLED]				= ["zimbraFeatureContactsEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.CONVERSATIONS_ENABLED]			= ["zimbraFeatureConversationsEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.DISPLAY_NAME]					= ["displayName", ZmSetting.T_COS, ZmSetting.D_STRING];
ZmSetting.INIT[ZmSetting.FILTERS_ENABLED]				= ["zimbraFeatureFiltersEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.GAL_AUTOCOMPLETE_ENABLED]		= ["zimbraFeatureGalAutoCompleteEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.GAL_ENABLED]					= ["zimbraFeatureGalEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.HTML_COMPOSE_ENABLED] 			= ["zimbraFeatureHtmlComposeEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.IDENTITIES_ENABLED]   	    	= ["zimbraFeatureIdentitiesEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.IDLE_SESSION_TIMEOUT] 			= ["zimbraMailIdleSessionTimeout", ZmSetting.T_COS, ZmSetting.D_LDAP_TIME, 0];
ZmSetting.INIT[ZmSetting.IM_ENABLED]					= ["zimbraFeatureIMEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.INITIAL_SEARCH_ENABLED]		= ["zimbraFeatureInitialSearchPreferenceEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.MAIL_ALIASES]					= ["zimbraMailAlias", ZmSetting.T_COS, ZmSetting.D_LIST];
ZmSetting.INIT[ZmSetting.MAIL_ENABLED]					= [null, ZmSetting.T_COS, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.MAIL_FORWARDING_ENABLED]		= ["zimbraFeatureMailForwardingEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.MAX_CONTACTS]					= ["zimbraContactMaxNumEntries", ZmSetting.T_COS, ZmSetting.D_INT, 0];
ZmSetting.INIT[ZmSetting.MIN_POLLING_INTERVAL]			= ["zimbraMailMinPollingInterval", ZmSetting.T_COS, ZmSetting.D_LDAP_TIME, 120];
ZmSetting.INIT[ZmSetting.NOTEBOOK_ENABLED]				= ["zimbraFeatureNotebookEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.NOTIF_FEATURE_ENABLED]			= ["zimbraFeatureNewMailNotificationEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.OPTIONS_ENABLED]				= [null, ZmSetting.T_COS, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.POP_ACCOUNTS_ENABLED]   		= ["zimbraFeaturePop3DataSourceEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.PORTAL_ENABLED]				= ["zimbraFeaturePortalEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.PORTAL_NAME]	    			= ["zimbraPortalName", ZmSetting.T_COS, ZmSetting.D_STRING, "example"];
ZmSetting.INIT[ZmSetting.PWD_MAX_LENGTH]				= ["zimbraPasswordMaxLength", ZmSetting.T_COS, ZmSetting.D_INT, 64];
ZmSetting.INIT[ZmSetting.PWD_MIN_LENGTH]				= ["zimbraPasswordMinLength", ZmSetting.T_COS, ZmSetting.D_INT, 6];
ZmSetting.INIT[ZmSetting.QUOTA]							= ["zimbraMailQuota", ZmSetting.T_COS, ZmSetting.D_INT, 0];
ZmSetting.INIT[ZmSetting.SAVED_SEARCHES_ENABLED]		= ["zimbraFeatureSavedSearchesEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.SHARING_ENABLED]		 		= ["zimbraFeatureSharingEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.SKIN_CHANGE_ENABLED]			= ["zimbraFeatureSkinChangeEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.TAGGING_ENABLED]				= ["zimbraFeatureTaggingEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.TASKS_ENABLED]					= ["zimbraFeatureTasksEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.VACATION_MSG_FEATURE_ENABLED]	= ["zimbraFeatureOutOfOfficeReplyEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.VIEW_ATTACHMENT_AS_HTML] 		= ["zimbraFeatureViewInHtmlEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.VOICEMAIL_ENABLED]				= ["zimbraFeatureVoicemailEnabled", ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];

// user metadata (included with COS since the user can't change them)
ZmSetting.INIT[ZmSetting.LICENSE_STATUS]				= [null, ZmSetting.T_COS, ZmSetting.D_STRING, ZmSetting.LICENSE_GOOD];
ZmSetting.INIT[ZmSetting.QUOTA_USED]					= [null, ZmSetting.T_COS, ZmSetting.D_INT];
ZmSetting.INIT[ZmSetting.TOKEN_LIFETIME]				= [null, ZmSetting.T_COS, ZmSetting.D_INT];
ZmSetting.INIT[ZmSetting.USERNAME]						= [null, ZmSetting.T_COS, ZmSetting.D_STRING];
ZmSetting.INIT[ZmSetting.USERID]						= ["zimbraId", ZmSetting.T_COS, ZmSetting.D_STRING];

// CLIENT SIDE FEATURE SUPPORT
ZmSetting.INIT[ZmSetting.ATT_VIEW_ENABLED]				= [null, ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.EVAL_ENABLED] 			 		= [null, ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.FEED_ENABLED]					= [null, ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.HELP_ENABLED]					= [null, ZmSetting.T_COS, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.MIXED_VIEW_ENABLED]			= [null, ZmSetting.T_COS, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.NOTES_ENABLED]					= [null, ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.PRINT_ENABLED]					= [null, ZmSetting.T_COS, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.REPLY_MENU_ENABLED]			= [null, ZmSetting.T_COS, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.FORWARD_MENU_ENABLED] 			= [null, ZmSetting.T_COS, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.SAVE_DRAFT_ENABLED]			= [null, ZmSetting.T_COS, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.SEARCH_ENABLED]				= [null, ZmSetting.T_COS, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.SKI_HACK_ENABLED]				= [null, ZmSetting.T_COS, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.SPAM_ENABLED]					= [null, ZmSetting.T_COS, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.USER_FOLDERS_ENABLED]			= [null, ZmSetting.T_COS, ZmSetting.D_BOOLEAN, true];

// USER PREFERENCES (mutable)

// address book preferences
ZmSetting.INIT[ZmSetting.AUTO_ADD_ADDRESS]				= ["zimbraPrefAutoAddAddressEnabled", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.CONTACTS_PER_PAGE] 			= ["zimbraPrefContactsPerPage", ZmSetting.T_PREF, ZmSetting.D_INT, 25];
ZmSetting.INIT[ZmSetting.CONTACTS_VIEW]					= ["zimbraPrefContactsInitialView", ZmSetting.T_PREF, ZmSetting.D_STRING, ZmSetting.CV_LIST];
ZmSetting.INIT[ZmSetting.EXPORT] 						= [null, ZmSetting.T_PREF];
ZmSetting.INIT[ZmSetting.GAL_AUTOCOMPLETE]				= ["zimbraPrefGalAutoCompleteEnabled", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.GAL_AUTOCOMPLETE_SESSION]		= [null, ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.IMPORT] 						= [null, ZmSetting.T_PREF];

// calendar preferences
ZmSetting.INIT[ZmSetting.CAL_ALWAYS_SHOW_MINI_CAL]		= ["zimbraPrefCalendarAlwaysShowMiniCal", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.CAL_FIRST_DAY_OF_WEEK] 		= ["zimbraPrefCalendarFirstDayOfWeek", ZmSetting.T_PREF, ZmSetting.D_INT, 0];
ZmSetting.INIT[ZmSetting.CAL_REMINDER_WARNING_TIME]		= ["zimbraPrefCalendarApptReminderWarningTime", ZmSetting.T_PREF, ZmSetting.D_INT, 0];
ZmSetting.INIT[ZmSetting.CAL_SHOW_TIMEZONE]	 			= ["zimbraPrefUseTimeZoneListInCalendar", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.CAL_USE_QUICK_ADD] 			= ["zimbraPrefCalendarUseQuickAdd", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.CALENDAR_INITIAL_VIEW]			= ["zimbraPrefCalendarInitialView", ZmSetting.T_PREF, ZmSetting.D_STRING, ZmSetting.CAL_DAY];
ZmSetting.INIT[ZmSetting.DEFAULT_CALENDAR_TIMEZONE]		= ["zimbraPrefTimeZoneId", ZmSetting.T_PREF, ZmSetting.D_STRING];

// general preferences
ZmSetting.INIT[ZmSetting.PASSWORD]						= [null, ZmSetting.T_PREF];
ZmSetting.INIT[ZmSetting.SEARCH_INCLUDES_SPAM]			= ["zimbraPrefIncludeSpamInSearch", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.SEARCH_INCLUDES_TRASH]			= ["zimbraPrefIncludeTrashInSearch", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.SHOW_SEARCH_STRING]			= ["zimbraPrefShowSearchString", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.SKIN_NAME]						= ["zimbraPrefSkin", ZmSetting.T_PREF, ZmSetting.D_STRING, "sand"];
ZmSetting.INIT[ZmSetting.SORTING_PREF] 					= [null, ZmSetting.T_PREF, ZmSetting.D_HASH];

// mail preferences
ZmSetting.INIT[ZmSetting.COMPOSE_AS_FORMAT] 			= ["zimbraPrefComposeFormat", ZmSetting.T_PREF, ZmSetting.D_STRING, ZmSetting.COMPOSE_TEXT];
ZmSetting.INIT[ZmSetting.COMPOSE_INIT_FONT_COLOR] 		= ["zimbraPrefHtmlEditorDefaultFontColor", ZmSetting.T_PREF, ZmSetting.D_STRING, ZmSetting.COMPOSE_FONT_COLOR];
ZmSetting.INIT[ZmSetting.COMPOSE_INIT_FONT_FAMILY] 		= ["zimbraPrefHtmlEditorDefaultFontFamily", ZmSetting.T_PREF, ZmSetting.D_STRING, ZmSetting.COMPOSE_FONT_FAM];
ZmSetting.INIT[ZmSetting.COMPOSE_INIT_FONT_SIZE] 		= ["zimbraPrefHtmlEditorDefaultFontSize", ZmSetting.T_PREF, ZmSetting.D_STRING, ZmSetting.COMPOSE_FONT_SIZE];
ZmSetting.INIT[ZmSetting.COMPOSE_SAME_FORMAT] 			= ["zimbraPrefForwardReplyInOriginalFormat", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.DEDUPE_MSG_TO_SELF]			= ["zimbraPrefDedupeMessagesSentToSelf", ZmSetting.T_PREF, ZmSetting.D_STRING, ZmSetting.DEDUPE_NONE];
ZmSetting.INIT[ZmSetting.FORWARD_INCLUDE_ORIG]			= ["zimbraPrefForwardIncludeOriginalText", ZmSetting.T_PREF, ZmSetting.D_STRING, ZmSetting.INCLUDE];
ZmSetting.INIT[ZmSetting.INITIAL_GROUP_MAIL_BY]			= ["zimbraPrefGroupMailBy", ZmSetting.T_PREF, ZmSetting.D_STRING, ZmSetting.GROUP_BY_MESSAGE];
ZmSetting.INIT[ZmSetting.GROUP_MAIL_BY]					= [null, ZmSetting.T_PREF, ZmSetting.D_STRING, ZmSetting.GROUP_BY_MESSAGE];
ZmSetting.INIT[ZmSetting.INITIAL_SEARCH]				= ["zimbraPrefMailInitialSearch", ZmSetting.T_PREF, ZmSetting.D_STRING, "in:inbox"];
ZmSetting.INIT[ZmSetting.MAIL_FORWARDING_ADDRESS]		= ["zimbraPrefMailForwardingAddress", ZmSetting.T_PREF, ZmSetting.D_STRING];
ZmSetting.INIT[ZmSetting.MAIL_LOCAL_DELIVERY_DISABLED]	= ["zimbraPrefMailLocalDeliveryDisabled", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.NEW_WINDOW_COMPOSE]			= ["zimbraPrefComposeInNewWindow", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.NOTIF_ENABLED]					= ["zimbraPrefNewMailNotificationEnabled", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.NOTIF_ADDRESS]					= ["zimbraPrefNewMailNotificationAddress", ZmSetting.T_PREF];
ZmSetting.INIT[ZmSetting.PAGE_SIZE]						= ["zimbraPrefMailItemsPerPage", ZmSetting.T_PREF, ZmSetting.D_INT, 25];
ZmSetting.INIT[ZmSetting.POLLING_INTERVAL]				= ["zimbraPrefMailPollingInterval", ZmSetting.T_PREF, ZmSetting.D_LDAP_TIME, 300];
ZmSetting.INIT[ZmSetting.READING_PANE_ENABLED]			= ["zimbraPrefReadingPaneEnabled", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.REPLY_INCLUDE_ORIG]			= ["zimbraPrefReplyIncludeOriginalText", ZmSetting.T_PREF, ZmSetting.D_STRING, ZmSetting.INCLUDE];
ZmSetting.INIT[ZmSetting.REPLY_PREFIX]					= ["zimbraPrefForwardReplyPrefixChar", ZmSetting.T_PREF, ZmSetting.D_STRING, ">"];
ZmSetting.INIT[ZmSetting.REPLY_TO_ADDRESS]				= ["zimbraPrefReplyToAddress", ZmSetting.T_PREF];
ZmSetting.INIT[ZmSetting.SAVE_TO_SENT]					= ["zimbraPrefSaveToSent", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.SENT_FOLDER_NAME]				= ["zimbraPrefSentMailFolder", ZmSetting.T_PREF, ZmSetting.D_STRING, "sent"];
ZmSetting.INIT[ZmSetting.SHOW_BCC]						= [null, ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.SHOW_FRAGMENTS]				= ["zimbraPrefShowFragments", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.SIGNATURE]						= ["zimbraPrefMailSignature", ZmSetting.T_PREF];
ZmSetting.INIT[ZmSetting.SIGNATURE_ENABLED]				= ["zimbraPrefMailSignatureEnabled", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.SIGNATURE_STYLE]				= ["zimbraPrefMailSignatureStyle", ZmSetting.T_PREF, ZmSetting.D_STRING, ZmSetting.SIG_OUTLOOK];
ZmSetting.INIT[ZmSetting.USE_KEYBOARD_SHORTCUTS]		= ["zimbraPrefUseKeyboardShortcuts", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, true];
ZmSetting.INIT[ZmSetting.VACATION_MSG]					= ["zimbraPrefOutOfOfficeReply", ZmSetting.T_PREF];
ZmSetting.INIT[ZmSetting.VACATION_MSG_ENABLED]			= ["zimbraPrefOutOfOfficeReplyEnabled", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, false];
ZmSetting.INIT[ZmSetting.VIEW_AS_HTML]					= ["zimbraPrefMessageViewHtmlPreferred", ZmSetting.T_PREF, ZmSetting.D_BOOLEAN, false];

// Keyboard shortcuts
ZmSetting.INIT[ZmSetting.SHORTCUTS]						= ["zimbraPrefShortcuts", ZmSetting.T_PREF, ZmSetting.D_STRING];

/**
 * Returns the name of the setting with the given ID. Abstract method that's
 * available before ZmSettings has been constructed.
 * 
 * @param id	[constant]		setting ID
 */
ZmSetting.getName =
function(id) {
	return ZmSetting.INIT[id] ? ZmSetting.INIT[id][0] : null;
};

/**
 * Returns true if the setting with the given ID is a user preference as
 * opposed to a COS feature.
 * 
 * @param id	[constant]		setting ID
 */
ZmSetting.isPref =
function(id) {
	var name = ZmSetting.getName(id);
	return name ? (name.indexOf("zimbraPref") == 0) : false;
};

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
* Returns the default value of this setting.
*
* @param key 			optional key for use by hash table data type
*/
ZmSetting.prototype.getDefaultValue =
function(key) {
	return key ? this.defaultValue[key] : this.defaultValue;
};

/**
* Sets the current value of this setting, performing any necessary data type conversion.
*
* @param value			the new value for the setting
* @param key 			optional key for use by hash table data type
* @param setDefault		if true, also set the default value
* @param skipNotify		if true, don't notify listeners
*/
ZmSetting.prototype.setValue =
function(value, key, setDefault, skipNotify) {
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
		var lastChar = (value.toLowerCase) ? lastChar = (value.toLowerCase()).charAt(value.length-1) : null;
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
	} else if (this.dataType == ZmSetting.D_HASH) {
		if (key) {
			this.value[key] = value;
		}
	} else if (this.dataType == ZmSetting.D_LIST) {
		if (value instanceof Array) {
			this.value = value;
		} else {
			this.value.push(value);
		}
	}

	if (setDefault) {
		if (key)
			this.defaultValue[key] = this.value[key];
		else
			this.defaultValue = this.value;
	}
	
	// Setting an internal pref is equivalent to saving it, so we should notify
	if (!this.name && !skipNotify) {
		this._notify(ZmEvent.E_MODIFY);
	}
};

ZmSetting.prototype.notifyModify = 
function(obj) {
	if (this.id == ZmSetting.QUOTA_USED && obj._name == "mbx") {
		this.setValue(obj.s);
		this._notify(ZmEvent.E_MODIFY);
	}
};
