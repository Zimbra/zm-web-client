/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is: Zimbra Collaboration Suite Web Client
 *
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

function ZmVoicemailController(appCtxt, container, app) {
	if (arguments.length == 0) return;
	ZmListController.call(this, appCtxt, container, app);

	this._soundPlayer = null;
	this._folder = null;
	this._hasPlayedSound = false;

	this._listeners[ZmOperation.CHECK_MAIL] = new AjxListener(this, this._refreshListener);
	this._listeners[ZmOperation.DELETE] = new AjxListener(this, this._deleteListener);
	this._listeners[ZmOperation.MOVE] = new AjxListener(this, this._moveListener);
	this._listeners[ZmOperation.FORWARD] = new AjxListener(this, this._forwardListener);
}
ZmVoicemailController.prototype = new ZmListController;
ZmVoicemailController.prototype.constructor = ZmVoicemailController;

ZmVoicemailController.prototype.toString =
function() {
	return "ZmVoicemailController";
};

ZmVoicemailController.prototype._defaultView =
function() {
	return ZmController.VOICEMAIL_VIEW;
};

/**
* Displays the given search results.
*
* @param search		search results (which should contain a list of conversations)
* @param callType	The type of call. See constants in ZmVoicemailFolder
*/
ZmVoicemailController.prototype.show =
function(searchResult, callType) {
	this._callType = callType;
	ZmListController.prototype.show.call(this, searchResult);
	this._list = searchResult.getResults(ZmItem.VOICEMAIL);
	this._setup(this._currentView);

	var elements = new Object();
	elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[this._currentView];
	elements[ZmAppViewMgr.C_APP_CONTENT] = this._listView[this._currentView];
	this._setView(this._currentView, elements, true);

	this._showSoundPlayer();
};

ZmVoicemailController.prototype._showSoundPlayer =
function() {
	if (this._soundPlayer) {
		var visible = this._callType == ZmVoicemailFolder.VOICEMAIL;
		if (visible) {
			this._soundPlayer.setLocation(0, 0);
		} else {
			this._soundPlayer.setLocation(Dwt.LOC_NOWHERE, Dwt.LOC_NOWHERE);
		}
	}
};

ZmVoicemailController.prototype._createNewView = 
function(view) {
	var result = new ZmVoicemailView(this._container, this._appCtxt, this._dropTgt);
	result.addSelectionListener(new AjxListener(this, this._selectListener));
	return result;
};

ZmVoicemailController.prototype._initialize =
function(view) {
	ZmListController.prototype._initialize.call(this, view);
};

ZmVoicemailController.prototype._setViewContents =
function(viewId) {
	if (this._hasPlayedSound) {
		this._soundPlayer.pause();
		this._soundPlayer.rewind();
		this._hasPlayedSound = false;
	}
	var view = this._listView[viewId];
	view.setPlaying(null);
	view.setCallType(this._callType);
	view.set(this._list, ZmItem.F_DATE);
};

ZmVoicemailController.prototype._getToolBarOps =
function() {
	var list = [];
	list.push(ZmOperation.CHECK_MAIL);
	list.push(ZmOperation.SEP);
	list.push(ZmOperation.DELETE);
	list.push(ZmOperation.MOVE);
	list.push(ZmOperation.SEP);
	list.push(ZmOperation.FORWARD);
	return list;
};

ZmVoicemailController.prototype._getActionMenuOps =
function() {
	var list = [];
	list.push(ZmOperation.DELETE);
	list.push(ZmOperation.MOVE);
	list.push(ZmOperation.SEP);
	list.push(ZmOperation.FORWARD);
	return list;
};

ZmVoicemailController.prototype._initializeToolBar =
function(view) {
	ZmListController.prototype._initializeToolBar.call(this, view);
	if (!this._soundPlayer) {
		this._toolbar[view].getButton(ZmOperation.CHECK_MAIL).setText(ZmMsg.checkVoicemail);
		this._soundPlayer = DwtSoundPlayer.create(this._toolbar[view], 200, 16, true, null, DwtControl.RELATIVE_STYLE);
		this._soundPlayer.setLocation(Dwt.LOC_NOWHERE, Dwt.LOC_NOWHERE);
		if (this._soundPlayer.isPluginMissing) {
			this._soundPlayer.addHelpListener(new AjxListener(this, this._pluginHelpListener));
		}
	}
};

ZmVoicemailController.prototype._resetOperations = 
function(parent, num) {
	ZmListController.prototype._resetOperations.call(this, parent, num);
	parent.enable(ZmOperation.CHECK_MAIL, true);
};

ZmVoicemailController.prototype._refreshListener = 
function(ev) {
//	alert('Check voicemail here');
};

ZmVoicemailController.prototype._deleteListener = 
function(ev) {
//	alert('Delete voicemail here');
};

ZmVoicemailController.prototype._moveListener = 
function(ev) {
//	alert('Move voicemail here');
};

ZmVoicemailController.prototype._forwardListener = 
function(ev) {
	var voicemail = this._getView().getSelection()[0];
	var duration = AjxDateUtil.computeDuration(voicemail.duration);
	var date = AjxDateUtil.computeDateStr(new Date(), voicemail.date);
	var body = AjxMessageFormat.format(ZmMsg.voicemailBody, [voicemail.caller, duration, date]);
	var params = {
		action: ZmOperation.NEW_MESSAGE, 
		inNewWindow: this._app._inNewWindow(ev), 
		msg: new ZmMailMsg(this._appCtxt),
		subjOverride: ZmMsg.voicemailSubject,
		extraBodyText: body
	};
	AjxDispatcher.run("Compose", params);
};

ZmVoicemailController.prototype._selectListener = 
function(ev) {
	if (ev.detail == DwtListView.ITEM_DBL_CLICKED ||
		ev.detail == ZmVoicemailView.PLAY_BUTTON_PRESSED) {
		var selection = ev.dwtObj.getSelection();
		var url = null;
		if (selection.length == 1) {
			var voicemail = selection[0];
			url = voicemail.soundUrl;
			this._soundPlayer.setUrl(url);
			this._soundPlayer.play();
			this._hasPlayedSound = true;
			var view = this._getView();
			view.setPlaying(voicemail);
		}
	}
};

ZmVoicemailController.prototype._getView = 
function() {
	return this._listView[this._currentView];
};

// Called when user clicks for help with plugins.
ZmVoicemailController.prototype._pluginHelpListener =
function(event) {
	var dialog = this._appCtxt.getMsgDialog();
	dialog.setMessage(ZmMsg.missingPluginHelp, DwtMessageDialog.CRITICAL_STYLE);
	dialog.popup();
};
