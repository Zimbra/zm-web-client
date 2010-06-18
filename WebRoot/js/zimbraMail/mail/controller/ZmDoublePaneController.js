/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * Creates a new, empty double pane controller.
 * @constructor
 * @class
 * This class manages the two-pane view. The top pane contains a list view of 
 * items, and the bottom pane contains the selected item content.
 *
 * @author Parag Shah
 * 
 * @param {ZmComposite}	container	the containing shell
 * @param {ZmMailApp}	mailApp			the containing app
 * 
 * @extends		ZmMailListController
 */
ZmDoublePaneController = function(container, mailApp) {

	if (arguments.length == 0) { return; }
	ZmMailListController.call(this, container, mailApp);

	this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
	this._dragSrc.addDragListener(new AjxListener(this, this._dragListener));	
	
	this._listeners[ZmOperation.SHOW_ORIG] = new AjxListener(this, this._showOrigListener);
	this._listeners[ZmOperation.ADD_FILTER_RULE] = new AjxListener(this, this._filterListener);
	this._listeners[ZmOperation.CREATE_APPT] = new AjxListener(this, this._createApptListener);
	this._listeners[ZmOperation.CREATE_TASK] = new AjxListener(this, this._createTaskListener);

	this._listSelectionShortcutDelayAction = new AjxTimedAction(this, this._listSelectionTimedAction);
};

ZmDoublePaneController.prototype = new ZmMailListController;
ZmDoublePaneController.prototype.constructor = ZmDoublePaneController;

ZmDoublePaneController.LIST_SELECTION_SHORTCUT_DELAY = 300;

ZmDoublePaneController.RP_IDS = [ZmSetting.RP_BOTTOM, ZmSetting.RP_RIGHT, ZmSetting.RP_OFF];

// Public methods

ZmDoublePaneController.prototype.toString = 
function() {
	return "ZmDoublePaneController";
};

/**
 * Displays the given item in a two-pane view. The view is actually
 * created in _loadItem(), since it must execute last.
 *
 * @param {ZmSearch}	search	the current search results
 * @param {ZmItem}	item		a generic item
 * @param {AjxCallback}	callback	the client callback
 * @param {Boolean}	markRead	if <code>true</code>, mark msg read
 * 
 */
ZmDoublePaneController.prototype.show =
function(search, item, callback, markRead) {

	ZmMailListController.prototype.show.call(this, search);

	if (this._doublePaneView) {
		var mlv = this._doublePaneView._mailListView;
		mlv._saveState({scroll:false});
		mlv.reset();
	}
	this._item = item;
	this._setup(this._currentView);

	// see if we have it cached? Check if conv loaded?
	var respCallback = new AjxCallback(this, this._handleResponseShow, [item, callback]);
	this._loadItem(item, this._currentView, respCallback, markRead);
	this._toolbar[this._currentView].adjustSize();
};

ZmDoublePaneController.prototype._handleResponseShow =
function(item, callback, results) {

	if (callback) {
		callback.run();
	}

	var dpv = this._doublePaneView;
	var readingPaneOn = this.isReadingPaneOn();
	if (dpv.isMsgViewVisible() != readingPaneOn) {
		dpv.setReadingPane();
	}

	// clear the msg view, unless it's showing something selected
	var clearMsgView = true;
	var mlv = dpv._mailListView;
	mlv._restoreState();
	var msg = dpv.getMsg();
	if (msg) {
		var sel = mlv.getSelection();
		for (var i = 0, len = sel.length; i < len; i++) {
			var item = sel[i];
			var m = (item.type == ZmItem.CONV) ? item.getFirstHotMsg() : item;
			if (m && m.id == msg.id) {
				clearMsgView = false;
				break;
			}
		}
	}
	if (clearMsgView) {
		dpv.setMsg();
	}
};

ZmDoublePaneController.prototype.switchView =
function(view, force) {
	if (view == ZmSetting.RP_OFF ||	view == ZmSetting.RP_BOTTOM || view == ZmSetting.RP_RIGHT) {
		this._mailListView._colHeaderActionMenu = null;
		if (view != this._getReadingPanePref()) {
			this._setReadingPanePref(view);
			this._doublePaneView.setReadingPane();
		}
	} else {
		ZmMailListController.prototype.switchView.apply(this, arguments);
	}
	this._resetNavToolBarButtons(this._currentView);
};

/**
 * Clears the conversation view, which actually just clears the message view.
 */
ZmDoublePaneController.prototype.reset =
function() {
	if (this._doublePaneView) {
		this._doublePaneView.reset();
	}
	var lv = this._listView[this._currentView];
	if (lv) {
		lv._itemToSelect = lv._selectedItem = null;
	}
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

ZmDoublePaneController.prototype.handleKeyAction =
function(actionCode) {

	DBG.println(AjxDebug.DBG3, "ZmDoublePaneController.handleKeyAction");
	var lv = this._listView[this._currentView];

	switch (actionCode) {

		case DwtKeyMap.SELECT_NEXT:
		case DwtKeyMap.SELECT_PREV:
			if (lv) {
				return lv.handleKeyAction(actionCode);
			}
			break;

		default:
			return ZmMailListController.prototype.handleKeyAction.call(this, actionCode);
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
	}

	ZmMailListController.prototype._initialize.call(this, view);
};

ZmDoublePaneController.prototype._initializeNavToolBar =
function(view) {
	this._toolbar[view].addOp(ZmOperation.TEXT);
	var text = this._itemCountText[ZmSetting.RP_BOTTOM] = this._toolbar[view].getButton(ZmOperation.TEXT);
	text.addClassName("itemCountText");
};

ZmDoublePaneController.prototype._getToolBarOps =
function() {
	var list = this._standardToolBarOps();
	list.push(ZmOperation.SEP);
	list = list.concat(this._msgOps());
	list.push(ZmOperation.EDIT,			// hidden except for Drafts
			  ZmOperation.SEP,
			  ZmOperation.SPAM,
			  ZmOperation.SEP,
			  ZmOperation.TAG_MENU);

	if (appCtxt.get(ZmSetting.DETACH_MAILVIEW_ENABLED)) {
		list.push(ZmOperation.SEP, ZmOperation.DETACH);
	}

    list.push(ZmOperation.SEP,ZmOperation.VIEW_MENU);
	return list;
};

ZmDoublePaneController.prototype._getActionMenuOps =
function() {
	var list = this._flagOps();
	list.push(ZmOperation.SEP);
	list = list.concat(this._msgOps());
	list.push(ZmOperation.EDIT);		// bug #28717
	list.push(ZmOperation.SEP);
	list = list.concat(this._standardActionMenuOps());
	list.push(ZmOperation.SEP);
	list.push(ZmOperation.SPAM);
	list.push(ZmOperation.SHOW_ORIG);
	if (appCtxt.get(ZmSetting.FILTERS_ENABLED)) {
		list.push(ZmOperation.ADD_FILTER_RULE);
	}
    if(appCtxt.get(ZmSetting.CALENDAR_ENABLED)) {
        list.push(ZmOperation.CREATE_APPT);
    }
    if(appCtxt.get(ZmSetting.TASKS_ENABLED)) {
        list.push(ZmOperation.CREATE_TASK);        
    }
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

// Add reading pane to focus ring
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

ZmDoublePaneController.prototype._displayMsg =
function(msg) {
	if (!msg._loaded) { return; }

	// cancel timed mark read action on previous msg
	if (appCtxt.markReadActionId > 0) {
		AjxTimedAction.cancelAction(appCtxt.markReadActionId);
		appCtxt.markReadActionId = -1;
	}

	this._doublePaneView.setMsg(msg);
	this._curMsg = msg;
	if (msg.isUnread) {
		var folder = appCtxt.getById(msg.folderId);
		var readOnly = folder ? folder.isReadOnly() : false;
		if (!readOnly) {
			var markRead = appCtxt.get(ZmSetting.MARK_MSG_READ);
			if (markRead == ZmSetting.MARK_READ_NOW) {
				// msg was cached, then marked unread
				this._doMarkRead([msg], true);
			} else if (markRead > 0) {
				if (!appCtxt.markReadAction) {
					appCtxt.markReadAction = new AjxTimedAction(this, this._markReadAction);
				}
				appCtxt.markReadAction.args = [ msg ];
				appCtxt.markReadActionId = AjxTimedAction.scheduleAction(appCtxt.markReadAction, markRead * 1000);
			}
		}
	}
};

ZmDoublePaneController.prototype._markReadAction =
function(msg) {
	this._doMarkRead([msg], true);
};

ZmDoublePaneController.prototype._preHideCallback =
function() {
	// cancel timed mark read action on view change
	if (appCtxt.markReadActionId > 0) {
		AjxTimedAction.cancelAction(appCtxt.markReadActionId);
		appCtxt.markReadActionId = -1;
	}
	return ZmController.prototype._preHideCallback.call(this);
};

// Adds a "Reading Pane" checked menu item to a view menu
ZmDoublePaneController.prototype._setupReadingPaneMenuItems =
function(view, menu, checked) {

	if (menu.getItemCount() > 0) {
		new DwtMenuItem({parent:menu, style:DwtMenuItem.SEPARATOR_STYLE});
	}

	var miParams = {text:ZmMsg.readingPaneAtBottom, style:DwtMenuItem.RADIO_STYLE, radioGroupId:"RP"};
	var ids = ZmDoublePaneController.RP_IDS;
	var pref = this._getReadingPanePref();
	for (var i = 0; i < ids.length; i++) {
		var id = ids[i];
		if (!menu._menuItems[id]) {
			miParams.text = ZmMailListController.READING_PANE_TEXT[id];
			miParams.image = ZmMailListController.READING_PANE_ICON[id];
			var mi = menu.createMenuItem(id, miParams);
			mi.setData(ZmOperation.MENUITEM_ID, id);
			mi.addSelectionListener(this._listeners[ZmOperation.VIEW]);
			if (id == pref) {
				mi.setChecked(true, true);
			}
		}
	}
};

/**
 * Displays a list of messages. If passed a conv, loads its message
 * list. If passed a list, simply displays it. The first message will be 
 * selected, which will trigger a message load/display.
 *
 * @param item		[ZmConv or ZmMailList]		conv or list of msgs
 * @param view		[constant]					owning view type
 * @param callback	[AjxCallback]*				client callback
 * @param markRead	[boolean]*					if true, mark msg read
 * 
 * @private
 */
ZmDoublePaneController.prototype._loadItem =
function(item, view, callback, markRead) {
	if (item instanceof ZmMailItem) { // conv
		var conv = item;
		DBG.timePt("***** CONV: load", true);
		if (!conv._loaded) {
			var respCallback = new AjxCallback(this, this._handleResponseLoadConv, [view, callback]);
			var getFirstMsg = this.isReadingPaneOn();
			markRead = markRead || (appCtxt.get(ZmSetting.MARK_MSG_READ) == ZmSetting.MARK_READ_NOW);
			conv.load({getFirstMsg:getFirstMsg, markRead:markRead}, respCallback);
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
	this._doublePaneView.setReadingPane();
	this._setView({view:view, elements:elements, isAppView:this._isTopLevelView()});
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
	this._doublePaneView.setMsg(msg);
};

ZmDoublePaneController.prototype._resetOperations = 
function(parent, num) {
	ZmMailListController.prototype._resetOperations.call(this, parent, num);
	var isMsg = false;
	var isDraft = false;
	if (num == 1) {
		var item = this._mailListView.getSelection()[0];
		if (item) {
			isMsg = (item.type == ZmItem.MSG || (item.numMsgs == 1));
			isDraft = item.isDraft;
		}
	}
	parent.enable(ZmOperation.SHOW_ORIG, isMsg);
	if (appCtxt.get(ZmSetting.FILTERS_ENABLED)) {
		var folder = this._getSearchFolder();
		var isSyncFailuresFolder = (folder && folder.nId == ZmOrganizer.ID_SYNC_FAILURES);
		parent.enable(ZmOperation.ADD_FILTER_RULE, isMsg && !isSyncFailuresFolder);
	}
	parent.enable(ZmOperation.DETACH, (appCtxt.get(ZmSetting.DETACH_MAILVIEW_ENABLED) && isMsg && !isDraft));
	parent.enable(ZmOperation.TEXT, true);
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
	this.reset();
	ZmMailListController.prototype._handleEmptyList.apply(this, arguments);
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

ZmDoublePaneController.prototype._setSelectedItem =
function() {
	var selCnt = this._listView[this._currentView].getSelectionCount();
	if (selCnt == 1) {
		var respCallback = new AjxCallback(this, this._handleResponseSetSelectedItem);
		var markRead = (appCtxt.get(ZmSetting.MARK_MSG_READ) == ZmSetting.MARK_READ_NOW);
		this._getLoadedMsg({markRead:markRead}, respCallback);
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

		// make sure list view has this msg
		var lv = this._listView[this._currentView];
		var id = (lv.type == ZmItem.CONV) ? msg.cid : msg.id;
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
		var msg = this._listView[this._currentView].getSelection()[0];
		if (msg) {
			this._doublePaneView.resetMsg(msg);
		}
	}
};

ZmDoublePaneController.prototype._doDelete =
function() {
	this._listView[this._currentView]._itemToSelect = this._getNextItemToSelect();
	ZmMailListController.prototype._doDelete.apply(this, arguments);
};

ZmDoublePaneController.prototype._doMove =
function() {
	this._listView[this._currentView]._itemToSelect = this._getNextItemToSelect();
	ZmMailListController.prototype._doMove.apply(this, arguments);
};

ZmDoublePaneController.prototype._showOrigListener =
function() {
	var msg = this.getMsg();
	if (!msg) { return; }

	var msgFetchUrl = appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI) + "&id=" + msg.id;
	// create a new window w/ generated msg based on msg id
	window.open(msgFetchUrl, "_blank", "menubar=yes,resizable=yes,scrollbars=yes");
};

ZmDoublePaneController.prototype._filterListener = 
function() {
	var respCallback = new AjxCallback(this, this._handleResponseFilterListener);
	var msg = this._getLoadedMsg(null, respCallback);
};

ZmDoublePaneController.prototype._createApptListener =
function() {
	var respCallback = new AjxCallback(this, this._handleResponseNewApptListener);
	var msg = this._getLoadedMsg(null, respCallback);
};

ZmDoublePaneController.prototype._createTaskListener = 
function() {
	var respCallback = new AjxCallback(this, this._handleResponseNewTaskListener);
	var msg = this._getLoadedMsg(null, respCallback);
};

ZmDoublePaneController.prototype._handleResponseNewApptListener =
function(msg) {
	if (!msg) { return; }

    var calController = AjxDispatcher.run("GetCalController"); 
    calController.newApptFromMailItem(msg, new Date());    
};

ZmDoublePaneController.prototype._handleResponseNewTaskListener =
function(msg) {
	if (!msg) { return; }

    AjxDispatcher.require(["TasksCore", "Tasks"]);
    appCtxt.getApp(ZmApp.TASKS).newTaskFromMailItem(msg, new Date());
};

ZmDoublePaneController.prototype._handleResponseFilterListener =
function(msg) {
	if (!msg) { return; }

	AjxDispatcher.require(["PreferencesCore", "Preferences"]);
	var rule = new ZmFilterRule();

	var from = msg.getAddress(AjxEmailAddress.FROM);
	if (from) {
		var subjMod = ZmFilterRule.C_HEADER_VALUE[ZmFilterRule.C_FROM];
		rule.addCondition(ZmFilterRule.TEST_HEADER, ZmFilterRule.OP_CONTAINS, from.address, subjMod);
	}
	var cc = msg.getAddress(AjxEmailAddress.CC);
	if (cc)	{
		var subjMod = ZmFilterRule.C_HEADER_VALUE[ZmFilterRule.C_CC];
		rule.addCondition(ZmFilterRule.TEST_HEADER, ZmFilterRule.OP_CONTAINS, cc.address, subjMod);
	}
	var subj = msg.subject;
	if (subj) {
		var subjMod = ZmFilterRule.C_HEADER_VALUE[ZmFilterRule.C_SUBJECT];
		rule.addCondition(ZmFilterRule.TEST_HEADER, ZmFilterRule.OP_IS, subj, subjMod);
	}
	rule.setGroupOp(ZmFilterRule.GROUP_ALL);
	rule.addAction(ZmFilterRule.A_KEEP);

	var accountName = appCtxt.multiAccounts && msg.getAccount().name;
	appCtxt.getFilterRuleDialog().popup(rule, null, null, accountName);
};

ZmDoublePaneController.prototype._dragListener =
function(ev) {
	ZmListController.prototype._dragListener.call(this, ev);
	if (ev.action == DwtDragEvent.DRAG_END) {
		this._resetOperations(this._toolbar[this._currentView], this._doublePaneView.getSelection().length);
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
		this._doublePaneView.setMsg(msg);
	}
};

ZmDoublePaneController.prototype._redrawDraftItemRows =
function(msg) {
	this._listView[this._currentView].redrawItem(msg);
	this._listView[this._currentView].setSelection(msg, true);
};

ZmDoublePaneController.prototype.selectFirstItem =
function() {
	this._doublePaneView._selectFirstItem();
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
	var listView = this._listView[this._currentView];
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
	this._toolbar[this._currentView].adjustSize();
};

ZmDoublePaneController.prototype._postShowCallback =
function() {

	ZmMailListController.prototype._postShowCallback.apply(this, arguments);
	var dpv = this._doublePaneView;
	if (dpv && dpv.isStale && dpv._staleHandler) {
		dpv._staleHandler();
	}
};
