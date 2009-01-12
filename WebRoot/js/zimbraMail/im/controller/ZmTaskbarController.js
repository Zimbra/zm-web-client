/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008 Zimbra, Inc.
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

ZmTaskbarController = function(components) {
	ZmController.call(this, null);

	ZmTaskbarController.INSTANCE = this;

	var parentEl = Dwt.byId(ZmId.SKIN_TASKBAR);
	if (!parentEl) {
		return;
	}

	var toolbarArgs = {
		parent: appCtxt.getShell(),
		id: ZmId.TASKBAR,
		className: "ZmTaskbar",
		posStyle: Dwt.ABSOLUTE_STYLE
	};
	this._toolbar = components[ZmAppViewMgr.C_TASKBAR] = new ZmTaskbar(toolbarArgs);
	this._toolbar.addListener(DwtEvent.ONMOUSEDOWN, new AjxListener(this, this._toolbarMouseDownListener));

	var args = {
		contentCalback: new AjxCallback(this, this._createPresenceMenuCallback),
		op: ZmId.OP_IM_PRESENCE_MENU
	};
	this._presenceItem = this._createItem(args);
	this._toolbar.addSeparator();
	this._toolbar.addFiller(null);
	this._chatButtonIndex = this._toolbar.getNumChildren() + 1;

	var height = appCtxt.getSkinHint("presence", "height") || 24;
	Dwt.setSize(parentEl, Dwt.DEFAULT, height);

	var roster = ZmImApp.INSTANCE.getRoster();
	this._updatePresenceButton(ZmImApp.loggedIn() ? roster.getPresence() : null);
	roster.addChangeListener(new AjxListener(this, this._rosterChangeListener));

	roster.addGatewayListListener(new AjxListener(this, this._gatewayListListener));
	ZmImApp.INSTANCE.getRoster().getChatList().addChangeListener(new AjxListener(this, this._chatListListener));

	var args = {
		index: this._chatButtonIndex++,
		contentCalback: new AjxCallback(this, this._createBuddyListCallback),
		op: ZmId.OP_IM_BUDDY_LIST
	};
	this._createItem(args);
};

ZmTaskbarController.prototype = new ZmController;
ZmTaskbarController.prototype.constructor = ZmTaskbarController;

ZmTaskbarController.prototype.toString =
function() {
	return "ZmTaskbarController";
};

ZmTaskbarController.prototype.createChatItem =
function(chat) {
	var separator = this._toolbar.addSeparator(null, this._chatButtonIndex++);

	var args = {
		index: this._chatButtonIndex++,
		contentCalback: new AjxCallback(this, this._createChatItemCallback, [chat]),
		selectionListener: new AjxListener(this, this._chatSelectionListener, [chat])
	};
	var item = this._createItem(args);
	item.button.setToolTipContent(new AjxCallback(this, this._getChatToolTip, [chat]));

	this._chatData = this._chatData || {};
	this._chatData[chat.id] = { item: item, separator: separator };
	var hoverImage = "Close";
	item.button.setHoverImage(hoverImage);
	this._closeClass = this._closeClass || AjxImg.getClassForImage(hoverImage);
	this._toolbar.expandItem(item, true);

	return item;
};

ZmTaskbarController.prototype.deleteChatItem =
function(chat) {
	chat.removeChangeListener(this._chatChangeListenerListenerObj);
	var data = this._chatData[chat.id];
	if (data) {
		this._toolbar.removeSeparator(data.separator);
		data.item.dispose();
		this._chatButtonIndex -= 2;
	}
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
		contentCalback: new AjxCallback(this, this._createSubscribeRequestItemCallback, [addr, buddy])
	};
	var item = this._createItem(args);
	this._subscribeData[addr] = { item: item, separator: separator };
	this._subscribeRequestTooltip = this._subscribeRequestTooltip || new AjxMessageFormat(ZmMsg.imInvitationFrom);
	var tooltip = this._subscribeRequestTooltip.format(buddy ? buddy.getDisplayName() : addr);
	item.button.setToolTipContent(tooltip);
	if (this._toolbar.expandedItem) {
		item.showAlert(true);
	} else {
		this._toolbar.expandItem(item, true);
	}
};

ZmTaskbarController.prototype._toolbarMouseDownListener =
function(ev) {
	if (ev.button == DwtMouseEvent.LEFT && this._toolbar.expandedItem) {
		this._toolbar.expandItem(this._toolbar.expandedItem, false);
	}
};

ZmTaskbarController.prototype._getChatToolTip =
function(chat, callback) {
	var tooltip = chat.getRosterItem().getToolTip();
	callback.run(tooltip);
};

ZmTaskbarController.prototype._expandChatItem =
function(taskbarItem, chat, expand) {
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
		ZmChatMultiWindowView.getInstance().endChat(chat);
	} else {
		var taskbarItem = ev.dwtObj.parent;
		this._expandChatItem(taskbarItem, chat, !taskbarItem.expanded);
	}
};

ZmTaskbarController.prototype._selectionListener =
function(ev) {
	var taskbarItem = ev.dwtObj.parent;
	this._toolbar.expandItem(taskbarItem, !taskbarItem.expanded);
};

ZmTaskbarController.prototype._createPresenceMenuCallback =
function(parent, parentElement) {
	AjxDispatcher.require(["IMCore", "IM"]);
	var args = {
		parent: parent.button,
		parentElement: parentElement,
		posStyle: DwtControl.STATIC_STYLE,
		className: null
	};
	var menu = ZmImApp.INSTANCE.getServiceController().createPresenceMenu(args);
	menu.addSelectionListener(new AjxListener(this, this._menuSelectionListener));
};

ZmTaskbarController.prototype._menuSelectionListener =
function() {
	if (this._toolbar.expandedItem) {
		this._toolbar.expandItem(this._toolbar.expandedItem, false);
	}
};

ZmTaskbarController.prototype._createBuddyListCallback =
function(parent, parentElement) {
	var overviewArgs = {
		parentElement: parentElement,
		posStyle: Dwt.STATIC_STYLE,
		isFloating: true,
		noAssistant: true,
		expanded: true,
		singleClick: true
	};
	new ZmImOverview(parent, overviewArgs);
};

ZmTaskbarController.prototype._createChatItemCallback =
function(chat, parent, parentElement) {
	var args = {
		parent: parent,
		parentElement: parentElement,
		posStyle: Dwt.STATIC_STYLE
	};
	var widget = new ZmChatWidget(args);
	this._chatData[chat.id].chatWidget = widget;
	widget.addCloseListener(new AjxListener(this, this._closeChatListener, [chat]));
	widget.addMinimizeListener(new AjxListener(this, this._minimizeChatListener, [chat, parent]));
	widget.addStatusListener(new AjxListener(this, this._chatStatusListener, [parent]));
	widget._setChat(chat);
	widget.focus();
	this._chatChangeListenerListenerObj = this._chatChangeListenerListenerObj || new AjxListener(this, this._chatChangeListenerListener);
	chat.addChangeListener(this._chatChangeListenerListenerObj);
};

ZmTaskbarController.prototype._chatChangeListenerListener =
function(ev) {
	var chat = ev.source;
	var chatData = this._chatData[chat.id];
	if (chatData && !chatData.item.expanded) {
		var message = ev.getDetail("fields")[ZmChat.F_MESSAGE];
		if (message && !message.fromMe && !message.isSystem) {
			chatData.item.showAlert(true);
		}
	}
};

ZmTaskbarController.prototype._closeChatListener =
function(chat) {
	ZmChatMultiWindowView.getInstance().endChat(chat);
};

ZmTaskbarController.prototype._minimizeChatListener =
function(chat, taskbarItem) {
	this._expandChatItem(taskbarItem, chat, false);
};

ZmTaskbarController.prototype._chatStatusListener =
function(taskbarItem, status) {
	taskbarItem.button.setImage(status.statusImage);
	taskbarItem.button.setText(status.title);
};

ZmTaskbarController.prototype._createSubscribeRequestItemCallback =
function(addr, buddy, item, contentEl) {
	var id = item.getHTMLElId();

	var templateArgs = {
		id : id,
		buddy: buddy ? buddy.getDisplayName() : addr,
		inList: !!buddy
	};
	contentEl.innerHTML = AjxTemplate.expand("im.Chat#SubscribeAuthDlg", templateArgs);

	if (!buddy) {
		var acceptAdd = new DwtButton({parent:item});
		acceptAdd.setText(ZmMsg.imSubscribeAuthRequest_acceptAndAdd);
		acceptAdd.addSelectionListener(new AjxListener(this, this._subscribeRequestAcceptAddListener, [addr]));
		acceptAdd.reparentHtmlElement(id + "_acceptAndAdd");
	}

	var accept = new DwtButton({parent:item});
	accept.setText(ZmMsg.imSubscribeAuthRequest_accept);
	accept.addSelectionListener(new AjxListener(this, this._subscribeRequestAcceptListener, [addr]));
	accept.reparentHtmlElement(id + "_accept");

	var deny = new DwtButton({parent:item});
	deny.setText(ZmMsg.imSubscribeAuthRequest_deny);
	deny.addSelectionListener(new AjxListener(this, this._subscribeRequestDenyListener, [addr]));
	deny.reparentHtmlElement(id + "_deny");
};

ZmTaskbarController.prototype._subscribeRequestAcceptAddListener =
function(addr) {
	this._sendSubscribeAuthorization(true, true, addr);
};

ZmTaskbarController.prototype._subscribeRequestAcceptListener =
function(addr) {
	this._sendSubscribeAuthorization(true, false, addr);
};

ZmTaskbarController.prototype._subscribeRequestDenyListener =
function(addr) {
	this._sendSubscribeAuthorization(false, false, addr);
};

ZmTaskbarController.prototype._sendSubscribeAuthorization =
function(accept, add, addr) {
	var data = this._subscribeData[addr];
	data.item.dispose();
	this._toolbar.removeSeparator(data.separator);
	delete this._subscribeData[addr];
	AjxDispatcher.run("GetRoster").sendSubscribeAuthorization(accept, add, addr);
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
	if (!ZmImApp.INSTANCE.getServiceController().getSupportsAccounts()) {
		return;
	}
	ev.roster.getGateways();
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
			var buttonArgs = {
				ctor: ZmStatusImageButton,
				image: "WebSearch",
				menu: new AjxCallback(this, this._gatewayMenuCallback, [gateway]),
				menuAbove: true
			};
			var button = this._toolbar.createButton(Dwt.getNextId(), buttonArgs);  // TODO appropriately sized icons.
			this._gatewayData[gateway.type] = {button: button};
		}
		this._updateGatewayButton(gateway, this._gatewayData[gateway.type].button);
	}
};

ZmTaskbarController.prototype._updateGatewayButton =
function(gateway, button) {
	var statusImage = this._presenceItem.button.getImage();
	var statusFormat;
	if (gateway.isOnline()) {
		statusFormat = this._gatewayOnlineFormat = this._gatewayOnlineFormat || new AjxMessageFormat(ZmMsg.imStatusGatewayOnline);
	} else {
		statusFormat = this._gatewayOfflineFormat = this._gatewayOfflineFormat || new AjxMessageFormat(ZmMsg.imStatusGatewayOffline);
		statusImage = "Offline";
	}
	var text = statusFormat.format([ZmMsg["imGateway_" + gateway.type], gateway.nick]);
	button.setToolTipContent(text);
	button.setStatusImage(statusImage);
};

ZmTaskbarController.prototype._gatewayMenuCallback =
function(gateway, button) {
	var menu = new ZmPopupMenu(button);
	var loginItem = new DwtMenuItem({parent: menu});
	this._gatewayData[gateway.type].loginItem = loginItem;
	var listener = new AjxListener(this, this._gatewaySubitemListener, [gateway]);
	loginItem.addSelectionListener(listener);

	var reconnectItem = new DwtMenuItem({parent: menu});
	reconnectItem._action = ZmPresenceMenu._SUBITEM_RECONNECT;
	this._gatewayData[gateway.type].reconnectItem = reconnectItem;
	reconnectItem.addSelectionListener(listener);

	this._updateGatewaySubitems(gateway);
	return menu;
};

ZmTaskbarController.prototype._gatewaySubitemListener =
function(gateway, ev) {
	var item = ev.dwtObj;
	if (item._action == ZmPresenceMenu._SUBITEM_LOGOUT) {
		ZmImApp.INSTANCE.getRoster().unregisterGateway(gateway.type);
	} else if (item._action == ZmPresenceMenu._SUBITEM_LOGIN) {
		ZmImApp.INSTANCE.getImController()._imGatewayLoginListener({gwType: gateway.type});
	} else if (item._action == ZmPresenceMenu._SUBITEM_RECONNECT) {
		ZmRoster.prototype.reconnectGateway(gateway);
	}
};

ZmTaskbarController.prototype._updateGatewaySubitems =
function(gateway) {
	var data = this._gatewayData[gateway.type];
	if (data.reconnectItem) {
		data.reconnectItem.setEnabled(gateway.getState() == ZmImGateway.STATE.BOOTED_BY_OTHER_LOGIN);
		data.reconnectItem.setText(ZmMsg.imReconnectCaps);
	}
	if (data.loginItem) {
		var online = gateway.isOnline();
		data.loginItem._action = online ? ZmPresenceMenu._SUBITEM_LOGOUT : ZmPresenceMenu._SUBITEM_LOGIN;
		data.loginItem.setText(online ? ZmMsg.logOff : ZmMsg.login);
	}
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

