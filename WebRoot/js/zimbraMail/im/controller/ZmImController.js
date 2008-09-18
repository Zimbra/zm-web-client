/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
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

// This has a bunch of listeners that might potentially be called from
// more than one place.

ZmImController = function() {
	this._imApp = appCtxt.getApp(ZmApp.IM);
	this._confirmDeleteRosterItemFormatter = new AjxMessageFormat(ZmMsg.imConfirmDeleteRosterItem);

	this._listeners = {};
	this._listeners[ZmOperation.NEW_ROSTER_ITEM] = new AjxListener(this, this._newRosterItemListener);
	this._listeners[ZmOperation.IM_NEW_CHAT] = new AjxListener(this, this._imNewChatListener);
	this._listeners[ZmOperation.IM_NEW_GROUP_CHAT] = new AjxListener(this, this._imNewGroupChatListener);
	this._listeners[ZmOperation.EDIT_PROPS] = new AjxListener(this, this._editRosterItemListener);
	this._listeners[ZmOperation.IM_CREATE_CONTACT] = new AjxListener(this, this._imCreateContactListener);
	this._listeners[ZmOperation.IM_ADD_TO_CONTACT] = new AjxListener(this, this._imAddToContactListener);
	this._listeners[ZmOperation.IM_EDIT_CONTACT] = new AjxListener(this, this._imEditContactListener);
	this._listeners[ZmOperation.IM_GATEWAY_LOGIN] = new AjxListener(this, this._imGatewayLoginListener);
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

ZmImController.prototype._imGatewayLoginListener = function(ev) {
	var dlg = appCtxt.getIMGatewayLoginDialog();
	if (!this._registerGatewayCb) {
		this._registerGatewayCb = new AjxCallback(this, this._registerGatewayCallback);
	}
	if (ev && ev.gwType)
		dlg.selectGwType(ev.gwType);
	ZmController.showDialog(dlg, this._registerGatewayCb);
};

ZmImController.prototype._registerGatewayCallback = function(service, screenName, password) {
	appCtxt.getIMGatewayLoginDialog().popdown();
	AjxDispatcher.run("GetRoster").registerGateway(service, screenName, password);
};

ZmImController.prototype._newRosterItemListener =
function(ev) {
	// Special handling for yahoo email addresses. Don't allow them unless signed in
	// to y! interop, and make sure the service is correctly initialized.
	if (ev && ev.address) {
		var match = /(.*)@yahoo\.com/.exec(ev.address);
		if (match) {
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
			ev.address = match[1];
			ev.service = "yahoo";
		}
	}

	var newDialog = appCtxt.getNewRosterItemDialog();
	newDialog.setTitle(ZmMsg.createNewRosterItem);
	if (!this._newRosterItemCb) {
		this._newRosterItemCb = new AjxCallback(this, this._newRosterItemCallback);
	}
	ZmController.showDialog(newDialog, this._newRosterItemCb);
	if (ev) {
		if (ev.group)
			newDialog.setGroups(ev.group);
		if (ev.name)
			newDialog.setName(ev.name);
		if (ev.address)
			newDialog.setAddress(ev.address);
		if (ev.service)
			newDialog.setService(ev.service);
	}
};

ZmImController.prototype._loginYesCallback =
function(dialog, ev) {
	dialog.popdown();
	this._imGatewayLoginListener({ gwType: "yahoo" });
};

ZmImController.prototype._loginNoCallback =
function(dialog, ev) {
	dialog.popdown();
};

ZmImController.prototype._editRosterItemListener =
function(ev) {
	var newDialog = appCtxt.getNewRosterItemDialog();
	newDialog.setTitle(ZmMsg.editRosterItem);
	if (!this._newRosterItemCb) {
		this._newRosterItemCb = new AjxCallback(this, this._newRosterItemCallback);
	}
	ZmController.showDialog(newDialog, this._newRosterItemCb);
	var ri = ev.buddy;
	newDialog.setAddress(ri.getAddress(), true);
	newDialog.setName(ri.getName());
	newDialog.setGroups(ri.getGroups());
};


ZmImController.prototype._imNewChatListener =
function(ev) {
	if (ev && ev.buddy) {
		var clc = AjxDispatcher.run("GetChatListController");
		clc.chatWithRosterItem(ev.buddy);
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
		var clc = AjxDispatcher.run("GetChatListController");
		clc.chatWithRosterItem(item);
	}
};

ZmImController.prototype._newChatOkCallback =
function(selectedContact, contactText) {
	var item = this._getRosterItemForChat(selectedContact, contactText);
	if (item) {
		var clc = AjxDispatcher.run("GetChatListController");
		clc.chatWithRosterItem(item);
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

ZmImController.prototype._imNewGroupChatListener =
function(ev) {
	// NOT IMPLEMENTED
// 	var org = this._getActionedOrganizer(ev);
// 	var clc = AjxDispatcher.run("GetChatListController");
// 	clc.chatWithRosterItems(org.getRosterItems(), org.getName()+" "+ZmMsg.imGroupChat);
};

// Create a roster item
ZmImController.prototype._newRosterItemCallback =
function(addr, rname, groups) {
	appCtxt.getNewRosterItemDialog().popdown();
	this._imApp.getRoster().createRosterItem(addr, rname, groups);
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

