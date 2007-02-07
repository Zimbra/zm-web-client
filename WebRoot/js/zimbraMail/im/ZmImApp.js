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

	AjxDispatcher.registerMethod("GetRoster", "IM", new AjxCallback(this, this.getRoster));

	ZmItem.registerItem(ZmItem.CHAT,
						{app:			ZmApp.IM,
						 nameKey:		"chat",
						 icon:			"ImStartChat"
						});

	ZmOrganizer.registerOrg(ZmOrganizer.ROSTER_TREE,
							{app:				ZmApp.IM,
							 orgClass:			"ZmRosterTree",
							 orgPackage:		"IM",
							 treeController:	"ZmRosterTreeController",
							 labelKey:			"buddyList",
							 compareFunc:		"ZmRosterTreeItem.sortCompare"
							});

	ZmOrganizer.registerOrg(ZmOrganizer.ROSTER_TREE_ITEM,
							{app:				ZmApp.IM,
							 orgClass:			"ZmRosterTreeItem",
							 orgPackage:		"IM",
							 treeController:	"ZmRosterTreeController",
							 labelKey:			"buddyList",
							 compareFunc:		"ZmRosterTreeItem.sortCompare"
							});

	ZmApp.registerApp(ZmApp.IM,
							 {mainPkg:				"IM",
							  nameKey:				"imAppTitle",
							  icon:					"ImStartChat",
							  chooserTooltipKey:	"goToIm",
							  defaultSearch:		ZmSearchToolBar.FOR_MAIL_MI,
							  overviewTrees:		[ZmOrganizer.ROSTER_TREE_ITEM],
							  showZimlets:			true,
							  actionCode:			ZmKeyMap.GOTO_IM,
							  chooserSort:			40,
							  defaultSort:			50
							  });

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

ZmImApp.prototype.startup =
function() {
	AjxDispatcher.run("GetRoster").reload();
};

ZmImApp.prototype.refresh =
function() {
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
	var loadCallback = new AjxCallback(this, this._handleLoadLaunch, [callback]);
	AjxDispatcher.require("IM", false, loadCallback, null, true);
};

ZmImApp.prototype._handleLoadLaunch =
function(callback) {
    var clc = this.getChatListController();
    clc.show();
	if (callback)
		callback.run();
};

ZmImApp.prototype.activate =
function(active) {
    this._active = active;
    if (active) this._appCtxt.setStatusIconVisible(ZmStatusView.ICON_IM, false);
};

ZmImApp.prototype.isActive =
function() {
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
    return new ZmRosterTreeGroups(this.getRoster().getRosterItemTree());
};
