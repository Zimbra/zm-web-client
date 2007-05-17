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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

function ZmImApp(appCtxt, container) {

	ZmApp.call(this, ZmApp.IM, appCtxt, container);

	// IM is enabled, so show Chats folder
	delete ZmFolder.HIDE_ID[ZmOrganizer.ID_CHATS];
	this._active = false;
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

// App-related constants
ZmApp.IM					= "IM";
ZmApp.CLASS[ZmApp.IM]		= "ZmImApp";
ZmApp.SETTING[ZmApp.IM]		= ZmSetting.IM_ENABLED;
ZmApp.LOAD_SORT[ZmApp.IM]	= 70;
ZmApp.QS_ARG[ZmApp.IM]		= "chat";

ZmImApp.prototype = new ZmApp;
ZmImApp.prototype.constructor = ZmImApp;

ZmImApp.prototype.toString =
function() {
	return "ZmImApp";
};

// Construction

ZmImApp.prototype._defineAPI =
function() {
	AjxDispatcher.registerMethod("GetRoster", "IM", new AjxCallback(this, this.getRoster));
	AjxDispatcher.registerMethod("GetChatListController", "IM", new AjxCallback(this, this.getChatListController));
};
////	AjxDispatcher.run("GetRoster").reload();

ZmImApp.prototype._registerOperations =
function() {
	ZmOperation.registerOp("IM_NEW_CHAT", {textKey:"imNewChat", image:"ImFree2Chat"});
	ZmOperation.registerOp("IM_NEW_GROUP_CHAT", {textKey:"imNewGroupChat", image:"ImFree2Chat"});
	ZmOperation.registerOp("IM_PRESENCE_AWAY", {textKey:"imStatusAway", image:"ImAway"});
	ZmOperation.registerOp("IM_PRESENCE_CHAT", {textKey:"imStatusChat", image:"ImFree2Chat"});
	ZmOperation.registerOp("IM_PRESENCE_DND", {textKey:"imStatusDND", image:"ImDnd"});
	ZmOperation.registerOp("IM_PRESENCE_INVISIBLE", {textKey:"imStatusInvisible", image:"ImInvisible"});
	ZmOperation.registerOp("IM_PRESENCE_MENU", {textKey:"imPresence"}, null, ZmImApp.addImPresenceMenu);
	ZmOperation.registerOp("IM_PRESENCE_OFFLINE", {textKey:"imStatusOffline", image:"RoundMinusDis"});
	ZmOperation.registerOp("IM_PRESENCE_ONLINE", {textKey:"imStatusOnline", image:"ImAvailable"});
	ZmOperation.registerOp("IM_PRESENCE_XA", {textKey:"imStatusExtAway", image:"ImExtendedAway"});
	ZmOperation.registerOp("NEW_ROSTER_ITEM", {textKey:"newRosterItem", image:"ImBuddy"});
	ZmOperation.registerOp("IM_CREATE_CONTACT", { textKey: "addToNewContact", image: "NewContact" });
	ZmOperation.registerOp("IM_ADD_TO_CONTACT", { textKey: "addToExistingContact", image: "Edit" });
	ZmOperation.registerOp("IM_EDIT_CONTACT", { textKey: "editContact", image: "Edit" });
	ZmOperation.registerOp("IM_GATEWAY_LOGIN", { textKey: "imGatewayLogin" });
	ZmOperation.registerOp("IM_TOGGLE_OFFLINE", { textKey: "imToggleOffline" });
};

ZmImApp.prototype._registerItems =
function() {
	ZmItem.registerItem(ZmItem.CHAT,
						{app:			ZmApp.IM,
						 nameKey:		"chat",
						 icon:			"ImStartChat",
						 soapCmd:		"ItemAction",
						 itemClass:		"ZmChat",
						 node:			"chat",
						 organizer:		ZmOrganizer.ROSTER,
						 searchType:	"chat"
						});
};

ZmImApp.prototype._registerOrganizers =
function() {
// 	// not really sure what this is
//	ZmOrganizer.registerOrg(ZmOrganizer.ROSTER_TREE,
//							{app:				ZmApp.IM,
//							 orgClass:			"ZmRosterTree",
//							 orgPackage:		"IM",
//							 labelKey:			"buddyList",
//							 compareFunc:		"ZmRosterTreeItem.sortCompare"
//							});

	ZmOrganizer.registerOrg(ZmOrganizer.ROSTER_TREE_ITEM,
							{app:				ZmApp.IM,
							 orgClass:			"ZmRosterTreeItem",
							 orgPackage:		"IM",
							 treeController:	"ZmRosterTreeController",
							 labelKey:			"buddyList",
							 compareFunc:		"ZmRosterTreeItem.sortCompare"
							});
};

ZmImApp.prototype._registerApp =
function() {
	ZmApp.registerApp(ZmApp.IM,
							 {mainPkg:				"IM",
							  nameKey:				"imAppTitle",
							  icon:					"ImStartChat",
							  chooserTooltipKey:	"goToIm",
							  defaultSearch:		ZmSearchToolBar.FOR_MAIL_MI,
							  organizer:			ZmOrganizer.ROSTER_TREE_ITEM,
							  overviewTrees:		[ZmOrganizer.ROSTER_TREE_ITEM],
							  showZimlets:			true,
							  gotoActionCode:		ZmKeyMap.GOTO_IM,
							  chooserSort:			40,
							  defaultSort:			50
							  });
};

ZmImApp.prototype._registerSettings = function(settings) {
	settings = settings || this._appCtxt.getSettings();
        settings.registerSetting("IM_PREF_FLASH_ICON",
				 { name         : "zimbraPrefIMFlashIcon",
                                   type         : ZmSetting.T_PREF,
                                   dataType     : ZmSetting.D_BOOLEAN,
                                   defaultValue : true });

        settings.registerSetting("IM_PREF_NOTIFY_PRESENCE",
				 { name         : "zimbraPrefIMNotifyPresence",
                                   type         : ZmSetting.T_PREF,
                                   dataType     : ZmSetting.D_BOOLEAN,
                                   defaultValue : true });

        settings.registerSetting("IM_PREF_NOTIFY_STATUS",
				 { name         : "zimbraPrefIMNotifyStatus",
                                   type         : ZmSetting.T_PREF,
                                   dataType     : ZmSetting.D_BOOLEAN,
                                   defaultValue : true });
};

ZmImApp.prototype._registerPrefs = function() {
	var list = [ ZmSetting.IM_PREF_FLASH_ICON,
		     ZmSetting.IM_PREF_NOTIFY_PRESENCE,
		     ZmSetting.IM_PREF_NOTIFY_STATUS ];

	ZmPref.setPrefList("IM_PREFS", list);

	ZmPref.registerPref("IM_PREF_FLASH_ICON",
			    { displayName      : ZmMsg.imPrefFlashIcon,
			      displayContainer : ZmPref.TYPE_CHECKBOX });

	ZmPref.registerPref("IM_PREF_NOTIFY_PRESENCE",
			    { displayName      : ZmMsg.imPrefNotifyPresence,
			      displayContainer : ZmPref.TYPE_CHECKBOX });

	ZmPref.registerPref("IM_PREF_NOTIFY_STATUS",
			    { displayName      : ZmMsg.imPrefNotifyStatus,
			      displayContainer : ZmPref.TYPE_CHECKBOX });
};

// App API

ZmImApp.prototype.refresh =
function() {
	// console.log("refresh");
	AjxDispatcher.run("GetRoster").reload();
};

ZmImApp.prototype.postNotify =
function(notify) {
	if (notify.im) {
		AjxDispatcher.run("GetRoster").handleNotification(notify.im);
	}
};

ZmImApp.prototype.launch =
function(callback) {
	// console.log("launch");
	var loadCallback = new AjxCallback(this, this._handleLoadLaunch, [callback]);
	AjxDispatcher.require("IM", true, loadCallback, null, true);
};

ZmImApp.prototype._handleLoadLaunch =
function(callback) {
	var clc = this.getChatListController();
	this.prepareVisuals();
	clc.show();
	if (callback)
		callback.run();
};

ZmImApp.prototype.activate =
function(active) {
	// console.log("activate");
	this._active = active;
	if (active) {
		this.stopFlashingIcon();
	}
	var treeController = this._appCtxt.getOverviewController().getTreeController(ZmOrganizer.ROSTER_TREE_ITEM);
	treeController.appActivated(active);
};

ZmImApp.prototype.isActive = function() {
	return this._active;
};

ZmImApp.prototype.getChatListController =
function() {
	if (!this._chatListController)
		this._chatListController = new ZmChatListController(this._appCtxt, this._container, this);
	return this._chatListController;
};

ZmImApp.prototype.getRoster =
function() {
	if (!this._roster) {
		this._roster = new ZmRoster(this._appCtxt, this);
	}
	return this._roster;
};

ZmImApp.prototype.getAutoCompleteGroups =
function() {
	return new ZmRosterTreeGroups(this.getRoster());
};

ZmImApp.prototype.startFlashingIcon = function() {
	this._appCtxt.getAppController().getAppChooserButton("IM").startFlashing();
};

ZmImApp.prototype.stopFlashingIcon = function() {
	this._appCtxt.setStatusIconVisible(ZmStatusView.ICON_IM, false);
	this._appCtxt.getAppController().getAppChooserButton("IM").stopFlashing();
};

ZmImApp.addImPresenceMenu =
function(parent) {
	var list = [ ZmOperation.IM_PRESENCE_OFFLINE, ZmOperation.IM_PRESENCE_ONLINE, ZmOperation.IM_PRESENCE_CHAT,
                     ZmOperation.IM_PRESENCE_DND, ZmOperation.IM_PRESENCE_AWAY, ZmOperation.IM_PRESENCE_XA,
                     ZmOperation.IM_PRESENCE_INVISIBLE];

	var menu = new ZmPopupMenu(parent);

	for (var i = 0; i < list.length; i++) {
		var op = list[i];
		var mi = menu.createMenuItem(op, {image:ZmOperation.getProp(op, "image"), text:ZmMsg[ZmOperation.getProp(op, "textKey")],
										  style:DwtMenuItem.RADIO_STYLE});
		mi.setData(ZmOperation.MENUITEM_ID, op);
		mi.setData(ZmOperation.KEY_ID, op);
		if (op == ZmOperation.IM_PRESENCE_OFFLINE) mi.setChecked(true, true);
	}

	parent.setMenu(menu, false, DwtMenuItem.RADIO_STYLE);
	return menu;
};

ZmImApp.prototype.prepareVisuals = function() {
	AjxDispatcher.require("IM", false);

	if (!this.__haveRoster) {
		// architecture... such a wonderful thing.  here's how we get a singleton:
		var treeController = this._appCtxt.getOverviewController().getTreeController(ZmOrganizer.ROSTER_TREE_ITEM);

		// and this seems to be the only way to properly instantiate the buddy list tree:
		treeController.show({ overviewId  : ZmZimbraMail._OVERVIEW_ID,
				      app	  : ZmApp.IM
				    });

		treeController.getTreeView(ZmZimbraMail._OVERVIEW_ID).setVisible(this._active);
		treeController.appActivated(this._active);

		this.getChatListController().prepareVisuals();
		// setTimeout(AjxCallback.simpleClosure(this.refresh, this), 100);
		this.__haveRoster = true;
		this.refresh();
	}
};
