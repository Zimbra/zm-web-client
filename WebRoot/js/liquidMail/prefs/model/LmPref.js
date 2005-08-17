function LmPref(id, name, dataType) {

	LmSetting.call(this, id, name, LmSetting.T_PREF, dataType);
	
	this.origValue = null;
	this.isDirty = false;
}

LmPref.prototype = LmSetting;
LmPref.prototype.constructor = LmPref;

LmPref.KEY_ID = "prefId_";

// convert between server values for "group mail by" and item types
LmPref.GROUP_MAIL_BY_ITEM = new Object();
LmPref.GROUP_MAIL_BY_ITEM[LmSetting.GROUP_BY_CONV] = LmItem.CONV;
LmPref.GROUP_MAIL_BY_ITEM[LmSetting.GROUP_BY_MESSAGE] = LmItem.MSG;
LmPref.GROUP_MAIL_BY_VALUE = new Object();
LmPref.GROUP_MAIL_BY_VALUE[LmItem.CONV] = LmSetting.GROUP_BY_CONV;
LmPref.GROUP_MAIL_BY_VALUE[LmItem.MSG] = LmSetting.GROUP_BY_MESSAGE;

LmPref.GENERAL_PREFS = [LmSetting.SEARCH_INCLUDES_SPAM, LmSetting.SEARCH_INCLUDES_TRASH, LmSetting.PASSWORD, 
						LmSetting.SHOW_SEARCH_STRING];

LmPref.MAIL_PREFS = [LmSetting.GROUP_MAIL_BY, LmSetting.PAGE_SIZE, LmSetting.SHOW_FRAGMENTS,
					 LmSetting.INITIAL_SEARCH,
					 LmSetting.SAVE_TO_SENT, LmSetting.REPLY_TO_ADDRESS, LmSetting.REPLY_INCLUDE_ORIG, 
					 LmSetting.FORWARD_INCLUDE_ORIG, LmSetting.REPLY_PREFIX,
					 LmSetting.SIGNATURE_ENABLED, LmSetting.SIGNATURE_STYLE, LmSetting.SIGNATURE,
					 LmSetting.VACATION_MSG_ENABLED, LmSetting.VACATION_MSG,
					 LmSetting.NOTIF_ENABLED, LmSetting.NOTIF_ADDRESS,
					 LmSetting.VIEW_AS_HTML, LmSetting.DEDUPE_MSG_TO_SELF, 
					 LmSetting.COMPOSE_AS_FORMAT, LmSetting.COMPOSE_SAME_FORMAT, LmSetting.NEW_WINDOW_COMPOSE];
					 
LmPref.ADDR_BOOK_PREFS = [LmSetting.AUTO_ADD_ADDRESS, 
						  LmSetting.CONTACTS_VIEW, LmSetting.CONTACTS_PER_PAGE,
						  LmSetting.IMPORT, LmSetting.EXPORT];
						  
LmPref.CALENDAR_PREFS = [LmSetting.CALENDAR_INITIAL_VIEW,  LmSetting.CAL_SHOW_TIMEZONE];

LmPref.validateEmail = 
function (emailStr) {
	if (emailStr) {
		var match = LmEmailAddress.parse(emailStr);
		return (match != null);
	}
	return true;
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

LmPref.SETUP = new Object();

LmPref.SETUP[LmSetting.SEARCH_INCLUDES_SPAM] = {
	displayName:		LmMsg.includeJunkFolder,
	displayContainer:	"checkbox"};

LmPref.SETUP[LmSetting.SEARCH_INCLUDES_TRASH] = {
	displayName:		LmMsg.includeTrashFolder,
	displayContainer:	"checkbox",
	displaySeparator:	true};

LmPref.SETUP[LmSetting.PASSWORD] = {
	displayName:		LmMsg.changePassword,
	displayContainer:	"x_password",
	displaySeparator:	true};

LmPref.SETUP[LmSetting.GROUP_MAIL_BY] =	{ 
	displayName:		LmMsg.groupMailBy,
	displayContainer:	"select",
	displayOptions:		[LmMsg.message, LmMsg.conversation],
	options:			[LmSetting.GROUP_BY_MESSAGE, LmSetting.GROUP_BY_CONV]};

LmPref.SETUP[LmSetting.PAGE_SIZE] = {
	displayName:		LmMsg.itemsPerPage,
	displayContainer:	"select",
	displayOptions:		["10", "25", "50", "100"]};

LmPref.SETUP[LmSetting.SHOW_FRAGMENTS] = {
	displayName:		LmMsg.showFragments,
	displayContainer:	"checkbox"};

LmPref.SETUP[LmSetting.INITIAL_SEARCH] = {
	displayName:		LmMsg.initialMailSearch,
	displayContainer:	"input",
	displaySeparator:	true};

LmPref.SETUP[LmSetting.SAVE_TO_SENT] = {
	displayName:		LmMsg.saveToSent,
	displayContainer:	"checkbox"};

LmPref.SETUP[LmSetting.REPLY_TO_ADDRESS] = {
	displayName:		LmMsg.replyToAddress,
	displayContainer:	"input",
	validationFunction: LmPref.validateEmail,
	errorMessage:       LmMsg.invalidEmail};

LmPref.SETUP[LmSetting.REPLY_INCLUDE_ORIG] = {
	displayName:		LmMsg.replyInclude,
	displayContainer:	"select",
	displayOptions:		[LmMsg.dontInclude, LmMsg.includeAsAttach,
						 LmMsg.includeInBody, LmMsg.includePrefix, LmMsg.smartInclude],
	options:			[LmSetting.INCLUDE_NONE, LmSetting.INCLUDE_ATTACH,
						 LmSetting.INCLUDE, LmSetting.INCLUDE_PREFIX, LmSetting.INCLUDE_SMART]};

LmPref.SETUP[LmSetting.FORWARD_INCLUDE_ORIG] = {
	displayName:		LmMsg.forwardInclude,
	displayContainer:	"select",
	displayOptions:		[LmMsg.includeAsAttach, LmMsg.includeInBody, LmMsg.includePrefix],
	options:			[LmSetting.INCLUDE_ATTACH, LmSetting.INCLUDE, LmSetting.INCLUDE_PREFIX]};

LmPref.SETUP[LmSetting.REPLY_PREFIX] = {
	displayName:		LmMsg.prefix,
	displayContainer:	"select",
	displayOptions:		[">", "|"],
	displaySeparator:	true};

LmPref.SETUP[LmSetting.SIGNATURE_ENABLED] = {
	displayName:		LmMsg.signatureEnabled,
	displayContainer:	"checkbox"};

LmPref.SETUP[LmSetting.SIGNATURE_STYLE] = {
	displayName:		LmMsg.signatureStyle,
	displayContainer:	"checkbox"};

LmPref.SETUP[LmSetting.SIGNATURE] = {
	displayName:		LmMsg.signature,
	displayContainer:	"textarea",
	displaySeparator:	true};

LmPref.SETUP[LmSetting.VACATION_MSG_ENABLED] = {
	displayName:		LmMsg.awayMessageEnabled,
	displayContainer:	"checkbox"};

LmPref.SETUP[LmSetting.VACATION_MSG] = {
	displayName:		LmMsg.awayMessage,
	displayContainer:	"textarea",
	displaySeparator:	true};

LmPref.SETUP[LmSetting.NOTIF_ENABLED] = {
	displayName:		LmMsg.mailNotifEnabled,
	displayContainer:	"checkbox"};

LmPref.SETUP[LmSetting.NOTIF_ADDRESS] = {
	displayName:		LmMsg.mailNotifAddress,
	displayContainer:	"input",
	validationFunction: LmPref.validateEmail,
	errorMessage:       LmMsg.invalidEmail,
	displaySeparator:	true};

LmPref.SETUP[LmSetting.VIEW_AS_HTML] = {
	displayName:		LmMsg.viewMailAsHtml,
	displayContainer:	"checkbox"};

LmPref.SETUP[LmSetting.COMPOSE_AS_FORMAT] = {
	displayName:		LmMsg.composeMailUsing,
	displayContainer:	"select",
	displayOptions: 	[LmMsg.text, LmMsg.htmlDocument],
	options: 			[LmSetting.COMPOSE_TEXT, LmSetting.COMPOSE_HTML]};

LmPref.SETUP[LmSetting.COMPOSE_SAME_FORMAT] = {
	displayName:		LmMsg.replyForwardInSameFormat,
	displayContainer:	"checkbox"};

LmPref.SETUP[LmSetting.DEDUPE_MSG_TO_SELF] = {
	displayName:		LmMsg.removeDupesToSelf,
	displayContainer:	"select",
	displayOptions:		[LmMsg.dedupeNone, LmMsg.dedupeSecondCopy, LmMsg.dedupeAll],
	options:			[LmSetting.DEDUPE_NONE, LmSetting.DEDUPE_SECOND, LmSetting.DEDUPE_ALL]};

LmPref.SETUP[LmSetting.NEW_WINDOW_COMPOSE] = {
	displayName:		LmMsg.composeInNewWin,
	displayContainer:	"checkbox",
	displaySeparator:	true};

LmPref.SETUP[LmSetting.AUTO_ADD_ADDRESS] = {
	displayName:		LmMsg.autoAddContacts,
	displayContainer:	"checkbox",
	displaySeparator:	true};

LmPref.SETUP[LmSetting.CONTACTS_VIEW] = {
	displayName:		LmMsg.viewContacts,
 	displayContainer:	"select",
	displayOptions:		[LmMsg.detailedCards, LmMsg.contactList],
	options:			[LmSetting.CV_CARDS, LmSetting.CV_LIST]};

LmPref.SETUP[LmSetting.CONTACTS_PER_PAGE] = {
	displayName:		LmMsg.contactsPerPage,
 	displayContainer:	"select",
	displayOptions:		["10", "25", "50", "100"],
	displaySeparator:	true};

LmPref.SETUP[LmSetting.IMPORT] = {
	displayName:		LmMsg._import,
	displayContainer:	"import",
	displaySeparator:	false};

LmPref.SETUP[LmSetting.EXPORT] = {
	displayName:		LmMsg._export,
	displayContainer:	"export",
	displaySeparator:	true};

LmPref.SETUP[LmSetting.SHOW_SEARCH_STRING] = {
	displayName:		LmMsg.showSearchString,
	displayContainer:	"checkbox",
	displaySeparator:	true};

// LmPref.SETUP[LmSetting.DEFAULT_CALENDAR_TIMEZONE] = {
// 	displayName:		LmMsg.defaultCalendarTimezone,
// 	displayContainer:	"select",
// 	choices:            LmTimezones.getFullZoneChoices(),
// 	displaySeparator:	true};

LmPref.SETUP[LmSetting.CAL_SHOW_TIMEZONE] = {
 	displayName:		LmMsg.shouldShowTimezone,
 	displayContainer:	"checkbox",
 	displaySeparator:	false};

LmPref.SETUP[LmSetting.CALENDAR_INITIAL_VIEW] = {
 	displayName:		LmMsg.calendarInitialView,
 	displayContainer:	"select",
	displayOptions:		[LmMsg.calViewDay, LmMsg.calViewWorkWeek, LmMsg.calViewWeek, LmMsg.calViewMonth],
	options:			[LmSetting.CAL_DAY, LmSetting.CAL_WORK_WEEK, LmSetting.CAL_WEEK, LmSetting.CAL_MONTH],
 	displaySeparator:	false};

