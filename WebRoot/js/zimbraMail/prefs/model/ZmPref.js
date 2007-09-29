/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

function ZmPref(id, name, dataType) {

	ZmSetting.call(this, id, name, ZmSetting.T_PREF, dataType);
	
	this.origValue = null;
	this.isDirty = false;
};

ZmPref.prototype = new ZmSetting();
ZmPref.prototype.constructor = ZmPref;

ZmPref.KEY_ID = "prefId_";

// convert between server values for "group mail by" and item types
ZmPref.GROUP_MAIL_BY_ITEM = {};
ZmPref.GROUP_MAIL_BY_ITEM[ZmSetting.GROUP_BY_CONV] = ZmItem.CONV;
ZmPref.GROUP_MAIL_BY_ITEM[ZmSetting.GROUP_BY_MESSAGE] = ZmItem.MSG;
ZmPref.GROUP_MAIL_BY_VALUE = {};
ZmPref.GROUP_MAIL_BY_VALUE[ZmItem.CONV] = ZmSetting.GROUP_BY_CONV;
ZmPref.GROUP_MAIL_BY_VALUE[ZmItem.MSG] = ZmSetting.GROUP_BY_MESSAGE;

ZmPref.GENERAL_PREFS = [ZmSetting.DEFAULT_CALENDAR_TIMEZONE,
						ZmSetting.SEARCH_INCLUDES_SPAM, ZmSetting.SEARCH_INCLUDES_TRASH,
						ZmSetting.SHOW_SEARCH_STRING, ZmSetting.COMPOSE_AS_FORMAT,
						ZmSetting.COMPOSE_INIT_FONT_FAMILY, ZmSetting.COMPOSE_INIT_FONT_SIZE, ZmSetting.COMPOSE_INIT_FONT_COLOR,
						ZmSetting.PASSWORD, ZmSetting.SKIN_NAME];

ZmPref.MAIL_PREFS = [ZmSetting.INITIAL_GROUP_MAIL_BY, ZmSetting.PAGE_SIZE, ZmSetting.SHOW_FRAGMENTS,
					 ZmSetting.INITIAL_SEARCH, ZmSetting.POLLING_INTERVAL, ZmSetting.READING_PANE_ENABLED,
					 ZmSetting.SAVE_TO_SENT, ZmSetting.VACATION_MSG_ENABLED, ZmSetting.VACATION_MSG,
					 ZmSetting.NOTIF_ENABLED, ZmSetting.NOTIF_ADDRESS, ZmSetting.MAIL_FORWARDING_ADDRESS,					 
					 ZmSetting.MAIL_LOCAL_DELIVERY_DISABLED, ZmSetting.VIEW_AS_HTML, ZmSetting.DEDUPE_MSG_TO_SELF, 
					 ZmSetting.NEW_WINDOW_COMPOSE];
					 
ZmPref.ADDR_BOOK_PREFS = [ZmSetting.AUTO_ADD_ADDRESS, ZmSetting.GAL_AUTOCOMPLETE,
						  ZmSetting.GAL_AUTOCOMPLETE_SESSION,
						  ZmSetting.CONTACTS_VIEW, ZmSetting.CONTACTS_PER_PAGE,
						  ZmSetting.IMPORT, ZmSetting.EXPORT];
						  
ZmPref.CALENDAR_PREFS = [ZmSetting.CALENDAR_INITIAL_VIEW, ZmSetting.CAL_FIRST_DAY_OF_WEEK, 
						 ZmSetting.CAL_SHOW_TIMEZONE, ZmSetting.CAL_USE_QUICK_ADD, ZmSetting.CAL_ALWAYS_SHOW_MINI_CAL,
						 ZmSetting.CAL_REMINDER_WARNING_TIME];

ZmPref.SHORTCUT_PREFS = [ZmSetting.SHORTCUTS];

ZmPref.POP_ACCOUNTS_PREFS = [];

var i = 1;
ZmPref.TYPE_INPUT		= i++;
ZmPref.TYPE_CHECKBOX	= i++;
ZmPref.TYPE_SELECT		= i++;
ZmPref.TYPE_TEXTAREA	= i++;
ZmPref.TYPE_PASSWORD	= i++;
ZmPref.TYPE_FONT		= i++;
ZmPref.TYPE_IMPORT		= i++;
ZmPref.TYPE_EXPORT		= i++;
ZmPref.TYPE_SHORTCUTS	= i++;
delete i;

// custom functions for loading and validation

ZmPref.loadSkins =
function(appCtxt, setup) {
	var skins = appCtxt.get(ZmSetting.AVAILABLE_SKINS);
	for (var i = 0; i < skins.length; i++) {
		var skin = skins[i];
		setup.options.push(skin);
		var skin1 = skin.substr(0, 1).toUpperCase() + skin.substr(1);
		var text = ZmMsg['skin' + skin1];
		text = text ? text : skin1;
		setup.displayOptions.push(text);
	}
};

ZmPref.validateEmail = 
function(emailStr) {
	appCtxt = window._zimbraMail._appCtxt;
	if (!emailStr) {
		return true;
	}
	var match = ZmEmailAddress.parse(emailStr);

	if (match == null) {
		return false;
	}

	var emailLogin = emailStr.substring(0, emailStr.indexOf("@"));
	var aliases = appCtxt.get(ZmSetting.MAIL_ALIASES);
	aliases.unshift(appCtxt.get(ZmSetting.USERNAME));
	for (var i = 0; i < aliases.length; i++) {
		var alias = aliases[i];
		if (emailStr == alias || emailLogin == alias.substring(0, alias.indexOf("@"))) {
			return false;
		}
	}

	return true;
};

ZmPref.validatePollingInterval = 
function(interval) {
	var minimum = window._zimbraMail._appCtxt.get(ZmSetting.MIN_POLLING_INTERVAL);
	if (interval && minimum && interval >= minimum) {
		return true;
	} else {
		var min = minimum / 60;
		ZmPref.SETUP[ZmSetting.POLLING_INTERVAL].errorMessage = AjxMessageFormat.format(ZmMsg.invalidPollingInterval, min);
		return false;
	}
};

// maximum value lengths
ZmPref.MAX_LENGTH = {};
ZmPref.MAX_LENGTH[ZmSetting.INITIAL_SEARCH]	= 512;
ZmPref.MAX_LENGTH[ZmSetting.SIGNATURE]		= 1024;
ZmPref.MAX_LENGTH[ZmSetting.AWAY_MESSAGE]	= 8192;

/* The SETUP object for a pref gets translated into a form input. Available properties are:

displayName			descriptive text
displayContainer	type of form input: checkbox, select, input, or textarea
options				values for a select input
displayOptions		text for the select input's values
validationFunction	function to validate the value
errorMessage		message to show if validation fails
displaySeparator	if true, a line will be drawn below this pref
precondition		pref will not be displayed unless precondition is true
*/

ZmPref.SETUP = {};

ZmPref.SETUP[ZmSetting.AUTO_ADD_ADDRESS] = {
	displayName:		ZmMsg.autoAddContacts,
	displayContainer:	ZmPref.TYPE_CHECKBOX};

ZmPref.SETUP[ZmSetting.CAL_ALWAYS_SHOW_MINI_CAL] = {
 	displayName:		ZmMsg.alwaysShowMiniCal,
 	displayContainer:	ZmPref.TYPE_CHECKBOX};

ZmPref.SETUP[ZmSetting.CAL_FIRST_DAY_OF_WEEK] = {
 	displayName:		ZmMsg.calendarFirstDayOfWeek,
 	displayContainer:	ZmPref.TYPE_SELECT,
	displayOptions:		AjxDateUtil.WEEKDAY_LONG,
	options:			[0,1,2,3,4,5,6]};

ZmPref.SETUP[ZmSetting.CAL_REMINDER_WARNING_TIME] = {
	displayName:		ZmMsg.numberOfMinutes,
	displayContainer:	ZmPref.TYPE_SELECT,
	displayOptions:		[ZmMsg.neverShow, "1", "5", "10", "15", "30", "45", "60"],
	options:			[0, 1, 5, 10, 15, 30, 45, 60]};

ZmPref.SETUP[ZmSetting.CAL_SHOW_TIMEZONE] = {
 	displayName:		ZmMsg.shouldShowTimezone,
 	displayContainer:	ZmPref.TYPE_CHECKBOX};

ZmPref.SETUP[ZmSetting.CAL_USE_QUICK_ADD] = {
 	displayName:		ZmMsg.useQuickAdd,
 	displayContainer:	ZmPref.TYPE_CHECKBOX};

ZmPref.SETUP[ZmSetting.CALENDAR_INITIAL_VIEW] = {
 	displayName:		ZmMsg.calendarInitialView,
 	displayContainer:	ZmPref.TYPE_SELECT,
	displayOptions:		[ZmMsg.calViewDay, ZmMsg.calViewWorkWeek, ZmMsg.calViewWeek, ZmMsg.calViewMonth, ZmMsg.calViewSchedule],
	options:			[ZmSetting.CAL_DAY, ZmSetting.CAL_WORK_WEEK, ZmSetting.CAL_WEEK, ZmSetting.CAL_MONTH, ZmSetting.CAL_SCHEDULE]};

ZmPref.SETUP[ZmSetting.COMPOSE_AS_FORMAT] = {
	displayName:		ZmMsg.composeUsing,
	displayContainer:	ZmPref.TYPE_SELECT,
	displayOptions: 	[ZmMsg.text, ZmMsg.htmlDocument],
	options: 			[ZmSetting.COMPOSE_TEXT, ZmSetting.COMPOSE_HTML],
	precondition:		ZmSetting.HTML_COMPOSE_ENABLED,
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.COMPOSE_INIT_FONT_FAMILY] = {
	displayName:		ZmMsg.defaultFontSettings,
	displayContainer:	ZmPref.TYPE_FONT,
	displayOptions: 	["Arial", "Times New Roman", "Courier", "Verdana"],
	options: 			["Arial", "Times New Roman", "Courier", "Verdana"],
	precondition:		ZmSetting.HTML_COMPOSE_ENABLED,
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.COMPOSE_INIT_FONT_SIZE] = {
	displayName:		null,
	displayContainer:	ZmPref.TYPE_FONT,
	displayOptions: 	["8pt", "10pt", "12pt", "14pt", "18pt", "24pt", "36pt"],
	precondition:		ZmSetting.HTML_COMPOSE_ENABLED};

ZmPref.SETUP[ZmSetting.COMPOSE_INIT_FONT_COLOR] = {
	displayOptions: 	["rgb(0, 0, 0)"],
	displayContainer:	ZmPref.TYPE_FONT,
	precondition:		ZmSetting.HTML_COMPOSE_ENABLED};

ZmPref.SETUP[ZmSetting.COMPOSE_SAME_FORMAT] = {
	displayName:		ZmMsg.replyForwardInSameFormat,
	displayContainer:	ZmPref.TYPE_CHECKBOX};

ZmPref.SETUP[ZmSetting.CONTACTS_PER_PAGE] = {
	displayName:		ZmMsg.contactsPerPage,
 	displayContainer:	ZmPref.TYPE_SELECT,
	displayOptions:		["10", "25", "50", "100"],
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.CONTACTS_VIEW] = {
	displayName:		ZmMsg.viewContacts,
 	displayContainer:	ZmPref.TYPE_SELECT,
	displayOptions:		[ZmMsg.detailedCards, ZmMsg.contactList],
	options:			[ZmSetting.CV_CARDS, ZmSetting.CV_LIST]};

ZmPref.SETUP[ZmSetting.DEDUPE_MSG_TO_SELF] = {
	displayName:		ZmMsg.removeDupesToSelf,
	displayContainer:	ZmPref.TYPE_SELECT,
	displayOptions:		[ZmMsg.dedupeNone, ZmMsg.dedupeSecondCopy, ZmMsg.dedupeAll],
	options:			[ZmSetting.DEDUPE_NONE, ZmSetting.DEDUPE_SECOND, ZmSetting.DEDUPE_ALL]};

ZmPref.SETUP[ZmSetting.DEFAULT_CALENDAR_TIMEZONE] = {
	displayName:		ZmMsg.defaultCalendarTimezone,
	displayContainer:	ZmPref.TYPE_SELECT,
	displayOptions:     AjxTimezone.getZonePreferences(),
	options:            AjxTimezone.getZonePreferencesOptions(),
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.EXPORT] = {
	displayName:		ZmMsg.exportToCSV,
	displayContainer:	ZmPref.TYPE_EXPORT,
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.FORWARD_INCLUDE_ORIG] = {
	displayName:		ZmMsg.forwardInclude,
	displayContainer:	ZmPref.TYPE_SELECT,
	displayOptions:		[ZmMsg.includeAsAttach, ZmMsg.includeInBody, ZmMsg.includePrefix],
	options:			[ZmSetting.INCLUDE_ATTACH, ZmSetting.INCLUDE, ZmSetting.INCLUDE_PREFIX]};

ZmPref.SETUP[ZmSetting.GAL_AUTOCOMPLETE] = {
	displayName:		ZmMsg.galAutocomplete,
	displayContainer:	ZmPref.TYPE_CHECKBOX,
	precondition:		ZmSetting.GAL_AUTOCOMPLETE_ENABLED};

ZmPref.SETUP[ZmSetting.GAL_AUTOCOMPLETE_SESSION] = {
	displayName:		ZmMsg.galAutocompleteSession,
	displayContainer:	ZmPref.TYPE_CHECKBOX,
	precondition:		ZmSetting.GAL_AUTOCOMPLETE,
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.IMPORT] = {
	displayName:		ZmMsg.importFromCSV,
	displayContainer:	ZmPref.TYPE_IMPORT,
	displaySeparator:	false};

ZmPref.SETUP[ZmSetting.INITIAL_GROUP_MAIL_BY] =	{ 
	displayName:		ZmMsg.groupMailBy,
	displayContainer:	ZmPref.TYPE_SELECT,
	displayOptions:		[ZmMsg.message, ZmMsg.conversation],
	options:			[ZmSetting.GROUP_BY_MESSAGE, ZmSetting.GROUP_BY_CONV],
	precondition:		ZmSetting.CONVERSATIONS_ENABLED};

ZmPref.SETUP[ZmSetting.INITIAL_SEARCH] = {
	displayName:		ZmMsg.initialMailSearch,
	displayContainer:	ZmPref.TYPE_INPUT,
	maxLength:			ZmPref.MAX_LENGTH[ZmSetting.INITIAL_SEARCH],
	errorMessage:       AjxMessageFormat.format(ZmMsg.invalidInitialSearch, ZmPref.MAX_LENGTH[ZmSetting.INITIAL_SEARCH]),
	displaySeparator:	false,
	precondition:		ZmSetting.INITIAL_SEARCH_ENABLED};

ZmPref.SETUP[ZmSetting.MAIL_FORWARDING_ADDRESS] = {
	displayName:		ZmMsg.mailForwardingAddress,
	displayContainer:	ZmPref.TYPE_INPUT,
	validationFunction: ZmPref.validateEmail,
	errorMessage:       ZmMsg.invalidEmail,
	precondition:		ZmSetting.MAIL_FORWARDING_ENABLED};
	
ZmPref.SETUP[ZmSetting.MAIL_LOCAL_DELIVERY_DISABLED] = {
	displayName:		ZmMsg.mailDeliveryDisabled,
	displayContainer:	ZmPref.TYPE_CHECKBOX,
	displaySeparator:	true,
	precondition:		ZmSetting.MAIL_FORWARDING_ENABLED};

ZmPref.SETUP[ZmSetting.NEW_WINDOW_COMPOSE] = {
	displayName:		ZmMsg.composeInNewWin,
	displayContainer:	ZmPref.TYPE_CHECKBOX,
	displaySeparator: 	true};

ZmPref.SETUP[ZmSetting.NOTIF_ADDRESS] = {
	displayName:		ZmMsg.mailNotifAddress,
	displayContainer:	ZmPref.TYPE_INPUT,
	validationFunction: ZmPref.validateEmail,
	errorMessage:       ZmMsg.invalidEmail,
	precondition:		ZmSetting.NOTIF_FEATURE_ENABLED,
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.NOTIF_ENABLED] = {
	displayName:		ZmMsg.mailNotifEnabled,
	displayContainer:	ZmPref.TYPE_CHECKBOX,
	precondition:		ZmSetting.NOTIF_FEATURE_ENABLED};

ZmPref.SETUP[ZmSetting.PAGE_SIZE] = {
	displayName:		ZmMsg.itemsPerPage,
	displayContainer:	ZmPref.TYPE_SELECT,
	displayOptions:		["10", "25", "50", "100"]};

ZmPref.SETUP[ZmSetting.PASSWORD] = {
	displayName:		ZmMsg.changePassword,
	displayContainer:	ZmPref.TYPE_PASSWORD,
	precondition:		ZmSetting.CHANGE_PASSWORD_ENABLED};

ZmPref.SETUP[ZmSetting.POLLING_INTERVAL] = {
	displayName:		ZmMsg.pollingInterval,
	displayContainer:	ZmPref.TYPE_INPUT,
	validationFunction: ZmPref.validatePollingInterval};

ZmPref.SETUP[ZmSetting.READING_PANE_ENABLED] = {
	displayName:		ZmMsg.alwaysShowReadingPane,
	displayContainer:	ZmPref.TYPE_CHECKBOX,
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.REPLY_INCLUDE_ORIG] = {
	displayName:		ZmMsg.replyInclude,
	displayContainer:	ZmPref.TYPE_SELECT,
	displayOptions:		[ZmMsg.dontInclude, ZmMsg.includeAsAttach,
						 ZmMsg.includeInBody, ZmMsg.includePrefix, ZmMsg.smartInclude],
	options:			[ZmSetting.INCLUDE_NONE, ZmSetting.INCLUDE_ATTACH,
						 ZmSetting.INCLUDE, ZmSetting.INCLUDE_PREFIX, ZmSetting.INCLUDE_SMART]};

ZmPref.SETUP[ZmSetting.REPLY_PREFIX] = {
	displayName:		ZmMsg.prefix,
	displayContainer:	ZmPref.TYPE_SELECT,
	displayOptions:		[">", "|"],
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.REPLY_TO_ADDRESS] = {
	displayName:		ZmMsg.replyToAddress,
	displayContainer:	ZmPref.TYPE_INPUT,
	validationFunction: ZmPref.validateEmail,
	errorMessage:       ZmMsg.invalidEmail};

ZmPref.SETUP[ZmSetting.SAVE_TO_SENT] = {
	displayName:		ZmMsg.saveToSent,
	displayContainer:	ZmPref.TYPE_CHECKBOX};

ZmPref.SETUP[ZmSetting.SEARCH_INCLUDES_SPAM] = {
	displayName:		ZmMsg.includeJunkFolder,
	displayContainer:	ZmPref.TYPE_CHECKBOX,
	precondition:		ZmSetting.SPAM_ENABLED};

ZmPref.SETUP[ZmSetting.SEARCH_INCLUDES_TRASH] = {
	displayName:		ZmMsg.includeTrashFolder,
	displayContainer:	ZmPref.TYPE_CHECKBOX,
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.SHORTCUTS] = {
	displayContainer:	ZmPref.TYPE_SHORTCUTS,
	precondition:		ZmSetting.USE_KEYBOARD_SHORTCUTS};

ZmPref.SETUP[ZmSetting.SHOW_FRAGMENTS] = {
	displayName:		ZmMsg.showFragments,
	displayContainer:	ZmPref.TYPE_CHECKBOX};

ZmPref.SETUP[ZmSetting.SHOW_SEARCH_STRING] = {
	displayName:		ZmMsg.showSearchString,
	displayContainer:	ZmPref.TYPE_CHECKBOX,
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.SIGNATURE] = {
	displayName:		ZmMsg.signature,
	displayContainer:	ZmPref.TYPE_TEXTAREA,
	maxLength:			ZmPref.MAX_LENGTH[ZmSetting.SIGNATURE],
	errorMessage:       AjxMessageFormat.format(ZmMsg.invalidSignature, ZmPref.MAX_LENGTH[ZmSetting.SIGNATURE]),
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.SIGNATURE_ENABLED] = {
	displayName:		ZmMsg.signatureEnabled,
	displayContainer:	ZmPref.TYPE_CHECKBOX};

ZmPref.SETUP[ZmSetting.SIGNATURE_STYLE] = {
	displayName:		ZmMsg.signatureStyle,
	displayContainer:	ZmPref.TYPE_CHECKBOX};

ZmPref.SETUP[ZmSetting.SKIN_NAME] = {
	displayName:		ZmMsg.selectSkin,
	displayContainer:	ZmPref.TYPE_SELECT,
	displayOptions:		[],
	options:			[],
	loadFunction:		ZmPref.loadSkins,
	displaySeparator:	true,
	precondition:		ZmSetting.SKIN_CHANGE_ENABLED};

ZmPref.SETUP[ZmSetting.VACATION_MSG] = {
	displayName:		ZmMsg.awayMessage,
	displayContainer:	ZmPref.TYPE_TEXTAREA,
	maxLength:			ZmPref.MAX_LENGTH[ZmSetting.AWAY_MESSAGE],
	errorMessage:       AjxMessageFormat.format(ZmMsg.invalidAwayMessage, ZmPref.MAX_LENGTH[ZmSetting.AWAY_MESSAGE]),
	precondition:		ZmSetting.VACATION_MSG_FEATURE_ENABLED,
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.VACATION_MSG_ENABLED] = {
	displayName:		ZmMsg.awayMessageEnabled,
	displayContainer:	ZmPref.TYPE_CHECKBOX,
	precondition:		ZmSetting.VACATION_MSG_FEATURE_ENABLED};

ZmPref.SETUP[ZmSetting.VIEW_AS_HTML] = {
	displayName:		ZmMsg.viewMailAsHtml,
	displayContainer:	ZmPref.TYPE_CHECKBOX};
