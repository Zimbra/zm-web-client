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

ZmPresenceMenu = function(parent, statuses) {
	ZmPopupMenu.call(this, parent);
	this._statuses = statuses;
	var presenceListener = new AjxListener(this, this._presenceItemListener);
	for (var i = 0; i < statuses.length; i++) {
		this.addOperation(statuses[i], presenceListener, DwtMenuItem.RADIO_STYLE);
	}

	this._mruSeparator = this.addOperation(ZmOperation.SEP);
	this._mruIndex = this.getNumChildren();

	this._mruItems = [];

	this._mruSeparator = this.addOperation(ZmOperation.SEP);
	var customListener = new AjxListener(this, this._presenceCustomItemListener);
	this.addOperation(ZmOperation.IM_PRESENCE_CUSTOM_MSG, customListener);
};

ZmPresenceMenu.prototype = new ZmPopupMenu;
ZmPresenceMenu.prototype.constructor = ZmPresenceMenu;

// Public methods

ZmPresenceMenu.prototype.toString =
function() {
	return "ZmPresenceMenu";
}

ZmPresenceMenu.MRU_SIZE = 5;

ZmPresenceMenu.prototype.popup =
function(delay, x, y, kbGenerated) {
	this._updatePresenceMenu();
	ZmPopupMenu.prototype.popup.call(this, delay, x, y, kbGenerated);
};

ZmPresenceMenu.prototype.addOperation =
function(op, listener, style, index) {
	if (op == ZmOperation.SEP) {
		return new DwtMenuItem({parent:this, style:DwtMenuItem.SEPARATOR_STYLE});
	} else {
		var args = {
			image : ZmOperation.getProp(op, "image"),
			text : ZmMsg[ZmOperation.getProp(op, "textKey")],
			style : style,
			index: index
		};
		var mi = this.createMenuItem(op, args);
		mi.setData(ZmOperation.MENUITEM_ID, op);
		mi.setData(ZmOperation.KEY_ID, op);
		mi.addSelectionListener(listener);
		return mi;
	}
};

// Protected methods

ZmPresenceMenu.prototype._presenceItemListener =
function(ev) {
	if (ev.detail != DwtMenuItem.CHECKED) {
		return;
	}
	var id = ev.item.getData(ZmOperation.KEY_ID);
	var show = ZmRosterPresence.operationToShow(id);
	if (ZmImApp.loggedIn()) {
		this._doSetPresence(show);
	} else {
		ZmImApp.INSTANCE.login({ presence: { show: show } });
	}
};

ZmPresenceMenu.prototype._doSetPresence =
function(show) {
	ZmImApp.INSTANCE.getRoster().setPresence(show, 0, null);
};

ZmPresenceMenu.prototype._presenceMRUListener =
function(ev) {
	var message = AjxStringUtil.htmlDecode(ev.dwtObj.getText());
	this._setCustom(message);
};

ZmPresenceMenu.prototype._setCustom =
function(message) {
	if (ZmImApp.loggedIn()) {
		this._doSetCustom(message);
	} else {
		ZmImApp.INSTANCE.login({ presence: { show: ZmRosterPresence.SHOW_ONLINE, customStatusMsg: message } });
	}
};

ZmPresenceMenu.prototype._doSetCustom =
function(message) {
	var batchCommand = new ZmBatchCommand();
	ZmImApp.INSTANCE.getRoster().setPresence(ZmRosterPresence.SHOW_ONLINE, 0, message, batchCommand);
	this._addToMRU(message, batchCommand);
	batchCommand.run();
};

ZmPresenceMenu.prototype._getMRUItem =
function(index) {
	if (!this._mruItems[index]) {
		this._presenceMRUListenerObj = this._presenceMRUListenerObj || new AjxListener(this, this._presenceMRUListener);
		this._mruItems[index] = this.addOperation(
				ZmOperation.IM_PRESENCE_CUSTOM_MRU, this._presenceMRUListenerObj,
				DwtMenuItem.RADIO_STYLE, this._mruIndex++);
	}
	return this._mruItems[index];
};

ZmPresenceMenu.prototype._updatePresenceMenu =
function() {
	var currentShowOp;
    var status;
    if (ZmImApp.loggedIn()) {
        var presence = ZmImApp.INSTANCE.getRoster().getPresence();
        currentShowOp = presence.getShowOperation();
        status = presence.getStatus();
    } else {
        currentShowOp = ZmOperation.IM_PRESENCE_OFFLINE;
    }

	var mru = appCtxt.get(ZmSetting.IM_CUSTOM_STATUS_MRU);
	this._mruSeparator.setVisible(mru.length);
	for (var i = 0; i < mru.length; i++) {
		var mruVisible = i < mru.length;
		var mruItem = this._getMRUItem(i);
		mruItem.setVisible(mruVisible);
		if (mruVisible) {
			mruItem.setText(AjxStringUtil.htmlEncode(mru[i]));
			var mruChecked = mru[i] == status;
			mruItem.setChecked(mruChecked, mruChecked);
		}
	}

	var statusImage = "Offline";
	if (!status) {
        for (var i = 0; i < this._statuses.length; i++) {
            if (this._statuses[i] != ZmOperation.SEP) {
                var mi = this.getItemById(ZmOperation.MENUITEM_ID, this._statuses[i]);
                if (this._statuses[i] == currentShowOp) {
                    mi.setChecked(true, true);
					statusImage = mi.getImage();
					break;
                }
            }
        }
    }

	var buddiesItem = this.getItemById(ZmOperation.MENUITEM_ID, ZmOperation.IM_FLOATING_LIST);
	if (buddiesItem) {
		var buddyWindow = window.ZmBuddyListWindow && ZmBuddyListWindow.instance;
		var buddiesVisible = buddyWindow && buddyWindow.isPoppedUp();
		buddiesItem.setChecked(buddiesVisible, true);
	}
	this._updateGatewayItems(statusImage);
};

ZmPresenceMenu.prototype._updateGatewayItems =
function(statusImage) {
	if (ZmImApp.INSTANCE.hasRoster()) {
		var gateways = ZmImApp.INSTANCE.getRoster().getGateways();
		if (gateways.length > 1) {
			if (!this._gatewayItems) {
				this._gatewayItems = [];
				this._gatewayItems.push(this.addOperation(ZmOperation.SEP));
			}
			for (var i = 1, count = gateways.length; i < count; i++) {
				var gateway = gateways[i];
				var type = gateway.type;
				if (!this._gatewayItems[type]) {
					var mi = new ZmStatusImageItem({parent:this});
					mi.setImage("WebSearch"); // TODO: need icons.)
					mi.setMenu(new AjxCallback(this, this._createGatewaySubmenu, [mi, gateway]));
					this._gatewayItems[type] = {item: mi};
				} else {
					this._updateGatewaySubitems(gateway);
				}

				var statusFormat;
				if (gateway.isOnline()) {
					statusFormat = this._gatewayOnlineFormat = this._gatewayOnlineFormat || new AjxMessageFormat(ZmMsg.imStatusGatewayOnline);
				} else {
					statusFormat = this._gatewayOfflineFormat = this._gatewayOfflineFormat || new AjxMessageFormat(ZmMsg.imStatusGatewayOffline);
					statusImage = "Offline";
				}
				var text = statusFormat.format([ZmMsg["imGateway_" + type], gateway.nick]);
				var gatewayItem = this._gatewayItems[type].item;
				gatewayItem.setText(text);
				gatewayItem.setStatusImage(statusImage);
			}
		}
	}
};

ZmPresenceMenu.prototype._createGatewaySubmenu =
function(parent, gateway) {
	var menu = new ZmPopupMenu(parent);
	var loginItem = new DwtMenuItem({parent: menu});
	this._gatewayItems[gateway.type].loginItem = loginItem;
	var listener = new AjxListener(this, this._gatewaySubitemListener, [gateway]);
	loginItem.addSelectionListener(listener);

	var reconnectItem = new DwtMenuItem({parent: menu});
	reconnectItem._action = ZmPresenceMenu._SUBITEM_RECONNECT;
	this._gatewayItems[gateway.type].reconnectItem = reconnectItem;
	reconnectItem.addSelectionListener(listener);

	this._updateGatewaySubitems(gateway);
	return menu;
};

ZmPresenceMenu._SUBITEM_LOGOUT = "logout";
ZmPresenceMenu._SUBITEM_LOGIN = "login";
ZmPresenceMenu._SUBITEM_RECONNECT = "reconnect";

ZmPresenceMenu.prototype._gatewaySubitemListener =
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

ZmPresenceMenu.prototype._updateGatewaySubitems =
function(gateway) {
	var data = this._gatewayItems[gateway.type];
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

ZmPresenceMenu.prototype._presenceCustomItemListener =
function() {
	if (!this._customStatusDialog) {
		AjxDispatcher.require([ "IM" ]);
		this._customStatusDialog = new ZmCustomStatusDlg({ parent: appCtxt.getShell(), title: ZmMsg.newStatusMessage });
		this._customStatusDialog.registerCallback(DwtDialog.OK_BUTTON, new AjxListener(this, this._customDialogOk));
	}
	this._customStatusDialog.popup();
};

ZmPresenceMenu.prototype._customDialogOk =
function() {
	var statusMsg = this._customStatusDialog.getValue();
	if (statusMsg != "") {
		this._setCustom(statusMsg);
	}
	this._customStatusDialog.popdown();
};

ZmPresenceMenu.prototype._addToMRU =
function(message, batchCommand) {
	var settings = appCtxt.getSettings(),
		setting = settings.getSetting(ZmSetting.IM_CUSTOM_STATUS_MRU), 
		mru = setting.getValue();
	
	if (mru.length && (message == mru[0])) {
		return;
	}
	for (var i = 0, count = mru.length; i < count; i++) {
		if (mru[i] == message) {
			mru.splice(i, i);
			break;
		}
	}
	mru.unshift(message);
	if (mru.length > ZmPresenceMenu.MRU_SIZE) {
		mru.pop();
	}
	settings.save([setting], null, batchCommand);
};

///////////////////////////////////////////////////////////////////////////

/**
 * ZmStatusImageItem is a menu item with a second icon for a service's online status.
 */
ZmStatusImageItem = function(params) {
	params.className = "ZmStatusImageItem";
	DwtMenuItem.call(this, params);
}

ZmStatusImageItem.prototype = new DwtMenuItem;
ZmStatusImageItem.prototype.constructor = ZmStatusImageItem;

ZmStatusImageItem.prototype.TEMPLATE = "im.Chat#ZmStatusImageItem";

ZmStatusImageItem.prototype.toString =
function() {
	return "ZmStatusImageItem";
};

ZmStatusImageItem.prototype.dispose =
function() {
	this._statusIconEl = null;
	DwtMenuItem.prototype.dispose.call(this);
};

ZmStatusImageItem.prototype.setStatusImage =
function(imageInfo) {
	if (this._statusIconEl) {
		AjxImg.setImage(this._statusIconEl, imageInfo);
	}
};

ZmStatusImageItem.prototype._createHtmlFromTemplate =
function(templateId, data) {
    DwtMenuItem.prototype._createHtmlFromTemplate.call(this, templateId, data);
    this._statusIconEl = document.getElementById(data.id + "_status_icon");
};


