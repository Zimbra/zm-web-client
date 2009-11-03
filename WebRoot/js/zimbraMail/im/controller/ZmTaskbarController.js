/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

ZmTaskbarController = function(components) {
	ZmController.call(this, null);

	ZmTaskbarController.INSTANCE = this;

	var parentEl = Dwt.byId(ZmId.SKIN_TASKBAR);
	if (!parentEl) {
		return;
	}
	this._chatData = {};
	this._chatMru = [];

	var toolbarArgs = {
		parent: appCtxt.getShell(),
		id: ZmId.TASKBAR,
		className: "ZmTaskbar",
		posStyle: Dwt.ABSOLUTE_STYLE
	};
	this._toolbar = components[ZmAppViewMgr.C_TASKBAR] = new ZmTaskbar(toolbarArgs);
	this._toolbar.addListener(DwtEvent.ONMOUSEDOWN, new AjxListener(this, this._toolbarMouseDownListener));

	var presenceArgs = {
		contentClassName: "ZmPresencePopup",
		op: ZmId.OP_IM_PRESENCE_MENU
	};
	this._presenceItem = this._createItem(presenceArgs);
	this._toolbar.addSeparator();

	this._newBuddySelectionListenerObj = new AjxListener(this, this._newBuddySelectionListener);
	var newBuddyArgs = {
		contentClassName: "ZmNewBuddyPopup",
		selectionListener: this._newBuddySelectionListenerObj,
		op: ZmId.OP_NEW_ROSTER_ITEM
	};
	this._newBuddyItem = this._createItem(newBuddyArgs);
	this._newBuddyItem.button.setText("");
	
	var buddyListArgs = {
		contentClassName: "ZmBuddyListPopup",
		op: ZmId.OP_IM_BUDDY_LIST
	};
	this._createItem(buddyListArgs);   
	
	this._toolbar.addFiller(null);
	this._chatButtonIndex = this._toolbar.getNumChildren() + 1;

    this._messageButton = new DwtToolBarButton({parent: this._toolbar});
    this._messageButton.setText(ZmMsg.betaIM);
    this._messageButton.setEnabled(false);

	var height = appCtxt.getSkinHint("presence", "height") || 24;
	Dwt.setSize(parentEl, Dwt.DEFAULT, height);

	var roster = ZmImApp.INSTANCE.getRoster();
	this._updatePresenceButton(ZmImApp.loggedIn() ? roster.getPresence() : null);
	roster.addChangeListener(new AjxListener(this, this._rosterChangeListener));

	roster.addGatewayListListener(new AjxListener(this, this._gatewayListListener));
	ZmImApp.INSTANCE.getRoster().getChatList().addChangeListener(new AjxListener(this, this._chatListListener));
	ZmImApp.INSTANCE.getRoster().getRosterItemList().addChangeListener(new AjxListener(this, this._rosterListChangeListener));
};

ZmTaskbarController.prototype = new ZmController;
ZmTaskbarController.prototype.constructor = ZmTaskbarController;

ZmTaskbarController.prototype.toString =
function() {
	return "ZmTaskbarController";
};

/** Shows a message on the taskbar for a brief time. */
ZmTaskbarController.prototype.setMessage =
function(message) {
	this._messageButton.setText(message);
	if (this._resetMessageActionId) {
		AjxTimedAction.cancelAction(this._resetMessageActionId);
		this._resetMessageActionId = 0;
	}
	this._resetMessageAction = this._resetMessageAction || new AjxTimedAction(this, this._resetMessage);
	this._resetMessageActionId = AjxTimedAction.scheduleAction(this._resetMessageAction, 3000);
};

ZmTaskbarController.prototype._resetMessage =
function(message) {
	this._messageButton.setText(ZmMsg.betaIM);
	this._resetMessageActionId = 0;
};

ZmTaskbarController.prototype.createChatItem =
function(chat, background) {
	this._addChatToMru(chat);
	var separator = this._toolbar.addSeparator(null, this._chatButtonIndex++);

	var args = {
		index: this._chatButtonIndex++,
		contentClassName: "ZmChatPopup",
		selectionListener: new AjxListener(this, this._chatSelectionListener, [chat]),
		data: {
			chat: chat,
			statusListener: new AjxListener(this, this._chatStatusListener, [chat]),
			closeListener: new AjxListener(this, this._closeChatListener, [chat]),
			minimizeListener: new AjxListener(this, this._minimizeChatListener, [chat])
		}
	};
	var item = this._createItem(args);
	item.button.setToolTipContent(new AjxCallback(this, this._getChatToolTip, [chat]));
	item.button.addListener(DwtEvent.ONMOUSEDOWN, new AjxListener(this, this._chatMouseDownListener, [chat]));

	this._chatData[chat.id] = {
		chat: chat,
		item: item,
		separator: separator
	};
	var hoverImage = "Close";
	item.button.setHoverImage(hoverImage);
	this._closeClass = this._closeClass || AjxImg.getClassForImage(hoverImage);
	this._toolbar.expandItem(item, true, background);

	this._chatData[chat.id].chatWidget = item.getPopup().chatWidget;
	this._chatChangeListenerListenerObj = this._chatChangeListenerListenerObj || new AjxListener(this, this._chatChangeListenerListener);
	chat.addChangeListener(this._chatChangeListenerListenerObj);

	return item;
};

ZmTaskbarController.prototype.endChat =
function(chat) {
	chat.sendClose();
	ZmImApp.INSTANCE.getRoster().getChatList().removeChat(chat);
};

ZmTaskbarController.prototype.selectChat =
function(chat, text) {
	var data = this._chatData[chat.id];
	if (data) {
		this._expandChatItem(data.item, chat, true);		
		if (text) {
			data.chatWidget.setEditorContent(AjxStringUtil.trim(text));
		}
	}
};

ZmTaskbarController.prototype.selectChatForRosterItem =
function(item) {
	var chats = ZmImApp.INSTANCE.getRoster().getChatList().getChatsByRosterAddr(item.getAddress());
	var chat = null;
	for (var c in chats) {
		if (chats[c].getRosterSize() == 1) {
			chat = chats[c];
			break;
		}
	}
	if (chat == null && chats.length > 0) {
		chat = chats[0];
	}

	if (chat != null) {
		this.selectChat(chat);
	}
};

ZmTaskbarController.prototype.chatWithContacts =
function(contacts, mailMsg, text) {
	var buddies = contacts.map("getBuddy").sub(AjxCallback.isNull);
	if (buddies.size() > 0) {
		this.chatWithRosterItem(buddies.get(0), text);
	}
};

ZmTaskbarController.prototype.chatWithRosterItem =
function(item, text) {
	var chat = ZmImApp.INSTANCE.getRoster().getChatList().getChatByRosterItem(item, true);
	this.selectChat(chat, text);
};

ZmTaskbarController.prototype.getChatWidgetForChat =
function(chat) {
	var data = this._chatData[chat.id];
	return data ? data.chatWidget : null;
};

ZmTaskbarController.prototype.showSubscribeRequest =
function(addr, buddy) {
	this._subscribeData = this._subscribeData || {};
	if (this._subscribeData[addr]) {
		return;
	}
	var separator = this._toolbar.addSeparator(null, this._chatButtonIndex + 1);
	var args = {
		index: this._chatButtonIndex + 1,
		op: ZmId.OP_IM_INVITE,
		rightAlign: true,
		contentClassName: "ZmSubscribePopup",
		data: { addr: addr, buddy: buddy }
	};
	var item = this._createItem(args);
	this._subscribeData[addr] = { item: item, separator: separator };
	this._subscribeRequestTooltip = this._subscribeRequestTooltip || new AjxMessageFormat(ZmMsg.imInvitationFrom);
	var tooltip = this._subscribeRequestTooltip.format(buddy ? buddy.getDisplayName() : addr);
	item.button.setToolTipContent(tooltip);
	if (!this._toolbar.conditionalExpand(item)) {
		item.showAlert(true);
	}
	item.addDisposeListener(new AjxListener(this, this._subscribeDisposeListener, [addr]));
};

ZmTaskbarController.prototype.showNewBuddyPopup =
function() {
	this._toolbar.expandItem(this._newBuddyItem, true);
	return this._newBuddyItem.getPopup();
};

ZmTaskbarController.prototype.showGatewayPopup =
function(gateway) {
	if (this._gatewayData) {
		var data = this._gatewayData[gateway];
		if (data) {
			this._toolbar.expandItem(data.item, true);
		}
	}
};

ZmTaskbarController.prototype._subscribeDisposeListener =
function(addr) {
	var data = this._subscribeData[addr];
	this._toolbar.removeSeparator(data.separator);
	delete this._subscribeData[addr];
};

ZmTaskbarController.prototype._addChatToMru =
function(chat) {
	// Try to limit the number of chat items to 4.
	// If we are at that number, we'll remove the least recently used one, as long as it is
	// not expanded, and doesn't have an alert on it indicating it has unread messages.
	if (this._chatMru.length >= 4) {
		for (var count = this._chatMru.length, i = count - 1; i >= 0; i--) {
			var lruChat = this._chatMru[i];
			var lruItem = this._chatData[lruChat.id].item;
			if (!lruItem.expanded && !lruItem.isAlertShown()) {
				this.endChat(lruChat);
				break;
			}
		}
	}
	this._chatMru.unshift(chat);
};

ZmTaskbarController.prototype._updateChatMru =
function(chat) {
	if (this._chatMru.length && (this._chatMru[0] != chat)) {
		this._removeChatFromMru(chat);
		this._chatMru.unshift(chat);
	}
};

ZmTaskbarController.prototype._removeChatFromMru =
function(chat) {
	for (var i = 0, count = this._chatMru.length; i < count; i++) {
		if (this._chatMru[i] == chat) {
			this._chatMru.splice(i, 1);
			return;
		}
	}
};

ZmTaskbarController.prototype._chatMouseDownListener =
function(chat, ev) {
	if (ev.button != DwtMouseEvent.RIGHT) {
		return;
	}

	this._actionedChat = chat;
	if (!this._chatActionMenu) {
		var args = {
			parent: appCtxt.getShell(),
			controller: this,
			context: ZmId.TASKBAR,
			menuType: "Chat",
			menuItems: [ZmId.OP_IM_CLOSE_CHAT, ZmId.OP_IM_CLOSE_ALL_CHATS, ZmId.OP_IM_CLOSE_OTHER_CHATS]
		};
		this._chatActionMenu = new ZmActionMenu(args);
		this._chatActionMenu.getOp(ZmId.OP_IM_CLOSE_CHAT).addSelectionListener(new AjxListener(this, this._closeChatMenuListener));
		this._chatActionMenu.getOp(ZmId.OP_IM_CLOSE_ALL_CHATS).addSelectionListener(new AjxListener(this, this._closeAllChatsListener));
		this._chatActionMenu.getOp(ZmId.OP_IM_CLOSE_OTHER_CHATS).addSelectionListener(new AjxListener(this, this._closeOtherChatsListener));
	}
	this._chatActionMenu.popup(0, ev.docX, ev.docY);
};

ZmTaskbarController.prototype._closeChatMenuListener =
function() {
	this.endChat(this._actionedChat);
	this._actionedChat = null;
};

ZmTaskbarController.prototype._closeAllChatsListener =
function() {
	var allChats = [];
	for (var id in this._chatData) {
		allChats.push(this._chatData[id].chat);
	}
	for (var i = 0, count = allChats.length; i < count; i++) {
		this.endChat(allChats[i]);
	}
	this._actionedChat = null;
};

ZmTaskbarController.prototype._closeOtherChatsListener =
function() {
	var otherChats = [];
	for (var id in this._chatData) {
		var chat = this._chatData[id].chat;
		if (chat != this._actionedChat) {
			otherChats.push(chat);
		}
	}
	for (var i = 0, count = otherChats.length; i < count; i++) {
		this.endChat(otherChats[i]);
	}
	this._actionedChat = null;
};

ZmTaskbarController.prototype._newBuddyListener =
function() {
	ZmImApp.INSTANCE.prepareVisuals();
	ZmImApp.INSTANCE.getImController()._newRosterItemListener();
};

ZmTaskbarController.prototype._toolbarMouseDownListener =
function(ev) {
	if (ev.button == DwtMouseEvent.LEFT && this._toolbar.expandedItem) {
		this._toolbar.expandItem(this._toolbar.expandedItem, false);
	}
};

ZmTaskbarController.prototype._rosterListChangeListener =
function(ev) {
	if (ev.event == ZmEvent.E_MODIFY) {
		var fields = ev.getDetail("fields");
		var items = ev.getItems();
		for (var i=0; i < items.length; i++) {
			var item = items[i];
			if (item instanceof ZmRosterItem) {
				var list;
				list = list || ZmImApp.INSTANCE.getRoster().getChatList();
				var chats = list.getChatsByRosterAddr(item.getAddress());
				for (var c in chats) {
					var chat = chats[c];
					var chatWidget = this.getChatWidgetForChat(chats[c]);
					if (chatWidget) {
						//TODO: does this just end up calling back to the taskbar?
						chatWidget._rosterItemChangeListener(item, fields);
					}
				}
			}
		}
	}
};

ZmTaskbarController.prototype._chatListListener = function(ev) {
	if (ev.event == ZmEvent.E_CREATE) {
		var chat = ev.getDetails().items[0];
		var data = this._chatData[chat.id];
		var item;
		if (data) {
			this._toolbar.conditionalExpand(data.item);
		} else {
			item = this.createChatItem(chat, ev.getDetails().background);
		}
	} else if (ev.event == ZmEvent.E_DELETE) {
		var chat = ev._details.items[0];
		this._deleteChatItem(chat);
	}
};

ZmTaskbarController.prototype._deleteChatItem =
function(chat) {
	this._removeChatFromMru(chat);
	chat.removeChangeListener(this._chatChangeListenerListenerObj);
	var data = this._chatData[chat.id];
	if (data) {
		this._toolbar.removeSeparator(data.separator);
		data.item.dispose();
		this._chatButtonIndex -= 1;
		delete this._chatData[chat.id];
	}
};

ZmTaskbarController.prototype._getChatToolTip =
function(chat, callback) {
	var tooltip = chat.getRosterItem().getToolTip();
	callback.run(tooltip);
};

ZmTaskbarController.prototype._expandChatItem =
function(taskbarItem, chat, expand) {
	this._updateChatMru(chat);
	this._toolbar.expandItem(taskbarItem, expand);
	var chatWidget = this._chatData[chat.id].chatWidget;
	chatWidget._onMinimize(!expand);
	if (expand) {
		chatWidget.focus();
	}
};

ZmTaskbarController.prototype._chatSelectionListener =
function(chat, ev) {
	if (chat && ev.target && (ev.target.className == this._closeClass)) {
		this.endChat(chat);
	} else {
		var taskbarItem = ev.dwtObj.parent;
		this._expandChatItem(taskbarItem, chat, !taskbarItem.expanded);
	}
};

ZmTaskbarController.prototype._selectionListener =
function(ev) {
	this._toolbar.toggleExpanded(ev.dwtObj.parent);
};

ZmTaskbarController.prototype._newBuddySelectionListener =
function(ev) {
	if (ZmImApp.loggedIn()) {
		this._toolbar.toggleExpanded(this._newBuddyItem);
	} else {
		ZmImApp.INSTANCE.login({ callback: this._newBuddySelectionListenerObj });
	}
};

ZmTaskbarController.prototype._chatChangeListenerListener =
function(ev) {
	var chat = ev.source;
	var chatData = this._chatData[chat.id];
	if (chatData && !chatData.item.expanded) {
		var message = ev.getDetail("fields")[ZmChat.F_MESSAGE];
		if (message && !message.fromMe && !message.isSystem) {
			chatData.item.showAlert(true);
			this._updateChatMru(chat);
		}
	}
};

ZmTaskbarController.prototype._closeChatListener =
function(chat) {
	this.endChat(chat);
};

ZmTaskbarController.prototype._minimizeChatListener =
function(chat) {
	var taskbarItem = this._chatData[chat.id].item;
	this._expandChatItem(taskbarItem, chat, false);

	// Leave the toolbar button in a selected state for an instant to
	// make it clear to the user where the chat went.
	taskbarItem.button.setDisplayState(DwtControl.SELECTED);
	AjxTimedAction.scheduleAction(new AjxTimedAction(this, this._minimzeTimedAction, taskbarItem), 250);
};

ZmTaskbarController.prototype._minimzeTimedAction =
function(taskbarItem) {
	taskbarItem.button.setDisplayState(DwtControl.NORMAL);
};

ZmTaskbarController.prototype._chatStatusListener =
function(chat, status) {
	var taskbarItem = this._chatData[chat.id].item;
	taskbarItem.button.setImage(status.statusImage);
	var title = status.title ? AjxStringUtil.clipByLength(status.title, 15) : "";
	taskbarItem.button.setText(title);
};

ZmTaskbarController.prototype._createItem =
function(params) {
	params.parent = this._toolbar;
	params.selectionListener = params.selectionListener || new AjxListener(this, this._selectionListener);
	return new ZmTaskbarItem(params);
};

ZmTaskbarController.prototype._rosterChangeListener =
function(ev) {
	if (ev.event == ZmEvent.E_MODIFY) {
		var fields = ev.getDetail("fields");
		if (ZmRoster.F_PRESENCE in fields) {
			var presence = ZmImApp.INSTANCE.getRoster().getPresence();
			this._updatePresenceButton(presence);
		}
	}
};

ZmTaskbarController.prototype._updatePresenceButton =
function(presence) {
	var button = this._presenceItem.button;
	button.setImage(presence ? presence.getIcon() : "Offline");
	var showText = presence ? AjxStringUtil.htmlEncode(presence.getShowText()) : ZmMsg.imStatusOffline;
	var tooltip = ZmImApp.INSTANCE.getServiceController().getMyPresenceTooltip(showText);
	button.setToolTipContent(tooltip);
};

ZmTaskbarController.prototype._gatewayListListener =
function(ev) {
	if (!ZmImApp.INSTANCE.getServiceController().capabilities[ZmImServiceController.ACCOUNTS]) {
		return;
	}
	this._gatewayData = this._gatewayData || { };

	var gateways = ev.roster.getGateways();
	for (var i = 1, count = gateways.length; i < count; i++) {
		var gateway = gateways[i];
		if (!this._gatewayData[gateway.type]) {
			// If there's already a gateway item, add a separator.
			for (var ignored in this._gatewayData) {
				this._toolbar.addSeparator();
				break;
			}
			var args = {
				buttonConstructor: ZmStatusImageButton,
				contentClassName: "ZmGatewayPopup",
				data: gateway,
				rightAlign: true
			};
			var item = this._createItem(args);
			item.button.setImage("WebSearch");  // TODO appropriately sized interop icons.
			this._gatewayData[gateway.type] = { item: item };
			gateway.addListener(ZmImGateway.EVENT_SET_STATE, new AjxListener(this, this._gatewayEventListener, [gateway]));
		}
		this._updateGatewayButton(gateway);
	}
};

ZmTaskbarController.prototype._gatewayEventListener =
function(gateway) {
	this._updateGatewayButton(gateway);
};

ZmTaskbarController.prototype._updateGatewayButton =
function(gateway) {
	var statusImage = this._presenceItem.button.getImage();
	var statusFormat;
	if (gateway.isOnline()) {
		statusFormat = this._gatewayOnlineFormat = this._gatewayOnlineFormat || new AjxMessageFormat(ZmMsg.imStatusGatewayOnline);
	} else {
		statusFormat = this._gatewayOfflineFormat = this._gatewayOfflineFormat || new AjxMessageFormat(ZmMsg.imStatusGatewayOffline);
		statusImage = "Offline";
	}
	var text = statusFormat.format([ZmMsg["imGateway_" + gateway.type], gateway.nick]);
	var button = this._gatewayData[gateway.type].item.button;
	button.setToolTipContent(text);
	button.setStatusImage(statusImage);
};

/**
 * ZmStatusImageButton is a menu item with a second icon for a service's online status.
 */
ZmStatusImageButton = function(params) {
	params.className = "ZmStatusImageButton";
	DwtButton.call(this, params);
};

ZmStatusImageButton.prototype = new DwtButton;
ZmStatusImageButton.prototype.constructor = ZmStatusImageButton;

ZmStatusImageButton.prototype.TEMPLATE = "share.App#ZmStatusImageButton";

ZmStatusImageButton.prototype.toString =
function() {
	return "ZmStatusImageButton";
};

ZmStatusImageButton.prototype.dispose =
function() {
	this._statusIconEl = null;
	DwtMenuItem.prototype.dispose.call(this);
};

ZmStatusImageButton.prototype.setStatusImage =
function(imageInfo) {
	if (this._statusIconEl) {
		AjxImg.setImage(this._statusIconEl, imageInfo);
	}
};

ZmStatusImageButton.prototype._createHtmlFromTemplate =
function(templateId, data) {
    DwtButton.prototype._createHtmlFromTemplate.call(this, templateId, data);
    this._statusIconEl = document.getElementById(data.id + "_status_icon");
};

