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

ZmBuddyListWindow = function(params) {
	DwtResizableWindow.call(this, params);
};

ZmBuddyListWindow.prototype = new DwtResizableWindow;
ZmBuddyListWindow.prototype.constructor = ZmBuddyListWindow;

ZmBuddyListWindow.prototype.toString =
function() {
	return "ZmBuddyListWindow";
}

ZmBuddyListWindow.create =
function() {
	var win = ZmBuddyListWindow.instance;
	if (!win) {
		var wm = ZmChatMultiWindowView.getInstance().getShellWindowManager();
		ZmBuddyListWindow.instance = win = new ZmBuddyListWindow(wm);
		var cont = new DwtComposite(win);

		var toolbar = new DwtToolBar({parent:cont, handleMouse: false});

		var lab = new DwtLabel({parent:toolbar, style:DwtLabel.IMAGE_LEFT | DwtLabel.ALIGN_LEFT,
			className:"ZmChatWindowLabel"});
		lab.setImage("ImGroup");
		lab.setText(ZmMsg.buddyList);

		toolbar.addFiller();

		var close = new DwtToolBarButton({parent:toolbar});
		close.setImage("Close");
		close.addSelectionListener(new AjxListener(null, function() {
			win.popdown();
		}));

		win.enableMoveWithElement(toolbar);

		var list = new ZmImOverview(cont, { posStyle   : Dwt.STATIC_STYLE,
			isFloating : true });

		var toolbar2 = new DwtToolBar({parent:cont});

		var newBuddy = new DwtToolBarButton({parent:toolbar2});
		newBuddy.setImage("ImBuddy");
		newBuddy.setToolTipContent(ZmMsg.newRosterItem);
		newBuddy.addSelectionListener(ZmImApp.INSTANCE.getRosterTreeController()._listeners[ZmOperation.NEW_ROSTER_ITEM]);

		toolbar2.addFiller();

		cont.addControlListener(new AjxListener(null, function(ev) {
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
	}
	return win;
};

