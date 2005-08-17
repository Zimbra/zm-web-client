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
						ZmSetting.SHOW_SEARCH_STRING];

ZmPref.MAIL_PREFS = [ZmSetting.GROUP_MAIL_BY, ZmSetting.PAGE_SIZE, ZmSetting.SHOW_FRAGMENTS,
					 ZmSetting.INITIAL_SEARCH,
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
						  
ZmPref.CALENDAR_PREFS = [ZmSetting.CALENDAR_INITIAL_VIEW,  ZmSetting.CAL_SHOW_TIMEZONE];

ZmPref.validateEmail = 
function (emailStr) {
	if (emailStr) {
		var match = ZmEmailAddress.parse(emailStr);
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

ZmPref.SETUP = new Object();

ZmPref.SETUP[ZmSetting.SEARCH_INCLUDES_SPAM] = {
	displayName:		LmMsg.includeJunkFolder,
	displayContainer:	"checkbox"};

ZmPref.SETUP[ZmSetting.SEARCH_INCLUDES_TRASH] = {
	displayName:		LmMsg.includeTrashFolder,
	displayContainer:	"checkbox",
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.PASSWORD] = {
	displayName:		LmMsg.changePassword,
	displayContainer:	"x_password",
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.GROUP_MAIL_BY] =	{ 
	displayName:		LmMsg.groupMailBy,
	displayContainer:	"select",
	displayOptions:		[LmMsg.message, LmMsg.conversation],
	options:			[ZmSetting.GROUP_BY_MESSAGE, ZmSetting.GROUP_BY_CONV]};

ZmPref.SETUP[ZmSetting.PAGE_SIZE] = {
	displayName:		LmMsg.itemsPerPage,
	displayContainer:	"select",
	displayOptions:		["10", "25", "50", "100"]};

ZmPref.SETUP[ZmSetting.SHOW_FRAGMENTS] = {
	displayName:		LmMsg.showFragments,
	displayContainer:	"checkbox"};

ZmPref.SETUP[ZmSetting.INITIAL_SEARCH] = {
	displayName:		LmMsg.initialMailSearch,
	displayContainer:	"input",
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.SAVE_TO_SENT] = {
	displayName:		LmMsg.saveToSent,
	displayContainer:	"checkbox"};

ZmPref.SETUP[ZmSetting.REPLY_TO_ADDRESS] = {
	displayName:		LmMsg.replyToAddress,
	displayContainer:	"input",
	validationFunction: ZmPref.validateEmail,
	errorMessage:       LmMsg.invalidEmail};

ZmPref.SETUP[ZmSetting.REPLY_INCLUDE_ORIG] = {
	displayName:		LmMsg.replyInclude,
	displayContainer:	"select",
	displayOptions:		[LmMsg.dontInclude, LmMsg.includeAsAttach,
						 LmMsg.includeInBody, LmMsg.includePrefix, LmMsg.smartInclude],
	options:			[ZmSetting.INCLUDE_NONE, ZmSetting.INCLUDE_ATTACH,
						 ZmSetting.INCLUDE, ZmSetting.INCLUDE_PREFIX, ZmSetting.INCLUDE_SMART]};

ZmPref.SETUP[ZmSetting.FORWARD_INCLUDE_ORIG] = {
	displayName:		LmMsg.forwardInclude,
	displayContainer:	"select",
	displayOptions:		[LmMsg.includeAsAttach, LmMsg.includeInBody, LmMsg.includePrefix],
	options:			[ZmSetting.INCLUDE_ATTACH, ZmSetting.INCLUDE, ZmSetting.INCLUDE_PREFIX]};

ZmPref.SETUP[ZmSetting.REPLY_PREFIX] = {
	displayName:		LmMsg.prefix,
	displayContainer:	"select",
	displayOptions:		[">", "|"],
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.SIGNATURE_ENABLED] = {
	displayName:		LmMsg.signatureEnabled,
	displayContainer:	"checkbox"};

ZmPref.SETUP[ZmSetting.SIGNATURE_STYLE] = {
	displayName:		LmMsg.signatureStyle,
	displayContainer:	"checkbox"};

ZmPref.SETUP[ZmSetting.SIGNATURE] = {
	displayName:		LmMsg.signature,
	displayContainer:	"textarea",
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.VACATION_MSG_ENABLED] = {
	displayName:		LmMsg.awayMessageEnabled,
	displayContainer:	"checkbox"};

ZmPref.SETUP[ZmSetting.VACATION_MSG] = {
	displayName:		LmMsg.awayMessage,
	displayContainer:	"textarea",
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.NOTIF_ENABLED] = {
	displayName:		LmMsg.mailNotifEnabled,
	displayContainer:	"checkbox"};

ZmPref.SETUP[ZmSetting.NOTIF_ADDRESS] = {
	displayName:		LmMsg.mailNotifAddress,
	displayContainer:	"input",
	validationFunction: ZmPref.validateEmail,
	errorMessage:       LmMsg.invalidEmail,
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.VIEW_AS_HTML] = {
	displayName:		LmMsg.viewMailAsHtml,
	displayContainer:	"checkbox"};

ZmPref.SETUP[ZmSetting.COMPOSE_AS_FORMAT] = {
	displayName:		LmMsg.composeMailUsing,
	displayContainer:	"select",
	displayOptions: 	[LmMsg.text, LmMsg.htmlDocument],
	options: 			[ZmSetting.COMPOSE_TEXT, ZmSetting.COMPOSE_HTML]};

ZmPref.SETUP[ZmSetting.COMPOSE_SAME_FORMAT] = {
	displayName:		LmMsg.replyForwardInSameFormat,
	displayContainer:	"checkbox"};

ZmPref.SETUP[ZmSetting.DEDUPE_MSG_TO_SELF] = {
	displayName:		LmMsg.removeDupesToSelf,
	displayContainer:	"select",
	displayOptions:		[LmMsg.dedupeNone, LmMsg.dedupeSecondCopy, LmMsg.dedupeAll],
	options:			[ZmSetting.DEDUPE_NONE, ZmSetting.DEDUPE_SECOND, ZmSetting.DEDUPE_ALL]};

ZmPref.SETUP[ZmSetting.NEW_WINDOW_COMPOSE] = {
	displayName:		LmMsg.composeInNewWin,
	displayContainer:	"checkbox",
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.AUTO_ADD_ADDRESS] = {
	displayName:		LmMsg.autoAddContacts,
	displayContainer:	"checkbox",
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.CONTACTS_VIEW] = {
	displayName:		LmMsg.viewContacts,
 	displayContainer:	"select",
	displayOptions:		[LmMsg.detailedCards, LmMsg.contactList],
	options:			[ZmSetting.CV_CARDS, ZmSetting.CV_LIST]};

ZmPref.SETUP[ZmSetting.CONTACTS_PER_PAGE] = {
	displayName:		LmMsg.contactsPerPage,
 	displayContainer:	"select",
	displayOptions:		["10", "25", "50", "100"],
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.IMPORT] = {
	displayName:		LmMsg._import,
	displayContainer:	"import",
	displaySeparator:	false};

ZmPref.SETUP[ZmSetting.EXPORT] = {
	displayName:		LmMsg._export,
	displayContainer:	"export",
	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.SHOW_SEARCH_STRING] = {
	displayName:		LmMsg.showSearchString,
	displayContainer:	"checkbox",
	displaySeparator:	true};

// ZmPref.SETUP[ZmSetting.DEFAULT_CALENDAR_TIMEZONE] = {
// 	displayName:		LmMsg.defaultCalendarTimezone,
// 	displayContainer:	"select",
// 	choices:            ZmTimezones.getFullZoneChoices(),
// 	displaySeparator:	true};

ZmPref.SETUP[ZmSetting.CAL_SHOW_TIMEZONE] = {
 	displayName:		LmMsg.shouldShowTimezone,
 	displayContainer:	"checkbox",
 	displaySeparator:	false};

ZmPref.SETUP[ZmSetting.CALENDAR_INITIAL_VIEW] = {
 	displayName:		LmMsg.calendarInitialView,
 	displayContainer:	"select",
	displayOptions:		[LmMsg.calViewDay, LmMsg.calViewWorkWeek, LmMsg.calViewWeek, LmMsg.calViewMonth],
	options:			[ZmSetting.CAL_DAY, ZmSetting.CAL_WORK_WEEK, ZmSetting.CAL_WEEK, ZmSetting.CAL_MONTH],
 	displaySeparator:	false};

