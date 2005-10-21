/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmPref(id, name, dataType) {

	ZmSetting.call(this, id, name, ZmSetting.T_PREF, dataType);
	
	this.origValue = null;
	this.isDirty = false;
}

ZmPref.prototype = ZmSetting;
ZmPref.prototype.constructor = ZmPref;

ZmPref.KEY_ID = "prefId_";

// convert between server values for "group mail by" and item types
ZmPref.GROUP_MAIL_BY_ITEM = new Object();
ZmPref.GROUP_MAIL_BY_ITEM[ZmSetting.GROUP_BY_CONV] = ZmItem.CONV;
ZmPref.GROUP_MAIL_BY_ITEM[ZmSetting.GROUP_BY_MESSAGE] = ZmItem.MSG;
ZmPref.GROUP_MAIL_BY_VALUE = new Object();
ZmPref.GROUP_MAIL_BY_VALUE[ZmItem.CONV] = ZmSetting.GROUP_BY_CONV;
ZmPref.GROUP_MAIL_BY_VALUE[ZmItem.MSG] = ZmSetting.GROUP_BY_MESSAGE;

ZmPref.GENERAL_PREFS = [ZmSetting.SEARCH_INCLUDES_SPAM, ZmSetting.SEARCH_INCLUDES_TRASH, ZmSetting.PASSWORD, 
						ZmSetting.SHOW_SEARCH_STRING, 
						ZmSetting.COMPOSE_INIT_FONT_FAMILY, ZmSetting.COMPOSE_INIT_FONT_SIZE, ZmSetting.COMPOSE_INIT_FONT_COLOR];

ZmPref.MAIL_PREFS = [ZmSetting.GROUP_MAIL_BY, ZmSetting.PAGE_SIZE, ZmSetting.SHOW_FRAGMENTS,
					 ZmSetting.INITIAL_SEARCH, ZmSetting.POLLING_INTERVAL,
					 ZmSetting.SAVE_TO_SENT, ZmSetting.REPLY_TO_ADDRESS, ZmSetting.REPLY_INCLUDE_ORIG, 
					 ZmSetting.FORWARD_INCLUDE_ORIG, ZmSetting.REPLY_PREFIX,
					 ZmSetting.SIGNATURE_ENABLED, ZmSetting.SIGNATURE_STYLE, ZmSetting.SIGNATURE,
					 ZmSetting.VACATION_MSG_ENABLED, ZmSetting.VACATION_MSG,
					 ZmSetting.NOTIF_ENABLED, ZmSetting.NOTIF_ADDRESS,
					 ZmSetting.VIEW_AS_HTML, ZmSetting.DEDUPE_MSG_TO_SELF, 
					 ZmSetting.COMPOSE_AS_FORMAT, ZmSetting.COMPOSE_SAME_FORMAT, ZmSetting.NEW_WINDOW_COMPOSE];
					 
ZmPref.ADDR_BOOK_PREFS = [ZmSetting.AUTO_ADD_ADDRESS, 
						  ZmSetting.CONTACTS_VIEW, ZmSetting.CONTACTS_PER_PAGE,
						  ZmSetting.IMPORT, ZmSetting.EXPORT];
						  
ZmPref.CALENDAR_PREFS = [ZmSetting.CALENDAR_INITIAL_VIEW, ZmSetting.CAL_FIRST_DAY_OF_WEEK, ZmSetting.CAL_SHOW_TIMEZONE];

ZmPref.validateEmail = 
function(emailStr) {
	if (emailStr) {
		var match = ZmEmailAddress.parse(emailStr);
		return (match != null);
	}
	return true;
}

ZmPref.validatePollingInterval = 
function(interval) {
	var minimum = window._zimbraMail._appCtxt.get(ZmSetting.MIN_POLLING_INTERVAL);
	if (interval && minimum && interval >= minimum) {
		return true;
	} else {
		var min = minimum / 60;
		ZmPref.SETUP[ZmSetting.POLLING_INTERVAL].errorMessage = AjxStringUtil.resolve(ZmMsg.invalidPollingInterval, min);
		return false;
	}
}

// The SETUP object for a pref gets translated into a form input. Available properties are:
//
// displayName			descriptive text
// displayContainer		type of form input: checkbox, select, input, or textarea
// options				values for a select input
// displayOptions		text for the select input's values
// validationFunction	function to validate the value
// errorMessage			message to show if validation fails
// displaySeparator		if true, a line will be drawn below this pref

ZmPref.SETUP = new Object();

ZmPref.SETUP[ZmSetting.SEARCH_INCLUDES_SPAM] = {
	displayName:		ZmMsg.includeJunkFolder,
	displayContainer:	"checkbox"};

ZmPref.SETUP[ZmSetting.SEARCH_INCLUDES_TRASH] = {
	displayName:		ZmMsg.includeTrashFolder,
	displayContainer:	"checkbox",
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.PASSWORD] = {
	displayName:		ZmMsg.changePassword,
	displayContainer:	"x_password",
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.GROUP_MAIL_BY] =	{ 
	displayName:		ZmMsg.groupMailBy,
	displayContainer:	"select",
	displayOptions:		[ZmMsg.message, ZmMsg.conversation],
	options:			[ZmSetting.GROUP_BY_MESSAGE, ZmSetting.GROUP_BY_CONV]};

ZmPref.SETUP[ZmSetting.PAGE_SIZE] = {
	displayName:		ZmMsg.itemsPerPage,
	displayContainer:	"select",
	displayOptions:		["10", "25", "50", "100"]};

ZmPref.SETUP[ZmSetting.SHOW_FRAGMENTS] = {
	displayName:		ZmMsg.showFragments,
	displayContainer:	"checkbox"};

ZmPref.SETUP[ZmSetting.INITIAL_SEARCH] = {
	displayName:		ZmMsg.initialMailSearch,
	displayContainer:	"input",
	displaySeparator:	false};

ZmPref.SETUP[ZmSetting.POLLING_INTERVAL] = {
	displayName:		ZmMsg.pollingInterval,
	displayContainer:	"input",
	validationFunction: ZmPref.validatePollingInterval,
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.SAVE_TO_SENT] = {
	displayName:		ZmMsg.saveToSent,
	displayContainer:	"checkbox"};

ZmPref.SETUP[ZmSetting.REPLY_TO_ADDRESS] = {
	displayName:		ZmMsg.replyToAddress,
	displayContainer:	"input",
	validationFunction: ZmPref.validateEmail,
	errorMessage:       ZmMsg.invalidEmail};

ZmPref.SETUP[ZmSetting.REPLY_INCLUDE_ORIG] = {
	displayName:		ZmMsg.replyInclude,
	displayContainer:	"select",
	displayOptions:		[ZmMsg.dontInclude, ZmMsg.includeAsAttach,
						 ZmMsg.includeInBody, ZmMsg.includePrefix, ZmMsg.smartInclude],
	options:			[ZmSetting.INCLUDE_NONE, ZmSetting.INCLUDE_ATTACH,
						 ZmSetting.INCLUDE, ZmSetting.INCLUDE_PREFIX, ZmSetting.INCLUDE_SMART]};

ZmPref.SETUP[ZmSetting.FORWARD_INCLUDE_ORIG] = {
	displayName:		ZmMsg.forwardInclude,
	displayContainer:	"select",
	displayOptions:		[ZmMsg.includeAsAttach, ZmMsg.includeInBody, ZmMsg.includePrefix],
	options:			[ZmSetting.INCLUDE_ATTACH, ZmSetting.INCLUDE, ZmSetting.INCLUDE_PREFIX]};

ZmPref.SETUP[ZmSetting.REPLY_PREFIX] = {
	displayName:		ZmMsg.prefix,
	displayContainer:	"select",
	displayOptions:		[">", "|"],
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.SIGNATURE_ENABLED] = {
	displayName:		ZmMsg.signatureEnabled,
	displayContainer:	"checkbox"};

ZmPref.SETUP[ZmSetting.SIGNATURE_STYLE] = {
	displayName:		ZmMsg.signatureStyle,
	displayContainer:	"checkbox"};

ZmPref.SETUP[ZmSetting.SIGNATURE] = {
	displayName:		ZmMsg.signature,
	displayContainer:	"textarea",
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.VACATION_MSG_ENABLED] = {
	displayName:		ZmMsg.awayMessageEnabled,
	displayContainer:	"checkbox"};

ZmPref.SETUP[ZmSetting.VACATION_MSG] = {
	displayName:		ZmMsg.awayMessage,
	displayContainer:	"textarea",
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.NOTIF_ENABLED] = {
	displayName:		ZmMsg.mailNotifEnabled,
	displayContainer:	"checkbox"};

ZmPref.SETUP[ZmSetting.NOTIF_ADDRESS] = {
	displayName:		ZmMsg.mailNotifAddress,
	displayContainer:	"input",
	validationFunction: ZmPref.validateEmail,
	errorMessage:       ZmMsg.invalidEmail,
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.VIEW_AS_HTML] = {
	displayName:		ZmMsg.viewMailAsHtml,
	displayContainer:	"checkbox"};

ZmPref.SETUP[ZmSetting.COMPOSE_AS_FORMAT] = {
	displayName:		ZmMsg.composeMailUsing,
	displayContainer:	"select",
	displayOptions: 	[ZmMsg.text, ZmMsg.htmlDocument],
	options: 			[ZmSetting.COMPOSE_TEXT, ZmSetting.COMPOSE_HTML]};

ZmPref.SETUP[ZmSetting.COMPOSE_INIT_FONT_FAMILY] = {
	displayName:		ZmMsg.defaultFontSettings,
	displayContainer:	"font",
	displayOptions: 	["Arial", "Times New Roman", "Courier New", "Verdana"],
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.COMPOSE_INIT_FONT_SIZE] = {
	displayName:		null,
	displayContainer:	"font",
	displayOptions: 	["8pt", "10pt", "12pt", "14pt", "18pt", "24pt", "36pt"]};

ZmPref.SETUP[ZmSetting.COMPOSE_INIT_FONT_COLOR] = {
	displayOptions: 	["rgb(0, 0, 0)"]};

ZmPref.SETUP[ZmSetting.COMPOSE_SAME_FORMAT] = {
	displayName:		ZmMsg.replyForwardInSameFormat,
	displayContainer:	"checkbox"};

ZmPref.SETUP[ZmSetting.DEDUPE_MSG_TO_SELF] = {
	displayName:		ZmMsg.removeDupesToSelf,
	displayContainer:	"select",
	displayOptions:		[ZmMsg.dedupeNone, ZmMsg.dedupeSecondCopy, ZmMsg.dedupeAll],
	options:			[ZmSetting.DEDUPE_NONE, ZmSetting.DEDUPE_SECOND, ZmSetting.DEDUPE_ALL]};

ZmPref.SETUP[ZmSetting.NEW_WINDOW_COMPOSE] = {
	displayName:		ZmMsg.composeInNewWin,
	displayContainer:	"checkbox",
	displaySeparator: 	true};

ZmPref.SETUP[ZmSetting.AUTO_ADD_ADDRESS] = {
	displayName:		ZmMsg.autoAddContacts,
	displayContainer:	"checkbox",
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.CONTACTS_VIEW] = {
	displayName:		ZmMsg.viewContacts,
 	displayContainer:	"select",
	displayOptions:		[ZmMsg.detailedCards, ZmMsg.contactList],
	options:			[ZmSetting.CV_CARDS, ZmSetting.CV_LIST]};

ZmPref.SETUP[ZmSetting.CONTACTS_PER_PAGE] = {
	displayName:		ZmMsg.contactsPerPage,
 	displayContainer:	"select",
	displayOptions:		["10", "25", "50", "100"],
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.IMPORT] = {
	displayName:		ZmMsg._import,
	displayContainer:	"import",
	displaySeparator:	false};

ZmPref.SETUP[ZmSetting.EXPORT] = {
	displayName:		ZmMsg._export,
	displayContainer:	"export",
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.SHOW_SEARCH_STRING] = {
	displayName:		ZmMsg.showSearchString,
	displayContainer:	"checkbox",
	displaySeparator:	true};

// ZmPref.SETUP[ZmSetting.DEFAULT_CALENDAR_TIMEZONE] = {
// 	displayName:		ZmMsg.defaultCalendarTimezone,
// 	displayContainer:	"select",
// 	choices:            ZmTimezones.getFullZoneChoices(),
// 	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.CAL_SHOW_TIMEZONE] = {
 	displayName:		ZmMsg.shouldShowTimezone,
 	displayContainer:	"checkbox",
 	displaySeparator:	false};

ZmPref.SETUP[ZmSetting.CALENDAR_INITIAL_VIEW] = {
 	displayName:		ZmMsg.calendarInitialView,
 	displayContainer:	"select",
	displayOptions:		[ZmMsg.calViewDay, ZmMsg.calViewWorkWeek, ZmMsg.calViewWeek, ZmMsg.calViewMonth, ZmMsg.calViewSchedule],
	options:			[ZmSetting.CAL_DAY, ZmSetting.CAL_WORK_WEEK, ZmSetting.CAL_WEEK, ZmSetting.CAL_MONTH, ZmSetting.CAL_SCHEDULE],
 	displaySeparator:	false};

ZmPref.SETUP[ZmSetting.CAL_FIRST_DAY_OF_WEEK] = {
 	displayName:		ZmMsg.calendarFirstDayOfWeek,
 	displayContainer:	"select",
	displayOptions:		AjxDateUtil.WEEKDAY_LONG,
	options:			[0,1,2,3,4,5,6]};
