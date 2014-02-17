skin.override("ZmNewWindow.prototype._createView",function() {

	var cmd = window.newWindowCommand;
	var params = window.newWindowParams;

	var rootTg = appCtxt.getRootTabGroup();
	var startupFocusItem;

	//I null composeCtlrSessionId so it's not kept from irrelevant sessions from parent window.
	// (since I set it in every compose session, in ZmMailApp.prototype.compose).
	// This is important in case of cmd == "msgViewDetach"
	appCtxt.composeCtlrSessionId = null;  
	// depending on the command, do the right thing
	if (cmd == "compose" || cmd == "composeDetach") {
		var cc = AjxDispatcher.run("GetComposeController");	// get a new compose ctlr
		appCtxt.composeCtlrSessionId = cc.getSessionId();
		if (params.action == ZmOperation.REPLY_ALL) {
			params.msg = this._deepCopyMsg(params.msg);
		}
		if (cmd == "compose") {
			cc._setView(params);
		} else {
			AjxDispatcher.require(["MailCore", "CalendarCore"]);
			var op = params.action || ZmOperation.NEW_MESSAGE;
			if (params.msg && params.msg._mode) {
				switch (params.msg._mode) {
					case ZmAppt.MODE_DELETE:
					case ZmAppt.MODE_DELETE_INSTANCE:
					case ZmAppt.MODE_DELETE_SERIES: {
						op = ZmOperation.REPLY_CANCEL;
						break;
					}
				}
			}
			params.action = op;
			cc._setView(params);
			cc._composeView.setDetach(params);

			// bug fix #5887 - get the parent window's compose controller based on its session ID
			var parentCC = window.parentController.getApp(ZmApp.MAIL).getComposeController(params.sessionId);
			if (parentCC && parentCC._composeView) {
				// once everything is set in child window, pop parent window's compose view
				var focused = document.activeElement;
				parentCC._composeView.reset(true);
				parentCC._app.popView(true);
				focused.focus();
			}
		}
		cc._setComposeTabGroup();
		rootTg.addMember(cc.getTabGroup());
		startupFocusItem = cc._getDefaultFocusItem();

		target = "compose-window";
	} else if (cmd == "msgViewDetach") {
		//bug 52366 - not sure why only REPLY_ALL causes the problem (and not REPLY for example), but in this case the window is opened first for view. But
		//the user might of course click "reply to all" later in the window so I deep copy here in any case.
		var msg = this._deepCopyMsg(params.msg);
		msg.isRfc822 = params.isRfc822; //simpler

		var msgController = AjxDispatcher.run("GetMsgController");
		appCtxt.msgCtlrSessionId = msgController.getSessionId();
		msgController.show(msg, params.parentController);
		rootTg.addMember(msgController.getTabGroup());
		startupFocusItem = msgController.getCurrentView();

		target = "view-window";
	} else if (cmd == "shortcuts") {
		var panel = appCtxt.getShortcutsPanel();
		panel.popup(params.cols);
	}
	
	if (this._appViewMgr) {
		this._appViewMgr.loadingView.setVisible(false);
	}

	var kbMgr = appCtxt.getKeyboardMgr();
	kbMgr.setTabGroup(rootTg);
	kbMgr.grabFocus(startupFocusItem);
});

skin.override("ZmNewWindow.prototype.handleKeyAction",function(actionCode, ev) {

	if (actionCode == ZmKeyMap.SHORTCUTS) {
		var curMap = this.getKeyMapName();
		var km = appCtxt.getAppController().getKeyMapMgr();
		var colList = [];

		var maps = km.getAncestors(curMap);
		maps.unshift(curMap);
		colList.push({type: "APP", maps: maps});

		if (maps && maps.length > 1 && maps[maps.length - 1] == ZmKeyMap.MAP_GLOBAL) {
			maps.pop();
			colList.push({type: "APP", maps: [ZmKeyMap.MAP_GLOBAL]});
		}

		maps = [];
		var ctlr = appCtxt.getCurrentController();
		var testMaps = ["list", "editor", "tabView"];
		for (var i = 0; i < testMaps.length; i++) {
			if (ctlr && ctlr.mapSupported(testMaps[i])) {
				maps.push(testMaps[i]);
			}
		}
		maps.push("button", "menu", "tree", "dialog", "toolbarHorizontal");
		colList.push({type: "SYS", maps: maps});

		var newWinObj = parentAppCtxt.getNewWindow(false, 820, 650);
		newWinObj.command = "shortcuts";
		newWinObj.params = {cols:colList};

		return true;
	}

	return arguments.callee.func.apply(this, arguments);
});
