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

	var buttons = [
		{
			op: ZmId.OP_IM_PRESENCE_MENU,
			button: {
				template: "share.App#presenceButton",
				menu: new AjxCallback(this, this._presenceMenuCallback),
				menuAbove: true
			}
		},
		{
			op: ZmOperation.SEP
		},
		{
			op: ZmOperation.FILLER
		}
	];
	for (var i = 0, count = buttons.length; i < count; i++) {
		this._createTaskbarButton(buttons[i]);
	}
	this._chatButtonIndex = 2;

	var height = appCtxt.getSkinHint("presence", "height") || 24;
	Dwt.setSize(parentEl, Dwt.DEFAULT, height);

	var roster = ZmImApp.INSTANCE.getRoster();
	this._updatePresenceButton(ZmImApp.loggedIn() ? roster.getPresence() : null);
	roster.addChangeListener(new AjxListener(this, this._rosterChangeListener));

	roster.addGatewayListListener(new AjxListener(this, this._gatewayListListener));
	ZmImApp.INSTANCE.getRoster().getChatList().addChangeListener(new AjxListener(this, this._chatListListener));

	var args = {
		parent: this._toolbar,
		index: this._chatButtonIndex++,
		contentCalback: new AjxCallback(this, this._createBuddyListCallback),
		op: ZmId.OP_IM_BUDDY_LIST
	};
	var item = new ZmTaskbarItem(args);
	item.button.addSelectionListener(new AjxListener(this, this._selectionListener, [item, null]));
};

ZmTaskbarController.prototype = new ZmController;
ZmTaskbarController.prototype.constructor = ZmTaskbarController;

ZmTaskbarController.prototype.toString =
function() {
	return "ZmTaskbarController";
};

ZmTaskbarController.prototype.expandItem =
function(item, expand) {
	if (expand && this._expandedItem) {
		this._expandedItem.expand(false);
	}
	item.expand(expand);
	this._expandedItem = expand ? item : null;
};

ZmTaskbarController.prototype.createChatItem =
function(chat) {
	var separator = this._toolbar.addSeparator(null, this._chatButtonIndex++);

	var args = {
		parent: this._toolbar,
		index: this._chatButtonIndex++,
		contentCalback: new AjxCallback(this, this._createChatItemCallback, [chat])
	};
	var item = new ZmTaskbarItem(args);
	this._chatData = this._chatData || {};
	this._chatData[chat.id] = { item: item, separator: separator };
	var hoverImage = "Close";
	item.button.setHoverImage(hoverImage);
	this._closeClass = this._closeClass || AjxImg.getClassForImage(hoverImage);
	item.button.addSelectionListener(new AjxListener(this, this._selectionListener, [item, chat]));
	this.expandItem(item, true);


	return item;
};

ZmTaskbarController.prototype.deleteChatItem =
function(chat) {
	var data = this._chatData[chat.id];
	if (data) {
		this._toolbar.removeSeparator(data.separator);
		data.item.dispose();
		this._chatButtonIndex -= 2;
	}
};

ZmTaskbarController.prototype._toolbarMouseDownListener =
function(ev) {
	if (ev.button == DwtMouseEvent.LEFT && this._expandedItem) {
		this.expandItem(this._expandedItem, false);
	}
};

ZmTaskbarController.prototype._selectionListener =
function(item, chat, ev) {
	if (chat && ev.target && (ev.target.className == this._closeClass)) {
		ZmChatMultiWindowView.getInstance().endChat(chat);
	} else {
		this.expandItem(item, !item.expanded);
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
	var widget = new ZmChatWidget(args, parent.button);
	this._chatData[chat.id].chatWidget = widget;
	widget.addCloseListener(new AjxListener(this, this._closeChatListener, [parent, widget]));
	widget.addMinimizeListener(new AjxListener(this, this._minimizeChatListener, [parent, widget]));
	widget._setChat(chat);
};

ZmTaskbarController.prototype._closeChatListener =
function(taskbarItem, widget) {
	ZmChatMultiWindowView.getInstance().endChat(widget.chat);
};

ZmTaskbarController.prototype._minimizeChatListener =
function(taskbarItem, widget) {
	this.expandItem(taskbarItem, false);
};

ZmTaskbarController.prototype._createTaskbarButton =
function(data) {
	if (data.op == ZmOperation.SEP) {
		this._toolbar.addSeparator(null, data.index);
	} else  if (data.op == ZmOperation.FILLER) {
		this._toolbar.addFiller(null, data.index);
	} else {
		data.button.text = ZmMsg[ZmOperation.getProp(data.op, "textKey")];
		data.button.image = ZmOperation.getProp(data.op, "image");
		data.button.tooltip = ZmMsg[ZmOperation.getProp(data.op, "tooltipKey")];
		this._toolbar.createButton(data.op, data.button);
	}
};

ZmTaskbarController.prototype._presenceMenuCallback =
function(button) {
	AjxDispatcher.require(["IMCore", "IM"]);
	return ZmImApp.INSTANCE.getServiceController().createPresenceMenu(button);
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
	var button = this._toolbar.getButton(ZmId.OP_IM_PRESENCE_MENU);
	var icon = presence ? presence.getIcon() : "Offline";
	button.setImage(icon);
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
			this._toolbar.addSeparator();
			var buttonArgs = {
				ctor: ZmStatusImageButton,
				image: "WebSearch",
				menu: new AjxCallback(this, this._gatewayMenuCallback, [gateway]),
				menuAbove: true
			};
			var button = this._toolbar.createButton(Dwt.getNextId(), buttonArgs);  // TODO appropriately sized icons.
			this._gatewayData[gateway.type] = {button: button};
		}
		this._updateGatewayButton(gateway, button);
	}
};

ZmTaskbarController.prototype._updateGatewayButton =
function(gateway, button) {
	var statusImage = this._toolbar.getButton(ZmId.OP_IM_PRESENCE_MENU).getImage();
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

