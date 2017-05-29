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
 * Creates a new, empty mail list controller.
 * @constructor
 * @class
 * This class encapsulates controller behavior that is common to lists of mail items.
 * Operations such as replying and marking read/unread are supported.
 *
 * @author Conrad Damon
 *
 * @param {DwtControl}					container					the containing shell
 * @param {ZmApp}						mailApp						the containing application
 * @param {constant}					type						type of controller
 * @param {string}						sessionId					the session id
 * @param {ZmSearchResultsController}	searchResultsController		containing controller
 * 
 * @extends		ZmListController
 */
ZmMailListController = function(container, mailApp, type, sessionId, searchResultsController) {

	if (arguments.length == 0) { return; }
	ZmListController.apply(this, arguments);

	this._setStatics();

	this._listeners[ZmOperation.SHOW_ORIG] = this._showOrigListener.bind(this);

	this._listeners[ZmOperation.MARK_READ] = this._markReadListener.bind(this);
	this._listeners[ZmOperation.MARK_UNREAD] = this._markUnreadListener.bind(this);
	this._listeners[ZmOperation.FLAG] = this._flagListener.bind(this, true);
	this._listeners[ZmOperation.UNFLAG] = this._flagListener.bind(this, false);
	//fixed bug:15460 removed reply and forward menu.
	if (appCtxt.get(ZmSetting.REPLY_MENU_ENABLED)) {
		this._listeners[ZmOperation.REPLY] = this._replyListener.bind(this);
		this._listeners[ZmOperation.REPLY_ALL] = this._replyListener.bind(this);
	}

	if (appCtxt.get(ZmSetting.FORWARD_MENU_ENABLED)) {
		this._listeners[ZmOperation.FORWARD] = this._forwardListener.bind(this);
		this._listeners[ZmOperation.FORWARD_CONV] = this._forwardConvListener.bind(this);
	}
	this._listeners[ZmOperation.REDIRECT] = new AjxListener(this, this._redirectListener);
	this._listeners[ZmOperation.EDIT] = this._editListener.bind(this, false);
	this._listeners[ZmOperation.EDIT_AS_NEW] = this._editListener.bind(this, true);
	this._listeners[ZmOperation.MUTE_CONV] = this._muteConvListener.bind(this);
	this._listeners[ZmOperation.UNMUTE_CONV] = this._unmuteConvListener.bind(this);

	if (appCtxt.get(ZmSetting.SPAM_ENABLED)) {
		this._listeners[ZmOperation.SPAM] = this._spamListener.bind(this);
	}

	this._listeners[ZmOperation.DETACH] = this._detachListener.bind(this);
	this._inviteReplyListener = this._inviteReplyHandler.bind(this);
	this._shareListener = this._shareHandler.bind(this);
	this._subscribeListener = this._subscribeHandler.bind(this);

	this._acceptShareListener = this._acceptShareHandler.bind(this);
	this._declineShareListener = this._declineShareHandler.bind(this);

	this._listeners[ZmOperation.ADD_FILTER_RULE]	= this._filterListener.bind(this, false, null);
	this._listeners[ZmOperation.CREATE_APPT]		= this._createApptListener.bind(this);
	this._listeners[ZmOperation.CREATE_TASK]		= this._createTaskListener.bind(this);

};

ZmMailListController.prototype = new ZmListController;
ZmMailListController.prototype.constructor = ZmMailListController;

ZmMailListController.prototype.isZmMailListController = true;
ZmMailListController.prototype.toString = function() { return "ZmMailListController"; };

ZmMailListController.GROUP_BY_ITEM		= {};	// item type to search for
ZmMailListController.GROUP_BY_SETTING	= {};	// associated setting on server

// Stuff for the View menu
ZmMailListController.GROUP_BY_ICON		= {};
ZmMailListController.GROUP_BY_MSG_KEY	= {};
ZmMailListController.GROUP_BY_SHORTCUT	= {};
ZmMailListController.GROUP_BY_VIEWS		= [];

// reading pane options
ZmMailListController.READING_PANE_TEXT = {};
ZmMailListController.READING_PANE_TEXT[ZmSetting.RP_OFF]	= ZmMsg.readingPaneOff;
ZmMailListController.READING_PANE_TEXT[ZmSetting.RP_BOTTOM]	= ZmMsg.readingPaneAtBottom;
ZmMailListController.READING_PANE_TEXT[ZmSetting.RP_RIGHT]	= ZmMsg.readingPaneOnRight;

ZmMailListController.READING_PANE_ICON = {};
ZmMailListController.READING_PANE_ICON[ZmSetting.RP_OFF]	= "SplitPaneOff";
ZmMailListController.READING_PANE_ICON[ZmSetting.RP_BOTTOM]	= "SplitPane";
ZmMailListController.READING_PANE_ICON[ZmSetting.RP_RIGHT]	= "SplitPaneVertical";

// conv order options
ZmMailListController.CONV_ORDER_DESC	= ZmSearch.DATE_DESC;
ZmMailListController.CONV_ORDER_ASC		= ZmSearch.DATE_ASC;

ZmMailListController.CONV_ORDER_TEXT = {};
ZmMailListController.CONV_ORDER_TEXT[ZmMailListController.CONV_ORDER_DESC]	= ZmMsg.convOrderDescending;
ZmMailListController.CONV_ORDER_TEXT[ZmMailListController.CONV_ORDER_ASC]	= ZmMsg.convOrderAscending;

// convert key mapping to folder to search
ZmMailListController.ACTION_CODE_TO_FOLDER = {};
ZmMailListController.ACTION_CODE_TO_FOLDER[ZmKeyMap.GOTO_INBOX]		= ZmFolder.ID_INBOX;
ZmMailListController.ACTION_CODE_TO_FOLDER[ZmKeyMap.GOTO_DRAFTS]	= ZmFolder.ID_DRAFTS;
ZmMailListController.ACTION_CODE_TO_FOLDER[ZmKeyMap.GOTO_JUNK]		= ZmFolder.ID_SPAM;
ZmMailListController.ACTION_CODE_TO_FOLDER[ZmKeyMap.GOTO_SENT]		= ZmFolder.ID_SENT;
ZmMailListController.ACTION_CODE_TO_FOLDER[ZmKeyMap.GOTO_TRASH]		= ZmFolder.ID_TRASH;

// convert key mapping to folder to move to
ZmMailListController.ACTION_CODE_TO_FOLDER_MOVE = {};
ZmMailListController.ACTION_CODE_TO_FOLDER_MOVE[ZmKeyMap.MOVE_TO_INBOX]	= ZmFolder.ID_INBOX;
ZmMailListController.ACTION_CODE_TO_FOLDER_MOVE[ZmKeyMap.MOVE_TO_TRASH]	= ZmFolder.ID_TRASH;
ZmMailListController.ACTION_CODE_TO_FOLDER_MOVE[ZmKeyMap.MOVE_TO_JUNK]	= ZmFolder.ID_SPAM;

// convert key mapping to view menu item
ZmMailListController.ACTION_CODE_TO_MENU_ID = {};
ZmMailListController.ACTION_CODE_TO_MENU_ID[ZmKeyMap.READING_PANE_OFF]		= ZmSetting.RP_OFF;
ZmMailListController.ACTION_CODE_TO_MENU_ID[ZmKeyMap.READING_PANE_BOTTOM]	= ZmSetting.RP_BOTTOM;
ZmMailListController.ACTION_CODE_TO_MENU_ID[ZmKeyMap.READING_PANE_RIGHT]	= ZmSetting.RP_RIGHT;

ZmMailListController.ACTION_CODE_WHICH = {};
ZmMailListController.ACTION_CODE_WHICH[ZmKeyMap.FIRST_UNREAD]	= DwtKeyMap.SELECT_FIRST;
ZmMailListController.ACTION_CODE_WHICH[ZmKeyMap.LAST_UNREAD]	= DwtKeyMap.SELECT_LAST;
ZmMailListController.ACTION_CODE_WHICH[ZmKeyMap.NEXT_UNREAD]	= DwtKeyMap.SELECT_NEXT;
ZmMailListController.ACTION_CODE_WHICH[ZmKeyMap.PREV_UNREAD]	= DwtKeyMap.SELECT_PREV;

ZmMailListController.viewToTab = {};


// Public methods

/**
 * Handles switching views based on action from view menu.
 *
 * @param {constant}	view		the id of the new view
 * @param {Boolean}	force		if <code>true</code>, always redraw view
 */
ZmMailListController.prototype.switchView = function(view, force) {

	if ((view == ZmId.VIEW_TRAD || view == ZmId.VIEW_CONVLIST) && view != this.getCurrentViewType()) {
		if (appCtxt.multiAccounts) {
			delete this._showingAccountColumn;
		}

		var groupBy = ZmMailListController.GROUP_BY_SETTING[view];
		if (this.isSearchResults) {
			appCtxt.getApp(ZmApp.SEARCH).setGroupMailBy(groupBy);
		}
		else {
			this._app.setGroupMailBy(groupBy);
		}

		var folderId = this._currentSearch && this._currentSearch.folderId;
		
		var sortBy = appCtxt.get(ZmSetting.SORTING_PREF, folderId || view);
		if (view == ZmId.VIEW_CONVLIST && (sortBy == ZmSearch.NAME_DESC || sortBy == ZmSearch.NAME_ASC)) {
			sortBy =  appCtxt.get(ZmSetting.SORTING_PREF, view); //go back to sortBy for view
			appCtxt.set(ZmSetting.SORTING_PREF, sortBy, folderId); //force folderId sorting
		}
		if (this._mailListView && !appCtxt.isExternalAccount()) {
			//clear the groups to address "from" grouping for conversation
			if (folderId) {
				var currentGroup = this._mailListView.getGroup(folderId);
				if (currentGroup && currentGroup.id == ZmId.GROUPBY_FROM) {
					this._mailListView.setGroup(ZmId.GROUPBY_NONE);
				}
			}		
		}
		
		this._currentSearch.clearCursor();
		var limit = this._listView[this._currentViewId].getLimit();
		var getHtml = appCtxt.get(ZmSetting.VIEW_AS_HTML);
		var groupByItem = (view == ZmId.VIEW_TRAD) ? ZmItem.MSG : ZmItem.CONV;
		var params = {
			types:			[groupByItem],
			offset:			0,
			limit:			limit,
			sortBy:			sortBy,
			getHtml:		getHtml,
			isViewSwitch:	true
		};
		appCtxt.getSearchController().redoSearch(this._currentSearch, null, params);
	}
};

// override if reading pane is supported
ZmMailListController.prototype._setupReadingPaneMenu = function() {};
ZmMailListController.prototype._setupConvOrderMenu = function() {};

/**
 * Checks if the reading pane is "on".
 * 
 * @return	{Boolean}	<code>true</code> if the reading pane is "on"
 */
ZmMailListController.prototype.isReadingPaneOn =
function() {
	return (this._getReadingPanePref() != ZmSetting.RP_OFF);
};

/**
 * Checks if the reading pane is "on" right.
 * 
 * @return	{Boolean}	<code>true</code> if the reading pane is "on" right.
 */
ZmMailListController.prototype.isReadingPaneOnRight =
function() {
	return (this._getReadingPanePref() == ZmSetting.RP_RIGHT);
};

ZmMailListController.prototype._getReadingPanePref =
function() {
	return (this._readingPaneLoc || appCtxt.get(ZmSetting.READING_PANE_LOCATION));
};

ZmMailListController.prototype._setReadingPanePref =
function(value) {
	if (this.isSearchResults || appCtxt.isExternalAccount()) {
		this._readingPaneLoc = value;
	}
	else {
		appCtxt.set(ZmSetting.READING_PANE_LOCATION, value);
	}
};

ZmMailListController.prototype.getKeyMapName =
function() {
	return ZmKeyMap.MAP_MAIL;
};

// We need to stay in sync with what's allowed by _resetOperations
// TODO: we should just find out if an operation was enabled via _resetOperations
ZmMailListController.prototype.handleKeyAction =
function(actionCode, ev) {
	DBG.println(AjxDebug.DBG3, "ZmMailListController.handleKeyAction");

    var lv = this._listView[this._currentViewId];
    var num = lv.getSelectionCount();

    var item;
    if (num == 1 && !this.isDraftsFolder()) {
        var sel = this._listView[this._currentViewId].getSelection();
        if (sel && sel.length) {
            item = sel[0];
        }
    }

    var folder = this._getSearchFolder();
	var isSyncFailures = this.isSyncFailuresFolder();
	var isDrafts = (item && item.isDraft && (item.type != ZmId.ITEM_CONV || item.numMsgs == 1)) || this.isDraftsFolder();
	var isFeed = (folder && folder.isFeed());
    var isExternalAccount = appCtxt.isExternalAccount();

	switch (actionCode) {

		case ZmKeyMap.FORWARD:
			if (!isDrafts && !isExternalAccount) {
				this._doAction({action:ZmOperation.FORWARD, foldersToOmit:ZmMailApp.getFoldersToOmit()});
			}
			break;

		case ZmKeyMap.GET_MAIL:
			this._checkMailListener();
			break;

		case ZmKeyMap.GOTO_INBOX:
		case ZmKeyMap.GOTO_DRAFTS:
		case ZmKeyMap.GOTO_JUNK:
		case ZmKeyMap.GOTO_SENT:
		case ZmKeyMap.GOTO_TRASH:
            if (isExternalAccount) { break; }
			if (actionCode == ZmKeyMap.GOTO_JUNK && !appCtxt.get(ZmSetting.SPAM_ENABLED)) { break; }
			this._folderSearch(ZmMailListController.ACTION_CODE_TO_FOLDER[actionCode]);
			break;

		case ZmKeyMap.MOVE_TO_INBOX:
		case ZmKeyMap.MOVE_TO_TRASH:
		case ZmKeyMap.MOVE_TO_JUNK:
			if (isSyncFailures || isExternalAccount) { break; }
			if (actionCode == ZmKeyMap.MOVE_TO_JUNK && !appCtxt.get(ZmSetting.SPAM_ENABLED)) { break; }
			if (num && !(isDrafts && actionCode != ZmKeyMap.MOVE_TO_TRASH)) {
			 	var folderId = ZmMailListController.ACTION_CODE_TO_FOLDER_MOVE[actionCode];
				folder = appCtxt.getById(folderId);
				var items = lv.getSelection();
				this._doMove(items, folder);
			}
			break;

		case ZmKeyMap.REPLY:
		case ZmKeyMap.REPLY_ALL:
			if (!isDrafts && !isExternalAccount && (num == 1) && !isSyncFailures && !isFeed) {
				this._doAction({action:ZmMailListController.ACTION_CODE_TO_OP[actionCode], foldersToOmit:ZmMailApp.getFoldersToOmit()});
			}
			break;

		case ZmKeyMap.SELECT_ALL:
			lv.selectAll(true);
			this._resetToolbarOperations();
			break;
	
		case ZmKeyMap.SPAM:
            if (isExternalAccount) { break; }
			if (num && !isDrafts && !isExternalAccount && !isSyncFailures && appCtxt.get(ZmSetting.SPAM_ENABLED) && (folder && !folder.isReadOnly())) {
				this._spamListener();
			}
			break;

		case ZmKeyMap.MUTE_UNMUTE_CONV:
            // Mute/Unmute Code removed for IM will be added for JP
			break;

        case ZmKeyMap.MARK_READ:
			if (this._isPermissionDenied(folder)) {
				break;
			}
			this._markReadListener();
			break;

		case ZmKeyMap.MARK_UNREAD:
			if (this._isPermissionDenied(folder)) {
				break;
			}
			this._markUnreadListener();
			break;

		case ZmKeyMap.FLAG:
			if (this._isPermissionDenied(folder)) {
				break;
			}
			this._doFlag(this.getItems());
			break;

		case ZmKeyMap.VIEW_BY_CONV:
			if (!isSyncFailures && appCtxt.get(ZmSetting.CONVERSATIONS_ENABLED)) {
				this.switchView(ZmId.VIEW_CONVLIST);
			}
			break;

		case ZmKeyMap.VIEW_BY_MSG:
			if (!isSyncFailures) {
				this.switchView(ZmId.VIEW_TRAD);
			}
			break;

		case ZmKeyMap.READING_PANE_BOTTOM:
		case ZmKeyMap.READING_PANE_RIGHT:
		case ZmKeyMap.READING_PANE_OFF:
			var menuId = ZmMailListController.ACTION_CODE_TO_MENU_ID[actionCode];
			this.switchView(menuId, true);
			this._updateViewMenu(menuId, this._readingPaneViewMenu);
			break;

		case ZmKeyMap.SHOW_FRAGMENT:
			if (num == 1) {
				var item = lv.getSelection()[0];
                if (!item) { break; }
                var id = lv._getFieldId(item, ZmItem.F_SUBJECT);
                var subjectField = document.getElementById(id);
                if (subjectField) {
                    var loc = Dwt.getLocation(subjectField);
					var frag;
					// TODO: refactor / clean up
					if ((item.type == ZmItem.MSG && item.isInvite() && item.needsRsvp()) ||
                        (item.type == ZmId.ITEM_CONV && this.getMsg() && this.getMsg().isInvite() && this.getMsg().needsRsvp()))
                    {
						frag = item.invite ? item.invite.getToolTip() : this.getMsg().invite.getToolTip();
					} else {
						frag = item.fragment ? item.fragment : ZmMsg.fragmentIsEmpty;
						if (frag != "") { lv.setToolTipContent(AjxStringUtil.htmlEncode(frag), true); }
					}
					var tooltip = this._shell.getToolTip();
					tooltip.popdown();
					if (frag != "") {
						tooltip.setContent(frag);
						tooltip.popup(loc.x, loc.y);
					}
				}
			}
			break;

		case ZmKeyMap.NEXT_UNREAD:
		case ZmKeyMap.PREV_UNREAD:
			this.lastListAction = actionCode;

		case ZmKeyMap.FIRST_UNREAD:
		case ZmKeyMap.LAST_UNREAD:
			var unreadItem = this._getUnreadItem(ZmMailListController.ACTION_CODE_WHICH[actionCode]);
			if (unreadItem) {
				this._selectItem(lv, unreadItem);
			}
			break;
	
		default:
			return ZmListController.prototype.handleKeyAction.apply(this, arguments);
	}
	return true;
};

ZmMailListController.prototype._isPermissionDenied =
function(folder) {
	var isExternalAccount = appCtxt.isExternalAccount();

	if (isExternalAccount || (folder && folder.isReadOnly())) {
		appCtxt.setStatusMsg(ZmMsg.errorPermission);
		return true;
	}
	return false;
};

ZmMailListController.prototype._selectItem =
function(listView, item) {
	listView._unmarkKbAnchorElement(true);
	listView.setSelection(item);
	var el = listView._getElFromItem(item);
	if (el) {
		listView._scrollList(el);
	}
};

ZmMailListController.prototype.mapSupported =
function(map) {
	return (map == "list");
};

/**
 * Sends the read receipt.
 * 
 * @param	{ZmMailMsg}		msg			the message
 */
ZmMailListController.prototype.sendReadReceipt =
function(msg) {

	if (!appCtxt.get(ZmSetting.MAIL_READ_RECEIPT_ENABLED) || msg.readReceiptSent || msg.isSent) {
		return;
	}

	var rrPref = appCtxt.get(ZmSetting.MAIL_SEND_READ_RECEIPTS);

	if (rrPref == ZmMailApp.SEND_RECEIPT_PROMPT) {
		var dlg = appCtxt.getYesNoMsgDialog();
		dlg.registerCallback(DwtDialog.YES_BUTTON, this._sendReadReceipt, this, [msg, dlg]);
		dlg.registerCallback(DwtDialog.NO_BUTTON, this._sendReadReceiptNotified, this, [msg, dlg]);
		dlg.setMessage(ZmMsg.readReceiptSend, DwtMessageDialog.WARNING_STYLE);
		dlg.popup();
	} else if (rrPref == ZmMailApp.SEND_RECEIPT_ALWAYS) {
		msg.readReceiptSent = true;
        this._sendReadReceipt(msg);
	}
};

ZmMailListController.prototype._sendReadReceipt =
function(msg, dlg) {
	if (dlg) {
		dlg.popdown();
	}
	msg.sendReadReceipt(this._handleSendReadReceipt.bind(this, msg));
};

ZmMailListController.prototype._handleSendReadReceipt =
function(msg) {
	appCtxt.setStatusMsg(ZmMsg.readReceiptSent);
    this._sendReadReceiptNotified(msg);
};

ZmMailListController.prototype._sendReadReceiptNotified =
function(msg, dlg) {
	var callback = dlg ? (new AjxCallback(dlg, dlg.popdown)) : null;
	var flags = msg.setFlag(ZmItem.FLAG_READ_RECEIPT_SENT, true);
	msg.list.flagItems({items:[msg], op:"update", value:flags, callback:callback});
};

ZmMailListController.prototype._updateViewMenu = function(id, menu) {

	var viewBtn = this.getCurrentToolbar().getButton(ZmOperation.VIEW_MENU);
	menu = menu || (viewBtn && viewBtn.getMenu());
	if (menu) {
		var mi = menu.getItemById(ZmOperation.MENUITEM_ID, id);
		if (mi) {
			mi.setChecked(true, true);
		}
	}

	// Create "Display" submenu here since it's only needed for multi-column
	if (!this._colHeaderViewMenu && this._mailListView.isMultiColumn()) {
		this._colHeaderViewMenu = this._setupColHeaderViewMenu(this._currentView, this._viewMenu);
	}

	if (this._colHeaderMenuItem && (id === ZmSetting.RP_OFF || id === ZmSetting.RP_BOTTOM || id === ZmSetting.RP_RIGHT)) {
		this._colHeaderMenuItem.setVisible(this._mailListView.isMultiColumn());
	}
};

// Private and protected methods

ZmMailListController.prototype._initialize =
function(view) {
	this._setActiveSearch(view);

	// call base class
	ZmListController.prototype._initialize.call(this, view);
};

ZmMailListController.prototype._initializeParticipantActionMenu =
function() {
	if (!this._participantActionMenu) {
		var menuItems = this._participantOps();
		menuItems.push(ZmOperation.SEP);
		var ops = this._getActionMenuOps();
		if (ops && ops.length) {
			menuItems = menuItems.concat(ops);
		}

		this._participantActionMenu = new ZmActionMenu({parent:this._shell, menuItems:menuItems, controller:this,
														context:this._currentViewId, menuType:ZmId.MENU_PARTICIPANT});
        if (appCtxt.get(ZmSetting.SEARCH_ENABLED)) {
            this._setSearchMenu(this._participantActionMenu);
        }
		this._addMenuListeners(this._participantActionMenu);
		this._participantActionMenu.addPopdownListener(this._menuPopdownListener);
		this._setupTagMenu(this._participantActionMenu);

		//notify Zimlet before showing 
		appCtxt.notifyZimlets("onParticipantActionMenuInitialized", [this, this._participantActionMenu]);
	}
	return this._participantActionMenu;
};

ZmMailListController.prototype._initializeDraftsActionMenu =
function() {
    if (!this._draftsActionMenu) {
		var menuItems = [
			ZmOperation.EDIT,
			ZmOperation.SEP,
			ZmOperation.TAG_MENU, ZmOperation.DELETE, ZmOperation.PRINT,
			ZmOperation.SEP,
			ZmOperation.SHOW_ORIG
		];
		this._draftsActionMenu = new ZmActionMenu({parent:this._shell, menuItems:menuItems,
												   context:this._currentViewId, menuType:ZmId.MENU_DRAFTS});
        if (appCtxt.get(ZmSetting.SEARCH_ENABLED)) {
            this._setSearchMenu(this._draftsActionMenu);
        }
		this._addMenuListeners(this._draftsActionMenu);
		this._draftsActionMenu.addPopdownListener(this._menuPopdownListener);
		this._setupTagMenu(this._draftsActionMenu);
		appCtxt.notifyZimlets("onDraftsActionMenuInitialized", [this, this._draftsActionMenu]);
	}
};

ZmMailListController.prototype._setDraftSearchMenu =
function(address, item, ev){
   if (address && appCtxt.get(ZmSetting.SEARCH_ENABLED) && (ev.field == ZmItem.F_PARTICIPANT || ev.field == ZmItem.F_FROM)){
        if (!this._draftsActionMenu.getOp(ZmOperation.SEARCH_MENU)) {
            ZmOperation.addOperation(this._draftsActionMenu, ZmOperation.SEARCH_MENU, [ZmOperation.SEARCH_MENU, ZmOperation.SEP], 0);
            this._setSearchMenu(this._draftsActionMenu);
        }
        if (item && (item.getAddresses(AjxEmailAddress.TO).getArray().length + item.getAddresses(AjxEmailAddress.CC).getArray().length) > 1){
            ZmOperation.setOperation(this._draftsActionMenu.getSearchMenu(), ZmOperation.SEARCH_TO, ZmOperation.SEARCH_TO, ZmMsg.findEmailToRecipients);
            ZmOperation.setOperation(this._draftsActionMenu.getSearchMenu(), ZmOperation.SEARCH, ZmOperation.SEARCH, ZmMsg.findEmailFromRecipients);
        }
        else{
            ZmOperation.setOperation(this._draftsActionMenu.getSearchMenu(), ZmOperation.SEARCH_TO, ZmOperation.SEARCH_TO, ZmMsg.findEmailToRecipient);
            ZmOperation.setOperation(this._draftsActionMenu.getSearchMenu(), ZmOperation.SEARCH, ZmOperation.SEARCH, ZmMsg.findEmailFromRecipient);
        }
     }
     else if (this._draftsActionMenu.getOp(ZmOperation.SEARCH_MENU)) {
            this._draftsActionMenu = null;
            this._initializeDraftsActionMenu();
     }
};

ZmMailListController.prototype._getToolBarOps =
function() {
	var list = [];
	list = list.concat(this._msgOps());
	list = list.concat(this._deleteOps());
	list.push(ZmOperation.MOVE_MENU);
	return list;
};

ZmMailListController.prototype._getRightSideToolBarOps =
function() {
	if (appCtxt.isChildWindow) {
		return [];
	}
	return [ZmOperation.VIEW_MENU];
};


ZmMailListController.prototype._showDetachInSecondary =
function() {
	return true;
};

ZmMailListController.prototype._getSecondaryToolBarOps =
function() {

	var list = [],
		viewType = this.getCurrentViewType();

	list.push(ZmOperation.PRINT);
	list.push(ZmOperation.SPAM);
	list.push(ZmOperation.TAG_MENU);
	list.push(ZmOperation.SEP);
	list = list.concat(this._flagOps());
	list.push(ZmOperation.SEP);
    list.push(ZmOperation.REDIRECT);
    list.push(ZmOperation.EDIT_AS_NEW);
    list.push(ZmOperation.SEP);
	list = list.concat(this._createOps());
	list.push(ZmOperation.SEP);
	list = list.concat(this._otherOps(true));
	if (viewType === ZmId.VIEW_TRAD) {
		list.push(ZmOperation.SHOW_CONV);
	}

	return list;
};


ZmMailListController.prototype._initializeToolBar =
function(view, className) {

	if (!this._toolbar[view]) {
		ZmListController.prototype._initializeToolBar.call(this, view, className);
		this._createViewMenu(view);
		this._setReplyText(this._toolbar[view]);
//		this._toolbar[view].addOp(ZmOperation.FILLER);
		if (!appCtxt.isChildWindow) {
			this._initializeNavToolBar(view);
		}
	}

	if (!appCtxt.isChildWindow) {
		this._setupViewMenu(view);
	}
	this._setupDeleteButton(this._toolbar[view]);
	if (appCtxt.get(ZmSetting.SPAM_ENABLED)) {
		this._setupSpamButton(this._toolbar[view]);
	}
    this._setupPrintButton(this._toolbar[view]);
};

ZmMailListController.prototype._getNumTotal =
function(){
	// Yuck, remove "of Total" from Nav toolbar at lower resolutions
	if (AjxEnv.is1024x768orLower) {
		 return null;
	}
	return ZmListController.prototype._getNumTotal.call(this);
};

ZmMailListController.prototype._initializeActionMenu =
function() {
	var isInitialized = (this._actionMenu != null);
	ZmListController.prototype._initializeActionMenu.call(this);

	if (this._actionMenu) {
		this._setupSpamButton(this._actionMenu);
	}
	//notify Zimlet before showing
	appCtxt.notifyZimlets("onActionMenuInitialized", [this, this._actionMenu]);
};

// Groups of mail-related operations

ZmMailListController.prototype._flagOps =
function() {
	return [ZmOperation.MARK_READ, ZmOperation.MARK_UNREAD, ZmOperation.FLAG, ZmOperation.UNFLAG];
};

ZmMailListController.prototype._msgOps =
function() {
	var list = [];

	list.push(ZmOperation.EDIT); // hidden except for Drafts

	if (appCtxt.get(ZmSetting.REPLY_MENU_ENABLED)) {
		list.push(ZmOperation.REPLY, ZmOperation.REPLY_ALL);
	}

	if (appCtxt.get(ZmSetting.FORWARD_MENU_ENABLED)) {
		list.push(ZmOperation.FORWARD);
	}
	return list;
};

ZmMailListController.prototype._deleteOps =
function() {
	return [this.getDeleteOperation()];
};

ZmMailListController.prototype._createOps =
function() {
	var list = [];
	if (appCtxt.get(ZmSetting.FILTERS_ENABLED)) {
		list.push(ZmOperation.ADD_FILTER_RULE);
	}
	if (appCtxt.get(ZmSetting.CALENDAR_ENABLED)) {
		list.push(ZmOperation.CREATE_APPT);
	}
	if (appCtxt.get(ZmSetting.TASKS_ENABLED)) {
		list.push(ZmOperation.CREATE_TASK);
	}
	//list.push(ZmOperation.QUICK_COMMANDS);
	return list;
};

ZmMailListController.prototype._otherOps =
function(isSecondary) {
	var list = [];
	if (!appCtxt.isChildWindow && (!isSecondary || this._showDetachInSecondary()) && appCtxt.get(ZmSetting.DETACH_MAILVIEW_ENABLED) && !appCtxt.isExternalAccount()) {
		list.push(ZmOperation.DETACH);
	}
	list.push(ZmOperation.SHOW_ORIG);
	return list;
};



ZmMailListController.prototype.getDeleteOperation =
function() {
	return ZmOperation.DELETE;
};

ZmMailListController.prototype._setActiveSearch =
function(view) {
	// save info. returned by search result
	if (this._activeSearch) {
		if (this._list) {
			this._list.setHasMore(this._activeSearch.getAttribute("more"));
		}
		if (this._listView[view]) {
			this._listView[view].offset = parseInt(this._activeSearch.getAttribute("offset"));
		}
	}
};


/**
 * checks whether some of the selected messages are read and unread. returns it as a 2 flag object with "hasRead" and "hasUnread" attributes.
 *
 * @private
 */
ZmMailListController.prototype._getReadStatus =
function() {

	var status = {hasRead : false, hasUnread : false}

	// dont bother checking for read/unread state for read-only folders
	var folder = this._getSearchFolder();
	if (folder && folder.isReadOnly()) {
		return status;
	}

	var items = this.getItems();

	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		// TODO: refactor / clean up
		if (item.type == ZmItem.MSG) {
			status[item.isUnread ? "hasUnread" : "hasRead"] = true;
			status[item.isFlagged ? "hasFlagged" : "hasUnflagged"] = true;
		}
		else if (item.type == ZmItem.CONV) {
			status.hasUnread = status.hasUnread || item.hasFlag(ZmItem.FLAG_UNREAD, true);
			status.hasRead = status.hasRead || item.hasFlag(ZmItem.FLAG_UNREAD, false);
			status.hasUnflagged = status.hasUnflagged || item.hasFlag(ZmItem.FLAG_FLAGGED, false);
			status.hasFlagged = status.hasFlagged || item.hasFlag(ZmItem.FLAG_FLAGGED, true);
		}
		if (status.hasUnread && status.hasRead) {
			break;
		}
	}

	return status;
};


ZmMailListController.prototype._getConvMuteStatus =
function() {
	var items = this.getItems();
    var status = {
                    hasMuteConv: false,
                    hasUnmuteConv: false
                },
        item,
        i;
    for (i=0; i<items.length; i++) {
        item = items[i];
        if (item.isMute) {
            status.hasMuteConv = true;
        }
        else {
            status.hasUnmuteConv = true;
        }
    }
    return status;
};

/**
 * Dynamically enable/disable the mark read/unread menu items.
 *
 * @private
 */
ZmMailListController.prototype._enableReadUnreadToolbarActions =
function() {
	var menu = this.getCurrentToolbar().getActionsMenu();
	this._enableFlags(menu);
};

ZmMailListController.prototype._enableMuteUnmuteToolbarActions =
function() {
	var menu = this.getCurrentToolbar().getActionsMenu();
	this._enableMuteUnmute(menu);
};

ZmMailListController.prototype._actionsButtonListener =
function(ev) {
	this._enableReadUnreadToolbarActions();
	this._enableMuteUnmuteToolbarActions();
	//update tagmenu each time action button is called
	var menu = this.getCurrentToolbar().getActionsMenu();
	if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		this._setTagMenu(menu);
	}
	//manage spam button
	if (appCtxt.get(ZmSetting.SPAM_ENABLED)) {
		this._setupSpamButton(menu);
	}
	ZmBaseController.prototype._actionsButtonListener.call(this, ev);
};

// List listeners

ZmMailListController.prototype._listSelectionListener =
function(ev) {
	// offline: when opening a message in Outbox, move it to the appropriate
	// account's Drafts folder first
	var search = appCtxt.getCurrentSearch();
	if (appCtxt.isOffline &&
		ev.detail == DwtListView.ITEM_DBL_CLICKED &&
		ev.item && ev.item.isDraft &&
		search && search.folderId == ZmFolder.ID_OUTBOX)
	{
		var account = ev.item.account || ZmOrganizer.parseId(ev.item.id).account;
		var folder = appCtxt.getById(ZmOrganizer.getSystemId(ZmFolder.ID_DRAFTS, account));
		this._list.moveItems({items:[ev.item], folder:folder});
		return false;
	}
	var folderId = ev.item.folderId || (search && search.folderId);
	var folder = folderId && appCtxt.getById(folderId);

	if (ev.field === ZmItem.F_FLAG && this._isPermissionDenied(folder)) {
		return true;
	}
	if (ev.field === ZmItem.F_READ) {
		if (!this._isPermissionDenied(folder)) {
			this._doMarkRead([ev.item], ev.item.isUnread);
		}
		return true;
	}
	else {
		return ZmListController.prototype._listSelectionListener.apply(this, arguments);
	}
};

// Based on context, enable read/unread operation, add/edit contact.
ZmMailListController.prototype._listActionListener =
function(ev) {

	ZmListController.prototype._listActionListener.call(this, ev);

	var items = this._listView[this._currentViewId].getSelection();
	var folder = this._getSearchFolder();

	// bug fix #3602
	var address = (appCtxt.get(ZmSetting.CONTACTS_ENABLED) && ev.field == ZmItem.F_PARTICIPANT)
		? ev.detail
		: ((ev.item && ev.item.isZmMailMsg) ? ev.item.getAddress(AjxEmailAddress.FROM) : null);

	var email = address && address.getAddress();

	var item = (items && items.length == 1) ? items[0] : null;
	if (this.isDraftsFolder() || (item && item.isDraft && item.type != ZmId.ITEM_CONV)) { //note that we never treat a conversation as a draft for actions. See also bug 64494
		// show drafts menu
		this._initializeDraftsActionMenu();
        this._setDraftSearchMenu(address, item, ev);
        if (address)
            this._actionEv.address = address;
		this._setTagMenu(this._draftsActionMenu);
        this._resetOperations(this._draftsActionMenu, items.length);
		appCtxt.notifyZimlets("onMailActionMenuResetOperations", [this, this._draftsActionMenu]);
		this._draftsActionMenu.popup(0, ev.docX, ev.docY);
	}
	else if (!appCtxt.isExternalAccount() && email && items.length == 1 &&
			(appCtxt.get(ZmSetting.CONTACTS_ENABLED) && (ev.field == ZmItem.F_PARTICIPANT || ev.field == ZmItem.F_FROM)))
	{
		// show participant menu
		this._initializeParticipantActionMenu();
		this._setTagMenu(this._participantActionMenu);
		this._actionEv.address = address;
		this._setupSpamButton(this._participantActionMenu);
		this._resetOperations(this._participantActionMenu, items.length);
		appCtxt.notifyZimlets("onMailActionMenuResetOperations", [this, this._participantActionMenu]);
		this._enableFlags(this._participantActionMenu);
		this._enableMuteUnmute(this._participantActionMenu);
		var imItem = this._participantActionMenu.getOp(ZmOperation.IM);
		var contactsApp = appCtxt.getApp(ZmApp.CONTACTS);
		if (contactsApp) {
			this._loadContactForMenu(this._participantActionMenu, address, ev, imItem);
		}
		else if (imItem) {
			// since contacts app is disabled, we won't be making a server call
			ZmImApp.updateImMenuItemByAddress(imItem, address, true);
			this._participantActionMenu.popup(0, ev.docX, ev.docY);
		}
	}
    else if (this.isOutboxFolder()) {
        // show drafts menu
        //this._initializeOutboxsActionMenu();
    } else {
		var actionMenu = this.getActionMenu();
		this._setupSpamButton(actionMenu);
		this._enableFlags(actionMenu);
		this._enableMuteUnmute(actionMenu);
		appCtxt.notifyZimlets("onMailActionMenuResetOperations", [this, actionMenu]);
		actionMenu.popup(0, ev.docX, ev.docY);
		if (ev.ersatz) {
			// menu popped up via keyboard nav
			actionMenu.setSelectedItem(0);
		}
	}

    if (!folder) {
        //might have come from searching on sent items and want to stay in search sent view (i.e. recipient instead of sender)
        folder = this._getActiveSearchFolder();
    }

    if (folder && (folder.nId == ZmFolder.ID_SENT  &&
                  (this._participantActionMenu && this._participantActionMenu.getOp(ZmOperation.SEARCH_MENU)))) {
        if (item && (item.getAddresses(AjxEmailAddress.TO).getArray().length + item.getAddresses(AjxEmailAddress.CC).getArray().length) > 1){
            ZmOperation.setOperation(this._participantActionMenu.getSearchMenu(), ZmOperation.SEARCH_TO, ZmOperation.SEARCH_TO, ZmMsg.findEmailToRecipients);
            ZmOperation.setOperation(this._participantActionMenu.getSearchMenu(), ZmOperation.SEARCH, ZmOperation.SEARCH, ZmMsg.findEmailFromRecipients);
        }
        else{
            ZmOperation.setOperation(this._participantActionMenu.getSearchMenu(), ZmOperation.SEARCH_TO, ZmOperation.SEARCH_TO, ZmMsg.findEmailToRecipient);
            ZmOperation.setOperation(this._participantActionMenu.getSearchMenu(), ZmOperation.SEARCH, ZmOperation.SEARCH, ZmMsg.findEmailFromRecipient);
        }
    }
    else if (this._participantActionMenu && this._participantActionMenu.getOp(ZmOperation.SEARCH_MENU)) {
        ZmOperation.setOperation(this._participantActionMenu.getSearchMenu(), ZmOperation.SEARCH_TO, ZmOperation.SEARCH_TO, ZmMsg.findEmailToSender);
        ZmOperation.setOperation(this._participantActionMenu.getSearchMenu(), ZmOperation.SEARCH, ZmOperation.SEARCH, ZmMsg.findEmailFromSender);
    }
};

// Operation listeners

ZmMailListController.prototype._markReadListener =
function(ev) {
	var callback = this._getMarkReadCallback();
	this._doMarkRead(this._listView[this._currentViewId].getSelection(), true, callback);
};

ZmMailListController.prototype._showOrigListener =
function() {
	var msg = this.getMsg();
	if (!msg) { return; }

	setTimeout(this._showMsgSource.bind(this, msg), 100); // Other listeners are focusing the main window, so delay the window opening for just a bit
};

ZmMailListController.prototype._showMsgSource =
function(msg) {
	var msgFetchUrl = appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI) + "&view=text&id=" + msg.id + (msg.partId ? "&part=" + msg.partId : "");

	// create a new window w/ generated msg based on msg id
	window.open(msgFetchUrl, "_blank", "menubar=yes,resizable=yes,scrollbars=yes");
};


/**
 * Per bug #7257, read receipt must be sent if user explicitly marks a message
 * read under the following conditions:
 *
 * 0. read receipt is requested, user agrees to send it
 * 1. reading pane is on
 * 2. mark as read preference is set to "never"
 * 3. the message currently being read in the reading pane is in the list of
 *    convs/msgs selected for mark as read
 *
 * If all these conditions are met, a callback to run sendReadReceipt() is returned.
 * 
 * @private
 */
ZmMailListController.prototype._getMarkReadCallback =
function() {
	var view = this._listView[this._currentViewId];
	var items = view.getSelection();

	if (this.isReadingPaneOn() && appCtxt.get(ZmSetting.MARK_MSG_READ) == -1) {
		// check if current message being read is the message in the selection list
		var msg = view.parent.getItemView && view.parent.getItemView().getItem();
		if (msg && msg.readReceiptRequested) {
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				var itemId = (item.id < 0) ? (item.id * (-1)) : item.id;
				if (itemId == msg.id) {
					return this.sendReadReceipt.bind(this, msg);
				}
			}
		}
	}
	return null;
};

ZmMailListController.prototype._markUnreadListener =
function(ev) {

	appCtxt.killMarkReadTimer();

	this._doMarkRead(this._listView[this._currentViewId].getSelection(), false);
};

/**
 * flags or unflags (based on the status of the first item. See doFlag)
 * @param ev
 * @private
 */
ZmMailListController.prototype._flagListener =
function(on) {
	this._doFlag(this._listView[this._currentViewId].getSelection(), on);
};


ZmMailListController.prototype._replyListener =
function(ev) {
	var action = ev.item.getData(ZmOperation.KEY_ID);
	if (!action || action == ZmOperation.REPLY_MENU) {
		action = ZmOperation.REPLY;
	}

	this._doAction({ev: ev, action: action, foldersToOmit: ZmMailApp.getReplyFoldersToOmit()});
};

ZmMailListController.prototype._forwardListener =
function(ev) {
	var action = ev.item.getData(ZmOperation.KEY_ID);
	this._doAction({ev: ev, action: action, foldersToOmit: ZmMailApp.getReplyFoldersToOmit()});
};

ZmMailListController.prototype._forwardConvListener = function(ev) {
	this._doAction({ev: ev, action: ZmOperation.FORWARD_CONV, foldersToOmit: ZmMailApp.getReplyFoldersToOmit()});
};

// This method may be called with a null ev parameter
ZmMailListController.prototype._doAction =
function(params) {

	// get msg w/ addrs to select identity from - don't load it yet (no callback)
	// for special handling of multiple forwarded messages, see _handleResponseDoAction
	var msg = params.msg || this.getMsg(params);
	if (!msg) {
		return;
	}

	// use resolved msg to figure out identity/persona to use for compose
	var collection = appCtxt.getIdentityCollection();
	var identity = collection.selectIdentity(msg);

	var action = params.action;
	if (!action || action == ZmOperation.FORWARD_MENU || action == ZmOperation.FORWARD)	{
		params.origAction = action;
		action = params.action = (appCtxt.get(ZmSetting.FORWARD_INCLUDE_ORIG) == ZmSetting.INC_ATTACH)
			? ZmOperation.FORWARD_ATT : ZmOperation.FORWARD_INLINE;

		if (msg.isInvite()) {
			action = params.action = ZmOperation.FORWARD_ATT;
		}
	}
	if (action === ZmOperation.FORWARD_CONV) {
		params.origAction = action;
		// need to remember conv since a single right-clicked item has its selection cleared when
		// the action menu is popped down during the request to load the conv
		var selection = this.getSelection();
		params.conv = selection && selection.length === 1 ? selection[0] : null;
		action = params.action = ZmOperation.FORWARD_ATT;
	}

	// if html compose is allowed and if opening draft always request html
	//   otherwise check if user prefers html or
	//   msg hasn't been loaded yet and user prefers format of orig msg
	var htmlEnabled = appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED);
	var prefersHtml = (appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT) == ZmSetting.COMPOSE_HTML);
	var sameFormat = appCtxt.get(ZmSetting.COMPOSE_SAME_FORMAT);
	params.getHtml = (htmlEnabled && (action == ZmOperation.DRAFT || (prefersHtml || (!msg._loaded && sameFormat))));
	if (action == ZmOperation.DRAFT) {
		params.listController = this;
		//always reload the draft msg except offline created msg
        if (!msg.isOfflineCreated) {
            params.forceLoad = true;
        }
	}

	// bug: 38928 - if user viewed entire truncated message, fetch the whole
	// thing when replying/forwarding
	if (action != ZmOperation.NEW_MESSAGE && action != ZmOperation.DRAFT && msg.viewEntireMessage) {
		params.noTruncate = true;
		params.forceLoad = true;
	}

	if (action == ZmOperation.DRAFT || action == ZmOperation.FORWARD_INLINE ||
            action == ZmOperation.REPLY || action == ZmOperation.REPLY_ALL) {
		var bp = msg.getBodyPart();
		if ((bp && bp.isTruncated) || !msg._loaded) {
			params.noTruncate = true;
			params.forceLoad = true;
		}
	}

	if (params.msg) {
		this._handleResponseDoAction(params, params.msg);
	}
	else {
		var respCallback = this._handleResponseDoAction.bind(this, params);
		// TODO: pointless to load msg when forwarding as att
		this._getLoadedMsg(params, respCallback);
	}
};

ZmMailListController.prototype._handleResponseDoAction =
function(params, msg, finalChoice) {

	if (!msg) { return; }

	msg._instanceDate = params.instanceDate;

	params.inNewWindow = (!appCtxt.isChildWindow && this._app._inNewWindow(params.ev));

    if (msg.list && msg.isUnread && !appCtxt.getById(msg.folderId).isReadOnly()) {
        msg.list.markRead({items:[msg], value:true});
    }

	// check to see if we're forwarding multiple msgs, in which case we do them as attachments;
	// also check to see if we're forwarding an invite; if so, go to appt compose
	var action = params.action;
	if (action == ZmOperation.FORWARD_ATT || action == ZmOperation.FORWARD_INLINE) {
		var selection, selCount;
		if (params.msg) {
			selCount = 1
		}
		else {
			var cview = this._listView[this._currentViewId];
			if (cview) {
				selection = params.conv ? [ params.conv ] : cview.getSelection();
				selCount = params.conv ? 1 : selection.length;

				/*
					Bug 106342 - Forwarding invite shows html source in the body
					Refer to last selected list item before deciding compose action. Selection is lost when context-menu is destroyed and there is no way
					to find out which list item was selected. By default we fall back to mail compose view but in case of invite we need appt compose view.
				*/
				if (selCount === 0 && msg.isInvite() && cview.getSelection().length === 0) {
					selection = this._lastSelectedListItem;

					// Mutate the selCount only if we find any lastSelectedListItem, else it opens as a regular mail compose view.
					if (selection) {
						selCount = selection.length;
					}
				}
			}
		}
		// bug 43428 - invitation should be forwarded using appt forward view
		if (selCount == 1 && msg.forwardAsInvite()) {
			var ac = window.parentAppCtxt || window.appCtxt;
			if (ac.get(ZmSetting.CALENDAR_ENABLED)) {
				var controller = ac.getApp(ZmApp.CALENDAR).getCalController();
				controller.forwardInvite(msg);
				if (appCtxt.isChildWindow) {
					window.close();
				}
				return;
			}
		}

		// forward multiple msgs as attachments
		if (selCount > 1 || params.origAction === ZmOperation.FORWARD_CONV) {
			action = params.action = ZmOperation.FORWARD_ATT;
			this._handleLoadMsgs(params, selection);
			return;
		}
	}
	else if (appCtxt.isOffline && action == ZmOperation.DRAFT) {
		var folder = appCtxt.getById(msg.folderId);
		params.accountName = folder && folder.getAccount().name;
	}
	else if (action == ZmOperation.DECLINE_PROPOSAL) {
		params.subjOverride = this._getInviteReplySubject(action) + msg.subject;
	}

	params.msg = msg;
	AjxDispatcher.run("Compose", params);
};


ZmMailListController.prototype._redirectListener =
function(ev) {

    var action = ev.item.getData(ZmOperation.KEY_ID);
    var msg = this.getMsg({ev:ev, action:action});
    if (!msg) return;

    var redirectDialog = appCtxt.getMailRedirectDialog();
    var redirectDialogCB = this._redirectCallback.bind(this, msg);
    ZmController.showDialog(redirectDialog, redirectDialogCB);
};


ZmMailListController.prototype._redirectCallback =
function(msg) {
	if (!msg) return;

	var redirectDialog = appCtxt.getMailRedirectDialog();
	var addrs = redirectDialog.getAddrs();
	// Code copied from ZmComposeView.  Should consolidate along with the
	// ZmRecipient code, i.e. the corresponding recipient controller code.
	if (addrs.gotAddress) {
        if (addrs[ZmRecipients.BAD].size()) {
            // Any bad addresses?  If there are bad ones, ask the user if they want to send anyway.
            var bad = AjxStringUtil.htmlEncode(addrs[ZmRecipients.BAD].toString(AjxEmailAddress.SEPARATOR));
            var badMsg = AjxMessageFormat.format(ZmMsg.compBadAddresses, bad);
            var cd = appCtxt.getOkCancelMsgDialog();
            cd.reset();
            cd.setMessage(badMsg, DwtMessageDialog.WARNING_STYLE);
            cd.registerCallback(DwtDialog.OK_BUTTON, this._badRedirectAddrsOkCallback, this, [addrs, cd, msg]);
            cd.registerCallback(DwtDialog.CANCEL_BUTTON, this._badRedirectAddrsCancelCallback, this, cd);
            cd.setVisible(true); // per fix for bug 3209
            cd.popup();
        } else {
            redirectDialog.popdown();
            msg.redirect(addrs, this._handleSendRedirect.bind(this));
         }
    } else {
        redirectDialog.popdown();
    }
};

// User has agreed to send message with bad addresses
ZmMailListController.prototype._badRedirectAddrsOkCallback =
function(addrs, dialog, msg) {
    dialog.popdown();
    appCtxt.getMailRedirectDialog().popdown();
    msg.redirect(addrs, this._handleSendRedirect.bind(this));
};


// User has declined to send message with bad addresses - popdown the bad addr dialog,
// returning to the redirect dialog
ZmMailListController.prototype._badRedirectAddrsCancelCallback =
function(dialog) {
    dialog.popdown();
};

ZmMailListController.prototype._handleLoadMsgs =
function(params, selection) {

	var msgIds = new AjxVector(),
		foldersToOmit = params.foldersToOmit || {};

	for (var i = 0; i < selection.length; i++) {
		var item = selection[i];
		if (item.type == ZmItem.CONV) {
			for (var j = 0; j < item.msgIds.length; j++) {
				var msgId = item.msgIds[j];
				if (!foldersToOmit[item.msgFolder[msgId]]) {
					msgIds.add(msgId);
				}
			}
		}
		else {
			if (!msgIds.contains(item.id)) {
				msgIds.add(item.id);
			}
		}
	}
	params.msgIds = msgIds.getArray();
    params.selectedMessages = selection;

	AjxDispatcher.run("Compose", params);
};

ZmMailListController.prototype._handleSendRedirect =
function() {
    appCtxt.setStatusMsg(ZmMsg.redirectSent, ZmStatusView.LEVEL_INFO, null);
};

/**
 * Marks a mail item read if appropriate, possibly after a delay. An arg can be passed so that this function
 * just returns whether the item can be marked read now, which typically results in the setting of the "read"
 * flag in a retrieval request to the server. After that, it can be called without that arg in order to mark
 * the item read after a delay if necessary.
 * 
 * @param {ZmMailItem}	item		msg or conv
 * @param {boolean}		check		if true, return true if msg can be marked read now, without marking it read
 */
ZmMailListController.prototype._handleMarkRead =
function(item, check) {

	var convView = this._convView;
	var waitOnMarkRead = convView && convView.isWaitOnMarkRead();
	if (item && item.isUnread && !waitOnMarkRead) {
		if (!item.isReadOnly() && !appCtxt.isExternalAccount()) {
			var markRead = appCtxt.get(ZmSetting.MARK_MSG_READ);
			if (markRead == ZmSetting.MARK_READ_NOW) {
				if (check) {
					return true;
				}
				else {
					// msg was cached as unread, mark it read now
					this._doMarkRead([item], true);
				}
			} else if (markRead > 0) {
				if (!appCtxt.markReadAction) {
					appCtxt.markReadAction = new AjxTimedAction(this, this._markReadAction);
				}
				appCtxt.markReadAction.args = [item];
				appCtxt.markReadActionId = AjxTimedAction.scheduleAction(appCtxt.markReadAction, markRead * 1000);
			}
		}
	}
	return false;
};

ZmMailListController.prototype._markReadAction =
function(msg) {
	this._doMarkRead([msg], true);
};

ZmMailListController.prototype._doMarkRead =
function(items, on, callback, forceCallback) {

	var params = {items:items, value:on, callback:callback, noBusyOverlay: true};
	var list = params.list = this._getList(params.items);
    params.forceCallback = forceCallback;
	this._setupContinuation(this._doMarkRead, [on, callback], params);
	list.markRead(params);
};

ZmMailListController.prototype._doMarkMute =
function(items, on, callback, forceCallback) {

	var params = {items:items, value:on, callback:callback};
	var list = params.list = this._getList(params.items);
    params.forceCallback = forceCallback;
	this._setupContinuation(this._doMarkMute, [on, callback], params);
	list.markMute(params);
};

/**
* Marks the given items as "spam" or "not spam". Items marked as spam are moved to
* the Junk folder. If items are being moved out of the Junk folder, they will be
* marked "not spam", and the destination folder may be provided. It defaults to Inbox
* if not present.
*
* @param items			[Array]			a list of items to move
* @param markAsSpam		[boolean]		spam or not spam
* @param folder			[ZmFolder]		destination folder
*/
ZmMailListController.prototype._doSpam =
function(items, markAsSpam, folder) {

	this._listView[this._currentViewId]._itemToSelect = this._getNextItemToSelect();
	items = AjxUtil.toArray(items);

	var params = {items:items,
					markAsSpam:markAsSpam,
					folder:folder,
					childWin:appCtxt.isChildWindow && window,
					closeChildWin: appCtxt.isChildWindow};

	var allDoneCallback = this._getAllDoneCallback();
	var list = params.list = this._getList(params.items);
	this._setupContinuation(this._doSpam, [markAsSpam, folder], params, allDoneCallback);
	list.spamItems(params);
};

ZmMailListController.prototype._inviteReplyHandler =
function(ev) {
	var ac = window.parentAppCtxt || window.appCtxt;

	this._listView[this._currentViewId]._itemToSelect = this._getNextItemToSelect();
	ac.getAppController().focusContentPane();

	var type = ev._inviteReplyType;
	if (type == ZmOperation.PROPOSE_NEW_TIME ) {
		ac.getApp(ZmApp.CALENDAR).getCalController().proposeNewTime(ev._msg);
		if (appCtxt.isChildWindow) {
			window.close();
		}
	}
	else if (type == ZmOperation.ACCEPT_PROPOSAL) {
		this._acceptProposedTime(ev._inviteComponentId, ev._msg);
	}
	else if (type == ZmOperation.DECLINE_PROPOSAL) {
		this._declineProposedTime(ev._inviteComponentId, ev._msg);
	}
	else if (type == ZmOperation.INVITE_REPLY_ACCEPT ||
			type == ZmOperation.EDIT_REPLY_CANCEL ||
			type == ZmOperation.INVITE_REPLY_DECLINE ||
			type == ZmOperation.INVITE_REPLY_TENTATIVE)
	{
		this._editInviteReply(ZmMailListController.INVITE_REPLY_MAP[type], ev._inviteComponentId, null, null, ev._inviteReplyFolderId);
	}
	else {
		var callback = new AjxCallback(this, this._handleInviteReplySent);
		var accountName = ac.multiAccounts && ac.accountList.mainAccount.name;
		this._sendInviteReply(type, ev._inviteComponentId, null, accountName, null, ev._msg, ev._inviteReplyFolderId, callback);
	}
	return false;
};

ZmMailListController.prototype._handleInviteReplySent =
function(result, newPtst) {
	var inviteMsgView = this.getCurrentView().getInviteMsgView();
	if (!inviteMsgView || !newPtst) {
		return;
	}
	inviteMsgView.enableToolbarButtons(newPtst);
	inviteMsgView.updatePtstMsg(newPtst);
};

ZmMailListController.prototype._shareHandler =
function(ev) {
	var msg = this.getMsg();
	var fromAddr = msg ? msg.getAddress(AjxEmailAddress.FROM).address : null;

	if (ev._buttonId == ZmOperation.SHARE_ACCEPT) {
		var acceptDialog = appCtxt.getAcceptShareDialog();
		acceptDialog.setAcceptListener(this._acceptShareListener);
		acceptDialog.popup(ev._share, fromAddr);
	} else if (ev._buttonId == ZmOperation.SHARE_DECLINE) {
		var declineDialog = appCtxt.getDeclineShareDialog();
		declineDialog.setDeclineListener(this._declineShareListener);
		declineDialog.popup(ev._share, fromAddr);
	}
};

ZmMailListController.prototype._subscribeHandler =
function(ev) {
	var req = ev._subscribeReq;
	var statusMsg;
	var approve = false;
	if (ev._buttonId == ZmOperation.SUBSCRIBE_APPROVE) {
		statusMsg = req.subscribe ? ZmMsg.dlSubscribeRequestApproved : ZmMsg.dlUnsubscribeRequestApproved;
		approve = true;
	}
	else if (ev._buttonId == ZmOperation.SUBSCRIBE_REJECT) {
		statusMsg = req.subscribe ? ZmMsg.dlSubscribeRequestRejected : ZmMsg.dlUnsubscribeRequestRejected;
	}

	var jsonObj = {
		DistributionListActionRequest: {
			_jsns: "urn:zimbraAccount",
			dl: {by: "name",
				 _content: req.dl.email
			},
			action: {op: approve ? "acceptSubsReq" : "rejectSubsReq",
					 subsReq: {op: req.subscribe ? "subscribe" : "unsubscribe",
							   _content: req.user.email
					 		  }
					}
		}
	};
	var respCallback = this._subscribeResponseHandler.bind(this, statusMsg);
	appCtxt.getAppController().sendRequest({jsonObj: jsonObj, asyncMode: true, callback: respCallback});

	

};

ZmMailListController.prototype._subscribeResponseHandler =
function(statusMsg, ev) {
	var msg = this.getMsg();
	this._removeActionMsg(msg);
	appCtxt.setStatusMsg(statusMsg);
};


ZmMailListController.prototype._acceptShareHandler =
function(ev) {
	var msg = appCtxt.getById(ev._share._msgId);
	this._removeActionMsg(msg);
};

ZmMailListController.prototype._removeActionMsg =
function(msg) {
	var folder = appCtxt.getById(ZmFolder.ID_TRASH);

	this._listView[this._currentViewId]._itemToSelect = this._getNextItemToSelect();
	var list = msg.list || this.getList();
	var callback = (appCtxt.isChildWindow)
		? (new AjxCallback(this, this._handleAcceptShareInNewWindow)) : null;
	list.moveItems({items: [msg], folder: folder, callback: callback, closeChildWin: appCtxt.isChildWindow});
};

ZmMailListController.prototype._declineShareHandler = ZmMailListController.prototype._acceptShareHandler;

ZmMailListController.prototype._handleAcceptShareInNewWindow =
function() {
	window.close();
};

ZmMailListController.prototype._createViewMenu =
function(view) {
	var btn = this._toolbar[view].getButton(ZmOperation.VIEW_MENU);
	if (!btn) { return; }

	btn.setMenu(new AjxCallback(this, this._setupViewMenuItems, [view, btn]));
	btn.noMenuBar = true;
};


ZmMailListController.prototype._setupViewMenu =
function(view) {

	// always reset the view menu button icon to reflect the current view
	var btn = this._toolbar[view].getButton(ZmOperation.VIEW_MENU);
	if (btn) {
		btn.addClassName("ZViewMenuButton");
		var viewType = appCtxt.getViewTypeFromId(view);
		btn.setImage(ZmMailListController.GROUP_BY_ICON[viewType]);
	}
};

ZmMailListController.prototype._setupViewMenuItems =
function(view, btn) {

	var menu = this._viewMenu = new ZmPopupMenu(btn, null, null, this);
	btn.setMenu(menu);
    var isExternalAccount = appCtxt.isExternalAccount(),
	    convsEnabled = appCtxt.get(ZmSetting.CONVERSATIONS_ENABLED);

	if (convsEnabled && this.supportsGrouping()) {
		this._setupGroupByMenuItems(view, menu);
	}
	if (menu.getItemCount() > 0) {
		new DwtMenuItem({
			parent: menu,
			style:  DwtMenuItem.SEPARATOR_STYLE
		});
	}
	this._readingPaneViewMenu = this._setupReadingPaneMenu(view, menu);
	if (!isExternalAccount && convsEnabled) {
		this._convOrderViewMenu = this._setupConvOrderMenu(view, menu);
	}

    // add sort and group by menus only if we have headers (not in standalone conv view)
    if (this.supportsSorting()) {
	    this._sortViewMenu = this._setupSortViewMenu(view, menu);
	    this._groupByViewMenu = this._mailListView._getGroupByActionMenu(menu, true, true);
    }

	return menu;
};

ZmMailListController.prototype._setupSortViewMenu = function(view, menu) {

	var	sortMenuItem = menu.createMenuItem(Dwt.getNextId("SORT_"), {
			text:           ZmMsg.sortBy,
			style:          DwtMenuItem.NO_STYLE
		}),
		sortMenu = this._mailListView._setupSortMenu(sortMenuItem, false);

	sortMenuItem.setMenu(sortMenu);

	return sortMenu;
};

ZmMailListController.prototype._setupColHeaderViewMenu = function(view, menu) {

	var	colHeaderMenuItem = this._colHeaderMenuItem = menu.createMenuItem(Dwt.getNextId("COL_HEADER_"), {
			text:           ZmMsg.display,
			style:          DwtMenuItem.NO_STYLE
		}),
		colHeaderMenu = ZmListView.prototype._getActionMenuForColHeader.call(this._mailListView, true, colHeaderMenuItem, "view");

	colHeaderMenuItem.setMenu(colHeaderMenu);

	return colHeaderMenu;
};

// If we're in the Trash or Junk folder, change the "Delete" button tooltip
ZmMailListController.prototype._setupDeleteButton =
function(parent) {
	var folder = this._getSearchFolder();
	var inTrashFolder = (folder && folder.nId == ZmFolder.ID_TRASH);
    var inJunkFolder =  (folder && folder.nId == ZmFolder.ID_SPAM);
    var deleteButton = parent.getButton(ZmOperation.DELETE);
	var deleteMenuButton = parent.getButton(ZmOperation.DELETE_MENU);
	var tooltip = (inTrashFolder || inJunkFolder) ? ZmMsg.deletePermanentTooltip : ZmMsg.deleteTooltip;
	if (deleteButton) {
		deleteButton.setToolTipContent(ZmOperation.getToolTip(ZmOperation.DELETE, this.getKeyMapName(), tooltip), true);
	}
	if (deleteMenuButton) {
		deleteMenuButton.setToolTipContent(ZmOperation.getToolTip(ZmOperation.DELETE_MENU, this.getKeyMapName(), tooltip), true);
	}
};

// If we're in the Spam folder, the "Spam" button becomes the "Not Spam" button
ZmMailListController.prototype._setupSpamButton =
function(parent) {
	if (!parent) { return; }

	var item = parent.getOp(ZmOperation.SPAM);
	if (item) {
		var folderId = this._getSearchFolderId();
		var folder = appCtxt.getById(folderId);
		var inSpamFolder = ((folder && folder.nId == ZmFolder.ID_SPAM) ||
							(!folder && folderId == ZmFolder.ID_SPAM)  ||
                            (this._currentSearch && this._currentSearch.folderId == ZmFolder.ID_SPAM)); // fall back
		var inPopupMenu = (parent.isZmActionMenu);
		if (parent.isZmButtonToolBar) {
			//might still be in a popup if it's in the Actions menu. That's the case now but I do this generically so it works if one day we move it as a main button (might want to do that in the spam folder at least)
			inPopupMenu = parent.getActionsMenu() && parent.getActionsMenu().getOp(ZmOperation.SPAM);
		}
		item.setText(inSpamFolder ? ZmMsg.notJunkLabel : ZmMsg.junkLabel);
		item.setImage(inSpamFolder ? 'NotJunk' : 'JunkMail');
		if (item.setToolTipContent) {
			var tooltip = inSpamFolder ? ZmMsg.notJunkTooltip : ZmMsg.junkTooltip;
			item.setToolTipContent(ZmOperation.getToolTip(ZmOperation.SPAM, this.getKeyMapName(), tooltip), true);
		}
		item.isMarkAsSpam = !inSpamFolder;
	}
};

// set tooltip for print button
ZmMailListController.prototype._setupPrintButton =
function(parent) {
    if (!parent) { return; }

    var item = parent.getOp(ZmOperation.PRINT);
    if (item) {
        item.setToolTipContent(ZmMsg.printMultiTooltip, true);
    }
};



/**
 * Gets the selected message.
 * 
 * @param	{Hash}	params		a hash of parameters
 * @return	{ZmMailMsg|ZmConv}		the selected message
 */
ZmMailListController.prototype.getMsg =
function(params) {
	var sel = this._listView[this._currentViewId].getSelection();
	return (sel && sel.length) ? sel[0] : null;
};

ZmMailListController.prototype._filterListener =
function(isAddress, rule) {

	if (isAddress) {
		this._handleResponseFilterListener(rule, this._actionEv.address);
	}
	else {
		this._getLoadedMsg(null, this._handleResponseFilterListener.bind(this, rule));
	}
};


ZmMailListController.prototype._setAddToFilterMenu =
function(parent) {
	if (this._filterMenu) {
		return;
	}

	var menuItem = parent.getOp(ZmOperation.ADD_TO_FILTER_RULE);
	this._filterMenu = new ZmPopupMenu(menuItem);
	menuItem.setMenu(this._filterMenu);

	this._rules = AjxDispatcher.run("GetFilterRules");
	this._rules.addChangeListener(this._rulesChangeListener.bind(this));
	this._resetFilterMenu();
};

ZmMailListController.prototype._resetFilterMenu =
function() {
	var filterItems = this._filterMenu.getItems();
	while (filterItems.length > 0) {
		this._filterMenu.removeChild(filterItems[0]);
	}
	this._rules.loadRules(false, this._populateFiltersMenu.bind(this));
};

ZmMailListController.prototype._populateFiltersMenu =
function(results){
	var filters = results.getResponse();
	var menu = this._filterMenu;

	var newItem = new DwtMenuItem({parent: menu});
	newItem.setText(ZmMsg.newFilter);
	newItem.setImage("Plus");
	newItem.addSelectionListener(this._filterListener.bind(this, true, null));

	if (!filters.size()) {
		return;
	}
	menu.createSeparator();

	for (var i = 0; i < filters.size(); i++) {
		var rule = filters.get(i);
		var mi = new DwtMenuItem({parent: menu});
		mi.setText(AjxStringUtil.clipByLength(rule.name, 20));
		mi.addSelectionListener(this._filterListener.bind(this, true, rule));
	}
};

ZmMailListController.prototype._rulesChangeListener =
function(ev){
	if (ev.handled || ev.type !== ZmEvent.S_FILTER) {
		return;
	}

	this._resetFilterMenu();
	ev.handled = true;
};

ZmMailListController.prototype._createApptListener =
function() {
	this._getLoadedMsg(null, this._handleResponseNewApptListener.bind(this));
};

ZmMailListController.prototype._createTaskListener =
function() {
	this._getLoadedMsg(null, this._handleResponseNewTaskListener.bind(this));
};

ZmMailListController.prototype._handleResponseNewApptListener =
function(msg) {
	if (!msg) { return; }
	if (msg.cloneOf) {
		msg = msg.cloneOf;
	}
	var w = appCtxt.isChildWindow ? window.opener : window;
    var calController = w.AjxDispatcher.run("GetCalController");
    calController.newApptFromMailItem(msg, new Date());
	if (appCtxt.isChildWindow) {
		window.close();
	}
};

ZmMailListController.prototype._handleResponseNewTaskListener =
function(msg) {
	if (!msg) { return; }
	if (msg.cloneOf) {
		msg = msg.cloneOf;
	}
	var w = appCtxt.isChildWindow ? window.opener : window;
    var aCtxt = appCtxt.isChildWindow ? parentAppCtxt : appCtxt;
	w.AjxDispatcher.require(["TasksCore", "Tasks"]);
    aCtxt.getApp(ZmApp.TASKS).newTaskFromMailItem(msg, new Date());
	if (appCtxt.isChildWindow) {
		window.close();
	}
};

ZmMailListController.prototype._handleResponseFilterListener =
function(rule, msgOrAddr) {

	if (!msgOrAddr) {
		return;
	}

	// arg can be ZmMailMsg or String (address)
	var msg = msgOrAddr.isZmMailMsg ? msgOrAddr : null;

	if (msg && msg.cloneOf) {
		msg = msg.cloneOf;
	}
	if (appCtxt.isChildWindow) {
		var mailListController = window.opener.AjxDispatcher.run("GetMailListController");
		mailListController._handleResponseFilterListener(rule, msgOrAddr);
		window.close();
		return;
	}
	
	AjxDispatcher.require(["PreferencesCore", "Preferences"]);
	var editMode = !!rule;
	if (rule) {
		//this is important, without this, in case the user goes to the Filters page, things get messed up and trying to save an
		// edited filter complains about the existence of a filter with the same name.
		rule = this._rules.getRuleByName(rule.name) || rule;
	}
	else {
		rule = new ZmFilterRule();
	}

	if (msg) {
		var listId = msg.getListIdHeader();
		if (listId) {
			rule.addCondition(ZmFilterRule.TEST_HEADER, ZmFilterRule.OP_CONTAINS, listId, ZmMailMsg.HDR_LISTID);
		}
		else {
			var from = msg.getAddress(AjxEmailAddress.FROM);
			if (from) {
				var subjMod = ZmFilterRule.C_ADDRESS_VALUE[ZmFilterRule.C_FROM];
				rule.addCondition(ZmFilterRule.TEST_ADDRESS, ZmFilterRule.OP_CONTAINS, from.address, subjMod);
			}
			var cc = msg.getAddress(AjxEmailAddress.CC);
			if (cc)	{
				var subjMod = ZmFilterRule.C_ADDRESS_VALUE[ZmFilterRule.C_CC];
				rule.addCondition(ZmFilterRule.TEST_ADDRESS, ZmFilterRule.OP_CONTAINS, cc.address, subjMod);
			}
			var xZimbraDL = msg.getXZimbraDLHeader();
			if (xZimbraDL && xZimbraDL.good) {
				var arr = xZimbraDL.good.getArray();
				var max = arr.length < 5 ? arr.length : 5; //limit number of X-Zimbra-DL ids
				for (var i=0; i < max; i++) {
					rule.addCondition(ZmFilterRule.TEST_HEADER, ZmFilterRule.OP_CONTAINS, arr[i].address, ZmMailMsg.HDR_XZIMBRADL);
				}
			}
			var subj = msg.subject;
			if (subj) {
				var subjMod = ZmFilterRule.C_HEADER_VALUE[ZmFilterRule.C_SUBJECT];
				rule.addCondition(ZmFilterRule.TEST_HEADER, ZmFilterRule.OP_IS, subj, subjMod);
			}
			rule.setGroupOp(ZmFilterRule.GROUP_ALL);
		}
	}
	else {
		var subjMod = ZmFilterRule.C_ADDRESS_VALUE[ZmFilterRule.C_FROM];
		rule.addCondition(ZmFilterRule.TEST_ADDRESS, ZmFilterRule.OP_CONTAINS, msgOrAddr.isAjxEmailAddress ? msgOrAddr.address : msgOrAddr, subjMod);
	}

	if (!editMode) {
		rule.addAction(ZmFilterRule.A_KEEP);
	}

	var accountName = appCtxt.multiAccounts && msg && msg.getAccount().name,
		folder = msg && appCtxt.getById(msg.getFolderId()),
		outgoing = !!(folder && folder.isOutbound());

	appCtxt.getFilterRuleDialog().popup(rule, editMode, null, accountName, outgoing);
};

/**
 * Returns the selected msg, ensuring that it's loaded.
 * 
 * @private
 */
ZmMailListController.prototype._getLoadedMsg =
function(params, callback) {
	params = params || {};
	var msg = this.getMsg(params);
	if (!msg) {
		callback.run();
	}
	if (msg._loaded && !params.forceLoad) {
		callback.run(msg);
	} else {
		if (msg.id == this._pendingMsg) { return; }

		// Bug: 106342 - Cache the currently selected message list item as it gets de-selected when context-menu is destroyed.
		this._lastSelectedListItem = this._view[this._currentViewId].getSelection();

		msg._loadPending = true;
		this._pendingMsg = msg.id;
		params.markRead = (params.markRead != null) ? params.markRead : this._handleMarkRead(msg, true);
		// use prototype in callback because these functions are overridden by ZmConvListController
		var respCallback = new AjxCallback(this, ZmMailListController.prototype._handleResponseGetLoadedMsg, [callback, msg]);
		msg.load({getHtml:params.getHtml, markRead:params.markRead, callback:respCallback, noBusyOverlay:false, forceLoad: params.forceLoad, noTruncate: params.noTruncate});
	}
};

ZmMailListController.prototype._handleResponseGetLoadedMsg =
function(callback, msg) {
	if (this._pendingMsg && (msg.id != this._pendingMsg)) { return; }
	msg._loadPending = false;
	this._pendingMsg = null;
	callback.run(msg);
};

ZmMailListController.prototype._getInviteReplyBody =
function(type, instanceDate, isResourceInvite) {
	var replyBody;

	if (instanceDate) {
		switch (type) {
			case ZmOperation.REPLY_ACCEPT:		replyBody = ZmMsg.defaultInviteReplyAcceptInstanceMessage; break;
			case ZmOperation.REPLY_CANCEL:		replyBody = ZmMsg.apptInstanceCanceled; break;
			case ZmOperation.REPLY_DECLINE:		replyBody = ZmMsg.defaultInviteReplyDeclineInstanceMessage; break;
			case ZmOperation.REPLY_TENTATIVE: 	replyBody = ZmMsg.defaultInviteReplyTentativeInstanceMessage; break;
		}

		if (isResourceInvite) {
			switch (type) {
				case ZmOperation.REPLY_ACCEPT:		replyBody = ZmMsg.defaultInviteReplyResourceAcceptInstanceMessage; break;
				case ZmOperation.REPLY_CANCEL:		replyBody = ZmMsg.apptInstanceCanceled; break;
				case ZmOperation.REPLY_DECLINE:		replyBody = ZmMsg.defaultInviteReplyResourceDeclineInstanceMessage; break;
				case ZmOperation.REPLY_TENTATIVE: 	replyBody = ZmMsg.defaultInviteReplyResourceTentativeInstanceMessage; break;
			}
		}

		if (replyBody) {
			return AjxMessageFormat.format(replyBody, instanceDate);
		}
	}
	switch (type) {
		case ZmOperation.REPLY_ACCEPT:		replyBody = ZmMsg.defaultInviteReplyAcceptMessage; break;
		case ZmOperation.REPLY_CANCEL:		replyBody = ZmMsg.apptCanceled; break;
		case ZmOperation.DECLINE_PROPOSAL:  replyBody = ""; break;
		case ZmOperation.REPLY_DECLINE:		replyBody = ZmMsg.defaultInviteReplyDeclineMessage; break;
		case ZmOperation.REPLY_TENTATIVE: 	replyBody = ZmMsg.defaultInviteReplyTentativeMessage; break;
		case ZmOperation.REPLY_NEW_TIME: 	replyBody = ZmMsg.defaultInviteReplyNewTimeMessage;	break;
	}

	if (isResourceInvite) {
		switch (type) {
			case ZmOperation.REPLY_ACCEPT:		replyBody = ZmMsg.defaultInviteReplyResourceAcceptMessage; break;
			case ZmOperation.REPLY_CANCEL:		replyBody = ZmMsg.apptCanceled; break;
			case ZmOperation.REPLY_DECLINE:		replyBody = ZmMsg.defaultInviteReplyResourceDeclineMessage; break;
			case ZmOperation.REPLY_TENTATIVE: 	replyBody = ZmMsg.defaultInviteReplyResourceTentativeMessage; break;
			case ZmOperation.REPLY_NEW_TIME: 	replyBody = ZmMsg.defaultInviteReplyNewTimeMessage;	break;
		}
	}

	//format the escaped apostrophe in ZmMsg entry
	if (replyBody) {
		replyBody =  AjxMessageFormat.format(replyBody, []);
	}
	return replyBody;
};

ZmMailListController.prototype._getInviteReplySubject =
function(type) {
	var replySubject = null;
	switch (type) {
		case ZmOperation.REPLY_ACCEPT:		replySubject = ZmMsg.subjectAccept + ": "; break;
		case ZmOperation.DECLINE_PROPOSAL:	replySubject = ZmMsg.subjectDecline + " - "; break;
		case ZmOperation.REPLY_DECLINE:		replySubject = ZmMsg.subjectDecline + ": "; break;
		case ZmOperation.REPLY_TENTATIVE:	replySubject = ZmMsg.subjectTentative + ": "; break;
		case ZmOperation.REPLY_NEW_TIME:	replySubject = ZmMsg.subjectNewTime + ": "; break;
	}
	return replySubject;
};

ZmMailListController.prototype._editInviteReply =
function(action, componentId, instanceDate, accountName, acceptFolderId) {
	var replyBody = this._getInviteReplyBody(action, instanceDate);
	this._doAction({action:action, extraBodyText:replyBody, instanceDate:instanceDate, accountName:accountName, acceptFolderId: acceptFolderId});
};

ZmMailListController.prototype._acceptProposedTime =
function(componentId, origMsg) {
	var invite = origMsg.invite;
	var apptId = invite.getAppointmentId();
	var ac = window.parentAppCtxt || window.appCtxt;
	var controller = ac.getApp(ZmApp.CALENDAR).getCalController();
	var callback = new AjxCallback(this, this._handleAcceptDeclineProposedTime, [origMsg]);
	controller.acceptProposedTime(apptId, invite, appCtxt.isChildWindow ? null : callback);
	if (appCtxt.isChildWindow) {
		window.close();
	}
};

ZmMailListController.prototype._declineProposedTime =
function(componentId, origMsg) {
	var replyBody = this._getInviteReplyBody(ZmOperation.DECLINE_PROPOSAL);
	var callback = new AjxCallback(this, this._handleAcceptDeclineProposedTime, [origMsg]);
	this._doAction({action:ZmOperation.DECLINE_PROPOSAL, extraBodyText:replyBody, instanceDate:null, sendMsgCallback: callback});
};

ZmMailListController.prototype._handleAcceptDeclineProposedTime =
function(origMsg) {
	this._doDelete([origMsg]);
};

ZmMailListController.prototype._sendInviteReply =
function(type, componentId, instanceDate, accountName, ignoreNotify, origMsg, acceptFolderId, callback) {
	var msg = new ZmMailMsg();
	AjxDispatcher.require(["MailCore", "CalendarCore"]);

	msg._origMsg = origMsg || this.getMsg();
	msg.inviteMode = type;
	msg.isReplied = true;
	msg.isForwarded = false;
	msg.isInviteReply = true;
	msg.acceptFolderId = acceptFolderId;
	msg.folderId = msg._origMsg.folderId;

	var replyActionMode = ZmMailListController.REPLY_ACTION_MAP[type] ? ZmMailListController.REPLY_ACTION_MAP[type] : type;
	var replyBody = this._getInviteReplyBody(replyActionMode, instanceDate, msg._origMsg.isResourceInvite());
	if (replyBody != null) {
		var dummyAppt = new ZmAppt();
		dummyAppt.setFromMessage(msg._origMsg);

		var tcontent = dummyAppt.getTextSummary() + "\n" + replyBody;
		var textPart = new ZmMimePart();
		textPart.setContentType(ZmMimeTable.TEXT_PLAIN);
		textPart.setContent(tcontent);

		var hcontent = dummyAppt.getHtmlSummary() + "<p>" + replyBody + "</p>";
		var htmlPart = new ZmMimePart();
		htmlPart.setContentType(ZmMimeTable.TEXT_HTML);
		htmlPart.setContent(hcontent);

		var topPart = new ZmMimePart();
		topPart.setContentType(ZmMimeTable.MULTI_ALT);
		topPart.children.add(textPart);
		topPart.children.add(htmlPart);

		msg.setTopPart(topPart);
	}
	var subject = this._getInviteReplySubject(replyActionMode) + msg._origMsg.invite.getEventName();
	if (subject != null) {
		msg.setSubject(subject);
	}
	var errorCallback = new AjxCallback(this, this._handleErrorInviteReply);
	msg.sendInviteReply(true, componentId, callback, errorCallback, instanceDate, accountName, ignoreNotify);
};

ZmMailListController.prototype._handleErrorInviteReply =
function(result) {
	if (result.code == ZmCsfeException.MAIL_NO_SUCH_ITEM) {
		var dialog = appCtxt.getErrorDialog();
		dialog.setMessage(ZmMsg.inviteOutOfDate);
		dialog.popup(null, true);
		return true;
	}
};

ZmMailListController.prototype._spamListener =
function(ev) {
	var items = this._listView[this._currentViewId].getSelection();
	var button = this.getCurrentToolbar().getButton(ZmOperation.SPAM);

	this._doSpam(items, button.isMarkAsSpam);
};

ZmMailListController.prototype._detachListener =
function(ev, callback) {
	var msg = this.getMsg();
	if (msg) {
		if (msg._loaded) {
			ZmMailMsgView.detachMsgInNewWindow(msg, false, this);
			// always mark a msg read if it is displayed in its own window
			if (msg.isUnread && !appCtxt.getById(msg.folderId).isReadOnly()) {
				msg.list.markRead({items:[msg], value:true});
			}
		} else {
			ZmMailMsgView.rfc822Callback(msg.id, null, this);
		}
	}
	if (callback) { callback.run(); }
};

ZmMailListController.prototype._printListener =
function(ev) {
	var listView = this._listView[this._currentViewId];
	var items = listView.getSelection();
	items = AjxUtil.toArray(items);
	var ids = [];
	var showImages = false;
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		// always extract out the msg ids from the conv
		if (item.toString() == "ZmConv") {
			// get msg ID in case of virtual conv.
			// item.msgIds.length is inconsistent, so checking if conv id is negative.
			if (appCtxt.isOffline && item.id.split(":")[1]<0) {
				ids.push(item.msgIds[0]);
			} else {
				ids.push("C:"+item.id);
			}
			if (item.isZmConv) {
				var msgList = item.getMsgList();
				for(var j=0; j<msgList.length; j++) {
					if(msgList[j].showImages) {
						showImages = true;
						break;
					}
				}
			}
		} else {
			ids.push(item.id);
			if (item.showImages) {
				showImages = true;
			}
		}
	}
	var url = ("/h/printmessage?id=" + ids.join(",")) + "&tz=" + AjxTimezone.getServerId(AjxTimezone.DEFAULT);
	if (appCtxt.get(ZmSetting.DISPLAY_EXTERNAL_IMAGES) || showImages) {
		url = url+"&xim=1";
	}
    if (appCtxt.isOffline) {
        var acctName = items[0].getAccount().name;
        url+="&acct=" + acctName ;
    }
    window.open(appContextPath+url, "_blank");
};

ZmMailListController.prototype._editListener =
function(isEditAsNew, ev) {
    this._doAction({ev:ev, action:ZmOperation.DRAFT, isEditAsNew:isEditAsNew});
};

ZmMailListController.prototype._muteUnmuteConvListener =
function(ev) {
    var status = this._getConvMuteStatus();
    if (status.hasUnmuteConv) {
        this._muteConvListener();
    }
    else {
        this._unmuteConvListener();
    }
};

ZmMailListController.prototype._muteConvListener =
function(ev) {
    var listView = this._listView[this._currentView];
	var items = listView.getSelection();
	items = AjxUtil.toArray(items);
    var markReadcallback = this._getMarkReadCallback();
    var callback = new AjxCallback(this, this._handleMuteUnmuteConvResponse, [markReadcallback, ZmId.OP_MUTE_CONV]);
    this._doMarkMute(items, true, callback, true);
};

ZmMailListController.prototype._unmuteConvListener =
function(ev) {
    var listView = this._listView[this._currentView];
	var items = listView.getSelection();
	items = AjxUtil.toArray(items);
    var convListView = this._mailListView || this._parentController._mailListView;
    //When a conv is unmuted it needs to be rearranged in the list as per its sorting order. convListCallback will handle it.
    var convListCallback = null;
    if(convListView && convListView.toString() == "ZmConvListView") {
        convListCallback = new AjxCallback(convListView, convListView.handleUnmuteConv, items);
    }
    var callback = new AjxCallback(this, this._handleMuteUnmuteConvResponse, [convListCallback, ZmId.OP_UNMUTE_CONV]);
    this._doMarkMute(items, false, callback, true);
};

ZmMailListController.prototype._handleMuteUnmuteConvResponse =
function(callback, actionId, result) {
    if(callback != null) {
        callback.run();
    }
};

ZmMailListController.prototype._checkMailListener =
function() {
	if (appCtxt.isOffline) {
		var callback = new AjxCallback(this, this._handleSyncAll);
		appCtxt.accountList.syncAll(callback);
	}

	var folder = this._getSearchFolder();
	var isFeed = (folder && folder.isFeed());
	if (isFeed) {
		folder.sync();
	} else {
		var hasExternalAccounts = false;
		if (!appCtxt.isOffline) {
			var isEnabled = appCtxt.get(ZmSetting.POP_ACCOUNTS_ENABLED) || appCtxt.get(ZmSetting.IMAP_ACCOUNTS_ENABLED);
			if (folder && !isFeed && isEnabled) {
				var dataSources = folder.getDataSources(null, true);
				if (dataSources) {
					hasExternalAccounts = true;
					var dsCollection = AjxDispatcher.run("GetDataSourceCollection");
					dsCollection.importMail(dataSources);
				}
			}
		}

		if ((folder && folder.nId == ZmFolder.ID_INBOX) || !hasExternalAccounts) {
			appCtxt.getAppController().sendNoOp();
		}
	}
};

ZmMailListController.prototype._handleSyncAll =
function() {
	//doesn't do anything now after I removed the appCtxt.get(ZmSetting.GET_MAIL_ACTION) == ZmSetting.GETMAIL_ACTION_DEFAULT preference stuff
};

ZmMailListController.prototype.runRefresh =
function() {
	this._checkMailListener();
};

ZmMailListController.prototype._sendReceiveListener =
function(ev) {
	var account = appCtxt.accountList.getAccount(ev.item.getData(ZmOperation.MENUITEM_ID));
	if (account) {
		account.sync();
	}
};

ZmMailListController.prototype._folderSearch =
function(folderId) {
	appCtxt.getSearchController().search({query:"in:" + ZmFolder.QUERY_NAME[folderId]});
};

// Miscellaneous

// Adds "By Conversation" and "By Message" to a view menu
ZmMailListController.prototype._setupGroupByMenuItems =
function(view, menu) {

	for (var i = 0; i < ZmMailListController.GROUP_BY_VIEWS.length; i++) {
		var id = ZmMailListController.GROUP_BY_VIEWS[i];
		var mi = menu.createMenuItem(id, {image:	ZmMailListController.GROUP_BY_ICON[id],
										  text:		ZmMsg[ZmMailListController.GROUP_BY_MSG_KEY[id]],
										  shortcut:	ZmMailListController.GROUP_BY_SHORTCUT[id],
										  style:	DwtMenuItem.RADIO_STYLE});
		mi.setData(ZmOperation.MENUITEM_ID, id);
		mi.addSelectionListener(this._listeners[ZmOperation.VIEW]);
		if (id == this.getDefaultViewType()) {
			mi.setChecked(true, true);
		}
	}
};

ZmMailListController.prototype._setReplyText =
function(parent) {
	if (parent && appCtxt.get(ZmSetting.REPLY_MENU_ENABLED)) {
		var op = parent.getOp(ZmOperation.REPLY_MENU);
		if (op) {
			var menu = op.getMenu();
			var replyOp = menu.getOp(ZmOperation.REPLY);
			replyOp.setText(ZmMsg.replySender);
		}
	}
};

ZmMailListController.prototype._resetOperations =
function(parent, num) {

	ZmListController.prototype._resetOperations.call(this, parent, num);

	var isWebClientOffline = appCtxt.isWebClientOffline();
	parent.enable(ZmOperation.PRINT, (num > 0) && !isWebClientOffline );
	parent.enable(ZmOperation.SHOW_ORIG, !isWebClientOffline);

	if (this.isSyncFailuresFolder()) {
		parent.enableAll(false);
		parent.enable([ZmOperation.NEW_MENU], true);
		parent.enable([ZmOperation.DELETE, ZmOperation.FORWARD], num > 0);
		return;
	}

	var item;
	if (num == 1 && !this.isDraftsFolder()) {
		var sel = this._listView[this._currentViewId].getSelection();
		if (sel && sel.length) {
			item = sel[0];
		}
	}
	
	// If one item is selected, use its folder; otherwise check if search was constrained to a folder
	var itemFolder = item && item.folderId && appCtxt.getById(item.folderId);
	var folder = itemFolder;
	if (!folder) {
		var folderId = this._getSearchFolderId(true);
		folder = folderId && appCtxt.getById(folderId);
	}

	var isDrafts = (item && item.isDraft && (item.type != ZmId.ITEM_CONV || item.numMsgs == 1)) || this.isDraftsFolder();
	var isFeed = (folder && folder.isFeed());
	var isReadOnly = (folder && folder.isReadOnly());
    var isOutboxFolder = this.isOutboxFolder();
	parent.setItemVisible(ZmOperation.EDIT, (isDrafts || isOutboxFolder) && (!folder || !folder.isReadOnly()));
	parent.setItemVisible(ZmOperation.EDIT_AS_NEW, !(isDrafts || isOutboxFolder));

	parent.setItemVisible(ZmOperation.REDIRECT, !(isDrafts || isOutboxFolder));
	parent.enable(ZmOperation.REDIRECT, !(isDrafts || isOutboxFolder || isWebClientOffline));

	parent.setItemVisible(ZmOperation.MARK_READ, !(isDrafts || isOutboxFolder));
	parent.setItemVisible(ZmOperation.MARK_UNREAD, !(isDrafts || isOutboxFolder));
	parent.setItemVisible(ZmOperation.FLAG, !(isDrafts || isOutboxFolder));
	parent.setItemVisible(ZmOperation.UNFLAG, !(isDrafts || isOutboxFolder));
	parent.setItemVisible(ZmOperation.SPAM, !(isDrafts || isOutboxFolder));
	parent.setItemVisible(ZmOperation.DETACH, !(isDrafts || isOutboxFolder));

	parent.enable(ZmOperation.MOVE_MENU, !(isDrafts || isOutboxFolder) && num > 0);

	parent.enable(ZmOperation.DETACH, (appCtxt.get(ZmSetting.DETACH_MAILVIEW_ENABLED) && !(isDrafts || isOutboxFolder || isWebClientOffline) && num == 1));

	/*if (parent.isZmActionMenu) {
		parent.setItemVisible(ZmOperation.QUICK_COMMANDS, !isDrafts && parent._hasQuickCommands);
	} else {
		parent.setItemVisible(ZmOperation.QUICK_COMMANDS, !isDrafts);
	} */

	parent.setItemVisible(ZmOperation.ADD_FILTER_RULE, !(isDrafts || isOutboxFolder));
	parent.setItemVisible(ZmOperation.CREATE_APPT, !(isDrafts || isOutboxFolder));
	parent.setItemVisible(ZmOperation.CREATE_TASK, !(isDrafts || isOutboxFolder));
    parent.setItemVisible(ZmOperation.ACTIONS_MENU, !isOutboxFolder);

	// bug fix #37154 - disable non-applicable buttons if rfc/822 message
	var isRfc822 = appCtxt.isChildWindow && window.newWindowParams && window.newWindowParams.isRfc822;
	if (isRfc822 || (isReadOnly && num > 0)) {
		parent.enable([ZmOperation.DELETE, ZmOperation.MOVE, ZmOperation.MOVE_MENU, ZmOperation.SPAM, ZmOperation.TAG_MENU], false);
	} else {
		parent.enable([ZmOperation.REPLY, ZmOperation.REPLY_ALL], (!(isDrafts || isOutboxFolder) && !isFeed && num == 1));
		parent.enable([ZmOperation.VIEW_MENU], true);
		parent.enable([ZmOperation.FORWARD, ZmOperation.SPAM], (!(isDrafts || isOutboxFolder) && num > 0));
	}

	if (this._draftsActionMenu) {
		var editMenu = this._draftsActionMenu.getOp(ZmOperation.EDIT);
		if (editMenu) {
			// Enable|disable 'edit' context menu item based on selection count
			editMenu.setEnabled(num == 1 && (this.isDraftsFolder() || !isReadOnly));
		}
	}

	var search = appCtxt.getCurrentSearch();
	if (appCtxt.multiAccounts && num > 1 && search && search.isMultiAccount()) {
		parent.enable(ZmOperation.TAG_MENU, false);
	}

    if (appCtxt.isExternalAccount()) {
        parent.enable(
                        [
                            ZmOperation.REPLY,
                            ZmOperation.REPLY_ALL,
                            ZmOperation.FORWARD,
                            ZmOperation.EDIT_AS_NEW,
                            ZmOperation.REDIRECT,
                            ZmOperation.MARK_READ,
                            ZmOperation.MARK_UNREAD,
                            ZmOperation.SPAM,
                            ZmOperation.MOVE,
                            ZmOperation.MOVE_MENU,
                            ZmOperation.DELETE,
                            ZmOperation.DETACH,
                            ZmOperation.ADD_FILTER_RULE,
                            ZmOperation.CREATE_APPT,
                            ZmOperation.SEARCH_TO,
                            ZmOperation.SEARCH,
                            ZmOperation.CREATE_TASK
                        ],
                        false
                    );
        parent.setItemVisible(ZmOperation.TAG_MENU, false);
    }

	this._cleanupToolbar(parent);
};

ZmMailListController.prototype._showMailItem =
function() {
	var avm = appCtxt.getAppViewMgr();
	this._setup(this._currentViewId);
	var elements = this.getViewElements(this._currentViewId, this._view[this._currentViewId]);

	var curView = avm.getCurrentViewId();
	var tabId = ZmMailListController.viewToTab[curView] || Dwt.getNextId();
	ZmMailListController.viewToTab[this._currentViewId] = tabId;
	var viewParams = {
		view:		this._currentViewId,
		viewType:	this._currentViewType,
		elements:	elements,
		hide:		this._elementsToHide,
		clear:		appCtxt.isChildWindow,
		tabParams:	this._getTabParams(tabId, this._tabCallback.bind(this))
	};
	var buttonText = (this._conv && this._conv.subject) ? this._conv.subject.substr(0, ZmAppViewMgr.TAB_BUTTON_MAX_TEXT) : (this._msg && this._msg.subject && this._msg.subject.substr(0, ZmAppViewMgr.TAB_BUTTON_MAX_TEXT)) ||   ZmMsgController.DEFAULT_TAB_TEXT;

	this._setView(viewParams);
	avm.setTabTitle(this._currentViewId, buttonText);
	this._resetOperations(this._toolbar[this._currentViewId], 1); // enable all buttons
	this._resetNavToolBarButtons();
};


/**
 * if parent is a toolbar, it might have an actionsMenu. If it does, we can clean up the separators in that menu.
 * (to prevent multiple consecutive separators, etc)
 * @param parent
 */
ZmMailListController.prototype._cleanupToolbar =
function(parent) {
	//cleanup the separators of the toolbar Actions menu
	if (!parent.getActionsMenu) {
		return;
	}
	var actionsMenu = parent.getActionsMenu();
	if (!actionsMenu) {
		return;
	}
	actionsMenu.cleanupSeparators();
};



// Enable mark read/unread as appropriate.
ZmMailListController.prototype._enableFlags =
function(menu) {
    if(appCtxt.isExternalAccount()) {
        menu.enable([ZmOperation.MARK_READ, ZmOperation.MARK_UNREAD, ZmOperation.FLAG, ZmOperation.UNFLAG], false);
        return;
    }
	var status = this._getReadStatus();
	menu.enable(ZmOperation.MARK_READ, status.hasUnread);
	menu.enable(ZmOperation.MARK_UNREAD, status.hasRead);
	menu.enable(ZmOperation.FLAG, status.hasUnflagged);
	menu.enable(ZmOperation.UNFLAG, status.hasFlagged);

    if (appCtxt.isWebClientOffline()) {
        menu.enable([ZmOperation.ADD_FILTER_RULE,ZmOperation.CREATE_APPT, ZmOperation.CREATE_TASK], false);
    }
};

// Enable mark read/unread as appropriate.
ZmMailListController.prototype._enableMuteUnmute =
function(menu) {
    menu.enable([ZmOperation.UNMUTE_CONV, ZmOperation.MUTE_CONV], false);
    if (appCtxt.isExternalAccount() || appCtxt.isChildWindow || this._app.getGroupMailBy() === ZmItem.MSG) {
        return;
    }
    var status = this._getConvMuteStatus();
    if (status.hasMuteConv && status.hasUnmuteConv) {
        menu.enable(ZmOperation.UNMUTE_CONV, true);
        menu.enable(ZmOperation.MUTE_CONV, true);
    }
	else if (status.hasMuteConv) {
         menu.enable(ZmOperation.UNMUTE_CONV, true);
    }
    else {
         menu.enable(ZmOperation.MUTE_CONV, true);
    }
};

/**
* This method is actually called by a pushed view's controller when a user
* attempts to page conversations (from CV) or messages (from MV ala TV).
* We want the underlying view (CLV or MLV) to update itself silently as it
* feeds the next/prev conv/msg to its respective controller.
*
* @param {ZmItem}	currentItem	the current item
* @param {Boolean}	forward		if <code>true</code>, get next item rather than previous
* 
* @private
*/
ZmMailListController.prototype.pageItemSilently =
function(currentItem, forward, msgController) {

	var newItem = this._getNextItem(currentItem, forward);
	if (newItem) {
		if (msgController) {
			msgController.inactive = true; //make it inactive so it can be reused instead of creating a new one for each item paged.
		}
		var lv = this._listView[this._currentViewId];
		lv.emulateDblClick(newItem);
	}
};

ZmMailListController.prototype._getNextItem =
function(currentItem, forward) {

	var list = this._list.getArray();
	var len = list.length;
	for (var i = 0; i < len; i++) {
		if (currentItem == list[i]) {
			break;
		}
	}
	if (i == len) { return; }

	var itemIdx = forward ? i + 1 : i - 1;

	if (itemIdx >= len) {
		//we are looking for the next item after the current list, not yet loaded
		if (!this._list.hasMore()) {
			return;
		}
		this._paginate(this._currentViewId, true, itemIdx);
		return;
	}
	return list[itemIdx];
};

/**
 * Selects and displays an item that has been loaded into a page that's
 * not visible (eg getting the next conv from within the last conv on a page).
 *
 * @param view			[constant]		current view
 * @param saveSelection	[boolean]		if true, maintain current selection
 * @param loadIndex		[int]			index of item to show
 * @param result			[ZmCsfeResult]	result of SOAP request
 * 
 * @private
 */
ZmMailListController.prototype._handleResponsePaginate =
function(view, saveSelection, loadIndex, offset, result) {
	ZmListController.prototype._handleResponsePaginate.apply(this, arguments);

	var newItem = loadIndex ? this._list.getVector().get(loadIndex) : null;
	if (newItem) {
		this._listView[this._currentViewId].emulateDblClick(newItem);
	}
};

ZmMailListController.prototype._getMenuContext =
function() {
	return this.getCurrentViewId();
};

// Flag mail items(override ZmListController to add hook to zimletMgr
ZmMailListController.prototype._doFlag =
function(items, on) {
	ZmListController.prototype._doFlag.call(this, items, on);
	appCtxt.notifyZimlets("onMailFlagClick", [items, on]);
};

// Tag/untag items(override ZmListController to add hook to zimletMgr
ZmMailListController.prototype._doTag =
function(items, tag, doTag) {
	ZmListController.prototype._doTag.call(this, items, tag, doTag);
	appCtxt.notifyZimlets("onTagAction", [items, tag, doTag]);
};


/**
 * Returns the next/previous/first/last unread item in the list, based on what's
 * currently selected.
 *
 * @param which		[constant]		DwtKeyMap constant for selecting next/previous/first/last
 * @param type		[constant]*		if present, only return this type of item
 * @param noBump	[boolean]*		if true, start with currently selected item
 * 
 * @private
 */
ZmMailListController.prototype._getUnreadItem =
function(which, type, noBump) {

	var lv = this._listView[this._currentViewId];
	var vec = lv.getList(true);
	var list = vec && vec.getArray();
	var size = list && list.length;
	if (!size) { return; }

	var start, index;
	if (which == DwtKeyMap.SELECT_FIRST) {
		index = 0;
	} else if (which == DwtKeyMap.SELECT_LAST) {
		index = list.length - 1;
	} else {
		var sel = lv.getSelection();
		var start, index;
		if (sel && sel.length) {
			start = (which == DwtKeyMap.SELECT_NEXT) ? sel[sel.length - 1] : sel[0];
		} else {
			start = (which == DwtKeyMap.SELECT_NEXT) ? list[0] : list[list.length - 1];
		}
		if (start) {
			var startIndex = lv.getItemIndex(start, true);
			if (sel && sel.length && !noBump) {
				index = (which == DwtKeyMap.SELECT_NEXT) ? startIndex + 1 : startIndex - 1;
			} else {
				index = startIndex;
			}
		}
	}

	var unreadItem = null;
	while ((index >= 0 && index < size) && !unreadItem) {
		var item = list[index];
		if (item.isUnread && (!type || item.type == type)) {
			unreadItem = item;
		} else {
			index = (which == DwtKeyMap.SELECT_NEXT || which == DwtKeyMap.SELECT_FIRST) ? index + 1 : index - 1;
		}
	}

	return unreadItem;
};

ZmMailListController.prototype._getNextItemToSelect = function() {};

ZmMailListController.prototype.addTrustedAddr =
function(value, callback, errorCallback) {
    var soapDoc = AjxSoapDoc.create("ModifyPrefsRequest", "urn:zimbraAccount"),
        node,
        i;

    for(i=0; i<value.length;i++) {
        node = soapDoc.set("pref", AjxStringUtil.trim(value[i]));
        node.setAttribute("name", "zimbraPrefMailTrustedSenderList");
    }

    return appCtxt.getAppController().sendRequest({
       soapDoc: soapDoc,
       asyncMode: true,
       callback: callback,
       errorCallback: errorCallback
    });
};

/**
 * @private
 */
ZmMailListController.prototype._getActiveSearchFolderId =
function() {
	var s = this._activeSearch && this._activeSearch.search;
	return s && s.folderId;
};

/**
 * @private
 */
ZmMailListController.prototype._getActiveSearchFolder =
function() {
	var id = this._getActiveSearchFolderId();
	return id && appCtxt.getById(id);
};

/* ZmMailListController.prototype._quickCommandMenuHandler = function(evt, batchCmd) {
    var selectedItems = this.getItems();

    ZmListController.prototype._quickCommandMenuHandler.call(this, evt);

    if (!selectedItems || !selectedItems.length) {return;}

    var menuItem = evt.dwtObj;
    var quickCommand = menuItem.getData(Dwt.KEY_OBJECT);
    if (!quickCommand) {return;}
            
    var actions = quickCommand.actions;
    var len = actions.length;
    for (var i = 0; i < len; i++) {
        var action = actions[i];
        if (!action.isActive) {continue;}
        var actionValue = action.value;
        if (action.type == ZmQuickCommandAction[ZmFilterRule.A_NAME_FLAG]) {
            if (actionValue == "read" || actionValue == "unread") {
                this._doMarkRead(selectedItems, (actionValue == "read"));
            }
        }
    }
};
*/

/**
* Deletes one or more items from the list.
*
* @param items			[Array]			list of items to delete
* @param hardDelete		[boolean]*		if true, physically delete items
* @param attrs			[Object]*		additional attrs for SOAP command
* @param confirmDelete  [Boolean]       user already confirmed hard delete (see ZmBriefcaseController.prototype._doDelete and ZmBriefcaseController.prototype._doDelete2)
*
* @private
*/
ZmMailListController.prototype._doDelete =
function(items, hardDelete, attrs, confirmDelete) {

    var messages = AjxUtil.toArray(items);
    if (!messages.length) { return; }

    // Check if need to warn the user about violating the keep retention policy.  If a warning
    // dialog is displayed, the callback from that dialog allows the user to delete messages
    var warningIssued = this._doRetentionPolicyWarning(messages,
        ZmListController.prototype._doDelete, [hardDelete, attrs, false]);
    if (!warningIssued) {
        // No retention policy, or all the chosen messages fall outside the retention period.
        ZmListController.prototype._doDelete.call(this, messages, hardDelete, attrs, confirmDelete);
    }
};

ZmMailListController.prototype._doMove =
function(items, destinationFolder, attrs, isShiftKey) {
    var messages = AjxUtil.toArray(items);
    if (!messages.length) { return; }

    var warningIssued = false;

    if (destinationFolder && (destinationFolder.nId == ZmFolder.ID_TRASH)) {
        // Check if need to warn the user about violating the keep retention policy.  If a warning
        // dialog is displayed, the callback from that dialog allows the user to trash messages
        warningIssued = this._doRetentionPolicyWarning(messages,
            ZmListController.prototype._doMove, [destinationFolder, attrs, isShiftKey]);
    }
    if (!warningIssued) {
        // No retention policy, or all the chosen messages fall outside the retention period.
        ZmListController.prototype._doMove.call(this, items, destinationFolder, attrs, isShiftKey);
    }
}

ZmMailListController.prototype._doRetentionPolicyWarning =
function(messages, callbackFunc, args) {
    var numWithinRetention = 0;
    var folder;
    var keepPolicy;
    var now = new Date();
    var validMessages = [];
    var policyStartMsec = {};
    for (var i = 0; i < messages.length; i++) {
        var folderId = messages[i].folderId;
        if (!policyStartMsec[folderId]) {
            policyStartMsec[folderId] = -1;
            folder = appCtxt.getById(folderId);
            keepPolicy = (folder ? folder.getRetentionPolicy(ZmOrganizer.RETENTION_KEEP) : null);
            if (keepPolicy) {
                // Calculate the current start of this folder's keep (retention) period
                var keepLifetimeMsec = folder.getRetentionPolicyLifetimeMsec(keepPolicy);
                policyStartMsec[folderId] = now.getTime() - keepLifetimeMsec;
            }
        }
        if (policyStartMsec[folderId] > 0) {
            // Determine which messages are not affected by the retention policy (i.e.
            // their age exceeds that mandated by the policy)
            if (messages[i].date < policyStartMsec[folderId]) {
                validMessages.push(messages[i]);
            }
        } else {
            // The message's folder does not have a retention policy
            validMessages.push(messages[i]);
        }
    }

    numWithinRetention = messages.length - validMessages.length;
    if (numWithinRetention > 0) {
        // Create the base warning text
        var warningMsg = ((numWithinRetention == 1) ?
                            ZmMsg.retentionKeepWarning :
                            AjxMessageFormat.format(ZmMsg.retentionKeepWarnings,[numWithinRetention.toString()])) +
                         "<BR><BR>";

        if (validMessages.length == 0) {
            // All the chosen messages fall within the retention period
            this._showSimpleRetentionWarning(warningMsg, messages, callbackFunc, args);
        } else {
            // A mix of messages - some outside the retention period, some within.
            warningMsg += ZmMsg.retentionDeleteAllExplanation + "<BR><BR>" +
                          ((validMessages.length == 1) ?
                              ZmMsg.retentionDeleteValidExplanation :
                              AjxMessageFormat.format(ZmMsg.retentionDeleteValidExplanations,[validMessages.length.toString()]));
            this._showRetentionWarningDialog(warningMsg, messages, validMessages, callbackFunc, args);
        }
    }

    return numWithinRetention != 0;
}

ZmMailListController.prototype._showSimpleRetentionWarning =
function(warningMsg, messages, callbackFunc, args) {
    warningMsg += (messages.length == 1) ? ZmMsg.retentionDeleteOne :
                                           ZmMsg.retentionDeleteMultiple;
    // This assumes that the first parameter of the OK function is the messages
    // to be processed, followed by other arbitrary parameters
    var okArgs = [messages].concat(args);
    var callback = new AjxCallback(this, callbackFunc,okArgs);

    var okCancelDialog = appCtxt.getOkCancelMsgDialog();
    okCancelDialog.registerCallback(DwtDialog.OK_BUTTON,
        this._handleRetentionWarningOK, this, [okCancelDialog, callback]);
    okCancelDialog.setMessage(warningMsg, DwtMessageDialog.WARNING_STYLE);
    okCancelDialog.setVisible(true);
    okCancelDialog.popup();
}


ZmMailListController.prototype._showRetentionWarningDialog =
function(warningMsg, messages, validMessages, callbackFunc, args) {
    var retentionDialog = appCtxt.getRetentionWarningDialog();
	retentionDialog.reset();

    var callback;
    // This assumes that the first parameter of the OK function is the messages
    // to be processed, followed by other arbitrary parameters
    var allArgs = [messages].concat(args);
    callback = new AjxCallback(this, callbackFunc, allArgs);
    retentionDialog.registerCallback(ZmRetentionWarningDialog.DELETE_ALL_BUTTON,
        this._handleRetentionWarningOK, this, [retentionDialog, callback]);

    var oldArgs = [validMessages].concat(args);
    callback = new AjxCallback(this, callbackFunc, oldArgs);
    retentionDialog.registerCallback(ZmRetentionWarningDialog.DELETE_VALID_BUTTON,
        this._handleRetentionWarningOK, this, [retentionDialog, callback]);

    retentionDialog.setMessage(warningMsg, DwtMessageDialog.WARNING_STYLE);
    retentionDialog.setVisible(true);
    retentionDialog.popup();
};

ZmMailListController.prototype._handleRetentionWarningOK =
function(dialog, callback) {
    dialog.popdown();
    callback.run();
};

// done here since operations may not be defined at parse time
ZmMailListController.prototype._setStatics = function() {

	if (!ZmMailListController.INVITE_REPLY_MAP) {

		ZmMailListController.INVITE_REPLY_MAP = {};
		ZmMailListController.INVITE_REPLY_MAP[ZmOperation.INVITE_REPLY_ACCEPT]		= ZmOperation.REPLY_ACCEPT;
		ZmMailListController.INVITE_REPLY_MAP[ZmOperation.INVITE_REPLY_DECLINE]		= ZmOperation.REPLY_DECLINE;
		ZmMailListController.INVITE_REPLY_MAP[ZmOperation.INVITE_REPLY_TENTATIVE]	= ZmOperation.REPLY_TENTATIVE;

		ZmMailListController.REPLY_ACTION_MAP = {};
		ZmMailListController.REPLY_ACTION_MAP[ZmOperation.REPLY_ACCEPT_NOTIFY]		= ZmOperation.REPLY_ACCEPT;
		ZmMailListController.REPLY_ACTION_MAP[ZmOperation.REPLY_ACCEPT_IGNORE]		= ZmOperation.REPLY_ACCEPT;
		ZmMailListController.REPLY_ACTION_MAP[ZmOperation.REPLY_DECLINE_NOTIFY]		= ZmOperation.REPLY_DECLINE;
		ZmMailListController.REPLY_ACTION_MAP[ZmOperation.REPLY_DECLINE_IGNORE]		= ZmOperation.REPLY_DECLINE;
		ZmMailListController.REPLY_ACTION_MAP[ZmOperation.REPLY_TENTATIVE_NOTIFY]	= ZmOperation.REPLY_TENTATIVE;
		ZmMailListController.REPLY_ACTION_MAP[ZmOperation.REPLY_TENTATIVE_IGNORE]	= ZmOperation.REPLY_TENTATIVE;

		// convert key mapping to operation
		ZmMailListController.ACTION_CODE_TO_OP = {};
		ZmMailListController.ACTION_CODE_TO_OP[ZmKeyMap.REPLY]			= ZmOperation.REPLY;
		ZmMailListController.ACTION_CODE_TO_OP[ZmKeyMap.REPLY_ALL]		= ZmOperation.REPLY_ALL;
		ZmMailListController.ACTION_CODE_TO_OP[ZmKeyMap.FORWARD_INLINE]	= ZmOperation.FORWARD_INLINE;
		ZmMailListController.ACTION_CODE_TO_OP[ZmKeyMap.FORWARD_ATT]	= ZmOperation.FORWARD_ATT;
	}
};

// Mail can be grouped by msg or conv
ZmMailListController.prototype.supportsGrouping = function() {
    return true;
};
