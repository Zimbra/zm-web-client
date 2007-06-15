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
* Creates a new, empty mail list controller.
* @constructor
* @class
* This class encapsulates controller behavior that is common to lists of mail items.
* Operations such as replying and marking read/unread are supported.
*
* @author Conrad Damon
* @param appCtxt	app context
* @param container	containing shell
* @param mailApp	containing app
*/
ZmMailListController = function(appCtxt, container, mailApp) {

	if (arguments.length == 0) return;
	ZmListController.call(this, appCtxt, container, mailApp);

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
	if (this._appCtxt.get(ZmSetting.REPLY_MENU_ENABLED)) {
		this._listeners[ZmOperation.REPLY] = new AjxListener(this, this._replyListener);
		this._listeners[ZmOperation.REPLY_ALL] = new AjxListener(this, this._replyListener);
	}
	
	if (this._appCtxt.get(ZmSetting.FORWARD_MENU_ENABLED)) 
		this._listeners[ZmOperation.FORWARD] = new AjxListener(this, this._forwardListener);
	//
    this._listeners[ZmOperation.EDIT] = new AjxListener(this, this._editListener);
	this._listeners[ZmOperation.CHECK_MAIL] = new AjxListener(this, this._checkMailListener);
			
	if (this._appCtxt.get(ZmSetting.SPAM_ENABLED))
		this._listeners[ZmOperation.SPAM] = new AjxListener(this, this._spamListener);

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
ZmMailListController.ACTION_CODE_TO_FOLDER[ZmKeyMap.GOTO_SENT]		= ZmFolder.ID_SENT;
ZmMailListController.ACTION_CODE_TO_FOLDER[ZmKeyMap.GOTO_TRASH]		= ZmFolder.ID_TRASH;

// convert key mapping to folder to move to
ZmMailListController.ACTION_CODE_TO_FOLDER_MOVE = {};
ZmMailListController.ACTION_CODE_TO_FOLDER_MOVE[ZmKeyMap.MOVE_TO_INBOX]	= ZmFolder.ID_INBOX;
ZmMailListController.ACTION_CODE_TO_FOLDER_MOVE[ZmKeyMap.MOVE_TO_TRASH]	= ZmFolder.ID_TRASH;
ZmMailListController.ACTION_CODE_TO_FOLDER_MOVE[ZmKeyMap.MOVE_TO_JUNK]	= ZmFolder.ID_SPAM;

// Public methods

ZmMailListController.prototype.toString = 
function() {
	return "ZmMailListController";
};

/**
 * Handles switching views based on action from view menu.
 *
 * @param view		the id of the menu item
 * @param toggle	flip state of reading pane
 */
ZmMailListController.prototype.switchView =
function(view, toggle) {
	if (view == ZmController.READING_PANE_VIEW) {
		this._toggleReadingPane(view, toggle);
	} else if (view) {
		this._app._groupBy = ZmMailListController.GROUP_BY_SETTING[view];
		var sc = this._appCtxt.getSearchController();
		var sortBy = this._appCtxt.get(ZmSetting.SORTING_PREF, view);
		var limit = this._appCtxt.get(ZmSetting.PAGE_SIZE); // bug fix #3365
		var params = {types:[ZmMailListController.GROUP_BY_ITEM[view]], offset:0, sortBy:sortBy, limit:limit};
		sc.redoSearch(this._appCtxt.getCurrentSearch(), null, params);
	}
};

// override if reading pane is supported
ZmMailListController.prototype._setupReadingPaneMenuItem = function() {};

ZmMailListController.prototype.getKeyMapName =
function() {
	return "ZmMailListController";
};

// We need to stay in sync with what's allowed by _resetOperations
ZmMailListController.prototype.handleKeyAction =
function(actionCode) {
	DBG.println(AjxDebug.DBG3, "ZmMailListController.handleKeyAction");

	var isDrafts = (this._getSearchFolderId() == ZmFolder.ID_DRAFTS);
	var lv = this._listView[this._currentView];
	var num = lv.getSelectionCount();
	
	// check for action code with argument, eg MoveToFolder3
	var origActionCode = actionCode;
	var shortcut = ZmShortcut.parseAction(this._appCtxt, "ZmMailListController", actionCode);
	if (shortcut) {
		actionCode = shortcut.baseAction;
	}

	switch (actionCode) {
		case ZmKeyMap.REPLY:
		case ZmKeyMap.REPLY_ALL:
		case ZmKeyMap.FORWARD_INLINE:
		case ZmKeyMap.FORWARD_ATT:
			if (!isDrafts && num == 1) {
				this._doAction(null, ZmMailListController.ACTION_CODE_TO_OP[actionCode]);
			}
			break;
			
		case ZmKeyMap.FORWARD:
			if (!isDrafts && num == 1) {
				this._doAction(null, ZmOperation.FORWARD);
			}
			break;
			
		case ZmKeyMap.GOTO_INBOX:
		case ZmKeyMap.GOTO_DRAFTS:
		case ZmKeyMap.GOTO_SENT:
		case ZmKeyMap.GOTO_TRASH:
			this._folderSearch(ZmMailListController.ACTION_CODE_TO_FOLDER[actionCode]);
			break;
		
		case ZmKeyMap.MOVE_TO_INBOX:
		case ZmKeyMap.MOVE_TO_TRASH:
		case ZmKeyMap.MOVE_TO_JUNK:
			if (num && !(isDrafts && actionCode != ZmKeyMap.MOVE_TO_TRASH)) {
				var folderId = ZmMailListController.ACTION_CODE_TO_FOLDER_MOVE[actionCode];
				var folder = this._appCtxt.getById(folderId);
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
			this._markReadListener();
			break;
			
		case ZmKeyMap.MARK_UNREAD:
			this._markUnreadListener();
			break;
		
		case ZmKeyMap.VIEW_BY_CONV:
			this.switchView(ZmController.CONVLIST_VIEW);
			break;
			
		case ZmKeyMap.VIEW_BY_MSG:
			this.switchView(ZmController.TRAD_VIEW);
			break;

		case ZmKeyMap.READING_PANE:
			this.switchView(ZmController.READING_PANE_VIEW, true);
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
						lv.setToolTipContent(AjxStringUtil.htmlEncode(frag));
					}
					var tooltip = this._shell.getToolTip()
					tooltip.popdown();
					tooltip.setContent(AjxStringUtil.htmlEncode(frag));
					tooltip.popup(loc.x, loc.y);
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
			var folder = this._appCtxt.getById(shortcut.arg);
			if (folder) {
				this._appCtxt.getSearchController().search({query: folder.createQuery()});
			}
			break;

		case ZmKeyMap.MOVE_TO_FOLDER:
			// Handle action code like "MoveToFolder3"
			if (num && !isDrafts) {
				var folder = this._appCtxt.getById(shortcut.arg);
				if (folder) {
					var items = lv.getSelection();
					this._doMove(items, folder);
				}
			}
			break;

		default:
			return ZmListController.prototype.handleKeyAction.call(this, origActionCode);
	}
	return true;
};

// Private and protected methods

ZmMailListController.prototype._setupViewMenu =
function(view) {
	var menu = null;
	if (this._appCtxt.get(ZmSetting.CONVERSATIONS_ENABLED)) {
		menu = this._setupGroupByMenuItems(view);
	}
	this._setupReadingPaneMenuItem(view, menu, this._appCtxt.get(ZmSetting.READING_PANE_ENABLED));
};

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
    	//fixed bug:15460 removed forward menu.
		//this._propagateMenuListeners(this._participantActionMenu, ZmOperation.REPLY_MENU);
		//this._propagateMenuListeners(this._participantActionMenu, ZmOperation.FORWARD_MENU);
		this._participantActionMenu.addPopdownListener(this._popdownListener);
		this._setupTagMenu(this._participantActionMenu);
    }
};

ZmMailListController.prototype._initializeToolBar = 
function(view, arrowStyle) {
	if (!this._toolbar[view]) {
		ZmListController.prototype._initializeToolBar.call(this, view);
		this._setupViewMenu(view);
		//fixed bug:15460 removed forward menu.
		//this._propagateMenuListeners(this._toolbar[view], ZmOperation.REPLY_MENU);
		//this._propagateMenuListeners(this._toolbar[view], ZmOperation.FORWARD_MENU);
		//
		this._setReplyText(this._toolbar[view]);
		this._toolbar[view].addFiller();
		arrowStyle = arrowStyle ? arrowStyle : ZmNavToolBar.SINGLE_ARROWS;
		var tb = new ZmNavToolBar(this._toolbar[view], DwtControl.STATIC_STYLE, null, arrowStyle, true);
		this._setNavToolBar(tb, view);

		// nuke the text for tag menu for 800x600 resolutions
		if (AjxEnv.is800x600orLower) {
			var buttons = [];
			if (this._appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
				buttons.push(ZmOperation.TAG_MENU);
			}
			//fixed bug:15460 removed forward menu.
			if (this._appCtxt.get(ZmSetting.REPLY_MENU_ENABLED)) {
															  buttons.push(ZmOperation.REPLY, ZmOperation.REPLY_ALL);
			}
			if (this._appCtxt.get(ZmSetting.FORWARD_MENU_ENABLED)) {
				buttons.push(ZmOperation.FORWARD);
			}
			//
			for (var i = 0; i < buttons.length; i++) {
				var button = tb.getButton(buttons[i]);
				if (button) {
					button.setText("");
				}
			}
		}
	}

	this._setupDeleteButton(view);
	this._setupSpamButton(view);
	this._setupReplyForwardOps(this._toolbar[view]);
	this._setupCheckMailButton(this._toolbar[view]);

	var detach = this._toolbar[view].getButton(ZmOperation.DETACH);
	if (detach) detach.setText(ZmMsg.detach2);

	// reset new button properties
	this._setNewButtonProps(view, ZmMsg.compose, "NewMessage", "NewMessageDis", ZmOperation.NEW_MESSAGE);
};

ZmMailListController.prototype._initializeActionMenu = 
function() {
	ZmListController.prototype._initializeActionMenu.call(this);

	var actionMenu = this._actionMenu;
	//fixed bug:15460 removed forward menu.
	//this._propagateMenuListeners(actionMenu, ZmOperation.REPLY_MENU);
	//this._propagateMenuListeners(actionMenu, ZmOperation.FORWARD_MENU);
	//this._setReplyText(actionMenu);
	this._setupReplyForwardOps(this._actionMenu);
};

// Groups of mail-related operations

ZmMailListController.prototype._standardToolBarOps =
function() {
	var list = [ZmOperation.NEW_MENU, ZmOperation.SEP];
	list.push(this._appCtxt.get(ZmSetting.OFFLINE) ? ZmOperation.SYNC_OFFLINE : ZmOperation.CHECK_MAIL);
	list = list.concat([ZmOperation.SEP,
						ZmOperation.DELETE, ZmOperation.MOVE,
						ZmOperation.PRINT, ZmOperation.SEP]);
	return list;
};

ZmMailListController.prototype._flagOps =
function() {
	return [ZmOperation.MARK_READ, ZmOperation.MARK_UNREAD];
};

ZmMailListController.prototype._msgOps =
function() {
	var list = [];
	
	if (this._appCtxt.get(ZmSetting.REPLY_MENU_ENABLED)) {
		list.push(ZmOperation.REPLY, ZmOperation.REPLY_ALL);
	}
	
	if (this._appCtxt.get(ZmSetting.FORWARD_MENU_ENABLED)) {
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
	
	// enable/disable mark as read/unread as necessary	
	var bHasRead = false;
	var bHasUnread = false;
	var items = this._listView[this._currentView].getSelection();
	for (var i = 0; i < items.length; i++) {
		(items[i].isUnread) ? bHasUnread = true : bHasRead = true;
		if (bHasUnread && bHasRead) { break; }
	}
	
	// bug fix #3602
	var address = (ev.field == ZmItem.F_PARTICIPANT) ? ev.detail :
		((ev.item instanceof ZmMailMsg) ? ev.item.getAddress(AjxEmailAddress.FROM) : null); // yuck
	if (address && items.length == 1 && (ev.field == ZmItem.F_PARTICIPANT || ev.field == ZmItem.F_FROM)) {
		// show participant menu
		this._setTagMenu(this._participantActionMenu);
		this._actionEv.address = address;
		if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
			var contacts = AjxDispatcher.run("GetContacts");
			var c = this._actionEv.contact = contacts.getContactByEmail(this._actionEv.address.getAddress());
			this._setContactText(c != null);
			if (this._appCtxt.get(ZmSetting.IM_ENABLED)) {
				var buddy = c && c.getBuddy();
				this._participantActionMenu.getOp(ZmOperation.IM).setEnabled(buddy != null);
				if (buddy) {
					this._participantActionMenu.getOp(ZmOperation.IM).setImage(buddy.getPresence().getIcon());
				}
			}
		}
		this._enableFlags(this._participantActionMenu, bHasUnread, bHasRead);
		this._participantActionMenu.popup(0, ev.docX, ev.docY);
	} else {
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
	if (!action || action == ZmOperation.REPLY_MENU)
		action = ZmOperation.REPLY;

	this._doAction(ev, action);
};

ZmMailListController.prototype._forwardListener =
function(ev) {
	var action = ev.item.getData(ZmOperation.KEY_ID);
	this._doAction(ev, action);
};

// This method may be called with a null ev parameter
ZmMailListController.prototype._doAction = 
function(ev, action, extraBodyText, instanceDate, accountName) {
	// check if user is forwarding more than 1 item
	var convOrMsgItems;
	var selCount = this._listView[this._currentView].getSelectionCount();
	if(selCount > 1 ||
	   action == ZmOperation.ATTACH_ALL ||
	   action == ZmOperation.FORWARD_ATT)
	{
		convOrMsgItems = this._getConvOrMsgItems(ev ? ev.item : null);
	}

	// retrieve msg and make sure it's loaded
	var msg = this._getMsg(ev ? ev.item : null);
	if (!msg) { return; }
	msg._instanceDate = instanceDate;

	// if html compose is allowed,
	//   then if opening draft always request html 
	// 	 otherwise just check if user prefers html or
	//   msg hasnt been loaded yet and user prefers format of orig. msg
	var identityCollection = AjxDispatcher.run("GetIdentityCollection");
	var identity = identityCollection.selectIdentity(msg);

	// always re-resolve forward action if forward toolbar button is clicked
    if (selCount > 1 || action == ZmOperation.FORWARD_ATT)
	{
        action = ZmOperation.ATTACH_ALL;
    }
	else if (!action ||
			 action == ZmOperation.FORWARD_MENU ||
			 action == ZmOperation.FORWARD)
	{
		action = identity.getForwardOption() == ZmSetting.INCLUDE_ATTACH
			? ZmOperation.FORWARD_ATT : ZmOperation.FORWARD_INLINE;
	}

    var htmlEnabled = this._appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED);
	var prefersHtml = identity.getComposeAsFormat() == ZmSetting.COMPOSE_HTML;
	var sameFormat = identity.getComposeSameFormat();
	
	var getHtml = (htmlEnabled && (action == ZmOperation.DRAFT || (action != ZmOperation.DRAFT && (prefersHtml || (!msg._loaded && sameFormat)))));
	var inNewWindow = this._app._inNewWindow(ev);

	if (action == ZmOperation.ATTACH_ALL) {
		this.show(this._activeSearch);
		var item = convOrMsgItems[0];
		var respCallback = new AjxCallback(this, this._handleResponseDoActionAttMsgs, [action, inNewWindow,  convOrMsgItems, extraBodyText, accountName]);
		if (item.type == ZmItem.MSG) {
			item.load(getHtml, action == ZmOperation.DRAFT, respCallback);
		} else if (item.type == ZmItem.CONV) {
            if (item.msgs) {
				item.msgs.clear();
			}
			item.load({query:this.getSearchString(), callback:respCallback});
		}
	} else {
		var respCallback = new AjxCallback(this, this._handleResponseDoAction, [action, inNewWindow, msg, extraBodyText, accountName]);
		msg.load(getHtml, action == ZmOperation.DRAFT, respCallback);
	}
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

ZmMailListController.prototype._handleResponseDoAction = 
function(action, inNewWindow, msg, extraBodyText, accountName) {
	AjxDispatcher.run("Compose", {action: action, inNewWindow: inNewWindow, msg: msg,
								  extraBodyText: extraBodyText, accountName: accountName});
};

ZmMailListController.prototype._handleResponseDoActionAttMsgs =
function(action, inNewWindow, convOrMsgArry, extraBodyText, accountName) {
	// if we try to fwd (same set of) multiple conv twice, then avoid opening multiple windows
	var _msgAttIdArry = [];
	var _msgSubArray = [];
	var msgCount = 0;

	var notLoaded = false;
	for (var i = 0; i < convOrMsgArry.length; i++)  {
		if (!convOrMsgArry[i]._loaded) {
			notLoaded = true;
			break;
		}
	}

	if (notLoaded) {
		this.show(this._activeSearch);
		var item = convOrMsgArry[i];
		var respCallback = new AjxCallback(this, this._handleResponseDoActionAttMsgs, [action, inNewWindow,  convOrMsgArry, extraBodyText, accountName]);
		if (item.type == ZmItem.MSG) {
			item.load(false, action == ZmOperation.DRAFT, respCallback);
		} else if (item.type == ZmItem.CONV) {
			item.load({query:this.getSearchString(), callback:respCallback});
		}
	} else {
		// flag to avoid opening multiple compose windows
		this._actionAlreadyHandled = true;

		for (var j = 0; j < convOrMsgArry.length; j++)  {
			var item = convOrMsgArry[j];
			if (item.type == ZmItem.MSG) {
				_msgAttIdArry[msgCount] = item.id;
				_msgSubArray[msgCount] = item.subject + this._fixFragments(item.fragment);
				msgCount++;
			} else if (item.type == ZmItem.CONV) {
				var msgs = item.msgs.getArray();
				for (var n = 0; n < msgs.length; n++) {
					var msg = msgs[n];
					_msgAttIdArry[msgCount] = msg.id;
					_msgSubArray[msgCount] = msg.subject + this._fixFragments(msg.fragment);
					msgCount++;
				}
			}
		}

		_msgAttIdArry = this._removeDupes(_msgAttIdArry);
        _msgSubArray = this._removeDupes(_msgSubArray);
		var params = { action:action,
					inNewWindow:inNewWindow,
					_msgAttIdArry:_msgAttIdArry,
					_msgSubArray:_msgSubArray,
					extraBodyText:extraBodyText,
					accountName:accountName };
		var composeMsg = AjxDispatcher.run("Compose", params);
	}
};

ZmMailListController.prototype._fixFragments =
function(fragment) {
	// max fragment length allowed
	var fixedFrag = "";
	var maxLen = 35;
	if (fragment && fragment.length > 0)
	{
		var ellipsis = fragment.length > maxLen ? "..." : "";
		fixedFrag = ["(", fragment.substring(0, maxLen), ellipsis, ")"].join("");
	}

    return fixedFrag;
};

ZmMailListController.prototype._removeDupes =
function(a) {
	var dupes = [];
	var helper = [];

	for (var i = 0; i < a.length; i++) {
		var val = a[i];
		if (typeof(helper[val]) == 'undefined') {
			dupes.push(val);
			helper[val] = true;
		}
	}
	return dupes;
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
		var acceptDialog = this._appCtxt.getAcceptShareDialog();
		acceptDialog.setAcceptListener(this._acceptShareListener);
		acceptDialog.popup(ev._share);
	} else if (ev._buttonId == ZmOperation.SHARE_DECLINE) {
		var declineDialog = this._appCtxt.getDeclineShareDialog();
		declineDialog.setDeclineListener(this._declineShareListener);
		declineDialog.popup(ev._share);
	}
};

ZmMailListController.prototype._acceptShareHandler = 
function(ev) {
	var cache = this._appCtxt.getItemCache();
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

// If we're in the Trash folder, change the "Delete" button tooltip
ZmMailListController.prototype._setupDeleteButton =
function(view) {
	var inTrashFolder = (this._getSearchFolderId() == ZmFolder.ID_TRASH);
	var deleteButton = this._toolbar[view].getButton(ZmOperation.DELETE);
	var deleteMenuButton = this._toolbar[view].getButton(ZmOperation.DELETE_MENU);
	if (deleteButton)
		deleteButton.setToolTipContent(inTrashFolder ? ZmMsg.deletePermanentTooltip : ZmMsg.deleteTooltip);
	if (deleteMenuButton)
		deleteMenuButton.setToolTipContent(inTrashFolder ? ZmMsg.deletePermanentTooltip : ZmMsg.deleteTooltip);
};

// If we're in the Spam folder, the "Spam" button becomes the "Not Spam" button
ZmMailListController.prototype._setupSpamButton = 
function(view) {
	var inSpamFolder = (this._getSearchFolderId() == ZmFolder.ID_SPAM);
	var spamButton = this._toolbar[view].getButton(ZmOperation.SPAM);
	if (spamButton) {
		spamButton.setText(inSpamFolder ? ZmMsg.notJunk : ZmMsg.junk);
		spamButton.setToolTipContent(inSpamFolder ? ZmMsg.notJunkTooltip : ZmMsg.junkTooltip);
	}
};

ZmMailListController.prototype._setupCheckMailButton = 
function(parent) {
    var folderId = this._getSearchFolderId();
    var folder = this._appCtxt.getById(folderId);

    var isInbox = (folderId == ZmFolder.ID_INBOX);
    var isFeed = (folder && folder.isFeed());
    var hasPopAccounts = false;

    if (folder && !isInbox && !isFeed && this._appCtxt.get(ZmSetting.POP_ACCOUNTS_ENABLED)) {
        var dsCollection = AjxDispatcher.run("GetDataSourceCollection");
        var popAccounts = dsCollection.getPopAccountsFor(folderId);
        hasPopAccounts = popAccounts.length > 0;
    }

    var checkMailBtn = parent.getButton(ZmOperation.CHECK_MAIL);
	if (checkMailBtn) {
		if (!isInbox && isFeed) {
			checkMailBtn.setText(ZmMsg.checkFeed);
			checkMailBtn.setToolTipContent(ZmMsg.checkRssTooltip);
		}
		else if (!isInbox && hasPopAccounts) {
			checkMailBtn.setText(ZmMsg.checkPopMail);
			checkMailBtn.setToolTipContent(ZmMsg.checkPopMail);
		}
		else {
			checkMailBtn.setText(ZmMsg.checkMail);
			checkMailBtn.setToolTipContent(ZmMsg.checkMailTooltip);
		}
	}
};

// If we're in the Spam folder, the "Spam" button becomes the "Not Spam" button
ZmMailListController.prototype._setupReplyForwardOps =
function(parent) {
	var inDraftsFolder = (this._getSearchFolderId() == ZmFolder.ID_DRAFTS);
	var ops = [];
	
	if (this._appCtxt.get(ZmSetting.REPLY_MENU_ENABLED)) {
													  ops.push(ZmOperation.REPLY, ZmOperation.REPLY_ALL);
	}
			
	if (this._appCtxt.get(ZmSetting.FORWARD_MENU_ENABLED)) {
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

ZmMailListController.prototype._getMsg =
function(item) {
	item = (item && (item instanceof ZmMailItem))
		? item
		: this._listView[this._currentView].getSelection()[0];
	if (!item) return null;
	
	var msg;
	if (item.type == ZmItem.MSG) {
		msg = item;
	} else if (item.type == ZmItem.CONV) {
		msg = item.getFirstMsg();
	}
	
	return msg;
};

// XXX: huh?
ZmMailListController.prototype._getConvOrMsgItems =
function(item) {
	var item = (item && (item instanceof ZmMailItem))
		? item
		: this._listView[this._currentView].getSelection();

	if (!item || !item[0]) { return null; }

	if (item[0].type == ZmItem.MSG || item[0].type == ZmItem.CONV) {
		return item;
	}
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
	this._doAction(null, action, replyBody, instanceDate, accountName);
};

ZmMailListController.prototype._sendInviteReply = 
function(type, componentId, instanceDate, accountName) {
	var msg = new ZmMailMsg(this._appCtxt);
	var contactList = AjxDispatcher.run("GetContacts");
	
	msg._origMsg = this._getMsg();
	msg.inviteMode = type;
	msg.isReplied = true;
	msg.isForwarded = false;
	msg.isInviteReply = true;
	var replyBody = this._getInviteReplyBody(type, instanceDate);
	if (replyBody != null) {
		var dummyAppt = new ZmAppt(this._appCtxt);
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
        var dialog = this._appCtxt.getErrorDialog();
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
function(ev) {
	var items = this._listView[this._currentView].getSelection();
	var msg = items.length ? items[0] : items;

	if (msg._loaded) {
		ZmMailMsgView.detachMsgInNewWindow(this._appCtxt, msg);
	} else {
		ZmMailMsgView.rfc822Callback(msg.id);
	}
};

ZmMailListController.prototype._editListener =
function(ev) {
	this._doAction(ev, ZmOperation.DRAFT);
};

ZmMailListController.prototype._checkMailListener =
function() {
    var folderId = this._getSearchFolderId();
    var folder = this._appCtxt.getById(folderId);
    var dsCollection;

    var isInbox = (folderId == ZmFolder.ID_INBOX);
    var isFeed = (folder && folder.isFeed());
    var hasPopAccounts = false;

    if (folder && !isFeed && this._appCtxt.get(ZmSetting.POP_ACCOUNTS_ENABLED)) {
        dsCollection = AjxDispatcher.run("GetDataSourceCollection");
        var dataSources = dsCollection.getPopAccountsFor(folderId);
        hasPopAccounts = dataSources.length > 0;
    }

    if (isFeed) {
        folder.sync();
    } else {
        if (hasPopAccounts) {
            dsCollection.importPopMailFor(folderId);
        }
        if (isInbox || !hasPopAccounts) {
        	this._app._mailSearch();
        }
    }
};

ZmMailListController.prototype._folderSearch =
function(folderId, optionalType) {
	var searchController = this._appCtxt.getSearchController();
	var type = optionalType || ZmSearchToolBar.FOR_ANY_MI;
	var types = searchController.getTypes(type);
	searchController.search({query: "in:"+ ZmFolder.QUERY_NAME[folderId], types: types});
};

// Miscellaneous

// Adds "By Conversation" and "By Message" to a view menu
ZmMailListController.prototype._setupGroupByMenuItems =
function(view) {
	var appToolbar = this._appCtxt.getCurrentAppToolbar();
	var menu = appToolbar.getViewMenu(view);
	if (!menu) {
		menu = new ZmPopupMenu(appToolbar.getViewButton());
		appToolbar.setViewMenu(view, menu);
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
	if (parent && this._appCtxt.get(ZmSetting.REPLY_MENU_ENABLED)) {
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
	if (parent && parent instanceof ZmToolBar) {
        var folderId = this._getSearchFolderId();
        var folder = this._appCtxt.getById(folderId);

		var item = null;
		if (num == 1 && (folderId != ZmFolder.ID_DRAFTS)) {
			var sel = this._listView[this._currentView].getSelection();
			if (sel && sel.length) {
				item = sel[0];
			}
		}
		var isDrafts = (item && item.isDraft) || (folderId == ZmFolder.ID_DRAFTS);
		parent.enable([ZmOperation.REPLY, ZmOperation.REPLY_ALL, ZmOperation.FORWARD, ZmOperation.DETACH], (!isDrafts && num == 1));
		parent.enable([ZmOperation.SPAM, ZmOperation.MOVE, ZmOperation.FORWARD], (!isDrafts && num > 0));
		parent.enable([ZmOperation.CHECK_MAIL], true);
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
	if (newItem)
		this._listView[this._currentView].emulateDblClick(newItem);
};

// All items in the list view are gone - show "No Results"
ZmMailListController.prototype._handleEmptyList =
function(listView) {
	listView.removeAll(true);
	listView._setNoResultsHtml();
};
