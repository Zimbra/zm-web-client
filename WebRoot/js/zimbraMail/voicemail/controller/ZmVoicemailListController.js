/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
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

ZmVoicemailListController = function(container, app) {
	if (arguments.length == 0) { return; }
	ZmVoiceListController.call(this, container, app);

	this._listeners[ZmOperation.CHECK_VOICEMAIL] = new AjxListener(this, this._refreshListener);
	this._listeners[ZmOperation.DELETE] = new AjxListener(this, this._deleteListener);
	this._listeners[ZmOperation.DOWNLOAD_VOICEMAIL] = new AjxListener(this, this._downloadListener);
	this._listeners[ZmOperation.REPLY_BY_EMAIL] = new AjxListener(this, this._replyListener);
	this._listeners[ZmOperation.FORWARD_BY_EMAIL] = new AjxListener(this, this._forwardListener);
	this._listeners[ZmOperation.MARK_HEARD] = new AjxListener(this, this._markHeardListener);
	this._listeners[ZmOperation.MARK_UNHEARD] = new AjxListener(this, this._markUnheardListener);

	this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
	this._dragSrc.addDragListener(new AjxListener(this, this._dragListener));

	this._markingHeard = {}; // Prevents repeated markHeard requests during playback.
}
ZmVoicemailListController.prototype = new ZmVoiceListController;
ZmVoicemailListController.prototype.constructor = ZmVoicemailListController;

ZmVoicemailListController.prototype.toString =
function() {
	return "ZmVoicemailListController";
};

ZmVoicemailListController.prototype.show =
function(searchResult, folder) {
	if (this._folder && (folder != this._folder)) {
		this._getView().stopPlaying(true);
	}
	this._markingHeard = {};
	ZmVoiceListController.prototype.show.call(this, searchResult, folder)
};

ZmVoicemailListController.prototype._defaultView =
function() {
	return ZmId.VIEW_VOICEMAIL;
};

ZmVoicemailListController.prototype._getViewType = 
function() {
	return ZmId.VIEW_VOICEMAIL;
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
	list.push(ZmOperation.CHECK_VOICEMAIL);
	list.push(ZmOperation.SEP);
	list.push(ZmOperation.DELETE);
    list.push(ZmOperation.PRINT);
	list.push(ZmOperation.SEP);
	list.push(ZmOperation.REPLY_BY_EMAIL);
	list.push(ZmOperation.FORWARD_BY_EMAIL);
    list.push(ZmOperation.SEP);
    list.push(ZmOperation.DOWNLOAD_VOICEMAIL);
	list.push(ZmOperation.SEP);
	list.push(ZmOperation.CALL_MANAGER);
	list.push(ZmOperation.SEP);
	return list;
};

ZmVoicemailListController.prototype._getActionMenuOps =
function() {
	var list = []
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		list.push(ZmOperation.CONTACT);
	}
	list.push(ZmOperation.SEP);
	list.push(ZmOperation.MARK_HEARD);
	list.push(ZmOperation.MARK_UNHEARD);
	list.push(ZmOperation.SEP);
	list.push(ZmOperation.REPLY_BY_EMAIL);
	list.push(ZmOperation.FORWARD_BY_EMAIL);
	list.push(ZmOperation.SEP);
	list.push(ZmOperation.DOWNLOAD_VOICEMAIL);
	list.push(ZmOperation.DELETE);
	return list;
};

ZmVoicemailListController.prototype._initializeToolBar =
function(view) {
	ZmVoiceListController.prototype._initializeToolBar.call(this, view);
	this._toolbar[view].getButton(ZmOperation.PRINT).setToolTipContent(ZmMsg.printVoicemailTooltip)
};

ZmVoicemailListController.prototype._resetOperations = 
function(parent, num) {
	ZmVoiceListController.prototype._resetOperations.call(this, parent, num);

	var isTrash = this._folder && (this._folder.callType == ZmVoiceFolder.TRASH);
	if (isTrash) {
		parent.enableAll(false);
		if (parent instanceof DwtMenu) {
			ZmOperation.setOperation(parent, ZmOperation.DELETE, ZmOperation.DELETE, ZmMsg.moveToVoiceMail, "UnDelete");
			parent.enable(ZmOperation.DELETE, true);
		} else {
			parent.enable(ZmOperation.DELETE, false);
		}
	}

	parent.enable(ZmOperation.CHECK_VOICEMAIL, true);
	parent.enable(ZmOperation.CALL_MANAGER, true);

	if (!isTrash) {
		var list = this.getList();
		parent.enable(ZmOperation.PRINT, list && list.size());

		var hasHeard = false,
			hasUnheard = false;
		var items = this._listView[this._currentView].getSelection();
		for (var i = 0; i < items.length; i++) {
			(items[i].isUnheard) ? hasUnheard = true : hasHeard = true;
			if (hasUnheard && hasHeard) {
				break;
			}
		}
		parent.enable(ZmOperation.MARK_HEARD, hasUnheard);
		parent.enable(ZmOperation.MARK_UNHEARD, hasHeard);

		parent.enable(ZmOperation.DOWNLOAD_VOICEMAIL, (num == 1));

		if (!appCtxt.get(ZmSetting.MAIL_ENABLED)) {
			parent.enable(ZmOperation.REPLY_BY_EMAIL, false);
			parent.enable(ZmOperation.FORWARD_BY_EMAIL, false);
		}

		if (parent instanceof DwtMenu) {
			ZmOperation.setOperation(parent, ZmOperation.DELETE, ZmOperation.DELETE, ZmMsg.del, "Delete");
		}
	}
};

ZmVoicemailListController.prototype.getKeyMapName =
function() {
	return "ZmVoicemailListController";
};

ZmVoicemailListController.prototype.handleKeyAction =
function(actionCode) {
	var view = this._getView();
	var num = view.getSelectionCount();
	switch (actionCode) {
		case ZmKeyMap.DOWNLOAD:
			if (num == 1) {
				this._downloadListener();
			}
			break;
		case ZmKeyMap.REPLY:
			if ((num == 1) && appCtxt.get(ZmSetting.MAIL_ENABLED)) {
				this._replyListener();
			}
			break;
		case ZmKeyMap.FORWARD:
			if ((num == 1) && appCtxt.get(ZmSetting.MAIL_ENABLED)) {
				this._forwardListener();
			}
			break;
		case ZmKeyMap.DEL:
			if (num > 0 && !(this._folder && (this._folder.callType == ZmVoiceFolder.TRASH))) {
				this._deleteListener();
			}
			break;
		case ZmKeyMap.PLAY:
			if (num == 1) {
				view.setPlaying(view.getSelection()[0]);
			}
			break;
		case ZmKeyMap.CALL_MANAGER:
            this._callManagerListener();
			break;
		case ZmKeyMap.MARK_HEARD:
			this._markHeardListener();
			break;
		case ZmKeyMap.MARK_UNHEARD:
			this._markUnheardListener();
			break;
		default:
			return ZmVoiceListController.prototype.handleKeyAction.call(this, actionCode);
	}
	return true;
};


ZmVoicemailListController.prototype._markHeard = 
function(items, heard) {
	var changeItems = [];
	for (var i = 0, count = items.length; i < count; i++) {
		var item = items[i];
		if (!this._markingHeard[item.id] && (item.isUnheard == heard)) {
			changeItems.push(item);
			this._markingHeard[item.id] = true;
		}
	}
	if (changeItems.length) {
		var callback = new AjxCallback(this, this._handleResponseMarkHeard, [changeItems, heard]);
		var errorCallback = new AjxCallback(this, this._handleErrorMarkHeard, [changeItems]);
		var app = appCtxt.getApp(ZmApp.VOICE);
		app.markItemsHeard(changeItems, heard, callback, errorCallback);
	}
};

ZmVoicemailListController.prototype._handleResponseMarkHeard = 
function(items, heard) {
	var changeItems = [];
	var isUnheard = !heard;
	for (var i = 0, count = items.length; i < count; i++) {
		var item = items[i];
		if (item.isUnheard != isUnheard) {
			item.isUnheard = isUnheard;
			changeItems.push(item);
		}
		delete this._markingHeard[item.id];
	}
	var delta = heard ? -changeItems.length : changeItems.length;
	this._folder.changeNumUnheardBy(delta);
	this._getView().markUIAsRead(changeItems, heard);
	this._resetToolbarOperations();
};

ZmVoicemailListController.prototype._handleErrorMarkHeard =
function(items) {
	for (var i = 0, count = items.length; i < count; i++) {
		delete this._markingHeard[items[i].id];
	}
	return true;
};

ZmVoicemailListController.prototype._deleteListener =
function(ev) {
	var items = this._getView().getSelection();
	if (!items.length) {
		return;
	}
	var folderType = this._folder && (this._folder.callType == ZmVoiceFolder.TRASH) ? ZmVoiceFolder.VOICEMAIL_ID : ZmVoiceFolder.TRASH_ID;
	var phone = this._folder.phone;
	var folderId = folderType + "-" + phone.name;
	var destination = phone.folderTree.getById(folderId);
	var list = items[0].list;
	list.moveItems({items:items, folder:destination});
};

// This is being called directly by ZmVoiceList.
ZmVoicemailListController.prototype._handleResponseMoveItems = 
function(params) {
	var view = this._getView();
	for (var i = 0, count = params.items.length; i < count; i++) {
		view.removeItem(params.items[i]);
	}
	this._checkReplenish();
	this._resetToolbarOperations();
};

ZmVoicemailListController.prototype._downloadListener =
function() {
	// This scary looking piece of code does not change the page that the browser is
	// pointing at. Because the server will send back a "Content-Disposition:attachment"
	// header for this url, the browser opens a dialog to let the user save the file.
	ZmZimbraMail.unloadHackCallback();
	var voicemail = this._getView().getSelection()[0];
	document.location = this._getAttachmentUrl(voicemail);
};

ZmVoicemailListController.prototype._getAttachmentUrl = 
function(voicemail) {
	return voicemail.soundUrl + "&disp=a";
};

ZmVoicemailListController.prototype._replyListener = 
function(ev) {
	if (this._checkEmail()) {
		var voicemail = this._getView().getSelection()[0];
		var contact = voicemail.participants.get(0);
		this._sendMail(ev, ZmMsg.voicemailReplySubject, contact ? contact.getEmail() : null);
	}
};

ZmVoicemailListController.prototype._forwardListener = 
function(ev) {
	if (this._checkEmail()) {
		this._sendMail(ev, ZmMsg.voicemailForwardSubject);
	}
};

ZmVoicemailListController.prototype._sendMail = 
function(ev, subject, to) {
	var inNewWindow = this._app._inNewWindow(ev);
	var voicemail = this._getView().getSelection()[0];
    var soapDoc = AjxSoapDoc.create("UploadVoiceMailRequest", "urn:zimbraVoice");
	appCtxt.getApp(ZmApp.VOICE).setStorePrincipal(soapDoc);
	var node = soapDoc.set("vm");
    node.setAttribute("id", voicemail.id);
    node.setAttribute("phone", this._folder.phone.name);
    var params = {
    	soapDoc: soapDoc, 
    	asyncMode: true,
		callback: new AjxCallback(this, this._handleResponseUpload, [voicemail, inNewWindow, subject, to])
	};
	appCtxt.getAppController().sendRequest(params);
   
};

ZmVoicemailListController.prototype._handleResponseUpload = 
function(voicemail, inNewWindow, subject, to, response) {
	// Load the message in the compose view.
	var duration = AjxDateUtil.computeDuration(voicemail.duration);
    var date = AjxDateUtil.computeDateStr(new Date(), voicemail.date);
    var callingParty = voicemail.getCallingParty(ZmVoiceItem.FROM);
    var phoneNumber = callingParty.getDisplay();
    var format = appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT);
    var message = format == ZmSetting.COMPOSE_HTML ? ZmMsg.voicemailBodyHtml : ZmMsg.voicemailBodyText;
    var body = AjxMessageFormat.format(message, [phoneNumber, duration, date]);
	var uploadId = response._data.UploadVoiceMailResponse.upload[0].id;
	var params = {
		action: ZmOperation.NEW_MESSAGE, 
		inNewWindow: inNewWindow, 
		toOverride: to,
		subjOverride: subject,
        extraBodyText: body,
		callback: new AjxCallback(this, this._handleComposeLoaded, [uploadId])
	};
	AjxDispatcher.run("Compose", params);
};

ZmVoicemailListController.prototype._handleComposeLoaded = 
function(uploadId, composeController) {
	// Save the message as a draft to associate it with the upload id.
	composeController.sendMsg(uploadId, ZmComposeController.DRAFT_TYPE_MANUAL);
};

ZmVoicemailListController.prototype._checkEmail =
function() {
	var message;
	var voicemail = this._getView().getSelection()[0];
	if (voicemail.isPrivate) {
		message = ZmMsg.errorPrivateVoicemail;
	} else if (!appCtxt.get(ZmSetting.MAIL_ENABLED)) {
		//TODO: Check the contents of this message....		
		message = ZmMsg.sellEmail;
	}
	if (message) {
		var dialog = appCtxt.getMsgDialog();
		dialog.setMessage(message, DwtMessageDialog.CRITICAL_STYLE);
		dialog.popup();
		return false;
	} else {
		return true;
	}
};

ZmVoicemailListController.prototype._markHeardListener =
function(ev) {
	this._markHeard(this._getView().getSelection(), true);
};

ZmVoicemailListController.prototype._markUnheardListener = 
function(ev) {
	this._markHeard(this._getView().getSelection(), false);
};

ZmVoicemailListController.prototype._play = 
function(voicemail) {
	this._getView().setPlaying(voicemail);
};

ZmVoicemailListController.prototype._selectListener = 
function(ev) {
	if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		var selection = this._getView().getSelection();
		if (selection.length == 1) {
			var voicemail = selection[0];
			this._play(voicemail);
		}
	}
};

// Called when user clicks for help with plugins.
ZmVoicemailListController.prototype._pluginHelpListener =
function(event) {
	var dialog = appCtxt.getMsgDialog();
	var message = AjxEnv.isIE ? ZmMsg.missingPluginHelpIE : ZmMsg.missingPluginHelp;
	dialog.setMessage(message, DwtMessageDialog.CRITICAL_STYLE);
	dialog.popup();
};

ZmVoicemailListController.prototype._preHideCallback =
function(view, force) {
	this._getView().stopPlaying();
	return ZmVoiceListController.prototype._preHideCallback.call(this, view, force);
};

// Called while the sound is playing. The event has information about play status.
ZmVoicemailListController.prototype._soundChangeListener =
function(event) {
	if (event.finished || event.status == DwtSoundPlugin.PLAYABLE) {
		var playing = this._getView().getPlaying();
		if (playing) {
			this._markHeard([playing], true);
		}
	}
	if (event.status == DwtSoundPlugin.ERROR) {
		// Popup error
		// appCtxt.setStatusMsg(event.errorDetail, ZmStatusView.LEVEL_CRITICAL);
	}
};
