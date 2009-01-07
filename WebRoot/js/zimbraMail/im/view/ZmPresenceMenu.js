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

ZmPresenceMenu = function(params, statuses) {
	ZmPopupMenu.call(this, params);
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
	this._updatePresenceMenu();
};

ZmPresenceMenu.prototype = new ZmPopupMenu;
ZmPresenceMenu.prototype.constructor = ZmPresenceMenu;

// Public methods

ZmPresenceMenu.prototype.toString =
function() {
	return "ZmPresenceMenu";
};

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


ZmPresenceMenu.prototype.addSelectionListener =
function(listener) {
	this.addListener(DwtEvent.SELECTION, listener);
};

// Protected methods

ZmPresenceMenu.prototype._handleSelection =
function() {
	this.notifyListeners(DwtEvent.SELECTION);
};

ZmPresenceMenu.prototype._presenceItemListener =
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

ZmPresenceMenu.prototype._doSetPresence =
function(show) {
	ZmImApp.INSTANCE.getRoster().setPresence(show, 0, null);
};

ZmPresenceMenu.prototype._presenceMRUListener =
function(ev) {
	this._handleSelection();
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
};

ZmPresenceMenu.prototype._presenceCustomItemListener =
function() {
	this._handleSelection();
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

