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

function ZmVoiceListController(appCtxt, container, app) {
	if (arguments.length == 0) return;
	ZmListController.call(this, appCtxt, container, app);

	this._soundPlayer = null;
	this._folder = null;
	this._hasPlayedSound = false;

	this._autoPlayIndex = 0;
	this._autoPlaying = false;

	this._listeners[ZmOperation.CHECK_MAIL] = new AjxListener(this, this._refreshListener);
	this._listeners[ZmOperation.DELETE] = new AjxListener(this, this._deleteListener);
	this._listeners[ZmOperation.SAVE] = new AjxListener(this, this._saveListener);
	this._listeners[ZmOperation.FORWARD] = new AjxListener(this, this._forwardListener);
	this._listeners[ZmOperation.AUTO_PLAY] = new AjxListener(this, this._autoPlayListener);

	this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
	this._dragSrc.addDragListener(new AjxListener(this, this._dragListener));
}
ZmVoiceListController.prototype = new ZmListController;
ZmVoiceListController.prototype.constructor = ZmVoiceListController;

ZmVoiceListController.prototype.toString =
function() {
	return "ZmVoiceListController";
};

ZmVoiceListController.prototype._defaultView =
function() {
	return ZmController.VOICEMAIL_VIEW;
};

/**
* Displays the given search results.
*
* @param search		search results (which should contain a list of conversations)
* @param folder		The folder being shown
*/
ZmVoiceListController.prototype.show =
function(searchResult, folder) {
	this._folder = folder;
	ZmListController.prototype.show.call(this, searchResult);
	this._list = searchResult.getResults(folder.getSearchType());
	this._setup(this._currentView);

	var elements = new Object();
	elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[this._currentView];
	elements[ZmAppViewMgr.C_APP_CONTENT] = this._listView[this._currentView];
	this._setView(this._currentView, elements, true);
};

ZmVoiceListController.prototype._createNewView = 
function(view) {
	var result = new ZmVoiceListView(this._container, this._appCtxt, this._dropTgt);
	result.addSelectionListener(new AjxListener(this, this._selectListener));
	result.setDragSource(this._dragSrc);
	return result;
};

ZmVoiceListController.prototype._initialize =
function(view) {
	ZmListController.prototype._initialize.call(this, view);
};

ZmVoiceListController.prototype._setViewContents =
function(viewId) {
	if (this._hasPlayedSound) {
		this._soundPlayer.pause();
		this._soundPlayer.rewind();
		this._hasPlayedSound = false;
	}
	var view = this._listView[viewId];
	view.setPlaying(null);
	view.setCallType(this._folder.callType);
	view.set(this._list, ZmItem.F_DATE);
};

ZmVoiceListController.prototype._getToolBarOps =
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

ZmVoiceListController.prototype._getActionMenuOps =
function() {
	var list = [];
	list.push(ZmOperation.FORWARD);
	list.push(ZmOperation.SAVE);
	list.push(ZmOperation.DELETE);
	return list;
};

ZmVoiceListController.prototype._participantOps =
function() {
	return [ZmOperation.CONTACT];
};

ZmVoiceListController.prototype._getParticipantActionMenu =
function() {
	if (!this._participantActionMenu) {
		var menuItems = this._participantOps();
		menuItems.push(ZmOperation.SEP);
		var ops = this._getActionMenuOps();
		if (ops && ops.length) {
			menuItems = menuItems.concat(ops);
		}
    	this._participantActionMenu = new ZmActionMenu({parent:this._shell, menuItems:menuItems});
    	this._addMenuListeners(this._participantActionMenu);
	}
	return this._participantActionMenu;
};

ZmVoiceListController.prototype._initializeToolBar =
function(view) {
	ZmListController.prototype._initializeToolBar.call(this, view);
	if (!this._soundPlayer) {
		this._toolbar[view].addSpacer();
		this._toolbar[view].getButton(ZmOperation.CHECK_MAIL).setText(ZmMsg.checkVoicemail);
		var autoPlayButton = this._toolbar[view].getButton(ZmOperation.AUTO_PLAY);
		autoPlayButton.setAlign(DwtLabel.IMAGE_LEFT | DwtButton.TOGGLE_STYLE);
		
		this._soundPlayer = new ZmSoundPlayer(this._toolbar[view]);
		if (this._soundPlayer.isPluginMissing()) {
			this._soundPlayer.addHelpListener(new AjxListener(this, this._pluginHelpListener));
		} else {
			this._soundPlayer.addChangeListener(new AjxListener(this, this._soundChangeListener));
		}
	}
};

ZmVoiceListController.prototype._resetOperations = 
function(parent, num) {
	ZmListController.prototype._resetOperations.call(this, parent, num);
	parent.enable(ZmOperation.CHECK_MAIL, true);
	parent.enable(ZmOperation.AUTO_PLAY, this._folder && this._folder.numUnread && !this._soundPlayer.isPluginMissing());
};

ZmVoiceListController.prototype._refreshListener = 
function(ev) {
//	alert('Check voicemail here');
};

ZmVoiceListController.prototype._deleteListener = 
function(ev) {
	if (!this._handleResponseDeleteObj) {
		this._handleResponseDeleteObj = new AjxListener(this, this._handleResponseDelete);
	}
	var app = this._appCtxt.getApp(ZmApp.VOICEMAIL);
	app.deleteItems(this._getView().getSelection(), this._handleResponseDeleteObj);
};

ZmVoiceListController.prototype._handleResponseDelete = 
function(items) {
	var list = this._getView().getList();
	for (var i = 0, count = items.length; i < count; i++) {
		list.remove(items[i]);
	}
	this._getView().setUI();
};

ZmVoiceListController.prototype._saveListener = 
function(ev) {
//	alert('Save voicemail here');
};

ZmVoiceListController.prototype._forwardListener = 
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

ZmVoiceListController.prototype._autoPlayListener = 
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

ZmVoiceListController.prototype._autoPlayNext = 
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

ZmVoiceListController.prototype._stopAutoPlay = 
function() {
	this._autoPlaying = false;
	var autoPlayButton = this._getToolbar().getButton(ZmOperation.AUTO_PLAY);
	autoPlayButton.setToggled(false);
};

ZmVoiceListController.prototype._play = 
function(voicemail) {
	var url = [];
	var i = 0;
	var location = window.location;
	url[i++] = location.protocol;
	url[i++] = "//";
	url[i++] = location.hostname 
	if (location.port && location.port != "80") {
		url[i++] = ":";
		url[i++] = location.port;
	}
	url[i++] = voicemail.soundUrl;
	this._soundPlayer.setUrl(url.join(""));
	this._hasPlayedSound = true;
	this._getView().setPlaying(voicemail);
};

ZmVoiceListController.prototype._selectListener = 
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

ZmVoiceListController.prototype._getView = 
function() {
	return this._listView[this._currentView];
};

ZmVoiceListController.prototype._getToolbar = 
function() {
	return this._toolbar[this._currentView]
};

ZmVoiceListController.prototype._createNewContact =
function(ev) {
	var voicemail = ev.item;
	var contact = new ZmContact(this._appCtxt);
	contact.initFromPhone(voicemail.caller);
	return contact;
};

// Called when user clicks for help with plugins.
ZmVoiceListController.prototype._pluginHelpListener =
function(event) {
	var dialog = this._appCtxt.getMsgDialog();
	var message = AjxEnv.isIE ? ZmMsg.missingPluginHelpIE : ZmMsg.missingPluginHelp;
	dialog.setMessage(message, DwtMessageDialog.CRITICAL_STYLE);
	dialog.popup();
};

// Called while the sound is playing. The event has information about play status.
ZmVoiceListController.prototype._soundChangeListener =
function(event) {
	if (this._autoPlaying && event.finished) {
		this._autoPlayNext();
	}
};

ZmVoiceListController.prototype._listActionListener =
function(ev) {
	ZmListController.prototype._listActionListener.call(this, ev);

	var view = ev.dwtObj;
	var isParticipant = ev.field == ZmListView.FIELD_PREFIX[ZmItem.F_PARTICIPANT];
	var isVoicemail = this._folder.callType == ZmVoiceFolder.VOICEMAIL;
	var actionMenu;
	if (isParticipant) {
	 	actionMenu = this._getParticipantActionMenu();
		var newOp = ev.detail ? ZmOperation.EDIT_CONTACT : ZmOperation.NEW_CONTACT;
		var newText = ev.detail? null : ZmMsg.AB_ADD_CONTACT;
		ZmOperation.setOperation(this._participantActionMenu, ZmOperation.CONTACT, newOp, newText);
		if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
			var contacts = AjxDispatcher.run("GetContacts");
			this._actionEv.contact = contacts.getContactByPhone(ev.detail);
			this._setContactText(this._actionEv.contact != null);
		}
	} else  {
	 	actionMenu = this.getActionMenu();
	}
	
	actionMenu.getMenuItem(ZmOperation.SAVE).setVisible(isVoicemail);
	actionMenu.getMenuItem(ZmOperation.FORWARD).setVisible(isVoicemail);
	
	actionMenu.popup(0, ev.docX, ev.docY);
};

