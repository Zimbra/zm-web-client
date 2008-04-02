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
};

// Organizer and item-related constants
ZmEvent.S_CHAT        			= "CHAT";
ZmEvent.S_ROSTER				= "ROSTER";
ZmEvent.S_ROSTER_ITEM			= "ROSTER ITEM";
ZmEvent.S_ROSTER_TREE_ITEM		= "ROSTER TREE ITEM";
ZmEvent.S_ROSTER_TREE_GROUP		= "ROSTER TREE GROUP";
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
ZmApp.LOAD_SORT[ZmApp.IM]	= 70;
ZmApp.QS_ARG[ZmApp.IM]		= "chat";

ZmImApp.ALERT_CLIENT = 1;  // Displays an alert for entire web client, flashing favicon & document.title
ZmImApp.ALERT_APP_TAB = 2; // Displays an alert for im app tab 

ZmImApp.prototype = new ZmApp;
ZmImApp.prototype.constructor = ZmImApp;

ZmImApp.loggedIn = function() {
        return ZmImApp.INSTANCE
                && ( appCtxt.get(ZmSetting.IM_PREF_AUTO_LOGIN) ||
                     ZmImApp.INSTANCE._roster );
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
	ZmOperation.registerOp(ZmId.OP_IM_NEW_CHAT	       , { textKey: "imNewChat", image: "ImFree2Chat" });
	ZmOperation.registerOp(ZmId.OP_IM_NEW_GROUP_CHAT     , { textKey: "imNewGroupChat", image: "ImFree2Chat" });
	ZmOperation.registerOp(ZmId.OP_IM_PRESENCE_AWAY      , { textKey: "imStatusAway", image: "ImAway" });
	ZmOperation.registerOp(ZmId.OP_IM_PRESENCE_CHAT      , { textKey: "imStatusChat", image: "ImFree2Chat" });
	ZmOperation.registerOp(ZmId.OP_IM_PRESENCE_DND       , { textKey: "imStatusDND", image: "ImDnd" });
	ZmOperation.registerOp(ZmId.OP_IM_PRESENCE_INVISIBLE , { textKey: "imStatusInvisible", image: "ImInvisible" });
	ZmOperation.registerOp(ZmId.OP_IM_PRESENCE_MENU      , { textKey: "imPresence" }, null, ZmImApp.addImPresenceMenu );
	ZmOperation.registerOp(ZmId.OP_IM_PRESENCE_OFFLINE   , { textKey: "imStatusOffline", image: "Offline" });
	ZmOperation.registerOp(ZmId.OP_IM_PRESENCE_ONLINE    , { textKey: "imStatusOnline", image: "ImAvailable" });
	ZmOperation.registerOp(ZmId.OP_IM_PRESENCE_XA	       , { textKey: "imStatusExtAway", image: "ImExtendedAway" });
	ZmOperation.registerOp(ZmId.OP_NEW_ROSTER_ITEM       , { textKey: "newRosterItem", image: "ImBuddy" });
	ZmOperation.registerOp(ZmId.OP_IM_CREATE_CONTACT     , { textKey: "addToNewContact", image: "NewContact" });
	ZmOperation.registerOp(ZmId.OP_IM_ADD_TO_CONTACT     , { textKey: "addToExistingContact", image: "Edit" });
	ZmOperation.registerOp(ZmId.OP_IM_EDIT_CONTACT       , { textKey: "editContact", image: "Edit" });
	ZmOperation.registerOp(ZmId.OP_IM_GATEWAY_LOGIN      , { textKey: "imGatewayLogin", image: "ExternalLink" });
	ZmOperation.registerOp(ZmId.OP_IM_TOGGLE_OFFLINE     , { textKey: "imToggleOffline" });
        ZmOperation.registerOp(ZmId.OP_IM_TOGGLE_BLOCKED     , { textKey: "imToggleBlocked" });
        ZmOperation.registerOp(ZmId.OP_IM_FLOATING_LIST      , { textKey: "imFloatingBuddyList", image: "ImGroup" });

        ZmOperation.registerOp(ZmId.OP_IM_SORT_BY_PRESENCE   , { textKey: "imSortListByPresence" });
        ZmOperation.registerOp(ZmId.OP_IM_SORT_BY_NAME       , { textKey: "imSortListByName" });

	ZmOperation.registerOp(ZmId.OP_IM_PRESENCE_CUSTOM_MSG		, { textKey: "imCustomStatusMsg", image: "ImFree2Chat"});

        ZmOperation.registerOp(ZmId.OP_IM_BLOCK_BUDDY , { textKey: "imBlock", image: "BlockUser" });
        ZmOperation.registerOp(ZmId.OP_IM_UNBLOCK_BUDDY , { textKey: "imUnblock", image: "AllowUser" });
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
	newItemOps[ZmOperation.IM_NEW_CHAT] = "chat";
        newItemOps[ZmOperation.IM_FLOATING_LIST] = "im_floating_list";
	ZmApp.registerApp(ZmApp.IM,
			  { mainPkg	      : "IM",
			    nameKey	      : "imAppTitle",
			    icon	      : "ImStartChat",
			    chooserTooltipKey : "goToIm",
			    defaultSearch     : ZmSearchToolBar.FOR_MAIL_MI,
			    gotoActionCode    : ZmKeyMap.GOTO_IM,
			    chooserSort	      : 40,
			    defaultSort	      : 50,
			    newItemOps        : newItemOps
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

        settings.registerSetting("IM_PREF_FLASH_ICON",
				 { name         : "zimbraPrefIMFlashIcon",
                                   type         : ZmSetting.T_PREF,
                                   dataType     : ZmSetting.D_BOOLEAN,
				   defaultValue : true
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
			priority: 90,
			precondition: ZmSetting.IM_ENABLED,
			prefs: [
				ZmSetting.IM_PREF_INSTANT_NOTIFY,
				ZmSetting.IM_PREF_AUTO_LOGIN,
				ZmSetting.IM_PREF_FLASH_ICON,
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
            displayName     :   ZmMsg.imPrefNotifySounds,
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

ZmImApp.prototype._setupCurrentAppToolbar =
function() {
	var callback = new AjxCallback(this,function(ev){
		this.getRosterTreeController()._newRosterItemListener(ev);
	});
	ZmCurrentAppToolBar.registerApp(this.getName(), ZmOperation.NEW_ROSTER_ITEM,null,callback);
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
        if (this._roster) {
                // better not call getRoster() here since we don't
                // want to reinit. IM if it wasn't already.
	        this._roster.refresh();
        }
};

ZmImApp.prototype.handleOp = function(op) {
	switch (op) {
	    case ZmOperation.IM_NEW_CHAT:
		this.prepareVisuals(); // ... and create views, if not yet done
		this.getRosterTreeController()._imNewChatListener();
		break;
            case ZmOperation.IM_FLOATING_LIST:
                this.prepareVisuals();
                this.getRosterTreeController()._imFloatingListListener();
                break;
	}
};

ZmImApp.prototype.postNotify =
function(notify) {
	if (notify.im) {
                AjxDispatcher.run("GetRoster").pushNotification(notify.im);
	}
};

ZmImApp.prototype.startup =
function() {
	// Set up the presence indicator next to the user info & quota.
	var container = Dwt.byId(ZmId.SKIN_PRESENCE);
	if (container) {
		var buttonArgs = {
			parent: appCtxt.getShell(),
			id: ZmId.PRESENCE,
			posStyle: Dwt.ABSOLUTE_STYLE
		};
		this._presenceButton = new ZmPresenceButton(buttonArgs);
		this._updatePresenceButton(null);
		ZmImApp.addImPresenceMenu(this._presenceButton);

		// Fix the size of the skin container.
		// (We do this here rather than in the skin because the skin
		// has no way of knowing whether IM is enabled.)
		var width = appCtxt.get(ZmSetting.SKIN_HINTS, "presence.width") || 46;
		var height = appCtxt.get(ZmSetting.SKIN_HINTS, "presence.height") || 24;
		Dwt.setSize(container, width, height);

		var components = { };
		components[ZmAppViewMgr.C_PRESENCE] = this._presenceButton;
		appCtxt.getAppViewMgr().addComponents(components, true);
	}

	// Keep track of focus on the app.
	var listener = new AjxListener(this, this._focusListener);
	DwtShell.getShell(window).addFocusListener(listener);
	DwtShell.getShell(window).addBlurListener(listener);

	// Implement auto login.
	if (appCtxt.get(ZmSetting.IM_PREF_AUTO_LOGIN)) {
		// Do the auto login after a short delay. I chose 1000ms because that means
		// im login will happen after zimlets are loaded.
		AjxTimedAction.scheduleAction(new AjxTimedAction(this, this._autoLogin), 1000);
	}
};

ZmImApp.prototype._autoLogin =
function() {
	var callback = new AjxCallback(this, this._postLoadAutoLogin);
	AjxDispatcher.require([ "IMCore", "IM" ], true, callback);
};

ZmImApp.prototype._postLoadAutoLogin =
function() {
	var callback = new AjxCallback(this, this._backgroundCreateCallback);
	ZmRoster.createInBackground(callback);
};

ZmImApp.prototype._backgroundCreateCallback =
function(roster) {
	if (!this._roster) { // Roster could have conceivably been set by getRoster...don't overwrite that one.
		this._setRoster(roster);
		this._roster.reload();		
	}
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

ZmImApp.prototype.activate =
function(active) {
	if (active) {
		this.stopAlert(ZmImApp.ALERT_APP_TAB);
		if (this._toast && this._toast.isPoppedUp()) {
			this._toast.transition();
		}
	}
	return ZmApp.prototype.activate.call(this, active);
};

ZmImApp.prototype.getRosterTreeController = function() {
	if (!this._rosterTreeController) {
		this._rosterTreeController = new ZmRosterTreeController();
	}
	return this._rosterTreeController;
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
	if (!this._roster) {
		this._setRoster(new ZmRoster(this));
		this._roster.refresh();
	}
	return this._roster;
};

ZmImApp.prototype._setRoster =
function(roster) {
	this._roster = roster;
	roster.addChangeListener(new AjxListener(this, this._rosterChangeListener));


	// Turn on instant notifications after a short delay, to prevent
	// a flurry of no-op requests on startup.
	if (appCtxt.get(ZmSetting.INSTANT_NOTIFY) && appCtxt.get(ZmSetting.IM_PREF_INSTANT_NOTIFY)) {
		var action = new AjxTimedAction(this, this.requestInstantNotify);
		AjxTimedAction.scheduleAction(action, 4000);
	}
};

ZmImApp.prototype.requestInstantNotify =
function(roster) {
	if (appCtxt.get(ZmSetting.INSTANT_NOTIFY) && appCtxt.get(ZmSetting.IM_PREF_INSTANT_NOTIFY)) {
		appCtxt.getAppController().setInstantNotify(true);
	}
};

ZmImApp.prototype.getAutoCompleteGroups =
function() {
	return new ZmRosterTreeGroups(this.getRoster());
};

ZmImApp.addImPresenceMenu =
function(button) {
	button.setMenu(new AjxCallback(null, ZmImApp.createImPresenceMenu, [button]));
};

ZmImApp.createImPresenceMenu =
function(button) {
	AjxPackage.require("IMCore");
	var menu = new ZmPresenceMenu(button);
	button.setMenu(menu);
	return menu;
};

ZmImApp.prototype.prepareVisuals = function() {
	if (!this._haveVisuals) {
                AjxDispatcher.require([ "IMCore", "IM" ], false, new AjxCallback(this, function(){
		        this.getChatListController().prepareVisuals();
                        this._haveVisuals = true;
                }, null, true));
	}
};

ZmImApp.prototype.getOverviewPanelContent = function() {
	if (!this._imOvw)
		this._imOvw = new ZmImOverview(this._container);
	return this._imOvw;
};

ZmImApp.INCOMING_MSG_NOTIFICATION = "incoming";
ZmImApp.prototype.playAlert = function(type){
    switch(type){
        case ZmImApp.INCOMING_MSG_NOTIFICATION:
            appCtxt.getSimpleSoundPlayer().play(appContextPath+"/public/sounds/im/alert.wav");
            break;
    }
};

ZmImApp.prototype.showToast = function(chat, chatMessage){
	if (!this._toast) {
		this._toast = new ZmImToast(appCtxt.getAppController().statusView);
	}
	if (this._toast.isPoppedUp()) {
		return;
	}
	var msgArgs = {
		body: chatMessage.body,
		from: chat.getDisplayName(chatMessage.from, false)
	}
	for (var i in msgArgs) {
		msgArgs[i] = AjxStringUtil.htmlEncode(AjxStringUtil.clipByLength(msgArgs[i], 30));
	}
	var args = {
		msg: AjxTemplate.expand("im.Chat#ToastText", msgArgs),
		level: ZmStatusView.LEVEL_INFO,
		transitions: [ ZmToast.FADE_IN, ZmImToast.REMAIN, ZmToast.PAUSE, ZmToast.FADE_OUT ],
		toast: this._toast
	};
	appCtxt.setStatusMsg(args);
};

ZmImApp.prototype.startAlert = function() {
	var type = 0;
	if (!this._clientHasFocus) {
		type |= ZmImApp.ALERT_CLIENT;
		if (!this._favIcon) {
			this._favIcon = appContextPath + "/img/logo/favicon.ico";
			this._blankIcon = appContextPath + "/img/logo/blank.ico";
		}
	}
	if (appCtxt.get(ZmSetting.IM_PREF_FLASH_ICON)) {
		if (!this._active) {
			type |= ZmImApp.ALERT_APP_TAB;
			this._origImage = this._origImage || this._getAppButton().getImage();
			this._getAppButton().showAlert(true);
		}
	}
	this._alerts |= type;
	if (this._alerts && !this._alertInterval) {
		this._alertInterval = setInterval(AjxCallback.simpleClosure(this._alertTimerCallback, this), 333);
	}
};

ZmImApp.prototype.stopAlert = function(type) {
	// Reset the state of all the alerts being turned off here.
	this._updateAlerts(false, type & this._alerts);

	// If turning off app tab alert, take off the alert status.
	if (type & this._alerts & ZmImApp.ALERT_APP_TAB) {
		this._getAppButton().showAlert(false);
	}

	// Update bits and stop loop if all alerts are off.
	this._alerts = this._alerts & ~type; // Turn off the bit for type.
	if (!this._alerts && this._alertInterval) {
		clearInterval(this._alertInterval);
		this._alertInterval = 0;
	}
};

ZmImApp.prototype._alertTimerCallback = function() {
	// Flash the im app tab.
	this.__flashIconStatus = !this.__flashIconStatus;
	this._updateAlerts(this.__flashIconStatus, this._alerts);
};

ZmImApp.prototype._updateAlerts = function(status, alerts) {
	if (alerts & ZmImApp.ALERT_APP_TAB) {
		this._getAppButton().setImage(status ? "Blank_16" : this._origImage);
	}

	// Flash the favicon.
	if (alerts & ZmImApp.ALERT_CLIENT) {
		Dwt.setFavIcon(status ? this._blankIcon : this._favIcon);
	}

	// Flash the title.
	if (alerts & ZmImApp.ALERT_CLIENT) {
		var doc = document;
		if (status) {
			this._origTitle = doc.title;
			doc.title = ZmMsg.newMessage;
		} else {
			if (doc.title == ZmMsg.newMessage) {
				doc.title = this._origTitle;
			}
			// else if someone else changed the title, just leave it.
		}
	}	
};

ZmImApp.prototype._getAppButton = function() {
	return appCtxt.getAppController().getAppChooserButton("IM");
};

ZmImApp.prototype._focusListener =
function(ev) {
	this._clientHasFocus = ev.state == DwtFocusEvent.FOCUS;
	if (this._clientHasFocus) {
		this.stopAlert(ZmImApp.ALERT_CLIENT);
	}
};

ZmImApp.prototype._rosterChangeListener = function(ev) {
	if (!this._presenceButton) {
		return;
	}
	if (ev.event == ZmEvent.E_MODIFY) {
		var fields = ev.getDetail("fields");
		if (ZmRoster.F_PRESENCE in fields) {
			var presence = this.getRoster().getPresence();
			this._updatePresenceButton(presence);
		}
	}
};

ZmImApp.prototype._updatePresenceButton = function(presence) {
	var icon = presence ? presence.getIcon() : "Offline";
	var showText = presence ? presence.getShowText() : ZmMsg.imStatusOffline;

	this._presenceButton.setImage(icon);
	this._presenceTooltipFormat = this._presenceTooltipFormat || new AjxMessageFormat(ZmMsg.presenceTooltip);
	var tooltip = this._presenceTooltipFormat.format(showText);
	this._presenceButton.setToolTipContent(tooltip);
};

ZmPresenceButton = function(params) {
	params.className = params.className || "ZToolbarButton";
	DwtButton.call(this, params);
};

ZmPresenceButton.prototype = new DwtButton;
ZmPresenceButton.prototype.constructor = ZmPresenceButton;

// Data
ZmPresenceButton.prototype.TEMPLATE = "share.App#presenceButton";
