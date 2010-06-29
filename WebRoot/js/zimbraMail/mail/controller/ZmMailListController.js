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
 * Creates a new, empty mail list controller.
 * @constructor
 * @class
 * This class encapsulates controller behavior that is common to lists of mail items.
 * Operations such as replying and marking read/unread are supported.
 *
 * @author Conrad Damon
 *
 * @param {ZmComposite}		container		the containing shell
 * @param {ZmMailApp}		mailApp			the containing app
 * 
 * @extends		ZmListController
 */
ZmMailListController = function(container, mailApp) {

	if (arguments.length == 0) { return; }
	ZmListController.call(this, container, mailApp);

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

	this._listeners[ZmOperation.MARK_READ] = new AjxListener(this, this._markReadListener);
	this._listeners[ZmOperation.MARK_UNREAD] = new AjxListener(this, this._markUnreadListener);
	//fixed bug:15460 removed reply and forward menu.
	if (appCtxt.get(ZmSetting.REPLY_MENU_ENABLED)) {
		this._listeners[ZmOperation.REPLY] = new AjxListener(this, this._replyListener);
		this._listeners[ZmOperation.REPLY_ALL] = new AjxListener(this, this._replyListener);
	}

	if (appCtxt.get(ZmSetting.FORWARD_MENU_ENABLED)) {
		this._listeners[ZmOperation.FORWARD] = new AjxListener(this, this._forwardListener);
	}
	this._listeners[ZmOperation.EDIT] = new AjxListener(this, this._editListener);
	this._listeners[ZmOperation.CHECK_MAIL] = new AjxListener(this, this._checkMailListener);

	if (appCtxt.get(ZmSetting.SPAM_ENABLED)) {
		this._listeners[ZmOperation.SPAM] = new AjxListener(this, this._spamListener);
	}

	this._listeners[ZmOperation.DETACH] = new AjxListener(this, this._detachListener);
	this._inviteReplyListener = new AjxListener(this, this._inviteReplyHandler);
	this._shareListener = new AjxListener(this, this._shareHandler);

	this._acceptShareListener = new AjxListener(this, this._acceptShareHandler);
	this._declineShareListener = new AjxListener(this, this._declineShareHandler);
};

ZmMailListController.prototype = new ZmListController;
ZmMailListController.prototype.constructor = ZmMailListController;

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

// Public methods

ZmMailListController.prototype.toString =
function() {
	return "ZmMailListController";
};

/**
 * Handles switching views based on action from view menu.
 *
 * @param {constant}	view		the id of the new view
 * @param {Boolean}	force		if <code>true</code>, always redraw view
 */
ZmMailListController.prototype.switchView =
function(view, force) {
	if (view == ZmId.VIEW_TRAD || view == ZmId.VIEW_CONVLIST) {
		if (appCtxt.multiAccounts) {
			delete this._showingAccountColumn;
		}

		var localGroupBy = ZmMailListController.GROUP_BY_SETTING[view];
		var appGroupBy = this._app._groupBy[appCtxt.getActiveAccount().name];
		if (localGroupBy && (localGroupBy != appGroupBy)) {
			this._app.setGroupMailBy(localGroupBy);
		} else if (!force) {
			return;
		}

		var sortBy = appCtxt.get(ZmSetting.SORTING_PREF, view);
		var limit = this._listView[this._currentView].getLimit();
		var getHtml = appCtxt.get(ZmSetting.VIEW_AS_HTML);
		var groupByItem = this._app.getGroupMailBy();
		var params = {types:[groupByItem], offset:0, limit:limit, sortBy:sortBy, getHtml:getHtml};
		appCtxt.getSearchController().redoSearch(this._app.currentSearch, null, params);
	}
};

// override if reading pane is supported
ZmMailListController.prototype._setupReadingPaneMenuItems = function() {};
ZmMailListController.prototype._setupConvOrderMenuItems = function() {};

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
	return appCtxt.get(ZmSetting.READING_PANE_LOCATION);
};

ZmMailListController.prototype._setReadingPanePref =
function(value) {
	appCtxt.set(ZmSetting.READING_PANE_LOCATION, value);
};

ZmMailListController.prototype.getKeyMapName =
function() {
	return "ZmMailListController";
};

// We need to stay in sync with what's allowed by _resetOperations
ZmMailListController.prototype.handleKeyAction =
function(actionCode) {
	DBG.println(AjxDebug.DBG3, "ZmMailListController.handleKeyAction");

	var folder = this._getSearchFolder();
	var isSyncFailures = (folder && folder.nId == ZmOrganizer.ID_SYNC_FAILURES);
	var isDrafts = (folder && folder.nId == ZmFolder.ID_DRAFTS);
	var lv = this._listView[this._currentView];
	var num = lv.getSelectionCount();

	switch (actionCode) {

		case ZmKeyMap.FORWARD:
			if (!isDrafts) {
				this._doAction({action:ZmOperation.FORWARD});
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
			this._folderSearch(ZmMailListController.ACTION_CODE_TO_FOLDER[actionCode]);
			break;

		case ZmKeyMap.MOVE_TO_INBOX:
		case ZmKeyMap.MOVE_TO_TRASH:
		case ZmKeyMap.MOVE_TO_JUNK:
			if (isSyncFailures) { break; }
			if (num && !(isDrafts && actionCode != ZmKeyMap.MOVE_TO_TRASH)) {
			 	var folderId = ZmMailListController.ACTION_CODE_TO_FOLDER_MOVE[actionCode];
				folder = appCtxt.getById(folderId);
				var items = lv.getSelection();
				this._doMove(items, folder);
			}
			break;

		case ZmKeyMap.REPLY:
		case ZmKeyMap.REPLY_ALL:
			if (!isDrafts && (num == 1) && !isSyncFailures) {
				this._doAction({action:ZmMailListController.ACTION_CODE_TO_OP[actionCode]});
			}
			break;

		case ZmKeyMap.SELECT_ALL:
			lv.selectAll(true);
			break;
	
		case ZmKeyMap.SPAM:
			if (num && !isDrafts && !isSyncFailures) {
				this._spamListener();
			}
			break;

		case ZmKeyMap.MARK_READ:
			if (num && (!folder || (folder && !folder.isReadOnly()))) {
				this._markReadListener();
			}
			break;

		case ZmKeyMap.MARK_UNREAD:
			if (num && (!folder || (folder && !folder.isReadOnly()))) {
				this._markUnreadListener();
			}
			break;

		case ZmKeyMap.VIEW_BY_CONV:
			if (!isSyncFailures) {
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
			this._updateViewMenu(menuId);
			this.switchView(menuId, true);
			break;

		case ZmKeyMap.SHOW_FRAGMENT:
			if (num == 1) {
				var item = lv.getSelection()[0];
				var id = lv._getFieldId(item, ZmItem.F_SUBJECT);
				var subjectField = document.getElementById(id);
				if (subjectField) {
					var loc = Dwt.getLocation(subjectField);
					var frag;
					if (item.type == ZmItem.MSG && item.isInvite() && item.needsRsvp()) {
						frag = item.invite.getToolTip();
					} else {
						frag = item.fragment ? item.fragment : ZmMsg.fragmentIsEmpty;
						if (frag != "") { lv.setToolTipContent(AjxStringUtil.htmlEncode(frag)); }
					}
					var tooltip = this._shell.getToolTip();
					tooltip.popdown();
					if (frag != "") {
						tooltip.setContent(AjxStringUtil.htmlEncode(frag));
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
			return ZmListController.prototype.handleKeyAction.call(this, actionCode);
	}
	return true;
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
		var callback = new AjxCallback(this, this._sendReadReceipt, msg);
		var dlg = appCtxt.getYesNoMsgDialog();
		dlg.registerCallback(DwtDialog.YES_BUTTON, this._sendReadReceipt, this, [msg, dlg]);
		dlg.registerCallback(DwtDialog.NO_BUTTON, this._sendReadReceiptNotified, this, [msg, dlg]);
		dlg.setMessage(ZmMsg.readReceiptSend, DwtMessageDialog.WARNING_STYLE);
		dlg.popup();
	} else if (rrPref == ZmMailApp.SEND_RECEIPT_ALWAYS) {
		this._sendReadReceipt(msg);
	}
};

ZmMailListController.prototype._sendReadReceipt =
function(msg, dlg) {
	if (dlg) {
		dlg.popdown();
	}
	var jsonObj = {SendDeliveryReportRequest:{_jsns:"urn:zimbraMail"}};
	request = jsonObj.SendDeliveryReportRequest;
	request.mid = msg.id;
	var callback = new AjxCallback(this, this._handleSendReadReceipt);
	var ac = window.parentAppCtxt || window.appCtxt;
	ac.getRequestMgr().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:callback});
};

ZmMailListController.prototype._handleSendReadReceipt =
function() {
	appCtxt.setStatusMsg(ZmMsg.readReceiptSent);
};

ZmMailListController.prototype._sendReadReceiptNotified =
function(msg, dlg) {
	var callback = dlg ? (new AjxCallback(dlg, dlg.popdown)) : null;
	var flags = msg.setFlag(ZmItem.FLAG_READ_RECEIPT_SENT, true);
	msg.list.flagItems({items:[msg], op:"update", value:flags, callback:callback});
};

ZmMailListController.prototype._updateViewMenu =
function(id) {
	var viewBtn = this._toolbar[this._currentView].getButton(ZmOperation.VIEW_MENU);
	var menu = viewBtn && viewBtn.getMenu();
	if (menu) {
		var mi = menu.getItemById(ZmOperation.MENUITEM_ID, id);
		if (mi) {
			mi.setChecked(true, true);
		}
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
														context:this._currentView, menuType:ZmId.MENU_PARTICIPANT});
		this._addMenuListeners(this._participantActionMenu);
		this._participantActionMenu.addPopdownListener(this._menuPopdownListener);
		this._setupTagMenu(this._participantActionMenu);
		this._setupEditButton(this._participantActionMenu);
		
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
												   context:this._currentView, menuType:ZmId.MENU_DRAFTS});
		this._addMenuListeners(this._draftsActionMenu);
		this._draftsActionMenu.addPopdownListener(this._menuPopdownListener);
		this._setupTagMenu(this._draftsActionMenu);
	}
};

ZmMailListController.prototype._initializeToolBar =
function(view) {

	if (!this._toolbar[view]) {
		ZmListController.prototype._initializeToolBar.call(this, view);
		this._createViewMenu(view);
		if (appCtxt.isOffline && appCtxt.accountList.size() > 2) {
			this._createSendReceiveMenu(this._toolbar[view]);
		}
		this._setReplyText(this._toolbar[view]);
		this._toolbar[view].addOp(ZmOperation.FILLER);
		this._initializeNavToolBar(view);
	}

	this._setupViewMenu(view);
	this._setupDeleteButton(this._toolbar[view]);
	this._setupSpamButton(this._toolbar[view]);
	this._setupCheckMailButton(this._toolbar[view]);

	// reset new button properties
	this._setNewButtonProps(view, ZmMsg.compose, "NewMessage", "NewMessageDis", ZmOperation.NEW_MESSAGE);
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
		if (!isInitialized) {
			this._setupEditButton(this._actionMenu);
		}
	}
	//notify Zimlet before showing
	appCtxt.notifyZimlets("onActionMenuInitialized", [this, this._actionMenu]);
};

// Groups of mail-related operations

ZmMailListController.prototype._standardToolBarOps =
function() {
	return [
		ZmOperation.NEW_MENU, ZmOperation.SEP,
		ZmOperation.CHECK_MAIL, ZmOperation.SEP,
		ZmOperation.DELETE, ZmOperation.MOVE, ZmOperation.PRINT, ZmOperation.SEP
	];
};

ZmMailListController.prototype._flagOps =
function() {
	return [ZmOperation.MARK_READ, ZmOperation.MARK_UNREAD];
};

ZmMailListController.prototype._msgOps =
function() {
	var list = [];

	if (appCtxt.get(ZmSetting.REPLY_MENU_ENABLED)) {
		list.push(ZmOperation.REPLY, ZmOperation.REPLY_ALL);
	}

	if (appCtxt.get(ZmSetting.FORWARD_MENU_ENABLED)) {
		list.push(ZmOperation.FORWARD);
	}

	return list;
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


// List listeners

ZmMailListController.prototype._listSelectionListener =
function(ev) {
	// offline: when opening a message in Outbox, move it to the appropriate
	// account's Drafts folder first
	if (appCtxt.isOffline &&
		ev.detail == DwtListView.ITEM_DBL_CLICKED &&
		ev.item && ev.item.isDraft &&
		appCtxt.getCurrentSearch().folderId == ZmFolder.ID_OUTBOX)
	{
		var account = ev.item.account || ZmOrganizer.parseId(ev.item.id).account;
		var folder = appCtxt.getById(ZmOrganizer.getSystemId(ZmFolder.ID_DRAFTS, account));
		this._list.moveItems({items:[ev.item], folder:folder});
	}
	ZmListController.prototype._listSelectionListener.apply(this, arguments);
};

// Based on context, enable read/unread operation, add/edit contact.
ZmMailListController.prototype._listActionListener =
function(ev) {

	ZmListController.prototype._listActionListener.call(this, ev);

	var items = this._listView[this._currentView].getSelection();

	// enable/disable mark as read/unread as necessary
	var hasRead = false;
	var hasUnread = false;

	// dont bother checking for read/unread state for read-only folders
	var folder = this._getSearchFolder();
	if (!folder || (folder && !folder.isReadOnly())) {
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			if (item.type == ZmItem.MSG) {
				if (item.isUnread) {
					hasUnread = true;
				} else {
					hasRead = true;
				}
			} else if (item.type == ZmItem.CONV) {
				hasUnread = item.hasFlag(ZmItem.FLAG_UNREAD, true);
				hasRead = item.hasFlag(ZmItem.FLAG_UNREAD, false);
			}
			if (hasUnread && hasRead) { break; }
		}
	}

	// bug fix #3602
	var address = (appCtxt.get(ZmSetting.CONTACTS_ENABLED) && ev.field == ZmItem.F_PARTICIPANT)
		? ev.detail
		: ((ev.item instanceof ZmMailMsg) ? ev.item.getAddress(AjxEmailAddress.FROM) : null);

	var item = (items && items.length == 1) ? items[0] : null;
	if (folder && folder.nId == ZmFolder.ID_DRAFTS || (item && item.isDraft)) {
		// show drafts menu
		this._initializeDraftsActionMenu();
		this._setTagMenu(this._draftsActionMenu);
        this._resetOperations(this._draftsActionMenu, items.length);
		this._draftsActionMenu.popup(0, ev.docX, ev.docY);
	}
	else if (address && items.length == 1 &&
			(appCtxt.get(ZmSetting.CONTACTS_ENABLED) && (ev.field == ZmItem.F_PARTICIPANT || ev.field == ZmItem.F_FROM)))
	{
		// show participant menu
		this._initializeParticipantActionMenu();
		this._setTagMenu(this._participantActionMenu);
		this._actionEv.address = address;
		this._setupSpamButton(this._participantActionMenu);
		this._resetOperations(this._participantActionMenu, items.length);
		this._enableFlags(this._participantActionMenu, hasUnread, hasRead);
		var imItem = this._participantActionMenu.getOp(ZmOperation.IM);
		var contactsApp = appCtxt.getApp(ZmApp.CONTACTS);
		if (contactsApp) {
			// first check if contact is cached, and no server call is needed
			var contact = contactsApp.getContactByEmail(address.getAddress());
			if (contact) {
				this._handleResponseGetContact(imItem, address, ev, contact);
			} else {
				this._participantActionMenu.getOp(ZmOperation.CONTACT).setText(ZmMsg.loading);
				if (imItem) {
					if (ZmImApp.updateImMenuItemByAddress(imItem, address, false)) {
						imItem.setText(ZmMsg.loading);
					} else {
						imItem = null;	// done updating item, didn't need server call
					}
				}
				this._participantActionMenu.popup(0, ev.docX, ev.docY);
				var respCallback = new AjxCallback(this, this._handleResponseGetContact, [imItem, address, ev]);
				contactsApp.getContactByEmail(address.getAddress(), respCallback);
			}
		} else if (imItem) {
			// since contacts app is disabled, we won't be making a server call
			ZmImApp.updateImMenuItemByAddress(imItem, address, true);
			this._participantActionMenu.popup(0, ev.docX, ev.docY);
		}
	} else {
		var actionMenu = this.getActionMenu();
		this._setupSpamButton(actionMenu);
		this._enableFlags(actionMenu, hasUnread, hasRead);
		actionMenu.popup(0, ev.docX, ev.docY);
		if (ev.ersatz) {
			// menu popped up via keyboard nav
			actionMenu.setSelectedItem(0);
		}
	}
};

ZmMailListController.prototype._handleResponseGetContact =
function(imItem, address, ev, contact) {

	this._actionEv.contact = contact;
	this._setContactText(contact != null);

	if (imItem) {
		if (contact) {
			ZmImApp.updateImMenuItemByContact(imItem, contact, address);
		} else {
			ZmImApp.handleResponseGetContact(imItem, address, true);
		}
	}
	this._participantActionMenu.popup(0, ev.docX, ev.docY);
};

// Operation listeners

ZmMailListController.prototype._markReadListener =
function(ev) {
	var callback = this._getMarkReadCallback();
	this._doMarkRead(this._listView[this._currentView].getSelection(), true, callback);
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
	var view = this._listView[this._currentView];
	var items = view.getSelection();

	if (this.isReadingPaneOn() && appCtxt.get(ZmSetting.MARK_MSG_READ) == -1) {
		// check if current message being read is the message in the selection list
		var msg = view.parent.getMsgView ? view.parent.getMsgView().getMsg() : null;
		if (msg && msg.readReceiptRequested) {
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				var itemId = (item.id < 0) ? (item.id*(-1)) : item.id;
				if (itemId == msg.id) {
					return (new AjxCallback(this, this.sendReadReceipt, msg));
				}
			}
		}
	}
	return null;
};

ZmMailListController.prototype._markUnreadListener =
function(ev) {
	this._doMarkRead(this._listView[this._currentView].getSelection(), false);
};

ZmMailListController.prototype._replyListener =
function(ev) {
	var action = ev.item.getData(ZmOperation.KEY_ID);
	if (!action || action == ZmOperation.REPLY_MENU) {
		action = ZmOperation.REPLY;
	}

	this._doAction({ev:ev, action:action});
};

ZmMailListController.prototype._forwardListener =
function(ev) {
	var action = ev.item.getData(ZmOperation.KEY_ID);
	this._doAction({ev:ev, action:action});
};

// This method may be called with a null ev parameter
ZmMailListController.prototype._doAction =
function(params) {

	// get msg w/ addrs to select identity from - don't load it yet (no callback)
	var msg = this.getMsg(params);
	if (!msg) { return; }

	// use resolved msg to figure out identity/persona to use for compose
	var collection = appCtxt.getIdentityCollection();
	var identity = collection.selectIdentity(msg);

	var action = params.action;
	if (!action || action == ZmOperation.FORWARD_MENU || action == ZmOperation.FORWARD)	{
		action = params.action = (appCtxt.get(ZmSetting.FORWARD_INCLUDE_ORIG) == ZmSetting.INC_ATTACH)
			? ZmOperation.FORWARD_ATT : ZmOperation.FORWARD_INLINE;

		if (msg.isInvite()) {
			action = params.action = ZmOperation.FORWARD_ATT;
		}
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
	}

	// bug: 38928 - if user viewed entire truncated message, fetch the whole
	// thing when replying/forwarding
	if (action != ZmOperation.NEW_MESSAGE ||
		action != ZmOperation.DRAFT)
	{
		if (msg.viewEntireMessage) {
			params.noTruncate = true;
			params.forceLoad = true;
		}
	}

	var respCallback = new AjxCallback(this, this._handleResponseDoAction, params);
	// TODO: pointless to load msg when forwarding as att
	this._getLoadedMsg(params, respCallback);
};

ZmMailListController.prototype._handleResponseDoAction =
function(params, msg) {

	if (!msg) { return; }

	msg._instanceDate = params.instanceDate;

	params.inNewWindow = (!appCtxt.isChildWindow && this._app._inNewWindow(params.ev));

	// special handling for multiple forward action
	var action = params.action;
	if (action == ZmOperation.FORWARD_ATT || action == ZmOperation.FORWARD_INLINE) {

        // bug 43428 - invitation should be forwarded using apt forward view        
        if(msg.isInvite()) {
            var newAppt = AjxDispatcher.run("GetCalController").newApptObject(new Date(), null, null, msg);
            newAppt.setForwardMode(true);
            newAppt.setFromMailMessageInvite(msg);
            AjxDispatcher.run("GetApptComposeController").forwardInvite(newAppt);
            return;
        }

		// reset the action if user is forwarding multiple mail items inline
		var cview = this._listView[this._currentView];
		var selection, selCount;
		if (cview) {
			selection = cview.getSelection();
			selCount = selection.length;
			if (cview && (action == ZmOperation.FORWARD_INLINE) && (selCount > 1)) {
				action = params.action = ZmOperation.FORWARD_ATT;
			}
		}
		if (action == ZmOperation.FORWARD_ATT && selCount > 1) {
			// get msg Id's for each conversation selected
			var batchCmd = new ZmBatchCommand();
			var callback = new AjxCallback(this, this._handleLoadMsgs, [params, selection]);
			for (var i = 0; i < selCount; i++) {
				var item = selection[i];
				if (item.type == ZmItem.CONV) {
					// null args are so that batchCmd is passed as 3rd arg
					var cb = new AjxCallback(item, item.loadMsgs, [null, null]);
					batchCmd.add(cb);
				}
			}

			if (batchCmd._cmds.length > 0) {
				batchCmd.run(callback);
			} else {
				this._handleLoadMsgs(params, selection);
			}
			return;
		}
	} else if (appCtxt.isOffline && action == ZmOperation.DRAFT) {
		var folder = appCtxt.getById(msg.folderId);
		params.accountName = folder && folder.getAccount().name;
	}else if(action == ZmOperation.DECLINE_PROPOSAL) {
        params.subjOverride = this._getInviteReplySubject(action) + msg.subject;        
    }

	params.msg = msg;
	AjxDispatcher.run("Compose", params);
};

ZmMailListController.prototype._handleLoadMsgs =
function(params, selection) {
	var msgIds = new AjxVector();
	for (var i = 0; i < selection.length; i++) {
		var item = selection[i];
		if (item.type == ZmItem.CONV) {
			msgIds.addList(item.msgIds);
		} else {
			if (!msgIds.contains(item.id)) {
				msgIds.add(item.id);
			}
		}
	}
	params.msgIds = msgIds.getArray();

	AjxDispatcher.run("Compose", params);
};

ZmMailListController.prototype._doMarkRead =
function(items, on, callback) {

	var params = {items:items, value:on, callback:callback};
	var list = this._setupContinuation(this._doMarkRead, [on, callback], params);
	list.markRead(params);
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

	this._listView[this._currentView]._itemToSelect = this._getNextItemToSelect();
	items = AjxUtil.toArray(items);

	var params = {items:items, markAsSpam:markAsSpam, folder:folder, childWin:appCtxt.isChildWindow && window};
	var allDoneCallback = new AjxCallback(this, this._checkItemCount);
	var list = this._setupContinuation(this._doSpam, [markAsSpam, folder], params, allDoneCallback);
	list.spamItems(params);
};

ZmMailListController.prototype._inviteReplyHandler =
function(ev) {

	var ac = window.parentAppCtxt || window.appCtxt;

	this._listView[this._currentView]._itemToSelect = this._getNextItemToSelect();
	ac.getAppController().focusContentPane();
	
	var type = ev._inviteReplyType;
    var folderId = ev._inviteReplyFolderId || ZmOrganizer.ID_CALENDAR;
	var compId = ev._inviteComponentId;
	if (type == ZmOperation.PROPOSE_NEW_TIME ) {
        var newAppt = AjxDispatcher.run("GetCalController").newApptObject(new Date(), null, null, ev._msg);
        newAppt.setProposeTimeMode(true);
        newAppt.setFromMailMessageInvite(ev._msg);
        AjxDispatcher.run("GetApptComposeController").proposeNewTime(newAppt);
    }else if (type == ZmOperation.ACCEPT_PROPOSAL ) {
        this._acceptProposedTime(compId, ev._msg);        
    }else if (type == ZmOperation.DECLINE_PROPOSAL ) {
        this._declineProposedTime(compId, ev._msg);
    }else if (type == ZmOperation.INVITE_REPLY_ACCEPT ||
		type == ZmOperation.EDIT_REPLY_CANCEL ||
		type == ZmOperation.INVITE_REPLY_DECLINE ||
		type == ZmOperation.INVITE_REPLY_TENTATIVE)
	{
		this._editInviteReply(ZmMailListController.INVITE_REPLY_MAP[type], compId, null, null, folderId);
	}else {
		var accountName = ac.multiAccounts && ac.accountList.mainAccount.name;
		var resp = this._sendInviteReply(type, compId, null, accountName, null, ev._msg, folderId);
		if (resp && appCtxt.isChildWindow) {
			window.close();
		}
	}
	return false;
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

ZmMailListController.prototype._acceptShareHandler =
function(ev) {
	var msg = appCtxt.getById(ev._share._msgId);
	var folder = appCtxt.getById(ZmFolder.ID_TRASH);

	this._listView[this._currentView]._itemToSelect = this._getNextItemToSelect();
	var list = msg.list || this.getList();
	var callback = (appCtxt.isChildWindow)
		? (new AjxCallback(this, this._handleAcceptShareInNewWindow)) : null;
	list.moveItems({items:[msg], folder:folder, callback:callback});
};

ZmMailListController.prototype._declineShareHandler = ZmMailListController.prototype._acceptShareHandler;

ZmMailListController.prototype._handleAcceptShareInNewWindow =
function() {
	window.close();
};

ZmMailListController.prototype.getReferenceView =
function() {
	return null;
};

ZmMailListController.prototype._createViewMenu =
function(view) {
	var btn = this._toolbar[view].getButton(ZmOperation.VIEW_MENU);
	if (!btn) { return; }

	btn.setMenu(new AjxCallback(this, this._setupViewMenuItems, [view, btn]));
	btn.noMenuBar = true;
};

ZmMailListController.prototype._createSendReceiveMenu =
function(toolbar) {
	var btn = toolbar.getButton(ZmOperation.CHECK_MAIL);
	if (!btn) { return; }

	btn.setMenu(new AjxCallback(this, this._setupSendReceiveMenuItems, [toolbar, btn]));
};

ZmMailListController.prototype._setupViewMenu =
function(view) {

	this._updateViewMenu(view);
	this._updateViewMenu(this._getReadingPanePref());
	this._updateViewMenu(appCtxt.get(ZmSetting.CONVERSATION_ORDER));

	// always reset the view menu button icon to reflect the current view
	var btn = this._toolbar[view].getButton(ZmOperation.VIEW_MENU);
	if (btn) {
		btn.setImage(ZmMailListController.GROUP_BY_ICON[view]);
	}
};

ZmMailListController.prototype._setupViewMenuItems =
function(view, btn) {

	var menu = new ZmPopupMenu(btn, null, null, this);
	btn.setMenu(menu);

	if (appCtxt.get(ZmSetting.CONVERSATIONS_ENABLED)) {
		this._setupGroupByMenuItems(view, menu);
	}
	this._setupReadingPaneMenuItems(view, menu, this.isReadingPaneOn());
	if (appCtxt.get(ZmSetting.CONVERSATIONS_ENABLED)) {
		this._setupConvOrderMenuItems(view, menu);
	}

	return menu;
};

ZmMailListController.prototype._setupSendReceiveMenuItems =
function(toolbar, btn) {
	var menu = new ZmPopupMenu(btn, null, null, this);
	btn.setMenu(menu);

	var listener = new AjxListener(this, this._sendReceiveListener);
	var list = appCtxt.accountList.visibleAccounts;
	for (var i = 0; i < list.length; i++) {
		var acct = list[i];
		if (acct.isMain) { continue; }

		var id = [ZmOperation.CHECK_MAIL, acct.id].join("-");
		var mi = menu.createMenuItem(id, {image:acct.getIcon(), text:acct.getDisplayName()});
		mi.setData(ZmOperation.MENUITEM_ID, acct.id);
		mi.addSelectionListener(listener);
	}

	return menu;
};

// If we're in the Trash folder, change the "Delete" button tooltip
ZmMailListController.prototype._setupDeleteButton =
function(parent) {
	var folder = this._getSearchFolder();
	var inTrashFolder = (folder && folder.nId == ZmFolder.ID_TRASH);
	var deleteButton = parent.getButton(ZmOperation.DELETE);
	var deleteMenuButton = parent.getButton(ZmOperation.DELETE_MENU);
	var tooltip = inTrashFolder ? ZmMsg.deletePermanentTooltip : ZmMsg.deleteTooltip;
	if (deleteButton) {
		deleteButton.setToolTipContent(ZmOperation.getToolTip(ZmOperation.DELETE, ZmKeyMap.MAP_NAME_R[this.getKeyMapName()], tooltip));
	}
	if (deleteMenuButton) {
		deleteMenuButton.setToolTipContent(ZmOperation.getToolTip(ZmOperation.DELETE_MENU, ZmKeyMap.MAP_NAME_R[this.getKeyMapName()], tooltip));
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
							(!folder && folderId == ZmFolder.ID_SPAM)); // fall back
		item.setText(inSpamFolder ? ZmMsg.notJunk : ZmMsg.junk);
		item.setImage(inSpamFolder ? 'Inbox' : 'JunkMail');
		if (item.setToolTipContent) {
			var tooltip = inSpamFolder ? ZmMsg.notJunkTooltip : ZmMsg.junkTooltip;
			item.setToolTipContent(ZmOperation.getToolTip(ZmOperation.SPAM, ZmKeyMap.MAP_NAME_R[this.getKeyMapName()], tooltip));
		}
	}
};

ZmMailListController.prototype._setupEditButton =
function(parent) {
	if (!parent) { return; }

	var item = parent.getOp(ZmOperation.EDIT);
	if (item) {
		item.setText(ZmMsg.editAsNew);
	}
};

ZmMailListController.prototype._setupCheckMailButton =
function(parent) {
	var checkMailBtn = parent ? parent.getButton(ZmOperation.CHECK_MAIL) : null;
	if (!checkMailBtn) { return; }

	var folderId = this._getSearchFolderId();
	var folder = appCtxt.getById(folderId);
	var isInbox = (folderId == ZmFolder.ID_INBOX);
	var isFeed = (folder && folder.isFeed());
	var hasExternalAccounts = false;

	var isEnabled = appCtxt.get(ZmSetting.POP_ACCOUNTS_ENABLED) || appCtxt.get(ZmSetting.IMAP_ACCOUNTS_ENABLED);
	if (folder && !isInbox && !isFeed && isEnabled) {
		hasExternalAccounts = folder.isDataSource(null, true);
	}

	if (!isInbox && isFeed) {
		checkMailBtn.setText(ZmMsg.checkFeed);
		checkMailBtn.setToolTipContent(ZmMsg.checkRssTooltip);
	}
	else if (!isInbox && hasExternalAccounts) {
		checkMailBtn.setText(ZmMsg.checkExternalMail);
		checkMailBtn.setToolTipContent(ZmMsg.checkExternalMail);
	}
	else {
		var checkMailMsg = appCtxt.isOffline ? ZmMsg.sendReceive : ZmMsg.checkMail;
		checkMailBtn.setText(checkMailMsg);

		var tooltip;
		if (appCtxt.isOffline) {
			tooltip = ZmMsg.sendReceive;
		} else {
			tooltip = (appCtxt.get(ZmSetting.GET_MAIL_ACTION) == ZmSetting.GETMAIL_ACTION_DEFAULT)
				? ZmMsg.checkMailPrefDefault : ZmMsg.checkMailPrefUpdate;
		}
		checkMailBtn.setToolTipContent(tooltip);
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
	var sel = this._listView[this._currentView].getSelection();
	return (sel && sel.length) ? sel[0] : null;
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
	if (msg._loaded) {
		callback.run(msg);
	} else {
		if (msg.id == this._pendingMsg) { return; }
		msg._loadPending = true;
		this._pendingMsg = msg.id;
		// use prototype in callback because these functions are overridden by ZmConvListController
		var respCallback = new AjxCallback(this, ZmMailListController.prototype._handleResponseGetLoadedMsg, [callback, msg]);
		msg.load({getHtml:params.getHtml, markRead:params.markRead, callback:respCallback, noBusyOverlay:false});
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

        if(isResourceInvite) {
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

    if(isResourceInvite) {
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
    var callback = new AjxCallback(this, this._handleAcceptDeclineProposedTime, [origMsg]);
    var controller = AjxDispatcher.run("GetCalController");
    controller.acceptProposedTime(apptId, invite, callback);
};

ZmMailListController.prototype._declineProposedTime =
function(componentId, origMsg) {
    var replyBody = this._getInviteReplyBody(ZmOperation.DECLINE_PROPOSAL, null);
    var callback = new AjxCallback(this, this._handleAcceptDeclineProposedTime, [origMsg]);
    this._doAction({action:ZmOperation.DECLINE_PROPOSAL, extraBodyText:replyBody, instanceDate:null, sendMsgCallback: callback});    
};

ZmMailListController.prototype._handleAcceptDeclineProposedTime =
function(origMsg) {
    this._doDelete([origMsg]);    
};

ZmMailListController.prototype._sendInviteReply =
function(type, componentId, instanceDate, accountName, ignoreNotifyDlg, origMsg, acceptFolderId) {
	var msg = new ZmMailMsg();
	AjxDispatcher.require("CalendarCore");

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
	return msg.sendInviteReply(true, componentId, null, errorCallback, instanceDate, accountName, ignoreNotifyDlg);
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
	var items = this._listView[this._currentView].getSelection();
	var searchFolderId = this._getSearchFolderId();
	if (appCtxt.multiAccounts) {
		var item = items[0];
		if (item) {
			searchFolderId = ZmOrganizer.getSystemId(searchFolderId, item.getAccount());
		}
	}
	var folder = appCtxt.getById(searchFolderId);
	var markAsSpam = !(folder && folder.nId == ZmFolder.ID_SPAM);
	this._doSpam(items, markAsSpam);
};

ZmMailListController.prototype._detachListener =
function(ev, callback) {
	var msg = this.getMsg();
	if (msg) {
		if (msg._loaded) {
			ZmMailMsgView.detachMsgInNewWindow(msg, false, this._msgControllerMode);
			// always mark a msg read if it is displayed in its own window
			if (msg.isUnread) {
				msg.list.markRead({items:[msg], value:true});
			}
		} else {
			ZmMailMsgView.rfc822Callback(msg.id, null, this._msgControllerMode);
		}
	}
	if (callback) { callback.run(); }
};

ZmMailListController.prototype._printListener =
function(ev) {
    var listView = this._listView[this._currentView];
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
            if(appCtxt.isOffline && item.id.split(":")[1]<0){
                ids.push(item.msgIds[0]);
            }else{
                ids.push("C:"+item.id);
            }
            var msgList = item.getMsgList();
            for(var j=0; j<msgList.length; j++) {
                if(msgList[j].showImages) {
                    showImages = true;
                    break;
                }
            }
        } else {
            ids.push(item.id);
            if (item.showImages) {
                showImages = true;
            }
        }
    }
    var url = ("/h/printmessage?id=" + ids.join(","));
    if(appCtxt.get(ZmSetting.DISPLAY_EXTERNAL_IMAGES) || showImages){
       url = url+"&xim=1";
    }
    window.open(appContextPath+url, "_blank");
};

ZmMailListController.prototype._editListener =
function(ev) {
	this._doAction({ev:ev, action:ZmOperation.DRAFT});
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
			// bug: 23268 - call explicitly from mail app (this may be mixed controller)
			if (appCtxt.get(ZmSetting.GET_MAIL_ACTION) == ZmSetting.GETMAIL_ACTION_DEFAULT) {
				appCtxt.getApp(ZmApp.MAIL).mailSearch();
			} else {
				appCtxt.getAppController().sendNoOp();
			}
		}
	}
};

ZmMailListController.prototype._handleSyncAll =
function() {
	if (appCtxt.get(ZmSetting.OFFLINE_SHOW_ALL_MAILBOXES) &&
		appCtxt.get(ZmSetting.GET_MAIL_ACTION) == ZmSetting.GETMAIL_ACTION_DEFAULT)
	{
		this._app.getOverviewContainer().highlightAllMboxes();
	}
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
		var mi = menu.createMenuItem(id, {image:ZmMailListController.GROUP_BY_ICON[id],
										  text:ZmMsg[ZmMailListController.GROUP_BY_MSG_KEY[id]],
										  shortcut:ZmMailListController.GROUP_BY_SHORTCUT[id],
										  style:DwtMenuItem.RADIO_STYLE});
		mi.setData(ZmOperation.MENUITEM_ID, id);
		mi.addSelectionListener(this._listeners[ZmOperation.VIEW]);
		if (id == this._defaultView()) {
			mi.setChecked(true, true);
		}
	}
};

// Handle participant menu.
ZmMailListController.prototype._setContactText =
function(isContact) {
	ZmListController.prototype._setContactText.call(this, isContact);
	var newOp = isContact ? ZmOperation.EDIT_CONTACT : ZmOperation.NEW_CONTACT;
	var newText = isContact ? null : ZmMsg.AB_ADD_CONTACT;
	ZmOperation.setOperation(this._participantActionMenu, ZmOperation.CONTACT, newOp, newText);
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

	var folderId = this._getSearchFolderId();
	var folder = folderId && appCtxt.getById(folderId);

	parent.enable(ZmOperation.PRINT, num > 0);

	if (folder && folder.nId == ZmOrganizer.ID_SYNC_FAILURES) {
		parent.enableAll(false);
		parent.enable([ZmOperation.NEW_MENU, ZmOperation.CHECK_MAIL], true);
		parent.enable([ZmOperation.DELETE, ZmOperation.FORWARD], num > 0);
		return;
	}

	if (parent && parent instanceof ZmToolBar) {
		// bug fix #37154 - disable non-applicable buttons if rfc/822 message
		var isRfc822 = appCtxt.isChildWindow && window.newWindowParams && window.newWindowParams.isRfc822;

		if (isRfc822 || (folder && folder.isReadOnly() && num > 0)) {
			parent.enable([ZmOperation.DELETE, ZmOperation.MOVE, ZmOperation.SPAM, ZmOperation.TAG_MENU], false);
		} else {
			var item;
			if (num == 1 && (folderId != ZmFolder.ID_DRAFTS)) {
				var sel = this._listView[this._currentView].getSelection();
				if (sel && sel.length) {
					item = sel[0];
				}
			}
			var isDrafts = (item && item.isDraft) || (folderId == ZmFolder.ID_DRAFTS);
			var isFeed = (folder && folder.isFeed());
			parent.enable([ZmOperation.REPLY, ZmOperation.REPLY_ALL], (!isDrafts && !isFeed && num == 1));
			parent.enable(ZmOperation.DETACH, (appCtxt.get(ZmSetting.DETACH_MAILVIEW_ENABLED) && !isDrafts && num == 1));
			parent.enable([ZmOperation.SPAM, ZmOperation.MOVE, ZmOperation.FORWARD], (!isDrafts && num > 0));
			parent.enable([ZmOperation.CHECK_MAIL, ZmOperation.VIEW_MENU], true);
			var editButton = parent.getOp(ZmOperation.EDIT);
			if (editButton) {
				editButton.setVisible(isDrafts);
			}
		}
	} else {
		if (folder && folder.isReadOnly() && num > 0) {
			parent.enable([ZmOperation.DELETE, ZmOperation.MOVE, ZmOperation.SPAM, ZmOperation.TAG_MENU], false);
		} else {
			parent.enable([ZmOperation.SPAM], (!isDrafts && num > 0));
		}
	}

	if (this._draftsActionMenu) {
		var editMenu = this._draftsActionMenu.getOp(ZmOperation.EDIT);
		if (editMenu) {
			// Enable|disable 'edit' context menu item based on selection count
			editMenu.setEnabled(num == 1);
		}
	}

	if (appCtxt.multiAccounts && num > 1 &&
		appCtxt.getCurrentSearch().isMultiAccount())
	{
		parent.enable(ZmOperation.TAG_MENU, false);
	}
};

// Enable mark read/unread as appropriate.
ZmMailListController.prototype._enableFlags =
function(menu, hasUnread, hasRead) {
	menu.enable([ZmOperation.MARK_READ, ZmOperation.MARK_UNREAD], true);
	if (!hasUnread) {
		menu.enable(ZmOperation.MARK_READ, false);
	}
	if (!hasRead) {
		menu.enable(ZmOperation.MARK_UNREAD, false);
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
function(currentItem, forward) {

	var newItem = this._getNextItem(currentItem, forward);
	if (newItem) {
		var lv = this._listView[this._currentView];
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
		this._listView[this._currentView].emulateDblClick(newItem);
	}
};

ZmMailListController.prototype._getMenuContext =
function() {
	return this._getViewType();
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

	var lv = this._listView[this._currentView];
	var list = lv.getList(true).getArray();
	var size = list.length;
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
