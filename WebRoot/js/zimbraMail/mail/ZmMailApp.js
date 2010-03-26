/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * @overview
 * This file contains the mail application class.
 */

/**
 * Creates and initializes the mail application.
 * @constructor
 * @class
 * The mail app manages and displays mail messages. Messages may be grouped
 * into conversations. New messages are created through a composer.
 *
 * @param	{DwtControl}	container		the container
 * @param	{ZmController}	parentController	the parent window controller (set by the child window)
 * 
 * @author Conrad Damon
 * 
 * @extends		ZmApp
 */
ZmMailApp = function(container, parentController) {
	ZmApp.call(this, ZmApp.MAIL, container, parentController);

	this._sessionController		= {};
	this._sessionId				= {};
	this._curSessionId			= {};

	this._dataSourceCollection	= {};
	this._identityCollection	= {};
	this._signatureCollection	= {};
	this._groupBy				= {};

	this.numEntries				= 0; // offline, initial sync

	this._addSettingsChangeListeners();
};

ZmMailApp.prototype = new ZmApp;
ZmMailApp.prototype.constructor = ZmMailApp;

// Organizer and item-related constants
ZmEvent.S_CONV				= ZmId.ITEM_CONV;
ZmEvent.S_MSG				= ZmId.ITEM_MSG;
ZmEvent.S_ATT				= ZmId.ITEM_ATT;
ZmEvent.S_FOLDER			= ZmId.ORG_FOLDER;
ZmEvent.S_DATA_SOURCE		= ZmId.ITEM_DATA_SOURCE;
ZmEvent.S_IDENTITY			= "IDENTITY";
ZmEvent.S_SIGNATURE			= "SIGNATURE";
ZmItem.CONV					= ZmEvent.S_CONV;
ZmItem.MSG					= ZmEvent.S_MSG;
ZmItem.ATT					= ZmEvent.S_ATT;
ZmItem.DATA_SOURCE			= ZmEvent.S_DATA_SOURCE;
ZmOrganizer.FOLDER			= ZmEvent.S_FOLDER;

// App-related constants
/**
 * Defines the "mail" application.
 */
ZmApp.MAIL									= ZmId.APP_MAIL;
ZmApp.CLASS[ZmApp.MAIL]						= "ZmMailApp";
ZmApp.SETTING[ZmApp.MAIL]					= ZmSetting.MAIL_ENABLED;
ZmApp.UPSELL_SETTING[ZmApp.MAIL]			= ZmSetting.MAIL_UPSELL_ENABLED;
ZmApp.LOAD_SORT[ZmApp.MAIL]					= 20;
ZmApp.QS_ARG[ZmApp.MAIL]					= "mail";

ZmMailApp.DEFAULT_AUTO_SAVE_DRAFT_INTERVAL	= 30;
ZmMailApp.DEFAULT_MAX_MESSAGE_SIZE			= 100000;

ZmMailApp.POP_DOWNLOAD_SINCE_ALL			= 0;
ZmMailApp.POP_DOWNLOAD_SINCE_NO_CHANGE		= 1;
ZmMailApp.POP_DOWNLOAD_SINCE_FROM_NOW		= 2;

ZmMailApp.SEND_RECEIPT_NEVER				= "never";
ZmMailApp.SEND_RECEIPT_ALWAYS				= "always";
ZmMailApp.SEND_RECEIPT_PROMPT				= "prompt";

ZmMailApp.INC_MAP = {};
ZmMailApp.INC_MAP[ZmSetting.INC_NONE]			= [ZmSetting.INC_NONE, false, false];
ZmMailApp.INC_MAP[ZmSetting.INC_ATTACH]			= [ZmSetting.INC_ATTACH, false, false];
ZmMailApp.INC_MAP[ZmSetting.INC_BODY]			= [ZmSetting.INC_BODY, false, false];
ZmMailApp.INC_MAP[ZmSetting.INC_BODY_PRE]		= [ZmSetting.INC_BODY, true, false];
ZmMailApp.INC_MAP[ZmSetting.INC_BODY_HDR]		= [ZmSetting.INC_BODY, false, true];
ZmMailApp.INC_MAP[ZmSetting.INC_BODY_PRE_HDR]	= [ZmSetting.INC_BODY, true, true];
ZmMailApp.INC_MAP[ZmSetting.INC_SMART]			= [ZmSetting.INC_SMART, false, false];
ZmMailApp.INC_MAP[ZmSetting.INC_SMART_PRE]		= [ZmSetting.INC_SMART, true, false];
ZmMailApp.INC_MAP[ZmSetting.INC_SMART_HDR]		= [ZmSetting.INC_SMART, false, true];
ZmMailApp.INC_MAP[ZmSetting.INC_SMART_PRE_HDR]	= [ZmSetting.INC_SMART, true, true];

ZmMailApp.INC_MAP_REV = {};
for (var i in ZmMailApp.INC_MAP) {
	var key = ZmMailApp.INC_MAP[i].join("|");
	ZmMailApp.INC_MAP_REV[key] = i;
}

ZmMailApp._setGroupByMaps =
function() {
	// convert between server values for "group mail by" and item types
	ZmMailApp.GROUP_MAIL_BY_ITEM	= {};
	ZmMailApp.GROUP_MAIL_BY_ITEM[ZmSetting.GROUP_BY_CONV]		= ZmItem.CONV;
	ZmMailApp.GROUP_MAIL_BY_ITEM[ZmSetting.GROUP_BY_MESSAGE]	= ZmItem.MSG;
};

ZmMailApp.prototype.toString =
function() {
	return "ZmMailApp";
};

// Construction

ZmMailApp.prototype._defineAPI =
function() {
	AjxDispatcher.setPackageLoadFunction("MailCore", new AjxCallback(this, this._postLoadCore));
	AjxDispatcher.setPackageLoadFunction("Mail", new AjxCallback(this, this._postLoad));
	AjxDispatcher.registerMethod("Compose", ["MailCore", "Mail"], new AjxCallback(this, this.compose));
	AjxDispatcher.registerMethod("GetComposeController", ["MailCore", "Mail"], new AjxCallback(this, this.getComposeController));
	AjxDispatcher.registerMethod("GetConvController", ["MailCore", "Mail"], new AjxCallback(this, this.getConvController));
	AjxDispatcher.registerMethod("GetConvListController", "MailCore", new AjxCallback(this, this.getConvListController));
	AjxDispatcher.registerMethod("GetMsgController", ["MailCore", "Mail"], new AjxCallback(this, this.getMsgController));
	AjxDispatcher.registerMethod("GetTradController", "MailCore", new AjxCallback(this, this.getTradController));
	AjxDispatcher.registerMethod("GetMailListController", "MailCore", new AjxCallback(this, this.getMailListController));
	AjxDispatcher.registerMethod("GetIdentityCollection", "MailCore", new AjxCallback(this, this.getIdentityCollection));
	AjxDispatcher.registerMethod("GetSignatureCollection", "MailCore", new AjxCallback(this, this.getSignatureCollection));
	AjxDispatcher.registerMethod("GetDataSourceCollection", "MailCore", new AjxCallback(this, this.getDataSourceCollection));
	AjxDispatcher.registerMethod("GetAttachmentsController", ["MailCore","Mail"], new AjxCallback(this, this.getAttachmentsController));
	AjxDispatcher.registerMethod("GetMailConfirmController", ["MailCore","Mail"], new AjxCallback(this, this.getConfirmController));
};

ZmMailApp.prototype._registerSettings =
function(settings) {
	var settings = settings || appCtxt.getSettings();
	settings.registerSetting("ALLOW_ANY_FROM_ADDRESS",			{name:"zimbraAllowAnyFromAddress", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("ALLOW_FROM_ADDRESSES",			{name:"zimbraAllowFromAddress", type:ZmSetting.T_COS, dataType:ZmSetting.D_LIST});
	settings.registerSetting("AUTO_SAVE_DRAFT_INTERVAL",		{name:"zimbraPrefAutoSaveDraftInterval", type:ZmSetting.T_PREF, dataType:ZmSetting.D_LDAP_TIME, defaultValue:ZmMailApp.DEFAULT_AUTO_SAVE_DRAFT_INTERVAL, isGlobal:true});
	settings.registerSetting("COMPOSE_SAME_FORMAT",				{name:"zimbraPrefForwardReplyInOriginalFormat", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false, isGlobal:true});
	settings.registerSetting("CONVERSATIONS_ENABLED",			{name:"zimbraFeatureConversationsEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("CONVERSATION_ORDER",				{name:"zimbraPrefConversationOrder", type:ZmSetting.T_PREF, defaultValue:ZmSearch.DATE_DESC, isImplicit:true});
	settings.registerSetting("DEDUPE_MSG_TO_SELF",				{name:"zimbraPrefDedupeMessagesSentToSelf", type:ZmSetting.T_PREF, defaultValue:ZmSetting.DEDUPE_NONE});
	settings.registerSetting("DEFAULT_DISPLAY_NAME",			{type:ZmSetting.T_PSEUDO, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("DETACH_COMPOSE_ENABLED",			{name:"zimbraFeatureComposeInNewWindowEnabled",type:ZmSetting.T_PREF,dataType:ZmSetting.D_BOOLEAN,defaultValue:true});
	settings.registerSetting("DETACH_MAILVIEW_ENABLED",			{name:"zimbraFeatureOpenMailInNewWindowEnabled",type:ZmSetting.T_PREF,dataType:ZmSetting.D_BOOLEAN,defaultValue:true});
	settings.registerSetting("DISPLAY_EXTERNAL_IMAGES",			{name:"zimbraPrefDisplayExternalImages", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false, isGlobal:true});
	settings.registerSetting("END_DATE_ENABLED",				{type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("FILTERS_ENABLED",					{name:"zimbraFeatureFiltersEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("FILTERS_MAIL_FORWARDING_ENABLED",	{name:"zimbraFeatureMailForwardingInFiltersEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("FORWARD_INCLUDE_HEADERS",			{type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("FORWARD_INCLUDE_ORIG",			{name:"zimbraPrefForwardIncludeOriginalText", type:ZmSetting.T_PREF, defaultValue:ZmSetting.INC_BODY, isGlobal:true});
	settings.registerSetting("FORWARD_INCLUDE_WHAT",			{type:ZmSetting.T_PREF, defaultValue:ZmSetting.INC_BODY});
	settings.registerSetting("FORWARD_MENU_ENABLED",			{type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("FORWARD_USE_PREFIX",				{type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("GET_MAIL_ACTION",					{name:"zimbraPrefGetMailAction", type:ZmSetting.T_PREF, defaultValue:ZmSetting.GETMAIL_ACTION_DEFAULT, isGlobal:true});
	settings.registerSetting("GROUP_MAIL_BY",					{name:"zimbraPrefGroupMailBy", type:ZmSetting.T_PREF, defaultValue:ZmSetting.GROUP_BY_MESSAGE, isImplicit:true});
	settings.registerSetting("HTML_SIGNATURE_ENABLED",			{type:ZmSetting.T_PREF,dataType:ZmSetting.D_BOOLEAN,defaultValue:true});
	settings.registerSetting("IDENTITIES_ENABLED",				{name:"zimbraFeatureIdentitiesEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("INITIAL_SEARCH",					{name:"zimbraPrefMailInitialSearch", type:ZmSetting.T_PREF, defaultValue:"in:inbox"});
	settings.registerSetting("INITIAL_SEARCH_ENABLED",			{name:"zimbraFeatureInitialSearchPreferenceEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("MAIL_ALIASES",					{name:"zimbraMailAlias", type:ZmSetting.T_COS, dataType:ZmSetting.D_LIST});
	settings.registerSetting("MAIL_ATTACH_VIEW_ENABLED",		{type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("MAIL_BLACKLIST",					{type: ZmSetting.T_PREF, dataType: ZmSetting.D_LIST});
	settings.registerSetting("MAIL_BLACKLIST_MAX_NUM_ENTRIES",	{name:"zimbraMailBlacklistMaxNumEntries", type: ZmSetting.T_COS, dataType: ZmSetting.D_INT, defaultValue:100});
	settings.registerSetting("MAIL_FOLDER_COLORS_ENABLED",		{name:"zimbraPrefFolderColorEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("MAIL_FORWARDING_ADDRESS",			{name:"zimbraPrefMailForwardingAddress", type:ZmSetting.T_PREF});
	settings.registerSetting("MAIL_FORWARDING_ENABLED",			{name:"zimbraFeatureMailForwardingEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("MAIL_MANDATORY_SPELLCHECK",		{name:"zimbraPrefMandatorySpellCheckEnabled", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false, isGlobal:true});
	settings.registerSetting("MAIL_FROM_ADDRESS",				{name:"zimbraPrefFromAddress", type:ZmSetting.T_PREF, dataType:ZmSetting.D_LIST });
	settings.registerSetting("MAIL_LIFETIME_GLOBAL",			{name:"zimbraMailMessageLifetime", type:ZmSetting.T_COS, defaultValue:"0"}); // dataType: DURATION
	settings.registerSetting("MAIL_LIFETIME_INBOX_READ",		{name:"zimbraPrefInboxReadLifetime", type:ZmSetting.T_PREF, defaultValue:"0"}); // dataType: DURATION
	settings.registerSetting("MAIL_LIFETIME_INBOX_UNREAD",		{name:"zimbraPrefInboxUnreadLifetime", type:ZmSetting.T_PREF, defaultValue:"0"}); // dataType: DURATION
	settings.registerSetting("MAIL_LIFETIME_JUNK",				{name:"zimbraPrefJunkLifetime", type:ZmSetting.T_PREF, defaultValue:"0"}); // dataType: DURATION
	settings.registerSetting("MAIL_LIFETIME_JUNK_GLOBAL",		{name:"zimbraMailSpamLifetime", type:ZmSetting.T_COS, defaultValue:"0"}); // dataType: DURATION
	settings.registerSetting("MAIL_LIFETIME_SENT",				{name:"zimbraPrefSentLifetime", type:ZmSetting.T_PREF, defaultValue:"0"}); // dataType: DURATION
	settings.registerSetting("MAIL_LIFETIME_TRASH",				{name:"zimbraPrefTrashLifetime", type:ZmSetting.T_PREF, defaultValue:"0"}); // dataType: DURATION
	settings.registerSetting("MAIL_LIFETIME_TRASH_GLOBAL",		{name:"zimbraMailTrashLifetime", type:ZmSetting.T_COS, defaultValue:"0"}); // dataType: DURATION
	settings.registerSetting("MAIL_LOCAL_DELIVERY_DISABLED",	{name:"zimbraPrefMailLocalDeliveryDisabled", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("MAIL_NOTIFY_SOUNDS",				{name:"zimbraPrefMailSoundsEnabled", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false, isGlobal:true});
	settings.registerSetting("MAIL_NOTIFY_APP",					{name:"zimbraPrefMailFlashIcon", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false, isGlobal:true});
	settings.registerSetting("MAIL_NOTIFY_BROWSER",				{name:"zimbraPrefMailFlashTitle", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false, isGlobal:true});
	settings.registerSetting("MAIL_NOTIFY_TOASTER",				{name:"zimbraPrefMailToasterEnabled", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false, isGlobal:true});
	settings.registerSetting("MAIL_PRIORITY_ENABLED",			{name:"zimbraFeatureMailPriorityEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("MAIL_READ_RECEIPT_ENABLED",		{name:"zimbraFeatureReadReceiptsEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("MAIL_SEND_READ_RECEIPTS",			{name:"zimbraPrefMailSendReadReceipts", type:ZmSetting.T_PREF, dataType:ZmSetting.D_STRING, defaultValue:"never"});
	settings.registerSetting("MAIL_WHITELIST",					{type: ZmSetting.T_PREF, dataType: ZmSetting.D_LIST});
	settings.registerSetting("MAIL_WHITELIST_MAX_NUM_ENTRIES",	{name:"zimbraMailWhitelistMaxNumEntries", type: ZmSetting.T_COS, dataType: ZmSetting.D_INT, defaultValue:100});
	settings.registerSetting("MARK_MSG_READ",					{name:"zimbraPrefMarkMsgRead", type:ZmSetting.T_PREF, dataType:ZmSetting.D_INT, defaultValue:0, isGlobal:true});
	settings.registerSetting("MAX_MESSAGE_SIZE",				{type:ZmSetting.T_PREF, defaultValue:ZmMailApp.DEFAULT_MAX_MESSAGE_SIZE});
	settings.registerSetting("NEW_WINDOW_COMPOSE",				{name:"zimbraPrefComposeInNewWindow", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:true, isGlobal:true});
	settings.registerSetting("NOTIF_ADDRESS",					{name:"zimbraPrefNewMailNotificationAddress", type:ZmSetting.T_PREF});
	settings.registerSetting("NOTIF_ENABLED",					{name:"zimbraPrefNewMailNotificationEnabled", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("NOTIF_FEATURE_ENABLED",			{name:"zimbraFeatureNewMailNotificationEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("OPEN_MAIL_IN_NEW_WIN",			{name:"zimbraPrefOpenMailInNewWindow", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false, isGlobal:true});
	settings.registerSetting("POP_ENABLED",						{name:"zimbraPop3Enabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:!appCtxt.isOffline});
	settings.registerSetting("POP_DOWNLOAD_SINCE_VALUE",		{type:ZmSetting.T_PREF, dataType:ZmSetting.D_STRING, defaultValue:""});
	settings.registerSetting("POP_DOWNLOAD_SINCE",				{name:"zimbraPrefPop3DownloadSince", type:ZmSetting.T_PREF, dataType:ZmSetting.D_STRING, defaultValue:""});
	settings.registerSetting("READING_PANE_LOCATION",			{name:"zimbraPrefReadingPaneLocation", type:ZmSetting.T_PREF, dataType:ZmSetting.D_STRING, defaultValue:ZmSetting.RP_BOTTOM, isImplicit:true, isGlobal:true});
	settings.registerSetting("READING_PANE_LOCATION_CV",		{name:"zimbraPrefConvReadingPaneLocation", type:ZmSetting.T_PREF, dataType:ZmSetting.D_STRING, defaultValue:ZmSetting.RP_BOTTOM, isImplicit:true});
	settings.registerSetting("REPLY_INCLUDE_HEADERS",			{type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("REPLY_INCLUDE_ORIG",				{name:"zimbraPrefReplyIncludeOriginalText", type:ZmSetting.T_PREF, defaultValue:ZmSetting.INC_BODY, isGlobal:true});
	settings.registerSetting("REPLY_INCLUDE_WHAT",				{type:ZmSetting.T_PREF, defaultValue:ZmSetting.INC_BODY});
	settings.registerSetting("REPLY_MENU_ENABLED",				{type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("REPLY_PREFIX",					{name:"zimbraPrefForwardReplyPrefixChar", type:ZmSetting.T_PREF, defaultValue:">", isGlobal:true});
	settings.registerSetting("REPLY_TO_ADDRESS",				{name:"zimbraPrefReplyToAddress", type:ZmSetting.T_PREF, dataType:ZmSetting.D_LIST });
	settings.registerSetting("REPLY_TO_ENABLED",				{name:"zimbraPrefReplyToEnabled", type:ZmSetting.T_PREF}); // XXX: Is this a list or single?
	settings.registerSetting("REPLY_USE_PREFIX",				{type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("SAVE_DRAFT_ENABLED",				{type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("SAVE_TO_SENT",					{name:"zimbraPrefSaveToSent", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:true, isGlobal:true});
	settings.registerSetting("SELECT_AFTER_DELETE",				{name:"zimbraPrefMailSelectAfterDelete", type:ZmSetting.T_PREF, defaultValue:ZmSetting.DELETE_SELECT_NEXT, isGlobal:true});
	settings.registerSetting("SEND_ON_BEHALF_OF",				{type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("SENT_FOLDER_NAME",				{name:"zimbraPrefSentMailFolder", type:ZmSetting.T_PREF, defaultValue:"sent"});
	settings.registerSetting("SHOW_BCC",						{type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("SHOW_FRAGMENTS",					{name:"zimbraPrefShowFragments", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false, isGlobal:true});
	settings.registerSetting("SHOW_MAIL_CONFIRM",				{name:"zimbraFeatureConfirmationPageEnabled", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("SIGNATURE",						{name:"zimbraPrefMailSignature", type:ZmSetting.T_PREF});
	settings.registerSetting("SIGNATURE_ENABLED",				{name:"zimbraPrefMailSignatureEnabled", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("SIGNATURE_STYLE",					{name:"zimbraPrefMailSignatureStyle", type:ZmSetting.T_PREF, defaultValue:ZmSetting.SIG_OUTLOOK});
	settings.registerSetting("SPAM_ENABLED",					{type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("START_DATE_ENABLED",				{type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("USER_FOLDERS_ENABLED",			{type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("VACATION_FROM",					{name:"zimbraPrefOutOfOfficeFromDate", type:ZmSetting.T_PREF, defaultValue:""});
	settings.registerSetting("VACATION_MSG",					{name:"zimbraPrefOutOfOfficeReply", type:ZmSetting.T_PREF, defaultValue:""});
	settings.registerSetting("VACATION_MSG_ENABLED",			{name:"zimbraPrefOutOfOfficeReplyEnabled", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("VACATION_MSG_FEATURE_ENABLED",	{name:"zimbraFeatureOutOfOfficeReplyEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("VACATION_UNTIL",					{name:"zimbraPrefOutOfOfficeUntilDate", type:ZmSetting.T_PREF, defaultValue:""});
	settings.registerSetting("COLLAPSE_IMAP_TREES",				{type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("SAVE_TO_IMAP_SENT",				{type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});

	ZmMailApp._setGroupByMaps();
};

ZmMailApp.prototype._registerPrefs =
function() {
	var sections = {
		MAIL: {
			title: ZmMsg.mail,
			icon: "MailApp",
			templateId: "prefs.Pages#Mail",
			priority: 10,
			precondition: appCtxt.get(ZmSetting.MAIL_ENABLED),
			prefs: [
				ZmSetting.DEDUPE_MSG_TO_SELF,
				ZmSetting.DISPLAY_EXTERNAL_IMAGES,
				ZmSetting.GET_MAIL_ACTION,
				ZmSetting.INITIAL_SEARCH,
				ZmSetting.MAIL_BLACKLIST,
				ZmSetting.MAIL_FORWARDING_ADDRESS,
				ZmSetting.MAIL_LIFETIME_INBOX_READ,
				ZmSetting.MAIL_LIFETIME_INBOX_UNREAD,
				ZmSetting.MAIL_LIFETIME_JUNK,
				ZmSetting.MAIL_LIFETIME_SENT,
				ZmSetting.MAIL_LIFETIME_TRASH,
				ZmSetting.MAIL_LOCAL_DELIVERY_DISABLED,
				ZmSetting.MAIL_NOTIFY_SOUNDS,
				ZmSetting.MAIL_NOTIFY_APP,
				ZmSetting.MAIL_NOTIFY_BROWSER,
				ZmSetting.MAIL_NOTIFY_TOASTER,
				ZmSetting.MAIL_WHITELIST,
				ZmSetting.MAIL_SEND_READ_RECEIPTS,
				ZmSetting.MARK_MSG_READ,
				ZmSetting.NOTIF_ADDRESS,
				ZmSetting.NOTIF_ENABLED,
				ZmSetting.OPEN_MAIL_IN_NEW_WIN,
				ZmSetting.PAGE_SIZE,
				ZmSetting.POP_DOWNLOAD_SINCE_VALUE,
				ZmSetting.POP_DOWNLOAD_SINCE,
				ZmSetting.POLLING_INTERVAL,
				ZmSetting.SHOW_FRAGMENTS,
				ZmSetting.VACATION_MSG_ENABLED,
				ZmSetting.VACATION_MSG,
				ZmSetting.SELECT_AFTER_DELETE,
				ZmSetting.START_DATE_ENABLED,
				ZmSetting.END_DATE_ENABLED,
				ZmSetting.VACATION_FROM,
				ZmSetting.VACATION_UNTIL,
				ZmSetting.VIEW_AS_HTML
			],
			manageDirty: true,
			createView: function(parent, section, controller) {
				AjxDispatcher.require("Alert");
				return new ZmMailPrefsPage(parent, section, controller);
			}
		},
		ACCOUNTS: {
			parentId: "MAIL",
			icon: "IMAPAccount",
			title: (appCtxt.isOffline ? ZmMsg.personas : ZmMsg.accounts),
			templateId: "prefs.Pages#Accounts",
			priority: 40,
			precondition: appCtxt.get(ZmSetting.MAIL_ENABLED),
			prefs: [
				ZmSetting.ACCOUNTS
			],
			manageDirty: true,
			createView: function(parent, section, controller) {
				return new ZmAccountsPage(parent, section, controller);
			}
		},
		SIGNATURES: {
			parentId: "MAIL",
			icon: "AddSignature",
			title: ZmMsg.signatures,
			templateId: "prefs.Pages#Signatures",
			priority: 30,
			precondition: (appCtxt.get(ZmSetting.MAIL_ENABLED) && appCtxt.get(ZmSetting.SIGNATURES_ENABLED)),
			prefs: [
				ZmSetting.SIGNATURES,
				ZmSetting.SIGNATURE_STYLE,
				ZmSetting.SIGNATURE_ENABLED
			],
			manageDirty: true,
			createView: function(parent, section, controller) {
				return new ZmSignaturesPage(parent, section, controller);
			}
		},
		FILTERS: {
			parentId: "MAIL",
			icon: "MailRule",
			title: ZmMsg.filterRules,
			templateId: "prefs.Pages#MailFilters",
			priority: 50,
			precondition: (appCtxt.get(ZmSetting.MAIL_ENABLED) && appCtxt.get(ZmSetting.FILTERS_ENABLED)),
			prefs: [
				ZmSetting.FILTERS
			],
			manageChanges: true,
			createView: function(parent, section, controller) {
				return controller.getFilterRulesController().getFilterRulesView();
			}
		}
	};

	for (var id in sections) {
		ZmPref.registerPrefSection(id, sections[id]);
	}

	ZmPref.registerPref("ACCOUNTS", {
		displayContainer:	ZmPref.TYPE_CUSTOM
	});

	ZmPref.registerPref("AUTO_SAVE_DRAFT_INTERVAL", {
		displayName:		ZmMsg.autoSaveDrafts,
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		options:			[0, ZmMailApp.DEFAULT_AUTO_SAVE_DRAFT_INTERVAL]
	});

	ZmPref.registerPref("DEDUPE_MSG_TO_SELF", {
		displayName:		ZmMsg.removeDupesToSelf,
		displayContainer:	ZmPref.TYPE_RADIO_GROUP,
		displayOptions:		[ZmMsg.dedupeNone, ZmMsg.dedupeSecondCopy, ZmMsg.dedupeAll],
		options:			[ZmSetting.DEDUPE_NONE, ZmSetting.DEDUPE_SECOND, ZmSetting.DEDUPE_ALL]
	});

	ZmPref.registerPref("DISPLAY_EXTERNAL_IMAGES", {
		displayName:		ZmMsg.showExternalImages,
		displayContainer:	ZmPref.TYPE_CHECKBOX
	});

	ZmPref.registerPref("END_DATE_ENABLED", {
		displayName:		ZmMsg.endOn,
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		precondition:		ZmSetting.VACATION_MSG_FEATURE_ENABLED
	});

	ZmPref.registerPref("GET_MAIL_ACTION", {
		displayContainer:	ZmPref.TYPE_RADIO_GROUP,
		orientation:		ZmPref.ORIENT_VERTICAL,
		displayOptions: 	[ZmMsg.checkMailPrefDefault, ZmMsg.checkMailPrefUpdate],
		options: 			[ZmSetting.GETMAIL_ACTION_DEFAULT, ZmSetting.GETMAIL_ACTION_UPDATE]
	});

	ZmPref.registerPref("INITIAL_SEARCH", {
		displayName:		ZmMsg.initialMailSearch,
		displayContainer:	ZmPref.TYPE_INPUT,
		maxLength:			ZmPref.MAX_LENGTH[ZmSetting.INITIAL_SEARCH],
		errorMessage:       AjxMessageFormat.format(ZmMsg.invalidInitialSearch, ZmPref.MAX_LENGTH[ZmSetting.INITIAL_SEARCH]),
		precondition:		ZmSetting.INITIAL_SEARCH_ENABLED
	});

	ZmPref.registerPref("MAIL_BLACKLIST", {
		displayContainer:	ZmPref.TYPE_CUSTOM
	});

	ZmPref.registerPref("MAIL_FORWARDING_ADDRESS", {
		displayName:		ZmMsg.mailForwardingAddress,
		displayContainer:	ZmPref.TYPE_INPUT,
		validationFunction: ZmMailApp.validateForwardEmail,
		errorMessage:       ZmMsg.invalidEmail,
		precondition:		ZmSetting.MAIL_FORWARDING_ENABLED,
		hint:				ZmMsg.enterEmailAddress
	});

	ZmPref.registerPref("MAIL_LIFETIME_INBOX_READ", {
		displayContainer:	ZmPref.TYPE_RADIO_GROUP,
		orientation:		ZmPref.ORIENT_HORIZONTAL,
		displayOptions:		[ ZmMsg.lifetimeDurationDays, ZmMsg.lifetimeDurationDays,
							  ZmMsg.lifetimeDurationDays, ZmMsg.lifetimeDurationDays,
							  ZmMsg.lifetimeDurationDays, ZmMsg.lifetimeDurationNever ],
		options:			[ 30, 45, 60, 90, 120, 0 ],
		approximateFunction: ZmPref.approximateLifetimeInboxRead,
		displayFunction:	ZmPref.durationDay2Int,
		valueFunction:		ZmPref.int2DurationDay,
		validationFunction:	ZmPref.validateLifetime
	});

	ZmPref.registerPref("MAIL_LIFETIME_INBOX_UNREAD", {
		displayContainer:	ZmPref.TYPE_RADIO_GROUP,
		orientation:		ZmPref.ORIENT_HORIZONTAL,
		displayOptions:		[ ZmMsg.lifetimeDurationDays, ZmMsg.lifetimeDurationDays,
							  ZmMsg.lifetimeDurationDays, ZmMsg.lifetimeDurationDays,
							  ZmMsg.lifetimeDurationDays, ZmMsg.lifetimeDurationNever ],
		options:			[ 30, 45, 60, 90, 120, 0 ],
		approximateFunction: ZmPref.approximateLifetimeInboxUnread,
		displayFunction:	ZmPref.durationDay2Int,
		valueFunction:		ZmPref.int2DurationDay,
		validationFunction:	ZmPref.validateLifetime
	});

	ZmPref.registerPref("MAIL_LIFETIME_JUNK", {
		displayContainer:	ZmPref.TYPE_RADIO_GROUP,
		orientation:		ZmPref.ORIENT_HORIZONTAL,
		displayOptions:		ZmMsg.lifetimeDurationDays,
		options:			[ 1, 3, 7, 30 ],
		approximateFunction: ZmPref.approximateLifetimeJunk,
		displayFunction:	ZmPref.durationDay2Int,
		valueFunction:		ZmPref.int2DurationDay,
		validationFunction:	ZmPref.validateLifetimeJunk
	});

	ZmPref.registerPref("MAIL_LIFETIME_SENT", {
		displayContainer:	ZmPref.TYPE_RADIO_GROUP,
		orientation:		ZmPref.ORIENT_HORIZONTAL,
		displayOptions:		[ ZmMsg.lifetimeDurationDays, ZmMsg.lifetimeDurationDays,
							  ZmMsg.lifetimeDurationDays, ZmMsg.lifetimeDurationDays,
							  ZmMsg.lifetimeDurationDays, ZmMsg.lifetimeDurationNever ],
		options:			[ 30, 45, 60, 90, 120, 0 ],
		approximateFunction: ZmPref.approximateLifetimeSent,
		displayFunction:	ZmPref.durationDay2Int,
		valueFunction:		ZmPref.int2DurationDay,
		validationFunction:	ZmPref.validateLifetime
	});

	ZmPref.registerPref("MAIL_LIFETIME_TRASH", {
		displayContainer:	ZmPref.TYPE_RADIO_GROUP,
		orientation:		ZmPref.ORIENT_HORIZONTAL,
		displayOptions:		ZmMsg.lifetimeDurationDays,
		options:			[ 1, 3, 7, 30 ],
		approximateFunction: ZmPref.approximateLifetimeTrash,
		displayFunction:	ZmPref.durationDay2Int,
		valueFunction:		ZmPref.int2DurationDay,
		validationFunction:	ZmPref.validateLifetimeTrash
	});

	ZmPref.registerPref("MAIL_LOCAL_DELIVERY_DISABLED", {
		displayName:		ZmMsg.mailDeliveryDisabled,
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		precondition:		ZmSetting.MAIL_FORWARDING_ENABLED,
		validationFunction:	ZmMailApp.validateMailLocalDeliveryDisabled,
		errorMessage:		ZmMsg.errorMissingFwdAddr
	});

	ZmPref.registerPref("MAIL_NOTIFY_SOUNDS", {
		displayName:		ZmMsg.playSound,
		displayContainer:	ZmPref.TYPE_CHECKBOX
	});

	ZmPref.registerPref("MAIL_NOTIFY_APP", {
		displayName:		ZmMsg.flashMailAppTab,
		displayContainer:	ZmPref.TYPE_CHECKBOX
	});

	ZmPref.registerPref("MAIL_NOTIFY_BROWSER", {
		displayName:		ZmMsg.flashBrowser,
		displayContainer:	ZmPref.TYPE_CHECKBOX
	});

	ZmPref.registerPref("MAIL_SEND_READ_RECEIPTS", {
		displayContainer:	ZmPref.TYPE_RADIO_GROUP,
		displayOptions:		[	ZmMsg.readReceiptNever,
								ZmMsg.readReceiptAlways,
								ZmMsg.readReceiptAsk
							],
		options:			[ 	ZmMailApp.SEND_RECEIPT_NEVER,
								ZmMailApp.SEND_RECEIPT_ALWAYS,
								ZmMailApp.SEND_RECEIPT_PROMPT
							],
		precondition:		ZmSetting.MAIL_READ_RECEIPT_ENABLED
	});

	ZmPref.registerPref("MAIL_WHITELIST", {
		displayContainer:	ZmPref.TYPE_CUSTOM
	});

	ZmPref.registerPref("NOTIF_ADDRESS", {
		displayName:		ZmMsg.mailNotifAddress,
		displayContainer:	ZmPref.TYPE_INPUT,
		validationFunction: ZmPref.validateEmail,
		errorMessage:       ZmMsg.invalidEmail,
		precondition:		ZmSetting.NOTIF_FEATURE_ENABLED,
		hint:				ZmMsg.enterEmailAddress
	});

	ZmPref.registerPref("NOTIF_ENABLED", {
		displayName:		ZmMsg.mailNotifEnabled,
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		precondition:		ZmSetting.NOTIF_FEATURE_ENABLED,
		validationFunction:	ZmMailApp.validateSendNotification,
		errorMessage:		ZmMsg.errorMissingNotifyAddr
	});

	ZmPref.registerPref("OPEN_MAIL_IN_NEW_WIN", {
		displayName:		ZmMsg.openMailNewWin,
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		precondition:		ZmSetting.DETACH_MAILVIEW_ENABLED
	});

	ZmPref.registerPref("POP_DOWNLOAD_SINCE_VALUE", {
		displayContainer:	ZmPref.TYPE_STATIC,
		precondition:		ZmSetting.POP_ENABLED
	});
	ZmPref.registerPref("POP_DOWNLOAD_SINCE", {
		displayContainer:	ZmPref.TYPE_RADIO_GROUP,
		displayOptions:		[	ZmMsg.externalAccessPopDownloadAll,
								"*** NOT SHOWN ***",
								ZmMsg.externalAccessPopDownloadFromNow
							],
		options:			[	ZmMailApp.POP_DOWNLOAD_SINCE_ALL,
								ZmMailApp.POP_DOWNLOAD_SINCE_NO_CHANGE,
								ZmMailApp.POP_DOWNLOAD_SINCE_FROM_NOW
							],
		displayFunction:	ZmPref.downloadSinceDisplay,
		valueFunction:		ZmPref.downloadSinceValue,
		precondition:		ZmSetting.POP_ENABLED
	});

	ZmPref.registerPref("REPLY_TO_ADDRESS", {
		displayName:		ZmMsg.replyToAddress,
		displayContainer:	ZmPref.TYPE_INPUT,
		validationFunction: ZmPref.validateEmail,
		errorMessage:       ZmMsg.invalidEmail
	});

	ZmPref.registerPref("SELECT_AFTER_DELETE", {
		displayName:		ZmMsg.clientType,
		displayContainer:	ZmPref.TYPE_RADIO_GROUP,
		orientation:		ZmPref.ORIENT_VERTICAL,
		displayOptions: 	[ZmMsg.selectNext, ZmMsg.selectPrevious, ZmMsg.selectAdapt],
		options: 			[ZmSetting.DELETE_SELECT_NEXT, ZmSetting.DELETE_SELECT_PREV, ZmSetting.DELETE_SELECT_ADAPT]
	});

	ZmPref.registerPref("SIGNATURE", {
		displayName:		ZmMsg.signature,
		displayContainer:	ZmPref.TYPE_TEXTAREA,
		maxLength:			ZmPref.MAX_LENGTH[ZmSetting.SIGNATURE],
		errorMessage:       AjxMessageFormat.format(ZmMsg.invalidSignature, ZmPref.MAX_LENGTH[ZmSetting.SIGNATURE])
	});

	ZmPref.registerPref("SIGNATURE_ENABLED", {
		displayName:		ZmMsg.signatureEnabled,
		displayContainer:	ZmPref.TYPE_CHECKBOX
	});

	ZmPref.registerPref("SIGNATURE_STYLE", {
		displayName:		ZmMsg.signatureStyle,
		displayContainer:	ZmPref.TYPE_RADIO_GROUP,
		orientation:		ZmPref.ORIENT_HORIZONTAL,
		displayOptions:		[ZmMsg.aboveQuotedText, ZmMsg.atBottomOfMessage],
		options:			[ZmSetting.SIG_OUTLOOK, ZmSetting.SIG_INTERNET]
	});

	ZmPref.registerPref("SIGNATURES", {
		displayContainer:	ZmPref.TYPE_CUSTOM
	});

	ZmPref.registerPref("START_DATE_ENABLED", {
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		displayName:		ZmMsg.startOn,
		precondition:		ZmSetting.VACATION_MSG_FEATURE_ENABLED
	});

	ZmPref.registerPref("VACATION_FROM", {
		displayName:		ZmMsg.startDate,
		displayContainer:	ZmPref.TYPE_INPUT,
		precondition:		ZmSetting.VACATION_MSG_FEATURE_ENABLED,
		displayFunction:	ZmPref.dateGMT2Local,
		valueFunction:		ZmPref.dateLocal2GMT
	});

    ZmPref.registerPref("VACATION_UNTIL", {
		displayName:		ZmMsg.endDate,
		displayContainer:	ZmPref.TYPE_INPUT,
		precondition:		ZmSetting.VACATION_MSG_FEATURE_ENABLED,
		displayFunction:	ZmPref.dateGMT2Local,
		valueFunction:		ZmPref.dateLocal2GMT
	});

    ZmPref.registerPref("VACATION_MSG", {
		displayName:		ZmMsg.awayMessage,
		displayContainer:	ZmPref.TYPE_TEXTAREA,
		maxLength:			ZmPref.MAX_LENGTH[ZmSetting.AWAY_MESSAGE],
		errorMessage:       AjxMessageFormat.format(ZmMsg.invalidAwayMessage, ZmPref.MAX_LENGTH[ZmSetting.AWAY_MESSAGE]),
		precondition:		ZmSetting.VACATION_MSG_FEATURE_ENABLED,
		validationFunction:	ZmMailApp.validateVacationMsg
	});

	ZmPref.registerPref("VACATION_MSG_ENABLED", {
		displayName:		ZmMsg.awayMessageEnabled,
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		precondition:		ZmSetting.VACATION_MSG_FEATURE_ENABLED,
		validationFunction:	ZmMailApp.validateVacationMsgEnabled,
		errorMessage:		ZmMsg.missingAwayMessage
	});

	ZmPref.registerPref("MAIL_NOTIFY_TOASTER", {
		displayFunc:		function() { AjxDispatcher.require("Alert"); return ZmDesktopAlert.getInstance().getDisplayText(); },
		displayContainer:	ZmPref.TYPE_CHECKBOX
	});
};

/**
 * @private
 */
ZmMailApp.validateForwardEmail =
function(emailStr) {
	if (!emailStr || emailStr == "") {
		var section = ZmPref.getPrefSectionWithPref(ZmSetting.MAIL_FORWARDING_ADDRESS);
		if (!section) { return false; }
		var view = appCtxt.getApp(ZmApp.PREFERENCES).getPrefController().getPrefsView();
		var checkbox = view.getView(section.id).getFormObject(ZmSetting.MAIL_LOCAL_DELIVERY_DISABLED);
		if (checkbox && checkbox.isSelected()) {
			checkbox.setSelected(false);
		}
	}
	return ZmPref.validateEmail(emailStr);
};

/**
 * @private
 */
ZmMailApp.validateMailLocalDeliveryDisabled =
function(checked) {
	if (!checked) { return true; }
	var section = ZmPref.getPrefSectionWithPref(ZmSetting.MAIL_FORWARDING_ADDRESS);
	if (!section) { return false; }
	var view = appCtxt.getApp(ZmApp.PREFERENCES).getPrefController().getPrefsView();
	var input = view.getView(section.id).getFormObject(ZmSetting.MAIL_FORWARDING_ADDRESS);
	return (input != null && input.isValid());
};

/**
 * @private
 */
ZmMailApp.validateSendNotification =
function(checked) {
	if (!checked) { return true; }
	var section = ZmPref.getPrefSectionWithPref(ZmSetting.NOTIF_ADDRESS);
	if (!section) { return false; }
	var view = appCtxt.getApp(ZmApp.PREFERENCES).getPrefController().getPrefsView();
	var input = view.getView(section.id).getFormObject(ZmSetting.NOTIF_ADDRESS);
	return (input != null && input.isValid());
};

/**
 * Make sure the server won't be sending out a blank away msg for the user. Check for a
 * combination of an empty away msg and a checked box for "send away message". Since a
 * pref is validated only if it changes, we have to have validation functions for both
 * prefs.
 * 
 * @private
 */
ZmMailApp.validateVacationMsg =
function(awayMsg) {
	if (awayMsg && (awayMsg.length > 0)) { return true; }
	var section = ZmPref.getPrefSectionWithPref(ZmSetting.VACATION_MSG_ENABLED);
	if (!section) { return false; }
	var view = appCtxt.getApp(ZmApp.PREFERENCES).getPrefController().getPrefsView();
	var input = view.getView(section.id).getFormObject(ZmSetting.VACATION_MSG_ENABLED);
	return (input && !input.isSelected());
};

/**
 * @private
 */
ZmMailApp.validateVacationMsgEnabled =
function(checked) {
	if (!checked) { return true; }
	var section = ZmPref.getPrefSectionWithPref(ZmSetting.VACATION_MSG);
	if (!section) { return false; }
	var view = appCtxt.getApp(ZmApp.PREFERENCES).getPrefController().getPrefsView();
	var input = view.getView(section.id).getFormObject(ZmSetting.VACATION_MSG);
	if (!input) { return false; }
	var awayMsg = input.getValue();
	return (awayMsg && (awayMsg.length > 0));
};

/**
 * @private
 */
ZmMailApp.prototype._registerOperations =
function() {
	ZmOperation.registerOp(ZmId.OP_ADD_FILTER_RULE, {textKey:"newFilter", image:"Plus"}, ZmSetting.FILTERS_ENABLED);
	ZmOperation.registerOp(ZmId.OP_ADD_SIGNATURE, {textKey:"signature", image:"AddSignature", tooltipKey:"chooseSignature"}, ZmSetting.SIGNATURES_ENABLED);
	ZmOperation.registerOp(ZmId.OP_CHECK_MAIL, {textKey:"checkMail", tooltipKey:"checkMailPrefDefault", image:"Refresh", textPrecedence:90});
	ZmOperation.registerOp(ZmId.OP_CHECK_MAIL_DEFAULT, {textKey:"checkMailDefault"});
	ZmOperation.registerOp(ZmId.OP_CHECK_MAIL_UPDATE, {textKey:"checkMailUpdate"});
	ZmOperation.registerOp(ZmId.OP_COMPOSE_OPTIONS, {textKey:"options", image:"Preferences"});
	ZmOperation.registerOp(ZmId.OP_CREATE_APPT, {textKey:"createAppt", image:"NewAppointment"}, ZmSetting.CALENDAR_ENABLED);
	ZmOperation.registerOp(ZmId.OP_CREATE_TASK, {textKey:"createTask", image:"NewTask"}, ZmSetting.TASKS_ENABLED);
	ZmOperation.registerOp(ZmId.OP_DELETE_CONV, {textKey:"delConv", image:"DeleteConversation"}, ZmSetting.CONVERSATIONS_ENABLED);
	ZmOperation.registerOp(ZmId.OP_DELETE_MSG, {textKey:"delMsg", image:"DeleteMessage"});
	ZmOperation.registerOp(ZmId.OP_DELETE_MENU, {tooltipKey:"deleteTooltip", image:"Delete"});
	ZmOperation.registerOp(ZmId.OP_DETACH_COMPOSE, {tooltipKey:"detachTooltip", image:"OpenInNewWindow"});
	ZmOperation.registerOp(ZmId.OP_DRAFT, null, ZmSetting.SAVE_DRAFT_ENABLED);
	ZmOperation.registerOp(ZmId.OP_EDIT_FILTER_RULE, {textKey:"filterEdit", image:"Edit"}, ZmSetting.FILTERS_ENABLED);
	ZmOperation.registerOp(ZmId.OP_FORWARD, {textKey:"forward", tooltipKey:"forwardTooltip", image:"Forward", shortcut:ZmKeyMap.FORWARD, textPrecedence:46});
	ZmOperation.registerOp(ZmId.OP_FORWARD_ATT, {textKey:"forwardAtt", tooltipKey:"forwardAtt", image:"Forward"});
	ZmOperation.registerOp(ZmId.OP_FORWARD_INLINE, {textKey:"forwardInline", tooltipKey:"forwardTooltip", image:"Forward"});
	ZmOperation.registerOp(ZmId.OP_IM, {textKey:"newIM", image:"ImStartChat", tooltipKey:"imNewChat"}, ZmSetting.IM_ENABLED);
	ZmOperation.registerOp(ZmId.OP_INC_ATTACHMENT, {textKey:"includeMenuAttachment"});
    ZmOperation.registerOp(ZmId.OP_INC_BODY, {textKey:"includeMenuBody"});
	ZmOperation.registerOp(ZmId.OP_INC_NONE, {textKey:"includeMenuNone"});
	ZmOperation.registerOp(ZmId.OP_INC_SMART, {textKey:"includeMenuSmart"});
	ZmOperation.registerOp(ZmId.OP_INCLUDE_HEADERS, {textKey:"includeHeaders"});
	ZmOperation.registerOp(ZmId.OP_MARK_READ, {textKey:"markAsRead", image:"ReadMessage", shortcut:ZmKeyMap.MARK_READ});
	ZmOperation.registerOp(ZmId.OP_MARK_UNREAD, {textKey:"markAsUnread", image:"UnreadMessage", shortcut:ZmKeyMap.MARK_UNREAD});
	ZmOperation.registerOp(ZmId.OP_MOVE_DOWN_FILTER_RULE, {textKey:"filterMoveDown", image:"DownArrow"}, ZmSetting.FILTERS_ENABLED);
	ZmOperation.registerOp(ZmId.OP_MOVE_UP_FILTER_RULE, {textKey:"filterMoveUp", image:"UpArrow"}, ZmSetting.FILTERS_ENABLED);
	ZmOperation.registerOp(ZmId.OP_NEW_MESSAGE, {textKey:"newEmail", tooltipKey:"newMessageTooltip", image:"NewMessage", shortcut:ZmKeyMap.NEW_MESSAGE});
	ZmOperation.registerOp(ZmId.OP_NEW_MESSAGE_WIN, {textKey:"newEmail", tooltipKey:"newMessageTooltip", image:"NewMessage", shortcut:ZmKeyMap.NEW_MESSAGE_WIN});
	ZmOperation.registerOp(ZmId.OP_REMOVE_FILTER_RULE, {textKey:"filterRemove", image:"Delete"}, ZmSetting.FILTERS_ENABLED);
	ZmOperation.registerOp(ZmId.OP_REPLY, {textKey:"reply", tooltipKey:"replyTooltip", image:"Reply", shortcut:ZmKeyMap.REPLY, textPrecedence:50});
	ZmOperation.registerOp(ZmId.OP_REPLY_ACCEPT, {textKey:"replyAccept", image:"Check"});
	ZmOperation.registerOp(ZmId.OP_REPLY_ALL, {textKey:"replyAll", tooltipKey:"replyAllTooltip", image:"ReplyAll", shortcut:ZmKeyMap.REPLY_ALL, textPrecedence:48});
	ZmOperation.registerOp(ZmId.OP_REPLY_CANCEL);
	ZmOperation.registerOp(ZmId.OP_REPLY_DECLINE, {textKey:"replyDecline", image:"Cancel"});
	ZmOperation.registerOp(ZmId.OP_REPLY_MODIFY);
	ZmOperation.registerOp(ZmId.OP_REPLY_NEW_TIME, {textKey:"replyNewTime", image:"NewTime"});
	ZmOperation.registerOp(ZmId.OP_REPLY_TENTATIVE, {textKey:"replyTentative", image:"QuestionMark"});
	ZmOperation.registerOp(ZmId.OP_REQUEST_READ_RECEIPT, {textKey:"requestReadReceipt", image:"ReadMessage"});
	ZmOperation.registerOp(ZmId.OP_RESET, {textKey:"reset", image:"Refresh", tooltipKey: "refreshFilters"});
	ZmOperation.registerOp(ZmId.OP_RUN_FILTER_RULE, {textKey:"filterRun", image:"SwitchFormat"}, ZmSetting.FILTERS_ENABLED);
	ZmOperation.registerOp(ZmId.OP_SAVE_DRAFT, {textKey:"saveDraft", tooltipKey:"saveDraftTooltip", image:"DraftFolder", shortcut:ZmKeyMap.SAVE}, ZmSetting.SAVE_DRAFT_ENABLED);
	ZmOperation.registerOp(ZmId.OP_SHOW_BCC, {textKey:"showBcc"});
	ZmOperation.registerOp(ZmId.OP_SHOW_ONLY_MAIL, {textKey:"showOnlyMail", image:"Conversation"}, ZmSetting.MIXED_VIEW_ENABLED);
	ZmOperation.registerOp(ZmId.OP_SHOW_ORIG, {textKey:"showOrig", image:"Message"});
	ZmOperation.registerOp(ZmId.OP_SPAM, {textKey:"junk", tooltipKey:"junkTooltip", image:"JunkMail", shortcut:ZmKeyMap.SPAM, textPrecedence:70}, ZmSetting.SPAM_ENABLED);
	ZmOperation.registerOp(ZmId.OP_USE_PREFIX, {textKey:"usePrefix"});
};

/**
 * @private
 */
ZmMailApp.prototype._registerItems =
function() {
	ZmItem.registerItem(ZmItem.CONV,
						{app:			ZmApp.MAIL,
						 nameKey:		"conversation",
						 countKey:	    "typeConversation",
						 icon:			"Conversation",
						 soapCmd:		"ConvAction",
						 itemClass:		"ZmConv",
						 node:			"c",
						 organizer:		ZmOrganizer.FOLDER,
						 dropTargets:	[ZmOrganizer.FOLDER, ZmOrganizer.TAG, ZmOrganizer.ZIMLET],
						 searchType:	"conversation",
						 resultsList:
		AjxCallback.simpleClosure(function(search) {
			AjxDispatcher.require("MailCore");
			return new ZmMailList(ZmItem.CONV, search);
		}, this)
						});

	ZmItem.registerItem(ZmItem.MSG,
						{app:			ZmApp.MAIL,
						 nameKey:		"message",
						 countKey:  	"typeMessage",
						 icon:			"Message",
						 soapCmd:		"MsgAction",
						 itemClass:		"ZmMailMsg",
						 node:			"m",
						 organizer:		ZmOrganizer.FOLDER,
						 dropTargets:	[ZmOrganizer.FOLDER, ZmOrganizer.TAG, ZmOrganizer.ZIMLET],
						 searchType:	"message",
						 resultsList:
		AjxCallback.simpleClosure(function(search) {
			AjxDispatcher.require("MailCore");
			return new ZmMailList(ZmItem.MSG, search);
		}, this)
						});

	ZmItem.registerItem(ZmItem.ATT,
						{app:			ZmApp.MAIL,
						 nameKey:		"attachment",
						 icon:			"Attachment",
						 itemClass:		"ZmMimePart",
						 node:			"mp",
						 resultsList:
		AjxCallback.simpleClosure(function(search) {
			return new ZmMailList(ZmItem.ATT, search);
		}, this)
						});
};

/**
 * @private
 */
ZmMailApp.prototype._setupSearchToolbar =
function() {
	if (appCtxt.get(ZmSetting.MAIL_ENABLED)) {
		ZmSearchToolBar.addMenuItem(ZmId.SEARCH_MAIL,
									{msgKey:		"searchMail",
									 tooltipKey:	"searchMail",
									 icon:			"Message",
									 shareIcon:		"SharedMailFolder",
									 id:			ZmId.getMenuItemId(ZmId.SEARCH, ZmId.SEARCH_MAIL)
									});
	}
};

ZmMailApp.prototype._registerApp =
function() {
	var newItemOps = {};
	newItemOps[ZmOperation.NEW_MESSAGE] = "message";

	var actionCodes = {};
	actionCodes[ZmKeyMap.NEW_MESSAGE]		= ZmOperation.NEW_MESSAGE;
	actionCodes[ZmKeyMap.NEW_MESSAGE_WIN]	= ZmOperation.NEW_MESSAGE_WIN;

	ZmApp.registerApp(ZmApp.MAIL,
							 {mainPkg:				"MailCore",
							  nameKey:				"mail",
							  icon:					"MailApp",
							  textPrecedence:		70,
							  chooserTooltipKey:	"goToMail",
							  viewTooltipKey:		"displayMailToolTip",
							  defaultSearch:		appCtxt.isChildWindow ? null : ZmId.SEARCH_MAIL,
							  organizer:			ZmOrganizer.FOLDER,
							  overviewTrees:		[ZmOrganizer.FOLDER, ZmOrganizer.SEARCH, ZmOrganizer.TAG],
							  assistants:			{"ZmMailAssistant":"Mail"},
							  searchTypes:			[ZmItem.MSG, ZmItem.CONV],
							  newItemOps:			newItemOps,
							  actionCodes:			actionCodes,
							  gotoActionCode:		ZmKeyMap.GOTO_MAIL,
							  newActionCode:		ZmKeyMap.NEW_MESSAGE,
							  qsViews:				["compose", "msg"],
							  trashViewOp:			ZmOperation.SHOW_ONLY_MAIL,
							  chooserSort:			10,
							  defaultSort:			10,
							  upsellUrl:			ZmSetting.MAIL_UPSELL_URL
							  });
};

// App API

ZmMailApp.prototype.startup =
function(result) {
};

/**
 * Normalize the notifications that occur when a virtual conv gets promoted to a real conv.
 * For example, a virtual conv with ID -676 and one msg (ID 676) receives a second msg (ID 677)
 * and becomes a real conv with an ID of 678. The following notifications will arrive:
 *
 *		deleted:	-676
 *		created:	c {id:678, n:2}
 *					m {id:677, cid:678}
 *		modified:	m {id:676, cid:678}
 *
 * Essentially, we want to handle this as:
 *
 * 		created:	m {id:677, cid:678}
 *		modified:	c {id:-676, _newId: 678}
 * 					m {id:676, cid:678}
 *
 * @private
 */
ZmMailApp.prototype.preNotify =
function(notify) {
	if (!(notify.deleted && notify.created && notify.modified))	{ return notify; }

	// first, see if we are deleting any virtual convs (which have negative IDs)
	var virtConvDeleted = false;
	var deletedIds = notify.deleted.id.split(",");
	var virtConv = {};
	var newDeletedIds = [];
	for (var i = 0; i < deletedIds.length; i++) {
		var id = deletedIds[i];
		var nId = ZmOrganizer.normalizeId(id);
		if (nId < 0) {
			virtConv[nId] = true;
			virtConvDeleted = true;
		} else {
			newDeletedIds.push(id);
		}
	}
	if (!virtConvDeleted) { return notify; }

	// look for creates of convs that mean a virtual conv got promoted
	var gotNewConv = false;
	var createList = ZmRequestMgr._getObjList(notify.created);
	var createdMsgs = {};
	var createdConvs = {};
	for (var i = 0; i < createList.length; i++) {
		var create = createList[i];
		var id = create.id;
		var name = create._name;
		if (name == "m") {
			createdMsgs[id] = create;
		} else if (name == "c" && (create.n > 1)) {
			// this is *probably* a create for a real conv from a virtual conv
			createdConvs[id] = create;
			gotNewConv = true;
		}
	}
	if (!gotNewConv) { return notify; }

	// last thing to confirm virt conv promotion is msg changing cid
	var msgMoved = false;
	var newToOldCid = {};
	var modList = ZmRequestMgr._getObjList(notify.modified);
	var movedMsgs = {};
	for (var i = 0; i < modList.length; i++) {
		var mod = modList[i];
		var id = mod.id;
		var nId = ZmOrganizer.normalizeId(id);
		var name = mod._name;
		if (name == "m") {
			var virtCid = nId * -1;
			if (virtConv[virtCid] && createdConvs[mod.cid]) {
				msgMoved = true;
				movedMsgs[id] = mod;
				newToOldCid[mod.cid] = appCtxt.multiAccounts ? ZmOrganizer.getSystemId(virtCid) : virtCid;
				createdConvs[mod.cid]._wasVirtConv = true;
				createdConvs[mod.cid].m = [{id:id}];
				// go ahead and update the msg cid, since it's used in
				// notification processing for creates
				var msg = appCtxt.getById(id);
				if (msg) {
					msg.cid = mod.cid;
				}
			}
		}
	}
	if (!msgMoved) { return notify; }

	// We're promoting a virtual conv. Normalize the notifications object, and
	// process a preliminary notif that will update the virtual conv's ID to its
	// new value.

	// First, remove the virt conv from the list of deleted IDs
	if (newDeletedIds.length) {
		notify.deleted.id = newDeletedIds.join(",");
	} else {
		delete notify.deleted;
	}

	// if the first msg matched the current search, we'll want to use the conv
	// create node to create the conv later, so save it
	for (var id in createdMsgs) {
		var msgCreate = createdMsgs[id];
		var convCreate = createdConvs[msgCreate.cid];
		if (convCreate && convCreate._wasVirtConv) {
			msgCreate._convCreateNode = convCreate;
		}
	}

	// create modified notifs for the virtual convs that have been promoted, using
	// the create notif for the conv as a base
	var newMods = [];
	for (var cid in newToOldCid) {
		var node = createdConvs[cid];
		node.id = newToOldCid[cid];
		node._newId = cid;
		newMods.push(node);
	}

	// Go ahead and process these changes, which will change the ID of each promoted conv
	// from its virtual (negative) ID to its real (positive) one. That will replace the DOM
	// IDs of that conv's elements with ones that reflect the new conv ID.
	if (newMods.length) {
		var mods = {};
		mods["c"] = newMods;
		appCtxt.getRequestMgr()._handleModifies(mods);
	}
};

/**
 * For mail creates, there is no authoritative list (mail lists are always the result
 * of a search), so we notify each ZmMailList that we know about. To make life easier,
 * we figure out which folder(s) a conv spans before we hand it off.
 * <p>
 * Since the offline client may receive hundreds of create notifications at a time, we
 * make sure a create notification is relevant before creating a mail item.</p>
 *
 * @param creates	[hash]		hash of create notifications
 * 
 * @private
 */
ZmMailApp.prototype.createNotify =
function(creates, force) {
	if (!creates["m"] && !creates["c"] && !creates["link"]) { return; }
	if (!force && !this._noDefer && this._deferNotifications("create", creates)) { return; }

	if (creates["link"]) {
		var list = creates["link"];
		for (var i = 0; i < list.length; i++) {
			var create = list[i];
			if (appCtxt.cacheGet(create.id)) { continue; }
			this._handleCreateLink(create, ZmOrganizer.FOLDER);
		}
	}

	if (this._tradController && (appCtxt.getCurrentController() == this._tradController)) {
		// can't get to another controller without running a search
		this._checkList(creates, this._tradController.getList(), this._tradController);
	} else {
		// these two controllers can be active together without an intervening search
		if (this._convListController) {
			this._checkList(creates, this._convListController.getList(), this._convListController);
		}
		if (this._convController) {
			this._checkList(creates, this._convController.getList(), this._convController);
		}
	}

	this._handleAlerts(creates);
};

ZmMailApp.prototype._handleAlerts =
function(creates) {
	var mailCreates = creates["m"] || [];
	if (mailCreates.length == 0) { return; }

	AjxDispatcher.require("Alert");

	var activeAcct = appCtxt.getActiveAccount();
	var didAppAlert, didSoundAlert, didBrowserAlert = false;

	var toasterCount = 0;

	for (var i = 0; i < mailCreates.length; i++) {
		var mc = mailCreates[i];
		var parsedId = (mc && mc.f && (mc.f.indexOf(ZmItem.FLAG_UNREAD) != -1))
			? ZmOrganizer.parseId(mc.l) : null;

		if (parsedId && parsedId.id == ZmOrganizer.ID_INBOX) {
			var acct = parsedId.account;
			if (!acct || (acct && acct.isOfflineInitialSync())) { continue; }

			// for multi-account, highlite the non-active accordion item
			if (appCtxt.accountList.size() > 1) {
				ZmAccountAlert.get(acct).start(this);
			}

			// alert mail app tab for the active account and set flag so we only do it *once*
			if (!didAppAlert && acct == activeAcct &&
				appCtxt.get(ZmSetting.MAIL_NOTIFY_APP, null, acct))
			{
				this.startAlert();
				didAppAlert = true;
			}

			// do audible alert for this account and set flag so we only do it *once*
			if (!didSoundAlert && appCtxt.get(ZmSetting.MAIL_NOTIFY_SOUNDS, null, acct)) {
				ZmSoundAlert.getInstance().start();
				didSoundAlert = true;
			}

			// do browser alert for this account and set flag so we only do it *once*
			if (!didBrowserAlert && appCtxt.get(ZmSetting.MAIL_NOTIFY_BROWSER, null, acct)) {
				ZmBrowserAlert.getInstance().start(ZmMsg.newMessage);
				didBrowserAlert = true;
			}

			// generate toaster message if applicable
			if (appCtxt.get(ZmSetting.MAIL_NOTIFY_TOASTER, null, acct) &&
				toasterCount < 5)
			{
				var msg = appCtxt.getById(mc.id) || ZmMailMsg.createFromDom(mc, {});
				var text = (msg.subject)
					? ([msg.subject, " - ", (msg.fragment || "")].join(""))
					: (msg.fragment || "");

				var from = msg.getAddress(AjxEmailAddress.FROM);
				var email = from.getName() || from.getAddress();
				var title = (appCtxt.accountList.size() > 1)
					? AjxMessageFormat.format(ZmMsg.newMailWithAccount, [email, acct.getDisplayName()])
					: AjxMessageFormat.format(ZmMsg.newMail, email);
				ZmDesktopAlert.getInstance().start(title, text);
				toasterCount++;
			}
		}
	}
};

/**
 * We can only handle new mail notifications if:
 *  	- we are currently in a mail view
 *		- the view is the result of a matchable search
 *
 * @param {Hash}	creates		the JSON create objects
 * @param {ZmMailList}	list			the mail list to notify
 * @param {ZmMailListController}	controller	the controller that owns list
 * 
 * @private
 */
ZmMailApp.prototype._checkList =
function(creates, list, controller) {

	if (!(list && list instanceof ZmMailList)) { return; }

	var convs = {};
	var msgs = {};
	var folders = {};

	// make sure current search is matchable (conv ctlr can just match on cid)
	if (!(list.search && list.search.matches) && (controller != this._convController)) { return; }

	var sortBy = list.search.sortBy;

	var convResults = this._checkType(creates, ZmItem.CONV, convs, list, sortBy);
	var msgResults  = this._checkType(creates, ZmItem.MSG, msgs, list, sortBy, convs);

	if (convResults.gotMail || msgResults.gotMail) {
		list.notifyCreate(convs, msgs);
	}

	// bug: 30546
	if (convResults.hasMore || msgResults.hasMore) {
		var controller;
		var vid = appCtxt.getAppViewMgr().getCurrentViewId();
		if (vid == ZmId.VIEW_CONVLIST) {
			controller = this.getConvListController();
		} else if (vid == ZmId.VIEW_TRAD) {
			controller = this.getTradController();
		}

		if (controller) {
			controller.setHasMore(true);
		}
	}
};

/**
 * Handles the creates for the given type of mail item.
 *
 * @param {Array}	creates	a list of JSON create nodes
 * @param {constant}	type		the mail item type
 * @param {Hash}	items		a hash of created mail items
 * @param {ZmMailList}	currList	the list currently being displayed to user
 * @param {constant}	sortBy	the sort order
 * @param {Hash}	convs		the convs, so we can update folders from msgs
 *
 * @return	{Hash}	a hash with booleans gotItem and gotAlertMessage
 * 
 * @private
 */
ZmMailApp.prototype._checkType =
function(creates, type, items, currList, sortBy, convs) {
	var result = { gotMail:false, hasMore:false};
	var nodeName = ZmList.NODE[type];
	var list = creates[nodeName];
	if (!(list && list.length)) { return result; }

	var throttle;
	if (appCtxt.isOffline) {
		throttle = (appCtxt.get(ZmSetting.OFFLINE_SHOW_ALL_MAILBOXES))
			? appCtxt.accountList.isInitialSyncing()
			: appCtxt.getActiveAccount().isOfflineInitialSync();
	}
	if (throttle) {
		if (!this._maxEntries) {
			var mlv = this.getMailListController().getReferenceView().getMailListView();
			this._maxEntries = mlv && mlv.calculateMaxEntries();
		}
		if (this.numEntries > this._maxEntries) {
			result.hasMore = true;
			return result;
		}
	}

	for (var i = 0; i < list.length; i++) {
		var create = list[i];
		if (create._handled) { continue; }
		create._handled = true;

		// ignore stuff we already have
		if (currList.getById(create.id) || create._wasVirtConv) { continue; }

		// new conv does not affect a list of msgs
		if (currList.type == ZmItem.MSG && type == ZmItem.CONV) { continue; }

		// perform stricter checking if we're in offline mode
		if (appCtxt.isOffline) {
			if ((ZmList.ITEM_TYPE[nodeName] != currList.type) && (currList.type != ZmItem.CONV)) {
				continue;
			}
		}

		// throttle influx of CREATE notifications during offline initial sync
		if (throttle && this.numEntries > this._maxEntries) {
			result.hasMore = true;
			break;
		}

		DBG.println(AjxDebug.DBG1, "ZmMailApp: handling CREATE for node: " + nodeName);
		var itemClass = eval(ZmList.ITEM_CLASS[type]);
		var item = itemClass.createFromDom(create, {}, true);
		items[item.id] = item;
		result.gotMail = true;
	}
	return result;
};

ZmMailApp.prototype.modifyNotify =
function(modifies, force) {
	if (!modifies["m"] && !modifies["c"]) { return; }
	if (!force && !this._noDefer && this._deferNotifications("modify", modifies)) { return; }

	this._batchNotify(modifies["m"]);
	this._batchNotify(modifies["c"]);
};

ZmMailApp.prototype.postNotify =
function(notify) {
	var lv = this._checkReplenishListView;
	if (lv && !lv._isPageless) {
		lv._checkReplenish();
		this._checkReplenishListView = null;
	}
};

ZmMailApp.prototype.refresh =
function(refresh) {

	var inbox = appCtxt.getById(ZmFolder.ID_INBOX);
	if (inbox) {
		this.setNewMailNotice(inbox);
	}

	if (!appCtxt.inStartup) {
		this.resetOverview(this.getOverviewId());
		var req = appCtxt.currentRequestParams;
		if (appCtxt.getCurrentAppName() == this._name && req.resend && req.methodName == "NoOpRequest") {
			var curView = appCtxt.getCurrentViewId();
			if (curView == ZmId.VIEW_CONVLIST || curView == ZmId.VIEW_TRAD) {
				appCtxt.getSearchController().redoSearch(this.currentSearch);
			}
		}
	}

	// Create an virtual ATTACHMENT's FOLDER
	if (appCtxt.get(ZmSetting.MAIL_ATTACH_VIEW_ENABLED)) {
		var folderTree = appCtxt.getFolderTree();
		if (!folderTree.getById(ZmFolder.ID_ATTACHMENTS)) {
			var root = appCtxt.getById(ZmOrganizer.ID_ROOT);
			var params = {
				id: ZmFolder.ID_ATTACHMENTS,
				parent: root,
				tree: root.tree,
				type: ZmOrganizer.FOLDER,
				numTotal: 1
			};
			var attachFolder = new ZmFolder(params);
			root.children.add(attachFolder);
			attachFolder._notify(ZmEvent.E_CREATE);
		}
	}
};

ZmMailApp.prototype.handleOp =
function(op, params) {
	var inNewWindow = false;
	var showLoadingPage = true;
	switch (op) {
		case ZmOperation.NEW_MESSAGE_WIN:
			inNewWindow = true;
			showLoadingPage = false;	// don't show "Loading ..." page since main window view doesn't change
		case ZmOperation.NEW_MESSAGE:
			if (!inNewWindow) {
				inNewWindow = this._inNewWindow(params && params.ev);
				showLoadingPage = false;
			}
			var loadCallback = new AjxCallback(this, this.compose, {action: ZmOperation.NEW_MESSAGE, inNewWindow:inNewWindow});
			AjxDispatcher.require(["ContactsCore", "Contacts"], false, loadCallback, null, showLoadingPage);
			break;
	}
};

// Public methods

ZmMailApp.prototype.getOverviewPanelContent =
function() {
	var firstTime = !this._overviewPanelContent;

	var overview = ZmApp.prototype.getOverviewPanelContent.apply(this, arguments);

	// bug: 42455 - highlight folder now that overview exists
	if (firstTime) {
		appCtxt.getSearchController().updateOverview();
	}

	return overview;
};

ZmMailApp.prototype.getOverviewContainer =
function() {
	var firstTime = !this._overviewContainer;

	var container = ZmApp.prototype.getOverviewContainer.apply(this, arguments);

	// bug: 42455 - highlight folder now that overview exists
	if (firstTime && !appCtxt.get(ZmSetting.OFFLINE_SHOW_ALL_MAILBOXES)) {
		appCtxt.getSearchController().updateOverview();
	}

	return container;
};

ZmMailApp.prototype.launch =
function(params, callback) {

	// set type for initial search
	this._groupBy[appCtxt.getActiveAccount().name] = appCtxt.get(ZmSetting.GROUP_MAIL_BY);

	var query;
	params = params || {};

	if (params.qsParams) {
		var view = params.qsParams.view, id = params.qsParams.id;
		if (view == "compose") {
			this._showComposeView(callback);
			return;
		} else if (id) {
			view = view || "msg";
			if (view == "list") {
				query = ["item:", id].join("");
				params.searchResponse = null;
				this._forceMsgView = true;
			} else if (view == "msg") {
				var msg = new ZmMailMsg(id, null, true);
				var msgParams = {getHtml:			appCtxt.get(ZmSetting.VIEW_AS_HTML),
								 markRead:			(appCtxt.get(ZmSetting.MARK_MSG_READ) == ZmSetting.MARK_READ_NOW),
								 callback:			new AjxCallback(this, this._handleResponseMsgLoad, [msg, callback]),
								 errorCallback:		new AjxCallback(this, this._handleErrorMsgLoad, callback)};
				msg.load(msgParams);
				return;
			}
		}
	} else if (appCtxt.get(ZmSetting.OFFLINE_SUPPORTS_MAILTO) && !appCtxt.multiAccounts) {
		if (appCtxt.getAppController().handleOfflineMailTo(location.search, callback)) { return; }
	}

	this.mailSearch(query, callback, params.searchResponse);
};

ZmMailApp.prototype._handleErrorLaunch =
function(params, ex) {
	if (ex.code == ZmCsfeException.MAIL_NO_SUCH_FOLDER ||
		ex.code == ZmCsfeException.MAIL_NO_SUCH_TAG ||
		ex.code == ZmCsfeException.MAIL_QUERY_PARSE_ERROR)
	{
		// reset the params so we default to searching the inbox which *will* work
		var newParams = {query:"in:inbox", callback:params.callback, errorCallback:null, types:params.types};
		appCtxt.getSearchController().search(newParams);
	}
};

/**
 * If we can't show the given msg, just do regular mail launch and show initial search. Make sure to
 * run the callback so that the rest of the UI is drawn.
 *
 * @param callback
 * @param ex
 * 
 * @private
 */
ZmMailApp.prototype._handleErrorMsgLoad =
function(callback, ex) {
	this.mailSearch();
	if (callback) {
		callback.run();
	}
	this._notifyRendered();
	return false;
};

ZmMailApp.prototype._handleResponseMsgLoad =
function(msg, callback) {
	AjxDispatcher.require("Startup2");
	var msgCtlr = AjxDispatcher.run("GetMsgController");
	if (msgCtlr) {
		msgCtlr.show(msg);
		if (callback) {
			callback.run();
		}
		this._notifyRendered();
	}
};

/**
 * Performs a mail search.
 * 
 * @param	{String}	query		the query
 * @param	{AjxCallback}	callback		the callback
 * @param	{Object}	response	the response
 * @param	{constant}	type		the type
 */
ZmMailApp.prototype.mailSearch =
function(query, callback, response, type) {
	var account = appCtxt.isOffline && appCtxt.inStartup && appCtxt.accountList.defaultAccount;
	if (account) {
		appCtxt.accountList.setActiveAccount(account);
	}

	var sc = appCtxt.getSearchController();
	var queryHint, noUpdateOverview;
	if (appCtxt.get(ZmSetting.OFFLINE_SHOW_ALL_MAILBOXES) &&
		appCtxt.accountList.size() > 2)
	{
		query = null;
		queryHint = appCtxt.accountList.generateQuery(ZmOrganizer.ID_INBOX);
		noUpdateOverview = true;
		sc.searchAllAccounts = true;
	}
	else {
		query = query || appCtxt.get(ZmSetting.INITIAL_SEARCH, null, account);
	}

	var types = new AjxVector();
	types.add(type || this.getGroupMailBy());

	var params = {
		searchFor:			ZmId.SEARCH_MAIL,
		query:				query,
		queryHint:			queryHint,
		types:				types,
		limit:				this.getLimit(),
		getHtml:			appCtxt.get(ZmSetting.VIEW_AS_HTML, null, account),
		noUpdateOverview:	noUpdateOverview,
		accountName:		(account && account.name),
		callback:			callback,
		response:			response
	};
	params.errorCallback = new AjxCallback(this, this._handleErrorLaunch, params);
	sc.search(params);
};

ZmMailApp.prototype._handleOfflineMailSearch =
function() {
	if (appCtxt.get(ZmSetting.OFFLINE_SUPPORTS_MAILTO)) {
		appCtxt.getAppController().handleOfflineMailTo(location.search);
	}
};

ZmMailApp.prototype.getSearchParams =
function(params) {
	params = params || {};
	if (!appCtxt.inStartup && appCtxt.get(ZmSetting.READING_PANE_ENABLED)) {
		params.fetch = true;
	}
	AjxDispatcher.require("MailCore");
    params.headers = ZmMailMsg.requestHeaders;
	return params;
};

/**
 * Shows the search results.
 * 
 * @param	{Object}	results		the results
 * @param	{AjxCallback}	callback		the callback
 */
ZmMailApp.prototype.showSearchResults =
function(results, callback) {
	var loadCallback = new AjxCallback(this, this._handleLoadShowSearchResults, [results, callback]);
	AjxDispatcher.require("MailCore", false, loadCallback, null, true);
};

ZmMailApp.prototype._handleLoadShowSearchResults =
function(results, callback) {
	var controller = (results.type == ZmItem.MSG) ? this.getTradController() : this.getConvListController();
	this.setGroupMailBy(ZmMailListController.GROUP_BY_SETTING[controller._getViewType()]);
	controller.show(results);
	if (this._forceMsgView) {
		controller.selectFirstItem();
		this._forceMsgView = false;
	}

	if (callback) {
		callback.run();
	}
	this._notifyRendered();
};

ZmMailApp.prototype._parseComposeUrl =
function(urlQueryStr){

	urlQueryStr = urlQueryStr || '';

	var match = urlQueryStr.match(/\bto=([^&]+)/);
	var to = match ? AjxStringUtil.urlComponentDecode(match[1]) : null;

	match = urlQueryStr.match(/\bsubject=([^&]+)/);
	var subject = match ? (AjxStringUtil.urlComponentDecode(match[1]).replace(/\+/g, " ")) : null;

	match = urlQueryStr.match(/\bcc=([^&]+)/);
	var cc = match ? AjxStringUtil.urlComponentDecode(match[1]) : null;

	match = urlQueryStr.match(/\bbcc=([^&]+)/);
	var bcc = match ? AjxStringUtil.urlComponentDecode(match[1]) : null;

	match = urlQueryStr.match(/\bbody=([^&]+)/);
	var body = match ? (AjxStringUtil.urlComponentDecode(match[1]).replace(/\+/g, " ")) : null;

	return {
		to: to,
		subject: subject,
		cc: cc,
		bcc: bcc,
		body: body
	};
};

ZmMailApp.prototype._showComposeView =
function(callback, queryStr) {
	var qs = queryStr || location.search;

	AjxDispatcher.require("Startup2");
	var composeController = AjxDispatcher.run("GetComposeController");

	// RFC 2368 = mailto:user@zimbra.com?(headers=values)*
	var composeParams = this._parseComposeUrl(qs);
	var to = composeParams.to;
	if (to && to.indexOf('mailto') == 0) {
		to = to.replace(/mailto:/,'');
		var mailtoQuery = to.split('?');
		composeParams.to = mailtoQuery[0];
		if (mailtoQuery.length > 1) {
			//mailto:xyz@abc.com?....
			mailtoQuery = mailtoQuery[1];
			var mailtoParams = this._parseComposeUrl(mailtoQuery);
			// mailto:user@abc.com?to=xyz@abc.com&... or mailto:?to=xyz@abc.com
			composeParams.to = composeParams.to
					? (mailtoParams.to ? [composeParams.to, ','+mailtoParams.to].join('') : composeParams.to )
					:  mailtoParams.to;
			composeParams.subject = mailtoParams.subject || composeParams.subject;
			composeParams.cc = mailtoParams.cc || composeParams.cc;
			composeParams.bcc = mailtoParams.bcc || composeParams.bcc;
			composeParams.body = mailtoParams.body || composeParams.body;
		}
	}

	var params = {
		action: ZmOperation.NEW_MESSAGE,
		toOverride: composeParams.to,
		ccOverride: composeParams.cc,
		bccOverride: composeParams.bcc,
		subjOverride: composeParams.subject,
		extraBodyText: composeParams.body,
		callback: callback
	};

	// this can happen in offlie where user clicks on mailto link and we're
	// already in compose view
	if (appCtxt.isOffline &&
		appCtxt.get(ZmSetting.OFFLINE_SUPPORTS_MAILTO) &&
		appCtxt.getCurrentViewId() == ZmId.VIEW_COMPOSE)
	{
		composeController.resetComposeForMailto(params);
	}
	else {
		composeController.doAction(params);
	}

	this._notifyRendered();
};

/**
 * Gets the controller.
 * 
 * @return	{ZmDoublePaneController}	the controller
 */
ZmMailApp.prototype.getConvListController =
function() {
	if (!this._convListController) {
		this._convListController = new ZmConvListController(this._container, this);
	}
	return this._convListController;
};

/**
 * Gets the message controller.
 * 
 * @return	{ZmMsgController}		the controller
 */
ZmMailApp.prototype.getConvController =
function() {
	if (!this._convController) {
		this._convController = new ZmConvController(this._container, this);
	}
	return this._convController;
};

/**
 * Gets the controller.
 * 
 * @return	{ZmDoublePaneController}	the controller
 */
ZmMailApp.prototype.getTradController =
function() {
	if (!this._tradController) {
		this._tradController = new ZmTradController(this._container, this);
	}
	return this._tradController;
};

/**
 * Gets the message controller.
 * 
 * @return	{ZmMsgController}		the controller
 */
ZmMailApp.prototype.getMsgController =
function(sessionId) {
	return this.getSessionController(ZmId.VIEW_MSG, "ZmMsgController", sessionId);
};

/**
 * Gets the controller.
 * 
 * @return	{ZmComposeController}	the controller
 */
ZmMailApp.prototype.getComposeController =
function(sessionId) {
	return this.getSessionController(ZmId.VIEW_COMPOSE, "ZmComposeController", sessionId);
};

ZmMailApp.prototype.getCurrentSessionId =
function(type) {
	return this._curSessionId[type];
};

ZmMailApp.prototype.getSessionController =
function(type, controllerClass, sessionId) {

	if (!this._sessionController[type]) {
		this._sessionController[type] = {};
		this._sessionId[type] = 1;
	}

	if (sessionId && this._sessionController[type][sessionId]) {
		return this._sessionController[type][sessionId];
	}

	var controllers = this._sessionController[type];
	var controller;
	for (var id in controllers) {
		if (controllers[id].inactive) {
			controller = controllers[id];
			break;
		}
	}

	sessionId = controller ? controller.sessionId : this._sessionId[type]++;

	if (!controller) {
		var ctlrClass = eval(controllerClass);
		controller = this._sessionController[type][sessionId] = new ctlrClass(this._container, this);
	}
	controller.setSessionId(type, sessionId);
	this._curSessionId[type] = sessionId;
	controller.inactive = false;

	return controller;
};

ZmMailApp.prototype.getConfirmController =
function(sessionId) {
	return this.getSessionController(ZmId.VIEW_MAIL_CONFIRM, "ZmMailConfirmController", sessionId);
};

/**
 * Gets the mail list controller.
 * 
 * @return	{ZmDoublePaneController}	the controller
 */
ZmMailApp.prototype.getMailListController =
function() {
	var groupMailBy = appCtxt.get(ZmSetting.GROUP_MAIL_BY);
	return (groupMailBy == ZmSetting.GROUP_BY_CONV) ? AjxDispatcher.run("GetConvListController") :
													  AjxDispatcher.run("GetTradController");
};

/**
 * Gets the attachment controller.
 * 
 * @return	{ZmAttachmentsController}		the controller
 */
ZmMailApp.prototype.getAttachmentsController =
function() {
	if (!this._attachmentsController) {
		this._attachmentsController = new ZmAttachmentsController(this._container, this);
	}
	return this._attachmentsController;
};

/**
 * Begins a compose session by presenting a form to the user.
 *
 * @param	{Hash}	params			a hash of parameters
 * @param {constant}	params.action		the new message, reply, forward, or an invite action
 * @param {Boolean}	params.inNewWindow		if <code>true</code>, we are in detached window
 * @param {ZmMailMsg}	params.msg			the original message (reply/forward), or address (new message)
 * @param {String}	params.toOverride 	the initial value for To: field
 * @param {String}	params.subjOverride 	the initial value for Subject: field
 * @param {String}	params.extraBodyText the canned text to prepend to body (invites)
 * @param {AjxCallback}	params.callback		the callback to run after view has been set
 * @param {String}	params.accountName	the on-behalf-of From address
 */
ZmMailApp.prototype.compose =
function(params) {
	AjxDispatcher.run("GetComposeController").doAction(params);
};

/**
 * Sets the new mail notice.
 * 
 * @param	{ZmOrganizer}	organizer		the organizer
 */
ZmMailApp.prototype.setNewMailNotice =
function(organizer) {
	var appChooser = appCtxt.getAppChooser();
	if (appChooser) {
		var mb = appChooser.getButton(ZmApp.MAIL);
		var icon = (organizer.numUnread > 0) ? "EnvelopeOpen" : "MailApp";
		mb.setImage(icon);
	}

	// if offline, always update *inbox* unread count for all accounts
	if (appCtxt.isOffline && appCtxt.get(ZmSetting.OFFLINE_SUPPORTS_DOCK_UPDATE)) {
		var unreadCount = 0;
		var list = appCtxt.accountList.visibleAccounts;
		for (var i = 0; i < list.length; i++) {
			unreadCount += (list[i].unread || 0);
		}
		if (AjxEnv.isMac && window.platform) {
			window.platform.icon().badgeText = (unreadCount > 0)
				? unreadCount : null;
		}
		else if (AjxEnv.isWindows) {
			window.platform.icon().imageSpec = (unreadCount > 0)
				? "resource://webapp/icons/default/newmail.png"
				: "resource://webapp/icons/default/launcher.ico";
			window.platform.icon().title = (unreadCount > 0)
				? AjxMessageFormat.format(ZmMsg.unreadCount, unreadCount) : null;
		}
	}
};

/**
 * Gets the "group mail by" setting. This is a convenience method to
 * convert "group mail by" between server (string) and client (int constant) versions.
 * 
 * @return	{String}	the group by mail setting
 */
ZmMailApp.prototype.getGroupMailBy =
function() {
	var groupBy = this._groupBy[appCtxt.getActiveAccount().name];
	var setting = groupBy || appCtxt.get(ZmSetting.GROUP_MAIL_BY);
	return setting ? ZmMailApp.GROUP_MAIL_BY_ITEM[setting] : ZmItem.MSG;
};

ZmMailApp.prototype.setGroupMailBy =
function(groupBy) {
	this._groupBy[appCtxt.getActiveAccount().name] = groupBy;
	appCtxt.set(ZmSetting.GROUP_MAIL_BY, groupBy);
};

// return enough for us to get a scroll bar since we are pageless
ZmMailApp.prototype.getLimit =
function(offset) {
	var limit = appCtxt.get(ZmSetting.PAGE_SIZE);
	return offset ? limit : 2 * limit;
};

/**
 * Adds a "Reply" submenu for replying to sender or all.
 *
 * @param {ZmToolBar|ZmActionMenu}	parent		the parent widget (a toolbar or action menu)
 * @return	{ZmActionMenu}	the menu
 */
ZmMailApp.addReplyMenu =
function(parent) {
	var list = [ZmOperation.REPLY, ZmOperation.REPLY_ALL];
	var menu = new ZmActionMenu({parent:parent, menuItems:list});
	parent.setMenu(menu);
	return menu;
};

/**
 * Adds a "Forward" submenu for forwarding inline or as attachment.
 *
 * @param {ZmToolBar|ZmActionMenu}	parent		the parent widget (a toolbar or action menu)
 * @return	{ZmActionMenu}	the menu
 */
ZmMailApp.addForwardMenu =
function(parent) {
	var list = [ZmOperation.FORWARD_INLINE, ZmOperation.FORWARD_ATT];
	var menu = new ZmActionMenu({parent:parent, menuItems:list});
	parent.setMenu(menu);
	return menu;
};

/**
 * Adds a data source collection.
 * 
 * @param	{ZmAccount}		account		the account
 * @return	{ZmDataSourceCollection}	the data source collection
 */
ZmMailApp.prototype.getDataSourceCollection =
function(account) {
	var appCtxt = window.parentAppCtxt || window.appCtxt;
	var activeAcct = account ? account.name : appCtxt.getActiveAccount().name;

	if (!this._dataSourceCollection[activeAcct]) {
		this._dataSourceCollection[activeAcct] = new ZmDataSourceCollection();
		if (appCtxt.getActiveAccount().isMain) {
			this._dataSourceCollection[activeAcct].initialize(appCtxt.getSettings().getInfoResponse.dataSources);
		}
	}
	return this._dataSourceCollection[activeAcct];
};

/**
 * Gets the identity collection.
 * 
 * @param	{ZmAccount}		account		the account
 * @return	{ZmIdentityCollection}	the identity collection
 */
ZmMailApp.prototype.getIdentityCollection =
function(account) {
	// child window always gets its own identitiy collection
	if (appCtxt.isChildWindow) {
		if (!this._identityCollection) {
			this._identityCollection = new ZmIdentityCollection();
		}
		return this._identityCollection;
	}

	var activeAcct = account ? account.name : appCtxt.getActiveAccount().name;

	if (!this._identityCollection[activeAcct]) {
		var ic = this._identityCollection[activeAcct] = new ZmIdentityCollection();
		ic.initialize(appCtxt.getSettings(account).getInfoResponse.identities);
	}
	return this._identityCollection[activeAcct];
};

/**
 * Gets the signature collection.
 * 
 * @param	{ZmAccount}		account		the account
 * @return	{ZmSignatureCollection}	the signature collection
 */
ZmMailApp.prototype.getSignatureCollection =
function(account) {
	var appCtxt = window.parentAppCtxt || window.appCtxt;
    account = account || appCtxt.getActiveAccount();
	var activeAcct = account.name;
    var settings = appCtxt.getSettings(account);
	if (!this._signatureCollection[activeAcct] && settings) {
		var sc = this._signatureCollection[activeAcct] = new ZmSignatureCollection();
		sc.initialize(settings.getInfoResponse.signatures);
	}
	return this._signatureCollection[activeAcct];
};

ZmMailApp.prototype._addSettingsChangeListeners =
function() {
	ZmApp.prototype._addSettingsChangeListeners.call(this);

	if (!this._settingsListener) {
		this._settingsListener = new AjxListener(this, this._settingsChangeListener);
	}

	var settings = appCtxt.getSettings();
	settings.getSetting(ZmSetting.VIEW_AS_HTML).addChangeListener(this._settingListener);
	settings.addChangeListener(this._settingsListener);
};

/**
 * Individual setting listener.
 */
ZmMailApp.prototype._settingChangeListener =
function(ev) {
	ZmApp.prototype._settingChangeListener.call(this, ev);

	if (ev.type != ZmEvent.S_SETTING) { return; }

	var setting = ev.source;
	var mlc = this.getMailListController();

	if (mlc && setting.id == ZmSetting.VIEW_AS_HTML) {
		var dpv = mlc._doublePaneView;
		var msg = dpv ? dpv.getMsg() : null;
		if (msg) {
			dpv.reset();
			dpv.setMsg(msg);
		}
	}
};

/**
 * Settings listener. Process changed settings as a group, so that we
 * don't redo the search more than once if more than one relevant mail
 * setting has changed.
 * 
 * @private
 */
ZmMailApp.prototype._settingsChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_SETTINGS) { return; }

	var list = ev.getDetail("settings");
	if (!(list && list.length)) { return; }

	var mlc = this.getMailListController();
	if (!mlc) { return; }

	var curView = mlc._currentView;
	var newView, groupByView;

	for (var i = 0; i < list.length; i++) {
		var setting = list[i];
		if (setting.id == ZmSetting.SHOW_FRAGMENTS) {
			if (curView != ZmId.VIEW_MSG) {
				newView = groupByView || curView;
			}
		}
	}
	newView = groupByView || newView;

	if (newView) {
		mlc.switchView(newView, true);
	}
};
