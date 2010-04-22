/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
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
/**
 * Defines the "generic element" widget type prefix.
 */
ZmId.WIDGET					= "z";			// generic element
/**
 * Defines the "view within content area" widget type prefix.
 */
ZmId.WIDGET_VIEW			= "zv";			// view within content area
/**
 * Defines the "toolbar" widget type prefix.
 */
ZmId.WIDGET_TOOLBAR			= "ztb";		// toolbar
/**
 * Defines the "button" widget type prefix.
 */
ZmId.WIDGET_BUTTON			= "zb";			// button
/**
 * Defines the "text input or textarea" widget type prefix.
 */
ZmId.WIDGET_INPUT			= "zi";			// text input or textarea
/**
 * Defines the "menu" widget type prefix.
 */
ZmId.WIDGET_MENU			= "zm";			// menu
/**
 * Defines the "menu item" widget type prefix.
 */
ZmId.WIDGET_MENU_ITEM		= "zmi";		// menu item
/**
 * Defines the "dropdown select" widget type prefix.
 */
ZmId.WIDGET_SELECT			= "zs";			// dropdown select
/**
 * Defines the "collection of overview" widget type prefix.
 */
ZmId.WIDGET_OVERVIEW_CNTR	= "zovc";		// collection of overviews
/**
 * Defines the "collection of tree views" widget type prefix.
 */
ZmId.WIDGET_OVERVIEW		= "zov";		// collection of tree views
/**
 * Defines the "tree view" widget type prefix.
 */
ZmId.WIDGET_TREE			= "zt";			// tree view
/**
 * Defines the "root tree item" widget type prefix.
 */
ZmId.WIDGET_TREE_ITEM_HDR	= "ztih";		// root tree item
/**
 * Defines the "tree item (node)" widget type prefix.
 */
ZmId.WIDGET_TREE_ITEM		= "zti";		// tree item (node)
/**
 * Defines the "tab button" widget type prefix.
 */
ZmId.WIDGET_TAB				= "ztab";		// tab button

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
ZmId.SKIN_LINKS						= "skin_container_links";
ZmId.SKIN_LOGO						= "skin_container_logo";
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
ZmId.SKIN_TASKBAR					= "skin_container_taskbar";
ZmId.SKIN_FOOTER					= "skin_footer";
ZmId.SKIN_AD						= "skin_adsrvc";

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
ZmId.USER_NAME				= "z_userName";			// account name
ZmId.USER_QUOTA				= "z_userQuota";		// quota
ZmId.PRESENCE				= "z_presence";			// presence
ZmId.TASKBAR				= "z_taskbar";			// taskbar
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
	return DwtId._makeId(ZmId.WIDGET_TOOLBAR, context, tbType);
};

// special toolbars
ZmId.TB_INVITE	= "Inv";
ZmId.TB_NAV		= "Nav";
ZmId.TB_SHARE	= "Shr";

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
	return DwtId._makeId(ZmId.WIDGET_BUTTON, context, tbType, op);
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
	return DwtId._makeId(ZmId.WIDGET_MENU, context, menuType);
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
	return DwtId._makeId(ZmId.WIDGET_MENU_ITEM, context, menuType, op);
};

/**
 * Generates the ID for an overview container.
 *
 * @param {String}	overviewContainerId		the overview container ID
 * @return	{String}	the id
 */
ZmId.getOverviewContainerId =
function(overviewContainerId) {
	return DwtId._makeId(ZmId.WIDGET_OVERVIEW_CNTR, overviewContainerId);
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
	return DwtId._makeId(ZmId.WIDGET_OVERVIEW, overviewId);
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
	return DwtId._makeId(ZmId.WIDGET_TREE, overviewId, orgType);
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
		return DwtId._makeId(ZmId.WIDGET_TREE_ITEM_HDR, overviewId, type);
	} else {
		return DwtId._makeId(ZmId.WIDGET_TREE_ITEM, overviewId, organizerId);
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
 * @param {constant}	component		the component identifier (see <code>ZmId.MV_</code> constants)
 * @param {constant}	context		the ID of owning view
 * @return	{String}	the id
 */
ZmId.getViewId =
function(viewId, component, context) {
	var id = DwtId._makeId(ZmId.WIDGET_VIEW, context, viewId);
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
	var id = DwtId._makeId(ZmId.WIDGET, ZmId.COMPOSE_VIEW);
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
	return DwtId._makeId(ZmId.WIDGET_TAB, context, tabName);
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
 * 		ZmId.getMenuItemId(ZmId.SEARCH, ZmId.SEARCH_ANY)
 * 		ZmId.getMenuItemId(ZmId.SEARCH, ZmId.SEARCH_SHARED)
 */
 
ZmId.SEARCH_INPUT			= "zi_search";			// text input in search toolbar

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
/**
 * Defines the "all accounts" search type.
 */
ZmId.SEARCH_ALL_ACCOUNTS	= "ALL_ACCOUNTS";		// all accounts
/**
 * Defines the "any" search type.
 */
ZmId.SEARCH_ANY				= "ANY";				// all item types
/**
 * Defines the "GAL" search type.
 */
ZmId.SEARCH_GAL				= "GAL";				// GAL contacts
/**
 * Defines the "mail" search type.
 */
ZmId.SEARCH_MAIL			= "MAIL";				// mail items
/**
 * Defines the "shared" search type.
 */
ZmId.SEARCH_SHARED			= "SHARED";				// include shared items

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
ZmId.TREEITEM_NOTEBOOK				= "zti|Notebook|12";
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
ZmId.MV_CLOSE_BTN_CELL		= "_closeBtnCell";		// TD that holds Close button
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
ZmId.CMP_BCC_TOGGLE			= "_toggle_bcc";
ZmId.CMP_OBO_CHECKBOX		= "_obo_checkbox";
ZmId.CMP_OBO_LABEL			= "_obo_label";
ZmId.CMP_OBO_ROW			= "_obo_row";
ZmId.CMP_SUBJECT_ROW		= "_subject_row";
ZmId.CMP_SUBJECT_INPUT		= "_subject_control";
ZmId.CMP_IDENTITY_ROW		= "_identity_row";
ZmId.CMP_IDENTITY_SELECT	= "_identity_control";
ZmId.CMP_PRIORITY			= "_priority";
ZmId.CMP_ATT_ROW			= "_attachments_row";
ZmId.CMP_ATT_DIV			= "_attachments_div";
ZmId.CMP_DND_TOOLTIP        = "_zdnd_tooltip";

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
/**
 * Defines the "briefcase" application.
 */
ZmId.APP_BRIEFCASE		= "Briefcase";
/**
 * Defines the "calendar" application.
 */
ZmId.APP_CALENDAR		= "Calendar";
/**
 * Defines the "contacts" application.
 */
ZmId.APP_CONTACTS		= "Contacts";
/**
 * Defines the "IM" application.
 */
ZmId.APP_IM				= "IM";
/**
 * Defines the "mail" application.
 */
ZmId.APP_MAIL			= "Mail";
/**
 * Defines the "mixed" application.
 */
ZmId.APP_MIXED			= "Mixed";
/**
 * Defines the "notebook" application.
 */
ZmId.APP_NOTEBOOK		= "Notebook";
/**
 * Defines the "portal" application.
 */
ZmId.APP_PORTAL			= "Portal";
/**
 * Defines the "preferences" application.
 */
ZmId.APP_PREFERENCES	= "Options";
/**
 * Defines the "tasks" application.
 */
ZmId.APP_TASKS			= "Tasks";
/**
 * Defines the "voice" application.
 */
ZmId.APP_VOICE			= "Voice";

// views - often used as context for ID
ZmId.VIEW_ACCOUNT				= "ACCT";
ZmId.VIEW_APPOINTMENT 			= "APPT";
ZmId.VIEW_APPT_SCHEDULE			= "APPTS";
ZmId.VIEW_BRIEFCASE			    = "BC";
ZmId.VIEW_BRIEFCASE_DETAIL		= "BCD";
ZmId.VIEW_BRIEFCASE_COLUMN		= "BCC";
ZmId.VIEW_BRIEFCASE_ICON		= "BCI";
ZmId.VIEW_BRIEFCASE_PREVIEW     = "BCP";
ZmId.VIEW_CAL					= "CAL";
ZmId.VIEW_CAL_APPT				= "CLA";
ZmId.VIEW_CAL_DAY				= "CLD";
ZmId.VIEW_CAL_LIST				= "CLL";
ZmId.VIEW_CAL_MONTH				= "CLM";
ZmId.VIEW_CAL_SCHEDULE			= "CLS";
ZmId.VIEW_CAL_WEEK				= "CLW";
ZmId.VIEW_CAL_WORK_WEEK			= "CLWW";
ZmId.VIEW_CALL_LIST				= "CLIST";
/**
 * Defines the "compose" view.
 * @type String
 */
ZmId.VIEW_COMPOSE				= "COMPOSE";
ZmId.VIEW_CONTACT_CARDS			= "CNC";
ZmId.VIEW_CONTACT_SIMPLE 		= "CNS";
ZmId.VIEW_CONTACT_SRC			= "CNSRC";
ZmId.VIEW_CONTACT_TGT			= "CNTGT";
/**
 * Defines the "contact" view.
 * @type String
 */
ZmId.VIEW_CONTACT				= "CN";
/**
 * Defines the "conversation list" mail view.
 * @type String
 */
ZmId.VIEW_CONVLIST 				= "CLV";
/**
 * Defines the "conversation" view.
 * @type String
 */
ZmId.VIEW_CONV 					= "CV";
ZmId.VIEW_FILTER_RULES			= "FRV";
ZmId.VIEW_GROUP					= "GRP";
ZmId.VIEW_IM_CHAT_MEMBER_LIST	= "IMCML";
ZmId.VIEW_IM_CHAT_MULTI_WINDOW	= "IMCMW";
ZmId.VIEW_IM_CHAT_TAB			= "IMCT";
ZmId.VIEW_LOADING				= "LOADING";
ZmId.VIEW_MAIL_CONFIRM			= "MAILCONFIRM";
ZmId.VIEW_MIXED					= "MX";
ZmId.VIEW_MOBILE_DEVICES		= "MD";
/**
 * Defines the "message" view.
 * @type String
 */
ZmId.VIEW_MSG 					= "MSG";
ZmId.VIEW_NOTEBOOK_FILE			= "NBF";
ZmId.VIEW_NOTEBOOK_PAGE_EDIT	= "NBPE";
ZmId.VIEW_NOTEBOOK_PAGE			= "NBP";
ZmId.VIEW_NOTEBOOK_PAGE_VERSION = "NBPV";
ZmId.VIEW_NOTEBOOK_SITE			= "NBS";
ZmId.VIEW_PORTAL                = "PORTAL";
ZmId.VIEW_PREF					= "PREF";
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
ZmId.VIEW_TASKEDIT				= "TKE";
ZmId.VIEW_TASKLIST				= "TKL";
/**
 * Defines the "traditional" mail view.
 * @type String
 */
ZmId.VIEW_TRAD 					= "TV";
ZmId.VIEW_VOICEMAIL				= "VM";
ZmId.VIEW_ATTACHMENTS           = "AV";

// item types
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

// organizer types
/**
 * Defines the "address book" organizer.
 */
ZmId.ORG_ADDRBOOK			= "ADDRBOOK";
/**
 * Defines the "briefcase" organizer.
 */
ZmId.ORG_BRIEFCASE			= "BRIEFCASE";
/**
 * Defines the "calendar" organizer.
 */
ZmId.ORG_CALENDAR			= "CALENDAR";
/**
 * Defines the "folder" organizer.
 */
ZmId.ORG_FOLDER				= "FOLDER";
/**
 * Defines the "notebook" organizer.
 */
ZmId.ORG_NOTEBOOK			= "NOTEBOOK";
/**
 * Defines the "roster tree item" organizer.
 */
ZmId.ORG_ROSTER_TREE_ITEM	= "ROSTER_TREE_ITEM";
/**
 * Defines the "roster tree group" organizer.
 */
ZmId.ORG_ROSTER_TREE_GROUP	= "ROSTER_TREE_GROUP";
/**
 * Defines the "search" organizer.
 */
ZmId.ORG_SEARCH				= "SEARCH";
/**
 * Defines the "tag" organizer.
 */
ZmId.ORG_TAG				= "TAG";
/**
 * Defines the "tasks" organizer.
 */
ZmId.ORG_TASKS				= "TASKS";
/**
 * Defines the "zimlet" organizer.
 */
ZmId.ORG_ZIMLET				= "ZIMLET";
/**
 * Defines the "preferences page" organizer.
 */
ZmId.ORG_PREF_PAGE			= "PREF_PAGE";

// fields of an item
ZmId.FLD_ACCOUNT		= "ac";
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
ZmId.FLD_ITEM_ROW_3PANE	= "r3";
ZmId.FLD_LOCATION		= "lo";
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
ZmId.FLD_SUBJECT		= "su";
ZmId.FLD_TAG			= "tg";
ZmId.FLD_TAG_CELL		= "tc";
ZmId.FLD_TYPE			= "ty";
ZmId.FLD_WORK_PHONE		= "wp"; // Contacts

// operations
ZmId.OP_ADD_FILTER_RULE			= "ADD_FILTER_RULE";
ZmId.OP_ADD_SIGNATURE			= "ADD_SIGNATURE";
ZmId.OP_ATTACHMENT				= "ATTACHMENT";
ZmId.OP_BROWSE					= "BROWSE";
ZmId.OP_BROWSE_FOLDER			= "BROWSE_FOLDER";
ZmId.OP_CALL					= "CALL";
ZmId.OP_CALL_MANAGER			= "CALL_MANAGER";
ZmId.OP_CAL_REFRESH				= "CAL_REFRESH";
ZmId.OP_CAL_LIST_VIEW			= "CAL_LIST_VIEW";
ZmId.OP_CAL_VIEW_MENU			= "CAL_VIEW_MENU";
ZmId.OP_CANCEL					= "CANCEL";
ZmId.OP_CHECK_ALL				= "CHECK_ALL";
ZmId.OP_CHECK_CALLS				= "CHECK_CALLS";
ZmId.OP_CHECK_MAIL				= "CHECK_MAIL";
ZmId.OP_CHECK_VOICEMAIL			= "CHECK_VOICEMAIL";
ZmId.OP_CLEAR_ALL				= "CLEAR_ALL";
ZmId.OP_CLOSE					= "CLOSE";
ZmId.OP_COMPOSE_FORMAT			= "COMPOSE_FORMAT";
ZmId.OP_COMPOSE_OPTIONS			= "COMPOSE_OPTIONS";
ZmId.OP_CONTACT					= "CONTACT";
ZmId.OP_CREATE_APPT     		= "CREATE_APPT";
ZmId.OP_CREATE_TASK     		= "CREATE_TASK";
ZmId.OP_CREATE_SLIDE_SHOW		= "CREATE_SLIDE_SHOW";
ZmId.OP_DAY_VIEW				= "DAY_VIEW";
ZmId.OP_DELETE					= "DELETE";
ZmId.OP_DELETE_APPT_INSTANCE	= "DELETE_INSTANCE";
ZmId.OP_DELETE_APPT_SERIES  	= "DELETE_SERIES";
ZmId.OP_DELETE_CONV				= "DELETE_CONV";
ZmId.OP_DELETE_MENU				= "DELETE_MENU";
ZmId.OP_DELETE_MSG				= "DELETE_MSG";
ZmId.OP_DETACH					= "DETACH";
ZmId.OP_DETACH_WIN				= "DETACH_WIN";
ZmId.OP_DETACH_COMPOSE			= "DETACH_COMPOSE";
ZmId.OP_DOWNLOAD_VOICEMAIL		= "DOWNLOAD_VOICEMAIL";
ZmId.OP_DRAFT					= "DRAFT";
ZmId.OP_EDIT					= "EDIT";
ZmId.OP_EDIT_CONTACT			= "EDIT_CONTACT";
ZmId.OP_EDIT_FILTER_RULE		= "EDIT_FILTER_RULE";
ZmId.OP_EDIT_NOTEBOOK_CHROME	= "EDIT_NOTEBOOK_CHROME";
ZmId.OP_EDIT_NOTEBOOK_CHROME	= "EDIT_NOTEBOOK_CHROME";
ZmId.OP_EDIT_NOTEBOOK_FOOTER	= "EDIT_NOTEBOOK_FOOTER";
ZmId.OP_EDIT_NOTEBOOK_HEADER	= "EDIT_NOTEBOOK_HEADER";
ZmId.OP_EDIT_NOTEBOOK_INDEX		= "EDIT_NOTEBOOK_INDEX";
ZmId.OP_EDIT_NOTEBOOK_SIDE_BAR	= "EDIT_NOTEBOOK_SIDE_BAR";
ZmId.OP_EDIT_PROPS				= "EDIT_PROPS";
ZmId.OP_EDIT_REPLY_ACCEPT		= "EDIT_REPLY_ACCEPT";
ZmId.OP_EDIT_REPLY_CANCEL		= "EDIT_REPLY_CANCEL";
ZmId.OP_EDIT_REPLY_DECLINE		= "EDIT_REPLY_DECLINE";
ZmId.OP_EDIT_REPLY_TENTATIVE	= "EDIT_REPLY_TENTATIVE";
ZmId.OP_EMPTY_FOLDER			= "EMPTY_FOLDER";
ZmId.OP_EXPAND					= "EXPAND";
ZmId.OP_EXPAND_ALL				= "EXPAND_ALL";
//ZmId.OP_EXPORT_FOLDER			= "EXPORT_FOLDER";
ZmId.OP_FORMAT_HTML				= "FORMAT_HTML";
ZmId.OP_FORMAT_HTML_SOURCE		= "FORMAT_HTML_SOURCE";
ZmId.OP_FORMAT_MEDIA_WIKI		= "FORMAT_MEDIA_WIKI";
ZmId.OP_FORMAT_RICH_TEXT		= "FORMAT_RICH_TEXT";
ZmId.OP_FORMAT_TEXT				= "FORMAT_TEXT";
ZmId.OP_FORMAT_TWIKI			= "FORMAT_TWIKI";
ZmId.OP_FORWARD					= "FORWARD";
ZmId.OP_FORWARD_ATT				= "FORWARD_ATT";
ZmId.OP_FORWARD_BY_EMAIL		= "FORWARD_BY_EMAIL";
ZmId.OP_FORWARD_INLINE			= "FORWARD_INLINE";
ZmId.OP_FORWARD_MENU			= "FORWARD_MENU";
ZmId.OP_FORWARD_APPT			= "FORWARD_APPT";
ZmId.OP_FORWARD_APPT_INSTANCE	= "FORWARD_APPT_INSTANCE";
ZmId.OP_FORWARD_APPT_SERIES		= "FORWARD_APPT_SERIES";
ZmId.OP_FREE_BUSY_LINK			= "FREE_BUSY_LINK";
ZmId.OP_GO_TO_URL				= "GO_TO_URL";
ZmId.OP_IM						= "IM";
ZmId.OP_IMPORT_FILE				= "IMPORT_FILE";
//ZmId.OP_IMPORT_FOLDER			= "IMPORT_FOLDER";
ZmId.OP_IM_ADD_TO_CONTACT		= "IM_ADD_TO_CONTACT";
ZmId.OP_IM_BLOCK_BUDDY			= "IM_BLOCK_BUDDY";
ZmId.OP_IM_BUDDY_ARCHIVE		= "IM_BUDDY_ARCHIVE";
ZmId.OP_IM_BUDDY_LIST			= "IM_BUDDY_LIST";
ZmId.OP_IM_CLOSE_ALL_CHATS		= "IM_CLOSE_ALL_CHATS";
ZmId.OP_IM_CLOSE_OTHER_CHATS	= "IM_CLOSE_OTHER_CHATS";
ZmId.OP_IM_CLOSE_CHAT			= "IM_CLOSE_CHATS";
ZmId.OP_IM_CREATE_CONTACT		= "IM_CREATE_CONTACT";
ZmId.OP_IM_EDIT_CONTACT			= "IM_EDIT_CONTACT";
ZmId.OP_IM_HTML					= "IM_HTML";
ZmId.OP_IM_DELETE_GROUP			= "IM_DELETE_GROUP";
ZmId.OP_IM_INVITE				= "IM_INVITE";
ZmId.OP_IM_NEW_CHAT				= "IM_NEW_CHAT";
ZmId.OP_IM_PRESENCE_AWAY		= "IM_PRESENCE_AWAY";
ZmId.OP_IM_PRESENCE_CHAT		= "IM_PRESENCE_CHAT";
ZmId.OP_IM_PRESENCE_CUSTOM_MSG	= "IM_PRESENCE_CUSTOM_MSG";
ZmId.OP_IM_PRESENCE_DND			= "IM_PRESENCE_DND";
ZmId.OP_IM_PRESENCE_INVISIBLE	= "IM_PRESENCE_INVISIBLE";
ZmId.OP_IM_PRESENCE_MENU		= "IM_PRESENCE_MENU";
ZmId.OP_IM_PRESENCE_OFFLINE		= "IM_PRESENCE_OFFLINE";
ZmId.OP_IM_PRESENCE_ONLINE		= "IM_PRESENCE_ONLINE";
ZmId.OP_IM_PRESENCE_XA			= "IM_PRESENCE_XA";
ZmId.OP_IM_LOGOUT_YAHOO			= "IM_LOGOUT_YAHOO";
ZmId.OP_IM_PRESENCE_CUSTOM_MRU	= "IM_PRESENCE_CUSTOM_MRU";
ZmId.OP_IM_PRESENCE_MENU		= "IM_PRESENCE_MENU";
ZmId.OP_IM_SORT_BY_NAME			= "IM_SORT_BY_NAME";
ZmId.OP_IM_SORT_BY_PRESENCE		= "IM_SORT_BY_PRESENCE";
ZmId.OP_IM_TOGGLE_BLOCKED		= "IM_TOGGLE_BLOCKED";
ZmId.OP_IM_TOGGLE_OFFLINE		= "IM_TOGGLE_OFFLINE";
ZmId.OP_IM_UNBLOCK_BUDDY		= "IM_UNBLOCK_BUDDY";
ZmId.OP_INC_ATTACHMENT			= "INC_ATTACHMENT";
ZmId.OP_INC_BODY				= "INC_BODY";
ZmId.OP_INC_NONE				= "INC_NONE";
ZmId.OP_INC_SMART				= "INC_SMART";
ZmId.OP_INCLUDE_HEADERS			= "INCLUDE_HEADERS";
ZmId.OP_INVITE_REPLY_ACCEPT		= "INVITE_REPLY_ACCEPT";
ZmId.OP_INVITE_REPLY_DECLINE	= "INVITE_REPLY_DECLINE";
ZmId.OP_INVITE_REPLY_MENU		= "INVITE_REPLY_MENU";
ZmId.OP_INVITE_REPLY_TENTATIVE	= "INVITE_REPLY_TENTATIVE";
ZmId.OP_MARK_ALL_READ			= "MARK_ALL_READ";
ZmId.OP_MARK_HEARD				= "MARK_HEARD";
ZmId.OP_MARK_READ				= "MARK_READ";
ZmId.OP_MARK_UNHEARD			= "MARK_UNHEARD";
ZmId.OP_MARK_UNREAD				= "MARK_UNREAD";
ZmId.OP_MOBILE_CANCEL_WIPE		= "MOBILE_CANCEL_WIPE";
ZmId.OP_MOBILE_RESUME_SYNC		= "MOBILE_RESUME_SYNC";
ZmId.OP_MOBILE_SUSPEND_SYNC		= "MOBILE_SUSPEND_SYNC";
ZmId.OP_MOBILE_WIPE				= "MOBILE_WIPE";
ZmId.OP_MONTH_VIEW				= "MONTH_VIEW";
ZmId.OP_MOUNT_ADDRBOOK			= "MOUNT_ADDRBOOK";
ZmId.OP_MOUNT_BRIEFCASE			= "MOUNT_BRIEFCASE";
ZmId.OP_MOUNT_CALENDAR			= "MOUNT_CALENDAR";
ZmId.OP_MOUNT_FOLDER			= "MOUNT_FOLDER";
ZmId.OP_MOUNT_NOTEBOOK			= "MOUNT_NOTEBOOK";
ZmId.OP_MOUNT_TASK_FOLDER		= "MOUNT_TASK_FOLDER";
ZmId.OP_MOVE					= "MOVE";
ZmId.OP_MOVE_DOWN_FILTER_RULE	= "MOVE_DOWN_FILTER_RULE";
ZmId.OP_MOVE_UP_FILTER_RULE		= "MOVE_UP_FILTER_RULE";
ZmId.OP_NEW_ADDRBOOK			= "NEW_ADDRBOOK";
ZmId.OP_NEW_ALLDAY_APPT			= "NEW_ALLDAY_APPT";
ZmId.OP_NEW_APPT				= "NEW_APPT";
ZmId.OP_NEW_BRIEFCASE			= "NEW_BRIEFCASE";
ZmId.OP_NEW_CALENDAR			= "NEW_CALENDAR";
ZmId.OP_NEW_CONTACT				= "NEW_CONTACT";
ZmId.OP_NEW_DOC                 = "NEW_DOC";
ZmId.OP_NEW_FILE				= "NEW_FILE";
ZmId.OP_NEW_FOLDER				= "NEW_FOLDER";
ZmId.OP_NEW_GROUP				= "NEW_GROUP";
ZmId.OP_NEW_MENU				= "NEW_MENU";
ZmId.OP_NEW_MESSAGE				= "NEW_MESSAGE";
ZmId.OP_NEW_MESSAGE_WIN			= "NEW_MESSAGE_WIN";
ZmId.OP_NEW_NOTEBOOK			= "NEW_NOTEBOOK";
ZmId.OP_NEW_PAGE				= "NEW_PAGE";
ZmId.OP_NEW_PRESENTATION		= "NEW_PRESENTATION";
ZmId.OP_NEW_ROSTER_GROUP		= "NEW_ROSTER_GROUP";
ZmId.OP_NEW_ROSTER_ITEM			= "NEW_ROSTER_ITEM";
ZmId.OP_NEW_SPREADSHEET         = "NEW_SPREADSHEET";
ZmId.OP_NEW_TAG					= "NEW_TAG";
ZmId.OP_NEW_TASK				= "NEW_TASK";
ZmId.OP_NOTIFY                  = "NOTIFY";
ZmId.OP_NEW_TASK_FOLDER			= "NEW_TASK_FOLDER";
ZmId.OP_OPEN_APPT_INSTANCE		= "OPEN_APPT_INSTANCE";
ZmId.OP_OPEN_APPT_SERIES		= "OPEN_APPT_SERIES";
ZmId.OP_OPEN_FILE				= "OPEN_FILE";
ZmId.OP_PAGE_BACK				= "PAGE_BACK";
ZmId.OP_PAGE_FORWARD			= "PAGE_FORWARD";
ZmId.OP_PAUSE_TOGGLE			= "PAUSE_TOGGLE";
ZmId.OP_PRINT					= "PRINT";
ZmId.OP_PRINT_ADDRBOOK			= "PRINT_ADDRBOOK";
ZmId.OP_PRINT_CONTACT			= "PRINT_CONTACT";
ZmId.OP_REFRESH					= "REFRESH";
ZmId.OP_REMOVE_FILTER_RULE		= "REMOVE_FILTER_RULE";
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
ZmId.OP_REVERT_PAGE				= "REVERT_PAGE";
ZmId.OP_RUN_FILTER_RULE			= "RUN_FILTER_RULE";
ZmId.OP_SAVE					= "SAVE";
ZmId.OP_SAVE_DRAFT				= "SAVE_DRAFT";
ZmId.OP_SAVE_FILE				= "SAVE_FILE";
ZmId.OP_SCHEDULE_VIEW			= "SCHEDULE_VIEW";
ZmId.OP_SEARCH					= "SEARCH";
ZmId.OP_SEARCH_MAIL				= "SEARCH_MAIL";
ZmId.OP_SEND					= "SEND";
ZmId.OP_SEND_FILE				= "SEND_FILE";
ZmId.OP_SEND_FILE_AS_ATT	    = "SEND_FILE_AS_ATT";
ZmId.OP_SEND_FILE_MENU          = "SEND_FILE_MENU";
ZmId.OP_SEND_PAGE				= "SEND_PAGE";
ZmId.OP_SHARE					= "SHARE";
ZmId.OP_SHARE_ACCEPT			= "SHARE_ACCEPT";
ZmId.OP_SHARE_ADDRBOOK			= "SHARE_ADDRBOOK";
ZmId.OP_SHARE_BRIEFCASE			= "SHARE_BRIEFCASE";
ZmId.OP_SHARE_CALENDAR			= "SHARE_CALENDAR";
ZmId.OP_SHARE_DECLINE			= "SHARE_DECLINE";
ZmId.OP_SHARE_FOLDER			= "SHARE_FOLDER";
ZmId.OP_SHARE_NOTEBOOK			= "SHARE_NOTEBOOK";
ZmId.OP_SHARE_TASKFOLDER		= "SHARE_TASKFOLDER";
ZmId.OP_SHOW_ALL_ITEM_TYPES		= "SHOW_ALL_ITEM_TYPES";
ZmId.OP_SHOW_BCC				= "SHOW_BCC";
ZmId.OP_SHOW_ONLY_CONTACTS		= "SHOW_ONLY_CONTACTS";
ZmId.OP_SHOW_ONLY_MAIL			= "SHOW_ONLY_MAIL";
ZmId.OP_SHOW_ORIG				= "SHOW_ORIG";
ZmId.OP_SPAM					= "SPAM";
ZmId.OP_SPELL_CHECK				= "SPELL_CHECK";
ZmId.OP_SYNC					= "SYNC";
ZmId.OP_SYNC_OFFLINE_FOLDER		= "SYNC_OFFLINE_FOLDER";
ZmId.OP_TAG						= "TAG";
ZmId.OP_TAG_COLOR_MENU			= "TAG_COLOR_MENU";
ZmId.OP_TAG_MENU				= "TAG_MENU";
ZmId.OP_PRINT_TASK		    	= "PRINT_TASK";
ZmId.OP_PRINT_TASKFOLDER		= "PRINT_TASKFOLDER";
ZmId.OP_TEXT					= "TEXT";
ZmId.OP_TODAY					= "TODAY";
ZmId.OP_UNDELETE				= "UNDELETE";
ZmId.OP_USE_PREFIX				= "USE_PREFIX";
ZmId.OP_VIEW					= "VIEW";
ZmId.OP_VIEW_APPOINTMENT		= "VIEW_APPOINTMENT";
ZmId.OP_VIEW_APPT_INSTANCE		= "VIEW_APPT_INSTANCE";
ZmId.OP_VIEW_APPT_SERIES		= "VIEW_APPT_SERIES";
ZmId.OP_VIEW_BY_DATE			= "VIEW_BY_DATE";
ZmId.OP_VIEW_FILE_AS_HTML		= "VIEW_FILE_AS_HTML";
ZmId.OP_VIEW_MENU				= "VIEW_MENU";
ZmId.OP_WEEK_VIEW				= "WEEK_VIEW";
ZmId.OP_WORK_WEEK_VIEW			= "WORK_WEEK_VIEW";
ZmId.OP_ZIMLET					= "ZIMLET";
ZmId.OP_SYNC_ALL				= "SYNC_ALL";
