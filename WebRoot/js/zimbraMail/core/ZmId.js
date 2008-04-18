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
 * This class is responsible for providing unique, predictable IDs for HTML elements.
 * That way, code outside the client can locate particular elements.
 * 
 * Not every element that has an associated JS object will have a known ID. Those are
 * allocated only for elements it would be useful to locate: major components of the UI,
 * toolbars, buttons, views, menus, some menu items, and some selects.
 * 
 * In general, a getElementById() on any of the non-skin IDs will return a DIV. One exception
 * is input fields. The ID is given to the DwtInputField's actual INPUT, rather than to the
 * DIV that contains it. Other exceptions are table-related: TABLE, TR, and TD.
 * 
 * There is a simple naming scheme for the IDs themselves. Each ID starts with a "z" followed
 * by one to a few letters that indicate the type of object (widget) represented by the element:
 * 
 * 		z		a component that is not a special-purpose widget listed below
 * 		ztb		a toolbar
 * 		zb		a button
 * 		zi		an input field
 * 		zm		a menu
 * 		zmi		a menu item
 * 		zs		a select
 * 		zov		an overview
 * 		zt		a tree
 * 		zti		a tree item
 * 		ztih	a tree item header
 *
 * The skin defines its own IDs starting with "skin_", which we provide constants for here.
 * 
 * @author Conrad Damon
 */
ZmId = function() {}

//
// Element IDs, and functions to generate them
//

//
// Preset IDs
//

// containers defined by the skin
ZmId.SKIN_APP_BOTTOM_TOOLBAR		= "skin_container_app_bottom_toolbar";
ZmId.SKIN_APP_CHOOSER				= "skin_container_app_chooser";
ZmId.SKIN_APP_MAIN_FULL				= "skin_container_app_main_full";
ZmId.SKIN_APP_MAIN					= "skin_container_app_main";
ZmId.SKIN_APP_MAIN_ROW_FULL			= "skin_tr_main_full";
ZmId.SKIN_APP_MAIN_ROW				= "skin_tr_main";
ZmId.SKIN_APP_TOP_TOOLBAR			= "skin_container_app_top_toolbar";
ZmId.SKIN_CURRENT_APP				= "skin_container_current_app";
ZmId.SKIN_LINKS						= "skin_container_links";
ZmId.SKIN_LOGO						= "skin_container_logo";
ZmId.SKIN_OFFLINE_STATUS			= "skin_container_offline_status";
ZmId.SKIN_QUOTA_INFO				= "skin_container_quota";
ZmId.SKIN_PRESENCE					= "skin_container_presence";
ZmId.SKIN_SASH						= "skin_container_tree_app_sash";
ZmId.SKIN_SEARCH_BUILDER			= "skin_container_search_builder";
ZmId.SKIN_SEARCH_BUILDER_TOOLBAR	= "skin_container_search_builder_toolbar";
ZmId.SKIN_SEARCH_BUILDER_TR			= "skin_tr_search_builder";
ZmId.SKIN_SEARCH					= "skin_container_search";
ZmId.SKIN_SHELL						= "skin_outer";
ZmId.SKIN_SPACING_SEARCH			= "skin_spacing_search";
ZmId.SKIN_SPLASH_SCREEN				= "skin_container_splash_screen";
ZmId.SKIN_STATUS					= "skin_container_status";
ZmId.SKIN_STATUS_ROW				= "skin_tr_status";
ZmId.SKIN_TREE_FOOTER				= "skin_container_tree_footer";
ZmId.SKIN_TREE						= "skin_container_tree";
ZmId.SKIN_USER_INFO					= "skin_container_username";
ZmId.SKIN_WEB_SEARCH				= "skin_container_web_search";

// top-level components
ZmId.SHELL					= "z_shell";			// the main shell
ZmId.LOADING_VIEW			= "z_loading";			// "Loading..." view
ZmId.MAIN_SASH				= "z_sash";				// sash between overview and content
ZmId.BANNER					= "z_banner";			// logo (at upper left by default)
ZmId.USER_NAME				= "z_userName";			// account name
ZmId.USER_QUOTA				= "z_userQuota";		// quota
ZmId.PRESENCE				= "z_presence";			// presence
ZmId.CURRENT_APP_TOOLBAR	= "ztb_currentApp";		// current app toolbar (above overview)
ZmId.NEW_FOLDER_BUTTON		= "zb_newFolder";		// New Folder button on current app toolbar
ZmId.STATUS_VIEW			= "z_status";			// status view (shows toast)
ZmId.TOAST					= "z_toast";			// toast
ZmId.APP_CHOOSER			= "ztb_appChooser";		// app chooser toolbar

// search panel
ZmId.SEARCH_TOOLBAR			= "ztb_search";			// search toolbar
ZmId.SEARCH_INPUT			= "zi_search";			// text input in search toolbar
ZmId.CUSTOM_SEARCH_BUTTON	= "zb_searchCustom";	// custom search button
ZmId.SEARCH_MENU_BUTTON		= "zb_searchMenu";		// menu with choices of types to search for
ZmId.SEARCH_BUTTON			= "zb_search";			// button that triggers the search
ZmId.SAVE_SEARCH_BUTTON		= "zb_searchSave";		// button for creating a saved search
ZmId.ADVANCED_SEARCH_BUTTON	= "zb_searchAdvanced";	// opens/closes advanced search
ZmId.LOCAL_SEARCH_BUTTON	= "zb_searchLocal";		// local search button (created by local zimlet)
ZmId.SEARCH_MENU_ALL		= "zmi_searchAll";		// search menu item for all types
ZmId.SEARCH_MENU_SHARED		= "zmi_searchShared";	// search menu item (check) to include shared items
ZmId.SEARCH_MENU_CONTACTS	= "zmi_searchContacts";	// search menu item for contacts
ZmId.SEARCH_MENU_GAL		= "zmi_searchGal";		// search menu item for GAL
ZmId.SEARCH_MENU_APPTS		= "zmi_searchAppts";	// search menu item for appointments
ZmId.SEARCH_MENU_MAIL		= "zmi_searchMail";		// search menu item for email
ZmId.SEARCH_MENU_PAGES		= "zmi_searchPages";	// search menu item for notebook pages/files
ZmId.SEARCH_MENU_TASKS		= "zmi_searchTasks";	// search menu item for tasks

//
// IDs generated by functions
//

// app buttons in the app chooser toolbar

/**
 * Generates the ID for a button in the app chooser.
 * 
 * Example: zb_mail
 * 
 * @param app	[const]		app
 */
ZmId.getAppChooserButtonId =
function(app) {
	return [ZmId.WIDGET_BUTTON, app.toLowerCase()].join("");
};

// content area views and their components

/**
 * Generates the ID for a toolbar.
 * 
 * Examples: ztb_clv ztb_tvNav ztb_cvInv
 * 
 * @param context	[string]	toolbar context (ID of owning view)
 * @param tbType	[const]*	type of toolbar (eg invite or nav)
 */
ZmId.getToolbarId =
function(context, tbType) {
	context = tbType ? [context, tbType].join("_") : context;
	return [ZmId.WIDGET_TOOLBAR, AjxStringUtil.toMixed(context, "_", true)].join("");
};

/**
 * Generates the ID for a button in a toolbar. Intended for use with the top toolbar, nav toolbar,
 * and invite toolbar.
 * 
 * Examples: zb_clvCheckMail zb_tvReply zb_composeSend zb_clvNavPageForward zb_clvInvReplyAccept
 * 
 * @param context	[string]	toolbar context (ID of owning view)
 * @param op		[const]		the button operation
 * @param tbType	[const]*	type of toolbar (eg invite or nav)
 */
ZmId.getToolbarButtonId =
function(context, op, tbType) {
	context = tbType ? [context, tbType].join("_") : context;
	return [ZmId.WIDGET_BUTTON, AjxStringUtil.toMixed(context, "_", true), AjxStringUtil.toMixed(op, "_")].join("");
};

/**
 * Generates the ID for an action menu.
 * 
 * Examples: zm_clv zm_contacts
 * 
 * @param context		[string]	menu context (eg ID of owning view, or app)
 * @param menuType		[const]*	type of menu (eg participant)
 */
ZmId.getActionMenuId =
function(context, menuType) {
	context = menuType ? [context, menuType].join("_") : context;
	return [ZmId.WIDGET_MENU, AjxStringUtil.toMixed(context, "_", true)].join("");
};

/**
 * Generates the ID for a menu item in an action menu.
 * 
 * Examples: 
 * 
 * @param context		[string]	menu context
 * @param op			[const]		the menu operation
 * @param menuType		[const]*	type of menu (eg participant)
 */
ZmId.getActionMenuItemId =
function(context, op, menuType) {
	context = menuType ? [context, menuType].join("_") : context;
	return [ZmId.WIDGET_MENU_ITEM, AjxStringUtil.toMixed(context, "_", true), AjxStringUtil.toMixed(op, "_")].join("");
};

ZmId.getOverviewId =
function(overview) {
	return [ZmId.WIDGET_OVERVIEW, overview.toLowerCase()].join("");
};

ZmId.getTreeId =
function(overviewId, orgType) {
	var text = AjxStringUtil.toMixed([overviewId, orgType].join(" "), " ", true);
	return [ZmId.WIDGET_TREE, text].join("");
};

/**
 * Returns a tree item ID based on the underlying organizer and the overview ID (since the same
 * organizer may be represented as tree items in more than one overview). Some sample IDs:
 * 
 * 		zti_mail_2				Inbox
 * 		zti_mail_172			user-created item in mail overview
 * 		zti_contacts_7			system Contacts folder
 * 		zti_calendar_304		user-created item in calendar overview
 * 		ztih_mail_folder		Folders header in mail overview
 * 
 * Constants for some system folder tree items have been provided as a convenience.
 * 
 * @param overviewId	[string]		unique ID for overview
 * @param organizerId	[ZmOrganizer]	ID of the data object backing tree item
 * @param type			[const]			organizer type (for headers only)
 */
ZmId.getTreeItemId =
function(overviewId, organizerId, type) {
	if (!organizerId && !type) { return; }
	if (type) {
		return [ZmId.WIDGET_TREE_ITEM_HDR, overviewId.toLowerCase(), "_", type.toLowerCase()].join("");
	} else {
		return [ZmId.WIDGET_TREE_ITEM, overviewId.toLowerCase(), "_", organizerId].join("");
	}
};

/**
 * Returns an ID for a view that fills the content area.
 * 
 * @param context		[constant]		view identifier (ZmId.VIEW_*)
 */
ZmId.getViewId =
function(context) {
	return [ZmId.WIDGET, context.toLowerCase(), "View"].join("");
};

/**
 * Returns an ID for a msg view within another view.
 * 
 * @param context		[constant]		owning view identifier (ZmId.VIEW_*)
 */
ZmId.getMsgViewId =
function(context) {
	return [ZmId.WIDGET, context.toLowerCase(), "MsgView"].join("");
};

/**
 * Returns an ID for a tab (actually the tab button in the tab bar).
 * 
 * Tab contexts and names:
 * 
 * 		VIEW_PREF			General, Mail, Composing, Signatures, Address Book,
 * 							Accounts, Mail Filters, Calendar, Shortcuts
 * 		VIEW_CONTACT		personal, work, home, other, notes
 * 		VIEW_APPOINTMENT	details, schedule, attendees, locations, equipment
 * 		VIEW_SHORTCUTS		list, ZmId.ORG_FOLDER, ZmId.ORG_SEARCH, ZmId.ORG_TAG
 * 
 * @param context		[constant]		owning view identifier (ZmId.VIEW_*)
 * @param tab			[string]		name of tab
 */
ZmId.getTabId =
function(context, tab) {
	return [ZmId.WIDGET_TAB, context.toLowerCase(), AjxStringUtil.toMixed(tab)].join("");
};

//
// constants used in creating IDs
//

// widget types (used to prefix IDs)
ZmId.WIDGET					= "z_";			// generic element
ZmId.WIDGET_TOOLBAR			= "ztb_";		// toolbar
ZmId.WIDGET_BUTTON			= "zb_";		// button
ZmId.WIDGET_INPUT			= "zi_";		// text input or textarea
ZmId.WIDGET_MENU			= "zm_";		// menu
ZmId.WIDGET_MENU_ITEM		= "zmi_";		// menu item
ZmId.WIDGET_SELECT			= "zs_";		// dropdown select
ZmId.WIDGET_OVERVIEW		= "zov_";		// collection of tree views
ZmId.WIDGET_TREE			= "zt_";		// tree view
ZmId.WIDGET_TREE_ITEM_HDR	= "ztih_";		// root tree item
ZmId.WIDGET_TREE_ITEM		= "zti_";		// tree item (node)
ZmId.WIDGET_TAB				= "ztab_";		// tab button

// apps
ZmId.APP_BRIEFCASE		= "Briefcase";
ZmId.APP_CALENDAR		= "Calendar";
ZmId.APP_CONTACTS		= "Contacts";
ZmId.APP_IM				= "IM";
ZmId.APP_MAIL			= "Mail";
ZmId.APP_MIXED			= "Mixed";
ZmId.APP_NOTEBOOK		= "Notebook";
ZmId.APP_PORTAL			= "Portal";
ZmId.APP_PREFERENCES	= "Options";
ZmId.APP_TASKS			= "Tasks";
ZmId.APP_VOICE			= "Voice";

// views (must be all caps) - often used as context for ID
ZmId.VIEW_APPOINTMENT 			= "APPT";
ZmId.VIEW_APPT_SCHEDULE			= "APPTS";
ZmId.VIEW_BRIEFCASE			    = "BC";
ZmId.VIEW_BRIEFCASE_DETAIL		= "BCD";
ZmId.VIEW_BRIEFCASE_COLUMN		= "BCC";
ZmId.VIEW_CAL_APPT				= "CLA";
ZmId.VIEW_CAL_DAY				= "CLD";
ZmId.VIEW_CAL_MONTH				= "CLM";
ZmId.VIEW_CAL_SCHEDULE			= "CLS";
ZmId.VIEW_CAL					= "CAL";
ZmId.VIEW_CAL_WEEK				= "CLW";
ZmId.VIEW_CAL_WORK_WEEK			= "CLWW";
ZmId.VIEW_CALL_LIST				= "CLIST";
ZmId.VIEW_COMPOSE				= "COMPOSE";
ZmId.VIEW_CONTACT_CARDS			= "CNC";
ZmId.VIEW_CONTACT_SIMPLE 		= "CNS";
ZmId.VIEW_CONTACT_SRC			= "CNSRC"; // contact picker source list
ZmId.VIEW_CONTACT_TGT			= "CNTGT"; // contact picker target list
ZmId.VIEW_CONTACT				= "CN";
ZmId.VIEW_CONVLIST 				= "CLV";
ZmId.VIEW_CONV 					= "CV";
ZmId.VIEW_FILTER_RULES			= "FRV";
ZmId.VIEW_GROUP					= "GRP";
ZmId.VIEW_IM_CHAT_MULTI_WINDOW	= "IMCMW";
ZmId.VIEW_IM_CHAT_TAB			= "IMCT";
ZmId.VIEW_LOADING				= "LOADING";
ZmId.VIEW_MIXED					= "MX";
ZmId.VIEW_MSG 					= "MSG";
ZmId.VIEW_MY_CARD				= "MYC";
ZmId.VIEW_NOTEBOOK_FILE			= "NBF";
ZmId.VIEW_NOTEBOOK_PAGE_EDIT	= "NBPE";
ZmId.VIEW_NOTEBOOK_PAGE			= "NBP";
ZmId.VIEW_NOTEBOOK_PAGE_VERSION = "NBPV";
ZmId.VIEW_NOTEBOOK_SITE			= "NBS";
ZmId.VIEW_PORTAL                = "PORTAL";
ZmId.VIEW_PREF					= "PREF";
ZmId.VIEW_SHORTCUTS				= "SHORTCUTS";
ZmId.VIEW_TASK					= "TKV";
ZmId.VIEW_TASKEDIT				= "TKE";
ZmId.VIEW_TASKLIST				= "TKL";
ZmId.VIEW_TRAD 					= "TV";
ZmId.VIEW_VOICEMAIL				= "VM";

// organizers
ZmId.ORG_ADDRBOOK			= "ADDRBOOK";
ZmId.ORG_BRIEFCASE			= "BRIEFCASE";
ZmId.ORG_CALENDAR			= "CALENDAR";
ZmId.ORG_FOLDER				= "FOLDER";
ZmId.ORG_NOTEBOOK			= "NOTEBOOK";
ZmId.ORG_ROSTER_TREE_ITEM	= "ROSTER_TREE_ITEM";
ZmId.ORG_ROSTER_TREE_GROUP	= "ROSTER_TREE_GROUP";
ZmId.ORG_SEARCH				= "SEARCH";
ZmId.ORG_TAG				= "TAG";
ZmId.ORG_TASKS				= "TASKS";
ZmId.ORG_ZIMLET				= "ZIMLET";

// items
ZmId.ITEM_APPOINTMENT	= "APPT";
ZmId.ITEM_ATT			= "ATT";
ZmId.ITEM_BRIEFCASE		= "BRIEFCASE_ITEM";
ZmId.ITEM_CALL			= "CALL";
ZmId.ITEM_CHAT			= "CHAT";
ZmId.ITEM_CONTACT		= "CONTACT";
ZmId.ITEM_CONV			= "CONV";
ZmId.ITEM_DATA_SOURCE	= "DATA_SOURCE";
ZmId.ITEM_DOCUMENT		= "DOCUMENT";
ZmId.ITEM_GROUP			= "GROUP";
ZmId.ITEM_MSG			= "MSG";
ZmId.ITEM_PAGE			= "PAGE";
ZmId.ITEM_RESOURCE		= "RESOURCE";
ZmId.ITEM_ROSTER		= "ROSTER_ITEM";
ZmId.ITEM_TASK			= "TASK";
ZmId.ITEM_VOICEMAIL		= "VOICEMAIL";

// fields of an item
ZmId.FLD_ATTACHMENT		= "at";
ZmId.FLD_CAPACITY		= "cp";
ZmId.FLD_COMPANY		= "co";
ZmId.FLD_DATE			= "dt";
ZmId.FLD_EMAIL			= "em";
ZmId.FLD_EXPAND			= "ex";	// CLV
ZmId.FLD_FILE_TYPE		= "ft";	// Notebook
ZmId.FLD_FLAG			= "fg";
ZmId.FLD_FOLDER			= "fo";
ZmId.FLD_FRAGMENT		= "fm";
ZmId.FLD_FROM			= "fr";
ZmId.FLD_HOME_PHONE		= "hp"; // Contacts
ZmId.FLD_ID				= "id";
ZmId.FLD_INDEX			= "ix";
ZmId.FLD_ITEM_ROW		= "rw";
ZmId.FLD_LOCATION		= "lo";
ZmId.FLD_NAME			= "na";
ZmId.FLD_NOTES			= "no";
ZmId.FLD_PARTICIPANT	= "pa";
ZmId.FLD_PCOMPLETE		= "pc"; // Tasks
ZmId.FLD_PRIORITY		= "pr"; // Tasks
ZmId.FLD_SELECTION		= "se";
ZmId.FLD_SIZE			= "sz";
ZmId.FLD_STATUS			= "st";
ZmId.FLD_SUBJECT		= "su";
ZmId.FLD_TAG			= "tg";
ZmId.FLD_TAG_CELL		= "tc";
ZmId.FLD_TYPE			= "ty";
ZmId.FLD_WORK_PHONE		= "wp"; // Contacts

// convenience IDs for system folder tree items - may also be generated
// via getTreeItemId()
ZmId.TREEITEM_MAIL_INBOX			= "zti_mail_2";
ZmId.TREEITEM_MAIL_TRASH			= "zti_mail_3";
ZmId.TREEITEM_MAIL_JUNK				= "zti_mail_4";
ZmId.TREEITEM_MAIL_SENT				= "zti_mail_5";
ZmId.TREEITEM_MAIL_DRAFTS			= "zti_mail_6";
ZmId.TREEITEM_CONTACTS_CONTACTS		= "zti_contacts_7";
ZmId.TREEITEM_CALENDAR_CALENDAR		= "zti_calendar_10";
ZmId.TREEITEM_NOTEBOOK_NOTEBOOK		= "zti_notebook_12";
ZmId.TREEITEM_TASKS_TASKS			= "zti_tasks_15";
ZmId.TREEITEM_BRIEFCASE_BRIEFCASE	= "zti_briefcase_16";

// special toolbars
ZmId.TB_INVITE	= "INV";
ZmId.TB_NAV		= "NAV";
ZmId.TB_SHARE	= "SHR";

// special menus
ZmId.MENU_PARTICIPANT	= "PAR";

// operations
ZmId.OP_ADD_FILTER_RULE			= "ADD_FILTER_RULE"
ZmId.OP_ADD_SIGNATURE			= "ADD_SIGNATURE"
ZmId.OP_ATTACHMENT				= "ATTACHMENT"
ZmId.OP_BROWSE					= "BROWSE"
ZmId.OP_CALL					= "CALL"
ZmId.OP_CALL_MANAGER			= "CALL_MANAGER"
ZmId.OP_CAL_REFRESH				= "CAL_REFRESH"
ZmId.OP_CAL_VIEW_MENU			= "CAL_VIEW_MENU"
ZmId.OP_CANCEL					= "CANCEL"
ZmId.OP_CHECK_ALL				= "CHECK_ALL"
ZmId.OP_CHECK_CALLS				= "CHECK_CALLS"
ZmId.OP_CHECK_MAIL				= "CHECK_MAIL"
ZmId.OP_CHECK_VOICEMAIL			= "CHECK_VOICEMAIL"
ZmId.OP_CLEAR_ALL				= "CLEAR_ALL"
ZmId.OP_CLOSE					= "CLOSE"
ZmId.OP_COMPOSE_FORMAT			= "COMPOSE_FORMAT"
ZmId.OP_COMPOSE_OPTIONS			= "COMPOSE_OPTIONS"
ZmId.OP_CONTACT					= "CONTACT"
ZmId.OP_DAY_VIEW				= "DAY_VIEW"
ZmId.OP_DELETE					= "DELETE"
ZmId.OP_DELETE_CONV				= "DELETE_CONV"
ZmId.OP_DELETE_MENU				= "DELETE_MENU"
ZmId.OP_DELETE_MSG				= "DELETE_MSG"
ZmId.OP_DETACH					= "DETACH"
ZmId.OP_DETACH_WIN				= "DETACH_WIN"
ZmId.OP_DETACH_COMPOSE			= "DETACH_COMPOSE"
ZmId.OP_DOWNLOAD_VOICEMAIL		= "DOWNLOAD_VOICEMAIL"
ZmId.OP_DRAFT					= "DRAFT"
ZmId.OP_EDIT					= "EDIT"
ZmId.OP_EDIT_CONTACT			= "EDIT_CONTACT"
ZmId.OP_EDIT_FILTER_RULE		= "EDIT_FILTER_RULE"
ZmId.OP_EDIT_NOTEBOOK_CHROME	= "EDIT_NOTEBOOK_CHROME"
ZmId.OP_EDIT_NOTEBOOK_CHROME	= "EDIT_NOTEBOOK_CHROME"
ZmId.OP_EDIT_NOTEBOOK_FOOTER	= "EDIT_NOTEBOOK_FOOTER"
ZmId.OP_EDIT_NOTEBOOK_HEADER	= "EDIT_NOTEBOOK_HEADER"
ZmId.OP_EDIT_NOTEBOOK_INDEX		= "EDIT_NOTEBOOK_INDEX"
ZmId.OP_EDIT_NOTEBOOK_SIDE_BAR	= "EDIT_NOTEBOOK_SIDE_BAR"
ZmId.OP_EDIT_PROPS				= "EDIT_PROPS"
ZmId.OP_EDIT_REPLY_ACCEPT		= "EDIT_REPLY_ACCEPT"
ZmId.OP_EDIT_REPLY_CANCEL		= "EDIT_REPLY_CANCEL"
ZmId.OP_EDIT_REPLY_DECLINE		= "EDIT_REPLY_DECLINE"
ZmId.OP_EDIT_REPLY_TENTATIVE	= "EDIT_REPLY_TENTATIVE"
ZmId.OP_EMPTY_FOLDER			= "EMPTY_FOLDER"
ZmId.OP_EXPAND_ALL				= "EXPAND_ALL"
ZmId.OP_FORMAT_HTML				= "FORMAT_HTML"
ZmId.OP_FORMAT_HTML_SOURCE		= "FORMAT_HTML_SOURCE"
ZmId.OP_FORMAT_MEDIA_WIKI		= "FORMAT_MEDIA_WIKI"
ZmId.OP_FORMAT_RICH_TEXT		= "FORMAT_RICH_TEXT"
ZmId.OP_FORMAT_TEXT				= "FORMAT_TEXT"
ZmId.OP_FORMAT_TWIKI			= "FORMAT_TWIKI"
ZmId.OP_FORWARD					= "FORWARD"
ZmId.OP_FORWARD_ATT				= "FORWARD_ATT"
ZmId.OP_FORWARD_BY_EMAIL		= "FORWARD_BY_EMAIL"
ZmId.OP_FORWARD_INLINE			= "FORWARD_INLINE"
ZmId.OP_FORWARD_MENU			= "FORWARD_MENU"
ZmId.OP_GO_TO_URL				= "GO_TO_URL"
ZmId.OP_IM						= "IM"
ZmId.OP_IMPORT_FILE				= "IMPORT_FILE"
ZmId.OP_IM_ADD_TO_CONTACT		= "IM_ADD_TO_CONTACT"
ZmId.OP_IM_BLOCK_BUDDY			= "IM_BLOCK_BUDDY"
ZmId.OP_IM_CREATE_CONTACT		= "IM_CREATE_CONTACT"
ZmId.OP_IM_EDIT_CONTACT			= "IM_EDIT_CONTACT"
ZmId.OP_IM_FLOATING_LIST		= "IM_FLOATING_LIST"
ZmId.OP_IM_GATEWAY_LOGIN		= "IM_GATEWAY_LOGIN"
ZmId.OP_IM_NEW_CHAT				= "IM_NEW_CHAT"
ZmId.OP_IM_NEW_GROUP_CHAT		= "IM_NEW_GROUP_CHAT"
ZmId.OP_IM_PRESENCE_AWAY		= "IM_PRESENCE_AWAY"
ZmId.OP_IM_PRESENCE_CHAT		= "IM_PRESENCE_CHAT"
ZmId.OP_IM_PRESENCE_CUSTOM_MSG	= "IM_PRESENCE_CUSTOM_MSG"
ZmId.OP_IM_PRESENCE_DND			= "IM_PRESENCE_DND"
ZmId.OP_IM_PRESENCE_INVISIBLE	= "IM_PRESENCE_INVISIBLE"
ZmId.OP_IM_PRESENCE_MENU		= "IM_PRESENCE_MENU"
ZmId.OP_IM_PRESENCE_OFFLINE		= "IM_PRESENCE_OFFLINE"
ZmId.OP_IM_PRESENCE_ONLINE		= "IM_PRESENCE_ONLINE"
ZmId.OP_IM_PRESENCE_XA			= "IM_PRESENCE_XA"
ZmId.OP_IM_PRESENCE_CUSTOM_MRU	= "IM_PRESENCE_CUSTOM_MRU"
ZmId.OP_IM_PRESENCE_MENU		= "IM_PRESENCE_MENU"
ZmId.OP_IM_SORT_BY_NAME			= "IM_SORT_BY_NAME"
ZmId.OP_IM_SORT_BY_PRESENCE		= "IM_SORT_BY_PRESENCE"
ZmId.OP_IM_TOGGLE_BLOCKED		= "IM_TOGGLE_BLOCKED"
ZmId.OP_IM_TOGGLE_OFFLINE		= "IM_TOGGLE_OFFLINE"
ZmId.OP_IM_UNBLOCK_BUDDY		= "IM_UNBLOCK_BUDDY"
ZmId.OP_INC_ATTACHMENT			= "INC_ATTACHMENT"
ZmId.OP_INC_NONE				= "INC_NONE"
ZmId.OP_INC_NO_PREFIX			= "INC_NO_PREFIX"
ZmId.OP_INC_PREFIX				= "INC_PREFIX"
ZmId.OP_INC_SMART				= "INC_SMART"
ZmId.OP_INVITE_REPLY_ACCEPT		= "INVITE_REPLY_ACCEPT"
ZmId.OP_INVITE_REPLY_DECLINE	= "INVITE_REPLY_DECLINE"
ZmId.OP_INVITE_REPLY_MENU		= "INVITE_REPLY_MENU"
ZmId.OP_INVITE_REPLY_TENTATIVE	= "INVITE_REPLY_TENTATIVE"
ZmId.OP_MARK_ALL_READ			= "MARK_ALL_READ"
ZmId.OP_MARK_HEARD				= "MARK_HEARD"
ZmId.OP_MARK_READ				= "MARK_READ"
ZmId.OP_MARK_UNHEARD			= "MARK_UNHEARD"
ZmId.OP_MARK_UNREAD				= "MARK_UNREAD"
ZmId.OP_MONTH_VIEW				= "MONTH_VIEW"
ZmId.OP_MOUNT_ADDRBOOK			= "MOUNT_ADDRBOOK"
ZmId.OP_MOUNT_BRIEFCASE			= "MOUNT_BRIEFCASE"
ZmId.OP_MOUNT_CALENDAR			= "MOUNT_CALENDAR"
ZmId.OP_MOUNT_FOLDER			= "MOUNT_FOLDER"
ZmId.OP_MOUNT_NOTEBOOK			= "MOUNT_NOTEBOOK"
ZmId.OP_MOUNT_TASK_FOLDER		= "MOUNT_TASK_FOLDER"
ZmId.OP_MOVE					= "MOVE"
ZmId.OP_MOVE_DOWN_FILTER_RULE	= "MOVE_DOWN_FILTER_RULE"
ZmId.OP_MOVE_UP_FILTER_RULE		= "MOVE_UP_FILTER_RULE"
ZmId.OP_NEW_ADDRBOOK			= "NEW_ADDRBOOK"
ZmId.OP_NEW_ALLDAY_APPT			= "NEW_ALLDAY_APPT"
ZmId.OP_NEW_APPT				= "NEW_APPT"
ZmId.OP_NEW_BRIEFCASEITEM		= "NEW_BRIEFCASEITEM"
ZmId.OP_NEW_CALENDAR			= "NEW_CALENDAR"
ZmId.OP_NEW_CONTACT				= "NEW_CONTACT"
ZmId.OP_NEW_FILE				= "NEW_FILE"
ZmId.OP_NEW_FOLDER				= "NEW_FOLDER"
ZmId.OP_NEW_GROUP				= "NEW_GROUP"
ZmId.OP_NEW_MENU				= "NEW_MENU"
ZmId.OP_NEW_MESSAGE				= "NEW_MESSAGE"
ZmId.OP_NEW_MESSAGE_WIN			= "NEW_MESSAGE_WIN"
ZmId.OP_NEW_NOTEBOOK			= "NEW_NOTEBOOK"
ZmId.OP_NEW_PAGE				= "NEW_PAGE"
ZmId.OP_NEW_ROSTER_ITEM			= "NEW_ROSTER_ITEM"
ZmId.OP_NEW_TAG					= "NEW_TAG"
ZmId.OP_NEW_TASK				= "NEW_TASK"
ZmId.OP_NEW_TASK_FOLDER			= "NEW_TASK_FOLDER"
ZmId.OP_OPEN_FILE				= "OPEN_FILE"
ZmId.OP_PAGE_BACK				= "PAGE_BACK"
ZmId.OP_PAGE_DBL_BACK			= "PAGE_DBL_BACK"
ZmId.OP_PAGE_DBL_FORW			= "PAGE_DBL_FORW"
ZmId.OP_PAGE_FORWARD			= "PAGE_FORWARD"
ZmId.OP_PAUSE_TOGGLE			= "PAUSE_TOGGLE"
ZmId.OP_PRINT					= "PRINT"
ZmId.OP_PRINT_ADDRBOOK			= "PRINT_ADDRBOOK"
ZmId.OP_PRINT_CONTACT			= "PRINT_CONTACT"
ZmId.OP_REFRESH					= "REFRESH"
ZmId.OP_REMOVE_FILTER_RULE		= "REMOVE_FILTER_RULE"
ZmId.OP_RENAME_FOLDER			= "RENAME_FOLDER"
ZmId.OP_RENAME_SEARCH			= "RENAME_SEARCH"
ZmId.OP_RENAME_TAG				= "RENAME_TAG"
ZmId.OP_REPLY					= "REPLY"
ZmId.OP_REPLY_ACCEPT			= "REPLY_ACCEPT"
ZmId.OP_REPLY_ACCEPT			= "REPLY_ACCEPT"
ZmId.OP_REPLY_ALL				= "REPLY_ALL"
ZmId.OP_REPLY_BY_EMAIL			= "REPLY_BY_EMAIL"
ZmId.OP_REPLY_CANCEL			= "REPLY_CANCEL"
ZmId.OP_REPLY_CANCEL			= "REPLY_CANCEL"
ZmId.OP_REPLY_DECLINE			= "REPLY_DECLINE"
ZmId.OP_REPLY_DECLINE			= "REPLY_DECLINE"
ZmId.OP_REPLY_MENU				= "REPLY_MENU"
ZmId.OP_REPLY_MODIFY			= "REPLY_MODIFY"
ZmId.OP_REPLY_MODIFY			= "REPLY_MODIFY"
ZmId.OP_REPLY_NEW_TIME			= "REPLY_NEW_TIME"
ZmId.OP_REPLY_NEW_TIME			= "REPLY_NEW_TIME"
ZmId.OP_REPLY_TENTATIVE			= "REPLY_TENTATIVE"
ZmId.OP_REPLY_TENTATIVE			= "REPLY_TENTATIVE"
ZmId.OP_REVERT_PAGE				= "REVERT_PAGE"
ZmId.OP_SAVE					= "SAVE"
ZmId.OP_SAVE_DRAFT				= "SAVE_DRAFT"
ZmId.OP_SCHEDULE_VIEW			= "SCHEDULE_VIEW"
ZmId.OP_SEARCH					= "SEARCH"
ZmId.OP_SEARCH_MAIL				= "SEARCH_MAIL"
ZmId.OP_SEND					= "SEND"
ZmId.OP_FREE_BUSY_LINK			= "FREE_BUSY_LINK"
ZmId.OP_SEND_FILE				= "SEND_FILE"
ZmId.OP_SEND_PAGE				= "SEND_PAGE"
ZmId.OP_SHARE					= "SHARE"
ZmId.OP_SHARE_ACCEPT			= "SHARE_ACCEPT"
ZmId.OP_SHARE_ADDRBOOK			= "SHARE_ADDRBOOK"
ZmId.OP_SHARE_BRIEFCASE			= "SHARE_BRIEFCASE"
ZmId.OP_SHARE_CALENDAR			= "SHARE_CALENDAR"
ZmId.OP_SHARE_DECLINE			= "SHARE_DECLINE"
ZmId.OP_SHARE_FOLDER			= "SHARE_FOLDER"
ZmId.OP_SHARE_NOTEBOOK			= "SHARE_NOTEBOOK"
ZmId.OP_SHARE_TASKFOLDER		= "SHARE_TASKFOLDER"
ZmId.OP_SHOW_ALL_ITEM_TYPES		= "SHOW_ALL_ITEM_TYPES"
ZmId.OP_SHOW_BCC				= "SHOW_BCC"
ZmId.OP_SHOW_ONLY_CONTACTS		= "SHOW_ONLY_CONTACTS"
ZmId.OP_SHOW_ONLY_MAIL			= "SHOW_ONLY_MAIL"
ZmId.OP_SHOW_ORIG				= "SHOW_ORIG"
ZmId.OP_SPAM					= "SPAM"
ZmId.OP_SPELL_CHECK				= "SPELL_CHECK"
ZmId.OP_SYNC					= "SYNC"
ZmId.OP_SYNC_ALL				= "SYNC_ALL"
ZmId.OP_SYNC_OFFLINE			= "SYNC_OFFLINE"
ZmId.OP_SYNC_OFFLINE_FOLDER		= "SYNC_OFFLINE_FOLDER"
ZmId.OP_TAG						= "TAG"
ZmId.OP_TAG_COLOR_MENU			= "TAG_COLOR_MENU"
ZmId.OP_TAG_MENU				= "TAG_MENU"
ZmId.OP_TEXT					= "TEXT"
ZmId.OP_TODAY					= "TODAY"
ZmId.OP_UNDELETE				= "UNDELETE"
ZmId.OP_VIEW					= "VIEW"
ZmId.OP_VIEW_APPOINTMENT		= "VIEW_APPOINTMENT"
ZmId.OP_VIEW_APPT_INSTANCE		= "VIEW_APPT_INSTANCE"
ZmId.OP_VIEW_APPT_SERIES		= "VIEW_APPT_SERIES"
ZmId.OP_VIEW_BY_DATE			= "VIEW_BY_DATE"
ZmId.OP_VIEW_FILE_AS_HTML		= "VIEW_FILE_AS_HTML"
ZmId.OP_VIEW_MENU				= "VIEW_MENU"
ZmId.OP_WEEK_VIEW				= "WEEK_VIEW"
ZmId.OP_WORK_WEEK_VIEW			= "WORK_WEEK_VIEW"
ZmId.OP_ZIMLET					= "ZIMLET"
