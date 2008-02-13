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
// more than one place.  Should merge this class with
// ZmChatListController and rename to ZmImController or something.

ZmRosterTreeController = function() {
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
        this._listeners[ZmOperation.IM_FLOATING_LIST] = new AjxListener(this, this._imFloatingListListener);
};

ZmRosterTreeController.prototype.toString = function() {
	return "ZmRosterTreeController";
};

ZmRosterTreeController.prototype._deleteListener =
function(ev) {
	var ds = this._deleteShield = appCtxt.getYesNoCancelMsgDialog();
	ds.reset();
	ds.registerCallback(DwtDialog.YES_BUTTON, this._deleteShieldYesCallback, this, ev.buddy);
	ds.registerCallback(DwtDialog.NO_BUTTON, this._clearDialog, this, this._deleteShield);
	var msg = this._confirmDeleteRosterItemFormatter.format([ ev.buddy.getAddress() ]);
	ds.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
	ds.popup();
};

ZmRosterTreeController.prototype._deleteShieldYesCallback =
function(buddy) {
	buddy._delete();
	this._clearDialog(this._deleteShield);
};

ZmRosterTreeController.prototype._clearDialog = function(dlg) {
	dlg.popdown();
};

ZmRosterTreeController.prototype._imGatewayLoginListener = function(ev) {
	var dlg = appCtxt.getIMGatewayLoginDialog();
	if (!this._registerGatewayCb) {
		this._registerGatewayCb = new AjxCallback(this, this._registerGatewayCallback);
	}
	if (ev && ev.gwType)
		dlg.selectGwType(ev.gwType);
	ZmController.showDialog(dlg, this._registerGatewayCb);
};

ZmRosterTreeController.prototype._registerGatewayCallback = function(service, screenName, password) {
	appCtxt.getIMGatewayLoginDialog().popdown();
	AjxDispatcher.run("GetRoster").registerGateway(service, screenName, password);
};

ZmRosterTreeController.prototype._newRosterItemListener =
function(ev) {
	var newDialog = appCtxt.getNewRosterItemDialog();
	newDialog.setTitle(ZmMsg.createNewRosterItem);
	if (!this._newRosterItemCb) {
		this._newRosterItemCb = new AjxCallback(this, this._newRosterItemCallback);
	}
	ZmController.showDialog(newDialog, this._newRosterItemCb);
	if (ev.group)
		newDialog.setGroups(ev.group);
	if (ev.name)
		newDialog.setName(ev.name);
	if (ev.address)
		newDialog.setAddress(ev.address);
};

ZmRosterTreeController.prototype._editRosterItemListener =
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


ZmRosterTreeController.prototype._imNewChatListener =
function(ev) {
	var clc = AjxDispatcher.run("GetChatListController");
	if (ev && ev.buddy) {
		clc.chatWithRosterItem(ev.buddy);
	} else {
		// select from GAL
		ZmImNewChatDlg.show(
			{ onAutocomplete: AjxCallback.simpleClosure(function(contact, dlg){
				if (!contact) {
					return;
				}
				dlg.popdown();
				var addr = contact.getIMAddress();
                                addr = ZmImAddress.parse(addr);
                                var roster = AjxDispatcher.run("GetRoster");
                                if (addr)
                                        addr = roster.makeServerAddress(addr.screenName, addr.service);
// XXX: we can't look for a suitable address since the server doesn't return the default domain.  ugh.
// 				if (!addr) {
// 					var fields = [ ZmContact.F_email,
// 						       ZmContact.F_email1,
// 						       ZmContact.F_email2 ];
// 					for (var i = 0; i < fields.length; ++i) {
// 						addr = contact.getAttr(fields[i]);
// 						var gwAddr = roster.breakDownAddress(addr);
// 					}
// 				}
				if (!addr)
					addr = contact.getEmail();
				var list = roster.getRosterItemList();
				var item = list.getByAddr(addr);
				if (!item)
					// create a temporary item
					item = new ZmRosterItem(addr, list, contact.getAttendeeText(),
								new ZmRosterPresence(ZmRosterPresence.SHOW_UNKNOWN,
										     null,
										     ZmMsg.unknown));
				clc.chatWithRosterItem(item);
			}, this)
			}
		);
	}
};

ZmRosterTreeController.prototype._imNewGroupChatListener =
function(ev) {
	// NOT IMPLEMENTED
// 	var org = this._getActionedOrganizer(ev);
// 	var clc = AjxDispatcher.run("GetChatListController");
// 	clc.chatWithRosterItems(org.getRosterItems(), org.getName()+" "+ZmMsg.imGroupChat);
};

// Create a roster item
ZmRosterTreeController.prototype._newRosterItemCallback =
function(addr, rname, groups) {
	appCtxt.getNewRosterItemDialog().popdown();
	this._imApp.getRoster().createRosterItem(addr, rname, groups);
};

ZmRosterTreeController.prototype._imCreateContactListener = function(ev) {
	var item = ev.buddy;
	var contact = new ZmContact(null);
        var roster = AjxDispatcher.run("GetRoster");
	contact.setAttr(ZmContact.F_imAddress1, roster.makeGenericAddress(item.getAddress()));
	AjxDispatcher.run("GetContactController").show(contact, true);
};

ZmRosterTreeController.prototype._imAddToContactListener = function(ev) {
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

ZmRosterTreeController.prototype._imEditContactListener = function(ev) {
	var item = ev.buddy;
	AjxDispatcher.run("GetContactController").show(item.getContact(), false);
};

ZmRosterTreeController.prototype._blockBuddyListener = function(ev) {
        var item = ev.buddy;
        var roster = AjxDispatcher.run("GetRoster");
        var pl = roster.getPrivacyList();
        pl.block(item.getAddress());
        var doc = AjxSoapDoc.create("IMSetPrivacyListRequest", "urn:zimbraIM");
        pl.toSoap(doc);
        appCtxt.getAppController().sendRequest({ soapDoc: doc, asyncMode: true });
};

ZmRosterTreeController.prototype._unblockBuddyListener = function(ev) {
        var item = ev.buddy;
        var roster = AjxDispatcher.run("GetRoster");
        var pl = roster.getPrivacyList();
        pl.unblock(item.getAddress());
        var doc = AjxSoapDoc.create("IMSetPrivacyListRequest", "urn:zimbraIM");
        pl.toSoap(doc);
        appCtxt.getAppController().sendRequest({ soapDoc: doc, asyncMode: true });
};

ZmRosterTreeController.prototype._imFloatingListListener = function(ev) {
        var wm = ZmChatMultiWindowView.getInstance().getShellWindowManager();
        var win = this.__floatingBuddyListWin;
        if (!win) {
                // FIXME: should we have this as a specialized
                // DwtResizableWindow? (i.e. new widget?)  I guess not for now.
                this.__floatingBuddyListWin = win = new DwtResizableWindow(wm);
                var cont = new DwtComposite(win);

                var toolbar = new DwtToolBar({parent:cont});

                var lab = new DwtLabel({parent:toolbar, style:DwtLabel.IMAGE_LEFT | DwtLabel.ALIGN_LEFT,
                						  className:"ZmChatWindowLabel"});
                lab.setImage("ImGroup");
	        lab.setText(ZmMsg.buddyList);

                toolbar.addFiller();

	        var close = new DwtToolBarButton({parent:toolbar});
	        close.setImage("Close");
	        close.addSelectionListener(new AjxListener(this, function() {
                        win.popdown();
                }));

                win.enableMoveWithElement(toolbar);

                var list = new ZmImOverview(cont, { posStyle   : Dwt.STATIC_STYLE,
                                                    isFloating : true });

                var toolbar2 = new DwtToolBar({parent:cont});

                var newBuddy = new DwtToolBarButton({parent:toolbar2});
                newBuddy.setImage("ImBuddy");
                newBuddy.setToolTipContent(ZmMsg.newRosterItem);
                newBuddy.addSelectionListener(this._imApp.getRosterTreeController()._listeners[ZmOperation.NEW_ROSTER_ITEM]);

                toolbar2.addFiller();

                var presence = new DwtToolBarButton({parent:toolbar2});
                presence.setText(ZmMsg.imStatusOnline);
                presence.setToolTipContent(ZmMsg.imPresence);
                presence.setImage("ImAvailable");
                var menu = ZmImApp.addImPresenceMenu(presence);
                AjxDispatcher.run("GetChatListController").updatePresenceMenu(true, presence);
                this._imApp.getRoster().addChangeListener(new AjxListener(this, function(ev) {
                        var fields = ev.getDetail("fields");
                        if (ev.event == ZmEvent.E_MODIFY) {
                                if (ZmRoster.F_PRESENCE in fields) {
                                        AjxDispatcher.run("GetChatListController").updatePresenceMenu(false, presence);
                                }
                        }
                }));

                cont.addControlListener(new AjxListener(this, function(ev) {
                        var s1 = { x: ev.oldWidth, y: ev.oldHeight };
                        var s2 = { x: ev.newWidth, y: ev.newHeight };
                        if (s1.x != s2.x || s1.y != s2.y) {
                                var h = s2.y - toolbar.getSize().y - toolbar2.getSize().y;
                                list.setSize(s2.x, h);
                        }
                }));

                win.setView(cont);
                win.setSize(200, 600);
                var wm_size = wm.getSize();
                var win_size = win.getSize();
                wm.manageWindow(win, { x: wm_size.x - win_size.x - 50,
                                       y: (wm_size.y - win_size.y) / 2
                                     });
        } else {
                win.popup();
        }
};
