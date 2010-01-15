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
 * Pops up when the user has been invited to be soneone else's buddy.
 * @param params
 */
ZmSubscribePopup = function(params) {
	ZmTaskbarPopup.call(this, params);
	this._addr = params.data.addr;
	this._buddy = params.data.buddy;
	this._init();
};

ZmSubscribePopup.prototype = new ZmTaskbarPopup;
ZmSubscribePopup.prototype.constructor = ZmSubscribePopup;

ZmSubscribePopup.prototype.toString =
function() {
	return "ZmSubscribePopup";
};

ZmSubscribePopup.prototype._init =
function() {
	var contentEl = this._createPopupHtml(ZmMsg.buddyInvitation);
	var id = this._htmlElId;
	var templateArgs = {
		id : id,
		buddy: this._buddy ? this._buddy.getDisplayName() : this._addr,
		inList: !!this._buddy
	};
	contentEl.innerHTML = AjxTemplate.expand("im.Chat#SubscribeAuthDlg", templateArgs);

	this._createTabGroupMember();
	if (!this._buddy) {
		var acceptAdd = new DwtButton({parent:this});
		acceptAdd.setText(ZmMsg.imSubscribeAuthRequest_acceptAndAdd);
		acceptAdd.addSelectionListener(new AjxListener(this, this._subscribeRequestAcceptAddListener));
		acceptAdd.reparentHtmlElement(id + "_acceptAndAdd");
		this._tabGroup.addMember(acceptAdd);
	}

	var accept = new DwtButton({parent:this});
	accept.setText(ZmMsg.imSubscribeAuthRequest_accept);
	accept.addSelectionListener(new AjxListener(this, this._subscribeRequestAcceptListener));
	accept.reparentHtmlElement(id + "_accept");
	this._tabGroup.addMember(accept);

	var deny = new DwtButton({parent:this});
	deny.setText(ZmMsg.imSubscribeAuthRequest_deny);
	deny.addSelectionListener(new AjxListener(this, this._subscribeRequestDenyListener));
	deny.reparentHtmlElement(id + "_deny");
	this._tabGroup.addMember(deny);
};

ZmSubscribePopup.prototype._subscribeRequestAcceptAddListener =
function() {
	this._sendSubscribeAuthorization(true, true, this._addr);
};

ZmSubscribePopup.prototype._subscribeRequestAcceptListener =
function() {
	this._sendSubscribeAuthorization(true, false, this._addr);
};

ZmSubscribePopup.prototype._subscribeRequestDenyListener =
function() {
	this._sendSubscribeAuthorization(false, false, this._addr);
};

ZmSubscribePopup.prototype._sendSubscribeAuthorization =
function(accept, add, addr) {
	this._doDispose();
	AjxDispatcher.run("GetRoster").sendSubscribeAuthorization(accept, add, addr);
};

