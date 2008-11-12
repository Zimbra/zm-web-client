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

ZmImApp = function(container) {

	ZmApp.call(this, ZmApp.IM, container);

	// IM is enabled, so show Chats folder
	delete ZmFolder.HIDE_ID[ZmOrganizer.ID_CHATS];
	this._active = false;
	ZmImApp.INSTANCE = this;

	// TODO: This require sux....
	AjxDispatcher.require([ "IMCore" ]);

	// Create the service controller & service.
	new ZmZimbraImServiceController();

	this._roster = new ZmRoster(this);
};

// Organizer and item-related constants
ZmEvent.S_CHAT        			= ZmId.ITEM_CHAT;
ZmEvent.S_ROSTER				= "ROSTER";
ZmEvent.S_ROSTER_ITEM			= ZmId.ITEM_ROSTER;
ZmEvent.S_ROSTER_TREE_ITEM		= ZmId.ORG_ROSTER_TREE_ITEM;
ZmEvent.S_ROSTER_TREE_GROUP		= ZmId.ORG_ROSTER_TREE_GROUP;
ZmItem.CHAT						= ZmEvent.S_CHAT;
ZmItem.ROSTER_ITEM				= ZmEvent.S_ROSTER_ITEM;
ZmOrganizer.ROSTER_TREE_ITEM	= ZmEvent.S_ROSTER_TREE_ITEM;
ZmOrganizer.ROSTER_TREE_GROUP	= ZmEvent.S_ROSTER_TREE_GROUP;

ZmItem.F_PRESENCE = "PRESENCE";
ZmItem.F_PRESENCE_CELL = "PRESENCE_cell";

// App-related constants
ZmApp.IM					= ZmId.APP_IM;
ZmApp.CLASS[ZmApp.IM]		= "ZmImApp";
ZmApp.SETTING[ZmApp.IM]		= ZmSetting.IM_ENABLED;
ZmApp.LOAD_SORT[ZmApp.IM]	= 47;
ZmApp.QS_ARG[ZmApp.IM]		= "chat";

ZmImApp.BUDDY_SORT_PRESENCE = "presence";
ZmImApp.BUDDY_SORT_NAME 	= "name";

ZmImApp.prototype = new ZmApp;
ZmImApp.prototype.constructor = ZmImApp;

ZmImApp.loggedIn = function() {
	return ZmImApp.INSTANCE &&
		   ZmImService.INSTANCE.isLoggedIn() &&
		   ( appCtxt.get(ZmSetting.IM_PREF_AUTO_LOGIN) || ZmImApp.INSTANCE._roster );
};

ZmImApp.prototype.toString =
function() {
	return "ZmImApp";
};

// Construction

ZmImApp.prototype._defineAPI =
function() {
	AjxDispatcher.registerMethod("GetRoster",
                                     "IMCore",
                                     new AjxCallback(this, this.getRoster));

	AjxDispatcher.registerMethod("GetChatListController",
                                     [ "IMCore", "IM" ],
                                     new AjxCallback(this, this.getChatListController));
};

ZmImApp.prototype._registerOperations =
function() {
    ZmOperation.registerOp(ZmId.OP_IM_NEW_CHAT, { textKey: "imNewChat", image: "ImFree2Chat", shortcut:ZmKeyMap.NEW_CHAT });
    ZmOperation.registerOp(ZmId.OP_IM_NEW_GROUP_CHAT, { textKey: "imNewGroupChat", image: "ImFree2Chat" });
    ZmOperation.registerOp(ZmId.OP_IM_PRESENCE_AWAY, { textKey: "imStatusAway", image: "ImAway" });
    ZmOperation.registerOp(ZmId.OP_IM_PRESENCE_CHAT, { textKey: "imStatusChat", image: "ImFree2Chat" });
    ZmOperation.registerOp(ZmId.OP_IM_PRESENCE_DND, { textKey: "imStatusDND", image: "ImDnd" });
    ZmOperation.registerOp(ZmId.OP_IM_PRESENCE_INVISIBLE, { textKey: "imStatusInvisible", image: "ImInvisible" });
    ZmOperation.registerOp(ZmId.OP_IM_PRESENCE_MENU, { textKey: "imPresence" }, null, ZmImApp.addImPresenceMenu);
    ZmOperation.registerOp(ZmId.OP_IM_PRESENCE_OFFLINE, { textKey: "imStatusOffline", image: "Offline" });
    ZmOperation.registerOp(ZmId.OP_IM_PRESENCE_ONLINE, { textKey: "imStatusOnline", image: "ImAvailable" });
    ZmOperation.registerOp(ZmId.OP_IM_PRESENCE_XA, { textKey: "imStatusExtAway", image: "ImExtendedAway" });
    ZmOperation.registerOp(ZmId.OP_IM_LOGOUT_YAHOO, { textKey: "imLogoutYahoo", image: "Logoff" });
    ZmOperation.registerOp(ZmId.OP_IM_PRESENCE_CUSTOM_MRU, { image: "ImAvailable" });
    ZmOperation.registerOp(ZmId.OP_IM_PRESENCE_MENU, { }); // Keyboard only.
    ZmOperation.registerOp(ZmId.OP_NEW_ROSTER_GROUP, { textKey: "imNewGroup", image: "ImGroup" });
    ZmOperation.registerOp(ZmId.OP_NEW_ROSTER_ITEM, { textKey: "newRosterItem", image: "AddBuddy" });
    ZmOperation.registerOp(ZmId.OP_IM_CREATE_CONTACT, { textKey: "addToNewContact", image: "NewContact" });
    ZmOperation.registerOp(ZmId.OP_IM_ADD_TO_CONTACT, { textKey: "addToExistingContact", image: "Edit" });
    ZmOperation.registerOp(ZmId.OP_IM_EDIT_CONTACT, { textKey: "editContact", image: "Edit" });
    ZmOperation.registerOp(ZmId.OP_IM_GATEWAY_LOGIN, { textKey: "imGatewayLogin", image: "ExternalLink" });
    ZmOperation.registerOp(ZmId.OP_IM_TOGGLE_OFFLINE, { textKey: "imToggleOffline" });
    ZmOperation.registerOp(ZmId.OP_IM_TOGGLE_BLOCKED, { textKey: "imToggleBlocked" });
    ZmOperation.registerOp(ZmId.OP_IM_SORT_BY_PRESENCE, { textKey: "imSortListByPresence" });
    ZmOperation.registerOp(ZmId.OP_IM_SORT_BY_NAME, { textKey: "imSortListByName" });
    ZmOperation.registerOp(ZmId.OP_IM_PRESENCE_CUSTOM_MSG, { textKey: "imCustomStatusMsg", image: "ImAvailable"});
    ZmOperation.registerOp(ZmId.OP_IM_BLOCK_BUDDY, { textKey: "imBlock", image: "BlockUser" });
    ZmOperation.registerOp(ZmId.OP_IM_UNBLOCK_BUDDY, { textKey: "imUnblock", image: "AllowUser" });
	ZmOperation.registerOp(ZmId.OP_IM_HTML, { image: "HtmlDoc", tooltipKey: "changeEditorMode" });
	ZmOperation.registerOp(ZmId.OP_IM_DELETE_GROUP, { image: "Delete", textKey: "del" });
	ZmOperation.registerOp(ZmId.OP_IM_CLOSE_ALL_TABS, { textKey: "imCloseAllTabs" });
	ZmOperation.registerOp(ZmId.OP_IM_CLOSE_OTHER_TABS, { textKey: "imCloseOtherTabs" });
	ZmOperation.registerOp(ZmId.OP_IM_CLOSE_TAB, { textKey: "imCloseTab" });
	ZmOperation.registerOp(ZmId.OP_IM_BUDDY_ARCHIVE, { textKey: "imBuddyArchive", image: "ChatFolder" });
};

ZmImApp.prototype._registerItems =
function() {
	ZmItem.registerItem(ZmItem.CHAT,
			    { app	 : ZmApp.IM,
			      nameKey	 : "chat",
			      icon	 : "ImStartChat",
			      soapCmd	 : "ItemAction",
			      itemClass	 : "ZmChat",
			      node	 : "chat",
			      organizer	 : ZmOrganizer.ROSTER,
			      searchType : "chat"
			    });
};

ZmImApp.prototype._registerApp =
function() {
	var newItemOps = {};
	newItemOps[ZmOperation.IM_NEW_CHAT]		= "chat";

	var newOrgOps = {};
	newOrgOps[ZmOperation.NEW_ROSTER_ITEM] = "buddy";

	var actionCodes = {};
	actionCodes[ZmKeyMap.NEW_CHAT] = ZmOperation.IM_NEW_CHAT;
	actionCodes[ZmKeyMap.NEW_ROSTER_ITEM] = ZmOperation.NEW_ROSTER_ITEM;
	actionCodes[ZmKeyMap.PRESENCE_MENU] = ZmOperation.IM_PRESENCE_MENU;

	ZmApp.registerApp(ZmApp.IM,
			  { mainPkg	      : "IM",
			    defaultSort	      : 50,
			    newOrgOps		  : newOrgOps,
			    newItemOps        : newItemOps,
				actionCodes		  : actionCodes
			  });
};

ZmImApp.prototype._registerSettings = function(settings) {
	settings = settings || appCtxt.getSettings();

    settings.registerSetting("IM_PREF_NOTIFY_SOUNDS",{
            name        :   "zimbraPrefIMSoundsEnabled", 
            type        :   ZmSetting.T_PREF,
            dataType    :   ZmSetting.D_BOOLEAN,
            defaultValue:   true
    });

	settings.registerSetting("IM_PREF_FLASH_ICON",
			{	name         : "zimbraPrefIMFlashIcon",
				type         : ZmSetting.T_PREF,
				dataType     : ZmSetting.D_BOOLEAN,
				defaultValue : true
			});

	settings.registerSetting("IM_PREF_FLASH_BROWSER",
			{	name         : "zimbraPrefIMFlashTitle",
				type         : ZmSetting.T_PREF,
				dataType     : ZmSetting.D_BOOLEAN,
				defaultValue : true
			});

    settings.registerSetting("IM_PREF_INSTANT_NOTIFY",
				 { name         : "zimbraPrefIMInstantNotify",
				   type         : ZmSetting.T_PREF,
				   dataType     : ZmSetting.D_BOOLEAN,
				   defaultValue : true });

        settings.registerSetting("IM_PREF_AUTO_LOGIN",
				 { name         : "zimbraPrefIMAutoLogin",
                                   type         : ZmSetting.T_PREF,
                                   dataType     : ZmSetting.D_BOOLEAN,
				   defaultValue : false
				 });

        settings.registerSetting("IM_PREF_NOTIFY_PRESENCE",
				 { name         : "zimbraPrefIMNotifyPresence",
                                   type         : ZmSetting.T_PREF,
                                   dataType     : ZmSetting.D_BOOLEAN,
				   defaultValue : true
				 });

        settings.registerSetting("IM_PREF_NOTIFY_STATUS",
				 { name         : "zimbraPrefIMNotifyStatus",
                                   type         : ZmSetting.T_PREF,
                                   dataType     : ZmSetting.D_BOOLEAN,
				   defaultValue : true
				 });

	settings.registerSetting("IM_PREF_LOGCHATS_ENABLED",
			         { name		: "zimbraPrefIMLogChats",
				   type		: ZmSetting.T_PREF,
				   dataType	: ZmSetting.D_BOOLEAN,
				   defaultValue	: true
			         });

        settings.registerSetting("IM_PREF_REPORT_IDLE",
                                 { name         : "zimbraPrefIMReportIdle",
                                   type         : ZmSetting.T_PREF,
                                   dataType     : ZmSetting.D_BOOLEAN,
                                   defaultValue : true
                                 });

        settings.registerSetting("IM_PREF_IDLE_TIMEOUT",
                                 { name         : "zimbraPrefIMIdleTimeout",
                                   type         : ZmSetting.T_PREF,
                                   dataType     : ZmSetting.D_INT,
                                   defaultValue : 10
                                 });

        settings.registerSetting("IM_PREF_IDLE_STATUS",
                                 { name         : "zimbraPrefIMIdleStatus",
                                   type         : ZmSetting.T_PREF,
                                   dataType     : ZmSetting.D_STRING,
                                   defaultValue : "xa"
                                 });
	settings.registerSetting("IM_CUSTOM_STATUS_MRU",
								 { name			: "zimbraPrefIMCustomStatusMessage",
								   type			: ZmSetting.T_PREF,
								   dataType		: ZmSetting.D_LIST
								 });

	settings.registerSetting("IM_PREF_BUDDY_SORT",
								 { name			: "zimbraPrefIMBuddyListSort",
								   type			: ZmSetting.T_PREF,
								   dataType		: ZmSetting.D_STRING,
								   defaultValue : ZmImApp.BUDDY_SORT_NAME,
								   isImplicit	: true
								 });

	settings.registerSetting("IM_PREF_HIDE_OFFLINE",
								 { name			: "zimbraPrefIMHideOfflineBuddies",
								   type			: ZmSetting.T_PREF,
								   dataType		: ZmSetting.D_BOOLEAN,
								   defaultValue : false,
								   isImplicit	: true
								 });

	settings.registerSetting("IM_PREF_HIDE_BLOCKED",
								 { name			: "zimbraPrefIMHideBlockedBuddies",
								   type			: ZmSetting.T_PREF,
								   dataType		: ZmSetting.D_BOOLEAN,
								   defaultValue : false,
								   isImplicit	: true
								 });
	settings.registerSetting("IM_YAHOO_ID",
							 { name         : "zimbraPrefIMYahooId",
							   type         : ZmSetting.T_PREF,
							   dataType     : ZmSetting.D_STRING,
							   defaultValue : ""
							 });


	var listener = new AjxListener(this, this._onSettingChange);
	settings.getSetting(ZmSetting.IM_PREF_INSTANT_NOTIFY).addChangeListener(listener);
	settings.getSetting(ZmSetting.IM_PREF_REPORT_IDLE).addChangeListener(listener);
	settings.getSetting(ZmSetting.IM_PREF_IDLE_TIMEOUT).addChangeListener(listener);
};

ZmImApp.prototype._registerPrefs = function() {
	var sections = {
		IM: {
			title: ZmMsg.im,
			templateId: "prefs.Pages#IM",
			manageDirty: true,
			createView: function(parent, section, controller) {
				return new ZmImPrefsPage(parent, section, controller);
			},
			priority: 90,
			precondition: ZmSetting.IM_ENABLED,
			prefs: [
				ZmSetting.IM_PREF_INSTANT_NOTIFY,
				ZmSetting.IM_PREF_AUTO_LOGIN,
				ZmSetting.IM_PREF_FLASH_ICON,
				ZmSetting.IM_PREF_FLASH_BROWSER,
				ZmSetting.IM_PREF_NOTIFY_PRESENCE,
				ZmSetting.IM_PREF_NOTIFY_STATUS,
				ZmSetting.IM_PREF_LOGCHATS_ENABLED,

                ZmSetting.IM_PREF_REPORT_IDLE,
                ZmSetting.IM_PREF_IDLE_TIMEOUT,
                ZmSetting.IM_PREF_IDLE_STATUS,
                ZmSetting.IM_PREF_NOTIFY_SOUNDS    
            ]
		}
	};
	for (var id in sections) {
		ZmPref.registerPrefSection(id, sections[id]);
	}

    ZmPref.registerPref("IM_PREF_NOTIFY_SOUNDS",{
            displayName     :   ZmMsg.playSound,
            displayContainer:   ZmPref.TYPE_CHECKBOX
    });

    ZmPref.registerPref("IM_PREF_INSTANT_NOTIFY",
			    { displayName      : ZmMsg.imPrefInstantNotify,
			      displayContainer : ZmPref.TYPE_CHECKBOX,
			      precondition     : ZmSetting.INSTANT_NOTIFY });

	ZmPref.registerPref("IM_PREF_AUTO_LOGIN",
			    { displayName      : ZmMsg.imPrefAutoLogin,
			      displayContainer : ZmPref.TYPE_CHECKBOX });

	ZmPref.registerPref("IM_PREF_FLASH_ICON",
			    { displayName      : ZmMsg.imPrefFlashIcon,
			      displayContainer : ZmPref.TYPE_CHECKBOX });

	ZmPref.registerPref("IM_PREF_FLASH_BROWSER",
			    { displayName      : ZmMsg.flashBrowser,
			      displayContainer : ZmPref.TYPE_CHECKBOX });

	ZmPref.registerPref("IM_PREF_NOTIFY_PRESENCE",
			    { displayName      : ZmMsg.imPrefNotifyPresence,
			      displayContainer : ZmPref.TYPE_CHECKBOX });

	ZmPref.registerPref("IM_PREF_NOTIFY_STATUS",
			    { displayName      : ZmMsg.imPrefNotifyStatus,
			      displayContainer : ZmPref.TYPE_CHECKBOX });

	ZmPref.registerPref("IM_PREF_LOGCHATS_ENABLED",
                            { displayName      : ZmMsg.imPrefLogChats,
			      displayContainer : ZmPref.TYPE_CHECKBOX });

        ZmPref.registerPref("IM_PREF_REPORT_IDLE",
                            { displayName      : ZmMsg.imPrefReportIdle,
                              displayContainer : ZmPref.TYPE_CHECKBOX });

        ZmPref.registerPref("IM_PREF_IDLE_TIMEOUT",
                            { displayName      : ZmMsg.imPrefIdleTimeout,
                              displayContainer : ZmPref.TYPE_SELECT,
                              displayOptions   : [ ZmMsg.imPrefIdleTimeoutMinutes,
                                                   ZmMsg.imPrefIdleTimeoutMinutes,
                                                   ZmMsg.imPrefIdleTimeoutMinutes,
                                                   ZmMsg.imPrefIdleTimeoutMinutes,
                                                   ZmMsg.imPrefIdleTimeoutMinutes,
                                                   ZmMsg.imPrefIdleTimeoutMinutes
                                                 ],
                              options          : [ 1, 5, 10, 20, 30, 60 ],
                              precondition     : ZmSetting.IM_PREF_REPORT_IDLE });

        ZmPref.registerPref("IM_PREF_IDLE_STATUS",
                            { displayName      : ZmMsg.imPrefIdleStatus,
                              displayContainer : ZmPref.TYPE_SELECT,
                              displayOptions   : [ ZmMsg.imStatusAway,
                                                   ZmMsg.imStatusExtAway,
                                                   // ZmMsg.imStatusInvisible, // no support in server for now
                                                   ZmMsg.imStatusOffline ],
                              options          : [ "away",
                                                   "xa",
                                                   // "invisible",
                                                   "offline" ],
                              precondition     : ZmSetting.IM_PREF_REPORT_IDLE
                            });

};

ZmImApp.prototype._onSettingChange = function(ev) {
	if (ev.type != ZmEvent.S_SETTING) return;

	var id = ev.source.id;
        var val = appCtxt.get(id);

        if (id == ZmSetting.IM_PREF_INSTANT_NOTIFY && appCtxt.get(ZmSetting.INSTANT_NOTIFY)) {

		appCtxt.getAppController().setInstantNotify(val);

        } else if (this._roster && id == ZmSetting.IM_PREF_REPORT_IDLE) {

                if (!val)
                        this._roster._idleTimer.kill();
                else
                        this._roster._idleTimer.resurrect(appCtxt.get(ZmSetting.IM_PREF_IDLE_TIMEOUT));

        } else if (this._roster && id == ZmSetting.IM_PREF_IDLE_TIMEOUT) {

                this._roster._idleTimer.timeout = parseInt(val) * 60 * 1000;

        }
};

ZmImApp.prototype.refresh =
function() {
	delete this._lastSeq;
	if (ZmImService.INSTANCE.isLoggedIn()) {
		this._roster.refresh();
	}
};

ZmImApp.prototype.handleOp = function(op) {
	switch (op) {
		case ZmOperation.IM_NEW_CHAT:
			this.prepareVisuals(); // ... and create views, if not yet done
			this.getImController()._imNewChatListener();
			break;
		case ZmOperation.NEW_ROSTER_ITEM:
			this.prepareVisuals(); // ... and create views, if not yet done
			this.getImController()._newRosterItemListener()
			break;
		case ZmOperation.IM_PRESENCE_MENU:
			if (this._presenceButton) {
				this._presenceButton.popup();
			}
			break;
	}
};

ZmImApp.prototype.postNotify =
function(notify) {
	if (notify.im) {
		// Skip any notifications we've already seen.
		if (!this._lastSeq || (notify.seq > this._lastSeq)) {
			this._lastSeq = notify.seq;
			AjxDispatcher.run("GetRoster").pushNotification(notify.im);
		}
	}
};

ZmImApp.prototype.addComponents =
function(components) {
	// Set up the presence indicator next to the user info & quota.
	var container = Dwt.byId(ZmId.SKIN_PRESENCE);
	if (container) {
		var buttonArgs = {
			parent: appCtxt.getShell(),
			id: ZmId.PRESENCE,
			posStyle: Dwt.ABSOLUTE_STYLE
		};
		this._presenceButton = new ZmPresenceButton(buttonArgs);
		this.syncImPresenceButton(this._presenceButton, false, true);
		this._updatePresenceButton(null, this._presenceButton, false, true);
		ZmImApp.addImPresenceMenu(this._presenceButton);
		components[ZmAppViewMgr.C_PRESENCE] = this._presenceButton;

		// Fix the size of the skin container.
		// (We do this here rather than in the skin because the skin
		// has no way of knowing whether IM is enabled.)
		var width = appCtxt.get(ZmSetting.SKIN_HINTS, "presence.width") || 46;
		var height = appCtxt.get(ZmSetting.SKIN_HINTS, "presence.height") || 24;
		Dwt.setSize(container, width, height);
	}
};

ZmImApp.prototype.startup =
function() {
	if (appCtxt.get(ZmSetting.IM_PREF_AUTO_LOGIN)) {
		// Do the auto login after a short delay. I chose 1000ms because that means
		// im login will happen after zimlets are loaded.
		AjxTimedAction.scheduleAction(new AjxTimedAction(this, this._autoLogin), 1000);
	}
};

/**
 *
 * @param params
 */
ZmImApp.prototype.login =
function(params) {
	ZmImServiceController.INSTANCE.login(params);
};

ZmImApp.prototype._autoLogin =
function() {
	var callback = new AjxCallback(this, this._postLoadAutoLogin);
	AjxDispatcher.require([ "IMCore" ], true, callback);
};

ZmImApp.prototype._postLoadAutoLogin =
function() {
	this.login();
};

ZmImApp.prototype.launch = function(params, callback) {
	var loadCallback = new AjxCallback(this, this._handleLoadLaunch, [callback]);
	AjxDispatcher.require([ "IMCore", "IM" ], true, loadCallback, null, true);
};

ZmImApp.prototype._handleLoadLaunch = function(callback) {
	var clc = this.getChatListController();
	clc.show();
	if (callback) {
		callback.run();
	}
};

ZmImApp.prototype.getImController = function() {
	if (!this._imController) {
		AjxDispatcher.require([ "IMCore", "IM" ]);
		this._imController = new ZmImController();
	}
	return this._imController;
};

ZmImApp.prototype.isActive = function() {
	return this._active;
};

ZmImApp.prototype.getChatListController =
function() {
	if (!this._chatListController) {
		this._chatListController = new ZmChatListController(this._container, this);
	}
	return this._chatListController;
};

ZmImApp.prototype.getRoster =
function() {
	return this._roster;
};

ZmImApp.prototype.hasRoster =
function(){
        return !!this._roster;  
};

ZmImApp.prototype.getAutoCompleteGroups =
function() {
	return new ZmRosterTreeGroups(this.getRoster());
};

ZmImApp.addImPresenceMenu =
function(button) {
	button.setMenu(new AjxCallback(ZmImApp.INSTANCE, ZmImApp.INSTANCE._createImPresenceMenu, [button]));
};

ZmImApp.prototype.syncImPresenceButton =
function(button, doText, doTooltip) {
	var roster = this.getRoster();
	this._updatePresenceButton(roster.getPresence(), button, doText, doTooltip);
	var listener = new AjxListener(this, this._rosterChangeListener, [button, doText, doTooltip]);
	roster.addChangeListener(listener);
};

ZmImApp.prototype.prepareVisuals = function() {
	if (!this._haveVisuals) {
                AjxDispatcher.require([ "IMCore", "IM" ], false, new AjxCallback(this, function(){
		        this.getChatListController().prepareVisuals();
                        this._haveVisuals = true;
                }, null, true));
	}
};

ZmImApp.prototype._createImPresenceMenu =
function(button) {
	AjxDispatcher.require(["IMCore", "IM"]);
	var menu = ZmImServiceController.INSTANCE.createPresenceMenu(button);
	button.setMenu(menu);
	return menu;
};

ZmImApp.prototype._rosterChangeListener =
function(button, doText, doTooltip, ev) {
	if (ev.event == ZmEvent.E_MODIFY) {
		var fields = ev.getDetail("fields");
		if (ZmRoster.F_PRESENCE in fields) {
			var presence = this._roster.getPresence();
			this._updatePresenceButton(presence, button, doText, doTooltip)
		}
	}
};

ZmImApp.prototype._updatePresenceButton =
function(presence, button, doText, doTooltip) {
	var icon = presence ? presence.getIcon() : "Offline";
	button.setImage(icon);
	var showText = presence ? AjxStringUtil.htmlEncode(presence.getShowText()) : ZmMsg.imStatusOffline;
	if (doTooltip) {
		var tooltip = ZmImServiceController.INSTANCE.getMyPresenceTooltip(showText);
		button.setToolTipContent(tooltip);
	}
	if (doText) {
		button.setText(showText);
	}
};

// Constants used when handling the im context menu items.
ZmImApp._NEW_IM = "NEW_IM";
ZmImApp._NEW_BUDDY_FROM_IM_ADDRESS = "NEW_BUDDY_FROM_IM_ADDRESS";
ZmImApp._NEW_BUDDY = "NEW_BUDDY";

/**
 * Updates the im context menu item when a contact is selected.
 * @param item {DwtMenuItem} menu item
 * @param contact {ZmContact} selected contact
 * @param address {AjxEmailAddress} email address selected. Optional.
 */
ZmImApp.updateImMenuItemByContact =
function(item, contact, address) {
	// If not logged in, disable the item.
	var loggedOut = ZmImApp._updateImMenuItemByLogin(item);
	if (loggedOut) {
		return;
	}

	// If the contact has a buddy, update the menu item for that buddy.
	var buddy = contact.getBuddy();
	if (buddy) {
		ZmImApp._updateImMenuItemByBuddy(item, buddy);
		return;
	}

	// If the contact has any im address, update the menu item for that address.
	var imAddress = contact.getIMAddress();
	if (imAddress) {
		item.setText(ZmImApp._getNewBuddyText(contact.getFullName()));
		item.setImage("NewContact");
		item._imData = { op: ZmImApp._NEW_BUDDY_FROM_IM_ADDRESS, contact: contact, imAddress: imAddress };
		return;
	}

	// Contact has no buddy or im address, so update the item to create a buddy by name.
	var name = address && address.getName() ? address.getName() : contact.getFullName(); 
	item.setText(ZmImApp._getNewBuddyText(name));
	item.setImage("NewContact");
	item._imData = { op: ZmImApp._NEW_BUDDY, address: address, name: name };
};

/**
 * Updates the im context menu item when an email address is selected.
 * @param item {DwtMenuItem} menu item
 * @param address {AjxEmailAddress} email address selected
 */
ZmImApp.updateImMenuItemByAddress =
function(item, address) {
	// If not logged in, disable the item.
	var loggedOut = ZmImApp._updateImMenuItemByLogin(item);
	if (loggedOut) {
		return;
	}

	// If we can find a buddy with the address, use the buddy menu item.
	var buddy = AjxDispatcher.run("GetRoster").getRosterItem(address.getAddress());
	if (buddy) {
		ZmImApp._updateImMenuItemByBuddy(item, buddy);
		return;
	}

	// Figure out if there's a contact for the address, update the menu item for that contact.
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		var contactList = AjxDispatcher.run("GetContacts");
		if (contactList) {
			var contact = contactList.getContactByEmail(address.getAddress());
			if (contact) {
				ZmImApp.updateImMenuItemByContact(item, contact, address);
				return;
			}
		}
	}

	// Address has no contact or buddy. Use create buddy menu item.
	item.setText(ZmImApp._getNewBuddyText(address.getName() || address.getAddress()));
	item.setImage("NewContact");
	item._imData = { op: ZmImApp._NEW_BUDDY, address: address, name: address.getName() };
};

ZmImApp.getImMenuItemListener =
function() {
	ZmImApp._imMenuItemListenerObj = ZmImApp._imMenuItemListenerObj || new AjxListener(null, ZmImApp._imMenuItemListener);
	return ZmImApp._imMenuItemListenerObj;
};

ZmImApp._updateImMenuItemByBuddy =
function(item, buddy) {
	ZmImApp._newChatFormat = ZmImApp._newChatFormat || new AjxMessageFormat(ZmMsg.imNewChatName);
	item.setText(ZmImApp._newChatFormat.format(buddy.getDisplayName()));
	item.setImage(buddy.getPresence().getIcon());
	item._imData = { op: ZmImApp._NEW_IM, buddy: buddy };
};

ZmImApp._updateImMenuItemByLogin =
function(item) {
	// If not logged in, disable the item.
	if (!ZmImApp.loggedIn()) {
		item.setText(ZmMsg.newIM);
		item.setImage("ImStartChat");
		item.setEnabled(false);
		item._imData = null;
		return true;
	}
	item.setEnabled(true);
	return false;
};

ZmImApp._getNewBuddyText =
function(name) {
	ZmImApp._newBuddyFormat = ZmImApp._newBuddyFormat || new AjxMessageFormat(ZmMsg.imNewBuddy);
	return ZmImApp._newBuddyFormat.format(name);
};

/**
 * Handles a click on the im item in a context menu. Can create a buddy or start a chat,
 * depending on the selected contact or address.
 */
ZmImApp._imMenuItemListener =
function(ev) {
	ZmImApp.INSTANCE.prepareVisuals();

	var imData = ev.dwtObj._imData;
	switch (imData.op) {
		case ZmImApp._NEW_IM:
			ZmImApp.INSTANCE.getChatListController().chatWithRosterItem(imData.buddy);
			break;
		case ZmImApp._NEW_BUDDY_FROM_IM_ADDRESS:
			var imAddress = ZmImAddress.parse(imData.imAddress);
			var data = imAddress
				? { address: imAddress.screenName, name: imData.contact.getFullName(), service: imAddress.service }
				: { };
			ZmImApp.INSTANCE.getImController()._newRosterItemListener(data);
			break;
		case ZmImApp._NEW_BUDDY:
			data = { address: imData.address ? imData.address.getAddress() : null,  name: imData.name };
			ZmImApp.INSTANCE.getImController()._newRosterItemListener(data);
			break;
	}
};

ZmPresenceButton = function(params) {
	params.className = params.className || "ZToolbarButton";
	DwtButton.call(this, params);
};

ZmPresenceButton.prototype = new DwtButton;
ZmPresenceButton.prototype.constructor = ZmPresenceButton;

// Data
ZmPresenceButton.prototype.TEMPLATE = "share.App#presenceButton";
