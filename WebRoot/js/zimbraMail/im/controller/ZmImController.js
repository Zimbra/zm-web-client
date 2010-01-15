/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010 Zimbra, Inc.
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

// This has a bunch of listeners that might potentially be called from
// more than one place.

ZmImController = function() {
	this._imApp = appCtxt.getApp(ZmApp.IM);
	this._confirmDeleteRosterItemFormatter = new AjxMessageFormat(ZmMsg.imConfirmDeleteRosterItem);

	this._listeners = {};
	this._listeners[ZmOperation.NEW_ROSTER_ITEM] = new AjxListener(this, this._newRosterItemListener);
	this._listeners[ZmOperation.IM_NEW_CHAT] = new AjxListener(this, this._imNewChatListener);
	this._listeners[ZmOperation.EDIT_PROPS] = new AjxListener(this, this._editRosterItemListener);
	this._listeners[ZmOperation.IM_CREATE_CONTACT] = new AjxListener(this, this._imCreateContactListener);
	this._listeners[ZmOperation.IM_ADD_TO_CONTACT] = new AjxListener(this, this._imAddToContactListener);
	this._listeners[ZmOperation.IM_EDIT_CONTACT] = new AjxListener(this, this._imEditContactListener);
	this._listeners[ZmOperation.DELETE] = new AjxListener(this, this._deleteListener);
	this._listeners[ZmOperation.IM_BLOCK_BUDDY] = new AjxListener(this, this._blockBuddyListener);
	this._listeners[ZmOperation.IM_UNBLOCK_BUDDY] = new AjxListener(this, this._unblockBuddyListener);
	this._listeners[ZmOperation.IM_DELETE_GROUP] = new AjxListener(this, this._deleteGroupListener);
	this._listeners[ZmOperation.IM_BUDDY_ARCHIVE] = new AjxListener(this, this._buddyArchiveListener);
};

ZmImController.prototype.toString = function() {
	return "ZmImController";
};

ZmImController.prototype._deleteListener =
function(ev) {
	var ds = this._deleteShield = appCtxt.getYesNoCancelMsgDialog();
	ds.reset();
	ds.registerCallback(DwtDialog.YES_BUTTON, this._deleteShieldYesCallback, this, ev.buddy);
	ds.registerCallback(DwtDialog.NO_BUTTON, this._clearDialog, this, this._deleteShield);
	var msg = this._confirmDeleteRosterItemFormatter.format([ ev.buddy.getAddress() ]);
	ds.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
	ds.popup();
};

ZmImController.prototype._deleteShieldYesCallback =
function(buddy) {
	buddy._delete();
	this._clearDialog(this._deleteShield);
};

ZmImController.prototype._clearDialog = function(dlg) {
	dlg.popdown();
};

ZmImController.prototype._newRosterItemListener =
function(ev) {
	if (ZmImApp.loggedIn()) {
		this._newRosterItem(ev);
	} else {
		ZmImApp.INSTANCE.login({ callback: new AjxCallback(this, this._newRosterItem, [ev]) });
	}
};

ZmImController.prototype._newRosterItem =
function(ev) {
	// Special handling for yahoo email addresses. Don't allow them unless signed in
	// to y! interop, and make sure the service is correctly initialized.
	if (ev && ev.address) {
		var match = /(.*)@yahoo\.com/.exec(ev.address);
		if (match) {
			ev.address = match[1];
			ev.service = "yahoo";
		}
		if (ev.service == "yahoo") {
			var gateway = ZmImApp.INSTANCE.getRoster().getGatewayByType("yahoo");
			if (!gateway) {
				var msgDialog = appCtxt.getMsgDialog();
				msgDialog.setMessage(ZmMsg.imErrorYahooBuddy, DwtMessageDialog.CRITICAL_STYLE);
				msgDialog.popup();
				return;
			} else if (!gateway.isOnline()) {
				var yesNoDialog = appCtxt.getYesNoMsgDialog();
				yesNoDialog.reset();
				yesNoDialog.registerCallback(DwtDialog.YES_BUTTON, this._loginYesCallback, this, [yesNoDialog]);
				yesNoDialog.registerCallback(DwtDialog.NO_BUTTON, this._loginNoCallback, this, [yesNoDialog]);
				yesNoDialog.setMessage(ZmMsg.imErrorYahooBuddyLogin, DwtMessageDialog.WARNING_STYLE);
				yesNoDialog.popup();
				return;
			}
		}
	}

	var popup = ZmTaskbarController.INSTANCE.showNewBuddyPopup();
	if (ev) {
		if (ev.group) {
			popup.setGroups(ev.group);
		}
		if (ev.name) {
			popup.setName(ev.name);
		}
		if (ev.address) {
			popup.setAddress(ev.address);
		}
		if (ev.service) {
			popup.setService(ev.service);
		}
	}
};

ZmImController.prototype._loginYesCallback =
function(dialog, ev) {
	dialog.popdown();
	ZmTaskbarController.INSTANCE.showGatewayPopup("yahoo");
};

ZmImController.prototype._loginNoCallback =
function(dialog, ev) {
	dialog.popdown();
};

ZmImController.prototype._editRosterItemListener =
function(ev) {
	var popup = ZmTaskbarController.INSTANCE.showNewBuddyPopup();
	popup.setTitle(ZmMsg.editRosterItem);
	var ri = ev.buddy;
	popup.setAddress(ri.getAddress(), true);
	popup.setName(ri.getName());
	popup.setGroups(ri.getGroups());
};


ZmImController.prototype._imNewChatListener =
function(ev) {
	if (ZmImApp.loggedIn()) {
		this._newChat(ev);
	} else {
		ZmImApp.INSTANCE.login({ callback: new AjxCallback(this, this._newChat, [ev]) });
	}
};

ZmImController.prototype._newChat =
function(ev) {
	if (ev && ev.buddy) {
		ZmTaskbarController.INSTANCE.chatWithRosterItem(ev.buddy);
	} else {
		// select from GAL
		ZmImNewChatDlg.show(
			{ onAutocomplete: AjxCallback.simpleClosure(this._newChatAutoCompleteCallback, this),
			  onOk: AjxCallback.simpleClosure(this._newChatOkCallback, this)
			}
		);
	}
};

ZmImController.prototype._newChatAutoCompleteCallback =
function(contact, dlg, text, el, match) {
	var item = this._getRosterItemForChat(contact, match.fullAddress);
	if (item) {
		dlg.popdown();
		ZmTaskbarController.INSTANCE.chatWithRosterItem(item);
	}
};

ZmImController.prototype._newChatOkCallback =
function(selectedContact, contactText) {
	var item = this._getRosterItemForChat(selectedContact, contactText);
	if (item) {
		ZmTaskbarController.INSTANCE.chatWithRosterItem(item);
		return true;
	}
};

ZmImController.prototype._getRosterItemForChat =
function(contact, fullAddress){
	var addr;
	if (contact) {
		addr = contact.getIMAddress();
		addr = ZmImAddress.parse(addr);
	}
	var roster = AjxDispatcher.run("GetRoster");
	if (addr) {
		addr = roster.makeServerAddress(addr.screenName, addr.service);
	}
	if (!addr && contact) {
		addr = contact.getEmail();
	}
	if (!addr && fullAddress) {
		addr = fullAddress;
	}
	if (!addr) {
		return null;
	}
	var list = roster.getRosterItemList();
	var item = list.getByAddr(addr);
	if (!item) {
		// create a temporary item
		var name = contact ? contact.getAttendeeText(null, true) : addr,
			presence = new ZmRosterPresence(ZmRosterPresence.SHOW_UNKNOWN, null, ZmMsg.unknown);
		item = new ZmRosterItem(addr, list, name, presence);
	}
	return item;
};

ZmImController.prototype._imCreateContactListener = function(ev) {
	var item = ev.buddy;
	var contact = new ZmContact(null);
        var roster = AjxDispatcher.run("GetRoster");
	contact.setAttr(ZmContact.F_imAddress1, roster.makeGenericAddress(item.getAddress()));
	AjxDispatcher.run("GetContactController").show(contact, true);
};

ZmImController.prototype._imAddToContactListener = function(ev) {
	var item = ev.buddy;
	ZmImNewChatDlg.show(
		{
			onAutocomplete: AjxCallback.simpleClosure(function(contact, dlg) {
				if (!contact) {
					return;
				}
				dlg.popdown();
				var fields = [ ZmContact.F_imAddress1, ZmContact.F_imAddress2, ZmContact.F_imAddress3 ];
                                var roster = AjxDispatcher.run("GetRoster");
				for (var i = 0; i < fields.length; ++i) {
					var f = fields[i];
					var orig = contact.getAttr(f);
					if (!orig || !/\S/.test(orig)) {
						contact.setAttr(f, roster.makeGenericAddress(item.getAddress()));
						AjxDispatcher.run("GetContactController").show(contact, true);
						// reset the attribute now so that
						// ZmContactView thinks it's been
						// modified.  sort of makes sense. ;-)
						contact.setAttr(f, orig);
						break;
					}
				}
				if (i == fields.length) {
					// not set as all IM fields are filed
					// XXX: warn?
				}
			}, this )
		}
	);
};

ZmImController.prototype._imEditContactListener = function(ev) {
	var item = ev.buddy;
	AjxDispatcher.run("GetContactController").show(item.getContact(), false);
};

ZmImController.prototype._blockBuddyListener = function(ev) {
	var item = ev.buddy;
	var roster = AjxDispatcher.run("GetRoster");
	var pl = roster.getPrivacyList();
	pl.block(item.getAddress());
	var doc = AjxSoapDoc.create("IMSetPrivacyListRequest", "urn:zimbraIM");
	pl.toSoap(doc);
	appCtxt.getAppController().sendRequest({ soapDoc: doc, asyncMode: true });
};

ZmImController.prototype._unblockBuddyListener = function(ev) {
	var item = ev.buddy;
	var roster = AjxDispatcher.run("GetRoster");
	var pl = roster.getPrivacyList();
	pl.unblock(item.getAddress());
	var doc = AjxSoapDoc.create("IMSetPrivacyListRequest", "urn:zimbraIM");
	pl.toSoap(doc);
	appCtxt.getAppController().sendRequest({ soapDoc: doc, asyncMode: true });
};

ZmImController.prototype._deleteGroupListener = function(ev) {
	var treeItem = ev.actionedItem;
	if (treeItem.getItemCount()) {
		var dialog = appCtxt.getMsgDialog();
		dialog.setMessage(ZmMsg.deleteGroupError, DwtMessageDialog.CRITICAL_STYLE);
		dialog.popup();
	} else {
		treeItem.dispose();
	}
};

ZmImController.prototype._buddyArchiveListener = function(ev) {
	var item = ev.buddy;
	var args = {
		query: "in:chats from:" + item.id,
		types: [appCtxt.getApp(ZmApp.MAIL).getGroupMailBy()],
		getHtml: appCtxt.get(ZmSetting.VIEW_AS_HTML),
		searchFor: ZmId.SEARCH_MAIL
	};
	appCtxt.getSearchController().search(args);
};

ZmImController.prototype._createConferenceListener =
function(ev) {
	AjxDispatcher.require([ "IMConference" ]);
	var params = {
		title: ZmMsg.imNewConferenceRoomTitle,
		callback: new AjxCallback(this, this._newConferenceOkCallback)
	};
	ZmNewConferenceRoomDialog.getInstance().popup(params);
};

ZmImController.prototype._newConferenceOkCallback =
function(data) {
	ZmImApp.INSTANCE.getRoster().getConferenceServices(new AjxCallback(this, this._handleResponseGetServices, [data]));
};

ZmImController.prototype._handleResponseGetServices =
function(data, services) {
	services[0].createRoom(data.name, new AjxCallback(this, this._handleResponseCreateRoom, [data]));
};

ZmImController.prototype._handleResponseCreateRoom =
function(data, room) {
	if (room.status == ZmConferenceRoom.STATUS.NEW) {
		room.configure(data.config, new AjxCallback(this, this._handleResponseConfigureRoom, [data]));
	} else {
//TODO
//		this._alert("Room already created: " + room.id);
	}
};

ZmImController.prototype._handleResponseConfigureRoom =
function(data, room) {
	data.dialog.popdown();
};

ZmImController.prototype._browseConferencesListener =
function(ev) {
	var callback = new AjxCallback(this, this._getConferenceServicesCallback);
	AjxDispatcher.run("GetRoster").getConferenceServices(callback);
};

ZmImController.prototype._getConferenceServicesCallback =
function(conferenceServices) {
	ZmConferenceDialog.getInstance().popup();
};
