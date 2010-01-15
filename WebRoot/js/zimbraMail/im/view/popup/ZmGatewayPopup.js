/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Pops information and controls for im interop gateways.
 * @param params
 */
ZmGatewayPopup = function(params) {
	ZmTaskbarPopup.call(this, params);
	this._gateway = params.data;
	this._init();
};

// Constants for the different display states.
// For convenience the values are the ids of the corresponding ids of the elements.
ZmGatewayPopup.STATE_DISCONNECTED = "_disconnected";
ZmGatewayPopup.STATE_NOT_LOGGED_IN = "_notLoggedIn";
ZmGatewayPopup.STATE_LOGGED_IN = "_loggedIn";

ZmGatewayPopup.prototype = new ZmTaskbarPopup;
ZmGatewayPopup.prototype.constructor = ZmGatewayPopup;

ZmGatewayPopup.prototype.toString =
function() {
	return "ZmGatewayPopup";
};

ZmGatewayPopup.prototype.popup =
function(background) {
	// Call super.popup on a timer because for some reason it causes this popup to flicker
	// and then appear in the wrong place. No clue why.
	var self = this;
	setTimeout(function() { ZmTaskbarPopup.prototype.popup.call(self, background); }, 0);

	this._updateContent();
};

ZmGatewayPopup.prototype._init =
function() {
	this._createTabGroupMember();

	var contentEl = this._createPopupHtml(ZmMsg["imGateway_" + this._gateway.type]);
	var id = this._htmlElId;
	contentEl.innerHTML = AjxTemplate.expand("im.Chat#ZmGatewayItem", { id: id });

	this._tabGroup.addMember(Dwt.byId(id + "_nameField"));
	this._tabGroup.addMember(Dwt.byId(id + "_passwordField"));

	var button = new DwtButton({ parent: this, parentElement: id + "_loginButton" });
	button.setText(ZmMsg.login);
	button.addSelectionListener(new AjxListener(this, this._gatewayLoginListener));
	this._tabGroup.addMember(button);

	button = new DwtButton({ parent: this, parentElement: id + "_logoutButton" });
	button.setText(ZmMsg.imLogOut);
	var logoutListener = new AjxListener(this, this._gatewayLogoutListener);
	button.addSelectionListener(logoutListener);
	this._tabGroup.addMember(button);

	button = new DwtButton({ parent: this, parentElement: id + "_loginDifferent" });
	button.setText(ZmMsg.imLoginDifferent);
	button.addSelectionListener(new AjxListener(this, this._gatewayLoginDifferentListener));
	this._tabGroup.addMember(button);

	button = new DwtButton({ parent: this, parentElement: id + "_disconnectedLogoutButton" });
	button.setText(ZmMsg.logOff);
	button.addSelectionListener(logoutListener);
	this._tabGroup.addMember(button);

	button = new DwtButton({ parent: this, parentElement: id + "_reconnectButton" });
	button.setText(ZmMsg.imReconnectCaps);
	button.addSelectionListener(new AjxListener(this, this._gatewayReconnectListener));
	this._tabGroup.addMember(button);
};

ZmGatewayPopup.prototype._updateContent =
function() {
	var id = this._htmlElId;
	var focusMember;
	if (this._gateway.getState() == ZmImGateway.STATE.BOOTED_BY_OTHER_LOGIN) {
		this._state = ZmGatewayPopup.STATE_DISCONNECTED;
	} else if (!this._gateway.isOnline()) {
		this._state = ZmGatewayPopup.STATE_NOT_LOGGED_IN;
		Dwt.byId(id + "_nameField").value = "";
		Dwt.byId(id + "_passwordField").value = "";
		focusMember = Dwt.byId(id + "_nameField");
	} else {
		this._state = ZmGatewayPopup.STATE_LOGGED_IN;
		this._loggedInHeader = this._loggedInHeader || new AjxMessageFormat(ZmMsg.imGatewayLoggedInHeader);
		Dwt.byId(id + "_loggedInHeader").innerHTML = this._loggedInHeader.format([this._gateway.nick]);
	}
	var ids = ["_disconnected", "_notLoggedIn", "_loggedIn"];
	for (var i = 0, count = ids.length; i < count; i++) {
		Dwt.byId(this._htmlElId + ids[i]).style.display = ids[i] == this._state ? "block" : "none";
	}
	if (focusMember) {
		this._setFocusMember(focusMember);
	}
};

ZmGatewayPopup.prototype._gatewayLoginListener =
function() {
	var id = this._htmlElId;
	var name = Dwt.byId(id + "_nameField").value;
	var password = Dwt.byId(id + "_passwordField").value;
	ZmImApp.INSTANCE.getRoster().registerGateway(this._gateway.type, name, password);
	this._doPopdown();
};

ZmGatewayPopup.prototype._gatewayLogoutListener =
function() {
	ZmImApp.INSTANCE.getRoster().unregisterGateway(this._gateway.type);
	this._doPopdown();
};

ZmGatewayPopup.prototype._gatewayLoginDifferentListener =
function() {
	if (this._unregisterListener) {
		return;
	}
	ZmImApp.INSTANCE.getRoster().unregisterGateway(this._gateway.type);
	this._unregisterListener = new AjxListener(this, this._loginDifferentUnregisterListener);
	this._gateway.addListener(ZmImGateway.EVENT_SET_STATE, this._unregisterListener);
};

ZmGatewayPopup.prototype._loginDifferentUnregisterListener =
function() {
	this._gateway.removeListener(ZmImGateway.EVENT_SET_STATE, this._unregisterListener);
	delete this._unregisterListener;
	if (this.taskbarItem.expanded) {
		this._updateContent();
	}
};

ZmGatewayPopup.prototype._gatewayReconnectListener =
function() {
	ZmImApp.INSTANCE.getRoster().reconnectGateway(this._gateway);
	this._doPopdown();
};

ZmGatewayPopup.prototype._onEnter =
function() {
	if (this._state == ZmGatewayPopup.STATE_NOT_LOGGED_IN) {
		this._gatewayLoginListener();
	}
};

