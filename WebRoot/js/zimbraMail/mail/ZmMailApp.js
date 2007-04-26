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

function ZmMailApp(appCtxt, container, parentController) {

	ZmApp.call(this, ZmApp.MAIL, appCtxt, container, parentController);
};

// Organizer and item-related constants
ZmEvent.S_CONV				= "CONV";
ZmEvent.S_MSG				= "MSG";
ZmEvent.S_ATT				= "ATT";
ZmItem.CONV					= ZmEvent.S_CONV;
ZmItem.MSG					= ZmEvent.S_MSG;
ZmItem.ATT					= ZmEvent.S_ATT;

// App-related constants
ZmApp.MAIL					= "Mail";
ZmApp.CLASS[ZmApp.MAIL]		= "ZmMailApp";
ZmApp.SETTING[ZmApp.MAIL]	= ZmSetting.MAIL_ENABLED;
ZmApp.LOAD_SORT[ZmApp.MAIL]	= 20;
ZmApp.QS_ARG[ZmApp.MAIL]	= "mail";

ZmMailApp.prototype = new ZmApp;
ZmMailApp.prototype.constructor = ZmMailApp;

ZmMailApp._setGroupByMaps =
function() {
	// convert between server values for "group mail by" and item types
	ZmMailApp.GROUP_MAIL_BY_ITEM	= {};
	ZmMailApp.GROUP_MAIL_BY_ITEM[ZmSetting.GROUP_BY_CONV]		= ZmItem.CONV;
	ZmMailApp.GROUP_MAIL_BY_ITEM[ZmSetting.GROUP_BY_MESSAGE]	= ZmItem.MSG;
	ZmMailApp.GROUP_MAIL_BY_ITEM[ZmSetting.GROUP_BY_HYBRID]		= ZmItem.CONV;
};

ZmMailApp.prototype.toString = 
function() {
	return "ZmMailApp";
};

// Construction

ZmMailApp.prototype._defineAPI =
function() {
	AjxDispatcher.registerMethod("Compose", "Mail", new AjxCallback(this, this.compose));
	AjxDispatcher.registerMethod("GetAttachmentListController", "Mail", new AjxCallback(this, this.getAttachmentListController));
	AjxDispatcher.registerMethod("GetComposeController", ["Mail", "Zimlet"], new AjxCallback(this, this.getComposeController));
	AjxDispatcher.registerMethod("GetConvController", "Mail", new AjxCallback(this, this.getConvController));
	AjxDispatcher.registerMethod("GetConvListController", "Mail", new AjxCallback(this, this.getConvListController));
	AjxDispatcher.registerMethod("GetMsgController", "Mail", new AjxCallback(this, this.getMsgController));
	AjxDispatcher.registerMethod("GetTradController", "Mail", new AjxCallback(this, this.getTradController));
	AjxDispatcher.registerMethod("GetHybridController", "Mail", new AjxCallback(this, this.getHybridController));
	AjxDispatcher.registerMethod("GetMailListController", "Mail", new AjxCallback(this, this.getMailListController));
};

ZmMailApp.prototype._registerSettings =
function() {
	var settings = this._appCtxt.getSettings();
	settings.registerSetting("CONVERSATIONS_ENABLED",			{name: "zimbraFeatureConversationsEnabled", type: ZmSetting.T_COS, dataType: ZmSetting.D_BOOLEAN, defaultValue: false});
	settings.registerSetting("DEDUPE_MSG_TO_SELF",				{name: "zimbraPrefDedupeMessagesSentToSelf", type: ZmSetting.T_PREF, defaultValue: ZmSetting.DEDUPE_NONE});
	settings.registerSetting("FORWARD_INCLUDE_ORIG",			{name: "zimbraPrefForwardIncludeOriginalText", type: ZmSetting.T_PREF, defaultValue: ZmSetting.INCLUDE});
	settings.registerSetting("GROUP_MAIL_BY",					{type: ZmSetting.T_PREF, defaultValue: ZmSetting.GROUP_BY_MESSAGE});
	settings.registerSetting("INITIAL_GROUP_MAIL_BY",			{name: "zimbraPrefGroupMailBy", type: ZmSetting.T_PREF, defaultValue: ZmSetting.GROUP_BY_MESSAGE});
	settings.registerSetting("INITIAL_SEARCH",					{name: "zimbraPrefMailInitialSearch", type: ZmSetting.T_PREF, defaultValue: "in:inbox"});
	settings.registerSetting("INITIAL_SEARCH_ENABLED",			{name: "zimbraFeatureInitialSearchPreferenceEnabled", type: ZmSetting.T_COS, dataType: ZmSetting.D_BOOLEAN, defaultValue: false});
	settings.registerSetting("MAIL_ALIASES",					{name: "zimbraMailAlias", type: ZmSetting.T_COS, dataType: ZmSetting.D_LIST});
	settings.registerSetting("MAIL_FORWARDING_ADDRESS",			{name: "zimbraPrefMailForwardingAddress", type: ZmSetting.T_PREF});
	settings.registerSetting("MAIL_FORWARDING_ENABLED",			{name: "zimbraFeatureMailForwardingEnabled", type: ZmSetting.T_COS, dataType: ZmSetting.D_BOOLEAN, defaultValue: false});
	settings.registerSetting("MAIL_LOCAL_DELIVERY_DISABLED",	{name: "zimbraPrefMailLocalDeliveryDisabled", type: ZmSetting.T_PREF, dataType: ZmSetting.D_BOOLEAN, defaultValue: false});
	settings.registerSetting("NEW_WINDOW_COMPOSE",				{name: "zimbraPrefComposeInNewWindow", type: ZmSetting.T_PREF, dataType: ZmSetting.D_BOOLEAN, defaultValue: true});
	settings.registerSetting("NOTIF_ADDRESS",					{name: "zimbraPrefNewMailNotificationAddress", type: ZmSetting.T_PREF});
	settings.registerSetting("NOTIF_ENABLED",					{name: "zimbraPrefNewMailNotificationEnabled", type: ZmSetting.T_PREF, dataType: ZmSetting.D_BOOLEAN, defaultValue: false});
	settings.registerSetting("NOTIF_FEATURE_ENABLED",			{name: "zimbraFeatureNewMailNotificationEnabled", type: ZmSetting.T_COS, dataType: ZmSetting.D_BOOLEAN, defaultValue: false});
	settings.registerSetting("PAGE_SIZE",						{name: "zimbraPrefMailItemsPerPage", type: ZmSetting.T_PREF, dataType: ZmSetting.D_INT, defaultValue: 25});
	settings.registerSetting("READING_PANE_ENABLED",			{name: "zimbraPrefReadingPaneEnabled", type: ZmSetting.T_PREF, dataType: ZmSetting.D_BOOLEAN, defaultValue: true});
	settings.registerSetting("REPLY_INCLUDE_ORIG",				{name: "zimbraPrefReplyIncludeOriginalText", type: ZmSetting.T_PREF, defaultValue: ZmSetting.INCLUDE});
	settings.registerSetting("REPLY_PREFIX",					{name: "zimbraPrefForwardReplyPrefixChar", type: ZmSetting.T_PREF, defaultValue: ">"});
	settings.registerSetting("REPLY_TO_ADDRESS",				{name: "zimbraPrefReplyToAddress", type: ZmSetting.T_PREF});
	settings.registerSetting("SAVE_TO_SENT",					{name: "zimbraPrefSaveToSent", type: ZmSetting.T_PREF, dataType: ZmSetting.D_BOOLEAN, defaultValue: true});
	settings.registerSetting("SENT_FOLDER_NAME",				{name: "zimbraPrefSentMailFolder", type: ZmSetting.T_PREF, defaultValue: "sent"});
	settings.registerSetting("SHOW_BCC",						{type: ZmSetting.T_PREF, dataType: ZmSetting.D_BOOLEAN, defaultValue: false});
	settings.registerSetting("SHOW_FRAGMENTS",					{name: "zimbraPrefShowFragments", type: ZmSetting.T_PREF, dataType: ZmSetting.D_BOOLEAN, defaultValue: false});
	settings.registerSetting("SIGNATURE",						{name: "zimbraPrefMailSignature", type: ZmSetting.T_PREF});
	settings.registerSetting("SIGNATURE_ENABLED",				{name: "zimbraPrefMailSignatureEnabled", type: ZmSetting.T_PREF, dataType: ZmSetting.D_BOOLEAN, defaultValue: false});
	settings.registerSetting("SIGNATURE_STYLE",					{name: "zimbraPrefMailSignatureStyle", type: ZmSetting.T_PREF, defaultValue: ZmSetting.SIG_OUTLOOK});
	settings.registerSetting("VACATION_MSG",					{name: "zimbraPrefOutOfOfficeReply", type: ZmSetting.T_PREF});
	settings.registerSetting("VACATION_MSG_ENABLED",			{name: "zimbraPrefOutOfOfficeReplyEnabled", type: ZmSetting.T_PREF, dataType: ZmSetting.D_BOOLEAN, defaultValue: false});
	settings.registerSetting("VACATION_MSG_FEATURE_ENABLED",	{name: "zimbraFeatureOutOfOfficeReplyEnabled", type: ZmSetting.T_COS, dataType: ZmSetting.D_BOOLEAN, defaultValue: false});

	ZmMailApp._setGroupByMaps();
};

ZmMailApp.prototype._registerPrefs =
function() {
	var list = [ZmSetting.INITIAL_GROUP_MAIL_BY, ZmSetting.PAGE_SIZE, ZmSetting.SHOW_FRAGMENTS,
				ZmSetting.INITIAL_SEARCH, ZmSetting.POLLING_INTERVAL, ZmSetting.READING_PANE_ENABLED,
				ZmSetting.SAVE_TO_SENT, ZmSetting.VACATION_MSG_ENABLED, ZmSetting.VACATION_MSG,
				ZmSetting.NOTIF_ENABLED, ZmSetting.NOTIF_ADDRESS, ZmSetting.MAIL_FORWARDING_ADDRESS,					 
				ZmSetting.MAIL_LOCAL_DELIVERY_DISABLED, ZmSetting.VIEW_AS_HTML, ZmSetting.DEDUPE_MSG_TO_SELF, 
				ZmSetting.NEW_WINDOW_COMPOSE];
				
	ZmPref.setPrefList("MAIL_PREFS", list);

	ZmPref.registerPref("DEDUPE_MSG_TO_SELF", {
		displayName:		ZmMsg.removeDupesToSelf,
		displayContainer:	ZmPref.TYPE_SELECT,
		displayOptions:		[ZmMsg.dedupeNone, ZmMsg.dedupeSecondCopy, ZmMsg.dedupeAll],
		options:			[ZmSetting.DEDUPE_NONE, ZmSetting.DEDUPE_SECOND, ZmSetting.DEDUPE_ALL]
	});

	ZmPref.registerPref("FORWARD_INCLUDE_ORIG", {
		displayName:		ZmMsg.forwardInclude,
		displayContainer:	ZmPref.TYPE_SELECT,
		displayOptions:		[ZmMsg.includeAsAttach, ZmMsg.includeInBody, ZmMsg.includePrefix],
		options:			[ZmSetting.INCLUDE_ATTACH, ZmSetting.INCLUDE, ZmSetting.INCLUDE_PREFIX]
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
		
	ZmPref.registerPref("MAIL_LOCAL_DELIVERY_DISABLED", {
		displayName:		ZmMsg.mailDeliveryDisabled,
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		displaySeparator:	true,
		precondition:		ZmSetting.MAIL_FORWARDING_ENABLED
	});
	
	ZmPref.registerPref("NEW_WINDOW_COMPOSE", {
		displayName:		ZmMsg.composeInNewWin,
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		displaySeparator: 	true
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
	
	ZmPref.registerPref("REPLY_INCLUDE_ORIG", {
		displayName:		ZmMsg.replyInclude,
		displayContainer:	ZmPref.TYPE_SELECT,
		displayOptions:		[ZmMsg.dontInclude, ZmMsg.includeAsAttach,
							 ZmMsg.includeInBody, ZmMsg.includePrefix, ZmMsg.smartInclude],
		options:			[ZmSetting.INCLUDE_NONE, ZmSetting.INCLUDE_ATTACH,
							 ZmSetting.INCLUDE, ZmSetting.INCLUDE_PREFIX, ZmSetting.INCLUDE_SMART]
	});
	
	ZmPref.registerPref("REPLY_PREFIX", {
		displayName:		ZmMsg.prefix,
		displayContainer:	ZmPref.TYPE_SELECT,
		displayOptions:		[">", "|"],
		displaySeparator:	true
	});
	
	ZmPref.registerPref("REPLY_TO_ADDRESS", {
		displayName:		ZmMsg.replyToAddress,
		displayContainer:	ZmPref.TYPE_INPUT,
		validationFunction: ZmPref.validateEmail,
		errorMessage:       ZmMsg.invalidEmail
	});
	
	ZmPref.registerPref("SAVE_TO_SENT", {
		displayName:		ZmMsg.saveToSent,
		displayContainer:	ZmPref.TYPE_CHECKBOX
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
		displayContainer:	ZmPref.TYPE_CHECKBOX
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
};

ZmMailApp.prototype._registerOperations =
function() {
	ZmOperation.registerOp("ADD_SIGNATURE", {textKey:"addSignature"}/*, ZmSetting.SIGNATURE_ENABLED*/);
	ZmOperation.registerOp("CHECK_MAIL", {textKey:"checkMail", tooltipKey:"checkMailTooltip", image:"Refresh"});
	ZmOperation.registerOp("COMPOSE_OPTIONS", {textKey:"options", image:"Preferences"});
	ZmOperation.registerOp("DELETE_CONV", {textKey:"delConv", image:"DeleteConversation"}, ZmSetting.CONVERSATIONS_ENABLED);
	ZmOperation.registerOp("DELETE_MENU", {tooltipKey:"deleteTooltip", image:"Delete"});
	ZmOperation.registerOp("DETACH_COMPOSE", {tooltipKey:"detachTooltip", image:"OpenInNewWindow"});
	ZmOperation.registerOp("DRAFT", null, ZmSetting.SAVE_DRAFT_ENABLED);
	ZmOperation.registerOp("FORWARD", {textKey:"forward", tooltipKey:"forwardTooltip", image:"Forward"});
	ZmOperation.registerOp("FORWARD_ATT", {textKey:"forwardAtt", tooltipKey:"forwardAtt", image:"Forward"});
	ZmOperation.registerOp("FORWARD_INLINE", {textKey:"forwardInline", tooltipKey:"forwardTooltip", image:"Forward"});
	ZmOperation.registerOp("FORWARD_MENU", {textKey:"forward", tooltipKey:"forwardTooltip", image:"Forward"}, null,
		AjxCallback.simpleClosure(function(parent) {
			ZmOperation.addDeferredMenu(ZmMailApp.addForwardMenu, parent);
	}));
	ZmOperation.registerOp("IM", {textKey:"newIM", image:"ImStartChat"}, ZmSetting.IM_ENABLED);
	ZmOperation.registerOp("INC_ATTACHMENT", {textKey:"includeMenuAttachment"});
	ZmOperation.registerOp("INC_NONE", {textKey:"includeMenuNone"});
	ZmOperation.registerOp("INC_NO_PREFIX", {textKey:"includeMenuNoPrefix"});
	ZmOperation.registerOp("INC_PREFIX", {textKey:"includeMenuPrefix"});
	ZmOperation.registerOp("INC_SMART", {textKey:"includeMenuSmart"});
	ZmOperation.registerOp("MARK_READ", {textKey:"markAsRead", image:"ReadMessage"});
	ZmOperation.registerOp("MARK_UNREAD", {textKey:"markAsUnread", image:"UnreadMessage"});
	ZmOperation.registerOp("NEW_MESSAGE", {textKey:"newEmail", tooltipKey:"newMessageTooltip", image:"NewMessage"});
	ZmOperation.registerOp("NEW_MESSAGE_WIN", {textKey:"newEmail", tooltipKey:"newMessageTooltip", image:"NewMessage"});
	ZmOperation.registerOp("REPLY", {textKey:"reply", tooltipKey:"replyTooltip", image:"Reply"});
	ZmOperation.registerOp("REPLY_ACCEPT", {textKey:"replyAccept", image:"Check"});
	ZmOperation.registerOp("REPLY_ALL", {textKey:"replyAll", tooltipKey:"replyAllTooltip", image:"ReplyAll"});
	ZmOperation.registerOp("REPLY_CANCEL");
	ZmOperation.registerOp("REPLY_DECLINE", {textKey:"replyDecline", image:"Cancel"});
	ZmOperation.registerOp("REPLY_MENU", {textKey:"reply", tooltipKey:"replyTooltip", image:"Reply"}, ZmSetting.REPLY_MENU_ENABLED,
		AjxCallback.simpleClosure(function(parent) {
			ZmOperation.addDeferredMenu(ZmMailApp.addReplyMenu, parent);
	}));
	ZmOperation.registerOp("REPLY_MODIFY");
	ZmOperation.registerOp("REPLY_NEW_TIME", {textKey:"replyNewTime", image:"NewTime"});
	ZmOperation.registerOp("REPLY_TENTATIVE", {textKey:"replyTentative", image:"QuestionMark"});
	ZmOperation.registerOp("SAVE_DRAFT", {textKey:"saveDraft", tooltipKey:"saveDraftTooltip", image:"DraftFolder"}, ZmSetting.SAVE_DRAFT_ENABLED);
	ZmOperation.registerOp("SHOW_BCC", {textKey:"showBcc"});
	ZmOperation.registerOp("SHOW_ONLY_MAIL", {textKey:"showOnlyMail", image:"Conversation"}, ZmSetting.MIXED_VIEW_ENABLED);
	ZmOperation.registerOp("SHOW_ORIG", {textKey:"showOrig", image:"Message"});
	ZmOperation.registerOp("SPAM", {textKey:"junk", tooltipKey:"junkTooltip", image:"SpamFolder"}, ZmSetting.SPAM_ENABLED);
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
			AjxDispatcher.require("Mail");
			return new ZmMailList(ZmItem.CONV, this._appCtxt, search);
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
			AjxDispatcher.require("Mail");
			return new ZmMailList(ZmItem.MSG, this._appCtxt, search);
		}, this)
						});

	ZmItem.registerItem(ZmItem.ATT,
						{nameKey:		"attachment",
						 icon:			"Attachment",
						 itemClass:		"ZmMimePart",
						 node:			"mp",
						 resultsList:
		AjxCallback.simpleClosure(function(search) {
			return new ZmMailList(ZmItem.ATT, this._appCtxt, search);
		}, this)
						});
};

ZmMailApp.prototype._setupSearchToolbar =
function() {
	ZmSearchToolBar.FOR_MAIL_MI = "FOR MAIL";
	ZmSearchToolBar.addMenuItem(ZmSearchToolBar.FOR_MAIL_MI,
								{msgKey:		"searchMail",
								 tooltipKey:	"searchMail",
								 icon:			"SearchMail"
								});

	ZmSearchToolBar.FOR_PAM_MI 	= "FOR PAM";
	ZmSearchToolBar.addMenuItem(ZmSearchToolBar.FOR_PAM_MI,
								{msgKey:		"searchPersonalSharedMail",
								 tooltipKey:	"searchPersonalSharedMail",
								 icon:			"SearchSharedMail",
								 setting:		ZmSetting.SHARING_ENABLED
								});
};

ZmMailApp.prototype._registerApp =
function() {
	var newItemOps = {};
	newItemOps[ZmOperation.NEW_MESSAGE] = "message";

	var actionCodes = {};
	actionCodes[ZmKeyMap.NEW_MESSAGE]		= ZmOperation.NEW_MESSAGE;
	actionCodes[ZmKeyMap.NEW_MESSAGE_WIN]	= ZmOperation.NEW_MESSAGE_WIN;
	
	ZmApp.registerApp(ZmApp.MAIL,
							 {mainPkg:				"Mail",
							  nameKey:				"mail",
							  icon:					"MailApp",
							  chooserTooltipKey:	"goToMail",
							  viewTooltipKey:		"displayMail",
							  defaultSearch:		ZmSearchToolBar.FOR_MAIL_MI,
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
							  defaultSort:			10
							  });
};

// App API

ZmMailApp.prototype.startup =
function(result) {
	AjxDispatcher.run("GetComposeController").initComposeView(true);
	this._groupBy = this._appCtxt.get(ZmSetting.GROUP_MAIL_BY);	// set type for initial search
};

ZmMailApp.prototype.preNotify =
function(notify) {
	this._adjustNotifies(notify);
};

/**
 * For mail creates, there is no authoritative list (mail lists are always the result
 * of a search), so we notify each ZmMailList that we know about. To make life easier,
 * we figure out which folder(s) a conv spans before we hand it off.
 * <p>
 * Since the offline client may receive hundreds of create notifications at a time, we
 * make sure a create notification is relevant before creating a mail object.</p>
 * 
 * @param creates	[hash]		hash of create notifications
 */
ZmMailApp.prototype.createNotify =
function(creates, force) {
	if (!creates["m"] && !creates["c"] && !creates["link"]) { return; }
	if (!force && !this._noDefer && this._deferNotifications("create", creates)) { return; }

	var convs = {};
	var msgs = {};
	var folders = {};
	var gotMail = false;
	var view = this._appCtxt.getCurrentViewId();
	var isListView = (view == ZmController.TRAD_VIEW || view == ZmController.CONVLIST_VIEW ||
					  view == ZmController.HYBRID_VIEW);

	// we can only handle new mail notifications if:
	// 	- we are currently in a mail view
	//	- the view is the result of a simple folder search
	// TODO: support simple tag search
	var currList = this._appCtxt.getCurrentList();
	if (!(currList instanceof ZmMailList)) { return; }

	// for CV, folderId will correspond to parent list view
	var folderId = currList.search.folderId;
	if (!folderId) { return; }

	var sortBy = currList.search.sortBy;
	var a = currList.getArray();
	var limit = this._appCtxt.get(ZmSetting.PAGE_SIZE);
	var last = (a && a.length >= limit) ? a[a.length - 1] : null;
	var cutoff = last ? last.date : null;
	DBG.println("cutoff = " + cutoff + ", list size = " + a.length);

	for (var name in creates) {
		var list = creates[name];
		for (var i = 0; i < list.length; i++) {
			var create = list[i];

			// if we're showing convs and get a new msg notif, update its conv
			if (currList.type == ZmItem.CONV && name == "m") {
				var cid = create.cid;
				var folder = create.l;
				if (cid && folder) {
					if (!folders[cid]) {
						folders[cid] = {};
					}
					folders[cid][folder] = true;
				}
				// see if conv already has this msg
				var conv = this._appCtxt.getById(cid);
				if (conv && conv.msgs && conv.msgs.getById(create.id)) {
					create._handled = true;
					continue;
				}
				var msg = ZmMailMsg.createFromDom(create, {appCtxt: this._appCtxt}, true);
				msgs[msg.id] = msg;
				gotMail = true;
			}
			
			// ignore items that are not of the current type
			if ((currList.type == ZmItem.MSG && name == "c") ||
				(currList.type == ZmItem.CONV && name == "m")) {
				DBG.println(AjxDebug.DBG2, "new " + name + " not of current type");
				create._handled = true;
				continue;
			}
			
			// ignore msgs that are not in the current folder; can't do this check
			// for convs since they can span folders and lack the "l" property
			if (isListView && (name == "m") && (create.l != folderId)) {
				DBG.println(AjxDebug.DBG2, "new " + name + " in other folder: " + create.l);
				create._handled = true;
				continue;
			}
			
			// ignore mail that falls outside our range
			if (sortBy == ZmSearch.DATE_DESC && (create.d < cutoff)) {
				DBG.println(AjxDebug.DBG2, "new " + name + " is too old: " + create.d);
				create._handled = true;
				continue;
			}
			if (sortBy == ZmSearch.DATE_ASC && (create.d > cutoff)) {
				DBG.println(AjxDebug.DBG2, "new " + name + " is too new: " + create.d);
				create._handled = true;
				continue;
			}
			
			// ignore stuff we already have, and virtual convs that got normalized
			if (this._appCtxt.cacheGet(create.id) || ((name == "c") && create._wasVirtConv)) {
				create._handled = true;
				continue;
			}
	
			if (name == "m") {
				DBG.println(AjxDebug.DBG1, "ZmMailApp: handling CREATE for node: " + name);
				var msg = ZmMailMsg.createFromDom(create, {appCtxt: this._appCtxt}, true);
				msgs[msg.id] = msg;
				gotMail = true;
				create._handled = true;
			} else if (name == "c") {
				DBG.println(AjxDebug.DBG1, "ZmMailApp: handling CREATE for node: " + name);
				var conv = ZmConv.createFromDom(create, {appCtxt: this._appCtxt}, true);
				convs[conv.id] = conv;
				gotMail = true;
				create._handled = true;
			} else if (name == "link") {
				this._handleCreateLink(create, ZmOrganizer.FOLDER);
			}
		}
	}
	if (gotMail) {
		for (var cid in convs) {
			convs[cid].folders = folders[cid];
		}
		if (currList && (currList instanceof ZmMailList)) {
			currList.notifyCreate(convs, msgs);
		}
	}
};

ZmMailApp.prototype.postNotify =
function(notify) {
	if (this._checkReplenishListView) {
		this._checkReplenishListView._checkReplenish();
		this._checkReplenishListView = null;
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
function(callback, checkQS) {
	var loadCallback = new AjxCallback(this, this._handleLoadLaunch, [callback, checkQS]);
	AjxDispatcher.require("Mail", false, loadCallback, null, true);
};

ZmMailApp.prototype._handleLoadLaunch =
function(callback, checkQS) {
	var query;
	if (checkQS) {
		if (location && (location.search.match(/\bview=compose\b/))) {
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
			return;
		} else if (location.search && (location.search.match(/\bview=msg\b/))) {
			var match = location.search.match(/\bid=(\d+)/);
			var id = match ? match[1] : null;
			if (id) {
				query = ["item:", id].join("");
			}
		}
	}
	query = query || this._appCtxt.get(ZmSetting.INITIAL_SEARCH);
	var types = new AjxVector();
	types.add(this.getGroupMailBy());

	var params = {query:query, callback:callback, types:types};
	params.errorCallback = new AjxCallback(this, this._handleErrorLaunch, params);
	this._appCtxt.getSearchController().search(params);
};

ZmMailApp.prototype._handleErrorLaunch =
function(params, ex) {
	if (ex.code == ZmCsfeException.MAIL_NO_SUCH_FOLDER ||
		ex.code == ZmCsfeException.MAIL_NO_SUCH_TAG)
	{
		// reset the params so we default to searching the inbox which *will* work
		var newParams = {query:"in:inbox", callback:params.callback, errorCallback:null, types:params.types};
		this._appCtxt.getSearchController().search(newParams);
	}
};

ZmMailApp.prototype.showSearchResults =
function(results, callback) {
	var loadCallback = new AjxCallback(this, this._handleLoadShowSearchResults, [results, callback]);
	AjxDispatcher.require("Mail", false, loadCallback, null, true);
};

/**
 * Messages have only one list view - Trad View. Convs default to
 * Conv List View unless user is using Hybrid View.
 */
ZmMailApp.prototype._handleLoadShowSearchResults =
function(results, callback) {
	if (results.type == ZmItem.MSG) {
		this.getTradController().show(results);
	} else if (this._groupBy == ZmSetting.GROUP_BY_HYBRID) {
		this.getHybridController().show(results);
	} else {
		this.getConvListController().show(results);
	}
	if (callback) {
		callback.run();
	}
};

ZmMailApp.prototype.getAttachmentListController =
function() {
	if (!this._attachmentListController) {
		this._attachmentListController = new ZmAttachmentListController(this._appCtxt, this._container, this);
	}
	return this._attachmentListController;
};

ZmMailApp.prototype.getConvListController =
function() {
	if (!this._convListController) {
		this._convListController = new ZmConvListController(this._appCtxt, this._container, this);
	}
	return this._convListController;
};

ZmMailApp.prototype.getConvController =
function() {
	if (!this._convController) {
		this._convController = new ZmConvController(this._appCtxt, this._container, this);
	}
	return this._convController;
};

ZmMailApp.prototype.getTradController = 
function() {
	if (!this._tradController) {
		this._tradController = new ZmTradController(this._appCtxt, this._container, this);
	}
	return this._tradController;
};

ZmMailApp.prototype.getMsgController =
function() {
	if (!this._msgController) {
		this._msgController = new ZmMsgController(this._appCtxt, this._container, this);
	}
	return this._msgController;
};

ZmMailApp.prototype.getHybridController =
function() {
	if (!this._hybridController) {
		this._hybridController = new ZmHybridController(this._appCtxt, this._container, this);
	}
	return this._hybridController;
};

/**
 * @param appCtxt	[ZmAppCtxt]*	new window passes in its own app ctxt
 */
ZmMailApp.prototype.getComposeController =
function() {
	if (!this._composeController) {
		this._composeController = new ZmComposeController(this._appCtxt, this._container, this);
	}
	return this._composeController;
};

ZmMailApp.prototype.getMailListController =
function() {
	var groupMailBy = this._appCtxt.get(ZmSetting.GROUP_MAIL_BY);
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

/**
* Convenience method to convert "group mail by" between server (string)
* and client (int constant) versions.
*/
ZmMailApp.prototype.getGroupMailBy =
function() {
	var setting = this._groupBy || this._appCtxt.get(ZmSetting.GROUP_MAIL_BY);
	return setting ? ZmMailApp.GROUP_MAIL_BY_ITEM[setting] : ZmItem.MSG;
};

// Normalize the notifications that occur when a virtual conv gets promoted to a real conv.
ZmMailApp.prototype._adjustNotifies =
function(notify) {
	if (!(notify.deleted && notify.created && notify.modified))	{ return notify; }
	
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
			createdConvs[id] = create;
			gotNewConv = true;
		}
	}
	if (!gotNewConv) { return notify; }
	
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
			}
		}
	}
	if (!msgMoved) { return notify; }
	
	// We're promoting a virtual conv. Normalize the notifications object, and
	// process a preliminary notif that will update the virtual conv's ID to its
	// new value.
	
	// First, ignore the deleted notif for the virtual conv
	notify.deleted.id = newDeletedIds.join(",");
	
	// Next, make sure we ignore the create for the real conv by placing a marker in its node.
	for (var i = 0; i < createList.length; i++) {
		var create = createList[i];
		var id = create.id;
		var name = create._name;
		if (name == "c" && virtConv[newToOldCid[id]]) {
			createdConvs[id]._wasVirtConv = true;
		}
	}

	// Create modified notifs for the virtual convs that have been promoted.
	var newMods = [];
	for (var cid in newToOldCid) {
		var node = createdConvs[cid];
		node.id = newToOldCid[cid];
		node._newId = cid;
		newMods.push(node);
	}
	
	// Go ahead and process these changes, which will change the ID of each promoted conv
	// from its virtual (negative) ID to its real (positive) one.
	if (newMods.length) {
		var mods = {};
		mods.c = newMods;
		this._appCtxt.getRequestMgr()._handleModifies(mods);
	}
	
	return notify;
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

