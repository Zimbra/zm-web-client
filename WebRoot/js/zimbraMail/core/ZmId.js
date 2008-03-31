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

// constants used in creating IDs

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

// toolbars
ZmId.TB_INV	= "INV";
ZmId.TB_NAV	= "NAV";

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

/**
 * Generates the ID for a button in the app chooser.
 * 
 * Example: zb_mail
 * 
 * @param app	[const]		app
 */
ZmId.getAppChooserButtonId =
function(app) {
	return ["zb_", app.toLowerCase()].join("");
};

// content area views and their components

/**
 * Generates the ID for a button in a toolbar. Intended for use with the top toolbar, nav toolbar,
 * and invite toolbar.
 * 
 * Examples: zb_clvCheckMail zb_tvReply zb_composeSend zb_clvNavPageForward zb_clvInvReplyAccept
 * 
 * @param tbId		[string]	string that uniquely identifies toolbar (eg ID of owning view)
 * @param op		[const]		the button operation
 * @param tbType	[const]*	type of toolbar (eg invite or nav)
 */
ZmId.getToolbarButtonId =
function(tbId, op, tbType) {
	tbId = tbType ? [tbId, tbType].join("_") : tbId;
	return ["zb_", AjxStringUtil.toMixed(tbId, "_", true), AjxStringUtil.toMixed(op, "_")].join("");
};

// conv list view (CLV)
ZmId.CLV_LIST				= "z_clvListView";		// conv list view
ZmId.CLV_MSG				= "z_clvMsgView";		// msg view within conv list view
ZmId.CLV_TOOLBAR			= "ztb_clv";

// traditional (msg) list view (TV)
ZmId.TV_LIST				= "z_tvListView";		// msg list view
ZmId.TV_MSG					= "z_tvMsgView";		// msg view within msg list view
ZmId.TV_TOOLBAR				= "ztb_tv";

// single conv view (CV)
ZmId.CV_LIST				= "z_cvListView";		// msg list within conv view
ZmId.CV_MSG					= "z_cvMsgView";		// msg view within conv view
ZmId.CV_TOOLBAR				= "ztb_cv";

// msg view (MV)
ZmId.MSG_TOOLBAR			= "ztb_msg";

ZmId.PREF_SAVE_BUTTON				= "zb_prefSave";
ZmId.PREF_CANCEL_BUTTON				= "zb_prefCancel";

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
		return ["ztih_", overviewId.toLowerCase(), "_", type.toLowerCase()].join("");
	} else {
		if (organizerId < 64) {
			var idKey = ["TREEITEM", overviewId, ZmFolder.QUERY_NAME[organizerId]].join("_").toUpperCase();
			if (ZmId[idKey]) {
				return ZmId[idKey];
			}
		}
		return ["zti_", overviewId.toLowerCase(), "_", organizerId].join("");
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

