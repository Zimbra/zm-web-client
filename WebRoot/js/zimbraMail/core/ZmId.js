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
 * This class is a collection of constants for known IDs to use for HTML elements.
 * That way, code outside the client can locate particular elements.
 * 
 * Not every element that has an associated JS object will have a known ID. Those are
 * allocated only for elements it would be useful to locate: major components of the UI,
 * toolbars, buttons, views, menus, some menu items, and some selects.
 * 
 * In general, a getElementById() on any of the non-skin IDs will return a DIV. One exception
 * is input fields. The ID is given to the DwtInputField's actual INPUT, rather than to the
 * DIV that contains it.
 * 
 * There is a simple naming scheme for the IDs themselves. Each ID has two parts, separated
 * by an underscore ("_"). The first part starts with "z", followed by zero or more lowercase
 * letters that indicate the type of element/widget:
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

// containers defined by the skin
ZmId.SKIN_APP_BOTTOM_TOOLBAR		= "skin_container_app_bottom_toolbar";
ZmId.SKIN_APP_CHOOSER				= "skin_container_app_chooser";
ZmId.SKIN_APP_MAIN_FULL				= "skin_container_app_main_full";
ZmId.SKIN_APP_MAIN					= "skin_container_app_main";
ZmId.SKIN_APP_MAIN_ROW_FULL			= "skin_tr_main_full";
ZmId.SKIN_APP_MAIN_ROW				= "skin_tr_main";
ZmId.SKIN_APP_TOP_TOOLBAR			= "skin_container_app_top_toolbar";
ZmId.SKIN_CURRENT_APP				= "skin_container_current_app";
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

// conv list view (CLV)
ZmId.CLV_LIST				= "z_clvListView";		// conv list view
ZmId.CLV_MSG				= "z_clvMsgView";		// msg view within conv list view
ZmId.CLV_TOOLBAR			= "ztb_clv";			// top toolbar within conv list view

// traditional (msg) list view (TV)
ZmId.TV_LIST				= "z_tvListView";		// msg list view
ZmId.TV_MSG					= "z_tvMsgView";		// msg view within msg list view
ZmId.TV_TOOLBAR				= "ztb_tv";				// top toolbar within msg list view

// single conv view (CV)
ZmId.CV_LIST				= "z_cvListView";		// msg list within conv view
ZmId.CV_MSG					= "z_cvMsgView";		// msg view within conv view
ZmId.CV_TOOLBAR				= "ztb_cv";				// top toolbar within conv view

// msg view (MV)
ZmId.MSG_TOOLBAR			= "ztb_msg";

// overviews, trees, and tree items

// main overviews
ZmId.OVERVIEW_MAIL					= "zov_mail";
ZmId.OVERVIEW_CONTACTS				= "zov_contacts";
ZmId.OVERVIEW_CALENDAR				= "zov_calendar";
ZmId.OVERVIEW_NOTEBOOK				= "zov_notebook";
ZmId.OVERVIEW_TASKS					= "zov_tasks";
ZmId.OVERVIEW_BRIEFCASE				= "zov_briefcase";

// trees within the main overviews
ZmId.TREE_MAIL_FOLDER			= "zt_mailFolder";
ZmId.TREE_MAIL_SEARCH			= "zt_mailSearch";
ZmId.TREE_MAIL_TAG				= "zt_mailTag";
ZmId.TREE_MAIL_ZIMLET			= "zt_mailZimlet";

ZmId.TREE_CONTACTS_ADDRBOOK		= "zt_contactsAddrbook";
ZmId.TREE_CONTACTS_SEARCH		= "zt_contactsSearch";
ZmId.TREE_CONTACTS_TAG			= "zt_contactsTag";
ZmId.TREE_CONTACTS_ZIMLET		= "zt_contactsZimlet";

ZmId.TREE_CALENDAR_CALENDAR		= "zt_calendarCalendar";
ZmId.TREE_CALENDAR_SEARCH		= "zt_calendarSearch";
ZmId.TREE_CALENDAR_TAG			= "zt_calendarTag";
ZmId.TREE_CALENDAR_ZIMLET		= "zt_calendarZimlet";

ZmId.TREE_NOTEBOOK_NOTEBOOK		= "zt_notebookNotebook";
ZmId.TREE_NOTEBOOK_TAG			= "zt_notebookTag";
ZmId.TREE_NOTEBOOK_ZIMLET		= "zt_notebookZimlet";

ZmId.TREE_BRIEFCASE_BRIEFCASE	= "zt_briefcaseBriefcase";
ZmId.TREE_BRIEFCASE_TAG			= "zt_briefcaseTag";
ZmId.TREE_BRIEFCASE_ZIMLET		= "zt_briefcaseZimlet";

ZmId.TREE_TASKS_TASKS			= "zt_tasksTasks";
ZmId.TREE_TASKS_SEARCH			= "zt_tasksSearch";
ZmId.TREE_TASKS_TAG				= "zt_tasksTag";
ZmId.TREE_TASKS_ZIMLET			= "zt_tasksZimlet";

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

ZmId._OV_MAIL = "Mail";

// system folder tree items

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


// constants:

// App
// View
// Op
// Overview

//
// constants used in creating IDs
//

// widget types (used to prefix IDs)
ZmId.WIDGET					= "z_";
ZmId.WIDGET_TOOLBAR			= "ztb_";
ZmId.WIDGET_BUTTON			= "zb_";
ZmId.WIDGET_INPUT			= "zi_";
ZmId.WIDGET_MENU			= "zm_";
ZmId.WIDGET_MENU_ITEM		= "zmi_";
ZmId.WIDGET_SELECT			= "zs_";
ZmId.WIDGET_OVERVIEW		= "zov_";
ZmId.WIDGET_TREE			= "zt_";
ZmId.WIDGET_TREE_ITEM		= "zti_";
ZmId.WIDGET_TREE_ITEM_HDR	= "ztih_";

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
