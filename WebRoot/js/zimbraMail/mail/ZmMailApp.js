/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
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

	this._dataSourceCollection	= {};
	this._identityCollection	= {};
	this._signatureCollection	= {};

	this.numEntries				= 0; // offline, initial sync
	this.globalMailCount		= 0; // offline, new mail count

	this._throttleStats = [];
	this._addSettingsChangeListeners();
    AjxCore.addOnloadListener(this._checkVacationReplyEnabled.bind(this));
};

ZmMailApp.prototype = new ZmApp;
ZmMailApp.prototype.constructor = ZmMailApp;

ZmMailApp.prototype.isZmMailApp = true;
ZmMailApp.prototype.toString = function() {	return "ZmMailApp"; };

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

ZmMailApp.DEFAULT_AUTO_SAVE_DRAFT_INTERVAL	= 15;
ZmMailApp.AUTO_SAVE_IDLE_TIME           	= 3;
ZmMailApp.DEFAULT_MAX_MESSAGE_SIZE			= 250000;

ZmMailApp.POP_DOWNLOAD_SINCE_ALL			= 0;
ZmMailApp.POP_DOWNLOAD_SINCE_NO_CHANGE		= 1;
ZmMailApp.POP_DOWNLOAD_SINCE_FROM_NOW		= 2;

ZmMailApp.POP_DELETE_OPTION_KEEP            = "keep";
ZmMailApp.POP_DELETE_OPTION_READ            = "read";
ZmMailApp.POP_DELETE_OPTION_TRASH           = "trash";
ZmMailApp.POP_DELETE_OPTION_HARD_DELETE     = "delete";

ZmMailApp.SEND_RECEIPT_NEVER				= "never";
ZmMailApp.SEND_RECEIPT_ALWAYS				= "always";
ZmMailApp.SEND_RECEIPT_PROMPT				= "prompt";

ZmMailApp.INC_MAP = {};
ZmMailApp.INC_MAP[ZmSetting.INC_NONE]			= [ZmSetting.INC_NONE, false, false];
ZmMailApp.INC_MAP[ZmSetting.INC_ATTACH]			= [ZmSetting.INC_ATTACH, false, false];
ZmMailApp.INC_MAP[ZmSetting.INC_BODY]			= [ZmSetting.INC_BODY, false, true];
ZmMailApp.INC_MAP[ZmSetting.INC_BODY_ONLY]		= [ZmSetting.INC_BODY, false, false];
ZmMailApp.INC_MAP[ZmSetting.INC_BODY_PRE]		= [ZmSetting.INC_BODY, true, false];
ZmMailApp.INC_MAP[ZmSetting.INC_BODY_HDR]		= [ZmSetting.INC_BODY, false, true];
ZmMailApp.INC_MAP[ZmSetting.INC_BODY_PRE_HDR]	= [ZmSetting.INC_BODY, true, true];
ZmMailApp.INC_MAP[ZmSetting.INC_SMART]			= [ZmSetting.INC_SMART, false, false];
ZmMailApp.INC_MAP[ZmSetting.INC_SMART_PRE]		= [ZmSetting.INC_SMART, true, false];
ZmMailApp.INC_MAP[ZmSetting.INC_SMART_HDR]		= [ZmSetting.INC_SMART, false, true];
ZmMailApp.INC_MAP[ZmSetting.INC_SMART_PRE_HDR]	= [ZmSetting.INC_SMART, true, true];

ZmMailApp.INC_MAP_REV = {};

AjxUtil.foreach(ZmMailApp.INC_MAP, function(v, i) {
	var key = (i == ZmSetting.INC_NONE || i == ZmSetting.INC_ATTACH) ?
		v[0] : v.join("|");
	ZmMailApp.INC_MAP_REV[key] = i;
});

ZmMailApp.GROUP_MAIL_BY_ITEM	= {};
ZmMailApp.GROUP_MAIL_BY_ITEM[ZmSetting.GROUP_BY_CONV]		= ZmItem.CONV;
ZmMailApp.GROUP_MAIL_BY_ITEM[ZmSetting.GROUP_BY_MESSAGE]	= ZmItem.MSG;

// Construction

ZmMailApp.prototype._defineAPI =
function() {
	AjxDispatcher.setPackageLoadFunction("MailCore", new AjxCallback(this, this._postLoadCore));
	AjxDispatcher.setPackageLoadFunction("Mail", new AjxCallback(this, this._postLoad, ZmOrganizer.FOLDER));
	AjxDispatcher.registerMethod("Compose", ["MailCore", "Mail"], new AjxCallback(this, this.compose));
	AjxDispatcher.registerMethod("GetComposeController", ["MailCore", "Mail"], new AjxCallback(this, this.getComposeController));
	AjxDispatcher.registerMethod("GetConvController", ["MailCore", "Mail"], new AjxCallback(this, this.getConvController));
	AjxDispatcher.registerMethod("GetConvListController", ["MailCore", "Mail"], new AjxCallback(this, this.getConvListController));
	AjxDispatcher.registerMethod("GetMsgController", ["MailCore", "Mail"], new AjxCallback(this, this.getMsgController));
	AjxDispatcher.registerMethod("GetTradController", ["MailCore", "Mail"], new AjxCallback(this, this.getTradController));
	AjxDispatcher.registerMethod("GetMailListController", "MailCore", new AjxCallback(this, this.getMailListController));
	AjxDispatcher.registerMethod("GetIdentityCollection", "MailCore", new AjxCallback(this, this.getIdentityCollection));
	AjxDispatcher.registerMethod("GetSignatureCollection", "MailCore", new AjxCallback(this, this.getSignatureCollection));
	AjxDispatcher.registerMethod("GetDataSourceCollection", "MailCore", new AjxCallback(this, this.getDataSourceCollection));
	AjxDispatcher.registerMethod("GetMailConfirmController", ["MailCore","Mail"], new AjxCallback(this, this.getConfirmController));
};

ZmMailApp.prototype._registerSettings =
function(settings) {
	var settings = settings || appCtxt.getSettings();
	settings.registerSetting("ALLOW_ANY_FROM_ADDRESS",			{name:"zimbraAllowAnyFromAddress", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
    settings.registerSetting("AUTO_READ_RECEIPT_ENABLED",		{name:"zimbraPrefMailRequestReadReceipts", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("AUTO_SAVE_DRAFT_INTERVAL",		{name:"zimbraPrefAutoSaveDraftInterval", type:ZmSetting.T_PREF, dataType:ZmSetting.D_LDAP_TIME, defaultValue:ZmMailApp.DEFAULT_AUTO_SAVE_DRAFT_INTERVAL, isGlobal:true});
    settings.registerSetting("COLLAPSE_IMAP_TREES",				{type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("COLOR_MESSAGES",					{name:"zimbraPrefColorMessagesEnabled", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue: false, isGlobal:true});
	settings.registerSetting("COMPOSE_SAME_FORMAT",				{name:"zimbraPrefForwardReplyInOriginalFormat", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false, isGlobal:true});
	settings.registerSetting("CONVERSATIONS_ENABLED",			{name:"zimbraFeatureConversationsEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("CONVERSATION_ORDER",				{name:"zimbraPrefConversationOrder", type:ZmSetting.T_PREF, defaultValue:ZmSearch.DATE_DESC, isImplicit:true});
	settings.registerSetting("CONVERSATION_PAGE_SIZE",			{type:ZmSetting.T_PREF, dataType:ZmSetting.D_INT, defaultValue:250, isGlobal:true});
    settings.registerSetting("CONV_SHOW_CALENDAR",			    {name:"zimbraPrefConvShowCalendar", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false, isImplicit:true});
 	settings.registerSetting("DEDUPE_MSG_TO_SELF",				{name:"zimbraPrefDedupeMessagesSentToSelf", type:ZmSetting.T_PREF, defaultValue:ZmSetting.DEDUPE_NONE});
    settings.registerSetting("DEDUPE_MSG_ENABLED",				{name:"zimbraPrefMessageIdDedupingEnabled", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
    settings.registerSetting("DEFAULT_DISPLAY_NAME",			{type:ZmSetting.T_PSEUDO, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("DETACH_COMPOSE_ENABLED",			{name:"zimbraFeatureComposeInNewWindowEnabled",type:ZmSetting.T_PREF,dataType:ZmSetting.D_BOOLEAN,defaultValue:true});
	settings.registerSetting("DETACH_MAILVIEW_ENABLED",			{name:"zimbraFeatureOpenMailInNewWindowEnabled",type:ZmSetting.T_PREF,dataType:ZmSetting.D_BOOLEAN,defaultValue:true});
	settings.registerSetting("DISPLAY_EXTERNAL_IMAGES",			{name:"zimbraPrefDisplayExternalImages", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false, isGlobal:true});
	settings.registerSetting("END_DATE_ENABLED",				{type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("FILTERS_ENABLED",					{name:"zimbraFeatureFiltersEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("FILTERS_MAIL_FORWARDING_ENABLED",	{name:"zimbraFeatureMailForwardingInFiltersEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("FORWARD_INCLUDE_HEADERS",			{type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:true, isGlobal:true});
	settings.registerSetting("FORWARD_INCLUDE_ORIG",			{name:"zimbraPrefForwardIncludeOriginalText", type:ZmSetting.T_PREF, defaultValue:ZmSetting.INC_BODY, isGlobal:true});
	settings.registerSetting("FORWARD_INCLUDE_WHAT",			{type:ZmSetting.T_PREF, defaultValue:ZmSetting.INC_BODY, isGlobal:true});
	settings.registerSetting("FORWARD_MENU_ENABLED",			{type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("FORWARD_USE_PREFIX",				{type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false, isGlobal:true});
	settings.registerSetting("GROUP_MAIL_BY",					{name:"zimbraPrefGroupMailBy", type:ZmSetting.T_PREF, defaultValue:ZmSetting.GROUP_BY_MESSAGE, isImplicit:true, isGlobal:true});
	settings.registerSetting("HIGHLIGHT_OBJECTS",               {name:"zimbraMailHighlightObjectsMaxSize", type:ZmSetting.T_COS, dataType:ZmSetting.D_INT, defaultValue:70});
	settings.registerSetting("HTML_SIGNATURE_ENABLED",			{type:ZmSetting.T_PREF,dataType:ZmSetting.D_BOOLEAN,defaultValue:true});
	settings.registerSetting("IDENTITIES_ENABLED",				{name:"zimbraFeatureIdentitiesEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("INITIAL_SEARCH",					{name:"zimbraPrefMailInitialSearch", type:ZmSetting.T_PREF, defaultValue:"in:inbox"});
	settings.registerSetting("INITIAL_SEARCH_ENABLED",			{name:"zimbraFeatureInitialSearchPreferenceEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("MAIL_ATTACH_VIEW_ENABLED",		{type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("MAIL_BLACKLIST",					{type: ZmSetting.T_PREF, dataType: ZmSetting.D_LIST});
    settings.registerSetting("TRUSTED_ADDR_LIST",			    {name:"zimbraPrefMailTrustedSenderList", type: ZmSetting.T_COS, dataType: ZmSetting.D_LIST});
	settings.registerSetting("TRUSTED_ADDR_LIST_MAX_NUM_ENTRIES",	{name:"zimbraMailTrustedSenderListMaxNumEntries", type: ZmSetting.T_COS, dataType: ZmSetting.D_INT, defaultValue:100});
	settings.registerSetting("MAIL_ACTIVITYSTREAM_FOLDER",   	{name:"zimbraMailActivityStreamFolder", type:ZmSetting.T_METADATA, dataType:ZmSetting.D_INT, isImplicit:true, section:ZmSetting.M_IMPLICIT});
	settings.registerSetting("MAIL_BLACKLIST_MAX_NUM_ENTRIES",	{name:"zimbraMailBlacklistMaxNumEntries", type: ZmSetting.T_COS, dataType: ZmSetting.D_INT, defaultValue:100});
	settings.registerSetting("MAIL_FOLDER_COLORS_ENABLED",		{name:"zimbraPrefFolderColorEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("MAIL_FORWARDING_ADDRESS",			{name:"zimbraPrefMailForwardingAddress", type:ZmSetting.T_PREF});
	settings.registerSetting("MAIL_FORWARDING_ENABLED",			{name:"zimbraFeatureMailForwardingEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("MAIL_MANDATORY_SPELLCHECK",		{name:"zimbraPrefMandatorySpellCheckEnabled", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false, isGlobal:true});
	settings.registerSetting("MAIL_FROM_ADDRESS",				{name:"zimbraPrefFromAddress", type:ZmSetting.T_PREF, dataType:ZmSetting.D_LIST });
    settings.registerSetting("MAIL_FROM_ADDRESS_TYPE",			{name:"zimbraPrefFromAddressType", type:ZmSetting.T_PREF, dataType:ZmSetting.D_STRING, defaultValue:"sendAs" });
	settings.registerSetting("MAIL_LIFETIME_GLOBAL",			{name:"zimbraMailMessageLifetime", type:ZmSetting.T_COS, defaultValue:"0"}); // dataType: DURATION
	settings.registerSetting("MAIL_LIFETIME_INBOX_READ",		{name:"zimbraPrefInboxReadLifetime", type:ZmSetting.T_PREF, defaultValue:"0"}); // dataType: DURATION
	settings.registerSetting("MAIL_LIFETIME_INBOX_UNREAD",		{name:"zimbraPrefInboxUnreadLifetime", type:ZmSetting.T_PREF, defaultValue:"0"}); // dataType: DURATION
	settings.registerSetting("MAIL_LIFETIME_JUNK",				{name:"zimbraPrefJunkLifetime", type:ZmSetting.T_PREF, defaultValue:"0"}); // dataType: DURATION
	settings.registerSetting("MAIL_LIFETIME_JUNK_GLOBAL",		{name:"zimbraMailSpamLifetime", type:ZmSetting.T_COS, defaultValue:"0"}); // dataType: DURATION
	settings.registerSetting("MAIL_LIFETIME_SENT",				{name:"zimbraPrefSentLifetime", type:ZmSetting.T_PREF, defaultValue:"0"}); // dataType: DURATION
	settings.registerSetting("MAIL_LIFETIME_TRASH",				{name:"zimbraPrefTrashLifetime", type:ZmSetting.T_PREF, defaultValue:"0"}); // dataType: DURATION
	settings.registerSetting("MAIL_LIFETIME_TRASH_GLOBAL",		{name:"zimbraMailTrashLifetime", type:ZmSetting.T_COS, defaultValue:"0"}); // dataType: DURATION
	settings.registerSetting("MAIL_LOCAL_DELIVERY_DISABLED",	{name:"zimbraPrefMailLocalDeliveryDisabled", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("MAIL_NOTIFY_ALL",				    {name:"zimbraPrefShowAllNewMailNotifications", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false, isGlobal:true});
	settings.registerSetting("MAIL_NOTIFY_SOUNDS",				{name:"zimbraPrefMailSoundsEnabled", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false, isGlobal:true});
	settings.registerSetting("MAIL_NOTIFY_APP",					{name:"zimbraPrefMailFlashIcon", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false, isGlobal:true});
	settings.registerSetting("MAIL_NOTIFY_BROWSER",				{name:"zimbraPrefMailFlashTitle", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false, isGlobal:true});
	settings.registerSetting("MAIL_NOTIFY_TOASTER",				{name:"zimbraPrefMailToasterEnabled", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false, isGlobal:true});
	settings.registerSetting("MAIL_PRIORITY_ENABLED",			{name:"zimbraFeatureMailPriorityEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("MAIL_READ_RECEIPT_ENABLED",		{name:"zimbraFeatureReadReceiptsEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("MAIL_SEND_LATER_ENABLED",			{name:"zimbraFeatureMailSendLaterEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
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
    settings.registerSetting("POP_DELETE_OPTION",				{name:"zimbraPrefPop3DeleteOption", type:ZmSetting.T_PREF, dataType:ZmSetting.D_STRING, defaultValue:ZmMailApp.POP_DELETE_OPTION_HARD_DELETE});
    settings.registerSetting("POP_INCLUDE_SPAM",				{name:"zimbraPrefPop3IncludeSpam", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("READING_PANE_LOCATION",			{name:"zimbraPrefReadingPaneLocation", type:ZmSetting.T_PREF, dataType:ZmSetting.D_STRING, defaultValue:ZmSetting.RP_BOTTOM, isImplicit:true, isGlobal:true});
	settings.registerSetting("READING_PANE_LOCATION_CV",		{name:"zimbraPrefConvReadingPaneLocation", type:ZmSetting.T_PREF, dataType:ZmSetting.D_STRING, defaultValue:ZmSetting.RP_BOTTOM, isImplicit:true});
	settings.registerSetting("READING_PANE_SASH_HORIZONTAL",    {name:"zimbraPrefReadingPaneSashHorizontal", type:ZmSetting.T_METADATA, dataType:ZmSetting.D_INT, isImplicit:true, section:ZmSetting.M_IMPLICIT});
	settings.registerSetting("READING_PANE_SASH_VERTICAL",      {name:"zimbraPrefReadingPaneSashVertical", type:ZmSetting.T_METADATA, dataType:ZmSetting.D_INT, isImplicit:true, section:ZmSetting.M_IMPLICIT});
	settings.registerSetting("REPLY_INCLUDE_HEADERS",			{type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:true, isGlobal:true});
	settings.registerSetting("REPLY_INCLUDE_ORIG",				{name:"zimbraPrefReplyIncludeOriginalText", type:ZmSetting.T_PREF, defaultValue:ZmSetting.INC_BODY, isGlobal:true});
	settings.registerSetting("REPLY_INCLUDE_WHAT",				{type:ZmSetting.T_PREF, defaultValue:ZmSetting.INC_BODY, isGlobal:true});
	settings.registerSetting("REPLY_MENU_ENABLED",				{type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("REPLY_PREFIX",					{name:"zimbraPrefForwardReplyPrefixChar", type:ZmSetting.T_PREF, defaultValue:">", isGlobal:true});
	settings.registerSetting("REPLY_TO_ADDRESS",				{name:"zimbraPrefReplyToAddress", type:ZmSetting.T_PREF, dataType:ZmSetting.D_LIST });
	settings.registerSetting("REPLY_TO_ENABLED",				{name:"zimbraPrefReplyToEnabled", type:ZmSetting.T_PREF}); // XXX: Is this a list or single?
	settings.registerSetting("REPLY_USE_PREFIX",				{type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false, isGlobal:true});
	settings.registerSetting("SAVE_DRAFT_ENABLED",				{type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
    settings.registerSetting("SAVE_TO_IMAP_SENT",				{type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("SAVE_TO_SENT",					{name:"zimbraPrefSaveToSent", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:true, isGlobal:true});
	settings.registerSetting("SAVE_TO_SENT_DELEGATED_TARGET",	{name: "zimbraPrefDelegatedSendSaveTarget", type: ZmSetting.T_PREF, defaultValue: "owner", isGlobal: true});
	settings.registerSetting("SELECT_AFTER_DELETE",				{name:"zimbraPrefMailSelectAfterDelete", type:ZmSetting.T_PREF, defaultValue:ZmSetting.DELETE_SELECT_NEXT, isGlobal:true});
	settings.registerSetting("SENT_FOLDER_NAME",				{name:"zimbraPrefSentMailFolder", type:ZmSetting.T_PREF, defaultValue:"sent"});
	settings.registerSetting("SHOW_BCC",			            {type:ZmSetting.T_PREF, defaultValue:false});
    settings.registerSetting("SHOW_FRAGMENTS",					{name:"zimbraPrefShowFragments", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false, isGlobal:true});
	settings.registerSetting("SHOW_MAIL_CONFIRM",				{name:"zimbraFeatureConfirmationPageEnabled", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("SHOW_CHATS_FOLDER",				{name:"zimbraPrefShowChatsFolderInMail", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("SIGNATURE",						{name:"zimbraPrefMailSignature", type:ZmSetting.T_PREF});
	settings.registerSetting("SIGNATURE_ENABLED",				{name:"zimbraPrefMailSignatureEnabled", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("SIGNATURE_STYLE",					{name:"zimbraPrefMailSignatureStyle", type:ZmSetting.T_PREF, defaultValue:ZmSetting.SIG_OUTLOOK});
	settings.registerSetting("START_DATE_ENABLED",				{type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
    settings.registerSetting("TAB_IN_EDITOR",			        {name:"zimbraPrefTabInEditorEnabled", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
    settings.registerSetting("USE_SEND_MSG_SHORTCUT",			{name:"zimbraPrefUseSendMsgShortcut", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:true, isGlobal:true});
    settings.registerSetting("USER_FOLDERS_ENABLED",			{type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
    settings.registerSetting("VACATION_DURATION_ENABLED",		{type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
    settings.registerSetting("VACATION_DURATION_ALL_DAY",		{type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("VACATION_FROM",					{name:"zimbraPrefOutOfOfficeFromDate", type:ZmSetting.T_PREF, defaultValue:""});
    settings.registerSetting("VACATION_FROM_TIME",				{type:ZmSetting.T_PREF, defaultValue:""});
	settings.registerSetting("VACATION_MSG",					{name:"zimbraPrefOutOfOfficeReply", type:ZmSetting.T_PREF, defaultValue:""});
    settings.registerSetting("VACATION_EXTERNAL_TYPE",			{name:"zimbraPrefExternalSendersType", type:ZmSetting.T_PREF, defaultValue:"ALL"});
    settings.registerSetting("VACATION_EXTERNAL_SUPPRESS",	    {name:"zimbraPrefOutOfOfficeSuppressExternalReply", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
    settings.registerSetting("VACATION_CALENDAR_TYPE",			{name:"zimbraPrefOutOfOfficeFreeBusyStatus", type:ZmSetting.T_PREF, defaultValue:"OUTOFOFFICE"});
	settings.registerSetting("VACATION_CALENDAR_APPT_ID",		{name:"zimbraPrefOutOfOfficeCalApptID", type:ZmSetting.T_METADATA, defaultValue:"-1", isImplicit:true, section:ZmSetting.M_IMPLICIT});
    settings.registerSetting("VACATION_CALENDAR_ENABLED",		{type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
    settings.registerSetting("VACATION_EXTERNAL_MSG",			{name:"zimbraPrefOutOfOfficeExternalReply", type:ZmSetting.T_PREF, defaultValue:""});
	settings.registerSetting("VACATION_MSG_ENABLED",			{name:"zimbraPrefOutOfOfficeReplyEnabled", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
    settings.registerSetting("VACATION_EXTERNAL_MSG_ENABLED",	{name:"zimbraPrefOutOfOfficeExternalReplyEnabled", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
    settings.registerSetting("VACATION_MSG_REMIND_ON_LOGIN",	{name:"zimbraPrefOutOfOfficeStatusAlertOnLogin", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("VACATION_MSG_FEATURE_ENABLED",	{name:"zimbraFeatureOutOfOfficeReplyEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("VACATION_UNTIL",					{name:"zimbraPrefOutOfOfficeUntilDate", type:ZmSetting.T_PREF, defaultValue:""});
    settings.registerSetting("VACATION_UNTIL_TIME",				{type:ZmSetting.T_PREF, defaultValue:""});
};

ZmMailApp.prototype._registerPrefs =
function() {
	var sections = {
		MAIL: {
			title: ZmMsg.mail,
			icon: "MailApp",
			templateId: "prefs.Pages#Mail",
			priority: 10,
			precondition: ZmSetting.MAIL_PREFERENCES_ENABLED,
			prefs: [
				ZmSetting.AUTO_READ_RECEIPT_ENABLED,
				ZmSetting.DEDUPE_MSG_TO_SELF,
                ZmSetting.DEDUPE_MSG_ENABLED,
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
				ZmSetting.MAIL_NOTIFY_ALL,
				ZmSetting.MAIL_NOTIFY_APP,
				ZmSetting.MAIL_NOTIFY_BROWSER,
				ZmSetting.MAIL_NOTIFY_TOASTER,
				ZmSetting.MAIL_WHITELIST,
				ZmSetting.MAIL_SEND_READ_RECEIPTS,
				ZmSetting.MARK_MSG_READ,
				ZmSetting.NOTIF_ADDRESS,
				ZmSetting.OFFLINE_NOTIFY_NEWMAIL_ON_INBOX,
				ZmSetting.OPEN_MAIL_IN_NEW_WIN,
				ZmSetting.PAGE_SIZE,
				ZmSetting.POP_DOWNLOAD_SINCE_VALUE,
				ZmSetting.POP_DOWNLOAD_SINCE,
                ZmSetting.POP_DELETE_OPTION,
                ZmSetting.POP_INCLUDE_SPAM,
				ZmSetting.POLLING_INTERVAL,
				ZmSetting.SELECT_AFTER_DELETE,
				ZmSetting.SHOW_FRAGMENTS,
				ZmSetting.COLOR_MESSAGES,
				ZmSetting.START_DATE_ENABLED,
                ZmSetting.VACATION_DURATION_ENABLED,
                ZmSetting.VACATION_DURATION_ALL_DAY,
				ZmSetting.VACATION_FROM,
                ZmSetting.VACATION_FROM_TIME,
                ZmSetting.VACATION_CALENDAR_ENABLED,
				ZmSetting.VACATION_MSG_ENABLED,
				ZmSetting.VACATION_MSG,
                ZmSetting.VACATION_EXTERNAL_MSG_ENABLED,
				ZmSetting.VACATION_EXTERNAL_MSG,
                ZmSetting.VACATION_EXTERNAL_TYPE,
                ZmSetting.VACATION_EXTERNAL_SUPPRESS,
                ZmSetting.VACATION_CALENDAR_TYPE,
				ZmSetting.VACATION_UNTIL,
                ZmSetting.VACATION_UNTIL_TIME,
				ZmSetting.VIEW_AS_HTML,
                ZmSetting.COMPOSE_AS_FORMAT,
				ZmSetting.COMPOSE_INIT_FONT_COLOR,
				ZmSetting.COMPOSE_INIT_FONT_FAMILY,
				ZmSetting.COMPOSE_INIT_FONT_SIZE,
				ZmSetting.FORWARD_INCLUDE_WHAT,
				ZmSetting.FORWARD_USE_PREFIX,
				ZmSetting.FORWARD_INCLUDE_HEADERS,
				ZmSetting.NEW_WINDOW_COMPOSE,
				ZmSetting.AUTO_SAVE_DRAFT_INTERVAL,
				ZmSetting.REPLY_INCLUDE_WHAT,
				ZmSetting.REPLY_USE_PREFIX,
				ZmSetting.REPLY_INCLUDE_HEADERS,
				ZmSetting.REPLY_PREFIX,
				ZmSetting.SAVE_TO_SENT,
				ZmSetting.TAB_IN_EDITOR,
				ZmSetting.USE_SEND_MSG_SHORTCUT,
                ZmSetting.COMPOSE_SAME_FORMAT,
                ZmSetting.MAIL_MANDATORY_SPELLCHECK
			],
			manageDirty: true,
			createView: function(parent, section, controller) {
				AjxDispatcher.require("Alert");
				return new ZmMailPrefsPage(parent, section, controller);
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

    ZmPref.registerPref("AUTO_READ_RECEIPT_ENABLED", {
		displayName:		ZmMsg.autoReadReceiptRequest,
		displayContainer:	ZmPref.TYPE_CHECKBOX
	});

	ZmPref.registerPref("USE_SEND_MSG_SHORTCUT", {
		displayFunc:        this.formatKeySeq.bind(this, AjxMessageFormat.format(ZmMsg.useSendMsgShortcut,[ZmKeys["compose.Send.display"]])),
		displayContainer:	ZmPref.TYPE_CHECKBOX
	});

	ZmPref.registerPref("DEDUPE_MSG_TO_SELF", {
		displayName:		ZmMsg.removeDupesToSelf,
		displayContainer:	ZmPref.TYPE_RADIO_GROUP,
		displayOptions:		[ZmMsg.dedupeNone, ZmMsg.dedupeSecondCopy, ZmMsg.dedupeAll],
		options:			[ZmSetting.DEDUPE_NONE, ZmSetting.DEDUPE_SECOND, ZmSetting.DEDUPE_ALL]
	});

    ZmPref.registerPref("DEDUPE_MSG_ENABLED", {
		displayName:		ZmMsg.autoDeleteDedupeMsg,
		displayContainer:	ZmPref.TYPE_CHECKBOX
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

    ZmPref.registerPref("TRUSTED_ADDR_LIST", {
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

	ZmPref.registerPref("MAIL_NOTIFY_ALL", {
		displayName:		ZmMsg.messageNotificationFoldersLabel,
		displayContainer:	ZmPref.TYPE_RADIO_GROUP,
		orientation:		ZmPref.ORIENT_VERTICAL,
		displayOptions:		[ ZmMsg.messageNotificationFoldersInbox, ZmMsg.messageNotificationFoldersAll ],
		options:			[ false, true ]
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
		hint:				ZmMsg.enterEmailAddress,
		setFunction:        ZmPref.setMailNotificationAddressValue
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
	ZmPref.registerPref("POP_DELETE_OPTION", {
		displayContainer:	ZmPref.TYPE_RADIO_GROUP,
		displayOptions:     [   ZmMsg.popDeleteHardDelete,
                                ZmMsg.popDeleteTrash,
                                ZmMsg.popDeleteRead,
                                ZmMsg.popDeleteKeep
                            ],
		options:            [   ZmMailApp.POP_DELETE_OPTION_HARD_DELETE,
                                ZmMailApp.POP_DELETE_OPTION_TRASH,
                                ZmMailApp.POP_DELETE_OPTION_READ,
                                ZmMailApp.POP_DELETE_OPTION_KEEP
                            ],
		precondition:       ZmSetting.POP_ENABLED
	});
	ZmPref.registerPref("POP_INCLUDE_SPAM", {
		displayName:		ZmMsg.popIncludeSpam,
		displayContainer:	ZmPref.TYPE_CHECKBOX
	});
    ZmPref.registerPref("REPLY_TO_ADDRESS", {
		displayName:		ZmMsg.replyToAddress,
		displayContainer:	ZmPref.TYPE_INPUT,
		validationFunction: ZmPref.validateEmail,
		errorMessage:       ZmMsg.invalidEmail
	});

	ZmPref.registerPref("SELECT_AFTER_DELETE", {
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
		displayContainer:	ZmPref.TYPE_CUSTOM,
        initFunction: ZmPref.regenerateSignatureEditor
	});

	ZmPref.registerPref("START_DATE_ENABLED", {
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		displayName:		ZmMsg.startOn,
		precondition:		ZmSetting.VACATION_MSG_FEATURE_ENABLED
	});

    ZmPref.registerPref("TAB_IN_EDITOR", {
        displayName:        ZmMsg.tabInEditor,
        displayContainer:	ZmPref.TYPE_CHECKBOX
    });

    ZmPref.registerPref("VACATION_DURATION_ENABLED", {
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		displayName:		ZmMsg.oooDurationLabel,
		precondition:		ZmSetting.VACATION_MSG_FEATURE_ENABLED
	});

    ZmPref.registerPref("VACATION_DURATION_ALL_DAY", {
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		displayName:		ZmMsg.oooAllDayDurationLabel,
		precondition:		ZmSetting.VACATION_MSG_FEATURE_ENABLED
	});

    ZmPref.registerPref("VACATION_CALENDAR_ENABLED", {
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		displayName:		ZmMsg.vacationCalLabel,
		precondition:		ZmSetting.VACATION_MSG_FEATURE_ENABLED
	});

	ZmPref.registerPref("VACATION_FROM", {
		displayName:		ZmMsg.startDate,
		displayContainer:	ZmPref.TYPE_INPUT,
		precondition:		ZmSetting.VACATION_MSG_FEATURE_ENABLED,
		displayFunction:	AjxDateUtil.dateGMT2Local,
		valueFunction:		AjxDateUtil.dateLocal2GMT
	});

    ZmPref.registerPref("VACATION_UNTIL", {
		displayName:		ZmMsg.endDate,
		displayContainer:	ZmPref.TYPE_INPUT,
		precondition:		ZmSetting.VACATION_MSG_FEATURE_ENABLED,
		displayFunction:	AjxDateUtil.dateGMT2Local,
		valueFunction:		AjxDateUtil.dateLocal2GMT
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
		displayName:		ZmMsg.outOfOffice,
		displayContainer:	ZmPref.TYPE_RADIO_GROUP,
        orientation:		ZmPref.ORIENT_VERTICAL,
		errorMessage:		ZmMsg.missingAwayMessage,
		displayOptions:		[ZmMsg.noAutoReplyMessage, ZmMsg.autoReplyMessage],
		options:			[false, true],
        inputId:            ["VACATION_MSG_DISABLED", "VACATION_MSG_ENABLED"]
	});

    ZmPref.registerPref("VACATION_EXTERNAL_TYPE", {  // The inside content been left empty, as we just need to register this pref with settings.
    });                                              // Depending upon the option the user has chosen in OOO vacation external select dropdown, on saving we add the relevant pref to the list that constructs the request, refer ZmPref.addOOOVacationExternalPrefToList

    ZmPref.registerPref("VACATION_EXTERNAL_SUPPRESS", {
        displayContainer:   ZmPref.TYPE_SELECT,
        displayOptions:     [ZmMsg.vacationExternalAllStandard, ZmMsg.vacationExternalAllCustom, ZmMsg.vacationExternalAllExceptABCustom, ZmMsg.vacationExternalReplySuppress],
        options:            [false, false, false, true],
        initFunction:       ZmPref.initOOOVacationExternalSuppress,
        setFunction:        ZmPref.addOOOVacationExternalPrefOnSave,
        changeFunction:     ZmPref.handleOOOVacationExternalOptionChange,
        validationFunction:	ZmMailApp.validateExternalVacationMsg,
        errorMessage:		ZmMsg.missingAwayMessage
    });

    ZmPref.registerPref("VACATION_CALENDAR_TYPE", {
		displayName:		ZmMsg.vacationExternalType,
		displayContainer:	ZmPref.TYPE_SELECT,
		displayOptions:		[ZmMsg.outOfOffice,ZmMsg.busy],
		options:			 ["OUTOFOFFICE","BUSY"]
	});

    ZmPref.registerPref("VACATION_EXTERNAL_MSG", {
		displayName:		ZmMsg.externalAwayMessage,
		displayContainer:	ZmPref.TYPE_TEXTAREA,
		maxLength:			ZmPref.MAX_LENGTH[ZmSetting.AWAY_MESSAGE],
        precondition:		ZmSetting.VACATION_MSG_FEATURE_ENABLED
	});

	ZmPref.registerPref("VACATION_EXTERNAL_MSG_ENABLED", {  // The content been left empty, as we just need to register this pref with settings.
    });                                                     // Depending upon the option the user has chosen in OOO external select dropdown, on saving we add the relevant pref to the list that constructs the request, refer ZmPref.addOOOVacationExternalPrefToList

	AjxDispatcher.require("Alert");
	var notifyText = ZmDesktopAlert.getInstance().getDisplayText();
	ZmPref.registerPref("MAIL_NOTIFY_TOASTER", {
		displayFunc:		function() { return notifyText; },
		precondition:		!!notifyText,
		displayContainer:	ZmPref.TYPE_CHECKBOX
	});

	if (appCtxt.isOffline) {
		ZmPref.registerPref("OFFLINE_NOTIFY_NEWMAIL_ON_INBOX", {
			displayContainer:	ZmPref.TYPE_RADIO_GROUP,
			displayOptions:		[ZmMsg.notifyNewMailOnInbox, ZmMsg.notifyNewMailOnAny],
			options:			[true, false]
		});
	}
};

ZmMailApp.prototype.formatKeySeq = function(keySeq) {
	// Make sure the modifierKey list is created.  This will create the modifierKeys and cache them, but not display them
	new ZmShortcutList({cols:[]});
	return ZmShortcutList._formatDisplay(keySeq);
}

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
    var isValid = (input && !(input.getSelectedValue() == "true"));
    if (!isValid)
        ZmPref.SETUP["VACATION_MSG"].errorMessage = ZmMsg.missingAwayMessage;

	return isValid
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
 * Make sure the server won't be sending out a blank away msg for the external user.
 * We are ignoring this validation in two cases :
 * a) when 'Do not send auto replies' radio button is selected
 * b) in OOO vacation external sender type, first and last option is selected, as in this case the
 * OOO external message container is not visible
 * @private
 */
ZmMailApp.validateExternalVacationMsg =
function() {
    var section = ZmPref.getPrefSectionWithPref(ZmSetting.VACATION_MSG_ENABLED);
    if (!section) { return false; }
    var view = appCtxt.getApp(ZmApp.PREFERENCES).getPrefController().getPrefsView().getView(section.id);
    var cbox = view.getFormObject(ZmSetting.VACATION_MSG_ENABLED);
    if (cbox && cbox.getSelectedValue()==="false"){ // 'Do not send auto replies' radio button is selected ..
        return true;
    }
    var externalSelect =  view.getFormObject(ZmSetting.VACATION_EXTERNAL_SUPPRESS);
    var selectOptionValue = externalSelect.getText();
    if (selectOptionValue.indexOf(ZmMsg.vacationExternalAllStandard) >=0 || selectOptionValue.indexOf(ZmMsg.vacationExternalReplySuppress) >=0) {
        return true;
    }
    var externalTxtArea = view.getFormObject(ZmSetting.VACATION_EXTERNAL_MSG);
    var awayMsg = externalTxtArea.getValue();
    return (awayMsg && (awayMsg.length > 0));
};

/**
 * @private
 */
ZmMailApp.validateExternalVacationMsgEnabled =
function(checked) {
    if (!checked) { return true; }
    var section = ZmPref.getPrefSectionWithPref(ZmSetting.VACATION_EXTERNAL_MSG);
    if (!section) { return false; }
    var view = appCtxt.getApp(ZmApp.PREFERENCES).getPrefController().getPrefsView();
    var input = view.getView(section.id).getFormObject(ZmSetting.VACATION_EXTERNAL_MSG);
    if (!input) { return false; }
    var awayMsg = input.getValue();
    return (awayMsg && (awayMsg.length > 0));
};

/**
 * @private
 */
ZmMailApp.prototype._registerOperations =
function() {
	ZmOperation.registerOp(ZmId.OP_ADD_FILTER_RULE, {textKey:"createFilter"}, ZmSetting.FILTERS_ENABLED);
	ZmOperation.registerOp(ZmId.OP_ADD_TO_FILTER_RULE, {textKey: "addToFilter", image: "MailRule"}, ZmSetting.FILTERS_ENABLED);
	ZmOperation.registerOp(ZmId.OP_ADD_SIGNATURE, {textKey:"signature", image:"AddSignature", tooltipKey:"chooseSignature"}, ZmSetting.SIGNATURES_ENABLED);
	ZmOperation.registerOp(ZmId.OP_CHECK_MAIL, {textKey:"checkMail", tooltipKey:"checkMailPrefDefault", image:"Refresh", textPrecedence:90, showImageInToolbar: true});
	ZmOperation.registerOp(ZmId.OP_CREATE_APPT, {textKey:"createAppt"}, ZmSetting.CALENDAR_ENABLED);
	ZmOperation.registerOp(ZmId.OP_CREATE_TASK, {textKey:"createTask"}, ZmSetting.TASKS_ENABLED);
	ZmOperation.registerOp(ZmId.OP_DELETE_CONV, {textKey:"delConv"}, ZmSetting.CONVERSATIONS_ENABLED);
	ZmOperation.registerOp(ZmId.OP_DELETE_MSG, {textKey:"delMsg"});
	ZmOperation.registerOp(ZmId.OP_DELETE_MENU, {textKey:"del", tooltipKey:"deleteTooltip"});
	ZmOperation.registerOp(ZmId.OP_DETACH_COMPOSE, {tooltipKey:"detachComposeTooltip", image:"OpenInNewWindow"});
	ZmOperation.registerOp(ZmId.OP_DRAFT, null, ZmSetting.SAVE_DRAFT_ENABLED);
	ZmOperation.registerOp(ZmId.OP_EDIT_FILTER_RULE, {textKey:"filterEdit", image:"Edit"}, ZmSetting.FILTERS_ENABLED);
	ZmOperation.registerOp(ZmId.OP_FORWARD, {textKey:"forward", image:"Forward", tooltipKey:"forwardTooltip", shortcut:ZmKeyMap.FORWARD, textPrecedence:46, showImageInToolbar: true, showTextInToolbar: true});
	ZmOperation.registerOp(ZmId.OP_FORWARD_ATT, {textKey:"forwardAtt", tooltipKey:"forwardAtt", image:"Forward"});
	ZmOperation.registerOp(ZmId.OP_FORWARD_CONV, {textKey:"forwardConv", tooltipKey:"forwardConv", image:"Forward"});
	ZmOperation.registerOp(ZmId.OP_FORWARD_INLINE, {textKey:"forwardInline", tooltipKey:"forwardTooltip", image:"Forward"		});
	ZmOperation.registerOp(ZmId.OP_INC_ATTACHMENT, {textKey:"includeMenuAttachment"});
    ZmOperation.registerOp(ZmId.OP_INC_BODY, {textKey:"includeMenuBody"});
	ZmOperation.registerOp(ZmId.OP_INC_NONE, {textKey:"includeMenuNone"});
	ZmOperation.registerOp(ZmId.OP_INC_SMART, {textKey:"includeMenuSmart"});
	ZmOperation.registerOp(ZmId.OP_INCLUDE_HEADERS, {textKey:"includeHeaders"});
	ZmOperation.registerOp(ZmId.OP_KEEP_READING, {textKey:"keepReading", tooltipKey:"keepReadingTooltip", shortcut:ZmKeyMap.KEEP_READING});
	ZmOperation.registerOp(ZmId.OP_MARK_READ, {textKey:"markAsRead", shortcut:ZmKeyMap.MARK_READ});
	ZmOperation.registerOp(ZmId.OP_MARK_UNREAD, {textKey:"markAsRead", shortcut:ZmKeyMap.MARK_UNREAD,image:"Check"});
	ZmOperation.registerOp(ZmId.OP_FLAG, {textKey:"flag", shortcut:ZmKeyMap.FLAG}, ZmSetting.FLAGGING_ENABLED);
	ZmOperation.registerOp(ZmId.OP_UNFLAG, {textKey:"flag", shortcut:ZmKeyMap.FLAG, image:"Check"}, ZmSetting.FLAGGING_ENABLED);
	ZmOperation.registerOp(ZmId.OP_MOVE_DOWN_FILTER_RULE, {textKey:"filterMoveDown", image:"DownArrow"}, ZmSetting.FILTERS_ENABLED);
	ZmOperation.registerOp(ZmId.OP_MOVE_TO_BCC, {textKey:"moveToBcc"});
	ZmOperation.registerOp(ZmId.OP_MOVE_TO_CC, {textKey:"moveToCc"});
	ZmOperation.registerOp(ZmId.OP_MOVE_TO_TO, {textKey:"moveToTo"});
	ZmOperation.registerOp(ZmId.OP_MOVE_UP_FILTER_RULE, {textKey:"filterMoveUp", image:"UpArrow"}, ZmSetting.FILTERS_ENABLED);
	ZmOperation.registerOp(ZmId.OP_NEW_MESSAGE, {textKey:"newEmail", tooltipKey:"newMessageTooltip", shortcut:ZmKeyMap.NEW_MESSAGE});
	ZmOperation.registerOp(ZmId.OP_NEW_MESSAGE_WIN, {textKey:"newEmail", tooltipKey:"newMessageTooltip", shortcut:ZmKeyMap.NEW_MESSAGE_WIN});
	ZmOperation.registerOp(ZmId.OP_PRIORITY_HIGH, {textKey:"priorityHigh", image:"PriorityHigh_list"});
	ZmOperation.registerOp(ZmId.OP_PRIORITY_LOW, {textKey:"priorityLow", image:"PriorityLow_list"});
	ZmOperation.registerOp(ZmId.OP_PRIORITY_NORMAL, {textKey:"priorityNormal", image:"PriorityNormal_list"});
	ZmOperation.registerOp(ZmId.OP_REMOVE_FILTER_RULE, {textKey:"filterRemove", image:"Delete"}, ZmSetting.FILTERS_ENABLED);
    ZmOperation.registerOp(ZmId.OP_REDIRECT, {textKey:"mailRedirect", tooltipKey:"mailRedirectTooltip"});
	ZmOperation.registerOp(ZmId.OP_REPLY, {textKey:"reply", image:"Reply", tooltipKey:"replyTooltip", shortcut:ZmKeyMap.REPLY, textPrecedence:50, showImageInToolbar: true, showTextInToolbar: true});
	ZmOperation.registerOp(ZmId.OP_REPLY_ALL, {textKey:"replyAll", image:"ReplyAll", tooltipKey:"replyAllTooltip", shortcut:ZmKeyMap.REPLY_ALL, textPrecedence:48, showImageInToolbar: true, showTextInToolbar: true});
	ZmOperation.registerOp(ZmId.OP_REQUEST_READ_RECEIPT, {textKey:"requestReadReceipt"});
	ZmOperation.registerOp(ZmId.OP_RESET, {textKey:"reset", image:"Refresh", tooltipKey: "refreshFilters"});
	ZmOperation.registerOp(ZmId.OP_RUN_FILTER_RULE, {textKey:"filterRun", image:"SwitchFormat"}, [ ZmSetting.MAIL_ENABLED, ZmSetting.FILTERS_ENABLED ]);
	ZmOperation.registerOp(ZmId.OP_SAVE_DRAFT, {textKey:"saveDraft", tooltipKey:"saveDraftTooltip", image:"DraftFolder", shortcut:ZmKeyMap.SAVE}, ZmSetting.SAVE_DRAFT_ENABLED);
	ZmOperation.registerOp(ZmId.OP_SEND_MENU, {textKey:"send", tooltipKey:"sendTooltip", image:"Send"}, ZmSetting.SAVE_DRAFT_ENABLED);
	ZmOperation.registerOp(ZmId.OP_SEND_LATER, {textKey:"sendLater", tooltipKey:"sendLaterTooltip", image:"SendLater"}, ZmSetting.SAVE_DRAFT_ENABLED);
	ZmOperation.registerOp(ZmId.OP_SHOW_BCC, {textKey:"showBcc"});
	ZmOperation.registerOp(ZmId.OP_SHOW_CONV, {textKey:"showConv"});
	ZmOperation.registerOp(ZmId.OP_SHOW_ORIG, {textKey:"showOrig"});
	ZmOperation.registerOp(ZmId.OP_SPAM, {textKey:"junkLabel", tooltipKey:"junkTooltip", image:"JunkMail", shortcut:ZmKeyMap.SPAM, textPrecedence:70}, ZmSetting.SPAM_ENABLED);
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
									{msgKey:		"mail",
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

	ZmApp.registerApp(ZmApp.MAIL, {
				mainPkg:			"MailCore",
				nameKey:			"mail",
				icon:				"MailApp",
				textPrecedence:		70,
				chooserTooltipKey:	"goToMail",
				viewTooltipKey:		"displayMailToolTip",
				defaultSearch:		appCtxt.isChildWindow ? null : ZmId.SEARCH_MAIL,
				organizer:			ZmOrganizer.FOLDER,
				overviewTrees:		[ZmOrganizer.FOLDER, ZmOrganizer.SEARCH, ZmOrganizer.TAG],
				searchTypes:		[ZmItem.MSG, ZmItem.CONV],
				newItemOps:			newItemOps,
				actionCodes:		actionCodes,
				gotoActionCode:		ZmKeyMap.GOTO_MAIL,
				newActionCode:		ZmKeyMap.NEW_MESSAGE,
				qsViews:			["compose", "msg"],
				chooserSort:		10,
				defaultSort:		10,
				upsellUrl:			ZmSetting.MAIL_UPSELL_URL,
                //quickCommandType:	ZmQuickCommand[ZmId.ITEM_MSG],
				searchResultsTab:	true
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
	var deletedIds = notify.deleted.id && notify.deleted.id.split(",");
	var virtConv = {};
	var newDeletedIds = [];
	if (deletedIds && deletedIds.length) {
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
	}
	if (!virtConvDeleted) {
		return notify;
	}

	// look for creates of convs that mean a virtual conv got promoted
	var gotNewConv = false;
	var createdMsgs = {};
	var createdConvs = {};
	for (var name in notify.created) {
		var list = notify.created[name];
		if (list && list.length) {
			for (var i = 0; i < list.length; i++) {
				var create = list[i];
				var id = create.id;
				var extra = (name == "m") ? "|cid=" + create.cid + "|l=" + create.l : "|n=" + create.n;
				AjxDebug.println(AjxDebug.NOTIFY, name + ": id=" + id + "|su='" + create.su + "'|f=" + create.f + "|d=" + create.d + extra);
				if (name == "m") {
					createdMsgs[id] = create;
				} else if (name == "c" && (create.n > 1)) {
					// this is *probably* a create for a real conv from a virtual conv
					createdConvs[id] = create;
					gotNewConv = true;
				}
			}
		}
	}
	if (!gotNewConv) {
		return notify;
	}

	// last thing to confirm virt conv promotion is msg changing cid
	var msgMoved = false;
	var newToOldCid = {};
	var movedMsgs = {};
	var list = notify.modified.m;
	if (list && list.length) {
		for (var i = 0; i < list.length; i++) {
			var mod = list[i];
			var id = mod.id;
			var nId = ZmOrganizer.normalizeId(id);
			var virtCid = nId * -1;
			if (virtConv[virtCid] && createdConvs[mod.cid]) {
				msgMoved = true;
				movedMsgs[id] = mod;
				newToOldCid[mod.cid] = appCtxt.multiAccounts ? ZmOrganizer.getSystemId(virtCid) : virtCid;
				createdConvs[mod.cid]._wasVirtConv = true;
				// go ahead and update the msg cid, since it's used in
				// notification processing for creates
				var msg = appCtxt.getById(id),
					folderId;
				if (msg) {
					msg.cid = mod.cid;
					folderId = msg.folderId;
				}
				createdConvs[mod.cid].m = [{
					id: id,
					l:  folderId
				}];
			}
		}
	}
	if (!msgMoved) {
		return notify;
	}

	// We're promoting a virtual conv. Normalize the notifications object, and
	// process a preliminary notif that will update the virtual conv's ID to its
	// new value.

	// First, remove the virt conv from the list of deleted IDs
	if (newDeletedIds.length) {
		notify.deleted.id = newDeletedIds.join(",");
	} else {
		delete notify.deleted;
	}

	// get rid of creates for virtual convs, since they aren't really creates
	var tmp = [];
	var list = notify.created.c;
	if (list && list.length) {
		for (var i = 0; i < list.length; i++) {
			var create = list[i];
			var c = createdConvs[create.id];
			if (!(c && c._wasVirtConv)) {
				tmp.push(create);
			}
		}
	}
	if (tmp && tmp.length) {
		notify.created.c = tmp;
	} else {
		delete notify.created.c;
	}

	// if the second msg matched the current search, we'll want to use the conv
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
	if (!force && !this._noDefer && this._deferNotifications("create", creates)) {
		AjxDebug.println(AjxDebug.NOTIFY, "ZmMailApp: skipping/deferring notifications"); 
		return;
	}

	if (creates["link"]) {
		var list = creates["link"];
		for (var i = 0; i < list.length; i++) {
			var create = list[i];
			if (appCtxt.cacheGet(create.id)) { continue; }
			this._handleCreateLink(create, ZmOrganizer.FOLDER);
		}
	}

	var controllers = this.getAllControllers();

	// Move currentController to the end of the list if it's not there already
	var currentController = this._getCurrentViewController();
	if (currentController && controllers[controllers.length - 1] !== currentController) {
		AjxUtil.arrayRemove(controllers, currentController);
		controllers.push(currentController);
	}

	// give each controller a chance to handle the creates
	for (var i = 0; i < controllers.length; i++) {
		var controller = controllers[i];
		if (controller && controller.isZmDoublePaneController) {
			this._checkList(creates, controller.getList(), controller, i == controllers.length - 1);
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
		var parsed = (mc && mc.f && (mc.f.indexOf(ZmItem.FLAG_UNREAD) != -1))
			? ZmOrganizer.parseId(mc.l) : null;

		// don't process alerts while account is undergoing initial sync
		var acct = parsed && parsed.account;
		if (!acct || (acct && acct.isOfflineInitialSync())) { continue; }

		// offline: check whether to show new-mail notification icon
		// Skip spam/trash folders and the local account
		if (appCtxt.isOffline && parsed && !acct.isMain) {
			var doIt = (appCtxt.get(ZmSetting.OFFLINE_NOTIFY_NEWMAIL_ON_INBOX))
				? (parsed.id == ZmOrganizer.ID_INBOX)
				: (parsed.id != ZmOrganizer.ID_SPAM && parsed.id != ZmOrganizer.ID_TRASH);

			if (doIt) {
				this.globalMailCount++;
				acct.inNewMailMode = true;
				var allContainers = appCtxt.getOverviewController()._overviewContainer;
				for (var j in allContainers) {
					allContainers[j].updateAccountInfo(acct, true, true);
				}
			}
		}

		if (appCtxt.get(ZmSetting.MAIL_NOTIFY_ALL) || (parsed && parsed.id == ZmOrganizer.ID_INBOX)) {
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
				var email = (from && from instanceof AjxEmailAddress) ? from.getName() || from.getAddress() :
							(from && typeof from == "string") ? from : ZmMsg.unknown;
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
 * @param {Hash}					creates		the JSON create objects
 * @param {ZmMailList}				list		the mail list to notify
 * @param {ZmMailListController}	controller	the controller that owns list
 * @param {boolean}					last		if true, okay to mark creates as handled
 * 
 * @private
 */
ZmMailApp.prototype._checkList =
function(creates, list, controller, last) {

	AjxDebug.println(AjxDebug.NOTIFY, "ZmMailApp: handling mail creates for view " + controller.getCurrentViewId());

	if (!(list && list instanceof ZmMailList)) {
		AjxDebug.println(AjxDebug.NOTIFY, "ZmMailApp: list is not a ZmMailList: " + list);
		return;
	}

	var convs = {};
	var msgs = {};

	var sortBy = list.search.sortBy;

	var convResults = this._checkType(creates, ZmItem.CONV, convs, list, sortBy, null, last);
	var msgResults  = this._checkType(creates, ZmItem.MSG, msgs, list, sortBy, convs, last);

	if (convResults.gotMail || msgResults.gotMail) {
		list.notifyCreate(convs, msgs);
	}

	// bug: 30546
	if (convResults.hasMore || msgResults.hasMore) {
		var controller = this._getCurrentViewController();
		
		if (controller) {
			controller.setHasMore(true);
		}
	}
};

ZmMailApp.prototype._getCurrentViewController =
function() {
	var controller;
	var viewType = appCtxt.getCurrentViewType();
	if (viewType == ZmId.VIEW_CONVLIST) {
		controller = this.getConvListController();
	} else if (viewType == ZmId.VIEW_TRAD) {
		controller = this.getTradController();
	}
	return controller;
};

/**
 * Handles the creates for the given type of mail item.
 *
 * @param {Array}		creates		a list of JSON create nodes
 * @param {constant}	type		the mail item type
 * @param {Hash}		items		a hash of created mail items
 * @param {ZmMailList}	currList	the list currently being displayed to user
 * @param {constant}	sortBy		the sort order
 * @param {Hash}		convs		the convs, so we can update folders from msgs
 * @param {boolean}		last		if true, okay to mark creates as handled
 *
 * @return	{Hash}	a hash with booleans gotItem and gotAlertMessage
 * 
 * @private
 */
ZmMailApp.prototype._checkType =
function(creates, type, items, currList, sortBy, convs, last) {

	var result = { gotMail:false, hasMore:false };
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
			var mlv = this.getMailListController().getCurrentView().getMailListView();
			this._maxEntries = mlv && mlv.calculateMaxEntries();
		}
		if (this.numEntries > this._maxEntries) {
			AjxDebug.println(AjxDebug.NOTIFY, "ZmMailApp: too many creates: num=" + this.numEntries + ", max=" + this._maxEntries);
			return result;
		}
	}

	var INTERVAL_LENGTH = 10 * 1000; //10 seconds
	var INTERVAL_THRESHOLD = 20; //throttle more than 20 messages.
	for (var i = 0; i < list.length; i++) {
		var create = list[i];

		// generic throttling mechanism. Do it per folder. reset every 10 seconds. If more than 40 creates arrive in this interval, stop handling them. 
		// This is used to throttle external accounts syncs but also good in general to prevent the client from hanging in case of a huge burst of updates.
		var folder = create.l || "conv"; //I bundle all conv creates together (since they don't provide folder) to make it simple. There are NOT a lot of conv creates at this stage. we mostly create them in ZmMailList.prototype.notifyCreate from messages.
		var now = new Date();
		var data = this._throttleStats[folder];
		if (!data || now.getTime() - data.intervalStart.getTime() > INTERVAL_LENGTH) {
			data = this._throttleStats[folder] = {
				intervalStart: now,
				count: 0
			}
		}
		data.count++;
		if (data.count > INTERVAL_THRESHOLD) {
			if (data.count == INTERVAL_THRESHOLD + 1) {
				DBG.println(AjxDebug.DBG1, "folder " + folder + " starting to throttle at  " + now);
			}
			result.hasMore = true;
			continue;
		}


		AjxDebug.println(AjxDebug.NOTIFY, "ZmMailApp: process create notification:");
		var extra = (type == ZmItem.MSG) ? "|cid=" + create.cid + "|l=" + create.l : "|n=" + create.n;
		AjxDebug.println(AjxDebug.NOTIFY, type + ": id=" + create.id + "|su='" + create.su + "'|f=" + create.f + "|d=" + create.d + extra);
		if (create._handled) {
			AjxDebug.println(AjxDebug.NOTIFY, "ZmMailApp: create already handled " + create.id);
			continue;
		}
		if (last) {
			create._handled = true;
		}

		// new conv does not affect a list of msgs
		if (currList.type == ZmItem.MSG && type == ZmItem.CONV) {
			AjxDebug.println(AjxDebug.NOTIFY, "ZmMailApp: msg list ignoring conv create");
			continue;
		}

		// perform stricter checking if we're in offline mode
		if (appCtxt.isOffline) {
			if ((ZmList.ITEM_TYPE[nodeName] != currList.type) && (currList.type != ZmItem.CONV)) {
				AjxDebug.println(AjxDebug.NOTIFY, "ZmMailApp: type mismatch: " + ZmList.ITEM_TYPE[nodeName] + " / " + currList.type);
				continue;
			}
		}

		// throttle influx of CREATE notifications during offline initial sync
		if (throttle && this.numEntries > this._maxEntries) {
			AjxDebug.println(AjxDebug.NOTIFY, "ZmMailApp: throttling");
			result.hasMore = true;
			break;
		}

		DBG.println(AjxDebug.DBG1, "ZmMailApp: handling CREATE for node: " + nodeName);

		var item = appCtxt.getById(create.id);
		if (!item) {
			AjxDebug.println(AjxDebug.NOTIFY, "ZmMailApp: create " + type + " object " + create.id);
			var itemClass = eval(ZmList.ITEM_CLASS[type]);
			item = itemClass.createFromDom(create, {list: currList});
		}
		else if (item.type == ZmItem.MSG) {
			// bug 47589: make sure conv knows its folders
			var conv = appCtxt.getById(item.cid);
			if (conv) {
				conv.folders[item.folderId] = true;
			}
		}
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
 
		// mark all existing mail list views as stale
		var viewIds = [ZmId.VIEW_TRAD, ZmId.VIEW_CONVLIST, ZmId.VIEW_CONV];
		var avm = appCtxt.getAppViewMgr();
		for (var i = 0; i < viewIds.length; i++) {
			var views = avm.getViewsByType(viewIds[i]);
			for (var j = 0; j < views.length; j++) {
				var dpv = avm.getViewComponent(ZmAppViewMgr.C_APP_CONTENT, views[j].id);
				if (dpv && dpv.isZmDoublePaneView) {
					dpv.isStale = true;
				}
			}
		}
		// view is normally updated when user returns to it (from whatever view
		// results from the current request); if the request doesn't result in a
		// view change, use a timer to check if it still needs to be updated
		var curViewId = appCtxt.getCurrentViewId();
		AjxTimedAction.scheduleAction(new AjxTimedAction(this, this._checkRefresh, [curViewId]), 1000);
	}
};

ZmMailApp.prototype._checkRefresh =
function(lastViewId) {

	// if the request that prompted the refresh didn't result in a view change
	// (eg NoOpRequest), rerun its underlying search
	if (appCtxt.getCurrentViewId() == lastViewId) {
		var curView = appCtxt.getCurrentView();
		if (curView && curView.isStale && curView._staleHandler) {
			curView._staleHandler();
		}
	}
};

ZmMailApp.prototype.handleOp =
function(op, params) {
	var inNewWindow = false;
	var showLoadingPage = true;
	if ((op == ZmOperation.NEW_MESSAGE_WIN) || (op == ZmOperation.NEW_MESSAGE)) {
		if (!appCtxt.isWebClientOffline()) {
			inNewWindow = (op == ZmOperation.NEW_MESSAGE_WIN) ? true : this._inNewWindow(params && params.ev);
			showLoadingPage = false;	// don't show "Loading ..." page since main window view doesn't change
		}
		var loadCallback = new AjxCallback(this, this.compose, {action: ZmOperation.NEW_MESSAGE, inNewWindow:inNewWindow});
		AjxDispatcher.require(["ContactsCore", "Contacts"], false, loadCallback, null, showLoadingPage);
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

ZmMailApp.prototype.getNewButtonProps =
function() {
	return {
		text:		ZmMsg.newMessage,
		tooltip:	ZmMsg.compose,
		defaultId:	ZmOperation.NEW_MESSAGE,
        disabled:   !this.containsWritableFolder()
	};
};

ZmMailApp.prototype.launch =
function(params, callback) {
	this._setLaunchTime(this.toString(), new Date());

    if (appCtxt.isExternalAccount()) {
        var loadCallback = this._handleLoadLaunch.bind(this, params, callback);
	    AjxDispatcher.require(["MailCore", "Mail", "Startup2"], true, loadCallback, null, true);
    }
    else {
        this._handleLoadLaunch(params, callback);
    }
};

ZmMailApp.prototype._handleLoadLaunch =
function(params, callback) {
	// set type for initial search
	this._groupBy = appCtxt.get(ZmSetting.GROUP_MAIL_BY);

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

				var list = new ZmMailList(ZmItem.MSG);
				var msg = new ZmMailMsg(id, list, true);
				list.add(msg);

				var msgParams = {getHtml:			appCtxt.get(ZmSetting.VIEW_AS_HTML),
								 markRead:			(appCtxt.get(ZmSetting.MARK_MSG_READ) == ZmSetting.MARK_READ_NOW),
								 callback:			new AjxCallback(this, this._handleResponseMsgLoad, [msg, callback]),
								 errorCallback:		new AjxCallback(this, this._handleErrorMsgLoad, callback)};
				msg.load(msgParams);
				return;
			}
		}
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
		msgCtlr.show(msg, null, null, null, true); // Show the message without pagination buttons
		if (callback) {
			callback.run();
		}
		this._notifyRendered();

		appCtxt.notifyZimlets('onMsgView', [msg, null, appCtxt.getCurrentView()], {waitUntilLoaded:true});
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
	else if(appCtxt.isExternalAccount()) {
        query = "inid:" + this.getDefaultFolderId();
    } else if (appCtxt.isWebClientOffline()) {
        query = query || "in:inbox";
    } else {
		query = query || appCtxt.get(ZmSetting.INITIAL_SEARCH, null, account);
	}

	var types = new AjxVector();
	types.add(type || this.getGroupMailBy());
	var sortBy = AjxUtil.get(response, "Body", "SearchResponse", "sortBy") || ZmSearch.DATE_DESC;

	var params = {
		searchFor:			ZmId.SEARCH_MAIL,
		query:				query,
		queryHint:			queryHint,
		types:				types,
		limit:				this.getLimit(),
		getHtml:			appCtxt.get(ZmSetting.VIEW_AS_HTML, null, account),
		noUpdateOverview:	noUpdateOverview,
        offlineCache:       true,
		accountName:		(account && account.name),
		callback:			callback,
		response:			response,
		sortBy:             sortBy
	};
	params.errorCallback = new AjxCallback(this, this._handleErrorLaunch, params);
	sc.search(params);
};

/**
 * Shows the search results.
 * 
 * @param	{Object}					results						the results
 * @param	{AjxCallback}				callback					the callback
 * @param 	{ZmSearchResultsController}	searchResultsController		owning controller
 */
ZmMailApp.prototype.showSearchResults =
function(results, callback, searchResultsController) {
	var loadCallback = this._handleLoadShowSearchResults.bind(this, results, callback, searchResultsController);
	AjxDispatcher.require("MailCore", false, loadCallback, null, true);
};

ZmMailApp.prototype._handleLoadShowSearchResults =
function(results, callback, searchResultsController) {

	var sessionId = searchResultsController ? searchResultsController.getCurrentViewId() : ZmApp.MAIN_SESSION;
	var controller = ((results.type == ZmItem.MSG) || !appCtxt.get(ZmSetting.CONVERSATIONS_ENABLED)) ? this.getTradController(sessionId, searchResultsController) :
													this.getConvListController(sessionId, searchResultsController);
	controller.show(results);
	this._setLoadedTime(this.toString(), new Date());
	
	if (this._forceMsgView) {
		controller.selectFirstItem();
		this._forceMsgView = false;
	}

	if (callback) {
		callback.run(controller);
	}
	this._notifyRendered();

	// update the title to reflect the new search results
	appCtxt.getAppViewMgr().updateTitle();
};

ZmMailApp.prototype._parseComposeUrl =
function(urlQueryStr){

	urlQueryStr = urlQueryStr || '';
	urlQueryStr.replace(/^mailto:/i, "");

	//Decode the whole query string. Components will be decoded as well, but that's okay since it should do no harm and the query string may have been double-encoded as well (once by user to trick crawlers, then again by the browser in constructing the mailto URL).
	urlQueryStr = AjxStringUtil.urlComponentDecode(urlQueryStr);

	var match = urlQueryStr.match(/\bto=([^&]+)/i);
	var to = match ? AjxStringUtil.urlComponentDecode(match[1].replace(/\+/g, " ")) : null;
	to = to && AjxEmailAddress.isValid(to) ? AjxStringUtil.urlComponentDecode(to) : AjxStringUtil.htmlEncode(to);
	
	match = urlQueryStr.match(/\bsubject=([^&]+)/i);
	var subject = match ? (AjxStringUtil.urlComponentDecode(match[1]).replace(/\+/g, " ")) : null;

	match = urlQueryStr.match(/\bcc=([^&]+)/i);
	var cc = match ? AjxStringUtil.urlComponentDecode(match[1].replace(/\+/g, " ")) : null;
	cc = cc && AjxEmailAddress.isValid(cc) ? cc : AjxStringUtil.htmlEncode(cc);
	
	match = urlQueryStr.match(/\bbcc=([^&]+)/i);
	var bcc = match ? AjxStringUtil.urlComponentDecode(match[1].replace(/\+/g, " ")) : null;
	bcc = bcc && AjxEmailAddress.isValid(bcc) ? bcc : AjxStringUtil.htmlEncode(bcc);
	
	match = urlQueryStr.match(/\bbody=([^&]+)/i);
	var body = match ? (AjxStringUtil.urlComponentDecode(match[1]).replace(/\+/g, " ")) : null;

	return {
		to: to,
		subject: AjxStringUtil.htmlEncode(subject),
		cc: cc,
		bcc: bcc,
		body: AjxStringUtil.htmlEncode(body)
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
		extraBodyTextIsExternal: Boolean(composeParams.body),
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
    return composeController;
};

/**
 * Returns a conversation list controller.
 * 
 * @return	{ZmConvListController}	conversation list controller
 */
ZmMailApp.prototype.getConvListController =
function(sessionId, searchResultsController) {
	return this.getSessionController({controllerClass:			"ZmConvListController",
									  sessionId:				sessionId || ZmApp.MAIN_SESSION,
									  searchResultsController:	searchResultsController});
};

/**
 * Returns a conversation controller.
 * 
 * @return	{ZmConvController}		conversation controller
 */
ZmMailApp.prototype.getConvController =
function(sessionId) {
	return this.getSessionController({controllerClass:	"ZmConvController",
									  sessionId:		sessionId});
};

/**
 * Gets the traditional (msg list) controller.
 * 
 * @return	{ZmTradController}	traditional controller
 */
ZmMailApp.prototype.getTradController =
function(sessionId, searchResultsController) {
	return this.getSessionController({controllerClass:			"ZmTradController",
									  sessionId:				sessionId || ZmApp.MAIN_SESSION,
									  searchResultsController:	searchResultsController});
};

/**
 * Gets the message controller.
 * 
 * @return	{ZmMsgController}		message controller
 */
ZmMailApp.prototype.getMsgController =
function(sessionId) {

    // if message is already open get that session controller
    var controllers = this._sessionController[ZmId.VIEW_MSG];
    var controller;
    for (var id in controllers) {
        if (!controllers[id].isHidden && controllers[id].getMsg() && controllers[id].getMsg().nId == sessionId) {
            controller = controllers[id];
            break;
        }
    }

    if (controller) {
        sessionId = controller.getSessionId();
        this._curSessionId[ZmId.VIEW_MSG] = sessionId;
        controller.inactive = false;
        return controller;
    }
        
	return this.getSessionController({controllerClass:	"ZmMsgController",
									  sessionId:		sessionId});
};

/**
 * Returns a compose controller.
 * 
 * @return	{ZmComposeController}	compose controller
 */
ZmMailApp.prototype.getComposeController =
function(sessionId) {
	return this.getSessionController({controllerClass:	"ZmComposeController",
									  sessionId:		sessionId});
};

ZmMailApp.prototype.getConfirmController =
function(sessionId) {
	return this.getSessionController({controllerClass:	"ZmMailConfirmController",
									  sessionId:		sessionId});
};

/**
 * Gets the current mail list controller, which may be conversation list or msg list (traditional).
 * 
 * @return	{ZmTradController|ZmConvListController}	mail list controller
 */
ZmMailApp.prototype.getMailListController =
function() {
	var groupMailBy = appCtxt.get(ZmSetting.GROUP_MAIL_BY) ;
	return (groupMailBy == ZmSetting.GROUP_BY_CONV) ? AjxDispatcher.run("GetConvListController") :
													  AjxDispatcher.run("GetTradController");
};

ZmMailApp.prototype.runRefresh =
function() {
	this.getMailListController().runRefresh();
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
	Dwt.setLoadingTime("ZmMailApp-compose");
	params = params || {};
	if (!params.sessionId) {
		// see if we already have a compose session for this message
		var controllers = this._sessionController[ZmId.VIEW_COMPOSE];
		var controller;
		var msgId = params.msg && params.msg.nId;
		for (var id in controllers) {
			  if (controllers[id].getMsg() && controllers[id].getMsg().nId == msgId){
				 controller = controllers[id];
				 break;
			  }
		}
	}
	
    if (!controller) {
	    controller = AjxDispatcher.run("GetComposeController", params.sessionId);
    }

    appCtxt.composeCtlrSessionId = controller.getSessionId();	// help new window dispose components
	controller.doAction(params);
	Dwt.setLoadedTime("ZmMailApp-compose");
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
    if(organizer.id == ZmOrganizer.ID_INBOX) {
        this._setFavIcon(organizer.numUnread);
    }
	this._setNewMailBadge();
};

ZmMailApp.prototype._setNewMailBadge =
function() {
	if (appCtxt.isOffline && appCtxt.get(ZmSetting.OFFLINE_SUPPORTS_DOCK_UPDATE)) {
		if (AjxEnv.isMac && window.platform) {
			window.platform.icon().badgeText = (this.globalMailCount > 0)
				? this.globalMailCount : null;
		}
		else if (AjxEnv.isWindows) {
			window.platform.icon().imageSpec = (this.globalMailCount > 0)
				? "resource://webapp/icons/default/newmail.png"
				: "resource://webapp/icons/default/launcher.ico";
			window.platform.icon().title = (this.globalMailCount > 0)
				? AjxMessageFormat.format(ZmMsg.unreadCount, this.globalMailCount) : null;
		}
	}
};

ZmMailApp.prototype.clearNewMailBadge =
function() {
	this.globalMailCount = 0;
	this._setNewMailBadge();
};

ZmMailApp.prototype._setFavIcon =
function(unread) {
    var url;
    if (unread == 0) {
        url = [appContextPath, "/img/logo/favicon.ico"].join("");
    } else if (unread > 9) {
        url = [appContextPath,"/img/logo/favicon_plus.ico"].join("");
    } else {
        url = [appContextPath, "/img/logo/favicon_", unread, ".ico"].join("");
    }
    Dwt.setFavIcon(url);
};

/**
 * Gets the "group mail by" setting. This is a convenience method to
 * convert "group mail by" between server (string) and client (int constant) versions.
 * 
 * @return	{String}	the group by mail setting
 */
ZmMailApp.prototype.getGroupMailBy =
function() {
	var setting = this._groupBy || appCtxt.get(ZmSetting.GROUP_MAIL_BY);
	return setting ? ZmMailApp.GROUP_MAIL_BY_ITEM[setting] : ZmItem.MSG;
};

ZmMailApp.prototype.setGroupMailBy =
function(groupBy, skipNotify) {
	this._groupBy = groupBy;
	appCtxt.set(ZmSetting.GROUP_MAIL_BY, groupBy, null, false, skipNotify);
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
		var settings = appCtxt.getSettings(account);
		if (settings)
			ic.initialize(settings.getInfoResponse.identities);
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
	settings.getSetting(ZmSetting.TRUSTED_ADDR_LIST).addChangeListener(this._settingListener);
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

	if (mlc && (setting.id == ZmSetting.VIEW_AS_HTML || setting.id == ZmSetting.TRUSTED_ADDR_LIST)) {
        this.resetTrustedSendersList();
		var dpv = mlc._doublePaneView;
		var msg = dpv ? dpv.getMsg() : null;
		if (msg) {
			dpv.reset();
			dpv.setItem(msg);
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

	var curView = mlc.getCurrentViewType();
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

ZmMailApp.prototype.getTrustedSendersList =
function() {
    if(!this._trustedList) {
        var trustedList = appCtxt.get(ZmSetting.TRUSTED_ADDR_LIST);
        if(trustedList) {
            this._trustedList = AjxVector.fromArray(trustedList);
        }
        else {
            this._trustedList = new AjxVector();
        }
    }
    return this._trustedList;
};

ZmMailApp.prototype.resetTrustedSendersList =
function() {
    this._trustedList = null;
};

ZmMailApp._handleOOORemindResponse = function(dialog,isTurnOff){
   ZmMailApp._hideOOORemindDialog(dialog);
   var dontRemind = document.getElementById(dialog._htmlElId + "_dontRemind");

   if(isTurnOff || dontRemind.checked){
        ZmMailApp._saveRemindStatus(isTurnOff,dontRemind.checked);
   }

};

ZmMailApp._hideOOORemindDialog=function(dialog){
    if(dialog){
        dialog.popdown();
    }
};

ZmMailApp._saveRemindStatus = function(turnOff,dontRemind) {
    var soapDoc = AjxSoapDoc.create("ModifyPrefsRequest", "urn:zimbraAccount");

    if(turnOff){
        var node = soapDoc.set("pref", "FALSE");
        node.setAttribute("name", "zimbraPrefOutOfOfficeReplyEnabled");
    }
    else if(dontRemind){
        var node = soapDoc.set("pref", "FALSE");
        node.setAttribute("name", "zimbraPrefOutOfOfficeStatusAlertOnLogin");
    }

    var paramsObj = {soapDoc:soapDoc, asyncMode:true};
    if(turnOff){paramsObj.callback=ZmMailApp._oooReplyCallback;}

    appCtxt.getAppController().sendRequest(paramsObj);
};

ZmMailApp._oooReplyCallback = function(){
    appCtxt.set(ZmSetting.VACATION_MSG_ENABLED,false);
}

ZmMailApp.prototype._isOnVacation = function() {
	if (!appCtxt.get(ZmSetting.VACATION_MSG_ENABLED)) {
		return false;  //no vacation
	}
	var from = appCtxt.get(ZmSetting.VACATION_FROM);
	var to = appCtxt.get(ZmSetting.VACATION_UNTIL);

	if (!from) {
		return true; //unlimited vacation (if from is empty, so is to)
	}

	var today = new Date();
	var formatter = new AjxDateFormat("yyyyMMddHHmmss'Z'");
	var fromDate = formatter.parse(AjxDateUtil.dateGMT2Local(from));
	var toDate = formatter.parse(AjxDateUtil.dateGMT2Local(to));
	return fromDate < today && today < toDate;
};


ZmMailApp.prototype._checkVacationReplyEnabled = function(){
    if (!appCtxt.get(ZmSetting.VACATION_MSG_REMIND_ON_LOGIN)) {
		return; //reminder not enabled
	}

	if (!this._isOnVacation()) {
		return;
	}

	var ynDialog = new DwtMessageDialog({parent:appCtxt.getShell(), buttons:[DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON], id: "VacationDialog"});
	var content = AjxTemplate.expand("mail.Message#VacationRemindDialog", {id:ynDialog._htmlElId});
	ynDialog.setTitle(ZmMsg.OOORemindDialogTitle);
	ynDialog.setContent(content);
	var dontRemind = document.getElementById(ynDialog._htmlElId + "_dontRemind");
	dontRemind.checked = false;
	ynDialog.registerCallback(DwtDialog.YES_BUTTON, ZmMailApp._handleOOORemindResponse, null, [ynDialog, true]);
	ynDialog.registerCallback(DwtDialog.NO_BUTTON, ZmMailApp._handleOOORemindResponse, null, [ynDialog, false]);
	ynDialog.popup();
};

ZmMailApp.prototype._createVirtualFolders =
function() {
    ZmOffline.addOutboxFolder();
};

ZmMailApp.prototype.resetWebClientOfflineOperations =
function() {
	ZmApp.prototype.resetWebClientOfflineOperations.apply(this);
    //Refreshing the mail list both for online and offline mode
	var isWebClientOnline = !appCtxt.isWebClientOffline();
	this.refresh();
	var folders = appCtxt.getFolderTree().getByType(ZmOrganizer.FOLDER);
	var overview = this.getOverview();
	if (folders && overview) {
		for (var i = 0; i < folders.length; i++) {
			var folder = folders[i];
			var treeItem = folder && overview.getTreeItemById(folder.id);
			if (!treeItem) {
				continue;
			}
			if (isWebClientOnline) {
				treeItem.setVisible(true);
			}
			else {
				//Don't hide ROOT folder and OUTBOX folder
				if (folder.id != ZmFolder.ID_ROOT && folder.rid != ZmFolder.ID_ROOT && folder.id != ZmFolder.ID_OUTBOX && folder.webOfflineSyncDays === 0) {
					treeItem.setVisible(false);
				}
			}
		}
	}
};

/*
 * Enables Mail preferences in case of Admin viewing user account keeping Mail App is disabled.
 */
ZmMailApp.prototype.enableMailPrefs =
function() {
	// ZmPref is unavailable, hence we load it, register settings, operations & preferences.
	AjxDispatcher.require("PreferencesCore");
	this._registerSettings();
	this._registerOperations();
	this._registerPrefs();
};

// Folders to ignore when displaying a conv's messages
ZmMailApp.FOLDERS_TO_OMIT = [ZmFolder.ID_TRASH, ZmFolder.ID_SPAM];

// returns lookup hash of folders (starting with Trash/Junk) whose messages aren't included when
// viewing or replying a conv; if we're in one of those, we still show its messages
ZmMailApp.getFoldersToOmit = function(search) {

	search = search || appCtxt.getCurrentSearch();

	var folders = ZmMailApp.FOLDERS_TO_OMIT,
		omit = [],
		curFolderId = search && search.folderId;

	var isUserInitiatedSearch = search && search.userInitiated;

	for (var i = 0; i < folders.length; i++) {
		if (!isUserInitiatedSearch && folders[i] != curFolderId) {
			omit.push(folders[i]);
		}
	}
	return AjxUtil.arrayAsHash(omit);
};

/*
returns the folders to omit in case of reply/reply-all/forward - this includes DRAFTS always in addition to the others as returned by ZmMailApp.getFoldersToOmit
(the others depend on current folder, but DRAFTS should always be ignored when replying/forwarding, even under Drafts folder)
 */
ZmMailApp.getReplyFoldersToOmit = function(search) {
	var omit = ZmMailApp.getFoldersToOmit(search);
	omit[ZmFolder.ID_DRAFTS] = true;
	return omit;
};
