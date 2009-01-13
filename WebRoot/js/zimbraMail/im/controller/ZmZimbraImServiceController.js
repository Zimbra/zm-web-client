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

ZmZimbraImServiceController = function(roster) {
	ZmImServiceController.call(this, roster);

	this.service = new ZmZimbraImService(roster);
};

ZmZimbraImServiceController.prototype = new ZmImServiceController;
ZmZimbraImServiceController.prototype.constructor = ZmZimbraImServiceController;


// Public methods

ZmZimbraImServiceController.prototype.toString =
function() {
	return "ZmZimbraImServiceController";
};

ZmZimbraImServiceController.prototype.login =
function(params) {
	if (!this._showedJive) {
		this._chatListChangeListenerObj = new AjxListener(this, this._chatListChangeListener);
		ZmImApp.INSTANCE.getRoster().getChatList().addChangeListener(this._chatListChangeListenerObj);
	}
	this.service.login(params);
};

ZmZimbraImServiceController.prototype.getMyPresenceTooltip =
function(showText) {
	this._presenceTooltipFormat = this._presenceTooltipFormat || new AjxMessageFormat(ZmMsg.presenceTooltip);
	return this._presenceTooltipFormat.format(showText);
};

ZmZimbraImServiceController.prototype.createPresenceMenu =
function(parent) {
	var statuses = [
		ZmOperation.IM_PRESENCE_OFFLINE,
		ZmOperation.IM_PRESENCE_ONLINE,
		ZmOperation.IM_PRESENCE_CHAT,
		ZmOperation.IM_PRESENCE_DND,
		ZmOperation.IM_PRESENCE_AWAY,
		ZmOperation.IM_PRESENCE_XA
	];
	return new ZmPresenceMenu(parent, statuses);
};

ZmZimbraImServiceController.prototype.getSupportsAccounts =
function() {
	return true;
};

ZmZimbraImServiceController.prototype.getSupportsConferences =
function() {
	return true;
};

ZmZimbraImServiceController.prototype._chatListChangeListener =
function(ev) {
	if (!this._showedJive && (ev.event == ZmEvent.E_CREATE)) {
		this._showedJive = true;
		ZmImApp.INSTANCE.getRoster().getChatList().removeChangeListener(this._chatListChangeListenerObj);
		delete this._chatListChangeListenerObj;
		var statusArgs = {
			msg: AjxTemplate.expand("im.Chat#JiveNotification"),
			transitions: [ { type: "fade-in", duration: 500 }, { type: "pause", duration: 5000 }, { type: "fade-out", duration: 500 } ]
		};
		appCtxt.setStatusMsg(statusArgs);
	}
};


