/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008 Zimbra, Inc.
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

ZmTaskbarController = function(components) {
	ZmController.call(this, null);

	var parentEl = Dwt.byId(ZmId.SKIN_TASKBAR);
	if (parentEl) {
		var toolbarArgs = {
			parent: appCtxt.getShell(),
			id: ZmId.TASKBAR,
			posStyle: Dwt.ABSOLUTE_STYLE
		};
		this._toolbar = components[ZmAppViewMgr.C_TASKBAR] = new ZmToolBar(toolbarArgs);
		var buttons = [
			{
				op: ZmId.OP_IM_PRESENCE_MENU,
				button: {
					template: "share.App#presenceButton",
					menu: new AjxCallback(this, this._presenceMenuCallback),
					menuAbove: true
				}
			},
			{
				op: ZmOperation.SEP
			},
			{
				op: ZmId.OP_IM_BUDDY_LIST,
				button: {
					template: "share.App#presenceButton",
					menu: new AjxCallback(this, this._buddyListCallback),
					menuAbove: true
				}
			},
			{
				op: ZmOperation.SEP
			},
			{
				op: ZmOperation.FILLER
			},
			{
				op: ZmId.OP_IM_GATEWAY_LOGIN,
				button: {
					
				}
			},
		];
		for (var i = 0, count = buttons.length; i < count; i++) {
			this._createTaskbarButton(buttons[i]);
		}
		var height = appCtxt.getSkinHint("presence", "height") || 24;
		Dwt.setSize(parentEl, Dwt.DEFAULT, height);
		this._initPresenceButton();
	}
};

ZmTaskbarController.prototype = new ZmController;
ZmTaskbarController.prototype.constructor = ZmTaskbarController;

ZmTaskbarController.prototype.toString =
function() {
	return "ZmTaskbarController";
};

ZmTaskbarController.prototype._createTaskbarButton =
function(data) {
	if (data.op == ZmOperation.SEP) {
		this._toolbar.addSeparator(null, data.index);
	} else  if (data.op == ZmOperation.FILLER) {
		this._toolbar.addFiller(null, data.index);
	} else {
		data.button.text = ZmMsg[ZmOperation.getProp(data.op, "textKey")];
		data.button.image = ZmOperation.getProp(data.op, "image");
		data.button.tooltip = ZmMsg[ZmOperation.getProp(data.op, "tooltipKey")];
		this._toolbar.createButton(data.op, data.button);
	}
};

ZmTaskbarController.prototype._presenceMenuCallback =
function(button) {
	AjxDispatcher.require(["IMCore", "IM"]);
	return ZmImApp.INSTANCE.getServiceController().createPresenceMenu(button);
};

ZmTaskbarController.prototype._buddyListCallback =
function(button) {
	var menu = new DwtMenu({ parent: button, style: DwtMenu.GENERIC_WIDGET_STYLE });
	var overviewArgs = {
		posStyle: Dwt.STATIC_STYLE,
		isFloating: true,
		noAssistant: true,
		expanded: true,
		singleClick: true
	};
	new ZmImOverview(menu, overviewArgs);
	return menu;
};


ZmTaskbarController.prototype._initPresenceButton =
function() {
	var roster = ZmImApp.INSTANCE.getRoster();
	this._updatePresenceButton(ZmImApp.loggedIn() ? roster.getPresence() : null);
	roster.addChangeListener(new AjxListener(this, this._rosterChangeListener));
};

ZmTaskbarController.prototype._rosterChangeListener =
function(ev) {
	if (ev.event == ZmEvent.E_MODIFY) {
		var fields = ev.getDetail("fields");
		if (ZmRoster.F_PRESENCE in fields) {
			var presence = ZmImApp.INSTANCE.getRoster().getPresence();
			this._updatePresenceButton(presence);
		}
	}
};

ZmTaskbarController.prototype._updatePresenceButton =
function(presence) {
	var button = this._toolbar.getButton(ZmId.OP_IM_PRESENCE_MENU);
	var icon = presence ? presence.getIcon() : "Offline";
	button.setImage(icon);
	var showText = presence ? AjxStringUtil.htmlEncode(presence.getShowText()) : ZmMsg.imStatusOffline;
	var tooltip = ZmImApp.INSTANCE.getServiceController().getMyPresenceTooltip(showText);
	button.setToolTipContent(tooltip);
};