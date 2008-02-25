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

ZmChatMultiWindowView = function(parent, className, posStyle, controller) {
	if (arguments.length == 0) return;
	className = className ? className : "ZmChatMultiWindowView";
	posStyle = posStyle ? posStyle : Dwt.ABSOLUTE_STYLE;
	ZmChatBaseView.call(this, parent, className, posStyle, controller, ZmController.IM_CHAT_TAB_VIEW);
	var dropTgt = new DwtDropTarget([ "ZmRosterItem" ]);
	this.setDropTarget(dropTgt);
	dropTgt.addDropListener(new AjxListener(this, this._dropListener, [ dropTgt ]));

	this.setScrollStyle(DwtControl.CLIP);
//	this.setScrollStyle(DwtControl.SCROLL);
	this._chatIdToChatWidget = {};
	this._initX = 20;
	this._initY = 20;

	// This is a singleton.  Why on Earth should I jump to 20
	// source files just to figure out how to get a reference to
	// it is beyond me.  I'm a simple guy, so I'll just store this
	// information here and move on.
	ZmChatMultiWindowView._INSTANCE = this;
};

ZmChatMultiWindowView.prototype = new ZmChatBaseView;
ZmChatMultiWindowView.prototype.constructor = ZmChatMultiWindowView;

ZmChatMultiWindowView._INSTANCE = null;

// PUBLIC function
ZmChatMultiWindowView.getInstance = function() {
	return ZmChatMultiWindowView._INSTANCE;
};

ZmChatMultiWindowView.prototype.getWindowManager = function() {
	if (!this._wm)
		this._wm = new ZmChatWindowManager(this);
	return this._wm;
};

ZmChatMultiWindowView.prototype.getShellWindowManager = function() {
	if (!this._shellWm)
		this._shellWm = new ZmChatWindowManager(DwtShell.getShell(window));
	return this._shellWm;
};

ZmChatMultiWindowView.prototype.getActiveWM = function() {
	return appCtxt.getCurrentAppName() != "IM"
		? this.getShellWindowManager()
		: this.getWindowManager();
};

ZmChatMultiWindowView.prototype.__createChatWidget = function(chat, win) {
	var activeApp = appCtxt.getCurrentAppName();
	if (!win)
		win = this.__useTab;
	this.__useTab = null;
	var wm, sticky;
	if (!win) {
		sticky = activeApp != "IM";
		wm = sticky ? this.getShellWindowManager() : this.getWindowManager();
		if (sticky)
			// reuse windows on global WM, so we don't clutter the display too much
			win = wm.getWindowByType(ZmChatWindow);
	}
	if (!win) {
		win = new ZmChatWindow(wm, chat, sticky);
		var pos = this._initialWindowPlacement();
		if (sticky && !pos) {
			// put it in the bottom-right corner
			var s = win.getSize();
			var ws = wm.getSize();
			pos = { x: ws.x - s.x - 16,
				y: ws.y - s.y - 40 };
		}
		wm.manageWindow(win, pos);
	} else {
		win.addTab(chat);
	}
	return win.getCurrentChatWidget();
};

ZmChatMultiWindowView.prototype._postSet = function() {
	// create chat windows for any pending chats
	var list = this.getChatList().getArray();
	for (var i=0; i < list.length; i++) {
    		var chat = list[i];
        	var cw = this.__createChatWidget(chat);
		this._addChatWidget(cw, chat);
	}
};

ZmChatMultiWindowView.prototype._createHtml =
function() {
	var gws = AjxDispatcher.run("GetRoster").getGateways();
	var cont = new DwtComposite(this, null, Dwt.ABSOLUTE_STYLE);
	var s = cont.getHtmlElement().style;
	// s.left = "100%";
	// s.top = "100%";
	s.right = s.bottom = "20px";
	var toolbar = new DwtToolBar({parent:cont, cellSpacing:10});
	var jiveLogo = new DwtLabel({parent:toolbar, className:"ZmChatJiveIcon ImgJiveBig"});
	for (var i = 1; i < gws.length; ++i) {
		var gw = gws[i];

		var tb2 = new DwtComposite(toolbar);

		var btnReconnect = new DwtButton({parent:tb2});
		btnReconnect.setVisibility(gw.getState() == ZmImGateway.STATE.BOOTED_BY_OTHER_LOGIN);
		btnReconnect.setText(ZmMsg.imReconnect);

		btnReconnect.addSelectionListener(new AjxListener(this, function(gw, ev) {
			gw.reconnect();
		}, [ gw ]));

		var cls = "ZmChatGwIcon Img" + AjxStringUtil.capitalize(gw.type) + "Big";
		var btn = new DwtControl({parent:tb2, className:cls});
		btn._setMouseEventHdlrs();
		btn.condClassName(!gw.isOnline(), "ZmChatGwIcon-offline");
		btn.setToolTipContent("-");
		btn.gateway = gw;

		btn.getToolTipContent = function() {
			var gw = this.gateway;
			var nick = gw.isOnline();
			var tooltip;
			if (nick)
				tooltip = ZmMsg.imGwOnlineTooltip;
			else
				tooltip = ZmMsg.imGwOfflineTooltip;
			return AjxMessageFormat.format(tooltip, [ AjxStringUtil.capitalize(gw.type), nick ]);
		};

		btn.addListener(DwtEvent.ONMOUSEDOWN, new AjxListener(this, function(gw, ev) {
			var imApp = appCtxt.getApp(ZmApp.IM);
			var treeController = imApp.getRosterTreeController();
			treeController._imGatewayLoginListener({ gwType : gw.type });
		}, [ gw ]));

		btn.addListener(DwtEvent.ONMOUSEOVER, new AjxListener(btn, function(ev) {
			this.addClassName("ZmChatGwIcon-hover");
		}));

		btn.addListener(DwtEvent.ONMOUSEOUT, new AjxListener(btn, function(ev) {
			this.delClassName("ZmChatGwIcon-hover");
		}));

		gw.addListener(ZmImGateway.EVENT_SET_STATE,
			       new AjxListener(this, function(gwBtn, btnReconnect, ev) {
				       var gw = ev.gw;
				       gwBtn.condClassName(!gw.isOnline(), "ZmChatGwIcon-offline");
				       btnReconnect.setVisibility(gw.getState() == ZmImGateway.STATE.BOOTED_BY_OTHER_LOGIN);
			// no blinking -- looks ugly.
// 			if (gw.isOnline()) {
// 				var blink = 4;
// 				var timer = setInterval(function() {
// 					this.setVisibility(!(--blink & 1));
// 					if (blink == 0)
// 						clearInterval(timer);
// 				}, 100);
// 			}
			       }, [ btn, btnReconnect ]));

	}
	// var size = toolbar.getSize();
	// cont.marginLeft = -size.x + "px";
	// cont.marginTop = -size.y + "px";
};

/**
* change listener for the chat list
*/
ZmChatMultiWindowView.prototype._changeListener = function(ev) {
	if (ev.event == ZmEvent.E_CREATE) {
		var chat = ev._details.items[0];
        	var cw = this.__createChatWidget(chat);
		this._addChatWidget(cw, chat);
		cw.select();
	} else if (ev.event == ZmEvent.E_DELETE) {
		var chat = ev._details.items[0];
		var cw = this._getChatWidgetForChat(chat);
		if (cw) {
			this._removeChatWidget(cw);
			cw.dispose();
		}
	}
};

ZmChatMultiWindowView.prototype.selectChat = function(chat, text) {
	var cw = this._getChatWidgetForChat(chat);
	if (cw)
		cw.select();
	if (text)
		cw.setEditorContent(AjxStringUtil.trim(text));
};

ZmChatMultiWindowView.prototype._rosterItemChangeListener = function(chat, item, fields) {
	var cw = this._getChatWidgetForChat(chat);
	if (cw)
		cw._rosterItemChangeListener(item, fields);
};

ZmChatMultiWindowView.prototype._getChatWidgetForChat = function(chat) {
	return this._chatIdToChatWidget[chat.id];
};

ZmChatMultiWindowView.KEY_CHAT = "zcmwv_chat";

ZmChatMultiWindowView.prototype._initialWindowPlacement = function() {
	if (this._nextInitX || this._nextInitY) {
		var pos = { x: this._nextInitX,
			    y: this._nextInitY };
		delete this._nextInitX;
		delete this._nextInitY;
		return pos;
	}

	// FIXME: for now it seems better to leave DwtResizableWindow
	// handle this--otherwise all windows get positioned at (20, 20)
	return null;

// 	var windows = {};
// 	for (var id in this._chatWindows) {
// 		var cw = this._chatWindows[id];
// 		if (cw === chatWindow)
// 			continue;
// 		var loc = cw.getLocation();
// 		windows[loc.x+","+loc.y] = true;
// 	}

// 	var size = this.getSize();

// 	var initX = 20, initY = 20;
// 	var incr = 20;
// 	var x = initX, y = initY;
// 	while(windows[x+","+y]) {
// 		x += incr;
// 		y += incr;
//         	if ((x > (size.x - 50)) || (y > (size.y - 50))) {
//         		initX += incr;
//         		x = initX;
//         		y = initY;
//     		}
// 	}
// 	// chatWindow.setBounds(x, y, Dwt.DEAFULT, Dwt.DEFAULT);
// 	return { x: x, y: y };
};

ZmChatMultiWindowView.prototype._addChatWidget =
function(chatWidget, chat) {
    	this._chatIdToChatWidget[chat.id] = chatWidget;
};

ZmChatMultiWindowView.prototype._removeChatWidget =
function(chatWidget) {
	delete this._chatIdToChatWidget[chatWidget.chat.id];
};

ZmChatMultiWindowView.prototype.endChat =
function(chat) {
	this._controller.endChat(chat);
};

ZmChatMultiWindowView.prototype._dropListener = function(dropTgt, ev) {
	if (!ev.srcData)
		return false;
	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		ev.doIt = dropTgt.isValidTarget(ev.srcData);
	} else if (ev.action == DwtDropEvent.DRAG_DROP) {
        	var srcData = ev.srcData;
		var mouseEv = DwtShell.mouseEvent;
            	mouseEv.setFromDhtmlEvent(ev.uiEvent);
		var pos = this.getLocation();
		var newPos = { x: mouseEv.docX - pos.x,
			       y: mouseEv.docY - pos.y };
		this._nextInitX = newPos.x
            	this._nextInitY = newPos.y;
		if (srcData instanceof ZmRosterItem) {
			this._controller.chatWithRosterItem(srcData);
		}
		// FIXME: not implemented
		// 		if (srcData instanceof ZmRosterTreeGroup) {
		// 			this._controller.chatWithRosterItems(srcData.getRosterItems(), srcData.getName()+" "+ZmMsg.imGroupChat);
		// 		}
	}
};

ZmChatMultiWindowView.prototype.chatInNewTab = function(item, tabs) {
	this.__useTab = tabs;
	this._controller.chatWithRosterItem(item);
};

ZmChatMultiWindowView.prototype.chatWithRosterItem = function(item) {
	this._controller.chatWithRosterItem(item);
};
