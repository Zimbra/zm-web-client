/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file contains ids.
 * 
 */

/**
 * Constructor
 * @class
 * This class is responsible for providing unique, predictable IDs for HTML elements.
 * That way, code outside the client can easily locate particular elements.
 * <br/>
 * <br/>
 * Not every element that has an associated JS object will have a known ID. Those are
 * allocated only for elements it would be useful to locate: major components of the UI,
 * toolbars, buttons, views, menus, some menu items, some selects, and miscellaneous other
 * components.
 * <br/>
 * <br/>
 * Unless noted otherwise, a getElementById() on any of the non-skin IDs will return a DIV. One exception
 * is input fields. The ID is given to the DwtInputField's actual INPUT, rather than to the
 * DIV that contains it. Most other exceptions are table-related: TABLE, TR, and TD.
 * <br/>
 * <br/>
 * There is a simple naming scheme for the IDs themselves. Each ID starts with a "z" followed
 * by one to a few letters that indicate the type of object (widget) represented by the element:
 * 
 * <ul>
 * <li><b>z</b> a component that is not a special-purpose widget listed below</li>
 * <li><b>ztb</b> 		a toolbar (see {@link ZmId.WIDGET})</li>
 * <li><b>zb</b> 		a button (see {@link ZmId.WIDGET_TOOLBAR})</li>
 * <li><b>zi</b> 		an input field (see {@link ZmId.WIDGET_INPUT})</li>
 * <li><b>zm</b> 		a menu (see {@link ZmId.WIDGET_MENU})</li>
 * <li><b>zmi</b> 		a menu item (see {@link ZmId.WIDGET_MENU_ITEM})</li>
 * <li><b>zs</b> 		a select (see {@link ZmId.WIDGET_SELECT})</li>
 * <li><b>zov</b> 		an overview (see {@link ZmId.WIDGET_OVERVIEW})</li>
 * <li><b>zt</b> 		a tree (see {@link ZmId.WIDGET_TREE})</li>
 * <li><b>zti</b> 		a tree item (see {@link ZmId.WIDGET_TREE_ITEM})</li>
 * <li><b>ztih</b> 	a tree item header (see {@link ZmId.WIDGET_TREE_ITEM_HDR})</li>
 *</ul>
 *
 * The skin defines its own container IDs starting with "skin_", which we provide constants for here.
 * 
 * @author Conrad Damon
 */
ZmId = function() {};

//
// Element IDs, and functions to generate them
//

// widget types (used to prefix IDs)
// TODO: move most of these to DwtId
ZmId.WIDGET					= "z";			// generic element
ZmId.WIDGET_VIEW			= "zv";			// view within content area
ZmId.WIDGET_TOOLBAR			= "ztb";		// toolbar
ZmId.WIDGET_BUTTON			= "zb";			// button
ZmId.WIDGET_INPUT			= "zi";			// text input or textarea
ZmId.WIDGET_MENU			= "zm";			// menu
ZmId.WIDGET_MENU_ITEM		= "zmi";		// menu item
ZmId.WIDGET_SELECT			= "zs";			// dropdown select
ZmId.WIDGET_OVERVIEW_CNTR	= "zovc";		// collection of overviews
ZmId.WIDGET_OVERVIEW		= "zov";		// collection of tree views
ZmId.WIDGET_TREE			= "zt";			// tree view
ZmId.WIDGET_TREE_ITEM_HDR	= "ztih";		// root tree item
ZmId.WIDGET_TREE_ITEM		= "zti";		// tree item (node)
ZmId.WIDGET_TAB				= "ztab";		// tab button
ZmId.WIDGET_AUTOCOMPLETE	= "zac";		// autocomplete list
ZmId.WIDGET_CHECKBOX		= "zcb";		// checkbox
ZmId.WIDGET_COMBOBOX		= "zcombo";		// combo box
ZmId.WIDGET_CHOOSER			= "zchooser";	// folder chooser
ZmId.WIDGET_CALENDAR		= "zcal";		// popup calendar

//
// Preset IDs
//

/*
 * Container IDs defined by the skin.
 * 
 * These must match what's in skin.html. They are used by ZmAppViewMgr to visually
 * match components to the containers in which they should be positioned. 
 */
ZmId.SKIN_APP_BOTTOM_TOOLBAR		= "skin_container_app_bottom_toolbar";
ZmId.SKIN_APP_CHOOSER				= "skin_container_app_chooser";
ZmId.SKIN_APP_MAIN_FULL				= "skin_container_app_main_full";
ZmId.SKIN_APP_MAIN					= "skin_container_app_main";
ZmId.SKIN_APP_MAIN_ROW_FULL			= "skin_tr_main_full";
ZmId.SKIN_APP_MAIN_ROW				= "skin_tr_main";
ZmId.SKIN_APP_TOP_TOOLBAR			= "skin_container_app_top_toolbar";
ZmId.SKIN_APP_NEW_BUTTON			= "skin_container_app_new_button"; 
ZmId.SKIN_LINKS						= "skin_container_links";
ZmId.SKIN_LOGO						= "skin_container_logo";
ZmId.SKIN_QUOTA_INFO				= "skin_container_quota";
ZmId.SKIN_SASH						= "skin_container_tree_app_sash";
ZmId.SKIN_SEARCH_BUILDER			= "skin_container_search_builder";
ZmId.SKIN_SEARCH_BUILDER_TOOLBAR	= "skin_container_search_builder_toolbar";
ZmId.SKIN_SEARCH_BUILDER_TR			= "skin_tr_search_builder";
ZmId.SKIN_SEARCH					= "skin_container_search";
ZmId.SKIN_SEARCH_RESULTS_TOOLBAR	= "skin_container_search_results_toolbar";
ZmId.SKIN_REFRESH					= "skin_container_refresh";
ZmId.SKIN_OFFLINE_STATUS			= "skin_container_offline";
ZmId.SKIN_SHELL						= "skin_outer";
ZmId.SKIN_SPACING_SEARCH			= "skin_spacing_search";
ZmId.SKIN_SPLASH_SCREEN				= "skin_container_splash_screen";
ZmId.SKIN_STATUS					= "skin_container_status";
ZmId.SKIN_STATUS_ROW				= "skin_tr_status";
ZmId.SKIN_TREE_FOOTER				= "skin_container_tree_footer";
ZmId.SKIN_TREE						= "skin_container_tree";
ZmId.SKIN_USER_INFO					= "skin_container_username";
ZmId.SKIN_FOOTER					= "skin_footer";
ZmId.SKIN_AD						= "skin_adsrvc";
ZmId.SKIN_UNITTEST					= "skin_unittest";

//
// Literal IDs
//

/*
 * Top-level components. These are elements that are placed directly into skin containers.
 */
ZmId.SHELL					= "z_shell";			// the main shell
ZmId.LOADING_VIEW			= "z_loading";			// "Loading..." view
ZmId.MAIN_SASH				= "z_sash";				// sash between overview and content
ZmId.BANNER					= "z_banner";			// logo (at upper left by default)
ZmId.SEARCH_TOOLBAR			= "ztb_search";			// search toolbar
ZmId.SEARCHRESULTS_TOOLBAR	= "ztb_searchresults";	// search results toolbar
ZmId.SEARCHRESULTS_PANEL	= "z_filterPanel";		// search results filter panel
ZmId.USER_NAME				= "z_userName";			// account name
ZmId.USER_QUOTA				= "z_userQuota";		// quota
ZmId.PRESENCE				= "z_presence";			// presence
ZmId.NEW_FOLDER_BUTTON		= "zb_newFolder";		// New Folder button on current app toolbar
ZmId.STATUS_VIEW			= "z_status";			// status view (shows toast)
ZmId.TOAST					= "z_toast";			// toast
ZmId.APP_CHOOSER			= "ztb_appChooser";		// app chooser toolbar

//
// Functions for generating IDs
//
// In general, an ID created by one of these functions will consist of several fields joined
// together by a "|" character. The first field indicates the type of element/widget, and will
// be one of the ZmId.WIDGET_* constants. The remaining fields are there to ensure that the ID
// is unique.

/**
 * Generates the ID for a toolbar.
 * 
 * <p>
 * Examples: <code>ztb|CLV ztb|TV|Nav ztb|CV|Inv</code>
 * </p>
 * 
 * @param {String}	context		the toolbar context (ID of owning view)
 * @param {constant}	tbType	the type of toolbar (for example, invite or nav)
 * @return	{String}	the id
 */
ZmId.getToolbarId =
function(context, tbType) {
	return DwtId.makeId(ZmId.WIDGET_TOOLBAR, context, tbType);
};

// special toolbars
ZmId.TB_INVITE	= "Inv";
ZmId.TB_COUNTER	= "Cou";
ZmId.TB_NAV		= "Nav";
ZmId.TB_SHARE	= "Shr";
ZmId.TB_REPLY	= "Rep";
ZmId.TB_SUBSCRIBE = "Sub";

/**
 * Generates the ID for a button. Intended for use with the top toolbar, nav toolbar,
 * and invite toolbar.
 * 
 * <p>
 * Examples: <code>zb|CLV|CHECK_MAIL zb|TV|REPLY zb|COMPOSE|SEND zb|CLV|Nav|PAGE_FORWARD</code>
 * </p>
 * 
 * @param {String}	context	the toolbar context (ID of owning view)
 * @param {constant}	op	the button operation
 * @param {constant}	tbType	the type of toolbar (eg invite or nav)
 * @return	{String}	the id
 */
ZmId.getButtonId =
function(context, op, tbType) {
	return DwtId.makeId(ZmId.WIDGET_BUTTON, context, tbType, op);
};

/**
 * Generates the ID for an action menu.
 * 
 * <p>
 * Examples: <code>zm|CLV zm|Contacts zm|TV|Par</code>
 * </p>
 * 
 * @param {String}	context		the menu context (eg ID of owning view, or app)
 * @param {constant}	menuType		the type of menu (eg participant)
 * @return	{String}	the id
 */
ZmId.getMenuId =
function(context, menuType) {
	return DwtId.makeId(ZmId.WIDGET_MENU, context, menuType);
};

// special menus
ZmId.MENU_PARTICIPANT	= "Par";
ZmId.MENU_DRAFTS		= "Dra";

/**
 * Generates the ID for a menu item in an action menu.
 * 
 * <p>
 * Examples: <code>zmi|CLV|REPLY_ALL zmi|TV|Par|SEARCH</code>
 * </p>
 * 
 * @param {String}	context		the menu context
 * @param {constant}	op			the menu operation
 * @param {constant}	menuType		the type of menu (eg participant)
 * @return	{String}	the id
 */
ZmId.getMenuItemId =
function(context, op, menuType) {
	return DwtId.makeId(ZmId.WIDGET_MENU_ITEM, context, menuType, op);
};

/**
 * Generates the ID for an overview container.
 *
 * @param {String}	overviewContainerId		the overview container ID
 * @return	{String}	the id
 */
ZmId.getOverviewContainerId =
function(overviewContainerId) {
	return DwtId.makeId(ZmId.WIDGET_OVERVIEW_CNTR, overviewContainerId);
};

/**
 * Generates the ID for an overview.
 * 
 * <p>
 * Examples: <code>zov|Mail zov|ZmChooseFolderDialog-ZmListController zov|ZmPickTagDialog</code>
 * </p>
 * 
 * @param {String}	overviewId	the overview ID
 * @return	{String}	the id
 */
ZmId.getOverviewId =
function(overviewId) {
	return DwtId.makeId(ZmId.WIDGET_OVERVIEW, overviewId);
};

/**
 * Generates the ID for a tree within an overview.
 * 
 * <p>
 * Examples: <code>zt|Mail|FOLDER zt|ZmPickTagDialog|TAG</code>
 * </p>
 * 
 * @param {String}	overviewId	the overview ID
 * @param {String}	orgType 		the organizer type (see <code>ZmId.ORG_</code> constants)
 * @return	{String}	the id
 */
ZmId.getTreeId =
function(overviewId, orgType) {
	return DwtId.makeId(ZmId.WIDGET_TREE, overviewId, orgType);
};

/**
 * Generates a tree item ID based on the underlying organizer and the overview ID (since the same
 * organizer may be represented as tree items in more than one overview). Some sample IDs:
 * 
 * <ul>
 * <li><b>zti|Mail|2</b> Inbox</li>
 * <li><b>zti|Mail|172</b>			user-created item in mail overview</li>
 * <li><b>zti|Contacts|7</b>			system Contacts folder</li>
 * <li><b>zti|Calendar|304</b>		user-created item in calendar overview</li>
 * <li><b>ztih|Mail|FOLDER</b>		Folders header in mail overview</li>
 * </ul>
 * 
 * Constants for some system folder tree items have been provided as a convenience.
 * 
 * @param {String}	overviewId	the unique ID for overview
 * @param {ZmOrganizer}	organizerId	the ID of the data object backing tree item
 * @param {constant}	type			the organizer type (for headers only)
 * @return	{String}	the id
 */
ZmId.getTreeItemId =
function(overviewId, organizerId, type) {
	if (!organizerId && !type) { return; }
	if (type) {
		return DwtId.makeId(ZmId.WIDGET_TREE_ITEM_HDR, overviewId, type);
	} else {
		return DwtId.makeId(ZmId.WIDGET_TREE_ITEM, overviewId, organizerId);
	}
};

/**
 * Generates an ID for a view that fills the content area, or for a component of that
 * view. A context should be provided if the view is not a singleton (for example,
 * message view may appear within several double-pane views). The component name
 * is not joined with the "|" character in order to preserve backward compatibility.
 * 
 * <p>
 * Examples: <code>zv|COMPOSE zv|TV zv|TV|MSG zv|TV|MSG_hdrTable</code>
 * </p>
 * 
 * @param {constant}	viewId		the view identifier (see <code>ZmId.VIEW_</code> constants)
 * @param {constant}	component	the component identifier (see <code>ZmId.MV_</code> constants)
 * @param {constant}	context		the ID of owning view
 * @return	{String}	the id
 */
ZmId.getViewId =
function(viewId, component, context) {
	var id = DwtId.makeId(ZmId.WIDGET_VIEW, context, viewId);
	return component ? [id, component].join("") : id;
};

/**
 * Generates an ID for the compose view, or for a component within the compose view. Since
 * only one compose view is created, there is no need for a context to make the ID unique.
 * The component name is not joined with the "|" character for backward compatibility.
 * 
 * <p>
 * Examples: <code>z|ComposeView z|ComposeView_header z|ComposeView_to_row</code>
 * </p>
 * 
 * @param {constant}	component		component identifier (see <code>ZmId.CMP_</code> constants)
 * @return	{String}	the id
 */
ZmId.getComposeViewId =
function(component) {
	var id = DwtId.makeId(ZmId.WIDGET, ZmId.COMPOSE_VIEW);
	return component ? [id, component].join("") : id;
};

/**
 * Generates an ID for a tab (actually the tab button in the tab bar).
 * 
 * <p>
 * Tab contexts and names:
 * 
 * <ul>
 * <li><b>VIEW_PREF</b>			General, Mail, Composing, Signatures, Address Book,
 * 							Accounts, Mail Filters, Calendar, Shortcuts</li>
 * <li><b>VIEW_CONTACT</b>		personal, work, home, other, notes</li>
 * <li><b>VIEW_APPOINTMENT</b>	details, schedule, attendees, locations, equipment</li>
 * <li><b>VIEW_SHORTCUTS</b>		list, {@link ZmId.ORG_FOLDER}, {@link ZmId.ORG_SEARCH}, {@link ZmId.ORG_TAG}</li>
 * </ul>
 * </p>
 * 
 * @param {constant}	context		the owning view identifier (see <code>ZmId.VIEW_</code> constants)
 * @param {String}	tabName		[string]		name of tab
 * @return	{String}	the id
 */
ZmId.getTabId =
function(context, tabName) {
	return DwtId.makeId(ZmId.WIDGET_TAB, context, tabName);
};

/**
 * Generates an ID for a pref page tab.
 *
 * @param	{String}	tabKey		the tab key
 * @return	{String}	the id
 */
ZmId.getPrefPageId = function(tabKey) {
	return "PREF_PAGE_"+tabKey;
};

/*
 * 
 * Gettings IDs for different areas of ZCS
 * 
 */

/*
 * ------------
 * Search Panel
 * ------------
 * 
 * The input box in the search panel has a literal ID. To get the IDs for buttons, menus,
 * and menu items in the search panel, use the functions above.
 * 
 * Buttons:
 * 
 * Pass the context and one of the button constants below:
 * 
 * 		ZmId.getButtonId(ZmId.SEARCH, ZmId.SEARCH_SAVE)
 * 
 * Menus:
 * 
 * There is only one search menu in the panel. Pass the context to get its ID:
 * 
 * 		ZmId.getMenuId(ZmId.SEARCH)
 * 
 * Menu items:
 * 
 * If the search type has a one-to-one mapping with an item type, use the
 * item type constant ZmId.ITEM_* (currently true for contact, appointment, page, and task).
 * Otherwise, pass one of the menu item constants below as the operation:
 * 
 * 		ZmId.getMenuItemId(ZmId.SEARCH, ZmId.ITEM_CONTACT)
 * 		ZmId.getMenuItemId(ZmId.SEARCH, ZmId.SEARCH_SHARED)
 */
 
ZmId.SEARCH_INPUT			= "zi_search";			// text input in search toolbar
ZmId.SEARCH_INPUTFIELD      = ZmId.SEARCH_INPUT + "_inputfield";

// context
ZmId.SEARCH					= "Search";				// element is within search panel

// button, menu item
ZmId.SEARCH_CUSTOM			= "CUSTOM";				// custom search type or button

// button
ZmId.SEARCH_MENU			= "MENU";				// button with dropdown type menu
ZmId.SEARCH_SEARCH			= "SEARCH";				// perform a search
ZmId.SEARCH_SAVE			= "SAVE";				// save a search
ZmId.SEARCH_ADVANCED		= "ADV";				// open/close the search builder
ZmId.SEARCH_LOCAL			= "LOCAL";				// added by the "local" zimlet

// menu item (also see ZmId.ITEM_*)
ZmId.SEARCH_ALL_ACCOUNTS	= "ALL_ACCOUNTS";		// all accounts
ZmId.SEARCH_GAL				= "GAL";				// GAL contacts
ZmId.SEARCH_MAIL			= "MAIL";				// mail items
ZmId.SEARCH_SHARED			= "SHARED";				// include shared items

/*
 * ----------------------
 * Search Results Toolbar
 * ----------------------
 * 
 * This toolbar appears at the top of the search results tab.
 */

ZmId.SEARCHRESULTS_INPUT		= "zi_searchresults";			// text input in search toolbar
ZmId.SEARCHRESULTS_INPUTFIELD	= ZmId.SEARCHRESULTS_INPUT + "_inputfield";

// context
ZmId.SEARCHRESULTS				= "SearchResults";				// element is within search panel

// button
ZmId.SEARCHRESULTS_SEARCH		= "SEARCH";				// perform a search
ZmId.SEARCHRESULTS_SAVE			= "SAVE";				// save a search

/*
 * -----------
 * App toolbar
 * -----------
 * 
 * Also known as the app chooser, the app toolbar contains a button that launches each app.
 * 
 * Buttons:
 * 
 * To get the ID for an app button, pass the app context and an app ID (ZmId.APP_*):
 * 
 * 		ZmId.getButtonId(ZmId.APP, ZmId.APP_MAIL)
 */

// context
ZmId.APP	= "App";

/*
 * ---------
 * Overviews
 * ---------
 * 
 * An overview is a collection of trees. The primary place that the user will see an overview is
 * at the left side of the client. Note that each app has its own overview, since it may want to
 * show a different set of trees. For example, the mail app shows trees for folders, searches, tags,
 * and zimlets by default. Overviews also appear when the user needs to choose something from a tree,
 * for example selecting a folder within a move dialog when moving a message.
 * 
 * A tree is a collection of tree items, each of which may have its own tree items.
 * 
 * The overview IDs for the main overviews that show up at the left are just app names (ZmId.APP_*).
 * The overview IDs elsewhere are more complicated, since they need to be unique for each overview.
 * 
 * Examples: zov|Mail zov|ZmChooseFolderDialog-ZmListController zov|ZmPickTagDialog
 * 
 * Overviews:
 * 
 * 		ZmId.getOverviewId(ZmId.APP_MAIL)
 * 
 * Trees:
 * 
 * 		ZmId.getTreeId(ZmId.APP_MAIL, ZmId.ORG_FOLDER)
 * 
 * Tree items:
 * 
 * 		ZmId.getTreeItemId(ZmId.APP_MAIL, ZmFolder.ID_INBOX)
 * 		ZmId.getTreeItemId(ZmId.APP_MAIL, 2)
 * 		ZmId.TREEITEM_INBOX
 * 
 * TODO: come up with simpler names for other (non-app) overviews
 */

// convenience IDs for system folder tree items
ZmId.TREEITEM_INBOX					= "zti|Mail|2";
ZmId.TREEITEM_JUNK					= "zti|Mail|4";
ZmId.TREEITEM_SENT					= "zti|Mail|5";
ZmId.TREEITEM_DRAFTS				= "zti|Mail|6";
ZmId.TREEITEM_TRASH_MAIL			= "zti|Mail|3";
ZmId.TREEITEM_TRASH_CONTACTS		= "zti|Contacts|3";
ZmId.TREEITEM_CONTACTS				= "zti|Contacts|7";
ZmId.TREEITEM_CALENDAR				= "zti|Calendar|10";
ZmId.TREEITEM_TASKS					= "zti|Tasks|15";
ZmId.TREEITEM_BRIEFCASE				= "zti|Briefcase|16";

/*
 * -----------
 * Top toolbar
 * -----------
 * 
 * To get the ID for the toolbar itself, pass the context (owning view):
 * 
 * 		ZmId.getToolbarId(ZmId.VIEW_TRAD)
 * 
 * Nav toolbar:
 * 
 * 		ZmId.getToolbarId(ZmId.VIEW_TRAD, ZmId.TB_NAV)
 * 
 * Buttons:
 * 
 * 		ZmId.getButtonId(ZmId.VIEW_TRAD, ZmId.OP_CHECK_MAIL)
 * 		ZmId.getButtonId(ZmId.VIEW_TRAD, ZmId.OP_PAGE_FORWARD, ZmId.TB_NAV)
 */

/*
 * -----
 * Views
 * -----
 * 
 * A view is typically a high-level element that occupies the content area. Examples include conversation
 * list view, compose view, and preferences view.
 * 
 * To get the ID for a view, pass the constant for that view:
 * 
 * 		ZmId.getViewId(ZmId.VIEW_CONVLIST)
 */

/*
 * ------------
 * Message view
 * ------------
 * 
 * A message view displays an email message. There are several different instances of message views, which
 * makes it necessary to include a context (owning view) to be able to identify each one of them.
 * 
 * The function to use is:
 * 
 * 		ZmId.getViewId(ZmId.VIEW_MSG, component, context)
 * 
 * Since message views are not singletons, a context is always necessary. Omit the component only when getting
 * an ID for a message view itself.
 * 
 * To get the ID for a message view, pass the constant for the message view as well as the context, which can be
 * ZmId.VIEW_CONVLIST, ZmId.VIEW_CONV, ZmId.VIEW_MSG, or ZmId.VIEW_TRAD:
 * 
 * 		ZmId.getViewId(ZmId.VIEW_MSG, null, ZmId.VIEW_TRAD)
 * 
 * There are also many components within a message view which are useful to retrieve. To get the ID for a
 * message view component, pass the component ID (ZmId.MV_*):
 * 
 * 		ZmId.getViewId(ZmId.VIEW_MSG, ZmId.MV_HDR_TABLE_TOP_ROW, ZmId.VIEW_TRAD)
 * 		ZmId.getViewId(ZmId.VIEW_MSG, ZmId.MV_ATT_LINKS, ZmId.VIEW_TRAD)
 * 
 * 		var bodyId = ZmId.getViewId(ZmId.VIEW_MSG, ZmId.MV_MSG_BODY, ZmId.VIEW_TRAD)
 * 
 * will return the ID for the DIV containing the msg body iframe. To get the ID of the IFRAME element
 * itself, pass that ID as the context for the IFRAME:
 * 
 * 		var iframeId = DwtId.getIframeId(bodyId);
 * 
 * For buttons within msg view, pass the context and operation as usual, and add the identifier for
 * message view (which distinguishes its buttons from, say, those on the VIEW_TRAD toolbar).
 * 
 * 		ZmId.getButtonId(ZmId.VIEW_MSG, ZmId.OP_CLOSE, ZmId.VIEW_CONV)
 * 		ZmId.getButtonId(ZmId.VIEW_MSG, ZmId.OP_EXPAND, ZmId.VIEW_TRAD)
 */

// components that are part of the template
ZmId.MV_HDR_TABLE			= "_hdrTable";			// TABLE that holds header elements
ZmId.MV_HDR_TABLE_TOP_ROW	= "_hdrTableTopRow";	// first TR in header table
ZmId.MV_REPORT_BTN_CELL		= "_reportBtnCell";		// TD that holds Report button (sync failure msg)
ZmId.MV_EXPAND_ROW			= "_expandRow";			// TR that holds expandable headers
ZmId.MV_EXPAND_HDR			= "_expandHeader";		// TD that holds expand button
ZmId.MV_ATT_LINKS			= "_attLinks";			// DIV that holds attachment-related links
ZmId.MV_CONTACT_AREA		= "_contactArea";		// DIV for optional contact actions

// other components
ZmId.MV_HIGHLIGHT_OBJ		= "_highlightObjects";
ZmId.MV_DISPLAY_IMAGES		= "_displayImages";		// DIV with link for showing external images
ZmId.MV_MSG_TRUNC			= "_msgTruncation";		// DIV with link for showing entire msg
ZmId.MV_INFO_BAR			= "_infoBar";			// DIV that is placeholder for optional links above
ZmId.MV_TAG_ROW				= "_tagRow";			// TR for tags
ZmId.MV_TAG_CELL			= "_tagCell";			// TD for tags
ZmId.MV_MSG_BODY			= "_body";				// DIV that contains content iframe
ZmId.MV_MSG_HEADER			= "_header";			// DIV that contains header (conv 2.0 msg capsule view)
ZmId.MV_MSG_FOOTER			= "_footer";			// DIV that contains footer (conv 2.0 msg capsule view)

ZmId.MV_PRIORITY			= "_msgPriority";


/*
 * ------------
 * Compose view
 * ------------
 * 
 * Compose is used to create an email message - a reply, a forward, or a new message.
 * 
 * The function to use is:
 * 
 * 		ZmId.getViewId(ZmId.VIEW_COMPOSE, component)
 * 
 * To get the ID for the compose view:
 * 
 * 		ZmId.getViewId(ZmId.VIEW_COMPOSE)
 * 
 * There are also many components within the compose view which are useful to retrieve. To get the ID for a
 * compose view component, pass the component ID (ZmId.CMP_*):
 * 
 * 		ZmId.getViewId(ZmId.VIEW_COMPOSE, ZmId.CMP_HEADER)
 * 		ZmId.getViewId(ZmId.VIEW_COMPOSE, ZmId.CMP_CC_ROW)
 * 
 * To get the ID of one of the address field buttons, provide the operation:
 * 
 * 		ZmId.getButtonId(ZmId.VIEW_COMPOSE, ZmId.CMP_TO)
 * 
 * To get the ID of the Priority button:
 * 
 * 		ZmId.getButtonId(ZmId.VIEW_COMPOSE, ZmId.CMP_PRIORITY)
 */

// components from the template
ZmId.CMP_HEADER				= "_header";
ZmId.CMP_FROM_SELECT		= "_from_select";
ZmId.CMP_TO_ROW				= "_to_row";
ZmId.CMP_TO_PICKER			= "_to_picker";
ZmId.CMP_TO_INPUT			= "_to_control";
ZmId.CMP_CC_ROW				= "_cc_row";
ZmId.CMP_CC_PICKER			= "_cc_picker";
ZmId.CMP_CC_INPUT			= "_cc_control";
ZmId.CMP_BCC_ROW			= "_bcc_row";
ZmId.CMP_BCC_PICKER			= "_bcc_picker";
ZmId.CMP_BCC_INPUT			= "_bcc_control";
ZmId.CMP_OBO_CHECKBOX		= "_obo_checkbox";
ZmId.CMP_OBO_LABEL			= "_obo_label";
ZmId.CMP_OBO_ROW			= "_obo_row";
ZmId.CMP_OBO_SPAN			= "_obo_span";
ZmId.CMP_BWO_SPAN			= "_bwo_span";
ZmId.CMP_SUBJECT_ROW		= "_subject_row";
ZmId.CMP_SUBJECT_INPUT		= "_subject_control";
ZmId.CMP_IDENTITY_ROW		= "_identity_row";
ZmId.CMP_IDENTITY_SELECT	= "_identity_control";
ZmId.CMP_PRIORITY			= "_priority";
ZmId.CMP_REPLY_ATT_ROW		= "_reply_attachments_link";
ZmId.CMP_ATT_ROW			= "_attachments_row";
ZmId.CMP_ATT_DIV			= "_attachments_div";
ZmId.CMP_ATT_BTN			= "_attachments_btn";
ZmId.CMP_ATT_INP			= "_file_input";
ZmId.CMP_ATT_COMPUTER_INP	= "_file_input_computer";
ZmId.CMP_ATT_INLINE_INP		= "_file_input_inline";
ZmId.CMP_ATT_INCL_ORIG_LINK	= "_show_orig";
ZmId.CMP_DND_TOOLTIP        = "_zdnd_tooltip";

ZmId.CMP_TO_CELL			= "_to_cell";
ZmId.CMP_CC_CELL			= "_cc_cell";
ZmId.CMP_BCC_CELL			= "_bcc_cell";

// compose operations
ZmId.CMP_TO					= "TO";
ZmId.CMP_CC					= "CC";
ZmId.CMP_BCC				= "BCC";

/*
 * 
 * Constants used to generate IDs
 * 
 */

// apps
ZmId.APP_BRIEFCASE		= "Briefcase";
ZmId.APP_CALENDAR		= "Calendar";
ZmId.APP_CONTACTS		= "Contacts";
ZmId.APP_MAIL			= "Mail";
ZmId.APP_PORTAL			= "Portal";
ZmId.APP_PREFERENCES	= "Options";
ZmId.APP_SEARCH			= "Search";
ZmId.APP_SOCIAL			= "Social";
ZmId.APP_TASKS			= "Tasks";
ZmId.APP_VOICE			= "Voice";
ZmId.APP_CHAT           = "Chat";

// views - often used as context for ID
ZmId.VIEW_ACCOUNT				= "ACCT";
ZmId.VIEW_APPOINTMENT 			= "APPT";
ZmId.VIEW_SIMPLE_ADD_APPOINTMENT= "SAPPT";
ZmId.VIEW_APPOINTMENT_READONLY  = "APPTRO";
ZmId.VIEW_APPT_SCHEDULE			= "APPTS";
ZmId.VIEW_BRIEFCASE			    = "BC";
ZmId.VIEW_BRIEFCASE_DETAIL		= "BCD";
ZmId.VIEW_BRIEFCASE_COLUMN		= "BCC";
ZmId.VIEW_BRIEFCASE_ICON		= "BCI";
ZmId.VIEW_BRIEFCASE_PREVIEW     = "BCP";
ZmId.VIEW_BRIEFCASE_REVISION    = "BRLV";
ZmId.VIEW_BRIEFCASE_DETAIL      = "BDLV";
ZmId.VIEW_CAL					= "CAL";
ZmId.VIEW_CAL_APPT				= "CLA";
ZmId.VIEW_CAL_DAY				= "CLD";
ZmId.VIEW_CAL_LIST				= "CLL";
ZmId.VIEW_CAL_MONTH				= "CLM";
ZmId.VIEW_CAL_WEEK				= "CLW";
ZmId.VIEW_CAL_WORK_WEEK			= "CLWW";
ZmId.VIEW_CAL_FB			    = "CLFB";
ZmId.VIEW_CAL_TRASH             = "CLT";
ZmId.VIEW_SUGGEST_TIME_PANE     = "CSTP";
ZmId.VIEW_SUGGEST_LOCATION_PANE = "CSLP";
ZmId.VIEW_CALL_LIST				= "CLIST";
ZmId.VIEW_COMPOSE				= "COMPOSE";
ZmId.VIEW_CONTACT_SIMPLE 		= "CNS";			// dual panes, list and contact
ZmId.VIEW_CONTACT_SRC			= "CNSRC";			// contact picker
ZmId.VIEW_CONTACT_TGT			= "CNTGT";			// contact picker
ZmId.VIEW_CONTACT				= "CN";
ZmId.VIEW_CONV 					= "CV";				// dual-pane conv view
ZmId.VIEW_CONV2 				= "CV2";			// conv shown in reading pane
ZmId.VIEW_CONVLIST 				= "CLV";			// hybrid conv list view
ZmId.VIEW_FILTER_RULES			= "FRV";
ZmId.VIEW_GROUP					= "GRP";
ZmId.VIEW_LOADING				= "LOADING";		// generic placeholder
ZmId.VIEW_MAIL_CONFIRM			= "MAILCONFIRM";
ZmId.VIEW_MOBILE_DEVICES		= "MD";
ZmId.VIEW_MSG 					= "MSG";
ZmId.VIEW_MSG_CAPSULE			= "MSGC";
ZmId.VIEW_PORTAL                = "PORTAL";
ZmId.VIEW_PREF					= "PREF";
//ZmId.VIEW_QUICK_COMMAND			= "QCV";
ZmId.VIEW_SEARCH_RESULTS		= "SR";
ZmId.VIEW_SHARE_PENDING			= "SVP";
ZmId.VIEW_SHARE_MOUNTED			= "SVM";
ZmId.VIEW_SHARE_GRANTS			= "SVG";
ZmId.VIEW_SHORTCUTS				= "SHORTCUTS";
ZmId.VIEW_TASK					= "TKV";
ZmId.VIEW_TASK_NOT_STARTED		= "TKVN";
ZmId.VIEW_TASK_COMPLETED		= "TKVC";
ZmId.VIEW_TASK_IN_PROGRESS		= "TKVI";
ZmId.VIEW_TASK_WAITING			= "TKVW";
ZmId.VIEW_TASK_DEFERRED 		= "TKVD";
ZmId.VIEW_TASK_ALL				= "TKVA";
ZmId.VIEW_TASK_TODO				= "TKVT";
ZmId.VIEW_TASKEDIT				= "TKE";
ZmId.VIEW_TASKLIST				= "TKL";
ZmId.VIEW_TRAD 					= "TV";
ZmId.VIEW_VOICEMAIL				= "VM";
ZmId.VIEW_ATTACHMENTS           = "AV";

// item types
ZmId.ITEM_APPOINTMENT	= "APPT";
ZmId.ITEM_ATT			= "ATT";
ZmId.ITEM_BRIEFCASE		= "BRIEFCASE_ITEM";
ZmId.ITEM_BRIEFCASE_REV	= "BRIEFCASE_REVISION";
ZmId.ITEM_CALL			= "CALL";
ZmId.ITEM_CHAT			= "CHAT";
ZmId.ITEM_CONTACT		= "CONTACT";
ZmId.ITEM_CONV			= "CONV";
ZmId.ITEM_DATA_SOURCE	= "DATA_SOURCE";
ZmId.ITEM_DOCUMENT		= "DOCUMENT";
ZmId.ITEM_GAL_CONTACT	= "GAL";
ZmId.ITEM_GROUP			= "GROUP";
ZmId.ITEM_MSG			= "MSG";
ZmId.ITEM_PAGE			= "PAGE";
ZmId.ITEM_RESOURCE		= "RESOURCE";
ZmId.ITEM_TASK			= "TASK";
ZmId.ITEM_VOICEMAIL		= "VOICEMAIL";

// organizer types - generally appear in overview
ZmId.ORG_ADDRBOOK			= "ADDRBOOK";
ZmId.ORG_BRIEFCASE			= "BRIEFCASE";
ZmId.ORG_CALENDAR			= "CALENDAR";
ZmId.ORG_FOLDER				= "FOLDER";
ZmId.ORG_PREF_PAGE			= "PREF_PAGE";
ZmId.ORG_SEARCH				= "SEARCH";				// saved search
ZmId.ORG_TAG				= "TAG";
ZmId.ORG_TASKS				= "TASKS";
ZmId.ORG_ZIMLET				= "ZIMLET";

// fields of an item - generally equates to a column in a list view
ZmId.FLD_ACCOUNT		= "ac";
ZmId.FLD_ATTACHMENT		= "at";
ZmId.FLD_CAPACITY		= "cp";
ZmId.FLD_COMPANY		= "co";
ZmId.FLD_DATE			= "dt";
ZmId.FLD_DEPARTMENT		= "de";
ZmId.FLD_EMAIL			= "em";
ZmId.FLD_EXPAND			= "ex";	// CLV
ZmId.FLD_FILE_TYPE		= "ft";
ZmId.FLD_FLAG			= "fg";
ZmId.FLD_FOLDER			= "fo";
ZmId.FLD_FRAGMENT		= "fm";
ZmId.FLD_FROM			= "fr";
ZmId.FLD_HOME_PHONE		= "hp"; // Contacts
ZmId.FLD_ID				= "id";
ZmId.FLD_INDEX			= "ix";
ZmId.FLD_ITEM_ROW		= "rw";
ZmId.FLD_ITEM_ROW_3PANE	= "r3";
ZmId.FLD_LOCATION		= "lo";
ZmId.FLD_LOCK           = "loid";
ZmId.FLD_MSG_PRIORITY   = "mp"; //message prioritization
ZmId.FLD_NAME			= "na";
ZmId.FLD_NOTES			= "no";
ZmId.FLD_PARTICIPANT	= "pa";
ZmId.FLD_PCOMPLETE		= "pc"; // Tasks
ZmId.FLD_PRIORITY		= "pr"; // Tasks
ZmId.FLD_RECURRENCE		= "re";	// Calendar
ZmId.FLD_SELECTION		= "se";
ZmId.FLD_SELECTION_CELL	= "sec";
ZmId.FLD_SIZE			= "sz";
ZmId.FLD_SORTED_BY		= "sb";
ZmId.FLD_STATUS			= "st";
ZmId.FLD_READ			= "rd";
ZmId.FLD_MUTE			= "mt";
ZmId.FLD_SUBJECT		= "su";
ZmId.FLD_TAG			= "tg";
ZmId.FLD_TAG_CELL		= "tc";
ZmId.FLD_TYPE			= "ty";
ZmId.FLD_TO             = "to";
ZmId.FLD_VERSION        = "ver";
ZmId.FLD_WORK_PHONE		= "wp"; // Contacts
ZmId.FLD_CREATED        = "cr";   // Application passcode created
ZmId.FLD_LAST_USED      = "lu";   // Application passcode last used

// operations - things the user can do, usually via a button or menu item
ZmId.OP_ACCEPT_PROPOSAL         = "ACCEPT_PROPOSAL";
ZmId.OP_ADD       		     	= "ADD";
ZmId.OP_ADD_FILTER_RULE			= "ADD_FILTER_RULE";
ZmId.OP_ADD_TO_FILTER_RULE		= "ADD_TO_FILTER_RULE";
//ZmId.OP_ADD_QUICK_COMMAND		= "ADD_QUICK_COMMAND";
ZmId.OP_ADD_SIGNATURE			= "ADD_SIGNATURE";
ZmId.OP_ADD_EXTERNAL_CALENDAR	= "ADD_EXTERNAL_CALENDAR";
ZmId.OP_ATTACHMENT				= "ATTACHMENT";
ZmId.OP_ACTIONS_MENU			= "ACTIONS_MENU";
ZmId.OP_BROWSE					= "BROWSE";
ZmId.OP_BROWSE_FOLDER			= "BROWSE_FOLDER";
ZmId.OP_CALL					= "CALL";
ZmId.OP_CAL_REFRESH				= "CAL_REFRESH";
ZmId.OP_CAL_REPLY				= "CAL_REPLY";
ZmId.OP_CAL_REPLY_ALL			= "CAL_REPLY_ALL";
ZmId.OP_CAL_LIST_VIEW			= "CAL_LIST_VIEW";
ZmId.OP_CAL_VIEW_MENU			= "CAL_VIEW_MENU";
ZmId.OP_CANCEL					= "CANCEL";
ZmId.OP_CHECKIN                 = "CHECKIN";
ZmId.OP_CHECKOUT                = "CHECKOUT";
ZmId.OP_CHECK_ALL				= "CHECK_ALL";
ZmId.OP_CHECK_MAIL				= "CHECK_MAIL";
ZmId.OP_GO_OFFLINE				= "GOOFFLINE";
ZmId.OP_CALL_BACK				= "CALL_BACK";
ZmId.OP_CLEAR_ALL				= "CLEAR_ALL";
ZmId.OP_CLOSE					= "CLOSE";
ZmId.OP_COMPOSE_FORMAT			= "COMPOSE_FORMAT";
ZmId.OP_COMPOSE_OPTIONS			= "COMPOSE_OPTIONS";
ZmId.OP_CONTACT					= "CONTACT";
ZmId.OP_CONTACTGROUP_MENU       = "CONTACTGROUP_MENU";
ZmId.OP_COPY		     		= "COPY";
ZmId.OP_CREATE_APPT     		= "CREATE_APPT";
ZmId.OP_CREATE_TASK     		= "CREATE_TASK";
ZmId.OP_DAY_VIEW				= "DAY_VIEW";
ZmId.OP_DECLINE_PROPOSAL        = "DECLINE_PROPOSAL";
ZmId.OP_DELETE					= "DELETE";
ZmId.OP_DELETE_WITHOUT_SHORTCUT		= "DELETE_WITHOUT_SHORTCUT";
ZmId.OP_DELETE_APPT_INSTANCE	= "DELETE_INSTANCE";
ZmId.OP_DELETE_APPT_SERIES  	= "DELETE_SERIES";
ZmId.OP_DELETE_CONV				= "DELETE_CONV";
ZmId.OP_DELETE_MENU				= "DELETE_MENU";
ZmId.OP_DELETE_MSG				= "DELETE_MSG";
ZmId.OP_DELETE_VERSION          = "DELETE_VERSION";
ZmId.OP_DETACH					= "DETACH";
ZmId.OP_DETACH_WIN				= "DETACH_WIN";
ZmId.OP_DETACH_COMPOSE			= "DETACH_COMPOSE";
ZmId.OP_DISCARD_CHECKOUT        = "DISCARD_CHECKOUT";
ZmId.OP_DOWNLOAD_VOICEMAIL		= "DOWNLOAD_VOICEMAIL";
ZmId.OP_NEW_CALL				= "NEW_CALL";
ZmId.OP_DUPLICATE_APPT  		= "DUPLICATE_APPT";
ZmId.OP_DRAFT					= "DRAFT";
ZmId.OP_EDIT					= "EDIT";
ZmId.OP_EDIT_AS_NEW				= "EDIT_AS_NEW";
ZmId.OP_EDIT_CONTACT			= "EDIT_CONTACT";
ZmId.OP_EDIT_FILE				= "EDIT_FILE";
ZmId.OP_EDIT_FILTER_RULE		= "EDIT_FILTER_RULE";
//ZmId.OP_EDIT_QUICK_COMMAND		= "EDIT_QUICK_COMMAND";
ZmId.OP_EDIT_PROPS				= "EDIT_PROPS";
ZmId.OP_EDIT_REPLY_ACCEPT		= "EDIT_REPLY_ACCEPT";
ZmId.OP_EDIT_REPLY_CANCEL		= "EDIT_REPLY_CANCEL";
ZmId.OP_EDIT_REPLY_DECLINE		= "EDIT_REPLY_DECLINE";
ZmId.OP_EDIT_REPLY_TENTATIVE	= "EDIT_REPLY_TENTATIVE";
ZmId.OP_EMPTY_FOLDER			= "EMPTY_FOLDER";
ZmId.OP_EXPAND					= "EXPAND";
ZmId.OP_EXPAND_ALL				= "EXPAND_ALL";
//ZmId.OP_EXPORT_FOLDER			= "EXPORT_FOLDER";
ZmId.OP_FB_VIEW				    = "FB_VIEW";
ZmId.OP_FLAG					= "FLAG";
ZmId.OP_UNFLAG					= "UNFLAG";
ZmId.OP_FIND_SHARES				= "FIND_SHARES";
ZmId.OP_FORMAT_HTML				= "FORMAT_HTML";
ZmId.OP_FORMAT_HTML_SOURCE		= "FORMAT_HTML_SOURCE";
ZmId.OP_FORMAT_MEDIA_WIKI		= "FORMAT_MEDIA_WIKI";
ZmId.OP_FORMAT_RICH_TEXT		= "FORMAT_RICH_TEXT";
ZmId.OP_FORMAT_TEXT				= "FORMAT_TEXT";
ZmId.OP_FORMAT_TWIKI			= "FORMAT_TWIKI";
ZmId.OP_FORMAT_MORE_OPTIONS		= "FORMAT_MORE_OPTIONS";
ZmId.OP_FORWARD					= "FORWARD";
ZmId.OP_FORWARD_ATT				= "FORWARD_ATT";
ZmId.OP_FORWARD_BY_EMAIL		= "FORWARD_BY_EMAIL";
ZmId.OP_FORWARD_CONV		    = "FORWARD_CONV";
ZmId.OP_FORWARD_INLINE			= "FORWARD_INLINE";
ZmId.OP_FORWARD_MENU			= "FORWARD_MENU";
ZmId.OP_FORWARD_APPT			= "FORWARD_APPT";
ZmId.OP_FORWARD_APPT_INSTANCE	= "FORWARD_APPT_INSTANCE";
ZmId.OP_FORWARD_APPT_SERIES		= "FORWARD_APPT_SERIES";
ZmId.OP_FREE_BUSY_LINK			= "FREE_BUSY_LINK";
ZmId.OP_GROUPBY                 = "GROUPBY";
ZmId.OP_GROUPBY_DATE            = "GROUPBY_DATE";
ZmId.OP_GROUPBY_NONE            = "GROUPBY_NONE";
ZmId.OP_GROUPBY_FROM            = "GROUPBY_FROM";
ZmId.OP_GROUPBY_PRIORITY        = "GROUPBY_PRIORITY";
ZmId.OP_GROUPBY_SIZE            = "GROUPBY_SIZE";
ZmId.OP_GROUPBY_TAG             = "GROUPBY_TAG";
ZmId.OP_GO_TO_URL				= "GO_TO_URL";
ZmId.OP_IMPORT_FILE				= "IMPORT_FILE";
//ZmId.OP_IMPORT_FOLDER			= "IMPORT_FOLDER";
ZmId.OP_INC_ATTACHMENT			= "INC_ATTACHMENT";
ZmId.OP_INC_BODY				= "INC_BODY";
ZmId.OP_INC_NONE				= "INC_NONE";
ZmId.OP_INC_SMART				= "INC_SMART";
ZmId.OP_INCLUDE_HEADERS			= "INCLUDE_HEADERS";
ZmId.OP_INVITE_ATTENDEES		= "INVITE_ATTENDEES";
ZmId.OP_INVITE_REPLY_ACCEPT		= "INVITE_REPLY_ACCEPT";
ZmId.OP_INVITE_REPLY_DECLINE	= "INVITE_REPLY_DECLINE";
ZmId.OP_INVITE_REPLY_MENU		= "INVITE_REPLY_MENU";
ZmId.OP_INVITE_REPLY_TENTATIVE	= "INVITE_REPLY_TENTATIVE";
ZmId.OP_KEEP_READING			= "KEEP_READING";
ZmId.OP_MARK_ALL_READ			= "MARK_ALL_READ";
ZmId.OP_MARK_HEARD				= "MARK_HEARD";
ZmId.OP_MARK_READ				= "MARK_READ";
ZmId.OP_MARK_UNHEARD			= "MARK_UNHEARD";
ZmId.OP_MARK_UNREAD				= "MARK_UNREAD";
ZmId.OP_MARK_AS_COMPLETED		= "MARK_AS_COMPLETED";
ZmId.OP_MOBILE_REMOVE			= "MOBILE_REMOVE";
ZmId.OP_MOBILE_CANCEL_WIPE		= "MOBILE_CANCEL_WIPE";
ZmId.OP_MOBILE_RESUME_SYNC		= "MOBILE_RESUME_SYNC";
ZmId.OP_MOBILE_SUSPEND_SYNC		= "MOBILE_SUSPEND_SYNC";
ZmId.OP_MOBILE_WIPE				= "MOBILE_WIPE";
ZmId.OP_MONTH_VIEW				= "MONTH_VIEW";
ZmId.OP_MOUNT_ADDRBOOK			= "MOUNT_ADDRBOOK";
ZmId.OP_MOUNT_BRIEFCASE			= "MOUNT_BRIEFCASE";
ZmId.OP_MOUNT_CALENDAR			= "MOUNT_CALENDAR";
ZmId.OP_MOUNT_FOLDER			= "MOUNT_FOLDER";
ZmId.OP_MOUNT_TASK_FOLDER		= "MOUNT_TASK_FOLDER";
ZmId.OP_MOVE					= "MOVE";
ZmId.OP_MOVE_FOLDER				= "MOVE_FOLDER";
ZmId.OP_MOVE_MENU				= "MOVE_MENU";
ZmId.OP_MOVE_DOWN_FILTER_RULE	= "MOVE_DOWN_FILTER_RULE";
ZmId.OP_MOVE_TO_BCC				= "MOVE_TO_BCC";
ZmId.OP_MOVE_TO_CC				= "MOVE_TO_CC";
ZmId.OP_MOVE_TO_TO				= "MOVE_TO_TO";
ZmId.OP_MOVE_UP_FILTER_RULE		= "MOVE_UP_FILTER_RULE";
ZmId.OP_MUTE_CONV		        = "MUTE_CONV";
ZmId.OP_NEW_ADDRBOOK			= "NEW_ADDRBOOK";
ZmId.OP_NEW_ALLDAY_APPT			= "NEW_ALLDAY_APPT";
ZmId.OP_NEW_APPT				= "NEW_APPT";
ZmId.OP_NEW_BRIEFCASE			= "NEW_BRIEFCASE";
ZmId.OP_NEW_CALENDAR			= "NEW_CALENDAR";
ZmId.OP_NEW_CONTACT				= "NEW_CONTACT";
ZmId.OP_NEW_DISTRIBUTION_LIST	= "NEW_DISTRIBUTION_LIST";
ZmId.OP_NEW_DOC                 = "NEW_DOC";
ZmId.OP_NEW_FILE				= "NEW_FILE";
ZmId.OP_NEW_FOLDER				= "NEW_FOLDER";
ZmId.OP_NEW_GROUP				= "NEW_GROUP";
ZmId.OP_NEW_MENU				= "NEW_MENU";
ZmId.OP_NEW_MESSAGE				= "NEW_MESSAGE";
ZmId.OP_NEW_MESSAGE_WIN			= "NEW_MESSAGE_WIN";
ZmId.OP_NEW_BRIEFCASE_WIN		= "NEW_BRIEFCASE_WIN";
ZmId.OP_NEW_PAGE				= "NEW_PAGE";
ZmId.OP_NEW_TAG					= "NEW_TAG";
ZmId.OP_NEW_TASK				= "NEW_TASK";
ZmId.OP_NOTIFY                  = "NOTIFY";
ZmId.OP_NEW_TASK_FOLDER			= "NEW_TASK_FOLDER";
ZmId.OP_OPEN_APPT_INSTANCE		= "OPEN_APPT_INSTANCE";
ZmId.OP_OPEN_APPT_SERIES		= "OPEN_APPT_SERIES";
ZmId.OP_OPEN_FILE				= "OPEN_FILE";
ZmId.OP_OPEN_IN_TAB				= "OPEN_IN_TAB";
ZmId.OP_PAGE_BACK				= "PAGE_BACK";
ZmId.OP_PAGE_FORWARD			= "PAGE_FORWARD";
ZmId.OP_PAUSE_TOGGLE			= "PAUSE_TOGGLE";
ZmId.OP_PRINT					= "PRINT";
ZmId.OP_PRINT_ADDRBOOK			= "PRINT_ADDRBOOK";
ZmId.OP_PRINT_CALENDAR			= "PRINT_CALENDAR";
ZmId.OP_PRINT_CONTACT			= "PRINT_CONTACT";
ZmId.OP_PRIORITY_FILTER         = "PRIORITY_FILTER";
ZmId.OP_PRIORITY_HIGH           = "PRIORITY_HIGH";
ZmId.OP_PRIORITY_LOW            = "PRIORITY_LOW";
ZmId.OP_PRIORITY_NORMAL         = "PRIORITY_NORMAL";
ZmId.OP_PROPOSE_NEW_TIME        = "PROPOSE_NEW_TIME";
ZmId.OP_OPTS         			= "OPTIONS";
//ZmId.OP_QUICK_COMMANDS  	    = "QUICK_COMMANDS";
ZmId.OP_RECOVER_DELETED_ITEMS	= "RECOVER_DELETED_ITEMS";
ZmId.OP_REDIRECT				= "REDIRECT";
ZmId.OP_REFRESH					= "REFRESH";
ZmId.OP_REINVITE_ATTENDEES      = "REINVITE_ATTENDEES";
ZmId.OP_REMOVE_FILTER_RULE		= "REMOVE_FILTER_RULE";
//ZmId.OP_REMOVE_QUICK_COMMAND	= "REMOVE_QUICK_COMMAND";
ZmId.OP_RENAME_FILE             = "RENAME_FILE";
ZmId.OP_RENAME_FOLDER			= "RENAME_FOLDER";
ZmId.OP_RENAME_SEARCH			= "RENAME_SEARCH";
ZmId.OP_RENAME_TAG				= "RENAME_TAG";
ZmId.OP_REPLY					= "REPLY";
ZmId.OP_REPLY_ACCEPT			= "REPLY_ACCEPT";
ZmId.OP_REPLY_ACCEPT_IGNORE		= "REPLY_ACCEPT_IGNORE";
ZmId.OP_REPLY_ACCEPT_NOTIFY		= "REPLY_ACCEPT_NOTIFY";
ZmId.OP_REPLY_ALL				= "REPLY_ALL";
ZmId.OP_REPLY_BY_EMAIL			= "REPLY_BY_EMAIL";
ZmId.OP_REPLY_CANCEL			= "REPLY_CANCEL";
ZmId.OP_REPLY_CANCEL			= "REPLY_CANCEL";
ZmId.OP_REPLY_DECLINE			= "REPLY_DECLINE";
ZmId.OP_REPLY_DECLINE_IGNORE	= "REPLY_DECLINE_IGNORE";
ZmId.OP_REPLY_DECLINE_NOTIFY	= "REPLY_DECLINE_NOTIFY";
ZmId.OP_REPLY_MENU				= "REPLY_MENU";
ZmId.OP_REPLY_MODIFY			= "REPLY_MODIFY";
ZmId.OP_REPLY_MODIFY			= "REPLY_MODIFY";
ZmId.OP_REPLY_NEW_TIME			= "REPLY_NEW_TIME";
ZmId.OP_REPLY_NEW_TIME			= "REPLY_NEW_TIME";
ZmId.OP_REPLY_TENTATIVE			= "REPLY_TENTATIVE";
ZmId.OP_REPLY_TENTATIVE_IGNORE	= "REPLY_TENTATIVE_IGNORE";
ZmId.OP_REPLY_TENTATIVE_NOTIFY	= "REPLY_TENTATIVE_NOTIFY";
ZmId.OP_REPORT					= "REPORT";
ZmId.OP_REQUEST_READ_RECEIPT	= "REQUEST_READ_RECEIPT";
ZmId.OP_RESET                   = "RESET";
ZmId.OP_RESTORE_VERSION         = "RESTORE_VERSION";
ZmId.OP_REVERT_PAGE				= "REVERT_PAGE";
ZmId.OP_RUN_FILTER_RULE			= "RUN_FILTER_RULE";
ZmId.OP_SAVE					= "SAVE";
ZmId.OP_SAVE_DRAFT				= "SAVE_DRAFT";
ZmId.OP_SAVE_FILE				= "SAVE_FILE";
ZmId.OP_SEARCH					= "SEARCH";
ZmId.OP_SEARCH_MAIL				= "SEARCH_MAIL";
ZmId.OP_SEARCH_MENU             = "SEARCH_MENU";
ZmId.OP_SEARCH_TO               = "SEARCH_TO";
ZmId.OP_SEND					= "SEND";
ZmId.OP_SEND_FILE				= "SEND_FILE";
ZmId.OP_SEND_FILE_AS_ATT	    = "SEND_FILE_AS_ATT";
ZmId.OP_SEND_FILE_MENU          = "SEND_FILE_MENU";
ZmId.OP_SEND_MENU				= "SEND_MENU";
ZmId.OP_SEND_LATER				= "SEND_LATER";
ZmId.OP_SEND_PAGE				= "SEND_PAGE";
ZmId.OP_SEND_INVITE				= "SEND_INVITE";
ZmId.OP_SEND_FB_HTML			= "SEND_FB_HTML";
ZmId.OP_SEND_FB_ICS			    = "SEND_FB_ICS";
ZmId.OP_SEND_FB_ICS_EVENT	    = "SEND_FB_ICS_EVENT";
ZmId.OP_SHARE					= "SHARE";
ZmId.OP_SHARE_ACCEPT			= "SHARE_ACCEPT";
ZmId.OP_SHARE_ADDRBOOK			= "SHARE_ADDRBOOK";
ZmId.OP_SHARE_BRIEFCASE			= "SHARE_BRIEFCASE";
ZmId.OP_SHARE_CALENDAR			= "SHARE_CALENDAR";
ZmId.OP_SHARE_DECLINE			= "SHARE_DECLINE";
ZmId.OP_SHARE_FOLDER			= "SHARE_FOLDER";
ZmId.OP_SHARE_TASKFOLDER		= "SHARE_TASKFOLDER";
ZmId.OP_SHOW_ALL_ITEM_TYPES		= "SHOW_ALL_ITEM_TYPES";
ZmId.OP_SHOW_BCC				= "SHOW_BCC";
ZmId.OP_SHOW_CONV				= "SHOW_CONV";
ZmId.OP_SHOW_ONLY_MAIL			= "SHOW_ONLY_MAIL";
ZmId.OP_SHOW_ORIG				= "SHOW_ORIG";
ZmId.OP_SORT_ASC                = "SORT_ASC";
ZmId.OP_SORT_DESC               = "SORT_DESC";
ZmId.OP_SPAM					= "SPAM";
ZmId.OP_SPELL_CHECK				= "SPELL_CHECK";
ZmId.OP_SUBSCRIBE_APPROVE		= "SUBSCRIBE_APPROVE";
ZmId.OP_SUBSCRIBE_REJECT		= "SUBSCRIBE_REJECT";
ZmId.OP_SYNC					= "SYNC";
ZmId.OP_SYNC_ALL				= "SYNC_ALL";
ZmId.OP_SYNC_OFFLINE_FOLDER		= "SYNC_OFFLINE_FOLDER";
ZmId.OP_TAG						= "TAG";
ZmId.OP_TAG_COLOR_MENU			= "TAG_COLOR_MENU";
ZmId.OP_TAG_MENU				= "TAG_MENU";
ZmId.OP_PRINT_TASK		    	= "PRINT_TASK";
ZmId.OP_PRINT_TASKFOLDER		= "PRINT_TASKFOLDER";
ZmId.OP_TEXT					= "TEXT";
ZmId.OP_TODAY					= "TODAY";
ZmId.OP_UNDELETE				= "UNDELETE";
ZmId.OP_UNMUTE_CONV		        = "UNMUTE_CONV";
ZmId.OP_USE_PREFIX				= "USE_PREFIX";
ZmId.OP_VERSION_HISTORY         = "VERSION_HISTORY";
ZmId.OP_VIEW					= "VIEW";
ZmId.OP_VIEW_APPOINTMENT		= "VIEW_APPOINTMENT";
ZmId.OP_VIEW_APPT_INSTANCE		= "VIEW_APPT_INSTANCE";
ZmId.OP_VIEW_APPT_SERIES		= "VIEW_APPT_SERIES";
ZmId.OP_VIEW_BY_DATE			= "VIEW_BY_DATE";
ZmId.OP_VIEW_FILE_AS_HTML		= "VIEW_FILE_AS_HTML";
ZmId.OP_VIEW_MENU				= "VIEW_MENU";
ZmId.OP_SORTBY_MENU			    = "SORTBY_MENU";
ZmId.OP_WEEK_VIEW				= "WEEK_VIEW";
ZmId.OP_WORK_WEEK_VIEW			= "WORK_WEEK_VIEW";
ZmId.OP_ZIMLET					= "ZIMLET";

//Group By IDs
ZmId.GROUPBY_DATE               = "GROUPBY_DATE";
ZmId.GROUPBY_FROM               = "GROUPBY_FROM";
ZmId.GROUPBY_NONE               = "GROUPBY_NONE";
ZmId.GROUPBY_PRIORITY           = "GROUPBY_PRIORITY";
ZmId.GROUPBY_SIZE               = "GROUPBY_SIZE";
ZmId.GROUPBY_TAG                = "GROUPBY_TAG";


/*
 * Experimental ID code below. The main idea is to make easier for a third party (such as QA) to find what they're
 * looking for. A secondary goal is to ensure that we always use unique IDs. The systematic approach above is prone
 * to failure in that regard, since the same set of inputs will produce the same ID.
 *
 * The new approach is to introduce a level of indirection between the fields and the ID. IDs will go back to being
 * unique and opaque, based on an incrementing number. A hash will be maintained which maps a collection of fields
 * to the actual ID used in the DOM.
 *
 * The core of the new system is related closely to the old system: a set of params which, taken together, should
 * uniquely identify an element. The possible values for each param are typically constants defined in this class.
 *
 * To make it easy for clients of this ID system to successfully look up IDs, creators of IDs should provide as many
 * parameters as possible. For example, providing both skinComponent and componentType may be redundant, but then
 * the ID can be looked up using either parameter.
 *
 * The parameters and their values:
 *
 * skinComponent
 *
 *      The HTML skin for ZCS defines a number of components and provides containers for them. This param identifies
 *      which skin component contains the element. Note that the IDs for the skin containers themselves (as well as
 *      a few elements within those containers) are defined by the skin (in skin.html), and are not part of this set
 *      of IDs. May often be omitted when looking up an ID.
 *
 *      ZmId.SKIN_*
 *
 * componentType
 *
 *      The general category of view component that maps to the element. It may be a type of widget such as a button
 *      or a menu, something more general like a view, or even a subcomponent like a list view header.
 *
 *      DwtId.WIDGET_*
 *      ZmId.WIDGET_*
 *
 * componentName
 *
 *      The component name identifies the component among components of a similar type. It may be the name of an
 *      operation. For example, a search button would have the type "button" and the name "search". (There may be
 *      more than one search button, so other params may be necessary to uniquely identify each one.)
 *
 *      ZmId.VIEW_*
 *      ZmId.OP_*
 *      ZmId.TB_*
 *      ZmId.SEARCH_*
 *      ZmId.MV_*
 *      ZmId.CMP_*
 *      ZmId.GROUPBY_*
 *
 * app
 *
 *      The name of the application that contains the element. Some elements are global and do not have an associated
 *      application. Elements associated with an app appear within the main content area.
 *
 *      ZmId.APP_*
 *
 * containingView
 *
 *      For an element within the main content area, the identifier of the view that contains it.
 *
 *      ZmId.VIEW_*
 *
 * sessionId
 *
 *      A number identifying a session for a view which can appear in more than one tab at a time. For example, there
 *      may be multiple compose sessions if the user replies to several different messages without sending the replies.
 *
 * itemType
 *
 *      The type of item, such as message, contact, or appointment.
 *
 *      ZmId.ITEM_*
 *
 * itemId
 *
 *      The ID of the item (for example, a mail message) that the element is tied to. For local items, it's a number.
 *      For shared items, it's a compound string comprising an account ID and a local numeric ID.
 *
 * organizerType
 *
 *      The type of organizer, such as folder, tag, or zimlet. Organizers generally appear in the overview.
 *
 *      ZmId.ORG_*
 *
 * organizerId
 *
 *      The ID of the organizer (for example, a mail folder) that the element is tied to. For local organizers, it's a
 *      number. For shared folders, it's a compound string comprising an account ID and a local numeric ID.
 *
 * field
 *
 *      A field identifies a specific sub-part of a component. It might be something that helps make up a widget,
 *      such as the "left icon" in a button, or it might be something ZCS-specific like the "subject" field in a list
 *      view that displays mail messages. The line between componentName and field can be a bit blurry. Generally a
 *      componentName refers to a container of some sort, like a list row or header.
 *
 *      ZmId.FLD_*
 *
 * tagName
 *
 *      The tag name of the HTML element, such as "TABLE" or "TR". May usually be omitted when looking up an ID.
 *
 * sequence
 *
 *      A number used to diffentiate between otherwise identical IDs.
 *
 * parentId
 *
 *      The ID of the parent of this element.
 *
 */

ZmId.BASE = "zcs";
ZmId.SEQ = 1;

ZmId._idList = [];

ZmId._idHash = {};

ZmId._valueToParam = {};

/**
 * Returns a unique ID that can later be looked up. As many params as possible should be provided, in order to
 * make lookup easier. If one or more IDs is found to already have been created with the given set of params,
 * a sequence number is added as a parameter.
 *
 * @param {hash}        params          set of fields describing the ID's element
 * @param {string}      description     (optional) a brief description of the purpose of the ID
 */
ZmId.create = function(params, description) {

	var idParams = AjxUtil.hashCopy(params);
	var ids = ZmId.lookup(params);
	if (ids) {
		idParams.sequence = (typeof ids === "string") ? 1 : ids.length;
	}
	idParams.description = description || "";
	var newId = ZmId.BASE + ZmId.SEQ++;
	idParams.id = newId;
	ZmId._idHash[newId] = idParams;
	ZmId._idList.push(idParams);

	for (var key in params) {
		ZmId._valueToParam[params[key]] = key;
	}

	return newId;
};

/**
 * Returns the DOM ID that matches the given set of params. If more than one ID matches, a list is returned.
 * A partial set of params may be provided. The more params provided, the better the chance of finding just one ID.
 * The best approach is to provide the minimal set of params that will uniquely differentiate the element. If no
 * params are provided, returns all IDs.
 *
 * Optionally, a list of values can be given. An attempt will be made to reverse-engineer the params by figuring
 * out the appropriate key for each value. This method will never be as reliable as providing a hash in the first place.
 *
 * @param {hash|array}  params    set of fields describing the ID(s) being sought
 */
ZmId.lookup = function(params) {

	if (!params) {
		return ZmId._idList;
	}

	if (AjxUtil.isArray(params)) {
		params = ZmId._convertValues(params);
	}

	var ids = [];
	for (var i = 0, len = ZmId._idList.length; i < len; i++) {
		var idParams = ZmId._idList[i];
		var add = true;
		for (var param in params) {
			if (idParams[param] && params[param] !== idParams[param]) {
				add = false;
				continue;
			}
		}
		if (add) {
			ids.push(idParams.id);
		}
	}
	return (ids.length === 0) ? null : (ids.length === 1) ? ids[0] : ids;
};

/**
 * Returns the set of params used to create the given ID.
 *
 * @param id
 */
ZmId.getParams = function(id) {
	return ZmId._idHash[id];
};

/**
 * Displays a list of matching IDs in a popup, with the params used to create them and their descriptions.
 * Intended as a development tool.
 *
 * @param params    set of fields describing the ID(s) being sought
 */
ZmId.showIds = function(params) {

	if (!DBG || DBG.isDisabled()) { return; }

	var ids = ZmId.lookup(params),
		len = ids.length,
		text = "",
		i;

	for (i = 0; i < len; i++) {
		var id = ids[i].id;
		var params = ZmId._idHash[id];
		text += "\n-----\n\n" + id + AjxStringUtil.repeat(" ", 16 - id.length) + params.description + "\n\n";
		var paramNames = AjxUtil.keys(params).sort();
		for (var j = 0; j < paramNames.length; j++) {
			var paramName = paramNames[j];
			if (paramName === 'id' || paramName === 'description') {
				continue;
			}
			var value = params[paramName];
			if (!value) {
				continue;
			}
			value = ZmId._backMap[value] ? "ZmId." + ZmId._backMap[value] : value;
			text += paramName + AjxStringUtil.repeat(" ", 16 - paramName.length) + value + "\n";
		}
	}

	DBG.printRaw(text);
};

ZmId._backMap = AjxUtil.valueHash(ZmId, function(k) {
	return typeof ZmId[k] === 'string';
});

// Create a static hash so we know if a string is a view type (eg "CLV")
ZmId._isViewType = AjxUtil.arrayAsHash(AjxUtil.values(ZmId, function(k) {
	return typeof ZmId[k] === "string" && k.indexOf("VIEW_") === 0;
}));

// Convert a list of values of ID parameters back into a hash by figuring out the matching key for each value.
// View names (such as "CLV") are a bit tricky since they can be either a componentName (for a view widget), or
// a containingView. A small number might be an organizer ID (eg Inbox is 2), or a session ID.
ZmId._convertValues = function(values) {

	var params = {},
		viewValue, numValue;

	for (var i = 0; i < values.length; i++) {
		var value = values[i];
		if (ZmId._isViewType[value]) {
			viewValue = value;
		}
		else if (AjxUtil.isNumber(value) || AjxUtil.isNumeric(value)) {
			var num = parseInt(value);
			if (num < 10) {
				numValue = num;
			}
		}
		else {
			var param = ZmId._valueToParam[value];
			params[param] = value;
		}
	}

	// A view value is a componentName only if the componentType is a view.
	if (viewValue) {
		var viewParam = (params.componentType === ZmId.WIDGET_VIEW) ? "componentName" : "containingView";
		params[viewParam] = viewValue;
	}

	// A single-digit number is probably an organizer ID or a session ID.
	if (numValue) {
		var viewParam = params.organizerType ? "organizerId" : "sessionId";
		params[viewParam] = viewValue;
	}

	return params;
};
