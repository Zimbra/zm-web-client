/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates an empty mixed view controller.
 * @constructor
 * @class
 * This class manages a view of heterogeneous items.
 *
 * @author Conrad Damon
 * 
 * @param container		containing shell
 * @param mixedApp		containing app
 */
ZmMixedController = function(container, mixedApp) {

	ZmListController.call(this, container, mixedApp);

	this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
	this._dragSrc.addDragListener(new AjxListener(this, this._dragListener));
	
	// controllers to handle particular types
	this._listController = {};
};

ZmMixedController.prototype = new ZmListController;
ZmMixedController.prototype.constructor = ZmMixedController;

ZmMixedController.prototype.toString = 
function() {
	return "ZmMixedController";
};

// Required packages
ZmMixedController.PKGS = {};
ZmMixedController.PKGS[ZmItem.CONTACT]			= ["ContactsCore", "Contacts"];
ZmMixedController.PKGS[ZmItem.GROUP]			= ["ContactsCore", "Contacts"];
ZmMixedController.PKGS[ZmItem.CONV]				= ["MailCore", "Mail"];
ZmMixedController.PKGS[ZmItem.MSG]				= ["MailCore", "Mail"];
ZmMixedController.PKGS[ZmItem.APPT]				= ["CalendarCore", "Calendar"];
ZmMixedController.PKGS[ZmItem.TASK]				= ["TasksCore", "Tasks"];
ZmMixedController.PKGS[ZmItem.PAGE]				= ["NotebookCore", "Notebook"];
ZmMixedController.PKGS[ZmItem.DOCUMENT]			= ["NotebookCore", "Notebook"];
ZmMixedController.PKGS[ZmItem.BRIEFCASE_ITEM]	= ["BriefcaseCore", "Briefcase"];


ZmMixedController.LIST_CTLR = {};
ZmMixedController.LIST_CTLR[ZmItem.MSG]				= "ZmTradController";
ZmMixedController.LIST_CTLR[ZmItem.CONV]			= "ZmConvListController";
ZmMixedController.LIST_CTLR[ZmItem.CONTACT]			= "ZmContactListController";
ZmMixedController.LIST_CTLR[ZmItem.GROUP]			= "ZmContactListController";
ZmMixedController.LIST_CTLR[ZmItem.APPT]			= "ZmCalViewController";
ZmMixedController.LIST_CTLR[ZmItem.TASK]			= "ZmTaskListController";
ZmMixedController.LIST_CTLR[ZmItem.PAGE]			= "ZmNotebookFileController";
ZmMixedController.LIST_CTLR[ZmItem.DOCUMENT]		= "ZmNotebookFileController";
ZmMixedController.LIST_CTLR[ZmItem.BRIEFCASE_ITEM]	= "ZmBriefcaseController";

ZmMixedController.APP = {};
ZmMixedController.APP[ZmItem.MSG]				= ZmApp.MAIL;
ZmMixedController.APP[ZmItem.CONV]				= ZmApp.MAIL;
ZmMixedController.APP[ZmItem.CONTACT]			= ZmApp.CONTACTS;
ZmMixedController.APP[ZmItem.GROUP]				= ZmApp.CONTACTS;
ZmMixedController.APP[ZmItem.APPT]				= ZmApp.CALENDAR;
ZmMixedController.APP[ZmItem.TASK]				= ZmApp.TASKS;
ZmMixedController.APP[ZmItem.PAGE]				= ZmApp.NOTEBOOK;
ZmMixedController.APP[ZmItem.DOCUMENT]			= ZmApp.NOTEBOOK;
ZmMixedController.APP[ZmItem.BRIEFCASE_ITEM]	= ZmApp.BRIEFCASE;

// Public methods

ZmMixedController.prototype.show =
function(searchResults) {
	ZmListController.prototype.show.call(this, searchResults);
	
	this._setup(this._currentView);

	this._list = searchResults.getResults(ZmItem.MIXED);
	var lv = this._listView[this._currentView];
	if (this._activeSearch) {
		if (this._list) {
			this._list.setHasMore(this._activeSearch.getAttribute("more"));
		}
		if (lv) {
			lv.offset = parseInt(this._activeSearch.getAttribute("offset"));;
		}
	}

	var elements = {};
	elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[this._currentView];
	elements[ZmAppViewMgr.C_APP_CONTENT] = lv;
	this._setView({view:this._currentView, elements:elements, isAppView:true});
	this._resetNavToolBarButtons(this._currentView);

	// always set the selection to the first item in the list
	var list = lv.getList();
	if (list && list.size() > 0) {
		lv.setSelection(list.get(0));
	}
};

// Resets the available options on a toolbar or action menu.
ZmMixedController.prototype._resetOperations =
function(parent, num) {
	ZmListController.prototype._resetOperations.call(this, parent, num);
	parent.enable(ZmOperation.CHECK_MAIL, true);
	
	// Disallow printing of documents.
	if (num == 1) {
		var selectedItem = this.getCurrentView().getSelection()[0];
		if (selectedItem.type == ZmItem.DOCUMENT) {
			parent.enable(ZmOperation.PRINT, false);
		}
	}
};

ZmMixedController.prototype.getKeyMapName =
function() {
	return "ZmMixedController";
};

// Private and protected methods

ZmMixedController.prototype._initializeToolBar = 
function(view) {
	if (this._toolbar[view]) return;

	ZmListController.prototype._initializeToolBar.call(this, view);
	this._toolbar[view].addFiller();

	var tb = new ZmNavToolBar({parent:this._toolbar[view], context:view});
	this._setNavToolBar(tb, view);

	// TODO: mail enabled?
	this._setNewButtonProps(view, ZmMsg.compose, "NewMessage", "NewMessageDis", ZmOperation.NEW_MESSAGE);
};

ZmMixedController.prototype._getToolBarOps =
function() {
	var list = this._standardToolBarOps();
	list.push(ZmOperation.SEP, ZmOperation.TAG_MENU);
	return list;
};

ZmMixedController.prototype._getActionMenuOps =
function() {
	return this._standardActionMenuOps();
};

ZmMixedController.prototype._getViewType = 
function() {
	return ZmId.VIEW_MIXED;
};

ZmMixedController.prototype._createNewView = 
function(view) {
	var mv = new ZmMixedView({parent:this._container, posStyle:DwtControl.ABSOLUTE_STYLE,
							  controller:this, dropTgt:this._dropTgt});
	mv.setDragSource(this._dragSrc);
	return mv;
};

ZmMixedController.prototype._getTagMenuMsg = 
function(num) {
	return (num == 1) ? ZmMsg.tagItem : ZmMsg.tagItems;
};

ZmMixedController.prototype._getMoveDialogTitle = 
function(num) {
	return (num == 1) ? ZmMsg.moveItem : ZmMsg.moveItems;
};

ZmMixedController.prototype._setViewContents =
function(view) {
	this._listView[view].set(this._list);
};

ZmMixedController.prototype._getListController =
function(type) {
	if (!this._listController[type]) {
		AjxDispatcher.require(ZmMixedController.PKGS[type]);
		var ctlrClass = window[ZmMixedController.LIST_CTLR[type]];
		var ctlr = this._listController[type] = new ctlrClass(appCtxt.getShell(), appCtxt.getApp(ZmMixedController.APP[type]));
		this._emulateListController(ctlr, type);
	}
	return this._listController[type];
};

ZmMixedController.prototype._emulateListController =
function(ctlr, type) {
	if (type == ZmItem.CONV || type == ZmItem.MSG) {
		ctlr.isReadingPaneOn = function() { return false; };
		ctlr._doublePaneView = ctlr._createDoublePaneView();
		ctlr._mailListView = ctlr._doublePaneView._mailListView = this._listView[this._currentView];
	} else if (type == ZmItem.APPT) {
		ctlr._viewMgr = new ZmCalViewMgr(ctlr._container, ctlr, ctlr._dropTgt);
		ctlr._viewMgr._currentViewName = ZmId.VIEW_CAL_LIST;
		ctlr._viewMgr._views[ZmId.VIEW_CAL_LIST] = this._listView[this._currentView];
	}
	ctlr._list = this._list;
	ctlr._currentView = this._currentView;
	ctlr._listView = {};
	ctlr._listView[this._currentView] = this._listView[this._currentView];
	ctlr._toolbar = {};
	ctlr._toolbar[this._currentView] = this._toolbar[this._currentView];
	ctlr._actionMenu = this.getActionMenu();
};

// Double click displays an item.
ZmMixedController.prototype._listSelectionListener =
function(ev) {
	if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		var ctlr = this._getListController(ev.item.type);
		ctlr._listSelectionListener(ev);
	} else {
		ZmListController.prototype._listSelectionListener.call(this, ev);
		this._resetOperations(this._toolbar[this._currentView]);
	}
};

ZmMixedController.prototype._listActionListener =
function(ev) {
	var ctlr = this._getListController(ev.item.type);
	ctlr._listActionListener(ev);
	this._resetOperations(this._actionMenu);
};

ZmMixedController.prototype._resetOperations =
function(parent) {
	var itemHash = this._divvyItems();
	parent.enable(ZmOperation.PRINT, !itemHash[ZmItem.BRIEFCASE_ITEM]);
};

ZmMixedController.prototype._divvyItems =
function() {
	var itemsByType = {};
	var items = this._listView[this._currentView].getSelection();
	for (var i = 0, count = items.length; i < count; i++) {
		var item = items[i];
		if (!itemsByType[item.type]) {
			itemsByType[item.type] = [];
		}
		itemsByType[item.type].push(item);
	}
	return itemsByType;
};

ZmMixedController.prototype._deleteListener = function(ev) { this._callListener(ev, "_deleteListener"); };
ZmMixedController.prototype._moveListener = function(ev) { this._callListener(ev, "_moveListener"); };
ZmMixedController.prototype._tagListener = function(ev) { this._callListener(ev, "_tagListener"); };
ZmMixedController.prototype._printListener = function(ev) { this._callListener(ev, "_printListener"); };

ZmMixedController.prototype._callListener =
function(ev, listener) {
	var itemHash = this._divvyItems();
	for (var type in itemHash) {
		var ctlr = this._getListController(type);
		if (listener == "_printListener" && type == ZmItem.CONTACT || type == ZmItem.GROUP) {
			listener = "_printContactListener";
		}
		ctlr[listener](ev);
	}
};
