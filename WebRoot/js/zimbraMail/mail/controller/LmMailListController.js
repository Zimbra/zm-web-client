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
function LmMailListController(appCtxt, container, mailApp) {

	if (arguments.length == 0) return;
	LmListController.call(this, appCtxt, container, mailApp);

	this._listeners[LmOperation.MARK_READ] = new LsListener(this, this._markReadListener);
	this._listeners[LmOperation.MARK_UNREAD] = new LsListener(this, this._markUnreadListener);
	var replyLis = new LsListener(this, this._replyListener);
	if (this._appCtxt.get(LmSetting.REPLY_MENU_ENABLED))
		this._listeners[LmOperation.REPLY_MENU] = replyLis;
	else {
		this._listeners[LmOperation.REPLY] = replyLis;
		this._listeners[LmOperation.REPLY_ALL] = replyLis;
	}
	this._listeners[LmOperation.FORWARD] = new LsListener(this, this._forwardListener);
	
	if (this._appCtxt.get(LmSetting.SPAM_ENABLED))
		this._listeners[LmOperation.SPAM] = new LsListener(this, this._spamListener);

	this._inviteReplyListener = new LsListener(this, this._inviteReplyHandler);
}

LmMailListController.prototype = new LmListController;
LmMailListController.prototype.constructor = LmMailListController;

// Stuff for the View menu
LmMailListController.ICON = new Object();
LmMailListController.ICON[LmController.CONVLIST_VIEW]	= LmImg.I_CONV;
LmMailListController.ICON[LmController.TRAD_VIEW]		= LmImg.I_MAIL;

LmMailListController.MSG_KEY = new Object();
LmMailListController.MSG_KEY[LmController.CONVLIST_VIEW]	= "byConversation";
LmMailListController.MSG_KEY[LmController.TRAD_VIEW]		= "byMessage";

LmMailListController.GROUP_BY_VIEWS = [LmController.CONVLIST_VIEW, LmController.TRAD_VIEW];

// Public methods

LmMailListController.prototype.toString = 
function() {
	return "LmMailListController";
}

LmMailListController.prototype.getSearchString = 
function() {
	return this._searchString;
}

// Private and protected methods

LmMailListController.prototype._setupViewMenu = function(view) {}

// Creates a participant menu in addition to standard initialization.
LmMailListController.prototype._initialize =
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
	LmListController.prototype._initialize.call(this, view);
	
	if (!this._participantActionMenu) {
		var menuItems = this._contactOps();
		menuItems.push(LmOperation.SEP);
		menuItems = menuItems.concat(this._getActionMenuOps());
    	this._participantActionMenu = new LmActionMenu(this._shell, menuItems);
		for (var i = 0; i < menuItems.length; i++)
			if (menuItems[i] > 0)
				this._participantActionMenu.addSelectionListener(menuItems[i], this._listeners[menuItems[i]]);
		this._participantActionMenu.addPopdownListener(this._popdownListener);
		this._setupTagMenu(this._participantActionMenu);
    }
}

LmMailListController.prototype._initializeToolBar = 
function(view, arrowStyle) {
	if (!this._toolbar[view]) {
		LmListController.prototype._initializeToolBar.call(this, view);
		this._setupViewMenu(view);
		this._propagateMenuListeners(this._toolbar[view], LmOperation.REPLY_MENU);
		this._setReplyText(this._toolbar[view]);
		this._toolbar[view].addFiller();
		arrowStyle = arrowStyle || LmNavToolBar.SINGLE_ARROWS;
		var tb = new LmNavToolBar(this._toolbar[view], DwtControl.STATIC_STYLE, null, arrowStyle, true);
		this._setNavToolBar(tb);
	}

	this._setupDeleteButton(view);
	this._setupSpamButton(view);

	// reset new button properties
	this._setNewButtonProps(view, LmMsg.compose, LmImg.I_MAIL_MSG, LmImg.ID_MAIL_MSG, LmOperation.NEW_MESSAGE);
}

LmMailListController.prototype._initializeActionMenu = 
function() {
	if (this._actionMenu) return;
	
	LmListController.prototype._initializeActionMenu.call(this);
	this._propagateMenuListeners(this._actionMenu, LmOperation.REPLY_MENU);
	this._setReplyText(this._actionMenu);
}

// Groups of mail-related operations

LmMailListController.prototype._flagOps =
function() {
	return ([LmOperation.MARK_READ, LmOperation.MARK_UNREAD]);
}

LmMailListController.prototype._msgOps =
function() {
	var list = new Array();
	if (this._appCtxt.get(LmSetting.REPLY_MENU_ENABLED))
		list.push(LmOperation.REPLY_MENU, LmOperation.FORWARD);
	else
		list.push(LmOperation.REPLY, LmOperation.REPLY_ALL, LmOperation.FORWARD);
	return list;
}

// List listeners

// Based on context, enable read/unread operation, add/edit contact.
LmMailListController.prototype._listActionListener =
function(ev) {
	LmListController.prototype._listActionListener.call(this, ev);
	
	// enable/disable mark as read/unread as necessary	
	var bHasRead = false;
	var bHasUnread = false;
	var items = this._listView[this._currentView].getSelection();
	for (var i = 0; i < items.length; i++) {
		(items[i].isUnread) ? bHasUnread = true : bHasRead = true;
		if (bHasUnread && bHasRead)
			break;
	}
	
	if (items.length == 1 && (ev.field == LmListView.FIELD_PREFIX[LmItem.F_PARTICIPANT] ||
							  ev.field == LmListView.FIELD_PREFIX[LmItem.F_FROM])) {
		// show participant menu
		this._setTagMenu(this._participantActionMenu);
		this._actionEv.address = (ev.field == LmListView.FIELD_PREFIX[LmItem.F_PARTICIPANT]) ?
			ev.detail : ev.item.getAddress(LmEmailAddress.FROM);
		if (this._appCtxt.get(LmSetting.CONTACTS_ENABLED)) {
			var contacts = this._appCtxt.getApp(LmLiquidMail.CONTACTS_APP).getContactList();
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

LmMailListController.prototype._markReadListener = 
function(ev) {
	try {
		this._list.markRead(this._listView[this._currentView].getSelection(), true);
	} catch (ex) {
		this._handleException(ex, this._markReadListener, ev, false);
	}
}

LmMailListController.prototype._markUnreadListener = 
function(ev) {
	try {
		this._list.markRead(this._listView[this._currentView].getSelection(), false);
	} catch (ex) {
		this._handleException(ex, this._markUnreadListener, ev, false);
	}
}

LmMailListController.prototype._replyListener =
function(ev) {
	var action = ev.item.getData(LmOperation.KEY_ID);
	if (!action || action == LmOperation.REPLY_MENU)
		action = LmOperation.REPLY;

	this._doAction(ev, action);
}

LmMailListController.prototype._forwardListener =
function(ev) {
	this._doAction(ev, ev.item.getData(LmOperation.KEY_ID));
}

LmMailListController.prototype._doAction = 
function(ev, action, extraBodyText) {
	try {	
		// retrieve msg and make sure its loaded
		var msg = this._getMsg();
		if (!msg) return;

		// if html compose is allowed, 
		//   then if opening draft always request html 
		// 	 otherwise just check if user prefers html or
		//   msg hasnt been loaded yet and user prefers format of orig. msg
		var htmlEnabled = this._appCtxt.get(LmSetting.HTML_COMPOSE_ENABLED);
		var prefersHtml = this._appCtxt.get(LmSetting.COMPOSE_AS_FORMAT) == LmSetting.COMPOSE_HTML;
		var sameFormat = this._appCtxt.get(LmSetting.COMPOSE_SAME_FORMAT);
		var getHtml = (htmlEnabled && (action == LmOperation.DRAFT || (action != LmOperation.DRAFT && (prefersHtml || (!msg.isLoaded() && sameFormat)))));
		
		msg.load(getHtml, action == LmOperation.DRAFT);

		var inNewWindow = this._appCtxt.get(LmSetting.NEW_WINDOW_COMPOSE) || ev.shiftKey;
		this._app.getComposeController().doAction(action, inNewWindow, msg, null, null, extraBodyText);
	} catch (ex) {
		this._handleException(ex, this._doAction, {ev: ev, action: action, extraBodyText: extraBodyText}, false);
	}
}

LmMailListController.prototype._inviteReplyHandler = 
function (ev) {
	if (!this._inviteReplyDialog) {
		var d = this._inviteReplyDialog = new DwtMessageDialog(this._shell, null, 
															   [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON, DwtDialog.CANCEL_BUTTON]);
		d.setMessage("Would you like to edit the invite reply?", null, DwtMessageDialog.INFO_STYLE);
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

LmMailListController.prototype.getReferenceView = 
function() {
	return null;
};

// If we're in the Trash folder, change the "Delete" button tooltip
LmMailListController.prototype._setupDeleteButton =
function(view) {
	var inTrashFolder = (this._getSearchFolderId() == LmFolder.ID_TRASH);
	var deleteButton = this._toolbar[view].getButton(LmOperation.DELETE);
	var deleteMenuButton = this._toolbar[view].getButton(LmOperation.DELETE_MENU);
	if (deleteButton)
		deleteButton.setToolTipContent(inTrashFolder ? LmMsg.deletePermanentTooltip : LmMsg.deleteTooltip);
	if (deleteMenuButton)
		deleteMenuButton.setToolTipContent(inTrashFolder ? LmMsg.deletePermanentTooltip : LmMsg.deleteTooltip);
};

// If we're in the Spam folder, the "Spam" button becomes the "Not Spam" button
LmMailListController.prototype._setupSpamButton = 
function(view) {
	var inSpamFolder = (this._getSearchFolderId() == LmFolder.ID_SPAM);
	var spamButton = this._toolbar[view].getButton(LmOperation.SPAM);
	if (spamButton) {
		spamButton.setText(inSpamFolder ? LmMsg.notJunk : LmMsg.junk);
		spamButton.setToolTipContent(inSpamFolder ? LmMsg.notJunkTooltip : LmMsg.junkTooltip);
	}
}

// this method gets overloaded if folder id is retrieved another way
LmMailListController.prototype._getSearchFolderId = 
function() {
	return this._activeSearch.search ? this._activeSearch.search.folderId : null;
}

LmMailListController.prototype._inviteReplyDialogYesCallback = 
function(ev) {
    this._inviteReplyDialog.popdown();
 	var action = ev._inviteReplyType;
	var compId = ev._inviteComponentId;
	var replyBody = this._getInviteReplyBody(action);
	this._doAction(ev, action, replyBody);
}

LmMailListController.prototype._getInviteReplyBody = function (type) {
	var replyBody = null;
	switch (type) {
	case LmOperation.REPLY_ACCEPT:		replyBody = LmMsg.defaultInviteReplyAcceptMessage; break;
	case LmOperation.REPLY_DECLINE:		replyBody = LmMsg.defaultInviteReplyDeclineMessage; break;
	case LmOperation.REPLY_TENTATIVE: 	replyBody = LmMsg.defaultInviteReplyTentativeMessage; break;
	case LmOperation.REPLY_NEW_TIME: 	replyBody = LmMsg.defaultInviteReplyNewTimeMessage;	break;
	}
	
	return replyBody;
};

LmMailListController.prototype._getInviteReplySubject = function (type) {
	var replySubject = null;
	switch (type) {
	case LmOperation.REPLY_ACCEPT:		replySubject = LmMsg.subjectAccept + ": "; break;
	case LmOperation.REPLY_DECLINE:		replySubject = LmMsg.subjectDecline + ": "; break;
	case LmOperation.REPLY_TENTATIVE:	replySubject = LmMsg.subjectTentative + ": "; break;
	case LmOperation.REPLY_NEW_TIME:	replySubject = LmMsg.subjectNewTime + ": "; break;
	}
	return replySubject;
};

LmMailListController.prototype._inviteReplyDialogNoCallback = 
function(ev) {
	try {
	 	var type = ev._inviteReplyType;
		var compId = ev._inviteComponentId;	
	    this._inviteReplyDialog.popdown();
	
		// TODO : send an InviteReply message with no body --
		// the server handles all the details for us.
	
		//var msg = this._getMsg();
		var msg = new LmMailMsg(this._appCtxt);
		var contactList = this._appCtxt.getApp(LmLiquidMail.CONTACTS_APP).getContactList();
	
		msg._origMsg = this._getMsg();
		msg.inviteMode = type;
		msg.isReplied = true;
		msg.isForwarded = false;
		msg.isInviteReply = true;
		var replyBody = this._getInviteReplyBody(type);
		if (replyBody != null) {
			var top = new LmMimePart(this._appCtxt);
			top.setContentType(LmMimeTable.TEXT_PLAIN);
			top.setContent(replyBody);	
			msg.setTopPart(top);
		}
		var subject = this._getInviteReplySubject(type);
		subject  = subject + msg._origMsg.getInvite().getEventName(0);
		if (subject != null) {
			msg.setSubject(subject);
		}
		msg.sendInviteReply(contactList, true, compId);
	} catch (ex) {
		this._handleException(ex, this._inviteReplyDialogNoCallback, ev, false);
	}
}

LmMailListController.prototype._inviteReplyDialogCancelCallback = 
function (args){
    this._inviteReplyDialog.popdown();
}

LmMailListController.prototype._spamListener = 
function(ev) {
	var items = this._listView[this._currentView].getSelection();
	var markAsSpam = this._getSearchFolderId() != LmFolder.ID_SPAM;
	this._schedule(this._doSpam, {items: items, markAsSpam: markAsSpam});
}

// Miscellaneous

// Adds "By Conversation" and "By Message" to a view menu
LmMailListController.prototype._setupGroupByMenuItems =
function(view) {
	var appToolbar = this._appCtxt.getCurrentAppToolbar();
	var menu = appToolbar.getViewMenu(view);
	if (!menu) {
		menu = new LmPopupMenu(appToolbar.getViewButton());
		appToolbar.setViewMenu(view, menu);
		for (var i = 0; i < LmMailListController.GROUP_BY_VIEWS.length; i++) {
			var id = LmMailListController.GROUP_BY_VIEWS[i];
			var mi = menu.createMenuItem(id, LmMailListController.ICON[id], LmMsg[LmMailListController.MSG_KEY[id]], null, true, DwtMenuItem.RADIO_STYLE);
			mi.setData(LmOperation.MENUITEM_ID, id);
			mi.addSelectionListener(this._listeners[LmOperation.VIEW]);
			if (id == this._defaultView())
				mi.setChecked(true, true);
		}
	}
	return menu;
}

// Handle participant menu.
LmMailListController.prototype._setContactText =
function(isContact) {
	LmListController.prototype._setContactText.call(this, isContact);
	var newOp = isContact ? LmOperation.EDIT_CONTACT : LmOperation.NEW_CONTACT;
	var newText = isContact ? null : LmMsg.AB_ADD_CONTACT;
	LmOperation.setOperation(this._participantActionMenu, LmOperation.CONTACT, newOp, newText);
}

LmMailListController.prototype._setReplyText =
function(parent) {
	if (this._appCtxt.get(LmSetting.REPLY_MENU_ENABLED)) {
		var op = parent.getOp(LmOperation.REPLY_MENU);
		if (op) {
			var menu = op.getMenu();
			var replyOp = menu.getOp(LmOperation.REPLY);
			replyOp.setText(LmMsg.replySender);
		}
	}
}

LmMailListController.prototype._doMove = 
function(params) {
	// check to make sure user isnt actually trying to spam/unspam
	if (params.folder.id == LmFolder.ID_SPAM) {
		params.markAsSpam = true;
		this._doSpam(params);
		return;
	} 

	// if we're already in the spam folder, and we're not moving spam to trash, unspam!
	if (this._getSearchFolderId() == LmFolder.ID_SPAM && params.folder.id != LmFolder.ID_TRASH) {
		params.markAsSpam = false;
		this._doSpam(params);
	} else {
		if (this._appCtxt.get(LmSetting.SEARCH_INCLUDES_SPAM)) {
			// TODO
			// if searches incl. spam folder it is possible to get a listview w/ 
			// both spam and not spam items in which case we (need to) weed them out
		}

		// otherwise just call base class
		LmListController.prototype._doMove.call(this, params);
	}
}

LmMailListController.prototype._doSpam = 
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

LmMailListController.prototype._resetOperations = 
function(parent, num) {
	LmListController.prototype._resetOperations.call(this, parent, num);
	if (parent) {
		var isDrafts = (this._getSearchFolderId() == LmFolder.ID_DRAFTS);
		parent.enable([LmOperation.REPLY, LmOperation.REPLY_ALL, LmOperation.FORWARD], !isDrafts && num == 1);
		parent.enable(LmOperation.SPAM, !isDrafts && num > 0);
		parent.enable(LmOperation.MOVE, !isDrafts && num > 0);
	}
}

LmMailListController.prototype._resetNavToolBarButtons = 
function(view) {
	LmListController.prototype._resetNavToolBarButtons.call(this, view);
	this._showListRange(view);
}

// Enable mark read/unread as appropriate.
LmMailListController.prototype._enableFlags =
function(menu, bHasUnread, bHasRead) {
	menu.enable([LmOperation.MARK_READ, LmOperation.MARK_UNREAD], true);
	if (!bHasUnread)
		menu.enable(LmOperation.MARK_READ, false);
	if (!bHasRead)
		menu.enable(LmOperation.MARK_UNREAD, false);
}

// This method is actually called by a pushed view's controller when a user 
// attempts to page conversations (from CV) or messages (from MV ala TV).
// We want the underlying view (CLV or MLV) to update itself silently as it 
// feeds the next/prev conv/msg to its respective controller.
LmMailListController.prototype.pageItemSilently = 
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
		throw new DwtException("Bad index!", DwtException.INTERNAL_ERROR, "LmMailListController.pageItemSilently");
	
	var bPageWasCached = true;
	if (itemIdx >= list.length) {
		if (this._list.hasMore()) {
			bPageWasCached = this._paginate(this._currentView, true, itemIdx);
		} else {
			// ERROR: no more conv's to retrieve!
			throw new DwtException("Index has exceeded number of items in list!", DwtException.INTERNAL_ERROR, "LmMailListController.pageItemSilently");
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


LmMailListController.prototype._setGroupMailBy =
function(id) {
	this._appCtxt.set(LmSetting.GROUP_MAIL_BY, LmPref.GROUP_MAIL_BY_VALUE[id]);
	var searchCtlr = this._appCtxt.getSearchController();
	if (searchCtlr)
		searchCtlr.setGroupMailBy(id);
}
