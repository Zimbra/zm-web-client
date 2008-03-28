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
 *
 * The skin defines its own IDs starting with "skin_", which we provide constants for here.
 */
ZmId = function() {}

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
ZmId.CONTACTS_APP		= "zb_contacts";
ZmId.BRIEFCASE_APP		= "zb_briefcase";
ZmId.CALENDAR_APP		= "zb_calendar";
ZmId.IM_APP				= "zb_im";
ZmId.MAIL_APP			= "zb_mail";
ZmId.NOTEBOOK_APP		= "zb_notebook";
ZmId.PORTAL_APP			= "zb_portal";
ZmId.PREFERENCES_APP	= "zb_options";
ZmId.TASKS_APP			= "zb_tasks";
ZmId.VOICE_APP			= "zb_voice";

// content area views and their components
//
// Note that there is a lot of repetition here, since each view has its own toolbar, even
// though it has the same buttons as other toolbars. See bug 26421. If that bug gets fixed
// (it's not certain at this point that it should be), then there would be only one set of
// IDs for the buttons on a mail toolbar (for example, there would be one ID for MAIL_NEW_MENU_BUTTON
// instead of the 4 versions we currently have).

// conv list view (CLV)
ZmId.CLV_LIST				= "z_clvListView";		// conv list view
ZmId.CLV_MSG				= "z_clvMsgView";		// msg view within conv list view
ZmId.CLV_TOOLBAR			= "ztb_clv";
ZmId.CLV_NEW_MENU_BUTTON	= "zb_clvNewMenu";
ZmId.CLV_CHECK_MAIL_BUTTON	= "zb_clvCheckMail";
ZmId.CLV_DELETE_BUTTON		= "zb_clvDelete";
ZmId.CLV_MOVE_BUTTON		= "zb_clvMove";
ZmId.CLV_PRINT_BUTTON		= "zb_clvPrint";
ZmId.CLV_REPLY_BUTTON		= "zb_clvReply";
ZmId.CLV_REPLY_ALL_BUTTON	= "zb_clvReplyAll";
ZmId.CLV_FORWARD_BUTTON		= "zb_clvForward";
ZmId.CLV_EDIT_BUTTON		= "zb_clvEdit";
ZmId.CLV_SPAM_BUTTON		= "zb_clvSpam";
ZmId.CLV_TAG_MENU_BUTTON	= "zb_clvTag";
ZmId.CLV_DETACH_BUTTON		= "zb_clvDetach";
ZmId.CLV_VIEW_MENU_BUTTON	= "zb_clvView";

ZmId.CLV_INV_REPLY_ACCEPT_BUTTON	= "zb_clvInvAccept";
ZmId.CLV_INV_REPLY_TENTATIVE_BUTTON	= "zb_clvInvTentative";
ZmId.CLV_INV_REPLY_DECLINE_BUTTON	= "zb_clvInvDecline";

// traditional (msg) list view (TV)
ZmId.TV_LIST				= "z_tvListView";		// msg list view
ZmId.TV_MSG					= "z_tvMsgView";		// msg view within msg list view
ZmId.TV_TOOLBAR				= "ztb_tv";
ZmId.TV_NEW_MENU_BUTTON		= "zb_tvNewMenu";
ZmId.TV_CHECK_MAIL_BUTTON	= "zb_tvCheckMail";
ZmId.TV_DELETE_BUTTON		= "zb_tvDelete";
ZmId.TV_MOVE_BUTTON			= "zb_tvMove";
ZmId.TV_PRINT_BUTTON		= "zb_tvPrint";
ZmId.TV_REPLY_BUTTON		= "zb_tvReply";
ZmId.TV_REPLY_ALL_BUTTON	= "zb_tvReplyAll";
ZmId.TV_FORWARD_BUTTON		= "zb_tvForward";
ZmId.TV_EDIT_BUTTON			= "zb_tvEdit";
ZmId.TV_SPAM_BUTTON			= "zb_tvSpam";
ZmId.TV_TAG_MENU_BUTTON		= "zb_tvTag";
ZmId.TV_DETACH_BUTTON		= "zb_tvDetach";
ZmId.TV_VIEW_MENU_BUTTON	= "zb_tvView";

ZmId.TV_INV_REPLY_ACCEPT_BUTTON		= "zb_tvInvAccept";
ZmId.TV_INV_REPLY_TENTATIVE_BUTTON	= "zb_tvInvTentative";
ZmId.TV_INV_REPLY_DECLINE_BUTTON	= "zb_tvInvDecline";

// single conv view (CV)
ZmId.CV_LIST				= "z_cvListView";		// msg list within conv view
ZmId.CV_MSG					= "z_cvMsgView";		// msg view within conv view
ZmId.CV_TOOLBAR				= "ztb_cv";
ZmId.CV_NEW_MENU_BUTTON		= "zb_cvNewMenu";
ZmId.CV_CHECK_MAIL_BUTTON	= "zb_cvCheckMail";
ZmId.CV_DELETE_BUTTON		= "zb_cvDelete";
ZmId.CV_MOVE_BUTTON			= "zb_cvMove";
ZmId.CV_PRINT_BUTTON		= "zb_cvPrint";
ZmId.CV_REPLY_BUTTON		= "zb_cvReply";
ZmId.CV_REPLY_ALL_BUTTON	= "zb_cvReplyAll";
ZmId.CV_FORWARD_BUTTON		= "zb_cvForward";
ZmId.CV_EDIT_BUTTON			= "zb_cvEdit";
ZmId.CV_SPAM_BUTTON			= "zb_cvSpam";
ZmId.CV_TAG_MENU_BUTTON		= "zb_cvTag";
ZmId.CV_DETACH_BUTTON		= "zb_cvDetach";
ZmId.CV_VIEW_MENU_BUTTON	= "zb_cvView";

ZmId.CV_INV_REPLY_ACCEPT_BUTTON		= "zb_cvInvAccept";
ZmId.CV_INV_REPLY_TENTATIVE_BUTTON	= "zb_cvInvTentative";
ZmId.CV_INV_REPLY_DECLINE_BUTTON	= "zb_cvInvDecline";

ZmId.MSG_TOOLBAR			= "ztb_msg";
ZmId.MSG_NEW_MENU_BUTTON	= "zb_msgNewMenu";
ZmId.MSG_CHECK_MAIL_BUTTON	= "zb_msgCheckMail";
ZmId.MSG_DELETE_BUTTON		= "zb_msgDelete";
ZmId.MSG_MOVE_BUTTON		= "zb_msgMove";
ZmId.MSG_PRINT_BUTTON		= "zb_msgPrint";
ZmId.MSG_REPLY_BUTTON		= "zb_msgReply";
ZmId.MSG_REPLY_ALL_BUTTON	= "zb_msgReplyAll";
ZmId.MSG_FORWARD_BUTTON		= "zb_msgForward";
ZmId.MSG_EDIT_BUTTON		= "zb_msgEdit";
ZmId.MSG_SPAM_BUTTON		= "zb_msgSpam";
ZmId.MSG_TAG_MENU_BUTTON	= "zb_msgTag";
ZmId.MSG_DETACH_BUTTON		= "zb_msgDetach";
ZmId.MSG_VIEW_MENU_BUTTON	= "zb_msgView";

ZmId.MSG_INV_REPLY_ACCEPT_BUTTON	= "zb_msgInvAccept";
ZmId.MSG_INV_REPLY_TENTATIVE_BUTTON	= "zb_msgInvTentative";
ZmId.MSG_INV_REPLY_DECLINE_BUTTON	= "zb_msgInvDecline";

ZmId.COMPOSE_SEND_BUTTON			= "zb_compSend";
ZmId.COMPOSE_CANCEL_BUTTON			= "zb_compCancel";
ZmId.COMPOSE_SAVE_DRAFT_BUTTON		= "zb_compSave";
ZmId.COMPOSE_ATTACHMENT_BUTTON		= "zb_compAtt";
ZmId.COMPOSE_SPELL_CHECK_BUTTON		= "zb_compSpell";
ZmId.COMPOSE_ADD_SIGNATURE_BUTTON	= "zb_compAddSig";
ZmId.COMPOSE_COMPOSE_OPTIONS_BUTTON	= "zb_compOptions";
ZmId.COMPOSE_DETACH_COMPOSE_BUTTON	= "zb_compDetach";

ZmId.PREF_SAVE_BUTTON				= "zb_prefSave";
ZmId.PREF_CANCEL_BUTTON				= "zb_prefCancel";

