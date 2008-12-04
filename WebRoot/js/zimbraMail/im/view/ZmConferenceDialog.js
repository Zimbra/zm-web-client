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

ZmConferenceDialog = function(params) {
	ZmDialog.call(this, params);
	this._overviewId = this._htmlElId + "_overview";
	this._setNameField(this._messageFieldId);
	var overviewArgs = {
		treeIds: [ZmOrganizer.CONFERENCE_ITEM],
		fieldId: this._overviewId
	};
	var overview = this._setOverview(overviewArgs);
	var treeView = overview.getTreeView(ZmOrganizer.CONFERENCE_ITEM);
	treeView.addSelectionListener(new AjxListener(this, this._treeViewListener));
};

ZmConferenceDialog.prototype = new ZmDialog;
ZmConferenceDialog.prototype.constructor = ZmConferenceDialog;

ZmConferenceDialog.prototype.toString =
function() {
	return "ZmConferenceDialog";
};

ZmConferenceDialog.getInstance =
function() {
	ZmConferenceDialog.INSTANCE = ZmConferenceDialog.INSTANCE || new ZmConferenceDialog({ parent: appCtxt.getShell() });
	return ZmConferenceDialog.INSTANCE;
};

ZmConferenceDialog.prototype.popup =
function () {
	ZmDialog.prototype.popup.call(this);

	ZmImApp.INSTANCE.getRoster().getConferenceServices(new AjxCallback());
//	Dwt.byId(this._messageFieldId).focus();
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
	ZmDialog.prototype._buttonListener.call(this, ev);
};

ZmConferenceDialog.prototype._treeViewListener =
function(ev) {
	if (ev.detail == DwtTree.ITEM_DBL_CLICKED) {
		var treeItem = ev.item;
		var organizer = treeItem.getData(Dwt.KEY_OBJECT);
		if (organizer instanceof ZmConferenceRoom) {
			organizer.join(null, new AjxCallback(this, this._handleResponseJoin));
		}
	}
};

ZmConferenceDialog.prototype._handleResponseJoin =
function() {
	this.popdown();
};

