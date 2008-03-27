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
 * There is a simple naming scheme for the IDs themselves. Each ID has two parts, separated
 * by an underscore ("_"). The first part starts with "z", followed by zero or more lowercase
 * letters that indicate the type of element/widget:
 * 
 * 		z		a component that is not a special-purpose widget
 * 		zv		a view within the content area (eg conv list view)
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
ZmId.CONTACTS_APP			= "zb_contacts";
ZmId.BRIEFCASE_APP			= "zb_briefcase";
ZmId.CALENDAR_APP			= "zb_calendar";
ZmId.IM_APP					= "zb_im";
ZmId.MAIL_APP				= "zb_mail";
ZmId.NOTEBOOK_APP			= "zb_notebook";
ZmId.PORTAL_APP				= "zb_portal";
ZmId.PREFERENCES_APP		= "zb_options";
ZmId.TASKS_APP				= "zb_tasks";
ZmId.VOICE_APP				= "zb_voice";

// content area views and their components
ZmId.CONV_LIST_VIEW			= "zv_convList";		// conv list view
ZmId.CONV_LIST_MSG_VIEW		= "zv_convListMsgView";	// msg view within conv list view
ZmId.MSG_LIST_VIEW			= "zv_msgList";			// msg list view
ZmId.MSG_LIST_MSG_VIEW		= "zv_msgListMsgView";	// msg view within msg list view
ZmId.CONV_MSG_LIST_VIEW		= "zv_convMsgList";		// msg list within conv view
ZmId.CONV_MSG_VIEW			= "zv_convMsgView";		// msg view within conv view
