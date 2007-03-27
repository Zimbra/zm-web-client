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

function ZmVoicemailListController(appCtxt, container, app) {
	if (arguments.length == 0) return;
	ZmVoiceListController.call(this, appCtxt, container, app);

	this._autoPlayIndex = 0;
	this._autoPlaying = false;

	this._listeners[ZmOperation.CHECK_MAIL] = new AjxListener(this, this._refreshListener);
	this._listeners[ZmOperation.DELETE] = new AjxListener(this, this._deleteListener);
	this._listeners[ZmOperation.SAVE] = new AjxListener(this, this._saveListener);
	this._listeners[ZmOperation.FORWARD] = new AjxListener(this, this._forwardListener);
	this._listeners[ZmOperation.AUTO_PLAY] = new AjxListener(this, this._autoPlayListener);
	this._listeners[ZmOperation.MARK_HEARD] = new AjxListener(this, this._markHeardListener);
	this._listeners[ZmOperation.MARK_UNHEARD] = new AjxListener(this, this._markUnreadListener);

	this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
	this._dragSrc.addDragListener(new AjxListener(this, this._dragListener));
}
ZmVoicemailListController.prototype = new ZmVoiceListController;
ZmVoicemailListController.prototype.constructor = ZmVoicemailListController;

ZmVoicemailListController.prototype.toString =
function() {
	return "ZmVoicemailListController";
};

ZmVoicemailListController.prototype._defaultView =
function() {
	return ZmController.VOICEMAIL_VIEW;
};

ZmVoicemailListController.prototype._createNewView = 
function(view) {
	var result = new ZmVoicemailListView(this._container, this, this._dropTgt);
	result.addSelectionListener(new AjxListener(this, this._selectListener));
	result.setDragSource(this._dragSrc);
	result.addSoundChangeListener(new AjxListener(this, this._soundChangeListener));
	return result;
};

ZmVoicemailListController.prototype._getToolBarOps =
function() {
	var list = [];
	list.push(ZmOperation.CHECK_MAIL);
	list.push(ZmOperation.SEP);
	list.push(ZmOperation.SAVE);
	list.push(ZmOperation.DELETE);
	list.push(ZmOperation.SEP);
	list.push(ZmOperation.FORWARD);
	list.push(ZmOperation.SEP);
	list.push(ZmOperation.AUTO_PLAY);
	list.push(ZmOperation.SEP);
	return list;
};

ZmVoicemailListController.prototype._getActionMenuOps =
function() {
	var list = this._flagOps();
	list.push(ZmOperation.FORWARD);
	list.push(ZmOperation.SAVE);
	list.push(ZmOperation.DELETE);
	return list;
};

ZmVoicemailListController.prototype._flagOps =
function() {
	return [ZmOperation.MARK_HEARD, ZmOperation.MARK_UNHEARD];
};

ZmVoicemailListController.prototype._initializeToolBar =
function(view) {
	ZmVoiceListController.prototype._initializeToolBar.call(this, view);
	this._toolbar[view].getButton(ZmOperation.CHECK_MAIL).setText(ZmMsg.checkVoicemail);
	var autoPlayButton = this._toolbar[view].getButton(ZmOperation.AUTO_PLAY);
	autoPlayButton.setAlign(DwtLabel.IMAGE_LEFT | DwtButton.TOGGLE_STYLE);
};

ZmVoicemailListController.prototype._resetOperations = 
function(parent, num) {
	ZmVoiceListController.prototype._resetOperations.call(this, parent, num);
	parent.enable(ZmOperation.CHECK_MAIL, true);
	parent.enable(ZmOperation.AUTO_PLAY, this._folder && this._folder.numUnread);
	
	var hasHeard = false;
	var hasUnheard = false;
	var items = this._listView[this._currentView].getSelection();
	for (var i = 0; i < items.length; i++) {
		(items[i].isUnheard) ? hasUnheard = true : hasHeard = true;
		if (hasUnheard && hasHeard)
			break;
	}
	parent.enable(ZmOperation.MARK_HEARD, hasUnheard);
	parent.enable(ZmOperation.MARK_UNHEARD, hasHeard);
};

ZmVoicemailListController.prototype._markHeard = 
function(items, heard) {
	var changeItems = [];
	for (var i = 0, count = items.length; i < count; i++) {
		if (items[i].isUnheard == heard) {
			changeItems.push(items[i]);
		}
	}
	if (changeItems.length) {
		var callback = new AjxCallback(this, this._handleResponseMarkHeard, [changeItems, heard]);
		var app = this._appCtxt.getApp(ZmApp.VOICE);
		app.markItemsHeard(changeItems, heard, callback);
	}
};

ZmVoicemailListController.prototype._handleResponseMarkHeard = 
function(items, heard) {
	for (var i = 0, count = items.length; i < count; i++) {
		items[i].isUnheard = !heard;
	}
	this._getView().markUIAsRead(items, heard);
	this._resetToolbarOperations();
};

ZmVoicemailListController.prototype._refreshListener = 
function(ev) {
	if (this._folder) {
		var app = this._appCtxt.getApp(ZmApp.VOICE);
		app.search(this._folder);
	}
};

ZmVoicemailListController.prototype._deleteListener = 
function(ev) {
	var items = this._getView().getSelection();
	if (!items.length) {
		return;
	}
//TODO: this undeletes stuff in trash. Should really be hard delete. When we have the ability to create new messages anyways.
	var folderId = this._folder.isInTrash() ? ZmVoiceFolder.VOICEMAIL_ID  : ZmVoiceFolder.TRASH_ID;
	folderId += "-" + this._folder.phone.name;
	var destination = this._appCtxt.getFolderTree().getById(folderId);
	var list = items[0].list;
	list.moveItems(items, destination);
};

ZmVoicemailListController.prototype._saveListener = 
function(ev) {
//	alert('Save voicemail here');
};

ZmVoicemailListController.prototype._forwardListener = 
function(ev) {
	var voicemail = this._getView().getSelection()[0];
	var duration = AjxDateUtil.computeDuration(voicemail.duration);
	var date = AjxDateUtil.computeDateStr(new Date(), voicemail.date);
	var callingParty = voicemail.getCallingParty(ZmVoiceItem.FROM);
	var phoneNumber = ZmPhone.calculateDisplay(callingParty);
	var body = AjxMessageFormat.format(ZmMsg.voicemailBody, [phoneNumber, duration, date]);
	var params = {
		action: ZmOperation.NEW_MESSAGE, 
		inNewWindow: this._app._inNewWindow(ev), 
		msg: new ZmMailMsg(this._appCtxt),
		subjOverride: ZmMsg.voicemailSubject,
		extraBodyText: body
	};
	AjxDispatcher.run("Compose", params);
};

ZmVoicemailListController.prototype._autoPlayListener = 
function(ev) {
	if (!this._autoPlaying) {
		var firstUnheard;
		var list = this._getView().getList();
		if (!list.size()) {
			return;
		}
		this._autoPlayIndex = -1;
		this._autoPlayNext();
		this._autoPlaying = true;
	} else {
		this._autoPlaying = false;
	}
};

ZmVoicemailListController.prototype._markHeardListener = 
function(ev) {
	this._markHeard(this._getView().getSelection(), true);
};

ZmVoicemailListController.prototype._markUnreadListener = 
function(ev) {
	this._markHeard(this._getView().getSelection(), false);
};

ZmVoicemailListController.prototype._autoPlayNext = 
function() {
	var next = null;
	var list = this._getView().getList();
	for (var i = this._autoPlayIndex + 1, count = list.size(); i < count; i++) {
		var voicemail = list.get(i);
		if (voicemail.isUnheard) {
			next = voicemail;
			this._autoPlayIndex = i;
			break;
		}
	}
	
	if (next) {
		this._play(next);
	} else {
		this._stopAutoPlay();
	}
};

ZmVoicemailListController.prototype._stopAutoPlay = 
function() {
	this._autoPlaying = false;
	var autoPlayButton = this._getToolbar().getButton(ZmOperation.AUTO_PLAY);
	autoPlayButton.setToggled(false);
};

ZmVoicemailListController.prototype._play = 
function(voicemail) {
	this._getView().setPlaying(voicemail);
};

ZmVoicemailListController.prototype._selectListener = 
function(ev) {
	if (ev.detail == DwtListView.ITEM_DBL_CLICKED ||
		ev.detail == ZmVoiceListView.PLAY_BUTTON_PRESSED) {
		var selection = this._getView().getSelection();
		if (selection.length == 1) {
			if (this._autoPlaying) {
				this._stopAutoPlay();
			}
			var voicemail = selection[0];
			this._play(voicemail);
		}
	}
};

// Called when user clicks for help with plugins.
ZmVoicemailListController.prototype._pluginHelpListener =
function(event) {
	var dialog = this._appCtxt.getMsgDialog();
	var message = AjxEnv.isIE ? ZmMsg.missingPluginHelpIE : ZmMsg.missingPluginHelp;
	dialog.setMessage(message, DwtMessageDialog.CRITICAL_STYLE);
	dialog.popup();
};

// Called while the sound is playing. The event has information about play status.
ZmVoicemailListController.prototype._soundChangeListener =
function(event) {
	if (this._autoPlaying && event.finished) {
		this._autoPlayNext();
	}
	if (event.finished || event.status == DwtSoundPlugin.PLAYABLE) {
		var playing = this._getView().getPlaying();
		if (playing) {
			this._markHeard([playing], true);
		}
	}
};

