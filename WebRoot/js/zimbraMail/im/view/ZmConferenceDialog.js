/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009 Zimbra, Inc.
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

ZmConferenceDialog = function(params) {
	ZmDialog.call(this, params);
	this._overviewId = this._htmlElId + "_overview";
	this._setNameField(this._messageFieldId);
	var overviewArgs = {
		treeIds: [ZmOrganizer.CONFERENCE_ITEM],
		fieldId: this._overviewId
	};
	var overview = this._setOverview(overviewArgs);
	this._treeView = overview.getTreeView(ZmOrganizer.CONFERENCE_ITEM);
	this._treeView.addSelectionListener(new AjxListener(this, this._treeViewListener));
};

ZmConferenceDialog.prototype = new ZmDialog;
ZmConferenceDialog.prototype.constructor = ZmConferenceDialog;

ZmConferenceDialog.prototype.toString =
function() {
	return "ZmConferenceDialog";
};

ZmConferenceDialog.getInstance =
function() {
	ZmConferenceDialog.INSTANCE = ZmConferenceDialog.INSTANCE || new ZmConferenceDialog({ parent: appCtxt.getShell(), title: ZmMsg.imConferenceRooms });
	return ZmConferenceDialog.INSTANCE;
};

ZmConferenceDialog.prototype.popup =
function () {
	ZmDialog.prototype.popup.call(this);

	ZmImApp.INSTANCE.getRoster().getConferenceServices(new AjxCallback(this, this._handleResponseGetServices));
//	Dwt.byId(this._messageFieldId).focus();
};

ZmConferenceDialog.prototype._handleResponseGetServices =
function(services) {
	services[0].getRooms(null, true); // Force children to reload.
};

ZmConferenceDialog.prototype.getValue =
function() {
	return Dwt.byId(this._messageFieldId).value;
};

ZmConferenceDialog.prototype._contentHtml =
function() {
	this._messageFieldId = Dwt.getNextId();
	return AjxTemplate.expand("im.Chat#ZmConferenceDialog", { id: this._htmlElId });
};

ZmConferenceDialog.prototype._enterListener =
function() {
	this._runEnterCallback();                                                                      
};

ZmConferenceDialog.prototype._okButtonListener =
function(ev) {
	var selection = this._treeView.getSelection();
	if (selection.length) {
		this._join(selection[0]);
	}
};

ZmConferenceDialog.prototype._treeViewListener =
function(ev) {
	if (ev.detail == DwtTree.ITEM_DBL_CLICKED) {
		this._join(ev.item);
	}
};

ZmConferenceDialog.prototype._join =
function(treeItem) {
	var organizer = treeItem.getData(Dwt.KEY_OBJECT);
	if (organizer instanceof ZmConferenceRoom) {
		organizer.join(null, new AjxCallback(this, this._handleResponseJoin));
	}
};

ZmConferenceDialog.prototype._handleResponseJoin =
function(room, jsonObj) {
	this.popdown();
	if (jsonObj.error) {
		if (jsonObj.error == "PasswordRequired") {
			var passwordParams = {
				title: ZmMsg.imRoomPasswordRequired,
				label: ZmMsg.passwordLabel,
				callback: new AjxCallback(this, this._handlePasswordOk, [room])
			};
			var dialog = ZmPromptDialog.getPasswordInstance();
			dialog.popup(passwordParams);
		} else {
			this._reportJoinError(jsonObj.error);
		}
	}
};

ZmConferenceDialog.prototype._handlePasswordOk =
function(room, data) {
	room.join(data.value, new AjxCallback(this, this._handleResponseJoinRetry, [data.dialog]));
};

ZmConferenceDialog.prototype._handleResponseJoinRetry =
function(dialog, room, jsonObj) {
	if (!jsonObj.error) {
		dialog.popdown();
	} else if (jsonObj.error == "PasswordRequired") {
		appCtxt.setStatusMsg(ZmMsg.imRoomPasswordFailed, ZmStatusView.LEVEL_CRITICAL);
	} else {
		dialog.popdown();
		this._reportJoinError(jsonObj.error);
	}
};

ZmConferenceDialog.prototype._reportJoinError =
function(error) {
	var message = ZMsg["im." + error] || ZMsg["im.unknown_error"];
	var dialog = appCtxt.getMsgDialog();
	dialog.reset();
	dialog.setMessage(message, DwtMessageDialog.CRITICAL_STYLE, ZmMsg.zimbraTitle);
	dialog.popup();
};
