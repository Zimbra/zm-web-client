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
 * Creates a new, empty double pane controller.
 * @constructor
 * @class
 * This class manages the two-pane view. The top pane contains a list view of 
 * items, and the bottom pane contains the selected item content.
 *
 * @author Parag Shah
 * 
 * @param container	containing shell
 * @param mailApp	containing app
 */
ZmDoublePaneController = function(container, mailApp) {

	if (arguments.length == 0) { return; }
	ZmMailListController.call(this, container, mailApp);
	this._readingPaneOn = mailApp._readingPaneOn;
	this._appReadingPane = false;	// whether to follow app-level reading pane state

	this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
	this._dragSrc.addDragListener(new AjxListener(this, this._dragListener));	
	
	this._listeners[ZmOperation.SHOW_ORIG] = new AjxListener(this, this._showOrigListener);
	this._listeners[ZmOperation.ADD_FILTER_RULE] = new AjxListener(this, this._filterListener);
	
	this._listSelectionShortcutDelayAction = new AjxTimedAction(this, this._listSelectionTimedAction);
};

ZmDoublePaneController.prototype = new ZmMailListController;
ZmDoublePaneController.prototype.constructor = ZmDoublePaneController;

ZmDoublePaneController.LIST_SELECTION_SHORTCUT_DELAY = 300;

// Public methods

ZmDoublePaneController.prototype.toString = 
function() {
	return "ZmDoublePaneController";
};

/**
* Displays the given item in a two-pane view. The view is actually
* created in _loadItem(), since it must execute last.
*
* @param search		[ZmSearch]		the current search results
* @param item		[ZmItem]		a generic item
* @param callback	[AjxCallback]*	client callback
*/
ZmDoublePaneController.prototype.show =
function(search, item, callback) {

	ZmMailListController.prototype.show.call(this, search);
	this.reset();
	this._item = item;
	this._setup(this._currentView);

	// see if we have it cached? Check if conv loaded?
	var respCallback = new AjxCallback(this, this._handleResponseShow, [item, callback]);
	this._loadItem(item, this._currentView, respCallback);
};

ZmDoublePaneController.prototype._handleResponseShow =
function(item, callback, results) {
	if (callback) {
		callback.run();
	}
	
	if (this._appReadingPane && (this._readingPaneOn != this._app._readingPaneOn)) {
		this._toggleReadingPane(true);
	}
	
	// If there's only one item in the list, go ahead and set focus to it since
	// there's no use in the one-item list having focus (arrow keys do nothing)
	if (this._readingPaneOn && (this._list.size() == 1)) {
		var msgView = this._doublePaneView._msgView;
		if (msgView) {
			appCtxt.getKeyboardMgr().grabFocus(msgView);
		}
	}
};

/**
 * Handles switching mail views.
 *
 * @param view		[constant]*		the id of the new view
 * @param force		[boolean]		if true, always redraw view
 */
ZmDoublePaneController.prototype.switchView =
function(view, force) {
	if (view == ZmMailListController.READING_PANE_MENU_ITEM_ID) {
		this._toggleReadingPane(force);
	} else {
		ZmMailListController.prototype.switchView.apply(this, arguments);
	}
};


/**
* Clears the conversation view, which actually just clears the message view.
*/
ZmDoublePaneController.prototype.reset =
function() {
	if (this._doublePaneView) {
		this._doublePaneView.reset();
	}
};

/**
 * Shows or hides the reading pane based on the value of the corresponding menu item.
 *
 * @param force		[boolean]*		if true, flip state of reading pane
 */
ZmDoublePaneController.prototype._toggleReadingPane = 
function(force) {
	var viewBtn = this._toolbar[this._currentView].getButton(ZmOperation.VIEW_MENU);
	var menu = viewBtn.getMenu();
	var mi = menu.getItemById(ZmOperation.MENUITEM_ID, ZmMailListController.READING_PANE_MENU_ITEM_ID);
	var checked = mi.getChecked();
	if (force) {
		checked = !checked;
		mi.setChecked(checked, true);
	} else {
		if (this._readingPaneOn == checked) { return; }
	}

	this._readingPaneOn = checked;
	this._doublePaneView.toggleView();

	// set msg in msg view if reading pane is being shown
	if (this._readingPaneOn) {
		this._setSelectedItem();
	}

	// need to reset special dbl-click handling for list view
//	this._mailListView._dblClickIsolation = (this._readingPaneOn && !AjxEnv.isIE);

	this._mailListView._resetColWidth();
};

ZmDoublePaneController.prototype._handleResponseSwitchView = 
function(currentMsg) {
	this._doublePaneView.setMsg(currentMsg);
};

// called after a delete has occurred. 
// Return value indicates whether view was popped as a result of a delete
ZmDoublePaneController.prototype.handleDelete = 
function() {
	return false;
};


// Private and protected methods

ZmDoublePaneController.prototype._createDoublePaneView = 
function() {
	// overload me
};

// Creates the conv view, which is not a standard list view (it's a two-pane
// sort of thing).
ZmDoublePaneController.prototype._initialize =
function(view) {
	// set up double pane view (which creates the MLV and MV)
	if (!this._doublePaneView){
		var dpv = this._doublePaneView = this._createDoublePaneView();
		this._mailListView = dpv.getMailListView();
//		this._mailListView._dblClickIsolation = (this._readingPaneOn && !AjxEnv.isIE);
		dpv.addInviteReplyListener(this._inviteReplyListener);
		dpv.addShareListener(this._shareListener);
	}

	ZmMailListController.prototype._initialize.call(this, view);
};

ZmDoublePaneController.prototype._getToolBarOps =
function() {
	var list = this._standardToolBarOps();
	list.push(ZmOperation.SEP);
	list = list.concat(this._msgOps());
	list.push(ZmOperation.SEP,
				ZmOperation.SPAM,
				ZmOperation.SEP,
				ZmOperation.TAG_MENU,
				ZmOperation.SEP,
				ZmOperation.DETACH,
				ZmOperation.SEP,
				ZmOperation.VIEW_MENU);
	return list;
};

ZmDoublePaneController.prototype._getActionMenuOps =
function() {
	var list = this._flagOps();
	list.push(ZmOperation.SEP);
	list = list.concat(this._msgOps());
	list.push(ZmOperation.SEP);
	list = list.concat(this._standardActionMenuOps());
	list.push(ZmOperation.SEP);
	list.push(ZmOperation.SPAM);
	list.push(ZmOperation.SHOW_ORIG);
	list.push(ZmOperation.ADD_FILTER_RULE);
	return list;
};

// Returns the already-created message list view.
ZmDoublePaneController.prototype._createNewView = 
function() {
	if (this._mailListView) {
		this._mailListView.setDragSource(this._dragSrc);
	}
	return this._mailListView;
};

ZmDoublePaneController.prototype.getReferenceView = 
function() {
	return this._doublePaneView;
};

ZmDoublePaneController.prototype._getTagMenuMsg = 
function(num) {
	return (num == 1) ? ZmMsg.tagMessage : ZmMsg.tagMessages;
};

ZmDoublePaneController.prototype._getMoveDialogTitle = 
function(num) {
	return (num == 1) ? ZmMsg.moveMessage : ZmMsg.moveMessages;
};

/**
 * Add reading pane to focus ring.
 */
ZmDoublePaneController.prototype._initializeTabGroup =
function(view) {
	if (this._tabGroups[view]) return;

	ZmListController.prototype._initializeTabGroup.apply(this, arguments);
	if (!AjxEnv.isIE) {
		this._tabGroups[view].addMember(this.getReferenceView().getMsgView());
	}
};

ZmDoublePaneController.prototype._setViewContents =
function(view) {
	this._doublePaneView.setItem(this._item);
};

// Called after pagination, but we don't want an item to be selected.
ZmDoublePaneController.prototype._resetSelection = function(idx) {};

ZmDoublePaneController.prototype._displayMsg =
function(msg) {
	if (!msg._loaded) { return; }

	this._doublePaneView.setMsg(msg);
	if (msg.isUnread) {
		var folder = appCtxt.getById(msg.folderId);
		var readOnly = folder ? folder.isReadOnly() : false;
		if (!readOnly) {
			// msg was cached, then marked unread
			this._doMarkRead([msg], true);
		}
	}
};

// Adds a "Reading Pane" checked menu item to a view menu
ZmDoublePaneController.prototype._setupReadingPaneMenuItem =
function(view, menu, checked) {
	var viewBtn = this._toolbar[view].getButton(ZmOperation.VIEW_MENU);
	if (!menu) {
		menu = viewBtn.getMenu();
		// this means conversations not enabled
		if (!menu) {
			menu = new ZmPopupMenu(viewBtn);
		}
		viewBtn.setMenu(menu);
	} else if (menu.getItemCount() > 0) {
		new DwtMenuItem(menu, DwtMenuItem.SEPARATOR_STYLE);
	}

	var id = ZmMailListController.READING_PANE_MENU_ITEM_ID;
	if (!menu._menuItems[id]) {
		var mi = menu.createMenuItem(id, {image:"SplitPane", text:ZmMsg.readingPane, style:DwtMenuItem.CHECK_STYLE});
		mi.setData(ZmOperation.MENUITEM_ID, id);
		mi.addSelectionListener(this._listeners[ZmOperation.VIEW]);
		mi.setChecked(checked, true);
	}
	return menu;
};

/*
* Displays a list of messages. If passed a conv, loads its message
* list. If passed a list, simply displays it. The first message will be 
* selected, which will trigger a message load/display.
*
* @param item		[ZmConv or ZmMailList]		conv or list of msgs
* @param view		[constant]					owning view type
* @param callback	[AjxCallback]*				client callback
*/
ZmDoublePaneController.prototype._loadItem =
function(item, view, callback) {
	if (item instanceof ZmMailItem) { // conv
		var conv = item;
		DBG.timePt("***** CONV: load", true);
		if (!conv._loaded) {
			var respCallback = new AjxCallback(this, this._handleResponseLoadConv, [view, callback]);
			conv.load({getFirstMsg:this._readingPaneOn}, respCallback);
		} else {
			this._handleResponseLoadConv(view, callback, conv._createResult());
		}
	} else { // msg list
		this._displayResults(view);
		if (callback) {
			callback.run();
		}
	}
};

ZmDoublePaneController.prototype._handleResponseLoadConv =
function(view, callback, result) {
	var searchResult = result.getResponse();
	var list = searchResult.getResults(ZmItem.MSG);
	if (list instanceof ZmList) {
		this._list = list;
		this._activeSearch = searchResult;
	}
	DBG.timePt("***** CONV: render");
	this._displayResults(view);
	if (callback) {
		callback.run();
	}
};

ZmDoublePaneController.prototype._displayResults =
function(view) {
	var elements = {};
	elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[view];
	elements[ZmAppViewMgr.C_APP_CONTENT] = this._doublePaneView;
	this._setView(view, elements, this._isTopLevelView());
	this._resetNavToolBarButtons(view);
				
	// always allow derived classes to reset size after loading
	var sz = this._doublePaneView.getSize();
	this._doublePaneView._resetSize(sz.x, sz.y);
};

/**
 * Loads and displays the given message. If the message was unread, it gets marked as
 * read, and the conversation may be marked as read as well. Note that we request no
 * busy overlay during the SOAP call - that's so that a subsequent click within the
 * double-click threshold can be processed. Otherwise, it's very difficult to generate
 * a double click because the first click triggers a SOAP request and the ensuing busy
 * overlay blocks the receipt of the second click.
 * 
 * @param msg	[ZmMailMsg]		msg to load
 */
ZmDoublePaneController.prototype._doGetMsg =
function(msg) {
	if (!msg) { return; }
	if (msg.id == this._pendingMsg) { return; }

	msg._loadPending = true;
	this._pendingMsg = msg.id;
	var respCallback = new AjxCallback(this, this._handleResponseDoGetMsg, msg);
	msg.load(appCtxt.get(ZmSetting.VIEW_AS_HTML), false, respCallback, null, true);
};

ZmDoublePaneController.prototype._handleResponseDoGetMsg =
function(msg) {
	if (this._pendingMsg && (msg.id != this._pendingMsg)) { return; }
	msg._loadPending = false;
	this._pendingMsg = null;
	this._doublePaneView.setMsg(msg);
	appCtxt.getSearchController().setEnabled(true);
};

ZmDoublePaneController.prototype._resetOperations = 
function(parent, num) {
	ZmMailListController.prototype._resetOperations.call(this, parent, num);
	var isMsg = false;
	var isDraft = false;
	if (num == 1) {
		var item = this._doublePaneView.getSelection()[0];
		isMsg = (item.type == ZmItem.MSG || (item.numMsgs == 1));
		isDraft = item.isDraft;
	}
	parent.enable(ZmOperation.SHOW_ORIG, isMsg);
	if (appCtxt.get(ZmSetting.FILTERS_ENABLED)) {
		parent.enable(ZmOperation.ADD_FILTER_RULE, isMsg);
	}
	parent.enable(ZmOperation.DETACH, isMsg && !isDraft);
};

// top level view means this view is allowed to get shown when user clicks on 
// app icon in app toolbar - overload to not allow this.
ZmDoublePaneController.prototype._isTopLevelView = 
function() {
	return true;
};

// All items in the list view are gone - show "No Results" and clear reading pane
ZmDoublePaneController.prototype._handleEmptyList =
function(listView) {
	ZmMailListController.prototype._handleEmptyList.apply(this, arguments);
	this.reset();
};

// List listeners

// Clicking on a message in the message list loads and displays it.
ZmDoublePaneController.prototype._listSelectionListener =
function(ev) {
	ZmMailListController.prototype._listSelectionListener.call(this, ev);
	
	var currView = this._listView[this._currentView];

	if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		var item = ev.item;
		if (!item) { return; }
		var div = Dwt.findAncestor(ev.target, "_itemIndex");
		this._mailListView._itemSelected(div, ev);

		if (appCtxt.get(ZmSetting.SHOW_SELECTION_CHECKBOX)) {
			this._mailListView.setSelectionHdrCbox(false);
		}

		var respCallback = new AjxCallback(this, this._handleResponseListSelectionListener, item);
		if (item.isDraft) {
			this._doAction({ev:ev, action:ZmOperation.DRAFT});
			return true;
		} else if (appCtxt.get(ZmSetting.OPEN_MAIL_IN_NEW_WIN)) {
			this._detachListener(null, respCallback);
			return true;
		} else {
			return false;
		}
	} else {
		if (this._readingPaneOn) {
			// Give the user a chance to zip around the list view via shortcuts without having to
			// wait for each successively selected msg to load, by waiting briefly for more list
			// selection shortcut actions. An event will have the 'ersatz' property set if it's
			// the result of a shortcut.
			if (ev.kbNavEvent && ZmDoublePaneController.LIST_SELECTION_SHORTCUT_DELAY) {
				if (this._listSelectionShortcutDelayActionId) {
					AjxTimedAction.cancelAction(this._listSelectionShortcutDelayActionId);
				}
				this._listSelectionShortcutDelayActionId = AjxTimedAction.scheduleAction(this._listSelectionShortcutDelayAction,
																						 ZmDoublePaneController.LIST_SELECTION_SHORTCUT_DELAY);
			} else {
				this._setSelectedItem();
			}
	    } else {
			var msg = currView.getSelection()[0];
			if (msg) {
				this._doublePaneView.resetMsg(msg);
			}
	    }
    }
	DBG.timePt("***** CONV: msg selection");
};

ZmDoublePaneController.prototype._handleResponseListSelectionListener =
function(item) {
	if (item.type == ZmItem.MSG && item._loaded && item.isUnread) {
		this._list.markRead([item], true);
	}
	// make sure correct msg is displayed in msg pane when user returns
	this._setSelectedItem();
};

ZmDoublePaneController.prototype._listSelectionTimedAction =
function() {
	if (this._listSelectionShortcutDelayActionId) {
		AjxTimedAction.cancelAction(this._listSelectionShortcutDelayActionId);
	}
	this._setSelectedItem();
};

ZmDoublePaneController.prototype._setSelectedItem =
function() {
	var selCnt = this._listView[this._currentView].getSelectionCount();
	if (selCnt == 1) {
		var respCallback = new AjxCallback(this, this._handleResponseSetSelectedItem);
		this._getLoadedMsg(null, respCallback);
	}
};

ZmDoublePaneController.prototype._handleResponseSetSelectedItem =
function(msg) {
	this._displayMsg(msg);
};

ZmDoublePaneController.prototype._listActionListener =
function(ev) {
	ZmMailListController.prototype._listActionListener.call(this, ev);

	if (!this._readingPaneOn) {
		// reset current message
		var msg = this._listView[this._currentView].getSelection()[0];
		if (msg) {
			this._doublePaneView.resetMsg(msg);
		}
	}
};

ZmDoublePaneController.prototype._showOrigListener = 
function(ev) {
	var msg = this._getMsg();
	if (!msg) { return; }

	var msgFetchUrl = appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI) + "&id=" + msg.id;
	// create a new window w/ generated msg based on msg id
	window.open(msgFetchUrl, "_blank", "menubar=yes,resizable=yes,scrollbars=yes");
};

ZmDoublePaneController.prototype._filterListener = 
function(ev) {
	var respCallback = new AjxCallback(this, this._handleResponseFilterListener);
	var msg = this._getLoadedMsg(null, respCallback);
};

ZmDoublePaneController.prototype._handleResponseFilterListener = 
function(msg) {
	if (!msg) { return; }
	
	AjxDispatcher.require(["PreferencesCore", "Preferences"]);
	var rule = new ZmFilterRule();
	var from = msg.getAddress(AjxEmailAddress.FROM);
	if (from) {
		rule.addCondition(new ZmCondition(ZmFilterRule.C_FROM, ZmFilterRule.OP_CONTAINS, from.address));
	}
	var to = msg.getAddress(AjxEmailAddress.TO);
	if (to)	{
		rule.addCondition(new ZmCondition(ZmFilterRule.C_TO, ZmFilterRule.OP_CONTAINS, to.address));
	}
	var cc = msg.getAddress(AjxEmailAddress.CC);
	if (cc)	{
		rule.addCondition(new ZmCondition(ZmFilterRule.C_CC, ZmFilterRule.OP_CONTAINS, cc.address));
	}
	var subj = msg.subject;
	if (subj) {
		rule.addCondition(new ZmCondition(ZmFilterRule.C_SUBJECT, ZmFilterRule.OP_IS, subj));
	}
	rule.addAction(new ZmAction(ZmFilterRule.A_KEEP));
	var dialog = appCtxt.getFilterRuleDialog();
	dialog.popup(rule);
};

ZmDoublePaneController.prototype._dragListener =
function(ev) {
	ZmListController.prototype._dragListener.call(this, ev);
	if (ev.action == DwtDragEvent.DRAG_END) {
		this._resetOperations(this._toolbar[this._currentView], this._doublePaneView.getSelection().length);
	}
};

ZmDoublePaneController.prototype._draftSaved =
function(msg) {
	appCtxt.cacheSet(msg.id, msg);
	this._redrawDraftItemRows(msg);
	var displayedMsg = this._doublePaneView.getMsg();
	if (displayedMsg && displayedMsg.id == msg.id) {
		this._doublePaneView.reset();
		this._doublePaneView.setMsg(msg);
	}
};

ZmDoublePaneController.prototype._redrawDraftItemRows =
function(msg) {
	this._listView[this._currentView].redrawItem(msg);
	this._listView[this._currentView].setSelection(msg, true);
};
