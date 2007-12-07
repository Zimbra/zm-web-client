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
 * Creates a new, empty mail list controller.
 * @constructor
 * @class
 * This class encapsulates controller behavior that is common to lists of mail items.
 * Operations such as replying and marking read/unread are supported.
 *
 * @author Conrad Damon
 *
 * @param container	containing shell
 * @param mailApp	containing app
 */
ZmMailListController = function(container, mailApp) {

	if (arguments.length == 0) { return; }
	ZmListController.call(this, container, mailApp);

	ZmMailListController.INVITE_REPLY_MAP = {};
	ZmMailListController.INVITE_REPLY_MAP[ZmOperation.INVITE_REPLY_ACCEPT]		= ZmOperation.REPLY_ACCEPT;
	ZmMailListController.INVITE_REPLY_MAP[ZmOperation.INVITE_REPLY_DECLINE]		= ZmOperation.REPLY_DECLINE;
	ZmMailListController.INVITE_REPLY_MAP[ZmOperation.INVITE_REPLY_TENTATIVE]	= ZmOperation.REPLY_TENTATIVE;

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
ZmMailListController.GROUP_BY_ICON = {};
ZmMailListController.GROUP_BY_MSG_KEY = {};
ZmMailListController.GROUP_BY_VIEWS = [];

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

ZmMailListController.READING_PANE_MENU_ITEM_ID = "RP";

// Public methods

ZmMailListController.prototype.toString =
function() {
	return "ZmMailListController";
};

/**
 * Handles switching views based on action from view menu.
 *
 * @param view		[constant]		the id of the new view
 * @param force		[boolean]		if true, always redraw view
 */
ZmMailListController.prototype.switchView =
function(view, force) {
	if (view) {
		var groupBySetting = ZmMailListController.GROUP_BY_SETTING[view];
		if (groupBySetting && (groupBySetting != this._app._groupBy)) {
			this._app._groupBy = groupBySetting;
		} else if (!force) {
			return;
		}
		var sortBy = appCtxt.get(ZmSetting.SORTING_PREF, view);
		var limit = appCtxt.get(ZmSetting.PAGE_SIZE); // bug fix #3365
		var getHtml = appCtxt.get(ZmSetting.VIEW_AS_HTML);
		var groupByItem = this._app.getGroupMailBy();
		var params = {types:[groupByItem], offset:0, limit:limit, sortBy:sortBy, getHtml:getHtml};
		appCtxt.getSearchController().redoSearch(this._app.currentSearch, null, params);
	}
};

// override if reading pane is supported
ZmMailListController.prototype._setupReadingPaneMenuItem = function() {};

ZmMailListController.prototype.getUnderlyingList = function() {};

ZmMailListController.prototype.getKeyMapName =
function() {
	return "ZmMailListController";
};

// We need to stay in sync with what's allowed by _resetOperations
ZmMailListController.prototype.handleKeyAction =
function(actionCode) {
	DBG.println(AjxDebug.DBG3, "ZmMailListController.handleKeyAction");

	var folderId = this._getSearchFolderId();
	var folder = folderId ? appCtxt.getById(folderId) : null;

	var isDrafts = (folderId == ZmFolder.ID_DRAFTS);
	var lv = this._listView[this._currentView];
	var num = lv.getSelectionCount();

	// check for action code with argument, eg MoveToFolder3
	var origActionCode = actionCode;
	var shortcut = ZmShortcut.parseAction("ZmMailListController", actionCode);
	if (shortcut) {
		actionCode = shortcut.baseAction;
	}

	switch (actionCode) {
		case ZmKeyMap.REPLY:
		case ZmKeyMap.REPLY_ALL:
		case ZmKeyMap.FORWARD_INLINE:
		case ZmKeyMap.FORWARD_ATT:
			if (!isDrafts && num == 1) {
				this._doAction({action:ZmMailListController.ACTION_CODE_TO_OP[actionCode]});
			}
			break;

		case ZmKeyMap.FORWARD:
			if (!isDrafts && num == 1) {
				this._doAction({action:ZmOperation.FORWARD});
			}
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
			if (num && !(isDrafts && actionCode != ZmKeyMap.MOVE_TO_TRASH)) {
				folderId = ZmMailListController.ACTION_CODE_TO_FOLDER_MOVE[actionCode];
				folder = appCtxt.getById(folderId);
				var items = lv.getSelection();
				this._doMove(items, folder);
			}
			break;

		case ZmKeyMap.SPAM:
			if (num && !isDrafts) {
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
			this.switchView(ZmController.CONVLIST_VIEW);
			break;

		case ZmKeyMap.VIEW_BY_MSG:
			this.switchView(ZmController.TRAD_VIEW);
			break;

		case ZmKeyMap.READING_PANE:
			this.switchView(ZmMailListController.READING_PANE_MENU_ITEM_ID, true);
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
						frag = item.getInvite().getToolTip();
					} else {
						frag = item.fragment ? item.fragment : ZmMsg.fragmentIsEmpty;
						if (frag != "") { lv.setToolTipContent(AjxStringUtil.htmlEncode(frag)); }
					}
					var tooltip = this._shell.getToolTip()
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
			var size = lv.size();
			if (size) {
				var list = lv.getList().getArray();
				var sel = lv.getSelection();
				var start, index;
				if (sel && sel.length) {
					start = (actionCode == ZmKeyMap.NEXT_UNREAD) ? sel[sel.length - 1] : sel[0];
				} else {
					start = (actionCode == ZmKeyMap.NEXT_UNREAD) ? list[0] : list[list.length - 1];
				}
				if (start) {
					if (sel && sel.length) {
						index = (actionCode == ZmKeyMap.NEXT_UNREAD) ? lv._getItemIndex(start) + 1 :
																	   lv._getItemIndex(start) - 1;
					} else {
						index = lv._getItemIndex(start);
					}
					var unreadItem = null;
					while ((index >= 0 && index < size) && !unreadItem) {
						var item = list[index];
						if (item.isUnread) {
							unreadItem = item;
						} else {
							(actionCode == ZmKeyMap.NEXT_UNREAD) ? index++ : index--;
						}
					}
					if (unreadItem) {
						lv._unmarkKbAnchorElement(true);
						lv.setSelection(unreadItem);
						var el = lv._getElFromItem(unreadItem);
						if (el) {
							lv._scrollList(el);
						}
					}
				}
			}
			break;

		case ZmKeyMap.GOTO_FOLDER:
			folder = appCtxt.getById(shortcut.arg);
			if (folder) {
				appCtxt.getSearchController().search({query: folder.createQuery()});
			}
			break;

		case ZmKeyMap.MOVE_TO_FOLDER:
			// Handle action code like "MoveToFolder3"
			if (!folder || (folder && !folder.isReadOnly())) {
				if (num && !isDrafts) {
					folder = appCtxt.getById(shortcut.arg);
					if (folder) {
						var items = lv.getSelection();
						this._doMove(items, folder);
					}
				}
			}
			break;

		default:
			return ZmListController.prototype.handleKeyAction.call(this, origActionCode);
	}
	return true;
};

// Private and protected methods

// Creates a participant menu in addition to standard initialization.
ZmMailListController.prototype._initialize =
function(view) {

	this._setActiveSearch(view);

	// call base class
	ZmListController.prototype._initialize.call(this, view);

	if (!this._participantActionMenu) {
		var menuItems = this._participantOps();
		menuItems.push(ZmOperation.SEP);
		var ops = this._getActionMenuOps();
		if (ops && ops.length) {
			menuItems = menuItems.concat(ops);
		}
    	this._participantActionMenu = new ZmActionMenu({parent:this._shell, menuItems:menuItems});
    	this._addMenuListeners(this._participantActionMenu);
		this._participantActionMenu.addPopdownListener(this._popdownListener);
		this._setupTagMenu(this._participantActionMenu);
    }
};

ZmMailListController.prototype._initializeToolBar =
function(view, arrowStyle) {
	if (!this._toolbar[view]) {
		ZmListController.prototype._initializeToolBar.call(this, view);
		this._setupViewMenu(view, true);
		this._setReplyText(this._toolbar[view]);
		this._toolbar[view].addFiller();
		arrowStyle = arrowStyle ? arrowStyle : ZmNavToolBar.SINGLE_ARROWS;
		var tb = new ZmNavToolBar(this._toolbar[view], DwtControl.STATIC_STYLE, null, arrowStyle, true);
		this._setNavToolBar(tb, view);

		// nuke the text for tag menu for 800x600 resolutions
		if (AjxEnv.is800x600orLower) {
			var buttons = [];
			if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
				buttons.push(ZmOperation.TAG_MENU);
			}

			if (appCtxt.get(ZmSetting.REPLY_MENU_ENABLED)) {
				buttons.push(ZmOperation.REPLY, ZmOperation.REPLY_ALL);
			}
			if (appCtxt.get(ZmSetting.FORWARD_MENU_ENABLED)) {
				buttons.push(ZmOperation.FORWARD);
			}

			for (var i = 0; i < buttons.length; i++) {
				var button = tb.getButton(buttons[i]);
				if (button) {
					button.setText("");
				}
			}
		}
	}

	this._setupViewMenu(view, false);
	this._setupDeleteButton(this._toolbar[view]);
	this._setupSpamButton(this._toolbar[view]);
	this._setupReplyForwardOps(this._toolbar[view]);
	this._setupCheckMailButton(this._toolbar[view]);

	// reset new button properties
	this._setNewButtonProps(view, ZmMsg.compose, "NewMessage", "NewMessageDis", ZmOperation.NEW_MESSAGE);
};

ZmMailListController.prototype._initializeActionMenu =
function() {
	ZmListController.prototype._initializeActionMenu.call(this);

	if (this._actionMenu) {
		this._setupSpamButton(this._actionMenu);
		this._setupReplyForwardOps(this._actionMenu);
	}
};

// Groups of mail-related operations

ZmMailListController.prototype._standardToolBarOps =
function() {
	var list = [ZmOperation.NEW_MENU, ZmOperation.SEP];
	list.push(appCtxt.get(ZmSetting.OFFLINE) ? ZmOperation.SYNC_OFFLINE : ZmOperation.CHECK_MAIL);
	list = list.concat([ZmOperation.SEP,
						ZmOperation.DELETE, ZmOperation.MOVE,
						ZmOperation.PRINT_ONE, ZmOperation.SEP]);
	return list;
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

	list.push(ZmOperation.EDIT);

	return list;
};

ZmMailListController.prototype._setActiveSearch =
function(view) {
	// save info. returned by search result
	if (this._activeSearch) {
		if (this._list)
			this._list.setHasMore(this._activeSearch.getAttribute("more"));

		var newOffset = parseInt(this._activeSearch.getAttribute("offset"));
		if (this._listView[view])
			this._listView[view].setOffset(newOffset);
	}
};


// List listeners

// Based on context, enable read/unread operation, add/edit contact.
ZmMailListController.prototype._listActionListener =
function(ev) {
	ZmListController.prototype._listActionListener.call(this, ev);

	var items = this._listView[this._currentView].getSelection();

	// enable/disable mark as read/unread as necessary
	var bHasRead = false;
	var bHasUnread = false;

	// dont bother checking for read/unread state for read-only folders
	var folderId = this._getSearchFolderId();
	var folder = folderId ? appCtxt.getById(folderId) : null;
	if (!folder || (folder && !folder.isReadOnly())) {
		for (var i = 0; i < items.length; i++) {
			(items[i].isUnread) ? bHasUnread = true : bHasRead = true;
			if (bHasUnread && bHasRead) { break; }
		}
	}

	// bug fix #3602
	var address = (ev.field == ZmItem.F_PARTICIPANT) ? ev.detail :
		((ev.item instanceof ZmMailMsg) ? ev.item.getAddress(AjxEmailAddress.FROM) : null);

	if (address && items.length == 1 &&	(ev.field == ZmItem.F_PARTICIPANT || ev.field == ZmItem.F_FROM)) {
		// show participant menu
		this._setTagMenu(this._participantActionMenu);
		this._actionEv.address = address;
		if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
			var contacts = AjxDispatcher.run("GetContacts");
			var c = this._actionEv.contact = contacts.getContactByEmail(this._actionEv.address.getAddress());
			this._setContactText(c != null);
			if (appCtxt.get(ZmSetting.IM_ENABLED) && ZmImApp.loggedIn()) {
				var buddy = c && c.getBuddy();
				this._participantActionMenu.getOp(ZmOperation.IM).setEnabled(buddy != null);
				if (buddy) {
					this._participantActionMenu.getOp(ZmOperation.IM).setImage(buddy.getPresence().getIcon());
				}
			}
		}
		this._setupSpamButton(this._participantActionMenu);
		this._enableFlags(this._participantActionMenu, bHasUnread, bHasRead);
		this._participantActionMenu.popup(0, ev.docX, ev.docY);
	}
	else {
		var actionMenu = this.getActionMenu();
		this._enableFlags(actionMenu, bHasUnread, bHasRead);
		actionMenu.popup(0, ev.docX, ev.docY);
		if (ev.ersatz) {
			// menu popped up via keyboard nav
			actionMenu.setSelectedItem(0);
		}
	}
};

// Operation listeners

ZmMailListController.prototype._markReadListener =
function(ev) {
	this._doMarkRead(this._listView[this._currentView].getSelection(), true);
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
	var msg = this._getMsg(params);
	if (!msg) { return; }
	
	// use resolved msg to figure out identity/persona to use for compose
	var collection = appCtxt.getIdentityCollection();
	var identity = collection.selectIdentity(msg);

	var action = params.action;
	if (!action || action == ZmOperation.FORWARD_MENU || action == ZmOperation.FORWARD)	{
		action = params.action = (identity.getForwardOption() == ZmSetting.INCLUDE_ATTACH) ?
									ZmOperation.FORWARD_ATT : ZmOperation.FORWARD_INLINE;
	}

	// if html compose is allowed and if opening draft always request html
	//   otherwise check if user prefers html or
	//   msg hasn't been loaded yet and user prefers format of orig msg
    var htmlEnabled = appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED);
	var prefersHtml = (identity.getComposeAsFormat() == ZmSetting.COMPOSE_HTML);
	var sameFormat = identity.getComposeSameFormat();
	params.getHtml = (htmlEnabled && (action == ZmOperation.DRAFT || (prefersHtml || (!msg._loaded && sameFormat))));
	if (action == ZmOperation.DRAFT) {
		params.listController = this;
	}

	var respCallback = new AjxCallback(this, this._handleResponseDoAction, params);
	this._getLoadedMsg(params, respCallback);
};
	
ZmMailListController.prototype._handleResponseDoAction =
function(params, msg) {

	if (!msg) { return; }

	msg._instanceDate = params.instanceDate;

	params.inNewWindow = this._app._inNewWindow(params.ev);

	// special handling for multiple forward action
	var action = params.action;
	if (action == ZmOperation.FORWARD_ATT || action == ZmOperation.FORWARD_INLINE) {
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
function(items, on) {
	var list = items[0].list || this._list;
	list.markRead(items, on);
};

/*
* Marks the given items as "spam" or "not spam". Items marked as spam are moved to
* the Junk folder. If items are being moved out of the Junk folder, they will be
* marked "not spam", and the destination folder may be provided. It defaults to Inbox
* if not present.
*
* @param items		[Array]			a list of items to move
* @param folder		[ZmFolder]		destination folder
* @param attrs		[Object]		additional attrs for SOAP command
*/
ZmMailListController.prototype._doSpam =
function(items, markAsSpam, folder) {
	var list = items[0].list || this._list;
	list.spamItems(items, markAsSpam, folder);
};

ZmMailListController.prototype._syncOfflineListener =
function(ev) {
    ZmListController.prototype._syncOfflineListener.apply(this, arguments);
	this._checkMailListener(ev);
};

ZmMailListController.prototype._inviteReplyHandler =
function(ev) {
	var type = ev._inviteReplyType;
	var compId = ev._inviteComponentId;
	if (type == ZmOperation.INVITE_REPLY_ACCEPT ||
		type == ZmOperation.EDIT_REPLY_CANCEL ||
		type == ZmOperation.INVITE_REPLY_DECLINE ||
		type == ZmOperation.INVITE_REPLY_TENTATIVE)
	{
		this._editInviteReply(ZmMailListController.INVITE_REPLY_MAP[type], compId);
	}
	else
	{
		this._sendInviteReply(type, compId);
	}
	return false;
};

ZmMailListController.prototype._shareHandler =
function(ev) {
	if (ev._buttonId == ZmOperation.SHARE_ACCEPT) {
		var acceptDialog = appCtxt.getAcceptShareDialog();
		acceptDialog.setAcceptListener(this._acceptShareListener);
		acceptDialog.popup(ev._share);
	} else if (ev._buttonId == ZmOperation.SHARE_DECLINE) {
		var declineDialog = appCtxt.getDeclineShareDialog();
		declineDialog.setDeclineListener(this._declineShareListener);
		declineDialog.popup(ev._share);
	}
};

ZmMailListController.prototype._acceptShareHandler =
function(ev) {
	var cache = appCtxt.getItemCache();
	var msg = cache.get(ev._share._msgId);
	var folder = cache.get(ZmFolder.ID_TRASH);

	var list = msg.list || this.getList();
	list.moveItems(msg, folder);
};

ZmMailListController.prototype._declineShareHandler = ZmMailListController.prototype._acceptShareHandler;

ZmMailListController.prototype.getReferenceView =
function() {
	return null;
};

ZmMailListController.prototype._setupViewMenu =
function(view, firstTime) {
	var btn;

	if (firstTime) {
		var menu;
		if (appCtxt.get(ZmSetting.CONVERSATIONS_ENABLED)) {
			menu = this._setupGroupByMenuItems(view);
		}
		this._setupReadingPaneMenuItem(view, menu, this._readingPaneOn);

		btn = this._toolbar[view].getButton(ZmOperation.VIEW_MENU);
		if (btn) {
			btn.noMenuBar = true;
		}
	} else {
		// always set the switched view to be the checked menu item
		btn = this._toolbar[view].getButton(ZmOperation.VIEW_MENU);
		var menu = btn ? btn.getMenu() : null;
		var mi = menu ? menu.getItemById(ZmOperation.MENUITEM_ID, view) : null;
		if (mi) { mi.setChecked(true, true); }
	}

	// always reset the view menu button icon to reflect the current view
	btn.setImage(ZmMailListController.GROUP_BY_ICON[view]);
};

// If we're in the Trash folder, change the "Delete" button tooltip
ZmMailListController.prototype._setupDeleteButton =
function(parent) {
	var inTrashFolder = (this._getSearchFolderId() == ZmFolder.ID_TRASH);
	var deleteButton = parent.getButton(ZmOperation.DELETE);
	var deleteMenuButton = parent.getButton(ZmOperation.DELETE_MENU);
	if (deleteButton)
		deleteButton.setToolTipContent(inTrashFolder ? ZmMsg.deletePermanentTooltip : ZmMsg.deleteTooltip);
	if (deleteMenuButton)
		deleteMenuButton.setToolTipContent(inTrashFolder ? ZmMsg.deletePermanentTooltip : ZmMsg.deleteTooltip);
};

// If we're in the Spam folder, the "Spam" button becomes the "Not Spam" button
ZmMailListController.prototype._setupSpamButton =
function(parent) {
	if (!parent) { return; }

	var item = parent.getOp(ZmOperation.SPAM);
	if (item) {
		var inSpamFolder = (this._getSearchFolderId() == ZmFolder.ID_SPAM);
		item.setText(inSpamFolder ? ZmMsg.notJunk : ZmMsg.junk);
		item.setImage(inSpamFolder ? 'Inbox' : 'JunkMail');
		if (item.setToolTipContent) {
			item.setToolTipContent(inSpamFolder ? ZmMsg.notJunkTooltip : ZmMsg.junkTooltip);
		}
	}
};

ZmMailListController.prototype._setupCheckMailButton =
function(parent) {
	if (!parent) { return; }
	var checkMailBtn = parent.getButton(ZmOperation.CHECK_MAIL);
	if (!checkMailBtn) { return; }

	var folderId = this._getSearchFolderId();
	var folder = appCtxt.getById(folderId);
	var isInbox = (folderId == ZmFolder.ID_INBOX);
	var isFeed = (folder && folder.isFeed());
	var hasExternalAccounts = false;

	var isEnabled = appCtxt.get(ZmSetting.POP_ACCOUNTS_ENABLED) || appCtxt.get(ZmSetting.IMAP_ACCOUNTS_ENABLED);
	if (folder && !isInbox && !isFeed && isEnabled) {
		var dsCollection = AjxDispatcher.run("GetDataSourceCollection");
		var dataSources = dsCollection.getItemsFor(ZmOrganizer.normalizeId(folderId));
		hasExternalAccounts = dataSources.length > 0;
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
		checkMailBtn.setText(ZmMsg.checkMail);
		checkMailBtn.setToolTipContent(ZmMsg.checkMailTooltip);
	}
};

ZmMailListController.prototype._setupReplyForwardOps =
function(parent) {
	if (!parent) { return; }

	var inDraftsFolder = (this._getSearchFolderId() == ZmFolder.ID_DRAFTS);
	var ops = [];

	if (appCtxt.get(ZmSetting.REPLY_MENU_ENABLED)) {
		ops.push(ZmOperation.REPLY, ZmOperation.REPLY_ALL);
	}

	if (appCtxt.get(ZmSetting.FORWARD_MENU_ENABLED)) {
		ops.push(ZmOperation.FORWARD);
	}

	ops.push(ZmOperation.EDIT);

	for (var i = 0; i < ops.length; i++) {
		var op = ops[i];
		var show = (inDraftsFolder == (op == ZmOperation.EDIT));
		var item = parent.getOp(op);
		if (item) {
			item.setVisible(show);
		}
	}
};

/**
 * Returns the selected msg.
 */
ZmMailListController.prototype._getMsg =
function(params) {
	var sel = this._listView[this._currentView].getSelection();
	return (sel && sel.length) ? sel[0] : null;
};

/**
 * Returns the selected msg, ensuring that it's loaded.
 */
ZmMailListController.prototype._getLoadedMsg =
function(params, callback) {
	params = params || {};
	var msg = this._getMsg(params);
	if (!msg) {
		callback.run();
	}
	if (msg._loaded) {
		callback.run(msg);
	} else {
		if (msg.id == this._pendingMsg) { return; }
		appCtxt.getSearchController().setEnabled(false);
		msg._loadPending = true;
		this._pendingMsg = msg.id;
		// use prototype in callback because these functions are overridden by ZmConvListController
		var respCallback = new AjxCallback(this, ZmMailListController.prototype._handleResponseGetLoadedMsg, [callback, msg]);
		msg.load(appCtxt.get(params.getHtml || ZmSetting.VIEW_AS_HTML), false, respCallback, null, true);
	}
};

ZmMailListController.prototype._handleResponseGetLoadedMsg =
function(callback, msg) {
	if (this._pendingMsg && (msg.id != this._pendingMsg)) { return; }
	msg._loadPending = false;
	this._pendingMsg = null;
	appCtxt.getSearchController().setEnabled(true);
	callback.run(msg);
};

ZmMailListController.prototype._getInviteReplyBody =
function(type, instanceDate) {
	var replyBody;

	if (instanceDate) {
		switch (type) {
			case ZmOperation.REPLY_ACCEPT:		replyBody = ZmMsg.defaultInviteReplyAcceptInstanceMessage; break;
			case ZmOperation.REPLY_CANCEL:		replyBody = ZmMsg.apptInstanceCanceled; break;
			case ZmOperation.REPLY_DECLINE:		replyBody = ZmMsg.defaultInviteReplyDeclineInstanceMessage; break;
			case ZmOperation.REPLY_TENTATIVE: 	replyBody = ZmMsg.defaultInviteReplyTentativeInstanceMessage; break;
		}
		if (replyBody) {
			return AjxMessageFormat.format(replyBody, instanceDate);
		}
	}
	switch (type) {
		case ZmOperation.REPLY_ACCEPT:		replyBody = ZmMsg.defaultInviteReplyAcceptMessage; break;
		case ZmOperation.REPLY_CANCEL:		replyBody = ZmMsg.apptCanceled; break;
		case ZmOperation.REPLY_DECLINE:		replyBody = ZmMsg.defaultInviteReplyDeclineMessage; break;
		case ZmOperation.REPLY_TENTATIVE: 	replyBody = ZmMsg.defaultInviteReplyTentativeMessage; break;
		case ZmOperation.REPLY_NEW_TIME: 	replyBody = ZmMsg.defaultInviteReplyNewTimeMessage;	break;
	}

	return replyBody;
};

ZmMailListController.prototype._getInviteReplySubject =
function(type) {
	var replySubject = null;
	switch (type) {
		case ZmOperation.REPLY_ACCEPT:		replySubject = ZmMsg.subjectAccept + ": "; break;
		case ZmOperation.REPLY_DECLINE:		replySubject = ZmMsg.subjectDecline + ": "; break;
		case ZmOperation.REPLY_TENTATIVE:	replySubject = ZmMsg.subjectTentative + ": "; break;
		case ZmOperation.REPLY_NEW_TIME:	replySubject = ZmMsg.subjectNewTime + ": "; break;
	}
	return replySubject;
};

ZmMailListController.prototype._editInviteReply =
function(action, componentId, instanceDate, accountName) {
	var replyBody = this._getInviteReplyBody(action, instanceDate);
	this._doAction({action:action, extraBodyText:replyBody, instanceDate:instanceDate, accountName:accountName});
};

ZmMailListController.prototype._sendInviteReply =
function(type, componentId, instanceDate, accountName) {
	var msg = new ZmMailMsg();
	var contactList = AjxDispatcher.run("GetContacts");

	msg._origMsg = this._getMsg();
	msg.inviteMode = type;
	msg.isReplied = true;
	msg.isForwarded = false;
	msg.isInviteReply = true;
	var replyBody = this._getInviteReplyBody(type, instanceDate);
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
	var subject = this._getInviteReplySubject(type) + msg._origMsg.getInvite().getEventName();
	if (subject != null) {
		msg.setSubject(subject);
	}
    var errorCallback = new AjxCallback(this, this._handleErrorInviteReply);
    msg.sendInviteReply(contactList, true, componentId, null, errorCallback, instanceDate, accountName);
};

ZmMailListController.prototype._handleErrorInviteReply =
function(result) {
    if (result.code == ZmCsfeException.MAIL_NO_SUCH_ITEM) {
        var dialog = appCtxt.getErrorDialog();
        dialog.setMessage(ZmMsg.inviteOutOfDate);
        dialog.setButtonVisible(ZmErrorDialog.REPORT_BUTTON, false);
        dialog.popup();
        return true;
    }
};

ZmMailListController.prototype._spamListener =
function(ev) {
	var items = this._listView[this._currentView].getSelection();
	var markAsSpam = (this._getSearchFolderId() != ZmFolder.ID_SPAM);
	this._doSpam(items, markAsSpam);
};

ZmMailListController.prototype._detachListener =
function(ev, callback) {
	var msg = this._getMsg();
	if (msg) {
		if (msg._loaded) {
			ZmMailMsgView.detachMsgInNewWindow(msg);
		} else {
			ZmMailMsgView.rfc822Callback(msg.id);
		}
	}
	if (callback) { callback.run(); }
};

ZmMailListController.prototype._editListener =
function(ev) {
	this._doAction({ev:ev, action:ZmOperation.DRAFT});
};

ZmMailListController.prototype._checkMailListener =
function() {
    var folderId = this._getSearchFolderId();
    var folder = appCtxt.getById(folderId);
	var nFid = ZmOrganizer.normalizeId(folderId);
	var isFeed = (folder && folder.isFeed());

    if (isFeed) {
        folder.sync();
    } else {
		var dsCollection;
		var hasExternalAccounts = false;
		var isEnabled = appCtxt.get(ZmSetting.POP_ACCOUNTS_ENABLED) || appCtxt.get(ZmSetting.IMAP_ACCOUNTS_ENABLED);
		if (folder && !isFeed && isEnabled) {
			dsCollection = AjxDispatcher.run("GetDataSourceCollection");
			var dataSources = dsCollection.getItemsFor(nFid);
			hasExternalAccounts = dataSources.length > 0;
		}

        if (hasExternalAccounts) {
            dsCollection.importMailFor(nFid);
        }

        if ((nFid == ZmFolder.ID_INBOX) || !hasExternalAccounts) {
        	this._app._mailSearch();
        }
    }
};

ZmMailListController.prototype._folderSearch =
function(folderId) {
	appCtxt.getSearchController().search({query:"in:" + ZmFolder.QUERY_NAME[folderId]});
};

// Miscellaneous

// Adds "By Conversation" and "By Message" to a view menu
ZmMailListController.prototype._setupGroupByMenuItems =
function(view) {
	var viewBtn = this._toolbar[view].getButton(ZmOperation.VIEW_MENU);
	var menu = viewBtn ? viewBtn.getMenu() : null;
	if (!menu) {
		menu = new ZmPopupMenu(viewBtn);
		viewBtn.setMenu(menu);
		for (var i = 0; i < ZmMailListController.GROUP_BY_VIEWS.length; i++) {
			var id = ZmMailListController.GROUP_BY_VIEWS[i];
			var mi = menu.createMenuItem(id, {image:ZmMailListController.GROUP_BY_ICON[id],
											  text:ZmMsg[ZmMailListController.GROUP_BY_MSG_KEY[id]],
											  style:DwtMenuItem.RADIO_STYLE});
			mi.setData(ZmOperation.MENUITEM_ID, id);
			mi.addSelectionListener(this._listeners[ZmOperation.VIEW]);
			if (id == this._defaultView())
				mi.setChecked(true, true);
		}
	}
	return menu;
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
	var folder = folderId ? appCtxt.getById(folderId) : null;

	if (parent && parent instanceof ZmToolBar) {
		if (folder && folder.isReadOnly() && num > 0) {
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
			parent.enable([ZmOperation.REPLY, ZmOperation.REPLY_ALL, ZmOperation.FORWARD, ZmOperation.DETACH], (!isDrafts && num == 1));
			parent.enable([ZmOperation.SPAM, ZmOperation.MOVE, ZmOperation.FORWARD], (!isDrafts && num > 0));
            parent.enable([appCtxt.get(ZmSetting.OFFLINE) ? ZmOperation.SYNC_OFFLINE : ZmOperation.CHECK_MAIL, ZmOperation.VIEW_MENU], true);
		}
	} else {
		if (folder && folder.isReadOnly() && num > 0) {
			parent.enable([ZmOperation.DELETE, ZmOperation.MOVE, ZmOperation.SPAM, ZmOperation.TAG_MENU], false);
		} else {
			parent.enable([ZmOperation.SPAM], (!isDrafts && num > 0));
		}
	}

	// LASTLY - tags for child accounts is never allowed
	if (appCtxt.multiAccounts && !appCtxt.getActiveAccount().isMain) {
		parent.enable(ZmOperation.TAG_MENU, false);
	}
};

// Enable mark read/unread as appropriate.
ZmMailListController.prototype._enableFlags =
function(menu, bHasUnread, bHasRead) {
	menu.enable([ZmOperation.MARK_READ, ZmOperation.MARK_UNREAD], true);
	if (!bHasUnread)
		menu.enable(ZmOperation.MARK_READ, false);
	if (!bHasRead)
		menu.enable(ZmOperation.MARK_UNREAD, false);
};

/**
* This method is actually called by a pushed view's controller when a user
* attempts to page conversations (from CV) or messages (from MV ala TV).
* We want the underlying view (CLV or MLV) to update itself silently as it
* feeds the next/prev conv/msg to its respective controller.
*
* @param currentItem	[ZmItem]	current item
* @param forward		[boolean]	if true, get next item rather than previous
*/
ZmMailListController.prototype.pageItemSilently =
function(currentItem, forward) {

	// find the current item w/in its list - optimize?
	var bFound = false;
	var list = this._list.getArray();
	for (var i = 0; i < list.length; i++) {
		if (currentItem == list[i]) {
			bFound = true;
			break;
		}
	}
	if (!bFound) return;

	var itemIdx = forward ? i + 1 : i - 1;
	if (itemIdx < 0)
		throw new DwtException("Bad index!", DwtException.INTERNAL_ERROR, "ZmMailListController.pageItemSilently");

	var pageWasCached = true;
	if (itemIdx >= list.length) {
		if (this._list.hasMore()) {
			pageWasCached = this._paginate(this._currentView, true, itemIdx);
		} else {
			// ERROR: no more conv's to retrieve!
			throw new DwtException("Index has exceeded number of items in list!", DwtException.INTERNAL_ERROR, "ZmMailListController.pageItemSilently");
		}
	} else {
		// this means the conv must be cached. Find out if we need to page back/forward.
		var offset = this._listView[this._currentView].getOffset();
		var limit = this._listView[this._currentView].getLimit();
		if (itemIdx >= offset + limit) {
			pageWasCached = this._paginate(this._currentView, true);
		} else if (itemIdx < offset) {
			pageWasCached = this._paginate(this._currentView, false);
		}
	}
	if (pageWasCached) {
		var newItem = list[itemIdx];
		this._listView[this._currentView].emulateDblClick(newItem);
	}
};

/*
* Selects and displays an item that has been loaded into a page that's
* not visible (eg getting the next conv from within the last conv on a page).
*
* @param view			[constant]		current view
* @param saveSelection	[boolean]		if true, maintain current selection
* @param loadIndex		[int]			index of item to show
* @param result			[ZmCsfeResult]	result of SOAP request
*/
ZmMailListController.prototype._handleResponsePaginate =
function(view, saveSelection, loadIndex, offset, result) {
	ZmListController.prototype._handleResponsePaginate.apply(this, arguments);

	var newItem = loadIndex ? this._list.getVector().get(loadIndex) : null;
	if (newItem) {
		this._listView[this._currentView].emulateDblClick(newItem);
	}
};
