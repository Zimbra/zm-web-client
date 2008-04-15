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

ZmPresenceMenu = function(parent, addFloatingBuddyItem) {
	ZmPopupMenu.call(this, parent);
	var list = ZmPresenceMenu._getOperations();
	var presenceListener = new AjxListener(this, this._presenceItemListener);
	for (var i = 0; i < list.length; i++) {
		this._addOperation(list[i], presenceListener, DwtMenuItem.RADIO_STYLE);
	}
	if (addFloatingBuddyItem) {
		this._addOperation(ZmOperation.SEP);
		var buddyListener = new AjxListener(this, this._buddyListListener);
		this._addOperation(ZmOperation.IM_FLOATING_LIST, buddyListener, DwtMenuItem.CHECK_STYLE);
	}
};

ZmPresenceMenu.prototype = new ZmPopupMenu;
ZmPresenceMenu.prototype.constructor = ZmPresenceMenu;

// Public methods

ZmPresenceMenu.prototype.toString =
function() {
	return "ZmPresenceMenu";
}

ZmPresenceMenu.prototype.popup =
function(delay, x, y, kbGenerated) {
	this._updatePresenceMenu();
	ZmPopupMenu.prototype.popup.call(this, delay, x, y, kbGenerated);
};

// Protected methods

ZmPresenceMenu.prototype._addOperation =
function(op, listener, style) {
	if (op == ZmOperation.SEP) {
		new DwtMenuItem({parent:this, style:DwtMenuItem.SEPARATOR_STYLE});
	} else {
		var args = {
			image : ZmOperation.getProp(op, "image"),
			text : ZmMsg[ZmOperation.getProp(op, "textKey")],
			style : style
		};
		var mi = this.createMenuItem(op, args);
		mi.setData(ZmOperation.MENUITEM_ID, op);
		mi.setData(ZmOperation.KEY_ID, op);
		mi.addSelectionListener(listener);
	}
};

ZmPresenceMenu._getOperations =
function() {
	ZmPresenceMenu._LIST = ZmPresenceMenu._LIST || [
		ZmOperation.IM_PRESENCE_OFFLINE,
		ZmOperation.IM_PRESENCE_ONLINE,
		ZmOperation.IM_PRESENCE_CHAT,
		ZmOperation.IM_PRESENCE_DND,
		ZmOperation.IM_PRESENCE_AWAY,
		ZmOperation.IM_PRESENCE_XA,
		ZmOperation.IM_PRESENCE_CUSTOM_MSG
	];
	return ZmPresenceMenu._LIST;
};

ZmPresenceMenu.prototype._presenceItemListener =
function(ev) {
	if (ev.detail != DwtMenuItem.CHECKED) {
		return;
	}
	var id = ev.item.getData(ZmOperation.KEY_ID);
	if (id == ZmOperation.IM_PRESENCE_CUSTOM_MSG){
		this._presenceCustomItemListener(ev);
		return;
	}
	var show = ZmRosterPresence.operationToShow(id);
	ZmImApp.INSTANCE.getRoster().setPresence(show, 0, null);
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

    if (status) {
        var mi = this.getItemById(ZmOperation.MENUITEM_ID, ZmOperation.IM_PRESENCE_CUSTOM_MSG);
        mi.setChecked(true, true);
    } else {
        var list = ZmPresenceMenu._getOperations();
        for (var i = 0; i < list.length; i++) {
            if (list[i] != ZmOperation.SEP) {
                var mi = this.getItemById(ZmOperation.MENUITEM_ID, list[i]);
                if (list[i] == currentShowOp) {
                    mi.setChecked(true, true);
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
};

ZmPresenceMenu.prototype._presenceCustomItemListener =
function() {
	var initialMessage = "";
	if (ZmImApp.loggedIn()) {
		var presence = ZmImApp.INSTANCE.getRoster().getPresence();
		initialMessage = (presence.getShow() == ZmRosterPresence.SHOW_ONLINE) && presence.getStatus();
	}

	if (!this._customStatusDialog) {
		this._customStatusDialog = new ZmCustomStatusDlg({ parent: appCtxt.getShell(), title: ZmMsg.newStatusMessage });
		this._customStatusDialog.registerCallback(DwtDialog.OK_BUTTON, new AjxListener(this, this._customDialogOk));
	}
	this._customStatusDialog.popup(initialMessage);
};

ZmPresenceMenu.prototype._customDialogOk =
function() {
	var statusMsg = this._customStatusDialog.getValue();
	if (statusMsg != "") {
		ZmImApp.INSTANCE.getRoster().setPresence(null, 0, statusMsg);
	}
	this._customStatusDialog.popdown();
};

ZmPresenceMenu.prototype._buddyListListener =
function() {
	ZmImApp.INSTANCE.prepareVisuals();
	var buddyWindow = ZmBuddyListWindow.instance;
	if (!buddyWindow) {
		ZmBuddyListWindow.create();
	} else {
		if (buddyWindow.isPoppedUp()) {
			buddyWindow.popdown();
		} else {
			buddyWindow.popup();
		}
	}
};
