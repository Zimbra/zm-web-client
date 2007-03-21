/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
* Creates an overview controller.
* @constructor
* @class
* This singleton class manages overviews, each of which has a unique ID.
* An overview is a set of tree views. When the overview is created, various
* characteristics of its tree views can be provided. Each type of tree view
* has a corresponding tree controller (also a singleton), which is lazily
* created.
*
* @author Conrad Damon
* @param appCtxt	[ZmAppCtxt]		app context
* @param container	[DwtControl]	top-level container
*/
function ZmOverviewController(appCtxt, container) {

	ZmController.call(this, appCtxt, container);
	
	// hashes that are keyed by overview ID
	this._overview = {};
	this._controllers = {};
	this._treeIds = {};
	this._selectionSupported = {};
	this._actionSupported = {};
	this._dndSupported = {};
	this._headerClass = {};
	this._showUnread = {};
	this._treeStyle = {};
	this._treeString = {};
	this._hideEmpty = {};
};

ZmOverviewController.CONTROLLER = {};
ZmOverviewController.CONTROLLER[ZmOrganizer.FOLDER]				= "ZmFolderTreeController";
ZmOverviewController.CONTROLLER[ZmOrganizer.SEARCH]				= "ZmSearchTreeController";
ZmOverviewController.CONTROLLER[ZmOrganizer.TAG]				= "ZmTagTreeController";
ZmOverviewController.CONTROLLER[ZmOrganizer.ZIMLET]				= "ZmZimletTreeController";

ZmOverviewController.DEFAULT_FOLDER_ID = ZmFolder.ID_INBOX;

ZmOverviewController.prototype = new ZmController;
ZmOverviewController.prototype.constructor = ZmOverviewController;

ZmOverviewController.prototype.toString = 
function() {
	return "ZmOverviewController";
};

/**
* Creates a new overview with the given options.
*
* @param overviewId				[constant]		overview ID
* @param parent					[DwtControl]*	containing widget
* @param overviewClass			[string]*		class name for overview DIV
* @param posStyle				[constant]*		positioning style for overview DIV
* @param scroll					[constant]*		scrolling style for overview DIV
* @param selectionSupported		[boolean]*		true if left-click selection is supported
* @param actionSupported		[boolean]*		true if right-click action menus are supported
* @param dndSupported			[boolean]*		true if drag-and-drop is supported
* @param headerClass			[string]*		class name for header item
* @param showUnread				[boolean]*		if true, unread counts will be shown
* @param treeStyle				[constant]*		display style for tree views
* @param hideEmpty				[hash]*			IDs of tree to hide if they lack data
*/
ZmOverviewController.prototype.createOverview =
function(params) {
	var overviewId = params.overviewId;
	var parent = params.parent ? params.parent : this._shell;
	var overviewClass = params.overviewClass ? params.overviewClass : "overview";
	var overview = this._overview[overviewId] = new DwtAccordion(parent, overviewClass, params.posStyle);
	this._overview[overviewId].setScrollStyle(params.scroll ? params.scroll : Dwt.SCROLL);
	this._selectionSupported[overviewId] = params.selectionSupported;
	this._actionSupported[overviewId] = params.actionSupported;
	this._dndSupported[overviewId] = params.dndSupported;
	this._headerClass[overviewId] = params.headerClass;
	this._showUnread[overviewId] = params.showUnread;
	this._treeStyle[overviewId] = params.treeStyle;
	this._hideEmpty[overviewId] = params.hideEmpty;

	return overview;
};

/**
* Clears the given overview's tree views.
*
* @param overviewId		[constant]	overview ID
*/
ZmOverviewController.prototype.clearOverview =
function(overviewId) {
	var treeIds = this._treeIds[overviewId];
	if (treeIds) {
		for (var i = 0; i < treeIds.length; i++) {
			var treeController = this.getTreeController(treeIds[i]);
			treeController.clearTreeView(overviewId);
		}
	}
};

/**
* Displays the given list of tree views, applying the given overview's options. If a tree
* view has already been created, its HTML element will be added to the overview, so that
* its state is preserved.
* <p>
* A hash of IDs of organizers to omit from the overview may be given. Also, a hash of IDs
* of tree views to reset may be provided. If a tree view is being reset, then its HTML
* element is not pruned from the overview panel.</p>
*
* @param overviewId		[constant]	overview ID
* @param treeIds		[Array]		list of organizer types
* @param omit			[Object]*	hash of organizer IDs to ignore
* @param reset			[Object]*	hash of tree IDs to reset
*/
ZmOverviewController.prototype.set =
function(overviewId, treeIds, omit, reset) {
	if (!overviewId) return;
	if (!(treeIds && treeIds.length)) return;
	
	// clear current tree views out of the overview
	var curTreeIds = this._treeIds[overviewId];
	var overview = this.getOverview(overviewId);
	// TODO: following line results in a bug if you're switching overviews
	// but not apps (eg shortcuts); need to differentiate tree IDs some
	// other way; should probably redesign and simplify
	var oldApp = this._appCtxt.getAppController().getPreviousApp();
	if (curTreeIds && curTreeIds.length) {
		for (var i = 0; i < curTreeIds.length; i++) {
			var treeId = curTreeIds[i];
			var treeView = this.getTreeView(overviewId, treeId, oldApp);
			if (treeView) {
				if (reset && reset[treeId]) {
					this.getTreeController(treeId).clearTreeView(overviewId);
				} else {
					// preserve a ref to the element so we can add it back later
					overview.removeChild(treeView, true);
				}
			}
		}
	}

	// add tree views to the overview
	var app = this._appCtxt.getAppController().getActiveApp();
	for (var i = 0; i < treeIds.length; i++) {
		var treeId = treeIds[i];
		// lazily create appropriate tree controller
		var treeController = this.getTreeController(treeId);
		var treeView = this.getTreeView(overviewId, treeIds[i], app);
		if (!treeView || (reset && reset[treeId])) {
			var hideEmpty = this._hideEmpty[overviewId] ? this._hideEmpty[overviewId][treeId] : false;
			// create the tree view as a child of the overview
			var params = {overviewId:overviewId, omit:omit, app:app, hideEmpty:hideEmpty};
			params.showUnread = this._showUnread[overviewId];
			treeController.show(params);

			// reset treeView once its been created
			treeView = this.getTreeView(overviewId, treeIds[i], app);
		} else {
			// add the tree view's HTML element back to the overview
			overview.addChild(treeView);
			treeView.setCheckboxes();
		}

		////////////////////////////////////////////////////////////////////
		// XXX: HACK HACK HACK HACK HACK - AINT SHE PRETTY?
		////////////////////////////////////////////////////////////////////
		if (app == ZmApp.MAIL) {
			var body = overview.getBody();
			if (body) treeView.reparentHtmlElement(body);
			overview.show(true);
		} else {
			overview.show(false);
		}
	}
	this._treeIds[overviewId] = treeIds;
};

/**
* Returns the given tree controller.
*
* @param treeId		[constant]		organizer type
*/
ZmOverviewController.prototype.getTreeController =
function(treeId) {
	if (!treeId) { return null; }
	if (!this._controllers[treeId]) {
		var treeControllerCtor = eval(ZmOverviewController.CONTROLLER[treeId]);
		this._controllers[treeId] = new treeControllerCtor(this._appCtxt);
	}
	return this._controllers[treeId];
};

/**
* Returns the tree for the given organizer type.
*
* @param treeId		[constant]		organizer type
*/
ZmOverviewController.prototype.getTreeData =
function(treeId) {
	return treeId ? this._appCtxt.getTree(treeId) : null;
};

/**
* Returns the given overview.
*
* @param overviewId		[constant]	overview ID
*/
ZmOverviewController.prototype.getOverview =
function(overviewId) {
	return this._overview[overviewId];
};

/**
* Returns true if left-click selection is supported for the given overview.
*
* @param overviewId		[constant]	overview ID
*/
ZmOverviewController.prototype.selectionSupported =
function(overviewId) {
	return this._selectionSupported[overviewId];
};

/**
* Returns true if right-click action menus are supported for the given overview.
*
* @param overviewId		[constant]	overview ID
*/
ZmOverviewController.prototype.actionSupported =
function(overviewId) {
	return this._actionSupported[overviewId];
};

/**
* Returns true if drag-and-drop is supported for the given overview.
*
* @param overviewId		[constant]	overview ID
*/
ZmOverviewController.prototype.dndSupported =
function(overviewId) {
	return this._dndSupported[overviewId];
};

/**
* Returns the custom CSS class for this overview's header items.
*
* @param overviewId		[constant]	overview ID
*/
ZmOverviewController.prototype.getHeaderClass =
function(overviewId) {
	return this._headerClass[overviewId];
};

/**
* Returns the style of tree views in the given overview.
*
* @param overviewId		[constant]	overview ID
*/
ZmOverviewController.prototype.getTreeStyle =
function(overviewId) {
	return this._treeStyle[overviewId];
};

/**
* Returns the given tree view in the given overview.
*
* @param overviewId		[constant]	overview ID
* @param treeId			[constant]	organizer type
* @param app			[string]*	app that owns the overview
*/
ZmOverviewController.prototype.getTreeView =
function(overviewId, treeId, app) {
	if (!overviewId || !treeId) { return null; }
	return this.getTreeController(treeId).getTreeView(overviewId, app);
};

ZmOverviewController.prototype.getAllTreeViews =
function(overviewId, app) {
	var a = [], i = 0, id;
	for (id in this._controllers)
		a[i++] = this._controllers[id].getTreeView(overviewId, app);
	return a;
};

/**
 * Searches the tree views for the given overviewId for the tree item
 * whose data object has the given ID and type.
 * 
 * @param overviewId	[constant]		overview ID
 * @param id			[int]			ID to look for
 * @param type			[constant]*		item must also have this type
 */
ZmOverviewController.prototype.getTreeItemById =
function(overviewId, id, type) {
	if (!overviewId || !id) { return null; }
	for (var org in this._controllers) {
		var treeView = this._controllers[org].getTreeView(overviewId);
		if (treeView) {
			var item = treeView.getTreeItemById(id);
			if (item && (!type || (org == type))) {
				return item;
			}
		}
	}

	return null;
};

/**
* Returns the first selected item within this overview.
*
* @param overviewId		[constant]	overview ID
*/
ZmOverviewController.prototype.getSelected =
function(overviewId) {
	var treeIds = this._treeIds[overviewId];
	if (!(treeIds && treeIds.length)) { return null; }
	for (var i = 0; i < treeIds.length; i++) {
		var treeView = this.getTreeView(overviewId, treeIds[i]);
		if (treeView) {
			var item = treeView.getSelected();
			if (item) {
				return item;
			}
		}
	}
	return null;
};

/**
* Given a tree view within an overview, deselects all items in the overview's
* other tree views, enforcing single selection within an overview.
*
* @param overviewId		[constant]	overview ID
* @param treeId			[constant]	organizer type
*/
ZmOverviewController.prototype.itemSelected =
function(overviewId, treeId) {
	var treeIds = this._treeIds[overviewId];
	for (var i = 0; i < treeIds.length; i++) {
		if (treeIds[i] != treeId) {
			var treeView = this.getTreeView(overviewId, treeIds[i]);
			if (treeView) {
				treeView.deselectAll();
			}
		}
	}
};

/*
* Adds a small amount of vertical space. Intended for use between tree views.
*
* @param overviewId		[constant]	overview ID
*/
ZmOverviewController.prototype._addSpacer =
function(overviewId) {
	var div = document.createElement("div");
	div.className = "vSpace";
	this._overview[overviewId].getHtmlElement().appendChild(div);
};
