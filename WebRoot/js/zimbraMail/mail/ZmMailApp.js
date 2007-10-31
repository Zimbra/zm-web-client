/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates and initializes the mail application.
 * @constructor
 * @class
 * The mail app manages and displays mail messages. Messages may be grouped
 * into conversations. New messages are created through a composer.
 *
 * @author Conrad Damon
 */
ZmMailApp = function(container, parentController) {
	ZmApp.call(this, ZmApp.MAIL, container, parentController);

	this._dataSourceCollection = {};
	this._identityCollection = {};
	this._signatureCollection = {};

	var settings = appCtxt.getSettings();
	settings.getSetting(ZmSetting.VIEW_AS_HTML).addChangeListener(new AjxListener(this, this._settingChangeListener));
	settings.addChangeListener(new AjxListener(this, this._settingsChangeListener));
};

// Organizer and item-related constants
ZmEvent.S_CONV				= "CONV";
ZmEvent.S_MSG				= "MSG";
ZmEvent.S_ATT				= "ATT";
ZmEvent.S_FOLDER			= "FOLDER";
ZmEvent.S_DATA_SOURCE       = "DATA SOURCE";
ZmEvent.S_IDENTITY       	= "IDENTITY";
ZmEvent.S_SIGNATURE			= "SIGNATURE";
ZmItem.CONV					= ZmEvent.S_CONV;
ZmItem.MSG					= ZmEvent.S_MSG;
ZmItem.ATT					= ZmEvent.S_ATT;
ZmItem.DATA_SOURCE			= ZmEvent.S_DATA_SOURCE;
ZmOrganizer.FOLDER			= ZmEvent.S_FOLDER;

// App-related constants
ZmApp.MAIL							= "Mail";
ZmApp.CLASS[ZmApp.MAIL]				= "ZmMailApp";
ZmApp.SETTING[ZmApp.MAIL]			= ZmSetting.MAIL_ENABLED;
ZmApp.UPSELL_SETTING[ZmApp.MAIL]	= ZmSetting.MAIL_UPSELL_ENABLED;
ZmApp.LOAD_SORT[ZmApp.MAIL]			= 20;
ZmApp.QS_ARG[ZmApp.MAIL]			= "mail";

ZmMailApp.DEFAULT_AUTO_SAVE_DRAFT_INTERVAL = 30;

ZmMailApp.prototype = new ZmApp;
ZmMailApp.prototype.constructor = ZmMailApp;

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
};

ZmMailApp.prototype._registerSettings =
function(settings) {
	var settings = settings || appCtxt.getSettings();
	settings.registerSetting("ALLOW_ANY_FROM_ADDRESS",			{name:"zimbraAllowAnyFromAddress", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("ALLOW_FROM_ADDRESSES",			{name:"zimbraAllowFromAddress", type:ZmSetting.T_COS, dataType:ZmSetting.D_LIST});
	settings.registerSetting("AUTO_SAVE_DRAFT_INTERVAL",		{name:"zimbraPrefAutoSaveDraftInterval", type:ZmSetting.T_PREF, dataType:ZmSetting.D_LDAP_TIME, defaultValue:ZmMailApp.DEFAULT_AUTO_SAVE_DRAFT_INTERVAL});
	settings.registerSetting("COMPOSE_SAME_FORMAT",				{name:"zimbraPrefForwardReplyInOriginalFormat", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("CONVERSATIONS_ENABLED",			{name:"zimbraFeatureConversationsEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("DEDUPE_MSG_TO_SELF",				{name:"zimbraPrefDedupeMessagesSentToSelf", type:ZmSetting.T_PREF, defaultValue:ZmSetting.DEDUPE_NONE});
	settings.registerSetting("DISPLAY_EXTERNAL_IMAGES",			{name:"zimbraPrefDisplayExternalImages", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("FILTERS_ENABLED",					{name:"zimbraFeatureFiltersEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN,	defaultValue:false});
	settings.registerSetting("FORWARD_INCLUDE_ORIG",			{name:"zimbraPrefForwardIncludeOriginalText", type:ZmSetting.T_PREF, defaultValue:ZmSetting.INCLUDE});
	settings.registerSetting("FORWARD_MENU_ENABLED",			{type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("GROUP_MAIL_BY",					{type:ZmSetting.T_PREF, defaultValue:ZmSetting.GROUP_BY_MESSAGE});
	settings.registerSetting("IDENTITIES_ENABLED",				{name:"zimbraFeatureIdentitiesEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("INITIAL_GROUP_MAIL_BY",			{name:"zimbraPrefGroupMailBy", type:ZmSetting.T_PREF, defaultValue:ZmSetting.GROUP_BY_MESSAGE});
	settings.registerSetting("INITIAL_SEARCH",					{name:"zimbraPrefMailInitialSearch", type:ZmSetting.T_PREF, defaultValue:"in:inbox"});
	settings.registerSetting("INITIAL_SEARCH_ENABLED",			{name:"zimbraFeatureInitialSearchPreferenceEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("MAIL_ALIASES",					{name:"zimbraMailAlias", type:ZmSetting.T_COS, dataType:ZmSetting.D_LIST});
	settings.registerSetting("MAIL_FORWARDING_ADDRESS",			{name:"zimbraPrefMailForwardingAddress", type:ZmSetting.T_PREF});
	settings.registerSetting("MAIL_FORWARDING_ENABLED",			{name:"zimbraFeatureMailForwardingEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
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
	settings.registerSetting("MAIL_PRIORITY_ENABLED",	        {name:"zimbraFeatureMailPriorityEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("MAX_MESSAGE_SIZE",				{type:ZmSetting.T_PREF, defaultValue:"100000"});
	settings.registerSetting("NEW_WINDOW_COMPOSE",				{name:"zimbraPrefComposeInNewWindow", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("NOTIF_ADDRESS",					{name:"zimbraPrefNewMailNotificationAddress", type:ZmSetting.T_PREF});
	settings.registerSetting("NOTIF_ENABLED",					{name:"zimbraPrefNewMailNotificationEnabled", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("NOTIF_FEATURE_ENABLED",			{name:"zimbraFeatureNewMailNotificationEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("OPEN_MAIL_IN_NEW_WIN",			{name:"zimbraPrefOpenMailInNewWindow", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("PAGE_SIZE",						{name:"zimbraPrefMailItemsPerPage", type:ZmSetting.T_PREF, dataType:ZmSetting.D_INT, defaultValue:25});
	settings.registerSetting("READING_PANE_ENABLED",			{name:"zimbraPrefReadingPaneEnabled", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("REPLY_INCLUDE_ORIG",				{name:"zimbraPrefReplyIncludeOriginalText", type:ZmSetting.T_PREF, defaultValue:ZmSetting.INCLUDE});
	settings.registerSetting("REPLY_MENU_ENABLED",				{type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("REPLY_PREFIX",					{name:"zimbraPrefForwardReplyPrefixChar", type:ZmSetting.T_PREF, defaultValue:">"});
	settings.registerSetting("REPLY_TO_ADDRESS",				{name:"zimbraPrefReplyToAddress", type:ZmSetting.T_PREF, dataType:ZmSetting.D_LIST });
	settings.registerSetting("REPLY_TO_ENABLED",				{name:"zimbraPrefReplyToEnabled", type:ZmSetting.T_PREF /*, dataType:ZmSetting.D_LIST*/ }); // TODO:Is this a list or single?
	settings.registerSetting("SAVE_DRAFT_ENABLED",				{type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("SAVE_TO_SENT",					{name:"zimbraPrefSaveToSent", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("SENT_FOLDER_NAME",				{name:"zimbraPrefSentMailFolder", type:ZmSetting.T_PREF, defaultValue:"sent"});
	settings.registerSetting("SHOW_BCC",						{type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("SHOW_FRAGMENTS",					{name:"zimbraPrefShowFragments", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("SIGNATURE",						{name:"zimbraPrefMailSignature", type:ZmSetting.T_PREF});
	settings.registerSetting("SIGNATURE_ENABLED",				{name:"zimbraPrefMailSignatureEnabled", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("SIGNATURE_STYLE",					{name:"zimbraPrefMailSignatureStyle", type:ZmSetting.T_PREF, defaultValue:ZmSetting.SIG_OUTLOOK});
	settings.registerSetting("SPAM_ENABLED",					{type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("USER_FOLDERS_ENABLED",			{type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("VACATION_MSG",					{name:"zimbraPrefOutOfOfficeReply", type:ZmSetting.T_PREF});
	settings.registerSetting("VACATION_MSG_ENABLED",			{name:"zimbraPrefOutOfOfficeReplyEnabled", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("VACATION_MSG_FEATURE_ENABLED",	{name:"zimbraFeatureOutOfOfficeReplyEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});

	ZmMailApp._setGroupByMaps();
};

ZmMailApp.prototype._registerPrefs =
function() {
	var sections = {
		MAIL: {
			title: ZmMsg.mail,
			templateId: "prefs.Pages#Mail",
			priority: 10,
			precondition: ZmSetting.MAIL_ENABLED,
			prefs: [
				ZmSetting.DEDUPE_MSG_TO_SELF,
				ZmSetting.DISPLAY_EXTERNAL_IMAGES,
				ZmSetting.INITIAL_GROUP_MAIL_BY,
				ZmSetting.INITIAL_SEARCH,
				ZmSetting.MAIL_FORWARDING_ADDRESS,
				ZmSetting.MAIL_LIFETIME_INBOX_READ,
				ZmSetting.MAIL_LIFETIME_INBOX_UNREAD,
				ZmSetting.MAIL_LIFETIME_JUNK,
				ZmSetting.MAIL_LIFETIME_SENT,
				ZmSetting.MAIL_LIFETIME_TRASH,
				ZmSetting.MAIL_LOCAL_DELIVERY_DISABLED,
				ZmSetting.NOTIF_ADDRESS,
				ZmSetting.NOTIF_ENABLED,
				ZmSetting.OPEN_MAIL_IN_NEW_WIN,
				ZmSetting.PAGE_SIZE,
				ZmSetting.POLLING_INTERVAL,
				ZmSetting.READING_PANE_ENABLED,
				ZmSetting.SHOW_FRAGMENTS,
				ZmSetting.VACATION_MSG_ENABLED,
				ZmSetting.VACATION_MSG,
				ZmSetting.VIEW_AS_HTML
			],
			createView: function(parent, section, controller) {
				return new ZmMailPrefsPage(parent, section, controller);
			}
		},
		ACCOUNTS: {
			title: ZmMsg.accounts,
			precondition: ZmSetting.MAIL_ENABLED,
			templateId: "prefs.Pages#Accounts",
			priority: 60,
			prefs: [
				ZmSetting.ACCOUNTS
			],
			manageDirty: true,
			createView: function(parent, section, controller) {
				return new ZmAccountsPage(parent, section, controller);
			}
		},
		SIGNATURES: {
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
			title: ZmMsg.filterRules,
			templateId: "prefs.Pages#MailFilters",
			priority: 70,
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
        //bug:19183 Disable editing filter rules in desktop client
        if(appCtxt.get(ZmSetting.OFFLINE)) {
            if(id != "FILTERS") {
                ZmPref.registerPrefSection(id, sections[id]);
            }
        } else {
            ZmPref.registerPrefSection(id, sections[id]);                
        }
    }

	ZmPref.registerPref("AUTO_SAVE_DRAFT_INTERVAL", {
		displayName:		ZmMsg.autoSaveDrafts,
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		options:			[0, ZmMailApp.DEFAULT_AUTO_SAVE_DRAFT_INTERVAL]
	});

	ZmPref.registerPref("DEDUPE_MSG_TO_SELF", {
		displayName:		ZmMsg.removeDupesToSelf,
		displayContainer:	ZmPref.TYPE_RADIO_GROUP,
		orientation:		ZmPref.ORIENT_HORIZONTAL,
		displayOptions:		[ZmMsg.dedupeNone, ZmMsg.dedupeSecondCopy, ZmMsg.dedupeAll],
		options:			[ZmSetting.DEDUPE_NONE, ZmSetting.DEDUPE_SECOND, ZmSetting.DEDUPE_ALL]
	});

	ZmPref.registerPref("DISPLAY_EXTERNAL_IMAGES", {
		displayName:		ZmMsg.showExternalImages,
		displayContainer:	ZmPref.TYPE_CHECKBOX
	});

	ZmPref.registerPref("INITIAL_GROUP_MAIL_BY", {
		displayName:		ZmMsg.groupMailBy,
		displayContainer:	ZmPref.TYPE_SELECT,
		displayOptions:		[ZmMsg.message, ZmMsg.conversation],
		options:			[ZmSetting.GROUP_BY_MESSAGE, ZmSetting.GROUP_BY_CONV],
		precondition:		ZmSetting.CONVERSATIONS_ENABLED
	});

	ZmPref.registerPref("INITIAL_SEARCH", {
		displayName:		ZmMsg.initialMailSearch,
		displayContainer:	ZmPref.TYPE_INPUT,
		maxLength:			ZmPref.MAX_LENGTH[ZmSetting.INITIAL_SEARCH],
		errorMessage:       AjxMessageFormat.format(ZmMsg.invalidInitialSearch, ZmPref.MAX_LENGTH[ZmSetting.INITIAL_SEARCH]),
		displaySeparator:	false,
		precondition:		ZmSetting.INITIAL_SEARCH_ENABLED
	});

	ZmPref.registerPref("MAIL_FORWARDING_ADDRESS", {
		displayName:		ZmMsg.mailForwardingAddress,
		displayContainer:	ZmPref.TYPE_INPUT,
		validationFunction: ZmPref.validateEmail,
		errorMessage:       ZmMsg.invalidEmail,
		precondition:		ZmSetting.MAIL_FORWARDING_ENABLED
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
		displaySeparator:	true,
		precondition:		ZmSetting.MAIL_FORWARDING_ENABLED,
		validationFunction:	ZmPref.validateDontKeepLocalCopy,
		errorMessage:		ZmMsg.errorMissingFwdAddr
	});

	ZmPref.registerPref("NOTIF_ADDRESS", {
		displayName:		ZmMsg.mailNotifAddress,
		displayContainer:	ZmPref.TYPE_INPUT,
		validationFunction: ZmPref.validateEmail,
		errorMessage:       ZmMsg.invalidEmail,
		precondition:		ZmSetting.NOTIF_FEATURE_ENABLED,
		displaySeparator:	true
	});

	ZmPref.registerPref("NOTIF_ENABLED", {
		displayName:		ZmMsg.mailNotifEnabled,
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		precondition:		ZmSetting.NOTIF_FEATURE_ENABLED
	});

	ZmPref.registerPref("OPEN_MAIL_IN_NEW_WIN", {
		displayName:		ZmMsg.openMailNewWin,
		displayContainer:	ZmPref.TYPE_CHECKBOX
	});

	ZmPref.registerPref("REPLY_TO_ADDRESS", {
		displayName:		ZmMsg.replyToAddress,
		displayContainer:	ZmPref.TYPE_INPUT,
		validationFunction: ZmPref.validateEmail,
		errorMessage:       ZmMsg.invalidEmail
	});

	ZmPref.registerPref("SIGNATURE", {
		displayName:		ZmMsg.signature,
		displayContainer:	ZmPref.TYPE_TEXTAREA,
		maxLength:			ZmPref.MAX_LENGTH[ZmSetting.SIGNATURE],
		errorMessage:       AjxMessageFormat.format(ZmMsg.invalidSignature, ZmPref.MAX_LENGTH[ZmSetting.SIGNATURE]),
		displaySeparator:	true
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

	ZmPref.registerPref("VACATION_MSG", {
		displayName:		ZmMsg.awayMessage,
		displayContainer:	ZmPref.TYPE_TEXTAREA,
		maxLength:			ZmPref.MAX_LENGTH[ZmSetting.AWAY_MESSAGE],
		errorMessage:       AjxMessageFormat.format(ZmMsg.invalidAwayMessage, ZmPref.MAX_LENGTH[ZmSetting.AWAY_MESSAGE]),
		precondition:		ZmSetting.VACATION_MSG_FEATURE_ENABLED,
		displaySeparator:	true
	});

	ZmPref.registerPref("VACATION_MSG_ENABLED", {
		displayName:		ZmMsg.awayMessageEnabled,
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		precondition:		ZmSetting.VACATION_MSG_FEATURE_ENABLED
	});

	ZmPref.registerPref("SIGNATURES", {
		displayContainer:	ZmPref.TYPE_CUSTOM
	});
	ZmPref.registerPref("ACCOUNTS", {
		displayContainer:	ZmPref.TYPE_CUSTOM
	});
};

ZmMailApp.prototype._registerOperations =
function() {
	ZmOperation.registerOp("ADD_FILTER_RULE", {textKey:"newFilter", image:"Plus"}, ZmSetting.FILTERS_ENABLED);
	ZmOperation.registerOp("ADD_SIGNATURE", {textKey:"signature", image:"AddSignature", tooltipKey:"chooseSignature"}, ZmSetting.SIGNATURES_ENABLED);
	ZmOperation.registerOp("CHECK_MAIL", {textKey:"checkMail", tooltipKey:"checkMailTooltip"});
	ZmOperation.registerOp("COMPOSE_OPTIONS", {textKey:"options", image:"Preferences"});
	ZmOperation.registerOp("DELETE_CONV", {textKey:"delConv", image:"DeleteConversation"}, ZmSetting.CONVERSATIONS_ENABLED);
	ZmOperation.registerOp("DELETE_MENU", {tooltipKey:"deleteTooltip", image:"Delete"});
	ZmOperation.registerOp("DETACH_COMPOSE", {tooltipKey:"detachTooltip", image:"OpenInNewWindow"});
	ZmOperation.registerOp("DRAFT", null, ZmSetting.SAVE_DRAFT_ENABLED);
	ZmOperation.registerOp("EDIT_FILTER_RULE", {textKey:"filterEdit", image:"Edit"}, ZmSetting.FILTERS_ENABLED);
	ZmOperation.registerOp("FORWARD", {textKey:"forward", tooltipKey:"forwardTooltip", image:"Forward"});
	ZmOperation.registerOp("FORWARD_ATT", {textKey:"forwardAtt", tooltipKey:"forwardAtt", image:"Forward"});
	ZmOperation.registerOp("FORWARD_INLINE", {textKey:"forwardInline", tooltipKey:"forwardTooltip", image:"Forward"});
	//fixed bug:15460 removed reply and forward menu.
	/*ZmOperation.registerOp("FORWARD_MENU", {textKey:"forward", tooltipKey:"forwardTooltip", image:"Forward"}, null,
		AjxCallback.simpleClosure(function(parent) {
			ZmOperation.addDeferredMenu(ZmMailApp.addForwardMenu, parent);
	}));*/
	ZmOperation.registerOp("IM", {textKey:"newIM", image:"ImStartChat"}, ZmSetting.IM_ENABLED);
	ZmOperation.registerOp("INC_ATTACHMENT", {textKey:"includeMenuAttachment"});
	ZmOperation.registerOp("INC_NONE", {textKey:"includeMenuNone"});
	ZmOperation.registerOp("INC_NO_PREFIX", {textKey:"includeMenuNoPrefix"});
	ZmOperation.registerOp("INC_PREFIX", {textKey:"includeMenuPrefix"});
	ZmOperation.registerOp("INC_SMART", {textKey:"includeMenuSmart"});
	ZmOperation.registerOp("MARK_READ", {textKey:"markAsRead", image:"ReadMessage"});
	ZmOperation.registerOp("MARK_UNREAD", {textKey:"markAsUnread", image:"UnreadMessage"});
	ZmOperation.registerOp("MOVE_DOWN_FILTER_RULE", {textKey:"filterMoveDown", image:"DownArrow"}, ZmSetting.FILTERS_ENABLED);
	ZmOperation.registerOp("MOVE_UP_FILTER_RULE", {textKey:"filterMoveUp", image:"UpArrow"}, ZmSetting.FILTERS_ENABLED);
	ZmOperation.registerOp("NEW_MESSAGE", {textKey:"newEmail", tooltipKey:"newMessageTooltip", image:"NewMessage"});
	ZmOperation.registerOp("NEW_MESSAGE_WIN", {textKey:"newEmail", tooltipKey:"newMessageTooltip", image:"NewMessage"});
	ZmOperation.registerOp("REMOVE_FILTER_RULE", {textKey:"filterRemove", image:"Delete"}, ZmSetting.FILTERS_ENABLED);
	ZmOperation.registerOp("REPLY", {textKey:"reply", tooltipKey:"replyTooltip", image:"Reply"});
	ZmOperation.registerOp("REPLY_ACCEPT", {textKey:"replyAccept", image:"Check"});
	ZmOperation.registerOp("REPLY_ALL", {textKey:"replyAll", tooltipKey:"replyAllTooltip", image:"ReplyAll"});
	ZmOperation.registerOp("REPLY_CANCEL");
	ZmOperation.registerOp("REPLY_DECLINE", {textKey:"replyDecline", image:"Cancel"});
	//fixed bug:15460 removed reply and forward menu.
	/*ZmOperation.registerOp("REPLY_MENU", {textKey:"reply", tooltipKey:"replyTooltip", image:"Reply"}, ZmSetting.REPLY_MENU_ENABLED,
		AjxCallback.simpleClosure(function(parent) {
			ZmOperation.addDeferredMenu(ZmMailApp.addReplyMenu, parent);
	}));*/
	ZmOperation.registerOp("REPLY_MODIFY");
	ZmOperation.registerOp("REPLY_NEW_TIME", {textKey:"replyNewTime", image:"NewTime"});
	ZmOperation.registerOp("REPLY_TENTATIVE", {textKey:"replyTentative", image:"QuestionMark"});
	ZmOperation.registerOp("SAVE_DRAFT", {textKey:"saveDraft", tooltipKey:"saveDraftTooltip", image:"DraftFolder"}, ZmSetting.SAVE_DRAFT_ENABLED);
	ZmOperation.registerOp("SHOW_BCC", {textKey:"showBcc"});
	ZmOperation.registerOp("SHOW_ONLY_MAIL", {textKey:"showOnlyMail", image:"Conversation"}, ZmSetting.MIXED_VIEW_ENABLED);
	ZmOperation.registerOp("SHOW_ORIG", {textKey:"showOrig", image:"Message"});
	ZmOperation.registerOp("SPAM", {textKey:"junk", tooltipKey:"junkTooltip", image:"JunkMail"}, ZmSetting.SPAM_ENABLED);
};

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
						 searchType:	"message",
						 resultsList:
		AjxCallback.simpleClosure(function(search) {
			AjxDispatcher.require("MailCore");
			return new ZmMailList(ZmItem.MSG, search);
		}, this)
						});

	ZmItem.registerItem(ZmItem.ATT,
						{nameKey:		"attachment",
						 icon:			"Attachment",
						 itemClass:		"ZmMimePart",
						 node:			"mp",
						 resultsList:
		AjxCallback.simpleClosure(function(search) {
			return new ZmMailList(ZmItem.ATT, search);
		}, this)
						});
};

ZmMailApp.prototype._setupSearchToolbar =
function() {
	ZmSearchToolBar.FOR_MAIL_MI = "FOR MAIL";
	ZmSearchToolBar.addMenuItem(ZmSearchToolBar.FOR_MAIL_MI,
								{msgKey:		"searchMail",
								 tooltipKey:	"searchMail",
								 icon:			"Message",
								 shareIcon:		"SharedMailFolder"
								});
};

ZmMailApp.prototype._setupCurrentAppToolbar =
function() {
	ZmCurrentAppToolBar.registerApp(this.getName(), ZmOperation.NEW_FOLDER, ZmOrganizer.FOLDER);
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
							  chooserTooltipKey:	"goToMail",
							  viewTooltipKey:		"displayMailToolTip",
							  defaultSearch:		appCtxt.isChildWindow ? null : ZmSearchToolBar.FOR_MAIL_MI,
							  organizer:			ZmOrganizer.FOLDER,
							  overviewTrees:		[ZmOrganizer.FOLDER, ZmOrganizer.SEARCH, ZmOrganizer.TAG],
							  showZimlets:			true,
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
							  upsellUrl:			ZmSetting.MAIL_UPSELL_URL,
							  supportsMultiMbox:	true
							  });
};

// App API

ZmMailApp.prototype.startup =
function(result) {
	var obj = result.getResponse().GetInfoResponse;
	appCtxt.getIdentityCollection().initialize(obj.identities);
	appCtxt.getDataSourceCollection().initialize(obj.dataSources);
	appCtxt.getSignatureCollection().initialize(obj.signatures);
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
 *		modified:	c {id:-676, newId: 678}
 * 					m {id:676, cid:678}
 *
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
		if (id < 0) {
			virtConv[id] = true;
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
		var name = mod._name;
		if (name == "m") {
			var virtCid = id * -1;
			if (virtConv[virtCid] && createdConvs[mod.cid]) {
				msgMoved = true;
				movedMsgs[id] = mod;
				newToOldCid[mod.cid] = virtCid;
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

	// process the normalized notifications
	return notify;
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

	this._checkList(creates, appCtxt.getCurrentList());
	var ctlr = appCtxt.getCurrentController();
	if (ctlr && ctlr.getUnderlyingList) {
		this._checkList(creates, ctlr.getUnderlyingList());
	}
};

/**
 * We can only handle new mail notifications if:
 *  	- we are currently in a mail view
 *		- the view is the result of a simple folder search
 * 
 * @param creates	[hash]			JSON create objects
 * @param list		[ZmMailList]	mail list to notify
 */
ZmMailApp.prototype._checkList =
function(creates, list) {

	if (!(list && list instanceof ZmMailList)) { return; }

	var convs = {};
	var msgs = {};
	var folders = {};

	// for CV, folderId will correspond to parent list view
	// XXX: should handle simple tag search as well
	var folderId = list.search ? list.search.folderId : null;
	if (!folderId) { return; }

	var sortBy = list.search.sortBy;
	var a = list.getArray();
	var listView = appCtxt.getCurrentView()._mailListView;
	var limit = listView ? listView.getLimit() : appCtxt.get(ZmSetting.PAGE_SIZE);
	
	var last = (a && a.length >= limit) ? a[a.length - 1] : null;
	var cutoff = last ? last.date : null;
	DBG.println(AjxDebug.DBG2, "cutoff = " + cutoff + ", list size = " + a.length);

	var gotConvs = this._checkType(creates, ZmItem.CONV, convs, list, sortBy, cutoff);
	var gotMsgs = this._checkType(creates, ZmItem.MSG, msgs, list, sortBy, cutoff, convs);

	if (gotConvs || gotMsgs) {
		list.notifyCreate(convs, msgs);
	}
};

/**
 * Handles the creates for the given type of mail item.
 *
 * @param creates	[array]			list of JSON create nodes
 * @param type		[constant]		mail item type
 * @param items		[hash]			hash of created mail items
 * @param currList	[ZmMailList]	list currently being displayed to user
 * @param sortBy	[constant]		sort order
 * @param cutoff	[int]			timestamp of last item in list
 * @param convs		[hash]			convs, so we can update folders from msgs
 */
ZmMailApp.prototype._checkType =
function(creates, type, items, currList, sortBy, cutoff, convs) {
	var nodeName = ZmList.NODE[type];
	var list = creates[nodeName];
	if (!(list && list.length)) { return false; }
	var gotMail = false;
	for (var i = 0; i < list.length; i++) {
		var create = list[i];
		create._handled = true;
		
		// ignore stuff we already have
		if (currList.getById(create.id) || create._wasVirtConv) { continue; }

		// perform stricter checking if we're in offline mode
		if (appCtxt.get(ZmSetting.OFFLINE) &&
			!this._checkCreate(create, type, currList, sortBy, cutoff)) { continue; }

		DBG.println(AjxDebug.DBG1, "ZmMailApp: handling CREATE for node: " + nodeName);
		var itemClass = eval(ZmList.ITEM_CLASS[type]);
		var item = itemClass.createFromDom(create, {}, true);
		items[item.id] = item;
		gotMail = true;
	}
	return gotMail;
};

/**
 * Checks a mail create to make sure it will result in a UI change, so that we don't
 * process it unnecessarily. The major motivation for doing this is handling a large
 * sync for the offline client, where we get a flood of mail creates.
 *
 * @param create	[object]		the JSON node for the create
 * @param type		[constant]		mail item type
 * @param currList	[ZmMailList]	list currently being displayed to user
 * @param sortBy	[constant]		sort order
 * @param cutoff	[int]			timestamp of last item in list
 */
ZmMailApp.prototype._checkCreate =
function(create, type, currList, sortBy, cutoff) {

	var nodeName = ZmList.NODE[type];

	// ignore items that are not of the current type (except CLV, since a new
	// msg may affect fields in its conv)
	if ((ZmList.ITEM_TYPE[nodeName] != currList.type) && (currList.type != ZmItem.CONV)) {
		DBG.println(AjxDebug.DBG2, "new " + type + " not of current type");
		return false;
	}

	// ignore mail that falls outside our range
	if (sortBy == ZmSearch.DATE_DESC && (create.d < cutoff)) {
		DBG.println(AjxDebug.DBG2, "new " + type + " is too old: " + create.d);
		return false;
	}
	if (sortBy == ZmSearch.DATE_ASC && (create.d > cutoff)) {
		DBG.println(AjxDebug.DBG2, "new " + type + " is too new: " + create.d);
		return false;
	}

	return true;
};

ZmMailApp.prototype.postNotify =
function(notify) {
	if (this._checkReplenishListView) {
		this._checkReplenishListView._checkReplenish();
		this._checkReplenishListView = null;
	}
};

ZmMailApp.prototype.refresh =
function(refresh) {
	if (!appCtxt.inStartup) {
		var account = appCtxt.multiAccounts ? appCtxt.getMainAccount() : null;
		this.resetOverview(this.getOverviewId(account));
	}

	var inbox = appCtxt.getById(ZmFolder.ID_INBOX);
	if (inbox) {
		this.setNewMailNotice(inbox);
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
			if (!inNewWindow && params && params.ev) {
				inNewWindow = this._inNewWindow(params.ev);
				showLoadingPage = false;
			}
			var loadCallback = new AjxCallback(this, this._handleLoadNewMessage, [inNewWindow]);
			AjxDispatcher.require(["ContactsCore", "Contacts"], false, loadCallback, null, showLoadingPage);
			break;
	}
};

ZmMailApp.prototype._handleLoadNewMessage =
function(inNewWindow) {
	AjxDispatcher.run("Compose", {action: ZmOperation.NEW_MESSAGE, inNewWindow:inNewWindow});
};

// Public methods

ZmMailApp.prototype.launch =
function(params, callback) {
	var query;
	params = params || {};
	if (params.checkQS) {
		var ic = appCtxt.getIdentityCollection();
		if (!ic || (ic.getSize() == 0)) {
			this.startup(params.result);
		}
		if (location && (location.search.match(/\bview=compose\b/))) {
			this._showComposeView(callback);
			return;
		} else if (location.search && (location.search.match(/\bview=msg\b/))) {
			var match = location.search.match(/\bid=(\d+)/);
			var id = match ? match[1] : null;
			if (id) {
				query = ["item:", id].join("");
			}
		}
	}

	// temporarily save GetInfoResponse so we can use it to properly render overview
	this.__getInfoResponse = params.result ? params.result.getResponse().GetInfoResponse : null;

	this._groupBy = appCtxt.get(ZmSetting.GROUP_MAIL_BY);	// set type for initial search
	this._mailSearch(query, callback, params.searchResponse);
};

ZmMailApp.prototype.activate =
function(active) {
	if (this.__getInfoResponse) {
		// data sources need to be parsed *before* activate so overview can render properly
		appCtxt.getIdentityCollection().initialize(this.__getInfoResponse.identities);
		appCtxt.getDataSourceCollection().initialize(this.__getInfoResponse.dataSources);
	}

	ZmApp.prototype.activate.call(this, active);
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

ZmMailApp.prototype._activateAccordionItem =
function(accordionItem) {
	ZmApp.prototype._activateAccordionItem.call(this, accordionItem);

	this._mailSearch();
};

ZmMailApp.prototype._mailSearch =
function(query, callback, response) {
	query = query || appCtxt.get(ZmSetting.INITIAL_SEARCH);
	var types = new AjxVector();
	var type = this.getGroupMailBy();
	types.add(type);
	var params = {query:query, callback:callback, types:types, response:response};
	params.errorCallback = new AjxCallback(this, this._handleErrorLaunch, params);
	appCtxt.getSearchController().search(params);
};

ZmMailApp.prototype.getSearchParams =
function(params) {
	params = params || {};
	var mc = this.getMailListController();
	if (mc._readingPaneOn && !appCtxt.inStartup) {
		params.fetch = true;
	}
	return params;
};

ZmMailApp.prototype.showSearchResults =
function(results, callback) {
	var loadCallback = new AjxCallback(this, this._handleLoadShowSearchResults, [results, callback]);
	AjxDispatcher.require("MailCore", false, loadCallback, null, true);
};

ZmMailApp.prototype._handleLoadShowSearchResults =
function(results, callback) {
	if (results.type == ZmItem.MSG) {
		this.getTradController().show(results);
	} else {
		this.getConvListController().show(results);
	}
	if (callback) {
		callback.run();
	}
	if (!this._hasRendered) {
		appCtxt.getAppController().appRendered(this._name);
		this._hasRendered = true;
	}
};

ZmMailApp.prototype._showComposeView =
function(callback) {
	AjxDispatcher.require("Startup2");
	var cc = AjxDispatcher.run("GetComposeController");
	var match = location.search.match(/\bsubject=([^&]+)/);
	var subject = match ? decodeURIComponent(match[1]) : null;
	match = location.search.match(/\bto=([^&]+)/);
	var to = match ? decodeURIComponent(match[1]) : null;
	match = location.search.match(/\bbody=([^&]+)/);
	var body = match ? decodeURIComponent(match[1]) : null;
	var params = {action:ZmOperation.NEW_MESSAGE, toOverride:to, subjOverride:subject,
				  extraBodyText:body, callback:callback};
	cc.doAction(params);

	if (!this._hasRendered) {
		appCtxt.getAppController().appRendered(this._name);
		this._hasRendered = true;
	}
};

ZmMailApp.prototype.getConvListController =
function() {
	if (!this._convListController) {
		this._convListController = new ZmConvListController(this._container, this);
	}
	return this._convListController;
};

ZmMailApp.prototype.getConvController =
function() {
	if (!this._convController) {
		this._convController = new ZmConvController(this._container, this);
	}
	return this._convController;
};

ZmMailApp.prototype.getTradController =
function() {
	if (!this._tradController) {
		this._tradController = new ZmTradController(this._container, this);
	}
	return this._tradController;
};

ZmMailApp.prototype.getMsgController =
function() {
	if (!this._msgController) {
		this._msgController = new ZmMsgController(this._container, this);
	}
	return this._msgController;
};

ZmMailApp.prototype.getComposeController =
function() {
	if (!this._composeController) {
		this._composeController = new ZmComposeController(this._container, this);
	}
	return this._composeController;
};

ZmMailApp.prototype.getMailListController =
function() {
	var groupMailBy = appCtxt.get(ZmSetting.GROUP_MAIL_BY);
	return (groupMailBy == ZmSetting.GROUP_BY_CONV) ? AjxDispatcher.run("GetConvListController") :
													  AjxDispatcher.run("GetTradController");
};

/**
 * Begins a compose session by presenting a form to the user.
 *
 * @param action		[constant]		new message, reply, forward, or an invite action
 * @param inNewWindow	[boolean]*		if true, we are in detached window
 * @param msg			[ZmMailMsg]*	the original message (reply/forward), or address (new message)
 * @param toOverride 	[string]*		initial value for To: field
 * @param subjOverride 	[string]*		initial value for Subject: field
 * @param extraBodyText [string]*		canned text to prepend to body (invites)
 * @param callback		[AjxCallback]*	callback to run after view has been set
 * @param accountName	[string]*		on-behalf-of From address
 */
ZmMailApp.prototype.compose =
function(params) {
	AjxDispatcher.run("GetComposeController").doAction(params);
};

ZmMailApp.prototype.setNewMailNotice =
function(organizer) {
	var appChooser = appCtxt.getAppController().getAppChooser();
	if (appChooser) {
		var mb = appChooser.getButton(ZmApp.MAIL);
		var icon = (organizer.numUnread > 0) ? "EnvelopeOpen" : "MailApp";
		mb.setImage(icon);
	}
};

/**
* Convenience method to convert "group mail by" between server (string)
* and client (int constant) versions.
*/
ZmMailApp.prototype.getGroupMailBy =
function() {
	var setting = this._groupBy || appCtxt.get(ZmSetting.GROUP_MAIL_BY);
	return setting ? ZmMailApp.GROUP_MAIL_BY_ITEM[setting] : ZmItem.MSG;
};

/**
* Adds a "Reply" submenu for replying to sender or all.
*
* @param parent		parent widget (a toolbar or action menu)
*/
ZmMailApp.addReplyMenu =
function(parent) {
	var list = [ZmOperation.REPLY, ZmOperation.REPLY_ALL];
	var menu = new ZmActionMenu({parent:parent, menuItems:list});
	parent.setMenu(menu);
	return menu;
};

/**
* Adds a "Forward" submenu for forwarding inline or as attachment
*
* @param parent		parent widget (a toolbar or action menu)
*/
ZmMailApp.addForwardMenu =
function(parent) {
	var list = [ZmOperation.FORWARD_INLINE, ZmOperation.FORWARD_ATT];
	var menu = new ZmActionMenu({parent:parent, menuItems:list});
	parent.setMenu(menu);
	return menu;
};

ZmMailApp.prototype.getDataSourceCollection =
function() {
	var appCtxt = window.parentAppCtxt || window.appCtxt;
	var activeAcct = appCtxt.getActiveAccount().name;

	if (!this._dataSourceCollection[activeAcct]) {
		this._dataSourceCollection[activeAcct] = new ZmDataSourceCollection();
	}
	return this._dataSourceCollection[activeAcct];
};

ZmMailApp.prototype.getIdentityCollection =
function() {
	// child window always gets its own identitiy collection
	if (appCtxt.isChildWindow) {
		if (!this._identityCollection) {
			this._identityCollection = new ZmIdentityCollection();
		}
		return this._identityCollection;
	}

	var activeAcct = appCtxt.getActiveAccount().name;

	if (!this._identityCollection[activeAcct]) {
		this._identityCollection[activeAcct] = new ZmIdentityCollection();
	}
	return this._identityCollection[activeAcct];
};

ZmMailApp.prototype.getSignatureCollection =
function() {
	var appCtxt = window.parentAppCtxt || window.appCtxt;
	var activeAcct = appCtxt.getActiveAccount().name;

	if (!this._signatureCollection[activeAcct]) {
		this._signatureCollection[activeAcct] = new ZmSignatureCollection();
	}
	return this._signatureCollection[activeAcct];
};

/**
 * Individual setting listener.
 */
ZmMailApp.prototype._settingChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_SETTING) { return; }

	var setting = ev.source;
	var mlc = this.getMailListController();
	if (!mlc) { return; }

	if (setting.id == ZmSetting.VIEW_AS_HTML) {
		var dpv = mlc._doublePaneView;
		if (dpv) {
			var msg = dpv.getMsg();
			if (msg) {
				dpv.reset();
				dpv.setMsg(msg);
			}
		}
	}
};

/**
 * Settings listener. Process changed settings as a group, so that we
 * don't redo the search more than once if more than one relevant mail
 * setting has changed.
 */
ZmMailApp.prototype._settingsChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_SETTINGS) { return; }

	var list = ev.getDetail("settings");
	var mlc = this.getMailListController();
	if (!mlc) { return; }
	var curView = mlc._currentView;
	var newView = null, groupByView = null, toggle = false;

	for (var i = 0; i < list.length; i++) {
		var setting = list[i];
		if (setting.id == ZmSetting.PAGE_SIZE) {
			if (curView != ZmController.MSG_VIEW) {
				newView = groupByView || curView;
			}
		} else if (setting.id == ZmSetting.INITIAL_GROUP_MAIL_BY) {
			if (curView == ZmController.CONVLIST_VIEW || curView == ZmController.TRAD_VIEW) {
				var value = appCtxt.get(setting.id);
				var view = (value == ZmSetting.GROUP_BY_CONV) ? ZmController.CONVLIST_VIEW : ZmController.TRAD_VIEW;
				if (view != curView) {
					groupByView = view;
				}
			}
		} else if (setting.id == ZmSetting.READING_PANE_ENABLED) {
			if (curView != ZmController.MSG_VIEW) {
				var value = appCtxt.get(setting.id);
				if (value != mlc._readingPaneOn) {
					toggle = true;
				}
			}
		} else if (setting.id == ZmSetting.SHOW_FRAGMENTS) {
			if (curView != ZmController.MSG_VIEW) {
				newView = groupByView || curView;
			}
		}
	}
	newView = groupByView || newView;
	
	if (toggle) {
		mlc.switchView(ZmMailListController.READING_PANE_MENU_ITEM_ID);
	}
	if (newView) {
		mlc.switchView(newView);
	}
};
