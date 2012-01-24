/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

ZmPresencePopup = function(params) {
	ZmTaskbarPopup.call(this, params);

	var contentEl = this._createPopupHtml(ZmMsg.setStatus);
	var menuArgs = {
		parent: this.taskbarItem.button,
		parentElement: contentEl,
		posStyle: DwtControl.STATIC_STYLE,
		className: null
	};
	this._menu = new ZmPopupMenu(menuArgs);

	var data = ZmImApp.INSTANCE.getServiceController().defineStatusMenu();
	this._populateMenu(data);
};

ZmPresencePopup.prototype = new ZmTaskbarPopup;
ZmPresencePopup.prototype.constructor = ZmPresencePopup;

ZmPresencePopup.prototype.toString =
function() {
	return "ZmPresencePopup";
};

ZmPresencePopup.prototype.popup =
function() {
	ZmTaskbarPopup.prototype.popup.apply(this, arguments);
	this._updatePresenceMenu();
};

ZmPresencePopup.prototype._populateMenu =
function(data) {
	this._statuses = data.statuses;
	var presenceListener = new AjxListener(this, this._presenceItemListener);
	for (var i = 0; i < this._statuses.length; i++) {
		this.addOperation(this._statuses[i], presenceListener, DwtMenuItem.RADIO_STYLE);
	}

	this._mruSeparator = this.addOperation(ZmOperation.SEP);
	this._mruIndex = this._menu.getNumChildren();

	this._mruItems = [];

	this._mruSeparator = this.addOperation(ZmOperation.SEP);
	var customListener = new AjxListener(this, this._presenceCustomItemListener);
	this.addOperation(ZmOperation.IM_PRESENCE_CUSTOM_MSG, customListener);

	if (data.logout) {
		this.addOperation(ZmOperation.SEP);
		this._logoutItem = this.addOperation(ZmOperation.IM_LOGOUT_YAHOO, new AjxListener(this, this._logoutListener));
	}
};

ZmPresencePopup.prototype.addOperation =
function(op, listener, style, index) {
	if (op == ZmOperation.SEP) {
		return new DwtMenuItem({parent:this._menu, style:DwtMenuItem.SEPARATOR_STYLE});
	} else {
		var args = {
			image : ZmOperation.getProp(op, "image"),
			text : ZmMsg[ZmOperation.getProp(op, "textKey")],
			style : style,
			index: index
		};
		var mi = this._menu.createMenuItem(op, args);
		mi.setData(ZmOperation.MENUITEM_ID, op);
		mi.setData(ZmOperation.KEY_ID, op);
		mi.addSelectionListener(listener);
		return mi;
	}
};

ZmPresencePopup.prototype._handleSelection =
function() {
	this._doPopdown();
};

ZmPresencePopup.prototype._presenceItemListener =
function(ev) {
	this._handleSelection();
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

ZmPresencePopup.prototype._doSetPresence =
function(show) {
	ZmImApp.INSTANCE.getRoster().setPresence(show, 0, null);
};

ZmPresencePopup.prototype._presenceMRUListener =
function(ev) {
	this._handleSelection();
	var message = AjxStringUtil.htmlDecode(ev.dwtObj.getText());
	this._setCustom(message);
};

ZmPresencePopup.prototype._setCustom =
function(message) {
	if (ZmImApp.loggedIn()) {
		this._doSetCustom(message);
	} else {
		ZmImApp.INSTANCE.login({ presence: { show: ZmRosterPresence.SHOW_ONLINE, customStatusMsg: message } });
	}
};

ZmPresencePopup.prototype._doSetCustom =
function(message) {
	var batchCommand = new ZmBatchCommand();
	ZmImApp.INSTANCE.getRoster().setPresence(ZmRosterPresence.SHOW_ONLINE, 0, message, batchCommand);
	this._addToMRU(message, batchCommand);
	batchCommand.run();
};

ZmPresencePopup.prototype._getMRUItem =
function(index) {
	if (!this._mruItems[index]) {
		this._presenceMRUListenerObj = this._presenceMRUListenerObj || new AjxListener(this, this._presenceMRUListener);
		this._mruItems[index] = this.addOperation(
				ZmOperation.IM_PRESENCE_CUSTOM_MRU, this._presenceMRUListenerObj,
				DwtMenuItem.RADIO_STYLE, this._mruIndex++);
	}
	return this._mruItems[index];
};

ZmPresencePopup.prototype._updatePresenceMenu =
function() {
	var currentShowOp;
    var status;
	var loggedIn = ZmImApp.loggedIn();
	if (loggedIn) {
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
                var mi = this._menu.getItemById(ZmOperation.MENUITEM_ID, this._statuses[i]);
                if (this._statuses[i] == currentShowOp) {
                    mi.setChecked(true, true);
					statusImage = mi.getImage();
					break;
                }
            }
        }
    }
	if (this._logoutItem) {
		this._logoutItem.setEnabled(loggedIn);
	}
};

ZmPresencePopup.prototype._logoutListener =
function() {
	this._handleSelection();
	ZmImApp.INSTANCE.getServiceController().logout();
};

ZmPresencePopup.prototype._presenceCustomItemListener =
function() {
	this._handleSelection();
	if (!this._customStatusDialog) {
		this._customStatusDialog = new ZmCustomStatusDlg({ parent: appCtxt.getShell(), title: ZmMsg.newStatusMessage });
		this._customStatusDialog.registerCallback(DwtDialog.OK_BUTTON, new AjxListener(this, this._customDialogOk));
	}
	this._customStatusDialog.popup();
};

ZmPresencePopup.prototype._customDialogOk =
function() {
	var statusMsg = this._customStatusDialog.getValue();
	if (statusMsg != "") {
		this._setCustom(statusMsg);
	}
	this._customStatusDialog.popdown();
};

ZmPresencePopup.prototype._addToMRU =
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
	if (mru.length > ZmPresencePopup.MRU_SIZE) {
		mru.pop();
	}
	settings.save([setting], null, batchCommand);
};


