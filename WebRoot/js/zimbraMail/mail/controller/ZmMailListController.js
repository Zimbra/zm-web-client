/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
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
function ZmMailListController(appCtxt, container, mailApp) {

	if (arguments.length == 0) return;
	ZmListController.call(this, appCtxt, container, mailApp);

	this._listeners[ZmOperation.MARK_READ] = new AjxListener(this, this._markReadListener);
	this._listeners[ZmOperation.MARK_UNREAD] = new AjxListener(this, this._markUnreadListener);
	var replyLis = new AjxListener(this, this._replyListener);
	if (this._appCtxt.get(ZmSetting.REPLY_MENU_ENABLED))
		this._listeners[ZmOperation.REPLY_MENU] = replyLis;
	else {
		this._listeners[ZmOperation.REPLY] = replyLis;
		this._listeners[ZmOperation.REPLY_ALL] = replyLis;
	}
	this._listeners[ZmOperation.FORWARD] = new AjxListener(this, this._forwardListener);
	
	if (this._appCtxt.get(ZmSetting.SPAM_ENABLED))
		this._listeners[ZmOperation.SPAM] = new AjxListener(this, this._spamListener);

	this._inviteReplyListener = new AjxListener(this, this._inviteReplyHandler);
	this._shareListener = new AjxListener(this, this._shareHandler);
	
	this._acceptShareListener = new AjxListener(this, this._acceptShareHandler);
	this._declineShareListener = new AjxListener(this, this._declineShareHandler);
}

ZmMailListController.prototype = new ZmListController;
ZmMailListController.prototype.constructor = ZmMailListController;

// Stuff for the View menu
ZmMailListController.ICON = new Object();
ZmMailListController.ICON[ZmController.CONVLIST_VIEW]	= "ConversationView";
ZmMailListController.ICON[ZmController.TRAD_VIEW]		= "MessageView";

ZmMailListController.MSG_KEY = new Object();
ZmMailListController.MSG_KEY[ZmController.CONVLIST_VIEW]	= "byConversation";
ZmMailListController.MSG_KEY[ZmController.TRAD_VIEW]		= "byMessage";

ZmMailListController.GROUP_BY_VIEWS = [ZmController.CONVLIST_VIEW, ZmController.TRAD_VIEW];

// Public methods

ZmMailListController.prototype.toString = 
function() {
	return "ZmMailListController";
}

ZmMailListController.prototype.getSearchString = 
function() {
	return this._searchString;
}

// Private and protected methods

ZmMailListController.prototype._setupViewMenu = function(view) {}

// Creates a participant menu in addition to standard initialization.
ZmMailListController.prototype._initialize =
function(view) {

	// save info. returned by search result
	if (this._activeSearch) {
		if (this._list)
			this._list.setHasMore(this._activeSearch.getAttribute("more"));

		var newOffset = parseInt(this._activeSearch.getAttribute("offset"));
		if (this._listView[view])
			this._listView[view].setOffset(newOffset);
	}

	// call base class
	ZmListController.prototype._initialize.call(this, view);
	
	if (!this._participantActionMenu) {
		var menuItems = this._contactOps();
		menuItems.push(ZmOperation.SEP);
		menuItems = menuItems.concat(this._getActionMenuOps());
    	this._participantActionMenu = new ZmActionMenu(this._shell, menuItems);
		for (var i = 0; i < menuItems.length; i++)
			if (menuItems[i] > 0)
				this._participantActionMenu.addSelectionListener(menuItems[i], this._listeners[menuItems[i]]);
		this._participantActionMenu.addPopdownListener(this._popdownListener);
		this._setupTagMenu(this._participantActionMenu);
    }
}

ZmMailListController.prototype._initializeToolBar = 
function(view, arrowStyle) {
	if (!this._toolbar[view]) {
		ZmListController.prototype._initializeToolBar.call(this, view);
		this._setupViewMenu(view);
		this._propagateMenuListeners(this._toolbar[view], ZmOperation.REPLY_MENU);
		this._setReplyText(this._toolbar[view]);
		this._toolbar[view].addFiller();
		arrowStyle = arrowStyle || ZmNavToolBar.SINGLE_ARROWS;
		var tb = new ZmNavToolBar(this._toolbar[view], DwtControl.STATIC_STYLE, null, arrowStyle, true);
		this._setNavToolBar(tb);
	}

	this._setupDeleteButton(view);
	this._setupSpamButton(view);

	// reset new button properties
	this._setNewButtonProps(view, ZmMsg.compose, "NewMessage", "NewMessageDis", ZmOperation.NEW_MESSAGE);
}

ZmMailListController.prototype._initializeActionMenu = 
function() {
	if (this._actionMenu) return;
	
	ZmListController.prototype._initializeActionMenu.call(this);
	this._propagateMenuListeners(this._actionMenu, ZmOperation.REPLY_MENU);
	this._setReplyText(this._actionMenu);
}

// Groups of mail-related operations

ZmMailListController.prototype._flagOps =
function() {
	return ([ZmOperation.MARK_READ, ZmOperation.MARK_UNREAD]);
}

ZmMailListController.prototype._msgOps =
function() {
	var list = new Array();
	if (this._appCtxt.get(ZmSetting.REPLY_MENU_ENABLED))
		list.push(ZmOperation.REPLY_MENU, ZmOperation.FORWARD);
	else
		list.push(ZmOperation.REPLY, ZmOperation.REPLY_ALL, ZmOperation.FORWARD);
	return list;
}

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
		if (bHasUnread && bHasRead)
			break;
	}
	
	// bug fix #3602
	var address = ev.field == ZmListView.FIELD_PREFIX[ZmItem.F_PARTICIPANT] 
		? ev.detail 
		: ((ev.item instanceof ZmContact) ? ev.item.getAddress(ZmEmailAddress.FROM) : null); // yuck
	if (address && items.length == 1 && 
		(ev.field == ZmListView.FIELD_PREFIX[ZmItem.F_PARTICIPANT] || 
		 ev.field == ZmListView.FIELD_PREFIX[ZmItem.F_FROM])) 
	{
		// show participant menu
		this._setTagMenu(this._participantActionMenu);
		this._actionEv.address = address;
		if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
			var contacts = this._appCtxt.getApp(ZmZimbraMail.CONTACTS_APP).getContactList();
			this._actionEv.contact = contacts.getContactByEmail(this._actionEv.address.getAddress());
			this._setContactText(this._actionEv.contact != null);
		}
		this._enableFlags(this._participantActionMenu, bHasUnread, bHasRead);
		this._participantActionMenu.popup(0, ev.docX, ev.docY);
	} else {
		this._enableFlags(this._actionMenu, bHasUnread, bHasRead);
		this._actionMenu.popup(0, ev.docX, ev.docY);
	}
}

// Operation listeners

ZmMailListController.prototype._markReadListener = 
function(ev) {
	try {
		this._list.markRead(this._listView[this._currentView].getSelection(), true);
	} catch (ex) {
		this._handleException(ex, this._markReadListener, ev, false);
	}
}

ZmMailListController.prototype._markUnreadListener = 
function(ev) {
	try {
		this._list.markRead(this._listView[this._currentView].getSelection(), false);
	} catch (ex) {
		this._handleException(ex, this._markUnreadListener, ev, false);
	}
}

ZmMailListController.prototype._replyListener =
function(ev) {
	var action = ev.item.getData(ZmOperation.KEY_ID);
	if (!action || action == ZmOperation.REPLY_MENU)
		action = ZmOperation.REPLY;

	this._doAction(ev, action);
}

ZmMailListController.prototype._forwardListener =
function(ev) {
	this._doAction(ev, ev.item.getData(ZmOperation.KEY_ID));
}

ZmMailListController.prototype._doAction = 
function(ev, action, extraBodyText) {
	// retrieve msg and make sure its loaded
	var msg = this._getMsg();
	if (!msg) return;

	// if html compose is allowed, 
	//   then if opening draft always request html 
	// 	 otherwise just check if user prefers html or
	//   msg hasnt been loaded yet and user prefers format of orig. msg
	var htmlEnabled = this._appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED);
	var prefersHtml = this._appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT) == ZmSetting.COMPOSE_HTML;
	var sameFormat = this._appCtxt.get(ZmSetting.COMPOSE_SAME_FORMAT);
	var getHtml = (htmlEnabled && (action == ZmOperation.DRAFT || (action != ZmOperation.DRAFT && (prefersHtml || (!msg.isLoaded() && sameFormat)))));
		
	var inNewWindow = this._appCtxt.get(ZmSetting.NEW_WINDOW_COMPOSE) || ev.shiftKey;
	var respCallback = new AjxCallback(this, this._handleResponseDoAction, [action, inNewWindow, msg, extraBodyText]);
	msg.load(getHtml, action == ZmOperation.DRAFT, respCallback);
}

ZmMailListController.prototype._handleResponseDoAction = 
function(args) {
	var action			= args[0];
	var inNewWindow		= args[1];
	var msg				= args[2];
	var extraBodyText	= args[3];

	this._app.getComposeController().doAction(action, inNewWindow, msg, null, null, extraBodyText);
}

ZmMailListController.prototype._inviteReplyHandler = 
function (ev) {
	if (!this._inviteReplyDialog) {
		var d = this._inviteReplyDialog = new DwtMessageDialog(this._shell, null, 
															   [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON, DwtDialog.CANCEL_BUTTON]);
		d.setMessage(ZmMsg.editInviteReply, DwtMessageDialog.INFO_STYLE);
		d.registerCallback(DwtDialog.YES_BUTTON, this._inviteReplyDialogYesCallback, this, ev);
		d.registerCallback(DwtDialog.NO_BUTTON, this._inviteReplyDialogNoCallback, this, ev);
		d.registerCallback(DwtDialog.CANCEL_BUTTON, this._inviteReplyDialogCancelCallback, this, ev);
	}
	var refView = this.getReferenceView();
	var refEl = refView? refView.getHtmlElement(): null;
	var point = null;
	if (refEl) {
		var loc = Dwt.toWindow(refEl, 0, 0);
		point = new DwtPoint(loc.x + 50, loc.y + 100);
	}
	this._inviteReplyDialog.popup(point);
	return false;
};

ZmMailListController.prototype._shareHandler =
function(ev) {
	if (ev._buttonId == ZmOperation.REPLY_ACCEPT) {
		var acceptDialog = this._appCtxt.getAcceptShareDialog();
		acceptDialog.setShareInfo(ev._share);
		acceptDialog.setAcceptListener(this._acceptShareListener);
		acceptDialog.setDeclineListener(this._declineShareListener);
		acceptDialog.popup();
	}
	else if (ev._buttonId == ZmOperation.REPLY_DECLINE) {
		this._declineShareHandler(ev);
	}
}

ZmMailListController.prototype._acceptShareHandler = 
function(ev) {
	var cache = this._appCtxt.getItemCache();
	var msg = cache.get(ev._share._msgId);
	var folder = cache.get(ZmFolder.ID_TRASH);

	var list = this.getList();
	list.moveItems(msg, folder);
}

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
}

// this method gets overloaded if folder id is retrieved another way
ZmMailListController.prototype._getSearchFolderId = 
function() {
	return this._activeSearch.search ? this._activeSearch.search.folderId : null;
}

ZmMailListController.prototype._inviteReplyDialogYesCallback = 
function(ev) {
    this._inviteReplyDialog.popdown();
 	var action = ev._inviteReplyType;
	var compId = ev._inviteComponentId;
	this._editInviteReply(action, compId);
}

ZmMailListController.prototype._getInviteReplyBody = function (type) {
	var replyBody = null;
	switch (type) {
	case ZmOperation.REPLY_ACCEPT:		replyBody = ZmMsg.defaultInviteReplyAcceptMessage; break;
	case ZmOperation.REPLY_DECLINE:		replyBody = ZmMsg.defaultInviteReplyDeclineMessage; break;
	case ZmOperation.REPLY_TENTATIVE: 	replyBody = ZmMsg.defaultInviteReplyTentativeMessage; break;
	case ZmOperation.REPLY_NEW_TIME: 	replyBody = ZmMsg.defaultInviteReplyNewTimeMessage;	break;
	}
	
	return replyBody;
};

ZmMailListController.prototype._getInviteReplySubject = function (type) {
	var replySubject = null;
	switch (type) {
	case ZmOperation.REPLY_ACCEPT:		replySubject = ZmMsg.subjectAccept + ": "; break;
	case ZmOperation.REPLY_DECLINE:		replySubject = ZmMsg.subjectDecline + ": "; break;
	case ZmOperation.REPLY_TENTATIVE:	replySubject = ZmMsg.subjectTentative + ": "; break;
	case ZmOperation.REPLY_NEW_TIME:	replySubject = ZmMsg.subjectNewTime + ": "; break;
	}
	return replySubject;
};

ZmMailListController.prototype._inviteReplyDialogNoCallback = 
function(ev) {
	var type = ev._inviteReplyType;
	var compId = ev._inviteComponentId;	
	this._inviteReplyDialog.popdown();
	this._sendInviteReply(type, compId);
};

ZmMailListController.prototype._editInviteReply =
function (action , componentId) {
	var replyBody = this._getInviteReplyBody(action);
	this._doAction({}, action, replyBody);
};

ZmMailListController.prototype._sendInviteReply = 
function(type, componentId) {
	try {
		var msg = new ZmMailMsg(this._appCtxt);
		var contactList = this._appCtxt.getApp(ZmZimbraMail.CONTACTS_APP).getContactList();
	
		msg._origMsg = this._getMsg();
		msg.inviteMode = type;
		msg.isReplied = true;
		msg.isForwarded = false;
		msg.isInviteReply = true;
		var replyBody = this._getInviteReplyBody(type);
		if (replyBody != null) {
			var top = new ZmMimePart(this._appCtxt);
			top.setContentType(ZmMimeTable.TEXT_PLAIN);
			var dummyAppt = new ZmAppt(this._appCtxt);
			dummyAppt.setFromMessage(msg._origMsg);
			var buf = new Array();
			var idx = 0;
			dummyAppt.getTextSummary(false, buf, idx);
			replyBody = replyBody + buf.join("");
			top.setContent(replyBody);	
			msg.setTopPart(top);
		}
		var subject = this._getInviteReplySubject(type);
		subject  = subject + msg._origMsg.getInvite().getEventName(0);
		if (subject != null) {
			msg.setSubject(subject);
		}
		msg.sendInviteReply(contactList, true, componentId);
	} catch (ex) {
		this._handleException(ex, this._sendInviteReply, [type, componentId], false);
	}
};

ZmMailListController.prototype._inviteReplyDialogCancelCallback = 
function (args){
    this._inviteReplyDialog.popdown();
}

ZmMailListController.prototype._spamListener = 
function(ev) {
	var items = this._listView[this._currentView].getSelection();
	var markAsSpam = this._getSearchFolderId() != ZmFolder.ID_SPAM;
	this._schedule(this._doSpam, {items: items, markAsSpam: markAsSpam});
}

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
			var mi = menu.createMenuItem(id, ZmMailListController.ICON[id], ZmMsg[ZmMailListController.MSG_KEY[id]], null, true, DwtMenuItem.RADIO_STYLE);
			mi.setData(ZmOperation.MENUITEM_ID, id);
			mi.addSelectionListener(this._listeners[ZmOperation.VIEW]);
			if (id == this._defaultView())
				mi.setChecked(true, true);
		}
	}
	return menu;
}

// Handle participant menu.
ZmMailListController.prototype._setContactText =
function(isContact) {
	ZmListController.prototype._setContactText.call(this, isContact);
	var newOp = isContact ? ZmOperation.EDIT_CONTACT : ZmOperation.NEW_CONTACT;
	var newText = isContact ? null : ZmMsg.AB_ADD_CONTACT;
	ZmOperation.setOperation(this._participantActionMenu, ZmOperation.CONTACT, newOp, newText);
}

ZmMailListController.prototype._setReplyText =
function(parent) {
	if (this._appCtxt.get(ZmSetting.REPLY_MENU_ENABLED)) {
		var op = parent.getOp(ZmOperation.REPLY_MENU);
		if (op) {
			var menu = op.getMenu();
			var replyOp = menu.getOp(ZmOperation.REPLY);
			replyOp.setText(ZmMsg.replySender);
		}
	}
}

ZmMailListController.prototype._doMove = 
function(params) {
	// check to make sure user isnt actually trying to spam/unspam
	if (params.folder.id == ZmFolder.ID_SPAM) {
		params.markAsSpam = true;
		this._doSpam(params);
		return;
	} 

	// if we're already in the spam folder, and we're not moving spam to trash, unspam!
	if (this._getSearchFolderId() == ZmFolder.ID_SPAM && params.folder.id != ZmFolder.ID_TRASH) {
		params.markAsSpam = false;
		this._doSpam(params);
	} else {
		if (this._appCtxt.get(ZmSetting.SEARCH_INCLUDES_SPAM)) {
			// TODO
			// if searches incl. spam folder it is possible to get a listview w/ 
			// both spam and not spam items in which case we (need to) weed them out
		}

		// otherwise just call base class
		ZmListController.prototype._doMove.call(this, params);
	}
}

ZmMailListController.prototype._doSpam = 
function(params) {
	try {
		var optFolderId = params.folder ? params.folder.id : null;
		this._list.spamItems(params.items, params.markAsSpam, optFolderId);
		this._checkReplenish();
		this._resetOperations(this._toolbar[this._currentView], this._listView[this._currentView].getSelectedItems().size());
	} catch (ex) {
		this._handleException(ex, this._doSpam, params, false);
	}
}

ZmMailListController.prototype._resetOperations = 
function(parent, num) {
	ZmListController.prototype._resetOperations.call(this, parent, num);
	if (parent) {
		var isDrafts = (this._getSearchFolderId() == ZmFolder.ID_DRAFTS);
		parent.enable([ZmOperation.REPLY, ZmOperation.REPLY_ALL, ZmOperation.FORWARD], !isDrafts && num == 1);
		parent.enable(ZmOperation.SPAM, !isDrafts && num > 0);
		parent.enable(ZmOperation.MOVE, !isDrafts && num > 0);
	}
}

ZmMailListController.prototype._resetNavToolBarButtons = 
function(view) {
	ZmListController.prototype._resetNavToolBarButtons.call(this, view);
	this._showListRange(view);
}

// Enable mark read/unread as appropriate.
ZmMailListController.prototype._enableFlags =
function(menu, bHasUnread, bHasRead) {
	menu.enable([ZmOperation.MARK_READ, ZmOperation.MARK_UNREAD], true);
	if (!bHasUnread)
		menu.enable(ZmOperation.MARK_READ, false);
	if (!bHasRead)
		menu.enable(ZmOperation.MARK_UNREAD, false);
}

// This method is actually called by a pushed view's controller when a user 
// attempts to page conversations (from CV) or messages (from MV ala TV).
// We want the underlying view (CLV or MLV) to update itself silently as it 
// feeds the next/prev conv/msg to its respective controller.
ZmMailListController.prototype.pageItemSilently = 
function(currentItem, bNextItem) {
	
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
		
	var itemIdx = bNextItem ? i+1 : i-1;
	if (itemIdx < 0)
		throw new DwtException("Bad index!", DwtException.INTERNAL_ERROR, "ZmMailListController.pageItemSilently");
	
	var bPageWasCached = true;
	if (itemIdx >= list.length) {
		if (this._list.hasMore()) {
			bPageWasCached = this._paginate(this._currentView, true, itemIdx);
		} else {
			// ERROR: no more conv's to retrieve!
			throw new DwtException("Index has exceeded number of items in list!", DwtException.INTERNAL_ERROR, "ZmMailListController.pageItemSilently");
		}
	} else {
		// this means the conv must be cached. Find out if we need to page back/forward.
		var offset = this._listView[this._currentView].getOffset();
		var limit = this._listView[this._currentView].getLimit();
		if (itemIdx >= offset+limit)
			bPageWasCached = this._paginate(this._currentView, true);
		else if (itemIdx < offset)
			bPageWasCached = this._paginate(this._currentView, false);
	}	

	if (bPageWasCached) {
		var newItem = list[itemIdx];
		this._listView[this._currentView].emulateDblClick(newItem);
	}
}


ZmMailListController.prototype._setGroupMailBy =
function(id) {
	this._appCtxt.set(ZmSetting.GROUP_MAIL_BY, ZmPref.GROUP_MAIL_BY_VALUE[id]);
	var searchCtlr = this._appCtxt.getSearchController();
	if (searchCtlr)
		searchCtlr.setGroupMailBy(id);
}
