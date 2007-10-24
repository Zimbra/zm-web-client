/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
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
 * @constructor
 * @class
 *
 * @param container		containing shell
 */
ZmChatListController = function(container, imApp) {
	if (arguments.length == 0) { return; }

	ZmController.call(this, container, imApp);

	this._toolbar = {};		// ZmButtonToolbar (one per view)
	this._listView = {};	// ZmListView (one per view)
	this._list = imApp.getRoster().getChatList();		// ZmChatList (the data)

   	this._listeners = {};
	this._listeners[ZmOperation.VIEW] = new AjxListener(this, this._viewButtonListener);
	this._listeners[ZmOperation.NEW_MENU] = new AjxListener(this, this._newListener);
	this._listeners[ZmOperation.REFRESH] = new AjxListener(this, this._refreshListener);

	this._viewFactory = {};
	this._viewFactory[ZmController.IM_CHAT_MULTI_WINDOW_VIEW] = ZmChatMultiWindowView;

	this._parentView = {};

	// listen for roster list changes
	this._rosterListListener = new AjxListener(this, this._rosterListChangeListener);

	var rosterList = imApp.getRoster().getRosterItemList();
	rosterList.addChangeListener(this._rosterListListener);
	this._imApp = imApp;
};

ZmChatListController.prototype = new ZmController;
ZmChatListController.prototype.constructor = ZmChatListController;

ZmChatListController.ICON = new Object();
//ZmChatListController.ICON[ZmController.IM_CHAT_TAB_VIEW]		= "SinglePane"; // TODO: get real icon
ZmChatListController.ICON[ZmController.IM_CHAT_MULTI_WINDOW_VIEW]	= "OpenInNewWindow"; // TODO: get real icon

ZmChatListController.MSG_KEY = new Object();
//ZmChatListController.MSG_KEY[ZmController.IM_CHAT_TAB_VIEW]	= "imChatTabbed";
ZmChatListController.MSG_KEY[ZmController.IM_CHAT_MULTI_WINDOW_VIEW]= "imChatMultiWindow";

//ZmChatListController.VIEWS = [ZmController.IM_CHAT_TAB_VIEW, ZmController.IM_CHAT_MULTI_WINDOW_VIEW];
ZmChatListController.VIEWS = [ZmController.IM_CHAT_MULTI_WINDOW_VIEW];

ZmChatListController.prototype.toString =
function() {
	return "ZmChatListController";
}

ZmChatListController.prototype.prepareVisuals = function(view) {
	view = view || this._currentView || this._defaultView();
	this._setup(view);
	// create the view (if we haven't yet)
	if (!this._appViews[view]) {
		var elements = new Object();
		elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[view];
		elements[ZmAppViewMgr.C_APP_CONTENT] = this._parentView[view];

		// view management callbacks
		var callbacks = new Object();
		callbacks[ZmAppViewMgr.CB_PRE_HIDE] =
			this._preHideCallback ? new AjxCallback(this, this._preHideCallback) : null;
		callbacks[ZmAppViewMgr.CB_POST_HIDE] =
			this._postHideCallback ? new AjxCallback(this, this._postHideCallback) : null;
		callbacks[ZmAppViewMgr.CB_PRE_SHOW] =
			this._preShowCallback ? new AjxCallback(this, this._preShowCallback) : null;
		callbacks[ZmAppViewMgr.CB_POST_SHOW] =
			this._postShowCallback ? new AjxCallback(this, this._postShowCallback) : null;

		this._app.createView(view, elements, callbacks, true);
		this._appViews[view] = 1;
	}
};

ZmChatListController.prototype.show =
function() {
	var view = this._currentView || this._defaultView();
	this.switchView(view, true);
};

ZmChatListController.prototype.switchView =
function(view, force) {
	if (view != this._currentView || force) {
		var ok = this._setView(view);
		this._currentView = view;
	}
};

ZmChatListController.prototype._setView =
function(view, clear, pushOnly) {
	this.prepareVisuals(view);
	return (clear ? this._app.setView(view) : this._app.pushView(view));
};

ZmChatListController.prototype._preShowCallback =
function(view) {
	return true;
};

ZmChatListController.prototype._standardToolBarOps =
function() {
	return [ ZmOperation.NEW_MENU ];
};

ZmChatListController.prototype._getToolBarOps =
function() {
	var list = this._standardToolBarOps();
	list.push(ZmOperation.SEP,
		  ZmOperation.IM_PRESENCE_MENU,
		  ZmOperation.SEP,
		  ZmOperation.REFRESH);
	return list;
};

ZmChatListController.prototype._getActionMenuOps =
function() {
	return [];
    /*
//	var list = this._participantOps();
	list.push(ZmOperation.SEP);
	list = list.concat(this._standardActionMenuOps());
	return list;
	*/
}

ZmChatListController.prototype._getViewType =
function() {
	return this._currentView;
};

ZmChatListController.prototype._defaultView =
function() {
	return (appCtxt.get(ZmSetting.IM_VIEW) == "tabbed") ? ZmController.IM_CHAT_TAB_VIEW : ZmController.IM_CHAT_MULTI_WINDOW_VIEW;
};

ZmChatListController.prototype._initializeToolBar = function(view) {
	if (this._toolbar[view]) return;

	var buttons = this._getToolBarOps();
	if (!buttons) return;
	this._toolbar[view] = new ZmButtonToolBar({parent:this._container, buttons:buttons});
	// remove text for Print, Delete, and Move buttons
	var list = [ZmOperation.PRINT, ZmOperation.DELETE, ZmOperation.MOVE];
	for (var i = 0; i < list.length; i++) {
		var button = this._toolbar[view].getButton(list[i]);
		if (button) {
			button.setText(null);
		}
	}
	buttons = this._toolbar[view].opList;
	for (var i = 0; i < buttons.length; i++) {
		var button = buttons[i];
		if (this._listeners[button]) {
			this._toolbar[view].addSelectionListener(button, this._listeners[button]);
		}
	}

	// init presence menu
	this.updatePresenceMenu(true);

	this._propagateMenuListeners(this._toolbar[view], ZmOperation.NEW_MENU);
	// this._setupViewMenu(view);

	// this._setNewButtonProps(view, ZmMsg.compose, "NewMessage", "NewMessageDis", ZmOperation.NEW_MESSAGE);
	this._setNewButtonProps(view, ZmMsg.imNewChat, "ImFree2Chat", "ImFree2ChatDis", ZmOperation.IM_NEW_CHAT);
};

ZmChatListController.prototype.updatePresenceMenu = function(addListeners, presenceButton) {
        if (!presenceButton) {
	        var view = view || this._currentView || this._defaultView();
	        var toolbar = this._toolbar[view];
	        if (!toolbar) { return; }
	        presenceButton = toolbar.getButton(ZmOperation.IM_PRESENCE_MENU);
        }
	var presenceMenu = presenceButton.getMenu();

   	var list = ZmImApp.getImPresenceMenuOps();
	var presence = this._imApp.getRoster().getPresence();
	var currentShowOp = presence.getShowOperation();
	for (var i = 0; i < list.length; i++) {
                if (list[i] != ZmOperation.SEP) {
		        var mi = presenceMenu.getItemById(ZmOperation.MENUITEM_ID, list[i]);
		        if (addListeners) {
			        mi.addSelectionListener(new AjxListener(this, this._presenceItemListener));
		        }
		        if (list[i] == currentShowOp) {
			        mi.setChecked(true, true);
		        }
                }
	}
	presenceButton.setImage(presence.getIcon());
	presenceButton.setText(presence.getShowText());
};

ZmChatListController.prototype._initializeActionMenu = function(view) {
	if (this._actionMenu) return;

	var menuItems = this._getActionMenuOps();
	if (!menuItems) return;
	this._actionMenu = new ZmActionMenu({parent:this._shell, menuItems:menuItems});
	menuItems = this._actionMenu.opList;
	for (var i = 0; i < menuItems.length; i++) {
		var menuItem = menuItems[i];
		if (this._listeners[menuItem]) {
			this._actionMenu.addSelectionListener(menuItem, this._listeners[menuItem]);
		}
	}
	this._actionMenu.addPopdownListener(this._popdownListener);

};

// Load chats into the given view and perform layout.
ZmChatListController.prototype._setViewContents = function(view) {
//	this._listView[view].set(this._list);
};

ZmChatListController.prototype._createNewView = function(view) {
	var view = this._parentView[view] = new this._viewFactory[view](this._container, null, Dwt.ABSOLUTE_STYLE, this, this._dropTgt);
	view.set(this._list);
	//view.setDragSource(this._dragSrc);
	return view;
};

// Creates basic elements and sets the toolbar and action menu
ZmChatListController.prototype._setup = function(view) {
	if (this._listView[view]) return;

	this._initializeToolBar(view);
	this._listView[view] = this._createNewView(view);
//	this._listView[view].addSelectionListener(new AjxListener(this, this._listSelectionListener));
//	this._listView[view].addActionListener(new AjxListener(this, this._listActionListener));
	this._initializeActionMenu(view);
	this._resetOperations(this._toolbar[view], 0);
	this._resetOperations(this._actionMenu, 0);
};

// Resets the available options on a toolbar or action menu.
ZmChatListController.prototype._resetOperations = function(parent, num) {
	if (!parent) return;
	if (num == 0) {
		parent.enableAll(true);
//		parent.enableAll(false);
//		parent.enable([ZmOperation.NEW_MENU,ZmOperation.IM_PRESENCE_MENU, ZmOperation.REFRESH], true);
	} else if (num == 1) {
		parent.enableAll(true);
	} else if (num > 1) {
		// enable only the tag and delete operations
		parent.enableAll(true);
//		parent.enableAll(false);
//		parent.enable([ZmOperation.NEW_MENU,ZmOperation.IM_PRESENCE_MENU, ZmOperation.REFRESH], true);
	}
};

// Switch to selected view.
ZmChatListController.prototype._viewButtonListener = function(ev) {
	this.switchView(ev.item.getData(ZmOperation.MENUITEM_ID));
};

// // Create menu for View button and add listeners.
// ZmChatListController.prototype._setupViewMenu = function(view) {
//  XXX: MIHAI: VIEW MENU IS NO LONGER IN ZmCurrentAppToolbar. SEE ZmMailListController
// 	var appToolbar = appCtxt.getCurrentAppToolbar();
// 	var menu = appToolbar.getViewMenu(view);
// 	if (!menu) {
// 		var menu = new ZmPopupMenu(appToolbar.getViewButton());
// 		for (var i = 0; i < ZmChatListController.VIEWS.length; i++) {
// 			var id = ZmChatListController.VIEWS[i];
// 			var mi = menu.createMenuItem(id, { image : ZmChatListController.ICON[id],
// 							   text	 : ZmMsg[ZmChatListController.MSG_KEY[id]],
// 							   style : DwtMenuItem.RADIO_STYLE
// 							 });
// 			mi.setData(ZmOperation.MENUITEM_ID, id);
// 			mi.addSelectionListener(this._listeners[ZmOperation.VIEW]);
// 			if (id == view)
// 				mi.setChecked(true, true);
// 		}
// 		appToolbar.setViewMenu(view, menu);
// 	}
// 	return menu;
// };

ZmChatListController.prototype._refreshListener = function(ev) {
	var soapDoc = AjxSoapDoc.create("NoOpRequest", "urn:zimbraMail");
	appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode: true});
};

// // Create some new thing, via a dialog. If just the button has been pressed (rather than
// // a menu item), the action taken depends on the app.
ZmChatListController.prototype._newListener = function(ev) {
 	ZmListController.prototype._newListener.call(this, ev);
};

ZmChatListController.prototype._presenceItemListener = function(ev) {
	if (ev.detail != DwtMenuItem.CHECKED) return;
	var id = ev.item.getData(ZmOperation.KEY_ID);
	if( id == ZmOperation.IM_PRESENCE_CUSTOM_MSG){
		this._presenceCustomItemListener(ev);
		return;
	}
	ev.item.parent.parent.setText(ev.item.getText());
	ev.item.parent.parent.setImage(ev.item.getImage());
	var show = ZmRosterPresence.operationToShow(id);
	this._imApp.getRoster().setPresence(show, 0, null);
};

ZmChatListController.prototype._presenceCustomItemListener = function(ev) {
	var dlg = appCtxt.getDialog();
	dlg.setTitle("New Status Message");
	var id = Dwt.getNextId();
	var html = [ "<div width='320px'>",
		"<textarea type='text' id='",id,"' rows='3' cols='30'></textarea>",
		"</div>"
	].join("");
	dlg.setContent(html);
	dlg.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this,function(){
		var statusMsg = document.getElementById(id).value;
		if(statusMsg != "") {
			this._imApp.getRoster().setPresence(null, 0, statusMsg);
		}
		dlg.popdown();
	}));
	dlg.popup();
};

// Adds the same listener to all of a menu's items
ZmChatListController.prototype._propagateMenuListeners = function(parent, op, listener) {
	if (!parent) return;
	listener = listener || this._listeners[op];
	var opWidget = parent.getOp(op);
	if (opWidget) {
		var menu = opWidget.getMenu();
		var items = menu.getItems();
		var cnt = menu.getItemCount();
		for (var i = 0; i < cnt; i++)
			items[i].addSelectionListener(listener);
	}
};

// // FIXME: do we need this?
// // Set up the New button based on the current app.
ZmChatListController.prototype._setNewButtonProps = function(view, toolTip, enabledIconId, disabledIconId, defaultId) {
	var newButton = this._toolbar[view].getButton(ZmOperation.NEW_MENU);
	if (newButton) {
		newButton.setToolTipContent(toolTip);
		newButton.setImage(enabledIconId);
		this._defaultNewId = defaultId;
	}
};

ZmChatListController.prototype.selectChatForRosterItem = function(item) {
	var chats = this._list.getChatsByRosterAddr(item.getAddress());
	var chat = null;
	for (var c in chats) {
		// TODO: !chat.groupChat()?
		if (chats[c].getRosterSize() == 1) {
			chat = chats[c];
			break;
		}
	}
	// select first chat if not found in solo chat...
	// TODO: change this to select most recently active chat?
	if (chat == null && chats.length > 0) chat = chats[0];

	if (chat != null) this._getView().selectChat(chat);
};

ZmChatListController.prototype.chatWithContacts = function(contacts, mailMsg, text) {
	var buddies = contacts.map("getBuddy").sub(AjxCallback.isNull);
	// XXX: we can only use one buddy for now -- no support for group chat
	if (buddies.size() > 0)
		this.chatWithRosterItem(buddies.get(0), text);
};

ZmChatListController.prototype.chatWithRosterItem = function(item, text) {
	var chat = this._list.getChatByRosterItem(item, true);
	// currentview or all? probably all...
	this._getView().selectChat(chat, text);
};

ZmChatListController.prototype.chatWithRosterItems = function(items, chatName) {
	chat = new ZmChat(Dwt.getNextId(), chatName, this);
	for (var i=0; i < items.length; i++) {
		chat.addRosterItem(items[i]);
	}
	// listeners take care of rest...
	this._list.addChat(chat);
	// currentview or all? probably all...
	this._getView().selectChat(chat, text);
};

ZmChatListController.prototype.endChat = function(chat) {
	chat.sendClose();
	this._list.removeChat(chat);
};

ZmChatListController.prototype._getView = function() {
	return ZmChatMultiWindowView.getInstance();
};

ZmChatListController.prototype._rosterListChangeListener = function(ev) {
	if (ev.event == ZmEvent.E_MODIFY) {
		var items = ev.getItems();
		for (var i=0; i < items.length; i++) {
			var item = items[i];
			if (item instanceof ZmRosterItem) {
				var fields = ev.getDetail("fields");
				var chats = this._list.getChatsByRosterAddr(item.getAddress());
				// currentview or all? probably all...
				for (var c in chats) {
					var chat = chats[c];
					this._getView()._rosterItemChangeListener(chat, item, fields);
				}
			}
		}
	}
};
