/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
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
 * @param {DwtControl}					container					the containing shell
 * @param {ZmApp}						mailApp						the containing application
 * @param {constant}					type						type of controller
 * @param {string}						sessionId					the session id
 * @param {ZmSearchResultsController}	searchResultsController		containing controller
 * 
 * @extends		ZmMailListController
 */
ZmDoublePaneController = function(container, mailApp, type, sessionId, searchResultsController) {

	if (arguments.length == 0) { return; }

	ZmMailListController.apply(this, arguments);

	if (this.supportsDnD()) {
		this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
		this._dragSrc.addDragListener(this._dragListener.bind(this));
	}
	
	this._listSelectionShortcutDelayAction = new AjxTimedAction(this, this._listSelectionTimedAction);
	this._listeners[ZmOperation.KEEP_READING] = this._keepReadingListener.bind(this);
};

ZmDoublePaneController.prototype = new ZmMailListController;
ZmDoublePaneController.prototype.constructor = ZmDoublePaneController;

ZmDoublePaneController.prototype.isZmDoublePaneController = true;
ZmDoublePaneController.prototype.toString = function() { return "ZmDoublePaneController"; };

ZmDoublePaneController.LIST_SELECTION_SHORTCUT_DELAY = 300;

ZmDoublePaneController.RP_IDS = [ZmSetting.RP_BOTTOM, ZmSetting.RP_RIGHT, ZmSetting.RP_OFF];

ZmDoublePaneController.DEFAULT_TAB_TEXT = ZmMsg.conversation;

/**
 * Displays the given list of mail items in a two-pane view where one pane shows the list
 * and the other shows the currently selected mail item (msg or conv). This method takes
 * care of displaying the list. Displaying an item is typically handled via selection.
 *
 * @param {ZmSearchResults}	results		the current search results
 * @param {ZmMailList}		mailList	list of mail items
 * @param {AjxCallback}		callback	the client callback
 * @param {Boolean}			markRead	if <code>true</code>, mark msg read
 * 
 */
ZmDoublePaneController.prototype.show =
function(results, mailList, callback, markRead) {

	ZmMailListController.prototype.show.call(this, results);
	
	var mlv = this._listView[this._currentViewId];

	// if search was run as a result of a <refresh> block rather than by the user, preserve
	// what's in the reading pane as long as it's still in the list of results
	var s = results && results.search;
	var isRefresh = s && (s.isRefresh || s.isRedo);
	var refreshSelItem = (isRefresh && mlv && mlv.hasItem(s.selectedItem) && s.selectedItem);
	if (this._doublePaneView) {
		if (!refreshSelItem) {
			this._doublePaneView._itemView.reset();
		}
	}
	this.setList(mailList);
	this._setup(this._currentViewId);
	mlv = this._listView[this._currentViewId]; //might have been created in the _setup call
	mlv.reset(); //called to reset the groups (in case "group by" is used, to clear possible previous items in it - bug 77154

	this._displayResults(this._currentViewId, null, refreshSelItem);

	if (refreshSelItem) {
		mlv.setSelection(refreshSelItem, true);
		this._resetOperations(this._toolbar[this._currentViewId], 1)
	}
	else {
		var dpv = this._doublePaneView;
		var readingPaneOn = this.isReadingPaneOn();
		if (dpv.isReadingPaneVisible() != readingPaneOn) {
			dpv.setReadingPane();
		}
		// clear the item view, unless it's showing something selected
		if (!this._itemViewCurrent()) {
			dpv.clearItem();
		}
	}

	if (callback) {
		callback.run();
	}
};

// returns true if the item shown in the reading pane is selected in the list view
ZmDoublePaneController.prototype._itemViewCurrent =
function() {

	var dpv = this._doublePaneView;
	var mlv = dpv._mailListView;
	mlv._restoreState();
	var item = dpv.getItem();
	if (item) {
		var sel = mlv.getSelection();
		for (var i = 0, len = sel.length; i < len; i++) {
			var listItem = sel[i];
			if (listItem.id == item.id) {
				return true;
			}
		}
	}
	return false;
};

ZmDoublePaneController.prototype.switchView =
function(view, force) {
	if (view === ZmSetting.RP_OFF || view === ZmSetting.RP_BOTTOM || view === ZmSetting.RP_RIGHT) {
		this._mailListView._colHeaderActionMenu = null;
		var oldView = this._getReadingPanePref();
		if (view !== oldView) {
			var convView = this._convView;
			if (convView) {
				var replyView = convView._replyView;
				if (replyView && view === ZmSetting.RP_OFF) {
					// reset the replyView with the warning before turning off the pane
					if (!force && !convView._controller.popShield(null, this.switchView.bind(this, view, true))) {
						// redo setChecked on the oldView menu item if user cancels
						this._readingPaneViewMenu.getMenuItem(oldView)._setChecked(true);
						return;
					}
					this._readingPaneViewMenu.getMenuItem(view)._setChecked(true);
					replyView.reset();
				}
			}
			this._setReadingPanePref(view);
			this._doublePaneView.setReadingPane(true);
			if (replyView && view !== ZmSetting.RP_OFF) {
				replyView._resized();
			}
		}
	} else {
		ZmMailListController.prototype.switchView.apply(this, arguments);
	}
	this._resetNavToolBarButtons();
};

/**
 * Clears the conversation view, which actually just clears the message view.
 */
ZmDoublePaneController.prototype.reset =
function() {
	if (this._doublePaneView) {
		this._doublePaneView.reset();
	}
	var lv = this._listView[this._currentViewId];
	if (lv) {
		lv._itemToSelect = lv._selectedItem = null;
	}
};

ZmDoublePaneController.prototype._handleResponseSwitchView =
function(item) {
	this._doublePaneView.setItem(item);
};

// called after a delete has occurred. 
// Return value indicates whether view was popped as a result of a delete
ZmDoublePaneController.prototype.handleDelete = 
function() {
	return false;
};

ZmDoublePaneController.prototype.handleKeyAction =
function(actionCode, ev) {

	DBG.println(AjxDebug.DBG3, "ZmDoublePaneController.handleKeyAction");
	var lv = this._listView[this._currentViewId];

	switch (actionCode) {

		case DwtKeyMap.SELECT_NEXT:
		case DwtKeyMap.SELECT_PREV:
			if (lv) {
				return lv.handleKeyAction(actionCode, ev);
			}
			break;

		default:
			return ZmMailListController.prototype.handleKeyAction.apply(this, arguments);
	}
	return true;
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
		dpv.addInviteReplyListener(this._inviteReplyListener);
		dpv.addShareListener(this._shareListener);
		dpv.addSubscribeListener(this._subscribeListener);
	}

	ZmMailListController.prototype._initialize.call(this, view);
};

ZmDoublePaneController.prototype._initializeNavToolBar =
function(view) {
	var toolbar = this._toolbar[view];
	this._itemCountText[ZmSetting.RP_BOTTOM] = toolbar.getButton(ZmOperation.TEXT);
	if (AjxEnv.isFirefox) {
		this._itemCountText[ZmSetting.RP_BOTTOM].setScrollStyle(Dwt.CLIP);
	}
};

ZmDoublePaneController.prototype._getRightSideToolBarOps =
function() {
	var list = [];
	if (appCtxt.isChildWindow) {
		return list;
	}
	list.push(ZmOperation.KEEP_READING);
	list.push(ZmOperation.VIEW_MENU);
	return list;
};

ZmDoublePaneController.prototype._getActionMenuOps =
function() {
	var list = [];
	list = list.concat(this._msgOps());
	list.push(ZmOperation.SEP);
	list = list.concat(this._deleteOps());
	list.push(ZmOperation.SEP);
	list = list.concat(this._standardActionMenuOps());
	list.push(ZmOperation.SEP);
	list = list.concat(this._flagOps());
	list.push(ZmOperation.SEP);
    list.push(ZmOperation.REDIRECT);
    list.push(ZmOperation.EDIT_AS_NEW);		// bug #28717
	list.push(ZmOperation.SEP);
	list = list.concat(this._createOps());
	list.push(ZmOperation.SEP);
	list = list.concat(this._otherOps());
	if (this.getCurrentViewType() == ZmId.VIEW_TRAD) {
		list.push(ZmOperation.SHOW_CONV);
	}
    //list.push(ZmOperation.QUICK_COMMANDS);
	return list;
};

// Returns the already-created message list view.
ZmDoublePaneController.prototype._createNewView = 
function() {
	if (this._mailListView && this._dragSrc) {
		this._mailListView.setDragSource(this._dragSrc);
	}
	return this._mailListView;
};

/**
 * Returns the double-pane view.
 * 
 * @return {ZmDoublePaneView}	double-pane view
 */
ZmDoublePaneController.prototype.getCurrentView = 
function() {
	return this._doublePaneView;
};
ZmDoublePaneController.prototype.getReferenceView = ZmDoublePaneController.prototype.getCurrentView;

/**
 * Returns the item view.
 * 
 * @return {ZmMailItemView}	item view
 */
ZmDoublePaneController.prototype.getItemView = 
function() {
	return this._doublePaneView && this._doublePaneView._itemView;
};

ZmDoublePaneController.prototype._getTagMenuMsg = 
function(num) {
	return AjxMessageFormat.format(ZmMsg.tagMessages, num);
};

ZmDoublePaneController.prototype._getMoveDialogTitle = 
function(num) {
	return AjxMessageFormat.format(ZmMsg.moveMessages, num);
};

// Add reading pane to focus ring
ZmDoublePaneController.prototype._initializeTabGroup =
function(view) {
	if (this._tabGroups[view]) { return; }

	ZmListController.prototype._initializeTabGroup.apply(this, arguments);

	if (this._view[view] !== this.getItemView()) {
		this._tabGroups[view].addMember(this.getItemView().getTabGroupMember());
	}
};

ZmDoublePaneController.prototype._setViewContents =
function(view) {
	this._doublePaneView.setList(this._list);
};

ZmDoublePaneController.prototype._displayItem =
function(item) {

	if (!item._loaded) { return; }

	// cancel timed mark read action on previous msg
	appCtxt.killMarkReadTimer();

	this._doublePaneView.setItem(item);
	this._handleMarkRead(item);
	this._curItem = item;
};
ZmDoublePaneController.prototype._displayMsg = ZmDoublePaneController.prototype._displayItem;


ZmDoublePaneController.prototype._markReadAction =
function(msg) {
	this._doMarkRead([msg], true);
};

ZmDoublePaneController.prototype._preHideCallback =
function() {
	// cancel timed mark read action on view change
	appCtxt.killMarkReadTimer();
	return ZmController.prototype._preHideCallback.call(this);
};

// Adds a "Reading Pane" menu to the View menu
ZmDoublePaneController.prototype._setupReadingPaneMenu =
function(view, menu) {

	var readingPaneMenuItem = menu.createMenuItem(Dwt.getNextId("READING_PANE_"), {
			text:   ZmMsg.readingPane,
			style:  DwtMenuItem.NO_STYLE
		}),
		readingPaneMenu = new ZmPopupMenu(readingPaneMenuItem);

	var miParams = {
		text:           ZmMsg.readingPaneAtBottom,
		style:          DwtMenuItem.RADIO_STYLE,
		radioGroupId:   "RP"
	};
	var ids = ZmDoublePaneController.RP_IDS;
	var pref = this._getReadingPanePref();
	for (var i = 0; i < ids.length; i++) {
		var id = ids[i];
		if (!readingPaneMenu._menuItems[id]) {
			miParams.text = ZmMailListController.READING_PANE_TEXT[id];
			miParams.image = ZmMailListController.READING_PANE_ICON[id];
			var mi = readingPaneMenu.createMenuItem(id, miParams);
			mi.setData(ZmOperation.MENUITEM_ID, id);
			mi.addSelectionListener(this._listeners[ZmOperation.VIEW]);
			if (id == pref) {
				mi.setChecked(true, true);
			}
		}
	}

	readingPaneMenuItem.setMenu(readingPaneMenu);

	return readingPaneMenu;
};

ZmDoublePaneController.prototype._displayResults =
function(view, newTab, refreshSelItem) {

	var elements = this.getViewElements(view, this._doublePaneView);
	
	if (!refreshSelItem) {
		this._doublePaneView.setReadingPane();
	}

	var tabId = newTab && Dwt.getNextId();
	this._setView({ view:		view,
					noPush:		this.isSearchResults,
					viewType:	this._currentViewType,
					elements:	elements,
					hide:		this._elementsToHide,
					tabParams:	newTab && this._getTabParams(tabId, this._tabCallback.bind(this)),
					isAppView:	this._isTopLevelView()});
	if (this.isSearchResults) {
		// if we are switching views, make sure app view mgr is up to date on search view's components
		appCtxt.getAppViewMgr().setViewComponents(this.searchResultsController.getCurrentViewId(), elements, true);
	}
	this._resetNavToolBarButtons(view);

	if (newTab) {
		var buttonText = (this._conv && this._conv.subject) ? this._conv.subject.substr(0, ZmAppViewMgr.TAB_BUTTON_MAX_TEXT) : ZmDoublePaneController.DEFAULT_TAB_TEXT;
		var avm = appCtxt.getAppViewMgr();
		avm.setTabTitle(view, buttonText);
	}
				
	// always allow derived classes to reset size after loading
	var sz = this._doublePaneView.getSize();
	this._doublePaneView._resetSize(sz.x, sz.y);
};

ZmDoublePaneController.prototype._getTabParams =
function(tabId, tabCallback) {
	return {
		id:				tabId,
		image:			"ConvView",
		textPrecedence:	85,
		tooltip:		ZmDoublePaneController.DEFAULT_TAB_TEXT,
		tabCallback:	tabCallback
	};
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
 * 
 * @private
 */
ZmDoublePaneController.prototype._doGetMsg =
function(msg) {
	if (!msg) { return; }
	if (msg.id == this._pendingMsg) { return; }

	msg._loadPending = true;
	this._pendingMsg = msg.id;
	var respCallback = new AjxCallback(this, this._handleResponseDoGetMsg, msg);
	msg.load({callback:respCallback, noBusyOverlay:true});
};

ZmDoublePaneController.prototype._handleResponseDoGetMsg =
function(msg) {
	if (this._pendingMsg && (msg.id != this._pendingMsg)) { return; }
	msg._loadPending = false;
	this._pendingMsg = null;
	this._doublePaneView.setItem(msg);
};

ZmDoublePaneController.prototype._resetOperations =
function(parent, num) {
	ZmMailListController.prototype._resetOperations.call(this, parent, num);
	var isDraft = this.isDraftsFolder();
	if (num == 1) {
		var item = this._mailListView.getSelection()[0];
		if (item) {
			isDraft = item.isDraft;
		}
		parent.enable(ZmOperation.SHOW_ORIG, true);
		if (appCtxt.get(ZmSetting.FILTERS_ENABLED)) {
			var isSyncFailuresFolder = this.isSyncFailuresFolder();
			parent.enable(ZmOperation.ADD_FILTER_RULE, !isSyncFailuresFolder);
		}
	}

	parent.enable(ZmOperation.DETACH, (appCtxt.get(ZmSetting.DETACH_MAILVIEW_ENABLED) && num == 1 && !isDraft));
	parent.enable(ZmOperation.TEXT, true);
	parent.enable(ZmOperation.KEEP_READING, this._keepReading(true));

	if (appCtxt.isWebClientOffline()) {
		parent.enable(
			[
				ZmOperation.ACTIONS_MENU,
				ZmOperation.VIEW_MENU,
				ZmOperation.DETACH,
				ZmOperation.SHOW_ORIG,
				ZmOperation.SHOW_CONV,
				ZmOperation.PRINT,
				ZmOperation.ADD_FILTER_RULE,
				ZmOperation.CREATE_APPT,
				ZmOperation.CREATE_TASK,
				ZmOperation.CONTACT,
				ZmOperation.REDIRECT
			],
			false
		);
	}
};

ZmDoublePaneController.prototype._resetOperation = 
function(parent, op, num) {
	if (parent && op == ZmOperation.KEEP_READING) {
		parent.enable(ZmOperation.KEEP_READING, this._keepReading(true));
	}
};

// top level view means this view is allowed to get shown when user clicks on 
// app icon in app toolbar - overload to not allow this.
ZmDoublePaneController.prototype._isTopLevelView = 
function() {
	var sessionId = this.getSessionId();
	return (!sessionId || (sessionId == ZmApp.MAIN_SESSION));
};

// All items in the list view are gone - show "No Results" and clear reading pane
ZmDoublePaneController.prototype._handleEmptyList =
function(listView) {
	this.reset();
	ZmMailListController.prototype._handleEmptyList.apply(this, arguments);
};

// List listeners

// Clicking on a message in the message list loads and displays it.
ZmDoublePaneController.prototype._listSelectionListener =
function(ev) {

	var handled = ZmMailListController.prototype._listSelectionListener.call(this, ev);
	
	var currView = this._listView[this._currentViewId];

	if (!handled && ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		var item = ev.item;
		if (!item) { return; }

		var cs = appCtxt.isOffline && appCtxt.getCurrentSearch();
		if (cs && cs.isMultiAccount()) {
			appCtxt.accountList.setActiveAccount(item.getAccount());
		}

		var div = this._mailListView.getTargetItemDiv(ev);
		this._mailListView._itemSelected(div, ev);

		if (appCtxt.get(ZmSetting.SHOW_SELECTION_CHECKBOX)) {
			this._mailListView.setSelectionHdrCbox(false);
		}

		var respCallback = new AjxCallback(this, this._handleResponseListSelectionListener, item);
		var folder = appCtxt.getById(item.getFolderId());
		if (item.isDraft && folder && folder.id == ZmFolder.ID_DRAFTS && (!folder || !folder.isReadOnly())) {
			this._doAction({ev:ev, action:ZmOperation.DRAFT});
			return true;
		} else if (appCtxt.get(ZmSetting.OPEN_MAIL_IN_NEW_WIN)) {
			this._detachListener(null, respCallback);
			return true;
		} else {
			var respCallback =
				this._handleResponseListSelectionListener.bind(this, item);
			var ctlr =
				AjxDispatcher.run(item.type === ZmItem.CONV ?
				                  "GetConvController" : "GetMsgController",
				                  item.nId);
			ctlr.show(item, this, respCallback, true);
			return true;
		}
	} else if (!handled) {
		if (this.isReadingPaneOn()) {
			// Give the user a chance to zip around the list view via shortcuts without having to
			// wait for each successively selected msg to load, by waiting briefly for more list
			// selection shortcut actions. An event will have the 'kbNavEvent' property set if it's
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
			return true;
		} else {
			var msg = currView.getSelection()[0];
			if (msg) {
				this._doublePaneView.resetMsg(msg);
			}
		}
	}

	return handled;
};

ZmDoublePaneController.prototype._handleResponseListSelectionListener =
function(item) {
	if (item.type == ZmItem.MSG && item._loaded && item.isUnread &&
		(appCtxt.get(ZmSetting.MARK_MSG_READ) == ZmSetting.MARK_READ_NOW)) {

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

/**
 * Handles selection of a row by loading the item.
 * 
 * @param {hash}	params		params for loading the item
 * 
 * @private
 */
ZmDoublePaneController.prototype._setSelectedItem =
function(params) {
	var selCnt = this._listView[this._currentViewId].getSelectionCount();
	if (selCnt == 1) {
		var respCallback = this._handleResponseSetSelectedItem.bind(this);
		this._getLoadedMsg(params, respCallback);
	}
};

ZmDoublePaneController.prototype._handleResponseSetSelectedItem =
function(msg) {

	if (msg) {
		// bug 41196
		if (appCtxt.isOffline) {
			// clear the new-mail badge every time user reads a msg regardless
			// of number of unread messages across all accounts
			this._app.clearNewMailBadge();

			// offline mode, reset new mail notifier if user reads a msg from that account
			var acct = msg.getAccount();

			// bug: 46873 - set active account when user clicks on item w/in cross-account search
			var cs = appCtxt.getCurrentSearch();
			if (cs && cs.isMultiAccount()) {
				var active = acct || appCtxt.accountList.defaultAccount
				appCtxt.accountList.setActiveAccount(active);
			}

			if (acct && acct.inNewMailMode) {
				acct.inNewMailMode = false;
				var allContainers = appCtxt.getOverviewController()._overviewContainer;
				for (var i in allContainers) {
					allContainers[i].updateAccountInfo(acct, true, true);
				}
			}
		}

		if (!this.isReadingPaneOn()) {
			return;
		}
		// make sure list view has this msg
		var lv = this._listView[this._currentViewId];
		var id = (lv.type == ZmItem.CONV && msg.type == ZmItem.MSG) ? msg.cid : msg.id;
		if (lv.hasItem(id)) {
			this._displayMsg(msg);
		}
	}
};

ZmDoublePaneController.prototype._listActionListener =
function(ev) {
	ZmMailListController.prototype._listActionListener.call(this, ev);

	if (!this.isReadingPaneOn()) {
		// reset current message
		var msg = this._listView[this._currentViewId].getSelection()[0];
		if (msg) {
			this._doublePaneView.resetMsg(msg);
		}
	}
};

ZmDoublePaneController.prototype._doDelete =
function(items, hardDelete, attrs, confirmDelete) {
	this._listView[this._currentViewId]._itemToSelect = this._getNextItemToSelect();
	ZmMailListController.prototype._doDelete.apply(this, arguments);
};

ZmDoublePaneController.prototype._doMove =
function(items, destinationFolder, attrs, isShiftKey) {

	// if user moves a non-selected item via DnD, don't change selection
	var dndUnselectedItem = false;
	if (items && items.length == 1) {
		var lv = this.getListView();
		var selection = lv && lv.getSelection();
		if (selection && selection.length) {
			dndUnselectedItem = true;
			var moveItem = items[0];
			var id = moveItem.id;
			var msgIdMap = {};
			var numSelectedInConv = 0;
			if ((moveItem.type === ZmId.ITEM_CONV) && moveItem.msgIds) {
				// If the moved item is a conversation, we need to check whether the selected items are all messages
				// within the conversation.  Create a hash for more efficient testing.
				for (var i = 0; i < moveItem.msgIds.length; i++) {
					msgIdMap[moveItem.msgIds[i]] = true;
				}
			}
			// AjxUtil.intersection doesn't work with objects, so check IDs
			for (var i = 0; i < selection.length; i++) {
				if (selection[i].id == id) {
					dndUnselectedItem = false;
				}
				if (msgIdMap[selection[i].id]) {
					numSelectedInConv++;
				}
			}
			if (numSelectedInConv == selection.length) {
				// All the selected items are messages within a moved conversation, use the normal getNextItemToSelect
				dndUnselectedItem = false;
			}
		}
	}		
	if (!dndUnselectedItem) {
		this._listView[this._currentViewId]._itemToSelect = this._getNextItemToSelect();
	}
	ZmMailListController.prototype._doMove.apply(this, arguments);
};

ZmDoublePaneController.prototype._keepReadingListener =
function(ev) {
	this.handleKeyAction(ZmKeyMap.KEEP_READING, ev);
};

ZmDoublePaneController.prototype._keepReading = function(ev) {};

// Set enabled state of the KEEP_READING button
ZmDoublePaneController.prototype._checkKeepReading =
function() {
	// done on timer so item view has had change to lay out and resize
	setTimeout(this._resetOperation.bind(this, this._toolbar[this._currentViewId], ZmOperation.KEEP_READING), 250);
};

ZmDoublePaneController.handleScroll =
function(ev) {
	var target = DwtUiEvent.getTarget(ev);
	var messagesView = DwtControl.findControl(target);
	var controller = messagesView && messagesView._controller;
	if (controller && controller._checkKeepReading) {
		controller._checkKeepReading();
	}
};

ZmDoublePaneController.prototype._dragListener =
function(ev) {
	ZmListController.prototype._dragListener.call(this, ev);
	if (ev.action == DwtDragEvent.DRAG_END) {
		this._resetOperations(this._toolbar[this._currentViewId], this._doublePaneView.getSelection().length);
	}
};

ZmDoublePaneController.prototype._draftSaved =
function(msg, resp) {
	if (resp) {
		if (!msg) {
			msg = new ZmMailMsg();
		}
		msg._loadFromDom(resp);
	}
	appCtxt.cacheSet(msg.id, msg);
	this._redrawDraftItemRows(msg);
	var displayedMsg = this._doublePaneView.getMsg();
	if (displayedMsg && displayedMsg.id == msg.id) {
		this._doublePaneView.reset();
		this._doublePaneView.setItem(msg, null, true);
	}
};

ZmDoublePaneController.prototype._redrawDraftItemRows =
function(msg) {
	this._listView[this._currentViewId].redrawItem(msg);
	this._listView[this._currentViewId].setSelection(msg, true);
};

ZmDoublePaneController.prototype.selectFirstItem =
function() {
	this._doublePaneView._selectFirstItem();
};

ZmDoublePaneController.prototype._getDefaultFocusItem =
function() {
	return this.getListView();
};

/**
 * Returns the item that should be selected after a move/delete. Finds
 * the first non-selected item after the first selected item.
 *
 * @param	{hash}		omit		hash of item IDs to exclude from being next selected item
 */
ZmDoublePaneController.prototype._getNextItemToSelect =
function(omit) {

	omit = omit || {};
	var listView = this._listView[this._currentViewId];
	var numSelected = listView.getSelectionCount();
	if (numSelected) {
		var selection = listView.getSelection();
		var selIds = {};
		for (var i = 0; i < selection.length; i++) {
			selIds[selection[i].id] = true;
		}
		var setting = appCtxt.get(ZmSetting.SELECT_AFTER_DELETE);
		var goingUp = (setting == ZmSetting.DELETE_SELECT_PREV || (setting == ZmSetting.DELETE_SELECT_ADAPT &&
						(this.lastListAction == DwtKeyMap.SELECT_PREV || this.lastListAction == ZmKeyMap.PREV_UNREAD)));
		if (goingUp && (numSelected == 1)) {
			var idx = listView._getRowIndex(selection[selection.length - 1]);
			var childNodes = listView._parentEl.childNodes;
			for (var i = idx - 1; i >= 0; i--) {
				var item = listView.getItemFromElement(childNodes[i]);
				if (item && !selIds[item.id] && !omit[item.id] && !(item.cid && (selIds[item.cid] || omit[item.cid]))) {
					return item;
				}
			}
			return ZmMailListView.FIRST_ITEM;
		} else {
			var idx = listView._getRowIndex(selection[0]);
			var childNodes = listView._parentEl.childNodes;
			for (var i = idx + 1; i < childNodes.length; i++) {
				var item = listView.getItemFromElement(childNodes[i]);
				if (item && !selIds[item.id] && !omit[item.id] && !(item.cid && (selIds[item.cid] || omit[item.cid]))) {
					return item;
				}
			}
			return ZmMailListView.LAST_ITEM;
		}
	}
	return ZmMailListView.FIRST_ITEM;	
};

ZmDoublePaneController.prototype._setItemCountText =
function(text) {

	text = text || this._getItemCountText();

	var rpr = (this._getReadingPanePref() == ZmSetting.RP_RIGHT);
	if (this._itemCountText[ZmSetting.RP_RIGHT]) {
		this._itemCountText[ZmSetting.RP_RIGHT].setText(rpr ? text : "");
	}
	if (this._itemCountText[ZmSetting.RP_BOTTOM]) {
		this._itemCountText[ZmSetting.RP_BOTTOM].setText(rpr ? "" : text);
	}
};

ZmDoublePaneController.prototype._postShowCallback =
function() {

	ZmMailListController.prototype._postShowCallback.apply(this, arguments);
	var dpv = this._doublePaneView;
	if (dpv && dpv.isStale && dpv._staleHandler) {
		dpv._staleHandler();
	}
};
